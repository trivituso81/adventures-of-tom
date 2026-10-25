'use strict';
// engine/splash.js — Launch screen before the title card: a dusk sky over the hills (no village),
// the whole cast lined up for a group photo, and a choice of PART 1, PART 2, DEMO and BATTLE LAB.
// DEMO opens the frozen demo build in demo/ (same tab). PART 1 swaps the panel to START NEW / LOAD / BACK; PART 2 is locked
// (dashed, shakes) until Part 1 clear data exists, then lists the clear data to continue from. Picking fades into the town.
// Fun bits: a "wave" of hops left to right with a STARRING caption, Rose bouncing on Tom's shoulders,
// Tom tossing Nara's tennis ball and Nara fetching it, hearts between Tom and TNB, fireflies, stars.
const splash={active:false,t:0,sel:0,c:null,g:null,stars:[],flies:[],hearts:[],name:'',nameT:0,cycle:0,
  nara:{state:'idle',x:0,dir:1,t:0,ball:null,carry:false},shakeT:0};

// Cast, in wave order (left to right). row: 0 front, 1 back. fx: fraction of the stage width.
const SPLASH_CAST=[
  {id:'deedee',name:'DEEDEE',row:1,fx:.13},
  {id:'grace',name:'GRACE',row:0,fx:.2},
  {id:'boppy',name:'BOPPY',row:1,fx:.37},
  {id:'tom',name:'TOM',row:0,fx:.5},
  {id:'rose',name:'ROSE',row:0,fx:.5,rider:true},
  {id:'tnb',name:'TNB',row:1,fx:.63},
  {id:'nara',name:'NARA',row:0,fx:.81},
  {id:'amy',name:'AMY',row:1,fx:.87}
];
const SPLASH_HOP=.42,SPLASH_STEP=.3;
let FULL_GAME_OPEN=true;   // opened in C1 (2026-10-20): chapter 1 is playable

function startSplash() {
  const el=$('splash');
  if(!el) { startTitle(); return; }
  splash.active=true; splash.t=0; splash.sel=0; splash.cycle=0;
  splash.c=$('splash-art'); splash.g=splash.c.getContext('2d');
  for(const m of SPLASH_CAST) m.hopT=-1;
  // Fixed star field and fireflies (positions are fractions, so they survive a rotate).
  let seed=7; const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
  splash.stars=[]; for(let i=0;i<70;i++) splash.stars.push({x:rnd(),y:rnd(),p:rnd()*6.28,big:rnd()<.15});
  splash.flies=[]; for(let i=0;i<9;i++) splash.flies.push({x:rnd(),y:rnd(),p:rnd()*6.28,s:.4+rnd()*.5});
  el.hidden=false; el.classList.remove('out');
  splashMark();
  splashSetMode('launch');
  if(!splash.wired) {
    splash.wired=true;
    const box=el.querySelector('.sp-choices');
    box.addEventListener('click',e=>{ const b=e.target.closest('.sp-choice'); if(!b) return; unlockAudio(); splashPick(Number(b.dataset.i)); });
    box.addEventListener('pointerover',e=>{ const b=e.target.closest('.sp-choice'); if(b&&splash.active&&splash.sel!==Number(b.dataset.i)) { splash.sel=Number(b.dataset.i); splashMark(); } });
    const rot=$('splash-rotate'); if(rot) rot.addEventListener('click',()=>{ unlockAudio(); toggleLayout(); });
  }
  splash.last=performance.now();
  requestAnimationFrame(splashFrame);
}

