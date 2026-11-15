// tools/script-index/walk.js: runs INSIDE the game page (build.py evaluates it). Reads every scene's step list (it does not play anything)
// and returns the Script Editor index: chapters, scenes, and for each scene the ordered steps. A talk step lists its lines with the mood,
// talking pose and listener reactions the game would use. Every other step gets a plain-words description or null (null = not worth saying).
// Step ids are paths: "7" is top-level step 7, "7.all.2" is step 2 inside the {all:[...]} at step 7 (also .seq, .then, .else).
(ACTIONS)=>{
  const out={scenes:{},order:[],chapters:[],errs:[],missing:[]};
  const sceneChapter=id=>{ let m=/^ch(\d+)[A-Z]/.exec(id); if(m) return +m[1]; if(/^ns[A-Z]/.test(id)) return 'ns'; if(id==='opening') return 1; if(id==='part2Open') return 11; return null; };
  const trig={}; for(const t of (typeof TRIGGERS!=='undefined'?TRIGGERS:[])) if(t.scene&&!trig[t.scene]) trig[t.scene]={map:t.map,at:t.at||null,id:t.id,flag:(t.when&&t.when.flag)||null,notFlag:(t.when&&t.when.notFlag)||null};
  const words=id=>id.replace(/^ch\d+/,'').replace(/^ns/,'').replace(/([a-z])([A-Z0-9])/g,'$1 $2').replace(/^\s+/,'')||id;
  const nm=a=>typeof a==='string'?a:(a&&a.name)||'someone';
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const hasMood=(who,text,ch)=>{ const k=who+'|'+text; const M=typeof EMOTION_MOODS!=='undefined'?EMOTION_MOODS:{}; return M[k+'|'+ch]||M[k]||null; };
  const talkOf=(who,text,ch)=>{ const k=who+'|'+text; const T=typeof TALK_TYPES!=='undefined'?TALK_TYPES:{}; return T[k+'|'+ch]||T[k]||null; };
  const reactOf=(who,text,ch)=>{ const R=typeof EMOTION_REACTIONS!=='undefined'?EMOTION_REACTIONS:{}; return R[who+'|'+text+'|'+ch]||null; };
  const clipOf=(who,text)=>{ try { return !!dvClip(who,text); } catch(e) { return false; } };
  function describe(o,sid,path,cast){
    const key=sid+':'+path;
    if(ACTIONS[key]!==undefined) return ACTIONS[key]||null;
    if('walk' in o) { cast.add(nm(o.walk)); return null; }
    for(const k of ['place','face','pose','show','hide','hold','hearts','fadeActor']) if(k in o) { for(const a of [].concat(o[k])) cast.add(nm(a)); }
    if('spawn' in o) { const s=o.spawn; const n=nm(Array.isArray(s)?s[0]:(s&&s.name)||s); if(n&&typeof n==='string') { cast.add(n); return '['+cap(n)+' shows up.]'; } return null; }
    if('despawn' in o) return '['+cap(nm(o.despawn))+' leaves.]';
    if('battle' in o) { const b=o.battle; const n=typeof b==='string'?b:(b&&(b.name||b.monster))||'a monster'; return '[A fight starts with '+n+'.]'; }
    if('card' in o) return '[Title card.]';
    if('partCard' in o) return '[Part '+o.partCard+' title card.]';
    if('give' in o) return '[Tom gets '+o.give+'.]';
    if('join' in o) return '['+cap(o.join)+' joins the group.]';
    if('leave' in o) return '['+cap(o.leave)+' leaves the group.]';
    if('knock' in o) return '['+cap(nm(o.knock))+' gets thrown back.]';
    if('clearout' in o) return null;
    if('call' in o||'step' in o) {
      const f=o.call||o.step; const src=typeof f==='function'?String(f):'';
      if(src.length<170||typeof f!=='function') return null;   // short calls are flags, sounds and bubbles
      out.missing.push(key); return '[something happens]';
    }
    return null;
  }
  function walkSteps(steps,sid,prefix,ch,cast,list){
    steps.forEach((o,n)=>{
      const path=prefix+n;
      if(!o||typeof o!=='object') return;
      if('talk' in o) {
        const who=o.talk,lines=Array.isArray(o.lines)?o.lines:[o.lines]; cast.add(who);
        list.push({i:path,k:'talk',who,vid:(typeof dvVoiceOf==='function'&&dvVoiceOf(who))||null,
          lines:lines.map((t,j)=>({t,v:(o.voice&&o.voice[j])||null,mood:hasMood(who,t,ch),talk:talkOf(who,t,ch),react:reactOf(who,t,ch),clip:clipOf(who,t)}))});
        return;
      }
      let did=false;
      for(const kind of ['all','seq','then','else']) if(Array.isArray(o[kind])) {
        const label=kind==='then'?'if: yes':kind==='else'?'if: no':null;
        list.push({i:path,k:'group',op:kind,label});
        walkSteps(o[kind],sid,path+'.'+kind+'.',ch,cast,list); did=true;
      }
      if(did) return;
      const op=Object.keys(o).find(k=>k!=='time'&&k!=='speed')||'?';
      const rec={i:path,k:'step',op,d:describe(o,sid,path,cast)};
      // hints for the conversation split (tools/script-index/convos.py): a move to another map, a fade, a long wait, who arrives or leaves
      if(op==='call'||op==='step') { const f=o.call||o.step,src=typeof f==='function'?String(f):'';
        if(/currentMap\s*=|[a-z0-9]Place\(|refreshAreaUI\(/.test(src)) { rec.mv=1; const m=/worlds\.(\w+)|Place\(\s*'(\w+)'/.exec(src); if(m) rec.to=m[1]||m[2]; } }
      if(op==='fade') rec.fd=o.fade;
      if(op==='wait') rec.w=+o.wait||0;
      if(['spawn','despawn','join','leave'].includes(op)) { const s=o[op]; const n=typeof s==='string'?s:nm(Array.isArray(s)?s[0]:s); if(typeof n==='string') rec.who=n; }
      list.push(rec);
    });
  }
  // A scene function can branch on game state (bag, flags). Read it twice: as it stands, and again with every flag true and every item in the bag,
  // then add the lines only the second reading has (marked cond) after the line that came before them.
  const evalScene=(f,all)=>{
    if(!all) return f({});
    const oflags=STORY.flags,obag=bag.slice(); let r;
    try { STORY.flags=new Proxy(Object.assign({},oflags),{get:(t,k)=>k in t?t[k]:true}); for(const id of Object.keys(items)) if(!bag.includes(id)) bag.push(id); r=f({}); } finally { STORY.flags=oflags; bag.length=0; obag.forEach(x=>bag.push(x)); }
    return r;
  };
  const talkRefs=list=>{ const r=[]; for(const st of list) if(st.k==='talk') for(const ln of st.lines) r.push([st.who,ln.t]); return r; };
  const ids=Object.keys(SCENES); const seenCh={};
  for(const id of ids) {
    let s=SCENES[id],dyn=false,f=null;
    if(typeof s==='function') { dyn=true; f=s; try { s=evalScene(f,false); } catch(e) { out.errs.push('scene '+id+': '+e); s=null; } }
    if(!Array.isArray(s)) continue;
    const ch=sceneChapter(id);
    const cast=new Set(),list=[];
    try { walkSteps(s,id,'',ch,cast,list); } catch(e) { out.errs.push('walk '+id+': '+e); continue; }
    if(dyn) {
      try {
        const s2=evalScene(f,true),list2=[],cast2=new Set(); walkSteps(s2,id,'',ch,cast2,list2);
        const have=new Set(talkRefs(list).map(r=>r.join('|')));
        const r2=talkRefs(list2); let prev=null;
        for(const st of list2) { if(st.k!=='talk') continue;
          const miss=st.lines.filter(ln=>!have.has(st.who+'|'+ln.t));
          if(miss.length) { const at=prev?list.findIndex(x=>x.k==='talk'&&x.lines.some(ln=>x.who+'|'+ln.t===prev)):-1;
            const ins=Object.assign({},st,{i:'c'+list.length,lines:miss.map(l=>Object.assign({},l,{cond:true})),cond:true});
            list.splice(at<0?0:at+1,0,ins); for(const ln of miss) have.add(st.who+'|'+ln.t);
            for(const a of cast2) cast.add(a); }
          prev=st.who+'|'+st.lines[st.lines.length-1].t; }
      } catch(e) { out.errs.push('variant '+id+': '+e); }
    }
    if(!list.some(x=>x.k==='talk')) continue;
    cast.delete('Narrator'); cast.delete('narrator');
    const tr=trig[id]||null;
    out.scenes[id]={id,chapter:ch,title:words(id),dyn,map:tr?tr.map:null,trig:tr,cast:[...cast],steps:list};
    out.order.push(id);
  }
  out.mapNames={}; if(typeof worlds!=='undefined') for(const [k,m] of Object.entries(worlds)) if(m&&m.name) out.mapNames[k]=m.name;
  out.speakers=(typeof DIALOG_CAST!=='undefined'&&DIALOG_CAST.speakers)||{};
  out.chapters=(typeof CHAPTERS!=='undefined'?CHAPTERS:[]).filter(c=>c.n>0).map(c=>({n:c.n,title:c.title,party:c.party||{}}));
  return out;
}
