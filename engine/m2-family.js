'use strict';
// engine/m2-family.js: the Family page of the new main menu (card menu1; drawings family_duo, family_phone, family_land in claude/menuux-mock/shots).
// The party stands in a line on ONE floor line, each at their real height. Heights are never typed here: they come from WALK_SCALE
// (data/walk-scale.js, written by tools/sprite-bake/heights.py from data/heights.json). The pictures are art/menu/<id>.webp, baked
// from the hero paintings with the paper turned white (tools/sprite-bake/bake_menu_heroes.py) and drawn with the multiply blend, so
// no cutout is needed. A picture is never resized by itself: one scale (pixels per inch) for everybody, so a head is only ever as
// big as the painting made it. No height labels (Tom 11-21).
// Under each person: name, level, health, Main Vibe with Rank stars, Front row or Back row, and a New skill tag after a Rank-up until
// their Vibes page is opened. Everyone recruited who is not in the party waits on the bench; Change swaps them in (benchSwap,
// benchToParty in engine/bench.js). The Family Ruckus gauge has its marks at 50 and 100.
const M2_V='menu2',M2_FIG=.935,M2_FEET=.04,M2_ASPECT=547/820;
const m2Inches=m=>(typeof WALK_SCALE!=='undefined'&&WALK_SCALE[m.id]&&WALK_SCALE[m.id].inches)||0;
const m2Bench=()=>(typeof benchMembers==='function'?benchMembers():[]);
function m2RuckusPct() { const v=(typeof B3S!=='undefined'&&Number.isFinite(B3S.ruckus))?B3S.ruckus:0; return Math.max(0,Math.min(100,Math.round(v))); }
function m2Vibe(m) {
  try {
    const L=typeof b3MemberLoadout==='function'?b3MemberLoadout(m):null; if(!L) return null;
    return {name:b3VibeOf(L.main).name,rank:b3VibeRank(L,L.main),max:b3MaxRank(),row:b3RowOf(L)};
  } catch(e) { return null; }
}
function m2Face(id,cls) {
  const src=(typeof PORTRAITS!=='undefined'&&PORTRAITS[id])||'';
  return src?'<img src="'+src+'" alt="">':'';
}

function m2Plate(m,i,d) {
  const v=m2Vibe(m),sel=i===M2.sel,hp=Math.max(0,m.hp),mx=Math.max(1,m.maxHp),low=hp/mx<=.25;
  const row=v?'<span class="m2-chip">'+(v.row==='back'?'Back':'Front')+'<span class="m2-r"> row</span></span>':'';
  const fresh=m.m2new&&v?'<span class="m2-chip new">New skill<span class="m2-nt"> to try</span></span>':'';
  const ko=hp<=0?'<span class="m2-ko">Knocked out</span>':'';
  const label=m.name+', Level '+m.level+', '+hp+' of '+mx+' health'+(v?', '+v.name+' Rank '+v.rank+', '+(v.row==='back'?'Back':'Front')+' row':'')+(m.m2new&&v?', new skill to try':'');
  let rest;
  if(d.wide&&!d.compact) rest=(v?'<span class="m2-vb">'+m2Esc(v.name)+'</span><span class="m2-vs">'+m2Stars(v.rank,v.max,13)+row+'</span>':'')+(fresh||ko?'<span class="m2-vs">'+fresh+ko+'</span>':'');
  else if(d.compact) rest=(v?'<span class="m2-vb">'+m2Esc(v.name)+'</span><span class="m2-vs">'+m2Stars(v.rank,v.max,12)+row+fresh+'</span>':'')+(ko?'<span class="m2-vs">'+ko+'</span>':'');
  else rest=(v?'<span class="m2-vs"><span class="m2-vb">'+m2Esc(v.name)+'</span>'+m2Stars(v.rank,v.max,13)+fresh+'<span class="m2-sp"></span>'+row+'</span>':'')+(ko?'<span class="m2-vs">'+ko+'</span>':'');
  return '<button type="button" class="m2-plate" data-m2="select" data-a="'+i+'" data-k="p-'+i+'" aria-pressed="'+sel+'" aria-label="'+m2Esc(label)+'">'+rest+'</button>';
}
function m2Page(list,startIdx,d,foot) {
  const slots=list.map(m=>'<div class="m2-slot" data-id="'+m.id+'"><img class="m2-fig" src="art/menu/'+m.id+'.webp?v='+M2_V+'" alt="" draggable="false"></div>').join('');
  const plates=list.map((m,k)=>m2Plate(m,startIdx+k,d)).join('');
  const hps='<div class="m2-hps">'+list.map((m,k)=>{
    const hp=Math.max(0,m.hp),mx=Math.max(1,m.maxHp),low=hp/mx<=.25;
    return '<span class="m2-hd'+(startIdx+k===M2.sel?' sel':'')+'"><b class="m2-name">'+m2Esc(m.name)+'</b><span class="m2-nl"><span class="m2-lv"><span class="m2-lw">Level </span><span class="m2-ls">Lv </span>'+m.level+'</span><span class="m2-bar'+(low?' low':'')+'"><i style="width:'+Math.round(hp/mx*100)+'%"></i></span></span><span class="m2-hp'+(low?' low':'')+'"><span class="m2-hpl">HP </span><b>'+hp+'</b><span class="m2-of"> of '+mx+'</span></span></span>';}).join('')+'</div>';
  return hps+'<div class="m2-figs" data-n="'+list.length+'">'+slots+'</div><div class="m2-plates">'+plates+'</div>'+foot;
}

