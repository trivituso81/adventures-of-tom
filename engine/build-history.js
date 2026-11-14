// Build label and build history (buildlog1, Tom 2026-11-14).
// The label ("build <name>, <day and time>") sits on the welcome screen (top left) and in the menu (under Time and Coins).
// Tapping either opens a list of builds with the time each one was made, one day at a time (today first), or every day.
// Data: BUILD_HISTORY in data/build-history.js, written by tools/build_history.py (called by bump_tags.py on every push).
// The panel also asks the server for the newest list, so it can say when this phone is behind the newest build.

const BUILDLOG={open:false,day:null,all:false,fresh:null,el:null};

function buildRows() { return (BUILDLOG.fresh||(typeof BUILD_HISTORY!=='undefined'?BUILD_HISTORY:[])).slice().sort((a,b)=>new Date(b.at)-new Date(a.at)); }
function buildDayKey(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function buildTime(d) { return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); }
function buildDayName(key) {
  const p=key.split('-').map(Number), d=new Date(p[0],p[1]-1,p[2]), now=new Date(), y=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1);
  const s=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  return key===buildDayKey(now)?'Today, '+s:key===buildDayKey(y)?'Yesterday, '+s:s;
}
function buildEntry(tag) { return buildRows().find(r=>r.tag===tag)||null; }
// " , Nov 14, 8:51 AM" for the label; empty when the build has no entry yet.
function buildWhenLabel(tag) {
  const e=buildEntry(tag); if(!e) return '';
  const d=new Date(e.at);
  return ', '+d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+', '+buildTime(d);
}

// A tap that works on the iPhone home-screen app (acts on touchend, like the menu button) and with a mouse.
function buildHistoryWire(el) {
  let touched=0;
  el.addEventListener('touchstart',e=>{ e.stopPropagation(); },{passive:true});
  el.addEventListener('touchend',e=>{ e.preventDefault(); e.stopPropagation(); touched=Date.now(); buildHistoryOpen(); });
  el.addEventListener('pointerdown',e=>e.stopPropagation());
  el.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); if(Date.now()-touched>600) buildHistoryOpen(); });
}

