'use strict';
// data/scenes-ch20.js — Part 2, Chapter 20 "The Forever Engine & The Open Sky" (the finale). Loaded after data/scenes-ch19.js.
// Flow: press A on the Pinnacle lift in the Vault (ch20Open: card 20, all eight of the family go up, Deedee and Boppy walk again) > the Stillness Core (stillcore): eight sealed doors,
// one per member, each a short skill puzzle (a choice with a clue: Tom codebreak, Grace beam walk, Rose crawlspace, Amy timed sprint, Deedee garden bridge, Boppy heavy lever, TNB rail splice,
// Nara scent trail). Flags door-<who>. All eight open (ch20-core): the Engine lift opens and the Family Finish The Extra Place (ff4) unlocks > the lift up (ch20Heart): the Forever Engine, the Chronos-Leviathan
// > fight 1 (data/ch20-battle.js: four Resentment Barriers, a Family Relay breaks each) > ch20Shatter: the Leviathan comes apart, Julian Vance in a glass living room, Eternal Silence > fight 2 (ATTACK is stone, seven acts of care, then
// Tom DEFENDs Julian himself) > ch20Calm: the Engine lets go, every clock moves > ch20Epi1 (Long Island: the Censor delivers four keepsakes, the Skyway Train) > ch20Epi2 (Jefferson Park, the porch) > ch20-done.
// Flags: ch20-open, door-<who> (8), ch20-core, ch20-heart, ch20-fight, battle:leviathan, ch20-shatter, ch20-julian, battle:julian, ch20-calm, ch20-epi, ch20-done, game-complete.
// The party all chapter: Tom, Grace, Rose and Amy out front (the Core bench swaps the fourth), Deedee, Boppy, TNB and Nara on the bench. They all walk with Tom and stand in every scene.
const CH20={mode:'full',chapter:20};
const CH20_WHO=['tom','grace','rose','amy','deedee','boppy','tnb','nara'];
const CH20_NAME={tom:'Tom',grace:'Grace',rose:'Rose',amy:'Amy',deedee:'Deedee',boppy:'Boppy',tnb:'TNB',nara:'Nara'};
const ch20Levi=()=>findMonster('leviathan');
const ch20Julian=()=>findMonster('julian');
const ch20Doors=()=>CH20_WHO.filter(k=>flag('door-'+k)).length;

// Everyone comes along: Tom, Grace, Rose and one more out front, the rest on the bench. Deedee and Boppy walk again (data/scenes-ch16.js kept them as statues until now).
function ch20Assemble(fourth='amy') {
  if(typeof tomBack==='function'&&flag('tom-gone')) tomBack();
  setFlag('ch16-stone',false); storyWorld();
  if(girlsAway()) setGirlsAway(false);
  const M=MEMBERS();
  for(const id of ['amy','deedee','boppy','tnb','nara']) {
    const m=M[id]; if(!m||id===fourth) continue;
    if(inParty(m)||!onBench(m)) benchAdd(m);
  }
  const f=M[fourth];
  if(f&&!inParty(f)) { if(onBench(f)) benchToParty(f); else forceJoin(f,true); }
  if(typeof menuChar!=='undefined') menuChar=0;
  if(typeof b6Badge==='function') b6Badge();
  placeFollowers();
}

