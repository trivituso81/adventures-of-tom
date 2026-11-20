'use strict';
// engine/art-clips.js: the Clips tab of the Art Library (art.html). Loaded by art.html BEFORE its own script; every
// function here runs later (on a tap), when art.html's helpers ($, LS, tx, RES, setMsg, ...) exist.
//
// A Library entry with a `clip` field (tools/art-library/clip-prompts.js) is a short VIDEO of a character, not a picture:
//   GENERATE  (keysecrets2) does not call xAI from this device: it commits a request to data/clip-requests.json and the clip-gen Action
//             makes the video from the entry's start picture (clip.start: the character's own battle idle frame on flat magenta),
//             finds the marks, runs the clip gate and approves it. clipPoll reads the job's report and says what happened.
//   REVIEW    the video plays in the review screen. Tom marks three moments: START (standing still, before the move),
//             HIT (the moment the hit should land) and END (back in the standing pose). ON THE BATTLEFIELD plays START
//             to END at game speed with the magenta removed over a battle background.
//             SPEED sets how many times faster than the video the clip plays in the game (the preview plays at it).
//   APPROVE   (decide() in art.html) commits the video to art/raw/clips/<id>-v<n>.mp4 with the three marks; the art-bake
//             Action cuts it into the game clip (tools/art-library/art_bake.py runs tools/clip-bake/bake_clip.py).
const CLIP_RATE={'grok-imagine-video-1.5':{'480p':.08,'720p':.14,'1080p':.25},'grok-imagine-video-1.5-lite':{'480p':.02,'720p':.03,'1080p':.14}};   // dollars per second of video (xAI list price, 2026-11)
const CLIP_FRAME=1/30, CLIP_PREVIEW_BG='bgs/01-pond-town.webp';
const clipCost=e=>((CLIP_RATE[e.clip.model]||{})[e.clip.res]||.08)*e.clip.dur+.01;   // + one input picture
const clipSrc=r=>r.blob?urlOf(r):r.url;
// clip.kind (clipkinds1): 'strike' (default) needs START, HIT and END. 'loop' (an idle that repeats) and 'state' (ends in a
// held pose, such as asleep) have no hit: START and END only.
const clipKind=r=>(r&&ENTRY[r.id]&&ENTRY[r.id].clip&&ENTRY[r.id].clip.kind)||'strike';
const clipMarks=r=>{ const m=r&&r.marks, sp=r&&r.speed?{speed:r.speed}:{}; if(!m||!(m.first>=0)) return null;
  if(clipKind(r)!=='strike') return m.last>m.first?Object.assign({first:m.first,last:m.last},sp):null;
  return m.hit>m.first&&m.last>m.hit?Object.assign({first:m.first,hit:m.hit,last:m.last},sp):null; };
// SPEED (clipspeed1): how many times faster than the video the clip plays in the game. Tom picks it in REVIEW; it is saved on
// the result, sent with the marks on APPROVE, and the bake uses it instead of the entry's own clip.speed.
const CLIP_SPEEDS=[1,1.5,2,2.5,3,4,5];
const clipSpeed=r=>(r&&r.speed)||(r&&ENTRY[r.id]&&ENTRY[r.id].clip.speed)||1;
// The game's own copy of an approved video (the Action saves it next to the approved file). Approving the same result
// again (new marks or a new speed) points at that copy, so nothing is uploaded or downloaded twice and an expired address
// does not matter.
const clipPrior=(e,r)=>{ const v=(e.versions||[]).filter(x=>x.from==='v'+r.n&&/^art\/raw\/clips\/[a-z0-9-]+\.(mp4|json)$/.test(x.file||''))[0]; return v?v.file.replace(/\.json$/,'.mp4'):''; };
const clipApproveFile=async(e,r)=>{ const prior=clipPrior(e,r); if(prior) return {ext:'.json',b64:textToB64(JSON.stringify({src:prior})+'\n')}; return r.blob?{ext:'.mp4',b64:await blobToB64(r.blob)}:{ext:'.json',b64:textToB64(JSON.stringify({url:r.url})+'\n')}; };

