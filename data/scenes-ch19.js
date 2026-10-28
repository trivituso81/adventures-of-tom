'use strict';
// data/scenes-ch19.js — Part 2, Chapter 19 "The Unsent Dead-Letter Office." Loaded after data/scenes-ch18.js.
// Flow: Jefferson Park at first light, TNB leading, Tom gone (ch19Open: the mailbox glows, Nara will not leave it) > press A on the mailbox, ride the chute down to the
// Dead-Letter Office (ch19Hub) > four memory rooms off the hub, one per person who will not forget him: Grace, Rose, Amy, TNB. You walk each room ALONE as that person
// (engine/tom-gone.js SOLO_SKIN), read three memory pages, then set a keepsake on the pedestal (flags mem-<id>, mem-<who>-done, ks-<who>) > the Claim Desk (ch19Claim): the
// Oblivion Censor rises and the fight starts (data/ch19-battle.js; Tom bursts back in below half HP) > ch19After: Tom is back, the Censor gets something to deliver >
// ch19Feast: the neighbors bring food to Tom's porch, Sal's cab to the Glass Tower > ch19Thaw: the snow globe, Deedee and Boppy wake > ch19-done.
// Flags: ch19-open, ch19-hub, mem-<id> (12), mem-<who>-done (4), ks-<who> (4), ch19-ready, ch19-claim, battle:censor, ch19-tomback, ch19-after, ch19-feast, ch19-thaw, ch19-done.
// Party all chapter until the fight ends: Grace, Rose, Amy and TNB out front (TNB leads), Nara on the bench.
const CH19={mode:'full',chapter:19};
const CH19_WHO=['grace','rose','amy','tnb'];
const ch19Censor=()=>findMonster('censor');
const ch19Keeps=()=>CH19_WHO.filter(k=>flag('ks-'+k)).length;
const CH19_NAME={grace:'Grace',rose:'Rose',amy:'Amy',tnb:'TNB'};

// ---------- The three pages in each room ----------
const CH19_MEM={
  grace1:[['Grace','This is my first meet. I was seven. I looked at the bleachers and there was one empty folding chair at the very front, on the aisle, and then there was Tata in it.'],
          ['Grace','He was an hour early. He had a thermos. He said the aisle seat is for the person who cheers the loudest. Then he did not cheer at all. He said “Mm.” It was the loudest Mm of my whole life.']],
  grace2:[['Grace','I fell off the beam. It is four inches wide. It does not care about me.'],
          ['Tom','The beam is four inches. You are nine. Both of those are fine.'],
          ['Grace','He said it like it was a fact on a form. I got back up because it sounded official.']],
  grace3:[['Grace','Before every routine I gave him my Sparkling Diamond Gold Soup Dumpling squishy to hold. Nobody else is allowed to hold it. It is very important and slightly sticky.'],
          ['Grace','He has put it in his coat pocket at every single meet since. It has been through three coats. He says it has “seniority.” I am going to put it somewhere he will trip on it.']],
  rose1:[['Rose','Shoulder rides. The ceiling is so close up here. You can touch it if you stretch.'],
         ['Tom','Duck.'],['Rose','I ducked. He did not duck. We hit the lamp. It was the best day of my life, and I was in a hospital hallway.']],
  rose2:[['Rose','Bedtime. Tata reads to Lamby, not to me. Lamby likes dragons. Tata does the dragon voice like a man filing his taxes.'],
         ['Rose','I laughed so hard I got the hiccups. He said “That is not on the schedule.” He wrote HICCUPS on his hand with a pen.']],
  rose3:[['Rose','At the airport I tied a pink ribbon around his wrist. I said, come back with the same wrist.'],
         ['Rose','He did. He kept the ribbon in his wallet next to his library card. He said he checks it out regularly.']],
  amy1:[['Amy','Backyard races. I won every one until I was twelve. Then I found out why.'],
        ['Amy','I made him run it again, for real. He lost again. Honestly. My big brother, the slowest man on Long Island, and he looked so proud.']],
  amy2:[['Amy','Mile twenty of my first marathon. I was falling apart. And there was Tom on the curb with a thermos and a sign.'],
        ['Amy','The sign said: AMY. GO. (I HAVE NO SIGN WORDS.) I cried. I ran the last six miles in a rage. Best six miles of my life.']],
  amy3:[['Amy','Every long run, he asked my time. I thought he was being polite.'],
        ['Amy','There is a notebook in his desk. Every time, every run, in his awful handwriting, with a little star next to the fast ones. He never told me. He just kept the numbers.']],
  tnb1:[['TNB','Our first date. He had a mug with a broken handle and he was drinking out of it anyway, holding the pieces.'],
        ['TNB','I fixed it right there with gold. A seam you can see. He said, “Does it work?” I said, “It works better now.” He looked at me like I had said something in a language he had been waiting for.']],
  tnb2:[['TNB','He used to sit in the studio and read while I threw pots. Hours. Not a word.'],
        ['TNB','Once he looked up and said I looked like a man doing nothing very carefully. I said, “You really wheel know me.” He groaned so beautifully. I am keeping that groan forever.']],
  tnb3:[['TNB','My first cup. Lopsided. The handle is much too big. I made it for him and then I was embarrassed and hid it in a drawer.'],
        ['TNB','He found it. He has used it every morning since. Every morning, same cup. He says it holds exactly the right amount of coffee. It does not. It holds too much. That is the point.']]};
