'use strict';
// data/party.js — Items, party members, recruits, the move tables.
// ---------- Party: stats, equipment, inventory ----------
const SLOTS=['Head','Body','Legs','Feet','Held'];
const STAT_NAMES=['Curiosity','Charm','Pace','Luck'];
const items={
  sunhat:{price:12,name:'Straw Sunhat',icon:'\u{1F452}',slot:'Head',desc:'Keeps the sun off and the thoughts in.',bonus:{Luck:1}},
  shirt:{price:10,name:'Sunny Shirt',icon:'\u{1F455}',slot:'Body',desc:'Yellow enough to be seen from the Moon Club.',bonus:{Charm:1}},
  trousers:{price:10,name:'Pocket Trousers',icon:'\u{1F456}',slot:'Legs',desc:'Four pockets. Three of them are useful.',bonus:{Curiosity:1}},
  shoes:{price:10,name:'Walking Shoes',icon:'\u{1F45F}',slot:'Feet',desc:'Broken in by a previous owner. Thanks, previous owner.',bonus:{Pace:1}},
  notebook:{price:14,name:'Pocket Notebook',icon:'\u{1F4D3}',slot:'Held',desc:'Every page says "ask Dot about windows."',bonus:{Curiosity:2}},
  pebble:{price:8,name:'Smooth Pebble',icon:'\u{1FAA8}',slot:'Held',desc:'Pip would like you to know it is not a pet.',bonus:{Luck:2}},
  button:{sell:1,name:'Spare Button',icon:'\u{1F518}',slot:null,desc:'From something. Possibly a coat. Possibly a future coat.'},
  roll:{price:8,name:'Warm Roll',icon:'\u{1F956}',slot:null,heal:6,desc:'Souvenir from Crumb Bakery. Emotionally available.'},
  bookmark:{price:14,name:'Overdue Bookmark',icon:'\u{1F516}',slot:'Held',desc:'Souvenir from The Hush Library. It knows where you were.',bonus:{Curiosity:1,Charm:1}},
  sprout:{name:'Steve (a sprout)',icon:'\u{1F331}',slot:null,desc:'Souvenir from Sprout House. Requests a corner office.'},
  stamp:{sell:3,name:'Potato Stamp',icon:'\u{1F954}',slot:null,desc:'Souvenir from Snail Mail. First-class taste.'},
  biscuit:{price:10,name:'Dramatic Biscuit',icon:'\u{1F36A}',slot:null,heal:8,desc:'Souvenir from Kettle Cottage. Dares you to dunk it.'},
  scrap:{price:14,name:'Star Chart Scrap',icon:'\u{2B50}',slot:'Head',desc:'Souvenir from Moon Club. Worn as a very small hat.',bonus:{Luck:1,Curiosity:1}},
  gtee:{price:10,name:'Lavender Tee',icon:'\u{1F45A}',slot:'Body',desc:'Soft, purple, slightly glittery. Grace approves.',bonus:{Charm:1}},
  gpants:{price:10,name:'Flower Pants',icon:'\u{1F338}',slot:'Legs',desc:'Black with tiny flowers. Grass stains optional.',bonus:{Luck:1}},
  gsneak:{price:10,name:'Purple Sneakers',icon:'\u{1F45F}',slot:'Feet',desc:'Light-up soles. The lights are for intimidation.',bonus:{Pace:1}},
  rclip:{price:8,name:'Red Hair Clip',icon:'\u{1F380}',slot:'Head',desc:'Keeps the hair out of the eyes, mostly.',bonus:{Luck:1}},
  rdress:{price:12,name:'Gingham Dress',icon:'\u{1F457}',slot:'Body',desc:'Yellow check. Twirls at a professional level.',bonus:{Charm:2}},
  rshoes:{price:10,name:'Pink Shoes',icon:'\u{1F45F}',slot:'Feet',desc:'Fast. Allegedly.',bonus:{Pace:1}},
  bcap:{name:"Boppy's Cap",icon:'\u{1F9E2}',slot:'Head',desc:'Grey, broken in, smells faintly of the garage. For luck.',bonus:{Luck:1,Charm:1}},
  cookie:{name:"Deedee's Cookie",icon:'\u{1F36A}',slot:null,heal:7,desc:'Still warm.'},
  fridgephoto:{name:'Fridge Photo',icon:'\u{1F5BC}',slot:null,desc:'The whole family at the pond, before the Grump. Tom is blinking.'},
  drawing:{name:"Rose's Drawing",icon:'\u{1F58D}',slot:'Held',desc:'Tata fighting a green blob. Grace added a sword. Rose added glitter.',bonus:{Charm:1,Luck:1}},
  pepper:{name:"Boppy's Pepper",icon:'\u{1F336}',slot:'Held',desc:'Do not eat it. Holding it makes you braver, somehow.',bonus:{Curiosity:1,Luck:1}},
  jacket:{name:"TNB's Jacket",icon:'\u{1F9E5}',slot:'Body',color:'#9ea3ab',desc:'Soft grey, slightly too big, smells like home. Warm enough to be brave in.',bonus:{Charm:2,Luck:1},def:1},
  sweater:{name:'Lucky Red Sweater',icon:'\u{1F9F6}',slot:'Body',color:'#c43e3e',desc:'Deedee knit it in a weekend. It has never lost.',bonus:{Luck:1,Charm:1},def:1},
  hoodie:{sell:15,name:'Pond Hoodie',icon:'\u{1F9E5}',slot:'Body',color:'#3f8f6e',desc:'The Grump dropped it. It smells like the pond. He wants it back.',bonus:{Curiosity:1},def:2},
  beanie:{price:16,name:'Moon Beanie',icon:'\u{1F9E2}',slot:'Head',color:'#3a4a8a',desc:'Navy with one star. Keeps big ideas warm.',bonus:{Curiosity:1,Luck:1}},
  mudpie:{sell:2,name:'Mud Pie',icon:'\u{1F967}',slot:null,heal:4,desc:'Mostly mud. Some pie. Rose insists.'},
  honey:{sell:6,name:'Swamp Honey',icon:'\u{1F36F}',slot:null,heal:9,desc:'The skeeters were guarding it. Sticky, sweet, slightly buzzy.'},
  lilyhat:{sell:20,name:'Lily Pad Hat',icon:'\u{1FAB7}',slot:'Head',color:'#5b8a4a',desc:'Slid off a Bog Toad. Still damp. Grace says it is a crown.',bonus:{Luck:2,Charm:1}},
  barkslab:{sell:15,name:'Bark Slab',icon:'\u{1FAB5}',slot:'Held',desc:'Came off a Log Lump. Heavy, mossy, and surprisingly good at stopping things.',bonus:{Curiosity:1},def:1},
  lure:{name:"Boppy's Lost Lure",icon:'\u{1FA9D}',slot:'Held',desc:'Twenty years in a fish\u2019s lip. Still shiny. Boppy will want to hear about this.',bonus:{Luck:3,Charm:1},def:1},
  juice:{price:6,name:'Juice Box',icon:'\u{1F9C3}',slot:null,heal:5,desc:'From the bottom of Amy\'s bag.'},
  // ---- Penny's Pockets stock: healing ----
  bandage:{price:15,name:'Dino Bandage',icon:'\u{1FA79}',slot:null,heal:12,desc:'Has a T. rex on it. Rose says that makes it work faster. Rose is right.'},
  picnic:{price:26,name:'Picnic Basket',icon:'\u{1F9FA}',slot:null,healAll:6,desc:'Sandwiches for everyone. Somebody always gets the squished one.'},
  lemonade:{price:9,name:'Fizzy Lemonade',icon:'\u{1F964}',slot:null,mp:4,desc:'Bubbles go up the nose, ideas go up the brain.'},
  cocoa:{price:18,name:'Hot Cocoa',icon:'☕',slot:null,mp:8,desc:'Three marshmallows. Non-negotiable. Fully restores your will to try.'},
  whistle:{price:30,name:'Wake-Up Whistle',icon:'\u{1F4E2}',slot:null,revive:true,desc:'One blast and a fallen friend is back on their feet, grumpy but fine.'},
  // ---- Penny's Pockets stock: battle ----
  balloon:{price:12,name:'Water Balloon',icon:'\u{1F388}',slot:null,dmg:8,desc:'Thrown with love and terrible aim. Never misses, somehow.'},
  popper:{price:22,name:'Party Popper',icon:'\u{1F389}',slot:null,dmg:15,desc:'Confetti at very high speed. Monsters hate a celebration.'},
  cushion:{price:16,name:'Whoopee Cushion',icon:'\u{1F4A8}',slot:null,confuse:true,desc:'Nobody can concentrate after that. Nobody.'},
  kazoo:{price:14,name:'Kazoo',icon:'\u{1F3BA}',slot:null,atkDown:true,desc:'One long note. The monster loses its will to hit hard.'},
  goldstar:{price:18,name:'Gold Star Sticker',icon:'\u{1F31F}',slot:null,pep:true,desc:'From Amy’s classroom stash. Everyone stands up straighter.'},
  // ---- Gear made for one person (who) ----
  t_headphones:{who:'tom',price:20,name:'Retro Headphones',icon:'\u{1F3A7}',slot:'Head',desc:'Plays the boss music on a loop. Only Tom can hear it.',bonus:{Curiosity:1,Luck:1}},
  t_apron:{who:'tom',price:30,name:'Sourdough Apron',icon:'\u{1F35E}',slot:'Body',color:'#c9b07a',desc:'Flour in every pocket. Smells like a day three starter.',bonus:{Charm:1},def:1},
  t_slippers:{who:'tom',price:24,name:'Lie-Flat Slippers',icon:'\u{1FA74}',slot:'Feet',desc:'Delta One amenity kit. Tom has kept them since 2019.',bonus:{Pace:2}},
  t_controller:{who:'tom',price:36,name:'Lucky Controller',icon:'\u{1F3AE}',slot:'Held',desc:'The A button is worn smooth. It has beaten Final Fantasy IV eleven times.',bonus:{Curiosity:2,Luck:1}},
  g_headband:{who:'grace',price:18,name:'Sparkle Headband',icon:'\u{1F451}',slot:'Head',desc:'Glitter falls off it constantly. That is the point.',bonus:{Charm:1,Luck:1}},
  g_leotard:{who:'grace',price:30,name:'Gym Leotard',icon:'\u{1FA71}',slot:'Body',color:'#d65aa0',desc:'Pink and purple. Built for cartwheels. Judges love it.',bonus:{Pace:1,Charm:1},def:1},
  g_leggings:{who:'grace',price:16,name:'Glitter Leggings',icon:'✨',slot:'Legs',desc:'Leaves a trail. Grace calls it her signature.',bonus:{Pace:1}},
  g_squishy:{who:'grace',price:22,name:'Squishy Keychain',icon:'\u{1F351}',slot:'Held',desc:'A peach that smells like a peach. Squeezed four hundred times a day.',bonus:{Luck:2}},
  r_ears:{who:'rose',price:16,name:'Bunny Ears',icon:'\u{1F430}',slot:'Head',desc:'Makes every jump at least ten percent bouncier.',bonus:{Charm:1,Luck:1}},
  r_raincoat:{who:'rose',price:26,name:'Frog Raincoat',icon:'\u{1F438}',slot:'Body',color:'#6fbf5a',desc:'Has eyes on the hood. Puddles fear it.',bonus:{Charm:1},def:2},
  r_boots:{who:'rose',price:18,name:'Puddle Boots',icon:'\u{1F462}',slot:'Feet',desc:'For jumping in puddles. All puddles. Especially the deep one.',bonus:{Pace:1},def:1},
  r_lamby:{who:'rose',price:24,name:'Mini Lamby',icon:'\u{1F411}',slot:'Held',desc:'Lamby’s little cousin. Rose says it is brave.',bonus:{Luck:2,Charm:1}},
  a_visor:{who:'amy',price:18,name:'Running Visor',icon:'\u{1F9E2}',slot:'Head',desc:'Sweat-wicking. Glare-blocking. Excuse-blocking.',bonus:{Pace:1,Luck:1}},
  a_singlet:{who:'amy',price:30,name:'Race Day Singlet',icon:'\u{1F3BD}',slot:'Body',color:'#e8743b',desc:'Bib still pinned on. She is always racing something.',bonus:{Pace:2},def:1},
  a_flats:{who:'amy',price:24,name:'Racing Flats',icon:'\u{1F45F}',slot:'Feet',desc:'Weigh less than a juice box. Amy checked.',bonus:{Pace:2}},
  a_redpen:{who:'amy',price:16,name:'Red Pen',icon:'\u{1F58A}',slot:'Held',desc:'Grading at all times. Even monsters.',bonus:{Curiosity:2}},
  d_hat:{who:'deedee',price:18,name:'Garden Hat',icon:'\u{1F452}',slot:'Head',desc:'Wide brim, silk flower, one ladybug that lives there now.',bonus:{Charm:1,Luck:1}},
  d_apron:{who:'deedee',price:28,name:'Floral Apron',icon:'\u{1F33A}',slot:'Body',color:'#e59aa8',desc:'Flour, frosting and forty tomatoes worth of stains.',bonus:{Charm:2},def:1},
  d_clogs:{who:'deedee',price:18,name:'Garden Clogs',icon:'\u{1F97F}',slot:'Feet',desc:'Muddy forever. Comfortable forever.',bonus:{Pace:1},def:1},
  d_mitt:{who:'deedee',price:20,name:'Oven Mitt',icon:'\u{1F9E4}',slot:'Held',desc:'Four hundred and fifty degrees of protection.',bonus:{Curiosity:1},def:1},
  b_hat:{who:'boppy',price:20,name:'Bucket Hat',icon:'\u{1F3A3}',slot:'Head',desc:'Seven lures hooked in the brim. None of them have caught anything.',bonus:{Luck:2}},
  b_vest:{who:'boppy',price:32,name:'Fishing Vest',icon:'\u{1F9BA}',slot:'Body',color:'#6b7a4a',desc:'Twelve pockets. Eleven have peppers in them.',bonus:{Curiosity:1},def:2},
  b_shoes:{who:'boppy',price:22,name:'Comfy Sneakers',icon:'\u{1F45E}',slot:'Feet',desc:'Extra arch support. The knee approves. The hip has notes.',bonus:{Pace:1},def:1},
  b_pad:{who:'boppy',price:26,name:'Heating Pad',icon:'\u{1F525}',slot:'Held',desc:'Plugged into nothing. Still works. Boppy says it is mental.',bonus:{Charm:1},def:2},
  n_helmet:{who:'tnb',price:20,name:'Transit Cap',icon:'\u{1F9E2}',slot:'Head',desc:'Covered in pins from every transit system he has ridden. He can name all the lines.',bonus:{Luck:1},def:1},
  n_apron:{who:'tnb',price:30,name:'Glaze Apron',icon:'\u{1F3FA}',slot:'Body',color:'#7f5a44',desc:'Splattered in every glaze color. Cone six approved.',bonus:{Charm:1,Curiosity:1},def:1},
  n_shoes:{who:'tnb',price:24,name:'Skate Shoes',icon:'\u{1F6F9}',slot:'Feet',desc:'Worn through at the toe from braking. He says he never brakes.',bonus:{Pace:2}},
  n_lintroller:{who:'tnb',price:18,name:'Lint Roller',icon:'\u{1F9FB}',slot:'Held',desc:'Wardrobe runner essential. No scene goes out fuzzy.',bonus:{Luck:1,Charm:1}},
  y_bandana:{who:'nara',price:16,name:'Polka Dot Bandana',icon:'\u{1F9E3}',slot:'Head',desc:'Tied around her neck. She thinks it makes her look fast. It does.',bonus:{Charm:2}},
  y_harness:{who:'nara',price:26,name:'Walk Harness',icon:'\u{1F9BA}',slot:'Body',desc:'Padded, reflective, and covered in fur no matter how often you clean it.',bonus:{Pace:1},def:1},
  y_booties:{who:'nara',price:20,name:'Rain Booties',icon:'\u{1F97E}',slot:'Feet',desc:'She walks like a cartoon horse in them. Very protective, very embarrassing.',bonus:{Luck:1},def:1},
  y_ball:{who:'nara',price:14,name:'Squeaky Ball',icon:'\u{1F3BE}',slot:'Held',desc:'Squeaks every time she bites it. Which is constantly.',bonus:{Curiosity:1,Luck:1}},
  jerky:{price:6,name:'Chicken Jerky',icon:'\u{1F357}',slot:null,heal:8,dogOk:true,desc:'The only snack Nara will eat. Humans can have some too. Technically.'},
  naraball:{name:'Slobbery Tennis Ball',icon:'\u{1F3BE}',slot:'Held',desc:'Nara dropped it at Tom\u2019s feet the second she saw him. It is very wet. It is a gift.',bonus:{Luck:2,Charm:1}}
};
const souvenirs={bakery:'roll',library:'bookmark',greenhouse:'sprout',post:'stamp',tea:'biscuit',observatory:'scrap',home:'fridgephoto',amyhouse:'drawing',grands:'pepper'};
let coins=25;
const bag=['sunhat','notebook','pebble','button','sweater','beanie'];
function makeMember(o) { return Object.assign({level:1,xp:0,next:12,wins:0,guard:false},o); }
const hero=makeMember({id:'tom',name:'Tom',title:'Uncle',hp:12,maxHp:12,mp:10,maxMp:10,power:3,
  base:{Curiosity:3,Charm:3,Pace:2,Luck:1},
  equipment:{Head:null,Body:'shirt',Legs:'trousers',Feet:'shoes',Held:null},
  commands:['attack','defend','item','run'],
  look:{hair:'#6b4a33',skin:'#efbc8e',shirt:'#262630'}});
