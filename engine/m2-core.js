'use strict';
// engine/m2-core.js: the new main menu, "Golden Hour" (card menu1; plan claude/menuux-plan.md; drawings claude/menuux-mock/).
// It lives BESIDE the old menu (engine/menu.js, which stays the default until card c-menu4): its own root element #m2, its own
// styles (m2.css, every rule under #m2), its own keys. ADMIN > MENU: OLD or NEW chooses (saved on the device, default OLD) and
// index.html?menu=new forces NEW (?menu=old forces OLD).
// How it plugs in (nothing in menu.js is edited): openMenu, closeMenu, renderMenu, menuKey, menuPad and menuBack are wrapped here.
// While the new menu is open `menuOpen` is true, so every system that pauses for the menu (walking, dialogue, timers) still does.
// Until their own cards ship: the Vibes tab opens today's Vibes screen over the book (b3vOpen), and Gear, Bag and System open
// today's Gear, Items and Load screens in place of the book; Back there returns to the book.
// Layout: wider than tall = tabs down the left edge and a two-page spread (the gutter at the middle of the screen on the unfolded
// Duo and on a desktop, where the fold is); taller than wide = one page and the tabs along the bottom edge.
// Files: engine/m2-core.js (this), engine/m2-family.js (the Family page), m2.css, fonts/bricolage.woff2 and figtree.woff2,
// art/menu/<id>.webp (tools/sprite-bake/bake_menu_heroes.py).
const M2={open:false,tab:'family',legacy:false,sel:0,change:null,keys:false,mode:'',dims:null,built:false,root:null,z:1,say:'',sig:''};
const M2_KEY='aot-menu';
const M2_TABS=[{id:'family',label:'Family'},{id:'vibes',label:'Vibes'},{id:'gear',label:'Gear'},{id:'bag',label:'Bag'},{id:'system',label:'System'}];
// The picture for each tab (the same line icons as the drawings), always shown with its word.
const M2_ICON={
 family:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
 vibes:'<path d="M11 3l2.1 5.9L19 11l-5.9 2.1L11 19l-2.1-5.9L3 11l5.9-2.1z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
 gear:'<path d="M8 3L3 6l2 4 2-1v11h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
 bag:'<path d="M6 10a6 6 0 0 1 12 0v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M9 5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/><path d="M9 21v-4h6v4"/>',
 system:'<path d="M4 6h8"/><path d="M18 6h2"/><circle cx="15" cy="6" r="2.5"/><path d="M4 12h2"/><path d="M12 12h8"/><circle cx="9" cy="12" r="2.5"/><path d="M4 18h8"/><path d="M18 18h2"/><circle cx="15" cy="18" r="2.5"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
 swap:'<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 12l4 4-4 4"/><path d="M21 16H7"/>'};
const M2_STAR='M12 3l2.700 5.800 6.300.800-4.600 4.400 1.200 6.300L12 17.300 6.400 20.300l1.200-6.300L3 9.600l6.300-.800z';
function m2Icon(name,size,sw) {
  return '<svg aria-hidden="true" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="'+(sw||1.9)+'" stroke-linecap="round" stroke-linejoin="round">'+M2_ICON[name]+'</svg>';
}
function m2Stars(rank,of,size) {
  let s='';
  for(let i=0;i<of;i++) { const on=i<rank;
    s+='<svg aria-hidden="true" viewBox="0 0 24 24" width="'+size+'" height="'+size+'"><path d="'+M2_STAR+'" fill="'+(on?'#F5A623':'none')+'" stroke="'+(on?'#A86200':'rgba(43,26,51,.38)')+'" stroke-width="1.6" stroke-linejoin="round"/></svg>'; }
  return '<span class="m2-stars" role="img" aria-label="Rank '+rank+' of '+of+'">'+s+'</span>';
}
const m2Esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ---------- The switch ----------
function m2On() {
  try {
    const q=location.search;
    if(/[?&]menu=new(&|$)/.test(q)) return true;
    if(/[?&]menu=old(&|$)/.test(q)) return false;
    return localStorage.getItem(M2_KEY)==='new';
  } catch(e) { return false; }
}
// ADMIN > MENU (engine/splash.js): which menu this device opens.
function m2AdminItem() {
  const on=m2On(),forced=/[?&]menu=(new|old)(&|$)/.test(location.search);
  return {name:'MENU: '+(on?'NEW':'OLD'),sub:forced?'Set by the address of this page.':(on?'The new paper menu. Tap to go back to the old one.':'The old menu. Tap to try the new paper menu.'),
    act:()=>{ try { localStorage.setItem(M2_KEY,on?'old':'new'); } catch(e) {} const i=splash.sel; splashSetMode('admin'); splash.sel=i; if(typeof splashMark==='function') splashMark(); }};
}

