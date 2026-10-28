'use strict';
// engine/menu.js — The pause menu: PARTY, ITEMS, GEAR, STATUS, STAMPS, LOAD, OPTIONS (engine/feel.js), QUIT. (STATUS and STAMPS are drawn by engine/progress.js.)
// Section tabs and character tabs share one tab style. STATUS and GEAR are per character (character row shown);
// ITEMS and SAVE are party-wide (character row hidden; items pick their target inline).
// Controls: tap; or arrows/WASD move focus, Enter/A selects, Esc/B goes back, Q/E (L2/R2, R1) switch character.
// Layout follows the Final Fantasy IV Pixel Remaster menu: command list on the left (with play time and coins
// under it), the party roster on the right, the location line, then a hint bar with Rotate, Music, Sound, Close.
const MENU_TABS=[{id:'home',label:'Party'},{id:'items',label:'Items'},{id:'gear',label:'Gear'},{id:'status',label:'Status'},{id:'stamps',label:'Stamps'},{id:'saves',label:'Load'},{id:'options',label:'Options'},{id:'quit',label:'Quit'}];
// Saving happens from the SAVE button on the map HUD (openSave), which shows just the save popup.
const PER_CHAR_TABS=['status','gear','stamps'];
// Character portraits for the roster. Put an image path per id (e.g. tom:'portraits/tom.png?v=4'); empty shows a placeholder.
const PORTRAITS={tom:'portraits/tom.png?v=13',ellie:'portraits/ellie.png?v=1',amy:'portraits/amy.png?v=11',grace:'portraits/grace.png?v=11',deedee:'portraits/deedee.png?v=12',boppy:'portraits/boppy.png?v=11',nara:'portraits/nara.png?v=3',boomie:'portraits/boomie.png?v=1',tnb:'portraits/tnb.png?v=12',rose:'portraits/rose.png?v=11'};
let playTime=0;
// Gear (F6): the six battle stats. Tools add POW and WARMTH, Outfits HP, GRIT and COOL, Keepsake Charms have perks.
const GEAR_KEYS=STAT_NAMES;
const STAT_SHORT={hp:'HP',pow:'POW',grit:'GRIT',warmth:'WARM',cool:'COOL',pep:'PEP'};
// BEST GEAR scoring: stat points (HP counts less, it comes in bigger numbers); charms by their perk (b6PerkScore).
const GEAR_WEIGHT={hp:.2,pow:1,grit:1,warmth:1,cool:1,pep:1};
const ITEM_FILTERS=[{id:'all',label:'ALL'},{id:'heal',label:'HEAL'},{id:'battle',label:'BATTLE'},{id:'gear',label:'GEAR'},{id:'keep',label:'KEEPSAKE'}];
let menuSaving=false,menuQuit=false,menuItem=null,menuFilter='all',menuConfirm=null,menuConfirmTimer=0,menuKeyNav=false,menuFocusNext=null;
menuTab='home';