const grace=makeMember({id:'grace',name:'Grace',title:'Niece, age 9',hp:9,maxHp:9,mp:12,maxMp:12,power:2,
  base:{Curiosity:4,Charm:3,Pace:3,Luck:2},
  equipment:{Head:null,Body:'gtee',Legs:'gpants',Feet:'gsneak',Held:null},
  commands:['attack','dance','item','run'],
  look:{hair:'#c08a3e',hairHi:'#dcae5b',skin:'#e9b48c',shirt:'#c9b3e6',pants:'#3b3650',shoes:'#e8e8f0',height:14}});
const rose=makeMember({id:'rose',name:'Rose',title:'Niece, age 6',hp:7,maxHp:7,mp:14,maxMp:14,power:1,
  base:{Curiosity:5,Charm:4,Pace:2,Luck:3},
  equipment:{Head:'rclip',Body:'rdress',Legs:null,Feet:'rshoes',Held:null},
  commands:['attack','silly','item','run'],
  look:{hair:'#a06d38',hairHi:'#bf8a4c',skin:'#d9a070',shirt:'#f3d872',pants:null,shoes:'#e58bb6',height:12,dress:true,clip:'#d94a4a'}});
// Loved ones who can be recruited into the fourth slot, one at a time.
const amy=makeMember({id:'amy',name:'Amy',title:'Sister, the girls\u2019 mom',hp:11,maxHp:11,mp:12,maxMp:12,power:3,
  base:{Curiosity:2,Charm:3,Pace:4,Luck:2},
  equipment:{Head:null,Body:null,Legs:null,Feet:null,Held:null},
  commands:['attack','pep','item','run'],
  look:{hair:'#c9823f',skin:'#efbc8e',shirt:'#4e81a3'}});
