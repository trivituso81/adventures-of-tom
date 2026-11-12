// Close-up screen art, batch 2, for the Art Library (tab Props, group "Close-ups"). Required by make-prompts.js.
// Tom 2026-11-12 15:35: "I'll build all the art first, then you continue." Master plan: claude/closeup-plan.md (rows 1 to 8), model: closeup-prompts.js.
// Parts method: a PLATE is one square painting with nothing that changes state; every moving or changing thing is a PART, alone and big.
// Plates carry no people, no hands, no characters, no painted words except where the plan says the generator paints them (the S and H cards).
// Row 8 (chapter 4 junction boxes) needs no entry here: it uses the approved prop-find-ch04-parts.
// Canon read before writing: CH19_KEEP (data/scenes-ch19.js), glplinth (data/maps-ch17.js), ch9DomeLock and ch8Lever (data/scenes.js), DL_K pedestal (data/maps-ch19.js).
const { sheet } = require('./dungeonfind-prompts.js');
const REF_KEY = 'art/grands.webp';
const KEEP_REF = 'art/raw/props/prop-find-ch19-v2.png';   // newest approved ch19 sheet: cell 4 gold squishy, 5 pink ribbon, 6 stopwatch, 7 first cup

const ART = `ART STYLE
- Painted by hand in the style of the attached painting: visible brushwork, matte painted surfaces, rich warm colors, crisp painted edges. Gently simplified, storybook-like shapes.
- No thick or black outlines. NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no glossy plastic look.
- No people, no hands, no faces, no characters, no creatures, no frame or border around the picture.
- Family friendly for children aged 6 and up.`;

// A plate: ONE square painting, close and straight on, filling the picture.
function plate(what, paint, light) {
  return `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet, a diagram or several states.

ATTACHED IMAGE
1) The finished painting of Deedee and Boppy's house from "The Adventures of Tom", a family role-playing game. Take only how it is painted: hand-brushed, matte painted surfaces, rich warm color. Paint only what is described below.

PAINT THIS ONE PICTURE
${what} It is a close-up, straight-on picture that fills the whole square. It is the still background of a close-up screen: the game will lay moving pieces on top of it, so it shows ONLY the fixed part and nothing that can change.
${paint}

${ART}
- ${light}
- No words, letters or numbers anywhere unless the description above says to paint them.`;
}

// ONE part alone, big, on a flat color so the game can cut it out.
function single(label, what, light) {
  return `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet or several states.

ATTACHED IMAGE
1) The finished painting of Deedee and Boppy's house from "The Adventures of Tom", a family role-playing game. Take only how it is painted: hand-brushed, matte painted surfaces, rich warm color. Paint only the object described below.

PAINT THIS ONE OBJECT
${label}: ${what}
- Exactly ONE object, alone, centered, large: it fills about 80 percent of the picture, with an even empty margin all round. Nothing else in the picture: no floor, no table, no shadow on a surface, no second copy, no background scenery.
- Background: one flat solid color, pure magenta #FF00FF, edge to edge, with no gradient and no magenta anywhere inside the object. The game cuts the object out of this color.

${ART}
- ${light}
- No words, letters or numbers anywhere unless the description above says to paint them.`;
}

const WARM = 'Warm golden light from the upper left, soft shadow falling to the lower right.';

// Parts sheets reuse the proven dungeon-finds sheet wording (4 x 4 grid, strict count and order).
function parts(label, items, refAddendum) {
  let p = sheet(label, items, true);
  if (refAddendum) p = p.replace('Paint only the objects listed below.', refAddendum + ' Paint only the objects listed below.');
  return p;
}

