'use strict';
// data/maps-le.js — Long Island as content: buildings, people's colors, the three outdoor areas and every room.
// Built into maps by engine/world.js (buildArea, makeRoom). Loaded before engine/world.js. LA lives in data/maps-la.js.
//
// AREA SPEC (outdoor map). Steps are applied in this order, so later steps win on the same tile:
//   id, name, w, h       map id (used by doors and saves), name shown on screen, size in tiles
//   region, ground       'la' for Los Angeles maps (LE leaves it out); ground = LA ground style ('city','lawn','dry')
//   tag, eyebrow, hint   area card texts;  spawn {x,y};  wild:true where monsters live
//   paths    [[x0,y0,x1,y1],...]  path rectangles (inclusive)
//   tiles    [{tile,rects}]       other walkable ground rectangles (e.g. 'road')
//   houseRoad [a,b]               every building whose `area` is this map gets a door and a path from the door down to
//                                 row a (buildings above row 10) or row b (the rest); a single number means always that row
//   border   {kind,open}          a wall of `kind` objects round the edge, except the `open` tiles
//   exits    [[x,y,to,sx,sy,facing,tile]]  edge openings: step on x,y to go to map `to` at sx,sy facing `facing`
//   pools    [{tile,cells,shore}] solid ground (water, tar) with an optional shore tile ringing it (only over grass)
//   patches  [{tile,cells}]       ground patches laid only over grass (mud)
//   objects  in order: [kind,x,y,w,h,name,text,extra] or a group {kind,at:[[x,y],...],name,text,extra}
//   npcs     [{name,x,y,look,lines,when,...}]   look = a palettes key; anything else is copied onto the actor
//   monsters [[monsterId,x,y],...]  (from data/monsters.js)
//
// ROOM SPEC (interior; id = a building id below): w,h, style, plan (ASCII, '#' wall), walls [[x,y]], door [x,y]
//   (default bottom middle), rug [x,y,w,h], rugs [{x,y,w,h,color}], zones, npcs (as above, they roam a little), objects.
//
// DIALOGUE THAT CHANGES WITH THE STORY. Any npc or object can carry `when`: a list of variants, checked top to bottom;
// the first one that matches replaces the field it names (lines, revisit, text, restoreText). Conditions in a variant:
//   chapter: 3 or [3,7] (inclusive range)   from: 3   until: 7   mode: 'full' | 'demo'
//   flag: 'met-nara' | ['a','b'] (all set) | {'battle:bigone':'win'} (exact values)   notFlag: 'x' | ['x','y']
//   test: S=>boolean (S is STORY)
//   Example:  {name:'Dot',...,lines:[...],when:[{flag:'battle:bigone',lines:['You beat The Big One? I counted the cheers.']}]}
// Family members also have `revisit` (one line is picked on later visits) and Deedee has `hug` (when hurt / when not).

const LE_PALETTES={
  player:{skin:'#efbc8e',hair:'#6b4a33',beard:'#5b3f2e',shirt:'#262630',pants:'#3b4057',hat:null,bald:true},
  pip:{skin:'#e8b48e',hair:'#735044',shirt:'#ca7c75',pants:'#626d7d',hat:'#ecd29b'},
  moss:{skin:'#bc8c69',hair:'#453b37',shirt:'#7f9b77',pants:'#716758',hat:'#b2bf86'},
  dot:{skin:'#f0caaa',hair:'#626175',shirt:'#a595b8',pants:'#63798c',hat:null},
  gus:{skin:'#c69878',hair:'#e3dac2',shirt:'#c9975f',pants:'#667e78',hat:'#6d8e9a'},
  bean:{skin:'#9e7056',hair:'#3e3635',shirt:'#82a7aa',pants:'#77748e',hat:null},
  bun:{skin:'#efc4a0',hair:'#754e3c',shirt:'#d29278',pants:'#776854',hat:'#f5e7c7'},
  page:{skin:'#c18c68',hair:'#46413f',shirt:'#9d87ac',pants:'#5f6474',hat:null},
  fern:{skin:'#eac29b',hair:'#925f42',shirt:'#8ca275',pants:'#6c715c',hat:'#dac487'},
  kit:{skin:'#b87d5e',hair:'#433b3a',shirt:'#83a5b0',pants:'#5a6c85',hat:'#7394ae'},
  oolong:{skin:'#edbe98',hair:'#d9d5c4',shirt:'#beaa71',pants:'#856976',hat:null},
  luna:{skin:'#b48e79',hair:'#514b60',shirt:'#8492b7',pants:'#625c76',hat:'#aaa1c3'},
  penny:{skin:'#e7b48f',hair:'#b8452f',shirt:'#e2b04a',pants:'#5d5a70',hat:null},
  sal:{skin:'#c99372',hair:'#3e3433',shirt:'#e7b73e',pants:'#3c3f4c',hat:'#2c2c33'},
  reel:{skin:'#d9a27e',hair:'#9a9488',shirt:'#5f7d5a',pants:'#5a5048',hat:'#c9a85a'},
  // Chapter 5: Long Island Elementary.
  pruitt:{skin:'#e3b28e',hair:'#cfc8bc',shirt:'#4a5a8a',pants:'#3b3f4c',hat:null},
  kowalski:{skin:'#f0c8a8',hair:'#c9853a',shirt:'#d65a8a',pants:'#4a4f68',hat:null},
  ike:{skin:'#b88a6a',hair:'#e8e4dc',shirt:'#8a6a48',pants:'#5a5048',hat:'#4a5a3a'},
  halverson:{skin:'#d9a27e',hair:'#5a4030',shirt:'#e8e0c8',pants:'#5a6a7a',hat:null},
  delgado:{skin:'#b98a62',hair:'#2b2422',shirt:'#3a7a6a',pants:'#3a3f4c',hat:null},
  longcoat:{skin:'#d8b490',hair:'#2b2422',shirt:'#3a3428',pants:'#2b2a26',hat:'#2b2a26'}
};

// Buildings. `area` is the outdoor map the door is on; x,y,w,h its footprint. The door is the bottom middle tile.
const LE_HOUSES=[
  {id:'bakery',area:'town',name:'Crumb Bakery',label:'CRUMB',x:2,y:3,w:5,h:5,roof:'#be7051',light:'#dc9264',wall:'#efd3a0'},
  {id:'library',area:'town',name:'The Hush Library',label:'BOOKS',x:9,y:3,w:5,h:5,roof:'#8d7293',light:'#ad8ba7',wall:'#e8ddbd'},
  {id:'greenhouse',area:'town',name:'Sprout House',label:'SPROUT',x:16,y:3,w:5,h:5,roof:'#568879',light:'#9bcab3',wall:'#c0d7b1'},
  {id:'post',area:'town',name:'Snail Mail',label:'POST',x:2,y:14,w:5,h:5,roof:'#618697',light:'#83a7b2',wall:'#ebdcc0'},
  {id:'tea',area:'town',name:'Kettle Cottage',label:'KETTLE',x:9,y:14,w:5,h:5,roof:'#b28d4e',light:'#d1b26c',wall:'#e8c3ac'},
  {id:'observatory',area:'town',name:'Moon Club',label:'MOON',x:16,y:14,w:5,h:5,roof:'#657898',light:'#8b9cba',wall:'#d6d9d4'},
  {id:'taxi',area:'town',name:'Long Island Taxi Co.',label:'TAXI',x:23,y:14,w:5,h:5,roof:'#d9a43a',light:'#f2c75a',wall:'#efe4cb',taxi:true},
  {id:'shop',area:'town',name:"Penny's Pockets",label:'SHOP',x:23,y:3,w:5,h:5,roof:'#b9483f',light:'#d9675b',wall:'#f3e3bf',shop:true},
  {id:'amyhouse',area:'row',x:7,y:3,name:"Amy's House",label:'GREGORI',w:5,h:5,roof:'#c0707e',light:'#dc9aa5',wall:'#f0e2d6'},
  {id:'grands',area:'row',x:16,y:3,name:"Deedee and Boppy's House",label:'RIVITUSO',w:5,h:5,roof:'#8d7b63',light:'#b59e82',wall:'#ead9b8'},
  {id:'elliehouse',area:'row',x:9,y:11,name:"Aunt Ellie's House",label:'ELLIE',w:5,h:5,roof:'#6e4a7e',light:'#9a76a8',wall:'#eadcea'}
];