const deedee=makeMember({id:'deedee',name:'Deedee',title:'Grandma',hp:10,maxHp:10,mp:16,maxMp:16,power:2,
  base:{Curiosity:3,Charm:4,Pace:1,Luck:3},
  equipment:{Head:null,Body:null,Legs:null,Feet:null,Held:null},
  commands:['attack','hug','item','run'],
  look:{hair:'#ab7a47',skin:'#efbc8e',shirt:'#253b4a'}});
const boppy=makeMember({id:'boppy',name:'Boppy',title:'Grandpa',hp:14,maxHp:14,mp:8,maxMp:8,power:4,
  base:{Curiosity:2,Charm:2,Pace:1,Luck:2},
  equipment:{Head:null,Body:null,Legs:null,Feet:null,Held:null},
  commands:['attack','grumble','item','run'],
  look:{hair:'#525053',skin:'#efbc8e',shirt:'#203440'}});
const tnb=makeMember({id:'tnb',name:'TNB',title:'Tom\u2019s boyfriend',hp:12,maxHp:12,mp:12,maxMp:12,power:3,
  base:{Curiosity:3,Charm:4,Pace:2,Luck:2},
  equipment:{Head:null,Body:null,Legs:null,Feet:null,Held:null},
  commands:['attack','wardrobe','item','run'],
  look:{hair:'#795338',skin:'#f7ad7c',shirt:'#213d53'}});
