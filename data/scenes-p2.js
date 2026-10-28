'use strict';
// data/scenes-p2.js — Part 2, Chapter 11 "The Layover Between Worlds" (C11a: house morning, Flight Zero, Terminal Infinity,
// the Standby Sprite, TNB and Nara, the Sleepover Tombo), C11b (Lost & Found, Julian Vance, the FINAL CALL boss, the ending).
// Flags, in order: ch11-start (leaving the house), ch11-cabin (Flight Zero scene begun), ch11-boo (Rose out from the blanket),
// ch11-tear (the sky tears; we are through), ch11-gate00 (arrival scene), ch11-conc (concourse scene), ch11-sprite (the
// Standby Sprite has been met), ch11-stby (it is beaten; the checkpoint is open), ch11-met (TNB and Nara arrived),
// ch11-lost (optional: the Lost & Found was opened), ch11-vance (Julian Vance at Gate Infinity; FINAL CALL steps out),
// battle:finalcall ('win'), ch11-closed (LONG ISLAND: CLOSED; the Long Island dome goes amber), ch11-done (CHAPTER 11 COMPLETE).
// Loaded after data/scenes.js.
const CH11={mode:'full',chapter:11};

SCENES.part2Open=()=>[
  {party:{lock:['tom'],allow:[],bar:['grace','rose','amy','tnb','nara']}},
  {call:()=>{ if(typeof setGirlsAway==='function') setGirlsAway(true); }},
  {talk:'Deedee',lines:['Tommy! Sit. Eat. I made a crisp. It is nine in the morning and it is a crisp. Do not argue.']},
  {talk:'Tom',lines:['I wasn’t going to argue.']},
  {talk:'Boppy',lines:['This came for the recliner. A gold card. “Priority Member.” Junk mail. They send it to the recliner now.','Don’t throw it out. It’s warm. I think it’s warm. My knee says it’s warm.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Tom',lines:['My boarding pass is buzzing in my pocket. It says: YOUR LAYOVER IS NOW BOARDING.']},
  {talk:'Deedee',lines:['A layover! Where? Never mind. Take a sweater. Take two. Take the crisp.']},
  {talk:'Boppy',lines:['Bring me back a pretzel. A real one. Not the airport kind.']},
  {talk:'Deedee',lines:['To the moon and back, Tommy. Both ways.']},
  {trace:'ch11-start'}, {hearts:'deedee'},
  {toast:'Goal: follow the boarding pass.',time:4},
  {flag:'ch11-start'},
  {fade:'out',time:.8},
  {call:()=>{ sfx.travel&&sfx.travel(); beginTransition({kind:'edge',to:'flightzero',spawn:{x:3,y:2},facing:'down'}); }},
  {wait:.5},
  {fade:'in',time:.6}
];

SCENES.ch11Cabin=[
  {flag:'ch11-cabin',value:'pending'},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Speaker',lines:['DING. Welcome aboard Flight Zero, nonstop to Wherever. Please stow your bags, your seatbacks, and your questions.']},
  {talk:'Tom',lines:['A pod seat. A real one. Somebody upgraded me and nobody told me why.','And something in seat 5B is giggling.']},
  {walk:'tom',to:routeTo('tom',6,4),speed:.25}, {face:'tom',dir:'down'},
  {talk:'Tom',lines:['Whoever is under the blanket: it’s breathing very loudly.']},
  {flag:'ch11-boo'}, {sfx:'ding'},
  {party:null},
  {call:()=>{ if(typeof setGirlsAway==='function') setGirlsAway(false); }},
  {place:'rose',at:[6,5],dir:'up'}, {place:'grace',at:[7,5],dir:'up'},
  {talk:'Rose',lines:['BOO! We’re stowaways! Tata, what’s a stowaway?']},
  {talk:'Tom',lines:['It’s a person who hides on a plane they weren’t invited to.','Which is illegal. And also, apparently, a family tradition.']},
  {talk:'Grace',lines:['We weren’t hiding. We were pre-boarding. Rose got the good blanket.']},
  {talk:'Rose',lines:['It’s the one with the tiny planes on it.']},
  {talk:'Grace',lines:['Tata, if you tell Mom, I’m going to make a video about it. Please like and subscribe.']},
  {talk:'Tom',lines:['Nobody is subscribing to a stowaway.']},
  {trace:'girls-stowaway'}, {hearts:'rose'}, {hearts:'grace'},
  {call:()=>sfx.whoosh&&sfx.whoosh()},
  {join:'amy',quiet:true}, {hide:'amy'},
  {place:'amy',at:[17,4],dir:'left'}, {show:'amy'}, {sfx:'doorIn'},
  {talk:'Amy',lines:['STOP THE PLANE. I have a ticket. I don’t have a ticket. I have my running shoes.']},
  {walk:'amy',to:routeBeside('amy'),speed:.12,onStep:i=>{ if(i%2===0) sfx.run&&sfx.run(); }},
  {talk:'Amy',lines:['My daughters ran out of the house in their socks, Tom. I’m their ride home. And I’m faster than you.']},
  {talk:'Tom',lines:['Nobody here is racing.']},
  {talk:'Amy',lines:['That’s what the person who loses says.']},
  {trace:'amy-cabin'}, {hearts:'amy'},
  {toast:'Amy joins the party.',time:3},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Speaker',lines:['Ladies and gentlemen, we are experiencing a little weather. It is not the kind with rain. Please look out the window.']},
  {flag:'ch11-tear'}, {call:()=>sfx.whoosh&&sfx.whoosh()}, {wait:1.8},
  {talk:'Rose',lines:['The sky has a hole in it. The hole is pink. Tata, can I touch the hole?']},
  {talk:'Tom',lines:['No touching, please.','Everybody hold on to something. Preferably each other.']},
  {fade:'out',time:.9},
  {flag:'ch11-cabin'},
  {call:()=>{ sfx.travel&&sfx.travel(); beginTransition({kind:'edge',to:'gate00',spawn:{x:9,y:11},facing:'up'}); }},
  {wait:.5},
  {fade:'in',time:.7}
];

SCENES.ch11Gate00=[
  {flag:'ch11-gate00',value:'pending'},
  {talk:'Speaker',lines:['DING. Welcome to Terminal Infinity. It is always dusk. Every flight is on time.']},
  {talk:'Grace',lines:['Tata. The window. There are two tiny towns in it.']},
  {talk:'Tom',lines:['Left one is green. That’s Long Island. Right one is orange. That’s Los Angeles.','Both of them inside glass. Like snow globes.']},
  {talk:'Amy',lines:['Then we’re in the layover. Between the two. Everything is on time and nothing is going anywhere.']},
  {talk:'Rose',lines:['Can we live here? There’s a plant with a hat.']},
  {talk:'Tom',lines:['We are not living in an airport, Rose.','We’re finding the way through it. East, down the Endless Concourse.']},
  {trace:'gate00-arrive'}, {hearts:'tom'},
  {flag:'ch11-gate00'},
  {toast:'Goal: head through the right-hand doorway into the Endless Concourse.',time:5}
];

SCENES.ch11Conc=[
  {flag:'ch11-conc',value:'pending'},
  {talk:'Amy',lines:['Nine gates. Boston, Denver, Seattle, Chicago, Miami. Every one of them says PAUSED.']},
  {talk:'Grace',lines:['It’s a whole day of everybody’s trip, stopped in the middle. The seagull still has the fry.']},
  {talk:'Tom',lines:['Careful. A town paused is still a town. Don’t lick the glass.']},
  {talk:'Rose',lines:['I wasn’t going to.']},
  {talk:'Rose',lines:['I was going to look at it with my face.']},
  {talk:'Tom',lines:['Gate Infinity is the big door at the far end. There’s a checkpoint in the middle, and somebody is standing in it.']},
  {flag:'ch11-conc'},
  {toast:'Goal: get past the checkpoint at the middle of the Concourse.',time:5},
  {toast:'Tip: gold Boarding Gate benches let you swap who is out front.',time:5}
];

SCENES.ch11Stby=[
  {flag:'ch11-sprite',value:'pending'},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Standby Sprite',lines:['Hold it. Hold it right there. Name?','Not on the list. Nobody is ever on the list. You’re standby. Congratulations. You’re number eighteen.']},
  {talk:'Tom',lines:['Who is number seventeen?']},
  {talk:'Standby Sprite',lines:['Me. I’ve been seventeen since 1998. If you pass me, I move up. Nobody passes me.']},
  {talk:'Amy',lines:['I’ve never been on standby in my life. I’ve been on time, or I’ve been first.']},
  {talk:'Grace',lines:['Rose, he has a paddle that says STANDBY and he thinks it’s a weapon.']},
  {talk:'Tom',lines:['Stay behind me. If he sends someone to the back of the line, we’ll get them right back.']},
  {battle:'standbysprite',tut:'ch11a'},
  {if:()=>flag('battle:standbysprite')!=='win',then:[
    {heal:true},
    {talk:'Amy',lines:['Up, everybody. Walk it off. He’s a clipboard with legs.']},
    {toast:'Face the Standby Sprite and press A to try again. Everyone is healed.',time:5}],else:[
    {call:()=>setFlag('ch11-stby',true)},
    {talk:'Standby Sprite',lines:['...Seventeen. Somebody called seventeen. Was that me?','It was me. I’m on the plane. I’m on THE PLANE.']},
    {trace:'standby-sprite'}, {hearts:'amy'},
    {toast:'Goal: the checkpoint is open. Head east to the jet bridge.',time:5}]}
];
SCENES.ch11StbyAfter=[
  {flag:'ch11-stby'},
  {talk:'Standby Sprite',lines:['...Seventeen. Somebody called seventeen. Was that me?','It was me. I’m on the plane. I’m on THE PLANE.']},
  {trace:'standby-sprite'}, {hearts:'amy'},
  {toast:'Goal: the checkpoint is open. Head east to the jet bridge.',time:5}
];

SCENES.ch11Meet=[
  {flag:'ch11-met',value:'pending'},
  {bench:'tnb',quiet:true}, {hide:'tnb'}, {bench:'nara',quiet:true}, {hide:'nara'},
  {call:()=>sfx.ding&&sfx.ding()}, {wait:.6},
  {talk:'Speaker',lines:['DING. Flight Zero from Los Angeles has arrived at the Jet Bridge. Welcome to the layover. Please do not feed the dog the pretzels.']},
  {sfx:'doorIn'},
  {place:'tnb',at:[35,2],dir:'down'}, {show:'tnb'}, {place:'nara',at:[36,2],dir:'down'}, {show:'nara'},
  {talk:'Nara',lines:['Nara sees Tom. Nara sees EVERYTHING that is not Tom disappear.']},
  {walk:'nara',to:routeBeside('nara'),speed:.1,onStep:i=>{ if(i%2===0) sfx.run&&sfx.run(); }},
  {hearts:'nara'},
  {talk:'Tom',lines:['Hi. Hi, bean. Yes. I know. You were so brave on the plane.']},
  {walk:'tnb',to:routeBeside('tnb'),speed:.2},
  {talk:'TNB',lines:['Hey, babe. The airline lost my bag, found my dog, and upgraded us both. This place is nice.']},
  {hearts:'tom'}, {hearts:'tnb'}, {call:()=>sfx.levelChime&&sfx.levelChime()},
  {talk:'Tom',lines:['You came through the sky.']},
  {talk:'TNB',lines:['I came through the sky with a dog on a pillow. It was fine. There was a pot on the cart that was kind of incredible.']},
  {talk:'Grace',lines:['Hi! I’m Grace. I’m nine.']},
  {talk:'TNB',lines:['I know exactly who you are. Tom shows me all your videos. You’re very good at telling people to subscribe.']},
  {talk:'Grace',lines:['Thank you. Subscribe.']},
  {talk:'Rose',lines:['I’m Rose. I’m six. I’m on a longboard.']},
  {talk:'TNB',lines:['That’s my longboard.']},
  {talk:'Rose',lines:['It’s ours now.']},
  {talk:'Nara',lines:['Nara licks Grace’s glitter nails, one at a time. She seems to feel it’s a type of review.']},
  {talk:'Amy',lines:['You’re the boyfriend.']},
  {talk:'TNB',lines:['And you’re the sister. The runner. I’ve heard a lot.']},
  {talk:'Amy',lines:['I’ve heard nothing, which means he’s been saving you for a special occasion.']},
  {talk:'TNB',lines:['I can fix a handle or fire a vase. What are you good at?']},
  {talk:'Amy',lines:['Everything, and quickly. I think we’re going to get along.']},
  {trace:'tnb-nara-arrive'},
  {talk:'TNB',lines:['Okay. Everybody. Sleepover rules. We have a blanket, a dog, and nine hours of dusk.','Tom, build the fort. I’ll make the snacks.']},
  {flag:'tombo:ff1'},
  {toast:'New Tombo: Sleepover at Tom’s (Tom, TNB, Grace, Rose in front). 50% HEART.',time:4.5},
  {flag:'ch11-met'},
  {toast:'TNB and Nara are on the bench. Sit at a gold Boarding Gate bench to bring them out front.',time:6},
  {toast:'Goal: Gate Infinity is at the far east end. Look around the Concourse first.',time:5},
  {save:true}
];

TRIGGERS.push(
  {id:'ch11-cabin',map:'flightzero',when:{...CH11,flag:'ch11-start',notFlag:'ch11-cabin'},scene:'ch11Cabin'},
  {id:'ch11-gate00',map:'gate00',when:{...CH11,flag:'ch11-tear',notFlag:'ch11-gate00'},scene:'ch11Gate00'},
  {id:'ch11-conc',map:'concourse',when:{...CH11,flag:'ch11-gate00',notFlag:'ch11-conc'},scene:'ch11Conc'},
  {id:'ch11-sprite',map:'concourse',at:[18,4,22,9],when:{...CH11,flag:'ch11-conc',notFlag:'ch11-sprite'},scene:'ch11Stby'},
  {id:'ch11-stby-after',map:'concourse',when:{...CH11,flag:{'battle:standbysprite':'win'},notFlag:'ch11-stby'},scene:'ch11StbyAfter'},
  {id:'ch11-meet',map:'concourse',at:[28,3,38,9],when:{...CH11,flag:'ch11-stby',notFlag:'ch11-met'},scene:'ch11Meet'}
);
HOLD_RULES.push(n=>STORY.chapter===11&&currentMap.id==='concourse'&&(flag('ch11-conc')!==true||(n.monster==='standbysprite'&&flag('ch11-stby')!==true)));
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  const b=findMonster('standbysprite'); if(!b) return;
  const gone=!!flag('ch11-stby')||STORY.chapter>11;
  if(gone&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!gone&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});
