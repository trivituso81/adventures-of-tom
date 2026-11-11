// Boss endings, step 1 (bossend1, Tom 2026-11-11): after a win a boss stays on the map through its after scene and leaves in a short
// finale built from its existing painted frames; a {finale:'<monster id>'} scene step plays it. Step 2 (art): one ending sheet per boss.
// Kinds: sink (goes down into ground or water), leap (arcs, then sinks), roll (spins away), hop (hops away), walk, drive (speeds off),
// settle (stays; gold light and motes). Leaving kinds end with monsterFall(n,true); settle bosses stay on the map.
// Safety net: a boss left standing with no after scene is moved off the map a few seconds after the battle (bossTick), and at the
// end of any after scene (bossSceneEnd), so a boss never stays behind by accident.
const BOSS_FINALE={
  bigone:{kind:'sink',dust:'#bfe6f2',rings:true},
  bigshake:{kind:'sink',dust:'#c9a77a'},
  irongill:{kind:'leap',dx:1.6,dust:'#bfe6f2',rings:true},
  directorscut:{kind:'roll',dx:3.5,dust:'#f2d98a'},
  redpen:{kind:'hop',dx:4,dust:'#d9544a'},
  chairman:{kind:'hop',dx:4,dust:'#d9a85a'},
  unread:{kind:'settle',mote:'#ffe08a'},
  ironbelly:{kind:'settle',mote:'#ffd070'},
  mirrorball:{kind:'settle',mote:'#f4f6ff',big:true},
  lastcall:{kind:'settle',mote:'#ffe08a'},
  finalcall:{kind:'walk',dx:5,dust:'#ffe08a'},
  gridlockprime:{kind:'drive',dx:7,dust:'#9fe3a0'},
  drillworm:{kind:'settle',mote:'#c9d2d8',sag:true}
};
const BOSS_FX=[];   // sparkles and rings, drawn over the map after the actors
function bossStays(n) { if(!n||!n.monster||typeof b7IsBoss!=='function'||!b7IsBoss(n)) return false; n.bossAwait=true; n.bossT=performance.now()+6000; return true; }
function bossFx(x,y,color,count,o={}) {
  const t0=performance.now();
  for(let i=0;i<count;i++) { const a=Math.random()*Math.PI*2,sp=(o.speed||26)*(.4+Math.random());
    BOSS_FX.push({t0:t0+Math.random()*(o.spread||0)*1000,dur:(o.dur||.9)*(.7+Math.random()*.6),x:x+(Math.random()-.5)*(o.w||0),y,vx:o.up?(Math.random()-.5)*14:Math.cos(a)*sp,vy:o.up?-(14+Math.random()*(o.speed||26)):Math.sin(a)*sp-(o.lift||10),g:o.up?-6:70,s:o.s||(2+Math.round(Math.random())),c:color}); }
}
function bossRing(x,y,w,color) { BOSS_FX.push({ring:true,t0:performance.now(),dur:1.1,x,y,w,c:color}); }
const LE_b7DrawMapFx_boss=b7DrawMapFx;
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_boss(time);
  if(!BOSS_FX.length) return;
  const now=performance.now();
  for(const f of BOSS_FX) { const t=(now-f.t0)/1000; if(t<0) continue; const u=t/f.dur; if(u>=1) continue;
    gfx.globalAlpha=Math.max(0,1-u);
    if(f.ring) { const rw=Math.round(8+f.w*u),rh=Math.max(2,Math.round(rw*.22)); gfx.strokeStyle=f.c; gfx.lineWidth=2; gfx.beginPath(); gfx.ellipse(f.x,f.y,rw,rh,0,0,Math.PI*2); gfx.stroke(); }
    else rect(Math.round(f.x+f.vx*t),Math.round(f.y+f.vy*t+f.g*t*t),f.s,f.s,f.c); }
  gfx.globalAlpha=1;
  for(let i=BOSS_FX.length-1;i>=0;i--) if((now-BOSS_FX[i].t0)/1000>=BOSS_FX[i].dur) BOSS_FX.splice(i,1);
};
function bossActor(id) { return currentMap.npcs.find(n=>n.monster===id)||sceneActor(id); }
function bossFinaleStep(id) {
  const spec=BOSS_FINALE[id]; let n=null,t=0,dur=1,ox=0,sx=1,gx=0,gy=0,baseY=0,h=0,did=0;
  return {
    start() {
      t=0; n=spec?bossActor(id):null;
      if(!n||n.hidden||n.fin) { n=null; return; }
      storyHold(n); n.bossAwait=false;
      const p=position(n),d=monsterDef(n),s=n.mscale||1; h=d.sprite.length*s;
      sx=p.x>=player.x?1:-1; if(spec.kind==='sink'||spec.kind==='settle') sx=p.x>=player.x?-1:1;   // movers go away from the party
      n.scenePose={foe:'stance',dir:sx>0?'right':'left'}; n.fin={}; ox=p.x; gx=Math.round((p.x+.5)*T); gy=Math.round((p.y+1)*T-2);
      dur={sink:2.2,leap:2.0,roll:1.9,hop:2.3,walk:2.4,drive:1.5,settle:2.6}[spec.kind];
      sfx.whoosh&&sfx.whoosh();
    },
    update(dt) {
      if(!n) return true;
      t+=dt; const u=Math.min(1,t/dur),F=n.fin,k=spec.kind,e=ease(u);
      const move=(frac)=>{ n.scr={x:ox+sx*spec.dx*frac,y:position(n).y}; };
      if(k==='sink') {
        const hold=.22; if(u<hold) F.lift=Math.sin(u*90)*1.2; else { const v=(u-hold)/(1-hold); F.lift=0; F.sink=Math.round(h*ease(v)*1.05); F.sink=F.sink||1;
          if(did<4&&v>did/4) { did++; bossFx(gx,gy,spec.dust,8,{up:true,w:h*.5,speed:34}); if(spec.rings) bossRing(gx,gy,h*.6,spec.dust); } }
      } else if(k==='leap') {
        if(u<.5) { const v=u/.5; n.scr={x:ox+sx*spec.dx*ease(v),y:position(n).y}; F.lift=Math.sin(Math.PI*v)*h*.55; if(did===0&&v>.9) { did=1; } }
        else { const v=(u-.5)/.5; n.scr={x:ox+sx*spec.dx,y:position(n).y}; F.lift=0; F.sink=Math.round(h*ease(v)*1.05)||1;
          if(did<2&&v>0) { did=2; bossFx(gx+sx*spec.dx*T,gy,spec.dust,14,{up:true,w:h*.5,speed:44}); bossRing(gx+sx*spec.dx*T,gy,h*.7,spec.dust); } }
      } else if(k==='roll') {
        move(e); F.rot=sx*u*Math.PI*6*(1-.15*u); F.lift=Math.abs(Math.sin(u*Math.PI*5))*5; if(u>.78) F.alpha=1-(u-.78)/.22;
        if(Math.random()<dt*14) bossFx(gx+sx*spec.dx*T*e,gy,spec.dust,2,{up:true,speed:16});
      } else if(k==='hop') {
        move(u); F.lift=Math.abs(Math.sin(u*Math.PI*4))*h*.34; if(u>.72) F.alpha=1-(u-.72)/.28;
        if(Math.abs(Math.sin(u*Math.PI*4))<.1&&Math.random()<.5) bossFx(gx+sx*spec.dx*T*u,gy,spec.dust,3,{up:true,speed:14});
      } else if(k==='walk') {
        move(e); F.lift=Math.abs(Math.sin(u*Math.PI*8))*3; if(u>.65) F.alpha=1-(u-.65)/.35;
        if(Math.random()<dt*10) bossFx(gx+sx*spec.dx*T*e,gy-h*.4,spec.dust,1,{up:true,speed:10});
      } else if(k==='drive') {
        move(u*u); F.lift=Math.sin(t*50)*.8; if(u>.6) F.alpha=1-(u-.6)/.4;
        if(Math.random()<dt*30) bossFx(gx+sx*spec.dx*T*u*u,gy,spec.dust,1,{up:true,speed:10});
      } else {   // settle: gold light swells, motes rise, the light stays low
        F.glow=u<.4?u/.4:1-(u-.4)/.6*.65; if(spec.sag) { F.sink=Math.round(Math.sin(Math.min(1,u*2)*Math.PI/2)*h*.06); }
        if(Math.random()<dt*(spec.big?60:26)) bossFx(gx,gy-h*.5,spec.mote,1,{up:true,w:h*.8,speed:30,dur:1.4});
      }
      if(u>=1) { this.finish(); return true; }
      return false;
    },
    finish() {
      if(!n) return;
      const F=spec.kind==='settle';
      n.scenePose=null; n.fin=F?{glow:.35}:null; n.bossSettle=F; if(!F) { n.scr=null; n.fin=null; monsterFall(n,true); }
    }
  };
}
SCENE_OPS.finale=o=>bossFinaleStep(o.finale);
// Safety net 1: a boss left standing after a win with no scene playing leaves after a few seconds.
const LE_updateNPCs_boss=updateNPCs;
updateNPCs=function(dt) {
  for(const n of currentMap.npcs) if(n.bossAwait) {
    if(intro.active||battle.active||dialog.active) n.bossT=performance.now()+6000;
    else if(performance.now()>n.bossT) { n.bossAwait=false; monsterFall(n,true); }
  }
  return LE_updateNPCs_boss(dt);
};
// Safety net 2: when an after scene ends, any boss it did not send off leaves the map.
let bossLastScene=null;
const LE_playScene_boss=playScene;
playScene=function(script,opts) {
  bossLastScene=typeof script==='string'?script:null;
  const r=LE_playScene_boss.apply(this,arguments);
  // A boss that stayed after the win is framed with the party for the whole after scene (a scene's own {cam} step still wins).
  const b=currentMap.npcs.find(n=>n.bossAwait&&!n.hidden);
  if(b&&bossLastScene&&/(After|AfterBoss|Calm)$/.test(bossLastScene)) { const bp=position(b),pp=position(player); if(Math.hypot(bp.x-pp.x,bp.y-pp.y)<=14) sceneCam=[(bp.x+pp.x)/2+.5,(bp.y+pp.y)/2+.5]; }
  return r;
};
const LE_endIntro_boss=endIntro;
endIntro=function() {
  const after=bossLastScene&&/(After|AfterBoss|Calm)$/.test(bossLastScene);
  LE_endIntro_boss.apply(this,arguments);
  if(after) {
    // A boss that settled stays in frame through the whole after scene; when it ends the chapter's own hide rule (STORY_WORLD) takes over.
    for(const m of Object.values(worlds)) for(const n of m.npcs.slice()) if(n.bossAwait||n.bossSettle) { n.bossAwait=false; n.bossSettle=false; n.fin=null; n.scr=null; monsterFall(n,true); }
    if(typeof storyWorld==='function') storyWorld();
  }
};
