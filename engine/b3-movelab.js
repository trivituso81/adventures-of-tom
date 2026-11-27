'use strict';
// engine/b3-movelab.js: the MOVE LAB (movestage2, card c-movestage-build; plan claude/move-staging-plan.md section 6).
// ADMIN > BATTLE LAB > NEW BATTLE > MOVE LAB: TOM is a real Battle 3 fight (Tom, Grace, Rose and Deedee against Mudlings) with a panel over the tray that
// lists Tom's eight staged moves in ladder order per Vibe. Tapping a move plays it NOW through the real rules (b3Act) and the real screen (b3Play, which hands a
// staged move to engine/b3-stage.js), then shows how long it really took beside its budget. Tom's only review of these moves is this screen:
//   KEEP     records approval (a history line and a `keeps` entry on the board card t-movestage-lab).
//   TWEAK    he writes what to change; saves a Claude card (Opus 5.5, medium) that changes the stage steps or timing and keeps the body video.
//   REPLACE  he writes what to change; saves a Claude card (Opus 5.5, medium) that makes a new body video.
// Both cards carry his note in `reports`, the way the Battle Guide's "Send a note" does. The Capstones (the last move of each Vibe) play against The Big One.
// MONSTER ACTS plays one real monster action so a lasting element (the carry-on, the doors, the shell) can answer. RESET starts the fight over.
const B3ML={on:false,busy:false,idle:false,res:null,sel:null,box:null,msg:'',saving:false,fight:'mud',timer:null,prev:null,speed0:null};
const B3ML_CARD='t-movestage-lab',B3ML_REPO='trivituso81/adventures-of-tom',B3ML_TOKEN='aot-gh-token';
const B3ML_TIER={basic:'Basic',s1:'Skill 1',s2:'Skill 2',cap:'Capstone'};
const B3ML_PERM=' Attach trivituso81/adventures-of-tom with push access (add_repo).';

// Tom's moves, ladder order per Vibe: [{vibe, name, moves:[{id,name,slot,tier,budget,row}]}]
function b3mlList() {
  return (B3_CAST.tom.vibes||[]).map(v=>B3_VIBES[v]).filter(V=>V&&V.basic&&B3_SKILLS[V.basic]).map(V=>({vibe:V.id,name:V.name,
    moves:[V.basic].concat(V.skills).filter(id=>B3_SKILLS[id]&&msStageRow('move:'+id)).map(id=>{ const S=B3_SKILLS[id],R=msStageRow('move:'+id);
      return {id,name:S.name,slot:S.slot,tier:B3ML_TIER[S.slot]||S.slot,budget:R.budget,row:R}; })})).filter(G=>G.moves.length);
}
const b3mlMove=id=>{ for(const G of b3mlList()) for(const m of G.moves) if(m.id===id) return m; return null; };
const b3mlToken=()=>{ try { return localStorage.getItem(B3ML_TOKEN)||''; } catch(e) { return ''; } };
const b3mlGH=()=>(new URLSearchParams(location.search).get('gh')||'https://api.github.com').replace(/\/+$/,'');
const b3mlToday=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const b3mlBuild=()=>window.BUILD_TAG||'';
const b3mlClean=s=>String(s||'').replace(/\s+/g,' ').replace(/[<>]/g,'').split(String.fromCharCode(8212)).join(', ').trim();

// ---------- starting the fight ----------
// Called by b3Lab before the fight starts (the row of data/b3-lab.js with `movelab`): every Vibe of Tom's at the top Rank, so each move is open.
function b3mlPrepare(cfg) {
  const big=cfg.bigone===true;
  cfg.formation=big?'bigone':'mudling'; cfg.seed=cfg.seed||11; cfg.plain=true;
  const M=b3MasterVp(),L=b3FixLoadout('tom',cfg.loadouts.tom); for(const v of B3_CAST.tom.vibes) L.vp[v]=M; cfg.loadouts.tom=L; cfg.keepLoadout=(cfg.keepLoadout||[]).concat('tom');
  B3ML.fight=big?'big':'mud';
}
function b3mlOpen() {
  B3ML.on=true; B3ML.busy=false; B3ML.idle=false; B3ML.res=null; B3ML.box=null; B3ML.msg='';
  if(B3ML.speed0==null) B3ML.speed0=B7.speed; B7.speed=1;   // times are at 1x, the speed the budgets are written for
  if(typeof b3SyncTools==='function') b3SyncTools();
  b3mlRender();
  if(!B3ML.timer) B3ML.timer=setInterval(b3mlTick,250);
}
function b3mlTick() {
  const P=document.getElementById('b3-ml');
  if(!B3ML.on||!B3.active||!B3.cfg||!B3.cfg.movelab) { if(B3ML.on) b3mlClose(); return; }
  if(P) P.hidden=false;
  const ready=b3mlCanPlay(); const was=P&&P.dataset.ready;
  if(P&&was!==String(ready)) b3mlRender();
}
function b3mlClose() {
  B3ML.on=false; clearInterval(B3ML.timer); B3ML.timer=null; if(B3ML.speed0!=null) { B7.speed=B3ML.speed0; B3ML.speed0=null; }
  const P=document.getElementById('b3-ml'); if(P) P.hidden=true;
}
// A move can be played when the deck is open (the first turn), or the Lab is idle after a move, and nothing is playing.
const b3mlCanPlay=()=>!!(B3.active&&B3.F&&!B3.F.over&&!B3ML.busy&&!B3ML.saving&&(B3ML.idle||(battle.state==='command'&&B3.ui==='deck')));

