'use strict';
// data/scenes.js — Cutscene scripts for engine/story.js (step reference at SCENE_OPS there).
// A scene is an array of steps, or a function returning one (it runs when the scene starts, so it can use where things are).
const SCENES={};

// The opening (START NEW): Tom steps out of Long Island Taxi Co. alone, Grace and Rose shout TATA!!! and run in from the west,
// jump on him for a hug, Rose climbs onto his shoulders, Grace shows off her squishy, then both join the party.
SCENES.opening=()=>{
  const h=houseById.taxi,dx=h.door.x,dy=h.door.y,row=dy+2,gStart=10,rStart=9;
  const gTiles=[],rTiles=[];
  for(let x=gStart+1;x<=dx-1;x++) gTiles.push([x,row]);
  for(let x=rStart+1;x<=dx-1;x++) rTiles.push([x,row+1]);
  return [
    {noGo:[9,dy+1,27,dy+3]},                       // keep villagers from wandering through the scene
    {wait:.7},
    {call:()=>sfx.doorOut()}, {show:'tom'}, {place:'tom',at:[dx,dy],dir:'down'},
    {wait:.35},
    {walk:'tom',to:[[dx,dy+1],[dx,row]],speed:.3},
    {wait:.3},
    {step:stretchStep()},
    {talk:'Tom',lines:["Oof, I'm finally here! At least the 6 hours went by fast on Delta One! ;)"],voice:[['tom','intro1']]},
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
    {talk:'Grace',lines:["TATA! You're BACK!",'We waited for you for a hundred years.'],voice:[['grace','intro1'],['grace','intro2']]},
    {talk:'Rose',lines:['A hundred MILLION years!','Tata, up! Up up up!'],voice:[['rose','intro1'],['rose','intro2']]},
    {call:()=>{ const r=sceneActor('rose'); snd.whee(); snd.oof(.38); r.depthBias=-.05; r.facing='left'; }},
    {hop:'rose',from:[dx-1,row+1],to:[dx,row],time:.5,arc:22,lift:[0,SHOULDER]},
    {call:()=>{ const r=sceneActor('rose'); r.x=dx; r.y=row; r.scr={x:dx,y:row}; r.lift=SHOULDER; r.noShadow=true; r.seat=true; sfx.giggle(); }},
    {trace:'rose-shoulders'}, {flag:'tombo:rose1'},   // Double-Decker Airplane unlocks here (chapter 1)
    {talk:'Rose',lines:['I\'m the tallest! Giddyup, Tata!'],voice:[['rose','intro3']]},
    {talk:'Tom',lines:['Hello, Rose. Please keep your arms and legs inside the uncle at all times.'],voice:[['tom','intro2']]},
    {face:'grace',dir:'right'}, {call:()=>{ intro.squishy={t:0}; snd.squeak(); }},
    {wait:.7},
    {call:()=>{ intro.showcase={t:0}; snd.sparkle(); }},
    {talk:'Grace',lines:["Tata, LOOK. A sparkling diamond gold dumpling squishy!","It's limited edition. There are only two in the whole world. You can squeeze it!"],voice:[['grace','intro3'],['grace','intro4']]},
    {call:()=>{ intro.showcase=null; snd.squeak(); }},
    {flag:'saw-squishy'}, {flag:'tombo:grace1'},      // Squishy Delivery unlocks here (chapter 1)
    {talk:'Tom',lines:['That\'s the shiniest dumpling I\'ve ever seen. And I\'ve seen a LOT of dumplings.'],voice:[['tom','intro3']]},
    {talk:'Rose',lines:["Come on, Tata! Let's go!"],voice:[['rose','intro4']]},
    {call:()=>{ intro.squishy=null; snd.whee(true); const r=sceneActor('rose'); r.noShadow=false; r.seat=false; }},
    {hop:'rose',from:[dx,row],to:[dx-1,row+1],time:.45,arc:14,lift:[SHOULDER,0]},
    {flag:'opening-done'},
    {call:finishOpening}
  ];
};

// ======================================================================================================
// CHAPTER 1: The Soup Dumpling Protocol (build plan C1). Long Island only; no flights.
// Flags, in story order: opening-done, ch1-goal, ch1-theft (Deedee joins), ch1-t1, ch1-t2, ch1-tuts (the three tutorial
// fights are done; Grump Hollow's monsters wake up), ch1-pond (the Big One surfaces), ch1-crown (it wears the tin),
// battle:bigone ('win'), ch1-tin (tin back), ch1-done. Tombos: tombo:grace1 and tombo:rose1 (opening), tombo:deedee1 (theft).
// ======================================================================================================
const CH1_TIN_LINE='Take the tin home to Rivituso Row.';

// 1. Right after the opening: why we are going to Deedee's.
SCENES.ch1Goal=[
  {flag:'ch1-goal'},
  {talk:'Grace',lines:['Tata! Deedee made rhubarb crisp for you. It\'s cooling RIGHT NOW.']},
  {talk:'Rose',lines:['I already licked the spoon. Don\'t tell.']},
  {talk:'Tom',lines:['Then we had better hurry. Before somebody licks the rest.']},
  {toast:'New Tombos: Squishy Delivery (Grace) and Double-Decker Airplane (Rose). In battle, ◀ TOMBO.',time:4},
  {toast:"Goal: Deedee and Boppy's house. Rivituso Row, south of the Square.",time:4.5}
];

// 2. Deedee and Boppy's house: the greeting, Tom's loaf, and the theft. Deedee joins.
SCENES.ch1Theft=[
  {flag:'ch1-theft'},
  {place:'Deedee',at:[5,6],dir:'down'}, {place:'Boppy',at:[8,5],dir:'down'},
  {walk:'tom',to:[[6,7]],speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:[7,7],dir:'up'}, {place:'rose',at:[5,7],dir:'up'},
  {hearts:'Deedee'},
  {talk:'Deedee',lines:["There's my Tommy!",'And my girls! Come here, come here.'],voice:[['deedee','greet',0,"There's my Tommy!"]]},
  {trace:'deedee-hug'},
  {talk:'Deedee',lines:['Tom, you\'re skin and bones. Sit. The crisp needs ten minutes on the counter.']},
  {talk:'Deedee',lines:['Where are my reading glasses? I had them one second ago. I need to read the timer.']},
  {talk:'Grace',lines:['Deedee. They\'re on your head.']},
  {talk:'Deedee',lines:['So they are. Not one word to Boppy.']},
  {talk:'Tom',lines:['I brought you a sourdough loaf. Baked it yesterday. It flew here on my lap.']},
  {talk:'Deedee',lines:['Your bread and my rhubarb crisp. Now THAT is a meal.']},
  {talk:'Deedee',lines:['A sliver for me. Just a sliver. Sourdough gives me gas.']},
  {talk:'Tom',lines:['Mom, EVERYTHING gives you gas.']},
  {talk:'Deedee',lines:['And I eat it anyway. That\'s love, Tommy.']},
  {flag:'tombo:deedee1'},
  {talk:'Boppy',lines:["Tom! Good. I'm not feeling good. It's the stomach."],voice:[['boppy','greet',0,"Tom! Good. I'm not feeling good. It's the stomach."]]},
  {sfx:'doorIn'},
  {spawn:{name:'Big Mudling',monster:'mudling',mscale:2,at:[6,9],dir:'up'}},
  {walk:'Big Mudling',to:[[6,8],[5,8],[4,8]],speed:.32,onStep:()=>sfx.splat()},
  {face:'Big Mudling',dir:'up'},
  {wait:.3},
  {call:()=>{ const m=sceneActor('Big Mudling'); if(m) m.carry='tin'; sfx.pickup(); }},
  {face:'rose',dir:'left'}, {face:'grace',dir:'left'}, {face:'tom',dir:'left'},
  {talk:'Rose',lines:['Deedee! A mud blob is taking your PIE!']},
  {walk:'Big Mudling',to:[[5,8],[6,8],[6,9]],speed:.22,onStep:()=>sfx.splat()},
  {sfx:'doorOut'}, {despawn:'Big Mudling'},
  {talk:'Tom',lines:['That was UNCALLED for!'],voice:[['tom','hurt',0,'That was UNCALLED for!']]},
  {talk:'Deedee',lines:['That\'s my GOOD tin! Grab your shoes. I\'m coming with you.']},
  {talk:'Boppy',lines:['I TOLD you something lives in that pond. Twenty years I\'ve been saying it. Nobody listens to Boppy.','I\'d come, but the stomach. Bring me back that fish.']},
  {join:'deedee'},
  {wait:2.8},
  {toast:'New Tombo: Wine and Gossip (Tom + Deedee).',time:3},
  {toast:'Goal: follow the thief into Grump Hollow, north of the Square.',time:4.5}
];

// 3. Grump Hollow: three tutorial fights on the path in.
const CH1_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'Deedee',lines:['Up, up. Everybody up. Deedee kisses it better.','There. Good as new. Try not to do that again.']}],else:[]},
  ...lines
];
SCENES.ch1Mudling=[
  {flag:'ch1-t1'},
  {walk:'tom',to:[[9,19]],speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:[10,19],dir:'up'}, {place:'rose',at:[10,20],dir:'up'}, {place:'deedee',at:[9,20],dir:'up'},
  {talk:'Deedee',lines:['Crumbs! Rhubarb crumbs. That little thief went right through here.']},
  {place:'Mudling',at:[9,16]},
  {talk:'Rose',lines:['Tata. The mud is MOVING.']},
  {sfx:'look'},
  {walk:'Mudling',to:[[10,16],[10,17],[9,17]],speed:.35},
  {talk:'Mudling',lines:['Blub. The pie went that way. You can\'t have it. Blub.']},
  {talk:'Grace',lines:['Okay, everybody. Tata is in front. I\'m in charge of choreography. FIGHT!']},
  {battle:'mudling',tut:'basics'},
  ...CH1_AFTER(()=>flag('battle:mudling')!=='win',[
    {talk:'Deedee',lines:['Good job, girls. The crumbs keep going north.']}])
];
SCENES.ch1Skeeter=[
  {flag:'ch1-t2'},
  {place:'Skeeter Swarm',at:()=>[Math.min(21,player.x+3),player.y]},
  {sfx:'whoosh'},
  {walk:'Skeeter Swarm',to:()=>[[player.x+2,player.y],[player.x+1,player.y]],speed:.2},
  {talk:'Skeeter Swarm',lines:['Bzzz. Somebody smells like rhubarb. Bzzzzz.']},
  {talk:'Grace',lines:['Ew. Ew ew ew. Nobody touch my hair.']},
  {battle:'skeeter',tut:'dance'},
  ...CH1_AFTER(()=>flag('battle:skeeter')!=='win',[
    {talk:'Deedee',lines:['Everybody okay? Itchy isn\'t hurt. Keep walking.']}])
];
SCENES.ch1Grump=[
  {flag:'ch1-tuts',value:'pending'},
  {place:'Pond Grump',at:()=>[player.x+1,player.y-2]},
  {walk:'Pond Grump',to:()=>[[player.x+1,player.y-1]],speed:.4,onStep:()=>sfx.splat()},
  {talk:'Pond Grump',lines:['Grrrumble. You\'re standing in my puddle. And the small one is LAUGHING at me.']},
  {talk:'Rose',lines:['I\'m not laughing. I\'m giggling. It\'s different.']},
  {talk:'Pond Grump',lines:['That\'s IT. Soggy Slap. For the giggler.']},
  {battle:'grump',tut:'defend'},
  ...CH1_AFTER(()=>flag('battle:grump')!=='win',[]),
  {flag:'ch1-tuts'},
  {hearts:'deedee'}, {heal:true},
  {talk:'Deedee',lines:['Hugs for everyone. There. All better.','The crumbs go around the pond. Toward Boppy’s fishing spot.']},
  {talk:'Grace',lines:['Boppy says the Big One lives over there.']},
  {talk:'Tom',lines:['Boppy also says the stomach thing is serious. Stay close.']},
  {toast:'Goal: follow the crumbs east, around the pond. The Hollow’s monsters are awake now.',time:5}
];

// 4. The pond: the thief hands the tin to The Big One. Boss fight.
SCENES.ch1Pond=[
  {flag:'ch1-pond'}, {call:()=>storyWorld()},
  {hide:'The Big One'},
  {spawn:{name:'Big Mudling',monster:'mudling',mscale:2,at:[21,15],dir:'up',carry:'tin'}},
  {walk:'Big Mudling',to:[[21,14],[20,14],[20,13],[19,13],[19,12]],speed:.3,onStep:()=>sfx.splat()},
  {talk:'Grace',lines:['THERE! The thief! He still has the tin!']},
  {face:'Big Mudling',dir:'left'},
  {call:()=>{ sfx.splat(); sfx.thud(); }},
  {show:'The Big One'}, {face:'The Big One',dir:'right'},
  {talk:'The Big One',lines:['GLUB. Is that a pie? For me?']},
  {talk:'Big Mudling',lines:['Blub. For you, boss.']},
  {call:()=>{ const m=sceneActor('Big Mudling'); if(m) m.carry=null; setFlag('ch1-crown'); sfx.pickup(); }},
  {walk:'Big Mudling',to:[[20,12]],speed:.3},
  {call:()=>sfx.splat()}, {despawn:'Big Mudling'},
  {face:'The Big One',dir:'down'},
  {talk:'The Big One',lines:['It fits. I\'m a king now. GLUB.']},
  {talk:'Deedee',lines:['That\'s my GOOD tin, you overgrown handbag!']},
  {talk:'Rose',lines:['Tata, he looks like a turtle wearing a hat.']},
  {talk:'Tom',lines:['Nobody touches Deedee’s crisp. Everybody ready?']},
  {battle:'bigone',tut:'bigone'},
  {if:()=>flag('battle:bigone')!=='win',then:[
    {heal:true},
    {talk:'Deedee',lines:['Up, up. Everybody up. Deedee kisses it better.','Tommy, you stand in front of whoever it stares at. Rosie, make it laugh. Then we try again.']},
    {toast:'Face The Big One and press A to try again. Deedee healed everyone.',time:5}],else:[]}
];
// 5. After The Big One (won in the scene, or on a retry with A): the tin comes back.
SCENES.ch1AfterBoss=[
  {flag:'ch1-tin'}, {flag:'ch1-crown',value:false},
  {call:()=>sfx.pickup()},
  {if:()=>!!flag('kind:bigone'),
    then:[{talk:'The Big One',lines:['Glub. Nobody ever made me laugh before. You can have your tin back.']}],
    else:[{talk:'The Big One',lines:['Glub. Fine. Take your tin. I\'m going back in the pond to think about things.']}]},
  {talk:'Deedee',lines:['My tin! And look. Half the crisp is still in it.']},
  {talk:'Grace',lines:['The Big One ate the other half. I saw crumbs on its chin.']},
  {talk:'Deedee',lines:['Then we split this half. Everybody home. Boppy has to hear about this.']},
  {toast:'Goal: '+CH1_TIN_LINE,time:4.5}
];
// 6. Home: half a crisp, Boppy's lure, chapter complete.
SCENES.ch1End=()=>[
  {flag:'ch1-done',value:'pending'},
  {place:'Boppy',at:[8,5],dir:'down'},
  {walk:'tom',to:[[6,7]],speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:[7,7],dir:'up'}, {place:'rose',at:[5,7],dir:'up'}, {place:'deedee',at:[5,6],dir:'right'},
  {talk:'Boppy',lines:['You found the Big One? I TOLD everybody. Twenty years.']},
  ...(bag.includes('lure')?[
    {talk:'Tom',lines:['It had this stuck in its lip.']},
    {talk:'Boppy',lines:['My LURE! I lost that in 2006. Still shiny. Unlike me.','Keep it, Tom. For luck. The fish clearly didn\'t want it.']}]:[]),
  {talk:'Deedee',lines:['Sit. Everybody sit. Half a crisp is still a crisp.']},
  {trace:'ch1-crisp'}, {hearts:'tom'}, {call:()=>sfx.levelChime()},
  {talk:'Rose',lines:['This is the best half a crisp I ever had.']},
  {talk:'Grace',lines:['Tata, you\'re staying the WHOLE week, right?']},
  {talk:'Tom',lines:['The whole week. And nobody is stealing anything else.']},
  {talk:'Boppy',lines:['Slow down. Everybody eats too fast. My stomach.']},
  {fade:'out',time:.8}, {card:1,done:true,time:3.4}, {flag:'ch1-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'Chapter 1 complete! Chapter 2 is still being built. Long Island is yours to explore.',time:6}
];

// ======================================================================================================
// CHAPTER 2: Smog on 2nd Avenue (build plan C2). Tom flies to LA alone; TNB and Nara join; purple smog from Griffith Park.
// Flags, in story order: ch2-sal (Sal's brakes line), ch2-goal, ch2-tnb (TNB joins), met-nara, ch2-nara (Nara joins,
// tombo:nara1), ch2-starter, ch2-smog (the smog rolls in; neighbors in a trance), tombo:tnb1, ch2-lawn (the 2nd Ave fight),
// ch2-odette, ch2-carmen, ch2-source (the trail opens), ch2-t1, ch2-tuts, ch2-boss, battle:bigshake ('win'), ch2-clear, ch2-done.
// ======================================================================================================
const CH2={mode:'full',chapter:2};
// A walk route along the map from where the actor stands now to (x,y) (for walks that start wherever Tom happens to be).
const routeTo=(a,x,y)=>()=>{ const n=sceneActor(a); return n?findPath(currentMap,n,{x,y}).map(p=>[p.x,p.y]):[]; };

// 1. Landing downtown: where TNB is.
SCENES.ch2Arrive=[
  {flag:'ch2-goal'},
  {talk:'Tom',lines:['TNB said he\'d be home. Spring Street loft. He\'s never home.','...He said he\'d be home.']},
  {toast:"Goal: TNB's Loft (LOFTS), Spring Street, bottom middle of Downtown.",time:4.5}
];
// 2. The loft: the heart-kiss greeting. TNB joins.
SCENES.ch2Loft=[
  {flag:'ch2-tnb'},
  {place:'TNB',at:[6,5],dir:'down'},
  {walk:'tom',to:routeTo('tom',6,6),speed:.22}, {face:'tom',dir:'up'},
  {call:()=>{ const t=sceneActor('TNB'); if(t) { kiss={npc:t,start:elapsedTime}; sfx.kiss(); } }},
  {talk:'TNB',lines:['Well, well, well...'],voice:[['tnb','greet',0,'Well, well, well...']]},
  {talk:'TNB',lines:['Look who flew three thousand miles to see me.']},
  {talk:'Tom',lines:['I flew three thousand miles to see you. The starter is the bonus.']},
  {talk:'TNB',lines:['Main event. I\'ll take it. Sounds premium. Like your seat.']},
  {trace:'tnb-hello'},
  {talk:'TNB',lines:['My call time got pushed to Thursday. The lead actor lost a shoe. I already found it. So I\'m all yours.',
    'Also, something is up. The sky over Griffith Park went purple this morning. Not sunset purple. Weird purple.']},
  {talk:'Tom',lines:['All yours. I like that. We\'ll look, together. One quick stop first. My starter has been alone for a week.']},
  {join:'tnb'},
  {wait:2.6},
  {toast:'Goal: home to 2nd Ave in Jefferson Park, south of Downtown. Tom’s house is 3468.',time:4.5}
];
// 3. Jefferson Park: Nara is waiting on Tom's porch (her meeting scene is engine/nara.js). Then she joins, and the boule (Sit. Paw. Treat.).
SCENES.ch2Porch=[
  {flag:'ch2-nara'},
  {join:'nara'},
  {wait:.6},
  {talk:'TNB',lines:['Olivia dropped her off this morning. Family trip to the desert. No dogs at the hotel.','She\'s been sitting on your porch since eight. I tried to take her to the loft. She refused.']},
  {talk:'TNB',lines:['Also, your starter was bubbling out of the jar, so I baked a boule with it. Don\'t be mad.']},
  {talk:'Tom',lines:['Mad? I\'m proud. And a little mad.']},
  {call:()=>{ sfx.whoosh(); }},
  {talk:'Nara',lines:['Tom tears off the heel and holds it up. "Sit." Nara sits, wiggling all over. "Paw." She gives him her paw. Very, very hard.','She gets the bread. Tom gets a lick.']},
  {call:()=>{ sfx.bark&&sfx.bark(); sfx.bark&&sfx.bark(.15); }},
  {hearts:'nara'},
  {flag:'tombo:nara1'},
  {talk:'Tom',lines:['Sit, paw, treat. She knows the whole routine. Very polite. Very strong paw.']},
  {toast:'New Tombo: Sit. Paw. Treat. (Tom + Nara). In battle, ◀ TOMBO.',time:3.6},
  {toast:'Goal: feed the starter. Kitchen island, inside Tom’s house.',time:4.5}
];
// 4. Tom's kitchen: feeding Bready Mercury. Through the window, the sky is purple.
SCENES.ch2Starter=[
  {flag:'ch2-starter'},
  {walk:'tom',to:routeTo('tom',8,8),speed:.22}, {face:'tom',dir:'right'},   // beside the kitchen island, where the jar lives
  {talk:'Tom',lines:['Hello, Bready Mercury. Did you miss me? You missed me.']},
  {call:()=>{ sfx.splat&&sfx.splat(); }},
  {talk:'Tom',lines:['Fifty grams of flour, fifty grams of water. Stir. Look at those bubbles. Proud of you.']},
  {trace:'starter'}, {hearts:'tom'},
  {talk:'TNB',lines:['You talk to that jar more than you talk to me.']},
  {talk:'Tom',lines:['The jar gets fifty grams of flour. You get the whole week.','...And you steamed my shirts for the flight. You win. You always win.']},
  {talk:'TNB',lines:['I\'ll take it.']},
  {call:()=>sfx.whine&&sfx.whine()},
  {talk:'Nara',lines:['Nara is at the front window, whining. Her tail is down.']},
  {talk:'TNB',lines:['Babe. Look outside. Is the street... purple?']},
  {toast:'Goal: go out to 2nd Ave and see what\'s going on.',time:4}
];
// 5. 2nd Ave: the smog rolls in. Mr. Washington stops mid-story. Two Smoglets drift onto the street. First fight.
SCENES.ch2Smog=[
  {flag:'ch2-smog'}, {call:()=>{ storyWorld(); sfx.whoosh(); }},
  {wait:.8},
  {place:'Mr. Washington',at:[7,19],dir:'left'},
  {walk:'tom',to:routeTo('tom',5,19),speed:.22}, {face:'tom',dir:'right'},
  {place:'tnb',at:[4,19],dir:'right'}, {place:'nara',at:[5,20],dir:'up'},
  {talk:'Tom',lines:['Mr. Washington! Is everything okay?']},
  {talk:'Mr. Washington',lines:['Tom. Back in 1979, this whole block...']},
  {wait:1.2},
  {talk:'Mr. Washington',lines:['...']},
  {talk:'TNB',lines:['He\'s been on "this whole block" for a while, babe.']},
  {talk:'Mr. Washington',lines:['Such a nice afternoon. It should always be this afternoon.']},
  {talk:'Tom',lines:['Excuse me, smog. That was UNCALLED for.'],voice:[['tom','hurt',0,'That was UNCALLED for!']]},
  {spawn:{name:'Smoglet',monster:'smoglet',at:[12,19],dir:'left'}},
  {spawn:{name:'Smoglet B',monster:'smoglet',at:[13,20],dir:'left'}},
  {all:[{walk:'Smoglet',to:[[11,19],[10,19],[9,19],[8,19]],speed:.4},{walk:'Smoglet B',to:[[12,20],[11,20],[10,20],[9,20],[8,20]],speed:.36}]},
  {talk:'Smoglet',lines:['Cough. Nice street. We\'re going to sit on it for a while. Forever, actually.']},
  {talk:'TNB',lines:['Babe. Remember movie night? You threw the whole popcorn bowl.']},
  {talk:'Tom',lines:['I was startled. Briefly. With dignity.']},
  {talk:'TNB',lines:['It was a battle plan. You just didn\'t know it yet.']},
  {flag:'tombo:tnb1'},
  {toast:'New Tombo: Popcorn Jump (Tom + TNB).',time:2.6},
  {battle:()=>findMonster('smoglet'),tut:'ch2lawn'},
  {despawn:'Smoglet'}, {despawn:'Smoglet B'},
  {if:()=>flag('battle:smoglet')!=='win',then:[{heal:true},{talk:'TNB',lines:['Okay. Okay. Everybody breathe. Through the nose. Not the smog.']}],else:[]},
  {flag:'ch2-lawn'},
  {talk:'TNB',lines:['They\'re gone, but he\'s still out of it. Look at him.']},
  {talk:'Mr. Washington',lines:['Nobody needs to go anywhere. Nobody needs to get any older.']},
  {talk:'Tom',lines:['That\'s not a Mr. Washington sentence. Let\'s check on the boulevard. Miss Odette and Doña Carmen.']},
  {toast:'Goal: check on Miss Odette (CREOLE) and Doña Carmen (PUPUSAS) on Jefferson Boulevard.',time:5}
];
// 6. The boulevard: both kitchens are stuck in the same afternoon.
SCENES.ch2Odette=[
  {flag:'ch2-odette'},
  {talk:'Miss Odette',lines:['Stirring. Stirring. The gumbo never has to be done, baby. Isn’t that nice?']},
  {talk:'TNB',lines:['She\'s made that gumbo every day for fifty years. It\'s never once been "never done."']},
  {talk:'Tom',lines:['The smog wants everything to stay exactly the same. Forever. That\'s not a nice afternoon. That\'s a hostage situation.']},
  {if:()=>!flag('ch2-carmen'),then:[{toast:'Goal: Doña Carmen next door (PUPUSAS).',time:3.5}],else:[]}
];
SCENES.ch2Carmen=[
  {flag:'ch2-carmen'},
  {talk:'Doña Carmen',lines:['The pupusas are fine. Everything is fine. It\'s always this afternoon. Why did I ever flip them?']},
  {call:()=>sfx.sizzle?sfx.sizzle():sfx.whoosh()},
  {talk:'Nara',lines:['Nara sniffs the comal. She sneezes. The smoke smells like the hills.']},
  {talk:'TNB',lines:['Nara is right. That\'s not kitchen smoke. That\'s the same purple stuff.']},
  {if:()=>!flag('ch2-odette'),then:[{toast:'Goal: Miss Odette next door (CREOLE).',time:3.5}],else:[]}
];
// 7. Back outside: the smog is coming down from Griffith Park.
SCENES.ch2Source=[
  {flag:'ch2-source'},
  {talk:'TNB',lines:['Babe. Look north. It\'s all coming down off the hills.','The Observatory. The pipes on the side are pumping it out like a smoke machine on a bad set.']},
  {talk:'Tom',lines:['Then that\'s where we\'re going. Nara, stay close.']},
  {talk:'Nara',lines:['Nara presses against Tom’s leg. She\'s not letting him go anywhere without her.']},
  {toast:'Goal: Griffith Park, north through Downtown. The trail is open now.',time:5}
];
// 8. Griffith Park: two story fights on the trail, then the Observatory.
const CH2_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'TNB',lines:['Up, everybody. Wardrobe says nobody is cut from this scene.']}],else:[]},
  ...lines
];
SCENES.ch2Flurry=[
  {flag:'ch2-t1'},
  {place:'Ticket Flurry',at:()=>[player.x+3,player.y-2]},
  {walk:'Ticket Flurry',to:()=>[[player.x+2,player.y-1],[player.x+1,player.y-1],[player.x+1,player.y]],speed:.25},
  {talk:'Ticket Flurry',lines:['Street cleaning. Tuesday. Eight to ten. You didn\'t read the sign. And the smog says we can stay forever.']},
  {talk:'TNB',lines:['I take the Metro. You have nothing on me.']},
  {battle:'tickets',tut:'ch2flurry'},
  ...CH2_AFTER(()=>flag('battle:tickets')!=='win',[{talk:'Tom',lines:['Contested. Appeal granted. Keep going.']}])
];
SCENES.ch2Coyote=[
  {flag:'ch2-tuts',value:'pending'},
  {place:'Canyon Coyote',at:()=>[player.x-2,player.y-2]},
  {walk:'Canyon Coyote',to:()=>[[player.x-1,player.y-2],[player.x-1,player.y-1]],speed:.3},
  {talk:'Canyon Coyote',lines:['Nice hike. You look like you have snacks. And the dog looks like a snack.']},
  {talk:'Nara',lines:['Nara’s hackles go up. She stands right in front of Tom.']},
  {talk:'Canyon Coyote',lines:['Pack Howl. For the fluffy one.']},
  {battle:'coyote',tut:'ch2coyote'},
  ...CH2_AFTER(()=>flag('battle:coyote')!=='win',[]),
  {flag:'ch2-tuts'},
  {heal:true},
  {talk:'TNB',lines:['Quick wardrobe adjustment, quick heal, and a quick kiss for the road. Ready, babe?']},
  {call:()=>{ const t=sceneActor('tnb'); if(t) { kiss={npc:t,start:elapsedTime}; sfx.kiss(); } }},
  {talk:'Tom',lines:['Ready. Kiss accepted. The Observatory is up at the top left. Follow the purple.']},
  {toast:'Goal: the Observatory, top left of the park. The park’s monsters are awake now.',time:5}
];
// 9. The Observatory: the hill stands up. Boss fight.
SCENES.ch2Boss=[
  {flag:'ch2-boss'}, {call:()=>storyWorld()},
  {hide:'The Big Shake'},
  {call:()=>{ sfx.thud(); }},
  {talk:'TNB',lines:['The ground is humming. That\'s never a good sign. I\'ve seen this movie forty-seven times.']},
  {call:()=>{ sfx.thud(); sfx.whoosh(); }},
  {show:'The Big Shake'}, {face:'The Big Shake',dir:'right'},
  {talk:'The Big Shake',lines:['RUMBLE. Somebody plugged my pipes. Now everything is stuck. I LIKE stuck.','Stuck means nothing moves. Nothing changes. Nothing ever has to say goodbye.']},
  {talk:'Tom',lines:['Everybody says goodbye. Then they come back. That\'s what planes are for.','Things have to move.']},
  {talk:'Nara',lines:['Nara barks at the hill. Once. Very loudly. Then she checks that Tom saw.']},
  {talk:'TNB',lines:['Well, well, well... looks like we\'re in a bit of a shaky situation.']},
  {battle:'bigshake',tut:'bigshake'},
  {if:()=>flag('battle:bigshake')!=='win',then:[
    {heal:true},
    {talk:'TNB',lines:['Cut. Reset. Back to one, everybody.','Babe, heal right after the Aftershock. When it clogs up, hit it with water or sparkle. Or one of our Tombos.']},
    {toast:'Face The Big Shake and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 10. After the boss (won in the scene, or on a retry with A): the pipes unclog and the smog blows out to sea.
SCENES.ch2AfterBoss=[
  {flag:'ch2-clear'},
  {call:()=>{ sfx.whoosh(); sfx.levelChime&&sfx.levelChime(); }},
  {if:()=>!!flag('kind:bigshake'),
    then:[{talk:'The Big Shake',lines:['Rumble. You asked how I was doing. Nobody has asked in a million years.','...I\'ll let things move. A little. Two inches a year. That\'s my best offer.']}],
    else:[{talk:'The Big Shake',lines:['Rumble. Fine. The pipes are clear. I\'m going back under the hill to think about my choices.']}]},
  {talk:'TNB',lines:['Look. The sky is blue again. LA blue. Slightly brown, but blue.']},
  {talk:'Tom',lines:['Somebody plugged those pipes on purpose. Smog doesn\'t do that by itself.']},
  {talk:'TNB',lines:['Spooky. I love it. I hate it. Let\'s go check on Mr. Washington.']},
  {toast:'Goal: back to 2nd Ave in Jefferson Park.',time:4.5}
];
// 11. 2nd Ave: Mr. Washington finishes his sentence. Chapter complete.
SCENES.ch2End=[
  {flag:'ch2-done',value:'pending'},
  {place:'Mr. Washington',at:[7,19],dir:'left'},
  {walk:'tom',to:routeTo('tom',5,19),speed:.22}, {face:'tom',dir:'right'},
  {place:'tnb',at:[4,19],dir:'right'}, {place:'nara',at:[5,20],dir:'up'},
  {talk:'Mr. Washington',lines:['...smelled like gumbo on a Saturday night. Zydeco from the boulevard. Kids on every porch.','Where was I? Oh. I was done. That was the whole story.']},
  {talk:'Mr. Washington',lines:['Funny. For a while there I didn\'t want anything to change. Then I remembered the best parts all came from things changing.']},
  {talk:'Tom',lines:['Keep the old windows, though.']},
  {talk:'Mr. Washington',lines:['Keep the old windows. Smart man.']},
  {trace:'washington'},
  {talk:'TNB',lines:['Doña Carmen says the pupusas came out perfectly crispy. Miss Odette is sending over gumbo. The whole block is cooking.']},
  {talk:'Nara',lines:['Nara leans on both of them at once. Tiny excited puddle. Nobody minds.']},
  {call:()=>{ if(typeof naraPuddle==='function') { const n=sceneActor('nara'); if(n) naraPuddle(currentMap,n.x,n.y); } }},
  {talk:'Tom',lines:['Home. Both of them. Okay. Good.']},
  {hearts:'tom'}, {call:()=>sfx.levelChime()},
  {fade:'out',time:.8}, {card:2,done:true,time:3.4}, {flag:'ch2-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'Chapter 2 complete! When you\'re ready, Sol at Angel City Cab Co. (downtown) flies you home for chapter 3.',time:6}
];

// When each scene starts (engine/story.js storyTriggers). Every scene sets the flag that stops its own trigger.
const CH1={mode:'full',chapter:1};
const TRIGGERS=[
  {id:'ch1-goal',map:'town',when:{...CH1,flag:'opening-done',notFlag:'ch1-goal'},scene:'ch1Goal'},
  {id:'ch1-theft',map:'grands',when:{...CH1,notFlag:'ch1-theft'},scene:'ch1Theft'},
  {id:'ch1-t1',map:'hollow',at:[9,17,11,21],when:{...CH1,flag:'ch1-theft',notFlag:'ch1-t1'},scene:'ch1Mudling'},
  {id:'ch1-t2',map:'hollow',at:[1,1,22,15],when:{...CH1,flag:'ch1-t1',notFlag:'ch1-t2'},scene:'ch1Skeeter'},
  {id:'ch1-t3',map:'hollow',at:[1,1,22,14],when:{...CH1,flag:'ch1-t2',notFlag:'ch1-tuts'},scene:'ch1Grump'},
  {id:'ch1-pond',map:'hollow',at:[14,1,22,20],when:{...CH1,flag:'ch1-tuts',notFlag:'ch1-pond'},scene:'ch1Pond'},
  {id:'ch1-after',map:'hollow',when:{...CH1,flag:{'battle:bigone':'win'},notFlag:'ch1-tin'},scene:'ch1AfterBoss'},
  {id:'ch1-end',map:'grands',when:{...CH1,flag:'ch1-tin',notFlag:'ch1-done'},scene:'ch1End'},
  {id:'ch2-arrive',map:'blvd',when:{...CH2,notFlag:'ch2-goal'},scene:'ch2Arrive'},
  {id:'ch2-loft',map:'lofts',when:{...CH2,notFlag:'ch2-tnb'},scene:'ch2Loft'},
  {id:'ch2-porch',map:'jpark',when:{...CH2,flag:'met-nara',notFlag:'ch2-nara'},scene:'ch2Porch'},
  {id:'ch2-starter',map:'tomhouse',at:[2,5,13,17],when:{...CH2,flag:'ch2-nara',notFlag:'ch2-starter'},scene:'ch2Starter'},
  {id:'ch2-smog',map:'jpark',when:{...CH2,flag:'ch2-starter',notFlag:'ch2-smog'},scene:'ch2Smog'},
  {id:'ch2-odette',map:'creole',when:{...CH2,flag:'ch2-lawn',notFlag:'ch2-odette'},scene:'ch2Odette'},
  {id:'ch2-carmen',map:'pupuseria',when:{...CH2,flag:'ch2-lawn',notFlag:'ch2-carmen'},scene:'ch2Carmen'},
  {id:'ch2-source',map:'jpark',when:{...CH2,flag:['ch2-odette','ch2-carmen'],notFlag:'ch2-source'},scene:'ch2Source'},
  {id:'ch2-t1',map:'griffith',at:[1,1,22,19],when:{...CH2,flag:'ch2-source',notFlag:'ch2-t1'},scene:'ch2Flurry'},
  {id:'ch2-t2',map:'griffith',at:[1,1,22,12],when:{...CH2,flag:'ch2-t1',notFlag:'ch2-tuts'},scene:'ch2Coyote'},
  {id:'ch2-boss',map:'griffith',at:[1,1,8,7],when:{...CH2,flag:'ch2-tuts',notFlag:'ch2-boss'},scene:'ch2Boss'},
  {id:'ch2-after',map:'griffith',when:{...CH2,flag:{'battle:bigshake':'win'},notFlag:'ch2-clear'},scene:'ch2AfterBoss'},
  {id:'ch2-end',map:'jpark',when:{...CH2,flag:'ch2-clear',notFlag:'ch2-done'},scene:'ch2End'}
];

// Map rules for the story. Chapter 1: The Big One stays under the pond until the thief brings it the tin.
const STORY_WORLD=[
  ()=>{
    const b=findMonster('bigone'); if(!b) return;
    const under=STORY.chapter===1&&!flag('ch1-pond');
    if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=15; b.y=7; b.move=null; b.hidden=true; }
    else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
  },
  // Chapter 2: the Big Shake stays under the hill until the party reaches the Observatory.
  ()=>{
    const b=findMonster('bigshake'); if(!b) return;
    const under=STORY.chapter===2&&!flag('ch2-boss');
    if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
    else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
  },
  // Chapter 2: Nara waits on Tom's porch (only once TNB is with Tom); the smog puts neighbors in a trance.
  ()=>{
    if(typeof NARA_NPC==='undefined') return;
    const J=worlds.jpark,has=J.npcs.includes(NARA_NPC);
    if(STORY.chapter===2&&!flag('ch2-tnb')&&!inParty(nara)) { if(has) J.npcs.splice(J.npcs.indexOf(NARA_NPC),1); }
    else if(!has&&!inParty(nara)) J.npcs.push(NARA_NPC);
    if(STORY.chapter===2&&flag('ch2-tnb')&&!flag('met-nara')&&!NARA_NPC.visitedOnce&&!NARA_NPC.porch) {
      const d=houseById.tomhouse.door; NARA_NPC.x=d.x; NARA_NPC.y=d.y+1; NARA_NPC.facing='down'; NARA_NPC.path=[]; NARA_NPC.move=null; NARA_NPC.idle=1e9; NARA_NPC.porch=true;
    }
  },
  ()=>{
    const on=STORY.chapter===2&&!!flag('ch2-smog')&&!flag('ch2-clear');
    for(const n of currentMap.npcs) {
      n.trance=on&&CH2_TRANCE.includes(n.name);
      if(n.trance&&!n.held) { n.path=[]; n.idle=1; }
    }
  }
];
// Who the smog puts in a trance (they stand still with a purple swirl over their heads).
const CH2_TRANCE=['Mr. Washington','Marisol','Larry','Miss Odette','Doña Carmen'];
// Grump Hollow's monsters hold still until the three tutorial fights are done.
// HOLD_RULES: one function per chapter; any that returns true keeps that map monster still. Later chapters push onto it.
const HOLD_RULES=[
  n=>STORY.chapter===1&&flag('ch1-tuts')!==true&&currentMap.id==='hollow',
  n=>STORY.chapter===2&&flag('ch2-tuts')!==true&&currentMap.id==='griffith'];   // Griffith Park holds still until its two story fights
const STORY_HOLD=n=>HOLD_RULES.some(f=>f(n));
// Deedee's pie tin: carried by the thief, then worn by The Big One.
const STORY_CROWN=a=>a.monster==='bigone'&&flag('ch1-crown')?'tin':null;
const STORY_PROPS={
  tin(cx,y,a,worn) {
    const w=worn?13:9,yy=Math.round(y-(worn?2:6));
    ellipse(cx,yy+3,w+1,4,'#2b2a26'); ellipse(cx,yy+2,w,3,'#c9cfd3'); ellipse(cx,yy+1,w-2,2,'#eef2f4');
    ellipse(cx,yy+1,w-4,2,'#b4553f'); rect(cx-3,yy,2,1,'#e07a6a'); rect(cx+2,yy+1,2,1,'#e07a6a'); rect(cx-1,yy+1,1,1,'#f2c27a');
    if(worn) { rect(cx-w,yy+3,2*w,1,'#8a9196'); }
  }
};

// Story effects drawn on the map (engine/story.js, in map coordinates): chapter 2's purple smog, the trance swirls
// over the neighbors, and the Observatory pipes in Griffith Park.
const CH2_SMOG_MAPS={jpark:.26,blvd:.18,griffith:.3,creole:.18,pupuseria:.18,tomhouse:.08};
const STORY_MAPFX=[
  time=>{
    if(STORY.chapter!==2) return;
    const M=currentMap,smog=!!flag('ch2-smog')&&!flag('ch2-clear');
    // The Observatory's pipes, coughing smog until the Big Shake is beaten.
    if(M.id==='griffith') for(const [px,py] of [[5.4,2.1],[6.9,2.1]]) {
      const x=Math.round(px*T),y=Math.round(py*T);
      rect(x-3,y-14,8,16,OUT); rect(x-2,y-13,6,14,'#8e9aa8'); rect(x-4,y-16,10,4,OUT); rect(x-3,y-15,8,2,'#aeb3ba');
      if(smog||!flag('ch2-tnb')) for(let k=0;k<4;k++) { const ph=(time*.5+k/4)%1; gfx.globalAlpha=(1-ph)*.7; ellipse(x+1+Math.sin(time*2+k)*5,y-18-ph*40,5+ph*12,4+ph*8,k%2?'#8a5aa8':'#b48ad0'); }
      gfx.globalAlpha=1;
    }
    if(!smog) return;
    const a=CH2_SMOG_MAPS[M.id]; if(!a) return;
    // A purple haze over the whole map, with slow drifting puffs.
    gfx.globalAlpha=a; rect(0,0,M.w*T,M.h*T,'#7a4aa0');
    for(let k=0;k<Math.round(M.w*M.h/40);k++) {
      const n=hash(k,91),x=((n%(M.w*T))+time*(6+k%5))%(M.w*T+60)-30,y=(n>>>10)%(M.h*T);
      gfx.globalAlpha=Math.min(.7,a*1.8); ellipse(x,y,26+(n%16),10+(n%7),'#c49ae0');
    }
    gfx.globalAlpha=1;
    // Trance swirls over the neighbors' heads.
    for(const n of M.npcs) if(n.trance&&!n.hidden) {
      const p=position(n),cx=Math.round((p.x+.5)*T),cy=Math.round(p.y*T)-10;
      for(let k=0;k<8;k++) { const ang=time*3+k*.8,r=3+k*1.2; rect(Math.round(cx+Math.cos(ang)*r)-1,Math.round(cy+Math.sin(ang)*r*.5)-1,3,3,k%2?'#e9c9ff':'#9a5ac8'); }
    }
  }
];

// Tips for the three tutorial fights (engine/story.js b2TutTip). ▲ Skills (basic move first), ▶ signature move, ◀ Tombo, ▼ Bag, B Inspect.
const TUTORIALS={
  basics:{tips:[
    {id:'tom',who:'tom',dir:'up',text:'Tom’s turn. Tap ▲ Skills (or press A). His free basic move, Press Start, is first; basic moves also earn 1 VP.'},
    {id:'grace',who:'grace',dir:'up',text:'See the pink bar under each Mudling? That\'s Warmth. Kind moves fill it, and a full bar sends a monster home happy. ▲ Skills, then Cartwheel, for now.'},
    {id:'rose',who:'rose',dir:'right',text:'Rose’s RASPBERRY is the ▶ button. A Goofed monster loses its next turn, and Mudlings love a raspberry (lots of Warmth).'},
    {id:'deedee',who:'deedee',text:'B, or tapping the portrait in the middle, Inspects a monster: why it\'s grumpy, what it likes, and what it\'s weak to.'},
    {id:'vp',who:'tom',text:'VP is the blue pips on each card: +2 every turn, +1 for a basic move. Skills learned with Stamp Points cost VP.'}]},
  dance:{tips:[
    {id:'dance',who:'grace',dir:'right',when:()=>b2LiveParty().some(p=>p.hp<p.maxHp*.85),text:'Everybody is itchy. Grace’s DANCE (▶) heals the whole party.'},
    {id:'heart',who:'tom',dir:'left',when:u=>b2TomboRows(u).some(r=>!r.why),text:'The HEART meter (the pink hearts) is a quarter full. ◀ TOMBO: Tom teams up with a partner for a big combo.'},
    {id:'heart2',who:'rose',dir:'left',when:u=>b2TomboRows(u).some(r=>!r.why),text:'Rose can start a Tombo too. ◀ TOMBO: Double-Decker Airplane.'}]},
  defend:{
    // The Pond Grump telegraphs a big Soggy Slap on Rose, and acts after the whole party.
    setup() {
      const g=B2.foes[0],r=B2.party.find(p=>p.id==='rose'&&b2Alive(p)); if(!g||!r) return;
      g.intent={kind:'lock',target:r,act:{name:'Soggy Slap',stat:'pow',mult:1.7,elem:'splash',target:'one',msg:'{e} winds up and SOGGY SLAPS {t}!'}};
      g.ct=Math.max(...B2.party.map(p=>p.ct))+40;
    },
    tips:[
      {id:'defend',who:'tom',dir:'right',when:()=>B2.foes.some(f=>f.intent&&f.intent.kind==='lock'&&b2Alive(f.intent.target)&&!f.intent.target.st.guarded),
        text:'The Pond Grump has locked onto Rose (the red LOCK). ▶ DEFEND, then Rose: Tom steps in front and takes it.'},
      {id:'hug',who:'deedee',dir:'right',when:()=>b2LiveParty().some(p=>p.hp<p.maxHp*.9),text:'Deedee’s MOON & BACK (▶) hugs everyone: a heal now, and Tucked In heals a little more each turn.'}]},
  // The boss: a few reminders, only when they matter.
  bigone:{tips:[
    {id:'tin',who:'rose',dir:'right',when:()=>B2.foes.some(f=>f.st.pietin&&b2Alive(f)),text:'That pie tin is a helmet (GRIT +50%). Make The Big One laugh: Rose’s RASPBERRY (▶) knocks it right off.'},
    {id:'shield',who:'*',when:()=>B2.foes.some(f=>f.shield&&b2Alive(f)),text:'A shield! Two Sparkle or Chatter hits crack it before the Belly-Flop. RASPBERRY counts, and any Tombo breaks it at once.'},
    {id:'tombo',who:'tom',dir:'left',when:u=>b2TomboRows(u).some(r=>!r.why),text:'HEART is ready. ◀ TOMBO: Wine and Gossip heals everyone a lot; Double-Decker Airplane hits hard and stuns.'}]},
  // Chapter 2 (Los Angeles): the new crew's signatures and their Tombos.
  ch2lawn:{
    setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
    tips:[
      {id:'wardrobe',who:'tnb',dir:'right',when:()=>b2LiveParty().some(p=>p.hp<p.maxHp*.8),text:'TNB’s WARDROBE (▶) heals one person a lot, dresses them in the next costume on his rack, and gets them back up if they\'re knocked out.'},
      {id:'puppy',who:'nara',dir:'right',text:'Nara’s HUMAN EYES (▶): the monster is Smitten and skips its next turn. Its Warmth bar fills too.'},
      {id:'tombo',who:['tom','tnb'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='tnb1'&&!r.why),text:'◀ TOMBO: Popcorn Jump. Tom and TNB rain popcorn on every enemy at once, and the whole party glows.'},
      {id:'fetch',who:['tom','nara'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='nara1'&&!r.why),text:'◀ TOMBO: Sit. Paw. Treat. Always a critical hit, and Nara marks the monster with her scent.'}]},
  ch2flurry:{tips:[
    {id:'inspect',who:'*',text:'Tickets dodge a lot. B, or tapping the portrait in the middle, Inspects it: Cozy and Splash are its weak spots. Moves that hit everyone never miss.'},
    {id:'stamp',who:'tom',when:()=>typeof b6SpLeft==='function'&&B2.party.some(p=>b6SpLeft(p)>0),text:'Tip: Stamp Points pile up. After this fight, Menu, then STAMPS: Tom’s Starter Splash is a quick Splash hit that delays the enemy.'}]},
  ch2coyote:{
    // The coyote telegraphs a Pack Howl on Nara and acts after the whole party.
    setup() {
      const c=B2.foes[0],n=B2.party.find(p=>p.id==='nara'&&b2Alive(p)); if(!c||!n) return;
      c.intent={kind:'lock',target:n,act:{name:'Pack Howl',stat:'pow',mult:1.7,elem:'chatter',target:'one',msg:'{e} throws its head back. A PACK HOWL at {t}!'}};
      c.ct=Math.max(...B2.party.map(p=>p.ct))+40;
    },
    tips:[
      {id:'defend',who:'tom',dir:'right',when:()=>B2.foes.some(f=>f.intent&&f.intent.kind==='lock'&&b2Alive(f.intent.target)&&!f.intent.target.st.guarded),
        text:'The coyote locked onto Nara (the red LOCK). ▶ DEFEND, then Nara: Tom takes the hit for her.'},
      {id:'wardrobe2',who:'tnb',dir:'right',when:()=>b2LiveParty().some(p=>p.hp<p.maxHp*.6),text:'Someone is hurting. WARDROBE heals half and adds a costume.'}]},
  bigshake:{tips:[
    {id:'after',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='all'&&!f.shield),text:'An Aftershock is coming (!! on the turn ribbon). It hits everyone. Save WARDROBE and HEART for right after.'},
    {id:'clog',who:'*',when:()=>B2.foes.some(f=>f.shield&&b2Alive(f)),text:'The pipes are clogged! 2 Splash or Sparkle hits break the clog before the Big Rumble. HUMAN EYES is Sparkle. Any Tombo breaks it at once.'},
    {id:'tombo',who:'tom',dir:'left',when:u=>b2TomboRows(u).some(r=>!r.why),text:'HEART is ready. ◀ TOMBO: Popcorn Jump hits everything; Sit. Paw. Treat. is a sure critical hit.'}]}
};

// ======================================================================================================
// CHAPTER 3: Paces & Peppers (build plan C3a, and C3b: the Snag, Sundial Hollow, the coin, the Deep Pool and Old Iron-Gill).
// Sol flies Tom home (storyTripSteps sets chapter 3). Party: Tom, Grace, Rose and Boppy (Deedee bakes, Amy grades).
// Flags, in story order: ch3-sol (Sol's line), ch3-goal, ch3-boppy (Boppy joins; the pier path opens), ch3-tea (optional,
// Kettle Cottage), ch3-story (the 1970 story, Heart-Trace boppy-1970), ch3-pier, tombo:boppy1, ch3-jar (Iron-Gill takes the
// pepper jar), ch3-r1 (Soggy Socks), ch3-tuts (the Tangle; the marsh wakes up), ch3-wait (the old reeds).
// C3b: ch3-snag (the Snag moves; the old reeds open), ch3-hollow (Sundial Hollow), ch3-coin (the coin is out; the spillway
// drains), ch3-pool (Iron-Gill surfaces), battle:irongill ('win'), ch3-clear, ch3-release (Iron-Gill goes back down), ch3-done.
// ======================================================================================================
const CH3={mode:'full',chapter:3};
// A walkable tile about d tiles from Tom (for monsters that pop out of the reeds), and a route to a tile beside him.
const ch3Free=(x,y)=>walkable(currentMap,x,y)&&currentMap.tiles[y][x]!=='water'&&!(player.x===x&&player.y===y)&&!followers.some(f=>f.x===x&&f.y===y)&&!currentMap.npcs.some(n=>n.x===x&&n.y===y&&!n.hidden);
const spotNear=d=>()=>{
  for(let r=d;r<=d+3;r++) for(const [dx,dy] of [[-r,0],[0,-r],[r,0],[0,r],[-r,-1],[-r,1],[r,-1],[r,1],[-1,-r],[1,-r],[-1,r],[1,r]]) {
    const x=player.x+dx,y=player.y+dy; if(within(currentMap,x,y)&&ch3Free(x,y)) return [x,y]; }
  return [player.x,player.y-1];
};
const routeBeside=a=>()=>{
  const n=sceneActor(a); if(!n) return [];
  let best=null;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) { const x=player.x+dx,y=player.y+dy; if(!within(currentMap,x,y)||!ch3Free(x,y)) continue;
    const p=findPath(currentMap,n,{x,y}); if(p.length&&(!best||p.length<best.length)) best=p; }
  return best?best.slice(-4).map(p=>[p.x,p.y]):[];
};

// 1. Home again (after the usual welcome at the cab): Boppy wants to go fishing.
SCENES.ch3Arrive=[
  {flag:'ch3-goal'},
  {talk:'Grace',lines:['Tata! Boppy has been waiting by his window since BREAKFAST. He has his fishing hat on.']},
  {talk:'Rose',lines:['He said if you were late he\'d catch the fish without you. He\'s never caught a fish.']},
  {talk:'Tom',lines:['Then we had better go help him not catch one.']},
  {toast:"Goal: Deedee and Boppy's house. Rivituso Row, south of the Square.",time:4.5}
];
// 2. Deedee and Boppy's house: the Whisker Perch, the pepper jar. Boppy joins; Deedee stays to bake.
SCENES.ch3Fishing=[
  {flag:'ch3-boppy'},
  {place:'Deedee',at:[5,6],dir:'right'}, {place:'Boppy',at:[8,5],dir:'down'},
  {walk:'tom',to:routeTo('tom',6,7),speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:[7,7],dir:'up'}, {place:'rose',at:[5,7],dir:'up'},
  {hearts:'Deedee'},
  {talk:'Deedee',lines:["There's my Tommy!",'Back already! Look at you. Did they feed you out there? Never mind. I\'ll feed you.'],voice:[['deedee','greet',0,"There's my Tommy!"]]},
  {talk:'Boppy',lines:['Tom. Good. Sit down. No. Don\'t sit down. We\'re going fishing.','The Whisker Perch. Whiskers like a cat. I saw it at Cattail Pier in 1994. Nobody believes me.']},
  {talk:'Deedee',lines:['Nobody believes him.']},
  {talk:'Rose',lines:['Boppy, is the Whisker Perch real?']},
  {talk:'Boppy',lines:['Real as my heartburn, kiddo.']},
  {talk:'Grace',lines:['I\'m bringing a notebook. For science. And for proof.']},
  {talk:'Boppy',lines:['And I\'m bringing THIS. My pepper jar. Homegrown, pickled in 1989. Older than your mother.']},
  {talk:'Deedee',lines:['Not one pepper for me either. Peppers give me gas.']},
  {talk:'Grace',lines:['Deedee. EVERYTHING gives you gas.']},
  {talk:'Deedee',lines:['Who told you that.']},
  {talk:'Grace',lines:['Tata. At the crisp.']},
  {talk:'Deedee',lines:['Tata is on thin ice.']},
  {talk:'Deedee',lines:['I have three pies in, so I\'m staying put. Do NOT let him eat peppers on an empty stomach.']},
  {talk:'Boppy',lines:['I never eat peppers on an empty stomach. I eat them on a full stomach. Then it\'s empty.']},
  {join:'boppy'},
  {wait:2.8},
  {toast:'Goal: Cattail Pier, through the gap at the bottom of Rivituso Row.',time:4.5},
  {toast:'Tip: Kettle Cottage in the Square makes a stomach tea Boppy swears by. If you want to stop on the way.',time:4.5}
];
// 3. Optional: Kettle Cottage. Stomach tea, and the kettle's gossip about a man in a long coat.
SCENES.ch3Tea=[
  {flag:'ch3-tea'},
  {talk:'Oolong',lines:['Boppy! The usual? Ginger, peppermint, and a little honey for the stomach.']},
  {talk:'Boppy',lines:['The stomach thanks you. The stomach is still complaining. But it thanks you.']},
  {heal:true}, {hearts:'boppy'}, {trace:'boppy-tea'}, {call:()=>sfx.levelChime()},
  {talk:'The kettle',lines:['The kettle whistles, low and long. Oolong leans in to listen.']},
  {talk:'Oolong',lines:['The kettle says a man in a long coat has been buying up gold coins at Penny’s. Paying double. Never takes his hat off.']},
  {talk:'Tom',lines:['On Long Island? Nobody here pays double for anything.']},
  {talk:'Oolong',lines:['The kettle also says it\'ll rain on Tuesday. The kettle is wrong a lot. Enjoy the pier.']},
  {toast:'Everyone is healed. Goal: Cattail Pier, south of Rivituso Row.',time:4}
];
// 4. On the way down the Row: the 1970 story, and everybody walks too fast.
SCENES.ch3Story=[
  {flag:'ch3-story'},
  {talk:'Boppy',lines:['Did I ever tell you about 1970? Sit down. This takes a while.'],voice:[['boppy','trackstar',0,'Did I ever tell you about 1970? Sit down. This takes a while.']]},
  {talk:'Grace',lines:['You did. Forty times.']},
  {talk:'Boppy',lines:['Then forty-one. First year of college. Cross country. Five miles through the woods, up the big hill, and I never breathed hard.',
    'Last hill, I passed the whole field. Champion. They put my name on a plaque. The plaque is in a box. Somewhere.']},
  {talk:'Rose',lines:['Can you still run that fast?']},
  {talk:'Boppy',lines:['...Sure. Sure I can. I just choose not to. It\'s bad for the stomach.']},
  {trace:'boppy-1970'}, {hearts:'boppy'},
  {talk:'Rose',lines:['Race you to the pier, Boppy!']},
  {talk:'Grace',lines:['Last one there\'s a soggy sock!']},
  {talk:'Boppy',lines:['Why is everybody walking like they\'re going to a fire? Slow down! My stomach is doing flips!']},
  {talk:'Tom',lines:['Boppy speed, everybody. We walk at Boppy speed.']},
  {toast:'Goal: Cattail Pier. Through the gap at the bottom of the Row.',time:4}
];
// 5. The end of the pier: the system, the Tombo, and Old Iron-Gill takes the pepper jar.
SCENES.ch3Pier=[
  {flag:'ch3-pier'},
  {walk:'tom',to:routeTo('tom',11,12),speed:.25}, {face:'tom',dir:'down'},
  {place:'boppy',at:[12,12],dir:'down'}, {place:'grace',at:[10,12],dir:'down'}, {place:'rose',at:[13,12],dir:'down'},
  {talk:'Boppy',lines:['This is the spot. Forty years, this spot. Now everybody be QUIET.']},
  {talk:'Rose',lines:['I AM BEING QUIET.']},
  {talk:'Grace',lines:['Rose. Inside voice. Outside.']},
  {talk:'Tom',lines:['Shhh. Quiet on the pier, everybody. Boppy has a whole system.']},
  {talk:'Boppy',lines:['Tom holds the tackle box. I cast. The fish comes. Nobody talks. That\'s the system.']},
  {flag:'tombo:boppy1'},
  {toast:'New Tombo: You Hold the Net (Tom + Boppy). In battle, ◀ TOMBO.',time:3.6},
  {call:()=>sfx.whoosh()}, {wait:1.4},
  {talk:'Boppy',lines:['...Any minute now.']},
  {wait:1.2},
  {talk:'Grace',lines:['It\'s been a minute. I wrote it down.']},
  {talk:'Boppy',lines:['Snack. A pickled pepper settles the stomach.']},
  {talk:'Rose',lines:['Deedee said NO peppers.']},
  {talk:'Boppy',lines:['Deedee isn\'t here.']},
  {call:()=>{ const b=sceneActor('boppy'); if(b) b.carry='jar'; sfx.pickup(); }},
  {wait:.6},
  {call:()=>{ sfx.splat(); sfx.thud(); }},
  {spawn:{name:'Old Iron-Gill',monster:'irongill',at:[16,13],dir:'left'}},
  {walk:'Old Iron-Gill',to:[[15,13],[14,13]],speed:.45,onStep:()=>sfx.splat()},
  {face:'rose',dir:'right'}, {face:'boppy',dir:'right'}, {face:'tom',dir:'right'},
  {talk:'Old Iron-Gill',lines:['BLORP.']},
  {talk:'Rose',lines:['TATA! A FISH! A HUGE ONE! WITH A MUSTACHE!']},
  {talk:'Boppy',lines:['That\'s no perch. That\'s OLD IRON-GILL. I saw him in 1994! I TOLD everybody!']},
  {talk:'Old Iron-Gill',lines:['Blorp. Something smells like peppers.']},
  {call:()=>{ const b=sceneActor('boppy'),g=sceneActor('Old Iron-Gill'); if(b) b.carry=null; if(g) g.carry='jar'; sfx.pickup(); sfx.splat(); }},
  {talk:'Boppy',lines:['MY JAR!']},
  {talk:'Old Iron-Gill',lines:['GULP. Spicy. I love it. Bye.']},
  {walk:'Old Iron-Gill',to:[[14,14],[13,14],[12,14],[11,14],[10,14],[9,14],[8,14],[7,14],[6,14],[5,14],[4,14],[3,14],[2,14],[1,14]],speed:.12,onStep:i=>{ if(i%3===0) sfx.splat(); }},
  {despawn:'Old Iron-Gill'},
  {talk:'Tom',lines:['That was UNCALLED for!'],voice:[['tom','hurt',0,'That was UNCALLED for!']]},
  {talk:'Boppy',lines:['Pickled in 1989. Nobody takes Boppy’s peppers. NOBODY.','He went west. Into the Whispering Marsh. Come on. And nobody walk fast.']},
  {flag:'ch3-jar'},
  {toast:'Goal: follow Old Iron-Gill west, into the Whispering Marsh.',time:4.5}
];
// 6. The Whispering Marsh: two story fights on the way in, then the old reeds.
const CH3_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'Boppy',lines:['Up. Everybody up. Headcount. One, two, three, four. Good. Nobody is missing. Again.']}],else:[]},
  ...lines
];
SCENES.ch3Sock=[
  {flag:'ch3-r1'},
  {place:'Soggy Sock',at:spotNear(3)},
  {call:()=>sfx.splat()},
  {walk:'Soggy Sock',to:routeBeside('Soggy Sock'),speed:.35,onStep:()=>sfx.splat()},
  {talk:'Soggy Sock',lines:['Squelch. Have you seen my other sock? It looks just like me. It\'s ALSO angry.']},
  {talk:'Rose',lines:['Tata, that sock has a FACE.']},
  {talk:'Boppy',lines:['Marsh junk. Everything people drop out here ends up grumpy about it. Like me, at the DMV.']},
  {battle:'soggysock',tut:'ch3sock'},
  ...CH3_AFTER(()=>flag('battle:soggysock')!=='win',[
    {talk:'Boppy',lines:['Socks. Out here. Nobody keeps track of their socks anymore.']}])
];
SCENES.ch3Tangle=[
  {flag:'ch3-tuts',value:'pending'},
  {place:'Tangle',at:spotNear(3)},
  {call:()=>sfx.whoosh()},
  {walk:'Tangle',to:routeBeside('Tangle'),speed:.35},
  {talk:'Tangle',lines:['Snarl. Somebody cast me badly in 1997. I\'ve been in a knot ever since. Nobody gets past ME.']},
  {talk:'Boppy',lines:['Excuse me? Nobody gets past ME. That\'s MY line. I was saying that at Rikers before you were a knot.']},
  {battle:'tangle',tut:'ch3tangle'},
  ...CH3_AFTER(()=>flag('battle:tangle')!=='win',[]),
  {flag:'ch3-tuts'},
  {heal:true},
  {talk:'Grace',lines:['Boppy, you\'re breathing kind of hard.']},
  {talk:'Boppy',lines:['I\'m breathing EXACTLY as hard as I want to.']},
  {talk:'Tom',lines:['We take it slow. Iron-Gill’s wake goes northwest, toward those big reeds.']},
  {toast:'Goal: follow Iron-Gill’s wake to the far corner of the marsh (top left). The marsh’s monsters are awake now.',time:5}
];
// 7. The old reeds: Iron-Gill's wake goes in, and something big is sitting in front of the old boardwalk.
SCENES.ch3Wait=[
  {flag:'ch3-wait'},
  {talk:'Boppy',lines:['The old reeds. When I was a kid we said there was a sundial back in there that told the wrong time.']},
  {talk:'Grace',lines:['Sundials can\'t tell the wrong time. That\'s not how sundials work.']},
  {talk:'Boppy',lines:['That\'s what I said.']},
  {talk:'Old reeds',lines:['Iron-Gill’s wake goes straight into the reeds. There used to be a boardwalk through here. Something big and soggy is sitting in front of it.']},
  {talk:'Tom',lines:['Then we ask it nicely to move. Iron-Gill isn\'t keeping that jar.']}
];
// 8. The Snag sits on the old boardwalk. Once it drifts off, the reeds open onto Sundial Hollow.
SCENES.ch3Snag=[
  {flag:'ch3-snag',value:'pending'},
  {place:'Snag',at:spotNear(2)},
  {call:()=>{ sfx.splat(); sfx.thud(); }},
  {walk:'Snag',to:routeBeside('Snag'),speed:.45,onStep:()=>sfx.splat()},
  {talk:'Snag',lines:['Creak. This was a boardwalk once. Now it\'s MY spot. Everything catches on me here. I like it.']},
  {talk:'Boppy',lines:['You\'re sitting on the way to Sundial Hollow. Shove over.']},
  {talk:'Snag',lines:['Make me. Slowly. I\'m very heavy when wet. I\'m always wet.']},
  {talk:'Rose',lines:['Tata, it\'s a LOG with a BOOT.']},
  {battle:'snag',tut:'ch3snag'},
  ...CH3_AFTER(()=>flag('battle:snag')!=='win',[]),
  {flag:'ch3-snag'},
  {call:()=>{ ch3OpenReeds(); storyWorld(); sfx.whoosh(); sfx.splat(); }},
  {talk:'Old reeds',lines:['The Snag rolls over, creaks, and drifts off into the shallows. Behind it, the old reeds lean apart around a narrow, mossy boardwalk.']},
  {talk:'Grace',lines:['A secret boardwalk. Of course there\'s a secret boardwalk.']},
  {talk:'Boppy',lines:['Not secret. Just old. Like me. Nobody comes back here anymore.']},
  {toast:'Goal: through the old reeds (top left) into Sundial Hollow.',time:4.5}
];
// 9. Sundial Hollow: the sundial says seven. It is not seven. A coin is wedged under the pointer.
SCENES.ch3Hollow=()=>[
  {flag:'ch3-hollow'},
  {walk:'tom',to:routeTo('tom',10,16),speed:.25}, {face:'tom',dir:'up'},
  {place:'boppy',at:[12,16],dir:'up'}, {place:'grace',at:[9,16],dir:'up'}, {place:'rose',at:[11,17],dir:'up'},
  {talk:'Boppy',lines:['Sundial Hollow. I haven\'t been back here since I was nine. It hasn\'t changed. It still says seven.']},
  {talk:'Grace',lines:['It\'s the AFTERNOON. The sun is right there. Sundials can\'t be wrong. That\'s not how sundials work.']},
  {talk:'Boppy',lines:['That\'s what I said.']},
  {talk:'Rose',lines:['Tata! Something shiny is stuck in it!']},
  {walk:'tom',to:[[11,14]],speed:.25}, {face:'tom',dir:'up'},
  {talk:'Tom',lines:['A coin. Wedged right under the pointer. Somebody pushed this in on purpose.']},
  {call:()=>sfx.pickup()}, {flag:'ch3-coin'}, {give:'oldcoin'},
  {wait:.6},
  {call:()=>{ sfx.whoosh(); sfx.levelChime(); }},
  {talk:'The sundial',lines:['Click. The shadow swings all the way around the dial and settles on the right hour.']},
  {call:()=>{ ch3DrainSpillway(); sfx.splat(); sfx.thud(); }},
  {talk:'The spillway',lines:['Up north, the spillway gurgles, then glugs, then drains away to mud. The way to the Deep Pool is open.']},
  {talk:'Grace',lines:['It MOVED. Shadows don\'t move like that. I\'m writing this down. In pen.']},
  ...(flag('ch3-tea')?[
    {talk:'Tom',lines:['Oolong’s kettle said a man in a long coat is buying gold coins at Penny’s. Paying double.']},
    {talk:'Boppy',lines:['Nobody pays double on Long Island. Keep that in your pocket, Tom. Deep in your pocket.']}]:[
    {talk:'Boppy',lines:['Old gold. Keep that in your pocket, Tom. Penny will want to hear about it. Penny wants to hear about everything.']}]),
  {talk:'Boppy',lines:['Now. The Deep Pool. That\'s where Iron-Gill goes to sulk.']},
  {toast:'Goal: the Deep Pool, across the drained spillway at the top of Sundial Hollow.',time:4.5}
];
// 10. The Deep Pool: Old Iron-Gill surfaces. Boss fight.
SCENES.ch3Pool=[
  {flag:'ch3-pool'}, {call:()=>storyWorld()},
  {hide:'Old Iron-Gill'},
  {walk:'tom',to:routeTo('tom',10,4),speed:.25}, {face:'tom',dir:'up'},
  {place:'boppy',at:[11,4],dir:'up'}, {place:'rose',at:[10,5],dir:'up'}, {place:'grace',at:[11,5],dir:'up'},
  {talk:'Boppy',lines:['The Deep Pool. Nobody has ever seen the bottom. My father said it goes all the way to Ohio.']},
  {call:()=>{ sfx.splat(); sfx.thud(); }}, {wait:.5},
  {show:'Old Iron-Gill'}, {face:'Old Iron-Gill',dir:'down'},
  {talk:'Old Iron-Gill',lines:['Blorp. The old man. And his small, loud friends.']},
  {talk:'Boppy',lines:['You took my jar.']},
  {talk:'Old Iron-Gill',lines:['I took your jar. Forty years you sit on that pier and you never once come to visit. You only ever bring HOOKS.']},
  {talk:'Rose',lines:['Boppy, he\'s sad! And spicy!']},
  {talk:'Boppy',lines:['He\'s a FISH, kiddo.','Tom. Tackle box. We do this the old way.']},
  {talk:'Tom',lines:['Quiet on the pier, everybody.']},
  {battle:'irongill',tut:'irongill'},
  {if:()=>flag('battle:irongill')!=='win',then:[
    {heal:true},
    {talk:'Boppy',lines:['Headcount. One, two, three, four. Good.','He belches every third turn, Tom. Heal right after. When he dives, hit the water hard, or do our Tombo.']},
    {toast:'Face Old Iron-Gill and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 11. After Iron-Gill (won in the scene, or on a retry with A): the jar comes back. Catch and release.
SCENES.ch3AfterBoss=()=>[
  {flag:'ch3-clear'},
  {call:()=>{ sfx.splat(); sfx.levelChime&&sfx.levelChime(); }},
  ...(flag('kind:irongill')?[
    {talk:'Old Iron-Gill',lines:['Blorp. You told me about 1970. Nobody tells me anything. They only fish.','Come by the pier sometimes, old man. No hooks. Just talking.']}]:[
    {talk:'Old Iron-Gill',lines:['Blorp. Fine. FINE. Take your jar. It was too spicy anyway.']}]),
  ...(bag.includes('pepperjar')?[]:[{give:'pepperjar'}]),
  {talk:'Boppy',lines:['My jar. Still sealed. Still hot.','And look at that. Forty years, and I finally caught Old Iron-Gill.']},
  {talk:'Grace',lines:['Technically he caught your jar, and then we caught him. I\'m writing it down anyway. For proof.']},
  {talk:'Boppy',lines:['Put the date. Put the time. Use the sundial. It works now.']},
  {talk:'Boppy',lines:['Go on, you old bucket. Catch and release. I\'ll come by. No hooks.']},
  {call:()=>{ setFlag('ch3-release'); storyWorld(); sfx.splat(); }},
  {talk:'Deep Pool',lines:['Iron-Gill sinks back into the Deep Pool, burping softly. The bubbles look almost friendly.']},
  {trace:'boppy-irongill'}, {hearts:'boppy'},
  {talk:'Rose',lines:['Boppy, can we go home now? I want to tell Deedee EVERYTHING.']},
  {talk:'Boppy',lines:['Everything except the pepper part.']},
  {talk:'Rose',lines:['ESPECIALLY the pepper part.']},
  {toast:'Goal: home to Deedee and Boppy’s house on Rivituso Row.',time:4.5}
];
// 12. Deedee and Boppy's house: Rose tells on Boppy. Crisp. Chapter complete.
SCENES.ch3End=[
  {flag:'ch3-done',value:'pending'},
  {place:'Deedee',at:[5,6],dir:'right'},
  {walk:'tom',to:routeTo('tom',6,7),speed:.25}, {face:'tom',dir:'up'},
  {place:'boppy',at:[7,6],dir:'left'}, {place:'grace',at:[7,7],dir:'up'}, {place:'rose',at:[5,7],dir:'up'},
  {hearts:'Deedee'},
  {talk:'Deedee',lines:['There they are! Well? Did anybody catch anything?']},
  {talk:'Boppy',lines:['Old Iron-Gill. Forty years, Dee. I TOLD everybody.']},
  {talk:'Deedee',lines:['Nobody believed you.']},
  {talk:'Grace',lines:['I have proof. It\'s in my notebook. With the time. From a sundial.']},
  {talk:'Rose',lines:['Deedee! Boppy almost ate a PEPPER! On the pier! Before LUNCH!']},
  {talk:'Deedee',lines:['Did he.']},
  {talk:'Deedee',lines:['Hand me my glasses. I want to look at him properly. Where ARE my glasses.']},
  {talk:'Rose',lines:['Apron pocket, Deedee!']},
  {talk:'Deedee',lines:['Thank you, Rosie. Now. Let me look at him.']},
  {talk:'Boppy',lines:['...Almost isn\'t eating. Almost is fine.']},
  {talk:'Deedee',lines:['Sit down, you. I made rhubarb crisp. Everybody sit. And eat SLOWLY.']},
  {talk:'Boppy',lines:['Slowly. Finally. Somebody in this family gets it.']},
  {trace:'ch3-crisp'}, {hearts:'tom'}, {call:()=>sfx.levelChime()},
  {talk:'Tom',lines:['Best fishing trip ever. Nobody fell in. Mostly.']},
  {talk:'Deedee',lines:['I love you all to the moon and back. Now eat.']},
  {fade:'out',time:.8}, {card:3,done:true,time:3.4}, {flag:'ch3-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'Chapter 3 complete! When you\'re ready, Sal at Long Island Taxi Co. (the Square) flies you to Los Angeles for chapter 4.',time:6}
];
TRIGGERS.push(
  {id:'ch3-goal',map:'town',when:{...CH3,notFlag:'ch3-goal'},scene:'ch3Arrive'},
  {id:'ch3-boppy',map:'grands',when:{...CH3,flag:'ch3-goal',notFlag:'ch3-boppy'},scene:'ch3Fishing'},
  {id:'ch3-tea',map:'tea',when:{...CH3,flag:'ch3-boppy',notFlag:['ch3-tea','ch3-jar'],test:()=>inParty(boppy)},scene:'ch3Tea'},
  {id:'ch3-story',map:'row',at:[10,16,14,20],when:{...CH3,flag:'ch3-boppy',notFlag:'ch3-story'},scene:'ch3Story'},
  {id:'ch3-pier',map:'pier',at:[9,10,14,13],when:{...CH3,flag:'ch3-boppy',notFlag:'ch3-pier'},scene:'ch3Pier'},
  {id:'ch3-r1',map:'reeds',at:[17,9,25,14],when:{...CH3,flag:'ch3-jar',notFlag:'ch3-r1'},scene:'ch3Sock'},
  {id:'ch3-r2',map:'reeds',at:[1,1,16,21],when:{...CH3,flag:'ch3-r1',notFlag:'ch3-tuts'},scene:'ch3Tangle'},
  {id:'ch3-wait',map:'reeds',at:[1,1,8,5],when:{...CH3,flag:'ch3-tuts',notFlag:'ch3-wait'},scene:'ch3Wait'},
  {id:'ch3-snag',map:'reeds',when:{...CH3,flag:'ch3-wait',notFlag:'ch3-snag'},scene:'ch3Snag'},
  {id:'ch3-hollow',map:'sundial',when:{...CH3,flag:'ch3-snag',notFlag:'ch3-hollow'},scene:'ch3Hollow'},
  {id:'ch3-pool',map:'sundial',at:[1,1,20,8],when:{...CH3,flag:'ch3-coin',notFlag:'ch3-pool'},scene:'ch3Pool'},
  {id:'ch3-after',map:'sundial',when:{...CH3,flag:{'battle:irongill':'win'},notFlag:'ch3-clear'},scene:'ch3AfterBoss'},
  {id:'ch3-end',map:'grands',when:{...CH3,flag:'ch3-clear',notFlag:'ch3-done'},scene:'ch3End'}
);
// The marsh holds still until its two story fights. Before Iron-Gill shows up, the pier has nothing to fight anyway.
HOLD_RULES.push(n=>STORY.chapter===3&&flag('ch3-tuts')!==true&&currentMap.id==='reeds');
// Sundial Hollow holds still until the coin is out of the sundial.
HOLD_RULES.push(n=>STORY.chapter===3&&!flag('ch3-coin')&&currentMap.id==='sundial');

// C3b map changes. They check flags (not events), so they also hold after loading a save.
// The old reeds at the top left of the marsh: four reed tiles step aside once the Snag has moved.
function ch3OpenReeds() {
  const M=worlds.reeds; if(!M||M.reedsOpen) return;
  for(const [x,y] of [[3,1],[4,1],[3,2],[4,2]]) {
    const o=M.objectAt.get(key(x,y)); if(o) { M.objects.splice(M.objects.indexOf(o),1); M.objectAt.delete(key(x,y)); }
    tile(M,x,y,'boards');
  }
  M.reedsOpen=true; M.mini=null;
}
// Sundial Hollow's spillway drains once the coin is out of the sundial. On the painted plate (spec.drainOpen) only the
// painted stepping-stone crossing opens; without it the old rows 9 and 10 turn to mud.
function ch3DrainSpillway() {
  const M=worlds.sundial; if(!M||M.drained) return;
  if(M.spec&&M.spec.drainOpen) for(const [x,y] of M.spec.drainOpen) tile(M,x,y,'mud');
  else for(const y of [9,10]) for(let x=1;x<M.w-1;x++) tile(M,x,y,'mud');
  M.drained=true; M.mini=null;
}
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  if(flag('ch3-snag')===true) {
    ch3OpenReeds();
    // The Snag drifts off to the east shallows (its old spot was right in front of the boardwalk).
    const sn=worlds.reeds&&worlds.reeds.npcs.find(n=>n.monster==='snag');
    if(sn&&!sn.drifted&&!sn.held) { sn.drifted=true; sn.x=21; sn.y=4; sn.move=null; sn.home={x:21,y:4}; }
  }
  if(flag('ch3-coin')) ch3DrainSpillway();
  // Old Iron-Gill stays at the bottom of the Deep Pool until the party walks out to it, and goes back down after.
  const b=findMonster('irongill'); if(!b) return;
  const under=!flag('ch3-pool')||!!flag('ch3-release');
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});

// Boppy's pepper jar, carried by Boppy, then by Old Iron-Gill (it has it in its mouth).
STORY_PROPS.jar=(cx,y)=>{ const yy=Math.round(y-8);
  rect(cx-5,yy-1,10,12,OUT); rect(cx-4,yy,8,10,'#e8f0e0'); rect(cx-4,yy+3,8,6,'#d94a3a'); rect(cx-2,yy+4,2,4,'#f48a5a'); rect(cx+1,yy+5,2,3,'#7aa05a');
  rect(cx-5,yy-3,10,3,OUT); rect(cx-4,yy-2,8,1,'#c9a85a'); rect(cx-3,yy+1,1,2,'#ffffff'); };

// Boppy catches his breath (story bible section 5, chapter 3 on). Walking with the family outdoors on Long Island,
// every so often he stops for a moment (he falls one tile behind, hand on his stomach, puffing) and catches up when
// everyone stops walking. Only while he is the last follower, so nobody walks through him.
const BOPPY_WIND={lag:false,steps:0,next:16,last:0,puff:0,say:0};
function boppyWindFollower() {
  if(STORY.mode!=='full'||STORY.chapter<3||!inParty(boppy)||!currentMap.outside||regionOf(currentMap)!=='le'||intro.active||battle.active) return null;
  const f=followers[followers.length-1]; return f&&f.member===boppy?f:null;
}
const LE_movePlayer_ch3=movePlayer;
movePlayer=function(dir) {
  const f=boppyWindFollower();
  const ok=LE_movePlayer_ch3(dir);
  if(!ok||!f) { if(!f) BOPPY_WIND.lag=false; return ok; }
  const W=BOPPY_WIND; W.last=performance.now();
  if(!W.lag&&++W.steps>=W.next&&party.includes(grace)) { W.lag=true; W.steps=0; W.next=14+Math.floor(Math.random()*10); W.say=performance.now()+1500; f.move=null; return ok; }
  if(W.lag) {   // stay one tile further back along Tom's trail
    const t=trail[0];
    if(f.move) { f.x=f.move.tx; f.y=f.move.ty; }
    f.move=null;
    if(t&&(t.x!==f.x||t.y!==f.y)&&Math.abs(t.x-f.x)+Math.abs(t.y-f.y)===1) { f.facing=directionTo(t.x-f.x,t.y-f.y); f.move={fx:f.x,fy:f.y,tx:t.x,ty:t.y,elapsed:0,duration:player.duration*1.3,fresh:true}; }
  }
  return ok;
};
const LE_placeFollowers_ch3=placeFollowers;
placeFollowers=function() { BOPPY_WIND.lag=false; return LE_placeFollowers_ch3(); };
STORY_WORLD.push(()=>{
  const W=BOPPY_WIND; if(!W.lag) return;
  const f=boppyWindFollower(); if(!f) { W.lag=false; return; }
  if(player.move||f.move||performance.now()-W.last<650) return;
  const t=trail[1]; W.lag=false; W.puff=performance.now()+900;
  if(t&&Math.abs(t.x-f.x)+Math.abs(t.y-f.y)===1) { f.facing=directionTo(t.x-f.x,t.y-f.y); f.move={fx:f.x,fy:f.y,tx:t.x,ty:t.y,elapsed:0,duration:.42,fresh:true}; }
});
STORY_MAPFX.push(time=>{
  // Props a follower carries in a scene (only monsters draw their own).
  for(const f of followers) if(f.carry&&STORY_PROPS[f.carry]&&!f.hidden) { const p=position(f); STORY_PROPS[f.carry](Math.round((p.x+.5)*T)+9,Math.round((p.y+1)*T-12),f); }
  const W=BOPPY_WIND,now=performance.now(); if(!W.lag&&now>W.puff) return;
  const f=boppyWindFollower(); if(!f||f.hidden) return;
  const p=position(f),cx=Math.round((p.x+.5)*T),top=Math.round(p.y*T)-14;
  for(let k=0;k<3;k++) { const ph=(time*1.6+k/3)%1; gfx.globalAlpha=(1-ph)*.85; ellipse(cx+10+ph*10,top+6-ph*16,2+ph*4,2+ph*3,'#ffffff'); }
  gfx.globalAlpha=1;
  if(now<W.say) { rect(cx-44,top-30,88,18,OUT); rect(cx-43,top-29,86,16,'#fff8e6'); rect(cx-3,top-12,6,4,OUT); rect(cx-2,top-13,4,3,'#fff8e6'); label('SLOW DOWN!',cx,top-26,'#2b2a26',2); }
});

// Tips for the marsh story fights and Old Iron-Gill.
TUTORIALS.ch3snag={tips:[
  {id:'goof',who:'*',text:'The Snag is slow and sleepy. Rose’s RASPBERRY goofs it easily, and Cozy hits work best. B Inspects it.'}]};
TUTORIALS.irongill={tips:[
  {id:'inspect',who:'*',text:'Old Iron-Gill is weak to Kinetic and Sparkle. His favorite kind moves: Boppy’s GRUMBLE and his 1970 story.'},
  {id:'belch',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='all'&&!f.shield),text:'PEPPER BELCH next turn hits everyone (see the turn ribbon). Heal right after it: Grace’s DANCE (▶) or a snack from the ▼ Bag.'},
  {id:'dive',who:['tom','boppy'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>r.T.id==='boppy1'&&!r.why),text:'He\'s diving! ◀ TOMBO: You Hold the Net breaks his guard in one go.'},
  {id:'dive2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'He\'s diving for a DEEP DIVE. Break his guard first: 2 Splash or Kinetic hits, or any Tombo.'}]};
// Tips for the two marsh fights.
TUTORIALS.ch3sock={
  setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
  tips:[
    {id:'grumble',who:'boppy',dir:'right',text:'Boppy’s GRUMBLE (▶): he complains about his stomach. A whole row hits 30% softer and goes after Boppy, who guards. The marsh LOVES a good grumble (lots of Warmth).'},
    {id:'inspect',who:'*',text:'Socks are weak to Cozy and Sparkle, and shrug off Splash. B, or the portrait in the middle, Inspects one.'},
    {id:'tombo',who:['tom','boppy'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='boppy1'&&!r.why),text:'◀ TOMBO: You Hold the Net. Tom holds the net, Boppy scoops up everybody. It hits every enemy and they all go soft.'}]};
TUTORIALS.ch3tangle={
  // Boppy already has a little heartburn from that pickled pepper he almost ate.
  setup() { const b=B2.party.find(p=>p.id==='boppy'); if(b) { b.burn=Math.max(b.burn||0,2); } b2Render(); },
  tips:[
    {id:'burn',who:'boppy',dir:'right',when:u=>(u.burn||0)<3,text:'See the ●●○ on Boppy’s card? That\'s his Heartburn. GRUMBLE, then every hit he takes while guarding adds a pip. At 3, watch out.'},
    {id:'roar',who:'boppy',dir:'up',when:u=>(u.burn||0)>=3,text:'HEARTBURN! Boppy’s next attack lets out the Warden’s Counter-Roar: whoever hit him last loses its turn. ▲ Skills, Cap Swat.'},
    {id:'slow',who:'*',when:()=>b2LiveParty().some(p=>p.st&&p.st.slow),text:'Slowed: that one acts later on the turn ribbon for a while. Grace’s DANCE heals everybody in the meantime.'}]};

// ======================================================================================================
// CHAPTER 4: Backlot Bedlam. Sal flies Tom to LA (storyTripSteps sets chapter 4). TNB has a wardrobe job at Sunset Gold
// Studios (east end of Downtown). Party: Tom, TNB (locked in by the scene), Nara. Everyone else stays on Long Island.
// Flags, in story order: ch4-sal (Sal's line), ch4-goal (TNB at the cab stand, heart-kiss; TNB joins), ch4-nara (Nara
// joins on the porch), ch4-gate (the rack is gone), ch4-snack (optional: the one snack Nara eats, Heart-Trace),
// ch4-fetch (Nara's fetch finds the tag; the hydrant), ch4-main (Cue Card Crab), ch4-west (Clapper Snapper),
// ch4-ny (Boom Mic Moth), ch4-sets (Stage 7 opens), ch4-stage, ch4-rigseq (the boxes switched on so far), ch4-rig (the
// rig is fixed; the catwalk comes down), ch4-boss, battle:directorscut ('win'), ch4-clear (the rack is back), ch4-done.
// ======================================================================================================
const CH4={mode:'full',chapter:4};
const ch4Kiss=()=>({call:()=>{ const t=sceneActor('tnb'); if(t) { kiss={npc:t,start:elapsedTime}; sfx.kiss(); } }});
const CH4_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'TNB',lines:['Cut. Reset. Back to one. Everybody gets a touch-up.']}],else:[]},
  ...lines,
  {if:()=>flag('ch4-main')&&flag('ch4-west')&&flag('ch4-ny')&&!flag('ch4-sets'),then:[
    {flag:'ch4-sets'}, {call:()=>{ sfx.thud(); sfx.levelChime(); }},
    {talk:'Kiki',lines:['(on the radio) ...kkkt... Stage 7! The big door just unlocked itself! From the INSIDE! Is that bad? That feels bad.']},
    {talk:'TNB',lines:['All three sets are clear. And Stage 7 just opened. That\'s where the fog came from.']},
    {toast:'Goal: Soundstage 7, the big door at the top of the Backlot.',time:4.5}],else:[]}
];

// 1. Downtown, right off the plane: TNB is waiting at the cab stand on his lunch break. The heart-kiss. TNB joins.
SCENES.ch4Arrive=[
  {flag:'ch4-goal'},
  {join:'tnb',quiet:true}, {hide:'tnb'},
  {place:'tnb',at:[21,22],dir:'right'}, {show:'tnb'},
  {talk:'TNB',lines:['Well, well, well...'],voice:[['tnb','greet',0,'Well, well, well...']]},
  {walk:'tnb',to:routeBeside('tnb'),speed:.2},
  {face:'tom',dir:'left'},
  ch4Kiss(),
  {talk:'TNB',lines:['Look who flew in for my big day. I\'m on a forty-minute lunch. I spent thirty of it on the Metro.']},
  {talk:'Tom',lines:['You took the train to meet the plane.']},
  {talk:'TNB',lines:['I took the train to meet the man. The plane was a bonus.']},
  {trace:'tnb-hello4'}, {hearts:'tom'},
  {talk:'TNB',lines:['Big shoot today. BACKLOT BEDLAM. Car chases, a saloon, a fake New York. I have forty costumes on one rack, and every single one is steamed.',
    'Also, Olivia dropped Nara at your place again. Family trip to the desert. She\'s been howling at your front door since nine.']},
  {talk:'Tom',lines:['Then we get Nara. Then I watch you be very important. I\'m not joking.']},
  {talk:'TNB',lines:['Very, very important. I have a lanyard.']},
  {party:{lock:['tom','tnb']}},
  {toast:'Goal: pick up Nara at Tom’s house (3468) in Jefferson Park, south of Downtown.',time:4.5}
];
// 2. Jefferson Park: Nara on the porch. She comes running and joins.
SCENES.ch4Nara=[
  {flag:'ch4-nara'},
  {call:()=>{ sfx.bark&&sfx.bark(); sfx.bark&&sfx.bark(.2); }},
  {talk:'Nara',lines:['A howl from 2nd Ave. Nara has spotted Tom from the porch, two whole blocks away.']},
  {walk:'Nara',to:routeBeside('Nara'),speed:.1},
  {hearts:'tom'},
  {talk:'Nara',lines:['She does three laps around Tom, slams into his shins, and leans on him with all forty pounds.']},
  {talk:'Tom',lines:['Hi. Hi. Yes. I know. I was gone FOREVER. It was six days.']},
  {join:'nara'},
  {talk:'TNB',lines:['She\'s coming to set. I already asked. Nobody said yes, but nobody said no fast enough.']},
  {toast:'Goal: Sunset Gold Studios, the gate at the east end of Downtown.',time:4.5}
];
// 3. Studio Gate: the rack is gone and the shoot is about to collapse.
SCENES.ch4Gate=[
  {flag:'ch4-gate'},
  {talk:'Ray',lines:['Sunset Gold Studios. Closed set. Name?']},
  {talk:'TNB',lines:['Ray, it\'s me. Wardrobe. I left eighty minutes ago. You waved.']},
  {talk:'Ray',lines:['I wave at everybody. That\'s the job. Go on in.']},
  {walk:'Kiki',to:routeBeside('Kiki'),speed:.14},
  {talk:'Kiki',lines:['TNB! TNB! The rack! Rack two! It\'s GONE.']},
  {talk:'TNB',lines:['Gone? It\'s a rack. It has wheels. It doesn\'t have ambitions.']},
  {talk:'Kiki',lines:['It was right there in Stage 7. Then the fog machine turned itself on, and the lights went out, and things started CLAPPING.']},
  {walk:'Dana',to:routeBeside('Dana'),speed:.2},
  {talk:'Dana',lines:['Dana Park. Director. First feature. Without wardrobe there\'s no shoot. Without a shoot there\'s no movie.',
    'And the Backlot is full of little grumpy things. One of them ate a cue card. One of them is clapping at the horse.']},
  {talk:'Tom',lines:['Friction Sprites. On a closed set.']},
  {talk:'TNB',lines:['Babe. Forty costumes. I steamed every single one. By hand. While humming.']},
  {talk:'Tom',lines:['Then we go get them back. Nara, stay close. This is a professional environment.']},
  {talk:'Nara',lines:['Nara is already sniffing the craft services table.']},
  {toast:'Goal: the Backlot, north past the trailers. Find TNB’s rack.',time:4.5},
  {toast:'Tip: Toni at craft services (right) might have something picky Nara will actually eat.',time:4.5}
];
// 4. Optional: craft services. The one snack Nara will eat (talk to Toni or the table; data in ch4Crafty below).
SCENES.ch4Snack=[
  {flag:'ch4-snack'},
  {talk:'Toni',lines:['Plain roast chicken. No salt, no skin, no sauce. I keep it for the grips. They\'re also picky.']},
  {call:()=>{ sfx.pickup(); }},
  {talk:'Nara',lines:['Nara takes it very gently. Then she inhales it. Then she sits again, in case there\'s more.']},
  {hearts:'nara'}, {trace:'nara-snack'}, {call:()=>sfx.levelChime()},
  {talk:'TNB',lines:['She\'s never eaten anything that fast. Not even my shoe.']},
  {talk:'Toni',lines:['Here. For the road. Don\'t tell the grips.']},
  {give:'jerky'}, {give:'jerky'},
  {toast:'Toni slips you two Chicken Jerky. Nara watches the bag the whole time.',time:3.5}
];
// 5. The Backlot: Nara gets loose. Fetch leads her to the first clue, and she meets the hydrant.
SCENES.ch4Fetch=[
  {flag:'ch4-fetch',value:'pending'},
  {face:'tom',dir:'up'},
  {talk:'TNB',lines:['The Backlot. Main Street up on the left, the Western street on the right, New York down on the left. All fake. All very expensive.']},
  {call:()=>{ sfx.bark&&sfx.bark(); }},
  {talk:'Nara',lines:['Nara’s ears go straight up. Something shiny is skittering across New York.']},
  {talk:'Tom',lines:['Nara. NARA. Don\'t...']},
  {walk:'nara',to:routeTo('nara',14,6),speed:.1,onStep:i=>{ if(i%3===0) sfx.bark&&sfx.bark(); }},
  {talk:'TNB',lines:['That\'s a closed set! She\'s not on the call sheet!']},
  {face:'nara',dir:'down'},
  {wait:.5},
  {call:()=>{ const n=sceneActor('nara'); if(n) n.carry='tag'; sfx.pickup(); }},
  {talk:'Nara',lines:['Nara sniffs the fire hydrant. She gets VERY excited about the fire hydrant.']},
  {call:()=>{ const n=sceneActor('nara'); if(n&&typeof naraPuddle==='function') naraPuddle(currentMap,n.x,n.y); sfx.splat&&sfx.splat(); }},
  {talk:'TNB',lines:['She peed on the hydrant. That hydrant is fiberglass. That hydrant is a PROP.']},
  {talk:'Tom',lines:['She doesn\'t know that. Let her have this.']},
  {walk:'nara',to:routeBeside('nara'),speed:.12},
  {face:'tom',dir:'left'},
  {talk:'Nara',lines:['She drops something at Tom’s feet. Very proud. Very slobbery.']},
  {call:()=>{ const n=sceneActor('nara'); if(n) n.carry=null; sfx.pickup(); }},
  {talk:'TNB',lines:['That\'s a costume tag. That\'s MY tag. WARDROBE, RACK 2, HAND WASH ONLY. I underlined it twice.',
    'And it smells like fog juice. The grape kind. Only Stage 7 has a fog machine.']},
  {talk:'Tom',lines:['Good girl. Professional environment, very good girl.']},
  {trace:'nara-fetch'},
  {flag:'ch4-fetch'},
  {talk:'TNB',lines:['Stage 7 is locked from the inside, though. And every set out here has a Sprite on it wrecking the shoot. The crew can\'t work like this.']},
  {talk:'Tom',lines:['Then we clear the sets. One at a time. Main Street, the Western street, New York.']},
  {toast:'Goal: clear the three sets: the Western street (top left), New York (top right), and Main Street (the jungle set, right).',time:5}
];
// 6. The three sets. A troublemaker on each one.
SCENES.ch4Crab=[
  {flag:'ch4-main',value:'pending'},
  {walk:'Cue Card Crab',to:routeBeside('Cue Card Crab'),speed:.3},
  {talk:'Cue Card Crab',lines:['Pinch. This is MY set. I hold up the lines. Every line. I hold up this one: GO AWAY.']},
  {talk:'TNB',lines:['Those are the neatest cue cards I\'ve ever seen. Is that calligraphy?']},
  {talk:'Cue Card Crab',lines:['...Don\'t try to be nice to me. Nobody is nice to me. I\'ll PINCH.']},
  {battle:'cuecrab',tut:'ch4crab'},
  ...CH4_AFTER(()=>flag('battle:cuecrab')!=='win',[
    {flag:'ch4-main'},
    {talk:'TNB',lines:['Main Street is clear. The bank is safe. The pie is still foam.']}])
];
SCENES.ch4Clapper=[
  {flag:'ch4-west',value:'pending'},
  {call:()=>{ sfx.bonk&&sfx.bonk(); }},
  {walk:'Clapper Snapper',to:routeBeside('Clapper Snapper'),speed:.18},
  {talk:'Clapper Snapper',lines:['SNAP! Scene one, take one! SNAP! I go first! Nothing happens until I clap! SNAP!']},
  {talk:'Tom',lines:['It\'s very fast. And very loud.']},
  {talk:'TNB',lines:['That\'s every clapper I\'ve ever met.']},
  {battle:'clapper',tut:'ch4clapper'},
  ...CH4_AFTER(()=>flag('battle:clapper')!=='win',[
    {flag:'ch4-west'},
    {talk:'Tom',lines:['The Western street is clear. The horse can come out of its trailer now.']}])
];
SCENES.ch4Moth=[
  {flag:'ch4-ny',value:'pending'},
  {call:()=>{ sfx.whoosh(); }},
  {walk:'Boom Mic Moth',to:routeBeside('Boom Mic Moth'),speed:.25},
  {talk:'Boom Mic Moth',lines:['Bzzz. I hear everything on this set. Everything. Your knees click, Tom.']},
  {talk:'Tom',lines:['That was UNCALLED for!'],voice:[['tom','hurt',0,'That was UNCALLED for!']]},
  {talk:'TNB',lines:['Watch the screech, babe. It shuts you right up. No skills.']},
  {battle:'boommoth',tut:'ch4moth'},
  ...CH4_AFTER(()=>flag('battle:boommoth')!=='win',[
    {flag:'ch4-ny'},
    {talk:'TNB',lines:['New York is clear. It never looked better. It\'s plywood.']}])
];
// 7. Soundstage 7: dark, foggy, and the catwalk is up.
SCENES.ch4Stage=[
  {flag:'ch4-stage'},
  {talk:'TNB',lines:['Somebody killed the work lights. And look, the catwalk is up. You only raise a catwalk when you\'re hiding something up there.']},
  {talk:'Tom',lines:['The stage set is at the top. The rack is up there. I can smell the steamer.']},
  {talk:'TNB',lines:['The main light rig runs the catwalk motor. If I get power back to it, the catwalk comes down.',
    'Three junction boxes. They have to come up in the right order or the dimmer pops. The rig will tell us the order.']},
  {toast:'Goal: get the light rig working. Look at the rig (middle of the floor), then flip the three junction boxes in the right order.',time:5.5}
];
// 8. The rig works. TNB tapes the cable. The catwalk comes down.
SCENES.ch4Rig=[
  {flag:'ch4-rig'},
  {call:()=>{ sfx.levelChime(); }},
  {talk:'TNB',lines:['Blue, amber, red. And one strip of gaffer tape. Okay, two. Okay, four.']},
  {call:()=>{ sfx.thud(); sfx.whoosh(); }},
  {call:()=>{ ch4LowerCatwalk(); storyWorld(); }},
  {talk:'Soundstage 7',lines:['The rig hums. The work lights bang on, one row at a time. Up the middle, the catwalk groans down into place.']},
  {talk:'Tom',lines:['You fixed a whole soundstage with tape.']},
  {talk:'TNB',lines:['I fix everything with tape. You know this. Your kitchen drawer knows this.']},
  {trace:'tnb-rig'}, {hearts:'tnb'},
  {toast:'Goal: up the stairs to the stage set (top).',time:4.5}
];
// 9. The stage set: The Director's Cut, sitting on TNB's rack. Boss fight.
SCENES.ch4Boss=[
  {flag:'ch4-boss'}, {call:()=>storyWorld()},
  {hide:'The Director’s Cut'},
  {walk:'tom',to:routeTo('tom',10,9),speed:.25}, {face:'tom',dir:'up'},
  {place:'tnb',at:[9,9],dir:'up'}, {place:'nara',at:[11,9],dir:'up'},
  {talk:'TNB',lines:['My rack. MY RACK. All forty. Still steamed. Oh, I could cry.']},
  {call:()=>{ sfx.thud(); sfx.whoosh(); }},
  {show:'The Director’s Cut'}, {face:'The Director’s Cut',dir:'down'},
  {talk:'The Director’s Cut',lines:['CUT! CUT! CUT! Who said you could walk onto my set? The blocking is WRONG.',
    'Forty years I\'ve been on this lot. Forty years of bad takes, yelled through ME. Nobody ever gets it right.']},
  {talk:'Tom',lines:['You took the rack.']},
  {talk:'The Director’s Cut',lines:['If there are no costumes, there\'s no take. If there\'s no take, there\'s no BAD take. It\'s perfect. It\'s my best work.']},
  {talk:'TNB',lines:['Babe. It\'s a megaphone in a beret. It has notes.']},
  {talk:'Nara',lines:['Nara growls at the megaphone. Very small growl. Very serious.']},
  {talk:'Tom',lines:['This is a closed set. And you\'re not on the call sheet.']},
  {battle:'directorscut',tut:'directorscut'},
  {if:()=>flag('battle:directorscut')!=='win',then:[
    {heal:true},
    {talk:'TNB',lines:['Back to one, everybody. Touch-ups.','Babe, when it says CUT, put WARDROBE on whoever is next. When it braces, Popcorn Jump. Or just tell it GREAT TAKE. Three times.']},
    {toast:'Face The Director’s Cut and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 10. After the boss (won in the scene, or on a retry with A): the rack comes back. Rewards.
SCENES.ch4AfterBoss=()=>[
  {flag:'ch4-clear'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  ...(flag('kind:directorscut')?[
    {talk:'The Director’s Cut',lines:['...Great take. Nobody has ever said that to me. Forty years. Not once.','I think I\'d like to hear it again. Somewhere quiet. On a shelf.']}]:[
    {talk:'The Director’s Cut',lines:['Fine. FINE. That’s a wrap. On me. I\'m going back in the prop closet.']}]),
  {call:()=>{ setFlag('ch4-wrap'); storyWorld(); sfx.whoosh(); }},
  {talk:'Stage set',lines:['The megaphone hops off the rack and rolls away under the set, muttering about lighting.']},
  {talk:'TNB',lines:['Forty. I counted. I\'m going to count again. Forty.']},
  {talk:'TNB',lines:['And look. Somebody stuck a note on the steamer. "Paid in full." With a gold coin taped to it.']},
  {talk:'Tom',lines:['A gold coin. Again. Somebody keeps leaving these around. Somebody in a long coat, if Oolong’s kettle is right.']},
  {talk:'TNB',lines:['Spooky. I love it. I hate it. Help me push. This thing has four wheels and four opinions.']},
  {toast:'Goal: wheel the rack back to the Studio Gate. Dana is waiting.',time:4.5}
];
// 11. Studio Gate: the wrap party. Chapter complete.
SCENES.ch4End=[
  {flag:'ch4-done',value:'pending'},
  {walk:'Dana',to:routeBeside('Dana'),speed:.2},
  {talk:'Dana',lines:['The rack! The costumes! We can shoot! We\'re shooting! That\'s a WRAP on today, everybody!']},
  {call:()=>{ sfx.levelChime(); }},
  {talk:'Kiki',lines:['WRAP PARTY AT CRAFTY! Toni made a cake! It\'s shaped like a clapper! It\'s not clapping!']},
  {talk:'Dana',lines:['TNB, the studio wants you to have this. Gold-plated. It\'s the steamer from the lot’s very first wardrobe department.']},
  {give:'n_steamer'},
  {toast:'TNB gets a new Signature Tool: the Golden Garment Steamer (POW +4, WARMTH +7). Equip it in the menu.',time:4.5},
  {talk:'TNB',lines:['I\'m going to cry. I\'m not going to cry. I\'m a professional. I\'m crying a little.']},
  {talk:'Tom',lines:['You\'re a professional. A crying professional. I\'m so proud of you.']},
  {talk:'Dana',lines:['And crew jackets. Wrap Party Jackets. Only the crew gets one. You\'re crew now. Even the dog.']},
  {give:'wrapjacket'},
  {toast:'New outfit: the Wrap Party Jacket. Purple satin. Anyone can wear it.',time:4},
  {talk:'TNB',lines:['You know what this whole day was? A real steam-ulating experience.']},
  {talk:'Tom',lines:['...','I flew three thousand miles for that pun.']},
  {talk:'TNB',lines:['Worth it?']},
  ch4Kiss(),
  {talk:'Tom',lines:['Worth it. Every mile. But for the record? That was a CLOSED set!']},
  {talk:'Nara',lines:['Nara leans on both of them. A tiny excited puddle. Nobody minds. Craft services minds a little.']},
  {call:()=>{ if(typeof naraPuddle==='function') { const n=sceneActor('nara'); if(n) naraPuddle(currentMap,n.x,n.y); } }},
  {trace:'ch4-wrap'}, {hearts:'tom'},
  {call:()=>{ sfx.ding&&sfx.ding(); }},
  {talk:'Tom',lines:['A text from Amy. "Parent-teacher conference night is Thursday. Thirty parents. I need backup. Bring snacks. And bring the good uncle."']},
  {talk:'TNB',lines:['You\'re the only uncle.']},
  {talk:'Tom',lines:['Which makes me the good one. By default. I\'ll take it.']},
  {party:null},
  {fade:'out',time:.8}, {card:4,done:true,time:3.4}, {flag:'ch4-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'Chapter 4 complete! When you\'re ready, Sol at Angel City Cab Co. (downtown) flies you home for chapter 5.',time:6}
];
TRIGGERS.push(
  {id:'ch4-arrive',map:'blvd',when:{...CH4,notFlag:'ch4-goal'},scene:'ch4Arrive'},
  {id:'ch4-nara',map:'jpark',when:{...CH4,flag:'ch4-goal',notFlag:'ch4-nara',test:()=>!inParty(nara)},scene:'ch4Nara'},
  {id:'ch4-gate',map:'studio',when:{...CH4,flag:'ch4-nara',notFlag:'ch4-gate'},scene:'ch4Gate'},
  {id:'ch4-fetch',map:'backlot',when:{...CH4,flag:'ch4-gate',notFlag:'ch4-fetch',test:()=>inParty(nara)},scene:'ch4Fetch'},
  {id:'ch4-main',map:'backlot',at:[9,9,13,13],when:{...CH4,flag:'ch4-fetch',notFlag:'ch4-main'},scene:'ch4Crab'},
  {id:'ch4-west',map:'backlot',at:[0,5,9,7],when:{...CH4,flag:'ch4-fetch',notFlag:'ch4-west'},scene:'ch4Clapper'},
  {id:'ch4-ny',map:'backlot',at:[12,3,15,6],when:{...CH4,flag:'ch4-fetch',notFlag:'ch4-ny'},scene:'ch4Moth'},
  {id:'ch4-stage',map:'stage7',when:{...CH4,flag:'ch4-sets',notFlag:'ch4-stage'},scene:'ch4Stage'},
  {id:'ch4-boss',map:'stageset',when:{...CH4,flag:'ch4-rig',notFlag:'ch4-boss'},scene:'ch4Boss'},
  {id:'ch4-after',map:'stageset',when:{...CH4,flag:{'battle:directorscut':'win'},notFlag:'ch4-clear'},scene:'ch4AfterBoss'},
  {id:'ch4-end',map:'studio',when:{...CH4,flag:'ch4-clear',notFlag:'ch4-done'},scene:'ch4End'}
);
// The Backlot holds still until Nara's fetch; each set's troublemaker holds still until its story fight.
const CH4_SET_FLAG={cuecrab:'ch4-main',clapper:'ch4-west',boommoth:'ch4-ny'};
HOLD_RULES.push(n=>STORY.chapter===4&&currentMap.id==='backlot'&&(flag('ch4-fetch')!==true||(CH4_SET_FLAG[n.monster]&&flag(CH4_SET_FLAG[n.monster])!==true)));
// Soundstage 7's monsters hold still in the dark until the light rig is fixed (nobody can see anybody).
HOLD_RULES.push(n=>STORY.chapter===4&&currentMap.id==='stage7'&&!flag('ch4-rig'));

// Map changes. They check flags (not events), so they also hold after loading a save.
// The catwalk up to the stage set in Soundstage 7 comes down once the rig is fixed: the gate on the stairs (data/maps-la.js stage7 gates)
// opens on the flag ch4-rig, so there is no tile to change on the painted map.
function ch4LowerCatwalk() {
  const M=worlds.stage7; if(!M||M.catwalkDown) return;
  M.catwalkDown=true; M.mini=null;
}
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  if(flag('ch4-rig')) ch4LowerCatwalk();
  // Nara waits on Tom's porch until she joins.
  if(STORY.chapter===4&&!flag('ch4-nara')&&typeof NARA_NPC!=='undefined') {
    if(inParty(nara)) setFlag('ch4-nara');
    else if(!NARA_NPC.porch4&&worlds.jpark.npcs.includes(NARA_NPC)) { const d=houseById.tomhouse.door; Object.assign(NARA_NPC,{x:d.x,y:d.y+1,facing:'down',path:[],move:null,idle:1e9,porch4:true}); }
  }
  if(NARA_NPC&&NARA_NPC.porch4&&flag('ch4-nara')&&NARA_NPC.idle>1e8) NARA_NPC.idle=1;
  // The Director's Cut stays out of sight until the party walks onto the set, and leaves after.
  const b=findMonster('directorscut'); if(!b) return;
  const under=STORY.chapter<4||(STORY.chapter===4&&!flag('ch4-boss'))||!!flag('ch4-wrap');
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});

// The light rig puzzle. Junction boxes switched on in the order of the gels on the rig (blue, amber, red). A wrong box
// trips the dimmer and everything goes off again. Progress is kept in the flag ch4-rigseq.
const CH4_RIG_ORDER=['blue','amber','red'];
const ch4Seq=()=>(flag('ch4-rigseq')||'').split(',').filter(Boolean);
function ch4BoxOn(c) { return typeof flag==='function'&&(!!flag('ch4-rig')||ch4Seq().includes(c)); }
function ch4Box(o) {
  if(STORY.mode!=='full'||STORY.chapter!==4||!flag('ch4-stage')||flag('ch4-rig')) return false;
  const seq=ch4Seq();
  if(seq.includes(o.jbox)) { openDialog(o.name,['It\'s already on. The little light is green.']); return true; }
  if(CH4_RIG_ORDER[seq.length]!==o.jbox) {
    setFlag('ch4-rigseq',false); sfx.bump(); sfx.thud&&sfx.thud();
    openDialog('TNB',[seq.length?'POP. The dimmer tripped. Everything is off again.':'CLUNK. The switch flips, sparks, and flips right back.',
      pick(['Order matters, babe. Look at the gels on the rig. Left to right.','The rig tells us the order. The colors across the front.','Wrong one. The rig is the cheat sheet. Go look at it.'])]);
    return true;
  }
  seq.push(o.jbox); setFlag('ch4-rigseq',seq.join(','));
  sfx.select(); sfx.ding&&sfx.ding();
  if(seq.length<CH4_RIG_ORDER.length) { openDialog(o.name,['CLICK. The switch holds. A little light turns green. '+(seq.length===1?'One down.':'Two down.')]); return true; }
  playScene('ch4Rig'); return true;
}
// Craft services: pick the one snack picky Nara will eat (Heart-Trace). Toni or the table.
const CH4_SNACKS=[
  {label:'A CHEESE DANISH',no:'Nara sniffs the danish. She looks at Tom like he has said something very hurtful.'},
  {label:'KALE CHIPS',no:'Nara licks one kale chip. She puts it on Tom’s shoe. Gently. On purpose.'},
  {label:'PLAIN ROAST CHICKEN',ok:true},
  {label:'A FANCY SLIDER',no:'Nara sniffs the slider. Too much sauce. She turns her whole body away from it.'}];
function ch4Crafty(n) {
  if(STORY.mode!=='full'||STORY.chapter!==4||!inParty(nara)||!flag('ch4-gate')||flag('ch4-snack')) return false;
  openChoice('Toni',['Craft services! Bagels, cheese sticks, licorice, coffee. And something for the dog?','Nara sits. Very polite. Very picky. What does she get?'],
    CH4_SNACKS.map(sn=>({label:sn.label,fn:()=>{ if(sn.ok) playScene('ch4Snack'); else { sfx.nope&&sfx.nope(); openDialog('Nara',[sn.no,'Toni: "Picky! I respect that. Try again."'],n); } }})),n);
  return true;
}
const LE_pressAction_ch4=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='npc'&&v.crafty&&ch4Crafty(v)) return;
    if(t&&t.kind==='object'&&v.crafty) { const toni=currentMap.npcs.find(n=>n.crafty); if(ch4Crafty(toni||null)) return; }
    if(t&&t.kind==='object'&&v.jbox&&ch4Box(v)) return;
  }
  return LE_pressAction_ch4();
};
// TNB's costume tag, carried by Nara.
STORY_PROPS.tag=(cx,y)=>{ const yy=Math.round(y-6); rect(cx-5,yy-1,10,8,OUT); rect(cx-4,yy,8,6,'#f4f0e6'); rect(cx-3,yy+1,6,1,'#8a6aa0'); rect(cx-3,yy+3,4,1,'#8a6aa0'); rect(cx-1,yy-3,2,3,'#d94a3a'); };
// Soundstage 7 in the dark (until the rig is fixed): a pool of light around Tom. The fog machine room is always foggy.
STORY_MAPFX.push(time=>{
  const M=currentMap; if(M.id!=='stage7') return;
  // Fog in the fog machine corner (x 16 to 23, rows 3 to 12), drifting.
  for(let k=0;k<16;k++) { const n=hash(k,77),fx=16*T+((n%(7*T))+time*(8+k%4)*(k%2?1:-1)+7*T*4)%(7*T),fy=3*T+(n>>>9)%(9*T);
    gfx.globalAlpha=.32; ellipse(fx,fy,22+n%12,10+n%6,'#eef2f6'); }
  gfx.globalAlpha=1;
  if(flag('ch4-rig')) return;
  const p=position(player),px=(p.x+.5)*T,py=(p.y+.5)*T,c=gfx;
  const g=c.createRadialGradient(px,py,T*1.2,px,py,T*4.2); g.addColorStop(0,'rgba(8,9,14,0)'); g.addColorStop(1,'rgba(8,9,14,.82)');
  c.fillStyle=g; c.fillRect(0,0,M.w*T,M.h*T);
});

// Tips for the chapter 4 story fights and The Director's Cut.
TUTORIALS.ch4crab={
  setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
  tips:[
    {id:'praise',who:'*',dir:'down',care:1,text:'The crab is armored, but it really wants a compliment. ▼ Bag, then COMPLIMENT. It\'s free and fills its Warmth bar fast.'},
    {id:'inspect',who:'*',text:'Kinetic hits bounce off its shell. Splash and Chatter work. B Inspects it.'}]};
TUTORIALS.ch4clapper={tips:[
  {id:'first',who:'*',text:'The Clapper Snapper always goes first, and it\'s fast. Watch the turn ribbon: it shows up a lot.'},
  {id:'tombo',who:['tom','tnb'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='tnb1'&&!r.why),text:'◀ TOMBO: Popcorn Jump. Cozy, on every enemy. Clappers hate Cozy.'}]};
TUTORIALS.ch4moth={tips:[
  {id:'silence',who:'*',when:u=>!!u.st.silenced,text:'Silenced (MUTED): only the free basic move under ▲ Skills works for a couple of turns. ▶ signature moves, ▼ Bag and ◀ Tombos still work.'},
  {id:'moth',who:'*',text:'The moth is weak to Splash and Kinetic. Nara’s ▲ Jump Up is Kinetic.'}]};
TUTORIALS.directorscut={tips:[
  {id:'cut',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='cut'),text:'CUT! is coming (on the ribbon). Whoever is next loses their turn. TNB’s WARDROBE makes them Fresh: CUT! can\'t touch them.'},
  {id:'take',who:'*',dir:'down',care:1,text:'It\'s never once heard "great take." ▼ Bag, GREAT TAKE! Say it three times and it gives up happy. Anyone can say it.'},
  {id:'heal',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='heal'),text:'Take Two is coming: it\'ll heal itself. Hit it hard now.'},
  {id:'wrap',who:['tom','tnb'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>r.T.id==='tnb1'&&!r.why),text:'It\'s bracing for THAT’S A WRAP. ◀ TOMBO: Popcorn Jump smashes the guard in one go.'},
  {id:'wrap2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'It\'s bracing for THAT’S A WRAP on everyone. Break its guard: any Tombo, or 3 Cozy hits (TNB’s Kiln Door Policy breaks it at once).'}]};

// ======================================================================================================
// CHAPTER 5: Parent-Teacher Conference of Doom. Sol flies Tom home (storyTripSteps sets chapter 5). Conference night at
// Long Island Elementary (east of the Square). Party: Tom, Grace, Rose and Amy (locked in by the scene). TNB and Nara stay
// in LA; Deedee bakes; Boppy rests.
// Flags, in story order: ch5-sol (Sol's line), ch5-goal (Amy joins in the Square; tombo:amy1), ch5-pruitt (the
// schoolyard), ch5-hall (the glitter trail; the hallway wakes up), ch5-snack (optional: Deedee's plate in the staff
// fridge, Heart-Trace), ch5-art (Tardy Bell), ch5-music (Glitter Glue), ch5-gym (Dodgeball Dread), ch5-clock-art,
// ch5-clock-music, ch5-clock-gym (set to 7:00), ch5-clocks (the Cafetorium opens), ch5-boss, battle:redpen ('win'),
// ch5-clear (the sheet is back, with a gold coin), ch5-wrap (the pen leaves), ch5-done (the parking lot).
// ======================================================================================================
const CH5={mode:'full',chapter:5};
const CH5_ROOMS=[{c:'art',name:'Art room',mon:'tardybell'},{c:'music',name:'Music room',mon:'glitterglue'},{c:'gym',name:'Gym',mon:'dodgeball'}];
const CH5_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'Amy',lines:['Up! Everybody up! Walk it off. Hydrate. We go again.']}],else:[]},
  ...lines
];

// 1. The Square, right after the girls' welcome: Amy, a clipboard and two coffees. Amy joins.
SCENES.ch5Arrive=[
  {flag:'ch5-goal'},
  {join:'amy',quiet:true}, {hide:'amy'},
  {place:'amy',at:spotNear(4),dir:'up'}, {show:'amy'},
  {talk:'Amy',lines:['TOM. Oh, thank goodness.']},
  {walk:'amy',to:routeBeside('amy'),speed:.12,onStep:i=>{ if(i%2===0) sfx.run(); }},
  {talk:'Amy',lines:['Two coffees. Both mine. Here, have one. That\'s how much I need you tonight.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['You brought me coffee. At night. That\'s a cry for help.']},
  {talk:'Amy',lines:['It\'s conference night. Thirty parents at seven o’clock. And the school has lost its mind.',
    'The bells ring whenever they feel like it. Every clock says a different time. And the sign-up sheet ran off.']},
  {talk:'Grace',lines:['Ran off? Like, RAN? On legs?']},
  {talk:'Amy',lines:['On little paper legs. Mrs. Kowalski saw it. She\'s still upset about it.']},
  {talk:'Rose',lines:['Mom. Mom. Are we going to SCHOOL? At NIGHT? That\'s the best thing that ever happened.']},
  {talk:'Amy',lines:['Everybody is coming. I have a clipboard, and I\'m not afraid to use it.']},
  {trace:'amy-coffee'}, {hearts:'tom'},
  {flag:'tombo:amy1'},
  {party:{lock:['tom','grace','rose','amy']}},
  {toast:'New Tombo: I Called It! (Tom + Amy). In battle, ◀ TOMBO.',time:3.5},
  {toast:'Goal: Long Island Elementary, through the gate at the east end of the Square.',time:4.5}
];
// 2. The schoolyard: Principal Pruitt explains. Conferences start at seven.
SCENES.ch5Pruitt=[
  {flag:'ch5-pruitt'},
  {call:()=>{ sfx.ding(); }},
  {talk:'School bell',lines:['BRRRRRING. From inside the school. Then again. Then a little one: brring?']},
  {walk:'Principal Pruitt',to:routeBeside('Principal Pruitt'),speed:.2},
  {talk:'Principal Pruitt',lines:['Mrs. Gregori! Thank goodness. And you brought the whole family.']},
  {talk:'Amy',lines:['Principal Pruitt, my brother Tom. He\'s very good in a crisis. He\'s also very calm about it, which is annoying.']},
  {talk:'Tom',lines:['Hello. I hear your bells are haunted.']},
  {talk:'Principal Pruitt',lines:['Not haunted. Grumpy. Thirty-one years in this building. I know the difference.',
    'The bells ring at random. The clocks in the hall all say different times. And the sign-up sheet got up off the table and walked into the school.',
    'The Cafetorium doors run on the bell system. The bells run on the hallway clocks. Thirty parents are on their way, and those doors won\'t open.']},
  {talk:'Grace',lines:['Doors don\'t just not open. That\'s not how doors work.']},
  {talk:'Principal Pruitt',lines:['Set every clock in the hall to seven. Seven o’clock. Not seven-thirty. Not six-fifty-nine. Seven.']},
  {talk:'Rose',lines:['Tata. A school. At NIGHT. With MONSTERS, probably.']},
  {talk:'Tom',lines:['Stay close, everybody. This is a professional learning environment.']},
  {toast:'Goal: into the school (the front doors, at the top).',time:4.5}
];
// 3. The hallway: every clock is wrong. Rose finds the glitter trail; Grace reads the room numbers.
SCENES.ch5Hall=[
  {flag:'ch5-hall',value:'pending'},
  {call:()=>{ sfx.ding(); }},
  {talk:'Tom',lines:['...Every clock in this hall says a different time.']},
  {talk:'Amy',lines:['That one says four. That one says nine. That one is going BACKWARDS. I teach time, Tom. This is personal.']},
  {talk:'Rose',lines:['Tata! Tata! SPARKLY FOOTPRINTS!']},
  {face:'rose',dir:'up'},
  {talk:'Rose',lines:['Little paper feet. With glitter. They go EVERYWHERE.']},
  {talk:'Grace',lines:['I can read the doors. Room One is ART. Room Two is MUSIC. Room Three is the GYM.',
    'The gym isn\'t a room. It\'s a gym. It has a number anyway.']},
  {talk:'Grace',lines:['The footprints go into all three. Then out again. Then east, to the Cafetorium.']},
  {talk:'Amy',lines:['Girls. That\'s excellent detective work. Gold stars. Both of you.']},
  {trace:'sisters-trail'}, {hearts:'rose'},
  {talk:'Tom',lines:['Then we clear Art, Music and the Gym. After each one, we fix its clock. Seven o’clock.']},
  {flag:'ch5-hall'},
  {toast:'Goal: clear the Art room, the Music room and the Gym (top). After each, set its hallway clock to 7:00.',time:5.5},
  {toast:'Tip: the staff room (bottom left) has a fridge. Rose is hungry.',time:4}
];
// 4. Optional: the staff fridge. Which one is not somebody's lunch? (data in ch5Fridge below).
SCENES.ch5Snack=[
  {flag:'ch5-snack'},
  {talk:'Grace',lines:['FOR EVERYONE, LOVE DEEDEE. That\'s Deedee’s handwriting! Everyone means us!']},
  {call:()=>sfx.pickup()},
  {talk:'Rose',lines:['Rhubarb crisp! Deedee brings the teachers CRISP?']},
  {talk:'Mr. Halverson',lines:['Every conference night. Twelve years. It\'s the only reason Gary shows up.']},
  {talk:'Amy',lines:['She never told me that. Of course she never told me that.']},
  {talk:'Tom',lines:['To the moon and back. And apparently to the staff room.']},
  {hearts:'grace'}, {trace:'deedee-plate'}, {call:()=>sfx.levelChime()},
  {heal:true},
  {talk:'Mr. Halverson',lines:['Take some for the road. Don\'t tell Gary.']},
  {give:'picnic'},
  {toast:'Everyone is healed. Mr. Halverson slips you a Picnic Basket.',time:3.5}
];
// 5. The three rooms. A troublemaker in each one.
SCENES.ch5Art=[
  {flag:'ch5-art',value:'pending'},
  {call:()=>sfx.ding()},
  {walk:'Tardy Bell',to:routeBeside('Tardy Bell'),speed:.2,onStep:()=>sfx.ding()},
  {talk:'Tardy Bell',lines:['DING! You\'re LATE! Everybody is late! I ring and I ring and nobody is ever on time!']},
  {talk:'Amy',lines:['I\'ve never been late in my life. Not once. Not even when I was born. I was early.']},
  {talk:'Tardy Bell',lines:['...DING. Prove it.']},
  {battle:'tardybell',tut:'ch5bell'},
  ...CH5_AFTER(()=>flag('battle:tardybell')!=='win',[
    {flag:'ch5-art'},
    {talk:'Grace',lines:['Tata, listen. The clock outside the Art room stopped spinning.']},
    {toast:'The Art room clock (in the hall, beside the Art door) can be set now.',time:4}])
];
SCENES.ch5Music=[
  {flag:'ch5-music',value:'pending'},
  {walk:'Glitter Glue',to:routeBeside('Glitter Glue'),speed:.3,onStep:()=>sfx.splat()},
  {talk:'Glitter Glue',lines:['Squelch. I glued the piano. I glued the xylophone. I glued a recorder to a tuba. It\'s ART.']},
  {talk:'Rose',lines:['Tata, it\'s SPARKLY. I love it. I hate it. I love it.']},
  {talk:'Grace',lines:['You can\'t glue a xylophone. That\'s not how xylophones work.']},
  {battle:'glitterglue',tut:'ch5glue'},
  ...CH5_AFTER(()=>flag('battle:glitterglue')!=='win',[
    {flag:'ch5-music'},
    {talk:'Rose',lines:['The glitter footprints stop here! And over there. And on Tata.']},
    {toast:'The Music room clock (in the hall, beside the Music door) can be set now.',time:4}])
];
SCENES.ch5Gym=[
  {flag:'ch5-gym',value:'pending'},
  {call:()=>sfx.bonk&&sfx.bonk()},
  {walk:'Dodgeball Dread',to:routeBeside('Dodgeball Dread'),speed:.15,onStep:()=>sfx.bonk&&sfx.bonk()},
  {talk:'Dodgeball Dread',lines:['BOING. Everybody against the wall. Nobody picks me first. Nobody EVER picks me first.']},
  {talk:'Amy',lines:['Oh, I remember you. Fourth grade. You and me. Every Friday.']},
  {talk:'Tom',lines:['Amy was the scariest kid in dodgeball. They had to make a rule about her.']},
  {talk:'Amy',lines:['The Gregori Rule. No throwing at teachers. It\'s still on the wall.']},
  {battle:'dodgeball',tut:'ch5dodge'},
  ...CH5_AFTER(()=>flag('battle:dodgeball')!=='win',[
    {flag:'ch5-gym'},
    {talk:'Amy',lines:['You know I was terrified of that thing? Every Friday. That\'s why I threw so hard.']},
    {talk:'Tom',lines:['I know. You threw one at me at Thanksgiving. I was holding a pie.']},
    {talk:'Amy',lines:['You caught the pie, though.']},
    {talk:'Tom',lines:['I caught the pie.']},
    {trace:'amy-dodgeball'}, {hearts:'amy'},
    {toast:'The Gym clock (in the hall, beside the Gym door) can be set now.',time:4}])
];
// 6. All three clocks say seven: one bell, right on time. The Cafetorium doors open.
SCENES.ch5Clocks=[
  {flag:'ch5-clocks'},
  {call:()=>{ sfx.ding(); }}, {wait:.5},
  {talk:'School bell',lines:['BRRRRRING. One bell. Right on time. Then silence. The good kind.']},
  {call:()=>{ ch5OpenCafe(); storyWorld(); sfx.thud(); sfx.levelChime(); }},
  {talk:'Principal Pruitt',lines:['(on the intercom) ...ksssh... Attention, please. The Cafetorium doors are OPEN. Parents, please wait in the hall. There\'s something in the Cafetorium.',
    'Mrs. Gregori’s brother, please go into the Cafetorium. Thank you. ...ksssh.']},
  {talk:'Amy',lines:['The footprints go in there. The sign-up sheet is in there.']},
  {talk:'Grace',lines:['And the something.']},
  {flag:'tombo:grace2'},   // Uncle Spotter Toss unlocks here (chapter 5: the school is clear)
  {toast:'New Tombo: Uncle Spotter Toss (Tom + Grace). 50% HEART.',time:3.2},
  {toast:'Goal: the Cafetorium, at the east end of the hall.',time:4.5}
];
// 7. The Cafetorium: The Red Pen, grading the sign-up sheet on the stage. Boss fight.
SCENES.ch5Boss=[
  {flag:'ch5-boss'}, {call:()=>storyWorld()},
  {hide:'The Red Pen'},
  {walk:'tom',to:routeTo('tom',9,6),speed:.25}, {face:'tom',dir:'up'},
  {place:'amy',at:[10,6],dir:'up'}, {place:'grace',at:[8,6],dir:'up'}, {place:'rose',at:[9,7],dir:'up'},
  {talk:'Grace',lines:['There! The sign-up sheet! On the podium!']},
  {talk:'Rose',lines:['It\'s covered in RED.']},
  {call:()=>{ sfx.thud(); sfx.whoosh(); }},
  {show:'The Red Pen'}, {face:'The Red Pen',dir:'down'},
  {talk:'The Red Pen',lines:['Click. Wrong. Wrong. Wrong. Every name on this sheet is written wrong.',
    'Kowalski has a W. Delgado has a G. Gregori has TWO Rs, and nobody ever writes them neatly.']},
  {talk:'Amy',lines:['That\'s the conference sign-up sheet. Thirty parents are waiting for it.']},
  {talk:'The Red Pen',lines:['A hundred thousand wrong answers, I\'ve marked. Every quiz. Every spelling test. Every crooked line.',
    'Nobody ever grades ME. Nobody ever writes NEAT next to ME. So tonight, I grade the grown-ups.']},
  {talk:'Tom',lines:['You took the sign-up sheet to grade it.']},
  {talk:'The Red Pen',lines:['And the bells. And the clocks. Late is late. Points off.']},
  {talk:'Rose',lines:['Tata, it\'s a PEN. With GLASSES.']},
  {talk:'Amy',lines:['I\'m going to count to three, and you\'re going to put the sheet down. One.']},
  {talk:'Tom',lines:['That\'s her teacher voice. I\'d listen.']},
  {battle:'redpen',tut:'redpen'},
  {if:()=>flag('battle:redpen')!=='win',then:[
    {heal:true},
    {talk:'Amy',lines:['Up. Everybody. Walk it off.','Tom, when it says SEE ME, step in front of them. Grace, Squishy anyone it circles. And somebody tell it its handwriting is nice. Three times.']},
    {toast:'Face The Red Pen and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 8. After the boss (won in the scene, or on a retry with A): the sheet comes back, with a gold coin. Conferences.
SCENES.ch5AfterBoss=()=>[
  {flag:'ch5-clear'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  ...(flag('kind:redpen')?[
    {talk:'The Red Pen',lines:['...Nice handwriting. Nobody has ever said that. A hundred thousand papers. Not once.','I fixed the spelling. And I gave everyone a gold star. In red. It\'s the only color I have.']}]:[
    {talk:'The Red Pen',lines:['Click. Fine. FINE. Pencils down. I\'m going back in my cup.']}]),
  {call:()=>{ setFlag('ch5-wrap'); storyWorld(); sfx.whoosh(); }},
  {talk:'Podium',lines:['The Red Pen clicks itself shut, rolls off the podium, and hops away down the hall toward the second grade room.']},
  {talk:'Amy',lines:['...It\'s going to my desk. Of course it\'s going to my desk.']},
  {talk:'Grace',lines:['The sign-up sheet! It\'s a bit crumpled. And look, Tata. Something is taped to the bottom.']},
  {talk:'Tom',lines:['A gold coin. Again. Same little clock face.','The sundial. The steamer. Now the sign-up sheet. Somebody keeps leaving these where we\'ll find them.']},
  {talk:'Amy',lines:['Whoever it is has very neat tape. Look at those corners.']},
  {talk:'Rose',lines:['Can we keep it? I\'ll keep it inside Lamby.']},
  {talk:'Tom',lines:['We keep it. In my pocket. Not inside Lamby.']},
  {fade:'out',time:.6},
  {spawn:{name:'Principal Pruitt',look:'pruitt',at:[12,6],dir:'left'}},
  {fade:'in',time:.6},
  {talk:'Principal Pruitt',lines:['The sheet! The bells! The clocks! Parents, come on in! Conference night is ON!']},
  {fade:'out',time:.8},
  {talk:'Conference night',lines:['For two hours, Amy talks to thirty parents. Grace hands out cookies. Rose tells everybody the pen had glasses. Tom stacks chairs and nods calmly.']},
  {fade:'in',time:.8},
  {talk:'Principal Pruitt',lines:['Mrs. Gregori. Best conference night in thirty-one years. Not one parent cried. Well. Mr. Delgado. Happy tears.',
    'This is for you. My Golden Stopwatch. Thirty-one Field Days. It\'s never once stopped early.']},
  {give:'a_stopwatch'},
  {toast:'Amy gets a new Signature Tool: the Golden Stopwatch (POW +5, WARMTH +6). Equip it in the menu.',time:4.5},
  {talk:'Amy',lines:['Principal Pruitt, I can\'t take this.','...I\'m taking it. Thank you.']},
  {talk:'Principal Pruitt',lines:['And Field Day shirts. Staff shirts. You\'re all staff now. Even the small loud ones.']},
  {give:'fielddaytee'},
  {toast:'New outfit: the Field Day Tee. GO SNAILS. Anyone can wear it.',time:4},
  {despawn:'Principal Pruitt'},
  {toast:'Goal: walk Amy out to her minivan, in the schoolyard parking lot.',time:4.5}
];
// 9. The parking lot: Justin texts. A man in a long coat by the last car. Chapter complete.
SCENES.ch5End=[
  {flag:'ch5-done',value:'pending'},
  {walk:'tom',to:routeTo('tom',4,14),speed:.2}, {face:'tom',dir:'left'},
  {place:'amy',at:[3,13],dir:'right'}, {place:'grace',at:[5,14],dir:'left'}, {place:'rose',at:[4,15],dir:'up'},
  {talk:'Amy',lines:['Thirty conferences. Zero tears. One very well-behaved pen.']},
  {call:()=>sfx.ding()},
  {talk:'Amy',lines:['Oh. A text. From Justin.','"Heard it went great. Proud of you. Stuck at work till nine. Save me a cookie." With a little heart.']},
  {talk:'Grace',lines:['Dad used the heart! He only uses the heart on special days!']},
  {talk:'Amy',lines:['Girls. Did we save a cookie for Dad?']},
  {talk:'Rose',lines:['...Define save.']},
  {talk:'Rose',lines:['Tata. Tata. There\'s a man.']},
  {spawn:{name:'Long coat',look:'longcoat',at:[9,16],dir:'up'}},
  {face:'tom',dir:'right'},
  {talk:'Rose',lines:['By the last car. In a long coat. He\'s looking at us.']},
  {wait:.8},
  {walk:'Long coat',to:[[10,16]],speed:.35},
  {call:()=>sfx.whoosh()}, {despawn:'Long coat'},
  {talk:'Tom',lines:['...Nobody there.']},
  {talk:'Amy',lines:['Probably a parent. A late one. There\'s always a late one.']},
  {talk:'Tom',lines:['Probably.','A long coat. Gold coins. That\'s what Oolong’s kettle said, too. I\'m keeping a list.']},
  {talk:'Grace',lines:['I\'m keeping a list too. Mine has a chart.']},
  {talk:'Amy',lines:['Everybody in the van. Tom, you too. You were the good uncle tonight. By a lot.']},
  {talk:'Tom',lines:['By default.']},
  {talk:'Amy',lines:['By a LOT. Take the compliment, Tom.']},
  {trace:'ch5-wrap'}, {hearts:'amy'}, {call:()=>sfx.levelChime()},
  {party:null},
  {fade:'out',time:.8}, {card:5,done:true,time:3.4}, {flag:'ch5-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'Chapter 5 complete! When you\'re ready, Sal at Long Island Taxi Co. flies you to Los Angeles for chapter 6.',time:6}
];
TRIGGERS.push(
  {id:'ch5-goal',map:'town',when:{...CH5,notFlag:'ch5-goal'},scene:'ch5Arrive'},
  {id:'ch5-pruitt',map:'schoolyard',when:{...CH5,flag:'ch5-goal',notFlag:'ch5-pruitt'},scene:'ch5Pruitt'},
  {id:'ch5-hall',map:'school',when:{...CH5,flag:'ch5-pruitt',notFlag:'ch5-hall'},scene:'ch5Hall'},
  {id:'ch5-art',map:'school',at:[1,3,8,5],when:{...CH5,flag:'ch5-hall',notFlag:'ch5-art'},scene:'ch5Art'},
  {id:'ch5-music',map:'school',at:[10,3,17,5],when:{...CH5,flag:'ch5-hall',notFlag:'ch5-music'},scene:'ch5Music'},
  {id:'ch5-gym',map:'school',at:[19,2,28,5],when:{...CH5,flag:'ch5-hall',notFlag:'ch5-gym'},scene:'ch5Gym'},
  {id:'ch5-boss',map:'cafetorium',when:{...CH5,flag:'ch5-clocks',notFlag:'ch5-boss'},scene:'ch5Boss'},
  {id:'ch5-after',map:'cafetorium',when:{...CH5,flag:{'battle:redpen':'win'},notFlag:'ch5-clear'},scene:'ch5AfterBoss'},
  {id:'ch5-end',map:'schoolyard',when:{...CH5,flag:'ch5-clear',notFlag:'ch5-done'},scene:'ch5End'}
);
// The hallway holds still until the girls find the trail; each room's troublemaker holds still until its story fight.
const CH5_ROOM_FLAG={tardybell:'ch5-art',glitterglue:'ch5-music',dodgeball:'ch5-gym'};
HOLD_RULES.push(n=>STORY.chapter===5&&currentMap.id==='school'&&(flag('ch5-hall')!==true||(CH5_ROOM_FLAG[n.monster]&&flag(CH5_ROOM_FLAG[n.monster])!==true)));

// Map changes. They check flags (not events), so they also hold after loading a save.
// The Cafetorium doors (painted double doors, east end of the hall) open once the three clocks say seven.
function ch5OpenCafe() {
  const M=worlds.school; if(!M||M.cafeOpen) return;
  // The painted double doors (x 27 to 28, y 7 to 8): the locked-door object comes off and the two bottom tiles become exits.
  const o=M.objectAt.get(key(27,8));
  if(o) { M.objects.splice(M.objects.indexOf(o),1); for(const yy of [7,8]) for(const xx of [27,28]) M.objectAt.delete(key(xx,yy)); }
  for(const [x,sy] of [[27,6],[28,7]]) { opening(M,x,8,'cafetorium',{x:1,y:sy},'right','lino'); M.solid[8*M.w+x]=0; }
  M.cafeOpen=true; M.mini=null;
}
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  if(flag('ch5-clocks')||STORY.chapter>5) ch5OpenCafe();
  // The Red Pen stays out of sight until the party walks into the Cafetorium, and leaves after.
  const b=findMonster('redpen'); if(!b) return;
  b.mscale=1.5;   // drawn bigger on the stage (it is the boss)
  const under=STORY.chapter<5||(STORY.chapter===5&&!flag('ch5-boss'))||!!flag('ch5-wrap');
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});

// The hallway clocks. Each one spins until its room is cleared; then it can be set. Conferences are at seven.
function ch5ClockState(c) {
  if(typeof STORY==='undefined'||STORY.chapter>5||flag('ch5-clocks')||flag('ch5-clock-'+c)) return 'set';
  if(STORY.chapter===5&&flag('ch5-'+c)===true) return 'ready';
  return 'spin';
}
const CH5_TIMES=['6:30','7:00','7:45','12:00'];
function ch5Clock(o) {
  if(STORY.mode!=='full'||STORY.chapter!==5||!flag('ch5-hall')) return false;
  const R=CH5_ROOMS.find(r=>r.c===o.clock); if(!R) return false;
  const st=ch5ClockState(o.clock);
  if(st==='set') { openDialog(o.name,['Seven o’clock. Right on time. Amy taps the glass, approvingly.']); return true; }
  if(st==='spin') { openDialog(o.name,['The hands spin around and around. Something in the '+R.name+' is making it go haywire.','Grace: "We have to clear the '+R.name+' first, Tata."']); return true; }
  openChoice(o.name,['The hands have stopped. The clock is waiting.','Set it to what time?'],CH5_TIMES.map(t=>({label:t,fn:()=>{
    if(t!=='7:00') { sfx.nope&&sfx.nope(); openDialog('Amy',[pick(['Conferences are at SEVEN, Tom. Seven.','Tom. Seven. I have said it eleven times today.','Principal Pruitt said seven. Seven sharp. Not '+t+'.'])]); return; }
    setFlag('ch5-clock-'+o.clock); sfx.select(); sfx.ding&&sfx.ding();
    const n=CH5_ROOMS.filter(r=>flag('ch5-clock-'+r.c)).length;
    if(n>=3) { playScene('ch5Clocks'); return; }
    openDialog(o.name,['Click. Seven o’clock. The clock ticks normally for the first time in days.',n===1?'One clock down. Two to go.':'Two clocks down. One to go.']);
  }})));
  return true;
}
// The staff fridge: pick the one thing in it that is not somebody's lunch (Heart-Trace).
const CH5_FRIDGE=[
  {label:'A YOGURT THAT SAYS GARY',no:'It says GARY. Underlined twice. Under that: THIS MEANS YOU, GARY. Grace closes the fridge a little.'},
  {label:'A CONTAINER OF FISH',no:'Rose opens it. Rose closes it. Rose would like to go home now.'},
  {label:'A PLATE: FOR EVERYONE, LOVE DEEDEE',ok:true},
  {label:'A SAD DESK SALAD',no:'It\'s labeled TUESDAY. It\'s not Tuesday. It hasn\'t been Tuesday for a while.'}];
function ch5Fridge(o) {
  if(STORY.mode!=='full'||STORY.chapter!==5||!flag('ch5-hall')||flag('ch5-snack')) return false;
  openChoice('Staff fridge',['Every lunch in here has a name on it. Rose is hungry. Grace says the rules are the rules.','Which one is NOT somebody’s lunch?'],
    CH5_FRIDGE.map(f=>({label:f.label,fn:()=>{ if(f.ok) playScene('ch5Snack'); else { sfx.nope&&sfx.nope(); openDialog('Staff fridge',[f.no]); } }})));
  return true;
}
const LE_pressAction_ch5=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object'&&v.clock&&ch5Clock(v)) return;
    if(t&&t.kind==='object'&&v.fridge&&ch5Fridge(v)) return;
  }
  return LE_pressAction_ch5();
};
// Conference night: Long Island is dark outside until the chapter is over. Warm light spills from the doors.
const CH5_NIGHT_MAPS=['town','row','schoolyard'];
STORY_MAPFX.push(time=>{
  if(STORY.chapter!==5||flag('ch5-done')===true||!CH5_NIGHT_MAPS.includes(currentMap.id)) return;
  const M=currentMap,c=gfx;
  c.globalCompositeOperation='multiply'; rect(-T,-3*T,(M.w+2)*T,(M.h+4)*T,'#5a64a8'); c.globalCompositeOperation='source-over';
  const glow=(x,y,r,a)=>{ const g=c.createRadialGradient(x,y,2,x,y,r); g.addColorStop(0,'rgba(255,214,140,'+a+')'); g.addColorStop(1,'rgba(255,214,140,0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); };
  c.globalCompositeOperation='lighter';
  for(const h of M.houses||[]) if(h.door) glow((h.door.x+.5)*T,(h.door.y+.6)*T,T*2.2,.28);
  if(M.id==='town') glow(12.5*T,11.5*T,T*2.5,.18);
  if(M.id==='schoolyard') { glow(12*T,2*T,T*3.2,.34); glow(5*T,13*T,T*2,.12); }
  const p=position(player); glow((p.x+.5)*T,(p.y+.5)*T,T*2.6,.14);
  c.globalCompositeOperation='source-over';
  for(let k=0;k<14;k++) { const n=hash(k,55); if((Math.floor(time*1.5)+k)%7===0) continue; rect(n%(M.w*T),(n>>>9)%(3*T),2,2,'#fff6c0'); }
});

// Tips for the chapter 5 story fights and The Red Pen.
TUTORIALS.ch5bell={
  setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
  tips:[
    {id:'pep',who:'amy',dir:'right',text:'Amy’s PEP TALK (▶): everyone else’s next attack or heal is +50%. School monsters love a pep talk, too (lots of Warmth).'},
    {id:'tardy',who:'*',when:()=>b2LiveParty().some(p=>p.st.tardy),text:'Tardy: PEP -35%, so that person acts later on the turn ribbon. It wears off in a turn or two.'},
    {id:'tombo',who:['tom','amy'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='amy1'&&!r.why),text:'◀ TOMBO: I Called It! Tom and Amy fight over the same monster, bump every enemy, and the party speeds up.'}]};
TUTORIALS.ch5glue={tips:[
  {id:'inspect',who:'*',text:'Glitter Glue shrugs off Sparkle. Splash and Kinetic work. B Inspects it.'},
  {id:'glued',who:'grace',dir:'up',when:()=>b2LiveParty().some(p=>p.st.glued),text:'Someone is Glued (PEP down). Grace’s Squishy Squeeze (▲ Skills) heals them and unsticks it.'}]};
TUTORIALS.ch5dodge={tips:[
  {id:'pace',who:'amy',text:'See PACE on Amy’s card? Pace Setter: every turn Amy acts, the whole party gets a little faster. Keep her moving.'},
  {id:'dodge',who:'*',text:'The Dread dodges a lot of single hits. Hits on everyone never miss, like the Tombo I Called It!'}]};
TUTORIALS.redpen={tips:[
  {id:'seeme',who:'tom',dir:'right',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='lock'&&b2Alive(f.intent.target)&&f.intent.target.id!=='tom'&&!f.intent.target.st.guarded),
    text:'SEE ME is coming (the red LOCK). ▶ DEFEND, then whoever it\'s after: Tom takes the mark instead.'},
  {id:'marked',who:'grace',dir:'up',when:()=>b2LiveParty().some(p=>p.st.seeme),text:'Someone is marked SEE ME: double damage, and the pen keeps going after them. Grace’s Squishy Squeeze (▲ Skills) clears it.'},
  {id:'praise',who:'*',dir:'down',care:1,text:'It grades everyone, and nobody ever grades it back. ▼ Bag, NICE HANDWRITING. Three times and it gives up happy.'},
  {id:'final',who:'amy',dir:'up',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&u.kit.skills.some(s=>['quiz','eyes_up_front','inside_voices','false_start'].includes(s.key)),text:'FINAL GRADE on everyone next turn! Amy’s Eyes Up Front or False Start (▲ Skills) breaks the wind-up outright.'},
  {id:'final2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'FINAL GRADE is coming. Break its guard: 2 Splash or Sparkle hits, or any Tombo.'}]};

// Away: map npcs with `away` (a list of story conditions, data/maps-*.js) leave their map while any condition matches,
// and come back when none do (Justin at work during chapter 5; Olivia and Michael on their desert trip).
const AWAY_NPCS=[];
for(const id in worlds) for(const n of worlds[id].npcs) if(n.away) AWAY_NPCS.push({map:worlds[id],n});
function syncAwayNpcs() {
  for(const {map,n} of AWAY_NPCS) {
    const gone=n.away.some(storyMatch),has=map.npcs.includes(n);
    if(gone&&has) { map.npcs.splice(map.npcs.indexOf(n),1); n.move=null; n.path=[]; }
    else if(!gone&&!has) map.npcs.push(n);
  }
}
STORY_WORLD.push(syncAwayNpcs);
syncAwayNpcs(); // once at load too, so a visitor's second copy (Aunt Ellie at the Rivituso house) never shows outside the story

// ======================================================================================================
// CHAPTER 6: The Great Squirrel Conspiracy. Sal flies Tom to LA (storyTripSteps sets chapter 6). Bready Mercury, Tom's
// sourdough starter, has been stolen, and things are missing all over 2nd Ave. Party: Tom, TNB (locked in by the scene),
// Nara. The squirrels' crew works out of the Old Oak in Old Oak Park (south end of 2nd Ave).
// Flags, in story order: ch6-sal (Sal's line), ch6-goal (the text), ch6-tnb (Tom's kitchen, heart-kiss; TNB joins),
// ch6-nara (2nd Ave; Nara joins), ch6-park (Bernadette's briefing; the park wakes up), ch6-play (Peanut Gallery),
// ch6-garden (Twig Spy), ch6-picnic (Cheek Stuffer), ch6-dig-play, ch6-dig-garden, ch6-dig-picnic (Nara digs each cache:
// a lost thing and a scrap of the knock), ch6-scraps (all three), ch6-fetch (optional: the dog park, Heart-Trace),
// ch6-door (the secret knock), ch6-oak, ch6-board (the corkboard), ch6-ladder (Nara rides the bucket), ch6-boss,
// battle:chairman ('win'), ch6-clear (Bready Mercury is back, with a gold coin), ch6-wrap (the Chairman leaves), ch6-done.
// ======================================================================================================
const CH6={mode:'full',chapter:6};
const CH6_CACHES=[
  {c:'play',fight:'ch6-play',place:'the sandbox',item:'eleven tennis balls',who:'Marisol',acorns:2,knock:'SCRATCH'},
  {c:'garden',fight:'ch6-garden',place:'the garden',item:'a pair of reading glasses',who:'Mr. Washington',acorns:1,knock:'TAP TAP'},
  {c:'picnic',fight:'ch6-picnic',place:'the picnic tables',item:'a little yellow toy truck',who:'Lachlan',acorns:3,knock:'CHITTER'}];
const CH6_KNOCK=['TAP TAP','SCRATCH','CHITTER'];
const ch6Dug=c=>typeof flag==='function'&&!!flag('ch6-dig-'+c);
const ch6CanDig=c=>{ const C=CH6_CACHES.find(k=>k.c===c); return !!C&&STORY.mode==='full'&&STORY.chapter===6&&flag(C.fight)===true&&!ch6Dug(c); };
const CH6_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'TNB',lines:['Okay. Shake it off. Everybody gets a snack and a hug. In that order.']}],else:[]},
  ...lines
];

// 1. Downtown, right off the plane: a text from TNB.
SCENES.ch6Arrive=[
  {flag:'ch6-goal'},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Tom',lines:['A text from TNB.','"Babe. Come home. Your house. NOW. It\'s about Bready Mercury."','"Also there are acorns in the flour."']},
  {talk:'Tom',lines:['He has a key. I gave him a key for exactly this kind of emergency.','I didn\'t picture acorns.']},
  {toast:'Goal: Tom’s house (3468) in Jefferson Park, south of Downtown.',time:4.5}
];
// 2. Tom's kitchen: the jar is gone. The heart-kiss. TNB joins.
SCENES.ch6Kitchen=[
  {flag:'ch6-tnb'},
  {join:'tnb',quiet:true}, {hide:'tnb'},
  {walk:'tom',to:routeTo('tom',8,8),speed:.2}, {face:'tom',dir:'left'},
  {place:'tnb',at:[7,8],dir:'right'}, {show:'tnb'},
  {talk:'TNB',lines:['Well, well, well...'],voice:[['tnb','greet',0,'Well, well, well...']]},
  ch4Kiss(),
  {talk:'TNB',lines:['Okay. Hi. Missed you. Don\'t panic. Look at the island.']},
  {face:'tom',dir:'right'},
  {talk:'Tom',lines:['...Where\'s Bready Mercury.']},
  {talk:'TNB',lines:['That\'s the thing. I came over to feed him, like you asked. The jar was gone. The window was open.','And there were tiny footprints in the flour. Four toes in front, five in back. I looked it up.']},
  {talk:'Tom',lines:['Bready Mercury is nine years old. He has flown Delta One. Twice.']},
  {talk:'TNB',lines:['I know, babe. I\'ve seen every horror movie ever made. This is exactly how they start.','And this was on the windowsill. An acorn. With a tiny X carved in it.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['Somebody took my starter. And left a calling card.','That was UNCALLED for!'],voice:[['tom','hurt',1,'That was UNCALLED for!']]},
  {trace:'tnb-hello6'}, {hearts:'tom'},
  {talk:'TNB',lines:['Olivia texted me too. Nara hasn\'t slept in three days. She just stands at the window and growls at trees.']},
  {talk:'Tom',lines:['Nara is scared of the vacuum. Nara doesn\'t growl at trees.']},
  {talk:'TNB',lines:['Exactly. Something is going on out there.']},
  {party:{lock:['tom','tnb']}},
  {flag:'tombo:tnb2'},   // Red Line Transfer unlocks here (chapter 6)
  {toast:'New Tombo: Red Line Transfer (Tom + TNB). 50% HEART.',time:3.2},
  {toast:'Goal: out to 2nd Ave. Find Olivia, Michael and Nara.',time:4.5}
];
// 3. 2nd Ave: Olivia hands over Nara. The whole block is missing things.
SCENES.ch6Nara=[
  {flag:'ch6-nara'},
  {call:()=>{ sfx.bark&&sfx.bark(); sfx.bark&&sfx.bark(.2); }},
  {walk:'Olivia',to:routeBeside('Olivia'),speed:.2},
  {talk:'Olivia',lines:['Tom! Oh, thank goodness. Can you take her? Please? She hasn\'t slept since Sunday.']},
  {walk:'Nara',to:routeBeside('Nara'),speed:.1},
  {talk:'Nara',lines:['Nara does three laps around Tom, slams into his shins, and leans on him with all forty pounds.','Then she spins around and growls at the jacaranda.']},
  {hearts:'tom'},
  {talk:'Olivia',lines:['That. All night. And it\'s not just us. Lachlan’s toy truck is gone. Mr. Washington’s reading glasses. Marisol says every tennis ball on the block.']},
  {talk:'Michael',lines:['I found my car keys in the gutter. With three peanuts. Arranged in a triangle.']},
  {talk:'TNB',lines:['A triangle. Babe. A triangle is a SYMBOL.']},
  {talk:'Tom',lines:['TNB has seen a lot of movies.','...He\'s usually right about this stuff.']},
  {talk:'Olivia',lines:['Bernadette from the Neighborhood Watch says it\'s squirrels. She has a clipboard about it. She\'s in Old Oak Park, at the south end of 2nd Ave.']},
  {join:'nara'},
  {talk:'Tom',lines:['Nara. Want to go for a walk?']},
  {talk:'Nara',lines:['Nara knows the word WALK. She\'s always known the word walk. She\'s already at the end of the street.']},
  {talk:'Olivia',lines:['Bring her back tired! Please! Michael, can you grab Isla? She\'s licking the mailbox.']},
  {flag:'tombo:nara2'},   // Tug of War unlocks here (chapter 6)
  {toast:'New Tombo: Tug of War (Tom + Nara). 50% HEART.',time:3.2},
  {toast:'Goal: Old Oak Park, through the south end of 2nd Ave.',time:4.5}
];
// 4. Old Oak Park: Bernadette's briefing. Three lookouts, three fresh holes, one tree.
SCENES.ch6Park=[
  {flag:'ch6-park',value:'pending'},
  {walk:'Bernadette',to:routeBeside('Bernadette'),speed:.2},
  {talk:'Bernadette',lines:['Halt. Neighborhood Watch. State your business.']},
  {talk:'Tom',lines:['Tom. 3468. I\'ve lived on 2nd Ave for six years.']},
  {talk:'Bernadette',lines:['I know who you are. You water your drought garden. Everybody knows.',
    'Bernadette. Neighborhood Watch Captain, nineteen years. And I\'ll say it, because nobody else will.','The squirrels are organized.']},
  {talk:'TNB',lines:['I KNEW it.']},
  {talk:'Bernadette',lines:['Lookouts in the playground. A spy in the community garden. Somebody at the picnic tables stuffing their cheeks with anything that\'s not nailed down.',
    'And it all goes up THAT tree. The Old Oak. There\'s a little door in the trunk. I\'ve heard a secret knock. Only bits of it.']},
  {call:()=>sfx.bark&&sfx.bark()},
  {talk:'Nara',lines:['Nara puts her nose to the grass and pulls. Hard. Left. Right. Back. Three fresh holes, three different directions.']},
  {talk:'Tom',lines:['They buried something. Three somethings.']},
  {talk:'Bernadette',lines:['Clear out those lookouts and your dog can dig. I\'ll be here. With my clipboard.']},
  {talk:'TNB',lines:['Babe, she has a corkboard with red string. I\'ve never felt so seen.']},
  {flag:'ch6-park'},
  {toast:'Goal: clear the playground (top left), the garden (top right) and the picnic tables (bottom left). Then let Nara dig.',time:5.5},
  {toast:'Tip: the dog park (bottom right) has a bench. Nara looks very hopeful.',time:4}
];
// 5. The three lookouts.
SCENES.ch6Gallery=[
  {flag:'ch6-play',value:'pending'},
  {walk:'Peanut Gallery',to:routeBeside('Peanut Gallery'),speed:.25},
  {talk:'Peanut Gallery',lines:['BOO! BOOOO! Get off the stage! This is OUR playground!']},
  {talk:'TNB',lines:['Is it heckling us? From inside a peanut?']},
  {talk:'Peanut Gallery',lines:['Your shoes are untied! Made you look! BOOOO!']},
  {talk:'Tom',lines:['My shoes don\'t have laces.']},
  {battle:'peanutgallery',tut:'ch6gallery'},
  ...CH6_AFTER(()=>flag('battle:peanutgallery')!=='win',[
    {flag:'ch6-play'},
    {talk:'TNB',lines:['The playground is clear. And Nara is staring at the sandbox like it owes her money.']},
    {toast:'Nara can dig in the sandbox now (the fresh dirt, by the climbing dome).',time:4}])
];
SCENES.ch6Spy=[
  {flag:'ch6-garden',value:'pending'},
  {walk:'Twig Spy',to:routeBeside('Twig Spy'),speed:.3},
  {talk:'Twig Spy',lines:['...You didn\'t see me. I\'m a stick. Sticks don\'t talk.']},
  {talk:'TNB',lines:['That stick has binoculars.']},
  {talk:'Twig Spy',lines:['Standard issue. Code name: Twig. I report to the Chairman. Pretend I said nothing.']},
  {talk:'Tom',lines:['The Chairman.']},
  {talk:'Twig Spy',lines:['I said NOTHING.']},
  {battle:'twigspy',tut:'ch6spy'},
  ...CH6_AFTER(()=>flag('battle:twigspy')!=='win',[
    {flag:'ch6-garden'},
    {talk:'Tom',lines:['The garden is clear. Every tomato has exactly one bite out of it. That\'s a policy.']},
    {toast:'Nara can dig in the garden now (the fresh dirt, between the beds).',time:4}])
];
SCENES.ch6Stuffer=[
  {flag:'ch6-picnic',value:'pending'},
  {walk:'Cheek Stuffer',to:routeBeside('Cheek Stuffer'),speed:.35},
  {talk:'Cheek Stuffer',lines:['Mmmf. Mmmf mmf! (These are MY sandwiches.)']},
  {talk:'Tom',lines:['Those are somebody’s sandwiches. Somebody’s whole birthday picnic.']},
  {talk:'Cheek Stuffer',lines:['Mmf. (Winter is coming. Winter is ALWAYS coming.)']},
  {talk:'TNB',lines:['Buddy. It\'s Los Angeles. It\'s seventy-four degrees.']},
  {battle:'cheekstuffer',tut:'ch6stuffer'},
  ...CH6_AFTER(()=>flag('battle:cheekstuffer')!=='win',[
    {flag:'ch6-picnic'},
    {talk:'TNB',lines:['The picnic is clear. The cake survived. The cake is a hero.']},
    {toast:'Nara can dig at the picnic tables now (the fresh dirt, under the last table).',time:4}])
];
// 6. Nara digs up a cache: a lost thing from 2nd Ave, and a scrap of the secret knock (data in CH6_CACHES).
const ch6DigScene=C=>[
  {flag:'ch6-dig-'+C.c},
  {call:()=>{ sfx.bark&&sfx.bark(); sfx.run&&sfx.run(); }},
  {talk:'Nara',lines:['Nara digs. Dirt goes everywhere. Mostly on TNB.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:[cap(C.item)+'. Those are '+C.who+'’s.']},
  ...(C.c==='garden'?[
    {talk:'Tom',lines:['Mr. Washington reads the paper on his porch every morning. He\'s been reading the same headline for three days.']},
    {talk:'TNB',lines:['We bring them back today. Personally. With a pastry.']},
    {trace:'washington-glasses'}, {hearts:'nara'}]:[]),
  {talk:'TNB',lines:['And there\'s a scrap of paper in here. A drawing of '+['','one acorn','two acorns','three acorns'][C.acorns]+'. And one word: '+C.knock+'.']},
  {call:()=>sfx.levelChime()},
  {toast:'Knock scrap: '+['','one acorn','two acorns','three acorns'][C.acorns]+', '+C.knock+'.',time:4},
  {if:()=>CH6_CACHES.every(k=>ch6Dug(k.c)),then:[
    {flag:'ch6-scraps'}, {wait:4.2},
    {talk:'TNB',lines:['That\'s all three scraps. One acorn, two acorns, three acorns. It\'s a sequence, babe. It\'s ALWAYS a sequence.']},
    {talk:'Tom',lines:['One acorn: TAP TAP. Two acorns: SCRATCH. Three acorns: CHITTER.']},
    {toast:'Goal: the little door in the Old Oak (top of the park). Knock the way the scraps say.',time:5}],else:[]}
];
for(const C of CH6_CACHES) SCENES['ch6Dig_'+C.c]=ch6DigScene(C);
// 7. Optional: the dog park. What will Nara fetch? (data in ch6Throw below).
SCENES.ch6Fetch=[
  {flag:'ch6-fetch'},
  {talk:'Tom',lines:['Tom always keeps a heel of sourdough in his jacket. For emergencies. This is an emergency.']},
  {call:()=>sfx.whoosh()},
  {talk:'Nara',lines:['Nara catches it in midair. She runs one lap. Two laps. Six laps. She lies down on Tom’s feet and eats it very, very slowly.']},
  {call:()=>{ sfx.bark&&sfx.bark(); }},
  {hearts:'nara'}, {trace:'nara-dogpark'}, {call:()=>sfx.levelChime()},
  {talk:'TNB',lines:['She hasn\'t eaten in three days, and she just ate your emergency bread.']},
  {talk:'Tom',lines:['She\'ll only eat bread if I throw it. Still true. Still very picky. Still very athletic.']},
  {heal:true},
  {toast:'Everyone is healed. Nara is very, very proud of herself.',time:3.5}
];
// 8. The secret knock works: the little door opens.
SCENES.ch6Door=[
  {flag:'ch6-door'},
  {call:()=>{ sfx.thud(); }}, {wait:.6},
  {talk:'Little door',lines:['A pause. Then, from inside, a tiny voice: "Password accepted. Welcome, Agent..."','"...wait. You\'re very tall. Are you a squirrel?"']},
  {talk:'Tom',lines:['Yes.']},
  {talk:'Little door',lines:['Running footsteps. Very small ones. Going up.']},
  {call:()=>{ ch6OpenDoor(); storyWorld(); sfx.doorIn&&sfx.doorIn(); sfx.levelChime(); }},
  {talk:'TNB',lines:['Babe. You lied to a squirrel.']},
  {talk:'Tom',lines:['It lied to me first. It said it was an acorn.']},
  {toast:'Goal: inside the Old Oak.',time:4}
];
// 9. Inside the Old Oak.
SCENES.ch6Oak=[
  {flag:'ch6-oak'},
  {talk:'TNB',lines:['Babe. We\'re inside a tree. This is the second act of every horror movie I\'ve ever seen.']},
  {talk:'Tom',lines:['Then we stay together.']},
  {talk:'TNB',lines:['That\'s what they always say in the second act.']},
  {call:()=>sfx.bark&&sfx.bark()},
  {talk:'Nara',lines:['Nara sniffs the air, and her tail goes straight up. Bread. Far above. Very faint.']},
  {talk:'Tom',lines:['He\'s up there. And there\'s no ladder.']},
  {toast:'Goal: find a way up. The war room is on the left, the pantry on the right.',time:4.5}
];
// 10. The war room corkboard.
SCENES.ch6Board=[
  {flag:'ch6-board'},
  {talk:'TNB',lines:['Babe. Babe. They have a corkboard. With RED STRING. I\'ve waited my whole life for this.']},
  {talk:'Corkboard',lines:['Photos of 2nd Ave. A map with X’s on every porch. A drawing of Nara, labeled THREAT LEVEL: VERY HIGH.','In the middle, circled three times: Tom’s jar. Across the top: OPERATION BIG BREAD.']},
  {talk:'Tom',lines:['That\'s my house. That\'s my JAR. Why is my jar in the middle of everything?']},
  {talk:'TNB',lines:['Everything connects to the jar, babe. That\'s how corkboards work.']},
  {talk:'Corkboard',lines:['A note, pinned at the bottom: BY ORDER OF THE CHAIRMAN. WINTER IS COMING. HOARD EVERYTHING.','Another note: SUPPLY LINE. ROPE LADDER. SEE BUCKET (PANTRY).']},
  {talk:'Nara',lines:['Nara looks at the drawing of herself. She seems pleased with it.']},
  {toast:'Goal: the pantry (right). The bucket on the rope.',time:4.5}
];
// 11. The bucket: Nara is the counterweight. The rope ladder comes down.
SCENES.ch6Ladder=[
  {flag:'ch6-ladder'},
  {talk:'TNB',lines:['It\'s a counterweight. Put enough weight in the bucket and the ladder comes down. Classic pulley.']},
  {talk:'Tom',lines:['We need about forty pounds.']},
  {talk:'TNB',lines:['...']},
  {talk:'Tom',lines:['...']},
  {talk:'Tom',lines:['Nara. Sit. In the bucket.']},
  {talk:'Nara',lines:['Nara looks at the bucket. Nara looks at Tom. Nara gets in the bucket.','She\'d do anything for Tom. She makes very sure he knows it.']},
  {call:()=>{ sfx.thud(); sfx.whoosh(); }},
  {call:()=>{ ch6LowerLadder(); storyWorld(); }},
  {talk:'Inside the Old Oak',lines:['CREEEEAK. The bucket sinks. Across the trunk, a rope ladder unrolls down the middle, all the way to the floor.']},
  {talk:'Nara',lines:['Nara is out of the bucket before it stops moving. She leans on Tom with all forty pounds.']},
  {talk:'Tom',lines:['Very brave. Extremely brave. You\'ll be getting a lot of chicken.']},
  {trace:'nara-bucket'}, {hearts:'nara'},
  {toast:'Goal: up the rope ladder to the top of the Oak.',time:4.5}
];
// 12. The crown: Chairman Cheeks, on the hoard, with Bready Mercury on top. Boss fight.
SCENES.ch6Boss=[
  {flag:'ch6-boss'}, {call:()=>storyWorld()},
  {hide:'Chairman Cheeks'},
  {walk:'tom',to:routeTo('tom',9,7),speed:.25}, {face:'tom',dir:'up'},
  {place:'tnb',at:[8,7],dir:'up'}, {place:'nara',at:[10,7],dir:'up'},
  {talk:'TNB',lines:['Babe. Look. On top of the pile.']},
  {talk:'Tom',lines:['BREADY MERCURY!']},
  {call:()=>{ sfx.thud(); sfx.whoosh(); }},
  {show:'Chairman Cheeks'}, {face:'Chairman Cheeks',dir:'down'},
  {talk:'Chairman Cheeks',lines:['ORDER. ORDER! Who let a DOG into the Oak?',
    'I\'m the Chairman. Chairman Cheeks. Every acorn, every peanut, every shiny thing on 2nd Avenue comes up this tree. Because winter is coming.']},
  {talk:'Tom',lines:['It\'s Los Angeles. Winter is a light jacket.']},
  {talk:'Chairman Cheeks',lines:['That\'s what they WANT you to think.',
    'And this jar. This jar smells like bread FOREVER. You feed it and it grows. It never runs out. It\'s the perfect hoard.']},
  {talk:'Tom',lines:['That\'s Bready Mercury. He\'s nine. You feed him flour and water, and then you SHARE the bread. That\'s the whole point of him.']},
  {talk:'Chairman Cheeks',lines:['Share? ...Nobody shares. Not with a squirrel. Twenty years, and every bird feeder on the block has chased me off it.']},
  {talk:'Nara',lines:['Nara growls. A very small growl. Very serious. She\'s waited three days for this.']},
  {talk:'TNB',lines:['It\'s a squirrel in a tiny tie, babe. I\'m so scared and so delighted.']},
  {talk:'Tom',lines:['Put the starter down. No touching, please.']},
  {battle:'chairman',tut:'chairman'},
  {if:()=>flag('battle:chairman')!=='win',then:[
    {heal:true},
    {talk:'TNB',lines:['Okay. Shake it off. Everybody gets a snack.','Babe, when it buries an acorn, break it before it eats it. Nara digs them up for double. And maybe... share something with it. Three times.']},
    {toast:'Face Chairman Cheeks and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 13. After the boss (won in the scene, or on a retry with A): Bready Mercury comes home, with a gold coin.
SCENES.ch6AfterBoss=()=>[
  {flag:'ch6-clear'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  ...(flag('kind:chairman')?[
    {talk:'Chairman Cheeks',lines:['...Shared. You shared with me. Three times. Nobody has ever... I\'m going to need a minute.','Take the jar. And... could I maybe have a slice? Sometimes?']},
    {talk:'Tom',lines:['Saturdays. On my back fence. One slice. The heel.']},
    {talk:'Chairman Cheeks',lines:['The heel is the best part.']}]:[
    {talk:'Chairman Cheeks',lines:['Fine. FINE. This meeting is adjourned. I\'m going to go stare at a bird feeder.']}]),
  {call:()=>{ setFlag('ch6-wrap'); storyWorld(); sfx.whoosh(); }},
  {talk:'The hoard',lines:['Chairman Cheeks hops off the hoard, straightens its tie, and scampers down the far side of the Oak.']},
  {give:'bready'},
  {talk:'Tom',lines:['Hello, Bready Mercury. Did you miss me? You were on an adventure.','You\'re going to be extremely sour about this.']},
  {talk:'TNB',lines:['Was that a pun? Babe. Did you just make a PUN?']},
  {talk:'Tom',lines:['He\'s a starter. Sour is a compliment.']},
  {talk:'TNB',lines:['And look. Something taped to the lid. A gold coin. With a little clock face.']},
  {talk:'Tom',lines:['Squirrels hoard shiny things. Squirrels don\'t tape things. Look at those corners.','The sundial. The steamer. The sign-up sheet. Now my jar. Somebody keeps leaving these where we\'ll find them.']},
  {talk:'TNB',lines:['Somebody in a long coat, if your niece and your kettle are right. Spooky. I love it. I hate it.']},
  {toast:'Goal: take Bready Mercury home to 2nd Ave. Everybody is waiting.',time:4.5}
];
// 14. 2nd Ave: everything comes back. Rewards. Chapter complete.
SCENES.ch6End=[
  {flag:'ch6-done',value:'pending'},
  {walk:'tom',to:routeTo('tom',12,20),speed:.2}, {face:'tom',dir:'up'},
  {place:'Olivia',at:[11,19],dir:'down'}, {place:'Michael',at:[13,19],dir:'down'},
  {place:'tnb',at:[11,20],dir:'up'}, {place:'nara',at:[13,20],dir:'up'},
  {spawn:{name:'Bernadette',look:'bernadette',at:[10,19],dir:'right'}},
  {talk:'Olivia',lines:['Tom! You found everything! Marisol’s balls, Mr. Washington’s glasses, Lachlan’s truck. He hasn\'t put it down. He\'s eating cereal with one hand.']},
  {talk:'Bernadette',lines:['Neighborhood Watch Captain’s report: case closed.','I\'d like it noted that I was right.']},
  {talk:'TNB',lines:['Noted. On a corkboard. With red string.']},
  {talk:'Michael',lines:['Lachlan wants Nara to have this. He painted a tennis ball gold. It took him four days and most of a bottle of paint.']},
  {give:'y_goldball'},
  {toast:'Nara gets a new Signature Tool: the Golden Tennis Ball (POW +6, WARMTH +4). Equip it in the menu.',time:4.5},
  {talk:'Nara',lines:['Nara takes it very gently. She\'ll never let go of it again. She\'s going to sleep for twelve hours, holding it.']},
  {talk:'Bernadette',lines:['And these. Neighborhood Watch Vests. I give out one every nineteen years. Today I\'m giving out three. Even the dog.']},
  {give:'watchvest'},
  {toast:'New outfit: the Neighborhood Watch Vest. Reflective orange. Anyone can wear it.',time:4},
  {despawn:'Bernadette'},
  {talk:'TNB',lines:['You know what today was, babe? Absolutely nuts.']},
  {talk:'Tom',lines:['...That\'s not a pun. That\'s just a word.']},
  {talk:'TNB',lines:['It\'s a word with a pun in its heart.']},
  ch4Kiss(),
  {talk:'Tom',lines:['Fine. It was nuts.']},
  {trace:'ch6-wrap'}, {hearts:'tom'},
  {call:()=>{ sfx.ding&&sfx.ding(); }},
  {talk:'Tom',lines:['A text from Grace. "TATA. The library is WHISPERING. Like actually. Page says it\'s fine. It\'s NOT fine. Come home."']},
  {talk:'TNB',lines:['The library is whispering. Is that not just... its job?']},
  {talk:'Tom',lines:['Not on Long Island. On Long Island, the library shushes YOU.']},
  {party:null},
  {fade:'out',time:.8}, {card:6,done:true,time:3.4}, {flag:'ch6-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'Chapter 6 complete! When you\'re ready, Sol at Angel City Cab Co. flies you home for chapter 7.',time:6}
];
TRIGGERS.push(
  {id:'ch6-arrive',map:'blvd',when:{...CH6,notFlag:'ch6-goal'},scene:'ch6Arrive'},
  {id:'ch6-kitchen',map:'tomhouse',when:{...CH6,flag:'ch6-goal',notFlag:'ch6-tnb'},scene:'ch6Kitchen'},
  {id:'ch6-nara',map:'jpark',when:{...CH6,flag:'ch6-tnb',notFlag:'ch6-nara',test:()=>!inParty(nara)},scene:'ch6Nara'},
  {id:'ch6-park',map:'oakpark',when:{...CH6,flag:'ch6-nara',notFlag:'ch6-park',test:()=>inParty(nara)},scene:'ch6Park'},
  {id:'ch6-play',map:'oakpark',at:[1,4,10,10],when:{...CH6,flag:'ch6-park',notFlag:'ch6-play'},scene:'ch6Gallery'},
  {id:'ch6-garden',map:'oakpark',at:[15,4,24,10],when:{...CH6,flag:'ch6-park',notFlag:'ch6-garden'},scene:'ch6Spy'},
  {id:'ch6-picnic',map:'oakpark',at:[1,13,10,20],when:{...CH6,flag:'ch6-park',notFlag:'ch6-picnic'},scene:'ch6Stuffer'},
  {id:'ch6-oak',map:'oak',when:{...CH6,flag:'ch6-door',notFlag:'ch6-oak'},scene:'ch6Oak'},
  {id:'ch6-boss',map:'crown',when:{...CH6,flag:'ch6-ladder',notFlag:'ch6-boss'},scene:'ch6Boss'},
  {id:'ch6-after',map:'crown',when:{...CH6,flag:{'battle:chairman':'win'},notFlag:'ch6-clear'},scene:'ch6AfterBoss'},
  {id:'ch6-end',map:'jpark',when:{...CH6,flag:'ch6-clear',notFlag:'ch6-done'},scene:'ch6End'}
);
// The park holds still until Bernadette's briefing; each lookout holds still until its story fight.
const CH6_LOOKOUT_FLAG={peanutgallery:'ch6-play',twigspy:'ch6-garden',cheekstuffer:'ch6-picnic'};
HOLD_RULES.push(n=>STORY.chapter===6&&currentMap.id==='oakpark'&&(flag('ch6-park')!==true||(CH6_LOOKOUT_FLAG[n.monster]&&flag(CH6_LOOKOUT_FLAG[n.monster])!==true)));

// Map changes. They check flags (not events), so they also hold after loading a save.
// The little door in the Old Oak (row 4) comes off once the secret knock works.
function ch6OpenDoor() {
  const M=worlds.oakpark; if(!M||M.doorOpen) return;
  const o=M.objects.find(o=>o.kind==='oakdoor');
  if(o) { M.objects.splice(M.objects.indexOf(o),1); for(const x of [12,13]) M.objectAt.delete(key(x,4)); }
  for(const x of [12,13]) tile(M,x,4,'path');
  M.doorOpen=true; M.mini=null;
}
// The rope ladder up the middle of the Old Oak (the gap in column 12, rows 2, 4 and 5, between the top bridge, the middle bridge and the
// war room bridge; the `ladder` cells in the oak spec) comes down once Nara rides the bucket. It is drawn live over the painting (below).
function ch6LowerLadder() {
  const M=worlds.oak; if(!M||M.ladderDown) return;
  for(const [x,y] of (M.spec&&M.spec.ladder)||[]) tile(M,x,y,'ladder');
  M.ladderDown=true; M.mini=null;
}
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  if(flag('ch6-door')||STORY.chapter>6) ch6OpenDoor();
  if(flag('ch6-ladder')||STORY.chapter>6) ch6LowerLadder();
  // Chairman Cheeks stays out of sight until the party climbs into the crown, and leaves after.
  const b=findMonster('chairman'); if(!b) return;
  b.mscale=1.5;
  const under=STORY.chapter<6||(STORY.chapter===6&&!flag('ch6-boss'))||!!flag('ch6-wrap');
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});

// Nara digs up a cache (a fresh dirt mound in the park).
function ch6Mound(o) {
  if(STORY.mode!=='full'||STORY.chapter!==6||!flag('ch6-park')) return false;
  const C=CH6_CACHES.find(k=>k.c===o.dig); if(!C) return false;
  if(ch6Dug(C.c)) { openDialog(o.name,['A hole. Nara is very proud of it. She checks on it every time she walks past.']); return true; }
  if(!inParty(nara)) { openDialog(o.name,['Fresh dirt. Somebody with a better nose should dig here.']); return true; }
  if(flag(C.fight)!==true) { openDialog('TNB',['Nara wants to dig, babe. But that thing in '+C.place+' is watching us. Lookouts first.']); return true; }
  playScene('ch6Dig_'+C.c); return true;
}
// The secret knock: three knocks in a row, in the order of the acorns on the scraps (one, two, three).
const CH6_KNOCKS=['TAP TAP','SCRATCH','CHITTER','LET NARA BARK'];
function ch6Knock(o) {
  if(STORY.mode!=='full'||STORY.chapter!==6||flag('ch6-door')) return false;
  if(!flag('ch6-scraps')) {
    const n=CH6_CACHES.filter(k=>ch6Dug(k.c)).length;
    openDialog(o.name,['A little round door with an acorn for a knocker. Somebody behind it\'s chittering.',
      'TNB: "We need the whole knock, babe. '+(n?'We have '+n+' of 3 scraps.':'Bernadette said the lookouts know it. Nara can dig up the rest.')+'"']);
    return true;
  }
  const seq=[];
  const ask=()=>openChoice('Little door',[seq.length?'Knock '+(seq.length+1)+' of 3. (So far: '+seq.join(', ')+'.)':'Tom lifts the acorn knocker. Knock 1 of 3.'],
    CH6_KNOCKS.map(k=>({label:k,fn:()=>{
      if(k==='LET NARA BARK') { sfx.bark&&sfx.bark(); openDialog('Little door',['WOOF!','From inside, a tiny voice: "Was that a DOG? Nobody open the door! NOBODY!"','TNB: "Okay. That was on us."']); return; }
      seq.push(k); sfx.bonk&&sfx.bonk();
      if(seq.length<3) { ask(); return; }
      if(seq.join('|')===CH6_KNOCK.join('|')) { playScene('ch6Door'); return; }
      sfx.nope&&sfx.nope();
      openDialog('Little door',['Silence. Then, from inside: "Wrong knock. Go away."',
        'TNB: "'+pick(['One acorn first. Then two. Then three. Count the acorns, babe.','The scraps have acorns on them. One, two, three. That\'s the order.','Wrong order. The acorns tell us the order.'])+'"']);
    }})));
  ask(); return true;
}
// The dog park: throw something for Nara (Heart-Trace).
const CH6_THROWS=[
  {label:'A STICK',no:'Nara watches the stick fly. She looks at Tom. She doesn\'t do sticks. She\'s never done sticks.'},
  {label:'A TENNIS BALL',no:'Nara brings a ball back. It\'s not that ball. It\'s a different dog’s ball. The different dog is very upset.'},
  {label:'TOM’S SHOE',no:'TNB: "Babe. No." Tom puts his shoe back on.'},
  {label:'A HEEL OF SOURDOUGH',ok:true}];
function ch6Throw(o) {
  if(STORY.mode!=='full'||STORY.chapter!==6||!inParty(nara)||!flag('ch6-park')||flag('ch6-fetch')) return false;
  openChoice('Dog park',['A whole dog park, and Nara hasn\'t played in three days. She sits. She stares at Tom.','What does Tom throw?'],
    CH6_THROWS.map(t=>({label:t.label,fn:()=>{ if(t.ok) playScene('ch6Fetch'); else { sfx.nope&&sfx.nope(); openDialog('Nara',[t.no]); } }})));
  return true;
}
// The war room corkboard and the pantry bucket.
function ch6Board(o) {
  if(STORY.mode!=='full'||STORY.chapter!==6||flag('ch6-board')) return false;
  playScene('ch6Board'); return true;
}
function ch6Bucket(o) {
  if(STORY.mode!=='full'||STORY.chapter!==6||flag('ch6-ladder')) return false;
  if(!flag('ch6-board')) { openDialog(o.name,['A bucket on a rope. The rope runs up over a branch and across to the middle of the trunk.','TNB: "Supply line of some kind. I bet the war room knows."']); return true; }
  if(!inParty(nara)) { openDialog(o.name,['It needs about forty pounds in it. Nobody here weighs forty pounds.']); return true; }
  playScene('ch6Ladder'); return true;
}
const LE_pressAction_ch6=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object') {
      if(v.dig&&ch6Mound(v)) return;
      if(v.knock&&ch6Knock(v)) return;
      if(v.dogpark&&ch6Throw(v)) return;
      if(v.warboard&&ch6Board(v)) return;
      if(v.bucket&&ch6Bucket(v)) return;
    }
  }
  return LE_pressAction_ch6();
};
// The Old Oak is painted and lit by its own lanterns, so the dark is a soft pool around Tom, not a blackout. Once Nara has lowered the
// ladder it is drawn live over the painting: a rope ladder from the top bridge down to the war room bridge, swaying a little.
STORY_MAPFX.push(time=>{
  const M=currentMap; if(M.id!=='oak') return;
  const p=position(player),px=(p.x+.5)*T,py=(p.y+.5)*T,c=gfx;
  const g=c.createRadialGradient(px,py,T*3,px,py,T*9); g.addColorStop(0,'rgba(20,12,6,0)'); g.addColorStop(1,'rgba(20,12,6,.32)');
  c.fillStyle=g; c.fillRect(0,0,M.w*T,M.h*T);
  if(!M.ladderDown) return;
  const cx=12.5*T,half=.3*T,top=1.75*T,bot=6.3*T,sway=Math.sin(time*1.3)*.04*T;
  // This draws over the actors, so it fades out where the party is climbing, otherwise the rungs would hide them.
  const climbers=[player,...followers].map(a=>position(a)).filter(q=>Math.abs(q.x-12)<.7).map(q=>[(q.y+1)*T-1.7*T,(q.y+1)*T+2]);
  const fade=y=>climbers.some(([a,b])=>y>=a&&y<=b)?.12:1;
  for(const s of [-1,1]) for(let y=top;y<bot;y+=4) { gfx.globalAlpha=fade(y); rect(cx+s*half-1+sway*.4,y,4,4,'#2b1d12'); rect(cx+s*half+sway*.4,y,2,4,'#d9bd8a'); }
  for(let y=top+.12*T;y<bot-.05*T;y+=.26*T) { const sw=sway*(1-(y-top)/(bot-top)*.6); gfx.globalAlpha=fade(y); rect(cx-half+sw*.4,y,half*2+2,4,'#2b1d12'); rect(cx-half+sw*.4,y+1,half*2+2,2,'#b98a52'); }
  gfx.globalAlpha=1;
  rect(cx-half-3,top-3,half*2+8,6,'#2b1d12'); rect(cx-half-2,top-2,half*2+6,3,'#8a8f98');   // the hooks on the top bridge
});

// Tips for the chapter 6 story fights and Chairman Cheeks.
TUTORIALS.ch6gallery={
  setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
  tips:[
    {id:'heckled',who:'*',when:()=>b2LiveParty().some(p=>p.st.heckled),text:'Heckled: WARMTH -30%, so kind moves and heals go weaker. It wears off in a turn or two.'},
    {id:'weak',who:'*',text:'The Peanut Gallery is weak to Chatter and Cozy, and shrugs off Kinetic. TNB’s Jump Scare is Chatter. B Inspects it.'},
    {id:'tombo',who:['tom','tnb'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='tnb1'&&!r.why),text:'◀ TOMBO: Popcorn Jump. Cozy, on every enemy.'}]};
TUTORIALS.ch6spy={tips:[
  {id:'dodge',who:'*',text:'The Twig Spy dodges a lot of single hits. Hits on everyone never miss, like Popcorn Jump.'},
  {id:'spotted',who:'*',when:()=>b2LiveParty().some(p=>p.st.spotted),text:'Spotted: that person takes 35% more damage for a while. Tom can DEFEND them (▶).'}]};
TUTORIALS.ch6stuffer={tips:[
  {id:'vp',who:'*',text:'The Cheek Stuffer is tough and steals VP. Splash and Chatter work; it shrugs off Kinetic. Tom’s Starter Splash is Splash.'},
  {id:'kind',who:'nara',dir:'up',text:'Squirrel crews love Nara’s Human Eyes and TNB’s moves. A full Warmth bar sends it home happy.'}]};
TUTORIALS.chairman={tips:[
  {id:'cache',who:'nara',when:()=>B2.foes.some(f=>f.D.inert&&b2Alive(f)),text:'An Acorn Cache! Nara digs it up for DOUBLE damage. Break it before the Chairman eats it and heals.'},
  {id:'cache2',who:'*',when:()=>B2.foes.some(f=>f.D.inert&&b2Alive(f)),text:'DIG UP is coming: break the Acorn Cache (back row) before the Chairman’s next turn, or it eats it and heals.'},
  {id:'share',who:'*',dir:'down',care:1,text:'Nobody has ever shared with it. ▼ Bag, SHARE A SNACK. Three times and it gives up happy. Anyone can do it.'},
  {id:'stash',who:['tom','tnb'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>!r.why),text:'THE BIG STASH is coming. Any ◀ TOMBO smashes its guard in one go.'},
  {id:'stash2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'THE BIG STASH on everyone next turn! Break its guard: 2 Kinetic or Splash hits, or any Tombo.'}]};

// ======================================================================================================
// CHAPTER 7: The Whispering Stacks. Sol flies Tom home (storyTripSteps sets chapter 7). The Hush Library is whispering:
// every book in the Stacks is repeating everything it ever overheard. Party: Tom, Grace and Rose (nobody else can join).
// Flags, in story order: ch7-sol (Sol's line), ch7-goal (Grace's text, in the Square), ch7-page (Page; the staff door
// opens), ch7-stacks (the whispers; the Stacks wake up), ch7-story (optional: story time, Heart-Trace), ch7-fic (The
// Cliffhanger), ch7-non (The Know-It-All), ch7-pic (Pop-Up Panic), ch7-cards (all three catalog cards), ch7-door (the
// password; the Reading Room opens), ch7-boss, battle:unread ('win'), ch7-clear (the coin), ch7-wrap (the Unread
// settles), ch7-done (the library).
// ======================================================================================================
const CH7={mode:'full',chapter:7};
const CH7_CARDS=[
  {c:'fic',fight:'ch7-fic',n:1,letter:'S',title:'SECRETS OF THE SOUP DUMPLING'},
  {c:'non',fight:'ch7-non',n:2,letter:'H',title:'HOW TO WHISPER, VOLUME 2'},
  {c:'pic',fight:'ch7-pic',n:3,letter:'H',title:'HUSH, LITTLE LAMBY'}];
const CH7_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'Grace',lines:['Okay. Everybody up. I\'m in charge of getting up. Up, up, UP.']}],else:[]},
  ...lines
];
// What each troublemaker leaves behind: a catalog card with a gold letter circled. All three: the password.
const ch7CardSteps=c=>{ const C=CH7_CARDS.find(k=>k.c===c); return [
  {call:()=>sfx.pickup()},
  {talk:'Grace',lines:['It dropped a card! An old catalog card. It says CARD '+C.n+' OF 3, and the title is '+C.title+'.','The first letter is circled in gold pen. '+C.letter+'.']},
  {call:()=>sfx.levelChime()},
  {toast:'Catalog card '+C.n+' of 3: the letter '+C.letter+'.',time:4},
  {if:()=>CH7_CARDS.every(k=>flag(k.fight)===true),then:[
    {flag:'ch7-cards'}, {wait:4.2},
    {talk:'Grace',lines:['That\'s all three cards, Tata. Card one, card two, card three. Three gold letters.']},
    {talk:'Tom',lines:['A password for the Reading Room. In card order.']},
    {toast:'Goal: the Reading Room doors (top of the hall). Put the gold letters in card order.',time:5}],else:[]}]; };

// 1. The Square, right after the girls' welcome: Grace's text.
SCENES.ch7Arrive=[
  {flag:'ch7-goal'},
  {talk:'Grace',lines:['Tata. TATA. Did you get my text? I sent it from Mom’s phone. She said I could. She said it after.']},
  {talk:'Tom',lines:['I got it. The library is whispering.']},
  {talk:'Grace',lines:['Not a little bit. ALL the books. At the same time. And they\'re saying THINGS.']},
  {talk:'Rose',lines:['A book told me Boppy eats cookies in the car. In the CAR, Tata. Before DINNER.']},
  {talk:'Tom',lines:['...That one is true. Everybody knows that one.']},
  {talk:'Grace',lines:['A book told everybody I sing in the shower. Which is PRIVATE. Also I\'m very good.',
    'Page says everything is fine. Page has said fine eleven times. I counted. Nobody says fine eleven times if it\'s fine.']},
  {trace:'grace-text'}, {hearts:'grace'},
  {toast:'Goal: The Hush Library (BOOKS), at the top of the Square.',time:4.5}
];
// 2. The Hush Library: Page admits it is not fine. The staff door to the Stacks.
SCENES.ch7Page=[
  {flag:'ch7-page',value:'pending'},
  {walk:'Page',to:routeBeside('Page'),speed:.25},
  {talk:'Page',lines:['Oh! Tom. Girls. Welcome to the Hush Library. Everything is fine.']},
  {talk:'Grace',lines:['Twelve.']},
  {talk:'Whispers',lines:['...psst... Page hums in the elevator... psst... Page has never finished Moby Dick... psst...']},
  {talk:'Page',lines:['...It\'s not fine. It started a week ago. It comes up from the Stacks, downstairs. The old part.',
    'Every book down there\'s whispering. Everything they ever heard. Seventy years of people reading quietly and thinking nobody was listening.']},
  {talk:'Tom',lines:['Books overhear things.']},
  {talk:'Page',lines:['Books overhear EVERYTHING. That\'s why we whisper in here. It was never for the people. It\'s for the books.']},
  {talk:'Rose',lines:['Are there monsters down there? Say yes.']},
  {talk:'Page',lines:['There are three sections. Fiction, Nonfiction and Picture Books. And the Reading Room, at the very back.',
    'The Reading Room doors use the old card catalog lock. I lost the password in 1998.']},
  {talk:'Grace',lines:['I have read every book in the kids section. Twice. I can read ALL the signs.']},
  {talk:'Page',lines:['Then you\'re in charge of the signs. Here. The staff door is open.']},
  {call:()=>{ sfx.thud(); sfx.doorIn&&sfx.doorIn(); }},
  {talk:'Page',lines:['Please be careful. And please, don\'t answer the books. It only encourages them.']},
  {flag:'ch7-page'},
  {toast:'Goal: the Stacks, through the STAFF ONLY door (back right of the library).',time:4.5}
];
// 3. The Stacks: the whispers. Grace reads the signs; Rose reads the pictures.
SCENES.ch7Stacks=[
  {flag:'ch7-stacks',value:'pending'},
  {talk:'Whispers',lines:['psst... psst... the uncle is here... the TALL one... psst... he talks to his bread...']},
  {talk:'Tom',lines:['I do talk to my bread. It\'s part of the process.']},
  {talk:'Rose',lines:['Tata. Tata. The books are looking at us.']},
  {talk:'Grace',lines:['Books can\'t look. They don\'t have... okay, that one has eyes.']},
  {talk:'Grace',lines:['FICTION is that way. NONFICTION is that way. PICTURE BOOKS are down there. The READING ROOM is at the top.','I can read every sign. Rose can\'t read yet.']},
  {talk:'Rose',lines:['I can read PICTURES. Pictures are harder.']},
  {talk:'Grace',lines:['...That\'s actually true.']},
  {trace:'sisters-stacks'}, {hearts:'rose'},
  {talk:'Tom',lines:['Somebody down here knows the password. We ask nicely. Then we ask less nicely.']},
  {flag:'ch7-stacks'},
  {toast:'Goal: Fiction (top left), Nonfiction (top right), Picture Books (bottom). Then the Reading Room doors (top).',time:5.5},
  {toast:'Tip: Picture Books has a story time chair. Rose has a book ready.',time:4}
];
// 4. Optional: story time. Which book does Rose want? (data in ch7Storytime below).
SCENES.ch7Story=[
  {flag:'ch7-story'},
  {talk:'Tom',lines:['Lamby’s Big Day. Page one. Lamby woke up and decided it was going to be a big day.']},
  {talk:'Rose',lines:['Do the voice. Do Lamby’s voice.']},
  {talk:'Tom',lines:['(a very small voice) Today I\'m going to jump on everybody.']},
  {talk:'Rose',lines:['THAT IS WHAT I DO.']},
  {talk:'Grace',lines:['Okay. That\'s actually a good book. Don\'t tell anyone I said that.']},
  {talk:'Whispers',lines:['All around the rug, the picture books go quiet. One of them says, very softly: ...again?']},
  {hearts:'rose'}, {trace:'storytime'}, {call:()=>sfx.levelChime()},
  {heal:true},
  {give:'bandage'},
  {toast:'Everyone is healed. Rose found a Dino Bandage in Lamby’s book.',time:3.5}
];
// 5. The three wings. A troublemaker in each one.
SCENES.ch7Fic=[
  {flag:'ch7-fic',value:'pending'},
  {walk:'The Cliffhanger',to:routeBeside('The Cliffhanger'),speed:.25},
  {talk:'The Cliffhanger',lines:['And then... the uncle walked into Fiction... and he saw... he saw...']},
  {talk:'Tom',lines:['Saw what.']},
  {talk:'The Cliffhanger',lines:['Find out next time!']},
  {talk:'Grace',lines:['That\'s SO annoying. Finish your SENTENCES.']},
  {battle:'cliffhanger',tut:'ch7cliff'},
  ...CH7_AFTER(()=>flag('battle:cliffhanger')!=='win',[
    {flag:'ch7-fic'},
    {talk:'Rose',lines:['Tata. What did you see? When you walked into Fiction?']},
    {talk:'Tom',lines:['A green book being very dramatic.']},
    ...ch7CardSteps('fic')])
];
SCENES.ch7Non=[
  {flag:'ch7-non',value:'pending'},
  {walk:'The Know-It-All',to:routeBeside('The Know-It-All'),speed:.25},
  {talk:'The Know-It-All',lines:['Actually, it\'s li-BRAR-y. Two Rs. Everybody says it wrong. Actually.']},
  {talk:'Grace',lines:['Actually, I KNOW that. Actually, I said it right.']},
  {talk:'The Know-It-All',lines:['Actually, you said it bossy.']},
  {talk:'Rose',lines:['Tata. It sounds like Grace.']},
  {talk:'Grace',lines:['It does NOT sound like me. Tata. Tell her.']},
  {talk:'Tom',lines:['...Let\'s focus on the encyclopedia.']},
  {battle:'knowitall',tut:'ch7know'},
  ...CH7_AFTER(()=>flag('battle:knowitall')!=='win',[
    {flag:'ch7-non'},
    {talk:'Grace',lines:['Tata. Am I a know-it-all? Be honest. Actually, don\'t be honest.']},
    {talk:'Tom',lines:['You know a lot. And you tell people. Those are two different things, and only one of them needs a little work.',
      'The other one is why you\'re in charge of the signs down here.']},
    {talk:'Grace',lines:['...Okay. I can work on the telling part. A little. Starting tomorrow.']},
    {trace:'grace-knowitall'}, {hearts:'grace'},
    ...ch7CardSteps('non')])
];
SCENES.ch7Pic=[
  {flag:'ch7-pic',value:'pending'},
  {walk:'Pop-Up Panic',to:routeBeside('Pop-Up Panic'),speed:.2},
  {call:()=>sfx.whoosh()},
  {talk:'Pop-Up Panic',lines:['BOO!']},
  {talk:'Rose',lines:['AAAAH!']},
  {talk:'Rose',lines:['...Hey. HEY. Nobody scares ME. I do the scaring. That\'s MY job.']},
  {talk:'Pop-Up Panic',lines:['...Boo?']},
  {talk:'Rose',lines:['BOOOOOOO!']},
  {talk:'Pop-Up Panic',lines:['AAAAH!']},
  {talk:'Grace',lines:['Rose. You scared a book.']},
  {battle:'popup',tut:'ch7pop'},
  ...CH7_AFTER(()=>flag('battle:popup')!=='win',[
    {flag:'ch7-pic'},
    {talk:'Rose',lines:['Tata, did you see? I scared it back. It was TERRIFIED.']},
    {talk:'Tom',lines:['It was terrified. Best scaring I\'ve ever seen. Ten out of ten.']},
    {trace:'rose-boo'}, {hearts:'rose'},
    ...ch7CardSteps('pic')])
];
// 6. The password works: the Reading Room doors open, and the whispering stops.
SCENES.ch7Door=[
  {flag:'ch7-door'},
  {call:()=>{ sfx.thud(); }}, {wait:.6},
  {talk:'Reading Room doors',lines:['Click. Click. CLUNK. The brass drawer slides shut by itself.']},
  {call:()=>{ ch7OpenDoors(); storyWorld(); sfx.doorIn&&sfx.doorIn(); sfx.levelChime(); }},
  {talk:'Whispers',lines:['All through the Stacks, every book stops whispering at once.','Then, from behind the doors, one voice. Old. Dry. Very slow. \"...Who\'s there?\"']},
  {talk:'Rose',lines:['Tata. The door talked.']},
  {talk:'Tom',lines:['The thing behind the door talked. Stay close.']},
  {toast:'Goal: the Reading Room.',time:4}
];
// 7. The Reading Room: The Unread, on the dais. Boss fight.
SCENES.ch7Boss=[
  {flag:'ch7-boss'}, {call:()=>storyWorld()},
  {hide:'The Unread'},
  {walk:'tom',to:routeTo('tom',9,7),speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:[8,7],dir:'up'}, {place:'rose',at:[10,7],dir:'up'},
  {talk:'Grace',lines:['Tata. On the dais. It\'s a book. A really, REALLY big book.']},
  {call:()=>{ sfx.thud(); sfx.whoosh(); }},
  {show:'The Unread'}, {face:'The Unread',dir:'down'},
  {talk:'The Unread',lines:['...Visitors. Nobody comes to the Reading Room. Nobody has come since 1952.']},
  {talk:'Tom',lines:['You\'re the one whispering.']},
  {talk:'The Unread',lines:['I\'m the oldest book in the Stacks. Seventy years on this shelf. Nobody has checked me out. Nobody has opened me. Not once.',
    'So I listened. Everybody who ever sat in this room thought nobody could hear them. I heard ALL of it.',
    'If nobody will read me, then I\'ll read THEM. Out loud. To everybody.']},
  {talk:'Rose',lines:['You told everybody Boppy eats cookies in the car.']},
  {talk:'The Unread',lines:['He does. In the CAR.']},
  {talk:'Grace',lines:['You can\'t just tell people’s secrets! That\'s the rudest thing a book can do! That\'s a RULE!']},
  {talk:'The Unread',lines:['Then read me. Go on. Nobody ever does.']},
  {talk:'Tom',lines:['Girls, behind me. No touching, please.']},
  {battle:'unread',tut:'unread'},
  {if:()=>flag('battle:unread')!=='win',then:[
    {heal:true},
    {talk:'Grace',lines:['Up, everybody. I\'m in charge now.','Tata, it TELLS us its chapter. Mystery, Chatter. Adventure, Kinetic. Read the message. And maybe somebody should just read it. Out loud. Three times.']},
    {toast:'Face The Unread and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 8. After the boss (won in the scene, or on a retry with A): the Unread settles down. A coin, and a checkout card.
SCENES.ch7AfterBoss=()=>[
  {flag:'ch7-clear'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  ...(flag('kind:unread')?[
    {talk:'The Unread',lines:['...You read me. Out loud. With VOICES.','Seventy years. That was the best chapter of my whole life. It was chapter one.']},
    {talk:'Rose',lines:['I did the dragon.']},
    {talk:'The Unread',lines:['You were a wonderful dragon.']}]:[
    {talk:'The Unread',lines:['...Fine. The end. I\'ll be quiet. I\'m very good at quiet. I\'ve had a lot of practice.']}]),
  {call:()=>{ setFlag('ch7-wrap'); storyWorld(); sfx.whoosh(); }},
  {talk:'The Reading Room',lines:['The Unread closes, very slowly, and settles onto the lectern. The green lamps stop flickering.']},
  {talk:'Grace',lines:['Tata, something fell out of it. Something gold. It was being used as a bookmark.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['A gold coin. Same little clock face.','The sundial. The steamer. The sign-up sheet. My jar. Now a book nobody has opened since 1952.']},
  {talk:'Grace',lines:['Somebody DID open it, then. To put the coin in.','And look. The checkout card, in the pocket. One stamp. DUE BACK 1952. No name. Just a little clock.']},
  {talk:'Rose',lines:['Somebody took it out and didn\'t READ it? That\'s so sad.']},
  {talk:'Tom',lines:['And brought it back with a coin in it. Look at those corners. Very neat.','I\'m adding it to the list.']},
  {talk:'Grace',lines:['I\'m adding it to MY list. Mine has a chart AND a key now.']},
  {toast:'Goal: back up to the Hush Library. Page is waiting.',time:4.5}
];
// 9. The Hush Library: properly quiet. Rewards. TNB's text. Chapter complete.
SCENES.ch7End=[
  {flag:'ch7-done',value:'pending'},
  {walk:'Page',to:routeBeside('Page'),speed:.25},
  {talk:'Page',lines:['Listen. It\'s quiet. Properly quiet. The good kind. The dictionaries are snoring.']},
  {talk:'Grace',lines:['It just wanted somebody to read it. That\'s all. All of it was because nobody read it.']},
  {talk:'Page',lines:['Then we\'ll read it. Story time, Saturdays, out loud. And I think I know who should do the voices.',
    'Grace. This is for you. A Gold Library Card. No limit. No late fees. Ever.']},
  {give:'g_librarycard'},
  {toast:'Grace gets a new Signature Tool: the Gold Library Card (POW +6, WARMTH +6). Equip it in the menu.',time:4.5},
  {talk:'Grace',lines:['No late fees. EVER? Tata. I\'m going to take out every book. Every single one. Alphabetically.']},
  {talk:'Page',lines:['And sweaters. I knit one every winter. I have run out of people. Please take some.']},
  {give:'hushsweater'},
  {toast:'New outfit: the Hush Library Sweater. SHHH on the front. Anyone can wear it.',time:4},
  {talk:'Rose',lines:['It\'s itchy. I love it.']},
  {call:()=>{ sfx.ding&&sfx.ding(); }},
  {talk:'Tom',lines:['A text from TNB. \"Babe. Bernadette signed you up for the 2nd Ave potluck. You\'re on bread. For forty people.\"',
    '\"I said yes for you. You\'re welcome. Bring the starter.\"']},
  {talk:'Grace',lines:['Forty people? Tata. That\'s a FEAST.']},
  {talk:'Tom',lines:['...Bready Mercury is going to need a bigger jar.']},
  {trace:'ch7-wrap'}, {hearts:'grace'}, {call:()=>sfx.levelChime()},
  {party:null},
  {flag:'tombo:deedee2'},   // Pick the Rhubarb unlocks here (chapter 7)
  {fade:'out',time:.8}, {card:7,done:true,time:3.4}, {flag:'ch7-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'New Tombo: Pick the Rhubarb (Tom + Deedee). 50% HEART.',time:3.2},
  {toast:'Chapter 7 complete! Chapter 8 is still being built. Long Island is yours to explore.',time:6}
];
TRIGGERS.push(
  {id:'ch7-goal',map:'town',when:{...CH7,notFlag:'ch7-goal'},scene:'ch7Arrive'},
  {id:'ch7-page',map:'library',when:{...CH7,flag:'ch7-goal',notFlag:'ch7-page'},scene:'ch7Page'},
  {id:'ch7-stacks',map:'stacks',when:{...CH7,flag:'ch7-page',notFlag:'ch7-stacks'},scene:'ch7Stacks'},
  {id:'ch7-fic',map:'stacks',at:[1,1,12,7],when:{...CH7,flag:'ch7-stacks',notFlag:'ch7-fic'},scene:'ch7Fic'},
  {id:'ch7-non',map:'stacks',at:[17,1,28,7],when:{...CH7,flag:'ch7-stacks',notFlag:'ch7-non'},scene:'ch7Non'},
  {id:'ch7-pic',map:'stacks',at:[8,13,21,19],when:{...CH7,flag:'ch7-stacks',notFlag:'ch7-pic'},scene:'ch7Pic'},
  {id:'ch7-boss',map:'readroom',when:{...CH7,flag:'ch7-door',notFlag:'ch7-boss'},scene:'ch7Boss'},
  {id:'ch7-after',map:'readroom',when:{...CH7,flag:{'battle:unread':'win'},notFlag:'ch7-clear'},scene:'ch7AfterBoss'},
  {id:'ch7-end',map:'library',when:{...CH7,flag:'ch7-clear',notFlag:'ch7-done'},scene:'ch7End'}
);
// The Stacks hold still until the whispers scene; each wing's troublemaker holds still until its story fight.
const CH7_WING_FLAG={cliffhanger:'ch7-fic',knowitall:'ch7-non',popup:'ch7-pic'};
HOLD_RULES.push(n=>STORY.chapter===7&&currentMap.id==='stacks'&&(flag('ch7-stacks')!==true||(CH7_WING_FLAG[n.monster]&&flag(CH7_WING_FLAG[n.monster])!==true)));

// Map changes. They check flags (not events), so they also hold after loading a save.
// The Reading Room doors (top of the Stacks hall) open once the password works.
function ch7OpenDoors() {
  const M=worlds.stacks; if(!M||M.doorsOpen) return;
  const o=M.objects.find(o=>o.kind==='readdoors');
  if(o) { M.objects.splice(M.objects.indexOf(o),1); for(const x of [14,15]) M.objectAt.delete(key(x,1)); }
  for(const x of [14,15]) tile(M,x,1,'hallwood');
  M.doorsOpen=true; M.mini=null;
}
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  if(flag('ch7-door')||STORY.chapter>7) ch7OpenDoors();
  // The Unread stays out of sight until the party walks into the Reading Room, and settles on the lectern after.
  const b=findMonster('unread'); if(!b) return;
  b.mscale=1.5;
  const under=STORY.chapter<7||(STORY.chapter===7&&!flag('ch7-boss'))||!!flag('ch7-wrap');
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});

// The STAFF ONLY door in the library room goes down to the Stacks once Page has opened it (and after chapter 7).
function ch7StacksDoor(o) {
  if(STORY.mode!=='full'||!(STORY.chapter>7||(STORY.chapter===7&&flag('ch7-page')))) return false;
  beginTransition({kind:'edge',to:'stacks',spawn:{x:1,y:10},facing:'right'});
  return true;
}
// The Reading Room doors: the catalog lock wants a three-letter password (the gold letters, in card order).
const CH7_WORDS=['HHS','SHH','HSH','BOO'];
function ch7Catalog(o) {
  if(STORY.mode!=='full'||STORY.chapter!==7||!flag('ch7-stacks')||flag('ch7-door')) return false;
  if(!flag('ch7-cards')) {
    const n=CH7_CARDS.filter(k=>flag(k.fight)===true).length;
    openDialog(o.name,['A brass lock shaped like a card catalog drawer. Three little letter wheels. Behind the doors, something is whispering.',
      'Grace: \"We need the password, Tata. '+(n?'We have '+n+' of 3 catalog cards.':'Page said somebody down here knows it. Fiction, Nonfiction, Picture Books.')+'\"']);
    return true;
  }
  openChoice(o.name,['Three letter wheels on the catalog lock. Click, click, click.','What does Tom spell?'],
    CH7_WORDS.map(w=>({label:w==='BOO'?'BOO (Rose’s idea)':w,fn:()=>{
      if(w==='SHH') { playScene('ch7Door'); return; }
      sfx.nope&&sfx.nope();
      if(w==='BOO') { openDialog('Rose',['BOO!','...It didn\'t work. It SHOULD have worked. Boo always works.']); return; }
      openDialog('Grace',[pick(['Card one first, Tata. Then card two. Then card three.','The cards are numbered. One, two, three. That\'s the order.','Wrong order. Card ONE is the first letter.'])]);
    }})));
  return true;
}
// Story time: pick the book Rose wants (Heart-Trace).
const CH7_BOOKS=[
  {label:'A BOOK ABOUT TAXES',no:'Rose falls asleep on page one. Then she wakes up and says no.'},
  {label:'THE DICTIONARY',no:'Rose: \"Read the A part.\" Tom reads the A part. Rose: \"Is there a story?\" There\'s not a story.'},
  {label:'THE SCARIEST ONE',no:'Grace: \"NO. She\'ll be up all night and she\'ll come in MY room.\" Rose: \"I WILL.\"'},
  {label:'LAMBY’S BIG DAY',ok:true}];
function ch7Storytime(o) {
  if(STORY.mode!=='full'||STORY.chapter!==7||!flag('ch7-stacks')||flag('ch7-story')) return false;
  openChoice(o.name,['Rose climbs into the big rocking chair and points at Tom. Then at the basket of books. Then at Tom again.','Which one does Tom read?'],
    CH7_BOOKS.map(b=>({label:b.label,fn:()=>{ if(b.ok) playScene('ch7Story'); else { sfx.nope&&sfx.nope(); openDialog('Story time',[b.no]); } }})));
  return true;
}
const LE_pressAction_ch7=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object') {
      if(v.stacks&&ch7StacksDoor(v)) return;
      if(v.catalog&&ch7Catalog(v)) return;
      if(v.storytime&&ch7Storytime(v)) return;
    }
  }
  return LE_pressAction_ch7();
};
// The Stacks are dim (lamp light around Tom), and until the Unread settles, whispers drift up off the shelves, in
// the library room upstairs too.
const CH7_WHISPERS=['psst','shhh','psst...','did you hear','shh','he talks to his bread','psst','nobody reads me'];
STORY_MAPFX.push(time=>{
  const M=currentMap,id=M.id;
  if(id==='stacks') {
    const p=position(player),px=(p.x+.5)*T,py=(p.y+.5)*T,c=gfx;
    const g=c.createRadialGradient(px,py,T*2.5,px,py,T*8); g.addColorStop(0,'rgba(18,10,8,0)'); g.addColorStop(1,'rgba(18,10,8,.5)');
    c.fillStyle=g; c.fillRect(0,0,M.w*T,M.h*T);
  }
  const loud=STORY.mode==='full'&&STORY.chapter===7&&!flag('ch7-wrap')&&(id==='stacks'||id==='readroom'||(id==='library'&&flag('ch7-goal')));
  if(!loud) return;
  for(let k=0;k<(id==='library'?4:9);k++) {
    const n=hash(k,77),per=6+(n%5),ph=((time+(n%100)/10)%per)/per;
    const tx=(n>>>3)%(M.w-2)+1,ty=(n>>>11)%(M.h-2)+1; if(M.tiles[ty][tx]==='bkvoid') continue;
    const x=tx*T,y=ty*T-ph*T*1.5;
    gfx.globalAlpha=Math.sin(ph*Math.PI)*.75; label(CH7_WHISPERS[(k+Math.floor(time/per))%CH7_WHISPERS.length],x,y,'#e9dcff',1); gfx.globalAlpha=1;
  }
});

// Tips for the chapter 7 story fights and The Unread.
TUTORIALS.ch7cliff={
  setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
  tips:[
    {id:'weak',who:'*',text:'The Cliffhanger is weak to Cozy and Chatter, and shrugs off Kinetic. Rose’s RASPBERRY and Tom’s Flashcard Flurry are Chatter.'},
    {id:'shushed',who:'*',when:()=>b2LiveParty().some(p=>p.st.shushed),text:'Shushed: no Chatter moves (and no Tombos) for a turn or two. Basic moves and other skills still work.'},
    {id:'kind',who:'grace',dir:'up',text:'Library books love a good show. Grace’s Welcome Back to My Channel and DANCE warm them up fast.'}]};
TUTORIALS.ch7know={tips:[
  {id:'grit',who:'*',when:()=>b2LiveParty().some(p=>p.st.gritdown),text:'GRIT Down: that person takes more from hits. Grace’s Squishy Squeeze (▶) clears it.'},
  {id:'weak',who:'*',text:'The Know-It-All is weak to Chatter and Sparkle, and shrugs off Cozy. B Inspects it.'}]};
TUTORIALS.ch7pop={tips:[
  {id:'dodge',who:'*',text:'Pop-Up Panic folds flat and dodges a lot of single hits. Hits on everyone never miss.'},
  {id:'weak',who:'rose',dir:'up',text:'It\'s weak to Kinetic and Sparkle. Rose’s Lamby Launch is Kinetic. Scare it back.'}]};
TUTORIALS.unread={tips:[
  {id:'chapter',who:'*',text:'The Unread is reading one chapter at a time. The message says which genre, and what works on it. B Inspects it too.'},
  {id:'page',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='page'),text:'PAGE TURN is coming: next turn its weak spot changes. Spend big skills now, while you know the weak spot.'},
  {id:'read',who:'*',dir:'down',care:1,text:'Nobody has ever read it. ▼ Bag, READ ALOUD. Three times and it gives up happy. Anyone can do it.'},
  {id:'shushed',who:'grace',dir:'up',when:u=>b2LiveParty().some(p=>p.st.shushed)&&u.kit.skills.some(s=>s.key==='squishy'||s.key==='dumpling_consult'||s.key==='squishy_squeeze'),text:'Shushed! Grace’s Squishy Squeeze (▲ Skills) clears it, so Chatter moves and Tombos come back.'},
  {id:'end',who:['tom','grace','rose'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>!r.why),text:'THE END is coming. Any ◀ TOMBO smashes its guard in one go.'},
  {id:'end2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'THE END on everyone next turn! Break its guard: 2 Sparkle or Cozy hits, or any Tombo.'}]};

// ======================================================================================================
// CHAPTER 8: Feast on Jefferson Park. Sal flies Tom to LA (storyTripSteps sets chapter 8). It is the day of the 2nd Ave
// potluck; Tom is on bread for forty, and at noon every oven and stove on the block went cold. Party: Tom, TNB (locked
// in by the scene), Nara. The flames went east, into the old Division Nine Car Barn at the end of Jefferson Boulevard.
// Flags, in story order: ch8-sal (Sal's line), ch8-goal (TNB's text, downtown), ch8-block (2nd Ave: the heart-kiss,
// Bernadette, Olivia hands over Nara; the Car Barn gate opens), ch8-barn (inside: the cold; the barn wakes up),
// ch8-paint (Wet Blanket), ch8-shop (The Draft), ch8-lunch (The Picky Eater), ch8-pilots (all three pilot lights),
// ch8-plate (optional: Nara eats off Tom's plate, Heart-Trace), ch8-pail (optional: the lunch pail on Track 1),
// ch8-motor (TNB fixes the turntable motor), ch8-tt ('east' while the bridge points at Track 4), ch8-turn (first time),
// ch8-boss, battle:ironbelly ('win'), ch8-clear (forty loaves and the coin), ch8-wrap (Ironbelly settles), ch8-feast
// (the table on 2nd Ave), ch8-done.
// ======================================================================================================
const CH8={mode:'full',chapter:8};
const CH8_SHOPS=[
  {c:'paint',fight:'ch8-paint',place:'the Paint Shop',whose:'Mr. Washington’s',dish:'gumbo'},
  {c:'shop',fight:'ch8-shop',place:'the Machine Shop',whose:'Olivia’s',dish:'lasagna'},
  {c:'lunch',fight:'ch8-lunch',place:'the Lunchroom',whose:'Tom’s own',dish:'forty loaves'}];
const CH8_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'TNB',lines:['Okay. Up. Everybody up. Hot cocoa later. Lots of it.']}],else:[]},
  ...lines
];
// What each troublemaker was hogging: one pilot light from a 2nd Ave stove. All three: the turntable motor.
const ch8PilotSteps=c=>{ const C=CH8_SHOPS.find(k=>k.c===c); return [
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['A pilot light. A tiny blue flame, floating right there. That is '+C.whose+' stove. That\'s the '+C.dish+'.']},
  {talk:'Nara',lines:['Nara sniffs it. It\'s warm. Her tail goes like a propeller.']},
  {call:()=>sfx.levelChime()},
  {toast:'Pilot light '+CH8_SHOPS.filter(k=>flag(k.fight)===true).length+' of 3.',time:3.5},
  {if:()=>CH8_SHOPS.every(k=>flag(k.fight)===true),then:[
    {flag:'ch8-pilots'}, {wait:3.7},
    {talk:'TNB',lines:['That\'s three, babe. And that little steam motor by the turntable has three empty burners. Three. I can fix that.']},
    {talk:'Tom',lines:['You can fix anything.']},
    {talk:'TNB',lines:['I can fix most things. I fixed your dishwasher with a butter knife.']},
    {toast:'Goal: the turntable motor (bottom of the corridor, by the turntable).',time:5}],else:[]}]; };

// 1. Downtown, right off the plane: a text from TNB.
SCENES.ch8Arrive=[
  {flag:'ch8-goal'},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Tom',lines:['A text from TNB.','"Babe. Potluck is TONIGHT. Forty people. You\'re on bread."','"Also every oven on 2nd Ave just went cold. At the same time. At noon. Come home."']},
  {talk:'Tom',lines:['Bready Mercury’s dough has been rising since Thursday. Forty loaves. It needs a five hundred degree oven.','I didn\'t fly here to serve forty people raw dough.']},
  {toast:'Goal: 2nd Ave in Jefferson Park, south of Downtown.',time:4.5}
];
// 2. 2nd Ave: TNB, the heart-kiss, Bernadette's clipboard, cold ovens. Olivia hands over Nara.
SCENES.ch8Block=[
  {flag:'ch8-block',value:'pending'},
  {join:'tnb',quiet:true}, {hide:'tnb'},
  {walk:'tom',to:routeTo('tom',12,20),speed:.2}, {face:'tom',dir:'right'},
  {place:'tnb',at:[13,20],dir:'left'}, {show:'tnb'},
  {talk:'TNB',lines:['Well, well, well...'],voice:[['tnb','greet',0,'Well, well, well...']]},
  ch4Kiss(),
  {talk:'TNB',lines:['Hi. Missed you. Don\'t panic. Touch your stove.']},
  {talk:'Tom',lines:['...I haven\'t been home yet.']},
  {talk:'TNB',lines:['Right. Well, it\'s cold. Everybody’s is cold. I tried to light yours. The flame LEANED, babe. Sideways. Toward the boulevard. Like it wanted to leave.']},
  {trace:'tnb-hello8'}, {hearts:'tom'},
  {spawn:{name:'Bernadette',look:'bernadette',at:[11,20],dir:'right'}},
  {talk:'Bernadette',lines:['Tom. Good. Neighborhood Watch Captain, potluck committee chair. Forty RSVPs. Thirty-nine dishes. One bread guy.','Every pilot light on 2nd Avenue went out at noon. Every one. Including mine. I had a casserole IN there.']},
  {talk:'Tom',lines:['Did you call the gas company?']},
  {talk:'Bernadette',lines:['They said it\'s the weekend. I said it\'s the POTLUCK. They hung up. I\'ve filed a report. With myself.']},
  {walk:'Olivia',to:routeBeside('Olivia'),speed:.2},
  {talk:'Olivia',lines:['Tom! Can you take Nara? She won\'t eat. Her dinner is cold, so she won\'t eat it. Michael warmed it in his hands. She still won\'t eat it.']},
  {walk:'Nara',to:routeBeside('Nara'),speed:.1},
  {talk:'Nara',lines:['Nara slams into Tom’s shins and leans on him with all forty pounds. Then she turns, points her nose east, and sniffs. Hard.']},
  {join:'nara'}, {hearts:'nara'}, {trace:'nara-hello8'},
  {talk:'TNB',lines:['East. Toward the end of the boulevard. Babe. The old Car Barn. Division Nine. The streetcars ran out of there until 1963.','I\'ve wanted to go in there since I MOVED here.']},
  {talk:'Bernadette',lines:['The barn? It\'s been chained up for sixty years. Here. Committee key. I\'m the committee. We\'re closing the boulevard for the tables. Bread by six.']},
  {despawn:'Bernadette'},
  {talk:'Olivia',lines:['Bring her back fed! Please! Michael, Isla is eating the lasagna. It\'s a brick. She\'s eating a brick.']},
  {party:{lock:['tom','tnb']}},
  {flag:'ch8-block'},
  {toast:'Goal: the old Car Barn, at the east end of Jefferson Boulevard.',time:4.5}
];
// 3. The Car Barn: cold, frost, and little blue flames drifting toward the turntable.
SCENES.ch8Barn=[
  {flag:'ch8-barn',value:'pending'},
  {talk:'TNB',lines:['Oh. Oh, babe. Look at it. The tracks are still in the floor. The time clock. The crew bench. I\'m going to cry a little.']},
  {talk:'Tom',lines:['It\'s beautiful. You can cry a little. I\'ll wait.','...It\'s also freezing in here, and it\'s seventy-four degrees outside.']},
  {talk:'Nara',lines:['Nara watches a little blue flame drift past her nose, along the floor, toward the back. Then another one. Then another.']},
  {talk:'Tom',lines:['Those are pilot lights. The whole block’s pilot lights. Something down here is collecting them.']},
  {talk:'TNB',lines:['And some of them got stuck. Look. The Paint Shop, the Machine Shop, the Lunchroom. Something in each one is hogging one.']},
  {flag:'ch8-barn'},
  {toast:'Goal: the Paint Shop (top left), the Machine Shop (top right), the Lunchroom (bottom left). Get the pilot lights back.',time:5.5},
  {toast:'Tip: Nara hasn\'t eaten all day. The Lunchroom has tables.',time:4}
];
// 4. The three shops. A troublemaker in each one, hogging a pilot light.
SCENES.ch8Paint=[
  {flag:'ch8-paint',value:'pending'},
  {walk:'Wet Blanket',to:routeBeside('Wet Blanket'),speed:.3},
  {talk:'Wet Blanket',lines:['...Oh. Visitors. Great. I suppose you want that little flame.','Why bother. It\'s just going to go out. Everything goes out eventually.']},
  {talk:'TNB',lines:['Wow. Okay. Big mood, buddy.']},
  {talk:'Tom',lines:['That flame is a gumbo. Forty years of gumbo. Hand it over.']},
  {battle:'wetblanket',tut:'ch8blanket'},
  ...CH8_AFTER(()=>flag('battle:wetblanket')!=='win',[
    {flag:'ch8-paint'},
    {talk:'TNB',lines:['It dried out a little. Look. It\'s almost fluffy. It\'s a blanket again.']},
    ...ch8PilotSteps('paint')])
];
SCENES.ch8Shop=[
  {flag:'ch8-shop',value:'pending'},
  {walk:'The Draft',to:routeBeside('The Draft'),speed:.35},
  {talk:'The Draft',lines:['Wooooo. Pfft. Pfft. Pfft. That was me. I blew them all out. Every stove on the block.','Ironbelly asked for the flames, so I carried them. I\'m a delivery draft.']},
  {talk:'Tom',lines:['Who\'s Ironbelly.']},
  {talk:'The Draft',lines:['Wooooo. I said nothing. I\'m just air.']},
  {talk:'TNB',lines:['Babe, close a door on it. Any door.']},
  {battle:'thedraft',tut:'ch8draft'},
  ...CH8_AFTER(()=>flag('battle:thedraft')!=='win',[
    {flag:'ch8-shop'},
    {talk:'Tom',lines:['Ironbelly. Somebody named Ironbelly wanted every flame on 2nd Ave.']},
    {talk:'TNB',lines:['That\'s either a boat or a stove. In a car barn, babe, it\'s a stove.']},
    ...ch8PilotSteps('shop')])
];
SCENES.ch8Lunch=[
  {flag:'ch8-lunch',value:'pending'},
  {walk:'The Picky Eater',to:routeBeside('The Picky Eater'),speed:.25},
  {talk:'The Picky Eater',lines:['Ew. EW. Who are you. What\'s that. Is that a dog? Ew. Is that BREAD? Bread is the worst. Bread TOUCHES things.']},
  {talk:'Nara',lines:['Nara looks at the lunchbox. The lunchbox looks at Nara. Two very picky eaters. Nobody blinks.']},
  {talk:'TNB',lines:['Babe. It\'s her. It\'s Nara as a lunchbox.']},
  {talk:'Tom',lines:['That flame is my oven. My forty loaves. Put it down. No touching, please.']},
  {battle:'pickyeater',tut:'ch8picky'},
  ...CH8_AFTER(()=>flag('battle:pickyeater')!=='win',[
    {flag:'ch8-lunch'},
    {talk:'The Picky Eater',lines:['...Fine. FINE. Take it. I\'ll try a bite of something. Later. Maybe. If it\'s warm. And not touching.']},
    {talk:'Nara',lines:['Nara nods. She understands completely.']},
    ...ch8PilotSteps('lunch')])
];
// 5. Optional: Nara has not eaten all day (data in ch8Plate below).
SCENES.ch8Plate=[
  {flag:'ch8-plate'},
  {talk:'Tom',lines:['Tom takes out the sandwich he packed for himself. Turkey, mustard, his own sourdough. He puts it on his own plate. He sits down.']},
  {talk:'Nara',lines:['Nara is at his elbow in half a second. She looks at the sandwich. She looks at Tom. She takes the whole thing, very gently, off his plate.','She eats it in three bites. She licks the plate. She lies down on his feet.']},
  {call:()=>{ sfx.bark&&sfx.bark(); }},
  {hearts:'nara'}, {trace:'nara-plate'}, {call:()=>sfx.levelChime()},
  {talk:'TNB',lines:['She wouldn\'t eat her own dinner. She ate YOUR dinner.']},
  {talk:'Tom',lines:['It was on my plate. That\'s the rule. Food on her plate is suspicious. Food on my plate is a gift.']},
  {heal:true},
  {toast:'Everyone is healed. Nara finally ate. Tom didn\'t.',time:3.5}
];
// 6. Optional: the lunch pail on Track 1.
SCENES.ch8Pail=[
  {flag:'ch8-pail'},
  {talk:'Tom',lines:['A note taped inside the lid: FOR THE NEXT SHIFT. HAVE A GOOD RUN. BOOKER W.','And a picnic basket. Somebody packed it a very long time ago. It\'s somehow fine.']},
  {give:'picnic'},
  {talk:'TNB',lines:['Babe. Somebody left lunch for the next guy. Sixty years ago. That\'s the nicest thing I\'ve ever seen in a train yard.']},
  {toast:'Got a Picnic Basket.',time:3}
];
// 7. TNB fixes the turntable motor with the three pilot lights.
SCENES.ch8Motor=[
  {flag:'ch8-motor'},
  {talk:'TNB',lines:['Okay. Burner one. Burner two. Burner three. Righty tighty. Lefty... no, righty. Righty tighty.']},
  {call:()=>{ sfx.thud(); sfx.whoosh&&sfx.whoosh(); }},
  {talk:'Turntable motor',lines:['FWOOMP. Three little blue flames catch under the boiler. The needle on the gauge creeps up. The pipes start to tick.']},
  {call:()=>sfx.levelChime()},
  {talk:'TNB',lines:['Steam. We have STEAM, babe. I fixed a hundred-year-old turntable motor. I\'m going to put this on my resume.']},
  {talk:'Tom',lines:['Put it at the top. New section.']},
  {talk:'TNB',lines:['Under hero.']},
  {trace:'tnb-motor'}, {hearts:'tnb'},
  {toast:'Goal: pull the turntable lever (top of the corridor). Track 4 goes to the Boiler Room.',time:5}
];
// 8. The lever swings the bridge round to Track 4 for the first time.
SCENES.ch8Turn=[
  {flag:'ch8-turn'},
  {talk:'Turntable',lines:['CLANK. Hissss. The whole turntable groans, and the bridge swings slowly round, rails and all, until it lines up with Track 4.']},
  {talk:'TNB',lines:['Babe. BABE. We turned a turntable. Do you know how many people get to turn a turntable? Like eleven.']},
  {talk:'Nara',lines:['Nara sniffs the air across the pit. Warm. Bread-oven warm. Her ears go flat, then up, then flat.']},
  {toast:'Goal: across the turntable to Track 4, the Boiler Room.',time:4.5}
];
// 9. The Boiler Room: Old Ironbelly, on the hearth. Boss fight.
SCENES.ch8Boss=[
  {flag:'ch8-boss'}, {call:()=>storyWorld()},
  {hide:'Old Ironbelly'},
  {walk:'tom',to:routeTo('tom',9,7),speed:.25}, {face:'tom',dir:'up'},
  {place:'tnb',at:[8,7],dir:'up'}, {place:'nara',at:[10,7],dir:'up'},
  {talk:'TNB',lines:['Babe. It\'s warm in here. Like, really warm. Like, opening-the-oven-door warm.']},
  {call:()=>{ sfx.thud(); sfx.whoosh&&sfx.whoosh(); }},
  {show:'Old Ironbelly'}, {face:'Old Ironbelly',dir:'down'},
  {talk:'Old Ironbelly',lines:['...Who\'s in my Boiler Room. Nobody comes down here. Not since the last car went out. 1963.',
    'I\'m Old Ironbelly. 1912. Cast iron, all the way through. Biscuits for the night crew, every night, for fifty-one years. Cornbread on Fridays.']},
  {talk:'Tom',lines:['You took every pilot light on 2nd Avenue.']},
  {talk:'Old Ironbelly',lines:['Everybody up there has a little fire. I\'ve been cold for sixty years. I only borrowed some.','And look at me. I\'m WARM again. I\'m five hundred degrees. Do you know how long it\'s been since I was five hundred degrees?']},
  {talk:'TNB',lines:['On the day of the POTLUCK, though.']},
  {talk:'Old Ironbelly',lines:['A potluck. Everybody brings a dish. Nobody ever brings anything to the oven. Nobody has put a single thing in me since 1963.']},
  {talk:'Nara',lines:['Nara growls. A small growl. She\'s very hungry, and very serious.']},
  {talk:'Tom',lines:['Give the flames back. No touching, please.']},
  {battle:'ironbelly',tut:'ironbelly'},
  {if:()=>flag('battle:ironbelly')!=='win',then:[
    {heal:true},
    {talk:'TNB',lines:['Okay. Up. Everybody up. That was hot. That was SO hot.','Babe, Splash cools her down. Cozy stokes her up, so not too much of that. And she wants somebody to bake something in her. Three times.']},
    {toast:'Face Old Ironbelly and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 10. After the boss (won in the scene, or on a retry with A): forty loaves, a peel and a gold coin.
SCENES.ch8AfterBoss=()=>[
  {flag:'ch8-clear'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  ...(flag('kind:ironbelly')?[
    {talk:'Old Ironbelly',lines:['...Bread. There\'s bread in me. And a little pot. And a dog’s dinner. Sixty years of nothing, and now THIS.','I don\'t need all those little flames. I can make my own fire. I always could. I just needed something to make it FOR.']},
    {talk:'Tom',lines:['Forty loaves. Tonight. You\'re the only oven on 2nd Ave hot enough for Bready Mercury.']},
    {talk:'Old Ironbelly',lines:['Then bring me the dough, baker. And don\'t open the door. I\'ll know.']}]:[
    {talk:'Old Ironbelly',lines:['...Fine. FINE. Take your little flames back. I\'ll be cold again. I\'m used to it.']},
    {talk:'Tom',lines:['Or. Forty loaves. Tonight. You\'re the only oven on 2nd Ave hot enough.']},
    {talk:'Old Ironbelly',lines:['...Forty? Nobody has asked me for forty anything since 1963. Bring the dough.']}]),
  {call:()=>{ setFlag('ch8-wrap'); storyWorld(); sfx.whoosh(); }},
  {talk:'The Boiler Room',lines:['The little blue flames lift off her grate, one by one, and drift up the flue toward 2nd Avenue. Her own fire settles in, low and gold.']},
  {fade:'out',time:.8},
  {talk:'The Boiler Room',lines:['Two hours later.']},
  {fade:'in',time:.8},
  {talk:'TNB',lines:['Forty loaves, babe. FORTY. They\'re crackling. Listen to them. They\'re singing.']},
  {talk:'Old Ironbelly',lines:['That\'s the crust. That\'s what crust does when it\'s done right. Here. Take my peel. Fifty-one years of biscuits. It wants to work again.']},
  {give:'t_peel'},
  {toast:'Tom gets a new Signature Tool: Ironbelly’s Bread Peel (POW +6, WARMTH +7). Equip it in the menu.',time:4.5},
  {trace:'ironbelly-bread'}, {hearts:'tom'},
  {talk:'Nara',lines:['Nara is digging in the ash pan. Nara has found something. Nara is very proud of it.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['A gold coin. Same little clock face.','The sundial. The steamer. The sign-up sheet. My jar. The book from 1952. And now an oven nobody has opened since 1963.']},
  {talk:'TNB',lines:['Somebody keeps getting into places nobody gets into. Very neat. Very quiet. Very spooky. I love it. I hate it.']},
  {talk:'Tom',lines:['Look at the corners. Not a speck of ash on it. Somebody put it there after the fire went out. I\'m adding it to the list.']},
  {toast:'Goal: the bread to the potluck. They closed Jefferson Boulevard for the tables.',time:4.5}
];
// 11. Jefferson Boulevard, closed for the 2nd Ave potluck: the feast. Rewards. A letter for Tom. Chapter complete.
SCENES.ch8End=[
  {flag:'ch8-done',value:'pending'}, {flag:'ch8-feast'},
  {walk:'tom',to:routeTo('tom',13,11),speed:.2}, {face:'tom',dir:'up'},
  {place:'tnb',at:[12,11],dir:'up'}, {place:'nara',at:[14,11],dir:'up'},
  {place:'Olivia',at:[11,8],dir:'down'}, {place:'Michael',at:[12,8],dir:'down'}, {place:'Mr. Washington',at:[16,8],dir:'down'},
  {spawn:{name:'Bernadette',look:'bernadette',at:[14,8],dir:'down'}},
  {talk:'Bernadette',lines:['Forty loaves. Six o’clock. On the dot. Potluck committee report: we\'re a success.','The gumbo is hot. The casserole is hot. Everything is hot. I\'d like it noted.']},
  {talk:'TNB',lines:['Noted, Bernadette.']},
  {talk:'Olivia',lines:['Tom. TOM. Nara is eating. Look at her. She\'s EATING.']},
  {talk:'Nara',lines:['Nara is eating bread off Tom’s plate. Tom put it there for her. She knows exactly what she\'s doing.']},
  {talk:'Mr. Washington',lines:['Tom. Come here. This was my daddy’s. He drove the 7 line out of that barn for thirty years. Night run. He swore by the biscuits.','He\'d want it on somebody who went back in there and lit that stove. Here.']},
  {give:'motorcoat'},
  {toast:'New outfit: the Motorman’s Coat. Navy wool, brass buttons, a 7 LINE pin. Anyone can wear it.',time:4.5},
  {talk:'Tom',lines:['...Thank you. I\'ll take very good care of it.']},
  {talk:'Mr. Washington',lines:['I know you will. Now stand up straight. He\'d say that too.']},
  {talk:'Michael',lines:['Lachlan has eaten three rolls and fallen asleep in the bread basket. I\'m leaving him there. He\'s happy.']},
  {talk:'TNB',lines:['You know what tonight was, babe? Toast.']},
  {talk:'Tom',lines:['...']},
  {talk:'TNB',lines:['Because the bread. And we\'re TOASTING. It works on two levels.']},
  {talk:'Tom',lines:['It works on one level. Barely.','...I love that level.']},
  ch4Kiss(),
  {trace:'ch8-wrap'}, {hearts:'tom'},
  {call:()=>{ sfx.ding&&sfx.ding(); }},
  {talk:'Tom',lines:['A text from Deedee. "Honey. A letter came for you at our house. Fancy envelope. Gold wax seal with a little clock on it."','"It says THE MOON CLUB. Nobody gets invited to the Moon Club. I\'ve lived here forty years. I love you to the moon and back. Call me."']},
  {talk:'TNB',lines:['The Moon Club. Babe. That\'s a secret society. I\'ve seen this movie. Several times. It never goes well for the tall one.']},
  {talk:'Tom',lines:['A little clock. On the seal.']},
  {party:null},
  {fade:'out',time:.8}, {card:8,done:true,time:3.4}, {flag:'ch8-done'}, {fade:'in',time:.8},
  {despawn:'Bernadette'},
  {save:true},
  {toast:'Chapter 8 complete! Chapter 9 is still being built. Los Angeles is yours to explore.',time:6}
];
TRIGGERS.push(
  {id:'ch8-arrive',map:'blvd',when:{...CH8,notFlag:'ch8-goal'},scene:'ch8Arrive'},
  {id:'ch8-block',map:'jpark',when:{...CH8,flag:'ch8-goal',notFlag:'ch8-block'},scene:'ch8Block'},
  {id:'ch8-barn',map:'carbarn',when:{...CH8,flag:'ch8-block',notFlag:'ch8-barn'},scene:'ch8Barn'},
  {id:'ch8-paint',map:'carbarn',at:[1,1,12,7],when:{...CH8,flag:'ch8-barn',notFlag:'ch8-paint'},scene:'ch8Paint'},
  {id:'ch8-shop',map:'carbarn',at:[17,1,28,7],when:{...CH8,flag:'ch8-barn',notFlag:'ch8-shop'},scene:'ch8Shop'},
  {id:'ch8-lunch',map:'carbarn',at:[1,13,12,19],when:{...CH8,flag:'ch8-barn',notFlag:'ch8-lunch'},scene:'ch8Lunch'},
  {id:'ch8-boss',map:'boiler',when:{...CH8,flag:'ch8-turn',notFlag:'ch8-boss'},scene:'ch8Boss'},
  {id:'ch8-after',map:'boiler',when:{...CH8,flag:{'battle:ironbelly':'win'},notFlag:'ch8-clear'},scene:'ch8AfterBoss'},
  {id:'ch8-end',map:'jpark',when:{...CH8,flag:'ch8-clear',notFlag:'ch8-done'},scene:'ch8End'}
);
// The barn holds still until the party walks in; each shop's troublemaker holds still until its story fight.
const CH8_SHOP_FLAG={wetblanket:'ch8-paint',thedraft:'ch8-shop',pickyeater:'ch8-lunch'};
HOLD_RULES.push(n=>STORY.chapter===8&&currentMap.id==='carbarn'&&(flag('ch8-barn')!==true||(CH8_SHOP_FLAG[n.monster]&&flag(CH8_SHOP_FLAG[n.monster])!==true)));

// Map changes. They check flags (not events), so they also hold after loading a save.
// The turntable bridge: north-south (Track 3 to Track 1) or east-west (the corridor to Track 4, the Boiler Room).
function ch8SetBridge(east) {
  const M=worlds.carbarn; if(!M||(!!M.ttEast===!!east&&M.ttSet)) return;
  for(const [x,y] of BARN_TT.v) tile(M,x,y,east?'ttpit':'ttbridge',!!east);
  for(const [x,y] of BARN_TT.h) tile(M,x,y,east?'ttbridge':'ttpit',!east);
  M.ttEast=!!east; M.ttSet=true; M.mini=null;
}
const ch8MotorOn=()=>STORY.mode==='full'&&(STORY.chapter>8||(STORY.chapter===8&&!!flag('ch8-motor')));
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  ch8SetBridge(STORY.chapter>8?flag('ch8-tt')!=='north':flag('ch8-tt')==='east');
  // Old Ironbelly stays out of sight until the party walks into the Boiler Room, and settles back into the wall after.
  const b=findMonster('ironbelly'); if(!b) return;
  b.mscale=1.5;
  const under=STORY.chapter<8||(STORY.chapter===8&&!flag('ch8-boss'))||!!flag('ch8-wrap');
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});

// The turntable motor: three burners, three pilot lights.
const ch8MotorReady=()=>STORY.mode==='full'&&STORY.chapter===8&&!!flag('ch8-pilots')&&!flag('ch8-motor');
function ch8Motor(o) {
  if(STORY.mode!=='full'||STORY.chapter!==8||flag('ch8-motor')||!flag('ch8-barn')) return false;
  if(!flag('ch8-pilots')) {
    const n=CH8_SHOPS.filter(k=>flag(k.fight)===true).length;
    openDialog(o.name,['A little steam motor for the turntable. Three empty burners, cold as a mailbox.','TNB: "Three burners, babe. We need three flames. '+(n?'We have '+n+' of 3 pilot lights.':'The shops have them. Paint Shop, Machine Shop, Lunchroom.')+'"']);
    return true;
  }
  playScene('ch8Motor'); return true;
}
// The lever swings the bridge round, either way, once there is steam.
function ch8Lever(o) {
  if(STORY.mode!=='full'||STORY.chapter<8) return false;
  if(!ch8MotorOn()) { openDialog(o.name,['A big iron lever: TURNTABLE. Tom pulls. It won\'t budge.','TNB: "No steam, babe. That motor at the bottom of the corridor runs it."']); return true; }
  const east=!worlds.carbarn.ttEast;
  setFlag('ch8-tt',east?'east':'north'); ch8SetBridge(east); placeFollowers();
  sfx.thud(); sfx.whoosh&&sfx.whoosh();
  if(east&&STORY.chapter===8&&!flag('ch8-turn')) { playScene('ch8Turn'); return true; }
  openDialog('Turntable',[east?'CLANK. The bridge swings round to Track 4: the Boiler Room.':'CLANK. The bridge swings back round: Track 3 at the top, Track 1 at the bottom.']);
  return true;
}
// Nara has not eaten all day: what does Tom give her? (Heart-Trace)
const ch8CanPlate=()=>STORY.mode==='full'&&STORY.chapter===8&&!!flag('ch8-barn')&&!flag('ch8-plate')&&inParty(nara);
const CH8_PLATES=[
  {label:'HER OWN KIBBLE',no:'Nara sniffs the kibble. She looks at Tom like he\'s insulted her family.'},
  {label:'A NICE CARROT',no:'Nara takes the carrot, carries it three steps away, and leaves it there. A message.'},
  {label:'OLIVIA’S LASAGNA',no:'TNB: "Babe. It\'s a brick. A cold brick." Nara agrees with TNB.'},
  {label:'TOM’S OWN SANDWICH',ok:true}];
function ch8Plate(o) {
  if(!ch8CanPlate()) return false;
  openChoice(o.name,['Nara sits next to the table. She hasn\'t eaten all day. She stares at Tom. She stares at the table. She stares at Tom.','What does Tom give her?'],
    CH8_PLATES.map(p=>({label:p.label,fn:()=>{ if(p.ok) playScene('ch8Plate'); else { sfx.nope&&sfx.nope(); openDialog('Nara',[p.no]); } }})));
  return true;
}
function ch8Pail(o) {
  if(STORY.mode!=='full'||STORY.chapter!==8||flag('ch8-pail')) return false;
  playScene('ch8Pail'); return true;
}
const LE_pressAction_ch8=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object') {
      if(v.ttmotor&&ch8Motor(v)) return;
      if(v.ttlever&&ch8Lever(v)) return;
      if(v.plate&&ch8Plate(v)) return;
      if(v.pail&&ch8Pail(v)) return;
    }
  }
  return LE_pressAction_ch8();
};
// The Car Barn is cold (a blue chill, frost at the edges) with little blue pilot lights drifting along the hall toward
// the turntable, until Ironbelly lets them go. The Boiler Room glows. Jefferson Park is a little blue until the feast,
// and on the night of the feast there is a long table down the middle of Jefferson Boulevard.
const CH8_FLAMES=[[2,10],[9,10],[16,11],[19,12],[20,11],[26,15],[7,7],[21,7],[8,19]];
STORY_MAPFX.push(time=>{
  const M=currentMap,id=M.id,c=gfx;
  const cold=STORY.mode==='full'&&STORY.chapter===8&&!flag('ch8-wrap');
  if(id==='carbarn') {
    if(cold) {
      c.globalAlpha=.16; rect(0,0,M.w*T,M.h*T,'#9fd8ff'); c.globalAlpha=1;
      for(let k=0;k<CH8_FLAMES.length;k++) {
        const [fx,fy]=CH8_FLAMES[k],ph=((time*.25+k*.37)%1),tx=(fx+(28-fx)*ph)*T,ty=(fy+(14.5-fy)*ph*ph)*T+Math.sin(time*3+k)*4;
        c.globalAlpha=Math.sin(ph*Math.PI)*.9; ellipse(tx,ty,4,6,'#6cb0ff'); ellipse(tx,ty+1,2,3,'#dff0ff'); c.globalAlpha=1;
      }
    } else if(STORY.mode==='full'&&STORY.chapter>=8) { c.globalAlpha=.06; rect(0,0,M.w*T,M.h*T,'#ffb04a'); c.globalAlpha=1; }
  }
  if(id==='boiler') {
    const f=.12+.05*Math.sin(time*3.3)+.03*Math.sin(time*7.1),g=c.createRadialGradient(9.5*T,4*T,T,9.5*T,4*T,T*9);
    g.addColorStop(0,'rgba(255,140,60,'+(f*2).toFixed(3)+')'); g.addColorStop(1,'rgba(255,140,60,0)');
    c.fillStyle=g; c.fillRect(0,0,M.w*T,M.h*T);
  }
  if(id==='jpark'&&STORY.mode==='full'&&STORY.chapter===8) {
    if(!flag('ch8-clear')) { c.globalAlpha=.08; rect(0,0,M.w*T,M.h*T,'#9fd8ff'); c.globalAlpha=1; }
    if(flag('ch8-feast')&&flag('ch8-done')!==true) {   // the potluck table down Jefferson Boulevard (drawn only; the scene keeps everyone off it)
      const x0=10*T-8,x1=18*T+8,y=9*T+12;
      ellipse((x0+x1)/2,y+26,(x1-x0)/2,5,'#00000040');
      rect(x0,y,x1-x0,22,OUT); rect(x0+1,y+1,x1-x0-2,20,'#f4f0e6');
      for(let k=x0+1;k<x1-1;k+=8) rect(k,y+1,4,20,'#d94a3a40');
      for(const lx of [x0+6,x1-10]) rect(lx,y+20,4,10,OUT);
      for(let k=0;k<9;k++) { const dx=x0+14+k*28; ellipse(dx,y+8,9,5,OUT);
        ellipse(dx,y+8,8,4,['#c98a4a','#e8c84a','#c8463a','#7a4a22','#c98a4a','#6ac06a','#e86a3a','#c98a4a','#f4f0e6'][k]);
        if(k%3===0) { c.globalAlpha=.5; ellipse(dx+Math.sin(time*2+k)*2,y-4-(time*10+k*5)%10,3,4,'#ffffff'); c.globalAlpha=1; } }
    }
  }
});

// Tips for the chapter 8 story fights and Old Ironbelly.
TUTORIALS.ch8blanket={
  setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
  tips:[
    {id:'weak',who:'*',text:'The Wet Blanket is weak to Cozy and Kinetic, and shrugs off Splash. TNB’s Kiln Blast and Tom’s Dutch Oven are Cozy.'},
    {id:'chilled',who:'*',when:()=>b2LiveParty().some(p=>p.st.chilled),text:'Chilled: WARMTH and PEP down, so kind moves and heals go weaker and that person acts later. TNB’s Quick Change (▶) clears it.'},
    {id:'tombo',who:['tom','tnb'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='tnb1'&&!r.why),text:'◀ TOMBO: Popcorn Jump. Cozy, on every enemy.'}]};
TUTORIALS.ch8draft={tips:[
  {id:'dodge',who:'*',text:'The Draft dodges a lot of single hits. Hits on everyone never miss, like Popcorn Jump. It\'s weak to Cozy and Sparkle.'}]};
TUTORIALS.ch8picky={tips:[
  {id:'vp',who:'*',text:'The Picky Eater is tough and steals VP. Chatter and Splash work; it shrugs off Kinetic. Tom’s Starter Splash is Splash.'},
  {id:'kind',who:'nara',dir:'up',text:'Car Barn things love Nara’s Human Eyes and TNB’s moves. A full Warmth bar sends it home happy.'}]};
TUTORIALS.ironbelly={tips:[
  {id:'heat',who:'*',text:'Old Ironbelly heats up every turn: WARM, HOT, HOTTER, BROIL. At BROIL she hits everyone. Splash cools her one step; Cozy stokes her up.'},
  {id:'broil',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='broil'),text:'BROIL is coming! One Splash hit calls it off: Tom’s Starter Splash or Nara’s Happy Puddle.'},
  {id:'bake',who:'*',dir:'down',care:1,text:'Nobody has baked in her since 1963. ▼ Bag, BAKE SOMETHING. It also cools her a step. Three times and she gives up happy.'},
  {id:'furnace',who:['tom','tnb','nara'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>!r.why),text:'FULL FURNACE is coming. Any ◀ TOMBO smashes her guard in one go.'},
  {id:'furnace2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'FULL FURNACE on everyone next turn! Break her guard: 2 Splash or Kinetic hits, or any Tombo.'}]};

// ======================================================================================================
// ======================================================================================================
// CHAPTER 9: The Moon Club Invitation. Sol flies Tom home (storyTripSteps sets chapter 9). A gold-sealed invitation came
// for Tom at the Rivituso house: THE MOON CLUB, tonight, at moonrise, admit three, adults only. It is a full moon, and
// there is no moon. Party: Tom, Deedee and Boppy (locked in by the scene). Grace and Rose stay at the Rivituso house
// with Aunt Ellie, who brought cards. The Moon Club is up the stairs behind Luna's telescope (the MOON building).
// Flags, in story order: ch9-sol (Sol's line), ch9-goal (the girls, in the Square), ch9-letter (the invitation; the
// party), ch9-luna (Luna; the little silver door opens), ch9-club (inside: the thread of moonlight, the empty mirror
// stands), ch9-coat (The Hanger-On), ch9-cards (The Sore Loser), ch9-ball (The Wallflower), ch9-mirrors (all three
// back), ch9-rotA/B/C (1 when a mirror is turned '\'), ch9-dance (optional: the jukebox, Heart-Trace), ch9-door (the
// moonbeam reaches the lock; the Dome opens), ch9-boss, battle:mirrorball ('win'), ch9-clear (the moon goes home; the
// coin), ch9-done (the Rivituso house).
// ======================================================================================================
const CH9={mode:'full',chapter:9};
const CH9_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'Deedee',lines:['Okay, everybody up. Deedee is a nurse. Up, up. Little sip of water. Good.']}],else:[]},
  ...lines
];
// What each troublemaker had: one of the club's three mirrors. All three: point the moonlight at the Dome.
const ch9MirrorSteps=c=>{ const M=CLUB_MIRRORS.find(k=>k.fight==='ch9-'+c); return [
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['A round mirror in a brass frame. It says MIRROR '+('ABC'.indexOf(M.m)+1)+' on the back. It goes on a stand in the hall.']},
  {call:()=>{ sfx.levelChime(); storyWorld(); }},
  {toast:'Mirror '+CLUB_MIRRORS.filter(k=>flag(k.fight)===true).length+' of 3 is back on its stand in the hall.',time:3.5},
  {if:()=>CLUB_MIRRORS.every(k=>flag(k.fight)===true),then:[
    {flag:'ch9-mirrors'}, {wait:3.7},
    {talk:'Boppy',lines:['Three mirrors. Three stands. One little moonbeam. I didn\'t drive a car for forty years without learning about mirrors.']},
    {talk:'Deedee',lines:['You drove into the mailbox twice, honey.']},
    {talk:'Boppy',lines:['The mailbox moved.']},
    {toast:'Goal: turn the three mirror stands in the hall (A turns one) until the moonbeam reaches the Dome doors.',time:5.5}],else:[]}]; };

// 1. The Square, right after the girls' welcome: Deedee has a letter.
SCENES.ch9Arrive=[
  {flag:'ch9-goal'},
  {talk:'Grace',lines:['Tata. TATA. Deedee has a LETTER for you. It\'s GOLD. She won\'t let us open it.','She let us hold it. For one second. Then she took it back and said, careful, that\'s wax.']},
  {talk:'Rose',lines:['It smells like a candle. I licked it a little.']},
  {talk:'Tom',lines:['You licked my mail.']},
  {talk:'Rose',lines:['A LITTLE.']},
  {talk:'Grace',lines:['Also the moon is gone. Look. It\'s supposed to be a full moon. Luna said so. Luna is very upset.']},
  {talk:'Tom',lines:['...There\'s no moon.','There\'s no moon, and I have a gold letter. Okay.']},
  {trace:'girls-letter'}, {hearts:'grace'},
  {toast:'Goal: Deedee and Boppy’s house (RIVITUSO), on Rivituso Row, south of the Square.',time:4.5}
];
// 2. The Rivituso house: the invitation. The party.
SCENES.ch9Letter=[
  {flag:'ch9-letter',value:'pending'},
  {walk:'Deedee',to:routeBeside('Deedee'),speed:.2},
  {talk:'Deedee',lines:['Tommy! There you are. Sit. No, stand. Read it. Read it out loud. I have read it eleven times.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['\"THE MOON CLUB requests the pleasure of TOM. Tonight, at moonrise. Admit three. Adults only. Dress: your very best.\"','Gold wax seal. A little clock on it.']},
  {talk:'Grace',lines:['ADULTS ONLY? I\'m basically an adult. I have a YouTube channel. I have a SKINCARE ROUTINE.']},
  {talk:'Rose',lines:['I\'m six. Is six adults?']},
  {talk:'Aunt Ellie',lines:['Girls. You\'re staying with me. I brought cards. I cheat. You\'ll learn a great deal.']},
  {talk:'Deedee',lines:['Forty years I\'ve lived in this town. Every full moon, the lights used to go on in that dome above Luna’s. Nobody I know has ever been invited. Not once.','Admit three, Tommy. You. Me. And Boppy.']},
  {talk:'Boppy',lines:['I\'m not wearing a tie.']},
  {talk:'Deedee',lines:['You\'re wearing the tie.']},
  {talk:'Boppy',lines:['...I\'m wearing the tie.']},
  {talk:'Aunt Ellie',lines:['The Moon Club. I haven\'t heard that name since 1971.']},
  {talk:'Tom',lines:['You went?']},
  {talk:'Aunt Ellie',lines:['Darling, I went to everything. The last dance. A big silver ball turned all night. Then they locked the doors and nobody ever said why.','I left a coat there. Purple velvet. I was in a hurry.']},
  {talk:'Deedee',lines:['And now the moon is missing. Three nights. I power walk at nine. I walked straight into the Hendersons’ hedge.']},
  {talk:'Tom',lines:['A missing moon, a locked club, and a little gold clock. Everybody get your shoes.']},
  {leave:'grace'}, {call:()=>{ ch9GirlsMove(); sfx.doorOut(); }},
  {join:'deedee',quiet:true}, {join:'boppy',quiet:true},
  {party:{lock:['tom','deedee','boppy'],bar:['grace','rose'],allow:['deedee','boppy']}},
  {trace:'deedee-invite'}, {hearts:'tom'}, {call:()=>sfx.levelChime()},
  {toast:'Deedee and Boppy join the party. Grace and Rose stay with Aunt Ellie.',time:3.5},
  {flag:'ch9-letter'},
  {toast:'Goal: the Moon Club. Luna’s observatory (MOON) in the Square.',time:4.5}
];
// 3. Luna's observatory: the little silver door.
SCENES.ch9Luna=[
  {flag:'ch9-luna',value:'pending'},
  {walk:'Luna',to:routeBeside('Luna'),speed:.25},
  {talk:'Luna',lines:['Oh! Visitors. At night. Is that... is that an INVITATION?']},
  {talk:'Tom',lines:['The Moon Club. Tonight. Admit three.']},
  {talk:'Luna',lines:['Twelve years I have swept this floor. That little silver door in the back has never once opened. I thought it was a closet.','And my telescope can\'t find the moon. It\'s not behind a cloud. It\'s not anywhere. It\'s just GONE.']},
  {talk:'Deedee',lines:['Honey, show her the seal.']},
  {call:()=>{ sfx.thud(); sfx.doorIn&&sfx.doorIn(); }},
  {talk:'Little silver door',lines:['Tom holds up the invitation. The brass moon on the little door clicks, and the door swings open by itself.']},
  {talk:'Luna',lines:['...It wasn\'t a closet.']},
  {talk:'Boppy',lines:['Stairs. Of course it\'s stairs. Nobody take them fast.']},
  {flag:'ch9-luna'},
  {toast:'Goal: up the stairs, through the little silver door (back right of the observatory).',time:4.5}
];
// 4. The Moon Club: dust since 1971, one thread of moonlight, three empty mirror stands.
SCENES.ch9Club=[
  {flag:'ch9-club',value:'pending'},
  {talk:'Deedee',lines:['Oh. Oh, Tommy. It\'s beautiful.','It\'s FILTHY. Fifty years of dust. Somebody hand me a mop.']},
  {talk:'Boppy',lines:['Nobody is here. A party and nobody is here.']},
  {talk:'Tom',lines:['Look at the east window. Moonlight. Just a thread of it.','The moon isn\'t gone. Something up in the Dome is pulling all of its light inside. Only a little gets out.']},
  {talk:'Deedee',lines:['Somebody read me that plaque. My glasses are in my other purse.']},
  {talk:'Boppy',lines:['You\'re wearing them, Dee.']},
  {talk:'Deedee',lines:['Oh. So I am. Well then.']},
  {talk:'Deedee',lines:['The plaque says MEMBERS ARE ADMITTED BY MOONLIGHT. And look, three little brass stands. Somebody took the mirrors.']},
  {talk:'Boppy',lines:['A coat check, a card room, a ballroom. Three rooms. Three stands. I count three suspects.','Assistant Deputy Warden. Rikers. I know what a lineup looks like.']},
  {trace:'grands-club'}, {hearts:'deedee'},
  {flag:'ch9-club'},
  {toast:'Goal: find the three mirrors. Coat Check (top left), Card Room (top right), Ballroom (bottom).',time:5.5},
  {toast:'Tip: the Ballroom has a jukebox. Somebody here hasn\'t danced in a while.',time:4}
];
// 5. The three rooms. A troublemaker in each one, holding a mirror.
SCENES.ch9Coat=[
  {flag:'ch9-coat',value:'pending'},
  {walk:'The Hanger-On',to:routeBeside('The Hanger-On'),speed:.25},
  {talk:'The Hanger-On',lines:['Ticket? Do you have a ticket? I\'m holding this coat for ticket seven. She said she\'d be right back.','That was 1971. I haven\'t let go once. I\'m VERY good at hanging on.']},
  {talk:'Deedee',lines:['Purple velvet. Tommy. That\'s Aunt Ellie’s coat.']},
  {talk:'Tom',lines:['And our mirror is hanging off your other shoulder.']},
  {talk:'The Hanger-On',lines:['Nobody gets anything without a ticket.']},
  {battle:'coathanger',tut:'ch9coat'},
  ...CH9_AFTER(()=>flag('battle:coathanger')!=='win',[
    {flag:'ch9-coat'},
    {talk:'The Hanger-On',lines:['...Okay. Okay. You can take it to her. Tell her I held on the whole time.']},
    {talk:'Deedee',lines:['We\'ll tell her, honey. She\'ll be so pleased. She\'ll pretend not to be. That\'s how you know.']},
    ...ch9MirrorSteps('coat')])
];
SCENES.ch9Cards=[
  {flag:'ch9-cards',value:'pending'},
  {walk:'The Sore Loser',to:routeBeside('The Sore Loser'),speed:.25},
  {talk:'The Sore Loser',lines:['Deal me in. No. Wait. Don\'t deal me in. You\'re cheating. Everybody is cheating. The MIRROR is cheating.']},
  {talk:'Boppy',lines:['Gin rummy with Deedee, fifty years. I\'ve never won a hand. Not one. I know a sore loser when I see one.']},
  {talk:'Deedee',lines:['You ARE a sore loser, honey.']},
  {talk:'Boppy',lines:['I\'m a sore WINNER. Who hasn\'t won yet.']},
  {battle:'soreloser',tut:'ch9cards'},
  ...CH9_AFTER(()=>flag('battle:soreloser')!=='win',[
    {flag:'ch9-cards'},
    {talk:'The Sore Loser',lines:['...Best two out of three?']},
    {talk:'Boppy',lines:['Sunday. My house. Bring your own deck. You\'ll lose. I\'ll lose too. We can lose together.']},
    {talk:'Deedee',lines:['Look at you. Making a friend.']},
    {trace:'boppy-cards'}, {hearts:'boppy'},
    ...ch9MirrorSteps('cards')])
];
SCENES.ch9Ball=[
  {flag:'ch9-ball',value:'pending'},
  {walk:'The Wallflower',to:routeBeside('The Wallflower'),speed:.15},
  {talk:'The Wallflower',lines:['Oh. Oh no. People. Don\'t look at me. I\'m just here. With the wall. And this mirror. Which I\'m hiding behind.']},
  {talk:'Deedee',lines:['Oh, sweetheart. Nobody asked you to dance, did they?']},
  {talk:'The Wallflower',lines:['Every song, 1924 to 1971. I stood right here. Nobody. Ever.']},
  {talk:'Tom',lines:['Then we\'ll ask. Nicely. After you give us the mirror.']},
  {battle:'wallflower',tut:'ch9ball'},
  ...CH9_AFTER(()=>flag('battle:wallflower')!=='win',[
    {flag:'ch9-ball'},
    {talk:'The Wallflower',lines:['...You were very nice about it. For a fight. Here. The mirror. It was the big one, over the bandstand, before she came.']},
    {talk:'Tom',lines:['She?']},
    {talk:'The Wallflower',lines:['The Mirrorball. Up in the Dome. She hasn\'t stopped spinning in three nights.']},
    ...ch9MirrorSteps('ball')])
];
// 6. Optional: the jukebox. Which record for Deedee and Boppy? (data in ch9Jukebox below).
SCENES.ch9Dance=[
  {flag:'ch9-dance'},
  {call:()=>sfx.levelChime()},
  {talk:'Boppy',lines:['A slow one. My stomach gets one song. One. Deedee. May I.']},
  {talk:'Deedee',lines:['Fifty-two years, and he still asks. Every time.']},
  {talk:'Ballroom',lines:['They dance across the dusty floor, slow and small and very close. Boppy doesn\'t mention his stomach once.']},
  {hearts:'deedee'}, {hearts:'boppy'}, {trace:'grands-dance'},
  {talk:'Tom',lines:['(Tom doesn\'t take a picture. Tom takes four pictures.)']},
  {heal:true},
  {toast:'Everyone is healed. Deedee and Boppy had one song.',time:3.5}
];
// 7. The moonbeam reaches the lock: the Dome doors open.
SCENES.ch9Door=[
  {flag:'ch9-door'},
  {call:()=>{ sfx.levelChime(); }}, {wait:.8},
  {talk:'Dome doors',lines:['The thread of moonlight bounces off three mirrors and lands right in the middle of the moon-shaped lock. It glows. Click. CLUNK.']},
  {call:()=>{ ch9OpenDoors(); storyWorld(); sfx.doorIn&&sfx.doorIn(); }},
  {talk:'Deedee',lines:['Admitted by moonlight. Oh, I have goosebumps. Tommy, feel my arm.']},
  {talk:'Boppy',lines:['Somebody up there is playing music. Very loud music. In 1971 they called that a nuisance.']},
  {toast:'Goal: the Dome.',time:4}
];
// 8. The Dome: the Mirrorball, full of the moon. Boss fight.
SCENES.ch9Boss=[
  {flag:'ch9-boss'}, {call:()=>storyWorld()},
  {hide:'The Mirrorball'},
  {walk:'tom',to:routeTo('tom',9,7),speed:.25}, {face:'tom',dir:'up'},
  {place:'deedee',at:[8,7],dir:'up'}, {place:'boppy',at:[10,7],dir:'up'},
  {talk:'Deedee',lines:['Tommy. Over the bandstand. It\'s so BRIGHT. I can\'t look at it. I\'m looking at it.']},
  {call:()=>{ sfx.whoosh(); sfx.ding&&sfx.ding(); }},
  {show:'The Mirrorball'}, {face:'The Mirrorball',dir:'down'},
  {talk:'The Mirrorball',lines:['Guests! GUESTS! Oh, at last. Welcome to the Moon Club. Nobody has come up those stairs since 1971.',
    'Every full moon, they danced under me. Then the last dance. The band said see you next moon. Nobody came back.']},
  {talk:'Tom',lines:['So you took the moon.']},
  {talk:'The Mirrorball',lines:['I CAUGHT it. All of it. Every bit of moonlight, right here in me.','If I\'m the brightest thing in the whole sky, somebody will HAVE to come dance. And look. Somebody did.']},
  {talk:'Deedee',lines:['Honey, there\'s a whole town walking into hedges down there.']},
  {talk:'The Mirrorball',lines:['Then they can come UP. One more dance. Just one. Everybody, under me, forever.']},
  {talk:'Boppy',lines:['Forever is a lot of dancing. And everybody dances too fast.']},
  {talk:'Tom',lines:['Deedee, Boppy, behind me. No touching, please.']},
  {battle:'mirrorball',tut:'mirrorball'},
  {if:()=>flag('battle:mirrorball')!=='win',then:[
    {heal:true},
    {talk:'Deedee',lines:['Up, everybody. Deedee is a nurse.','Tommy, whatever her shiny side shows bounces right back. Use something else. And honey, nobody has asked her to dance since 1971. Three times.']},
    {toast:'Face the Mirrorball and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 9. After the boss (won in the scene, or on a retry with A): the moon goes home. A compact, a coin, a boarding pass.
SCENES.ch9AfterBoss=()=>[
  {flag:'ch9-clear'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  ...(flag('kind:mirrorball')?[
    {talk:'The Mirrorball',lines:['...You asked me. Three times. Nobody has asked me to dance since 1971.','I don\'t need the moon. I just needed somebody to ASK.']}]:[
    {talk:'The Mirrorball',lines:['...Fine. The party is over. It was over in 1971. I just didn\'t want to be the one to turn off the lights.']},
    {talk:'Deedee',lines:['Oh, honey. Nobody has to turn off the lights. We\'ll come back. Every full moon. I\'ll bring crisp.']}]),
  {call:()=>{ storyWorld(); sfx.whoosh(); }},
  {talk:'The Dome',lines:['The Mirrorball turns once, slowly, and lets go. A great round light rises out of her, up through the glass, and settles in the sky. The moon. Right where it belongs.']},
  {talk:'The Mirrorball',lines:['One dance. Before you go. Somebody. Please.']},
  {talk:'Deedee',lines:['Tommy. Dance with your mother.']},
  {talk:'Tom',lines:['I mostly sway.']},
  {talk:'Deedee',lines:['Then sway with your mother.']},
  {talk:'The Dome',lines:['Tom and Deedee sway under the Mirrorball, and a thousand little moons go round and round the Dome. Boppy keeps time on the bass drum. Badly. Proudly.']},
  {hearts:'tom'}, {hearts:'deedee'}, {trace:'tom-deedee-dance'},
  {talk:'The Mirrorball',lines:['Here. One of my little mirrors. For the lady who said she\'d come back. So you can carry a bit of the moon home.']},
  {give:'d_compact'},
  {toast:'Deedee gets a new Signature Tool: the Moonlit Compact (POW +5, WARMTH +8). Equip it in the menu.',time:4.5},
  {talk:'Boppy',lines:['Something fell out of her top. On the bandstand. Something gold.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['A gold coin. Same little clock face.','The sundial. The steamer. The sign-up sheet. My jar. The book from 1952. The oven from 1963. Now a mirrorball from 1971.']},
  {talk:'Deedee',lines:['Somebody invited you up here, Tommy. Not her. She can\'t hold a pen. She\'s a ball.','Somebody who knew you\'d come. And that you\'d bring your mother.']},
  {talk:'Tom',lines:['Somebody with a little clock. I\'m adding it to the list.']},
  {toast:'Goal: back to the Rivituso house. Aunt Ellie and the girls are waiting up.',time:4.5}
];
// 10. The Rivituso house: the moon is back. Ellie's coat. A boarding pass. Chapter complete.
SCENES.ch9End=[
  {flag:'ch9-done',value:'pending'},
  {call:()=>ch9GirlsMove()},
  {talk:'Grace',lines:['TATA! The MOON came back! We saw it from the window! Aunt Ellie said it was probably you.']},
  {talk:'Rose',lines:['I won at cards. I cheated. Aunt Ellie said I\'m a natural.']},
  {talk:'Aunt Ellie',lines:['She is. It\'s frightening. Well? Was there a ball?']},
  {talk:'Deedee',lines:['Ellie. There was a BALL. A big silver one. She remembered you. And look what we brought home.']},
  {talk:'Aunt Ellie',lines:['...My coat. Ticket seven.','I left it at the last dance. I was in a hurry. I had a date with a man who turned out to be a disappointment. The coat wasn\'t.']},
  {talk:'Aunt Ellie',lines:['It hasn\'t fit me since 1972. Keep it, Tom. Somebody in this family should wear velvet properly.']},
  {give:'velvetcoat'},
  {toast:'New outfit: the Moon Club Velvet Coat. Purple velvet, 1971. Anyone can wear it.',time:4.5},
  {talk:'Boppy',lines:['I wore the tie. Everybody saw. Nobody can say I didn\'t wear the tie.']},
  {talk:'Deedee',lines:['Tommy, there was something else in the envelope. Stuck to the bottom. I didn\'t see it. I read it eleven times and I didn\'t see it.']},
  {talk:'Boppy',lines:['Eleven times. Without her glasses. Eleven.']},
  {talk:'Deedee',lines:['I couldn\'t FIND them, honey.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['A boarding pass. \"BOARDING GROUP 0. FROM: LONG ISLAND. TO: NOWHERE. GATE: TO BE ANNOUNCED.\" And a little gold clock.','There\'s no boarding group zero. I have flown Delta One forty times. I\'d know.']},
  {talk:'Grace',lines:['Tata. Somebody wants you to go on a TRIP.']},
  {talk:'Rose',lines:['Can I come? I\'ll be good. I\'ll be medium good.']},
  {trace:'ch9-wrap'}, {hearts:'deedee'}, {call:()=>sfx.levelChime()},
  {leave:'boppy'}, {leave:'deedee'}, {party:null},
  {call:()=>ch9GirlsBack()}, {join:'grace'},
  {fade:'out',time:.8}, {card:9,done:true,time:3.4}, {flag:'ch9-done'}, {fade:'in',time:.8},
  {save:true},
  {toast:'Chapter 9 complete! When you\'re ready, Sal at Long Island Taxi Co. (the Square) has a ride for chapter 10.',time:6}
];
TRIGGERS.push(
  {id:'ch9-goal',map:'town',when:{...CH9,notFlag:'ch9-goal'},scene:'ch9Arrive'},
  {id:'ch9-letter',map:'grands',when:{...CH9,flag:'ch9-goal',notFlag:'ch9-letter'},scene:'ch9Letter'},
  {id:'ch9-luna',map:'observatory',when:{...CH9,flag:'ch9-letter',notFlag:'ch9-luna'},scene:'ch9Luna'},
  {id:'ch9-club',map:'moonclub',when:{...CH9,flag:'ch9-luna',notFlag:'ch9-club'},scene:'ch9Club'},
  {id:'ch9-coat',map:'moonclub',at:[1,1,12,7],when:{...CH9,flag:'ch9-club',notFlag:'ch9-coat'},scene:'ch9Coat'},
  {id:'ch9-cards',map:'moonclub',at:[17,1,28,7],when:{...CH9,flag:'ch9-club',notFlag:'ch9-cards'},scene:'ch9Cards'},
  {id:'ch9-ball',map:'moonclub',at:[8,13,21,19],when:{...CH9,flag:'ch9-club',notFlag:'ch9-ball'},scene:'ch9Ball'},
  {id:'ch9-boss',map:'dome',when:{...CH9,flag:'ch9-door',notFlag:'ch9-boss'},scene:'ch9Boss'},
  {id:'ch9-after',map:'dome',when:{...CH9,flag:{'battle:mirrorball':'win'},notFlag:'ch9-clear'},scene:'ch9AfterBoss'},
  {id:'ch9-end',map:'grands',when:{...CH9,flag:'ch9-clear',notFlag:'ch9-done'},scene:'ch9End'}
);
// The club holds still until the party has looked around; each room's troublemaker holds still until its story fight.
const CH9_ROOM_FLAG={coathanger:'ch9-coat',soreloser:'ch9-cards',wallflower:'ch9-ball'};
HOLD_RULES.push(n=>STORY.chapter===9&&currentMap.id==='moonclub'&&(flag('ch9-club')!==true||(CH9_ROOM_FLAG[n.monster]&&flag(CH9_ROOM_FLAG[n.monster])!==true)));

// Grace and Rose spend chapter 9 at the Rivituso house with Aunt Ellie (engine/travel.js puts girls who are away at
// the Gregori house; this moves them across, and back again at the end).
const CH9_GIRL_LINES={Grace:['Aunt Ellie is teaching us cards. She says the first rule of cards is never trust anyone who says they don\'t cheat.','When I\'m an adult I\'m going to the Moon Club EVERY night. With a fan. A big one.'],
  Rose:['I\'m winning. I don\'t know the rules. I\'m still winning.','Tata, bring me back a piece of the moon. A small one. For my room.']};
function ch9GirlsMove() {
  const from=worlds.amyhouse,to=worlds.grands; if(!from||!to) return;
  for(const n of from.npcs.filter(n=>n.girlAtHome)) {
    from.npcs.splice(from.npcs.indexOf(n),1);
    if(!to.npcs.some(m=>m.girlAtHome&&m.name===n.name)) { n.x=n.name==='Grace'?5:7; n.y=4; n.move=null; n.path=[]; n.lines=CH9_GIRL_LINES[n.name]||n.lines; n.visitedOnce=false; to.npcs.push(n); }
  }
}
function ch9GirlsBack() {
  const to=worlds.grands; if(!to) return;
  for(let i=to.npcs.length-1;i>=0;i--) if(to.npcs[i].girlAtHome) to.npcs.splice(i,1);
}
// Map changes. They check flags (not events), so they also hold after loading a save.
// The Dome doors (top of the club hall) open once the moonbeam reaches their lock.
function ch9OpenDoors() {
  const M=worlds.moonclub; if(!M||M.doorsOpen) return;
  const o=M.objects.find(o=>o.kind==='clubdoors');
  const dy=o?o.y:2;   // the Dome doors sit on row 2 of the painted hall
  if(o) { M.objects.splice(M.objects.indexOf(o),1); for(const x of [14,15]) M.objectAt.delete(key(x,dy)); }
  for(const x of [14,15]) tile(M,x,dy,'marble');
  M.doorsOpen=true; M.mini=null;
}
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  if(flag('ch9-door')||STORY.chapter>9) ch9OpenDoors();
  if(STORY.chapter===9&&flag('ch9-letter')&&flag('ch9-done')!==true&&!party.includes(grace)) ch9GirlsMove();
  else if(party.includes(grace)) ch9GirlsBack();
  // The Mirrorball stays out of sight until the party walks into the Dome, and hangs there quietly after.
  const b=findMonster('mirrorball'); if(!b) return;
  b.mscale=1.5;
  const under=STORY.chapter<9||(STORY.chapter===9&&!flag('ch9-boss'))||!!flag('ch9-clear');
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});

// The little silver door in Luna's observatory goes up to the Moon Club once it has opened (and after chapter 9).
function ch9ClubDoor(o) {
  if(STORY.mode!=='full'||!(STORY.chapter>9||(STORY.chapter===9&&flag('ch9-luna')))) return false;
  beginTransition({kind:'edge',to:'moonclub',spawn:{x:1,y:10},facing:'right'});
  return true;
}
// A mirror stand: empty until its room's troublemaker gives the mirror back; then A turns it a quarter turn.
function ch9Mirror(o) {
  if(STORY.mode!=='full'||STORY.chapter<9||!flag('ch9-club')) return false;
  const M=CLUB_MIRRORS.find(m=>m.m===o.mirror); if(!M) return false;
  if(!clubMirrorBack(M)) {
    const n=CLUB_MIRRORS.filter(k=>flag(k.fight)===true).length;
    openDialog(o.name,['An empty brass stand on a swivel. MIRROR '+('ABC'.indexOf(M.m)+1)+' OF 3.','Boppy: \"'+(n?n+' of 3 back. ':'')+'Somebody in '+M.from+' has this one. I can feel it in my stomach.\"']);
    return true;
  }
  setFlag('ch9-rot'+M.m,clubRot(M)?0:1); worlds.moonclub.mini=null;
  sfx.select&&sfx.select(); sfx.whoosh&&sfx.whoosh();
  if(STORY.chapter===9&&!flag('ch9-door')&&clubBeam().hit) { playScene('ch9Door'); return true; }
  showToast('Click. The mirror turns. '+(clubRot(M)?'Now it leans like \\':'Now it leans like /')+'.',1.8);
  return true;
}
// The Dome doors' moon lock, before the moonbeam reaches it.
function ch9DomeLock(o) {
  if(STORY.mode!=='full'||STORY.chapter!==9||flag('ch9-door')||!flag('ch9-club')) return false;
  const n=CLUB_MIRRORS.filter(k=>flag(k.fight)===true).length;
  openDialog(o.name,['A lock shaped like a full moon. It\'s cold and dark. The plaque says MEMBERS ARE ADMITTED BY MOONLIGHT.',
    'Deedee: \"'+(n>=3?'All three mirrors are back, honey. Bounce that little moonbeam up here.':'We need the mirrors, Tommy. '+n+' of 3 so far.')+'\"']);
  return true;
}
// The jukebox: which record for Deedee and Boppy? (Heart-Trace)
const CH9_RECORDS=[
  {label:'SOMETHING FAST',no:'Boppy: \"Fast? I was a champion runner. I\'m not a champion dancer. The stomach has spoken.\"'},
  {label:'THE CHICKEN DANCE',no:'Deedee does the chicken dance alone, with total commitment. Boppy claps. Nobody else is allowed to talk about it.'},
  {label:'A POLKA',no:'Boppy: \"A polka is just running in a circle. I didn\'t retire to run in a circle.\"'},
  {label:'A SLOW ONE',ok:true}];
function ch9Jukebox(o) {
  if(STORY.mode!=='full'||STORY.chapter!==9||!flag('ch9-club')||flag('ch9-dance')||!inParty(deedee)||!inParty(boppy)) return false;
  openChoice(o.name,['The jukebox glows pink, then blue, then gold. Deedee is looking at Boppy. Boppy is looking at his shoes.','Which record does Tom put on?'],
    CH9_RECORDS.map(r=>({label:r.label,fn:()=>{ if(r.ok) playScene('ch9Dance'); else { sfx.nope&&sfx.nope(); openDialog('Jukebox',[r.no]); } }})));
  return true;
}
const LE_pressAction_ch9=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object') {
      if(v.club&&ch9ClubDoor(v)) return;
      if(v.mirror&&ch9Mirror(v)) return;
      if(v.domelock&&ch9DomeLock(v)) return;
      if(v.jukebox&&ch9Jukebox(v)) return;
    }
  }
  return LE_pressAction_ch9();
};
// Chapter 9 is one long night. Long Island is dark, with stars and no moon until the Mirrorball lets it go. The
// Moon Club is dim (lamp light round Tom), the moonbeam is drawn from the east window, and the Dome glitters.
const CH9_NIGHT_MAPS=['town','row'];
STORY_MAPFX.push(time=>{
  const M=currentMap,id=M.id,c=gfx,night=STORY.mode==='full'&&STORY.chapter===9&&flag('ch9-done')!==true;
  const glow=(x,y,r,a,col='255,214,140')=>{ const g=c.createRadialGradient(x,y,2,x,y,r); g.addColorStop(0,'rgba('+col+','+a+')'); g.addColorStop(1,'rgba('+col+',0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); };
  if(night&&CH9_NIGHT_MAPS.includes(id)) {
    const moon=!!flag('ch9-clear');
    c.globalCompositeOperation='multiply'; rect(-T,-3*T,(M.w+2)*T,(M.h+4)*T,moon?'#7a84c0':'#4a5498'); c.globalCompositeOperation='source-over';
    c.globalCompositeOperation='lighter';
    for(const h of M.houses||[]) if(h.door) glow((h.door.x+.5)*T,(h.door.y+.6)*T,T*2.2,.28);
    const p=position(player); glow((p.x+.5)*T,(p.y+.5)*T,T*2.6,.14);
    c.globalCompositeOperation='source-over';
    for(let k=0;k<14;k++) { const n=hash(k,91); if((Math.floor(time*1.5)+k)%7===0) continue; rect(n%(M.w*T),(n>>>9)%(3*T),2,2,'#fff6c0'); }
    if(moon) { const mx=(M.w-5)*T,my=T*1.2; glow(mx,my,T*2.5,.25,'255,248,216'); ellipse(mx,my,12,12,'#fff8d8'); ellipse(mx-4,my-3,3,3,'#e8e0c0'); }
  }
  if(id==='moonclub') {
    const p=position(player),px=(p.x+.5)*T,py=(p.y+.5)*T;
    const g=c.createRadialGradient(px,py,T*3,px,py,T*9); g.addColorStop(0,'rgba(10,10,30,0)'); g.addColorStop(1,'rgba(10,10,30,'+(clubMoonBack()?.25:.5)+')');
    c.fillStyle=g; c.fillRect(0,0,M.w*T,M.h*T);
    // the round window at the east end of the hall
    const wx=29*T+T/2,wy=11*T+T/2; ellipse(wx,wy-4,12,12,OUT); ellipse(wx,wy-4,10,10,clubMoonBack()?'#fff8d8':'#8a94c8'); rect(wx-1,wy-14,2,20,OUT); rect(wx-10,wy-5,20,2,OUT);
    if(STORY.mode==='full'&&STORY.chapter>=9&&flag('ch9-club')) {
      const B=clubBeam(M),a=(clubMoonBack()?.75:.5)+.15*Math.sin(time*4);
      c.save(); c.lineCap='round';
      for(const [lw,col,al] of [[10,'#9fb4ff',a*.3],[4,'#e8f0ff',a],[1.5,'#ffffff',a]]) {
        c.globalAlpha=al; c.strokeStyle=col; c.lineWidth=lw; c.beginPath();
        B.pts.forEach(([x,y],i)=>i?c.lineTo(x*T,y*T):c.moveTo(x*T,y*T)); c.stroke(); }
      c.restore(); c.globalAlpha=1;
      if(B.hit) glow(14.5*T,1.6*T,T*2,.35,'255,248,216');
    }
  }
  if(id==='dome') {
    const moon=clubMoonBack();
    // The painted Dome (art/dome.webp) already has its own night; only the old tile version needs the dark wash.
    if(!plateFor(M)) { c.globalAlpha=moon?.12:.22; rect(0,0,M.w*T,M.h*T,'#0c1024'); c.globalAlpha=1; }
    for(let k=0;k<16;k++) { const a=time*.6+k*.39,x=9.5*T+Math.cos(a)*T*(4+k%5),y=6*T+Math.sin(a*1.3)*T*(2+k%3);
      c.globalAlpha=moon?.25:.55; ellipse(x,y,3,2,'#dfe6f2'); }
    c.globalAlpha=1;
    if(!moon&&STORY.chapter===9&&flag('ch9-boss')) glow(9.5*T,(plateFor(M)?4.2:3)*T,T*5,.35,'230,240,255');
  }
});

// Tips for the chapter 9 story fights and the Mirrorball.
TUTORIALS.ch9coat={
  setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
  tips:[
    {id:'weak',who:'*',text:'The Hanger-On is weak to Kinetic and Splash, and shrugs off Cozy. Boppy’s Patient Angler and Tom’s Starter Splash are Splash.'},
    {id:'snub',who:'*',when:()=>b2LiveParty().some(p=>p.st.snubbed),text:'Snubbed: WARMTH and COOL down, so kind moves and heals go weaker. Deedee’s Registered Nut (▶) clears it.'},
    {id:'tombo',who:['tom','deedee'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='deedee1'&&!r.why),text:'◀ TOMBO: Wine and Gossip. A big party heal, and Warm Crusts on the tray.'}]};
TUTORIALS.ch9cards={tips:[
  {id:'vp',who:'*',text:'The Sore Loser steals VP and shrugs off Chatter. Cozy and Sparkle work. Boppy’s Pepper Breath is Cozy.'},
  {id:'tombo',who:['tom','boppy'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='boppy1'&&!r.why),text:'◀ TOMBO: You Hold the Net. Splash on every enemy, and they all hit softer.'}]};
TUTORIALS.ch9ball={tips:[
  {id:'dodge',who:'*',text:'The Wallflower dodges a lot of single hits. Hits on everyone never miss, like Deedee’s To the Moon & Back.'},
  {id:'kind',who:'deedee',dir:'right',text:'Moon Club things love Deedee’s MOON & BACK (▶). A full Warmth bar sends it home happy.'}]};
TUTORIALS.mirrorball={tips:[
  {id:'mirror',who:'*',text:'MIRROR SIDE: hits of that element bounce back at whoever used it. She turns a new side every turn. The message says which. Tombos never bounce.'},
  {id:'solo',who:'tom',dir:'right',when:()=>B2.foes.some(f=>f.boss&&f.intent&&f.intent.kind==='lock'&&b2Alive(f.intent.target)&&f.intent.target.id!=='tom'&&!f.intent.target.st.guarded),
    text:'SPOTLIGHT: a SOLO is coming for someone. ▶ DEFEND, then pick them: Tom takes it instead.'},
  {id:'dance',who:'*',dir:'down',care:1,text:'Nobody has asked her to dance since 1971. ▼ Bag, ASK HER TO DANCE. Three times and she gives up happy.'},
  {id:'last',who:['tom','deedee','boppy'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>!r.why),text:'LAST DANCE is coming. Any ◀ TOMBO smashes her guard in one go.'},
  {id:'last2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'LAST DANCE on everyone next turn! Break her guard: 2 Chatter or Kinetic hits, or any Tombo.'}]};

// ======================================================================================================
// ======================================================================================================
// CHAPTER 10: Boarding Group Zero (the Part 1 finale). After chapter 9, every clock on Long Island stops at
// midnight. Sal has a boarding pass on his dashboard too: BOARDING GROUP 0, the same as Tom's. Long Island Regional has
// four gates and one door nobody uses: Terminal Zero, closed since 1989. Last night its lights came on. Sal drives Tom
// and the girls there; Amy joins at the cab (locked in by the scene). Deedee starts Sunday dinner; Boppy rests.
// Flags, in story order: ch10-start (Sal's ride; the chapter card; Amy joins), ch10-term (Terminal Zero: the PA, the
// gate clock with no hands), ch10-sec (The Long Line: the hour hand), ch10-bag (The Unclaimed: the minute hand),
// ch10-lounge (The Armrest Hog: the second hand), ch10-hands (all three back), ch10-photo (optional: the photo booth,
// Heart-Trace), ch10-fails (wrong coin orders, for Grace's hints), ch10-door (seven coins in order; Gate Zero opens),
// ch10-boss, battle:lastcall ('win'), ch10-clear (coin #8; every clock starts again), ch10-gone (Flight 0 has left),
// ch10-done (Sunday dinner at the Rivituso house; Part 1 complete and its clear data saved).
// ======================================================================================================
const CH10={mode:'full',chapter:10};
const CH10_AFTER=(lost,lines)=>[
  {if:()=>lost(),then:[{heal:true},{talk:'Amy',lines:['Up! Everybody up! Walk it off. Hydrate. We have a flight to catch. Probably.']}],else:[]},
  ...lines
];
const CH10_HAND_NAME={hour:'HOUR',minute:'MINUTE',second:'SECOND'};
// What each troublemaker had: one of the gate clock's hands. All three: the coins.
const ch10HandSteps=c=>{ const H=TERM_HANDS.find(k=>k.fight==='ch10-'+c); return [
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['A long brass clock hand. Stamped on the back: GATE 0, '+CH10_HAND_NAME[H.h]+'. It goes on the gate clock.']},
  {call:()=>{ sfx.levelChime(); storyWorld(); }},
  {toast:'Clock hand '+TERM_HANDS.filter(k=>flag(k.fight)===true).length+' of 3 is back on the Gate Zero clock.',time:3.5},
  {if:()=>TERM_HANDS.every(k=>flag(k.fight)===true),then:[
    {flag:'ch10-hands'}, {wait:3.7},
    {talk:'Amy',lines:['Three hands. The clock still isn\'t moving. Tom. The slots round the face. There are seven of them.']},
    {talk:'Tom',lines:['Seven slots. And I have seven gold coins. In a sock. In my bag.','I\'ve been keeping a list. I have also been keeping the coins.']},
    {talk:'Grace',lines:['They go in the order we found them! Like a clock. Going round. I KNEW the list was important.']},
    {toast:'Goal: the Gate Zero doors (top of the concourse). Put the seven coins in, in the order Tom found them.',time:5.5}],else:[]}]; };

// 1. The taxi stand (after chapter 9, Sal offers the ride): every clock stopped, Amy, Terminal Zero.
SCENES.ch10Start=[
  {flag:'ch10-start',value:'pending'},
  {chapter:10},
  {call:()=>{ if(!party.includes(grace)) setGirlsAway(false); }},
  {fade:'out',time:.6}, {card:10,time:3.2}, {fade:'in',time:.6},
  {join:'amy',quiet:true}, {hide:'amy'},
  {place:'amy',at:spotNear(3),dir:'up'}, {show:'amy'},
  {talk:'Amy',lines:['TOM. Don\'t get in that cab.']},
  {walk:'amy',to:routeBeside('amy'),speed:.12,onStep:i=>{ if(i%2===0) sfx.run(); }},
  {talk:'Amy',lines:['You\'re not taking my girls to a closed airport at midnight without me.','Every clock in our house stopped at twelve. The microwave. The oven. My running watch. My RUNNING WATCH, Tom.']},
  {talk:'Tom',lines:['Every clock in town. Sal says zero o’clock.']},
  {talk:'Grace',lines:['Mom, it\'s SO good. We have boarding passes. Well. Tata has one. And Sal has one. Group ZERO.']},
  {talk:'Rose',lines:['I\'m in group zero too. I decided.']},
  {talk:'Amy',lines:['Fine. I have run through every airport in America. I\'ve never missed a connection.','Justin is at the shop, rewiring the whole block by flashlight. He says go. He says bring snacks.']},
  {trace:'amy-airport'}, {hearts:'amy'},
  {party:{lock:['tom','grace','rose','amy'],allow:['amy']}},
  {toast:'Amy joins the party.',time:3},
  {talk:'Sal',lines:['Cab seven! Everybody in. Long Island Regional. The door nobody uses.']},
  {fade:'out',time:.8},
  {flag:'ch10-start'},
  {call:()=>{ sfx.travel&&sfx.travel(); beginTransition({kind:'edge',to:'terminal',spawn:{x:15,y:19},facing:'up'}); }},
  {wait:.5},
  {fade:'in',time:.6}
];
// 2. Terminal Zero: dust since 1989, every board at midnight, a gate clock with no hands.
SCENES.ch10Term=[
  {flag:'ch10-term',value:'pending'},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Speaker',lines:['DING. Good evening, and welcome to Terminal Zero. Flight Zero to Nowhere is now boarding at Gate Zero. Boarding Group Zero only.','DING. Passengers are reminded that the gate clock is missing its hands. Passengers will kindly find them.']},
  {talk:'Tom',lines:['A gate agent who makes the passengers fix the clock. I have flown Delta One forty times. That\'s a first.']},
  {talk:'Amy',lines:['Directory. Security top left. Baggage Claim top right. The Lounge bottom left. Gate Zero, up the middle.']},
  {talk:'Grace',lines:['Everything is from the olden days. That phone has a CORD. Rose. Rose, don\'t lick the phone.']},
  {talk:'Rose',lines:['I was SMELLING it.']},
  {talk:'Tom',lines:['Every board says midnight. Every gate says zero. And somebody dusted the plants.','Stay close, everybody. Shoes on. Liquids in a bag.']},
  {trace:'girls-terminal'}, {hearts:'grace'},
  {flag:'ch10-term'},
  {flag:'tombo:rose2'}, {flag:'tombo:amy2'},   // Seat 1A Stowaway and Wing Walk unlock here (chapter 10)
  {toast:'New Tombos: Seat 1A Stowaway (Rose) and Wing Walk (Amy). 50% HEART each.',time:3.6},
  {toast:'Goal: find the gate clock’s three hands. Security (top left), Baggage Claim (top right), the Lounge (bottom left).',time:5.5},
  {toast:'Tip: there\'s a photo booth by the curb doors. There\'s a quarter on the seat.',time:4}
];
// 3. The three wings. A troublemaker in each one, holding a clock hand.
SCENES.ch10Sec=[
  {flag:'ch10-sec',value:'pending'},
  {walk:'The Long Line',to:routeBeside('The Long Line'),speed:.12},
  {talk:'The Long Line',lines:['Please wait to be called. PLEASE. WAIT. TO BE CALLED.','Nobody has reached the front of me since 1989. I\'m holding the hour hand. Nobody gets an hour without waiting for it.']},
  {talk:'Amy',lines:['I don\'t wait in lines. I move to the front, and I say thank you to every single person on the way.']},
  {talk:'Tom',lines:['Shoes off, everyone. Not you, Rose. Rose, put your shoe back on.']},
  {battle:'longline',tut:'ch10sec'},
  ...CH10_AFTER(()=>flag('battle:longline')!=='win',[
    {flag:'ch10-sec'},
    {talk:'The Long Line',lines:['...Next. NEXT! You. You\'re at the front. Somebody is finally at the front.']},
    {talk:'Rose',lines:['I\'m at the front! I\'m the FRONT! Do I win?']},
    {talk:'The Long Line',lines:['You win. Here. The hour hand. Go on through.']},
    {trace:'rose-front'}, {hearts:'rose'},
    ...ch10HandSteps('sec')])
];
SCENES.ch10Bag=[
  {flag:'ch10-bag',value:'pending'},
  {walk:'The Unclaimed',to:routeBeside('The Unclaimed'),speed:.12},
  {talk:'The Unclaimed',lines:['Round and round. Round and round. Every other bag got picked up. Every one. Since 1989.','I have the minute hand. It goes round and round too. We understand each other.']},
  {talk:'Grace',lines:['It has SO many stickers. Tata, look. Paris. Tokyo. Cleveland.']},
  {talk:'Tom',lines:['A well-traveled bag. We\'ll pick you up. After you give us the minute hand.']},
  {battle:'unclaimed',tut:'ch10bag'},
  ...CH10_AFTER(()=>flag('battle:unclaimed')!=='win',[
    {flag:'ch10-bag'},
    {talk:'The Unclaimed',lines:['...You stopped the carousel. For me.']},
    {talk:'Grace',lines:['I\'m picking you up. Officially. You\'re claimed. I\'m putting a sticker on you. It says GRACE.']},
    {talk:'The Unclaimed',lines:['Claimed. Oh. Here. The minute hand. Take it to the gate.']},
    {trace:'grace-claim'}, {hearts:'grace'},
    ...ch10HandSteps('bag')])
];
SCENES.ch10Lounge=[
  {flag:'ch10-lounge',value:'pending'},
  {walk:'The Armrest Hog',to:routeBeside('The Armrest Hog'),speed:.12},
  {talk:'The Armrest Hog',lines:['Occupied. All of them. Both armrests. The middle seat. The window. Mine.','The second hand is mine too. I\'m not giving up a single second.']},
  {talk:'Tom',lines:['Lounge etiquette. You get one armrest. The middle seat gets both. That\'s the rule.']},
  {talk:'Amy',lines:['Tom has very strong opinions about armrests.']},
  {talk:'Tom',lines:['Everybody should have very strong opinions about armrests.']},
  {battle:'armresthog',tut:'ch10lounge'},
  ...CH10_AFTER(()=>flag('battle:armresthog')!=='win',[
    {flag:'ch10-lounge'},
    {talk:'The Armrest Hog',lines:['...Fine. You can sit. Here. The second hand. And you can have an armrest. One. The left one.']},
    {talk:'Tom',lines:['Thank you. That was very big of you.']},
    {call:()=>sfx.pickup()},
    {talk:'Amy',lines:['Tom. The cabinet. Pajamas. With a little gold zero on the pocket.']},
    {give:'zeropjs'},
    {toast:'New outfit: Lie-Flat Pajamas. Navy, a little gold 0. Anyone can wear them.',time:4},
    ...ch10HandSteps('lounge')])
];
// 4. Optional: the photo booth. Which pose? (data in ch10Photo below)
SCENES.ch10Photo=[
  {flag:'ch10-photo'},
  {call:()=>{ sfx.ding&&sfx.ding(); sfx.levelChime(); }},
  {talk:'Photo booth',lines:['Everybody squishes in. Rose on Tom’s lap. Grace in front, doing a pose. Amy at the edge, half out of frame, laughing.','FLASH. FLASH. FLASH. FLASH. Four little photos slide out, still warm.']},
  {talk:'Amy',lines:['Sending it to Justin.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Amy',lines:['\"Best one yet. Is that an airport? At midnight?? Proud of you guys.\" With the heart. He used the heart.']},
  {talk:'Grace',lines:['TWO hearts this year! That\'s a record!']},
  {hearts:'amy'}, {hearts:'tom'}, {trace:'photo-justin'},
  {heal:true},
  {toast:'Everyone is healed. One strip for the fridge, one for Tom’s wallet.',time:3.5}
];
// 5. The coins go in, in order: Gate Zero opens.
SCENES.ch10Door=[
  {flag:'ch10-door'},
  {call:()=>{ sfx.levelChime(); storyWorld(); }}, {wait:.8},
  {talk:'Gate clock',lines:['The seventh coin clicks into its slot. All three hands shiver. The clock doesn\'t start. The middle slot is still empty.','But the doors under it go CLUNK, and swing open by themselves.']},
  {call:()=>{ ch10OpenDoors(); storyWorld(); sfx.doorIn&&sfx.doorIn(); }},
  {talk:'Grace',lines:['The sundial, the steamer, the sign-up sheet, the jar, the book, the oven, the Mirrorball. I knew it. I KNEW the list was important.']},
  {talk:'Amy',lines:['Seven coins. Seven chapters of your life, Tom. Somebody has been planning this.']},
  {talk:'Tom',lines:['Somebody with a little clock. And one more coin.']},
  {toast:'Goal: Gate Zero.',time:4}
];
// 6. Gate Zero: the Last Call, still calling Flight 0. Boss fight.
SCENES.ch10Boss=[
  {flag:'ch10-boss'}, {call:()=>storyWorld()},
  {hide:'The Last Call'},
  {walk:'tom',to:routeTo('tom',9,7),speed:.25}, {face:'tom',dir:'up'},
  {place:'grace',at:[8,7],dir:'up'}, {place:'rose',at:[10,7],dir:'up'}, {place:'amy',at:[11,7],dir:'up'},
  {talk:'Rose',lines:['A PLANE. A real one. Out the window. Its lights are on. Tata, its lights are ON.']},
  {call:()=>{ sfx.ding&&sfx.ding(); sfx.whoosh(); }},
  {show:'The Last Call'}, {face:'The Last Call',dir:'down'},
  {talk:'The Last Call',lines:['DING. Passengers! Oh. Oh, PASSENGERS. At Gate Zero. This is the LAST CALL for Flight Zero.',
    'Flight Zero was due out at midnight. 1989. I called it and called it. Nobody came to the gate. Nobody answered.']},
  {talk:'Tom',lines:['So you stopped every clock on Long Island at midnight.']},
  {talk:'The Last Call',lines:['If it\'s always midnight, the flight is never late. If the flight is never late, somebody might still come.','And somebody DID. Group Zero. Now boarding. All of you. Forever.']},
  {talk:'Amy',lines:['My running watch hasn\'t moved in a day. I can\'t log a run. Do you understand what you\'ve done.']},
  {talk:'Grace',lines:['Rose, she\'s a sign that talks. Like the one at the dentist. But MAD.']},
  {talk:'Tom',lines:['Girls, Amy, behind me. Watch the board. When she calls your name, you move. No touching, please.']},
  {battle:'lastcall',tut:'lastcall'},
  {if:()=>flag('battle:lastcall')!=='win',then:[
    {heal:true},
    {talk:'Amy',lines:['Up, everybody. Walk it off.','Tom, when she calls one of us, that person has to move before she goes again. Or you stand in front of them. And nobody has answered her since 1989. Three times.']},
    {toast:'Face the Last Call and press A to try again. Everyone is healed.',time:5}],else:[]}
];
// 7. After the boss (won in the scene, or on a retry with A): coin #8, every clock starts, Flight 0 leaves.
SCENES.ch10AfterBoss=()=>[
  {flag:'ch10-clear'},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  ...(flag('kind:lastcall')?[
    {talk:'The Last Call',lines:['...You answered. Three times. Thirty-seven years, and somebody answered.','I didn\'t need midnight. I needed somebody to say HERE.']}]:[
    {talk:'The Last Call',lines:['...Fine. Flight Zero is cancelled. It was cancelled in 1989. I just didn\'t want to be the one to flip the flap.']},
    {talk:'Amy',lines:['Hey. Nobody cancelled you. You just needed a crowd. Look. You have a crowd.']}]),
  {talk:'The Last Call',lines:['Something for the gate clock. It\'s been in my bottom row since 1989.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['A gold coin. Same little clock face. Number eight.','The sundial. The steamer. The sign-up sheet. My jar. The book from 1952. The oven from 1963. The Mirrorball from 1971. And a gate from 1989.']},
  {talk:'Gate Zero',lines:['Tom walks back out to the gate clock and pushes the eighth coin into the middle slot. Click.','The second hand jumps. Then the minute hand. Then, slowly, the hour hand. TICK. TICK. TICK.']},
  {call:()=>{ storyWorld(); sfx.ding&&sfx.ding(); }},
  {talk:'Amy',lines:['My watch. Tom. My WATCH. It says twelve oh one. Twelve oh one!']},
  {talk:'Grace',lines:['Every clock in the whole town is going again. I can FEEL it.']},
  {talk:'The Last Call',lines:['For the smallest passenger in Group Zero. Junior pilot wings. I\'ve been saving them for somebody.']},
  {give:'r_wings'},
  {toast:'Rose gets her Signature Tool: Junior Pilot Wings (POW +5, WARMTH +7). Equip it in the menu.',time:4.5},
  {talk:'Rose',lines:['I\'m a PILOT. I\'m wearing them upside down. On purpose. It\'s a pilot thing.']},
  {hearts:'rose'}, {trace:'lastcall-wings'},
  {talk:'Grace',lines:['Tata. Tata. The jet bridge. There\'s a man.']},
  {spawn:{name:'Long coat',look:'longcoat',at:[14,2],dir:'down'}},
  {face:'tom',dir:'right'},
  {talk:'Grace',lines:['In a long coat. Like at the school. He\'s tipping his hat at you.']},
  {wait:1},
  {walk:'Long coat',to:[[15,2]],speed:.35},
  {call:()=>sfx.doorIn&&sfx.doorIn()}, {despawn:'Long coat'},
  {call:()=>{ CH10_PLANE.t0=performance.now(); sfx.whoosh(); }},
  {talk:'Gate Zero',lines:['The jet bridge door clicks shut. Outside the big window, Flight Zero turns on its lights, pushes back, and rolls away into the dark. Very quietly. Like it\'s done this before.']},
  {wait:1.5}, {flag:'ch10-gone'},
  {talk:'Amy',lines:['Tom. Who IS that?']},
  {talk:'Tom',lines:['Somebody who knows I always make my connection.','He left a card on the podium. Gold ink. \"THANK YOU FOR FLYING NOWHERE. YOUR LAYOVER WILL BE ANNOUNCED.\" And a little clock.']},
  {call:()=>sfx.pickup()},
  {talk:'Tom',lines:['My boarding pass changed. \"BOARDING GROUP 0. FROM: LONG ISLAND. TO: NOWHERE. STATUS: LAYOVER.\"']},
  {talk:'Rose',lines:['What\'s a layover?']},
  {talk:'Tom',lines:['It means this trip isn\'t over.']},
  {hearts:'tom'},
  {talk:'Amy',lines:['Okay. It\'s twelve oh four. Mom has been holding Sunday dinner since midnight. Everybody to the cab.']},
  {fade:'out',time:.8},
  {call:()=>{ beginTransition({kind:'edge',to:'row',spawn:{x:18,y:8},facing:'up'}); }},
  {wait:.5}, {fade:'in',time:.6},
  {toast:'Goal: Sunday dinner at Deedee and Boppy’s house (RIVITUSO). Everyone is waiting.',time:4.5}
];
// 8. The Rivituso house: Sunday dinner at midnight. Part 1 complete.
SCENES.ch10End=[
  {flag:'ch10-done',value:'pending'},
  {talk:'Deedee',lines:['THERE they are. Tommy! The oven clock started blinking twelve oh one and I cried a little. Into the gravy. It\'s fine. It\'s seasoning.']},
  {talk:'Boppy',lines:['Every clock in this house started at once. Eleven clocks. I didn\'t know we\'d eleven clocks.','My stomach is still on midnight. My stomach is always on midnight.']},
  {talk:'Aunt Ellie',lines:['Sit. Tell me about the airport. Leave nothing out. I\'ll know.']},
  {spawn:{name:'Justin',look:'bean',at:spotNear(2),dir:'up'}},
  {call:()=>{ const j=currentMap.npcs.find(n=>n.scripted&&n.name==='Justin'); if(j) j.sheet='justin'; sfx.doorIn&&sfx.doorIn(); }},
  {talk:'Grace',lines:['DAD!']},
  {talk:'Justin',lines:['Hey, everybody. The lights all came back on at twelve oh one. So I came back too. I brought bread.']},
  {talk:'Tom',lines:['It\'s store-bought.']},
  {talk:'Justin',lines:['It\'s store-bought.']},
  {talk:'Tom',lines:['I\'ll allow it. Tonight.']},
  {talk:'Deedee',lines:['None for me, Justin. Store-bought gives me gas.']},
  {talk:'Rose',lines:['Deedee! EVERYTHING gives you GAS!']},
  {talk:'Sunday dinner',lines:['Everybody laughs. Boppy laughs so hard he has to hold his stomach. Deedee laughs last, and longest.']},
  {talk:'Deedee',lines:['Fine. One slice. For the girl who said it.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Tom',lines:['A text from TNB. \"babe. every clock in LA stopped at midnight. they just started again. was that you?\"','Tom writes back: \"Mostly Amy.\" TNB sends a heart. Tom sends one back. Then another one.']},
  {talk:'Amy',lines:['Mostly Amy. Put that on a shirt.']},
  {talk:'Deedee',lines:['Everybody sit. Everybody. Justin, you too. Ellie, that\'s Boppy’s chair. Boppy, that\'s my chair. Boppy.']},
  {talk:'Deedee',lines:['And has anybody seen my glasses? I can\'t read the oven.']},
  {talk:'Rose',lines:['They\'re on the BUTTER, Deedee.']},
  {talk:'Deedee',lines:['Of course they are. Nobody touch the butter.']},
  {talk:'Rose',lines:['Tata. Next time there\'s a layover, can I come?']},
  {talk:'Grace',lines:['WE are coming. All of us. I\'m already packing. In my head.']},
  {talk:'Tom',lines:['Everybody comes next time.','To the moon and back, everybody. Eat. Deedee made everything.']},
  {talk:'Deedee',lines:['To the moon and BACK.']},
  {trace:'ch10-wrap'}, {hearts:'deedee'}, {hearts:'tom'}, {call:()=>sfx.levelChime()},
  {party:null},
  {fade:'out',time:.8}, {card:10,done:true,time:3.4}, {partCard:1,done:true,time:3.6}, {flag:'ch10-done'}, {partClear:true}, {fade:'in',time:.8},
  {toast:'PART 1 COMPLETE! Part 2 is open on the title screen. Its chapters are still being built. Long Island is yours to explore.',time:7}
];
TRIGGERS.push(
  {id:'ch10-term',map:'terminal',when:{...CH10,flag:'ch10-start',notFlag:'ch10-term'},scene:'ch10Term'},
  {id:'ch10-sec',map:'terminal',at:[1,1,11,6],when:{...CH10,flag:'ch10-term',notFlag:'ch10-sec'},scene:'ch10Sec'},
  {id:'ch10-bag',map:'terminal',at:[18,1,28,6],when:{...CH10,flag:'ch10-term',notFlag:'ch10-bag'},scene:'ch10Bag'},
  {id:'ch10-lounge',map:'terminal',at:[1,14,13,17],when:{...CH10,flag:'ch10-term',notFlag:'ch10-lounge'},scene:'ch10Lounge'},
  {id:'ch10-boss',map:'gatezero',when:{...CH10,flag:'ch10-door',notFlag:'ch10-boss'},scene:'ch10Boss'},
  {id:'ch10-after',map:'gatezero',when:{...CH10,flag:{'battle:lastcall':'win'},notFlag:'ch10-clear'},scene:'ch10AfterBoss'},
  {id:'ch10-end',map:'grands',when:{...CH10,flag:'ch10-clear',notFlag:'ch10-done'},scene:'ch10End'}
);
// The terminal holds still until the party has looked around; each wing's troublemaker holds still until its story fight.
const CH10_ROOM_FLAG={longline:'ch10-sec',unclaimed:'ch10-bag',armresthog:'ch10-lounge'};
HOLD_RULES.push(n=>STORY.chapter===10&&currentMap.id==='terminal'&&(flag('ch10-term')!==true||(CH10_ROOM_FLAG[n.monster]&&flag(CH10_ROOM_FLAG[n.monster])!==true)));

// Map changes. They check flags (not events), so they also hold after loading a save.
// The Gate Zero doors (top of the concourse) open once the seven coins are in.
function ch10OpenDoors() {
  const M=worlds.terminal; if(!M||M.doorsOpen) return;
  const o=M.objects.find(o=>o.kind==='gatedoors');
  if(o) { M.objects.splice(M.objects.indexOf(o),1); for(const x of [13,14]) M.objectAt.delete(key(x,1)); }
  for(const x of [13,14]) tile(M,x,1,'terrazzo');
  M.doorsOpen=true; M.mini=null;
}
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  if(flag('ch10-door')||STORY.chapter>10) ch10OpenDoors();
  // The Last Call stays dark until the party walks into Gate Zero, and goes quiet again after.
  const b=findMonster('lastcall'); if(!b) return;
  b.mscale=1.4;
  const under=STORY.chapter<10||(STORY.chapter===10&&!flag('ch10-boss'))||!!flag('ch10-clear');
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});

// Sal: after chapter 9 his ride to Terminal Zero starts chapter 10; during chapter 10 it is the only place he goes;
// after it, Terminal Zero is one more stop on the usual menu.
const LE_talkToDriver_ch10=talkToDriver;
talkToDriver=function(n) {
  if(STORY.mode!=='full'||n.name!=='Sal') return LE_talkToDriver_ch10(n);
  const term=()=>beginTransition({kind:'edge',to:'terminal',spawn:{x:15,y:19},facing:'up'});
  if(STORY.chapter===9&&flag('ch9-done')===true) {
    n.visitedOnce=true;
    openChoice(n.name,['Tom! Every clock in town stopped. Midnight. Cab seven’s clock. The depot clock. My watch. Zero o’clock.',
      'And somebody left this on my dashboard. A boarding pass. BOARDING GROUP 0. Same as yours?',
      'Long Island Regional has four gates. And a fifth door nobody uses. TERMINAL ZERO. Closed since 1989. Last night, every light in it came on.'],[
      {label:'TO TERMINAL ZERO',fn:()=>playScene('ch10Start')},
      {label:'NOT YET',fn:()=>openDialog(n.name,['Okay. Cab seven is parked. It\'s midnight. It\'s been midnight for a while.'],n)}],n);
    return;
  }
  if(STORY.chapter===10&&flag('ch10-start')===true&&flag('ch10-done')!==true) {
    n.visitedOnce=true;
    openChoice(n.name,['Back to Terminal Zero? It\'s the only place open. It\'s the only place anything is open.'],[
      {label:'TERMINAL ZERO',fn:term},
      {label:'JUST VISITING',fn:()=>openDialog(n.name,['Okay. It\'s still midnight. I\'m not going anywhere.'],n)}],n);
    return;
  }
  if(STORY.chapter>=10&&flag('ch10-done')===true) {
    n.visitedOnce=true;
    openChoice(n.name,['Where to? Terminal Zero? Somebody moved my clock up four minutes. I don\'t ask questions.'],[
      {label:'TERMINAL ZERO',fn:term},
      {label:'SOMEWHERE ELSE',fn:()=>LE_talkToDriver_ch10(n)}],n);
    return;
  }
  return LE_talkToDriver_ch10(n);
};

// The gate clock: before its hands are back, and the seven coins in order once they are.
const CH10_COINS=['THE SUNDIAL','THE STEAMER','THE SIGN-UP SHEET','BREADY’S JAR','THE 1952 BOOK','THE 1963 OVEN','THE MIRRORBALL'];
const CH10_HINTS=[
  'Grace: \"Tata. You said the list like a HUNDRED times. It starts with the sundial. In the marsh. With Boppy.\"',
  'Grace: \"Okay. I\'ll just say it. Sundial, steamer, sign-up sheet, jar, book, oven, Mirrorball. Going round.\"'];
function ch10Gate(o) {
  if(STORY.mode!=='full'||STORY.chapter!==10||flag('ch10-door')||!flag('ch10-term')) return false;
  const n=TERM_HANDS.filter(k=>flag(k.fight)===true).length;
  if(n<3) {
    const miss=TERM_HANDS.filter(k=>flag(k.fight)!==true).map(k=>CH10_HAND_NAME[k.h].toLowerCase()+' hand ('+k.from+')');
    openDialog(o.name,['GATE 0. The doors are locked tight. Above them the big clock has '+(n?n+' of its 3 hands':'no hands at all')+', and seven empty coin slots round the face.',
      'Amy: \"Still missing: '+miss.join(', ')+'.\"']);
    return true;
  }
  openChoice(o.name,['The clock has all three hands now. They don\'t move. Seven coin slots round the face, one in the middle.','Tom takes out the sock. Seven gold coins.'],[
    {label:'PUT THE COINS IN',fn:()=>ch10Slot(0)},
    {label:'NOT YET',fn:()=>{}}]);
  return true;
}
function ch10Slot(i) {
  const right=CH10_COINS[i],opts=[right,...CH10_COINS.slice(i+1).sort(()=>Math.random()-.5).slice(0,2)];
  if(opts.length<3) opts.push(...CH10_COINS.slice(0,i).sort(()=>Math.random()-.5).slice(0,3-opts.length));
  opts.sort(()=>Math.random()-.5);
  openChoice('Gate clock',[(i?'Click. '+i+' in. ':'')+'Slot '+(i+1)+' of 7, going round. Which coin goes in?'],
    opts.map(label=>({label,fn:()=>{
      if(label===right) { sfx.select&&sfx.select(); if(i===6) playScene('ch10Door'); else ch10Slot(i+1); return; }
      const f=(flag('ch10-fails')||0)+1; setFlag('ch10-fails',f); sfx.nope&&sfx.nope();
      openDialog('Gate clock',['CLUNK. The coins rattle back out into Tom’s hand.',CH10_HINTS[Math.min(f,2)-1]]);
    }})));
}
// The photo booth: which pose? (Heart-Trace)
const CH10_POSES=[
  {label:'SERIOUS FACES',no:'Everybody tries. Rose lasts one second. FLASH. Four photos of Rose laughing and everyone else trying very hard.'},
  {label:'SCARY FACES',no:'Rose does her scariest face. The booth jams. A little card slides out: PLEASE DO NOT SCARE THE BOOTH.'},
  {label:'ONE FOR JUSTIN',ok:true}];
function ch10Photo(o) {
  if(STORY.mode!=='full'||STORY.chapter!==10||!flag('ch10-term')||flag('ch10-photo')||!inParty(amy)) return false;
  openChoice(o.name,['FOUR POSES, ONE QUARTER. Grace already has the quarter. Rose is already on the seat.','Which pose?'],
    CH10_POSES.map(r=>({label:r.label,fn:()=>{ if(r.ok) playScene('ch10Photo'); else { sfx.nope&&sfx.nope(); openDialog('Photo booth',[r.no]); } }})));
  return true;
}
const LE_pressAction_ch10=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object') {
      if(v.gatelock&&ch10Gate(v)) return;
      if(v.photobooth&&ch10Photo(v)) return;
    }
  }
  return LE_pressAction_ch10();
};
// Terminal Zero is dim until the clocks start (lamp light round Tom); Gate Zero shows Flight 0 through the window
// until it pushes back and rolls away.
const CH10_PLANE={t0:0};
STORY_MAPFX.push(time=>{
  const M=currentMap,id=M.id,c=gfx;
  if(id==='terminal'&&!termClockGo()) {
    const p=position(player),px=(p.x+.5)*T,py=(p.y+.5)*T;
    const g=c.createRadialGradient(px,py,T*3,px,py,T*10); g.addColorStop(0,'rgba(10,14,30,0)'); g.addColorStop(1,'rgba(10,14,30,.42)');
    c.fillStyle=g; c.fillRect(0,0,M.w*T,M.h*T);
  }
  if(id==='gatezero') {
    const gone=STORY.mode==='full'&&(STORY.chapter>10||!!flag('ch10-gone'));
    const leaving=CH10_PLANE.t0&&!gone?(performance.now()-CH10_PLANE.t0)/1000:0;
    if(!plateFor(M)&&(!gone||leaving)) {
      const dx=-leaving*leaving*40,y0=4,x0=3*T+dx;
      c.save(); c.beginPath(); c.rect(T,0,(M.w-2)*T,T); c.clip();
      rect(x0,y0+8,12*T,12,'#e8eaf4'); ellipse(x0+12*T,y0+14,12,6,'#e8eaf4'); rect(x0,y0+18,12*T,2,'#2f5fb0');
      polygon([[x0+10,y0+8],[x0,y0-6],[x0+16,y0-6],[x0+30,y0+8]],'#2f5fb0');
      for(let k=0;k<20;k++) rect(x0+44+k*16,y0+11,5,4,'#f2c75a');
      if(Math.floor(time*2)%2) ellipse(x0+4,y0+2,2,2,'#e85a4a');
      c.restore();
    }
    if(STORY.chapter===10&&flag('ch10-boss')&&!flag('ch10-clear')) { const gl=c.createRadialGradient(9.5*T,3*T,2,9.5*T,3*T,T*4); gl.addColorStop(0,'rgba(242,199,90,.25)'); gl.addColorStop(1,'rgba(242,199,90,0)'); c.fillStyle=gl; c.fillRect(5*T,0,9*T,7*T); }
  }
});

// Tips for the chapter 10 story fights and the Last Call.
TUTORIALS.ch10sec={
  setup() { B2.heart=Math.max(B2.heart,30); b2Render(); },
  tips:[
    {id:'weak',who:'*',text:'The Long Line is weak to Kinetic and Sparkle, and shrugs off Chatter. Amy’s Kettlebell Swing and Grace’s Cartwheel are Kinetic.'},
    {id:'slow',who:'*',when:()=>b2LiveParty().some(p=>p.st.slow),text:'Slowed: PEP down, so that person comes round less often. Watch the turn ribbon.'},
    {id:'tombo',who:['tom','amy'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='amy1'&&!r.why),text:'◀ TOMBO: I Called It! A hit on every enemy, and the party gets faster.'}]};
TUTORIALS.ch10bag={tips:[
  {id:'shell',who:'*',text:'The Unclaimed has a hard shell: it shrugs off Kinetic. Splash and Cozy get through. Tom’s Starter Splash and Grace’s Welcome Back to My Channel work.'},
  {id:'kind',who:'amy',dir:'up',text:'Terminal things love Amy’s PEP TALK and Rose’s RASPBERRY. A full Warmth bar sends them home happy.'}]};
TUTORIALS.ch10lounge={tips:[
  {id:'hog',who:'*',text:'The Armrest Hog lowers POW and shrugs off Cozy. Chatter and Sparkle get it to scoot over.'},
  {id:'tombo',who:['tom','rose'],dir:'left',when:u=>b2TomboRows(u).some(r=>r.T.id==='rose1'&&!r.why),text:'◀ TOMBO: Double-Decker Airplane. A big hit, and it sees stars and loses its next turn.'}]};
TUTORIALS.lastcall={tips:[
  {id:'call',who:'*',text:'NOW BOARDING: each turn she calls someone (gold BOARDING tag). They must act before her next turn, or the gate closes on them and they lose a turn.'},
  {id:'escort',who:'tom',dir:'right',when:()=>B2.foes.some(f=>f.call&&b2Alive(f.call)&&f.call.id!=='tom'&&f.call.st.boarding&&!f.call.st.guarded),
    text:'Called someone slow? ▶ DEFEND, then pick them: Tom walks them onto the plane.'},
  {id:'answer',who:'*',dir:'down',care:1,text:'Nobody has answered her since 1989. ▼ Bag, ANSWER THE CALL. Three times and she gives up happy.'},
  {id:'final',who:['tom','grace','rose','amy'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>!r.why),text:'FINAL BOARDING is coming. Any ◀ TOMBO smashes her guard in one go.'},
  {id:'final2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'FINAL BOARDING on everyone next turn! Break her guard: 2 Kinetic or Sparkle hits, or any Tombo.'}]};

// Part 2 is not built yet. Starting it from the title screen lands in chapter 11 with free play.
SCENES.part2Open=()=>[{toast:'Chapter 11 is still being built. For now, Long Island and Los Angeles are yours to explore.',time:5}];
