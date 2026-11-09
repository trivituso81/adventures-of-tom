'use strict';
// engine/intro.js — Title prompt (START NEW / LOAD) and the opening scene.
// Opening: Tom steps out of Long Island Taxi Co. alone, Grace and Rose run in and jump on him for a hug,
// Rose climbs onto his shoulders, Grace shows off her gold soup dumpling squishy, then they join the party.
// The scene is a list of steps; each step has start() and update(dt) that returns true when done.
const intro={active:false,phase:'',steps:[],cur:null,fade:0,hearts:[],bubble:null,squishy:null,showcase:null,t:0,noGo:[]};

// Grace's sparkling diamond gold soup dumpling squishy (18x14, kawaii face).
const SQUISHY=[
  '........oo........',
  '.......olwo.......',
  '......okglko......',
  '....ooglgglgoo....',
  '...oglkgblgkglo...',
  '..ollgkgggkgggdo..',
  '.olwlggggggggggdo.',
  '.olwgggggggggggdo.',
  'olggggeggggeggggdo',
  'olgggpeggggepgggdo',
  'olggggggmmggggggdo',
  '.ogggggggggggggdo.',
  '..oddddddddddddo..',
  '...oooooooooooo...'
];
// Painted hero version (art/props/grace/gold_dumpling_hero.webp, 2026-11-01). Used whenever a scene does not pass its own sprite; the pixel SQUISHY stays as the fallback until it loads.
const SQUISHY_HERO='grace/gold_dumpling_hero';
if(typeof PROPART!=='undefined') PROPART.preload([SQUISHY_HERO]);
const SQUISHY_PAL={o:'#5a3a10',g:'#f2c44a',l:'#ffe08a',d:'#c98a1e',w:'#fffbe6',k:'#b0741a',b:'#aef0ff',e:'#3a2a1a',p:'#ff9ac0',m:'#a8452f'};

const IA=()=>({g:followers.find(f=>f.member===grace),r:followers.find(f=>f.member===rose)});
const lerp1=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

// ---------- Title ----------
function startTitle(next) {
  intro.active=true; intro.phase='title'; intro.steps=[]; intro.cur=null; intro.fade=0;
  const h=houseById.taxi;
  currentMap=town;
  player.x=h.door.x; player.y=h.door.y; player.facing='down'; player.move=null; player.hidden=true; player.scr=null;
  for(const f of followers) { f.hidden=true; f.move=null; f.scr=null; f.lift=0; f.x=player.x; f.y=player.y; }
  refreshAreaUI(); resize(); camera.snap=true;
  toastUntil=0;
  setTimeout(next||titleMenu,next?250:500);
}
function titleMenu() {
  if(typeof splashReturn==='function'&&splashReturn()) return;
  openChoice('The Adventures of Tom','Start a new adventure, or load a saved one?',[
    {label:'START NEW',fn:confirmNew},
    {label:'LOAD',fn:loadMenu}
  ]);
}
function confirmNew() {
  if(!readSave('auto')) { beginOpening(); return; }
  titleAsk('Start New','A new game replaces the autosave once it begins. Slots 1 to 3 are kept.',[
    {label:'START NEW',fn:beginOpening},
    {label:'BACK',fn:titleMenu}
  ]);
}
function loadMenu() {
  const slots=SAVE_SLOTS.filter(s=>readSave(s));
  if(!slots.length) {
    titleAsk('Load','No saved games yet.',[{label:'START NEW',fn:beginOpening},restoreOption(),{label:'BACK',fn:titleMenu}]);
    return;
  }
  const nm=s=>s==='auto'?'Autosave':'Slot '+s;
  // Each save's details sit inside its own button; no text block above the buttons and no footer hint.
  titleAsk('Load','',
    slots.map(s=>({label:nm(s).toUpperCase(),sub:saveSummary(readSave(s)),fn:()=>{ endIntro(); loadGame(s); }})).concat([restoreOption(),{label:'BACK',fn:titleMenu}]),'');
}
// RESTORE FROM BACKUP on the Load page: picks a backup file (engine/save-backup.js), then shows what came back. Holds the title page open meanwhile.
function restoreOption() {
  return {label:'RESTORE FROM BACKUP',fn:()=>{
    splash.asked=true;
    pickRestore(msg=>titleAsk('Restore',msg,[{label:'LOAD',fn:loadMenu},{label:'BACK',fn:titleMenu}]));
  }};
}
function endIntro() {
  intro.active=false; intro.phase=''; intro.steps=[]; intro.cur=null;
  intro.bubble=null; intro.squishy=null; intro.showcase=null; intro.hearts=[];
  for(const k of intro.noGo) { if(typeof k==='string') town.npcNoGo.delete(k); else k.map.npcNoGo.delete(k.k); }
  intro.noGo=[]; intro.fadeLock=false; intro.card=null;
  player.hidden=false; player.scr=null; player.lift=0; player.scenePose=null;
  for(const f of followers) { f.hidden=false; f.scr=null; f.lift=0; f.depthBias=0; f.noShadow=false; f.seat=false; f.scenePose=null; }
}