// Panel modes. launch: PART 1 / PART 2 / DEMO / BATTLE LAB (2x2). start (PART 1): START NEW / LOAD / BACK.
// part2 (PART 2): one choice per Part 1 clear data, LOAD, BACK. The game is one story in two Parts (engine/story.js PARTS):
// Part 2 stays locked until this device has Part 1 clear data, and starts from it with everything carried over.
const SPLASH_MODES={
  launch:{tab:'Choose how to play',cue:'Tap one, or use the arrows and A / Enter',choices:()=>{
    const clr=partClearSlots().length;
    return [
      FULL_GAME_OPEN?{name:'PART 1',sub:'Chapters 1 to 10. Start here.'}:{name:'PART 1',sub:'Coming soon. Still being built.',cls:'locked'},
      clr?{name:'PART 2',sub:'Chapters 11 to 20. Continue from your Part 1 clear data.'}:{name:'PART 2',sub:'Chapters 11 to 20. Finish Part 1 to unlock.',cls:'locked'},
      {name:'DEMO',sub:'The original Long Island and Los Angeles.'},
      {name:'BATTLE LAB',sub:'Try every move and Tombo.'}]; }},
  part2:{tab:'Part 2',cue:'Pick the clear data to continue from. B / Esc to go back',choices:()=>[
    ...partClearSlots().map((s,i)=>({name:'CLEAR DATA '+(i+1),sub:partClearSummary(readSave(s)),slot:s})),
    {name:'LOAD',sub:'Continue a Part 2 save.'},
    {name:'BACK',sub:'',cls:'back'}]},
  // Test fights for the new battle (engine/battle2.js, B2_LAB in data/battle2-data.js). Remove when the full game opens.
  lab:{tab:'Battle Lab',cue:'A / Enter to fight. B / Esc to go back',choices:()=>[...B2_LAB.map(L=>({name:L.name,sub:L.sub})),{name:'BACK',sub:'',cls:'back'}]},
  start:{tab:'Part 1',cue:'A / Enter to pick. B / Esc to go back',choices:()=>{
    const n=SAVE_SLOTS.filter(k=>readSave(k)).length;
    return [{name:'START NEW',sub:'Begin with the opening scene.'},
      {name:'LOAD',sub:n?(n===1?'1 saved game.':n+' saved games.'):'No saved games yet.'},
      {name:'BACK',sub:'',cls:'back'}]; }}
};
function splashSetMode(mode) {
  splash.mode=mode; splash.sel=0;
  const M=SPLASH_MODES[mode],el=$('splash');
  el.querySelector('.sp-tab').textContent=M.tab;
  $('sp-cue').textContent=M.cue;
  const list=M.choices(); splash.list=list; el.querySelector('.sp-choices').classList.toggle('grid',list.length>3);
  el.querySelector('.sp-choices').innerHTML=list.map((c,i)=>
    '<button class="sp-choice'+(c.cls?' '+c.cls:'')+'" data-i="'+i+'" type="button"'+(c.cls==='locked'?' aria-disabled="true"':'')+'><span class="sp-name">'+c.name+'</span>'+(c.sub?'<span class="sp-sub">'+c.sub+'</span>':'')+'</button>').join('');
  splashMark();
}
function splashMark() {
  document.querySelectorAll('#splash .sp-choice').forEach(b=>b.classList.toggle('sel',Number(b.dataset.i)===splash.sel));
}
// In the 2x2 grid, up and down move a whole row (dir is the pressed direction; d is -1 or 1).
function splashMove(d,dir) {
  const n=document.querySelectorAll('#splash .sp-choice').length||2;
  const grid=document.querySelector('#splash .sp-choices.grid')&&n===4&&(dir==='up'||dir==='down');
  splash.sel=(splash.sel+d*(grid?2:1)+n)%n; sfx.move(); splashMark();
}
function splashPick(i) {
  if(!splash.active) return;
  splash.sel=i; splashMark();
  if(splash.mode==='start') {
    if(i===2) { splashBack(); return; }
    sfx.select(); splash.ret='start'; splashLeave(i===0?confirmNew:loadMenu);
    return;
  }
  if(splash.mode==='part2') {
    const c=(splash.list||[])[i]; if(!c) return;
    if(c.cls==='back') { splashBack(); return; }
    sfx.select(); splash.ret='part2'; splashLeave(c.slot?()=>confirmPart2(c.slot):loadMenu);
    return;
  }
  if(splash.mode==='lab') {
    if(i>=B2_LAB.length) { splashBack(); return; }
    sfx.select(); unlockAudio(); splash.active=false;
    const el=$('splash'); el.classList.add('out');
    setTimeout(()=>{ if(!splash.active) el.hidden=true; },450);
    b2Lab(i);
    return;
  }
  if(i===2) { openDemo(); return; }
  if(i===3) { sfx.select(); splashSetMode('lab'); return; }
  const locked=i===0?!FULL_GAME_OPEN:!partClearSlots().length;
  if(locked) {
    sfx.nope(); splash.shakeT=.4;
    const b=document.querySelector('#splash .sp-choice[data-i="'+i+'"]');
    if(b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
    $('sp-cue').textContent=i===0?'Part 1 is still being built. Try the Demo!':'Finish Part 1 to unlock Part 2.';
    return;
  }
  sfx.select(); splashSetMode(i===0?'start':'part2');
}
// The demo is its own frozen copy of the game in demo/, with its own saves (the le-save-* keys).
function openDemo() {
  sfx.select(); splash.active=false;
  $('splash').classList.add('out');
  setTimeout(()=>{ location.href=new URL('demo/index.html',location.href).href; },250);
}
function splashBack() { if(splash.mode==='start'||splash.mode==='lab'||splash.mode==='part2') { sfx.move(); splashSetMode('launch'); } }
// After a Battle Lab fight: back to the title screen on the lab list.
function splashToLab() {
  const el=$('splash'); if(!el) return;
  el.hidden=false; el.classList.remove('out');
  splash.active=true; splashSetMode('lab');
  splash.last=performance.now(); requestAnimationFrame(splashFrame);
}
// Fade the title screen out over the town and run next (confirmNew or loadMenu) there.
function splashLeave(next) {
  splash.active=false;
  const el=$('splash'); el.classList.add('out');
  startTitle(next);
  setTimeout(()=>{ if(!splash.active) el.hidden=true; },450);
}
// BACK from the load list or the new-game warning: return to the title screen.
function splashReturn() {
  const el=$('splash'); if(!el) return false;
  el.hidden=false; el.classList.remove('out');
  splash.active=true; splashSetMode(splash.ret==='part2'&&partClearSlots().length?'part2':'start');
  splash.last=performance.now(); requestAnimationFrame(splashFrame);
  return true;
}
// Gamepad: called from pollGamepad while the splash is up.
function splashPad(dir,dirEdge,A,B) {
  if(!splash.active) return;
  if(dirEdge&&dir) splashMove(dir==='up'||dir==='left'?-1:1,dir);
  if(A) splashPick(splash.sel);
  else if(B) splashBack();
}
window.addEventListener('keydown',e=>{
  if(!splash.active) return;
  if(e.code==='KeyL') return; // rotate still works
  e.stopImmediatePropagation();
  unlockAudio();
  if(e.repeat) return;
  const c=e.code;
  if(c==='ArrowUp'||c==='KeyW') { e.preventDefault(); splashMove(-1,'up'); }
  else if(c==='ArrowLeft'||c==='KeyA') { e.preventDefault(); splashMove(-1,'left'); }
  else if(c==='ArrowDown'||c==='KeyS') { e.preventDefault(); splashMove(1,'down'); }
  else if(c==='ArrowRight'||c==='KeyD') { e.preventDefault(); splashMove(1,'right'); }
  else if(c==='Enter'||c==='Space') { e.preventDefault(); splashPick(splash.sel); }
  else if(c==='Escape'||c==='Backspace') { e.preventDefault(); splashBack(); }
},true);

// ---------- Animation ----------
function splashUpdate(dt) {
  splash.t+=dt;
  // Cycle: the wave (one hop per cast member), a pause, Tom throws the ball and Nara fetches, a pause.
  const waveLen=SPLASH_CAST.length*SPLASH_STEP+SPLASH_HOP;
  const ct=(splash.cycle+=dt);
  if(ct<waveLen) {
    SPLASH_CAST.forEach((m,i)=>{
      const st=i*SPLASH_STEP;
      if(ct>=st&&m.hopT<0&&ct<st+dt+.01) {
        if(m.id==='nara'&&splash.nara.state!=='idle') return;
        m.hopT=0; splash.name=m.name; splash.nameT=0;
        tone({type:'square',f0:500+i*70,f1:700+i*90,dur:.07,vol:.05});
        if(m.id==='tom') splashHearts();
      }
    });
  } else if(ct>waveLen+1.2&&splash.nara.state==='idle'&&!splash.nara.done) {
    splashThrow(); splash.nara.done=true;
  }
  if(ct>waveLen+1.2&&splash.nara.done&&splash.nara.state==='idle'&&ct>waveLen+3) { splash.cycle=0; splash.nara.done=false; }
  for(const m of SPLASH_CAST) if(m.hopT>=0) { m.hopT+=dt; if(m.hopT>=SPLASH_HOP) m.hopT=-1; }
  splash.nameT+=dt;
  // Nara: chase the ball off the right edge, come back around from the left carrying it.
  const n=splash.nara,speed=splashW()*.55;
  n.t+=dt;
  if(n.ball) {
    const b=n.ball; b.t+=dt;
    if(!b.done) {
      const u=Math.min(1,b.t/b.dur);
      b.x=b.x0+(b.x1-b.x0)*u; b.y=b.y0+(b.y1-b.y0)*u-Math.sin(Math.PI*u)*b.arc;
      if(u>=1) { b.done=true; b.vy=-b.arc*1.2; b.vx=(b.x1-b.x0)/b.dur*.6; }
    } else { b.vy+=splashW()*2.4*dt; b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y>b.y1) { b.y=b.y1; b.vy*=-.5; } }
  }
  if(n.state==='wait'&&n.t>.35) { n.state='out'; n.dir=1; }
  if(n.state==='out') { n.x+=speed*dt; if(n.x>splashW()*.7) { n.state='back'; n.x=-(splash.L?splash.L.naraHome+splash.L.S*30:splashW()); n.ball=null; n.carry=true; n.dir=1; } }
  if(n.state==='back') { n.x+=speed*.8*dt; if(n.x>=0) { n.x=0; n.state='idle'; n.carry=false; n.dir=0; splash.name='NARA'; splash.nameT=0; tone({type:'sine',f0:900,f1:1300,dur:.1,vol:.06}); tone({type:'sine',f0:1300,f1:900,dur:.1,vol:.05,delay:.12}); } }
  for(const h of splash.hearts) h.t+=dt;
  splash.hearts=splash.hearts.filter(h=>h.t<1.6);
  if(splash.shakeT>0) splash.shakeT-=dt;
}
function splashThrow() {
  const L=splash.L,n=splash.nara; if(!L) return;
  const tom=L.pos.tom;
  n.ball={x0:tom.x+L.S*8,y0:tom.y-L.S*30,x1:splashW()*1.1,y1:L.frontFy-L.S*2,arc:L.S*60,dur:1.1,t:0,x:0,y:0};
  n.state='wait'; n.t=0; splash.name='NARA'; splash.nameT=0;
  sfx.whoosh&&sfx.whoosh();
}
function splashHearts() {
  for(let k=0;k<3;k++) splash.hearts.push({t:-k*.18,dx:(k-1)*.3});
}
const splashW=()=>splash.c?splash.c.width:390;

