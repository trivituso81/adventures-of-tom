'use strict';
// engine/world.js — Map builders, the town and interiors, dialogue state.

const $ = id => document.getElementById(id);
const canvas = $('world'), ctx = canvas.getContext('2d');
let gfx = ctx; // drawing helpers target this; swapped to the battle canvas during fights
const mini = $('minimap'), mctx = mini.getContext('2d');
const game = $('game'), dpad = $('dpad'), actionButton = $('action');
const T = 32;
const DIR = {
  up:{x:0,y:-1},
  down:{x:0,y:1},
  left:{x:-1,y:0},
  right:{x:1,y:0}
};
const directionNames = Object.keys(DIR);
const key = (x,y) => x + ',' + y;
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const hash = (x,y) => {
  let n = Math.imul(x+71,374761393) ^ Math.imul(y+137,668265263);
  n = Math.imul(n ^ (n>>>13),1274126177);
  return (n ^ (n>>>16)) >>> 0;
};
const pick = items => items[Math.floor(Math.random()*items.length)];
const visited = new Set();

const houses = [
  {id:'bakery',area:'town',name:'Crumb Bakery',label:'CRUMB',x:2,y:3,w:5,h:5,roof:'#be7051',light:'#dc9264',wall:'#efd3a0'},
  {id:'library',area:'town',name:'The Hush Library',label:'BOOKS',x:9,y:3,w:5,h:5,roof:'#8d7293',light:'#ad8ba7',wall:'#e8ddbd'},
  {id:'greenhouse',area:'town',name:'Sprout House',label:'SPROUT',x:16,y:3,w:5,h:5,roof:'#568879',light:'#9bcab3',wall:'#c0d7b1'},
  {id:'post',area:'town',name:'Snail Mail',label:'POST',x:2,y:14,w:5,h:5,roof:'#618697',light:'#83a7b2',wall:'#ebdcc0'},
  {id:'tea',area:'town',name:'Kettle Cottage',label:'KETTLE',x:9,y:14,w:5,h:5,roof:'#b28d4e',light:'#d1b26c',wall:'#e8c3ac'},
  {id:'observatory',area:'town',name:'Moon Club',label:'MOON',x:16,y:14,w:5,h:5,roof:'#657898',light:'#8b9cba',wall:'#d6d9d4'},
  {id:'taxi',area:'town',name:'Elsewhere Taxi Co.',label:'TAXI',x:23,y:14,w:5,h:5,roof:'#d9a43a',light:'#f2c75a',wall:'#efe4cb',taxi:true},
  {id:'shop',area:'town',name:"Penny's Pockets",label:'SHOP',x:23,y:3,w:5,h:5,roof:'#b9483f',light:'#d9675b',wall:'#f3e3bf',shop:true},
  {id:'amyhouse',area:'row',x:9,y:4,name:"Amy's House",label:'GREGORI',w:5,h:5,roof:'#c0707e',light:'#dc9aa5',wall:'#f0e2d6'},
  {id:'grands',area:'row',x:16,y:4,name:"Deedee and Boppy's House",label:'RIVITUSO',w:5,h:5,roof:'#8d7b63',light:'#b59e82',wall:'#ead9b8'}
];
const houseById = Object.fromEntries(houses.map(h => [h.id,h]));

const palettes = {
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
  sal:{skin:'#c99372',hair:'#3e3433',shirt:'#e7b73e',pants:'#3c3f4c',hat:'#2c2c33'}
};

function makeMap(id,name,w,h,outside,style={}) {
  return {
    id,name,w,h,outside,style,
    tiles:Array.from({length:h},()=>Array(w).fill(outside?'grass':'floor')),
    solid:new Uint8Array(w*h),
    objects:[],
    objectAt:new Map(),
    npcs:[],
    portals:new Map(),
    npcNoGo:new Set(),
    rugs:[],
    wanderSpots:[]
  };
}

function within(map,x,y) {
  return x>=0 && y>=0 && x<map.w && y<map.h;
}

