'use strict';
// engine/m2-core.js: the new main menu, "Golden Hour" (card menu1; plan claude/menuux-plan.md; drawings claude/menuux-mock/).
// It is the only menu (card c-menu4 removed the old one): its own root element #m2, its own styles (m2.css, every rule under #m2), its own keys.
// engine/menu.js keeps what other screens borrow (portraits, gear helpers, the map's Save pop-up) and a small shell that draws only the Old Stampcard.
// How it plugs in: menu.js's openMenu hands over to m2OpenNew; closeMenu, renderMenu, menuKey, menuPad and menuBack are wrapped (the shell and the Save pop-up still use theirs).
// While the new menu is open `menuOpen` is true, so every system that pauses for the menu (walking, dialogue, timers) still does.
// Pages: Family (engine/m2-family.js), Vibes and Gear (engine/m2-vibes.js, card menu2), Bag and System (engine/m2-bag.js, card menu3).
// Old Stampcard (a link on Vibes) opens the Stamps screen of the shell in place of the book; Back there returns to the book.
// Layout: wider than tall = tabs down the left edge and a two-page spread (the gutter at the middle of the screen on the unfolded
// Duo and on a desktop, where the fold is); taller than wide = one page and the tabs along the bottom edge.
// Files: engine/m2-core.js (this), engine/m2-family.js (the Family page), m2.css, fonts/bricolage.woff2 and figtree.woff2,
// art/menu/<id>.webp (tools/sprite-bake/bake_menu_heroes.py).
const M2={open:false,lab:false,labIds:null,tab:'family',legacy:false,back:'family',who:null,bench:false,vibe:null,pick:null,slot:null,peek:null,dirty:false,sel:0,change:null,keys:false,mode:'',dims:null,built:false,root:null,z:1,say:'',sig:''};
const M2_TABS=[{id:'family',label:'Party'},{id:'vibes',label:'Vibes'},{id:'gear',label:'Gear'},{id:'bag',label:'Bag'},{id:'system',label:'System'}];
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
  M2.root=r; m2BagWire(r);
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
  if(M2.lab) return '<header class="m2-top"><div class="m2-place"><b>Battle Lab</b><span>Used in every NEW BATTLE fight</span></div><div class="m2-next"></div><div class="m2-meters"></div>'+
    '<button type="button" class="m2-x" data-m2="close" data-k="close" aria-label="Back to the Battle Lab">'+m2Icon('x',20)+'</button></header>';
  const nxt=m2NextLine();
  const next=nxt?'<div class="m2-next">'+m2Icon('flag',d.compact?15:17)+'<span><em>Next</em>&nbsp; '+m2Esc(nxt)+'</span></div>':'<div class="m2-next"></div>';
  return '<header class="m2-top"><div class="m2-place"><b>'+m2Esc(m2Place())+'</b><span>'+m2Region()+'</span></div>'+next+
    '<div class="m2-meters"><span class="m2-coin" role="img" aria-label="'+coins+' coins"><i aria-hidden="true"></i><b>'+coins+'</b><small>coins</small></span>'+
    '<span class="m2-time" role="img" aria-label="Play time">'+m2Icon('clock',d.compact?14:16)+'<b>'+fmtTime(playTime)+'</b></span></div>'+
    '<button type="button" class="m2-x" data-m2="close" data-k="close" aria-label="Back to the game">'+m2Icon('x',20)+'</button></header>';
}
function m2Tabs() {
  const fresh=ALL_MEMBERS().some(m=>m.m2new);
  return '<nav class="m2-tabs" role="tablist" aria-label="Menu">'+(M2.lab?M2_TABS.filter(t=>t.id==='vibes'):M2_TABS).map(t=>
    '<button type="button" role="tab" class="m2-tab" data-m2="tab" data-a="'+t.id+'" data-k="tab-'+t.id+'" aria-selected="'+(t.id===M2.tab)+'">'+m2Icon(t.id,M2.dims.wide&&!M2.dims.compact?24:20)+'<span>'+t.label+'</span>'+
    (t.id==='vibes'&&fresh&&M2.tab!=='vibes'?'<i class="m2-dot" role="img" aria-label="Something new"></i>':'')+'</button>').join('')+'</nav>';
}
function m2Render() {
  if(!M2.open||M2.legacy) return;
  const r=M2.root,d=M2.dims||m2Dims(),grid=r.querySelector('.m2-grid');
  M2.dims=d;
  const ae=document.activeElement,keep=M2.focusNext||(M2.keys&&ae&&r.contains(ae)&&ae.dataset?ae.dataset.k:null);
  M2.focusNext=null;
  let body;
  if(M2.tab==='family') body=m2FamilyBody(d);
  else if(M2.tab==='vibes') body=m2VibesBody(d);
  else if(M2.tab==='gear') body=m2GearBody(d);
  else if(M2.tab==='bag') body=m2BagBody(d);
  else body=m2SystemBody(d);
  if(d.wide) {
    const rail=d.compact?72:96,gap=8,center=document.documentElement.classList.contains('duo')||d.lw>=900;
    const lw=center?Math.round(d.lw/2-rail-gap):Math.round((d.lw-rail-gap-8)/2);
    grid.style.gridTemplateColumns=rail+'px minmax(0,1fr)'; grid.style.gridTemplateRows=(d.compact?44:48)+'px minmax(0,1fr)'; grid.style.columnGap=gap+'px'; grid.style.padding='0 8px 12px 0';
    grid.innerHTML='<div></div>'+m2Top(d)+m2Tabs()+
      '<main class="m2-book" style="grid-template-columns:'+(body.single?'1fr':lw+'px minmax(0,1fr)')+'"><section class="m2-page l'+(body.cls?' '+body.cls:'')+'" aria-label="Page">'+body.l+'</section>'+(body.single?'':'<section class="m2-page r'+(body.cls?' '+body.cls:'')+'" aria-label="Page">'+body.r+'</section>')+'</main>';
  } else {
    grid.style.gridTemplateColumns='minmax(0,1fr)'; grid.style.gridTemplateRows='auto minmax(0,1fr) auto'; grid.style.columnGap='0'; grid.style.padding='calc(env(safe-area-inset-top,0px) + 6px) 0 calc(env(safe-area-inset-bottom,0px) + 8px)';
    grid.innerHTML=m2Top(d)+'<main class="m2-book" style="margin:0 8px"><section class="m2-page l'+(body.cls?' '+body.cls:'')+'" aria-label="Page">'+body.l+'</section></main>'+m2Tabs();
  }
  r.classList.add('m2-in'); r.classList.toggle('m2-less',m2Calm());
  if(M2.slide2) { M2.slide2=false; for(const pg of r.querySelectorAll('.m2-page')) pg.classList.add('m2-slide'); }
  if(M2.tab==='family') m2FamilyAfter();
  m2Layout();
  if(keep) { const f=r.querySelector('[data-k="'+keep+'"]')||r.querySelector('.m2-tab[aria-selected="true"]'); if(f) f.focus({preventScroll:true}); }
}
// Sizes that depend on measured space: the line-up scale.
function m2Layout() { if(!M2.open||M2.legacy) return; if(M2.tab==='family') m2FamilyLayout(); else if(M2.tab==='vibes'||M2.tab==='gear') m2PersonLayout(); }