function clipCard(e){
  const id=esc(e.id), rs=RES[e.id]||[], blk=blockInfo(e), ed=EDITS[e.id]!==undefined&&EDITS[e.id]!==e.prompt, c=e.clip, pend=clipAsked(e.id);
  const apr=n=>(e.versions||[]).some(v=>v.from==='v'+n), rjc=n=>(e.rejects||[]).some(v=>v.from==='v'+n);
  return '<div class="card" data-id="'+id+'">'+
  (blk?'<div class="blk">Blocked. '+esc(blk.why)+'</div>':'')+
  '<label>Start picture (first frame of the video, made from the battle sprite)</label><div class="refs"><div class="ref"><img src="'+esc(c.start)+'" data-path="'+esc(c.start)+'" alt="" onerror="refMiss(this)">'+esc(c.start.split('/').pop())+'</div></div>'+
  '<details class="pr" data-po="'+id+'"'+(UI.po[e.id]?' open':'')+'><summary>Prompt'+(ed?' <span class="chip c-wait">edited</span>':'')+' <span class="hint" style="font-weight:400">tap to read or edit</span></summary><div class="pin">'+(ed?'<button class="small" data-revert="'+id+'">Use the default prompt</button> <span class="hint">(this box holds your own edit, saved on this device)</span>':'<span class="hint">Edit here, it is sent as written.</span>')+'<textarea data-prompt="'+id+'">'+esc(promptOf(e))+'</textarea></div></details>'+
  '<div class="row"><button class="gold" data-gen="'+id+'"'+(blk?' disabled':'')+'>'+(pend?'ASKED, WAITING':'GENERATE VIDEO')+'</button><span class="hint">'+(pend?'Waiting for GitHub.':c.dur+' second video, '+c.res+', about $'+clipCost(e).toFixed(2)+'. GitHub makes it, checks it and approves it (3 to 6 minutes).')+'</span></div>'+
  '<div class="'+(MSG[e.id]&&MSG[e.id].err?'err':'hint')+'" id="m-'+id+'">'+esc(MSG[e.id]?MSG[e.id].text:'')+'</div>'+
  (rs.length?'<div class="hint">'+(c.test?'Tap REVIEW to watch it, then approve or reject. No marks needed.':(c.kind&&c.kind!=='strike'?'Tap REVIEW to mark the start and the end, then approve or reject.':'Tap REVIEW to mark the start, the hit and the end, then approve or reject.'))+'</div>':'')+
  '<div class="res">'+rs.map(r=>'<div><video class="clipthumb" src="'+esc(clipSrc(r))+'#t=0.1" muted playsinline preload="metadata"></video><span>v'+r.n+'</span>'+(apr(r.n)?' <span class="chip c-approved">approved</span>':rjc(r.n)?' <span class="chip c-rejected">rejected</span>':'')+(r.blob?'':' <span class="chip c-wait">address only</span>')+' <button class="small" data-res="'+esc(r.key)+'">REVIEW</button></div>').join('')+'</div>'+
  ((e.versions||[]).length?'<div class="hint ok">Approved: '+e.versions.map(v=>esc(v.file)).join(', ')+'</div>':'')+
  ((e.rejects||[]).length?'<div class="hint">Rejected before: '+e.rejects.length+' (notes are saved for Claude)</div>':'')+'</div>';
}

