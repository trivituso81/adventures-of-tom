'use strict';
// engine/battle-draw.js — Drawing the battle scene, animations and effects.

// ---------- Battle backdrops ----------
// Tom's pixel-art pictures live in bgs/ (576x324 PNGs, one per place). battleBgKey picks the picture from the map's
// ground (or, in the Battle Lab, from the B2.lab* flags). If a picture has not loaded yet, the older code-drawn
// backdrops in the render files (engine/*-render.js, drawLABattleBg / drawLEBattleBg) and the pond code below are used.
const BG_FILES={pond:'01-pond-town',griffith:'02-griffith-park',classroom:'03-school-classroom',cafe:'04-school-cafetorium',
  stacks:'05-library-stacks',readroom:'06-library-reading-room',club:'07-moon-club',dome:'08-moon-club-dome',barn:'09-car-barn',
  boiler:'10-boiler-room',term:'11-terminal-zero',gate:'12-gate-zero',lot:'13-studio-backlot',stage:'14-soundstage',
  park:'15-oak-park',oak:'16-inside-the-oak',canopy:'17-oak-crown-canopy'};
const BG_IMG={};
for(const k in BG_FILES) { const im=new Image(); im.src='bgs/'+BG_FILES[k]+'.png'; BG_IMG[k]=im; }
function battleBgKey() {
  const g=currentMap&&currentMap.style&&currentMap.style.ground,L=B2.active?B2:{};
  if(L.labLA||regionOf(currentMap)==='la') {
    if(g==='barn'||g==='boiler') return g;
    if(g==='lot'||g==='backlot') return 'lot';
    if(g==='stage') return 'stage';
    if(g==='park'||g==='oak'||g==='canopy') return g;
    if(L.labBarn) return L.labBoiler?'boiler':'barn';
    if(L.labStudio) return 'lot';
    if(L.labOak) return L.labCrown?'canopy':'park';
    return 'griffith';
  }
  if(g==='gate'||L.labGate) return 'gate';
  if(g==='term'||L.labTerm) return 'term';
  if(g==='dome'||(L.labClub&&L.labDome)) return 'dome';
  if(g==='club'||L.labClub) return 'club';
  if(g==='readroom'||(L.labStacks&&L.labRead)) return 'readroom';
  if(g==='stacks'||L.labStacks) return 'stacks';
  if(g==='cafe'||(L.labSchool&&L.labCafe)) return 'cafe';
  if(g==='school'||g==='schoolyard'||L.labSchool) return 'classroom';
  return 'pond';
}
function drawBattleBackdrop(t) {
  // The Glass Tower (chapters 17 and 18) has code-drawn backdrops (engine/ch17-render.js, ch18-render.js); there is no picture for it, so it must come before the picture lookup.
  if(typeof glGround==='function'&&glGround(currentMap)&&typeof drawLEBattleBg==='function'&&drawLEBattleBg(t)) return;
  const im=BG_IMG[battleBgKey()];
  if(im&&im.complete&&im.naturalWidth) { gfx.imageSmoothingEnabled=false; gfx.drawImage(im,0,0,192,108); return; }
  // Fallback while a picture loads: the code-drawn backdrops.
  if((B2.active&&B2.labLA)||regionOf(currentMap)==='la') drawLABattleBg(t);
  else if(typeof drawLEBattleBg==='function'&&drawLEBattleBg(t)) {}   // engine/school-render.js: Long Island Elementary
  else {
  rect(0,0,192,108,'#2d5a4c');
  for(let i=0;i<6;i++) rect(0,i*11,192,11,['#3a6f5c','#3f7762','#467f68','#4c876d','#528f72','#589677'][i]);
  rect(0,66,192,42,'#8fb07a');
  rect(0,66,192,2,'#a7c58c');
  for(let i=0;i<40;i++) { const n=hash(i,7); rect((n%192),70+(n>>>8)%34,1,2,'#789b64'); }
  ellipse(44,92,34,9,'#729b9a');
  ellipse(44,91,30,7,'#83b4b2');
  rect(20+((Math.floor(t*2))%4),89,6,1,'#bbd9c9');
  rect(52-((Math.floor(t*2))%4),94,5,1,'#69a09e');
  for(const [x,y] of [[8,56],[176,52],[150,58]]) {
    rect(x-2,y+4,4,10,'#807354');
    rect(x-8,y-10,16,16,'#547f58');
    rect(x-10,y-5,20,10,'#648c5e');
  }
  }
}

