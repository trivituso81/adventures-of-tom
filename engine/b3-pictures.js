'use strict';
// engine/b3-pictures.js — Rose Mode picture menus for Battle 3 (architecture 2.9). DRAWING ONLY: it never changes the fight.
// Rose Mode (feel.js: `pictures:true`) is for Rose, who is 6 and cannot read yet. Here the command cross, the SKILLS list, the
// RUCKUS list, the target list, the preview box and the "what is on them" list are drawn as pictures with at most one small word.
// It keeps battle 2's picture contract (engine/battle-pictures.js, which loads first and whose helpers bpIcon, bpWord, bpFace, bpHp,
// bpBack and bpOn it borrows): the same buttons and data attributes as the words version, so touch, keys and the gamepad are
// unchanged (.b2-x[data-d], .b2-btn[data-i], .b2-back[data-back]). It wraps b3RenderCmd and b3PvHtml in engine/b3-ui.js; with Rose
// Mode off those two are exactly the words versions.
//
// THE 3-ICON RULE: a move button shows at most three pictures: its flavor (two when it has two), what it costs (blue drops, an open
// hand when free), and one for what it does to the field (heals, shields, hits everyone, helps a friend, shoves). A monster row shows
// at most three: Pet Peeve (green arrow up) or Resist (red arrow down), the Detonation this move would set off (the Prime's picture
// and a bomb), and its pips (gold gems; a spent one is grey). The recommended move carries a gold star and a glowing edge.
// Pictures: the flavors and Primes use the emoji pictures (data/battle-emoji.js), the rest the 16 x 16 pixel set (data/battle-icons.js).

Object.assign(BE_MAP,{b3f_clobber:'1f44a',b3f_sizzle:'1f525',b3f_drench:'1f4a6',b3f_razzle:'2728',b3f_racket:'1f4e3',b3_bomb:'1f4a3',b3_star:'2b50',b3_guard:'1f6e1',b3_push:'1f4a8'});
Object.assign(BI_ART,{
  b3_pip:'p8,1,14,6,8,15,2,6,Y;p8,2,12,6,8,6,4,6,y;d6,4,w',
  b3_pip_off:'p8,1,14,6,8,15,2,6,G;p8,2,12,6,8,6,4,6,g',
  b3_resist:'p7.5,14,13,7,9.5,7,9.5,1,5.5,1,5.5,7,2,7,R',
  b3_ko:'L2,2,13,13,R;L13,2,2,13,R',
  b3_ruckus:'X8,8,7.5,y;H8,8.5,3.8,P;d6,6,w'});
const B3P_FLAV={clobber:'b3f_clobber',sizzle:'b3f_sizzle',drench:'b3f_drench',razzle:'b3f_razzle',racket:'b3f_racket',support:'m_shoulder'};
const B3P_PRIME={toasty:'b3f_sizzle',drenched:'b3f_drench',dazzled:'b3f_razzle'};
const b3pOn=()=>typeof bpOn==='function'&&bpOn();
const b3pFlavors=(S,px)=>'<span class="b3p-fl">'+S.flavor.map(f=>bpIcon(B3P_FLAV[f]||'m_shoulder',px)).join('')+'</span>';
const b3pDrops=(n,px)=>n>0?bpIcon('m_drop',px||14).repeat(Math.min(n,10)):bpIcon('m_hand',px||14);
const b3pGems=(left,max,spent,px)=>{ let h=''; for(let i=0;i<max;i++) h+=bpIcon(i<left?'b3_pip':'b3_pip_off',px||12); return '<span class="b3p-gems">'+h+'</span>'; };
const b3pStar=px=>{ px=px||24; return '<span class="b3p-star" style="width:'+px+'px;height:'+px+'px">'+bpIcon('b3_star',px)+'</span>'; };
// What a move does to the field, as one picture id (or '').
function b3pEffect(S) {
  const ops=S.effects.map(e=>e.op);
  if(ops.includes('heal')||ops.includes('revive')) return 'm_plusheart';
  if(ops.includes('shield')) return 'b3_guard';
  if(ops.includes('grant')) return 'm_duo';
  if(['all_foes','random_foes','field'].includes(S.target)) return 'm_trio';
  if(['ally','family','ally_pair','adjacent_allies','ko_ally','family_or_ko'].includes(S.target)) return 'm_shoulder';
  if(ops.includes('push')||ops.includes('pull')) return 'b3_push';
  return '';
}
const b3pFace=u=>{ const im=u.side==='foe'?b2Thumb(u.id):b2Portrait(u.id); return im?'<img class="bp-face" alt="" src="'+im+'">':'<b class="b2-ph">'+b2Esc((u.name||'?')[0])+'</b>'; };
const b3pHp=u=>{ const r=Math.max(0,u.hp)/u.maxHp; return '<span class="bp-hp"><i class="'+(r<=.25?'crit':r<=.5?'low':'')+'" style="width:'+Math.round(r*100)+'%"></i></span>'; };