// ---- keysecrets2: GENERATE VIDEO and GENERATE CHAPTER do not call xAI from this device. Each commits a request to data/clip-requests.json
// ("clip: generate <id or group>"); the clip-gen Action (repo secret XAI_API_KEY) makes the video, finds the marks, runs the clip gate, approves it and
// starts the bake, then keeps its report on branch clipgen. clipPoll reads that report and tells Tom what happened to each press.
const CLIP_REQ_PATH='data/clip-requests.json', CLIP_ASKED='aot-clip-asked', CLIP_HARD_CAP=40;
const clipGenBase=()=> (Q.get('clipgen')||'https://raw.githubusercontent.com/trivituso81/adventures-of-tom/clipgen').replace(/\/+$/,'')+'/';
const clipAskedGet=()=>{ try{ return (JSON.parse(LS.get(CLIP_ASKED)||'[]')||[]).filter(p=>p&&p.at&&Date.now()-p.at<180*60000); }catch(x){ return []; } };
const clipAskedSet=a=>LS.set(CLIP_ASKED,JSON.stringify(a));
let CLIP_POLL=0;
const clipAsked=id=>clipAskedGet().some(p=>(p.ids||[]).includes(id));
const clipCap=n=>Math.min(CLIP_HARD_CAP,Math.max(1,Math.ceil(n*1.2)));
async function clipReqSend(req){
  if(!LS.get('aot-gh-token')) throw new Error('Open Setup at the top and paste the GitHub token first: videos are made on GitHub, and the token is how this page asks.');
  await commitRequest(req,CLIP_REQ_PATH,'clip: generate ');
  clipAskedSet(clipAskedGet().concat([{ids:req.id?[req.id]:req.ids,group:req.group||'',at:req.at}]));
  if(!CLIP_POLL) CLIP_POLL=setTimeout(clipPoll,POLL_MS);
}
async function clipGenerate(id,btn){
  const e=ENTRY[id], blk=blockInfo(e);
  if(!LS.get('aot-gh-token')) return setMsg(id,'Open Setup at the top and paste the GitHub token first: videos are made on GitHub, and the token is how this page asks.',true);
  if(blk) return setMsg(id,blk.why,true);
  const prompt=(promptOf(e)||'').trim(); if(!prompt) return setMsg(id,'The prompt is empty.',true);
  if(e.status==='approved') return setMsg(id,'This clip is already approved. Reject it first (Battle Lab REVIEW) to make another.',true);
  btn.disabled=true; setMsg(id,'Sending the request to GitHub...');
  try{
    await clipReqSend({id,prompt,cap:clipCap(clipCost(e)),at:Date.now()});
    MSG[id]={text:'Asked. GitHub makes the video, checks it and approves it (about 3 to 6 minutes); you can close the page. This message updates by itself.',err:false}; refreshItem(id);
  }catch(err){ setMsg(id,String(err.message||err),true); btn.disabled=false; }
}
// Every POLL_MS while a press is waiting: read the job's report and say what happened to each clip that was asked for.
async function clipPoll(){
  CLIP_POLL=0; const P=clipAskedGet(); if(!P.length) return;
  let rep=null; try{ const r=await fetch(clipGenBase()+'clipgen-report.json?t='+Date.now(),{cache:'no-store'}); if(r.ok) rep=await r.json(); }catch(x){}
  const repAt=rep&&rep.at?Date.parse(rep.at):0, left=[];
  for(const p of P){
    const mine=rep&&rep.mode==='requests'&&repAt>=p.at-120000&&(p.ids||[]).some(i=>(rep.asked||[]).includes(i));
    if(!mine){ left.push(p); continue; }
    const why=(rep.failed||[]).find(x=>x.id==='*');
    for(const id of p.ids||[]){
      const f=(rep.failed||[]).find(x=>x.id===id)||why, h=(rep.held||[]).find(x=>x.id===id), b=(rep.blocked||[]).find(x=>x.id===id), s=(rep.skipped||[]).find(x=>x.id===id);
      let m;
      if((rep.approved||[]).includes(id)){ m={text:'Made and approved. The game is cutting it now (about 3 minutes, then RELOAD on the title screen).',err:false}; if(ENTRY[id]) ENTRY[id].status='approved'; }
      else if(h) m={text:'Made, but the clip gate held it back (not approved): '+(h.reasons||[]).join(' | ').slice(0,300),err:true};
      else if((rep.still||[]).includes(id)) m={text:'Made, but the video hardly moves, so its marks could not be found. It is kept for Claude; nothing was approved.',err:true};
      else if(f) m={text:'Not made: '+f.why,err:true};
      else if(b) m={text:'Not made: '+b.why,err:true};
      else if(s) m={text:'Skipped: '+s.why,err:true};
      else if((rep.queued||[]).includes(id)) m={text:'The job ended before this one was done. Press GENERATE VIDEO again; a video already paid for is not charged twice.',err:true};
      else continue;
      MSG[id]=m; if(ENTRY[id]) refreshItem(id);
    }
    if(p.group){ const n=(p.ids||[]).filter(i=>(rep.approved||[]).includes(i)).length; clipBatchSay(p.group,'Finished: '+n+' of '+(p.ids||[]).length+' clip(s) approved by the job'+((rep.failed||[]).length?'; '+rep.failed.length+' failed':'')+((rep.held||[]).length?'; '+rep.held.length+' held by the gate':'')+((rep.still||[]).length?'; '+rep.still.length+' hardly move':'')+'. Spent about $'+(+rep.spent||0).toFixed(2)+'. The game is cutting the approved ones now (about 3 minutes, then a RELOAD on the title screen; they show in Battle Lab > '+p.group.toUpperCase()+' REVIEW).',(rep.failed||[]).length>0||(rep.held||[]).length>0||(rep.still||[]).length>0); }
  }
  clipAskedSet(left); if(left.length) CLIP_POLL=setTimeout(clipPoll,POLL_MS);
}

