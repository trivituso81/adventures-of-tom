'use strict';
// data/party.js — Items, party members, recruits, the move tables.
// ---------- Party: stats, equipment, inventory ----------
// Gear (F6, battle-design section 7): three slots. Signature Tool adds POW and WARMTH, Outfit adds HP, GRIT and COOL
// (and its `color` recolors the sprite), Keepsake Charm has a perk (see b6PerkText in engine/progress.js).
// Item fields: slot, stats (flat bonuses to the battle stats), perk, who (only that member), color, hat (shows on the head).
const SLOTS=['Tool','Outfit','Charm'];
const SLOT_LABEL={Tool:'Signature Tool',Outfit:'Outfit',Charm:'Keepsake Charm',Sash:'Birthday Sash'};
const SLOT_SHORT={Tool:'TOOL',Outfit:'OUTFIT',Charm:'CHARM',Sash:'SASH'};
// A member can carry extra slots (m.extraSlots, e.g. Grace's Birthday Sash after the Nine Scoops bonus chapter).
const wearSlots=m=>m&&m.extraSlots&&m.extraSlots.length?SLOTS.concat(m.extraSlots):SLOTS;
// The six battle stats (B2_STAT_KEYS in data/battle2-data.js, which loads later).
const STAT_NAMES=['hp','pow','grit','warmth','cool','pep'];
const STAT_LABEL={hp:'HP',pow:'POW',grit:'GRIT',warmth:'WARMTH',cool:'COOL',pep:'PEP'};
const items={
  sunhat:{price:12,name:'Straw Sunhat',icon:'\u{1F452}',slot:'Charm',desc:'Keeps the sun off and the thoughts in.',perk:{stat:{cool:.1}},hat:'#dac487'},
  shirt:{price:10,name:'Sunny Shirt',icon:'\u{1F455}',slot:'Outfit',desc:'Yellow enough to be seen from the Moon Club.',stats:{hp:8,grit:1,cool:1}},
  trousers:{price:10,name:'Pocket Trousers',icon:'\u{1F456}',slot:'Outfit',desc:'Four pockets. Three of them are useful.',stats:{hp:8,grit:2}},
  shoes:{price:10,name:'Walking Shoes',icon:'\u{1F45F}',slot:'Charm',desc:'Broken in by a previous owner. Thanks, previous owner.',perk:{stat:{pep:.05}}},
  notebook:{price:14,name:'Pocket Notebook',icon:'\u{1F4D3}',slot:'Tool',desc:'Every page says "ask Dot about windows."',stats:{pow:1,warmth:2}},
  pebble:{price:8,name:'Smooth Pebble',icon:'\u{1FAA8}',slot:'Charm',desc:'Pip would like you to know it\'s not a pet.',perk:{crit:.05}},
  button:{sell:1,name:'Spare Button',icon:'\u{1F518}',slot:null,desc:'From something. Possibly a coat. Possibly a future coat.'},
  roll:{price:8,name:'Warm Roll',icon:'\u{1F956}',slot:null,heal:48,desc:'Souvenir from Crumb Bakery. Emotionally available.'},
  bookmark:{price:14,name:'Overdue Bookmark',icon:'\u{1F516}',slot:'Tool',desc:'Souvenir from The Hush Library. It knows where you were.',stats:{warmth:3}},
  sprout:{name:'Steve (a sprout)',icon:'\u{1F331}',slot:null,desc:'Souvenir from Sprout House. Requests a corner office.'},
  stamp:{sell:3,name:'Potato Stamp',icon:'\u{1F954}',slot:null,desc:'Souvenir from Snail Mail. First-class taste.'},
  biscuit:{price:10,name:'Dramatic Biscuit',icon:'\u{1F36A}',slot:null,heal:64,desc:'Souvenir from Kettle Cottage. Dares you to dunk it.'},
  scrap:{price:14,name:'Star Chart Scrap',icon:'\u{2B50}',slot:'Charm',desc:'Souvenir from Moon Club. Worn as a very small hat.',perk:{startVp:1},hat:'#f5d389'},
  gtee:{price:10,name:'Lavender Tee',icon:'\u{1F45A}',slot:'Outfit',desc:'Soft, purple, slightly glittery. Grace approves.',stats:{hp:8,cool:2}},
  gpants:{price:10,name:'Flower Pants',icon:'\u{1F338}',slot:'Outfit',desc:'Black with tiny flowers. Grass stains optional.',stats:{hp:8,grit:1,cool:1}},
  gsneak:{price:10,name:'Purple Sneakers',icon:'\u{1F45F}',slot:'Charm',desc:'Light-up soles. The lights are for intimidation.',perk:{stat:{pep:.05}}},
  rclip:{price:8,name:'Red Hair Clip',icon:'\u{1F380}',slot:'Charm',desc:'Keeps the hair out of the eyes, mostly.',perk:{crit:.05},hat:'rclip'},
  rdress:{price:12,name:'Gingham Dress',icon:'\u{1F457}',slot:'Outfit',desc:'Yellow check. Twirls at a professional level.',stats:{hp:8,cool:2}},
  rshoes:{price:10,name:'Pink Shoes',icon:'\u{1F45F}',slot:'Charm',desc:'Fast. Allegedly.',perk:{stat:{pep:.05}}},
  bcap:{name:"Boppy's Cap",icon:'\u{1F9E2}',slot:'Charm',desc:'Grey, broken in, smells faintly of the garage. For luck.',perk:{stat:{grit:.1}},hat:'bcap'},
  cookie:{name:"Deedee's Cookie",icon:'\u{1F36A}',slot:null,heal:56,desc:'Still warm.'},
  fridgephoto:{name:'Fridge Photo',icon:'\u{1F5BC}',slot:null,desc:'The whole family at the pond, before the Grump. Tom is blinking.'},
  drawing:{name:"Rose's Drawing",icon:'\u{1F58D}',slot:'Charm',desc:'Tata fighting a green blob. Grace added a sword. Rose added glitter.',perk:{heart:10}},
  pepper:{name:"Boppy's Pepper",icon:'\u{1F336}',slot:'Charm',desc:'Don\'t eat it. Holding it makes you braver, somehow.',perk:{stat:{pow:.1}}},
  jacket:{name:"TNB's Jacket",icon:'\u{1F9E5}',slot:'Outfit',color:'#9ea3ab',desc:'Soft grey, slightly too big, smells like home. Warm enough to be brave in.',stats:{hp:20,grit:3,cool:4}},
  sweater:{name:'Lucky Red Sweater',icon:'\u{1F9F6}',slot:'Outfit',color:'#c43e3e',desc:'Deedee knit it in a weekend. It\'s never lost.',stats:{hp:16,grit:2,cool:3}},
  hoodie:{sell:15,name:'Pond Hoodie',icon:'\u{1F9E5}',slot:'Outfit',color:'#3f8f6e',desc:'The Grump dropped it. It smells like the pond. He wants it back.',stats:{hp:18,grit:4,cool:1}},
  beanie:{price:16,name:'Moon Beanie',icon:'\u{1F9E2}',slot:'Charm',color:'#3a4a8a',desc:'Navy with one star. Keeps big ideas warm.',perk:{stat:{warmth:.1}},hat:'beanie'},
  mudpie:{sell:2,name:'Mud Pie',icon:'\u{1F967}',slot:null,heal:32,desc:'Mostly mud. Some pie. Rose insists.'},
  honey:{sell:6,name:'Swamp Honey',icon:'\u{1F36F}',slot:null,heal:72,desc:'The skeeters were guarding it. Sticky, sweet, slightly buzzy.'},
  lilyhat:{sell:20,name:'Lily Pad Hat',icon:'\u{1FAB7}',slot:'Charm',color:'#5b8a4a',desc:'Slid off a Bog Toad. Still damp. Grace says it\'s a crown.',perk:{regen:.05}},
  // Chapter 3 drops (Cattail Pier and the Whispering Marsh, data/marsh-monsters.js).
  dampsock:{sell:1,name:'Damp Sock',icon:'\u{1F9E6}',slot:null,desc:'A lone sock from the marsh. It\'s not dry. It\'ll never be dry.'},
  luckybobber:{sell:16,name:'Lucky Bobber',icon:'\u{1F534}',slot:'Charm',color:'#d94a3a',desc:'A little red float. It ducks at the right moment. So do you.',perk:{evade:.06}},
  fishline:{sell:14,name:'Spool of Line',icon:'\u{1F9F5}',slot:'Charm',desc:'Twenty yards of fishing line, somehow not tangled. Nothing slows you down.',perk:{immune:['slow']}},
  driftwood:{sell:15,name:'Driftwood Stick',icon:'\u{1FAB5}',slot:'Tool',desc:'Smooth from years in the marsh. Good for poking. Better for bonking.',stats:{pow:5,warmth:2}},
  pepperjar:{name:'Boppy’s Pepper Jar',icon:'\u{1FAD9}',slot:null,keepsake:true,desc:'Homegrown, pickled, and older than Amy. Still sealed. Still hot.'},
  oldcoin:{name:'Old Gold Coin',icon:'\u{1FA99}',slot:null,keepsake:true,desc:'Found wedged in the sundial. Heavy, worn smooth, and stamped with a little clock face. Somebody wants these.'},
  // Chapter 4 drops (the studio lot, data/backlot-monsters.js) and rewards.
  callsheet:{sell:2,name:'Call Sheet',icon:'\u{1F4C4}',slot:null,desc:'Call time 4 AM. Lunch at 1 PM. Wrap: TBD. It\'s always TBD.'},
  windsock:{sell:16,name:'Fuzzy Windscreen',icon:'\u{1F3A4}',slot:'Charm',desc:'The fluffy cover off a boom mic. Muffles the noise. Nothing can shush you.',perk:{immune:['silenced','shushed']}},
  slate:{sell:15,name:'Chalk Slate',icon:'\u{1F3AC}',slot:'Tool',desc:'Scene one, take one. It still has a little chalk on it.',stats:{pow:5,warmth:3}},
  fogjuice:{sell:5,name:'Fog Juice',icon:'\u{1F9EA}',slot:null,vp:4,desc:'For fog machines. Tastes like grape soda and regret. Somehow restores 4 VP.'},
  cuecards:{sell:14,name:'Cue Cards',icon:'\u{1F4DD}',slot:'Charm',desc:'The top one says YOU ARE DOING GREAT. Neat handwriting.',perk:{stat:{warmth:.1}}},
  n_steamer:{who:'tnb',name:'Golden Garment Steamer',icon:'\u{2668}',slot:'Tool',desc:'The studio gave it to TNB at the wrap party. Gold-plated. It steams wrinkles AND attitudes.',stats:{pow:4,warmth:7}},
  wrapjacket:{name:'Wrap Party Jacket',icon:'\u{1F9E5}',slot:'Outfit',color:'#7a4ab0',desc:'Purple satin. BACKLOT BEDLAM on the back. Only the crew got one. And now you.',stats:{hp:24,grit:3,cool:5}},
  // Chapter 5 drops (Long Island Elementary, data/school-monsters.js) and rewards.
  quizsheet:{sell:2,name:'Pop Quiz Page',icon:'\u{1F4C4}',slot:null,desc:'Nine questions. Every answer is C. Question ten just says WHY.'},
  hallpass:{sell:16,name:'Hall Pass',icon:'\u{1F3AB}',slot:'Charm',desc:'Laminated. Signed by Principal Pruitt in 1994. Nobody can make you late.',perk:{immune:['tardy','slow']}},
  gluestick:{sell:15,name:'Glitter Glue Cap',icon:'\u{2728}',slot:'Charm',desc:'Still a little sticky. You stick around a little longer, too.',perk:{regen:.05}},
  dodgeitem:{sell:8,name:'Red Rubber Ball',icon:'\u{1F534}',slot:null,dmg:72,desc:'The one from gym class. Thrown with love and a lot of spin. Never misses.'},
  a_stopwatch:{who:'amy',name:'Golden Stopwatch',icon:'\u{23F1}',slot:'Tool',desc:'Principal Pruitt’s own. Thirty-one Field Days. It\'s never once stopped early.',stats:{pow:5,warmth:6}},
  fielddaytee:{name:'Field Day Tee',icon:'\u{1F455}',slot:'Outfit',color:'#2f8a5a',desc:'GO SNAILS! on the front. FIELD DAY STAFF on the back. Amy has eleven of these.',stats:{hp:28,grit:4,cool:4}},
  // Chapter 6 drops (Old Oak Park and the Old Oak, data/oak-monsters.js) and rewards.
  acorn:{sell:1,name:'Marked Acorn',icon:'\u{1F330}',slot:null,heal:24,desc:'An acorn with a tiny X carved in it. Evidence. Also a snack, technically.'},
  sapjar:{sell:5,name:'Jar of Sap',icon:'\u{1F36F}',slot:null,vp:3,desc:'Very slow. Very sweet. Somehow restores 3 VP. Don\'t ask how.'},
  peanuts:{sell:3,name:'Bag of Peanuts',icon:'\u{1F95C}',slot:null,healAll:40,desc:'Unsalted. Pass the bag around: everyone gets some. Nobody boos.'},
  binoculars:{sell:16,name:'Tiny Binoculars',icon:'\u{1F52D}',slot:'Charm',desc:'Standard issue for Twig Spies. You see every opening.',perk:{crit:.08}},
  cheekpouch:{sell:15,name:'Cheek Pouch',icon:'\u{1F45D}',slot:'Charm',desc:'For winter. You always save a little energy for later.',perk:{startVp:1}},
  y_goldball:{who:'nara',name:'Golden Tennis Ball',icon:'\u{1F3BE}',slot:'Tool',desc:'Lachlan painted it gold. It took four days and most of a bottle. Nara won\'t let go of it.',stats:{pow:6,warmth:4}},
  watchvest:{name:'Neighborhood Watch Vest',icon:'\u{1F9BA}',slot:'Outfit',color:'#e8843a',desc:'Reflective orange. WATCH on the back. Bernadette gives one out every nineteen years.',stats:{hp:30,grit:4,cool:5}},
  bready:{name:'Bready Mercury',icon:'\u{1FAD9}',slot:null,keepsake:true,desc:'Tom’s sourdough starter. Nine years old. Flew Delta One twice. Got kidnapped by squirrels once. Extremely sour about it.'},
  // Chapter 7 drops (the Stacks under the Hush Library, data/library-monsters.js) and rewards.
  tassel:{sell:2,name:'Bookmark Tassel',icon:'\u{1F9F6}',slot:null,desc:'Off a Shusher. Hold it to your ear and it whispers: page forty-one.'},
  flatpage:{sell:5,name:'Pressed Page',icon:'\u{1F4C3}',slot:null,vp:3,desc:'Ironed flat under a dictionary. Smells like an old book. Somehow restores 3 VP.'},
  sequel:{sell:16,name:'The Sequel',icon:'\u{1F4D7}',slot:'Charm',desc:'Nobody has ever read it. You always want to know what happens next.',perk:{stat:{cool:.1}}},
  readglasses:{sell:16,name:'Reading Glasses',icon:'\u{1F453}',slot:'Charm',desc:'Volume K’s own. You see right through every "well, actually."',perk:{immune:['gritdown','dizzy']}},
  popcard:{sell:8,name:'Pop-Up Card',icon:'\u{1F4EE}',slot:null,dmg:76,desc:'Open it at an enemy. A paper dragon jumps out. BOO. Never misses.'},
  g_librarycard:{who:'grace',name:'Gold Library Card',icon:'\u{1F4B3}',slot:'Tool',desc:'Page made it for Grace. No limit. No late fees. Ever. It has her signature in glitter pen.',stats:{pow:6,warmth:6}},
  hushsweater:{name:'Hush Library Sweater',icon:'\u{1F9E5}',slot:'Outfit',color:'#8d7293',desc:'Purple, a little itchy, SHHH on the front. Page knits one every winter. There are boxes of them.',stats:{hp:32,grit:4,cool:6}},
  // Chapter 8 drops (the Car Barn, data/barn-monsters.js) and rewards.
  tepidcoffee:{sell:2,name:'Lukewarm Coffee',icon:'\u{2615}',slot:null,vp:3,desc:'Not hot. Not cold. Somehow restores 3 VP anyway.'},
  leftovers:{sell:4,name:'Leftover Lasagna',icon:'\u{1F961}',slot:null,heal:60,desc:'The label says WED. It\'s actually very good. Don\'t ask which Wednesday.'},
  warmblanket:{sell:16,name:'Dry Corner',icon:'\u{1F9E3}',slot:'Charm',desc:'The one dry corner of the Wet Blanket. Warm now. Nothing can chill you.',perk:{immune:['chilled','drowsy']}},
  draftstopper:{sell:16,name:'Draft Stopper',icon:'\u{1F40D}',slot:'Charm',desc:'A long fabric snake for the bottom of a door. You slip past things the same way.',perk:{evade:.07}},
  hotsauce:{sell:8,name:'Hot Sauce Packet',icon:'\u{1F336}',slot:null,dmg:80,desc:'The Picky Eater wouldn\'t touch it. Thrown at an enemy, it never misses.'},
  t_peel:{who:'tom',name:'Ironbelly’s Bread Peel',icon:'\u{1F956}',slot:'Tool',desc:'A long wooden peel, worn smooth by fifty years of night-crew biscuits. Old Ironbelly wants Tom to have it.',stats:{pow:6,warmth:7}},
  motorcoat:{name:'Motorman’s Coat',icon:'\u{1F9E5}',slot:'Outfit',color:'#2f3f6a',desc:'Navy wool, brass buttons, a 7 LINE pin. Mr. Washington’s father wore it on the night run.',stats:{hp:34,grit:5,cool:5}},
  // Chapter 9 drops (the Moon Club, data/club-monsters.js) and rewards.
  velvetbow:{sell:2,name:'Velvet Bow',icon:'\u{1F380}',slot:null,desc:'Off a Velvet Rope. Very fancy. Not on the list.'},
  cufflink:{sell:5,name:'Moon Cufflink',icon:'\u{1F319}',slot:null,vp:3,desc:'Silver, with a little moon on it. Somehow restores 3 VP. Very formal VP.'},
  coatticket:{sell:16,name:'Claim Ticket No. 7',icon:'\u{1F39F}',slot:'Charm',desc:'From the Moon Club coat check. Nobody can make you let go of anything.',perk:{immune:['slow','snubbed']}},
  luckychip:{sell:16,name:'Lucky Chip',icon:'\u{1FA99}',slot:'Charm',desc:'The Sore Loser’s. It never once worked for him. It works for you.',perk:{crit:.08}},
  corsage:{sell:16,name:'Wallflower Corsage',icon:'\u{1F338}',slot:'Charm',desc:'It blushed the whole time it was handing it over. Kindness comes easier.',perk:{stat:{warmth:.1}}},
  d_compact:{who:'deedee',name:'Moonlit Compact',icon:'\u{1FA9E}',slot:'Tool',desc:'Deedee’s old powder compact, with one little mirror from the Mirrorball set in the lid. It still catches the moon.',stats:{pow:5,warmth:8}},
  velvetcoat:{name:'Moon Club Velvet Coat',icon:'\u{1F9E5}',slot:'Outfit',color:'#6a3a8a',desc:'Purple velvet, 1971, claim ticket 7. Aunt Ellie left it at the last dance. It never fit her after 1972.',stats:{hp:36,grit:5,cool:6}},
  // Chapter 10: Terminal Zero.
  pretzels:{sell:3,name:'Airplane Pretzels',icon:'\u{1F968}',slot:null,heal:60,desc:'One tiny bag, from 1989. Still crunchy. Somehow.'},
  coldbrew:{sell:4,name:'Cold Brew',icon:'\u{2615}',slot:null,vp:3,desc:'Left behind by a Jet Lag. Restores 3 VP. Tastes like a red-eye.'},
  prioritytag:{sell:16,name:'Priority Tag',icon:'\u{1F3F7}',slot:'Charm',desc:'From the Long Line. Nobody makes you wait. Nobody makes you sleepy.',perk:{immune:['slow','drowsy']}},
  bagtag:{sell:16,name:'Old Luggage Tag',icon:'\u{1F9F3}',slot:'Charm',desc:'From the Unclaimed. It says LONG ISLAND in 1989 handwriting. Somebody always comes back for you.',perk:{regen:.05}},
  eyemask:{sell:16,name:'Lounge Eye Mask',icon:'\u{1F634}',slot:'Charm',desc:'The Armrest Hog’s spare. Well rested. Every fight starts with +2 VP.',perk:{startVp:2}},
  r_wings:{who:'rose',name:'Junior Pilot Wings',icon:'\u{1F6E9}',slot:'Tool',desc:'Gold plastic wings from Gate Zero, for the smallest passenger in Group Zero. Rose wears them upside down. On purpose.',stats:{pow:5,warmth:7}},
  zeropjs:{name:'Lie-Flat Pajamas',icon:'\u{1F97C}',slot:'Outfit',color:'#3a4a7a',desc:'Navy, with a little gold 0 on the pocket. From the Gate Zero lounge. Tom has opinions about pajamas. These pass.',stats:{hp:38,grit:6,cool:6}},
  barkslab:{sell:15,name:'Bark Slab',icon:'\u{1FAB5}',slot:'Tool',desc:'Came off a Log Lump. Heavy, mossy, and surprisingly good at stopping things.',stats:{pow:5}},
  lure:{name:"Boppy's Lost Lure",icon:'\u{1FA9D}',slot:'Charm',desc:'Twenty years in a fish\u2019s lip. Still shiny. Boppy will want to hear about this.',perk:{coins:.25}},
  juice:{price:6,name:'Juice Box',icon:'\u{1F9C3}',slot:null,heal:40,desc:'From the bottom of Amy\'s bag. There\'s always one more.'},
  // ---- Penny's Pockets stock: healing ----
  bandage:{price:15,name:'Dino Bandage',icon:'\u{1FA79}',slot:null,heal:96,desc:'Has a T. rex on it. Rose says that makes it work faster. Rose is right.'},
  picnic:{price:26,name:'Picnic Basket',icon:'\u{1F9FA}',slot:null,healAll:48,desc:'Sandwiches for everyone. Somebody always gets the squished one.'},
  lemonade:{price:9,name:'Fizzy Lemonade',icon:'\u{1F964}',slot:null,vp:3,desc:'Bubbles go up the nose, ideas go up the brain.'},
  cocoa:{price:18,name:'Hot Cocoa',icon:'☕',slot:null,vp:6,desc:'Three marshmallows. Non-negotiable. Fully restores your will to try.'},
  whistle:{price:30,name:'Wake-Up Whistle',icon:'\u{1F4E2}',slot:null,revive:true,desc:'One blast and a fallen friend is back on their feet, grumpy but fine.'},
  // ---- Penny's Pockets stock: battle ----
  balloon:{price:12,name:'Water Balloon',icon:'\u{1F388}',slot:null,dmg:64,desc:'Thrown with love and terrible aim. Never misses, somehow.'},
  popper:{price:22,name:'Party Popper',icon:'\u{1F389}',slot:null,dmg:120,desc:'Confetti at very high speed. Monsters hate a celebration.'},
  cushion:{price:16,name:'Whoopee Cushion',icon:'\u{1F4A8}',slot:null,confuse:true,desc:'Nobody can concentrate after that. Nobody.'},
  kazoo:{price:14,name:'Kazoo',icon:'\u{1F3BA}',slot:null,atkDown:true,desc:'One long note. The monster loses its will to hit hard.'},
  goldstar:{price:18,name:'Gold Star Sticker',icon:'\u{1F31F}',slot:null,pep:true,desc:'From Amy’s classroom stash. Everyone stands up straighter.'},
  // ---- Gear made for one person (who) ----
  t_headphones:{who:'tom',price:20,name:'Retro Headphones',icon:'\u{1F3A7}',slot:'Charm',desc:'Plays the boss music on a loop. Only Tom can hear it.',perk:{crit:.1}},
  t_apron:{who:'tom',price:30,name:'Sourdough Apron',icon:'\u{1F35E}',slot:'Outfit',color:'#c9b07a',desc:'Flour in every pocket. Smells like a day three starter.',stats:{hp:20,grit:3,cool:3}},
  t_slippers:{who:'tom',price:24,name:'Lie-Flat Slippers',icon:'\u{1FA74}',slot:'Charm',desc:'Delta One amenity kit. Tom has kept them since 2019.',perk:{startVp:2}},
  t_controller:{who:'tom',price:36,name:'Lucky Controller',icon:'\u{1F3AE}',slot:'Tool',desc:'The A button is worn smooth. It\'s beaten Final Fantasy IV eleven times.',stats:{pow:4,warmth:4}},
  g_headband:{who:'grace',price:18,name:'Sparkle Headband',icon:'\u{1F451}',slot:'Charm',desc:'Glitter falls off it constantly. That\'s the point.',perk:{crit:.1}},
  g_leotard:{who:'grace',price:30,name:'Gym Leotard',icon:'\u{1FA71}',slot:'Outfit',color:'#d65aa0',desc:'Pink and purple. Built for cartwheels. Judges love it.',stats:{hp:16,grit:2,cool:3}},
  g_leggings:{who:'grace',price:16,name:'Glitter Leggings',icon:'✨',slot:'Charm',desc:'Leaves a trail. Grace calls it her signature.',perk:{evade:.08}},
  g_squishy:{who:'grace',price:22,name:'Squishy Keychain',icon:'\u{1F351}',slot:'Tool',desc:'A peach that smells like a peach. Squeezed four hundred times a day.',stats:{pow:2,warmth:4}},
  r_ears:{who:'rose',price:16,name:'Bunny Ears',icon:'\u{1F430}',slot:'Charm',desc:'Makes every jump at least ten percent bouncier.',perk:{evade:.1}},
  r_raincoat:{who:'rose',price:26,name:'Frog Raincoat',icon:'\u{1F438}',slot:'Outfit',color:'#6fbf5a',desc:'Has eyes on the hood. Puddles fear it.',stats:{hp:18,grit:3,cool:2}},
  r_boots:{who:'rose',price:18,name:'Puddle Boots',icon:'\u{1F462}',slot:'Charm',desc:'For jumping in puddles. All puddles. Especially the deep one.',perk:{immune:['drowsy','slow']}},
  r_lamby:{who:'rose',price:24,name:'Mini Lamby',icon:'\u{1F411}',slot:'Tool',desc:'Lamby’s little cousin. Rose says it\'s brave.',stats:{pow:4,warmth:2}},
  a_visor:{who:'amy',price:18,name:'Running Visor',icon:'\u{1F9E2}',slot:'Charm',desc:'Sweat-wicking. Glare-blocking. Excuse-blocking.',perk:{crit:.08}},
  a_singlet:{who:'amy',price:30,name:'Race Day Singlet',icon:'\u{1F3BD}',slot:'Outfit',color:'#e8743b',desc:'Bib still pinned on. She\'s always racing something.',stats:{hp:16,grit:2,cool:2}},
  a_flats:{who:'amy',price:24,name:'Racing Flats',icon:'\u{1F45F}',slot:'Charm',desc:'Weigh less than a juice box. Amy checked.',perk:{stat:{pep:.1}}},
  a_redpen:{who:'amy',price:16,name:'Green Pen',icon:'\u{1F58A}',slot:'Tool',desc:'Circles the good parts first. Even on monsters.',stats:{pow:2,warmth:4}},
  d_hat:{who:'deedee',price:18,name:'Garden Hat',icon:'\u{1F452}',slot:'Charm',desc:'Wide brim, silk flower, one ladybug that lives there now.',perk:{regen:.05}},
  d_apron:{who:'deedee',price:28,name:'Floral Apron',icon:'\u{1F33A}',slot:'Outfit',color:'#e59aa8',desc:'Flour, frosting and forty tomatoes worth of stains.',stats:{hp:18,grit:2,cool:3}},
  d_clogs:{who:'deedee',price:18,name:'Garden Clogs',icon:'\u{1F97F}',slot:'Charm',desc:'Muddy forever. Comfortable forever.',perk:{stat:{grit:.1}}},
  d_mitt:{who:'deedee',price:20,name:'Oven Mitt',icon:'\u{1F9E4}',slot:'Tool',desc:'Four hundred and fifty degrees of protection.',stats:{pow:1,warmth:5}},
  b_hat:{who:'boppy',price:20,name:'Bucket Hat',icon:'\u{1F3A3}',slot:'Charm',desc:'Seven lures hooked in the brim. None of them have caught anything.',perk:{coins:.2}},
  b_vest:{who:'boppy',price:32,name:'Fishing Vest',icon:'\u{1F9BA}',slot:'Outfit',color:'#6b7a4a',desc:'Twelve pockets. Eleven have peppers in them.',stats:{hp:22,grit:4,cool:2}},
  b_shoes:{who:'boppy',price:22,name:'Comfy Sneakers',icon:'\u{1F45E}',slot:'Charm',desc:'Extra arch support. The knee approves. The hip has notes.',perk:{stat:{pep:.1}}},
  b_pad:{who:'boppy',price:26,name:'Heating Pad',icon:'\u{1F525}',slot:'Charm',desc:'Plugged into nothing. Still works. Boppy says it\'s mental.',perk:{regen:.06}},
  n_helmet:{who:'tnb',price:20,name:'Transit Cap',icon:'\u{1F9E2}',slot:'Charm',desc:'Covered in pins from every transit system he\'s ridden. He can name all the lines.',perk:{stat:{pep:.08}}},
  n_apron:{who:'tnb',price:30,name:'Glaze Apron',icon:'\u{1F3FA}',slot:'Outfit',color:'#7f5a44',desc:'Splattered in every glaze color. Cone six approved.',stats:{hp:18,grit:2,cool:4}},
  n_shoes:{who:'tnb',price:24,name:'Skate Shoes',icon:'\u{1F6F9}',slot:'Charm',desc:'Worn through at the toe from braking. He says he never brakes.',perk:{evade:.08}},
  n_lintroller:{who:'tnb',price:18,name:'Lint Roller',icon:'\u{1F9FB}',slot:'Tool',desc:'Wardrobe runner essential. No scene goes out fuzzy.',stats:{pow:2,warmth:4}},
  y_bandana:{who:'nara',price:16,name:'Polka Dot Bandana',icon:'\u{1F9E3}',slot:'Charm',desc:'Tied around her neck. She thinks it makes her look fast. It does.',perk:{stat:{pep:.1}}},
  y_harness:{who:'nara',price:26,name:'Walk Harness',icon:'\u{1F9BA}',slot:'Outfit',desc:'Padded, reflective, and covered in fur no matter how often you clean it.',stats:{hp:16,grit:3,cool:2}},
  y_booties:{who:'nara',price:20,name:'Rain Booties',icon:'\u{1F97E}',slot:'Charm',desc:'She walks like a cartoon horse in them. Very protective, very embarrassing.',perk:{stat:{grit:.1}}},
  y_ball:{who:'nara',price:14,name:'Squeaky Ball',icon:'\u{1F3BE}',slot:'Tool',desc:'Squeaks every time she bites it. Which is constantly.',stats:{pow:4,warmth:1}},
  jerky:{price:6,name:'Chicken Jerky',icon:'\u{1F357}',slot:null,heal:64,dogOk:true,desc:'The only snack Nara will eat. Humans can have some too. Technically.'},
  naraball:{name:'Slobbery Tennis Ball',icon:'\u{1F3BE}',slot:'Charm',desc:'Nara dropped it at Tom\u2019s feet the second she saw him. It\'s very wet. It\'s a gift.',perk:{stat:{pep:.08}}},
  // ---- Starting Signature Tools (F6): everyone starts holding one (B6_STARTER in data/progress.js). Not for sale. ----
  k_keyboard:{who:'tom',name:'Mechanical Keyboard',icon:'\u{2328}',slot:'Tool',desc:'Clicky blue switches. The whole house knows when Tom is typing.',stats:{pow:2,warmth:2}},
  g_dumpling:{who:'grace',name:'Gold Dumpling Squishy',icon:'\u{1F95F}',slot:'Tool',desc:'The sparkling diamond gold soup dumpling. Limited edition. Only two in the whole world.',stats:{pow:1,warmth:3}},
  r_lambytoy:{who:'rose',name:'Lamby',icon:'\u{1F411}',slot:'Tool',desc:'Her stuffed lamb. Has been thrown at three monsters and one brother-in-law.',stats:{pow:2,warmth:2}},
  a_whistle:{who:'amy',name:'Coach Whistle',icon:'\u{1F4EF}',slot:'Tool',desc:'She brought a whistle. She always brings a whistle.',stats:{pow:2,warmth:2}},
  d_pin:{who:'deedee',name:'Rolling Pin',icon:'\u{1F9C1}',slot:'Tool',desc:'Fifty years of pie crust. Also very good for pointing.',stats:{pow:1,warmth:3}},
  b_rod:{who:'boppy',name:'Rikers Bass Rod',icon:'\u{1F3A3}',slot:'Tool',desc:'Twenty years on the same rod. The fish all know it by name.',stats:{pow:3,warmth:1}},
  n_rib:{who:'tnb',name:'Pottery Rib',icon:'\u{1F3FA}',slot:'Tool',desc:'A worn wooden rib from his first wheel class. Shapes clay. Shapes opinions.',stats:{pow:1,warmth:3}},
  y_stick:{who:'nara',name:'The Best Stick',icon:'\u{1FAB5}',slot:'Tool',desc:'Nara found it on 2nd Ave. It\'s the best stick. Everyone must see the stick.',stats:{pow:3,warmth:1}},
  j_tester:{who:'justin',name:'Voltage Tester',icon:'\u{1F527}',slot:'Tool',desc:'Beeps when something is live. Beeps at Tom a lot. Justin says that is a good sign.',stats:{pow:3,warmth:1}},
  j_cap:{who:'justin',price:20,name:'Team Cap',icon:'\u{1F9E2}',slot:'Charm',desc:'Worn backwards during the game. Worn forwards when the team is losing. Same cap.',perk:{stat:{pep:.1}}},
  j_jacket:{who:'justin',price:34,name:'Designer Jacket',icon:'\u{1F9E5}',slot:'Outfit',color:'#3a4a63',desc:'Costs more than the ladder. He still climbs the ladder in it.',stats:{hp:24,grit:3,cool:3}},
  j_sneakers:{who:'justin',price:24,name:'Cushioned Sneakers',icon:'\u{1F45F}',slot:'Charm',desc:'Triple soles. His feet have filed a formal complaint about everything else.',perk:{stat:{grit:.1}}},
  j_stripper:{who:'justin',price:28,name:'Wire Strippers',icon:'\u{2702}',slot:'Tool',desc:'Orange handles, worn grip. He strips wire faster than he talks, which is saying something.',stats:{pow:4,warmth:1}}
};
// ---------- Shop tiers (engine/shop.js) ----------
// Penny's and Nickel's stock grows with the story: a better Tool, Outfit and Charm for each member, a stronger heal and
// a stronger throwable, unlocked when chapters 3, 6 and 9 are cleared (so the new shelf opens in chapters 4, 7 and 10).
// Prices are the member's base shelf price x2, x3, x4. Outfits are HP 24, 30, 36. Ids: <who>_tool1, _out2, _chm3 and so on.
const SHOP_TIER_GATES=[3,6,9];
const SHOP_TIER_MULT=[2,3,4];
const SHOP_TIER_OUT=[{hp:24,grit:4,cool:3},{hp:30,grit:4,cool:4},{hp:36,grit:5,cool:5}];
const SHOP_TIER_TOOL={power:[{pow:5,warmth:4},{pow:6,warmth:5},{pow:7,warmth:6}],warm:[{pow:3,warmth:6},{pow:4,warmth:7},{pow:5,warmth:8}]};
// who: [profile, base prices (tool, outfit, charm), charm perk key, its three values, [name, icon, desc] x3 for tool, outfit, charm]
const SHOP_TIER_GEAR={
  tom:['power',[36,30,20],'crit',[.12,.15,.18],
    [['Tournament Keyboard','\u{2328}','Hot-swap switches. Tom swaps them mid-meeting. Nobody notices.'],['Boss Rush Controller','\u{1F579}','Remapped for speed runs. The A button has its own fan club.'],['Platinum Trophy Pad','\u{1F3C6}','Every trophy. Every achievement. Tom keeps a spreadsheet.']],
    [['Cozy Cardigan','\u{1F9E5}','Soft, grey, and secretly bulletproof against small talk.'],['Delta One Robe','\u{1F6C1}','Heavy cotton. Tom says he earned it. Twice.'],['Head Baker Coat','\u{1F35E}','Starched white. A dusting of flour makes it official.']],
    [['Studio Headphones','\u{1F3A7}','The boss music, now in stereo.'],['Over-Ear Cans','\u{1F3A7}','Big, padded, and loud enough to stop a conversation.'],['Noise-Cancelling Cans','\u{1F3A7}','Silences everything except a good combo.']]],
  grace:['warm',[22,30,18],'crit',[.12,.14,.16],
    [['Glitter Squishy Deluxe','\u{1F351}','Two peaches. Double the squeeze. Triple the sparkle.'],['Judge’s Clipboard','\u{1F4CB}','Grace scores everyone. You’re welcome.'],['Champion’s Chalk Bag','\u{1F947}','Chalk dust, cold nerves, perfect landings.']],
    [['Meet Day Leotard','\u{1FA71}','Sequins to the ceiling. Judges are legally obligated to look.'],['Podium Warmup Jacket','\u{1F9E5}','Says TEAM across the back. Grace is the team.'],['National Team Leotard','\u{1F31F}','Red, white and so much glitter. Cleaning crews dread it.']],
    [['Tiara Headband','\u{1F451}','Real tiny rhinestones. Fake tiny pearls. Fully a crown.'],['Medal Ribbon','\u{1F396}','Gold, silk, and worn to bed. Grace says it’s for luck.'],['Perfect Ten Pin','\u{1F4AF}','Nine tens and an eleven. Grace wants a recount.']]],
  rose:['warm',[24,26,16],'evade',[.12,.14,.16],
    [['Lamby Jr. Deluxe','\u{1F411}','Lamby’s cousin, now with a cape. Brave and fast, says Rose.'],['Lamby Squad','\u{1F411}','Three lambs. One plan. No plan, actually.'],['Lamby the Brave','\u{1F6E1}','Knitted armor. Very strong. Very fluffy. Both matter.']],
    [['Frog Slicker Deluxe','\u{1F438}','Webbed pockets. Puddles are scared of it.'],['Rainbow Tutu','\u{1FA70}','Twirls for the ages. Weighs about nothing.'],['Superhero Cape Set','\u{1F9B8}','Cape, mask and one boot. The other boot is lost.']],
    [['Bunny Ears Plus','\u{1F430}','Taller ears. Better bounce.'],['Jumping Shoes','\u{1F45F}','Springs in the heels. Not a toy. Definitely a toy.'],['Cloud Slippers','\u{2601}','Fluffy, loud and impossible to catch.']]],
  amy:['power',[16,30,18],'pep',[.12,.14,.16],
    [['Silver Coach Whistle','\u{1F4EF}','Louder than the old one. The class heard it from the parking lot.'],['Stopwatch Pro','\u{23F1}','Splits to the hundredth. Amy checks them twice.'],['Relay Baton','\u{1F3C3}','She passed it to herself. Won anyway.']],
    [['Tempo Singlet','\u{1F3BD}','Lighter, tighter, faster. Lucky bib still pinned on.'],['Teacher of the Year Blazer','\u{1F9E5}','A tiny apple pin. Worn with great authority.'],['Marathon Finisher Jacket','\u{1F3C5}','Shiny, crinkly and fully earned.']],
    [['Pro Racing Flats','\u{1F45F}','Barely there. Amy weighed them on a kitchen scale.'],['Split-Time Watch','\u{231A}','Beeps every mile. Beeps at Tom too.'],['Finisher Medal','\u{1F3C5}','Heavy and shiny. Also a snack holder, technically.']]],
  deedee:['warm',[20,28,18],'regen',[.07,.08,.09],
    [['Marble Rolling Pin','\u{1F9C1}','Cold marble. Pie crust like silk.'],['Cast Iron Skillet','\u{1F373}','Seasoned for forty years. Seasoned with love for fifty.'],['Garden Shears','\u{2702}','Snip, snip. The roses never complained.']],
    [['Sunday Apron','\u{1F33A}','Pressed and starched. For company only.'],['Gardening Overalls','\u{1F33B}','Eleven pockets. Seeds in nine.'],['Holiday Cardigan','\u{2744}','Embroidered snowflakes. Smells like cinnamon, forever.']],
    [['Sun Hat Supreme','\u{1F452}','Bigger brim. Bigger ladybug.'],['Garden Gloves','\u{1F9E4}','Dirt on the thumbs. Pride in the fingers.'],['Moon Locket','\u{1F319}','To the moon and back. It says so inside.']]],
  boppy:['power',[24,32,20],'regen',[.08,.10,.12],
    [['Carbon Fishing Rod','\u{1F3A3}','Lighter than the old one. Boppy doesn’t trust it. Yet.'],['Tackle Box Deluxe','\u{1F9F0}','Three layers. Two lures. Eleven peppers.'],['Pepper Mill Cannon','\u{1F336}','Cracked pepper at speed. He swears it’s for the soup.']],
    [['Pier Vest Pro','\u{1F9BA}','More pockets. Fewer fish.'],['Recliner Robe','\u{1F6CB}','Terry cloth. Built-in lumbar support. Zero ambition.'],['Pier Weather Coat','\u{1F9E5}','Yellow slicker. Smells like nine thousand fish stories.']],
    [['Heated Seat Cushion','\u{1F525}','Plugged into nothing. Still toasty. The back approves.'],['Knee Brace','\u{1F9B5}','Compression sleeve. He tells everyone about it.'],['Magnetic Back Wrap','\u{1F9F2}','Allegedly works. Boppy insists.']]],
  tnb:['warm',[18,30,20],'evade',[.10,.12,.14],
    [['Wooden Pottery Rib','\u{1F3FA}','Smooth as a river stone. Shapes clay and quietly shapes opinions.'],['Mini Steamer','\u{2668}','Portable and a little hissy. Pun intended.'],['Pro Glaze Brush','\u{1F58C}','Fine bristles. Fine work. A fine pun, even.']],
    [['Studio Apron','\u{1F3FA}','Fresh stains, fresh stories. Cone ten approved.'],['Set Runner Vest','\u{1F9BA}','Walkie pocket, tape pocket, tiny pocket for sanity.'],['Supervisor Coat','\u{1F9E5}','Pins on the lapel. Every pin has a job.']],
    [['Transit Pin Set','\u{1F687}','Every line, every station. Next stop: dramatic.'],['Longboard Grip Tape','\u{1F6F9}','Rough, grippy and covered in stickers.'],['Kiln Glove Charm','\u{1F9E4}','Cone ten heat. Cool as ever.']]],
  nara:['power',[14,26,16],'pep',[.12,.14,.16],
    [['Tug Rope','\u{1FAA2}','Three knots. Four teeth marks. Very proud.'],['Squeaky Ball Deluxe','\u{1F3BE}','Squeaks at two pitches. Nara has opinions about both.'],['Giant Best Stick','\u{1FAB5}','A stick so big it needs a permit.']],
    [['Reflective Harness','\u{1F9BA}','Hi-vis. Hi-fur.'],['Rain Slicker for Dogs','\u{2614}','Bright yellow. She wears it with shame and speed.'],['Working Dog Vest','\u{1F9E5}','Says WORKING DOG. Mostly works on the sofa.']],
    [['Racing Bandana','\u{1F9E3}','Silk, striped, fast.'],['Jingle Collar','\u{1F514}','Every step announces her. She doesn’t mind.'],['Bacon Treat Pouch','\u{1F953}','Smells like victory. And bacon.']]],
  justin:['power',[22,34,20],'pep',[.10,.12,.14],
    [['Insulated Screwdriver Set','\u{1FA9B}','Rubber grips, rated for a thousand volts. Justin tests that rating regularly.'],['Cordless Drill Pro','\u{1F529}','Two batteries and a holster. He wears it like a sidearm.'],['Heavy Sledgehammer','\u{1F528}','For the basement wall. The wall has not agreed to this.']],
    [['Work Jacket Supreme','\u{1F9E5}','Canvas, a dozen pockets, one stain he calls character.'],['Insulated Gloves','\u{1F9E4}','Orange rubber. The panel respects them.'],['Fitted Designer Blazer','\u{1F454}','Tailored, expensive, completely wrong for drywall.']],
    [['Ref Whistle','\u{1F4E3}','He blows it at the TV. The TV does not review the play.'],['Gel Insoles','\u{1F9B6}','For the feet. Do not mention the feet.'],['Lucky Game Jersey','\u{1F3C8}','Never washed. Superstition and science agree.']]]
};
// Heals and throwables: [id, name, icon, desc, effect, base price of the first shelf item].
const SHOP_TIER_ITEMS={
  healing:[
    ['bandage',[['Mega Dino Bandage','\u{1FA79}','Two dinosaurs on it. They fight. It heals faster.',{heal:140}],['Jurassic Bandage','\u{1FA79}','A whole herd. Rose approves of the herd.',{heal:200}],['Dino Med Kit','\u{1F9F0}','Bandages, a tiny flashlight and a roar.',{heal:280}]],15],
    ['picnic',[['Family Picnic','\u{1F9FA}','Two sandwiches each. Nobody gets the squished one. Mostly.',{healAll:70}],['Backyard BBQ Basket','\u{1F356}','Smells like Boppy’s grill. Everyone gets a plate.',{healAll:100}],['Holiday Feast','\u{1F357}','Deedee cooked for forty. There are six of you. Perfect.',{healAll:140}]],26]],
  battle:[
    ['popper',[['Confetti Cannon','\u{1F389}','Louder. Wider. Monsters hate a parade.',{dmg:150}],['Fireworks Fan','\u{1F386}','Seven colors, zero permits. Never misses.',{dmg:190}],['Finale Rocket','\u{1F680}','The big one at the end of the show. Duck.',{dmg:240}]],22]]
};
const SHOP_TIER_STOCK={};   // tab id -> [tier 1 ids, tier 2 ids, tier 3 ids]
for(const [who,g] of Object.entries(SHOP_TIER_GEAR)) {
  const [prof,base,pk,vals,tools,outs,charms]=g;
  SHOP_TIER_STOCK[who]=[[],[],[]];
  for(let t=0;t<3;t++) {
    const perk=pk==='pep'?{stat:{pep:vals[t]}}:{[pk]:vals[t]};
    items[who+'_tool'+(t+1)]={who,tier:t+1,price:base[0]*SHOP_TIER_MULT[t],name:tools[t][0],icon:tools[t][1],slot:'Tool',desc:tools[t][2],stats:{...SHOP_TIER_TOOL[prof][t]}};
    items[who+'_out'+(t+1)]={who,tier:t+1,price:base[1]*SHOP_TIER_MULT[t],name:outs[t][0],icon:outs[t][1],slot:'Outfit',desc:outs[t][2],stats:{...SHOP_TIER_OUT[t]}};
    items[who+'_chm'+(t+1)]={who,tier:t+1,price:base[2]*SHOP_TIER_MULT[t],name:charms[t][0],icon:charms[t][1],slot:'Charm',desc:charms[t][2],perk};
    SHOP_TIER_STOCK[who][t].push(who+'_tool'+(t+1),who+'_out'+(t+1),who+'_chm'+(t+1));
  }
}
for(const [tab,rows] of Object.entries(SHOP_TIER_ITEMS)) {
  SHOP_TIER_STOCK[tab]=[[],[],[]];
  for(const [baseId,list,basePrice] of rows) for(let t=0;t<3;t++) {
    const [name,icon,desc,fx]=list[t], id=baseId+(t+1);
    items[id]=Object.assign({tier:t+1,price:basePrice*SHOP_TIER_MULT[t],name,icon,slot:null,desc},fx);
    SHOP_TIER_STOCK[tab][t].push(id);
  }
}
// Boppy's Gold Signature Tool (the others got theirs from the story). shopPrice, not price: gold is not for resale.
items.b_goldreel={who:'boppy',tier:1,shopPrice:90,name:'Golden Reel',icon:'\u{1F3A3}',slot:'Tool',desc:'Gold-plated, never tangles, hums at dawn. Old Iron-Gill would approve. Boppy won’t say so out loud.',stats:{pow:5,warmth:6}};
SHOP_TIER_STOCK.boppy[0].unshift('b_goldreel');
const souvenirs={bakery:'roll',library:'bookmark',greenhouse:'sprout',post:'stamp',tea:'biscuit',observatory:'scrap',home:'fridgephoto',amyhouse:'drawing',grands:'pepper'};
let coins=25;
const bag=['sunhat','notebook','pebble','button','sweater','beanie'];
// level 1 to 50; xp counts toward the next level (100 each); stamps: nodes stamped on each Stampcard path (engine/progress.js).
function makeMember(o) { return Object.assign({level:1,xp:0,next:100,wins:0,guard:false,stamps:[0,0],spBonus:0},o); }
const hero=makeMember({id:'tom',name:'Tom',title:'Uncle',hp:12,maxHp:12,mp:10,maxMp:10,power:3,
  base:{Curiosity:3,Charm:3,Pace:2,Luck:1},
  equipment:{Tool:'k_keyboard',Outfit:'shirt',Charm:null},
  commands:['attack','defend','item','run'],
  look:{hair:'#6b4a33',skin:'#efbc8e',shirt:'#262630'}});