function drawBattle() {
  gfx=fightCtx;
  const party=battlePartyList();   // the new battle (engine/battle2.js) draws its own party units here
  const t=battle.time;
  gfx.save();
  gfx.scale(3,3);
  drawBattleBackdrop(t);
  gfx.restore();
  RFX.draw(true);

  b2DrawEnemies(t);

  // Party, drawn back to front. Each member lunges toward the enemy on attack.
  // Tom is drawn last while blocking so he stands in front of whoever he is shielding.
  const order=party.map((_,i)=>i);
  if(battle.block) { const ti=party.findIndex(p=>p.id==='tom'); if(ti>=0) { order.splice(order.indexOf(ti),1); order.push(ti); } }
  if(battle.v2) b2RideOrder(order,party);   // Rose sits on Tom's shoulders (engine/battle2-traits.js)
  battle.drawnAt=battle.drawnAt||[];
  order.forEach(i=>{
    const m=party[i],sp=BATTLE_SPRITES[m.id],pos=BATTLE_POS[i],fx=battle.fx[i];
    activeTint=garmentTint('bt',m.id,memberTopColor(m));
    const lunge=fx.lunge>0?Math.sin(Math.PI*(1-fx.lunge/.6)):0;
    const breathe=alive(m)?Math.floor(t*1.6+i)%2:0;
    const hurt=alive(m)&&m.hp/m.maxHp<=.25;
    const punching=lunge>.35||fx.punch>0;
    const twirling=fx.twirl>0,spinFrame=Math.floor(t*10)%2===1;
    const cheering=fx.cheer>0,cheerStep=Math.floor(t*8)%4;
    if(!cheering) fx.levelUp=false;
    const cheerFrame=cheering?(sp.cheer?sp.cheer[cheerStep%sp.cheer.length]:(sp.celeb?[sp.celeb,sp.celebFlip,sp.celeb,sp.idle][cheerStep]:[sp.idle,sp.flip,sp.idle,sp.flip][cheerStep])):null;
    const dancing=twirling&&sp.celeb,danceStep=Math.floor(t*9)%8;
    const danceFrame=dancing?[sp.celeb,sp.flip,sp.celebFlip,sp.idle,sp.expr,sp.celeb,sp.flip,sp.celebFlip][danceStep]:null;
    const silly=fx.tongue>0&&sp.celeb;
    const sillyStep=Math.floor(t*8)%6;
    const sillyFrame=silly?[sp.celeb,sp.celebFlip,sp.expr,sp.idle,sp.flip,sp.celeb][sillyStep]:null;
    const guarding=m.id==='tom'&&m.guard&&alive(m)&&!punching;
    const coaching=fx.coach>0&&sp.celeb,hugging=fx.hug>0&&sp.celeb,grumbling=fx.grumble>0,burpee=fx.burpee>0;
    const coachFrame=coaching?[sp.celeb,sp.expr,sp.celeb,sp.idle][Math.floor(t*6)%4]:null;
    const burpeeFrame=burpee?(Math.floor(t*6)%2?sp.kneel:sp.celeb):null;
    const running=fx.run>0;
    const runFrame=running?(sp.run?sp.run[Math.floor(t*12)%2]:(Math.floor(t*14)%2?sp.expr:sp.idle)):null;
    const approaching=fx.appr>0&&sp.run&&!punching&&!running;
    const tossing=fx.toss>0&&sp.wind,aiming=fx.aim>0&&sp.aim;
    let frame=punching?sp.act:(cheering?cheerFrame:(silly?sillyFrame:(dancing?danceFrame:(twirling?(spinFrame?sp.flip:sp.idle):((guarding&&sp.defend)?sp.defend:((hurt||guarding)?sp.kneel:sp.idle))))));
    if(approaching) { const e=fx.apprDur-fx.appr; frame=(e<.7||fx.appr<.35)?sp.run[Math.floor(t*12)%2]:sp.idle; }
    if(tossing) frame=fx.toss>.45?sp.wind:sp.throw;
    if(aiming&&!approaching) frame=sp.aim;
    if(fx.cast>0&&sp.aim) frame=sp.aim;
    { const inRun=approaching&&((fx.apprDur-fx.appr)<.7||fx.appr<.35); if(fx.pose>0&&sp[fx.poseK]&&!inRun) frame=sp[fx.poseK]; }
    if(coachFrame) frame=coachFrame; else if(hugging) frame=sp.spread||sp.celeb; else if(grumbling) frame=sp.sit||sp.kneel; else if(burpeeFrame) frame=burpeeFrame; else if(runFrame) frame=runFrame;
    // Knocked out (0 HP): crumples to a slumped kneel, bruised and dazed. koE is seconds since they went down.
    const down=!alive(m)&&!fx.path;
    if(down) { if(fx.koAt==null||fx.koAt>t) fx.koAt=t<.3?t-9:t; }
    else if(fx.koAt!=null) { fx.koAt=null; if(alive(m)) fx.hop=.35; }
    const koE=down?t-fx.koAt:0;
    let koSink=0;
    if(down) {
      frame=koE<.16?sp.idle:koFrame(sp);
      koSink=koE<.16?Math.round(koE/.16*8):-Math.round(Math.max(0,Math.sin(Math.min(1,(koE-.16)/.3)*Math.PI))*5);
    }
    if(!down&&battle.v2&&roseSeatBattle(m,i,frame,sp,fx,hurt,t)) { activeTint=null; return; }   // sitting on Tom (engine/rose-ride.js)
    const w=frame[0].length*sp.scale,h=frame.length*sp.scale;
    let hop=cheering?Math.round(Math.abs(Math.sin(t*8))*20):dancing?Math.round(Math.abs(Math.sin(t*9))*16):(twirling?Math.round(Math.abs(Math.sin(t*9))*10):(silly?Math.round(Math.abs(Math.sin(t*10))*22):0));
    if(coaching) hop=Math.round(Math.abs(Math.sin(t*7))*14);
    if(burpee&&burpeeFrame===sp.celeb) hop=Math.round(Math.abs(Math.sin(t*12))*24);
    if(fx.hop>0) hop=Math.round(Math.abs(Math.sin(t*9))*18);
    if(m.id==='tom'&&battle._seat&&battle._seat.hop) hop+=battle._seat.hop;   // Rose bounces on his shoulders: he lifts with her (engine/rose-ride.js)
    let appr=0;
    if(fx.appr>0) { const e=fx.apprDur-fx.appr; appr=e<.7?Math.min(1,e/.7):(fx.appr<.35?fx.appr/.35:1); }
    let cx=pos.x*3-Math.round(lunge*(pos.x*3-250))-Math.round(appr*(pos.x*3-(m.id==='rose'?236:262)))+(fx.shake>0?rand(-5,5):0)+(fx.tongue>0?Math.round(Math.sin(t*22)*2):0)+(dancing?Math.round(Math.sin(t*4.5)*16):0);
    let base=pos.base*3+breathe-Math.round(lunge*12)-hop;
    base+=koSink;
    if(m.id==='tom'&&battle.block) {
      // Slide to a spot just in front of the shielded girl, hold, then slide back.
      const b=battle.block,pr=b.t/b.dur;
      const k=pr<.15?pr/.15:(pr>.82?(1-pr)/.18:1);
      const tp=BATTLE_POS[b.target];
      cx=Math.round(cx+(tp.x*3-46-cx)*k);
      base=Math.round(base+(tp.base*3+4-base)*k);
    }
    const origX=pos.x*3,origBase=pos.base*3;
    if(i===battle.actor) battle.actorPos={cx,base,h};
    let rot=0,frameOverride=null,noShadow=false;
    if(running) {
      // Shuttle runs straight through the Grump and back, once per pass.
      const q=1-fx.run/fx.runDur,u=(q*fx.runPasses)%1,tx=70;
      cx=Math.round(origX+(tx-origX)*Math.sin(u*Math.PI));
      base=origBase-Math.round(Math.abs(Math.sin(t*16))*6);
      if(battle.hill) base-=Math.round(Math.max(0,1-Math.pow((cx-168)/80,2))*46);
      const dirL=u<.5;
      for(let k=0;k<4;k++) rect(cx+(dirL?w/2+6+k*8:-w/2-14-k*8),base-h*.6+k*9,12-k*2,2,'rgba(255,246,220,'+(.6-k*.13)+')');
      if(!dirL) frameOverride=sp.runFlip?sp.runFlip[Math.floor(t*12)%2]:sp.flip;
    }
    if(fx.handspring>0) { const q=1-fx.handspring/.8; rot=-q*Math.PI*4; base-=Math.round(Math.abs(Math.sin(q*Math.PI*2))*18); frameOverride=sp.idle; }
    if(fx.roundoff>0) { const q=1-fx.roundoff/.6; rot=-q*Math.PI*2; base-=Math.round(Math.sin(q*Math.PI)*12); frameOverride=sp.idle; }
    if(fx.rebound>0) { const q=1-fx.rebound/.45; frameOverride=sp.flip; base-=Math.round(Math.sin(q*Math.PI)*26); cx+=Math.round(Math.sin(q*Math.PI/2)*34); }
    if(fx.flip>0) { const q=1-fx.flip/.8; rot=q*Math.PI*2; base-=Math.round(Math.sin(q*Math.PI)*78); frameOverride=sp.idle; noShadow=q>.15&&q<.85; }
    if(fx.dismount>0) {
      const D=1.5,q=1-fx.dismount/D,tx=172,ty=196;
      if(q<.4) { const u=q/.4; cx=Math.round(origX+(tx-origX)*u*.35); base=origBase-Math.round(Math.sin(u*Math.PI/2)*200); rot=-u*Math.PI*4; }
      else if(q<.6) { const u=(q-.4)/.2; cx=Math.round(origX+(tx-origX)*(.35+.65*u)); base=Math.round(origBase-200+(ty-(origBase-200))*u); }
      else if(q<.8) { cx=tx; base=ty-Math.round(Math.abs(Math.sin((q-.6)/.2*Math.PI))*6); }
      else { const u=(q-.8)/.2; cx=Math.round(tx+(origX-tx)*u); base=Math.round(ty+(origBase-ty)*u)-Math.round(Math.sin(u*Math.PI)*40); }
      frameOverride=sp.idle; if(q<.6) noShadow=true;
    }
    if(fx.pogo>0) {
      const D=1.5,q=1-fx.pogo/D,tx=236;
      if(q<.7) { const u=q/.7; cx=Math.round(origX+(tx-origX)*u); const air=Math.abs(Math.sin(u*Math.PI*3)); base=origBase-Math.round(air*46); frameOverride=air>.25?sp.celeb:sp.idle; }
      else { const u=(q-.7)/.3; cx=Math.round(tx+(origX-tx)*u); base=origBase-Math.round(Math.sin(u*Math.PI)*34); frameOverride=sp.idle; }
    }
    if(fx.flop>0) {
      const D=1.8,q=1-fx.flop/D,tx=186;
      if(q<.3) { const u=q/.3; base=origBase-Math.round(u*u*460); cx=Math.round(origX+(tx-origX)*u); frameOverride=sp.celeb; noShadow=true; }
      else if(q<.55) { base=origBase-460; cx=tx; noShadow=true; }
      else if(q<.62) { const u=(q-.55)/.07; base=Math.round(origBase-460+(214-(origBase-460))*u); cx=tx; rot=Math.PI/2; noShadow=true; }
      else if(q<.85) { cx=tx; base=214; rot=Math.PI/2; }
      else { const u=(q-.85)/.15; cx=Math.round(tx+(origX-tx)*u); base=Math.round(214+(origBase-214)*u)-Math.round(Math.sin(u*Math.PI)*40); }
      if(!frameOverride) frameOverride=sp.idle;
    }
    // Generic path: a move sets fx.path={t,dur,fn}; fn(q,ctx) returns any of {cx,base,rot,frame,sc,noShadow,hide}.
    let pathSc=1,hidden=false;
    if(fx.path) {
      const P=fx.path,r=P.fn(Math.min(1,P.t/P.dur),{origX,origBase,sp,t,cx,base})||{};
      if(r.cx!=null) cx=Math.round(r.cx); if(r.base!=null) base=Math.round(r.base); if(r.rot!=null) rot=r.rot;
      if(r.frame) frameOverride=r.frame; if(r.sc!=null) pathSc=r.sc; if(r.noShadow) noShadow=true; if(r.hide) hidden=true;
      if(i===battle.actor) battle.actorPos={cx,base,h};
    }
    if(hidden) return;
    if(battle.v2&&m.id==='rose'&&fx.path&&!rot&&!down&&roseSeatNear(...(B2.aim&&i===battle.actor?b2WarpPt(cx,base):[cx,base]))&&roseSeatBattle(m,i,frameOverride||frame,sp,fx,hurt,t,true)) { activeTint=null; return; }
    { const rp=b2RidePos(m,i); if(rp) { cx=rp.cx; base=rp.base; noShadow=true; } }
    // While a move is aimed at enemies away from the old Grump spot, the actor's body follows the same warp as the scene.
    if(B2.aim&&i===battle.actor) { const wp=b2WarpPt(cx,base); cx=Math.round(wp[0]); base=Math.round(wp[1]); }
    const x=cx-w/2-(punching&&!sp.noShift?sp.scale*3:0),y=base-h;
    battle.drawnAt[i]={cx,base,h,x,w};
    if(!noShadow) ellipse(cx,base+3,w*.55*pathSc,6*pathSc,'rgba(47,73,54,.3)');
    if(down) drawKnockedOut(m,i,sp,frame,x,y,cx,base,koE,t,fx);
    else if(rot!==0||pathSc!==1||((fx.pogo>0||fx.flop>0||fx.dismount>0||fx.rebound>0||fx.path)&&frameOverride)) {
      const fr2=frameOverride||sp.idle,w2=fr2[0].length*sp.scale,h2=fr2.length*sp.scale;
      gfx.save(); gfx.translate(cx,base-h2/2*pathSc); gfx.scale(pathSc,pathSc); gfx.rotate(rot);
      rideBodyDraw(m,fr2,sp.pal,-w2/2,-h2/2,sp.scale,{flash:fx.flash>0});
      gfx.restore();
      if(fx.flop>0&&rot!==0) { const q=1-fx.flop/1.8; if(q>.62&&q<.75) for(let k=0;k<6;k++) { const a=k*1.05,r=20+(q-.62)*300; ellipse(cx+Math.cos(a)*r,base-4-Math.abs(Math.sin(a))*r*.3,7,4,'rgba(230,220,190,.7)'); } }
    } else if(fx.cartwheel>0) {
      const ang=-(1-fx.cartwheel/.9)*Math.PI*2;
      const lift=Math.round(Math.sin((1-fx.cartwheel/.9)*Math.PI)*14);
      gfx.save(); gfx.translate(cx,base-h/2-lift); gfx.rotate(ang);
      drawSprite(sp.idle,sp.pal,-w/2,-h/2,sp.scale,{});
      gfx.restore();
    } else if(fx.kick>0) {
      // Flying kick: whole body horizontal, feet first into the Grump, speed lines trailing.
      const k=fx.kick/.45,lift=Math.round(h*.45)+Math.round(k*10);
      const kcx=cx-Math.round((1-k)*10);
      for(let i=0;i<4;i++) rect(kcx+h/2+8+i*9,base-lift-10+i*7,14-i*2,2,'rgba(255,246,220,'+(.7-i*.15)+')');
      gfx.save(); gfx.translate(kcx,base-lift); gfx.rotate(Math.PI/2);
      drawSprite(sp.idle,sp.pal,-w/2,-h/2,sp.scale,{flash:fx.flash>0});
      gfx.restore();
      if(k>.5) { label('*',kcx-h/2-14,base-lift-18,'#ffe08a',3); label('*',kcx-h/2-22,base-lift+6,'#fff6c8',2); }
    } else {
      const poking=(fx.poke>0||fx.tickle>0)&&sp.expr;
      const wig=fx.tickle>0?Math.round(Math.sin(t*30)*3):0;
      const fr3=running&&frameOverride?frameOverride:(poking?sp.expr:frame);
      activeKneelCut=fr3===sp.kneel&&!sp.noShift?Math.round(sp.idle.length*.62):0;
      rideBodyDraw(m,fr3,sp.pal,(poking?x-sp.scale*3:x)+wig,y+(fx.tickle>0?Math.abs(wig):0),sp.scale,{flash:fx.flash>0,alpha:1,lean:guarding?-7:0});
      activeKneelCut=0;
      if(sp.handAt) RFX.postParty(i,sp,fr3,(poking?x-sp.scale*3:x)+wig,y+(fx.tickle>0?Math.abs(wig):0));
    }
    if(battle.v2) roseSeatFront(m);   // Rose's shoes on Tom's shoulders
    if(coaching) {
      // Whistle sparks over the coach, and little arrows over everyone she is firing up.
      label(Math.floor(t*6)%2?'!':'!!',cx,y-22,'#ffe08a',3);
      party.forEach((p,j)=>{ if(j===i||!alive(p)) return; const q=BATTLE_POS[j]; const yy=q.base*3-BATTLE_SPRITES[p.id].idle.length*BATTLE_SPRITES[p.id].scale-14-Math.round(Math.abs(Math.sin(t*8+j))*8); label('^',q.x*3,yy,'#ffe08a',3); });
    }
    if(hugging&&m.id==='deedee') {
      for(let k=0;k<7;k++) {
        const ph=(t*1.2+k/7)%1,hx=cx-70+k*24+Math.round(Math.sin(t*5+k)*6),hy=y+10-Math.round(ph*70);
        gfx.globalAlpha=1-ph; label('<3',hx,hy,k%2?'#ff9ac0':'#ffd3e0',2); gfx.globalAlpha=1;
      }
    }
    if(grumbling) {
      const q=Math.floor(t*3)%3;
      label(['UGH','MY STOMACH','TOO FAST'][q],cx,y-20,'#fff1cb',2);
      label('...',172,120-Math.round(Math.abs(Math.sin(t*4))*4),'#fff1cb',3);
    }
    if(fx.combo>0&&m.id==='tom') {
      const seq=['^','^','V','V','<','>','B','A'],shown=Math.min(seq.length,Math.floor((1.3-fx.combo)/.13)+1);
      for(let k=0;k<shown;k++) { const ix=cx-56+k*16,iy=y-30+(k===shown-1?-3:0); rect(ix-6,iy-3,13,13,OUT); rect(ix-5,iy-2,11,11,k===shown-1?'#ffe08a':'#fff1cb'); label(seq[k],ix,iy+1,'#27473d',1); }
    }
    if(fx.controller>0&&m.id==='tom') {
      const gx=x+Math.round(w*.2),gy=y+Math.round(h*.6);
      // Forearms and hands first, so the controller sits in front of them.
      const skin='#e2b59e',skinD='#c59277';
      rect(gx-9,gy+9,12,7,OUT); rect(gx-8,gy+10,10,5,skin); rect(gx-8,gy+14,10,1,skinD);
      rect(gx+23,gy+9,12,7,OUT); rect(gx+24,gy+10,10,5,skin); rect(gx+24,gy+14,10,1,skinD);
      rect(gx-7,gy-1,10,12,OUT); rect(gx-6,gy,8,10,skin); rect(gx-6,gy+8,8,2,skinD);
      rect(gx+23,gy-1,10,12,OUT); rect(gx+24,gy,8,10,skin); rect(gx+24,gy+8,8,2,skinD);
      rect(gx-2,gy-2,30,16,OUT); rect(gx,gy,26,12,'#e6e6e2'); rect(gx+2,gy+2,22,8,'#2a2b32');
      rect(gx+4,gy+4,4,4,'#cfcfcf'); rect(gx+16,gy+3,3,3,'#e06c5a'); rect(gx+20,gy+5,3,3,'#5c8fe0'); rect(gx+18,gy+7,3,3,'#6cc070');
      rect(gx+11,gy+1,4,2,Math.floor(t*8)%2?'#8fd0ff':'#2f6fb0');
      rect(gx+11,gy-6,4,4,'rgba(143,208,255,'+(.3+.3*Math.sin(t*12))+')');
    }
    if(guarding) {
      // A faint shield arc in front of the stance.
      const k=.5+.5*Math.sin(t*6);
      gfx.strokeStyle='rgba(241,213,140,'+(.25+.25*k)+')';
      gfx.lineWidth=3;
      gfx.beginPath();
      gfx.arc(cx+6,base-h*.5,h*.55,Math.PI*.65,Math.PI*1.35);
      gfx.stroke();
    }
    if(cheering) {
      for(let k=0;k<6;k++) {
        const ph=(t*1.6+k/6)%1,sx=cx-34+k*14+Math.round(Math.sin(t*6+k)*5),sy=y-4-Math.round(ph*52);
        gfx.globalAlpha=1-ph; label(k%2?'+':'*',sx,sy,k%3?'#ffe08a':'#fff6c8',2); gfx.globalAlpha=1;
      }
      if(fx.levelUp) label('LEVEL UP',cx,y-26-Math.round(Math.abs(Math.sin(t*8))*6),'#ffe08a',2);   // only real level-ups; heals and Nara's wiggles reuse the cheer without it
    }
    if(dancing) {
      const dc=['#ff9ac0','#ffe08a','#9be39a','#8fd0ff','#c9b3e6'];
      ellipse(cx,base+4,40,12,dc[Math.floor(t*6)%dc.length]+'88');
      ellipse(cx,base+4,24,7,dc[(Math.floor(t*6)+2)%dc.length]+'aa');
      for(let k=0;k<4;k++) {
        const ph=(t*1.4+k*.25)%1,nx=cx-40+k*28+Math.round(Math.sin(t*5+k)*6),ny=y-10-Math.round(ph*48);
        gfx.globalAlpha=1-ph;
        rect(nx,ny,3,10,'#2b1d2b'); ellipse(nx,ny+10,4,3,'#2b1d2b'); rect(nx+3,ny,5,3,'#2b1d2b');
        gfx.globalAlpha=1;
      }
    }
    if(silly) {
      // Stars orbiting her head and question marks over the Grump.
      for(let k=0;k<3;k++) {
        const ang=t*7+k*2.1,sx=cx+Math.round(Math.cos(ang)*26),sy=y-6+Math.round(Math.sin(ang)*9);
        label('+',sx,sy,k%2?'#ffe08a':'#fff6c8',2);
      }
      const q=Math.floor(t*6)%2;
      label('?',168+q*10,150-Math.round(Math.abs(Math.sin(t*8))*8),'#fff1cb',3);
      label('?',120-q*8,160-Math.round(Math.abs(Math.cos(t*7))*8),'#ffe08a',2);
    }
    if(fx.tongue>0&&sp.mouth&&!punching&&!twirling&&(!silly||sillyStep===3||sillyStep===4)) {
      // Tongue sticks out sideways toward the Grump and wiggles.
      const len=3+Math.floor((Math.sin(t*18)+1)*1.5);
      const tx=x+sp.mouth.col*sp.scale,ty=y+sp.mouth.row*sp.scale;
      rect(tx-len*sp.scale-sp.scale,ty-sp.scale*.5,(len+1)*sp.scale,sp.scale*3,'#3a2a2a');
      rect(tx-len*sp.scale,ty,len*sp.scale,sp.scale*2,'#e8829b');
      rect(tx-len*sp.scale,ty,len*sp.scale,sp.scale*.7,'#f4a6b8');
      rect(tx-len*sp.scale+sp.scale,ty+sp.scale*.7,sp.scale*.6,sp.scale*1.3,'#c9607e');
    }
    if(hurt&&!punching&&!sp.hires) {
      const ey=(sp.eyeAt&&sp.eyeAt.get(frame))||sp.eye;
      const bx=x+ey.col*sp.scale-sp.scale,by=y+ey.row*sp.scale-sp.scale;
      rect(bx,by,sp.scale*3,sp.scale*3,'rgba(96,52,130,.55)');
      rect(bx+sp.scale*.5,by+sp.scale*.5,sp.scale*2,sp.scale*2,'rgba(40,20,64,.7)');
    }
    activeTint=null;
  });
  if(battle.v2) rideFlush();   // Rose still shows if Tom was hidden this frame (engine/rose-ride.js)

  gfx.save(); b2WarpCtx();
  if(battle.laser) {
    const L=battle.laser,pr=L.t/L.dur;
    const bx=168,width=pr<.3?Math.round(pr/.3*22):Math.round(22*(1-(pr-.3)/.7));
    if(width>0) {
      rect(bx-width,0,width*2,262,'rgba(140,220,255,.55)');
      rect(bx-Math.max(1,width/2),0,Math.max(2,width),262,'#ffffff');
      rect(bx-width-4,0,4,262,'rgba(140,220,255,.25)'); rect(bx+width,0,4,262,'rgba(140,220,255,.25)');
    }
    if(pr>.25) {
      const f=1-Math.min(1,(pr-.25)/.5);
      ellipse(bx,262,70*f+20,16*f+6,'rgba(200,240,255,'+(.6*f)+')');
      for(let k=0;k<10;k++) { const a=k*.63+L.t*3,r=20+pr*70; rect(bx+Math.cos(a)*r,262-Math.abs(Math.sin(a))*r*.8,4,4,k%2?'#ffffff':'#8fd0ff'); }
      gfx.globalAlpha=.35*f; rect(0,0,576,324,'#eaffff'); gfx.globalAlpha=1;
    }
  }
  if(battle.fireball) {
    const F=battle.fireball,q=F.t/F.dur,sx=372,sy=226,ex=200,ey=220;
    const fxp=Math.round(sx+(ex-sx)*q),fyp=Math.round(sy+(ey-sy)*q-Math.sin(q*Math.PI)*20);
    for(let k=3;k>=1;k--) ellipse(fxp+k*14,fyp+k*2,14-k*3,10-k*2,'rgba(255,'+(140+k*30)+',60,'+(.35-k*.08)+')');
    ellipse(fxp,fyp,16,13,'#ff8c3a'); ellipse(fxp-2,fyp-1,10,8,'#ffd166'); ellipse(fxp-4,fyp-2,5,4,'#fff6c8');
    for(let k=0;k<5;k++) rect(fxp+10+k*6+Math.round(Math.sin(F.t*40+k)*3),fyp-8+k*4,3,3,k%2?'#ffd166':'#ff8c3a');
  }
  if(battle.tetris) {
    const Tt=battle.tetris,q=Tt.t/Tt.dur,cell=24,bx=130;
    const landY=262-cell*3;
    const by=q<.45?Math.round(-cell*3+(landY+cell*3)*(q/.45)):landY;
    if(q<.75) {
      for(const [cxm,cym] of [[0,0],[0,1],[0,2],[1,2]]) { rect(bx+cxm*cell,by+cym*cell,cell,cell,OUT); rect(bx+cxm*cell+2,by+cym*cell+2,cell-4,cell-4,'#5c8fe0'); rect(bx+cxm*cell+2,by+cym*cell+2,cell-4,4,'#9cc3ff'); rect(bx+cxm*cell+2,by+cym*cell+cell-8,cell-4,6,'#3c67b0'); }
    }
    if(q>=.45&&q<.8) { const f=1-(q-.45)/.35; gfx.globalAlpha=.8*f; rect(0,landY,576,cell*3,'#ffffff'); gfx.globalAlpha=1; }
  }
  if(battle.hose) {
    // A stream from the party side to the Grump, with droplets flying off.
    const Hs=battle.hose,q=Hs.t/Hs.dur,ap=battle.actorPos||{cx:400,base:276,h:100},sx=ap.cx-14,sy=ap.base-Math.round(ap.h*.45),ex2=175,ey2=215;
    const reach=q<.2?q/.2:1,fade=q>.8?(1-q)/.2:1;
    gfx.globalAlpha=fade;
    const x2=sx+(ex2-sx)*reach,y2=sy+(ey2-sy)*reach;
    gfx.strokeStyle=Hs.color; gfx.lineWidth=14; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(sx,sy); gfx.quadraticCurveTo((sx+x2)/2,Math.min(sy,y2)-30,x2,y2); gfx.stroke();
    gfx.strokeStyle=Hs.light; gfx.lineWidth=5; gfx.beginPath(); gfx.moveTo(sx,sy-3); gfx.quadraticCurveTo((sx+x2)/2,Math.min(sy,y2)-33,x2,y2-3); gfx.stroke();
    if(reach>=1) for(let k=0;k<9;k++) { const a=k*.7+Hs.t*5,r=14+((Hs.t*60+k*9)%40); rect(ex2+Math.cos(a)*r,ey2-Math.abs(Math.sin(a))*r*.8,4,4,k%2?Hs.light:Hs.color); }
    gfx.globalAlpha=1;
  }
  gfx.restore();
  RFX.draw(false);
  b2DrawOverlay(t);
  for(const q of (battle.props||[])) {
    if(q.t<0) continue;
    const u=Math.min(1,q.t/q.dur);
    const fixed=q.kind==='line';
    const px=fixed?q.x0:q.x0+(q.x1-q.x0)*u,py=fixed?q.y0:q.y0+(q.y1-q.y0)*u-(q.arc?Math.sin(u*Math.PI)*q.arc:0);
    gfx.save(); b2WarpCtx(); gfx.translate(Math.round(px),Math.round(py)); if(q.spin) gfx.rotate(u*Math.PI*3);
    drawProp(q,u);
    gfx.restore();
  }
  for(const tx of battle.texts) {
    const q=tx.t/tx.dur,sc=q<.12?Math.max(1,Math.round(tx.sc*q/.12)):tx.sc;
    gfx.save(); gfx.scale(3,3); gfx.globalAlpha=q>.75?(1-q)/.25:1;
    label(tx.txt,tx.x+1,tx.y-Math.round(q*10)+1,'#1b2d27',sc); label(tx.txt,tx.x,tx.y-Math.round(q*10),tx.color,sc);
    gfx.restore(); gfx.globalAlpha=1;
  }
  gfx.save(); b2WarpCtx();
  if(battle.boop) {
    const B=battle.boop,pr=B.t/B.dur;
    const sc=pr<.15?2+Math.round(pr/.15*3):5,yy=96-Math.round(pr*40);
    const wob=Math.round(Math.sin(B.t*18)*4);
    gfx.globalAlpha=pr>.8?(1-pr)/.2:1;
    label('BOOP!!!',214+wob+2,yy+2,'#2b1d2b',sc);
    label('BOOP!!!',214+wob,yy,Math.floor(B.t*10)%2?'#ffe08a':'#ff9ac0',sc);
    gfx.globalAlpha=1;
  }
  if(battle.slash>0) {
    const k=1-battle.slash/.22;
    gfx.strokeStyle='rgba(255,246,220,'+(1-k)+')';
    gfx.lineWidth=7;
    gfx.beginPath();
    gfx.arc(177,200,50+k*15,-1.1+k*.3,1.3+k*.3);
    gfx.stroke();
    gfx.strokeStyle='rgba(255,220,140,'+(1-k)*.8+')';
    gfx.lineWidth=3;
    gfx.beginPath();
    gfx.arc(177,200,42+k*15,-1+k*.3,1.2+k*.3);
    gfx.stroke();
  }
  gfx.restore();

  gfx.save();
  gfx.scale(3,3);
  for(const p of battle.pops) {
    const y=p.y-Math.round(p.t*18),w=String(p.text).length*4-1,x=Math.max(w/2+1,Math.min(191-w/2,p.x));   // kept on screen
    label(p.text,x+1,y+1,'#1b2d27');
    label(p.text,x,y,p.color);
  }
  gfx.restore();
  gfx=ctx;
}

