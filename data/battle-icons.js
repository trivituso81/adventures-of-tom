'use strict';
// data/battle-icons.js: pixel pictures for Rose Mode's battle menus (engine/battle-pictures.js uses them).
// Every picture is a 16x16 grid written as a short list of drawing ops, so a new move only needs one line.
// Ops, separated by ';' (x,y are pixel coordinates, the last item is a color letter from BI_PAL):
//   r x,y,w,h,C      rectangle            c cx,cy,rx,ry,C   ellipse (ry optional)      p x,y,x,y,...,C  polygon
//   l x1,y1,x2,y2,C  one-pixel line       L ...             two-pixel line              d x,y,x,y,...,C  single pixels
//   H cx,cy,s,C      heart (s=5 is 12 wide)   S cx,cy,R,r,C  five-point star           X cx,cy,R,C      four-point sparkle
//   D cx,cy,s,C      water drop           M                 mirror the left half onto the right
//   x cx,cy,rx,ry    erase an ellipse     z x,y,w,h         erase a rectangle (cut-outs, crescents)
// A dark outline is added around everything automatically.
const BI_PAL={k:'#1b1420',w:'#ffffff',g:'#dfe3ec',G:'#8f98ae',d:'#4a5266',r:'#ee4a40',R:'#a82a3a',o:'#ff9a3c',O:'#c25a1a',y:'#ffe27a',Y:'#e8b02e',
  n:'#f5d2a8',N:'#92603c',m:'#5c3a26',l:'#a4e8a0',L:'#4fb35c',F:'#2f7d3e',b:'#7cd0f4',B:'#2f7ed0',p:'#ffa6c8',P:'#e2508c',u:'#cdb0f4',U:'#8a5cd0',c:'#fff3d4',t:'#4fd0be',s:'#f3c9a0',S:'#c98f68',e:'#b8845a',h:'#6a4a3a',a:'#ffd0a0',i:'#2a2038'};
const BI_ART={};
const BI_CACHE={};
function biRaw(spec) {
  const W=16,px=new Array(W*W).fill(''),put=(x,y,c)=>{ x=Math.round(x); y=Math.round(y); if(x>=0&&y>=0&&x<W&&y<W) px[y*W+x]=c; };
  const inPoly=(pts,x,y)=>{ let ins=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++) { const [xi,yi]=pts[i],[xj,yj]=pts[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) ins=!ins; } return ins; };
  const fillPoly=(pts,c)=>{ for(let y=0;y<W;y++) for(let x=0;x<W;x++) { if(inPoly(pts,x,y)||inPoly(pts,x+.25,y+.25)&&inPoly(pts,x-.25,y-.25)) put(x,y,c); } };
  for(const raw of String(spec).split(';')) {
    const s=raw.trim(); if(!s) continue;
    const op=s[0],t=s.slice(1).split(',').map(v=>v.trim()).filter(v=>v!==''),col=t.length&&isNaN(+t[t.length-1])?t.pop():'k',n=t.map(Number);
    if(op==='r') { for(let y=n[1];y<n[1]+n[3];y++) for(let x=n[0];x<n[0]+n[2];x++) put(x,y,col); }
    else if(op==='c') { const rx=n[2],ry=n.length>3?n[3]:n[2]; for(let y=0;y<W;y++) for(let x=0;x<W;x++) if(((x-n[0])/rx)**2+((y-n[1])/ry)**2<=1.0001) put(x,y,col); }
    else if(op==='p') { const pts=[]; for(let i=0;i+1<n.length;i+=2) pts.push([n[i],n[i+1]]); fillPoly(pts,col); }
    else if(op==='l'||op==='L') { let [x0,y0,x1,y1]=n; const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1; let e=dx-dy; for(;;) { put(x0,y0,col); if(op==='L') { put(x0+1,y0,col); put(x0,y0+1,col); } if(x0===x1&&y0===y1) break; const e2=2*e; if(e2>-dy) { e-=dy; x0+=sx; } if(e2<dx) { e+=dx; y0+=sy; } } }
    else if(op==='d') { for(let i=0;i+1<n.length;i+=2) put(n[i],n[i+1],col); }
    else if(op==='H') { const [cx,cy,sc]=n; for(let y=0;y<W;y++) for(let x=0;x<W;x++) { const u=(x-cx)/sc,v=-(y-cy)/sc+.15; if((u*u+v*v-1)**3-u*u*v**3<=0) put(x,y,col); } }
    else if(op==='S') { const [cx,cy,R,r]=n,pts=[]; for(let i=0;i<10;i++) { const a=-Math.PI/2+i*Math.PI/5,q=i%2?r:R; pts.push([cx+Math.cos(a)*q,cy+Math.sin(a)*q]); } fillPoly(pts,col); }
    else if(op==='X') { const [cx,cy,R]=n,q=R*.3,pts=[[cx,cy-R],[cx+q,cy-q],[cx+R,cy],[cx+q,cy+q],[cx,cy+R],[cx-q,cy+q],[cx-R,cy],[cx-q,cy-q]]; fillPoly(pts,col); }
    else if(op==='D') { const [cx,cy,sc]=n; for(let y=0;y<W;y++) for(let x=0;x<W;x++) { const dx=x-cx,dy=y-(cy+sc*.35); if(dx*dx+dy*dy<=(sc*.72)**2||(y<=cy+sc*.35&&y>=cy-sc*1.1&&Math.abs(dx)<=(y-(cy-sc*1.1))*.52)) put(x,y,col); } }
    else if(op==='x') { const rx=n[2],ry=n.length>3?n[3]:n[2]; for(let y=0;y<W;y++) for(let x=0;x<W;x++) if(((x-n[0])/rx)**2+((y-n[1])/ry)**2<=1.0001) px[y*W+x]=''; }
    else if(op==='z') { for(let y=n[1];y<n[1]+n[3];y++) for(let x=n[0];x<n[0]+n[2];x++) if(x>=0&&y>=0&&x<W&&y<W) px[y*W+x]=''; }
    else if(op==='M') { for(let y=0;y<W;y++) for(let x=0;x<8;x++) if(px[y*W+x]&&!px[y*W+15-x]) px[y*W+15-x]=px[y*W+x]; }
  }
  // Outline: every empty pixel that touches a drawn pixel (up, down, left, right) turns dark.
  const out=px.slice();
  for(let y=0;y<W;y++) for(let x=0;x<W;x++) if(!px[y*W+x]) { if((x>0&&px[y*W+x-1])||(x<W-1&&px[y*W+x+1])||(y>0&&px[(y-1)*W+x])||(y<W-1&&px[(y+1)*W+x])) out[y*W+x]='k'; }
  return out;
}
// A picture as a data URL (cached). Unknown ids give null.
function biIcon(id,tint) {
  const key=id+(tint||''); if(key in BI_CACHE) return BI_CACHE[key];
  const spec=BI_ART[id]; if(!spec) return BI_CACHE[key]=null;
  const px=biRaw(spec),c=document.createElement('canvas'); c.width=c.height=16; const g=c.getContext('2d');
  for(let i=0;i<256;i++) { const k=px[i]; if(!k) continue; g.fillStyle=BI_PAL[k]||'#ff00ff'; g.fillRect(i%16,Math.floor(i/16),1,1); }
  if(tint==='grey') { const d=g.getImageData(0,0,16,16),a=d.data; for(let i=0;i<a.length;i+=4) { const v=(a[i]*.3+a[i+1]*.55+a[i+2]*.15)*.8; a[i]=a[i+1]=a[i+2]=v; } g.putImageData(d,0,0); }
  return BI_CACHE[key]=c.toDataURL();
}
const biImg=(id,px,cls,title)=>{ const u=biIcon(id); return u?'<img class="bi '+(cls||'')+'" alt="" src="'+u+'" width="'+(px||32)+'" height="'+(px||32)+'"'+(title?' title="'+title+'"':'')+'>':''; };

