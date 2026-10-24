'use strict';
// engine/town-render.js — Rendering the town, interiors, actors and HUD extras.
function kissLean(a) {
  if(!kiss||(a!==player&&a!==kiss.npc)) return 0;
  const t=elapsedTime-kiss.start;
  if(t>2.2) return 0;
  const k=Math.sin(Math.PI*Math.min(1,t/1.1))*(t<1.1?1:Math.max(0,1-(t-1.1)/1.1));
  const dir=Math.sign((a===player?kiss.npc.x:player.x)-(a===player?player.x:kiss.npc.x))||(a===player?1:-1);
  return Math.round(dir*k*7);
}
// Walk cycle synced to steps: each tile shows a stride for the first half, then the standing frame; strides alternate legs.
function walkPhase(a) {
  if(!a.move) return -1;
  if(a.move!==a._stepMove) { a._stepMove=a.move; a.stepN=(a.stepN||0)+1; }
  return clamp(a.move.elapsed/a.move.duration,0,1);
}
function drawSheetActor(a,set) {
  const p=position(a);
  const cx=Math.round((p.x+.5)*T)+kissLean(a),base=Math.round((p.y+1)*T-2)-Math.round(a.lift||0);
  const frames=a.facing==='left'?set.left:(a.facing==='right'?set.side:set[a.facing]);
  const ph=walkPhase(a),fi=ph>=0&&ph<.55?1+(a.stepN%2):0;
  const fr=frames[fi];
  const w=fr[0].length,h=fr.length;
  if(!a.noShadow) ellipse(cx,base+1+Math.round(a.lift||0),Math.round(w*.45),4,'#2f493640');
  const m=a.isPlayer?hero:a.member;
  activeTint=m?garmentTint('ow',m.id,memberTopColor(m)):null;
  drawSprite(fr,set.pal,cx-Math.floor(w/2),base-h,1);
  activeTint=null;
}

function drawOutdoorTile(x,y,type,time) {
  const px=x*T,py=y*T,n=hash(x,y);
  rect(px,py,T,T,['#8fb074','#92b377','#95b67a','#8ead71'][n%4]);

  if(type==='water') {
    rect(px,py,T,T,'#6f9a98');
    rect(px+2,py+2,T-4,T-4,'#82b3b1');
    rect(px+2,py+T-8,T-4,6,'#78a8a6');
    const L=isWater(x-1,y),R=isWater(x+1,y),U=isWater(x,y-1),D=isWater(x,y+1);
    if(L) rect(px,py+2,2,T-4,'#82b3b1');
    if(R) rect(px+T-2,py+2,2,T-4,'#82b3b1');
    if(U) rect(px+2,py,T-4,2,'#82b3b1');
    if(D) rect(px+2,py+T-2,T-4,2,'#78a8a6');
    if(!U) rect(px+2,py+2,T-4,1,'#c6e2d6');
    const ph=(Math.floor(time*2)+n)%6;
    rect(px+5+ph,py+9,9,1,'#c0dccb');
    rect(px+7+ph,py+10,4,1,'#d9ecdf');
    rect(px+17-ph,py+21,7,1,'#6a9f9d');
    rect(px+9-ph%3,py+26,5,1,'#5f9391');
    if(n%7===0) {
      ellipse(px+15,py+17,8,5,'#5f8a4d');
      ellipse(px+15,py+16,7,4,'#7aa65e');
      rect(px+15,py+13,3,4,'#82b3b1');
      rect(px+10,py+13,3,2,'#f1c5d4'); rect(px+11,py+12,1,1,'#fff0f5'); rect(px+11,py+14,1,1,'#e39bb4');
    }
    return;
  }

  if(type==='mud') {
    rect(px,py,T,T,['#8a9158','#858c54','#8f965c','#82894f'][n%4]);
    rect(px+4+(n%9),py+6+((n>>>4)%9),9,4,'#6f7846');
    rect(px+5+(n%9),py+7+((n>>>4)%9),7,2,'#5f6b4a');
    rect(px+18+((n>>>8)%6),py+19+((n>>>12)%6),6,3,'#6f7846');
    rect(px+19+((n>>>8)%6),py+20+((n>>>12)%6),4,1,'#9fb27d');
    if(n%3===0) { rect(px+3+((n>>>3)%20),py+22,3,2,'#565e3d'); }
    if(n%5===0) { rect(px+20,py+4,2,2,'#a4ab6e'); rect(px+8,py+26,1,1,'#a4ab6e'); }
    return;
  }

  if(type==='path'||type==='door') {
    const l=isPath(x-1,y),r=isPath(x+1,y),u=isPath(x,y-1),d=isPath(x,y+1);
    const il=l?0:3,ir=r?0:3,iu=u?0:3,id=d?0:3;
    rect(px+il,py+iu,T-il-ir,T-iu-id,'#d9c69b');
    if(!u) { rect(px+il,py+iu,T-il-ir,1,'#eadab3'); rect(px+il,py+iu-1,T-il-ir,1,'#b3a67f'); }
    if(!d) { rect(px+il,py+T-id-2,T-il-ir,2,'#bfae87'); rect(px+il,py+T-id,T-il-ir,1,'#7f9b64'); }
    if(!l) rect(px+il,py+iu,1,T-iu-id,'#e6d6ad');
    if(!r) rect(px+T-ir-1,py+iu,1,T-iu-id,'#c4b38c');
    if(n%3===0) { rect(px+9,py+13,3,2,'#bba986'); rect(px+9,py+13,2,1,'#cdbb94'); }
    if(n%4===0) { rect(px+22,py+7,2,2,'#efe0b9'); }
    if(n%5===0) { rect(px+17,py+24,4,1,'#c7b58e'); }
    if(n%6===0) { rect(px+5,py+22,2,1,'#e9dab3'); }
    return;
  }

  // grass detail: blade clusters, dither, flowers
  const gx=px+4+(n%12),gy=py+6+((n>>>4)%12);
  const dark='#789b64',light='#a3c283';
  rect(gx,gy,1,3,dark); rect(gx+2,gy+1,1,3,dark); rect(gx+1,gy-1,1,2,light);
  const g2x=px+18+((n>>>8)%9),g2y=py+18+((n>>>12)%8);
  rect(g2x,g2y,1,3,dark); rect(g2x+2,g2y+1,1,2,light);
  if(n%2===0) rect(px+((n>>>3)%28),py+((n>>>7)%28),2,1,'#9cbb7e');
  if(n%11===0) {
    const fx=px+8+(n%10),fy=py+14;
    rect(fx+1,fy+3,1,6,'#6e9561');
    rect(fx+2,fy+5,2,1,'#6e9561');
    const col=n%2?'#f1d99e':'#e4b9c9';
    rect(fx,fy,3,3,col); rect(fx+1,fy-1,1,1,col); rect(fx+1,fy+3,1,1,col); rect(fx-1,fy+1,1,1,col); rect(fx+3,fy+1,1,1,col);
    rect(fx+1,fy+1,1,1,'#fff6d2');
  }
}
function isWater(x,y) { return within(currentMap,x,y)&&currentMap.tiles[y][x]==='water'; }

