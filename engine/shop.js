'use strict';
// engine/shop.js — Penny's Pockets: buy gear for each family member, healing and battle items; sell from the pockets.
// Stock lives here; the items themselves (price, who, effects) live in data/party.js.
const SHOP_STOCK={
  tom:['t_headphones','t_apron','t_slippers','t_controller'],
  grace:['g_headband','g_leotard','g_leggings','g_squishy'],
  rose:['r_ears','r_raincoat','r_boots','r_lamby'],
  amy:['a_visor','a_singlet','a_flats','a_redpen'],
  deedee:['d_hat','d_apron','d_clogs','d_mitt'],
  boppy:['b_hat','b_vest','b_shoes','b_pad'],
  tnb:['n_helmet','n_apron','n_shoes','n_lintroller'],
  nara:['y_bandana','y_harness','y_booties','y_ball'],
  healing:['jerky','juice','roll','biscuit','bandage','picnic','lemonade','cocoa','whistle'],
  battle:['balloon','popper','cushion','kazoo','goldstar']
};
const SHOP_TABS=[
  {id:'tom',label:'TOM'},{id:'grace',label:'GRACE'},{id:'rose',label:'ROSE'},{id:'amy',label:'AMY'},
  {id:'deedee',label:'DEEDEE'},{id:'boppy',label:'BOPPY'},{id:'tnb',label:'TNB'},{id:'nara',label:'NARA'},
  {id:'healing',label:'\u{1FA79} HEALING',cat:true},{id:'battle',label:'\u{1F388} BATTLE',cat:true}
];
const PENNY={
  intro:["Welcome to Penny's Pockets. I sell things for pockets. Also things for people.",
    'Gear for the whole family, snacks for fights, and a few things that go POP. Gently.',
    'Got something to sell? I buy almost anything. Not Steve. Never Steve.'],
  hello:['Back again! The coins missed you.','Browse all you like. Browsing is free. Buying is better.','Fresh stock. Same Penny.'],
  tab:{healing:'Snacks and fixes. Eat them in battle or from the menu.',battle:'For monsters only. Don\'t pop the poppers in here.',
    sell:'Half price, no haggling. Okay, a little haggling. No.'},
  gear:id=>({tom:'For the uncle. Comfy, nerdy, and a little bit Delta One.',grace:'Gymnastics approved. Glitter included.',rose:'Bouncy, brave and puddle-proof.',
    amy:'Built for speed. She tried everything on twice.',deedee:'Garden to oven and back. To the moon and back, she says.',boppy:'Twelve pockets and extra arch support.',
    tnb:'Skate, glaze, wardrobe. He likes the apron.',nara:'For the dog. She\'ll chew at least one of these.'})[id],
  bought:['Pleasure doing business.','Good choice. I\'d have picked that one too.','Into the pockets it goes.','Ka-ching. That\'s my favorite sound.'],
  sold:['Sold! I know just the shelf.','A fine addition to my collection.','Half price, full gratitude.'],
  broke:['Not enough coins. Grump Hollow pays, in a way.','Short on coins. The monsters up north are carrying some.'],
  keep:['I could never. That\'s a family thing.','Not for sale. Some things are priceless.','Put that back in your pocket. It\'s special.'],
  // Shop tiers: what the shopkeeper says about the shelves that open after chapters 3, 6 and 9 (see SHOP_TIER_GATES in data/party.js).
  fresh:['New shipment! The crates are still warm. Come see the good shelf.','Fresh stock, and it\'s a big step up. I\'m a little emotional.','The top shelf, finally. I\'ve been saving it for you. Look.'],
  tierTab:{
    gear:['The new shelf: sturdier, shinier, still gently priced. Twice the coins, more than twice the gear.','The grown-up shelf. Gear for people who actually fight things.','Top shelf. Everything up here has a story and a warranty. Sort of.'],
    healing:['Bigger bandages and a real picnic. Same pockets, more fixing.','The med kit has a flashlight now. Don\'t ask me why that helps.','Feast-grade snacks. Deedee called to approve them personally.'],
    battle:['The Confetti Cannon is new. Please aim it away from my shelves.','Fireworks. Legally a gray area. Emotionally, a gift.','The Finale Rocket. Hold it like it owes you money.']}
};
let shopOpen=false,shopMode='buy',shopTab='tom',shopNote='';

