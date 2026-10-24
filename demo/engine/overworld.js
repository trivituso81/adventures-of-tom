'use strict';
// engine/overworld.js — Dialogue box, choices, interaction, movement, map transitions, camera.
function loadDialogLine() {
  dialog.chars=Array.from(dialog.lines[dialog.index]);
  dialog.shown=0;
  dialog.elapsed=0;
  dialog.delay=.02;
  $('dialog-text').textContent='';
  $('dialog-choices').hidden=true;
  $('dialog-page').textContent=(dialog.index+1)+' / '+dialog.lines.length;
  $('dialog-cue').textContent='Tap here or A / Enter to reveal';
  $('announcer').textContent=dialog.name+': '+dialog.lines[dialog.index];
}

function openDialog(name,lines,npc=null) {
  dialog.active=true;
  dialog.name=name;
  dialog.lines=lines.slice();
  dialog.index=0;
  dialog.npc=npc;
  queuedAction=false;

  if(npc) {
    npc.facing=directionTo(player.x-npc.x,player.y-npc.y);
    npc.path=[];
    npc.idle=1.3;
  }

  $('speaker').textContent=name;
  $('dialog').hidden=false;
  $('hint').hidden=true;
  dialog.seed=hash(name.length,name.charCodeAt(0));
  if(npc) sfx.talk(dialog.seed); else sfx.look();
  loadDialogLine();
}

// A yes/no style prompt inside the dialogue box. options: [{label,fn}]
// text can be an array: earlier pages are read first, the choices appear on the last page.
function openChoice(name,text,options,npc=null) {
  openDialog(name,Array.isArray(text)?text:[text],npc);
  dialog.choice={options,sel:0};
  dialog.lastDir=moveInput();
}
function onChoicePage() { return dialog.index===dialog.lines.length-1; }
function showChoices() {
  const box=$('dialog-choices');
  box.innerHTML='';
  dialog.choice.options.forEach((o,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='choice'+(i===dialog.choice.sel?' sel':''); b.dataset.i=i; b.textContent=o.label;
    box.appendChild(b);
  });
  box.hidden=false;
  $('dialog-cue').textContent='Pick one, or press A / Enter';
}
function moveChoice(d) {
  if(!dialog.choice) return;
  const n=dialog.choice.options.length;
  dialog.choice.sel=(dialog.choice.sel+d+n)%n;
  sfx.move();
  for(const b of $('dialog-choices').querySelectorAll('.choice')) b.classList.toggle('sel',Number(b.dataset.i)===dialog.choice.sel);
}
function pickChoice(i) {
  const c=dialog.choice; if(!c) return;
  dialog.choice=null;
  sfx.select();
  const npc=dialog.npc;
  dialog.active=false; dialog.npc=null;
  $('dialog').hidden=true; $('dialog-choices').hidden=true; $('hint').hidden=false;
  c.options[i].fn(npc);
}
function advanceDialog() {
  if(!dialog.active) return;

  if(dialog.shown<dialog.chars.length) {
    sfx.advance();
    dialog.shown=dialog.chars.length;
    $('dialog-text').textContent=dialog.chars.join('');
    $('dialog-cue').textContent=dialog.index===dialog.lines.length-1
      ? 'Tap here or A / Enter to close'
      : 'Tap here or A / Enter to continue';
    if(dialog.choice&&onChoicePage()) showChoices();
    return;
  }
  if(dialog.choice&&onChoicePage()) { pickChoice(dialog.choice.sel); return; }

  dialog.index++;
  sfx.advance();
  if(dialog.index>=dialog.lines.length) {
    const npc=dialog.npc;
    dialog.active=false;
    dialog.npc=null;
    $('dialog').hidden=true;
    $('hint').hidden=false;
    if(npc&&npc.onClose) { const f=npc.onClose; npc.onClose=null; f(); }
    if(npc&&npc.monster&&performance.now()>=npc.defeatedUntil) startBattle(npc);
  } else {
    loadDialogLine();
  }
}

function updateDialog(dt) {
  if(dialog.choice&&onChoicePage()&&dialog.shown>=dialog.chars.length) {
    const dir=moveInput();
    if(dir!==dialog.lastDir) { dialog.lastDir=dir; if(dir==='up'||dir==='left') moveChoice(-1); else if(dir==='down'||dir==='right') moveChoice(1); }
    return;
  }
  if(dialog.shown>=dialog.chars.length) return;
  dialog.elapsed+=dt;
  let changed=false;

  while(dialog.elapsed>=dialog.delay&&dialog.shown<dialog.chars.length) {
    dialog.elapsed-=dialog.delay;
    const c=dialog.chars[dialog.shown++];
    dialog.delay=/[.!?]/.test(c)?.13:(c===','?.07:.024);
    if(dialog.shown%3===0&&c!==' ') sfx.text(dialog.seed+dialog.shown);
    changed=true;
  }

  if(changed)
    $('dialog-text').textContent=dialog.chars.slice(0,dialog.shown).join('');
  if(dialog.choice&&onChoicePage()&&dialog.shown>=dialog.chars.length) { dialog.lastDir=moveInput(); showChoices(); }

  if(dialog.shown===dialog.chars.length)
    $('dialog-cue').textContent=dialog.index===dialog.lines.length-1
      ? 'Tap here or A / Enter to close'
      : 'Tap here or A / Enter to continue';
}

