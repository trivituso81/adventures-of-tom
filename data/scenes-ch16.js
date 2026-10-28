'use strict';
// data/scenes-ch16.js — Part 2, Chapter 16 "The Amber Eclipse" (tragedy, part 1). Loaded after data/scenes-ch15.js.
// The morning after the dinner. Tom walks into the Square (trigger on the town map) and the whole family is there for Vance's "family photograph":
// Tom, Amy, Grace and Rose out front, TNB and Nara on the bench, Deedee and Boppy beside them, Monochrome Marlowe at a big camera on a tripod.
// Vance (a voice in the camera) fires the amber beam at Grace and Rose. Deedee and Boppy step in front, arms locked, and turn to stone. Vance "helps
// with Marlowe's notes": the leftover amber turns Marlowe into an eclipse. Grace takes Rose and runs for Cab 7; Tom, Amy, TNB and Nara hold him
// (boss fight, data/ch16-battle.js, no kind route). When he falls there is NO victory fanfare, only wind (sound is switched off until the end of the
// aftermath). Then the glass comes down: Long Island is sealed in a snow globe that Vance reels up. Cab 7 gets everyone out and the chapter ends
// at the Angel City cab stand. Decision (Tom's brief had both): the whole chapter, statues included, stands in the Square.
// Flags, in order: ch16-open (the scene played), ch16-stone (Deedee and Boppy are statues), ch16-fight, battle:marlowe16 ('win'), ch16-after
// (the aftermath played), ch16-done (CHAPTER 16 COMPLETE).
const CH16={mode:'full',chapter:16};
// ---------- Screen effects (drawn over the scene, see drawIntroScreen below) ----------
const CH16FX={flash:0,beam:0,grey:0,lens:0,globe:null};
const ch16FxReset=()=>{ Object.assign(CH16FX,{flash:0,beam:0,grey:0,lens:0,globe:null}); };
const ch16Fx=(k,to,sec)=>({start(){ this.a=CH16FX[k]||0; this.t=0; },update(dt){ this.t+=dt; const u=Math.min(1,this.t/sec); CH16FX[k]=this.a+(to-this.a)*u; return u>=1; }});
function ch16DrawGlobe(time) {
  const p=CH16FX.globe; if(p===null) return;
  rect(0,0,W,H,'#120d08');
  for(let i=0;i<26;i++) { const sx=(i*97+13)%W,sy=(i*53+7)%Math.max(8,Math.floor(H*.5)); rect(sx,sy,1,1,(i%3?'#ffe9b0':'#f2a33a')); }
  const R0=Math.min(W,H)*.3,R=R0*(1-.75*p),cx=W/2,cy=H*.66-H*.56*p,s=R/R0;
  gfx.globalAlpha=.5; rect(cx-3,0,6,Math.max(0,cy-R),'#f2a33a'); gfx.globalAlpha=1; rect(cx-1,0,2,Math.max(0,cy-R),'#ffd36a');   // the cable up to the tower
  ellipse(cx,cy,R+3,R+3,'#cfeeff66'); ellipse(cx,cy,R,R,'#1b2a38'); ellipse(cx,cy-R*.25,R*.82,R*.6,'#2d4258');
  ellipse(cx,cy+R*.58,R*.88,R*.3,'#4d7a4a');
  for(const [dx,dy,w,h,c] of [[-72,22,28,22,'#c7a06a'],[-42,30,24,17,'#b86a5a'],[32,26,26,20,'#7aa0c0'],[56,32,20,15,'#d9c07a'],[-6,42,12,8,'#9ad0e8']]) rect(cx+dx*s,cy+dy*s,Math.max(2,w*s),Math.max(2,h*s),c);
  ellipse(cx,cy+34*s,12*s,12*s,'#f2a33a44'); rect(cx-9*s,cy+32*s,Math.max(2,7*s),Math.max(3,15*s),'#9a9aa2'); rect(cx+2*s,cy+30*s,Math.max(2,8*s),Math.max(3,17*s),'#8d8d96');   // two stone figures
  for(let i=0;i<30;i++) { const x=cx+Math.sin(i*12.9+time*(.4+(i%3)*.2))*R*.82,y=cy+((i*37.7+time*26*(1+i%3))%(R*1.7))-R*.85; if((x-cx)*(x-cx)+(y-cy)*(y-cy)<R*R*.8) rect(x,y,1,1,'#ffffff'); }
  ellipse(cx-R*.45,cy-R*.5,R*.16,R*.1,'#ffffff55');
  rect(cx-R*.7,cy+R*.92,R*1.4,Math.max(3,R*.2),'#6a4a2a'); rect(cx-R*.7,cy+R*.92,R*1.4,2,'#9a7242');
  if(p>.8) { gfx.globalAlpha=Math.min(1,(p-.8)*5); label('LONG ISLAND',W/2+1,H*.9+1,'#120d08',2); label('LONG ISLAND',W/2,H*.9,'#f2a33a',2); gfx.globalAlpha=1; }
}
function ch16DrawFx(time) {
  if(CH16FX.grey>0) { gfx.globalAlpha=Math.min(1,CH16FX.grey)*.6; rect(0,0,W,H,'#6e6e76'); gfx.globalAlpha=1; }
  const b=CH16FX.beam;
  if(b>0) {
    const w=(8+26*b)*(.92+.08*Math.sin(time*40));
    gfx.globalAlpha=.3*b; rect(W/2-w*1.9,0,w*3.8,H,'#f2a33a'); gfx.globalAlpha=.7*b; rect(W/2-w,0,w*2,H,'#ffd36a'); gfx.globalAlpha=b; rect(W/2-w*.4,0,w*.8,H,'#fff6c8'); gfx.globalAlpha=1;
  }
  ch16DrawGlobe(time);
  if(CH16FX.flash>0) { gfx.globalAlpha=Math.min(1,CH16FX.flash); rect(0,0,W,H,'#ffd36a'); gfx.globalAlpha=1; }
}
const LE_drawIntroScreen_ch16=drawIntroScreen;
drawIntroScreen=function(time) { LE_drawIntroScreen_ch16(time); ch16DrawFx(time); };

