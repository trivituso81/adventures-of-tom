'use strict';
// engine/pose-review.js: the review prompt of PAINTED STATES: CHAPTER 1 (fix-clipposes-2, 2026-11-20).
// Tom (t-clipposes): "The animation happens way too fast before I can process it and see what's wrong. After each move auto plays, an
// interstitial asking for feedback that can go directly to Claude should be displayed where optional feedback can be entered and the user must
// hit reject or approve before the next animation is played".
// After each state plays, the run holds on this panel: WATCH AGAIN, an optional note, REJECT, APPROVE (STOP leaves; answers so far are kept). Nothing else plays until he answers.
// Each answer is saved at once to data/pose-review.json on main (the GitHub token the Art Library keeps, localStorage 'aot-gh-token'), and on
// this device until GitHub has it. tools/board_sync.py (done_when poses_reviewed) closes his card when every state has an answer and copies his
// rejections, with their notes, onto the card that applies them (c-clipposesfix).
const PRV={on:false,run:'',expect:[],cur:null,el:null,pend:{},chain:Promise.resolve(),say:'',busy:false,auto:null};
const PRV_PATH='data/pose-review.json',PRV_LOCAL='aot-pose-review';
const prvEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function prvStart(run,expect){
  PRV.on=true; PRV.run=run; PRV.expect=expect.slice(); PRV.cur=null; PRV.say='';
  try { PRV.pend=JSON.parse(localStorage.getItem(PRV_LOCAL)||'{}')||{}; } catch(e) { PRV.pend={}; }
}
// Show the panel for one state and wait. opt: {key,who,label,n,of,again(cb)}. done(verdict,note) runs after REJECT or APPROVE.
function prvAsk(opt,done){
  PRV.cur={opt,done}; PRV.busy=false;
  if(PRV.auto) { const v=PRV.auto; setTimeout(()=>prvAnswer(v,''),30); return; }   // tests: answer by themselves
  prvPaint();
}
function prvPaint(){
  const host=document.getElementById('battle')||document.getElementById('game'); if(!host||!PRV.cur) return;
  let el=document.getElementById('prv');
  if(!el){ el=document.createElement('div'); el.id='prv'; el.className='prv';
    for(const t of ['pointerdown','pointerup','click','touchstart','touchend','keydown','keyup','keypress']) el.addEventListener(t,ev=>ev.stopPropagation());
    el.addEventListener('click',ev=>{ const b=ev.target.closest('[data-prv]'); if(!b||b.disabled) return; const a=b.dataset.prv;
      if(a==='again') prvAgain(); else if(a==='stop') { if(typeof b3Exit==='function') b3Exit(); } else if(a==='ok') prvAnswer('approve'); else if(a==='no') prvAnswer('reject'); });
    host.appendChild(el); }
  const o=PRV.cur.opt;
  el.innerHTML='<div class="prv-top"><b>'+prvEsc(o.who+': '+o.label)+'</b><span>'+o.n+' of '+o.of+'</span><button type="button" class="stop" data-prv="stop">STOP</button></div>'+
    '<div class="prv-q">Did that look right? Your answer and note go straight to Claude.</div>'+
    '<textarea class="prv-note" rows="2" placeholder="Optional note: head too big or small, too fast or slow, moves too far..."></textarea>'+
    '<div class="prv-row"><button type="button" data-prv="again">WATCH AGAIN</button><button type="button" class="no" data-prv="no">REJECT</button><button type="button" class="ok" data-prv="ok">APPROVE</button></div>'+
    '<div class="prv-msg" role="status">'+prvEsc(PRV.say)+'</div>';
  el.hidden=false;
}
function prvAgain(){
  const c=PRV.cur; if(!c||PRV.busy) return; PRV.busy=true;
  const el=document.getElementById('prv'); if(el) el.querySelectorAll('button').forEach(b=>b.disabled=true);
  c.opt.again(()=>{ PRV.busy=false; if(el) el.querySelectorAll('button').forEach(b=>b.disabled=false); });
}
function prvAnswer(v,note){
  const c=PRV.cur; if(!c||PRV.busy) return;
  const el=document.getElementById('prv');
  if(note==null) { const t=el&&el.querySelector('.prv-note'); note=t?t.value.trim():''; }
  PRV.cur=null; if(el) el.hidden=true;
  prvRecord(c.opt.key,v,note); c.done(v,note);
}
function prvRecord(key,v,note){
  PRV.pend[key]={v,note:note||'',at:new Date().toISOString(),build:typeof BUILD_TAG!=='undefined'?BUILD_TAG:''};
  try { localStorage.setItem(PRV_LOCAL,JSON.stringify(PRV.pend)); } catch(e) {}
  prvSave();
}
function prvSet(t){ PRV.say=t; const m=document.querySelector('#prv .prv-msg'); if(m) m.textContent=t; const e=document.querySelector('#prv-end .prv-msg'); if(e) e.textContent=t; }
const prvB64=s=>{ const b=new TextEncoder().encode(s); let x=''; for(let i=0;i<b.length;i+=0x8000) x+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000)); return btoa(x); };
const prvUnB64=s=>new TextDecoder().decode(Uint8Array.from(atob(String(s).replace(/\s/g,'')),c=>c.charCodeAt(0)));
// Saves run one after another; each sends everything not yet on GitHub, so a failed save is sent again with the next answer.
function prvSave(){ PRV.chain=PRV.chain.then(prvPush).catch(()=>{}); return PRV.chain; }
async function prvPush(){
  const keys=Object.keys(PRV.pend); if(!keys.length) return;
  let tok=''; try { tok=localStorage.getItem('aot-gh-token')||''; } catch(e) {}
  if(!tok) { prvSet('No GitHub token on this phone, so your answers are kept here only. Open ADMIN > ART LIBRARY > Setup, paste the token once, then run this again.'); return; }
  prvSet('Saving for Claude...');
  const H={Authorization:'Bearer '+tok,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},base='https://api.github.com/repos/trivituso81/adventures-of-tom/contents/'+PRV_PATH;
  for(let tries=0;tries<4;tries++){
    let sha=null,doc={runs:{}};
    try { const g=await fetch(base+'?ref=main&t='+Date.now(),{cache:'no-store',headers:H});
      if(g.ok){ const j=await g.json(); sha=j.sha; let c=j.content||'';
        if(!c.replace(/\s/g,'')&&j.sha){ const bb=await fetch('https://api.github.com/repos/trivituso81/adventures-of-tom/git/blobs/'+j.sha+'?t='+Date.now(),{cache:'no-store',headers:H}); if(bb.ok) c=(await bb.json()).content||''; }   // bigboard1: over 1 MB the contents API sends no content; read the blob
        doc=JSON.parse(prvUnB64(c)||'{}'); }
      else if(g.status!==404){ prvSet('GitHub would not take the answers ('+g.status+'). They are kept on this phone and sent with the next one.'); return; }
    } catch(e) { prvSet('Could not reach GitHub. Your answers are kept on this phone and sent with the next one.'); return; }
    doc.about='Answers from ADMIN > BATTLE LAB > NEW BATTLE > PAINTED STATES (engine/pose-review.js). Key: fighter.state. v approve or reject.';
    doc.runs=doc.runs||{}; const R=doc.runs[PRV.run]=doc.runs[PRV.run]||{answers:{}};
    R.expect=PRV.expect.slice(); R.answers=R.answers||{}; const sent=Object.assign({},PRV.pend);
    Object.assign(R.answers,sent); R.updated=new Date().toISOString();
    let w; try { w=await fetch(base,{method:'PUT',cache:'no-store',headers:Object.assign({'Content-Type':'application/json'},H),
      body:JSON.stringify({message:'Painted states review: '+Object.keys(sent).join(', '),content:prvB64(JSON.stringify(doc,null,1)+'\n'),branch:'main',sha:sha||undefined})}); }
    catch(e) { prvSet('Could not reach GitHub. Your answers are kept on this phone and sent with the next one.'); return; }
    if(w.ok){ for(const k of Object.keys(sent)) if(PRV.pend[k]&&PRV.pend[k].at===sent[k].at) delete PRV.pend[k];
      try { localStorage.setItem(PRV_LOCAL,JSON.stringify(PRV.pend)); } catch(e) {}
      const n=Object.keys(R.answers).filter(k=>PRV.expect.includes(k)).length; prvSet('Saved for Claude: '+n+' of '+PRV.expect.length+' answered.'); return; }
    if(w.status!==409&&w.status!==422){ prvSet('GitHub would not take the answers ('+w.status+'). They are kept on this phone and sent with the next one.'); return; }
  }
  prvSet('GitHub kept changing under us. Your answers are kept on this phone and sent with the next one.');
}
// The end of the run: a count and DONE (back to the list). The run holds here until the saves are through.
function prvEnd(counts,done){
  const el=document.getElementById('prv'); if(el) el.remove();
  if(PRV.auto) { done(); return; }
  const host=document.getElementById('battle')||document.getElementById('game'); if(!host) { done(); return; }
  const e=document.createElement('div'); e.id='prv-end'; e.className='prv';
  for(const t of ['pointerdown','pointerup','click','touchstart','touchend','keydown','keyup','keypress']) e.addEventListener(t,ev=>ev.stopPropagation());
  e.innerHTML='<div class="prv-top"><b>PAINTED STATES: DONE</b></div><div class="prv-q">'+counts.ok+' approved, '+counts.no+' rejected. '+
    (counts.no?'Claude applies your rejections and notes next.':'Nothing to change.')+'</div><div class="prv-row"><button type="button" class="ok" data-prv="done">DONE</button></div><div class="prv-msg" role="status">'+prvEsc(PRV.say)+'</div>';
  e.addEventListener('click',ev=>{ if(ev.target.closest('[data-prv="done"]')) { e.remove(); PRV.on=false; done(); } });
  host.appendChild(e);
}
function prvClose(){ PRV.on=false; PRV.cur=null; for(const id of ['prv','prv-end']) { const e=document.getElementById(id); if(e) e.remove(); } }
(function(){ const st=document.createElement('style');
  st.textContent='.prv{position:absolute;z-index:61;left:0;right:0;bottom:0;display:flex;flex-direction:column;gap:6px;padding:8px 10px 10px;background:#10151fef;color:#fff4d3;border-top:2px solid #fff1c780;font:13px "Trebuchet MS",system-ui,sans-serif}'+
  'html.landscape .prv{left:auto;top:0;width:min(42%,380px);border-top:0;border-left:2px solid #fff1c780;justify-content:center}'+
  '.prv[hidden]{display:none}.prv-top{display:flex;gap:8px;align-items:baseline}.prv-top b{flex:1;letter-spacing:.6px;font-size:15px}.prv-top span{color:#b9b3e6;font-size:11px}.prv-top .stop{min-height:30px;padding:0 10px;border:2px solid #fff1c766;border-radius:6px;background:#0b0d12;color:#fff1cb;font:inherit;font-size:11px;font-weight:900}'+
  '.prv-q{color:#cfd8ff}.prv-note{width:100%;box-sizing:border-box;min-height:44px;border-radius:6px;border:2px solid #fff1c766;background:#0b0d12;color:#fff4d3;padding:6px 8px;font:inherit;font-size:16px;resize:none}'+
  '.prv-row{display:flex;gap:6px}.prv-row button{flex:1;min-height:42px;padding:0 8px;border:2px solid #fff1c766;border-radius:6px;background:#0b0d12;color:#fff1cb;font:inherit;font-weight:900;letter-spacing:.5px;touch-action:manipulation}'+
  '.prv-row button.ok{background:#2f9e63;border-color:#8fe0b4;color:#fff}.prv-row button.no{background:#8c2f3a;border-color:#e89aa4;color:#fff}.prv-row button:disabled{opacity:.35}.prv-msg{color:#b9b3e6;font-size:11px;min-height:14px}';
  document.head.appendChild(st); })();
window.addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{PRV,prvAnswer}); });
