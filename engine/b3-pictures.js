'use strict';
// engine/b3-pictures.js: Rose Mode pictures for Battle 3 (architecture 2.9). DRAWING ONLY: it never changes the fight.
// Rose Mode (feel.js: `pictures:true`) is for Rose, who is 6 and cannot read yet. It borrows battle 2's picture helpers (engine/battle-pictures.js,
// which loads first: bpIcon, bpWord, bpOn). The new battle screen has no pictures yet: they are card c-battleux3, which adds them to engine/b3-deck.js
// with the icons registered below (b3_star, b3_pip, b3_resist, b3_ko, b3_ruckus and the six flavors, b3f_*) and the drops helper b3pDrops.
// Pictures: the flavors and Primes use the emoji pictures (data/battle-emoji.js), the rest the 16 x 16 pixel set (data/battle-icons.js).

Object.assign(BE_MAP,{b3f_clobber:'1f44a',b3f_sizzle:'1f525',b3f_drench:'1f4a6',b3f_razzle:'2728',b3f_racket:'1f4e3',b3_bomb:'1f4a3',b3_star:'2b50',b3_guard:'1f6e1',b3_push:'1f4a8',b3f_support:'1f917',b3_pocket:'1f392',b3_use:'1f44d'});
Object.assign(BI_ART,{
  b3_pip:'p8,1,14,6,8,15,2,6,Y;p8,2,12,6,8,6,4,6,y;d6,4,w',
  b3_pip_off:'p8,1,14,6,8,15,2,6,G;p8,2,12,6,8,6,4,6,g',
  b3_resist:'p7.5,14,13,7,9.5,7,9.5,1,5.5,1,5.5,7,2,7,R',
  b3_ko:'L2,2,13,13,R;L13,2,2,13,R',
  b3_ruckus:'X8,8,7.5,y;H8,8.5,3.8,P;d6,6,w'});
const B3P_FLAV={clobber:'b3f_clobber',sizzle:'b3f_sizzle',drench:'b3f_drench',razzle:'b3f_razzle',racket:'b3f_racket',support:'b3f_support'};
const b3pOn=()=>typeof bpOn==='function'&&bpOn();
const b3pDrops=(n,px)=>n>0?bpIcon('m_drop',px||14).repeat(Math.min(n,10)):bpIcon('m_hand',px||14);

