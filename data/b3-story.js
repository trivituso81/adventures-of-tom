'use strict';
// data/b3-story.js — Battle 3 in the story (stage 15). Numbers and words only; the code is engine/b3-story.js.
// The switch (ADMIN > BATTLE SWITCH, kept on the phone in localStorage 'aot-b3-story') has three settings:
//   OLD         every story fight and map monster uses battle 2.
//   BY CHAPTER  a chapter in `chapters` below uses Battle 3 (the default).
//   NEW         every fight Battle 3 has a formation for uses it (chapters not listed still have battle 2 tips and flags: for tests).
const B3_STORY={
  chapters:[1,2,3],
  maxParty:4,
  // A story fight that is not one of the formations: the foes it names. `vp` is what a win pays the Main Vibe (spec section 1).
  fights:{
    mudling3:{foes:[{id:'mudling',row:'front'},{id:'mudling',row:'front'},{id:'mudling',row:'front'}],vp:15},
    // Chapter 2 (stage 17a): the story's first fight there is two Smoglets, the `smoglet` formation, at the bestiary's 10 VP.
    smoglet2:{foes:[{id:'smoglet',row:'front'},{id:'smoglet',row:'front'}],vp:10}
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
    ],
    // ---- Chapter 2 (stage 17a): Tom, TNB and Nara in Los Angeles. A fight's tips are keyed by the `tut` name its scene step uses. ----
    ch2lawn:[
      {id:'peeve',who:'tnb',text:'TNB’s turn. Smoglets can’t stand Razzle or Drench. Tap one (or press I) to check, then use a Skill of that flavor.'},
      {id:'crew',who:'nara',text:'Nara’s turn. Tap her (or press I) to read her Trait and Quirks. Her Skills spend Pep like everyone’s.'},
      {id:'haze',who:'*',text:'A Smoglet is winding up Brown Haze (!! on its card). It hits everyone and can blind one of you. Shield someone or interrupt it first.',when:(F)=>F.foes.some(f=>f.charge)}
    ],
    ch2flurry:[
      {id:'back',who:'*',text:'The Ticket Flurry stands in the Back row, where single-target Clobber does 20% less. Its Paper Swirl dodges 20% of attacks, and a Skill that strips a buff takes it off.'},
      {id:'fee',who:'*',text:'Late Fee takes 1 Pep and slows whoever it hits. Out of Pep? A free Basic gives you 2 back.',when:(F)=>F.party.some(p=>p.pep<=1)}
    ],
    ch2coyote:[
      {id:'howl',who:'*',text:'Pack Howl gives the monsters 15% more Attack. A Skill that strips or steals a buff takes it off. The coyote can’t stand Racket.'},
      {id:'bleed',who:'*',text:'Bleed ticks a little damage every turn. A heal or a cleanse stops it.',when:(F)=>F.party.some(p=>p.st&&p.st.bleed)}
    ],
    bigshake:[
      {id:'pips',who:'*',text:'The Big Shake has 6 Composure pips and hates Drench and Razzle. Each hit of those flavors takes a pip, and at zero it is Flustered and loses its plan.'},
      {id:'quake',who:'*',text:'It’s winding up a ground sweep that hits everyone. A shield on each person soaks it, or break its pips to cancel it.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='bigshake')},
      {id:'guard',who:'*',text:'Below half HP it braces in Faultline Guard: 25% less damage and a small heal each turn. A Break ends the stance, and a Skill that strips buffs ends the heal.',when:(F)=>F.foes.some(f=>f.st&&f.st.faultline_guard)}
    ],
    // ---- Chapter 3 (stage 17b): Tom, Grace, Rose and Boppy at the marsh and the pier. ----
    ch3sock:[
      {id:'peeve',who:'boppy',text:'Boppy’s turn. Tap a Sock (or press I): it can’t stand Sizzle or Razzle, and it shrugs off Drench, so a Drench Skill would be wasted.'},
      {id:'squelch',who:'*',text:'A Sock is winding up Squelch (!! on its card), a slow bite on one of you. Heal or shield that person, or interrupt it.',when:(F)=>F.foes.some(f=>f.charge)}
    ],
    ch3tangle:[
      {id:'peeves',who:'*',text:'Two kinds of monster, two sets of Pet Peeves. Tap each one: the Tangle can’t stand Sizzle or Racket, the Bobber can’t stand Drench or Clobber.'},
      {id:'knot',who:'*',text:'The Tangle is winding up Big Knot: Slow and Fatigue on one person. It has no Composure pips to break, so interrupt it or shield that person.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='tangle')},
      {id:'bob',who:'*',text:'The Bobber’s Choppy Bob dodges 20% of attacks. A Skill that strips a buff takes it off.',when:(F)=>F.foes.some(f=>f.st&&f.st.choppy_bob)}
    ],
    ch3snag:[
      {id:'elite',who:'*',text:'The Snag is an Elite: 4 Composure pips, and it can’t stand Sizzle. Each Sizzle hit takes a pip, and at zero it is Flustered. It shrugs off Drench.'},
      {id:'timber',who:'*',text:'Sunken Timber takes 25% off every hit. A Break ends it, so aim your Sizzle hits at the pips first.',when:(F)=>F.foes.some(f=>f.st&&f.st.sunken_timber)},
      {id:'tow',who:'*',text:'The Snag is charging Undertow (!!): it drenches one person and pushes them back on the turn bar. A Break or an interrupt cancels it, or shield that person.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='snag')}
    ],
    irongill:[
      {id:'pips',who:'*',text:'Old Iron-Gill has 6 Composure pips and can’t stand Clobber or Razzle. It dives every third turn, so save a Break for the dive.'},
      {id:'dive',who:'*',text:'It dived to the Back row behind a Soggy Sock and is charging Deep Dive on everyone. A Break or an interrupt cancels it, or knock out the Sock to pull Iron-Gill back to the Front.',when:(F)=>F.foes.some(f=>f.id==='irongill'&&f.row==='back')},
      {id:'belch',who:'*',text:'Pepper Belch is charging (!!). It scorches everyone, so shield the family first and heal right after.',when:(F)=>F.foes.some(f=>f.charge&&/Belch/.test(f.charge.name))},
      {id:'steam',who:'*',text:'The belch left Iron-Gill Toasty. A Drench hit sets that off as a Steam Cloud!',when:(F)=>F.foes.some(f=>f.id==='irongill'&&f.st&&f.st.toasty)}
    ]
  }
};
