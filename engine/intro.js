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
  openChoice('Start New','A new game replaces the autosave once it begins. Slots 1 to 3 are kept.',[
    {label:'START NEW',fn:beginOpening},
    {label:'BACK',fn:titleMenu}
  ]);
}
function loadMenu() {
  const slots=SAVE_SLOTS.filter(s=>readSave(s));
  if(!slots.length) {
    openChoice('Load','No saved games yet.',[{label:'START NEW',fn:beginOpening},{label:'BACK',fn:titleMenu}]);
    return;
  }
  const nm=s=>s==='auto'?'Autosave':'Slot '+s;
  openChoice('Load',slots.map(s=>nm(s)+': '+saveSummary(readSave(s))).join('\n'),
    slots.map(s=>({label:nm(s).toUpperCase(),fn:()=>{ endIntro(); loadGame(s); }})).concat([{label:'BACK',fn:titleMenu}]));
}
function endIntro() {
  intro.active=false; intro.phase=''; intro.steps=[]; intro.cur=null;
  intro.bubble=null; intro.squishy=null; intro.showcase=null; intro.stretch=null; intro.hearts=[];
  for(const k of intro.noGo) { if(typeof k==='string') town.npcNoGo.delete(k); else k.map.npcNoGo.delete(k.k); }
  intro.noGo=[]; intro.fadeLock=false; intro.card=null;
  player.hidden=false; player.scr=null; player.lift=0;
  for(const f of followers) { f.hidden=false; f.scr=null; f.lift=0; f.depthBias=0; f.noShadow=false; f.seat=false; }
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

// Grace and Rose jump on Tom: a quick hop toward him, a squeeze, hearts, and back.
function hugStep() {
  return {t:0,start(){ this.t=0; snd.oof(0); snd.squeeze(.3); sfx.giggle(); setTimeout(()=>sfx.kiss&&sfx.kiss(),450); },
    update(dt){
      const {g,r}=IA(); this.t+=dt; const t=this.t;
      const lean=(a,dx,dy,delay)=>{
        const u=Math.max(0,t-delay);
        const k=u<.3?ease(u/.3):(u<1.1?1:Math.max(0,1-(u-1.1)/.3));
        a.scr={x:a.x+dx*.32*k,y:a.y+dy*.32*k};
        a.lift=u<.3?Math.sin(Math.PI*u/.3)*12:(u<1.1?Math.abs(Math.sin((u-.3)*16))*2:0);
      };
      lean(g,player.x-g.x,player.y-g.y,0);
      lean(r,player.x-r.x,player.y-r.y,.15);
      if(t>.3&&t<1.2&&Math.floor(t*10)!==Math.floor((t-dt)*10)&&Math.floor(t*10)%2===0) intro.hearts.push({x:player.x+.5+(Math.random()-.5)*.8,y:player.y-.6,t:0});
      if(t>=1.5) { g.scr=null; r.scr=null; g.lift=0; r.lift=0; return true; }
      return false;
    }};
}

// Tom stretches after six hours in the cab line: arms up over his head, up on his toes, a long exhale.
function stretchStep() {
  return {t:0,start(){ this.t=0; this.s2=false; player.facing='down'; intro.stretch={t:0}; snd.stretch(); },
    update(dt){ this.t+=dt; if(TOM_STRETCH&&!this.s2&&this.t>3.9) { this.s2=true; snd.stretch(); } const u=Math.min(1,this.t/(TOM_STRETCH?5.2:1.6));
      intro.stretch.t=this.t;
      if(u>=1) { intro.stretch=null; player.hidden=false; return true; } return false; }};
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
// Tom's stretch pose, built from his front overworld frame: the hanging arms are erased and redrawn raised over his head.
// pose 1 = arms halfway up (hands by his ears), 2 = full stretch (hands together above his head).
const STRETCH_PAD=10,stretchFrames={};
function stretchFrame(pose) {
  if(stretchFrames[pose]) return stretchFrames[pose];
  const src=OW.tom.down[0],w=src[0].length,h=src.length,P=STRETCH_PAD;
  const g=[]; for(let y=0;y<h+P;y++) g.push(new Array(w).fill('.'));
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) g[y+P][x]=src[y][x];
  // Erase the hanging arms (left columns 0-5 and right columns 21+, rows 26-35 of the sheet).
  for(let y=26;y<=35;y++) for(let x=0;x<w;x++) if(x<=5||x>=21) g[y+P][x]='.';
  const put=(x,y,c)=>{ x=Math.round(x); y=Math.round(y)+P; if(y>=0&&y<g.length&&x>=0&&x<w) g[y][x]=c; };
  const stroke=(pts,r,c)=>{ for(let i=0;i<pts.length-1;i++) { const [x0,y0]=pts[i],[x1,y1]=pts[i+1],n=Math.ceil(Math.hypot(x1-x0,y1-y0)*3);
    for(let k=0;k<=n;k++) { const cx=x0+(x1-x0)*k/n,cy=y0+(y1-y0)*k/n; for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++) if(dx*dx+dy*dy<=r*r+.5) put(cx+dx,cy+dy,c); } } };
  const L=pose===2?[[4,24],[2,12],[5,1],[10,-6]]:[[4,24],[1,16],[2,6]];
  const R=L.map(([x,y])=>[w-1-x,y]);
  for(const arm of [L,R]) {
    stroke(arm,2,'a');
    stroke(arm.slice(0,2),1,'d');                 // sleeve
    stroke(arm.slice(1),1,'w');                   // forearm
    const [hx,hy]=arm[arm.length-1]; stroke([[hx,hy],[hx,hy]],1,'w'); put(hx,hy,'u');
  }
  return (stretchFrames[pose]={rows:g.map(r=>r.join('')),pad:P});
}
function stretchPose(u) { return u<.12||u>.92?0:(u<.26||u>.8?1:2); }
// Painted Tom (data/tom-hires-use.js): tired, start, full, side, crack, neck, exhale, fresh over 5.2 seconds.
const STRETCH_SEQ=[['tired',0],['start',.1],['full',.22],['side',.42],['crack',.54],['neck',.66],['exhale',.76],['fresh',.88]];
function drawStretchPainted(time) {
  const u=Math.min(1,intro.stretch.t/5.2);
  let name='tired'; for(const [n,a] of STRETCH_SEQ) if(u>=a) name=n;
  player.hidden=true;
  const rows=TOM_STRETCH[name],p=position(player),w=rows[0].length,h=rows.length;
  const cx=Math.round((p.x+.5)*T),base=Math.round((p.y+1)*T-2),bob=name==='exhale'?Math.round(Math.sin(intro.stretch.t*5)*1):0;
  ellipse(cx,base+1,Math.round(w*.4),4,'#2f493640');
  drawSprite(rows,OW.tom.pal,cx-Math.floor(w/2),base-h+bob,1);
  if(name==='full') { const k=(u-.22)/.2; gfx.globalAlpha=Math.max(0,1-Math.abs(k-.5)*2); label('~',cx+22,base-h+16-Math.round(k*10),'#fff1cb',2); label('~',cx-23,base-h+22-Math.round(k*10),'#fff1cb',2); gfx.globalAlpha=1; }
  if(name==='fresh'&&u>=.97) player.hidden=false;
}
function drawStretch(time) {
  if(TOM_STRETCH) return drawStretchPainted(time);
  const u=Math.min(1,intro.stretch.t/1.6),pose=stretchPose(u);
  if(!pose) { player.hidden=false; return; }
  player.hidden=true;
  const p=position(player),f=stretchFrame(pose),w=f.rows[0].length,h=f.rows.length;
  const cx=Math.round((p.x+.5)*T),base=Math.round((p.y+1)*T-2),lift=pose===2?2:0;
  ellipse(cx,base+1,Math.round(w*.45),4,'#2f493640');
  drawSprite(f.rows,OW.tom.pal,cx-Math.floor(w/2),base-h-lift,1);
  if(pose===2) { const k=(u-.26)/.54; gfx.globalAlpha=Math.max(0,1-Math.abs(k-.5)*2); label('~',cx+20,base-h+10-Math.round(k*10),'#fff1cb',2); label('~',cx-21,base-h+16-Math.round(k*10),'#fff1cb',2); gfx.globalAlpha=1; }
}