// ---- Markers and buttons ----
Object.assign(BI_ART,{
  m_fist:'c8,8.5,5.5,4.5,s;r4,5,8,6,s;l6,4,6,8,S;l9,4,9,8,S;l12,5,12,8,S;r3,9,6,3,S;r4,9,4,2,s;r4,12,8,1,S',
  m_drop:'D7.5,8,5,B;d6,8,6,9,w',
  m_dropg:'D7.5,8,5,L;r7,6,2,5,w;r5,8,6,2,w',
  m_hand:'r4,3,2,6,s;r6,2,2,7,s;r8,2,2,7,s;r10,3,2,6,s;l6,3,6,8,S;l8,3,8,8,S;l10,3,10,8,S;r4,8,8,5,s;r2,8,3,2,s;r1,7,2,2,s',
  m_plusheart:'H7.5,7.5,5.3,L;r7,4,2,7,w;r5,6,6,2,w',
  m_heartp:'H7.5,7.5,5.3,p;d4,4,5,4,w',
  m_shoulder:'c6,4,2.5,s;r2,8,9,6,B;r3,7,7,2,B;c11,9,1.5,s;r11,8,3,3,s;r12,7,2,2,s;r11,11,2,1,S',
  m_duo:'c4,4,2.2,s;r2,7,5,7,P;c11,4,2.2,s;r9,7,5,7,P',
  m_trio:'c3,6,1.8,s;r1,8,4,6,P;c8,4,2,s;r5,7,6,7,r;c13,6,1.8,s;r11,8,4,6,P',
  m_trio_g:'c3,6,1.8,s;r1,8,4,6,L;c8,4,2,s;r5,7,6,7,l;c13,6,1.8,s;r11,8,4,6,L',
  m_lock:'r5,2,6,2,G;r5,2,2,6,G;r9,2,2,6,G;r3,7,10,7,d;r7,9,2,3,Y',
  m_swirl:'c7.5,7.5,5.5,u;c7.5,7.5,3.5,U;c7.5,7.5,1.5,u;r8,2,4,3,u',
  m_magnify:'c6.5,6.5,4.5,b;c6.5,6.5,2.5,w;L9,9,13,13,N',
  m_up:'p7.5,1,13,8,9.5,8,9.5,14,5.5,14,5.5,8,2,8,L',
  e_kinetic:'c8,8.5,5.5,4.5,c;r4,5,8,6,c;l6,4,6,8,e;l9,4,9,8,e;l12,5,12,8,e;r3,9,6,3,e',
  e_cozy:'p8,1,11,5,13,9,12,13,8,15,4,13,3,9,5,5,6,8,8,1,O;p8,6,10,9,10,12,8,14,6,12,6,9,y',
  e_splash:'D7.5,8,5.5,b;d5,8,5,9,w',
  e_sparkle:'S7.5,8,7,3,y',
  e_chatter:'r2,3,12,8,u;p4,11,4,14,8,11,u;d5,6,6,6,7,6,i',
  e_amber:'p3,1,12,1,12,3,9,7,9,8,12,12,12,14,3,14,3,12,6,8,6,7,3,3,Y;r5,11,6,2,o',
  x_moves:'c8,9.5,5.5,4.5,s;r4,6,8,6,s;l6,5,6,9,S;l9,5,9,9,S;l12,6,12,9,S;r3,10,6,3,S;X12,3,3.5,y;X3,3,2,y',
  x_tombo:'H5.5,7,4.4,p;H10.5,8,4.4,P;d3,4,4,4,w',
  x_bag:'r4,3,2,5,N;r10,3,2,5,N;r3,5,10,2,N;p3,7,13,7,14,14,2,14,e;H8,10.5,2.8,p;l3,7,13,7,N',
  x_back:'p1,8,8,2,8,6,14,6,14,10,8,10,8,14,L',
  x_run:'p3,12,3,5,7,3,10,5,13,8,13,12,F;r3,12,11,2,w;l1,6,0,6,w;l1,9,0,9,w',
  x_crust:'c6,9,5,4,e;c10,8,4,3.5,e;d4,8,5,7,c;d9,7,11,8,c',
  x_praise:'r2,2,12,9,u;p4,11,4,14,8,11,u;H8,6.5,2.8,P',
  x_bench:'r1,11,14,2,u;r2,13,2,2,u;r12,13,2,2,u;r3,3,3,6,P;r10,3,3,6,P;p6,5,10,5,10,3,13,6,10,9,10,7,6,7,N'
});

