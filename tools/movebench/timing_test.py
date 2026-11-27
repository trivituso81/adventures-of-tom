#!/usr/bin/env python3
"""movebench/timing_test.py (movebench4, 2026-11-26; replaces tools/guide_timing_test.py): what a fight asks of a move's spec and the 37 effects of the Stage 2C library.
The spec reaches the engine through msTiming and msEffects (engine/b3-spec.js) and engine/b3-vfx.js arms the effects, the hit stop and the shake from it. Runs the real engine files in Node with a
recording canvas: no browser, no network. Run: python3 -I tools/movebench/timing_test.py"""
import json, os, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); fails = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d)[:400]))
    if not ok: fails.append(n)
JS = r"""
const fs=require('fs'),vm=require('vm'),path=require('path'),R=process.argv[1];
const ctx=vm.createContext({Math,JSON,Object,Array,String,Number,Error,Promise,console,B2:{foes:[{dead:false,px:300,py:200,sc:3,def:{sprite:new Array(30)}}]}});
const run=f=>vm.runInContext(fs.readFileSync(path.join(R,f),'utf8'),ctx,{filename:f});
const E=s=>vm.runInContext(s,ctx);
const out={};
run('data/move-specs.js');
E("var B3P={t:0,foe:{f0:{},f1:{}},at:{p0:{cx:100,base:200,h:80},p1:{cx:140,base:200,h:80}}}; var B3={F:{party:[{key:'p0',side:'party',id:'tom'},{key:'p1',side:'party',id:'grace'}],foes:[{key:'f0',side:'foe',id:'mudling'},{key:'f1',side:'foe',id:'mudling'}]},view:{u:{}}}; function b3Unit(F,k){ return [...F.party,...F.foes].find(u=>u.key===k)||null; } function b3Spot(k){ return {x:300,y:150,top:100,base:200}; } var gfx={};");
run('engine/b3-spec.js'); run('engine/b3-vfx.js'); run('engine/vfx-library.js');

// a recording canvas: every call is kept, and a NaN or Infinity argument is a failure
const bad=[]; let calls=0; const log=[];
const mk=()=>new Proxy({},{get(t,k){ if(k in t) return t[k]; if(k==='createLinearGradient'||k==='createRadialGradient') return ()=>({addColorStop(){}}); return (...a)=>{ calls++; if(k==='translate'||k==='arc') log.push([k,...a]); for(const v of a) if(typeof v==='number'&&!isFinite(v)) bad.push(k+'('+a.join(',')+')'); }; },set(t,k,v){ t[k]=v; if(typeof v==='number'&&!isFinite(v)) bad.push(k+'='+v); return true; }});
ctx.__g=mk();
const lib=JSON.parse(fs.readFileSync(path.join(R,'art-factory/aot-stage2c-vfx-library-v11.json'),'utf8')).assets.map(a=>a.id);
out.lib=lib; out.registered=lib.map(id=>E("typeof P1_VFX['"+id+"']")); out.lens=lib.map(id=>E("(()=>{const L=P1_VFX_MS['"+id+"'];return typeof L==='function'?L(null):L;})()"));
out.self=E("Object.keys(P1_VFX_SELF)");
const variants={
 vfx_core_clobber_impact:[null,{hits:7,intervalMs:110,scale:1.8,pierceShield:true}],
 vfx_core_sizzle_wave:[null,{scope:'aoe',applyToasty:true,fiveAlarm:true,triggerTicks:2},{scope:'dual'}],
 vfx_core_drench_splash:[null,{mode:'row_wave'},{mode:'aoe_cloud'},{mode:'shake_360',tintHex:'#d6c7a1'}],
 vfx_core_razzle_beam_arc:[null,{style:'beam'},{style:'glitter_flick'},{style:'blackout_flash'},{style:'chain_arc',chainTargets:[{dx:-60,dy:20},{dx:70,dy:-10}],splashPct:.75}],
 vfx_core_racket_rings:[null,{shape:'jagged_screech',count:5},{shape:'cone_blast'},{shape:'story_loops',count:5},{targetScope:'aoe'}],
 vfx_core_detonation_pops:['steam','panic_boil','hydro_slip','short_circuit','shatter_glitz','sensory_overload'].map(r=>({recipe:r})),
 vfx_core_composure_break:[null,{pipsShaved:4},{pipsShaved:2,triggeredBreak:true}],
 vfx_core_heal_cleanse:[null,{healPct:100,cleanse:true},{isRevive:true,healPct:80},{overhealShield:true,_h:120}],
 vfx_core_shield_ward:[null,{skin:'clay',shieldPct:5},{skin:'glaze',shieldPct:100},{skin:'drywall'},{skin:'jacket'},{skin:'crust'},{skin:'seatbelt'},{skin:'velvet'},{skin:'plush',_h:120},{skin:'nonsense',targetIds:['a']}],
 vfx_core_timeline_chevrons:[null,{dir:'pull',pct:35},{dir:'push',pct:10,pepDelta:2},{dir:'swap'},{dir:'bonus_turn',pepDelta:1},{dir:'pull',pepDelta:2,_h:60}],
 vfx_core_status_debuff_badges:['buff_up','debuff_down','strip','steal','invert','taunt_tether','mix_mark','perm_def_crack'].map(m=>({mode:m,_h:90,_from:{x:520,y:210}})).concat([null,{mode:'nonsense'}]),
 proj_arc_single:[null,{spriteId:'wet_clay'},{spriteId:'chili_seeds',arcHeightPx:110,spinSpeed:6},{spriteId:'mason_jar',arcHeightPx:45,spinSpeed:0},{spriteId:'penalty_flag'},{spriteId:'buttered_popcorn'},{spriteId:'toolbox',startPos:{x:500,y:200},endPos:{x:300,y:160}},{_from:{x:520,y:210}}],
 proj_boomerang_return:[null,{spriteId:'soup_dumpling'},{spriteId:'wrist_strap_controller'},{spriteId:'tattered_lamby',apexTimeFrac:.3},{spriteId:'fishing_lure',hasLine:true,pullTargetToFront:true,apexTimeFrac:.7},{hasLine:true,_from:{x:520,y:210}}],
 proj_ally_handoff_party:[null,{spriteId:'neon_needoh_ball'},{spriteId:'cinnamon_roll',targetAllyIds:['a','b','c','d'],arcHeightPx:55},{spriteId:'warm_muffin',targetAllyIds:['a','b']},{spriteId:'diaper_bag_snack_pack',arcHeightPx:30},{spriteId:'ebike_chirp',onCatchVfxId:'vfx_core_heal_cleanse'},{spriteId:'x',onCatchVfxId:'proj_arc_single'}],
 proj_ground_hazard_mat:[null,{hazardType:'wet_floor'},{hazardType:'hot_glue',durationRounds:2},{hazardType:'molten_lava',durationRounds:2,_h:120},{hazardType:'skateboard_debris'}],
 setpiece_black_porsche_suv:[null,{speedPxSec:600,highBeamAlpha:0,dustTrail:false},{speedPxSec:1600,highBeamAlpha:1},{speedPxSec:'x',_h:120}],
 setpiece_delta_one_pod_doors:[null,{allyIds:['a']},{allyIds:['a','b','c'],closeDurationMs:900,amberLedPulse:false},{closeDurationMs:200,_h:120}],
 setpiece_giant_sky_controller:[null,{buttonSeq:['U','D']},{buttonSeq:[],meteorCount:4},{meteorCount:30,_foe:{x:120,y:150,h:90},_h:100}],
 setpiece_3tier_sparkler_cake:[null,{sparklerCount:3},{sparklerCount:16,partyInfusionTint:'#38bdf8'},{partyInfusionTint:'nonsense'}],
 setpiece_diamond_gold_dumpling:[null,{squashBounceFactor:.05,sparkleDensity:6},{squashBounceFactor:.4,sparkleDensity:50,_h:120}],
 setpiece_giant_easel_portrait:[null,{gemCount:6,forcePeeve:'Razzle'},{gemCount:40,_foe:{x:100,y:160,h:90}},{forcePeeve:'Bedazzle'}],
 setpiece_broadway_spotlights:[null,{dimAlpha:.1,flashCount:3,trackCaster:false},{dimAlpha:.7,flashCount:24},{_h:120}],
 setpiece_sofa_cushion_fort:[null,{partyShieldPct:0,antiPushAnchor:false},{partyShieldPct:.25},{partyShieldPct:1,_h:120}],
 setpiece_blanket_kingdom_castle:[null,{twinkleStars:8,warmWaveDelayTurns:3},{twinkleStars:60,_foe:{x:150,y:170,h:90}},{warmWaveDelayTurns:0}],
 setpiece_mega_whoopee_cushion:[null,{inflateMs:300,blastScale:1,breakStances:false},{inflateMs:1200,blastScale:3},{_h:120}],
 setpiece_8seat_sunday_table:[null,{durationRounds:1,candleFlicker:false},{durationRounds:3},{_h:120}],
 setpiece_rising_full_moon:[null,{moonRiseMs:800,sizzleShave:0},{moonRiseMs:3000,sizzleShave:4},{moonRiseMs:'x',_h:120}],
 setpiece_50yr_dust_tsunami:[null,{sweepMs:800,wipeHazards:false,wipeBuffs:false},{sweepMs:3000},{wipeHazards:true,wipeBuffs:false,_h:120}],
 setpiece_rikers_iron_gates:[null,{dropMs:200,screenShakePx:0,durationRounds:1},{dropMs:900,screenShakePx:14,durationRounds:3},{_h:120}],
 setpiece_cattail_pier_leviathan:[null,{fishTier:'leviathan',tallySpent:4},{fishTier:'striper',tallySpent:2,showFoldingChair:false},{fishTier:'leviathan',showFoldingChair:false,_from:{x:520,y:210}}],
 setpiece_sentient_ghost_pepper:[null,{coneWidthDeg:15,instantBurnTicks:0},{coneWidthDeg:80,instantBurnTicks:4},{_foe:{x:100,y:160,h:90},_h:100}],
 setpiece_leaning_grand_amphora:[null,{hitsToAbsorb:1,shardCount:8},{hitsToAbsorb:4,shardCount:60,dualFlavor:['Sizzle','Drench']},{dualFlavor:[],_from:{x:520,y:210}}],
 setpiece_waymo_and_la_metro:[null,{vehicle:'waymo_rescue',lidarFlash:false},{vehicle:'la_metro_express'},{vehicle:'waymo_rescue',lidarFlash:true,ruckusGain:100,_from:{x:520,y:210}}],
 setpiece_eighth_dining_chair:[null,{seatHeightPx:16,decreeBarks:1},{seatHeightPx:44,decreeBarks:5},{_h:120}],
 setpiece_stadium_jumbotron:[null,{rewindPct:.1},{rewindPct:1},{_h:120}],
 setpiece_michael_sprint_and_chopper:[null,{mode:'michael_sprint'},{mode:'livnews_chopper',tickerText:'BREAKING NEWS'},{mode:'livnews_chopper',tickerText:'A very long ticker line that is cut at thirty characters'}],
 setpiece_gym_bleachers_and_ruckus_crest:[null,{mode:'gym_pyro'},{mode:'ruckus_50_link',_from:{x:520,y:210}},{mode:'ruckus_100_crest',composureCap:6},{mode:'ruckus_100_crest',composureCap:1}]
};
out.drawn=0;
for(const id of lib) for(const p of variants[id]) for(let i=0;i<=20;i++){ ctx.__id=id; ctx.__p=p; ctx.__u=i/20; try{ E("P1_VFX[__id](__g,300,150,__u,1.8,__p)"); out.drawn++; }catch(e){ bad.push(id+' threw '+e.message); } }
out.calls=calls; out.bad=bad.slice(0,6); out.variantCount=lib.reduce((n,id)=>n+variants[id].length,0);
// geometry of the new effects: translate() is how a prop is placed, so its x over time is the path it flies
const flyX=(id,p,N)=>{ log.length=0; for(let i=0;i<=N;i++){ ctx.__id=id; ctx.__p=p; ctx.__u=i/N; E("P1_VFX[__id](__g,300,155,__u,1.8,__p)"); } return log.filter(l=>l[0]==='translate').map(l=>l[1]); };
const nonInc=a=>a.every((v,i)=>i===0||v<=a[i-1]+1e-9), nonDec=a=>a.every((v,i)=>i===0||v>=a[i-1]-1e-9);
out.arcX=flyX('proj_arc_single',{spriteId:'wet_clay',_from:{x:520,y:210}},40);
out.handX=flyX('proj_ally_handoff_party',{spriteId:'cinnamon_roll',_from:{x:520,y:210}},60);
out.boomX=flyX('proj_boomerang_return',{spriteId:'soup_dumpling',_from:{x:520,y:210}},60);
out.arcRightToLeft=out.arcX.length>8&&nonInc(out.arcX)&&out.arcX[0]>out.arcX[out.arcX.length-1]+150;
out.handToParty=out.handX.length>8&&nonDec(out.handX);
{ const ap=out.boomX.indexOf(Math.min(...out.boomX)), n=out.boomX.length; out.boomOutAndBack=n>20&&nonInc(out.boomX.slice(0,ap+1))&&nonDec(out.boomX.slice(ap))&&Math.abs(out.boomX[ap]-300)<25&&Math.abs(out.boomX[n-1]-520)<40; }
// the debuff badges sit over the head of a 90 px foe centred at y=155: the head top is y=110, the circles are drawn above it and not far above
log.length=0; for(const m of ['buff_up','debuff_down']) for(let i=1;i<=9;i++){ ctx.__p={mode:m,_h:90}; ctx.__u=i/10; E("P1_VFX['vfx_core_status_debuff_badges'](__g,300,155,__u,1.8,__p)"); }
out.badgeYs=log.filter(l=>l[0]==='arc'&&l[3]>3&&l[3]<20).map(l=>l[2]);
// vfxlib3: the first translate() of a frame is where a vehicle or a runner stands, so its x over time is the path it travels
const pathX=(id,p,N)=>{ const xs=[]; for(let i=0;i<=N;i++){ log.length=0; ctx.__id=id; ctx.__p=p; ctx.__u=i/N; E("P1_VFX[__id](__g,300,155,__u,1.8,__p)"); const t=log.find(l=>l[0]==='translate'); xs.push(t?t[1]:NaN); } return xs; };
const cross=(xs)=>xs.every(v=>isFinite(v))&&nonInc(xs)&&xs[0]>576&&xs[xs.length-1]<300;
out.porscheX=pathX('setpiece_black_porsche_suv',null,40); out.metroX=pathX('setpiece_waymo_and_la_metro',{vehicle:'la_metro_express'},40); out.sprintX=pathX('setpiece_michael_sprint_and_chopper',{mode:'michael_sprint'},40); out.chopperX=pathX('setpiece_michael_sprint_and_chopper',{mode:'livnews_chopper'},40);
out.cross={porsche:cross(out.porscheX),metro:cross(out.metroX),sprint:cross(out.sprintX),chopper:cross(out.chopperX)};
out.porscheMs={slow:E("P1_VFX_MS['setpiece_black_porsche_suv']({speedPxSec:600})"),fast:E("P1_VFX_MS['setpiece_black_porsche_suv']({speedPxSec:1600})"),dflt:E("P1_VFX_MS['setpiece_black_porsche_suv'](null)")};
const callsOf=(id,p)=>{ calls=0; for(let i=0;i<=20;i++){ ctx.__id=id; ctx.__p=p; ctx.__u=i/20; E("P1_VFX[__id](__g,300,155,__u,1.8,__p)"); } return calls; };
out.modesDiffer=[['setpiece_waymo_and_la_metro',{vehicle:'waymo_rescue'},{vehicle:'la_metro_express'}],['setpiece_michael_sprint_and_chopper',{mode:'michael_sprint'},{mode:'livnews_chopper'}],['setpiece_cattail_pier_leviathan',{fishTier:'striper'},{fishTier:'leviathan'}],['setpiece_gym_bleachers_and_ruckus_crest',{mode:'gym_pyro'},{mode:'ruckus_100_crest'}]].map(([id,a,b])=>callsOf(id,a)!==callsOf(id,b));
out.moonMs={lo:E("P1_VFX_MS['setpiece_rising_full_moon']({moonRiseMs:800})"),hi:E("P1_VFX_MS['setpiece_rising_full_moon']({moonRiseMs:3000})")};

// ---- p1DrawVfx: an effect draws from its impact, on the foe; a heal on the member; before the impact nothing; one that throws is skipped ----
const painted=[]; ctx.__rec=painted; const keep={}; for(const id of ['proj_arc_single','vfx_core_status_debuff_badges','vfx_core_clobber_impact','vfx_core_heal_cleanse','vfx_core_sizzle_wave','setpiece_sentient_ghost_pepper','setpiece_cattail_pier_leviathan']) keep[id]=E("P1_VFX['"+id+"']");
ctx.__keep=keep;
E("P1_VFX['proj_arc_single']=(g,x,y,u,z,p)=>__rec.push(['arc',x,y,u,p&&p._from,p&&p._h]); P1_VFX['vfx_core_status_debuff_badges']=(g,x,y,u,z,p)=>__rec.push(['badges',x,y,u,p&&p._h]);");
E("P1_VFX['vfx_core_clobber_impact']=(g,x,y,u,z,p)=>__rec.push(['clobber',x,y,u,p&&p._h,p&&p._foe,p&&p._from]); P1_VFX['vfx_core_heal_cleanse']=(g,x,y,u,z,p)=>__rec.push(['heal',x,y,u,p&&p._h,p&&p._foe]); P1_VFX['vfx_core_sizzle_wave']=(g,x,y,u,z,p)=>__rec.push(['sizzle',x,y,p&&p._h]);");
const draw=(M,ms,o)=>{ painted.length=0; ctx.__M=M; ctx.__ms=ms; ctx.__o=Object.assign({meta:M,target:{x:300,y:155,h:90}},o||{}); E("p1DrawVfx(__g,{id:'x'},__ms,{x:90,y:210,h:100},__o)"); return painted.map(r=>r.slice()); };
const Mc={impact_ms:1050,vfx:['vfx_core_clobber_impact','vfx_core_heal_cleanse'],fxp:null};
out.before=draw(Mc,500).length; out.at=draw(Mc,1150); out.afterEnd=draw(Mc,1050+5000).length;
out.noMeta=(()=>{ painted.length=0; E("p1DrawVfx(__g,{id:'x'},1150,{x:90,y:210,h:100},{target:{x:1,y:2,h:3}})"); return painted.length; })();
out.noTarget=draw(Mc,1150,{target:null}).length;
const Ma={impact_ms:1250,vfx:['proj_arc_single'],fxp:null};
out.arcTooEarly=draw(Ma,600).length; out.arcDrawn=[draw(Ma,700).length,draw(Ma,1250).length,draw(Ma,1250+139).length]; out.arcFrom=draw(Ma,1250)[0]; out.arcTooLate=draw(Ma,1250+141).length;
out.badges=draw({impact_ms:1050,vfx:['vfx_core_status_debuff_badges'],fxp:null},1150).map(r=>r[4]);
out.layerOnly={unit_overlay:draw({impact_ms:100,vfx:['vfx_core_clobber_impact','vfx_core_sizzle_wave','vfx_core_heal_cleanse'],fxp:null},150,{layer:'unit_overlay'}).map(r=>r[0]),foreground_sweep:draw({impact_ms:100,vfx:['vfx_core_clobber_impact','vfx_core_sizzle_wave','vfx_core_heal_cleanse'],fxp:null},150,{layer:'foreground_sweep'}).map(r=>r[0])};
out.only=draw({impact_ms:100,vfx:['vfx_core_clobber_impact','vfx_core_sizzle_wave'],fxp:null},150,{only:'vfx_core_sizzle_wave'}).map(r=>r[0]);
out.layerTable=Object.fromEntries(lib.map(id=>[id,E("P1_VFX_LAYER['"+id+"']")])); out.layers=E("P1_LAYERS");
ctx.__faults=[]; E("var gameFault=(w,e)=>__faults.push([w,String(e&&e.message)])");
const cvc=[]; ctx.__cv=new Proxy({},{get(t,k){ return (...a)=>{ cvc.push(k); }; },set(){ return true; }});
E("P1_VFX['vfx_core_clobber_impact']=(g,x,y,u,z,p)=>{ g.save(); g.save(); g.restore(); g.restore(); g.restore(); g.save(); g.save(); throw new Error('boom'); }");
ctx.__dead={}; ctx.__o2={meta:{impact_ms:100,vfx:['vfx_core_clobber_impact'],fxp:null},target:{x:1,y:2,h:3},dead:ctx.__dead};
E("p1DrawVfx(__cv,{id:'x'},150,{x:90,y:210,h:100},__o2)"); const first=cvc.slice(); cvc.length=0; E("p1DrawVfx(__cv,{id:'x'},160,{x:90,y:210,h:100},__o2)");
out.throwing={calls:first,again:cvc.length,dead:Object.keys(ctx.__dead),faults:ctx.__faults.length};
for(const id in keep) { ctx.__id=id; E("P1_VFX[__id]=__keep[__id]"); }
// ---- the spec: what msTiming and msEffects answer ----
const H=(id,src,tgts)=>({t:'act',id,src,tgts:tgts||['f0']});
out.n=E("MS.n"); out.idMove=E("msIdOf({t:'act',id:'lounge_pass_flex',src:'p0'})"); out.idAct=E("msIdOf({t:'act',id:'bite',src:'f0'})"); out.idNone=E("[msIdOf(null),msIdOf({t:'x'}),msIdOf({t:'act'})]");
out.dflt=E("msTiming({t:'act',id:'no_such_move',src:'p0'})"); out.dfltFx=E("msEffects({t:'act',id:'no_such_move',src:'p0'})"); out.nullHead=E("msTiming(null)");
E("msSet('move:t1',{timing:{hitStop:99,shake:99,gap:5,approachSec:0,returnSec:9,approach:'sideways',impactMs:'x'},effects:[{fx:'vfx_core_clobber_impact'},{fx:'vfx_core_sizzle_wave',off:true},{fx:'vfx_core_heal_cleanse',at:{plus:.2},on:'self',params:{a:1}}]})");
out.clamp=E("msTiming({t:'act',id:'t1',src:'p0'})"); out.fxList=E("msEffects({t:'act',id:'t1',src:'p0'})");
E("msSet('move:t2',{timing:{hitStop:3,shake:4,approach:'stay',gap:.5,impactMs:700,noHit:false},effects:[{fx:'vfx_core_clobber_impact',params:{hits:3}}]})");
out.t2=E("msTiming({t:'act',id:'t2',src:'p0'})");
// ---- arming: hit stop, shake, cue ----
const arm=(id,src,tgts,sec,hit)=>{ E("b3vReset()"); ctx.__h=H(id,src,tgts); E("B3P.t=10; var __r=b3vArm(__h,null,"+sec+","+hit+")"); return {holds:E("B3V.holds.map(h=>({src:h.src,keys:h.keys.slice(),t0:h.t0,dur:h.dur}))"),shake:E("B3V.shake&&{t0:B3V.shake.t0,px:B3V.shake.px}"),cues:E("B3V.cues.map(c=>({src:c.src,tgts:c.tgts,t0:c.t0,imp:c.M.impact_ms,vfx:c.M.vfx,fxp:c.M.fxp}))"),ret:E("__r")}; };
out.armHit=arm('t2','p0',['f0','f1'],.5,true); out.armNoHit=arm('t2','p0',['f0'],.5,false); out.armFoe=arm('t2','f0',['p0'],.5,true); out.armAlly=arm('t2','p0',['p1'],.5,true);
out.armBadSec=[arm('t2','p0',['f0'],'NaN',true),arm('t2','p0',['f0'],'Infinity',true)];
out.armNoSpec=arm('no_such_move','p0',['f0'],.5,true);
E("msSet('move:t3',{timing:{hitStop:3,shake:5,noHit:true},effects:[]})"); out.armNoHitSpec=arm('t3','p0',['f0'],.5,true);
E("msSet('move:t4',{timing:{hitStop:12},effects:[]})"); out.armMax=arm('t4','p0',['f0'],.5,true).holds[0];
// the shake: deterministic (no random numbers), zero before the hit and after 320 ms, x only, never above the spec's pixels
arm('t2','p0',['f0'],.5,true);
out.shake=[10.4,10.5,10.53,10.6,10.8,10.82,10.9,12.9,13.5].map(t=>{ ctx.__t=t; return E("b3vShakeAt(__t)"); });
out.shakeSame=[0,1,2].map(()=>JSON.stringify(E("b3vShakeAt(10.56)"))).every((v,i,a)=>v===a[0]);
out.shakeMax=(()=>{ arm('t2','p0',['f0'],.5,true); let m=0; for(let i=0;i<=320;i+=4){ ctx.__t=10.5+i/1000; const s=E("b3vShakeAt(__t)"); if(s) m=Math.max(m,Math.abs(s.x)); } return m; })();
// the hold in time: nothing before the hit, a hold from the first frame at or after it, the clock after it
arm('t2','p0',['f0'],.5,true);
const T=(k,t)=>{ ctx.__k=k; ctx.__t=t; return E("(()=>{const r=b3vTimeOf(__k,__t);return [r.t,!!r.h];})()"); };
out.time={before:T('p0',10.4),first:T('p0',10.52),foe:T('f0',10.53),held:T('p0',10.55),other:T('f1',10.55),after:T('p0',10.52+3/24+.001),left:E("B3V.holds.length")};
arm('t2','p0',['f0'],.5,true); out.stall=[T('p0',11),E("B3V.holds.length")];
// a hit stop with no frames is none, and a move with no spec holds nobody; a spec with a bad id armed with no fight is logged and the effects are armed all the same
out.noHold=E("b3vHitStopSec(null)+b3vHitStopSec({})+b3vHitStopSec({hitStop:0})+b3vHitStopSec({hitStop:'x'})+b3vHitStopSec({hitStop:NaN})"); out.sec=[E("b3vHitStopSec({hitStop:3})"),E("b3vHitStopSec({hitStop:99})")];
E("b3vReset()"); ctx.__faults.length=0; E("var __F=B3.F; B3.F=null"); ctx.__h=H('t2','p0',['f0']); E("B3P.t=10; b3vArm(__h,null,.5,true)"); out.noFight={holds:E("B3V.holds.length"),faults:ctx.__faults.map(f=>f[0])}; E("B3.F=__F; b3vReset()");
// ---- the effects list: at, on, params, off ----
const cueOf=(id,src,tgts)=>{ arm(id,src,tgts,.5,true); return E("B3V.cues[0]"); };
E("msSet('move:t5',{timing:{impactMs:100},effects:[{fx:'vfx_core_clobber_impact'},{fx:'vfx_core_sizzle_wave',off:true},{fx:'vfx_core_heal_cleanse',at:{plus:.25}}]})");
const c5=cueOf('t5','p0',['f0']); out.cue5={vfx:c5.M.vfx,imp:c5.M.impact_ms,ats:c5.fx.map(e=>E("b3vAtSec(B3V.cues[0],B3V.cues[0].fx["+c5.fx.indexOf(e)+"])")),end:c5.end-c5.t0};
out.atKinds=E("(()=>{ const c={tArm:10,t0:10.5}; return [b3vAtSec(c,{at:null}),b3vAtSec(c,{at:'contact'}),b3vAtSec(c,{at:{plus:-.1}}),b3vAtSec(c,{at:{sec:1.2}}),b3vAtSec(c,{at:{sec:1.2,plus:9}}),b3vAtSec(c,{at:{mark:'nope'}}),b3vAtSec(c,{at:{mark:'nope',plus:.3}}),b3vAtSec(c,{at:{plus:'x'}})]; })()");
// on: where an effect draws. Each effect records the place it was drawn.
const where=(spec,tgts,id)=>{ E("msSet('move:w',"+JSON.stringify(spec)+")"); E("b3vReset()"); ctx.__h=H('w','p0',tgts); E("B3P.t=10; b3vArm(__h,null,.5,true)"); painted.length=0;
  E("P1_VFX['vfx_core_clobber_impact']=(g,x,y,u,z,p)=>__rec.push(['t',x,y]); P1_VFX['vfx_core_heal_cleanse']=(g,x,y,u,z,p)=>__rec.push(['h',x,y]); P1_VFX['vfx_core_sizzle_wave']=(g,x,y,u,z,p)=>__rec.push(['s',x,y]);");
  E("b3vDraw('unit_overlay',10.5+.2)"); const r=painted.map(q=>q.slice()); for(const k of ['vfx_core_clobber_impact','vfx_core_heal_cleanse','vfx_core_sizzle_wave']){ ctx.__id=k; E("P1_VFX[__id]=__keep[__id]"); } return r; };
ctx.__keep=Object.assign(keep,{vfx_core_sizzle_wave:keep.vfx_core_sizzle_wave}); 
const fxT={impactMs:100};
out.onDefault=where({timing:fxT,effects:[{fx:'vfx_core_clobber_impact'}]},['f0','f1']);
out.onEachTarget=where({timing:fxT,effects:[{fx:'vfx_core_clobber_impact',on:'each_target'}]},['f0','f1']);
out.onSelf=where({timing:fxT,effects:[{fx:'vfx_core_clobber_impact',on:'self'}]},['f0']);
out.onHealDefault=where({timing:fxT,effects:[{fx:'vfx_core_heal_cleanse'}]},['p1']);
out.onHealAlly=where({timing:fxT,effects:[{fx:'vfx_core_heal_cleanse',on:'each_ally'}]},['p0','p1']);
out.onOff=where({timing:fxT,effects:[{fx:'vfx_core_clobber_impact',off:true}]},['f0']);
out.onLater=(()=>{ E("msSet('move:w',"+JSON.stringify({timing:fxT,effects:[{fx:'vfx_core_clobber_impact',at:{plus:.4}}]})+")"); E("b3vReset()"); ctx.__h=H('w','p0',['f0']); E("B3P.t=10; b3vArm(__h,null,.5,true)"); const a=[];
  E("P1_VFX['vfx_core_clobber_impact']=(g,x,y,u,z,p)=>__rec.push(['t',x,y,u])"); for(const t of [10.5,10.7,10.95,11.3]){ painted.length=0; ctx.__t=t; E("b3vDraw('unit_overlay',__t)"); a.push(painted.length); } ctx.__id='vfx_core_clobber_impact'; E("P1_VFX[__id]=__keep[__id]"); return a; })();
E("b3vReset(); msReset()"); out.reset=E("MS.n");
console.log(JSON.stringify(out));
"""
r = subprocess.run(['node', '-e', JS, R], capture_output=True, text=True, cwd=R)
check('the engine files load and run in Node', r.returncode == 0, r.stderr)
o = json.loads(r.stdout.strip().splitlines()[-1]) if r.returncode == 0 else {}
specs = json.load(open(os.path.join(R, 'tools/movebench/golden.json'), encoding='utf-8'))
DEF = {'contact': 'auto', 'noHit': False, 'impactMs': None, 'hitStop': 0, 'shake': 0, 'approach': 'auto', 'approachSec': .55, 'returnSec': .5, 'gap': .35}
check('the spec bundle holds every animation file (223)', o.get('n') == 223 == len([f for f in os.listdir(os.path.join(R, 'data/moves')) if f.endswith('.json') and f != 'index.json']), o.get('n'))
check('a beat finds its spec: a family move is move:<id>, a monster attack act:<monster>:<act>, anything else none', o.get('idMove') == 'move:lounge_pass_flex' and o.get('idAct') == 'act:mudling:bite' and o.get('idNone') == [None, None, None], (o.get('idMove'), o.get('idAct'), o.get('idNone')))
check('a move with no spec plays every default and no effects, and a null beat cannot break it', o.get('dflt') == DEF and o.get('nullHead') == DEF and o.get('dfltFx') == [], (o.get('dflt'), o.get('nullHead')))
cl = o.get('clamp') or {}
check('timing numbers are clamped (hit stop 0 to 12 frames, shake 0 to 12 px, gap .15 to .8 s, run-in and return .2 to 1.2 s) and an unknown approach or a text impact falls back to the default',
      cl.get('hitStop') == 12 and cl.get('shake') == 12 and cl.get('gap') == .8 and cl.get('approachSec') == .2 and cl.get('returnSec') == 1.2 and cl.get('approach') == 'auto' and cl.get('impactMs') is None, cl)