function buildEsc(s) { return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function buildHistoryRender() {
  const el=BUILDLOG.el; if(!el) return;
  const rows=buildRows(), mine=typeof BUILD_TAG!=='undefined'?BUILD_TAG:'', me=buildEntry(mine), newest=rows[0]||null;
  const days=[]; for(const r of rows){ const k=buildDayKey(new Date(r.at)); if(!days.includes(k)) days.push(k); }   // newest day first
  const today=buildDayKey(new Date());
  if(!BUILDLOG.day) BUILDLOG.day=today;
  const day=BUILDLOG.day, older=days.filter(k=>k<day)[0]||null, newer=days.filter(k=>k>day).pop()||(day<today?today:null);
  const shown=BUILDLOG.all?rows:rows.filter(r=>buildDayKey(new Date(r.at))===day);
  let status;
  if(!newest||!me) status='This phone is running <b>build '+buildEsc(mine)+'</b>.';
  else if(newest.tag===mine) status='This phone is running <b>build '+buildEsc(mine)+'</b>, the newest build.';
  else {
    const behind=rows.findIndex(r=>r.tag===mine);
    status='This phone is running <b>build '+buildEsc(mine)+'</b>. The newest is <b>build '+buildEsc(newest.tag)+'</b> ('+behind+' newer). <button type="button" class="bl-reload">RELOAD</button>';
  }
  let list='', lastDay=null;
  for(const r of shown) {
    const d=new Date(r.at), k=buildDayKey(d);
    if(BUILDLOG.all&&k!==lastDay) { list+='<div class="bl-dayhead">'+buildEsc(buildDayName(k))+'</div>'; lastDay=k; }
    list+='<div class="bl-row'+(r.tag===mine?' mine':'')+'"><span class="bl-time">'+buildEsc(buildTime(d))+'</span><span class="bl-main"><b>'+buildEsc(r.tag)+'</b>'+
      (r.tag===mine?'<i>ON THIS PHONE</i>':'')+'<span class="bl-what">'+buildEsc(r.what||'')+'</span></span></div>';
  }
  if(!shown.length) list='<div class="bl-empty">No builds on this day.'+(older?' The last ones were '+buildEsc(buildDayName(older))+'.':'')+'</div>';
  el.innerHTML='<div class="bl-panel" role="dialog" aria-modal="true" aria-label="Build history">'+
    '<div class="bl-head"><span>BUILD HISTORY</span><button type="button" class="bl-close" aria-label="Close">&#10005;</button></div>'+
    '<div class="bl-status">'+status+'</div>'+
    '<div class="bl-bar">'+
      '<button type="button" class="bl-prev"'+(BUILDLOG.all||!older?' disabled':'')+' aria-label="Earlier day">&#9664;</button>'+
      '<span class="bl-day">'+(BUILDLOG.all?'All days':buildEsc(buildDayName(day)))+'<small>'+shown.length+(shown.length===1?' build':' builds')+'</small></span>'+
      '<button type="button" class="bl-next"'+(BUILDLOG.all||!newer?' disabled':'')+' aria-label="Later day">&#9654;</button>'+
      '<button type="button" class="bl-all">'+(BUILDLOG.all?'ONE DAY':'ALL DAYS')+'</button>'+
    '</div>'+
    '<div class="bl-list">'+list+'</div>'+
    '<div class="bl-foot">Times are when each build was made, in this phone\'s time zone. A build reaches the phone a minute or two later.</div>'+
  '</div>';
  const on=(sel,fn)=>{ const b=el.querySelector(sel); if(b) b.addEventListener('click',e=>{ e.stopPropagation(); fn(); }); };
  on('.bl-close',buildHistoryClose);
  on('.bl-prev',()=>{ if(older){ BUILDLOG.day=older; buildHistoryRender(); } });
  on('.bl-next',()=>{ if(newer){ BUILDLOG.day=newer; buildHistoryRender(); } });
  on('.bl-all',()=>{ BUILDLOG.all=!BUILDLOG.all; buildHistoryRender(); });
  on('.bl-reload',()=>{ if(typeof splashReload==='function'&&typeof splash!=='undefined'&&splash.active){ buildHistoryClose(); splashReload(); } else { const u=new URL(location.href); u.searchParams.set('r',Date.now().toString(36)); location.replace(u.toString()); } });
  const mineRow=el.querySelector('.bl-row.mine'); if(mineRow&&BUILDLOG.all) mineRow.scrollIntoView({block:'center'});
}

function buildHistoryOpen() {
  if(BUILDLOG.open) return;
  BUILDLOG.open=true; BUILDLOG.day=null; BUILDLOG.all=false;
  if(typeof sfx!=='undefined'&&sfx.select) sfx.select();
  let el=BUILDLOG.el;
  if(!el) {
    el=BUILDLOG.el=document.createElement('div'); el.id='buildlog';
    for(const t of ['pointerdown','pointerup','touchstart','touchend','mousedown','click','wheel']) el.addEventListener(t,e=>e.stopPropagation(),{passive:true});
    el.addEventListener('click',e=>{ if(e.target===el) buildHistoryClose(); });
    (document.getElementById('stage')||document.body).appendChild(el);
  }
  el.hidden=false;
  buildHistoryRender();
  // The newest list from the server (not the saved copy), so a phone that is behind can say so.
  fetch('data/build-history.js',{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>{
    const rows=[]; for(const line of t.split('\n')){ const s=line.trim().replace(/,$/,''); if(s[0]==='{') try{ rows.push(JSON.parse(s)); }catch(e){} }
    if(rows.length&&BUILDLOG.open) { BUILDLOG.fresh=rows; buildHistoryRender(); }
  }).catch(()=>{});
}

function buildHistoryClose() {
  if(!BUILDLOG.open) return;
  BUILDLOG.open=false; if(BUILDLOG.el) BUILDLOG.el.hidden=true;
  if(typeof sfx!=='undefined'&&sfx.menuClose) sfx.menuClose();
}

// While the list is open the keyboard belongs to it: Escape, Backspace, Enter or M close it, nothing reaches the game.
window.addEventListener('keydown',e=>{
  if(!BUILDLOG.open) return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(['Escape','Backspace','Enter','m','M'].includes(e.key)) buildHistoryClose();
  else if(e.key==='ArrowLeft') { const b=BUILDLOG.el.querySelector('.bl-prev'); if(b&&!b.disabled) b.click(); }
  else if(e.key==='ArrowRight') { const b=BUILDLOG.el.querySelector('.bl-next'); if(b&&!b.disabled) b.click(); }
},true);
window.addEventListener('keyup',e=>{ if(BUILDLOG.open) e.stopImmediatePropagation(); },true);

// The menu's build label (markup in index.html, under Time and Coins).
(function(){
  const b=document.getElementById('menu-build'); if(!b) return;
  const fill=()=>{ const tag=typeof BUILD_TAG!=='undefined'?BUILD_TAG:'', w=buildWhenLabel(tag).slice(2);
    b.innerHTML='<span class="mp-lbl">Build</span><b>'+buildEsc(tag)+'</b>'+(w?'<small>'+buildEsc(w)+'</small>':''); };
  window.addEventListener('load',fill); fill();
  buildHistoryWire(b);
})();
