'use strict';
// data/b3-stage.js: the staging rows of the family's moves (movestage1, 2026-11-22; plan claude/move-staging-plan.md).
// A move is three layers: BODY (a Wan video of the person acting only), STAGE (what the engine draws across the battlefield from the
// row below, timed to marks on the body clip) and, for a Capstone, a SET PIECE (a full-screen moment of 6 to 8 seconds).
// Nothing in the battle rules reads this file (battle animation is out of scope for the battle system, CLAUDE.md). The Battle Guide reads
// it: a family move with no row here shows "Waits for staging" and cannot be generated (tools/guidegen/build_map.js).
// The engine that plays these rows is card c-movestage-build; until it ships, a move keeps whatever it plays today.
//
// Row fields (plan section 4): tier basic|s1|s2|cap; budget = target seconds at 1x (the ladder: Basic 2-3, Skill 1 3-4, Skill 2 4-5,
// Capstone 6-8); body {clip, job, keep, marks}; a mark is {pic:n} (picture of the baked clip) or {f:share of the clip's length} until the
// build session measures it on the baked clip; hit = the mark or step id where the hit shows ('late' for a move with no hit);
// steps / lasting / setpiece use only the stage actions of plan 4.1; assets: prop = one picture, obj = an object-only video;
// size {h: share of the mover's standing height} or {sw: share of the screen width}.
const B3_STAGE={};
// movestage2: the baked stage assets (data/stage/<owner>-<name>.js, written by tools/clip-bake/bake_stage.py) call b3gDefine; they load right after this
// file, before engine/b3-stage.js, so the calls only collect here and the engine registers them when it loads.
const B3G_DATA={};
function b3gDefine(key,D){B3G_DATA[key]=D;}

// ================= Tom: Frequent Flier =================
// Basic. Approved clip kept (Tom: all good, 2026-11-21). Accent only: the snooty swat gets a verdict.
B3_STAGE.lounge_pass_flex={v:1,tier:'basic',budget:2.8,
  body:{clip:'tom_loungepass',job:'tom-loungepass',keep:true,marks:{flash:{pic:9},swat:{pic:24}}},
  hit:'swat',
  steps:[{at:'swat',do:'words',text:'NOT ON THE LIST',where:'over:target',size:2,color:'#f1d58c',hold:1.1}],
  assets:{}};

// Skill 1. Approved clip kept (Tom: all good, 2026-11-22). One stage element: the carry-on, there for the ward's 2 turns.
B3_STAGE.zone_one_blockade={v:1,tier:'s1',budget:3.5,
  body:{clip:'tom_blockade',job:'tom-blockade',keep:true,marks:{gate:{pic:10},hold:{pic:16}}},
  hit:'late',late:'gate',
  steps:[{at:'gate',do:'sfx',sfx:'thud'}],
  lasting:[{while:'zone_one',on:'self',do:'place',asset:'tom/carryon',side:'front',enter:{at:'gate',from:'behind',dur:.5},
    then:{beat:'react',do:'fly',from:'self_front',to:'attacker',back:true,arc:6,dur:.45,
      also:[{do:'foe',react:'knock',px:18},{do:'words',text:'PLEASE WAIT TO BE CALLED',where:'over:attacker',size:2,hold:1.2}]},
    exit:{do:'cross',to:'screen_right',lane:'floor',dur:.4}}],
  assets:{'tom/carryon':{kind:'prop',bg:'magenta',size:{h:.42},prompt:'tools/art-library/prompts/stage-tom-carryon-v1.txt'}}};

// Skill 2. New body. Bigger and lasting: a pair of doors around each family member beside him, answering every redirected hit.
B3_STAGE.suite_door_slide={v:1,tier:'s2',budget:4.5,
  body:{clip:'tom_suitedoor',job:'tom-suitedoor',keep:false,marks:{open:{pic:7},close:{pic:17},nod:{pic:21}}},
  hit:'late',late:'close',
  steps:[{at:'close',do:'sfx',sfx:'ding'},{at:'nod',do:'words',text:'DO NOT DISTURB',where:'over:each_ally',size:2,color:'#ffcf8a',hold:1.2}],
  lasting:[{while:'suite_door',on:'carrier',do:'surround',asset:'tom/suitedoor',pair:true,enter:{at:'close',dur:.45},
    then:{beat:'intercept',do:'flash',on:'carrier',color:'#c9d8f0',dur:.25,
      also:[{do:'words',text:'REDIRECTED TO TOM',where:'over:carrier',size:2,hold:1.1},{do:'shake',amp:2,dur:.2}]},
    exit:{do:'surround',reverse:true,dur:.35}}],
  assets:{'tom/suitedoor':{kind:'prop',bg:'magenta',size:{h:.55},prompt:'tools/art-library/prompts/stage-tom-suitedoor-v1.txt'}}};

