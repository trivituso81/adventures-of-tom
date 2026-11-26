#!/usr/bin/env python3
"""guide_timing_test.py (guidetime1, 2026-11-26; vfxlib2 added effects 9 to 15; vfxlib3 added the 22 set-pieces, 16 to 37): the engine step that reads contactSec and hitStopFrames from data/guide-manifest.json
(engine/guide-timing.js, through p1Meta in engine/pass1-vfx.js) and the 37 effects of the Stage 2C library (engine/vfx-library.js).
Runs the real engine files in Node with a recording canvas: no browser, no network. Run: python3 -I tools/guide_timing_test.py"""
import json, os, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); fails = []
def check(n, ok, d=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else '  ' + str(d)[:400]))
    if not ok: fails.append(n)
JS = r"""
const fs=require('fs'),vm=require('vm'),path=require('path'),R=process.argv[1];
const ctx=vm.createContext({Math,JSON,Object,Array,String,Number,Error,Promise,console,B2:{foes:[{dead:false,px:300,py:200,sc:3,def:{sprite:new Array(30)}}]}});
const run=f=>vm.runInContext(fs.readFileSync(path.join(R,f),'utf8'),ctx,{filename:f});
const out={};
run('data/pass1-meta.js'); run('engine/guide-timing.js');
out.beforeLoad=vm.runInContext("gtMeta('pf_tom_ff_basic')",ctx);
run('engine/pass1-vfx.js'); run('engine/vfx-library.js');
const doc=JSON.parse(fs.readFileSync(path.join(R,'data/guide-manifest.json'),'utf8'));
const E=s=>vm.runInContext(s,ctx);
out.beforeLoadMeta=E("p1Meta('pf_tom_ff_basic')");
out.rows=E("gtUse")(doc);
out.manifestOnly=E("p1Meta('pf_tom_ff_basic')");           // in the manifest, no row in PASS1_META
out.baked=E("p1Meta('pf_justin_bb_basic')");               // a row measured on the baked video wins over the manifest
out.unknown=E("p1Meta('pf_nobody_nothing')");
out.clock=E("(()=>{const S={id:'pf_tom_ff_basic'},M=p1Meta(S.id),hold=M.hit_stop_frames*1000/60,c=M.impact_ms;return [[500,500],[c,c],[c+hold/2,c],[c+hold,c],[c+hold+100,c+100],[2000,2000-hold]].map(([ms,want])=>[p1Clock(S,ms),want]);})()");
out.badDoc=E("gtUse({moves:[{manifestId:'x-y',contactSec:'1'},{manifestId:'x-z',contactSec:-1},{manifestId:'x-w',contactSec:0.5,hitStopFrames:null}]})");
out.badDocRow=E("gtMeta('x-w')");
E("gtUse")(doc);
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
// p1DrawVfx: a clip with a manifest row draws its library effects from the impact, on the foe; a heal draws on the member; before the impact nothing
const painted=[]; ctx.__rec=painted;
E("P1_VFX['proj_arc_single']=(g,x,y,u,z,p)=>__rec.push(['arc',x,y,u,p&&p._from,p&&p._h]); P1_VFX['vfx_core_status_debuff_badges']=(g,x,y,u,z,p)=>__rec.push(['badges',x,y,u,p&&p._h]);");
E("P1_VFX['vfx_core_clobber_impact']=(g,x,y,u,z,p)=>__rec.push(['clobber',x,y,u]); P1_VFX['vfx_core_heal_cleanse']=(g,x,y,u,z,p)=>__rec.push(['heal',x,y,u,p&&p._h]);");
E("p1DrawVfx(__g,{id:'pf_amy_fq_basic'},500,{x:90,y:210,h:100})");   // before the impact (1050)
out.before=painted.length;
E("p1DrawVfx(__g,{id:'pf_amy_fq_basic'},1050+100,{x:90,y:210,h:100})");   // Amy's clip names the clobber
E("p1DrawVfx(__g,{id:'pf_tnb_cer_s1'},1650+100,{x:90,y:210,h:100})");    // TNB's names the heal
out.afterImpact=painted.slice();
painted.length=0; E("p1DrawVfx(__g,{id:'pf_tnb_cer_basic'},600,{x:90,y:210,h:100})"); out.arcTooEarly=painted.length;   // contact 1250, flight 560: nothing before 690
E("p1DrawVfx(__g,{id:'pf_tnb_cer_basic'},700,{x:90,y:210,h:100})"); E("p1DrawVfx(__g,{id:'pf_tnb_cer_basic'},1250,{x:90,y:210,h:100})"); E("p1DrawVfx(__g,{id:'pf_tnb_cer_basic'},1250+139,{x:90,y:210,h:100})");
out.arcDrawn=painted.slice(); painted.length=0; E("p1DrawVfx(__g,{id:'pf_tnb_cer_basic'},1250+141,{x:90,y:210,h:100})"); out.arcTooLate=painted.length;
painted.length=0; E("p1DrawVfx(__g,{id:'pf_tom_ff_basic'},1050+100,{x:90,y:210,h:100})"); out.badgesDrawn=painted.slice();
painted.length=0; E("p1DrawVfx(__g,{id:'pf_amy_fq_basic'},1050+5000,{x:90,y:210,h:100})"); out.afterEnd=painted.length;
// vfxlib3: the first translate() of a frame is where a vehicle or a runner stands, so its x over time is the path it travels
const pathX=(id,p,N)=>{ const xs=[]; for(let i=0;i<=N;i++){ log.length=0; ctx.__id=id; ctx.__p=p; ctx.__u=i/N; E("P1_VFX[__id](__g,300,155,__u,1.8,__p)"); const t=log.find(l=>l[0]==='translate'); xs.push(t?t[1]:NaN); } return xs; };
const cross=(xs)=>xs.every(v=>isFinite(v))&&nonInc(xs)&&xs[0]>576&&xs[xs.length-1]<300;
out.porscheX=pathX('setpiece_black_porsche_suv',null,40); out.metroX=pathX('setpiece_waymo_and_la_metro',{vehicle:'la_metro_express'},40); out.sprintX=pathX('setpiece_michael_sprint_and_chopper',{mode:'michael_sprint'},40); out.chopperX=pathX('setpiece_michael_sprint_and_chopper',{mode:'livnews_chopper'},40);
out.cross={porsche:cross(out.porscheX),metro:cross(out.metroX),sprint:cross(out.sprintX),chopper:cross(out.chopperX)};
out.porscheMs={slow:E("P1_VFX_MS['setpiece_black_porsche_suv']({speedPxSec:600})"),fast:E("P1_VFX_MS['setpiece_black_porsche_suv']({speedPxSec:1600})"),dflt:E("P1_VFX_MS['setpiece_black_porsche_suv'](null)")};
const callsOf=(id,p)=>{ calls=0; for(let i=0;i<=20;i++){ ctx.__id=id; ctx.__p=p; ctx.__u=i/20; E("P1_VFX[__id](__g,300,155,__u,1.8,__p)"); } return calls; };
out.modesDiffer=[['setpiece_waymo_and_la_metro',{vehicle:'waymo_rescue'},{vehicle:'la_metro_express'}],['setpiece_michael_sprint_and_chopper',{mode:'michael_sprint'},{mode:'livnews_chopper'}],['setpiece_cattail_pier_leviathan',{fishTier:'striper'},{fishTier:'leviathan'}],['setpiece_gym_bleachers_and_ruckus_crest',{mode:'gym_pyro'},{mode:'ruckus_100_crest'}]].map(([id,a,b])=>callsOf(id,a)!==callsOf(id,b));
out.moonMs={lo:E("P1_VFX_MS['setpiece_rising_full_moon']({moonRiseMs:800})"),hi:E("P1_VFX_MS['setpiece_rising_full_moon']({moonRiseMs:3000})")};
// the manifest's effectParams reach the effect: Boppy's two moves draw the striper and the leviathan, TNB's the Waymo and the Metro, Olivia's the sprint and the chopper, the three gym modes
out.fxp=['boppy-ba-s2','boppy-ba-cap','tnb-lb-s2','tnb-lb-cap','olivia-wm-cap','olivia-na-cap','olivia-rc-cap','univ-double-team','univ-full-ruckus'].map(k=>[k,E("p1Meta('pf_"+k.replace(/-/g,'_')+"')").fxp]);
// p1DrawVfx: a set-piece that draws on the member is told where the foe is (p._foe) and, from the manifest, which mode it draws
const rec=[]; ctx.__rec=rec;
E("P1_VFX['setpiece_sentient_ghost_pepper']=(g,x,y,u,z,p)=>__rec.push(['pepper',x,y,Math.round(u*1000)/1000,p&&p._foe,p&&p._h]); P1_VFX['setpiece_cattail_pier_leviathan']=(g,x,y,u,z,p)=>__rec.push(['pier',x,y,p&&p.fishTier,p&&p._h,p&&p._foe]);");
E("p1DrawVfx(__g,{id:'pf_boppy_pb_cap'},3300+100,{x:90,y:210,h:100})"); E("p1DrawVfx(__g,{id:'pf_boppy_ba_cap'},3450+100,{x:90,y:210,h:100})"); E("p1DrawVfx(__g,{id:'pf_boppy_ba_s2'},2050+100,{x:90,y:210,h:100})");
out.setpieceCalls=rec.slice();
// vfxfight1: the library's layers, a row found by move id, and p1DrawVfx with a layer, a target and a throwing effect (what a real Battle 3 fight asks of it)
out.layerTable=Object.fromEntries(lib.map(id=>[id,E("P1_VFX_LAYER['"+id+"']")])); out.layers=E("P1_LAYERS");
out.mvRow=E("(()=>{const r=gtMetaMove('lounge_pass_flex');return r&&[r.id,r.impact_ms,r.vfx];})()");
out.mvNone=E("[gtMetaMove('no_such_move'),gtMetaMove(null),gtMetaMove(undefined),gtMetaMove('')]");
ctx.__faults=[]; E("var gameFault=(w,e)=>__faults.push([w,String(e&&e.message)])");
const rl=[]; ctx.__rl=rl; const keep={}; for(const id of ['vfx_core_clobber_impact','vfx_core_sizzle_wave','vfx_core_heal_cleanse']) keep[id]=E("P1_VFX['"+id+"']");
ctx.__keep=keep;
E("P1_VFX['vfx_core_clobber_impact']=(g,x,y,u,z,p)=>__rl.push(['clobber',x,y,p&&p._h,p&&p._foe,p&&p._from]); P1_VFX['vfx_core_sizzle_wave']=(g,x,y,u,z,p)=>__rl.push(['sizzle',x,y,p&&p._h]); P1_VFX['vfx_core_heal_cleanse']=(g,x,y,u,z,p)=>__rl.push(['heal',x,y,p&&p._h,p&&p._foe]);");
E("var __M={impact_ms:100,vfx:['vfx_core_clobber_impact','vfx_core_sizzle_wave','vfx_core_heal_cleanse'],fxp:null}");
const pick=(o)=>{ rl.length=0; ctx.__o=o; E("p1DrawVfx(__g,{id:'x'},150,{x:90,y:210,h:100},__o)"); return rl.map(r=>r.slice()); };
out.noLayer=pick({meta:E("__M"),target:{x:11,y:22,h:33},foe:{x:5,y:6,h:7}}).map(r=>r[0]);
out.layerOnly={unit_overlay:pick({meta:E("__M"),layer:'unit_overlay',target:{x:11,y:22,h:33}}).map(r=>r[0]),foreground_sweep:pick({meta:E("__M"),layer:'foreground_sweep',target:{x:11,y:22,h:33}}).map(r=>r[0]),screen_lighting:pick({meta:E("__M"),layer:'screen_lighting',target:{x:11,y:22,h:33}}).map(r=>r[0])};
out.only=pick({meta:E("__M"),only:'vfx_core_sizzle_wave',target:{x:11,y:22,h:33}}).map(r=>r[0]);
out.target=pick({meta:E("__M"),target:{x:11,y:22,h:33},foe:{x:5,y:6,h:7}});
out.selfNoB2=(()=>{ E("B2.foes[0].dead=true"); const r=pick({meta:E("__M"),foe:{x:5,y:6,h:7}}); const none=pick({meta:E("__M")}); E("B2.foes[0].dead=false"); return {withFoe:r.map(q=>q[0]),none:none.length}; })();
out.defaultFoe=pick({meta:E("__M")}).filter(r=>r[0]==='clobber').map(r=>r.slice(1,4));   // no O: the first foe standing, as the Battle Lab review has always made the call
// a throwing effect: the canvas is unwound (every save() undone), the fault is logged once, and the effect is skipped from then on
const cvc=[]; ctx.__cv=new Proxy({},{get(t,k){ return (...a)=>{ cvc.push(k); }; },set(){ return true; }});
E("P1_VFX['vfx_core_clobber_impact']=(g,x,y,u,z,p)=>{ g.save(); g.save(); g.restore(); g.restore(); g.restore(); g.save(); g.save(); throw new Error('boom'); }");
ctx.__dead={}; ctx.__o2={meta:E("({impact_ms:100,vfx:['vfx_core_clobber_impact'],fxp:null})"),target:{x:1,y:2,h:3},dead:ctx.__dead};
E("p1DrawVfx(__cv,{id:'x'},150,{x:90,y:210,h:100},__o2)"); const first=cvc.slice(); cvc.length=0;
E("p1DrawVfx(__cv,{id:'x'},160,{x:90,y:210,h:100},__o2)");
out.throwing={calls:first,again:cvc.length,dead:Object.keys(ctx.__dead),faults:ctx.__faults.slice()};
// the Battle Lab review's own call (no O, a clipShow-like S) also survives a throwing effect and remembers it on S
ctx.__S={id:'pf_amy_fq_basic'}; E("P1_VFX['vfx_core_clobber_impact']=(g)=>{ throw new Error('boom2'); }"); ctx.__faults.length=0;
let thr=null; try{ E("p1DrawVfx(__g,__S,1050+100,{x:90,y:210,h:100})"); E("p1DrawVfx(__g,__S,1050+120,{x:90,y:210,h:100})"); }catch(e){ thr=e.message; }
out.reviewThrow={thrown:thr,dead:Object.keys(ctx.__S._vfxDead||{}),faults:ctx.__faults.length};
// hitstop1: hit stop in a real fight (engine/b3-vfx.js): the manifest's hitStopFrames at 24 fps hold the member and the foes a move hits, only in what is drawn
E("var B3P={t:0,foe:{f0:{},f1:{}},at:{p0:{cx:100,base:200,h:80}}}; var B3={F:{party:[{key:'p0',side:'party'},{key:'p1',side:'party'}],foes:[{key:'f0',side:'foe'},{key:'f1',side:'foe'}]},view:{u:{}}}; function b3Unit(F,k){ return [...F.party,...F.foes].find(u=>u.key===k)||null; } function b3Spot(k){ return {x:300,y:150,top:100,base:200}; } var gfx={};");
run('engine/b3-vfx.js');
ctx.__faults.length=0;
const mvs=doc.moves.filter(m=>m.moveId);
const secOf=id=>E("b3vHitStopSec({id:'"+id+"'})");
const stopMove=mvs.find(m=>m.hitStopFrames===3), zeroMove=mvs.find(m=>m.hitStopFrames===0), maxMove=mvs.reduce((a,b)=>b.hitStopFrames>a.hitStopFrames?b:a);
out.hs={secs:[secOf(stopMove.moveId),secOf(maxMove.moveId),secOf(zeroMove.moveId),secOf('no_such_move')],want:[3/24,maxMove.hitStopFrames/24,0,0],ids:[stopMove.moveId,zeroMove.moveId]};
out.hsAll=mvs.every(m=>Math.abs(secOf(m.moveId)-(m.hitStopFrames>0?Math.min(.5,m.hitStopFrames/24):0))<1e-12);
const head=(id,src,tgts)=>({t:'act',id,src,tgts});
const holds=()=>E("B3V.holds.map(h=>({src:h.src,keys:h.keys.slice(),t0:h.t0,dur:h.dur,start:h.start}))");
const arm=(h,sec,hit)=>{ E("b3vReset()"); ctx.__h=h; E("B3P.t=10"); E("b3vArm(__h,null,"+sec+","+hit+")"); return holds(); };
out.hsArm=arm(head(stopMove.moveId,'p0',['f0','f1']),.5,true);
out.hsNoHit=arm(head(stopMove.moveId,'p0',['f0']),.5,false);
out.hsNoArg=arm(head(stopMove.moveId,'p0',['f0']),.5,'undefined');
out.hsZero=arm(head(zeroMove.moveId,'p0',['f0']),.5,true);
out.hsUnknown=arm(head('no_such_move','p0',['f0']),.5,true);
out.hsFoeMove=arm(head(stopMove.moveId,'f0',['p0']),.5,true);
out.hsAlly=arm(head(stopMove.moveId,'p0',['p1']),.5,true);
out.hsBadSec=[arm(head(stopMove.moveId,'p0',['f0']),'NaN',true),arm(head(stopMove.moveId,'p0',['f0']),'Infinity',true)];
// time: nothing before the hit, a hold from the first frame at or after it, the held picture for the whole hold, the clock again after it; units that are not in the hold keep the clock
arm(head(stopMove.moveId,'p0',['f0']),.5,true);
const T=(k,t)=>{ ctx.__k=k; ctx.__t=t; return E("(()=>{const r=b3vTimeOf(__k,__t);return [r.t,!!r.h];})()"); };
out.hsTime={before:T('p0',10.4),first:T('p0',10.52),foeFirst:T('f0',10.52),held:T('p0',10.55),heldFoe:T('f0',10.6),other:T('f1',10.55),other2:T('p1',10.55),lastHeld:T('p0',10.52+.125-.001),after:T('p0',10.52+.125),later:T('p0',11),left:holds().length};
// a stall: the clock is already past the hold when it is first drawn: dropped, never played late
arm(head(stopMove.moveId,'p0',['f0']),.5,true); out.hsStall=[T('p0',11),holds().length];
// two moves in a row of the same member: the older hold goes
arm(head(stopMove.moveId,'p0',['f0']),.5,true); ctx.__h=head(stopMove.moveId,'p0',['f1']); E("B3P.t=12; b3vArm(__h,null,.5,true)"); out.hsReplaced=holds().map(h=>[h.src,h.keys.join(),h.t0]);
// b3vUnit: the unit is drawn at the held time, its shake stands still (one random number for the whole call), and the real random comes back
arm(head(stopMove.moveId,'p0',['f0']),.5,true); T('p0',10.52);
ctx.__calls=[]; ctx.__fn=(t)=>{ ctx.__calls.push([t,Math.random(),Math.random()]); };
const realRandom=Math.random; E("b3vUnit('p0',10.55,__fn)"); E("b3vUnit('f0',10.56,__fn)"); E("b3vUnit('p1',10.57,__fn)"); E("b3vUnit('p0',10.7,__fn)");
out.hsUnit={calls:ctx.__calls.slice(),restored:Math.random===realRandom,sameShake:ctx.__calls[0][1]===ctx.__calls[0][2]&&ctx.__calls[0][1]===ctx.__calls[1][1]};
// a held draw that throws: the hold is dropped, the fault logged once, and the unit is drawn at the clock as before
arm(head(stopMove.moveId,'p0',['f0']),.5,true); T('p0',10.52);
ctx.__seen=[]; ctx.__fn2=(t)=>{ ctx.__seen.push(t); if(t===10.52) throw new Error('held draw'); }; ctx.__faults.length=0;
E("b3vUnit('p0',10.55,__fn2)"); const firstSeen=ctx.__seen.slice(); E("b3vUnit('p0',10.56,__fn2)");
out.hsThrow={seen:firstSeen,seen2:ctx.__seen.slice(2),holds:holds().length,faults:ctx.__faults.map(f=>f[0])};
// a throw with no hold on is the draw's own and passes through (as it always did)
let thrown=null; ctx.__fn3=()=>{ throw new Error('plain'); }; E("b3vReset()"); try{ E("b3vUnit('p0',5,__fn3)"); }catch(e){ thrown=e.message; } out.hsPlain=thrown;
// a hold that cannot be armed (no fight) is logged and the move's effects are armed all the same; a manifest row that throws gives no hold
E("b3vReset()"); ctx.__faults.length=0; E("var __F=B3.F; B3.F=null"); ctx.__h=head(stopMove.moveId,'p0',['f0']); E("B3P.t=10; b3vArm(__h,null,.5,true)");
out.hsNoFight={holds:holds().length,cues:E("B3V.cues.length"),faults:ctx.__faults.map(f=>f[0])}; E("B3.F=__F; b3vReset()");
E("var __g0=gtMetaMove; gtMetaMove=()=>{ throw new Error('row'); }"); out.hsRowThrows=E("b3vHitStopSec({id:'x'})"); E("gtMetaMove=__g0");
// the effects keep their own pace: an effect is told ms = impact_ms + (t - hit moment) x 1000 whether a hold is on or not
{ const mm=mvs.find(m=>m.hitStopFrames>0&&(m.libraryAssets||[]).some(a=>/^vfx_core_(racket_rings|clobber_impact|sizzle_wave)/.test(a))&&m.moveId);
  E("b3vReset()"); const recd=[]; ctx.__recd=recd; ctx.__faults.length=0; E("var __p1=p1DrawVfx; p1DrawVfx=(g,S,ms,A,O)=>__recd.push([Math.round(ms*1000)/1000,O&&O.layer])"); ctx.__h=head(mm.moveId,'p0',['f0']); E("B3P.t=10; B3V.dummy=b3vArm(__h,null,.5,true)");
  const row=E("gtMetaMove('"+mm.moveId+"')"); const ts=[10.45,10.52,10.55,10.6,10.62,10.7,10.9];
  for(const t of ts){ ctx.__t=t; T('p0',t); for(const L of E("P1_LAYERS")) { ctx.__L=L; E("b3vDraw(__L,__t)"); } }
  const byT={}; ts.forEach(t=>byT[t]=[]);
  // each b3vDraw pass logs one entry per drawn effect; split the log back into the frames by order
  out.hsFx={faults:ctx.__faults.length,impact:row.impact_ms,ms:[...new Set(recd.map(r=>r[0]))],ts,hold:holds().length,drawnLayers:[...new Set(recd.map(r=>r[1]))]};
  E("p1DrawVfx=__p1"); E("b3vReset()"); }
// the move's with-no-effect case still gets its hit stop: arm with a move that has no library effect row at all
out.hsNoFx=(()=>{ const mm=mvs.find(m=>m.hitStopFrames>0&&!(m.libraryAssets||[]).length); if(!mm) return 'none'; return arm(head(mm.moveId,'p0',['f0']),.5,true).length; })();
for(const id in keep) ctx.__id=id, E("P1_VFX[__id]=__keep[__id]");
console.log(JSON.stringify(out));
"""
r = subprocess.run(['node', '-e', JS, R], capture_output=True, text=True, cwd=R)
check('the engine files load and run in Node', r.returncode == 0, r.stderr)
o = json.loads(r.stdout.strip().splitlines()[-1]) if r.returncode == 0 else {}
man = json.load(open(os.path.join(R, 'data/guide-manifest.json'), encoding='utf-8'))
tom = next(m for m in man['moves'] if m['manifestId'] == 'tom-ff-basic')
check('before the file has loaded the engine answers null and nothing breaks', o.get('beforeLoad') in (None, False, 0) and o.get('beforeLoadMeta') in (None, False, 0), (o.get('beforeLoad'), o.get('beforeLoadMeta')))
check('every manifest move with a contactSec becomes a timing row', o.get('rows') == len(man['moves']) == 123, (o.get('rows'), len(man['moves'])))
mo = o.get('manifestOnly') or {}
check('a clip with no baked row gets impact_ms = contactSec x 1000 and hit_stop_frames = hitStopFrames from the manifest', mo.get('impact_ms') == round(tom['contactSec'] * 1000) and mo.get('hit_stop_frames') == tom['hitStopFrames'], mo)
check('its effects are the move\'s library assets', mo.get('vfx') == tom['libraryAssets'], mo.get('vfx'))
bk = o.get('baked') or {}
check('a clip with a row baked from the video keeps that row (Justin: 1700 ms, not the manifest 1300 ms)', bk.get('impact_ms') == 1700 and bk.get('hit_stop_frames') == 4 and bk.get('from') is None, bk)
check('a clip the manifest does not name gets no timing', o.get('unknown') is None, o.get('unknown'))
check('the hit stop holds the picture for hitStopFrames at 60 fps after the contact (%d frames = %d ms), then time runs on, shifted by that hold' % (tom['hitStopFrames'], round(tom['hitStopFrames'] * 1000 / 60)), len(o.get('clock', [])) == 6 and all(abs(a - b) < 1e-6 for a, b in o.get('clock', [])), o.get('clock'))
check('a bad row is left out (text contactSec, negative contactSec); a null hitStopFrames means no hit stop', o.get('badDoc') == 1 and (o.get('badDocRow') or {}).get('hit_stop_frames') == 0, (o.get('badDoc'), o.get('badDocRow')))
check('all 37 library assets are registered as effects, each with a length of 400 ms or more', o.get('registered') == ['function'] * 37 and len(o.get('lib', [])) == 37 and all(isinstance(v, (int, float)) and v >= 400 for v in o.get('lens', [])), (o.get('registered'), o.get('lens')))
SELF = ['vfx_core_heal_cleanse', 'vfx_core_shield_ward', 'setpiece_delta_one_pod_doors', 'setpiece_giant_sky_controller', 'setpiece_3tier_sparkler_cake', 'setpiece_diamond_gold_dumpling', 'setpiece_giant_easel_portrait', 'setpiece_broadway_spotlights', 'setpiece_sofa_cushion_fort', 'setpiece_blanket_kingdom_castle', 'setpiece_8seat_sunday_table', 'setpiece_rising_full_moon', 'setpiece_rikers_iron_gates', 'setpiece_sentient_ghost_pepper', 'setpiece_eighth_dining_chair']
check('15 effects draw on the member (the heal, the shield, 13 set-pieces on the party side); every other one draws on the foe', sorted(o.get('self', [])) == sorted(SELF), o.get('self'))
check('every effect draws at 21 moments of its length with each of its params variants (%d in all), no error, no NaN or Infinity in any canvas call' % o.get('variantCount', 0), o.get('variantCount', 0) == 172 and o.get('drawn') == 21 * o.get('variantCount', 0) and o.get('calls', 0) > 6000 and not o.get('bad'), (o.get('drawn'), o.get('variantCount'), o.get('calls'), o.get('bad')))
check('the lobbed projectile flies right to left (every step of its path is at or left of the one before, from the member to the foe)', o.get('arcRightToLeft'), o.get('arcX', [])[:5])
check('the boomerang goes out to the foe (apex at the foe\'s x) and comes back to the member', o.get('boomOutAndBack'), o.get('boomX', [])[:5])
check('the snack toss flies to the party side (left to right)', o.get('handToParty'), o.get('handX', [])[:5])
ys = o.get('badgeYs') or []
check('the debuff badges sit just over the head of a 90 px foe centred at y=155 (head top 110): above it, within 60 px of it', len(ys) >= 12 and all(50 <= y <= 110 for y in ys), ys[:6])
check('a projectile starts its flight before the contact and is gone 140 ms after it: nothing at 600 ms, drawn from 700 ms (contact 1250 ms), nothing at 1391 ms; it starts at the member and is given the foe\'s height',
      o.get('arcTooEarly') == 0 and len(o.get('arcDrawn') or []) == 3 and (o.get('arcDrawn') or [[0] * 6])[0][4] == {'x': 90, 'y': 210} and abs((o.get('arcDrawn') or [[0] * 6])[1][3] - 560 / 700) < 1e-6 and o.get('arcTooLate') == 0, (o.get('arcTooEarly'), o.get('arcDrawn'), o.get('arcTooLate')))
