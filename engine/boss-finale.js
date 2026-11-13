// Boss endings, step 1 (bossend1, Tom 2026-11-11): after a win a boss stays on the map through its after scene and leaves in a short
// finale built from its existing painted frames; a {finale:'<monster id>'} scene step plays it. Step 2 (art): one ending sheet per boss.
// Kinds: sink (goes down into ground or water), leap (arcs, then sinks), roll (spins away), hop (hops away), walk, drive (speeds off),
// settle (stays; gold light and motes). Leaving kinds end with monsterFall(n,true); settle bosses stay on the map.
// Safety net: a boss left standing with no after scene is moved off the map a few seconds after the battle (bossTick), and at the
// end of any after scene (bossSceneEnd), so a boss never stays behind by accident.
// BOSS_FINALE: one painted ending per boss (bossend3). The frames come from the approved Art Library sheet `ending-<id>` baked by
// tools/sprite-bake/bake_foe_ends.py (FOE_END.<id>, atlas foe_<id>_end). `seq` is a list of phases P(frame,seconds,{...}); numbers may be [from,to].
//   x,y   fraction of the boss's path (0 start, 1 end); path {away:n} n tiles away from the party, or {to:[tx,ty]} an absolute tile
//   lift  fraction of the boss's height off the ground; arc: a lift hump; hop:n: n hops; sink: fraction of the height below the ground line
//   alpha, glow, rot, shake; motes:'#rrggbb' keeps gold-style motes rising; fx: names in BOSS_EFFECT ('k:' kind win only, 'p:' plain win only); sfx: a sound
// react {kind,plain}: the frame shown while the boss speaks. end: 'leave' (monsterFall) or 'stay' (last frame stays to the end of the scene).
const P=(f,d,o)=>Object.assign({f,d},o||{});
const BOSS_FINALE={
  bigone:{end:'stay',path:{to:[15,7]},face:'travel',react:{kind:'laugh'},seq:[P('offer',.9,{sfx:'pickup',fx:'sparkle'}),P('wave',.8),P('dive',1.1,{x:[0,1],arc:.55,lift:[.05,.05]}),P('eyes',1.8,{x:1,fx:['splash','rings'],sfx:'splat'})]},
  bigshake:{end:'stay',react:{kind:'touched'},seq:[P('yawn',1,{shake:.8}),P('half',.9,{fx:'dust'}),P('nearly',.9,{fx:'dust'}),P('mound',1.4,{fx:['dust','gold'],glow:[.6,0]})]},
  irongill:{end:'leave',path:{away:1.6},react:{},seq:[P('give',.8),P('rise',.8,{x:[0,.5],lift:[0,.35]}),P('peak',.8,{x:[.5,.8],lift:[.35,.5],fx:'gold'}),P('dive',.7,{x:[.8,1],lift:[.5,.05]}),P('tail',1.3,{x:1,sink:[0,1.05],fx:['splash','rings','k:hearts'],sfx:'splat'})]},
  directorscut:{end:'leave',path:{away:3.5},react:{kind:'moved'},seq:[P('bow',1),P('wrap',.9,{sfx:'thud'}),P('hop',.6,{x:[0,.15],hop:1}),P('roll',1.5,{x:[.15,1],alpha:[1,.0],fx:'dust'})]},
  redpen:{end:'leave',path:{away:3},react:{kind:'touched'},seq:[P('flourish',1.5,{fx:['k:star','p:check']}),P('shut',.7,{sfx:'thud'}),P('hop',.9,{x:[0,.5],hop:2,fx:'reddots'}),P('look',.7,{x:.5}),P('hop',1,{x:[.5,1],hop:2,alpha:[1,0],fx:'reddots'})]},
  chairman:{end:'leave',path:{away:3.2},react:{},seq:[P('gavel',1,{sfx:'thud',fx:'acorns'}),P('tie',.8),P('farewell',.9),P('leap',1.3,{x:[0,1],arc:.9,alpha:[1,0],fx:'leaves'})]},
  unread:{end:'stay',react:{kind:'delighted'},seq:[P('fan',1.7,{motes:'#ffe08a',glow:[0,.8],fx:'k:hearts'}),P('closing',.9,{glow:[.8,.4]}),P('closed',.9,{glow:.4}),P('book',1,{glow:[.4,.2]})]},
  ironbelly:{end:'stay',react:{kind:'astonished'},seq:[P('lookup',1.7,{motes:'#6fa8ff',glow:[0,.6]}),P('settled',1.5,{motes:'#ffd070',glow:[.6,.35]}),P('baking',1,{glow:.35}),P('settled',.6,{glow:.3})]},
  mirrorball:{end:'stay',react:{kind:'touched'},seq:[P('turn',1),P('letgo',1.5,{glow:[0,1],motes:'#f4f6ff',big:true,fx:'moonrise'}),P('moonlit',2,{glow:[1,.55],motes:'#f4f6ff'})]},
  lastcall:{end:'stay',react:{kind:'answered'},seq:[P('ripple',1,{fx:'bigring'}),P('blank',1),P('give',.8,{sfx:'pickup'}),P('settled',1.3,{glow:[.5,.3],fx:'bigring'})]},
  finalcall:{end:'leave',path:{away:4},react:{kind:'disbelief'},seq:[P('ticket',1.2,{glow:[0,.8],sfx:'pickup'}),P('walk',1.2,{x:[0,.3]}),P('away',1.3,{x:[.3,.6]}),P('lookback',.9,{x:.6}),P('lookback',.7,{x:.6,alpha:[1,0],glow:[0,1],motes:'#ffffff'})]},
  gridlockprime:{end:'leave',path:{away:7},react:{kind:'amazed'},seq:[P('signal',1,{glow:[0,.5],fx:'greenflash'}),P('drive',.9,{x:[0,.25]}),P('away',1.2,{x:[.25,1],alpha:[1,0],fx:'dust'})]},
  drillworm:{end:'stay',react:{kind:'relief',plain:'sorry'},seq:[P('winddown',1.4,{fx:'sparks'}),P('curl',1.1),P('asleep',1.5,{bob:true})]},
  twinlens:{end:'stay',react:{},seq:[P('crack',1.1,{fx:'sparks'}),P('dark',1),P('down',1.3,{motes:'#ffc860',big:true}),P('up',1,{motes:'#ffc860'}),P('asleep',1)]},
  censor:{end:'stay',react:{},seq:[P('lower',1),P('half',1),P('shown',1.5,{motes:'#e8e2d0',big:true}),P('pretzel',1),P('stamp',1,{sfx:'thud'})]},
  leviathan:{end:'stay',react:{},julian:'hat',seq:[P('loose',.9),P('apart',.9),P('nearly',.9),P('clock',1.5,{glow:[0,.8],motes:'#ffd070',big:true})]},
  julian:{end:'stay',react:{},seq:[P('gifts',1),P('lookup',1.2),P('letgo',1.5,{glow:[0,.9],motes:'#ffe08a',big:true}),P('stand',1.5,{glow:[.9,.3]})]}
};
const BOSS_END_FRAMES={};   // id:frame:dir -> rows (a painted ending frame as the map draws it)
function endRows(id,frame,dir) {
  const H=typeof FOE_END!=='undefined'&&FOE_END[id]; if(!H||!H.rows[frame]) return null;
  const aid='foe_'+id+'_end'; if(!H.atlasOn) { paintedAtlas(aid,H.src,H.rects,H.k); H.atlasOn=true; }
  const key=id+':'+frame+':'+(dir==='left'?'L':'R'); if(BOSS_END_FRAMES[key]) return BOSS_END_FRAMES[key];
  let r=paintRows(H.rows[frame].slice(),aid,frame,false); if(dir==='left') r=mirrorRows(r);
  r._pal=H.pal; return BOSS_END_FRAMES[key]=r;
}
function bossFrame(id,frame,dir) {   // show an ending frame on the boss until the scene changes it
  const n=bossActor(id); if(!n||!BOSS_FINALE[id]) return;
  const pp=position(player),bp=position(n); n.scenePose={foe:frame,end:id,dir:dir||(bp.x>pp.x?'left':'right')};
}
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
function bossKind(id) { return !!flag('kind:'+id); }
const BOSS_EFFECT={
  sparkle:(g)=>bossFx(g.x,g.y-g.h*.5,'#fff3b0',12,{speed:40,s:2,dur:1}),
  splash:(g)=>{ bossFx(g.x,g.y,'#bfe6f2',22,{up:true,w:g.h*.5,speed:52,s:2}); bossFx(g.x,g.y,'#ffffff',10,{up:true,w:g.h*.3,speed:60,s:2}); },
  rings:(g)=>{ for(let i=0;i<3;i++) setTimeout(()=>bossRing(g.x,g.y,g.h*(.7+i*.45),'#d8f1fa'),i*260); },
  bigring:(g)=>{ for(let i=0;i<3;i++) setTimeout(()=>bossRing(g.x,g.y-g.h*.4,g.h*(1.2+i*.9),'#ffe9a8'),i*300); },
  dust:(g)=>bossFx(g.x,g.y,'#c9a77a',10,{up:true,w:g.h*.6,speed:30}),
  gold:(g)=>bossFx(g.x,g.y-g.h*.3,'#ffe08a',16,{up:true,w:g.h*.7,speed:36,dur:1.2}),
  sparks:(g)=>bossFx(g.x,g.y-g.h*.4,'#ffd070',10,{speed:60,dur:.6}),
  acorns:(g)=>bossFx(g.x,g.y-g.h*.2,'#b5732e',22,{speed:70,s:3,dur:1.2,lift:30}),
  leaves:(g)=>bossFx(g.x,g.y-g.h*.5,'#e0a030',14,{speed:34,s:3,dur:1.4}),
  reddots:(g)=>bossFx(g.x,g.y,'#d9322a',3,{up:true,speed:6,s:3,dur:1.6}),
  greenflash:(g)=>bossFx(g.x,g.y-g.h*.6,'#7cf08a',16,{speed:50,dur:.7}),
  moonrise:(g)=>{ bossRing(g.x,g.y-g.h*.5,g.h*1.6,'#f4f6ff'); bossFx(g.x,g.y-g.h*.5,'#f4f6ff',30,{up:true,w:g.h*.6,speed:80,s:3,dur:1.6}); },
  star:(g)=>bossFx(g.x,g.y-g.h*.8,'#ffd84a',26,{speed:70,s:3,dur:1.5}),
  check:(g)=>bossFx(g.x,g.y-g.h*.8,'#d9322a',14,{speed:50,s:3,dur:1.2}),
  hearts:(g)=>bossFx(g.x,g.y-g.h*.7,'#ff6f91',9,{up:true,w:g.h*.5,speed:28,s:4,dur:1.5})
};
function bossFinaleStep(id) {
  const spec=BOSS_FINALE[id]; let n=null,t=0,pi=0,pt=0,sx=1,ox=0,oy=0,vx=0,vy=0,h=0,face='right',kind=false,prev={};
  const val=(v,u)=>Array.isArray(v)?v[0]+(v[1]-v[0])*u:v;
  const phase=()=>spec.seq[pi];
  const ground=()=>{ const p=position(n); return {x:Math.round((p.x+.5)*T),y:Math.round((p.y+1)*T-2),h}; };
  const enter=()=>{
    const ph=phase(); pt=0;
    n.scenePose={foe:ph.f,end:id,dir:face};
    if(ph.sfx&&typeof sfx!=='undefined'&&sfx[ph.sfx]) sfx[ph.sfx]();
    for(const fx of [].concat(ph.fx||[])) { if(fx.startsWith('k:')) { if(!kind) continue; } else if(fx.startsWith('p:')) { if(kind) continue; } const nm=fx.replace(/^[kp]:/,''); if(BOSS_EFFECT[nm]) BOSS_EFFECT[nm](ground()); }
  };
  return {
    start() {
      t=0; n=spec?bossActor(id):null;
      if(!n||n.hidden||n.fin||!endRows(id,spec.seq[0].f,'right')) { n=null; return; }
      storyHold(n); n.bossAwait=false; kind=bossKind(id);
      const p=position(n),d=monsterDef(n),pp=position(player); h=((n.scenePose&&n.scenePose.end?endRows(id,n.scenePose.foe,'right'):null)||d.sprite).length*(n.mscale||1);
      ox=p.x; oy=p.y;
      if(spec.path&&spec.path.to) { vx=spec.path.to[0]-ox; vy=spec.path.to[1]-oy; } else if(spec.path&&spec.path.away) { sx=p.x>=pp.x?1:-1; vx=sx*spec.path.away; vy=0; }
      face=(spec.face==='travel'&&vx)?(vx<0?'left':'right'):((spec.path&&spec.path.away)?(vx<0?'left':'right'):(p.x>pp.x?'left':'right'));
      n.fin={}; pi=0; enter();
    },
    update(dt) {
      if(!n) return true;
      pt+=dt; const ph=phase(),u=Math.min(1,pt/ph.d),e=u*u*(3-2*u),F=n.fin;
      const fx=val(ph.x,e),fy=val(ph.y,e);
      if(ph.x!==undefined||ph.y!==undefined) { prev.x=(ph.x!==undefined?fx:prev.x||0); prev.y=(ph.y!==undefined?fy:prev.y||0); }
      n.scr={x:ox+vx*(prev.x||0),y:oy+vy*(prev.x||0)+vy*0};
      let lift=val(ph.lift,e)||0; if(ph.arc) lift+=Math.sin(Math.PI*u)*ph.arc; if(ph.hop) lift+=Math.abs(Math.sin(u*Math.PI*ph.hop))*.22;
      F.lift=lift*h; F.sink=ph.sink?Math.round(val(ph.sink,e)*h):0; F.alpha=ph.alpha!==undefined?val(ph.alpha,u):1; F.glow=ph.glow!==undefined?val(ph.glow,e):(F.glow||0)*.0;
      if(ph.shake) F.lift=(F.lift||0)+Math.sin(pt*70)*ph.shake;
      if(ph.bob) F.lift=(F.lift||0)+Math.sin(pt*3)*1.2;
      if(ph.motes&&Math.random()<dt*(ph.big?70:30)) { const g=ground(); bossFx(g.x,g.y-h*.5,ph.motes,1,{up:true,w:h*.8,speed:30,dur:1.4}); }
      if(u>=1) { pi++; if(pi>=spec.seq.length) { this.finish(); return true; } enter(); }
      return false;
    },
    finish() {
      if(!n) return;
      const last=spec.seq[spec.seq.length-1];
      if(spec.end==='leave') { n.scenePose=null; n.scr=null; n.fin=null; monsterFall(n,true); }
      else { if(!spec.path) n.scr=null;   // a boss that travelled (The Big One dives into the pond) stays where it landed, not back on its start tile (bossbox1)
        n.fin={glow:Math.max(0,last.glow!==undefined?(Array.isArray(last.glow)?last.glow[1]:last.glow):0)*.6}; n.bossSettle=true; }
      if(spec.julian) { const j=bossActor('julian'); if(j&&FOE_END&&FOE_END.julian) bossFrame('julian',spec.julian); }
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
  if(b&&bossLastScene&&/(After|AfterBoss|Calm)$/.test(bossLastScene)) { const bp=position(b),pp=position(player); if(Math.hypot(bp.x-pp.x,bp.y-pp.y)<=14) sceneCam=[(bp.x+pp.x)/2+.5,(bp.y+pp.y)/2+.5];
    const sp=BOSS_FINALE[b.monster]; if(sp) { const rf=bossKind(b.monster)?(sp.react&&sp.react.kind):(sp.react&&sp.react.plain); bossFrame(b.monster,rf||(sp.seq&&FOE_END[b.monster].anchor)||'calm'); } }
  return r;
};
const LE_endIntro_boss=endIntro;
endIntro=function() {
  const after=bossLastScene&&/(After|AfterBoss|Calm)$/.test(bossLastScene);
  LE_endIntro_boss.apply(this,arguments);
  if(after) {
    // A boss that settled stays in frame through the whole after scene; when it ends the chapter's own hide rule (STORY_WORLD) takes over.
    for(const m of Object.values(worlds)) for(const n of m.npcs.slice()) if(n.bossAwait||n.bossSettle) { n.bossAwait=false; n.bossSettle=false; n.fin=null; n.scr=null; n.scenePose=null; monsterFall(n,true); }
    if(typeof storyWorld==='function') storyWorld();
  }
};

// Scripted-actor endings (bossend4): Warden (Boppy), HUSH-9, Marlowe and Brain Freeze change painted frames at set lines of their after scenes.
// {pose:'<name>',foe:'<frame>',end:'<boss id>'} shows an ending frame (people: endPoseDraw below; Brain Freeze is a map monster, so drawActor does it);
// {pose:'<name>'} clears it. {endfx:'<effect>',on:'<name>'} plays a BOSS_EFFECT at the actor's feet. {endprop:{id,f,on,dx,dy,to:[dx,dy],dur,arc,fade}} puts a painted
// loose piece (Warden's pool and helm) on the ground; {endprop:'clear'} removes them.
const ENDPOSE_RATIO={},ENDPOSE_LAST={};   // ratio: ending-frame scale per boss and walk set; last: the scale and visible height the actor was drawn at
const endVis=r=>{ let t=0,b=r.length-1; while(t<b&&!/[^.]/.test(r[t])) t++; while(b>t&&!/[^.]/.test(r[b])) b--; return b-t+1; };
function endPoseDraw(a,set,k,P) {
  const H=typeof FOE_END!=='undefined'&&FOE_END[P.end]; if(!H) return null;
  const rows=endRows(P.end,P.foe,P.dir==='left'?'left':'right'); if(!rows) return null;
  const key=P.end+':'+(a.sheet||a.paletteName||a.name),anc=endRows(P.end,H.anchor,'right');
  const ratio=ENDPOSE_RATIO[key]||(ENDPOSE_RATIO[key]=endVis(set.down[0])/endVis(anc));
  const kd=k*ratio; ENDPOSE_LAST[P.end]={k:kd,h:endVis(anc)*kd};
  return {rows,k:kd,pal:rows._pal,story:true};
}
const BOSS_PROPS=[];
function bossActorByName(n) { return sceneActor(n)||bossActor(n); }
function bossGround(a,id) { const p=position(a),L=ENDPOSE_LAST[id]; return {x:Math.round((p.x+.5)*T),y:Math.round((p.y+1)*T-2),h:L?L.h:T*2.4}; }
SCENE_OPS.camboss=o=>S.call(()=>{ const a=bossActorByName(o.camboss); if(!a) return; const bp=position(a),pp=position(player); if(Math.hypot(bp.x-pp.x,bp.y-pp.y)<=14) sceneCam=[(bp.x+pp.x)/2+.5,(bp.y+pp.y)/2+.5]; });   // frame a person-boss with the party (the map-monster bosses get this from the playScene wrapper)
SCENE_OPS.endfx=o=>S.call(()=>{ const a=bossActorByName(o.on); if(!a||!BOSS_EFFECT[o.endfx]) return; BOSS_EFFECT[o.endfx](bossGround(a,(a.scenePose&&a.scenePose.end)||o.id||a.monster)); });
SCENE_OPS.endprop=o=>S.call(()=>{
  if(o.endprop==='clear') { BOSS_PROPS.length=0; return; }
  const q=o.endprop,a=bossActorByName(q.on); if(!a) return; const p=position(a);
  BOSS_PROPS.push({id:q.id,f:q.f,x0:p.x+q.dx,y0:p.y+q.dy,x1:p.x+(q.to?q.to[0]:q.dx),y1:p.y+(q.to?q.to[1]:q.dy),t0:performance.now(),dur:q.dur||0,arc:q.arc||0,fade:q.fade||0,dir:q.dir||'right'});
  if(q.sfx&&typeof sfx!=='undefined'&&sfx[q.sfx]) setTimeout(()=>sfx[q.sfx](),(q.dur||0)*1000*.9);
});
const LE_b7DrawMapFx_props=b7DrawMapFx;
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_props(time);
  if(!BOSS_PROPS.length) return;
  const now=performance.now();
  for(let i=BOSS_PROPS.length-1;i>=0;i--) { const q=BOSS_PROPS[i],t=(now-q.t0)/1000,u=q.dur?Math.min(1,t/q.dur):1,e=u*u*(3-2*u);
    if(q.fade&&t>q.dur+q.fade) { BOSS_PROPS.splice(i,1); continue; }
    const rows=endRows(q.id,q.f,q.dir),L=ENDPOSE_LAST[q.id]; if(!rows||!L) continue;
    const x=(q.x0+(q.x1-q.x0)*e+.5)*T,y=(q.y0+(q.y1-q.y0)*e+1)*T-2-Math.sin(Math.PI*u)*q.arc*T,w=rows[0].length*L.k,h=rows.length*L.k;
    gfx.globalAlpha=q.fade&&t>q.dur?Math.max(0,1-(t-q.dur)/q.fade):1;
    drawSprite(rows,rows._pal,Math.round(x-w/2),Math.round(y-h),L.k); gfx.globalAlpha=1; }
};
Object.assign(BOSS_EFFECT,{
  softrings:(g)=>{ ['#ffb3c7','#bfe6a8','#a9d4ff'].forEach((c,i)=>setTimeout(()=>bossRing(g.x,g.y-g.h*.55,g.h*(.9+i*.5),c),i*280)); },
  amberdrain:(g)=>bossFx(g.x,g.y-g.h*.35,'#e8a23a',16,{up:true,w:g.h*.3,speed:14,s:3,dur:1.8}),
  mist:(g)=>bossFx(g.x,g.y-g.h*.5,'#d6efff',22,{up:true,w:g.h*.7,speed:24,s:3,dur:1.6})
});
const endIntro_props=endIntro; endIntro=function() { BOSS_PROPS.length=0; return endIntro_props.apply(this,arguments); };
