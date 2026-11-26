#!/usr/bin/env python3
"""guide_timing_test.py (guidetime1, 2026-11-26): the engine step that reads contactSec and hitStopFrames from data/guide-manifest.json
(engine/guide-timing.js, through p1Meta in engine/pass1-vfx.js) and the first 8 effects of the Stage 2C library (engine/vfx-library.js).
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
const bad=[]; let calls=0;
const mk=()=>new Proxy({},{get(t,k){ if(k in t) return t[k]; if(k==='createLinearGradient'||k==='createRadialGradient') return ()=>({addColorStop(){}}); return (...a)=>{ calls++; for(const v of a) if(typeof v==='number'&&!isFinite(v)) bad.push(k+'('+a.join(',')+')'); }; },set(t,k,v){ t[k]=v; if(typeof v==='number'&&!isFinite(v)) bad.push(k+'='+v); return true; }});
ctx.__g=mk();
const lib=JSON.parse(fs.readFileSync(path.join(R,'art-factory/aot-stage2c-vfx-library-v11.json'),'utf8')).assets.slice(0,8).map(a=>a.id);
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
 vfx_core_heal_cleanse:[null,{healPct:100,cleanse:true},{isRevive:true,healPct:80},{overhealShield:true,_h:120}]};
out.drawn=0;
for(const id of lib) for(const p of variants[id]) for(let i=0;i<=20;i++){ ctx.__id=id; ctx.__p=p; ctx.__u=i/20; try{ E("P1_VFX[__id](__g,300,150,__u,1.8,__p)"); out.drawn++; }catch(e){ bad.push(id+' threw '+e.message); } }
out.calls=calls; out.bad=bad.slice(0,6);
// p1DrawVfx: a clip with a manifest row draws its library effects from the impact, on the foe; a heal draws on the member; before the impact nothing
const painted=[]; ctx.__rec=painted;
E("P1_VFX['vfx_core_clobber_impact']=(g,x,y,u,z,p)=>__rec.push(['clobber',x,y,u]); P1_VFX['vfx_core_heal_cleanse']=(g,x,y,u,z,p)=>__rec.push(['heal',x,y,u,p&&p._h]);");
E("p1DrawVfx(__g,{id:'pf_amy_fq_basic'},500,{x:90,y:210,h:100})");   // before the impact (1050)
out.before=painted.length;
E("p1DrawVfx(__g,{id:'pf_amy_fq_basic'},1050+100,{x:90,y:210,h:100})");   // Amy's clip names the clobber
E("p1DrawVfx(__g,{id:'pf_tnb_cer_s1'},1650+100,{x:90,y:210,h:100})");    // TNB's names the heal
out.afterImpact=painted.slice();
painted.length=0; E("p1DrawVfx(__g,{id:'pf_amy_fq_basic'},1050+5000,{x:90,y:210,h:100})"); out.afterEnd=painted.length;
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
check('the first 8 library assets are all registered as effects', o.get('registered') == ['function'] * 8 and len(o.get('lib', [])) == 8, o.get('registered'))
check('only the heal draws on the member', o.get('self') == ['vfx_core_heal_cleanse'], o.get('self'))
check('every effect draws at 21 moments of its length with each of its 32 params variants, no error, no NaN or Infinity in any canvas call', o.get('drawn') == 21 * 32 and o.get('calls', 0) > 2000 and not o.get('bad'), (o.get('drawn'), o.get('calls'), o.get('bad')))
check('nothing draws before the contact and nothing after an effect is over', o.get('before') == 0 and o.get('afterEnd') == 0, (o.get('before'), o.get('afterEnd')))
ai = o.get('afterImpact') or []
check('after the contact the clobber draws on the middle of the foe (300, 155) and the heal on the member (90, 210, height 100)', any(a[0] == 'clobber' and a[1] == 300 and a[2] == 155 for a in ai) and any(a[0] == 'heal' and a[1] == 90 and a[2] == 210 and a[4] == 100 for a in ai), ai)
fx = {m['manifestId']: m['check'] for m in man['moves']}
check('the Guide says Done for contact and hit stop only where a baked clip plays at the manifest numbers (6 moves) and Not yet for Justin\'s stud finder (1700 vs 1300)',
      sorted(k for k, v in fx.items() if v['contactApplied']) == ['amy-fq-basic', 'amy-fq-s1', 'deedee-nf-cap', 'grace-sc-cap', 'tnb-cer-cap', 'tnb-cer-s1'] and not fx['justin-bb-basic']['contactApplied'], [k for k, v in fx.items() if v['contactApplied']])
check('exactly the first 8 library assets are built', [a['id'] for a in man['assets'] if a['status'] != 'todo'] == o.get('lib'), [a['id'] for a in man['assets'] if a['status'] != 'todo'])
html = open(os.path.join(R, 'index.html'), encoding='utf-8').read()
i1, i2, i3 = (html.find('engine/' + n) for n in ('guide-timing.js?v=', 'pass1-vfx.js?v=', 'vfx-library.js?v='))
check('index.html loads guide-timing.js, then pass1-vfx.js, then vfx-library.js, each with a cache tag', 0 < i1 < i2 < i3, (i1, i2, i3))
print('FAILS:', fails); sys.exit(1 if fails else 0)
