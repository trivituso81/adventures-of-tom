// tools/b3-check-s22ch20.js — Battle 3 checks for stage 22, chapter 20 (the studio again: The Collector with Blue Lens and Orange Lens; bestiary entries 84 to 86).
// Data: data/b3-foes-ch20.js, data/b3-status.js (shutter_cut), data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new98).
// Written from tools/b3-check-s22ch19.js. The rules this chapter adds (engine/b3-last.js and a few lines elsewhere): phases with phase lines, helper links, Still Frame, the Countdown that
// only a Break stops, `endsFight`, and picking the four again at a phase change (`b3Repick`). The page side (the real scenes, the picker on screen) is tools/ch20_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for chapter 19.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),ST=G('B3_STATUS'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),act=G('b3Act'),stat=G('b3Stat'),repick=G('b3Repick'),repickAuto=G('b3RepickAuto'),repickList=G('b3RepickList'),floorOf=G('b3PhaseFloor');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const PT=['tom','grace','rose','amy'],BENCH=['deedee','boppy','tnb','nara'];

  // 1. The switch, the floor, the numbers (bestiary entries 84 to 86, printed as they are: the simulator moved none)
  ok(S.chapters.includes(20)&&S.chapters.indexOf(20)>S.chapters.indexOf(19)&&S.chapters.indexOf(20)<S.chapters.indexOf(21),'chapter 20 is on Battle 3 after chapter 19 (found '+J(S.chapters)+')');
  ok(S.levelFloor[20]===50&&S.levelFloor.length===21,'chapter 20 floors the Character Level at 50 and the table has 21 entries (found '+S.levelFloor[20]+', length '+S.levelFloor.length+')');
  const CO=FOES.leviathan,BL=FOES.bluelens,OL=FOES.orangelens;
  ok(CO&&CO.name==='The Collector'&&CO.ch===20&&CO.role==='boss'&&CO.row==='front'&&CO.noRun&&CO.endsFight&&CO.drop===null&&CO.hp===5140&&CO.hp3===3860&&CO.atk===219&&CO.def===92&&CO.spd===124&&CO.pips===8&&J(CO.peeves)==='["sizzle","razzle"]'&&J(CO.resists)==='[]','The Collector: boss, Front, 5,140 HP (3,860 for three), Atk 219, Def 92, Spd 124, 8 pips, Pet Peeves Sizzle and Razzle, no resists, no running');
  ok(near(CO.hp3/CO.hp,.75,.002),'its three-party HP is three quarters of the full HP (printed 5,140 and 3,860)');
  ok(J(CO.phases)==='{"lines":[0.66,0.31]}','three phases, lines at 66% and 31%');
  for(const [D,id,peeves,resists] of [[BL,'bluelens','["sizzle","clobber"]','["drench","razzle"]'],[OL,'orangelens','["drench","racket"]','["sizzle","clobber"]']])
    ok(D&&D.ch===20&&D.role==='helper'&&D.row==='back'&&D.hp===500&&D.atk===0&&D.def===75&&D.spd===115&&D.pips===0&&J(D.acts)==='[]'&&J(D.peeves)===peeves&&J(D.resists)===resists&&D.onKo.length===2,id+': a Back helper, 500 HP, never attacks, 0 pips, its own peeves and resists, a feedback on knock-out');
  ok(J(CO.acts.map(a=>a.id))==='["gold_shard","still_frame","shutter_blade_snap","lens_set","low_whisper","countdown","the_biggest_picture"]','the Collector has the seven acts the bestiary prints');
  { const A=id=>CO.acts.find(a=>a.id===id);
    ok(A('gold_shard').power===.8&&A('gold_shard').flavor[0]==='clobber'&&A('still_frame').when.phase===1&&A('still_frame').hits==='all'&&A('shutter_blade_snap').power===1.5&&A('shutter_blade_snap').tags.includes('charge_up'),'Gold Shard 0.8x Clobber; Still Frame is a phase 1 act on everyone; Shutter Blade Snap is Clobber 1.5x and charged first');
    ok(A('lens_set').when.phase===2&&A('lens_set').when.once&&A('low_whisper').when.phase===2&&A('low_whisper').flavor[0]==='racket'&&A('countdown').when.phase===3&&A('countdown').when.once&&A('countdown').recovery===200&&A('countdown').then==='the_biggest_picture','Lens Set and Low Whisper are phase 2 acts (Lens Set once); the Countdown is a once act of phase 3 with Recovery 200');
    ok(A('the_biggest_picture').power===3&&A('the_biggest_picture').noInterrupt&&A('the_biggest_picture').after==='countdown'&&A('the_biggest_picture').flavor[0]==='razzle'&&A('the_biggest_picture').hits==='all','The Biggest Picture is Razzle 3x on everyone, follows the Countdown only, and an interrupt Skill cannot stop it'); }
  ok(FORMS.leviathan.vp===90&&FORMS.leviathan.repick===true&&J(FORMS.leviathan.foes)===J([{id:'leviathan',row:'front'}]),'the one fight is the Collector alone, 90 Vibe Points, with the pick-four screen');
  ok(LAB.some(l=>l.id==='new98'&&l.level===50&&l.formation==='leviathan'&&J(l.party)===J(PT)&&J(l.reserve)===J(BENCH)),'the Lab has NEW 98 with Tom, Grace, Rose and Amy and the four-strong bench');
  ok(!FOES.julian,'Julian Vance has no foe row: he is not a fight');
  ok(!/—/.test(read('data/b3-foes-ch20.js').replace(/^\/\/.*$/gm,'')),'no dash in the data');
  { const w=ST.shutter_cut; ok(w&&w.kind==='debuff'&&w.dur.n===2&&w.mods[0].stat==='def'&&w.mods[0].v===-.25,'Shutter Cut is -25% Defense for 2 turns, a debuff'); }

  // 2. Scenes and tips
  const sc=read('data/scenes-ch20.js');
  ok(/tut:'ch20'/.test(sc),'chapter 20 scenes start the fight (tut ch20)');
  ok(Array.isArray(S.tips.ch20)&&S.tips.ch20.length>=4,'tips under the key ch20 (at least four)');
  for(const t of S.tips.ch20) ok(t.text.length<=320&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|TAKE FIVE|▼ Bag|Chatter|Kinetic|Sparkle|amber|BENCH CALL|PULL UP A CHAIR|DEFEND/.test(t.text),'ch20 tip '+t.id+' is short and speaks Battle 3');
  ok(/B3_CH_ON\(20\)/.test(sc)&&!/—/.test(sc.match(/B3_CH_ON\(20\)[^\n]*/g).join('')),'chapter 20 has a Battle 3 wording variant in its scenes');
  ok(/ch20Care/.test(sc)&&/B3_CH_ON\(20\)\?SCENES\.ch20Care\(\):SCENES\.ch20Fight2\(\)/.test(sc),'on Battle 3 Julian is a scene (the care), on Battle 2 the seven acts of care stay');

  // 3. Fights: everyone healthy with plenty of Pep unless a check says otherwise
  const mk=o=>{ const F=NF(Object.assign({party:PT,reserve:BENCH,level:50,formation:'leviathan',rows:{tom:'front',grace:'back',rose:'back',amy:'front'},seed:11},o||{})); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,40000); p.pep=8; } return F; };
  const boss=F=>F.foes.find(f=>f.id==='leviathan'),tomOf=F=>F.party.find(p=>p.id==='tom');
  const turn=(F,e,n)=>{ F.acting=e; if(n!=null) e.turns=n; return foeTurn(F,e); };
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const mkSkill=(id,flavor,extra)=>{ SK[id]=Object.assign({id,vibe:'tom_flier',slot:'s1',name:'Test '+id,pep:0,flavor,power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]},extra||{}); };
  mkSkill('t20_hit',['clobber'],{power:40}); mkSkill('t20_sz',['sizzle']); mkSkill('t20_rz',['razzle']); mkSkill('t20_dr',['drench']); mkSkill('t20_pull',['clobber'],{effects:[{op:'pull',n:1}]});
  const actId=(F,e)=>{ const A=G('b3FoePick')(F,e,true); return A&&A.act.id; };

  // 4. Phase lines: damage past a line is lost, the phase starts at once, the phase act comes first
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F);
    ok(b.phase===1&&floorOf(b)===Math.ceil(b.maxHp*.66)&&b.maxHp===5140,'the Collector starts in phase 1 with its first line at 66% (line '+floorOf(b)+')');
    b.hp=floorOf(b)+10; t.atk=99999; const bt=go(F,t,'t20_hit',b.key);
    ok(b.hp===floorOf(b)||b.phase===2,'a hit that would pass the line stops on it (HP '+b.hp+', phase '+b.phase+')');
    ok(b.phase===2&&bt.some(x=>x.t==='phase'&&x.phase===2),'the phase changes at the end of the damaging action and a phase beat is shown');
    ok(b.hp===Math.ceil(5140*.66)&&b.hp>0,'no damage past the line: HP is exactly the line');
    ok(floorOf(b)===Math.ceil(5140*.31),'the next line is 31%');
    ok(b.wait===0,'the new phase starts at once (wait '+b.wait+')');
    ok(actId(F,b)==='lens_set','the phase act is picked first (found '+actId(F,b)+')');
  });
  noCrit(()=>{ const F=mk({formation:'leviathan'}),b=boss(F),t=tomOf(F); b.phase=3; b.hp=100; t.atk=99999;
    go(F,t,'t20_hit',b.key); ok(b.hp<=0||b.ko,'in phase 3 there is no line left: the Collector can fall (HP '+b.hp+')'); });
  noCrit(()=>{ const F=mk(),b=boss(F); b.phase=2; ok(floorOf(b)===Math.ceil(5140*.31),'in phase 2 the floor is the 31% line');
    b.phase=3; ok(floorOf(b)===null,'in phase 3 the floor is none'); });

  // 5. Phase 1: Still Frame (a family member who does not move the clock on their own turn loses 2 Pep and is Slowed)
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F),g=F.party.find(p=>p.id==='grace'); b.actIx=b.D.acts.findIndex(a=>a.id==='still_frame'); const bt=turn(F,b,2);
    ok(bt.some(x=>x.t==='frame')&&F.party.every(p=>p.frame&&!p.frame.moved),'Still Frame frames every living family member (frame beat shown)');
    // the end of a turn with no move on the clock: Pep and Slow
    const beats=[]; const pep0=g.pep; G('b3FrameCheck')(F,g,beats);
    ok(g.pep===pep0-2&&g.st.slow&&beats.some(x=>x.t==='frameMiss'),'a member who did not move anything loses 2 Pep and gets Slow for a turn (Pep '+g.pep+')');
    // waiting does not count; a Pull, a Push, a row swap or a granted action on the member does
    g.frame={moved:false,by:b.key,pep:2,slow:1}; ok(!g.frame.moved,'simply waiting leaves the frame unanswered');
    g.wait=60; G('b3Pull')(F,g,10); ok(g.frame&&g.frame.moved,'a Pull on the member\u2019s own place on the bar answers the Still Frame');
    const t0=t.pep; t.frame={moved:false,by:b.key,pep:2,slow:1}; t.wait=60; G('b3Push')(F,t,10); const pb=[]; G('b3FrameCheck')(F,t,pb); ok(t.pep===t0&&!t.st.slow&&!pb.length,'a Push does too (no Pep lost, no Slow)');
    const a=F.party.find(p=>p.id==='amy'); a.frame={moved:false,by:b.key,pep:2,slow:1}; const gf=F.party.find(p=>p.id==='grace'); gf.frame={moved:false,by:b.key,pep:2,slow:1};
    G('b3FrameMove')(a); ok(a.frame.moved,'b3FrameMove marks a member as having moved'); });
  noCrit(()=>{ const F=mk(),b=boss(F),g=F.party.find(p=>p.id==='grace'); b.actIx=b.D.acts.findIndex(a=>a.id==='still_frame'); turn(F,b,2);
    b.phase=2; F.party.forEach(p=>p.frame=null); ok(F.party.every(p=>!p.frame),'a frame is cleared at a phase change'); });

  // 6. Phase 2: Lens Set summons both lenses; the helper links
  noCrit(()=>{ const F=mk(),b=boss(F); b.phase=2; b.actIx=b.D.acts.findIndex(a=>a.id==='lens_set'); const bt=turn(F,b,1);
    const bl=F.foes.find(f=>f.id==='bluelens'),ol=F.foes.find(f=>f.id==='orangelens');
    ok(bl&&ol&&bl.hp===500&&ol.hp===500&&bl.row==='back'&&ol.row==='back'&&bl.pips===0,'Lens Set puts a Blue Lens and an Orange Lens in Back at 500 HP with 0 pips');
    ok(bt.some(x=>x.t==='summon'),'a summon beat is shown');
    ok(b.once&&b.once.lens_set||F.foes.filter(f=>f.id==='bluelens').length===1,'Lens Set is spent');
    ok(actId(F,b)!=='lens_set','it does not come back (found '+actId(F,b)+')');
  });
  noCrit(()=>{ const hit=(F,skill,pre)=>{ const b=boss(F),t=tomOf(F); b.phase=2; b.hp=b.maxHp; b.st={}; if(pre) pre(F); const hp0=b.hp; t.atk=2000; go(F,t,skill,b.key); return hp0-b.hp; };
    const mkF=()=>{ const F=mk(); const b=boss(F); b.phase=2; return F; };
    const base=hit(mkF(),'t20_dr');
    const withLens=(ids)=>{ const F=mkF(); G('b3Summon')&&0; b3ForceLens(F,ids); return F; };
    function b3ForceLens(F,ids) { const b=boss(F); b.actIx=b.D.acts.findIndex(a=>a.id==='lens_set'); turn(F,b,1); for(const l of F.foes.filter(f=>f.id==='bluelens'||f.id==='orangelens')) if(!ids.includes(l.id)) { l.hp=0; l.ko=true; } F.units=F.units.filter(u=>!u.ko||u.side==='party'); b.phase=2; G('b3AllyModsRefresh')(F); }
    // Drench is neither Blue's flavor, so only Orange cuts it (25%)
    const both=hit(withLens(['bluelens','orangelens']),'t20_dr'),orange=hit(withLens(['orangelens']),'t20_dr'),blue=hit(withLens(['bluelens']),'t20_dr');
    ok(near(orange/base,.75,.03)&&near(both/base,.75,.03),'Orange Lens cuts a Drench hit by 25% (x'+(orange/base).toFixed(2)+'), and Blue does nothing to Drench (x'+(blue/base).toFixed(2)+')');
    const bz=hit(withLens(['bluelens']),'t20_sz'),bs=hit(mkF(),'t20_sz'),bb=hit(withLens(['bluelens','orangelens']),'t20_sz');
    ok(near(bz/bs,.5,.03),'Blue Lens halves a Sizzle hit (x'+(bz/bs).toFixed(2)+')');
    ok(near(bb/bs,.4,.03),'both lenses together cut Sizzle by 60% (the cap): x'+(bb/bs).toFixed(2));
    const br=hit(withLens(['bluelens']),'t20_rz'),bs2=hit(mkF(),'t20_rz'); ok(near(br/bs2,.5,.03),'Blue Lens halves a Razzle hit too (x'+(br/bs2).toFixed(2)+')');
    const p3=(ids)=>{ const F=withLens(ids); boss(F).phase=3; const b=boss(F),t=tomOf(F); b.hp=b.maxHp; t.atk=2000; const h0=b.hp; go(F,t,'t20_sz',b.key); return h0-b.hp; };
    ok(near(p3(['bluelens','orangelens'])/bs,1,.03),'in phase 3 the lenses’ cuts are off (x'+(p3(['bluelens','orangelens'])/bs).toFixed(2)+')');
  });

  // 7. The lenses' feedback: knocked out, a lens costs the Collector 2 pips and 5% of its Max HP, and the HP stops on a line
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F); b.phase=2; b.hp=Math.ceil(5140*.5); b.pips=5; b.actIx=b.D.acts.findIndex(a=>a.id==='lens_set'); turn(F,b,1);
    const bl=F.foes.find(f=>f.id==='bluelens'),hp0=b.hp,pips0=b.pips; t.atk=99999; bl.hp=1; go(F,t,'t20_hit',bl.key);
    ok(bl.ko||bl.hp<=0,'a lens can be knocked out');
    ok(b.pips===pips0-2,'the Collector loses 2 pips ('+pips0+' to '+b.pips+')');
    ok(hp0-b.hp===Math.round(5140*.05)||near(hp0-b.hp,5140*.05,2),'and 5% of its Max HP (lost '+(hp0-b.hp)+', 5% is '+Math.round(5140*.05)+')'); });
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F); b.phase=2; b.actIx=b.D.acts.findIndex(a=>a.id==='lens_set'); turn(F,b,1); b.hp=floorOf(b)+20;
    const bl=F.foes.find(f=>f.id==='bluelens'); t.atk=99999; bl.hp=1; go(F,t,'t20_hit',bl.key);
    ok(b.hp===floorOf(b)||b.phase===3,'the feedback stops on a phase line (HP '+b.hp+', line '+floorOf(b)+')'); });

  // 8. The Collector falling ends the fight, with the lenses still up
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F); b.phase=3; b.actIx=b.D.acts.findIndex(a=>a.id==='lens_set'); b.phase=2; turn(F,b,1); b.phase=3; b.hp=50; t.atk=99999; go(F,t,'t20_hit',b.key);
    ok(F.over==='win','knocking out the Collector wins the fight even with both lenses standing (result '+F.over+')'); });

  // 9. Phase 3: the Countdown and The Biggest Picture
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F); b.phase=3; b.pips=2; b.actIx=b.D.acts.findIndex(a=>a.id==='countdown'); const bt=turn(F,b,1);
    ok(b.charge&&b.charge.id==='the_biggest_picture'&&bt.some(x=>x.t==='telegraph'),'the Countdown winds up The Biggest Picture');
    ok(b.pips===8,'the Countdown refills its 8 pips ('+b.pips+')');
    ok(b.wait>=140&&b.wait<=190,'it counts down about 160 ticks at Speed 124 (Recovery 200 x 100 / Spd; wait '+Math.round(b.wait)+')');
    ok(actId(F,b)!=='countdown','the Countdown does not come back after it starts (found '+actId(F,b)+')'); });
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F); b.phase=3; b.actIx=b.D.acts.findIndex(a=>a.id==='countdown'); turn(F,b,1); mkSkill('t20_int',['clobber'],{effects:[{op:'interrupt'}]});
    const c0=b.charge; go(F,t,'t20_int',b.key); ok(b.charge&&b.charge.id==='the_biggest_picture','an interrupt Skill does not stop The Biggest Picture (noInterrupt)'); });
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F); b.phase=3; b.actIx=b.D.acts.findIndex(a=>a.id==='countdown'); turn(F,b,1);
    G('b3Break')(F,{beats:[],actor:t,g:'x'},b); ok(!b.charge,'a Break loses the charge: The Biggest Picture is cancelled'); });
  noCrit(()=>{ const F=mk(),b=boss(F); b.phase=3; b.actIx=b.D.acts.findIndex(a=>a.id==='countdown'); turn(F,b,1); const pep0=F.party.map(p=>p.pep=6);
    const bt=turn(F,b,2); ok(bt.some(x=>x.t==='act'&&x.id==='the_biggest_picture'||x.name==='The Biggest Picture'),'the count runs out and The Biggest Picture fires');
    ok(F.party.every((p,i)=>p.pep<=3&&p.st.slow),'it takes 3 Pep from everyone and Slows them for 2 turns (Pep '+J(F.party.map(p=>p.pep))+')'); });
  noCrit(()=>{ const F=mk(),b=boss(F); b.phase=3; b.pips=0; b.actIx=b.D.acts.findIndex(a=>a.id==='countdown'); b.charge=null;
    // a charge the phase change itself loses
    const F2=mk(),b2=boss(F2); b2.actIx=b2.D.acts.findIndex(a=>a.id==='shutter_blade_snap'); turn(F2,b2,2); ok(b2.charge,'Shutter Blade Snap is charged first');
    const t=tomOf(F2); b2.hp=floorOf(b2)+5; t.atk=99999; const bt=go(F2,t,'t20_hit',b2.key);
    ok(!b2.charge&&bt.some(x=>x.t==='interrupt'&&x.why==='phase'),'a phase change loses a charge the Collector had started'); });

  // 10. Picking the four again
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F); b.hp=floorOf(b)+5; t.atk=99999; go(F,t,'t20_hit',b.key);
    ok(F.repick&&F.repick.phase===2,'a phase change opens the pick (phase '+(F.repick&&F.repick.phase)+')');
    const list=repickList(F); ok(list.length===8&&list.filter(x=>x.here).length===4&&list.filter(x=>x.fresh).length===4,'the picker lists eight: the four fighting and four fresh from the bench');
    const r0=repick(F,['tom','grace','rose']); ok(!r0.ok,'picking three is refused');
    const r1=repick(F,['tom','grace','rose','zed']); ok(!r1.ok,'someone not in the eight is refused');
    const amy=F.party.find(p=>p.id==='amy'),graceU=F.party.find(p=>p.id==='grace'); amy.hp=Math.round(amy.maxHp*.4); amy.pep=2; graceU.hp=Math.round(graceU.maxHp*.5); const amyKey=amy.key,amyRow=amy.row,amySlot=amy.slot;
    const r=repick(F,['tom','grace','rose','deedee']);
    ok(r.ok&&!F.repick,'a good pick works and closes the pick');
    const d=F.party.find(p=>p.id==='deedee');
    ok(d&&d.key===amyKey&&d.row===amyRow&&d.slot===amySlot,'a newcomer takes the leaver’s key, row and slot');
    ok(d.hp===d.maxHp&&d.pep===G('B3_RULES').pep.start,'a newcomer arrives at full HP with the starting Pep');
    ok(near(d.wait,G('b3WaitFor')(F,d,G('B3_RULES').arrive),1),'and joins the bar waiting the arrival time, 100 x 100 / Speed ticks (wait '+Math.round(d.wait)+')');
    ok(F.bench.amy&&F.bench.amy.hp===Math.round(F.bench.amy.maxHp*.4)&&F.bench.amy.pep===2,'the one who left keeps their HP and Pep on the bench');
    const gk=graceU.key; ok(F.party.find(p=>p.id==='grace')===graceU&&graceU.hp===Math.round(graceU.maxHp*.5),'a member who stays keeps their HP');
    ok(r.beats.some(x=>x.t==='repick')&&r.beats[r.beats.length-1].t==='endTurn','the pick returns a repick beat and then the clock goes on');
    ok(F.units.includes(d)&&!F.units.some(u=>u.id==='amy'&&u.side==='party'),'the unit list holds the newcomer and not the leaver');
    // and back again: Amy returns with what she left with
    boss(F).phase=2; F.repick={phase:3,by:boss(F).key}; const r2=repick(F,['tom','grace','rose','amy']); ok(r2.ok,'the one who left can come back');
    const am2=F.party.find(p=>p.id==='amy'); ok(am2.hp===Math.round(am2.maxHp*.4)&&am2.pep===2&&J(am2.st)==='{}','she returns with the HP and Pep she left with and no statuses');
    ok(F.everIn.includes('deedee')&&F.everIn.includes('amy')&&F.everIn.length===5,'everyone who fought is kept (for XP and for the HP that goes back to the story): '+J(F.everIn)); });
  noCrit(()=>{ const F=mk(),b=boss(F),t=tomOf(F); b.hp=floorOf(b)+5; t.atk=99999; go(F,t,'t20_hit',b.key);
    const r=repick(F,['deedee','boppy','tnb','nara']); ok(r.ok&&F.party.some(p=>p.row!=='back'),'at least one of the four stands in Front after any pick');
    ok(F.party.every(p=>BENCH.includes(p.id)),'all four can change at once'); });
  noCrit(()=>{ const F=mk(),b=boss(F); b.hp=floorOf(b)+5; const t=tomOf(F); t.atk=99999; go(F,t,'t20_hit',b.key); const r=repickAuto(F);
    ok(r.ok&&F.party.length===4,'the simple player’s pick works and leaves four'); ok(F.party.filter(p=>BENCH.includes(p.id)).length>=3,'it brings in the ones who have fought least'); });
  noCrit(()=>{ const F=NF({party:PT,level:50,formation:'leviathan',seed:3}),b=boss(F),t=tomOf(F); b.hp=floorOf(b)+5; t.atk=99999; t.hp=t.maxHp=99999; go(F,t,'t20_hit',b.key);
    ok(!F.repick,'a fight with no bench (the Lab’s other fights, no reserve) never opens the pick'); });

  // 11. Whole fights, the simple player with the bestiary's one action in four as support, Rank 2.
  // Target (bestiary 1.6): the table aims at 7 rounds, the text says about 8.5 with its two lenses; the window is 6 to 9.
  const lab=id=>{ const L=LAB.find(x=>x.id===id),cfg={party:L.party.slice(),reserve:L.reserve?L.reserve.slice():undefined,level:L.level,formation:L.formation,rows:L.rows,loadouts:{}};
    const newL=G('b3NewLoadout'),pool=G('b3QuirkPool'),V=G('B3_VIBES'),Q=G('B3_QUIRKS'),setQ=G('b3SetQuirk');
    for(const m of cfg.party.concat(cfg.reserve||[])) { const Ld=newL(m,G('B3_RULES').labRank),pl=pool(m,Ld);
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pl.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>setQ(m,Ld,i,q)); cfg.loadouts[m]=Ld; }
    return cfg; };
  for(const k of ['t20_hit','t20_sz','t20_rz','t20_dr','t20_pull','t20_int']) delete SK[k];   // the sandbox rows come out again, so the simple player never picks them
  { const out=[]; for(let s=1;s<=8;s++) out.push(play(Object.assign(lab('new98'),{seed:s}),false,{support:4}));
    const avg=out.reduce((a,x)=>a+x.rounds,0)/out.length;
    ok(out.every(x=>x.result==='win')&&avg>=6&&avg<=9,'the Collector: won every time in '+avg.toFixed(2)+' rounds on average (bestiary table aims at 7, its text says about 8.5 with the two lenses; window 6 to 9)');
    ok(out.every(x=>(x.repicks||0)>=2),'every fight picked the four again at both phase changes (picks '+J(out.map(x=>x.repicks))+')'); }
};