check('an effect on the foe is told the foe\'s height (90 px here) so the badges find its head', [b[4] for b in (o.get('badgesDrawn') or []) if b[0] == 'badges'] == [90], o.get('badgesDrawn'))
check('nothing draws before the contact and nothing after an effect is over', o.get('before') == 0 and o.get('afterEnd') == 0, (o.get('before'), o.get('afterEnd')))
ai = o.get('afterImpact') or []
check('after the contact the clobber draws on the middle of the foe (300, 155) and the heal on the member (90, 210, height 100)', any(a[0] == 'clobber' and a[1] == 300 and a[2] == 155 for a in ai) and any(a[0] == 'heal' and a[1] == 90 and a[2] == 210 and a[4] == 100 for a in ai), ai)
fx = {m['manifestId']: m['check'] for m in man['moves']}
check('the Guide says Done for contact and hit stop only where a baked clip plays at the manifest numbers (6 moves) and Not yet for Justin\'s stud finder (1700 vs 1300)',
      sorted(k for k, v in fx.items() if v['contactApplied']) == ['amy-fq-basic', 'amy-fq-s1', 'deedee-nf-cap', 'grace-sc-cap', 'tnb-cer-cap', 'tnb-cer-s1'] and not fx['justin-bb-basic']['contactApplied'], [k for k, v in fx.items() if v['contactApplied']])
