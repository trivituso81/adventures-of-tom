'use strict';
// engine/report.js — REPORT (Tom 2026-11-14): a small tab on the screen edge freezes the game on the exact frame, takes a picture of the
// frozen screen, lets Tom write what is wrong or must change (with numbered pins on the picture), records where the game was, and files it
// on the `inbox` branch of the game's GitHub repo (reports/<id>.json + reports/<id>.jpg) for Claude to work through. Reports that cannot be
// sent wait on this phone (IndexedDB 'aot-reports') and go out by themselves later. How Claude reads and closes them: docs/REPORTS.md.
// This file loads FIRST: the freeze works by holding every animation frame and timer and stopping the game clock, so nothing in the game
// needs to know about it. The tab shows only on a device with the GitHub token (Tom's devices) or when ADMIN > REPORT TAB is ON.
const brp={open:false,frozen:false,skew:0,at:0,t0:0,held:[],late:[],audio:false,skewOn:true,shot:null,blob:null,pins:[],kind:'bug',meta:null,id:'',
  el:null,btn:null,errs:[],flushing:null,mem:[],real:null};
const BRP_REPO='trivituso81/adventures-of-tom',BRP_BRANCH='inbox',BRP_DIR='reports',BRP_TOKEN='aot-gh-token',BRP_ON='aot-report',BRP_Y='aot-report-y';
const BRP_KINDS=[['bug','BUG'],['change','CHANGE'],['art','ART'],['dialogue','DIALOGUE']];

// ---------- The freeze: hold animation frames and timers, stop the game clock, silence the sound engine ----------
(function(){
  const P=window.performance,pnow=P.now.bind(P),raf=window.requestAnimationFrame.bind(window),caf=window.cancelAnimationFrame.bind(window),
    st=window.setTimeout.bind(window),ct=window.clearTimeout.bind(window);
  brp.real={now:pnow,raf,st,ct};
  try { P.now=()=>brp.frozen?brp.at:pnow()-brp.skew; } catch(e) { brp.skewOn=false; }
  window.requestAnimationFrame=cb=>{ const id=raf(t=>{ if(brp.frozen) brp.held.push({id,cb}); else cb(brp.skewOn?t-brp.skew:t); }); return id; };
  window.cancelAnimationFrame=id=>{ caf(id); if(brp.held.length) brp.held=brp.held.filter(h=>h.id!==id); };
  window.setTimeout=function(fn,ms,...a) { if(typeof fn!=='function') return st(fn,ms,...a); const id=st(()=>{ if(brp.frozen) brp.late.push({id,fn,a}); else fn(...a); },ms); return id; };
  window.clearTimeout=id=>{ ct(id); if(brp.late.length) brp.late=brp.late.filter(h=>h.id!==id); };
  const keep=(m,e)=>{ brp.errs.push({at:Date.now(),msg:String(m).slice(0,300),src:e||''}); if(brp.errs.length>20) brp.errs.shift(); };
  window.addEventListener('error',e=>keep(e.message,(e.filename||'').split('/').slice(-2).join('/')+':'+(e.lineno||0)));
  window.addEventListener('unhandledrejection',e=>keep((e.reason&&e.reason.message)||e.reason,'promise'));
})();
function brpFreeze() {
  if(brp.frozen) return;
  brp.at=performance.now(); brp.t0=brp.real.now(); brp.frozen=true; brp.audio=false;
  try { if(typeof sound!=='undefined'&&sound.ctx&&sound.ctx.state==='running') { brp.audio=true; const p=sound.ctx.suspend(); if(p&&p.catch) p.catch(()=>{}); } } catch(e) {}
  try { if('speechSynthesis'in window&&speechSynthesis.speaking) speechSynthesis.pause(); } catch(e) {}
}
function brpThaw() {
  if(!brp.frozen) return;
  if(brp.skewOn) brp.skew+=brp.real.now()-brp.t0;
  brp.frozen=false;
  try { if(brp.audio&&sound.ctx) { const p=sound.ctx.resume(); if(p&&p.catch) p.catch(()=>{}); } } catch(e) {}
  try { if('speechSynthesis'in window) speechSynthesis.resume(); } catch(e) {}
  const h=brp.held,l=brp.late; brp.held=[]; brp.late=[];
  for(const x of h) requestAnimationFrame(x.cb);
  for(const x of l) setTimeout(x.fn,0,...x.a);
}

