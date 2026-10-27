'use strict';
// data/bonus-nine-scoops.js — BONUS CHAPTER: Nine Scoops (claude/bonus-chapter-nine-scoops.md). Grace's ninth birthday on
// Long Island, with Tom, Grace and Rose only. Standalone: BONUS on the title screen starts it with no Part 1 or Part 2 save
// (chapter 21, flag `bonus`; everyone at level 5; nothing carries in or out).
//   1. Chapter 21, the title screen start (confirmBonus, beginBonus)
//   2. Pixel art: the three squishies (duck, Moo-rielle, dice), the gift, the Instax, a photo, a scoop; four monsters
//   3. Monsters: Sprinkle Gremlin, Slushie Slug, Cone Head and Brain Freeze (two-phase boss; phase 1 ends in the ICE SHELL)
//   4. Items, props (overworld and battle), sound effects
//   5. Spoken lines (data/lines.js LINES)
//   6. BIRTHDAY WISH (a three-person Family Finish) and Grace's INSTAX command
//   7. Scenes, triggers, map rules, map effects and fight tips
// Story flags, in order: ns-open, ns-present, ns-duck, ns-cow, ns-goal, ns-creamery, ns-frost, ns-cube, ns-fountain, ns-scoops (number),
// ns-trail, ns-cow-stolen, ns-pond, ns-rosefrozen, ns-printer (tombo:wish), battle:brainfreeze ('win'), ns-clear, ns-done.
// Loaded after engine/chapter-select.js, before data/dialog-cast.js.
(function(){
const NS=21;
const inBonus=()=>typeof STORY!=='undefined'&&STORY.mode==='full'&&STORY.chapter===NS;

// ---------- 1. Chapter 21 and the title screen ----------
CHAPTERS[NS]={n:NS,title:'Nine Scoops',bonus:true,party:{allow:[],
  decline:{amy:'Go. GO. I have a house to decorate and a cake to hide from your father. Take the girls and get the scoops.',
           deedee:'Not today, honey. The cake is in the oven and the oven doesn\'t care that it\'s a birthday.',
           boppy:'Ice cream? My knee says sit. My knee has been saying sit since 1994.'}},
  noFlight:()=>({lines:['Airport? On the birthday? Your sister would find me. On foot. In the dark.','The creamery is at the top of the Square. Go get those scoops.']})};
function beginBonus() {
  endIntro();
  resetStory('full',NS);
  setFlag('bonus'); setFlag('tombo:grace1'); setFlag('tombo:rose1');
  for(const m of extras()) recruitLeave(m,true);
  if(girlsAway()) setGirlsAway(false);
  b6Prep(5); coins=60;
  bag.length=0; bag.push('bandage','bandage','juice','lemonade');
  const h=houseById.taxi;
  currentMap=town; player.x=h.door.x; player.y=h.door.y; player.facing='down'; player.move=null; player.hidden=true; player.scr=null;
  for(const f of followers) { f.hidden=true; f.move=null; f.scr=null; f.lift=0; f.x=player.x; f.y=player.y; }
  refreshAreaUI(); resize(); camera.snap=true;
  intro.phase='scene';
  playScene(()=>[{card:NS,time:3.2},...SCENES.nsOpening()],{fade:.7});
}
window.confirmBonus=function() {
  if(!readSave('auto')) { beginBonus(); return; }
  openChoice('Nine Scoops','The bonus chapter replaces the autosave once it begins. Slots 1 to 3 are kept.',[
    {label:'START',fn:beginBonus},
    {label:'BACK',fn:titleMenu}
  ]);
};

// ---------- 2. Pixel art ----------
const NS_DUCK=["......oooo......",".....oyyyyo.....","....oyyyyyyo....","...oyykkyyyyo...","...oyykwyyyyrro.","...oyyyyyyyyyrro","....oyyyyyoorro.","..oooyyyyyo.....",".oyyyyyyyyyoo...","oyyyyyyyyyyyyo..","oyyyyyyyyyyyyyo.","oyyyyyyyyyyyyyo.",".oyyyyyyyyyyyo..","..ooooooooooo..."];
const NS_DUCK_PAL={o:'#7a3a08',y:'#f58a2a',k:'#1a1410',w:'#ffffff',r:'#f0602a'};
const NS_COW=["....oo......oo....","...okko....okko...","...oppppooppppo...","..opppppppppppppo.",".oplppppppppppppo.",".opppkppppppkpppo.",".oppppppppppppplo.","..oppptttttpppo...","..oppttktttkttpo..","...opptttttttpo...","..opppppppppppppo.",".oplpppppppppppppo",".oppppppppppppplpo",".opppoooooooopppo.",".opppo......opppo.","..ooo........ooo.."];
const NS_COW_PAL={o:'#4a1f5e',p:'#c84fd8',l:'#e484f2',t:'#e2b98a',k:'#1a1020'};
const NS_DICE=["..oooooooooo..",".oppppsppppso.","oppwwppwwppwwo","oppwwppwwppwwo","opsppppppppppo","opppppppsppppo","oppwwppwwppwwo","oppwwppwwppwwo","oppppsppppppso","opppppppppppso","oppwwppwwppwwo","oppwwppwwppwwo",".oppspppppppo.","..oooooooooo.."];
const NS_DICE_PAL={o:'#8a2a4a',p:'#f07aa0',w:'#fff0f5',s:'#ffe9a8'};
const NS_GIFT=["....oooooooo....","...orrrrrrrro...","..orrrryyrrrro..",".oooooyyyyooooo.",".obbbbbyybbbbbo.",".obbbbbyybbbbbo.",".obbbbbyybbbbbo.",".obbbbbyybbbbbo.",".obbbbbyybbbbbo.",".obbbbbyybbbbbo.","..ooooooooooooo."];
const NS_GIFT_PAL={o:'#3a2a40',r:'#e0405a',y:'#ffd24a',b:'#5a8ad8'};
const NS_INSTAX=["..oooooooooooooooo..",".owwwwwwwwwwwwwwwwo.",".owwwwwwwwwwwwwwwwo.",".owwwwwwwwwwwwwwwwo.",".owwwpppwwwwwwwwwwo.",".owwwpppwwwwwwwwwwo.",".owwwwwwwwwwwwwwwwo.",".owwwwwwwwwwwwwwwwo.",".owwwwwwwwwwwwwwwwo.","..oooooooooooooooo.."];
const NS_INSTAX_PAL={o:'#6a6a70',w:'#f4f1ec',p:'#f08ac0'};
const NS_PHOTO=["oooooooooooooo","owwwwwwwwwwwwo","owoooooooooowo","owobbbbbbbbowo","owobbyybbbbowo","owobbyyggbbowo","owobbbbggrrowo","owobbbbbbrrowo","owoooooooooowo","owwwwwwwwwwwwo","owwwwwwwwwwwwo","oooooooooooooo"];
const NS_PHOTO_PAL={o:'#3a3a40',w:'#fbf8f0',b:'#9fd0ff',y:'#ffd24a',g:'#6fb86a',r:'#e07a9a'};
const NS_GREMLIN=["......oooo......",".....oppppo.....","....opppppoo....","....okwpkwpo....","....opppppppo...","...oopppppppo...","..oggpppppppggo.","..ogoppkkkpppgo.","...oopppppppoo..","....oppppppo....","....oppppppo....",".....oppppo.....","....oyyooyyo....","....oooooooo...."];
const NS_GREMLIN_PAL={o:'#5a1a4a',p:'#ff7ac0',k:'#2a1030',w:'#ffffff',g:'#7ad0ff',y:'#ffe08a'};
const NS_CONE=[".......oooooo.......",".....oopppppoo......","....oppppppppppo....","...opppppppppppo....","..oppppppppppppppo..","..opkkppppppppkkpo..","..opwkppppppppkwpo..","..oppppppppppppppo..","..oppppkkkkkkppppo..","...oppppppppppppo...","....oooooooooooo....","....otttttttttto....","....otxtttxtttto....",".....otttttttto.....",".....ottxtttxto.....","......otttttto......","......otxtttxo......",".......ottttto......",".......otxtxo.......","........otto........","........otto........",".........oo.........","....................","...................."];
const NS_CONE_PAL={o:'#4a2a1a',p:'#8fd4a8',k:'#1a2a20',w:'#ffffff',t:'#d9a24e',x:'#a8702a'};
const NS_SLUSH=["..................................","........................oo.....oo.",".................ooooooobbooooobbo","................otttttttbbbbbbbbbo","...............ottttttttbbbbbbbbbo",".......ooooooootttttttttbbooooobbo","......ottttttuussuuuttttttto...oo.",".....otttuttuuuuuuuuutttttto......","....ottusuuutuuuuuuuttttttttooo...","....ottttutttttttttttttttttuttto..","....otttttttttttttttttttttuuutto..","....ottttttyyyytttttyyyytttutttto.","...oottttttyykytttttykyytttttttto.","..ottttttttyykytttttykyytttttttto.","..otuuuttttttttttttttttttttttttto.",".ottuuutttttttttttttttttttttttttto",".ottuuuttttttttttttttttttttttuttto",".ottttttttttttrwrrrwrtttttttuuutto","..otttttttttttrrrrrrrtuttttttutto.","..ottttttttttttttttttuuutttttttto.","...ootttttttttttttttttutttttttoo..",".....ootttttttttttttttttttttoo....",".......oootttttttttttttttooo......","..........oooooootooooooo........."];
const NS_SLUSH_PAL={o:'#1f3a5a',t:'#7fcaf0',u:'#b8e6fb',s:'#eefaff',b:'#ffffff',y:'#ffffff',k:'#1a2a3a',r:'#3a7ab0',w:'#d8f4ff'};
const NS_FREEZER=["................................","......oooooooooooooooooooo......",".....obbbbbbbbbbbbbbbbbbbbo.....","....obbbbbbbbbbbbbbbbbbbbbbo....","...oooooooooooooooooooooooooo...","..owwwwwwwwwwwwwwwwwwwwwwwwwwo..","..owwzwwwwwwwwwzwwwwwwwwwzwwwo..","..oiiiiiiiiiiiiiiiiiiiiiiiiiio..","..oiikkkkiiiiiiiiiiiiiikkkkiio..","..oiiikkkkiiiiiiiiiiiikkkkiiio..","..oiiiwwkkiiiiiiiiiiiikkwwiiio..","..oiiiwkkkiiiiiiiiiiiikkkwiiio..","..oiiiiiiiiiiiiiiiiiiiiiiiiiio..","..oiiiiiiiiiiioooooooiiiiiiiio..","..oiiiiiiiiiiioggggggoiiiiiiio..","..oiiiiiiiiiiioooooooiiiiiiiio..","..oiiiiiiiiiiiiiiiiiiiiiiiiiio..","..oiiiiiiikkkkkkkkkkkkkkiiiiio..","..oiiiiiikkiiiiiiiiiiiikkiiiio..","..oiiiiikkiiiiiiiiiiiiiikkiiio..","..oiiiiiiiiiiiiiiiiiiiiiiiiiio..","..oddddddddddddddddddddddddddo..","..oddddddddddddddddddddddddddo..","...oooooooooooooooooooooooooo...",".....oooo.............oooo......",".....okko.............okko......",".....oooo.............oooo......","..z......z.........z.......z...."];
const NS_FREEZER_PAL={o:'#1e2a40',b:'#c8dcea',w:'#f4fbff',z:'#aee6ff',i:'#dceef8',k:'#1e2a40',g:'#8aa0b4',d:'#b4c8d8'};
const SPR=(rows,pal,x,y,s=1)=>drawSprite(rows,pal,x,y,s);

// ---------- 3. Monsters ----------
Object.assign(MONSTERS,{
  gremlin:{id:'gremlin',coins:5,coinStep:2,name:'Sprinkle Gremlin',the:'the gremlin',short:'Gremlin',sprite:NS_GREMLIN,pal:NS_GREMLIN_PAL,scale:3,eyes:[[5,3],[8,3]],mouth:[7,7],
    hp:8,hpStep:2,atk:1,xp:4,xpStep:2,level:5,rank:'EASY',
    intro:'Sprinkle Gremlins skitter out of the freezer!',
    attacks:['The gremlin flicks a sprinkle at {t}.','The gremlin jumps on {t}. It is very small.','The gremlin shouts at {t} in sprinkle.'],
    special:{name:'Sprinkle Spray',every:3,kind:'hit',msg:'{e} sprays sprinkles everywhere! Mostly at {t}.'},
    wobble:'The gremlin wobbles...',die:'It pops into a puff of sprinkles. They taste fine.',
    rest:['...I\'m resting on a scoop. Don\'t tell him.'],talk:['Brr! Tiny! Angry!','We came in the freezer. It was cold. We\'re STILL cold.'],again:['Round {n}. We brought more sprinkles.'],
    vapor:['#ff7ac0','#7ad0ff','#ffe08a','#ffffff'],hint:'Tiny and cold. They come in threes.'},
  slushslug:{id:'slushslug',coins:14,coinStep:4,name:'Slushie Slug',the:'the slug',short:'Slug',sprite:NS_SLUSH,pal:NS_SLUSH_PAL,scale:3,eyes:[[12,12],[21,12]],mouth:[16,17],
    hp:40,hpStep:6,atk:2,xp:14,xpStep:4,level:5,rank:'TOUGH',
    intro:'A Slushie Slug glorps up out of the fountain. It has three scoops under it.',
    attacks:['The slug oozes onto {t}. Blue raspberry.','The slug sneezes slush at {t}.','The slug sits on {t}. Slowly. Coldly.'],
    special:{name:'Brain Freeze',every:3,kind:'all',msg:'{e} chugs itself. BRAIN FREEZE for everyone!'},
    wobble:'The slug slumps...',die:'It melts into the fountain. The fountain is blue now.',
    rest:['...Melting. Give me a minute. Glorp.'],talk:['Glorp. These scoops are mine. He said so.','Blue raspberry isn\'t a fruit. I know. I don\'t care.'],again:['Round {n}. I refroze.'],
    vapor:['#7fcaf0','#b8e6fb','#ffffff','#3a7ab0'],hint:'Lots of HP, but it melts and skips every third turn. Warm moves melt it faster.'},
  conehead:{id:'conehead',coins:10,coinStep:3,name:'Cone Head',the:'the cone',short:'Cone',sprite:NS_CONE,pal:NS_CONE_PAL,scale:3,eyes:[[5,6],[14,6]],mouth:[9,8],
    hp:24,hpStep:4,atk:2,xp:10,xpStep:3,level:5,rank:'MEDIUM',
    intro:'Two Cone Heads step out of the trees. Waffle cones. Mint on top. Bad attitude.',
    attacks:['The cone pokes {t} with its point.','The cone drips on {t}. Mint.','The cone headbutts {t}. Crunch.'],
    special:{name:'Scoop Pass',every:3,kind:'hit',msg:'{e} passes a scoop to its friend!'},
    wobble:'The cone cracks...',die:'It crumbles into cone crumbs. Grace eats one.',
    rest:['...Crunch. Regrouping. Crunch.'],talk:['We hold the scoops. We hold the cow. We hold EVERYTHING.','Mint chip. Say it. MINT. CHIP.'],again:['Round {n}. Fresh cones.'],
    vapor:['#d9a24e','#8fd4a8','#ffffff','#a8702a'],hint:'They come in pairs and pass a scoop back and forth to heal.'},
  brainfreeze:{id:'brainfreeze',coins:60,coinStep:10,name:'Brain Freeze',the:'Brain Freeze',short:'Freeze',sprite:NS_FREEZER,pal:NS_FREEZER_PAL,scale:3,eyes:[[7,9],[24,9]],mouth:[15,18],
    hp:140,hpStep:14,atk:4,xp:40,xpStep:8,level:5,rank:'BOSS',
    intro:'The pond goes still. Then it frosts over. A chest freezer stands up on the ice. It\'s BRAIN FREEZE.',
    attacks:['Brain Freeze gives {t} the cold shoulder.','Brain Freeze breathes frost on {t}.','Brain Freeze flings an ice cube at {t}. Rude.'],
    special:{name:'Brain Freeze',every:3,kind:'all',msg:'BRAIN FREEZE! Everyone grabs their forehead!'},
    wobble:'Brain Freeze rattles...',die:'The lid pops open. Nine scoops, still perfect.',
    rest:['...Hum. Hum. Hum. I am a freezer. I hum.'],talk:['Nobody came to MY birthday. So nobody gets one.','Nothing melts in here. Nothing changes. Nothing LEAVES.'],again:['Round {n}. I defrosted. I am worse now.'],
    vapor:['#dceef8','#aee6ff','#ffffff','#c8dcea'],hint:'The birthday thief. Slams its lid shut at half HP. Only a warm photo opens it.'}
});
Object.assign(B2_FOES,{
  gremlin:{level:5,hp:42,pow:11,grit:6,warmth:7,cool:6,pep:15,weak:['cozy','splash'],resist:[],step:2,
    acts:[{name:'Sprinkle Flick',stat:'pow',mult:.9,elem:'kinetic',target:'one',msg:'{e} flicks a sprinkle at {t}.'},
          {name:'Tiny Jump',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} jumps on {t}. It is very small.'},
          {name:'Sprinkle Spray',stat:'pow',mult:.7,elem:'sparkle',target:'all',every:3,msg:'{e} sprays sprinkles everywhere!'}]},
  slushslug:{level:5,hp:300,pow:14,grit:11,warmth:9,cool:8,pep:6,weak:['cozy','sparkle'],resist:['splash'],step:3,goofEasy:true,
    acts:[{name:'Ooze',stat:'pow',mult:1,elem:'splash',target:'one',msg:'{e} oozes onto {t}. Blue raspberry.'},
          {name:'Slush Sneeze',stat:'warmth',mult:.9,elem:'splash',target:'one',msg:'{e} sneezes slush at {t}.'},
          {name:'Brain Freeze',stat:'pow',mult:.85,elem:'kinetic',target:'all',every:3,msg:'{e} chugs itself. BRAIN FREEZE for everyone!'}]},
  conehead:{level:5,hp:150,pow:15,grit:10,warmth:9,cool:9,pep:11,weak:['cozy','chatter'],resist:[],step:3,
    acts:[{name:'Point Poke',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} pokes {t} with its point.'},
          {name:'Mint Drip',stat:'warmth',mult:.9,elem:'splash',target:'one',msg:'{e} drips on {t}. Mint.'},
          {name:'Scoop Pass',stat:'warmth',mult:0,elem:'cozy',target:'one',every:3,heal:40,msg:'{e} passes a scoop to its friend. The friend feels better.'}]},
  brainfreeze:{level:5,hp:700,pow:20,grit:13,warmth:14,cool:12,pep:10,weak:['cozy','sparkle'],resist:['splash'],step:4,boss:'brainfreeze',noRun:true,
    acts:[{name:'Cold Shoulder',stat:'pow',mult:1,elem:'kinetic',target:'one',msg:'{e} gives {t} the cold shoulder.'},
          {name:'Frost Breath',stat:'warmth',mult:1,elem:'chatter',target:'one',msg:'{e} breathes frost on {t}.'},
          {name:'Ice Cube',stat:'pow',mult:1.15,elem:'kinetic',target:'one',msg:'{e} flings an ice cube at {t}. Rude.'}],
    flop:{name:'Brain Freeze',stat:'pow',mult:1,elem:'kinetic',target:'all',msg:'BRAIN FREEZE! {e} blasts cold at everyone!'},
    rumble:{name:'Deep Freeze',stat:'pow',mult:1.45,elem:'kinetic',target:'all',msg:'{e} opens its lid wide. DEEP FREEZE on everyone!'},
    shield:{need:2,elems:['cozy','sparkle']}}
});
B2_FORMATIONS.gremlin=[['gremlin','front'],['gremlin','front'],['gremlin','front']];
B2_FORMATIONS.conehead=[['conehead','front'],['conehead','front']];
const NS_LIKES=['rose.silly','rose.peekaboo','grace.squishy','grace.dance','tom.starter'];
Object.assign(B2_GRUMP,{
  gremlin:{goal:80,grumpy:'Tiny, cold, and nobody ever picks sprinkles first.',likes:NS_LIKES},
  slushslug:{goal:160,grumpy:'Half melted, half frozen, and blue raspberry isn\'t even a real fruit.',likes:NS_LIKES},
  conehead:{goal:140,grumpy:'Nobody wants the cone. Everybody wants the scoop. Think about that.',likes:NS_LIKES},
  brainfreeze:{goal:380,grumpy:'Nobody came to its birthday. Not one. It\'s been cold about it ever since.',likes:NS_LIKES}
});
if(typeof B6_XP!=='undefined') Object.assign(B6_XP,{gremlin:10,slushslug:44,conehead:30,brainfreeze:100});
// Brain Freeze fights like the Big Shake (engine/battle2.js B2_SHAKE_STYLE): every third turn a telegraphed party-wide
// Brain Freeze; in phase 2, two Sprinkle Gremlins and a Deep Freeze behind an ICE SHELL (2 Cozy or Sparkle hits, or any Tombo).
B2_SHAKE_STYLE.brainfreeze={word:'ICE SHELL',add:'gremlin',
  open:e=>'Brain Freeze hums. Frost creeps across the whole pond.',
  open2:'Every third turn it blasts everyone with a Brain Freeze. It shows on the turn ribbon before it happens.',
  phase:N=>N+' is FURIOUS. Its lid rattles.',
  adds:n=>n>1?'Two Sprinkle Gremlins skitter out of the freezer!':'A Sprinkle Gremlin skitters out of the freezer!',addSfx:'whoosh',
  idle:N=>N+' hums louder. Menacingly.',
  brace:(N,e)=>N+' slams its lid for a DEEP FREEZE next turn! Break the ICE SHELL: '+e.shield.need+' Cozy or Sparkle hits, or a Tombo.',
  warn:'Frost creeps up the screen. BRAIN FREEZE next turn hits everyone. Heal up after!'};
// Phase 1 ends at half HP: the lid slams shut (nothing gets through, HP stops falling) and Rose is frozen mid Boo. The fight
// ends with result 'shell' and the pond scene takes over (Tom's present). Phase 2 is a second fight that starts at half HP.
const LE_b2CheckPhase_ns=b2CheckPhase;
b2CheckPhase=function(t) {
  if(t.boss==='brainfreeze'&&inBonus()&&!flag('ns-printer')) {
    if(t.phase===1&&t.hp<=t.maxHp*.5) { t.phase=2; t.shellOut=true; const p=b2FoePoint(t); battle.texts.push({txt:'ICE SHELL',x:p.x,y:p.y-30,color:'#aee6ff',sc:2,t:0,dur:1.4}); sfx.stun&&sfx.stun(); }
    if(t.shellOut||t.phase===2) t.hp=Math.max(t.hp,Math.round(t.maxHp*.45));
    return;
  }
  return LE_b2CheckPhase_ns(t);
};
const LE_b2BossTurn_ns=b2BossTurn;
b2BossTurn=function(e) {
  if(e.boss==='brainfreeze'&&e.shellOut) {
    e.shellOut=false; e.intent=null;
    const r=B2.party.find(p=>p.id==='rose');
    enqueue(()=>{ b2Msg('Brain Freeze slams its lid shut. ICE SHELL! Nothing gets through. Not even a Tombo.'); e.shield={need:99,elems:[],hits:0}; e.shake=.7; sfx.thud&&sfx.thud(); b2Render(); },2000,
      ()=>{ b2Msg('BRAIN FREEZE! Rose freezes solid. Mid boo.'); if(r) { r.st.frozen={turns:9}; battle.fx[r.idx].hop=.3; } sfx.stun&&sfx.stun(); b2Fx({kind:'flash',color:'#aee6ff',t:0,dur:.6}); b2Render(); },2000,
      ()=>{ b2Msg('Nothing works. Not Tombos. Not hugs. Not raspberries.'); },1600,
      ()=>b2End('shell'));
    return;
  }
  return LE_b2BossTurn_ns(e);
};

// ---------- 4. Items, props, sounds ----------
Object.assign(items,{
  present:{name:'Grace’s Present',icon:'\u{1F381}',slot:null,desc:'Wrapped. From Tata. Don\'t shake it. Presents are after cake. That\'s the rule.'},
  instax:{name:'Instax Printer',icon:'\u{1F4F7}',slot:'Tool',desc:'Grace’s ninth birthday present. Prints a photo from a phone in a minute. You don\'t have to freeze a moment. You take a picture.',stats:{warmth:4}},
  nsphoto:{name:'The Cab Selfie',icon:'\u{1F5BC}',slot:'Charm',desc:'Tom, Grace, Rose, one duck and one cow, by Cab 7. The first print. It\'s going on the fridge.',perk:{heart:10}}
});
if(!sfx.quack) sfx.quack=(d=0)=>{ tone({type:'sawtooth',f0:420,f1:300,dur:.13,vol:.16,delay:d,filter:1400}); tone({type:'square',f0:300,f1:240,dur:.1,vol:.08,delay:d+.12,filter:900}); };
if(!sfx.shutter) sfx.shutter=(d=0)=>{ noise({dur:.05,vol:.25,delay:d,f0:4000,f1:2000,type:'bandpass',q:1}); tone({type:'square',f0:1800,dur:.03,vol:.08,delay:d+.06}); noise({dur:.04,vol:.2,delay:d+.09,f0:3000,f1:1500,type:'bandpass',q:1}); };
if(!sfx.printWhir) sfx.printWhir=(d=0)=>{ for(let k=0;k<10;k++) noise({dur:.04,vol:.07,delay:d+k*.07,f0:2200,f1:1800,type:'bandpass',q:1.5}); tone({type:'sawtooth',f0:90,dur:.75,vol:.04,delay:d,filter:300}); };
if(!sfx.blow) sfx.blow=(d=0)=>{ noise({dur:.18,vol:.16,delay:d,f0:900,f1:300,type:'lowpass'}); };
if(!sfx.birthdayChime) sfx.birthdayChime=(d=0)=>{ [880,1108,1318,1760,1318,1760,2217].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.18,vol:.12,delay:d+i*.11})); };
// Overworld props: drawn by the map effects below (carried squishies, the gift, ice).
function drawGift(cx,y) { SPR(NS_GIFT,NS_GIFT_PAL,cx-8,y,1); }
function drawIceCube(cx,top,w,h,time) {
  gfx.globalAlpha=.55; rect(cx-w/2-3,top-4,w+6,h+6,'#1e2a40'); rect(cx-w/2-2,top-3,w+4,h+4,'#aee6ff');
  gfx.globalAlpha=.7; rect(cx-w/2,top-1,3,h,'#ffffff'); rect(cx-w/2,top-1,w,2,'#ffffff');
  gfx.globalAlpha=.9; for(let k=0;k<3;k++) { const ph=(time*.7+k/3)%1; rect(Math.round(cx-w/2+2+ph*(w-6)),Math.round(top+2+((k*7)%(h-6))),2,2,'#ffffff'); }
  gfx.globalAlpha=1;
}
// Battle props (engine/battle.js PROP2): the squishies, the cake with nine candles, a photo, the Instax.
PROP2.nsduck=(q,u)=>{ gfx.save(); gfx.scale(2,2); SPR(NS_DUCK,NS_DUCK_PAL,-8,-7,1); gfx.restore(); };
PROP2.nscow=(q,u)=>{ gfx.save(); gfx.scale(2,2); SPR(NS_COW,NS_COW_PAL,-9,-8,1); gfx.restore(); };
PROP2.nsdice=(q,u)=>{ gfx.save(); gfx.scale(2,2); SPR(NS_DICE,NS_DICE_PAL,-7,-7,1); gfx.restore(); };
PROP2.nsphoto=(q,u)=>{ gfx.save(); gfx.scale(q.sc||2.5,q.sc||2.5); SPR(NS_PHOTO,NS_PHOTO_PAL,-7,-6,1); gfx.restore(); };
PROP2.nsinstax=(q,u)=>{ gfx.save(); gfx.scale(2,2); SPR(NS_INSTAX,NS_INSTAX_PAL,-10,-5,1); gfx.restore(); };
// A black and white cookie cake: cream base, chocolate-and-vanilla top, and up to nine candles (q.lit = how many still burn, q.n = candles out of the box).
function drawBwCake(x,y,w,lit,n,time) {
  const h=Math.round(w*.3);
  ellipse(x,y,w/2+3,h*.45+3,'#2b1d1b');
  rect(x-w/2,y-h,w,h,'#f4e6c8'); ellipse(x,y,w/2,h*.45,'#f4e6c8'); rect(x-w/2,y-h*.55,w,3,'#e0c9a0');
  ellipse(x,y-h,w/2,h*.45,'#2b1d1b');
  // the half-and-half top: chocolate on the left, vanilla fondant on the right
  gfx.save(); gfx.beginPath(); gfx.ellipse(x,y-h,w/2-2,h*.45-2,0,0,Math.PI*2); gfx.clip();
  rect(x-w/2,y-h*2,w/2,h*2,'#4a2a1e'); rect(x,y-h*2,w/2,h*2,'#fff8ec'); rect(x-2,y-h*2,4,h*2,'#2b1d1b');
  gfx.restore();
  for(let k=0;k<n;k++) {
    const cx=Math.round(x-w*.4+k*(w*.8/8)),cy=y-h-Math.round(h*.1)-((k%2)?6:0);
    rect(cx-2,cy-14,5,15,'#2b1d1b'); rect(cx-1,cy-13,3,13,['#ff9ac0','#86a9ff','#ffe08a','#9be39a'][k%4]);
    if(k<lit) { const fl=Math.sin(time*18+k)*1.5; ellipse(cx+.5,cy-18+fl,3,5,'#ffb347'); ellipse(cx+.5,cy-19+fl,1.6,3,'#fff5c0'); }
    else { gfx.globalAlpha=.6; for(let j=0;j<3;j++) ellipse(cx+Math.sin(time*3+j+k)*3,cy-20-j*7-((time*20+k*5)%14),3+j,2+j,'#c9c9c9'); gfx.globalAlpha=1; }
  }
}

