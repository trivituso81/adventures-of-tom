'use strict';
// data/scenes-ch13.js — Part 2, Chapter 13 "The Subway Beneath the Sea of Clouds". Loaded after data/scenes-ch12.js.
// Long Island is under Boppy's amber dome and the only way in is under it. Sol (Angel City Cab Co.) and Sal (inside the dome) turn out to be
// cousins who have run a secret dispatch network, the Network, for eleven years, and bored the Transcontinental Sub-Rail under the Layover
// for a hobby. Grace and Rose run the dispatch radio from the cab stand; Tom, Amy, TNB and Nara go down. HUSH-9 (Vance's quiet car) debuts
// in the tunnel and sets the Dual-Coast Drill Worm on the noise. After the Worm, Penny and Nickel give up their last gold coins and melt a
// doorway through the amber. The last scene is Boppy at the Rivituso door in glowing armor. He made a deal.
// Flags, in order: ch13-open (Sol's scene played; the chapter begins), ch13-depot (the platform: Nickel's confession), ch13-hush (HUSH-9
// debuts), ch13-worm (the Worm rises), battle:drillworm ('win'), ch13-clear (the fight's talk is over), ch13-melt (the coins are melting the
// plate), ch13-melted (the doorway is open), ch13-gate (Boppy at the Rivituso door), ch13-done (CHAPTER 13 COMPLETE).
const CH13={mode:'full',chapter:13};
Object.assign(items,{
  hardhat:{name:'Hard Hat',icon:'⛑',slot:null,keepsake:true,desc:'Sal and Sol’s hard hat, off the Drill Worm. Inside the brim, in two different handwritings: SAL + SOL, OPENING DAY. NOBODY PROMISED WHICH YEAR.'}});
palettes.hush9={skin:'#aab0bc',hair:'#2b2e38',shirt:'#4a4f5c',pants:'#2b2e38',hat:'#2b2e38'};

// The girls run the radio from the cab stand. setGirlsAway(true) parks them at Amy's house on Long Island; chapter 13 moves them to the
// cab stand (worlds.lacab) instead, with radio lines. STORY_WORLD below keeps this true after a load. Chapter 14 brings them back
// (setGirlsAway(false) below clears every girlAtHome NPC first).
const CH13_GIRL_LINES={
  Grace:['Dispatch to Tom. Do you copy? Say “over.” At the END.','I have a clipboard. Sol gave me a clipboard. I am extremely organized.','Mommy said stay. So I am staying. LOUDLY.'],
  Rose:['I’m in charge of snacks. I have eleven pretzels. I counted. One is for Tata.','Is Tata under the world? Can he hear me? HI TATA.','I’m not allowed to touch the big red button. I touched it a little.']};
