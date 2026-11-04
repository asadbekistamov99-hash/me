/* Replace decorative emoji text, including cached content and theme changes. */
(function(){
  var icons={};
  function register(symbols,sheet,index,columns,rows){
    symbols.forEach(function(symbol){
      var icon={sheet:sheet,index:index,columns:columns,rows:rows};
      icons[symbol]=icon;icons[symbol.replace(/\uFE0F/g,'')]=icon;
    });
  }
  [
    ['🩺','🧑‍⚕️'],['🤖','🧠'],['💻','👨‍💻','🧑‍💻','🐍','🟨','🟠','🐙','🖥️'],['⚽'],['♟️'],['🚀','🚂'],['🎬','🎞️'],['🎨']
  ].forEach(function(symbols,i){register(symbols,'interest',i,4,2);});
  [
    ['🌙'],['☀','☀️'],['💬'],['⚡'],['📚'],
    ['📍'],['🎓'],['🎯'],['🛠️'],['🔮'],
    ['📋'],['🗄️','🐘'],['🌐','🔗'],['📱','📲'],['🗃️'],
    ['🍃','🟢'],['🔌'],['✈️'],['📸'],['📧']
  ].forEach(function(symbols,i){register(symbols,'ui',i,5,4);});
  var pattern=new RegExp(Object.keys(icons).sort(function(a,b){return b.length-a.length;}).map(function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|'),'gu');
  function replace(root){
    if(root.nodeType!==Node.TEXT_NODE&&root.nodeType!==Node.ELEMENT_NODE)return;
    var nodes=[];
    if(root.nodeType===Node.TEXT_NODE)nodes.push(root);
    else{
      if(root.closest('script,style,textarea,code,.icon-3d'))return;
      var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      while(walker.nextNode())nodes.push(walker.currentNode);
    }
    nodes.forEach(function(node){
      if(!node.parentElement||node.parentElement.closest('script,style,textarea,code,.icon-3d'))return;
      var matches=Array.from(node.data.matchAll(pattern));if(!matches.length)return;
      var fragment=document.createDocumentFragment(),offset=0;
      matches.forEach(function(match){
        fragment.append(document.createTextNode(node.data.slice(offset,match.index)));
        var data=icons[match[0]],icon=document.createElement('span');
        icon.className='icon-3d icon-'+data.sheet;icon.setAttribute('aria-hidden','true');
        icon.style.backgroundPosition=(data.index%data.columns)*100/(data.columns-1)+'% '+Math.floor(data.index/data.columns)*100/(data.rows-1)+'%';
        fragment.append(icon);offset=match.index+match[0].length;
      });
      fragment.append(document.createTextNode(node.data.slice(offset)));node.replaceWith(fragment);
    });
  }
  var observer=new MutationObserver(function(records){
    observer.disconnect();
    records.forEach(function(record){
      if(record.type==='characterData')replace(record.target);
      else record.addedNodes.forEach(replace);
    });
    watch();
  });
  function watch(){observer.observe(document.body,{childList:true,subtree:true,characterData:true});}
  replace(document.body);watch();
})();
