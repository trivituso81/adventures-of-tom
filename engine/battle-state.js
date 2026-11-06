'use strict';
// engine/battle-state.js — Battle state and formation positions.
// ---------- Battle ----------
const bcanvas=$('battle-canvas'),fightCtx=bcanvas.getContext('2d');
fightCtx.imageSmoothingEnabled=false;
// All drawing code uses the 576 x 324 game coordinates; BS maps them to the canvas's own pixels.
// sharp1 (2026-11-05): the canvas used to be a fixed 1152 x 648, which the browser then stretched to the size on screen (a little in
// portrait, about 1.5x in landscape and on an iPad), blurring the whole fight. battleFit gives the canvas exactly as many pixels as
// the screen shows (never fewer than 1152 or more than 1920 wide), so nothing is stretched afterwards. Called from drawBattle.
let BS=bcanvas.width/576;
fightCtx.setTransform(BS,0,0,BS,0,0);
function battleFit() {
  const now=performance.now(); if(now-(battleFit.at||0)<400) return; battleFit.at=now;
  const r=bcanvas.getBoundingClientRect(),long=Math.max(r.width,r.height)*(window.devicePixelRatio||1);   // the long side: the forced-landscape layout turns the stage a quarter turn
  if(!(long>8)) return;
  const w=Math.min(1920,Math.max(1152,Math.round(long)));
  if(Math.abs(bcanvas.width-w)<2) return;
  bcanvas.width=w; bcanvas.height=Math.round(w*324/576); BS=w/576;
  fightCtx.imageSmoothingEnabled=false; fightCtx.setTransform(BS,0,0,BS,0,0);
}
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const battle={
  active:false,monster:null,enemy:null,
  state:'idle',queue:[],timer:0,busy:false,
  actor:0,sel:0,mode:'main',
  shakeEnemy:0,flashEnemy:0,enemyLunge:0,enemyStunned:false,
  slash:0,vapor:0,vaporParts:[],enemyGone:false,block:null,
  pops:[],time:0,laser:null,boop:null,fireball:null,tetris:null,texts:[],fx:party.map(()=>({pose:0,poseK:'',shake:0,flash:0,lunge:0,twirl:0,tongue:0,appr:0,apprDur:0,controller:0,cartwheel:0,kick:0,poke:0,combo:0,handspring:0,dismount:0,p10:0,pogo:0,flop:0,roundoff:0,rebound:0,flip:0,punch:0,cheer:0,tickle:0,run:0,runDur:0,runPasses:1,burpee:0,coach:0,hug:0,grumble:0,hop:0,toss:0,aim:0,cast:0}))
};
// Party positions in 192x108 stage units (drawn at 3x).
const BATTLE_POS1=[{x:150,base:90}];
const BATTLE_POS2=[{x:140,base:84},{x:162,base:97}];
const BATTLE_POS3=[{x:142,base:84},{x:157,base:94},{x:172,base:104}];
const BATTLE_POS4=[{x:139,base:80},{x:150,base:89},{x:161,base:98},{x:172,base:106}];
const BATTLE_POS=BATTLE_POS3.slice();

// Detailed battle sprites, drawn pixel by pixel. '.' is transparent.