const CH19_KEEP={
  grace:{item:'the Sparkling Diamond Gold Soup Dumpling squishy',put:['Grace','Here. You are not allowed to forget this. I put it right where you will trip on it.'],after:'The pedestal lights gold. Somewhere far away, a lamp is turning toward the Claim Desk.'},
  rose:{item:'the pink ribbon',put:['Rose','Come back with the same wrist, Tata. I tied it already. You just have to come.'],after:'The ribbon ties itself in a small bow, all on its own. The pedestal hums pink.'},
  amy:{item:'the stopwatch',put:['Amy','Time starts when you get here, Tom. I will be the one standing at the line, yelling.'],after:'The stopwatch ticks once. The race clock in the corner starts, very slowly, to count.'},
  tnb:{item:'the first lopsided cup',put:['TNB','Hey. You left your coffee. It is still warm, I think. Come get it.'],after:'The cup fills with something warm. A seam of gold climbs the crack in its side and closes.'}};

SCENES.ch19Mem=(c={})=>{
  const id=c.id; if(!id||!CH19_MEM[id]) return [];
  const who=id.replace(/\d/g,''),lines=CH19_MEM[id];
  return [
    {call:()=>{ sfx.chime&&sfx.chime(); }},
    ...lines.map(([n,t])=>({talk:n,lines:[t]})),
    {flag:'mem-'+id},
    {if:()=>[1,2,3].every(i=>flag('mem-'+who+i)),then:[
      {flag:'mem-'+who+'-done'},
      {call:()=>sfx.levelChime&&sfx.levelChime()},
      {talk:'Dead-Letter Office',lines:['The three pages lift and fold themselves into a small bright square. On the pedestal in the middle of the room, something clicks. There is a dent in the top that is waiting for '+CH19_KEEP[who].item+'.']}],
     else:[{toast:'Memory '+[1,2,3].filter(i=>flag('mem-'+who+i)).length+' of 3.',time:3}]}
  ];
};
SCENES.ch19Keep=(c={})=>{
  const who=c.who; if(!who||!CH19_KEEP[who]) return [];
  const k=CH19_KEEP[who];
  return [
    {talk:'Dead-Letter Office',lines:['The pedestal is waiting. You set down '+k.item+'.']},
    {talk:k.put[0],lines:[k.put[1]]},
    {flag:'ks-'+who},
    {call:()=>{ sfx.levelChime&&sfx.levelChime(); if(who==='grace') setFlag('tombo:grace3'); if(who==='rose') setFlag('tombo:rose3'); if(who==='tnb') setFlag('tombo:tnb3'); }},
    {talk:'Dead-Letter Office',lines:[k.after]},
    {if:()=>ch19Keeps()>=4,then:[
      {flag:'ch19-ready'},
      {talk:'Dead-Letter Office',lines:['Far off, in the hub, a brass bell rings by itself. Four lights are on at the Claim Desk. It is time.']},
      {toast:'Goal: Go back to the Dead-Letter Office hub and ring the bell at the Claim Desk.',time:8}],
     else:[{toast:'Goal: '+(4-ch19Keeps())+' room'+(4-ch19Keeps()===1?'':'s')+' left. Walk back out the door and try another.',time:6}]},
    {save:true}
  ];
};