// ---------- 5. Spoken lines ----------
Object.assign(LINES.tom,{
  arrive_bday:["Oof, I'm finally here! Six hours on Delta One and I didn't miss the big day."],
  present_rule:['Presents are after cake. That\'s the rule. I didn\'t make the rule.'],
  present_give:['Okay. Presents are before cake. New rule.'],
  duck_ride:['Hello, Rose. Hello, duck. Please keep your arms, legs and bills inside the uncle at all times.'],
  bday_cow:['That\'s the fluffiest cow I\'ve ever seen. And I\'ve seen a LOT of cows.'],
  not_puppy:['It\'s not a puppy.'],
  wish:['Nine candles. Hold still, please.'],
  wish_win:['That was a LOT of cake.']
});
Object.assign(LINES.grace,{
  arrive_bday:['TATA! You came for my BIRTHDAY!'],
  bday_nine:['I\'ve been nine for SIX hours.'],
  bday_squish:['Tata, LOOK. A fluffy purple cow. Her name is Moo-rielle. And a GLITTER DICE.'],
  dice_nine:['It only does nines today.'],
  rude:['Stealing on a BIRTHDAY? Rude.'],
  nothing_works:['Tata, nothing WORKS.'],
  photo_stays:["You don't have to freeze it. You just take a picture. See? It stays."],
  instax:['Say cheese. Or ice cream.'],
  wish:["It's MY birthday, so I pick the move!"],
  wish_win:['I wished for a bigger explosion.'],
  wish_print:['Printing. That one is going on the fridge.']
});
Object.assign(LINES.rose,{
  bday_six:['I\'ve been six for a hundred MILLION years.'],
  duck_mine:['The duck is mine now.'],
  puppy:['Is the present a puppy?'],
  bigpuppy:['Is the present a BIGGER puppy?'],
  badguy:['A bad guy! On a Saturday!'],
  thaw:['I was in the MIDDLE of a boo.'],
  wish:['BOO! Surprise party!'],
  wish_win:['It WORKED!']
});

