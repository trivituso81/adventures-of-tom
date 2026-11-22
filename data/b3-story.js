'use strict';
// data/b3-story.js — Battle 3 in the story (stage 15). Numbers and words only; the code is engine/b3-story.js.
// The switch (ADMIN > BATTLE SWITCH, kept on the phone in localStorage 'aot-b3-story') has three settings:
//   OLD         every story fight and map monster uses battle 2.
//   BY CHAPTER  a chapter in `chapters` below uses Battle 3 (the default).
//   NEW         every fight Battle 3 has a formation for uses it (chapters not listed still have battle 2 tips and flags: for tests).
const B3_STORY={
  chapters:[1,2,3,4,5,6,7,8,9,10,11,12,21],
  maxParty:4,
  // A story fight that is not one of the formations: the foes it names. `vp` is what a win pays the Main Vibe (spec section 1).
  fights:{
    mudling3:{foes:[{id:'mudling',row:'front'},{id:'mudling',row:'front'},{id:'mudling',row:'front'}],vp:15},
    // Chapter 2 (stage 17a): the story's first fight there is two Smoglets, the `smoglet` formation, at the bestiary's 10 VP.
    smoglet2:{foes:[{id:'smoglet',row:'front'},{id:'smoglet',row:'front'}],vp:10}
  },
  // The Character Level every member has at least by the furthest chapter reached (the Lab's levels, bestiary v11). Never lowers a level.
  levelFloor:[0,1,4,7,9,12,14,17,19,22,25,27,30],
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
      {id:'ruckusb',who:'*',text:'At 50% on the Combos gauge, two people can Double Team. At 100% it’s a Family Ruckus: free Skills for both.',when:(F)=>(F.ruckus||0)>=50}
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
    ],
    // ---- Chapter 8 (stage 18): Tom, TNB and Nara at the Car Barn. ----
    ch8blanket:[
      {id:'blanket',who:'*',text:'The Wet Blanket can’t stand Sizzle or Clobber and shrugs off Drench. The Lukewarm beside it can’t stand Sizzle or Razzle and shrugs off Drench too, so skip Drench here.'},
      {id:'dampen',who:'*',text:'Dampen Spirits is charging (!!): it tires and drenches everyone. Shield the family, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='wetblanket')},
      {id:'bother',who:'*',text:'Why Bother? cuts a person’s Attack by 20% for 2 turns. Shield them, or knock out the Wet Blanket to stop more.',when:(F)=>F.party.some(p=>p.st&&p.st.why_bother)}
    ],
    ch8draft:[
      {id:'draft',who:'*',text:'The Draft hides in the Back row behind Crosswind, so it is harder to hit. It can’t stand Sizzle or Razzle and shrugs off Racket. The Leftover in front can’t stand Sizzle or Clobber.'},
      {id:'gust',who:'*',text:'Pilot-Light Gust strips a shield or a buff off one person. Knock out the Draft before you spend turns setting up shields.'}
    ],
    ch8picky:[
      {id:'elite',who:'*',text:'The Picky Eater is an Elite: 4 Composure pips, and it can’t stand Racket or Drench. It shrugs off Clobber. Its Tin Lid takes 25% off every hit while it is up.'},
      {id:'push',who:'*',text:'Push It Away is charging (!!): it takes a Pep, tires one person and shoves them back on the turn bar. Interrupt it, or shield them.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='pickyeater')}
    ],
    ironbelly:[
      {id:'peeve',who:'*',text:'Old Ironbelly has 7 Composure pips and can’t stand Drench. It shrugs off Sizzle, so a Drench Skill hurts it most and Sizzle is wasted.'},
      {id:'steam',who:'*',text:'BROIL and Full Furnace leave Old Ironbelly Toasty too. Hit it with Drench while it burns to set off Steam Cloud!, which breaks 2 Composure pips at once.',when:(F)=>F.foes.some(f=>f.id==='ironbelly'&&f.st&&f.st.toasty)},
      {id:'broil',who:'*',text:'BROIL is charging (!!): it hits everyone and sets them Toasty. Shield the family, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&/BROIL/.test(f.charge.name||''))},
      {id:'furnace',who:'*',text:'Full Furnace is charging (!!): it hits everyone, sets them Toasty and adds 20% Attack for 2 turns. Shield the family, and save a Drench for after.',when:(F)=>F.foes.some(f=>f.charge&&/Furnace/.test(f.charge.name||''))}
    ],
    // ---- Chapter 9 (stage 18): Tom, Grace, Rose and Deedee at the Moon Club. ----
    ch9coat:[
      {id:'coat',who:'*',text:'The Hanger-On can’t stand Clobber or Drench and shrugs off Sizzle. The Velvet Rope beside it can’t stand Clobber or Racket. Clobber hits both where it hurts.'},
      {id:'hang',who:'*',text:'Hang On Tight is charging (!!): it hits everyone and slows them. Shield the family, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='coathanger')}
    ],
    ch9cards:[
      {id:'cards',who:'*',text:'The Stuffed Shirt can’t stand Racket or Drench and shrugs off Razzle. The Sore Loser in the Back row can’t stand Sizzle or Razzle and shrugs off Racket.'},
      {id:'gauche',who:'*',text:'How Gauche! is charging (!!) and hits everyone. Shield the family, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='stuffedshirt')},
      {id:'cheater',who:'*',text:'Cheater! makes a person the only target their foes can pick for a turn. Shield them, or heal them before the next hit.',when:(F)=>F.party.some(p=>p.st&&p.st.cheater)}
    ],
    ch9ball:[
      {id:'elite',who:'*',text:'The Wallflower is an Elite: 4 Composure pips, and it can’t stand Razzle or Sizzle. It shrugs off Clobber. It starts hugging the wall, so early hits miss more often.'},
      {id:'petal',who:'*',text:'Petal Storm is charging (!!): it hits everyone and leaves them Dazzled, so crits land harder on them. Break its pips to stop it, or shield the family.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='wallflower')}
    ],
    mirrorball:[
      {id:'peeve',who:'*',text:'The Mirrorball has 7 Composure pips and can’t stand Racket or Clobber. It shrugs off Razzle. Its Facet Spin makes it harder to hit for 2 turns.'},
      {id:'dazzled',who:'*',text:'Facet Dazzle and Spotlight Solo leave her Dazzled. Hit her with Clobber then to set off Shatter Glitz!, or Racket for Sensory Overload!',when:(F)=>F.foes.some(f=>f.id==='mirrorball'&&f.st&&f.st.dazzled)},
      {id:'solo',who:'*',text:'Spotlight Solo is charging (!!): it hits one person hard. Shield them, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&/Spotlight/.test(f.charge.name||''))},
      {id:'dance',who:'*',text:'LAST DANCE is charging (!!): it hits the whole family. Shield everyone, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&/LAST DANCE/.test(f.charge.name||''))}
    ],
    // ---- Chapter 10 (stage 18): Tom, Grace, Rose and Amy at the airport. ----
    ch10sec:[
      {id:'line',who:'*',text:'The Long Line can’t stand Clobber or Razzle and shrugs off Racket. The Jet Lag in the Back row can’t stand Clobber or Sizzle and shrugs off Racket too, so skip Racket.'},
      {id:'screen',who:'*',text:'Random Screening is charging (!!): it hits everyone and slows them. Shield the family, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='longline')}
    ],
    ch10bag:[
      {id:'bag',who:'*',text:'The Unclaimed can’t stand Drench or Sizzle and shrugs off Clobber. The Carry-On beside it can’t stand Razzle or Drench. Drench hits both where it hurts.'},
      {id:'excess',who:'*',text:'Excess Baggage is charging (!!): it takes a Pep and tires one person. Interrupt it, or shield them.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='unclaimed')}
    ],
    ch10lounge:[
      {id:'elite',who:'*',text:'The Armrest Hog is an Elite: 4 Composure pips, and it can’t stand Racket or Razzle. It shrugs off Sizzle. Both Armrests Claimed takes 25% off every hit while it lasts.'},
      {id:'recline',who:'*',text:'Full Recline is charging (!!): it hits everyone and tires them. Break its pips to stop it, or shield the family.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='armresthog')}
    ],
    lastcall:[
      {id:'peeve',who:'*',text:'The Last Call has 7 Composure pips and can’t stand Drench or Sizzle. It shrugs off Racket, so Drench and Sizzle break it fastest.'},
      {id:'gate',who:'*',text:'Boarding Group Nine marks one of you. Next turn GATE CLOSED slams the marked person and locks their Skills for 2 turns. Shield them, or interrupt it.',when:(F)=>F.foes.some(f=>f.charge&&/Boarding|GATE/.test(f.charge.name||''))},
      {id:'final',who:'*',text:'FINAL BOARDING is charging (!!) below half HP: it hits everyone and tires them. Shield the family, or interrupt it before it lands.',when:(F)=>F.foes.some(f=>f.charge&&/FINAL/.test(f.charge.name||''))}
    ],
    // ---- Chapter 11 (stage 22a): Tom, Grace, Rose and Amy in the Endless Concourse (TNB and Nara wait on the gold benches). Keys are the `tut` names in data/scenes-p2.js. ----
    ch11a:[
      {id:'elite',who:'*',text:'The Standby Sprite is an Elite: 4 Composure pips, and it can’t stand Drench or Clobber. Behind its podium it takes 25% less damage until a Break or Panic Boil! ends that.'},
      {id:'bump',who:'*',text:'Waitlist Bump is charging (!!): it shoves one of you back down the turn bar and tires them. Break its pips to stop it, or shield that person.',when:(F)=>F.foes.some(f=>f.charge&&f.id==='standbysprite')},
      {id:'seat',who:'*',text:'Seat Seventeen slows whoever it hits by 15%. Slow people act later, so a Pep-free Basic from the fastest of you keeps the turn bar moving.',when:(F)=>F.party.some(p=>p.st&&p.st.seat_seventeen)}
    ],
    // ---- Chapter 12 (stage 22b): Tom, Grace, Rose and Amy on Jefferson Boulevard. The key is the `tut` name in data/scenes-ch12.js. ----
    ch12:[
      {id:'peeve',who:'*',text:'Gridlock Prime has 7 Composure pips and can’t stand Drench or Racket. Both break it fastest, and a Racket hit also ends its Guard Stance with Panic Boil!.'},
      {id:'light',who:'*',text:'Four-Way Red Light: 30% less damage plus more Defense and Attack for 2 turns, and a Gridlock joins the Front. Panic Boil!, a Break or a Skill that strips buffs ends it.',when:(F)=>F.foes.some(f=>f.id==='gridlockprime'&&f.st&&f.st.four_way_red_light)},
      {id:'heat',who:'*',text:'Exhaust Heatwave leaves Gridlock Prime Toasty too. A Drench hit sets that off as Steam Cloud!, which costs it 3 pips.',when:(F)=>F.foes.some(f=>f.id==='gridlockprime'&&f.st&&f.st.toasty)},
      {id:'total',who:'*',text:'Total Gridlock is charging (!!) below half HP: it hits everyone. Break its pips or shield the family before it lands.',when:(F)=>F.foes.some(f=>f.charge&&/Total/.test(f.charge.name||''))}
    ],
    finalcall:[
      {id:'peeve',who:'*',text:'FINAL CALL has 7 Composure pips and can’t stand Razzle or Racket. It shrugs off Clobber, so Razzle and Racket break it fastest.'},
      {id:'gate',who:'*',text:'Gate Change trades one Front and one Back person and pushes both down the bar. It leaves FINAL CALL Dazzled, so a Razzle or Sizzle hit sets off a Detonation on it.',when:(F)=>F.foes.some(f=>f.st&&f.st.dazzled)},
      {id:'stampede',who:'*',text:'Rebooking Stampede is charging (!!): Lost Luggage joins the Front and every monster gets 20% more Speed. A Skill that strips buffs ends the speed-up. Then a floor sweep hits everyone.',when:(F)=>F.foes.some(f=>f.charge&&/Stampede|Avalanche/.test(f.charge.name||''))},
      {id:'final',who:'*',text:'ALL FLIGHTS CANCELLED is charging (!!) below half HP: it hits everyone, takes a Pep from each and tires them. Break its pips or shield the family before it lands.',when:(F)=>F.foes.some(f=>f.charge&&/CANCELLED/.test(f.charge.name||''))}
    ]
  }
};

// ---- Stage 18 bonus (b3s18bonusa): the bonus chapter, Nine Scoops (chapter 21, data/bonus-nine-scoops.js) ----
// `setup` is what a scripted story fight carries on top of its formation, keyed by the scene step's `tut`. The rules read foeHp, start,
// midpoint and adds (engine/b3-script.js explains each); the story layer (engine/b3-story.js) reads `vp`, the Main Vibe's pay for a win,
// and puts Grace's Birthday Sash on her at the start of every fight she wears it in (`start` is filled in there from her equipment).
// Vibe Points for the chapter (bestiary section 5: a chapter pays 90, so a script with fewer normal fights scales their number): the four
// normal fights pay 15 each and Brain Freeze's win pays 30 (4 x 15 + 30 = 90). The first two runs at Brain Freeze end in `flee` and `shell`,
// not wins, so they pay nothing.
B3_STORY.setup={
  nsGremlin:{vp:15}, nsSlug:{vp:15}, nsCone:{vp:15}, nsGarden:{vp:15},
  // Run 1 at the pond: at half HP the lid slams, Rose freezes mid boo, a Deep Freeze hits everyone, and the family runs (result 'flee').
  nsBoss1:{midpoint:{foe:'brainfreeze',at:.5,hold:.45,result:'flee',word:'RUN!',line:'Brain Freeze wins this one. The family runs for it.',steps:[
    {say:'Brain Freeze slams its lid shut. ICE SHELL! Nothing gets through. Not even a Double Team.',word:'ICE SHELL',color:'#aee6ff',sfx:'thud'},
    {say:'BRAIN FREEZE! Rose freezes solid. Mid boo.',word:'FROZEN',color:'#aee6ff',sfx:'stun',status:{id:'frozen',to:'rose',n:9}},
    {say:'DEEP FREEZE! The cold hits everyone at once.',sfx:'thud',hurt:{to:'party',pct:.35,leave:1,flavor:'drench'}},
    {say:'Nothing works. Not Double Teams. Not hugs. Not raspberries.'},
    {say:'Tom: Grace. Grab Rose. We’re LEAVING.',sfx:'run'}]}},
  // Run 2: the lid slams at half HP again, but Rose is spicy now and stays thawed; the fight ends (result 'shell') and the pond scene takes over.
  nsBoss1b:{midpoint:{foe:'brainfreeze',at:.5,hold:.45,result:'shell',word:'ICE SHELL',line:'The ICE SHELL holds. Time for a different idea.',steps:[
    {say:'Brain Freeze slams its lid shut. ICE SHELL! Nothing gets through.',word:'ICE SHELL',color:'#aee6ff',sfx:'thud'},
    {say:'BRAIN FREEZE! It aims the cold at Rose...',sfx:'stun'},
    {say:'Rose: Not this time! I ate a pepper. Half a pepper. The hose flinched.',sfx:'raspberry'},
    {say:'The ICE SHELL holds. Nothing gets through. Not Double Teams. Not peppers. Not yet.'}]}},
  // Phase 2: Brain Freeze starts at half HP (Frosted Lid and Deep Freeze are open to him at once), and every third round from the third
  // two Sprinkle Gremlins at most skitter out of the freezer. This is the fight that is won.
  nsBoss2:{vp:30,foeHp:{brainfreeze:.5},adds:{foe:'brainfreeze',id:'gremlin',row:'front',first:3,every:3,maxLive:2}}
};
// A chapter that does not follow the story's order. The Character Level floor and the Vibe Point pool (`finished` chapters' worth, 135 each) a
// save in it gets. `levelFloor` stops at chapter 10 and `finished` would count 20 chapters, so chapter 21 would start at level 25 with every Vibe
// at mastery; the bonus chapter starts everyone at level 5 (b6Prep(5)) and a little over Rank 2.
B3_STORY.bonus={21:{level:5,finished:1}};

// Tips for the seven bonus fights, keyed by the `tut` name the scenes use (data/bonus-nine-scoops.js). Battle 2's Warmth, HEART and ICE SHELL words are not used.
const NS_CHARGING=(F,id)=>F.foes.some(f=>f.charge&&(!id||f.id===id));
B3_STORY.tips.nsGremlin=[
  {id:'peeve',who:'tom',text:'Tom’s turn. Sprinkle Gremlins can’t stand Sizzle or Drench. Tap one (or press I) to check, then use a Skill of that flavor.'},
  {id:'spray',who:'grace',text:'A gremlin’s Sprinkle Spray hits everyone and dazzles them. Keep somebody’s Pep up and heal whoever drops low.',when:(F)=>F.party.some(p=>p.hp<p.maxHp*.7)},
  {id:'ruckus',who:'*',text:'The RUCKUS bar (◀) fills as the family fights. At 50% two people can team up: a Double Team.',when:(F)=>(F.ruckus||0)>=40}
];
B3_STORY.tips.nsSlug=[
  {id:'elite',who:'tom',text:'The Slushie Slug is an Elite: 4 Composure pips. It can’t stand Sizzle or Razzle and shrugs off Drench, so skip Drench.'},
  {id:'glaze',who:'*',text:'Blue-Ice Glaze takes 25% off every hit for 2 turns. Break it with a Break, or hit something else until it wears off.',when:(F)=>F.foes.some(f=>f.id==='slushslug'&&f.st&&f.st.blue_ice)},
  {id:'cone',who:'*',text:'The Cone Head in the Back row can’t stand Sizzle or Racket, and single-target Clobber does 20% less to the Back row.',when:(F)=>F.foes.some(f=>f.id==='conehead')},
  {id:'rush',who:'*',text:'Slush Rush is charging (!!): it hits everyone and slows them. Shield the family, or break its pips to stop it.',when:(F)=>NS_CHARGING(F,'slushslug')}
];
B3_STORY.tips.nsCone=[
  {id:'back',who:'tom',text:'The Cone Heads stand in the Back row. They can’t stand Sizzle or Racket, and single-target Clobber does 20% less back there.'},
  {id:'drip',who:'*',text:'Mint-Chip Drip drenches whoever it hits. A heal or a shield on that person keeps the turn bar friendly.',when:(F)=>F.party.some(p=>p.st&&p.st.drenched)},
  {id:'pass',who:'*',text:'A hurt Cone Head or gremlin gets a Scoop Pass from the other Cone Head: a heal and a little Defense. Knock out the healer first.',when:(F)=>F.foes.some(f=>f.hp<f.maxHp*.8)}
];
B3_STORY.tips.nsBoss1=[
  {id:'peeve',who:'tom',text:'Brain Freeze has 6 Composure pips and can’t stand Sizzle or Razzle. It shrugs off Drench. Hit it where it hurts.'},
  {id:'pitch',who:'*',text:'Ice-Cube Pitch or Temple Throb is charging (!!). The pitch stuns one of you, the throb tires everyone. Shield them, or interrupt it.',when:(F)=>NS_CHARGING(F,'brainfreeze')},
  {id:'slow',who:'*',text:'Frost Breath slows whoever it hits. A slowed person’s turns come later on the bar, so heal or shield them early.',when:(F)=>F.party.some(p=>p.st&&p.st.slow)}
];
B3_STORY.tips.nsBoss1b=[
  {id:'peeve',who:'tom',text:'Brain Freeze can’t stand Sizzle or Razzle and shrugs off Drench. Rose is spicy now, so the pond’s cold has a harder time with her.'},
  {id:'pitch',who:'*',text:'Ice-Cube Pitch or Temple Throb is charging (!!). Shield the family, or interrupt it before it lands.',when:(F)=>NS_CHARGING(F,'brainfreeze')}
];
B3_STORY.tips.nsGarden=[
  {id:'peeve',who:'tom',text:'Gremlins again. They can’t stand Sizzle or Drench, and a Skill that hits all of them at once saves turns.'},
  {id:'spray',who:'*',text:'Sprinkle Spray hits everyone and dazzles them. Heal whoever drops low, and keep going.',when:(F)=>F.party.some(p=>p.hp<p.maxHp*.7)}
];
B3_STORY.tips.nsBoss2=[
  {id:'half',who:'tom',text:'Brain Freeze starts this fight at half HP, so it opens with Frosted Lid: 25% less damage and 15% more Defense. Panic Boil! or a Break pops the lid.'},
  {id:'adds',who:'*',text:'Every third round two Sprinkle Gremlins skitter out of the freezer. Knock them out for a breather, or keep hitting Brain Freeze.',when:(F)=>F.foes.some(f=>f.id==='gremlin')},
  {id:'deep',who:'*',text:'Deep Freeze is charging (!!): it hits everyone, drenches and slows them. Shield the family, or break its pips to stop it.',when:(F)=>NS_CHARGING(F,'brainfreeze')}
];