// A moving actor reserves both its departure tile and its destination.
function occupied(a,x,y) {
  return (a.x===x&&a.y===y) ||
    !!(a.move&&a.move.tx===x&&a.move.ty===y);
}

function canOccupy(map,x,y,who) {
  if(!walkable(map,x,y) ||
     (!who.isPlayer&&map.npcNoGo.has(key(x,y)))) return false;

  if(who!==player&&map===currentMap&&occupied(player,x,y)) return false;
  if(!who.follower&&!who.isPlayer&&map===currentMap)
    for(const f of followers) if(occupied(f,x,y)) return false;

  for(const n of map.npcs)
    if(n!==who&&occupied(n,x,y)) return false;

  return true;
}

function directionTo(dx,dy) {
  return Math.abs(dx)>Math.abs(dy)
    ? (dx<0?'left':'right')
    : (dy<0?'up':'down');
}

function startMove(a,dir) {
  a.facing=dir;
  const d=DIR[dir],x=a.x+d.x,y=a.y+d.y;
  if(!canOccupy(currentMap,x,y,a)) return false;
  a.move={fx:a.x,fy:a.y,tx:x,ty:y,elapsed:0,duration:a.duration};
  return true;
}

function advanceMove(a,dt) {
  if(!a.move) return true;
  const m=a.move;
  m.elapsed+=dt;
  a.walkClock+=dt;
  if(m.elapsed+1e-8<m.duration) return false;
  a.x=m.tx;
  a.y=m.ty;
  a.move=null;
  return true;
}