function drawIndoorTile(x,y,type) {
  const s=currentMap.style,px=x*T,py=y*T,n=hash(x,y);
  rect(px,py,T,T,(x+y)%2?s.floor:s.alt);
  if(s.pattern==='wood') {
    rect(px,py,T,T,s.floor);
    for(let i=0;i<4;i++) {
      const yy=py+i*8,off=(y*4+i)%2?16:0;
      rect(px,yy+7,T,1,'#5c503f33');
      rect(px+off,yy,1,8,'#5c503f33');
      rect(px+((off+9+n)%T),yy+3,4,1,'#8d7a5a22');
      rect(px+off+2,yy+1,1,1,'#3f352a44');
    }
  } else if(s.pattern==='tile'||s.pattern==='check') {
    rect(px,py,16,16,s.floor); rect(px+16,py,16,16,s.alt); rect(px,py+16,16,16,s.alt); rect(px+16,py+16,16,16,s.floor);
    rect(px,py,T,1,'#ffffe333'); rect(px,py,1,T,'#ffffe333'); rect(px+16,py,1,T,'#ffffe322'); rect(px,py+16,T,1,'#ffffe322');
    rect(px+1,py+1,2,2,'#ffffff22'); rect(px+17,py+17,2,2,'#ffffff22');
  } else if(s.pattern==='night') {
    rect(px,py,T,1,'#697c902a'); rect(px,py,1,T,'#697c901a');
    if(n%3===0) { rect(px+14,py+14,5,1,'#d9d7b9'); rect(px+16,py+12,1,5,'#d9d7b9'); rect(px+16,py+14,1,1,'#ffffff'); }
    if(n%5===0) rect(px+6+(n%12),py+4+((n>>>5)%12),1,1,'#c9d2e8');
  }

  if(type==='wall') {
    rect(px,py,T,T,s.wall);
    rect(px,py,T,6,s.trim);
    rect(px,py+6,T,1,'#3b3c3066');
    rect(px,py+7,T,1,'#ffffff22');
    for(let i=0;i<T;i+=8) rect(px+i,py+8,1,18,'#ffffff12');
    rect(px+4,py+10,1,12,'#ffffff1e');
    rect(px,py+26,T,6,'#46534560');
    rect(px,py+26,T,1,'#2a2f2a80');
    rect(px,py+30,T,2,'#2a2f2a55');
    if(n%4===0) rect(px+10+(n%10),py+14,3,2,'#00000012');
  } else if(type==='exit') {
    rect(px+2,py+2,28,30,'#6f6753');
    rect(px+4,py+4,24,26,'#d6ba82');
    for(let i=0;i<6;i++) rect(px+4,py+6+i*4,24,1,'#c2a66e');
    rect(px+14,py+8,4,9,'#fff2bf'); rect(px+10,py+15,12,3,'#fff2bf'); rect(px+12,py+18,8,2,'#fff2bf'); rect(px+14,py+20,4,2,'#fff2bf');
    rect(px+4,py+4,24,1,'#eedaa6'); rect(px+4,py+29,24,1,'#9a8559');
  }
}

function drawRug(r) {
  const x=r.x*T+4,y=r.y*T+6,w=r.w*T-8,h=r.h*T-12;
  rect(x,y+2,w,h,'#00000018');
  rect(x,y,w,h,currentMap.style.rug);
  rect(x+2,y+2,w-4,2,'#fff0d47a'); rect(x+2,y+h-4,w-4,2,'#fff0d47a');
  rect(x+2,y+2,2,h-4,'#fff0d455'); rect(x+w-4,y+2,2,h-4,'#fff0d455');
  rect(x+6,y+6,w-12,1,'#00000022'); rect(x+6,y+h-7,w-12,1,'#00000022');
  for(let j=14;j<h-10;j+=14) for(let i=14;i<w-10;i+=14) { rect(x+i,y+j-1,1,3,'#fff3d344'); rect(x+i-1,y+j,3,1,'#fff3d344'); }
  for(let i=4;i<w-3;i+=6) { rect(x+i,y-3,2,3,'#eadfc0b0'); rect(x+i,y+h,2,3,'#eadfc0b0'); }
}

function shingleRoof(x,y,w,rows,roof,light,shade) {
  for(let row=0;row<rows;row++) {
    const yy=y+row*8,inset=Math.max(0,22-row*4);
    rect(x+inset-2,yy-2,w-inset*2+4,12,OUT);
  }
  for(let row=0;row<rows;row++) {
    const yy=y+row*8,inset=Math.max(0,22-row*4);
    const col=row%2?roof:light;
    rect(x+inset,yy,w-inset*2,8,col);
    rect(x+inset,yy+7,w-inset*2,1,shade);
    for(let xx=x+inset+((row%2)?6:0);xx<x+w-inset-4;xx+=12) { rect(xx+4,yy+2,1,4,shade+'55'); rect(xx+5,yy+6,3,1,shade+'44'); }
    rect(x+inset,yy,2,8,light+'66');
  }
}