// Areas drawn as an ASCII plan (chapter 3 on): one character per tile, turned into pools, tiles, patches and objects.
// '~' water (solid), '=' boards (a wooden pier or boardwalk; walkable, drawn over water by engine/marsh-render.js),
// '#' path, ',' mud, 'c' cattails (solid), 'r' a wall of reeds (solid), anything else grass. Edges come from `border`.
function planArea(plan,objText={}) {
  const water=[],mud=[],boards=[],path=[],objs=[];
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='~') water.push([x,y]); else if(c===',') mud.push([x,y]);
    else if(c==='=') boards.push([x,y,x,y]); else if(c==='#') path.push([x,y,x,y]);
    else if(c==='c') objs.push(['cattail',x,y,1,1,objText.c?objText.c[0]:'Cattails',objText.c?objText.c[1]:'Tall cattails, swaying. Something small rustles inside.']);
    else if(c==='r') objs.push(['reedwall',x,y,1,1,objText.r?objText.r[0]:'Thick reeds',objText.r?objText.r[1]:'A wall of reeds, taller than Tom. There\'s no way through here.']); } });
  return {paths:path,tiles:[{tile:'boards',rects:boards}],pools:[{tile:'water',cells:water}],patches:[{tile:'mud',cells:mud}],objects:objs};
}
// An area spec built from a base spec, a planArea() result and extra fields (extra objects are added after the plan's).
const planMerge=(base,parts,extra={})=>Object.assign({},base,parts,extra,{objects:[...parts.objects,...(extra.objects||[])]});
// Chapter 5 interiors drawn as an ASCII plan (engine/school-render.js draws them). 'W' a wall (solid; it shows its
// painted face when there is floor below it), 'X' dark void outside the building (solid), '.' hallway linoleum,
// 'a' art room floor, 'm' music room carpet, 'g' gym floor, 's' staff room carpet, 'P' the Cafetorium stage, 'F' the
// Cafetorium floor. Exits must sit on floor characters (pools are laid after exits).
const SCHOOL_TILES={'.':'lino',a:'artfloor',m:'carpet',g:'gymwood',s:'staffrug',P:'stagewood',F:'cafefloor'};
function planSchool(plan) {
  const walls=[],voids=[],floors={};
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='W') walls.push([x,y]); else if(c==='X') voids.push([x,y]);
    else if(SCHOOL_TILES[c]) (floors[SCHOOL_TILES[c]]=floors[SCHOOL_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),pools:[{tile:'swall',cells:walls},{tile:'void',cells:voids}],objects:[]};
}
// ---------- Outdoor areas: The Square (shops), Rivituso Row (homes, south), Grump Hollow (monsters, north) ----------
const LE_AREAS=[
  {id:'town',name:'The Square',w:30,h:26,
    tag:'Eight doors, one fountain, one place that sells things.',
    eyebrow:'LONG ISLAND / THE SQUARE',
    hint:"Shops up here, Penny's Pockets to the east. Family south. Trouble north.",
    spawn:{x:11,y:10},
    paths:[[2,9,29,10],[2,20,27,21],[7,0,8,21],[14,9,15,25],[9,9,13,12]],
    houseRoad:[10,21],
    border:{kind:'tree',open:[[7,0],[8,0],[14,25],[15,25],[29,9],[29,10]]},
    exits:[[7,0,'hollow',9,20,'up'],[8,0,'hollow',10,20,'up'],[14,25,'row',12,1,'down'],[15,25,'row',13,1,'down'],
      [29,9,'schoolyard',1,8,'right'],[29,10,'schoolyard',1,9,'right']],
    // Chapter 1: a fallen branch closes the way north until Deedee's crisp is stolen (engine/story.js storyGate).
    gates:[{at:[[7,0],[8,0]],cond:{chapter:1,notFlag:'ch1-theft'},name:'Fallen branch',
      lines:['A big branch has fallen across the path to Grump Hollow.','Grace pulls on Tom’s sleeve. "Crisp first, Tata. Monsters later."']},
      // The path east to Long Island Elementary (chapter 5) is locked until conference night.
      {at:[[29,9],[29,10]],look:'schoolgate',cond:{test:S=>S.chapter<5||(S.chapter===5&&!S.flags['ch5-goal'])},name:'School gate',
        lines:['The path east goes to Long Island Elementary. The gate is locked.','A sign on it: NO SCHOOL TODAY. Grace says it\'s the best sign in the whole town.'],
        when:[{chapter:5,lines:['The path east goes to Long Island Elementary. The gate is locked.','Amy has the key. Amy has every key.']}]}],
    objects:[
      {kind:'tree',at:[[1,2],[14,2],[21,2],[22,4],[1,6],[14,7],[22,7],[2,11],[5,12],
        [17,11],[19,12],[21,11],[20,13],[1,15],[14,18],[21,16],[1,21],[6,22],[17,22],[20,22],[3,23],[10,23],[19,23],[12,24],
        [23,12],[28,11],[28,16],[28,19],[24,23],[27,22],[22,24],[28,24]]},
      {kind:'fence',at:[[3,1],[4,1],[5,1],[16,1],[17,1],[18,1],[19,1],[20,1],[23,1],[24,1],[25,1],[26,1],[27,1]]},
      {kind:'fence',at:[[2,22],[3,22],[4,22],[5,22],[10,22],[11,22],[12,22],[13,22]]},
      ['sign',10,12,1,1,'Town notice',"Eight doors. One of them actually sells things: Penny's Pockets, east end. Look for the coin."],
      ['sign',6,1,1,1,'North signpost','GRUMP HOLLOW, this way. Mind the mud. Mind the Grump. Mostly the Grump.'],
      ['sign',16,24,1,1,'South signpost','RIVITUSO ROW, this way. Cookies likely. Quiet unlikely.'],
      ['fountain',12,11,1,1,'Wish fountain','A coin reads: "Please don\'t wish for more coins."'],
      ['bench',3,12,2,1,'An important bench','Reserved for people with very important sitting to do.'],
      ['bench',18,10,2,1,'The sunny bench','Warm from the sun. Or from Gus. Hard to say.'],
      ['planter',17,13,2,1,'Square flowers','Planted by Fern. Each one is named Steve.'],
      ['sign',22,11,1,1,'Shop sign',"PENNY'S POCKETS. Gear for the whole family. Snacks for fights. We buy almost anything.",{shopSign:true}],
      ['taxi',26,19,2,1,'Cab 7','The only cab in town. The meter is still running. Tom is choosing not to look at it.'],
      ['planter',27,8,1,1,'Shop flowers','A pot of marigolds with a price tag on it. Not for sale. Penny checked.'],
      ['sign',28,8,1,1,'East signpost','LONG ISLAND ELEMENTARY, this way. Home of the Fighting Snails. Go Snails.']],
    npcs:[
      {name:'Pip',x:3,y:10,look:'pip',lines:[
        "I'm taking my pet rock for a walk.",
        "He's shy. Please don't make eye contact.",
        "Excellent. He's already learned 'stay'."]},
      {name:'Moss',x:8,y:13,look:'moss',lines:[
        'I asked a tree for directions.',
        'It said nothing. Very mysterious.',
        "I think I'm barking up the wrong tree."]},
      {name:'Dot',x:16,y:9,look:'dot',lines:[
        'This town has ten doors and two gaps in the trees.',
        "I've counted them seventeen times.",
        "Tomorrow I'm moving on to windows."],
        when:[{from:5,lines:['Ten doors and THREE gaps in the trees now. Somebody opened one by the school.','I had to start all over. I\'m at four hundred and six.']},
              {chapter:1,flag:'ch1-tin',lines:['You got the tin back? Ten doors, two gaps, one pie tin. All accounted for.']},
              {chapter:1,flag:'ch1-theft',lines:['A mud blob ran through the Square with a pie tin. One blob. One tin. I counted.','It went north. Into the gap in the trees. Gap number one.']}]}]},

  {id:'row',name:'Rivituso Row',w:24,h:22,
    tag:"Three houses. One family. Cookies at Deedee's. Opinions at Ellie's.",
    eyebrow:'LONG ISLAND / RIVITUSO ROW',
    hint:'Home. Knock on any door. Someone will feed you.',
    spawn:{x:12,y:2},
    // Painted plate (art/row.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    plateMask:[
      '############..##########',
      '############..##########',
      '############..##########',
      '############..##########',
      '############..##########',
      '############..##########',
      '############..##########',
      '########...#..####.#####',
      '######.............#####',
      '######.##..#.......#####',
      '######..######..########',
      '##......######...#######',
      '#####..########......###',
      '#####..#############...#',
      '#####..##############..#',
      '#####..####.#######...##',
      '######................##',
      '###########...##########',
      '###########...##########',
      '###########...##########',
      '###########...##########',
      '###########...##########'],
    // Ellie's plaza (row 16) joins the west path and the east garden loop, so Ellie's door and the south path have two ways in.
    // NPCs never wander onto the plaza strip, so nobody can plug it (tools/reach_test.py checks this).
    noGo:[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(x=>[x,16]),
    houseRoad:8,
    border:{kind:'tree',open:[[12,0],[13,0],[11,21],[12,21]]},
    exits:[[12,0,'town',14,24,'up'],[13,0,'town',15,24,'up'],[11,21,'pier',11,1,'down'],[12,21,'pier',12,1,'down']],
    // The path south to Cattail Pier (chapter 3) stays closed until Boppy takes everyone fishing.
    gates:[{at:[[11,21],[12,21]],cond:{test:S=>S.chapter<3||(S.chapter===3&&!S.flags['ch3-boppy'])},name:'Pier path',
      lines:['A sign on the fallen branch: CATTAIL PIER. CLOSED FOR THE SEASON. The fish need a break.'],
      when:[{chapter:3,lines:['The path south goes to Cattail Pier.','Going fishing without Boppy? He\'d never, ever let you hear the end of it.']}]}],
    objects:[
      ['sign',14,1,1,1,'Row signpost',"THE SQUARE, back that way. Shops, fountain, Pip's rock."],
      ['sign',15,17,1,1,'Pier signpost','CATTAIL PIER, south. Catch and release. Mostly release.'],
      ['sign',7,9,2,1,'Family notice',"Rivituso Row. Cookies at Deedee's. Juice at Amy's. Opinions at Ellie's. Peace and quiet at nobody's."],
      ['sign',7,7,1,1,'Chalk drawings',"Grace and Rose's chalk drawings cover the path. Step around the sunshine. Step carefully. Step colorfully."],
      ['bench',3,10,3,1,'The other bench','Boppy sat here once in 2019. It\'s still his.'],
      ['planter',19,8,3,1,"Deedee's tomatoes",'Forty tomatoes. You\'ll be sent home with all of them.'],
      ['planter',21,12,2,1,"Boppy's peppers",'A pepper so hot the garden hose flinched. Boppy is proud.'],
      ['planter',4,12,1,1,"Deedee's herb bed","Basil, mint and rosemary. Deedee says the rosemary is for Boppy's stomach. Boppy disagrees."],
      ['planter',2,10,1,1,'Community garden',"Squash, beans, a sunflower Grace planted, a rock Rose planted, and a scarecrow wearing Boppy's old cap. The scarecrow walks too fast, apparently."]],
    npcs:[
      {name:'Gus',x:4,y:11,look:'gus',lines:[
        "I'm training for the annual sit-down.",
        'My coach is a bench.',
        'We have a very supportive relationship.']},
      {name:'Bean',x:13,y:19,look:'bean',lines:[
        "I'm not lost. I'm collecting wrong turns.",
        'That pond up north owes me an apology.',
        'Long story. Short socks.'],
        when:[{chapter:1,flag:'ch1-theft',notFlag:'ch1-tin',lines:['A mud blob just ran past me carrying a pie.','I didn\'t stop it. I collect wrong turns, not pies.']},
              {chapter:3,flag:'ch3-boppy',lines:['Boppy went by with a fishing rod and a jar of peppers.','He was walking slower than me. Nobody walks slower than me. I collect slow walks too, now.']}]}]},

  {id:'hollow',name:'Grump Hollow',w:24,h:22,
    tag:'Soggy. Smelly. Six things are watching from the pond.',
    eyebrow:'LONG ISLAND / GRUMP HOLLOW',
    hint:'Monsters live here. Mudling is easy. The Big One isn\'t.',
    spawn:{x:9,y:19},
    wild:true,
    // Painted plate (art/hollow.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    plateMask:[
      '########################',
      '########################',
      '#####..#################',
      '######..################',
      '######..################',
      '######....##############',
      '######..################',
      '######...###############',
      '######...###############',
      '######...###############',
      '########..##############',
      '#######.......##....####',
      '#######.......##....####',
      '######............######',
      '##..........####....#..#',
      '###...###...#####.....##',
      '#########...######...###',
      '#########...############',
      '#########...############',
      '#########...############',
      '#########...############',
      '#########..#############'],
    border:{kind:'tree',open:[[9,21],[10,21]]},
    exits:[[9,21,'town',7,1,'down'],[10,21,'town',8,1,'down']],
    pools:[{tile:'water',shore:'mud',cells:[[11,3],[12,3],[13,3],[14,3],[15,3],[16,3],[17,3],[18,3],[19,3],[10,4],[11,4],[12,4],[13,4],[14,4],[15,4],[16,4],[17,4],[18,4],[19,4],[20,4],[21,4],[22,4],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5],[19,5],[20,5],[21,5],[22,5],[10,6],[11,6],[12,6],[13,6],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6],[20,6],[21,6],[22,6],[10,7],[11,7],[12,7],[13,7],[14,7],[15,7],[16,7],[17,7],[18,7],[19,7],[20,7],[21,7],[22,7],[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],[16,8],[17,8],[18,8],[19,8],[20,8],[21,8],[22,8],[10,9],[11,9],[12,9],[13,9],[14,9],[15,9],[16,9],[17,9],[18,9],[19,9],[20,10],[21,10],[22,10]]}],
    objects:[
      ['sign',6,12,1,1,'Crooked sign','GRUMP HOLLOW. Trespassers will be squelched. Start with the Mudling. Save the fish for last.'],
      ['sign',9,4,1,1,'Pond sign','NO SWIMMING. The pond signed this itself.'],
      ['bench',2,12,4,2,'Soggy bench','Nobody has sat here since the Grump moved in. The bench misses company.'],
      ['bench',18,13,4,1,"Boppy's fishing spot",'A thermos, a bucket, zero fish. Boppy swears the big one lives here.'],
      ['sign',15,11,1,1,'Warning stake','THE GRUMP IS NOT A FROG. It\'d like that noted.']],
    npcs:[],
    monsters:MONSTER_SPOTS},

  // ---------- Chapter 3: Cattail Pier (south of Rivituso Row) and the Whispering Marsh (west of the pier) ----------
  planMerge({id:'pier',name:'Cattail Pier',w:24,h:22,
    tag:'One pier, one bait shack, one fish that nobody has ever caught.',
    eyebrow:'LONG ISLAND / CATTAIL PIER',
    hint:'Boppy fishes at the end of the pier. The marsh is west.',
    spawn:{x:11,y:1},
    // Painted plate (art/pier.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks. Dirt road from the north and west,
    // the bait shack to the east, the boardwalk south to the platform at its end. Water, reeds, trees and rocks block.
    plateMask:[
      '###########..###########',
      '###########...##########',
      '############..##########',
      '#####..#####..##########',
      '####.....###..##########',
      '...###................##',
      '...........#..####..####',
      '############..##########',
      '############..##########',
      '############..##########',
      '###########...##########',
      '###########...##########',
      '##########.....#########',
      '########################',
      '########################',
      '########################',
      '########################',
      '########################',
      '########################',
      '########################',
      '########################',
      '########################'],
    border:{kind:'tree',open:[[11,0],[12,0],[0,5],[0,6]]},
    exits:[[11,0,'row',11,20,'up'],[12,0,'row',12,20,'up'],[0,5,'reeds',24,13,'left'],[0,6,'reeds',24,14,'left']],
    npcs:[
      {name:'Reel',x:19,y:5,look:'reel',lines:[
        'Bait shack is open. Worms, minnows, and a sandwich I\'m not selling.',
        'Your father has been fishing this pier since before the pier. He has caught nothing. Very consistent.',
        'They say a catfish lives out there older than the boards. I say they say a lot.'],
        when:[{from:3,flag:'ch3-clear',lines:['Your father caught Old Iron-Gill? And let him GO? Forty years of telling that story, and now it\'s true.','He came by the shack this morning. The fish, not your father. Just floated there. I think he wanted to say hello.']},
              {chapter:3,flag:'ch3-jar',lines:['You saw it? Old Iron-Gill? Forty years I have run this shack. I thought it was a story.','It went west, into the marsh. The Whispering Marsh. The reeds talk out there. Mostly nonsense.']}]}]},
    planArea([
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT']),
    {objects:[
      ['shack',17,1,5,4,'Bait shack','REEL\u2019S BAIT. WORMS. MINNOWS. ADVICE (FREE, UNWANTED).'],
      ['sign',14,3,1,1,'Pier sign','CATTAIL PIER. Catch and release. Please release the dock master.'],
      ['bench',7,3,2,1,'Boppy\u2019s bench','Carved into the seat: BOPPY 1994. Under it: STILL NOTHING 2006.'],
      ['tacklebox',10,11,1,1,'Tackle box','Boppy\u2019s spare tackle box. Hooks, sinkers, and a very old granola bar.']]}),
  planMerge({id:'reeds',name:'Whispering Marsh',w:26,h:23,
    tag:'Boardwalks, cattails, and reeds that whisper. Mostly nonsense.',
    eyebrow:'LONG ISLAND / WHISPERING MARSH',
    hint:'Monsters live here. Iron-Gill went deeper in, toward the old reeds.',
    spawn:{x:24,y:13},
    wild:true,
    // Painted plate (art/reeds.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks. The marsh is one long route:
    // the east platform (from the pier), the long boardwalk west, the zigzag north, then the dirt path up to the old reeds.
    plateMask:[
      '###..#####################',
      '###..#####################',
      '###..#####################',
      '###...####################',
      '###.....##################',
      '#####..###################',
      '####.....#################',
      '#######..#################',
      '########...###############',
      '##########.#############..',
      '##########.############...',
      '##########...###########..',
      '##########................',
      '#######################...',
      '#######################...',
      '##########################',
      '##########################',
      '##########################',
      '##########################',
      '##########################',
      '##########################',
      '##########################',
      '##########################'],
    // The gap at the top left (x 3 and 4) is filled with old reeds until the Snag moves (data/scenes.js ch3OpenReeds).
    border:{kind:'tree',open:[[25,13],[25,14],[3,0],[4,0]]},
    exits:[[25,13,'pier',1,5,'right'],[25,14,'pier',1,6,'right'],[3,0,'sundial',10,18,'up','mud'],[4,0,'sundial',11,18,'up','mud']],
    monsters:MARSH_MONSTER_SPOTS},
    planArea([
      '~~~,,~~~~~~~~~~~~~~~~~~~~~',
      '~~~,,~~~~~~~~~~~~~~~~~~~~~',
      '~~~,,~~~~~~~~~~~~~~~~~~~~~',
      '~~~,,,~~~~~~~~~~~~~~~~~~~~',
      '~~~,,,,,~~~~~~~~~~~~~~~~~~',
      '~~~~~==~~~~~~~~~~~~~~~~~~~',
      '~~~~=====~~~~~~~~~~~~~~~~~',
      '~~~~~~~==~~~~~~~~~~~~~~~~~',
      '~~~~~~~~===~~~~~~~~~~~~~~~',
      '~~~~~~~~~~=~~~~~~~~~~~~~,,',
      '~~~~~~~~~~=~~~~~~~~~~~~,,,',
      '~~~~~~~~~~===~~~~~~~~~~~,,',
      '~~~~~~~~~~================',
      '~~~~~~~~~~~~~~~~~~~~~~~===',
      '~~~~~~~~~~~~~~~~~~~~~~~===',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~']),
    {objects:[
      ['reedwall',3,1,1,1,'The old reeds','The reeds close in here, taller than the trees. Iron-Gill\u2019s wake goes on through them, deeper into the marsh.'],
      ['reedwall',4,1,1,1,'The old reeds','The reeds close in here, taller than the trees. Iron-Gill\u2019s wake goes on through them, deeper into the marsh.'],
      ['reedwall',3,2,1,1,'The old reeds','The reeds close in here, taller than the trees. Iron-Gill\u2019s wake goes on through them, deeper into the marsh.'],
      ['reedwall',4,2,1,1,'The old reeds','The reeds close in here, taller than the trees. Iron-Gill\u2019s wake goes on through them, deeper into the marsh.'],
      ['sign',6,3,1,1,'Rotten signpost','SUNDIAL HOLLOW. Beyond the old reeds. The letters have been scratched over: DO NOT BE LATE.'],
      ['sign',22,10,1,1,'Marsh sign','WHISPERING MARSH. The reeds talk. Don\'t answer them. It only encourages them.']]}),
  // Chapter 3 (C3b): Sundial Hollow, through the old reeds at the top left of the marsh. A clearing with a sundial that
  // tells the wrong time, a spillway (rows 8 and 9, painted as a water band with one stepping-stone crossing at x 13) that
  // drains once the coin is out of the sundial, and the Deep Pool above it, where Old Iron-Gill lives. The spillway opens
  // in data/scenes.js (ch3DrainSpillway, using drainOpen below).
  {id:'sundial',name:'Sundial Hollow',w:22,h:20,
    tag:'A sundial that tells the wrong time, and a pool nobody has seen the bottom of.',
    eyebrow:'LONG ISLAND / SUNDIAL HOLLOW',
    hint:'The sundial is in the middle. The Deep Pool is past the spillway, at the top.',
    spawn:{x:10,y:18},
    wild:true,
    // Painted plate (art/sundial.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    plateMask:[
      '######################',
      '######################',
      '######################',
      '######################',
      '##########....########',
      '#########.....########',
      '########......########',
      '#########......#######',
      '######################',
      '######################',
      '########........######',
      '####.......##......###',
      '###.......###.......##',
      '#######...###.......##',
      '#########......#######',
      '###....##......#######',
      '#####...........######',
      '#####...........######',
      '##########.....#######',
      '##########..##########'],
    drainOpen:[[13,8],[13,9]],
    border:{kind:'tree',open:[[10,19],[11,19]]},
    exits:[[10,19,'reeds',3,1,'down','mud'],[11,19,'reeds',4,1,'down','mud']],
    monsters:SUNDIAL_MONSTER_SPOTS,
    objects:[
      ['sundial',11,12,2,2,'The sundial','A stone sundial, green with moss. The shadow points at the 7. It\'s clearly not seven.',
        {when:[{flag:'ch3-coin',text:'The shadow points the right way now. Grace checked. Twice. She wrote it down.'}]}],
      ['sign',8,15,1,1,'Mossy sign','SUNDIAL HOLLOW. Tells the time. Not this time. A different time.'],
      ['sign',14,6,1,1,'Pool marker','THE DEEP POOL. Depth: yes. No fishing. (Someone has crossed out NO.)'],
      ['bench',3,13,4,2,'Stone bench','Carved into the stone: WAITED HERE 1970. Under it, newer: STILL WAITING.']]},
];

// ---------- Chapter 5: Long Island Elementary, east of the Square (conference night) ----------
// The schoolyard (front doors at the top, a parking lot, a playground), the school (a hallway with the Art room, the
// Music room and the Gym up top, the staff room bottom left, three hallway clocks) and the Cafetorium (east end).
// The Cafetorium doors open once the three clocks say 7:00 (data/scenes.js ch5OpenCafe).
const CH5_ON={chapter:5,notFlag:'ch5-done'},CH5_DONE={from:5,flag:'ch5-done'};
LE_AREAS.push(
  {id:'schoolyard',name:'Long Island Elementary',w:24,h:18,ground:'schoolyard',
    tag:'One school, one flagpole, one sign that says TONIGHT.',
    eyebrow:'LONG ISLAND / LONG ISLAND ELEMENTARY',
    hint:'The front doors are at the top. The Square is back west.',
    spawn:{x:1,y:8},
    // Painted plate (art/schoolyard.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // The front doors are the exits at (11,3) and (12,3); the Square is west at (0,8) and (0,9); the playground gate is (17,9).
    plateMask:[
      '########################',
      '########################',
      '########################',
      '###########..###########',
      '###########..###########',
      '###########..####.######',
      '###########..####.######',
      '####..#####.####..######',
      '............####.#######',
      '......##.......#.....###',
      '#########.........##.###',
      '########..##........####',
      '####.....#####....#..###',
      '######...#######......##',
      '######....######.......#',
      '######....######.....###',
      '#######.....####...#####',
      '#######............#####'],
    border:{kind:'tree',open:[[0,8],[0,9]]},
    exits:[[0,8,'town',28,9,'left'],[0,9,'town',28,10,'left'],[11,3,'school',14,16,'up','entry'],[12,3,'school',15,16,'up','entry']],
    objects:[
      // The two front pillars stand in for the wings (the school face is not walkable).
      ['schoolwing',10,4,1,1,'Long Island Elementary','A brick school with tall windows. Most of them are dark. One of them keeps flickering.',{side:'left'}],
      ['schoolwing',13,4,1,1,'Long Island Elementary','Paper snowflakes in every window. It\'s not winter. Nobody has taken them down since 2019.',{side:'right'}],
      ['flagpole',9,5,2,1,'Flagpole','The flag is down for the night. The rope clinks against the pole. Clink. Clink.'],
      ['marquee',15,5,2,2,'School sign','LONG ISLAND ELEMENTARY. TONIGHT: PARENT-TEACHER CONFERENCES, 7:00. BRING A PENCIL. BRING PATIENCE.',
        {when:[{...CH5_DONE,text:'LONG ISLAND ELEMENTARY. THANK YOU PARENTS! SEE YOU AT FIELD DAY. Somebody added: GO SNAILS.'}]}],
      ['bikerack',4,5,3,2,'Bike rack','One bike, no wheels. It\'s been here since the fourth grade. Whose fourth grade, nobody knows.'],
      ['bench',7,7,2,1,'Pickup bench','Where kids wait for a ride. Somebody carved: MOM IS LATE AGAIN. Under it: NO SHE IS NOT. That one is Amy’s.'],
      ['swings',21,9,3,3,'Swings','Two swings. The left one squeaks. The left one is everybody’s favorite. The tetherball is wound all the way around its pole. Somebody won. Somebody always wins.'],
      ['slide',20,7,1,2,'Slide','A metal slide. In July it\'s the surface of the sun. Tonight it\'s just cold.'],
      ['car',2,10,3,2,'Minivan','A minivan with a 26.2 sticker. And a 13.1. And a 5K. It\'s Amy’s.'],
      ['car',5,10,3,2,'Hatchback','A hatchback full of folding chairs. Somebody here\'s on the PTA.',{col:'#5a8a6a'}],
      ['car',2,13,4,3,'Sedan','A sedan with a GOLD STAR PARENT sticker. The star is peeling.',{col:'#8a8f98'}],
      ['sign',14,8,1,1,'Snail stone','FIGHTING SNAILS. Home of the Fighting Snails. Visitors, please sign in. Snails, please slow down.'],
      ['bench',19,12,2,1,'Fence bench','Parents sit here and pretend not to time the races. Amy has a stopwatch. Amy always has a stopwatch.']],
    npcs:[
      {name:'Principal Pruitt',x:12,y:9,look:'pruitt',roam:0,lines:['Principal Pruitt. Thirty-one years at Long Island Elementary. I\'ve seen everything. Not tonight, though. Tonight is new.'],
        when:[{...CH5_DONE,lines:['Thirty parents. Zero tears. One very well-behaved pen. Best conference night in thirty-one years.','Come to Field Day, Tom. Amy runs the relay. Amy always runs the relay.']},
              {...CH5_ON,flag:'ch5-pruitt',lines:['Conferences start at seven. SEVEN. The bells say otherwise. The bells are wrong.','Clear the rooms, set the hallway clocks to seven, and the Cafetorium will open. I hope.']}]},
      {name:'Mr. Delgado',x:8,y:14,look:'delgado',roam:0,lines:['I\'m Marco’s dad. Marco says Mrs. Gregori is the toughest teacher in the whole school.','Marco also says she\'s his favorite. Please don\'t tell Marco I told you.'],
        when:[{...CH5_DONE,lines:['Marco is reading at a third-grade level! Mrs. Gregori showed me the chart. There was a chart!','I cried a little. In the minivan. Don\'t tell Marco.']}]}]},
  planMerge({id:'school',name:'Long Island Elementary',w:30,h:18,ground:'school',
    tag:'Art, Music, a gym, a staff room, and every clock wrong.',
    eyebrow:'LONG ISLAND / LONG ISLAND ELEMENTARY / HALLWAY',
    hint:'Art, Music and the Gym are up top. The staff room is bottom left. The Cafetorium doors are at the east end.',
    spawn:{x:14,y:15},
    wild:true,
    // Painted plate (art/school.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // The Cafetorium doors (27 to 28, 8) get their exits when the clocks are set (ch5OpenCafe in data/scenes.js).
    plateMask:[
      '##############################',
      '##############################',
      '#########################...##',
      '#..###..####...####..........#',
      '#.###..######...######.....###',
      '#.......####.....#####.......#',
      '###..########..#######.#######',
      '###..########..#######.#######',
      '###..########..#######.#######',
      '#.............................',
      '#........................#####',
      '##.####.######..###.....######',
      '##.####.######..###...........',
      '##.####.######..##############',
      '##..###....###..##############',
      '##..##########..##############',
      '##....########..##############',
      '##############################'],
    exits:[[14,17,'schoolyard',11,4,'down','lino'],[15,17,'schoolyard',12,4,'down','lino']],
    monsters:SCHOOL_MONSTER_SPOTS,
    npcs:[
      {name:'Mrs. Kowalski',x:20,y:11,look:'kowalski',roam:0,lines:['Kowalski. PTA president. I brought nine hundred cookies and a laminator.','The sign-up sheet RAN AWAY. On little paper legs. I\'ve never been so offended.'],
        when:[{...CH5_DONE,lines:['Thirty conferences, nine hundred cookies, one laminator. Everything went on schedule. MY schedule.','Tell Mrs. Gregori her bulletin board is the best in the building. Don\'t tell the other teachers.']}]},
      {name:'Grandpa Ike',x:22,y:11,look:'ike',roam:0,lines:['I\'m here for my grandson. He\'s in the second grade. I was in the second grade here in 1956.','The bells were wrong in 1956 too. Nobody fixed them. Things were simpler.'],
        when:[{...CH5_DONE,lines:['They fixed the bells! In my lifetime! I\'m going to tell everyone at the diner.']}]},
      {name:'Mr. Halverson',x:10,y:14,look:'halverson',roam:0,lines:['Halverson. Fourth grade. I\'m hiding in the staff room. That\'s allowed. It\'s in the contract.','If you\'re hungry, the fridge is a minefield. Every lunch in there has a name on it. Read the labels.'],
        when:[{...CH5_DONE,lines:['Conference night is over. I survived. I\'m going to sit on this couch until Field Day.']},
              {...CH5_ON,flag:'ch5-snack',lines:['Deedee’s plate? Oh, everybody waits for Deedee’s plate. She brings one every conference night.','Don\'t tell Gary. Gary eats the whole thing.']}]}]},
    {tiles:[],pools:[],objects:[]},
    {objects:[
      // Hallway: the three clocks (hot spots on the wall base under each painted clock), the Cafetorium doors, and things on the walls.
      ['hallclock',5,8,1,1,'Art room clock','A school clock. The hands are spinning.',{clock:'art'}],
      ['hallclock',15,8,1,1,'Music room clock','A school clock. The hands are spinning.',{clock:'music'}],
      ['hallclock',23,8,1,1,'Gym clock','A school clock. The hands are spinning.',{clock:'gym'}],
      ['cafdoors',27,7,2,2,'Cafetorium doors','CAFETORIUM. Locked. A sign: CONFERENCES BEGIN WHEN THE BELL SAYS SO.',{cafdoors:true}],
      ['bulletin',9,8,1,1,'Bulletin board','MRS. GREGORI’S ROOM: OUR HEROES. Twelve crayon drawings. Nine of them are Amy running.'],
      ['trophycase',17,8,3,1,'Trophy case','FIELD DAY RELAY CHAMPIONS. Every year since 2016, the same teacher’s class. You can guess whose.'],
      ['waterfountain',1,8,1,1,'Water fountain','The water comes out in a tiny arc, then a big arc, then directly into your eye.'],
      ['signtable',25,8,1,1,'Sign-up table','Thirty pens on strings. A sign: CONFERENCE SIGN-UP SHEET. There\'s no sheet. There\'s a small paper footprint.',
        {when:[{flag:'ch5-clear',text:'The sign-up sheet is back on its clipboard, a little crumpled. Every name has a gold star now.'}]}],
      ['lostfound',27,11,1,1,'Lost and found','Nine mittens, a trombone, and a retainer. Nobody has claimed the retainer since 2011.'],
      // The Art room.
      ['easel',1,1,2,2,'Easel','A painting of a snail with a cape. It\'s called MY HERO. It\'s very good.'],
      ['easel',7,1,2,2,'Easel','A painting of the principal. He has eight arms. Each one holds a whistle.'],
      ['arttable',2,4,3,1,'Art table','Paper plates, pipe cleaners and enough glitter for a small parade. The glitter jar is empty.'],
      ['dryrack',8,4,1,2,'Drying rack','Thirty handprint turkeys, drying. It\'s not November. Art doesn\'t care.'],
      // The Music room.
      ['piano',11,1,3,2,'Piano','An old upright piano. Middle C is glued down. Glittery glue.'],
      ['drums',14,1,3,2,'Drum kit','A drum kit with a sign: DRUMS ARE FOR FRIDAYS. It\'s not Friday. Rose taps it anyway.'],
      ['xylophone',11,4,2,1,'Xylophone','Every bar is stuck in place with glitter glue. It plays one note. The note is sad.'],
      ['musicstand',15,3,1,1,'Music stand','Sheet music: HOT CROSS BUNS, arranged for thirty recorders. Brave.'],
      // The Gym.
      ['bleachers',19,1,4,2,'Bleachers','Folding bleachers. Every kid in town has pinched a finger in these.'],
      ['hoop',23,1,2,2,'Basketball hoop','The net is half gone. The other half is hopeful.'],
      ['gymmats',19,4,3,2,'Gym mats','Blue mats, slightly sticky. Grace does a perfect cartwheel on them. Twice. On purpose.'],
      ['ballcart',27,4,2,1,'Ball cart','A cart of red rubber balls. One of them is missing. It\'s not missing. It\'s watching.'],
      ['climbrope',28,2,1,1,'Climbing rope','The climbing rope. Nobody has ever touched the top. Amy touched it in 1998. There\'s a plaque.'],
      // The staff room (the painting has no door; two gaps in its north wall, at x 2 and x 7, let the party in).
      ['stafffridge',1,12,1,3,'Staff fridge','The staff room fridge. Every lunch inside has a name on it, and some of the names are underlined.',{fridge:true}],
      ['staffcounter',3,13,3,1,'Coffee counter','A coffee machine older than the school. A sign: IF YOU FINISH THE POT, MAKE A POT. A sticky note: GARY.'],
      ['copier',9,12,2,2,'Copier','The copier. It\'s jammed. It\'s always jammed. A teacher is staring at it from across the room, in silence.'],
      ['stafftable',4,14,3,2,'Staff table','Red pens. Hundreds of red pens. All of them are capped. All of them are a little scared.'],
      ['staffcouch',6,15,5,2,'Staff couch','The couch where teachers go to close their eyes for one minute. It\'s been one minute since 1987.']]}),
  planMerge({id:'cafetorium',name:'The Cafetorium',w:20,h:14,ground:'cafe',
    tag:'Half cafeteria, half auditorium. Twice the room, half the chairs.',
    eyebrow:'LONG ISLAND / LONG ISLAND ELEMENTARY / CAFETORIUM',
    hint:'The stage is at the top. Something is grading up there.',
    spawn:{x:1,y:6},
    exits:[[1,5,'school',27,9,'down','cafefloor']],
    // Painted plate (art/cafetorium.webp, engine/plate.js). '#' blocks, '.' walks. Stage row 2 is reached by the two side stairs.
    plateMask:[
      '####################',
      '####################',
      '###..............###',
      '###.############.###',
      '###...............##',
      '#.#...............##',
      '#.................##',
      '#..######...######.#',
      '...######...######.#',
      '....................',
      '..######....########',
      '..######....########',
      '....................',
      '....................'],
    monsters:CAFE_MONSTER_SPOTS},
    planSchool([
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'WFFFPPPPPPPPPPPPFFFW',
      'WFFFPPPPPPPPPPPPFFFW',
      'WFFFPPPPPPPPPPPPFFFW',
      'WFFFFFFFFFFFFFFFFFFW',
      'FFFFFFFFFFFFFFFFFFFW',
      'FFFFFFFFFFFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFW',
      'WWWWWWWWWWWWWWWWWWWW']),
    {objects:[
      ['podium',10,2,1,1,'Podium','A wooden podium. Somebody has carved PRUITT WAS HERE 1993 into it. It was Pruitt.',
        {when:[{flag:'ch5-clear',text:'A wooden podium. The sign-up sheet used to be here. Now there\'s just a small, neat note: SORRY. (In red.)'}]}],
      ['lunchtable',3,7,6,2,'Lunch table','A long lunch table with the little round seats. Somebody’s pudding cup is still here. Nobody will claim it.'],
      ['lunchtable',12,7,6,2,'Lunch table','A long lunch table. Thirty conference chairs are stacked on top. They look nervous.'],
      ['lunchtable',2,10,6,2,'Lunch table','A lunch table. NO TRADING SNACKS, says a sign. Rose looks at it like it\'s a challenge.'],
      ['lunchtable',12,10,7,2,'Lunch table','A lunch table. Nine hundred cookies on trays, under plastic wrap. Mrs. Kowalski counted them.'],
      ['milkcooler',18,6,2,1,'Milk cooler','Chocolate milk, white milk, and one strawberry milk that\'s been here for a very long time.'],
      ['sign',18,11,2,1,'Cafetorium sign','THE CAFETORIUM. Lunch at noon. Plays at seven. Don\'t mix them up again. (The spaghetti incident.)']]})
);

// ---------- Chapter 7: the Stacks under the Hush Library, and the Reading Room ----------
// Down the stairs behind the Hush Library (the STAFF ONLY door in the library room, data/scenes.js ch7Stairs). The
// Stacks (ground 'stacks'): Fiction top left, Nonfiction top right, Picture Books at the bottom, a long hall across the
// middle, and the Reading Room doors at the top (they open with the catalog password, data/scenes.js ch7Catalog).
// Plan: 'B' bookcase wall (solid; it shows its shelves when there is floor below it), 'X' dark (solid), 'S' a bookcase
// in a wing (an object), 'f' Fiction carpet, 'n' Nonfiction carpet, ',' hall boards, 'p' Picture Book carpet, 'r' the
// story rug, 'D' the Reading Room doorway. The Reading Room (ground 'readroom'): 'R' parquet, 'P' the dais.
const STACKS_TILES={f:'fiction',n:'nonfic',',':'hallwood',p:'picrug',r:'storyrug',D:'hallwood',R:'readwood',P:'dais'};
const STACKS_SHELF={f:['Fiction','FICTION. Mysteries, dragons, a horse who solves crimes. Somebody is whispering behind the books.'],
  n:['Nonfiction','NONFICTION. Volcanoes, bridges, 101 Uses for a Potato. The potato book is whispering the loudest.']};
function planStacks(plan,noWingObjs) {
  const walls=[],voids=[],floors={},objs=[];
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='B') walls.push([x,y]); else if(c==='X') voids.push([x,y]);
    else if(c==='S') { const w=x<14?'f':'n'; (floors[STACKS_TILES[w]]=floors[STACKS_TILES[w]]||[]).push([x,y,x,y]);
      if(!noWingObjs) objs.push(['bookcase',x,y,1,1,STACKS_SHELF[w][0],STACKS_SHELF[w][1],{wing:w}]); }
    else if(STACKS_TILES[c]) (floors[STACKS_TILES[c]]=floors[STACKS_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),pools:[{tile:'bkwall',cells:walls},{tile:'bkvoid',cells:voids}],objects:objs};
}
const CH7_ON={chapter:7,notFlag:'ch7-done'},CH7_DONE={from:7,flag:'ch7-done'};
LE_AREAS.push(
  planMerge({id:'stacks',name:'The Stacks',w:30,h:22,ground:'stacks',
    tag:'Under the Hush Library. Miles of shelves, and every book is whispering.',
    eyebrow:'LONG ISLAND / THE HUSH LIBRARY / THE STACKS',
    hint:'Fiction top left, Nonfiction top right, Picture Books at the bottom. The Reading Room is at the top.',
    spawn:{x:1,y:10},
    wild:true,
    exits:[[0,10,'library',17,5,'down','stairsup'],[14,1,'readroom',9,12,'up','hallwood'],[15,1,'readroom',10,12,'up','hallwood']],
    monsters:STACKS_MONSTER_SPOTS,
    // Painted plate (art/stacks.webp, engine/plate.js). '#' blocks, '.' walks. The runner leads from the Reading Room doors (top) to the hall;
    // the hall (rows 8 to 10) joins the left exit (0,10), the Fiction and Nonfiction lanes (row 7) and the gap (x 14 to 16) down to Picture Books.
    plateMask:[
      '##############################',
      '##############################',
      '##############..##########.###',
      '##############..##########.###',
      '#####..#######..##########.###',
      '######.#######..##########.###',
      '#####..#######..##########.###',
      '####...##..................###',
      '####......####..#####......###',
      '#.........####..####.........#',
      '................##...........#',
      '##############...#############',
      '##############...#############',
      '##############...#############',
      '##############...#####.#######',
      '######.###..###...###..#######',
      '######.###..###...###..#######',
      '######.......#....####.#######',
      '############......####.#######',
      '############......###....#####',
      '######.....................###',
      '##############################']},
    planStacks([
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      'BffffffffffffBDDBnnnnnnnnnnnnB',
      'BfSSfSSfSSfffB,,BnnnSSnSSnSSnB',
      'BfSSfSSfSSfffB,,BnnnSSnSSnSSnB',
      'BffffffffffffB,,BnnnnnnnnnnnnB',
      'BfSSfSSfSSfffB,,BnnnSSnSSnSSnB',
      'BfSSfSSfSSfffB,,BnnnSSnSSnSSnB',
      'BffffffffffffB,,BnnnnnnnnnnnnB',
      'BBBBBffBBBBBBB,,BBBBBBBnnBBBBB',
      'B,,,,,,,,,,,,,,,,,,,,,,,,,,,,B',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,B',
      'B,,,,,,,,,,,,,,,,,,,,,,,,,,,,B',
      'BBBBBBBBBBBBBBppBBBBBBBBBBBBBB',
      'XXXXXXXBppppppppppppppBXXXXXXX',
      'XXXXXXXBppppppppppppppBXXXXXXX',
      'XXXXXXXBppppppppppppppBXXXXXXX',
      'XXXXXXXBpprrrrppppppppBXXXXXXX',
      'XXXXXXXBpprrrrppppppppBXXXXXXX',
      'XXXXXXXBpprrrrppppppppBXXXXXXX',
      'XXXXXXXBppppppppppppppBXXXXXXX',
      'XXXXXXXBBBBBBBBBBBBBBBBXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'],true),
    {objects:[
      ['bookcase',4,6,1,1,'Fiction',STACKS_SHELF.f[1],{wing:'f'}],
      ['bookcase',7,6,1,1,'Fiction',STACKS_SHELF.f[1],{wing:'f'}],
      ['bookcase',25,3,1,1,'Nonfiction',STACKS_SHELF.n[1],{wing:'n'}],
      ['bookcase',25,5,1,1,'Nonfiction',STACKS_SHELF.n[1],{wing:'n'}],
      ['readdoors',14,1,2,1,'Reading Room doors','Two tall doors: THE READING ROOM. A brass lock shaped like a card catalog drawer. Somebody behind them is whispering.',{catalog:true}],
      ['stackglobe',12,8,2,2,'Globe','An old globe. Half the countries have changed names. The globe hasn\'t been told. Nobody wants to tell it.'],
      ['bookcart',16,8,2,3,'Returns cart','RETURNS. A cart of books waiting to go back on the shelves. One of them is a cookbook. It smells faintly of soup.'],
      ['lamptable',27,6,2,2,'Reading table','A long table with a green lamp. Someone left a note: QUIET PLEASE. Under it, smaller: we heard you.'],
      ['stacksign',20,8,1,1,'Stacks sign','THE STACKS. Please return books to the cart. Please don\'t answer the books.',
        {when:[{...CH7_DONE,text:'THE STACKS. Please return books to the cart. Somebody added, in glitter pen: AND READ THEM OUT LOUD.'}]}],
      ['ladder',27,3,1,1,'Rolling ladder','A rolling library ladder. Grace wants to ride it. Tom says no. Grace rides it anyway, one foot, very carefully.'],
      ['lowshelf',8,19,2,1,'Low shelf','Picture books, sorted by color. Somebody very small sorted them. Somebody very small is proud of it.'],
      ['lowshelf',19,19,1,1,'Low shelf','Board books, chewed on all four corners. Lovingly.'],
      ['beanbag',23,16,2,2,'Beanbag','A beanbag the size of Rose. Rose sits in it and disappears completely.'],
      ['storychair',7,15,3,2,'Story time chair','The big rocking chair for story time. A basket of books sits beside it. Rose is already standing there, holding one up.',{storytime:true}],
      ['puppettheater',23,13,3,3,'Puppet theater','A little puppet theater. The puppets are whispering. That\'s not how puppets work.',
        {when:[{...CH7_DONE,text:'A little puppet theater. The puppets are quiet now. One of them waves at Rose.'}]}]]}),
  planMerge({id:'readroom',name:'The Reading Room',w:20,h:14,ground:'readroom',
    tag:'The oldest room in the library. Green lamps, long tables, and one very old book.',
    eyebrow:'LONG ISLAND / THE HUSH LIBRARY / THE READING ROOM',
    hint:'The dais is at the top. Something up there\'s turning its own pages.',
    spawn:{x:9,y:12},
    exits:[[9,13,'stacks',14,2,'down','readwood'],[10,13,'stacks',15,2,'down','readwood']],
    // Painted plate (art/readroom.webp, engine/plate.js). '#' blocks, '.' walks. The dais (rows 2 to 3) is reached by the
    // painted steps; the four reading tables, the globe and the gate posts block.
    plateMask:[
      '####################',
      '####################',
      '########....########',
      '#######......#######',
      '####............####',
      '##................##',
      '#######......#######',
      '#######......#######',
      '#######......#######',
      '######........######',
      '######........######',
      '#######.#...########',
      '#########..#########',
      '#########..#########'],
    monsters:READROOM_MONSTER_SPOTS},
    planStacks([
      'BBBBBBBBBBBBBBBBBBBB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BRRRRPPPPPPPPPPRRRRB',
      'BRRRRPPPPPPPPPPRRRRB',
      'BRRRRPPPPPPPPPPRRRRB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BRRRRRRRRRRRRRRRRRRB',
      'BBBBBBBBBRRBBBBBBBBB']),
    {objects:[
      ['lamptable',2,6,5,3,'Reading table','A long oak table. Every green lamp on it\'s flickering at the same time. Like breathing.'],
      ['lamptable',13,6,6,3,'Reading table','Another long table. Carved into it: P + M, 1974. Page won\'t say who M is.'],
      ['lamptable',1,9,5,3,'Reading table','A table with one chair pulled out, as if someone just left. The seat is still warm. It\'s not.'],
      ['lamptable',14,9,6,3,'Reading table','A stack of returned books, all overdue. The newest one is from 1999.'],
      ['stackglobe',17,5,1,1,'Globe','A globe on a stand. Somebody has drawn a little clock face on the Pacific Ocean. In pen.'],
      ['lectern',9,5,2,1,'Lectern','A brass lectern with nothing on it. Whatever used to sit here\'s up on the dais now.',
        {when:[{flag:'ch7-clear',text:'A brass lectern. The Unread sits on it now, open to page one, waiting for whoever is next.'}]}]]})
);

// ---------- Chapter 9: the Moon Club (up the stairs behind Luna's observatory) and its Dome ----------
// The Moon Club (ground 'club'): the Coat Check top left, the Card Room top right, the Ballroom at the bottom, a long
// marble hall across the middle, and the Dome doors at the top (they open by moonlight: data/scenes.js ch9Beam).
// Plan: 'W' club wall (solid; it shows its panels when there is floor below it), 'X' dark (solid), 'c' Coat Check
// carpet, 'g' Card Room carpet, ',' marble, 'b' ballroom parquet, 'f' the dance floor, 'D' the Dome doorway. The Dome
// (ground 'dome'): 'd' starry floor, 'P' the bandstand. A moonbeam comes in through the round window at the east end of
// the hall (row 11) and bounces off the three mirror stands (CLUB_MIRRORS) when their mirrors are back.
const CLUB_TILES={c:'coatrug',g:'cardrug',',':'marble',b:'ballwood',f:'dancefloor',D:'marble',d:'domefloor',P:'bandstand'};
function planClub(plan) {
  const walls=[],voids=[],floors={};
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='W') walls.push([x,y]); else if(c==='X') voids.push([x,y]);
    else if(CLUB_TILES[c]) (floors[CLUB_TILES[c]]=floors[CLUB_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),pools:[{tile:'clubwall',cells:walls},{tile:'clubvoid',cells:voids}],objects:[]};
}
// The three mirror stands: which fight brings each mirror back, and where it stands.
const CLUB_MIRRORS=[{m:'A',fight:'ch9-coat',x:21,y:11,from:'the Coat Check'},{m:'B',fight:'ch9-cards',x:21,y:9,from:'the Card Room'},{m:'C',fight:'ch9-ball',x:15,y:9,from:'the Ballroom'}];
const CLUB_BEAM={x:28,y:11,dir:'left'};
const CH9_ON={chapter:9,notFlag:'ch9-done'},CH9_DONE={from:9,flag:'ch9-done'};
// Aunt Ellie lives in her own house on Rivituso Row. She walks over to the Rivituso house for the chapter 9 card game with the
// girls and for the chapter 10 homecoming dinner; her house copy is `away` then and the visiting copy below is `away` otherwise.
const ELLIE_VISIT=[{mode:'full',chapter:9,flag:'ch9-letter',notFlag:'ch9-done'},{mode:'full',chapter:10,flag:'ch10-clear',notFlag:'ch10-done'}];
LE_AREAS.push(
  planMerge({id:'moonclub',name:'The Moon Club',w:30,h:22,ground:'club',
    tag:'Up the stairs behind the telescope. Velvet, marble, and a lot of dust since 1971.',
    eyebrow:'LONG ISLAND / THE MOON CLUB',
    hint:'Coat Check top left, Card Room top right, Ballroom at the bottom. The Dome is at the top.',
    spawn:{x:1,y:10},
    wild:true,
    exits:[[0,10,'observatory',10,3,'down','clubstairs'],[14,2,'dome',9,12,'up','marble'],[15,2,'dome',10,12,'up','marble']],
    // Painted plate (art/moonclub.webp, engine/plate.js). '#' blocks, '.' walks. The mirror stands stay drawn on top of the painting
    // (liveKinds) because the moonbeam puzzle needs to show which are back and which way they lean. The beam row 11, column 21,
    // row 9 and column 15 are kept walkable so the beam (clubBeam) is never cut off by a painted prop.
    liveKinds:['mirrorstand'],
    plateMask:[
      '##############################',
      '##############################',
      '#############....#############',
      '#############......###########',
      '#############......###########',
      '###.......###.........########',
      '#####..######....#############',
      '#####..######....#############',
      '#####..######....#############',
      '#.###..................####.#',
      '.............................#',
      '#......##..........##........#',
      '###..########......#########.#',
      '###..########......#########.#',
      '###..########......#..######.#',
      '###..######............#####.#',
      '###..####..............#####.#',
      '###..####.............######.#',
      '###..#####........############',
      '###.....#####.....############',
      '####....######...#############',
      '##############...#############'],
    monsters:CLUB_MONSTER_SPOTS},
    planClub([
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WccccccccccccWDDWggggggggggggW',
      'WccccccccccccW,,WggggggggggggW',
      'WccccccccccccW,,WggggggggggggW',
      'WccccccccccccW,,WggggggggggggW',
      'WccccccccccccW,,WggggggggggggW',
      'WccccccccccccW,,WggggggggggggW',
      'WccccccccccccW,,WggggggggggggW',
      'WWWWWccWWWWWWW,,WWWWWWWggWWWWW',
      'W,,,,,,,,,,,,,,,,,,,,,,,,,,,,W',
      ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,W',
      'W,,,,,,,,,,,,,,,,,,,,,,,,,,,,W',
      'WWWWWWWWWWWWWW,,WWWWWWWWWWWWWW',
      'XXXXXXXWbbbbbbbbbbbbbbWXXXXXXX',
      'XXXXXXXWbbbbbbbbbbbbbbWXXXXXXX',
      'XXXXXXXWbbbffffffffbbbWXXXXXXX',
      'XXXXXXXWbbbffffffffbbbWXXXXXXX',
      'XXXXXXXWbbbffffffffbbbWXXXXXXX',
      'XXXXXXXWbbbbbbbbbbbbbbWXXXXXXX',
      'XXXXXXXWbbbbbbbbbbbbbbWXXXXXXX',
      'XXXXXXXWWWWWWWWWWWWWWWWXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX']),
    {objects:[
      ['clubdoors',14,2,2,1,'Dome doors','Two tall silver doors: THE DOME. In the middle, a lock shaped like a full moon. It\'s dark.',{domelock:true}],
      ...CLUB_MIRRORS.map(M=>['mirrorstand',M.x,M.y,1,1,'Mirror stand','A brass stand on a swivel. MIRROR '+'ABC'.indexOf(M.m)+1+' OF 3. The mirror is gone.',{mirror:M.m}]),
      ['clubplaque',21,8,2,1,'Brass plaque','THE MOON CLUB, 1924. MEMBERS ARE ADMITTED BY MOONLIGHT.',
        {when:[{...CH9_DONE,text:'THE MOON CLUB, 1924. MEMBERS ARE ADMITTED BY MOONLIGHT. Under it, new, in Deedee’s handwriting: AND BY INVITATION.'}]}],
      ['ropepost',3,4,1,1,'Velvet rope','A brass post with a red velvet rope. The list on it\'s blank.'],
      ['ropepost',9,4,1,1,'Velvet rope','The other end of the rope. A tiny sign: PLEASE WAIT TO BE SEATED. Since 1971.'],
      ['clubpalm',10,8,1,1,'Potted palm','A potted palm. Silk. It\'s been waiting for a party longer than most people.'],
      ['clubpalm',8,11,1,1,'Potted palm','Another silk palm. Boppy checks it for fish. Habit.'],
      ['coatcounter',7,3,2,2,'Coat check counter','COAT CHECK. A brass bell and a book of claim tickets. Ticket 7 was torn out in 1971.'],
      ['coatrack',5,3,2,2,'Coat rail','A long rail of empty hangers. They all swing a little when Tom walks past.',
        {when:[{flag:'ch9-coat',text:'A long rail of hangers. The Hanger-On is back on it, holding nothing, looking relieved.'}]}],
      ['clubchair',10,4,1,2,'Velvet chair','A velvet chair for waiting in. Deedee sits for one second. Deedee is back up.'],
      ['cardtable',19,3,2,2,'Card table','Green felt, a deck of cards with one missing, and a score pad. Every game: E wins.'],
      ['cardtable',22,5,3,1,'Card table','Gin rummy, abandoned mid-game in 1971. Boppy looks at the hands. Boppy would have lost.'],
      ['clubbar',18,2,2,1,'The bar','A long brass bar. One dusty bottle of wine, 1971. Deedee: \"Just looking. For now.\"'],
      ['clubchair',24,9,2,1,'Velvet chair','A velvet chair. Somebody left a monocle on it. It\'s the Stuffed Shirt’s. He looks for it constantly.'],
      ['jukebox',19,13,1,2,'Jukebox','A big glowing jukebox. Every record is a slow dance.',{jukebox:true}],
      ['clubpiano',10,13,3,1,'Piano','A white piano. Somebody has left sheet music on it called MOON OVER LONG ISLAND.'],
      ['clubpalm',8,19,1,1,'Potted palm','A silk palm in the corner. Even the palm is a wallflower here.'],
      ['clubpalm',22,14,1,1,'Potted palm','A silk palm. Somebody hung a tiny paper moon on it.'],
      ['mirrorframe',23,15,1,2,'Big gold frame','A huge gold frame on the wall. Empty. Something very big and very shiny hung here once.',
        {when:[{flag:'ch9-ball',text:'A huge gold frame on the wall. Empty. Its mirror is out in the hall now, doing something useful.'}]}]]}),
  planMerge({id:'dome',name:'The Dome',w:20,h:14,ground:'dome',
    tag:'The top of the Moon Club. A glass dome, a bandstand, and one very shiny ball.',
    eyebrow:'LONG ISLAND / THE MOON CLUB / THE DOME',
    hint:'The bandstand is at the top. Something up there\'s very, very bright.',
    spawn:{x:9,y:12},
    // Painted plate (art/dome.webp, engine/plate.js). '#' blocks, '.' walks. The stage, both side rails, the corner tables and the two
    // big palms are painted solid; the way in is the carpet (x 9 and 10) up the stairs from the Moon Club.
    plateMask:[
      '####################',
      '####################',
      '####################',
      '####################',
      '####################',
      '###...............##',
      '##.................#',
      '##.................#',
      '##.................#',
      '##................##',
      '#####..........#####',
      '########....########',
      '#########..#########',
      '#########..#########'],
    exits:[[9,13,'moonclub',14,3,'down','domefloor'],[10,13,'moonclub',15,3,'down','domefloor']],
    monsters:DOME_MONSTER_SPOTS},
    planClub([
      'WWWWWWWWWWWWWWWWWWWW',
      'WddddddddddddddddddW',
      'WddddPPPPPPPPPPddddW',
      'WddddPPPPPPPPPPddddW',
      'WddddPPPPPPPPPPddddW',
      'WddddddddddddddddddW',
      'WddddddddddddddddddW',
      'WddddddddddddddddddW',
      'WddddddddddddddddddW',
      'WddddddddddddddddddW',
      'WddddddddddddddddddW',
      'WddddddddddddddddddW',
      'WddddddddddddddddddW',
      'WWWWWWWWWddWWWWWWWWW']),
    {objects:[
      ['bandchairs',4,3,3,2,'Band chairs','Four music stands and four empty chairs. The sheet music is all the same song.'],
      ['bandchairs',10,3,2,2,'Band chairs','A drum kit with a moon on the bass drum. Boppy taps it once. It\'s very loud.'],
      ['clubpalm',6,11,2,2,'Potted palm','A silk palm. It has a perfect view of the dance floor and has never once danced.'],
      ['clubpalm',12,11,2,2,'Potted palm','A silk palm wearing a tiny party hat.'],
      ['domescope',17,3,2,2,'Old telescope','A brass telescope pointed up through the glass. Through it: the sky, and no moon at all.',
        {when:[{flag:'ch9-clear',text:'A brass telescope pointed up through the glass. Through it: the moon, round and silver and back where it belongs.'}]}]]})
);