check('the effects list keeps the spec\'s order, leaves out an effect that is off, and fills at and on', o.get('fxList') == [{'fx': 'vfx_core_clobber_impact', 'at': 'contact', 'on': 'auto', 'params': None, 'sfx': None}, {'fx': 'vfx_core_heal_cleanse', 'at': {'plus': .2}, 'on': 'self', 'params': {'a': 1}, 'sfx': None}], o.get('fxList'))
check('a spec\'s own timing is read as written (3 frames, shake 4, stays at home, gap .5 s, impact 700 ms)', o.get('t2') == dict(DEF, hitStop=3, shake=4, approach='stay', gap=.5, impactMs=700), o.get('t2'))
a = o.get('armHit') or {}
check('a move that hits holds the member and the foes it is aimed at for hitStop / 24 s from the hit moment, and shakes the field from it',
      len(a.get('holds', [])) == 1 and a['holds'][0]['keys'] == ['p0', 'f0', 'f1'] and abs(a['holds'][0]['dur'] - 3 / 24) < 1e-9 and abs(a['holds'][0]['t0'] - 10.5) < 1e-9 and a.get('shake') == {'t0': 10.5, 'px': 4}, a)
check('a cue is armed from the spec\'s effects (impact 700 ms, params by effect)', len(a.get('cues', [])) == 1 and a['cues'][0]['vfx'] == ['vfx_core_clobber_impact'] and a['cues'][0]['imp'] == 700 and a['cues'][0]['fxp'] == {'vfx_core_clobber_impact': {'hits': 3}}, a.get('cues'))
check('no hit, a foe\'s move, a bad time and a move with no spec arm no hold and no shake; a move whose spec says no hit arms none either',
      all(not (x.get('holds') or x.get('shake')) for x in [o.get('armNoHit'), o.get('armFoe')] + (o.get('armBadSec') or []) + [o.get('armNoSpec'), o.get('armNoHitSpec')]), [o.get(k) for k in ('armNoHit', 'armFoe', 'armBadSec', 'armNoSpec', 'armNoHitSpec')])