check('all 37 library assets are built (nothing todo is left)', [a['id'] for a in man['assets'] if a['status'] != 'todo'] == o.get('lib'), [a['id'] for a in man['assets'] if a['status'] != 'todo'])
html = open(os.path.join(R, 'index.html'), encoding='utf-8').read()
i1, i2, i3 = (html.find('engine/' + n) for n in ('guide-timing.js?v=', 'pass1-vfx.js?v=', 'vfx-library.js?v='))
check('index.html loads guide-timing.js, then pass1-vfx.js, then vfx-library.js, each with a cache tag', 0 < i1 < i2 < i3, (i1, i2, i3))
check('the Porsche, the Metro train, the sprinting man and the news chopper each travel right to left, from off the right edge to the foe\'s side', all((o.get('cross') or {}).values()) and len(o.get('cross') or {}) == 4, o.get('cross'))
pm = o.get('porscheMs') or {}
check('the Porsche\'s time on screen follows its speed (600 px/s slower than 1150 slower than 1600) and is under 2 s at the default', pm.get('slow', 0) > pm.get('dflt', 0) > pm.get('fast', 9e9) and pm.get('dflt', 9e9) < 2000, pm)
check('each set-piece that has modes draws them differently (Waymo vs Metro, sprint vs chopper, striper vs leviathan, gym vs crest)', o.get('modesDiffer') == [True] * 4, o.get('modesDiffer'))
mm = o.get('moonMs') or {}
check('the moon\'s length follows moonRiseMs (800 ms rise shorter than a 3000 ms rise)', 0 < mm.get('lo', 0) < mm.get('hi', 0), mm)
want = {'boppy-ba-s2': {'setpiece_cattail_pier_leviathan': {'fishTier': 'striper'}}, 'boppy-ba-cap': {'setpiece_cattail_pier_leviathan': {'fishTier': 'leviathan'}}, 'tnb-lb-s2': {'setpiece_waymo_and_la_metro': {'vehicle': 'waymo_rescue'}}, 'tnb-lb-cap': {'setpiece_waymo_and_la_metro': {'vehicle': 'la_metro_express'}},
        'olivia-wm-cap': {'setpiece_michael_sprint_and_chopper': {'mode': 'michael_sprint'}}, 'olivia-na-cap': {'setpiece_michael_sprint_and_chopper': {'mode': 'livnews_chopper'}}, 'olivia-rc-cap': {'setpiece_gym_bleachers_and_ruckus_crest': {'mode': 'gym_pyro'}},
        'univ-double-team': {'setpiece_gym_bleachers_and_ruckus_crest': {'mode': 'ruckus_50_link'}}, 'univ-full-ruckus': {'setpiece_gym_bleachers_and_ruckus_crest': {'mode': 'ruckus_100_crest'}}}
