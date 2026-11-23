'use strict';
// data/b3-foes-ch14.js — Battle 3 enemies: chapter 14, Long Island under the dome (bestiary v11 section 2 "Chapter 14" and section 3 "The Part 1 monsters that come back").
// Numbers are the bestiary's printed numbers, except where a line below says a number was changed from the simulator.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// What is here:
//   1. Boppy's Gold Armor (`warden`), the chapter's boss: a normal fight (Tom, 2026-11-17). The party's hits land on the gold armor, never on Boppy; the foe's name says so and its
//      bar is the armor's. It is the Gold Knight's seven motions under their real names (data/b3-foes-ch13.js), with its own printed stat line (3,160 HP, 8 pips).
//   2. The returning Part 1 monsters (bestiary section 3): every regular enemy and boss of the Long Island chapters of Part 1 (chapters 1, 3, 5, 7, 9 and 10). They keep the
//      id of their Part 1 entry with `_r` added (the engine keys a foe by one id, so the Part 1 row stays as it is), and keep its acts, Pet Peeves, Resists, starting statuses and
//      formation. Only the stat line changes: the same role on the chapter 14 baseline (bestiary section 3 table). A returning boss is sized as a gate (about 4 rounds, 4 pips),
//      not as a chapter boss. The rows are made from the Part 1 rows below, so a change to a Part 1 act reaches its returning twin.
// Look: `art` points at the Part 1 painting (no new paintings), regular monsters are drawn 25% larger (`size`, engine/b3-play.js). A returning boss is already drawn at the boss
// size (2.5 times), so its size is left. The brighter palette is not built (it is art, left for the Art Library).
// Drops: none. The Part 1 drops are keepsakes the family already holds, and no fight here is repeatable (bestiary section 3).
// Where they are fought: bestiary section 3 says the fights are in chapter 14, but the built chapter 14 (data/scenes-ch14.js) holds one fight, the Warden at the Rivituso door,
// and puts no Part 1 monster on a map. So these are data plus Lab fights (NEW 75 to 98) until a scene card places them. Their Vibe Points follow the bestiary's table (5 a pack,
// 10 a boss, 30 for the armor) and add to 90 only when a script places four packs and four bosses; a script that places more or fewer scales the number (bestiary section 5).

// ---------- 1. Boppy's Gold Armor ----------
// Boss, no running, Front, 8 pips. Pet Peeves Sizzle and Racket, resists Clobber. Nobody Rushes Boppy: `boppySpeed` above half HP (the same rule as his Trait; it is also the Gold
// Knight's first tell). Resting My Eyes is its Guard Stance: Pepper Breath leaves the armor Toasty, so a Racket hit sets off Panic Boil! and wakes him out of it, and a Break
// ends it too. Nothing here throws or swings a weapon (the old draft's halberd is gone), every attack takes HP and can hit Grace and Rose, and the girls hit back.
B3_FOES.warden={id:'warden',name:'Boppy’s Gold Armor',ch:14,role:'boss',row:'front',hp:3160,hp3:2370,atk:148,def:67,spd:103,pips:8,
  peeves:['sizzle','racket'],resists:['clobber'],start:[],mechanics:[],drop:null,noRun:true,
  custom:{boppySpeed:{above:.5}},
  acts:[
    {id:'back_behind_the_line',name:'“Back Behind the Line!”',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'back_behind',to:'target'}]},
    {id:'walk_slower',name:'“Walk Slower!”',flavor:['racket'],power:1,recovery:100,hits:'fastest',tags:['projectile'],effects:[{op:'status',id:'slow',n:2,to:'target'},{op:'push',n:20,to:'target'}]},
    {id:'it_was_this_big',name:'“It Was THIS Big!”',flavor:['clobber'],power:1,recovery:100,hits:'two_adjacent',grow:[2,3,'all'],tags:['melee'],effects:[]},
    {id:'pepper_breath',name:'Pepper Breath',flavor:['sizzle'],power:1.1,recovery:120,hits:'all',tags:['aoe','charge_up'],
      effects:[{op:'status',id:'toasty',n:2,to:'target'},{op:'status',id:'toasty',n:2,to:'self'}]},
    {id:'resting_my_eyes',name:'Resting My Eyes',flavor:['support'],power:0,recovery:80,hits:'self',tags:['guard_stance','buff'],effects:[{op:'status',id:'resting_eyes',to:'self'},{op:'status',id:'mend',n:2,to:'self'}]},
    {id:'great_big_gold_hug',name:'Great Big Gold Hug',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[]},
    {id:'cross_country_story',name:'The 1970 Cross-Country Story',flavor:['racket'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},
      effects:[{op:'status',id:'slow',n:2,to:'target'},{op:'status',id:'fatigue',n:2,to:'target'}]}
  ]};
