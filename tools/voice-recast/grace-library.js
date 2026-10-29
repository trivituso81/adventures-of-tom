// Voice Library browser for the Grace baker (ElevenLabs refuses to design child voices, so Grace is picked from the library).
const LIB={q:'young girl',res:[],busy:'',err:'',used:''};
function libHtml(){
  let h='<h2>Pick Grace from the library</h2><div class="hint" style="margin-bottom:6px">Search ElevenLabs\' Voice Library, play the previews, press <b>Use this voice</b>. Pick a girl who sounds a real nine, and not like Rose (Lulu) or Amy.</div>';
  h+='<div class="row"><input type="text" id="libq" value="'+esc(LIB.q)+'" placeholder="young girl, kid, bubbly..." style="flex:1;min-width:0"><button class="btn" id="libgo"'+(LIB.busy?' disabled':'')+'>Search</button></div>';
  h+='<div class="row" style="margin-top:6px;flex-wrap:wrap;gap:6px">'+['young girl','kid','child','bubbly girl','sassy girl','cartoon girl','teen girl'].map(q=>'<button class="btn small" data-lq="'+q+'">'+q+'</button>').join('')+'</div>';
  if(LIB.busy)h+='<div class="busy" style="margin-top:6px">'+esc(LIB.busy)+'</div>';
  if(LIB.err)h+='<div class="err" style="margin-top:6px">'+esc(LIB.err)+'</div>';
  if(LIB.used)h+='<div class="note" style="margin-top:6px"><span style="color:var(--mint)">Voice set:</span> <b>'+esc(LIB.used)+'</b></div>';
  h+='<div class="previews" style="margin-top:8px">'+LIB.res.map((v,i)=>'<div class="pv" style="flex-wrap:wrap"><button class="play" data-lp="'+i+'">&#9654;</button><span class="hint" style="flex:1;min-width:0"><b>'+esc(v.name||'')+'</b><br>'+esc((v.description||'').slice(0,110))+'</span><button class="btn small" data-lu="'+i+'"'+(LIB.busy?' disabled':'')+'>Use this voice</button></div>').join('')+'</div>';
  return h;
}
function renderLib(){const p=$('libPanel');if(!p)return;p.innerHTML=libHtml();$('libq').onchange=e=>{LIB.q=e.target.value;};$('libq').onkeydown=e=>{if(e.key==='Enter'){LIB.q=e.target.value;libGo();}};$('libgo').onclick=()=>{LIB.q=$('libq').value;libGo();};}
async function libSearch(q){need();const u=new URL('https://api.elevenlabs.io/v1/shared-voices');u.searchParams.set('page_size','24');u.searchParams.set('gender','female');u.searchParams.set('language','en');u.searchParams.set('sort','trending');if(q)u.searchParams.set('search',q);
  const r=await fetch(u,{headers:{'xi-api-key':apiKey()}});if(!r.ok)throw new Error(await apiErr(r));const j=await r.json();return j.voices||[];}
async function libGo(){LIB.busy='Searching...';LIB.err='';renderLib();try{LIB.res=await libSearch(LIB.q);if(!LIB.res.length)LIB.err='No voices matched. Try another word.';}catch(e){LIB.err=e.message||String(e);}LIB.busy='';renderLib();}
async function libUse(v){need();const nm='AoT Grace ('+String(v.name||'library').split(/\s[-–—]\s/)[0].trim()+')';
  const add=()=>fetch('https://api.elevenlabs.io/v1/voices/add/'+encodeURIComponent(v.public_owner_id)+'/'+encodeURIComponent(v.voice_id),{method:'POST',headers:{'xi-api-key':apiKey(),'Content-Type':'application/json'},body:JSON.stringify({new_name:nm})});
  let r=await add();
  if(!r.ok){const m=await apiErr(r);
    if(/limit|maximum|slot|quota/i.test(m)&&CFG.grace.old_id){const d=await fetch('https://api.elevenlabs.io/v1/voices/'+encodeURIComponent(CFG.grace.old_id),{method:'DELETE',headers:{'xi-api-key':apiKey()}});if(d.ok||d.status===404)r=await add();else throw new Error(m);}
    else throw new Error(m);}
  if(!r.ok)throw new Error(await apiErr(r));
  const j=await r.json();if(!j.voice_id)throw new Error('No voice ID came back.');setVoice('grace',j.voice_id,nm);return nm;}
document.addEventListener('click',e=>{
  const q=e.target.closest('[data-lq]');if(q){LIB.q=q.dataset.lq;libGo();return;}
  const p=e.target.closest('[data-lp]');if(p){const v=LIB.res[+p.dataset.lp];if(v&&v.preview_url)playSrc(v.preview_url,p);return;}
  const u=e.target.closest('[data-lu]');if(u){const v=LIB.res[+u.dataset.lu];if(!v)return;LIB.busy='Saving this voice...';LIB.err='';renderLib();
    libUse(v).then(n=>{LIB.used=n;LIB.busy='';renderLib();}).catch(er=>{LIB.err=er.message||String(er);LIB.busy='';renderLib();});}
});
renderLib();