// ---------- 6. BIRTHDAY WISH and INSTAX ----------
// The first three-person Family Finish: Tom + Grace + Rose, 75% HEART, nine candle hits and the wish on every enemy.
B2_TOMBOS.push({id:'wish',who:['tom','grace','rose'],tier:'ff',cost:75,flag:'tombo:wish',name:'Birthday Wish',elem:['sparkle','cozy'],stat:'hybrid',mult:6.0,target:'all',weight:'standard',kindV:300,tombo:true,
  fx:[['goof',1,'t'],['heal',.25,0,'party']],
  desc:'Rose jumps out from behind the monsters with the duck (BOO!), Tom drops a black and white cookie cake on them and lights nine candles with a Combo Fireball, and Grace handsprings onto it and blows them out one hit at a time. Then the wish: a huge Sparkle and Cozy hit on every enemy. They\'re Goofed for a round and the party heals 25%.'});
// Grace's INSTAX: once she has the printer, a Sparkle flash that Goofs every enemy and warms them up (4 VP, no damage).
const NS_INSTAX_SKILL={key:'instax',name:'Instax',vp:4,elem:['sparkle'],target:'all',weight:'standard',fx:[['goof',1,'t']],
  desc:'Grace snaps a photo of the whole row and prints it. The flash Goofs every enemy (they lose a turn), and seeing themselves warms them up.'};