// ---------- The eight doors ----------
// ask: what the panel says; opts: three answers (ok:true is the right one; no: what happens otherwise); win: the scene when it opens; done: the door afterwards.
const CH20_DOORS={
  tom:{ask:['The Codebreaker door. A brass panel with four dials, and a sticky note in very neat handwriting: THE CODE IS WHAT EVERY CLOCK IN THIS BUILDING SAYS. NO COLON. The clock overhead reads 4:59.'],
    opts:[{label:'0500',no:'The panel buzzes. Tom: “Five o’clock is the one thing nothing in this building is allowed to say.”'},
          {label:'0459',ok:true},
          {label:'1200',no:'The panel buzzes. Tom: “Noon is when nice people have lunch. This is not that building.”'}],
    win:[['Tom','Four, five, nine. It is the saddest password I have ever typed.'],
         ['Stillness Core','The dials lock. The door rolls open on a small brass room with one desk and one lamp. On the desk is a note in a hurried hand: HE ALWAYS SAID ONE MORE FLIGHT. SOMEBODY ALWAYS BELIEVED HIM.'],
         ['Tom','I know that minute. It is the minute right before you finally stand up and go. He has been sitting in it for twenty years.']],
    done:'The Codebreaker door stands open. The four dials still say 0459.'},
  grace:{ask:['The Beam door. A four-inch gold beam crosses a drop forty feet long. A brass plate: THE BEAM TILTS ON EVERY TICK. Somewhere overhead, a clock ticks once a second.'],
    opts:[{label:'Run across, fast',no:'Grace gets two steps in. The beam tilts on the tick. She hops back. Grace: “Running is for the other event.”'},
          {label:'Hold still and wait',no:'The beam tilts, and tilts, and tilts. Nothing changes. Grace: “Waiting is a choice. It is not a good one.”'},
          {label:'Move with the ticks',ok:true}],
    win:[['Grace','On the tick, off the tick. It is just floor music. Everybody count with me.'],
         ['Stillness Core','She crosses with a whole routine: a chasse, a turn, a leap on the tilt, and a dismount she sticks so hard the beam rings like a bell.'],
         ['Rose','That was a nine point nine!'],['Grace','It was a ten. It was always going to be a ten.']],
    done:'The Beam door is open. There are chalk handprints along the beam, and one very small one.'},
  rose:{ask:['The Crawlspace door. A hatch the size of a pizza box, with a brass grille. Behind it, three small vents side by side. One of them has a trail of tiny pretzel crumbs going in.'],
    opts:[{label:'The vent on the left',no:'Rose goes in headfirst and comes out with a dust bunny on her head. Rose: “His name is Gary.”'},
          {label:'The vent on the right',no:'A cold, sad draft. Rose: “That is not a vent. That is a sad.”'},
          {label:'The one with crumbs',ok:true}],
    win:[['Rose','I dropped those crumbs in the lift. I forgot. That is called a plan.'],
         ['Stillness Core','She wriggles in, all the way, and the hatch unlatches from the inside with a click.'],
         ['Rose','I am the smallest and the most important. Please write that down.'],['Amy','Noted.']],
    done:'The Crawlspace door is open. Somewhere inside there is a very small handprint, and a pretzel crumb.'},
  amy:{ask:['The Sprint door. A long brass hall, and at the far end a steel slab is lowering. A sign: THE DOOR CLOSES IN NINE SECONDS. A line is taped on the floor, ninety meters away.'],
    opts:[{label:'Stretch first',no:'Amy gets one hamstring stretch in. The slab drops. Amy: “Nobody stretches before a closing door. I wanted to see if you knew.”'},
          {label:'Jog it, save your legs',no:'The slab thumps down with two seconds to spare, which is a fail. Amy: “Two seconds is not a gap. It is a lie.”'},
          {label:'Sprint, right now',ok:true}],
    win:[['Amy','Ninety meters. Nine seconds. Do not talk to me.'],
         ['Stillness Core','She hits the line in eight point one and slides under the slab with a hand to spare. The door behind her pops open.'],
         ['Amy','Personal best. In a moon. In sneakers. Nobody tell Justin I did it without stretching.']],
    done:'The Sprint door is open. The slab is stuck a hand above the floor. It looks very surprised.'},
  deedee:{ask:['The Garden Bridge door. A chasm forty feet across, with a brass trellis on each side. A seed tray: TOMATO VINE, DAISY, RHUBARB. A small sign: ONLY WHAT HAS BEEN ALLOWED TO GROW FOR FORTY YEARS WILL HOLD A PERSON.'],
    opts:[{label:'Tomato vine',no:'It grows a foot, flops over, and falls in the chasm. Deedee: “Best of the vines. Not the best of the bridges.”'},
          {label:'Daisy',no:'A lovely daisy bridge. Boppy steps on it. It lasts exactly as long as you would expect.'},
          {label:'Rhubarb',ok:true}],
    win:[['Deedee','Forty years in the same bed. It does not care what is going on. It just grows.'],
         ['Stillness Core','A bridge of thick red stalks rises across the chasm under a roof of enormous green leaves.'],
         ['Boppy','You could drive a truck over that.'],['Deedee','Do not. It is for the crisp.']],
    done:'The Garden Bridge door is open. The rhubarb bridge is growing. It smells like a Sunday.'},
  boppy:{ask:['The Heavy Lever door. A lever as long as a bus, stuck in the up position. A brass plate: MAINTENANCE. PLEASE LIFT WITH YOUR LEGS.'],
    opts:[{label:'Pull with your back',no:'Boppy puts his back into it. His back puts itself into a different place. Boppy: “I am going to be talking about this for a week.”'},
          {label:'Complain at it',no:'Boppy gives the lever a full speech. It does not move. Even the lever has heard it before.'},
          {label:'Lift with your legs',ok:true}],
    win:[['Boppy','Legs. Like every doctor I have ever ignored. Hup.'],
         ['Stillness Core','The lever comes down with a long groan, and a shudder runs through the floor. Somewhere behind the wall, a counterweight drops, and the door swings wide.'],
         ['Boppy','My knees would like a word.'],['Deedee','Your knees can talk to me later.']],
    done:'The Heavy Lever door is open. The lever is all the way down. It looks relieved.'},
  tnb:{ask:['The Rail Splice door. A brass rail snapped clean in two over a gap. A tool rack: GOLD LEAF AND LACQUER. DUCT TAPE. WIRE CUTTERS.'],
    opts:[{label:'Duct tape',no:'TNB holds up the tape, looks at the rail, and puts it back. “It is tempting. It will not hold.”'},
          {label:'Wire cutters',no:'TNB: “It is already in two pieces. I would like to add fewer pieces.”'},
          {label:'Gold leaf and lacquer',ok:true}],
    win:[['TNB','You do not hide the break. You make it the strongest part.'],
         ['Stillness Core','He joins the two halves with a bright seam of gold. The rail rings like a struck bell, and the door at the end of it slides open.'],
         ['Tom','You really did learn that from a cup.'],['TNB','I really did.']],
    done:'The Rail Splice door is open. The rail has a line of gold across it, exactly where it broke.'},
  nara:{ask:['The Scent Trail door. Three faint trails run along the floor and off down three tunnels. One smells of coffee. One smells of pretzel. One smells of a warm thermos and old wool.'],
    opts:[{label:'The coffee',no:'Nara follows it to a dead end and a very old paper cup. She sneezes. It is a sad cup.'},
          {label:'The pretzel',no:'It leads to one squished pretzel on the floor. Nara eats it. Rose: “That was for Deedee.” Nara has no regrets.'},
          {label:'The thermos and wool',ok:true}],
    win:[['Nara','Nara knows this one. It is the smell of the person she would go anywhere to find. She puts her nose down and does not stop.'],
         ['Stillness Core','The tunnel opens for her, door after door, as if each one remembered being asked nicely.'],
         ['Tom','She tracked me through a Dead-Letter Office. She can track a door.']],
    done:'The Scent Trail door is open. Nara has left a very small paw print on the sill, which counts as signing it.'}
};
SCENES.ch20Door=(c={})=>{
  const who=c.who,D=CH20_DOORS[who]; if(!D) return [];
  const n=()=>ch20Doors();
  return [
    {call:()=>{ sfx.chime&&sfx.chime(); }},
    ...D.win.map(([name,t])=>({talk:name,lines:[t]})),
    {flag:'door-'+who},
    {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
    {if:()=>ch20Doors()>=8,then:[...SCENES.ch20CoreOpen()],
     else:[{toast:'Goal: '+(8-ch20Doors())+' door'+(8-ch20Doors()===1?'':'s')+' left in the Core. Each one is a different skill.',time:6}]},
    {save:true}
  ];
};
SCENES.ch20CoreOpen=()=>[
  {flag:'ch20-core'},
  {call:()=>{ setFlag('tombo:ff4'); setFlag('tombo:tnb4'); setFlag('tombo:nara4'); sfx.levelChime&&sfx.levelChime(); }},
  {talk:'Stillness Core',lines:['Eight lamps light round the frame of the lift in the middle of the Core, one for each of you. The brass doors slide apart, and a warm gold light comes out of the shaft.']},
  {talk:'Tom',lines:['He built a lock that opens for family. All eight of us, and a thermos. I resent how much I admire that.']},
  {talk:'Amy',lines:['The Extra Place. Mom set a place for everybody at every dinner for fifty years. That is the whole trick. He should have asked her.']},
  {talk:'Deedee',lines:['Is it ready? Because I made a lot.']},
  {talk:'Stillness Core',lines:['THE EXTRA PLACE (the all-eight Family Finish) is ready. It costs 75% HEART.']},
  {toast:'Goal: Take the Engine lift in the middle of the Core. Use the bench to pick who fights first.',time:8}
];

// ---------- Opening: the Pinnacle lift ----------
SCENES.ch20Open=()=>[
  {flag:'ch20-open',value:'pending'},
  {talk:'Tom',lines:['In the ceiling of the Vault, a round brass door has opened. It has a clock for a keyhole. It is ticking very slowly, like a heart that has been told to be quiet.']},
  {talk:'Boppy',lines:['That is the biggest clock I have ever seen. And I have a lot of clocks. They all run fast, for my stomach.']},
  {talk:'Deedee',lines:['Is that the man’s house? Somebody should tell him to leave a light on.']},
  {talk:'Amy',lines:['Everybody stays together. All eight. Nobody goes through a door alone.']},
  {talk:'Grace',lines:['We always make our connection.']},
  {talk:'Rose',lines:['Nara goes first. She is the best at doors.']},
  {talk:'Tom',lines:['Eight of us, a dog and a thermos. Seconds first, then the sky. Let us go.']},
  {fade:'out',time:.8},
  {call:()=>{ setChapter(20,{apply:false}); STORY.override=null; ch20Assemble('amy'); sfx.travel&&sfx.travel(); }},
  {card:20,time:3.4},
  {call:()=>{ ch17Place('stillcore',13,14,'up'); }},
  {fade:'in',time:.8},
  {talk:'Stillness Core',lines:['The lift opens into a round chamber of brass and glass, behind the face of the sky clock. Every wall is a gear, and every gear is turning very slowly. Eight round doors stand sealed around a lift in the middle. Each keyhole is shaped like somebody.']},
  {talk:'Rose',lines:['I get a door too?']},
  {talk:'Tom',lines:['You get a door too.']},
  {talk:'TNB',lines:['It is a very good lock. Whoever made it really cared about the mechanism.']},
  {talk:'Tom',lines:['One skill each. Whatever you are best at, that is your door.']},
  {flag:'ch20-open'},
  {toast:'Goal: Eight doors, eight skills. Press A on a door, then pick the answer that fits.',time:9},
  {save:true}
];

// ---------- The lift: the Engine ----------
SCENES.ch20Heart=()=>[
  {flag:'ch20-heart',value:'pending'},
  {fade:'out',time:.7},
  {call:()=>{ sfx.travel&&sfx.travel(); ch17Place('foreverheart',10,12,'up'); const l=ch20Levi(); if(l) { l.hidden=false; l.mscale=1.6; } }},
  {fade:'in',time:.9},
  {talk:'Forever Engine',lines:['A column of gears the height of a tower. Around it, a brass serpent as long as a street is slowly uncoiling. Every scale is a clock face. Every clock says 4:59. At the top of the Engine, on a platform of glass, a man in a long coat stands with his back to you.']},
  {talk:'Vance',lines:['Tom. You came back. You always come back. That is the thing I could never forgive you for.']},
  {talk:'Tom',lines:['I was written out of the schedule. I am a very stubborn calendar entry.']},
  {talk:'Vance',lines:['Everything leaves. Time takes a little every day, and then one day all of it. So I built a place where it cannot. The Leviathan keeps every afternoon exactly as it was. Please do not hurt it. It is all I have.']},
  {talk:'Grace',lines:['You turned my grandparents into STATUES.']},
  {talk:'Vance',lines:['I kept them safe.']},
  {talk:'Boppy',lines:['I was a statue for a week and my back did not get a single day off. I would like to file a complaint.']},
  {talk:'Deedee',lines:['Julian, honey. Have you eaten?']},
  {talk:'Vance',lines:['There are four things that will keep you out. Distance. Age. Exhaustion. Fear. Four things I could never get past. You will not, either.']},
  {talk:'Amy',lines:['Distance, age, exhaustion, fear. That is just a regular Tuesday.']},
  {talk:'Tom',lines:['Okay. Four barriers. We have a plan for every one of them. Everybody ready?']},
  {talk:'Rose',lines:['Is the snake going to be mean?']},
  {talk:'Tom',lines:['It is going to be very, very tired. Be kind about it, and be fast.']},
  {call:()=>{ sfx.charge&&sfx.charge(); }},
  {talk:'Forever Engine',lines:['The Chronos-Leviathan lowers its head. Every clock on its body ticks at once.']},
  {flag:'ch20-heart'},
  ...SCENES.ch20Fight1()
];
SCENES.ch20Fight1=()=>[
  {flag:'ch20-fight'},
  {battle:()=>{ const m=ch20Levi(); if(m) { m.hidden=false; m.mscale=1.6; m.tier=0; } return m; },tut:'ch20'},
  {if:()=>flag('battle:leviathan')==='win',then:[],else:[
    {heal:true},
    {talk:'Tom',lines:['Up. Everybody up. Breathe. It is a long fight, and we are a long family. We can do this again.']},
    {toast:'Talk to the Chronos-Leviathan and press A to try again. Everyone is healed.',time:5}]}
];

// ---------- The Leviathan comes apart, and Julian is in the room ----------
SCENES.ch20Shatter=()=>[
  {flag:'ch20-shatter',value:'pending'},
  {call:()=>{ const l=ch20Levi(); if(l) l.hidden=true; }},
  {talk:'Forever Engine',lines:['The Leviathan comes apart. It does not die. It comes apart like a watch being taken out of its case, one gear at a time, every one of them still ticking.']},
  {call:()=>{ setFlag('ch20-julian'); const j=ch20Julian(); if(j) { j.hidden=false; j.mscale=1.4; } sfx.levelChime&&sfx.levelChime(); }},
  {talk:'Forever Engine',lines:['Where its coil was, there is a room made of glass. A small living room. One lamp, one armchair. A man in a long coat is sitting in it with his hat in his hands. He is a good deal smaller than the shadow he threw.']},
  {talk:'Vance',lines:['My daughter was nine. I was on a flight. I told her, one more flight next month. It was her birthday. I told my mother the same thing, about the hospital. I told my partner the same thing about everything.']},
  {talk:'Vance',lines:['There was always one more flight next month. And then there was not. So I stopped the months. I did not know how to say goodbye. So I made sure that nobody could leave.']},
  {talk:'Tom',lines:['Julian.']},
  {talk:'Vance',lines:['Eternal Silence.']},
  {call:()=>{ sfx.thud&&sfx.thud(); }},
  {talk:'Forever Engine',lines:['Every sound in the Engine goes out. Every move you have turns to grey stone, and the stone falls and lies on the glass floor. He did not fight. He only went quiet, and asked everyone to.']},
  {talk:'Amy',lines:['He is not attacking us. Look at his hands.']},
  {talk:'Grace',lines:['They are shaking.']},
  {talk:'Rose',lines:['Is he cold?']},
  {talk:'Tom',lines:['No hitting. He has done enough to everybody else. Do the thing you are each best at, for him. Everybody. In turn. I will be last.']},
  {talk:'Boppy',lines:['The last one is always the hardest. That is why I put the pepper first.']},
  {flag:'ch20-shatter'},
  ...SCENES.ch20Fight2()
];
SCENES.ch20Fight2=()=>[
  {flag:'ch20-fight2'},
  {battle:()=>{ const m=ch20Julian(); if(m) { m.hidden=false; m.mscale=1.4; m.tier=0; } return m; },tut:'ch20'},
  {if:()=>flag('battle:julian')==='win',then:[],else:[
    {heal:true},
    {talk:'Tom',lines:['Everybody up. He is not going anywhere. That is rather the point of him.']},
    {toast:'Talk to Julian and press A to try again. Everyone is healed.',time:5}]}
];

// ---------- The Engine lets go ----------
SCENES.ch20Calm=()=>[
  {flag:'ch20-calm',value:'pending'},
  {call:()=>{ setFlag('ch20-julian',false); setFlag('ch20-calm'); }},
  {talk:'Forever Engine',lines:['Julian is still in the armchair. He has a cardigan on and a tennis ball in his lap, and a plate of rhubarb crisp that he has not eaten. The glass of the living room is cracked right down the middle, and every crack is letting the light in.']},
  {talk:'Vance',lines:['Clara would be thirty-one. She would say I deserved all of this.']},
  {talk:'Tom',lines:['Probably. And then she would sit down next to you anyway.']},
  {talk:'Vance',lines:['I could not make the minute stop hurting. So I stopped the minute. It did not stop hurting. It only stopped.']},
  {talk:'Deedee',lines:['Honey. That is all of it. That is what living is. It hurts a little, every time, and you do it anyway.']},
  {talk:'Boppy',lines:['And the crisp is excellent.']},
  {talk:'Vance',lines:['I do not know how to start the clocks.']},
  {talk:'Tom',lines:['You do not start them. You stop holding them.']},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  {talk:'Forever Engine',lines:['Julian lets go. A long breath goes out of him, the one that has been in him for twenty years. The Forever Engine lets go with him. One by one, every gear in the Moon begins to turn the right way, and far below, in two cities, every clock in the sky ticks forward, all together, to five o’clock.']},
  {talk:'Rose',lines:['IT MOVED! The clock MOVED!']},
  {talk:'Grace',lines:['It is five o’clock. It is just five o’clock. It is the best five o’clock I have ever seen.']},
  {talk:'Vance',lines:['The towns in the Archive are open. The coins are going home. The snow globe is a town again. I am sorry. I do not know how to say how sorry.']},
  {talk:'Tom',lines:['You are doing it right now. Come to dinner.']},
  {talk:'Vance',lines:['I do not have anything to bring.']},
  {talk:'Deedee',lines:['Bring yourself and an appetite.']},
  {talk:'Boppy',lines:['And bring a chair. We are short a chair.']},
  {talk:'Amy',lines:['Mom already set the place. She set it at every dinner for fifty years. There is always one more seat.']},
  {fade:'out',time:.9},
  {flag:'ch20-calm'},
  {save:true},
  ...SCENES.ch20Epi1()
];

// ---------- Epilogue, Long Island: the mail, the train ----------
SCENES.ch20Epi1=()=>[
  {flag:'ch20-epi',value:'pending'},
  {call:()=>{ sfx.travel&&sfx.travel(); ch17Place('town',11,13,'up'); }},
  {fade:'in',time:1.1},
  {talk:'Tom',lines:['Long Island is a town again. The fountain is running. The library door is open. Someone has already started a pie, which is how you know it is real.']},
  {talk:'Rose',lines:['Look! Look who is delivering!']},
  {talk:'Oblivion Censor',lines:['Good afternoon. I have four parcels. This is the first delivery I have ever made. Please do not be too nice about it. I am a little emotional.']},
  {talk:'Grace',lines:['My squishy! The Sparkling Diamond Gold Soup Dumpling squishy!']},
  {talk:'Rose',lines:['My pink ribbon! It is still tied in a bow!']},
  {talk:'Amy',lines:['My stopwatch. It is still running. It is at nine hundred and eleven hours, and some seconds.']},
  {talk:'TNB',lines:['My first cup. It is full. It is still warm. I do not know how that is possible and I am not going to ask.']},
  {talk:'Oblivion Censor',lines:['Each one is stamped DELIVERED. It is, I have learned, my favorite word.']},
  {talk:'Tom',lines:['He hands me a fifth parcel. It is small and brown. It is addressed, in my own handwriting, to Tom, Second Avenue. It is a letter I never mailed.']},
  {talk:'Oblivion Censor',lines:['I did not open it. That is not my department anymore. I only deliver.']},
  {talk:'Sal',lines:['Cab seven! Everybody in! I am not charging. I am not even driving. Look UP.']},
  {call:()=>{ sfx.charge&&sfx.charge(); }},
  {talk:'Tom',lines:['High over the Square, a line of gold runs from the sky down to the fountain. There is a rail on it with a seam of bright gold, exactly where somebody mended it. A train glides in, quiet as a held breath. The sign on its front says LONG ISLAND on one side and LOS ANGELES on the other.']},
  {talk:'Vance',lines:['I made it from the Engine. It runs both coasts. It does not stop the clocks. It only makes the distance a little shorter. I thought, if I had built that first...']},
  {talk:'Tom',lines:['You would have been home for the birthday.']},
  {talk:'Vance',lines:['I would have been home.']},
  {talk:'Sol',lines:['A SKYWAY TRAIN?! I do not know what to do with my hands! I am a cab driver!']},
  {talk:'Sal',lines:['You are the first passenger. Get in the train.']},
  {talk:'Amy',lines:['Three thousand miles. One ride. Mom, Dad, you can come to Tom’s any Tuesday you like.']},
  {talk:'Boppy',lines:['Does it have a recliner?']},
  {talk:'Vance',lines:['It has four. I asked.']},
  {talk:'Boppy',lines:['I have changed my mind about the man.']},
  {talk:'Vance',lines:['I am going to call my daughter. I do not know whether she will pick up. I am going to call anyway.']},
  {talk:'Tom',lines:['That is a good seat to start in.']},
  {fade:'out',time:.9},
  {flag:'ch20-epi'},
  {save:true},
  ...SCENES.ch20Epi2()
];

// ---------- Epilogue, Jefferson Park: the porch ----------
SCENES.ch20Epi2=()=>[
  {flag:'ch20-done',value:'pending'},
  {call:()=>{ sfx.travel&&sfx.travel(); ch17Place('jpark',7,19,'up'); }},
  {fade:'in',time:1.1},
  {talk:'Tom',lines:['A week later. Jefferson Park, six in the evening. The street light has come on, and for once it is not worth mentioning.']},
  {talk:'Rose',lines:['Tata, the train came again. It has a snack cart. It has a snack CART.']},
  {talk:'Grace',lines:['I rode both coasts in one day. I did a floor routine in the dining car. Nobody stopped me.']},
  {talk:'Deedee',lines:['Boppy fell asleep in the recliner somewhere over Nebraska. He says it is the best nap of his life. He says his back has never felt worse.']},
  {talk:'Boppy',lines:['Both of those are true.']},
  {talk:'Amy',lines:['Justin is coming out on the next one. He booked his own ticket. He says he cleared the whole weekend. I have been looking at the calendar for an hour to make sure it is real.']},
  {talk:'TNB',lines:['I made a mug. It has the same handle as the first one. It is exactly too big.']},
  {talk:'Nara',lines:['Nara has found the sourdough boule. She is guarding it with her whole body.']},
  {talk:'Tom',lines:['He sits down on his own porch step. The cup is warm. Everyone he loves is on this street, on both coasts, and every one of them is exactly where they are, with a train in between.']},
  {talk:'TNB',lines:['Hey.']},
  {talk:'Tom',lines:['Hey.']},
  {call:()=>{ intro.hearts&&[0,1,2,3,4,5].forEach(k=>setTimeout(()=>intro.hearts.push({x:player.x+.5+(Math.random()-.5),y:player.y-.6,t:0}),k*140)); sfx.levelChime&&sfx.levelChime(); }},
  {talk:'Grace',lines:['Tata. Are we going to be okay?']},
  {talk:'Tom',lines:['We always make our connection.']},
  {fade:'out',time:1.2},
  {card:20,done:true,time:4},
  {flag:'ch20-done'},{flag:'game-complete'},
  {fade:'in',time:1},
  {toast:'Goal: The story is complete. The world is yours to wander, with the train between two coasts.',time:8},
  {call:()=>showToast&&showToast('THE END. Thank you for playing The Adventures of Tom.',9)},
  {save:true}
];

TRIGGERS.push(
  {id:'ch20-shatter',map:'foreverheart',when:{...CH20,flag:{'battle:leviathan':'win'},notFlag:'ch20-shatter'},scene:'ch20Shatter'},
  {id:'ch20-calm',map:'foreverheart',when:{...CH20,flag:{'battle:julian':'win'},notFlag:'ch20-calm'},scene:'ch20Calm'}
);

// ---------- World state ----------
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  // The Leviathan coils round the Engine until it is beaten; Julian sits where it was from the moment it comes apart until he is calm.
  const l=ch20Levi();
  if(l) { const show=STORY.chapter===20&&!!flag('ch20-heart')&&flag('battle:leviathan')!=='win'; if(!show&&!l.hidden) l.hidden=true; else if(show&&l.hidden) l.hidden=false; l.mscale=1.6; }
  const j=ch20Julian();
  if(j) { const show=STORY.chapter===20&&!!flag('ch20-julian')&&flag('battle:julian')!=='win'&&!flag('ch20-calm'); if(!show&&!j.hidden) j.hidden=true; else if(show&&j.hidden) j.hidden=false; j.mscale=1.4; }
});
HOLD_RULES.push(n=>n.monster==='leviathan'||n.monster==='julian');

