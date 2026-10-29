'use strict';
// data/maps-la.js — Los Angeles as content: buildings, people's colors, Nickel's shop lines, the three outdoor areas
// (Downtown LA 'blvd', Jefferson Park 'jpark', Griffith Park 'griffith') and every room.
// Same spec format as data/maps-le.js (see the notes at the top of that file). Built by engine/la.js.
// Loaded after data/party.js, before engine/la.js.
// Downtown styles: deco (historic core: storefront with apartments above), cinema (Broadway movie palace), loft
// (brick warehouse lofts), tower (glass high-rise). floors = stories drawn above the storefront.
// Jefferson Park styles: strip (one-story Jefferson Boulevard storefront), store (the sleek new juice bar),
// craftsman (1900s bungalow; cond renovated, flip, crowded, kept or rundown), spanish, tom (Tom's real house).

const LA_PALETTES={
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
  ryan:{skin:'#f0c4a0',hair:'#8a6a4a',shirt:'#9ea3ab',pants:'#3b4057',hat:null},
  // Chapter 4: the studio lot.
  ray:{skin:'#8a5a3c',hair:'#2a2220',shirt:'#2f3a4a',pants:'#2c2c33',hat:'#2f3a4a'},toni:{skin:'#e9b896',hair:'#c9463d',shirt:'#f4f4f0',pants:'#3a3646',hat:'#e8584a'},
  kiki:{skin:'#c99372',hair:'#2a2220',shirt:'#1b1b1f',pants:'#4a5868',hat:null},dana:{skin:'#f0c4a0',hair:'#5a3a2a',shirt:'#6a4f7a',pants:'#2c2c33',hat:'#3a2a4a'},
  // Chapter 6: Old Oak Park.
  bernadette:{skin:'#8a5a3c',hair:'#d9d5c4',shirt:'#e8843a',pants:'#3f4650',hat:'#2f5a8a'}
};

// Nickel runs the LA shop. Same stock as Penny's Pockets; her own lines.
const NICKEL={
  intro:["Welcome to Nickel's. I'm Penny's cousin. Better weather, same prices.",
    'Gear for the whole family, snacks for fights, sunscreen for the soul.',
    'Got something to sell? I buy almost anything. Penny warned me about Steve.'],
  hello:['Back again! Did you find parking? Nobody finds parking.','Browse all you like. Browsing is free in Los Angeles. Nothing else is.','Fresh stock. Same Nickel.'],
  tab:{healing:'Snacks and fixes. Eat them in battle or from the menu.',battle:'For monsters only. The coyotes have been warned.',
    sell:'Half price, no haggling. This isn\'t the Rose Bowl flea market.'},
  gear:id=>typeof PENNY!=='undefined'?PENNY.gear(id):'',
  bought:['Pleasure doing business.','Good choice. Very you.','Into the pockets it goes.','Ka-ching. That one is for parking.'],
  sold:['Sold! I know just the shelf.','Half price, full gratitude.','That\'s very vintage now.'],
  broke:['Not enough coins. Griffith Park pays, in a way.','Short on coins. The monsters up in the park are carrying some.'],
  keep:['I could never. That\'s a family thing.','Not for sale. Some things are priceless.','Keep that one. Trust me.'],
  // Shop tiers (see SHOP_TIER_GATES in data/party.js): lines for the shelves that open after chapters 3, 6 and 9.
  fresh:['New shipment! It came in on a truck that found parking. Come look.','Fresh stock, and a real upgrade. Penny will be so jealous.','The top shelf is finally stocked. Worth the traffic.'],
  tierTab:{
    gear:['The new shelf: sturdier, shinier, still reasonable by Los Angeles standards.','The grown-up shelf. Gear for people who actually fight things.','Top shelf. Everything up here has a story and an agent.'],
    healing:['Bigger bandages and a real picnic. Same pockets, more fixing.','The med kit has a flashlight now. Very LA. It has a ring light too.','Feast-grade snacks. Catered, practically.'],
    battle:['The Confetti Cannon is new. Please aim it away from the palm trees.','Fireworks. Legally a gray area. Emotionally a gift.','The Finale Rocket. Hold it like a parking ticket.']},
  who:'Nickel'
};

// ---------- Buildings ----------
const LA_HOUSES=[
  {id:'coffee',area:'blvd',name:'Golden Hour Coffee',label:'COFFEE',x:5,y:3,w:5,h:5,style:'deco',floors:3,wall:'#d9b48a',stone:'#efdcbc',roof:'#8a5a3a',awning:'#e2a24a',awning2:'#fff1d6',sign:'#3d2b26',ink:'#ffd968',icon:'cup',fire:true},
  {id:'ramen',area:'blvd',name:'Ramen Ramen',label:'RAMEN',x:10,y:3,w:5,h:5,style:'deco',floors:4,wall:'#c98f6a',stone:'#e8c8a8',roof:'#7a3a33',awning:'#b9483f',awning2:'#2c2c33',sign:'#f4ecd2',ink:'#b9483f',icon:'lantern'},
  {id:'cinema',area:'blvd',name:'The Starlite',label:'STARLITE',x:16,y:4,w:5,h:5,style:'cinema',floors:3,wall:'#e9c9a6',stone:'#f4e2c4',roof:'#a8453a',awning:'#2c2c33',awning2:'#2c2c33',sign:'#2c2c33',ink:'#ffd968',icon:'star'},
  {id:'nickels',area:'blvd',name:"Nickel's",label:'SHOP',x:22,y:4,w:5,h:5,style:'deco',floors:2,wall:'#b8c4b0',stone:'#e2e8d8',roof:'#2f6f73',awning:'#3a9ca0',awning2:'#fbefd2',shop:true,keeper:'Nickel',icon:'coin',fire:true},
  {id:'wardrobe',area:'blvd',name:'Backlot Wardrobe',label:'WARDROBE',x:2,y:14,w:5,h:5,style:'loft',floors:3,wall:'#a0523a',stone:'#d9b49a',roof:'#5a3a2a',awning:'#8a6aa0',awning2:'#f3eaf6',sign:'#2c2c33',ink:'#e3c6f0',icon:'hanger',ghost:'GARMENT CO.'},
  {id:'lofts',area:'blvd',name:"TNB's Loft",label:'LOFTS',x:9,y:15,w:5,h:5,style:'loft',floors:3,wall:'#8a5a44',stone:'#d9c0a0',roof:'#4a3a32',awning:'#2c2c33',awning2:'#2c2c33',sign:'#2c2c33',ink:'#f4ecd2',home:true,ghost:'FURNITURE'},
  {id:'tower',area:'blvd',name:'The Grand Tower',label:'GRAND',x:16,y:15,w:5,h:5,style:'tower',floors:9,wall:'#6f9fc4',stone:'#c9d6de',roof:'#3f5a74',home:true},
  {id:'lacab',area:'blvd',name:'Angel City Cab Co.',label:'CABS',x:22,y:16,w:5,h:5,style:'deco',floors:1,wall:'#f4e6c8',stone:'#fff4dc',roof:'#d9a43a',awning:'#2c2c33',awning2:'#f2c75a',taxi:true,icon:'cab'},
  {id:'creole',area:'jpark',name:"Odette's Creole Kitchen",label:'CREOLE',x:3,y:3,w:5,h:4,style:'strip',wall:'#e8c060',roof:'#7a3a5a',awning:'#4a7a3a',awning2:'#f4e6c0',sign:'#4a2a4a',ink:'#ffd968',icon:'pot',mural:true},
  {id:'pupuseria',area:'jpark',name:'Pupuseria La Ceiba',label:'PUPUSAS',x:8,y:3,w:5,h:4,style:'strip',wall:'#f2e6d0',roof:'#2f6fb3',awning:'#2f6fb3',awning2:'#ffffff',sign:'#2f6fb3',ink:'#ffffff',icon:'leaf',grille:true},
  {id:'boards',area:'jpark',name:'Board Room',label:'SKATE',x:16,y:3,w:5,h:4,style:'strip',wall:'#d6e6ec',roof:'#2f4e6a',awning:'#e2793a',awning2:'#2c2c33',sign:'#2c2c33',ink:'#f2a05a',icon:'board',mural:true},
  {id:'juicebar',area:'jpark',name:'Very Green Juice',label:'JUICE',x:23,y:3,w:5,h:4,style:'store',wall:'#f4f6f0',roof:'#4f8a4a',awning:'#6fb35a',awning2:'#f4fbe8',sign:'#f4fbe8',ink:'#3f7a3a',icon:'leaf'},
  {id:'tomhouse',area:'jpark',name:"Tom's House",label:'3468',x:1,y:13,w:5,h:5,style:'tom',wall:'#cbc2aa',roof:'#4e4e52',trim:'#ece6d6',doorColor:'#c98a44'},
  {id:'jordansam',area:'jpark',name:"Jordan and Sam's Place",label:'2732',x:9,y:13,w:5,h:5,style:'craftsman',cond:'flip',wall:'#2c2c2e',roof:'#1d1d20',trim:'#f4f4f0',doorColor:'#c9a24a'},
  {id:'casa',area:'jpark',name:'Casa Alvarez',label:'ALVAREZ',x:16,y:13,w:5,h:5,style:'craftsman',cond:'crowded',wall:'#d9a05a',roof:'#6a4a3a',trim:'#f4e6c8',doorColor:'#2f8a8a'},
  {id:'dakota',area:'jpark',name:"Dakota and Ryan's Place",label:'2740',x:23,y:13,w:5,h:5,style:'craftsman',cond:'flip',wall:'#f2f2ee',roof:'#4a4f58',trim:'#2c2c2e',doorColor:'#b98a5a'},
];