// ---------- Open and close ----------
function m2OpenNew(viaKeys) {
  if(typeof intro!=='undefined'&&intro.active) return;
  if(menuOpen||(typeof shopOpen!=='undefined'&&shopOpen)) return;
  menuOpen=true; sfx.menuOpen(); clearInput();
  menuTab='home'; menuConfirm=null; menuChar=0;
  Object.assign(M2,{open:true,legacy:false,tab:'family',sel:0,who:null,bench:false,pick:null,slot:null,peek:null,dirty:false,change:null,keys:!!viaKeys,say:'',mode:'',sig:'',bagF:'all',bagSel:null,sheet:false,sure:null,quit:false,pulled:false,slide:false});
  const r=m2Root(); m2Still(); r.classList.remove('m2-in'); r.hidden=false;
  m2Fonts();
  M2.focusNext=M2.keys?'tab-family':null;
  m2Fit(true);
  if(!M2.keys) r.focus({preventScroll:true});
}
// The Battle Lab's VIBES AND RANKS door: the Vibes page alone, over the Lab list, on the Lab's own book. The story is not paused (menuOpen stays false).
function m2OpenLab() {
  if(M2.open) return;
  const ids=ALL_MEMBERS().map(m=>m.id).filter(id=>b3HasKit(id)&&B3_LAB.some(L=>L.party.includes(id)));
  if(!ids.length) return;
  sfx.menuOpen();
  Object.assign(M2,{open:true,lab:true,labIds:ids,legacy:false,tab:'vibes',sel:0,who:ids[0],bench:false,vibe:null,pick:null,slot:null,peek:null,dirty:false,change:null,keys:false,say:'',mode:'',sig:'',slide:false});
  const r=m2Root(); m2Still(); r.classList.remove('m2-in'); r.hidden=false;
  m2Fonts(); M2.focusNext=null; m2Fit(true);
  r.focus({preventScroll:true});
}
function m2CloseLab() {
  M2.open=false; M2.lab=false; M2.pick=null;
  const r=M2.root; if(r) { r.hidden=true; r.classList.remove('m2-in'); }
  sfx.menuClose();
  splashSetMode('lab3',Math.max(0,(splash.list||[]).findIndex(c=>c.vibes)));
}
function m2CloseNew() {
  if(!M2.open) return;
  if(M2.lab) { m2CloseLab(); return; }
  M2.open=false; M2.legacy=false; M2.change=null; M2.pick=null;
  if(M2.dirty) { M2.dirty=false; try { saveGame('auto',true); } catch(e) {} }   // a Vibes or gear change goes into the autosave, the way the old screens did
  const r=M2.root; if(r) { r.hidden=true; r.classList.remove('m2-in'); }
  menuOpen=false; menuSaving=false; menuConfirm=null;
  const sp=$('menu-save'); if(sp) sp.remove();
  $('menu').hidden=true; $('menu').classList.remove('saving');
  sfx.menuClose(); canvas.focus();
}
// Today's Stamps screen, in place of the book (the Old Stampcard link on Vibes). Back returns to the book.
function m2OpenLegacy(tab) {
  const t='stamps';
  if(menuChar>=party.length) menuChar=0;
  M2.back=M2.tab; M2.legacy=true; M2.root.hidden=true;
  menuTab=t; menuConfirm=null; menuKeyNav=M2.keys; menuFocusNext=M2.keys?'cmd-'+t:null;
  menuZoom(); $('menu').hidden=false; $('menu-body').scrollTop=0;
  M2_orig.renderMenu();
  if(!M2.keys) $('menu-panel').focus({preventScroll:true});
}
function m2FromLegacy() {
  menuLeaveStamps(); M2.legacy=false; $('menu').hidden=true; menuTab='home'; menuSaving=false; menuConfirm=null;
  sfx.tab(); M2.tab=M2.back||'family'; M2.root.hidden=false; M2.focusNext=M2.keys?'tab-'+M2.tab:null;
  m2Fit(true); if(!M2.keys) M2.root.focus({preventScroll:true});
}