const gearVal=(it,k)=>!it?0:((it.stats&&it.stats[k])||0);
const gearScore=it=>!it?0:GEAR_KEYS.reduce((a,k)=>a+gearVal(it,k)*GEAR_WEIGHT[k],0)+b6PerkScore(it.perk);
const itemCat=it=>it.slot?'gear':(fieldUsable(it)?'heal':(battleUsable(it)?'battle':'keep'));
const CAT_ORDER={heal:0,battle:1,gear:2,keep:3};
function gearDiff(m,id,slot) {
  const it=id?items[id]:null; slot=slot||it.slot;
  const cur=m.equipment[slot]?items[m.equipment[slot]]:null;
  return GEAR_KEYS.map(k=>[k,gearVal(it,k)-gearVal(cur,k)]).filter(([,v])=>v);
}
function gearOptions(m,slot) {
  return [...new Set(bag.filter(id=>items[id]&&items[id].slot===slot&&canWear(m,items[id])))]
    .sort((a,b)=>gearScore(items[b])-gearScore(items[a])||items[a].name.localeCompare(items[b].name));
}
function bestFor(m,slot) {
  const cur=m.equipment[slot]; let best=null,bs=cur?gearScore(items[cur]):0;
  for(const id of gearOptions(m,slot)) { const s=gearScore(items[id]); if(s>bs) { best=id; bs=s; } }
  return best;
}
const hasUpgrade=m=>wearSlots(m).some(s=>bestFor(m,s));
function gearTotals(m,swapSlot,swapId) {
  const t={};
  for(const k of GEAR_KEYS) {
    let v=statTotal(m,k);
    if(swapSlot!=null) v+=gearVal(swapId?items[swapId]:null,k)-gearVal(m.equipment[swapSlot]?items[m.equipment[swapSlot]]:null,k);
    t[k]=v;
  }
  return t;
}
const signed=v=>(v>0?'+':'')+v;
function el(tag,cls,html) { const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function btn(cls,key,html,fn) {
  const b=el('button',cls,html); b.type='button';
  if(key) b.dataset.k=key;
  if(fn) b.addEventListener('click',e=>{ e.stopPropagation(); fn(e); });
  return b;
}
// Stat changes as chips; a charm (perk) shows what its perk does instead.
function diffChips(diffs,cur,it) {
  const w=el('span','chips-inline');
  const perk=it&&it.perk?b6PerkText(it.perk):'';
  if(perk) { const c=el('span','dchip perk'); c.textContent='★ '+perk; w.appendChild(c); }
  else if(it===null&&cur&&cur.perk) { const c=el('span','dchip down'); c.textContent='No perk'; w.appendChild(c); }
  if(!diffs.length) { if(!perk&&!(it===null&&cur&&cur.perk)) w.appendChild(el('span','dchip same',cur?'Same stats':'No stats')); return w; }
  for(const [k,v] of diffs) { const c=el('span','dchip '+(v>0?'up':'down')); c.textContent=(v>0?'▲':'▼')+signed(v)+' '+STAT_SHORT[k]; w.appendChild(c); }
  return w;
}
function miniPortrait(m) { const c=document.createElement('canvas'); c.width=24; c.height=24; drawPortrait(m,c); return c; }
function bar(frac,color) { const b=el('span','mbar'); const i=el('i'); i.style.width=Math.max(0,Math.min(100,Math.round(frac*100)))+'%'; if(color) i.style.background=color; b.appendChild(i); return b; }

// ---------- Actions ----------
// A charm with `hat` shows on Tom's head in town (a color, or the sunhat color for the drawn hats).
function syncHeroHat() {
  const it=hero.equipment.Charm&&items[hero.equipment.Charm],h=it&&it.hat;
  palettes.player.hat=h?(String(h)[0]==='#'?h:'#dac487'):null;
}
function menuWear(m,id) {
  const it=items[id];
  if(!canWear(m,it)) { sfx.nope(); showToast(it.name+' is made for '+memberById(it.who).name+'. It would not fit '+m.name+'.',2.4); return; }
  const slot=it.slot;
  if(!equipTo(m,id)) { sfx.nope(); return; }
  sfx.equip(); syncHeroHat();
  showToast(m.name+' puts on '+it.name+'.',1.6);
  if(menuTab==='gear') { menuSlot=null; menuFocusNext='slot-'+slot; }
  renderMenu();
}
function menuTakeOff(m,slot) {
  const id=m.equipment[slot]; if(!id) return;
  m.equipment[slot]=null; bag.push(id);
  sfx.unequip(); syncHeroHat();
  menuSlot=null; menuFocusNext='slot-'+slot;
  renderMenu();
}
function equipBest(m) {
  const before=gearTotals(m),put=[];
  for(const s of wearSlots(m)) { const id=bestFor(m,s); if(id&&equipTo(m,id)) put.push(items[id].name); }
  if(!put.length) { sfx.nope(); showToast(m.name+' is already wearing the best gear in the pockets.',2.2); return; }
  sfx.equip(); syncHeroHat();
  const after=gearTotals(m);
  const ch=GEAR_KEYS.map(k=>[k,after[k]-before[k]]).filter(([,v])=>v).map(([k,v])=>signed(v)+' '+STAT_LABEL[k]).join(', ');
  showToast(m.name+' puts on '+put.join(', ')+'.'+(ch?' '+ch+'.':''),3.2);
  menuSlot=null; renderMenu();
}
function removeAll(m) {
  const off=wearSlots(m).filter(s=>m.equipment[s]);
  if(!off.length) { sfx.nope(); return; }
  for(const s of off) { bag.push(m.equipment[s]); m.equipment[s]=null; }
  sfx.unequip(); syncHeroHat();
  showToast(m.name+' takes everything off. Back to the pockets.',2);
  menuSlot=null; renderMenu();
}
function askConfirm(key) {
  menuConfirm=key; clearTimeout(menuConfirmTimer);
  menuConfirmTimer=setTimeout(()=>{ if(menuConfirm===key) { menuConfirm=null; if(menuOpen) renderMenu(); } },3500);
  sfx.select(); renderMenu();
}

// ---------- Render ----------
function renderMenu() {
  if(menuSaving) { renderSavePop(); return; }
  if(menuTab!=='home'&&!MENU_TABS.some(t=>t.id===menuTab)) menuTab='home';
  if(menuChar>=party.length) menuChar=0;
  const ae=document.activeElement;
  const keep=menuFocusNext||(menuKeyNav&&ae&&ae.dataset?ae.dataset.k:null);
  menuFocusNext=null;
  const m=party[menuChar],perChar=PER_CHAR_TABS.includes(menuTab);
  const body=$('menu-body'),top=body.scrollTop;
  body.innerHTML='';

  // Command list.
  const cmds=$('menu-cmds'); cmds.innerHTML='';
  for(const t of MENU_TABS) {
    const b=btn('mcmd'+(t.id===menuTab?' active':''),'cmd-'+t.id,t.label,()=>{ if(t.id==='quit') openQuit(); else setMenuTab(t.id); });
    if(t.id!=='quit') { b.setAttribute('role','tab'); b.setAttribute('aria-selected',t.id===menuTab); }
    if(t.id==='stamps'&&party.some(b6Stampable)) b.appendChild(el('i','cmd-dot'));   // Stamp Points waiting
    cmds.appendChild(b);
  }
  $('menu-time').textContent=fmtTime(playTime);
  $('menu-coins').textContent=coins;
  $('menu-loc').textContent=(currentMap&&currentMap.name)||'Long Island';

  // Character tabs, only where the view is about one person.
  const pick=$('menu-party'); pick.innerHTML=''; pick.hidden=!perChar;
  if(perChar) party.forEach((pm,i)=>{
    const b=btn('mtab ptab'+(i===menuChar?' active':'')+(pm.hp<=0?' ko':''),'char-'+i,'',()=>setMenuChar(i));
    b.setAttribute('role','tab'); b.setAttribute('aria-selected',i===menuChar); b.setAttribute('aria-label',pm.name);
    const copy=el('span','ptab-copy');
    const nm=el('span','ptab-name'); nm.textContent=pm.name.toUpperCase(); copy.appendChild(nm);
    copy.appendChild(bar(pm.hp/pm.maxHp,pm.hp/pm.maxHp<=.25?'#c8553d':null));
    copy.appendChild(bar(pm.level>=B6.maxLevel?1:pm.xp/B6.xpPerLevel,'#c9a24d'));
    b.appendChild(copy);
    if(menuTab==='gear'&&hasUpgrade(pm)) b.appendChild(el('i','up-badge','\u25B2'));
    if(menuTab==='stamps'&&b6Stampable(pm)) b.appendChild(el('i','up-badge sp','\u2605'));
    pick.appendChild(b);
  });

  if(menuTab==='home') renderHome(body);
  else if(menuTab==='status') renderStatusTab(body,m);
  else if(menuTab==='gear') renderGearTab(body,m);
  else if(menuTab==='stamps') renderStampsTab(body,m);
  else if(menuTab==='items') renderItemsTab(body);
  else if(menuTab==='options') b7RenderOptions(body);   // engine/feel.js: difficulty, battle speed, High-Five
  else renderSaveTab(body);
  $('menu-foot').hidden=menuTab==='home';

  body.scrollTop=top;
  renderQuit();
  b6Badge();
  if(keep) {
    const f=document.querySelector('#menu [data-k="'+keep+'"]')||document.querySelector('#menu .mcmd.active')||document.querySelector('#menu .mcmd');
    if(f) { f.focus({preventScroll:true}); f.scrollIntoView({block:'nearest'}); }
  }
}
const fmtTime=s=>{ s=Math.floor(s); const h=Math.floor(s/3600),mm=Math.floor(s/60)%60; return h+':'+String(mm).padStart(2,'0'); };

// Portrait box: an image when PORTRAITS has one, otherwise a placeholder with the initial.
// Portrait size snapped so the 64px art lands on whole device pixels.
// Big screens (desktop, iPad): the menu and shop lay out as if on a phone in landscape (about 880 x 500),
// then zoom up to fill the screen, so text and windows grow together. Phones never reach the threshold.
let menuZ=1;
function menuZoom() {
  const g=$('game'), rot=typeof layout!=='undefined'&&layout.rotated;
  const w=rot&&g?g.offsetWidth:innerWidth, h=rot&&g?g.offsetHeight:innerHeight;
  menuZ=(w>=1000&&h>=560)?Math.max(1,Math.min(2.4,w/880,h/500)):1;
  for(const id of ['menu','shop']) { const e=$(id); if(e) e.style.zoom=menuZ>1?menuZ.toFixed(3):''; }
  return menuZ;
}
function snapPz(want) { const dpr=(window.devicePixelRatio||1)*menuZ,step=64/dpr,k=Math.floor(want/step); return k>=1&&step*k>=want*.8?step*k:want; }
// Big portrait for the STATUS and GEAR views.
function charPic(m,want,cls) {
  const b=portraitBox(m,'lg'+(cls?' '+cls:'')+(m.hp<=0?' ko':''));
  b.style.setProperty('--pz',snapPz(want).toFixed(2)+'px');
  return b;
}
function portraitBox(m,cls) {
  const box=el('span','pbox'+(cls?' '+cls:''));
  if(PORTRAITS[m.id]) { const img=document.createElement('img'); img.src=PORTRAITS[m.id]; img.alt=m.name; box.appendChild(img); }
  else { box.classList.add('ph'); box.innerHTML='<b></b><small>PORTRAIT</small>'; box.querySelector('b').textContent=m.name[0]; }
  return box;
}
// HOME: the roster. Tap someone to see their status.
function renderHome(body) {
  const list=el('div','roster');
  party.forEach((p,i)=>{
    const row=btn('rrow'+(i===menuChar?' active':'')+(p.hp<=0?' ko':''),'roster-'+i,'',()=>{ menuChar=i; setMenuTab('status'); });
    row.setAttribute('aria-label',p.name+', status');
    row.appendChild(portraitBox(p));
    const who=el('span','r-who');
    const t=el('span','r-title'); t.textContent=p.title; who.appendChild(t);
    const n=el('span','r-name'); n.textContent=p.name+(p.hp<=0?' \u00b7 KO':''); who.appendChild(n);
    row.appendChild(who);
    const st=el('span','r-stats');
    const line=(lbl,val,cls)=>{ const l=el('span','r-line'+(cls?' '+cls:'')); l.appendChild(el('span','r-lbl',lbl)); const v=el('span','r-val'); v.textContent=val; l.appendChild(v); st.appendChild(l); };
    line('HP',p.hp+' / '+p.maxHp,p.hp<=0?'ko':(p.hp/p.maxHp<=.25?'low':''));
    line('Lv.',String(p.level));
    { const sp=b6SpLeft(p); line('Stamps',sp?sp+' SP':'—',sp&&b6Stampable(p)?'gold':''); }
    row.appendChild(st);
    const nx=el('span','r-next'); nx.appendChild(el('span','r-lbl','Next level in')); const nv=el('span','r-val'); nv.textContent=p.level>=B6.maxLevel?'MAX':Math.max(0,B6.xpPerLevel-p.xp); nx.appendChild(nv);
    row.appendChild(nx);
    list.appendChild(row);
  });
  // Always show four slots, like FF IV; slots nobody fills stay empty (not focusable).
  for(let i=party.length;i<(typeof PARTY_MAX==='number'?PARTY_MAX:4);i++) {
    const empty=el('div','rrow empty'); empty.setAttribute('aria-hidden','true'); list.appendChild(empty);
  }
  body.appendChild(list);
  sizeRoster(); requestAnimationFrame(sizeRoster);
}
// Portrait size: rows split the window evenly (like FF IV) and the portrait fills its row.
// Snapped so 64px art lands on whole device pixels (no uneven pixel widths).
function sizeRoster() {
  const list=document.querySelector('#menu .roster'); if(!list) return;
  const body=$('menu-body'), n=Math.max(1,list.children.length);
  const cs=getComputedStyle(body), padV=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
  const rowH=(body.clientHeight-padV)/Math.max(4,n);
  const land=document.documentElement.classList.contains('landscape');
  const cap=land?Math.min(150,body.clientWidth*.2):Math.min(132,body.clientWidth*.46);
  const want=Math.max(48,Math.min(cap,rowH-12));
  const dpr=(window.devicePixelRatio||1)*menuZ, step=64/dpr;
  const snap=step*Math.floor(want/step);
  const pz=snap>=want*.88?snap:Math.floor(want*dpr)/dpr;
  list.style.setProperty('--pz',pz.toFixed(2)+'px');
}
addEventListener('resize',()=>{ menuZoom(); if(!$('menu').hidden) sizeRoster(); });

// Leaving the Stampcard (another tab, Back, or closing the menu) autosaves quietly, so new stamps are never lost.
function menuLeaveStamps() { if(menuTab==='stamps'&&typeof saveGame==='function') saveGame('auto',true); }
function setMenuTab(id) {
  if(menuTab!==id) { sfx.tab(); menuLeaveStamps(); }
  menuTab=id; menuSlot=null; menuItem=null; menuConfirm=null; if(typeof b6Sure!=='undefined') b6Sure=null;
  $('menu-body').scrollTop=0; menuFocusNext=menuKeyNav?'cmd-'+id:null;
  renderMenu();
}
function setMenuChar(i) {
  if(menuChar!==i) sfx.tab();
  menuChar=i; menuSlot=null;
  menuFocusNext=menuKeyNav?'char-'+i:null;
  renderMenu();
}
function menuCycleChar(d) {
  if(!PER_CHAR_TABS.includes(menuTab)||party.length<2) return;
  setMenuChar((menuChar+d+party.length)%party.length);
}

// STATUS and STAMPS: renderStatusTab and renderStampsTab in engine/progress.js.

// GEAR: stat panel with live preview, BEST GEAR, slots with comparisons.
function renderGearTab(body,m) {
  $('menu-foot').textContent='Tool: POW and WARMTH. Outfit: HP, GRIT and COOL. Charm: a perk. ▲ means a better piece is in the pockets.';
  const wrap=el('div','gear-wrap');
  const side=el('div','gear-side');
  const panel=el('div','mcard gear-stats'); panel.id='gear-stats';
  const t=gearTotals(m);
  for(const k of GEAR_KEYS) {
    const c=el('div','gs-cell'); c.dataset.stat=k;
    c.innerHTML='<span class="gs-lbl">'+STAT_SHORT[k]+'</span><span class="gs-val">'+t[k]+'</span><span class="gs-new"></span>';
    panel.appendChild(c);
  }
  const top=el('div','gear-top');
  top.appendChild(charPic(m,document.documentElement.classList.contains('landscape')?96:64));
  top.appendChild(panel);
  side.appendChild(top);
  const acts=el('div','gear-acts');
  const up=hasUpgrade(m);
  acts.appendChild(btn('menu-act primary'+(up?'':' dim'),'best','★ BEST GEAR',()=>equipBest(m)));
  acts.appendChild(btn('menu-act'+(wearSlots(m).some(s=>m.equipment[s])?'':' dim'),'strip','REMOVE ALL',()=>removeAll(m)));
  side.appendChild(acts);
  wrap.appendChild(side);

  const list=el('div','slot-list');
  for(const slot of wearSlots(m)) {
    const id=m.equipment[slot],it=id?items[id]:null,open=menuSlot===slot,better=bestFor(m,slot);
    const opts=gearOptions(m,slot);
    const row=btn('slot-row'+(open?' open':''),'slot-'+slot,'',()=>{ sfx.tab(); menuSlot=open?null:slot; menuFocusNext=menuKeyNav?(open?'slot-'+slot:(opts[0]?'cand-'+slot+'-'+opts[0]:'slot-'+slot)):null; renderMenu(); });
    row.setAttribute('aria-expanded',open);
    row.appendChild(el('span','slot-name',SLOT_SHORT[slot]));
    row.appendChild(el('span','item-icon sm',it?it.icon+(it.color?'<i class="swatch" style="background:'+it.color+'"></i>':''):'·'));
    const copy=el('span','item-copy');
    const nm=el('span','item-name'); nm.textContent=it?it.name:'Nothing'; copy.appendChild(nm);
    const meta=el('span','item-meta'); meta.textContent=it?(bonusText(it)||'No stats. Looks nice.'):(opts.length?opts.length+' in the pockets fit here.':'Open '+SLOT_LABEL[slot]+' slot.'); copy.appendChild(meta);
    row.appendChild(copy);
    if(better) row.appendChild(el('span','up-mark','▲'));
    row.appendChild(el('span','chev',open?'▾':'▸'));
    list.appendChild(row);
    if(!open) continue;
    const picker=el('div','picker');
    opts.forEach((oid,i)=>{
      const o=items[oid],n=countInBag(oid),diffs=gearDiff(m,oid,slot);
      const c=btn('item-row cand','cand-'+slot+'-'+oid,'',()=>menuWear(m,oid));
      c.dataset.prev=oid; c.dataset.slot=slot;
      c.appendChild(el('span','item-icon sm',o.icon+(o.color?'<i class="swatch" style="background:'+o.color+'"></i>':'')));
      const cc=el('span','item-copy');
      const cn=el('span','item-name'); cn.textContent=o.name+(n>1?' ×'+n:''); cc.appendChild(cn);
      const vs=el('span','item-meta'); vs.textContent=it?'vs '+it.name:'vs nothing'; cc.appendChild(vs);
      cc.appendChild(diffChips(diffs,it,o));
      c.appendChild(cc);
      if(oid===better) c.appendChild(el('span','item-tag best','BEST'));
      picker.appendChild(c);
    });
    if(id) {
      const off=btn('item-row cand','off-'+slot,'<span class="item-icon sm">✕</span><span class="item-copy"><span class="item-name">Take it off</span><span class="item-meta">Back to the pockets.</span></span>',()=>menuTakeOff(m,slot));
      off.dataset.prev=''; off.dataset.slot=slot;
      off.querySelector('.item-copy').appendChild(diffChips(gearDiff(m,null,slot),it,null));
      picker.appendChild(off);
    }
    const others=[...new Set(bag.filter(b=>items[b]&&items[b].slot===slot&&!canWear(m,items[b])))];
    if(!opts.length) picker.appendChild(el('div','menu-empty','Nothing in the pockets fits '+m.name+' here yet.'));
    if(others.length) { const note=el('div','menu-empty small'); note.textContent=others.map(b=>items[b].name+' ('+memberById(items[b].who).name+' only)').join(', ')+' also in the pockets.'; picker.appendChild(note); }
    list.appendChild(picker);
  }
  wrap.appendChild(list);
  body.appendChild(wrap);
}
// Show "4 > 5" in the stat panel while a candidate is focused or hovered.
function gearPreview(slot,id) {
  const panel=$('gear-stats'); if(!panel) return;
  const m=party[menuChar],now=gearTotals(m),then=slot!=null?gearTotals(m,slot,id||null):now;
  for(const c of panel.children) {
    const k=c.dataset.stat,d=then[k]-now[k],nw=c.querySelector('.gs-new');
    c.classList.toggle('up',d>0); c.classList.toggle('down',d<0);
    nw.textContent=d?'→'+then[k]:'';
  }
}

// ITEMS: filters, stacks, inline targets.
function renderItemsTab(body) {
  $('menu-foot').textContent='\u{1FA99} '+coins+' coins. Healing works here; battle items are used from the ▼ Bag in a fight. Buy and sell at Penny’s Pockets.';
  const ids=[...new Set(bag)].filter(id=>items[id]);
  const count={all:ids.length,heal:0,battle:0,gear:0,keep:0};
  for(const id of ids) count[itemCat(items[id])]++;
  if(menuFilter!=='all'&&!count[menuFilter]) menuFilter='all';
  if(menuItem&&!bag.includes(menuItem)) menuItem=null;
  const chips=el('div','filter-row');
  for(const f of ITEM_FILTERS) {
    if(f.id!=='all'&&!count[f.id]) continue;
    chips.appendChild(btn('fchip'+(f.id===menuFilter?' active':''),'f-'+f.id,f.label+' <b>'+count[f.id]+'</b>',()=>{ if(menuFilter!==f.id) sfx.tab(); menuFilter=f.id; menuItem=null; menuFocusNext=menuKeyNav?'f-'+f.id:null; renderMenu(); }));
  }
  body.appendChild(chips);
  if(!ids.length) { body.appendChild(el('div','menu-empty','Pockets empty. Go find a door.')); return; }
  const shown=ids.filter(id=>items[id]).filter(id=>menuFilter==='all'||itemCat(items[id])===menuFilter)
    .sort((a,b)=>CAT_ORDER[itemCat(items[a])]-CAT_ORDER[itemCat(items[b])]||items[a].name.localeCompare(items[b].name));
  const list=el('div','item-list single');
  for(const id of shown) {
    const it=items[id],cat=itemCat(it),n=countInBag(id),open=menuItem===id;
    const row=el('div','item-row'+(open?' open':''));
    row.appendChild(el('span','item-icon',it.icon+(it.color?'<i class="swatch" style="background:'+it.color+'"></i>':'')));
    const copy=el('span','item-copy');
    const nm=el('span','item-name'); nm.textContent=it.name+(n>1?' ×'+n:''); copy.appendChild(nm);
    const fx=bonusText(it);
    if(fx||it.slot) { const s=el('span','shop-note '+(cat==='gear'?'up':'fx')); s.textContent=(it.slot?(it.who?memberById(it.who).name+' · ':'')+SLOT_LABEL[it.slot]+(fx?' · ':''):'')+fx.replace('Battle: ',''); copy.appendChild(s); }
    const d=el('span','item-meta'); d.textContent=it.desc; copy.appendChild(d);
    row.appendChild(copy);
    const act=el('span','shop-actions');
    if(cat==='heal') {
      if(it.healAll) act.appendChild(btn('shop-btn','use-'+id,'USE ALL',()=>useFieldItem(hero,id)));
      else act.appendChild(btn('shop-btn'+(open?' wear':''),'use-'+id,open?'CLOSE':'USE',()=>toggleItem(id)));
    } else if(cat==='gear') {
      const wearers=party.filter(p=>canWear(p,it));
      if(wearers.length) act.appendChild(btn('shop-btn'+(open?' wear':' ghost'),'use-'+id,open?'CLOSE':'WEAR',()=>toggleItem(id)));
      else act.appendChild(el('span','item-tag muted',(memberById(it.who).name+' only').toUpperCase()));
    } else act.appendChild(el('span','item-tag muted',cat==='battle'?'IN BATTLE':'KEEPSAKE'));
    row.appendChild(act);
    list.appendChild(row);
    if(open) list.appendChild(targetPicker(id));
  }
  body.appendChild(list);
}
function toggleItem(id) {
  sfx.tab();
  menuItem=menuItem===id?null:id;
  menuFocusNext=menuKeyNav?(menuItem?'tgt-'+id+'-0':'use-'+id):null;
  renderMenu();
}
// Who gets it: each party member with the bar that matters and what would happen.
function targetPicker(id) {
  const it=items[id],box=el('div','picker targets');
  const list=it.slot?party.filter(p=>canWear(p,it)):party;
  list.forEach((p,i)=>{
    const t=btn('item-row tgt','tgt-'+id+'-'+i,'',()=>it.slot?menuWear(p,id):useFieldItem(p,id));
    t.appendChild(portraitBox(p,'sm'));
    const cc=el('span','item-copy');
    const nm=el('span','item-name'); nm.textContent=p.name; cc.appendChild(nm);
    let tag='',dim=false;
    if(it.slot) {
      const cur=p.equipment[it.slot]?items[p.equipment[it.slot]]:null;
      const vs=el('span','item-meta'); vs.textContent=cur?'Wears '+cur.name:'No '+SLOT_LABEL[it.slot]; cc.appendChild(vs);
      cc.appendChild(diffChips(gearDiff(p,id),cur,it));
      if(bestFor(p,it.slot)===id) tag='BEST';
    } else {
      const cur=p.hp,max=p.maxHp;
      const r=el('span','vrow tight');
      r.appendChild(bar(cur/max,cur/max<=.25?'#c8553d':null));
      const num=el('span','vnum'); num.textContent='HP '+cur+'/'+max; r.appendChild(num);
      cc.appendChild(r);
      if(p.id==='nara'&&it.heal&&!it.dogOk) { tag='WON’T EAT'; dim=true; }
      else if(it.revive) { tag=p.hp>0?'AWAKE':'+'+Math.ceil(p.maxHp/2)+' HP'; dim=p.hp>0; }
      else if(p.hp<=0) { tag='KO'; dim=true; }
      else if(cur>=max) { tag='FULL'; dim=true; }
      else tag='+'+Math.min(it.heal||it.healAll||0,max-cur)+' HP';
    }
    t.insertBefore(cc,null);
    if(tag) t.appendChild(el('span','item-tag'+(dim?' muted':(tag==='BEST'?' best':'')),tag));
    if(dim) t.classList.add('dim');
    box.appendChild(t);
  });
  return box;
}

// LOAD: loading asks once before acting. (Saving lives in the HUD save popup below.)
function renderSaveTab(body) {
  $('menu-foot').textContent=(typeof cloudAccountLine==='function'?cloudAccountLine():'Saves live in this browser on this device.')+' Save with the disk button on the map. Autosave happens at every door and after each battle.';
  const list=el('div','item-list single');
  for(const slot of SAVE_SLOTS) {
    const sv=readSave(slot);
    const row=el('div','save-row');
    row.innerHTML='<div class="item-icon">'+(slot==='auto'?'⏱':'\u{1F4BE}')+'</div><div class="save-copy"><span class="save-name"></span><span class="save-meta"></span></div>';
    row.querySelector('.save-name').textContent=slot==='auto'?'Autosave':'Slot '+slot;
    row.querySelector('.save-meta').textContent=saveSummary(sv);
    const k='load-'+slot,sure=menuConfirm===k;
    const l=btn('save-btn'+(sure?' sure':''),k,sure?'LOAD IT?':'LOAD',()=>{
      if(!sure) { askConfirm(k); return; }
      menuConfirm=null; closeMenu(); loadGame(slot);
    });
    l.disabled=!sv;
    row.appendChild(l);
    list.appendChild(row);
  }
  const hint=el('div','menu-empty small','Loading replaces where you are now. Anything since your last save is lost.');
  body.appendChild(list); body.appendChild(hint);
}

// SAVE POPUP: opened from the HUD save button. Three slots; overwriting asks once. Closes after saving.
function openSave(viaKeys) {
  if(typeof intro!=='undefined'&&intro.active) return;
  if(menuOpen||(typeof shopOpen!=='undefined'&&shopOpen)) return;
  menuOpen=true; menuSaving=true;
  sfx.menuOpen();
  clearInput();
  menuTab='home'; menuSlot=null; menuItem=null; menuConfirm=null; menuQuit=false;
  menuKeyNav=!!viaKeys;
  menuFocusNext=menuKeyNav?'psave-1':null;
  $('menu').classList.add('saving');
  $('menu').hidden=false;
  renderSavePop();
}
function renderSavePop() {
  const ae=document.activeElement;
  const keep=menuFocusNext||(menuKeyNav&&ae&&ae.dataset?ae.dataset.k:null);
  menuFocusNext=null;
  const old=$('menu-save'); if(old) old.remove();
  const wrap=el('div','mquit msave'); wrap.id='menu-save';
  wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-modal','true'); wrap.setAttribute('aria-labelledby','msave-title');
  wrap.addEventListener('click',e=>{ if(e.target===wrap) closeMenu(); });
  const box=el('div','mwin mquit-box msave-box');
  const h=el('div','mquit-title'); h.id='msave-title'; h.textContent='Save your game'; box.appendChild(h);
  const list=el('div','item-list single');
  for(const slot of SAVE_SLOTS) {
    if(slot==='auto') continue;
    const sv=readSave(slot);
    const row=el('div','save-row');
    row.innerHTML='<div class="item-icon">\u{1F4BE}</div><div class="save-copy"><span class="save-name"></span><span class="save-meta"></span></div>';
    row.querySelector('.save-name').textContent='Slot '+slot;
    row.querySelector('.save-meta').textContent=saveSummary(sv);
    const k='psave-'+slot,sure=menuConfirm===k;
    row.appendChild(btn('save-btn'+(sure?' sure':''),k,sure?'OVERWRITE?':'SAVE',()=>{
      if(sv&&!sure) { askConfirm(k); return; }
      menuConfirm=null; saveGame(slot); sfx.select(); closeMenu(); showToast('Saved to slot '+slot+'.',1.6);
    }));
    list.appendChild(row);
  }
  box.appendChild(list);
  if(typeof cloudAccountLine==='function') { const acct=el('div','mquit-text macct'+(cloudOn()?' on':''),cloudAccountLine()); acct.id='msave-acct'; box.appendChild(acct); }
  box.appendChild(el('div','mquit-text','Autosave also happens at every door and after each battle. Load from the menu.'));
  const row=el('div','mquit-btns one');
  row.appendChild(btn('save-btn mquit-no','psave-close','CLOSE',closeMenu));
  box.appendChild(row); wrap.appendChild(box);
  $('menu').appendChild(wrap);
  if(keep) { const f=document.querySelector('#menu-save [data-k="'+keep+'"]')||document.querySelector('#menu-save button'); if(f) f.focus({preventScroll:true}); }
}

// QUIT: back to the title screen, after a confirm. Reloading gives a clean start (same as a fresh launch).
function openQuit() { menuQuit=true; menuConfirm=null; sfx.select(); menuFocusNext=menuKeyNav?'quit-no':null; renderMenu(); }
function closeQuit() { menuQuit=false; sfx.tab(); menuFocusNext=menuKeyNav?'cmd-quit':null; renderMenu(); }
function quitToTitle() {
  menuQuit=false; sfx.select();
  $('menu').classList.add('quitting');
  setTimeout(()=>location.reload(),220);
}
function renderQuit() {
  const old=$('menu-quit'); if(old) old.remove();
  if(!menuQuit) return;
  const wrap=el('div','mquit'); wrap.id='menu-quit';
  wrap.setAttribute('role','alertdialog'); wrap.setAttribute('aria-modal','true'); wrap.setAttribute('aria-labelledby','mquit-title');
  wrap.addEventListener('click',e=>{ if(e.target===wrap) closeQuit(); });
  const box=el('div','mwin mquit-box');
  const h=el('div','mquit-title'); h.id='mquit-title'; h.textContent='Quit to the title screen?'; box.appendChild(h);
  box.appendChild(el('div','mquit-text','Anything since your last save will be lost.'));
  const auto=readSave('auto');
  if(auto) { const l=el('div','mquit-save'); l.appendChild(el('span','mp-lbl','Autosave')); const v=el('span'); v.textContent=saveSummary(auto); l.appendChild(v); box.appendChild(l); }
  const row=el('div','mquit-btns');
  row.appendChild(btn('save-btn mquit-no','quit-no','KEEP PLAYING',closeQuit));
  row.appendChild(btn('save-btn sure mquit-yes','quit-yes','QUIT',quitToTitle));
  box.appendChild(row); wrap.appendChild(box);
  $('menu-panel').appendChild(wrap);
}

// ---------- Portrait ----------
function drawPortrait(m,canvasId='portrait') {
  const cv=typeof canvasId==='string'?$(canvasId):canvasId;
  const pc=cv.getContext('2d');
  pc.imageSmoothingEnabled=false;
  pc.clearRect(0,0,24,24);
  const src={tom:TOM_OW,grace:GRACE_OW,rose:ROSE_OW,amy:AMY_OW,deedee:DEEDEE_OW,boppy:BOPPY_OW,tnb:TNB_OW,nara:NARA_OW}[m.id];
  const fr=src.down[0],pal=src.pal;
  // Crop the head: top rows, centered horizontally.
  const w=fr[0].length;
  const left=Math.floor((w-24)/2);
  const top=m.id==='rose'?2:0;
  const tint=garmentTint('ow',m.id,memberTopColor(m),true);
  for(let r=0;r<24;r++) {
    const row=fr[r+top];
    if(!row) break;
    for(let c=0;c<24;c++) {
      const ch=row[c+left];
      if(!ch||ch==='.') continue;
      const sr=r+top;
      pc.fillStyle=(tint&&sr>=tint.rows[0]&&sr<=tint.rows[1]&&tint.map[ch])||pal[ch];
      pc.fillRect(c,r,1,1);
    }
  }
  const hat=m.equipment.Charm;
  const fill=(x,y,w,h,col)=>{pc.fillStyle=col;pc.fillRect(x,y,w,h);};
  if(hat==='sunhat'||hat==='scrap') { const col=hat==='scrap'?'#f5d389':'#dac487'; fill(4,1,16,3,col); fill(2,4,20,2,col); fill(4,1,16,1,'#fff3cf'); }
  if(hat==='bcap') { fill(5,1,14,4,'#4a4e57'); fill(3,5,18,2,'#3a3d44'); fill(5,1,14,1,'#6a6f7a'); }
  if(hat==='beanie') { fill(5,0,14,6,'#3a4a8a'); fill(4,5,16,2,'#2c3a70'); fill(6,0,12,1,'#5b6cb0'); fill(11,2,2,2,'#ffe08a'); }
  if(hat==='rclip'&&m.id==='rose') { fill(5,4,2,2,'#d94a4a'); }
  if(m===hero&&canvasId==='portrait') syncHeroHat();
}

// ---------- Open, close, navigation ----------
function openMenu(viaKeys) {
  if(typeof intro!=='undefined'&&intro.active) return;
  if(menuOpen||(typeof shopOpen!=='undefined'&&shopOpen)) return;
  menuOpen=true;
  sfx.menuOpen();
  clearInput();
  menuTab='home'; menuSlot=null; menuItem=null; menuConfirm=null; menuQuit=false;
  menuKeyNav=!!viaKeys;
  menuFocusNext=menuKeyNav?'cmd-home':null;
  menuZoom();
  $('menu').hidden=false;
  $('menu-body').scrollTop=0;
  renderMenu();
  if(!menuKeyNav) $('menu-panel').focus({preventScroll:true});
}

function closeMenu() {
  if(!menuOpen) return;
  menuLeaveStamps();
  menuOpen=false; menuQuit=false; menuSaving=false; menuConfirm=null;
  const q=$('menu-quit'); if(q) q.remove();
  const sp=$('menu-save'); if(sp) sp.remove();
  $('menu').classList.remove('saving');
  sfx.menuClose();
  $('menu').hidden=true;
  canvas.focus();
}

// Back: cancel a confirm, close an open slot or item, then close the menu.
function menuBack(fromCmd) {
  if(menuSaving) { if(menuConfirm) { menuConfirm=null; renderMenu(); } else closeMenu(); return; }
  if(menuQuit) { closeQuit(); return; }
  if(fromCmd) { menuItem=null; menuSlot=null; menuConfirm=null; }
  if(menuConfirm) { menuConfirm=null; renderMenu(); return; }
  if(typeof b6Sure!=='undefined'&&b6Sure) { b6Sure=null; renderMenu(); return; }
  if(menuItem) { const id=menuItem; menuItem=null; sfx.tab(); menuFocusNext=menuKeyNav?'use-'+id:null; renderMenu(); return; }
  if(menuSlot) { const s=menuSlot; menuSlot=null; sfx.tab(); menuFocusNext=menuKeyNav?'slot-'+s:null; renderMenu(); return; }
  if(menuTab!=='home') { const t=menuTab; menuLeaveStamps(); menuTab='home'; sfx.tab(); menuFocusNext=menuKeyNav?'cmd-'+t:null; renderMenu(); return; }
  closeMenu();
}
function menuButtons() {
  const sel=menuSaving?'#menu-save button':menuQuit?'#menu-quit button':'#menu .menu-panel button';
  return [...document.querySelectorAll(sel)].filter(b=>!b.disabled&&b.offsetParent!==null);
}
// Spatial focus: pick the nearest button in the pressed direction.
function menuMove(dir) {
  menuKeyNav=true;
  const all=menuButtons(),cur=document.activeElement;
  if(!all.includes(cur)) { const t=menuSaving?all[0]:menuQuit?$('quit-no'):document.querySelector('#menu .mcmd.active')||document.querySelector('#menu .mcmd'); if(t) t.focus(); sfx.move(); return; }
  const a=cur.getBoundingClientRect(),cx=a.left+a.width/2,cy=a.top+a.height/2;
  let best=null,bd=Infinity;
  for(const b of all) {
    if(b===cur) continue;
    const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    const gx=Math.max(0,r.left-a.right,a.left-r.right),gy=Math.max(0,r.top-a.bottom,a.top-r.bottom);
    let main,cross;
    if(dir==='up') { if(r.bottom>a.top+2) continue; main=gy; cross=gx; }
    else if(dir==='down') { if(r.top<a.bottom-2) continue; main=gy; cross=gx; }
    else if(dir==='left') { if(r.right>a.left+2||gy>0) continue; main=gx; cross=gy; }
    else { if(r.left<a.right-2||gy>0) continue; main=gx; cross=gy; }
    const d=main+cross*3+Math.abs(dir==='up'||dir==='down'?x-cx:y-cy)*.05;
    if(d<bd) { bd=d; best=b; }
  }
  if(!best) return;
  sfx.move();
  best.focus({preventScroll:true});
  best.scrollIntoView({block:'nearest'});
}
// Keyboard while the menu is open. Returns true when handled.
function menuKey(e) {
  const dirs={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
  if(dirs[e.code]) { e.preventDefault(); menuMove(dirs[e.code]); return true; }
  if(e.code==='KeyQ'||e.code==='BracketLeft') { e.preventDefault(); menuKeyNav=true; menuCycleChar(-1); return true; }
  if(e.code==='KeyE'||e.code==='BracketRight') { e.preventDefault(); menuKeyNav=true; menuCycleChar(1); return true; }
  if(e.code==='Escape'||e.code==='Backspace') { e.preventDefault(); menuBack(); return true; }
  if((e.code==='Enter'||e.code==='Space')&&!menuButtons().includes(document.activeElement)) { e.preventDefault(); menuMove('down'); return true; }
  return false;
}
// Controller while the menu is open.
function menuPad(p) {
  if(p.dir&&p.dirEdge) menuMove(p.dir);
  if(p.A) { const f=document.activeElement; if(menuButtons().includes(f)) f.click(); else menuMove('down'); }
  if(p.B) menuBack();
  if(p.START||p.Y) { if(menuQuit) closeQuit(); else closeMenu(); }
  if(p.prev) { menuKeyNav=true; menuCycleChar(-1); }
  if(p.next) { menuKeyNav=true; menuCycleChar(1); }
}

// Live stat preview on focus or hover; touch input switches focus restore off.
(function wireMenu() {
  const mb=$('menu-body');
  const show=e=>{ const c=e.target.closest&&e.target.closest('[data-slot]'); if(c) gearPreview(c.dataset.slot,c.dataset.prev); };
  const hide=e=>{ const c=e.target.closest&&e.target.closest('[data-slot]'); if(c) gearPreview(null); };
  mb.addEventListener('focusin',show); mb.addEventListener('mouseover',show);
  mb.addEventListener('focusout',hide); mb.addEventListener('mouseout',hide);
  $('menu').addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') menuKeyNav=false; });
  // Tapping a hint's label works like tapping its key.
  for(const h of document.querySelectorAll('#menu .hint')) h.addEventListener('click',e=>{ const k=h.querySelector('.key'); if(e.target!==k) k.click(); });
})();