B2_KIND['grace.instax']=160;
const LE_b6Kit_ns=b6Kit;
b6Kit=function(id,all) {
  const k=LE_b6Kit_ns(id,all);
  if(id==='grace'&&!all&&inBonus()&&flag('ns-printer')&&!k.skills.includes(NS_INSTAX_SKILL)) return Object.assign({},k,{skills:k.skills.concat([NS_INSTAX_SKILL])});
  return k;
};
// Animations. Helpers from the set-piece toolkit (engine/stage.js RFX.ST) in real canvas coordinates (576 x 324).
const {scene,ST,SC}=RFX;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); },seg=(ms,a,b)=>cl((ms-a)/(b-a));
const S=(k,...a)=>{ try { if(sfx[k]) sfx[k](...a); } catch(e){} };
const word=(txt,x,y,c,sc=4,dur=1,rot=0)=>scene('tb_word',dur,{txt,x,y,c,sc,rot});
const SPmul=id=>BATTLE_SPRITES[id].scale;
RECRUIT_MOVES.grace=RECRUIT_MOVES.grace||{};
RECRUIT_MOVES.grace.instax=E2=>{ B2.aim=null;
  const {m,fx}=E2,G=ST.unit(m),list=b2LiveFoes(),GR=ST.group(list);
  const K=[{t:0,x:G.x,y:G.base,f:'idle'},{t:400,x:G.x-30,y:G.base,f:'act',hop:14},{t:3600,x:G.x-30,y:G.base,f:'act'},{t:4100,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  ST.draw((s,u)=>{ const h=ST.hand(0,-6); gfx.save(); gfx.translate(h.x-12,h.y); gfx.scale(1.4,1.4); SPR(NS_INSTAX,NS_INSTAX_PAL,-10,-5,1); gfx.restore(); },3.6);
  ST.play(E2,[
    [0,()=>{ setMessage('Grace: Instax! Everybody look at me.'); say('grace','instax'); }],
    [900,()=>{ S('shutter'); b2Fx({kind:'flash',color:'#ffffff',t:0,dur:.5}); word('FLASH!',GR.x,60,'#fff6dc',5,.7); for(const f of list) ST.jolt(f,.3); landHit(100); }],
    [1500,()=>{ S('printWhir'); setMessage('The printer whirs. A photo slides out.');
      const h=ST.hand(0,-6); ST.fly((x,y,u)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(2.2,2.2); SPR(NS_PHOTO,NS_PHOTO_PAL,-7,-6,1); gfx.restore(); },h.x,h.y,GR.x,GR.top-20,1.2,70,0,{spin:.5}); }],
    [2800,()=>{ E2.apply(); for(const f of list) { const q=ST.foe(f); word('OH NO',q.x,q.top-10,'#ffb0d0',2,.8); } }],
    ['hf',900],
    [3700,'end',()=>(E2.result||'')+' Nobody likes how they look in a photo. Every enemy is Goofed.']]);
};
// BIRTHDAY WISH: E = {tom, mem, fx (per member), M, act, targets, result, apply}.
B2_TOMBO_ANIM.wish=E2=>{ B2.aim=null;
  const mem=E2.mem,by0=id=>mem.find(p=>p.id===id),tom=by0('tom'),gr=by0('grace'),ro=by0('rose');
  const fxOf=u=>E2.fx[mem.indexOf(u)],list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const Tm=ST.unit(tom),Gm=ST.unit(gr),Rm=ST.unit(ro);
  const cakeX=GR.x,cakeW=Math.max(124,GR.w+16),cakeY=GR.base+6,cakeH=Math.round(cakeW*.3);
  const P={boo:1000,drop0:1900,drop1:2500,light:2700,spring0:3600,land:4600,blow0:5000,blowGap:190,wish:0,flash:0,pr0:0,end:0};
  P.wish=P.blow0+9*P.blowGap+400; P.flash=P.wish+150; P.pr0=P.wish+2600; P.end=P.pr0+(flag('ns-printer')?1900:300);
  const st={lit:0,n:0,cake:0,photo:0};
  // Rose: a sneak behind the monsters, the BOO!, then cheering from the side
  ST.keys(fxOf(ro),[{t:0,x:Rm.x,y:Rm.base,f:'idle'},{t:150,x:Rm.x,y:Rm.base,f:'run',hop:6,hn:4},{t:850,x:GR.x0-44,y:GR.base,f:'idle'},
    {t:P.boo,x:GR.x0-44,y:GR.base,f:'celeb',hop:30},{t:P.boo+500,x:GR.x0-44,y:GR.base,f:'celeb'},{t:P.wish,x:GR.x0-44,y:GR.base,f:'celeb',hop:16,hn:3},
    {t:P.wish+700,x:GR.x0-44,y:GR.base,f:'celeb'},{t:P.end-500,x:'home',y:'home',f:'idle'},{t:P.end,x:'home',y:'home',f:'idle'}]);
  // Tom: steps up, raises an arm for the cake and the fireball, then cheers
  ST.keys(fxOf(tom),[{t:0,x:Tm.x,y:Tm.base,f:'idle'},{t:P.boo+300,x:Tm.x,y:Tm.base,f:'idle'},{t:P.boo+800,x:GR.x1+70,y:GR.base,f:'act',hop:8},
    {t:P.light,x:GR.x1+70,y:GR.base,f:'act'},{t:P.light+600,x:GR.x1+70,y:GR.base,f:'idle'},{t:P.wish,x:GR.x1+70,y:GR.base,f:'celeb',hop:14,hn:2},
    {t:P.end-500,x:'home',y:'home',f:'idle'},{t:P.end,x:'home',y:'home',f:'idle'}]);
  // Grace: a handspring run (three full turns in the air) that lands on top of the cake, then a Perfect 10 pose
  ST.keys(fxOf(gr),[{t:0,x:Gm.x,y:Gm.base,f:'idle'},{t:P.spring0,x:Gm.x,y:Gm.base,f:'run',hop:8,hn:2},{t:P.spring0+400,x:(Gm.x+cakeX)/2+40,y:Gm.base,f:'act',hop:90,rot:u=>-u*Math.PI*6},
    {t:P.land,x:cakeX+10,y:cakeY-cakeH-4,f:'celeb',hop:0},{t:P.wish,x:cakeX+10,y:cakeY-cakeH-4,f:'celeb',hop:20,hn:2},{t:P.pr0,x:cakeX+10,y:cakeY-cakeH-4,f:'act'},
    {t:P.end-500,x:'home',y:'home',f:'idle'},{t:P.end,x:'home',y:'home',f:'idle'}]);
  // The set piece: the cake (dropping in, then resting on the monsters), the duck in Rose's hands, the photo at the end.
  scene('tb_draw',P.end/1000,{back:false,draw:(s2,u,ms)=>{
    if(ms>=P.drop0&&ms<P.end-400) {
      const k=ez(seg(ms,P.drop0,P.drop1)),y=lerp(-60,cakeY,k),wob=ms>P.drop1&&ms<P.drop1+300?Math.sin((ms-P.drop1)/40)*3:0;
      const a=1-seg(ms,P.end-700,P.end-400); gfx.globalAlpha=a;
      drawBwCake(cakeX,Math.round(y+wob),cakeW,st.lit,st.n,ms/1000); gfx.globalAlpha=1;
    }
    if(ms>=P.flash&&ms<P.flash+900) { const q=seg(ms,P.flash,P.flash+900); gfx.globalAlpha=(1-q)*.9; rect(0,0,576,324,'#ffffff'); gfx.globalAlpha=1; }
    if(ms>=P.wish&&ms<P.wish+2200) { const q=seg(ms,P.wish,P.wish+2200); for(let j=0;j<40;j++) { const x=(j*149)%576,y=((j*83)%260)+q*(140+(j%5)*30)-60; gfx.save(); gfx.translate(x,y); gfx.rotate(q*8+j); gfx.globalAlpha=1-q; rect(-4,-2,8,4,['#ff9ac0','#ffe08a','#86a9ff','#9be39a','#ffffff'][j%5]); gfx.restore(); } gfx.globalAlpha=1; }
    if(st.photo&&ms>=P.pr0) { const q=seg(ms,P.pr0,P.pr0+900),s=lerp(1.5,4,ez(q)); gfx.save(); gfx.translate(lerp(cakeX+10,288,ez(q)),lerp(cakeY-cakeH-60,150,ez(q))); gfx.rotate((1-ez(q))*4-.15); gfx.scale(s,s); SPR(NS_PHOTO,NS_PHOTO_PAL,-7,-6,1); gfx.restore(); }
  }});
  ST.draw((s,u)=>{ const c=ST.cur; },0);
  const steps=[
    [0,()=>{ setMessage('FAMILY FINISH! Birthday Wish.'); S('levelChime'); }],
    [200,()=>setMessage('Rose sneaks around the back with the duck...')],
    [P.boo,()=>{ S('quack'); S('boo'); word('BOO!',GR.x0-30,70,'#fff6dc',6,.9); say('rose','wish'); for(const f of list) ST.jolt(f,.5); setMessage('Rose: BOO! Surprise party!'); }],
    [P.boo+900,()=>{ setMessage('Tom calls in the cake. A black and white cookie cake. The big one.'); S('whoosh'); say('tom','wish'); }],
    [P.drop1,()=>{ S('thud'); battle.shakeEnemy=.6; st.n=9; word('SPLAT!',cakeX,60,'#fff6dc',5,.8); for(const f of list) ST.jolt(f,.4); landHit(5); }],
    [P.light,()=>{ S('fireball'); setMessage('Combo Fireball! Nine candles, lit in one go.'); }],
    [P.light+300,()=>{ st.lit=9; S('fanfare'); }],
    [P.spring0,()=>{ setMessage('Grace: a handspring run. Right up onto the cake.'); S('jumpWhistle'); say('grace','wish'); }],
    [P.land,()=>{ S('thud'); word('PERFECT 10',cakeX,50,'#ffe08a',4,1); }]
  ];
  for(let k=0;k<9;k++) steps.push([P.blow0+k*P.blowGap,()=>{ st.lit=8-k; S('blow'); S('bonk'); word(String(9-k),cakeX-60+k*15,90,'#ffd968',3,.5); for(const f of list) ST.jolt(f,.3); landHit(7); }]);
  steps.push([P.wish,()=>{ S('birthdayChime'); S('lineClear'); battle.shakeEnemy=.9; word('WISH!',288,110,'#ff9ac0',8,1.2); landHit(32); E2.apply(); setMessage('The wish! Everyone feels it. The monsters feel it most.'); for(const p of party) { const q=ST.unit(p); scene('glow',1,{x:q.x,y:q.mid,rx:38,ry:52,c:'#ffe08a',a:.4}); } }]);
  steps.push([P.wish+900,()=>{ setMessage('Grace: I wished for a bigger explosion.'); say('grace','wish_win'); }]);
  steps.push([P.wish+1700,()=>{ setMessage('Rose: It WORKED!'); say('rose','wish_win'); }]);
  if(flag('ns-printer')) {
    steps.push([P.pr0-200,()=>{ S('shutter'); b2Fx({kind:'flash',color:'#ffffff',t:0,dur:.4}); }]);
    steps.push([P.pr0,()=>{ st.photo=1; S('printWhir'); setMessage('Grace: Printing. That one is going on the fridge.'); say('grace','wish_print'); }]);
  }
  steps.push(['hf',P.blow0]);
  steps.push([P.end,'end',()=>(E2.result||'')+' Tom: That was a LOT of cake.']);
  ST.play(E2,steps);
};

// ---------- 7. Scenes ----------
const NSC={mode:'full',chapter:NS};
const QUACK=()=>({call:()=>sfx.quack()});
const scoopToast=(n,names)=>({toast:'SCOOPS: '+n+' of 9. '+names,time:4});
const spawnAt=(name,monster,at,extra={})=>({spawn:Object.assign({name,monster,at},extra)});
// The opening: the Chapter 1 opening, tuned for the birthday (claude/bonus-chapter-nine-scoops.md).
SCENES.nsOpening=()=>{
  const h=houseById.taxi,dx=h.door.x,dy=h.door.y,row=dy+2,gStart=10,rStart=9;
  const gTiles=[],rTiles=[];
  for(let x=gStart+1;x<=dx-1;x++) gTiles.push([x,row]);
  for(let x=rStart+1;x<=dx-1;x++) rTiles.push([x,row+1]);
  return [
    {noGo:[9,dy+1,27,dy+3]},
    {flag:'ns-present'}, {flag:'ns-cow'}, {flag:'ns-duck'},
    {wait:.7},
    {call:()=>sfx.doorOut()}, {show:'tom'}, {place:'tom',at:[dx,dy],dir:'down'},
    {wait:.35},
    {walk:'tom',to:[[dx,dy+1],[dx,row]],speed:.3},
    {wait:.3},
    {step:stretchStep()},
    {talk:'Tom',lines:["Oof, I'm finally here! Six hours on Delta One and I didn't miss the big day."],voice:[['tom','arrive_bday']]},
    {call:()=>{ intro.bubble={text:'TATA!!!',t:0}; snd.gasp(); }}, {say:['grace','introshout']}, {say:['rose','introshout',.5]},
    {wait:.6},
    {face:'tom',dir:'left'},
    {place:'grace',at:[gStart,row],dir:'right'}, {show:'grace'},
    {place:'rose',at:[rStart,row+1],dir:'right'}, {show:'rose'},
    {all:[
      {walk:'grace',to:gTiles,speed:.11,onStep:i=>{ if(i%2) snd.patter(0); }},
      {seq:[{wait:.25},{walk:'rose',to:rTiles,speed:.11,onStep:i=>{ if(i%2===0) snd.patter(1); }}]}
    ]},
    {call:()=>{ intro.bubble=null; }}, {face:'grace',dir:'right'}, {face:'rose',dir:'up'},
    {step:hugStep()},
    {talk:'Grace',lines:['TATA! You came for my BIRTHDAY!','I\'ve been nine for SIX hours.'],voice:[['grace','arrive_bday'],['grace','bday_nine']]},
    {talk:'Rose',lines:['I\'ve been six for a hundred MILLION years.','Tata, up! Up up up!'],voice:[['rose','bday_six'],['rose','intro2']]},
    {call:()=>{ const r=sceneActor('rose'); snd.whee(); snd.oof(.38); r.depthBias=-.05; r.facing='left'; }},
    {hop:'rose',from:[dx-1,row+1],to:[dx,row],time:.5,arc:22,lift:[0,SHOULDER]},
    {call:()=>{ const r=sceneActor('rose'); r.x=dx; r.y=row; r.scr={x:dx,y:row}; r.lift=SHOULDER; r.noShadow=true; r.seat=true; sfx.giggle(); sfx.quack(.3); }},
    {trace:'rose-shoulders'},
    {talk:'Rose',lines:['I\'m the tallest! Giddyup, Tata!'],voice:[['rose','intro3']]},
    {talk:'Tom',lines:['Hello, Rose. Hello, duck. Please keep your arms, legs and bills inside the uncle at all times.'],voice:[['tom','duck_ride']]},
    {face:'grace',dir:'right'}, {call:()=>{ intro.squishy={t:0,sprite:NS_COW,pal:NS_COW_PAL,plain:true}; snd.squeak(); }},
    {wait:.7},
    {call:()=>{ intro.showcase={t:0,sprite:NS_COW,pal:NS_COW_PAL,lines:['MOO-RIELLE','THE FLUFFY PURPLE COW']}; snd.sparkle(); }},
    {talk:'Grace',lines:['Tata, LOOK. A fluffy purple cow. Her name is Moo-rielle. And a GLITTER DICE.'],voice:[['grace','bday_squish']]},
    {call:()=>{ intro.showcase={t:0,sprite:NS_DICE,pal:NS_DICE_PAL,lines:['GLITTER DICE','IT ONLY DOES NINES']}; sfx.boing(); }},
    {wait:.9},
    {talk:'Grace',lines:['It only does nines today.'],voice:[['grace','dice_nine']]},
    {call:()=>{ intro.showcase=null; snd.squeak(); intro.squishy=null; }},
    {call:()=>sfx.quack()},
    {talk:'Rose',lines:['The duck is mine now.'],voice:[['rose','duck_mine']]},
    {talk:'Tom',lines:['That\'s the fluffiest cow I\'ve ever seen. And I\'ve seen a LOT of cows.'],voice:[['tom','bday_cow']]},
    {call:()=>{ NSFX.flash=.6; sfx.shutter(); }},
    {talk:'Tom',lines:['One for the fridge. Everybody say ice cream.']},
    {talk:'Rose',lines:['ICE CREAM! Come on, Tata! Let’s go!']},
    {call:()=>{ snd.whee(true); const r=sceneActor('rose'); r.noShadow=false; r.seat=false; }},
    {hop:'rose',from:[dx,row],to:[dx-1,row+1],time:.45,arc:14,lift:[SHOULDER,0]},
    {flag:'opening-done'}, {flag:'ns-open'},
    {call:finishOpening}
  ];
};
// Right after the opening: the plan, and the present stays wrapped.
SCENES.nsGoal=[
  {flag:'ns-goal'},
  {talk:'Grace',lines:['Tata! Sprinkle Street Creamery! The sundae! Mr. Pistachio said it\'d be READY.']},
  {talk:'Tom',lines:['Nine dairy-free scoops. One per year. Black and white cookie on top. I ordered it in July.']},
  {talk:'Rose',lines:['Is the present a puppy?'],voice:[['rose','puppy']]},
  {talk:'Tom',lines:['It\'s not a puppy.','Presents are after cake. That\'s the rule. I didn\'t make the rule.'],voice:[['tom','not_puppy'],['tom','present_rule']]},
  {toast:'Tombos ready: Hi Guys, Welcome Back! (Grace) and Double-Decker Airplane (Rose). In battle, ◀ TOMBO.',time:4},
  {toast:'Goal: Sprinkle Street Creamery, the shop with the SCOOPS sign at the top of the Square.',time:4.5}
];
// Sprinkle Street Creamery: frozen solid. Mr. Pistachio in an ice cube, three gremlins, the story of the thief.
SCENES.nsCreamery=[
  {flag:'ns-creamery'}, {flag:'ns-frost'}, {flag:'ns-cube'},
  {call:()=>{ const n=storySpawn({name:'Mr. Pistachio',at:[4,4],look:'bun',dir:'down'}); n.sheet=null; }},
  {walk:'tom',to:()=>[[currentMap.spawn.x,currentMap.spawn.y-1]],speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:()=>[currentMap.spawn.x+1,currentMap.spawn.y],dir:'up'}, {place:'rose',at:()=>[currentMap.spawn.x-1,currentMap.spawn.y],dir:'up'},
  {sfx:'look'},
  {talk:'Rose',lines:['Tata. It\'s SNOWING. Inside.']},
  {talk:'Grace',lines:['Mr. Pistachio is in an ICE CUBE. Mr. PISTACHIO.']},
  {talk:'Mr. Pistachio',lines:['Mmmf. Mmf MMF. Mmmmf.']},
  {talk:'Tom',lines:['He says the freezer walked off. I speak ice cube.']},
  {sfx:'whoosh'},
  spawnAt('Sprinkle Gremlin','gremlin',[3,6],{dir:'down'}), spawnAt('Sprinkle Gremlin B','gremlin',[6,6],{dir:'down'}),
  {talk:'Sprinkle Gremlin',lines:['Brr! Tiny! Angry! The scoops are OURS!']},
  {talk:'Grace',lines:['Tata is in front. I\'m in charge of choreography. It\'s my birthday. FIGHT!']},
  {battle:()=>sceneActor('Sprinkle Gremlin'),tut:'nsGremlin'},
  {despawn:'Sprinkle Gremlin'}, {despawn:'Sprinkle Gremlin B'},
  {if:()=>flag('battle:gremlin')!=='win',then:[{heal:true},{talk:'Grace',lines:['Up. Everybody up. It\'s my birthday and NOBODY stays down on my birthday.']},{flag:'ns-creamery',value:false}],else:[
    {call:()=>{ setFlag('ns-cube',false); sfx.lineClear(); }},
    {talk:'Mr. Pistachio',lines:['PFFF. Thank you. I could see my own eyebrows in there.','It was BRAIN FREEZE. A walking chest freezer. He said birthdays are a scam and nobody came to his.','He took every scoop and ran. Three bags. One to the fountain, one up the Hollow trail, one to the pond.']},
    {talk:'Grace',lines:['He took MY scoops? On MY birthday?','Stealing on a BIRTHDAY? Rude.'],voice:[null,['grace','rude']]},
    {talk:'Rose',lines:['A bad guy! On a Saturday!'],voice:[['rose','badguy']]},
    {talk:'Tom',lines:['We get the scoops, we get the sundae, we\'re home by four.']},
    {talk:'Rose',lines:['Is the present a puppy?'],voice:[['rose','puppy']]},
    {talk:'Tom',lines:['It\'s not a puppy.'],voice:[['tom','not_puppy']]},
    {call:()=>setFlag('ns-scoops',0)},
    {toast:'Goal: the fountain in the middle of the Square. Rose has a plan.',time:4.5}]}
];
// The fountain: Rose sneaks up on the Slushie Slug with the duck. Scoops 1 to 3.
SCENES.nsFountain=[
  {flag:'ns-fountain'},
  {hold:['Pip','Moss','Dot']},
  spawnAt('Slushie Slug','slushslug',[13,13],{dir:'left',mscale:1}),
  {talk:'Grace',lines:['THERE. Under the slug. Vanilla, strawberry AND mint. I can see them.']},
  {talk:'Rose',lines:['Shh. Shhhh. Everybody shh. The duck and I have a plan.']},
  {walk:'rose',to:()=>{ const r=sceneActor('rose'); return [[r.x,13],[12,13],[13,14]].filter(t=>walkable(currentMap,t[0],t[1])); },speed:.2},
  {face:'rose',dir:'up'},
  {wait:.4},
  {call:()=>{ intro.bubble={text:'BOO!',t:0}; sfx.quack(); snd.gasp(); }},
  {wait:.8}, {call:()=>{ intro.bubble=null; }},
  {talk:'Slushie Slug',lines:['GLORP. What? WHO? Oh no. I dropped a scoop. I dropped TWO scoops.']},
  {battle:()=>sceneActor('Slushie Slug'),tut:'nsSlug'},
  {despawn:'Slushie Slug'},
  {if:()=>flag('battle:slushslug')!=='win',then:[{heal:true},{talk:'Grace',lines:['Up, up. It\'s a slug. We\'re not losing to a SLUG on my birthday.']},{flag:'ns-fountain',value:false}],else:[
    {call:()=>{ setFlag('ns-scoops',3); sfx.pickup(); }},
    scoopToast(3,'Vanilla, strawberry, mint. Cold and perfect.'),
    {wait:2},
    {talk:'Rose',lines:['Is the present a BIGGER puppy?'],voice:[['rose','bigpuppy']]},
    {talk:'Tom',lines:['It\'s not a bigger puppy.']},
    {toast:'Goal: the Grump Hollow trail, through the gap in the trees up north.',time:4.5}]}
];
// The trail: two Cone Heads, one of them takes Moo-rielle. Scoops 4 to 6. Brain Freeze watches from the trees.
SCENES.nsTrail=[
  {flag:'ns-trail'},
  {walk:'tom',to:[[7,17]],speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:[8,17],dir:'up'}, {place:'rose',at:[8,18],dir:'up'},
  spawnAt('Cone Head','conehead',[7,14],{dir:'down'}), spawnAt('Cone Head B','conehead',[9,14],{dir:'down'}),
  {talk:'Cone Head',lines:['Halt. We hold the scoops. Chocolate. Cookie dough. Coffee.']},
  {walk:'Cone Head B',to:[[9,15],[9,16],[9,17]],speed:.22},
  {call:()=>{ setFlag('ns-cow-stolen'); const c=sceneActor('Cone Head B'); if(c) c.carry='nscow'; sfx.pickup(); }},
  {talk:'Cone Head B',lines:['And now we hold the cow.']},
  {walk:'Cone Head B',to:[[9,16],[9,15]],speed:.22}, {face:'Cone Head B',dir:'down'},
  {talk:'Grace',lines:['MOO-RIELLE! Give her BACK!','Hi guys. Welcome back to my channel. Today a CONE stole my COW.']},
  {sfx:'look'},
  {talk:'Brain Freeze',lines:['...Nobody filmed MY birthday.']},
  {talk:'Rose',lines:['Tata. The trees are TALKING.']},
  {talk:'Tom',lines:['The trees aren\'t talking. The freezer is. Eyes on the cones.']},
  {battle:()=>sceneActor('Cone Head'),tut:'nsCone'},
  {despawn:'Cone Head'}, {despawn:'Cone Head B'},
  {if:()=>flag('battle:conehead')!=='win',then:[{heal:true},{talk:'Grace',lines:['Up. UP. Moo-rielle needs us.']},{flag:'ns-trail',value:false}],else:[
    {call:()=>{ setFlag('ns-cow-stolen',false); setFlag('ns-scoops',6); sfx.pickup(); }},
    {talk:'Grace',lines:['Moo-rielle! You smell like mint. We\'ll talk about it later.']},
    scoopToast(6,'Chocolate, cookie dough, coffee. The cones had them in a cooler.'),
    {wait:2},
    {toast:'Goal: the pond, east around the water. Three scoops left. And one freezer.',time:4.5}]}
];
// The pond: the Grump cameo, the dice, Brain Freeze, the ICE SHELL, the present, and the second fight.
SCENES.nsBoss2=[
  {battle:()=>sceneActor('Brain Freeze'),tut:'nsBoss2'},
  {if:()=>flag('battle:brainfreeze')!=='win',then:[
    {heal:true},
    {talk:'Grace',lines:['Up, up. It\'s still my birthday. We go AGAIN.']},
    {flag:'ns-retry'},
    {toast:'Walk up to Brain Freeze to try again. Everyone is healed.',time:4.5}],else:[{flag:'ns-retry',value:false}]}
];
SCENES.nsPond=[
  {flag:'ns-pond'},
  {place:'grace',at:()=>[player.x-1,player.y+1],dir:'right'}, {place:'rose',at:()=>[player.x,player.y+1],dir:'right'}, {face:'tom',dir:'right'},
  spawnAt('Pond Grump','grump',[15,13],{dir:'right'}),
  {walk:'Pond Grump',to:[[16,13],[17,13]],speed:.3,onStep:()=>sfx.splat()},
  {talk:'Pond Grump',lines:['Grrrumble. Something moved into my pond. It\'s COLD. I\'m a POND grump, not an ICE grump.']},
  {walk:'Pond Grump',to:[[16,13],[15,13],[14,14]],speed:.3,onStep:()=>sfx.splat()},
  {despawn:'Pond Grump'},
  {face:'grace',dir:'right'},
  {call:()=>{ intro.squishy={t:0,sprite:NS_DICE,pal:NS_DICE_PAL,plain:true}; sfx.boing(); }},
  {wait:.8},
  {talk:'Grace',lines:['Dice says nine. Nine scoops. Nine candles. Let’s go.']},
  {call:()=>{ intro.squishy=null; }},
  {call:()=>{ sfx.thud(); sfx.stun(); }},
  spawnAt('Brain Freeze','brainfreeze',[19,12],{dir:'left',mscale:1.5}),
  {talk:'Brain Freeze',lines:['Nine scoops. Nine candles. Nine years. All of it MELTS.','Not in here. Nothing melts in here. Nothing changes.','Nobody came to MY birthday. So nobody gets one.']},
  {talk:'Grace',lines:['Stealing on a BIRTHDAY? Rude.'],voice:[['grace','rude']]},
  {talk:'Rose',lines:['A bad guy! On a Saturday!'],voice:[['rose','badguy']]},
  {talk:'Tom',lines:['We get the scoops, we get the sundae, we\'re home by four. Everybody ready?']},
  {battle:()=>sceneActor('Brain Freeze'),tut:'nsBoss1'},
  {if:()=>B2.result==='shell',then:[
    {flag:'ns-rosefrozen'},
    {call:()=>{ const r=sceneActor('rose'); if(r) { r.facing='left'; } }},
    {talk:'Grace',lines:['Tata, nothing WORKS.'],voice:[['grace','nothing_works']]},
    {talk:'Brain Freeze',lines:['Good. Nothing changes. Nobody leaves. Nobody grows up. Nobody forgets a birthday.']},
    {talk:'Tom',lines:['...Okay. Presents are before cake. New rule.'],voice:[['tom','present_give']]},
    {call:()=>{ sfx.pickup(); setFlag('ns-printer'); setFlag('tombo:wish'); STORY.flags.heart=75; }},
    {give:'instax'},
    {talk:'Grace',lines:['An INSTAX. Tata. A PRINTER. For PHOTOS.','...Wait.','He doesn\'t want to freeze the world. He wants to keep a moment.']},
    {talk:'Tom',lines:['Pair it to my phone. One tap. The cab photo is still on there.']},
    {call:()=>{ sfx.shutter(); NSFX.flash=.5; }},
    {wait:.5},
    {call:()=>{ sfx.printWhir(); }},
    {talk:'Grace',lines:['Printing...']},
    {give:'nsphoto'},
    {walk:'grace',to:()=>{ const b=sceneActor('Brain Freeze'); return b?[[b.x-1,b.y]]:[]; },speed:.3},
    {face:'grace',dir:'right'},
    {call:()=>{ const b=sceneActor('Brain Freeze'); if(b) b.carry='nsphoto'; sfx.pickup(); }},
    {talk:'Grace',lines:["You don't have to freeze it. You just take a picture. See? It stays.",'And we still get to eat the ice cream.'],voice:[['grace','photo_stays']]},
    {wait:.6},
    {call:()=>{ sfx.lineClear(); sfx.stun(); NSFX.flash=.4; }},
    {talk:'Brain Freeze',lines:['...It\'s warm. Why\'s the picture WARM.','My lid. My LID. It\'s OPENING.']},
    {call:()=>{ setFlag('ns-rosefrozen',false); sfx.levelChime(); sfx.quack(.4); }},
    {talk:'Rose',lines:['I was in the MIDDLE of a boo.'],voice:[['rose','thaw']]},
    {toast:'New Family Finish: BIRTHDAY WISH (Tom + Grace + Rose). HEART is at 75%. In battle, ◀ TOMBO.',time:5},
    {toast:'Grace learned INSTAX: a flash that Goofs every enemy. ▲ Skills.',time:4},
    {walk:'grace',to:()=>[[player.x+1,player.y]],speed:.3},
    {talk:'Tom',lines:['Everybody ready? Round two. It\'s still her birthday.']},
    {seq:SCENES.nsBoss2}
  ],else:[
    {heal:true},
    {talk:'Grace',lines:['Up, up. It\'s my birthday. Nobody stays down.']},
    {despawn:'Brain Freeze'},
    {flag:'ns-pond',value:false}]}
];
SCENES.nsRetry=[{seq:SCENES.nsBoss2}];
// After the boss: the last three scoops, and an invitation.
SCENES.nsAfterBoss=[
  {flag:'ns-clear'},
  {call:()=>{ const b=sceneActor('Brain Freeze'); if(b) b.carry='nsphoto'; }},
  {if:()=>!!flag('kind:brainfreeze'),
    then:[{talk:'Brain Freeze',lines:['...Nobody ever warmed me up before. Take the scoops. They\'re in the freezer. Where scoops go.']}],
    else:[{talk:'Brain Freeze',lines:['Fine. FINE. Take the scoops. They\'re in the freezer. Where scoops go.']}]},
  {call:()=>{ setFlag('ns-scoops',9); sfx.pickup(); }},
  scoopToast(9,'Peanut butter, lemon, black and white cookie. All nine. Still perfect.'),
  {wait:2.2},
  {talk:'Grace',lines:['Come to my party.']},
  {talk:'Brain Freeze',lines:['...Nobody has ever... Is there cake?']},
  {talk:'Tom',lines:['There\'s a LOT of cake.']},
  {talk:'Brain Freeze',lines:['I\'ll bring the ice. I\'m mostly ice.']},
  {talk:'Rose',lines:['He can sit next to the duck.']},
  {walk:'Brain Freeze',to:[[20,13],[21,14]],speed:.4}, {despawn:'Brain Freeze'},
  {call:()=>setFlag('ns-frost',false)},
  {toast:'Goal: Amy’s house, the GREGORI door on Rivituso Row. Bring the scoops.',time:5}
];
// The party at Amy's house: the sundae, Deedee's cake, the candles, BONUS CHAPTER COMPLETE.
SCENES.nsEnd=()=>[
  {flag:'ns-done',value:'pending'},
  {place:'Amy',at:[7,5],dir:'down'}, {place:'Justin',at:[3,5],dir:'down'},
  {call:()=>{ const d=storySpawn({name:'Deedee',at:[4,4],look:'pip',dir:'down'}); d.sheet='deedee'; const b=storySpawn({name:'Boppy',at:[9,5],look:'gus',dir:'down'}); b.sheet='boppy'; }},
  {walk:'tom',to:[[6,7]],speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:[7,7],dir:'up'}, {place:'rose',at:[5,7],dir:'up'},
  {hearts:'Amy'},
  {talk:'Amy',lines:['You got them? All nine? Tom, I could KISS you. I\'ll not. I\'m sweaty.']},
  {talk:'Justin',lines:['Hold this. No, the other end. It\'s the banner. Don\'t touch the copper.']},
  {talk:'Deedee',lines:['Cake is out of the oven. Dairy free. I checked the box nine times.']},
  {talk:'Boppy',lines:['Nine scoops. In my day we got one scoop. And a lecture.']},
  {sfx:'doorIn'},
  spawnAt('Brain Freeze','brainfreeze',[6,9],{dir:'up',mscale:1.2,carry:'nsphoto'}),
  {walk:'Brain Freeze',to:[[6,8]],speed:.35,onStep:()=>sfx.thud()},
  {talk:'Brain Freeze',lines:['I brought ice. Where do you want the ice.']},
  {talk:'Boppy',lines:['Nobody told me there\'d be a FREEZER at the table.']},
  {talk:'Deedee',lines:['He\'s a guest, Boppy. Sit. He can sit next to you. You could use the cold on that knee.']},
  {talk:'Tom',lines:['Everybody, this is the Nine Scoop Sundae. Vanilla, strawberry, mint, chocolate, cookie dough, coffee, peanut butter, lemon, and black and white cookie on top.']},
  {trace:'ns-sundae'}, {call:()=>sfx.levelChime()},
  {talk:'Grace',lines:['Moo-rielle gets her own tiny scoop. Mint. She earned it.']},
  {talk:'Amy',lines:['Candles! Everybody sing! Grace, make a wish!']},
  {call:()=>{ sfx.fanfare(); }},
  {wait:1},
  {call:()=>{ sfx.blow(); sfx.quack(.3); }},
  {talk:'Rose',lines:['...I blew them out. The duck made me.']},
  {talk:'Grace',lines:['ROSE.']},
  {talk:'Tom',lines:['Relight. Nine candles. Hold still, please.']},
  {call:()=>sfx.fireball()},
  {wait:.8},
  {talk:'Grace',lines:['Okay. For real this time. I wish...','I\'m not telling. That\'s the rule. I didn\'t make the rule.']},
  {call:()=>{ sfx.blow(); sfx.birthdayChime(.3); }},
  {hearts:'grace'}, {hearts:'tom'},
  {talk:'Brain Freeze',lines:['...This is a good birthday. I\'m putting it on my door.']},
  {fade:'out',time:.8}, {card:NS,done:true,time:3.6}, {flag:'ns-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'Bonus chapter complete! Long Island is yours. Brain Freeze is staying for cake.',time:6}
];
TRIGGERS.push(
  {id:'ns-goal',map:'town',when:{...NSC,flag:'ns-open',notFlag:'ns-goal'},scene:'nsGoal'},
  {id:'ns-creamery',map:'bakery',when:{...NSC,flag:'ns-goal',notFlag:'ns-creamery'},scene:'nsCreamery'},
  {id:'ns-fountain',map:'town',at:[9,8,16,14],when:{...NSC,flag:'ns-creamery',notFlag:'ns-fountain'},scene:'nsFountain'},
  {id:'ns-trail',map:'hollow',at:[4,13,11,20],when:{...NSC,flag:'ns-fountain',notFlag:'ns-trail'},scene:'nsTrail'},
  {id:'ns-pond',map:'hollow',at:[13,1,22,15],when:{...NSC,flag:'ns-trail',notFlag:'ns-pond'},scene:'nsPond'},
  {id:'ns-retry',map:'hollow',at:[15,9,22,15],when:{...NSC,flag:'ns-retry',notFlag:'ns-clear'},scene:'nsRetry'},
  {id:'ns-after',map:'hollow',when:{...NSC,flag:{'battle:brainfreeze':'win','ns-printer':true},notFlag:'ns-clear'},scene:'nsAfterBoss'},
  {id:'ns-end',map:'amyhouse',when:{...NSC,flag:'ns-clear',notFlag:'ns-done'},scene:'nsEnd'}
);

// ---------- Map rules ----------
// The bakery is the creamery for the day; its hollow is monster free (the story spawns its own); the ways to the school and the pier are closed.
const BAKERY_WAS={name:houseById.bakery.name,label:houseById.bakery.label};
STORY_WORLD.push(()=>{
  const b=houseById.bakery,on=inBonus();
  if(on&&b.label!=='SCOOPS') { b.name='Sprinkle Street Creamery'; b.label='SCOOPS'; if(worlds.bakery) worlds.bakery.name=b.name; if(typeof refreshAreaUI==='function') refreshAreaUI(); }
  else if(!on&&b.label==='SCOOPS') { b.name=BAKERY_WAS.name; b.label=BAKERY_WAS.label; if(worlds.bakery) worlds.bakery.name=b.name; if(typeof refreshAreaUI==='function') refreshAreaUI(); }
  const H=worlds.hollow; if(!H) return;
  for(const n of H.npcs) if(n.monster&&!n.scripted) {
    if(on&&!n.nsHid) { n.nsHid=true; n.hidden=true; n.move=null; }
    else if(!on&&n.nsHid) { n.nsHid=false; n.hidden=false; }
  }
});
HOLD_RULES.push(n=>inBonus()&&!n.scripted);
if(worlds.bakery) for(const n of worlds.bakery.npcs) if(n.name==='Bun') { n.away=(n.away||[]).concat([{chapter:NS}]); AWAY_NPCS.push({map:worlds.bakery,n}); }
for(const [id,at,name,lines] of [['town',[[29,9],[29,10]],'School gate',['The gate to Long Island Elementary is locked. It\'s Saturday. It\'s a BIRTHDAY.']],['row',[[14,21],[15,21]],'Pier path',['A sign on the branch: CATTAIL PIER. CLOSED. THE FISH ARE AT A PARTY.']]]) {
  const M=worlds[id]; if(M&&M.spec) (M.spec.gates=M.spec.gates||[]).unshift({at,cond:{chapter:NS},name,lines});
}

// ---------- Map effects: carried squishies, the present, ice cubes, frost, the camera flash ----------
const NSFX={flash:0};
STORY_MAPFX.push(time=>{
  if(!inBonus()) return;
  const f=NSFX; if(f.flash>0) f.flash=Math.max(0,f.flash-.016);
  const girl=id=>followers.find(x=>x.member&&x.member.id===id);
  const g=girl('grace'),r=girl('rose');
  const at=a=>{ const p=position(a); return {cx:Math.round((p.x+.5)*T),base:Math.round((p.y+1)*T-2-(a.lift||0))}; };
  // Grace's cow under one arm, Rose's duck in both hands, Tom's wrapped present on his back
  if(g&&!g.hidden&&flag('ns-cow')&&!flag('ns-cow-stolen')) { const q=at(g); SPR(NS_COW,NS_COW_PAL,q.cx+4,q.base-22,1); }
  if(r&&!r.hidden&&flag('ns-duck')) { const q=at(r); SPR(NS_DUCK,NS_DUCK_PAL,q.cx-16,q.base-20,1); }
  if(!player.hidden&&flag('ns-present')&&!flag('ns-printer')) { const q=at(player); drawGift(q.cx+(player.facing==='left'?10:-10),q.base-34); }
  // Rose frozen mid boo, Mr. Pistachio in his cube, and frost in the creamery
  if(r&&!r.hidden&&flag('ns-rosefrozen')) { const q=at(r); drawIceCube(q.cx,q.base-26,26,28,time); }
  if(flag('ns-cube')) for(const n of currentMap.npcs) if(n.name==='Mr. Pistachio'&&!n.hidden) { const q=at(n); drawIceCube(q.cx,q.base-30,28,32,time); }
  if(currentMap.id==='bakery'&&flag('ns-frost')) {
    const M=currentMap; gfx.globalAlpha=.22; rect(0,0,M.w*T,M.h*T,'#aee6ff');
    for(let k=0;k<26;k++) { const n=(k*7919)%(M.w*M.h),x=(n%M.w)*T+((k*13)%T),y=(((n/M.w)|0)*T+(time*18+k*17)%(M.h*T))%(M.h*T); gfx.globalAlpha=.7; rect(Math.round(x),Math.round(y),2,2,'#ffffff'); }
    gfx.globalAlpha=1;
  }
  // The monsters carry things too (a Cone Head with the cow, Brain Freeze with the photo on its door)
  for(const n of currentMap.npcs) if(n.carry&&!n.hidden&&n.monster) { const q=at(n); if(n.carry==='nscow') SPR(NS_COW,NS_COW_PAL,q.cx+8,q.base-30,1); if(n.carry==='nsphoto') SPR(NS_PHOTO,NS_PHOTO_PAL,q.cx-7,q.base-20,1); }
  if(f.flash>0) { gfx.globalAlpha=f.flash; rect(camera.x-40,camera.y-40,W*3+80,H*3+80,'#ffffff'); gfx.globalAlpha=1; }
});
// Keep the monster prop drawer from trying STORY_PROPS it does not know (Cone Head / Brain Freeze carry keys live above).
STORY_PROPS.nscow=()=>{}; STORY_PROPS.nsphoto=()=>{};

// ---------- Fight tips ----------
Object.assign(TUTORIALS,{
  nsGremlin:{tips:[
    {id:'row',who:'grace',dir:'up',text:'Three gremlins. Grace’s Runway Walk and Tom’s wide moves hit a whole row at once. ▲ Skills.'},
    {id:'tombo',who:'rose',dir:'left',when:u=>b2TomboRows(u).some(r=>!r.why),text:'HEART is ready. ◀ TOMBO: Double-Decker Airplane.'}]},
  nsSlug:{
    setup() { const s=B2.foes[0]; if(s) { s.st.goofed={turns:1}; B2.heart=Math.max(B2.heart,30); } b2Render(); },
    tips:[
      {id:'free',who:'*',text:'The slug is Goofed from Rose’s BOO: a free round. Every third turn it melts and skips anyway. Cozy and Sparkle moves melt it faster.'},
      {id:'tombo',who:'tom',dir:'left',when:u=>b2TomboRows(u).some(r=>!r.why),text:'HEART is ready. ◀ TOMBO: Hi Guys, Welcome Back! heals everyone and warms the slug up.'}]},
  nsCone:{tips:[
    {id:'pass',who:'*',text:'Every third turn a cone passes a scoop to its friend: a heal. Knock one cone out first and the pass has nowhere to go.'},
    {id:'inspect',who:'grace',text:'B, or tapping the portrait in the middle, Inspects a cone: Cozy and Chatter are its weak spots. Rose’s RASPBERRY is Chatter.'}]},
  nsBoss1:{tips:[
    {id:'warn',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='all'),text:'A Brain Freeze is coming (!! on the turn ribbon). It hits everyone. Heal up after!'},
    {id:'tombo',who:'tom',dir:'left',when:u=>b2TomboRows(u).some(r=>!r.why),text:'HEART is ready. ◀ TOMBO: Double-Decker Airplane stuns; Hi Guys, Welcome Back! heals.'}]},
  nsBoss2:{
    setup() { const f=B2.foes.find(x=>x.boss); if(f) { f.hp=Math.round(f.maxHp*.6); f.phase=2; f.step='A'; f.phaseNew=true; } B2.heart=Math.max(B2.heart,75); b2Render(); },
    tips:[
      {id:'wish',who:['tom','grace','rose'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='wish'&&!r.why),text:'◀ TOMBO: BIRTHDAY WISH. All three of you. Nine candles and a wish on every enemy. It breaks the ICE SHELL too.'},
      {id:'shell',who:'*',when:()=>B2.foes.some(f=>f.shield&&b2Alive(f)),text:'ICE SHELL! 2 Cozy or Sparkle hits crack it before the Deep Freeze. Any Tombo breaks it at once.'},
      {id:'instax',who:'grace',dir:'up',text:'Grace’s new INSTAX (▲ Skills): a flash that Goofs every enemy and warms them up.'}]}
});
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{beginBonus,NSFX}); });
})();