function tile(map,x,y,type,solid=false) {
  if(!within(map,x,y)) return;
  map.tiles[y][x]=type;
  map.solid[y*map.w+x]=solid?1:0;
}

function object(map,kind,x,y,w=1,h=1,name='',text='',extra={}) {
  const o={kind,x,y,w,h,name,text,...extra};
  map.objects.push(o);
  for(let yy=y;yy<y+h;yy++) {
    for(let xx=x;xx<x+w;xx++) {
      if(within(map,xx,yy)) {
        map.solid[yy*map.w+xx]=1;
        map.objectAt.set(key(xx,yy),o);
      }
    }
  }
  return o;
}

function actor(name,x,y,palette,lines,isPlayer=false) {
  return {
    name,x,y,facing:'down',
    palette:palettes[palette],paletteName:palette,
    lines,isPlayer,
    move:null,
    walkClock:0,
    path:[],
    idle:.5+Math.random()*1.8,
    roam:isPlayer?0:9,
    duration:isPlayer?.14:.8
  };
}

function walkable(map,x,y) {
  return within(map,x,y) && map.solid[y*map.w+x]===0;
}

function finishMap(map) {
  for(let y=0;y<map.h;y++) {
    for(let x=0;x<map.w;x++) {
      if(walkable(map,x,y) && !map.npcNoGo.has(key(x,y)) &&
         (!map.outside || map.tiles[y][x]==='path')) {
        map.wanderSpots.push({x,y});
      }
    }
  }
}

// ---------- Outdoor areas: The Square (shops), Rivituso Row (homes), Grump Hollow (the pond) ----------
// Each area is its own map. Openings in the tree border lead to the next area.
function border(map,openings) {
  const open=new Set(openings.map(([x,y])=>key(x,y)));
  for(let x=0;x<map.w;x++) for(const y of [0,map.h-1]) if(!open.has(key(x,y))) object(map,'tree',x,y);
  for(let y=1;y<map.h-1;y++) for(const x of [0,map.w-1]) if(!open.has(key(x,y))) object(map,'tree',x,y);
}
function placeHouse(map,h,pathEnd) {
  h.door={x:h.x+Math.floor(h.w/2),y:h.y+h.h-1};
  h.area=map.id;
  for(let y=h.y;y<h.y+h.h;y++) for(let x=h.x;x<h.x+h.w;x++) tile(map,x,y,'building',true);
  tile(map,h.door.x,h.door.y,'door');
  for(let y=h.door.y+1;y<=pathEnd;y++) tile(map,h.door.x,y,'path');
  map.portals.set(key(h.door.x,h.door.y),{kind:'enter',house:h});
  map.npcNoGo.add(key(h.door.x,h.door.y));
  map.npcNoGo.add(key(h.door.x,h.door.y+1));
  map.houses.push(h);
}
// An opening on the map edge: stepping onto it carries the party to another area.
function opening(map,x,y,to,spawn,facing) {
  tile(map,x,y,'path');
  map.portals.set(key(x,y),{kind:'edge',to,spawn,facing});
  map.npcNoGo.add(key(x,y));
  map.npcNoGo.add(key(x+DIR[facing].x*-1,y+DIR[facing].y*-1));
}
function paths(map,list) { for(const [x0,y0,x1,y1] of list) for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) tile(map,x,y,'path'); }

