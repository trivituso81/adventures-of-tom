'use strict';
// engine/menu.js: what is left of the old pause menu (card c-menu4). The menu is now the book of engine/m2-core.js.
// This file keeps: the face pictures (PORTRAITS, drawPortrait), the gear and bag helpers other screens borrow, the Save pop-up opened
// from the map's SAVE button (openSave), and a small shell that draws only the Old Stampcard (engine/progress.js) while a chapter
// still runs on the old battle. Controls in the shell: tap; arrows/WASD move focus, Esc/B goes back, Q/E switch character.
const MENU_TABS=[{id:'home',label:'Menu'},{id:'stamps',label:'Stamps'}];
const PER_CHAR_TABS=['stamps'];
// Character portraits (the menu's faces, dialogue box, battle panels, chapter select): head crops of each hero painting,
// baked by tools/sprite-bake/bake_portraits.py (256 x 256). Boomie has no hero painting yet. Empty shows a placeholder.
// portrait1: the faces in status screens, turn order and battle panels (portraits/<id>.png, tools/sprite-bake/bake_portraits.py). The ids and the tag
// come from data/portrait-ver.js (written by the baker), so a saved crop reaches every screen and the phone fetches the new picture.
const PORTRAITS={}; for(const id of PORTRAIT_IDS) PORTRAITS[id]='portraits/'+id+'.png?v='+PORTRAIT_V;
// Speaking monsters: zoomed face crops from each enemy's painted stance frame (tools/sprite-bake/bake_foe_portraits.py). Keys are foe_<id>.
for(const id of ["mudling", "skeeter", "grump", "bigone", "coyote", "smoglet", "tickets", "bigshake", "soggysock", "tangle", "snag", "irongill", "ironbelly", "wetblanket", "thedraft", "pickyeater", "boommoth", "clapper", "cuecrab", "directorscut", "chairman", "cheekstuffer", "peanutgallery", "twigspy", "dodgeball", "glitterglue", "tardybell", "redpen", "cliffhanger", "knowitall", "popup", "unread", "coathanger", "soreloser", "wallflower", "mirrorball", "longline", "unclaimed", "armresthog", "lastcall", "gridlockprime", "finalcall", "standbysprite", "hush9final", "drillworm", "censor", "leviathan", "brainfreeze", "slushslug", "gremlin", "conehead", "toad", "log", "gridlock", "tarblob", "bobber", "extra", "fogwisp", "popquiz", "acornagent", "stickysap", "acorncache", "shusher", "dogear", "lukewarm", "leftover", "velvetrope", "stuffedshirt", "carryon", "jetlag", "lostluggage", "redeye", "hushling", "signalfault", "turnstile", "greynote", "twinlens", "pausesprite", "paperweight", "curator", "deadletter", "rubberstamp"]) PORTRAITS['foe_'+id]='portraits/foes/'+id+'.webp?v=foeport2';
// Ending-frame faces (ch2fix1, tools/sprite-bake/bake_foe_portraits.py END_CROP): foe_<id>_<frame>.
for(const [id,f] of [['bigshake','calm'],['bigshake','touched']]) PORTRAITS['foe_'+id+'_'+f]='portraits/foes/'+id+'-'+f+'.webp?v=ch2fix1';
// gem-bug05: hero portraits are fetched and decoded once at load, and the pictures are kept, so the chapter list, the battle
// turn bar and party panel and the menus draw a finished face on their first frame instead of a dark square.
const PORTRAIT_KEEP=[];
for(const [id,src] of Object.entries(PORTRAITS)) if(src&&!id.startsWith('foe_')) { const im=new Image(); im.decoding='async'; im.src=src; if(im.decode) im.decode().catch(()=>{}); PORTRAIT_KEEP.push(im); }
let playTime=0;
// Gear (F6): the six battle stats. Tools add POW and WARMTH, Outfits HP, GRIT and COOL, Keepsake Charms have perks.
const GEAR_KEYS=STAT_NAMES;
// BEST GEAR scoring: stat points (HP counts less, it comes in bigger numbers); charms by their perk (b6PerkScore).
const GEAR_WEIGHT={hp:.2,pow:1,grit:1,warmth:1,cool:1,pep:1};
let menuSaving=false,menuConfirm=null,menuConfirmTimer=0,menuKeyNav=false,menuFocusNext=null;
menuTab='home';