function position(a) {
  if(a.scr) return {x:a.scr.x,y:a.scr.y};
  if(!a.move) return {x:a.x,y:a.y};
  const m=a.move,t=clamp(m.elapsed/m.duration,0,1);
  return {
    x:m.fx+(m.tx-m.fx)*t,
    y:m.fy+(m.ty-m.fy)*t
  };
}

function findPath(map,a,goal) {
  const size=map.w*map.h,prev=new Int16Array(size);
  prev.fill(-1);
  const queue=new Int16Array(size);
  const start=a.y*map.w+a.x,end=goal.y*map.w+goal.x;
  let head=0,tail=0;
  queue[tail++]=start;
  prev[start]=start;

  const dirs=directionNames.slice();
  const shift=Math.floor(Math.random()*4);
  dirs.push(...dirs.splice(0,shift));

  while(head<tail) {
    const at=queue[head++];
    if(at===end) break;
    const x=at%map.w,y=Math.floor(at/map.w);

    for(const name of dirs) {
      const d=DIR[name],nx=x+d.x,ny=y+d.y;
      if(!within(map,nx,ny)) continue;
      const next=ny*map.w+nx;
      if(prev[next]!==-1||!canOccupy(map,nx,ny,a)) continue;
      prev[next]=at;
      queue[tail++]=next;
    }
  }

  if(prev[end]===-1) return [];
  const path=[];
  for(let at=end;at!==start;at=prev[at])
    path.push({x:at%map.w,y:Math.floor(at/map.w)});
  return path.reverse();
}