// ---- Amy ----
Object.assign(BI_ART,{
  'amy.kettlebell_swing':'r5,1,6,2,d;r4,2,2,5,d;r10,2,2,5,d;c8,10,5.5,4.5,d;c8,10,3.5,2.5,G;d6,8,7,8,w',
  'amy.pep_talk':'p2,2,14,2,14,10,7,10,4,14,4,10,2,10,y;r4,4,8,1,O;r4,6,6,1,O;X12,12,2.5,y;X3,13,2,y',
  'amy.red_pen':'p2,13,3,10,12,1,15,4,6,14,L;p12,1,15,4,13,5,10,2,l;d2,14,3,14,2,15,d',
  'amy.hot_lunch_tray':'r1,6,14,3,G;r2,9,12,2,g;r3,3,4,3,o;r8,3,5,3,L;r3,4,4,1,y;r4,1,1,1,w;r6,0,1,2,w',
  'amy.goldstar_recess':'S8,8,7.5,3.5,y;d6,6,7,6,w;X1,14,2,y;X14,14,2,y',
  'amy.inside_voices':'c8,8,6,B;r3,4,10,2,w;r3,4,3,1,w;L11,9,5,9,r;r4,6,8,5,n;r7,9,2,2,R;L7,6,9,6,r',
  'amy.pop_quiz':'r2,2,12,12,w;r3,3,10,1,G;r3,6,10,1,G;r3,9,10,1,G;r3,12,4,1,G;L11,10,13,13,r;r2,2,12,1,B',
  'amy.burpee_blitz':'c8,3,2,s;r7,5,2,6,B;L6,10,3,14,s;L10,10,13,14,s;l8,11,8,14,B;X13,4,2.5,y;X3,5,2,y',
  'amy.hill_repeats':'p0,14,0,10,6,6,12,2,16,2,16,14,L;l0,10,12,2,F;c11,3,1.5,s;r10,5,2,4,B;l12,13,15,13,w',
  'amy.oat_milk_please':'p4,5,12,5,11,14,5,14,c;p5,1,11,1,12,5,4,5,w;r5,7,6,3,l;d7,8,w;d9,9,w',
  'amy.false_start':'r2,10,12,3,d;r3,9,2,1,w;r7,1,2,6,i;p7,1,12,1,12,4,7,4,r;l4,12,12,12,w;L12,6,14,9,y',
  'amy.negative_split':'c8,8,6,t;c8,8,5,w;l8,8,8,4,d;l8,8,11,8,d;r7,0,2,2,d;c8,8,.7,r;l12,2,14,0,r',
  'amy.detention_ult':'r5,1,6,3,G;r3,4,10,10,m;r6,7,4,5,i;d9,10,y;p3,4,13,4,12,2,4,2,e',
  'amy.marathon_ult':'p3,3,3,14,5,14,5,3,w;r3,2,10,4,y;L7,2,13,5,y;d5,9,9,10,11,9,P;S8,10,4,2,Y;d1,4,2,5,y'
});
// ---- Deedee ----
Object.assign(BI_ART,{
  'deedee.dish_towel_flick':'p2,3,10,3,13,12,5,12,B;l4,5,10,5,w;l5,8,11,8,w;l5,11,11,11,w;L12,2,15,0,w;L13,5,15,5,w',
  'deedee.moon_back':'c8,8,6,y;x11,6,5;H8,8,2.2,P;X3,2,2,y;X13,13,2,y',
  'deedee.registered_nut':'c8,9,5,5,e;c8,9,3,3,N;r6,3,4,2,m;p8,3,10,1,10,3,Y;H8,9,2,N;d8,3,y',
  'deedee.corner_piece':'p2,14,2,3,14,14,Y;p3,13,3,6,11,13,e;l4,11,6,10,N;d5,12,y;d6,13,y;d4,13,w',
  'deedee.wet_floor':'p8,1,14,14,2,14,Y;r7,5,2,5,i;r7,12,2,2,i;L12,10,15,14,b',
  'deedee.wine':'p4,2,12,2,11,8,8,10,5,8,r;r5,3,6,2,R;r8,10,1,4,g;r5,14,6,1,g',
  'deedee.oven_mitt_ultimatum':'c8,6,5,4.5,r;r3,6,10,8,r;r3,11,10,3,R;r11,3,3,5,r;r4,9,8,1,w;d6,5,w;d9,5,w',
  'deedee.brisk_means_brisk':'c7,3,2,s;r5,5,4,6,L;L6,10,3,14,s;L8,10,12,14,s;L4,6,1,9,s;L10,6,13,4,s;l0,12,3,12,w;l0,14,2,14,w',
  'deedee.garden_shower':'p3,3,13,3,11,7,5,7,L;r3,3,4,1,F;D5,10,2,B;D8,12,2,B;D11,10,2,B;r13,1,2,3,L',
  'deedee.rise_and_shine':'c8,11,6,y;r0,11,16,5,k;c8,11,4,o;l8,3,8,0,y;l2,5,0,3,y;l14,5,16,3,y;l3,10,0,10,y;l13,10,16,10,y',
  'deedee.beanie_master':'c8,8,5,4.5,B;r3,10,10,3,u;l4,10,4,12,w;l8,10,8,12,w;l12,10,12,12,w;c8,3,2,w;X13,3,2,y',
  'deedee.grandma_squeeze':'H8,8,6,P;H8,8,3.5,p;L2,3,5,6,s;L14,3,11,6,s;d5,6,w',
  'deedee.sunday_ult':'c8,9,7,3.5,w;c8,8.5,6,2.5,e;c5,8,2,1.5,Y;c10,8,2,1.5,L;c8,6,1.2,r;L3,2,5,4,w;L10,1,12,3,w',
  'deedee.moon_ult':'c7,8,6,y;x11,5,5.5,5;H8,10,3,P;X13,12,2.5,w;X3,2,2,y;X13,2,2,y'
});
// ---- Boppy ----
Object.assign(BI_ART,{
  'boppy.cap_swat':'p2,8,3,5,10,3,14,6,15,8,8,9,B;r2,8,13,2,b;L10,2,13,0,y;L12,5,15,3,y',
  'boppy.grumble':'p2,3,14,3,14,10,7,10,4,14,4,10,2,10,g;L5,5,10,5,d;L5,7,8,7,d;r10,5,2,1,r',
  'boppy.patient_angler':'L14,1,3,12,m;l14,2,10,12,w;c9,13,1.5,r;D10,14,1.5,b;D5,14,1.5,b',
  'boppy.recliner_reservation':'r2,2,5,10,P;r2,10,12,4,P;r2,12,12,2,R;r9,9,5,3,R;r5,13,1,2,d;r11,13,1,2,d',
  'boppy.headcount_again':'c3,3,1.5,s;c8,3,1.5,s;c13,3,1.5,s;r1,5,4,4,L;r6,5,4,4,L;r11,5,4,4,L;r3,10,2,2,y;r8,10,2,2,y;r13,10,2,2,y;r2,13,12,1,y',
  'boppy.lockdown':'r5,2,6,2,G;r5,2,2,6,G;r9,2,2,6,G;r3,7,10,7,Y;r7,9,2,3,d;r3,7,10,1,O',
  'boppy.everybody_waits':'c8,8,6,w;l8,8,8,4,d;l8,8,11,10,d;r6,0,4,2,d;d8,8,r',
  'boppy.pepper_breath':'p9,1,11,2,10,4,12,8,9,13,4,15,5,10,6,6,r;r8,0,3,3,L;L12,5,15,3,o;L13,8,16,7,y;L12,11,15,12,o',
  'boppy.seeds_of_trouble':'p3,3,13,3,12,12,8,14,4,12,r;r3,3,10,2,L;d6,7,8,9,10,7,y;d7,11,9,11,y',
  'boppy.mild_for_company':'p9,1,11,3,11,8,8,14,4,15,5,9,7,3,L;r8,0,3,3,F;H12,3,1.5,p',
  'boppy.nineteen_seventy':'r3,2,10,6,m;r4,3,8,4,y;c8,5,1.5,o;r6,9,4,4,m;r4,13,8,1,m;r1,6,2,3,r;r13,6,2,3,r',
  'boppy.five_alarm_jar':'r5,1,6,3,G;r4,4,8,10,b;r5,6,6,7,r;p7,3,9,3,10,1,6,1,y;L12,5,15,3,o;L12,9,15,10,y',
  'boppy.fish_ult':'c7,8,5,3.5,b;p11,8,15,4,15,12,B;d5,7,i;L1,3,2,13,g;L1,13,3,15,g;r6,6,2,4,B',
  'boppy.xc_ult':'c7,3,2,s;r5,5,4,6,Y;L6,10,3,14,s;L8,10,12,14,s;r4,5,6,1,r;L13,4,14,3,L;L13,7,15,7,L;L1,6,0,6,w;L1,9,0,9,w'
});

