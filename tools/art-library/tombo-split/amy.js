// Amy Tombo rows (split sheets). Live anims: engine/battle2-kind.js amy1 (~5611), amy2 (~5736), amy3 (~5860).
// amy1 (I Called It!) draws no standalone props: the rock paper scissors hands are drawn in code, so it has no objects.
const KID_TOM = 'Little Tom, a small boy with a smooth, round, hairless child\'s face (no beard, no stubble, nothing grown-up in his face), a full head of hair, a yellow striped tee, denim shorts and red sneakers, as tall as Grace';
const KID_AMY = 'little Amy, as tall as Rose, with pigtails tied with bows and a teal dress';
module.exports = [
  { id: 'amy1', name: 'I Called It!', beat: 'Tom and Amy lunge for the same spot, bicker, tie at rock paper scissors, then charge together.', rides: false, objectsOnly: true, tom: [], partner: [], objects: [] },
  { id: 'amy2', name: 'Ymamot Creation', rides: false,
    beat: 'A childhood flashback. ' + KID_TOM + ', and ' + KID_AMY + '. Both are drawn as children, never as grown-ups.',
    tom: [
      'Little Tom stands with both hands on an imaginary counter edge at chest height, looking down with wide eyes.',
      'Little Tom tips one empty closed hand over as if pouring something from a bottle, tongue poking out in concentration.',
      'Little Tom tilts both empty hands forward as if pouring from a box, watching it fall with a delighted grin.',
      'Little Tom stirs in a small circle with one empty hand gripped around nothing, leaning in with a focused face.',
      'Little Tom stands with his fists on his hips and his chin up, proud, watching.',
      'Little Tom braces with both empty hands held at shoulder height and swings his arms back, laughing, ready to sling.',
    ],
    partner: [
      'Little Amy stands with both hands on an imaginary counter edge at chest height, looking down with wide eyes.',
      'Little Amy holds one empty hand out at arm\'s length, pinching her nose with the other, scrunching her face in disgust.',
      'Little Amy squeezes both empty hands together in front of her chest, her face scrunched tight.',
      'Little Amy lets go of something small with one hand held high, then grips an empty hand and stirs in a circle, proud.',
      'Little Amy points ahead with one arm straight out and her chin up, announcing something proudly.',
      'Little Amy braces with both empty hands held at shoulder height and swings her arms back, laughing, ready to sling.',
    ],
    objects: [
      ['A kitchen counter', 'a low wooden kitchen counter with a pale butcher-block top, two plain cabinet doors on the front and a slim base, about three feet wide in proportion'],
      ['A giant mixing bowl', 'a very large round stainless steel mixing bowl with a rolled rim, empty, tilted slightly so the inside shows'],
      ['A ketchup bottle', 'a red plastic squeeze bottle with a white flip cap and a plain red body, no label and no printing'],
      ['A cereal box', 'a tall rectangular cardboard cereal box in cheerful yellow and orange with plain colored panels, no pictures, no text, no letters'],
      ['A mustard bottle', 'a yellow plastic squeeze bottle with a pointed nozzle cap, plain body, no label and no printing'],
      ['A pickle jar', 'a round glass jar with a green metal lid, full of green pickles in pale green brine, plain glass with no label'],
      ['A whole lemon', 'one plump yellow lemon with a small green leaf at the stem and a dimpled skin'],
      ['A lone gym sock', 'one white cotton gym sock with two thin blue stripes at the cuff, slightly stretched and crumpled as if used'],
    ] },
  { id: 'amy3', name: 'Knock It Off!', rides: false,
    beat: 'A childhood flashback. ' + KID_TOM + ', and ' + KID_AMY + '. Both are drawn as children, never as grown-ups.',
    tom: [
      'Little Tom sits on the ground with his arms crossed and a sulky glare, looking to one side.',
      'Little Tom points one finger ahead with a tattling frown, his brow low.',
      'Little Tom ducks low with both arms over his head, eyes squeezed shut.',
      'Little Tom swings both empty hands in a big arc across his body as if swinging something soft, mouth open in a yell.',
      'Little Tom spins off balance with his arms flung out and both feet off the ground, tumbling.',
      'Little Tom freezes mid-swing with both hands raised over one shoulder, wide-eyed and looking off to one side.',
    ],
    partner: [
      'Little Amy sits on the ground with her arms crossed and a sulky glare, looking to one side.',
      'Little Amy points one finger ahead and scowls, her chin out.',
      'Little Amy raises both empty hands high over her head as if lifting something, smirking.',
      'Little Amy ducks low, bending at the waist with one arm over her head.',
      'Little Amy spins off balance with her arms flung out and both feet off the ground, tumbling.',
      'Little Amy freezes mid-swing with both hands raised over one shoulder, wide-eyed and looking off to one side.',
    ],
    objects: [
      ['A purple couch', 'a plump three-seat living-room couch in deep purple fabric with rounded arms, two seat cushions and a back cushion, short wooden legs, empty'],
      ['A cream pillow', 'a plump square bed pillow in plain cream cotton with soft rounded corners, slightly dented in the middle, no pattern'],
      ['A blue cushion', 'a square sofa cushion in plain medium blue fabric with a small piped edge and soft corners'],
      ['A pink slipper', 'a single soft fuzzy pink house slipper with a closed rounded toe and a thin sole'],
      ['A TV remote control', 'a slim black plastic TV remote with a grid of small round buttons and one red button, no printing on it'],
      ['A floor lamp', 'a tall brass floor lamp with a slim pole, a round weighted base and a cream drum shade, switched off'],
    ] },
];
