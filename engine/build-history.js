// Build label and build history (buildlog1, Tom 2026-11-14; redesigned in builds1, plan claude/builds-plan.md).
// The label ("build <name>, <day and time>") sits on the welcome screen (top left) and in the menu (under Time and Coins).
// Tapping either opens BUILDS: a status strip (this phone's build and how many newer builds are live), a search box,
// the last 7 days grouped by day (today open, other days closed, housekeeping hidden), a marker where this phone is,
// and a detail sheet on a tap. Builds of one board card on one day are one row with "+N earlier tries".
// Data: BUILD_HISTORY in data/build-history.js (tools/build_history.py, called by bump_tags.py on every push): tag, at, what,
// and card / theme / kind when they apply. The panel also asks the server for the newest list (cache:'no-store'), so it can
// say when this phone is behind. Card titles and "what to check" come from the board (builds2, plan 3.3 and 3.5): the live file from GitHub when
// it can be read (the saved token is used when there is one), else the site copy. builds2 also reads the pushed list (the same file on main,
// through the GitHub contents API) so a build that is pushed but not on the site yet shows PUBLISHING, and the last publish run, so a
// failed publish is named. In the works lists what is being built, queued and waiting on Tom's test, read from the board.

const BUILDLOG={open:false,fresh:null,el:null,q:'',days:null,tries:{},sheet:null,board:null,recentDays:7,
  view:'recent',fsheet:false,f:{theme:[],status:[],house:false},gh:'idle',pushed:null,fail:null,boardState:'idle',checkedAt:0,gopen:{},gmore:{},memo:null};
const BUILD_REPO='trivituso81/adventures-of-tom', BUILD_THEMES=['Story and Dialogue','Tools','Voice Clips','Game Shell','Battle System','Battle Animations','Areas','Characters','Project Ops','No theme'];
const BUILD_ASKS=['play','pictures','animations','voice','script'];   // the Tom cards that are a test or a look

// The live list (what the site serves) is buildRows. The list the screen shows is buildAllRows: the builds pushed to main that the site does
// not have yet (PUBLISHING) on top of it. A memo keeps one render from sorting 500 rows for every row; every change of data clears it.
function buildMemo() {
  if(BUILDLOG.memo) return BUILDLOG.memo;
  const live=(BUILDLOG.fresh||(typeof BUILD_HISTORY!=='undefined'?BUILD_HISTORY:[])).slice().sort((a,b)=>new Date(b.at)-new Date(a.at));
  const liveTags=new Set(live.map(r=>r.tag)), pub=new Set(), extra=[];
  for(const r of (BUILDLOG.pushed||[])) if(!liveTags.has(r.tag)&&!pub.has(r.tag)) { pub.add(r.tag); extra.push(r); }
  extra.sort((a,b)=>new Date(b.at)-new Date(a.at));
  const idx={}; live.forEach((r,i)=>{ idx[r.tag]=i; });
  return BUILDLOG.memo={live,all:extra.concat(live),pub,idx,mineIdx:idx[buildMine()]==null?-1:idx[buildMine()]};
}
function buildInvalidate() { BUILDLOG.memo=null; }
function buildRows() { return buildMemo().live; }
function buildAllRows() { return buildMemo().all; }
function buildDayKey(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function buildTime(d) { return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); }
function buildDateTime(d) { return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+', '+buildTime(d); }
function buildDayName(key) {
  const p=key.split('-').map(Number), d=new Date(p[0],p[1]-1,p[2]), now=new Date(), y=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1);
  const s=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  return key===buildDayKey(now)?'Today, '+s:key===buildDayKey(y)?'Yesterday, '+s:s;
}
function buildEntry(tag) { return buildAllRows().find(r=>r.tag===tag)||null; }
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
// The open Tom card a build hands to (a test or a look), when there is one. Needs the board.
function buildTestCard(r) {
  const i=buildCardInfo(r); return i&&i.tom?i.tom:null;
}
// Status of one build (plan 3.3): pub (pushed, not on the site), newer (live and newer than this phone), test (a Tom card is open for it).
function buildStat(r) {
  const m=buildMemo(), pub=m.pub.has(r.tag), i=m.idx[r.tag];
  return {pub,newer:!pub&&m.mineIdx>=0&&i!=null&&i<m.mineIdx,test:!!buildTestCard(r)};
}
function buildFilterPass(r) {
  const f=BUILDLOG.f;
  if(f.theme.length&&!f.theme.includes(r.theme||'No theme')) return false;
  if(f.status.length) {
    const s=buildStat(r);
    if(!f.status.some(k=>k==='pub'?s.pub:k==='live'?(!s.pub&&s.newer):k==='phone'?(!s.pub&&!s.newer):s.test)) return false;
  }
  return true;
}
function buildFilterCount() { const f=BUILDLOG.f; return f.theme.length+f.status.length+(f.house?1:0); }
function buildIsHouse(r,mine) { return r.kind==='house'&&r.tag!==mine; }   // the build this phone runs is never hidden