function choosePath(n) {
  const candidates=currentMap.wanderSpots.filter(p=>{
    const d=Math.abs(p.x-n.x)+Math.abs(p.y-n.y);
    return d>1&&d<=n.roam;
  });

  for(let i=0;i<5&&candidates.length;i++) {
    const p=pick(candidates);
    if(!canOccupy(currentMap,p.x,p.y,n)) continue;
    const route=findPath(currentMap,n,p);
    if(route.length) {
      n.path=route;
      return;
    }
  }
  n.idle=.5+Math.random();
}

function updateNPCs(dt) {
  for(const n of currentMap.npcs) {
    if(n.held) continue;   // moved by a cutscene (engine/story.js); the scene steps it
    if(n.move&&!advanceMove(n,dt)) continue;
    if(n.monster) { b7MonsterTick(n,dt); continue; }   // wandering monsters (engine/feel.js)

    if(n.path.length) {
      const next=n.path.shift();
      if(!startMove(n,directionTo(next.x-n.x,next.y-n.y))) {
        n.path=[];
        n.idle=.3+Math.random()*.8;
      }
      continue;
    }

    n.idle-=dt;
    if(n.idle<=0) {
      choosePath(n);
      n.idle=1.2+Math.random()*2.5;
    }
  }
}

function moveInput() {
  if(input.touchDir) return input.touchDir;
  if(input.padDir) return input.padDir;
  if(input.mouseDir) return input.mouseDir;
  let result=null;
  for(const dir of input.keys.values()) result=dir;
  return result;
}