// ---------- Outdoor areas ----------
// Chapter 2 (Smog on 2nd Avenue): purple smog puts the neighbors in a daydream until the Big Shake is beaten.
const CH2_SMOG={chapter:2,flag:'ch2-smog',notFlag:'ch2-clear'},CH2_CLEAR={chapter:2,flag:'ch2-clear'};
// Olivia's family is on a desert trip while Tom looks after Nara (chapters 2 and 4, until the chapter is done).
const NARA_TRIP=[{chapter:2,notFlag:'ch2-done'},{chapter:4,notFlag:'ch4-done'}];
const NARA_BACK=S=>(S.chapter===2&&!!S.flags['ch2-done'])||(S.chapter===4&&!!S.flags['ch4-done']);
const FRONT_GARDEN='Purple flax, red cordyline and a lot of mulch. Drought tolerant. Tom waters it anyway.';
const LA_AREAS=[
  // Downtown LA: the historic core and the Arts District in one block. Same street shape as The Square.
  {id:'blvd',name:'Downtown LA',w:30,h:26,region:'la',ground:'city',
    tag:'Towers, lofts, a movie palace and one taco truck.',
    eyebrow:'LOS ANGELES / DOWNTOWN',
    hint:"Shops and apartments. Nickel's sells things. Jefferson Park south. Griffith Park up the steps, northwest. Studio lot east.",
    spawn:{x:27,y:21},
    paths:[[2,9,28,10],[2,20,27,21],[7,0,8,21],[14,9,15,25]],
    houseRoad:[10,21],
    // Painted plate (art/blvd.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks. The painting has no street
    // at the top or the right-hand wall, so the trail west and the studio road east leave along the main street instead.
    plateMask:[
      '##############################',
      '##############################',
      '##############################',
      '###..#########################',
      '###..#########################',
      '###..#########################',
      '###..#########################',
      '##....#.####.#################',
      '......#.#..................###',
      '...........................###',
      '..#..........#.....#.........#',
      '#.#######....##....#.........#',
      '#.#############....#.........#',
      '#.########################...#',
      '#.########################...#',
      '#.############################',
      '#.############################',
      '#.############################',
      '#.############################',
      '#......................#######',
      '#......................#######',
      '#########....................#',
      '############....#............#',
      '############....#............#',
      '############....#............#',
      '############....##############'],
    // The painted street has one-tile corridors (the east sidewalk, the west street and the way round to the south sidewalk).
    // NPCs never wander onto them, so nobody can plug a door or an exit (tools/reach_test.py checks this).
    noGo:[...[11,12,13,14,15,16,17,18,19].map(y=>[1,y]),[1,10],[3,3],[4,3],[3,4],[4,4],[3,5],[4,5],[3,6],[4,6],...[12,13,14,15].map(x=>[x,22]),...[12,13,14,15].map(x=>[x,23]),...[12,13,14,15].map(x=>[x,24]),
      [26,13],[27,13],[28,13],[26,14],[27,14],[28,14],[27,12],[28,12],[20,24],[21,24],[22,24],[7,7],[12,7],[2,7],[5,7]],
    // Chapter 4: the east end of the boulevard leads to the studio lot (Sunset Gold Studios).
    border:{kind:'citywall',open:[[12,25],[13,25],[14,25],[15,25],[29,12],[29,13]]},
    exits:[[3,3,'griffith',10,20,'up','path'],[4,3,'griffith',11,20,'up','path'],[12,25,'jpark',14,1,'down'],[13,25,'jpark',15,1,'down'],[14,25,'jpark',16,1,'down'],[15,25,'jpark',17,1,'down'],[29,12,'studio',1,10,'right'],[29,13,'studio',1,11,'right']],
    // Chapter 2: the trail is closed for smog until Tom and TNB work out where it is coming from.
    gates:[{at:[[3,3],[4,3]],look:'barrier',dy:.4,cond:{chapter:2,notFlag:'ch2-source'},name:'Road barrier',
      lines:['TRAIL CLOSED. SMOG ADVISORY. Please stay indoors.','Somebody added in marker: "This means you, Gary."'],
      when:[{flag:'ch2-smog',lines:['TRAIL CLOSED. SMOG ADVISORY. Please stay indoors.','The neighbors come first. Check on 2nd Ave and Jefferson Boulevard.']}]},
      // The studio lot is a closed set until chapter 4.
      {at:[[29,12],[29,13]],look:'barrier',dy:.4,cond:{test:S=>S.chapter<4},name:'Studio gate',
        lines:['SUNSET GOLD STUDIOS. CLOSED SET. Crew and talent only.','A guard waves from the booth. Not a hello wave. A no wave.']}],
    objects:[
      // Palms, lamps, planters and the parked props are painted; the mask blocks them. Only things you can touch are listed here.
      ['sign',28,14,1,1,'Downtown notice',"Downtown LA. Eight doors: shops below, people living above. Nickel's sells things, east end. Look for the coin."],
      ['sign',2,8,1,1,'Trail signpost','GRIFFITH PARK, up the steps. Watch for coyotes. Watch for tar. Watch the ground.'],
      ['sign',11,23,1,1,'South signpost','JEFFERSON PARK, this way. Craftsman houses from 1910, Jefferson Boulevard, pupusas.'],
      ['tacotruck',21,11,3,3,'Taco truck','A taco truck called TACOS TACOS. The menu says: TACOS.',{restore:true,
        restoreText:'Al pastor for everyone. Everybody is completely restored. Tom tips well.'}],
      ['bench',24,12,2,2,'Bus bench','An ad for a lawyer covers the whole bench. He\'s smiling at you. He\'s always smiling at you.'],
      ['metro',20,22,3,2,'Metro stairs','Down to the train. TNB knows every line, every stop, and which car has the best seats.'],
      ['sign',23,8,1,1,'Shop sign',"NICKEL'S. Penny's cousin. Gear, snacks, and things that go POP.",{shopSign:true}],
      ['lacab',25,21,2,2,'Cab 8','Angel City Cab Co., cab 8. It\'s spotless. Sol details it twice a day. Sol has time.'],
      ['planter',22,8,1,1,'Bird of paradise','A bird of paradise in a pot. It looks like it wants to leave.',{dry:true}]],
    npcs:[
      {name:'Skye',x:3,y:10,look:'skye',lines:["I'm filming a day-in-my-life video. I live in the lofts.","This is the day. You're in my life now.",'Say hi to my eleven followers.']},
      {name:'Chet',x:9,y:11,look:'chet',lines:["I'm an actor. Well. I'm an actor who parks cars at a tower.",'I had a callback last week. For a cereal.','The cereal went with someone else. It happens.']},
      {name:'Wes',x:9,y:21,look:'wes',lines:["I'm a screenwriter. I live in the lofts, two floors down from your boyfriend.","Draft forty-one. It's about a man who writes screenplays. It's very personal.",'He lends me a mug when I\'m stuck. I\'m stuck a lot. I have nine of his mugs.']},
      // Boomie: Tom's friend, same age, lives downtown. An amazing gospel and soul singer, very kind, about to go on tour.
      // Her talk is the tour (next stops), the Friday home show where Tom has the front row, and songs. No food talk.
      // Voice: warm, young, deeper-voiced Black woman (voice id boomie2 in data/dialog-cast.js).
      {name:'Boomie',x:11,y:10,look:'skye',sheet:'boomie',kin:true,trace:'boomie-hug',duration:0.8,lines:[
        'TOM! Get over here. Hug. Mmm-hmm. There it is.',
        'I leave Tuesday for the tour. Atlanta first, then Chicago, then Nashville. One suitcase. Nine dresses.',
        'Friday is the home show, right here downtown. You\'re in the front row. I wrote your name on the seat.',
        'Oh, the sun\'s coming up on my street. Hallelujah, hallelujah! Sorry. I sang that whole sentence.'],
        revisit:[
          'La la LAAA! Oops. A car alarm went off. That one is on me.',
          'Atlanta, then Chicago, then Nashville. I keep saying it out loud so I don\'t forget.',
          'Friday night, front row. I don\'t start the show without you. Okay, I start. But I look for you.',
          'How\'s TNB? Tell him there\'s a seat for him too. Two front row seats. Don\'t make me beg.',
          'Oh, when the morning comes, I\'m gonna rise. Rise, rise, rise! Sing with me, Tom. Amen!',
          'I open with a hymn my grandmother sang. She\'d say I\'m doing it too loud. She\'d be right.',
          'Sol says he parks his cab outside to hear me warm up. I say he\'s just early.',
          'You text me when you land. I mean it. A song is also fine.',
          'I sang in the shower this morning. The whole building clapped. Thin walls.',
          'Hmm hmm hmmm. Oh, I was humming? I\'m always humming.']},
      {name:'Bev',x:16,y:9,look:'bev',lines:['I came all the way from Ohio. I rode the tiny orange railway up the hill.','It went one block. It cost a dollar. Best dollar of my life.','Then I ate a pupusa in a market from 1917. I may never go home.']}]},

  // Jefferson Park: an early streetcar suburb, about 2,500 craftsman bungalows built 1905 to 1920, now a historic
  // preservation zone. Jefferson Boulevard shops up top, a residential street (2nd Ave) below.
  {id:'jpark',name:'Jefferson Park',w:30,h:24,region:'la',ground:'lawn',
    tag:'Craftsman bungalows from 1910. Jefferson Boulevard. Jacarandas.',
    eyebrow:'LOS ANGELES / JEFFERSON PARK',
    hint:"Shops on Jefferson Boulevard. 2nd Ave below. Tom's house is 3468, bottom left.",
    spawn:{x:14,y:2},
    // Painted plate (art/jpark.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks. Doors, exits and the
    // N-S street (x14,15) keep their old tiles; street trees, hedges and yards are blocked by the mask, not by objects.
    plateMask:[
      '##############....############',
      '##############....############',
      '##############....############',
      '##############....############',
      '##############....############',
      '##############....############',
      '###..........................#',
      '#####........................#',
      '#####....................##..#',
      '###..........................#',
      '##############..#.......####.#',
      '##############..##############',
      '##############..##############',
      '##############..##############',
      '##############..##############',
      '###.#######.##..##.######.####',
      '###.#######.##..##.######.####',
      '###.#######.##..##.######.####',
      '###..........................#',
      '###..........................#',
      '###..#...............#..#...##',
      '###.......####..#......#######',
      '#####....#####..##############',
      '##############..##############'],
    paths:[[1,8,28,8],[1,11,28,11],[1,19,28,19],[1,22,28,22]],
    tiles:[{tile:'road',rects:[[1,9,28,10],[1,20,28,21],[14,0,17,22]]}],
    houseRoad:[8,19],
    border:{kind:'jacaranda',open:[[14,0],[15,0],[16,0],[17,0],[14,23],[15,23],[29,9],[29,10]]},
    exits:[[14,0,'blvd',12,24,'up','road'],[15,0,'blvd',13,24,'up','road'],[16,0,'blvd',14,24,'up','road'],[17,0,'blvd',15,24,'up','road'],[14,23,'oakpark',12,20,'down','road'],[15,23,'oakpark',13,20,'down','road'],
      [29,9,'carbarn',1,10,'right','road'],[29,10,'carbarn',1,10,'right','road']],
    // Chapter 6: Old Oak Park (south end of 2nd Ave) is closed for tree trimming until chapter 6, and until Nara is along.
    gates:[{at:[[14,23],[15,23]],look:'barrier',dy:-.4,cond:{test:S=>S.chapter<6||(S.chapter===6&&!S.flags['ch6-nara'])},name:'Park barrier',
      lines:['OLD OAK PARK. CLOSED FOR TREE TRIMMING.','Somebody has drawn a very small squirrel on the sign. It\'s wearing a tie.'],
      when:[{chapter:6,flag:'ch6-tnb',lines:['OLD OAK PARK. CLOSED FOR TREE TRIMMING.','TNB: "Babe, we should get Nara first. Olivia and Michael are on 2nd Ave."']}]},
      // Chapter 8: the old Car Barn at the east end of Jefferson Boulevard stays chained shut until the potluck goes cold.
      {at:[[29,9],[29,10]],look:'schoolgate',cond:{test:S=>S.chapter<8||(S.chapter===8&&!S.flags['ch8-block'])},name:'Car Barn gate',
        lines:['DIVISION NINE CAR BARN. Est. 1912. Closed since 1963.','The chain on the gate is cold. Colder than it should be in Los Angeles.']}],
    objects:[
      // Re-laid onto painted things (the plate hides every object; each is touched from a walkable tile).
      ['flax',2,15,1,1,'Front garden',FRONT_GARDEN],
      ['toybox',17,15,1,1,'Front yard','Two trikes, a kiddie pool with no water and one rubber duck, and a stroller parked like a getaway car.'],
      ['planter',24,15,1,1,'Drought garden','Sage, agave and a sign: NO LAWN, NO PROBLEM. The new neighbors put it in.',{dry:true}],
      ['sign',16,6,1,1,'Street sign','DOWNTOWN, back that way. Towers, tacos, a lawyer on a bench.'],
      ['sign',13,18,1,1,'Historic district plaque','JEFFERSON PARK. An early streetcar suburb: craftsman bungalows built 1905 to 1920, many from mail-order kits. A historic preservation zone since 2011.'],
      ['sign',17,7,1,1,'Jefferson Boulevard','Old-timers still call this stretch Little New Orleans. Creole kitchens, a pupuseria, a skate shop, and as of March, a juice bar.'],
      ['bench',21,5,2,1,'Bus bench','The 38 bus stops here. The Expo Line is a few blocks south. Tom has opinions about both.'],
      ['streetsign',2,19,1,1,'2nd Ave','2ND AVE. Craftsman houses from about 1910. Tom lives at 3468, the one with the wood door.'],
      ['streetsign',28,19,1,1,'2nd Ave','2ND AVE. Jacarandas, a lot of strollers, and the Alvarez clothesline.'],
      ['bench',3,22,2,1,'Parkway bench','Somebody painted it the colors of three different houses. All three houses approve.']],
    npcs:[
      // Olivia and Michael (and Lachlan, 4, and Isla, 1): Nara's family. Away on their desert trip while Tom has Nara
      // (chapters 2 and 4 until the chapter is done); data/scenes.js AWAY rule.
      {name:'Olivia',x:11,y:19,look:'marisol',sheet:'olivia',kin:true,trace:'olivia-hello',duration:0.75,away:NARA_TRIP,
        when:[{test:NARA_BACK,lines:[
          'Tom! You kept Nara alive! Did she eat? She didn\'t eat, did she.',
          'The desert was gorgeous. Lachlan found a rock. Isla ate a rock. Different rock.',
          'MICHAEL. Can you grab Isla? She\'s going for the dog bowl.']}],lines:[
        'Tom! Hi! Sorry, I\'m mid-sentence in my head. I\'m filing a story on AI in classrooms.',
        'The kids use it to write the homework. The teachers use it to grade the homework. Nobody is in the room.',
        'MICHAEL. Can you grab Isla? She has a leaf. She\'s going to eat the leaf.'],
        revisit:[
          'My editor wants a piece on AI taking jobs. I said I\'d write it myself. While I still can.',
          'Michael, can you take Lachlan? He\'s licking the fence. Thank you, babe.',
          'Everybody asks if robots will take their jobs. I tell them a robot still can\'t fold a fitted sheet. Neither can I.',
          'I interviewed a chatbot today. It was very polite. Too polite. I didn\'t trust it.',
          'Michael! Isla is near the curb. Okay. Never mind. Thank you, babe.',
          'Did Nara eat today? Tell me the truth. Michael, did Nara eat?',
          'Teachers aren\'t getting replaced. They\'re getting a very confident new student who never did the reading.']},
      {name:'Michael',x:13,y:19,look:'larry',sheet:'michael',kin:true,trace:'michael-hello',duration:0.95,away:NARA_TRIP,lines:[
        'Hey, Tom. Good to see you. Please ignore the cracker crumbs. They live here now.',
        'I work at Meta. I build things that connect people. Right now I\'m connecting a four-year-old to a nap.',
        'I heard Olivia say Michael. Whatever it is, I\'m on it. Isla, that is not a snack.'],
        revisit:[
          'Yes, Olivia. Heard you. Handled. Lachlan, we do not lick the fence.',
          'Lachlan wants to know if Nara is his dog. I said it\'s complicated. It\'s not. It\'s his dog.',
          'Isla said her first word last week. It was no. She uses it very well.',
          'I took a meeting today with Isla on my lap. She muted me. Best meeting of the quarter.',
          'My arms have never been stronger. I haven\'t lifted a weight in four years.',
          'Olivia writes about AI taking jobs. Nobody is coming for mine. Nobody wants bedtime.']},
      {name:'Mr. Washington',x:8,y:19,look:'washington',lines:['Bought this house in 1979. Same porch, same chair, same view.','Back then you could hear zydeco from the boulevard on a Saturday night.','You\'re the one fixing up the green house? Keep the old windows. They\'re better than the new ones.'],
        when:[{...CH2_SMOG,lines:['Back in 1979, this whole block...','...','Such a nice afternoon. It should always be this afternoon. Nobody needs to get any older.']},
              {...CH2_CLEAR,lines:['Where was I? Oh. 1979. This whole block smelled like gumbo on a Saturday night.','That smog had me stuck on one sentence for an hour. At my age I don\'t have hours to spare.','Thank you, Tom. And your young man. And the dog. Especially the dog.']}]},
      {name:'Marisol',x:17,y:8,look:'marisol',when:[{...CH2_SMOG,lines:['I\'m walking my dog. I\'ve always been walking my dog.','I\'ll always be walking my dog. Isn\'t that nice?']}],lines:["I'm walking my dog. He's somewhere.",'My grandparents rented on this block. Now I rent on this block. We\'re a tradition.','There he is. No. That\'s a lemon.']},
      {name:'Larry',x:8,y:6,look:'larry',when:[{...CH2_SMOG,lines:['I\'m blowing leaves. The same leaf. Over and over.','It never lands. It never has to. Very peaceful.']}],lines:["I'm blowing leaves.",'Onto the next yard.',"Tomorrow, they blow them back. It's a whole system."]}]},

  // Griffith Park: monsters. Same shape as Grump Hollow, with tar pits instead of a pond.
  {id:'griffith',name:'Griffith Park',w:24,h:22,region:'la',ground:'dry',
    tag:'Dusty trails. Tar pits. Six things are watching from the brush.',
    eyebrow:'LOS ANGELES / GRIFFITH PARK',
    hint:'Monsters live here. Smoglet is easy. The Big Shake isn\'t.',
    spawn:{x:11,y:19},
    wild:true,
    // Painted plate (art/griffith.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Trails: the main trail up the middle, a ridge trail to the lookout (top), a west slope to the Observatory hill,
    // a shore path under the south tar pit, and the east trail along y 11 to 12.
    plateMask:[
      '########################',
      '########################',
      '########################',
      '############.....#######',
      '##########...###########',
      '##########..############',
      '###..#####....##########',
      '###....#####..##########',
      '####...#####...#########',
      '#####...###....#########',
      '#######......###########',
      '###########..####.....##',
      '###########............#',
      '###########..###########',
      '##########.....#########',
      '###########.....########',
      '############......######',
      '####.............#######',
      '###...........##########',
      '#########.....##########',
      '#########.....##########',
      '##########..############'],
    border:{kind:'scrub',open:[[10,21],[11,21]]},
    exits:[[10,21,'blvd',3,4,'down'],[11,21,'blvd',4,4,'down']],
    pools:[{tile:'tar',cells:[[14,5],[15,5],[16,5],[17,5],[18,5],[19,5],[20,5],[21,5],[22,5],[23,5],[15,6],[16,6],[17,6],[18,6],[19,6],[20,6],[21,6],[22,6],[23,6],[14,7],[15,7],[16,7],[17,7],[18,7],[19,7],[20,7],[21,7],[22,7],[23,7],[15,8],[16,8],[17,8],[18,8],[19,8],[20,8],[21,8],[17,9],[18,9],[19,9],[20,9],[21,9],
      [4,16],[5,16],[6,16],[7,16]]}],
    objects:[
      ['rock',17,3,2,1,'Lookout rock','From up here you can see the Observatory\'s white dome across the ridge. On a clear night you can see three stars. On a normal night, one.'],
      ['sign',13,13,2,1,'Trailhead sign','GRIFFITH PARK. Stay on the trail. Start with the Smoglet. Save the hill for last.'],
      ['sign',14,6,1,1,'Tar warning','DO NOT STEP IN THE TAR. It\'s not a puddle. It\'s a commitment.'],
      ['bench',16,15,2,1,'Lookout bench','You can see the whole city from here. Most of it\'s parking.'],
      ['rock',13,10,3,1,'Fault marker','EARTHQUAKE COUNTRY. If the ground starts talking, don\'t answer.']],
    npcs:[],
    // Spots re-laid onto the painted trails (the Big Shake waits on the west slope below the Observatory).
    monsters:[['smoglet',9,17],['tickets',20,12],['coyote',13,8],['gridlock',15,3],['tarblob',5,8],['bigshake',3,6]]}
];