const entries = [
  // Row 1, chapter 13: the eleven coins melt the amber doorway (WATCH)
  { id: 'closeup-ch13-amber', tab: 'Props', group: 'Close-ups', title: 'Chapter 13 close-up: the amber wall, closed and whole (one square painting)', ar: '1:1', refs: [REF_KEY],
    prompt: plate('A wall of thick, clear, honey-colored amber glass seen close and straight on.',
`- The amber fills the whole picture: thick, glossy, sticky and honey-like on its surface, with soft drifting swirls and a few tiny trapped air bubbles deep inside. Warm light glows through it from behind, brightest in the middle and deeper orange toward the edges.
- Only in the very four corners and along the left and right edges, a little dark rough tunnel stone shows, framing the amber.
- The amber is completely CLOSED and WHOLE: no opening, no crack, no hole, no door shape, no coin, no drip, nothing in it or on it.`, 'Warm amber glow from behind the glass, with a faint golden highlight along the upper left of the glossy surface.') },
  { id: 'closeup-ch13-parts', tab: 'Props', group: 'Close-ups', title: 'Chapter 13 close-up: coin, hot coin, molten run, molten arch (4 parts, each alone)', ar: '1:1', refs: [REF_KEY],
    prompt: parts('the chapter 13 amber close-up, the coin and the molten gold pieces', [
      ['GOLD COIN', 'ONE plain old round gold coin seen straight from the front, worn and softly dented, with a plain beaded rim and a smooth blank face with no emblem, no picture and no letters. Dull warm gold, a little tarnished. Only the coin, alone.'],
      ['GOLD COIN, HOT', 'The same coin as cell 1, identical in size, shape and wear, but glowing white-hot yellow-orange as if it were heating, the metal brighter at the center and a soft warm glow just around its rim. Only the coin, alone.'],
      ['MOLTEN GOLD RUN', 'One long vertical ribbon of molten liquid gold running down, thick and honey-like, wider at the top with a fat rounded drip hanging at the bottom, bright yellow with orange edges. It is tall and narrow and fills the cell from top to bottom. Only the run of gold, alone.'],
      ['MOLTEN GOLD ARCH', 'ONLY an arch-shaped OUTLINE: a tall narrow doorway shape, straight sides and a rounded top, drawn as a thick band of bright molten gold, with the inside of the arch completely EMPTY and see-through. Slightly drippy at the bottom ends. Alone, standing upright, about twice as tall as wide.'],
    ]) },
  // Row 2, chapter 19: setting each keepsake on its pedestal (PLACE)
  { id: 'closeup-ch19-pedestal', tab: 'Props', group: 'Close-ups', title: 'Chapter 19 close-up: the brass pedestal top with its dent, empty (one square painting)', ar: '1:1', refs: [REF_KEY],
    prompt: plate('The top of a small round brass pedestal, seen from slightly above and close.',
`- The polished brass top fills most of the picture, slightly worn and dusty, with a thin raised rim all round.
- In the exact middle is ONE soft round dent, shallow and smooth, about one third of the width of the picture, with a slightly darker bronze inside so it clearly reads as a hollow waiting for something small to be set in it.
- Around the pedestal, dim dusty light and soft shadow of an old post office sorting room: only a blurred dark wood floor and faint motes of dust in the air at the edges.
- The dent is completely EMPTY: nothing in it, nothing on the pedestal.`, 'Dim, soft, dusty light from the upper left, just enough to catch the brass rim; the rest of the picture is shadowy.') },
  { id: 'closeup-ch19-keepsakes', tab: 'Props', group: 'Close-ups', title: 'Chapter 19 close-up: the four keepsakes (gold squishy, pink ribbon, stopwatch, first cup; 4 parts)', ar: '1:1', refs: [REF_KEY, KEEP_REF],
    prompt: parts('the chapter 19 pedestal close-up, the four keepsakes', [
      ['GRACE\'S GOLD SQUISHY', 'ONE soft squishy toy shaped like a soup dumpling with pleats on top, made entirely of sparkling diamond GOLD: a bright metallic yellow gold surface with tiny glittering diamond facets and glints. Match the gold squishy in cell 4 of the second attached picture exactly. Only the squishy, alone.'],
      ['ROSE\'S PINK RIBBON', 'A pink satin hair ribbon tied in a floppy bow with two trailing tails. Match the ribbon in cell 5 of the second attached picture exactly. Only the ribbon, alone.'],
      ['AMY\'S STOPWATCH', 'A silver round stopwatch with a crown button on top, a white face with a red second hand and a short loop of cord. Match the stopwatch in cell 6 of the second attached picture exactly. Only the stopwatch, alone.'],
      ['THE FIRST CUP', 'A small lopsided handmade pottery cup in speckled cream clay with an uneven blue glaze and a thumbprint on the side, empty and plain, with no crack and no gold. Match the cup in cell 7 of the second attached picture exactly. Only the cup, alone.'],
    ], 'A second attached image is the approved prop sheet for this chapter; cells 4 to 7 hold the four keepsakes. Copy each keepsake from its cell exactly, only larger and cleaner.') },
  // Row 3, chapter 17: the snow globe in the Vault (REVEAL)
  { id: 'closeup-ch17-globe', tab: 'Props', group: 'Close-ups', title: 'Chapter 17 close-up: the Vault snow globe holding the Square (one object, large)', ar: '1:1', refs: [REF_KEY],
    prompt: single('THE SNOW GLOBE', `A big clear glass snow globe the size of a beach ball, sitting on a short round glass plinth, seen straight from the front at eye level. Inside the glass is the town Square, very small and exact, like a tiny model: a white stone fountain with a little water in the middle of a round paved plaza, a small old brick library with a clock above its door beside it, and a tiny camera on a three-legged tripod standing on the paving. Small green trees at the edge of the plaza. A soft warm amber light glows inside from the base of the model. A few tiny white snowflakes drift in the glass, not many. On top of the globe sits a round gold cable fitting, a gold cap with a short thick gold cable stub standing up from it, all inside the picture margin. The glass is clear and shows a soft bright highlight on its upper left. The plinth is clear glass with a faint green edge.`, 'Warm golden light from the upper left, with the amber glow inside the globe.') },
  // Row 4, chapter 7: spelling SHH on the Reading Room doors (ORDERED)
  { id: 'closeup-ch7-doors', tab: 'Props', group: 'Close-ups', title: 'Chapter 7 close-up: the Reading Room doors with three empty brass card holders (one square painting)', ar: '1:1', refs: [REF_KEY],
    prompt: plate('The tall dark wooden double doors of a quiet old library reading room, seen close and straight on.',
`- Two tall doors meeting at a thin center seam, dark polished library wood with raised panels, fine brass trim and hinges. The doors fill the picture; only a little stone wall shows at the very edges.
- Across the middle, in one straight row spanning both doors, are THREE identical empty brass card holders: small upright brass frames with a lip at the bottom, each the size of a library catalog card, evenly spaced, with the middle holder exactly on the center seam. Each is big and clear and is the brightest thing in the picture.
- All three holders are completely EMPTY: no card, no letter, no paper in or near any of them.
- Count check before you finish: exactly three holders in a row.`, 'Soft warm lamplight from the upper left, so the brass glints and the wood falls into dim shadow on the lower right.') },
  { id: 'closeup-ch7-cards', tab: 'Props', group: 'Close-ups', title: 'Chapter 7 close-up: the S catalog card and the H catalog card (2 parts, each alone)', ar: '1:1', refs: [REF_KEY],
    prompt: parts('the chapter 7 Reading Room close-up, the two catalog cards', [
      ['CATALOG CARD S', 'A cream library catalog card standing upright, wider than tall, with a small round hole punched near the bottom edge, slightly worn corners and a faint ruled line near the top. In the middle is ONE huge bold typed letter S in dark ink, and no other text at all. Only the card, alone.'],
      ['CATALOG CARD H', 'The same card as cell 1, identical in shape, size, color, hole and wear, but the one huge bold typed letter in the middle is an H, and no other text at all. Only the card, alone.'],
    ]) },
  // Row 5, chapter 9: the moonbeam reaches the Dome lock (WATCH)
  { id: 'closeup-ch9-lock', tab: 'Props', group: 'Close-ups', title: 'Chapter 9 close-up: the round silver moon lock on the Dome doors, dark and unlit (one square painting)', ar: '1:1', refs: [REF_KEY],
    prompt: plate('The round silver lock on the doors of a moon club\'s dome, seen close and straight on.',
`- A big round lock shaped like a full moon, polished cold silver with soft craters pressed into its surface and a raised ring round its edge, filling about two thirds of the picture and centered.
- A crescent moon is worked into the middle of the lock as a recessed groove, slightly darker than the rest, like a keyhole that is waiting for light.
- The lock is dark and unlit: dull, cold and still, with no glow and no shine inside the groove. NO beam of light anywhere (the game draws the beam).
- Round it, deep night-blue club light on a dark blue door surface with a few faint silver star-shaped studs near the corners.`, 'Cool, dim night-blue club light from the upper left with a soft silver glint on the rim; everything else is quiet and dark.') },
  // Row 6, chapter 5: setting each hallway clock to 7:00 (DIAL)
  { id: 'closeup-ch5-clock', tab: 'Props', group: 'Close-ups', title: 'Chapter 5 close-up: a school hallway clock face with NO hands (one square painting)', ar: '1:1', refs: [REF_KEY],
    prompt: plate('A round school hallway wall clock, seen close and straight on.',
`- A plain round white clock face with a ring of plain, bold black numbers from 1 to 12 in their normal places, and a ring of small black tick marks outside the numbers. A sturdy steel rim all round. The clock fills most of the picture and is centered.
- Behind it, an institutional school hallway wall: pale painted cinder block in a soft cream-green, a little scuffed.
- In the exact center of the face is a small empty round pivot hole where the hands would attach.
- The clock has NO HANDS at all: no hour hand, no minute hand, no second hand, nothing across the face.`, 'Soft, even daylight from the upper left, with a small glint on the steel rim.') },
  { id: 'closeup-ch5-hands', tab: 'Props', group: 'Close-ups', title: 'Chapter 5 close-up: the hour hand and the minute hand (2 parts, each alone)', ar: '1:1', refs: [REF_KEY],
    prompt: parts('the chapter 5 hallway clock close-up, the two clock hands', [
      ['HOUR HAND', 'ONE black clock hour hand alone, pointing straight up: a short, thick black pointer with a rounded spade-shaped tip, and a round pivot hole at its bottom end. Perfectly vertical, perfectly straight. Only the hand, alone, with no clock and no face.'],
      ['MINUTE HAND', 'ONE black clock minute hand alone, pointing straight up: a long, thinner black pointer with a pointed tip, about one and a half times as long as the hour hand in cell 1, with a round pivot hole at its bottom end in the same size as in cell 1. Perfectly vertical, perfectly straight. Only the hand, alone, with no clock and no face.'],
    ]) },
  // Row 7, chapter 8: the turntable lever (LEVER)
  { id: 'closeup-ch8-lever', tab: 'Props', group: 'Close-ups', title: 'Chapter 8 close-up: the turntable lever housing, quadrant and slot, no lever arm (one square painting)', ar: '1:1', refs: [REF_KEY],
    prompt: plate('The turntable lever housing inside an old railway car barn, seen close and straight on.',
`- A heavy black iron floor quadrant: a thick plate in the shape of a quarter circle, bolted down with big round rivets, set on a dark worn plank floor that fills the lower part of the picture and a plain old brick wall behind it.
- A long curved slot is cut through the iron plate along its arc, running from left to right in a smooth arch, wide enough for a thick lever to slide along it.
- Two brass end plates cap the two ends of the slot, one at the left end and one at the right end, each stamped with a plain round bolt and nothing else.
- The slot is EMPTY: there is NO lever, NO handle and NO arm in it or anywhere in the picture. A small round pivot hub with a brass cap sits at the bottom center where the lever arm will be fitted.
- Count check before you finish: exactly two brass end plates and one pivot hub.`, 'Warm lantern light from the upper left, so the iron and brass catch highlights and the barn fades to dim shadow on the lower right.') },
  { id: 'closeup-ch8-lever-arm', tab: 'Props', group: 'Close-ups', title: 'Chapter 8 close-up: the turntable lever arm with its grip (one object, alone, upright)', ar: '1:1', refs: [REF_KEY],
    prompt: single('THE LEVER ARM', 'A big heavy black iron railway lever arm standing perfectly upright and straight: a thick round iron bar with a wide round pivot eye at its bottom end and a chunky rounded grip at the top, the grip wrapped in worn dark leather with a bright red painted band round its middle. Worn, solid and old. Only the lever arm, alone, with no housing and no base.', 'Warm lantern light from the upper left, with a small bright glint along the iron.') },
];

module.exports = { entries };
