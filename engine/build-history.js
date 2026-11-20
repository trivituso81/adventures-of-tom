// Build label and build history (buildlog1, Tom 2026-11-14; redesigned in builds1, plan claude/builds-plan.md).
// The label ("build <name>, <day and time>") sits on the welcome screen (top left) and in the menu (under Time and Coins).
// Tapping either opens BUILDS: a status strip (this phone's build and how many newer builds are live), a search box,
// the last 7 days grouped by day (today open, other days closed, housekeeping hidden), a marker where this phone is,
// and a detail sheet on a tap. Builds of one board card on one day are one row with "+N earlier tries".
// Data: BUILD_HISTORY in data/build-history.js (tools/build_history.py, called by bump_tags.py on every push): tag, at, what,
// and card / theme / kind when they apply. The panel also asks the server for the newest list (cache:'no-store'), so it can
// say when this phone is behind. Card titles and "what to check" come from data/board.json, read when a sheet opens.

const BUILDLOG={open:false,fresh:null,el:null,q:'',house:false,days:null,tries:{},sheet:null,board:null,boardTried:false,recentDays:7};

function buildRows() { return (BUILDLOG.fresh||(typeof BUILD_HISTORY!=='undefined'?BUILD_HISTORY:[])).slice().sort((a,b)=>new Date(b.at)-new Date(a.at)); }
function buildDayKey(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function buildTime(d) { return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); }
function buildDateTime(d) { return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+', '+buildTime(d); }
function buildDayName(key) {
  const p=key.split('-').map(Number), d=new Date(p[0],p[1]-1,p[2]), now=new Date(), y=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1);
  const s=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  return key===buildDayKey(now)?'Today, '+s:key===buildDayKey(y)?'Yesterday, '+s:s;
}
function buildEntry(tag) { return buildRows().find(r=>r.tag===tag)||null; }
// " , Nov 14, 8:51 AM" for the label; empty when the build has no entry yet.
function buildWhenLabel(tag) {
  const e=buildEntry(tag); if(!e) return '';
  return ', '+buildDateTime(new Date(e.at));
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
// Escapes text and wraps every search word in <mark>.
function buildMark(text,words) {
  text=String(text==null?'':text); if(!words.length) return buildEsc(text);
  const re=new RegExp('('+words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi');
  return text.split(re).map((p,i)=>i%2?'<mark>'+buildEsc(p)+'</mark>':buildEsc(p)).join('');
}
function buildWords() { return BUILDLOG.q.toLowerCase().split(/\s+/).filter(Boolean); }
function buildHay(r) { return ((r.tag||'')+' '+(r.what||'')+' '+(r.theme||'')).toLowerCase(); }
function buildMine() { return typeof BUILD_TAG!=='undefined'?BUILD_TAG:''; }

// Tries of one card: a fix card's tries (c-fix-x, c-fix-x-2, c-fix-x-3) share one family; parts of one build share their card.
function buildFamily(r) {
  if(!r.card) return 't:'+r.tag;
  return /^c-fix-/.test(r.card)?r.card.replace(/-\d+$/,''):r.card;
}
// One day's builds as groups, newest first: {head, older:[...]}. This phone's build always starts a group, so a newer try of the
// same card is never folded in with it and the marker can sit directly above it.
function buildGroups(rows,mine) {
  const groups=[], open={};
  for(const r of rows) {
    const f=buildFamily(r), g=open[f];
    if(g&&r.tag!==mine) g.older.push(r);
    else { const n={head:r,older:[]}; groups.push(n); open[f]=n; }
  }
  return groups;
}
function buildIsHouse(r,mine) { return r.kind==='house'&&r.tag!==mine; }   // the build this phone runs is never hidden

function buildStatusHtml() {
  const rows=buildRows(), mine=buildMine(), idx=rows.findIndex(r=>r.tag===mine), newer=idx>0?idx:0;
  let line;
  if(!rows.length) line='';
  else if(idx<0) line='This build is not in the list yet.';
  else if(!newer) line='The newest build.';
  else line=newer+(newer===1?' newer build is live.':' newer builds are live.');
  return '<div class="bl-st"><div class="bl-st1">This phone: <b>'+buildEsc(mine||'unknown')+'</b></div>'+(line?'<div class="bl-st2">'+buildEsc(line)+'</div>':'')+'</div>'+
    (newer?'<button type="button" class="bl-reload" data-act="reload">RELOAD</button>':'');
}

function buildRowHtml(r,opt) {
  const d=new Date(r.at), mine=buildMine(), w=opt.words||[];
  const meta=[buildMark(r.tag,w)]; if(r.theme) meta.push(buildMark(r.theme,w)); meta.push(buildEsc(opt.dateTime?buildDateTime(d):buildTime(d)));
  const main='<div class="bl-row'+(r.tag===mine?' mine':'')+(opt.sub?' sub':'')+'" role="button" tabindex="0" data-act="sheet" data-tag="'+buildEsc(r.tag)+'">'+
    '<span class="bl-what">'+buildMark(r.what||r.tag,w)+'</span>'+
    '<span class="bl-meta">'+meta.join(' &middot; ')+'</span>';
  let tries='';
  if(opt.older&&opt.older.length) {
    const n=opt.older.length, k=opt.key, on=!!BUILDLOG.tries[k];
    tries='<button type="button" class="bl-tries" data-act="tries" data-key="'+buildEsc(k)+'" aria-expanded="'+on+'">+'+n+' earlier '+(n===1?'try':'tries')+' on this card'+(on?' &#9650;':' &#9662;')+'</button>';
  }
  return main+tries+'</div>'+(opt.older&&opt.older.length&&BUILDLOG.tries[opt.key]?opt.older.map(o=>buildRowHtml(o,{sub:true,words:w})).join(''):'');
}

function buildListHtml() {
  const rows=buildRows(), mine=buildMine(), words=buildWords();
  if(words.length) {   // search: one flat list over every build loaded, newest first
    const hit=rows.filter(r=>words.every(w=>buildHay(r).includes(w)));
    if(!hit.length) return '<div class="bl-empty">No builds match.<button type="button" class="bl-clear" data-act="clear">Clear search</button></div>';
    return '<div class="bl-count">'+hit.length+(hit.length===1?' build':' builds')+'</div>'+hit.map(r=>buildRowHtml(r,{dateTime:true,words})).join('');
  }
  const cut=Date.now()-BUILDLOG.recentDays*864e5, recent=rows.filter(r=>new Date(r.at).getTime()>=cut||r.tag===mine);
  const days=[]; for(const r of recent){ const k=buildDayKey(new Date(r.at)); if(!days.includes(k)) days.push(k); }   // newest day first
  if(!days.length) return '<div class="bl-empty">No builds in the last '+BUILDLOG.recentDays+' days.</div>';
  const today=buildDayKey(new Date());
  if(!BUILDLOG.days) {
    const withBuilds=days.find(k=>recent.some(r=>buildDayKey(new Date(r.at))===k&&(BUILDLOG.house||!buildIsHouse(r,mine))));
    BUILDLOG.days={}; BUILDLOG.days[days.includes(today)?today:(withBuilds||days[0])]=true;
  }
  let out='';
  for(const k of days) {
    const all=recent.filter(r=>buildDayKey(new Date(r.at))===k);
    const hidden=BUILDLOG.house?[]:all.filter(r=>buildIsHouse(r,mine)), shown=all.filter(r=>!hidden.includes(r));
    const on=!!BUILDLOG.days[k], hasMe=all.some(r=>r.tag===mine);
    const cnt=shown.length+(shown.length===1?' build':' builds')+(hidden.length?', '+hidden.length+' housekeeping hidden':'');
    out+='<button type="button" class="bl-dayhead" data-act="day" data-day="'+k+'" aria-expanded="'+on+'"><span>'+buildEsc(buildDayName(k).toUpperCase())+(hasMe&&!on?' &middot; THIS PHONE':'')+'</span><span class="bl-dc">'+buildEsc(cnt)+' '+(on?'&#9662;':'&#9656;')+'</span></button>';
    if(!on) continue;
    if(!shown.length) { out+='<div class="bl-empty small">Only housekeeping builds this day.</div>'; continue; }
    for(const g of buildGroups(shown,mine)) {
      if(g.head.tag===mine) out+='<div class="bl-marker"><span>THIS PHONE IS HERE</span></div>';
      out+=buildRowHtml(g.head,{older:g.older,key:k+'|'+buildFamily(g.head)+'|'+g.head.tag});
    }
  }
  return out;
}

function buildRenderStatus() { const s=BUILDLOG.el&&BUILDLOG.el.querySelector('.bl-status'); if(s) s.innerHTML=buildStatusHtml(); }
function buildRenderList() {
  const l=BUILDLOG.el&&BUILDLOG.el.querySelector('.bl-list'); if(!l) return;
  const top=l.scrollTop; l.innerHTML=buildListHtml(); l.scrollTop=top;
}

// ---- detail sheet (plan 3.6)
function buildCardInfo(r) {   // {card, tom} from data/board.json: the card of the build and the open Tom card it hands to
  const b=BUILDLOG.board; if(!b||!r||!r.card) return null;
  const card=b.cards.find(c=>c.id===r.card); if(!card) return null;
  const tom=typeof card.after==='string'?b.cards.find(c=>c.id===card.after):null;
  const asks=['play','pictures','animations','voice','script'];
  return {card,tom:tom&&tom.col!=='done'&&asks.includes(tom.ask)?tom:null};
}
function buildStatusSentence(r) {
  const rows=buildRows(), mine=buildMine(), i=rows.findIndex(x=>x.tag===r.tag), m=rows.findIndex(x=>x.tag===mine);
  if(r.tag===mine) return 'On this phone. It is the build running now.';
  if(m<0) return 'Live.';
  return i<m?'Live. Reload to get it.':'On this phone.';
}
function buildSheetHtml(tag) {
  const r=buildEntry(tag); if(!r) return '';
  const d=new Date(r.at), tz=(Intl.DateTimeFormat().resolvedOptions().timeZone||'').replace(/_/g,' ');
  const rel=buildRows().filter(x=>x.tag!==r.tag&&buildFamily(x)===buildFamily(r)&&(r.card||x.card)&&x.card);
  const info=buildCardInfo(r);
  const line=(k,v)=>'<div class="bl-sl"><span class="bl-k">'+k+'</span><span class="bl-v">'+v+'</span></div>';
  let h='<div class="bl-sheet" role="dialog" aria-modal="true" aria-label="Build details">'+
    '<div class="bl-shead"><span>BUILD DETAILS</span><button type="button" class="bl-sclose" data-act="sclose" aria-label="Close details">&#10005;</button></div><div class="bl-sbody">'+
    '<div class="bl-ssent">'+buildEsc(r.what||r.tag)+'</div>'+
    line('Build','<span class="bl-mono">'+buildEsc(r.tag)+'</span> <button type="button" class="bl-copy" data-act="copy" data-tag="'+buildEsc(r.tag)+'">Copy name</button>')+
    line('Made',buildEsc(d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+', '+buildTime(d))+'<small>In this phone\'s time zone'+(tz?' ('+buildEsc(tz)+')':'')+'.</small>')+
    line('Status',buildEsc(buildStatusSentence(r)));
  if(r.theme) h+=line('Theme',buildEsc(r.theme));
  if(r.card) {
    const title=info?info.card.title:(BUILDLOG.boardTried?r.card:'Reading the board...');
    h+=line('Card',buildEsc(title)+'<a class="bl-open" href="board.html?card='+encodeURIComponent(r.card)+'">Open the card on the board</a>');
  }
  if(info&&info.tom) h+=line('What to check',buildEsc(info.tom.next||''));
  if(rel.length) h+='<div class="bl-sl"><span class="bl-k">Other tries</span><span class="bl-v">'+rel.map(x=>'<button type="button" class="bl-other" data-act="sheet" data-tag="'+buildEsc(x.tag)+'"><span>'+buildEsc(x.what||x.tag)+'</span><small>'+buildEsc(x.tag)+' &middot; '+buildEsc(buildDateTime(new Date(x.at)))+'</small></button>').join('')+'</span></div>';
  return h+'</div></div>';
}
function buildSheetRender() {
  const el=BUILDLOG.el; if(!el) return;
  let s=el.querySelector('.bl-sheetwrap');
  if(!BUILDLOG.sheet) { if(s) s.hidden=true; return; }
  if(!s) { s=document.createElement('div'); s.className='bl-sheetwrap'; el.querySelector('.bl-panel').appendChild(s); }
  s.hidden=false; s.innerHTML=buildSheetHtml(BUILDLOG.sheet);
  const b=s.querySelector('.bl-sbody'); if(b) b.scrollTop=0;
}
function buildSheetOpen(tag) {
  BUILDLOG.sheet=tag; buildSheetRender();
  if(!BUILDLOG.board&&!BUILDLOG.boardTried) {
    BUILDLOG.boardTried=true;
    fetch('data/board.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(b=>{ if(b&&b.cards) BUILDLOG.board=b; }).catch(()=>{}).then(()=>{ if(BUILDLOG.open&&BUILDLOG.sheet) buildSheetRender(); });
  }
}

function buildReload() {
  if(typeof splashReload==='function'&&typeof splash!=='undefined'&&splash.active){ buildHistoryClose(); splashReload(); }
  else { const u=new URL(location.href); u.searchParams.set('r',Date.now().toString(36)); location.replace(u.toString()); }
}

function buildAct(t) {
  const act=t.dataset.act;
  if(act==='sheet') buildSheetOpen(t.dataset.tag);
  else if(act==='sclose') { BUILDLOG.sheet=null; buildSheetRender(); }
  else if(act==='day') { BUILDLOG.days[t.dataset.day]=!BUILDLOG.days[t.dataset.day]; buildRenderList(); }
  else if(act==='tries') { BUILDLOG.tries[t.dataset.key]=!BUILDLOG.tries[t.dataset.key]; buildRenderList(); }
  else if(act==='house') { BUILDLOG.house=!BUILDLOG.house; BUILDLOG.days=null; t.setAttribute('aria-pressed',BUILDLOG.house); buildRenderList(); }
  else if(act==='clear') { BUILDLOG.q=''; const i=BUILDLOG.el.querySelector('.bl-q'); if(i) i.value=''; buildRenderList(); }
  else if(act==='reload') buildReload();
  else if(act==='copy') {
    const tag=t.dataset.tag, done=()=>{ t.textContent='Copied'; setTimeout(()=>{ t.textContent='Copy name'; },1200); };
    try { navigator.clipboard.writeText(tag).then(done,done); } catch(e) { done(); }
  }
  else if(act==='close') buildHistoryClose();
}

function buildHistoryBuild() {
  const el=BUILDLOG.el;
  el.innerHTML='<div class="bl-panel" role="dialog" aria-modal="true" aria-label="Builds">'+
    '<div class="bl-head"><span>BUILDS</span><button type="button" class="bl-close" data-act="close" aria-label="Close">&#10005;</button></div>'+
    '<div class="bl-status"></div>'+
    '<div class="bl-find"><input class="bl-q" type="search" placeholder="Search builds" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search builds"><button type="button" class="bl-hk" data-act="house" aria-pressed="'+BUILDLOG.house+'">Housekeeping</button></div>'+
    '<div class="bl-list"></div></div>';
  el.querySelector('.bl-q').value=BUILDLOG.q;
  el.querySelector('.bl-q').addEventListener('input',e=>{ BUILDLOG.q=e.target.value; buildRenderList(); });
  buildRenderStatus(); buildRenderList();
}

function buildHistoryOpen() {
  if(BUILDLOG.open) return;
  BUILDLOG.open=true; BUILDLOG.days=null; BUILDLOG.tries={}; BUILDLOG.sheet=null; BUILDLOG.q='';
  if(typeof sfx!=='undefined'&&sfx.select) sfx.select();
  let el=BUILDLOG.el;
  if(!el) {
    el=BUILDLOG.el=document.createElement('div'); el.id='buildlog';
    for(const t of ['pointerdown','pointerup','touchstart','touchend','mousedown','wheel']) el.addEventListener(t,e=>e.stopPropagation(),{passive:true});
    el.addEventListener('click',e=>{
      e.stopPropagation();
      if(e.target===el) { buildHistoryClose(); return; }
      if(e.target.classList&&e.target.classList.contains('bl-sheetwrap')) { BUILDLOG.sheet=null; buildSheetRender(); return; }   // a tap outside the sheet
      const t=e.target.closest&&e.target.closest('[data-act]'); if(t&&el.contains(t)) { e.preventDefault(); buildAct(t); }
    });
    el.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.bl-row')) { e.preventDefault(); buildAct(e.target); } });
    (document.getElementById('stage')||document.body).appendChild(el);
  }
  el.hidden=false;
  buildHistoryBuild();
  // The newest list from the server (not the saved copy), so a phone that is behind can say so.
  fetch('data/build-history.js',{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>{
    const rows=[]; for(const line of t.split('\n')){ const s=line.trim().replace(/,$/,''); if(s[0]==='{') try{ rows.push(JSON.parse(s)); }catch(e){} }
    if(rows.length&&BUILDLOG.open) { BUILDLOG.fresh=rows; buildRenderStatus(); buildRenderList(); if(BUILDLOG.sheet) buildSheetRender(); }
  }).catch(()=>{});
}

function buildHistoryClose() {
  if(!BUILDLOG.open) return;
  BUILDLOG.open=false; BUILDLOG.sheet=null; if(BUILDLOG.el) BUILDLOG.el.hidden=true;
  if(typeof sfx!=='undefined'&&sfx.menuClose) sfx.menuClose();
}

// While the list is open the keyboard belongs to it, nothing reaches the game. Escape closes the details sheet, then clears a search,
// then closes the list. In the search box typing works as usual (Enter hides the keyboard).
window.addEventListener('keydown',e=>{
  if(!BUILDLOG.open) return;
  e.stopImmediatePropagation();
  const inBox=e.target&&e.target.classList&&e.target.classList.contains('bl-q');
  if(e.key==='Escape') {
    e.preventDefault();
    if(BUILDLOG.sheet) { BUILDLOG.sheet=null; buildSheetRender(); }
    else if(BUILDLOG.q) buildAct({dataset:{act:'clear'}});
    else buildHistoryClose();
    return;
  }
  if(inBox) { if(e.key==='Enter') { e.preventDefault(); e.target.blur(); } return; }
  e.preventDefault();
  if(['Backspace','Enter','m','M'].includes(e.key)) { if(BUILDLOG.sheet) { BUILDLOG.sheet=null; buildSheetRender(); } else buildHistoryClose(); }
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