// Capstone. New body. Set piece: night on the tarmac, his car arrives, high beams, jet wash, and off it goes.
B3_STAGE.tarmac_porsche_transfer={v:1,tier:'cap',budget:7.5,
  body:{clip:'tom_porsche',job:'tom-porsche',keep:false,marks:{watch:{pic:9},wave:{pic:22}}},
  hit:'beams',
  setpiece:{dur:7.5,dim:.8,steps:[
    {at:0,do:'dim',amount:.8,in:.4},
    {at:0,do:'sfx',sfx:'charge'},
    {at:.4,do:'pop',asset:'tom/runwaylights',on:'floor',hold:6.2,blend:'add'},
    {at:'wave',do:'pop',asset:'tom/glare',on:'screen_right',hold:.5,blend:'add'},
    {id:'arrive',at:{mark:'wave',plus:.3},do:'cross',asset:'tom/porsche',from:'screen_right',stop:'foes_front',lane:'mid',dur:.9,skid:.3},
    {at:{step:'arrive',plus:1.2},do:'sfx',sfx:'thud'},
    {at:{step:'arrive',plus:1.2},do:'shake',amp:4,dur:.3},
    {id:'beams',at:{step:'arrive',plus:1.5},do:'flash',color:'#ffffff',dur:.35},
    {at:{step:'beams',plus:0},do:'pop',asset:'tom/glare',on:'each_target',hold:.8,blend:'add'},
    {at:{step:'beams',plus:0},do:'foe',react:'knock',px:24},
    {id:'wash',at:{step:'beams',plus:1.0},do:'cross',asset:'tom/jetwash',from:'screen_right',to:'screen_left',lane:'foes',dur:.8,blend:'add'},
    {at:{step:'wash',plus:.2},do:'foe',react:'knock',px:30},
    {at:{step:'wash',plus:.2},do:'shake',amp:6,dur:.6},
    {at:{step:'wash',plus:1.0},do:'words',text:'PLEASE ENJOY YOUR TRANSFER',where:'screen_center',size:3,color:'#f1d58c',hold:1.4},
    {at:6.0,do:'cross',asset:'tom/porsche',from:'foes_front',to:'screen_left',lane:'mid',dur:.7},
    {at:6.8,do:'dim',amount:0,out:.5}]},
  lasting:[{while:'high_beams',on:'self',do:'glow',color:'#ffd27a'}],
  assets:{'tom/porsche':{kind:'prop',bg:'magenta',size:{sw:.5},prompt:'tools/art-library/prompts/stage-tom-porsche-v1.txt'},
    'tom/runwaylights':{kind:'obj',bg:'black',loop:true,size:{sw:1},prompt:'tools/art-library/prompts/stage-tom-runwaylights-v1.txt',motion:'tools/art-library/prompts/stage-tom-runwaylights-motion-v1.txt'},
    'tom/glare':{kind:'obj',bg:'black',size:{h:1.2},prompt:'tools/art-library/prompts/stage-tom-glare-v1.txt',motion:'tools/art-library/prompts/stage-tom-glare-motion-v1.txt'},
    'tom/jetwash':{kind:'obj',bg:'black',size:{sw:.5},prompt:'tools/art-library/prompts/stage-tom-jetwash-v1.txt',motion:'tools/art-library/prompts/stage-tom-jetwash-motion-v1.txt'}}};

// ================= Tom: Gamer Geek =================
// Basic. New body: the gag is the blow and the one-eyed inspection. Accent only.
B3_STAGE.cartridge_blow={v:1,tier:'basic',budget:2.5,
  body:{clip:'tom_cartridge',job:'tom-cartridge',keep:false,marks:{blow:{pic:15},squint:{pic:18}},hand:[12,62]},
  hit:'blow',
  steps:[{at:'blow',do:'words',text:'PFFFFT',where:'over:hand',size:2,color:'#e8ecf4',hold:.8},{at:'blow',do:'sfx',sfx:'whoosh'}],
  assets:{}};