function makeSquare() {
  const map=makeMap('town','The Square',30,26,true);
  map.houses=[];
  map.tag='Eight doors, one fountain, one place that sells things.';
  map.eyebrow='LITTLE ELSEWHERE / THE SQUARE';
  map.hint='Shops up here, Penny\'s Pockets to the east. Family south. Trouble north.';
  map.spawn={x:11,y:10};

  paths(map,[[2,9,27,10],[2,20,27,21],[7,0,8,21],[14,9,15,25],[9,9,13,12]]);
  for(const h of houses.filter(h=>h.area==='town')) placeHouse(map,h,h.y<10?10:21);

  border(map,[[7,0],[8,0],[14,25],[15,25]]);
  opening(map,7,0,'hollow',{x:7,y:20},'up');
  opening(map,8,0,'hollow',{x:8,y:20},'up');
  opening(map,14,25,'row',{x:14,y:1},'down');
  opening(map,15,25,'row',{x:15,y:1},'down');

  for(const [x,y] of [
    [1,2],[14,2],[21,2],[22,4],[1,6],[14,7],[22,7],[2,11],[5,12],
    [17,11],[19,12],[21,11],[20,13],[1,15],[14,18],[21,16],[1,21],[6,22],[17,22],[20,22],[3,23],[10,23],[19,23],[12,24],
    [23,12],[28,11],[28,16],[28,19],[24,23],[27,22],[22,24],[28,24]
  ]) object(map,'tree',x,y);
  for(const x of [3,4,5,16,17,18,19,20,23,24,25,26,27]) object(map,'fence',x,1);
  for(const x of [2,3,4,5,10,11,12,13]) object(map,'fence',x,22);

  object(map,'sign',10,12,1,1,'Town notice',
    'Eight doors. One of them actually sells things: Penny\'s Pockets, east end. Look for the coin.');
  object(map,'sign',6,1,1,1,'North signpost','GRUMP HOLLOW, this way. Mind the mud. Mind the Grump. Mostly the Grump.');
  object(map,'sign',16,24,1,1,'South signpost','RIVITUSO ROW, this way. Cookies likely. Quiet unlikely.');
  object(map,'fountain',12,11,1,1,'Wish fountain',
    'A coin reads: "Please do not wish for more coins."');
  object(map,'bench',3,12,2,1,'An important bench',
    'Reserved for people with very important sitting to do.');
  object(map,'bench',18,10,2,1,'The sunny bench','Warm from the sun. Or from Gus. Hard to say.');
  object(map,'planter',17,13,2,1,'Square flowers','Planted by Fern. Each one is named Steve.');
  object(map,'sign',22,11,1,1,'Shop sign','PENNY\'S POCKETS. Gear for the whole family. Snacks for fights. We buy almost anything.',{shopSign:true});
  object(map,'taxi',26,19,2,1,'Cab 7','The only cab in town. The meter is still running. Tom is choosing not to look at it.');
  object(map,'planter',27,8,1,1,'Shop flowers','A pot of marigolds with a price tag on it. Not for sale. Penny checked.');

  map.npcs.push(
    actor('Pip',3,10,'pip',[
      "I'm taking my pet rock for a walk.",
      "He's shy. Please don't make eye contact.",
      "Excellent. He's already learned 'stay'."
    ]),
    actor('Moss',8,13,'moss',[
      'I asked a tree for directions.',
      'It said nothing. Very mysterious.',
      "I think I'm barking up the wrong tree."
    ]),
    actor('Dot',16,9,'dot',[
      'This town has ten doors and two gaps in the trees.',
      "I've counted them seventeen times.",
      "Tomorrow I'm moving on to windows."
    ])
  );
  finishMap(map);
  return map;
}