// Nara: cousin Olivia's Labradoodle (Olivia, Michael, Lachlan 4, Isla 1). 40 pounds, seven years old, all energy.
// Picky eater (only dogOk items), separation anxiety (fiercer when Tom is down), pees when she gets too excited.
const nara=makeMember({id:'nara',name:'Nara',title:'Cousin Olivia\u2019s dog',hp:11,maxHp:11,mp:12,maxMp:12,power:3,
  base:{Curiosity:4,Charm:5,Pace:5,Luck:2},
  equipment:{Head:null,Body:null,Legs:null,Feet:null,Held:null},
  commands:['attack','puppy','item','run'],
  look:{hair:'#2a2424',skin:'#2a2424',shirt:'#2a2424'}});
const RECRUITS={amy,deedee,boppy,tnb,nara};
const party=[hero,grace,rose];
const PARTY_MAX=4;
const inParty=m=>party.includes(m);
// Attack menus: a free basic move, three starting specials, and one new move learned at each of levels 2-5.
const ATTACKS={
  tom:[{key:'mash',name:'Button Mash',mp:0,mult:1},{key:'starter',name:'Starter Splash',mp:3,mult:1.3},{key:'flashcard',name:'Flashcard Flurry',mp:4,mult:1.5},{key:'unbox',name:'Unboxing',mp:5,mult:1.7},
       {key:'dutch',name:'Dutch Oven',mp:6,mult:2.0,lvl:2},{key:'kanji',name:'Kanji Strike',mp:7,mult:2.3,lvl:3},{key:'delta',name:'Delta One',mp:8,mult:2.6,lvl:4},{key:'finalboss',name:'Final Boss',mp:10,mult:3.2,lvl:5}],
  grace:[{key:'cartwheel',name:'Cartwheel',mp:0,mult:1},{key:'squishy',name:'Squishy Squeeze',mp:3,mult:1.3},{key:'polish',name:'Glitter Nails',mp:4,mult:1.5},{key:'runway',name:'Runway Walk',mp:5,mult:1.7},
       {key:'dancebattle',name:'Dance Battle',mp:6,mult:2.0,lvl:2},{key:'subscribe',name:'Like and Subscribe',mp:7,mult:2.3,lvl:3},{key:'beam',name:'Beam Dismount',mp:8,mult:2.6,lvl:4},{key:'perfect10',name:'Perfect 10',mp:10,mult:3.2,lvl:5}],
  amy:[{key:'basic',name:'Sprint Tackle',mp:0,mult:1},{key:'burpee',name:'Burpee Blitz',mp:3,mult:1.3},{key:'finish',name:'Finish Line',mp:4,mult:1.5},{key:'redpen',name:'Red Pen',mp:5,mult:1.7},
       {key:'hills',name:'Hill Repeats',mp:6,mult:2.0,lvl:2},{key:'quiz',name:'Pop Quiz',mp:7,mult:2.2,lvl:3},{key:'marathon',name:'Marathon',mp:8,mult:2.6,lvl:4},{key:'pb',name:'Personal Best',mp:10,mult:3.2,lvl:5}],
  deedee:[{key:'basic',name:'Spit Shine',mp:0,mult:1},{key:'walk',name:'Power Walk',mp:3,mult:1.3},{key:'nurse',name:'Registered Nut',mp:4,mult:1.5},{key:'mop',name:'Wet Floor',mp:5,mult:1.7},
       {key:'crisp',name:'Rhubarb Crisp',mp:6,mult:2.0,lvl:2},{key:'wine',name:'Wine O\u2019Clock',mp:7,mult:2.3,lvl:3},{key:'dinner',name:'Sunday Dinner',mp:8,mult:2.6,lvl:4},{key:'moonshot',name:'To the Moon & Back',mp:10,mult:3.2,lvl:5}],
  boppy:[{key:'basic',name:'Cap Swat',mp:0,mult:1},{key:'cast',name:'Cast Line',mp:3,mult:1.3},{key:'pepper',name:'Pepper Breath',mp:4,mult:1.5},{key:'recliner',name:'Recliner Drop',mp:5,mult:1.7},
       {key:'hotpepper',name:'Hot Pepper',mp:6,mult:2.0,lvl:2},{key:'bigcatch',name:'Big Catch',mp:7,mult:2.3,lvl:3},{key:'ghost',name:'Ghost Pepper',mp:8,mult:2.6,lvl:4},{key:'gotaway',name:'The One That Got Away',mp:10,mult:3.2,lvl:5}],
  tnb:[{key:'basic',name:'Mug Toss',mp:0,mult:1},{key:'carve',name:'Carve',mp:3,mult:1.3},{key:'quickchange',name:'Quick Change',mp:4,mult:1.5},{key:'metro',name:'Next Stop',mp:5,mult:1.7},
       {key:'jumpscare',name:'Jump Scare',mp:6,mult:2.0,lvl:2},{key:'kiln',name:'Kiln Blast',mp:7,mult:2.3,lvl:3},{key:'bomb',name:'Bomb the Hill',mp:8,mult:2.6,lvl:4},{key:'wrap',name:'That\u2019s a Wrap',mp:10,mult:3.2,lvl:5}],
  nara:[{key:'basic',name:'Jump Up',mp:0,mult:1},{key:'fetch',name:'Fetch',mp:3,mult:1.3},{key:'zoomies',name:'Zoomies',mp:4,mult:1.5},{key:'puddle',name:'Happy Puddle',mp:5,mult:1.7},
       {key:'tug',name:'Tug of War',mp:6,mult:2.0,lvl:2},{key:'shake',name:'Wet Dog Shake',mp:7,mult:2.3,lvl:3},{key:'howl',name:'Lonely Howl',mp:8,mult:2.6,lvl:4},{key:'squirrel',name:'SQUIRREL!',mp:10,mult:3.2,lvl:5}],
  rose:[{key:'boop',name:'Boop',mp:0,mult:1},{key:'peekaboo',name:'Peekaboo',mp:3,mult:1.3},{key:'twirl',name:'Twirl Tornado',mp:4,mult:1.5},{key:'lamby',name:'Lamby Launch',mp:5,mult:1.7},
       {key:'pounce',name:'Piggyback Pounce',mp:6,mult:2.0,lvl:2},{key:'dressup',name:'Dress-Up Day',mp:7,mult:2.3,lvl:3},{key:'bedtime',name:'Monster Under the Bed',mp:8,mult:2.6,lvl:4},{key:'stampede',name:'Lamby Stampede',mp:10,mult:3.2,lvl:5}]
};
const knownAttacks=m=>ATTACKS[m.id].filter(a=>!a.lvl||a.lvl<=m.level);
const alive=m=>m.hp>0;
let menuOpen=false,menuTab='inventory',menuChar=0,menuSlot=null;