// ---------- Opening: Jefferson Park, the mailbox ----------
SCENES.ch19Open=()=>[
  {flag:'ch19-open',value:'pending'},
  {call:()=>{ if(STORY.chapter<19) setChapter(19,{apply:false}); if(inParty(nara)&&typeof benchAdd==='function') benchAdd(nara); if(!inParty(amy)) forceJoin(amy,true); tomGoneApply(); }},
  {fade:'out',time:.6},{card:19,time:3.4},{fade:'in',time:.6},
  {talk:'TNB',lines:['It has been eleven hours. I have made coffee four times. I have not drunk any of it. That is not like me.']},
  {talk:'Amy',lines:['Plan. Mom and Dad are stone. Tom is somewhere the Loom does not have a place for. And there is one place in this city that keeps everything nobody could put anywhere.']},
  {talk:'Grace',lines:['The post office. We already said that.']},
  {talk:'Rose',lines:['Nara found it first.']},
  {talk:'Nara',lines:['Nara is sitting very straight in front of Tom’s mailbox, and she is staring into the slot. She has not blinked. A thin gold light is coming out of the slot, like a sleeping lamp.']},
  {talk:'TNB',lines:['That is not a regular mailbox. That is a mailbox that is thinking about something.']},
  {talk:'Amy',lines:['It’s his. It’s the mailbox at the bottom of his steps, where his bills and my birthday cards go. It’s warm.']},
  {talk:'Grace',lines:['If you drop a letter in a mailbox and it goes nowhere... where does it go?']},
  {talk:'TNB',lines:['Down. I think it goes down.']},
  {flag:'ch19-open'},
  {toast:'Goal: Press A on Tom’s mailbox, on Second Avenue, to go down.',time:8},
  {save:true}
];
SCENES.ch19Down=()=>[
  {fade:'out',time:.7},
  {call:()=>{ sfx.travel&&sfx.travel(); ch17Place('deadletter',12,14,'up'); }},
  {fade:'in',time:.9}
];
SCENES.ch19Hub=()=>[
  {flag:'ch19-hub',value:'pending'},
  {wait:.4},
  {talk:'Rose',lines:['Whoa. It’s a post office for things that don’t have anywhere to go.']},
  {talk:'TNB',lines:['Dead letters. Every undelivered thing in the city ends up under it. Birthday cards. Thank-you notes. One pretzel.']},
  {talk:'Grace',lines:['That’s MY pretzel. I mean Rose’s. Rose’s pretzel. For Deedee.']},
  {talk:'Amy',lines:['Look at the big ledger. There’s a page for Second Avenue. There’s a blank rectangle where a name should be.']},
  {talk:'TNB',lines:['It’s still wet. Somebody erased him and left the space, like they were going to write somebody else in.']},
  {talk:'Grace',lines:['Four doors. One for each of us.']},
  {talk:'TNB',lines:['People who would not forget him. That’s the whole job description.']},
  {talk:'Amy',lines:['The desk in the middle has four little brass niches in the front. Four of us, four niches. And a chair that someone just stood up out of.']},
  {talk:'Rose',lines:['There’s a thermos on it.']},
  {talk:'TNB',lines:['That’s his. I would know that thermos in the dark.']},
  {flag:'ch19-hub'},
  {toast:'Goal: Four doors lead to four rooms. In each, find three memories, then leave a keepsake on the pedestal.',time:9},
  {save:true}
];

