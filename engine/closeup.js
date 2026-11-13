'use strict';
// engine/closeup.js: one reusable full-screen close-up of a story object (Tom 2026-11-12: "a dedicated screen with a closeup of inserting
// those coins ... also with other chapters where there are similar situations"). Spec: claude/coin-closeup-spec.md.
//
// A close-up is a DEF in CLOSEUP_DEFS plus a hooks object, so a new chapter supplies only art and a short script:
//   def  = { id, ready, bg:'art/closeup/x.webp', v:'tag', slots:[{x,y,r}] (0..1 of the plate, r = radius as a share of plate width),
//            items:[{id,label,img,group?}], order:[item id (or group) for slot 0, 1, ...], caption:(k,n)=>string }
//   group: optional. Items that are interchangeable (two identical catalog cards) share a group name; order lists the group name, so either one is right.
//   hooks= { onRight(k,item), onWrong(k,item) (the game shows its hint here), onDone(), onLeave() }
// `ready` stays false until the painted art is installed, so nothing ships with placeholder art (closeupOpen returns false and the caller
// keeps whatever it did before). Mode today: ORDERED PLACEMENT (the player must put the items in the right order, one per slot).
// Input: tap a coin, keyboard (arrows or WASD move, Enter or Space picks, Escape or B leaves), gamepad (D-pad, A, B), and an on-screen
// pad inside the screen (the normal controls are hidden while it is open). The game under it is paused (update() returns early).
// Layout is computed in JS from the overlay's own size, so it is right in portrait, landscape (the stage is rotated by CSS) and Duo.
const CLOSEUP_DEFS={};
const closeup={reveal:false,watch:false,active:false,def:null,hooks:null,el:null,plate:null,tray:null,sel:0,placed:[],busy:false,coins:[],slotEls:[],order:[],ro:null,wide:false,pad:null,cap:null,glint:null,made:false};