function statBonus(m,stat) {
  let total=0;
  for(const slot of SLOTS) {
    const id=m.equipment[slot];
    if(id&&items[id].bonus&&items[id].bonus[stat]) total+=items[id].bonus[stat];
  }
  return total;
}
const statTotal=(m,s)=>m.base[s]+statBonus(m,s);

function bonusText(item) {
  const parts=item.bonus?Object.entries(item.bonus).map(([k,v])=>'+'+v+' '+k):[];
  if(item.def) parts.push('+'+item.def+' Guard');
  const fx=effectText(item);
  if(fx) parts.push(fx);
  return parts.join(', ');
}
// What a usable item does, in plain words.
function effectText(item) {
  if(item.heal) return 'Heals '+item.heal+' HP';
  if(item.healAll) return 'Heals everyone '+item.healAll+' HP';
  if(item.mp) return 'Restores '+item.mp+' MP';
  if(item.revive) return 'Revives a fallen member at half HP';
  if(item.dmg) return 'Battle: '+item.dmg+' damage';
  if(item.confuse) return 'Battle: confuses the enemy';
  if(item.atkDown) return 'Battle: enemy attack down';
  if(item.pep) return 'Battle: everyone\u2019s next hit +50%';
  return '';
}
const battleUsable=item=>!!(item.heal||item.healAll||item.mp||item.revive||item.dmg||item.confuse||item.atkDown||item.pep);
const fieldUsable=item=>!!(item.heal||item.healAll||item.mp||item.revive);
// Selling pays half the shop price. Family things have no price and cannot be sold.
const sellValue=item=>item.price?Math.max(1,Math.floor(item.price/2)):(item.sell||0);
const canWear=(m,item)=>!item.who||item.who===m.id;
const memberById=id=>({tom:hero,grace,rose,amy,deedee,boppy,tnb,nara})[id];
// Guard: worn items soak this much of each hit.
function defTotal(m) {
  let total=0;
  for(const slot of SLOTS) { const id=m.equipment[slot]; if(id&&items[id].def) total+=items[id].def; }
  return total;
}
// Equip from the pockets onto the menu character's slot. Whatever was worn there goes back in the pockets.
function equipTo(m,id) {
  const item=items[id],idx=bag.indexOf(id);
  if(!item||!item.slot||idx<0||!canWear(m,item)) return false;
  bag.splice(idx,1);
  const previous=m.equipment[item.slot];
  if(previous) bag.push(previous);
  m.equipment[item.slot]=id;
  return true;
}