// ---------- Staging ----------
// [x, y, facing] in the Square: the plaza around the fountain. The camera stands on the sidewalk at (10,8), Marlowe at (12,8), the library door's approach tile (11,8) stays free; the family faces up.
const CH16_SPOTS={tom:[11,11,'up'],grace:[10,10,'up'],rose:[11,10,'up'],amy:[10,11,'up'],tnb:[9,11,'up'],nara:[8,11,'up']};
const ch16Marlowe=()=>{ const t=worlds.town; return t&&t.npcs.find(n=>n.name==='Marlowe'&&n.scripted); };
function ch16Add(kind,x,y,w,name,text) {
  const t=worlds.town; if(!t||t.objects.some(o=>o.ch16===kind)) return;
  object(t,kind,x,y,w,1,name,text,{ch16:kind});
}
function ch16Remove(kind) {
  const t=worlds.town; if(!t) return;
  for(const o of t.objects.filter(o=>o.ch16===kind)) {
    for(let yy=o.y;yy<o.y+o.h;yy++) for(let xx=o.x;xx<o.x+o.w;xx++) if(within(t,xx,yy)) { t.solid[yy*t.w+xx]=0; t.objectAt.delete(key(xx,yy)); }
    t.objects.splice(t.objects.indexOf(o),1);
  }
}
const CH16_HOME_OK={amy:'any',deedee:'any',boppy:'any',tnb:'any',nara:'any'};
// Chapter 16 begins: the family stands in the plaza for the photograph.
function ch16Stage() {
  setChapter(16,{apply:false});
  STORY.override={lock:['tom','grace','rose'],allow:['amy','tnb','nara'],bar:['deedee','boppy'],homes:CH16_HOME_OK};
  ch16FxReset(); ch16QuietOff();
  currentMap=worlds.town; player.move=null; player.hidden=false;
  if(girlsAway()) setGirlsAway(false);
  for(const m of extras()) if(m!==amy) recruitLeave(m,true);
  forceJoin(amy,true);
  for(const id of ['tnb','nara']) { const m=MEMBERS()[id]; if(m&&typeof benchAdd==='function') benchAdd(m); }
  const [tx,ty,td]=CH16_SPOTS.tom; player.x=tx; player.y=ty; player.facing=td;
  placeFollowers();
  for(const id of Object.keys(CH16_SPOTS)) { if(id==='tom') continue; const f=followers.find(f=>f.member&&f.member.id===id); if(f) { const [x,y,d]=CH16_SPOTS[id]; Object.assign(f,{x,y,facing:d,move:null,path:[]}); } }
  refreshAreaUI(); resize(); camera.snap=true; storyWorld();
}
// A straight run of tiles (inclusive of the end, exclusive of the start) so actors walk tile by tile.
function ch16Run(pts) {
  const out=[]; let [x,y]=pts[0];
  for(const [nx,ny] of pts.slice(1)) { while(x!==nx||y!==ny) { if(x!==nx) x+=Math.sign(nx-x); else y+=Math.sign(ny-y); out.push([x,y]); } }
  return out;
}
// The girls wait at the Angel City cab stand, very quiet.
const CH16_GIRL_LINES={
  Grace:['I got us in the cab. I did the right thing. Why does it feel like the wrong thing?','Boppy said nobody gets past them. Nobody did.','I’m not going to cry. I’m going to do my floor routine in a minute. That’s what I do.'],
  Rose:['They’re just doing a really good statue. That’s all.','Tata said they’re still a little warm. So it’s not forever. It’s just a long time.','I kept the crisp tin. I’m going to fill it for when Deedee wakes up.']};
