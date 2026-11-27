'use strict';
// engine/clip-review.js: Battle Lab > CHAPTER n REVIEW (clipbatch1, 2026-11-18).
// Tom makes a chapter's battle clips as one batch in the Art Library (GENERATE CHAPTER, engine/art-clips.js), then watches them here, once:
// a real Battle Lab fight (real backdrop, real painted party and monsters) with a panel listing every clip of the chapter's Art Library group
// ("Chapter 1", tab Clips). PLAY shows that clip on its owner in place; PLAY ALL runs them one after another; REDO sends the clip back with
// a note (the same as REJECT in the Library: a rejection with a note on the entry, saved to data/art-prompts.json on main with Tom's GitHub
// token), and the clip is made again in the chapter's next batch once Claude has fixed its prompt.
// Engine side: bclipShowFrame (engine/clips.js) draws the shown clip; battle-draw.js and b2FoeFrame ask for it first. Only the clip being
// shown (and the monsters' idle loops) is loaded, so a whole chapter fits in a phone's memory (bclipWanted).
const CRV={fbefore:null,total:0,on:false,group:'',name:'',rows:[],sent:{},cur:'',queue:[],all:false,redo:'',testEntries:null,fold:false,say:''};
const crvQ=new URLSearchParams(location.search);
const crvKey=e=>e.clip.id.replace(/-/g,'_');
const crvOnField=owner=>typeof B2!=='undefined'&&B2.active&&(B2.party.some(u=>u.id===owner)||B2.foes.some(f=>f.id===owner));
const crvEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const crvLabel=e=>String(e.title||e.id).replace(/ video clip$/,'').replace(/\s*\([^)]*\)\s*$/,'');
async function crvEntries(group){
  if(CRV.testEntries) return CRV.testEntries;
  const r=await fetch('data/art-prompts.json',{cache:'no-store'}); if(!r.ok) throw new Error('Could not read the clip list ('+r.status+').');
  return (await r.json()).entries.filter(e=>e.tab==='Clips'&&e.group===group&&e.clip&&!e.clip.test);
}
// A clip made again by the clip-gen Action (second version or later, from 'clipgen') is NEW: it is what Tom has not reviewed yet.
function crvIsNew(e){ const v=(e.versions||[]); const l=v[v.length-1]; return !!l&&l.from==='clipgen'&&l.n>=1&&e.status==='approved'; }
// What a row says about its clip, in the order it matters.
function crvState(e){
  const key=crvKey(e);
  if(CRV.sent[e.id]) return ['redo sent','warn'];
  if(BCLIPS[key]) return crvOnField(e.clip.owner)?['ready','ok']:['on the other fight','dim'];
  if(e.status==='rejected') return ['redo waiting','warn'];
  if((e.versions||[]).length) return ['cutting: RELOAD in a few minutes','dim'];
  return ['not made yet','dim'];
}
function crvRowHtml(e){
  const [txt,cls]=crvState(e), key=crvKey(e), can=!!BCLIPS[key]&&crvOnField(e.clip.owner), id=crvEsc(e.id);
  return '<div class="crv-row'+(CRV.cur===e.id?' playing':'')+'" data-id="'+id+'"><div class="crv-line"><span class="crv-name">'+crvEsc(crvLabel(e))+'</span>'+(crvIsNew(e)?'<span class="crv-chip warn">NEW</span>':'')+'<span class="crv-chip '+cls+'">'+crvEsc(txt)+'</span>'+
    '<button type="button" data-crv="play"'+(can?'':' disabled')+'>'+(CRV.cur===e.id?'PLAYING':'PLAY')+'</button>'+'<button type="button" data-crv="redo"'+((e.versions||[]).length||BCLIPS[key]?'':' disabled')+'>REDO</button>'+'</div>'+
    (CRV.redo===e.id?'<div class="crv-note"><input type="text" maxlength="400" placeholder="What looks wrong?" aria-label="Note for Claude" autocomplete="off"><button type="button" data-crv="send">SEND</button><button type="button" data-crv="cancel">CANCEL</button></div>':'')+'</div>';
}
function crvPaint(){
  const el=document.getElementById('crv'); if(!el) return;
  const list=el.querySelector('.crv-list'), keep=list.scrollTop, had=el.querySelector('.crv-note input'), val=had?had.value:'';
  list.innerHTML=CRV.rows.length?CRV.rows.map(crvRowHtml).join(''):'<div class="crv-empty">'+crvEsc(CRV.say||'No clips in this chapter yet.')+'</div>';
  list.scrollTop=keep; const inp=el.querySelector('.crv-note input'); if(inp&&had){ inp.value=val; }
  el.classList.toggle('fold',CRV.fold); el.querySelector('[data-crv="fold"]').textContent=CRV.fold?'SHOW':'HIDE';
  el.querySelector('[data-crv="new"]').disabled=!CRV.rows.some(e=>crvIsNew(e)&&BCLIPS[crvKey(e)]&&crvOnField(e.clip.owner));
  el.querySelector('[data-crv="all"]').disabled=!CRV.rows.some(e=>BCLIPS[crvKey(e)]&&crvOnField(e.clip.owner));
  el.querySelector('.crv-msg').textContent=CRV.say;
}
function crvSay(t){ CRV.say=t; const m=document.querySelector('#crv .crv-msg'); if(m) m.textContent=t; }
// While a clip plays the list folds away (the panel can cover the party, most of all in landscape) and opens again when the clip, or the whole PLAY ALL run, is over.
function crvFold(on){ if(on){ if(CRV.fbefore==null) CRV.fbefore=CRV.fold; CRV.fold=true; } else if(CRV.fbefore!=null){ CRV.fold=CRV.fbefore; CRV.fbefore=null; } }
function crvPlay(e,chain){
  const key=crvKey(e); if(!BCLIPS[key]||!crvOnField(e.clip.owner)) return;
  CRV.cur=e.id; paintedTick(); crvFold(true);
  B2.clipShow={id:key,owner:e.clip.owner,t0:null,over:false,onEnd:()=>{ CRV.cur=''; if(chain&&CRV.all) setTimeout(crvNext,500); else crvFold(false); crvPaint(); }};
  crvPaint(); crvSay('Playing '+crvLabel(e)+(chain?' ('+(CRV.total-CRV.queue.length)+' of '+CRV.total+')':'')+'.');
}
function crvNext(){
  if(!CRV.on||!CRV.all) return;
  const e=CRV.queue.shift(); if(!e){ CRV.all=false; crvFold(false); crvPaint(); return crvSay('That was every clip on this fight.'); }
  crvPlay(e,true);
}
function crvStop(){ CRV.all=false; CRV.queue=[]; CRV.cur=''; if(typeof B2!=='undefined') B2.clipShow=null; crvFold(false); crvPaint(); }
// REDO: the same as REJECT in the Library (a rejection with a note on the entry in data/art-prompts.json on main). Needs the GitHub token the Library keeps.
const crvGhBase=()=> (crvQ.get('gh')||'https://api.github.com').replace(/\/+$/,'');
const crvB64=s=>{ const u=new TextEncoder().encode(s); let b=''; for(let i=0;i<u.length;i+=0x8000) b+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(b); };
const crvUnB64=c=>{ const bin=atob(String(c).replace(/\s/g,'')), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return new TextDecoder().decode(u); };
async function crvReject(id,note){
  let tok=''; try { tok=localStorage.getItem('aot-gh-token')||''; } catch(x) {}
  if(!tok) throw new Error('No GitHub token on this device. Open ADMIN > ART LIBRARY, open Setup and paste it once.');
  const H={Authorization:'Bearer '+tok,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}, base=crvGhBase()+'/repos/trivituso81/adventures-of-tom/', path='data/art-prompts.json';
  let last='';
  for(let i=0;i<6;i++){
    if(i) await new Promise(res=>setTimeout(res,1500*i));
    let g; try { g=await fetch(base+'contents/'+path+'?ref=main&t='+Date.now(),{cache:'no-store',headers:H}); } catch(x) { throw new Error('Could not reach GitHub. Check the network and try again.'); }
    if(g.status===401||g.status===403||g.status===404) throw new Error('GitHub would not let this token change the game files (it needs Contents: Read and write on adventures-of-tom).');
    if(!g.ok) throw new Error('GitHub said '+g.status+' while reading the clip list.');
    const gj=await g.json(); let raw=gj.content||'';
    if(!raw){ const b=await fetch(base+'git/blobs/'+gj.sha,{cache:'no-store',headers:H}); if(b.ok) raw=(await b.json()).content||''; }   // over 1 MB: by blob id
    if(!raw) throw new Error('GitHub sent an empty clip list. Try again in a minute.');
    const doc=JSON.parse(crvUnB64(raw)), x=doc.entries.find(q=>q.id===id); if(!x) throw new Error('That clip is not in the game\'s list any more.');
    x.rejects=x.rejects||[]; x.rejects.push({date:new Date().toISOString().slice(0,10),note,from:'review',at:Date.now(),rev:x.promptRev||0}); x.status='rejected';
    const w=await fetch(base+'contents/'+path,{method:'PUT',cache:'no-store',headers:Object.assign({'Content-Type':'application/json'},H),body:JSON.stringify({message:'Chapter review: '+id+' sent back for a redo, note saved',content:crvB64(JSON.stringify(doc,null,1)+'\n'),branch:'main',sha:gj.sha})});
    if(w.ok) return true;
    if(w.status!==409&&w.status!==422) throw new Error('GitHub said '+w.status+' while saving your note.');
    last=String(w.status);
  }
  throw new Error('The clip list kept changing under us. Try again in a minute. ('+last+')');
}
async function crvSend(id,note){
  const e=CRV.rows.find(r=>r.id===id); if(!e) return;
  if(!note.trim()) return crvSay('Type what looks wrong first.');
  crvSay('Saving your note...');
  try { await crvReject(id,note.trim()); CRV.sent[id]=1; CRV.redo=''; crvPaint(); crvSay('REDO sent for '+crvLabel(e)+'. It is made again in the next batch, after Claude fixes its prompt.'); }
  catch(err) { crvSay(String(err.message||err)); }
}
function crvOpen(group,name){
  crvClose(); CRV.on=true; CRV.group=group; CRV.name=name||group+' REVIEW'; CRV.rows=[]; CRV.sent={}; CRV.cur=''; CRV.queue=[]; CRV.all=false; CRV.redo=''; CRV.fold=false; CRV.fbefore=null; CRV.total=0; CRV.say='Loading the clip list...';
  const host=document.getElementById('battle')||document.getElementById('game'); if(!host) return;
  const el=document.createElement('div'); el.id='crv'; el.className='crv';
  el.innerHTML='<div class="crv-top"><b>'+crvEsc(CRV.name)+'</b><button type="button" data-crv="new">PLAY NEW</button><button type="button" data-crv="all">PLAY ALL</button><button type="button" data-crv="stop">STOP</button><button type="button" data-crv="fold">HIDE</button></div><div class="crv-msg" role="status"></div><div class="crv-list"></div>';
  for(const t of ['pointerdown','pointerup','click','touchstart','keydown','keyup','keypress']) el.addEventListener(t,ev=>ev.stopPropagation());
  el.addEventListener('click',ev=>{
    const b=ev.target.closest('[data-crv]'); if(!b||b.disabled) return; const a=b.dataset.crv, row=b.closest('.crv-row'), e=row?CRV.rows.find(r=>r.id===row.dataset.id):null;
    if(a==='play'&&e){ CRV.all=false; CRV.queue=[]; crvPlay(e,false); }
    else if(a==='new'){ CRV.queue=CRV.rows.filter(r=>crvIsNew(r)&&BCLIPS[crvKey(r)]&&crvOnField(r.clip.owner)); CRV.total=CRV.queue.length; CRV.all=true; crvNext(); }
    else if(a==='all'){ CRV.queue=CRV.rows.filter(r=>BCLIPS[crvKey(r)]&&crvOnField(r.clip.owner)); CRV.total=CRV.queue.length; CRV.all=true; crvNext(); }
    else if(a==='stop') crvStop();
    else if(a==='fold'){ CRV.fold=!CRV.fold; CRV.fbefore=null; crvPaint(); }
    else if(a==='redo'&&e){ CRV.redo=CRV.redo===e.id?'':e.id; crvPaint(); const i=document.querySelector('#crv .crv-note input'); if(i) i.focus(); }
    else if(a==='cancel'){ CRV.redo=''; crvPaint(); }
    else if(a==='send'&&e){ const i=row.querySelector('.crv-note input'); crvSend(e.id,i?i.value:''); }
  });
  host.appendChild(el); crvPaint();
  crvEntries(group).then(rows=>{ if(!CRV.on) return; CRV.rows=rows.slice().sort((a,b)=>(crvIsNew(b)?1:0)-(crvIsNew(a)?1:0)); CRV.say=rows.length?(CRV.rows.some(crvIsNew)?'Clips marked NEW were made again and are at the top: PLAY NEW. The rest are the old clips. ':'')+'Tap PLAY on a clip, or PLAY ALL. REDO sends a clip back with a note.':'No clips in "'+group+'" yet. Make them in ADMIN > ART LIBRARY > Clips > '+group+' > GENERATE CHAPTER.'; crvPaint(); })
    .catch(err=>{ CRV.say=String(err.message||err); crvPaint(); });
}
function crvClose(){ CRV.on=false; CRV.all=false; CRV.queue=[]; const el=document.getElementById('crv'); if(el) el.remove(); }
(function(){ const st=document.createElement('style');
  st.textContent='.crv{position:absolute;z-index:60;left:0;right:0;bottom:0;max-height:44%;display:flex;flex-direction:column;background:#10151fee;color:#fff4d3;border-top:2px solid #fff1c780;font:12px "Trebuchet MS",system-ui,sans-serif;touch-action:pan-y}'+
  'html.landscape .crv{left:auto;top:0;width:min(46%,420px);max-height:none;border-top:0;border-left:2px solid #fff1c780}'+
  '.crv.fold{max-height:none;height:auto}.crv.fold .crv-list{display:none}html.landscape .crv.fold{bottom:auto}'+
  '.crv-top{display:flex;gap:6px;align-items:center;padding:6px 8px}.crv-top b{flex:1;letter-spacing:.6px}'+
  '.crv button{min-height:32px;padding:0 10px;border:2px solid #fff1c766;border-radius:6px;background:#0b0d12;color:#fff1cb;font:inherit;font-weight:900;letter-spacing:.5px;touch-action:manipulation}.crv button:disabled{opacity:.35}'+
  '.crv-msg{padding:0 8px 4px;color:#cfd8ff;min-height:16px}.crv-list{overflow:auto;padding:0 8px 8px;-webkit-overflow-scrolling:touch}'+
  '.crv-row{border-top:1px solid #ffffff1c;padding:4px 0}.crv-row.playing{background:#2f9e6330}.crv-line{display:flex;gap:6px;align-items:center}.crv-name{flex:1;min-width:0}'+
  '.crv-chip{font-size:10px;padding:2px 6px;border-radius:9px;background:#2c2852;color:#b9b3e6;white-space:nowrap}.crv-chip.ok{background:#2f9e63;color:#fff}.crv-chip.warn{background:#ffd34d;color:#241b00}'+
  '.crv-note{display:flex;gap:6px;margin-top:4px}.crv-note input{flex:1;min-width:0;min-height:32px;border-radius:6px;border:2px solid #fff1c766;background:#0b0d12;color:#fff4d3;padding:0 8px;font:inherit}.crv-empty{padding:10px 0;color:#b9b3e6}';
  document.head.appendChild(st); })();