// ---------- The bench, and Change ----------
function m2BenchFoot() {
  const bench=m2Bench(),C=M2.change;
  if(!bench.length) return '<div class="m2-foot"><div class="m2-bench"><div class="m2-bench-main"><div class="m2-bench-say"><b>Nobody is on the bench yet.</b> Family who join the story wait here.</div></div></div></div>';
  if(!C) {
    const faces=bench.map(m=>'<span class="m2-face" title="'+m2Esc(m.name)+'">'+m2Face(m.id)+'</span>').join('');
    return '<div class="m2-foot"><div class="m2-bench"><div class="m2-bench-main"><div class="m2-bench-say"><b>'+bench.length+' on the bench.</b> They level up too.</div><div class="m2-faces">'+faces+'</div></div>'+
      '<button type="button" class="m2-btn" data-m2="change" data-k="change">'+m2Icon('swap',18)+'Change</button></div></div>';
  }
  const cancel='<button type="button" class="m2-btn" data-m2="cancel" data-k="cancel">Cancel</button>';
  if(C.step==='in') {
    const free=party.length<PARTY_MAX;
    const picks=bench.map(m=>'<button type="button" class="m2-pick" data-m2="bench" data-a="'+m.id+'" data-k="b-'+m.id+'" aria-label="'+m2Esc(m.name)+' comes out front"><span class="m2-pf">'+m2Face(m.id)+'</span><span class="m2-pn">'+m2Esc(m.name)+'</span></button>').join('');
    return '<div class="m2-foot"><div class="m2-ask">'+(free?'There is a free place out front. Who comes out?':'Who comes out front?')+'</div><div class="m2-picks">'+picks+cancel+'</div></div>';
  }
  // step out: who sits out so the picked person can come out front
  const inM=MEMBERS()[C.who],outs=m2Outs();
  if(!outs.length) {
    const held=extras().filter(x=>!outs.includes(x)).map(x=>x.name);
    return '<div class="m2-foot"><div class="m2-note"><b>'+m2Esc(inM.name)+' can\'t come out front right now.</b> Tom, Grace and Rose always fight'+(held.length?', and the story is keeping '+held.map(m2Esc).join(' and ')+' out front':'')+', so nobody can sit out.</div><div class="m2-picks">'+cancel+'</div></div>';
  }
  return '<div class="m2-foot"><div class="m2-ask">Who sits out so '+m2Esc(inM.name)+' can come out front?</div><div class="m2-picks">'+
    outs.map(x=>'<button type="button" class="m2-out" data-m2="out" data-a="'+x.id+'" data-k="o-'+x.id+'">'+m2Esc(x.name)+' sits out</button>').join('')+cancel+'</div></div>';
}
// Out front and allowed to sit out: not Tom, Grace or Rose, not held by the chapter's rules (canLeave), not on the chapter's never list.
const m2Outs=()=>extras().filter(x=>canLeave(x)&&!(typeof benchNever==='function'&&benchNever().includes(x.id)));