// ---------- The root element, made once ----------
function m2Root() {
  if(M2.root) return M2.root;
  const r=document.createElement('div'); r.id='m2'; r.hidden=true; r.setAttribute('role','dialog'); r.setAttribute('aria-modal','true'); r.setAttribute('aria-label','Menu'); r.tabIndex=-1;
  r.innerHTML='<canvas class="m2-still" aria-hidden="true"></canvas><div class="m2-wash"></div><div class="m2-z"><div class="m2-grid"></div></div>';
  document.getElementById('stage').appendChild(r);   // beside #menu, so it turns with the stage
  r.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') M2.keys=false; });
  r.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest('[data-m2]'); if(!b||b.disabled) return;
    m2Act(b.dataset.m2,b.dataset.a||'',b);
  });
  M2.root=r;
  if('ResizeObserver' in window) new ResizeObserver(()=>{ if(M2.open&&!M2.legacy) m2Fit(true); }).observe(document.getElementById('stage'));
  return r;
}
// ONE still of the game picture, taken when the menu opens and softened once (nothing is blurred live): stepped down to a
// twelfth of its size, which the browser then draws back up smooth. The wash over it is CSS.
function m2Still() {
  const cv=M2.root.querySelector('.m2-still'),src=document.getElementById('world'),g=cv.getContext('2d');
  try {
    let w=src.width,h=src.height,cur=src;
    const tw=Math.max(24,Math.round(w/12)),th=Math.max(24,Math.round(h/12));
    while(w>tw*1.5) { const c=document.createElement('canvas'); w=Math.max(tw,Math.round(w/2)); h=Math.max(th,Math.round(h/2)); c.width=w; c.height=h;
      const cg=c.getContext('2d'); cg.imageSmoothingEnabled=true; cg.imageSmoothingQuality='high'; cg.drawImage(cur,0,0,w,h); cur=c; }
    cv.width=w; cv.height=h; g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(cur,0,0,w,h);
  } catch(e) { cv.width=2; cv.height=2; g.fillStyle='#2A1A3E'; g.fillRect(0,0,2,2); }
}
function m2Fonts() {
  if(M2.fontsAsked||!document.fonts||!document.fonts.load) return; M2.fontsAsked=true;
  Promise.all([document.fonts.load("800 20px 'Bricolage Grotesque'"),document.fonts.load("700 14px 'Bricolage Grotesque'"),document.fonts.load("400 15px 'Figtree'"),document.fonts.load("700 15px 'Figtree'")])
    .then(()=>{ if(M2.open&&!M2.legacy) m2Fit(true); }).catch(()=>{});
}