// ---------- Shop tiers ----------
// Tiers unlock on the chapter-clear flags (a later chapter number also opens them, for chapter select and finished saves).
const shopTierLevel=()=>{ let n=0; SHOP_TIER_GATES.forEach((c,i)=>{ if(STORY.chapter>c||flag('ch'+c+'-clear')) n=i+1; }); return n; };
// What a tab sells: unlocked tier rows (newest first), then the base shelf.
function shopStockFor(tab) {
  const lv=shopTierLevel(),tiers=SHOP_TIER_STOCK[tab]||[],out=[];
  for(let t=lv-1;t>=0;t--) out.push(...(tiers[t]||[]));
  return out.concat(SHOP_STOCK[tab]);
}
const shopTierIds=tab=>{ const lv=shopTierLevel(),a=[]; for(let t=0;t<lv;t++) a.push(...((SHOP_TIER_STOCK[tab]||[])[t]||[])); return a; };
const shopIsNew=id=>!!items[id].tier&&!flag('shopseen:'+id);
const shopTabHasNew=tab=>shopTierIds(tab).some(shopIsNew);
const shopAnyNew=()=>SHOP_TABS.some(t=>shopTabHasNew(t.id));
const shopPrice=it=>it.price||it.shopPrice||0;
// Every shelf has been seen once the shop closes; the NEW tags go away then.
function shopMarkSeen() { for(const t of SHOP_TABS) for(const id of shopTierIds(t.id)) if(!flag('shopseen:'+id)) setFlag('shopseen:'+id); }
const shopTierLine=kind=>{ const lv=shopTierLevel(); if(!lv) return ''; const k=SHOPK||PENNY,tt=(k.tierTab||PENNY.tierTab)[kind]; return tt?tt[lv-1]:''; };
// The shopkeeper's lines: Penny on Long Island, her cousin Nickel in Los Angeles (npc.shopLines).
let SHOPK=null;

function talkToShopkeeper(n) {
  SHOPK=n.shopLines||PENNY;
  $('shop-name').textContent=n.shopName||'Penny\u2019s Pockets';
  if(!n.visitedOnce) {
    n.visitedOnce=true;
    n.onClose=()=>openShop(pick((SHOPK||PENNY).hello));
    openDialog(n.name,(SHOPK||PENNY).intro,n);
    return;
  }
  n.facing=directionTo(player.x-n.x,player.y-n.y);
  openShop(pick((SHOPK||PENNY).hello));
}

function openShop(note) {
  if(shopOpen||menuOpen||battle.active) return;
  shopOpen=true;
  clearInput();
  sfx.menuOpen();
  shopMode='buy';
  if(!SHOP_STOCK[shopTab]) shopTab='tom';
  shopNote=(shopAnyNew()&&((SHOPK||PENNY).fresh||PENNY.fresh)[shopTierLevel()-1])||note||pick((SHOPK||PENNY).hello);
  renderShop();
  if(typeof menuZoom==='function') menuZoom();
  $('shop').hidden=false;
  $('shop-close').focus();
}
function closeShop() {
  if(!shopOpen) return;
  shopOpen=false;
  shopMarkSeen();
  sfx.menuClose();
  $('shop').hidden=true;
  saveGame('auto',true);
  canvas.focus();
}
function shopCycle(d) {
  if(shopMode!=='buy') return;
  const i=SHOP_TABS.findIndex(t=>t.id===shopTab);
  shopTab=SHOP_TABS[(i+d+SHOP_TABS.length)%SHOP_TABS.length].id;
  shopNote='';
  sfx.tab();
  renderShop();
  const b=document.querySelector('.shop-tab.active'); if(b) b.scrollIntoView({inline:'center',block:'nearest'});
}

const countInBag=id=>bag.filter(b=>b===id).length;
const wornBy=id=>Object.values(RECRUITS).concat([hero,grace,rose]).find(m=>Object.values(m.equipment).includes(id));

// "vs Sunny Shirt: +2 HP, -1 COOL" for a piece of gear against what that person wears in the same slot (charms: the perk).
function compareText(m,item) {
  const curId=m.equipment[item.slot],cur=curId?items[curId]:null;
  if(item.slot==='Charm') return {text:(cur?'vs '+cur.name+': ':'Open charm slot: ')+(b6PerkText(item.perk)||'no perk'),up:b6PerkScore(item.perk)-(cur?b6PerkScore(cur.perk):0)};
  const val=(it,k)=>!it?0:((it.stats&&it.stats[k])||0);
  const diffs=STAT_NAMES.map(k=>[k,val(item,k)-val(cur,k)]).filter(([,v])=>v);
  if(!diffs.length) return {text:cur?'Same stats as '+cur.name+'.':'',up:0};
  const up=diffs.reduce((a,[k,v])=>a+v*(k==='hp'?.2:1),0);
  return {text:(cur?'vs '+cur.name+': ':'Open slot: ')+diffs.map(([k,v])=>(v>0?'+':'')+v+' '+STAT_LABEL[k]).join(', '),up};
}