function m2RuckusFoot() {
  const p=m2RuckusPct();
  return '<div class="m2-foot"><div class="m2-ruck-box"><div class="m2-ruck-head"><b>Combos</b><span><b>'+p+'%</b></span></div>'+
    '<div class="m2-gauge" role="img" aria-label="Combos '+p+' percent. Double Team at 50, Family Ruckus at 100"><i style="width:'+p+'%"></i><u class="m50"></u><u class="m100"></u></div>'+
    '<div class="m2-marks"><span style="left:calc(50% - 38px)">Double Team</span><span style="right:0">Family Ruckus</span></div></div></div>';
}

function m2FamilyBody(d) {
  const P=party.slice(),n=P.length;
  if(M2.sel>=n) M2.sel=0; menuChar=M2.sel;
  if(d.wide) {
    const k=Math.ceil(n/2);
    return {l:m2Page(P.slice(0,k),0,d,m2BenchFoot()),
      r:(n>k?m2Page(P.slice(k),k,d,m2RuckusFoot()):'<div class="m2-figs" data-n="0"></div><div class="m2-plates"></div>'+m2RuckusFoot())};
  }
  return {l:m2Page(P,0,d,m2BenchFoot().replace('class="m2-foot"','class="m2-foot m2-first"')+m2RuckusFoot())};
}
function m2FamilyAfter() {
  const r=M2.root; r.style.setProperty('--m2-foot',M2.dims.compact?'52px':'92px');
}

