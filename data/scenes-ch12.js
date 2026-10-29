'use strict';
// data/scenes-ch12.js — Part 2, Chapter 12 "Welcome to Jefferson Park, Girls". Loaded after data/scenes-p2.js.
// Los Angeles is the only gate still open. The girls and Amy see Tom's home (Bready Mercury, the photo wall), TNB's loft, and Amy and
// TNB bond. Then Monochrome Marlowe (Vance's fixer) greys out Jefferson Park and sets the neighbors in amber. The party thaws Doña
// Carmen (a warm pupusa) and the Alvarez house (Amy runs laps with the girls: Run With Us, Mommy!, tombo:ff2), and the street's
// last red light becomes the boss: Gridlock Prime. Kindness route: GIVE IT A GREEN LIGHT x3.
// Flags, in order: ch12-open (Gate Infinity pressed; the chapter begins), ch12-arrive (arrival on 2nd Ave), ch12-house (Bready
// Mercury and the photo wall), ch12-studio (TNB's loft; Amy and TNB), ch12-marlowe (Marlowe on Jefferson; ch12-grey is the greyed block),
// ch12-carmen (Doña Carmen thawed), ch12-alvarez (the Alvarez house thawed; tombo:ff2), ch12-prime (Gridlock Prime parks across the
// intersection), battle:gridlockprime ('win'), ch12-clear (colour back, Marlowe leaves), ch12-done (CHAPTER 12 COMPLETE).
const CH12={mode:'full',chapter:12};
Object.assign(items,{
  greenlight:{name:'Green Light',icon:'\u{1F7E2}',slot:null,keepsake:true,desc:'The green lamp off Gridlock Prime, finally lit. It hums, very softly, whenever somebody is about to be let through.'}});