// ---------- Step helpers ----------
const S={
  wait:s=>({t:0,start(){},update(dt){ return (this.t+=dt)>=s; }}),
  call:fn=>({start(){ fn(); },update(){ return true; }}),
  // voice: one [character, LINES kind] per line, spoken as each line appears (baked clip if there is one, else speech).
  talk:(name,lines,voice)=>({start(){ this.i=-1; openDialog(name,lines); this.speak(); },
    speak(){ if(!voice||dialog.index===this.i) return; this.i=dialog.index; const v=voice[this.i]; if(v) say(v[0],v[1],v[2]||0,v[3]); },
    update(){ if(!dialog.active) return true; this.speak(); return false; }}),
  // Walk an actor tile by tile through a list of [x,y].
  walk:(a,tiles,dur,onStep)=>({i:0,start(){ this.i=0; this.next(); },
    next(){ const t=tiles[this.i++]; if(!t) return false; if(onStep) onStep(this.i); a.facing=directionTo(t[0]-a.x,t[1]-a.y); a.move={fx:a.x,fy:a.y,tx:t[0],ty:t[1],elapsed:0,duration:dur}; return true; },
    update(dt){ if(!a.move) return true; if(advanceMove(a,dt)) return !this.next(); return false; }}),
  // Hop an actor through the air from tile (fx,fy) to (tx,ty), landing at height endLift (shoulders) or the ground.
  hop:(a,from,to,dur,arc,lift0,lift1)=>({t:0,start(){ this.t=0; a.move=null; a.scr={x:from[0],y:from[1]}; a.lift=lift0; },
    update(dt){
      this.t+=dt; const u=Math.min(1,this.t/dur),e=ease(u);
      a.scr={x:lerp1(from[0],to[0],e),y:lerp1(from[1],to[1],e)};
      a.lift=lerp1(lift0,lift1,e)+Math.sin(Math.PI*u)*arc;
      return u>=1;
    }}),
  all:(...list)=>({start(){ this.list=list.map(s=>({s,done:false,started:false})); },
    update(dt){ let done=true; for(const x of this.list) { if(x.done) continue; if(!x.started) { x.s.start(); x.started=true; } x.done=x.s.update(dt); if(!x.done) done=false; } return done; }}),
  seq:(...list)=>({start(){ this.i=0; this.started=false; },
    update(dt){ while(this.i<list.length) { const s=list[this.i]; if(!this.started) { s.start(); this.started=true; } if(!s.update(dt)) return false; this.i++; this.started=false; } return true; }})
};

