'use strict';
// engine/m2-vibes.js: the Vibes and Gear pages of the new main menu (card menu2; drawings vibes_duo, vibes_late_duo, vibes_phone, gear_duo,
// gear_phone in claude/menuux-mock/shots; plan claude/menuux-plan.md sections 3 and 4). Built on the page system of engine/m2-core.js.
// The rules are the new battle's own (engine/b3-progress.js: b3SetMain, b3SetPocket, b3SetQuirk, b3SetRow, b3PoolShift, b3PoolConfirm;
// engine/b3-core.js: b3LevelStats, b3GearSum). This file draws and calls them; it holds no rule of its own.
// One shared header on both pages: the faces of the party and a button for the bench, the person at their real height, level and XP, and
// Health, Attack, Defense and Speed worked out the way a fight works them out for that loadout and that gear (m2Stats).
// Bench members keep their Vibes and gear, so the faces switch between the party and the bench.
// The DETAILS setting ("Show what each skill does") is saved as M2_DET_KEY and is meant to be the one switch for this menu and the battle
// screen (card c-battleux1 reads the same key). The flavor symbols are the six flat ones of the battle mock (claude/battleux-mock/src/app.js IC).
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
const m2People=()=>party.concat(m2Bench());
function m2Who() { const all=m2People(); let m=all.find(x=>x.id===M2.who); if(!m) { m=party[Math.min(M2.sel,party.length-1)]||party[0]; M2.who=m.id; } return m; }
const m2Loadout=m=>(m&&b3HasKit(m.id))?b3MemberLoadout(m):null;
const m2InParty=m=>party.includes(m);
function m2Hint(m) { return wearSlots(m).some(s=>bestFor(m,s)); }