// ---------- Size and layout ----------
// Decides wide or tall from the stage's own box (which is turned when the phone is held the other way), whether the screen is a
// small wide one (compact), and a scale for big screens: the layout is made at about 951 x 648 and scaled up to fill.
function m2Dims() {
  const st=document.getElementById('stage'),W=st.offsetWidth||innerWidth,H=st.offsetHeight||innerHeight;
  const wide=W>H,compact=wide&&H<520;
  let z=1;
  if(wide&&!compact) z=(W>=1000&&H>=560)?Math.max(1,Math.min(W/951,H/648)):1;
  else if(!wide&&W>=560) z=Math.max(1,Math.min(W/466,H/657));
  return {W,H,wide,compact,z,lw:Math.round(W/z),lh:Math.round(H/z)};
}
function m2Fit(force) {
  const r=M2.root,d=m2Dims(),mode=(d.wide?(d.compact?'wide compact':'wide'):'tall');
  const zz=r.querySelector('.m2-z'),grid=r.querySelector('.m2-grid');
  zz.style.width=d.lw+'px'; zz.style.height=d.lh+'px'; zz.style.transform=d.z>1.001?'scale('+d.z.toFixed(4)+')':'';
  const key=mode+'|'+d.lw+'x'+d.lh;
  r.classList.toggle('m2-wide',d.wide); r.classList.toggle('m2-tall',!d.wide); r.classList.toggle('m2-compact',d.compact); r.classList.toggle('m2-short',!d.wide&&d.lh<760);
  M2.dims=d; M2.z=d.z;
  if(M2.mode!==mode||force===true&&M2.sig!==key) { M2.mode=mode; M2.sig=key; m2Render(); return; }
  m2Layout();
}

// ---------- Drawing ----------
function m2Place() { return (currentMap&&currentMap.name)||'Long Island'; }
function m2Region() { return (typeof regionOf==='function'&&regionOf(currentMap)==='la')?'Los Angeles':'Long Island'; }
function m2NextLine() {
  try { if(typeof currentObjective!=='function') return ''; const o=currentObjective(); return o.complete?'Chapter complete':questShort(o.text); } catch(e) { return ''; }
}
function m2Top(d) {
  const nxt=m2NextLine();
  const next=nxt?'<div class="m2-next">'+m2Icon('flag',d.compact?15:17)+'<span><em>Next</em>&nbsp; '+m2Esc(nxt)+'</span></div>':'<div class="m2-next"></div>';
  return '<header class="m2-top"><div class="m2-place"><b>'+m2Esc(m2Place())+'</b><span>'+m2Region()+'</span></div>'+next+
    '<div class="m2-meters"><span class="m2-coin" role="img" aria-label="'+coins+' coins"><i aria-hidden="true"></i><b>'+coins+'</b><small>coins</small></span>'+
    '<span class="m2-time" role="img" aria-label="Play time">'+m2Icon('clock',d.compact?14:16)+'<b>'+fmtTime(playTime)+'</b></span></div>'+
    '<button type="button" class="m2-x" data-m2="close" data-k="close" aria-label="Back to the game">'+m2Icon('x',20)+'</button></header>';
}
function m2Tabs() {
  const fresh=ALL_MEMBERS().some(m=>m.m2new);
  return '<nav class="m2-tabs" role="tablist" aria-label="Menu">'+M2_TABS.map(t=>
    '<button type="button" role="tab" class="m2-tab" data-m2="tab" data-a="'+t.id+'" data-k="tab-'+t.id+'" aria-selected="'+(t.id===M2.tab)+'">'+m2Icon(t.id,M2.dims.wide&&!M2.dims.compact?24:20)+'<span>'+t.label+'</span>'+
    (t.id==='vibes'&&fresh&&M2.tab!=='vibes'?'<i class="m2-dot" role="img" aria-label="Something new"></i>':'')+'</button>').join('')+'</nav>';
}
function m2Soon(label) {
  return '<div class="m2-soon"><b>'+label+'</b><span>This page is being redrawn. Today\'s screen opens for now.</span><button type="button" class="m2-btn on" data-m2="legacy" data-a="'+M2.tab+'" data-k="soon">Open it</button></div>';
}
function m2Render() {
  if(!M2.open||M2.legacy) return;
  const r=M2.root,d=M2.dims||m2Dims(),grid=r.querySelector('.m2-grid');
  M2.dims=d;
  const ae=document.activeElement,keep=M2.focusNext||(M2.keys&&ae&&r.contains(ae)&&ae.dataset?ae.dataset.k:null);
  M2.focusNext=null;
  let body;
  if(M2.tab==='family') body=m2FamilyBody(d);
  else body={l:m2Soon(M2_TABS.find(t=>t.id===M2.tab).label),r:'',single:true};
  if(d.wide) {
    const rail=d.compact?72:96,gap=8,center=document.documentElement.classList.contains('duo')||d.lw>=900;
    const lw=center?Math.round(d.lw/2-rail-gap):Math.round((d.lw-rail-gap-8)/2);
    grid.style.gridTemplateColumns=rail+'px minmax(0,1fr)'; grid.style.gridTemplateRows=(d.compact?44:48)+'px minmax(0,1fr)'; grid.style.columnGap=gap+'px'; grid.style.padding='0 8px 12px 0';
    grid.innerHTML='<div></div>'+m2Top(d)+m2Tabs()+
      '<main class="m2-book" style="grid-template-columns:'+(body.single?'1fr':lw+'px minmax(0,1fr)')+'"><section class="m2-page l" aria-label="Page">'+body.l+'</section>'+(body.single?'':'<section class="m2-page r" aria-label="Page">'+body.r+'</section>')+'</main>';
  } else {
    grid.style.gridTemplateColumns='minmax(0,1fr)'; grid.style.gridTemplateRows='auto minmax(0,1fr) auto'; grid.style.columnGap='0'; grid.style.padding='calc(env(safe-area-inset-top,0px) + 6px) 0 calc(env(safe-area-inset-bottom,0px) + 8px)';
    grid.innerHTML=m2Top(d)+'<main class="m2-book" style="margin:0 8px"><section class="m2-page l" aria-label="Page">'+body.l+'</section></main>'+m2Tabs();
  }
  r.classList.add('m2-in');
  if(M2.tab==='family') m2FamilyAfter();
  m2Layout();
  if(keep) { const f=r.querySelector('[data-k="'+keep+'"]')||r.querySelector('.m2-tab[aria-selected="true"]'); if(f) f.focus({preventScroll:true}); }
}
// Sizes that depend on measured space: the line-up scale.
function m2Layout() { if(M2.open&&!M2.legacy&&M2.tab==='family'&&typeof m2FamilyLayout==='function') m2FamilyLayout(); }