// ---------- Drawing ----------
function splashFrame(now) {
  const el=$('splash');
  if(!el||el.hidden) return;
  const dt=Math.min(.05,Math.max(0,(now-splash.last)/1000)); splash.last=now;
  splashUpdate(dt);
  splashDraw();
  requestAnimationFrame(splashFrame);
}

function splashDraw() {
  const c=splash.c,box=$('splash'),panel=$('splash-panel');
  const w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight);
  if(c.width!==w||c.height!==h) { c.width=w; c.height=h; }
  const prev=gfx; gfx=splash.g; gfx.imageSmoothingEnabled=false;
  try { splashScene(w,h,panel?panel.offsetHeight:0,splash.t); } finally { gfx=prev; }
}

function splashScene(W,H,panelH,time) {
  const land=W>H;
  const top=land?10:Math.max(24,H*.05);
  const bottom=H-panelH;
  // Pixel size: as big as the space allows (sprites are about 46 rows tall; two rows plus Rose need ~150 rows).
  const P=land?logoUnit(W*.44,(bottom-top)*.66):logoUnit(W*.88,(H-panelH)*.3),logoH=Math.round(P*16.6);
  const ty=Math.round(land?top+Math.max(4,(bottom-top-logoH-44)*.35):top+8),capY=ty+logoH+(land?12:16),capEnd=capY+(land?28:36);
  // Landscape: title on the left, cast on the right. Portrait: title above the cast.
  const S=land?Math.max(1,Math.min(3,Math.floor(Math.min(W*.55/128,(bottom-top-16)/95)))):Math.max(1,Math.min(4,Math.floor(Math.min(W/128,(bottom-capEnd-8)/95))));
  const tx=land?Math.round(W*.27):W/2,castC=land?W*.66:W/2;
  const span=Math.min(land?W*.6:W,S*150),X=fx=>Math.round(castC+(fx-.5)*span);
  // Sky: stepped dusk bands, dark at the top, warm at the horizon.
  const horizon=bottom-S*70;
  const bands=['#17233a','#1d2c46','#253553','#33405f','#4a4a6a','#664f6e','#86566f','#a8606f','#c66f70','#df8a74','#eda57c','#f4c088'];
  for(let i=0;i<bands.length;i++) {
    const y0=Math.round(horizon*(Math.pow(i/bands.length,.8))),y1=Math.round(horizon*Math.pow((i+1)/bands.length,.8))+1;
    rect(0,y0,W,y1-y0,bands[i]);
  }
  rect(0,horizon,W,H-horizon,'#f4c088');
  // Stars (upper sky only), twinkling.
  for(const s of splash.stars) {
    const y=s.y*horizon*.62; if(y<2) continue;
    const a=.35+.65*Math.max(0,Math.sin(time*1.6+s.p));
    gfx.globalAlpha=a*(1-y/(horizon*.7));
    const x=Math.round(s.x*W);
    if(s.big) { rect(x-1,y,3,1,'#fff6dc'); rect(x,y-1,1,3,'#fff6dc'); } else rect(x,y,1,1,'#fff6dc');
  }
  gfx.globalAlpha=1;
  // Moon, low and to the left.
  const mr=Math.round(S*11),mx=Math.round(W*(land?.8:.14)),my=Math.round(land?horizon*.3:Math.min(horizon*.75,(capY+capEnd)/2+S*4));
  gfx.globalAlpha=.25; ellipse(mx,my,mr+S*5,mr+S*5,'#ffe9b8'); gfx.globalAlpha=1;
  ellipse(mx,my,mr,mr,'#fff1cb'); ellipse(mx+S*3,my-S*2,Math.round(mr*.3),Math.round(mr*.3),'#f2deb0'); ellipse(mx-S*4,my+S*3,Math.round(mr*.22),Math.round(mr*.22),'#f2deb0');
  // Hills: far, middle (the back row stands on it), front lawn (the front row).
  const frontFy=bottom-S*10,backFy=frontFy-S*30;
  const hill=(baseY,amp,freq,ph,col,lit)=>{
    const step=Math.max(2,S*2);
    for(let x=0;x<W;x+=step) {
      const y=Math.round(baseY+Math.sin(x/W*Math.PI*freq+ph)*amp+Math.sin(x/W*Math.PI*freq*2.3+ph*2)*amp*.35);
      rect(x,y,step,H-y,col); if(lit) rect(x,y,step,Math.max(1,S),lit);
    }
  };
  hill(horizon-S*8,S*9,2.2,.6,'#6f6a86',null);
  hill(horizon+S*2,S*7,3,2.1,'#4f6f63','#6a8a70');
  hill(backFy-S*2,S*3,1.6,1.2,'#5d8856','#79a066');
  hill(frontFy-S*8,S*2,1.2,3.5,'#78a35f','#97bd76');
  // Lawn details: tufts and flowers.
  for(let i=0;i<26;i++) {
    const x=Math.round(((i*97)%100)/100*W),y=Math.round(frontFy-S*4+((i*53)%9)*S*1.3);
    if(y>bottom) continue;
    if(i%3===0) { rect(x,y,S,S,i%2?'#f6d7e3':'#fff1cb'); rect(x-S,y+S,S,S,'#e6a1b8'); }
    else { rect(x,y,S,S*2,'#5f8a4d'); rect(x+S,y-S,S,S*3,'#5f8a4d'); }
  }
  // Title logo.
  drawGameLogo(tx,ty,P,time,splash.name==='TOM'&&splash.nameT<.35);
  // STARRING caption.
  if(splash.name) {
    const u=Math.min(1,splash.nameT/.15),pop=u<1?1+(1-u)*.6:1;
    label('STARRING',tx,capY,'#f3d9a6',2);
    const ns=Math.max(2,Math.round(3*pop));
    label(splash.name,tx+1,capY+17,'#1b2d27',ns); label(splash.name,tx,capY+16,'#fff1cb',ns);
  }
  // Fireflies over the lawn.
  for(const f of splash.flies) {
    const x=Math.round(f.x*W+Math.sin(time*f.s+f.p)*S*10),y=Math.round(backFy-S*30+f.y*S*40+Math.cos(time*f.s*1.3+f.p)*S*6);
    const a=Math.max(0,Math.sin(time*2*f.s+f.p)); if(a<.1) continue;
    gfx.globalAlpha=a*.35; rect(x-S,y-S,S*3,S*3,'#fff2a0'); gfx.globalAlpha=a; rect(x,y,S,S,'#fffbd0');
  }
  gfx.globalAlpha=1;
  // Cast. Back row first, then the front row; Rose rides behind Tom's head.
  const L=splash.L={S,frontFy,backFy,pos:{}};
  const hopY=m=>m.hopT>=0?Math.round(Math.sin(Math.PI*m.hopT/SPLASH_HOP)*S*12):0;
  const by=id=>SPLASH_CAST.find(m=>m.id===id);
  const drawOne=(set,frame,cx,feet,lift,flip)=>{
    const fr=flip?set.left[frame]:(flip===false?set.side[frame]:set.down[frame]);
    const fw=fr[0].length,fh=fr.length;
    drawSprite(fr,set.pal,Math.round(cx-fw*S/2),Math.round(feet-fh*S-lift),S);
    return fh*S;
  };
  const shadow=(cx,feet,fw,lift)=>{ gfx.globalAlpha=Math.max(.15,.35-lift/(S*60)); ellipse(cx,feet+S,Math.round(fw*S*.42*(1-lift/(S*40))),Math.max(2,S*2),'#203b32'); gfx.globalAlpha=1; };
  const breath=k=>Math.floor((time*1.6+k)%2); // idle bob: up one pixel every other beat
  for(const m of SPLASH_CAST.filter(m=>m.row===1)) {
    const set=OW[m.id],cx=X(m.fx),lift=hopY(m)+breath(m.fx*5)*S*0;
    shadow(cx,backFy,set.down[0][0].length,lift);
    drawOne(set,m.hopT>=0?1:0,cx,backFy,lift);
    L.pos[m.id]={x:cx,y:backFy};
  }
  // Hearts between Tom and TNB.
  // Front row.
  const tom=by('tom'),rose=by('rose'),grace=by('grace'),naraM=by('nara');
  {
    const set=OW.grace,cx=X(grace.fx),lift=hopY(grace);
    shadow(cx,frontFy,set.down[0][0].length,lift); drawOne(set,grace.hopT>=0?2:0,cx,frontFy,lift);
  }
  {
    const cx=X(tom.fx),lift=hopY(tom);
    shadow(cx,frontFy,OW.tom.down[0][0].length,lift);
    // Rose sits on Tom's shoulders (engine/rose-ride.js); she bounces on her own turn and a little all the time.
    const tf=OW.tom.down[tom.hopT>=0?2:0],top=frontFy-tf.length*S-lift,rb=hopY(rose)+(Math.floor(time*3)%2)*S;
    roseRide('ow_down','back',cx,top-rb,S);
    drawOne(OW.tom,tom.hopT>=0?2:0,cx,frontFy,lift);
    roseRide('ow_down','front',cx,top-Math.min(rb,S),S);
    L.pos.tom={x:cx,y:frontFy-lift};
  }
  // Nara: idle at her spot, or running for the ball.
  {
    const n=splash.nara,home=X(naraM.fx),cx=home+Math.round(n.x),lift=n.state==='idle'?hopY(naraM):Math.abs(Math.round(Math.sin(time*18)*S*2));
    L.naraHome=home; const set=OW.nara,run=n.state==='out'||n.state==='back';
    const frame=run?1+Math.floor(time*10)%2:(naraM.hopT>=0?1:0);
    shadow(cx,frontFy,run?set.side[0][0].length:set.down[0][0].length,lift);
    drawOne(set,frame,cx,frontFy,lift,run?false:undefined);
    if(n.carry) { // ball in her mouth (she faces right)
      const bx=cx+Math.round(set.side[0][0].length*S*.42),bY=frontFy-Math.round(set.side[0].length*S*.55)-lift;
      splashBall(bx,bY,S);
    }
    if(n.state==='idle'&&!run&&Math.floor(time*1.2)%5===0) { // wag: a tiny excited hop now and then
      const k=(time*1.2)%1; if(k<.3) label('!',cx+S*12,frontFy-set.down[0].length*S-S*8,'#fff1cb',S);
    }
  }
  if(splash.nara.ball) splashBall(splash.nara.ball.x,splash.nara.ball.y,S);
  // Hearts float up between Tom and TNB.
  const tnb=L.pos.tnb,tp=L.pos.tom;
  if(tnb&&tp) for(const hrt of splash.hearts) {
    if(hrt.t<0) continue;
    const u=hrt.t/1.6,x=Math.round((tp.x+tnb.x)/2+hrt.dx*S*20+Math.sin(hrt.t*6)*S*2),y=Math.round(backFy-S*50-u*S*30);
    gfx.globalAlpha=1-u; drawHeart(x,y,Math.max(1,S)); gfx.globalAlpha=1;
  }
}
function splashBall(x,y,S) {
  const r=Math.max(2,Math.round(S*2.5));
  ellipse(x,y,r+1,r+1,'#2b2a26'); ellipse(x,y,r,r,'#c8e04a'); rect(x-r+1,y-1,r*2-2,Math.max(1,Math.round(S/2)),'#f4fbd0');
}