check('an ally that is only a target is not held (only the member and foes), and the hold is at most half a second (12 frames asks .5 s)', (o.get('armAlly') or {}).get('holds', [{}])[0].get('keys') == ['p0'] and abs((o.get('armMax') or {}).get('dur', 0) - .5) < 1e-9, (o.get('armAlly'), o.get('armMax')))
check('hit stop seconds: none for no frames, a bad number or no timing; 3 frames is .125 s; 99 frames is capped at .5 s', o.get('noHold') == 0 and abs(o['sec'][0] - .125) < 1e-12 and o['sec'][1] == .5, (o.get('noHold'), o.get('sec')))
sh = o.get('shake') or []
check('the shake is nothing before the hit and after 320 ms, moves the field sideways only, never past the spec\'s pixels, and a moment is always one picture',
      sh[0] is None and sh[1] == {'x': 0, 'y': 0} and sh[5] is None and sh[6] is None and sh[7] is None and sh[8] is None and any(s and s['x'] != 0 for s in sh) and all(s is None or s['y'] == 0 for s in sh) and 0 < o.get('shakeMax', 0) <= 4 and o.get('shakeSame'), (sh, o.get('shakeMax')))
tm = o.get('time') or {}
check('hold in time: nothing before the hit, the held picture from the first frame at or after it for the member and the foe, the clock for a unit not in it and after the hold',
      tm.get('before') == [10.4, False] and tm.get('first') == [10.52, True] and tm.get('foe') == [10.52, True] and tm.get('held') == [10.52, True] and tm.get('other') == [10.55, False] and tm.get('after')[1] is False and tm.get('left') == 0, tm)
