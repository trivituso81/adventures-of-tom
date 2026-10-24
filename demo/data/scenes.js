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
    {call:()=>{ const r=sceneActor('rose'); r.x=dx; r.y=row; r.scr={x:dx,y:row}; r.lift=SHOULDER; r.noShadow=true; sfx.giggle(); }},
    {trace:'rose-shoulders'},
    {talk:'Rose',lines:['I am the tallest! Giddyup, Tata!'],voice:[['rose','intro3']]},
    {talk:'Tom',lines:['Hello, Rose. Please keep your arms and legs inside the uncle at all times.'],voice:[['tom','intro2']]},
    {face:'grace',dir:'right'}, {call:()=>{ intro.squishy={t:0}; snd.squeak(); }},
    {wait:.7},
    {call:()=>{ intro.showcase={t:0}; snd.sparkle(); }},
    {talk:'Grace',lines:["Tata, LOOK. A sparkling diamond gold dumpling squishy!","It is limited edition. There are only two in the whole world. You can squeeze it!"],voice:[['grace','intro3'],['grace','intro4']]},
    {call:()=>{ intro.showcase=null; snd.squeak(); }},
    {flag:'saw-squishy'},
    {talk:'Tom',lines:['That is the shiniest dumpling I have ever seen. And I have seen a LOT of dumplings.'],voice:[['tom','intro3']]},
    {talk:'Rose',lines:["Come on, Tata! Let's go!"],voice:[['rose','intro4']]},
    {call:()=>{ intro.squishy=null; snd.whee(true); sceneActor('rose').noShadow=false; }},
    {hop:'rose',from:[dx,row],to:[dx-1,row+1],time:.45,arc:14,lift:[SHOULDER,0]},
    {flag:'opening-done'},
    {call:finishOpening}
  ];
};
