function startViewer(){
  const DEV=[
    {id:'duo',n:'Duo unfolded',s:'951 x 648',w:951,h:648,q:'',c:'The main screen. Scene size unchanged; the empty band under it now carries the words.'},
    {id:'desk',n:'Desktop',s:'1440 x 900',w:1440,h:900,q:'',c:'Same layout, wider right strip, Details on by default. Click works like a tap; the keyboard works too.'},
    {id:'duofold-up',n:'Duo folded, upright',s:'466 x 657',w:466,h:657,q:'',c:'Moves in two columns under the thumbs. Tap the sentence strip to open the full description when it is cut short.'},
    {id:'duofold-side',n:'Duo folded, sideways',s:'678 x 445',w:678,h:445,q:'',c:'The unfolded layout, smaller.'},
    {id:'iphone-up',n:'iPhone, upright',s:'393 x 852',w:393,h:852,q:'&safe=54,0,34,0',c:'The empty bands at the top and bottom are the iPhone’s own safe areas (clock, home bar).'},
    {id:'iphone-side',n:'iPhone, sideways',s:'852 x 393',w:852,h:393,q:'&safe=0,50,21,50',c:'No room under the scene: the sentence is a caption on the sky. The side margins are the iPhone’s safe areas.'}
  ];
  let cur=0,mode='new';
  const $=id=>document.getElementById(id),fr=$('fr'),td=$('today'),dev=$('dev');
  $('steps').src=IMG['today-steps'];
  function fit(){ const D=DEV[cur],aw=$('stage').clientWidth-8,ah=Math.max(380,innerHeight*.8),k=Math.min(1,aw/D.w,ah/D.h);
    dev.style.width=D.w+'px'; dev.style.height=D.h+'px'; dev.style.transform='scale('+k+')'; $('stage').style.height=(D.h*k+16)+'px'; }
  function draw(){
    const D=DEV[cur];
    $('tabs').innerHTML=DEV.map((d,i)=>'<button class="'+(i===cur?'on':'')+'" data-d="'+i+'">'+d.n+'<small>'+d.s+'</small></button>').join('');
    $('modes').innerHTML='<button class="'+(mode==='new'?'on':'')+'" data-m="new">Proposed (tap it)</button><button class="'+(mode==='old'?'on':'')+'" data-m="old">Today (picture)</button>';
    if(mode==='new'){ td.hidden=true; fr.hidden=false; const u='?frame=1'+D.q; if(fr.dataset.u!==u+D.id){ fr.dataset.u=u+D.id; fr.src=location.pathname+u; } }
    else { fr.hidden=true; td.hidden=false; td.src=IMG['today-'+D.id]; }
    $('cap').textContent=mode==='new'?D.c:'The game today at this size, with the Skills list open.';
    fit();
  }
  document.addEventListener('click',e=>{ const b=e.target.closest('[data-d],[data-m]'); if(!b) return; if(b.dataset.d!=null) cur=+b.dataset.d; else mode=b.dataset.m; draw(); });
  addEventListener('resize',fit); draw();
}
(function(){
  const q=new URLSearchParams(location.search);
  const small=innerWidth<1000||innerHeight<700;
  const app=q.has('frame')||(!q.has('notes')&&small);
  if(app){ document.body.classList.add('app'); document.getElementById('appwrap').hidden=false; startApp(); }
  else { document.getElementById('viewer').hidden=false; startViewer(); }
})();
