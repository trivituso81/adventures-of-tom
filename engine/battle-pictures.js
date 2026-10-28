'use strict';
// engine/battle-pictures.js: Rose Mode's picture battle menus. When the difficulty has `pictures:true` (engine/feel.js),
// b2RenderCmd draws the command cross, move grid, Tombo list, bag, targets and inspect list as pictures with at most one
// small word each, so a child who cannot read yet can play. Same buttons and data attributes as the text menus
// (.b2-x[data-d], .b2-btn[data-i], .b2-back[data-back], .b2-mid[data-insp]), so touch, keyboard and gamepad are unchanged.
// Icons come from data/battle-icons.js.
const bpText=b2RenderCmd;
const BP_ELEM={kinetic:'e_kinetic',cozy:'e_cozy',splash:'e_splash',sparkle:'e_sparkle',chatter:'e_chatter',amber:'e_amber'};
const bpOn=()=>{ try { return !!b7Diff().pictures; } catch(e) { return false; } };
const bpIcon=(id,px,cls,grey)=>{ const u=biIcon(id,grey?'grey':''); return u?'<img class="bi '+(cls||'')+'" alt="" src="'+u+'" width="'+px+'" height="'+px+'">':''; };
const bpWord=s=>String(s||'').replace(/[^A-Za-z0-9' ]/g,' ').trim().split(/\s+/)[0].toUpperCase().slice(0,9);
// Strength: 1, 2 or 3 fists from the move's damage multiplier.
function bpFists(a) {
  if(!(a&&a.stat&&a.mult)) return '';
  const n=a.mult<1.45?1:a.mult<2.1?2:3,w=['BIG','BIGGER','BIGGEST'][n-1];
  return '<span class="bp-fists">'+bpIcon('m_fist',16).repeat(n)+'<b>'+w+'</b></span>';
}
function bpCost(u,s,tag) {
  if(s===u.kit.basic||b2Diamond(u,s)) return '<span class="bp-cost">'+bpIcon('m_hand',16)+'</span>';
  const c=b2Cost(u,s); if(!c) return '<span class="bp-cost">'+bpIcon('m_hand',16)+'</span>';
  return '<span class="bp-cost">'+bpIcon('m_drop',14).repeat(Math.min(c,10))+'</span>';
}
// Pictures for what a move does: heal plus, helps a friend, swirl, kindness heart, hits everyone, party-wide.
function bpMarks(a) {
  const roles=b2Roles(a),m=[];
  if(roles.includes('heal')) m.push('m_plusheart');
  if(roles.includes('buff')) m.push('m_shoulder');
  if(roles.includes('debuff')) m.push('m_swirl');
  if((a.fx||[]).some(f=>f[0]==='warm')) m.push('m_heartp');
  const t=a.target;
  if(['row','front','all','multi'].includes(t)) m.push('m_trio');
  else if(t==='party') m.push('m_trio_g');
  return m.map(k=>bpIcon(k,16)).join('');
}
const bpElems=a=>((a&&a.elem)||[]).map(e=>bpIcon(BP_ELEM[e]||'e_sparkle',14)).join('');
function bpMoveIcon(u,a,px,grey) { return bpIcon(u.id+'.'+a.key,px,'',grey)||bpIcon('x_moves',px,'',grey); }
function bpBack() { return '<button type="button" class="b2-btn b2-back bp-back" data-back="1" aria-label="Back">'+bpIcon('x_back',28)+'</button>'; }
function bpFace(f) { const im=f.side==='foe'?b2Thumb(f.id):b2Portrait(f.id); return im?'<img class="bp-face" alt="" src="'+im+'">':'<b class="b2-ph">'+b2Esc((f.name||'?')[0])+'</b>'; }
function bpHp(f) { const r=Math.max(0,f.hp)/f.maxHp; return '<span class="bp-hp"><i class="'+(r<=.25?'crit':r<=.5?'low':'')+'" style="width:'+Math.round(r*100)+'%"></i></span>'; }

function bpCross(u,cmdOn,off) {
  const pu=u&&u.side==='party'?u:B2.party[0],k=pu.kit,sp=k.special;
  const spOff=sp&&!(cmdOn&&pu.vp<b2Cost(pu,sp))?off:' off';
  // One big picture per button and one small word under it. No counts, no markers.
  return '<div class="b2-cross bp-cross">'+
    '<button type="button" class="b2-x up'+off+'" data-d="up">'+bpIcon('x_moves',64)+'<small>MOVES</small></button>'+
    '<button type="button" class="b2-x left'+(cmdOn&&b2TomboReady(pu)?'':' off')+'" data-d="left">'+bpIcon('x_tombo',64)+'<small>TOMBO</small></button>'+
    '<button type="button" class="b2-mid bp-mid'+off+'" data-insp="1" aria-label="Look">'+bpIcon('m_magnify',64)+'<small>LOOK</small></button>'+
    '<button type="button" class="b2-x right'+spOff+'" data-d="right">'+(sp?bpIcon(pu.id+'.'+sp.key,64)||bpIcon('x_moves',64):'')+'<small>'+(sp?bpWord(sp.name):'')+'</small></button>'+
    '<button type="button" class="b2-x down'+off+'" data-d="down">'+bpIcon('x_bag',64)+'<small>BAG</small></button></div>';
}
// Move, Tombo and bag buttons: the picture fills the box, a small caption sits under it.
function bpBtn(i,sel,no,basic,ic,word) {
  return '<button type="button" class="b2-btn bp-btn'+(basic?' b2-basic':'')+(sel?' sel':'')+(no?' no':'')+'" data-i="'+i+'">'+
    '<span class="bp-ic">'+ic+'</span><span class="bp-w">'+b2Esc(word)+'</span></button>';
}
function bpSkills(u) {
  return '<div class="b2-grid bp-grid">'+b2SkillRows(u).map((s,i)=>{
    const lock=u.vp<b2Cost(u,s)||b2Shushed(u,s);
    return bpBtn(i,i===B2.sel,lock,s===u.kit.basic,bpMoveIcon(u,s,96,lock),bpWord(s.name)); }).join('')+bpBack()+'</div>';
}
function bpTombo(u) {
  const rows=b2TomboRows(u);
  return '<div class="b2-grid bp-grid">'+(rows.length?rows.map((r,i)=>
    bpBtn(i,i===B2.sel,!!r.why,false,bpIcon(r.T.id,96,'',!!r.why)||bpIcon('x_tombo',96),bpWord(r.T.name))).join(''):'<p class="bp-empty">'+bpIcon('x_tombo',64,'',true)+'</p>')+bpBack()+'</div>';
}
function bpBag(u) {
  const rows=b2BagList(u);
  return '<div class="b2-grid bp-grid">'+rows.map((r,i)=>{
    let ic,w;
    if(r.run) { ic='x_run'; w='RUN'; } else if(r.praise) { ic='x_praise'; w=r.name; } else if(r.crust) { ic='x_crust'; w=r.name; } else if(r.benchcall) { ic='x_bench'; w=r.name; }
    else { ic=r.item.id; w=r.item.it.name; }
    return bpBtn(i,i===B2.sel,r.no,false,bpIcon(ic,96,'',!!r.no)||bpIcon('x_bag',96),bpWord(w)); }).join('')+bpBack()+'</div>';
}
function bpTarget() {
  return '<div class="b2-list bp-list">'+B2.opts.map((o,i)=>{
    const ts=o.targets.slice(0,4);
    return '<button type="button" class="b2-btn bp-row'+(i===B2.sel?' sel':'')+'" data-i="'+i+'"><span class="bp-faces">'+ts.map(t=>'<span class="bp-tg">'+bpFace(t)+(t.maxHp?bpHp(t):'')+'</span>').join('')+'</span>'+
      (o.targets.length>1?'<span class="bp-m">'+bpIcon(o.ally?'m_trio_g':'m_trio',18)+'</span>':'')+'</button>'; }).join('')+bpBack()+'</div>';
}
function bpInspect() {
  return '<div class="b2-list bp-list">'+b2LiveFoes().map((f,i)=>{
    const wr=Math.max(0,Math.min(1,f.warm/f.warmGoal));
    return '<button type="button" class="b2-btn bp-row'+(i===B2.sel?' sel':'')+'" data-i="'+i+'"><span class="bp-faces"><span class="bp-tg">'+bpFace(f)+bpHp(f)+'</span></span>'+
      '<span class="bp-m">'+bpIcon('m_heartp',16)+'<span class="bp-hp warm"><i style="width:'+Math.round(wr*100)+'%"></i></span>'+(f.revealed&&f.weak.length?f.weak.map(e=>bpIcon(BP_ELEM[e]||'e_sparkle',18)).join(''):'')+'</span></button>'; }).join('')+bpBack()+'</div>';
}
b2RenderCmd=function() {
  if(!bpOn()) return bpText();
  const box=$('b2-cmd'),u=B2.actor; if(!box) return;
  const cmdOn=battle.state==='command';
  box.classList.add('bp');
  if(!cmdOn||B2.ui==='cross'||B2.ui==='busy'||!u||u.side!=='party') { box.innerHTML=bpCross(u,cmdOn,!cmdOn?' off':''); return; }
  box.innerHTML=B2.ui==='skills'?bpSkills(u):B2.ui==='bag'?bpBag(u):B2.ui==='tombo'?bpTombo(u):B2.ui==='inspect'?bpInspect():B2.ui==='target'?bpTarget():'';
};