function ch16Girls() {
  if(typeof ch13Girls==='function') ch13Girls();
  const room=worlds.lacab; if(!room) return;
  for(const g of room.npcs.filter(n=>n.girlAtHome)) if(CH16_GIRL_LINES[g.name]) g.lines=CH16_GIRL_LINES[g.name];
}

SCENES.ch16Open=()=>[
  {flag:'ch16-open',value:'pending'},
  {fade:'out',time:.8},
  {card:16,time:3.2},
  {call:()=>{ setFlag('ch16-open','pending'); ch16Stage(); }},
  {noGo:[7,8,13,12]},
  {spawn:{name:'Deedee',look:'pip',at:[9,10],dir:'up'}},
  {spawn:{name:'Boppy',look:'gus',at:[12,10],dir:'up'}},
  {call:()=>{ const t=worlds.town; for(const [n,sheet] of [['Deedee','deedee'],['Boppy','boppy']]) { const a=t.npcs.find(x=>x.name===n&&x.scripted); if(a) a.sheet=sheet; } }},
  {spawn:{name:'Marlowe',look:'marlowe',at:[12,8],dir:'down'}},
  {fade:'in',time:.8},
  {talk:'Tom',lines:['The Square, the morning after the dinner. Six of us, two grandparents, and one very big camera on a tripod.']},
  {talk:'Grace',lines:['I wore the good scrunchie. I want that on the record.']},
  {talk:'Rose',lines:['I wore my ALSO scrunchie.']},
  {talk:'Amy',lines:['Nobody touches anything. Hands to yourselves. If it looks like a trap, it is a trap.']},
  {talk:'Deedee',lines:['Is that the photographer? He looks like he hasn’t eaten. Robert, look how thin he is.']},
  {talk:'Boppy',lines:['A grown man in a grey suit on a Tuesday. That’s the whole problem right there.']},
  {talk:'Marlowe',lines:['Wonderful. Everybody came. I love a turnout.']},
  {talk:'Marlowe',lines:['Marlowe. Monochrome Marlowe. We met in Jefferson Park. I took the pink out of your neighbor’s window. I’d say sorry, but honestly I think it looks better.']},
  {talk:'Tom',lines:['Where is he?']},
  {talk:'Marlowe',lines:['Mr. Vance is in a meeting. He sends his regards, and a camera.']},
  {talk:'Grace',lines:['It’s a very big camera.']},
  {talk:'Rose',lines:['It’s looking at me.']},
  {talk:'Marlowe',lines:['That’s what cameras do. Little ones in front, please. Tall ones in back. Everybody tight. Mr. Vance likes everybody tight.']},
  {talk:'TNB',lines:['I took a portrait class once. This is a terrible setup. The light is coming from inside the camera.']},
  {talk:'Deedee',lines:['Is it going to take long? I have a roast in. Robert. Stand up straight.']},
  {talk:'Boppy',lines:['I AM standing up straight. This is as straight as I go.']},
  {talk:'Tom',lines:['Marlowe. What is the photograph for?']},
  {talk:'Marlowe',lines:['Mr. Vance keeps the happy ones. A good family at the right moment, just so. Nothing ever changes again. Nobody leaves. It’s a gift.']},
  {talk:'TNB',lines:['Nobody asked for the gift.']},
  {talk:'Tom',lines:['We said we’d bring everyone. We didn’t say we’d stay.']},
  {talk:'Marlowe',lines:['Everybody stays in a photograph. That’s what a photograph is.']},
  {all:[{call:()=>sfx.charge&&sfx.charge()},ch16Fx('lens',.6,1.2)]},
  {talk:'Vance',lines:['Hello, Tom. Thank you for flying nowhere. I have waited a very long time for a picture where nobody leaves.']},
  {talk:'Boppy',lines:['That’s the voice. That’s the fella with the deal.']},
  {talk:'Vance',lines:['Hello, Robert. You broke our contract. That’s all right. I am a forgiving man. Everybody, please look here.']},
  {talk:'Grace',lines:['I’m doing my photo face.']},
  {talk:'Rose',lines:['I’m doing my ALSO face.']},
  {call:()=>{ sfx.charge&&sfx.charge(); }},
  {talk:'Tom',lines:['Amy.']},
  {talk:'Amy',lines:['I know. Girls, down. Behind me. NOW.']},
  {talk:'Vance',lines:['Not Tom. Not the grown ones. The little ones. The ones with all their years still in them. Those are the ones I want to keep.']},
  {talk:'Tom',lines:['No.']},
  {all:[{call:()=>{ sfx.charge&&sfx.charge(); }},ch16Fx('lens',1,1.4)]},
  {talk:'Deedee',lines:['Robert.']},
  {talk:'Boppy',lines:['I know.']},
  {all:[
    {walk:'Deedee',to:[[9,9],[10,9]],speed:.24},
    {walk:'Boppy',to:[[12,9],[11,9]],speed:.22}]},
  {face:'Deedee',dir:'up'},{face:'Boppy',dir:'up'},
  {talk:'Deedee',lines:['Girls. Close your eyes. Moon and back.']},
  {talk:'Boppy',lines:['Nobody gets past us.']},
  {talk:'Tom',lines:['Mom! Dad!']},
  {call:()=>{ sfx.whoosh&&sfx.whoosh(); sfx.charge&&sfx.charge(); }},
  {ch16FxBeam:true},
  {talk:'Deedee',lines:['Fifty-one years.']},
  {talk:'Boppy',lines:['...And counting.']},
  {ch16FxStone:true},
  {wait:1.8},
  {talk:'Rose',lines:['Deedee?']},
  {talk:'Grace',lines:['Boppy. You can move now.']},
  {wait:.8},
  {talk:'Amy',lines:['Mom.']},
  {talk:'Tom',lines:['Nobody moves. Nobody says anything. In the middle of the Square two stone figures hold each other up, and a small amber light crawls along their joined hands.']},
  {talk:'Vance',lines:['There. That is a family photograph. Thank you, Tom. You may keep the frame.']},
  {talk:'Tom',lines:['Where are you?']},
  {talk:'Vance',lines:['Marlowe. Collect the children.']},
  {talk:'Marlowe',lines:['Mr. Vance. They are... they are children. I only moved the colors around. That’s all I ever did. I never wrote anything like that.']},
  {talk:'Vance',lines:['Then I shall help with your notes.']},
  {ch16FxMarlowe:true},
  {talk:'Marlowe',lines:['Less. Less. Less. That is all I ever wanted. Less.']},
  {talk:'Tom',lines:['Grace. Rose. Go. Cab seven. Find Sal. Now.']},
  {talk:'Grace',lines:['But Deedee...']},
  {talk:'Tom',lines:['I know. Go. Please, Grace.']},
  {talk:'Grace',lines:['Rose. Hand. Run. Now.']},
  {talk:'Rose',lines:['But Boppy...']},
  {talk:'Grace',lines:['I KNOW. RUN.']},
  {all:[
    {walk:'grace',to:()=>ch16Run([[10,10],[15,10],[15,20],[25,20]]),speed:.16},
    {walk:'rose',to:()=>ch16Run([[11,10],[15,10],[15,20],[25,20]]),speed:.16}]},
  {party:null},
  {call:()=>{ for(const id of ['tnb','nara']) { const m=MEMBERS()[id]; if(m&&typeof onBench==='function'&&onBench(m)) benchToParty(m); } placeFollowers(); }},
  {talk:'Amy',lines:['Tom. Whatever this is, it is between them and the road.']},
  {talk:'Tom',lines:['Then it doesn’t get past us. Dad said so.']},
  {talk:'TNB',lines:['I’m here, babe.']},
  {talk:'Nara',lines:['Nara plants her feet in the grass and growls at a grey man with a sun behind his head.']},
  {toast:'Tip: this is a hard one. Heal after OVEREXPOSURE. Break the eclipse with Chatter, Splash or Kinetic hits, or a Tombo. There is no kind route.',time:9},
  {flag:'ch16-open'},
  {save:true},
  ...SCENES.ch16Fight()
];
// Custom scene ops used above (kept here so the script reads top to bottom).
SCENE_OPS.ch16FxBeam=()=>S.seq(ch16Fx('beam',1,.7),S.wait(1.5));
SCENE_OPS.ch16FxStone=()=>S.seq(
  S.call(()=>{ for(const n of ['Deedee','Boppy']) storyDespawn(n); setFlag('ch16-stone'); storyWorld(); sfx.thud&&sfx.thud(); }),
  S.all(ch16Fx('beam',0,.6),ch16Fx('flash',1,.25)),ch16Fx('flash',0,.9),ch16Fx('lens',0,.1));