// Health, Attack, Defense and Speed as a fight works them out (engine/b3-core.js b3PartyUnit): the level line times the member's own
// factor, the Main Vibe's Lean, then worn gear (flat points added, percent perks multiplied in). `list` is a worn-item list to try.
function m2Stats(m,list) {
  const S=b3LevelStats(m.level),C=B3_CAST[m.id],L=m2Loadout(m),lean=(L&&B3_RULES.leans[B3_VIBES[L.main].lean])||{};
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
  const list=M2.bench?m2Bench():party,bn=m2Bench().length;
  let h='<div class="m2-fr" role="tablist" aria-label="Family member">';
  for(const m of list) {
    const up=M2.tab==='gear'&&m2Hint(m);
    h+='<button type="button" role="tab" class="m2-fc" data-m2="who" data-a="'+m.id+'" data-k="w-'+m.id+'" aria-selected="'+(m.id===m0.id)+'" aria-label="'+m2Esc(m.name)+(m.hp<=0?', knocked out':'')+(up?', the bag holds something better':'')+'"><span class="m2-fi">'+m2Face(m.id)+'</span>'+(up?'<i class="m2-fu" aria-hidden="true">'+m2Icon('up',12,3)+'</i>':'')+'</button>';
  }
  if(bn||M2.bench) h+='<button type="button" class="m2-more" data-m2="bench" data-k="bench" aria-pressed="'+!!M2.bench+'">'+(M2.bench?'Party':'+'+bn)+'<span class="m2-ml">'+(M2.bench?'':' bench')+'</span></button>';
  return h+'</div>';
}
function m2NameBlock(m,tall) {
  const top=m.level>=B6.maxLevel,xp=top?1:m.xp/B6.xpPerLevel;
  const fresh=m.level;
  if(tall) return '<div class="m2-hn"><b>'+m2Esc(m.name)+'</b><span>Level '+m.level+'</span></div>';
  return '<div class="m2-who"><span class="m2-lvl">Level '+fresh+'</span><b class="m2-wn">'+m2Esc(m.name)+'</b>'+
    '<span class="m2-xb" role="img" aria-label="'+(top?'Top level':(B6.xpPerLevel-m.xp)+' experience to level '+(m.level+1))+'"><i style="width:'+Math.round(xp*100)+'%"></i></span>'+
    '<span class="m2-xt">'+(top?'Top level':(B6.xpPerLevel-m.xp)+' to Level '+(m.level+1))+'</span></div>';
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
function m2Chips(m,L) {
  const ids=B3_CAST[m.id].vibes;
  let h='<div class="m2-chips" role="tablist" aria-label="Vibes">';
  for(const v of ids) {
    const V=B3_VIBES[v],role=L.main===v?'main':L.pocket===v?'pocket':'none',rk=b3VibeRank(L,v);
    h+='<button type="button" role="tab" class="m2-vc '+role+'" data-m2="vibe" data-a="'+v+'" data-k="vc-'+v+'" aria-selected="'+(v===M2.vibe)+'"><span class="m2-tag '+role+'">'+(role==='main'?'Main':role==='pocket'?'Pocket':'Not in use')+'</span><b>'+m2Esc(V.name)+'</b>'+m2Stars(rk,b3MaxRank(),13)+'</button>';
  }
  h+='<div class="m2-vc lock" role="img" aria-label="Freelancer, locked until all Vibes are mastered">'+m2Icon('lock',16)+'<b>Freelancer</b><span>Master all '+Math.max(3,ids.length)+'</span></div></div>';
  return h;
}
function m2Overflow(m,L) {
  const ids=B3_CAST[m.id].vibes,done=ids.filter(v=>b3Mastered(L,v));
  if(!done.length) return '';
  const low=ids.filter(v=>!b3Mastered(L,v)).sort((a,b)=>(L.vp[a]||0)-(L.vp[b]||0))[0];
  return '<p class="m2-note">'+(low?m2Esc(B3_VIBES[done[0]].name)+' is mastered, so its points now go to '+m2Esc(B3_VIBES[low].name)+', the Vibe with the fewest.':'Every Vibe is mastered, so new points are not needed.')+'</p>';
}
const m2First=s=>String(s||'').split(/(?<=[.!?])\s/)[0];
function m2KitRow(r,V,L,role,fresh) {
  const S=B3_SKILLS[r.id],Q=B3_QUIRKS[r.id],T=B3_TRAITS[r.id];
  let icon,tag,desc,right='';
  if(r.kind==='trait') { icon='<span class="m2-fl t">'+m2Icon('shield',16)+'</span>'; tag='Trait'; desc=T?T.desc:''; right=role==='main'?'Always on':'Main Vibe only'; }
  else if(r.kind==='quirk') { icon='<span class="m2-fl q">'+m2Icon('spark',16)+'</span>'; tag='Quirk'; desc=Q?Q.desc:''; right=L.quirks.includes(r.id)?'In a slot':''; }
  else { icon=m2FlIcon(S&&S.flavor,16); const fn=m2FlName(S&&S.flavor); tag=r.kind==='basic'?fn+' basic':r.kind==='cap'?'Capstone':fn+' skill'; desc=S?S.desc:''; right=r.kind==='basic'?'Free':(S&&S.pep!=null?'<b>'+S.pep+'</b> Pep':''); }
  if(!r.open) {
    return '<div class="m2-kr lock"><span class="m2-fl lk">'+m2Icon('lock',16)+'</span><div class="m2-kt"><div class="m2-kh"><b>'+m2Esc(r.name)+'</b><small>'+tag+'</small><span class="m2-kc">'+(r.kind==='cap'&&S&&S.pep?'<b>'+S.pep+'</b> Pep &nbsp;':'')+'<em>Rank '+r.rank+'</em></span></div></div></div>';
  }
  const dd=m2Details()?desc:m2First(desc);
  const soon=r.built?'':' <small class="m2-soon-t">Not working in this build yet</small>';
  return '<div class="m2-kr"><span>'+icon+'</span><div class="m2-kt"><div class="m2-kh"><b>'+m2Esc(r.name)+'</b><small>'+tag+'</small>'+(fresh?'<span class="m2-newt">New</span>':'')+'<span class="m2-kc">'+right+'</span></div><p>'+m2Esc(dd)+soon+'</p></div></div>';
}
function m2VibeDetail(m,L,fresh) {
  const V=B3_VIBES[M2.vibe],rank=b3VibeRank(L,V.id),vp=L.vp[V.id]||0,role=L.main===V.id?'main':L.pocket===V.id?'pocket':'none',T=B3_RULES.rankVp;
  const mast=rank>=b3MaxRank(),next=mast?b3MasterVp():T[rank],from=T[rank-1],frac=mast?1:Math.max(0,Math.min(1,(vp-from)/(next-from)));
  const ln=B3_LEANS[V.lean],lean=ln.name+': '+ln.desc.replace(/Max HP/g,'Health')+(role==='main'?'':' (when Main)');
  const unlock=mast?'':b3Ladder(V,rank).filter(r=>r.rank===rank+1).map(r=>r.name);
  let bar;
  if(mast) bar='<span class="m2-vb2"><i style="width:100%"></i></span><span class="m2-vt"><b>Mastered</b></span>';
  else bar='<span class="m2-vb2"><i style="width:'+Math.round(frac*100)+'%"></i></span><span class="m2-vt"><b>'+vp+'</b> of '+next+' to Rank '+(rank+1)+(unlock.length?': '+m2Esc(unlock.join(' and ')):'')+'</span>';
  let h='<div class="m2-vh"><h2>'+m2Esc(V.name)+'</h2><span class="m2-sub">'+m2Esc(b3Subtitle(V,rank))+'</span></div>'+
    '<div class="m2-lean">'+m2Icon('shield',17)+'<span>'+m2Esc(lean)+'</span></div><div class="m2-vp">'+bar+'</div><div class="m2-kit">';
  for(const r of b3Ladder(V,rank)) h+=m2KitRow(r,V,L,role,fresh&&r.rank===rank&&rank>1);
  h+='</div>';
  const mk=role==='main',pk=role==='pocket';
  h+='<div class="m2-acts">'+(mk?'<span class="m2-here">This is the Main Vibe.</span>':'<button type="button" class="m2-btn on" data-m2="main" data-a="'+V.id+'" data-k="make-main">Make it Main</button>')+
    (pk?'<span class="m2-here">This is the Pocket Vibe.</span>':'<button type="button" class="m2-btn" data-m2="pocket" data-a="'+V.id+'" data-k="make-pocket">Make it Pocket</button>')+'</div>';
  h+='<p class="m2-note">The Pocket Vibe adds its Skills only, and earns half the Vibe Points of a fight. Everyone can also use Pick-Me-Up ('+B3_RULES.pickMeUp.pep+' Pep) to get a knocked-out family member back up.</p>';
  if(!b3sOn()) h+='<button type="button" class="m2-link" data-m2="legacy" data-a="stamps" data-k="stampcard">Old Stampcard</button>';
  return h;
}
function m2PoolBlock(m,L) {
  if(!b3PoolOpen(L)) return '';
  const ids=B3_CAST[m.id].vibes;
  let h='<div class="m2-pool"><b>Split '+m2Esc(m.name)+'’s '+L.pool.total+' Vibe Points</b><span>They arrived with these. Split them once, then lock it in. 20 points a tap.</span><div class="m2-pr">';
  for(const v of ids) h+='<div class="m2-pc"><span>'+m2Esc(B3_VIBES[v].name)+'</span><div><button type="button" class="m2-pm" data-m2="poolminus" data-a="'+v+'" data-k="pm-'+v+'" aria-label="Take 20 points from '+m2Esc(B3_VIBES[v].name)+'">−</button><b>'+(L.vp[v]||0)+'</b><button type="button" class="m2-pm" data-m2="poolplus" data-a="'+v+'" data-k="pp-'+v+'" aria-label="Give 20 points to '+m2Esc(B3_VIBES[v].name)+'">+</button></div></div>';
  return h+'</div><button type="button" class="m2-btn on" data-m2="poollock" data-k="poollock">Lock it in</button></div>';
}
function m2QuirkSlots(m,L) {
  const pool=b3QuirkPool(m.id,L);
  return '<div class="m2-qrow">'+L.quirks.map((q,i)=>{
    const Q=q&&B3_QUIRKS[q];
    if(!pool.length) return '<div class="m2-qs lock">'+m2Icon('lock',18)+'<span><b>Quirk '+(i+1)+'</b> opens at Rank '+B3_RULES.rankUnlock.quirkA+'</span></div>';
    return '<button type="button" class="m2-qs'+(Q?' on':'')+'" data-m2="quirk" data-a="'+i+'" data-k="q-'+i+'" aria-label="Quirk slot '+(i+1)+': '+(Q?m2Esc(Q.name):'empty')+'. Choose a Quirk">'+m2Icon('spark',18)+'<span><small>Quirk '+(i+1)+'</small><b>'+(Q?m2Esc(Q.name):'Empty')+'</b></span></button>'; }).join('')+'</div>';
}
function m2LastFront(m,L) {
  if(!m2InParty(m)) return false;
  return !party.some(o=>o!==m&&m2Loadout(o)&&b3RowOf(m2Loadout(o))==='front');
}
function m2RowCtl(m,L) {
  const cur=b3RowOf(L),lock=m2LastFront(m,L);
  const b=(r,t)=>'<button type="button" class="m2-seg'+(cur===r?' on':'')+'" data-m2="row" data-a="'+r+'" data-k="row-'+r+'" aria-pressed="'+(cur===r)+'"'+(r==='back'&&lock&&cur!=='back'?' disabled':'')+'>'+t+'</button>';
  return '<div class="m2-lab">Stands in</div><div class="m2-segs">'+b('front','Front row')+b('back','Back row')+'</div>'+(lock&&cur!=='back'?'<p class="m2-note">Someone has to stand in Front. Move another family member to the Front first.</p>':'');
}
function m2DetailSwitch() {
  const on=m2Details();
  return '<div class="m2-sw"><span id="m2-swl">Show what each skill does</span><button type="button" class="m2-tog" role="switch" aria-checked="'+on+'" aria-labelledby="m2-swl" data-m2="details" data-k="details"><i></i></button></div>';
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
  const ids=B3_CAST[m.id].vibes; if(!ids.includes(M2.vibe)||M2.vibeFor!==m.id) { M2.vibe=L.main; M2.vibeFor=m.id; M2.pick=null; }
  const fresh=M2.freshNow||(M2.fresh&&M2.fresh[m.id]); if(M2.freshNow) { M2.fresh=M2.fresh||{}; M2.fresh[m.id]=true; }
  const left=m2PoolBlock(m,L)+m2RowCtl(m,L)+m2DetailSwitch()+m2QuirkSlots(m,L);
  const right=M2.pick!=null?m2QuirkPick(m,L):m2Chips(m,L)+m2Overflow(m,L)+'<div class="m2-scroll">'+m2VibeDetail(m,L,fresh)+'</div>';
  if(d.wide) return {l:m2Header(m,d)+'<div class="m2-lowl">'+left+'</div>',r:right,cls:'m2-vibes'};
  return {l:m2Header(m,d)+(M2.pick!=null?'<div class="m2-scroll">'+m2QuirkPick(m,L)+'</div>':'<div class="m2-scroll">'+m2PoolBlock(m,L)+m2Chips(m,L)+m2Overflow(m,L)+m2VibeDetail(m,L,fresh)+'<div class="m2-lowt">'+m2RowCtl(m,L)+m2DetailSwitch()+'<div class="m2-lab">Quirks</div>'+m2QuirkSlots(m,L)+'</div></div>'),r:'',single:true,cls:'m2-vibes'};
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
  const box=img.parentElement,H=box.clientHeight,m=m2Who(),maxIn=Math.max(...m2People().map(m2Inches).filter(Boolean),1);
  if(!H) return;
  let ih=Math.max(40,H*(m2Inches(m)/maxIn)*.98),iw=ih*M2_ASPECT; const W=box.clientWidth; if(iw>W) { iw=W; ih=iw/M2_ASPECT; }
  img.style.height=ih.toFixed(1)+'px'; img.style.width=iw.toFixed(1)+'px';
}

// ---------- Taps ----------
function m2Changed(m,text) {
  M2.dirty=true; const L=m2Loadout(m); if(L) b3LabFollow(m.id,L);
  sfx.select(); if(text) showToast(text,2.4);
  M2.focusNext=M2.keys?M2.focusNext:null; m2Render();
}
function m2PersonAct(act,a,el) {
  const m=m2Who(),L=m2Loadout(m);
  if(act==='who') { if(a!==M2.who) { M2.who=a; M2.pick=null; M2.peek=null; sfx.tab(); const i=party.findIndex(x=>x.id===a); if(i>=0) { M2.sel=i; menuChar=i; } } M2.focusNext=M2.keys?'w-'+a:null; m2Render(); return; }
  if(act==='bench') { M2.bench=!M2.bench; sfx.tab(); M2.focusNext=M2.keys?'bench':null; m2Render(); return; }
  if(M2.tab==='vibes') {
    if(act==='vibe') { M2.vibe=a; sfx.tab(); M2.focusNext=M2.keys?'vc-'+a:null; m2Render(); return; }
    if(!L) return;
    if(act==='main') { const V=B3_VIBES[a]; M2.focusNext=M2.keys?'vc-'+a:null; if(b3SetMain(m.id,L,a)) m2Changed(m,V.name+' is now '+m.name+'’s Main Vibe: its Trait, Basic, Skills and Lean.'); return; }
    if(act==='pocket') { const V=B3_VIBES[a]; M2.focusNext=M2.keys?'vc-'+a:null; if(b3SetPocket(m.id,L,a)) m2Changed(m,V.name+' is now '+m.name+'’s Pocket Vibe: it adds its Skills.'); return; }
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
