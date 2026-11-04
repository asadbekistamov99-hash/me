// Run: node checks/experience.cjs (requires an available Playwright + Chromium).
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://127.0.0.1:8000/**',route=>{const pathname=new URL(route.request().url()).pathname;return route.fulfill({path:path.join(__dirname,'..',pathname==='/'?'index.html':pathname)});});
 await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('.project-card').count(),4);
 assert.equal(await page.locator('.interest-art').count(),8);
 assert.equal(new Set(await page.locator('.interest-art').evaluateAll(es=>es.map(e=>e.style.backgroundPosition))).size,8);
 const iconImage=await page.locator('.interest-art').first().evaluate(e=>getComputedStyle(e).backgroundImage);
 assert.match(iconImage,/interest-icons\.png/);
 await page.evaluate(src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>image.naturalWidth>0?resolve():reject(Error('Empty icon sheet'));image.onerror=()=>reject(Error('Icon sheet failed to load'));image.src=src.slice(5,-2);}),iconImage);

 await page.locator('#projects').scrollIntoViewIfNeeded();
 await page.waitForTimeout(900);
 for(const[id,color]of [['p1','rgb(255, 255, 255)'],['p2','rgb(1, 16, 39)'],['p4','rgb(255, 255, 255)']]){
  assert.equal(await page.locator(`[data-id="${id}"] .proj-media`).evaluate(e=>getComputedStyle(e).backgroundColor),color);
 }
 const card=page.locator('.project-card[data-id="p2"]');await card.focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#modal').evaluate(e=>e.classList.contains('open')),true);
 assert.equal(await page.locator('#modalClose').evaluate(e=>document.activeElement===e),true);
 await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#mVisit').evaluate(e=>document.activeElement===e),true);
 await page.keyboard.press('Escape');assert.equal(await card.evaluate(e=>document.activeElement===e),true);
 for(const type of ['app','web']){await page.locator(`.filter-btn[data-f="${type}"]`).click();assert.equal(await page.locator('.project-card').count(),2);}
 assert.equal(await page.locator('[data-id="p4"] [data-external]').getAttribute('href'),'https://bsmianatomy.uz');
 assert.match(await page.locator('[data-id="p4"] [data-external]').textContent(),/Saytni ochish/);
 await page.locator('.filter-btn[data-f=""]').click();
 await card.hover();await page.mouse.move((await card.boundingBox()).x+50,(await card.boundingBox()).y+80);await page.waitForTimeout(100);
 assert.notEqual(await card.evaluate(e=>e.style.getPropertyValue('--rx')),'');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 assert.equal(await card.evaluate(e=>getComputedStyle(e).transform),'none');
 assert.equal(await page.locator('.ring').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('#themeToggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.locator('#themeToggle').click();
 for(const width of [360,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(150);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}: `+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,Math.round(e.getBoundingClientRect().right)]).slice(0,12))));
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#menuToggle').click();assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#mobileMenu').evaluate(e=>e.classList.contains('open')),false);
 await page.screenshot({path:'/tmp/experience-mobile.png'});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/experience-desktop.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: cards, logo backgrounds, filters, links, pointer effect, keyboard modal and focus, themes, reduced motion, mobile menu, 360–1440px layout; no JS errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