function drawBuilding(h,time) {
  const x=h.x*T,y=h.y*T,w=h.w*T,bottom=(h.y+h.h)*T,cx=x+w/2;
  const wallTop=y+62,wallH=bottom-wallTop;
  const shade='#5a5343';
  rect(x+6,bottom-4,w-4,10,'#344f3938');
  // wall body with outline
  rect(x+4,wallTop,w-8,wallH,OUT);
  rect(x+6,wallTop+2,w-12,wallH-4,h.wall);
  rect(x+6,wallTop+2,w-12,4,'#ffffff30');
  rect(x+6,wallTop+2,2,wallH-4,'#ffffff22');
  rect(x+w-8,wallTop+2,2,wallH-4,'#00000018');
  for(let yy=wallTop+18;yy<bottom-10;yy+=14) { rect(x+6,yy,w-12,1,'#8d826033'); rect(x+6+((yy/14|0)%2)*20,yy-6,1,6,'#8d826022'); }
  rect(x+4,bottom-6,w-8,4,'#00000022');
  rect(x+2,bottom-2,w-4,2,'#b9aa83');

  if(h.id==='observatory') {
    ellipse(cx,y+70,w*.44,70,OUT);
    ellipse(cx,y+70,w*.43-2,66,h.roof);
    ellipse(cx-14,y+66,w*.22,50,h.light+'55');
    rect(x+4,y+66,w-8,12,h.roof);
    rect(x+4,y+76,w-8,3,'#4e6578');
    rect(cx-3,y+8,6,64,'#afbdd055');
    rect(cx-1,y+8,2,64,'#dfe6ee66');
    rect(cx+24,y+28,2,14,'#f5e4a9'); rect(cx+18,y+34,14,2,'#f5e4a9');
    rect(cx-30,y+40,1,1,'#f5e4a9'); rect(cx-22,y+22,1,1,'#fff'); rect(cx+40,y+48,1,1,'#f5e4a9');
  } else {
    shingleRoof(x,y+10,w,7,h.roof,h.light,shade);
    rect(x-4,y+64,w+8,10,OUT);
    rect(x-2,y+66,w+4,6,h.roof);
    rect(x-2,y+70,w+4,2,'#514d3e90');
    rect(x-2,y+72,w+4,4,'#00000030');
    rect(cx-8,y+6,16,4,h.light);
  }
  if(h.id==='bakery') {
    rect(x+30,y-2,22,56,OUT);
    rect(x+32,y,18,52,'#865c4d');
    rect(x+28,y-4,26,8,'#a3745b');
    rect(x+28,y-4,26,2,'#c08f72');
    for(let yy=y+10;yy<y+50;yy+=8) { rect(x+32,yy,18,1,'#6d4a3e'); rect(x+36+(yy%16?0:6),yy+4,1,4,'#6d4a3e'); }
    for(let i=0;i<3;i++) {
      const phase=(time*.35+i/3)%1;
      const px=x+40+Math.sin(phase*5+i)*6,py=y-8-phase*36,r=5+phase*7;
      ellipse(px,py,r,r*.7,'rgba(240,230,203,'+((1-phase)*.5)+')');
    }
  }
  if(h.id==='tea'||h.id==='bakery') {
    for(let i=0;i<7;i++) {
      const sx=x+12+i*20;
      rect(sx,y+76,20,12,i%2?'#f6e2b9':h.light);
      rect(sx,y+86,20,2,i%2?'#e5cfa3':h.roof);
      ellipse(sx+10,y+88,10,4,i%2?'#f6e2b9':h.light);
    }
    rect(x+10,y+74,w-20,2,OUT);
  }
  for(const wx of [x+20,x+w-48]) {
    rect(wx-3,y+100,32,30,OUT);
    rect(wx-1,y+102,28,26,'#8a785d');
    rect(wx+1,y+104,24,22,h.id==='greenhouse'?'#8fc0ac':'#93b9ba');
    rect(wx+2,y+105,10,6,'#d2e3d1');
    rect(wx+12,y+104,2,22,'#eee0b6'); rect(wx+1,y+114,24,2,'#eee0b6');
    if(h.id!=='greenhouse') { rect(wx+1,y+104,24,4,'#e8c9a8'); rect(wx+1,y+108,24,1,'#c9a37c'); }
    rect(wx-4,y+126,34,4,'#c3aa79'); rect(wx-4,y+130,34,2,'#8c7a55');
    if(h.id==='greenhouse') {
      rect(wx-1,y+122,28,6,'#63895f');
      rect(wx+5,y+116,5,8,'#7b9b5f'); rect(wx+15,y+114,5,10,'#8fb56c'); rect(wx+9,y+118,3,6,'#a7c87a');
      rect(wx+7,y+114,2,2,'#e4b9c9'); rect(wx+17,y+112,2,2,'#f1d99e');
    }
  }
  if(h.shop) drawShopFront(h,x,y,w,cx,time);
  else if(h.taxi) drawTaxiFront(h,x,y,w,cx,time);
  else {
  const signW=h.label.length*8+20;
  rect(cx-signW/2-2,y+92,signW+4,20,OUT);
  rect(cx-signW/2,y+94,signW,16,'#6c6850');
  rect(cx-signW/2+2,y+96,signW-4,12,'#f0dfb4');
  rect(cx-signW/2+2,y+96,signW-4,1,'#fff7dc');
  label(h.label,cx,y+98,'#555b45',2);
  rect(cx-signW/2+4,y+98,1,1,'#8c7e59'); rect(cx+signW/2-5,y+98,1,1,'#8c7e59');
  }

  const dy=h.door.y*T;
  rect(cx-18,dy-6,36,38,OUT);
  rect(cx-16,dy-4,32,34,'#8a775c');
  rect(cx-12,dy,24,30,'#44483b');
  rect(cx-12,dy,10,30,'#b9966d');
  rect(cx-10,dy+3,6,10,'#a5845c'); rect(cx-10,dy+16,6,10,'#a5845c');
  rect(cx-2,dy+3,10,10,'#5a5f50'); rect(cx-2,dy+16,10,10,'#5a5f50');
  rect(cx-5,dy+14,2,3,'#f5d389');
  rect(cx-16,bottom-2,32,4,'#c9bb94'); rect(cx-16,bottom+1,32,1,'#8c7a55');

  if(h.id==='post') {
    rect(x+w-18,y+94,2,32,'#786d51');
    rect(x+w-16,y+94,14,10,'#c78173'); rect(x+w-16,y+94,14,2,'#e49a8b');
  }
  if(visited.has(h.id)) {
    rect(x+w-20,y+70,2,22,'#f4e0a3');
    rect(x+w-19,y+70,14,10,OUT); rect(x+w-18,y+71,12,8,'#f2d178'); rect(x+w-16,y+73,8,4,'#fff6c8');
  }
}

function outlineBox(x,y,w,h,fill) { rect(x-1,y-1,w+2,h+2,OUT); rect(x,y,w,h,fill); }