function closeupCSS() {
  if(document.getElementById('closeup-css')) return;
  const s=document.createElement('style'); s.id='closeup-css';
  s.textContent=`
#closeup{position:absolute;inset:0;z-index:5;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#2a1d12,#0b0805 80%);opacity:0;transition:opacity .35s;touch-action:none;font-family:"Trebuchet MS",system-ui,sans-serif}
#closeup[hidden]{display:none}#closeup.on{opacity:1}
main:has(#closeup:not([hidden])) #controls{visibility:hidden}
#closeup .cu-plate{position:absolute;overflow:hidden;box-shadow:0 0 0 2px #0008,0 10px 40px #000a}
#closeup .cu-bg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
#closeup .cu-slot{position:absolute;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%)}
#closeup .cu-slot img{width:100%;height:100%;display:block}
#closeup .cu-slot.in img{animation:cuPop .3s ease-out}
#closeup .cu-slot.rattle{animation:cuRattle .5s linear}
#closeup .cu-glint{position:absolute;border-radius:50%;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.2);background:radial-gradient(circle,#fff 0,#fff0b0 28%,#ffd24a00 68%)}
#closeup .cu-glint.go{animation:cuGlint .6s ease-out}
#closeup .cu-plate.shiver{animation:cuShiver .9s linear}
#closeup .cu-tray{position:absolute;border-radius:16px;background:linear-gradient(#5a3b22,#3b2615);box-shadow:inset 0 0 0 2px #8a6238,inset 0 6px 14px #000a,0 6px 18px #0009}
#closeup .cu-coin{position:absolute;padding:0;border:0;background:none;border-radius:50%;transition:opacity .2s;-webkit-tap-highlight-color:transparent}
#closeup .cu-coin img{width:100%;height:100%;display:block;pointer-events:none}
#closeup .cu-coin.sel{box-shadow:0 0 0 3px #fff2b0,0 0 20px 4px #ffd96b}
#closeup .cu-coin.used{opacity:.14;filter:grayscale(1)}
#closeup .cu-fly{position:absolute;pointer-events:none;z-index:4;border-radius:50%;transition:left .5s cubic-bezier(.3,.1,.2,1),top .5s cubic-bezier(.3,.1,.2,1),width .5s,height .5s}
#closeup .cu-fly img{width:100%;height:100%;display:block}
#closeup .cu-cap{position:absolute;text-align:center;color:#fff2c8;font-weight:800;letter-spacing:.04em;text-shadow:0 2px 0 #000a;pointer-events:none}
#closeup .cu-pad{position:absolute;display:flex;gap:10px;align-items:center;justify-content:center}
#closeup .cu-b{min-width:52px;height:46px;padding:0 14px;border-radius:12px;border:2px solid #d8b66a;background:#2b1d10e0;color:#fff2c8;font-weight:800;font-size:16px;letter-spacing:.04em}
#closeup .cu-b.a{background:#b8862e;color:#1a1008;border-color:#fff2b0}
#closeup .cu-b:active{transform:translateY(2px)}
#closeup.reveal{background:radial-gradient(ellipse at 50% 45%,#2a1d1280,#0b080599 85%);-webkit-backdrop-filter:blur(5px) brightness(.55);backdrop-filter:blur(5px) brightness(.55)}
#closeup .cu-rev{position:absolute;perspective:700px;pointer-events:none}
#closeup .cu-rev .cu-spin{width:100%;height:100%;transform-style:preserve-3d;animation:cuRise 1.5s cubic-bezier(.2,.8,.2,1) both;filter:drop-shadow(0 12px 22px #000b)}
#closeup .cu-rev img{width:100%;height:100%;display:block}
#closeup .cu-snow{position:absolute;overflow:hidden;border-radius:50%;pointer-events:none}
#closeup .cu-snow i{position:absolute;top:-6%;border-radius:50%;background:#fff;opacity:0;animation:cuSnow linear infinite}
@keyframes cuSnow{0%{transform:translate(0,0);opacity:0}12%{opacity:.9}85%{opacity:.8}100%{transform:translate(var(--dx),112%);opacity:0}}
#closeup .cu-rev.settled .cu-spin{animation:cuBob 2.6s ease-in-out infinite}
#closeup .cu-sun{position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#ffe9a066 0,#ffd24a00 68%);animation:cuSun 2.6s ease-in-out infinite}
#closeup.watch{background:radial-gradient(ellipse at 50% 40%,#2a1d12,#0b0805 80%)}
#closeup .cu-w{position:absolute;pointer-events:none;will-change:transform,opacity}
#closeup .cu-w img{width:100%;height:100%;display:block}
#closeup .cu-wash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 40%,#fff6c0 0,#ffd24a99 40%,#ff9a2000 80%);opacity:0}
@keyframes cuRise{0%{transform:translateY(60%) rotateY(0) scale(.35);opacity:0}30%{opacity:1}100%{transform:translateY(0) rotateY(360deg) scale(1);opacity:1}}
@keyframes cuBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5%)}}
@keyframes cuSun{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
@keyframes cuPop{0%{transform:scale(1.5);opacity:.3}100%{transform:scale(1);opacity:1}}
@keyframes cuGlint{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}35%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
@keyframes cuRattle{0%,100%{margin:0}15%{margin:-3px 4px}30%{margin:4px -3px}45%{margin:-4px -2px}60%{margin:3px 4px}75%{margin:-3px 3px}90%{margin:2px -2px}}
@keyframes cuShiver{0%,100%{transform:translate(0,0)}10%{transform:translate(-3px,2px)}20%{transform:translate(3px,-2px)}30%{transform:translate(-2px,-3px)}40%{transform:translate(3px,2px)}50%{transform:translate(-3px,1px)}60%{transform:translate(2px,-3px)}70%{transform:translate(-2px,3px)}80%{transform:translate(3px,-1px)}90%{transform:translate(-1px,2px)}}`;
  document.head.appendChild(s);
}
function cuEl(tag,cls,parent) { const e=document.createElement(tag); if(cls) e.className=cls; if(parent) parent.appendChild(e); return e; }
function cuImg(src) { const i=new Image(); i.src=src; i.alt=''; i.draggable=false; return i; }
function cuSrc(def,f) { return f+(def.v?'?v='+def.v:''); }