// ---------- Chapter 10: Terminal Zero (Long Island Regional, closed since 1989) and Gate Zero ----------
// Terminal Zero (ground 'term'): Security top left, Baggage Claim top right, the Lounge bottom left, Check-In bottom
// right (the curb doors at the bottom go back to the Square), a concourse across the middle with a moving walkway, and
// the Gate Zero doors at the top under the gate clock (they open when the clock has its hands and the coins are in:
// data/scenes.js ch10Clock). Plan: 'W' terminal wall (solid; it shows its face when there is floor below it), 'X' dark,
// 's' security floor, 'k' baggage claim floor, 'l' lounge carpet, 'c' check-in carpet, ',' terrazzo, 'm' the moving
// walkway, 'D' the gate doorway, 'E' the curb doors. Gate Zero (ground 'gate'): 'V' the big window (solid), 'g' carpet.
const TERM_TILES={s:'secfloor',k:'claimfloor',l:'loungerug',c:'checkrug',',':'terrazzo',m:'walkway',D:'terrazzo',E:'curb',g:'gatecarpet'};
function planTerm(plan) {
  const walls=[],voids=[],wins=[],floors={};
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='W') walls.push([x,y]); else if(c==='X') voids.push([x,y]); else if(c==='V') wins.push([x,y]);
    else if(TERM_TILES[c]) (floors[TERM_TILES[c]]=floors[TERM_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),pools:[{tile:'termwall',cells:walls},{tile:'termvoid',cells:voids},{tile:'gatewindow',cells:wins}],objects:[]};
}
// The gate clock's three hands: which fight brings each one back.
const TERM_HANDS=[{h:'hour',fight:'ch10-sec',from:'Security'},{h:'minute',fight:'ch10-bag',from:'Baggage Claim'},{h:'second',fight:'ch10-lounge',from:'the Lounge'}];
const CH10_ON={chapter:10,notFlag:'ch10-done'},CH10_DONE={from:10,flag:'ch10-done'},CH10_CLEAR={from:10,flag:'ch10-clear'};
LE_AREAS.push(
  planMerge({id:'terminal',name:'Terminal Zero',w:30,h:22,ground:'term',
    tag:'Long Island Regional, the door nobody uses. Closed since 1989. The lights came on last night.',
    eyebrow:'LONG ISLAND / LONG ISLAND REGIONAL / TERMINAL ZERO',
    hint:'Security top left, Baggage Claim top right, the Lounge bottom left. Gate Zero is at the top.',
    spawn:{x:15,y:20},
    wild:true,
    exits:[[14,21,'town',25,19,'down','curb'],[15,21,'town',25,19,'down','curb'],[14,1,'gatezero',9,12,'up','terrazzo'],[15,1,'gatezero',10,12,'up','terrazzo']],
    // Painted plate (art/terminal.webp, engine/plate.js). '#' blocks, '.' walks. The gate clock stays drawn on top of the painting
    // (liveKinds) because its hands and coin slots change with the story. Rows 8 and 9 of the concourse and the lounge furniture are
    // blocked where the painting has benches and armchairs; the plants beside the departure board are left walkable so the corridor
    // has a way round the board.
    liveKinds:['gateclock'],
    plateMask:[
      '##############################',
      '##############..##############',
      '##############..##############',
      '###..#####..##..##.###########',
      '###....#....##..##.###########',
      '#.........#.##..##.########..#',
      '##.....##..........########..#',
      '###.......................##.#',
      '#........###.................#',
      '#........###.................#',
      '#............................#',
      '##############..##############',
      '##############..##############',
      '##############..##############',
      '#......####...............#..#',
      '#..#......................#..#',
      '####.........................#',
      '####.....####................#',
      '##############..##############',
      '##############..##############',
      '##############..##############',
      '##############..##############',],
    monsters:TERM_MONSTER_SPOTS},
    planTerm([
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WsssssssssssWDDWkkkkkkkkkkkkkW',
      'WsssssssssssW,,WkkkkkkkkkkkkkW',
      'WsssssssssssW,,WkkkkkkkkkkkkkW',
      'WsssssssssssW,,WkkkkkkkkkkkkkW',
      'WsssssssssssW,,WkkkkkkkkkkkkkW',
      'WsssssssssssW,,WkkkkkkkkkkkkkW',
      'WsssssssssssW,,WkkkkkkkkkkkkkW',
      'WWWWWssWWWWWW,,WWWWWWkkWWWWWWW',
      'W,,,,,,,,,,,,,,,,,,,,,,,,,,,,W',
      'W,,,,,,,,,,,,,,,mmmmmmmmm,,,,W',
      'W,,,,,,,,,,,,,,,,,,,,,,,,,,,,W',
      'WWWWWllWWWWWWWWWWWWWccWWWWWWWW',
      'WllllllllllllWcccccccccccccccW',
      'WllllllllllllWcccccccccccccccW',
      'WllllllllllllWcccccccccccccccW',
      'WllllllllllllWcccccccccccccccW',
      'WllllllllllllWcccccccccccccccW',
      'WllllllllllllWcccccccccccccccW',
      'WllllllllllllWcccccccccccccccW',
      'WllllllllllllWcccccccccccccccW',
      'WWWWWWWWWWWWWWWWWWWWWEEWWWWWWW']),
    {objects:[
      ['gatedoors',14,1,2,1,'Gate Zero doors','Two tall doors: GATE 0. Above them, a big station clock with no hands at all, and seven little slots round the face.',{gatelock:true}],
      ['gateclock',14,0,2,1,'Gate clock','A big station clock. No hands. Seven coin slots round the face, and one in the middle.'],
      ['scanner',3,3,2,1,'Scanner arch','A walk-through scanner. It beeps at Tom. Tom has nothing on him. It beeps anyway.'],
      ['xray',4,4,3,2,'X-ray belt','An X-ray belt. A gray bin is still in the tunnel from 1989. Inside: one shoe.'],
      ['stanchion',1,6,1,1,'Belt post','A belt post. The belt is missing. Somebody has been using it.'],
      ['stanchion',5,6,1,1,'Belt post','PLEASE WAIT TO BE CALLED. Nobody has been called since 1989.'],
      ['bins',8,4,2,2,'Gray bins','A tower of gray bins. Rose climbs it. Amy takes her down. Rose climbs it again.'],
      ['carousel',19,3,8,4,'Baggage carousel','Carousel 0. It still goes round. There\'s nothing on it. It doesn\'t mind.',
        {when:[{flag:'ch10-bag',text:'Carousel 0. It still goes round. The Unclaimed rides it now and then, for fun.'}]}],
      ['bagcart',29,5,1,1,'Luggage cart','A luggage cart with one sticky wheel. Grace wants to ride it. Amy says no. Amy rides it.'],
      ['lostfound',27,3,2,2,'Lost and found','LOST AND FOUND. A single glove, a paperback from 1989, and a lot of umbrellas.'],
      ['fids',13,7,4,2,'Departure board','DEPARTURES. Every flight: 12:00. Every gate: 0. Every status: NOW BOARDING.',
        {when:[{...CH10_CLEAR,text:'DEPARTURES. FLIGHT 0, TO NOWHERE: DEPARTED. NEXT: FLIGHT 00. GATE: TO BE ANNOUNCED.'}]}],
      ['termplant',11,7,1,1,'Plant','A plastic ficus. It\'s been waiting for a flight longer than anyone.'],
      ['termplant',18,7,1,1,'Plant','Another plastic ficus. Somebody put a tiny boarding pass in its pot.'],
      ['termbench',4,8,3,2,'Gate bench','A row of seats bolted together. The armrests are all down.'],
      ['termbench',18,8,3,2,'Gate bench','A row of seats. Somebody left a newspaper: MAY 1989. LONG ISLAND REGIONAL ADDS A FIFTH GATE.'],
      ['termsign',1,7,2,1,'Direction sign','An arrow pointing left: SECURITY, LOUNGE. Gate Zero: straight up the middle.'],
      ['termsign',26,7,2,1,'Direction sign','An arrow pointing right: GATES, BAGGAGE CLAIM. Every gate on it says zero.'],
      ['loungechair',1,15,2,2,'Lounge chair','A big leather couch. Tom sits for one second. Tom knows good seating.'],
      ['loungechair',4,15,2,2,'Lounge chair','A leather chair. It reclines. Rose finds out. Rose finds out again.'],
      ['loungechair',7,16,2,2,'Lounge chair','A leather chair. Somebody left a sleep mask on it. Probably a Jet Lag.'],
      ['loungebar',1,13,5,1,'Snack bar','THE ZERO LOUNGE. Tiny pretzels, a coffee pot from 1989, and a sign: MEMBERS ONLY. GROUP ZERO ONLY.'],
      ['amenity',10,12,2,2,'Amenity cabinet','A cabinet of amenity kits. Tiny socks, tiny toothpaste, pajamas with a little gold 0.'],
      ['termplant',12,12,2,2,'Plant','A plastic ficus by the lounge. Its leaves have been dusted. Recently.'],
      ['checkin',17,14,8,1,'Check-in counter','CHECK-IN. A bell, a scale, and a sign: GROUP ZERO PLEASE PROCEED TO THE GATE. NO BAGS REQUIRED.'],
      ['photobooth',28,12,1,3,'Photo booth','A photo booth. FOUR POSES, ONE QUARTER. There\'s a quarter on the seat.',{photobooth:true}],
      ['termplant',28,16,1,2,'Plant','A plastic ficus. Rose names it Kevin.']]}),
  planMerge({id:'gatezero',name:'Gate Zero',w:20,h:14,ground:'gate',
    tag:'The fifth gate. One podium, one jet bridge, one plane that\'s waited since 1989.',
    eyebrow:'LONG ISLAND / TERMINAL ZERO / GATE ZERO',
    hint:'The podium is at the top, under the board. The jet bridge door is next to it.',
    spawn:{x:9,y:12},
    exits:[[9,13,'terminal',14,2,'down','gatecarpet'],[10,13,'terminal',15,2,'down','gatecarpet']],
    // Painted plate (art/gatezero.webp, engine/plate.js). '#' blocks, '.' walks. Window wall, podium, jet bridge door, four bench
    // rows, the two potted plants and the gate posts block; the red carpet, the stone floor and the walkway down to the terminal walk.
    plateMask:[
      '####################',
      '####################',
      '####################',
      '####################',
      '#######.........####',
      '########....########',
      '########....########',
      '#..................#',
      '#######......#######',
      '#######......#######',
      '###..............###',
      '###...##....##...###',
      '########....########',
      '#########..#########'],
    monsters:GATE_MONSTER_SPOTS},
    planTerm([
      'WVVVVVVVVVVVVVVVVVVW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WggggggggggggggggggW',
      'WWWWWWWWWggWWWWWWWWW']),
    {objects:[
      ['gatepodium',4,3,3,2,'Gate podium','GATE 0. FLIGHT 0. TO: NOWHERE. DEPARTS: 12:00. A sticky note on the counter: BACK IN FIVE MINUTES. It\'s dated 1989.',
        {when:[{...CH10_CLEAR,text:'GATE 0. A new card on the counter, in gold ink: THANK YOU FOR FLYING NOWHERE. YOUR LAYOVER WILL BE ANNOUNCED. And a little clock.'}]}],
      ['jetdoor',14,1,2,3,'Jet bridge door','The door to the jet bridge. Through the little window: a plane, lights on, engines quiet. Waiting.',
        {when:[{...CH10_CLEAR,text:'The door to the jet bridge. Through the little window: nothing. The plane is gone. The jet bridge is still swaying a little.'}]}],
      ['gateseats',3,5,5,2,'Gate seats','Four seats in a row, facing the window. Perfect for watching planes. There\'s one plane.'],
      ['gateseats',12,5,5,2,'Gate seats','Four seats. Rose takes the window. There are no windows on these seats. She takes it anyway.'],
      ['gateseats',1,8,6,2,'Gate seats','Four more seats. Amy stretches her calves on one. Tom pretends not to know her.'],
      ['gateseats',13,8,6,2,'Gate seats','Four seats. A tiny pilot hat on one of them. It\'s too small for anybody but Rose.'],
      ['termplant',1,10,2,2,'Plant','A plastic ficus with a GATE 0 tag on it. It\'s seen one flight. It\'s seen zero flights.'],
      ['termplant',17,10,2,2,'Plant','A plastic ficus. Its pot says CREW ONLY.']]})
);