// ---------- Chapter 4 (Backlot Bedlam): Sunset Gold Studios, east of Downtown ----------
// Plans: one character per tile. '#' road (path), 'X' a dark pit under the catwalks (solid), '=' catwalk grating,
// 'd' a catwalk section that is still raised (pit until the light rig is fixed, data/scenes.js ch4LowerCatwalk),
// 'P' a theater flat (a painted wall panel, solid), anything else plain ground. Edges come from `border`.
function studioPlan(plan,objText={}) {
  const path=[],cat=[],pit=[],objs=[];
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='#') path.push([x,y,x,y]); else if(c==='=') cat.push([x,y,x,y]); else if(c==='X'||c==='d') pit.push([x,y]);
    else if(c==='P') objs.push(['flat',x,y,1,1,objText.P?objText.P[0]:'Theater flat',objText.P?objText.P[1]:'A painted wall panel. From the front it\'s a living room. From here it\'s plywood and hope.']); } });
  return {paths:path,tiles:[{tile:'catwalk',rects:cat}],pools:[{tile:'pit',cells:pit}],objects:objs};
}
const CH4_ON={chapter:4,notFlag:'ch4-done'},CH4_DONE={from:4,flag:'ch4-done'};
LA_AREAS.push(
  // The studio lot: the guard booth, trailer row, craft services. Downtown is west; the Backlot is north.
  {id:'studio',name:'Studio Gate',w:24,h:18,region:'la',ground:'lot',
    tag:'Sunset Gold Studios. A guard, three trailers and one very important snack table.',
    eyebrow:'LOS ANGELES / SUNSET GOLD STUDIOS',
    hint:'Trailers up top. Craft services on the right. The Backlot is north.',
    spawn:{x:1,y:10},
    // Painted plate (art/studio.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks. Gate wall, booth, trailers, the craft
    // services tent, lights and carts are painted and blocked; the road north (x 10 and 11) and the lot walk. Exits: the Western Entrance
    // (west edge, rows 9 to 12, to the boulevard) and the North Passage (top, x 10 and 11, to the Backlot).
    plateMask:[
      '##########..############',
      '##########..############',
      '##########..############',
      '##########..############',
      '##########..############',
      '#########...############',
      '#########.....##########',
      '..#######...............',
      '....#####.......########',
      '.....####.....##########',
      '............############',
      '............############',
      '..........##############',
      '..........##############',
      '##.......###############',
      '##.........#.###########',
      '##.............#########',
      '#####...........########'],
    border:{kind:'studiowall',open:[[0,9],[0,10],[0,11],[0,12],[10,0],[11,0]]},
    exits:[[0,9,'blvd',28,12,'left'],[0,10,'blvd',28,12,'left'],[0,11,'blvd',28,13,'left'],[0,12,'blvd',28,13,'left'],[10,0,'backlot',9,16,'up'],[11,0,'backlot',10,16,'up']],
    objects:[
      // Only what you can reach and touch is listed; the rest of the painted set dressing is scenery.
      ['booth',5,7,3,3,'Guard booth','A tiny booth, a tiny fan and a tiny TV showing the gate. The gate is on TV. The gate is also right there.'],
      ['trailer',14,4,4,3,'Wardrobe trailer','WARDROBE. A sign on the door: TNB IS ON SET. DO NOT TOUCH THE STEAMER.',{trailer:'WARDROBE',col:'#8a6aa0'}],
      ['trailer',18,4,4,3,'Hair and makeup trailer','HAIR & MAKEUP. It smells like hairspray from twenty feet away.',{trailer:'HAIR',col:'#d65aa0'}],
      ['trailer',22,4,2,3,'Talent trailer','TALENT. The star is inside. He\'s been inside since Tuesday.',{trailer:'TALENT',col:'#3a9ca0'}],
      ['crafty',15,9,3,2,'Craft services','Bagels, string cheese, a whole bowl of red licorice and coffee that could strip paint.',{crafty:true}],
      ['sign',2,13,1,1,'Studio sign','SUNSET GOLD STUDIOS. Making movies since 1931. Making them on time since never.'],
      ['cstand',10,14,1,1,'Studio lights','Three lights on three tripods, all pointed at nothing. Somebody is very proud of the extension cords.'],
      ['applebox',12,14,1,1,'Apple box','A wooden apple box. It holds up actors who are shorter than their scene partner.'],
      {kind:'cstand',at:[[9,14],[11,15]],name:'Traffic cone',text:'A traffic cone. Orange, a little dented, and the only thing on the lot that always knows where to be.'}],
    npcs:[
      {name:'Ray',x:4,y:9,look:'ray',roam:0,lines:['Sunset Gold Studios. Closed set. Name?','Tom. Plus one dog. Plus one boyfriend who already works here. Fine. Go on in.','Nobody gets past Ray. Except the dog. The dog got past Ray. Don\'t tell anyone.'],
        when:[{...CH4_DONE,lines:['Ray here. Shoot wrapped. Nobody got past me. Except the megaphone. And the moths. And the dog.','Good job, Tom. Don\'t tell anyone I said good job.']},
              {...CH4_ON,flag:'ch4-gate',lines:['Nobody came through my gate. Nobody with legs.','Little things, though. Buzzing. Clapping. One of them asked me for a compliment. I said no. I regret it.']}]},
      {name:'Toni',x:14,y:8,look:'toni',roam:0,crafty:true,lines:['Craft services! Take a bagel. Take two. Nobody is counting. I\'m counting.','The crew eats like a swarm of locusts. Polite locusts. With lanyards.']},
      {name:'Kiki',x:8,y:11,look:'kiki',roam:0,lines:['Kiki. Production assistant. I have a headset, three radios and zero answers.','If anybody asks, I\'m walking somewhere important. I\'m always walking somewhere important.'],
        when:[{...CH4_DONE,lines:['We WRAPPED! On time! Well. Four hours late. Which is on time for us.','I\'m going to sleep for a week. In my car. With the headset on.']},
              {...CH4_ON,flag:'ch4-gate',lines:['Rack two is still missing. Forty costumes. The actors are filming in bathrobes.','Last thing on my radio before the static was the Stage 7 fog machine. It turned itself on.']}]},
      {name:'Dana',x:6,y:12,look:'dana',roam:0,lines:['Dana Park. Director. First feature. Please don\'t ask me how it\'s going.'],
        when:[{...CH4_DONE,lines:['We got the shot. All of them. Even the one with the horse.','Tell TNB the costumes looked incredible. Tell him I said incredible. Tell him twice.']},
              {...CH4_ON,flag:'ch4-gate',lines:['Without wardrobe there\'s no shoot. Without a shoot there\'s no movie.','Without a movie I go back to directing car commercials. I love cars. I don\'t love talking cars.']}]}]},
  // The Backlot: a Western street (top left), a New York street (top right) and a jungle set (right), with Soundstage 7 straight up the road.
  {id:'backlot',name:'The Backlot',w:24,h:18,region:'la',ground:'backlot',
    tag:'A fake Old West, a fake New York and a fake jungle. The dirt is real.',
    eyebrow:'LOS ANGELES / THE BACKLOT',
    hint:'The Western street is top left, New York is top right, the jungle set is on the right. Soundstage 7 is straight up the road.',
    spawn:{x:10,y:16},
    wild:true,
    // Painted plate (art/backlot.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks. Walkable: the studio gate lot at the
    // bottom, the plaza, the road north to the Stage 7 door (x 12 and 13), the Western dirt strip (row 6 and a corridor on row 5), and the New York sidewalk.
    // Exits: the Stage 7 door (top, x 12 and 13, row 2) and the studio gate (bottom, x 9 and 10, row 17).
    plateMask:[
      '########################',
      '########################',
      '############..##########',
      '############..##########',
      '############..##########',
      '#######.........########',
      '.........###....########',
      '###....####...##########',
      '###########..###########',
      '#########..#.###########',
      '#######......###########',
      '#######.....############',
      '########.....###########',
      '########......##########',
      '#########....###########',
      '########....############',
      '..####.....#############',
      '...........#############'],
    border:{kind:'studiowall',open:[[12,2],[13,2],[0,16],[0,17],[1,17],[2,17],[3,17],[4,17],[5,17],[6,17],[7,17],[8,17],[9,17],[10,17]]},
    exits:[[9,17,'studio',10,1,'down'],[10,17,'studio',11,1,'down'],[12,2,'stage7',9,15,'up'],[13,2,'stage7',10,15,'up']],
    gates:[{at:[[12,2],[13,2]],look:'barrier',dy:1,cond:{chapter:4,notFlag:'ch4-sets'},name:'Stage 7 door',
      lines:['SOUNDSTAGE 7. The big door is locked from the inside. The red light is on: ROLLING.','Nobody is rolling anything. TNB says the sets come first. The Sprites will wreck the shoot.']}],
    objects:[
      // Only what you can reach and touch is listed; the rest of the painted set dressing is scenery.
      ['western',2,2,4,4,'Saloon','SALOON. The swinging doors swing. That\'s the only thing on this street that works.',{sign:'SALOON',col:'#a8784a'}],
      ['western',6,2,3,3,'General store','GENERAL STORE. Flour, nails, rope. All of it glued to the shelves.',{sign:'STORE',col:'#b98a5a'}],
      ['hydrant',15,6,1,1,'Fire hydrant','A fire hydrant. Fiberglass. A prop. Nara doesn\'t know that, and nobody is going to tell her.',
        {when:[{flag:'ch4-fetch',text:'A fiberglass fire hydrant. It\'s been... christened. Props has been notified.'}]}],
      ['subway',16,4,4,3,'Subway entrance','SUBWAY. The stairs go down four feet and stop at a painted wall. The sign says UPTOWN. It is lying.'],
      ['camera',11,9,1,1,'Camera dolly','A film camera on a dolly track. A sticker says DO NOT TOUCH. Tom touches it with one finger. It rolls two inches. Everybody holds their breath.'],
      ['cases',4,10,3,2,'Equipment cases','CAMERA B. LIGHTS. SANDWICHES. The sandwiches are in the case labeled LIGHTS.'],
      ['booth',5,12,3,4,'Guard booth','The back of the guard booth. Ray is inside. He waves without looking up. He has been waving since 1998.'],
      ['cart',14,12,3,3,'Golf cart','A studio golf cart. Top speed eight miles an hour. Every crew member has raced it. Nobody has won.'],
      ['sign',0,13,5,3,'Studio sign','SUNSET GOLD STUDIOS. Someone stuck a note on the wall: PLEASE STOP TAKING THE GOOD PENS.']],
    npcs:[],
    monsters:BACKLOT_MONSTER_SPOTS},
  // Soundstage 7 (the dungeon), painted plate (art/stage7.webp, engine/plate.js), 24 x 18 tiles. The wardrobe department (left, sealed
  // behind its racks and sewing tables), the video village and fog machines (right) and the open stage floor between them. The way up to
  // the stage set (north, the stairs at x 14 to 16) is shut by a gate until TNB fixes the light rig: three junction boxes switched on in
  // the order of the gels on the rig (blue, amber, red), data/scenes.js. The mask is the walk map: '#' blocks, '.' walks. The rig, the
  // boxes and the spike tape are drawn live over the painting (liveKinds) because the puzzle changes them.
  {id:'stage7',name:'Soundstage 7',w:24,h:18,region:'la',ground:'stage',
    tag:'Wardrobe, a fog machine that turned itself on, and a catwalk that is up.',
    eyebrow:'LOS ANGELES / SOUNDSTAGE 7',
    hint:'Wardrobe on the left, the fog machines on the right. The stage set is up the stairs at the top.',
    spawn:{x:9,y:15},
    wild:true,
    liveKinds:['jbox','lightrig','tapemark'],
    plateMask:[
      '########################',
      '########################',
      '########################',
      '###############..#######',
      '###############..#######',
      '##############...#######',
      '###########..........###',
      '###########.....########',
      '#########......#########',
      '########.......#########',
      '######.........#########',
      '######...........#######',
      '########..........######',
      '#########..##......#####',
      '#########..###.....#####',
      '#########..#######.....#',
      '#########..##########..#',
      '########################'],
    border:{kind:'studiowall',open:[[9,16],[10,16],[15,3],[16,3]]},
    exits:[[9,16,'backlot',12,3,'down'],[10,16,'backlot',13,3,'down'],[15,3,'stageset',10,12,'up'],[16,3,'stageset',11,12,'up']],
    // The catwalk is up (and the work lights are off) until the rig is fixed: the stairs to the set are shut.
    gates:[{at:[[15,3],[16,3]],look:'barrier',dy:.9,cond:{chapter:4,notFlag:'ch4-rig'},name:'The catwalk',
      lines:['The catwalk up to the set is raised. The stairs end in a gap and a very dark drop.','TNB says the light rig runs the catwalk motor. Fix the rig first.']}],
    objects:[
      // Only what you can reach and touch is listed; the rest of the painted set dressing is scenery.
      ['rack',5,8,2,2,'Rack 3','RACK 3. Trench coats. Every single extra wears one. Every single one.'],
      ['roadcase',9,6,2,2,'Road case','A road case covered in stickers. One says: IF FOUND, RETURN TO WARDROBE. It\'s not wardrobe’s.'],
      ['roadcase',17,10,2,2,'Road case','A road case full of cable. Every cable is tangled. Boppy would get along with these.'],
      ['applebox',19,4,3,2,'Video village','Four monitors, all showing the same empty stage. The fifth is showing fog. TNB says it\'s called a video village. Tom says it\'s a lot of screens.'],
      ['camera',15,8,2,2,'Camera dolly','A camera on a dolly, on its own little railroad. Somebody has taped NO TOUCHING over the lens. Tom approves.'],
      ['fogmachine',21,6,1,2,'Fog machine','A fog machine. It\'s on. Nobody turned it on. It just keeps going: PFFFFT.'],
      ['fogmachine',16,7,2,1,'Fog machine','Another fog machine. Also on. Also nobody turned it on.'],
      ['tapemark',8,9,2,1,'Spike tape','Glow tape on the floor: RACK 2. There\'s nothing on it. TNB stares at it like it owes him money.'],
      ['lightrig',11,8,2,1,'Light rig','The main light rig, dead. Three colored gels across the front, left to right: BLUE, AMBER, RED. Three cables run off to junction boxes.',
        {when:[{flag:'ch4-rig',text:'The light rig, humming. Blue, amber, red. TNB taped the cable down with gaffer tape. Twice.'}]}],
      ['jbox',6,11,1,1,'Red junction box','A junction box with a RED stripe. One big switch.',{jbox:'red'}],
      ['jbox',21,15,1,1,'Blue junction box','A junction box with a BLUE stripe. One big switch.',{jbox:'blue'}],
      ['jbox',13,12,1,1,'Amber junction box','A junction box with an AMBER stripe. One big switch.',{jbox:'amber'}],
      ['sign',12,12,1,1,'Stage sign','SOUNDSTAGE 7. Red light means rolling. Somebody has added: OR HAUNTED.']],
    monsters:STAGE7_MONSTER_SPOTS},
  {id:'stageset',name:'The Stage Set',w:20,h:14,region:'la',ground:'stage',
    tag:'A ruined castle that is not a castle, under forty lights.',
    eyebrow:'LOS ANGELES / SOUNDSTAGE 7 / THE SET',
    hint:'The set is lit. Something is sitting at the top of the stairs.',
    spawn:{x:10,y:12},
    // Painted plate (art/stageset.webp, engine/plate.js), 20 x 14 tiles. The mask is the walk map: '#' blocks, '.' walks. The castle ruins, scaffolds,
    // camera crane, crates and lights are painted and blocked; the compass floor, the stairs to the director's platform (x 10 and 11) and the
    // entry ramp (x 9 to 11, bottom) walk. Exit: the ramp, back down the catwalk to Soundstage 7.
    plateMask:[
      '####################',
      '####################',
      '####################',
      '####################',
      '##########..########',
      '##########..########',
      '######........######',
      '#####...........####',
      '#####...........####',
      '########.......#####',
      '########.......#####',
      '#########...#..#####',
      '#########...########',
      '#########...########'],
    border:{kind:'studiowall',open:[[9,13],[10,13],[11,13]]},
    exits:[[9,13,'stage7',15,4,'down'],[10,13,'stage7',15,4,'down'],[11,13,'stage7',16,4,'down']],
    objects:[
      // Only what you can reach and touch is listed; the rest of the painted set dressing is scenery.
      ['setwall',10,3,2,1,'Painted backdrop','A painted castle on a painted hill under a painted storm. The lightning is real. Somebody wired it to a switch marked DRAMA.'],
      ['rack',9,4,1,1,'Rack 2','RACK 2. Forty costumes, every one of them steamed. A note on top in TNB’s handwriting: HAND WASH ONLY.',
        {when:[{flag:'ch4-clear',text:'Rack 2, back where it belongs. TNB counted. Forty. He counted again. Forty.'}]}],
      ['camera',16,7,1,1,'Camera crane','A big film camera on a crane. Someone has written NO TOUCHING on the tape. Tom approves.'],
      ['dirchair',16,8,1,1,'Director’s chair','DIRECTOR. This one is old and the canvas is worn. It\'s seen a lot of bad takes.'],
      ['setlamp',8,11,1,1,'Lantern post','A work lantern on a post. Real flame. The fire marshal was told. Nobody remembers what he said.'],
      ['applebox',7,9,1,2,'Prop crates','Crates of fake rubble, real rubble and one lunch that nobody will claim.'],
      {kind:'cstand',at:[[15,9]],name:'Light stand',text:'A big light on a stand. It\'s very warm. Everything in here\'s very warm.'}],
    npcs:[],
    monsters:STAGESET_MONSTER_SPOTS}
);
// ---------- Chapter 6 (The Great Squirrel Conspiracy): Old Oak Park, south of 2nd Ave ----------
// Old Oak Park (ground 'park'): a playground (top left), the community garden (top right), picnic tables (bottom left)
// and a fenced dog park (bottom right), with the Old Oak at the top. Its little door (oakdoor) opens with the secret
// knock (data/scenes.js ch6Knock). Dig mounds (dig: play, garden, picnic) are where Nara digs up the squirrels' caches.
// Inside the Old Oak (ground 'oak'): '=' branches over the hollow ('X', solid), 'W' inner bark walls, 'd' the rope
// ladder (hollow until Nara rides the bucket, data/scenes.js ch6LowerLadder). The crown (ground 'canopy'): the hoard.
function oakPlan(plan) {
  const br=[],pit=[],objs=[];
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='=') br.push([x,y,x,y]); else if(c==='X'||c==='d') pit.push([x,y]);
    else if(c==='W') objs.push(['barkwall',x,y,1,1,'Inside of the trunk','Bark, a hundred years thick. Somebody has scratched tally marks into it. Hundreds of them.']); } });
  return {tiles:[{tile:'branch',rects:br}],pools:[{tile:'pit',cells:pit}],objects:objs};
}
const CH6_ON={chapter:6,notFlag:'ch6-done'},CH6_DONE={from:6,flag:'ch6-done'};
LA_AREAS.push(
  {id:'oakpark',name:'Old Oak Park',w:26,h:22,region:'la',ground:'park',
    tag:'A playground, a community garden, a dog park and one very old oak.',
    eyebrow:'LOS ANGELES / OLD OAK PARK',
    hint:'Playground top left, garden top right, picnic tables bottom left, dog park bottom right. The Old Oak is at the top.',
    spawn:{x:12,y:20},
    wild:true,
    paths:[[12,4,13,20],[1,11,24,12]],
    tiles:[{tile:'sand',rects:[[1,5,9,9]]},{tile:'soil',rects:[[16,5,24,9]]},{tile:'mulch',rects:[[16,15,24,20]]}],
    // Painted plate (art/oakpark.webp, engine/plate.js), 26 x 22 tiles. The mask is the walk map: '#' blocks, '.' walks. The Old Oak and its little door
    // (top, x 12 and 13), the playground (left), the community garden (right, only its front dirt walks), the picnic lawn (bottom left), the dog park
    // (bottom right, in through the bone gate), the planter in the middle (blocked, paths split round it) and the south gate to 2nd Ave (x 11 to 14).
    // The dig mounds are drawn live over the painting (liveKinds) because they change when Nara digs.
    plateMask:[
      '##########################',
      '##########################',
      '##########################',
      '##########################',
      '############..############',
      '######..####...#####..####',
      '#######..####..#......####',
      '#####......#...#...#######',
      '#####.###....#...#########',
      '..........#.###..#########',
      '.##..#......####..########',
      '##########.######.########',
      '###.........###..........#',
      '###########.....##########',
      '#########.##...######.####',
      '.########.##...######.####',
      '.#.###....#....#...##..###',
      '...###.........##.....####',
      '.......##...........######',
      '###########....###########',
      '###########....###########',
      '###########....###########'],
    liveKinds:['mound'],
    border:{kind:'hedge',open:[[12,21],[13,21]]},
    exits:[[12,21,'jpark',14,22,'up'],[13,21,'jpark',15,22,'up'],[12,4,'oak',11,18,'up'],[13,4,'oak',12,18,'up']],
    objects:[
      ['bigoak',14,4,2,1,'The Old Oak','A coast live oak, three hundred years old. Older than the city. Older than the streetcar. Something up there\'s chittering.'],
      ['oakdoor',12,4,2,1,'Little door','A little round door in the trunk, with an acorn for a knocker. Locked from inside. Somebody behind it\'s chittering.',{knock:true}],
      // Playground
      ['slide',0,7,2,2,'Slide','A metal slide. In August it\'s a stove. Today it\'s just a slide with acorn shells at the bottom.'],
      ['climber',2,5,3,3,'Play fort','A wooden play fort with a red roof. Somebody has hung a tiny flag from the top. It has an acorn on it.'],
      ['swings',2,8,3,1,'Swings','Two swings. One of them is still swinging. Nobody is on it.'],
      ['climber',6,8,3,1,'Climbing dome','A climbing dome. Someone has hung a tiny flag on top. It has an acorn on it.'],
      ['mound',7,9,1,1,'Fresh dirt','A little mound of fresh sand. Something was buried here very recently.',{dig:'play'}],
      ['trashcan',10,9,1,1,'Trash can','A trash can with a lid that clips shut. It\'s been opened anyway. From the inside, somehow.'],
      // Community garden
      ['watchboard',16,5,3,1,'Neighborhood Watch board','A corkboard on legs. Photos of squirrels. Red string between them. A sticky note: THEY ARE ORGANIZED.'],
      ['gardenbed',18,8,4,2,'Tomato bed','JEFFERSON PARK COMMUNITY GARDEN, plot 4. Every tomato has one bite out of it. Exactly one.'],
      ['gardenbed',21,7,2,1,'Herb bed','Beans on a teepee of sticks, basil underneath and a sign: PLEASE DO NOT EAT THE MINT. Something has eaten the sign.'],
      ['mound',21,5,1,1,'Fresh dirt','A little mound of fresh soil by the garden gate. Something was buried here very recently.',{dig:'garden'}],
      // Picnic lawn
      ['picnic',2,14,3,2,'Picnic table','A picnic table. A whole picnic is laid out on it. Every sandwich has one bite out of it.'],
      ['picnic',6,14,3,2,'Picnic table','A birthday picnic. The cake is fine. The cake is the only thing that\'s fine.'],
      ['picnic',3,16,3,2,'Picnic table','A picnic table carved with forty years of initials. One says T + T. It\'s new. TNB looks away.'],
      ['grill',1,16,1,1,'Park grill','A charcoal grill. Cold. Someone has stacked acorns in it like a little pyramid.'],
      ['mound',8,17,1,1,'Fresh dirt','A little mound of fresh dirt on the lawn. Something was buried here very recently.',{dig:'picnic'}],
      ['drinkfountain',10,16,1,1,'Drinking fountain','A drinking fountain with a little dog bowl at the bottom. Somebody has dropped an acorn in the bowl. A warning.'],
      // The dog park
      {kind:'chainlink',at:[[16,13],[17,13],[18,13],[19,13],[20,13],[21,13],[22,13],[23,13],[15,14],[15,15]],name:'Dog park fence',text:'DOG PARK. Big dogs on the left, small dogs on the right. Nobody follows it.'},
      ['dogbench',16,14,3,2,'Dog park bench','A bench inside the dog park. A good spot to throw something for Nara.',{dogpark:true}],
      ['dogbowl',16,15,1,1,'Water bowl','A big dog water bowl. Nara drinks from it like it owes her money.'],
      ['hoop',19,15,2,2,'Agility hoop','A hoop for dog agility. Nara has never jumped through it. She walks around it, every time, proudly.'],
      // Around the middle
      ['trashcan',15,10,1,1,'Trash can','A trash can with a lid that clips shut. It\'s been opened anyway. From the inside, somehow.'],
      ['sign',13,11,2,2,'Park sign','OLD OAK PARK. Est. 1912. Please don\'t feed the squirrels. Underneath, in tiny writing: OR ELSE.']],
    npcs:[
      {name:'Bernadette',x:13,y:14,look:'bernadette',roam:0,lines:['Bernadette. Neighborhood Watch Captain, nineteen years. Nothing gets past me.','Except squirrels. I\'m working on it.'],
        when:[{...CH6_DONE,lines:['Case closed. I\'ve filed my report. With myself. I approved it.','I said they were organized. Nobody believed me. Write that down.','You\'re a good neighbor, Tom. So is the dog. Mostly the dog.']},
              {...CH6_ON,flag:'ch6-park',lines:['The lookouts first. Playground, garden, picnic tables. Then that dog of yours digs.','Then the tree. There\'s a knock. I have only ever heard parts of it.']}]}],
    monsters:OAKPARK_MONSTER_SPOTS},
  // Inside the Old Oak, painted plate (art/oak.webp, engine/plate.js), 24 x 20 tiles. The war room (top left, one lane in front of the war table),
  // the pantry (top right) and the long walkway down to the stairs on the right, the stacked rope bridges across the middle, the lower floor with
  // the tea table and the stove, and the entry stairs at the bottom. The bridge from the war room (row 6) crosses to the pantry walkway. The way up
  // is a rope ladder from bridge 3 to the top bridge (column 12, rows 2, 4 and 5 are a gap until Nara rides the bucket, data/scenes.js ch6LowerLadder).
  // The mask is the walk map: '#' blocks, '.' walks. The ladder is drawn live over the painting (data/scenes.js STORY_MAPFX).
  {id:'oak',name:'Inside the Old Oak',w:24,h:20,region:'la',ground:'oak',
    tag:'A hollow trunk, a war room, a pantry and a long way up.',
    eyebrow:'LOS ANGELES / OLD OAK PARK / THE OLD OAK',
    hint:'The stairs up the right lead to the pantry, the bridges cross to the war room. The way up is the middle.',
    spawn:{x:11,y:18},
    wild:true,
    ladder:[[12,2],[12,4],[12,5]],
    plateMask:[
        '###########..###########',
        '##########....##########',
        '########################',
        '##########....##########',
        '########################',
        '#..........####..#.#####',
        '##########...........###',
        '##################....##',
        '###################....#',
        '#####################..#',
        '#####################..#',
        '######################..',
        '###..################...',
        '###........#####......##',
        '#######...#####......###',
        '#########........#######',
        '###########......#######',
        '###########...##########',
        '###########..###########',
        '###########..###########'],
    border:{kind:'barkwall',open:[[11,0],[12,0],[11,19],[12,19]]},
    exits:[[11,19,'oakpark',12,5,'down'],[12,19,'oakpark',13,5,'down'],[11,0,'crown',9,14,'up','branch'],[12,0,'crown',10,14,'up','branch']],
    objects:[
      // Only what you can reach and touch is listed; the rest of the painted set dressing is scenery.
      ['nutshelf',1,3,2,2,'Filing cabinets','Acorns, filed by size. A drawer labeled PEANUTS: CLASSIFIED.'],
      ['warboard',3,3,3,2,'The corkboard','A corkboard covered in photos, maps and red string. In the middle, circled three times: a jar.',{warboard:true}],
      ['table',6,3,3,2,'War room desk','A desk buried in maps, a tiny lantern and a folding chair with a sign: RESERVED FOR THE CHAIRMAN. The corner of the sign has been chewed.'],
      ['firefly',2,10,2,2,'Firefly jar','A jar of fireflies. They\'re glowing at a very relaxing level.'],
      ['table',6,11,3,2,'Stump table','A stump table set for a meeting: a teapot, three acorn cups and a seating chart. The seating chart is just the word JAR.'],
      ['bucket',17,4,1,2,'Bucket on a rope','A bucket on a rope. The rope runs up over a branch and across to the middle of the trunk.',{bucket:true}],
      ['nutshelf',19,4,2,2,'Pantry shelf','Peanut butter crackers, trail mix, one whole croissant. Every single thing has one bite out of it.'],
      ['nutshelf',21,5,2,2,'Pantry shelf','Shelves of acorns. A label: WINTER. Another label: ALSO WINTER.'],
      ['sign',13,17,1,1,'Doormat','A doormat with a squirrel woven into it. Under it, in marker: HQ. AUTHORIZED SQUIRRELS ONLY. Under that: THIS MEANS DOGS.']],
    monsters:OAK_MONSTER_SPOTS},
  {id:'crown',name:'The Crown of the Oak',w:20,h:16,region:'la',ground:'canopy',
    tag:'The very top of the Old Oak. A hoard, a view, and a chairman.',
    eyebrow:'LOS ANGELES / THE OLD OAK / THE CROWN',
    hint:'Up top. Something is sitting on a very big pile.',
    spawn:{x:9,y:14},
    // Painted plate (art/crown.webp, engine/plate.js), 20 x 16 tiles. The mask is the walk map: '#' blocks, '.' walks. The hoard (rows 2 to 4), the
    // acorn crates, trunk and leaves are painted and blocked. Walkable: the plank floor (rows 5 to 10), the two lookout decks (rows 4 to 5, reached by
    // the stairs at x 3 to 5 and x 15 to 16), and the rope bridge down (x 9 and 10, rows 10 to 15).
    plateMask:[
      '####################',
      '####################',
      '####################',
      '####################',
      '##..############..##',
      '###...##.....##..###',
      '#####...........####',
      '######.........#####',
      '#######.........####',
      '#######......#..####',
      '#########..###..####',
      '#########..#########',
      '#########..#########',
      '#########..#########',
      '#########..#########',
      '#########..#########'],
    border:{kind:'leafwall',open:[[9,15],[10,15]]},
    exits:[[9,15,'oak',11,1,'down','branch'],[10,15,'oak',12,1,'down','branch']],
    objects:[
      // Only what you can reach and touch is listed; the rest of the painted hoard is scenery. The chairman sits on the chest at (9,4).
      ['hoard',11,4,2,1,'The hoard','Bottle caps, tennis balls, a hubcap, three sets of earbuds, a toy truck wheel, and about a million acorns.',
        {when:[{flag:'ch6-clear',text:'The hoard. Somebody has put a little sign on it: FREE. PLEASE TAKE. SHARING IS NICE.'}]}],
      ['acornpile',6,5,2,1,'Acorn pile','A neat pyramid of acorns. Counted. Labeled. JANUARY.'],
      ['acornpile',13,5,2,1,'Acorn pile','Another pyramid. FEBRUARY. There are twelve of them up here.'],
      ['acornpile',5,7,1,1,'Acorn pile','MARCH. This one is just peanuts. Somebody ran out of acorns.'],
      ['lookout',2,3,1,1,'Lookout telescope','A brass telescope on a tripod. From here you can see the whole park. And Tom’s house.'],
      ['lookout',17,3,1,1,'Lookout telescope','Another telescope. A tiny paper sign taped to the tripod: BIRD FEEDER, 2ND AVE. THEY WILL CHASE YOU.']],
    npcs:[],
    monsters:CROWN_MONSTER_SPOTS}
);
// 2nd Ave in chapter 6: things are missing, and then they come back.
{ const J=LA_AREAS.find(a=>a.id==='jpark').npcs,N=n=>J.find(x=>x.name===n),add=(n,...v)=>{ const p=N(n); if(p) p.when=[...v,...(p.when||[])]; };
  add('Mr. Washington',{...CH6_DONE,lines:['My reading glasses! Found in a hole in the park. I won\'t ask.','Back in 1979 the squirrels were polite. They waited until you finished your sandwich.']},
    {...CH6_ON,lines:['Somebody took my reading glasses off the porch rail. I have read the same headline for three days.','I think it says WEATHER. It might say WHETHER.']});
  add('Marisol',{...CH6_DONE,lines:['Eleven tennis balls! Back! My dog is beside himself. Wherever he is.']},
    {...CH6_ON,lines:['Every tennis ball on the block. Gone. My dog has nothing to ignore now.','There he is. No. That\'s a squirrel. It\'s looking at me.']});
  add('Larry',{...CH6_ON,lines:['I\'m blowing leaves. The squirrels keep blowing them back.','It\'s a whole system. Their system is better.']});
  add('Olivia',{...CH6_DONE,lines:['Nara slept! Twelve hours! She\'s snoring like Michael.','Thank you, Tom. Tell TNB thank you. Tell the squirrels nothing.']},
    {...CH6_ON,flag:'ch6-nara',lines:['Is she okay? Is she eating? She\'s not eating, is she.','Michael, the squirrel is back on the fence. Don\'t make eye contact.']});
  add('Michael',{...CH6_DONE,lines:['Lachlan got his truck back. He hasn\'t put it down. He\'s eating cereal with one hand.']},
    {...CH6_ON,flag:'ch6-nara',lines:['Zero car keys and one very sticky toddler. Wait. Keys. Gutter. Right.']}); }