// Skill 1. New body (an empty-hand throw and a no-look catch). One stage element: the controller out and back.
B3_STAGE.controller_toss={v:1,tier:'s1',budget:3.2,
  body:{clip:'tom_controller',job:'tom-controller',keep:false,marks:{release:{pic:9},catch:{pic:21}},hand:[33,45]},
  hit:'toss',
  steps:[{id:'toss',at:'release',do:'fly',asset:'tom/controller',from:'hand',to:'target',arc:30,spin:3,dur:.45,hit:true,back:{at:'catch',to:'hand'}},
    {at:{step:'toss',plus:.45},do:'foe',react:'knock',px:14},{at:'release',do:'sfx',sfx:'whoosh'}],
  assets:{'tom/controller':{kind:'prop',bg:'magenta',size:{h:.22},prompt:'tools/art-library/prompts/stage-tom-controller-v1.txt'}}};

// Skill 2. New body. Bigger and lasting: the shell locks on, hovers, and slams down if the monster attacks.
B3_STAGE.winged_shell_lock_on={v:1,tier:'s2',budget:4.5,
  body:{clip:'tom_shell',job:'tom-shell',keep:false,marks:{circle:{pic:8},point:{pic:19}}},
  hit:'bonk',
  steps:[{id:'arrive',at:'circle',do:'drop',asset:'tom/wingedshell',onto:'above_self',dur:.4},
    {id:'go',at:'point',do:'fly',asset:'tom/wingedshell',from:'above_self',to:'above_target',arc:20,dur:.4},
    {id:'bonk',at:{step:'go',plus:.4},do:'drop',asset:'tom/wingedshell',onto:'target',dur:.15,hit:true},
    {at:{step:'bonk',plus:0},do:'foe',react:'squash'},
    {at:{step:'bonk',plus:.2},do:'words',text:'LOCKED ON',where:'over:target',size:2,color:'#7aa8ff',hold:1.0},
    {at:{step:'bonk',plus:0},do:'sfx',sfx:'jumpWhistle'}],
  lasting:[{while:'winged_shell',on:'carrier',do:'hover',asset:'tom/wingedshell',amp:4,rate:1.2,enter:{at:{step:'bonk',plus:.2},dur:.3},
    then:{beat:'react',do:'drop',asset:'tom/wingedshell',onto:'carrier',dur:.18,
      also:[{do:'pop',asset:'tom/bluebang',on:'carrier',hold:.6,blend:'add'},{do:'flash',color:'#7aa8ff',dur:.3},{do:'shake',amp:5,dur:.35},
        {do:'foe',react:'squash'},{do:'words',text:'NOTHING PERSONAL',where:'over:carrier',size:2,hold:1.1}]},
    exit:{do:'fly',to:'top',dur:.4}}],
  assets:{'tom/wingedshell':{kind:'obj',bg:'magenta',loop:true,size:{h:.3},prompt:'tools/art-library/prompts/stage-tom-wingedshell-v1.txt',motion:'tools/art-library/prompts/stage-tom-wingedshell-motion-v1.txt'},
    'tom/bluebang':{kind:'obj',bg:'black',size:{h:.9},prompt:'tools/art-library/prompts/stage-tom-bluebang-v1.txt',motion:'tools/art-library/prompts/stage-tom-bluebang-motion-v1.txt'}}};