// ---------- The Claim Desk and the Censor ----------
SCENES.ch19Claim=()=>[
  {flag:'ch19-claim',value:'pending'},
  {talk:'Dead-Letter Office',lines:['Four keepsakes glow in four brass niches. The bell sits on the counter. Rose reaches up, stands on her tiptoes, and rings it.']},
  {call:()=>{ sfx.chime&&sfx.chime(); const m=ch19Censor(); if(m) { m.hidden=false; m.x=12; m.y=9; m.mscale=1.3; } }},
  {wait:1.1},
  {talk:'Oblivion Censor',lines:['Good evening. The Office is closed. May I help you? You look lost, which is the right way to look in here.']},
  {talk:'TNB',lines:['We’re here for a name. A man named Tom, on Second Avenue.']},
  {talk:'Oblivion Censor',lines:['I have one clean line on a page. I have a name that is too loud for it. I was tidying. It is not personal. I tidy everything that does not fit.']},
  {talk:'Amy',lines:['He is my brother.']},
  {talk:'Oblivion Censor',lines:['I am sure he is lovely. He is also unclaimed. Everything here is. That is the best a thing can be, Mrs. Gregori: safe and unclaimed.']},
  {talk:'Grace',lines:['You can’t erase somebody because he doesn’t fit your form.']},
  {talk:'Oblivion Censor',lines:['It is the only thing I am for. No one has ever handed me a letter to deliver. They only hand me returns.']},
  {talk:'Rose',lines:['That’s the saddest job in the world.']},
  {talk:'Oblivion Censor',lines:['It is a very tidy job.']},
  {call:()=>{ sfx.charge&&sfx.charge(); }},
  {talk:'Oblivion Censor',lines:['Please step back from the desk. I will write the name out.']},
  {flag:'ch19-claim'},
  {save:true},
  ...SCENES.ch19Fight()
];
SCENES.ch19Fight=()=>[
  {flag:'ch19-fight'},
  {battle:()=>{ const m=ch19Censor(); if(m) { m.hidden=false; m.mscale=1.3; m.tier=0; } return m; },tut:'ch19'},
  {if:()=>flag('battle:censor')==='win',then:[],else:[
    {heal:true},
    {talk:'TNB',lines:['Up. Everybody up. Breathe. We can do this again. It’s a pottery rule: the first one always cracks.']},
    {toast:'Talk to the Oblivion Censor and press A to try again. Everyone is healed.',time:5}]}
];