// ---------- Chapter 8 (Feast on Jefferson Park): the old Car Barn, east end of Jefferson Boulevard ----------
// Division Nine Car Barn (ground 'barn'): the Paint Shop (top left), the Machine Shop (top right), the Lunchroom (bottom
// left), a long hall across the middle and the turntable (bottom right). Plan: 'W' brick wall (solid; shows its face
// when there is floor below it), '.' concrete, 'r' streetcar track, 'p' Paint Shop floor, 'm' Machine Shop steel, 'l'
// Lunchroom checkerboard, 'T' the turntable pit (solid), 'v' the bridge's north-south ends, 'h' its east-west ends,
// 'c' its middle. The bridge starts north-south (v walkable, h pit); once TNB fixes the motor the lever swings it round
// (data/scenes.js ch8SetBridge). Track 4 (east) runs to the Boiler Room (ground 'boiler': 'k' brick floor, 'H' hearth).
// Exits must sit on floor characters (pools are laid after exits).
const BARN_TILES={'.':'barnfloor',r:'rails',p:'paintfloor',m:'steelfloor',l:'lunchfloor',v:'ttbridge',c:'ttbridge',k:'boilerfloor',H:'hearth'};
function barnPlan(plan) {
  const walls=[],pit=[],floors={};
  plan.forEach((row,y)=>{ for(let x=0;x<row.length;x++) { const c=row[x];
    if(c==='W') walls.push([x,y]); else if(c==='T'||c==='h') pit.push([x,y]);
    else if(BARN_TILES[c]) (floors[BARN_TILES[c]]=floors[BARN_TILES[c]]||[]).push([x,y,x,y]); } });
  return {tiles:Object.entries(floors).map(([tile,rects])=>({tile,rects})),pools:[{tile:'brickwall',cells:walls},{tile:'ttpit',cells:pit}],objects:[]};
}
// The turntable. The painted barn has one fixed diagonal catwalk across the pit: h lists its cells (blocked until the lever turns the turntable
// east, data/scenes.js ch8SetBridge); v is unused now. cx, cy, r (the pit's center and radius in tiles) are only read by the old tile look.
const BARN_TT={v:[],h:[[14,12],[15,12],[15,13],[16,13],[17,13],[17,14],[18,14],[19,14],[19,15],[20,15],[21,15],[21,16],[22,16]],cx:18,cy:15,r:6};
const CH8_ON={chapter:8,notFlag:'ch8-done'},CH8_DONE={from:8,flag:'ch8-done'};
LA_AREAS.push(
  // Division Nine Car Barn, painted plate (art/carbarn.webp, engine/plate.js), 30 x 21 tiles. Paint Shop top left, Machine Shop top right,
  // the dispatch office in the middle, the Lunchroom bottom left (reached by the steel stairs at the foot of the turntable control platform),
  // the turntable pit bottom right. The mask is the walk map: '#' blocks, '.' walks. The painted bridge is one fixed diagonal catwalk across
  // the pit: its cells (BARN_TT.h) are blocked until the lever turns the turntable east (data/scenes.js ch8SetBridge).
  {id:'carbarn',name:'Division Nine Car Barn',w:30,h:21,region:'la',ground:'barn',
    tag:'The old streetcar barn. Paint Shop, Machine Shop, Lunchroom, and one very cold turntable.',
    eyebrow:'LOS ANGELES / JEFFERSON BLVD / THE CAR BARN',
    hint:'Paint Shop top left, Machine Shop top right, Lunchroom bottom left. The turntable is bottom right.',
    spawn:{x:1,y:10},
    wild:true,
    exits:[[0,9,'jpark',28,9,'left','barnfloor'],[0,10,'jpark',28,10,'left','barnfloor'],[29,14,'boiler',1,7,'right','barnfloor'],[29,15,'boiler',1,8,'right','barnfloor']],
    monsters:BARN_MONSTER_SPOTS,
    plateMask:[
      '##############################',
      '##############################',
      '##############################',
      '##############################',
      '##############################',
      '######################.#######',
      '###..#....############.#######',
      '###...###..#########...#######',
      '....#.....###########.....####',
      '....###################...####',
      '...........############...####',
      '#########...............######',
      '##############..#######.######',
      '###############...#####......#',
      '#################...####.....#',
      '###################...##.....#',
      '#####################...#..###',
      '#######.###.##########....####',
      '#######.###.##...........#####',
      '#######........###############',
      '##############################',
    ],
    npcs:[],
    objects:[
      // The Paint Shop
      ['streetcar',5,2,7,4,'Car 9','Streetcar number 9. Half of it\'s painted the old yellow. The other half is primer. The brush is frozen stiff in the can.',
        {when:[{...CH8_DONE,text:'Streetcar number 9. Somebody has finished the yellow. It\'s gorgeous. TNB took eleven photos.'}]}],
      ['paintrack',1,3,4,3,'Drying rack','A rack for wet canvas drop cloths. One of them is gone. The hook still drips. Under it, every paint can has a skin of ice on top. In Los Angeles.'],
      ['paintcans',10,6,2,1,'Paint cans','STREETCAR YELLOW. STREETCAR GREEN. One can just says DO NOT USE. Somebody used it.'],
      ['sawhorse',6,7,3,1,'Sawhorses','Two sawhorses and a streetcar door, waiting for a second coat since 1963.'],
      // The Machine Shop
      ['workbench',18,3,5,2,'Workbench','Vise, wrenches, a coffee mug with ice in it. Somebody left mid-sip. Every tool on the board has an outline painted behind it. One outline is a little stove. The stove isn\'t there.'],
      ['bogie',19,5,3,2,'Wheel truck','A set of streetcar wheels up on jacks. TNB says it\'s called a truck. TNB is very excited.'],
      ['lathe',23,6,3,2,'Lathe','An old lathe. A tag on it: DO NOT TOUCH. TNB touches it. Just a little.'],
      // The hall
      ['dispatch',11,7,4,4,'Dispatch board','DIVISION NINE. TRACK 1: WASH RACK. TRACK 2: SHOPS. TRACK 3: MAIN LINE. TRACK 4: BOILER ROOM.'],
      ['barnbench',15,7,2,4,'Crew bench','A bench worn smooth by fifty years of motormen waiting for their run.'],
      ['timeclock',17,8,2,3,'Time clock','PUNCH IN. The last card in the rack says NIGHT CREW, 1963. Somebody punched out and never came back.'],
      // The Lunchroom
      ['lunchtable',6,15,4,2,'Lunch table','A long lunch table. Somebody carved I MISS THE BISCUITS into it. More than one somebody.'],
      ['lunchtable',3,17,4,2,'Lunch table','A long lunch table. Every seat has a little brass number. Nobody has sat down in sixty years.'],
      ['lunchtable',8,17,3,2,'Lunch table','The end of the long table. A clean spot. A good spot for a lunch break.',{plate:true}],
      // The turntable, its control platform and Track 4
      ['ttmotor',15,16,4,2,'Turntable motor','The little steam motor that turns the turntable. Three empty burners, cold as a mailbox.',{ttmotor:true}],
      ['ttlever',24,15,1,2,'Turntable lever','A big iron lever: TURNTABLE. It won\'t budge. No steam.',{ttlever:true}],
      ['coalcart',24,11,2,2,'Coal cart','A little cart of coal. Every lump is cold. Every lump is pointing at the Boiler Room door.'],
      ['tracksign',26,11,3,3,'Track sign','TRACK 4. BOILER ROOM. CREW ONLY. Under it, in chalk: SHE IS GRUMPY BEFORE SHE WARMS UP.'],
      ['lunchpail',28,13,1,1,'Lunch pail','A dented lunch pail by the Track 4 sign: BOOKER W., 7 LINE. Somebody left it here for the next shift.',{pail:true}]]},
  // The Boiler Room, painted plate (art/boilerroom.webp, engine/plate.js), 20 x 14 tiles. The boiler and its control platform fill the north
  // wall, the coal bin the north east, the baker's bench and bread oven the south east; the west arch (exits (0,7) and (0,8)) opens onto a
  // lit walkway that runs down past the coal cart to the open floor. The mask is the walk map: '#' blocks, '.' walks.
  {id:'boiler',name:'The Boiler Room',w:20,h:14,region:'la',ground:'boiler',
    tag:'Brick, coal and one cast-iron stove that remembers every biscuit.',
    eyebrow:'LOS ANGELES / THE CAR BARN / THE BOILER ROOM',
    hint:'Past the boiler. Something big and iron is very, very warm.',
    spawn:{x:1,y:7},
    exits:[[0,7,'carbarn',28,14,'left','boilerfloor'],[0,8,'carbarn',28,15,'left','boilerfloor']],
    monsters:BOILER_MONSTER_SPOTS,
    plateMask:[
      '####################',
      '####################',
      '####################',
      '############.#######',
      '##########.#.#######',
      '#####..............#',
      '###..............###',
      '..#..............###',
      '...#...........#####',
      '#..###........######',
      '##...##........#####',
      '####...........#####',
      '############..######',
      '####################',
    ],
    npcs:[],
    objects:[
      ['boilertank',4,3,5,2,'Old boiler','A riveted boiler, as big as a car. It ran the whole barn once. It\'s cold and very, very quiet.'],
      ['coalpile',13,3,5,2,'Coal bin','A bin and a cart of coal, and a bucket hanging on a chain. Somebody was going to need a lot of it.'],
      ['coalpile',3,9,3,1,'Coal cart','A cart of coal and a little shovel with a heart scratched on the handle.'],
      ['breadrack',15,8,2,2,'Bread rack','A tall rack for cooling bread. Empty. Fifty years of biscuits came off this rack.',
        {when:[{flag:'ch8-clear',text:'A tall rack for cooling bread. Forty sourdough loaves on it, crackling as they cool. Bready Mercury is very proud.'}]}],
      ['peelrack',17,7,1,2,'Peel rack','Hooks for long bread peels. Every hook is empty but one.',
        {when:[{flag:'ch8-clear',text:'Hooks for long bread peels. All empty now. The last one is in Tom’s bag.'}]}],
      ['workbench',15,10,4,3,'Baker\'s bench','A long bench with a mixing bowl, a tin mug and a flour-white towel. A tub of old dough sits by the oven. It has not risen since 1963.'],
      ['ashbin',11,12,1,1,'Ash pan','The ash pan. Cold ash, sixty years of it.',
        {when:[{flag:'ch8-clear',text:'The ash pan. Warm now. This is where Tom found the gold coin. Somebody put it there on purpose.'}]}],
      ['coalpile',8,12,3,2,'Stacked crates','Crates stenciled DIVISION NINE. One is marked KINDLING, FRAGILE, and PLEASE. Nobody has opened it.']]}
);
// 2nd Ave in chapter 8: every oven on the block went cold at noon, on the day of the potluck.
{ const J=LA_AREAS.find(a=>a.id==='jpark').npcs,N=n=>J.find(x=>x.name===n),add=(n,...v)=>{ const p=N(n); if(p) p.when=[...v,...(p.when||[])]; };
  add('Mr. Washington',{...CH8_DONE,lines:['That coat looks right on you. My daddy would say so. Then he\'d say stand up straight.','Forty loaves. I ate four. Don\'t tell Bernadette.']},
    {...CH8_ON,lines:['Forty years I\'ve made gumbo for this potluck. Today the stove won\'t light. The flame just leans. Toward the boulevard.','My daddy drove the 7 line out of the old Car Barn. He said the stove down there could warm a whole street.']});
  add('Marisol',{...CH8_DONE,lines:['My dog ate a whole loaf. I found him. He was under the table. He\'s always under the table.']},
    {...CH8_ON,lines:['My tamales are cold. My dog is cold. My dog is somewhere. He\'s probably cold.']});
  add('Larry',{...CH8_ON,lines:['I\'m blowing leaves. They\'re frosty. In LA. I have questions.']});
  add('Olivia',{...CH8_DONE,lines:['Nara ate! A whole plate! Off your plate, but still! I\'m counting it!','Michael, Isla has a roll in each hand. That\'s fine. That\'s a balanced meal.']},
    {...CH8_ON,flag:'ch8-block',lines:['Did she eat? She won\'t eat cold food. She won\'t eat warm food either. She eats off YOUR plate, Tom.','My lasagna is a brick. A cold lasagna brick. Michael is guarding it with his life.']});
  add('Michael',{...CH8_DONE,lines:['Best potluck ever. Lachlan fell asleep in the bread basket.']},
    {...CH8_ON,flag:'ch8-block',lines:['Cold lasagna, one diaper bag, and Isla eating the tablecloth. We\'re thriving.']}); }