// Capstone. New body. Set piece: the code goes in, the cheat is accepted, the sky falls on every monster.
B3_STAGE.konami_code={v:1,tier:'cap',budget:7.5,
  body:{clip:'tom_konami',job:'tom-konami',keep:false,marks:{tap:{pic:6},arms:{pic:24}}},
  hit:'rain',
  setpiece:{dur:7.5,dim:.9,steps:[
    {at:0,do:'dim',amount:.9,in:.3},
    {at:'tap',do:'words',glyphs:['up','up','down','down','left','right','left','right','B','A'],where:'screen_center',size:4,color:'#fff1cb',each:.2,hold:.6},
    {at:'arms',do:'flash',color:'#ffffff',dur:.25},
    {at:'arms',do:'words',text:'CHEAT ACCEPTED',where:'screen_center',size:3,color:'#ffe27a',hold:1.0},
    {at:'arms',do:'glow',on:'self',color:'rainbow',dur:4.5},
    {id:'rain',at:{mark:'arms',plus:.4},do:'rain',assets:['tom/fireball','tom/starbeam','tom/meteor'],n:18,dur:2.4,hit:'first',blend:'add'},
    {at:{step:'rain',plus:.1},do:'foe',react:'knock',px:10},
    {at:{step:'rain',plus:0},do:'shake',amp:3,dur:2.4},
    {at:{step:'rain',plus:2.5},do:'words',text:'+30 LIVES',where:'over:self',size:2,color:'#9be39a',hold:1.2},
    {at:7.1,do:'dim',amount:0,out:.4}]},
  assets:{'tom/fireball':{kind:'obj',bg:'black',loop:true,size:{h:.2},prompt:'tools/art-library/prompts/stage-tom-fireball-v1.txt',motion:'tools/art-library/prompts/stage-tom-fireball-motion-v1.txt'},
    'tom/starbeam':{kind:'obj',bg:'black',loop:true,size:{h:.3},prompt:'tools/art-library/prompts/stage-tom-starbeam-v1.txt',motion:'tools/art-library/prompts/stage-tom-starbeam-motion-v1.txt'},
    'tom/meteor':{kind:'obj',bg:'black',loop:true,size:{h:.3},prompt:'tools/art-library/prompts/stage-tom-meteor-v1.txt',motion:'tools/art-library/prompts/stage-tom-meteor-motion-v1.txt'}}};

// ================= Rose (movestage3, 2026-11-26) =================
// Rose's twelve moves in three layers, written with the ladder of plan section 3. Marks are {f: share of the clip} from the manifest beats
// (art-factory/aot-stage2-pass*-manifest-24fps.json) until the build measures them. Rose holds at most ONE prop in a video (her tattered Lamby);
// anything else is a stage picture. Sounds use only the names the engine already has (whoosh, thud, ding, charge).

// ----- Sugar Rush -----
// Basic. New body: the old clip brings Lamby out from behind her back (the move-staging finding), so it is replaced. Accents only: two thuds and a verdict on the second tackle.
B3_STAGE.lamb_tuck_ankle_tackle={v:1,tier:'basic',budget:2.7,
  body:{clip:'rose_tacklelunge',job:'rose-tacklelunge',keep:false,marks:{dash:{f:.22},hit1:{f:.37},hit2:{f:.56}}},
  hit:'hit1',
  steps:[{at:'hit1',do:'sfx',sfx:'thud'},{at:'hit1',do:'shake',amp:2,dur:.15},{at:'hit2',do:'sfx',sfx:'thud'},
    {at:'hit2',do:'words',text:'TACKLED!',where:'over:target',size:2,color:'#ffe08a',hold:.9}],
  assets:{}};

// Skill 1. New body (three hops). One stage element: a sofa cushion lands under each hop, the foe takes it.
B3_STAGE.the_floor_is_lava={v:1,tier:'s1',budget:3.5,
  body:{clip:'rose_lavahop',job:'rose-lavahop',keep:false,marks:{gasp:{f:.15},hop1:{f:.33},hop2:{f:.5},hop3:{f:.67}}},
  hit:'hop1',
  steps:[{at:'gasp',do:'words',text:'THE FLOOR IS LAVA!',where:'over:self',size:2,color:'#ff9a4a',hold:1.0},
    {id:'hop1',at:'hop1',do:'drop',asset:'rose/cushion',onto:'target',dur:.25,hit:true},
    {at:'hop2',do:'drop',asset:'rose/cushion',onto:'target',dur:.25,hit:true},
    {at:'hop3',do:'drop',asset:'rose/cushion',onto:'target',dur:.25,hit:true},
    {at:'hop1',do:'sfx',sfx:'thud'},{at:'hop2',do:'sfx',sfx:'thud'},{at:'hop3',do:'sfx',sfx:'thud'},
    {at:{step:'hop1',plus:.25},do:'foe',react:'squash'}],
  assets:{'rose/cushion':{kind:'prop',bg:'magenta',size:{h:.3},prompt:'tools/art-library/prompts/stage-rose-cushion-v1.txt'}}};