function closeupOpen(id,hooks) {
  const def=CLOSEUP_DEFS[id];
  if(!def||!def.ready||closeup.active) return false;
  closeupCSS();
  const host=document.getElementById('game'); if(!host) return false;
  const el=closeup.el=cuEl('div','',host); el.id='closeup'; el.hidden=false;
  closeup.def=def; closeup.hooks=hooks||{}; closeup.sel=0; closeup.placed=[]; closeup.busy=true; closeup.coins=[]; closeup.slotEls=[];
  closeup.order=def.items.map((_,i)=>i).sort(()=>Math.random()-.5);   // the tray is shuffled; the story decides the right order
  const plate=closeup.plate=cuEl('div','cu-plate',el);
  const bg=cuImg(cuSrc(def,def.bg)); bg.className='cu-bg'; plate.appendChild(bg);
  def.slots.forEach(()=>{ const s=cuEl('div','cu-slot',plate); s.hidden=true; closeup.slotEls.push(s); });
  closeup.glint=cuEl('div','cu-glint',plate);
  closeup.tray=cuEl('div','cu-tray',el);
  closeup.order.forEach(ix=>{
    const b=cuEl('button','cu-coin',el); b.type='button'; b.dataset.ix=ix; b.setAttribute('aria-label',def.items[ix].label);
    b.title=def.items[ix].label; b.appendChild(cuImg(cuSrc(def,def.items[ix].img))); b.addEventListener('click',()=>closeupPick(ix));
    b.addEventListener('mouseenter',()=>{ closeup.hover=ix; closeupCaption(); }); b.addEventListener('mouseleave',()=>{ if(closeup.hover===ix) closeup.hover=null; closeupCaption(); });
    closeup.coins[ix]=b;
  });
  closeup.cap=cuEl('div','cu-cap',el);
  const pad=closeup.pad=cuEl('div','cu-pad',el);
  const mk=(txt,cls,fn,label)=>{ const b=cuEl('button','cu-b '+cls,pad); b.type='button'; b.textContent=txt; b.setAttribute('aria-label',label); b.addEventListener('click',fn); return b; };
  mk('◀','',()=>closeupMove(-1),'Previous coin'); mk('▶','',()=>closeupMove(1),'Next coin');
  mk('A','a',()=>closeupPick(closeup.sel),'Put the selected coin in'); mk('NOT YET','',()=>closeupLeave(),'Leave without placing coins');
  closeup.ro=window.ResizeObserver?new ResizeObserver(()=>closeupLayout()):null; if(closeup.ro) closeup.ro.observe(el);
  closeup.active=true; closeup.hover=null;
  if(typeof clearInput==='function') clearInput();
  closeupLayout(); closeupSel(0,true);
  // wait for the pictures, then fade in (a failed picture does not trap the player: the screen still opens and B leaves)
  const imgs=[...el.querySelectorAll('img')], t0=performance.now();
  const go=()=>{ if(!closeup.active) return; el.classList.add('on'); closeup.busy=false; closeupCaption(); };
  Promise.all(imgs.map(i=>i.decode?i.decode().catch(()=>0):0)).then(()=>setTimeout(go,30));
  return true;
}