// ---------- Rooms ----------
const LE_ROOMS=[
  {id:'bakery',w:11,h:10,
    style:{floor:'#dfbd8e',alt:'#e8cb9e',wall:'#c9a77e',trim:'#f0d5a9',pattern:'check',rug:'#c18268'},
    walls:[[5,1],[5,2],[5,3]],
    rug:[3,5,4,3],
    // Painted plate (art/bakery.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Brick oven and work table back left, glass bread counter across the back, window benches and the fern down the left,
    // dresser and roll basket down the right, half wall across the front with the doorway and mat in the middle.
    plateMask:[
      '###########',
      '###########',
      '###########',
      '###.#######',
      '##........#',
      '##........#',
      '##........#',
      '###.......#',
      '#####..####',
      '###########'],
    npcs:[
      {name:'Bun',x:4,y:5,look:'bun',lines:[
        'Welcome! Our bread is emotionally available.',
        'The baguettes? A little crusty.',
        "Today's special is yesterday's tomorrow toast."]}],
    objects:[
      ['oven',1,2,2,2,'The oven','A tiny sign says: "No buns left behind."'],
      ['counter',4,2,5,2,'Bread display','A loaf is wearing a little scarf. It\'s a breadwinner.',{variant:'bread'}],
      ['bench',1,4,1,2,'Window benches','The sunniest seats in town. A sign says: sit at your own risk of crumbs.'],
      ['shelf',10,3,1,4,'Recipe shelf','Every recipe begins with: "First, believe in butter."'],
      ['pot',0,6,2,2,'Flour fern','A flour-dusted fern. It seems to be self-raising.'],
      ['pot',10,7,1,1,'Roll basket','A basket of warm rolls. A tag says they are all named Gerald.']]},
  {id:'library',w:20,h:17,door:[10,16],door2:[9,16],spawn:{x:10,y:14},
    style:{floor:'#c7bbbd',alt:'#d6cccb',wall:'#a69ba8',trim:'#e2d6cf',pattern:'wood',rug:'#9992ad'},
    rug:[6,6,8,5],
    // Painted plate (art/library.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Shelf wall and staff door along the top, window counter and reading desk left, round table on the rug, tall stacks and the
    // cactus table right. The gate posts leave one carpeted aisle (x8-11) down to the street door at the bottom.
    plateMask:[
      '####################',
      '####################',
      '####################',
      '####################',
      '####################',
      '##................##',
      '##...............###',
      '##......####.....###',
      '#####...####......##',
      '#####...####......##',
      '#####.............##',
      '######...........###',
      '##...............###',
      '########....########',
      '########....########',
      '########....########',
      '#########..#########'],
    npcs:[
      {name:'Page',x:10,y:11,look:'page',roam:2,lines:[
        'Please whisper. The dictionaries are sleeping.',
        "Someone shelved a sandwich under 'S'.",
        'Technically correct. Deeply concerning.'],
        when:[{...CH7_DONE,lines:['It\'s quiet. Properly quiet. The good kind. Thank you, Tom.','Story time is Saturdays now. The Unread asked for Grace. By name.']},
              {...CH7_ON,flag:'ch7-page',lines:['The Stacks are through the staff door. Please be careful. And please don\'t answer the books.','I\'m fine. Everything is fine. The dictionaries haven\'t slept in a week.']},
              {...CH7_ON,lines:['It\'s fine. Everything is fine. Please whisper.','...Did you hear that? That wasn\'t me. I\'d know my own shush.']}]}],
    objects:[
      ['shelf',2,3,6,2,'Serious books','A book called "Advanced Napping" has fallen asleep.'],
      ['shelf',11,3,4,2,'Less serious books','Volume three of "How to Count" is labeled volume banana.'],
      ['desk',3,11,3,1,'Reading desk','The bookmark says: "You were probably around here."'],
      ['table',8,7,4,3,'Reading table','A vase of daisies sits on a stack of overdue books. The daisies are not sorry.'],
      ['pot',17,11,2,2,'Library cactus','A cactus is reading a very prickly romance.'],
      ['stacksdoor',16,4,2,1,'Staff door','STAFF ONLY. THE STACKS. A little brass sign under it: SHHH.',{stacks:true,
        when:[{chapter:7,flag:'ch7-page',text:'STAFF ONLY. THE STACKS. The door is unlocked. Cold air comes up the stairs, and a lot of whispering.'},
              {...CH7_DONE,text:'STAFF ONLY. THE STACKS. Somebody has added a second sign: STORY TIME, SATURDAYS, 10 AM. ALL BOOKS WELCOME.'}]}]]},
  {id:'greenhouse',w:12,h:10,
    style:{floor:'#aebe99',alt:'#becbab',wall:'#91a58d',trim:'#d7dfbd',pattern:'tile',rug:'#a8b480'},
    rug:[6,5,4,3],
    // Painted plate (art/greenhouse.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Two potting beds along the back, the barrel plant and back bench between them, plant stool and hose left, gardening shelf right,
    // the green rug in the middle. The arch at the bottom (x5 and x6) is the way out.
    plateMask:[
      '############',
      '############',
      '############',
      '######.#####',
      '#....#....##',
      '#.#.......##',
      '###.....####',
      '##......####',
      '#####..#####',
      '#####..#####'],
    npcs:[
      {name:'Fern',x:7,y:5,look:'fern',lines:[
        'I name every plant here.',
        "They're all called Steve. It saves time.",
        'Except that one. That\'s Assistant Steve.']}],
    objects:[
      ['planter',1,2,4,2,'The Steves','Three plants lean in. This appears to be a staff meeting.'],
      ['planter',7,2,4,2,'The other Steves','A label says: "Water daily. Compliment hourly."'],
      ['pot',2,5,1,2,'Assistant Steve','Assistant Steve has requested a corner office.'],
      ['shelf',8,6,3,2,'Gardening shelf','A manual titled "So You Have Soiled Yourself: Gardening Basics."']]},
  {id:'post',w:10,h:12,
    style:{floor:'#b6c3be',alt:'#c6d1c6',wall:'#8faaa8',trim:'#d5ddd0',pattern:'wood',rug:'#9baebb'},
    rug:[4,5,2,6],
    // Painted plate (art/post.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Sorting counter across the back, pigeonhole shelf and parcel scale on the back wall, the big stamp desk with chair and stool on the right,
    // the big plant on the left, the blue runner down the middle. The steps at the bottom (x4 and x5) are the way out.
    plateMask:[
      '##########',
      '##########',
      '##########',
      '######.###',
      '######..##',
      '###....###',
      '###....###',
      '###....###',
      '###.....##',
      '#.......##',
      '####..####',
      '####..####'],
    npcs:[
      {name:'Kit',x:7,y:4,look:'kit',lines:[
        'Your parcel is arriving any Tuesday now.',
        'The snails asked for smaller uniforms.',
        'I deliver good news. Bad news has to walk.']}],
    objects:[
      ['mailboxes',5,0,2,3,'Post boxes','Box 4 contains a letter addressed to "Whoever Smells Nice."'],
      ['counter',1,3,5,2,'Sorting counter','This pile is marked "Urgent-ish."',{variant:'letters'}],
      ['desk',7,5,3,3,'Stamp desk','A stamp featuring a potato. First-class taste.'],
      ['pot',0,5,3,4,'Office plant','The plant has received more postcards than you.'],
      ['pot',8,9,2,1,'Parcel basket','Every parcel in it is addressed to "The Occupant." The Occupant has not been in.']]},
  {id:'tea',w:12,h:9,
    style:{floor:'#d5ba9e',alt:'#e3cdb0',wall:'#bb9d88',trim:'#efd7b8',pattern:'wood',rug:'#c6aa76'},
    walls:[[1,1],[1,2],[10,1],[10,2]],
    rug:[5,5,2,3],
    // Painted plate (art/tea.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Tea table with two chairs left, biscuit table with two chairs right, the long counter and kettle along the back,
    // the mint planter and crates on the left wall, the rug in the middle. The gap between the two posts at the bottom (x5 and x6) is the way out.
    plateMask:[
      '############',
      '############',
      '############',
      '#####...####',
      '####....####',
      '##.........#',
      '#.........##',
      '#...#..#..##',
      '#####..#####'],
    npcs:[
      {name:'Oolong',x:5,y:3,look:'oolong',lines:[
        'The kettle has been gossiping again.',
        'It spilled the tea. Literally.',
        'Please mind the dramatic biscuits.'],
        when:[{chapter:3,flag:'ch3-tea',lines:['The kettle is still going on about that man in the long coat. Gold coins. Paying double.','I told it to mind its own business. It\'s a kettle. It has no business.']}]}],
    objects:[
      ['table',2,3,2,2,'Tea for two','Two cups are having a heated discussion.'],
      ['table',9,3,2,2,'Biscuit table','A biscuit whispers: "Dunk me. I dare you."'],
      ['pot',1,5,1,1,'Mint plant','The mint has excellent taste in itself.'],
      ['counter',5,1,5,2,'The kettle','The kettle says nothing. Suspiciously nothing.',{variant:'tea'}]]},
  {id:'observatory',w:13,h:12,
    style:{floor:'#8d9aab',alt:'#a0adbb',wall:'#718299',trim:'#bac8d1',pattern:'night',rug:'#777f9e'},
    rug:[4,5,6,4],
    // Painted plate (art/observatory.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Telescope platform and ladder back left, bookshelf and scroll barrel back centre, the silver door (with its rug) back right,
    // Luna's desk left, the moon rug in the middle, the Lost Sock star chart right, crates front right.
    // The stairs at the bottom (x6) are the way out; the club door is reached from its rug at (10,3).
    plateMask:[
      '#############',
      '#############',
      '#############',
      '##########.##',
      '#####......##',
      '###.......###',
      '####......###',
      '#####.....###',
      '###.....#####',
      '######.######',
      '######.######',
      '######.######'],
    npcs:[
      {name:'Luna',x:5,y:6,look:'luna',lines:[
        "I've discovered a new constellation.",
        "It's shaped exactly like my laundry.",
        'Space is asking me to tidy up.'],
        when:[{...CH9_DONE,lines:['The moon is back. I looked at it for an hour. I didn\'t even write anything down.','I swept the club stairs. Twelve years of wondering, and it was just a very dusty party.']},
              {...CH9_ON,flag:'ch9-luna',lines:['The door is open. Twelve years I have swept this floor, and that door is open.','If you see the moon up there, please tell it to come home. My telescope misses it.']},
              {...CH9_ON,lines:['There\'s supposed to be a full moon tonight. My telescope can\'t find it.','It\'s not behind a cloud. It\'s just not THERE. I checked four times.']}]}],
    objects:[
      ['telescope',3,2,3,2,'The telescope','You can see a star. It looks extremely pleased with itself.'],
      ['desk',1,6,3,2,'Research desk','An important equation: moon + cheese = dinner.'],
      ['shelf',6,2,4,2,'Space books','"Astronomy for People Who Keep Saying Astrology."'],
      ['chart',10,5,3,3,'Star chart','The constellation of the Lost Sock remains unaccounted for.'],
      ['toybox',8,8,3,2,'Supply crates','Stamped FRAGILE: CELESTIAL. Inside, mostly packing peanuts. Luna calls them meteorites.'],
      ['clubdoor',10,2,1,1,'Little silver door','A little silver door with a brass moon on it. A sign: MEMBERS ONLY. It\'s locked. It\'s always been locked.',{club:true,
        when:[{chapter:9,flag:'ch9-luna',text:'The little silver door is open. Stairs go up and up. Somewhere up there, very faintly, a piano.'},
              {...CH9_DONE,text:'The little silver door, propped open with a doorstop shaped like a moon. A new sign: ALL WELCOME. FULL MOONS.'}]}]]},
  {id:'shop',w:11,h:9,
    style:{floor:'#d9c49c',alt:'#e6d3ad',wall:'#c27a62',trim:'#f1d9b5',pattern:'check',rug:'#c9a24d'},
    rug:[3,6,5,2],
    // Painted plate (art/shop.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Gear shelf back left, snack shelf back right, the long counter across the middle (Penny works behind it),
    // battle bin and barrel front left, big plant front right, the yellow rug in the middle.
    // The low rail across the front has one gap (x5): the doorway and the mat below it.
    plateMask:[
      '###########',
      '###########',
      '###########',
      '#..#####..#',
      '#.........#',
      '##.......##',
      '##.......##',
      '#####.#####',
      '#####.#####'],
    npcs:[
      {name:'Penny',x:5,y:2,look:'penny',shopkeeper:true,roam:0,lines:[]}],
    objects:[
      ['counter',3,3,5,1,'Shop counter','A brass bell, a tin of coins and a sign: BUY. SELL. BROWSE. MOSTLY BUY.',{variant:'letters',shop:true}],
      ['shelf',1,1,2,2,'Gear shelf','Folded sweaters, tiny leotards and one fishing vest with twelve pockets.'],
      ['shelf',8,1,2,2,'Snack shelf','Picnic baskets, juice boxes, and cocoa tins stacked in a very confident tower.'],
      ['toybox',0,5,2,2,'Battle bin','Water balloons, kazoos and party poppers. A label says: FOR MONSTERS ONLY.'],
      ['pot',9,5,1,2,'Shop plant','It has a price tag. The price is "no."']]},
  {id:'taxi',w:11,h:9,
    style:{floor:'#c9c3b4',alt:'#d7d1c2',wall:'#a99a6e',trim:'#efe0b0',pattern:'check',rug:'#d9a43a'},
    rug:[3,5,5,2],
    // Painted plate (art/taxi.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Dispatch desk fills the back; rug in front of it; plant and chair left, lost and found table and umbrella stand right; two gate posts frame the door.
    plateMask:[
      '###########',
      '###########',
      '###########',
      '###########',
      '###########',
      '##......###',
      '##........#',
      '#...#.#...#',
      '#####.#####'],
    npcs:[
      {name:'Sal',x:5,y:5,look:'sal',driver:true,roam:0,lines:[
        'Long Island Taxi. We go anywhere in town. Town is small, so mostly here.',
        'I have one cab. It\'s cab seven. Cabs one through six are a dream I\'m working on.',
        'You just rode with me. You tipped in sourdough starter. Odd. Generous.']}],
    objects:[
      ['shelf',2,0,1,5,'Key board','Seven hooks. One key. Sal is optimistic.'],
      ['counter',3,0,3,5,'Dispatch desk','A radio crackles: "Cab seven, cab seven. Never mind, I can see you."',{variant:'letters'}],
      ['photo',6,0,4,5,'Driver of the month','It\'s Sal. It\'s always Sal. Sal is the only driver.'],
      ['desk',8,5,2,1,'Lost and found','One mitten, one umbrella, and a library book that\'s eleven years overdue.'],
      ['pot',0,5,2,2,'Waiting room plant','It\'s been waiting for a cab since spring. It\'s in no hurry.'],
      ['pot',10,5,1,2,'Umbrella stand','Umbrellas for a town where it rains twice a year. Sal keeps them anyway.']]},
  {id:'amyhouse',w:12,h:10,
    style:{floor:'#e2cfc0',alt:'#ead9cb',wall:'#c99aa4',trim:'#f0dde0',pattern:'tile',rug:'#d2a4b0'},
    rug:[6,5,4,3],
    // Painted plate (art/amyhouse.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Girls' beds along the back wall (a rug strip runs in front of them), plaid sofa and coffee table left, dining table and kitchen island right,
    // toy chest and step front left. One aisle (x6) joins the back strip to the front.
    plateMask:[
      '############',
      '############',
      '###.......##',
      '######.#####',
      '######.#####',
      '#####..#####',
      '#####...####',
      '#####...####',
      '#........###',
      '############'],
    npcs:[
      // Justin: Amy's husband, Grace and Rose's dad. Electrician, always mid-project. Away at work during chapter 5's
      // conferences (he texts Amy at the end); data/scenes.js AWAY rule.
      {name:'Justin',x:5,y:5,look:'bean',sheet:'justin',kin:true,trace:'justin-hello',duration:0.7,
        away:[{chapter:5,notFlag:'ch5-done'}],lines:[
        'Tom. Hey. Hold this. No, the other end. Don\'t touch the copper.',
        'Rewiring the hallway. Amy wanted a dimmer. Amy gets a dimmer.',
        'Grace, Rose, come here. Who\'s Daddy\'s favorite? Both. Correct. Go get \'em.'],
        revisit:[
          'Long Island born. Country music raised. Don\'t ask me how. Nobody knows.',
          'Big game tonight. If you hear yelling, that\'s me. If you hear crying, that\'s also me.',
          'Grace, you were amazing out there. Rose, you were also amazing. Also, why are you sticky?',
          'Fixed the porch light, the garbage disposal and the bunk bed. Before lunch.',
          'Every country song is about a truck, a dog or a girl. I got a truck and two girls. Living the song.',
          'Amy says I never sit down. I sat down once. It was a playoff game. We lost.',
          'Watch your step, Tom. That board is loose. I know. It\'s on the list.',
          'Those two girls are the best thing I ever built. And I built that deck.']},
      {name:'Amy',x:7,y:6,look:'dot',sheet:'amy',mom:true,duration:0.6,lines:[
        'Grace! Rose! Did you stretch before all this adventuring?',
        'Tom, I ran eight miles before you woke up. Just stating facts.',
        'Justin is rewiring the hallway. Again. He says hi from the ladder.'],
        when:[{from:5,flag:'ch5-done',lines:['Thirty conferences. Zero tears. Well. One. Mine. In the minivan.','Tom. Thank you for coming. You\'re the good uncle. By a lot.']}],
        revisit:[
          'Race you to the fountain. No? Then I win.',
          'Twelve kids in my room, and not one of them as wild as you two. Which I love.',
          'Rose, where are your shoes? Oh. Good.',
          'Grace, be nice to the slime. Then beat it. Those are the two rules.',
          'Tom, if they come back faster than me, we need to talk.',
          'Justin says the hallway light is almost done. It\'s been almost done since June.',
          'Did Boppy give you that cap? Don\'t let him near the pond.',
          'One of my kids read a whole page out loud today. First time. I cried in the supply closet.',
          'Rose. Big feelings are allowed. Throwing Lamby isn\'t. Come here.',
          'Grace, you don\'t have to be the best at it. You have to be the one who keeps going. Okay, now be the best at it.']}],
    objects:[
      ['bed',2,1,3,1,"Grace's bed",'Books under the pillow. A flashlight. A plan.'],
      ['bed',8,1,2,1,"Rose's bed",'Seventeen stuffed animals, arranged by importance.'],
      ['photo',5,1,2,1,'Family photo','Amy, Justin, Grace and Rose at a 5K. Amy won. Justin carried both girls across the finish anyway.'],
      ['toybox',1,6,3,2,'Toy box','Mostly rocks. Rose has a system.'],
      ['counter',8,5,4,3,'Kitchen counter','A stack of graded spelling tests, a race bib for Sunday, and three running medals used as coasters.',{variant:'letters'}]]},
  {id:'grands',w:12,h:10,
    style:{floor:'#cbb089',alt:'#d7be98',wall:'#9a8f78',trim:'#e6dcc3',pattern:'wood',rug:'#9c6e62'},
    rug:[3,5,6,3],
    // Painted plate (art/grands.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Recliner and lamp table top left, TV and plaid sofa centre, rocker and cabinets right, baking island left, round table right.
    plateMask:[
      '############',
      '############',
      '############',
      '####.#######',
      '#....#######',
      '##.......###',
      '#####...####',
      '#####...####',
      '#####...####',
      '############'],
    npcs:[
      {name:'Deedee',x:5,y:6,look:'pip',sheet:'deedee',grandma:true,duration:0.84,lines:[
        "There's my Tommy! And my girls! Come here, come here.",
        'Rhubarb crisp in the oven, dinner on the stove, floors just mopped. Shoes off. Who wants a cookie?',
        'Grace, Rose, Deedee loves you to the moon and back. Say it back. Louder.'],
        revisit:[
          'The tomatoes are coming in. You\'re going home with forty.',
          'I baked at five this morning. The neighbors have stopped asking why.',
          'Tommy, is that a bruise? Sit. Eat. Explain.',
          'To the moon and back, girls. The MOON. And BACK.',
          'Boppy says he\'s not feeling good. Boppy also won\'t stop fishing.',
          'Grace, Rose, who wants to help Deedee frost something?',
          'Rhubarb crisp is cooling on the counter. Don\'t touch it. Okay, one corner.',
          'I already did my walk. Boppy did one lap around the recliner.',
          'Retired registered nurse. Tom calls me a registered nut. Tom is due for a checkup.',
          'Sunday dinner is at five. Five means four thirty.',
          'I just cleaned the floors. Shoes OFF.',
          "A little glass of wine with dinner. Just one. Nurse's orders.",
          'Have you seen my reading glasses? I had them a minute ago. I\'ve looked everywhere. Twice.',
          'Found my glasses. They were in the fridge. Don\'t ask. Who wants a cookie?'],
        hug:[
          'Hugs for everyone. There. All better.',
          'Hugs for everyone, just because. To the moon and back.']},
      // Aunt Ellie visiting: in chapter 9 she minds the girls with cards; at the chapter 10 homecoming she wants the airport story.
      {name:'Aunt Ellie',x:7,y:5,look:'oolong',sheet:'ellie',kin:true,trace:'ellie-hello',duration:0.9,
        away:[{test:S=>!ELLIE_VISIT.some(storyMatch)}],
        lines:['Sit. Tell me about the airport. Leave nothing out. I\'ll know.'],
        when:[{...CH9_ON,flag:'ch9-letter',lines:['The girls and I are playing cards. I\'m winning. I\'m also cheating. They\'re learning a great deal.','Go. Dance. Somebody in this family should get to finish a party at the Moon Club.']}]},
      {name:'Boppy',x:8,y:5,look:'gus',sheet:'boppy',grandpa:true,duration:0.96,lines:[
        'Tom! Good. I\'m not feeling good. Something with the stomach. Sit, I\'ll tell you about it.',
        'Grace, Rose, come give Boppy a hug. Gently. The stomach. And slow down, you two walk too fast.',
        'Did I ever tell you I was a champion cross country runner in college? Your mother has heard it. Sit down.',
        'Here, take my spare cap. For luck. I caught nothing in it, so the luck is all still inside.'],
        revisit:[
          'Assistant Deputy Warden at Rikers. All those years, nobody got past me. Except that fish.',
          'At Rikers we did headcounts. Grace, one. Rose, two. Tom, you\'re dragging.',
          'In college I ran cross country. Champion. Through the woods, up the hills, never breathed hard.',
          'Did I tell you about the championship race? I did? Sit down. I\'ll tell you again.',
          'I\'m not feeling good. I was fine an hour ago. Then I had a pepper.',
          'Slow down, Tom. Who walks this fast? I was a champion runner and I never walked this fast.',
          'Deedee says I\'m not allowed near the pond. The pond says otherwise.',
          'Grace, Rose, who\'s the strongest grandpa? Correct. Now help me up.',
          'She\'s looking for her glasses again. They\'re on her head. I\'m not saying anything. I\'m saying it to you.']}],
    objects:[
      ['recliner',1,2,3,2,"Boppy's recliner",'Don\'t sit in it. Everyone has tried. Everyone has been told. There\'s a heating pad. And one pair of Deedee’s reading glasses, down the side. She\'s looked for these.'],
      ['tv',5,2,3,3,'The TV','The fishing channel. It\'s been on since 1994.'],
      ['counter',0,6,5,2,'Cookie counter','A cookie jar labeled DO NOT. The lid is off. Three pies cooling behind it.',{variant:'bread'}],
      ['photo',0,3,1,2,'Photo wall','Tom at six. Amy at four. Boppy in his college track singlet, holding a trophy. Another one with a fish.'],
      ['pot',8,3,1,2,'Pepper plant',"Boppy's pride. The label just says NO."]]},
  {id:'elliehouse',w:12,h:10,
    style:{floor:'#cdb9c6',alt:'#d8c6d2',wall:'#7a5a78',trim:'#eadcea',pattern:'wood',rug:'#6a3a8a'},
    rug:[3,4,6,3],
    // Painted plate (art/elliehouse.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Hutch and photo wall top left, kitchen top right, green sofa centre, tea table on the rug, dining table right,
    // armchair and basket lower right, vanity and umbrella stand left, entry stairs bottom centre (door at 6,9).
    plateMask:[
      '############',
      '############',
      '############',
      '######...###',
      '######...###',
      '##.....#####',
      '##.....#####',
      '##......####',
      '##.##..#####',
      '############'],
    npcs:[
      // Aunt Ellie: Deedee's aunt. Cosmopolitan, fashionable, sharp, wise, takes no nonsense. Lives here; visits the Rivituso house in chapters 9 and 10.
      {name:'Aunt Ellie',x:5,y:5,look:'oolong',sheet:'ellie',kin:true,trace:'ellie-hello',duration:0.9,away:ELLIE_VISIT,lines:[
        'Tom. Stand up straight. There. Now you look like someone I\'m related to.',
        'Yes, Deedee has an aunt. Yes, I\'m older. No, you may not ask by how much.',
        'I\'ve been to Paris eleven times. Long Island is charming. Like a hat you wear once.'],
        when:[{...CH9_DONE,lines:['My coat. Ticket seven. I left it at the last dance and never went back for it.','I had a date with a man who turned out to be a disappointment. The coat wasn\'t. Keep it warm for me.']}],
        revisit:[
          'Deedee keeps offering me rhubarb crisp. I keep saying yes. That\'s called manners.',
          'Boppy says his stomach hurts. I told him to stop eating peppers. He looked at me like I insulted his mother.',
          'Grace, darling, that outfit is wonderful. Rose, darling, that outfit is a choice. A brave one.',
          'Wisdom is remembering what went wrong and saying so before it happens again.',
          'Never apologize for being early, dressing up, or leaving a bad party.',
          'Tom, you have a good heart. Now do something about the shoes.',
          'Deedee says I\'m sharp. I say everyone else is a little dull.',
          'A good scarf fixes almost anything. Not Boppy. But almost anything.',
          'Somebody once told me I was too much. I outlived him. I dressed beautifully at the funeral.']}],
    objects:[
      ['shelf',5,2,2,1,'Writing cabinet','Cream stationery, a fountain pen, and a thank-you note for a favor nobody has done yet. A white orchid watches from the corner, alive for nine years out of pure intimidation.'],
      ['counter',7,2,2,1,'Kettle and fruit bowl','The kettle is always warm. Ellie says a kettle that waits is a kettle that judges.'],
      ['sofa',3,3,3,2,'Green sofa','Lace on the back, six cushions, zero crumbs. Nobody has ever been allowed to find out why.'],
      ['pot',2,3,1,2,'Lamp table','A tiny framed photo of Ellie on a ship deck in a wide white hat, 1968. The caption says: Arrived fashionably late.'],
      ['counter',7,5,2,2,'Tea table','One silver teapot, two cups, and a plate of cookies. A note on the saucer: The good china is not for Boppy.',{variant:'letters'}],
      ['pot',9,3,2,2,'Dining table','Set for two, in case Deedee drops by. Deedee has been told to call first.'],
      ['pot',8,7,1,1,'Side table','A book about Paris. Eleven trips, and she is still on the introduction.'],
      ['pot',1,6,1,1,'Umbrella stand','Six umbrellas, none for rain. Ellie says rain should dress better.'],
      ['recliner',0,7,2,2,"Ellie's vanity",'A silver brush, a pink shawl, and a mirror that has only ever agreed with her. Her wardrobe is upstairs. Every hanger faces the same way, and one hanger is empty. Ellie will not say why.']]}
];
