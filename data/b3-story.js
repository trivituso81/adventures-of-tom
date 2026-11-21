'use strict';
// data/b3-story.js — Battle 3 in the story (stage 15). Numbers and words only; the code is engine/b3-story.js.
// The switch (ADMIN > BATTLE SWITCH, kept on the phone in localStorage 'aot-b3-story') has three settings:
//   OLD         every story fight and map monster uses battle 2.
//   BY CHAPTER  a chapter in `chapters` below uses Battle 3 (the default).
//   NEW         every fight Battle 3 has a formation for uses it (chapters not listed still have battle 2 tips and flags: for tests).
const B3_STORY={
  chapters:[1],
  maxParty:4,
  // A story fight that is not one of the formations: the foes it names. `vp` is what a win pays the Main Vibe (spec section 1).
  fights:{
    mudling3:{foes:[{id:'mudling',row:'front'},{id:'mudling',row:'front'},{id:'mudling',row:'front'}],vp:15}
  },
  // The Character Level every member has at least by the furthest chapter reached (the Lab's levels, bestiary v11). Never lowers a level.
  levelFloor:[0,1,4,7,9,12,14,17,19,22,25],
  // Migration for a save that has not met Battle 3: a pool of this many Vibe Points per chapter finished, two thirds to the first
  // Sig Vibe and one third to the second, with overflow (spec section 1, architecture 4.2).
  vpPerChapter:135, split:[2/3,1/3],
  // One tip per family member's turn, each once, in order, shown in the message line. `who`: a member id, or '*' for anyone.
  // `when(F,u)` is optional (F is the fight, u the unit whose turn it is). `fight`: the story fight the tip belongs to.
  tips:{
    basics:[
      {id:'basic',who:'tom',text:'Tom’s turn. ▲ BASIC is free and gives +2 Pep. Skills (▶) spend Pep, and everyone starts with 4.'},
      {id:'skills',who:'grace',text:'▶ SKILLS cost Pep and hit harder. Tap the i beside a Skill to read what it does before you use it.'},
      {id:'peeve',who:'rose',text:'Tap a Mudling (or press I) to see what it can’t stand. A move of that flavor hits it where it hurts.'},
      {id:'support',who:'deedee',text:'Deedee’s support Skills heal and shield. Spend a little Pep on them before somebody gets low.',when:(F,u)=>F.party.some(p=>p.hp<p.maxHp*.75)},
      {id:'ruckus',who:'*',text:'The RUCKUS bar (◀) fills as the family fights. At 50% two people can team up: a Double Team.',when:(F)=>(F.ruckus||0)>=40}
    ],
    bigone:[
      {id:'pips',who:'*',text:'The Big One has 6 Composure pips. A move of a flavor it hates, Razzle or Racket, breaks one. At zero it is Flustered: it loses its turn’s plan and takes extra damage.'},
      {id:'crown',who:'*',text:'Deedee’s muffin tin is its crown: 15% more Attack and a little healing each turn. A Skill that strips a buff knocks it off.',when:(F)=>b3Live(F,'foe').some(f=>f.id==='bigone')},
      {id:'glare',who:'*',text:'It glared at someone. That person gets bitten on its next turn. Heal or shield them before it lands.',when:(F)=>F.foes.some(f=>f.mark)},
      {id:'ruckusb',who:'*',text:'At 50% RUCKUS (◀) two people can Double Team. At 100% it is a Full Family Ruckus, free Skills for both.',when:(F)=>(F.ruckus||0)>=50}
    ]
  }
};