function drawObject(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2;

  if(o.kind==='tree') {
    const tint=hash(o.x,o.y)%3;
    const c1=['#527d56','#5b875a','#608757'][tint],c2='#668e60',c3='#7ba36b',c4='#4a7049';
    ellipse(cx,b-4,16,6,'#34533b38');
    rect(cx-5,b-26,10,24,OUT); rect(cx-4,b-24,8,22,'#7d7052'); rect(cx-2,b-22,2,16,'#b39562'); rect(cx+1,b-14,1,8,'#5f5440');
    ellipse(cx,b-44,25,21,OUT);
    ellipse(cx,b-44,23,19,c1);
    ellipse(cx-8,b-50,13,11,c3);
    ellipse(cx+9,b-40,11,9,c2);
    ellipse(cx-6,b-34,12,8,c4);
    ellipse(cx+4,b-54,8,6,'#8fb57a');
    rect(cx-16,b-30,6,2,c4); rect(cx+8,b-33,6,2,c4);
    rect(cx-2,b-58,3,3,'#a7cb8c');
    return;
  }
  if(o.kind==='fence') {
    rect(x,y+10,T,6,OUT); rect(x,y+20,T,4,OUT);
    rect(x,y+11,T,4,'#b9a776'); rect(x,y+11,T,1,'#d6c48f');
    rect(x,y+21,T,2,'#b3a176');
    rect(x+2,y+3,8,27,OUT); rect(x+3,y+4,6,25,'#d2bd8e'); rect(x+3,y+4,6,2,'#ead9ab'); rect(x+7,y+6,2,22,'#9a8a63');
    rect(x+3,y+2,6,2,'#9a8a63');
    return;
  }

  if(o.kind==='taxi') { drawTaxiCab(x,y,w,time); return; }
  ellipse(cx,b-2,Math.max(10,w/2-2),5,'#344c3927');

  if(o.kind==='sign') {
    rect(x+13,y+6,6,24,OUT); rect(x+14,y+7,4,22,'#87704f'); rect(x+15,y+8,1,20,'#a68a63');
    rect(x-1,y-7,34,24,OUT); rect(x,y-6,32,22,'#75684b'); rect(x+2,y-4,28,18,'#e0c693'); rect(x+2,y-4,28,1,'#f1dbac');
    if(o.shopSign) { drawCoin(x+16,y+4,6,time,true); }
    else { rect(x+7,y,18,2,'#8c7e59'); rect(x+7,y+5,12,2,'#8c7e59'); rect(x+7,y+10,15,2,'#8c7e59'); }
    rect(x+3,y-3,1,1,'#5a4f3b'); rect(x+28,y-3,1,1,'#5a4f3b');
  } else if(o.kind==='bench') {
    rect(x+7,y+14,7,16,OUT); rect(x+w-14,y+14,7,16,OUT);
    rect(x+8,y+15,5,14,'#716248'); rect(x+w-13,y+15,5,14,'#716248');
    rect(x+1,y-1,w-2,8,OUT); rect(x+2,y,w-4,6,'#bb9a69'); rect(x+2,y,w-4,1,'#d7b885');
    rect(x+1,y+7,w-2,6,OUT); rect(x+2,y+8,w-4,4,'#c7a674');
    rect(x-1,y+13,w+2,10,OUT); rect(x,y+14,w,8,'#d5b783'); rect(x,y+14,w,2,'#e8cb98'); rect(x,y+21,w,1,'#9c8458');
    for(let i=12;i<w-8;i+=16) rect(x+i,y+16,1,4,'#b89a67');
  } else if(o.kind==='fountain') {
    ellipse(cx,y+18,19,13,OUT); ellipse(cx,y+18,18,12,'#8b9b8b'); ellipse(cx,y+16,16,10,'#b8c5aa');
    ellipse(cx,y+16,12,7,'#6fa3a0'); ellipse(cx,y+15,10,5,'#8ec2bd');
    rect(cx-3,y-2,6,20,OUT); rect(cx-2,y-1,4,18,'#d0d0b2'); rect(cx-1,y-1,1,18,'#e8e8cf');
    rect(cx-9,y-3,18,6,OUT); rect(cx-8,y-2,16,4,'#dde0c1'); rect(cx-8,y-2,16,1,'#f0f2dc');
    rect(cx-2,y-12,4,10,'#bcdcd0'); rect(cx-1,y-14,2,3,'#e7f3ee');
    const ph=Math.floor(time*5)%2;
    rect(cx-8+ph,y+6,2,6,'#d5ead6'); rect(cx+7-ph,y+8,2,4,'#d5ead6'); rect(cx-4,y+4+ph,1,3,'#fff'); rect(cx+4,y+5-ph,1,3,'#fff');
    rect(cx-6,y+14,3,1,'#dff0ea'); rect(cx+3,y+16,4,1,'#dff0ea');
  } else if(o.kind==='shelf') {
    rect(x+1,y-11,w-2,h+11,OUT); rect(x+2,y-10,w-4,h+9,'#786850'); rect(x+6,y-6,w-12,h+2,'#9e8864');
    const colors=['#9c7378','#7c9c91','#d0b477','#8e8ba9','#b88569','#6f8f6a'];
    for(let i=0;i<Math.floor((w-16)/10);i++) {
      const bh=12+(i%3)*2,bx=x+10+i*10;
      rect(bx,y+10-bh,6,bh,OUT); rect(bx+1,y+11-bh,4,bh-2,colors[(i+o.x)%colors.length]); rect(bx+1,y+11-bh,4,1,'#fff6d266'); rect(bx+2,y+14-bh,2,1,'#fff6d2aa');
    }
    rect(x+4,y+12,w-8,4,'#d0b184'); rect(x+4,y+15,w-8,1,'#8c7656');
    for(let i=0;i<Math.floor((w-16)/12);i++) { rect(x+8+i*12,y+18,8,8,OUT); rect(x+9+i*12,y+19,6,6,colors[(i+2)%colors.length]); }
    rect(x+4,b-4,w-8,4,'#c4a679');
  } else if(o.kind==='oven') {
    rect(x+1,y-9,w-2,h+9,OUT); rect(x+2,y-8,w-4,h+7,'#90765d'); rect(x+6,y-4,w-12,h,'#c5ad88');
    rect(x+8,y,w-16,6,'#ead7b0'); rect(x+8,y,w-16,1,'#fff3d6');
    rect(x+12,y+14,w-24,h-24,OUT); rect(x+13,y+15,w-26,h-26,'#655346'); rect(x+16,y+18,w-32,h-32,'#a96847');
    rect(x+20,y+28,w-40,10,'#e2a362'); rect(x+24,y+30+(Math.floor(time*4)%2),w-48,6,'#f5cf83'); rect(x+28,y+32,w-56,2,'#fff1b8');
    rect(x+14,b-8,w-28,4,'#70604e');
    rect(x+14,y+2,4,4,'#786d57'); rect(x+w-18,y+2,4,4,'#786d57'); rect(x+15,y+3,2,2,'#a89a7c');
  } else if(o.kind==='counter') {
    rect(x+1,y+5,w-2,h-4,OUT); rect(x+2,y+6,w-4,h-6,'#977c57'); rect(x+6,y+14,w-12,h-16,'#c2a177');
    for(let i=16;i<w-8;i+=24) rect(x+i,y+14,2,h-16,'#a38964');
    rect(x-1,y-1,w+2,13,OUT); rect(x,y,w,11,'#e3c795'); rect(x,y,w,2,'#f4dcac'); rect(x,y+9,w,2,'#b4966b');
    for(let i=14;i<w-10;i+=30) {
      if(o.variant==='letters') { rect(x+i,y-5,20,10,OUT); rect(x+i+1,y-4,18,8,'#f6e5bb'); rect(x+i+12,y-2,4,4,'#a98286'); rect(x+i+3,y-1,8,1,'#c9b891'); }
      else if(o.variant==='tea') { rect(x+i,y-7,12,10,OUT); rect(x+i+1,y-6,10,8,'#f1e7ce'); rect(x+i+12,y-4,4,5,'#e6d6b3'); rect(x+i+2,y-8,8,3,'#898c73'); rect(x+i+3,y-5,6,2,'#c9a06a'); }
      else { ellipse(x+i+8,y,12,6,OUT); ellipse(x+i+8,y,11,5,'#b88852'); rect(x+i,y-5,16,6,'#d6ac69'); rect(x+i+2,y-5,16,1,'#ebc68a'); rect(x+i+4,y-5,2,4,'#f1d297'); rect(x+i+10,y-5,2,4,'#f1d297'); }
    }
  } else if(o.kind==='pot') {
    rect(cx-11,b-17,22,7,OUT); rect(cx-10,b-16,20,5,'#aa785b'); rect(cx-10,b-16,20,1,'#c89270');
    rect(cx-9,b-11,18,11,OUT); rect(cx-8,b-10,16,9,'#bc8d67'); rect(cx-6,b-9,4,6,'#d3a881');
    rect(cx-2,b-38,4,22,'#577b51');
    ellipse(cx-8,b-34,7,5,'#7e9b5d'); ellipse(cx+7,b-40,7,6,'#8aa66b'); ellipse(cx-3,b-46,7,6,'#6e8d57'); ellipse(cx+6,b-26,6,4,'#a1b67d');
    rect(cx-9,b-36,2,1,'#b9d39a'); rect(cx-4,b-48,2,1,'#b9d39a');
  } else if(o.kind==='planter') {
    rect(x+1,b-21,w-2,21,OUT); rect(x+2,b-20,w-4,19,'#957951'); rect(x+6,b-16,w-12,12,'#b99a69');
    rect(x+3,b-24,w-6,10,OUT); rect(x+4,b-23,w-8,8,'#786b4d'); rect(x+4,b-23,w-8,2,'#8f816a');
    for(let i=12;i<w-8;i+=18) {
      const rise=(i%3)*6;
      rect(x+i,b-50+rise,4,30-rise,'#618653');
      ellipse(x+i-6,b-44+rise,7,5,'#7c9f5f'); ellipse(x+i+5,b-54+rise,7,6,'#99b576'); ellipse(x+i,b-58+rise,5,4,'#bed196');
      rect(x+i-8,b-45+rise,2,1,'#d3e6b6');
    }
  } else if(o.kind==='desk') {
    rect(x+5,b-13,7,14,OUT); rect(x+w-12,b-13,7,14,OUT); rect(x+6,b-12,5,12,'#816d50'); rect(x+w-11,b-12,5,12,'#816d50');
    rect(x+1,y+1,w-2,h-9,OUT); rect(x+2,y+2,w-4,h-11,'#a4865c');
    rect(x-1,y-1,w+2,h-13,OUT); rect(x,y,w,h-15,'#d1b486'); rect(x,y,w,2,'#e6cb9c');
    rect(x+9,y+3,22,13,OUT); rect(x+10,y+4,20,11,'#f5e6bd'); rect(x+13,y+6,14,1,'#ada58b'); rect(x+13,y+9,10,1,'#ada58b'); rect(x+13,y+12,12,1,'#ada58b');
    rect(x+w-19,y+1,9,11,OUT); rect(x+w-18,y+2,7,9,'#808c79'); rect(x+w-16,y-5,2,9,'#5c6c55'); rect(x+w-16,y-6,2,2,'#2b2b2b');
  } else if(o.kind==='mailboxes') {
    rect(x+1,y-7,w-2,h+7,OUT); rect(x+2,y-6,w-4,h+5,'#6c8790');
    for(let row=0;row<3;row++) for(let col=0;col<2;col++) {
      const xx=x+8+col*26,yy=y+row*18;
      rect(xx-1,yy-1,22,15,OUT); rect(xx,yy,20,13,'#a9beb8'); rect(xx,yy,20,2,'#c9dad6');
      rect(xx+4,yy+4,12,2,'#677e7c'); rect(xx+10,yy+9,6,2,'#e9ddba'); rect(xx+2,yy+10,4,1,'#8ea5a2');
    }
  } else if(o.kind==='table') {
    rect(x+13,b-25,7,24,OUT); rect(x+w-20,b-25,7,24,OUT); rect(x+14,b-24,5,22,'#947551'); rect(x+w-19,b-24,5,22,'#947551');
    ellipse(cx,y+26,w/2-1,22,OUT); ellipse(cx,y+26,w/2-2,21,'#a3825b');
    ellipse(cx,y+20,w/2-2,20,'#ddc297'); ellipse(cx,y+18,w/2-10,14,'#ece0bb');
    rect(cx-6,y+6,12,14,OUT); rect(cx-5,y+7,10,12,'#98a78c'); rect(cx-2,y+2,6,5,'#78886d'); rect(cx+5,y+10,6,4,'#98a78c'); rect(cx-3,y+9,2,2,'#c5d1bb');
    rect(x+9,y+18,9,7,OUT); rect(x+10,y+19,7,5,'#fff0d3'); rect(x+w-20,y+14,9,7,OUT); rect(x+w-19,y+15,7,5,'#fff0d3');
    rect(x+12,y+17,3,1,'#c9a06a'); rect(x+w-18,y+13,3,1,'#c9a06a');
  } else if(o.kind==='telescope') {
    polygon([[cx,y+20],[cx-24,b-2],[cx-18,b-2],[cx+2,y+26]],OUT);
    polygon([[cx,y+20],[cx+24,b-2],[cx+18,b-2],[cx-2,y+26]],OUT);
    polygon([[cx,y+22],[cx-21,b-3],[cx-18,b-3],[cx+1,y+26]],'#667184');
    polygon([[cx,y+22],[cx+21,b-3],[cx+18,b-3],[cx-1,y+26]],'#667184');
    rect(cx-3,y+24,6,h-24,OUT); rect(cx-2,y+25,4,h-26,'#94a5b4');
    polygon([[x+16,y+22],[x+w-24,y-12],[x+w-6,y+8],[x+32,y+38]],OUT);
    polygon([[x+18,y+22],[x+w-24,y-10],[x+w-8,y+8],[x+32,y+36]],'#596d88');
    polygon([[x+22,y+20],[x+w-24,y-4],[x+w-16,y+6],[x+32,y+30]],'#a1b6bf');
    polygon([[x+w-26,y-8],[x+w-20,y-12],[x+w-6,y+6],[x+w-12,y+10]],'#e1d8b0');
    rect(x+w-22,y-4,6,6,'#b9ded5'); rect(x+w-21,y-3,2,2,'#f1fbf7');
  } else if(o.kind==='couch') {
    rect(x+1,y-9,w-2,h+9,OUT); rect(x+2,y-8,w-4,h+7,'#7e6a8c');
    rect(x+4,y-6,w-8,10,'#9d88aa'); rect(x+4,y-6,w-8,1,'#b9a6c4');
    for(let i=6;i<w-6;i+=16) { rect(x+i,y+4,14,12,'#8a76a0'); rect(x+i,y+4,14,1,'#a894b4'); rect(x+i+6,y+8,2,2,'#6d5a7a'); }
    rect(x+2,y-8,4,h+7,'#6d5a7a'); rect(x+w-6,y-8,4,h+7,'#6d5a7a');
    rect(x+2,b-3,w-4,2,'#4e3f58'); rect(x+8,y-2,8,5,'#e3c6a0'); rect(x+w-16,y-2,8,5,'#c9a7c4');
  } else if(o.kind==='tv') {
    rect(x+1,y-3,w-2,h+2,OUT); rect(x+2,y-2,w-4,h,'#6b5f52'); rect(x+4,y,w-8,h-6,'#2b2f3a');
    rect(x+8,y+3,w-16,h-12,'#3f5f7a'); rect(x+10,y+5,10,3,'#f0dfb4'); rect(x+22,y+6,8,4,'#d08a6a'); rect(x+12,y+11,16,2,'#5f8d7a');
    rect(x+4,y,w-8,1,'#4a5363'); rect(x+w/2-6,b-5,12,3,'#3b3530'); rect(x+6,b-3,w-12,1,'#2a2622');
  } else if(o.kind==='console') {
    rect(x+3,y+10,26,13,OUT); rect(x+4,y+11,24,11,'#e9e9e4'); rect(x+6,y+13,20,7,'#1d1e24'); rect(x+8,y+15,3,3,'#5b8cff'); rect(x+6,y+11,20,1,'#ffffff');
    rect(x+20,y+4,9,7,OUT); rect(x+21,y+5,7,5,'#f2f2ee'); rect(x+23,y+6,1,1,'#3a3a40'); rect(x+26,y+6,1,1,'#3a3a40');
  } else if(o.kind==='bed') {
    const grace=o.name.includes('Grace');
    rect(x+1,y-5,w-2,h+5,OUT); rect(x+2,y-4,w-4,h+3,'#8a6f55'); rect(x+4,y-2,w-8,h-1,'#f1e6d0');
    rect(x+4,y+12,w-8,h-14,grace?'#b9a6d8':'#f3d872'); rect(x+4,y+12,w-8,2,'#ffffff80');
    for(let i=0;i<3;i++) rect(x+6+i*10,y+20,6,6,grace?'#8a76a8':'#e9b84d');
    rect(x+8,y,w-16,8,'#ffffff'); rect(x+8,y+7,w-16,1,'#d9d2c2'); rect(x+10,y+2,4,2,'#f0e6d6');
    if(!grace) { rect(x+w-14,y+13,6,6,'#d08a6a'); rect(x+w-13,y+12,4,2,'#e8a77f'); rect(x+w-12,y+15,1,1,'#2b2420'); rect(x+w-10,y+15,1,1,'#2b2420'); }
    rect(x+2,b-3,w-4,2,'#5f4a38');
  } else if(o.kind==='photo') {
    rect(x+5,y+2,22,26,OUT); rect(x+6,y+3,20,24,'#c9a66a'); rect(x+8,y+5,16,20,'#8ec2d6');
    rect(x+8,y+17,16,8,'#dcc38a'); rect(x+8,y+5,16,5,'#bfe0ec');
    for(const [px,col,hh] of [[10,'#c97f8d',9],[14,'#5f6a85',11],[18,'#c9b3e6',7],[21,'#f3d872',6]]) { rect(x+px,y+21-hh,3,hh,col); rect(x+px,y+19-hh,3,3,'#e9b48c'); }
    rect(x+6,y+3,20,1,'#e4c58f');
  } else if(o.kind==='toybox') {
    rect(x+1,y+3,w-2,h-2,OUT); rect(x+2,y+4,w-4,h-4,'#c0695e'); rect(x+2,y+4,w-4,3,'#d98477'); rect(x+2,y+14,w-4,2,'#8f4a42');
    rect(x+6,y-3,10,8,'#8fb5c7'); rect(x+18,y-5,8,10,'#e9c25a'); rect(x+30,y-2,12,7,'#9fa6a8'); rect(x+32,y-4,4,3,'#9fa6a8'); rect(x+8,y-1,2,2,'#2b2420'); rect(x+44,y,8,5,'#b88a5a');
    rect(x+w/2-6,y+9,12,4,'#f0dfb4'); rect(x+w/2-4,y+10,8,1,'#8f4a42');
  } else if(o.kind==='recliner') {
    rect(x+1,y-7,w-2,h+7,OUT); rect(x+2,y-6,w-4,h+5,'#6e4b3c');
    rect(x+4,y-4,w-8,16,'#8e6350'); rect(x+6,y-2,w-12,10,'#a67a63'); rect(x+6,y-2,w-12,1,'#c29a82');
    rect(x+4,y+12,w-8,14,'#7c5544'); rect(x+6,y+14,w-12,8,'#9a6e58');
    rect(x+2,y+8,6,h-6,'#5e3f32'); rect(x+w-8,y+8,6,h-6,'#5e3f32');
    rect(x+8,b-8,w-16,5,'#8e6350'); rect(x+10,y+16,w-20,2,'#4e3328');
    rect(x+w-12,y-1,4,6,'#f0dfb4'); rect(x+w-11,y,2,1,'#c9a06a');
  } else if(o.kind==='chart') {
    rect(x+5,y+16,5,16,OUT); rect(x+w-10,y+16,5,16,OUT); rect(x+6,y+17,3,14,'#716c62'); rect(x+w-9,y+17,3,14,'#716c62');
    rect(x-1,y-7,w+2,34,OUT); rect(x,y-6,w,32,'#9e8d71'); rect(x+4,y-2,w-8,24,'#616f8c'); rect(x+4,y-2,w-8,1,'#8794ad');
    for(const [sx,sy] of [[10,6],[22,12],[34,4],[46,14],[16,16],[40,10]]) { rect(x+sx,y+sy,3,3,'#ece0ac'); rect(x+sx+1,y+sy+1,1,1,'#fff'); if(sx<40) rect(x+sx+4,y+sy+1,8,1,'#aab4b3'); }
  }
}

