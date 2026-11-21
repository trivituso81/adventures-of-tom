'use strict';
// data/b3-foes-ch10.js — Battle 3 enemies: chapter 10, the Long Island airport terminal (bestiary v11 section 2). Numbers are the bestiary's printed numbers.
// The row format and every act field are explained at the top of data/b3-foes-ch01.js.
// Chapter 10's party is four (Tom, Grace, Rose, Amy), so The Last Call prints its HP for 4 and `hp3` for three.
// The Last Call's Boarding Group Nine is the wind-up of GATE CLOSED, the same pattern as The Big One's Big Glare and Swamp Chomp: it Marks a
// Back-row ally now (and gives the monster +20% Attack for a turn), and the slam with Skill Lock comes on its next turn. Tom's Suite Door Slide
// takes the slam and stops the lock; an interrupt or a Break cancels it. Every act uses a seam that exists.
B3_FOES.carryon={id:'carryon',name:'Carry-On',ch:10,role:'swarmer',row:'front',hp:319,atk:71,def:37,spd:113,pips:0,
  peeves:['razzle','drench'],resists:[],start:[],mechanics:[],drop:'pretzels',
  acts:[
    {id:'four_wheel_roll',name:'Four-Wheel Roll',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee','ground_sweep'],effects:[]},
    {id:'overhead_bin_drop',name:'Overhead Bin Drop',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'status',id:'bin_drop',to:'target'}]},
    {id:'sizer_frame_check',name:'Sizer Frame Check',flavor:['clobber'],power:1.1,recovery:120,hits:'all',tags:['ground_sweep','aoe'],effects:[]}
  ]};
B3_FOES.jetlag={id:'jetlag',name:'Jet Lag',ch:10,role:'hexer',row:'back',hp:417,atk:80,def:41,spd:113,pips:0,
  peeves:['clobber','sizzle'],resists:['racket'],start:[],mechanics:[],drop:'coldbrew',
  acts:[
    {id:'contagious_yawn',name:'Contagious Yawn',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'status',id:'fatigue',to:'target'}]},
    {id:'three_am_glare',name:'3 AM Glare',flavor:['razzle'],power:1,recovery:100,hits:'one',tags:['projectile'],effects:[{op:'status',id:'blind',n:1,to:'target'}]},
    {id:'three_hour_time_diff',name:'Three-Hour Time Diff',flavor:['racket'],power:1.1,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'slow',n:2,to:'target'}]}
  ]};
B3_FOES.longline={id:'longline',name:'The Long Line',ch:10,role:'bruiser',row:'front',hp:564,atk:92,def:48,spd:103,pips:0,
  peeves:['clobber','razzle'],resists:['racket'],start:[],mechanics:[],drop:'prioritytag',
  acts:[
    {id:'retractable_belt_snap',name:'Retractable Belt Snap',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[]},
    {id:'step_back_behind_yellow',name:'“Step Back Behind Yellow”',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[{op:'push',n:20,to:'target'}]},
    {id:'random_screening',name:'Random Screening',flavor:['racket'],power:1.15,recovery:120,hits:'all',tags:['aoe','charge_up'],effects:[{op:'status',id:'slow',n:2,to:'target'}]}
  ]};
B3_FOES.unclaimed={id:'unclaimed',name:'The Unclaimed',ch:10,role:'bruiser',row:'front',hp:564,atk:92,def:48,spd:103,pips:0,
  peeves:['drench','sizzle'],resists:['clobber'],start:[],mechanics:[],drop:'bagtag',
  acts:[
    {id:'carousel_spin',name:'Carousel Spin',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['ground_sweep'],effects:[{op:'status',id:'slow',n:1,to:'target'}]},
    {id:'overweight_trunk',name:'Overweight Trunk',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'excess_baggage',name:'Excess Baggage',flavor:['clobber'],power:1.5,recovery:120,hits:'one',tags:['melee','charge_up'],effects:[{op:'status',id:'fatigue',to:'target'},{op:'pep',n:-1,to:'target'}]}
  ]};
B3_FOES.armresthog={id:'armresthog',name:'The Armrest Hog',ch:10,role:'elite',row:'front',hp:882,atk:97,def:58,spd:97,pips:4,
  peeves:['racket','razzle'],resists:['sizzle'],start:['both_armrests'],mechanics:[],drop:'eyemask',
  acts:[
    {id:'middle_seat_elbow',name:'Middle-Seat Elbow',flavor:['clobber'],power:.8,recovery:80,hits:'one',tags:['melee'],effects:[{op:'status',id:'middle_seat',to:'target'}]},
    {id:'neck_pillow_squeeze',name:'Neck-Pillow Squeeze',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'full_recline',name:'Full Recline',flavor:['clobber'],power:1.25,recovery:120,hits:'all',tags:['ground_sweep','aoe','charge_up'],effects:[{op:'status',id:'fatigue',to:'target'}]}
  ]};
B3_FOES.lastcall={id:'lastcall',name:'The Last Call',ch:10,role:'boss',row:'front',hp:2230,hp3:1670,atk:105,def:53,spd:110,pips:7,
  peeves:['drench','sizzle'],resists:['racket'],start:[],mechanics:[],drop:null,noRun:true,
  acts:[
    {id:'delayed',name:'DELAYED',flavor:['racket'],power:.8,recovery:80,hits:'one',tags:['projectile'],effects:[{op:'push',n:25,to:'target'}]},
    {id:'split_flap_slap',name:'Split-Flap Slap',flavor:['clobber'],power:1,recovery:100,hits:'one',tags:['melee'],effects:[]},
    {id:'boarding_group_nine',name:'Boarding Group Nine',flavor:['support'],power:0,recovery:80,hits:'one',aim:'back',tags:['charge_up','buff'],then:'gate_closed',
      effects:[{op:'mark'},{op:'status',id:'boarding_group',to:'self'}]},
    {id:'pa_static',name:'PA Static',flavor:['razzle'],power:1.05,recovery:100,hits:'all',tags:['projectile','aoe'],effects:[]},
    {id:'gate_closed',name:'GATE CLOSED',flavor:['clobber'],power:1.5,recovery:120,hits:'marked',tags:['melee','charge_up'],after:'boarding_group_nine',effects:[{op:'status',id:'skill_lock',n:2,to:'target'}]},
    {id:'final_boarding',name:'FINAL BOARDING',flavor:['razzle'],power:1.35,recovery:120,hits:'all',tags:['aoe','charge_up'],when:{hpBelow:.5},effects:[{op:'status',id:'fatigue',to:'target'}]}
  ]};
// Formations (bestiary section 4). vp: 8 for each normal fight, 26 for the boss (bestiary section 5).
B3_FORMATIONS.carryon={id:'carryon',ch:10,foes:[{id:'carryon',row:'front'},{id:'carryon',row:'front'}],vp:8};
B3_FORMATIONS.jetlag={id:'jetlag',ch:10,foes:[{id:'carryon',row:'front'},{id:'jetlag',row:'back'}],vp:8};
B3_FORMATIONS.longline={id:'longline',ch:10,foes:[{id:'longline',row:'front'},{id:'jetlag',row:'back'}],vp:8};
B3_FORMATIONS.unclaimed={id:'unclaimed',ch:10,foes:[{id:'unclaimed',row:'front'},{id:'carryon',row:'front'}],vp:8};
B3_FORMATIONS.armresthog={id:'armresthog',ch:10,foes:[{id:'armresthog',row:'front'},{id:'jetlag',row:'back'}],vp:8};
B3_FORMATIONS.lastcall={id:'lastcall',ch:10,foes:[{id:'lastcall',row:'front'}],vp:26};