function closeupLayout() {
  if(!closeup.active) return;
  const el=closeup.el,W=el.clientWidth,H=el.clientHeight,def=closeup.def,n=def.items.length; if(!W||!H) return;
  const wide=closeup.wide=W>H*1.1,M=10;
  let S,px,py,tx,ty,tw,th,cols,rows,c;
  if(wide) {
    S=Math.min(H-2*M,W*.62); px=M; py=(H-S)/2; tx=px+S+M; tw=W-tx-M; cols=2; rows=Math.ceil(n/cols);
    c=Math.max(24,Math.min((tw-3*M)/cols,(H-2*M-92)/rows-M)); th=rows*(c+M)+M; ty=Math.max(M+34,(H-(th+92))/2+34);
  } else {
    S=Math.min(W-2*M,H*.5); px=(W-S)/2; cols=Math.min(4,n); rows=Math.ceil(n/cols);
    c=Math.max(24,Math.min((W-2*M-(cols+1)*M)/cols,(H-S-2*M-150)/rows-M)); th=rows*(c+M)+M; tw=cols*(c+M)+M;
    const total=S+14+30+th+14+50; py=Math.max(M,(H-total)/2); tx=(W-tw)/2; ty=py+S+14+30;
  }
  Object.assign(closeup.plate.style,{left:px+'px',top:py+'px',width:S+'px',height:S+'px'});
  closeup.S=S; closeup.px=px; closeup.py=py;
  def.slots.forEach((s,k)=>{ const e=closeup.slotEls[k],d=s.r*2*S; Object.assign(e.style,{left:s.x*S+'px',top:s.y*S+'px',width:d+'px',height:d+'px'}); });
  Object.assign(closeup.tray.style,{left:tx+'px',top:ty+'px',width:tw+'px',height:th+'px'});
  closeup.home=[]; closeup.cols=cols;
  closeup.order.forEach((ix,p)=>{
    const col=p%cols,row=Math.floor(p/cols),rowN=Math.min(cols,n-row*cols),x0=tx+(tw-(rowN*(c+M)-M))/2;
    const b=closeup.coins[ix],x=x0+col*(c+M),y=ty+M+row*(c+M);
    Object.assign(b.style,{left:x+'px',top:y+'px',width:c+'px',height:c+'px'}); closeup.home[ix]={x,y,d:c};
  });
  Object.assign(closeup.cap.style,{left:tx+'px',width:tw+'px',top:(wide?ty-34:ty-32)+'px',fontSize:(wide?15:16)+'px'});
  const pb=closeup.pad.style; pb.left=tx+'px'; pb.width=tw+'px'; pb.top=(ty+th+12)+'px';
  closeup.glint.style.width=closeup.glint.style.height=(S*.2)+'px';
}
function closeupCaption() {
  if(!closeup.active) return;
  const def=closeup.def,k=closeup.placed.length,n=def.slots.length,it=def.items[closeup.hover!=null?closeup.hover:closeup.sel];
  closeup.cap.textContent=(def.caption?def.caption(k,n):('Slot '+(k+1)+' of '+n))+(it&&!closeup.busy?'  ·  '+it.label:'');
}
// Selection moves over the coins still in the tray, in tray order.
function closeupFree() { return closeup.order.filter(ix=>!closeup.placed.some(p=>p.ix===ix)); }
function closeupSel(ix,silent) {
  closeup.sel=ix; closeup.order.forEach(i=>closeup.coins[i].classList.toggle('sel',i===ix&&!closeup.coins[i].classList.contains('used')));
  if(!silent&&typeof sfx!=='undefined') sfx.move(); closeupCaption();
}
function closeupMove(d,vertical) {
  if(!closeup.active||closeup.busy||(typeof dialog!=='undefined'&&dialog.active)) return;
  const free=closeupFree(); if(!free.length) return;
  let p=free.indexOf(closeup.sel); if(p<0) p=0;
  if(vertical) { const here=closeup.order.indexOf(closeup.sel),want=here+d*closeup.cols,t=closeup.order[want]; if(t!==undefined&&free.includes(t)) return closeupSel(t); }
  closeupSel(free[(p+(vertical?(d>0?1:-1):d)+free.length)%free.length]);
}
function closeupTick() { if(typeof tone==='function') { tone({type:'square',f0:1900,f1:1500,dur:.04,vol:.12}); tone({type:'triangle',f0:1250,dur:.2,vol:.1,delay:.04}); } }
function closeupClunk() { if(typeof tone==='function') { tone({type:'square',f0:140,f1:60,dur:.25,vol:.22}); if(typeof noise==='function') noise({dur:.2,vol:.14,f0:600,f1:150,type:'lowpass'}); } }
function cuFly(ix,from,to,cb) {
  const def=closeup.def,f=cuEl('div','cu-fly',closeup.el); f.appendChild(cuImg(cuSrc(def,def.items[ix].img)));
  const set=r=>Object.assign(f.style,{left:r.x+'px',top:r.y+'px',width:r.d+'px',height:r.d+'px'}); set(from);
  f.getBoundingClientRect(); requestAnimationFrame(()=>set(to));
  setTimeout(()=>{ cb(f); },520);
}
function cuSlotRect(k) { const s=closeup.def.slots[k],d=s.r*2*closeup.S; return {x:closeup.px+s.x*closeup.S-d/2,y:closeup.py+s.y*closeup.S-d/2,d}; }
function closeupPick(ix) {
  if(!closeup.active||closeup.busy||(typeof dialog!=='undefined'&&dialog.active)) return;
  if(closeup.placed.some(p=>p.ix===ix)) return;
  const def=closeup.def,k=closeup.placed.length,item=def.items[ix],right=def.order[k]===(item.group||item.id),n=def.slots.length;
  closeup.busy=true; closeupSel(ix,true); closeup.coins[ix].classList.add('used'); closeup.coins[ix].classList.remove('sel');
  if(typeof sfx!=='undefined') sfx.select();
  cuFly(ix,closeup.home[ix],cuSlotRect(k),f=>{
    const se=closeup.slotEls[k]; se.innerHTML=''; se.appendChild(cuImg(cuSrc(def,item.img))); se.hidden=false; se.classList.add('in'); f.remove();
    closeup.placed.push({ix,k});
    if(right) {
      closeupTick(); const g=closeup.glint; g.style.left=(def.slots[k].x*closeup.S)+'px'; g.style.top=(def.slots[k].y*closeup.S)+'px';
      g.classList.remove('go'); void g.offsetWidth; g.classList.add('go');
      if(closeup.hooks.onRight) closeup.hooks.onRight(k,item);
      if(k===n-1) { closeupFinish(); return; }
      closeup.busy=false; const nx=closeupFree()[0]; closeupSel(nx===undefined?0:nx,true); return;
    }
    // Wrong coin: CLUNK, every placed coin rattles, then they all slide back to the tray.
    closeupClunk(); if(typeof sfx!=='undefined') sfx.nope();
    closeup.slotEls.forEach(e=>{ if(!e.hidden){ e.classList.remove('rattle'); void e.offsetWidth; e.classList.add('rattle'); } });
    setTimeout(()=>{
      const back=closeup.placed.slice(); closeup.placed=[];
      back.forEach(p=>{ closeup.slotEls[p.k].hidden=true; closeup.slotEls[p.k].innerHTML=''; closeup.slotEls[p.k].classList.remove('rattle','in');
        cuFly(p.ix,cuSlotRect(p.k),closeup.home[p.ix],fl=>{ fl.remove(); closeup.coins[p.ix].classList.remove('used'); }); });
      setTimeout(()=>{ closeup.busy=false; closeupSel(closeup.order[0],true); if(closeup.hooks.onWrong) closeup.hooks.onWrong(k,item); },560);
    },520);
  });
}
function closeupFinish() {
  closeupClunk(); closeup.plate.classList.add('shiver');
  setTimeout(()=>{ closeupClose(()=>{ if(closeup.hooks&&closeup.hooks.onDone) closeup.hooks.onDone(); }); },1000);
}
function closeupLeave() {
  if(!closeup.active||closeup.busy||(typeof dialog!=='undefined'&&dialog.active)) return;
  const h=closeup.hooks; closeupClose(()=>{ if(h&&h.onLeave) h.onLeave(); });
}
function closeupClose(after) {
  const el=closeup.el; closeup.busy=true; if(el) el.classList.remove('on');
  setTimeout(()=>{
    if(closeup.ro) closeup.ro.disconnect(); closeup.ro=null;
    if(el) el.remove();
    closeup.active=false; closeup.el=closeup.plate=closeup.tray=closeup.cap=closeup.pad=closeup.glint=null; closeup.busy=false;
    if(typeof clearInput==='function') clearInput();
    if(after) after();
  },380);
}
// Keyboard: runs before the game's own handlers (capture) and swallows keys while the screen is up, except L (landscape toggle).
window.addEventListener('keydown',e=>{
  if(!closeup.active||(typeof dialog!=='undefined'&&dialog.active)||e.code==='KeyL') return;
  e.preventDefault(); e.stopImmediatePropagation(); if(e.repeat) return;
  const c=e.code;
  if(closeup.reveal) { if(c==='Enter'||c==='Space'||c==='Escape'||c==='KeyB'||c==='Backspace'||c==='KeyA') closeupRevealEnd(); return; }
  if(closeup.watch) { if(c==='Enter'||c==='Space'||c==='Escape'||c==='KeyB'||c==='Backspace'||c==='KeyA') closeupWatchAct(); return; }
  if(c==='ArrowLeft'||c==='KeyA') closeupMove(-1); else if(c==='ArrowRight'||c==='KeyD') closeupMove(1);
  else if(c==='ArrowUp'||c==='KeyW') closeupMove(-1,true); else if(c==='ArrowDown'||c==='KeyS') closeupMove(1,true);
  else if(c==='Enter'||c==='Space') closeupPick(closeup.sel);
  else if(c==='Escape'||c==='KeyB'||c==='Backspace') closeupLeave();
},true);
window.addEventListener('keyup',e=>{ if(closeup.active&&e.code!=='KeyL') { e.stopImmediatePropagation(); } },true);
// Gamepad (called from pollGamepad in engine/main.js).
function closeupPad(dir,dirEdge,A,B) {
  if(dialog.active) return;
  if(closeup.reveal) { if(A||B) closeupRevealEnd(); return; }
  if(closeup.watch) { if(A||B) closeupWatchAct(); return; }
  if(dirEdge&&dir) { if(dir==='left') closeupMove(-1); else if(dir==='right') closeupMove(1); else closeupMove(dir==='up'?-1:1,true); }
  if(A) closeupPick(closeup.sel); else if(B) closeupLeave();
}

