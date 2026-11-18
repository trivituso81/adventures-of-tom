'use strict';
// data/b3-kit-rose.js — Battle 3 kit: Rose (spec section 3.3). Stage 1: Sugar Rush's Basic and Skill 1.
// A multi-hit move's `power` is the whole move's power, shared evenly by its hits (my call: the spec gives one tier per move).
B3_CAST.rose={id:'rose',name:'Rose',vibes:['rose_sugar'],stat:{hp:1,atk:1,def:1,spd:1}};
B3_VIBES.rose_sugar={id:'rose_sugar',owner:'rose',name:'Sugar Rush',sig:1,lean:'striker',
  subtitles:['Ankle Tackler','Shoulder Jockey','Human Pinball'],
  trait:'bouncy_physics',basic:'lamb_tuck_ankle_tackle',skills:['the_floor_is_lava','giddyup_tata_launch','double_lamby_return_cart_blitz'],
  quirks:['twin_lamb_relay','its_our_longboard_now'],counter:null};
B3_SKILLS.lamb_tuck_ankle_tackle={id:'lamb_tuck_ankle_tackle',vibe:'rose_sugar',slot:'basic',name:'Lamb-Tuck Ankle Tackle',pep:0,flavor:['clobber'],power:'light',hits:2,
  target:'foe',tags:[],composure:0,effects:[{op:'damage'}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Two quick Clobber hits on one monster.'};
B3_SKILLS.the_floor_is_lava={id:'the_floor_is_lava',vibe:'rose_sugar',slot:'s1',name:'The Floor Is Lava!',pep:3,flavor:['clobber'],power:'standard',hits:3,
  target:'random_foes',tags:[],composure:0,effects:[{op:'damage',bonus:{if:'targetHas',ids:['toasty','dazzled'],add:.25}}],line:null,anim:{kind:'default',shape:'strike'},
  desc:'Three Clobber hops onto random monsters. Each hop hits 25% harder on a Toasty or Dazzled monster.'};