function beginTransition(portal) {
  queuedAction=false;
  if(portal.kind==='enter') sfx.doorIn(); else if(portal.kind==='edge') sfx.travel(); else sfx.doorOut();
  transition={portal,phase:0,time:0,alpha:0};
}

function switchMap(portal) {
  const house=portal.house;

  if(portal.kind==='enter') {
    currentMap=worlds[house.enterMap||house.id];
    player.x=currentMap.spawn.x;
    player.y=currentMap.spawn.y;
    player.facing='up';
    const firstVisit=!visited.has(house.id);
    visited.add(house.id);
    showToast(house.shop?house.name+'\nBuy, sell, browse. Talk to '+(house.keeper||'Penny')+'.':(house.taxi?house.name+'\nOne driver. One cab. Big plans.':house.name+'\nOne resident. Four curious things.'),2.8);
    if(firstVisit&&souvenirs[house.id])
      setTimeout(()=>grantItem(souvenirs[house.id]),3000);
  } else if(portal.kind==='edge') {
    const to=worlds[portal.to]||town;
    currentMap=to;
    player.x=portal.spawn.x;
    player.y=portal.spawn.y;
    player.facing=portal.facing;
    showToast(to.name+'. '+(to.tag||''),2.8);
  } else {
    currentMap=worlds[house.area]||town;
    player.x=house.door.x;
    player.y=house.door.y+1;
    player.facing='down';
    showToast('Back out on '+currentMap.name+'.',1.7);
  }

  player.move=null;
  player.walkClock=0;
  placeFollowers();
  refreshAreaUI();

  if(regionOf(currentMap)==='le'&&doorCount('le').seen>=doorCount('le').total&&!allVisited) {
    allVisited=true;
    setTimeout(()=>sfx.allDoors(),600);
    showToast('All '+doorCount('le').total+' doors explored. Certified local busybody.',4);
  }
  if(portal.kind==='enter'&&house.region==='la'&&doorCount('la').seen===doorCount('la').total&&!laAllShown) {
    laAllShown=true;
    setTimeout(()=>sfx.allDoors(),600);
    showToast('All '+doorCount('la').total+' LA doors explored. Basically a local now.',4);
  }

  resize();
  camera.snap=true;
  saveGame('auto',true);
}