// ---- Redraws of weaker base icons ----
Object.assign(BI_ART,{
  x_run:'c9,3,2,w;r7,5,4,6,w;L6,10,3,14,w;L9,10,13,13,w;L7,6,3,8,w;L11,6,14,4,w;l0,5,3,5,G;l0,8,2,8,G;l0,11,2,11,G',
  m_swirl:'c8,8,6.5,u;c8,8,5,U;c8,8,3.5,u;c8,8,2,U;c8,8,.8,u;x11,8,3,.8;x5,8,3,.8',
  m_shoulder:'c4,4,2.2,s;r2,7,5,7,B;c11,8,2.2,s;r9,10,5,5,P;r6,8,5,2,s;L6,9,9,9,s',
  m_duo:'c4,5,2.2,s;r2,8,5,7,P;c12,5,2.2,s;r10,8,5,7,B;r7,10,3,2,y',
  m_trio:'c3,6,1.8,s;r1,8,4,7,P;c8,3,2.2,s;r5,6,6,9,r;c13,6,1.8,s;r11,8,4,7,B',
  m_trio_g:'c3,6,1.8,s;r1,8,4,7,L;c8,3,2.2,s;r5,6,6,9,l;c13,6,1.8,s;r11,8,4,7,L',
  'tom.konami_code':'r2,6,5,4,d;r3,3,3,10,d;r10,7,3,3,r;r13,7,3,3,b;l1,2,5,2,y;p7,1,9,1,8,3,y',
  'tom.cart_ult':'r2,3,12,10,d;r4,4,8,5,G;r5,5,6,3,y;r6,10,4,3,d;r1,3,14,1,G;d7,6,r;d9,6,B;d8,7,L'
});

// ---- Grace ----
Object.assign(BI_ART,{
  'grace.cartwheel':'c8,3,2,s;r7,5,2,4,P;L8,8,3,14,s;L8,8,13,14,s;L7,5,2,9,s;L9,5,14,9,s;d2,2,13,2,y',
  'grace.dance':'c8,3,2.2,s;p5,6,11,6,13,12,3,12,P;r7,12,1,3,s;r9,12,1,3,s;X2,3,2,y;X14,3,2,y;X13,12,2,p',
  'grace.squishy_squeeze':'c8,8,6,5.5,p;c8,8,4,3.5,P;d5,6,6,5,w;l3,3,5,5,w;l13,3,11,5,w;l3,13,5,11,w;l13,13,11,11,w',
  'grace.glitter_nails':'r3,7,2,6,s;r6,6,2,7,s;r9,6,2,7,s;r12,7,2,6,s;r3,6,2,2,P;r6,5,2,2,P;r9,5,2,2,P;r12,6,2,2,P;r3,12,11,2,s;X7,2,2.5,y;X13,3,2,w',
  'grace.welcome_back':'r2,3,12,9,d;r3,4,10,7,b;c8,7,2.2,w;d10,6,w;r6,12,4,2,G;r4,14,8,1,G;r11,1,3,2,r',
  'grace.like_subscribe':'H8,8,6,r;r4,12,8,1,r;d3,3,4,2,13,3,w',
  'grace.dumpling_drop':'p2,10,5,4,11,4,14,10,13,13,3,13,c;l5,5,5,10,e;l8,4,8,10,e;l11,5,11,10,e;l2,13,13,13,e;d3,0,8,0,12,0,G',
  'grace.dance_battle':'c4,3,1.8,s;r2,5,4,5,B;r3,10,2,4,s;r1,6,1,4,s;c12,3,1.8,s;r10,5,4,5,P;r11,10,2,4,s;r14,2,1,4,s;X8,8,2.5,y;X8,13,2,r',
  'grace.beam_dismount':'r0,11,16,3,m;r0,11,16,1,e;L8,3,4,9,s;L8,3,13,6,s;c8,3,2,s;X13,2,2.5,y',
  'grace.handstand_contest':'L8,4,8,13,s;L5,3,8,4,s;L11,3,8,4,s;r6,12,4,2,s;L6,13,3,6,P;c8,14,2,s;d2,2,13,2,y',
  'grace.split_leap':'c8,3,2,s;r7,5,2,4,P;L8,8,1,12,s;L8,8,15,12,s;l8,5,5,6,s;l8,5,11,6,s;X8,14,2,y',
  'grace.chalk_up':'r3,7,10,7,w;r4,8,8,5,g;c8,4,3,w;c5,3,1.5,w;c11,3,1.5,w;d2,1,13,1,w;d1,6,14,5,w',
  'grace.viral_ult':'r5,1,6,13,d;r6,2,4,10,B;c8,13,0.5,w;H3,4,2,r;H13,6,2,P;H4,10,2,P;H12,2,1.5,r;X8,6,2.5,y',
  'grace.olympic_ult':'p8,1,13,6,8,15,3,6,b;p8,1,10,6,8,15,6,6,w;l3,6,13,6,B;X2,2,2,y;X14,2,2,y;X14,12,2,y'
});
// ---- Rose ----
Object.assign(BI_ART,{
  'rose.boop':'c8,8,3.5,r;r7,4,2,2,w;X3,3,2.5,y;X13,3,2.5,y;X3,13,2,y;X13,13,2,y;c8,8,1.2,R',
  'rose.silly':'c8,5,5,4,n;c8,6,3,2,p;r5,5,6,3,p;L8,7,8,13,r;c8,13,2,p;d5,3,i;d10,3,i',
  'rose.boo':'p3,14,3,6,5,2,11,2,13,6,13,14,12,12,10,14,8,12,6,14,4,12,w;d6,6,i;d10,6,i;r7,9,2,2,i',
  'rose.dress_up_tiara':'p3,11,3,6,5,8,8,3,11,8,13,6,13,11,Y;r3,11,10,2,y;d8,6,r;d5,9,B;d11,9,L;L1,14,5,13,P;L5,13,9,14,y;L9,14,13,13,L;L13,13,15,14,B',
  'rose.giggle_storm':'c8,5,3,c;c5,7,3,c;c11,7,3,c;l3,10,3,13,B;l8,11,8,14,B;l13,10,13,13,B;r5,3,6,3,w;d6,5,8,5,10,5,i',
  'rose.lamby_hug':'c8,9,5,4.5,w;c8,5,3,2.5,c;d7,4,9,4,i;c4,3,1.5,c;c12,3,1.5,c;H8,13,2,P;r4,13,2,2,w;r10,13,2,2,w',
  'rose.floor_is_lava':'r0,8,16,7,R;r0,9,16,6,r;c3,9,1.5,o;c9,10,2,o;c13,9,1.2,y;r5,3,6,3,w;r6,5,4,3,c;d6,4,i;d9,4,i;l3,1,1,4,o',
  'rose.lookout_lamby':'c6,9,5,4,w;c4,5,2.5,c;d3,4,i;r5,13,2,2,w;r9,13,2,2,w;L9,1,13,5,y;L13,5,9,9,y;l2,2,1,0,w',
  'rose.piggyback_pounce':'c6,4,2.2,s;r4,6,5,6,P;c10,2,2,n;r9,4,4,5,B;r4,12,2,3,s;r8,12,2,3,s;L13,9,15,12,y',
  'rose.bedtime_story':'p1,3,8,5,8,14,1,12,P;p15,3,8,5,8,14,15,12,p;l3,6,6,7,w;l3,8,6,9,w;l10,6,13,7,w;l10,8,13,9,w;X13,2,2,y',
  'rose.lamby_boomerang':'r2,6,10,6,e;c7,6,5,2,Y;c7,6,3,1.5,o;d5,5,7,5,9,5,y;X13,3,2.5,y;L12,10,14,13,c;L14,13,11,14,c',
  'rose.pillow_fort':'r1,5,6,9,P;r9,5,6,9,B;p1,5,8,1,15,5,u;r6,9,4,5,i;d7,10,8,10,y;d2,7,4,7,w;d11,7,13,7,w',
  'rose.teaparty_ult':'c7,9,5,4,w;r4,5,6,2,w;p12,7,14,7,14,10,11,10,w;c8,3,0.8,w;L6,1,6,2,w;L9,0,9,2,w;H7.5,9,2,P;X14,3,2,y',
  'rose.mecha_ult':'r4,5,8,6,G;r5,6,6,4,b;d6,7,9,7,r;r2,6,2,5,d;r12,6,2,5,d;r5,11,2,4,d;r9,11,2,4,d;c8,3,2,n;r7,1,2,1,y'
});