// ---------- REVEAL mode (Tom 2026-11-12, claude/closeup-coinfinds-spec.md): one object shown large over the dimmed game, no picking ----------
// closeupReveal(img, label, onDone): the coin rises in, turns once, glints, settles and bobs; the caption names it; A (or a tap, Enter, Space,
// Escape, B, gamepad A or B) continues. The scene op {coinFind:N} (data/closeup-coinfinds.js) uses it for the seven coin finds.
function closeupReveal(img,label,onDone,v,opts) {
  if(closeup.active) { if(onDone) onDone(); return false; }
  closeupCSS();
  const host=document.getElementById('game'); if(!host) { if(onDone) onDone(); return false; }
  const el=closeup.el=cuEl('div','reveal',host); el.id='closeup'; el.hidden=false; closeup.reveal=true; closeup.def=null; closeup.hooks={};
  closeup.busy=true; closeup.active=true; closeup.done=onDone||null;
  const sun=cuEl('div','cu-sun',el), box=cuEl('div','cu-rev',el), spin=cuEl('div','cu-spin',box);
  const im=cuImg(img+(v?'?v='+v:'')); spin.appendChild(im);
  if(opts&&opts.snow) { const sn=cuEl('div','cu-snow',spin), q=opts.snow; Object.assign(sn.style,{left:((q.x-q.r)*100)+'%',top:((q.y-q.r)*100)+'%',width:(q.r*200)+'%',height:(q.r*200)+'%'});
    for(let i=0;i<(q.n||26);i++) { const f=cuEl('i','',sn), z=1.5+((i*7)%4)*.8; Object.assign(f.style,{left:((i*37)%97+1)+'%',width:z+'px',height:z+'px',animationDuration:(7+((i*5)%6))+'s',animationDelay:'-'+((i*1.7)%9).toFixed(1)+'s'}); f.style.setProperty('--dx',(((i*13)%9)-4)*3+'px'); } }
  const cap=closeup.cap=cuEl('div','cu-cap',el); cap.textContent=label;
  const pad=closeup.pad=cuEl('div','cu-pad',el);
  const b=cuEl('button','cu-b a',pad); b.type='button'; b.textContent='A  CONTINUE'; b.setAttribute('aria-label','Continue'); b.addEventListener('click',closeupRevealEnd);
  el.addEventListener('click',closeupRevealEnd);
  const lay=()=>{
    const W=el.clientWidth,H=el.clientHeight; if(!W||!H) return;
    const d=Math.round(Math.min(W*.8,H*.52,520)),x=(W-d)/2,y=H/2-d/2-24;
    Object.assign(box.style,{left:x+'px',top:y+'px',width:d+'px',height:d+'px'});
    Object.assign(sun.style,{left:(x-d*.25)+'px',top:(y-d*.25)+'px',width:(d*1.5)+'px',height:(d*1.5)+'px'});
    Object.assign(cap.style,{left:'0',width:W+'px',top:(y+d+16)+'px',fontSize:Math.max(16,Math.min(24,W/18))+'px'});
    Object.assign(pad.style,{left:'0',width:W+'px',top:(y+d+16+Math.max(16,Math.min(24,W/18))*1.6+10)+'px'});
  };
  closeup.ro=window.ResizeObserver?new ResizeObserver(lay):null; if(closeup.ro) closeup.ro.observe(el);
  lay(); if(typeof clearInput==='function') clearInput();
  const go=()=>{ if(!closeup.active||!closeup.reveal) return; el.classList.add('on'); if(typeof sfx!=='undefined'&&sfx.whoosh) sfx.whoosh();
    setTimeout(()=>{ if(!closeup.reveal) return; closeupTick(); const g=cuEl('div','cu-glint go',el); const bx=box.getBoundingClientRect(),er=el.getBoundingClientRect(),sc=er.width?er.width/el.clientWidth:1,d=bx.width/sc;
      Object.assign(g.style,{left:(bx.left-er.left)/sc+d*.72+'px',top:(bx.top-er.top)/sc+d*.28+'px',width:d*.4+'px',height:d*.4+'px'}); setTimeout(()=>g.remove(),700); },1200);
    setTimeout(()=>{ if(!closeup.reveal) return; box.classList.add('settled'); closeup.busy=false; },1500); };
  (im.decode?im.decode().catch(()=>0):Promise.resolve()).then(()=>setTimeout(go,30));
  return true;
}
function closeupRevealEnd() {
  if(!closeup.active||!closeup.reveal||closeup.busy||(typeof dialog!=='undefined'&&dialog.active)) return;
  const after=closeup.done; closeup.done=null; if(typeof sfx!=='undefined'&&sfx.select) sfx.select();
  closeupClose(()=>{ closeup.reveal=false; if(after) after(); });
}

