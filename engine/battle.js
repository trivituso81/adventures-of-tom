'use strict';
// engine/battle.js — Shared battle runtime: the per-frame timers every battle animation uses (updateBattle) and the
// thrown props (drawProp). The old battle flow (command menu, MP attacks, single-enemy turns) was removed in F4;
// the battle itself is engine/battle2.js with engine/battle2-ui.js and engine/battle2-moves.js.
function updateBattle(dt) {
  battle.time+=dt;
  battle.shakeEnemy=Math.max(0,battle.shakeEnemy-dt);
  battle.flashEnemy=Math.max(0,battle.flashEnemy-dt);
  battle.enemyLunge=Math.max(0,battle.enemyLunge-dt);
  battle.slash=Math.max(0,battle.slash-dt);
  for(const f of battle.fx) { for(const k of ['shake','flash','lunge','twirl','tongue','appr','controller','cartwheel','kick','poke','combo','handspring','dismount','pogo','flop','roundoff','rebound','flip','punch','cheer','tickle','run','burpee','coach','hug','grumble','hop','toss','aim','cast','pose']) f[k]=Math.max(0,f[k]-dt); }
  battle.enemyKnock=Math.max(0,(battle.enemyKnock||0)-dt);
  for(const f of battle.fx) if(f.path) { f.path.t+=dt; if(f.path.t>=f.path.dur) f.path=null; }
  RFX.update(dt);
  if(battle.fireball) { battle.fireball.t+=dt; if(battle.fireball.t>battle.fireball.dur) battle.fireball=null; }
  if(battle.tetris) { battle.tetris.t+=dt; if(battle.tetris.t>battle.tetris.dur) battle.tetris=null; }
  for(const x of battle.texts) x.t+=dt; battle.texts=battle.texts.filter(x=>x.t<x.dur);
  if(battle.laser) { battle.laser.t+=dt; if(battle.laser.t>battle.laser.dur) battle.laser=null; }
  if(battle.boop) { battle.boop.t+=dt; if(battle.boop.t>battle.boop.dur) battle.boop=null; }
  if(battle.hose) { battle.hose.t+=dt; if(battle.hose.t>battle.hose.dur) battle.hose=null; }
  if(battle.lift) { battle.lift.t+=dt; if(battle.lift.t>battle.lift.dur) battle.lift=null; }
  if(battle.props) { for(const q of battle.props) q.t+=dt; battle.props=battle.props.filter(q=>q.t<q.dur); }
  if(battle.vapor>0) {
    battle.vapor=Math.max(0,battle.vapor-dt);
    for(const p of battle.vaporParts) {
      if(p.delay>0) { p.delay-=dt; continue; }
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy-=18*dt;
    }
  }
  if(battle.block) { battle.block.t+=dt; if(battle.block.t>=battle.block.dur) battle.block=null; }
  for(const p of battle.pops) p.t+=dt;
  battle.pops=battle.pops.filter(p=>p.t<1);
  if(battle.v2) b2Update(dt);
}