function pressAction() {
  if(transition) return;
  if(intro.active&&!dialog.active) return;
  if(dialog.active) {
    advanceDialog();
    return;
  }
  if(player.move) {
    queuedAction=true;
    return;
  }

  const target=facingTarget();
  if(!target) {
    showToast('Face a neighbor or an object, then press A.',2);
    return;
  }

  if(target.kind==='npc') {
    const n=target.value;
    if(n.shopkeeper) { talkToShopkeeper(n); return; }
    if(n.driver) { talkToDriver(n); return; }
    if(n.monster) n.lines=monsterLines(n);
    if(n.dog) { talkToNara(n); return; }
    if(n.grandma) say('deedee','greet');
    if(n.grandpa) say('boppy','greet');
    if(n.mom) say('amy','greet');
    if(n.partner) say('tnb','greet',.4);
    // Heart-Traces (engine/story.js): warm family moments the story remembers.
    if(typeof heartTrace==='function') { if(n.grandma) heartTrace('deedee-hug'); if(n.grandpa&&n.visitedOnce) heartTrace('boppy-story'); if(n.partner) heartTrace('tnb-hello'); if(n.mom) heartTrace('amy-hello'); }
    if(n.grandma) {
      const hurt=party.some(m=>m.hp<m.maxHp);
      for(const m of party) { m.hp=m.maxHp; m.mp=m.maxMp; }
      n.lines=n.visitedOnce
        ? [pick(['The tomatoes are coming in. You are going home with forty.','I baked at five this morning. The neighbors have stopped asking why.','Tommy, is that a bruise? Sit. Eat. Explain.','To the moon and back, girls. The MOON. And BACK.','Boppy says he is not feeling good. Boppy also will not stop fishing.','Grace, Rose, who wants to help Deedee frost something?','Rhubarb crisp is cooling on the counter. Do not touch it. Okay, one corner.','I already did my walk. Boppy did one lap around the recliner.','Retired registered nurse. Tom calls me a registered nut. Tom is due for a checkup.','Sunday dinner is at five. Five means four thirty.','I just cleaned the floors. Shoes OFF.','A little glass of wine with dinner. Just one. Nurse\'s orders.']),hurt?'Hugs for everyone. There. All better.':'Hugs for everyone, just because. To the moon and back.']
        : n.lines.concat(hurt?['Hugs for everyone. There. All better.']:[]);
      if(bag.filter(id=>id==='cookie').length<2) n.onClose=()=>grantItem('cookie');
      n.visitedOnce=true;
    }
    if(n.partner) {
      kiss={npc:n,start:elapsedTime};
      sfx.kiss();
      if(!n.visitedOnce) n.onClose=()=>grantItem('jacket');
      else n.lines=['Well, well, well...',pick(['Took the longboard down Spring Street this morning. Smooth. There is a crack by Fourth Street I have named.','Threw six mugs this morning. The glaze came out of the kiln like sea glass. Come look before you claim one.','Go on, I will be right here. I am pot-sitive about it.','Horror movie tonight. You pick. You always pick the scary one and then hold my arm the whole time.','Watered your plants on 2nd Ave. The fern asked about you. I said you are fine.','Rode the train to the clay studio. Forty minutes. Best forty minutes of my day. Met a man who knows every line.','The slime? It just needs someone to mold it. I have more of these. You know I do.','Long day on set. Eleven costume changes. One actor lost a shoe. I found it. I always find it.','Be careful out there. I like you un-cracked.'])];
      n.visitedOnce=true;
    }
    if(n.mom) {
      if(n.visitedOnce) n.lines=[pick(['Race you to the fountain. No? Then I win.','Thirty second-graders and none of them as wild as you two. Which I love.','Rose, where are your shoes? Oh. Good.','Grace, be nice to the slime. Then beat it. Those are the two rules.','Tom, if they come back faster than me, we need to talk.','Justin says hi from work. He wants a full report at dinner.','Did Boppy give you that cap? Do not let him near the pond.'])];
      if(bag.filter(id=>id==='juice').length<2) n.onClose=()=>grantItem('juice');
      n.visitedOnce=true;
    }
    if(n.grandpa) {
      if(!n.visitedOnce) n.onClose=()=>grantItem('bcap');
      else n.lines=[pick(['Assistant Deputy Warden at Rikers. All those years, nobody got past me. Except that fish.','At Rikers we did headcounts. Grace, one. Rose, two. Tom, you are dragging.','In college I ran cross country. Champion. Through the woods, up the hills, never breathed hard.','Did I tell you about the championship race? I did? Sit down. I will tell you again.','I am not feeling good. I was fine an hour ago. Then I had a pepper.','Slow down, Tom. Who walks this fast? I was a champion runner and I never walked this fast.','Deedee says I am not allowed near the pond. The pond says otherwise.','Grace, Rose, who is the strongest grandpa? Correct. Now help me up.'])];
      n.visitedOnce=true;
    }
    const rm=n.mom?amy:(n.grandma?deedee:(n.grandpa?boppy:(n.partner?tnb:null)));
    if(rm&&!inParty(rm)) {
      const prev=n.onClose;
      n.onClose=()=>{ if(prev) prev(); offerRecruit(rm,n); };
    }
    openDialog(n.name,n.lines,n);
  } else if(target.kind==='object') {
    const o=target.value;
    if(o.shop) { const pk=currentMap.npcs.find(n=>n.shopkeeper); if(pk) { talkToShopkeeper(pk); return; } }
    if((o.kind==='fountain'||o.restore)&&party.some(m=>m.hp<m.maxHp||m.mp<m.maxMp)) {
      for(const m of party) { m.hp=m.maxHp; m.mp=m.maxMp; }
      sfx.fountain();
      openDialog(o.name,[o.text,o.restoreText||('The spray is freezing. Everyone is completely restored.'+(party.includes(rose)?' Rose is thrilled.':''))]);
    } else {
      openDialog(o.name,[o.text]);
    }
  } else {
    movePlayer(player.facing);
  }
}

