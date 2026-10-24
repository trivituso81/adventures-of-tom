'use strict';
// engine/battle2-ui.js — The new battle's screen (F3): turn ribbon, party cards with HP and VP, the one-thumb
// command cross (Up basic, Right skills, Left Tombo, Down care and bag), skill grid, targeting, keyboard and
// gamepad input, and the enemy formation drawn on the battle canvas. Logic lives in engine/battle2.js.

// ---------- Screen on and off ----------
function b2ShowUI(on) {
  const B=$('battle');
  B.classList.toggle('v2',on);
  $('b2-ui').hidden=!on; $('b2-ribbon').hidden=!on;
  if(on) { B.hidden=false; b2LayoutFoes(); }
}
function b2Msg(text) { const el=$('b2-msg'); if(!el) return; if(battle.enemy&&typeof enemyText==='function') text=enemyText(String(text)); el.textContent=text; }
function b2Open(mode,sel) {
  B2.ui=mode; battle.state='command';
  const u=B2.actor;
  if(sel!=null) B2.sel=sel;
  else if(mode==='skills') B2.sel=b7RecSkill(u,Math.max(0,u.kit.skills.indexOf(B2.lastSkill[u.id])));   // Rose Mode starts on the tip
  else B2.sel=0;
  b2Render();
  if(mode==='cross') b7AutoTurn();   // Smart Repeat (engine/feel.js)
}

// ---------- Enemy formation on the canvas (576x324 pixels) ----------
// The front row centers on the old Grump spot (x 168, feet at y 264), where every move animation was drawn,
// so a single enemy lines up exactly. The back row stands behind it, further left. Slots stay put when someone falls.
const B2_REF={x:168,y:264};
function b2LayoutFoes() {
  const live=B2.foes.filter(f=>!f.dead);
  const F=live.filter(f=>f.row==='front'),Bk=live.filter(f=>f.row==='back'),n=live.length;
  const want=[0,96,80,68,60][n]||60;
  const size=(f,k)=>{ const base=f.def.scale||3,w=f.def.sprite[0].length; return Math.max(base*.7,Math.min(base*(f.boss?1.5:1.3),(f.boss?want*1.35:want)/w))*k; };
  const fy={1:[264],2:[224,302],3:[218,262,306]},fx={1:[168],2:[184,156],3:[188,158,188]};
  const by={1:[236],2:[214,268]},bx={1:[84],2:[92,70]};
  // A boss holds the middle of the front row.
  const fr=F.slice(); const bi=fr.findIndex(f=>f.boss); if(bi>=0&&fr.length===3&&bi!==1) { const [b]=fr.splice(bi,1); fr.splice(1,0,b); }
  fr.forEach((f,k)=>{ f.px=fx[fr.length][k]; f.py=fy[fr.length][k]; f.sc=size(f,1); });
  Bk.forEach((f,k)=>{ f.px=bx[Bk.length][k]; f.py=by[Bk.length][k]; f.sc=size(f,.9); });
}
function b2FoeCanvasPos(f) { const R=f.def.sprite; return {x:f.px,y:f.py,w:R[0].length*f.sc,h:R.length*f.sc}; }
// Point over the enemy's head in the 192x108 stage units that pop() and battle.texts use.
function b2FoePoint(f) { const p=b2FoeCanvasPos(f); return {x:Math.round(p.x/3),y:Math.round((p.y-p.h)/3)-2}; }

// ---------- Aim: re-pointing the old move animations at the chosen enemies ----------
// Every move animation was drawn for one enemy at B2_REF. While a move plays, the scene layer is warped so the enemy
// end of it lands on the real targets while the party end (the actor's home spot, xp) stays put. The warp is a plain
// affine transform: points at the actor move 0, points at B2_REF move by (dx, dy), and in between it blends.
function b2AimAt(targets,u) {
  const T=targets.filter(Boolean); if(!T.length||!u) { B2.aim=null; return; }
  const cx=T.reduce((s,t)=>s+t.px,0)/T.length,cy=T.reduce((s,t)=>s+t.py,0)/T.length;
  const xp=(BATTLE_POS[u.idx]||{x:150}).x*3,L=Math.max(120,xp-B2_REF.x);
  B2.aim={dx:cx-B2_REF.x,dy:cy-B2_REF.y,xp,L,targets:T};
  // Where the old scripts think the enemy is (they read these for its middle and top).
  const p=T[0],R=p.def.sprite;
  if(p.def._top==null) { p.def._top=R.findIndex(r=>r.replace(/\./g,'').length>=6); if(p.def._top<0) p.def._top=0; }
  battle.enemyX=B2_REF.x; battle.enemyTop=B2_REF.y-(R.length-p.def._top)*p.sc;
}
function b2WarpPt(x,y) { const A=B2.aim; if(!A) return [x,y]; const w=Math.max(0,Math.min(1,(A.xp-x)/A.L)); return [x+A.dx*w,y+A.dy*w]; }
function b2WarpCtx() { const A=B2.aim; if(!A) return; const k=1/A.L; gfx.transform(1-A.dx*k,-A.dy*k,0,1,A.dx*A.xp*k,A.dy*A.xp*k); }
// Scenes that cover the whole screen are never warped.
const B2_NOWARP=new Set(['dark','flash','letterbox','glitch','bossbar','credits','confetti','sprinkles','vhs','recframe']);
// An enemy attacking: which party member it lunges at.
function b2AimFoe(e,t) { B2.foeTarget=t||null; }
function b2Aim0() { B2.foeTarget=null; }
// Old scripts shake, flash, knock, wobble and lift "the enemy": that means everyone the move is aimed at.
const b2Aimed=f=>!!(B2.aim&&B2.aim.targets.includes(f));

