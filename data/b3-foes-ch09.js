'use strict';
// data/b3-foes-ch09.js — Battle 3 enemies: chapter 9, the Rose Dome Ballroom (bestiary v11 section 2). Numbers are the bestiary's printed numbers.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 9's party is four (Tom, Grace, Rose, Deedee), so The Mirrorball prints her HP for 4 and `hp3` for three.
// The Mirrorball's glare is the opening: Facet Dazzle and Spotlight Solo leave her Dazzled, so a Clobber hit sets off Shatter Glitz! (it strips
// her Facet Spin) and a Racket hit sets off Sensory Overload! (both already built).
// New in stage 13b: the `b3Who` targets `frontAllies` and `firstTarget` (stage 13a's seams) are first used here; every other act uses a seam that exists.
B3_FOES.velvetrope={id:'velvetrope',name:'Velvet Rope',ch:9,role:'swarmer',row:'front',hp:273,atk:63,def:34,spd:112,pips:0,
  peeves:['clobber','racket'],resists:[],start:[],mechanics:[],drop:'velvetbow',
  acts:[
    {id:'rope_lash',name:'Rope Lash',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'not_on_the_list',name:'“Not On The List”',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'push',n:15,to:'target'}]},
    {id:'members_only',name:'Members Only',flavor:['racket'],power:1.05,recovery:120,hits:'all',tags:['aoe','buff'],effects:[{op:'status',id:'members_only',to:'frontAllies'}]}
  ]};
B3_FOES.stuffedshirt={id:'stuffedshirt',name:'Stuffed Shirt',ch:9,role:'bruiser',row:'front',hp:483,atk:81,def:44,spd:102,pips:0,
  peeves:['racket','drench'],resists:['razzle'],start:[],mechanics:[],drop:'cufflink',
  acts:[
    {id:'hmph',name:'“Hmph.”',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'hmph',to:'target'}]},
    {id:'stiff_arm',name:'Stiff Arm',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'how_gauche',name:'“How Gauche!”',flavor:['racket'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'gauche',to:'target'}]}
  ]};
B3_FOES.coathanger={id:'coathanger',name:'The Hanger-On',ch:9,role:'bruiser',row:'front',hp:483,atk:81,def:44,spd:102,pips:0,
  peeves:['clobber','drench'],resists:['sizzle'],start:[],mechanics:[],drop:'coatticket',
  acts:[
    {id:'wire_hook',name:'Wire Hook',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'coat_cling',name:'1971 Coat Cling',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'slow',n:2,to:'target'}]},
    {id:'hang_on_tight',name:'Hang On Tight',flavor:['clobber'],power:1.15,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[{op:'status',id:'slow',n:1,to:'target'}]}
  ]};
B3_FOES.soreloser={id:'soreloser',name:'The Sore Loser',ch:9,role:'hexer',row:'back',hp:357,atk:70,def:38,spd:112,pips:0,
  peeves:['sizzle','razzle'],resists:['racket'],start:[],mechanics:[],drop:'luckychip',
  acts:[
    {id:'card_flick',name:'Card Flick',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'bleed',to:'target'}]},
    {id:'cheater',name:'“Cheater!”',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'cheater',n:1,to:'target'}]},
    {id:'fifty_two_pickup',name:'Fifty-Two Pickup',flavor:['clobber'],power:1.15,recovery:120,hits:'all',tags:['projectile','aoe'],
      effects:[{op:'pep',n:-1,to:'firstTarget'},{op:'status',id:'fatigue',to:'firstTarget'}]}
  ]};
B3_FOES.wallflower={id:'wallflower',name:'The Wallflower',ch:9,role:'elite',row:'front',hp:756,atk:85,def:53,spd:96,pips:4,
  peeves:['razzle','sizzle'],resists:['clobber'],start:['wall_hug'],mechanics:[],drop:'corsage',
  acts:[
    {id:'sorry',name:'“Sorry!”',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'do_not_look',name:'“Do Not Look At Me”',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile','buff'],
      effects:[{op:'status',id:'blind',n:1,to:'target'},{op:'status',id:'wall_hug',to:'self'}]},
    {id:'petal_storm',name:'Petal Storm',flavor:['razzle'],power:1.2,recovery:120,hits:'all',tags:['projectile','aoe','charge_up'],effects:[{op:'status',id:'dazzled',n:2,to:'target'}]}
  ]};
B3_FOES.mirrorball={id:'mirrorball',name:'The Mirrorball',ch:9,role:'boss',row:'front',hp:1590,hp3:1190,atk:93,def:48,spd:109,pips:7,
  peeves:['racket','clobber'],resists:['razzle'],start:['facet_spin'],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'chain_swing',name:'Chain Swing',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'facet_dazzle',name:'Facet Dazzle',flavor:['razzle'],power:1,recovery:100,hits:'one',tags:['projectile','buff'],
      effects:[{op:'status',id:'blind',n:1,to:'target'},{op:'status',id:'facet_spin',to:'self'},{op:'status',id:'dazzled',n:2,to:'self'}]},
    {id:'glitter_beam',name:'Glitter Beam',flavor:['razzle'],power:1.1,recovery:100,hits:'all',tags:['projectile','aoe'],effects:[]},
    {id:'spotlight_solo',name:'Spotlight Solo',flavor:['razzle'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],effects:[{op:'status',id:'dazzled',n:2,to:'self'}]},
    {id:'last_dance',name:'LAST DANCE',flavor:['razzle'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},effects:[]}
  ]};
// Formations (bestiary section 4). vp: 9 for each normal fight, 27 for the boss (bestiary section 5).
B3_FORMATIONS.velvetrope={id:'velvetrope',ch:9,foes:[{id:'velvetrope',row:'front'},{id:'velvetrope',row:'front'}],vp:9};
B3_FORMATIONS.stuffedshirt={id:'stuffedshirt',ch:9,foes:[{id:'stuffedshirt',row:'front'},{id:'velvetrope',row:'front'}],vp:9};
B3_FORMATIONS.coathanger={id:'coathanger',ch:9,foes:[{id:'coathanger',row:'front'},{id:'velvetrope',row:'front'}],vp:9};
B3_FORMATIONS.soreloser={id:'soreloser',ch:9,foes:[{id:'stuffedshirt',row:'front'},{id:'soreloser',row:'back'}],vp:9};
B3_FORMATIONS.wallflower={id:'wallflower',ch:9,foes:[{id:'wallflower',row:'front'},{id:'soreloser',row:'back'}],vp:9};
B3_FORMATIONS.mirrorball={id:'mirrorball',ch:9,foes:[{id:'mirrorball',row:'front'}],vp:27};