function shopButton(text,cls,fn) {
  const b=document.createElement('button');
  b.type='button'; b.className='shop-btn '+cls; b.textContent=text;
  b.addEventListener('click',e=>{ e.stopPropagation(); fn(); });
  return b;
}

function shopRow(id,{meta,note,noteCls,buttons,tag}) {
  const item=items[id],fresh=shopIsNew(id);
  const row=document.createElement('div');
  row.className='item-row shop-row';
  row.innerHTML='<span class="item-icon">'+item.icon+(item.color?'<i class="swatch" style="background:'+item.color+'"></i>':'')+'</span>'+
    '<span class="item-copy"><span class="item-name"></span><span class="item-meta"></span><span class="shop-note"></span></span><span class="shop-actions"></span>';
  row.querySelector('.item-name').textContent=item.name;
  if(fresh) { const nb=document.createElement('span'); nb.className='shop-new'; nb.textContent='NEW'; row.querySelector('.item-name').appendChild(nb); }
  row.querySelector('.item-meta').textContent=meta;
  const n=row.querySelector('.shop-note');
  if(note) { n.textContent=note; if(noteCls) n.classList.add(noteCls); } else n.remove();
  const act=row.querySelector('.shop-actions');
  if(tag) { const t=document.createElement('span'); t.className='item-tag muted'; t.textContent=tag; act.appendChild(t); }
  for(const b of buttons||[]) act.appendChild(b);
  return row;
}

function buyItem(id) {
  const item=items[id];
  const cost=shopPrice(item);
  if(coins<cost) { sfx.nope(); shopNote=pick((SHOPK||PENNY).broke); renderShop(); return; }
  coins-=cost;
  bag.push(id);
  sfx.coin();
  shopNote=cost?'Bought '+item.name+' for '+cost+' coins. '+pick((SHOPK||PENNY).bought):item.name+' is on the house. '+pick((SHOPK||PENNY).free||['Happy birthday. No charge. Don\'t tell the other shelves.']);
  renderShop();
}
function wearItem(m,id) {
  if(!equipTo(m,id)) { sfx.nope(); return; }
  sfx.equip();
  shopNote=m.name+' puts on the '+items[id].name+'.'+(inParty(m)?'':' It\'ll be ready when '+m.name+' joins the party.');
  renderShop();
}
function sellItem(id) {
  const item=items[id],v=sellValue(item),idx=bag.indexOf(id);
  if(idx<0) return;
  if(!v) { sfx.nope(); shopNote=pick((SHOPK||PENNY).keep); renderShop(); return; }
  bag.splice(idx,1);
  coins+=v;
  sfx.sell();
  shopNote='Sold '+item.name+' for '+v+' coins. '+pick((SHOPK||PENNY).sold);
  renderShop();
}

