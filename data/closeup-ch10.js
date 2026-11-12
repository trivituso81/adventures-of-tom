'use strict';
// Chapter 10 coin close-up (Tom 2026-11-12; engine/closeup.js, spec claude/coin-closeup-spec.md).
// Replaces the seven text menus (ch10Slot in data/scenes.js) once the painted art is installed: set `ready` true then, and purge ch10Slot.
// Art (Art Library entries closeup-ch10-clock and closeup-ch10-coins; bake with tools/art-library/bake_closeup.py):
//   art/closeup/ch10-clock.webp          square plate: Gate Zero's clock face, three still hands, seven empty slots round the face, going
//                                        clockwise from the top, one empty slot in the middle (it stays empty: it sets up Part 2).
//   art/closeup/ch10-coin-1.webp .. 7    the coins in story order (CH10_COINS in data/scenes.js).
// Slot positions are a ring: centre CX,CY, radius RR and slot radius SR are shares of the plate width. Re-measure them on the approved
// plate (tools/closeup_test.py draws the ring over the plate: tools/shots/closeup-ring.png) and change only these numbers.
const CH10_RING={CX:.5,CY:.5,RR:.3,SR:.066};
CLOSEUP_DEFS.ch10={
  id:'ch10', ready:false, v:'closeup1', bg:'art/closeup/ch10-clock.webp',
  slots:Array.from({length:7},(_,k)=>{ const a=-Math.PI/2+k*2*Math.PI/7; return {x:CH10_RING.CX+CH10_RING.RR*Math.cos(a),y:CH10_RING.CY+CH10_RING.RR*Math.sin(a),r:CH10_RING.SR}; }),
  items:CH10_COINS.map((label,i)=>({id:'c'+(i+1),label,img:'art/closeup/ch10-coin-'+(i+1)+'.webp'})),
  order:CH10_COINS.map((_,i)=>'c'+(i+1)),
  caption:(k,n)=>'Slot '+(k+1)+' of '+n+', going round'
};
// Opens the close-up. Returns false (nothing happens) until the art is installed, so the caller keeps the text menus.
function ch10Closeup() {
  return closeupOpen('ch10',{
    onWrong:()=>{   // the same counting and Grace hints as the old menus
      const f=(flag('ch10-fails')||0)+1; setFlag('ch10-fails',f);
      openDialog('Gate clock',['CLUNK. The coins rattle back out into Tom’s hand.',CH10_HINTS[Math.min(f,2)-1]]);
    },
    onDone:()=>playScene('ch10Door')
  });
}