// Town NPCs: procedural 16x30 figures with outlines and shading.
function drawNpc(a) {
  const p=position(a),c=a.palette;
  const cx=Math.round((p.x+.5)*T),base=Math.round((p.y+1)*T-2);
  const ph=walkPhase(a),frame=ph>=0&&ph<.55?(a.stepN%2?1:3):0;
  const bob=a.move&&(frame===1||frame===3)?1:0;
  const head=base-30-bob;
  const skinS=shadeHex(c.skin,-18),shirtS=shadeHex(c.shirt,-24),pantsS=shadeHex(c.pants,-22),hairH=shadeHex(c.hair,22);
  ellipse(cx,base+1,9,4,'#2f493640');
  const ll=a.move&&frame===1?-2:0,rl=a.move&&frame===3?-2:0;
  rect(cx-8,base-9+ll,7,10,OUT); rect(cx+1,base-9+rl,7,10,OUT);
  rect(cx-7,base-8+ll,5,7,c.pants); rect(cx+2,base-8+rl,5,7,c.pants);
  rect(cx-3,base-8+ll,1,7,pantsS); rect(cx+6,base-8+rl,1,7,pantsS);
  rect(cx-7,base-2+ll,5,2,'#3b3f36'); rect(cx+2,base-2+rl,5,2,'#3b3f36');
  rect(cx-9,head+17,18,14,OUT); rect(cx-8,head+18,16,12,c.shirt); rect(cx+5,head+18,3,12,shirtS); rect(cx-8,head+18,16,1,shadeHex(c.shirt,18));
  rect(cx-11,head+19+(frame===1?2:0),4,9,OUT); rect(cx+7,head+19+(frame===3?2:0),4,9,OUT);
  rect(cx-10,head+20+(frame===1?2:0),2,7,c.skin); rect(cx+8,head+20+(frame===3?2:0),2,7,c.skin);
  rect(cx-10,head+25+(frame===1?2:0),2,2,skinS); rect(cx+8,head+25+(frame===3?2:0),2,2,skinS);
  rect(cx-3,head+15,6,3,skinS);
  rect(cx-9,head+1,18,16,OUT); rect(cx-8,head+2,16,14,c.skin); rect(cx+5,head+3,2,12,skinS);
  rect(cx-10,head-1,20,9,OUT); rect(cx-9,head,18,7,c.hair); rect(cx-6,head-2,12,3,c.hair); rect(cx-6,head-1,8,1,hairH); rect(cx-5,head-2,4,1,OUT);
  if(a.facing==='up') {
    rect(cx-8,head+2,16,12,c.hair); rect(cx-5,head+3,2,9,hairH);
    rect(cx-4,head+17,8,8,shirtS);
  } else if(a.facing==='down') {
    rect(cx-8,head+5,4,4,c.hair); rect(cx+4,head+5,4,4,c.hair);
    rect(cx-5,head+8,3,3,'#fff8ee'); rect(cx+2,head+8,3,3,'#fff8ee'); rect(cx-4,head+9,2,2,'#41433c'); rect(cx+3,head+9,2,2,'#41433c');
    rect(cx-1,head+12,2,2,skinS); rect(cx-2,head+14,4,1,'#b56f5a'); rect(cx-6,head+11,2,1,'#e49a8b'); rect(cx+4,head+11,2,1,'#e49a8b');
  } else {
    const sg=a.facing==='left'?-1:1;
    rect(cx+sg*7-(sg<0?3:0),head+10,3,4,c.skin); rect(cx+sg*7-(sg<0?3:0),head+13,3,1,skinS);
    rect(cx+sg*3-(sg<0?2:0),head+8,3,3,'#fff8ee'); rect(cx+sg*4-(sg<0?1:0),head+9,2,2,'#41433c');
    rect(cx-sg*7-(sg>0?2:0),head+5,6,11,c.hair); rect(cx-sg*5-(sg>0?1:0),head+6,2,8,hairH);
    rect(cx+sg*2-(sg<0?3:0),head+14,3,1,'#b56f5a');
  }
  if(c.hat) {
    rect(cx-11,head-5,22,8,OUT); rect(cx-10,head-4,20,6,c.hat); rect(cx-7,head-8,14,5,c.hat); rect(cx-7,head-9,14,1,OUT); rect(cx-10,head-4,20,1,shadeHex(c.hat,20)); rect(cx-7,head-6,14,1,shadeHex(c.hat,-20));
  }
}
function shadeHex(hex,d) {
  const n=parseInt(hex.slice(1),16);
  const r=clamp(((n>>16)&255)+d,0,255),g=clamp(((n>>8)&255)+d,0,255),b=clamp((n&255)+d,0,255);
  return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);
}

