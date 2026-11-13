'use strict';
// Chapter 7 close-up: spelling SHH on the Reading Room doors (Tom 2026-11-12; plan claude/closeup-plan.md Row 4; ORDERED mode in engine/closeup.js).
// Art (Art Library closeup-ch7-doors and closeup-ch7-cards, baked by tools/art-library/bake_closeup_ch7.py):
//   art/closeup/ch7-doors.webp (square plate: double doors, three empty brass card holders, left to right)
//   art/closeup/ch7-card-s.webp, ch7-card-h.webp (catalog cards with a gold letter; the second H is the same picture)
// The three cards go in the holders in card order: S first (left), then the two H cards in either order (the group 'h' is interchangeable).
// The old "What does Tom spell?" menu is gone (CH7_WORDS, BOO). BOO's Rose line now plays as the first wrong try (the onWrong hook in ch7Closeup below).
// Holder centres are shares of the plate (measured on the approved picture); if the plate is rebaked, check them.
const CH7_HOLDERS=[{x:.326,y:.518},{x:.501,y:.518},{x:.676,y:.518}];
CLOSEUP_DEFS.ch7={
  id:'ch7', ready:true, v:'closeup6', bg:'art/closeup/ch7-doors.webp',
  slots:CH7_HOLDERS.map(p=>({x:p.x,y:p.y,r:.064})),
  items:[
    {id:'s',group:'s',label:'The S card',img:'art/closeup/ch7-card-s.webp'},
    {id:'h1',group:'h',label:'An H card',img:'art/closeup/ch7-card-h.webp'},
    {id:'h2',group:'h',label:'Other H card',img:'art/closeup/ch7-card-h.webp'}],
  order:['s','h','h'],
  caption:(k,n)=>'Card holder '+(k+1)+' of '+n+', left to right'
};
// Opens the close-up (called from ch7Catalog in data/scenes.js once all three cards are in Grace's hand).
function ch7Closeup() {
  return closeupOpen('ch7',{
    onWrong:()=>{
      const f=(flag('ch7-fails')||0)+1; setFlag('ch7-fails',f);
      if(f===1) openDialog('Rose',['BOO!','...It didn\'t work. It SHOULD have worked. Boo always works.']);
      else openDialog('Grace',[pick(['Card one first, Tata. Then card two. Then card three.','The cards are numbered. One, two, three. That\'s the order.','Wrong order. Card ONE is the first letter.'])]);
    },
    onDone:()=>playScene('ch7Door')
  });
}