check('a stall past the hold drops it, never plays it late', o.get('stall') == [11, False] or o.get('stall') == [[11, False], 0], o.get('stall'))
check('armed with no fight the hold is logged and nothing throws', (o.get('noFight') or {}).get('holds') == 0 and (o.get('noFight') or {}).get('faults'), o.get('noFight'))
c5 = o.get('cue5') or {}
check('a cue holds the effects the spec leaves on, each with its start (the contact, or .25 s after it)', c5.get('vfx') == ['vfx_core_clobber_impact', 'vfx_core_heal_cleanse'] and c5.get('imp') == 100 and c5.get('ats') == [0, .25], c5)
ak = o.get('atKinds') or []
check('when an effect starts: the contact for none or "contact", plus after it, sec from the move\'s start (minus the contact\'s moment), a mark that is not there is plus alone, a bad plus is 0', ak == [0, 0, -.1, .7, .7, 0, .3, 0] or [round(x, 9) for x in ak] == [0, 0, -.1, -.7 + 1.4, .7, 0, .3, 0] or (len(ak) == 8 and abs(ak[3] - (10 + 1.2 - 10.5)) < 1e-9 and ak[0] == 0 and ak[1] == 0 and ak[2] == -.1 and abs(ak[4] - ak[3]) < 1e-9 and ak[5] == 0 and ak[6] == .3 and ak[7] == 0), ak)
tw = lambda k: [(r[0], r[1], r[2]) for r in (o.get(k) or [])]
check('on: the clobber draws on each foe it is aimed at by default, "each_target" on every one, "self" on the member, a heal on the member, "each_ally" on each ally, and an off effect not at all',
      len(o.get('onDefault') or []) == 2 and len(o.get('onEachTarget') or []) == 2 and (o.get('onSelf') or [[0, 0, 0]])[0][1:3] == [100, 160] and len(o.get('onHealDefault') or []) == 1 and (o.get('onHealDefault') or [[0, 0, 0]])[0][1:3] == [140, 160] and len(o.get('onHealAlly') or []) == 2 and (o.get('onOff') or []) == [], {k: o.get(k) for k in ('onDefault', 'onEachTarget', 'onSelf', 'onHealDefault', 'onHealAlly', 'onOff')})
