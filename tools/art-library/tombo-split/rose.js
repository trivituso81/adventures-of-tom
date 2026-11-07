// Tombo split rows: Tom + Rose (rose1, rose2 approved pairs: objects only; rose3 full). Objects come from the live B2_TOMBO_ANIM rows (engine/battle2-kind.js 449, 1492, 1883).
module.exports = [
  { id: 'rose1', name: 'Double-Decker Airplane', beat: 'Tom hoists Rose onto his shoulders, then sprints in a wide banking loop with his arms out like wings while Rose leans all the way down with one finger out.', rides: true, objectsOnly: true, tom: [], partner: [],
    objects: [
      ['A toy biplane wing set', 'two long rounded red wings, one slightly shorter than the other, each with cream stripes across it, joined by four slim wooden struts that hold the upper wing above the lower wing, a small round white propeller disc at the front of the lower wing'],
      ['A pair of aviator goggles', 'two round brass-rimmed lenses with a tinted amber tint, joined by a nose bridge, with a soft brown leather strap lying in a loop, shown flat and facing forward']
    ], reuses: '' },
  { id: 'rose2', name: 'Seat 1A Stowaway', beat: 'Tom wheels a blue carry-on suitcase along very casually, then Rose pops out of it with her plush lamb held high.', rides: false, objectsOnly: true, tom: [], partner: [],
    objects: [
      ['A blue carry-on suitcase', 'a rolling carry-on suitcase standing upright, deep blue hard shell with soft ridges, silver corner guards, a telescoping silver pull handle fully raised, two small black wheels, a small brass latch on the front'],
      ['A small plush lamb toy', 'a soft cream-white plush lamb with a curly fluffy wool body, a pink nose, little pink ears, four stubby legs, sitting upright, a tiny pink bow on its neck']
    ], reuses: '' },
  { id: 'rose3', name: 'Headphones in the Dark', beat: 'Rose sits happily listening, Tom walks over and lifts her onto his shoulders, and they reach up together and cheer.', rides: true, tom: [
      'Tom stands with both hands in his pockets, looking down at the ground in front of him with a soft smile.',
      'Tom walks forward with one hand held out, palm up, and a warm smile.',
      'Tom bends slightly at the knees and lifts upward with both hands out at his sides at waist height, laughing, as if lifting a small child.',
      'Tom stands with Rose sitting on his shoulders, both of his hands holding her ankles, both of them grinning out at the viewer.',
      'Tom stands with Rose on his shoulders, one arm straight up with the index finger pointing up, looking up, with Rose reaching the same way.',
      'Tom stands with Rose on his shoulders, pumping one fist in a cheer, beaming, while Rose throws both arms up.'
    ], partner: [
      'Rose sits cross-legged directly on the ground with both hands pressed against the sides of her head, eyes closed in a blissful smile, swaying a little.',
      'Rose sits cross-legged on the ground with both hands still pressed against the sides of her head, opening her eyes and looking up with a delighted face.',
      'Rose stands up on tiptoe with both arms reaching high, laughing, ready to be lifted.',
      'Rose stands with both hands pressed against the sides of her head, bouncing a little, grinning out at the viewer.',
      'Rose stands with one arm stretched straight up and her index finger pointing up, her face lifted, concentrating happily.',
      'Rose jumps with both arms thrown up high and her mouth wide open in a cheer.'
    ],
    objects: [
      ['A pair of big silver over-ear headphones', 'a wide curved silver headband with a soft padded underside, two large round silver ear cups with plush dark gray cushions, small hinge arms joining the cups to the band, shown standing upright three-quarter view']
    ], reuses: '' }
];