function ch13Girls() {
  if(!girlsAway()) setGirlsAway(true);
  const home=worlds.amyhouse,room=worlds.lacab; if(!home||!room) return;
  const gs=home.npcs.filter(n=>n.girlAtHome);
  home.npcs=home.npcs.filter(n=>!n.girlAtHome);
  for(const g of gs) {
    if(room.npcs.some(n=>n.girlAtHome&&n.name===g.name)) continue;
    Object.assign(g,{x:g.name==='Grace'?3:4,y:g.name==='Grace'?5:6,move:null,path:[],lines:CH13_GIRL_LINES[g.name]||g.lines,visitedOnce:false});
    room.npcs.push(g);
  }
}
const LE_setGirlsAway_ch13=setGirlsAway;
setGirlsAway=function(away) {
  if(!away) for(const m of Object.values(worlds)) m.npcs=m.npcs.filter(n=>!n.girlAtHome);
  LE_setGirlsAway_ch13(away);
};
// Put the party somewhere on a chapter 13 map (or on Rivituso Row for the last scene).
function ch13Place(map,x,y,dir) {
  currentMap=worlds[map]; player.x=x; player.y=y; player.facing=dir||'right'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
const ch13Npc=name=>currentMap.npcs.find(n=>n.name===name&&n.scripted);

SCENES.ch13Open=[
  {flag:'ch13-open',value:'pending'},
  {talk:'Tom',lines:['Sol. Sal says there’s a way under the dome. Tell me you know where.']},
  {talk:'Sol',lines:['Tom. Sit. Not that chair. That chair is Sal’s. I keep it warm for him out of spite.']},
  {talk:'Sol',lines:['Okay. Sal and I are cousins. You know that. What you don’t know is what we do between airport runs.']},
  {talk:'Grace',lines:['Is it crimes?']},
  {talk:'Sol',lines:['Letters. Eleven years of letters, Snail Mail to Los Angeles, in the trunks of cabs. Nobody ever opened a bag. Nobody ever asked why two cab companies need a hundred sacks of stamps.']},
  {talk:'Amy',lines:['You’ve been running a secret mail route.']},
  {talk:'Sol',lines:['A dispatch network. We call it the Network. We never came up with a better name.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Sal',lines:['Sol. Sol, come in. It’s Sal. Cab seven says hi. She’s fine. She’s the only thing in town that’s moving.']},
  {talk:'Sol',lines:['Sal. I have Tom, his sister, two nieces, a boyfriend and a dog in my lobby. Say hi.']},
  {talk:'Sal',lines:['Tommy! It’s quiet in here. Even the clocks are quiet. Your mother’s in the kitchen. Don’t panic. She’s fine. She just won’t stop baking.']},
  {talk:'Tom',lines:['Sal. Can you get me in?']},
  {talk:'Sal',lines:['I’m under the dome with a shovel and a very worried shopkeeper. I can’t get out. But I can dig toward you.']},
  {talk:'Sol',lines:['The Sub-Rail. Sal and I bored a tunnel under the Layover, from both coasts, for a hobby. It was supposed to open in 2031. It meets in the middle, right under the dome.']},
  {talk:'TNB',lines:['You built a transcontinental subway. As a hobby.']},
  {talk:'Sol',lines:['We got a very good deal on a drill.']},
  {talk:'Sal',lines:['The drill stopped answering when the dome came down. Something put a chip in it. Be careful of the worm.']},
  {talk:'Tom',lines:['The worm.']},
  {talk:'Sol',lines:['The drill. We call her the Dual-Coast Drill. The kids at the depot call her the Worm. She doesn’t love it.']},
  {talk:'Sol',lines:['I need dispatchers. Two of them. Radio only. Somebody has to read me the tunnel.']},
  {talk:'Grace',lines:['I’m extremely good at being in charge.']},
  {talk:'Rose',lines:['I’m in charge of snacks.']},
  {talk:'Amy',lines:['Girls. Dispatch is the most important job in the building. If Sol says stay, you stay.']},
  {talk:'Grace',lines:['Copy.']},
  {talk:'Rose',lines:['Copy copy.']},
  {talk:'Amy',lines:['Sol. I am leaving my children with a cab driver.']},
  {talk:'Sol',lines:['Thirty years. Never lost a passenger. Found two in the trunk. Both were fine.']},
  {talk:'Amy',lines:['Somehow that is not comforting.']},
  {talk:'Tom',lines:['We’ll be on the radio the whole way. Grace, you’re the voice. Rose, you’re the snacks.']},
  {talk:'Rose',lines:['Snacks are critical infrastructure.']},
  {talk:'Tom',lines:['TNB. Nara. Amy. With me. We go down.']},
  {talk:'TNB',lines:['I have my thermos. I’m always ready for a tunnel.']},
  {talk:'Nara',lines:['Nara has never been this ready for anything. She is already at the Metro stairs, vibrating.']},
  {talk:'Sol',lines:['Out the door, the Metro stairs on the boulevard. Past the turnstile, there’s a door that says EMPLOYEES ONLY. That’s you. You’re employees now.']},
  {call:()=>sfx.whoosh&&sfx.whoosh()},
  {fade:'out',time:.8},
  {card:13,time:3.2},
  {call:()=>{ setChapter(13); setFlag('ch13-open','pending'); ch13Girls(); sfx.travel&&sfx.travel(); ch13Place('subdepot',8,5,'left'); }},
  {join:'tnb',quiet:true},{join:'nara',quiet:true},{call:()=>placeFollowers()},
  {flag:'ch13-open'},
  {wait:.5},
  {fade:'in',time:.7}
];

SCENES.ch13Depot=[
  {flag:'ch13-depot',value:'pending'},
  {talk:'Tom',lines:['EMPLOYEES ONLY. A platform under the boulevard. And a tunnel.']},
  {talk:'TNB',lines:['I have ridden every line in this city. I didn’t know this one existed. I’m a little bit offended.']},
  {talk:'Grace',lines:['Dispatch to Tom. Radio check. Say “over.”']},
  {talk:'Tom',lines:['Over.']},
  {talk:'Grace',lines:['At the END, Tata. You say it at the end of what you say.']},
  {talk:'Tom',lines:['I said it at the end. It was the only thing I said.']},
  {talk:'Rose',lines:['Snack check! Check your pockets! I put a pretzel in your left one!']},
  {talk:'Tom',lines:['...There’s a pretzel in my left pocket.']},
  {give:'pretzels'},
  {spawn:{name:'Nickel',look:'nickel',at:[1,5],dir:'right'}},
  {walk:'Nickel',to:[[2,5],[3,5],[4,5],[5,5],[6,5]],speed:.28}, {face:'Nickel',dir:'right'},
  {talk:'Nickel',lines:['Tom! Good. Okay. Before you go in, I have to tell you something, and I have to say it fast, because Penny made me promise.']},
  {talk:'Tom',lines:['Nickel. You’re shaking.']},
  {talk:'Nickel',lines:['A man in a long coat bought gold coins from our shops. For years. Paid double. Never took his hat off.']},
  {talk:'Amy',lines:['Julian Vance.']},
  {talk:'Nickel',lines:['We didn’t know. We thought he was a collector. We took the money. And we kept the best coins in the back, in case he ever paid triple.']},
  {talk:'Nickel',lines:['Penny called on the Network from under the dome. She said, “Tell Tom we’re sorry.” And then she said, “The drawer is under the counter.”']},
  {talk:'Nickel',lines:['Eleven coins. Hers and mine. The last of the old gold. They were supposed to be a retirement.']},
  {talk:'TNB',lines:['Why bring them?']},
  {talk:'Nickel',lines:['Sal says gold remembers being warm. If amber is warmth that got stuck, then gold can give it somewhere to go. He says. I don’t know. He’s a cab driver.']},
  {talk:'Tom',lines:['You’re giving up your retirement.']},
  {talk:'Nickel',lines:['I’m giving up a drawer. It’s the best drawer I ever had. Go. I’ll bring them down behind you. Sol’s driving me to the second mile marker and making me run.']},
  {talk:'Amy',lines:['You don’t have to do this.']},
  {talk:'Nickel',lines:['Yes, I do. Somebody gave me a shop. I’d like to be somebody who gave something back.']},
  {walk:'Nickel',to:[[5,5],[4,5],[3,5],[2,5],[1,5]],speed:.28}, {despawn:'Nickel'},
  {talk:'Tom',lines:['The tracks run east. We follow the rails.']},
  {talk:'Amy',lines:['Stay together. Nobody falls behind. I’ll be counting.']},
  {trace:'ch13-depot'}, {hearts:'tom'},
  {toast:'Goal: follow the rails east through the Sub-Rail tunnel. The coffee machines restore everyone.',time:6},
  {flag:'ch13-depot'},
  {save:true}
];

SCENES.ch13Hush=[
  {flag:'ch13-hush',value:'pending'},
  {talk:'Grace',lines:['Dispatch to Tom. You’re at mile marker one thousand two hundred and fifty. But the tunnel is forty feet long. Is that normal?']},
  {talk:'Tom',lines:['The sign says halfway. I’m choosing to believe the sign.']},
  {talk:'Rose',lines:['Tata, did you see the stone in the doorway? It’s STANDING. I think it’s the bouncer.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {talk:'Grace',lines:['Dispatch to Tom. You’re breaking up. Say... over... Tata?']},
  {talk:'Rose',lines:['Tata? I can’t hear the... Tata? Tata?']},
  {talk:'Tom',lines:['Grace? Rose? The radio’s gone. It’s not static. It’s just gone.']},
  {spawn:{name:'HUSH-9',look:'hush9',at:[34,7],dir:'left'}},
  {call:()=>{ const h=ch13Npc('HUSH-9'); if(h) h.hush=true; }},
  {walk:'HUSH-9',to:[[33,7],[32,7],[31,7],[30,7],[29,7],[28,7]],speed:.3}, {face:'HUSH-9',dir:'left'},
  {talk:'HUSH-9',lines:['THIS IS A QUIET CAR.']},
  {talk:'Nara',lines:['Nara barks. Nothing comes out. She tries again. Nothing. She looks at her own mouth, deeply offended.']},
  {talk:'HUSH-9',lines:['Noise is a leak. Families are the loudest leak I have ever measured.']},
  {talk:'Amy',lines:['Who are you?']},
  {talk:'HUSH-9',lines:['HUSH-9. Quiet Car, Series Nine. Property of Mr. Vance. Mr. Vance likes it quiet. Quiet is safe.']},
  {talk:'Tom',lines:['That’s the second time today somebody has told me quiet is safe. Marlowe said it too.']},
  {talk:'HUSH-9',lines:['Marlowe takes the color. I take the sound. We are a very good team. Please lower your voices.']},
  {talk:'TNB',lines:['We’re being pretty quiet right now.']},
  {talk:'HUSH-9',lines:['You are breathing audibly.']},
  {talk:'Amy',lines:['I teach kids for a living. I know what a person sounds like right before they say “be quiet.” You’re in the wrong tunnel.']},
  {talk:'HUSH-9',lines:['I have given the Drill a chip. It no longer digs toward a place. It digs toward the noise. Please observe the quiet. Goodbye.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {walk:'HUSH-9',to:[[29,7],[30,7],[31,7],[32,7],[33,7],[34,7]],speed:.3}, {despawn:'HUSH-9'},
  {talk:'TNB',lines:['He left the quiet on. Is anybody else’s ears ringing?']},
  {talk:'Tom',lines:['The chip makes it listen for noise. So we make a lot of it. Loudly. Together.']},
  {talk:'Amy',lines:['I’ve been trying to get Rose to use her indoor voice for six years. I’m glad somebody finally wants her outdoor one.']},
  {trace:'hush-debut'}, {hearts:'amy'}, {hearts:'tnb'},
  {toast:'Goal: find the Drill Worm at the end of the tunnel (east). Chatter and Kinetic hits break its hush chip.',time:7},
  {flag:'ch13-hush'}
];

SCENES.ch13Worm=[
  {flag:'ch13-worm',value:'pending'},
  {talk:'Tom',lines:['A cavern. A wall of amber the size of a house. And a hole in the dirt exactly the width of a drill.']},
  {call:()=>{ setFlag('ch13-worm'); storyWorld(); sfx.thud&&sfx.thud(); }}, {wait:1.4},
  {talk:'Amy',lines:['That is the biggest drill I have ever seen.']},
  {talk:'TNB',lines:['That’s a Dual-Coast Drill. They went with the budget model. I can tell by the bolts.']},
  {talk:'Tom',lines:['It’s not charging. It’s digging in place. Round and round.']},
  {talk:'Amy',lines:['Its lamps are pointed at the amber. Like it wants to dig through and can’t.']},
  {talk:'TNB',lines:['It’s been drilling at that wall for years. Nobody told it to stop.']},
  {talk:'Nara',lines:['Nara sits very still. She has never seen anything so large that wanted so little.']},
  {talk:'Tom',lines:['Hit it if it hits back. Be kind first. Amy, heal. TNB, I’m on the chip. Everybody make some noise.']},
  {toast:'Tip: Chatter and Kinetic hits break its hush chip. ▼ Bag, TAKE FIVE, is the kind way to win.',time:6},
  {battle:'drillworm',tut:'ch13'},
  {if:()=>flag('battle:drillworm')!=='win',then:[
    {heal:true},
    {talk:'Amy',lines:['Everybody okay? Good. It brings the roof down every third turn, so we heal before, not after.']},
    {toast:'Face the Drill Worm (the cavern, east of the tracks) and press A to try again. Everyone is healed.',time:5}],else:[]}
];

SCENES.ch13After=()=>[
  {flag:'ch13-after',value:'pending'},
  {call:()=>sfx.levelChime&&sfx.levelChime()},
  ...(flag('kind:drillworm')?[
    {talk:'Drill Worm',lines:['...Five? Five minutes. Nobody ever told me I could stop.','I’ve been drilling since 1952. I don’t even remember what I was looking for.']},
    {talk:'Amy',lines:['Union rules. Hydrate. And when you’re ready, we’ll tell you where you were going.']}]:[
    {talk:'Drill Worm',lines:['...Bit’s down. Engine’s off. I wasn’t going anywhere. I was just digging in.','I’m sorry about the roof.']},
    {talk:'Amy',lines:['It’s fine. Nobody’s mad at a drill. They’re mad at whoever put a chip in it.']}]),
  {call:()=>sfx.pickup&&sfx.pickup()},
  {talk:'Tom',lines:['A little grey cube just popped out of its side. The hush chip. It’s very quiet.']},
  {talk:'TNB',lines:['Not anymore.']},
  {give:'hardhat'},
  {talk:'Rose',lines:['TATA! We can hear you! Sol says the radio is back! I ate a snack for you!']},
  {talk:'Grace',lines:['Dispatch to Tom. You’re loud and clear. What happened? Say over. At the END.']},
  {talk:'Tom',lines:['We took care of it. Over.']},
  {talk:'Grace',lines:['See? You can do it.']},
  {flag:'ch13-clear'}, {call:()=>storyWorld()},
  // Nickel arrives from the west with the coins; Sal and Penny are on the far side of the amber.
  {spawn:{name:'Nickel',look:'nickel',at:[1,6],dir:'right'}},
  {walk:'Nickel',to:[[2,6],[3,6],[4,6],[5,6],[6,6],[7,6]],speed:.28}, {face:'Nickel',dir:'right'},
  {talk:'Nickel',lines:['Tom! Sol drove me to the second mile marker and made me run. I have never been so tired and so right.']},
  {talk:'Nickel',lines:['Eleven coins. Mine are in this bag. Penny’s are on the other side of that wall.']},
  {spawn:{name:'Sal',look:'sal',at:[22,6],dir:'left'}},
  {spawn:{name:'Penny',look:'penny',at:[22,7],dir:'left'}},
  {talk:'Tom',lines:['The amber is clear on one side. There’s a pocket behind it. Two people are in it. One of them is waving a shovel.']},
  {talk:'Sal',lines:['(through the glass) TOMMY! Over here! Hi! Don’t hug the amber, it’s sticky!']},
  {talk:'Penny',lines:['(through the glass) Tom! I’m so sorry! Nickel, hold up the drawer! I’ve got mine!']},
  {talk:'Nickel',lines:['Eleven coins. Hers and mine. On three.']},
  {talk:'Penny',lines:['(through the glass) One. Two. Don’t think about the interest. Three.']},
  {call:()=>{ sfx.charge&&sfx.charge(); setFlag('ch13-melt'); }}, {wait:3.4},
  {call:()=>{ const m=worlds.subchamber; if(m) for(const y of [6,7]) tile(m,20,y,'subgold',false); setFlag('ch13-melted'); sfx.ding&&sfx.ding(); }},
  {talk:'Tom',lines:['The coins glow, and then they run. Gold down the glass like honey. The amber sighs and opens. Right at the height of a door.']},
  {talk:'Sal',lines:['It worked! Gold remembers being warm! I told you! Nobody ever believes the cab driver!']},
  {walk:'Sal',to:[[21,6],[20,6],[19,6],[18,6]],speed:.28},
  {walk:'Penny',to:[[21,7],[20,7],[19,7],[18,7]],speed:.28},
  {talk:'Penny',lines:['Nickel.']},
  {talk:'Nickel',lines:['Penny.']},
  {talk:'Penny',lines:['I was saving for a boat.']},
  {talk:'Nickel',lines:['You don’t know how to drive a boat.']},
  {talk:'Penny',lines:['That’s why it was a savings.']},
  {talk:'Sal',lines:['Tommy. Sol and I started this tunnel in 2011 with a shovel and a very good deal on a drill. I never thought anyone would walk through it.']},
  {talk:'Tom',lines:['Sal. You’re the reason I got home.']},
  {talk:'Sal',lines:['I’m a cab driver. That’s the whole job.']},
  {talk:'Penny',lines:['Tom. I’m sorry. I sold him the coins. I took the money and I didn’t ask.']},
  {talk:'Tom',lines:['You gave back the best drawer you ever had. We’re square.']},
  {talk:'Penny',lines:['It was a very good drawer.']},
  {talk:'TNB',lines:['Can I say something? I’ve spent a lot of time fixing mugs somebody dropped. You don’t get the mug back. You get a better mug, with a gold line where it broke.']},
  {talk:'Penny',lines:['That’s a very nice way to say it.']},
  {talk:'TNB',lines:['It’s called kintsugi. It’s also called Tuesday.']},
  {talk:'Amy',lines:['TNB. You fought like somebody who’s done it his whole life.']},
  {talk:'TNB',lines:['I’ve carried a lot of coffee in my life. It’s mostly timing.']},
  {talk:'Amy',lines:['You fix things. That’s good. Nobody fixes things anymore. They throw them out and buy a new one.']},
  {talk:'TNB',lines:['I’m worried about him. About Tom. He says he’s fine. He’s not very good at saying the other thing.']},
  {talk:'Amy',lines:['Tom is worried about everyone except himself. We take turns. You’re on the schedule now.']},
  {talk:'TNB',lines:['I’d like that.']},
  {talk:'Tom',lines:['I’m standing right here.']},
  {talk:'Amy',lines:['It’s a very nice schedule.']},
  {talk:'Sal',lines:['Okay. The Sub-Rail runs the rest of the way, up under Grump Hollow. It comes out at the breach. Sol’s putting the girls on the five fifteen handcar.']},
  {talk:'Grace',lines:['We heard the whole thing. Mommy. We are coming. Do not do anything dramatic.']},
  {talk:'Rose',lines:['Copy copy! Tata, I have a pretzel for Nara!']},
  {talk:'Amy',lines:['Grace. Rose. You stay with Sol until the handcar. I love you. I’m not being dramatic.']},
  {talk:'Grace',lines:['You’re being a little dramatic.']},
  {talk:'Amy',lines:['A little.']},
  {trace:'ch13-melt'}, {hearts:'tom'}, {hearts:'amy'}, {hearts:'tnb'},
  {call:()=>{ for(const nm of ['Sal','Penny','Nickel','Drill Worm']) { const n=ch13Npc(nm); if(n) n.hidden=true; } }},
  {despawn:'Sal'},{despawn:'Penny'},{despawn:'Nickel'},
  {flag:'ch13-after'},
  {call:()=>sfx.whoosh&&sfx.whoosh()},
  {fade:'out',time:.8},
  {call:()=>{ ch13Place('row',15,11,'up'); }},
  {wait:.6},
  {fade:'in',time:.8},
  {wait:.4},
  {talk:'Tom',lines:['Rivituso Row. The tomatoes are fine. The peppers are fine. Everything is exactly where it was.']},
  {talk:'Tom',lines:['And nothing is moving.']},
  {talk:'Amy',lines:['The sprinkler. Every drop is hanging in the air. It’s the prettiest thing I’ve ever seen and I hate it.']},
  {talk:'TNB',lines:['It’s so quiet. This is the quietest place I’ve ever been. And I live near a freeway.']},
  {spawn:{name:'Boppy',look:'gus',at:[18,8],dir:'down'}},
  {call:()=>{ const b=ch13Npc('Boppy'); if(b) Object.assign(b,{sheet:'boppy',armor:true,duration:.96,lines:CH13_BOPPY_LINES}); }},
  {walk:'tom',to:[[15,10],[15,9],[16,9],[17,9],[18,9]],speed:.3}, {face:'tom',dir:'up'},
  {talk:'Tom',lines:['Dad.']},
  {talk:'Boppy',lines:['Halt.']},
  {talk:'Amy',lines:['Dad? What are you wearing?']},
  {talk:'Boppy',lines:['Warden’s plate. Gold. It hums. I like the hum.']},
  {talk:'Boppy',lines:['My back doesn’t hurt, Tommy. It’s been eleven years. I made a deal.']},
  {talk:'Tom',lines:['What deal?']},
  {talk:'Boppy',lines:['Nobody gets hurt. Nobody gets old. Nobody gets left. Your mother’s inside. She’s fine. She’s making a crisp.']},
  {talk:'Boppy',lines:['I stand here and the glass stays up. That’s the deal.']},
  {talk:'Tom',lines:['Dad. That isn’t safe. That’s a freezer.']},
  {talk:'Boppy',lines:['Go home, Tom. Take your friends. Go back to the good coast.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {talk:'Amy',lines:['Dad. Take that off. You’ll rust.']},
  {talk:'Boppy',lines:['...Amy. You’re not supposed to be here. You’re supposed to be safe.']},
  {talk:'Amy',lines:['I’m supposed to be your daughter.']},
  {talk:'Boppy',lines:['Go home.']},
  {talk:'TNB',lines:['He said go home. Twice. That’s a man who wants an argument.']},
  {talk:'Tom',lines:['He’s my dad. He wants a lot of arguments.']},
  {talk:'Tom',lines:['We’re not leaving. We always make our connection.']},
  {trace:'ch13-wrap'}, {hearts:'tom'}, {hearts:'amy'}, {hearts:'tnb'},
  {flag:'ch13-gate'},
  {fade:'out',time:.8}, {card:13,done:true,time:3.4}, {flag:'ch13-done'}, {fade:'in',time:.8},
  {toast:'Goal: Warden Boppy is at the Rivituso door.',time:7},
  {call:()=>showToast&&showToast('CHAPTER 13 COMPLETE!',5)},
  {save:true}
];
const CH13_BOPPY_LINES=['The armor hums. Boppy does not move. His eyes follow you. Everything else is gold.','“Go home, Tom. Take your friends. Go back to the good coast.”','“The glass stays up. That’s the deal.”'];

TRIGGERS.push(
  {id:'ch13-depot',map:'subdepot',when:{...CH13,flag:'ch13-open',notFlag:'ch13-depot'},scene:'ch13Depot'},
  {id:'ch13-hush',map:'subtunnel',at:[21,2,23,9],when:{...CH13,flag:'ch13-depot',notFlag:'ch13-hush'},scene:'ch13Hush'},
  {id:'ch13-worm',map:'subchamber',when:{...CH13,flag:'ch13-hush',notFlag:'ch13-worm'},scene:'ch13Worm'},
  {id:'ch13-after',map:'subchamber',when:{...CH13,flag:{'battle:drillworm':'win'},notFlag:'ch13-after'},scene:'ch13After'}
);

// World state: the Worm sleeps under the dirt until the chamber scene; it is gone once beaten. While chapter 13 is the chapter the girls
// are at the cab stand (a save load puts them back at Amy's house first). After chapter 13 Boppy stands at the Rivituso door, through chapter 14 until the Warden fight is won (data/scenes-ch14.js).
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  const b=findMonster('drillworm');
  if(b) {
    const under=STORY.chapter!==13||!flag('ch13-worm')||flag('battle:drillworm')==='win';
    if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
    else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
    b.mscale=1.5;
  }
  const ch=worlds.subchamber;
  if(ch&&flag('ch13-melted')&&ch.tiles[6][20]!=='subgold') for(const y of [6,7]) tile(ch,20,y,'subgold',false);
  if(STORY.chapter===13&&girlsAway()) ch13Girls();
  if(((STORY.chapter===13&&flag('ch13-done'))||(STORY.chapter===14&&!flag('ch14-after')))&&!intro.active) {
    const row=worlds.row;
    if(row&&!row.npcs.some(n=>n.scripted&&n.name==='Boppy')) {
      const a=actor('Boppy',18,8,'gus',CH13_BOPPY_LINES);
      Object.assign(a,{sheet:'boppy',armor:true,duration:.96,scripted:true,tier:0,maxHp:1,defeatedUntil:0,roam:0,facing:'down',monster:null});
      row.npcs.push(a);
    }
  }
});
HOLD_RULES.push(n=>n.monster==='drillworm');
TUTORIALS.ch13={tips:[
  {id:'cave',who:'*',text:'Every third turn it brings the roof down on everyone: CAVE-IN. It shows on the turn ribbon first, so heal up after.'},
  {id:'chip',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'FULL BORE on everyone next turn! Break its hush chip: 2 Chatter or Kinetic hits, or any Tombo. Noise is what it cannot stand.'},
  {id:'five',who:'*',dir:'down',care:1,text:'It has been digging since 1952 and nobody told it to stop. ▼ Bag, TAKE FIVE. Three times and it puts the drill down.'}]};

// ---------- Sol, the Metro stairs, and the way back down ----------
// Sol starts the chapter (chapter 12 is over and the Sub-Rail has not opened yet). Once it has, the Metro stairs on the boulevard lead back
// down to the depot until the chapter is over.
const LE_talkToDriver_ch13=talkToDriver;
talkToDriver=function(n) {
  if(STORY.mode==='full'&&n.name==='Sol'&&STORY.chapter===12&&flag('ch12-done')&&!flag('ch13-open')) { playScene('ch13Open'); return; }
  return LE_talkToDriver_ch13(n);
};
const LE_pressAction_ch13=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full'&&STORY.chapter===13&&flag('ch13-open')&&!flag('ch13-done')&&currentMap.id==='blvd') {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object'&&v.kind==='metro') {
      openChoice('Metro stairs',['EMPLOYEES ONLY. The door to the Sub-Rail is just past the turnstile.'],[
        {label:'GO DOWN',fn:()=>playScene(()=>[{fade:'out',time:.5},{call:()=>{ sfx.travel&&sfx.travel(); ch13Place('subdepot',3,5,'right'); }},{fade:'in',time:.5}],{keep:false})},
        {label:'NOT NOW',fn:()=>{}}]);
      return;
    }
  }
  return LE_pressAction_ch13();
};
