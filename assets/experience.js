/* Native browser effects: no animation libraries or continuous render loop. */
(function(){
  var avatar=document.getElementById('avatarImg');
  function avatarFallback(){avatar.parentElement.classList.add('image-unavailable');}
  avatar.addEventListener('error',avatarFallback);
  if(avatar.complete&&!avatar.naturalWidth)avatarFallback();
  var motion=matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  var frame=0,activeCard=null;
  document.querySelectorAll('a[data-scroll]').forEach(function(link){link.href=link.dataset.scroll;});
  document.querySelectorAll('.proj-grid,.timeline,.cards-grid').forEach(function(grid){grid.classList.add('reveal');io.observe(grid);});
  document.addEventListener('pointermove',function(event){
    if(motion.matches||!finePointer.matches)return;
    var card=event.target.closest('.project-card,.skill-group');
    if(!card)return;
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(function(){
      if(activeCard&&activeCard!==card)resetCard(activeCard);
      activeCard=card;
      var rect=card.getBoundingClientRect();
      var x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
      card.style.setProperty('--px',x*100+'%');card.style.setProperty('--py',y*100+'%');
      card.style.setProperty('--rx',(0.5-y)*4+'deg');card.style.setProperty('--ry',(x-0.5)*4+'deg');
    });
  },{passive:true});
  function resetCard(card){['--rx','--ry','--px','--py'].forEach(function(key){card.style.removeProperty(key);});}
  function clearCard(){cancelAnimationFrame(frame);if(activeCard)resetCard(activeCard);activeCard=null;}
  document.addEventListener('pointerout',function(e){if(activeCard&&(!e.relatedTarget||!activeCard.contains(e.relatedTarget)))clearCard();},{passive:true});
  motion.addEventListener('change',clearCard);
  window.addEventListener('resize',clearCard,{passive:true});
  document.addEventListener('keydown',function(e){
    var modal=document.getElementById('modal');
    if(modal.classList.contains('open')){
      if(e.key==='Escape'){e.preventDefault();closeModal();return;}
      if(e.key==='Tab'){
        var nodes=Array.from(modal.querySelectorAll('button,a[href]')).filter(function(el){return el.getClientRects().length;});
        var first=nodes[0],last=nodes[nodes.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
      return;
    }
    if(e.key==='Escape'){document.getElementById('mobileMenu').classList.remove('open');document.getElementById('menuToggle').setAttribute('aria-expanded','false');}
    if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('project-card')){e.preventDefault();openModal(e.target.dataset.id);}
  });
  var menu=document.getElementById('mobileMenu'),toggle=document.getElementById('menuToggle');
  toggle.setAttribute('aria-controls','mobileMenu');toggle.setAttribute('aria-expanded','false');
  new MutationObserver(function(){toggle.setAttribute('aria-expanded',String(menu.classList.contains('open')));}).observe(menu,{attributes:true,attributeFilter:['class']});
})();