// The greeting (painted, data/story-poses.js set "hug", CHANGES 407): Tom hears the girls shout (hg_hear), lights up (hg_delight) and crouches with his arms open (hg_crouch)
// while they run in; then one painted group picture at Tom's tile replaces the three of them (hg_run, hg_crash, then hg_group, held under the greeting lines).
// hugEndStep() brings the girls and Tom's walking figure back.
function hugHearStep() {
  const SEQ=[['hg_hear',0],['hg_delight',.32],['hg_crouch',.68]];
  return {t:0,start(){ this.t=0; if(typeof storyPosesLoad==='function') storyPosesLoad('tom'); player.scenePose={f:'hg_hear'}; },
    update(dt){ this.t+=dt; let f='hg_hear'; for(const [n,at] of SEQ) if(this.t>=at) f=n;
      player.scenePose={f}; return this.t>=.9; }};
}
function hugStep() {
  const SEQ=[['hg_run',0],['hg_crash',.28],['hg_group',.58]];
  return {t:0,start(){ this.t=0; this.f=''; this.kissed=false; const {g,r}=IA(); g.hidden=true; r.hidden=true; g.scr=null; r.scr=null; g.lift=0; r.lift=0; },
    update(dt){
      this.t+=dt; const t=this.t; let f='hg_run'; for(const [n,at] of SEQ) if(t>=at) f=n;
      if(f!==this.f) { this.f=f; player.scenePose={f}; if(f==='hg_crash') { snd.oof(0); snd.squeeze(.3); sfx.giggle(); } }
      if(!this.kissed&&t>=.95) { this.kissed=true; sfx.kiss&&sfx.kiss(); }
      if(t>.58&&t<1.4&&Math.floor(t*10)!==Math.floor((t-dt)*10)&&Math.floor(t*10)%2===0) intro.hearts.push({x:player.x+.5+(Math.random()-.5)*.8,y:player.y-.6,t:0});
      return t>=1.5;
    }};
}
// After the greeting lines: the girls reappear at their tiles beside Tom and he stands up in his walking figure.
function hugEndStep() {
  return {start(){ const {g,r}=IA(); g.hidden=false; r.hidden=false; player.scenePose=null; },update(){ return true; }};
}

// Tom stretches after six hours in the cab line: his eight painted stretch poses (data/story-poses.js, storypose1) in order, facing the camera.
const STRETCH_DUR=2.4; // seconds for the whole stretch
const STRETCH_SEQ=[['st_stiff',0],['st_rise',.1],['st_reach',.22],['st_bendl',.42],['st_bendr',.54],['st_push',.66],['st_exhale',.76],['st_fresh',.88]];
function stretchStep() {
  return {t:0,start(){ this.t=0; this.s2=false; player.facing='down'; player.scenePose={f:'st_stiff'}; snd.stretch(); },
    update(dt){ this.t+=dt; if(!this.s2&&this.t>STRETCH_DUR*.75) { this.s2=true; snd.stretch(); }
      const u=Math.min(1,this.t/STRETCH_DUR); let f='st_stiff'; for(const [n,at] of STRETCH_SEQ) if(u>=at) f=n;
      player.scenePose={f};
      if(u>=1) { player.scenePose=null; return true; } return false; }};
}
// Little character sounds for the opening, built on the game's synth (tone and noise).
const snd={
  patter(k){ const f=k?1500:1200; tone({type:'triangle',f0:f,f1:f*.7,dur:.04,vol:.07}); },
  gasp(){ tone({type:'sine',f0:600,f1:1100,dur:.18,vol:.1}); },
  oof(d){ tone({type:'triangle',f0:180,f1:110,dur:.16,vol:.2,delay:d}); noise({dur:.08,vol:.08,f0:500,f1:200,type:'lowpass',delay:d}); },
  squeeze(d){ tone({type:'sine',f0:900,f1:1400,dur:.12,vol:.1,delay:d}); tone({type:'sine',f0:1400,f1:1000,dur:.14,vol:.08,delay:d+.12}); },
  whee(down){ tone({type:'sine',f0:down?1500:500,f1:down?500:1600,dur:.4,vol:.12,sweep:'linear'}); },
  squeak(){ tone({type:'sine',f0:1200,f1:2200,dur:.08,vol:.12}); tone({type:'sine',f0:2200,f1:1500,dur:.1,vol:.1,delay:.08}); },
  sparkle(){ [1568,2093,2637,3136,2637,3136].forEach((f,i)=>tone({type:'triangle',f0:f,dur:.12,vol:.07,delay:i*.07})); noise({dur:.5,vol:.04,f0:6000,f1:8000,delay:.1}); },
  stretch(){ tone({type:'sine',f0:300,f1:520,dur:.6,vol:.1,sweep:'linear'}); tone({type:'sine',f0:520,f1:220,dur:.7,vol:.09,delay:.75,sweep:'linear'}); noise({dur:.5,vol:.04,f0:900,f1:300,type:'lowpass',delay:.8}); }
};
// ---------- The opening scene ----------
const SHOULDER=28; // px: Rose's feet sit at Tom's shoulders
// The script lives in data/scenes.js (SCENES.opening) and runs on the story engine's scene format (engine/story.js).
function beginOpening() {
  intro.phase='scene';
  if(typeof storyPosesLoad==='function') { storyPosesLoad('tom'); storyPosesLoad('grace'); }   // Tom's stretch and Grace's squishy poses
  playScene('opening',{fade:.7});
}
function finishOpening() {
  const {g,r}=IA(),dx=player.x,row=player.y;
  endIntro();
  g.x=dx-1; g.y=row; g.facing='right'; g.move=null;
  r.x=dx-1; r.y=row+1; r.facing='up'; r.move=null;
  player.facing='down';
  // Followers walk the trail of tiles Tom leaves: Grace first, then Rose.
  trail.length=0; trail.push({x:r.x,y:r.y},{x:g.x,y:g.y},{x:player.x,y:player.y});
  sfx.levelChime();
  showToast('Grace and Rose join the party!',3);
  setTimeout(()=>{ if(!dialog.active) showToast('Tap the map to walk, or use the D-pad. A / Enter says hello.',4); },3400);
  saveGame('auto',true);
}