// Skill 2. Approved clip kept (it is in the game, paired with Tom's). Bigger stage: the ally glows, then a comet carries her to the foe.
B3_STAGE.giddyup_tata_launch={v:1,tier:'s2',budget:4.4,
  body:{clip:'rose_giddyup',job:'rose-giddyup',keep:true,marks:{tap:{f:.2},launch:{f:.53}}},
  hit:'launch',
  steps:[{at:'tap',do:'words',text:'GIDDYUP!',where:'over:ally',size:2,color:'#ffd27a',hold:1.0},
    {at:'tap',do:'sfx',sfx:'charge'},
    {id:'launch',at:'launch',do:'fly',asset:'rose/comet',from:'above_self',to:'target',arc:40,dur:.4,blend:'add',hit:true},
    {at:{step:'launch',plus:.4},do:'foe',react:'knock',px:20},{at:{step:'launch',plus:.4},do:'shake',amp:4,dur:.3},{at:'launch',do:'sfx',sfx:'whoosh'}],
  lasting:[{while:'giddyup',on:'carrier',do:'glow',color:'#ffd27a'}],
  assets:{'rose/comet':{kind:'prop',bg:'black',size:{h:.3},prompt:'tools/art-library/prompts/stage-rose-comet-v1.txt'}}};

// Capstone. New body. Set piece: two Lambies ricochet off six monsters, each hit a note higher, then the hero pose.
B3_STAGE.double_lamby_return_cart_blitz={v:1,tier:'cap',budget:7.2,
  body:{clip:'rose_doublelamby',job:'rose-doublelamby',keep:false,marks:{hoist:{f:.18},launch:{f:.33},hero:{f:.85}}},
  hit:'r1',
  setpiece:{dur:7.2,dim:.7,steps:[
    {at:0,do:'dim',amount:.7,in:.4},
    {at:'hoist',do:'sfx',sfx:'charge'},
    {id:'r1',at:2.3,do:'fly',asset:'rose/backuplamby',from:'above_self',to:'target',arc:30,dur:.35,hit:true},
    {at:2.9,do:'fly',asset:'rose/lamby',from:'target',to:'target',arc:50,dur:.35,hit:true},
    {at:3.5,do:'fly',asset:'rose/backuplamby',from:'target',to:'target',arc:50,dur:.35,hit:true},
    {at:4.1,do:'fly',asset:'rose/lamby',from:'target',to:'target',arc:50,dur:.35,hit:true},
    {at:4.7,do:'fly',asset:'rose/backuplamby',from:'target',to:'target',arc:50,dur:.35,hit:true},
    {at:5.3,do:'fly',asset:'rose/lamby',from:'target',to:'above_self',arc:50,dur:.35,hit:true},
    {at:2.3,do:'sfx',sfx:'ding'},{at:2.9,do:'sfx',sfx:'ding'},{at:3.5,do:'sfx',sfx:'ding'},{at:4.1,do:'sfx',sfx:'ding'},{at:4.7,do:'sfx',sfx:'ding'},{at:5.3,do:'sfx',sfx:'ding'},
    {at:2.6,do:'foe',react:'knock',px:10},{at:4.4,do:'foe',react:'knock',px:16},{at:5.6,do:'foe',react:'knock',px:24},{at:5.6,do:'shake',amp:5,dur:.5},
    {at:'hero',do:'words',text:'DOUBLE LAMBY!',where:'screen_center',size:3,color:'#fff1cb',hold:1.2},
    {at:6.6,do:'dim',amount:0,out:.5}]},
  assets:{'rose/lamby':{kind:'prop',bg:'magenta',size:{h:.2},prompt:'tools/art-library/prompts/stage-rose-lamby-v1.txt'},
    'rose/backuplamby':{kind:'prop',bg:'magenta',size:{h:.2},prompt:'tools/art-library/prompts/stage-rose-backuplamby-v1.txt'}}};

// ----- Cozy Rosie -----
// Basic. New body. Accents only: a thud on the bonk, then PAT PAT over the family member who is hurt most.
B3_STAGE.pocket_pretzel_and_pat={v:1,tier:'basic',budget:2.7,
  body:{clip:'rose_pretzel',job:'rose-pretzel',keep:false,marks:{bonk:{f:.35},pretzel:{f:.55}}},
  hit:'bonk',
  steps:[{at:'bonk',do:'sfx',sfx:'thud'},{at:'bonk',do:'shake',amp:2,dur:.15},
    {at:'pretzel',do:'words',text:'PAT PAT',where:'over:ally',size:2,color:'#ffe9b0',hold:.9},{at:'pretzel',do:'sfx',sfx:'ding'}],
  assets:{}};