SCENE_OPS.ch16FxMarlowe=()=>S.seq(
  S.call(()=>{ sfx.charge&&sfx.charge(); }),ch16Fx('flash',1,.35),
  S.call(()=>{ const n=ch16Marlowe(); if(n) Object.assign(n,{monster:'marlowe16',mscale:1.6,facing:'down'}); sfx.thud&&sfx.thud(); }),
  S.all(ch16Fx('flash',0,.8),ch16Fx('grey',.55,1.2)));

SCENES.ch16Fight=()=>[
  {flag:'ch16-fight',value:'pending'},
  ...(flag('ch16-fight')==='pending'||flag('ch16-fight')===true?[
    {talk:'Marlowe',lines:['Less. Round two.']},
    {talk:'Amy',lines:['Slow down. Break the eclipse and heal after the flash. Together.']}]:[]),
  {flag:'ch16-fight'},
  {battle:()=>{ const n=ch16Marlowe(); if(n) Object.assign(n,{monster:'marlowe16',mscale:1.6,tier:0}); return n; },tut:'ch16'},
  {if:()=>flag('battle:marlowe16')==='win',then:[
    {call:()=>{ const n=ch16Marlowe(); if(n) { n.monster=null; n.mscale=1; } ch16FxReset(); CH16FX.grey=.55; }}],else:[
    {heal:true},
    {talk:'Amy',lines:['Up. Up. We are not done. Breathe. Then we go again.']},
    {toast:'Talk to Marlowe (by the camera, north of the statues) and press A to try again. Everyone is healed.',time:5}]}
];