// ---- GENERATE CHAPTER (clipbatch1): a whole chapter's clips as one batch
// A group of the Clips tab named "Chapter <n>" gets a GENERATE CHAPTER button (keysecrets2: it asks the clip-gen Action, see above). The job makes every clip of the group that is not made yet,
// finds its marks from the video (tools/art-library/clipmarks.py), runs the clip gate and approves it, so the art-bake Action cuts the clip. Tom then watches the chapter once in Battle Lab > CHAPTER <n> REVIEW and sends REDO for what looks wrong.
const clipChapterGroup=g=>/^Chapter \d+$/.test(g||'');
// A rejected entry is made again only after its prompt was rewritten since the rejection (promptRev went up): the same prompt would only
// cost money to fail the same way. A rejection with no revision on record (made in the Library before clipbatch1) counts as ready.
const clipRedoReady=e=>{ const r=(e.rejects||[]).slice(-1)[0]; return !r||r.rev==null||(e.promptRev||0)>r.rev; };
function clipBatchItems(g){
  const all=(groupsOf('Clips').get(g)||[]).filter(e=>e.clip&&!e.clip.test), o={all,todo:[],redo:[],redoWait:[],wait:[],blocked:[],approved:0};
  for(const e of all){ const s=ST[e.id]; if(s==='approved') o.approved++; else if(s==='blocked') o.blocked.push(e); else if(s==='wait') o.wait.push(e); else if(s==='rejected') (clipRedoReady(e)?o.redo:o.redoWait).push(e); else o.todo.push(e); }
  return o;
}
const CB={run:null,msg:{}};   // run: the batch that is going; msg[group]: the last line for that group's bar
function clipBatchText(g){
  const b=clipBatchItems(g), est=[].concat(b.todo,b.redo).reduce((t,e)=>t+clipCost(e),0);
  const bits=[b.todo.length+' to make',b.redo.length?b.redo.length+' to redo':'',b.wait.length?b.wait.length+' made, waiting for marks':'',b.redoWait.length?b.redoWait.length+' redo waiting for Claude\'s fix':'',b.blocked.length?b.blocked.length+' blocked':'',b.approved+' of '+b.all.length+' approved'].filter(Boolean);
  return bits.join(', ')+(est?'. About $'+est.toFixed(2)+' for the ones to make.':'.');
}
function clipBatchBar(g){
  const run=CB.run&&CB.run.g===g, m=CB.msg[g]||{text:'',err:false};
  return '<div class="card cbar" data-cb="'+esc(g)+'"><div class="row"><button class="gold" data-batch="'+esc(g)+'"'+(CB.run?' disabled':'')+'>'+(run?'ASKING GITHUB...':'GENERATE '+esc(g.toUpperCase()))+'</button></div>'+
    '<div class="hint">'+esc(clipBatchText(g))+'</div><div class="'+(m.err?'err':'hint')+'" data-cbmsg>'+esc(m.text)+'</div></div>';
}
function clipBatchPaint(g){ const el=findBy('.cbar','cb',g); if(!el) return; const tmp=document.createElement('div'); tmp.innerHTML=clipBatchBar(g); el.replaceWith(tmp.firstElementChild); }
function clipBatchSay(g,text,err){ CB.msg[g]={text,err:!!err}; clipBatchPaint(g); }
// One clip, end to end: make it (unless a result is already waiting), find its marks, write them to the result, approve it.
async function clipBatchStart(g){
  if(!LS.get('aot-gh-token')) return clipBatchSay(g,'Open Setup at the top and paste the GitHub token first.',true);
  computeStates(); const b=clipBatchItems(g), queue=[].concat(b.todo,b.redo);
  if(!queue.length) return clipBatchSay(g,b.wait.length?b.wait.length+' video(s) are waiting for marks in REVIEW; the job approves new ones by itself.':b.redoWait.length?'Nothing to make yet: the '+b.redoWait.length+' clip(s) you sent back wait for Claude\'s fix (it rewrites their prompts).':b.blocked.length?'Nothing can start: '+b.blocked.length+' clip(s) wait on a start picture that is not published yet.':'Everything in this chapter is approved.');
  const need=queue.reduce((t,e)=>t+clipCost(e),0);
  if(need>CLIP_HARD_CAP) return clipBatchSay(g,'This batch needs about $'+need.toFixed(2)+'; one request is limited to $'+CLIP_HARD_CAP+'. Ask for part of it with GENERATE VIDEO on single clips first.',true);
  CB.run={g}; clipBatchPaint(g);
  try{
    await clipReqSend({group:g,ids:queue.map(e=>e.id),cap:clipCap(need),at:Date.now()});
    CB.run=null; clipBatchSay(g,'Asked for '+queue.length+' video(s), about $'+need.toFixed(2)+'. GitHub makes them (a chapter takes 10 to 30 minutes), approves each one by itself and starts the cutting. You can close the page; this line updates when the job is done.');
  }catch(err){ CB.run=null; clipBatchSay(g,String(err.message||err),true); }
}