// ---------- The line-up scale ----------
// One scale for everybody: pixels per inch of real height. The tallest person out front fits the page's floor-to-top space, and no
// picture is wider than its slot allows (neighbours may overlap a little: the paper is white and the pictures are multiplied).
function m2FamilyLayout() {
  // The plates of both pages get the same height (the tallest one), so the floor line sits at the same height on the left page and the right.
  const pl=[...M2.root.querySelectorAll('.m2-plates')]; for(const e of pl) e.style.minHeight='';
  const ph=Math.max(0,...pl.map(e=>e.offsetHeight)); for(const e of pl) e.style.minHeight=ph+'px';
  const ft=[...M2.root.querySelectorAll('.m2-page.l .m2-foot,.m2-page.r .m2-foot')];
  if(ft.length===2) { for(const e of ft) e.style.minHeight=''; const fh=Math.max(...ft.map(e=>e.offsetHeight)); for(const e of ft) e.style.minHeight=fh+'px'; }
  const figs=[...M2.root.querySelectorAll('.m2-figs')]; for(const f of figs) { f.style.flex=''; f.style.height=''; }
  // Wide book: both pages seat their people in the same width, packed to the left of each page (clear of the crease), so the four are evenly spaced.
  const pls=[...M2.root.querySelectorAll('.m2-plates')];
  for(const e of [...figs,...pls]) { e.style.width=''; e.style.alignSelf=''; }
  const nL=figs.length===2?figs[0].querySelectorAll('.m2-slot').length:0,nR=figs.length===2?figs[1].querySelectorAll('.m2-slot').length:0;
  if(M2.dims.wide&&nL&&nR&&nR<=nL) {
    // Three people: the third sits at the left of the right page in the same seat width as the two beside him (Tom 2026-11-22), not centred.
    const w=Math.min(figs[0].clientWidth,figs[1].clientWidth)*nR/nL;
    for(const e of [figs[1],pls[1]]) if(e) { e.style.width=w+'px'; e.style.alignSelf='flex-start'; }
  }
  if(!figs.length) return;
  const people=party.filter(m=>m2Inches(m)); if(!people.length) return;
  const maxIn=Math.max(...people.map(m2Inches));
  let ppi=1e9;
  for(const f of figs) {
    const slots=[...f.querySelectorAll('.m2-slot')]; if(!slots.length) continue;
    const A=f.clientHeight,cw=f.clientWidth/slots.length;
    ppi=Math.min(ppi,A/(maxIn*(1+(1-M2_FIG-M2_FEET)/M2_FIG)));
    for(const s of slots) { const m=MEMBERS()[s.dataset.id],inch=m&&m2Inches(m); if(inch) ppi=Math.min(ppi,(slots.length>2?1.7:1.3)*cw*M2_FIG/(M2_ASPECT*inch)); }
  }
  if(!(ppi>0&&ppi<1e8)) return;
  for(const f of figs) for(const s of f.querySelectorAll('.m2-slot')) {
    const m=MEMBERS()[s.dataset.id],inch=m&&m2Inches(m),img=s.querySelector('.m2-fig'); if(!inch||!img) continue;
    const ih=inch*ppi/M2_FIG,iw=ih*M2_ASPECT;
    img.style.width=iw.toFixed(1)+'px'; img.style.height=ih.toFixed(1)+'px'; img.style.left='50%'; img.style.marginLeft=(-iw/2).toFixed(1)+'px'; img.style.bottom=(-ih*M2_FEET).toFixed(1)+'px';
  }
  M2.ppi=ppi;
  // Tall pages: when the width is what limits the scale, the line-up takes only the height it needs and the rest of the page stays below it.
  if(!M2.dims.wide) for(const f of figs) { const need=Math.ceil(maxIn*ppi*(1+(1-M2_FIG-M2_FEET)/M2_FIG))+4; if(need<f.clientHeight) { f.style.flex='0 0 auto'; f.style.height=need+'px'; } }
}

// ---------- Taps ----------
function m2FamilyAct(act,a,el) {
  if(act==='select') { const i=+a; if(i!==M2.sel) sfx.tab(); M2.sel=i; menuChar=i; M2.focusNext=M2.keys?'p-'+i:null; m2Render(); return; }
  if(act==='change') { M2.change={step:'in'}; sfx.select(); M2.focusNext=M2.keys?'b-'+((m2Bench()[0]||{}).id):null; m2Render(); return; }
  if(act==='cancel') { M2.change=null; sfx.tab(); M2.focusNext=M2.keys?'change':null; m2Render(); return; }
  if(act==='bench') {
    const m=MEMBERS()[a]; if(!m) return;
    if(party.length<PARTY_MAX) { if(benchToParty(m)) m2Swapped(m.name+' is out front.'); else { sfx.nope&&sfx.nope(); showToast(m.name+' can\'t come out front right now.',3); } return; }
    M2.change={step:'out',who:a}; sfx.select(); M2.focusNext=M2.keys?(m2Outs()[0]?'o-'+m2Outs()[0].id:'cancel'):null; m2Render(); return;
  }
  if(act==='out') {
    const inM=MEMBERS()[M2.change&&M2.change.who],outM=MEMBERS()[a];
    if(inM&&outM&&benchSwap(inM,outM)) m2Swapped(inM.name+' is out front. '+outM.name+' takes the bench.');
    else { sfx.nope&&sfx.nope(); showToast('That swap isn\'t allowed right now.',3); }
  }
}
function m2Swapped(msg) {
  M2.change=null; sfx.levelChime&&sfx.levelChime(); showToast(msg,3);
  if(M2.sel>=party.length) M2.sel=0; menuChar=M2.sel; M2.focusNext=M2.keys?'change':null; m2Render();
}