// ---------- The cross ----------
function b3pCross(u,cmdOn,off) {
  const pu=u||B3.F.party.find(p=>p.key===B3.turnOf)||B3.F.party[0],rk=Math.round(B3.view.ruckus||0),nS=b3SkillRows(pu).length,rc=b3Rec(),
    rk0=rc?(rc.kind==='basic'?'up':rc.kind==='ruckus'?'left':'right'):'',ish=d=>d===rk0?' rec':'',
    bs=B3_SKILLS[pu.basic],st=B3.view.u[pu.key];
  const pips=Array.from({length:B3_RULES.pep.max},(_,k)=>'<i'+(k<st.pep?' class="on"':'')+'></i>').join('');
  return '<div class="b2-cross bp-cross">'+
    '<button type="button" class="b2-x up'+(cmdOn?'':' off')+ish('up')+'" data-d="up"><span class="b3p-fl">'+bs.flavor.map(f=>bpIcon(B3P_FLAV[f]||'m_shoulder',64)).join('')+'</span><small>Basic</small>'+(rk0==='up'?b3pStar(20):'')+'</button>'+
    '<button type="button" style="--rk:'+rk+'%" class="b3-rk b2-x left'+(cmdOn&&rk>=B3_RULES.ruckus.doubleTeam?'':' off')+ish('left')+'" data-d="left">'+bpIcon('b3_ruckus',64)+'<small>Ruckus</small>'+(rk0==='left'?b3pStar(20):'')+'</button>'+
    '<div class="b2-mid bp-mid'+(cmdOn?'':' off')+'">'+bpFace(pu).replace('bp-face','bp-face b3p-mid')+'<span class="b2-vp b3-pep" aria-label="Pep '+st.pep+' of 10">'+pips+'</span></div>'+
    '<button type="button" class="b2-x right'+(cmdOn&&nS?'':' off')+ish('right')+'" data-d="right">'+bpIcon('x_moves',64)+'<small>Skills</small>'+(rk0==='right'?b3pStar(20):'')+'</button>'+
    '<button type="button" class="b2-x down off" data-d="down">'+bpIcon('x_bag',64,'',true)+'<small>Bag</small></button></div>';
}