SCENES.ch19After=()=>[
  {flag:'ch19-after',value:'pending'},
  {call:()=>{ tomBack(); const m=ch19Censor(); if(m) { m.x=12; m.y=9; } }},
  {wait:.6},
  {talk:'Oblivion Censor',lines:['The Censor lowers his stamp. The black bar over his face slides to the side, a little at a time, and under it is only a small tired man with ink on his cuffs.']},
  {talk:'Oblivion Censor',lines:['I have never been argued with by so many people at once. It was... full.']},
  {talk:'Tom',lines:['Sorry I was late. I was written out of the schedule. I’ll sort it out with accounting.']},
  {talk:'Rose',lines:['TATA!']},
  {talk:'Grace',lines:['TATA!']},
  {talk:'Tom',lines:['Hello. Hello. Yes. Careful of the glasses. The glasses have been through a lot.']},
  {talk:'Amy',lines:['You absolute marshmallow. You were GONE. You ate nothing. You skipped lunch for a whole afternoon, and then a night.']},
  {talk:'Tom',lines:['I had a granola bar. It was written out too. I haven’t felt this hungry since the nineties.']},
  {talk:'TNB',lines:['Hey.']},
  {talk:'Tom',lines:['Hey.']},
  {call:()=>{ intro.hearts&&[0,1,2,3,4,5].forEach(k=>setTimeout(()=>intro.hearts.push({x:player.x+.5+(Math.random()-.5),y:player.y-.6,t:0}),k*140)); setFlag('tombo:nara3'); }},
  {talk:'Nara',lines:['Nara arrives at about a hundred miles an hour and climbs directly onto Tom. Nobody tries to stop her.']},
  {talk:'Tom',lines:['I know. I know. I missed you too. I was a small gold light and I missed you the whole time.']},
  {talk:'Tom',lines:['He turns to the Censor, who is looking at the floor.']},
  {talk:'Tom',lines:['You have never delivered anything.']},
  {talk:'Oblivion Censor',lines:['No.']},
  {talk:'Tom',lines:['Rose.']},
  {talk:'Rose',lines:['Here. It’s a little bit squished. It’s for Deedee. It was held for pickup, but nobody picked it up, because she’s stone.']},
  {talk:'Tom',lines:['It is a first-timer’s route. One pretzel. One tower. Fifty-nine floors up, and then a grandmother.']},
  {talk:'Oblivion Censor',lines:['I do not... I have never left the Office.']},
  {talk:'Tom',lines:['The route is not far. The job is only to put a thing in someone’s hands. You are already very good at the part where you carry it.']},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); }},
  {talk:'Oblivion Censor',lines:['The Censor takes the pretzel in both hands, carefully, as if it were made of glass. Then he lifts his stamp, looks at it, and brings it down on the napkin. It does not say RETURN TO SENDER. It says DELIVERED.']},
  {talk:'Oblivion Censor',lines:['It is a nicer word to hold than I expected.']},
  {call:()=>{ const m=ch19Censor(); if(m) m.hidden=true; sfx.chime&&sfx.chime(); }},
  {talk:'Dead-Letter Office',lines:['In the big ledger, the clean white rectangle fills itself in, one slow letter at a time. T. O. M. The ink is the exact blue of a thermos cap.']},
  {talk:'Amy',lines:['Okay. Home. Food. Then Mom and Dad. In that order.']},
  {talk:'Tom',lines:['In that order.']},
  {fade:'out',time:.8},
  {call:()=>{ sfx.travel&&sfx.travel(); ch17Place('jpark',7,19,'up'); }},
  {fade:'in',time:1},
  {flag:'ch19-after'},
  {toast:'Goal: Tom’s house. Get everybody fed.',time:8},
  {save:true},
  ...SCENES.ch19Feast()
];