function b2DrawEnemies(t) {
  const list=B2.foes.slice().sort((a,b)=>a.py-b.py);
  const liftY=battle.lift?(()=>{ const q=battle.lift.t/battle.lift.dur; return q<.7?Math.round(Math.sin(q/.7*Math.PI/2)*120):Math.round(120*(1-(q-.7)/.3)); })():0;
  battle.liftNow=liftY;
  for(const f of list) {
    if(f.dead) continue;
    const R=f.def.sprite,P=f.def.pal,sc=f.sc,w=R[0].length*sc,h=R.length*sc;
    if(f.calm) {
      // Un-Grumped: a happy wiggle, then little hops off the left edge with a heart overhead.
      const k=f.calmT,go=Math.max(0,k-.5),hx=Math.round(f.px-w/2-go*go*190),hy=Math.round(f.py-h-Math.abs(Math.sin(k*(k<.5?16:9)))*(k<.5?6:18));
      gfx.globalAlpha=Math.max(0,Math.min(1,(1.9-k)/.4));
      ellipse(hx+w/2,f.py+2,w*.4,Math.max(4,sc*2),'rgba(30,50,40,.25)');
      drawSprite(R,P,hx,hy,sc,{});
      b2PixHeart(hx+w/2,hy-14-Math.round(Math.sin(k*6)*3),3,'#ff7aa8');
      gfx.globalAlpha=1;
      continue;
    }
    const aimed=b2Aimed(f);
    const dying=f.dying>=0,q=dying?Math.min(1,f.dying/.9):0;
    const lq=f.lunge>0?Math.sin(Math.PI*(1-f.lunge/.55)):0;
    const tq=B2.foeTarget&&f.lunge>0?BATTLE_POS[B2.foeTarget.idx]:null;
    const lungeX=tq?(tq.x*3-60-f.px)*.55:70;
    const bob=dying?0:Math.round(Math.sin(t*3+f.idx*1.7)*2);
    const spawn=f.spawnT!=null&&f.spawnT<.6?f.spawnT/.6:1;
    let sx=0,sy=0;
    if(aimed) {
      if(battle.shakeEnemy>0) { sx+=rand(-5,5); sy+=rand(-3,3); }
      if(battle.enemyWobble>0) sx+=Math.round(Math.sin(t*30)*4);
      if(battle.enemyKnock>0) sx-=Math.round(Math.sin(Math.PI*(1-battle.enemyKnock/.45))*26);
      sy-=liftY;
    }
    const x=Math.round(f.px-w/2+lq*lungeX+(f.shake>0?rand(-4,4):0)+sx),y=Math.round(f.py-h+bob-lq*10-q*30+sy+(1-spawn)*40);
    if(!dying) ellipse(f.px,f.py+2,w*.48*(aimed&&liftY?Math.max(.3,1-liftY/120):1),Math.max(4,sc*2),'rgba(30,50,40,.3)');
    const flash=f.flash>0||(dying&&q>.1)||(aimed&&battle.flashEnemy>0);
    const sway=(f.st.goofed||f.st.staggered)&&!dying?Math.sin(t*5+f.idx)*.14:0;
    // A set piece can spin a monster about its middle and shift it (f.spin, f.ox, f.oy). They count only while the
    // scene keeps refreshing f.spinAt, so a skipped or cut-off move never leaves a monster upside down.
    const spun=f.spinAt&&performance.now()-f.spinAt<150&&!dying;
    if(spun) { gfx.save(); gfx.translate(x+w/2+(f.ox||0),y+h/2+(f.oy||0)); gfx.rotate((f.spin||0)+sway); drawSprite(R,P,-w/2,-h/2,sc,{flash,alpha:(1-q)*spawn}); gfx.restore(); }
    else if(sway) { gfx.save(); gfx.translate(x+w/2,y+h); gfx.rotate(sway); drawSprite(R,P,-w/2,-h,sc,{flash,alpha:(1-q)*spawn}); gfx.restore(); }
    else drawSprite(R,P,x,y,sc,{flash,alpha:(1-q)*spawn});
    if(dying) continue;
    const top=y+(f.def._top||0)*sc;
    // Deedee's pie tin, worn like a helmet.
    if(f.st.pietin) { const hx=x+w/2,hy=top+4; ellipse(hx,hy,w*.26+4,9,OUT); ellipse(hx,hy,w*.26+2,7,'#c9ccd4'); ellipse(hx,hy-3,w*.2,5,'#e8ecf2'); rect(hx-w*.2,hy-2,w*.4,2,'#9aa0aa'); }
    // Goofed: spinning stars and question marks. Smitten: hearts. Staggered: stars. Grumbled: a sulky "...".
    if(f.st.goofed) for(let k=0;k<4;k++) { const a=t*4+k*1.57; label(k%2?'+':'?',x+w/2+Math.round(Math.cos(a)*w*.42),top-8+Math.round(Math.sin(a)*8),k%2?'#ffe08a':'#fff1cb',3); }
    if(f.st.smitten) for(let k=0;k<3;k++) { const ph=(t*1.2+k/3)%1; gfx.globalAlpha=1-ph; label('<3',x+w/2-20+k*20,top-6-Math.round(ph*30),'#ff9ac0',2); gfx.globalAlpha=1; }
    if(f.st.staggered) for(let k=0;k<3;k++) { const a=t*5+k*2.1; label('*',x+w/2+Math.round(Math.cos(a)*w*.35),top-10+Math.round(Math.sin(a)*6),'#ffe08a',3); }
    if(f.st.grumbled) label('...',x+w/2+w*.32,top-10-Math.round(Math.abs(Math.sin(t*4))*3),'#cfd8d6',2);
    // A boss's shield: a bubble with one pip per hit still needed.
    if(f.shield) {
      const k=.5+.5*Math.sin(t*5),cx=f.px,cy=f.py-h/2,r=Math.max(w,h)*.6;
      gfx.globalAlpha=.25+.15*k; ellipse(cx,cy,r,r*.85,'#ffe27a'); gfx.globalAlpha=1;
      gfx.strokeStyle='rgba(255,226,122,'+(.6+.3*k)+')'; gfx.lineWidth=3; gfx.beginPath(); gfx.ellipse(cx,cy,r,r*.85,0,0,Math.PI*2); gfx.stroke();
      const left=f.shield.need-f.shield.hits;
      for(let i=0;i<f.shield.need;i++) { const px=cx-(f.shield.need-1)*9+i*18,py=cy-r*.85-12; rect(px-6,py-6,12,12,OUT); rect(px-4,py-4,8,8,i<left?'#ffe27a':'#4a4030'); }
    }
    // Megaphone wind-up over a boss that is about to hit everyone.
    if(f.intent&&f.intent.kind==='all') { const yy=top-30-Math.round(Math.abs(Math.sin(t*6))*5); label('!!',x+w/2+2,yy+2,'#1b2d27',4); label('!!',x+w/2,yy,'#ff8f80',4); }
    // HP bar and letter under the feet; status tags over the head.
    const bw=Math.max(36,Math.min(60,w*.7)),bx=Math.round(f.px-bw/2),byy=f.py+9,r=f.hp/f.maxHp;
    rect(bx-1,byy-1,bw+2,6,'#0b0d12'); rect(bx,byy,bw,4,'#1a1e26');
    rect(bx,byy,Math.round(bw*r),4,r<=.25?'#ff8f80':r<=.5?'#f0c060':'#8ad6a2');
    // The pink Warmth bar (Kindness): fills toward Un-Grumping.
    const wr=f.warm/f.warmGoal; rect(bx-1,byy+5,bw+2,5,'#0b0d12'); rect(bx,byy+6,bw,3,'#3a2230');
    if(wr>0) rect(bx,byy+6,Math.max(1,Math.round(bw*wr)),3,f.warmFlash>0&&Math.floor(t*14)%2?'#ffe0ec':'#ff8ab4');
    if(f.letter) { rect(bx-17,byy-5,13,14,'#0b0d12'); label(f.letter,bx-10,byy-3,'#f1f3f7',2); }
    let syy=top-(f.st.pietin?30:16);
    for(const k in f.st) { const s=B2_STATUS[k]; if(!s||k==='pietin') continue; label(s.short,f.px+1,syy+1,'#0b0d12',2); label(s.short,f.px,syy,s.color,2); syy-=13; }
  }
  // Puffs from enemies melting away.
  for(const f of B2.foes) for(const p of f.parts) {
    if(p.d>0) continue;
    gfx.globalAlpha=Math.max(0,1-(f.dying/1.1)); rect(Math.round(p.x),Math.round(p.y),p.s,p.s,p.c); gfx.globalAlpha=1;
  }

}

