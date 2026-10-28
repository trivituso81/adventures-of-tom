()=>{
const out=[]; let ord=0;
const add=(speaker,text,src,extra={})=>{ if(typeof text!=='string'||!text.trim()) return; out.push(Object.assign({speaker,text,src,order:ord++},extra)); };
const errs=[];
const walk=(x,src,depth=0)=>{
  if(!x||depth>40) return;
  if(Array.isArray(x)) { x.forEach(s=>walk(s,src,depth+1)); return; }
  if(typeof x!=='object') return;
  if(x.talk) { const L=Array.isArray(x.lines)?x.lines:[x.lines]; L.forEach((t,i)=>add(x.talk,t,src)); }
  for(const k of Object.keys(x)) { if(k==='lines'||k==='talk'||k==='voice') continue; const v=x[k]; if(v&&typeof v==='object') walk(v,src,depth+1); }
};
const hadLure=typeof bag!=='undefined'&&bag.includes('lure'); if(typeof bag!=='undefined'&&!hadLure) bag.push('lure');
for(const id of Object.keys(SCENES)) { let s=SCENES[id]; if(typeof s==='function') { try { s=s({}); } catch(e) { errs.push('scene '+id+' '+e); s=null; } } walk(s,'scene:'+id); }
if(typeof bag!=='undefined'&&!hadLure) bag.splice(bag.indexOf('lure'),1);
const cond=w=>{ const o={}; for(const k in w) if(!['lines','revisit','hug'].includes(k)) o[k]=typeof w[k]==='function'?String(w[k]).slice(0,200):w[k]; return JSON.stringify(o); };
for(const [mid,map] of Object.entries(worlds)) {
  for(const n of (map.npcs||[])) {
    if(n.monster) continue;
    for(const f of ['lines','revisit','hug']) {
      for(const w of (n.when||[])) if(w[f]!==undefined) [].concat(w[f]).forEach(t=>add(n.name,t,'npc:'+mid+':'+f+':when',{map:mid,cond:cond(w)}));
      if(n[f]!=null) [].concat(n[f]).forEach(t=>add(n.name,t,'npc:'+mid+':'+f,{map:mid}));
    }
    if(n.shopkeeper) { const K=n.shopLines||PENNY; (K.intro||[]).forEach(t=>add(n.name,t,'shop:intro',{map:mid})); (K.hello||[]).forEach(t=>add(n.name,t,'shop:hello',{map:mid})); }
  }
}
for(const id of Object.keys(MONSTERS)) { const d=MONSTERS[id]; for(const k of ['talk','again','rest','win','lose']) (d[k]||[]).forEach(t=>add(d.name,t,'monster:'+id+':'+k,{monster:id})); }
const NAMES={tom:'Tom',grace:'Grace',rose:'Rose',amy:'Amy',deedee:'Deedee',boppy:'Boppy',tnb:'TNB',nara:'Nara'};
for(const N of Object.keys(CHAPTERS)) { const ch=CHAPTERS[N]; const dec=(ch.party&&ch.party.decline)||{}; for(const id in dec) add(NAMES[id]||id,dec[id],'decline:'+N+':'+id);
  try { const nf=typeof ch.noFlight==='function'?(()=>{ const sv=STORY.flags; STORY.flags={}; const r=ch.noFlight(); STORY.flags=sv; return r; })():ch.noFlight; if(nf&&nf.lines) nf.lines.forEach(t=>add('Sal',t,'noflight:'+N)); } catch(e) {} }
if(typeof RECRUIT_TALK!=='undefined') for(const id in RECRUIT_TALK) { const T=RECRUIT_TALK[id]; for(const k of ['ask','yes','no','swap']) if(T[k]) add(NAMES[id]||id,T[k],'recruit:'+id+':'+k); (T.lines||[]).forEach(t=>add(NAMES[id]||id,t,'follower:'+id)); }
if(typeof TRAVEL_TALK!=='undefined') for(const id in TRAVEL_TALK) (TRAVEL_TALK[id].stay||[]).forEach(t=>add(NAMES[id]||id,t,'travel:stay:'+id));
if(typeof DEPARTURES!=='undefined') for(const N in DEPARTURES) { const D=DEPARTURES[N];
  (D.driver||[]).forEach(t=>add('Sal',t,'dep:'+N+':driver')); if(D.sol) add('Sol',D.sol,'dep:'+N+':sol');
  for(const who of ['grace','rose','tom','tnb']) (D[who]||[]).forEach(t=>add(NAMES[who],t,'dep:'+N+':'+who));
  for(const id in (D.stay||{})) (D.stay[id].stay||[]).forEach(t=>add(NAMES[id]||id,t,'dep:'+N+':stay:'+id));
  (D.flight||[]).forEach(t=>add('Tom',t,'dep:'+N+':flight')); }
if(typeof ARRIVALS!=='undefined') for(const N in ARRIVALS) { const A=ARRIVALS[N]; (A.tom||[]).forEach(t=>add('Tom',t,'arr:'+N+':tom')); (A.talk||[]).forEach(([sp,pages])=>pages.forEach(t=>add(sp,t,'arr:'+N+':'+sp))); }
const inLines=(sp,t)=>{ const id={Tom:'tom',Grace:'grace',Rose:'rose',Amy:'amy',Deedee:'deedee',Boppy:'boppy',TNB:'tnb'}[sp]; if(!id||!LINES[id]) return false; return Object.values(LINES[id]).some(a=>Array.isArray(a)?a.includes(t):a===t); };
for(const o of out) o.inLines=inLines(o.speaker,o.text);
const btexts={}; for(const ch in VOICE_CLIPS.clips) { btexts[ch]=[]; for(const k in VOICE_CLIPS.clips[ch]) for(const c of VOICE_CLIPS.clips[ch][k]||[]) if(c&&c.text) btexts[ch].push(c.text); }
return {out,errs,speakers:DIALOG_CAST.speakers,lines:JSON.parse(JSON.stringify(LINES)),clipkeys:Object.keys(DIALOG_CLIPS.clips),btexts};
}