// ---------- Taps ----------
function m2Act(act,a,el) {
  if(act==='close') { m2CloseNew(); return; }
  if(act==='tab') { m2Tab(a); return; }
  if(act==='legacy') { m2OpenLegacy(a); return; }
  if(M2.tab==='family') m2FamilyAct(act,a,el); else if(M2.tab==='bag'||M2.tab==='system') m2BagAct(act,a,el); else m2PersonAct(act,a,el);
}
function m2Tab(id) {
  if(id===M2.tab) return;
  sfx.tab(); M2.tab=id; M2.change=null; M2.pick=null; M2.peek=null; M2.sheet=false; M2.sure=null; M2.quit=false; M2.slide2=true; M2.focusNext=M2.keys?'tab-'+id:null;
  if(id==='vibes'||id==='gear') { if(M2.tab!=='family'&&(!M2.who||!m2People().some(x=>x.id===M2.who))) M2.who=(party[Math.min(M2.sel,party.length-1)]||party[0]).id; }
  m2Render();
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
  if(M2.tab==='vibes'||M2.tab==='gear') {
    const all=m2FaceList(); if(all.length<2) return;
    const i=Math.max(0,all.findIndex(x=>x.id===M2.who)),m=all[(i+d+all.length)%all.length];
    M2.who=m.id; M2.pick=null; M2.peek=null; const pi=party.indexOf(m); if(pi>=0&&!M2.lab) { M2.sel=pi; menuChar=pi; }
    sfx.tab(); M2.focusNext=M2.keys?'w-'+m.id:null; m2Render(); return;
  }
  if(M2.tab!=='family'||party.length<2) return;
  M2.sel=(M2.sel+d+party.length)%party.length; menuChar=M2.sel; sfx.tab(); M2.focusNext=M2.keys?'p-'+M2.sel:null; m2Render();
}
function m2Back() {
  if((M2.tab==='bag'||M2.tab==='system')&&m2BagBack()) return;
  if(M2.pick!=null) { const k='q-'+M2.pick; M2.pick=null; sfx.tab(); M2.focusNext=M2.keys?k:null; m2Render(); return; }
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

// The Lab door has no pause menu behind it, so its keys come here first (capture), the way the old Vibes screen's did.
window.addEventListener('keydown',e=>{
  if(!M2.open||!M2.lab||e.code==='KeyL') return;
  e.stopImmediatePropagation();
  if(e.code==='KeyM') { e.preventDefault(); return; }
  if(e.repeat&&(e.code==='Escape'||e.code==='Backspace'||e.code==='KeyX'||e.code==='KeyQ'||e.code==='KeyE')) { e.preventDefault(); return; }
  if(e.code==='KeyX') { e.preventDefault(); m2Back(); return; }
  m2Key(e);
},true);

// ---------- Plugging in over the shell ----------
const M2_orig={closeMenu,renderMenu,menuKey,menuPad,menuBack};
closeMenu=function() {
  if(M2.open) {
    if(M2.legacy) { M2.open=false; M2.legacy=false; M2.change=null; M2.root.hidden=true; return M2_orig.closeMenu.apply(this,arguments); }   // a today's-screen page was showing: its own close does the rest
    m2CloseNew(); return;
  }
  return M2_orig.closeMenu.apply(this,arguments);
};
renderMenu=function() { if(M2.open&&!M2.legacy) { m2Render(); return; } return M2_orig.renderMenu.apply(this,arguments); };
menuKey=function(e) { if(M2.open&&!M2.legacy) return m2Key(e); return M2_orig.menuKey.apply(this,arguments); };
menuPad=function(p) { if(M2.open&&!M2.legacy) return m2Pad(p); return M2_orig.menuPad.apply(this,arguments); };
// Back inside a today's-screen page returns to the book once nothing smaller is open (a confirm, an item, a slot).
menuBack=function(fromCmd) {
  if(M2.open&&M2.legacy) {
    const small=menuSaving||menuConfirm||(typeof b6Sure!=='undefined'&&b6Sure);
    if(!small&&menuTab==='stamps'&&typeof scBack==='function'&&scBack()) return;   // a pin or an open drawer on the Stampcard closes first
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
// The tags ride along in the save (a new field, nothing removed).
const M2_origSnap=saveSnapshot;
saveSnapshot=function() { const s=M2_origSnap.apply(this,arguments); s.m2={newSkill:ALL_MEMBERS().filter(m=>m.m2new).map(m=>m.id)}; return s; };
const M2_origLoad=loadGame;
loadGame=function(slot) {
  const sv=readSave(slot),ok=M2_origLoad.apply(this,arguments);
  if(ok) { const ids=(sv&&sv.m2&&Array.isArray(sv.m2.newSkill))?sv.m2.newSkill:[]; for(const m of ALL_MEMBERS()) m.m2new=ids.includes(m.id); }
  return ok;
};
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{M2,m2OpenNew,m2CloseNew}); });