// ---- Battle items (keyed by item id) ----
Object.assign(BI_ART,{
  roll:'c8,9,6,4,e;c8,8,5,3,Y;l4,7,6,6,O;l7,6,9,6,O;l10,7,12,6,O;L13,2,14,4,w',
  biscuit:'c8,8,6,5.5,e;d5,6,9,5,11,8,6,10,N;d9,11,N;c8,8,5,4.5,Y;d6,6,9,7,8,10,N',
  cookie:'c8,8,6,5.5,e;d5,6,10,5,6,10,10,10,8,8,N;c4,4,1,y',
  mudpie:'p2,6,14,6,13,13,3,13,m;r2,4,12,3,N;d5,5,9,4,11,5,w',
  honey:'r4,4,8,10,Y;r4,4,8,2,O;r5,6,6,5,y;r6,2,4,2,m;D8,14,1.5,y',
  fogjuice:'r5,3,6,11,u;r5,3,6,2,U;r6,6,4,3,w;D8,7,1,b;L8,0,8,3,w',
  dodgeitem:'c8,8,6,r;l2,8,14,8,w;c8,8,6,r;l3,5,13,5,R;l3,11,13,11,R;d5,4,w',
  acorn:'c8,10,5,4.5,e;r3,4,10,3,N;r7,1,2,3,m;d6,9,7,9,w',
  sapjar:'r4,4,8,10,Y;r4,3,8,2,G;r5,7,6,5,O;D8,14,1.5,Y',
  peanuts:'r3,4,10,10,e;r3,4,10,2,N;c6,9,2,1.5,c;c10,9,2,1.5,c;c8,12,2,1.5,c;H12,2,1.5,L',
  flatpage:'r3,2,9,12,c;r4,4,7,1,G;r4,6,7,1,G;r4,8,7,1,G;p11,2,13,5,11,5,Y;r3,13,9,2,e',
  popcard:'p2,10,8,2,14,10,8,14,y;r5,6,6,5,r;L13,2,15,0,y;X8,8,2,w',
  tepidcoffee:'r3,5,8,8,c;r11,6,3,4,c;r12,7,1,2,k;r4,6,6,2,m;l5,2,5,3,G;l8,1,8,3,G',
  leftovers:'r2,6,12,7,w;r3,7,10,2,o;r3,9,10,2,r;r3,11,10,1,y;r2,5,12,1,G;r4,2,3,2,L',
  hotsauce:'r4,3,8,10,r;r4,3,8,2,R;r6,7,4,3,w;d7,8,r;L12,5,14,3,o;L12,9,15,9,y',
  cufflink:'c8,8,5,Y;c8,8,3,y;c9,8,3,0,y;S8,8,3,1.2,w;d5,5,w',
  pretzels:'c5,8,3,2.5,Y;c11,8,3,2.5,Y;l5,10,11,6,Y;l11,10,5,6,Y;d4,7,6,7,10,7,12,7,w',
  coldbrew:'r4,3,8,11,m;r4,3,8,3,c;r6,2,2,4,w;r5,7,6,6,N;d6,8,7,10,9,9,w',
  juice:'r4,3,8,11,y;r4,3,8,2,o;r5,7,6,4,w;L9,1,12,0,B;L12,0,12,3,B',
  bandage:'p2,6,14,6,14,10,2,10,s;r6,5,4,6,e;d4,7,5,9,w;r1,6,1,4,s;r14,6,1,4,s;c8,8,1,r',
  picnic:'p3,6,13,6,14,14,2,14,r;r2,6,12,2,w;L5,6,6,2,m;L11,6,10,2,m;r5,9,6,4,w',
  lemonade:'p4,3,12,3,11,14,5,14,y;r4,3,8,2,w;L12,1,15,0,L;c10,6,1.3,w;D7,9,1.3,w',
  cocoa:'r3,5,8,8,r;r11,6,3,4,r;r4,6,6,2,m;r3,4,8,2,w;l5,1,6,3,w;l8,0,9,3,w',
  whistle:'c7,9,5,4,Y;r10,7,5,3,Y;r2,5,12,2,Y;c7,9,2,i;X13,2,2,w',
  balloon:'D8,7,5.5,b;D8,7,3,w;r7,13,2,2,B;L8,14,8,15,b',
  popper:'p3,14,3,13,10,6,11,8,r;p10,6,15,2,15,6,12,8,y;X13,2,2,y;X3,5,2,P;X7,3,2,b',
  cushion:'c8,9,6,4.5,P;c8,9,4,3,p;r4,2,8,3,p;L1,13,4,13,w;L12,13,15,13,w',
  kazoo:'r1,5,10,5,Y;c12,8,3,2.5,y;c12,8,1,i;l2,7,10,7,O;L13,1,15,3,u;L14,5,16,5,u',
  goldstar:'S8,8,7.5,3.5,y;d6,6,7,6,w',
  jerky:'p2,5,13,3,14,9,10,13,3,10,N;r4,5,8,2,e;r4,9,6,1,e;d11,6,m',
  bandage1:'p1,6,15,6,15,10,1,10,s;r5,5,6,6,e;d3,7,4,9,w;d11,7,12,9,w;H8,8,2,r',
  bandage2:'p1,6,15,6,15,10,1,10,L;r5,5,6,6,l;d3,7,4,9,w;d11,7,12,9,w;H8,8,2,r',
  bandage3:'r2,4,12,10,w;r7,5,2,8,r;r4,8,8,2,r;r2,4,12,1,G',
  picnic1:'p3,6,13,6,14,14,2,14,B;r2,6,12,2,w;L5,6,6,2,m;L11,6,10,2,m;H8,11,2,r',
  picnic2:'p3,6,13,6,14,14,2,14,O;r2,6,12,2,w;L5,6,6,2,m;L11,6,10,2,m;r5,9,6,4,r',
  picnic3:'p3,6,13,6,14,14,2,14,L;r2,6,12,2,r;L5,6,6,2,m;L11,6,10,2,m;S8,11,2.5,1,y',
  popper1:'p5,14,5,12,9,5,11,7,r;r7,3,4,4,y;X3,4,2,P;X13,4,2.5,y;X8,1,2,b;X13,10,2,L',
  popper2:'p8,14,6,6,10,6,y;l8,6,2,2,r;l8,6,14,2,b;l8,6,8,0,y;l8,6,3,10,P;l8,6,13,10,L',
  popper3:'p6,14,6,6,8,2,10,6,10,14,r;r6,8,4,2,w;L5,14,11,14,o;X13,3,2,y;X3,4,2,y',
  ramen:'c8,10,7,4.5,w;c8,9,6,3.5,Y;l3,5,5,8,y;l5,8,3,11,y;l9,4,11,8,y;L13,1,10,4,m;L12,1,9,3,m',
  greenjuice:'r4,3,8,11,L;r4,3,8,2,F;r5,7,6,4,l;L9,1,12,0,F',
  popcorn:'p3,6,13,6,12,14,4,14,r;l6,6,6,14,w;l10,6,10,14,w;c5,4,2,w;c8,3,2,c;c11,4,2,w',
  lemons:'c6,9,4,3,y;c11,6,4,3,y;d5,8,w;d10,5,w;L11,2,13,1,L',
  praline:'c8,9,6,4.5,N;c8,8,5,3,e;d5,7,e;c11,5,1.5,m;c5,6,1.5,m;d8,9,Y',
  pupusa:'c8,8,6,5.5,Y;c8,8,5,4.5,e;d5,6,6,10,11,7,10,10,N;d8,8,r',
  sweettea:'r4,3,8,11,O;r4,3,8,2,w;c8,8,2,0,y;l9,1,9,4,Y;D8,9,1.2,y',
  kombucha:'r5,2,6,2,G;r4,4,8,10,Y;r5,5,6,8,o;c8,9,1,y;c6,7,.8,y',
  oatlatte:'r3,5,8,8,c;r11,6,3,4,c;r12,7,1,2,k;r4,5,6,3,e;H7,6.5,1,w;l5,2,5,3,w;l8,1,8,3,w'
});

