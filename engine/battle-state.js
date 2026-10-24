'use strict';
// engine/battle-state.js — Battle state and formation positions.
// ---------- Battle ----------
const bcanvas=$('battle-canvas'),fightCtx=bcanvas.getContext('2d');
fightCtx.imageSmoothingEnabled=false;
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const battle={
  active:false,monster:null,enemy:null,
  state:'idle',queue:[],timer:0,busy:false,
  actor:0,sel:0,mode:'main',
  shakeEnemy:0,flashEnemy:0,enemyLunge:0,enemyStunned:false,
  slash:0,vapor:0,vaporParts:[],enemyGone:false,block:null,
  pops:[],time:0,laser:null,boop:null,fireball:null,tetris:null,texts:[],fx:party.map(()=>({pose:0,poseK:'',shake:0,flash:0,lunge:0,twirl:0,tongue:0,appr:0,apprDur:0,controller:0,cartwheel:0,kick:0,poke:0,combo:0,handspring:0,dismount:0,pogo:0,flop:0,roundoff:0,rebound:0,flip:0,punch:0,cheer:0,tickle:0,run:0,runDur:0,runPasses:1,burpee:0,coach:0,hug:0,grumble:0,hop:0,toss:0,aim:0,cast:0}))
};
// Party positions in 192x108 stage units (drawn at 3x).
const BATTLE_POS1=[{x:150,base:90}];
const BATTLE_POS2=[{x:140,base:84},{x:162,base:97}];
const BATTLE_POS3=[{x:133,base:82},{x:154,base:93},{x:172,base:103}];
const BATTLE_POS4=[{x:124,base:77},{x:142,base:87},{x:158,base:96},{x:173,base:105}];
const BATTLE_POS=BATTLE_POS3.slice();

// Detailed battle sprites, drawn pixel by pixel. '.' is transparent.
