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
//   APPROVE   (decide() in art.html) commits the video to art/raw/clips/<id>-v<n>.mp4 with the three marks; the art-bake
//             Action cuts it into the game clip (tools/art-library/art_bake.py runs tools/clip-bake/bake_clip.py).
// If the browser may not download the finished video (the video host blocks it), the result keeps only its address:
// it still plays and can be marked and approved (the Action downloads it), but the address expires, so approve soon.
const CLIP_RATE={'grok-imagine-video-1.5':{'480p':.08,'720p':.14,'1080p':.25},'grok-imagine-video-1.5-lite':{'480p':.02,'720p':.03,'1080p':.14}};   // dollars per second of video (xAI list price, 2026-11)
const CLIP_FRAME=1/30, CLIP_PREVIEW_BG='bgs/01-pond-town.webp';
const clipCost=e=>((CLIP_RATE[e.clip.model]||{})[e.clip.res]||.08)*e.clip.dur+.01;   // + one input picture
const clipPend={get(){ try{ return JSON.parse(LS.get('aot-clip-pending')||'{}')||{}; }catch(x){ return {}; } }, set(o){ LS.set('aot-clip-pending',JSON.stringify(o)); }};
const clipSrc=r=>r.blob?urlOf(r):r.url;
const clipMarks=r=>{ const m=r&&r.marks; return m&&m.first>=0&&m.hit>m.first&&m.last>m.hit?{first:m.first,hit:m.hit,last:m.last}:null; };

function clipCard(e){
  const id=esc(e.id), rs=RES[e.id]||[], blk=blockInfo(e), ed=EDITS[e.id]!==undefined&&EDITS[e.id]!==e.prompt, c=e.clip, pend=clipPend.get()[e.id];
  const apr=n=>(e.versions||[]).some(v=>v.from==='v'+n), rjc=n=>(e.rejects||[]).some(v=>v.from==='v'+n);
  return '<div class="card" data-id="'+id+'">'+
  (blk?'<div class="blk">Blocked. '+esc(blk.why)+'</div>':'')+
  '<label>Start picture (first frame of the video, made from the battle sprite)</label><div class="refs"><div class="ref"><img src="'+esc(c.start)+'" data-path="'+esc(c.start)+'" alt="" onerror="refMiss(this)">'+esc(c.start.split('/').pop())+'</div></div>'+
  '<details class="pr" data-po="'+id+'"'+(UI.po[e.id]?' open':'')+'><summary>Prompt'+(ed?' <span class="chip c-wait">edited</span>':'')+' <span class="hint" style="font-weight:400">tap to read or edit</span></summary><div class="pin">'+(ed?'<button class="small" data-revert="'+id+'">Use the default prompt</button> <span class="hint">(this box holds your own edit, saved on this device)</span>':'<span class="hint">Edit here, it is sent as written.</span>')+'<textarea data-prompt="'+id+'">'+esc(promptOf(e))+'</textarea></div></details>'+
  '<div class="row"><button class="gold" data-gen="'+id+'"'+(blk?' disabled':'')+'>'+(pend?'FETCH THE VIDEO':'GENERATE VIDEO')+'</button><span class="hint">'+(pend?'A video is already being made for this. No new charge.':c.dur+' second video, '+c.res+', about $'+clipCost(e).toFixed(2)+' each. Takes 1 to 3 minutes.')+'</span></div>'+
  '<div class="'+(MSG[e.id]&&MSG[e.id].err?'err':'hint')+'" id="m-'+id+'">'+esc(MSG[e.id]?MSG[e.id].text:'')+'</div>'+
  (rs.length?'<div class="hint">Tap REVIEW to mark the start, the hit and the end, then approve or reject.</div>':'')+
  '<div class="res">'+rs.map(r=>'<div><video class="clipthumb" src="'+esc(clipSrc(r))+'#t=0.1" muted playsinline preload="metadata"></video><span>v'+r.n+'</span>'+(apr(r.n)?' <span class="chip c-approved">approved</span>':rjc(r.n)?' <span class="chip c-rejected">rejected</span>':'')+(r.blob?'':' <span class="chip c-wait">address only</span>')+' <button class="small" data-res="'+esc(r.key)+'">REVIEW</button></div>').join('')+'</div>'+
  ((e.versions||[]).length?'<div class="hint ok">Approved: '+e.versions.map(v=>esc(v.file)).join(', ')+'</div>':'')+
  ((e.rejects||[]).length?'<div class="hint">Rejected before: '+e.rejects.length+' (notes are saved for Claude)</div>':'')+'</div>';
}

