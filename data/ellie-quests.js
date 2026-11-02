'use strict';
// data/ellie-quests.js: Aunt Ellie's optional bets and prizes, one per Part 1 chapter (Tom, 2026-11-02).
// How it works: talking to Ellie runs ellieQuest() (hooked in engine/overworld.js, kin branch; both Ellie NPC specs in
// data/maps-le.js have `quest:()=>ellieQuest()`).
//   - Chapters 1, 3, 5, 7, 9 (Tom is on Long Island): once the chapter's first big beat has happened (`beat` flag), Ellie jokes about it
//     and bets Tom a prize if he finishes the chapter (`ch<N>-done`). Come back and she pays.
//   - Chapters 2, 4, 6, 8, 10 (Tom is in LA or flying, so he can't reach her until the chapter is over): Ellie pays on his return and says she
//     bet Deedee he would manage it. The prize is the same kind of thing either way.
// Flags: ellie-offer-<N> (she made the bet), ellie-paid-<N> (prize handed over). Both ride along in saves with STORY.flags.
// Every prize is a new unique item in data/party.js (ids e_*): gear you equip, or a battle item (slot null) in a stack.
// Dialogue uses contractions and no em dashes. These lines are silent until Tom bakes them.
const ELLIE_BETS=[
  {n:1,beat:'ch1-theft',item:'e_brooch',count:1,
    offer:['Tom. I hear a swamp creature ran off with Deedee\'s pie tin. Finally, someone in this family with ambition.',
      'Bring that tin home to your mother, darling. Do it properly, and come back to me. I have something that would suit you.'],
    remind:'The pie tin, darling. Swamp, creature, tin. In that order. Then come see me.',
    pay:['The tin is home, the pie is safe, and a swamp somewhere is missing its crown. Well done.',
      'This is a pin from a church raffle in 1983. A little tin pie. Wear it into battle. Every good outfit needs one thing that has survived a war.']},
  {n:2,item:'e_scarf',count:1,
    pay:['Deedee tells me the whole of Second Avenue went purple, and a poor man stopped mid sentence for forty years. And you cleared the sky.',
      'I bet Deedee a dessert you would. She said, Ellie, you can\'t bet on family. I said, watch me. Here is your cut. Silk. Nothing gets past it, not even smog.']},
  {n:3,beat:'ch3-pier',item:'e_tea',count:3,
    offer:['A fish ate Boppy\'s pepper jar. Pickled in 1989. That fish has taste and no manners.',
      'Get the jar back from the deep end, Tom, and come see me. I keep a few things for people who rescue peppers.'],
    remind:'The jar, darling. A fish has it. Fetch it. Then come see me.',
    pay:['The jar is home, Boppy\'s stomach will live, and so will the rest of us. Barely.',
      'Take this tea. It\'s what I give anyone who has had a long day near water. Everybody gets a cup. Boppy gets two, and he doesn\'t get to complain about either.']},
  {n:4,item:'e_cuecards',count:3,
    pay:['Deedee says a movie studio lost its mind and a Director took over the lights. And you fixed the rig and wheeled the rack home.',
      'I bet Deedee you would. I have worked with directors. They never listen. Cue cards help. Hold one up to anything loud and tell it to behave.']},
  {n:5,beat:'ch5-pruitt',item:'e_hallpass',count:1,
    offer:['Amy has thirty parents coming at seven, and the school bells have lost their minds. Every clock in the building fighting over the time. I would have loved that in 1962.',
      'Set the school straight, Tom, and walk your sister out. Then come back. I have a soft spot for anyone who survives a conference night.'],
    remind:'The school, darling. Clocks, parents, one very tired sister. Then come see me.',
    pay:['A night of runaway clocks, thirty parents and one red pen with opinions. And Amy still got home on time. That is a miracle with a clipboard.',
      'This hall pass has been signed since 1961. Nobody has ever refused it. Hold it up when somebody goes down, and watch them stand.']},
  {n:6,item:'e_earrings',count:1,
    pay:['Deedee says a squirrel in a top hat took the starter. Of course he did. Squirrels have excellent taste in bread and terrible taste in hats.',
      'I bet Deedee you would get it back. Pearls, from my eleventh trip to Paris. Squirrels love anything shiny. Now you are the one who comes out ahead.']},
  {n:7,beat:'ch7-goal',item:'e_glasses',count:1,
    offer:['Grace tells me the library is whispering. Whispering! I have been trying to get that room to whisper since the Eisenhower years.',
      'Quiet the place down, Tom, and come back to me. I have something for your eyes.'],
    remind:'The library, darling. The whispering. Put it right, then come see me.',
    pay:['The Reading Room is open, the library has its manners back, and you put the gold letters in card order. Frankly, I\'m impressed.',
      'These are my reading glasses. A chain, rhinestones, and an opinion about everybody. Wear them. You\'ll see what people actually mean.']},
  {n:8,item:'e_china',count:3,
    pay:['Deedee says every oven on Second Avenue went cold at noon, and you still got forty loaves to the potluck.',
      'I bet Deedee you would. Take these plates. The good china. It was never for Boppy. It was always for emergencies. Throw them hard.']},
  {n:9,beat:'ch9-letter',item:'e_fan',count:1,
    offer:['The Moon Club. I have waited fifty years for somebody to go back in there, and it had to be you, in those shoes.',
      'Find the three mirrors, darling, and bring the moon home. Come see me after. I kept something from the last dance besides the coat.'],
    remind:'The moon, Tom. Three mirrors. Then come see me. I\'m not going anywhere. I have cards.',
    pay:['The moon is back and so is my coat. The silver ball turned for you. I always said it was a gentleman.',
      'I took this from the last dance too. A silver fan. Grace has been asking for one, a big one. Give her mine. Do not let Boppy near it.']},
  {n:10,item:'e_tag',count:1,
    pay:['You told me the whole airport story and I made you leave nothing out. A gate that doesn\'t exist and a man in a long coat. And Flight Zero went nowhere, politely.',
      'I bet Deedee you would be home for dinner. Take this. Eleven trips to Paris and I never lost a bag. It\'s luggage tag luck. It will keep you ahead.']}
];