// Drawn over the party: target arrows, the current actor's marker and the element effects.
function b2DrawOverlay(t) {
  const bounce=Math.round(Math.abs(Math.sin(t*6))*5);
  const arrow=(x,y,c)=>{ rect(x-7,y-1,14,3,'#0b0d12'); rect(x-6,y,12,2,c); rect(x-4,y+2,8,2,c); rect(x-2,y+4,4,2,c); rect(x-1,y+6,2,1,c); };
  const headOf=u=>{ const q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id],d=b2Riding(u)&&battle.drawnAt&&battle.drawnAt[u.idx];
    if(d) return {x:d.cx,y:d.base-sp.idle.length*sp.scale-8};
    return {x:q.x*3,y:q.base*3-sp.idle.length*sp.scale-8}; };
  if(battle.state==='command'&&B2.actor&&B2.ui!=='target'&&B2.ui!=='inspect') { const h=headOf(B2.actor); arrow(h.x,h.y-14-bounce,'#f0c75a'); }
  if(battle.state==='command'&&B2.ui==='inspect') { const f=b2LiveFoes()[B2.sel]; if(f) { const p=b2FoeCanvasPos(f); arrow(p.x,p.y-p.h-18-bounce,'#ff9ac0'); } }
  if(battle.state==='command'&&B2.ui==='target') {
    const o=B2.opts[B2.sel];
    if(o) for(const u of o.targets) {
      if(u.side==='foe') { const p=b2FoeCanvasPos(u); arrow(p.x,p.y-p.h-18-bounce,'#f0c75a'); }
      else { const h=headOf(u); arrow(h.x,h.y-14-bounce,'#9be39a'); }
    }
    if(o&&o.primary&&B2.pending&&B2.pending.target==='splash') for(const n of b2Splash(o.primary)) { const p=b2FoeCanvasPos(n); gfx.globalAlpha=.55; arrow(p.x,p.y-p.h-14-bounce,'#f0c75a'); gfx.globalAlpha=1; }
  }
  for(const e of B2.fx) if(e.t>=0) b2DrawFx(e,t);
  b7DrawOverlay(t);   // the High-Five sparkle
  // Lock-on: a red reticle on whoever a boss is about to hit.
  for(const f of B2.foes) if(b2Alive(f)&&f.intent&&f.intent.kind==='lock'&&b2Alive(f.intent.target)) {
    const u=f.intent.target,q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id]; if(!q||!sp) continue;
    const cx=q.x*3,cy=q.base*3-sp.idle.length*sp.scale*.5,r=26+Math.round(Math.sin(t*6)*3);
    gfx.strokeStyle='rgba(255,90,80,.9)'; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(cx,cy,r,0,Math.PI*2); gfx.stroke();
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) rect(cx+dx*(r+2)-(dx?0:1)-(dx<0?8:0),cy+dy*(r+2)-(dy?0:1)-(dy<0?8:0),dx?8:3,dy?8:3,'#ff5a50');
    label('LOCK',cx,cy-r-14,'#ff8f80',2);
  }
}

// ---------- Element effects (placeholders until F4 re-hooks each move's real animation) ----------
function b2Fx(e) { e.t=-(e.delay||0); B2.fx.push(e); }
function b2Burst(f,elem) { const p=b2FoeCanvasPos(f); b2Fx({kind:'burst',x:p.x,y:p.y-p.h/2,elem,t:0,dur:.5,r:Math.max(24,p.w*.5)}); }
function b2Proj(u,f,elem,style) {
  const q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id],p=b2FoeCanvasPos(f);
  b2Fx({kind:'proj',x0:q.x*3-20,y0:q.base*3-sp.idle.length*sp.scale*.55,x1:p.x,y1:p.y-p.h/2,elem,style,t:0,dur:.32});
}
function b2DrawFx(e,t) {
  const u=Math.min(1,e.t/e.dur),E=B2_ELEMS[e.elem]||B2_ELEMS.kinetic;
  if(e.kind==='burst') {
    const r=e.r*(.4+u*.8),a=1-u; gfx.globalAlpha=a;
    if(e.elem==='splash') { for(let k=0;k<10;k++) { const ang=k*.63; ellipse(e.x+Math.cos(ang)*r,e.y+Math.sin(ang)*r*.6,5,4,k%2?E.color:'#e8f6ff'); } }
    else if(e.elem==='cozy') { ellipse(e.x,e.y,r*.8,r*.6,'rgba(255,154,74,.45)'); for(let k=0;k<7;k++) rect(e.x-r*.6+k*r*.2,e.y-u*50-(k%3)*8,4,4,k%2?'#ffd166':'#ff8c3a'); }
    else if(e.elem==='sparkle') { for(let k=0;k<6;k++) { const ang=k*1.05+u*2,sx=e.x+Math.cos(ang)*r,sy=e.y+Math.sin(ang)*r*.7; rect(sx-1,sy-6,3,12,E.color); rect(sx-6,sy-1,12,3,E.color); rect(sx-1,sy-1,3,3,'#fff'); } }
    else if(e.elem==='chatter') { gfx.strokeStyle=E.color; gfx.lineWidth=3; for(let k=0;k<3;k++) { gfx.beginPath(); gfx.arc(e.x,e.y,Math.max(1,r*(.4+k*.3)),0,Math.PI*2); gfx.stroke(); } }
    else { for(let k=0;k<8;k++) { const ang=k*.785; gfx.strokeStyle=k%2?'#fff6dc':'#ffe08a'; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(e.x+Math.cos(ang)*r*.3,e.y+Math.sin(ang)*r*.3); gfx.lineTo(e.x+Math.cos(ang)*r,e.y+Math.sin(ang)*r); gfx.stroke(); } }
    gfx.globalAlpha=1;
  } else if(e.kind==='proj') {
    const x=e.x0+(e.x1-e.x0)*u,y=e.y0+(e.y1-e.y0)*u-Math.sin(u*Math.PI)*30;
    if(e.style==='card') { gfx.save(); gfx.translate(x,y); gfx.rotate(u*6); rect(-8,-11,16,22,'#0b0d12'); rect(-7,-10,14,20,'#fff8e8'); rect(-4,-6,8,2,'#6a4a9a'); rect(-4,-1,8,2,'#6a4a9a'); rect(-4,4,6,2,'#6a4a9a'); gfx.restore(); }
    else { for(let k=3;k>0;k--) ellipse(x-(e.x1-e.x0)*.04*k,y,6+k,5+k,E.color+'55'); ellipse(x,y,7,6,E.color); ellipse(x-2,y-2,3,3,'#fff'); }
  } else if(e.kind==='pod') {
    const x=-140+u*860,y=228;
    rect(x-60,y-20,120,40,'#0b0d12'); rect(x-58,y-18,116,36,'#5a6476'); rect(x-58,y-18,116,8,'#8a96aa'); rect(x-40,y-10,50,14,'#c9a46a'); rect(x+20,y-14,30,20,'#2c323e'); label('DELTA ONE',x,y+8,'#fff1cb',1);
    for(let k=0;k<4;k++) rect(x-80-k*18,y-14+k*8,14,2,'rgba(255,246,220,.6)');
  } else if(e.kind==='pot') {
    const yy=e.y-260+u*200; ellipse(e.x,yy,26,8,'#0b0d12'); rect(e.x-24,yy,48,26,'#0b0d12'); rect(e.x-22,yy+2,44,22,'#3a3f48'); ellipse(e.x,yy,22,6,'#5a606a'); rect(e.x-30,yy+6,6,6,'#3a3f48'); rect(e.x+24,yy+6,6,6,'#3a3f48');
  } else if(e.kind==='kanji') {
    gfx.globalAlpha=u<.2?u/.2:(u>.7?(1-u)/.3:1);
    gfx.font='bold 72px serif'; gfx.textAlign='center'; gfx.textBaseline='middle';
    gfx.fillStyle='#0b0d12'; gfx.fillText('火',e.x+3,e.y+3); gfx.fillStyle='#ffe27a'; gfx.fillText('火',e.x,e.y);
    gfx.globalAlpha=1;
  } else if(e.kind==='zzz') {
    gfx.globalAlpha=u<.1?u/.1:(u>.8?(1-u)/.2:1); for(let k=0;k<3;k++) { const q=(e.t*.7+k/3)%1; label('Z',e.x+Math.round(q*26),e.y-Math.round(q*40),k?'#fff1cb':'#ffe08a',2+(k%2)); } gfx.globalAlpha=1;
  } else if(e.kind==='tin') {
    // The pie tin spins off the boss's head and clatters to the ground.
    const x=e.x-u*120,y=e.y-Math.sin(u*Math.PI)*90+u*u*120; gfx.save(); gfx.translate(x,y); gfx.rotate(u*12);
    ellipse(0,0,24,8,OUT); ellipse(0,0,22,6,'#c9ccd4'); ellipse(0,-2,16,4,'#e8ecf2'); gfx.restore();
  } else if(e.kind==='shatter') {
    gfx.globalAlpha=1-u; for(let k=0;k<12;k++) { const a=k/12*Math.PI*2,r=e.r*(.8+u*.9); gfx.save(); gfx.translate(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r*.85); gfx.rotate(a+u*4); rect(-6,-3,12,6,'#ffe27a'); rect(-6,-3,12,2,'#fff6c8'); gfx.restore(); } gfx.globalAlpha=1;
  } else if(e.kind==='heart') {
    // A pixel heart rising (Kindness). Big one for Un-Grumping, small ones for each warm-up.
    const a=u<.15?u/.15:(u>.7?(1-u)/.3:1); gfx.globalAlpha=a;
    b2PixHeart(e.x,e.y-u*(e.small?22:46),e.small?2:(4+Math.round(Math.min(1,u*4)*2)),'#ff7aa8');
    gfx.globalAlpha=1;
  } else if(e.kind==='banner') {
    // TOMBO! banner across the top of the stage.
    const inn=Math.min(1,e.t/.22),out=u>.8?(1-u)/.2:1,x=Math.round(-576*(1-inn)),y=46;
    gfx.globalAlpha=out; rect(x,y-22,576,46,'rgba(11,13,18,.72)'); rect(x,y-24,576,2,'#ffe08a'); rect(x,y+24,576,2,'#ffe08a');
    label('TOMBO!',x+288+2,y-16+2,'#1b2d27',4); label('TOMBO!',x+288,y-16,Math.floor(e.t*10)%2?'#ffe08a':'#ff9ac0',4);
    label(e.name.toUpperCase(),x+288,y+8,'#fff1cb',2); gfx.globalAlpha=1;
  } else if(e.kind==='flash') {
    gfx.globalAlpha=(1-u)*.7; rect(0,0,576,324,e.color); gfx.globalAlpha=1;
  }
}