// Skill 1. New body (a toss, two tackle lunges, a catch). One stage element: Lamby flies out, stays stuck on the monster, and comes home.
B3_STAGE.tattered_lamby_boomerang={v:1,tier:'s1',budget:3.5,
  body:{clip:'rose_boomerang',job:'rose-boomerang',keep:false,marks:{throw:{f:.23},lunge:{f:.44},catch:{f:.75}}},
  hit:'toss',
  steps:[{id:'toss',at:'throw',do:'fly',asset:'rose/lamby',from:'hand',to:'target',arc:30,spin:3,dur:.45,hit:true},
    {at:{step:'toss',plus:.45},do:'foe',react:'squash'},{at:'throw',do:'sfx',sfx:'whoosh'},
    {at:'lunge',do:'sfx',sfx:'thud'},{at:'catch',do:'sfx',sfx:'ding'}],
  lasting:[{while:'lamby_stuck',on:'carrier',do:'hover',asset:'rose/lamby',amp:3,rate:1,enter:{at:{step:'toss',plus:.45},dur:.2},
    exit:{do:'fly',to:'self',dur:.4}}],
  assets:{'rose/lamby':{kind:'prop',bg:'magenta',size:{h:.2},prompt:'tools/art-library/prompts/stage-rose-lamby-v1.txt'}}};

// Skill 2. New body. Bigger and lasting: a wall of cushions and blankets rises around every family member while the fort lasts.
B3_STAGE.sofa_cushion_citadel={v:1,tier:'s2',budget:4.3,
  body:{clip:'rose_citadel',job:'rose-citadel',keep:false,marks:{lift:{f:.25},sweep:{f:.5}}},
  hit:'late',late:'sweep',
  steps:[{at:'lift',do:'sfx',sfx:'charge'},{at:'sweep',do:'sfx',sfx:'thud'},
    {at:'sweep',do:'words',text:'FORT TIME!',where:'over:each_ally',size:2,color:'#ffe9b0',hold:1.2}],
  lasting:[{while:'pillow_fort',on:'carrier',do:'place',asset:'rose/cushionwall',side:'front',enter:{at:'sweep',from:'behind',dur:.5},
    exit:{do:'cross',to:'screen_right',lane:'floor',dur:.4}}],
  assets:{'rose/cushionwall':{kind:'prop',bg:'magenta',size:{h:.5},prompt:'tools/art-library/prompts/stage-rose-cushionwall-v1.txt'}}};

// Capstone. New body. Set piece: the night goes starlit, a blanket castle rises, warmth for the family.
B3_STAGE.kingdom_of_ten_thousand_blankets={v:1,tier:'cap',budget:7.1,
  body:{clip:'rose_kingdom',job:'rose-kingdom',keep:false,marks:{wonder:{f:.2},raise:{f:.5},hold:{f:.7}}},
  hit:'late',late:'raise',
  setpiece:{dur:7.1,dim:.75,steps:[
    {at:0,do:'dim',amount:.75,in:.4},
    {at:'wonder',do:'sfx',sfx:'charge'},
    {id:'rise',at:'raise',do:'drop',asset:'rose/castle',onto:'screen_center',dur:.7},
    {at:{step:'rise',plus:.7},do:'sfx',sfx:'thud'},{at:{step:'rise',plus:.7},do:'shake',amp:3,dur:.3},
    {at:{step:'rise',plus:.9},do:'flash',color:'#ffd27a',dur:.5},{at:{step:'rise',plus:.9},do:'sfx',sfx:'ding'},
    {at:{step:'rise',plus:1.2},do:'words',text:'LONG LIVE THE BLANKET KINGDOM',where:'screen_center',size:3,color:'#ffe9b0',hold:1.8},
    {at:6.5,do:'dim',amount:0,out:.5}]},
  lasting:[{while:'blanket_castle',on:'self',do:'glow',color:'#ffd27a'}],
  assets:{'rose/castle':{kind:'prop',bg:'magenta',size:{sw:.55},prompt:'tools/art-library/prompts/stage-rose-castle-v1.txt'}}};

