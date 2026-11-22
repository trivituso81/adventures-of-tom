// tools/b3-check-gear.js — Battle 3 checks for gear (card c-b3gear, data/b3-gear.js, b3GearSum and b3PartyUnit in engine/b3-core.js).
// Also `typicalGear`, which tools/b3-sim.js uses for --gear=N: the gear a family member typically wears by chapter N, from real items.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.dirname(__dirname);
function loadItems() {
  const ctx=vm.createContext({console:{log(){},error(){}},Math,JSON,Object,Array,String,Number});
  vm.runInContext(fs.readFileSync(path.join(ROOT,'data/party.js'),'utf8')+';this.__items=items;',ctx);
  return ctx.__items;
}
// Generic items (nobody-only) a family typically wears at the start of each chapter 1 to 5: a Tool, an Outfit, a Charm.
const TYPICAL={1:['notebook','shirt','shoes'],2:['notebook','sweater','bcap'],3:['driftwood','hoodie','bcap'],4:['slate','jacket','pepper'],5:['slate','fielddaytee','pepper']};
function typicalGear(G,party,ch) {
  const items=loadItems(),list=(TYPICAL[ch]||TYPICAL[5]).map(id=>items[id]),sum=G('b3GearSum')(list),g={};
  for(const id of party) g[id]=sum;
  return g;
}
module.exports=function(T) {
  const {G,ok}=T,items=loadItems(),GEAR=G('B3_GEAR'),SUM=G('b3GearSum'),NF=G('b3NewFight');
  // 1. The table names every stat and perk key on every item: mapped, or switched off with a reason
  const stats=new Set(),perks=new Set(),pstats=new Set();
  for(const id in items) { const it=items[id]; if(it.slot!=='Tool'&&it.slot!=='Outfit'&&it.slot!=='Charm'&&it.slot!=='Sash') continue;
    for(const k in (it.stats||{})) stats.add(k);
    for(const k in (it.perk||{})) { perks.add(k); if(k==='stat') for(const s in it.perk.stat) pstats.add(s); } }
  for(const k of stats) ok(GEAR.flat[k]||GEAR.off.stats[k],'item stat '+k+' is mapped or switched off in B3_GEAR');
  for(const k of perks) ok(k==='stat'||GEAR.off.perks[k],'item perk '+k+' is switched off in B3_GEAR (or is the stat perk)');
  for(const k of pstats) ok(GEAR.pct[k]||GEAR.off.stats[k],'percent perk stat '+k+' is mapped or switched off in B3_GEAR');
  for(const k in GEAR.flat) ok(['hp','atk','def','spd'].includes(GEAR.flat[k].to)&&GEAR.flat[k].per>0,'flat map '+k+' goes to a real battle stat');
  // 2. The sum
  const a=SUM([items.shirt,items.notebook,items.bcap]);
  ok(a.flat.hp===8&&a.flat.def===1&&a.flat.atk===1&&a.flat.spd===0,'Shirt + Notebook give +8 HP, +1 Defense, +1 Attack (Cool and Warmth do nothing): '+JSON.stringify(a.flat));
  ok(Math.abs(a.pct.def-.1)<1e-9,'Bandana Cap gives +10% Defense as a gear mod');
  const z=SUM([items.sunhat,items.pebble,items.fishline,items.beanie]);
  ok(JSON.stringify(z)===JSON.stringify(SUM([])),'Cool, Warmth, crit and immunity perks add nothing');
  ok(JSON.stringify(SUM(null))===JSON.stringify(SUM([null])),'no gear sums to nothing');
  // 3. A fight: bare is unchanged, worn gear raises the stats it should
  const base={party:['tom','grace'],level:2,formation:'mudling',seed:1},bare=NF(base),none=NF(Object.assign({},base,{gear:{}}));
  ok(bare.party.every((u,i)=>u.hp===none.party[i].hp&&u.atk===none.party[i].atk),'a fight with no gear is the bare fight');
  const W=SUM([items.shirt,items.notebook,items.shoes,items.bcap]),dressed=NF(Object.assign({},base,{gear:{tom:W}}));
  const b=bare.party[0],d=dressed.party[0];
  ok(d.maxHp===b.maxHp+8&&d.hp===d.maxHp,'Tom wearing a Shirt has +8 Max HP');
  ok(d.atk===b.atk+1&&d.def===b.def+1,'Notebook +1 Attack, Shirt +1 Defense');
  const G2=G('b3Stat');
  ok(G2(d,'spd')>G2(b,'spd'),'Walking Shoes (+5% Speed perk) make Tom faster');
  ok(G2(d,'def')>b.def+1,'Bandana Cap (+10% Defense) multiplies on top of the flat Defense');
  ok(dressed.party[1].hp===bare.party[1].hp&&dressed.party[1].atk===bare.party[1].atk,'gear given to Tom does not touch Grace');
};
module.exports.typicalGear=typicalGear;