const ellieOffered=n=>!!flag('ellie-offer-'+n);
const ellieDone=n=>!!flag('ch'+n+'-done');
const ellieBeat=b=>{ const r=ELLIE_BETS.find(x=>x.n===b.n); return !!(r&&r.beat&&flag(r.beat)); };

// Hand over a prize: stacks go in the bag together, one pickup toast.
function ellieGive(id,count) {
  for(let i=1;i<(count||1);i++) bag.push(id);
  grantItem(id);
}

// What Ellie says now, or null when she has no bet business (her usual lines play).
// Returns {lines, replace, onClose}: replace=true swaps her usual lines, false adds after them.
function ellieQuest() {
  if(typeof STORY==='undefined'||STORY.mode!=='full') return null;
  const owed=ELLIE_BETS.filter(b=>ellieDone(b.n)&&!flag('ellie-paid-'+b.n));
  const pays=owed.slice(0,2);   // two prizes per visit keeps the dialogue short; she says so when more are waiting
  if(pays.length) {
    const lines=[];
    pays.forEach((b,i)=>{ if(i>0) lines.push('And another thing. While I have you.'); lines.push(...b.pay); });
    if(owed.length>pays.length) lines.push('There\'s more, darling. Sit down, have a cookie, and ask me again.');
    return {replace:true,lines,onClose:()=>{ for(const b of pays) { setFlag('ellie-paid-'+b.n); ellieGive(b.item,b.count); } }};
  }
  const offers=ELLIE_BETS.filter(b=>b.offer&&ellieBeat(b)&&!ellieOffered(b.n)&&!ellieDone(b.n));
  if(offers.length) {
    const b=offers[0];
    return {replace:true,lines:b.offer.slice(),onClose:()=>{ setFlag('ellie-offer-'+b.n); showToast('Aunt Ellie has a prize for you if you finish this one.',3.2); }};
  }
  const open=ELLIE_BETS.find(b=>b.remind&&ellieOffered(b.n)&&!ellieDone(b.n));
  if(open) return {replace:false,lines:[open.remind]};
  return null;
}