function drawActor(a) {
  if(a.hidden) return;
  if(a.monster) {
    const p=position(a);
    const cx=Math.round((p.x+.5)*T),base=Math.round((p.y+1)*T-2);
    const bob=Math.round(Math.sin(elapsedTime*3))*1;
    const d=monsterDef(a),w=d.sprite[0].length,h=d.sprite.length;
    ellipse(cx,base+1,Math.round(w*.47),5,'#2f493640');
    drawSprite(d.sprite,d.pal,cx-Math.round(w/2),base-h+bob,1);
    return;
  }
  if(a.isPlayer) { drawSheetActor(a,OW.tom); return; }
  if(a.kid) { drawSheetActor(a,OW[a.member.id]); return; }
  if(a.sheet) { drawSheetActor(a,OW[a.sheet]); return; }
  const v=VILLAGERS[a.paletteName];
  if(v) { drawSheetActor(a,villagerSet(v)); return; }
  drawNpc(a);
}

const HEART=['.OO.OO.','OHhHOHO','OHHHHHO','.OHHHO.','..OHO..','...O...'];
function drawHeart(x,y,sc) {
  const pal={O:'#5a1f2e',H:'#e8536a',h:'#ffb3bf'};
  drawSprite(HEART,pal,x-Math.round(3.5*sc),y,sc);
}
function drawTarget(target) {
  if(!target||dialog.active||player.move||transition) return;
  let x,y;
  if(target.kind==='npc') {
    const p=position(target.value);
    x=(p.x+.5)*T;
    y=(p.y+1)*T-(target.value.monster?monsterDef(target.value).sprite.length+20:(target.value.isPlayer||target.value.kid||target.value.sheet?70:52));
  } else if(target.kind==='object') {
    x=(target.value.x+target.value.w/2)*T;
    y=target.value.y*T-(target.value.kind==='tree'?70:28);
  } else return;
  x=Math.round(x); y=Math.round(y+Math.sin(elapsedTime*3)*1.2);
  rect(x-15,y-1,30,20,OUT); rect(x-14,y,28,18,'#fff1cb'); rect(x-14,y,28,1,'#fffaea');
  rect(x-3,y+18,6,3,OUT); rect(x-2,y+18,4,2,'#fff1cb');
  if(target.kind==='npc'&&target.value.monster) label('!',x,y+4,'#b4553f',2);
  else if(target.kind==='npc') { for(let i=-7;i<=7;i+=7) rect(x+i-1,y+8,2,2,'#59724f'); }
  else label('A',x,y+4,'#59724f',2);
}