function renderShop() {
  $('shop-coins').textContent=coins;
  for(const b of document.querySelectorAll('.shop-mode')) b.classList.toggle('active',b.dataset.mode===shopMode);
  const tabs=$('shop-tabs');
  tabs.hidden=shopMode!=='buy';
  tabs.innerHTML='';
  SHOP_TABS.forEach((t,k)=>{
    if(t.cat&&!SHOP_TABS[k-1].cat) { const sep=document.createElement('span'); sep.className='shop-sep'; tabs.appendChild(sep); }
    const b=document.createElement('button');
    b.type='button'; b.className='shop-tab'+(t.cat?' cat':'')+(t.id===shopTab?' active':'');
    b.textContent=t.label;
    if(!t.cat&&inParty(memberById(t.id))) { const d=document.createElement('i'); d.className='in-party'; b.appendChild(d); }
    if(shopTabHasNew(t.id)) { const d=document.createElement('i'); d.className='shop-new-dot'; b.appendChild(d); }
    b.addEventListener('click',()=>{ if(shopTab!==t.id) sfx.tab(); shopTab=t.id; shopNote=''; renderShop(); });
    tabs.appendChild(b);
  });

  const body=$('shop-body');
  body.innerHTML='';
  body.scrollTop=0;
  const list=document.createElement('div');
  list.className='item-list';
  const head=$('shop-portrait'),icon=$('shop-icon');

  if(shopMode==='sell') {
    head.hidden=true; icon.hidden=false; icon.textContent='\u{1F45B}';
    $('shop-subtitle').textContent='SELL FROM THE POCKETS · HALF PRICE';
    const ids=[...new Set(bag)];
    ids.sort((a,b)=>(sellValue(items[b])?1:0)-(sellValue(items[a])?1:0));
    if(!ids.length) body.innerHTML='<div class="menu-empty">Pockets empty. Nothing to sell. '+((SHOPK||PENNY).who||'Penny')+' looks a little sad.</div>';
    for(const id of ids) {
      const it=items[id],v=sellValue(it),n=countInBag(id);
      const bits=[];
      if(it.slot) bits.push((it.who?memberById(it.who).name+' · ':'')+SLOT_LABEL[it.slot]);
      const fx=bonusText(it); if(fx) bits.push(fx);
      list.appendChild(shopRow(id,{meta:(n>1?'x'+n+' in pockets. ':'')+(bits.join(' · ')||it.desc),
        buttons:[v?shopButton('SELL \u{1FA99}'+v,'sell',()=>sellItem(id)):shopButton('KEEP','keep',()=>sellItem(id))]}));
    }
    if(ids.length) body.appendChild(list);
    $('shop-foot').textContent=shopNote||(SHOPK||PENNY).tab.sell+' Worn gear has to come off first.';
    return;
  }

  const tab=SHOP_TABS.find(t=>t.id===shopTab);
  if(tab.cat) {
    head.hidden=true; icon.hidden=false; icon.textContent=shopTab==='healing'?'\u{1FA79}':'\u{1F388}';
    $('shop-subtitle').textContent=shopTab==='healing'?'HEALING · HP, VP AND WAKE-UPS':'BATTLE ITEMS · USE FROM THE SNACK BAG IN A FIGHT';
    for(const id of shopStockFor(shopTab)) {
      const it=items[id],n=countInBag(id),afford=coins>=shopPrice(it);
      list.appendChild(shopRow(id,{meta:it.desc,note:effectText(it).replace('Battle: ','')+(n?' · '+n+' in pockets':''),noteCls:'fx',
        buttons:[shopButton(shopPrice(it)?'\u{1FA99}'+shopPrice(it):'FREE','buy'+(afford?'':' poor'),()=>buyItem(id))]}));
    }
  } else {
    const m=memberById(shopTab);
    head.hidden=false; icon.hidden=true;
    drawPortrait(m,'shop-portrait');
    $('shop-subtitle').textContent='GEAR FOR '+m.name.toUpperCase()+' · '+(inParty(m)?'IN THE PARTY':'AT HOME, WEARS IT WHEN RECRUITED');
    for(const id of shopStockFor(shopTab)) {
      const it=items[id],owner=wornBy(id),inBag=countInBag(id)>0,afford=coins>=shopPrice(it);
      const c=compareText(m,it);
      const buttons=[];
      let tag=null;
      if(owner===m) tag='WORN';
      else if(inBag) buttons.push(shopButton('WEAR','wear',()=>wearItem(m,id)));
      else if(owner) tag=owner.name.toUpperCase()+' HAS IT';
      else buttons.push(shopButton(shopPrice(it)?'\u{1FA99}'+shopPrice(it):'FREE','buy'+(afford?'':' poor'),()=>buyItem(id)));
      list.appendChild(shopRow(id,{meta:(it.shopPrice?'GOLD ':'')+SLOT_LABEL[it.slot].toUpperCase()+' · '+bonusText(it)+'. '+it.desc,
        note:owner===m?'':c.text,noteCls:c.up>0?'up':(c.up<0?'down':''),buttons,tag}));
    }
  }
  body.appendChild(list);
  $('shop-foot').textContent=shopNote||(tab.cat?(SHOPK||PENNY).tab[shopTab]+' '+shopTierLine(shopTab):(SHOPK||PENNY).gear(shopTab)+' '+shopTierLine('gear')+' Bought gear goes in the pockets; tap WEAR to put it on.').replace(/\s+/g,' ').trim();
}

for(const b of document.querySelectorAll('.shop-mode'))
  b.addEventListener('click',()=>{ if(shopMode!==b.dataset.mode) sfx.tab(); shopMode=b.dataset.mode; shopNote=''; renderShop(); });
$('shop-close').addEventListener('click',closeShop);
$('shop').addEventListener('click',e=>{ if(e.target===$('shop')) closeShop(); });