// A chunky pixel heart with an outline, centered on x,y. s = pixel size.
const B2_HEART_BM=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];
function b2PixHeart(x,y,s,c) {
  const ox=Math.round(x-3.5*s),oy=Math.round(y-3*s);
  for(let r=0;r<6;r++) for(let k=0;k<7;k++) if(B2_HEART_BM[r][k]==='X') rect(ox+k*s-1,oy+r*s-1,s+2,s+2,'#2b1d2b');
  for(let r=0;r<6;r++) for(let k=0;k<7;k++) if(B2_HEART_BM[r][k]==='X') rect(ox+k*s,oy+r*s,s,s,(r===1&&(k===1||k===2))?'#ffe0ec':c);
}
function b2Update(dt) {
  for(const f of B2.foes) {
    if(f.warmFlash>0) f.warmFlash-=dt;
    if(f.calm&&!f.dead) { f.calmT+=dt; if(f.calmT>=1.9) f.dead=true; }
    if(f.spawnT!=null&&f.spawnT<1) f.spawnT+=dt;
    f.shake=Math.max(0,f.shake-dt); f.flash=Math.max(0,f.flash-dt); f.lunge=Math.max(0,f.lunge-dt);
    if(f.dying>=0&&!f.dead) {
      f.dying+=dt;
      for(const p of f.parts) { if(p.d>0) { p.d-=dt; continue; } p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy-=20*dt; }
      if(f.dying>=1.1) f.dead=true;
    }
  }
  for(const e of B2.fx) e.t+=dt;
  B2.fx=B2.fx.filter(e=>e.t<e.dur);
  b7Update(dt);
}

// ---------- DOM: ribbon, party cards, command area ----------
const b2Thumbs={};
function b2Thumb(id) {
  if(b2Thumbs[id]) return b2Thumbs[id];
  const d=MONSTERS[id],R=d.sprite,c=document.createElement('canvas'),n=Math.max(R.length,R[0].length);
  c.width=c.height=n; const g=c.getContext('2d');
  const ox=Math.floor((n-R[0].length)/2),oy=n-R.length;
  for(let r=0;r<R.length;r++) for(let k=0;k<R[r].length;k++) { const ch=R[r][k]; if(ch==='.') continue; g.fillStyle=d.pal[ch]; g.fillRect(ox+k,oy+r,1,1); }
  return b2Thumbs[id]=c.toDataURL();
}
const b2Esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function b2Portrait(id) { return (typeof PORTRAITS!=='undefined'&&PORTRAITS[id])||''; }