// ---------- playing a move now ----------
function b3mlRestart(big,then) {
  b3Lab(B3_LAB.findIndex(L=>L.movelab),{bigone:big});
  B3ML.idle=false;
  const t0=performance.now(),go=()=>{ if(!B3.active) return; if(battle.state==='command'&&B3.ui==='deck'||performance.now()-t0>9000) { B3ML.idle=true; then&&then(); } else setTimeout(go,150); };
  setTimeout(go,300);
}
function b3mlRefill() {
  const F=B3.F,V=B3.view;
  for(const u of F.units) { u.ko=false; u.hp=u.maxHp; if(u.side==='party') u.pep=Math.max(u.pep,9); }
  b3ViewSync(); b3RenderParty();
}
function b3mlPlay(id) {
  if(!b3mlCanPlay()) return;
  const m=b3mlMove(id); if(!m) return;
  const big=m.slot==='cap';
  B3ML.sel=id; B3ML.res=null; B3ML.box=null; B3ML.msg='';
  if((B3ML.fight==='big')!==big) { B3ML.msg='Setting up '+(big?'The Big One':'the Mudlings')+'...'; b3mlRender(); b3mlRestart(big,()=>b3mlPlay(id)); return; }
  const F=B3.F,tom=F.party.find(u=>u.id==='tom'); if(!tom) return;
  b3mlRefill(); if(typeof B3G!=='undefined') B3G.run=null;   // a run left by an earlier move is not this move's
  const S=B3_SKILLS[id],O=b3Options(F,tom,S).find(o=>!o.no);
  if(!O) { B3ML.msg='Nobody to use that on right now.'; b3mlRender(); return; }
  const r=b3Act(F,tom,id,O.key);
  if(!r.ok) { B3ML.msg=r.why; b3mlRender(); return; }
  B3.actor=null; B3.ui='busy'; battle.state='busy'; B3.look=null; B3.sheet=null; B3.note=''; B3.deck=[]; B3ML.idle=false; B3ML.busy=true;
  b3Render();
  const t0=B3P.t,R=m.row;
  b3Play(r.beats,()=>{
    B3ML.busy=false; B3ML.idle=true; B3.ui='lab'; battle.state='command'; B3.actor=null;
    const run=(typeof B3G!=='undefined'&&B3G.run&&B3G.run.id===id)?B3G.run:null;
    B3ML.res={id,staged:!!run,len:run&&run.end!=null?run.end:Math.max(0,B3P.t-t0-.6),budget:R.budget,at:run?run.hitReal:null,hitAt:run?run.hitAt:null,total:B3P.t-t0,t:Date.now()};
    B3.deck=[]; b3ViewSync(); b3Render(); b3mlRender();
  });
  b3mlRender();
}
function b3mlMonster() {
  if(!b3mlCanPlay()) return;
  const F=B3.F,f=F.foes.find(x=>!x.ko); if(!f) return;
  B3ML.busy=true; B3ML.res=null; B3ML.box=null; B3.actor=null; B3.ui='busy'; battle.state='busy'; B3.deck=[]; b3Render(); b3mlRender();
  b3Play(b3FoeTurn(F,f),()=>{ B3ML.busy=false; B3ML.idle=true; B3.ui='lab'; battle.state='command'; B3ML.msg=f.name+' acted.'; b3ViewSync(); b3Render(); b3mlRender(); });
}
function b3mlReset() { if(B3ML.busy||!B3.active) return; B3ML.res=null; B3ML.box=null; B3ML.msg=''; b3mlRestart(B3ML.fight==='big'); }

