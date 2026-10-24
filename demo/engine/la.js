'use strict';
// engine/la.js — Los Angeles: the second town, reached by plane from Long Island Taxi Co.
// Three areas, laid out like Long Island: Downtown LA (map id 'blvd'; shops and apartments), Jefferson Park
// (historic craftsman neighborhood with a Jefferson Boulevard shop strip, to the south) and Griffith Park (monsters, north).
// Every LA map and room has region:'la'. Rendering lives in engine/la-render.js; the flight and taxis in engine/travel.js.

const regionOf=map=>(map&&map.region)||'le';
const REGION_NAME={le:'LONG ISLAND',la:'LOS ANGELES'};

// ---------- Buildings ----------
// Downtown styles: deco (historic core: storefront with apartments above), cinema (Broadway movie palace), loft
// (brick warehouse lofts), tower (glass high-rise). floors = stories drawn above the storefront.
// Jefferson Park styles: strip (one-story Jefferson Boulevard storefront), store (the sleek new juice bar),
// craftsman (1900s bungalow; cond renovated, kept or rundown), spanish.
const LA_HOUSES=[
  {id:'coffee',area:'blvd',name:'Golden Hour Coffee',label:'COFFEE',x:2,y:3,w:5,h:5,style:'deco',floors:3,wall:'#d9b48a',stone:'#efdcbc',roof:'#8a5a3a',awning:'#e2a24a',awning2:'#fff1d6',sign:'#3d2b26',ink:'#ffd968',icon:'cup',fire:true},
  {id:'ramen',area:'blvd',name:'Ramen Ramen',label:'RAMEN',x:9,y:3,w:5,h:5,style:'deco',floors:4,wall:'#c98f6a',stone:'#e8c8a8',roof:'#7a3a33',awning:'#b9483f',awning2:'#2c2c33',sign:'#f4ecd2',ink:'#b9483f',icon:'lantern'},
  {id:'cinema',area:'blvd',name:'The Starlite',label:'STARLITE',x:16,y:3,w:5,h:5,style:'cinema',floors:3,wall:'#e9c9a6',stone:'#f4e2c4',roof:'#a8453a',awning:'#2c2c33',awning2:'#2c2c33',sign:'#2c2c33',ink:'#ffd968',icon:'star'},
  {id:'nickels',area:'blvd',name:"Nickel's",label:'SHOP',x:23,y:3,w:5,h:5,style:'deco',floors:2,wall:'#b8c4b0',stone:'#e2e8d8',roof:'#2f6f73',awning:'#3a9ca0',awning2:'#fbefd2',shop:true,keeper:'Nickel',icon:'coin',fire:true},
  {id:'wardrobe',area:'blvd',name:'Backlot Wardrobe',label:'WARDROBE',x:2,y:14,w:5,h:5,style:'loft',floors:3,wall:'#a0523a',stone:'#d9b49a',roof:'#5a3a2a',awning:'#8a6aa0',awning2:'#f3eaf6',sign:'#2c2c33',ink:'#e3c6f0',icon:'hanger',ghost:'GARMENT CO.'},
  {id:'lofts',area:'blvd',name:"TNB's Loft",label:'LOFTS',x:9,y:14,w:5,h:5,style:'loft',floors:3,wall:'#8a5a44',stone:'#d9c0a0',roof:'#4a3a32',awning:'#2c2c33',awning2:'#2c2c33',sign:'#2c2c33',ink:'#f4ecd2',home:true,ghost:'FURNITURE'},
  {id:'tower',area:'blvd',name:'The Grand Tower',label:'GRAND',x:16,y:14,w:5,h:5,style:'tower',floors:9,wall:'#6f9fc4',stone:'#c9d6de',roof:'#3f5a74',home:true},
  {id:'lacab',area:'blvd',name:'Angel City Cab Co.',label:'CABS',x:23,y:14,w:5,h:5,style:'deco',floors:1,wall:'#f4e6c8',stone:'#fff4dc',roof:'#d9a43a',awning:'#2c2c33',awning2:'#f2c75a',taxi:true,icon:'cab'},
  {id:'creole',area:'jpark',name:"Odette's Creole Kitchen",label:'CREOLE',x:2,y:3,w:5,h:5,style:'strip',wall:'#e8c060',roof:'#7a3a5a',awning:'#4a7a3a',awning2:'#f4e6c0',sign:'#4a2a4a',ink:'#ffd968',icon:'pot',mural:true},
  {id:'pupuseria',area:'jpark',name:'Pupuseria La Ceiba',label:'PUPUSAS',x:9,y:3,w:5,h:5,style:'strip',wall:'#f2e6d0',roof:'#2f6fb3',awning:'#2f6fb3',awning2:'#ffffff',sign:'#2f6fb3',ink:'#ffffff',icon:'leaf',grille:true},
  {id:'boards',area:'jpark',name:'Board Room',label:'SKATE',x:16,y:3,w:5,h:5,style:'strip',wall:'#d6e6ec',roof:'#2f4e6a',awning:'#e2793a',awning2:'#2c2c33',sign:'#2c2c33',ink:'#f2a05a',icon:'board',mural:true},
  {id:'juicebar',area:'jpark',name:'Very Green Juice',label:'JUICE',x:23,y:3,w:5,h:5,style:'store',wall:'#f4f6f0',roof:'#4f8a4a',awning:'#6fb35a',awning2:'#f4fbe8',sign:'#f4fbe8',ink:'#3f7a3a',icon:'leaf'},
  {id:'tomhouse',area:'jpark',name:"Tom's House",label:'3468',x:2,y:13,w:5,h:5,style:'tom',wall:'#cbc2aa',roof:'#4e4e52',trim:'#ece6d6',doorColor:'#c98a44'},
  {id:'jordansam',area:'jpark',name:"Jordan and Sam's Place",label:'2732',x:9,y:13,w:5,h:5,style:'craftsman',cond:'flip',wall:'#2c2c2e',roof:'#1d1d20',trim:'#f4f4f0',doorColor:'#c9a24a'},
  {id:'casa',area:'jpark',name:'Casa Alvarez',label:'ALVAREZ',x:16,y:13,w:5,h:5,style:'craftsman',cond:'crowded',wall:'#d9a05a',roof:'#6a4a3a',trim:'#f4e6c8',doorColor:'#2f8a8a'},
  {id:'dakota',area:'jpark',name:"Dakota and Ryan's Place",label:'2740',x:23,y:13,w:5,h:5,style:'craftsman',cond:'flip',wall:'#f2f2ee',roof:'#4a4f58',trim:'#2c2c2e',doorColor:'#b98a5a'},
];
for(const h of LA_HOUSES) { h.region='la'; h.light=h.awning||h.roof; houses.push(h); houseById[h.id]=h; }
for(const h of houses) if(!h.region) h.region='le';