check('the manifest\'s effectParams (written by manifest_crosswalk.py) become the move\'s fxp: 9 moves pick the mode of their set-piece', dict(o.get('fxp') or []) == want and {m['manifestId']: m['effectParams'] for m in man['moves'] if 'effectParams' in m} == want, o.get('fxp'))
sc = o.get('setpieceCalls') or []
pep = [c for c in sc if c[0] == 'pepper']; pier = [c for c in sc if c[0] == 'pier']
check('a set-piece that draws on the member is told where the foe is, and a move\'s mode reaches it (pepper at the member (90, 210) with the foe at (300, 155) 90 px tall; the cap draws the leviathan, the second skill the striper)',
      len(pep) == 1 and pep[0][1:3] == [90, 210] and pep[0][4] == {'x': 300, 'y': 155, 'h': 90} and pep[0][5] == 100 and [c[3] for c in pier] == ['leviathan', 'striper'] and pier[0][1:3] == [300, 155], sc)
withlib = [m for m in man['moves'] if m['libraryAssets']]
check('every move that names a library effect now has its effects built (%d moves)' % len(withlib), len(withlib) > 100 and all(m['check']['effectsBuilt'] for m in withlib), [m['manifestId'] for m in withlib if not m['check']['effectsBuilt']][:5])