// ---------- WATCH mode (Tom 2026-11-12, claude/closeup-plan.md Row 1): a painted plate with a scripted animation that plays once ----------
// closeupWatch(id, onDone): def = CLOSEUP_DEFS[id] = { ready, v, bg, dur, startLabel, startCaption, endCaption, build(box,S)->state, frame(t,S,state) }.
// A at the start plays it; A while it plays skips to the end state; A at the end continues (onDone). B, Escape, tap and gamepad do the same as A.
// The def draws everything inside `box` (the square plate, overflow hidden) from the time t in seconds, so the layout can change under it.
function closeupWatch(id,onDone) {
  const def=CLOSEUP_DEFS[id];
  if(!def||!def.ready||closeup.active) { if(onDone) onDone(); return false; }
  closeupCSS();
  const host=document.getElementById('game'); if(!host) { if(onDone) onDone(); return false; }
  const el=closeup.el=cuEl('div','watch',host); el.id='closeup'; el.hidden=false; closeup.watch=true; closeup.def=def; closeup.hooks={}; closeup.done=onDone||null;
  closeup.busy=true; closeup.active=true; closeup.wphase='load'; closeup.wt=0;
  const plate=closeup.plate=cuEl('div','cu-plate',el); const bg=cuImg(cuSrc(def,def.bg)); bg.className='cu-bg'; plate.appendChild(bg);
  closeup.wstate=def.build(plate);
  const cap=closeup.cap=cuEl('div','cu-cap',el); cap.textContent=def.startCaption||'';
  const pad=closeup.pad=cuEl('div','cu-pad',el);
  const b=closeup.wbtn=cuEl('button','cu-b a',pad); b.type='button'; b.textContent=def.startLabel||'A'; b.setAttribute('aria-label','Continue'); b.addEventListener('click',closeupWatchAct);
  el.addEventListener('click',closeupWatchAct);
  const lay=()=>{
    const W=el.clientWidth,H=el.clientHeight; if(!W||!H) return; const M=10,fs=Math.max(15,Math.min(22,W/20)),below=fs*1.7+56+14;
    const S=Math.floor(Math.max(120,Math.min(W-2*M,H-2*M-below,720))),px=(W-S)/2,py=Math.max(M,(H-S-below)/2);
    Object.assign(plate.style,{left:px+'px',top:py+'px',width:S+'px',height:S+'px'}); closeup.S=S;
    Object.assign(cap.style,{left:'0',width:W+'px',top:(py+S+12)+'px',fontSize:fs+'px'});
    Object.assign(pad.style,{left:'0',width:W+'px',top:(py+S+12+fs*1.7)+'px'});
    def.frame(closeup.wt,S,closeup.wstate);
  };
  closeup.ro=window.ResizeObserver?new ResizeObserver(lay):null; if(closeup.ro) closeup.ro.observe(el);
  lay(); if(typeof clearInput==='function') clearInput();
  const imgs=[...el.querySelectorAll('img')];
  Promise.all(imgs.map(i=>i.decode?i.decode().catch(()=>0):0)).then(()=>setTimeout(()=>{
    if(!closeup.active||!closeup.watch) return; el.classList.add('on'); closeup.busy=false; closeup.wphase='ready'; },30));
  return true;
}
function closeupWatchAct() {
  if(!closeup.active||!closeup.watch||(typeof dialog!=='undefined'&&dialog.active)) return;
  const def=closeup.def;
  if(closeup.wphase==='ready') {
    closeup.wphase='play'; closeup.wbtn.textContent=def.skipLabel||'A  SKIP'; closeup.cap.textContent=''; const t0=performance.now(); let last=-1;
    if(def.onStart) def.onStart();
    const step=now=>{
      if(!closeup.active||!closeup.watch||closeup.wphase!=='play') return;
      const t=Math.min(def.dur,(now-t0)/1000); closeup.wt=t; def.frame(t,closeup.S,closeup.wstate);
      if(def.cues) for(const c of def.cues) if(c.at>last&&c.at<=t) c.fn();
      last=t; if(t>=def.dur) return closeupWatchEnd(); requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  } else if(closeup.wphase==='play') {
    closeup.wphase='skip'; closeup.wt=def.dur; def.frame(def.dur,closeup.S,closeup.wstate); closeupWatchEnd();
  } else if(closeup.wphase==='end') {
    closeup.wphase='out'; const after=closeup.done; closeup.done=null; if(typeof sfx!=='undefined'&&sfx.select) sfx.select();
    closeupClose(()=>{ closeup.watch=false; if(after) after(); });
  }
}
function closeupWatchEnd() {
  closeup.wphase='end'; const def=closeup.def; closeup.cap.textContent=def.endCaption||''; closeup.wbtn.textContent='A  CONTINUE';
  if(def.onEnd) def.onEnd();
}

// ---------- PLACE helper (claude/closeup-plan.md Row 2): one object lowers onto a plate at a marked spot and the spot lights up ----------
// closeupPlaceDef({id,v,bg,item,dent:{x,y},size,color,seam,startCaption,endCaption,cues}) returns a WATCH def (see closeupWatch): the object hovers above the
// spot, A lowers it in (0 to 1.0 s), it settles with a small squash, then a ring of light in `color` spreads over the plate and stays (to dur).
// Frames are a pure function of t. `seam` (optional) draws a gold crack line on the object that fills in at the end (the first cup).
function closeupPlaceDef(o) {
  const dur=o.dur||2.8, ease=x=>x<0?0:x>1?1:x*x*(3-2*x), seg=(t,a,b)=>(t-a)/(b-a);
  return {
    id:o.id, ready:true, v:o.v, bg:o.bg, dur, startLabel:'A  SET IT DOWN', startCaption:o.startCaption, endCaption:o.endCaption, skipLabel:'A  SKIP',
    cues:o.cues||[{at:.95,fn:()=>{ if(typeof tone==='function') tone({type:'triangle',f0:220,f1:110,dur:.16,vol:.2}); }},{at:1.15,fn:()=>{ if(typeof sfx!=='undefined'&&sfx.chime) sfx.chime(); }}],
    build(plate) {
      const glow=cuEl('div','cu-w',plate); glow.style.borderRadius='50%'; glow.style.background='radial-gradient(circle,'+o.color+'dd 0,'+o.color+'66 38%,'+o.color+'00 70%)'; glow.style.mixBlendMode='screen';
      const shadow=cuEl('div','cu-w',plate); shadow.style.borderRadius='50%'; shadow.style.background='radial-gradient(ellipse,#000a 0,#0000 70%)';
      const item=cuEl('div','cu-w',plate); item.appendChild(cuImg(cuSrc(o,o.item)));
      let seam=null;
      if(o.seam) { seam=cuEl('div','cu-w',item); seam.innerHTML='<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible"><path d="M 37 84 L 34 70 L 39 58 L 35 45 L 40 31" fill="none" stroke="#ffd45a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" style="filter:drop-shadow(0 0 3px #ffb21a)"/></svg>'; seam.style.inset='0'; seam.style.width=seam.style.height='100%'; }
      return {glow,shadow,item,seam};
    },
    frame(t,S,st) {
      const cx=o.dent.x*S, cy=o.dent.y*S, D=(o.size||.27)*S;
      const fall=ease(seg(t,0,1.0)), hover=(1-fall*fall)*.2*S, sc=1+.16*(1-fall);
      const sq=t>1.0&&t<1.3?1-.06*Math.sin(Math.PI*seg(t,1.0,1.3)):1;
      Object.assign(st.item.style,{width:D+'px',height:D+'px',left:(cx-D/2)+'px',top:(cy-D*.56-hover)+'px',transform:'scale('+(sc*(2-sq)).toFixed(3)+','+(sc*sq).toFixed(3)+')',transformOrigin:'50% 90%'});
      const sw=D*(1.05-.15*(1-fall)), sh=D*.32; Object.assign(st.shadow.style,{width:sw+'px',height:sh+'px',left:(cx-sw/2)+'px',top:(cy+D*.2)+'px',opacity:(.25+.6*fall).toFixed(3)});
      const g=ease(seg(t,1.1,2.2)), gd=S*(.35+.75*g); Object.assign(st.glow.style,{width:gd+'px',height:gd+'px',left:(cx-gd/2)+'px',top:(cy-gd/2)+'px',opacity:(.85*g).toFixed(3)});
      if(st.seam) st.seam.querySelector('path').style.strokeDashoffset=(1-ease(seg(t,1.7,2.6))).toFixed(3);
    }
  };
}
