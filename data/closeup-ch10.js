'use strict';
// Chapter 10 coin close-up (Tom 2026-11-12; engine/closeup.js, spec claude/coin-closeup-spec.md).
// The seven text menus this replaced (ch10Slot) are gone. Art (Art Library entries closeup-ch10-clock and closeup-ch10-coins, baked by
// tools/art-library/bake_closeup.py ch10):
//   art/closeup/ch10-clock.webp          square plate: Gate Zero's clock face, three still hands, seven empty slots round the face, going
//                                        clockwise from the top, one empty slot in the middle (it stays empty: it sets up Part 2).
//   art/closeup/ch10-coin-1.webp .. 7    the coins in story order (CH10_COINS in data/scenes.js).
// Slot positions are a ring: centre CX,CY, radius RR and slot radius SR are shares of the plate width. If the plate is ever rebaked, check
// them with `ART=real python3 tools/closeup_test.py` (tools/shots/closeup-ring.png draws the ring over the plate) and change only these numbers.
const CH10_RING={CX:.5,CY:.4834,RR:.2832,SR:.064};   // matches RR 290 and the center (512,495) of tools/art-library/bake_closeup.py
CLOSEUP_DEFS.ch10={
  id:'ch10', ready:true, v:'closeup2', bg:'art/closeup/ch10-clock.webp',
  slots:Array.from({length:7},(_,k)=>{ const a=-Math.PI/2+k*2*Math.PI/7; return {x:CH10_RING.CX+CH10_RING.RR*Math.cos(a),y:CH10_RING.CY+CH10_RING.RR*Math.sin(a),r:CH10_RING.SR}; }),
  items:CH10_COINS.map((label,i)=>({id:'c'+(i+1),label,img:'art/closeup/ch10-coin-'+(i+1)+'.webp'})),
  order:CH10_COINS.map((_,i)=>'c'+(i+1)),
  caption:(k,n)=>'Slot '+(k+1)+' of '+n+', going round'
};
// Opens the close-up.
function ch10Closeup() {
  return closeupOpen('ch10',{
    onWrong:()=>{   // the same counting and Grace hints as the old menus
      const f=(flag('ch10-fails')||0)+1; setFlag('ch10-fails',f);
      openDialog('Gate clock',['CLUNK. The coins rattle back out into Tom’s hand.',CH10_HINTS[Math.min(f,2)-1]]);
    },
    onDone:()=>playScene('ch10Door')
  });
}