// ---- review screen: the video, a frame slider, three marks, and the battlefield preview
const CV={r:null,raf:0,bg:null,on:false,loop:0};
const cg=id=>document.getElementById(id);
const clipT=t=>t==null||t<0?'not set':t.toFixed(2)+' s';
function clipRvSetup(){
  if(cg('rvvid')) return;
  // #clipkey: a colour filter that makes flat magenta see-through (alpha = 6G - 3R - 3B + 4.5, cut to 0..1). Used by the
  // battlefield preview for a video the browser may show but not read (address only), where a canvas cannot key it.
  cg('rvstage').insertAdjacentHTML('beforeend','<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="clipkey" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -3 6 -3 0 4.5"/></filter></svg><video id="rvvid" muted playsinline preload="auto" hidden></video><canvas id="rvcan" hidden></canvas>');
  cg('rvnote').insertAdjacentHTML('beforebegin','<div id="cliptools" hidden>'+
    '<div class="row cliprow"><button class="small" id="cpb" aria-label="One frame back">&lsaquo; frame</button><input type="range" id="cps" min="0" max="3" step="0.0333" value="0" aria-label="Position in the video"><button class="small" id="cpf" aria-label="One frame forward">frame &rsaquo;</button></div>'+
    '<div class="row cliprow"><button class="small" id="cpplay">PLAY</button><span class="hint" id="cpt"></span><button class="small forgame" id="cpbf">ON THE BATTLEFIELD</button></div>'+
    '<div class="hint ok" id="clipstudy" hidden>Test video for Claude. Watch it, then APPROVE to save it (no marks needed) or REJECT with a note. Nothing changes in the game.</div>'+
    '<div class="hint forgame">Speed in the game (times faster than the video):</div><div class="row cliprow speed forgame">'+CLIP_SPEEDS.map(x=>'<button class="small" data-speed="'+x+'">'+x+'x</button>').join('')+'</div>'+
    '<div class="hint forgame">Move to a moment, then tap what it is:</div>'+
    '<div class="row cliprow marks forgame"><button class="small" data-mark="first">START<br><span></span></button><button class="small" data-mark="hit">HIT<br><span></span></button><button class="small" data-mark="last">END<br><span></span></button></div>'+
    '<div class="hint forgame" id="cliphelp"></div></div>');
  const v=cg('rvvid'), s=cg('cps');
  const seek=t=>{ clipBf(false); v.pause(); v.currentTime=Math.max(0,Math.min((v.duration||+s.max)-.01,t)); };
  s.addEventListener('input',()=>seek(+s.value));
  cg('cpb').onclick=()=>seek(v.currentTime-CLIP_FRAME); cg('cpf').onclick=()=>seek(v.currentTime+CLIP_FRAME);
  cg('cpplay').onclick=()=>{ clipBf(false); if(v.paused){ if(v.currentTime>=(v.duration||0)-.05) v.currentTime=0; v.playbackRate=1; v.play(); } else v.pause(); };
  cg('cpbf').onclick=()=>clipBf(!CV.on);
  v.addEventListener('loadedmetadata',()=>{ s.max=String(v.duration||3); clipPaintMarks(); });
  v.addEventListener('timeupdate',()=>{ if(!CV.on) s.value=String(v.currentTime); cg('cpt').textContent=v.currentTime.toFixed(2)+' of '+(v.duration||0).toFixed(2)+' s'; });
  v.addEventListener('play',()=>cg('cpplay').textContent='PAUSE'); v.addEventListener('pause',()=>cg('cpplay').textContent='PLAY');
  cg('cliptools').addEventListener('click',async ev=>{ const sp=ev.target.closest('[data-speed]');
    if(sp&&CV.r){ CV.r.speed=+sp.dataset.speed; await tx('readwrite',st=>st.put(CV.r)); clipPaintMarks(); if(CV.on) v.playbackRate=CV.r.speed; return; }
    const b=ev.target.closest('[data-mark]'); if(!b||!CV.r) return;
    const r=CV.r; r.marks=Object.assign({first:-1,hit:-1,last:-1},r.marks||{}); r.marks[b.dataset.mark]=Math.round(v.currentTime*1000)/1000;
    await tx('readwrite',st=>st.put(r)); clipPaintMarks(); });
}
function clipPaintMarks(){
  const m=(CV.r&&CV.r.marks)||{}, ok=!!clipMarks(CV.r);
  document.querySelectorAll('#cliptools [data-mark]').forEach(b=>{ const t=m[b.dataset.mark]; b.querySelector('span').textContent=clipT(t); b.classList.toggle('set',t>=0); });
  const kind=clipKind(CV.r), hb=document.querySelector('#cliptools [data-mark="hit"]'); if(hb) hb.hidden=kind!=='strike';
  cg('cliphelp').textContent=kind==='loop'?'Pick a calm stretch. START: where it begins. END: where it ends. The game plays it forward, then backward, so it never jumps.':kind==='state'?'START: standing still, just before it begins. END: the pose that stays (the game holds this picture).':'START: standing still, just before the move. HIT: the moment the hit should land. END: back to standing.';
  const set=m.first>=0&&m.last>=0&&(kind!=='strike'||m.hit>=0);
  if(CV.r&&rvId()===CV.r.id&&set&&!ok) setMsg(CV.r.id,kind==='strike'?'The marks are out of order: START must come before HIT, and HIT before END.':'The marks are out of order: START must come before END.',true);
  else if(CV.r&&MSG[CV.r.id]&&/marks/.test(MSG[CV.r.id].text)) setMsg(CV.r.id,'');
  cg('cpbf').disabled=!ok;
  const spd=clipSpeed(CV.r); document.querySelectorAll('#cliptools [data-speed]').forEach(b=>b.classList.toggle('set',+b.dataset.speed===spd));
}
// Called by rvDraw (art.html) for every entry: shows the video tools for a clip result, hides them for a picture.
function clipRvDraw(e,r){
  clipRvSetup(); clipBf(false);
  const isClip=!!(e&&e.clip&&r), v=cg('rvvid');
  cg('rvimg').hidden=isClip; v.hidden=!isClip; cg('cliptools').hidden=!isClip; cg('rvcan').hidden=true;
  if(!isClip){ v.pause(); v.removeAttribute('src'); CV.r=null; return; }
  const study=!!e.clip.test; document.querySelectorAll('#cliptools .forgame').forEach(x=>x.hidden=study); cg('clipstudy').hidden=!study;   // a study video: no marks, no speed
  CV.r=r; const src=clipSrc(r); if(v.getAttribute('src')!==src){ v.src=src; v.load(); }
  v.pause(); clipPaintMarks();
  // An approved video this device holds only as an address: fetch the game's own copy (same site, so it can be kept) and use it from now on.
  const prior=!r.blob&&clipPrior(e,r);
  if(prior) fetch(rawU(prior),{cache:'no-store'}).then(x=>x.ok?x.blob():null).then(async b=>{ if(!b||b.size<1000||r.blob) return; r.blob=new Blob([b],{type:'video/mp4'}); r.url=''; await tx('readwrite',st=>st.put(r)); if(CV.r===r){ clipBf(false); v.src=clipSrc(r); v.load(); clipPaintMarks(); } }).catch(()=>{});
}
function clipRvStop(){ clipBf(false); const v=cg('rvvid'); if(v) v.pause(); }
// ON THE BATTLEFIELD: START to END, looping, at the game's speed, magenta removed, over a battle background. A look at
// the cutout and the timing only; the real cut (edge clean-up, size, shadow) is made by the baker after APPROVE.
function clipBf(on){
  const v=cg('rvvid'), can=cg('rvcan'); if(!v||!can) return;
  const stg=cg('rvstage');
  cancelAnimationFrame(CV.raf); if(CV.on){ v.pause(); v.playbackRate=1; } CV.on=false; can.hidden=true; if(cg('cpbf')) cg('cpbf').textContent='ON THE BATTLEFIELD';
  v.style.filter=''; stg.style.backgroundImage='';
  if(!on){ if(!v.hidden) v.style.opacity=''; return; }
  const m=clipMarks(CV.r), e=ENTRY[CV.r.id]; if(!m) return;
  CV.on=true; cg('cpbf').textContent='BACK TO THE VIDEO';
  if(!CV.r.blob){   // address only: the video itself is shown through the magenta filter over the background picture
    v.style.filter='url(#clipkey)'; stg.style.backgroundImage='url('+CLIP_PREVIEW_BG+')'; stg.style.backgroundSize='cover'; stg.style.backgroundPosition='center';
    v.currentTime=m.first; v.playbackRate=clipSpeed(CV.r); v.play();
    const loop=()=>{ if(!CV.on) return; if(v.currentTime>=m.last||v.paused||v.ended){ v.currentTime=m.first; v.play(); } CV.raf=requestAnimationFrame(loop); };
    CV.raf=requestAnimationFrame(loop); return;
  }
  can.hidden=false; v.style.opacity='0';
  if(!CV.bg){ CV.bg=new Image(); CV.bg.src=CLIP_PREVIEW_BG; }
  const W=can.width=640, H=can.height=480, g=can.getContext('2d'), off=document.createElement('canvas'), og=off.getContext('2d',{willReadFrequently:true});
  v.currentTime=m.first; v.playbackRate=clipSpeed(CV.r); v.play();
  const draw=()=>{ if(!CV.on) return;
    if(v.currentTime>=m.last||v.paused||v.ended){ v.currentTime=m.first; v.play(); }
    const vw=v.videoWidth, vh=v.videoHeight;
    if(vw&&vh){
      off.width=vw; off.height=vh; og.drawImage(v,0,0);
      let d; try{ d=og.getImageData(0,0,vw,vh); }catch(x){ clipBf(false); return; }
      const a=d.data, br=a[0], bgc=a[1], bb=a[2];
      for(let i=0;i<a.length;i+=4){ const dr=a[i]-br, dg=a[i+1]-bgc, db=a[i+2]-bb, q=Math.sqrt(dr*dr+dg*dg+db*db); a[i+3]=q<60?0:q>120?255:(q-60)*4.25; }
      og.putImageData(d,0,0);
      g.fillStyle='#1b2a1e'; g.fillRect(0,0,W,H); if(CV.bg.complete&&CV.bg.naturalWidth) g.drawImage(CV.bg,0,0,W,H);
      const sc=H*.62/vh, dw=vw*sc, dh=vh*sc; g.drawImage(off,W*.62-dw*.55,H*.93-dh*.85,dw,dh);   // start picture: feet at 85 percent, middle at 55 percent
    }
    CV.raf=requestAnimationFrame(draw); };
  CV.raf=requestAnimationFrame(draw);
}
document.addEventListener('DOMContentLoaded',()=>{ const st=document.createElement('style');
  st.textContent='.clipthumb{width:100%;aspect-ratio:4/3;object-fit:contain;background:#0f0d24;border:1px solid #3a3566;border-radius:8px;display:block;margin-bottom:4px}'+
  '#rvvid,#rvcan{width:100%;height:100%;object-fit:contain}#rvcan{position:absolute;inset:0}'+
  '.cliprow{display:flex;gap:8px;align-items:center;margin:4px 0}.cliprow input[type=range]{flex:1;min-width:0;height:36px}.cliprow .hint{flex:1;text-align:center}'+
  '#cliptools [hidden]{display:none!important}.cliprow.speed{gap:4px}.cliprow.speed button{flex:1;min-width:0;min-height:40px;padding:4px 0}.cliprow.speed button.set{border-color:#a89dff;background:#7b6cff;color:#fff}'+
  '.cliprow.marks button{flex:1;min-height:48px;line-height:1.25}.cliprow.marks button span{font-weight:400;font-size:12px}.cliprow.marks button.set{border-color:#2f9e63;background:#143524}';
  document.head.appendChild(st); });