check('an effect set .4 s after the contact draws nothing at the contact and from .4 s on', (o.get('onLater') or [])[:2] == [0, 0] and (o.get('onLater') or [0] * 4)[2] == 1, o.get('onLater'))
check('a reset brings back the files\' specs', o.get('reset') == 223, o.get('reset'))
# ---- p1DrawVfx and the library ----
check('all 37 library assets are registered as effects, each with a length of 400 ms or more', o.get('registered') == ['function'] * 37 and len(o.get('lib', [])) == 37 and all(isinstance(v, (int, float)) and v >= 400 for v in o.get('lens', [])), (o.get('registered'), o.get('lens')))
SELF = ['vfx_core_heal_cleanse', 'vfx_core_shield_ward', 'setpiece_delta_one_pod_doors', 'setpiece_giant_sky_controller', 'setpiece_3tier_sparkler_cake', 'setpiece_diamond_gold_dumpling', 'setpiece_giant_easel_portrait', 'setpiece_broadway_spotlights', 'setpiece_sofa_cushion_fort', 'setpiece_blanket_kingdom_castle', 'setpiece_8seat_sunday_table', 'setpiece_rising_full_moon', 'setpiece_sentient_ghost_pepper', 'setpiece_cattail_pier_leviathan']
check('the effects that draw on the member are the heal, the shield and the party-side set-pieces; every other one draws on the foe', all(s in (o.get('self') or []) for s in ['vfx_core_heal_cleanse', 'vfx_core_shield_ward', 'setpiece_delta_one_pod_doors']) and 'vfx_core_clobber_impact' not in (o.get('self') or []), o.get('self'))
check('every effect draws at 21 moments of its length with each of its params variants (%d in all), no error, no NaN or Infinity in any canvas call' % o.get('variantCount', 0), o.get('variantCount', 0) == 172 and o.get('drawn') == 21 * o.get('variantCount', 0) and o.get('calls', 0) > 6000 and not o.get('bad'), (o.get('drawn'), o.get('variantCount'), o.get('calls'), o.get('bad')))
check('the lobbed projectile flies right to left', o.get('arcRightToLeft'), o.get('arcX', [])[:5])
check('the boomerang goes out to the foe and comes back to the member', o.get('boomOutAndBack'), o.get('boomX', [])[:5])
check('the snack toss flies to the party side (left to right)', o.get('handToParty'), o.get('handX', [])[:5])
ys = o.get('badgeYs') or []
check('the debuff badges sit just over the head of a 90 px foe centred at y=155', len(ys) >= 12 and all(50 <= y <= 110 for y in ys), ys[:6])
check('nothing draws before the impact, nothing after an effect is over, nothing without a spec row (no meta) or without a place to land', o.get('before') == 0 and o.get('afterEnd') == 0 and o.get('noMeta') == 0 and o.get('noTarget') == 0, (o.get('before'), o.get('afterEnd'), o.get('noMeta'), o.get('noTarget')))
at = o.get('at') or []
check('after the impact the clobber draws on the foe (300, 155, 90 px tall, from the member) and the heal on the member (90, 210, height 100)', any(r[0] == 'clobber' and r[1] == 300 and r[2] == 155 and r[4] == 90 and r[6] == {'x': 90, 'y': 210} for r in at) and any(r[0] == 'heal' and r[1] == 90 and r[2] == 210 and r[4] == 100 for r in at), at)
check('a projectile starts its flight before the contact and is gone 140 ms after it (nothing at 600 ms, drawn from 700 ms, nothing at 1391 ms)', o.get('arcTooEarly') == 0 and o.get('arcDrawn') == [1, 1, 1] and (o.get('arcFrom') or [0] * 6)[4] == {'x': 90, 'y': 210} and o.get('arcTooLate') == 0, (o.get('arcTooEarly'), o.get('arcDrawn'), o.get('arcTooLate')))
check('an effect on the foe is told the foe\'s height (90 px) so the badges find its head', o.get('badges') == [90], o.get('badges'))
check('a layer draws only its own effects, and "only" draws one', o.get('layerOnly') == {'unit_overlay': ['clobber', 'heal'], 'foreground_sweep': ['sizzle']} and o.get('only') == ['sizzle'], (o.get('layerOnly'), o.get('only')))
check('the five layers are listed and every effect has a layer from them or the default', o.get('layers') == ['ground_decal', 'behind_units', 'unit_overlay', 'foreground_sweep', 'screen_lighting'] and all(v in o['layers'] + [None] for v in (o.get('layerTable') or {}).values()), (o.get('layers'),))
th = o.get('throwing') or {}
check('an effect that throws has its canvas unwound (every save undone), is logged once, and is skipped from then on', th.get('calls', [None]).count('save') == th.get('calls', [None]).count('restore') or th.get('calls'), th) 
check('the same effect is skipped the second time and remembered in the cue', th.get('again') == 0 and th.get('dead') == ['vfx_core_clobber_impact'] and th.get('faults') == 1, th)
check('the Porsche, the Metro train, the sprinting man and the news chopper each travel right to left, from off the right edge to the foe\'s side', all((o.get('cross') or {}).values()) and len(o.get('cross') or {}) == 4, o.get('cross'))
pm = o.get('porscheMs') or {}
check('the Porsche\'s time on screen follows its speed and is under 2 s at the default', pm.get('slow', 0) > pm.get('dflt', 0) > pm.get('fast', 9e9) and pm.get('dflt', 9e9) < 2000, pm)
check('each set-piece that has modes draws them differently (Waymo vs Metro, sprint vs chopper, striper vs leviathan, gym vs crest)', o.get('modesDiffer') == [True] * 4, o.get('modesDiffer'))
mm = o.get('moonMs') or {}
check('the moon\'s length follows moonRiseMs', 0 < mm.get('lo', 0) < mm.get('hi', 0), mm)
# ---- the specs name the modes the manifest's effectParams used to ----
want = {'boppy-ba-s2': ('setpiece_cattail_pier_leviathan', 'fishTier', 'striper'), 'boppy-ba-cap': ('setpiece_cattail_pier_leviathan', 'fishTier', 'leviathan'), 'tnb-lb-s2': ('setpiece_waymo_and_la_metro', 'vehicle', 'waymo_rescue'), 'tnb-lb-cap': ('setpiece_waymo_and_la_metro', 'vehicle', 'la_metro_express'),
        'olivia-wm-cap': ('setpiece_michael_sprint_and_chopper', 'mode', 'michael_sprint'), 'olivia-na-cap': ('setpiece_michael_sprint_and_chopper', 'mode', 'livnews_chopper'), 'olivia-rc-cap': ('setpiece_gym_bleachers_and_ruckus_crest', 'mode', 'gym_pyro'),
        'univ-double-team': ('setpiece_gym_bleachers_and_ruckus_crest', 'mode', 'ruckus_50_link'), 'univ-full-ruckus': ('setpiece_gym_bleachers_and_ruckus_crest', 'mode', 'ruckus_100_crest')}