const gearVal=(it,k)=>!it?0:((it.stats&&it.stats[k])||0);
const gearScore=it=>!it?0:GEAR_KEYS.reduce((a,k)=>a+gearVal(it,k)*GEAR_WEIGHT[k],0)+b6PerkScore(it.perk);
const itemCat=it=>it.slot?'gear':(fieldUsable(it)?'heal':(battleUsable(it)?'battle':'keep'));
const CAT_ORDER={heal:0,battle:1,gear:2,keep:3};
function gearOptions(m,slot) {
  return [...new Set(bag.filter(id=>items[id]&&items[id].slot===slot&&canWear(m,items[id])))]
    .sort((a,b)=>gearScore(items[b])-gearScore(items[a])||items[a].name.localeCompare(items[b].name));
}
function bestFor(m,slot) {
  const cur=m.equipment[slot]; let best=null,bs=cur?gearScore(items[cur]):0;
  for(const id of gearOptions(m,slot)) { const s=gearScore(items[id]); if(s>bs) { best=id; bs=s; } }
  return best;
}
function gearTotals(m,swapSlot,swapId) {
  const t={};
  for(const k of GEAR_KEYS) {
    let v=statTotal(m,k);
    if(swapSlot!=null) v+=gearVal(swapId?items[swapId]:null,k)-gearVal(m.equipment[swapSlot]?items[m.equipment[swapSlot]]:null,k);
    t[k]=v;
  }
  return t;
}
const signed=v=>(v>0?'+':'')+v;
function el(tag,cls,html) { const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function btn(cls,key,html,fn) {
  const b=el('button',cls,html); b.type='button';
  if(key) b.dataset.k=key;
  if(fn) b.addEventListener('click',e=>{ e.stopPropagation(); fn(e); });
  return b;
}
function bar(frac,color) { const b=el('span','mbar'); const i=el('i'); i.style.width=Math.max(0,Math.min(100,Math.round(frac*100)))+'%'; if(color) i.style.background=color; b.appendChild(i); return b; }

// ---------- Actions ----------
// A charm with `hat` shows on Tom's head in town (a color, or the sunhat color for the drawn hats).
function syncHeroHat() {
  const it=hero.equipment.Charm&&items[hero.equipment.Charm],h=it&&it.hat;
  palettes.player.hat=h?(String(h)[0]==='#'?h:'#dac487'):null;
}
function equipBest(m) {
  const before=gearTotals(m),put=[];
  for(const s of wearSlots(m)) { const id=bestFor(m,s); if(id&&equipTo(m,id)) put.push(items[id].name); }
  if(!put.length) { sfx.nope(); showToast(m.name+' is already wearing the best gear in the pockets.',2.2); return; }
  sfx.equip(); syncHeroHat();
  const after=gearTotals(m);
  const ch=GEAR_KEYS.map(k=>[k,after[k]-before[k]]).filter(([,v])=>v).map(([k,v])=>signed(v)+' '+STAT_LABEL[k]).join(', ');
  showToast(m.name+' puts on '+put.join(', ')+'.'+(ch?' '+ch+'.':''),3.2);
  renderMenu();
}
// Rose Mode: nobody has to open GEAR. The best gear goes on by itself whenever something new arrives (gift, win, shop,
// story) and whenever someone joins the party. list = who to dress (default: the party). Returns toast sentences.
function autoGear(list) {
  const put=[];
  if(!roseAuto()) return put;
  for(const m of list||party) for(const s of wearSlots(m)) { const id=bestFor(m,s); if(id&&equipTo(m,id)) put.push(m.name+' wears the '+items[id].name+'.'); }
  if(put.length&&typeof syncHeroHat==='function') syncHeroHat();
  return put;
}

function askConfirm(key) {
  menuConfirm=key; clearTimeout(menuConfirmTimer);
  menuConfirmTimer=setTimeout(()=>{ if(menuConfirm===key) { menuConfirm=null; if(menuOpen) renderMenu(); } },3500);
  sfx.select(); renderMenu();
}

// ---------- Render ----------
function renderMenu() {
  if(menuSaving) { renderSavePop(); return; }
  if(menuTab!=='home'&&!MENU_TABS.some(t=>t.id===menuTab)) menuTab='home';
  if(menuChar>=party.length) menuChar=0;
  const ae=document.activeElement;
  const keep=menuFocusNext||(menuKeyNav&&ae&&ae.dataset?ae.dataset.k:null);
  menuFocusNext=null;
  const m=party[menuChar],perChar=PER_CHAR_TABS.includes(menuTab);
  const body=$('menu-body'),top=body.scrollTop;
  body.innerHTML='';

  // Command list.
  const cmds=$('menu-cmds'); cmds.innerHTML='';
  for(const t of MENU_TABS) {
    const b=btn('mcmd'+(t.id===menuTab?' active':''),'cmd-'+t.id,t.label,()=>setMenuTab(t.id));
    b.setAttribute('role','tab'); b.setAttribute('aria-selected',t.id===menuTab);
    if(t.id==='stamps'&&party.some(b6Stampable)) b.appendChild(el('i','cmd-dot'));   // Stamp Points waiting
    cmds.appendChild(b);
  }
  $('menu-time').textContent=fmtTime(playTime);
  $('menu-coins').textContent=coins;
  $('menu-loc').textContent=(currentMap&&currentMap.name)||'Long Island';

  // Character tabs, only where the view is about one person.
  const pick=$('menu-party'); pick.innerHTML=''; pick.hidden=!perChar;
  if(perChar) party.forEach((pm,i)=>{
    const b=btn('mtab ptab'+(i===menuChar?' active':'')+(pm.hp<=0?' ko':''),'char-'+i,'',()=>setMenuChar(i));
    b.setAttribute('role','tab'); b.setAttribute('aria-selected',i===menuChar); b.setAttribute('aria-label',pm.name);
    const copy=el('span','ptab-copy');
    const nm=el('span','ptab-name'); nm.textContent=pm.name.toUpperCase(); copy.appendChild(nm);
    copy.appendChild(bar(pm.hp/pm.maxHp,pm.hp/pm.maxHp<=.25?'#c8553d':null));
    copy.appendChild(bar(pm.level>=B6.maxLevel?1:pm.xp/B6.xpPerLevel,'#c9a24d'));
    b.appendChild(copy);
    if(menuTab==='stamps'&&b6Stampable(pm)) b.appendChild(el('i','up-badge sp','\u2605'));
    pick.appendChild(b);
  });

  if(menuTab==='stamps') renderStampsTab(body,m);   // the only page left in this shell (the Old Stampcard link, engine/m2-core.js)
  $('menu-foot').hidden=menuTab==='home';

  body.scrollTop=top;
  b6Badge();
  if(keep) {
    const f=document.querySelector('#menu [data-k="'+keep+'"]')||document.querySelector('#menu .mcmd.active')||document.querySelector('#menu .mcmd');
    if(f) { f.focus({preventScroll:true}); f.scrollIntoView({block:'nearest'}); }
  }
}
const fmtTime=s=>{ s=Math.floor(s); const h=Math.floor(s/3600),mm=Math.floor(s/60)%60; return h+':'+String(mm).padStart(2,'0'); };

// Big screens (desktop, iPad): the menu and shop lay out as if on a phone in landscape (about 880 x 500),
// then zoom up to fill the screen, so text and windows grow together. Phones never reach the threshold.
let menuZ=1;
function menuZoom() {
  const g=$('game'), rot=typeof layout!=='undefined'&&layout.rotated;
  const w=rot&&g?g.offsetWidth:innerWidth, h=rot&&g?g.offsetHeight:innerHeight;
  // Unfolded iPhone Duo (docs/DUO.md): sideways the menu lays out at about 800 x 500 and zooms to fit (1.19 at 951 x 648); upright at about 520 wide.
  const duo=typeof duoMode!=='undefined'&&duoMode.open;
  menuZ=duo?Math.max(1,w>h?Math.min(w/800,h/500):Math.min(w/520,h/680)):(w>=1000&&h>=560)?Math.max(1,Math.min(2.4,w/880,h/500)):1;
  for(const id of ['menu','shop']) { const e=$(id); if(e) e.style.zoom=menuZ>1?menuZ.toFixed(3):''; }
  return menuZ;
}
addEventListener('resize',()=>{ menuZoom(); });

// Leaving the Stampcard (another tab, Back, or closing the menu) autosaves quietly, so new stamps are never lost.
function menuLeaveStamps() { if(menuTab==='stamps'&&typeof saveGame==='function') saveGame('auto',true); }
function setMenuTab(id) {
  if(menuTab!==id) { sfx.tab(); menuLeaveStamps(); }
  menuTab=id; menuConfirm=null; if(typeof b6Sure!=='undefined') b6Sure=null;
  $('menu-body').scrollTop=0; menuFocusNext=menuKeyNav?'cmd-'+id:null;
  renderMenu();
}
function setMenuChar(i) {
  if(menuChar!==i) sfx.tab();
  menuChar=i;
  menuFocusNext=menuKeyNav?'char-'+i:null;
  renderMenu();
}
function menuCycleChar(d) {
  if(!PER_CHAR_TABS.includes(menuTab)||party.length<2) return;
  setMenuChar((menuChar+d+party.length)%party.length);
}

// STAMPS: renderStampsTab in engine/progress.js.




// SAVE POPUP: opened from the HUD save button. Ten slots (the list scrolls); overwriting asks once. Closes after saving.
function openSave(viaKeys) {
  if(typeof intro!=='undefined'&&intro.active) return;
  if(menuOpen||(typeof shopOpen!=='undefined'&&shopOpen)) return;
  menuOpen=true; menuSaving=true;
  sfx.menuOpen();
  clearInput();
  menuTab='home'; menuConfirm=null;
  menuKeyNav=!!viaKeys;
  menuFocusNext=menuKeyNav?'psave-1':null;
  $('menu').classList.add('saving');
  $('menu').hidden=false;
  renderSavePop();
}
function renderSavePop() {
  const ae=document.activeElement;
  const keep=menuFocusNext||(menuKeyNav&&ae&&ae.dataset?ae.dataset.k:null);
  menuFocusNext=null;
  const old=$('menu-save'); if(old) old.remove();
  const wrap=el('div','mquit msave'); wrap.id='menu-save';
  wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-modal','true'); wrap.setAttribute('aria-labelledby','msave-title');
  wrap.addEventListener('click',e=>{ if(e.target===wrap) closeMenu(); });
  const box=el('div','mwin mquit-box msave-box');
  const h=el('div','mquit-title'); h.id='msave-title'; h.textContent='Save your game'; box.appendChild(h);
  const list=el('div','item-list single');
  // Every slot, and always one empty one at the end: when all are used a new numbered slot is offered (no limit, slotless1).
  const shown=SAVE_SLOTS.filter(s=>s!=='auto');
  if(shown.every(s=>readSave(s))) shown.push(String(Math.max(...shown.map(Number))+1));
  for(const slot of shown) {
    const sv=readSave(slot);
    const row=el('div','save-row');
    row.innerHTML='<div class="item-icon">\u{1F4BE}</div><div class="save-copy"><span class="save-name"></span><span class="save-meta"></span></div>';
    row.querySelector('.save-name').textContent='Slot '+slot;
    row.querySelector('.save-meta').textContent=saveSummary(sv);
    const k='psave-'+slot,sure=menuConfirm===k;
    row.appendChild(btn('save-btn'+(sure?' sure':''),k,sure?'OVERWRITE?':'SAVE',()=>{
      if(sv&&!sure) { askConfirm(k); return; }
      menuConfirm=null; saveSlotAdd(slot); saveGame(slot); sfx.select(); closeMenu(); showToast('Saved to slot '+slot+'.',1.6);
    }));
    list.appendChild(row);
  }
  box.appendChild(list);
  const acct=el('div','mquit-text macct',saveNoteLine()); acct.id='msave-acct'; box.appendChild(acct);
  box.appendChild(el('div','mquit-text','Autosave also happens at every door, after each battle and when you leave the app. Load from the menu.'));
  const row=el('div','mquit-btns');
  row.appendChild(btn('save-btn','psave-backup','BACK UP',()=>{ doBackup().then(()=>renderSavePop()); }));
  row.appendChild(btn('save-btn mquit-no','psave-close','CLOSE',closeMenu));
  box.appendChild(row); wrap.appendChild(box);
  $('menu').appendChild(wrap);
  if(keep) { const f=document.querySelector('#menu-save [data-k="'+keep+'"]')||document.querySelector('#menu-save button'); if(f) f.focus({preventScroll:true}); }
}

function quitToTitle() {
  sfx.select();
  $('menu').classList.add('quitting');
  setTimeout(()=>location.reload(),220);
}

// ---------- Portrait ----------
function drawPortrait(m,canvasId='portrait') {
  const cv=typeof canvasId==='string'?$(canvasId):canvasId;
  const pc=cv.getContext('2d');
  pc.imageSmoothingEnabled=false;
  pc.clearRect(0,0,24,24);
  const src={tom:TOM_OW,grace:GRACE_OW,rose:ROSE_OW,amy:AMY_OW,justin:(typeof OW!=='undefined'&&OW.justin)||AMY_OW,olivia:(typeof OW!=='undefined'&&OW.olivia)||AMY_OW,deedee:DEEDEE_OW,boppy:BOPPY_OW,tnb:TNB_OW,nara:NARA_OW}[m.id];
  const fr=src.down[0],pal=src.pal;
  // Crop the head: top rows, centered horizontally.
  const w=fr[0].length;
  const left=Math.floor((w-24)/2);
  const top=m.id==='rose'?2:0;
  const tint=garmentTint('ow',m.id,memberTopColor(m),true);
  for(let r=0;r<24;r++) {
    const row=fr[r+top];
    if(!row) break;
    for(let c=0;c<24;c++) {
      const ch=row[c+left];
      if(!ch||ch==='.') continue;
      const sr=r+top;
      pc.fillStyle=(tint&&sr>=tint.rows[0]&&sr<=tint.rows[1]&&tint.map[ch])||pal[ch];
      pc.fillRect(c,r,1,1);
    }
  }
  const hat=m.equipment.Charm;
  const fill=(x,y,w,h,col)=>{pc.fillStyle=col;pc.fillRect(x,y,w,h);};
  if(hat==='sunhat'||hat==='scrap') { const col=hat==='scrap'?'#f5d389':'#dac487'; fill(4,1,16,3,col); fill(2,4,20,2,col); fill(4,1,16,1,'#fff3cf'); }
  if(hat==='bcap') { fill(5,1,14,4,'#4a4e57'); fill(3,5,18,2,'#3a3d44'); fill(5,1,14,1,'#6a6f7a'); }
  if(hat==='beanie') { fill(5,0,14,6,'#3a4a8a'); fill(4,5,16,2,'#2c3a70'); fill(6,0,12,1,'#5b6cb0'); fill(11,2,2,2,'#ffe08a'); }
  if(hat==='rclip'&&m.id==='rose') { fill(5,4,2,2,'#d94a4a'); }
  if(m===hero&&canvasId==='portrait') syncHeroHat();
}


function closeMenu() {
  if(!menuOpen) return;
  menuLeaveStamps();
  menuOpen=false; menuSaving=false; menuConfirm=null;
  const sp=$('menu-save'); if(sp) sp.remove();
  $('menu').classList.remove('saving');
  sfx.menuClose();
  $('menu').hidden=true;
  canvas.focus();
}

// The menu is the book of engine/m2-core.js (travel.js wraps this name, so it is declared here, before them).
function openMenu(viaKeys) { return m2OpenNew(viaKeys); }

// Back: cancel a confirm or a Stampcard pick, then close the menu (a Stampcard opened from the book goes back to the book first, engine/m2-core.js).
function menuBack(fromCmd) {
  if(menuSaving) { if(menuConfirm) { menuConfirm=null; renderMenu(); } else closeMenu(); return; }
  if(fromCmd) menuConfirm=null;
  if(menuConfirm) { menuConfirm=null; renderMenu(); return; }
  if(typeof b6Sure!=='undefined'&&b6Sure) { b6Sure=null; renderMenu(); return; }
  if(!fromCmd&&menuTab==='stamps'&&typeof scBack==='function'&&scBack()) return;
  closeMenu();
}
function menuButtons() {
  const sel=menuSaving?'#menu-save button':'#menu .menu-panel button';
  return [...document.querySelectorAll(sel)].filter(b=>!b.disabled&&b.offsetParent!==null);
}
// Spatial focus: pick the nearest button in the pressed direction.
function menuMove(dir) {
  menuKeyNav=true;
  const all=menuButtons(),cur=document.activeElement;
  if(!all.includes(cur)) { const t=menuSaving?all[0]:document.querySelector('#menu .mcmd.active')||document.querySelector('#menu .mcmd'); if(t) t.focus(); sfx.move(); return; }
  const a=cur.getBoundingClientRect(),cx=a.left+a.width/2,cy=a.top+a.height/2;
  let best=null,bd=Infinity;
  for(const b of all) {
    if(b===cur) continue;
    const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    const gx=Math.max(0,r.left-a.right,a.left-r.right),gy=Math.max(0,r.top-a.bottom,a.top-r.bottom);
    let main,cross;
    if(dir==='up') { if(r.bottom>a.top+2) continue; main=gy; cross=gx; }
    else if(dir==='down') { if(r.top<a.bottom-2) continue; main=gy; cross=gx; }
    else if(dir==='left') { if(r.right>a.left+2||gy>0) continue; main=gx; cross=gy; }
    else { if(r.left<a.right-2||gy>0) continue; main=gx; cross=gy; }
    const d=main+cross*3+Math.abs(dir==='up'||dir==='down'?x-cx:y-cy)*.05;
    if(d<bd) { bd=d; best=b; }
  }
  if(!best) return;
  sfx.move();
  best.focus({preventScroll:true});
  best.scrollIntoView({block:'nearest'});
}
// Keyboard while the menu is open. Returns true when handled.
function menuKey(e) {
  const dirs={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
  if(dirs[e.code]) { e.preventDefault(); menuMove(dirs[e.code]); return true; }
  if(e.code==='KeyQ'||e.code==='BracketLeft') { e.preventDefault(); menuKeyNav=true; menuCycleChar(-1); return true; }
  if(e.code==='KeyE'||e.code==='BracketRight') { e.preventDefault(); menuKeyNav=true; menuCycleChar(1); return true; }
  if(e.code==='Escape'||e.code==='Backspace') { e.preventDefault(); menuBack(); return true; }
  if((e.code==='Enter'||e.code==='Space')&&!menuButtons().includes(document.activeElement)) { e.preventDefault(); menuMove('down'); return true; }
  return false;
}
// Controller while the menu is open.
function menuPad(p) {
  if(p.dir&&p.dirEdge) menuMove(p.dir);
  if(p.A) { const f=document.activeElement; if(menuButtons().includes(f)) f.click(); else menuMove('down'); }
  if(p.B) menuBack();
  if(p.START||p.Y) closeMenu();
  if(p.prev) { menuKeyNav=true; menuCycleChar(-1); }
  if(p.next) { menuKeyNav=true; menuCycleChar(1); }
}

// Live stat preview on focus or hover; touch input switches focus restore off.
(function wireMenu() {
  const mb=$('menu-body');
  $('menu').addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') menuKeyNav=false; });
  // Tapping a hint's label works like tapping its key.
  for(const h of document.querySelectorAll('#menu .hint')) h.addEventListener('click',e=>{ const k=h.querySelector('.key'); if(e.target!==k) k.click(); });
})();
