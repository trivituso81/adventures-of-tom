// tools/b3-check-s16.js — Battle 3 checks for stage 16, the Tombo skins on the Full Family Ruckus (data/b3-tombo-skins.js, engine/b3-skins.js).
// The page side (the skin's name on the tray and on the screen at a Full Family Ruckus, portrait and landscape) is tested in a browser by
// `python3 tools/b3_test.py s16`. This file holds what is plain data and the choosing rule: the table matches battle 2's Tombos, every recorded
// line it plays exists, the live skin for a pair follows the rank and the story flags, and the Tombo toasts of the switched chapters have a
// Battle 3 version that names a skin in the table. `node tools/b3-sim.js check` runs it after the file for stage 18's bonus chapter.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
module.exports=function(T) {
  const {G,ok}=T;
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),J=x=>JSON.stringify(x);
  // The table and the choosing rule in a context of their own: the play layer reads B3 (cfg.lab), flag() and b3Unit().
  const flags={},B3={cfg:{lab:false}};
  const ctx=vm.createContext({Math,JSON,Object,Array,String,Number,Error,console:{log(){},error(){}},B3,flag:k=>flags[k],
    b3Unit:(F,k)=>F.units[k]});
  vm.runInContext(read('data/lines.js')+'\n;this.LINES=LINES;',ctx);
  vm.runInContext(read('data/b3-tombo-skins.js'),ctx);
  vm.runInContext(read('engine/b3-skins.js'),ctx);
  const run=s=>vm.runInContext(s,ctx),S=run('B3_SKINS'),CAST=G('B3_CAST'),LINES=ctx.LINES;
  const clear=()=>{ for(const k of Object.keys(flags)) delete flags[k]; B3.cfg.lab=false; };
  const live=(a,b)=>{ const s=run('b3SkinFor')(a,b); return s?s.id:null; };

  // 1. The table: 21 Primaries (7 partners x 3 tiers), 4 Family Finishes, Birthday Wish; ids and flags are battle 2's
  ok(S.length===26,'26 skins: 21 Primary Tombos, 4 Family Finishes and Birthday Wish (found '+S.length+')');
  ok(new Set(S.map(s=>s.id)).size===S.length,'skin ids are unique');
  const b2=read('data/battle2-data.js')+read('data/bonus-nine-scoops.js');
  for(const s of S) {
    ok(s.flag==='tombo:'+s.id,'skin '+s.id+' unlocks on the flag tombo:'+s.id+' (found '+s.flag+')');
    ok(new RegExp("\\{id:'"+s.id+"',[^\\n]*flag:'"+s.flag+"'").test(b2),'skin '+s.id+' is battle 2\'s Tombo of the same id and flag');
    ok(typeof s.name==='string'&&s.name.length>2&&!/—|–/.test(s.name),'skin '+s.id+' has a name with no dash');
    ok(Array.isArray(s.pairs)&&s.pairs.length>=1&&s.pairs.every(p=>p.length===2&&p[0]!==p[1]&&CAST[p[0]]&&CAST[p[1]]),'skin '+s.id+' pairs are two different family members with a Battle 3 kit');
    ok(s.rank>=1&&s.rank<=4,'skin '+s.id+' has a rank 1 to 4');
    // Every recorded line it plays exists in data/lines.js, and each of the pair has one (the game plays both)
    // Birthday Wish's lines are added by data/bonus-nine-scoops.js (Object.assign(LINES.<who>,{...wish:[...]})), a file this check does not run
    const bonusLine=(who,key)=>{ const i=read('data/bonus-nine-scoops.js').indexOf('Object.assign(LINES.'+who+',{'); if(i<0) return false; const e=read('data/bonus-nine-scoops.js').indexOf('});',i); return new RegExp('\\n  '+key+':\\[').test(read('data/bonus-nine-scoops.js').slice(i,e)); };
    if(s.id==='wish') for(const [who,key] of s.lines) ok(bonusLine(who,key),'skin wish line '+who+'.'+key+' exists (bonus chapter lines)');
    else for(const [who,key] of s.lines) ok(LINES[who]&&Array.isArray(LINES[who][key])&&LINES[who][key].length>=1&&!LINES[who][key].some(t=>/—/.test(t)),'skin '+s.id+' line '+who+'.'+key+' exists');
    for(const p of s.pairs) { const say=run('b3SkinLines')(s,p[0],p[1]); ok(say.some(l=>l[0]===p[0])&&say.some(l=>l[0]===p[1]),'skin '+s.id+' has a line for both of '+J(p)); }
  }
  for(const partner of ['grace','rose','deedee','tnb','nara','boppy','amy']) {
    const mine=S.filter(s=>s.rank<4&&s.pairs.length===1&&s.pairs[0][0]==='tom'&&s.pairs[0][1]===partner);
    ok(J(mine.map(s=>s.rank))===J([1,2,3]),'Tom and '+partner+' have a skin of each tier 1, 2 and 3 ('+J(mine.map(s=>s.rank))+')');
  }

  // 2. The live skin for a pair
  clear();
  ok(live('tom','grace')===null&&live('grace','tom')===null,'no flags set: no skin, the plain Full Family Ruckus');
  flags['tombo:grace1']=true;
  ok(live('tom','grace')==='grace1'&&live('grace','tom')==='grace1','tombo:grace1 set: Squishy Delivery is live for Tom and Grace, in either order');
  ok(live('tom','rose')===null,'a skin is only live for its own pair');
  flags['tombo:grace2']=true;
  ok(live('tom','grace')==='grace2','the newest (highest tier) unlocked is the one live: Uncle Spotter Toss');
  flags['tombo:grace3']=true; flags['tombo:ff4']=true;
  ok(live('tom','grace')==='ff4','a Family Finish outranks a Primary for the pair who speak in it (The Extra Place)');
  ok(live('tom','justin')===null&&live('tom','olivia')===null,'Justin and Olivia have no Tombo, so no skin');
  flags['tombo:wish']=true;
  ok(live('tom','rose')==='wish'&&live('grace','tom')==='wish','Birthday Wish is live for Tom with Rose and for Tom with Grace once tombo:wish is set');
  ok(live('rose','grace')===null,'Birthday Wish is not live for Rose and Grace without Tom (nobody speaks it that way)');
  clear(); flags['tombo:ff3']=true;
  ok(live('deedee','boppy')==='ff3'&&live('tom','deedee')===null&&live('tom','boppy')===null,'Fifty-One Years & Counting is live for Deedee and Boppy only');
  clear(); B3.cfg.lab=true;
  ok(live('tom','amy')==='amy3','in a Battle Lab fight every skin counts as unlocked (Tom and Amy: the tier 3 skin)');
  ok(live('rose','amy')==='ff2'&&live('rose','tnb')==='ff1','in the Lab, Run With Us, Mommy! and Sleepover at Tom\'s are live for their pairs');
  clear();

  // 3. The unit-key form and the spoken lines
  const F={units:{p0:{id:'tom'},p1:{id:'grace'},p2:{id:'justin'}}};
  flags['tombo:grace1']=true;
  ok(run('b3SkinForUnits')(F,'p0','p1').id==='grace1'&&run('b3SkinForUnits')(F,'p1','p0').id==='grace1'&&run('b3SkinForUnits')(F,'p0','p2')===null,'b3SkinForUnits finds the skin by the two units\' ids');
  const said=[]; ctx.say=(w,k,d)=>said.push([w,k,d]); run('b3SkinSay')(S.find(s=>s.id==='grace1'),'tom','grace');
  ok(J(said.map(x=>x.slice(0,2)))===J([['grace','tombo'],['tom','tombograce']]),'Squishy Delivery plays Grace\'s line, then Tom\'s ('+J(said)+')');
  ok(said[1][2]>said[0][2],'the second line starts after the first');
  said.length=0; run('b3SkinSay')(S.find(s=>s.id==='wish'),'tom','rose');
  ok(J(said.map(x=>x.slice(0,2)))===J([['rose','wish'],['tom','wish']]),'Birthday Wish for Tom and Rose plays only their two lines ('+J(said)+')');
  clear();

  // 4. The rules files do not know about skins (a skin carries no numbers), and no battle 2 file is touched
  for(const f of ['engine/b3-core.js','engine/b3-ruckus.js','engine/b3-resolve.js','engine/b3-ops.js']) ok(!/B3_SKIN|b3Skin/.test(read(f)),f+' has no skin code (rules stay plain)');

  // 5. The Tombo toasts of the switched chapters: each has a Battle 3 version that names skins of the table
  const names=new Set(S.map(s=>s.name));
  const scenes=read('data/scenes.js'),bonus=read('data/bonus-nine-scoops.js');
  const toasts=[...scenes.matchAll(/\{if:\(\)=>!B3_CH_ON\((\d+)\),then:\[\{toast:'New Tombos?:[^\n]*?\],else:(\[[^\n]*?\])\},/g)];
  ok(toasts.length===11,'11 old Tombo toasts in data/scenes.js (chapter 1 to 10) each have a Battle 3 else branch (found '+toasts.length+')');
  const chs=toasts.map(m=>+m[1]); ok(J(chs)===J([1,1,2,2,3,5,5,6,6,7,10]),'the toasts sit in chapters 1, 2, 3, 5, 6, 7 and 10 as before ('+J(chs)+')');
  for(const m of toasts) {
    const els=m[2]; ok(/toast:'New Tombo skins?: /.test(els),'chapter '+m[1]+' Tombo toast has a Battle 3 version');
    ok(!/HEART|▲|▶︎|ATTACK|HEAL|—/.test(els),'chapter '+m[1]+' Battle 3 Tombo toast uses no battle 2 words or dashes');
    const named=[...els.matchAll(/([A-Z][^()]*?) \(Tom \+ (?:Grace|Rose|Deedee|Nara|TNB|Boppy|Amy)/g)].map(x=>x[1].replace(/^.*skins?: /,''));
    ok(named.length>=1&&named.every(n=>names.has(n)),'chapter '+m[1]+' toast names skins in the table ('+J(named)+')');
  }
  ok(/else:\[\{toast:'New Tombo skins: Squishy Delivery/.test(bonus),'the bonus chapter\'s Tombos ready toast has a Battle 3 version');
  ok(/B3_CH_ON\(21\),then:\[\{toast:'New Tombo skin: Birthday Wish/.test(bonus),'Birthday Wish has a toast under Battle 3 when its flag is set');

  // 6. The files are wired in index.html, the data before the play layer
  const html=read('index.html'),at=n=>html.indexOf(n);
  ok(at('data/b3-tombo-skins.js')>0&&at('engine/b3-skins.js')>at('data/b3-tombo-skins.js')&&at('engine/b3-play.js')>at('engine/b3-skins.js'),'index.html loads the skin table, then b3-skins.js, then b3-play.js');
};