function update(dt) {
  if(menuOpen||shopOpen||battle.active) return;
  if(intro.active) { updateIntro(dt); return; }
  if(transition) {
    updateTransition(dt);
    return;
  }
  if(dialog.active) {
    updateDialog(dt);
    return;
  }

  if(player.move) {
    if(advanceMove(player,dt)) {
      const portal=currentMap.portals.get(key(player.x,player.y));
      if(portal) {
        beginTransition(portal);
        return;
      }
      if(queuedAction) {
        queuedAction=false;
        pressAction();
        if(dialog.active) return;
      }
    }
  }

  if(!player.move) {
    const dir=moveInput();
    if(dir) {
      if(movePlayer(dir)) sfx.step();
      else if(performance.now()-lastBump>260) { lastBump=performance.now(); sfx.bump(); }
    }
  }
  // A follower step started this frame waits a frame, so it stays in lockstep with Tom instead of finishing early.
  for(const f of followers) if(f.move) { if(f.move.fresh) { f.move.fresh=false; continue; } advanceMove(f,dt); }
  updateNPCs(dt);
}

function resize() {
  const width=game.clientWidth,height=game.clientHeight;
  scale=!currentMap.outside&&width>=900&&height>=700?2:1;
  W=Math.max(1,Math.ceil(width/scale));
  H=Math.max(1,Math.ceil(height/scale));
  canvas.width=W;
  canvas.height=H;
  ctx.imageSmoothingEnabled=false;

  const short=layout.landscape;
  safeTop=(short?57:82)/scale;
  safeBottom=(short?106:170)/scale;
  camera.snap=true;
}

function updateCamera(dt) {
  const p=position(player);
  const mw=currentMap.w*T,mh=currentMap.h*T;
  const available=Math.max(T*2,H-safeTop-safeBottom);

  const tx=mw<=W
    ? -(W-mw)/2
    : clamp((p.x+.5)*T-W/2,0,mw-W);

  const ty=mh<=available
    ? -(safeTop+(available-mh)/2)
    : clamp((p.y+.5)*T-available/2,0,mh-available)-safeTop;

  const amount=camera.snap?1:Math.min(1,dt*12);
  camera.x+=(tx-camera.x)*amount;
  camera.y+=(ty-camera.y)*amount;
  camera.snap=false;
}

function rect(x,y,w,h,color) {
  gfx.fillStyle=color;
  gfx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}

function ellipse(x,y,rx,ry,color) {
  gfx.fillStyle=color;
  gfx.beginPath();
  gfx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  gfx.fill();
}

function polygon(points,color) {
  gfx.fillStyle=color;
  gfx.beginPath();
  gfx.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++) gfx.lineTo(points[i][0],points[i][1]);
  gfx.closePath();
  gfx.fill();
}

// 3x5 pixel glyphs drawn as whole pixels so sign text stays crisp when the canvas is scaled.