const grace=makeMember({id:'grace',name:'Grace',title:'Niece, age 9',hp:9,maxHp:9,mp:12,maxMp:12,power:2,
  base:{Curiosity:4,Charm:3,Pace:3,Luck:2},
  equipment:{Tool:'g_dumpling',Outfit:'gtee',Charm:null},
  commands:['attack','dance','item','run'],
  look:{hair:'#c08a3e',hairHi:'#dcae5b',skin:'#e9b48c',shirt:'#c9b3e6',pants:'#3b3650',shoes:'#e8e8f0',height:14}});
const rose=makeMember({id:'rose',name:'Rose',title:'Niece, age 6',hp:7,maxHp:7,mp:14,maxMp:14,power:1,
  base:{Curiosity:5,Charm:4,Pace:2,Luck:3},
  equipment:{Tool:'r_lambytoy',Outfit:'rdress',Charm:'rclip'},
  commands:['attack','silly','item','run'],
  look:{hair:'#a06d38',hairHi:'#bf8a4c',skin:'#d9a070',shirt:'#f3d872',pants:null,shoes:'#e58bb6',height:12,dress:true,clip:'#d94a4a'}});
// Loved ones who can be recruited into the fourth slot, one at a time.
const amy=makeMember({id:'amy',name:'Amy',title:'Sister, the girls\u2019 mom',hp:11,maxHp:11,mp:12,maxMp:12,power:3,
  base:{Curiosity:2,Charm:3,Pace:4,Luck:2},
  equipment:{Tool:'a_whistle',Outfit:null,Charm:null},
  commands:['attack','pep','item','run'],
  look:{hair:'#c9823f',skin:'#efbc8e',shirt:'#4e81a3'}});