// A pixel gold coin with a $ stamped in it. sc is the glyph scale.
function drawCoin(cx,cy,r,time,glint=true) {
  ellipse(cx,cy,r+2,r+2,OUT);
  ellipse(cx,cy,r,r,'#c98a1e');
  ellipse(cx-1,cy-1,r-2,r-2,'#f2c44a');
  ellipse(cx-1,cy-1,r-5,r-5,'#ffd968');
  label('$',cx,cy-Math.round(r*.45)-1,'#a8651a',Math.max(1,Math.round(r/6)));
  if(glint) { const g=(time*1.3)%1; if(g<.25) { const a=1-g*4; gfx.globalAlpha=a; rect(cx-r+4+g*r*4,cy-r+3,2,6,'#fffbe6'); gfx.globalAlpha=1; } }
}
// Penny's Pockets: striped awning, gold coin sign, and a coin that floats over the roof so you can spot the shop.
function drawShopFront(h,x,y,w,cx,time) {
  for(let i=0;i<7;i++) {
    const sx=x+12+i*20,red=i%2===0;
    rect(sx,y+76,20,12,red?'#c9463d':'#fbefd2');
    rect(sx,y+86,20,2,red?'#9e3029':'#e8d6ad');
    ellipse(sx+10,y+88,10,4,red?'#c9463d':'#fbefd2');
  }
  rect(x+10,y+74,w-20,2,OUT);
  // Gold-trimmed sign with a coin and SHOP.
  const signW=h.label.length*8+44,sx=cx-signW/2;
  rect(sx-3,y+90,signW+6,24,OUT);
  rect(sx-1,y+92,signW+2,20,'#c98a1e');
  rect(sx+1,y+94,signW-2,16,'#3d2b26');
  rect(sx+1,y+94,signW-2,1,'#5a433b');
  drawCoin(sx+12,y+102,7,time,false);
  label(h.label,cx+10,y+98,'#ffd968',2);
  // Floating coin badge over the roof: bobs and glints.
  const bob=Math.round(Math.sin(time*3)*3);
  const by=y-12+bob;
  ellipse(cx,y+4,9,3,'#2f493640');
  drawCoin(cx,by,13,time,true);
  const tw=Math.floor(time*4)%4;
  rect(cx+16,by-12+tw,2,2,'#fff6c8'); rect(cx-19,by-4-tw,2,2,'#fff6c8');
}