// ---------- The opening scene ----------
const SHOULDER=28; // px: Rose's feet sit at Tom's shoulders
// The script lives in data/scenes.js (SCENES.opening) and runs on the story engine's scene format (engine/story.js).
function beginOpening() {
  intro.phase='scene';
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

// World-space extras: the shout bubble, hearts, and the squishy over Grace's head.
function drawIntroWorld(time) {
  const {g,r}=IA();
  if(intro.stretch) drawStretch(time);
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
    drawHeart(Math.round(hh.x*T),Math.round(hh.y*T-hh.t*30),1+(hh.t<.3?1:0));
    gfx.globalAlpha=1;
  }
  // The squishy over a girl's head: Grace's dumpling by default; a scene may pass its own {sprite, pal, who:'rose'} (Nine Scoops).
  const sqA=intro.squishy&&intro.squishy.who==='rose'?r:g;
  if(intro.squishy&&sqA&&!sqA.hidden) {
    const p=position(sqA),u=Math.min(1,intro.squishy.t/.35),SQ=intro.squishy.sprite||SQUISHY,SP=intro.squishy.pal||SQUISHY_PAL;
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
    drawSprite(SQ,SP,cx-Math.round(hw*s),cy-Math.round(hh*s)+bob,s);
    sparkles(cx,cy+bob,13*s,time,Math.max(1,Math.round(s/2)));
    if(u>=1) L2.forEach((l,i)=>{ label(l,cx+1,cy+Math.round(hh*s)+14+i*15,'#1b2d27',2); label(l,cx,cy+Math.round(hh*s)+13+i*15,'#ffd968',2); });
  }
}
