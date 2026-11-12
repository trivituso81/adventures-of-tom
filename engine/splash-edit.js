'use strict';
// engine/splash-edit.js: WELCOME LAYOUT editor (Tom 2026-11-11 23:26), opened from ADMIN on the welcome screen.
// Tom sizes and places each character right on the real welcome screen, once per layout type (SPLASH_LAYOUTS in engine/splash.js:
// phone upright, phone sideways, Duo open sideways, Duo open upright). The editor always edits the layout type on screen now.
// Tap a character to pick it, drag to move it, the buttons size and nudge it. ALL moves and sizes the whole group about Tom's spot.
// SAVE writes data/welcome-layout.json on GitHub (same token and route as heads.html) and keeps a copy on this device, so the
// change shows at once here and on every device after GitHub Pages updates (about a minute). No bake and no Claude step.
const SPLASH_ADJ_LS='aot-welcome-layout',SPLASH_ADJ_PATH='data/welcome-layout.json';
const SPLASH_K_MIN=.4,SPLASH_K_MAX=2.5;
const splashEdit={sel:'tom',all:false,saved:'',drag:null,menuY:0,el:null,busy:false};

function splashAdjClean(A) {   // keep only real changes, rounded: dx and dy to a tenth of a design unit, k to a thousandth
  const out={t:A.t||0};
  for(const key of Object.keys(SPLASH_LAYOUTS)) {
    const src=A[key]||{},o={};
    for(const id of Object.keys(src)) {
      const a=src[id]||{},dx=Math.round((a.dx||0)*10)/10,dy=Math.round((a.dy||0)*10)/10,k=Math.round((a.k||1)*1000)/1000,z=Math.round(a.z||0),e={};
      if(dx) e.dx=dx; if(dy) e.dy=dy; if(k!==1) e.k=k; if(z) e.z=z;
      if(Object.keys(e).length) o[id]=e;
    }
    out[key]=o;
  }
  return out;
}
// Start-up: the copy on this device shows first, then the repo file replaces it when it is newer (saved later, maybe on another device).
function splashAdjLoad() {
  try { const j=JSON.parse(localStorage.getItem(SPLASH_ADJ_LS)||'null'); if(j&&typeof j==='object') SPLASH_ADJ=splashAdjClean(j); } catch(e) {}
  fetch(SPLASH_ADJ_PATH+'?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
    if(j&&typeof j==='object'&&(j.t||0)>=(SPLASH_ADJ.t||0)&&!splash.edit) SPLASH_ADJ=splashAdjClean(j);
  }).catch(()=>{});
}
splashAdjLoad();

function splashEditSize() { const b=$('splash'); return {w:Math.max(1,b.clientWidth),h:Math.max(1,b.clientHeight)}; }
function splashEditKeyNow() { const s=splashEditSize(); return splashLayoutKey(s.w,s.h); }
function splashEditAdj(id) { const key=splashEditKeyNow(),A=SPLASH_ADJ[key]||(SPLASH_ADJ[key]={}); return A[id]||(A[id]={dx:0,dy:0,k:1}); }
function splashEditItems() { const s=splashEditSize(); return splashLineupLayout(s.w,s.h); }
const splashEditName=id=>id==='tnb'?'TNB':id.charAt(0).toUpperCase()+id.slice(1);
const splashEditDirty=()=>JSON.stringify(Object.assign(splashAdjClean(SPLASH_ADJ),{t:0}))!==splashEdit.saved;