// ---------- Interaction ----------
const LE_pressAction_ch20=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full') {
    const t=facingTarget(),v=t&&t.kind==='object'?t.value:null,n=t&&t.kind==='npc'?t.value:null;
    // The Pinnacle lift in the Vault: after chapter 19, the door in the ceiling is open.
    if(v&&v.kind==='glelev'&&currentMap.id==='towervault'&&((STORY.chapter===19&&flag('ch19-done'))||STORY.chapter===20)&&!flag('ch20-done')) {
      openChoice('Pinnacle lift',[flag('ch20-open')?'The gold lift is waiting. The round door in the ceiling is still ticking.':'The gold lift is open. Above it, in the ceiling, a round brass door with a clock for a keyhole is ticking very slowly.'],[
        {label:'GO UP',fn:()=>{ if(!flag('ch20-open')) playScene('ch20Open'); else ch17Place('stillcore',13,14,'up'); }},{label:'NOT YET',fn:()=>{}}]);
      return;
    }
    if(STORY.chapter===20) {
      if(v&&v.kind==='cedoor') {
        const who=v.who,D=CH20_DOORS[who];
        if(D) {
          if(flag('door-'+who)) { openDialog(v.name,[D.done,ch20Doors()+' of 8 doors are open.']); return; }
          openChoice(v.name,D.ask,D.opts.map(o=>({label:o.label,fn:()=>{ if(o.ok) playScene('ch20Door',{ctx:{who}}); else { sfx.nope&&sfx.nope(); openDialog(v.name,[o.no]); } }})));
          return;
        }
      }
      if(v&&v.kind==='celift') {
        if(!flag('ch20-core')) { openDialog(v.name,[storyVariant?storyVariant(v,'text'):v.text,ch20Doors()+' of 8 doors are open. The lamps stay dark until all eight are.']); return; }
        if(flag('ch20-calm')) { openDialog(v.name,['The lift hums. The Forever Engine above it is turning the right way. There is nothing left up there that needs fixing.']); return; }
        openChoice(v.name,[flag('ch20-heart')?'The lift to the Forever Engine is waiting.':'The lift is open. Warm gold light is coming out of the shaft, and the ticking above is very loud. Bench anyone who should sit out first.'],[
          {label:'GO UP',fn:()=>{ if(!flag('ch20-heart')) playScene('ch20Heart'); else { ch17Place('foreverheart',10,12,'up'); } }},{label:'NOT YET',fn:()=>{}}]);
        return;
      }
      if(n&&n.monster==='leviathan'&&flag('ch20-heart')&&flag('battle:leviathan')!=='win') { playScene('ch20Fight1'); return; }
      if(n&&n.monster==='julian'&&flag('ch20-shatter')&&flag('battle:julian')!=='win') { playScene('ch20Fight2'); return; }
    }
  }
  return LE_pressAction_ch20();
};