// The weight to preview on the ribbon for what the cursor is on right now.
function b2PreviewWeight() {
  const u=B2.actor; if(!u||battle.state!=='command') return null;
  if(B2.ui==='skills') { const s=u.kit.skills[B2.sel]; return s?(b2Diamond(u,s)?'instant':s.weight):null; }
  if(B2.ui==='target') return B2.pending?(b2Diamond(u,B2.pending)?'instant':B2.pending.weight||'standard'):null;
  if(B2.ui==='care'&&B2.sel===0&&u.kit.special) return u.kit.special.weight;
  if(B2.ui==='tombo') { const r=b2TomboRows(u)[B2.sel]; return r?r.T.weight:'standard'; }
  return 'standard';
}
function b2RenderRibbon() {
  const box=$('b2-ribbon'); if(!box) return;
  const list=b2Forecast(b2PreviewWeight());
  box.innerHTML='<span class="b2-rib-lbl">TURN</span>'+list.map(e=>{
    const u=e.u,cls='b2-tk '+(u.side==='foe'?'foe':'pty')+(e.now?' now':'')+(e.ghost?' ghost':'')+(e.intent?' tel':'');
    const img=u.side==='foe'?b2Thumb(u.id):b2Portrait(u.id);
    // Boss telegraphs on its next turn: lock-on (who), megaphone (everyone), shield count, or stagger.
    let badge='';
    if(e.intent) {
      if(u.st.staggered) badge='<i class="b2-int stg" title="Staggered">ZZ</i>';
      else if(u.intent.kind==='cut') badge='<i class="b2-int lock" title="CUT! The next person loses their turn">CUT</i>';
      else if(u.intent.kind==='heal') badge='<i class="b2-int stg" title="Take Two: it heals">+HP</i>';
      else if(u.intent.kind==='broil') badge='<i class="b2-int all" title="BROIL: hits everyone. Splash calls it off">HOT</i>';
      else if(u.intent.kind==='dig') badge='<i class="b2-int stg" title="Dig Up: it eats its buried acorn">DIG</i>';
      else if(u.intent.kind==='lock') badge='<i class="b2-int lock" title="Lock-on: '+b2Esc(u.intent.target.name)+'">◎'+b2Esc(u.intent.target.name.charAt(0))+'</i>';
      else badge='<i class="b2-int all" title="Hits everyone">!!'+(u.shield?'<s>'+(u.shield.need-u.shield.hits)+'</s>':'')+'</i>';
    }
    return '<div class="'+cls+'" title="'+b2Esc(u.name)+'">'+(img?'<img alt="" src="'+img+'">':'<span>'+b2Esc(u.name.charAt(0))+'</span>')+(u.letter?'<b>'+u.letter+'</b>':'')+badge+'</div>';
  }).join('');
}
function b2RenderParty() {
  const box=$('b2-party'); if(!box) return;
  const tgt=B2.ui==='target'&&B2.opts[B2.sel]?B2.opts[B2.sel].targets:[];
  box.innerHTML=b2HeartRow()+B2.party.map((u,i)=>{
    const r=Math.max(0,u.hp)/u.maxHp,cls='b2-pc'+(u===B2.actor&&battle.state==='command'?' act':'')+(u.hp<=0?' ko':'')+(tgt.includes(u)?' tgt':'');
    const pips=Array.from({length:B2_VP.cap},(_,k)=>'<i'+(k<u.vp?' class="on"':'')+'></i>').join('');
    const sk=Object.keys(u.st).filter(k=>B2_STATUS[k]&&!B2_STATUS[k].hide);
    const st=sk.slice(0,2).map(k=>'<span class="b2-st" style="color:'+B2_STATUS[k].color+'">'+B2_STATUS[k].short+'</span>').join('')+(sk.length>2?'<span class="b2-st">+'+(sk.length-2)+'</span>':'');
    const img=b2Portrait(u.id),tb=b2TraitBadge(u);   // engine/battle2-traits.js
    const badge=tb.txt&&u.hp>0?'<b class="b2-tr'+(tb.on?' on':'')+(tb.cls?' '+tb.cls:'')+'" title="'+b2Esc(tb.title)+'">'+b2Esc(tb.txt)+'</b>':'';
    return '<div class="'+cls+'" data-i="'+i+'"><span class="b2-pt">'+(img?'<img alt="" src="'+img+'">':'<span class="b2-ph">'+u.name.charAt(0)+'</span>')+badge+'</span>'+
      '<div><div class="b2-nm">'+b2Esc(u.name)+st+'<em>Lv'+u.lvl+'</em></div>'+
      '<div class="b2-bar"><i class="'+(r<=.25?'crit':r<=.5?'low':'')+'" style="width:'+Math.round(r*100)+'%"></i></div>'+
      '<div class="b2-sub"><span>'+(u.hp<=0?'KNOCKED OUT':'HP '+Math.max(0,u.hp)+'/'+u.maxHp)+'</span><span class="b2-vp" aria-label="VP '+u.vp+'">'+pips+'</span></div></div></div>';
  }).join('');
}
// The shared HEART meter: four hearts of 25%.
function b2HeartRow() {
  const H=B2.heart||0,P='M7 12.2L1.4 6.6A3.4 3.4 0 0 1 7 2.6A3.4 3.4 0 0 1 12.6 6.6Z';
  const hearts=[0,1,2,3].map(k=>{ const f=Math.max(0,Math.min(1,(H-25*k)/25));
    return '<svg viewBox="0 0 14 13" class="'+(f>=1?'full':'')+'"><defs><clipPath id="b2hc'+k+'"><rect x="0" y="0" width="'+(14*f).toFixed(2)+'" height="13"/></clipPath></defs>'+
      '<path d="'+P+'" fill="#3a2230" stroke="#0b0d12" stroke-width="1.2"/><path d="'+P+'" fill="#ff7aa8" clip-path="url(#b2hc'+k+')"/></svg>'; }).join('');
  // Deedee's Warm Crust Tokens sit on the shared tray (engine/battle2-traits.js).
  const n=B2.crust||0,tray=n||B2.party.some(p=>p.id==='deedee')?'<span class="b2-tray" title="Warm Crust Tokens: eat one from Care &amp; Bag, free">'+'<i class="on hot"></i>'.repeat(Math.min(n,B2.hot||0))+'<i class="on"></i>'.repeat(n-Math.min(n,B2.hot||0))+'<i></i>'.repeat(B2_TRAIT.crustMax-n)+'</span>':'';
  return '<div class="b2-heart" aria-label="HEART '+Math.floor(H)+' percent"><span class="lbl">HEART</span><span class="hts">'+hearts+'</span>'+tray+'<b>'+Math.floor(H)+'%</b></div>';
}
function b2ElemChip(els) { return (els||[]).map(e=>'<span class="b2-el" style="background:'+B2_ELEMS[e].color+'">'+B2_ELEMS[e].name.toUpperCase()+'</span>').join(''); }
function b2RenderCmd() {
  const box=$('b2-cmd'),low=$('b2-low'),u=B2.actor; if(!box) return;
  const cmdOn=battle.state==='command';
  if(!cmdOn||B2.ui==='cross'||B2.ui==='busy'||!u||u.side!=='party') {
    const pu=u&&u.side==='party'?u:B2.party[0],k=pu.kit,off=!cmdOn?' off':'';
    const img=b2Portrait(pu.id);
    box.innerHTML='<div class="b2-cross">'+
      '<button type="button" class="b2-x up'+off+'" data-d="up"><span class="ar">▲</span>'+b2Esc(k.basic.name.toUpperCase())+'<small>+1 VP</small></button>'+
      '<button type="button" class="b2-x left'+(cmdOn&&b2TomboReady(pu)?'':' off')+'" data-d="left"><span class="ar">◀</span>TOMBO<small>'+(b2TomboRows(pu).length?Math.floor(B2.heart)+'% HEART':'NONE YET')+'</small></button>'+
      '<button type="button" class="b2-mid'+off+'" data-insp="1" aria-label="Inspect enemies">'+(img?'<img alt="" src="'+img+'">':'')+'<small>INSPECT</small></button>'+
      '<button type="button" class="b2-x right'+(k.skills.length?off:' off')+'" data-d="right"><span class="ar">▶</span>SKILLS<small>'+(pu.vp)+' VP</small></button>'+
      '<button type="button" class="b2-x down'+off+'" data-d="down"><span class="ar">▼</span>CARE &amp; BAG</button></div>';
    return;
  }
  const back='<button type="button" class="b2-btn b2-back" data-back="1"><span>BACK</span><em>B / Esc</em></button>';
  if(B2.ui==='skills') {
    box.innerHTML='<div class="b2-grid">'+u.kit.skills.map((s,i)=>{ const c=b2Cost(u,s),free=b2Diamond(u,s);
      return '<button type="button" class="b2-btn'+(i===B2.sel?' sel':'')+(u.vp<c||b2Shushed(u,s)?' no':'')+'" data-i="'+i+'"><span>'+b2Esc(s.name.toUpperCase())+'</span><em>'+b2ElemChip(s.elem)+(free?'<b class="b2-free">FREE</b>':c+' VP')+'</em></button>'; }).join('')+back+'</div>';
  } else if(B2.ui==='care') {
    const rows=b2CareRows(u);
    box.innerHTML='<div class="b2-list">'+rows.map((r,i)=>'<button type="button" class="b2-btn'+(i===B2.sel?' sel':'')+(r.no?' no':'')+'" data-i="'+i+'"><span>'+b2Esc(r.name)+'</span><em>'+b2Esc(r.sub)+'</em></button>').join('')+back+'</div>';
  } else if(B2.ui==='bag') {
    const rows=b2BagRows();
    box.innerHTML='<div class="b2-grid">'+(rows.length?rows.map((r,i)=>'<button type="button" class="b2-btn'+(i===B2.sel?' sel':'')+'" data-i="'+i+'"><span>'+b2Esc(r.it.icon+' '+r.it.name.toUpperCase())+'</span><em>'+b2Esc(r.sub)+' · x'+r.n+'</em></button>').join(''):'<p class="b2-empty">Nothing useful in the pockets.</p>')+back+'</div>';
  } else if(B2.ui==='tombo') {
    const rows=b2TomboRows(u);
    box.innerHTML='<div class="b2-list">'+(rows.length?rows.map((r,i)=>'<button type="button" class="b2-btn'+(i===B2.sel?' sel':'')+(r.why?' no':'')+'" data-i="'+i+'"><span>'+b2Esc(r.T.name.toUpperCase())+'</span><em>TOM + '+b2Esc(r.pt.name.toUpperCase())+' · '+r.T.cost+'% HEART · '+b2ElemChip(r.T.elem)+'</em></button>').join(''):'<p class="b2-empty">No Tombos yet. They unlock as the story goes.</p>')+back+'</div>';
  } else if(B2.ui==='inspect') {
    box.innerHTML='<div class="b2-list">'+b2LiveFoes().map((f,i)=>'<button type="button" class="b2-btn'+(i===B2.sel?' sel':'')+'" data-i="'+i+'"><span>'+b2Esc(f.name.toUpperCase())+'</span><em>HP '+f.hp+'/'+f.maxHp+' · <b class="b2-warm">WARMTH '+f.warm+'/'+f.warmGoal+'</b>'+(f.revealed&&f.weak.length?' · '+b2ElemChip(f.weak):'')+'</em></button>').join('')+back+'</div>';
  } else if(B2.ui==='target') {
    box.innerHTML='<div class="b2-list">'+B2.opts.map((o,i)=>{ const t1=o.targets.length===1?o.targets[0]:null;
      const sub=t1?(t1.hp<=0?'KNOCKED OUT':'HP '+t1.hp+'/'+t1.maxHp)+(t1.side==='foe'&&t1.revealed&&t1.weak.length?' · '+b2ElemChip(t1.weak).replace(/<span/g,'<span title="weak"'):''):o.targets.length+' targets';
      return '<button type="button" class="b2-btn'+(i===B2.sel?' sel':'')+'" data-i="'+i+'"><span>'+b2Esc(o.label.toUpperCase())+'</span><em>'+sub+'</em></button>'; }).join('')+back+'</div>';
  }
}
function b2CareRows(u) {
  const rows=[];
  if(u.kit.special) rows.push({name:u.kit.special.name,sub:u.kit.special.vp+' VP · signature',act:u.kit.special,no:u.vp<u.kit.special.vp});
  // COMPLIMENT / GREAT TAKE! when a monster here wants one (B2_FOES praise, engine/battle2.js b2PraiseSteps).
  const pf=b2LiveFoes().find(f=>f.D.praise);
  if(pf) rows.push({name:pf.D.praise.label,sub:pf.D.praise.sub,praise:true});
  if(B2.crust) rows.push({name:B2.hot?'HOT DISH':'WARM CRUST',sub:u.ateCrust?'Already had one this turn':'Free · '+B2.crust+' on the tray'+(B2.hot?' · heals more, cures one':''),crust:true,no:!!u.ateCrust});
  const lock=b7SnackLock(u);   // Director Mode: one snack per round
  rows.push({name:'SNACK BAG',sub:lock||B2.bag.length+' things in the pockets',bag:true,no:!!lock});
  rows.push({name:'RUN',sub:'Back away slowly',run:true});
  return rows;
}
const b2ItemOk=it=>!!(it.heal||it.healAll||it.revive||it.dmg||it.confuse||it.atkDown||it.pep||it.vp);
function b2ItemSub(it) {
  return it.dmg?it.dmg+' damage':it.healAll?'Everyone +'+it.healAll+' HP':it.revive?'Revive at half HP':it.confuse?'Goofs an enemy':it.atkDown?'Enemy POW -25%':it.pep?'Everyone Pumped Up':it.vp?'+'+it.vp+' VP':'+'+it.heal+' HP';
}
function b2BagRows() {
  const ids=[...new Set(B2.bag)].filter(id=>items[id]&&b2ItemOk(items[id]));
  return ids.map(id=>{ const it=items[id]; return {id,it,n:B2.bag.filter(b=>b===id).length,sub:b2ItemSub(it)}; });
}
const b2Shushed=(u,s)=>!!((u.st.shushed&&s&&(s.elem||[]).includes('chatter'))||(u.st.silenced&&s&&u.kit.skills.includes(s)));
function b2Render() {
  if(!B2.active&&!$('battle').classList.contains('v2')) return;
  b2RenderRibbon(); b2RenderParty(); b2RenderCmd(); b2Info();
  b7AfterRender();   // engine/feel.js: Rose Mode's gold tip, the speed and AUTO buttons
  const sel=document.querySelector('#b2-cmd .b2-btn.sel'); if(sel&&sel.scrollIntoView) sel.scrollIntoView({block:'nearest'});
}
// What the cursor is on, in the message line.
function b2Info() {
  if(battle.state!=='command'||!B2.actor) return;
  const u=B2.actor;
  if(B2.ui==='skills') { const s=u.kit.skills[B2.sel]; if(s) b2Msg(s.name+(b2Diamond(u,s)?' (FREE and instant: Diamond Medallion). ':' ('+s.vp+' VP). ')+s.desc); }
  else if(B2.ui==='care') { const r=b2CareRows(u)[B2.sel]; if(r&&r.act) b2Msg(r.act.desc); else if(r&&r.crust) b2Msg(u.id==='nara'?'Warm Crust. Homemade, so Nara will eat it: heals 40% and POW +30%. Free; her turn goes on.':'Warm Crust from Deedee’s tray. Heals 20%. Free; the turn goes on. One per turn.'); else if(r&&r.bag) b2Msg('Snacks and throwables from the shared pockets.'); else if(r&&r.praise) { const f=b2LiveFoes().find(x=>x.D.praise); b2Msg(f&&f.D.praise.need?r.name+' Free. Tell '+f.def.the+' what it never hears. '+(f.takes||0)+' of '+f.D.praise.need+' so far.':r.name+' Free. Say something nice. It counts as a favorite kind move.'); } else if(r) b2Msg('Leave this fight.'); }
  else if(B2.ui==='target') b2Msg((B2.pending&&B2.pending.name?B2.pending.name+': ':'')+'pick a target. A to confirm, B to go back.');
  else if(B2.ui==='bag') { const r=b2BagRows()[B2.sel]; if(r) b2Msg(r.it.name+'. '+r.it.desc); }
  else if(B2.ui==='tombo') { const r=b2TomboRows(u)[B2.sel]; if(r) b2Msg(r.T.name+' ('+r.T.cost+'% HEART). '+(r.why||r.T.desc)); else b2Msg('Tombos are Tom plus one partner. They unlock as the story goes.'); }
  else if(B2.ui==='inspect') { const f=b2LiveFoes()[B2.sel]; if(f) b2Msg(b2InspectText(f)); }
  else if(B2.ui==='cross') {
    // A boss winding up gets top billing, so the hint is there when it matters.
    const boss=b2LiveFoes().find(f=>f.intent||f.st.staggered);
    if(boss&&boss.st.staggered) b2Msg(cap(boss.def.the)+' is STAGGERED: it loses its turn and takes 50% more. Hit it hard!');
    else if(boss&&boss.intent.kind==='cut') { const n=b2NextUp(); b2Msg('CUT! is coming. '+(n?n.name+' is next on the ribbon and would lose that turn. ':'')+'TNB’s WARDROBE makes someone Fresh (immune).'); }
    else if(boss&&boss.intent.kind==='dig') b2Msg('DIG UP is coming: '+boss.def.the+' will eat its buried acorn and heal. Break the Acorn Cache first. Nara digs it up for double.');
    else if(boss&&boss.intent.kind==='broil') b2Msg('BROIL is coming: '+boss.def.the+' hits everyone next turn. One Splash hit cools her down and calls it off. Or heal up after.');
    else if(boss&&boss.intent.kind==='page') { const W=boss.weak.map(e=>B2_ELEMS[e].name).join(' or '); b2Msg('PAGE TURN is coming: '+boss.def.the+' changes chapters next turn. It is weak to '+W+' right now. Hit it with that while you can.'); }
    else if(boss&&boss.intent.kind==='heal') b2Msg('Take Two is coming: '+boss.def.the+' will heal itself. Hit it hard now, or say GREAT TAKE! (▼).');
    else if(boss&&boss.intent.kind==='lock'&&boss.boss==='mirrorball') b2Msg('SOLO is coming for '+boss.intent.target.name+'. '+(b2Tom()&&boss.intent.target.id!=='tom'?'Tom can DEFEND them. ':'')+'Her mirror side is '+B2_ELEMS[boss.mirror].name+' now: anything else gets through.');
    else if(boss&&boss.intent.kind==='lock') b2Msg('Lock-on! '+cap(boss.def.the)+' will '+boss.intent.act.name+' '+boss.intent.target.name+' next.'+(b2Tom()&&boss.intent.target.id!=='tom'?' Tom can DEFEND.':''));
    else if(boss) b2Msg(cap(boss.def.the)+' will hit everyone next.'+(boss.shield?' Break its guard: '+(boss.shield.need-boss.shield.hits)+' more '+boss.shield.elems.map(e=>B2_ELEMS[e].name).join(' or ')+' hits.':' Heal up or GRUMBLE.'));
    else if(b2LiveFoes().some(f=>f.call&&b2Alive(f.call)&&f.call.st.boarding)) { const c=b2LiveFoes().find(f=>f.call).call; b2Msg('NOW BOARDING: '+c.name+'. '+(c===u?'You are called: anything you do now boards you (+2 VP).':c.name+' must act before the Last Call’s next turn, or the gate closes on them.'+(u.id==='tom'?' DEFEND them to walk them on.':''))); }
    else if(b2LiveFoes().some(f=>f.mirror)) { const m=b2LiveFoes().find(f=>f.mirror); b2Msg(u.name+'’s turn. MIRROR SIDE: '+B2_ELEMS[m.mirror].name.toUpperCase()+'. Those hits bounce back; anything else gets through.'); }
    else b2Msg(u.name+'’s turn. ▲ '+u.kit.basic.name+'  ▶ Skills  ◀ Tombo  ▼ Care & Bag  B Inspect'+b2TraitHint(u));
  }
}