// Elsewhere Taxi Co.: checkered band, a black sign with yellow TAXI, and a cab lamp on the roof.
function drawTaxiFront(h,x,y,w,cx,time) {
  rect(x+8,y+74,w-16,14,OUT);
  for(let i=0;i<(w-20)/6;i++) for(let r=0;r<2;r++) rect(x+10+i*6,y+76+r*5,6,5,(i+r)%2?'#2c2c33':'#f2c75a');
  const signW=h.label.length*8+24,sx=cx-signW/2;
  rect(sx-3,y+92,signW+6,22,OUT);
  rect(sx-1,y+94,signW+2,18,'#2c2c33');
  rect(sx+1,y+96,signW-2,1,'#4a4a52');
  label(h.label,cx,y+99,'#ffd24a',2);
  // Roof lamp, like the one on the cab.
  rect(cx-17,y-1,34,13,OUT); rect(cx-15,y+1,30,9,'#f2c75a'); rect(cx-15,y+1,30,2,'#fff1b0');
  label('TAXI',cx,y+3,'#2c2c33',1);
  if(Math.floor(time*1.5)%2) { rect(cx-21,y+2,3,3,'#fff6c8'); rect(cx+18,y+2,3,3,'#fff6c8'); }
}
// Cab 7, parked by the depot.
function drawTaxiCab(x,y,w,time) {
  const b=y+T,cx=x+w/2;
  ellipse(cx,b-2,w/2,5,'#344c3940');
  rect(x+4,b-24,w-8,18,OUT);
  rect(x+5,b-23,w-10,16,'#f2c044');
  rect(x+5,b-23,w-10,2,'#ffe08a');
  rect(x+16,b-36,w-32,14,OUT);
  rect(x+17,b-35,w-34,12,'#f2c044');
  rect(x+19,b-33,w/2-21,8,'#9cc3c9'); rect(cx+2,b-33,w/2-21,8,'#9cc3c9');
  rect(x+20,b-32,4,2,'#e4f2f2'); rect(cx+3,b-32,4,2,'#e4f2f2');
  rect(cx-9,b-42,18,7,OUT); rect(cx-8,b-41,16,5,'#fff1b0'); label('TAXI',cx,b-41,'#2c2c33',1);
  for(let i=0;i<(w-12)/4;i++) rect(x+6+i*4,b-16,4,3,i%2?'#2c2c33':'#fff6dc');
  rect(x+5,b-20,4,3,'#fff6c8'); rect(x+w-9,b-20,4,3,'#e8536a');
  for(const wx of [x+14,x+w-14]) { ellipse(wx,b-6,7,7,OUT); ellipse(wx,b-6,5,5,'#3a3a40'); ellipse(wx,b-6,2,2,'#a9a9b0'); }
  label('7',cx,b-13,'#2c2c33',1);
}

// One minimap base per outdoor area, built on first use.
let miniMap=null,miniBase=null;
function buildMiniBase(map) {
  const c=document.createElement('canvas');
  c.width=map.w*2; c.height=map.h*2;
  const bctx=c.getContext('2d');
  for(let y=0;y<map.h;y++) {
    for(let x=0;x<map.w;x++) {
      const type=map.tiles[y][x];
      bctx.fillStyle=type==='water'?'#91c5bd'
        : type==='path'?'#dbcca2'
        : type==='mud'?'#7f8a5a'
        : map.solid[y*map.w+x]?'#527657'
        : '#8ca974';
      bctx.fillRect(x*2,y*2,2,2);
    }
  }
  for(const h of map.houses) {
    bctx.fillStyle=h.roof;
    bctx.fillRect(h.x*2,h.y*2,h.w*2,h.h*2);
  }
  return c;
}
function setMinimapMap(map) {
  if(map===miniMap) return;
  miniMap=map;
  if(!map.mini) map.mini=buildMiniBase(map);
  miniBase=map.mini;
  mini.width=map.w*2; mini.height=map.h*2;
  mini.style.aspectRatio=map.w+' / '+map.h;
}

function drawMinimap(time) {
  if(!miniMap) setMinimapMap(outdoorMapFor(currentMap));
  mctx.drawImage(miniBase,0,0);

  for(const h of miniMap.houses) {
    mctx.fillStyle=h.shop?(Math.floor(time*2)%2?'#ffd24a':'#c98a1e'):(visited.has(h.id)?'#ffefb8':'#bfb79b');
    mctx.fillRect(h.door.x*2,h.door.y*2,2,2);
  }
  // Openings to the other areas blink softly.
  mctx.fillStyle=Math.floor(time*2)%2?'#f4e0a3':'#dbcca2';
  for(const [k,pt] of miniMap.portals) if(pt.kind==='edge') { const [x,y]=k.split(',').map(Number); mctx.fillRect(x*2,y*2,2,2); }

  const p=currentMap.outside
    ? position(player)
    : houseById[currentMap.id].door;

  const x=Math.round(p.x*2),y=Math.round(p.y*2);
  mctx.fillStyle='#344e43';
  mctx.fillRect(x-1,y-1,4,4);
  mctx.fillStyle=Math.floor(time*3)%2?'#fffce6':'#f9d783';
  mctx.fillRect(x,y,2,2);
}