SCENES.ch16After=()=>[
  {flag:'ch16-after',value:'pending'},
  {call:()=>{ ch16QuietOn(); ch16Wind(6,.06); }},
  {wait:2.2},
  {talk:'Tom',lines:['The amber goes out of him all at once. Nobody cheers. There is no song. There is only the wind going through the Square.']},
  {wait:1},
  {talk:'Marlowe',lines:['I wanted it quieter. I only ever wanted it quieter.']},
  {talk:'Amy',lines:['Look at them. LOOK.']},
  {talk:'Marlowe',lines:['I didn’t want it like this.']},
  {talk:'Tom',lines:['Nobody does. That is what he counts on.']},
  {walk:'tom',to:[[11,10]],speed:.4},{face:'tom',dir:'up'},
  {wait:1.2},
  {talk:'Tom',lines:['Mom. Dad.']},
  {talk:'Tom',lines:['It’s warm. Amy. It’s still a little warm.']},
  {trace:'ch16-warm'},{hearts:'tom'},
  {talk:'Amy',lines:['Then they’re not gone.']},
  {talk:'Tom',lines:['They’re not gone.']},
  {talk:'Amy',lines:['Then we get them back.']},
  {ch16Grey:true},
  {talk:'Vance',lines:['Thank you for the photograph. It is perfect. I would like to keep it.']},
  {talk:'Tom',lines:['Give them back.']},
  {talk:'Vance',lines:['Nobody leaves, Tom. That is what a photograph is for. If you want them, you know the building. Downtown. Sixty floors. Do come up. I will leave the light on.']},
  {call:()=>{ sfx.thud&&sfx.thud(); sfx.charge&&sfx.charge(); ch16Wind(3,.08); }},
  {talk:'Sal',lines:['TOMMY! The glass is coming down! I have the girls in the cab! GET IN!']},
  {talk:'Tom',lines:['Amy. TNB. Nara. Run.']},
  {talk:'Tom',lines:['Dad. Keep her warm. I’m coming back.']},
  {ch16Globe:true},
  {call:()=>{ storyDespawn('Marlowe'); ch16Remove('tripod'); ch16FxReset(); }},
  {flag:'ch16-after'},
  {fade:'out',time:.8},{card:16,done:true,time:3.4},{flag:'ch16-done'},
  {call:()=>{ ch16QuietOff(); setChapter(16,{apply:true}); ch16Girls(); currentMap=worlds.lacab; player.x=7; player.y=6; player.facing='left'; player.move=null; player.hidden=false; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); }},
  {fade:'in',time:.8},
  {talk:'Tom',lines:['Sal took the Sub-Rail the long way, with the meter off. Nobody has said anything since the tunnel.']},
  {talk:'Rose',lines:['Tata. Are they cold?']},
  {talk:'Tom',lines:['No, Rose. They’re warm. I checked.']},
  {talk:'Rose',lines:['Okay.']},
  {talk:'Grace',lines:['Then it’s not forever. It’s just a long time.']},
  {talk:'Tom',lines:['It’s just a long time.']},
  {talk:'Amy',lines:['Vance said downtown. Sixty floors. We rest tonight. Tomorrow we go up.']},
  {toast:'Goal: talk to Sol at the cab stand to start Chapter 17. Vance is waiting in the Glass Tower, Downtown.',time:8},
  {call:()=>showToast&&showToast('CHAPTER 16 COMPLETE!',7)},
  {save:true}
];
SCENE_OPS.ch16Grey=()=>S.seq(ch16Fx('grey',.9,2.2));
const ch16Say=(who,line)=>({start(){ this.d=SCENE_OPS.talk({talk:who,lines:[line]}); this.d.start(); },update(dt){ return this.d.update(dt); }});
SCENE_OPS.ch16Globe=()=>S.seq(
  S.call(()=>{ sfx.charge&&sfx.charge(); }),
  ch16Fx('flash',1,1),
  S.call(()=>{ CH16FX.globe=0; CH16FX.grey=0; }),
  S.all(
    ch16Fx('flash',0,.8),
    S.seq(ch16Fx('globe',.55,3.2),S.call(()=>ch16Wind(4,.05)),ch16Fx('globe',1,3.4)),
    S.seq(S.wait(1.2),
      ch16Say('Tom','We got out. Sal went through the closing glass with the meter running, and it shaved the roof off cab seven.'),
      ch16Say('Tom','Behind us the glass closes. Long Island is the size of a snow globe now, and a cable is taking it up into the sky.'))),
  S.wait(.8));