// ---------- People ----------
Object.assign(palettes,{
  skye:{skin:'#e9b48e',hair:'#e8c25a',shirt:'#f08aa8',pants:'#7fb7c9',hat:null},
  chet:{skin:'#d7a07a',hair:'#3b2f2a',shirt:'#2f3a4a',pants:'#5a6474',hat:null},
  bev:{skin:'#f0caaa',hair:'#b7b3ad',shirt:'#e2793a',pants:'#6c7a8a',hat:'#f2e2a0'},
  larry:{skin:'#c69878',hair:'#6b6058',shirt:'#8aa46a',pants:'#6a5a48',hat:'#d9a43a'},
  marisol:{skin:'#b8805c',hair:'#2a2220',shirt:'#e85a6a',pants:'#3f4a6a',hat:null},
  juniper:{skin:'#f0c4a0',hair:'#a8452f',shirt:'#d9c6a0',pants:'#5a5048',hat:null},
  kenji:{skin:'#e3b48e',hair:'#2a2422',shirt:'#f4ecd2',pants:'#2c2c33',hat:'#f4ecd2'},
  sage:{skin:'#e9c09a',hair:'#d9c27a',shirt:'#8ac46a',pants:'#e8e2d0',hat:null},
  nickel:{skin:'#e7b48f',hair:'#2f6f73',shirt:'#3a9ca0',pants:'#5d5a70',hat:null},
  marguerite:{skin:'#9e7056',hair:'#d9d5c4',shirt:'#6a4f7a',pants:'#2c2c33',hat:null},
  dolores:{skin:'#e9b896',hair:'#5a3a5a',shirt:'#a8453a',pants:'#2c2c33',hat:null},
  dash:{skin:'#c99372',hair:'#3a2a22',shirt:'#e2793a',pants:'#4a5868',hat:'#2f4e6a'},
  sol:{skin:'#b98262',hair:'#2a2422',shirt:'#f2c75a',pants:'#3c3f4c',hat:'#e8e4dc'},
  rudy:{skin:'#efbc8e',hair:'#c98a4a',shirt:'#5f8a8f',pants:'#4a4a52',hat:null},
  alvarez:{skin:'#c08a64',hair:'#cfc8bc',shirt:'#c0613f',pants:'#4a3f5a',hat:null},
  wes:{skin:'#efbc8e',hair:'#6b4a33',shirt:'#9ea3ab',pants:'#3b4057',hat:'#3f4650'},
  priya:{skin:'#b98262',hair:'#2a2220',shirt:'#3f5a74',pants:'#2c2c33',hat:null},
  odette:{skin:'#8a5a3c',hair:'#d9d5c4',shirt:'#7a3a5a',pants:'#2c2c33',hat:'#e8c060'},
  carmen:{skin:'#c08a64',hair:'#2a2220',shirt:'#2f6fb3',pants:'#3a3646',hat:null},
  pearl:{skin:'#7a4a32',hair:'#cfc8bc',shirt:'#c0392b',pants:'#3a3646',hat:null},
  lupe:{skin:'#b8805c',hair:'#3a2a22',shirt:'#e8c060',pants:'#3f4a6a',hat:null},
  washington:{skin:'#6a4030',hair:'#d9d5c4',shirt:'#8a7a5a',pants:'#3f4650',hat:'#3f4a3f'},
  dakota:{skin:'#f0c4a0',hair:'#c9a24a',shirt:'#9ccfd8',pants:'#5a6474',hat:null},
  beto:{skin:'#b8805c',hair:'#d9d5c4',shirt:'#6a7a8a',pants:'#3f4650',hat:'#2f5a8a'},tony:{skin:'#c08a64',hair:'#2a2220',shirt:'#3f6a3f',pants:'#3f4a6a',hat:null},
  yesenia:{skin:'#c99372',hair:'#3a2a22',shirt:'#d65aa0',pants:'#2c2c33',hat:null},claudia:{skin:'#b8805c',hair:'#2a2220',shirt:'#7fb7c9',pants:'#7fb7c9',hat:null},
  kevin:{skin:'#c08a64',hair:'#2a2220',shirt:'#c94a3a',pants:'#4a5868',hat:null},daisy:{skin:'#c99372',hair:'#3a2a22',shirt:'#9a7ad0',pants:'#3f4a6a',hat:null},
  mateo:{skin:'#c08a64',hair:'#2a2220',shirt:'#e8c84a',pants:'#4a78c2',hat:null},sofi:{skin:'#c99372',hair:'#3a2a22',shirt:'#6fb35a',pants:'#d65aa0',hat:null},
  jordan:{skin:'#e9c09a',hair:'#2c2c2e',shirt:'#2c2c2e',pants:'#c9b89a',hat:'#c9b89a'},sam:{skin:'#efbc8e',hair:'#b98a5a',shirt:'#f4f4f0',pants:'#4a5868',hat:null},
  ryan:{skin:'#f0c4a0',hair:'#8a6a4a',shirt:'#9ea3ab',pants:'#3b4057',hat:null}
});

// Nickel runs the LA shop. Same stock as Penny's Pockets; her own lines.
const NICKEL={
  intro:["Welcome to Nickel's. I am Penny's cousin. Better weather, same prices.",
    'Gear for the whole family, snacks for fights, sunscreen for the soul.',
    'Got something to sell? I buy almost anything. Penny warned me about Steve.'],
  hello:['Back again! Did you find parking? Nobody finds parking.','Browse all you like. Browsing is free in Los Angeles. Nothing else is.','Fresh stock. Same Nickel.'],
  tab:{healing:'Snacks and fixes. Eat them in battle or from the menu.',battle:'For monsters only. The coyotes have been warned.',
    sell:'Half price, no haggling. This is not the Rose Bowl flea market.'},
  gear:PENNY_GEAR_NOTE,
  bought:['Pleasure doing business.','Good choice. Very you.','Into the pockets it goes.','Ka-ching. That one is for parking.'],
  sold:['Sold! I know just the shelf.','Half price, full gratitude.','That is very vintage now.'],
  broke:['Not enough coins. Griffith Park pays, in a way.','Short on coins. The monsters up in the park are carrying some.'],
  keep:['I could never. That is a family thing.','Not for sale. Some things are priceless.','Keep that one. Trust me.'],
  who:'Nickel'
};
function PENNY_GEAR_NOTE(id) { return typeof PENNY!=='undefined'?PENNY.gear(id):''; }