// ---------- Lists ----------
function b3pSkills(u) {
  const rows=b3SkillRows(u),free=b3Granted()===u,rc=b3Rec();
  return '<div class="b2-grid bp-grid">'+'<div class="b3-pv" id="b3-pv"></div>'+rows.map((S,i)=>{
    const can=b3CanUse(B3.F,u,S),c=b3Cost(B3.F,u,S),ef=b3pEffect(S),r=rc&&rc.skill===S.id;
    return '<button type="button" class="b2-btn bp-btn'+(S.slot==='basic'?' b2-basic':'')+(i===B3.sel?' sel':'')+(can.ok?'':' no')+(r?' rec':'')+'" data-i="'+i+'">'+
      '<span class="bp-ic">'+b3pFlavors(S,96)+(ef?'<span class="b3p-ef" style="width:30px;height:30px">'+bpIcon(ef,30)+'</span>':'')+(r?b3pStar(26):'')+(can.ok?'':'<span class="bp-lock">'+bpIcon('m_lock',24)+'</span>')+'</span>'+
      '<span class="bp-cost">'+b3pDrops(free?0:c,13)+'</span><span class="bp-w">'+b2Esc(bpWord(S.name))+'</span></button>'; }).join('')+(free?'':bpBack())+'</div>';
}
function b3pRuckus(u) {
  const rc=b3Rec();
  return '<div class="b2-grid bp-grid">'+'<div class="b3-pv" id="b3-pv"></div>'+['double','full'].map((k,i)=>{
    const P=b3RuckusPlan(B3.F,u,k),r=rc&&rc.skill==='ruckus:'+k,pc=P.cost;
    const faces=P.ok?'<span class="bp-pair">'+[u,P.partner].map(x=>bpFace(x)).join('')+'</span>':'';
    return '<button type="button" class="b2-btn bp-btn'+(i===B3.sel?' sel':'')+(P.ok?'':' no')+(r?' rec':'')+'" data-i="'+i+'">'+
      '<span class="bp-ic">'+bpIcon(k==='full'?'b3_ruckus':'m_duo',96,'',!P.ok)+faces+(r?b3pStar(26):'')+'</span>'+
      '<span class="b3p-gauge"><i style="width:'+pc+'%"></i></span><span class="bp-w">'+(k==='full'?'Full':'Team')+'</span></button>'; }).join('')+bpBack()+'</div>';
}
// One monster row of what a move meets: Pet Peeve / Resist, the Detonation, the pips (three pictures at most).
function b3pMeet(r) {
  const a=[];
  if(r.peeve) a.push(bpIcon('m_up',18)); else if(r.resist) a.push(bpIcon('b3_resist',18));
  if(r.det) a.push('<span class="b3p-det">'+bpIcon(B3P_PRIME[r.det.prime]||'b3f_sizzle',18)+bpIcon('b3_bomb',18)+'</span>');
  if(r.pips&&r.pips.max) a.push(b3pGems(r.pips.left,r.pips.max,0,11));
  return a.join('');
}
function b3pTarget() {
  const S=B3.pending&&!B3.pending.ruckus?B3_SKILLS[B3.pending.id]:null,ms=S?b3Matchups(B3.F,B3.actor,S):[],rc=b3Rec();
  return '<div class="b2-list bp-list">'+'<div class="b3-pv" id="b3-pv"></div>'+B3.opts.map((o,i)=>{
    const ts=o.units.slice(0,4),m=ms.find(x=>o.units.length===1&&x.key===o.units[0].key),r=rc&&B3.pending&&rc.skill===B3.pending.id&&rc.target===o.key;
    return '<button type="button" class="b2-btn bp-row'+(i===B3.sel?' sel':'')+(o.no?' no':'')+(r?' rec':'')+'" data-i="'+i+'"><span class="bp-faces">'+ts.map(t=>'<span class="bp-tg">'+b3pFace(t)+(t.maxHp?b3pHp(t):'')+'</span>').join('')+'</span>'+
      '<span class="bp-m">'+(o.units.length>1?bpIcon(o.ally?'m_trio_g':'m_trio',18):'')+(m?b3pMeet(m):'')+'</span>'+(r?b3pStar(22):'')+'</button>'; }).join('')+bpBack()+'</div>';
}
// "What is on them", as pictures: the face, HP, shield, pips and Pet Peeves; at most three status chips (one short word each).
function b3pInfo() {
  const t=b3Unit(B3.F,B3.infoKey),v=B3.view.u[t.key],rows=b3Carried(B3.F,t).slice(0,3),pv=t.side==='foe'?b3Peeves(t):[];
  return '<div class="b2-list bp-list b3p-info"><div class="b3p-ih">'+b3pFace(t)+'<span>'+b3pHp(t)+(v.sh?'<span class="b3p-sh">'+bpIcon('b3_guard',18)+'<b>'+v.sh+'</b></span>':'')+'</span>'+
    (t.maxPips?b3pGems(v.pips,v.maxPips,0,13):'')+(pv.length?'<span class="b3p-pv">'+bpIcon('m_up',16)+pv.map(f=>bpIcon(B3P_FLAV[f]||'m_shoulder',16)).join('')+'</span>':'')+
    (t.resists&&t.resists.length?'<span class="b3p-pv">'+bpIcon('b3_resist',16)+t.resists.map(f=>bpIcon(B3P_FLAV[f]||'m_shoulder',16)).join('')+'</span>':'')+'</div>'+
    '<div class="b3p-chips">'+(v.ko?bpIcon('b3_ko',28):'')+rows.map(r=>'<span class="b2-st" style="color:'+r.color+'">'+b2Esc(r.short)+'</span>').join('')+'</div>'+bpBack()+'</div>';
}
const b3pCmd=b3RenderCmd;
b3RenderCmd=function() {
  const box=$('b3-cmd'),u=B3.actor; if(!box) return;
  if(!b3pOn()||B3.ui==='done') { box.classList.remove('bp'); return b3pCmd(); }
  const cmdOn=battle.state==='command'&&u;
  box.classList.add('bp');
  if(!cmdOn||B3.ui==='cross'||B3.ui==='busy') { box.innerHTML=b3pCross(u,cmdOn); return; }
  box.innerHTML=B3.ui==='info'?b3pInfo():B3.ui==='skills'?b3pSkills(u):B3.ui==='ruckus'?b3pRuckus(u):B3.ui==='target'?b3pTarget():'';
};