libjson = json.load(open(os.path.join(R, 'art-factory/aot-stage2c-vfx-library-v11.json'), encoding='utf-8'))['assets']
check('vfxfight1: every effect has the layer the library file gives it (P1_VFX_LAYER agrees with art-factory/aot-stage2c-vfx-library-v11.json for all 37)', o.get('layerTable') == {a['id']: a['layer'] for a in libjson} and set(o['layerTable'].values()) <= set(o.get('layers') or []), {k: v for k, v in (o.get('layerTable') or {}).items() if v != {a['id']: a['layer'] for a in libjson}.get(k)})
check('vfxfight1: the layers are named in the order a fight draws them', o.get('layers') == ['ground_decal', 'behind_units', 'unit_overlay', 'foreground_sweep', 'screen_lighting'], o.get('layers'))
check('vfxfight1: a move is found by its game move id (lounge_pass_flex has the manifest row, with the manifest id) and an unknown or empty id gives null', (o.get('mvRow') or [None])[0] == 'tom-ff-basic' and o['mvRow'][1] == 1050 and o['mvRow'][2] == tom['libraryAssets'] and o.get('mvNone') == [None, None, None, None], (o.get('mvRow'), o.get('mvNone')))
check('vfxfight1: p1DrawVfx with no layer draws every effect of the move (the clobber and the sizzle on the target, the heal on the member)', o.get('noLayer') == ['clobber', 'sizzle', 'heal'], o.get('noLayer'))
check('vfxfight1: with a layer it draws only the effects of that layer (unit_overlay: clobber and heal; foreground_sweep: sizzle; screen_lighting: nothing); with `only` it draws that one', o.get('layerOnly') == {'unit_overlay': ['clobber', 'heal'], 'foreground_sweep': ['sizzle'], 'screen_lighting': []} and o.get('only') == ['sizzle'], (o.get('layerOnly'), o.get('only')))
tg = o.get('target') or []
check('vfxfight1: an effect on the foe lands on the target it is given (11, 22, 33 px tall) and is told where the foe is; the heal lands on the member (90, 210, 100 px tall) and is told the foe',
      len(tg) == 3 and tg[0][:5] == ['clobber', 11, 22, 33, {'x': 5, 'y': 6, 'h': 7}] and tg[0][5] == {'x': 90, 'y': 210} and tg[1][:4] == ['sizzle', 11, 22, 33] and tg[2][:5] == ['heal', 90, 210, 100, {'x': 5, 'y': 6, 'h': 7}], tg)