// ---------- the board: Keep, Tweak and Replace ----------
const b3mlB64=s=>btoa(unescape(encodeURIComponent(s))),b3mlU64=s=>decodeURIComponent(escape(atob(String(s).replace(/\s/g,''))));
async function b3mlGet(tok) {
  const H={Authorization:'Bearer '+(tok||'test'),Accept:'application/vnd.github+json'};
  const r=await fetch(b3mlGH()+'/repos/'+B3ML_REPO+'/contents/data/board.json?ref=main&t='+Date.now(),{cache:'no-store',headers:H});
  if(!r.ok) throw new Error('GitHub '+r.status);
  const j=await r.json(); let c=j.content||'';
  if(!c.replace(/\s/g,'')) { const b=await fetch(b3mlGH()+'/repos/'+B3ML_REPO+'/git/blobs/'+j.sha+'?t='+Date.now(),{cache:'no-store',headers:H}); if(!b.ok) throw new Error('GitHub '+b.status); c=(await b.json()).content||''; }   // over 1 MiB: the blob
  return {sha:j.sha,doc:JSON.parse(b3mlU64(c))};
}
async function b3mlSave(msg,fn) {
  const tok=b3mlToken(); if(!tok&&!new URLSearchParams(location.search).get('gh')) throw new Error('This browser has no GitHub token. Open the Board, tap the three dots and paste it there');
  for(let tries=0;;tries++) {
    const g=await b3mlGet(tok),next=fn(g.doc);
    const w=await fetch(b3mlGH()+'/repos/'+B3ML_REPO+'/contents/data/board.json',{method:'PUT',headers:{Authorization:'Bearer '+(tok||'test'),Accept:'application/vnd.github+json','Content-Type':'application/json'},
      body:JSON.stringify({message:msg,content:b3mlB64(JSON.stringify(next,null,1)+'\n'),branch:'main',sha:g.sha})});
    if(w.status===409&&tries<3) continue;
    if(!w.ok) throw new Error('GitHub '+w.status);
    return next;
  }
}
function b3mlPrompt(c) {
  const k=c.move,rep=k.kind==='replace',R=msStageRow('move:'+k.id);
  return 'Read CLAUDE.md (the rules No painted poses in battle, Fix a miss with the smallest change, and Image and video prompts), claude/move-staging-plan.md, the spec file of the move in data/moves/ and card '+c.id+' in data/board.json with its history. Your first push is the commit board: start '+c.id+'.\n\n'
   +'Tom played '+k.name+' ('+k.tier+', spec move:'+k.id+' in data/moves/) in the Move Lab (ADMIN > BATTLE LAB > NEW BATTLE > MOVE LAB: TOM) and sent '+(c.reports.length===1?'this note':'these notes')+':\n'
   +c.reports.map((n,i)=>(i+1)+'. ('+n.at.slice(0,10)+(n.build?', game build '+n.build:'')+', '+n.kind+') '+n.words).join('\n')
   +'\n\nIt ran '+(k.len!=null?k.len.toFixed(1)+' s':'(not measured)')+' against a budget of '+k.budget+' s.\n\n'
   +(rep?'Make a NEW BODY VIDEO of '+k.name+' and nothing else new: the family route of the plan (Wan 3.0 through the wan-gen Action, the job '+(((R&&R.body&&R.body.clip)||'').replace(/_/g,'-'))+' in tools/art-library/wangen-jobs.json). Start from the prompt and start picture that made the current clip and change only what the notes name; say in docs/CHANGES.md what was kept and what was changed. After it is baked, measure the marks again on the baked clip and write them into the row. Spend at most $3 and never run wangen.py yourself (wanauto1: start the run with the board commit).'
        :'TWEAK the stage of '+k.name+' and keep its body video: change only the steps, timing, sizes or words of the stage section of the spec of '+k.id+' (data/moves/, then python3 tools/movebench/bundle.py) that the notes name (the stage actions of plan section 4.1 only, no code of its own for this move). Say in docs/CHANGES.md what was kept and what was changed.')
   +' Run python3 -I tools/movestage_test.py, python3 tools/movestage_lab_test.py, python3 tools/b3_test.py s8 and python3 tools/smoke.py and look at the frames in portrait and landscape. Build tag '+c.tag+'. End with a Tom card (ask play, a jump to the Move Lab fight) whose next step is: open ADMIN > BATTLE LAB > NEW BATTLE > MOVE LAB: TOM, play '+k.name+', then Keep, Tweak or Replace; set this card\'s after to it.'+B3ML_PERM;
}
async function b3mlSend(kind,words) {
  const m=b3mlMove(B3ML.sel); if(!m) return;
  const w=b3mlClean(words); if(!w) { B3ML.msg='Write what you saw first.'; b3mlRender(); return; }
  const at=new Date().toISOString(),res=B3ML.res&&B3ML.res.id===m.id?B3ML.res:null,len=res?Math.round(res.len*10)/10:null;
  B3ML.saving=true; B3ML.msg='Sending...'; b3mlRender();
  try {
    let out=null;
    await b3mlSave('board: move '+kind+' '+m.id,d=>{
      let c=d.cards.find(k=>k.move&&k.move.id===m.id&&k.move.kind===kind&&k.lane==='claude'&&k.col==='up'&&!k.backlog&&!(k.chat&&k.chat.url)),merged=!!c;
      if(!c) {
        const ids=new Set(d.cards.map(k=>k.id)),tags=new Set(d.cards.map(k=>k.tag)),slug=m.id.replace(/_/g,'-').slice(0,28);
        let sfx=Date.now().toString(36).slice(-4),id='c-move'+kind+'-'+slug+'-'+sfx; while(ids.has(id)||tags.has(id.slice(2))) { sfx=Math.random().toString(36).slice(2,6); id='c-move'+kind+'-'+slug+'-'+sfx; }
        c={id,tag:id.slice(2),lane:'claude',col:'up',theme:'Battle Animations',title:('Move '+kind+': Tom, '+m.name).slice(0,60),next:'',blocks:[],created:b3mlToday(),changed:b3mlToday(),
          move:{id:m.id,name:m.name,tier:m.tier,kind,len,budget:m.budget},reports:[],chat:{url:'',opening:'A note sent from the Move Lab'},history:[],
          prompt:{what:(kind==='replace'?'Makes a new body video of ':'Changes the stage of ')+'Tom\'s '+m.name+' from your note and hands it back to you to play in the Move Lab.',before:['Nothing to do first. Your note is on the card.'],
            model:'Claude Opus 5.5 (row D: a move you judge by taste)',effort:'medium (one move, starting from the version that exists)',text:''}};
        d.cards.push(c);
      }
      c.move.len=len; c.reports.push({at,words:w,build:b3mlBuild(),kind}); c.changed=b3mlToday();
      c.history=(c.history||[]).concat([{d:b3mlToday(),t:'Tom, from the Move Lab ('+kind+'): '+w,at}]);
      c.prompt.text=b3mlPrompt(c);
      c.next='You sent '+(c.reports.length===1?'a note':c.reports.length+' notes')+' on '+m.name+'. Copy the prompt into a new conversation in the Project on Opus 5.5, effort medium. Latest: '+w.slice(0,160);
      out={id:c.id,merged};return d; });
    B3ML.msg=(out.merged?'Added to the open card ':'A new card is on the Board ')+'('+out.id+'). ';
    B3ML.box=null;
  } catch(e) { B3ML.msg=e.message+'. Your note was not sent.'; }
  B3ML.saving=false; b3mlRender();
}
async function b3mlKeep() {
  const m=b3mlMove(B3ML.sel),res=B3ML.res; if(!m||!res||res.id!==m.id) return;
  const at=new Date().toISOString(),len=Math.round(res.len*10)/10;
  B3ML.saving=true; B3ML.msg='Saving...'; b3mlRender();
  try {
    await b3mlSave('board: move kept '+m.id,d=>{
      const c=d.cards.find(k=>k.id===B3ML_CARD); if(!c) throw new Error('The card '+B3ML_CARD+' is not on the Board');
      c.keeps=c.keeps||{}; c.keeps[m.id]={keep:true,at,len,budget:m.budget,build:b3mlBuild()};
      c.history=(c.history||[]).concat([{d:b3mlToday(),t:'Tom, from the Move Lab: kept '+m.name+' ('+m.tier+', '+len+' s of a '+m.budget+' s budget). All good.',at}]);
      c.changed=b3mlToday(); return d; });
    B3ML.kept=Object.assign(B3ML.kept||{},{[m.id]:true}); B3ML.msg='Kept: '+m.name+'.';
  } catch(e) { B3ML.msg=e.message+'. It was not saved.'; }
  B3ML.saving=false; b3mlRender();
}