function equipItem(id) {
  const m=party[menuChar],item=items[id];
  if(!item.slot) {
    sfx.nope();
    if(fieldUsable(item)) { useFieldItem(m,id); return; }
    showToast(item.name+' is not something you can wear. Or is it. No.',2.2);
    return;
  }
  if(!canWear(m,item)) {
    sfx.nope();
    showToast(item.name+' is made for '+memberById(item.who).name+'. It would not fit '+m.name+'.',2.4);
    return;
  }
  if(!equipTo(m,id)) return;
  sfx.equip();
  menuSlot=null;
  showToast(m.name+' puts on '+item.name+'.',1.8);
  renderMenu();
}

// Healing items can be used from the menu on the selected member (or the whole party).
function useFieldItem(m,id) {
  const item=items[id],idx=bag.indexOf(id);
  if(idx<0) return;
  let msg='';
  if(m.id==='nara'&&(item.heal||item.mp)&&!item.dogOk) { sfx.nope(); showToast('Nara sniffs the '+item.name+', looks at Tom, and walks away. Picky. She only eats Chicken Jerky.',2.8); return; }
  if(item.revive) {
    if(m.hp>0) { sfx.nope(); showToast(m.name+' is awake already. Save it for an emergency.',2.2); return; }
    m.hp=Math.ceil(m.maxHp/2); msg=m.name+' sits up. "I am fine. I was resting."';
  } else if(item.healAll) {
    if(!party.some(p=>p.hp>0&&p.hp<p.maxHp)) { sfx.nope(); showToast('Everyone is already full. Save the picnic.',2.2); return; }
    for(const p of party) if(p.hp>0) p.hp=Math.min(p.maxHp,p.hp+item.healAll);
    msg='Picnic time. Everyone feels better.';
  } else if(item.mp) {
    if(m.mp>=m.maxMp) { sfx.nope(); showToast(m.name+' already has full MP.',2); return; }
    const g=Math.min(item.mp,m.maxMp-m.mp); m.mp+=g; msg=m.name+' has the '+item.name+'. +'+g+' MP.';
  } else {
    if(m.hp<=0) { sfx.nope(); showToast(m.name+' is knocked out. A Wake-Up Whistle would help.',2.4); return; }
    if(m.hp>=m.maxHp) { sfx.nope(); showToast(m.name+' is already at full HP.',2); return; }
    const g=Math.min(item.heal,m.maxHp-m.hp); m.hp+=g; msg=m.name+' has the '+item.name+'. +'+g+' HP.';
  }
  bag.splice(idx,1);
  sfx.heal();
  showToast(msg,2.2);
  renderMenu();
}