// ---------- Items found in LA ----------
Object.assign(items,{
  coldbrew:{price:10,name:'Cold Brew',icon:'\u{1F9CA}',slot:null,mp:5,desc:'Souvenir from Golden Hour Coffee. Steeped for eighteen hours. Tastes like ambition.'},
  ramen:{price:12,name:'Takeout Ramen',icon:'\u{1F35C}',slot:null,heal:10,desc:'Souvenir from Ramen Ramen. Extra egg. The chef insisted.'},
  greenjuice:{price:9,name:'Very Green Juice',icon:'\u{1F96C}',slot:null,heal:7,desc:'Souvenir from Very Green Juice. Kale, celery and a feeling of superiority.'},
  crewjacket:{sell:12,name:'Crew Jacket',icon:'\u{1F9E5}',slot:'Body',color:'#2f3a4a',desc:'Souvenir from Backlot Wardrobe. Says CREW on the back. Gets you past any velvet rope.',bonus:{Charm:1,Pace:1},def:1},
  popcorn:{price:8,name:'Starlite Popcorn',icon:'\u{1F37F}',slot:null,heal:6,desc:'Souvenir from The Starlite. Real butter. Tom is not asking questions.'},
  skatewax:{sell:6,name:'Skate Wax',icon:'\u{1F6F9}',slot:'Held',desc:'Souvenir from Board Room. Makes everything slide. Including you.',bonus:{Pace:2}},
  claytaco:{name:'Tiny Clay Taco',icon:'\u{1F32E}',slot:'Held',desc:"Souvenir from TNB's loft. He made it. It holds one paperclip, perfectly.",bonus:{Charm:2}},
  lemons:{sell:2,name:'Backyard Lemons',icon:'\u{1F34B}',slot:null,heal:4,desc:'Souvenir from Casa Alvarez. Every yard in this city has too many lemons.'},
  screenplay:{sell:6,name:'Draft 41',icon:'\u{1F4DC}',slot:'Held',desc:'Souvenir from The Duplex. A screenplay. Wes wants notes. Be kind.',bonus:{Curiosity:2}},
  skyjar:{sell:2,name:'Jar of Hazy Air',icon:'\u{1FAD9}',slot:null,desc:'The Smoglet left it. Labeled LOS ANGELES, AUGUST. Do not open.'},
  parkticket:{sell:1,name:'Parking Ticket',icon:'\u{1F3AB}',slot:null,desc:'Sells for one coin. Costs seventy-three to pay. Tom is not paying it.'},
  bandana:{sell:18,name:'Dusty Bandana',icon:'\u{1F9E3}',slot:'Head',color:'#c9463d',desc:'The coyote left it on a rock. Smells like sage and bad decisions.',bonus:{Pace:1,Luck:1}},
  hubcap:{sell:15,name:'Lucky Hubcap',icon:'\u{1F6DE}',slot:'Held',desc:'Rolled off Gridlock. Shiny enough to signal for help.',bonus:{Curiosity:1},def:1},
  fossil:{sell:20,name:'Tiny Fossil',icon:'\u{1F9B4}',slot:'Held',desc:'Popped out of the tar. Ten thousand years old. Fits in a pocket.',bonus:{Curiosity:2}},
  rooftop:{sell:5,name:'Rooftop Pass',icon:'\u{1F3D9}',slot:'Held',desc:'Souvenir from The Grand Tower. Pool on the roof. Nobody swims. Everyone takes photos.',bonus:{Luck:1,Charm:1}},
  praline:{price:9,name:'Pecan Praline',icon:'\u{1F36C}',slot:null,heal:8,desc:"Souvenir from Odette's Creole Kitchen. Her mother's recipe. Do not ask for it."},
  pupusa:{price:8,name:'Pupusa Revuelta',icon:'\u{1FAD3}',slot:null,heal:9,desc:'Souvenir from Pupuseria La Ceiba. Cheese, beans, pork, curtido on the side. The curtido is not optional.'},
  sweettea:{sell:2,name:'Sweet Tea',icon:'\u{1F9CB}',slot:null,mp:4,desc:"Souvenir from Ms. Pearl's. Brewed on the porch in the sun. Sweet enough to stand a spoon in."},
  chalk:{name:'Chalk Drawing',icon:'\u{1F58D}',slot:'Held',desc:'From Daisy and the little ones at Casa Alvarez. It is Tom, ten Alvarezes and one very tired grandma. Everyone is smiling except her.',bonus:{Charm:1,Luck:1}},
  kombucha:{sell:4,name:'Homebrew Kombucha',icon:'\u{1F376}',slot:null,mp:4,desc:"Souvenir from Jordan and Sam's. Fermented in a jar they named. Tastes like a vinegar that went to college."},
  oatlatte:{price:7,name:'Oat Milk Latte',icon:'\u{2615}',slot:null,mp:3,desc:"Souvenir from Dakota and Ryan's. Made on a machine that cost more than Tom's first car."},
  quakemedal:{name:'Big Shake Medal',icon:'\u{1F3C5}',slot:'Held',desc:'I SURVIVED THE BIG SHAKE. Tom has already told everyone.',bonus:{Luck:3,Charm:1},def:1}
});
Object.assign(souvenirs,{coffee:'coldbrew',ramen:'ramen',juicebar:'greenjuice',wardrobe:'crewjacket',cinema:'popcorn',boards:'skatewax',tomhouse:'fridgephoto',lofts:'claytaco',tower:'rooftop',creole:'praline',pupuseria:'pupusa',jordansam:'kombucha',dakota:'oatlatte',casa:'chalk'});

// ---------- Map helpers ----------
function borderOf(map,openings,kind) {
  const open=new Set(openings.map(([x,y])=>key(x,y)));
  for(let x=0;x<map.w;x++) for(const y of [0,map.h-1]) if(!open.has(key(x,y))) object(map,kind,x,y);
  for(let y=1;y<map.h-1;y++) for(const x of [0,map.w-1]) if(!open.has(key(x,y))) object(map,kind,x,y);
}
function laArea(id,name,w,h,ground,o) {
  const map=makeMap(id,name,w,h,true,{ground});
  map.houses=[]; map.region='la';
  Object.assign(map,o);
  return map;
}

// Downtown LA: the historic core and the Arts District in one block. Shops with apartments above, brick lofts,
// a glass tower, a movie palace, a taco truck. Same street shape as The Square.
function makeBlvd() {
  const map=laArea('blvd','Downtown LA',30,26,'city',{
    tag:'Towers, lofts, a movie palace and one taco truck.',
    eyebrow:'LOS ANGELES / DOWNTOWN',
    hint:"Shops and apartments. Nickel's sells things. Jefferson Park south. Trouble north.",
    spawn:{x:25,y:19}
  });
  paths(map,[[2,9,27,10],[2,20,27,21],[7,0,8,21],[14,9,15,25]]);
  for(const h of LA_HOUSES.filter(h=>h.area==='blvd')) placeHouse(map,h,h.y<10?10:21);
  borderOf(map,[[7,0],[8,0],[14,25],[15,25]],'citywall');
  opening(map,7,0,'griffith',{x:7,y:20},'up');
  opening(map,8,0,'griffith',{x:8,y:20},'up');
  opening(map,14,25,'jpark',{x:14,y:1},'down');
  opening(map,15,25,'jpark',{x:15,y:1},'down');
  for(const [x,y] of [[1,2],[21,2],[1,6],[22,4],[3,23],[10,23],[19,23],[24,23],[27,22],[12,24],[22,24],[1,15]]) object(map,'palm',x,y);
  for(const [x,y] of [[1,11],[28,11],[22,8],[6,22],[17,22],[28,16],[1,21],[14,7]]) object(map,'lamp',x,y);

  object(map,'sign',28,12,1,1,'Downtown notice',"Downtown LA. Eight doors: shops below, people living above. Nickel's sells things, east end. Look for the coin.");
  object(map,'sign',6,1,1,1,'North signpost','GRIFFITH PARK, this way. Watch for coyotes. Watch for tar. Watch the ground.');
  object(map,'sign',16,24,1,1,'South signpost','JEFFERSON PARK, this way. Craftsman houses from 1910, Jefferson Boulevard, pupusas.');
  object(map,'tacotruck',21,12,2,1,'Taco truck','A taco truck called TACOS TACOS. The menu says: TACOS.',{restore:true,
    restoreText:'Al pastor for everyone. Everybody is completely restored. Tom tips well.'});
  object(map,'cart',5,8,1,1,'Hot dog cart','Bacon-wrapped hot dogs, grilled onions, one jalapeno on top. The smell reaches the 34th floor.');
  object(map,'bench',24,11,2,1,'Bus bench','An ad for a lawyer covers the whole bench. He is smiling at you. He is always smiling at you.');
  object(map,'metro',21,22,2,1,'Metro stairs','Down to the train. TNB knows every line, every stop, and which car has the best seats.');
  object(map,'sign',22,11,1,1,'Shop sign',"NICKEL'S. Penny's cousin. Gear, snacks, and things that go POP.",{shopSign:true});
  object(map,'lacab',26,19,2,1,'Cab 8','Angel City Cab Co., cab 8. It is spotless. Sol details it twice a day. Sol has time.');
  object(map,'planter',27,8,1,1,'Bird of paradise','A bird of paradise in a pot. It looks like it wants to leave.',{dry:true});

  map.npcs.push(
    actor('Skye',3,10,'skye',["I'm filming a day-in-my-life video. I live in the lofts.","This is the day. You're in my life now.","Say hi to my eleven followers."]),
    actor('Chet',8,13,'chet',["I'm an actor. Well. I'm an actor who parks cars at a tower.",'I had a callback last week. For a cereal.','The cereal went with someone else. It happens.']),
    actor('Wes',8,16,'wes',["I'm a screenwriter. I live in the lofts, two floors down from your boyfriend.","Draft forty-one. It's about a man who writes screenplays. It's very personal.",'He lends me a mug when I am stuck. I am stuck a lot. I have nine of his mugs.']),
    actor('Bev',16,9,'bev',['I came all the way from Ohio. I rode the tiny orange railway up the hill.','It went one block. It cost a dollar. Best dollar of my life.','Then I ate a pupusa in a market from 1917. I may never go home.'])
  );
  finishMap(map);
  return map;
}