async function clipGenerate(id,btn){
  const e=ENTRY[id], c=e.clip, key=LS.get('aot-art-key');
  if(!key) return setMsg(id,'Paste the xAI key at the top first.',true);
  if(!DB) return setMsg(id,'This browser would not keep the video.',true);
  const blk=blockInfo(e); if(blk) return setMsg(id,blk.why,true);
  const hdr={'Content-Type':'application/json',Authorization:'Bearer '+key}, clean=t=>String(t).split(key).join('[key]').slice(0,300);
  const unreachable='The browser could not reach the video service. Either the network is down or the service blocks browsers; if it is the second, a relay address is needed (the Relay field at the top).';
  let P=clipPend.get(), p=P[id];
  btn.disabled=true;
  try{
    if(!p){
      const prompt=(promptOf(e)||'').trim(); if(!prompt) throw new Error('The prompt is empty.');
      const cost=clipCost(e), o=spendGet(); if(o.total+cost>o.cap) throw new Error('Spend cap reached ($'+o.cap.toFixed(0)+'). Press +$10 at the top to allow more.');
      setMsg(id,'Sending the start picture...');
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
      setMsg(id,'The video is being made ('+Math.round((Date.now()-p.t)/1000)+' s so far, usually 1 to 3 minutes). Keep this page open.');
      await new Promise(res=>setTimeout(res,i?5000:1500));
      let r; try{ r=await fetch(XAI_BASE()+'/v1/videos/'+encodeURIComponent(p.rid),{headers:{Authorization:'Bearer '+key},cache:'no-store'}); }catch(err){ continue; }   // a dropped connection: try again
      const txt=await r.text(); let j=null; try{ j=JSON.parse(txt); }catch(x){}
      if(r.status===401||r.status===403) throw new Error('The video service refused the key ('+r.status+'). Press FETCH THE VIDEO after fixing the key; the video is not lost.');
      const st=j&&j.status, v=j&&(j.video||(j.response&&j.response.video));
      if(v&&v.url){ url=v.url; break; }
      if(st==='failed'||st==='expired'||r.status===404||(r.status>=400&&r.status<500&&r.status!==429)){
        P=clipPend.get(); delete P[id]; clipPend.set(P);
        throw new Error('The video service could not make this video ('+(st||r.status)+'): '+clean(txt)+' Press GENERATE VIDEO to try again.');
      }
    }
    if(!url) throw new Error('The video is still not ready after 12 minutes. Press FETCH THE VIDEO in a few minutes; it will not be charged again.');
    setMsg(id,'Downloading the video...');
    let blob=null; try{ const vr=await fetch(url); if(vr.ok) blob=await vr.blob(); }catch(err){}
    const have=await results(id), n=(have[0]?have[0].n:0)+1;
    await tx('readwrite',s=>s.put({key:id+'|'+n,id,n,blob,url:blob?'':url,video:true,prompt:p.prompt,refs:[c.start],t:Date.now()}));
    for(const old of have.slice(KEEP-1)) await tx('readwrite',s=>s.delete(old.key));
    P=clipPend.get(); delete P[id]; clipPend.set(P);
    RES[id]=await results(id); e.status='generated';
    MSG[id]={text:'Done: v'+n+'. Tap REVIEW.'+(blob?'':' This browser was not allowed to keep a copy, so approve or reject it within the hour.'),err:false}; refreshItem(id);
  }catch(err){ setMsg(id,String(err.message||err),true); btn.disabled=false; if(clipPend.get()[id]) btn.textContent='FETCH THE VIDEO'; }
}