TRIGGERS.push(
  {id:'ch16-open',map:'town',when:{mode:'full',chapter:15,flag:'ch15-done',test:S=>!S.flags['ch16-open']},scene:'ch16Open'},   // test, not notFlag: the chapter jump must not mark it done
  {id:'ch16-after',map:'town',when:{...CH16,flag:{'battle:marlowe16':'win'},notFlag:'ch16-after'},scene:'ch16After'}
);

// ---------- World state ----------
// The statues stand in the Square from the moment they turn to stone. The camera stands there only while the chapter is live. Deedee and Boppy
// leave their house while they are stone (and come back if the story is ever rolled back in the same session).
let CH16_STASH=[];
STORY_WORLD.push(()=>{
  if(STORY.mode!=='full') return;
  const stone=STORY.chapter>=16&&flag('ch16-stone');
  if(stone) ch16Add('statue',10,9,2,'Deedee and Boppy','Two stone figures, arms locked in front of the girls. Their joined hands are still a little warm.'); else ch16Remove('statue');
  const live=STORY.chapter===16&&flag('ch16-open')&&!flag('ch16-after');
  if(live) ch16Add('tripod',10,8,1,'The camera','A very big camera on a tripod. The lens glows like a low sun.'); else ch16Remove('tripod');
  const g=worlds.grands; if(!g) return;
  if(stone) { for(const n of g.npcs.filter(n=>!n.scripted&&(n.name==='Deedee'||n.name==='Boppy'))) { CH16_STASH.push({n,map:g}); g.npcs.splice(g.npcs.indexOf(n),1); } }
  else if(CH16_STASH.length) { for(const s of CH16_STASH) s.map.npcs.push(s.n); CH16_STASH=[]; }
});
HOLD_RULES.push(n=>n.monster==='marlowe16'||n.name==='Marlowe');
{ const tut=TUTORIALS; tut.ch16={tips:[
  {id:'eclipse',who:'*',text:'Below half HP he braces behind the eclipse. Chatter, Splash and Kinetic hits break it, and so does any Tombo. There is no kind route. He is not listening.'},
  {id:'four',who:['amy'],dir:'down',care:1,text:'There is nobody on the bench. It is the four of you: Tom, Amy, TNB and Nara. Heal after OVEREXPOSURE.'}]}; }

// ---------- Talking to Marlowe starts the fight (and a retry after a loss) ----------
const LE_pressAction_ch16=pressAction;
pressAction=function() {
  if(!transition&&!intro.active&&!dialog.active&&!player.move&&STORY.mode==='full'&&STORY.chapter===16&&flag('ch16-open')&&!flag('ch16-after')&&currentMap.id==='town') {
    const t=facingTarget(),n=t&&t.kind==='npc'?t.value:null;
    if(n&&n.name==='Marlowe'&&flag('battle:marlowe16')!=='win') { playScene('ch16Fight'); return; }
  }
  return LE_pressAction_ch16();
};
