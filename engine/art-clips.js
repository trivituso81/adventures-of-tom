'use strict';
// engine/art-clips.js: the Clips tab of the Art Library (art.html). Loaded by art.html BEFORE its own script; every
// function here runs later (on a tap), when art.html's helpers ($, LS, XAI_BASE, tx, RES, setMsg, ...) exist.
//
// A Library entry with a `clip` field (tools/art-library/clip-prompts.js) is a short VIDEO of a character, not a picture:
//   GENERATE  sends the entry's start picture (clip.start: the character's own battle idle frame on flat magenta) as the
//             first frame to the xAI video API (POST /v1/videos/generations, then GET /v1/videos/<request_id> every 5 s).
//             The request id is kept in localStorage ('aot-clip-pending') until the video is in, so closing the page or a
//             dropped connection does not pay twice: GENERATE picks the same request up again.
//   REVIEW    the video plays in the review screen. Tom marks three moments: START (standing still, before the move),
//             HIT (the moment the hit should land) and END (back in the standing pose). ON THE BATTLEFIELD plays START
//             to END at game speed with the magenta removed over a battle background.
//             SPEED sets how many times faster than the video the clip plays in the game (the preview plays at it).
//   APPROVE   (decide() in art.html) commits the video to art/raw/clips/<id>-v<n>.mp4 with the three marks; the art-bake
//             Action cuts it into the game clip (tools/art-library/art_bake.py runs tools/clip-bake/bake_clip.py).
// If the browser may not download the finished video (the video host blocks it), the result keeps only its address:
// it still plays and can be marked and approved (the Action downloads it), but the address expires, so approve soon.
const CLIP_RATE={'grok-imagine-video-1.5':{'480p':.08,'720p':.14,'1080p':.25},'grok-imagine-video-1.5-lite':{'480p':.02,'720p':.03,'1080p':.14}};   // dollars per second of video (xAI list price, 2026-11)
const CLIP_FRAME=1/30, CLIP_PREVIEW_BG='bgs/01-pond-town.webp';
const clipCost=e=>((CLIP_RATE[e.clip.model]||{})[e.clip.res]||.08)*e.clip.dur+.01;   // + one input picture
const clipPend={get(){ try{ return JSON.parse(LS.get('aot-clip-pending')||'{}')||{}; }catch(x){ return {}; } }, set(o){ LS.set('aot-clip-pending',JSON.stringify(o)); }};
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
  const id=esc(e.id), rs=RES[e.id]||[], blk=blockInfo(e), ed=EDITS[e.id]!==undefined&&EDITS[e.id]!==e.prompt, c=e.clip, pend=clipPend.get()[e.id];
  const apr=n=>(e.versions||[]).some(v=>v.from==='v'+n), rjc=n=>(e.rejects||[]).some(v=>v.from==='v'+n);
  return '<div class="card" data-id="'+id+'">'+
  (blk?'<div class="blk">Blocked. '+esc(blk.why)+'</div>':'')+
  '<label>Start picture (first frame of the video, made from the battle sprite)</label><div class="refs"><div class="ref"><img src="'+esc(c.start)+'" data-path="'+esc(c.start)+'" alt="" onerror="refMiss(this)">'+esc(c.start.split('/').pop())+'</div></div>'+
  '<details class="pr" data-po="'+id+'"'+(UI.po[e.id]?' open':'')+'><summary>Prompt'+(ed?' <span class="chip c-wait">edited</span>':'')+' <span class="hint" style="font-weight:400">tap to read or edit</span></summary><div class="pin">'+(ed?'<button class="small" data-revert="'+id+'">Use the default prompt</button> <span class="hint">(this box holds your own edit, saved on this device)</span>':'<span class="hint">Edit here, it is sent as written.</span>')+'<textarea data-prompt="'+id+'">'+esc(promptOf(e))+'</textarea></div></details>'+
  '<div class="row"><button class="gold" data-gen="'+id+'"'+(blk?' disabled':'')+'>'+(pend?'FETCH THE VIDEO':'GENERATE VIDEO')+'</button><span class="hint">'+(pend?'A video is already being made for this. No new charge.':c.dur+' second video, '+c.res+', about $'+clipCost(e).toFixed(2)+' each. Takes 1 to 3 minutes.')+'</span></div>'+
  '<div class="'+(MSG[e.id]&&MSG[e.id].err?'err':'hint')+'" id="m-'+id+'">'+esc(MSG[e.id]?MSG[e.id].text:'')+'</div>'+
  (rs.length?'<div class="hint">'+(c.test?'Tap REVIEW to watch it, then approve or reject. No marks needed.':(c.kind&&c.kind!=='strike'?'Tap REVIEW to mark the start and the end, then approve or reject.':'Tap REVIEW to mark the start, the hit and the end, then approve or reject.'))+'</div>':'')+
  '<div class="res">'+rs.map(r=>'<div><video class="clipthumb" src="'+esc(clipSrc(r))+'#t=0.1" muted playsinline preload="metadata"></video><span>v'+r.n+'</span>'+(apr(r.n)?' <span class="chip c-approved">approved</span>':rjc(r.n)?' <span class="chip c-rejected">rejected</span>':'')+(r.blob?'':' <span class="chip c-wait">address only</span>')+' <button class="small" data-res="'+esc(r.key)+'">REVIEW</button></div>').join('')+'</div>'+
  ((e.versions||[]).length?'<div class="hint ok">Approved: '+e.versions.map(v=>esc(v.file)).join(', ')+'</div>':'')+
  ((e.rejects||[]).length?'<div class="hint">Rejected before: '+e.rejects.length+' (notes are saved for Claude)</div>':'')+'</div>';
}