// ---- review screen: the video, a frame slider, three marks, and the battlefield preview
const CV={r:null,raf:0,bg:null,on:false,loop:0};
const cg=id=>document.getElementById(id);
const clipT=t=>t==null||t<0?'not set':t.toFixed(2)+' s';
function clipRvSetup(){
  if(cg('rvvid')) return;
  cg('rvstage').insertAdjacentHTML('beforeend','<video id="rvvid" muted playsinline preload="auto" hidden></video><canvas id="rvcan" hidden></canvas>');
  cg('rvnote').insertAdjacentHTML('beforebegin','<div id="cliptools" hidden>'+
    '<div class="row cliprow"><button class="small" id="cpb" aria-label="One frame back">&lsaquo; frame</button><input type="range" id="cps" min="0" max="3" step="0.0333" value="0" aria-label="Position in the video"><button class="small" id="cpf" aria-label="One frame forward">frame &rsaquo;</button></div>'+
    '<div class="row cliprow"><button class="small" id="cpplay">PLAY</button><span class="hint" id="cpt"></span><button class="small" id="cpbf">ON THE BATTLEFIELD</button></div>'+
    '<div class="hint">Move to a moment, then tap what it is:</div>'+
    '<div class="row cliprow marks"><button class="small" data-mark="first">START<br><span></span></button><button class="small" data-mark="hit">HIT<br><span></span></button><button class="small" data-mark="last">END<br><span></span></button></div>'+
    '<div class="hint">START: standing still, just before the move. HIT: the moment the hit should land. END: back to standing.</div></div>');
  const v=cg('rvvid'), s=cg('cps');
  const seek=t=>{ clipBf(false); v.pause(); v.currentTime=Math.max(0,Math.min((v.duration||+s.max)-.01,t)); };
  s.addEventListener('input',()=>seek(+s.value));
  cg('cpb').onclick=()=>seek(v.currentTime-CLIP_FRAME); cg('cpf').onclick=()=>seek(v.currentTime+CLIP_FRAME);
  cg('cpplay').onclick=()=>{ clipBf(false); if(v.paused){ if(v.currentTime>=(v.duration||0)-.05) v.currentTime=0; v.playbackRate=1; v.play(); } else v.pause(); };
  cg('cpbf').onclick=()=>clipBf(!CV.on);
  v.addEventListener('loadedmetadata',()=>{ s.max=String(v.duration||3); clipPaintMarks(); });
  v.addEventListener('timeupdate',()=>{ if(!CV.on) s.value=String(v.currentTime); cg('cpt').textContent=v.currentTime.toFixed(2)+' of '+(v.duration||0).toFixed(2)+' s'; });
  v.addEventListener('play',()=>cg('cpplay').textContent='PAUSE'); v.addEventListener('pause',()=>cg('cpplay').textContent='PLAY');
  cg('cliptools').addEventListener('click',async ev=>{ const b=ev.target.closest('[data-mark]'); if(!b||!CV.r) return;
    const r=CV.r; r.marks=Object.assign({first:-1,hit:-1,last:-1},r.marks||{}); r.marks[b.dataset.mark]=Math.round(v.currentTime*1000)/1000;
    await tx('readwrite',st=>st.put(r)); clipPaintMarks(); });
}
function clipPaintMarks(){
  const m=(CV.r&&CV.r.marks)||{}, ok=!!clipMarks(CV.r);
  document.querySelectorAll('#cliptools [data-mark]').forEach(b=>{ const t=m[b.dataset.mark]; b.querySelector('span').textContent=clipT(t); b.classList.toggle('set',t>=0); });
  const set=m.first>=0&&m.hit>=0&&m.last>=0;
  if(CV.r&&rvId()===CV.r.id&&set&&!ok) setMsg(CV.r.id,'The marks are out of order: START must come before HIT, and HIT before END.',true);
  else if(CV.r&&MSG[CV.r.id]&&/marks/.test(MSG[CV.r.id].text)) setMsg(CV.r.id,'');
  cg('cpbf').disabled=!ok||!CV.r.blob; cg('cpbf').title=CV.r&&!CV.r.blob?'Not available for a video this browser could not keep a copy of.':'';
}
// Called by rvDraw (art.html) for every entry: shows the video tools for a clip result, hides them for a picture.
function clipRvDraw(e,r){
  clipRvSetup(); clipBf(false);
  const isClip=!!(e&&e.clip&&r), v=cg('rvvid');
  cg('rvimg').hidden=isClip; v.hidden=!isClip; cg('cliptools').hidden=!isClip; cg('rvcan').hidden=true;
  if(!isClip){ v.pause(); v.removeAttribute('src'); CV.r=null; return; }
  CV.r=r; const src=clipSrc(r); if(v.getAttribute('src')!==src){ v.src=src; v.load(); }
  v.pause(); clipPaintMarks();
}
function clipRvStop(){ clipBf(false); const v=cg('rvvid'); if(v) v.pause(); }
// ON THE BATTLEFIELD: START to END, looping, at the game's speed, magenta removed, over a battle background. A look at
// the cutout and the timing only; the real cut (edge clean-up, size, shadow) is made by the baker after APPROVE.
function clipBf(on){
  const v=cg('rvvid'), can=cg('rvcan'); if(!v||!can) return;
  cancelAnimationFrame(CV.raf); if(CV.on){ v.pause(); v.playbackRate=1; } CV.on=false; can.hidden=true; if(cg('cpbf')) cg('cpbf').textContent='ON THE BATTLEFIELD';
  if(!on){ if(!v.hidden) v.style.opacity=''; return; }
  const m=clipMarks(CV.r), e=ENTRY[CV.r.id]; if(!m||!CV.r.blob) return;
  CV.on=true; can.hidden=false; v.style.opacity='0'; cg('cpbf').textContent='BACK TO THE VIDEO';
  if(!CV.bg){ CV.bg=new Image(); CV.bg.src=CLIP_PREVIEW_BG; }
  const W=can.width=640, H=can.height=480, g=can.getContext('2d'), off=document.createElement('canvas'), og=off.getContext('2d',{willReadFrequently:true});
  v.currentTime=m.first; v.playbackRate=(e.clip&&e.clip.speed)||1; v.play();
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
  '.cliprow.marks button{flex:1;min-height:48px;line-height:1.25}.cliprow.marks button span{font-weight:400;font-size:12px}.cliprow.marks button.set{border-color:#2f9e63;background:#143524}';
  document.head.appendChild(st); });