// Doors explored in one town (le or la).
let laAllShown=false;
function doorCount(region) { const list=houses.filter(h=>h.region===region); return {seen:list.filter(h=>visited.has(h.id)).length,total:list.length}; }
// Header, eyebrow, door count and minimap for whatever map is current.
function refreshAreaUI() {
  $('area-name').textContent=currentMap.name;
  $('eyebrow').textContent=currentMap.outside
    ? (currentMap.eyebrow||'A POCKET-SIZED PLACE')
    : REGION_NAME[regionOf(currentMap)]+' / INDOORS';
  const dc=doorCount(regionOf(currentMap));
  $('visitCount').textContent=dc.seen+' / '+dc.total;
  setMinimapMap(outdoorMapFor(currentMap));
}
function outdoorMapFor(map) {
  if(map.outside) return map;
  const h=houseById[map.id];
  return (h&&worlds[h.area])||town;
}

function updateTransition(dt) {
  const tr=transition;
  tr.time+=dt;

  if(tr.phase===0) {
    tr.alpha=clamp(tr.time/.14,0,1);
    if(tr.time>=.14) {
      switchMap(tr.portal);
      tr.phase=1;
      tr.time=0;
      tr.alpha=1;
    }
  } else {
    tr.alpha=1-clamp(tr.time/.18,0,1);
    if(tr.time>=.18) transition=null;
  }
}

function facingTarget() {
  const d=DIR[player.facing],x=player.x+d.x,y=player.y+d.y;

  for(const n of currentMap.npcs)
    if(occupied(n,x,y)) return {kind:'npc',value:n,x,y};
  for(const f of followers)
    if(!f.move&&f.x===x&&f.y===y) return {kind:'npc',value:f,x,y};

  const o=currentMap.objectAt.get(key(x,y));
  if(o&&o.text) return {kind:'object',value:o,x,y};

  const portal=currentMap.portals.get(key(x,y));
  if(portal) return {kind:'portal',value:portal,x,y};

  return null;
}


