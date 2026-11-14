// Amber spots left behind (amberspot1, Tom 2026-11-14 08:38): every orange block the family finds and leaves where it was is SOLID
// (nobody walks over it) and can be pressed with A. Pressing it replays what the family said about it when they found it, word for
// word, so the recorded clips, mood poses and talking poses play as they did (no new lines, no new clips). Only people who are with
// Tom speak; Tom's line is always there.
// Each spot: map id; show() = the block is drawn there (same rule as its draw function in engine/plate.js); found = the flag set when
// the family first saw it (no A before that; the scene's own trigger plays instead); solid = tiles nobody may stand on; press = extra
// tiles that answer A without being made solid (already solid tiles, like water under the floating fish); lines = [speaker id, text].
const AMBER_SPOTS=[
  // Chapter 1, Boppy's fishing spot (engine/plate.js HOLLOW_SPOT, SCENES.ch1Spot): the plum-sized block on the grey patch, tile (17,10).
  {id:'ch1',map:'hollow',name:'Orange block',show:()=>true,found:'ch1-spot',solid:[[17,10]],
    lines:[['grace','That\'s a dragonfly. It\'s inside an orange rock. Its wings are open and it\'s not moving.'],
      ['deedee','Look at the grass. It\'s grey. Just this bit, the size of my hand.'],
      ['tom','It isn\'t dried out. It\'s just grey. Like somebody took the green out.'],
      ['rose','I\'m keeping it. It\'s stuck.']]},
  // Chapter 2, the grey lemon tree on the Griffith trail (GRIFFITH_SPOT, SCENES.ch2Lemon): the trunk (row 7) and the dirt circle (row 8).
  {id:'ch2',map:'griffith',name:'Orange block',show:()=>STORY.chapter>=2&&!flag('ch6-clear'),found:'ch2-lemon',solid:[[3,7],[4,7],[3,8],[4,8]],
    lines:[['tnb','Babe, look at that tree. It\'s grey. The leaves, the trunk, even the dirt. It looks like an old black and white movie.'],
      ['tom','There\'s one lemon on it. And the lemon is inside a block of something orange.'],
      ['tnb','It\'s not glass, and it\'s not glaze. I work with this kind of stuff all day and I have no idea what it is.']]},
  // Chapter 3, Sundial Hollow (SUNDIAL_SPOT, SCENES.ch3Hollow): the fish hangs over the water, which is already solid; A from the bank.
  {id:'ch3',map:'sundial',name:'Orange block',show:()=>STORY.chapter>=3&&!flag('ch6-clear'),found:'ch3-hollow',solid:[],press:[[9,9],[10,9],[11,9]],
    lines:[['grace','It\'s inside an orange block, like the dragonfly. It\'s just hanging there. Nothing is holding it up!'],
      ['boppy','That fish jumped, and he never came down. Seventy-some years I\'ve been fishing, and I never saw a fish stay up.'],
      ['tom','It can\'t be moved. I tried one at the pond and one in California.']]},
  // Chapter 4, Soundstage 7 (STAGE7_*, SCENES.ch4Hat): TNB's wardrobe table (row 10) and the floor under the hanging block (row 9).
  {id:'ch4',map:'stage7',name:'Orange block',show:()=>STORY.chapter>=4&&flag('ch4-rig')&&!flag('ch6-clear'),found:'ch4-hat',solid:[[8,9],[9,9],[10,9],[8,10],[9,10],[10,10]],
    lines:[['tnb','Babe. That\'s the hero hat. The cowboy wears it in every scene of the movie. And it\'s inside a big orange block!'],
      ['tom','It\'s just like the dragonfly, the lemon and the fish. And every one is bigger than the last.'],
      ['tnb','Well, hats off to whoever did this. No, really. I can\'t get the hat off.']]}
];
const AMBER_SPOT_SPEAKER={tom:'Tom',tnb:'TNB',grace:'Grace',rose:'Rose',deedee:'Deedee',boppy:'Boppy',amy:'Amy'};
// What each tile held before a spot took it over, per map, so a spot that goes away (chapter 6 clear) gives the tile back exactly.
const amberSpotSaved=new Map();
function amberSpotWith(id) {
  if(id==='tom') return true;
  return typeof party!=='undefined'&&(party.some(m=>m===id||(m&&m.id===id))||(typeof followers!=='undefined'&&followers.some(f=>f.member&&f.member.id===id&&!f.hidden)));
}
function amberSpotSync() {
  if(typeof currentMap==='undefined'||!currentMap||!currentMap.solid||typeof flag!=='function'||typeof STORY==='undefined') return;
  const M=currentMap;
  for(const sp of AMBER_SPOTS) {
    if(sp.map!==M.id) continue;
    let on=false; try { on=!!sp.show(); } catch(e) { on=false; }
    for(const [x,y] of sp.solid.concat(sp.press||[])) {
      const k=key(x,y),i=y*M.w+x,sk=M.id+':'+k,isSolid=sp.solid.some(t=>t[0]===x&&t[1]===y);
      if(on) {
        if(!amberSpotSaved.has(sk)) amberSpotSaved.set(sk,{solid:M.solid[i],obj:M.objectAt.get(k)});
        if(isSolid) M.solid[i]=1;
        const have=M.objectAt.get(k);
        if(!have||!have.amberSpot) { const ts=sp.solid.length?sp.solid:[[x,y]],xs=ts.map(t=>t[0]),ys=ts.map(t=>t[1]),x0=Math.min(...xs),y0=Math.min(...ys);   // the block's box (the A bubble sits over it)
          M.objectAt.set(k,{kind:'amberspot',x:x0,y:y0,w:Math.max(...xs)-x0+1,h:Math.max(...ys)-y0+1,name:sp.name,text:sp.lines[0][1],amberSpot:sp,baked:true}); }
      } else if(amberSpotSaved.has(sk)) {
        const sv=amberSpotSaved.get(sk); amberSpotSaved.delete(sk);
        M.solid[i]=sv.solid; if(sv.obj) M.objectAt.set(k,sv.obj); else M.objectAt.delete(k);
      }
    }
  }
}
// Press A facing a spot: replay the found lines of whoever is here. Before the family has found it, A does nothing special.
function amberSpotPress(sp) {
  if(!flag(sp.found)) return false;
  const steps=sp.lines.filter(([id])=>amberSpotWith(id)).map(([id,text])=>({talk:AMBER_SPOT_SPEAKER[id]||id,lines:[text]}));
  if(!steps.length) return false;
  playScene(steps);
  return true;
}
const LE_update_amberspot=update;
update=function(dt) { amberSpotSync(); return LE_update_amberspot.apply(this,arguments); };
const LE_pressAction_amberspot=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move) {
    amberSpotSync();
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object'&&v&&v.amberSpot&&amberSpotPress(v.amberSpot)) return;
  }
  return LE_pressAction_amberspot.apply(this,arguments);
};
