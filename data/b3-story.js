'use strict';
// data/b3-story.js — Battle 3 in the story (stage 15). Numbers and words only; the code is engine/b3-story.js.
// The switch (ADMIN > BATTLE SWITCH, kept on the phone in localStorage 'aot-b3-story') has three settings:
//   OLD         every story fight and map monster uses battle 2.
//   BY CHAPTER  a chapter in `chapters` below uses Battle 3 (the default).
//   NEW         every fight Battle 3 has a formation for uses it (chapters not listed still have battle 2 tips and flags: for tests).
const B3_STORY={
  chapters:[1,2,3,4,5,6,7],
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
    ],
    // ---- Chapter 4 (stage 17c): Tom, TNB and Nara on the backlot. ----
    ch4crab:[
      {id:'shell',who:'*',text:'The Cue Card Crab is an Elite: 4 Composure pips, and it can’t stand Drench or Racket. It shrugs off Clobber. Its Posterboard Shell takes 25% off every hit until a Break.'},
      {id:'cards',who:'*',text:'The crab is charging Card Toss (!!): it hits everyone and leaves them Bleeding. Shield the family, or break its pips to cancel it.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='cuecrab')},
      {id:'bleed',who:'*',text:'Bleed ticks a little damage every turn. A heal or a cleanse stops it.',when:(F)=>F.party.some(p=>p.st&&p.st.bleed)}
    ],
    ch4clapper:[
      {id:'peeve',who:'*',text:'The Clapper Snapper can’t stand Sizzle or Razzle. The Extra Extra beside it can’t stand Racket or Razzle, so Razzle hits both.'},
      {id:'scene',who:'*',text:'Scene One, Marker! pulls another monster forward on the turn bar, so it acts sooner. Keep an eye on the bar.',when:(F)=>F.round>=2}
    ],
    ch4moth:[
      {id:'moth',who:'*',text:'The Boom Mic Moth hovers in the Back row and dodges 20% of attacks. It can’t stand Drench or Clobber, and it shrugs off Racket.'},
      {id:'lock',who:'*',text:'Mic Feedback puts Skill Lock on someone: for a turn their Pocket Vibe Skills are off. Their Basic and Main Vibe Skills still work.',when:(F)=>F.party.some(p=>p.st&&p.st.skill_lock)}
    ],
    directorscut:[
      {id:'pips',who:'*',text:'The Director’s Cut has 6 Composure pips and can’t stand Razzle or Sizzle. It shrugs off Racket.'},
      {id:'cut',who:'*',text:'CUT! is charging (!!): a stun and a hard push on one person. Tom’s Suite Door Slide takes it, a Break or an interrupt cancels it, and Blind makes it miss.',when:(F)=>F.foes.some(f=>f.charge&&/CUT/.test(f.charge.name))},
      {id:'action',who:'*',text:'ACTION! called Extra Extras and sped everything up 15%. Knock out the Extras, or strip the speed buff.',when:(F)=>F.foes.some(f=>f.st&&f.st.action_speed)}
    ],
    // ---- Chapter 5 (stage 17): Tom, Grace, Rose and Amy at the school. ----
    ch5bell:[
      {id:'bell',who:'*',text:'The Tardy Bell stands in the Back row and can’t stand Drench or Racket. It shrugs off Clobber. You’re Late! slows one person and pushes them back on the turn bar.'},
      {id:'ring',who:'*',text:'First-Bell Ring is charging (!!): it tires everyone, so they wait longer after each move. Shield the family, or interrupt it.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='tardybell')}
    ],
    ch5glue:[
      {id:'glue',who:'*',text:'The Glitter Glue stands in the Back row and can’t stand Drench or Clobber. It shrugs off Razzle, so reach for Drench or Clobber instead.'},
      {id:'burst',who:'*',text:'Glitter Burst is charging (!!): it hits everyone and blinds one person. A Break can’t cancel it (no pips), so interrupt it or shield the family.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='glitterglue')}
    ],
    ch5dodge:[
      {id:'elite',who:'*',text:'Dodgeball Dread is an Elite: 4 Composure pips, and it can’t stand Racket or Drench. It shrugs off Clobber. Its Gym Bounce dodges 20% of attacks, and a Skill that strips a buff takes it off.'},
      {id:'sweep',who:'*',text:'Gym-Wall Ricochet is charging (!!) and hits the whole family, so shield everyone or break its pips to cancel it.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='dodgeball')}
    ],
    redpen:[
      {id:'pips',who:'*',text:'The Red Pen has 6 Composure pips and can’t stand Drench or Razzle. It shrugs off Clobber.'},
      {id:'seeme',who:'*',text:'SEE ME is charging (!!): whoever it circles can only use single-target attacks on the pen, and a hard hit is coming. Tom’s Suite Door Slide takes it, or break its pips.',when:(F)=>F.foes.some(f=>f.charge&&/SEE ME/.test(f.charge.name))},
      {id:'grading',who:'*',text:'Strict Grading: 30% less damage taken, and every hit on it is answered with Points Off. A Mix (two different people, two different flavors, in one round) or a Break ends it.',when:(F)=>F.foes.some(f=>f.st&&f.st.strict_grading)},
      {id:'final',who:'*',text:'Final Grade is charging (!!) and hits everyone. Shield the family or break its pips to cancel it.',when:(F)=>F.foes.some(f=>f.charge&&/Final Grade/.test(f.charge.name))}
    ],
    // ---- Chapter 6 (stage 18): Tom, TNB and Nara in Old Oak Park. ----
    ch6gallery:[
      {id:'gallery',who:'*',text:'The Peanut Gallery stands in the Back row and can’t stand Racket or Sizzle. It shrugs off Clobber. The Acorn Agent in front can’t stand Racket or Drench.'},
      {id:'boo',who:'*',text:'Standing Boo-vation is charging (!!): it tires the whole family, so everyone waits longer after each move. Shield them, or knock the Gallery out first.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='peanutgallery')}
    ],
    ch6spy:[
      {id:'spy',who:'*',text:'The Twig Spy hides in the Back row behind Leaf Camo, so it is harder to hit. It can’t stand Sizzle or Razzle and shrugs off Racket.'},
      {id:'mark',who:'*',text:'Stakeout Mark makes the marked person easier to crit for 2 turns. Shield them, or take the Spy out first.',when:(F)=>F.party.some(p=>p.st&&p.st.stakeout_mark)}
    ],
    ch6stuffer:[
      {id:'elite',who:'*',text:'Cheek Stuffer is an Elite: 4 Composure pips, and it can’t stand Drench or Racket. It shrugs off Clobber, so reach for Drench or Racket to break its pips.'},
      {id:'snatch',who:'*',text:'Snack Snatch is charging (!!): it takes a Pep from one person and stuffs its cheeks for +20% Defense. Interrupt it, or break its pips before it lands.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='cheekstuffer')}
    ],
    chairman:[
      {id:'boss',who:'*',text:'Chairman Cheeks can’t stand Drench or Sizzle and shrugs off Racket. His Executive Monocle gives him more Crit and Atk for 3 turns, so strip it or steal it if you can.'},
      {id:'cache',who:'*',text:'He calls an Acorn Cache into the Back row. Knock it out before he eats it on his second turn: it gives everyone a Pep and takes a bite out of him. Left alone, it makes him hit harder.',when:(F)=>F.foes.some(f=>f.id==='acorncache')},
      {id:'slam',who:'*',text:'Cheek Slam is charging (!!): it hits one person hard. Shield them, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='chairman'&&/Slam/.test(f.charge.name||''))}
    ],
    // ---- Chapter 7 (stage 18): Tom, Grace, Rose and Boppy in the Library. ----
    ch7cliff:[
      {id:'cliff',who:'*',text:'The Cliffhanger stands in front and can’t stand Sizzle or Racket. It shrugs off Clobber. The Shusher in the Back row can’t stand Razzle or Sizzle.'},
      {id:'tbc',who:'*',text:'To Be Continued... is charging (!!): it hits everyone and slows them. Shield the family, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='cliffhanger')},
      {id:'shhh',who:'*',text:'SHHH! locked a Skill: that person can only use basic moves for 2 turns. Knock out the Shusher in the Back row to stop more of them.',when:(F)=>F.party.some(p=>p.st&&p.st.skill_lock)}
    ],
    ch7know:[
      {id:'ears',who:'*',text:'The Dog-Ear can’t stand Drench or Sizzle and shrugs off Racket. The Know-It-All in the Back row can’t stand Racket or Razzle and shrugs off Sizzle.'},
      {id:'tech',who:'*',text:'Well, Technically is charging (!!): it tires the whole family and gives the Know-It-All +20% Defense. Interrupt it, or shield everyone.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='knowitall')},
      {id:'actually',who:'*',text:'Actually... cuts a person’s Defense by 20% for 2 turns. Shield them, or knock out the Know-It-All to stop more.',when:(F)=>F.party.some(p=>p.st&&p.st.actually)}
    ],
    ch7pop:[
      {id:'elite',who:'*',text:'Pop-Up Panic is an Elite: 4 Composure pips, and it can’t stand Clobber or Razzle. It shrugs off Racket. It starts coiled, so early hits miss more often.'},
      {id:'reveal',who:'*',text:'Big Reveal is charging (!!) and hits everyone. Break its pips to stop it, or shield the family.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='popup')}
    ],
    unread:[
      {id:'pips',who:'*',text:'The Unread has 7 Composure pips and can’t stand Racket or Sizzle. It shrugs off Clobber, so Racket and Sizzle break it fastest.'},
      {id:'page',who:'*',text:'Turn Back the Page is charging (!!): it throws one person far back on the turn bar. Shield them, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&/Turn Back/.test(f.charge.name||''))},
      {id:'ribbon',who:'*',text:'Bookmark Ribbon: it takes 25% less damage and heals a little for 2 turns. Strip the guard, or save your big hits for after it fades.',when:(F)=>F.foes.some(f=>f.st&&f.st.bookmark_guard)},
      {id:'end',who:'*',text:'THE END is charging (!!): it hits everyone, slows them, and pushes back anyone without a shield. Shield the whole family.',when:(F)=>F.foes.some(f=>f.charge&&/THE END/.test(f.charge.name||''))}
    ]
  }
};