function unequipSlot(slot) {
  const m=party[menuChar],id=m.equipment[slot];
  if(!id) return;
  sfx.unequip();
  m.equipment[slot]=null;
  bag.push(id);
  menuSlot=null;
  renderMenu();
}

function grantItem(id) {
  bag.push(id);
  sfx.pickup();
  showToast('Got '+items[id].name+'. It went in a pocket.',2.6);
}

function itemRow(id,tag,onClick,isStatic) {
  const item=items[id];
  const row=document.createElement('button');
  row.type='button';
  row.className='item-row'+(isStatic?' static':'');
  const meta=[item.desc];
  const b=bonusText(item);
  if(b) meta.push(b);
  row.innerHTML='<span class="item-icon">'+item.icon+(item.color?'<i class="swatch" style="background:'+item.color+'"></i>':'')+'</span>'+
    '<span class="item-copy"><span class="item-name"></span><span class="item-meta"></span></span>'+
    (tag?'<span class="item-tag'+(item.slot?'':' muted')+'"></span>':'');
  row.querySelector('.item-name').textContent=item.name;
  row.querySelector('.item-meta').textContent=meta.join(' ');
  if(tag) row.querySelector('.item-tag').textContent=tag;
  if(onClick) row.addEventListener('click',onClick);
  return row;
}