function buildStatusHtml() {
  const rows=buildRows(), m=buildMemo(), mine=buildMine(), idx=m.mineIdx, newer=idx>0?idx:0, np=m.pub.size;
  let line;
  if(!rows.length) line='';
  else if(idx<0) line='This build is not in the list yet.';
  else if(!newer) line=np?'The newest live build.':'The newest build.';
  else line=newer+(newer===1?' newer build is live.':' newer builds are live.');
  if(np) line+=' '+np+(newer?(np===1?' more is publishing.':' more are publishing.'):(np===1?' build is publishing.':' builds are publishing.'));
  const fail=BUILDLOG.fail?'<div class="bl-st3">The last publish failed at '+buildEsc(buildTime(new Date(BUILDLOG.fail)))+'.</div>':'';
  const no=BUILDLOG.gh==='fail'?'<div class="bl-st3 dim">Could not check GitHub.</div>':'';
  return '<div class="bl-st" data-act="check"><div class="bl-st1">This phone: <b>'+buildEsc(mine||'unknown')+'</b></div>'+(line?'<div class="bl-st2">'+buildEsc(line.trim())+'</div>':'')+fail+no+'</div>'+
    (newer?'<button type="button" class="bl-reload" data-act="reload">RELOAD</button>':'');
}

function buildChips(r) {
  const s=buildStat(r); let h='';
  if(s.pub) h+='<span class="bl-chip pub">PUBLISHING</span>'; else if(s.newer) h+='<span class="bl-chip live">LIVE, RELOAD</span>';
  if(s.test) h+='<span class="bl-chip test">YOUR TEST</span>';
  return h?'<span class="bl-chips">'+h+'</span>':'';
}
function buildRowHtml(r,opt) {
  const d=new Date(r.at), mine=buildMine(), w=opt.words||[];
  const meta=[buildMark(r.tag,w)]; if(r.theme) meta.push(buildMark(r.theme,w)); meta.push(buildEsc(opt.dateTime?buildDateTime(d):buildTime(d)));
  const main='<div class="bl-row'+(r.tag===mine?' mine':'')+(opt.sub?' sub':'')+'" role="button" tabindex="0" data-act="sheet" data-tag="'+buildEsc(r.tag)+'">'+
    '<span class="bl-what">'+buildMark(r.what||r.tag,w)+'</span>'+buildChips(r)+
    '<span class="bl-meta">'+meta.join(' &middot; ')+'</span>';
  let tries='';
  if(opt.older&&opt.older.length) {
    const n=opt.older.length, k=opt.key, on=!!BUILDLOG.tries[k];
    tries='<button type="button" class="bl-tries" data-act="tries" data-key="'+buildEsc(k)+'" aria-expanded="'+on+'">+'+n+' earlier '+(n===1?'try':'tries')+' on this card'+(on?' &#9650;':' &#9662;')+'</button>';
  }
  return main+tries+'</div>'+(opt.older&&opt.older.length&&BUILDLOG.tries[opt.key]?opt.older.map(o=>buildRowHtml(o,{sub:true,words:w})).join(''):'');
}

