// Tombo split rows, Tom + Boppy (boppy1 to boppy3). Beats from the LIVE B2_TOMBO_ANIM.boppy1 to boppy3 (engine/battle2-kind.js ~6106, ~6209, ~6307).
// Person frames hold no objects; objects are the standalone props the live animations draw.
module.exports = [
  { id: 'boppy1', name: 'You Hold the Net', rides: false,
    beat: 'A fishing lesson that turns into a big catch: Tom holds a landing net and will not keep it steady, then runs it low and heaves with Boppy, who casts, reels hard and crouches to look into the net complaining about his knees.',
    tom: [
      'Tom stands with both hands raised in front of him gripping nothing, his arms wobbling, a nervous squint.',
      'Tom steadies himself with both hands out in front, knees slightly bent, a tense careful face.',
      'Tom stands braced and ready with both hands held low and apart, gripping nothing, eyes forward.',
      'Tom runs forward bent low with both hands held down near the ground as if scooping, a determined face.',
      'Tom heaves upward with both arms swinging high and his mouth open in a strain.',
      'Tom stands upright with both hands held out in front of him gripping nothing and a proud grin, looking down.'],
    partner: [
      'Boppy stands with both hands held up in front of him gripping nothing, looking annoyed with a squint.',
      'Boppy throws both arms back and forward in a big overhead casting motion, leaning into it.',
      'Boppy leans far back with both hands cranking in front of his chest, a bent-back straining face.',
      'Boppy pulls hard with both hands held in front, his feet planted wide and his teeth gritted.',
      'Boppy hauls both arms back over his shoulder, leaning backward and straining.',
      'Boppy crouches low with one hand on his knee and a grimace, peering downward with a grumpy squint.'],
    objects: [
      ['A big landing net on a long pole', 'a long smooth wooden pole with a round metal hoop at the top holding a deep knotted mesh bag of pale green cord, held upright'],
      ['A fishing rod with a reel', 'a long slim bendy rod of dark glossy fiberglass with cork grips, a small silver spinning reel and thin metal line guides, standing upright with a fine clear line loosely hanging from the tip']] },
  { id: 'boppy2', name: 'Nobody Gets Past Us', rides: false,
    beat: 'Father and son play lawmen: Tom tosses Boppy a deputy cap and keys, Boppy becomes the Dep, flexes and points sternly, then shuts a cell door and spins the keys.',
    tom: [
      'Tom tosses both hands up and forward in an underhand throw, a dry smirk.',
      'Tom stands with his eyebrows raised, watching someone, his hands at his sides.',
      'Tom stands with his arms folded, biting his lip and trying not to laugh.',
      'Tom stands up straight at attention with his chin up and his hands at his sides.',
      'Tom stands with his arms folded and a proud look, eyes on something in front of him.',
      'Tom stands with his arms folded and a calm satisfied smile.'],
    partner: [
      'Boppy stands with both arms spread wide, hands open to catch, a hopeful grin.',
      'Boppy raises both hands to the top of his head as if snapping a cap on, a proud grin.',
      'Boppy flexes both arms in a strongman pose with his chin up and a fierce grin.',
      'Boppy points one stern finger forward with a serious lawman face.',
      'Boppy pushes one hand forward as if swinging a heavy door shut, his shoulder leaning into it.',
      'Boppy holds one hand up with a finger spinning in a small circle, his head tipped back and a smug grin.'],
    objects: [
      ['A navy deputy cap', 'a navy blue peaked cap with a stiff black brim, a small gold badge and a thin gold band, shown from a three-quarter view'],
      ['A ring of keys', 'a round brass key ring holding four old iron keys of different sizes, hanging flat'],
      ['A gray iron cell door', 'a tall rectangular door of thick gray iron bars set in a heavy riveted frame with a black lock plate and a brass keyhole, standing upright by itself']] },
  { id: 'boppy3', name: 'Garden Lesson', rides: false,
    beat: 'A garden lesson: Boppy teaches stake, hole, seedling, water, Tom plants his seedling upside down and gets corrected, then giant tomato vines grow and Boppy bites a red pepper.',
    tom: [
      'Tom stands with his hands clasped in front of him, listening with a polite attentive face.',
      'Tom kneels on one knee holding one hand out in front of him, closed around nothing, looking down.',
      'Tom kneels and pushes both hands down toward the ground, pleased with himself, a smug little smile.',
      'Tom kneels with a sheepish look and wide eyes, his hands lifted and open.',
      'Tom stands looking straight up with his mouth hanging open in amazement.',
      'Tom stands with one thumb raised and a small impressed smile.'],
    partner: [
      'Boppy points one finger forward with a stern teacher face, his other hand on his hip.',
      'Boppy tips one hand forward as if pouring from a can, his other hand on his hip, a focused look.',
      'Boppy stands with his hands on his hips, his head tilted and one eyebrow raised.',
      'Boppy bends over with both hands reaching down and turning something over, a long suffering sigh.',
      'Boppy stands looking straight up with his mouth hanging open in amazement.',
      'Boppy stands calmly taking a bite with one hand at his mouth, a calm face and a bead of sweat on his forehead.'],
    objects: [
      ['A raised garden bed', 'a low rectangular wooden planter box of weathered cedar boards with corner posts, filled to the brim with rich dark soil'],
      ['A tomato seedling', 'one small green tomato seedling with a pale thin stem, a few fuzzy leaves, and a little clump of dark soil around its roots, standing upright'],
      ['A wooden garden stake', 'a tall slim wooden stake with a pointed bottom and a flat top, a loop of green twine tied around the middle'],
      ['A blue watering can', 'a round galvanized watering can painted bright blue, a long spout with a rose head and a curved handle, resting on the ground'],
      ['A tall tomato vine', 'a tall twisting green tomato vine with many broad jagged leaves, curling tendrils, and several fat red tomatoes hanging from it, held up by a thin wooden stake'],
      ['A giant tomato', 'one huge glossy red tomato with a small green leafy cap on top and a soft highlight, sitting flat on its base'],
      ['A red cayenne pepper', 'one long curved glossy red cayenne pepper with a green stem and a wrinkled tip, lying on its side']] }
];