// ---------- Part B: the porch, the stove, the cab, the thaw ----------
SCENES.ch19Feast=()=>[
  {flag:'ch19-feast',value:'pending'},
  {wait:.5},
  {talk:'Tom',lines:['Stone does not respond to talking. I have checked. Stone responds to being warm for a long time with people nearby.']},
  {talk:'Amy',lines:['Mom’s rule: a house is warm when somebody is cooking in it.']},
  {talk:'Grace',lines:['So we cook.']},
  {talk:'Rose',lines:['A lot. We cook a LOT.']},
  {talk:'Olivia',lines:['Tom! You’re BACK. I saw the light on at four a.m. and I thought, he’s home, and then I thought, no, that’s a different kind of light. I made a lasagna.']},
  {talk:'Michael',lines:['I brought a rock. Lachlan picked it out. Isla ate a different rock. We are keeping a close eye on it.']},
  {talk:'Tom',lines:['Thank you. All of you. I will put the rock on the mantel.']},
  {talk:'Mrs. Alvarez',lines:['I heard there was a situation. I brought lemon bars. And peppers. My nephew grows them. They are very hot. A man called Boppy would know what to do.']},
  {talk:'Grace',lines:['Boppy would eat one raw and say it was “fine” in a voice.']},
  {fade:'out',time:.7},
  {wait:.5},
  {fade:'in',time:.8},
  {talk:'Tom',lines:['The kitchen is a mess. Every pot is in use. The window is fogged. It smells like a Sunday.']},
  {talk:'TNB',lines:['The oven door handle came off. I fixed it. You could say I handled it.']},
  {talk:'Tom',lines:['Please stop.']},
  {talk:'Amy',lines:['Lasagna, eleven minutes. Lemon bars, six. I have a timer on everything. Nobody is allowed to be late for this.']},
  {talk:'Grace',lines:['I choreographed the pasta. It goes from the pot to the plate in a very specific arc.']},
  {talk:'Rose',lines:['I am the taster. I have tasted nine times. It’s for quality.']},
  {talk:'Tom',lines:['The pasta does not go in an arc.']},
  {talk:'Grace',lines:['It goes in an arc if you believe in it, Tata.']},
  {talk:'Tom',lines:['He looks at the table. Everyone he loves is crowded around it, and somebody has put a rock in the middle like a centerpiece. He doesn’t say anything for a second.']},
  {talk:'Tom',lines:['Pack it up. Sal is waiting outside with cab seven. We are going to the Glass Tower, and we are bringing dinner.']},
  {talk:'Sal',lines:['Cab seven! Everybody in. Bring the lasagna on your lap, it holds the heat. Fifty-nine floors, no stops, I am not even charging. I am scared of that tower and I am going anyway.']},
  {fade:'out',time:.8},
  {call:()=>{ sfx.travel&&sfx.travel(); ch17Place('towervault',10,8,'up'); }},
  {fade:'in',time:1},
  {flag:'ch19-feast'},
  {save:true},
  ...SCENES.ch19Thaw()
];
SCENES.ch19Thaw=()=>[
  {flag:'ch19-thaw',value:'pending'},
  {talk:'Tom',lines:['The snow globe is still on its plinth. Inside it, very small, two stone figures hold each other up. The amber light is crawling on their hands. It is slower than before.']},
  {talk:'Amy',lines:['Mom. Dad. We brought dinner.']},
  {talk:'Rose',lines:['I brought a pretzel. It has been DELIVERED. It has a stamp.']},
  {talk:'TNB',lines:['Everybody sit. Around the plinth. Nobody leave. Plates on laps.']},
  {call:()=>{ sfx.chime&&sfx.chime(); }},
  {wait:.8},
  {talk:'Tom',lines:['Steam from the lasagna drifts across the glass. The amber light turns the color of toast. A crack of warm yellow runs along the stone, then two, then nine.']},
  {talk:'Grace',lines:['It’s working. It’s working!']},
  {call:()=>{ sfx.levelChime&&sfx.levelChime(); setFlag('tombo:deedee3'); setFlag('tombo:boppy3'); }},
  {talk:'Boppy',lines:['Oh. Oh, my back. My back is going to be talking about this for a week.']},
  {talk:'Deedee',lines:['Is that lasagna? Who made lasagna? Who has been in my kitchen?']},
  {talk:'Rose',lines:['DEEDEE! BOPPY!']},
  {talk:'Deedee',lines:['Oh, my babies. Come here. All of you. Come here, to the moon and back and back and back.']},
  {talk:'Boppy',lines:['Which one of you is eating the peppers raw?']},
  {talk:'Grace',lines:['Nobody. Yet.']},
  {talk:'Boppy',lines:['Hand me one. For my knees.']},
  {talk:'Tom',lines:['Everyone is crowded onto one floor of a glass tower with plates in their laps, and for a minute, it is just a family having dinner, eight people and a dog.']},
  {talk:'Deedee',lines:['Tom. Who is the man in the gold coat? The one who kept us on a shelf?']},
  {talk:'Tom',lines:['Vance. He is still up there, at the top. He is going to want more than a shelf.']},
  {talk:'Boppy',lines:['Then we finish eating first.']},
  {call:()=>{ sfx.charge&&sfx.charge(); }},
  {talk:'Floor 59',lines:['Overhead, through the glass ceiling, every clock in the sky stops. They are all pointing at the same minute: the one just after the last. A door nobody has noticed before, high up in the tower, has begun to open.']},
  {talk:'Tom',lines:['He sets down his plate. Then he picks it back up.']},
  {talk:'Tom',lines:['Seconds first. Then the sky.']},
  {fade:'out',time:.8},{card:19,done:true,time:3.4},{flag:'ch19-thaw'},{flag:'ch19-done'},
  {fade:'in',time:.8},
  {toast:'Goal: Chapter 20 is coming. The sky has a clock in it now.',time:8},
  {call:()=>showToast&&showToast('CHAPTER 19 COMPLETE! Chapter 20 is still being built.',7)},
  {save:true}
];