const deedee=makeMember({id:'deedee',name:'Deedee',title:'Grandma',hp:10,maxHp:10,mp:16,maxMp:16,power:2,
  base:{Curiosity:3,Charm:4,Pace:1,Luck:3},
  equipment:{Tool:'d_pin',Outfit:null,Charm:null},
  commands:['attack','hug','item','run'],
  look:{hair:'#ab7a47',skin:'#efbc8e',shirt:'#253b4a'}});
const boppy=makeMember({id:'boppy',name:'Boppy',title:'Grandpa',hp:14,maxHp:14,mp:8,maxMp:8,power:4,
  base:{Curiosity:2,Charm:2,Pace:1,Luck:2},
  equipment:{Tool:'b_rod',Outfit:null,Charm:null},
  commands:['attack','grumble','item','run'],
  look:{hair:'#525053',skin:'#efbc8e',shirt:'#203440'}});
const tnb=makeMember({id:'tnb',name:'TNB',title:'Tom\u2019s boyfriend',hp:12,maxHp:12,mp:12,maxMp:12,power:3,
  base:{Curiosity:3,Charm:4,Pace:2,Luck:2},
  equipment:{Tool:'n_rib',Outfit:null,Charm:null},
  commands:['attack','wardrobe','item','run'],
  look:{hair:'#795338',skin:'#f7ad7c',shirt:'#213d53'}});