// ---------- Choosing ----------
function b2Choose(act) {
  const u=B2.actor;
  if(b2Cost(u,act)>u.vp) { sfx.nope(); b2Msg('Not enough VP. '+act.name+' costs '+act.vp+'; '+u.name+' has '+u.vp+'.'); return; }
  if(b2Shushed(u,act)) { sfx.nope(); b2Msg(u.st.silenced&&u.kit.skills.includes(act)?u.name+' is Silenced: no skills for now. ▲ basic moves and ▼ Care & Bag still work.':u.name+' is Shushed and cannot use Chatter moves right now.'); return; }
  const opts=b2TargetOptions(act,u);
  if(!opts.length) { sfx.nope(); b2Msg('Nobody to use that on.'); return; }
  sfx.select();
  if(u.kit.skills.includes(act)) B2.lastSkill[u.id]=act;
  if(opts.length===1) { b2Do(act,opts[0]); return; }
  B2.pending=act; B2.opts=opts; B2.prevUi=B2.ui; B2.prevSel=B2.sel;
  let s=0; if(!opts[0].ally&&B2.lastTarget) { const k=opts.findIndex(o=>o.targets.includes(B2.lastTarget)); if(k>=0) s=k; }
  b2Open('target',s);
}
function b2Cross(d) {
  const u=B2.actor;
  if(d==='up') b2Choose(u.kit.basic);
  else if(d==='right') { if(!u.kit.skills.length) { sfx.nope(); return; } sfx.select(); b2Open('skills'); }
  else if(d==='left') { sfx.select(); b2Open('tombo'); }
  else if(d==='down') { sfx.select(); b2Open('care'); }
}
function b2Pick(i) {
  const u=B2.actor;
  if(B2.ui==='skills') { const s=u.kit.skills[i]; if(s) { B2.sel=i; b2Choose(s); } }
  else if(B2.ui==='care') {
    const r=b2CareRows(u)[i]; if(!r) return;
    if(r.act) b2Choose(r.act);
    else if(r.crust) b2EatCrust(u);
    else if(r.praise) {
      const opts=b2LiveFoes().filter(f=>f.D.praise).map(f=>({label:f.name,targets:[f],primary:f}));
      if(!opts.length) { sfx.nope(); return; }
      const act={praise:true,name:r.name,weight:'standard'}; sfx.select();
      if(opts.length===1) { b2Do(act,opts[0]); return; }
      B2.pending=act; B2.opts=opts; B2.prevUi='care'; B2.prevSel=i; b2Open('target',0);
    }
    else if(r.bag) { if(r.no) { sfx.nope(); b2Msg(r.sub); return; } sfx.select(); b2Open('bag'); }
    else if(r.run) { sfx.select(); b2Do({run:true,weight:'standard'},null); }
  } else if(B2.ui==='bag') {
    const r=b2BagRows()[i]; if(!r) return;
    const it=r.it,act={item:r.id,name:it.name,weight:'standard'};
    let opts;
    if(it.revive) opts=B2.party.filter(p=>p.hp<=0).map(p=>({label:p.name,targets:[p],primary:p,ally:true}));
    else if(it.dmg||it.confuse||it.atkDown) opts=b2LiveFoes().map(f=>({label:f.name,targets:[f],primary:f}));
    else if(it.pep||it.healAll) opts=[{label:'WHOLE PARTY',targets:b2LiveParty().filter(p=>b2Eats(p,it)),ally:true}];
    else opts=b2LiveParty().filter(p=>b2Eats(p,it)).map(p=>({label:p.name,targets:[p],primary:p,ally:true}));
    if(it.revive&&!opts.length) { sfx.nope(); b2Msg('Nobody is knocked out. Save the whistle.'); return; }
    if(!opts.length||!opts[0].targets.length) { sfx.nope(); b2Msg(b2LiveParty().some(p=>p.id==='nara')&&!it.dogOk?'Nara sniffs the '+it.name+' and turns her head away. She only eats Chicken Jerky.':'Nobody to use that on.'); return; }
    sfx.select(); B2.pending=act; B2.opts=opts; B2.prevUi='bag'; B2.prevSel=i;
    if(opts.length===1) { b2Do(act,opts[0]); return; }
    b2Open('target',0);
  } else if(B2.ui==='tombo') {
    const r=b2TomboRows(u)[i]; if(!r) return;
    B2.sel=i;
    if(r.why) { sfx.nope(); b2Msg(r.T.name+': '+r.why); return; }
    const opts=b2TargetOptions(r.T,u);
    if(!opts.length) { sfx.nope(); b2Msg('Nobody to use that on.'); return; }
    sfx.select();
    if(opts.length===1) { b2Do(r.T,opts[0]); return; }
    B2.pending=r.T; B2.opts=opts; B2.prevUi='tombo'; B2.prevSel=i;
    let s=0; if(B2.lastTarget) { const k=opts.findIndex(o=>o.targets.includes(B2.lastTarget)); if(k>=0) s=k; }
    b2Open('target',s);
  } else if(B2.ui==='inspect') { sfx.move(); b2Open('cross'); }
  else if(B2.ui==='target') { const o=B2.opts[i]; if(o) { sfx.select(); b2Do(B2.pending,o); } }
}
// Inspect (B on the command cross, or tap the portrait in the middle): what makes each enemy grumpy and how to cheer it up.
function b2Inspect() {
  if(!b2LiveFoes().length) return;
  sfx.select(); b2Open('inspect',0);
}
function b2Back() {
  if(battle.state!=='command') { b7Tap(true); return; }
  if(B2.ui==='cross') { b2Inspect(); }
  else if(B2.ui==='skills'||B2.ui==='care'||B2.ui==='tombo'||B2.ui==='inspect') { sfx.move(); b2Open('cross'); }
  else if(B2.ui==='bag') { sfx.move(); b2Open('care',b2CareRows(B2.actor).findIndex(r=>r.bag)); }
  else if(B2.ui==='target') { sfx.move(); const p=B2.prevUi||'cross'; B2.pending=null; b2Open(p,B2.prevSel||0); }
}
function b2Move(d) {
  const n=B2.ui==='skills'?B2.actor.kit.skills.length:B2.ui==='care'?b2CareRows(B2.actor).length:B2.ui==='bag'?b2BagRows().length:
    B2.ui==='tombo'?b2TomboRows(B2.actor).length:B2.ui==='inspect'?b2LiveFoes().length:B2.opts.length;
  if(!n) return;
  const grid=B2.ui==='skills'||B2.ui==='bag';
  let s=B2.sel;
  if(grid) { if(d==='left') s-=1; else if(d==='right') s+=1; else if(d==='up') s-=2; else s+=2; s=(s+n)%n; }
  else s=(s+(d==='up'||d==='left'?n-1:1))%n;
  B2.sel=s; sfx.move(); b2Render();
}