check('vfxfight1: a real fight has no Battle Lab foe: the call is given the foe and needs nothing else; with neither a foe nor a Lab foe standing nothing draws', (o.get('selfNoB2') or {}).get('withFoe') == ['clobber', 'sizzle', 'heal'] and (o.get('selfNoB2') or {}).get('none') == 0, o.get('selfNoB2'))
check('vfxfight1: with no options the call is the one the Battle Lab review has always made (the first foe standing, (300, 155))', o.get('defaultFoe') == [[300, 155, 90]], o.get('defaultFoe'))
th = o.get('throwing') or {}
check('vfxfight1: an effect that throws after save() calls leaves the canvas as it found it (two saves undone, the extra restore ignored), the fault is logged once, the effect is skipped from then on',
      th.get('calls') == ['save', 'save', 'restore', 'restore', 'save', 'save', 'restore', 'restore'] and th.get('again') == 0 and th.get('dead') == ['vfx_core_clobber_impact'] and th.get('faults') == [['effect vfx_core_clobber_impact', 'boom']], th)
rt = o.get('reviewThrow') or {}
check('vfxfight1: the Battle Lab review\'s call survives a throwing effect too: nothing is thrown, the effect is remembered on the clip and logged once', rt.get('thrown') is None and rt.get('dead') == ['vfx_core_clobber_impact'] and rt.get('faults') == 1, rt)
i4, i5, i6 = (html.find(n) for n in ('engine/b3-stage.js?v=', 'engine/b3-vfx.js?v=', 'engine/b3-play.js?v='))
check('vfxfight1: index.html loads b3-vfx.js between b3-stage.js and b3-play.js, with a cache tag', 0 < i4 < i5 < i6 and i1 < i5, (i4, i5, i6))