// ----- Prankster -----
// Basic. New body. Accent only: BOOP over the monster, a squash, a tiny ding.
B3_STAGE.sneaky_nose_boop={v:1,tier:'basic',budget:2.5,
  body:{clip:'rose_boop',job:'rose-boop',keep:false,marks:{boop:{f:.4}}},
  hit:'boop',
  steps:[{at:'boop',do:'words',text:'BOOP!',where:'over:target',size:2,color:'#ffb3d9',hold:.8},{at:'boop',do:'sfx',sfx:'ding'},
    {at:'boop',do:'foe',react:'squash'}],
  assets:{}};

// Skill 1. New body. One stage element: pink sound rings roll out of her mouth into the monster.
B3_STAGE.supersonic_raspberry={v:1,tier:'s1',budget:3.3,
  body:{clip:'rose_raspberry',job:'rose-raspberry',keep:false,marks:{blow:{f:.44}}},
  hit:'blow',
  steps:[{id:'blow',at:'blow',do:'fly',asset:'rose/ripple',from:'self_front',to:'target',dur:.4,blend:'add',hit:true},
    {at:'blow',do:'sfx',sfx:'whoosh'},{at:{step:'blow',plus:.4},do:'words',text:'PBBBBBT!',where:'over:target',size:3,color:'#ffb3d9',hold:1.0},
    {at:{step:'blow',plus:.4},do:'shake',amp:4,dur:.3},{at:{step:'blow',plus:.4},do:'foe',react:'knock',px:14}],
  assets:{'rose/ripple':{kind:'prop',bg:'black',size:{h:.4},prompt:'tools/art-library/prompts/stage-rose-ripple-v1.txt'}}};

// Skill 2. New body. Bigger and lasting: Backup Lamby sits as bait in front of her while she is hidden (the leap out next turn is a later card).
B3_STAGE.backup_lamby_bait_and_switch={v:1,tier:'s2',budget:4.3,
  body:{clip:'rose_baitswitch',job:'rose-baitswitch',keep:false,marks:{place:{f:.25},peek:{f:.5}}},
  hit:'late',late:'place',
  steps:[{at:'place',do:'sfx',sfx:'thud'},{at:'peek',do:'words',text:'SHHHH...',where:'over:self',size:2,color:'#ffe9b0',hold:1.2}],
  lasting:[{while:'lamby_hide',on:'self',do:'place',asset:'rose/backuplamby',side:'front',enter:{at:'place',from:'above',dur:.3},
    exit:{do:'fly',to:'top',dur:.35}}],
  assets:{'rose/backuplamby':{kind:'prop',bg:'magenta',size:{h:.2},prompt:'tools/art-library/prompts/stage-rose-backuplamby-v1.txt'}}};

// Capstone. New body. Set piece: a giant whoopee cushion slides under every monster, the whole field goes PBBBBBT.
B3_STAGE.mega_whoopee_cushion_trap={v:1,tier:'cap',budget:7,
  body:{clip:'rose_whoopee',job:'rose-whoopee',keep:false,marks:{slide:{f:.25},brace:{f:.45},pose:{f:.82}}},
  hit:'splat',
  setpiece:{dur:7,dim:.6,steps:[
    {at:0,do:'dim',amount:.6,in:.4},
    {at:'slide',do:'sfx',sfx:'whoosh'},
    {id:'slide',at:'slide',do:'cross',asset:'rose/whoopee',from:'screen_left',to:'screen_right',lane:'foes',dur:1.0},
    {id:'splat',at:{step:'slide',plus:1.6},do:'drop',asset:'rose/whoopee',onto:'each_target',dur:.25,hit:true},
    {at:{step:'splat',plus:.25},do:'sfx',sfx:'thud'},{at:{step:'splat',plus:.25},do:'flash',color:'#ffd0ec',dur:.35},{at:{step:'splat',plus:.25},do:'shake',amp:7,dur:.7},
    {at:{step:'splat',plus:.25},do:'foe',react:'knock',px:32},
    {at:{step:'splat',plus:.5},do:'words',text:'PBBBBBBBBT!',where:'screen_center',size:4,color:'#ffb3d9',hold:1.6},
    {at:'pose',do:'words',text:'MASTER OF MISCHIEF',where:'over:self',size:2,color:'#fff1cb',hold:1.2},
    {at:6.4,do:'dim',amount:0,out:.5}]},
  assets:{'rose/whoopee':{kind:'prop',bg:'magenta',size:{sw:.35},prompt:'tools/art-library/prompts/stage-rose-whoopee-v1.txt'}}};