// Jefferson Park: an early streetcar suburb, about 2,500 craftsman bungalows built 1905 to 1920, now a historic
// preservation zone. Jefferson Boulevard shops up top, a residential street below. Mostly renters; Latino and Black
// families who have been here for decades, plus newer owners restoring old houses.
function makeJPark() {
  const map=laArea('jpark','Jefferson Park',30,24,'lawn',{
    tag:'Craftsman bungalows from 1910. Jefferson Boulevard. Jacarandas.',
    eyebrow:'LOS ANGELES / JEFFERSON PARK',
    hint:"Shops on Jefferson Boulevard. 2nd Ave below. Tom's house is 3468, bottom left.",
    spawn:{x:14,y:2}
  });
  paths(map,[[1,8,28,8],[1,11,28,11],[1,19,28,19],[1,22,28,22]]);
  for(const [x0,y0,x1,y1] of [[1,9,28,10],[1,20,28,21],[14,0,15,22]]) for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) tile(map,x,y,'road');
  for(const h of LA_HOUSES.filter(h=>h.area==='jpark')) placeHouse(map,h,h.y<10?8:19);
  borderOf(map,[[14,0],[15,0]],'jacaranda');
  opening(map,14,0,'blvd',{x:14,y:24},'up');
  opening(map,15,0,'blvd',{x:15,y:24},'up');
  tile(map,14,0,'road'); tile(map,15,0,'road');

  // Street trees in the parkways, yards in front of the houses.
  for(const [x,y,k] of [[1,12,'palm'],[12,12,'jacaranda'],[20,12,'palm'],[28,12,'jacaranda'],[13,1,'palm'],[21,1,'jacaranda'],[7,1,'jacaranda']]) object(map,k,x,y);
  object(map,'flax',6,18,1,1,'Front garden','Purple flax, red cordyline and a lot of mulch. Drought tolerant. Tom waters it anyway.'); object(map,'jacaranda',21,18); object(map,'oak',13,18);
  for(const x of [2,3,5]) object(map,'flax',x,18,1,1,'Front garden','Purple flax, red cordyline and a lot of mulch. Drought tolerant. Tom waters it anyway.');
  for(const x of [9,10,12]) object(map,'slatfence',x,18);
  object(map,'toybox',16,18,1,1,'Front yard','Two trikes, a kiddie pool with no water and one rubber duck, and a stroller parked like a getaway car.'); object(map,'stonewall',17,18); object(map,'stonewall',19,18);
  for(const x of [23,24,26,27]) object(map,'slatfence',x,18);
  object(map,'planter',27,12,1,1,'Drought garden','Sage, agave and a sign: NO LAWN, NO PROBLEM. The new neighbors put it in.',{dry:true});

  object(map,'sign',16,1,1,1,'Street sign','DOWNTOWN, back that way. Towers, tacos, a lawyer on a bench.');
  object(map,'sign',8,12,1,1,'Historic district plaque','JEFFERSON PARK. An early streetcar suburb: craftsman bungalows built 1905 to 1920, many from mail-order kits. A historic preservation zone since 2011.');
  object(map,'sign',22,12,1,1,'Jefferson Boulevard','Old-timers still call this stretch Little New Orleans. Creole kitchens, a pupuseria, a skate shop, and as of March, a juice bar.');
  object(map,'bench',25,11,2,1,'Bus bench','The 38 bus stops here. The Expo Line is a few blocks south. Tom has opinions about both.');
  object(map,'streetsign',1,18,1,1,'2nd Ave','2ND AVE. Craftsman houses from about 1910. Tom lives at 3468, the one with the wood door.'); object(map,'streetsign',28,18,1,1,'2nd Ave','2ND AVE. Jacarandas, a lot of strollers, and the Alvarez clothesline.');
  object(map,'bench',3,22,2,1,'Parkway bench','Somebody painted it the colors of three different houses. All three houses approve.');

  map.npcs.push(
    actor('Mr. Washington',8,19,'washington',["Bought this house in 1979. Same porch, same chair, same view.","Back then you could hear zydeco from the boulevard on a Saturday night.",'You are the one fixing up the green house? Keep the old windows. They are better than the new ones.']),
    actor('Marisol',17,8,'marisol',["I'm walking my dog. He's somewhere.",'My grandparents rented on this block. Now I rent on this block. We are a tradition.','There he is. No. That is a lemon.']),
    actor('Larry',4,11,'larry',["I'm blowing leaves.",'Onto the next yard.',"Tomorrow, they blow them back. It's a whole system."])
  );
  finishMap(map);
  return map;
}
// Griffith Park: monsters. Same shape as Grump Hollow, with tar pits instead of a pond.
function makeGriffith() {
  const map=laArea('griffith','Griffith Park',24,22,'dry',{
    tag:'Dusty trails. Tar pits. Six things are watching from the brush.',
    eyebrow:'LOS ANGELES / GRIFFITH PARK',
    hint:'Monsters live here. Smoglet is easy. The Big Shake is not.',
    spawn:{x:7,y:19},
    wild:true
  });
  paths(map,[[7,13,8,21],[3,13,12,14],[11,9,12,12]]);
  borderOf(map,[[7,21],[8,21]],'scrub');
  opening(map,7,21,'blvd',{x:7,y:1},'down');
  opening(map,8,21,'blvd',{x:8,y:1},'down');

  const tar=[[14,5],[15,5],[16,5],[13,6],[14,6],[15,6],[16,6],[17,6],[13,7],[14,7],[15,7],[16,7],[17,7],[14,8],[15,8],[16,8],
    [4,17],[5,17],[4,18]];
  const sticky=new Set(tar.map(([x,y])=>key(x,y)));
  for(const [x,y] of tar) tile(map,x,y,'tar',true);
  for(const [x,y] of tar) for(const d of Object.values(DIR)) {
    const nx=x+d.x,ny=y+d.y;
    if(within(map,nx,ny)&&!sticky.has(key(nx,ny))&&map.tiles[ny][nx]==='grass') tile(map,nx,ny,'mud');
  }

  object(map,'dome',2,1,3,2,'The Observatory','A white dome on the hill. On a clear night you can see three stars. On a normal night, one.');
  [[6,2],[9,2],[11,1],[20,2],[22,3],[1,4],[3,4],[5,5],[8,5],[1,8],[3,9],[6,8],[21,10],[22,12],[1,11],[2,15],[1,17],[4,20],[11,17],[14,16],[16,15],[19,17],[21,18],[12,19],[16,19],[20,20],[1,20],[22,20],[8,10],[9,7]]
    .forEach(([x,y],i)=>object(map,['oak','scrub','rock','scrub'][i%4],x,y));
  for(const x of [3,5,6,9,10]) object(map,'fence',x,20);

  object(map,'sign',6,13,1,1,'Trailhead sign','GRIFFITH PARK. Stay on the trail. Start with the Smoglet. Save the hill for last.');
  object(map,'sign',9,5,1,1,'Tar warning','DO NOT STEP IN THE TAR. It is not a puddle. It is a commitment.');
  object(map,'bench',3,15,2,1,'Hiking bench','A plaque says: IN MEMORY OF A GREAT VIEW. The view is fine. It is right there.');
  object(map,'bench',18,13,2,1,'Lookout bench','You can see the whole city from here. Most of it is parking.');
  object(map,'sign',13,10,1,1,'Fault marker','EARTHQUAKE COUNTRY. If the ground starts talking, do not answer.');

  for(const [id,x,y] of LA_MONSTER_SPOTS) {
    const d=MONSTERS[id];
    const mon=actor(d.name,x,y,'moss',[]);
    mon.monster=id; mon.roam=0; mon.tier=0; mon.maxHp=d.hp; mon.defeatedUntil=0;
    map.npcs.push(mon);
  }
  finishMap(map);
  return map;
}