// clipMake (clipbatch1): makes one video and keeps it as the entry's newest result. GENERATE VIDEO (clipGenerate) and GENERATE CHAPTER
// (clipBatchStart) both call it; it throws an Error with a plain message when it cannot, and `say` shows progress.
async function clipMake(id,say){
  say=say||((t,err)=>setMsg(id,t,err));
  const e=ENTRY[id], c=e.clip, key=LS.get('aot-art-key');
  if(!key) throw new Error('Paste the xAI key at the top first.');
  if(!DB) throw new Error('This browser would not keep the video.');
  const blk=blockInfo(e); if(blk) throw new Error(blk.why);
  const hdr={'Content-Type':'application/json',Authorization:'Bearer '+key}, clean=t=>String(t).split(key).join('[key]').slice(0,300);
  const unreachable='The browser could not reach the video service. Either the network is down or the service blocks browsers; if it is the second, a relay address is needed (the Relay field at the top).';
  let P=clipPend.get(), p=P[id];
  {
    if(!p){
      const prompt=(promptOf(e)||'').trim(); if(!prompt) throw new Error('The prompt is empty.');
      const cost=clipCost(e), o=spendGet(); if(o.total+cost>o.cap) throw Object.assign(new Error('Spend cap reached ($'+o.cap.toFixed(0)+'). Press +$10 at the top to allow more.'),{stop:true});
      say('Sending the start picture...');
      let sr=await fetch(c.start,{cache:'no-store'}), sb=null; if(sr.ok) sb=await sr.blob(); else if(LS.get('aot-gh-token')){ try{ sb=await ghFile(c.start); }catch(x){} }
      if(!sb) throw new Error('Could not load the start picture '+c.start+'.');
      let r; try{ r=await fetch(XAI_BASE()+'/v1/videos/generations',{method:'POST',headers:hdr,body:JSON.stringify({model:c.model,prompt,image:{url:await blobToDataUri(sb)},duration:c.dur,resolution:c.res})}); }catch(err){ throw new Error(unreachable); }
      const txt=await r.text(); let j=null; try{ j=JSON.parse(txt); }catch(x){}
      if(!r.ok) throw new Error('The video service said '+r.status+': '+clean(txt));
      if(!j||!j.request_id) throw new Error('The video service gave no request number: '+clean(txt));
      p={rid:j.request_id,t:Date.now(),prompt,cost}; P=clipPend.get(); P[id]=p; clipPend.set(P);
      { const o2=spendGet(); o2.total+=cost; o2.count+=1; LS.set('aot-art-spend',JSON.stringify(o2)); spendPaint(); }
    }
    let url='';
    for(let i=0;i<150&&!url;i++){   // 5 s apart, up to 12 minutes
      say('The video is being made ('+Math.round((Date.now()-p.t)/1000)+' s so far, usually 1 to 3 minutes). Keep this page open.');
      await new Promise(res=>setTimeout(res,i?5000:1500));
      let r; try{ r=await fetch(XAI_BASE()+'/v1/videos/'+encodeURIComponent(p.rid),{headers:{Authorization:'Bearer '+key},cache:'no-store'}); }catch(err){ continue; }   // a dropped connection: try again
      const txt=await r.text(); let j=null; try{ j=JSON.parse(txt); }catch(x){}
      if(r.status===401||r.status===403) throw Object.assign(new Error('The video service refused the key ('+r.status+'). Press FETCH THE VIDEO after fixing the key; the video is not lost.'),{stop:true});
      const st=j&&j.status, v=j&&(j.video||(j.response&&j.response.video));
      if(v&&v.url){ url=v.url; break; }
      if(st==='failed'||st==='expired'||r.status===404||(r.status>=400&&r.status<500&&r.status!==429)){
        P=clipPend.get(); delete P[id]; clipPend.set(P);
        throw new Error('The video service could not make this video ('+(st||r.status)+'): '+clean(txt)+' Press GENERATE VIDEO to try again.');
      }
    }
    if(!url) throw new Error('The video is still not ready after 12 minutes. Press FETCH THE VIDEO in a few minutes; it will not be charged again.');
    say('Downloading the video...');
    let blob=null; try{ const vr=await fetch(url); if(vr.ok) blob=await vr.blob(); }catch(err){}
    const have=await results(id), n=(have[0]?have[0].n:0)+1;
    await tx('readwrite',s=>s.put({key:id+'|'+n,id,n,blob,url:blob?'':url,video:true,prompt:p.prompt,refs:[c.start],t:Date.now()}));
    for(const old of have.slice(KEEP-1)) await tx('readwrite',s=>s.delete(old.key));
    P=clipPend.get(); delete P[id]; clipPend.set(P);
    RES[id]=await results(id); e.status='generated';
    MSG[id]={text:'Done: v'+n+'. Tap REVIEW.'+(blob?'':' This browser was not allowed to keep a copy, so approve or reject it within the hour.'),err:false}; refreshItem(id);
    return n;
  }
}
async function clipGenerate(id,btn){
  btn.disabled=true;
  try{ await clipMake(id); }
  catch(err){ setMsg(id,String(err.message||err),true); btn.disabled=false; if(clipPend.get()[id]) btn.textContent='FETCH THE VIDEO'; }
}