// ---------- Open and close ----------
function m2OpenNew(viaKeys) {
  if(typeof intro!=='undefined'&&intro.active) return;
  if(menuOpen||(typeof shopOpen!=='undefined'&&shopOpen)) return;
  menuOpen=true; sfx.menuOpen(); clearInput();
  menuTab='home'; menuSlot=null; menuItem=null; menuConfirm=null; menuQuit=false; menuChar=0;
  Object.assign(M2,{open:true,legacy:false,tab:'family',sel:0,change:null,keys:!!viaKeys,say:'',mode:'',sig:''});
  const r=m2Root(); m2Still(); r.classList.remove('m2-in'); r.hidden=false;
  m2Fonts();
  M2.focusNext=M2.keys?'tab-family':null;
  m2Fit(true);
  if(!M2.keys) r.focus({preventScroll:true});
}
function m2CloseNew() {
  if(!M2.open) return;
  M2.open=false; M2.legacy=false; M2.change=null;
  const r=M2.root; if(r) { r.hidden=true; r.classList.remove('m2-in'); }
  menuOpen=false; menuQuit=false; menuSaving=false; menuConfirm=null;
  const q=$('menu-quit'); if(q) q.remove(); const sp=$('menu-save'); if(sp) sp.remove();
  $('menu').hidden=true; $('menu').classList.remove('saving');
  sfx.menuClose(); canvas.focus();
}
// A tab that has no screen of its own yet: today's screen, in place of the book. Back returns to the book.
function m2OpenLegacy(tab) {
  const map={gear:'gear',bag:'items',system:'saves'},t=map[tab]||'gear';
  if(menuChar>=party.length) menuChar=0;
  M2.legacy=true; M2.root.hidden=true;
  menuTab=t; menuSlot=null; menuItem=null; menuConfirm=null; menuQuit=false; menuKeyNav=M2.keys; menuFocusNext=M2.keys?'cmd-'+t:null;
  menuZoom(); $('menu').hidden=false; $('menu-body').scrollTop=0;
  M2_orig.renderMenu();
  if(!M2.keys) $('menu-panel').focus({preventScroll:true});
}
function m2FromLegacy() {
  M2.legacy=false; $('menu').hidden=true; menuTab='home'; menuQuit=false; menuSaving=false; menuConfirm=null; menuItem=null; menuSlot=null;
  sfx.tab(); M2.tab='family'; M2.root.hidden=false; M2.focusNext=M2.keys?'tab-family':null;
  m2Fit(true); if(!M2.keys) M2.root.focus({preventScroll:true});
}