// Nara: cousin Olivia's Labradoodle (Olivia, Michael, Lachlan 4, Isla 1). 40 pounds, seven years old, all energy.
// Picky eater (only dogOk items), separation anxiety (fiercer when Tom is down), pees when she gets too excited.
const nara=makeMember({id:'nara',name:'Nara',title:'Cousin Olivia\u2019s dog',hp:11,maxHp:11,mp:12,maxMp:12,power:3,
  base:{Curiosity:4,Charm:5,Pace:5,Luck:2},
  equipment:{Tool:'y_stick',Outfit:null,Charm:null},
  commands:['attack','puppy','item','run'],
  look:{hair:'#2a2424',skin:'#2a2424',shirt:'#2a2424'}});
// Justin: Amy's husband, the girls' dad. Electrician, 6'5", yells at the game, refinishing the basement, extremely sensitive feet.
const justin=makeMember({id:'justin',name:'Justin',title:'Brother-in-law, the girls\u2019 dad',hp:12,maxHp:12,mp:12,maxMp:12,power:3,
  base:{Curiosity:2,Charm:3,Pace:3,Luck:2},
  equipment:{Tool:'j_tester',Outfit:null,Charm:null},
  commands:['attack','drywall','item','run'],
  look:{hair:'#7a4f2e',skin:'#e3a47c',shirt:'#b9bfd3'}});