// ---------- Small helpers ----------
const brpLs=k=>{ try { return localStorage.getItem(k)||''; } catch(e) { return ''; } };
const brpTry=(f,d)=>{ try { const v=f(); return v===undefined?d:v; } catch(e) { return d===undefined?null:d; } };
function brpOn() { const v=brpLs(BRP_ON); return v==='1'||(v!=='0'&&!!brpLs(BRP_TOKEN)); }
function brpBuild() { return brpTry(()=>(/v=([^"&]+)/.exec(document.querySelector('script[src*="engine/main.js"]').src)||[])[1],'')||''; }
function brpStamp(d) {   // local time with its offset, e.g. 2026-11-14T08:51:07-08:00
  const p=n=>String(n).padStart(2,'0'),o=-d.getTimezoneOffset(),s=o<0?'-':'+',a=Math.abs(o);
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds())+s+p(Math.floor(a/60))+':'+p(a%60);
}
function brpNewId(d) {
  const p=n=>String(n).padStart(2,'0');
  return 'r-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds())+'-'+Math.random().toString(36).slice(2,6);
}

// ---------- Where the game was: everything Claude needs to find and replay the moment ----------
function brpMeta() {
  const T=brpTry,r2=v=>Math.round(v*100)/100;
  const mode=T(()=>splash.active&&!document.getElementById('splash').hidden,false)?'title':T(()=>battle.active,false)?'battle':T(()=>closeup.active,false)?'closeup'
    :T(()=>shopOpen,false)?'shop':T(()=>menuOpen,false)?'menu':T(()=>cutsceneOn(),false)?'cutscene':T(()=>dialog.active,false)?'dialog':'map';
  const m={mode,build:brpBuild(),url:location.pathname+location.search,
    screen:{layout:T(()=>layout.landscape?'landscape':'portrait',''),rotated:T(()=>layout.rotated,false),duo:T(()=>duoMode.device?(duoMode.open?'open':'folded'):'',''),tablet:T(()=>tabletMode.on,false),
      w:window.innerWidth,h:window.innerHeight,dpr:window.devicePixelRatio||1},
    ua:navigator.userAgent,
    story:{mode:T(()=>STORY.mode,''),chapter:T(()=>STORY.chapter,null),goal:T(()=>document.getElementById('qt-text').textContent,'')},
    map:T(()=>({id:currentMap.id,name:currentMap.name||'',x:r2(player.x),y:r2(player.y),facing:player.facing,cam:[Math.round(camera.x),Math.round(camera.y)],zoom:typeof sceneZoom==='number'?r2(sceneZoom):null})),
    party:T(()=>party.map(p=>p.id),[]),bench:T(()=>benchIds().slice(),[]),
    walkers:T(()=>followers.filter(f=>!f.hidden).map(f=>({id:f.member&&f.member.id,x:r2(f.x),y:r2(f.y),facing:f.facing})),[]),
    near:T(()=>currentMap.npcs.filter(n=>!n.hidden&&Math.abs(n.x-player.x)<=9&&Math.abs(n.y-player.y)<=9).slice(0,24).map(n=>({name:n.name,monster:n.monster||undefined,x:r2(n.x),y:r2(n.y),facing:n.facing})),[]),
    scene:T(()=>intro.active?{id:intro.sid||null,phase:intro.phase,left:intro.steps.length}:null),
    dialog:T(()=>dialog.active?{who:dialog.name,page:dialog.index+1,pages:dialog.lines.length,text:dialog.lines[dialog.index]||'',shown:document.getElementById('dialog-text').textContent,choice:!!dialog.choice}:null),
    battle:T(()=>battle.active?{state:battle.state,ui:B2.ui,round:B2.round,actor:B2.actor&&B2.actor.id,move:B2.move&&(B2.move.key||B2.move.id||B2.move.name)||null,
      party:B2.party.map(u=>({id:u.id,hp:u.hp,maxHp:u.maxHp})),foes:B2.foes.map(u=>({id:u.id,name:u.name,hp:u.hp,maxHp:u.maxHp})),msg:document.getElementById('b2-msg').textContent}:null),
    menu:T(()=>menuOpen?{loc:document.getElementById('menu-loc').textContent,tab:(document.querySelector('#menu-cmds .sel,#menu-cmds .active,#menu-cmds [aria-selected="true"]')||{}).textContent||''}:null),
    flags:T(()=>Object.assign({},STORY.flags),{}),
    faults:(window.__faults||[]).slice(-10),errors:brp.errs.slice(-10),
    save:T(()=>splash.active?null:saveSnapshot())};
  return m;
}

// ---------- The picture: every canvas, box, image and word inside #stage, painted in the stage's own orientation ----------
const brpImgs={};
function brpImg(url) {
  if(brpImgs[url]) return brpImgs[url];
  return brpImgs[url]=new Promise(res=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>res(null); im.src=url; brp.real.st(()=>res(im.complete&&im.naturalWidth?im:null),2500); });
}
function brpSplit(s) { const out=[]; let d=0,cur=''; for(const ch of s) { if(ch==='(') d++; else if(ch===')') d--; if(ch===','&&!d) { out.push(cur.trim()); cur=''; } else cur+=ch; } if(cur.trim()) out.push(cur.trim()); return out; }
function brpPath(g,b,rad) {
  const r=Math.max(0,Math.min(rad,b.w/2,b.h/2)); g.beginPath();
  if(r<.5) { g.rect(b.x,b.y,b.w,b.h); return; }
  g.moveTo(b.x+r,b.y); g.arcTo(b.x+b.w,b.y,b.x+b.w,b.y+b.h,r); g.arcTo(b.x+b.w,b.y+b.h,b.x,b.y+b.h,r); g.arcTo(b.x,b.y+b.h,b.x,b.y,r); g.arcTo(b.x,b.y,b.x+b.w,b.y,r); g.closePath();
}
const brpClear=c=>!c||c==='transparent'||/rgba\([^)]*,\s*0\)$/.test(c);
function brpLen(v,full,own) { v=(v||'').trim(); if(v.endsWith('%')) return (full-own)*parseFloat(v)/100; const n=parseFloat(v); return isFinite(n)?n:0; }
// A CSS gradient as a canvas gradient: direction or angle, then colour stops with their own positions (missing ones are spread evenly).
function brpGrad(g,bg,b) {
  const inner=bg.slice(bg.indexOf('(')+1,bg.lastIndexOf(')')),args=brpSplit(inner),radial=/^(repeating-)?radial/.test(bg); if(/^(repeating-)?conic/.test(bg)) return null;
  let ang=180;
  if(args.length&&!/^(rgba?\(|hsla?\(|#|[a-z]+(\s|$))/i.test(args[0])||/^to\s/.test(args[0]||'')||(radial&&/circle|ellipse|at\s|closest|farthest/.test(args[0]||''))) {
    const d=args.shift();
    if(/deg$/.test(d)) ang=parseFloat(d); else if(/rad$/.test(d)) ang=parseFloat(d)*180/Math.PI; else if(/turn$/.test(d)) ang=parseFloat(d)*360;
    else if(/^to\s/.test(d)) { const R=/right/.test(d),L=/left/.test(d),T=/top/.test(d),B=/bottom/.test(d); ang=T&&R?45:B&&R?135:B&&L?225:T&&L?315:R?90:L?270:T?0:180; }
  }
  const a=ang*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),len=Math.abs(b.w*dx)+Math.abs(b.h*dy),cx=b.x+b.w/2,cy=b.y+b.h/2;
  const full=radial?Math.hypot(b.w,b.h)/2:len;
  const stops=[]; for(const t of args) { const m=/^(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-f]{3,8}|[a-z]+)\s*(.*)$/i.exec(t); if(!m) continue;
    const ps=m[2].trim().split(/\s+/).filter(Boolean).map(v=>v.endsWith('%')?parseFloat(v)/100:full?parseFloat(v)/full:0);
    if(!ps.length) stops.push({c:m[1],p:null}); else for(const q of ps) stops.push({c:m[1],p:q}); }
  if(!stops.length) return null;
  if(stops[0].p==null) stops[0].p=0; if(stops[stops.length-1].p==null) stops[stops.length-1].p=1;
  for(let i=1;i<stops.length;i++) if(stops[i].p==null) { let j=i; while(stops[j].p==null) j++; const p0=stops[i-1].p,p1=stops[j].p; for(let q=i;q<j;q++) stops[q].p=p0+(p1-p0)*(q-i+1)/(j-i+1); }
  let last=0; for(const st of stops) { st.p=Math.max(last,Math.min(1,Math.max(0,st.p))); last=st.p; }
  const gr=radial?g.createRadialGradient(cx,cy,0,cx,cy,full):g.createLinearGradient(cx-dx*len/2,cy-dy*len/2,cx+dx*len/2,cy+dy*len/2);
  for(const st of stops) { try { gr.addColorStop(st.p,st.c); } catch(e) {} }
  return gr;
}
// Text made by CSS (::before and ::after), such as the arrow on the picked menu row.
function brpPseudo(g,el,which,b,cs,sc) {
  const ps=getComputedStyle(el,which),ct=ps.content; if(!ct||ct==='none'||ct==='normal'||ps.display==='none') return;
  const m=/^"((?:[^"\\]|\\.)*)"$/.exec(ct); if(!m||!m[1].trim()||brpClear(ps.color)||ps.visibility==='hidden'||parseFloat(ps.opacity)===0) return;
  const txt=m[1].replace(/\\(.)/g,'$1'),fs=(parseFloat(ps.fontSize)||12)*sc; if(fs<2) return;
  g.font=(ps.fontStyle==='italic'?'italic ':'')+ps.fontWeight+' '+fs+'px '+ps.fontFamily; g.fillStyle=ps.color; g.textBaseline='middle';
  const w=g.measureText(txt).width,pl=(parseFloat(cs.paddingLeft)||0)*sc,pr=(parseFloat(cs.paddingRight)||0)*sc,pt=(parseFloat(cs.paddingTop)||0)*sc;
  let x,y;
  if(ps.position==='absolute') {
    const L=parseFloat(ps.left),R=parseFloat(ps.right),T=parseFloat(ps.top),B=parseFloat(ps.bottom),h=(parseFloat(ps.height)||fs/sc*1.2)*sc;
    x=isFinite(L)?b.x+L*sc:isFinite(R)?b.x+b.w-R*sc-w:b.x; y=isFinite(T)?b.y+T*sc+h/2:isFinite(B)?b.y+b.h-B*sc-h/2:b.y+b.h/2;
    if(/translate|matrix/.test(ps.transform||'')) { const mt=/matrix\(([^)]+)\)/.exec(ps.transform); if(mt) { const v=mt[1].split(',').map(parseFloat); x+=v[4]*sc; y+=v[5]*sc; } }
  } else if(b.h<=fs*2.6) { x=which==='::before'?b.x+pl:b.x+b.w-pr-w; y=b.y+b.h/2; }
  else { if(which!=='::before') return; x=b.x+pl; y=b.y+pt+fs*.65; }
  g.fillText(txt,x,y);
}
async function brpBox(g,b,cs,sc) {
  const rad=(parseFloat(cs.borderTopLeftRadius)||0)*sc;
  const bgs=cs.backgroundImage&&cs.backgroundImage!=='none'?brpSplit(cs.backgroundImage):[];
  const hasBg=!brpClear(cs.backgroundColor)||bgs.length;
  if(hasBg) {
    g.save(); brpPath(g,b,rad); g.clip();
    if(!brpClear(cs.backgroundColor)) { g.fillStyle=cs.backgroundColor; g.fillRect(b.x,b.y,b.w,b.h); }
    const sizes=brpSplit(cs.backgroundSize||''),poss=brpSplit(cs.backgroundPosition||'');
    for(let i=bgs.length-1;i>=0;i--) {
      const bg=bgs[i];
      if(/gradient\(/.test(bg)) {
        const gr=brpGrad(g,bg,b); if(gr) { g.fillStyle=gr; g.fillRect(b.x,b.y,b.w,b.h); }
      } else {
        const u=/url\(["']?([^"')]+)["']?\)/.exec(bg); if(!u) continue;
        const im=await brpImg(u[1]); if(!im) continue;
        const sz=(sizes[i]||sizes[0]||'auto').trim(),iw=im.naturalWidth,ih=im.naturalHeight; let w,h;
        if(sz==='cover'||sz==='contain') { const k=(sz==='cover'?Math.max:Math.min)(b.w/iw,b.h/ih); w=iw*k; h=ih*k; }
        else { const p=sz.split(/\s+/),pw=p[0],ph=p[1]||'auto',one=(v,full)=>v==='auto'?null:v.endsWith('%')?full*parseFloat(v)/100:parseFloat(v)*sc;
          w=one(pw,b.w); h=one(ph,b.h); if(w==null&&h==null) { w=iw*sc; h=ih*sc; } else if(w==null) w=h*iw/ih; else if(h==null) h=w*ih/iw; }
        const pp=(poss[i]||poss[0]||'0% 0%').split(/\s+/),px=brpLen(pp[0],b.w,w)*(pp[0].endsWith('%')?1:sc),py=brpLen(pp[1]||'50%',b.h,h)*((pp[1]||'%').endsWith('%')?1:sc);
        try { g.drawImage(im,b.x+px,b.y+py,w,h); } catch(e) {}
      }
    }
    g.restore();
  }
  const bw=['Top','Right','Bottom','Left'].map(s=>cs['border'+s+'Style']==='none'||cs['border'+s+'Style']==='hidden'?0:(parseFloat(cs['border'+s+'Width'])||0)*sc);
  if(bw.some(v=>v>0)) {
    if(bw.every(v=>Math.abs(v-bw[0])<.01)&&!brpClear(cs.borderTopColor)) { g.strokeStyle=cs.borderTopColor; g.lineWidth=bw[0]; brpPath(g,{x:b.x+bw[0]/2,y:b.y+bw[0]/2,w:b.w-bw[0],h:b.h-bw[0]},Math.max(0,rad-bw[0]/2)); g.stroke(); }
    else {
      if(bw[0]&&!brpClear(cs.borderTopColor)) { g.fillStyle=cs.borderTopColor; g.fillRect(b.x,b.y,b.w,bw[0]); }
      if(bw[2]&&!brpClear(cs.borderBottomColor)) { g.fillStyle=cs.borderBottomColor; g.fillRect(b.x,b.y+b.h-bw[2],b.w,bw[2]); }
      if(bw[3]&&!brpClear(cs.borderLeftColor)) { g.fillStyle=cs.borderLeftColor; g.fillRect(b.x,b.y,bw[3],b.h); }
      if(bw[1]&&!brpClear(cs.borderRightColor)) { g.fillStyle=cs.borderRightColor; g.fillRect(b.x+b.w-bw[1],b.y,bw[1],b.h); }
    }
  }
}
function brpFit(g,im,iw,ih,b,cs) {   // <img> with object-fit
  const fit=cs.objectFit||'fill';
  if(fit==='cover'||fit==='contain'||fit==='none'||fit==='scale-down') {
    let k=fit==='cover'?Math.max(b.w/iw,b.h/ih):fit==='none'?1:Math.min(b.w/iw,b.h/ih); if(fit==='scale-down') k=Math.min(1,k);
    const w=iw*k,h=ih*k,pp=(cs.objectPosition||'50% 50%').split(/\s+/);
    g.save(); g.beginPath(); g.rect(b.x,b.y,b.w,b.h); g.clip(); g.drawImage(im,b.x+brpLen(pp[0],b.w,w),b.y+brpLen(pp[1]||'50%',b.h,h),w,h); g.restore();
  } else g.drawImage(im,b.x,b.y,b.w,b.h);
}
function brpWords(g,n,cs,sc,loc) {
  const t=n.nodeValue; if(!t||!t.trim()||brpClear(cs.color)) return;
  const fs=(parseFloat(cs.fontSize)||12)*sc; if(fs<2) return;
  g.font=(cs.fontStyle==='italic'?'italic ':'')+(cs.fontVariantCaps==='small-caps'?'small-caps ':'')+cs.fontWeight+' '+fs+'px '+cs.fontFamily;
  try { g.letterSpacing=cs.letterSpacing&&cs.letterSpacing!=='normal'?(parseFloat(cs.letterSpacing)*sc)+'px':'0px'; } catch(e) {}
  g.fillStyle=cs.color; g.textBaseline='middle'; g.textAlign='left';
  const sh=/(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+([\d.]+)px)?/.exec(cs.textShadow||''),k=g.getTransform().a;
  if(sh) { g.shadowColor=sh[1]; g.shadowOffsetX=parseFloat(sh[2])*sc*k; g.shadowOffsetY=parseFloat(sh[3])*sc*k; g.shadowBlur=(parseFloat(sh[4])||0)*sc*k; }
  const up=cs.textTransform==='uppercase',low=cs.textTransform==='lowercase',rg=document.createRange(),re=/\S+/g; let m;
  while((m=re.exec(t))) {
    rg.setStart(n,m.index); rg.setEnd(n,m.index+m[0].length);
    const rs=rg.getClientRects(); if(!rs.length) continue;
    const b=loc(rs[0]); if(b.w<=0||b.h<=0) continue;
    const w=up?m[0].toUpperCase():low?m[0].toLowerCase():m[0];
    g.fillText(w,b.x,b.y+b.h/2);
  }
  if(sh) { g.shadowColor='transparent'; g.shadowOffsetX=g.shadowOffsetY=g.shadowBlur=0; }
}
async function brpCapture() {
  const stage=document.getElementById('stage'),S=stage.getBoundingClientRect(),rot=!!brpTry(()=>layout.rotated,false);
  const LW=stage.offsetWidth,LH=stage.offsetHeight,k=Math.min(2,window.devicePixelRatio||1,1500/Math.max(LW,LH));
  const c=document.createElement('canvas'); c.width=Math.round(LW*k); c.height=Math.round(LH*k);
  const g=c.getContext('2d'); g.scale(k,k); g.fillStyle='#000'; g.fillRect(0,0,LW,LH);
  const loc=r=>rot?{x:r.top-S.top,y:S.right-r.right,w:r.height,h:r.width}:{x:r.left-S.left,y:r.top-S.top,w:r.width,h:r.height};
  const walk=async(el,alpha)=>{
    if(el===brp.btn||el.hidden||el.tagName==='SCRIPT'||el.tagName==='STYLE') return;
    const cs=getComputedStyle(el); if(cs.display==='none') return;
    const op=alpha*(parseFloat(cs.opacity)||0); if(op<.02) return;
    const vis=cs.visibility!=='hidden'&&cs.visibility!=='collapse',r=el.getBoundingClientRect(),b=loc(r);
    const ow=el.offsetWidth,sc=ow>0?Math.max(.2,Math.min(5,b.w/ow)):1;
    const seen=b.w>0&&b.h>0&&b.x<LW&&b.y<LH&&b.x+b.w>0&&b.y+b.h>0;
    g.globalAlpha=op;
    if(vis&&seen) {
      await brpBox(g,b,cs,sc); g.globalAlpha=op;
      try {
        if(el.tagName==='CANVAS'&&el.width&&el.height) g.drawImage(el,b.x,b.y,b.w,b.h);
        else if(el.tagName==='IMG'&&el.complete&&el.naturalWidth) brpFit(g,el,el.naturalWidth,el.naturalHeight,b,cs);
      } catch(e) {}
    }
    const clip=seen&&(cs.overflowX!=='visible'||cs.overflowY!=='visible');
    if(clip) { g.save(); g.beginPath(); g.rect(b.x,b.y,b.w,b.h); g.clip(); }
    else if(!seen&&(cs.overflowX!=='visible'||cs.overflowY!=='visible')&&(b.w<=0||b.h<=0)) return;
    if(vis&&seen) { g.globalAlpha=op; try { brpPseudo(g,el,'::before',b,cs,sc); } catch(e) {} }
    for(const n of el.childNodes) {
      if(n.nodeType===1) await walk(n,op);
      else if(n.nodeType===3&&vis) { g.globalAlpha=op; try { brpWords(g,n,cs,sc,loc); } catch(e) {} }
    }
    if(vis&&seen) { g.globalAlpha=op; try { brpPseudo(g,el,'::after',b,cs,sc); } catch(e) {} }
    if(clip) g.restore();
  };
  await walk(stage,1);
  g.globalAlpha=1;
  return c;
}
// The picture that is filed: the frozen frame with the numbered pins drawn on it.
function brpFinal() {
  const s=brp.shot; if(!s) return null;
  const c=document.createElement('canvas'); c.width=s.width; c.height=s.height;
  const g=c.getContext('2d'); g.drawImage(s,0,0);
  const r=Math.max(14,Math.round(Math.max(s.width,s.height)*.022));
  brp.pins.forEach((p,i)=>{ const x=p.x*s.width,y=p.y*s.height;
    g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fillStyle='#e23b3b'; g.fill(); g.lineWidth=Math.max(2,r*.18); g.strokeStyle='#fff'; g.stroke();
    g.fillStyle='#fff'; g.font='bold '+Math.round(r*1.2)+'px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(i+1),x,y+1); });
  return c;
}
function brpJpeg() { try { return brpFinal().toDataURL('image/jpeg',.82).split(',')[1]||''; } catch(e) { return ''; } }
function brpReblob() { brp.blob=null; try { const c=brpFinal(); if(c) c.toBlob(b=>{ brp.blob=b; },'image/jpeg',.82); } catch(e) {} }

// ---------- The waiting list on this phone (IndexedDB), and sending to GitHub ----------
function brpDb() {
  return new Promise((res,rej)=>{ let q; try { q=indexedDB.open('aot-reports',1); } catch(e) { return rej(e); }
    q.onupgradeneeded=()=>q.result.createObjectStore('q',{keyPath:'id'}); q.onsuccess=()=>res(q.result); q.onerror=()=>rej(q.error); });
}
async function brpStore(mode,fn) {
  const db=await brpDb();
  return new Promise((res,rej)=>{ const tx=db.transaction('q',mode),rq=fn(tx.objectStore('q')); tx.oncomplete=()=>{ db.close(); res(rq&&rq.result); }; tx.onerror=tx.onabort=()=>{ db.close(); rej(tx.error); }; });
}
async function brpKeep(rec) { try { await brpStore('readwrite',s=>s.put(rec)); } catch(e) { brp.mem.push(rec); } }
async function brpDrop(id) { brp.mem=brp.mem.filter(r=>r.id!==id); try { await brpStore('readwrite',s=>s.delete(id)); } catch(e) {} }
async function brpWaiting() { let a=[]; try { a=(await brpStore('readonly',s=>s.getAll()))||[]; } catch(e) {} return a.concat(brp.mem.filter(m=>!a.some(r=>r.id===m.id))).sort((x,y)=>x.id<y.id?-1:1); }
const brpB64=s=>btoa(unescape(encodeURIComponent(s)));
async function brpPut(path,content,message) {
  const tok=brpLs(BRP_TOKEN); if(!tok) throw new Error('NOTOKEN');
  const base=(new URLSearchParams(location.search).get('gh')||'https://api.github.com').replace(/\/+$/,'');
  for(let i=0;i<4;i++) {
    if(i) await new Promise(r=>brp.real.st(r,900*i));
    let r; try { r=await fetch(base+'/repos/'+BRP_REPO+'/contents/'+path,{method:'PUT',cache:'no-store',
      headers:{Authorization:'Bearer '+tok,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
      body:JSON.stringify({message,content,branch:BRP_BRANCH})}); } catch(e) { throw new Error('No connection right now.'); }
    if(r.ok||r.status===422) return;   // 422: this file is already there (a retry after a half-sent report)
    if(r.status===409) continue;       // the branch moved under us: try again
    throw new Error(r.status===401?'GitHub said the token is wrong or expired. Paste a new one in ADMIN > ART LIBRARY > Setup.'
      :(r.status===403||r.status===404)?'GitHub would not take it ('+r.status+'). The token needs "Contents: Read and write" on the game repository.':'GitHub said '+r.status+'.');
  }
  throw new Error('GitHub was busy. It will try again.');
}
// Sends everything that is waiting, oldest first. Never throws: {sent,left,err}.
function brpFlush() {
  if(brp.flushing) return brp.flushing;
  return brp.flushing=(async()=>{
    const all=await brpWaiting(); let sent=0,err='';
    if(!all.length) return {sent:0,left:0,err:''};
    if(!brpLs(BRP_TOKEN)) return {sent:0,left:all.length,err:'NOTOKEN'};
    for(const r of all) {
      try {
        if(r.jpg) await brpPut(BRP_DIR+'/'+r.id+'.jpg',r.jpg,'Report '+r.id+': picture');
        await brpPut(BRP_DIR+'/'+r.id+'.json',brpB64(JSON.stringify(r.doc,null,1)+'\n'),'Report '+r.id+' ('+r.doc.kind+'): '+String(r.doc.note||'').replace(/\s+/g,' ').slice(0,70));
        await brpDrop(r.id); sent++;
      } catch(e) { err=e.message; break; }
    }
    return {sent,left:all.length-sent,err};
  })().then(v=>{ brp.flushing=null; return v; },()=>{ brp.flushing=null; return {sent:0,left:0,err:'Something went wrong while sending.'}; });
}
function brpToast(text,ms=3200) {
  let t=document.getElementById('brp-toast'); if(!t) { t=document.createElement('div'); t.id='brp-toast'; document.body.appendChild(t); }
  t.textContent=text; t.classList.add('on'); brp.real.ct(brpToast.t); brpToast.t=brp.real.st(()=>t.classList.remove('on'),ms);
}
function brpResult(r,mine) {
  if(r.err==='NOTOKEN') return 'Report kept on this phone ('+r.left+' waiting). No GitHub token here: set it in ADMIN > ART LIBRARY > Setup.';
  if(r.err) return 'Report kept on this phone ('+r.left+' waiting). '+r.err;
  return mine?(r.sent>1?'Sent. '+r.sent+' reports are with Claude.':'Report sent.'):r.sent+(r.sent===1?' waiting report sent.':' waiting reports sent.');
}

// ---------- The screen ----------
function brpDoc() {
  const note=document.getElementById('brp-note').value.trim();
  return {v:1,id:brp.id,at:brpStamp(new Date()),kind:brp.kind,note,pins:brp.pins.map((p,i)=>({n:i+1,x:Math.round(p.x*1000)/1000,y:Math.round(p.y*1000)/1000})),
    shot:brp.shot?BRP_DIR+'/'+brp.id+'.jpg':null,where:brp.meta};
}
function brpShareText(d) {
  const w=d.where||{},m=w.map||{},L=['GAME REPORT '+d.id+' ['+d.kind+']',d.note||'(no note)'];
  if(d.pins.length) L.push('Pins: '+d.pins.map(p=>p.n+' at '+Math.round(p.x*100)+'%,'+Math.round(p.y*100)+'%').join('; '));
  L.push('Build '+w.build+', '+w.mode+', chapter '+((w.story||{}).chapter)+', map '+m.id+' ('+m.x+','+m.y+' facing '+m.facing+'), '+((w.screen||{}).layout));
  if(w.scene&&w.scene.id) L.push('Scene '+w.scene.id);
  if(w.dialog) L.push(w.dialog.who+' page '+w.dialog.page+'/'+w.dialog.pages+': "'+w.dialog.text+'"');
  if(w.battle) L.push('Battle: '+w.battle.foes.map(f=>f.id).join(', ')+'; turn '+w.battle.actor+'; move '+w.battle.move);
  L.push('Party '+(w.party||[]).join(', ')+((w.bench||[]).length?'; bench '+w.bench.join(', '):''));
  return L.join('\n');
}
function brpPins() {
  const box=document.getElementById('brp-pins'); box.textContent='';
  brp.pins.forEach((p,i)=>{ const d=document.createElement('i'); d.textContent=String(i+1); d.style.left=(p.x*100)+'%'; d.style.top=(p.y*100)+'%'; box.appendChild(d); });
  document.getElementById('brp-undo').hidden=!brp.pins.length;
  brpReblob();
}
function brpMsg(t,err) { const m=document.getElementById('brp-msg'); m.textContent=t||''; m.className=err?'err':''; }
function brpMake() {
  if(brp.el) return;
  const css=document.createElement('style');
  css.textContent=`
#brp-btn{position:absolute;z-index:400;right:0;top:30%;width:26px;height:44px;margin-top:-22px;padding:0;border:2px solid #b8914a;border-right:0;border-radius:10px 0 0 10px;background:#141924d9;color:#f2e6cc;font:700 15px/1 "Trebuchet MS",system-ui,sans-serif;touch-action:none;opacity:.72;-webkit-user-select:none;user-select:none;cursor:pointer}
#brp-btn[hidden]{display:none}
#brp{position:fixed;z-index:1000;inset:0;display:flex;align-items:flex-start;justify-content:center;overflow:auto;-webkit-overflow-scrolling:touch;padding:calc(8px + env(safe-area-inset-top)) calc(8px + env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom)) calc(8px + env(safe-area-inset-left));background:#0b0f18e8;color:#f2e6cc;font-family:"Trebuchet MS",system-ui,sans-serif;touch-action:manipulation}
#brp[hidden]{display:none}
#brp .brp-card{width:min(100%,560px);display:flex;flex-direction:column;gap:8px;padding:10px;border:2px solid #b8914a;border-radius:8px;background:linear-gradient(#1b212e,#141924)}
#brp .brp-head{display:flex;align-items:baseline;gap:8px}#brp .brp-head b{font-size:15px;letter-spacing:.08em}#brp-where{flex:1;min-width:0;font-size:11px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#brp-shotwrap{align-self:center;position:relative;line-height:0;border:1px solid #4b5160;background:#000;min-width:80px;min-height:60px}
#brp-shotwrap canvas{display:block;max-width:100%;max-height:36vh;width:auto;height:auto}
#brp-wait{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1.2;opacity:.8}
#brp-pins{position:absolute;inset:0}#brp-pins i{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border:2px solid #fff;border-radius:50%;background:#e23b3b;color:#fff;font:700 12px/18px sans-serif;text-align:center;font-style:normal;pointer-events:none;box-sizing:border-box}
#brp .brp-hint{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;opacity:.8;min-height:24px}
#brp button{font-family:inherit;color:#f2e6cc;border:2px solid #4b5160;border-radius:5px;background:linear-gradient(#2b313e,#232834);padding:9px 10px;font-size:13px;font-weight:700;letter-spacing:.04em;cursor:pointer}
#brp button.small{padding:4px 8px;font-size:11px}
#brp .brp-kinds{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#brp .brp-kinds button{padding:8px 2px;font-size:11px}#brp .brp-kinds button.sel{border-color:#e9c46a;background:linear-gradient(#4a4020,#3a3218);color:#fff}
#brp textarea{width:100%;box-sizing:border-box;min-height:92px;padding:8px;border:2px solid #4b5160;border-radius:5px;background:#0e121b;color:#fff;font:16px/1.35 "Trebuchet MS",system-ui,sans-serif;resize:vertical}
#brp-msg{min-height:14px;font-size:11px;opacity:.85}#brp-msg.err{color:#ff9c8a;opacity:1}
#brp .brp-row{display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px}#brp-send{border-color:#e9c46a !important;background:linear-gradient(#5a4a1c,#40340f) !important;color:#fff !important}
#brp button:disabled{opacity:.45}
#brp-toast{position:fixed;z-index:1001;left:50%;top:calc(10px + env(safe-area-inset-top));transform:translate(-50%,-8px);max-width:86vw;padding:8px 12px;border:2px solid #b8914a;border-radius:6px;background:#141924f2;color:#f2e6cc;font:12px/1.3 "Trebuchet MS",system-ui,sans-serif;text-align:center;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}
#brp-toast.on{opacity:1;transform:translate(-50%,0)}
@media (orientation:landscape) and (max-height:520px){#brp .brp-card{width:100%;max-width:900px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-auto-flow:row;align-items:start}#brp .brp-head{grid-column:1/3}#brp-shotwrap{grid-column:1;grid-row:2/7}#brp-shotwrap canvas{max-height:62vh}#brp .brp-hint,#brp .brp-kinds,#brp textarea,#brp-msg,#brp .brp-row{grid-column:2}#brp textarea{min-height:56px}}
`;
  document.head.appendChild(css);
  const el=document.createElement('div'); el.id='brp'; el.hidden=true; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Report a problem or a change');
  el.innerHTML='<div class="brp-card"><div class="brp-head"><b>REPORT</b><span id="brp-where"></span></div>'
    +'<div id="brp-shotwrap"><div id="brp-wait">Taking the picture...</div><div id="brp-pins"></div></div>'
    +'<div class="brp-hint"><span>Tap the picture to mark the spot.</span><button id="brp-undo" class="small" type="button" hidden>UNDO PIN</button></div>'
    +'<div class="brp-kinds">'+BRP_KINDS.map(k=>'<button type="button" data-kind="'+k[0]+'">'+k[1]+'</button>').join('')+'</div>'
    +'<textarea id="brp-note" placeholder="What is wrong, or what should change?" autocapitalize="sentences"></textarea>'
    +'<div id="brp-msg"></div>'
    +'<div class="brp-row"><button id="brp-send" type="button">SEND</button><button id="brp-share" type="button">SHARE</button><button id="brp-cancel" type="button">CANCEL</button></div></div>';
  document.body.appendChild(el); brp.el=el;
  el.querySelector('.brp-kinds').addEventListener('click',e=>{ const k=e.target.getAttribute&&e.target.getAttribute('data-kind'); if(!k) return; brp.kind=k; brpKindMark(); });
  document.getElementById('brp-shotwrap').addEventListener('click',e=>{
    const c=brp.el.querySelector('#brp-shotwrap canvas'); if(!c||brp.pins.length>=9) return;
    const r=c.getBoundingClientRect(); if(!r.width||!r.height) return;
    brp.pins.push({x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}); brpPins();
  });
  document.getElementById('brp-undo').addEventListener('click',()=>{ brp.pins.pop(); brpPins(); });
  document.getElementById('brp-cancel').addEventListener('click',()=>brpClose());
  document.getElementById('brp-send').addEventListener('click',()=>brpSend());
  document.getElementById('brp-share').addEventListener('click',()=>brpShare());
  // Nothing typed or pressed here reaches the game.
  for(const ev of ['keydown','keyup','keypress']) window.addEventListener(ev,e=>{ if(!brp.open) return; e.stopImmediatePropagation(); if(ev==='keydown'&&e.key==='Escape') brpClose(); },true);
}
function brpKindMark() { for(const b of brp.el.querySelectorAll('.brp-kinds button')) b.classList.toggle('sel',b.getAttribute('data-kind')===brp.kind); }
function brpOpen() {
  if(brp.open) return;
  brpMake(); brpFreeze();
  brp.open=true; brp.id=brpNewId(new Date()); brp.pins=[]; brp.shot=null; brp.blob=null;
  brp.meta=brpMeta();
  const w=brp.meta,m=w.map||{};
  document.getElementById('brp-where').textContent=(w.mode||'')+(w.story&&w.story.chapter?' · chapter '+w.story.chapter:'')+(m.id?' · '+(m.name||m.id):'')+' · build '+w.build;
  const wrap=document.getElementById('brp-shotwrap'),old=wrap.querySelector('canvas'); if(old) old.remove();
  document.getElementById('brp-wait').hidden=false; document.getElementById('brp-wait').textContent='Taking the picture...';
  document.getElementById('brp-share').hidden=!(navigator.share&&navigator.canShare);
  brpKindMark(); brpPins(); brpMsg('');
  if(brp.btn) brp.btn.hidden=true;
  brp.el.hidden=false; brp.el.scrollTop=0;
  const note=document.getElementById('brp-note'); try { note.focus({preventScroll:true}); } catch(e) {}
  const id=brp.id;
  brpCapture().then(c=>{ if(!brp.open||brp.id!==id) return; brp.shot=c; wrap.insertBefore(c,wrap.firstChild); document.getElementById('brp-wait').hidden=true; brpReblob(); },
    ()=>{ if(brp.open&&brp.id===id) document.getElementById('brp-wait').textContent='No picture this time. The note still goes.'; });
  brpWaiting().then(a=>{ if(brp.open&&a.length) brpMsg(a.length+(a.length===1?' earlier report is':' earlier reports are')+' waiting on this phone. They go with this one.'); });
}
function brpClose() {
  if(!brp.open) return;
  brp.open=false; brp.el.hidden=true; try { document.activeElement&&document.activeElement.blur(); } catch(e) {}
  brpTab(); brpThaw();
  try { if(typeof fitViewportSoon==='function') fitViewportSoon(); } catch(e) {}
}
async function brpSend() {
  const d=brpDoc(); if(!d.note&&!d.pins.length) { brpMsg('Write a few words or tap the picture first.',true); return; }
  const btn=document.getElementById('brp-send'); btn.disabled=true;
  const rec={id:d.id,doc:d,jpg:brp.shot?brpJpeg():''};
  if(!rec.jpg) d.shot=null;
  await brpKeep(rec);
  document.getElementById('brp-note').value=''; btn.disabled=false;
  brpClose(); brpToast('Report saved. Sending...',6000);
  brpFlush().then(r=>brpToast(brpResult(r,true),r.err?6500:2600));
}
function brpShare() {   // the iPhone share sheet (to the Claude app, Notes, Mail): must start straight from the tap
  const d=brpDoc(); if(!d.note&&!d.pins.length) { brpMsg('Write a few words or tap the picture first.',true); return; }
  const data={text:brpShareText(d)+'\n\n'+JSON.stringify(Object.assign({},d,{where:Object.assign({},d.where,{save:undefined})}))};
  try {
    if(brp.blob) { const f=new File([brp.blob],d.id+'.jpg',{type:'image/jpeg'}); if(navigator.canShare({files:[f]})) data.files=[f]; }
    navigator.share(data).then(()=>{ document.getElementById('brp-note').value=''; brpClose(); brpToast('Shared.'); },e=>{ if(!e||e.name!=='AbortError') brpMsg('Sharing did not open. Use SEND instead.',true); });
  } catch(e) { brpMsg('Sharing is not available here. Use SEND instead.',true); }
}

// ---------- The tab on the screen edge (drag it up or down; a tap opens the report) ----------
function brpTab() {
  const stage=document.getElementById('stage'); if(!stage) return;
  if(!brp.btn) {
    brpMake();
    const b=document.createElement('button'); b.id='brp-btn'; b.type='button'; b.textContent='✎'; b.setAttribute('aria-label','Report a problem or a change');
    stage.appendChild(b); brp.btn=b;
    const y=parseFloat(brpLs(BRP_Y)); if(y>=.06&&y<=.94) b.style.top=(y*100)+'%';
    let down=null;
    const frac=e=>{ const S=stage.getBoundingClientRect(),rot=!!brpTry(()=>layout.rotated,false); return rot?(S.right-e.clientX)/S.width:(e.clientY-S.top)/S.height; };
    b.addEventListener('pointerdown',e=>{ down={f:frac(e),moved:false}; try { b.setPointerCapture(e.pointerId); } catch(x) {} e.preventDefault(); e.stopPropagation(); });
    b.addEventListener('pointermove',e=>{ if(!down) return; const f=frac(e); if(Math.abs(f-down.f)>.015) down.moved=true; if(down.moved) b.style.top=(Math.max(.06,Math.min(.94,f))*100)+'%'; });
    const up=e=>{ if(!down) return; const d=down; down=null; e.stopPropagation();
      if(d.moved) { try { localStorage.setItem(BRP_Y,String(parseFloat(b.style.top)/100)); } catch(x) {} } else if(e.type==='pointerup') brpOpen(); };
    b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up);
    for(const ev of ['touchstart','touchend','mousedown','click']) b.addEventListener(ev,e=>e.stopPropagation());
  }
  brp.btn.hidden=!brpOn()||brp.open;
}
// ADMIN > REPORT TAB (engine/splash.js): shows or hides the tab on this device.
function brpAdminItem() {
  const on=brpOn();
  return {name:'REPORT TAB: '+(on?'ON':'OFF'),sub:'The pencil tab that sends Claude a note.',
    act:()=>{ try { localStorage.setItem(BRP_ON,on?'0':'1'); } catch(e) {} brpTab(); const i=splash.sel; splashSetMode('admin'); splash.sel=i; if(typeof splashMark==='function') splashMark(); }};
}
window.addEventListener('DOMContentLoaded',()=>{ brpTab(); });
window.addEventListener('online',()=>{ brpFlush().then(r=>{ if(r.sent) brpToast(brpResult(r,false)); }); });
brp.real.st(()=>{ brpFlush().then(r=>{ if(r.sent) brpToast(brpResult(r,false)); }); },9000);