function makeRow() {
  const map=makeMap('row','Rivituso Row',24,22,true);
  map.houses=[];
  map.tag='Two houses. One family. Cookies at Deedee\'s.';
  map.eyebrow='LITTLE ELSEWHERE / RIVITUSO ROW';
  map.hint='Home. Knock on any door. Someone will feed you.';
  map.spawn={x:14,y:2};

  paths(map,[[14,0,15,11],[2,10,21,11],[7,10,8,19],[2,18,21,19],[14,11,15,19]]);
  for(const h of houses.filter(h=>h.area==='row')) placeHouse(map,h,10);

  border(map,[[14,0],[15,0]]);
  opening(map,14,0,'town',{x:14,y:24},'up');
  opening(map,15,0,'town',{x:15,y:24},'up');

  for(const [x,y] of [
    [1,2],[7,2],[21,2],[22,3],[1,7],[22,8],[1,13],[22,13],[4,15],[11,15],[18,16],[1,17],[22,17],[3,20],[10,20],[17,20],[20,20]
  ]) object(map,'tree',x,y);
  for(const x of [2,3,4,5,6,9,10,11,12,13]) object(map,'fence',x,1);
  for(const x of [16,17,18,19,20]) object(map,'fence',x,1);
  for(const x of [16,17,18,19,20,21]) object(map,'fence',x,14);

  object(map,'sign',16,1,1,1,'Row signpost','THE SQUARE, back that way. Shops, fountain, Pip\'s rock.');
  object(map,'sign',10,13,1,1,'Family notice',
    'Rivituso Row. Cookies at Deedee\'s. Juice at Amy\'s. Peace and quiet at nobody\'s.');
  object(map,'bench',4,13,2,1,'The other bench','Boppy sat here once in 2019. It is still his.');
  object(map,'planter',17,15,3,1,"Deedee's tomatoes",'Forty tomatoes. You will be sent home with all of them.');
  object(map,'planter',20,16,2,1,"Boppy's peppers",'A pepper so hot the garden hose flinched. Boppy is proud.');
  object(map,'planter',2,16,3,1,"Deedee's herb bed",'Basil, mint and rosemary. Deedee says the rosemary is for Boppy\'s stomach. Boppy disagrees.');
  object(map,'planter',2,7,3,1,'Community garden','Squash, beans and a scarecrow wearing Boppy\'s old cap. The scarecrow walks too fast, apparently.');
  object(map,'tree',3,4); object(map,'tree',5,5);
  object(map,'sign',4,9,1,1,'Corner garden','Everybody on the Row shares this patch. Grace planted a sunflower. Rose planted a rock.');
  object(map,'bench',11,20,2,1,'The porch bench','Grace and Rose\'s chalk drawings cover the seat. Sit carefully. Sit colorfully.');

  map.npcs.push(
    actor('Gus',5,19,'gus',[
      "I'm training for the annual sit-down.",
      'My coach is a bench.',
      'We have a very supportive relationship.'
    ]),
    actor('Bean',17,18,'bean',[
      "I'm not lost. I'm collecting wrong turns.",
      'That pond up north owes me an apology.',
      'Long story. Short socks.'
    ])
  );
  finishMap(map);
  return map;
}

function makeHollow() {
  const map=makeMap('hollow','Grump Hollow',24,22,true);
  map.houses=[];
  map.tag='Soggy. Smelly. Six things are watching from the pond.';
  map.eyebrow='LITTLE ELSEWHERE / GRUMP HOLLOW';
  map.hint='Monsters live here. Mudling is easy. The Big One is not.';
  map.spawn={x:7,y:19};
  map.wild=true;

  paths(map,[[7,13,8,21],[3,13,12,14]]);
  border(map,[[7,21],[8,21]]);
  opening(map,7,21,'town',{x:7,y:1},'down');
  opening(map,8,21,'town',{x:8,y:1},'down');

  // The pond, with a muddy shore.
  const water=[
    [13,4],[14,4],[15,4],[16,4],
    [12,5],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5],
    [11,6],[12,6],[13,6],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6],
    [11,7],[12,7],[13,7],[14,7],[15,7],[16,7],[17,7],[18,7],[19,7],[20,7],
    [12,8],[13,8],[14,8],[15,8],[16,8],[17,8],[18,8],[19,8],[20,8],
    [12,9],[13,9],[14,9],[15,9],[16,9],[17,9],[18,9],[19,9],
    [13,10],[14,10],[15,10],[16,10],[17,10],[18,10],
    [14,11],[15,11],[16,11],[17,11]
  ];
  const wet=new Set(water.map(([x,y])=>key(x,y)));
  for(const [x,y] of water) tile(map,x,y,'water',true);
  for(const [x,y] of water) for(const d of Object.values(DIR)) {
    const nx=x+d.x,ny=y+d.y;
    if(within(map,nx,ny)&&!wet.has(key(nx,ny))&&map.tiles[ny][nx]==='grass') tile(map,nx,ny,'mud');
  }
  for(const [x,y] of [[9,13],[10,13],[11,13],[9,12],[6,16],[5,17],[12,15],[13,14],[18,13],[19,13],[20,12],[21,11]]) if(map.tiles[y][x]==='grass') tile(map,x,y,'mud');

  for(const [x,y] of [
    [2,2],[4,1],[6,2],[9,2],[11,1],[20,2],[22,3],[1,4],[3,4],[5,5],[8,5],[1,8],[3,9],[6,8],[21,10],[22,12],
    [1,11],[2,15],[1,17],[4,19],[11,17],[14,16],[16,15],[19,16],[21,18],[12,19],[16,19],[20,20],[1,20],[22,20],[8,10],[9,7]
  ]) object(map,'tree',x,y);
  for(const x of [3,4,5,6,9,10]) object(map,'fence',x,20);

  object(map,'sign',6,13,1,1,'Crooked sign','GRUMP HOLLOW. Trespassers will be squelched. Start with the Mudling. Save the fish for last.');
  object(map,'sign',9,5,1,1,'Pond sign','NO SWIMMING. The pond signed this itself.');
  object(map,'bench',3,16,2,1,'Soggy bench','Nobody has sat here since the Grump moved in. The bench misses company.');
  object(map,'bench',18,18,2,1,"Boppy's fishing spot",'A thermos, a bucket, zero fish. Boppy swears the big one lives here.');
  object(map,'sign',16,13,1,1,'Warning stake','THE GRUMP IS NOT A FROG. It would like that noted.');

  // The monsters. Each stands on its own spot; stats and art come from data/monsters.js.
  for(const [id,x,y] of MONSTER_SPOTS) {
    const d=MONSTERS[id];
    const mon=actor(d.name,x,y,'moss',[]);
    mon.monster=id;
    mon.roam=0;
    mon.tier=0;
    mon.maxHp=d.hp;
    mon.defeatedUntil=0;
    map.npcs.push(mon);
  }

  finishMap(map);
  return map;
}