// ---------- Taps ----------
function m2Act(act,a,el) {
  if(act==='close') { m2CloseNew(); return; }
  if(act==='tab') { m2Tab(a); return; }
  if(act==='legacy') { m2OpenLegacy(a); return; }
  if(M2.tab==='family'&&typeof m2FamilyAct==='function') m2FamilyAct(act,a,el);
}
function m2Tab(id) {
  if(id==='vibes') {
    if(menuChar>=party.length) menuChar=0;
    M2.change=null; sfx.tab(); b3vOpen('menu'); return;
  }
  if(id===M2.tab) return;
  sfx.tab(); M2.tab=id; M2.change=null; M2.focusNext=M2.keys?'tab-'+id:null;
  if(id==='family') { m2Render(); return; }
  m2OpenLegacy(id);
}

// ---------- Keys and the gamepad ----------
function m2Buttons() { return [...M2.root.querySelectorAll('button')].filter(b=>!b.disabled&&b.offsetParent!==null); }
function m2Move(dir) {
  M2.keys=true;
  const all=m2Buttons(),cur=document.activeElement;
  if(!all.includes(cur)) { const t=M2.root.querySelector('.m2-tab[aria-selected="true"]')||all[0]; if(t) t.focus({preventScroll:true}); sfx.move(); return; }
  const a=cur.getBoundingClientRect(),cx=a.left+a.width/2,cy=a.top+a.height/2;
  // The rotated stage turns the screen; the arrows follow what the player sees, so use the visual rectangles as they are.
  let best=null,bd=Infinity;
  for(const b of all) {
    if(b===cur) continue;
    const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    const gx=Math.max(0,r.left-a.right,a.left-r.right),gy=Math.max(0,r.top-a.bottom,a.top-r.bottom);
    let main,cross;
    const D=dir;   // the rectangles are what the player sees (a turned stage included), so the arrows follow them as they are
    if(D==='up') { if(r.bottom>a.top+2) continue; main=gy; cross=gx; }
    else if(D==='down') { if(r.top<a.bottom-2) continue; main=gy; cross=gx; }
    else if(D==='left') { if(r.right>a.left+2||gy>0) continue; main=gx; cross=gy; }
    else { if(r.left<a.right-2||gy>0) continue; main=gx; cross=gy; }
    const d=main+cross*3+Math.abs(D==='up'||D==='down'?x-cx:y-cy)*.05;
    if(d<bd) { bd=d; best=b; }
  }
  if(!best) return;
  sfx.move(); best.focus({preventScroll:true});
}
function m2Cycle(d) {
  if(M2.tab!=='family'||party.length<2) return;
  M2.sel=(M2.sel+d+party.length)%party.length; menuChar=M2.sel; sfx.tab(); M2.focusNext=M2.keys?'p-'+M2.sel:null; m2Render();
}
function m2Back() {
  if(M2.change) { M2.change=null; sfx.tab(); M2.focusNext=M2.keys?'change':null; m2Render(); return; }
  m2CloseNew();
}
function m2Key(e) {
  const dirs={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
  if(dirs[e.code]) { e.preventDefault(); m2Move(dirs[e.code]); return true; }
  if(e.code==='KeyQ'||e.code==='BracketLeft') { e.preventDefault(); M2.keys=true; m2Cycle(-1); return true; }
  if(e.code==='KeyE'||e.code==='BracketRight') { e.preventDefault(); M2.keys=true; m2Cycle(1); return true; }
  if(e.code==='Escape'||e.code==='Backspace') { e.preventDefault(); m2Back(); return true; }
  if((e.code==='Enter'||e.code==='Space')&&!m2Buttons().includes(document.activeElement)) { e.preventDefault(); m2Move('down'); return true; }
  return false;
}
function m2Pad(p) {
  if(p.dir&&p.dirEdge) m2Move(p.dir);
  if(p.A) { const f=document.activeElement; if(m2Buttons().includes(f)) f.click(); else m2Move('down'); }
  if(p.B) m2Back();
  if(p.START||p.Y) m2CloseNew();
  if(p.prev) { M2.keys=true; m2Cycle(-1); }
  if(p.next) { M2.keys=true; m2Cycle(1); }
}

// ---------- Plugging in beside the old menu ----------
const M2_orig={openMenu,closeMenu,renderMenu,menuKey,menuPad,menuBack};
openMenu=function(viaKeys) { if(m2On()) return m2OpenNew(viaKeys); return M2_orig.openMenu.apply(this,arguments); };
closeMenu=function() {
  if(M2.open) {
    if(M2.legacy) { M2.open=false; M2.legacy=false; M2.change=null; M2.root.hidden=true; return M2_orig.closeMenu.apply(this,arguments); }   // a today's-screen page was showing: its own close does the rest
    m2CloseNew(); return;
  }
  return M2_orig.closeMenu.apply(this,arguments);
};
renderMenu=function() { if(M2.open&&!M2.legacy) { m2Render(); return; } return M2_orig.renderMenu.apply(this,arguments); };
menuKey=function(e) { if(M2.open&&!M2.legacy) { if(typeof B3V!=='undefined'&&B3V.open) return false; return m2Key(e); } return M2_orig.menuKey.apply(this,arguments); };
menuPad=function(p) { if(M2.open&&!M2.legacy) { if(typeof B3V!=='undefined'&&B3V.open) return; return m2Pad(p); } return M2_orig.menuPad.apply(this,arguments); };
// Back inside a today's-screen page returns to the book once nothing smaller is open (a confirm, an item, a slot).
menuBack=function(fromCmd) {
  if(M2.open&&M2.legacy) {
    const small=menuSaving||menuQuit||menuConfirm||menuItem||menuSlot||(typeof b6Sure!=='undefined'&&b6Sure);
    if(!small) { m2FromLegacy(); return; }
  }
  return M2_orig.menuBack.apply(this,arguments);
};
// The Party command of a today's-screen page also goes back to the book.
const M2_origSetTab=setMenuTab;
setMenuTab=function(id) { if(M2.open&&M2.legacy&&id==='home') { m2FromLegacy(); return; } return M2_origSetTab.apply(this,arguments); };

// A Rank-up marks the person with a New skill tag until their Vibes page is opened (the page's own redraw clears it).
const M2_origAward=b3AwardVp;
b3AwardVp=function(id,L,vp) {
  const r=M2_origAward.apply(this,arguments);
  try { if(r&&r.ranks&&r.ranks.length) { const m=b3Member(id); if(m&&m.vibes===L) m.m2new=true; } } catch(e) {}
  return r;
};
const M2_origVibesRender=b3vRender;
b3vRender=function() {
  const r=M2_origVibesRender.apply(this,arguments);
  try { if(B3V.door==='menu') { const m=b3Member(B3V.ids[B3V.sel]); if(m&&m.m2new) m.m2new=false; } } catch(e) {}
  return r;
};
// The tags ride along in the save (a new field, nothing removed).
const M2_origSnap=saveSnapshot;
saveSnapshot=function() { const s=M2_origSnap.apply(this,arguments); s.m2={newSkill:ALL_MEMBERS().filter(m=>m.m2new).map(m=>m.id)}; return s; };
const M2_origLoad=loadGame;
loadGame=function(slot) {
  const sv=readSave(slot),ok=M2_origLoad.apply(this,arguments);
  if(ok) { const ids=(sv&&sv.m2&&Array.isArray(sv.m2.newSkill))?sv.m2.newSkill:[]; for(const m of ALL_MEMBERS()) m.m2new=ids.includes(m.id); }
  return ok;
};
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{M2,m2On,m2OpenNew,m2CloseNew}); });