// ---- TNB ----
Object.assign(BI_ART,{
  'tnb.mug_toss':'r3,5,8,8,c;r11,6,3,5,c;r12,7,1,3,k;r4,6,6,2,m;L1,3,3,5,y;L1,9,0,9,y;d5,3,y',
  'tnb.wardrobe':'r2,1,12,14,m;r3,2,4,12,e;r9,2,4,12,e;d6,8,7,8,Y;d9,8,10,8,Y;X13,2,2,y',
  'tnb.foraged_at_dawn':'c8,10,7,3,w;c8,10,5,2,g;c8,8,1.5,1.5,G;d8,7,g;r2,2,8,4,w;d4,4,6,4,k',
  'tnb.dont_split_up':'r1,1,14,14,d;p7,2,4,13,10,13,y;r6,1,2,3,G;c8,10,2,1.5,G;d3,4,12,4,w',
  'tnb.metro_tap':'r1,4,14,9,B;r1,6,14,2,d;c11,10,2,y;l3,11,6,11,w;X13,2,2,y',
  'tnb.slasher_scare':'c8,8,6,w;r4,6,3,3,i;r9,6,3,3,i;r6,11,4,1,i;d5,12,7,12,9,12,11,12,i;r5,3,6,1,B;r5,4,2,1,B',
  'tnb.scope_creep':'r1,2,14,12,w;r1,2,14,2,B;r3,6,4,2,G;r3,9,8,2,o;r3,12,13,2,r;l13,4,13,14,r',
  'tnb.throw_down':'p5,3,11,3,13,8,10,14,6,14,3,8,O;r5,2,6,2,o;c8,8,1,y;L3,3,1,1,y;d11,5,w',
  'tnb.around_the_bend':'p1,15,6,9,3,5,10,9,7,15,G;L1,14,5,9,m;L5,9,3,5,m;L3,5,10,9,m;L10,9,14,3,m;c14,3,1.5,y;d15,2,y',
  'tnb.round_with_jojo':'l8,3,8,14,G;r4,2,8,1,g;l5,3,7,9,G;l11,3,9,9,G;r4,9,8,3,G;c12,2,2.5,1,o;r1,14,14,1,G',
  'tnb.coffee_run':'r4,5,8,10,w;r3,3,10,3,N;r4,8,8,3,o;r12,7,2,5,w;d6,1,w;d9,1,w',
  'tnb.kiln_door_policy':'r2,2,12,13,d;c8,8,4.5,O;c8,8,3,o;r6,6,4,4,y;r2,2,12,1,G;d6,1,w',
  'tnb.tasting_ult':'p2,10,14,10,13,3,8,1,3,3,G;r1,10,14,2,g;c8,1,1.5,1,g;r5,13,6,2,N;d7,14,9,14,y',
  'tnb.hillbomb_ult':'p0,14,0,6,16,10,16,14,G;l0,6,16,10,d;c10,5,1.5,s;L9,8,4,10,B;c5,12,1.5,i;c11,12,1.5,i;l1,7,0,8,w'
});
// ---- Nara ----
Object.assign(BI_ART,{
  'nara.jump_up':'c8,7,4,3.5,e;p5,4,3,8,6,8,e;p11,4,13,8,10,8,e;d6,6,i;d10,6,i;r7,8,2,1,i;L8,10,8,14,e;L5,13,4,15,e;L11,13,12,15,e',
  'nara.puppy_eyes':'c5,8,3.5,3.5,w;c11,8,3.5,3.5,w;c5,8,2.5,i;c11,8,2.5,i;d4,7,10,7,w;p1,4,6,3,5,5,m;p15,4,10,3,11,5,m',
  'nara.tennis_ball_fetch':'c8,8,6,y;l3,4,5,8,w;l5,8,3,12,w;l13,4,11,8,w;l11,8,13,12,w',
  'nara.dont_leave_me':'r1,3,5,10,B;r1,3,5,2,b;r5,6,3,2,w;p8,5,13,8,10,11,6,13,e;c13,8,1.5,e;d11,7,i;H12,1,1.5,P',
  'nara.just_one_bite':'r2,4,12,6,c;c8,12,3.5,3,e;c8,13,2,1.5,i;c5,9,.8,w;r3,3,3,3,e;L13,3,15,6,w',
  'nara.counter_surfer':'r0,9,16,2,m;r6,5,4,4,c;c8,5,1.5,L;p9,0,13,2,13,5,11,5,e;r11,5,2,4,e;c7,8,0.5,i;d12,2,i;r10,1,1,0,i',
  'nara.stranger_alert':'p8,1,15,14,1,14,Y;r7,5,2,5,i;r7,12,2,2,i;p1,2,3,0,3,4,e;p15,2,13,0,13,4,e',
  'nara.doodle_fluff':'c5,5,3,w;c11,5,3,w;c8,3,3,w;c4,9,3,w;c12,9,3,w;c8,10,4,w;d7,8,i;d9,8,i;r7,10,2,1,i;L2,14,4,14,P',
  'nara.shake_everyone':'p4,5,8,2,12,5,12,12,4,12,e;D2,5,1.5,b;D14,5,1.5,b;D1,11,1.5,b;D15,11,1.5,b;D8,14,1.5,b;L2,8,4,8,b',
  'nara.not_leaving':'p2,11,6,3,10,3,14,11,2,11,e;r1,11,14,3,m;d6,8,i;d9,8,i;H8,6,1.5,P',
  'nara.happy_puddle':'c8,11,7,3.5,b;c8,11,4.5,2,w;D8,5,3,b;X13,3,2,y;X3,4,2,y',
  'nara.food_inspector':'c6,6,4.5,b;c6,6,2.5,w;L9,9,13,13,N;r2,12,6,3,e;r3,11,4,1,c',
  'nara.squirrel_ult':'p4,6,2,2,6,3,10,6,12,10,10,14,6,14,4,12,e;c7,9,3,3,c;c3,5,1.5,N;r11,8,3,3,N;c14,6,1.2,N;L13,3,15,1,y',
  'nara.pack_ult':'c4,3,2,n;c12,3,2,n;c8,6,2,n;r6,10,4,4,e;r2,6,4,4,e;r10,6,4,4,e;r0,0,0,0,w;d3,12,5,12,11,12,13,12,w;H8,14,1.5,P'
});