// ---------- The preview box, as pictures ----------
function b3pPv(v) {
  if(!v) return '';
  if(!v.ok) return '<div class="b3p-no">'+bpIcon('m_lock',22)+'</div>';
  const head='<div class="b3p-h"><span class="b3p-fl">'+v.flavor.map(f=>bpIcon(B3P_FLAV[f]||'m_shoulder',22)).join('')+'</span><span class="bp-cost">'+b3pDrops(v.cost,14)+'</span>'+(v.pepGain>0?'<span class="b3p-gain">'+bpIcon('m_drop',12)+'+'+v.pepGain+'</span>':'')+'</div>';
  const rows=v.rows.map(r=>'<div class="b3p-r">'+(r.key&&b3Unit(B3.F,r.key)?b3pFace(b3Unit(B3.F,r.key)).replace('bp-face','bp-face b3p-s'):'')+b3pMeet(r)+(r.pips&&r.pips.brk?bpIcon('b3_star',18):'')+(r.ko?bpIcon('b3_ko',18):'')+'</div>').join('');
  const gv=v.gives.map(g=>'<div class="b3p-r">'+b3pFace(B3.F.party.find(p=>p.name===g.who)||B3.F.party[0]).replace('bp-face','bp-face b3p-s')+bpIcon(g.k==='shield'?'b3_guard':'m_plusheart',18)+'</div>').join('');
  const mv=Object.keys(v.moved).map(k=>'<div class="b3p-r">'+b3pFace(b3Unit(B3.F,k)).replace('bp-face','bp-face b3p-s')+bpIcon(v.moved[k].kind==='push'?'b3_push':'m_up',18)+'</div>').join('');
  return head+rows+gv+mv;
}
const b3pPvText=b3PvHtml;
b3PvHtml=function(v) { return b3pOn()?b3pPv(v):b3pPvText(v); };

// ---------- The Vibes screen in Rose Mode (called at the end of b3vRender, engine/b3-menu.js) ----------
// The screen is built the same way; this puts a picture on each thing and takes the small words off. Names stay (a kid reads those).
// Role: a star for the Main Vibe, a bag for the Pocket Vibe. A ladder row: a picture of what it is, its name, then drops (Pep), a
// lock (not open yet) or a star (a Quirk that is equipped). Rose Mode picks the Vibes and Quirks itself in a fight, and a line says so.
function b3pVibes(box,L) {
  if(!b3pOn()) return;
  const say=box.querySelector('.b3v-say'); if(say&&!box.querySelector('.b3p-auto')) { const a=document.createElement('div'); a.className='b3p-auto'; a.innerHTML=bpIcon('b3_star',18)+'<span>Rose Mode picks Vibes and Quirks for fights</span>'; box.querySelector('.b3v-body').prepend(a); }
  box.querySelectorAll('.b3v-card').forEach(c=>{ const r=c.querySelector('.b3v-role'); if(!r||r.dataset.p) return; const main=c.classList.contains('main'),pocket=c.classList.contains('pocket');
    r.dataset.p='1'; r.innerHTML=bpIcon(main?'b3_star':pocket?'x_bag':'m_lock',16,'',!main&&!pocket); });
  box.querySelectorAll('.b3v-row').forEach(b=>{ if(b.dataset.p) return; b.dataset.p='1';
    const id=(b.dataset.k||'').split('-').slice(2).join('-'),S=B3_SKILLS[id],locked=b.classList.contains('locked'),soon=b.classList.contains('soon');
    const ico=S?(S.slot==='cap'?bpIcon('b3_star',22):'<span class="b3p-fl">'+S.flavor.map(f=>bpIcon(B3P_FLAV[f]||'m_shoulder',22)).join('')+'</span>'):B3_QUIRKS[id]?bpIcon('m_plusheart',22):bpIcon('b3_guard',22);
    const small=b.querySelector('small'),em=b.querySelector('em'),eq=em&&em.textContent==='EQUIPPED';
    const tail=locked||soon?bpIcon('m_lock',18):eq?bpIcon('b3_star',18):S&&S.pep?b3pDrops(S.pep,11):'';
    if(small) small.outerHTML='<small class="b3p-vi">'+ico+'</small>'; if(em) em.outerHTML='<em class="b3p-vt">'+tail+'</em>'; else if(tail) b.insertAdjacentHTML('beforeend','<em class="b3p-vt">'+tail+'</em>'); });
  box.querySelectorAll('.b3v-act').forEach(b=>{ if(b.dataset.p) return; b.dataset.p='1'; const main=/MAIN/.test(b.textContent),on=b.classList.contains('on'); b.innerHTML=bpIcon(main?'b3_star':'x_bag',22)+'<span>'+(on?(main?'Main':'Pocket'):(main?'Make main':'Make pocket'))+'</span>'; });
}