hs = o.get('hs') or {}
check('hitstop1: a move\'s hold is its manifest hitStopFrames at 24 fps (3 frames = 0.125 s; the longest, 7 frames = 0.292 s); 0 frames, an unknown move and a row that throws give no hold', all(abs(a - b) < 1e-12 for a, b in zip(hs.get('secs', []), hs.get('want', []))) and len(hs.get('secs', [])) == 4 and o.get('hsRowThrows') == 0, hs)
check('hitstop1: all %d manifest moves with a move id get min(0.5, hitStopFrames / 24) s' % len([m for m in man['moves'] if m.get('moveId')]), o.get('hsAll') is True, o.get('hsAll'))
check('hitstop1: no manifest row has a hitStopFrames over 12 (the 0.5 s cap is never what limits a move)', max(m['hitStopFrames'] for m in man['moves']) <= 12, max(m['hitStopFrames'] for m in man['moves']))
ha = o.get('hsArm') or []
check('hitstop1: a family move\'s hit arms one hold on the member and each foe it hits, from the hit moment (fight time 10 + 0.5 s), for hitStopFrames / 24 s',
      len(ha) == 1 and ha[0]['src'] == 'p0' and ha[0]['keys'] == ['p0', 'f0', 'f1'] and abs(ha[0]['t0'] - 10.5) < 1e-9 and abs(ha[0]['dur'] - 3 / 24) < 1e-9 and ha[0]['start'] is None, ha)