// ---- Tom ----
Object.assign(BI_ART,{
  'tom.button_mash':'r2,5,12,6,g;r2,10,3,4,g;r11,10,3,4,g;r2,13,3,1,G;r11,13,3,1,G;r4,7,3,1,d;r5,6,1,3,d;d10,7,r;d12,8,b;d10,9,y',
  'tom.defend':'p2,2,13,2,13,8,8,14,2,8,B;p4,4,11,4,11,8,8,11,4,8,b;r7,5,2,5,w',
  'tom.starter_splash':'r4,5,8,9,c;r5,9,6,4,a;d6,10,w;d9,11,w;r4,3,8,2,Y;D2,5,2,b;D13,5,2,b;D13,10,1.5,b',
  'tom.sourdough_snob':'c7.5,9,6,4.5,e;c7.5,7.5,4.5,2.5,N;l4,8,6,11,c;l7,7,9,11,c;l10,8,12,11,c;X12,2,2.5,y',
  'tom.overpriced_gadget':'p3,5,13,5,12,14,4,14,P;r6,2,1,4,d;r9,2,1,4,d;r10,6,4,3,y;d11,7,12,7,i;X5,10,2.5,w',
  'tom.noise_canceling':'r3,2,10,2,d;r3,2,2,8,d;r11,2,2,8,d;r2,8,4,6,B;r10,8,4,6,B;r3,9,2,4,b;r11,9,2,4,b;X8,10,2,y',
  'tom.seat_1a':'r5,1,6,3,b;r4,3,8,8,B;r3,10,10,3,B;r1,8,2,5,d;r13,8,2,5,d;S8,6.5,2.5,1.2,y',
  'tom.flashcard_flurry':'p2,3,10,3,10,12,2,12,y;p5,4,14,5,13,14,4,13,w;l6,7,12,7,B;l6,9,11,9,B;l6,11,10,11,B',
  'tom.konami_code':'r6,1,4,14,d;r1,6,14,4,d;p8,2,6,6,10,6,y;d7,9,8,9,G',
  'tom.skincare_10':'r4,7,8,7,t;r6,4,4,3,G;r5,2,6,2,G;r10,2,3,1,G;r5,9,6,3,w;X13,5,2.5,y',
  'tom.kanji_strike':'r7,1,2,8,o;L7,8,3,13,o;L8,8,12,13,o;r2,4,2,3,r;r12,4,2,3,r;r7,2,2,4,y',
  'tom.know_it_all':'c7.5,6,4.5,y;r6,10,4,3,G;r6,13,4,1,d;l2,2,3,3,Y;l13,2,12,3,Y;l0,7,2,7,Y;l15,7,13,7,Y;l6,6,8,9,Y',
  'tom.delta_ult':'r7,1,2,13,g;p7,6,1,10,1,12,7,10,g;p7,12,4,14,4,15,7,14,g;M;d8,3,B;d7,3,B',
  'tom.cart_ult':'p4,2,12,3,11,14,3,13,G;p5,4,11,5,10,9,5,8,y;r5,12,5,2,d;d6,6,r;d8,7,B'
});