function buildListHtml() {
  if(BUILDLOG.view==='works') return buildWorksHtml();
  const rows=buildAllRows(), mine=buildMine(), words=buildWords();
  if(words.length) {   // search: one flat list over every build loaded, newest first (the filters apply to it too)
    const hit=rows.filter(r=>words.every(w=>buildHay(r).includes(w))&&buildFilterPass(r));
    if(!hit.length) return '<div class="bl-empty">No builds match.<button type="button" class="bl-clear" data-act="clear">Clear search</button></div>';
    return '<div class="bl-count">'+hit.length+(hit.length===1?' build':' builds')+'</div>'+hit.map(r=>buildRowHtml(r,{dateTime:true,words})).join('');
  }
  const cut=Date.now()-BUILDLOG.recentDays*864e5, recent=rows.filter(r=>(new Date(r.at).getTime()>=cut||r.tag===mine)&&(r.tag===mine||buildFilterPass(r)));
  const days=[]; for(const r of recent){ const k=buildDayKey(new Date(r.at)); if(!days.includes(k)) days.push(k); }   // newest day first
  if(!days.length) return '<div class="bl-empty">'+(buildFilterCount()?'No builds match.<button type="button" class="bl-clear" data-act="fclear">Clear filters</button>':'No builds in the last '+BUILDLOG.recentDays+' days.')+'</div>';
  const today=buildDayKey(new Date());
  if(!BUILDLOG.days) {
    const withBuilds=days.find(k=>recent.some(r=>buildDayKey(new Date(r.at))===k&&(BUILDLOG.f.house||!buildIsHouse(r,mine))));
    BUILDLOG.days={}; BUILDLOG.days[days.includes(today)?today:(withBuilds||days[0])]=true;
  }
  let out='';
  for(const k of days) {
    const all=recent.filter(r=>buildDayKey(new Date(r.at))===k);
    const hidden=BUILDLOG.f.house?[]:all.filter(r=>buildIsHouse(r,mine)), shown=all.filter(r=>!hidden.includes(r));
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

function buildRenderStatus() { const s=BUILDLOG.el&&BUILDLOG.el.querySelector('.bl-status'); if(s) s.innerHTML=buildStatusHtml(); buildRenderChrome(); }
// The parts around the list that depend on the data: the view buttons (with the In the works count), the Filters button, the chips of applied filters.
function buildRenderChrome() {
  const el=BUILDLOG.el; if(!el) return;
  const v=el.querySelector('.bl-views'); if(v) v.innerHTML=buildViewsHtml();
  const f=el.querySelector('.bl-find'); if(f) { f.hidden=BUILDLOG.view==='works'; const b=f.querySelector('.bl-fbtn'); if(b) b.textContent=buildFilterCount()?'Filters '+buildFilterCount():'Filters'; const c=f.querySelector('.bl-fchips'); if(c) c.innerHTML=buildChipsHtml(); }
}
function buildViewsHtml() {
  const n=buildWorksCount();
  return '<button type="button" data-act="view" data-view="recent" aria-pressed="'+(BUILDLOG.view==='recent')+'">Recent</button>'+
    '<button type="button" data-act="view" data-view="works" aria-pressed="'+(BUILDLOG.view==='works')+'">In the works'+(n?' <span class="bl-n">'+n+'</span>':'')+'</button>';
}
function buildChipsHtml() {
  const f=BUILDLOG.f, names={pub:'Publishing',live:'Live, not on this phone',phone:'On this phone',test:'Your test'}; let h='';
  for(const t of f.theme) h+='<button type="button" class="bl-fc" data-act="fremove" data-k="theme" data-v="'+buildEsc(t)+'">'+buildEsc(t)+' &#10005;</button>';
  for(const t of f.status) h+='<button type="button" class="bl-fc" data-act="fremove" data-k="status" data-v="'+t+'">'+names[t]+' &#10005;</button>';
  if(f.house) h+='<button type="button" class="bl-fc" data-act="fremove" data-k="house" data-v="">Housekeeping shown &#10005;</button>';
  if(buildFilterCount()>1) h+='<button type="button" class="bl-fc clear" data-act="fclear">Clear all</button>';
  return h;
}
function buildRenderList() {
  const l=BUILDLOG.el&&BUILDLOG.el.querySelector('.bl-list'); if(!l) return;
  const top=l.scrollTop; l.innerHTML=buildListHtml(); l.scrollTop=top;
}

// ---- In the works (plan 3.5), read from the board
function buildBoardCards(kind) {
  const b=BUILDLOG.board; if(!b||!b.cards) return [];
  const ok=c=>!c.backlog&&c.col!=='done';
  if(kind==='built') return b.cards.filter(c=>c.lane==='claude'&&c.col==='prog'&&ok(c));
  if(kind==='queued') return b.cards.filter(c=>c.lane==='claude'&&(c.col==='up'||c.col==='wait')&&ok(c));
  return b.cards.filter(c=>c.lane==='tom'&&c.col!=='wait'&&ok(c)&&BUILD_ASKS.includes(c.ask));   // test: the Tom cards that are a test or a look
}
function buildWhen(iso) {
  const d=new Date(iso); if(!iso||isNaN(d)) return '';
  return buildDayKey(d)===buildDayKey(new Date())?buildTime(d):buildDateTime(d);
}
function buildStarted(c) {
  let at=c.started_at;
  if(!at) { const h=(c.history||[]).filter(x=>x.at&&/start/i.test(x.t||'')); if(h.length) at=h[h.length-1].at; }
  return buildWhen(at);
}
function buildTomBuild(c) {   // the build a Tom card is about: the tag of the newest shipped Claude card that hands to it (same rule as board.html buildOf), else its own build
  const b=BUILDLOG.board, mk=b.cards.filter(x=>x.after===c.id&&x.tag&&x.lane==='claude');
  const sh=mk.filter(x=>x.col==='done').sort((a,b)=>String(a.done||'').localeCompare(String(b.done||'')));
  if(sh.length) return sh[sh.length-1].tag;
  return c.build||(mk.length?mk[mk.length-1].tag:'');
}
function buildWorksCount() { return buildMemo().pub.size+buildBoardCards('built').length+buildBoardCards('test').length; }
function buildWorksGroup(key,title,rows,openDefault) {
  const on=BUILDLOG.gopen[key]==null?openDefault:BUILDLOG.gopen[key], more=!!BUILDLOG.gmore[key], n=rows.length;
  let h='<button type="button" class="bl-dayhead bl-gh" data-act="group" data-g="'+key+'" aria-expanded="'+on+'"><span>'+buildEsc(title.toUpperCase())+'</span><span class="bl-dc">'+n+' '+(on?'&#9662;':'&#9656;')+'</span></button>';
  if(!on) return h;
  if(!n) return h+'<div class="bl-empty small">Nothing here.</div>';
  const shown=more?rows:rows.slice(0,3);
  h+=shown.join('');
  if(n>3) h+='<button type="button" class="bl-more" data-act="more" data-g="'+key+'">'+(more?'Show fewer':(n-3)+' more &#9662;')+'</button>';
  return h;
}
function buildWorksHtml() {
  const m=buildMemo(), b=BUILDLOG.board;
  const cardRow=(c,meta,chip)=>'<a class="bl-row" href="board.html?card='+encodeURIComponent(c.id)+'"><span class="bl-what">'+buildEsc(c.title||c.id)+'</span>'+(chip?'<span class="bl-chips"><span class="bl-chip '+chip[0]+'">'+chip[1]+'</span></span>':'')+'<span class="bl-meta">'+meta.map(buildEsc).join(' &middot; ')+'</span></a>';
  const pubRows=buildAllRows().filter(r=>m.pub.has(r.tag)).map(r=>'<div class="bl-row" role="button" tabindex="0" data-act="sheet" data-tag="'+buildEsc(r.tag)+'"><span class="bl-what">'+buildEsc(r.what||r.tag)+'</span><span class="bl-chips"><span class="bl-chip pub">PUBLISHING</span></span><span class="bl-meta">'+buildEsc(r.tag)+' &middot; pushed '+buildEsc(buildWhen(r.at))+', usually live in 4 min</span></div>');
  let h=buildWorksGroup('pub','Publishing now',pubRows,true);
  if(!b) return h+(BUILDLOG.boardState==='fail'?'<div class="bl-empty">Could not read the board.<button type="button" class="bl-clear" data-act="check">Try again</button></div>':'<div class="bl-empty">Reading the board...</div>');
  const built=buildBoardCards('built').sort((x,y)=>String(y.started_at||'').localeCompare(String(x.started_at||''))).map(c=>{ const st=buildStarted(c); return cardRow(c,[c.tag||'no build name yet',c.theme||'No theme'].concat(st?['started '+st]:[]),['build','BUILDING']); });
  const test=buildBoardCards('test').sort((x,y)=>String(y.changed||'').localeCompare(String(x.changed||''))).map(c=>{
    const tag=buildTomBuild(c), e=tag?buildEntry(tag):null, s=e?buildStat(e):null;
    const where=!tag?'build not named yet':!e?'build not found':s.pub?'still publishing':s.newer?'reload first':'on this phone';
    return cardRow(c,tag?[tag,where]:[where],['test','YOUR TEST']); });
  const queued=buildBoardCards('queued').map(c=>cardRow(c,[c.tag||'no build name yet',c.theme||'No theme',c.col==='wait'?'waiting':'up next'],['queue','QUEUED']));
  return h+buildWorksGroup('built','Being built now',built,true)+buildWorksGroup('test','Waiting on your test',test,true)+buildWorksGroup('queued','Queued',queued,false);
}

// ---- detail sheet (plan 3.6)
function buildCardInfo(r) {   // {card, tom} from data/board.json: the card of the build and the open Tom card it hands to
  const b=BUILDLOG.board; if(!b||!r||!r.card) return null;
  const card=b.cards.find(c=>c.id===r.card); if(!card) return null;
  const tom=typeof card.after==='string'?b.cards.find(c=>c.id===card.after):null;
  const asks=['play','pictures','animations','voice','script'];
  return {card,tom:tom&&tom.col!=='done'&&tom.col!=='wait'&&!tom.backlog&&asks.includes(tom.ask)?tom:null};
}
function buildStatusSentence(r) {
  const s=buildStat(r), mine=buildMine(), test=s.test?' Waiting on your test.':'';
  if(s.pub) return 'Publishing. It is pushed but not on the site yet, usually live in about 4 minutes.'+test;
  if(r.tag===mine) return 'On this phone. It is the build running now.'+test;
  if(buildMemo().mineIdx<0) return 'Live.'+test;
  return (s.newer?'Live. Reload to get it.':'On this phone.')+test;
}
function buildSheetHtml(tag) {
  const r=buildEntry(tag); if(!r) return '';
  const d=new Date(r.at), tz=(Intl.DateTimeFormat().resolvedOptions().timeZone||'').replace(/_/g,' ');
  const rel=buildAllRows().filter(x=>x.tag!==r.tag&&buildFamily(x)===buildFamily(r)&&(r.card||x.card)&&x.card);
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
    const title=info?info.card.title:(BUILDLOG.boardState==='fail'?r.card:'Reading the board...');
    h+=line('Card',buildEsc(title)+'<a class="bl-open" href="board.html?card='+encodeURIComponent(r.card)+'">Open the card on the board</a>');
  }
  if(info&&info.tom) h+=line('What to check',buildEsc(info.tom.next||''));
  if(rel.length) h+='<div class="bl-sl"><span class="bl-k">Other tries</span><span class="bl-v">'+rel.map(x=>'<button type="button" class="bl-other" data-act="sheet" data-tag="'+buildEsc(x.tag)+'"><span>'+buildEsc(x.what||x.tag)+'</span><small>'+buildEsc(x.tag)+' &middot; '+buildEsc(buildDateTime(new Date(x.at)))+'</small></button>').join('')+'</span></div>';
  return h+'</div></div>';
}
function buildSheetRender() {
  const el=BUILDLOG.el; if(!el) return;
  let s=el.querySelector('.bl-dwrap');
  if(!BUILDLOG.sheet) { if(s) s.hidden=true; return; }
  if(!s) { s=document.createElement('div'); s.className='bl-sheetwrap bl-dwrap'; el.querySelector('.bl-panel').appendChild(s); }
  s.hidden=false; s.innerHTML=buildSheetHtml(BUILDLOG.sheet);
  const b=s.querySelector('.bl-sbody'); if(b) b.scrollTop=0;
}
function buildSheetOpen(tag) { BUILDLOG.sheet=tag; buildSheetRender(); }

// ---- the three reads (plan 3.3): the live list from the site, the pushed list and the last publish run from GitHub, the board.
function buildLs(k) { try { return localStorage.getItem(k)||''; } catch(e) { return ''; } }
function buildGh(path,raw) {
  const tok=buildLs('aot-gh-token'), h={Accept:raw?'application/vnd.github.raw':'application/vnd.github+json'}; if(tok) h.Authorization='Bearer '+tok;
  return fetch('https://api.github.com/repos/'+BUILD_REPO+path,{cache:'no-store',headers:h}).then(r=>{ if(!r.ok) throw new Error('GitHub '+r.status); return raw?r.text():r.json(); });
}
function buildParseList(t) { const rows=[]; for(const line of String(t).split('\n')){ const s=line.trim().replace(/,$/,''); if(s[0]==='{') try{ rows.push(JSON.parse(s)); }catch(e){} } return rows; }
function buildRefresh() { buildInvalidate(); if(!BUILDLOG.open) return; buildRenderStatus(); buildRenderList(); if(BUILDLOG.sheet) buildSheetRender(); }
// force: from the status strip or the first open; otherwise reads at most once in 20 seconds (GitHub allows 60 reads an hour without a token).
function buildCheck(force) {
  if(!force&&Date.now()-BUILDLOG.checkedAt<20000) return;
  BUILDLOG.checkedAt=Date.now(); BUILDLOG.gh='busy'; if(!BUILDLOG.board) BUILDLOG.boardState='busy';
  fetch('data/build-history.js',{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>{ const rows=buildParseList(t); if(rows.length) { BUILDLOG.fresh=rows; buildRefresh(); } }).catch(()=>{});
  const pushed=buildGh('/contents/data/build-history.js?ref=main',true).then(t=>{ const rows=buildParseList(t); if(!rows.length) throw new Error('empty'); BUILDLOG.pushed=rows; return true; });
  const runs=buildGh('/actions/workflows/publish.yml/runs?per_page=3',false).then(j=>{ const done=(j.workflow_runs||[]).find(x=>x.status==='completed'); BUILDLOG.fail=done&&done.conclusion==='failure'?(done.updated_at||done.created_at):null; return true; });
  Promise.all([pushed.catch(()=>false),runs.catch(()=>false)]).then(ok=>{ BUILDLOG.gh=ok[0]&&ok[1]?'ok':'fail'; if(!ok[0]) BUILDLOG.pushed=null; if(!ok[1]) BUILDLOG.fail=null; buildRefresh(); });
  buildGh('/contents/data/board.json?ref=main',true).then(t=>JSON.parse(t)).catch(()=>fetch('data/board.json',{cache:'no-store'}).then(r=>{ if(!r.ok) throw new Error('board'); return r.json(); }))
    .then(b=>{ if(!b||!b.cards) throw new Error('board'); BUILDLOG.board=b; BUILDLOG.boardState='ok'; }).catch(()=>{ if(!BUILDLOG.board) BUILDLOG.boardState='fail'; }).then(buildRefresh);
}

// ---- Filters sheet (plan 3.7): Theme, Status, Show housekeeping
function buildFiltersHtml() {
  const f=BUILDLOG.f, opt=(k,v,label,on)=>'<button type="button" class="bl-opt" data-act="ftoggle" data-k="'+k+'" data-v="'+buildEsc(v)+'" aria-pressed="'+on+'">'+buildEsc(label)+'</button>';
  return '<div class="bl-sheet" role="dialog" aria-modal="true" aria-label="Filters">'+
    '<div class="bl-shead"><span>FILTERS</span><button type="button" class="bl-sclose" data-act="fclose" aria-label="Close filters">&#10005;</button></div><div class="bl-sbody">'+
    '<div class="bl-k bl-fk">Theme</div><div class="bl-opts">'+BUILD_THEMES.map(t=>opt('theme',t,t,f.theme.includes(t))).join('')+'</div>'+
    '<div class="bl-k bl-fk">Status</div><div class="bl-opts">'+[['pub','Publishing'],['live','Live, not on this phone'],['phone','On this phone'],['test','Your test']].map(a=>opt('status',a[0],a[1],f.status.includes(a[0]))).join('')+'</div>'+
    '<div class="bl-k bl-fk">Housekeeping</div><div class="bl-opts">'+opt('house','','Show housekeeping',f.house)+'</div>'+
    '<div class="bl-fbar"><button type="button" class="bl-clear" data-act="fclear">Clear all</button><button type="button" class="bl-copy" data-act="fclose">Done</button></div>'+
    '</div></div>';
}
function buildFiltersRender() {
  const el=BUILDLOG.el; if(!el) return;
  let w=el.querySelector('.bl-fwrap');
  if(!BUILDLOG.fsheet) { if(w) w.hidden=true; return; }
  if(!w) { w=document.createElement('div'); w.className='bl-sheetwrap bl-fwrap'; el.querySelector('.bl-panel').appendChild(w); }
  const top=(w.querySelector('.bl-sbody')||{}).scrollTop||0;
  w.hidden=false; w.innerHTML=buildFiltersHtml(); const b=w.querySelector('.bl-sbody'); if(b) b.scrollTop=top;
}
function buildFilterChanged() { BUILDLOG.days=null; buildRenderChrome(); buildRenderList(); buildFiltersRender(); }

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
  else if(act==='view') { BUILDLOG.view=t.dataset.view; buildRenderChrome(); buildRenderList(); const l=BUILDLOG.el.querySelector('.bl-list'); if(l) l.scrollTop=0; if(BUILDLOG.view==='works') buildCheck(false); }
  else if(act==='check') buildCheck(true);
  else if(act==='group') { const k=t.dataset.g, cur=BUILDLOG.gopen[k]==null?(k!=='queued'):BUILDLOG.gopen[k]; BUILDLOG.gopen[k]=!cur; buildRenderList(); }
  else if(act==='more') { BUILDLOG.gmore[t.dataset.g]=!BUILDLOG.gmore[t.dataset.g]; buildRenderList(); }
  else if(act==='filters') { BUILDLOG.fsheet=true; buildFiltersRender(); }
  else if(act==='fclose') { BUILDLOG.fsheet=false; buildFiltersRender(); }
  else if(act==='ftoggle') { const k=t.dataset.k, v=t.dataset.v;
    if(k==='house') BUILDLOG.f.house=!BUILDLOG.f.house; else { const a=BUILDLOG.f[k], i=a.indexOf(v); if(i<0) a.push(v); else a.splice(i,1); }
    buildFilterChanged(); }
  else if(act==='fremove') { const k=t.dataset.k, v=t.dataset.v; if(k==='house') BUILDLOG.f.house=false; else BUILDLOG.f[k]=BUILDLOG.f[k].filter(x=>x!==v); buildFilterChanged(); }
  else if(act==='fclear') { BUILDLOG.f={theme:[],status:[],house:false}; buildFilterChanged(); }
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
    '<div class="bl-views"></div>'+
    '<div class="bl-find"><div class="bl-frow"><input class="bl-q" type="search" placeholder="Search builds" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search builds"><button type="button" class="bl-fbtn" data-act="filters">Filters</button></div><div class="bl-fchips"></div></div>'+
    '<div class="bl-list"></div></div>';
  el.querySelector('.bl-q').value=BUILDLOG.q;
  el.querySelector('.bl-q').addEventListener('input',e=>{ BUILDLOG.q=e.target.value; buildRenderList(); });
  buildRenderStatus(); buildRenderList();
}

function buildHistoryOpen() {
  if(BUILDLOG.open) return;
  BUILDLOG.open=true; BUILDLOG.days=null; BUILDLOG.tries={}; BUILDLOG.sheet=null; BUILDLOG.fsheet=false; BUILDLOG.q=''; BUILDLOG.view='recent'; BUILDLOG.f={theme:[],status:[],house:false};
  if(typeof sfx!=='undefined'&&sfx.select) sfx.select();
  let el=BUILDLOG.el;
  if(!el) {
    el=BUILDLOG.el=document.createElement('div'); el.id='buildlog';
    for(const t of ['pointerdown','pointerup','touchstart','touchend','mousedown','wheel']) el.addEventListener(t,e=>e.stopPropagation(),{passive:true});
    el.addEventListener('click',e=>{
      e.stopPropagation();
      if(e.target===el) { buildHistoryClose(); return; }
      if(e.target.classList&&e.target.classList.contains('bl-sheetwrap')) {   // a tap outside the sheet
        if(e.target.classList.contains('bl-fwrap')) { BUILDLOG.fsheet=false; buildFiltersRender(); } else { BUILDLOG.sheet=null; buildSheetRender(); }
        return;
      }
      const t=e.target.closest&&e.target.closest('[data-act]'); if(t&&el.contains(t)) { e.preventDefault(); buildAct(t); }
    });
    el.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.bl-row')) { e.preventDefault(); buildAct(e.target); } });
    (document.getElementById('stage')||document.body).appendChild(el);
  }
  el.hidden=false;
  buildHistoryBuild();
  // The reads: the newest live list from the server (not the saved copy), the pushed list, the last publish run and the board.
  buildCheck(true);
}

function buildHistoryClose() {
  if(!BUILDLOG.open) return;
  BUILDLOG.open=false; BUILDLOG.sheet=null; BUILDLOG.fsheet=false; if(BUILDLOG.el) BUILDLOG.el.hidden=true;
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
    if(BUILDLOG.fsheet) { BUILDLOG.fsheet=false; buildFiltersRender(); }
    else if(BUILDLOG.sheet) { BUILDLOG.sheet=null; buildSheetRender(); }
    else if(BUILDLOG.q) buildAct({dataset:{act:'clear'}});
    else buildHistoryClose();
    return;
  }
  if(inBox) { if(e.key==='Enter') { e.preventDefault(); e.target.blur(); } return; }
  e.preventDefault();
  if(['Backspace','Enter','m','M'].includes(e.key)) { if(BUILDLOG.fsheet) { BUILDLOG.fsheet=false; buildFiltersRender(); } else if(BUILDLOG.sheet) { BUILDLOG.sheet=null; buildSheetRender(); } else buildHistoryClose(); }
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