// ---------- Rooms ----------
const LA_ROOMS=[
  {id:'coffee',w:11,h:9,style:{floor:'#d9c4a8',alt:'#e6d3b8',wall:'#b98a5a',trim:'#f0d9b5',pattern:'wood',rug:'#c98a4a'},walls:[],rug:[3,5,5,2],
    resident:['Juniper',5,4,'juniper',["Welcome to Golden Hour. Every hour is golden hour if you believe.",'Our oat milk is oat-adjacent.','Your name is Tom? I wrote TAM. It is basically the same.']],
    objects:[['counter',3,2,5,1,'Espresso bar','A machine with eleven knobs. Juniper uses two of them.',{variant:'tea'}],
      ['table',1,5,2,2,'Laptop table','Someone has been writing a screenplay here since 2016.'],
      ['table',8,5,2,2,'Window table','A man is having a very loud meeting about a podcast.'],
      ['pot',9,1,1,1,'Monstera','It has more Instagram followers than Skye.']]},
  {id:'ramen',w:12,h:9,style:{floor:'#cbb89c',alt:'#d8c6aa',wall:'#7a3a33',trim:'#e8c8a0',pattern:'wood',rug:'#b9483f'},walls:[],rug:[4,5,4,2],
    resident:['Kenji',5,4,'kenji',['Irasshaimase! Welcome!',"Tom-san, your Japanese is very good.",'It is not. But you are trying very hard, and I respect that.']],
    objects:[['counter',2,2,6,1,'Ramen counter','Twelve stools. A pot of broth that has been simmering since Tuesday.',{variant:'tea'}],
      ['table',8,4,2,2,'Corner table','A tiny sign: PLEASE SLURP. IT IS POLITE.'],
      ['shelf',9,1,2,1,'Sake shelf','The bottles are labeled in kanji. Tom can read two. He is very proud.'],
      ['pot',1,6,1,1,'Lucky bamboo','Three stalks. One for broth, one for noodles, one for the egg.']]},
  {id:'juicebar',w:11,h:9,style:{floor:'#dfe8d0',alt:'#eaf0de',wall:'#6fb35a',trim:'#f4fbe8',pattern:'tile',rug:'#9ccf7a'},walls:[],rug:[3,5,5,2],
    resident:['Sage',5,4,'sage',['Welcome. Breathe in. Now order.','We opened in March. The pupuseria next door has been here since 1994. We are learning a lot.','Today\'s special is celery. Doña Carmen says that is not a meal. She is right.']],
    objects:[['counter',3,2,5,1,'Juice bar','A blender the size of a car engine. It sounds like one too.',{variant:'tea'}],
      ['planter',1,6,2,1,'Wheatgrass','Grown on site. Harvested on site. Judged on site.'],
      ['pot',9,1,1,1,'Fern','It is thriving. It is the only thing here that is not stressed.'],
      ['shelf',8,6,2,1,'Supplement shelf','Powders. So many powders. One just says ENERGY in capital letters.']]},
  {id:'nickels',w:11,h:9,style:{floor:'#d9c49c',alt:'#e6d3ad',wall:'#3a9ca0',trim:'#f1d9b5',pattern:'check',rug:'#2f6f73'},walls:[],rug:[3,6,5,2],
    resident:['Nickel',5,2,'nickel',[],{shopkeeper:true,roam:0,shopLines:NICKEL,shopName:"Nickel's"}],
    objects:[['counter',3,3,5,1,'Shop counter','A brass bell, a tin of coins and a sign: BUY. SELL. NO, WE DO NOT VALIDATE.',{variant:'letters',shop:true}],
      ['shelf',1,1,2,1,'Gear shelf','Sweaters nobody in LA needs, and sunglasses everybody does.'],
      ['shelf',8,1,2,1,'Snack shelf','Juice boxes, picnic baskets, and a very expensive bottle of water.'],
      ['toybox',1,6,1,1,'Battle bin','Water balloons, kazoos and party poppers. A label says: FOR MONSTERS ONLY. AND COYOTES.'],
      ['pot',9,6,1,1,'Shop cactus','It has a price tag. The price is "no." Penny taught her well.']]},
  {id:'wardrobe',w:12,h:10,style:{floor:'#cfc3d6',alt:'#dcd2e2',wall:'#6a4f7a',trim:'#e3d6e8',pattern:'tile',rug:'#8a6aa0'},walls:[],rug:[3,5,6,2],
    resident:['Marguerite',6,5,'marguerite',["Backlot Wardrobe. If it was worn on screen, it lived here first.","You're Tom? TNB's Tom! He found a shoe for us once. A lead actor's shoe. Four minutes before the take.",'We still talk about the shoe. Tell him there is always a rack here with his name on it.']],
    objects:[['rack',1,2,3,1,'Rack A: Westerns','Forty cowboy hats. One cowboy. The cowboy is very tired.'],
      ['rack',8,2,3,1,'Rack B: Space','Silver jumpsuits in every size. Even yours.'],
      ['desk',2,7,2,1,'Continuity desk','Polaroids of every actor in every scene. Scene 12, the scarf was on the LEFT.'],
      ['photo',6,1,1,1,'Call sheet','Tomorrow: 5 AM call. Forty extras. One horse. The horse has a stand-in.'],
      ['pot',10,7,1,1,'Prop plant','It is fake. It has been in four movies. It has an agent.']]},
  {id:'cinema',w:13,h:11,style:{floor:'#7a3a3a',alt:'#843f3f',wall:'#2c2c33',trim:'#a8453a',pattern:'night',rug:'#a8453a'},walls:[],rug:[4,8,5,2],
    resident:['Dolores',6,3,'dolores',["Welcome to the Starlite. Built in 1931. The popcorn is newer. A little.",'I have run the projector here for forty years. I have seen every movie twice.',"Tonight it is a horror double feature. Your boyfriend would love it. You would watch it through your fingers."]],
    objects:[['screen',3,1,7,1,'The big screen','Velvet curtains, gold trim, and one stubborn stain from 1987.'],
      ['couch',1,5,3,1,'Row F','The good seats. Somebody already put a coat on two of them.'],
      ['couch',9,5,3,1,'Row G','A sticky floor under it. A historic stickiness.'],
      ['counter',8,8,3,1,'Concessions','Popcorn, red candy ropes, and a hot dog that has seen things.',{variant:'bread'}]]},
  {id:'boards',w:11,h:9,style:{floor:'#b6c3c8',alt:'#c6d1d4',wall:'#2f4e6a',trim:'#d6e6ec',pattern:'wood',rug:'#e2793a'},walls:[],rug:[3,5,5,2],
    resident:['Dash',5,6,'dash',['Board Room. We sell boards. We also sit on them.',"TNB? Longboard guy? He bombed Fargo Street once. No brakes. Legend.","If you see him, tell him the wheels he ordered came in. The green ones."]],
    objects:[['boardwall',1,1,3,1,'Board wall','Twenty decks on the wall. One has a drawing of a cat on it. Most expensive one.'],
      ['boardwall',7,1,3,1,'Longboard wall','Long ones. Very long ones. One that is basically a canoe.'],
      ['counter',3,3,5,1,'Grip tape counter','Stickers, wax, wheels, and a jar labeled LOST TEETH. Do not ask.',{variant:'letters'}],
      ['pot',9,6,1,1,'Cactus','It wears a tiny helmet. Safety first.']]},
  {id:'lacab',w:11,h:9,style:{floor:'#c9c3b4',alt:'#d7d1c2',wall:'#a99a6e',trim:'#efe0b0',pattern:'check',rug:'#d9a43a'},walls:[],rug:[3,5,5,2],
    resident:['Sol',5,5,'sol',["Angel City Cab Co. I am Sol. Sal's cousin. Also one cab.","Cab eight. Sal has cab seven. We do not talk about what happened to the other six.",'I go to the airport, the airport, and sometimes the airport.'],{driver:true}],
    objects:[['counter',3,3,5,1,'Dispatch desk','A radio crackles: "Cab eight, there is traffic everywhere." Sol nods. There is always traffic everywhere.',{variant:'letters'}],
      ['shelf',1,1,2,1,'Key board','Eight hooks. One key. Sol and Sal have a friendly rivalry about hooks.'],
      ['photo',8,1,1,1,'Driver of the month','It is Sol. In sunglasses. At sunset. He had it professionally done.'],
      ['desk',7,6,2,1,'Lost and found','Sunglasses, sunglasses, sunglasses, and one Oscar. It is probably fake. Probably.'],
      ['pot',1,6,1,1,'Waiting room palm','A palm tree in a pot. It is waiting for a cab to the beach.']]},
  // Tom's house, 3468 2nd Ave, laid out from Tom's real floor plan (north is the back yard, the porch is at the bottom).
  // Back: Tom's room, with his shower and walk-in closet behind it, and the yard and deck beside it.
  // Middle: mudroom and laundry, the hall bath (jetted tub), the office (left), and the guest room with its own bath (right), where Deedee and Boppy stay.
  // Front: dining room, kitchen and living room, all open, and the front porch. Bed and shower restore HP and MP.
  {id:'tomhouse',w:16,h:35,door:[3,34],style:{floor:'#c9a476',alt:'#d2ad80',wall:'#d8dbde',trim:'#f4f4f2',pattern:'wood',rug:'#e8eaee'},
    walls:[],
    plan:[
      '################',
      '#....#.....#...#',
      '#....#.....#...#',
      '#....#.....#...#',
      '#....####.###.##',
      '#....#.........#',
      '#....#.........#',
      '#....#.........#',
      '#....#.........#',
      '#....#.........#',
      '###.####.#######',
      '#..............#',
      '#........#.....#',
      '#######..#######',
      '#.....#..#.....#',
      '#.....#..#.....#',
      '#........#.....#',
      '#.....#..##.####',
      '#.....#..#.....#',
      '#######........#',
      '#........#.....#',
      '#........#.....#',
      '#........#######',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '#..............#',
      '###..##........#',
      '#.....#........#',
      '#.....#........#',
      '#.....#........#',
      '################'],
    rug:[2,22,4,4],
    zones:[
      {x:0,y:0,w:3,h:10,floor:'#6f9a52',alt:'#78a35a',pattern:'grass',wall:'#4f7a45',trim:'#6aa064'},
      {x:3,y:0,w:2,h:10,floor:'#8a6a4e',alt:'#94745a',pattern:'wood',wall:'#4f7a45',trim:'#6aa064'},
      {x:5,y:0,w:1,h:10,wall:'#cbc2aa',trim:'#ece6d6'},
      {x:6,y:0,w:5,h:4,floor:'#8f8c86',alt:'#97948d',pattern:'tile',wall:'#2e3236',trim:'#6a6f74'},
      {x:6,y:4,w:9,h:6,wall:'#6f86a0',trim:'#e8ecf0'},
      {x:10,y:10,w:5,h:7,floor:'#d6d8da',alt:'#e2e4e6',pattern:'tile',wall:'#eef0f2',trim:'#ffffff'},
      {x:10,y:17,w:5,h:5,wall:'#a9b89c',trim:'#eef0e6'},
      {x:0,y:30,w:7,h:5,floor:'#c9c6bf',alt:'#d2cfc8',pattern:'tile',wall:'#cbc2aa',trim:'#ece6d6'}],
    rugs:[{x:2,y:15,w:3,h:2,color:'#9a9ca0'},{x:10,y:29,w:4,h:3,color:'#bcb6aa'},{x:3,y:28,w:2,h:1,color:'#6a5a48'},{x:7,y:6,w:3,h:3,color:'#e4e0d6'}],
    residents:[],
    objects:[
      // Back yard and deck.
      ['lemontree',1,2,1,1,'Lemon tree','More lemons than Tom can use. The neighbors get a bag every Sunday whether they want one or not.'],
      ['oak',1,5,1,1,'Yard tree','Shade for the whole lawn by four o\'clock. Nara has opinions about the squirrel that lives in it.'],
      ['tree',1,8,1,1,'Back hedge tree','Planted by somebody in about 1915. It has outlasted every owner. It is not worried about Tom.'],
      ['bench',3,2,2,1,'Deck chairs','Two chairs, one small table, and a TNB mug with a ring of cold coffee in it. Golden hour lives here.'],
      ['pot',4,8,1,1,'Deck planter','A big glazed TNB pot holding rosemary. Tom uses it in the sourdough. TNB takes the credit.'],
      // Tom's bathroom and walk-in closet, behind his room.
      ['shower',6,1,3,2,'Glass shower','A rain shower behind a wall of glass, with dark stone tile behind it. Steam everywhere.',{restore:true,
        restoreText:'Rain shower, full blast, way too long. Everyone is completely restored. The mirror will be foggy until Thursday.'}],
      ['vanity',9,1,2,1,'Double vanity','Two sinks, a white quartz top, a reed diffuser and an eleven-step skincare routine. Both sinks are Tom\'s.'],
      ['closet',12,1,1,2,'Walk-in closet','Black t-shirts, black t-shirts, one blazer for McKinsey Zooms, and the black t-shirts.'],
      ['closet',14,1,1,2,'Walk-in closet','TNB\'s side. Every shirt is on a hanger, labeled by scene. Wardrobe habits.'],
      // Tom's room.
      ['tombed',11,6,3,2,'The bed','A huge upholstered bed in cream linen, oak nightstands with marble tops, and very good sheets.',{restore:true,
        restoreText:'Tom lies down for twenty minutes. It is two hours. Everyone is completely restored.'}],
      ['nightstand',10,6,1,1,'Nightstand','Oak and marble. A Japanese grammar book, a charger and a sleep mask from a Delta One amenity kit.'],
      ['nightstand',14,6,1,1,'Nightstand','Oak and marble. A glass of water and a phone face down. Tom is trying.'],
      ['bench',6,5,2,1,'Window bench','Where the clean laundry lives until it becomes the dirty laundry.'],
      // Mudroom and laundry, by the back door.
      ['laundry',1,12,2,1,'Washer and dryer','The dryer plays a little song when it is done. Tom hums it at work without realizing.'],
      ['shelf',4,12,2,1,'Storage closet','Paper towels, a vacuum, and four boxes labeled MISC. One of them is the Christmas lights.'],
      // Hall bath.
      ['toilet',11,11,1,1,'Toilet','Heated seat. Tom will not discuss it.'],
      ['tub',12,11,3,1,'Jetted tub','A big jetted tub. Tom has used the jets twice. Both times it was perfect. Both times it was very loud.',{jets:true}],
      ['sink',10,12,1,1,'Hall sink','A white sink with good hand soap. Guests always comment on the hand soap.'],
      // The office.
      ['couch',2,14,3,1,'Office daybed','Where Tom thinks during long calls. Camera off. Thinking very hard.'],
      ['workdesk',1,17,2,1,'Work desk','Two monitors, a ring light and a mug that says WORLD\'S OKAYEST PRODUCT DIRECTOR. Calls from eight to six.'],
      ['shelf',4,18,2,1,'Bookshelf','Product books, kanji workbooks, a stack of game art books and one very dusty book about coding. Unopened.'],
      // The guest room, with its own bath. Deedee and Boppy stay here when they visit.
      ['guestbed',12,19,2,2,'Guest bed','Where Deedee and Boppy sleep when they visit. Deedee makes the bed with hospital corners. Every morning.'],
      ['nightstand',14,19,1,1,'Guest nightstand','A ginger ale for Boppy\'s stomach, Deedee\'s reading glasses, and a note: TOMMY, WE LOVE YOU TO THE MOON AND BACK.'],
      ['shower',10,14,3,1,'Guest shower','Boppy says the water pressure is too strong. Deedee says it is perfect. They have discussed it for three visits.'],
      ['sink',10,16,1,1,'Guest sink','Two toothbrushes in a cup, and a pill organizer the size of a lunchbox.'],
      ['toilet',12,16,1,1,'Toilet','Boppy has notes. Nobody asked for the notes.'],
      ['closet',14,14,1,2,'Guest closet','Spare towels, a spare blanket, and Boppy\'s spare cap. He keeps one at every house.'],
      // Dining room.
      ['dining',2,23,4,2,'Dining table','Walnut table, gray upholstered chairs, a striped rug and a chandelier of white glass globes.'],
      ['gallery',2,20,2,1,'Photo wall','Family photos, Grace and Rose at the beach, and a carved wooden map of Long Island. Home, twice.'],
      ['pot',1,20,1,1,'Fiddle-leaf fig','In a TNB pot. TNB waters it when Tom is away and talks to it. It is thriving. Suspiciously.'],
      // Kitchen.
      ['wetbar',9,23,2,1,'Wet bar','Blue accent wall, white shaker cabinets, walnut shelves of bottles, a glass cabinet and a wine fridge. TNB made the coasters.'],
      ['kitchen',14,23,1,4,'Kitchen','White cabinets, a gas range and a fridge full of kimchi, bread dough and one sad lemon. The lemon is from the yard.'],
      ['island',11,25,3,1,'Kitchen island','White quartz with gray veins. A sourdough starter in a jar, fed this morning, bubbling with pride.'],
      // Living room.
      ['bigtv',11,28,3,1,'The big TV','Seventy-five inches. Final Fantasy IV on the screen, the music on loop. Still the best one.'],
      ['console',14,28,1,1,'The PS5','A stack of games, two controllers and a headset. The A button on one controller is worn smooth.'],
      ['coffeetable',11,30,2,1,'Coffee table','Round and wooden. A coaster, a controller, and a TNB bowl full of other controllers.'],
      ['couch',10,32,4,1,'The couch','A deep gray sectional, perfect for six-hour gaming sessions. One dent is TNB-shaped, from Saturday horror nights.'],
      ['pot',7,33,1,1,'Corner plant','A snake plant. It survived three trips to New York with no water. It is fine. It is always fine.'],
      // Front porch.
      ['flax',1,31,1,1,'Flax','Red flax by the steps. It looks like it is waving.'],
      ['flax',5,31,1,1,'Flax','Flax and a welcome mat that says HELLO in kanji. Nobody on 2nd Ave can read it but Tom.']
    ]},
  {id:'casa',w:14,h:11,style:{floor:'#d8b48a',alt:'#e2c39c',wall:'#c98a5a',trim:'#f4e6c8',pattern:'tile',rug:'#2f8a8a'},walls:[],rug:[4,4,6,4],
    residents:[
      ['Mrs. Alvarez',7,5,'alvarez',['TEN. Ten people in a two-bedroom house from 1912. One bathroom. ONE.','Tony, feet off my table! Kevin, the baby is not a football! Mateo, give Abuela the remote! ...Tom, mijo, sit. If you can find a chair.',"Everybody says, 'Mama, the house is so full of love.' It is full of SOMETHING. Take tamales. Please. I need the room in my fridge."]],
      ['Don Beto',11,3,'beto',["I've been in this chair since the game started. Which game? Yes.",'Ten people. I counted once. Then I lost count. Then I took a nap.']],
      ['Tony',4,5,'tony',['Me and Yesenia are saving for our own place. In this market? We will be here until Mateo goes to college.','The two houses next door sold for more than this whole block cost in 1990. My mom is not okay about it.']],
      ['Yesenia',5,7,'yesenia',['Sofi, no. Sofi. SOFI. ...She bit something. We do not have a dog. I do not know what she bit.','Baby Lupita is finally asleep. If you wake her, you are moving in.']],
      ['Claudia',10,6,'claudia',['Night shift nurse. I sleep in the bathtub. It is the only room with a lock.','Until somebody needs the bathroom. Somebody always needs the bathroom.']],
      ['Kevin',3,8,'kevin',["I share the bunk bed with Uncle Tony's exercise bike.",'It is not a metaphor. The bike is on the top bunk.']],
      ['Daisy',9,8,'daisy',["I'm making a documentary about this house. It's a horror movie.","Scene one: the bathroom line. Scene two: who ate Abuela's last concha."]],
      ['Mateo',6,8,'mateo',['Truck! TRUCK!','Ba! Ba! ...Truck.'],{duration:.45}],
      ['Sofi',8,6,'sofi',["I'm a dinosaur. RAWR.","Abuela says no more dinosaurs inside. I'm a quiet dinosaur. rawr."],{duration:.45}]
    ],
    objects:[['table',2,3,2,2,'Kitchen table',"Tamales, homework, a diaper bag, three phones charging off one outlet, and a sign in Mrs. Alvarez's handwriting: NO."],
      ['counter',7,1,3,1,'Stove','Four pots on four burners. A pot of beans that has been simmering since 1998.',{variant:'bread'}],
      ['recliner',11,1,2,2,"Don Beto's recliner",'The game is on. The volume is at 60. Nobody has ever seen it lower.'],
      ['bed',1,7,2,2,'Bunk bed','Kevin on the bottom. An exercise bike on the top. Do not ask how it got up there.'],
      ['bed',11,7,2,2,"Baby Lupita's crib",'Baby Lupita, seven months old, asleep. Somehow. Nobody breathe.'],
      ['toybox',5,9,1,1,'Toy pile','Blocks, a plastic dinosaur missing its tail, and the TV remote. Mateo hid it again.'],
      ['photo',5,1,1,1,'Family wall','Four generations, two weddings, one quinceañera, and a photo of the house in 1975, back when it had a lawn.']]},
  {id:'lofts',w:12,h:10,style:{floor:'#b98a6a',alt:'#c49878',wall:'#8a5a44',trim:'#d9c0a0',pattern:'wood',rug:'#3f4650'},walls:[],rug:[3,5,5,2],
    residents:[['TNB',6,5,'kit',[
      'Well, well, well...',
      'Hey, you. Did you eat? I made a bowl. I also made a bowl. Pottery joke.',
      'Welcome to the loft. Kiln by one window, wheel by the other, garment bags everywhere else. Spring Street, baby.',
      'Take my jacket. It gets cold up in Griffith Park at night, and a cold Tom is a no-go.'
    ],{sheet:'tnb',partner:true,duration:.68}]],
    objects:[['oven',1,1,2,2,'The kiln','Cone six, firing tonight. A sign on it: DO NOT OPEN. VERY HOT. LOVE YOU.'],
      ['rack',4,1,3,1,'Garment rack','Bagged costumes for tomorrow\'s shoot, tagged by scene. One bag just says: SHOE BACKUP.'],
      ['shelf',8,1,3,1,'Pottery shelf','Mugs in sunset colors. TNB says LA light changes the glaze. Tom says that is not how glaze works. TNB says it is now.'],
      ['wheel',2,6,1,1,'Pottery wheel','Still a little clay on it. Centered. Everything starts with centering.'],
      ['boardwall',8,6,3,1,'Longboard wall','Three longboards and a Metro map with every line he has ridden circled. Every line is circled.'],
      ['couch',1,8,3,1,'Horror couch','Facing a projector screen. The last movie paused mid-scream. Tom will not ask which one.']]},
  {id:'tower',w:11,h:9,style:{floor:'#cfd6de',alt:'#dde3ea',wall:'#3f5a74',trim:'#c9d6de',pattern:'tile',rug:'#6f9fc4'},walls:[],rug:[3,5,5,2],
    resident:['Priya',6,5,'priya',['34th floor. From my desk I can see Griffith Park. I have never been to Griffith Park.','My dog is named Bagel. He has more friends in this building than I do.','The pool is on the roof. Nobody swims. Everyone takes photos of the pool.']],
    objects:[['couch',2,2,3,1,'Gray couch','It came in a box. Most things in this building came in a box.'],
      ['desk',7,2,2,1,'Standing desk','Three monitors. A sticky note: GO OUTSIDE. Under it: LATER.'],
      ['tv',2,7,3,1,'The TV','A slideshow of somebody else\'s vacation. It came with the apartment.'],
      ['pot',9,6,1,1,'Fiddle-leaf fig','Thriving. Gets more sun than anyone in the building.']]},
  {id:'creole',w:12,h:9,style:{floor:'#c9a87a',alt:'#d6b688',wall:'#7a3a5a',trim:'#e8c060',pattern:'check',rug:'#4a7a3a'},walls:[],rug:[4,5,4,2],
    resident:['Miss Odette',6,4,'odette',["Sit down, baby. Gumbo's on. It's been on since six.","My mama opened this kitchen when this stretch was Little New Orleans. Folks came from Louisiana and brought the food.",'Pralines by the register. Take two. One for you, one for that boyfriend who keeps coming in for the red beans.']],
    objects:[['counter',2,2,6,1,'Pastry case','Pralines, sweet potato pie and a hand-written sign: NO, YOU CANNOT HAVE THE RECIPE.',{variant:'bread'}],
      ['table',8,5,2,2,'Corner table','Hot sauce, a paper menu, and a church fan from 1987.'],
      ['photo',9,1,1,1,'Boulevard photo','Jefferson Boulevard, 1958. Same kitchen. Same sign. Younger Odette in the doorway, holding a pot.'],
      ['pot',1,6,1,1,'Pepper plant','Cayenne. Odette says Boppy could not handle it. She has never met Boppy. She is right.']]},
  {id:'pupuseria',w:11,h:9,style:{floor:'#e8dcc4',alt:'#f2e6d0',wall:'#2f6fb3',trim:'#ffffff',pattern:'tile',rug:'#2f6fb3'},walls:[],rug:[3,5,5,2],
    resident:['Doña Carmen',5,4,'carmen',['Bienvenidos! Pupusas revueltas, and curtido on the side. Curtido is not optional.','I came from San Salvador in 1991. This comal came with me in a suitcase.','The juice bar next door asked me what a pupusa is. I gave them three. Now they ask every day.']],
    objects:[['counter',3,2,5,1,'The comal','A big flat griddle, pupusas puffing on it, and a jar of curtido the size of a toddler.',{variant:'tea'}],
      ['table',1,5,2,2,'Family table','Three generations eating at once. Everyone talking. Nobody waiting.'],
      ['photo',8,1,1,1,'Volcano photo','A volcano outside San Salvador at sunrise. Carmen points at it every time someone looks.'],
      ['pot',9,6,1,1,'Loroco plant','Grown from seeds a cousin mailed. The flowers go in the pupusas.']]},
  {id:'jordansam',w:11,h:9,style:{floor:'#e8e4dc',alt:'#f2f0ea',wall:'#2c2c2e',trim:'#f4f4f0',pattern:'tile',rug:'#c9b89a'},walls:[],rug:[3,5,5,2],
    residents:[['Jordan',4,5,'jordan',['We took it down to the studs. Then we put the studs back. Very authentic.',"Have you tried the juice bar on Jefferson? It's so nice the neighborhood is finally getting... options.",'We painted it black. The neighbors call it the haunted house. We are choosing to take that as a compliment.']],
      ['Sam',7,5,'sam',["Mrs. Alvarez brought us tamales. We posted them. We tagged her. She does not have Instagram.","Our mortgage is, um. We don't say the number out loud. The house can hear.","Everyone else on this street rents. We think about that a lot. Mostly on podcasts."]]],
    objects:[['couch',2,2,3,1,'Boucle couch','Cream colored. Nobody is allowed to eat on it, including Jordan and Sam.'],
      ['counter',7,1,3,1,'Espresso bar','A machine with a pressure gauge and a name. It is named Bruno. Bruno gets dusted twice a day.',{variant:'tea'}],
      ['photo',9,6,1,1,'Before and after','Framed. Before: the old porch and a red door. After: black paint, a slat fence, one agave.'],
      ['pot',1,6,1,1,'Olive tree','In a concrete planter. It has never made an olive. It is purely aesthetic.']]},
  {id:'dakota',w:12,h:10,style:{floor:'#e2d0b0',alt:'#ecdcc0',wall:'#f2f2ee',trim:'#b98a5a',pattern:'wood',rug:'#9ccfd8'},walls:[],rug:[3,5,5,3],
    residents:[['Dakota',4,6,'dakota',["We're restoring the original 1912 windows. It's a whole thing.","Mr. Washington told us the windows are older than his father. He was very serious about it.",'Every house on this street has a story. Ours is: the plumbing.']],
      ['Ryan',8,5,'ryan',['Baby Hudson is asleep. Please whisper. Please. I am begging.','We moved from the Westside for the space. And the character. Mostly the price. Which was still a lot.','I work from home. Home is very loud on the Alvarez side. I bought noise-canceling headphones. They lost.']]],
    objects:[['bed',9,1,2,2,"Hudson's crib",'Baby Hudson, five months old, asleep under a mobile of tiny felt clouds that cost eighty dollars.'],
      ['table',2,2,2,2,'Dining table','Reclaimed wood. Reclaimed from where? Ryan does not know. It was very expensive.'],
      ['shelf',7,8,3,1,'Book shelf','Baby books, a guide to historic window restoration, and a plant care book with every plant marked DEAD.'],
      ['pot',1,7,1,1,'Monstera','Huge. Healthy. Its name is Kevin. The Kevin next door finds this upsetting.']]},
];

worlds.blvd=makeBlvd();
worlds.jpark=makeJPark();
worlds.griffith=makeGriffith();
for(const spec of LA_ROOMS) {
  const m=makeRoom(spec); m.region='la'; worlds[spec.id]=m;
  if(spec.zones) m.zones=spec.zones;
  if(spec.rugs) m.rugs.push(...spec.rugs);
}
// Sal (Long Island) and Sol (LA) both drive to the airport.
{ const sal=worlds.taxi.npcs.find(n=>n.name==='Sal'); if(sal) sal.driver=true; }
