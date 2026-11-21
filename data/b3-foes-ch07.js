'use strict';
// data/b3-foes-ch07.js — Battle 3 enemies: chapter 7, the Library (bestiary v11 section 3).
// Numbers are the bestiary's printed numbers. The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 7's party is four (Tom, Grace, Rose, Boppy), so The Unread prints its HP for 4 and `hp3` for three.
// THE END pushes only the family members standing without a shield (target `unshielded`); Slow rides on the hit, so everyone it hits is slowed.
B3_FOES.shusher={id:'shusher',name:'Shusher',ch:7,role:'hexer',row:'back',hp:281,atk:56,def:32,spd:110,pips:0,
  peeves:['razzle','sizzle'],resists:[],start:[],mechanics:[],drop:'tassel',
  acts:[
    {id:'tassel_flick',name:'Tassel Flick',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'shhh',name:'SHHH!',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'skill_lock',n:1,to:'target'}]},
    {id:'hush_hour',name:'Hush Hour',flavor:['racket'],power:1.05,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'hush_hour',to:'target'}]}
  ]};
B3_FOES.dogear={id:'dogear',name:'Dog-Ear',ch:7,role:'swarmer',row:'front',hp:215,atk:50,def:28,spd:110,pips:0,
  peeves:['drench','sizzle'],resists:['racket'],start:[],mechanics:[],drop:'flatpage',
  acts:[
    {id:'page_nip',name:'Page Nip',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'bleed',to:'target'}]},
    {id:'corner_fold',name:'Corner Fold',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'corner_fold',to:'target'}]},
    {id:'hard_crease',name:'Hard Crease',flavor:['clobber'],power:1.1,recovery:120,hits:'all',tags:['ground_sweep','aoe'],effects:[]}
  ]};
B3_FOES.cliffhanger={id:'cliffhanger',name:'The Cliffhanger',ch:7,role:'bruiser',row:'front',hp:379,atk:65,def:37,spd:100,pips:0,
  peeves:['sizzle','racket'],resists:['clobber'],start:[],mechanics:[],drop:'sequel',
  acts:[
    {id:'chain_swing',name:'Chain Swing',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'plot_twist',name:'Plot Twist!',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'push',n:20,to:'target'}]},
    {id:'to_be_continued',name:'To Be Continued...',flavor:['racket'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'slow',n:2,to:'target'}]}
  ]};
B3_FOES.knowitall={id:'knowitall',name:'The Know-It-All',ch:7,role:'hexer',row:'back',hp:281,atk:56,def:32,spd:110,pips:0,
  peeves:['racket','razzle'],resists:['sizzle'],start:[],mechanics:[],drop:'readglasses',
  acts:[
    {id:'pointer_tap',name:'Pointer Tap',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'actually',name:'“Actually...”',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'actually',to:'target'}]},
    {id:'well_technically',name:'“Well, Technically”',flavor:['racket'],power:1.1,recovery:120,hits:'all',tags:['aoe','buff','charge_up'],effects:[{op:'status',id:'fatigue',n:2,to:'target'},{op:'status',id:'well_technically',to:'self'}]}
  ]};
// Pop-Up Panic, the chapter's Elite: 4 Composure pips, shrugs off Racket, starts wound tight (+20% Evasion for 2 turns).
B3_FOES.popup={id:'popup',name:'Pop-Up Panic',ch:7,role:'elite',row:'front',hp:594,atk:68,def:44,spd:95,pips:4,
  peeves:['clobber','razzle'],resists:['racket'],start:['coiled_spring'],mechanics:[],drop:'popcard',
  acts:[
    {id:'spring_pop',name:'Spring Pop!',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'jump_out_scare',name:'Jump-Out Scare',flavor:['racket'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'jump_scare',to:'target'}]},
    {id:'big_reveal',name:'Big Reveal',flavor:['clobber'],power:1.25,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[]}
  ]};
// The Unread, the chapter 7 boss. Below 50% HP: first the Bookmark Ribbon (a guard stance and a little healing, once per stance), then THE END,
// a wind-up that sweeps the whole family and pushes every family member standing without a shield back 35 ticks; Slow rides on the hit.
B3_FOES.unread={id:'unread',name:'The Unread',ch:7,role:'boss',row:'front',hp:1230,hp3:920,atk:74,def:40,spd:107,pips:7,
  peeves:['racket','sizzle'],resists:['clobber'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'dust_cloud',name:'Dust Cloud',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'cover_slam',name:'Cover Slam',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'turn_back_the_page',name:'Turn Back the Page',flavor:['racket'],power:1.5,recovery:120,hits:'one',tags:['projectile','charge_up'],effects:[{op:'push',n:45,to:'target'}]},
    {id:'bookmark_ribbon',name:'Bookmark Ribbon',flavor:['support'],power:0,recovery:80,hits:'self',tags:['buff'],when:{hpBelow:.5,lacks:'bookmark_guard'},
      effects:[{op:'status',id:'bookmark_guard',to:'self'},{op:'status',id:'bookmark_mend',to:'self'}]},
    {id:'dead_quiet_reading_room',name:'Dead-Quiet Reading Room',flavor:['racket'],power:1.05,recovery:100,hits:'all',tags:['aoe'],effects:[{op:'status',id:'fatigue',n:2,to:'target'}]},
    {id:'the_end',name:'THE END',flavor:['racket'],power:1.35,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],when:{hpBelow:.5},
      effects:[{op:'status',id:'slow',n:2,to:'target'},{op:'push',n:35,to:'unshielded'}]}
  ]};
// Formations (bestiary section 4). vp: 9 for each normal fight, 27 for the boss (bestiary section 5).
B3_FORMATIONS.shusher={id:'shusher',ch:7,foes:[{id:'dogear',row:'front'},{id:'shusher',row:'back'}],vp:9};
B3_FORMATIONS.dogear={id:'dogear',ch:7,foes:[{id:'dogear',row:'front'},{id:'dogear',row:'front'}],vp:9};
B3_FORMATIONS.cliffhanger={id:'cliffhanger',ch:7,foes:[{id:'cliffhanger',row:'front'},{id:'shusher',row:'back'}],vp:9};
B3_FORMATIONS.knowitall={id:'knowitall',ch:7,foes:[{id:'dogear',row:'front'},{id:'knowitall',row:'back'}],vp:9};
B3_FORMATIONS.popup={id:'popup',ch:7,foes:[{id:'popup',row:'front'},{id:'shusher',row:'back'}],vp:9};
B3_FORMATIONS.unread={id:'unread',ch:7,foes:[{id:'unread',row:'front'}],vp:27};