check('hitstop1: a move with no hit, a move with hitStopFrames 0, a move with no manifest row, a foe\'s move and a bad time arm no hold; a move aimed at an ally holds only the member',
      o.get('hsNoHit') == [] and o.get('hsNoArg') == [] and o.get('hsZero') == [] and o.get('hsUnknown') == [] and o.get('hsFoeMove') == [] and o.get('hsBadSec') == [[], []] and [h['keys'] for h in (o.get('hsAlly') or [])] == [['p0']],
      {k: o.get(k) for k in ('hsNoHit', 'hsNoArg', 'hsZero', 'hsUnknown', 'hsFoeMove', 'hsBadSec', 'hsAlly')})
ht = o.get('hsTime') or {}
check('hitstop1: before the hit the unit is drawn at the clock; from the first frame at or after it the member and the foe it hits are held on that frame\'s time for the whole hold',
      ht.get('before') == [10.4, False] and ht.get('first') == [10.52, True] and ht.get('foeFirst') == [10.52, True] and ht.get('held') == [10.52, True] and ht.get('heldFoe') == [10.52, True] and ht.get('lastHeld') == [10.52, True], ht)
check('hitstop1: a unit that is not in the hold keeps the clock, and after the hold every unit is drawn at the clock again (the held time is skipped, not played later); the hold is then gone',
      ht.get('other') == [10.55, False] and ht.get('other2') == [10.55, False] and ht.get('after') == [10.52 + .125, False] and ht.get('later') == [11, False] and ht.get('left') == 0, ht)
check('hitstop1: a clock that is already past the hold when it is first drawn (a stall) does not play the hold late', o.get('hsStall') == [[11, False], 0], o.get('hsStall'))
check('hitstop1: a unit plays one move at a time: arming a second hold for the same member drops the first', o.get('hsReplaced') == [['p0', 'p0,f1', 12.5]], o.get('hsReplaced'))
hu = o.get('hsUnit') or {}
hc = hu.get('calls') or []
check('hitstop1: b3vUnit draws a held unit at the held time (10.52) and any other call at the time it is given; the held draw\'s shake stands still (Math.random is one number for the call) and the real Math.random is back after',
      len(hc) == 4 and hc[0][0] == 10.52 and hc[1][0] == 10.52 and hc[2][0] == 10.57 and hc[3][0] == 10.7 and hu.get('sameShake') is True and hu.get('restored') is True and hc[2][1] != hc[2][2], hu)
th2 = o.get('hsThrow') or {}
check('hitstop1: a held draw that throws is logged once, the hold is dropped, and the unit is drawn at the clock instead; the next frame has no hold', th2.get('seen') == [10.52, 10.55] and th2.get('seen2') == [10.56] and th2.get('holds') == 0 and th2.get('faults') == ['hit stop'], th2)
check('hitstop1: a draw that throws with no hold on is the draw\'s own error and passes through as it always did', o.get('hsPlain') == 'plain', o.get('hsPlain'))
nf = o.get('hsNoFight') or {}
check('hitstop1: a hold that cannot be armed is logged and the move\'s effects are armed all the same', nf.get('holds') == 0 and nf.get('cues') == 1 and nf.get('faults') == ['hit stop armed'], nf)
fxh = o.get('hsFx') or {}
check('hitstop1: library effects keep their own pace during a hold: the effect is told impact_ms + (clock - hit moment) x 1000 at every frame, held or not (%s)' % (fxh.get('ms'),),
      fxh.get('faults') == 0 and len(fxh.get('ms') or []) >= 5 and all(any(abs(m - (fxh['impact'] + (t - 10.5) * 1000)) < 1e-6 for m in fxh['ms']) for t in fxh['ts'] if 10.45 < t < 10.7), fxh)
check('hitstop1: a move with a hit stop and no library effect still gets its hold', o.get('hsNoFx') in (1, 'none'), o.get('hsNoFx'))
bp = open(os.path.join(R, 'engine/b3-play.js'), encoding='utf-8').read()
check('hitstop1: b3PlayMove arms the hit stop only for a move that has a hit (hits.length > 0), and b3Draw draws every foe and every member through b3vUnit',
      "b3vArm(head,own,sec,hits.length>0)" in bp and "b3vUnit(f.key,t,tt=>b3DrawFoe(f,tt," in bp and "b3vUnit(u.key,t,tt=>b3DrawMember(u,tt," in bp, 'b3-play.js')
check('hitstop1: nothing outside b3-vfx.js reads a hold (the battle clock, the queue and the rules do not know about it)', all('B3V.holds' not in open(os.path.join(R, 'engine', f), encoding='utf-8').read() for f in os.listdir(os.path.join(R, 'engine')) if f.endswith('.js') and f != 'b3-vfx.js'), 'engine')
print('FAILS:', fails); sys.exit(1 if fails else 0)