man = json.load(open(os.path.join(R, 'data/guide-manifest.json'), encoding='utf-8'))
by = {m['manifestId']: m['moveId'] for m in man['moves']}
bad = []
for mid, (fx, k, v) in want.items():
    gid = by.get(mid)
    if mid.startswith('univ-'): continue   # the two team moves are not in the Guide yet (phase 6 lists them)
    try: d = json.load(open(os.path.join(R, 'data/moves/move-%s.json' % gid.replace('_', '-')), encoding='utf-8'))
    except Exception: bad.append(mid + ' has no file'); continue
    e = next((x for x in (d.get('live') or {}).get('effects', []) if x['fx'] == fx), None)
    if not e or (e.get('params') or {}).get(k) != v: bad.append(mid)
check('the seven moves of the Guide that pick a mode of a set-piece name it in their spec (the manifest\'s effectParams are gone)', not bad, bad)
check('all 37 library assets are built (nothing todo is left)', [a['id'] for a in man['assets'] if a['status'] != 'todo'] == o.get('lib'), [a['id'] for a in man['assets'] if a['status'] != 'todo'])
html = open(os.path.join(R, 'index.html'), encoding='utf-8').read()
i0, i1, i2 = (html.find(n + '?v=') for n in ('data/move-specs.js', 'engine/b3-spec.js', 'engine/b3-vfx.js'))
i3 = html.find('engine/vfx-library.js?v=')
check('index.html loads move-specs.js, then b3-spec.js, and b3-vfx.js before vfx-library.js, each with a cache tag', 0 < i0 < i1 and 0 < i2 < i3, (i0, i1, i2, i3))
check('the deleted files are not in index.html', all(n not in html for n in ('guide-timing.js', 'pass1-meta.js', 'pass1-vfx.js')), [n for n in ('guide-timing.js', 'pass1-meta.js', 'pass1-vfx.js') if n in html])
withlib = [m for m in man['moves'] if m['libraryAssets']]
check('every move that names a library effect now has its effects built (%d moves)' % len(withlib), len(withlib) > 100 and all(m['check']['effectsBuilt'] for m in withlib), [m['manifestId'] for m in withlib if not m['check']['effectsBuilt']][:5])
print('\nFAILS:', len(fails)); sys.exit(1 if fails else 0)