// ---------- Game logo: THE ADVENTURES OF / TOM ----------
// Shared by the launch screen and the title card. Big chunky serif letters in the style of SNES JRPG logos:
// gold gradient faces, a bevel, a dark 3D extrude and outline, a light sweep, slow gold rays behind,
// a red ribbon with THE ADVENTURES OF, and a little heart (the family) beating inside the O.
const LOGO_GLYPHS={
  T:['###########','###########','##.#####.##','...#####...','...#####...','...#####...','...#####...','...#####...','...#####...','..#######..','..#######..'],
  O:['...#####...','.#########.','####...####','###.....###','###.....###','###.....###','###.....###','###.....###','####...####','.#########.','...#####...'],
  M:['####.....####','#####...#####','######.######','###.#####.###','###..###..###','###...#...###','###.......###','###.......###','###.......###','###.......###','#####...#####']
};
const LOGO_FACE=['#fffbe2','#fff1ad','#ffe581','#ffd85d','#ffcb48','#f9b83e','#f1a436','#e98f2f','#df7c29','#d36d26','#c55f22'];
const LOGO_HEART=['.##.##.','#######','#######','.#####.','..###..','...#...'];
let logoMask=null;
function buildLogoMask() {
  const word='TOM',gap=2,cells=[];let x0=0,heart=null;
  for(const ch of word) {
    const g=LOGO_GLYPHS[ch];
    g.forEach((row,y)=>{ for(let x=0;x<row.length;x++) if(row[x]==='#') cells.push([x0+x,y]); });
    if(ch==='O') heart={x:x0+5.5,y:5.4};
    x0+=g[0].length+gap;
  }
  const w=x0-gap,set=new Set(cells.map(c=>c[0]+','+c[1]));
  logoMask={cells,w,h:11,set,heart};
}
// Size helper: the unit size that makes the logo fit a width.
function logoUnit(maxW,maxH) { if(!logoMask) buildLogoMask(); return Math.max(2,Math.min(14,Math.floor(Math.min(maxW/(logoMask.w+2),maxH?maxH/16:99)))); }
// Draws the logo centered on cx with its top at y. P is the unit size. Returns the total height.
function drawGameLogo(cx,y,P,time,beat) {
  if(!logoMask) buildLogoMask();
  const M=logoMask,o=Math.max(2,Math.round(P/2)),depth=Math.max(2,Math.round(P*.7));
  // Ribbon with THE ADVENTURES OF.
  const r=Math.max(2,Math.round(P*.38)),txt='THE ADVENTURES OF',tw=(txt.length*4-1)*r,padX=r*4,rh=r*5+r*4;
  const rw=tw+padX*2,rx=Math.round(cx-rw/2),ry=Math.round(y);
  const tail=r*4,fold=r*2;
  // Tails (behind), then the band.
  for(const side of [-1,1]) {
    const tx=side<0?rx-tail+fold:rx+rw-fold,ty=ry+fold;
    // Swallowtail end: a V notch cut into the outer edge.
    const tailRows=(pad,col)=>{ for(let k=-pad;k<rh+pad;k++) { const n=Math.round(r*2.2*(1-Math.min(1,Math.abs(k-rh/2)/(rh/2))));
      if(side<0) rect(tx+n-pad,ty+k,tail-n+pad*2,1,col); else rect(tx-pad,ty+k,tail-n+pad*2,1,col); } };
    tailRows(Math.round(o/2),'#2a1408'); tailRows(0,'#8e2a2f');
    // Fold shadow where the band turns under.
    rect(side<0?tx+tail-fold:tx,ty+rh-fold,fold,fold,'#5e1a20');
  }
  rect(rx-o,ry-o,rw+o*2,rh+o*2,'#2a1408');
  rect(rx,ry,rw,rh,'#c8414a');
  rect(rx,ry,rw,Math.max(1,Math.round(r*.7)),'#ec7a74');
  rect(rx,ry+rh-r,rw,r,'#a3333c');
  label(txt,cx+Math.max(1,Math.round(r/2)),ry+r*2+Math.max(1,Math.round(r/2)),'#5e1a20',r);
  label(txt,cx,ry+r*2,'#fff1cb',r);
  // TOM.
  const top=ry+rh+o*2+Math.round(P*.6),lx=Math.round(cx-M.w*P/2),W2=M.w*P,H2=M.h*P;
  // Rays and a soft glow behind the letters.
  const gx=cx,gy=top+H2/2;
  gfx.save();
  gfx.globalAlpha=.13; gfx.fillStyle='#ffe08a';
  gfx.translate(gx,gy); gfx.rotate(time*.15);
  for(let k=0;k<12;k++) { gfx.rotate(Math.PI/6); gfx.beginPath(); gfx.moveTo(0,0); gfx.lineTo(-P*2,-W2*.5); gfx.lineTo(P*2,-W2*.5); gfx.fill(); }
  gfx.restore();
  gfx.globalAlpha=.18; ellipse(gx,gy,Math.round(W2*.5),Math.round(H2*.85),'#ffd27a'); gfx.globalAlpha=1;
  const at=(x,yy)=>M.set.has(x+','+yy);
  // Drop shadow, outline and extrude (one dark block per cell), then the extrude colour.
  gfx.globalAlpha=.35;
  for(const [x,yy] of M.cells) rect(lx+x*P-o+Math.round(P*.5),top+yy*P-o+Math.round(P*.6),P+o*2,P+o*2+depth,'#0c1222');
  gfx.globalAlpha=1;
  for(const [x,yy] of M.cells) rect(lx+x*P-o,top+yy*P-o,P+o*2,P+o*2+depth,'#2a1408');
  for(const [x,yy] of M.cells) { rect(lx+x*P,top+yy*P+P,P,depth,'#8a3a17'); rect(lx+x*P,top+yy*P+P+depth-Math.max(1,Math.round(depth/3)),P,Math.max(1,Math.round(depth/3)),'#5e2410'); }
  // Faces with a gradient and a bevel.
  const b=Math.max(1,Math.round(P/4));
  for(const [x,yy] of M.cells) {
    const px=lx+x*P,py=top+yy*P;
    rect(px,py,P,P,LOGO_FACE[yy]);
    if(!at(x,yy-1)) rect(px,py,P,b,'#ffffff');
    if(!at(x-1,yy)) rect(px,py,b,P,'#fff6cf');
    if(!at(x+1,yy)) rect(px+P-b,py,b,P,'#c86a26');
    if(!at(x,yy+1)) rect(px,py+P-b,P,b,'#a8521f');
  }
  // Light sweep: a diagonal shine crosses the word every few seconds.
  const cyc=(time%4.5)/1.1;
  if(cyc<1) {
    const s=-H2+cyc*(W2+H2*2),bw=P*2.5;
    gfx.globalAlpha=.55;
    for(const [x,yy] of M.cells) {
      const d=x*P+P/2-(s+(M.h-yy)*P*.55);
      if(d>0&&d<bw) rect(lx+x*P,top+yy*P,P,P,'#ffffff');
    }
    gfx.globalAlpha=1;
  }
  // The heart in the O. It beats, and jumps when Tom hops.
  if(M.heart) {
    const hp=Math.max(1,Math.round(P*.62)),pulse=(time%1.4)<.12||((time%1.4)>.24&&(time%1.4)<.34),jump=beat?Math.round(P*.8):0;
    const hx=Math.round(lx+M.heart.x*P-3.5*hp),hy=Math.round(top+M.heart.y*P-3*hp)-jump;
    const ol=Math.max(1,Math.round(hp/2));
    LOGO_HEART.forEach((row,yy)=>{ for(let x=0;x<7;x++) if(row[x]==='#') rect(hx+x*hp-ol,hy+yy*hp-ol,hp+ol*2,hp+ol*2,'#2a1408'); });
    LOGO_HEART.forEach((row,yy)=>{ for(let x=0;x<7;x++) if(row[x]==='#') rect(hx+x*hp,hy+yy*hp,hp,hp,pulse?'#ff6b84':'#e8475f'); });
    rect(hx+hp,hy+hp,hp,hp,'#ffd0d8');
  }
  // Twinkles on the letters.
  for(let k=0;k<3;k++) {
    const ph=(time*.7+k*.33)%1; if(ph>.3) continue;
    const c=M.cells[(k*37+Math.floor(time*.7+k*.33)*53)%M.cells.length];
    const sx=lx+c[0]*P+P/2,sy=top+c[1]*P+P/2,s=Math.round(P*(1-Math.abs(ph-.15)/.15)*1.2);
    rect(sx-s,sy,s*2+1,1+Math.floor(P/5),'#ffffff'); rect(sx,sy-s,1+Math.floor(P/5),s*2+1,'#ffffff');
  }
  return top+H2+depth+o-y;
}