const RECRUITS={amy,deedee,boppy,tnb,nara,justin};
const party=[hero,grace,rose];
const PARTY_MAX=4;
const inParty=m=>party.includes(m);
// The old battle's move tables (before F3). Nothing in the main build reads them now; kits live in B2_SKILLS (data/battle2-data.js) and the Stampcards in data/progress.js.
const ATTACKS={
  tom:[{key:'mash',name:'Press Start',mp:0,mult:1},{key:'starter',name:'Starter Splash',mp:3,mult:1.3},{key:'flashcard',name:'Flashcard Flurry',mp:4,mult:1.5},{key:'unbox',name:'Unboxing',mp:5,mult:1.7},
       {key:'dutch',name:'Dutch Oven',mp:6,mult:2.0,lvl:2},{key:'kanji',name:'Kanji Strike',mp:7,mult:2.3,lvl:3},{key:'delta',name:'Delta One',mp:8,mult:2.6,lvl:4},{key:'finalboss',name:'Final Boss',mp:10,mult:3.2,lvl:5}],
  grace:[{key:'cartwheel',name:'Cartwheel',mp:0,mult:1},{key:'squishy',name:'Squishy Squeeze',mp:3,mult:1.3},{key:'polish',name:'Glitter Nails',mp:4,mult:1.5},{key:'runway',name:'Runway Walk',mp:5,mult:1.7},
       {key:'dancebattle',name:'Dance Battle',mp:6,mult:2.0,lvl:2},{key:'subscribe',name:'Like and Subscribe',mp:7,mult:2.3,lvl:3},{key:'beam',name:'Beam Dismount',mp:8,mult:2.6,lvl:4},{key:'perfect10',name:'Perfect 10',mp:10,mult:3.2,lvl:5}],
  amy:[{key:'basic',name:'Sprint Tackle',mp:0,mult:1},{key:'burpee',name:'Burpee Blitz',mp:3,mult:1.3},{key:'finish',name:'Finish Line',mp:4,mult:1.5},{key:'redpen',name:'Red Pen',mp:5,mult:1.7},
       {key:'hills',name:'Hill Repeats',mp:6,mult:2.0,lvl:2},{key:'quiz',name:'Surprise Quiz',mp:7,mult:2.2,lvl:3},{key:'marathon',name:'Marathon',mp:8,mult:2.6,lvl:4},{key:'pb',name:'Personal Best',mp:10,mult:3.2,lvl:5}],
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
const alive=m=>m.hp>0;
let menuOpen=false,menuTab='inventory',menuChar=0,menuSlot=null;

// Flat gear bonus to one battle stat (hp, pow, grit, warmth, cool, pep) from what a member wears.
function statBonus(m,stat) {
  let total=0;
  for(const slot of wearSlots(m)) { const id=m.equipment[slot],it=id&&items[id]; if(it&&it.stats&&it.stats[stat]) total+=it.stats[stat]; }
  return total;
}
// A member's battle stat outside a fight: the level line (B2_STATS) plus gear. Percent perks apply in battle.
const statTotal=(m,s)=>(typeof b2Stat==='function'?b2Stat(m.id,s,m.level):0)+statBonus(m,s);
// "+2 POW, +3 WARMTH" for stats, or the perk in words.
function bonusText(item) {
  const parts=item.stats?STAT_NAMES.filter(k=>item.stats[k]).map(k=>'+'+item.stats[k]+' '+STAT_LABEL[k]):[];
  if(item.perk&&typeof b6PerkText==='function') parts.push(b6PerkText(item.perk));
  const fx=effectText(item);
  if(fx) parts.push(fx);
  return parts.join(', ');
}
// What a usable item does, in plain words.
function effectText(item) {
  if(item.heal) return 'Heals '+item.heal+' HP';
  if(item.healAll) return 'Heals everyone '+item.healAll+' HP';
  if(item.vp) return 'Battle: +'+item.vp+' VP';
  if(item.revive) return 'Revives a fallen member at half HP';
  if(item.dmg) return 'Battle: '+item.dmg+' damage';
  if(item.confuse) return 'Battle: Goofs an enemy';
  if(item.atkDown) return 'Battle: enemy POW -25%';
  if(item.pep) return 'Battle: everyone\u2019s next hit +50%';
  return '';
}
const battleUsable=item=>!!(item.heal||item.healAll||item.vp||item.revive||item.dmg||item.confuse||item.atkDown||item.pep);
const fieldUsable=item=>!!(item.heal||item.healAll||item.revive);
// Selling pays half the shop price. Family things have no price and cannot be sold.
const sellValue=item=>item.price?Math.max(1,Math.floor(item.price/2)):(item.sell||0);
const canWear=(m,item)=>!item.who||item.who===m.id;
const memberById=id=>({tom:hero,grace,rose,amy,deedee,boppy,tnb,nara,justin})[id];
const ALL_MEMBERS=()=>[hero,grace,rose,amy,deedee,boppy,tnb,nara,justin];
// Equip from the pockets onto the menu character's slot. Whatever was worn there goes back in the pockets.
function equipTo(m,id) {
  const item=items[id],idx=bag.indexOf(id);
  if(!item||!item.slot||idx<0||!canWear(m,item)) return false;
  bag.splice(idx,1);
  const previous=m.equipment[item.slot];
  if(previous) bag.push(previous);
  m.equipment[item.slot]=id;
  if(typeof b6Refresh==='function') b6Refresh(m);
  return true;
}

function equipItem(id) {
  const m=party[menuChar],item=items[id];
  if(!item.slot) {
    sfx.nope();
    if(fieldUsable(item)) { useFieldItem(m,id); return; }
    showToast(item.name+' isn\'t something you can wear. Or is it. No.',2.2);
    return;
  }
  if(!canWear(m,item)) {
    sfx.nope();
    showToast(item.name+' is made for '+memberById(item.who).name+'. It wouldn\'t fit '+m.name+'.',2.4);
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
  if(m.id==='nara'&&item.heal&&!item.dogOk) { sfx.nope(); showToast('Nara sniffs the '+item.name+', looks at Tom, and walks away. Picky. She only eats Chicken Jerky.',2.8); return; }
  if(item.revive) {
    if(m.hp>0) { sfx.nope(); showToast(m.name+' is awake already. Save it for an emergency.',2.2); return; }
    m.hp=Math.ceil(m.maxHp/2); msg=m.name+' sits up. "I\'m fine. I was resting."';
  } else if(item.healAll) {
    if(!party.some(p=>p.hp>0&&p.hp<p.maxHp)) { sfx.nope(); showToast('Everyone is already full. Save the picnic.',2.2); return; }
    for(const p of party) if(p.hp>0) p.hp=Math.min(p.maxHp,p.hp+item.healAll);
    msg='Picnic time. Everyone feels better.';
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
  if(typeof b6Refresh==='function') b6Refresh(m);
  menuSlot=null;
  renderMenu();
}

function grantItem(id) {
  bag.push(id);
  const put=typeof autoGear==='function'?autoGear():[];   // Rose Mode dresses the party (engine/menu.js)
  sfx.pickup();
  showToast('Got '+items[id].name+'. '+(put.length?put.join(' '):'It went in a pocket.'),put.length?3.2:2.6);
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