// Thrown and dropped things for the recruits' moves. Drawn centered at the origin.
function drawProp(q,u) {
  const k=q.kind,R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
  if(PROP2[k]) { PROP2[k](q,u); return; }
  if(k==='cookie') { E(0,0,13,12,OUT); E(0,0,11,10,'#c98a4b'); R(-5,-4,3,3,'#4a2e1c'); R(3,-2,3,3,'#4a2e1c'); R(-2,4,3,3,'#4a2e1c'); }
  else if(k==='pie') { E(0,2,24,11,OUT); E(0,2,22,9,'#c98a4b'); E(0,-2,19,8,'#e8d5a0'); E(-4,-5,8,4,'#fff1cb'); for(let i=-2;i<=2;i++) R(i*7-1,-6,2,8,'#a86a38'); }
  else if(k==='cream') { const f=u>.7?(1-u)/.3:1; gfx.globalAlpha=f; const c=q.glaze?'#9fd0ea':(q.pink?'#ffd3e0':'#fff6e6'); E(0,0,34,22,c); E(-14,10,12,8,c); E(16,12,11,7,c); E(4,22,8,6,c); gfx.globalAlpha=1; }
  else if(k==='tomato') { E(0,0,11,10,OUT); E(0,0,9,8,'#e04a3a'); E(-3,-2,3,2,'#ff8a7a'); R(-1,-10,3,4,'#4f8a3a'); R(-5,-9,11,2,'#4f8a3a'); }
  else if(k==='pepper') { gfx.save(); gfx.rotate(.5); E(0,0,8,20,OUT); E(0,0,6,18,'#e0402e'); E(-2,-4,2,8,'#ff8a70'); R(-2,-24,4,7,'#4f8a3a'); gfx.restore(); }
  else if(k==='steam') { const f=1-u; gfx.globalAlpha=f*.8; for(let i=0;i<4;i++) label('~',-30+i*20,-20-Math.round(u*60)-(i%2)*10,'#ff8a70',3); gfx.globalAlpha=1; }
  else if(k==='stamp') { const f=u>.8?(1-u)/.2:1; gfx.globalAlpha=Math.min(1,f+.2); gfx.save(); gfx.rotate(-.25); label('F',1,1,'#5a1a12',8); label('F',0,0,'#e0402e',8); gfx.restore(); gfx.globalAlpha=1; }
  else if(k==='paper') { gfx.save(); gfx.rotate(u*2-1); R(-12,-15,24,30,OUT); R(-11,-14,22,28,'#fff8e8'); for(let i=0;i<5;i++) R(-8,-10+i*5,16-(i%2)*6,2,'#9aa0b5'); label('?',0,0,'#e0402e',2); gfx.restore(); }
  else if(k==='tape') { const f=u<.5?1:Math.max(0,1-(u-.5)/.3); gfx.globalAlpha=f; R(-70,-40,140,8,'#fff1cb'); label('FINISH',0,-37,'#e0402e',1); if(u>=.5) { const g=(u-.5)/.5; R(-70-g*20,-40-g*30,50,8,'#fff1cb'); R(20+g*20,-40-g*30,50,8,'#fff1cb'); } gfx.globalAlpha=1; }
  else if(k==='moon') { E(0,0,30,30,OUT); E(0,0,28,28,'#ffe8a8'); E(-8,-6,6,6,'#e6cd88'); E(9,8,5,5,'#e6cd88'); E(6,-12,3,3,'#e6cd88'); }
  else if(k==='recliner') { R(-32,-30,64,60,OUT); R(-30,-28,60,56,'#7a4a2e'); R(-30,-28,60,14,'#9a6540'); R(-26,-12,52,26,'#8b5a38'); R(-30,14,60,14,'#5e361f'); R(-22,-6,44,10,'#a46d44'); if(u>.6) label('ZZZ',0,-40,'#fff1cb',2); }
  else if(k==='fish') { gfx.save(); gfx.scale(-1,1); E(0,0,70,30,OUT); E(0,0,68,28,'#7fa4b8'); E(10,-6,40,14,'#a8c8d8'); E(-40,-10,6,6,OUT); E(-40,-10,4,4,'#fff'); R(-44,-11,2,2,OUT); gfx.beginPath(); gfx.moveTo(64,0); gfx.lineTo(96,-30); gfx.lineTo(96,30); gfx.closePath(); gfx.fillStyle='#6a8ea2'; gfx.fill(); gfx.restore(); }
  else if(k==='wrench') { gfx.save(); gfx.rotate(-.6); R(-5,-22,10,44,OUT); R(-3,-20,6,40,'#aeb3ba'); R(-10,-26,20,12,OUT); R(-8,-24,16,8,'#aeb3ba'); R(-3,-24,6,5,'#1c3a32'); R(-10,16,20,12,OUT); R(-8,18,16,8,'#aeb3ba'); R(-3,20,6,5,'#1c3a32'); gfx.restore(); }
  else if(k==='wheel') { const f=u>.8?(1-u)/.2:1; gfx.globalAlpha=f; E(0,0,52,10,OUT); E(0,0,50,8,'#8a8f96'); E(0,-2,40,5,'#aeb3ba'); for(let i=0;i<4;i++) { const a=u*14+i*1.57; R(Math.round(Math.cos(a)*34)-2,-2-Math.round(Math.sin(a)*5),4,4,'#5e6670'); } gfx.globalAlpha=1; }
  else if(k==='duct') { const f=u>.8?(1-u)/.2:1; gfx.globalAlpha=f*Math.min(1,u/.15); gfx.save(); gfx.rotate(q.tilt||0); R(-46,-7,92,14,OUT); R(-44,-5,88,10,'#b8bcc2'); for(let i=0;i<6;i++) R(-40+i*15,-3,6,6,'#9a9ea4'); gfx.restore(); gfx.globalAlpha=1; }
  else if(k==='bowl') { E(0,-6,42,10,OUT); E(0,-6,40,8,'#8aa6a8'); E(0,-6,32,5,'#4e6f78'); gfx.beginPath(); gfx.moveTo(-40,-6); gfx.quadraticCurveTo(-36,30,0,34); gfx.quadraticCurveTo(36,30,40,-6); gfx.closePath(); gfx.fillStyle=OUT; gfx.fill(); gfx.beginPath(); gfx.moveTo(-38,-6); gfx.quadraticCurveTo(-34,28,0,32); gfx.quadraticCurveTo(34,28,38,-6); gfx.closePath(); gfx.fillStyle='#7fa4b8'; gfx.fill(); R(-20,8,16,4,'#a8c8d8'); if(u>.7) label('CLONK',0,-30,'#fff1cb',2); }
  else if(k==='shelf') { const f=u>.8?(1-u)/.2:1; gfx.globalAlpha=f; const yy=-Math.round(u*20); R(-50,yy,100,6,OUT); R(-48,yy+1,96,4,'#7a4a2e'); for(let i=0;i<3;i++) { const x=-36+i*30; R(x-9,yy-20,18,20,OUT); R(x-7,yy-18,14,16,['#7fa4b8','#d86f48','#8aa6a8'][i]); R(x-4,yy-16,8,3,'#fff8e8'); } gfx.globalAlpha=1; }
  else if(k==='line') {
    // Fishing line from Boppy's rod tip to the Grump, with a hook on the end.
    const reach=u<.3?u/.3:1,f=u>.85?(1-u)/.15:1;
    const dx=(q.x1-q.x0),dy=(q.y1-q.y0);
    gfx.globalAlpha=f; gfx.strokeStyle='#fff6e0'; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(0,0); gfx.quadraticCurveTo(dx*.5*reach,(dy*.5-60)*reach,dx*reach,dy*reach); gfx.stroke();
    R(-3,-34,4,36,'#5e361f'); E(dx*reach,dy*reach,5,5,'#dde'); gfx.globalAlpha=1;
  }
}

