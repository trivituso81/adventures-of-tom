'use strict';
// engine/m2-bag.js: the Bag and System pages of the new main menu (card menu3; drawings bag_duo, bag_phone, system_duo, system_phone in claude/menuux-mock/shots).
// Bag: All, Heal, Battle (only when the bag holds one), Gear and Keepsakes; the list with painted pictures and counts; the chosen item's
// page; Use it on: the family by health, most hurt first, the health they would end at, and Use (Wear for a piece of gear). On a tall
// screen the page is a sheet that slides up over the list. The rules are today's: useFieldItem (data/party.js), equipTo.
// System: Saved games (Autosave and slots with Save and Load, each asking twice before it replaces anything; saves from the player's other
// devices), Back up, Restore and the cloud set-up, the build label (opens the build history), Quit to title; Options: Music, Voices and
// Sound effects, Difficulty, Battle speed, Show what each skill does, Turn the screen sideways, Less motion. The options only the old
// battle uses (High-five timing, Auto-stamp, Win Now) show only while a chapter on the old battle is being played (b3sOn() false).
Object.assign(M2,{bagF:'all',bagSel:null,sheet:false,sure:null,quit:false,pulled:false,slide:false});
Object.assign(M2_ICON,{minus:'<path d="M5 12h14"/>',plus:'<path d="M12 5v14M5 12h14"/>',cloud:'<path d="M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9.5a4.2 4.2 0 0 1-.5 8.5z"/>',disk:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h7V3"/><path d="M8 21v-7h8v7"/>'});
const M2_CALM_KEY='aot-m2-calm';
function m2Calm() { try { return localStorage.getItem(M2_CALM_KEY)==='on'; } catch(e) { return false; } }
function m2SetCalm(on) { try { localStorage.setItem(M2_CALM_KEY,on?'on':'off'); } catch(e) {} }

// ---------- Bag ----------
const M2_BAGF=[{id:'all',label:'All'},{id:'heal',label:'Heal'},{id:'battle',label:'Battle'},{id:'gear',label:'Gear'},{id:'keep',label:'Keepsakes'}];
function m2HealText(it) {
  if(it.revive) return 'Wakes up a knocked out person';
  if(it.healAll) return 'Heals everyone '+it.healAll+' Health';
  if(it.heal) return 'Heals '+it.heal+' Health';
  return '';
}
function m2ItemSub(it) {
  const cat=itemCat(it);
  if(cat==='heal') return m2HealText(it)||'Heals';
  if(cat==='gear') return (it.who?memberById(it.who).name+' only, ':'')+(SLOT_LABEL[it.slot]||it.slot);
  if(cat==='battle') return (typeof effectText==='function'?effectText(it).replace(/^Battle: /,''):'')||'For a fight';
  return 'Keepsake';
}
function m2BagShown() {
  const ids=[...new Set(bag)].filter(id=>items[id]),count={all:ids.length,heal:0,battle:0,gear:0,keep:0};
  for(const id of ids) count[itemCat(items[id])]++;
  if(M2.bagF!=='all'&&!count[M2.bagF]) M2.bagF='all';
  const shown=ids.filter(id=>M2.bagF==='all'||itemCat(items[id])===M2.bagF)
    .sort((a,b)=>CAT_ORDER[itemCat(items[a])]-CAT_ORDER[itemCat(items[b])]||items[a].name.localeCompare(items[b].name));
  return {ids,count,shown};
}
function m2BagFilters(count) {
  return '<div class="m2-segs m2-bagf" role="group" aria-label="Show">'+M2_BAGF.filter(f=>f.id==='all'||count[f.id]).map(f=>
    '<button type="button" class="m2-seg'+(f.id===M2.bagF?' on':'')+'" data-m2="bagf" data-a="'+f.id+'" data-k="f-'+f.id+'" aria-pressed="'+(f.id===M2.bagF)+'">'+f.label+(f.id==='all'?' '+count.all:'')+'</button>').join('')+'</div>';
}
function m2BagList(shown) {
  return '<div class="m2-scroll m2-bl">'+shown.map(id=>{ const it=items[id],n=countInBag(id),on=M2.bagSel===id;
    return '<button type="button" class="m2-br'+(on?' sel':'')+'" data-m2="item" data-a="'+id+'" data-k="item-'+id+'" aria-pressed="'+on+'">'+m2ItemPic(id)+'<span class="m2-bt"><b>'+m2Esc(it.name)+'</b><span>'+m2Esc(m2ItemSub(it))+'</span></span>'+(n>1?'<span class="m2-bn" aria-label="You have '+n+'">x<b>'+n+'</b></span>':'')+'</button>'; }).join('')+'</div>';
}
// One row of Use it on: the person's face, health now, what it would end at, and the button (or the reason there is none).
function m2UseRow(p,id) {
  const it=items[id],hp=Math.max(0,p.hp),mx=Math.max(1,p.maxHp);
  const face=m2Face(p.id);
  let to=hp,tag='',can=false;
  if(p.id==='nara'&&it.heal&&!it.dogOk) tag='Won’t eat';
  else if(it.revive) { if(hp>0) tag='Awake'; else { to=Math.ceil(mx/2); can=true; } }
  else if(hp<=0) tag='Knocked out';
  else if(hp>=mx) tag='Full';
  else { to=Math.min(mx,hp+(it.heal||it.healAll||0)); can=true; }
  const low=hp/mx<=.25;
  return '<div class="m2-ur"><span class="m2-uf">'+face+'</span><div class="m2-uc"><span class="m2-un"><b class="m2-uname">'+m2Esc(p.name)+'</b><span class="m2-uh"><b>'+hp+'</b> of '+mx+'</span>'+(can&&to!==hp?'<span class="m2-uto">to '+to+'</span>':'')+'</span>'+
    '<span class="m2-bar'+(low?' low':'')+'"><i style="width:'+Math.round(hp/mx*100)+'%"></i></span></div>'+
    (can&&!it.healAll?'<button type="button" class="m2-btn on m2-usebtn" data-m2="use" data-a="'+p.id+'" data-k="use-'+p.id+'" aria-label="Use the '+m2Esc(it.name)+' on '+m2Esc(p.name)+'">Use</button>':'<span class="m2-utag">'+(tag||(it.healAll?'':'Full'))+'</span>')+'</div>';
}
function m2UseRows(id) {
  const it=items[id],cat=itemCat(it);
  if(cat==='heal') {
    const list=[...party].sort((a,b)=>{ const ra=a.hp/a.maxHp,rb=b.hp/b.maxHp; if(it.revive) return (a.hp>0)-(b.hp>0)||ra-rb; return ((a.hp<=0)-(b.hp<=0))||ra-rb; });
    const any=party.some(p=>p.hp>0&&p.hp<p.maxHp);
    return '<div class="m2-lab">'+(it.healAll?'Use it on everyone':'Use it on')+'</div>'+(it.healAll?'<div class="m2-all"><button type="button" class="m2-btn on" data-m2="useall" data-k="useall"'+(any?'':' disabled')+'>Use on everyone</button>'+(any?'':'<span class="m2-note">Everyone is already full.</span>')+'</div>':'')+
      '<div class="m2-uses">'+list.map(p=>m2UseRow(p,id)).join('')+'</div><p class="m2-note">The list puts whoever is hurt most at the top.</p>';
  }
  if(cat==='gear') {
    const list=party.filter(p=>canWear(p,it));
    if(!list.length) return '<p class="m2-note">'+(it.who?m2Esc(memberById(it.who).name)+' is the only one it fits.':'Nobody in the family can wear it.')+'</p>';
    return '<div class="m2-lab">Wear it on</div><div class="m2-uses">'+list.map(p=>{
      const cur=p.equipment[it.slot]?items[p.equipment[it.slot]]:null,dt=m2DiffText(m2Diff(p,it.slot,id));
      return '<div class="m2-ur"><span class="m2-uf">'+m2Face(p.id)+'</span><div class="m2-uc"><span class="m2-un"><b class="m2-uname">'+m2Esc(p.name)+'</b></span><span class="m2-ug">'+(cur?'Wears the '+m2Esc(cur.name.toLowerCase()):'Nothing on yet')+(dt?'. '+m2Esc(dt):'')+'</span></div>'+
        '<button type="button" class="m2-btn on m2-usebtn" data-m2="wearbag" data-a="'+p.id+'" data-k="use-'+p.id+'" aria-label="Put the '+m2Esc(it.name)+' on '+m2Esc(p.name)+'">Wear</button></div>'; }).join('')+'</div>';
  }
  return '';
}
function m2BagDetail(id,sheet) {
  const it=items[id],cat=itemCat(it),n=countInBag(id);
  const fx=cat==='gear'?m2Effect(it):m2Esc(m2ItemSub(it));
  const works={heal:'Works here and in a fight.',battle:'Used in a fight, from the Bag button. Not here.',gear:'Wear it here, or from the Gear page.',keep:'A keepsake. Nothing to use it on, just keep it safe.'}[cat];
  return '<div class="m2-bd'+(sheet?' m2-sheetbody':'')+'"><div class="m2-bdh">'+m2ItemPic(id,'big')+'<div class="m2-bdt"><h2>'+m2Esc(it.name)+'</h2><p class="m2-q">'+m2Esc(it.desc||'')+'</p><div class="m2-chips">'+(cat!=='keep'&&fx?'<span class="m2-chip good">'+fx+'</span>':'')+'<span class="m2-chip">You have '+n+'</span></div></div></div><p class="m2-works">'+works+'</p>'+m2UseRows(id)+'</div>';
}
function m2BagBody(d) {
  const {count,shown}=m2BagShown(),wide=d.wide;
  if(!shown.length) return {l:m2BagFilters(count)+'<p class="m2-note">Pockets empty. Go find a door.</p>',r:'<p class="m2-note">Buy and sell at Penny’s Pockets.</p>',single:!wide,cls:'m2-bagp'};
  if(!shown.includes(M2.bagSel)) { M2.bagSel=wide?shown[0]:null; if(!wide) M2.sheet=false; }
  if(wide&&!M2.bagSel) M2.bagSel=shown[0];
  const list=m2BagFilters(count)+m2BagList(shown);
  if(wide) return {l:list,r:'<div class="m2-scroll">'+m2BagDetail(M2.bagSel,false)+'</div><p class="m2-note m2-pn2">Coins buy things at Penny’s Pockets.</p>',cls:'m2-bagp'};
  const sheet=M2.sheet&&M2.bagSel?'<div class="m2-sheet'+(M2.slide?' m2-up':'')+'" role="dialog" aria-label="'+m2Esc(items[M2.bagSel].name)+'"><div class="m2-sh"><button type="button" class="m2-grab" data-m2="sheetx" data-k="sheetx" aria-label="Close this item"><i></i></button><button type="button" class="m2-x2" data-m2="sheetx" data-k="sheetx2" aria-label="Close this item">'+m2Icon('x',20)+'</button></div><div class="m2-scroll">'+m2BagDetail(M2.bagSel,true)+'</div></div>':'';
  M2.slide=false;
  return {l:list+sheet,r:'',single:true,cls:'m2-bagp'};
}

// ---------- System ----------
function m2Ago(when) {
  const t=+when||0; if(!t) return '';
  const s=(Date.now()-t)/1000,d=new Date(t);
  if(s<60) return 'Just now';
  if(s<3600) return Math.floor(s/60)+(Math.floor(s/60)===1?' minute ago':' minutes ago');
  const now=new Date(),tm=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  if(d.toDateString()===now.toDateString()) return 'Today, '+tm;
  return d.toLocaleDateString([],{month:'short',day:'numeric'})+', '+tm;
}
function m2SaveWhere(sv) {
  const lead=(sv.party&&sv.party[0])||{};
  return (worlds[sv.map]?worlds[sv.map].name:'Town')+', Level '+(lead.level||1)+(sv.party?', '+sv.party.length+' in the family':'');
}
function m2SaveRow(slot,sv,other) {
  const auto=slot==='auto',key=other?'loadc-'+other.dev+'-'+other.slot:'load-'+slot;
  const name=other?syncOtherName(other):(auto?'Autosave':'Slot '+slot),ic=other?'cloud':(auto?'clock':'disk');
  let btns='';
  if(!other&&!auto) { const sk='save-'+slot,sure=M2.sure===sk;
    btns+='<button type="button" class="m2-btn'+(sv?(sure?' on':''):'')+'" data-m2="save" data-a="'+slot+'" data-k="'+sk+'" aria-label="'+(sv?(sure?'Replace slot '+slot+'? Tap again':'Save over slot '+slot):'Save in slot '+slot)+'">'+(sv?(sure?'Replace it?':'Save'):'Save here')+'</button>'; }
  if(sv) { const sure=M2.sure===key;
    btns+='<button type="button" class="m2-btn'+(sure?' on':'')+'" data-m2="load" data-a="'+(other?other.dev+'|'+other.slot:slot)+'" data-k="'+key+'" aria-label="'+(sure?'Load '+m2Esc(name)+'? Tap again':'Load '+m2Esc(name))+'">'+(sure?'Load it?':'Load')+'</button>'; }
  return '<div class="m2-sv"><span class="m2-svi">'+m2Icon(ic,22)+'</span><div class="m2-svc"><b>'+m2Esc(name)+'</b>'+(sv?'<span>'+m2Esc(m2SaveWhere(sv))+'</span><span>'+m2Ago(sv.when)+'</span>':'<span>Empty</span>')+'</div><div class="m2-sva">'+btns+'</div></div>';
}
function m2SavesBlock() {
  if(!M2.pulled) { M2.pulled=true; try { if(typeof syncPull==='function') syncPull(); } catch(e) {} }
  const nums=SAVE_SLOTS.filter(s=>s!=='auto'),used=nums.filter(s=>readSave(s)).map(Number),last=used.length?Math.max(...used):0,top=Math.max(3,last+1);
  let h='';
  if(readSave('auto')) h+=m2SaveRow('auto',readSave('auto'));
  for(let n=1;n<=top;n++) h+=m2SaveRow(String(n),readSave(String(n)));
  const others=typeof syncOthers==='function'?syncOthers():[];
  if(others.length) h+='<div class="m2-lab m2-oth">From your other devices</div>'+others.map(o=>m2SaveRow(o.slot,o.sv,o)).join('');
  return '<div class="m2-svs">'+h+'</div>';
}
function m2SaveNote() {
  const t=(typeof lastBackup==='function')?lastBackup():0,c=typeof syncNoteLine==='function'?syncNoteLine():'';
  return 'The game also saves by itself at every door, after each fight and when you leave the app. '+(c||'Cloud saves are off.')+' '+(t?'Last file backup: '+new Date(t).toLocaleDateString()+'.':'No file backup yet.');
}
function m2BackupRow() {
  const on=typeof syncOn==='function'&&syncOn();
  return '<div class="m2-bk"><button type="button" class="m2-btn" data-m2="backup" data-k="backup">'+m2Icon('cloud',18)+'Back up</button><button type="button" class="m2-btn" data-m2="restore" data-k="restore">Restore</button>'+
    '<button type="button" class="m2-btn" data-m2="cloud" data-k="cloud">'+(on?'Sync now':'Cloud set-up')+'</button>'+(on?'<button type="button" class="m2-btn" data-m2="cloudoff" data-k="cloudoff">Cloud off</button>':'')+'</div><p class="m2-note">'+m2Esc(m2SaveNote())+'</p>';
}
function m2BuildFoot() {
  const tag=window.BUILD_TAG||'',when=tag&&typeof buildWhenLabel==='function'?buildWhenLabel(tag).slice(2):'';
  return '<div class="m2-bf"><div class="m2-bl2"><span>Build</span><button type="button" class="m2-blink" data-m2="builds" data-k="builds" aria-label="Build history, this build is '+m2Esc(tag)+'">'+m2Esc(tag||'unknown')+'</button>'+(when?'<small>'+m2Esc(when)+'</small>':'')+'</div>'+
    '<button type="button" class="m2-btn" data-m2="quit" data-k="quit">Quit to title</button></div>';
}
function m2QuitAsk() {
  const auto=readSave('auto');
  return '<div class="m2-ask2" role="alertdialog" aria-modal="true" aria-label="Quit to the title screen"><div class="m2-askb"><h2>Quit to the title screen?</h2><p>Anything since your last save will be lost.</p>'+(auto?'<p class="m2-note">Autosave: '+m2Esc(m2SaveWhere(auto))+', '+m2Ago(auto.when)+'</p>':'')+
    '<div class="m2-askr"><button type="button" class="m2-btn on" data-m2="quitno" data-k="quitno">Keep playing</button><button type="button" class="m2-btn" data-m2="quityes" data-k="quityes">Quit</button></div></div></div>';
}
function m2Vol(kind,label,note) {
  const n=sound.vol[kind],pct=(n-1)/9*100;
  return '<div class="m2-vol"><span class="m2-vl" id="m2-vl-'+kind+'">'+label+'</span><button type="button" class="m2-vb2" data-m2="vol" data-a="'+kind+':-1" data-k="vd-'+kind+'" aria-label="'+label+' down"'+(n<=1?' disabled':'')+'>'+m2Icon('minus',18,2.6)+'</button>'+
    '<span class="m2-track" data-kind="'+kind+'" role="slider" aria-labelledby="m2-vl-'+kind+'" aria-valuemin="1" aria-valuemax="10" aria-valuenow="'+n+'"><span class="m2-rail"><i style="width:'+pct+'%"></i><b style="left:'+pct+'%"></b></span></span>'+
    '<button type="button" class="m2-vb2" data-m2="vol" data-a="'+kind+':1" data-k="vu-'+kind+'" aria-label="'+label+' up"'+(n>=10?' disabled':'')+'>'+m2Icon('plus',18,2.6)+'</button><b class="m2-vn">'+n+'</b></div>'+(note?'<p class="m2-note m2-vnote">'+note+'</p>':'');
}
function m2Seg(label,note,key,list) {
  return '<div class="m2-or"><div class="m2-ol"><b>'+label+'</b>'+(note?'<span>'+m2Esc(note)+'</span>':'')+'</div><div class="m2-segs" role="group" aria-label="'+label+'">'+list.map(([id,txt,on])=>'<button type="button" class="m2-seg'+(on?' on':'')+'" data-m2="'+key+'" data-a="'+id+'" data-k="'+key+'-'+id+'" aria-pressed="'+on+'">'+txt+'</button>').join('')+'</div></div>';
}
function m2Sw(label,note,key,on) {
  return '<div class="m2-sw"><span class="m2-ol"><b id="m2-sw-'+key+'">'+label+'</b>'+(note?'<span>'+m2Esc(note)+'</span>':'')+'</span><button type="button" class="m2-tog" role="switch" aria-checked="'+on+'" aria-labelledby="m2-sw-'+key+'" data-m2="'+key+'" data-k="'+key+'"><i></i></button></div>';
}
function m2Options() {
  const D=b7Diff();
  let h=m2Vol('music','Music','')+m2Vol('voice','Voices','')+m2Vol('fx','Sound effects','');
  h+=m2Seg('Difficulty',D.sub+'. '+D.text,'diff',[['rose','Rose'],['grace','Grace'],['director','Director']].map(([id,n])=>[id,n,B7.diff===id]));
  h+=m2Seg('Battle speed','','speed',[1,2].map(s=>[s,s+'x',B7.speed===s]));
  h+=m2Sw('Show what each skill does','In this menu and in fights.','details',m2Details());
  if(typeof tabletMode!=='undefined'&&!tabletMode.on) h+=m2Sw('Turn the screen sideways','','rotate',!!layout.landscape);
  h+=m2Sw('Less motion','Pages change without sliding.','calm',m2Calm());
  if(!b3sOn()) h+='<div class="m2-lab m2-old">For the old battle</div>'+m2Sw('High-five timing','Tap the gold sparkle for +15%. Rose Mode lands it for you.','hf',B7.hf)+m2Sw('Auto-stamp spends points','Also ranks moves up and unlocks Remixes.','autospend',B7.autoSpend!==false)+m2Sw('Win Now button (admin)','A button in every real fight ends it in a win.','skip',!!B7.skipBtn);
  return '<h2 class="m2-h2">Options</h2><div class="m2-opts">'+h+'</div>';
}
function m2SystemBody(d) {
  const left='<h2 class="m2-h2">Saved games</h2><div class="m2-scroll m2-sysl">'+m2SavesBlock()+m2BackupRow()+'</div>'+m2BuildFoot()+(M2.quit?m2QuitAsk():'');
  if(d.wide) return {l:left,r:'<div class="m2-scroll">'+m2Options()+'</div>',cls:'m2-sys'};
  return {l:'<div class="m2-scroll m2-sysl"><h2 class="m2-h2">Saved games</h2>'+m2SavesBlock()+m2BackupRow()+m2Options()+m2BuildFoot()+'</div>'+(M2.quit?m2QuitAsk():''),r:'',single:true,cls:'m2-sys'};
}

// ---------- Taps ----------
function m2SureSet(key) {
  M2.sure=key; clearTimeout(M2.sureT); sfx.select();
  M2.sureT=setTimeout(()=>{ if(M2.sure===key) { M2.sure=null; if(M2.open&&!M2.legacy&&M2.tab==='system') m2Render(); } },3500);
  M2.focusNext=M2.keys?key:null; m2Render();
}
function m2Redo(k) { M2.focusNext=M2.keys?k:null; m2Render(); }
function m2SetVol(kind,n,track) {
  setVolume(kind,n); M2.dirty=true;
  const v=sound.vol[kind],pct=(v-1)/9*100,t=track||M2.root.querySelector('.m2-track[data-kind="'+kind+'"]'); if(!t) return;
  t.setAttribute('aria-valuenow',v); t.querySelector('i').style.width=pct+'%'; t.querySelector('b').style.left=pct+'%';
  const row=t.parentElement; row.querySelector('.m2-vn').textContent=v;
  const dn=row.querySelector('[data-a$=":-1"]'),up=row.querySelector('[data-a$=":1"]'); if(dn) dn.disabled=v<=1; if(up) up.disabled=v>=10;
}
function m2VolSample(kind) {
  if(kind==='voice') { clearTimeout(M2.sampleT); M2.sampleT=setTimeout(()=>{ try { say('grace','dance'); } catch(e) {} },260); }
  else sfx.select();
}
function m2BagWire(root) {
  root.addEventListener('pointerdown',e=>{
    const t=e.target.closest&&e.target.closest('.m2-track'); if(!t) return;
    e.preventDefault(); try { t.setPointerCapture(e.pointerId); } catch(x) {}
    const rot=typeof layout!=='undefined'&&layout.rotated,kind=t.dataset.kind;
    const at=ev=>{ const r=t.getBoundingClientRect(),rail=t.querySelector('.m2-rail').getBoundingClientRect();
      const a=rot?rail.top:rail.left,len=rot?rail.height:rail.width,f=((rot?ev.clientY:ev.clientX)-a)/Math.max(1,len);
      m2SetVol(kind,1+Math.round(Math.max(0,Math.min(1,f))*9),t); };
    at(e);
    const mv=ev=>at(ev),up=()=>{ t.removeEventListener('pointermove',mv); t.removeEventListener('pointerup',up); t.removeEventListener('pointercancel',up); m2VolSample(kind); };
    t.addEventListener('pointermove',mv); t.addEventListener('pointerup',up); t.addEventListener('pointercancel',up);
  });
}
function m2BagAct(act,a,el) {
  if(act==='bagf') { if(M2.bagF!==a) sfx.tab(); M2.bagF=a; M2.bagSel=null; M2.sheet=false; return m2Redo('f-'+a); }
  if(act==='item') { sfx.tab(); M2.bagSel=a; if(!M2.dims.wide) { M2.sheet=true; M2.slide=true; M2.focusNext=M2.keys?'sheetx2':null; m2Render(); return; } return m2Redo('item-'+a); }
  if(act==='sheetx') { M2.sheet=false; sfx.tab(); return m2Redo(M2.bagSel?'item-'+M2.bagSel:null); }
  if(act==='use'||act==='useall') {
    const id=M2.bagSel,p=act==='use'?party.find(x=>x.id===a):hero; if(!id||!p) return;
    const before=bag.length; useFieldItem(p,id);
    if(bag.length!==before) M2.dirty=true;
    if(!bag.includes(id)) { M2.sheet=false; M2.bagSel=null; }
    M2.focusNext=M2.keys?(M2.bagSel?'use-'+a:null):null; m2Render(); return;
  }
  if(act==='wearbag') {
    const id=M2.bagSel,p=party.find(x=>x.id===a),it=id&&items[id]; if(!p||!it) return;
    if(!canWear(p,it)) { sfx.nope(); return; }
    if(!equipTo(p,id)) { sfx.nope(); return; }
    sfx.equip(); if(typeof syncHeroHat==='function') syncHeroHat(); M2.dirty=true; showToast(p.name+' puts on '+it.name+'.',2);
    if(!bag.includes(id)) { M2.sheet=false; M2.bagSel=null; } m2Render(); return;
  }
  // System
  if(act==='save') {
    const sv=readSave(a),k='save-'+a;
    if(sv&&M2.sure!==k) return m2SureSet(k);
    M2.sure=null; saveSlotAdd(a); saveGame(a); sfx.select(); showToast('Saved to slot '+a+'.',1.6); return m2Redo(k);
  }
  if(act==='load') {
    const other=a.indexOf('|')>=0,k=other?'loadc-'+a.replace('|','-'):'load-'+a;
    if(M2.sure!==k) return m2SureSet(k);
    M2.sure=null; M2.dirty=false;   // the autosave must not be overwritten by the game that is about to be replaced
    if(other) { const o=syncOthers().find(x=>x.dev+'|'+x.slot===a); const slot=o&&syncTake(o); if(!slot) { showToast('Couldn’t copy that save to this device.',3); return m2Render(); } m2CloseNew(); loadGame(slot); showToast('Copied to Slot '+slot+' on this device.',3); return; }
    m2CloseNew(); loadGame(a); return;
  }
  if(act==='backup') { doBackup().then(()=>{ if(M2.open&&M2.tab==='system') m2Render(); }); return; }
  if(act==='restore') { pickRestore(msg=>{ showToast(msg,4); if(M2.open&&M2.tab==='system') m2Render(); }); return; }
  if(act==='cloud') { syncTap(msg=>{ showToast(msg,5); if(M2.open&&M2.tab==='system') m2Render(); }); return; }
  if(act==='cloudoff') { syncOff(); showToast('Cloud saves are off. Your saves stay on this phone.',3.5); return m2Redo('cloud'); }
  if(act==='builds') { if(typeof buildHistoryOpen==='function') buildHistoryOpen(); return; }
  if(act==='quit') { M2.quit=true; sfx.select(); M2.focusNext=M2.keys?'quitno':null; return m2Render(); }
  if(act==='quitno') { M2.quit=false; sfx.tab(); return m2Redo('quit'); }
  if(act==='quityes') { M2.quit=false; M2.dirty=false; quitToTitle(); return; }
  if(act==='vol') { const [kind,dl]=a.split(':'); m2SetVol(kind,sound.vol[kind]+(+dl)); m2VolSample(kind); return m2Redo((+dl<0?'vd-':'vu-')+kind); }
  if(act==='diff') { b7SetDiff(a); M2.dirty=true; sfx.select(); return m2Redo('diff-'+a); }
  if(act==='speed') { B7.speed=+a; b7Save(); M2.dirty=true; sfx.select(); return m2Redo('speed-'+a); }
  if(act==='details') { m2SetDetails(!m2Details()); sfx.select(); return m2Redo('details'); }
  if(act==='rotate') { toggleLayout(); return m2Redo('rotate'); }
  if(act==='calm') { m2SetCalm(!m2Calm()); sfx.select(); return m2Redo('calm'); }
  if(act==='hf') { B7.hf=!B7.hf; b7Save(); M2.dirty=true; sfx.select(); return m2Redo('hf'); }
  if(act==='autospend') { B7.autoSpend=B7.autoSpend===false; b7Save(); M2.dirty=true; sfx.select(); return m2Redo('autospend'); }
  if(act==='skip') { B7.skipBtn=!B7.skipBtn; b7Save(); M2.dirty=true; sfx.select(); return m2Redo('skip'); }
}
// Back, one small thing at a time: the quit question, an ask-twice button, the item sheet.
function m2BagBack() {
  if(M2.quit) { M2.quit=false; sfx.tab(); m2Redo('quit'); return true; }
  if(M2.sure) { M2.sure=null; sfx.tab(); m2Render(); return true; }
  if(M2.sheet) { M2.sheet=false; sfx.tab(); m2Redo(M2.bagSel?'item-'+M2.bagSel:null); return true; }
  return false;
}