// ---------- the panel ----------
const b3mlEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function b3mlRender() {
  const app=document.getElementById('b3-app'); if(!app) return;
  let P=document.getElementById('b3-ml'); if(!P) { P=document.createElement('div'); P.id='b3-ml'; app.appendChild(P);
    P.addEventListener('click',e=>{ const b=e.target.closest('[data-ml]'); if(!b||b.disabled) return; const a=b.dataset.ml,id=b.dataset.id;
      if(a==='play') b3mlPlay(id); else if(a==='again') b3mlPlay(B3ML.sel); else if(a==='mon') b3mlMonster(); else if(a==='reset') b3mlReset();
      else if(a==='keep') b3mlKeep(); else if(a==='tweak'||a==='replace') { B3ML.box=a; B3ML.msg=''; b3mlRender(); setTimeout(()=>{ const t=document.getElementById('ml-note'); if(t) t.focus(); },30); }
      else if(a==='cancel') { B3ML.box=null; b3mlRender(); }
      else if(a==='send') b3mlSend(B3ML.box,(document.getElementById('ml-note')||{}).value); }); }
  const can=b3mlCanPlay(); P.hidden=!B3ML.on; P.dataset.ready=String(can);
  const rows=b3mlList().map(G=>'<div class="ml-g"><b>'+b3mlEsc(G.name)+'</b>'+G.moves.map(m=>{
    const on=B3ML.sel===m.id,done=B3ML.kept&&B3ML.kept[m.id],ready=typeof b3gRowFor==='function'&&b3gDefined(m.row);
    return '<button type="button" class="ml-m'+(on?' on':'')+(ready?'':' wait')+'" data-ml="play" data-id="'+m.id+'"'+(can?'':' disabled')+' title="'+b3mlEsc(m.name)+'"><i>'+b3mlEsc(m.tier)+(done?' ✓':'')+'</i><span>'+b3mlEsc(m.name)+'</span><small>'+(ready?'budget '+m.budget+' s':'video not baked yet')+'</small></button>'; }).join('')+'</div>').join('');
  const m=B3ML.sel&&b3mlMove(B3ML.sel),res=B3ML.res&&m&&B3ML.res.id===m.id?B3ML.res:null;
  let mid='';
  if(res) { const over=res.len>res.budget+.35; mid='<div class="ml-r"><b>'+b3mlEsc(m.name)+'</b>: '+(res.staged?'played <em class="'+(over?'bad':'good')+'">'+res.len.toFixed(1)+' s</em> against a budget of '+m.budget+' s':'played its old version ('+res.len.toFixed(1)+' s): the video is not baked yet')+'</div>'
    +'<div class="ml-v"><button type="button" data-ml="again"'+(can?'':' disabled')+'>PLAY AGAIN</button><button type="button" class="keep" data-ml="keep"'+(B3ML.saving?' disabled':'')+'>KEEP</button><button type="button" data-ml="tweak"'+(B3ML.saving?' disabled':'')+'>TWEAK</button><button type="button" data-ml="replace"'+(B3ML.saving?' disabled':'')+'>REPLACE</button></div>'; }
  if(B3ML.box) mid+='<div class="ml-n"><label for="ml-note">'+(B3ML.box==='replace'?'REPLACE: what should the new video do differently?':'TWEAK: what should change on the stage?')+'</label><textarea id="ml-note" rows="2" maxlength="600" placeholder="Write what you saw"></textarea>'
    +'<div class="ml-v"><button type="button" class="keep" data-ml="send"'+(B3ML.saving?' disabled':'')+'>SEND TO CLAUDE</button><button type="button" data-ml="cancel">CANCEL</button></div></div>';
  P.innerHTML='<div class="ml-h"><b>MOVE LAB: TOM</b><span>'+(B3ML.fight==='big'?'against The Big One':'against Mudlings')+'. Tap a move to play it now.</span></div>'+rows+mid
    +'<div class="ml-t"><button type="button" data-ml="mon"'+(can?'':' disabled')+'>MONSTER ACTS</button><button type="button" data-ml="reset"'+(B3ML.busy?' disabled':'')+'>RESET</button><span id="ml-msg">'+b3mlEsc(B3ML.msg)+'</span></div>';
}
window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{B3ML,b3mlPlay,b3mlMonster,b3mlList,b3mlCanPlay,b3mlReset,b3mlRestart}); });