// Put the party on Jefferson Park, at the street by Tom's house.
function ch12Place() {
  currentMap=worlds.jpark; player.x=4; player.y=19; player.facing='up'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
SCENES.ch12Open=[
  {flag:'ch12-open',value:'pending'},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Speaker',lines:['DING. Attention, passengers. Los Angeles is now boarding. All other gates remain closed.']},
  {talk:'Tom',lines:['The gold clock on the big door finally has hands. They’re pointing at 3, 4, 6, 8.','That’s my address. The door knows where I live.']},
  {talk:'Rose',lines:['The door knows where you live? That’s so creepy. I love it.']},
  {talk:'TNB',lines:['Home. Okay. Good. I have a very good couch and a very bad idea of what’s in the fridge.']},
  {talk:'Nara',lines:['Nara hears the word home. Nara is already pressed against the door, vibrating.']},
  {talk:'Amy',lines:['Everybody together. Nobody gets left behind in the layover. That’s the only rule.']},
  {talk:'Grace',lines:['That’s two rules. Together, and nobody gets left.']},
  {talk:'Amy',lines:['They’re the same rule, Grace.']},
  {talk:'Tom',lines:['Dog on a leash. Girls on the buddy system. Here we go.']},
  {call:()=>sfx.whoosh&&sfx.whoosh()},
  {fade:'out',time:.8},
  {card:12,time:3.2},
  {call:()=>{ setChapter(12); setFlag('ch12-open',true); sfx.travel&&sfx.travel(); ch12Place(); }},
  {wait:.5},
  {fade:'in',time:.7}
];

SCENES.ch12Arrive=[
  {flag:'ch12-arrive',value:'pending'},
  {talk:'Tom',lines:['Jefferson Park. Same jacarandas, same lemon tree, same wood door.','Nothing is paused here. The sprinklers are even on.']},
  {talk:'Rose',lines:['It smells like lemons. And a little bit like a burrito.']},
  {talk:'Tom',lines:['That’s the lemon tree and Doña Carmen’s. Welcome to 3468.']},
  {talk:'Grace',lines:['Tata, you live in a real grown-up house. With flax.']},
  {talk:'Rose',lines:['What’s flax?']},
  {talk:'Tom',lines:['The red grass by the steps. It looks like it’s waving.']},
  {talk:'Rose',lines:['It’s waving at ME.']},
  {talk:'Amy',lines:['Wood door. A welcome mat in Japanese. Not one thing out of place.','I’ve known you thirty-some years, and I pictured a pile of laundry and a gaming chair.']},
  {talk:'Tom',lines:['TNB is the reason nothing is out of place.']},
  {talk:'TNB',lines:['I’m the reason there are coasters.']},
  {talk:'Nara',lines:['Nara checks the front gate. A squirrel is on the fence. Nara loses her entire mind.']},
  {talk:'Tom',lines:['Come in. I’ll show you where I live. Mind the dog. And the sourdough.']},
  {trace:'jpark-arrive'}, {hearts:'tom'},
  {toast:'Goal: go inside Tom’s house (the wood door, bottom left) and show the girls around.',time:5},
  {flag:'ch12-arrive'},
  {save:true}
];

SCENES.ch12House=[
  {flag:'ch12-house',value:'pending'},
  {talk:'Rose',lines:['Tata. TATA. There’s a jar. It’s bubbling. It’s ALIVE.']},
  {talk:'Tom',lines:['That’s Bready Mercury. He’s nine years old, he’s flown Delta One, and he’s the only one in this house who gets fed on time.']},
  {talk:'Grace',lines:['You named your bread Mercury? Like the planet?']},
  {talk:'Tom',lines:['Like the singer. He’s a showman. He rises on command.']},
  {talk:'Rose',lines:['Can he do a trick?']},
  {talk:'Tom',lines:['He rises. Every day. Without being asked. It’s the best trick anybody in this house does.']},
  {talk:'TNB',lines:['I do a trick where I turn a lump into a bowl.']},
  {talk:'Tom',lines:['You do. Yours is better. Don’t tell Bready.']},
  {talk:'Grace',lines:['Tata. There’s a picture of us. On the wall. In the nice frame.']},
  {talk:'Rose',lines:['There’s one of me with a sandwich. It’s my best side.']},
  {talk:'Tom',lines:['It’s the wall I walk past every morning. Before work. Before coffee.','I say good morning to the two of you.']},
  {talk:'Grace',lines:['Every morning?']},
  {talk:'Tom',lines:['Every morning. Rose usually says it back. In my head.']},
  {talk:'Rose',lines:['I said it back just now. Good morning, Tata.']},
  {talk:'Tom',lines:['Good morning, Rose.']},
  {talk:'Grace',lines:['So this is your house.']},
  {talk:'Tom',lines:['It’s yours too. I mean it. A snow globe called Long Island, and a house called this one. Both. Always both.']},
  {talk:'Amy',lines:['Tom. That wall is the nicest thing I’ve seen in a house in years.']},
  {talk:'Tom',lines:['It’s an Ikea frame. Don’t make it weird.']},
  {talk:'Amy',lines:['It’s a very nice Ikea frame.']},
  {talk:'Nara',lines:['Nara has climbed onto the couch. This is not allowed. She looks right at Tom. It is allowed.']},
  {talk:'TNB',lines:['Okay. Next stop, the loft. Everybody’s coming. I’ll show you where I break things on purpose.']},
  {trace:'bready-mercury'}, {hearts:'rose'}, {hearts:'grace'},
  {if:()=>!flag('ch12-studio'),then:[{toast:'Goal: visit TNB’s Loft in Downtown LA (north on 2nd Ave, then the Arts District).',time:5}],
    else:[{toast:'Goal: head back out to the street. Something is going on at Jefferson and 2nd.',time:5}]},
  {flag:'ch12-house'}
];

SCENES.ch12Loft=[
  {flag:'ch12-studio',value:'pending'},
  {talk:'TNB',lines:['This is it. The loft. Kiln, wheel, and a lot of clay in places clay shouldn’t be.']},
  {talk:'Grace',lines:['It’s so many mugs.']},
  {talk:'Rose',lines:['Can I touch the clay?']},
  {talk:'TNB',lines:['Rose. Come here. Wet hands. Sit. Put your thumb in the middle. Don’t push. Just open it.']},
  {talk:'Rose',lines:['It’s a hole.']},
  {talk:'TNB',lines:['It’s a bowl. It just doesn’t know yet.']},
  {talk:'Grace',lines:['Mine is leaning.']},
  {talk:'TNB',lines:['Leaning is a style. It’s called Pisa.']},
  {talk:'Amy',lines:['He taught my six-year-old to center clay in four minutes. I’ve been trying to get her to center her cereal for two years.']},
  {talk:'Rose',lines:['Clay doesn’t move. Cereal moves.']},
  {talk:'Amy',lines:['So. Tom. Tell me one thing he does when he thinks nobody is watching.']},
  {talk:'TNB',lines:['He checks the front door three times before bed. Tells me it’s for the dog.']},
  {talk:'Amy',lines:['He did that at nine. He told Mom it was for the cat.']},
  {talk:'TNB',lines:['You had a cat?']},
  {talk:'Amy',lines:['We never had a cat.']},
  {talk:'TNB',lines:['The first night I fired the big kiln alone, it was three in the morning. I looked up and he was standing in the doorway. With a thermos and a blanket. Just in case.']},
  {talk:'Amy',lines:['That is exactly him. He’s been standing in doorways with a thermos since he was nine.']},
  {talk:'TNB',lines:['He thinks I didn’t see him. I fired a second kiln so he’d have a reason to stay.']},
  {talk:'Amy',lines:['Okay. I like you. Don’t tell him.']},
  {talk:'TNB',lines:['He’s standing right behind you.']},
  {talk:'Tom',lines:['I was looking at a mug.']},
  {talk:'Amy',lines:['It’s a very nice mug.']},
  {talk:'Rose',lines:['Look! I made a bowl! It has a hat! The hat is a lump!']},
  {talk:'TNB',lines:['That’s the best bowl in the loft. It goes in the kiln tonight. You can pick it up when we’re all home safe.']},
  {trace:'amy-tnb-loft'}, {hearts:'amy'}, {hearts:'tnb'}, {hearts:'rose'},
  {if:()=>!flag('ch12-house'),then:[{toast:'Goal: go back to Jefferson Park and show the girls Tom’s house (the wood door, bottom left).',time:5}],
    else:[{toast:'Goal: head back to Jefferson Park. Something is going on at Jefferson and 2nd.',time:5}]},
  {flag:'ch12-studio'}
];

SCENES.ch12Marlowe=[
  {flag:'ch12-marlowe',value:'pending'},
  {spawn:{name:'Marlowe',look:'marlowe',at:[14,4],dir:'down'}},
  {walk:'Marlowe',to:[[14,5],[14,6],[14,7]],speed:.3}, {face:'Marlowe',dir:'down'},
  {talk:'Marlowe',lines:['Love it. Love the block. Love the lemons. So many lemons. What is that, a jacaranda? Needs less.']},
  {talk:'Tom',lines:['Excuse me. Who are you?']},
  {talk:'Marlowe',lines:['Marlowe. Monochrome Marlowe. I fix places. This place has a lot going on. Too much color, too many porches, a dog doing something on a lawn.']},
  {talk:'Nara',lines:['Nara, offended, does it again. On purpose.']},
  {talk:'Tom',lines:['That’s a neighborhood.']},
  {talk:'Marlowe',lines:['That’s the problem with a neighborhood. Notes.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {talk:'Marlowe',lines:['He lifts a clipboard. The top page says NOTES: LESS. He snaps his fingers.']},
  {flag:'ch12-grey'}, {call:()=>sfx.whoosh&&sfx.whoosh()}, {wait:1.8},
  {talk:'Rose',lines:['He took the pink off the jacaranda!']},
  {talk:'Grace',lines:['You can’t just take the pink!']},
  {talk:'Marlowe',lines:['I can take the pink, the yellow, and the music out of that window. Mr. Vance likes it quiet. Quiet is safe. Quiet sells.']},
  {talk:'Amy',lines:['I have twelve kids in my room who’ve had harder mornings than you. You don’t scare me. Colors back, please.']},
  {talk:'Marlowe',lines:['I don’t put things back. I take notes. Anyway, Mr. Prime will handle the intersection. Do take a look at the traffic. It’s very stationary.']},
  {talk:'Marlowe',lines:['He walks off into the grey, humming a jingle that never resolves.']},
  {despawn:'Marlowe'},
  {flag:'ch12-marlowe'}, {call:()=>storyWorld()},
  {talk:'Tom',lines:['He’s turning the whole block into a backlot. And he stopped something. Look at Mr. Washington.']},
  {talk:'TNB',lines:['That’s amber. It’s warmth that got stuck. Doña Carmen’s is right there, and the Alvarez house is down 2nd.']},
  {talk:'Tom',lines:['We check on the neighbors first.']},
  {trace:'marlowe-grey'}, {hearts:'amy'},
  {toast:'Goal: the neighbors are frozen in amber. Check Doña Carmen’s pupuseria and Casa Alvarez.',time:6}
];

SCENES.ch12Carmen=[
  {flag:'ch12-carmen',value:'pending'},
  {talk:'Rose',lines:['Tata. Doña Carmen turned into candy.']},
  {talk:'Tom',lines:['She’s amber. Mid-sentence.']},
  {talk:'Grace',lines:['She’s still pointing at the volcano.']},
  {talk:'TNB',lines:['Amber is just warmth that got stuck. You don’t break it. You give it somewhere to go.']},
  {talk:'Amy',lines:['Warmth. We’re good at warmth. Everybody find the warmest thing in the room.']},
  {talk:'Rose',lines:['The comal! The pupusas!']},
  {talk:'Tom',lines:['Tom lifts a pupusa off the comal. It’s still hot. Steam is coming off it, in a room where nothing else is moving.']},
  {talk:'Tom',lines:['Doña Carmen. It’s Tom. Nobody on this block has ever left your door hungry. We’re here to eat. Please wake up.']},
  {talk:'Nara',lines:['Nara sits at Carmen’s feet, tail wagging in a perfect circle, and sneezes on the amber.']},
  {call:()=>sfx.ding&&sfx.ding()},
  {talk:'Doña Carmen',lines:['A crack runs up the amber like sugar glass. Then another. Then it falls away in warm gold flakes.']},
  {call:()=>{ const c=worlds.pupuseria&&worlds.pupuseria.npcs.find(n=>n.name==='Doña Carmen'); if(c) c.amber=false; }},
  {talk:'Doña Carmen',lines:['...and THEN I told the man, the loroco is not optional. Tom! When did you get here? Why is everything so quiet?','Where did my pupusas go?']},
  {talk:'Tom',lines:['You were amber for a little while.']},
  {talk:'Doña Carmen',lines:['I was what? I had a whole sentence. I lost the sentence. It was a good sentence.']},
  {talk:'Grace',lines:['A man in a grey suit did it. His name is Marlowe.']},
  {talk:'Doña Carmen',lines:['That man stood on my step and said my sign was “too busy.” I said the sign is busy because the food is good.','Go next door. The Alvarez house. They didn’t get any pupusas today. Take these. Feed the children first. The grown-ups will pretend they’re not hungry.']},
  {give:'pupusa'},
  {trace:'carmen-thaw'}, {hearts:'rose'},
  {if:()=>!flag('ch12-alvarez'),then:[{toast:'Goal: Casa Alvarez on 2nd Ave. The whole family is frozen.',time:5}],
    else:[{toast:'Goal: head to the intersection of Jefferson and 2nd.',time:5}]},
  {flag:'ch12-carmen'}, {call:()=>storyWorld()}
];

SCENES.ch12Alvarez=[
  {flag:'ch12-alvarez',value:'pending'},
  {talk:'Daisy',lines:['Tom! Tom! Everybody stopped! Abuela stopped in the middle of saying NO!']},
  {talk:'Tom',lines:['Okay. They’re amber. The grey got in through the front door.']},
  {talk:'Amy',lines:['Heat is just movement. When the girls can’t sleep, we run. Nobody stays stuck when they’re moving.']},
  {talk:'Grace',lines:['You mean...']},
  {talk:'Amy',lines:['Everybody up. Girls, with me. We’re running laps around the kitchen table.']},
  {talk:'Rose',lines:['Run with us, Mommy!']},
  {call:()=>sfx.run&&sfx.run()},
  {talk:'Amy',lines:['Lap one! Knees up, Rose!']},
  {call:()=>{ sfx.run&&sfx.run(); const m=worlds.casa&&worlds.casa.npcs.find(n=>n.name==='Don Beto'); if(m) m.amber=false; }},
  {talk:'Don Beto',lines:['...and that is a FOUL! That is a foul! Who has the remote?']},
  {talk:'Amy',lines:['Lap two! Grace, don’t look at the camera!']},
  {call:()=>{ sfx.run&&sfx.run(); for(const n of (worlds.casa?worlds.casa.npcs:[])) if(['Tony','Yesenia','Claudia','Kevin'].includes(n.name)) n.amber=false; }},
  {talk:'Tony',lines:['Why is there a woman running around my table? Why is it a good idea? It’s a very good idea.']},
  {talk:'Amy',lines:['Lap three! Everybody on the last one!']},
  {call:()=>{ sfx.ding&&sfx.ding(); const m=worlds.casa&&worlds.casa.npcs.find(n=>n.name==='Mrs. Alvarez'); if(m) m.amber=false; }},
  {talk:'Mrs. Alvarez',lines:['...NO. I said no. Why is everyone in my kitchen? Is that a mother running laps with two little girls?','...Okay. That one can stay.']},
  {talk:'Tom',lines:['That wasn’t a lap. That was a Tombo. Run With Us, Mommy. Amy, Grace and Rose, together.']},
  {flag:'tombo:ff2'},
  {call:()=>showToast&&showToast('New Tombo: Run With Us, Mommy! (Amy, Grace and Rose in front). 75% HEART.',5)},
  {talk:'Mrs. Alvarez',lines:['Take lemons. Take ALL the lemons. Every yard in this city has too many and somebody always leaves them on my step.']},
  {give:'lemons'},
  {talk:'Daisy',lines:['Is it okay if I say that was the best thing that has ever happened in our kitchen?']},
  {talk:'Rose',lines:['It was the best thing in OUR kitchen too. We don’t even have a kitchen table. We have a counter.']},
  {trace:'alvarez-run'}, {hearts:'amy'}, {hearts:'grace'}, {hearts:'rose'},
  {if:()=>!flag('ch12-carmen'),then:[{toast:'Goal: Doña Carmen’s pupuseria on Jefferson Blvd. She is frozen too.',time:5}],
    else:[{toast:'Goal: head to the intersection of Jefferson and 2nd.',time:5}]},
  {flag:'ch12-alvarez'}, {call:()=>storyWorld()}
];

SCENES.ch12Prime=[
  {flag:'ch12-prime',value:'pending'},
  {spawn:{name:'Marlowe',look:'marlowe',at:[14,5],dir:'down'}},
  {walk:'Marlowe',to:[[14,6],[14,7],[14,8]],speed:.3}, {face:'Marlowe',dir:'down'},
  {talk:'Marlowe',lines:['Look at that. You put the neighbors back. Very warm. Very busy. Very much not what I asked for.']},
  {talk:'Amy',lines:['The rest of the colors too, please. All of them.']},
  {talk:'Marlowe',lines:['Notes. This intersection has no flow. Let me introduce our new Head of Traffic.','Mr. Prime! Please give them a moment to rethink the neighborhood.']},
  {call:()=>sfx.charge&&sfx.charge()},
  {flag:'ch12-prime'}, {call:()=>storyWorld()}, {call:()=>sfx.thud&&sfx.thud()}, {wait:1.2},
  {talk:'Rose',lines:['It’s the biggest car in the WORLD.']},
  {talk:'Tom',lines:['Every light on the block is red. Every single one.']},
  {talk:'Grace',lines:['Tata. Its headlights are pointed at the ground. It looks sad.']},
  {talk:'Marlowe',lines:['It’s not angry. It’s stuck. Stuck is very quiet, and Mr. Vance likes quiet. Do be quick. The notes are due at five.']},
  {despawn:'Marlowe'},
  {talk:'TNB',lines:['If it’s stuck, maybe it just needs somewhere to go. Kindness first. Hit it if it hits back.']},
  {talk:'Amy',lines:['Here’s the plan. I stay with the girls. If anybody needs a break, sit on a couch or a bench and we’ll swap.']},
  {talk:'Tom',lines:['Nobody gets run over. I’ll step in front of anyone who needs it.']},
  {toast:'Tip: Amy, Grace and Rose in front unlocks Run With Us, Mommy!, which breaks its red light in one go.',time:6},
  {battle:'gridlockprime',tut:'ch12'},
  {if:()=>flag('battle:gridlockprime')!=='win',then:[
    {heal:true},
    {talk:'Amy',lines:['Everybody okay? Good. It floors Rush Hour every third turn, so we heal before, not after.']},
    {toast:'Face Gridlock Prime (the intersection on Jefferson) and press A to try again. Everyone is healed.',time:5}],else:[]}
];

SCENES.ch12After=()=>[
  {flag:'ch12-after',value:'pending'},
  {call:()=>sfx.levelChime&&sfx.levelChime()},
  ...(flag('kind:gridlockprime')?[
    {talk:'Gridlock Prime',lines:['...Green. It’s green. Somebody turned me green.','Nobody ever let me go first. I’m always the one who holds everybody.']},
    {talk:'Amy',lines:['Go. Signal first. We’ve got the crosswalk.']}]:[
    {talk:'Gridlock Prime',lines:['...SigAlert cleared. Merging left. I’m sorry. Everybody was in my lane.']},
    {talk:'Amy',lines:['It’s fine. Nobody was in your lane. You were in everybody’s. Take the exit.']}]),
  {call:()=>sfx.pickup&&sfx.pickup()},
  {talk:'Tom',lines:['The green lamp just popped off the traffic light. It’s still warm, and it’s humming.']},
  {give:'greenlight'},
  {flag:'ch12-clear'},{call:()=>{ setFlag('ch12-grey',false); storyWorld(); sfx.whoosh&&sfx.whoosh(); }}, {wait:2},
  {talk:'Rose',lines:['The pink is back! The jacaranda has its pink back!']},
  {talk:'Grace',lines:['And the music is back in the window.']},
  {talk:'Mr. Washington',lines:['...and that is why you never trust a Tuesday. Hm? Why is everybody looking at me? Did I fall asleep? Again?']},
  {talk:'Larry',lines:['I’m blowing leaves. The leaf landed. It LANDED. Thirty years I’ve waited. Thank you.']},
  {spawn:{name:'Marlowe',look:'marlowe',at:[15,6],dir:'down'}},
  {walk:'Marlowe',to:[[15,7],[15,8]],speed:.3},
  {talk:'Marlowe',lines:['Love it. Hate it. Love it. Notes withdrawn.','I’ll be Downtown, at the Movie Palace. Come by. I’ll have notes for the rest of the family.']},
  {talk:'Tom',lines:['Where is my mother?']},
  {talk:'Marlowe',lines:['Long Island is under glass, you know. A very safe house. Your mother is in the kitchen. She’s making a crisp. She’s been making it for hours.']},
  {talk:'Tom',lines:['Tell me where.']},
  {talk:'Marlowe',lines:['Notes are due at five.']},
  {call:()=>sfx.whoosh&&sfx.whoosh()}, {despawn:'Marlowe'},
  {talk:'Amy',lines:['He just told us something he shouldn’t have.']},
  {talk:'TNB',lines:['Long Island is under glass. So we go under the glass. Or around it.']},
  {talk:'Tom',lines:['Sal and Sol know every road between here and there. We start with the cab stand.']},
  {talk:'Tom',lines:['We’ll get them back. We always make our connection.']},
  {trace:'ch12-wrap'}, {hearts:'tom'}, {hearts:'amy'}, {hearts:'tnb'},
  {party:null},
  {fade:'out',time:.8}, {card:12,done:true,time:3.4}, {flag:'ch12-done'}, {fade:'in',time:.8},
  {toast:'Goal: ask Sol at the cab stand in Downtown LA how to get under the dome.',time:7},
  {call:()=>showToast&&showToast('CHAPTER 12 COMPLETE! Chapter 13 is still being built.',7)},
  {save:true}
];

TRIGGERS.push(
  {id:'ch12-arrive',map:'jpark',when:{...CH12,flag:'ch12-open',notFlag:'ch12-arrive'},scene:'ch12Arrive'},
  {id:'ch12-house',map:'tomhouse',at:[2,5,13,17],when:{...CH12,flag:'ch12-arrive',notFlag:'ch12-house'},scene:'ch12House'},
  {id:'ch12-loft',map:'lofts',when:{...CH12,flag:'ch12-arrive',notFlag:'ch12-studio'},scene:'ch12Loft'},
  {id:'ch12-marlowe',map:'jpark',at:[12,8,17,11],when:{...CH12,flag:['ch12-house','ch12-studio'],notFlag:'ch12-marlowe'},scene:'ch12Marlowe'},
  {id:'ch12-carmen',map:'pupuseria',when:{...CH12,flag:'ch12-marlowe',notFlag:'ch12-carmen'},scene:'ch12Carmen'},
  {id:'ch12-alvarez',map:'casa',when:{...CH12,flag:'ch12-marlowe',notFlag:'ch12-alvarez'},scene:'ch12Alvarez'},
  {id:'ch12-prime',map:'jpark',at:[12,8,17,11],when:{...CH12,flag:['ch12-carmen','ch12-alvarez'],notFlag:'ch12-prime'},scene:'ch12Prime'},
  {id:'ch12-after',map:'jpark',when:{...CH12,flag:{'battle:gridlockprime':'win'},notFlag:'ch12-clear'},scene:'ch12After'}
);

// World state: the neighbors Marlowe caught are amber until they are thawed (Doña Carmen and the Alvarez house by their scenes, the
// street by the boss). Gridlock Prime sits in the intersection from the moment Marlowe introduces it until it is beaten.
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  const on=STORY.chapter===12&&!!flag('ch12-marlowe')&&flag('battle:gridlockprime')!=='win';
  const set=(map,names,test)=>{ const m=worlds[map]; if(!m) return; for(const n of m.npcs) if(names.includes(n.name)) n.amber=!!(on&&test()); };
  set('jpark',['Mr. Washington','Marisol','Larry'],()=>true);
  set('pupuseria',['Doña Carmen'],()=>!flag('ch12-carmen'));
  set('casa',['Mrs. Alvarez','Don Beto','Tony','Yesenia','Claudia','Kevin'],()=>!flag('ch12-alvarez'));
  const b=findMonster('gridlockprime'); if(!b) return;
  const under=STORY.chapter!==12||!flag('ch12-prime')||flag('battle:gridlockprime')==='win';
  if(under&&!b.sunk) { b.sunk={x:b.x,y:b.y}; b.x=0; b.y=0; b.move=null; b.hidden=true; }
  else if(!under&&b.sunk) { b.x=b.sunk.x; b.y=b.sunk.y; b.sunk=null; b.hidden=false; }
  b.mscale=1.5;
});
HOLD_RULES.push(n=>!!n.amber||n.monster==='gridlockprime');
TUTORIALS.ch12={tips:[
  {id:'rush',who:'*',text:'Every third turn it floors RUSH HOUR on everyone. It shows on the turn ribbon first, so heal up after.'},
  {id:'red',who:'*',when:()=>B2.foes.some(f=>f.boss&&f.shield),text:'TOTAL GRIDLOCK on everyone next turn! Break its red light: 2 Kinetic or Splash hits, or any Tombo.'},
  {id:'ff2',who:['amy','grace','rose'],dir:'left',when:u=>B2.foes.some(f=>f.boss&&f.shield)&&b2TomboRows(u).some(r=>!r.why),text:'◀ TOMBO, Run With Us, Mommy! (Amy, Grace and Rose) smashes its red light in one go.'},
  {id:'green',who:'*',dir:'down',care:1,text:'It has been red since the greying. ▼ Bag, GIVE IT A GREEN LIGHT. Three times and it lets everyone through.'}]};

// ---------- LA couches and benches swap who is out front (chapter 12 on; same menu as the Boarding Gate benches) ----------
for(const [map,name] of [['tomhouse','The couch'],['jpark','Parkway bench']]) {
  const w=worlds[map],o=w&&w.objects.find(x=>x.name===name);
  if(o) { o.homebench=true; o.benchName=name==='The couch'?'THE COUCH':'THE BENCH'; }
}
const LE_pressAction_ch12=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full'&&STORY.chapter>=12) {
    const t=facingTarget(),v=t&&t.value;
    if(t&&t.kind==='object'&&v.homebench) { benchMenu(v); return; }
  }
  return LE_pressAction_ch12();
};