function splashEditBuild() {
  const st=document.createElement('style');
  st.textContent='#sp-edit{position:absolute;z-index:3;left:0;right:0;bottom:0;box-sizing:border-box;padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:#0d1830ee;border-top:2px solid #c9a24d;color:#fff4d3;font:700 12px/1.3 system-ui,sans-serif;touch-action:manipulation}'
    +'#sp-edit .r{display:flex;gap:6px;align-items:center;margin-top:6px}#sp-edit .r:first-child{margin-top:0}'
    +'#sp-edit button{flex:1 1 0;min-width:0;height:38px;padding:0 4px;border:1px solid #64725a;border-radius:9px;background:#f3e6c6;color:#27473d;font:800 13px system-ui,sans-serif}'
    +'#sp-edit button.on{background:#f1d58c;border-color:#c9a24d}#sp-edit button.go{background:#1f8f45;border-color:#46d37a;color:#fff}#sp-edit button:disabled{opacity:.45}'
    +'#sp-edit .who{flex:1 1 auto;font-size:13px;letter-spacing:.3px}#sp-edit .msg{flex:1 1 auto;font-weight:600;font-size:11px;color:#cfd8c0;min-height:14px}#sp-edit .msg.err{color:#ffb4a0}#sp-edit .msg.ok{color:#9be7b0}'
    +'html.landscape #sp-edit{display:flex;flex-wrap:wrap;gap:5px;align-items:center;padding:6px calc(10px + env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) calc(10px + env(safe-area-inset-left))}html.landscape #sp-edit .r{display:contents}'
    +'html.landscape #sp-edit button{height:calc(32px*var(--ts,1));flex:1 1 40px;font-size:11px;padding:0 2px}html.landscape #sp-edit .who{flex:0 0 100%;font-size:12px}html.landscape #sp-edit #spe-back,html.landscape #sp-edit #spe-front,html.landscape #sp-edit #spe-all{flex:1 1 40px!important}html.landscape #sp-edit .msg{flex:0 0 100%;min-height:0}'
    +'#spe-hide{position:absolute;z-index:4;top:calc(14px + env(safe-area-inset-top));left:calc(14px + env(safe-area-inset-left));height:38px;padding:0 12px;border:1px solid #c9a24d;border-radius:11px;background:#0d1830e8;color:#ffe08a;font:800 12px system-ui,sans-serif;letter-spacing:.5px;touch-action:manipulation}'
    +'#splash.editing #splash-panel{display:none}#splash.editing #splash-art{touch-action:none}';
  document.head.appendChild(st);
  const el=document.createElement('div'); el.id='sp-edit'; el.hidden=true;
  el.innerHTML='<div class="r"><span class="who" id="spe-who"></span><button id="spe-back" type="button" style="flex:0 0 58px">BACK</button><button id="spe-front" type="button" style="flex:0 0 58px">FRONT</button><button id="spe-all" type="button" style="flex:0 0 50px">ALL</button></div>'
    +'<div class="r"><button data-k="-1" type="button" aria-label="Smaller">&minus;</button><button data-k="1" type="button" aria-label="Bigger">+</button>'
    +'<button data-n="-1,0" type="button" aria-label="Left">&#9664;</button><button data-n="0,-1" type="button" aria-label="Up">&#9650;</button><button data-n="0,1" type="button" aria-label="Down">&#9660;</button><button data-n="1,0" type="button" aria-label="Right">&#9654;</button></div>'
    +'<div class="r"><button id="spe-reset" type="button">RESET</button><button id="spe-turn" type="button">TURN</button><button id="spe-save" type="button">SAVE</button><button id="spe-done" type="button">DONE</button></div>'
    +'<div class="r"><span class="msg" id="spe-msg"></span></div>';
  $('splash').appendChild(el); splashEdit.el=el;
  // HIDE CONTROLS (Tom 2026-11-12 07:10): the bar covers the characters' feet, so a button at the top left puts it away and brings it back.
  // Tapping and dragging characters still works while it is hidden.
  const hb=document.createElement('button'); hb.id='spe-hide'; hb.type='button'; hb.hidden=true; $('splash').appendChild(hb); splashEdit.hideBtn=hb;
  hb.addEventListener('click',()=>{ splashEdit.barOff=!splashEdit.barOff; splashEditBar(); });
  el.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b||b.disabled) return;
    if(b.dataset.k) splashEditScale(Number(b.dataset.k)>0?1.02:1/1.02);
    else if(b.dataset.n) { const [x,y]=b.dataset.n.split(',').map(Number),sc=splashEditItems().sc||1; splashEditMove(x/sc,y/sc); }
    else if(b.id==='spe-all') { splashEdit.all=!splashEdit.all; splashEditMark(); }
    else if(b.id==='spe-back'||b.id==='spe-front') splashEditLayer(b.id==='spe-front'?1:-1);
    else if(b.id==='spe-reset') splashEditReset();
    else if(b.id==='spe-turn') { toggleLayout(); splashEditMark(); }
    else if(b.id==='spe-save') splashEditSave();
    else if(b.id==='spe-done') splashEditClose();
  });
  const box=$('splash');
  // Taps and drags on the picture. The landscape toggle turns the whole stage a quarter turn, so screen points are turned back first.
  const pt=e=>{ const r=$('splash-art').getBoundingClientRect(); return layout.rotated?{x:e.clientY-r.top,y:r.right-e.clientX}:{x:e.clientX-r.left,y:e.clientY-r.top}; };
  box.addEventListener('pointerdown',e=>{
    if(!splash.edit||e.target.closest('#sp-edit')||e.target.closest('#splash-rotate')||e.target.closest('#spe-hide')) return;
    e.preventDefault();
    const p=pt(e),items=splashEditItems();
    for(let i=items.length-1;i>=0;i--) { const m=items[i],pad=6;   // front figure first
      if(p.x>=m.mx-m.vw/2-pad&&p.x<=m.mx+m.vw/2+pad&&p.y>=m.feet-m.hh-pad&&p.y<=m.feet+pad) { if(!splashEdit.all) splashEdit.sel=m.id; break; } }
    splashEdit.drag={x:p.x,y:p.y,id:e.pointerId}; splashEditMark();
    try { box.setPointerCapture(e.pointerId); } catch(err) {}
  });
  box.addEventListener('pointermove',e=>{
    const d=splashEdit.drag; if(!splash.edit||!d||d.id!==e.pointerId) return;
    const p=pt(e),sc=splashEditItems().sc||1;
    splashEditMove((p.x-d.x)/sc,(p.y-d.y)/sc); d.x=p.x; d.y=p.y;
  });
  for(const ev of ['pointerup','pointercancel']) box.addEventListener(ev,e=>{ if(splashEdit.drag&&splashEdit.drag.id===e.pointerId) splashEdit.drag=null; });
}
function splashEditIds() { return splashEdit.all?splashEditItems().map(m=>m.id):[splashEdit.sel]; }
function splashEditMove(dx,dy) {
  for(const id of splashEditIds()) { const a=splashEditAdj(id); a.dx=(a.dx||0)+dx; a.dy=(a.dy||0)+dy; }
  splashEditMark();
}
// One character grows about its own feet. ALL grows the whole group about Tom's plain spot, so the spacing grows with the people.
function splashEditScale(r) {
  const items=splashEditItems();
  for(const id of splashEditIds()) {
    const a=splashEditAdj(id),m=items.find(q=>q.id===id),k=Math.max(SPLASH_K_MIN,Math.min(SPLASH_K_MAX,(a.k||1)*r)),rr=k/(a.k||1);
    if(splashEdit.all&&m) { a.dx=(m.bx+(a.dx||0))*rr-m.bx; a.dy=(m.bz+(a.dy||0))*rr-m.bz; }
    a.k=k;
  }
  splashEditMark();
}
// Layers (Tom 2026-11-12 07:12): BACK and FRONT move the picked character one layer behind or in front. Layer 0 is the standard order
// (lower on the screen is in front); a lower layer is behind every higher one wherever it stands. Two presses pass someone already moved once.
function splashEditLayer(d) {
  if(splashEdit.all) return;
  const a=splashEditAdj(splashEdit.sel); a.z=Math.max(-9,Math.min(9,Math.round(a.z||0)+d));
  splashEditMark();
}
function splashEditReset() {
  const A=SPLASH_ADJ[splashEditKeyNow()]||{};
  for(const id of splashEditIds()) delete A[id];
  splashEditMark();
}
function splashEditMark() {
  const el=splashEdit.el; if(!el) return;
  const key=splashEditKeyNow(),a=(SPLASH_ADJ[key]||{})[splashEdit.sel]||{},dirty=splashEditDirty();
  $('spe-who').textContent=SPLASH_LAYOUTS[key].toUpperCase()+': '+(splashEdit.all?'EVERYONE':splashEditName(splashEdit.sel)+' '+Math.round((a.k||1)*100)+'%'+(a.z?', layer '+(a.z>0?'+':'')+a.z:''));
  $('spe-back').disabled=$('spe-front').disabled=splashEdit.all;
  $('spe-all').classList.toggle('on',splashEdit.all);
  $('spe-save').classList.toggle('go',dirty); $('spe-save').disabled=!dirty||splashEdit.busy;
  $('spe-done').textContent=dirty?'CANCEL':'DONE';
  $('spe-turn').disabled=typeof tabletMode!=='undefined'&&tabletMode.on;   // iPad and open Duo follow how the device is held: turn or fold it instead
  if(dirty&&!splashEdit.busy) splashEditMsg('Not saved yet.');
}
function splashEditBar() {   // show or hide the bottom bar and label the top button to match
  const on=!!splash.edit; splashEdit.el.hidden=!on||!!splashEdit.barOff;
  splashEdit.hideBtn.hidden=!on; splashEdit.hideBtn.textContent=splashEdit.barOff?'SHOW CONTROLS':'HIDE CONTROLS';
}
function splashEditMsg(t,c) { const e=$('spe-msg'); if(e) { e.textContent=t; e.className='msg'+(c?' '+c:''); } }
function splashEditOpen() {
  sfx.select();
  if(!splashEdit.el) splashEditBuild();
  splashSetMode('launch');   // measure where the first menu's top edge sits, to draw it as a guide line while the menu is hidden
  const panel=$('splash-panel'); splashEdit.menuY=panel?panel.offsetTop:0; splashEdit.menuKey=splashEditKeyNow();
  splashEdit.saved=JSON.stringify(Object.assign(splashAdjClean(SPLASH_ADJ),{t:0})); splashEdit.t0=SPLASH_ADJ.t||0;
  splashEdit.all=false; splash.edit=true;
  $('splash').classList.add('editing'); splashEdit.barOff=false; splashEditBar();
  splashEditMsg('Tap a character, drag to move. Each layout is saved on its own.'); splashEditMark();
}
function splashEditClose() {
  if(splashEditDirty()) { SPLASH_ADJ=splashAdjClean(Object.assign(JSON.parse(splashEdit.saved),{t:splashEdit.t0})); }   // CANCEL: back to the last save
  splash.edit=false; splashEdit.drag=null;
  $('splash').classList.remove('editing'); splashEditBar();
  sfx.move(); splashSetMode('admin',7);
}
function splashEditKey(code) {
  const sc=splashEditItems().sc||1,n={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[code];
  if(n) splashEditMove(n[0]/sc,n[1]/sc);
  else if(code==='Equal'||code==='NumpadAdd') splashEditScale(1.02);
  else if(code==='Minus'||code==='NumpadSubtract') splashEditScale(1/1.02);
  else if(code==='Escape'||code==='Backspace') splashEditClose();
}
// Drawn over the cast while editing: a dashed box and name on the picked character (every box in ALL), and the menu's top edge.
function splashEditDraw(g,items,w,h) {
  g.save(); g.lineWidth=2; g.setLineDash([6,4]); g.font='800 11px system-ui,sans-serif'; g.textAlign='center';
  for(const m of items) {
    if(!splashEdit.all&&m.id!==splashEdit.sel) continue;
    const x=Math.round(m.mx-m.vw/2),y=Math.round(m.feet-m.hh);
    g.strokeStyle='#0d1830'; g.strokeRect(x-1,y-1,Math.round(m.vw)+2,Math.round(m.hh)+2);
    g.strokeStyle='#ffe08a'; g.lineDashOffset=5; g.strokeRect(x-1,y-1,Math.round(m.vw)+2,Math.round(m.hh)+2); g.lineDashOffset=0;
    if(!splashEdit.all) { const t=splashEditName(m.id).toUpperCase(),tw=g.measureText(t).width+10;
      g.fillStyle='#0d1830'; g.fillRect(Math.round(m.mx-tw/2),y-19,tw,16); g.fillStyle='#ffe08a'; g.fillText(t,Math.round(m.mx),y-7); }
  }
  if(splashEdit.menuY>0&&splashEdit.menuKey===splashEditKeyNow()) {
    const y=splashEdit.menuY; g.strokeStyle='#ffffffb0'; g.lineWidth=1; g.beginPath(); g.moveTo(0,y+.5); g.lineTo(w,y+.5); g.stroke();
    g.textAlign='left'; g.fillStyle='#ffffffd0'; g.fillText('MENU COVERS BELOW THIS LINE',8,y-5);
  }
  g.restore();
}

// ---- saving: one GitHub commit of the whole file (reads it fresh for its version, retries when it moved)
async function splashEditGh(method,body) {
  const tok=(()=>{ try { return localStorage.getItem('aot-gh-token')||''; } catch(e) { return ''; } })(); if(!tok) throw new Error('NOTOKEN');
  const base=(new URLSearchParams(location.search).get('gh')||'https://api.github.com').replace(/\/+$/,'');
  const r=await fetch(base+'/repos/trivituso81/adventures-of-tom/contents/'+SPLASH_ADJ_PATH+(method==='GET'?'?ref=main&t='+Date.now():''),{method,cache:'no-store',
    headers:Object.assign({Authorization:'Bearer '+tok,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined});
  let j=null; try { j=JSON.parse(await r.text()); } catch(e) {}
  return {ok:r.ok,status:r.status,json:j};
}
async function splashEditSave() {
  if(splashEdit.busy) return;
  splashEdit.busy=true; splashEditMark(); splashEditMsg('Saving...');
  const out=splashAdjClean(SPLASH_ADJ); out.t=Date.now();
  const txt=JSON.stringify(out,null,1)+'\n';
  const kept=()=>{ SPLASH_ADJ=out; splashEdit.saved=JSON.stringify(Object.assign(splashAdjClean(out),{t:0})); splashEdit.t0=out.t; };
  try { localStorage.setItem(SPLASH_ADJ_LS,txt); } catch(e) {}
  try {
    for(let i=0;i<6;i++) {
      if(i) await new Promise(r=>setTimeout(r,1200*i));
      const g=await splashEditGh('GET'); if(!g.ok&&g.status!==404) throw new Error('GitHub said '+g.status+' reading the file.');
      const body={message:'Welcome layout saved from the editor',content:btoa(unescape(encodeURIComponent(txt))),branch:'main'};
      if(g.ok) body.sha=g.json.sha;
      const w=await splashEditGh('PUT',body);
      if(w.ok) { kept(); splashEdit.busy=false; splashEditMark(); splashEditMsg('Saved. Other devices get it in about a minute.','ok'); return; }
      if(w.status!==409&&w.status!==422) throw new Error('GitHub said '+w.status+' saving.');
    }
    throw new Error('The file kept changing. Try again in a minute.');
  } catch(e) {
    kept(); splashEdit.busy=false; splashEditMark();
    splashEditMsg('Saved on this device only. '+(e.message==='NOTOKEN'?'No GitHub token here (set it on the Art Library page).':e.message),'err');
  }
}