// ---------- Update and draw ----------
function updateIntro(dt) {
  intro.t+=dt;
  if(intro.fade>0&&intro.phase==='scene'&&!intro.fadeLock) intro.fade=Math.max(0,intro.fade-dt/.8);
  for(const hh of intro.hearts) hh.t+=dt;
  intro.hearts=intro.hearts.filter(hh=>hh.t<1.2);
  if(intro.bubble) intro.bubble.t+=dt;
  if(intro.squishy) intro.squishy.t+=dt;
  if(intro.showcase) intro.showcase.t+=dt;
  updateNPCs(dt);
  if(dialog.active) updateDialog(dt);
  if(intro.phase!=='scene') return;
  while(intro.active&&intro.phase==='scene') {
    if(!intro.cur) { const st=intro.steps.shift(); if(!st) return; intro.cur=st; st.start(); if(!intro.active) return; }
    if(!intro.cur.update(dt)) return;
    intro.cur=null; dt=0;
  }
}

// World-space extras: the shout bubble, hearts, and a scene's prop over a girl's head.
function drawIntroWorld(time) {
  const {g,r}=IA();
  if(intro.bubble) {
    const sc=2,txt=intro.bubble.text,w=txt.length*4*sc+12;
    // Shouted from off to the left: pin it to the left edge of the screen until the girls are in view.
    const gx=g.hidden?-1e9:(position(g).x+.5)*T;
    const x=Math.round(Math.max(camera.x+w/2+8,gx)),y=Math.round((player.y+.3)*T-40+Math.sin(time*20)*1.5);
    rect(x-w/2-2,y-2,w+4,18,OUT); rect(x-w/2,y,w,14,'#fff1cb');
    label(txt,x,y+2,'#b4553f',sc);
  }
  for(const hh of intro.hearts) {
    gfx.globalAlpha=Math.max(0,1-hh.t/1.2);
    drawHeart(Math.round(hh.x*T),Math.round(hh.y*T-hh.t*30-14-44*(actorK()-1)),1+Math.max(0,1-hh.t/.3)*.6);   // pops in above his head (same lift as the kiss hearts), then settles
    gfx.globalAlpha=1;
  }
  // A held prop over a girl's head: a scene passes its own {sprite, pal, who:'rose'} (Nine Scoops). Grace holds her dumpling in her painted poses in the opening (storypose1).
  const sqA=intro.squishy&&intro.squishy.who==='rose'?r:g;
  if(intro.squishy&&intro.squishy.sprite&&sqA&&!sqA.hidden) {
    const p=position(sqA),u=Math.min(1,intro.squishy.t/.35),SQ=intro.squishy.sprite,SP=intro.squishy.pal;
    const fr=OW[sqA===r?'rose':'grace'].down[0],gh=fr.length;
    const cx=Math.round((p.x+.5)*T),top=Math.round((p.y+1)*T-2-gh-6-u*8+Math.sin(time*4)*1.5);
    drawSprite(SQ,SP,cx-Math.round(SQ[0].length/2),top-SQ.length,1);
    if(!intro.squishy.plain) sparkles(cx,top-7,14,time,1);
  }
}
function sparkles(cx,cy,r,time,sc) {
  for(let k=0;k<6;k++) {
    const ph=(time*.9+k/6)%1,a=k*1.047+time*.6,rr=r*(.7+ph*.6);
    const x=Math.round(cx+Math.cos(a)*rr),y=Math.round(cy+Math.sin(a)*rr*.8);
    gfx.globalAlpha=1-Math.abs(ph-.5)*2;
    const c=k%2?'#fffbe6':'#aef0ff',s=sc*(ph<.5?2:1);
    rect(x-s,y,s*2+sc,sc,c); rect(x,y-s,sc,s*2+sc,c);
    gfx.globalAlpha=1;
  }
}
// Screen-space: the title card, the fade-in, and Grace's squishy close-up.
function drawIntroScreen(time) {
  if(intro.phase==='title') {
    rect(0,0,W,H,'rgba(20,32,28,.55)');
    const P=logoUnit(W*.86,H*.32);
    drawGameLogo(W/2,Math.round(safeTop+H*.1),P,time,false);
  }
  if(intro.fade>0) rect(0,0,W,H,'rgba('+(intro.whiteout?'255,246,200':'20,32,28')+','+intro.fade+')');   // intro.whiteout: chapter 18's flash of light
  if(intro.showcase) {
    // Fit between the header and the dialogue box, which covers more of the screen in landscape.
    const box=$('dialog'),dh=box&&!box.hidden?box.offsetHeight/scale:safeBottom,avail=Math.max(80,H-safeTop-dh);
    const u=Math.min(1,intro.showcase.t/.4),sc=Math.max(2,Math.min(7,Math.floor(W/60),Math.floor((avail-50)/16)));
    const cy=Math.round(safeTop+(avail-38)/2),cx=Math.round(W/2);
    gfx.globalAlpha=.6*u; rect(0,0,W,H,'#14201c'); gfx.globalAlpha=1;
    // Rays
    gfx.save(); gfx.translate(cx,cy); gfx.rotate(time*.4); gfx.globalAlpha=.25*u;
    for(let k=0;k<8;k++) { gfx.rotate(Math.PI/4); gfx.fillStyle='#ffe08a'; gfx.beginPath(); gfx.moveTo(0,0); gfx.lineTo(-10,-W); gfx.lineTo(10,-W); gfx.fill(); }
    gfx.restore(); gfx.globalAlpha=1;
    const s=Math.max(1,Math.round(sc*ease(u))),bob=Math.round(Math.sin(time*3)*3);
    // Squish: it gets a little wider and shorter on a slow pulse. A scene may show its own {sprite, pal, lines} (Nine Scoops).
    const SQ=intro.showcase.sprite||SQUISHY,SP=intro.showcase.pal||SQUISHY_PAL,L2=intro.showcase.lines||['SPARKLING DIAMOND GOLD','SOUP DUMPLING SQUISHY'];
    const hw=SQ[0].length/2,hh=SQ.length/2;
    const hero=!intro.showcase.sprite&&typeof PROPART!=='undefined'&&PROPART.ready(SQUISHY_HERO),HH=hero?hh*s*1.4:hh*s;   // painted version is drawn about 40% larger than the old 18x14 sprite
    if(!(hero&&PROPART.draw(SQUISHY_HERO,cx,cy+bob,{h:HH*2}))) drawSprite(SQ,SP,cx-Math.round(hw*s),cy-Math.round(hh*s)+bob,s);
    sparkles(cx,cy+bob,13*s,time,Math.max(1,Math.round(s/2)));
    if(u>=1) L2.forEach((l,i)=>{ label(l,cx+1,cy+Math.round(HH)+14+i*15,'#1b2d27',2); label(l,cx,cy+Math.round(HH)+13+i*15,'#ffd968',2); });
  }
}