TUTORIALS.ch11a={tips:[
  {id:'wl',who:'*',text:'WAIT LIST sends one of you to the back of the turn ribbon. Splash and Kinetic moves hit him hardest.'},
  {id:'pep',who:'amy',dir:'down',care:1,text:'He is fussy and he loves a pep talk. ▼ Bag, PEP TALK, to calm him down for a Kindness win.'}]};


// ---------- C11b ----------
Object.assign(items,{
  goldtag:{name:'Gold Clock Tag',icon:'\u{1F3F7}',slot:null,keepsake:true,desc:'From the Lost and Found. A little gold clock face on a string, and in the same gold ink as the card at Gate Zero: HELD FOR PICKUP. NO RUSH.'}});

// The Lost and Found: optional. Where every Lost Luggage in Terminal Infinity comes home to wait.
SCENES.ch11Lost=[
  {flag:'ch11-lost',value:'pending'},
  {call:()=>sfx.doorIn&&sfx.doorIn()},
  {talk:'Lost and Found',lines:['The door was never locked. It just said BACK IN FIVE MINUTES for so long that nobody tried it.','Inside: a counter, a brass bell, and shelves that go up past the ceiling. Every item has a little gold clock tied to it.']},
  {talk:'Rose',lines:['Can I ring the bell?']},
  {talk:'Tom',lines:['Gently.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Rose',lines:['I rang it gently. It rang back less gently.']},
  {talk:'Grace',lines:['Tata. Every single thing here has a tag. A blue mitten. A trombone. A birthday hat. A retainer.']},
  {talk:'Amy',lines:['Nobody has claimed the retainer in my family since 2011. That’s not related. Moving on.']},
  {talk:'TNB',lines:['These are all things people left behind when they got to the good part of a trip. A mitten from the best snow day. A hat from the best party.','They didn’t want to leave. So they didn’t go back for it.']},
  {talk:'Tom',lines:['Somebody collected them. Every gold clock is the same little clock as the coins.']},
  {talk:'Rose',lines:['Tata. Tata. The ? suitcases. They’re all in here. They’re all being very polite.']},
  {talk:'Lost and Found',lines:['A ledger on the counter. UNCLAIMED: 4,017,311 ITEMS. CLAIMED: 0.','The last line, in gold ink: THE ONLY WAY TO LEAVE SOMETHING SAFE IS TO NEVER COME BACK FOR IT.']},
  {talk:'Grace',lines:['That is the saddest thing I have ever read. And I read my sister’s diary.']},
  {talk:'Rose',lines:['I don’t have a diary. I have a drawing of a dog.']},
  {call:()=>sfx.pickup&&sfx.pickup()},
  {talk:'Lost and Found',lines:['Under the bell, a card in the same gold ink as the one at Gate Zero:','FOUND: ONE TOM. HELD FOR PICKUP. NO RUSH.']},
  {talk:'Tom',lines:['...He’s been holding a spot for me. Not for my bag. For me.']},
  {talk:'Amy',lines:['That’s either the nicest thing I’ve ever heard or a threat.']},
  {talk:'TNB',lines:['Both, probably. That’s how the good ones are.']},
  {give:'goldtag'},
  {toast:'Keepsake: Gold Clock Tag. Boppy wants a pretzel, so you also take the tin of Airplane Pretzels.',time:5},
  {give:'pretzels'},
  {trace:'lost-and-found'}, {hearts:'tom'}, {hearts:'rose'},
  {flag:'ch11-lost'}
];

// Julian Vance at Gate Infinity.
SCENES.ch11Vance=[
  {flag:'ch11-vance',value:'pending'},
  {call:()=>sfx.ding&&sfx.ding()},
  {spawn:{name:'Long coat',look:'longcoat',at:[36,3],dir:'down'}},
  {walk:'Long coat',to:[[36,4],[35,5]],speed:.3}, {face:'Long coat',dir:'right'},
  {talk:'Long coat',lines:['Hello, Tom.']},
  {face:'Long coat',dir:'down'},
  {talk:'Tom',lines:['You’re the man in the long coat. At the school. At the airport. At Gate Zero.']},
  {call:()=>sfx.whoosh&&sfx.whoosh()},
  {talk:'Julian Vance',lines:['Julian Vance. Gate agent, in a way. I have stood at every gate that ever closed.','You opened every door I couldn’t. Thank you for flying nowhere, Tom.']},
  {talk:'Amy',lines:['You stopped our clocks. You stopped MY clock.']},
  {talk:'Julian Vance',lines:['I stopped every town on Earth. At its happiest afternoon. A birthday that never ends. The last day of summer. Nobody is sad. Nobody is late.','Long Island and Los Angeles kept moving because you kept flying. Every flight moved them a little. I wasn’t quick enough to stop you.']},
  {talk:'Grace',lines:['Paused isn’t happy. Paused is stuck.']},
  {talk:'Rose',lines:['The seagull has had that fry for a hundred years. He’s not happy. He’s hungry.']},
  {talk:'TNB',lines:['I have a vase in the kiln in Los Angeles. It’s been in there a long time. It’s going to crack.','That’s what happens when you leave something at its best. It doesn’t stay good. It just stays.']},
  {talk:'Julian Vance',lines:['Maybe. But it stays safe. That is all I have ever wanted for anyone.','Everyone, safe, in the good part, forever. Come in. Stay. Nobody here has ever been lost.']},
  {talk:'Tom',lines:['That’s the nicest offer anyone’s ever made me. And it was in my pocket the whole time. I had a pass.','No, thank you. We have a connection to make.']},
  {talk:'Julian Vance',lines:['...Then I’ll make the last announcement.','Someone has to.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {talk:'Julian Vance',lines:['He lifts his hat. Behind his head, the big door’s gold clock spins, and every flap in the terminal clicks at once.','FINAL CALL.']},
  {call:()=>{ sfx.whoosh&&sfx.whoosh(); }},
  {despawn:'Long coat'},
  {flag:'ch11-vance'}, {call:()=>storyWorld()},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Amy',lines:['Positions. Tom in front. Girls behind. Nobody lets that board call their name and sit down.']},
  {talk:'Grace',lines:['Rose, when it calls you, move. Don’t stop to look at anything.']},
  {talk:'Rose',lines:['I won’t look at anything.']},
  {talk:'Rose',lines:['...I looked at one thing.']},
  {talk:'Tom',lines:['If somebody gets called and can’t move, I’ll walk them on. And if we need a friend in a hurry, wave to the bench.']},
  {toast:'Tip: ▼ Bag, BENCH CALL swaps in a friend from the bench. Tom DEFENDs anyone who is called.',time:6},
  {battle:'finalcall',tut:'finalcall'},
  {if:()=>flag('battle:finalcall')!=='win',then:[
    {heal:true},
    {talk:'Amy',lines:['Up, everybody. Walk it off. It calls one of us every turn. Move before it goes again, or Tom walks you on.']},
    {toast:'Face FINAL CALL (near the big door) and press A to try again. Everyone is healed.',time:5}],else:[]}
];

// After the boss (won in the scene, or on a retry): the board flaps, Long Island closes, Deedee does not pick up.
SCENES.ch11After=()=>[
  {flag:'ch11-after',value:'pending'},
  {call:()=>sfx.levelChime&&sfx.levelChime()},
  ...(flag('kind:finalcall')?[
    {talk:'FINAL CALL',lines:['...You asked the board to come. Nobody asked the board.','I think I just wanted to be on one flight.']},
    {talk:'Amy',lines:['Then you’re on one. Seat 18C. Don’t recline.']}]:[
    {talk:'FINAL CALL',lines:['...ON TIME. ON TIME. ON TIME.','It’s fine. They’re all on time. I am not.']},
    {talk:'Amy',lines:['Nobody is cancelling you. You just never got a boarding pass. Here. Take mine.']}]),
  {talk:'Tom',lines:['Something is dropping out of the gate clock. A gold coin, with a little clock face. Number nine.']},
  {call:()=>sfx.pickup&&sfx.pickup()},
  {talk:'Tom',lines:['It’s warm. Whatever Vance was holding, it wasn’t his.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Speaker',lines:['DING. Attention, passengers. The departures board has been updated.']},
  {call:()=>sfx.whoosh&&sfx.whoosh()},
  {fade:'out',time:.7},
  {call:()=>{ switchMap({kind:'edge',to:'gate00',spawn:{x:9,y:11},facing:'up'}); camera.snap=true; }},
  {wait:.5},
  {fade:'in',time:.7},
  {talk:'Speaker',lines:['DING. LONG ISLAND: CLOSED. LOS ANGELES: NOW BOARDING.']},
  {flag:'ch11-closed'}, {call:()=>sfx.whoosh&&sfx.whoosh()}, {wait:1.6},
  {talk:'Grace',lines:['Tata. The little green town. It’s turning orange. No. Amber. Like a caution light.']},
  {talk:'Rose',lines:['Is Deedee okay?']},
  {talk:'Amy',lines:['I’m calling her. I’m calling her right now.']},
  {call:()=>sfx.ding&&sfx.ding()}, {wait:.8}, {call:()=>sfx.ding&&sfx.ding()}, {wait:.8}, {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Amy',lines:['It’s ringing. It’s just ringing. Mom always picks up. Mom picks up on the FIRST ring. She picks up before it rings.']},
  {talk:'Tom',lines:['Sit down. Everybody. Deep breath.','Dad’s in his recliner. Mom has the crisp. They’re fine. They’re probably fine.']},
  {talk:'TNB',lines:['Hey. We’ll go get them. Whatever he did, we’ll fix it. Things come apart. I fix things.']},
  {talk:'Tom',lines:['We’ll go get them. We always make our connection.']},
  {talk:'Rose',lines:['Which one is Los Angeles?']},
  {talk:'Tom',lines:['The orange one. It’s the only one still open.','And it’s where Nara and TNB live. It’s home. Our other home.']},
  {call:()=>sfx.levelChime&&sfx.levelChime()},
  {trace:'ch11-wrap'}, {hearts:'tom'}, {hearts:'amy'}, {hearts:'tnb'},
  {party:null},
  {fade:'out',time:.8}, {card:11,done:true,time:3.4}, {flag:'ch11-done'}, {fade:'in',time:.8},
  {toast:'CHAPTER 11 COMPLETE! Chapter 12 is still being built. Los Angeles is open, but its door is not.',time:7},
  {save:true}
];

TRIGGERS.push(
  {id:'ch11-after',map:'concourse',when:{...CH11,flag:{'battle:finalcall':'win'},notFlag:'ch11-done'},scene:'ch11After'}
);
// FINAL CALL stays folded up beside the big door until Julian Vance has made his announcement, and goes quiet after the win.
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  const b=findMonster('finalcall'); if(!b) return;
  b.mscale=1.15;
  const under=STORY.chapter<11||(STORY.chapter===11&&!flag('ch11-vance'))||flag('battle:finalcall')==='win'||STORY.chapter>11;
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
});
TUTORIALS.finalcall={tips:[
  {id:'call',who:'*',text:'NOW BOARDING: each turn it calls someone (gold BOARDING tag). They must act before its next turn, or the gate closes on them and they lose a turn.'},
  {id:'escort',who:'tom',dir:'right',when:()=>B2.foes.some(f=>f.call&&b2Alive(f.call)&&f.call.id!=='tom'&&f.call.st.boarding&&!f.call.st.guarded),
    text:'Called someone slow? ▶ DEFEND, then pick them: Tom walks them onto the plane.'},
  {id:'bench',who:'*',dir:'down',care:1,when:()=>b2BenchReady&&b2BenchReady(),text:'▼ Bag, BENCH CALL: the fourth member sits out and a friend from the bench hops in. Costs a turn.'},
  {id:'final',who:['tom','grace','rose','amy','tnb','nara'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>!r.why),text:'CANCELLED is coming. Any ◀ TOMBO (try Sleepover at Tom’s) smashes its guard in one go.'},
  {id:'final2',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'CANCELLED on everyone next turn! Break its guard: 2 Kinetic or Sparkle hits, or any Tombo.'},
  {id:'fly',who:'*',dir:'down',care:1,text:'It has never once got to fly. ▼ Bag, LET IT FLY. Three times and it comes along, happy.'}]};

// Gate Infinity and the Lost & Found.
const LE_pressAction_ch11=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full'&&STORY.chapter===11) {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object'&&v.gateinfinity&&flag('ch11-met')) {
      if(flag('ch11-done')) { openDialog(v.name,['LOS ANGELES: NOW BOARDING.','Chapter 12 is still being built. Long Island is amber. Los Angeles is open, and waiting.']); saveGame('auto',true); return; }
      if(!flag('ch11-vance')) { playScene('ch11Vance'); return; }
      openDialog(v.name,['GATE INFINITY. FINAL CALL. Something with robot legs is standing in the way. Walk into it to try again.']); return;
    }
    if(t&&t.kind==='object'&&v.lostfound&&flag('ch11-met')) {
      if(flag('ch11-lost')) { openDialog(v.name,['LOST AND FOUND. The bell, the shelves, the ledger. FOUND: ONE TOM. HELD FOR PICKUP. NO RUSH.']); return; }
      playScene('ch11Lost'); return;
    }
  }
  return LE_pressAction_ch11();
};