// ---------- Knocked out look ----------
// The KO frame: the kneel with the legs folded again, so they sit slumped on the ground.
function koFrame(sp) {
  if(sp._koSrc===sp.kneel) return sp._ko;
  const k=sp.kneel,n=k.length;
  let top=0; while(top<n&&!/[^.]/.test(k[top])) top++;
  const cut=top+Math.round((n-top)*.74);
  const rows=k.slice(0,cut).concat(k.slice(cut).filter((_,i)=>i%2===0));
  sp._ko=rows; sp._koSrc=k; sp._koCut=cut;
  if(sp.eyeAt) sp.eyeAt.set(rows,sp.eyeAt.get(k)||sp.eye);
  if(sp.handAt&&sp.handAt.get(k)) { const h=sp.handAt.get(k),f=p=>[p[0],p[1]>cut?cut+(p[1]-cut)/2:p[1]]; sp.handAt.set(rows,{n:f(h.n),f:f(h.f)}); }
  return rows;
}
// Skin colour of a sprite (nearest palette colour to its skin tone) and the palette keys that are skin.
function koSkin(sp) {
  if(sp._koSkin) return sp._koSkin;
  const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const ref=hx(sp.skin||'#f0b08c'),d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  let best=null,bd=1e9;
  for(const k in sp.pal) { const c=sp.pal[k]; if(!/^#[0-9a-f]{6}$/i.test(c)) continue; const v=d(hx(c),ref); if(v<bd) { bd=v; best=c; } }
  const keys=new Set(); for(const k in sp.pal) { const c=sp.pal[k]; if(/^#[0-9a-f]{6}$/i.test(c)&&d(hx(c),hx(best))<46) keys.add(k); }
  return sp._koSkin={color:best,keys};
}
// Down on hands and knees, head bowed, eyes shut, bruised. The figure is painted upright on a scratch canvas,
// then the legs are drawn as they are and the upper body is tipped forward over them from the hip.
function drawKnockedOut(m,i,sp,frame,x,y,cx,base,koE,t,fx) {
  const K=typeof KO_SPRITES!=='undefined'&&KO_SPRITES[m.id];
  if(K&&frame!==sp.idle) {
    // Traced KO sprite (the family were traced facing right, Nara facing left; mirrored where needed so it faces the enemy like everyone else), on the same ground line; a slow, heavy breath.
    const kw=K.rows[0].length*K.scale,kh=K.rows.length*K.scale,bob=Math.floor(t*1.3+i*.7)%2;
    const rows=K.left||(K.left=m.id==='nara'?K.rows:mirrorRows(K.rows)),kx=Math.round(cx-kw/2),ky=Math.round(base-kh)+bob;
    drawSprite(rows,K.pal,kx,ky,K.scale,{flash:fx.flash>0});
    koDust(cx,base,koE);
    // Dizzy stars circle over the head (the head is the top few rows of the sprite).
    if(!K.head) { let top=0; while(top<rows.length&&!/[^.]/.test(rows[top])) top++; let L=1e9,R=-1;
      for(let r=top;r<Math.min(rows.length,top+6);r++) for(let c=0;c<rows[r].length;c++) if(rows[r][c]!=='.') { L=Math.min(L,c); R=Math.max(R,c); }
      K.head={col:(L+R+1)/2,row:top}; }
    koDizzy(kx+K.head.col*K.scale,ky+K.head.row*K.scale,koE,t,i);
    return;
  }
  const sc=sp.scale,n=frame.length,W=frame[0].length,w=W*sc,h=n*sc;
  const settled=frame!==sp.idle;
  const PAD=40,main=gfx,oc=koFrame.canvas||(koFrame.canvas=document.createElement('canvas'));
  oc.width=Math.ceil(w)+PAD*2; oc.height=Math.ceil(h)+PAD*2;
  const octx=oc.getContext('2d'); octx.imageSmoothingEnabled=false; gfx=octx;
  const lx=PAD,ly=PAD,px=c=>lx+c*sc,py=r=>ly+r*sc;
  activeKneelCut=settled&&!sp.noShift?Math.round(sp.idle.length*.62):0;
  drawSprite(frame,sp.pal,lx,ly,sc,{flash:fx.flash>0});
  activeKneelCut=0; activeTint=null;
  let top=0; while(top<n&&!/[^.]/.test(frame[top])) top++;
  const hip=top+Math.round((n-top)*.6);
  if(settled) {
    const ey=(sp.eyeAt&&sp.eyeAt.get(frame))||sp.eye,er=Math.round(ey.row),ec=Math.round(ey.col);
    const S=koSkin(sp),isSkin=(c,r)=>{ const ch=(frame[r]||'')[c]; return ch&&S.keys.has(ch); };
    // Bruises: round purple marks with a red rim, on bare skin of the arms, legs and face.
    const bruise=(c,r,k)=>{ ellipse(px(c)+sc/2,py(r)+sc/2,sc*2.1*k,sc*1.8*k,'rgba(196,70,96,.45)'); ellipse(px(c)+sc/2,py(r)+sc/2,sc*1.3*k,sc*1.1*k,'rgba(92,36,104,.8)'); ellipse(px(c)+sc*.2,py(r)+sc*.2,sc*.5*k,sc*.4*k,'rgba(150,80,170,.7)'); };
    let seed=7; for(const ch of m.id) seed=(seed*31+ch.charCodeAt(0))>>>0;
    const spots=[];
    for(let r=er+5;r<n-1;r++) for(let c=1;c<W-1;c++) {
      if(!isSkin(c,r)||!isSkin(c-1,r)||!isSkin(c+1,r)) continue;
      const hsh=(Math.imul(c+11,73856093)^Math.imul(r+5,19349663)^seed)>>>0;
      if(hsh%5) continue;
      if(spots.every(([a,b])=>Math.hypot(a-c,b-r)>7)) spots.push([c,r]);
    }
    spots.slice(0,4).forEach(([c,r],k)=>bruise(c,r,k%2?.85:1));
    // Dirt scuffs on the clothes.
    for(let r=er+6;r<n-1;r++) for(let c=1;c<W-2;c++) {
      const ch=frame[r][c]; if(ch==='.'||S.keys.has(ch)||frame[r][c-1]==='.'||frame[r][c+2]==='.') continue;
      const hsh=(Math.imul(c+3,83492791)^Math.imul(r+9,19349663)^seed)>>>0;
      if(hsh%29===0) rect(px(c),py(r),sc*2,sc,'rgba(70,44,26,.5)');
    }
    // Eyes shut: skin over the eye, a dark lid line curving down, a tear.
    rect(px(ec-1),py(er-1),sc*3,sc*3,S.color);
    rect(px(ec-1),py(er),sc*3,sc,'#2a1a1a'); rect(px(ec-1),py(er)-sc*.5,sc,sc*.6,'#2a1a1a');
    ellipse(px(ec+2)+sc/2,py(er+1)+sc/2,sc*1.6,sc*1.3,'rgba(92,36,104,.6)');
    const tear=(t*.6+i*.3)%1; gfx.globalAlpha=1-tear*.6;
    rect(px(ec),py(er+1)+tear*sc*4,sc*.8,sc*1.4,'#9fd6ff'); gfx.globalAlpha=1;
    // A bruise high on the cheek.
    if(isSkin(ec+3,er+3)) bruise(ec+3,er+3,.8);
  }
  gfx=main;
  // Pivot at the hip, the middle of the body on that row.
  let L=W,R=0; for(let c=0;c<W;c++) if((frame[hip]||'')[c]!=='.') { L=Math.min(L,c); R=Math.max(R,c); }
  const pcx=(L+R+1)/2*sc,pcy=hip*sc;
  const ang=settled?-Math.min(1,Math.max(0,(koE-.14)/.35))*.62:0;
  const breath=settled?Math.sin(t*2.6+i)*.03:0;
  const ox=Math.round(cx-w/2),oy=Math.round(base-h);
  // Legs, upright.
  gfx.drawImage(oc,0,PAD+pcy,oc.width,oc.height-PAD-pcy,ox-PAD,oy+pcy,oc.width,oc.height-PAD-pcy);
  // Upper body tipped forward over them.
  gfx.save(); gfx.translate(ox+pcx,oy+pcy+(settled?sc*2:0)); gfx.rotate(ang+breath);
  gfx.drawImage(oc,0,0,oc.width,PAD+pcy+sc*2,-pcx-PAD,-pcy-PAD,oc.width,PAD+pcy+sc*2);
  gfx.restore();
  koDust(cx,base,koE);
  if(settled) koDizzy(ox+pcx,oy+top*sc+8,koE,t,i);
}
// Cartoon dizzy stars: three little pixel stars orbiting a flat ring above the head. The ones behind the head are smaller and dimmer.
const KO_STAR=['..#..','.###.','#####','.###.','.#.#.'];
function koDizzy(hx,hy,koE,t,i) {
  if(koE<.45) return;
  const fade=Math.min(1,(koE-.45)/.4),cy=hy-11,spin=t*3.2+i*1.3;
  const stars=[0,1,2].map(k=>{ const a=spin+k*Math.PI*2/3; return {k,x:hx+Math.cos(a)*21,y:cy+Math.sin(a)*6,front:Math.sin(a)}; }).sort((a,b)=>a.front-b.front);
  gfx.globalAlpha=fade*.35; ellipse(hx,cy,22,6.5,'rgba(255,240,190,.35)'); 
  for(const st of stars) {
    const ps=st.front>0?2.6:1.9,tw=(Math.sin(t*9+st.k*2)+1)/2;
    gfx.globalAlpha=fade*(st.front>0?1:.6);
    const col=st.k===1?'#fff6c8':'#ffd24a',ox=Math.round(st.x-2.5*ps),oy=Math.round(st.y-2.5*ps);
    for(let r=0;r<5;r++) for(let c=0;c<5;c++) if(KO_STAR[r][c]==='#') rect(ox+c*ps,oy+r*ps,ps,ps,(r===1&&c===2)?'#ffffff':col);
    if(tw>.75&&st.front>0) { rect(ox+5*ps+1,oy-2,2,2,'#ffffff'); }
  }
  gfx.globalAlpha=1;
}
function koDust(cx,base,koE) {
  // Dust puff when they hit the ground.
  if(koE>.12&&koE<.8) {
    const q=(koE-.12)/.68;
    gfx.globalAlpha=1-q;
    for(let k=0;k<6;k++) { const dir=k<3?-1:1,d=14+q*38+(k%3)*9; ellipse(cx+dir*d,base+2-(k%3)*4-q*6,8-(k%3),5,'#d8ccb0'); }
    gfx.globalAlpha=1;
  }
}