// ---------- Rooms ----------
const LA_ROOMS=[
  {id:'coffee',w:11,h:9,
    style:{floor:'#d9c4a8',alt:'#e6d3b8',wall:'#b98a5a',trim:'#f0d9b5',pattern:'wood',rug:'#c98a4a'},
    rug:[4,4,3,2],
    // Painted plate (art/coffee.webp, engine/plate.js), 11 x 9 tiles. Door and mosaic mat bottom centre (5,8). Counter, pastry case and monstera along the back,
    // laptop table left, window table and book table right, low front walls with plants either side of the entry. '#' blocks, '.' walks.
    plateMask:[
      '###########',
      '###########',
      '###########',
      '####...####',
      '###.....###',
      '####....###',
      '####...####',
      '####...####',
      '####...####'],
    npcs:[
      {name:'Juniper',x:5,y:3,look:'juniper',lines:[
        'Welcome to Golden Hour. Every hour is golden hour if you believe.',
        'Our oat milk is oat-adjacent.',
        'Your name is Tom? I wrote TAM. It\'s basically the same.']}],
    objects:[
      ['counter',4,2,3,1,'Espresso bar','A machine with eleven knobs. Juniper uses two of them.',{variant:'tea'}],
      ['counter',7,2,2,2,'Pastry case','Croissants, a lemon bar the size of a paperback, and a card that says PASTRY 4.0. Nobody has seen the pastry for 4.0.',{variant:'tea'}],
      ['pot',3,2,1,2,'Monstera','It has more Instagram followers than Skye.'],
      ['table',0,3,3,3,'Laptop table','Someone has been writing a screenplay here since 2016. The sign on the wall says SAME SCRIPT, DIFFERENT YEAR.'],
      ['table',8,3,2,2,'Window table','A man is having a very loud meeting about a podcast. Two microphones, one cup of tea.'],
      ['table',8,5,2,1,'Book table','A sketchbook and a stack of magazines. The shelf sign says ART, TRAVEL, MUSIC, FILM, IDEAS. Mostly ideas.']]},
  // Ramen Ramen, painted plate (art/ramen.webp, engine/plate.js), 12 x 9 tiles at 64 art px per tile. Mask: '#' blocks, '.' walks.
  // Kitchen, broth pot and the five-stool counter along the back; sake shelf back right; bamboo pot and raised lantern step on the left;
  // the corner booth table on the right. The two tiles under the noren curtain (x5 and x6) are the way out.
  {id:'ramen',w:12,h:9,
    style:{floor:'#cbb89c',alt:'#d8c6aa',wall:'#7a3a33',trim:'#e8c8a0',pattern:'wood',rug:'#b9483f'},
    rug:[4,5,4,2],
    plateMask:[
      '############',
      '############',
      '############',
      '##.#########',
      '##.......###',
      '####.....###',
      '#####..#####',
      '#####..#####',
      '#####..#####'],
    npcs:[
      {name:'Kenji',x:5,y:4,look:'kenji',lines:[
        'Irasshaimase! Welcome!',
        'Tom-san, your Japanese is very good.',
        'It\'s not. But you\'re trying very hard, and I respect that.']}],
    objects:[
      ['counter',3,2,5,2,'Ramen counter','Five stools. A pot of broth that\'s been simmering since Tuesday.',{variant:'tea'}],
      ['table',9,4,3,2,'Corner table','A tiny sign: PLEASE SLURP. IT IS POLITE.'],
      ['shelf',8,2,3,2,'Sake shelf','The bottles are labeled in kanji. Tom can read two. He\'s very proud.'],
      ['pot',1,3,1,2,'Lucky bamboo','The pot has a soft-boiled egg painted on it. One stalk for broth, one for noodles, one for the egg, and the rest for luck.'],
      ['table',0,5,4,1,'Lantern step','A low wooden step with a lantern on it. Nobody sits here. Kenji says the lantern has seniority.']]},
  {id:'juicebar',w:11,h:9,
    style:{floor:'#dfe8d0',alt:'#eaf0de',wall:'#6fb35a',trim:'#f4fbe8',pattern:'tile',rug:'#9ccf7a'},
    rug:[3,5,5,2],
    // Painted plate (art/juicebar.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Juice counter and blender wall across the back (Sage works behind it; A on the counter in front of him talks to him),
    // wheatgrass beds and the herb table down the sunny left side, the big fern and the supplement shelf on the right.
    // The doormat (x 4 to 6, rows 7 and 8) between the two gate posts is the way out.
    plateMask:[
      '###########',
      '###########',
      '###########',
      '########.##',
      '###......##',
      '###......##',
      '##.......##',
      '####...####',
      '####...####'],
    doors:[[4,8],[6,8]],
    npcs:[
      {name:'Sage',x:5,y:2,look:'sage',roam:0,lines:[
        'Welcome. Breathe in. Now order.',
        'We opened in March. The pupuseria next door has been here since 1994. We\'re learning a lot.',
        "Today's special is celery. Doña Carmen says that's not a meal. She's right."]}],
    objects:[
      ['counter',3,3,5,1,'Juice bar','A blender the size of a car engine. It sounds like one too.',{variant:'tea',across:true}],
      ['planter',1,2,2,4,'Wheatgrass','Grown on site. Harvested on site. Judged on site.'],
      ['pot',1,6,1,1,'Herb table','Basil, mint and a tag that says BE GENTLE. The basil looks like it took that personally.'],
      ['pot',8,2,2,1,'Fern','It\'s thriving. It\'s the only thing here that\'s not stressed.'],
      ['shelf',9,3,2,4,'Supplement shelf','Powders. So many powders. One just says ENERGY in capital letters.']]},
  {id:'nickels',w:11,h:9,
    style:{floor:'#d9c49c',alt:'#e6d3ad',wall:'#3a9ca0',trim:'#f1d9b5',pattern:'check',rug:'#2f6f73'},
    rug:[3,6,5,2],
    // Painted plate (art/nickels.webp, engine/plate.js). The mask is the walk map: '#' blocks, '.' walks.
    // Sweater wall, window and helmet shelf down the left, the long counter across the back (the painted shopkeeper stands behind it),
    // crates and the ball display front left, snack shelf back right, the cactus and a fern front right.
    // The floor opens into a short lane at x 5 (rows 6 to 8): the doorway and the mat below it.
    plateMask:[
      '###########',
      '###########',
      '###########',
      '###########',
      '########.##',
      '####.....##',
      '##.......##',
      '#####.#####',
      '#####.#####'],
    npcs:[
      // The keeper is painted into the plate, so the sprite stays hidden; A on the counter still opens the shop.
      {name:'Nickel',x:5,y:2,look:'nickel',shopkeeper:true,hidden:true,roam:0,shopLines:NICKEL,shopName:"Nickel's",lines:[]}],
    objects:[
      ['counter',4,3,4,2,'Shop counter','A brass bell, a tin of coins and a sign: BUY. SELL. NO, WE DO NOT VALIDATE.',{variant:'letters',shop:true}],
      ['shelf',8,1,2,3,'Snack shelf','Juice boxes, picnic baskets, and a very expensive bottle of water.'],
      ['toybox',1,4,2,2,'Battle bin','Water balloons, kazoos and party poppers. A label says: FOR MONSTERS ONLY. AND COYOTES.'],
      ['toybox',3,4,1,2,'Ball display','Star balls, party bottles and a little palm tree sign: THIS WAY TO FUN. FUN IS NOT REFUNDABLE.'],
      ['pot',1,6,1,1,'Shop fern','It has a price tag too. The tag just says: IT\'S FINE.'],
      ['pot',9,4,1,3,'Shop cactus','It has a price tag. The price is "no." Penny taught her well.']]},
  {id:'wardrobe',w:12,h:10,
    style:{floor:'#cfc3d6',alt:'#dcd2e2',wall:'#6a4f7a',trim:'#e3d6e8',pattern:'tile',rug:'#8a6aa0'},
    rug:[3,5,6,2],
    npcs:[
      {name:'Marguerite',x:6,y:5,look:'marguerite',lines:[
        'Backlot Wardrobe. If it was worn on screen, it lived here first.',
        "You're Tom? TNB's Tom! He found a shoe for us once. A lead actor's shoe. Four minutes before the take.",
        'We still talk about the shoe. Tell him there\'s always a rack here with his name on it.']}],
    objects:[
      ['rack',1,2,3,1,'Rack A: Westerns','Forty cowboy hats. One cowboy. The cowboy is very tired.'],
      ['rack',8,2,3,1,'Rack B: Space','Silver jumpsuits in every size. Even yours.'],
      ['desk',2,7,2,1,'Continuity desk','Polaroids of every actor in every scene. Scene 12, the scarf was on the LEFT.'],
      ['photo',6,1,1,1,'Call sheet','Tomorrow: 5 AM call. Forty extras. One horse. The horse has a stand-in.'],
      ['pot',10,7,1,1,'Prop plant','It\'s fake. It\'s been in four movies. It has an agent.']]},
  // The Starlite, painted plate (art/starlite.webp, engine/plate.js), 13 x 11 tiles at 64 art px per tile. Mask: '#' blocks, '.' walks.
  // Stage and screen across the top, two blocks of seats with the center aisle (x6) between them, the concession bar down the right,
  // and the front strip (row 7) across the seat rows. The ticket desk and fern are bottom left; the velvet-rope nook (8,8) fronts the right fern.
  // The two tiles on the red-carpet stairs (x5 and x6, rows 8 to 10) are the way out.
  {id:'cinema',w:13,h:11,
    style:{floor:'#7a3a3a',alt:'#843f3f',wall:'#2c2c33',trim:'#a8453a',pattern:'night',rug:'#a8453a'},
    rug:[4,8,5,2],
    plateMask:[
      '#############',
      '#############',
      '#############',
      '#############',
      '######.######',
      '######.######',
      '######.######',
      '#.........###',
      '#####..#.####',
      '#####..######',
      '#####..######'],
    npcs:[
      {name:'Dolores',x:3,y:7,look:'dolores',lines:[
        'Welcome to the Starlite. Built in 1931. The popcorn is newer. A little.',
        'I have run the projector here for forty years. I\'ve seen every movie twice.',
        'Tonight it\'s a horror double feature. Your boyfriend would love it. You\'d watch it through your fingers.']}],
    objects:[
      ['screen',4,2,5,2,'The big screen','Velvet curtains, gold trim, and one stubborn stain from 1987.'],
      ['couch',1,5,5,2,'Row F','The good seats. Somebody already put a coat on three of them.'],
      ['couch',7,4,4,3,'Row G','A sticky floor under it. A historic stickiness. Someone left a plaid blanket behind.'],
      ['counter',10,5,3,4,'Concessions','Popcorn and hot dogs a quarter, candy and soda less. The prices are from 1931. The hot dog is not.',{variant:'bread'}],
      ['desk',0,8,2,2,'Ticket desk','A stack of old programs. The top one says NIGHT OF THE GIANT LOBSTER, ONE SHOW ONLY. The lobster is the reason.'],
      ['pot',2,8,2,2,'Lobby fern','It has been in the lobby since the talkies. It has seen every movie too, but from the side.'],
      ['pot',8,9,2,2,'Velvet rope','A rope, a brass post and a fern. Nobody is allowed past it. Nobody can say what is past it.']]},
  {id:'boards',w:11,h:9,
    style:{floor:'#b6c3c8',alt:'#c6d1d4',wall:'#2f4e6a',trim:'#d6e6ec',pattern:'wood',rug:'#e2793a'},
    rug:[3,5,5,2],
    // Painted plate (art/boards.webp, engine/plate.js), area 44. The mask is the walk map: '#' blocks, '.' walks.
    // Deck wall and the cat painting across the top, the grip tape counter (row 3), wheel wall and bench down the left,
    // the board and wheel rack and the helmeted cactus on the right. The doormat (x 4 to 6, rows 7 and 8) is the way out.
    plateMask:[
      '###########',
      '###########',
      '###########',
      '########.##',
      '##.......##',
      '##.....####',
      '##.....####',
      '####...####',
      '####...####'],
    doors:[[4,8],[6,8]],
    npcs:[
      {name:'Dash',x:3,y:6,look:'dash',roam:0,lines:[
        'Board Room. We sell boards. We also sit on them.',
        'TNB? Longboard guy? He bombed Fargo Street once. No brakes. Legend.',
        'If you see him, tell him the wheels he ordered came in. The green ones.']}],
    objects:[
      ['counter',2,3,6,1,'Grip tape counter','Stickers, wax, wheels, and a jar labeled LOST TEETH. Don\'t ask. Behind it, the cat deck on the wall is the most expensive one.',{variant:'letters'}],
      ['shelf',0,2,2,3,'Wheel wall','Wheels on pegs, sorted by color, then hardness, then mood. A black shirt hangs on the end.'],
      ['table',0,5,2,2,'Bench','A bench by the rug for people waiting while Dash looks for the right bolt. Nobody has seen the right bolt.'],
      ['shelf',7,5,4,2,'Longboard rack','Decks on edge, wheels in bins below, sorted by color. One bin is all green. Someone wrote TNB on the label.'],
      ['pot',9,2,2,2,'Cactus','It wears a tiny helmet. Safety first.']]},
  {id:'lacab',w:11,h:9,
    style:{floor:'#c9c3b4',alt:'#d7d1c2',wall:'#a99a6e',trim:'#efe0b0',pattern:'check',rug:'#d9a43a'},
    rug:[3,5,5,2],
    npcs:[
      {name:'Sol',x:5,y:5,look:'sol',driver:true,lines:[
        "Angel City Cab Co. I'm Sol. Sal's cousin. Also one cab.",
        'Cab eight. Sal has cab seven. We don\'t talk about what happened to the other six.',
        'I go to the airport, the airport, and sometimes the airport.']}],
    objects:[
      ['counter',3,3,5,1,'Dispatch desk','A radio crackles: "Cab eight, there\'s traffic everywhere." Sol nods. There\'s always traffic everywhere.',{variant:'letters'}],
      ['shelf',1,1,2,1,'Key board','Eight hooks. One key. Sol and Sal have a friendly rivalry about hooks.'],
      ['photo',8,1,1,1,'Driver of the month','It\'s Sol. In sunglasses. At sunset. He had it professionally done.'],
      ['desk',7,6,2,1,'Lost and found','Sunglasses, sunglasses, sunglasses, and one Oscar. It\'s probably fake. Probably.'],
      ['pot',1,6,1,1,'Waiting room palm','A palm tree in a pot. It\'s waiting for a cab to the beach.']]},
  // Tom's house, 3468 2nd Ave. Main floor: painted plate art/tomhouse.webp (engine/plate.js), 16 x 24 tiles at 64 art px per tile.
  // The mask is traced from the painting: '#' blocks, '.' walks. The front door (three tiles) is at the bottom left; the open doorway at the
  // top middle is an edge portal to the primary suite (map id tomsuite). The old hall wing (laundry, office, guest rooms) is gone.
  {id:'tomhouse',w:16,h:24,door:[4,18],door2:[5,18],doors:[[3,18]],spawn:{x:4,y:17},
    edges:[{at:[7,3],to:'tomsuite',spawn:{x:7,y:11},facing:'up'}],
    style:{floor:'#c9a476',alt:'#d2ad80',wall:'#d8dbde',trim:'#f4f4f2',pattern:'wood',rug:'#e8eaee'},
    rug:[11,14,3,3],
    plateMask:[
      '################',
      '################',
      '################',
      '#######.########',
      '#######.########',
      '###......#######',
      '###.##........##',
      '##.####..#######',
      '##.####..#######',
      '##.####..#######',
      '##..##........##',
      '##...........###',
      '##......####..##',
      '###.....####..##',
      '###.....##....##',
      '###.....##.##.##',
      '###.....##.##.##',
      '##......##...###',
      '###...##########',
      '################',
      '################',
      '################',
      '################',
      '################'],
    npcs:[],
    objects:[
      ['wetbar',3,4,3,1,'Wet bar','Blue accent wall, white shaker cabinets, walnut shelves of bottles, a glass cabinet and a wine fridge. TNB made the coasters.'],
      ['kitchen',9,5,2,1,'Fridge','A stainless fridge full of kimchi, bread dough and one sad lemon. The lemon is from the yard.'],
      ['kitchen',11,5,3,1,'Range and upper cabinets','White cabinets and a gas range. Everything Tom cooks starts here.'],
      ['kitchen',14,5,1,4,'Kitchen counter','A cutting board, a bread knife and a jar of wooden spoons. Tom has opinions about the spoons.'],
      ['island',9,7,5,3,'Kitchen island','White quartz with gray veins. A sourdough starter in a jar, fed this morning, bubbling with pride.'],
      ['dining',3,7,4,3,'Dining table','Walnut table, gray upholstered chairs, a striped rug and a chandelier of white glass globes.'],
      ['pot',2,5,1,2,'Fiddle-leaf fig','In a TNB pot. TNB waters it when Tom is away and talks to it. It\'s thriving. Suspiciously.'],
      ['gallery',1,12,1,2,'Photo wall','Family photos, Grace and Rose at the beach, and a carved wooden map of Long Island. Home, twice.'],
      ['pot',2,13,1,1,'Rubber plant','A rubber plant by the photo wall. TNB says it is thriving. Tom says it is thriving because TNB talks to it.'],
      ['shelf',2,14,1,3,'Console table','A lamp, a candle, a tiny cactus and a bowl of keys. Tom has never once put the keys in the bowl.'],
      ['couch',8,12,2,6,'The couch','A deep gray sectional, perfect for six-hour gaming sessions. One dent is TNB-shaped, from Saturday horror nights.'],
      ['couch',10,12,2,2,'The couch (arm)','A deep gray sectional, perfect for six-hour gaming sessions. One dent is TNB-shaped, from Saturday horror nights.'],
      ['coffeetable',11,15,2,2,'Coffee table','Round and wooden. A coaster, a controller, and a TNB bowl full of other controllers.'],
      ['bigtv',14,12,2,2,'The big TV','Seventy-five inches. Final Fantasy IV on the screen, the music on loop. Still the best one.'],
      ['console',14,14,1,1,'The PS5','A stack of games, two controllers and a headset. The A button on one controller is worn smooth.'],
      ['shelf',14,15,2,2,'TV console','Controllers, a stack of game cases and a candle nobody is allowed to light during a boss fight.'],
      ['pot',14,9,1,2,'Corner plant','A snake plant. It survived three trips to New York with no water. It\'s fine. It\'s always fine.'],
      ['pot',13,17,1,1,'Woven pouf','A woven pouf. Whoever sits on it loses the argument about what to watch.']]},
  // Tom's house, primary suite: painted plate art/tomsuite.webp, 16 x 15 tiles. Reached through the doorway at the top of the main floor.
  {id:'tomsuite',w:16,h:15,door:[7,12],door2:[8,12],spawn:{x:7,y:11},
    edges:[{at:[7,12],to:'tomhouse',spawn:{x:7,y:4},facing:'down'},{at:[8,12],to:'tomhouse',spawn:{x:7,y:4},facing:'down'}],
    style:{floor:'#c9a476',alt:'#d2ad80',wall:'#d8dbde',trim:'#f4f4f2',pattern:'wood',rug:'#e8eaee'},
    rug:[8,6,5,5],
    plateMask:[
      '################',
      '################',
      '################',
      '######.###..####',
      '####...###..####',
      '#####.####.#####',
      '#####......#####',
      '####.....#######',
      '###.....########',
      '####....########',
      '####....########',
      '####.........###',
      '#######..#######',
      '################',
      '################'],
    npcs:[],
    objects:[
      ['shower',1,2,3,3,'Glass shower','A rain shower behind a wall of glass, with dark stone tile behind it. Steam everywhere.',{restore:true,restoreText:'Rain shower, full blast, way too long. Everyone is completely restored. The mirror will be foggy until Thursday.'}],
      ['toilet',4,3,1,1,'Primary toilet','Heated seat. Tom still will not discuss it.'],
      ['nightstand',5,3,1,1,'Bathroom stand','A small cabinet of folded towels, a candle and a framed print of a pond. The pond is in the game. Tom checked.'],
      ['vanity',7,3,2,2,'Double vanity','Two sinks, a white quartz top, a reed diffuser and an eleven-step skincare routine. Both sinks are Tom\'s.'],
      ['closet',10,2,2,1,'Walk-in closet','Black t-shirts, black t-shirts, one blazer for McKinsey Zooms, and the black t-shirts.'],
      ['closet',12,2,1,2,'TNB\'s closet','TNB\'s side. Every shirt is on a hanger, labeled by scene. Wardrobe habits.'],
      ['shelf',9,3,1,1,'Closet shelves','Folded sweaters, a hatbox and a shoebox labeled WINTER, in Los Angeles. It was optimism.'],
      ['tombed',9,7,4,4,'The bed','A huge upholstered bed in cream linen, oak nightstands with marble tops, and very good sheets.',{restore:true,restoreText:'Tom lies down for twenty minutes. It\'s two hours. Everyone is completely restored.'}],
      ['nightstand',13,9,2,3,'Nightstand','Oak and marble. A glass of water and a phone face down. Tom is trying.'],
      ['bench',8,8,1,3,'Bed bench','A woven bench at the foot of the bed. It holds whatever Tom was wearing yesterday.'],
      ['bench',2,9,2,2,'Window bench','Where the clean laundry lives until it becomes the dirty laundry.'],
      ['pot',2,11,2,1,'Fiddle-leaf fig','A big plant by the deck door. TNB waters it when Tom is away and talks to it. It is thriving. Suspiciously.'],
      ['pot',3,6,1,2,'Rubber plant','A rubber plant under the window. Tom has not killed it yet. It is a personal best.'],
      ['pot',11,5,2,2,'Big plant','A tall leafy plant by the closet door. The leaves lean toward the window like they want to go outside.']]},
  {id:'casa',w:14,h:11,
    style:{floor:'#d8b48a',alt:'#e2c39c',wall:'#c98a5a',trim:'#f4e6c8',pattern:'tile',rug:'#2f8a8a'},
    rug:[4,4,6,4],
    npcs:[
      {name:'Mrs. Alvarez',x:7,y:5,look:'alvarez',lines:[
        'TEN. Ten people in a two-bedroom house from 1912. One bathroom. ONE.',
        'Tony, feet off my table! Kevin, the baby isn\'t a football! Mateo, give Abuela the remote! ...Tom, mijo, sit. If you can find a chair.',
        "Everybody says, 'Mama, the house is so full of love.' It's full of SOMETHING. Take tamales. Please. I need the room in my fridge."]},
      {name:'Don Beto',x:11,y:3,look:'beto',lines:[
        "I've been in this chair since the game started. Which game? Yes.",
        'Ten people. I counted once. Then I lost count. Then I took a nap.']},
      {name:'Tony',x:4,y:5,look:'tony',lines:[
        'Me and Yesenia are saving for our own place. In this market? We\'ll be here until Mateo goes to college.',
        'The two houses next door sold for more than this whole block cost in 1990. My mom isn\'t okay about it.']},
      {name:'Yesenia',x:5,y:7,look:'yesenia',lines:[
        'Sofi, no. Sofi. SOFI. ...She bit something. We don\'t have a dog. I don\'t know what she bit.',
        'Baby Lupita is finally asleep. If you wake her, you\'re moving in.']},
      {name:'Claudia',x:10,y:6,look:'claudia',lines:[
        'Night shift nurse. I sleep in the bathtub. It\'s the only room with a lock.',
        'Until somebody needs the bathroom. Somebody always needs the bathroom.']},
      {name:'Kevin',x:3,y:8,look:'kevin',lines:[
        "I share the bunk bed with Uncle Tony's exercise bike.",
        'It\'s not a metaphor. The bike is on the top bunk.']},
      {name:'Daisy',x:9,y:8,look:'daisy',lines:[
        "I'm making a documentary about this house. It's a horror movie.",
        "Scene one: the bathroom line. Scene two: who ate Abuela's last concha."]},
      {name:'Mateo',x:6,y:8,look:'mateo',duration:0.45,lines:[
        'Truck! TRUCK!',
        'Ba! Ba! ...Truck.']},
      {name:'Sofi',x:8,y:6,look:'sofi',duration:0.45,lines:[
        "I'm a dinosaur. RAWR.",
        "Abuela says no more dinosaurs inside. I'm a quiet dinosaur. rawr."]}],
    objects:[
      ['table',2,3,2,2,'Kitchen table',"Tamales, homework, a diaper bag, three phones charging off one outlet, and a sign in Mrs. Alvarez's handwriting: NO."],
      ['counter',7,1,3,1,'Stove','Four pots on four burners. A pot of beans that\'s been simmering since 1998.',{variant:'bread'}],
      ['recliner',11,1,2,2,"Don Beto's recliner",'The game is on. The volume is at 60. Nobody has ever seen it lower.'],
      ['bed',1,7,2,2,'Bunk bed','Kevin on the bottom. An exercise bike on the top. Don\'t ask how it got up there.'],
      ['bed',11,7,2,2,"Baby Lupita's crib",'Baby Lupita, seven months old, asleep. Somehow. Nobody breathe.'],
      ['toybox',5,9,1,1,'Toy pile','Blocks, a plastic dinosaur missing its tail, and the TV remote. Mateo hid it again.'],
      ['photo',5,1,1,1,'Family wall','Four generations, two weddings, one quinceañera, and a photo of the house in 1975, back when it had a lawn.']]},
  {id:'loftlobby',name:'The Lofts Lobby',w:12,h:10,
    style:{floor:'#d8b57a',alt:'#e0c08a',wall:'#8a5a44',trim:'#d9c0a0',pattern:'tile',rug:'#7a4a3a'},
    rug:[4,4,4,2],
    // Painted plate (art/loftlobby.webp, engine/plate.js). Street gate at the bottom (door 6,9 and 5,9). The brass elevator doors (5,1 and 6,1) are scenery: the call button beside them (7,2) asks to go up to TNB's loft.
    // Mailboxes top left, package desk top right, leather sofa left, monstera right. The mask is the walk map: '#' blocks, '.' walks.
    plateMask:[
      '############',
      '############',
      '############',
      '###.....####',
      '###.......##',
      '###.......##',
      '###.......##',
      '#####..#####',
      '#####..#####',
      '#####..#####'],
    door:[6,9],door2:[5,9],spawn:{x:6,y:8},
    npcs:[],
    objects:[
      ['photo',7,2,1,1,'Elevator button',"The brass call button. A tiny label under it says: TNB, TOP FLOOR, MIND THE KILN.",{ride:['lofts',6,8,'up'],ridePrompt:"Go up to TNB's loft?"}],
      ['shelf',2,1,3,2,'Mailboxes',"Thirty brass mailboxes. TNB's just says CLAY in marker, because the real label fell off in 2022. It is full of glaze catalogs."],
      ['table',8,2,3,2,'Package desk','A box stamped FRAGILE: POTTERY, addressed to TNB. Every neighbor has shaken it once. Nobody has admitted it.'],
      ['couch',0,4,3,3,'Leather sofa','For people waiting on someone. A handbag and yesterday\'s paper sit on it. Nobody has claimed either.'],
      ['pot',10,4,2,3,'Monstera','Taller than the mailboxes. A tag on the pot says WATER ME THURSDAYS. It looks like it has opinions about the other days.']]},
  {id:'lofts',w:12,h:10,
    exitTo:['loftlobby',5,3,'down'],
    style:{floor:'#b98a6a',alt:'#c49878',wall:'#8a5a44',trim:'#d9c0a0',pattern:'wood',rug:'#3f4650'},
    rug:[3,5,5,2],
    // Painted plate (art/lofts.webp, engine/plate.js). Kiln and clothes rack top left, pottery shelf top right, wheel left, coffee table on the rug,
    // longboard wall right, sofa left, door bottom centre (6,9; the way down is the elevator to the lobby). '#' blocks, '.' walks.
    plateMask:[
      '############',
      '############',
      '############',
      '###........#',
      '####.##.####',
      '###.....####',
      '#####.....##',
      '#####.....##',
      '######.#####',
      '######.#####'],
    npcs:[
      {name:'TNB',x:6,y:5,look:'kit',sheet:'tnb',partner:true,duration:0.68,lines:[
        'Well, well, well...',
        'Hey, you. Did you eat? I made a bowl. I also made a bowl. Pottery joke.',
        'Welcome to the loft. Kiln by one window, wheel by the other, garment bags everywhere else. Spring Street, baby.',
        'Take my jacket. It gets cold up in Griffith Park at night, and a cold Tom is a no-go.'],
        revisit:[
          'Took the longboard down Spring Street this morning. Smooth. There\'s a crack by Fourth Street I\'ve named.',
          'Threw six mugs this morning. The glaze came out of the kiln like sea glass. Come look before you claim one.',
          'Go on, I\'ll be right here. I\'m pot-sitive about it.',
          'Horror movie tonight. You pick. You always pick the scary one and then hold my arm the whole time.',
          'Watered your plants on 2nd Ave. The fern asked about you. I said you\'re fine.',
          'Rode the train to the clay studio. Forty minutes. Best forty minutes of my day. Met a man who knows every line.',
          'The slime? It just needs someone to mold it. I have more of these. You know I do.',
          'Long day on set. Eleven costume changes. One actor lost a shoe. I found it. I always find it.',
          'Be careful out there. I like you un-cracked.']}],
    objects:[
      ['oven',2,1,2,2,'The kiln','Cone six, firing tonight. A sign on it: DO NOT OPEN. VERY HOT. SO ARE YOU.'],
      ['rack',4,1,3,2,'Garment rack',"Bagged costumes for tomorrow's shoot, tagged by scene. One bag just says: SHOE BACKUP."],
      ['shelf',8,1,3,2,'Pottery shelf','Mugs in sunset colors. TNB says LA light changes the glaze. Tom has no idea how glaze works. He believes him completely.'],
      ['wheel',1,3,2,2,'Pottery wheel','Still a little clay on it. Centered. Everything starts with centering.'],
      ['boardwall',8,4,3,2,'Longboard wall','Three longboards and a Metro map with every line he\'s ridden circled. Every line is circled.'],
      ['couch',1,6,3,2,'Horror couch','Facing a projector screen. The last movie paused mid-scream. Tom won\'t ask which one.'],
      ['table',5,4,2,1,'Coffee table','A plant, a stack of glaze books and one mug with a chip. TNB says the chip is the best part.'],
      ['table',4,6,1,2,'Side tables','A lamp, and a bowl of popcorn that has been there since the last movie. Nobody is brave enough to ask how long.']]},
  {id:'tower',w:11,h:9,
    style:{floor:'#cfd6de',alt:'#dde3ea',wall:'#3f5a74',trim:'#c9d6de',pattern:'tile',rug:'#6f9fc4'},
    rug:[3,5,5,2],
    npcs:[
      {name:'Priya',x:6,y:5,look:'priya',lines:[
        '34th floor. From my desk I can see Griffith Park. I\'ve never been to Griffith Park.',
        'My dog is named Bagel. He has more friends in this building than I do.',
        'The pool is on the roof. Nobody swims. Everyone takes photos of the pool.']}],
    objects:[
      ['couch',2,2,3,1,'Gray couch','It came in a box. Most things in this building came in a box.'],
      ['desk',7,2,2,1,'Standing desk','Three monitors. A sticky note: GO OUTSIDE. Under it: LATER.'],
      ['tv',2,7,3,1,'The TV',"A slideshow of somebody else's vacation. It came with the apartment."],
      ['pot',9,6,1,1,'Fiddle-leaf fig','Thriving. Gets more sun than anyone in the building.']]},
  {id:'creole',w:12,h:9,
    style:{floor:'#c9a87a',alt:'#d6b688',wall:'#7a3a5a',trim:'#e8c060',pattern:'check',rug:'#4a7a3a'},
    rug:[4,5,4,2],
    npcs:[
      {name:'Miss Odette',x:6,y:4,look:'odette',
        when:[{...CH2_SMOG,lines:['Stirring. Stirring.','The gumbo never has to be done, baby. Isn\'t that nice? Nothing ever has to be done.']},
              {...CH2_CLEAR,lines:['That smog had me stirring one pot for an hour. Best roux I ever made, though.','Sit. Eat. You and that boyfriend earned a bowl today.']}],
        lines:[
        "Sit down, baby. Gumbo's on. It's been on since six.",
        'My mama opened this kitchen when this stretch was Little New Orleans. Folks came from Louisiana and brought the food.',
        'Pralines by the register. Take two. One for you, one for that boyfriend who keeps coming in for the red beans.']}],
    objects:[
      ['counter',2,2,6,1,'Pastry case','Pralines, sweet potato pie and a hand-written sign: NO, YOU CANNOT HAVE THE RECIPE.',{variant:'bread'}],
      ['table',8,5,2,2,'Corner table','Hot sauce, a paper menu, and a church fan from 1987.'],
      ['photo',9,1,1,1,'Boulevard photo','Jefferson Boulevard, 1958. Same kitchen. Same sign. Younger Odette in the doorway, holding a pot.'],
      ['pot',1,6,1,1,'Pepper plant','Cayenne. Odette says Boppy couldn\'t handle it. She\'s never met Boppy. She\'s right.']]},
  {id:'pupuseria',w:11,h:9,
    style:{floor:'#e8dcc4',alt:'#f2e6d0',wall:'#2f6fb3',trim:'#ffffff',pattern:'tile',rug:'#2f6fb3'},
    rug:[3,5,5,2],
    npcs:[
      {name:'Doña Carmen',x:5,y:4,look:'carmen',
        when:[{...CH2_SMOG,lines:['The pupusas are fine. Everything is fine.','It\'s always this afternoon. Why\'d I ever flip them?']},
              {...CH2_CLEAR,lines:['I left them on the comal the whole time. They came out perfectly crispy, actually.','Don\'t tell the juice bar. They\'ll want the recipe.']}],
        lines:[
        'Bienvenidos! Pupusas revueltas, and curtido on the side. Curtido isn\'t optional.',
        'I came from San Salvador in 1991. This comal came with me in a suitcase.',
        'The juice bar next door asked me what a pupusa is. I gave them three. Now they ask every day.']}],
    objects:[
      ['counter',3,2,5,1,'The comal','A big flat griddle, pupusas puffing on it, and a jar of curtido the size of a toddler.',{variant:'tea'}],
      ['table',1,5,2,2,'Family table','Three generations eating at once. Everyone talking. Nobody waiting.'],
      ['photo',8,1,1,1,'Volcano photo','A volcano outside San Salvador at sunrise. Carmen points at it every time someone looks.'],
      ['pot',9,6,1,1,'Loroco plant','Grown from seeds a cousin mailed. The flowers go in the pupusas.']]},
  {id:'jordansam',w:11,h:9,
    style:{floor:'#e8e4dc',alt:'#f2f0ea',wall:'#2c2c2e',trim:'#f4f4f0',pattern:'tile',rug:'#c9b89a'},
    rug:[3,5,5,2],
    npcs:[
      {name:'Jordan',x:4,y:5,look:'jordan',lines:[
        'We took it down to the studs. Then we put the studs back. Very authentic.',
        "Have you tried the juice bar on Jefferson? It's so nice the neighborhood is finally getting... options.",
        'We painted it black. The neighbors call it the haunted house. We\'re choosing to take that as a compliment.']},
      {name:'Sam',x:7,y:5,look:'sam',lines:[
        'Mrs. Alvarez brought us tamales. We posted them. We tagged her. She doesn\'t have Instagram.',
        "Our mortgage is, um. We don't say the number out loud. The house can hear.",
        'Everyone else on this street rents. We think about that a lot. Mostly on podcasts.']}],
    objects:[
      ['couch',2,2,3,1,'Boucle couch','Cream colored. Nobody is allowed to eat on it, including Jordan and Sam.'],
      ['counter',7,1,3,1,'Espresso bar','A machine with a pressure gauge and a name. It\'s named Bruno. Bruno gets dusted twice a day.',{variant:'tea'}],
      ['photo',9,6,1,1,'Before and after','Framed. Before: the old porch and a red door. After: black paint, a slat fence, one agave.'],
      ['pot',1,6,1,1,'Olive tree','In a concrete planter. It\'s never made an olive. It\'s purely aesthetic.']]},
  {id:'dakota',w:12,h:10,
    style:{floor:'#e2d0b0',alt:'#ecdcc0',wall:'#f2f2ee',trim:'#b98a5a',pattern:'wood',rug:'#9ccfd8'},
    rug:[3,5,5,3],
    npcs:[
      {name:'Dakota',x:4,y:6,look:'dakota',lines:[
        "We're restoring the original 1912 windows. It's a whole thing.",
        'Mr. Washington told us the windows are older than his father. He was very serious about it.',
        'Every house on this street has a story. Ours is: the plumbing.']},
      {name:'Ryan',x:8,y:5,look:'ryan',lines:[
        'Baby Hudson is asleep. Please whisper. Please. I\'m begging.',
        'We moved from the Westside for the space. And the character. Mostly the price. Which was still a lot.',
        'I work from home. Home is very loud on the Alvarez side. I bought noise-canceling headphones. They lost.']}],
    objects:[
      ['bed',9,1,2,2,"Hudson's crib",'Baby Hudson, five months old, asleep under a mobile of tiny felt clouds that cost eighty dollars.'],
      ['table',2,2,2,2,'Dining table','Reclaimed wood. Reclaimed from where? Ryan doesn\'t know. It was very expensive.'],
      ['shelf',7,8,3,1,'Book shelf','Baby books, a guide to historic window restoration, and a plant care book with every plant marked DEAD.'],
      ['pot',1,7,1,1,'Monstera','Huge. Healthy. Its name is Kevin. The Kevin next door finds this upsetting.']]}
];