TRIGGERS.push(
  {id:'ch19-open',map:'jpark',when:{mode:'full',chapter:[18,19],flag:'ch18-done',notFlag:'ch19-open'},scene:'ch19Open'},
  {id:'ch19-hub',map:'deadletter',when:{...CH19,flag:'ch19-open',notFlag:'ch19-hub'},scene:'ch19Hub'},
  {id:'ch19-after',map:'deadletter',when:{...CH19,flag:{'battle:censor':'win'},notFlag:'ch19-after'},scene:'ch19After'},
  {id:'ch19-feast',map:'jpark',when:{...CH19,flag:'ch19-after',notFlag:'ch19-feast'},scene:'ch19Feast'},
  {id:'ch19-thaw',map:'towervault',when:{...CH19,flag:'ch19-feast',notFlag:'ch19-done'},scene:'ch19Thaw'}
);

// ---------- World state ----------
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  // Tom's mailbox on Second Avenue is the way down, from chapter 19 until the feast.
  if(STORY.chapter===19&&flag('ch18-done')&&!flag('ch19-after')) ch17Add('jpark','dlmail',7,20,1,1,'Tom’s mailbox','A blue mailbox on a post. The slot is glowing a faint gold, and the gold goes down.'); else ch17Remove('jpark','dlmail');
  // The memory rooms are walked alone, as the person whose room it is.
  const room=STORY.chapter===19?CH19_ROOMS.find(r=>r.map===currentMap.id):null;
  SOLO_SKIN=room?room.id:null;
  for(const f of followers) { const want=!!room; if(!!f.hidden!==want) f.hidden=want; }
  // The Censor waits behind the Claim Desk until the bell rings, and is gone for good once the fight is won.
  const m=ch19Censor();
  if(m) {
    const show=STORY.chapter===19&&!!flag('ch19-claim')&&flag('battle:censor')!=='win';
    if(!show&&!m.hidden) m.hidden=true; else if(show&&m.hidden) m.hidden=false;
    m.mscale=1.3;
  }
});
HOLD_RULES.push(n=>n.monster==='censor');

// ---------- Interaction ----------
const LE_pressAction_ch19=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full'&&STORY.chapter===19) {
    const t=facingTarget(),v=t&&t.kind==='object'?t.value:null,n=t&&t.kind==='npc'?t.value:null;
    if(v&&v.kind==='dlmail'&&flag('ch19-open')&&!flag('ch19-after')) {
      openChoice('Tom’s mailbox',['The slot is glowing. A faint draft is coming up out of it, and it smells like paper and old rain.'],[
        {label:'GO DOWN',fn:()=>playScene('ch19Down')},{label:'NOT YET',fn:()=>{}}]);
      return;
    }
    if(v&&v.kind==='dlmem') {
      if(flag('mem-'+v.mem)) { openDialog(v.name,['You have read this one. The page is dim now, and warm, like a cup someone has just finished.']); return; }
      playScene('ch19Mem',{ctx:{id:v.mem}}); return;
    }
    if(v&&v.kind==='dlkeep') {
      const who=v.keep;
      if(flag('ks-'+who)) { openDialog(v.name,['The keepsake sits on its pedestal, glowing. It is exactly where it belongs.']); return; }
      if(flag('mem-'+who+'-done')) { playScene('ch19Keep',{ctx:{who}}); return; }
      openDialog(v.name,['A small brass pedestal with a dent in the top. It is still waiting. Find the three memory pages in this room first.']); return;
    }
    if(v&&v.kind==='dlaltar') {
      if(flag('ch19-ready')&&!flag('ch19-claim')) { playScene('ch19Claim'); return; }
      if(flag('ch19-claim')&&flag('battle:censor')!=='win') { playScene('ch19Fight'); return; }
      openDialog(v.name,[storyVariant(v,'text'),ch19Keeps()+' of 4 keepsakes are in the niches.'+(ch19Keeps()<4?' The bell stays quiet until all four are.':'')]); return;
    }
    if(n&&n.monster==='censor'&&flag('ch19-claim')&&flag('battle:censor')!=='win') { playScene('ch19Fight'); return; }
  }
  return LE_pressAction_ch19();
};
