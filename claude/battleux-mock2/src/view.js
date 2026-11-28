function startViewer(){
  const DEV=[
    {id:'duo',n:'Duo unfolded, sideways',s:'951 x 648',w:951,h:648,q:'',c:'The main screen. The scene keeps the whole screen; the moves open beside whoever is up.'},
    {id:'desk',n:'Desktop',s:'1440 x 900',w:1440,h:900,q:'',c:'The same layout, bigger type. Click works like a tap; the arrow keys and Enter work too.'},
    {id:'fold-up',n:'Duo folded, upright',s:'466 x 657',w:466,h:657,q:'',c:'Upright: the one exception to the overlay. The same list docks under the scene.'},
    {id:'fold-side',n:'Duo folded, sideways',s:'678 x 445',w:678,h:445,q:'',c:'Short screen: the list scrolls, the highlighted move stays in view.'},
    {id:'ip-up',n:'iPhone, upright',s:'393 x 852',w:393,h:852,q:'&safe=54,0,34,0',c:'The bands at the top and bottom are the iPhone’s own (clock, home bar).'},
    {id:'ip-side',n:'iPhone, sideways',s:'852 x 393',w:852,h:393,q:'&safe=0,50,21,50',c:'Short screen with the iPhone’s side margins. The list scrolls.'}];
  let cur=0,st='start',det=0,rose=0,bg='pond';
  const $=id=>document.getElementById(id),fr=$('fr'),dev=$('dev');
  const BG=[['pond','Pond'],['night','Night'],['indoor','Indoor, dark'],['bright','Indoor, bright']];
  function fit(){const D=DEV[cur],aw=$('stage').clientWidth-16,ah=Math.max(380,innerHeight*.78),k=Math.min(1,aw/D.w,ah/D.h);
    dev.style.width=D.w+'px';dev.style.height=D.h+'px';dev.style.transform='scale('+k+')';$('stage').style.height=(D.h*k+16)+'px';}
  function draw(){
    const D=DEV[cur];
    $('tabs').innerHTML=DEV.map((d,i)=>`<button class="${i===cur?'on':''}" data-d="${i}">${d.n}<small>${d.s}</small></button>`).join('');
    $('states').innerHTML=window.__STORY.STATES.map(s=>`<button class="${s.id===st?'on':''}" data-s="${s.id}">${s.n}</button>`).join('');
    const sw=(k,v,l,on)=>`<button class="${on?'on':''}" data-w="${k}:${v}">${l}</button>`;
    $('sws').innerHTML=`<span class="lab">Details</span>${sw('det',0,'Off',!det)}${sw('det',1,'On',det)}<span class="lab">Rose Mode</span>${sw('rose',0,'Off',!rose)}${sw('rose',1,'On',rose)}<span class="lab">Background</span>${BG.map(b=>sw('bg',b[0],b[1],bg===b[0])).join('')}`;
    $('sdesc').textContent=(window.__STORY.STATES.find(s=>s.id===st)||{}).d||'';
    const u=`?frame=1&bare=1&st=${st}&det=${det}&rose=${rose}&bg=${bg}${D.q}`;if(fr.dataset.u!==u+D.id){fr.dataset.u=u+D.id;fr.src=location.pathname+u;}
    $('cap').textContent=D.c;fit();}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-d],[data-s],[data-w]');if(!b)return;
    if(b.dataset.d!=null)cur=+b.dataset.d;else if(b.dataset.s)st=b.dataset.s;else{const [k,v]=b.dataset.w.split(':');if(k==='det')det=+v;if(k==='rose')rose=+v;if(k==='bg')bg=v;}draw();});
  addEventListener('resize',fit);draw();
}
(function(){
  const q=new URLSearchParams(location.search),small=innerWidth<1000||innerHeight<700;
  const app=q.has('frame')||(!q.has('notes')&&small);
  if(app){document.body.classList.add('app');document.getElementById('appwrap').hidden=false;startApp();}
  else{document.getElementById('viewer').hidden=false;startViewer();}
})();