B3_FORMATIONS.warden={id:'warden',ch:14,foes:[{id:'warden',row:'front'}],vp:30};

// ---------- 2. The returning Part 1 monsters ----------
// The chapter 14 baseline by role (bestiary section 3): [HP, Attack, Defense, Speed, pips]. `boss` is the returning boss, a gate and not a chapter boss.
const B3_R14_STATS={swarmer:[491,100,46,120,0],skirmisher:[604,124,49,137,0],hexer:[642,112,52,120,0],bruiser:[868,130,61,108,0],elite:[1359,136,73,103,4],boss:[1810,148,67,116,4]};
// The Part 1 formations that return, by chapter (the Long Island chapters of Part 1). A formation's foes, rows and acts are the Part 1 entry's.
const B3_R14_FORMS={1:['mudling','skeeter','grump','toad','log','bigone'],3:['soggysock','bobber','tangle','snag','irongill'],5:['popquiz','tardybell','glitterglue','dodgeball','redpen'],
  7:['shusher','dogear','cliffhanger','knowitall','popup','unread'],9:['velvetrope','stuffedshirt','coathanger','soreloser','wallflower','mirrorball'],10:['carryon','jetlag','longline','unclaimed','armresthog','lastcall']};
const B3_R14_VP={pack:5,boss:10};   // bestiary section 5: "4 returning packs at 5, 4 returning bosses at 10 each, Boppy's Gold Armor 30"
// A summoned foe inside a returning row calls its returning twin (Old Iron-Gill's Soggy Sock).
function b3R14Fix(x) { if(Array.isArray(x)) return x.map(b3R14Fix); if(x&&typeof x==='object') { const o={}; for(const k in x) o[k]=b3R14Fix(x[k]); if(o.op==='summon'&&B3_FOES[o.id]) o.id=o.id+'_r'; return o; } return x; }
function b3R14Make(id) {
  if(B3_FOES[id+'_r']) return;
  const P=B3_FOES[id],S=B3_R14_STATS[P.role]; if(!S) throw new Error('b3-foes-ch14: no chapter 14 stat line for role '+P.role+' ('+id+')');
  const R=b3R14Fix(JSON.parse(JSON.stringify(P)));
  Object.assign(R,{id:id+'_r',art:P.art||id,ch:14,returning:true,hp:S[0],atk:S[1],def:S[2],spd:S[3],pips:S[4],drop:null});
  delete R.hp3; delete R.hp4;
  if(P.role==='boss') R.hp3=Math.round(S[0]*.75);   // the 1.6 model's three-in-the-party number (every printed boss is .75: 3,160 to 2,370; 2,070 to 1,550; 2,480 to 1,860)
  else R.size=1.25;   // drawn 25% larger (bestiary section 3); a returning boss is already drawn at the boss size
  B3_FOES[id+'_r']=R;
}
for(const ch in B3_R14_FORMS) for(const fid of B3_R14_FORMS[ch]) {
  const F=B3_FORMATIONS[fid]; if(!F) throw new Error('b3-foes-ch14: no Part 1 formation '+fid);
  for(const f of F.foes) b3R14Make(f.id);
  const boss=F.foes.some(f=>B3_FOES[f.id].role==='boss');
  B3_FORMATIONS[fid+'_r']={id:fid+'_r',ch:14,returning:true,foes:F.foes.map(f=>({id:f.id+'_r',row:f.row})),vp:boss?B3_R14_VP.boss:B3_R14_VP.pack};
}