// ---- Tombos (keyed by tombo id) ----
Object.assign(BI_ART,{
  grace1:'r2,3,12,8,d;r3,4,10,6,b;c8,7,2,w;H12,2,1.5,P;r6,12,4,2,G',
  grace1_dc:'H8,8,6,r;r5,1,6,2,d;L1,4,3,2,y;L15,4,13,2,y;d7,6,w',
  rose1:'p1,8,12,6,15,8,12,10,1,10,w;p4,3,9,3,9,8,4,8,w;p4,10,9,10,9,15,4,15,w;r5,6,2,2,b;r10,7,2,2,b;L2,14,14,14,b',
  rose1_dc:'c5,9,4,3.5,w;c9,7,4.5,4,w;c12,10,3,2.5,w;d7,7,8,7,i;r8,8,2,1,i;r3,13,10,1,b',
  deedee1:'p3,2,9,2,8,7,6,9,4,7,r;r6,9,1,4,g;r4,13,5,1,g;c12,5,3,w;c12,5,2,P;L11,9,13,13,P',
  deedee1_dc:'r3,6,10,8,w;r4,7,8,6,b;D5,3,1.5,B;D10,2,1.5,B;X12,12,2,y',
  tnb1:'p3,3,5,2,6,6,3,6,y;p9,5,11,3,12,7,9,7,w;p3,9,13,9,12,15,4,15,r;l6,9,6,15,w;l10,9,10,15,w',
  tnb1_dc:'r2,2,12,12,b;r3,3,10,10,w;l4,4,12,12,B;L11,3,13,6,y;X4,11,2,y',
  nara1:'c8,7,4,3.5,e;p5,4,3,8,6,8,e;p11,4,13,8,10,8,e;d6,6,i;d10,6,i;r6,12,4,3,c;c8,13,1,r',
  nara1_dc:'r2,6,12,8,P;r3,7,10,6,p;c8,10,2.5,e;d6,8,i;d10,8,i;L1,2,3,5,y',
  boppy1:'c9,6,6,5,w;l3,2,13,12,G;l3,12,13,2,G;l9,1,9,13,G;l3,7,15,7,G;L1,14,5,10,m',
  boppy1_dc:'r0,11,16,4,m;r0,10,16,1,e;L14,1,6,9,m;l14,2,11,9,w;D4,6,1.5,b',
  amy1:'p2,2,14,2,14,10,7,10,4,14,4,10,2,10,y;S8,6,3.5,1.5,r',
  amy1_dc:'p0,14,0,10,6,6,12,2,16,2,16,14,L;c12,2,1.5,y;r5,1,5,2,r;c8,10,1,w',
  grace2:'r4,6,4,6,B;r8,6,4,6,P;c6,4,2,s;c10,4,2,s;L10,3,14,0,s;L14,0,15,1,y;X13,5,2,y',
  grace2_dc:'r2,1,12,5,d;r3,2,10,3,Y;r7,6,2,5,m;r5,11,6,3,m;X13,13,2,y',
  rose2:'r4,2,6,6,b;r3,7,8,6,B;r5,9,4,4,P;c13,6,2,w;c13,6,1,P;d4,3,9,3,w',
  rose2_dc:'p3,11,3,6,5,8,8,3,11,8,13,6,13,11,Y;r3,11,10,2,y;r6,13,4,2,B;r7,14,2,1,w',
  amy2:'r1,8,14,3,G;r2,9,12,1,w;p7,1,9,1,11,6,5,6,B;c8,3,1.5,s;l1,12,15,12,b',
  amy2_dc:'L7,1,5,14,s;L9,1,11,14,s;r4,6,8,2,B;c8,12,3,2,G;r5,13,6,2,d',
  deedee2:'r6,1,4,2,L;r5,2,6,2,F;L6,4,4,13,r;L9,4,11,13,r;L8,5,8,14,R;r2,13,12,2,m',
  deedee2_dc:'r5,1,6,3,G;r4,4,8,9,y;r5,5,6,7,o;r6,13,4,2,d;X12,2,2,y',
  boppy2:'r1,3,3,11,B;r12,3,3,11,B;r4,6,8,4,w;l4,8,12,8,d;X8,3,2,y',
  boppy2_dc:'c8,9,6,3.5,e;c8,8,4,2,N;c5,6,1.5,w;c10,6,1.5,w;d6,6,i',
  tnb2:'r2,8,12,5,B;r3,9,3,2,b;r8,9,3,2,b;r1,13,14,2,d;r12,2,2,5,r;r2,2,8,2,r;L2,8,5,5,r',
  tnb2_dc:'c8,10,5.5,4,d;c8,10,3.5,2,Y;r6,2,4,3,G;c8,10,1,y;L5,13,3,15,k',
  nara2:'r1,7,14,3,e;c2,8,3,3,e;c14,8,3,3,e;r6,7,4,3,r;d3,7,i',
  nara2_dc:'c8,6,4.5,4,e;p5,4,3,8,6,8,e;p11,4,13,8,10,8,e;r6,9,4,2,R;d6,5,i;d10,5,i;L13,2,15,0,r',
  grace3:'S5,6,4.5,2,y;S11,6,3.5,1.5,P;S9,12,3.5,1.5,B;X13,13,2,w;X2,12,2,w',
  grace3_dc:'c8,8,6,5.5,d;c8,8,4,3.5,G;c6,6,1,w;c10,6,1,w;r6,10,4,1,w',
  rose3:'r3,3,10,3,d;r3,3,2,8,d;r11,3,2,8,d;r1,8,4,6,r;r11,8,4,6,r;d7,7,8,7,y;X8,12,2,y',
  rose3_dc:'c8,9,5,4.5,w;c8,5,3,2.5,c;d7,4,9,4,i;r7,13,2,2,y;X3,3,2.5,y;X13,3,2.5,y',
  amy3:'r4,1,8,14,G;r5,2,6,2,b;r5,6,6,2,b;r5,10,6,2,b;L1,14,4,10,s;L15,14,12,10,s',
  amy3_dc:'r3,2,10,12,G;r7,2,2,12,d;r4,4,2,2,y;d10,6,y;p7,0,9,0,8,2,r',
  deedee3:'c8,10,6,3.5,d;r2,10,12,2,G;r6,6,4,3,c;L4,3,5,6,w;L8,2,9,5,w;L12,3,11,6,w;c8,5,1,e',
  deedee3_dc:'p2,4,14,4,15,8,1,8,w;c4,6,1.5,r;c8,6,1.5,Y;c12,6,1.5,L;r3,9,10,3,e;r6,13,4,2,L',
  boppy3:'c8,8,5.5,4.5,n;r6,6,1,2,i;r10,6,1,2,i;p10,0,13,0,13,5,12,6,r;L12,7,15,5,b;d4,7,5,9,y',
  boppy3_dc:'p3,5,13,5,12,12,8,14,4,12,r;r3,3,10,2,L;c13,2,1.5,y;c2,2,1.5,y',
  tnb3:'p5,3,11,3,13,9,10,13,6,13,3,9,O;r5,2,6,2,o;H8,8,2,P;l0,14,16,14,b',
  tnb3_dc:'p5,3,11,3,13,9,10,13,6,13,3,9,O;l4,7,8,9,y;l8,9,6,12,y;l8,9,11,6,y;X13,3,2,y',
  nara3:'c8,9,6,5,e;c8,7,3.5,3,c;d6,6,i;d10,6,i;H8,12,2,P;p3,3,2,6,6,6,e;p13,3,14,6,10,6,e',
  nara3_dc:'r1,5,14,3,m;r2,8,2,6,m;r12,8,2,6,m;c8,12,3.5,2.5,e;d7,11,i',
  ff1:'r1,6,14,7,P;r1,5,14,2,p;c4,3,1.5,y;d9,2,w;X12,3,2,y;r3,7,2,2,w;r11,7,2,2,w',
  ff2:'c4,3,2,s;r2,5,4,5,r;c11,3,2,s;r9,5,4,5,B;L6,10,4,14,s;L12,10,14,14,s;L1,15,3,13,w',
  ff3:'H5.5,7,4.5,P;H10.5,8,4.5,r;d4,4,5,4,w;X8,2,2,y',
  ff4:'r2,4,12,5,m;r1,9,14,2,e;r3,2,2,2,w;r7,2,2,2,w;r11,2,2,2,w;r3,11,2,3,m;r11,11,2,3,m',
  ff1_dc:'p5,3,11,3,13,9,10,13,6,13,3,9,O;r5,2,6,2,o;c8,8,1.5,y;L2,14,4,11,s',
  ff2_dc:'r2,9,12,3,e;r3,6,10,3,w;c8,5,2.5,y;r2,12,12,2,w;L13,2,15,0,y',
  ff3_dc:'c3,4,1.5,s;c8,4,1.5,s;c13,4,1.5,s;r2,6,3,6,B;r7,6,3,6,P;r12,6,3,6,L;l1,14,15,14,l',
  ff4_dc:'c8,8,6,3.5,m;c8,8,4.5,2,e;c3,8,1.3,w;c13,8,1.3,w;c8,4,1.3,w;c8,12,1.3,w;X8,8,1.5,y',
  wish:'r3,8,10,6,P;r3,8,10,2,p;r7,3,2,5,y;c8,2,1.3,o;D8,2,1,y;X2,3,2,y;X14,3,2,y;L3,10,13,10,w'
});
