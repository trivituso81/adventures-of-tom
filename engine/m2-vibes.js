'use strict';
// engine/m2-vibes.js: the Vibes and Gear pages of the new main menu (card menu2; drawings vibes_duo, vibes_late_duo, vibes_phone, gear_duo,
// gear_phone in claude/menuux-mock/shots; plan claude/menuux-plan.md sections 3 and 4). Built on the page system of engine/m2-core.js.
// The rules are the new battle's own (engine/b3-progress.js: b3SetMain, b3SetPocket, b3SetQuirk, b3SetRow, b3PoolShift, b3PoolConfirm;
// engine/b3-core.js: b3LevelStats, b3GearSum). This file draws and calls them; it holds no rule of its own.
// One shared header on both pages: the faces of the party and a button for the bench, the person at their real height, level and XP, and
// Health, Attack, Defense and Speed worked out the way a fight works them out for that loadout and that gear (m2Stats).
// Bench members keep their Vibes and gear, so the faces switch between the party and the bench.
// The DETAILS setting ("Show what each skill does") is saved as M2_DET_KEY and is meant to be the one switch for this menu and the battle
// screen (b3look: engine/b3-deck.js b3Details reads and writes the same key; with nothing saved the battle screen is on for a wide window only). The flavor symbols are the six flat ones of the battle mock (claude/battleux-mock/src/app.js IC).
const M2_DET_KEY='aot-b3-details';
function m2Details() { try { return localStorage.getItem(M2_DET_KEY)!=='off'; } catch(e) { return true; } }
function m2SetDetails(on) { try { localStorage.setItem(M2_DET_KEY,on?'on':'off'); } catch(e) {} }
const M2_FLSVG={
  clobber:'<path d="M8 0l1.7 4.2L13.7 2.3 11.8 6.3 16 8l-4.2 1.7 1.9 4-4-1.9L8 16l-1.7-4.2-4 1.9 1.9-4L0 8l4.2-1.7-1.9-4 4 1.9z"/>',
  sizzle:'<path d="M8.6 0c.5 2.6-.7 3.9-2 5.3C5.2 6.8 4 8.2 4 10.4 4 13.5 6 16 8 16s4-2.3 4-5.4c0-1.7-.7-2.9-1.4-3.9-.3 1.2-.9 1.8-1.7 2.1C9.6 6 10.3 2.5 8.6 0z"/>',
  drench:'<path d="M8 0C6 3.4 3 6.6 3 10.2 3 13.4 5.2 16 8 16s5-2.6 5-5.8C13 6.6 10 3.4 8 0z"/>',
  razzle:'<path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z"/>',
  racket:'<path d="M1 5.5h2.8L9 2v12L3.8 10.5H1z"/><path d="M11 5.2c1.3 1.5 1.3 4.1 0 5.6M12.9 3.3c2.3 2.6 2.3 6.8 0 9.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  support:'<path d="M8 14.7C3.3 11.2 1 8.6 1 5.7 1 3.6 2.6 2 4.6 2c1.3 0 2.6.7 3.4 1.9C8.8 2.7 10.1 2 11.4 2 13.4 2 15 3.6 15 5.7c0 2.9-2.3 5.5-7 9z"/>'};
Object.assign(M2_ICON,{
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
  spark:'<path d="M11 3l2.1 5.9L19 11l-5.9 2.1L11 19l-2.1-5.9L3 11l5.9-2.1z"/>',
  up:'<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',
  back:'<path d="M15 5l-7 7 7 7"/>'});
function m2FlIcon(flavors,size) {
  const f=(flavors&&flavors[0])||'clobber',c=(B3_FLAVORS[f]||{}).color||'#ddd';
  return '<span class="m2-fl" style="background:'+c+'" aria-hidden="true"><svg viewBox="0 0 16 16" width="'+size+'" height="'+size+'" fill="currentColor">'+(M2_FLSVG[f]||'')+'</svg></span>';
}
const m2FlName=flavors=>(flavors||[]).map(f=>(B3_FLAVORS[f]||{}).name||f).join(' and ');

// ---------- Who the page is about ----------
// The Battle Lab door (M2.lab) shows the four who fight there and edits the Lab's own book (b3LabBook), not the party's loadouts.
const m2LabPeople=()=>(M2.labIds||[]).map(id=>ALL_MEMBERS().find(m=>m.id===id)).filter(Boolean);
const m2People=()=>M2.lab?m2LabPeople():party.concat(m2Bench());
const m2FaceList=()=>M2.lab?m2LabPeople():(M2.bench?m2Bench():party);
function m2Who() { const all=m2People(); let m=all.find(x=>x.id===M2.who); if(!m) { m=M2.lab?all[0]:(party[Math.min(M2.sel,party.length-1)]||party[0]); M2.who=m.id; } return m; }
const m2Loadout=m=>(m&&b3HasKit(m.id))?(M2.lab?b3LabBook()[m.id]||null:b3MemberLoadout(m)):null;
const m2InParty=m=>M2.lab||party.includes(m);
function m2Hint(m) { return wearSlots(m).some(s=>bestFor(m,s)); }

// Health, Attack, Defense and Speed as a fight works them out (engine/b3-core.js b3PartyUnit): the level line times the member's own
// factor, the Main Vibe's Lean, then worn gear (flat points added, percent perks multiplied in). `list` is a worn-item list to try.
function m2Stats(m,list) {
  const S=b3LevelStats(m.level),C=B3_CAST[m.id],L=m2Loadout(m),lean=(L&&b3VibeOf(L.main).lean&&B3_RULES.leans[b3VibeOf(L.main).lean])||{};
  const G=b3GearSum(list||wearSlots(m).map(s=>m.equipment[s]&&items[m.equipment[s]])),o={};
  for(const k of ['hp','atk','def','spd']) {
    let v=S[k]*((C&&C.stat&&C.stat[k])||1)*(k==='hp'?1+(lean.hp||0):1); v=Math.round(v)+G.flat[k];
    if(k!=='hp') v=v*(1+(lean[k]||0))*(1+(G.pct[k]||0));
    o[k]=Math.round(v);
  }
  return o;
}
const M2_STATN=[['hp','Health'],['atk','Attack'],['def','Defense'],['spd','Speed']];
function m2WornWith(m,slot,id) { return wearSlots(m).map(s=>s===slot?(id?items[id]:null):(m.equipment[s]&&items[m.equipment[s]])); }
function m2Diff(m,slot,id) { const a=m2Stats(m),b=m2Stats(m,m2WornWith(m,slot,id)),d={}; for(const [k] of M2_STATN) d[k]=b[k]-a[k]; return d; }
function m2DiffText(d) { const p=M2_STATN.filter(([k])=>d[k]).map(([k,n])=>n+' '+(d[k]>0?'+':'')+d[k]); return p.length>1?p.slice(0,-1).join(', ')+' and '+p[p.length-1]:p[0]||''; }

// ---------- The shared header ----------
function m2Faces(m0) {
  const list=m2FaceList(),bn=M2.lab?0:m2Bench().length;
  let h='<div class="m2-fr" role="tablist" aria-label="Family member">';
  for(const m of list) {
    const up=M2.tab==='gear'&&m2Hint(m);
    h+='<button type="button" role="tab" class="m2-fc" data-m2="who" data-a="'+m.id+'" data-k="w-'+m.id+'" aria-selected="'+(m.id===m0.id)+'" aria-label="'+m2Esc(m.name)+(m.hp<=0?', knocked out':'')+(up?', the bag holds something better':'')+'"><span class="m2-fi">'+m2Face(m.id)+'</span>'+(up?'<i class="m2-fu" aria-hidden="true">'+m2Icon('up',12,3)+'</i>':'')+'</button>';
  }
  if(!M2.lab&&(bn||M2.bench)) h+='<button type="button" class="m2-more" data-m2="bench" data-k="bench" aria-pressed="'+!!M2.bench+'">'+(M2.bench?'Party':'+'+bn)+'<span class="m2-ml">'+(M2.bench?'':' bench')+'</span></button>';
  return h+'</div>';
}
function m2NameBlock(m,tall) {
  const top=m.level>=B6.maxLevel,xp=top?1:m.xp/B6.xpPerLevel;
  if(tall) return '<div class="m2-hn"><b>'+m2Esc(m.name)+'</b><span>Level '+m.level+'</span></div>';
  // one line: the name, Lv N beside it and the XP still to go at the right, the bar under it (build vibelayout1)
  return '<div class="m2-who"><div class="m2-nl"><b class="m2-wn">'+m2Esc(m.name)+'</b><span class="m2-lvl">Lv '+m.level+'</span>'+
    '<span class="m2-xt">'+(top?'Top level':(B6.xpPerLevel-m.xp)+' XP to Lv '+(m.level+1))+'</span></div>'+
    '<span class="m2-xb" role="img" aria-label="'+(top?'Top level':(B6.xpPerLevel-m.xp)+' experience to level '+(m.level+1))+'"><i style="width:'+Math.round(xp*100)+'%"></i></span></div>';
}
function m2StatRow(m,delta) {
  const s=m2Stats(m);
  return '<div class="m2-stats" role="group" aria-label="Health, Attack, Defense and Speed">'+M2_STATN.map(([k,n])=>{
    const d=delta&&delta[k];
    return '<div class="m2-st"><span>'+n+'</span><b>'+s[k]+'</b>'+(d?'<i class="'+(d>0?'up':'dn')+'">'+(d>0?'+':'')+d+'</i>':'')+'</div>'; }).join('')+'</div>';
}
function m2Header(m,d,delta) {
  if(!d.wide) return '<div class="m2-hd">'+'<div class="m2-hr">'+m2Faces(m)+m2NameBlock(m,true)+'</div>'+m2StatRow(m,delta)+'</div>';
  const fig=(typeof WALK_SCALE!=='undefined'&&m2Inches(m))?'<div class="m2-hero"><img class="m2-hfig" data-id="'+m.id+'" src="art/menu/'+m.id+'.webp?v='+M2_V+'" alt="" draggable="false"></div>':'<div class="m2-hero"></div>';
  return m2Faces(m)+'<div class="m2-stage">'+fig+m2NameBlock(m,false)+'</div>'+m2StatRow(m,delta);
}

// ---------- Vibes ----------
// The page (build vibelayout1): the Vibe Loadout on the left under the four numbers (one card per Vibe with its Primary, Secondary and Off
// control, then the Row and the two Quirk slots), and on the right the abilities of the Vibe whose card is picked.
Object.assign(M2_ICON,{
  sword:'<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
  bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>'});
const M2_LEANI={guard:'shield',striker:'sword',tempo:'bolt',support:'spark'};
const M2_LEANN={hp:'HP',atk:'Attack',def:'Def',spd:'Speed',healGiven:'Heals'};
// "+15% HP & Def": what the Vibe's Lean gives, short (the full words are B3_LEANS in data/b3-rules.js).
function m2LeanShort(V) {
  const l=V.lean&&B3_RULES.leans[V.lean]; if(!l) return 'No stat bonus';
  const ks=Object.keys(l); return '+'+Math.round(l[ks[0]]*100)+'% '+ks.map(k=>M2_LEANN[k]||k).join(' & ');
}
const M2_TGT={foe:'1 Foe',ally:'1 Ally',family:'Family',self:'Self',random_foes:'Random Foes',all_foes:'All Foes',ko_ally:'Downed Ally',adjacent_allies:'Adjacent Allies',field:'Field',ally_pair:'Ally Pair',family_or_ko:'Family',foe_row:'Foe Row',either:'Anyone'};
// A status named in a description gets a small chip (names come from B3_STATUS; matched exactly as written).
let m2StNames=null;
function m2Chipify(text) {
  if(!m2StNames) { const n=[...new Set(Object.values(B3_STATUS||{}).map(s=>s&&s.name).filter(x=>x&&x.length>=4&&!/['’]/.test(x)).concat(['Composure']))].sort((a,b)=>b.length-a.length);
    m2StNames=n.length?new RegExp('(^|[^A-Za-z])('+n.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![A-Za-z])','g'):/(?!)/; }
  return m2Esc(text).replace(m2StNames,(a,p,s)=>p+'<span class="m2-sc">'+s+'</span>');
}
// Casual Mode (Freelancer) card and count: open once every Vibe is mastered.
const m2Mastered=(m,L)=>B3_CAST[m.id].vibes.filter(v=>b3Mastered(L,v)).length;
function m2LoadoutHead(m,L) {
  const ids=B3_CAST[m.id].vibes,n=m2Mastered(m,L),open=b3CasualOpen(m.id,L);
  return '<div class="m2-lh"><h3>Vibe Loadout</h3><span class="m2-fcount'+(open?' open':'')+'" role="img" aria-label="'+(open?'Freelancer, Casual Mode, open':'Freelancer, Casual Mode, opens when all '+ids.length+' Vibes are mastered ('+n+' so far)')+'">Freelancer: '+n+'/'+ids.length+' '+
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15"><path d="'+M2_STAR+'" fill="currentColor"/></svg></span></div>';
}
function m2VibeCard(m,L,v) {
  const free=b3IsFree(v),V=b3VibeOf(v),role=L.main===v?'main':(L.pocket===v||L.pocket2===v)?'pocket':'none',sel=v===M2.vibe;
  const max=b3MaxRank(),rk=free?max:b3VibeRank(L,v),mast=rk>=max;
  let line2,line3,frac;
  if(free) { line2='Casual Mode'; line3='<span class="m2-vi">'+m2Icon('spark',14)+'</span>No stat bonus'; frac=1; }
  else {
    const vp=L.vp[v]||0,T=B3_RULES.rankVp,next=mast?b3MasterVp():T[rk];
    line2=(mast?'Mastered':'<b>'+vp+'</b>/'+next+'<span class="m2-vpw"> VP</span>'); frac=mast?1:Math.max(0,Math.min(1,vp/next));
    line3='<span class="m2-vi">'+m2Icon(M2_LEANI[V.lean]||'spark',14)+'</span>'+m2Esc(m2LeanShort(V))+(role==='main'?'':'<span class="m2-sfx"> (Primary)</span>');
  }
  const seg=(act,on,t,extra)=>'<button type="button" class="m2-seg '+act+(on?' on':'')+'" data-m2="'+act+'" data-a="'+v+'" data-k="'+act+'-'+v+'" aria-pressed="'+on+'">'+t+'</button>';
  return '<div class="m2-vcard '+role+(free?' free':'')+(sel?' sel':'')+'">'+
    '<button type="button" class="m2-vcb" data-m2="vibe" data-a="'+v+'" data-k="vc-'+v+'" aria-pressed="'+sel+'" aria-label="'+m2Esc(V.name)+', see its abilities">'+
      '<b>'+m2Esc(V.name)+'</b><span class="m2-vm">'+m2Stars(rk,max,11)+'<span>'+line2+'</span></span><span class="m2-vlean">'+line3+'</span></button>'+
    '<div class="m2-segs m2-rs" role="group" aria-label="'+m2Esc(V.name)+' is">'+seg('main',role==='main','Primary')+(free?'':seg('pocket',role==='pocket','Secondary'))+seg('off',role==='none','Off')+'</div>'+
    '<span class="m2-vbar" aria-hidden="true"><i style="width:'+Math.round(frac*100)+'%"></i></span></div>';
}
function m2LoadoutHtml(m,L) {
  const ids=B3_CAST[m.id].vibes.slice(),open=b3CasualOpen(m.id,L);
  let h='<div class="m2-lo">'+m2LoadoutHead(m,L)+'<div class="m2-cards">'+ids.map(v=>m2VibeCard(m,L,v)).join('')+(open?m2VibeCard(m,L,B3_FREELANCER):'')+'</div></div>';
  return h;
}
// What each number would do if the Vibe being looked at became the Primary (the +/- shown on the Gear screen).
function m2VibeDelta(m,L) {
  if(!L||M2.pick!=null||!B3_VIBES[M2.vibe]||L.main===M2.vibe) return null;
  const a=m2Stats(m),keep=L.main; L.main=M2.vibe; let b; try { b=m2Stats(m); } finally { L.main=keep; }
  const d={}; for(const [k] of M2_STATN) d[k]=b[k]-a[k]; return d;
}
const m2First=s=>String(s||'').split(/(?<=[.!?])\s/)[0];
// One row of a Vibe: its icon, its words, what kind of thing it is and what it costs (r from b3Ladder).
function m2RowInfo(r,L,role) {
  const S=B3_SKILLS[r.id],Q=B3_QUIRKS[r.id],T=B3_TRAITS[r.id];
  if(r.kind==='trait') return {icon:'<span class="m2-fl t">'+m2Icon('shield',16)+'</span>',tag:'Trait',desc:T?T.desc:'',pill:role==='main'?'Passive':'Primary only',pc:'soft'};
  if(r.kind==='quirk') return {icon:'<span class="m2-fl q">'+m2Icon('spark',16)+'</span>',tag:'Quirk',desc:Q?Q.desc:'',pill:L.quirks.includes(r.id)?'In a slot':'',pc:'soft'};
  const fn=m2FlName(S&&S.flavor),tag=r.kind==='basic'?fn+' basic':r.kind==='cap'?'Capstone':fn+' skill';
  return {icon:m2FlIcon(S&&S.flavor,16),tag,desc:S?S.desc:'',target:S&&M2_TGT[S.target],pill:r.kind==='basic'?'Free':(S&&S.pep!=null?S.pep+' Pep':''),pc:r.kind==='basic'?'ok':'pep'};
}
function m2KitRow(r,V,L,role,fresh) {
  const I=m2RowInfo(r,L,role),showD=m2Details();
  const soon=r.built?'':' <small class="m2-soon-t">Not working in this build yet</small>';
  return '<div class="m2-kr"><span>'+I.icon+'</span><div class="m2-kh"><b>'+m2Esc(r.name)+'</b><small class="m2-ch">'+I.tag+'</small>'+(I.target?'<small>· '+I.target+'</small>':'')+(fresh?'<span class="m2-newt">New</span>':'')+'</div>'+
    (I.pill?'<span class="m2-kc"><span class="m2-pill '+I.pc+'">'+I.pill+'</span></span>':'')+(showD?'<p>'+m2Chipify(I.desc)+soon+'</p>':'')+'</div>';
}
// A Rank not reached yet: one tap row, and a tap opens its words under it.
function m2FutureRow(r,L,role) {
  const I=m2RowInfo(r,L,role),on=M2.peekRow===r.id;
  return '<button type="button" class="m2-fut'+(on?' on':'')+'" data-m2="peekrow" data-a="'+r.id+'" data-k="pr-'+r.id+'" aria-expanded="'+on+'"><span>'+I.icon+'</span><span class="m2-ft"><b>'+m2Esc(r.name)+'</b><small>· '+I.tag+'</small></span>'+
    '<span class="m2-kc">'+(r.kind==='skill'||r.kind==='cap'?(function(){ const S=B3_SKILLS[r.id]; return S&&S.pep!=null?'<span class="m2-pp"><b>'+S.pep+'</b> Pep</span>':''; })():'')+'<em class="m2-rk">Rank '+r.rank+'</em></span></button>'+
    (on?'<p class="m2-peek">'+(I.desc?m2Chipify(I.desc):'Not working in this build yet.')+'</p>':'');
}
// The title row of the abilities panel: its name at the left and the Descriptions switch at the right.
function m2DetailSwitch() {
  const on=m2Details();
  return '<button type="button" class="m2-dsw" role="switch" aria-checked="'+on+'" data-m2="details" data-k="details"><span>Descriptions</span><span class="m2-tog" aria-hidden="true"><i></i></span></button>';
}
function m2AbHead(title,role,sub,free) {
  const st=role==='main'?(free?'All Traits & your Basic Active':'Trait, Basic & Skills Active'):role==='pocket'?'Skills Active':'Not in use';
  return '<div class="m2-ah"><h2>'+m2Esc(title)+' Abilities</h2>'+m2DetailSwitch()+'</div>'+
    '<div class="m2-as"><span class="m2-pill '+(role==='none'?'soft':'ok')+'">'+st+'</span>'+(sub?'<span class="m2-sub">'+m2Esc(sub)+'</span>':'')+'</div>';
}
function m2SharedCmd() {
  const P=B3_RULES.pickMeUp;
  return '<div class="m2-shared"><span><b>Shared Command: Pick-Me-Up</b> · Revives ally at '+Math.round(P.hp*100)+'% HP</span><span class="m2-pill pep">'+P.pep+' Pep</span></div>';
}
// Casual Mode's page (spec section 1: "Freelancer"): its Traits, the Basic to use and the two Secondary Vibes. The pickers show only while it is the Primary Vibe.
function m2FreeDetail(m,L) {
  const ids=B3_CAST[m.id].vibes,main=L.main===B3_FREELANCER,seg=(on,act,a,k,t)=>'<button type="button" class="m2-seg'+(on?' on':'')+'" data-m2="'+act+'" data-a="'+a+'" data-k="'+k+'" aria-pressed="'+on+'">'+m2Esc(t)+'</button>';
  let h={head:m2AbHead('Freelancer',main?'main':'none','Casual Mode',true),body:''},b='';
  b+='<div class="m2-lean">'+m2Icon('shield',17)+'<span>No stat bonus. It earns no Vibe Points, because every Vibe is mastered.</span></div>';
  if(main) {   // the pickers come first, so they are on screen without scrolling past the three Traits
    b+='<div class="m2-lab">Basic action</div><div class="m2-segs m2-frs" role="group" aria-label="Basic action">'+ids.map(v=>{ const bs=B3_VIBES[v].basic,S=B3_SKILLS[bs]; return seg(L.basic===bs,'fbasic',bs,'fb-'+bs,S?S.name:bs); }).join('')+'</div>';
    for(const slot of [0,1]) { const cur=slot?L.pocket2:L.pocket;
      b+='<div class="m2-lab">Secondary Vibe '+(slot+1)+'</div><div class="m2-segs m2-frs" role="group" aria-label="Secondary Vibe '+(slot+1)+'">'+ids.map(v=>seg(cur===v,'fpocket',slot+':'+v,'fp'+slot+'-'+v,B3_VIBES[v].name)).join('')+'</div>'; }
  } else b+='<p class="m2-note">As the Primary Vibe, Freelancer gives two Secondary Vibes, a Basic action of your choice and all three Traits. Make it Primary on its card, then pick them here.</p>';
  b+='<div class="m2-lab m2-sec">Traits</div><div class="m2-kit">';
  for(const v of ids) { const V=B3_VIBES[v],T=B3_TRAITS[V.trait];
    b+='<div class="m2-kr"><span><span class="m2-fl t">'+m2Icon('shield',16)+'</span></span><div class="m2-kh"><b>'+m2Esc(T?T.name:V.trait)+'</b><small class="m2-ch">Trait</small><small>· '+m2Esc(V.name)+'</small></div><span class="m2-kc"><span class="m2-pill soft">'+(main?'Passive':'As Primary')+'</span></span>'+(m2Details()&&T?'<p>'+m2Chipify(T.desc)+'</p>':'')+'</div>'; }
  b+='</div><p class="m2-note">Make any other Vibe Primary on its card to go back to playing it.</p>';
  h.body=b; return h;
}
// The abilities panel: {head, body} so the title row stays put while the list scrolls.
function m2VibeDetail(m,L,fresh) {
  if(M2.vibe===B3_FREELANCER) return m2FreeDetail(m,L);
  const V=B3_VIBES[M2.vibe],rank=b3VibeRank(L,V.id),role=L.main===V.id?'main':(L.pocket===V.id||L.pocket2===V.id)?'pocket':'none';
  const rows=b3Ladder(V,rank),open=rows.filter(r=>r.open),fut=rows.filter(r=>!r.open);
  let b='<div class="m2-lab m2-sec">Unlocked abilities</div><div class="m2-kit">';
  for(const r of open) b+=m2KitRow(r,V,L,role,fresh&&r.rank===rank&&rank>1);
  b+='</div>';
  if(fut.length) {
    const lo=Math.min(...fut.map(r=>r.rank)),hi=Math.max(...fut.map(r=>r.rank));
    b+='<div class="m2-sech"><span class="m2-lab m2-sec">Future ranks (tap row to peek)</span><span class="m2-lab">'+(lo===hi?'Rank '+lo:'Ranks '+lo+' to '+hi)+'</span></div><div class="m2-kit">'+fut.map(r=>m2FutureRow(r,L,role)).join('')+'</div>';
  }
  b+=m2SharedCmd();
  if(!b3sOn()&&!M2.lab) b+='<button type="button" class="m2-link" data-m2="legacy" data-a="stamps" data-k="stampcard">Old Stampcard</button>';
  return {head:m2AbHead(V.name,role,b3Subtitle(V,rank)),body:b};
}
function m2PoolBlock(m,L) {
  if(!b3PoolOpen(L)) return '';
  const ids=B3_CAST[m.id].vibes;
  let h='<div class="m2-pool"><b>Split '+m2Esc(m.name)+'’s '+L.pool.total+' Vibe Points</b><span>They arrived with these. Split them once, then lock it in. 20 points a tap.</span><div class="m2-pr">';
  for(const v of ids) h+='<div class="m2-pc"><span>'+m2Esc(B3_VIBES[v].name)+'</span><div><button type="button" class="m2-pm" data-m2="poolminus" data-a="'+v+'" data-k="pm-'+v+'" aria-label="Take 20 points from '+m2Esc(B3_VIBES[v].name)+'">−</button><b>'+(L.vp[v]||0)+'</b><button type="button" class="m2-pm" data-m2="poolplus" data-a="'+v+'" data-k="pp-'+v+'" aria-label="Give 20 points to '+m2Esc(B3_VIBES[v].name)+'">+</button></div></div>';
  return h+'</div><button type="button" class="m2-btn on" data-m2="poollock" data-k="poollock">Lock it in</button></div>';
}
function m2QuirkSlots(m,L) {
  const pool=b3QuirkPool(m.id,L),U=B3_RULES.rankUnlock;
  return '<div class="m2-qrow">'+L.quirks.map((q,i)=>{
    const Q=q&&B3_QUIRKS[q];
    if(!pool.length) return '<div class="m2-qs lock">'+m2Icon('lock',16)+'<span>Quirk '+(i+1)+' (Rank '+(i?U.quirkB:U.quirkA)+')</span></div>';
    return '<button type="button" class="m2-qs'+(Q?' on':'')+'" data-m2="quirk" data-a="'+i+'" data-k="q-'+i+'" aria-label="Quirk slot '+(i+1)+': '+(Q?m2Esc(Q.name):'empty')+'. Choose a Quirk">'+m2Icon('spark',16)+'<span>'+(Q?m2Esc(Q.name):'Quirk '+(i+1)+': empty')+'</span></button>'; }).join('')+'</div>';
}
function m2LastFront(m,L) {
  if(!m2InParty(m)) return false;
  return !(M2.lab?m2LabPeople():party).some(o=>o!==m&&m2Loadout(o)&&b3RowOf(m2Loadout(o))==='front');
}
// The Lab's Rank picker: every Vibe of everyone in the Lab at one Rank (the Lab's own book, so the story is not touched).
function m2RankCtl() {
  if(!M2.lab) return '';
  const cur=b3LabRank();
  let b=''; for(let r=1;r<=b3MaxRank();r++) b+='<button type="button" class="m2-seg'+(r===cur?' on':'')+'" data-m2="rank" data-a="'+r+'" data-k="rank-'+r+'" aria-pressed="'+(r===cur)+'" aria-label="Rank '+r+'">'+r+'</button>';
  return '<div class="m2-lab">Every Vibe in the Battle Lab at Rank</div><div class="m2-segs m2-rankc" role="group" aria-label="Rank">'+b+'</div>';
}
function m2RowCtl(m,L) {
  const cur=b3RowOf(L),lock=m2LastFront(m,L);
  const b=(r,t)=>'<button type="button" class="m2-seg'+(cur===r?' on':'')+'" data-m2="row" data-a="'+r+'" data-k="row-'+r+'" aria-pressed="'+(cur===r)+'"'+(r==='back'&&lock&&cur!=='back'?' disabled':'')+'>'+t+'</button>';
  return '<div class="m2-rowc"><span class="m2-lab m2-sec">Row</span><div class="m2-segs">'+b('front','Front')+b('back','Back (-20%)')+'</div></div>'+(lock&&cur!=='back'?'<p class="m2-note">Someone has to stand in Front. Move another family member to the Front first.</p>':'');
}
function m2QuirkPick(m,L) {
  const slot=M2.pick,pool=b3QuirkPool(m.id,L);
  let h='<div class="m2-qh"><button type="button" class="m2-btn" data-m2="pickback" data-k="pickback">'+m2Icon('back',16)+'Back</button><h2>Choose a Quirk for slot '+(slot+1)+'</h2></div><div class="m2-qlist">';
  const rows=[];
  for(const v of B3_CAST[m.id].vibes) for(const r of b3Ladder(B3_VIBES[v],b3VibeRank(L,v))) if(r.kind==='quirk') rows.push({r,v});
  for(const {r,v} of rows) {
    const Q=B3_QUIRKS[r.id]; if(!Q) continue;
    const at=L.quirks.indexOf(r.id),open=pool.includes(r.id);
    if(!open) { h+='<div class="m2-qo lock"><span class="m2-fl lk">'+m2Icon('lock',16)+'</span><div><div class="m2-kh"><b>'+m2Esc(Q.name)+'</b><small>'+m2Esc(B3_VIBES[v].name)+'</small><span class="m2-kc"><em>Rank '+r.rank+'</em></span></div></div></div>'; continue; }
    h+='<button type="button" class="m2-qo'+(at===slot?' on':'')+'" data-m2="pick" data-a="'+r.id+'" data-k="pick-'+r.id+'"><span class="m2-fl q">'+m2Icon('spark',16)+'</span><div><div class="m2-kh"><b>'+m2Esc(Q.name)+'</b><small>'+m2Esc(B3_VIBES[v].name)+(at===slot?' · in this slot':at>=0?' · in slot '+(at+1)+', picking it trades the two':'')+'</small></div><p>'+m2Esc(m2Details()?Q.desc:m2First(Q.desc))+(Q.soon?' Not working in this build yet.':'')+'</p></div></button>';
  }
  h+='<button type="button" class="m2-qo empty" data-m2="pick" data-a="" data-k="pick-empty"><span class="m2-fl">'+m2Icon('x',16)+'</span><div><div class="m2-kh"><b>Leave it empty</b></div></div></button></div>';
  return h;
}
function m2VibesBody(d) {
  const m=m2Who(),L=m2Loadout(m);
  M2.freshNow=!!m.m2new; if(m.m2new) m.m2new=false;
  if(!L) {
    const none='<div class="m2-soon"><b>'+m2Esc(m.name)+'’s Vibes are not in this build yet.</b><span>They arrive with a later build of the new battle.</span></div>';
    return d.wide?{l:m2Header(m,d),r:none}:{l:'<div class="m2-hd">'+m2Faces(m)+'</div>'+none,r:'',single:true};
  }
  const ids=B3_CAST[m.id].vibes; if(!(ids.includes(M2.vibe)||(M2.vibe===B3_FREELANCER&&b3CasualOpen(m.id,L)))||M2.vibeFor!==m.id) { M2.vibe=L.main; M2.vibeFor=m.id; M2.pick=null; M2.peekRow=null; }
  const fresh=M2.freshNow||(M2.fresh&&M2.fresh[m.id]); if(M2.freshNow) { M2.fresh=M2.fresh||{}; M2.fresh[m.id]=true; }
  const left=m2RankCtl()+m2PoolBlock(m,L)+m2LoadoutHtml(m,L)+m2RowCtl(m,L)+m2QuirkSlots(m,L);
  const det=M2.pick!=null?null:m2VibeDetail(m,L,fresh);
  if(d.wide) return {l:m2Header(m,d,m2VibeDelta(m,L))+'<div class="m2-lowl">'+left+'</div>',r:M2.pick!=null?m2QuirkPick(m,L):det.head+'<div class="m2-scroll">'+det.body+'</div>',cls:'m2-vibes'};
  return {l:m2Header(m,d,m2VibeDelta(m,L))+'<div class="m2-scroll">'+(M2.pick!=null?m2QuirkPick(m,L):left+'<div class="m2-ab">'+det.head+det.body+'</div>')+'</div>',r:'',single:true,cls:'m2-vibes'};
}

// ---------- Gear ----------
function m2ItemPic(id,cls) {
  const has=typeof ITEM_ART!=='undefined'&&ITEM_ART.includes(id);
  return '<span class="m2-ip '+(cls||'')+'" aria-hidden="true">'+(has?'<img src="art/items/'+id+'.webp?v='+ITEM_ART_V+'" alt="">':'<em>'+(items[id]&&items[id].icon||'')+'</em>')+'</span>';
}
// What an item gives, in the new battle's words (data/b3-gear.js says what maps where; the rest is shown with its reason).
function m2Effect(it) {
  if(!it) return '';
  const parts=[],NM={hp:'Health',atk:'Attack',def:'Defense',spd:'Speed'};
  for(const k in (it.stats||{})) { const mm=B3_GEAR.flat[k]; if(mm&&it.stats[k]) parts.push(NM[mm.to]+' +'+Math.round(it.stats[k]*mm.per)); }
  const ps=(it.perk&&it.perk.stat)||{},rest=Object.assign({},it.perk||{}); delete rest.stat;
  for(const k in ps) { const to=B3_GEAR.pct[k]; if(to) parts.push(NM[to]+' +'+Math.round(ps[k]*100)+'%'); }
  let off=false; const lo={}; for(const k in ps) if(!B3_GEAR.pct[k]) lo[k]=ps[k];
  if(Object.keys(lo).length) rest.stat=lo;
  const rt=(typeof b6PerkText==='function'&&Object.keys(rest).length)?b6PerkText(rest):'';
  if(rt) { off=true; parts.push(rt); }
  for(const k in (it.stats||{})) if(B3_GEAR.off.stats[k]&&it.stats[k]) off=true;
  return parts.join(', ')+(off?(parts.length?' ':'')+'<small class="m2-off">(part of it is not used in fights)</small>':'');
}
function m2SlotCard(m,s) {
  const id=m.equipment[s],it=id&&items[id],sel=M2.slot===s,n=gearOptions(m,s).length;
  return '<button type="button" class="m2-gs'+(sel?' sel':'')+(it?'':' empty')+'" data-m2="slot" data-a="'+s+'" data-k="slot-'+s+'" aria-pressed="'+sel+'">'+(it?m2ItemPic(id):'<span class="m2-ip none"></span>')+
    '<span class="m2-gt"><small>'+s+'</small><b>'+(it?m2Esc(it.name):'Nothing on')+'</b><span>'+(it?(m2Effect(it)||'No bonus'):n+' in the bag fit')+'</span></span>'+m2Icon('chev',20)+'</button>';
}
function m2GearBody(d) {
  const m=m2Who();
  const slots=wearSlots(m); if(!slots.includes(M2.slot)) M2.slot=slots.find(s=>m.equipment[s])||slots[0];
  const opts=gearOptions(m,M2.slot);
  if(!M2.peek||M2.peek.slot!==M2.slot||M2.peek.who!==m.id||!opts.includes(M2.peek.id)) M2.peek=opts.length?{slot:M2.slot,who:m.id,id:opts[0]}:null;
  const worn=m.equipment[M2.slot],wit=worn&&items[worn],pk=M2.peek;
  const delta=pk?m2Diff(m,M2.slot,pk.id):null;
  let right='<div class="m2-gh"><h2>What '+m2Esc(m.name)+' is wearing</h2><button type="button" class="m2-btn" data-m2="best" data-k="best">'+m2Icon('spark',17)+'Best gear</button></div><div class="m2-scroll">'+slots.map(s=>m2SlotCard(m,s)).join('');
  right+='<div class="m2-bag"><div class="m2-lab">In the bag for '+M2.slot+'</div>';
  if(!opts.length) right+='<p class="m2-note">Nothing in the bag fits '+m2Esc(m.name)+' here.</p>';
  for(const id of opts) {
    const it=items[id],isP=pk&&pk.id===id,df=m2Diff(m,M2.slot,id),dt=m2DiffText(df),good=['hp','atk','def','spd'].some(k=>df[k]>0)&&!['hp','atk','def','spd'].some(k=>df[k]<0);
    right+='<div class="m2-bo'+(isP?' sel':'')+'"><button type="button" class="m2-bp" data-m2="peek" data-a="'+id+'" data-k="peek-'+id+'" aria-pressed="'+isP+'">'+m2ItemPic(id)+'<span class="m2-gt"><b>'+m2Esc(it.name)+'</b><span>'+(m2Effect(it)||'No bonus')+'</span>'+
      (dt?'<span class="m2-df '+(good?'up':'dn')+'">'+(good?m2Icon('up',14,2.6):'')+(wit?m2Esc(dt)+' over the '+m2Esc(wit.name.toLowerCase()):m2Esc(dt)):'')+'</span></span></button>'+
      '<button type="button" class="m2-btn on" data-m2="wear" data-a="'+id+'" data-k="wear-'+id+'" aria-label="Wear the '+m2Esc(it.name)+'">Wear</button></div>';
  }
  if(wit) right+='<div class="m2-off-row"><p>'+m2Esc(wit.desc||'')+'</p><button type="button" class="m2-btn" data-m2="takeoff" data-a="'+M2.slot+'" data-k="takeoff">Take off</button></div>';
  right+='</div><p class="m2-note">A Tool adds Attack. An Outfit adds Health and Defense. A Charm adds one special perk.</p></div>';
  const pit=pk&&items[pk.id];
  const hint=pit?'Green shows what changes if '+m2Esc(m.name)+' puts on the <b>'+m2Esc(pit.name)+'</b>.':'Nothing in the bag would change '+m2Esc(m.name)+'’s numbers.';
  const foot='<div class="m2-gfoot"><span class="m2-fu big">'+m2Icon('up',14,3)+'</span><span>A green arrow on a face means the bag holds something better for them.</span></div>';
  if(d.wide) return {l:m2Header(m,d,delta)+'<p class="m2-hint">'+hint+'</p>'+foot,r:right,cls:'m2-gear'};
  return {l:m2Header(m,d,delta)+'<p class="m2-hint">'+hint+'</p><div class="m2-scroll">'+right.replace('<div class="m2-scroll">','<div class="m2-nos">')+foot+'</div>',r:'',single:true,cls:'m2-gear'};
}

// ---------- Layout: the person at their real height ----------
function m2PersonLayout() {
  const img=M2.root.querySelector('.m2-hfig'); if(!img) return;
  // Tom is the height baseline (CLAUDE.md "Real heights"): his head top meets the top of the name line, the others stand at their real height beside him.
  const box=img.parentElement,H=box.clientHeight,m=m2Who(),tom=MEMBERS().tom,ref=(tom&&m2Inches(tom))||Math.max(...m2People().map(m2Inches).filter(Boolean),1);
  if(!H) return;
  let ih=Math.max(40,H*(m2Inches(m)/ref)),iw=ih*M2_ASPECT; const W=box.clientWidth; if(iw>W) { iw=W; ih=iw/M2_ASPECT; }
  img.style.height=ih.toFixed(1)+'px'; img.style.width=iw.toFixed(1)+'px';
}

// ---------- Taps ----------
function m2Changed(m,text) {
  if(M2.lab) b3LabSave(); else { M2.dirty=true; const L=m2Loadout(m); if(L) b3LabFollow(m.id,L); }
  sfx.select(); if(text) showToast(text,2.4);
  M2.focusNext=M2.keys?M2.focusNext:null; m2Render();
}
const m2MainText=(m,V)=>V.id===B3_FREELANCER?V.name+' is now '+m.name+'’s Primary Vibe: every Trait, a Basic action of their choice and two Secondary Vibes.':V.name+' is now '+m.name+'’s Primary Vibe: its Trait, Basic, Skills and Lean.';
function m2PersonAct(act,a,el) {
  const m=m2Who(),L=m2Loadout(m);
  if(act==='who') { if(a!==M2.who) { M2.who=a; M2.pick=null; M2.peek=null; sfx.tab(); const i=party.findIndex(x=>x.id===a); if(i>=0&&!M2.lab) { M2.sel=i; menuChar=i; } } M2.focusNext=M2.keys?'w-'+a:null; m2Render(); return; }
  if(act==='bench') { M2.bench=!M2.bench; sfx.tab(); M2.focusNext=M2.keys?'bench':null; m2Render(); return; }
  if(M2.tab==='vibes') {
    if(act==='rank'&&M2.lab) { const B=b3LabBook(); for(const id in B) b3SetRank(id,B[id],+a); b3LabSave(); sfx.select(); showToast('Every Vibe in the Battle Lab is now Rank '+a+'.',2.4); M2.focusNext=M2.keys?'rank-'+a:null; m2Render(); return; }
    if(act==='vibe') { M2.vibe=a; M2.peekRow=null; sfx.tab(); M2.focusNext=M2.keys?'vc-'+a:null; m2Render(); return; }
    if(!L) return;
    if(act==='main') { const V=b3VibeOf(a); M2.vibe=a; M2.focusNext=M2.keys?'main-'+a:null; if(V&&b3SetMain(m.id,L,a)) m2Changed(m,m2MainText(m,V)); return; }
    if(act==='fbasic') { M2.focusNext=M2.keys?'fb-'+a:null; if(b3SetBasic(m.id,L,a)) m2Changed(m,(B3_SKILLS[a]?B3_SKILLS[a].name:a)+' is '+m.name+'’s Basic action.'); return; }
    if(act==='fpocket') { const [sl,v]=String(a).split(':'); M2.focusNext=M2.keys?'fp'+sl+'-'+v:null; if(b3SetPocket(m.id,L,v,+sl)) m2Changed(m,B3_VIBES[v].name+' is now Secondary Vibe '+(+sl+1)+': it adds its Skills.'); return; }
    if(act==='off') { if(L.main===a||L.pocket===a||L.pocket2===a) { sfx.nope&&sfx.nope(); showToast('A Vibe steps out when another one takes its place. Pick Primary or Secondary on a different Vibe.',3); } return; }
    if(act==='peekrow') { M2.peekRow=M2.peekRow===a?null:a; sfx.tab(); M2.focusNext=M2.keys?'pr-'+a:null; m2Render(); return; }
    if(act==='pocket') { const V=B3_VIBES[a]; M2.vibe=a; M2.focusNext=M2.keys?'pocket-'+a:null; if(b3SetPocket(m.id,L,a)) m2Changed(m,V.name+' is now '+m.name+'’s Secondary Vibe: it adds its Skills.'); return; }
    if(act==='row') {
      if(b3RowOf(L)===a) return;
      if(a==='back'&&m2LastFront(m,L)) { sfx.nope&&sfx.nope(); showToast('Someone has to stand in Front.',2.4); return; }
      b3SetRow(L,a); M2.focusNext=M2.keys?'row-'+a:null;
      m2Changed(m,m.name+' now stands in '+(a==='back'?'Back. Monsters aim there less often, and a Clobber hit aimed at one person lands 20% weaker.':'Front.')); return;
    }
    if(act==='details') { m2SetDetails(!m2Details()); sfx.select(); M2.focusNext=M2.keys?'details':null; m2Render(); return; }
    if(act==='quirk') { M2.pick=+a; sfx.select(); const q=L.quirks[+a]; M2.focusNext=M2.keys?'pick-'+(q||'empty'):null; m2Render(); return; }
    if(act==='pickback') { const k='q-'+M2.pick; M2.pick=null; sfx.tab(); M2.focusNext=M2.keys?k:null; m2Render(); return; }
    if(act==='pick') { const slot=M2.pick; M2.pick=null; M2.focusNext=M2.keys?'q-'+slot:null; if(b3SetQuirk(m.id,L,slot,a||null)) m2Changed(m,a?B3_QUIRKS[a].name+' is in Quirk slot '+(slot+1)+'.':'Quirk slot '+(slot+1)+' is empty.'); else m2Render(); return; }
    if(act==='poolminus'||act==='poolplus') {
      const ids=B3_CAST[m.id].vibes,others=ids.filter(v=>v!==a);
      const from=act==='poolminus'?a:others.sort((x,y)=>(L.vp[y]||0)-(L.vp[x]||0))[0],to=act==='poolminus'?others.sort((x,y)=>(L.vp[x]||0)-(L.vp[y]||0))[0]:a;
      M2.focusNext=M2.keys?(act==='poolminus'?'pm-':'pp-')+a:null;
      if(b3PoolShift(m.id,L,from,to,20)) m2Changed(m); else { sfx.nope&&sfx.nope(); showToast('Nothing to move there.',2); }
      return;
    }
    if(act==='poollock') { if(b3PoolConfirm(L)) { M2.focusNext=null; m2Changed(m,m.name+'’s split is locked in.'); } return; }
    return;
  }
  // Gear
  if(act==='slot') { M2.slot=a; M2.peek=null; sfx.tab(); M2.focusNext=M2.keys?'slot-'+a:null; m2Render(); return; }
  if(act==='peek') { M2.peek={slot:M2.slot,who:m.id,id:a}; sfx.tab(); M2.focusNext=M2.keys?'peek-'+a:null; m2Render(); return; }
  if(act==='wear') {
    const it=items[a]; if(!it) return;
    if(!equipTo(m,a)) { sfx.nope&&sfx.nope(); return; }
    sfx.equip(); if(typeof syncHeroHat==='function') syncHeroHat(); M2.dirty=true; M2.peek=null; M2.focusNext=M2.keys?'slot-'+it.slot:null;
    showToast(m.name+' puts on '+it.name+'.',2); m2Render(); return;
  }
  if(act==='takeoff') {
    const id=m.equipment[a]; if(!id) return;
    m.equipment[a]=null; bag.push(id); if(typeof b6Refresh==='function') b6Refresh(m); sfx.unequip(); if(typeof syncHeroHat==='function') syncHeroHat();
    M2.dirty=true; M2.peek=null; M2.focusNext=M2.keys?'slot-'+a:null; m2Render(); return;
  }
  if(act==='best') { M2.dirty=true; equipBest(m); M2.peek=null; return; }
}
// Swipe sideways on a page to change person (Vibes and Gear).
(function() {
  let sx=0,sy=0,t0=0,on=false;
  document.addEventListener('pointerdown',e=>{ const p=e.target.closest&&e.target.closest('#m2 .m2-page'); on=!!(p&&M2.open&&!M2.legacy&&(M2.tab==='vibes'||M2.tab==='gear')); if(on) { sx=e.clientX; sy=e.clientY; t0=Date.now(); } },true);
  document.addEventListener('pointerup',e=>{
    if(!on) return; on=false;
    const dx=e.clientX-sx,dy=e.clientY-sy; if(Date.now()-t0>700||Math.abs(dx)<70||Math.abs(dx)<2.2*Math.abs(dy)) return;
    // a turned stage (landscape on an upright phone) swaps the axes
    const rot=typeof layout!=='undefined'&&layout.rotated,d=rot?dy:dx;
    m2Cycle(d<0?1:-1);
  },true);
})();