// ---- GENERATE CHAPTER (clipbatch1): a whole chapter's clips as one batch
// A group of the Clips tab named "Chapter <n>" gets a GENERATE CHAPTER button. It makes every clip of the group that is not made yet,
// cuts its marks by itself (clipAutoMarks), writes them to the result as if Tom had marked them, and approves it (decide, auto), so
// the art-bake Action cuts the clip. Tom then watches the chapter once in Battle Lab > CHAPTER <n> REVIEW and sends REDO for what looks wrong.
const CLIP_FPS=30, CLIP_PAR=3, CLIP_HOLD=15;   // CLIP_PAR: videos being made at once (each takes 1 to 3 minutes; the spend cap is checked before each is sent)
const r3=x=>Math.round(x*1000)/1000;
const clipSeek=(v,t)=>new Promise(res=>{ let done=false; const f=()=>{ if(done) return; done=true; v.removeEventListener('seeked',f); res(); }; v.addEventListener('seeked',f); v.currentTime=t; setTimeout(f,4000); });
// The picture's figure: everything that is not the flat magenta (the median colour of the four corners). 128 wide is plenty to see a limb move.
function clipMask(d,W,H){
  const ch=[[],[],[]], pt=(x0,y0)=>{ for(let y=y0;y<y0+6;y++) for(let x=x0;x<x0+6;x++){ const i=(y*W+x)*4; ch[0].push(d[i]); ch[1].push(d[i+1]); ch[2].push(d[i+2]); } };
  pt(0,0); pt(W-6,0); pt(0,H-6); pt(W-6,H-6);
  const bg=ch.map(a=>a.sort((x,y)=>x-y)[a.length>>1]), m=new Uint8Array(W*H); let area=0;
  for(let i=0,p=0;i<m.length;i++,p+=4){ const dr=d[p]-bg[0], dg=d[p+1]-bg[1], db=d[p+2]-bg[2]; if(dr*dr+dg*dg+db*db>4900){ m[i]=1; area++; } }
  return {m,area};
}
const clipDilate=(m,W,H,n)=>{ let a=m; for(let k=0;k<n;k++){ const b=new Uint8Array(W*H); for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=y*W+x; if(a[i]||(x>0&&a[i-1])||(x<W-1&&a[i+1])||(y>0&&a[i-W])||(y<H-1&&a[i+W])) b[i]=1; } a=b; } return a; };
// The marks, found from the video itself (Tom 2026-11-18: "Tom never marks"):
//   START  the first picture (the video begins on the start picture, standing).
//   END    the last picture where the figure still changes, plus a half second hold (never past the video). loop: the last picture.
//   HIT    (strike) the picture where the figure reaches farthest outside its standing outline: the limb at full reach.
// Returns {first,hit?,last} in seconds, or null when the video does not move enough to tell (the clip then waits for Tom's REVIEW).
async function clipAutoMarks(blob,kind){
  const url=URL.createObjectURL(blob), v=document.createElement('video'); v.muted=true; v.playsInline=true; v.preload='auto'; v.src=url;
  try{
    await new Promise((res,rej)=>{ v.onloadeddata=res; v.onerror=()=>rej(new Error('The browser could not open this video to find the marks.')); setTimeout(()=>rej(new Error('Opening the video took too long.')),30000); });
    const dur=v.duration, vw=v.videoWidth, vh=v.videoHeight; if(!(dur>.5)||!vw||!vh) return null;
    const n=Math.floor(dur*CLIP_FPS+1e-6);
    if(kind==='loop') return n>=8?{first:0,last:r3((n-1)/CLIP_FPS)}:null;
    const W=128, H=Math.max(16,Math.round(W*vh/vw)), c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d',{willReadFrequently:true}), M=[];
    for(let i=0;i<n;i++){ await clipSeek(v,(i+.5)/CLIP_FPS); g.drawImage(v,0,0,W,H); M.push(clipMask(g.getImageData(0,0,W,H).data,W,H)); }
    const A0=Math.max(1,M[0].area), mot=[0];
    for(let i=1;i<n;i++){ let x=0; const a=M[i].m, b=M[i-1].m; for(let p=0;p<a.length;p++) x+=a[p]^b[p]; mot.push(x/A0); }
    const sm=mot.map((_,i)=>(mot[Math.max(0,i-1)]+mot[i]+mot[Math.min(n-1,i+1)])/3), peak=Math.max(...sm);
    if(peak<.01) return null;
    const thr=Math.max(peak*.12,.004); let lastMoving=0, firstMoving=-1; for(let i=1;i<n;i++) if(sm[i]>=thr){ lastMoving=i; if(firstMoving<0) firstMoving=i; }
    if(lastMoving<5) return null;
    const last=Math.min(n-1,lastMoving+CLIP_HOLD);
    if(kind!=='strike') return {first:0,last:r3(last/CLIP_FPS)};
    const ring=clipDilate(M[0].m,W,H,2); let hit=-1, best=-1;
    for(let i=3;i<=Math.min(lastMoving,last-2);i++){ let x=0; const a=M[i].m; for(let p=0;p<a.length;p++) if(a[p]&&!ring[p]) x++; if(x>best){ best=x; hit=i; } }
    if(best<.02*A0){ best=-1; for(let i=3;i<=Math.min(lastMoving,last-2);i++) if(sm[i]>best){ best=sm[i]; hit=i; } }   // nothing leaves the outline (a hop, a spin): the busiest picture
    if(hit<3||hit>=last) return null;
    return {first:0,hit:r3(hit/CLIP_FPS),last:r3(last/CLIP_FPS)};
  } finally { v.removeAttribute('src'); v.load(); URL.revokeObjectURL(url); }
}
// Decisions go to GitHub one at a time (each one rewrites data/art-prompts.json), whichever clip finished first.
let clipDecideChain=Promise.resolve();
const clipDecideSerial=f=>{ const p=clipDecideChain.then(f,f); clipDecideChain=p.catch(()=>{}); return p; };
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
  return '<div class="card cbar" data-cb="'+esc(g)+'"><div class="row"><button class="gold" data-batch="'+esc(g)+'"'+(CB.run?' disabled':'')+'>'+(run?'MAKING THE CHAPTER...':'GENERATE '+esc(g.toUpperCase()))+'</button><button class="small" data-batchstop="'+esc(g)+'"'+(run?'':' hidden')+'>STOP</button></div>'+
    '<div class="hint">'+esc(clipBatchText(g))+'</div><div class="'+(m.err?'err':'hint')+'" data-cbmsg>'+esc(m.text)+'</div></div>';
}
function clipBatchPaint(g){ const el=findBy('.cbar','cb',g); if(!el) return; const tmp=document.createElement('div'); tmp.innerHTML=clipBatchBar(g); el.replaceWith(tmp.firstElementChild); }
function clipBatchSay(g,text,err){ CB.msg[g]={text,err:!!err}; clipBatchPaint(g); }
function clipBatchStop(){ if(CB.run){ CB.run.stop=true; clipBatchSay(CB.run.g,'Stopping after the videos that are already being made.'); } }
// One clip, end to end: make it (unless a result is already waiting), find its marks, write them to the result, approve it.
async function clipBatchOne(e,R){
  const id=e.id, say=t=>{ R.live[id]=t; clipBatchProgress(R); };
  if(ST[id]!=='wait'||!(RES[id]||[]).length) await clipMake(id,say);
  let r=(RES[id]||[])[0]; if(!r) throw new Error('No video came back.');
  say('Finding the marks...');
  if(!r.blob){ try{ const vr=await fetch(r.url); if(vr.ok){ r.blob=new Blob([await vr.blob()],{type:'video/mp4'}); r.url=''; await tx('readwrite',st=>st.put(r)); } }catch(x){} }
  if(!r.blob) throw new Error('This browser was not allowed to keep the video, so it cannot find the marks. Open REVIEW on it and mark it by hand.');
  const marks=await clipAutoMarks(r.blob,clipKind(r));
  if(!marks) throw new Error('The video hardly moves, so the marks cannot be found. Open REVIEW on it and mark it by hand, or reject it with a note.');
  r.marks=Object.assign({first:-1,hit:-1,last:-1},marks); await tx('readwrite',st=>st.put(r));
  say('Approving...');
  const done=await clipDecideSerial(()=>decide('ok',r.key,null,true));
  if(!done) throw new Error((MSG[id]&&MSG[id].text)||'The approval did not go through.');
  return marks;
}
function clipBatchProgress(R){
  const live=Object.keys(R.live).length?' Now: '+Object.keys(R.live).map(k=>k.replace(/^clip-/,'')+' ('+R.live[k].replace(/ \(.*$/,'').replace(/\.\.\.$/,'')+')').join('; ')+'.':'';
  const o=spendGet();
  clipBatchSay(R.g,'Chapter batch: '+R.done.length+' of '+R.total+' done'+(R.fail.length?', '+R.fail.length+' need you':'')+'. Spent $'+(o.total-R.spent0).toFixed(2)+' in this batch ($'+o.total.toFixed(2)+' of the $'+o.cap.toFixed(0)+' cap).'+live);
}
async function clipBatchStart(g){
  if(CB.run) return;
  if(!LS.get('aot-art-key')||!LS.get('aot-gh-token')) return clipBatchSay(g,'Open Setup at the top and paste both the xAI key and the GitHub token first.',true);
  computeStates(); const b=clipBatchItems(g), queue=[].concat(b.wait,b.todo,b.redo);
  if(!queue.length) return clipBatchSay(g,b.redoWait.length?'Nothing to make yet: the '+b.redoWait.length+' clip(s) you sent back wait for Claude\'s fix (it rewrites their prompts).':b.blocked.length?'Nothing can start: '+b.blocked.length+' clip(s) wait on a start picture that is not published yet.':'Everything in this chapter is approved.');
  const need=queue.filter(e=>ST[e.id]!=='wait').reduce((t,e)=>t+clipCost(e),0), o=spendGet();
  if(o.total+need>o.cap+1e-9) return clipBatchSay(g,'This batch needs about $'+need.toFixed(2)+' and only $'+Math.max(0,o.cap-o.total).toFixed(2)+' is left under the $'+o.cap.toFixed(2)+' cap. Press +$10 at the top (as many times as needed), then press this again.',true);
  const R=CB.run={g,queue:queue.slice(),total:queue.length,done:[],fail:[],live:{},stop:false,spent0:o.total};
  clipBatchPaint(g); clipBatchProgress(R);
  const worker=async()=>{
    while(!R.stop){
      const e=R.queue.shift(); if(!e) break;
      try{ const m=await clipBatchOne(e,R); R.done.push(e.id); R.marks=R.marks||{}; R.marks[e.id]=m; }
      catch(err){ R.fail.push({id:e.id,why:String(err.message||err)}); setMsg(e.id,String(err.message||err),true); if(err&&err.stop) R.stop=true; }
      delete R.live[e.id]; refreshItem(e.id); clipBatchProgress(R);
      if(!R.stop&&R.queue.length) await new Promise(res=>setTimeout(res,CLIP_PAR>1?1500:0));
    }
  };
  await Promise.all(Array.from({length:CLIP_PAR},(_,i)=>new Promise(res=>setTimeout(res,i*1200)).then(worker)));
  CB.run=null; const left=R.queue.length, o2=spendGet();
  clipBatchSay(g,(R.stop?'Stopped. ':'Finished. ')+R.done.length+' clip(s) made and approved; the game is cutting them now (the first ones show in Battle Lab > '+g.toUpperCase()+' REVIEW after about 3 minutes and a RELOAD on the title screen). '+(left?left+' not started. ':'')+(R.fail.length?R.fail.length+' need you: '+R.fail.map(f=>f.id.replace(/^clip-/,'')+' ('+f.why.replace(/ Open REVIEW.*$/,'').slice(0,90)+')').join('; ')+'. ':'')+'Spent $'+(o2.total-R.spent0).toFixed(2)+'.',R.fail.length>0);
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
  if(prior) fetch(prior,{cache:'no-store'}).then(x=>x.ok?x.blob():null).then(async b=>{ if(!b||b.size<1000||r.blob) return; r.blob=new Blob([b],{type:'video/mp4'}); r.url=''; await tx('readwrite',st=>st.put(r)); if(CV.r===r){ clipBf(false); v.src=clipSrc(r); v.load(); clipPaintMarks(); } }).catch(()=>{});
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