function findGrump() { return findMonster('grump'); }
function findMonster(id) { for(const m of Object.values(worlds)) { const g=m.npcs.find(n=>n.monster===id); if(g) return g; } return null; }
function allMonsters() { const out=[]; for(const m of Object.values(worlds)) for(const n of m.npcs) if(n.monster) out.push(n); return out; }

const roomSpecs = [
  {
    id:'bakery',w:11,h:10,
    style:{floor:'#dfbd8e',alt:'#e8cb9e',wall:'#c9a77e',trim:'#f0d5a9',pattern:'check',rug:'#c18268'},
    walls:[[5,1],[5,2],[5,3]],
    rug:[3,5,4,3],
    resident:['Bun',4,5,'bun',[
      "Welcome! Our bread is emotionally available.",
      'The baguettes? A little crusty.',
      "Today's special is yesterday's tomorrow toast."
    ]],
    objects:[
      ['oven',1,2,2,2,'The oven','A tiny sign says: "No buns left behind."'],
      ['counter',6,2,3,1,'Bread display','A loaf is wearing a little scarf. It is a breadwinner.',{variant:'bread'}],
      ['shelf',7,6,2,1,'Recipe shelf','Every recipe begins with: "First, believe in butter."'],
      ['pot',1,7,1,1,'Flour fern','A flour-dusted fern. It seems to be self-raising.']
    ]
  },
  {
    id:'library',w:13,h:11,
    style:{floor:'#c7bbbd',alt:'#d6cccb',wall:'#a69ba8',trim:'#e2d6cf',pattern:'wood',rug:'#9992ad'},
    walls:[[6,1],[6,2],[6,3],[6,4]],
    rug:[3,6,6,3],
    resident:['Page',6,7,'page',[
      'Please whisper. The dictionaries are sleeping.',
      "Someone shelved a sandwich under 'S'.",
      'Technically correct. Deeply concerning.'
    ]],
    objects:[
      ['shelf',1,2,4,1,'Serious books','A book called "Advanced Napping" has fallen asleep.'],
      ['shelf',8,2,3,1,'Less serious books','Volume three of "How to Count" is labeled volume banana.'],
      ['desk',2,7,2,1,'Reading desk','The bookmark says: "You were probably around here."'],
      ['pot',10,8,1,1,'Library cactus','A cactus is reading a very prickly romance.']
    ]
  },
  {
    id:'greenhouse',w:12,h:10,
    style:{floor:'#aebe99',alt:'#becbab',wall:'#91a58d',trim:'#d7dfbd',pattern:'tile',rug:'#a8b480'},
    walls:[[5,2],[5,3],[5,5]],
    rug:[6,5,4,3],
    resident:['Fern',7,5,'fern',[
      'I name every plant here.',
      "They're all called Steve. It saves time.",
      'Except that one. That is Assistant Steve.'
    ]],
    objects:[
      ['planter',1,2,3,2,'The Steves','Three plants lean in. This appears to be a staff meeting.'],
      ['planter',7,2,3,2,'The other Steves','A label says: "Water daily. Compliment hourly."'],
      ['pot',2,7,1,1,'Assistant Steve','Assistant Steve has requested a corner office.'],
      ['shelf',8,7,2,1,'Gardening shelf','A manual titled "So You Have Soiled Yourself: Gardening Basics."']
    ]
  },
  {
    id:'post',w:10,h:12,
    style:{floor:'#b6c3be',alt:'#c6d1c6',wall:'#8faaa8',trim:'#d5ddd0',pattern:'wood',rug:'#9baebb'},
    walls:[[1,4],[8,4]],
    rug:[3,7,4,3],
    resident:['Kit',5,3,'kit',[
      'Your parcel is arriving any Tuesday now.',
      'The snails asked for smaller uniforms.',
      'I deliver good news. Bad news has to walk.'
    ]],
    objects:[
      ['mailboxes',1,1,2,2,'Post boxes','Box 4 contains a letter addressed to "Whoever Smells Nice."'],
      ['counter',2,4,4,1,'Sorting counter','This pile is marked "Urgent-ish."',{variant:'letters'}],
      ['desk',6,8,2,1,'Stamp desk','A stamp featuring a potato. First-class taste.'],
      ['pot',1,9,1,1,'Office plant','The plant has received more postcards than you.']
    ]
  },
  {
    id:'tea',w:12,h:9,
    style:{floor:'#d5ba9e',alt:'#e3cdb0',wall:'#bb9d88',trim:'#efd7b8',pattern:'wood',rug:'#c6aa76'},
    walls:[[1,1],[1,2],[10,1],[10,2]],
    rug:[4,2,3,5],
    resident:['Oolong',5,3,'oolong',[
      'The kettle has been gossiping again.',
      'It spilled the tea. Literally.',
      'Please mind the dramatic biscuits.'
    ]],
    objects:[
      ['table',2,3,2,2,'Tea for two','Two cups are having a heated discussion.'],
      ['table',7,3,2,2,'Biscuit table','A biscuit whispers: "Dunk me. I dare you."'],
      ['pot',1,6,1,1,'Mint plant','The mint has excellent taste in itself.'],
      ['counter',7,1,3,1,'The kettle','The kettle says nothing. Suspiciously nothing.',{variant:'tea'}]
    ]
  },
  {
    id:'observatory',w:13,h:12,
    style:{floor:'#8d9aab',alt:'#a0adbb',wall:'#718299',trim:'#bac8d1',pattern:'night',rug:'#777f9e'},
    walls:[[8,6],[9,6],[10,6],[11,6],[8,7],[8,9]],
    rug:[2,5,5,5],
    resident:['Luna',5,6,'luna',[
      "I've discovered a new constellation.",
      "It's shaped exactly like my laundry.",
      'Space is asking me to tidy up.'
    ]],
    objects:[
      ['telescope',5,2,3,2,'The telescope','You can see a star. It looks extremely pleased with itself.'],
      ['desk',1,7,3,1,'Research desk','An important equation: moon + cheese = dinner.'],
      ['shelf',9,2,2,1,'Space books','"Astronomy for People Who Keep Saying Astrology."'],
      ['chart',9,8,2,1,'Star chart','The constellation of the Lost Sock remains unaccounted for.']
    ]
  },
  {
    id:'shop',w:11,h:9,
    style:{floor:'#d9c49c',alt:'#e6d3ad',wall:'#c27a62',trim:'#f1d9b5',pattern:'check',rug:'#c9a24d'},
    walls:[],
    rug:[3,6,5,2],
    resident:['Penny',5,2,'penny',[],{shopkeeper:true,roam:0}],
    objects:[
      ['counter',3,3,5,1,'Shop counter','A brass bell, a tin of coins and a sign: BUY. SELL. BROWSE. MOSTLY BUY.',{variant:'letters',shop:true}],
      ['shelf',1,1,2,1,'Gear shelf','Folded sweaters, tiny leotards and one fishing vest with twelve pockets.'],
      ['shelf',8,1,2,1,'Snack shelf','Picnic baskets, juice boxes, and cocoa tins stacked in a very confident tower.'],
      ['toybox',1,6,1,1,'Battle bin','Water balloons, kazoos and party poppers. A label says: FOR MONSTERS ONLY.'],
      ['pot',9,6,1,1,'Shop plant','It has a price tag. The price is "no."']
    ]
  },
  {
    id:'taxi',w:11,h:9,
    style:{floor:'#c9c3b4',alt:'#d7d1c2',wall:'#a99a6e',trim:'#efe0b0',pattern:'check',rug:'#d9a43a'},
    walls:[],
    rug:[3,5,5,2],
    resident:['Sal',5,5,'sal',[
      'Elsewhere Taxi. We go anywhere in town. Town is small, so mostly here.',
      'I have one cab. It is cab seven. Cabs one through six are a dream I am working on.',
      'You just rode with me. You tipped in sourdough starter. Odd. Generous.'
    ]],
    objects:[
      ['counter',3,3,5,1,'Dispatch desk','A radio crackles: "Cab seven, cab seven. Never mind, I can see you."',{variant:'letters'}],
      ['shelf',1,1,2,1,'Key board','Seven hooks. One key. Sal is optimistic.'],
      ['photo',8,1,1,1,'Driver of the month','It is Sal. It is always Sal. Sal is the only driver.'],
      ['desk',7,6,2,1,'Lost and found','One mitten, one umbrella, and a library book that is eleven years overdue.'],
      ['pot',1,6,1,1,'Waiting room plant','It has been waiting for a cab since spring. It is in no hurry.']
    ]
  },
  {
    id:'amyhouse',w:12,h:10,
    style:{floor:'#e2cfc0',alt:'#ead9cb',wall:'#c99aa4',trim:'#f0dde0',pattern:'tile',rug:'#d2a4b0'},
    walls:[[5,1],[5,2],[5,3]],
    rug:[6,5,4,3],
    residents:[['Amy',7,6,'dot',[
      'Grace! Rose! Did you stretch before all this adventuring?',
      'Tom, I ran eight miles before you woke up. Just stating facts.',
      'Justin is at work today. He says hi.'
    ],{sheet:'amy',mom:true,duration:.6}]],
    objects:[
      ['bed',1,2,2,2,"Grace's bed",'Books under the pillow. A flashlight. A plan.'],
      ['bed',8,2,2,2,"Rose's bed",'Seventeen stuffed animals, arranged by importance.'],
      ['photo',6,1,1,1,'Family photo','Amy, Justin, Grace and Rose at a 5K. Amy won. Justin carried both girls across the finish anyway.'],
      ['toybox',1,7,2,1,'Toy box','Mostly rocks. Rose has a system.'],
      ['counter',8,7,3,1,'Kitchen counter','A stack of graded spelling tests, a race bib for Sunday, and three running medals used as coasters.',{variant:'letters'}]
    ]
  },
  {
    id:'grands',w:12,h:10,
    style:{floor:'#cbb089',alt:'#d7be98',wall:'#9a8f78',trim:'#e6dcc3',pattern:'wood',rug:'#9c6e62'},
    walls:[[1,4],[10,4]],
    rug:[3,5,6,3],
    residents:[
      ['Deedee',4,6,'pip',[
        "There's my Tommy! And my two angels! Come here, come here.",
        'Rhubarb crisp in the oven, dinner on the stove, floors just mopped. Shoes off. Who wants a cookie?',
        'Grace, Rose, Deedee loves you to the moon and back. Say it back. Louder.'
      ],{sheet:'deedee',grandma:true,duration:.84}],
      ['Boppy',8,5,'gus',[
        'Tom! Good. I am not feeling good. Something with the stomach. Sit, I will tell you about it.',
        'Grace, Rose, come give Boppy a hug. Gently. The stomach. And slow down, you two walk too fast.',
        'Did I ever tell you I was a champion cross country runner in college? Your mother has heard it. Sit down.',
        'Here, take my spare cap. For luck. I caught nothing in it, so the luck is all still inside.'
      ],{sheet:'boppy',grandpa:true,duration:.96}]
    ],
    objects:[
      ['recliner',1,1,2,2,"Boppy's recliner",'Do not sit in it. Everyone has tried. Everyone has been told. There is a heating pad.'],
      ['tv',5,1,3,1,'The TV','The fishing channel. It has been on since 1994.'],
      ['counter',1,7,4,1,'Cookie counter','A cookie jar labeled DO NOT. The lid is off. Three pies cooling behind it.',{variant:'bread'}],
      ['photo',9,7,1,1,'Photo wall','Tom at six. Amy at four. Boppy in his college track singlet, holding a trophy. Another one with a fish.'],
      ['pot',10,1,1,1,'Pepper plant','Boppy\'s pride. The label just says NO.']
    ]
  }
];