// Pointer hover moves the cursor without rebuilding the buttons under the finger.
function b2Hover(i) {
  B2.sel=i;
  document.querySelectorAll('#b2-cmd .b2-btn[data-i]').forEach(b=>b.classList.toggle('sel',Number(b.dataset.i)===i));
  b2RenderRibbon(); b2RenderParty(); b2Info();
}

// ---------- Input: touch, keyboard, gamepad ----------
function b2Dir(d) {
  if(!B2.active||battle.state!=='command') return;
  if(B2.ui==='cross') b2Cross(d); else b2Move(d);
}
function b2A() {
  if(!B2.active) return;
  if(battle.state!=='command') { b7Tap(); return; }   // High-Five, or closing the victory card
  if(B2.ui==='cross') b2Cross('up'); else b2Pick(B2.sel);
}
function b2Key(e) {
  const c=e.code,dirs={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'};
  if(c==='KeyL') { if(!e.repeat) toggleLayout(); return; }
  if(c==='KeyF') { if(!e.repeat) b7ToggleSpeed(); return; }   // 1x / 2x
  if(c==='KeyR') { if(!e.repeat) b7ToggleAuto(); return; }    // Smart Repeat
  if(dirs[c]) { e.preventDefault(); if(!e.repeat||B2.ui!=='cross') b2Dir(dirs[c]); }
  else if((c==='Enter'||c==='Space')&&!e.repeat) { e.preventDefault(); b2A(); }
  else if((c==='Escape'||c==='Backspace'||c==='KeyX')&&!e.repeat) { e.preventDefault(); b2Back(); }
}
function b2Pad(dir,dirEdge,A,B) {
  if(dirEdge&&dir) b2Dir(dir);
  if(A) b2A(); else if(B) b2Back();
}
(function b2Wire() {
  const ui=$('b2-ui'); if(!ui) return;
  ui.addEventListener('click',e=>{
    if(!B2.active||battle.state!=='command') return;
    const x=e.target.closest('.b2-x'); if(x) { b2Cross(x.dataset.d); return; }
    if(e.target.closest('[data-insp]')) { if(B2.ui==='cross') b2Inspect(); return; }
    const bk=e.target.closest('[data-back]'); if(bk) { b2Back(); return; }
    const b=e.target.closest('.b2-btn'); if(b&&b.dataset.i!=null) { b2Pick(Number(b.dataset.i)); return; }
    // Tap a party card to target that ally.
    const pc=e.target.closest('.b2-pc');
    if(pc&&B2.ui==='target') { const u=B2.party[Number(pc.dataset.i)],k=B2.opts.findIndex(o=>o.targets.length===1&&o.targets[0]===u); if(k>=0) b2Pick(k); }
  });
  ui.addEventListener('pointerover',e=>{
    if(!B2.active||battle.state!=='command') return;
    const b=e.target.closest('.b2-btn'); if(b&&b.dataset.i!=null&&Number(b.dataset.i)!==B2.sel) b2Hover(Number(b.dataset.i));
  });
})();