// ---------- What the neighbors say while amber, and after ----------
{ const NPCS={
    jpark:{'Mr. Washington':[['frozen','Mr. Washington is solid amber, mid-sentence, one finger raised. A tiny chip of gold sits on the brim of his hat.','Whatever 1979 story he was telling is still in there. Still warm.'],
      ['clear','...and that’s why you never trust a Tuesday. Hm? Did I fall asleep? Again?','Back in 1979, nobody got stuck on a sentence. Well. Harold did.']],
      Marisol:[['frozen','Marisol is amber from her shoulders to her sneakers. The leash runs from her hand to a very loyal dog. The dog is free. The dog is sitting beside her. He didn’t leave.'],
      ['clear','The color’s back! My dog’s back! He never left! He was just being loyal. Look at him. So loyal.']],
      Larry:[['frozen','Larry is amber, leaf blower raised. One leaf hangs in the air in front of him. After all these years it is finally perfectly still.'],
      ['clear','The leaf landed. It LANDED. I’ve been blowing that leaf since the smog. Thank you.']]},
    pupuseria:{'Doña Carmen':[['frozen','Doña Carmen is solid amber, one finger out, pointing at the volcano photo. She’s still warm. The loroco plant beside her is leaning toward her.'],
      ['carmen','You woke me up with a pupusa. That’s how my mother did it.','Go save the block. I’ll make more. I’m always making more.']]},
    casa:{'Mrs. Alvarez':[['frozen','Mrs. Alvarez is amber, mid-NO, one finger out. Still warm. Still firm.'],['carmen','I said NO. I lost the sentence. It was a good NO.','That woman who runs can come back any time. She can run in my kitchen. Tell her.']],
      'Don Beto':[['frozen','Don Beto is amber in his recliner, one fist up. The TV is stuck on a goal. Nobody has ever seen him so quiet.'],['carmen','Foul! That was a foul! Wait. Is the game over? What year is it?']],
      Tony:[['frozen','Tony is amber, a plate in each hand, mid-step. A tortilla hangs in the air over him. It hasn’t decided yet.']],
      Yesenia:[['frozen','Yesenia is amber, one earbud out, mid-eye-roll. She would hate this. She would hate it SO much.']],
      Claudia:[['frozen','Claudia is amber, phone in hand. The screen says 47 unread. It will say 47 forever.']],
      Kevin:[['frozen','Kevin is amber on the bottom bunk, mid-yawn. He looks very peaceful. He always does.']]}};
  for(const [map,people] of Object.entries(NPCS)) for(const [name,rows] of Object.entries(people)) {
    const n=worlds[map]&&worlds[map].npcs.find(x=>x.name===name); if(!n) continue;
    const v=[];
    for(const [kind,...lines] of rows) {
      if(kind==='frozen') v.push({chapter:12,flag:'ch12-marlowe',notFlag:map==='jpark'?'ch12-clear':map==='pupuseria'?'ch12-carmen':'ch12-alvarez',lines});
      else if(kind==='clear') v.push({from:12,flag:'ch12-clear',lines});
      else v.push({from:12,flag:map==='pupuseria'?'ch12-carmen':'ch12-alvarez',lines});
    }
    n.when=[...v,...(n.when||[])];
  } }