function makeRoom(spec) {
  const house=houseById[spec.id];
  const map=makeMap(spec.id,house.name,spec.w,spec.h,false,spec.style);

  for(let y=0;y<map.h;y++)
    for(let x=0;x<map.w;x++)
      if(x===0||y===0||x===map.w-1||y===map.h-1)
        tile(map,x,y,'wall',true);

  for(const [x,y] of spec.walls) tile(map,x,y,'wall',true);
  // Optional ASCII floor plan: '#' is a wall, anything else is floor.
  if(spec.plan) spec.plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) if(row[x]==='#') tile(map,x,y,'wall',true); });

  const dx=spec.door?spec.door[0]:Math.floor(map.w/2),dy=spec.door?spec.door[1]:map.h-1;
  tile(map,dx,dy,'exit');
  map.spawn={x:dx,y:dy-1};
  map.portals.set(key(dx,dy),{kind:'exit',house});
  map.npcNoGo.add(key(dx,dy));
  map.npcNoGo.add(key(dx,dy-1));
  map.rugs.push({x:spec.rug[0],y:spec.rug[1],w:spec.rug[2],h:spec.rug[3]});

  for(const o of spec.objects) object(map,...o);

  for(const r of (spec.residents||[spec.resident])) {
    const n=actor(...r.slice(0,5));
    n.roam=3;
    n.duration=.9;
    if(r[5]) Object.assign(n,r[5]);
    map.npcs.push(n);
  }

  finishMap(map);
  return map;
}

const town=makeSquare(),worlds={town,row:makeRow(),hollow:makeHollow()};
for(const spec of roomSpecs) worlds[spec.id]=makeRoom(spec);

let currentMap=town;
const player=actor('You',11,10,'player',[],true);
let queuedAction=false,transition=null,allVisited=false;
let W=1,H=1,scale=2,safeTop=40,safeBottom=85;
const camera={x:0,y:0,snap:true};
const input={
  keys:new Map(),
  touchId:null,
  touchDir:null,
  padDir:null,
  mouseDown:false,
  mouseDir:null,
  actionId:null
};
const dialog={
  choice:null,
  lastDir:null,
  active:false,
  name:'',
  lines:[],
  index:0,
  chars:[],
  shown:0,
  elapsed:0,
  delay:.025,
  npc:null
};
let toastUntil=0,lastTouchTime=-10000,elapsedTime=0,lastBump=0;
let kiss=null; // {npc,start} while Tom and TNB greet

function showToast(text,seconds=2.8) {
  $('toast').textContent=text;
  toastUntil=performance.now()+seconds*1000;
}

