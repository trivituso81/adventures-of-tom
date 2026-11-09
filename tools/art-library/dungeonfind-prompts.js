// Find-it object sheets for the Art Library (tab Props, group "Dungeon finds"). Required by make-prompts.js.
// One entry = one 4 x 4 sheet (at most 11 objects). One sheet per chapter dungeon (chapters 11 and 13 share one).
// These are map OVERLAYS (Tom, 2026-11-01): things the player has to find, touch or collect. They are separate transparent pictures the game
// draws on top of the painted dungeon at the tile where the object stands, so they can appear, change state and disappear.
// The object list comes from reading the map and scene code (docs/DUNGEON_FINDS.md has the table with flags and tiles).
// Only the style key is attached.
const REF_KEY = 'docs/reference/style_key_v1.png';

const SHEETS = [
  { id: 'ch03', label: 'Chapter 3, Sundial Hollow', title: 'Chapter 3 Sundial Hollow', items: [
    ['SUNDIAL WITH THE COIN', 'A squat round weathered grey stone sundial with a small carved crescent moon crest on its face and a bronze pointer. A shiny gold hourglass coin sits in a round socket in the middle of the dial. The coin is the brightest thing on the object.'],
    ['SUNDIAL, EMPTY SOCKET', 'The same sundial as cell 1, identical in shape, size, stone, crest and pointer, but the round socket in the middle is empty and dark and there is no coin.'],
    ['GOLD HOURGLASS COIN', 'One big round gold coin with a bold hourglass embossed in the middle and a beaded rim, standing on its edge at a slight tilt, bright and shiny.'],
  ] },
  { id: 'ch04', label: 'Chapter 4, Soundstage 7', title: 'Chapter 4 Soundstage 7', items: [
    ['BLUE JUNCTION BOX, OFF', 'A grey steel wall box with a thick BLUE stripe across its front, one chunky switch lever pointing down, and a small round lamp that is dark.'],
    ['BLUE JUNCTION BOX, ON', 'The same box as cell 1, identical in every way, but the switch lever points up and the small round lamp is lit bright blue.'],
    ['AMBER JUNCTION BOX, OFF', 'The same box shape as cell 1 but with a thick AMBER stripe, the switch lever pointing down and the small round lamp dark.'],
    ['AMBER JUNCTION BOX, ON', 'The same box as cell 3, identical in every way, but the switch lever points up and the small round lamp is lit bright amber.'],
    ['RED JUNCTION BOX, OFF', 'The same box shape as cell 1 but with a thick RED stripe, the switch lever pointing down and the small round lamp dark.'],
    ['RED JUNCTION BOX, ON', 'The same box as cell 5, identical in every way, but the switch lever points up and the small round lamp is lit bright red.'],
    ['LIGHT RIG, DEAD', 'A wide black steel lighting bar with three big round stage lamps in a row. The colored gel covers on the lamps are blue, amber and red, in that order. The lamps are dark and three thick cables hang down from the bar.'],
    ['LIGHT RIG, LIT', 'The same light rig as cell 7, identical in shape, size and gel colors, but all three lamps shine bright, blue, amber and red, and the cables are taped down neatly.'],
  ] },
  { id: 'ch05', label: 'Chapter 5, Long Island Elementary', title: 'Chapter 5 Long Island Elementary', items: [
    ['ART ROOM CLOCK, STUCK', 'A round school wall clock with a bright orange rim dotted with tiny paint splashes, white face, bold black numbers and black hands that point at a wrong time, about twenty past four.'],
    ['MUSIC ROOM CLOCK, STUCK', 'The same round clock shape and size as cell 1, but with a purple rim decorated with tiny music notes, and hands pointing at the same wrong time.'],
    ['GYM CLOCK, STUCK', 'The same round clock shape and size as cell 1, but with a green rim with a pattern of tiny stripes like a gym floor, and hands pointing at the same wrong time.'],
    ['ART ROOM CLOCK, SET', 'The same clock as cell 1, identical in every way, but the hour hand points at the 7 and the minute hand points straight up at the 12, and a small gold glint shines on the rim.'],
    ['MUSIC ROOM CLOCK, SET', 'The same clock as cell 2, identical in every way, but the hour hand points at the 7 and the minute hand points straight up at the 12, and a small gold glint shines on the rim.'],
    ['GYM CLOCK, SET', 'The same clock as cell 3, identical in every way, but the hour hand points at the 7 and the minute hand points straight up at the 12, and a small gold glint shines on the rim.'],
    ['CAFETORIUM DOORS, LOCKED', 'A pair of wide cream school double doors with round porthole windows and steel push bars, shut tight, with a big brass padlock hanging on a chain looped through the handles. The padlock is the brightest part. Seen from the front.'],
    ['STAFF FRIDGE', 'A tall old cream staff room refrigerator with its door open a little, warm light spilling out of the gap and one plate of cookies visible on a shelf inside. Seen from the front.'],
    ['PLATE OF TREATS', 'A round paper plate piled with golden cookies and covered in clear wrap, with a small handwritten note tucked under it that reads exactly "FOR EVERYONE, LOVE DEEDEE".'],
  ] },
  { id: 'ch06', label: 'Chapter 6, Old Oak Park', title: 'Chapter 6 Old Oak Park', items: [
    ['FRESH DIRT MOUND, SANDBOX', 'A small rounded pile of pale yellow play sand with a few brown acorn shells around its base and one small round paw print pressed into the top. It sits on a ragged patch of its own pale sand about one and a half times the mound width.'],
    ['FRESH DIRT MOUND, GARDEN', 'A small rounded pile of dark brown garden soil with one crushed green tomato leaf at its side and one small round paw print pressed into the top. It sits on a ragged patch of its own dark soil about one and a half times the mound width.'],
    ['FRESH DIRT MOUND, LAWN', 'A small rounded pile of medium brown dirt with torn green grass tufts around its base and one small round paw print pressed into the top. It sits on a ragged patch of green lawn about one and a half times the mound width.'],
    ['DUG HOLE, SANDBOX', 'A round hole dug into pale yellow play sand, the dark opening clearly visible, a ring of flung sand around its rim and one acorn cap beside it. Same sand patch size and color as cell 1, with no mound.'],
    ['DUG HOLE, GARDEN', 'A round hole dug into dark brown garden soil, the dark opening clearly visible, loose soil flung around its rim and one small acorn beside it. Same soil patch size and color as cell 2, with no mound.'],
    ['DUG HOLE, LAWN', 'A round hole dug into a green lawn, the dark opening clearly visible, a ring of brown dirt and torn grass tufts around its rim. Same lawn patch size and color as cell 3, with no mound.'],
    ['LITTLE OAK DOOR', 'A small round wooden door of dark weathered planks with iron strap hinges, set into a section of rough gnarled tree bark about twice the door width, with a few small roots curling at the base. A big brass acorn shaped knocker hangs in the middle and is the brightest part. The door is closed. Seen from the front.'],
    ['KNOCK SCRAP', 'A torn flat scrap of pale tree bark with three small scratched acorn marks in a row, one large and clearly readable.'],
    ['CORKBOARD OF PLANS', 'A big cork bulletin board in a wooden frame covered with pinned paper maps, tiny acorn drawings and red yarn running between the pins. One red pin head is the brightest part. No readable words. Seen from the front.'],
    ['BUCKET ON A ROPE', 'A round wooden bucket with iron bands hanging from a thick coil of rope that runs up out of the top of the picture, a few acorns inside it.'],
    ['ACORN HOARD JAR', 'A large glass jar with a cork lid beside it, packed to the top with acorns, with one shiny gold bottle cap resting on the pile.'],
  ] },
  { id: 'ch07', label: 'Chapter 7, The Stacks', title: 'Chapter 7 The Stacks', items: [
    ['CATALOG CARD S', 'A cream library index card lying flat, with a worn hole punched near the bottom edge, one huge bold red letter S in the middle and a line of tiny typed text across the top that reads exactly "SECRETS OF THE SOUP DUMPLING".'],
    ['CATALOG CARD H, WHISPER', 'The same card shape and size as cell 1 with a huge bold red letter H in the middle and a line of tiny typed text across the top that reads exactly "HOW TO WHISPER, VOLUME 2".'],
    ['CATALOG CARD H, LAMBY', 'The same card shape and size as cell 1 with a huge bold red letter H in the middle and a line of tiny typed text across the top that reads exactly "HUSH, LITTLE LAMBY".'],
    ['READING ROOM DOORS', 'A pair of tall dark wooden double doors with an arched top and brass trim, shut. Above them is a small brass plate reading exactly "READING ROOM". In the center is a brass lock shaped like a card catalog drawer with three small card slots in a row, and the slots are the brightest part. Seen from the front.'],
    ['STORY TIME CHAIR', 'A large wooden rocking chair with curved rockers and a thick cushion in warm red and cream, a woven basket of picture books beside it and one picture book lying open on the cushion with colorful pages.'],
    ['STAFF DOOR', 'A plain narrow green door in a pale wall panel with a brass handle and a small brass plate reading exactly "STAFF ONLY". Seen from the front.'],
  ] },
  { id: 'ch08', label: 'Chapter 8, Car Barn and Boiler Room', title: 'Chapter 8 Car Barn and Boiler Room', items: [
    ['PILOT LIGHT, PAINT SHOP', 'A small brass wall mounted gas pilot lamp with a glass front and a tiny steady blue and orange flame inside, with a bright red painted housing.'],
    ['PILOT LIGHT, WORKSHOP', 'The same pilot lamp as cell 1 in shape and size, with the same tiny flame, but with a steel blue painted housing.'],
    ['PILOT LIGHT, LUNCHROOM', 'The same pilot lamp as cell 1 in shape and size, with the same tiny flame, but with a sunny yellow painted housing.'],
    ['TURNTABLE MOTOR', 'A big squat cast iron electric motor painted dark green on a heavy steel base, with a thick round coupling on top, a fat brass cap and two thick cables. A big red start button on the front is the brightest part.'],
    ['TURNTABLE LEVER, UPRIGHT', 'A tall iron floor lever with a round red knob on top, standing straight up out of a slotted steel base plate.'],
    ['TURNTABLE LEVER, PULLED', 'The same lever and base plate as cell 5, identical in every way, but the lever is pulled all the way down toward the viewer.'],
    ['LUNCH PAIL', 'A dented black metal lunch pail with a domed lid, a steel latch, a wire handle standing up and one corner of a checked napkin peeking out.'],
  ] },
  { id: 'ch09', label: 'Chapter 9, The Moon Club', title: 'Chapter 9 The Moon Club', items: [
    ['MIRROR STAND, TURNED', 'A tall round mirror in a thick brass ring, on a short pedestal base with a small hand wheel, the mirror turned at a 45 degree angle so it shows a bright reflected strip of moonlight. The hand wheel is the brightest part.'],
    ['MIRROR STAND, TURNED AGAIN', 'The same mirror stand as cell 1, identical in every way, but the mirror ring is turned a quarter turn further, so it faces the opposite diagonal.'],
    ['LITTLE SILVER DOOR', 'A small round silver door with a crescent moon crest in the middle, riveted trim and a small round silver knob, set in a short curved section of dark blue wall. Seen from the front.'],
    ['DOME DOORS', 'A tall pair of dark blue double doors scattered with small silver stars, shut, with a round silver moon shaped lock plate in the center. The lock plate is the brightest part. Seen from the front.'],
    ['JUKEBOX', 'A chunky rounded jukebox with a warm amber lit arch, chrome trim, a row of colored song buttons and a record visible behind curved glass.'],
  ] },
  { id: 'ch10', strict: true, label: 'Chapter 10, Terminal Zero', title: 'Chapter 10 Terminal Zero', items: [
    ['GATE CLOCK, NO HANDS', 'A large round airport wall clock with a white face and bold black numbers 1 to 12, all clear and correct, and a small gold peg in the middle, with no hands at all. Seven small round coin slots, each a dark hole with a bright gold rim, are spaced evenly around the outer edge of the face like hour marks, and one bigger round coin slot sits in the center below the peg. The eight slots are the brightest part and must be clearly visible. Seen from the front.'],
    ['CLOCK HAND, HOUR', 'ONE short thick black clock hand with a spade shaped tip, lying flat as a separate piece with a small round hole at the base. Only the hand, alone, with no clock face behind it.'],
    ['CLOCK HAND, MINUTE', 'ONE long slim black clock hand with a pointed tip, lying flat as a separate piece with a small round hole at the base. Same thickness style as cell 2. Only the hand, alone, with no clock face behind it.'],
    ['CLOCK HAND, SECOND', 'ONE very long thin red clock hand with a small round counterweight on its tail, lying flat as a separate piece with a small round hole near the tail. Only the hand, alone, with no clock face behind it.'],
    ['GATE LOCK DOORS', 'A pair of tall steel and cream gate doors, shut, with a big round brass lock plate in the center. Around the plate is a ring of seven small round coin slots, each a dark hole with a bright gold rim, and one more coin slot sits in the middle of the plate, eight slots in all. The slots are the brightest part and must be clearly visible. Seen from the front.'],
    ['PHOTO BOOTH', 'A narrow upright photo booth with a red curtain half drawn, a small round stool visible inside and a small sign on top reading exactly "PHOTOS". Seen from the front.'],
  ] },
  { id: 'ch11-13', strict: true, label: 'Chapters 11 and 13, Endless Concourse and Sub-Rail', title: 'Chapters 11 and 13 Concourse and Sub-Rail', items: [
    ['LOST AND FOUND DOOR', 'A small cream door with a round brass handle and a brass plate reading exactly "LOST AND FOUND", with a cardboard box beside it spilling a scarf, a mitten and the handle of an umbrella. Seen from the front.'],
    ['GATE INFINITY DOORS', 'A huge pair of deep navy double doors with a big gold sideways figure eight symbol across both doors and a warm gold light line along the seam where they meet. Seen from the front.'],
    ['AMBER WALL, GLASS DOORWAY', 'A tall section of solid glowing amber colored wall that fills the cell from top to bottom and extends well to the left and right of a tall doorway shaped panel of pale cyan tinted clear glass set into it, with white glare streaks across the glass so the glass is clearly filled in and never empty, shut tight in a thin brass frame. No part of the wall or glass is pink, magenta, red or crimson. Seen from the front.'],
    ['AMBER WALL, GOLD DOORWAY', 'The same amber wall section as cell 3, identical in every way (same wall, same frame, same size), but the glass panel has melted away: where the glass was is now an open archway filled with a warm dark golden glow, with thick golden drips running down from the top and sides of the frame. No part of it is pink, magenta, red or crimson.'],
  ] },
  { id: 'ch17', label: 'Chapter 17, Glass Tower', title: 'Chapter 17 Glass Tower', items: [
    ['SHELF CASE, DUNMORE', 'A wide steel archive shelf with a glass fronted case holding a tiny amber lit town of snug brick shops with a clock tower in the middle.'],
    ['SHELF CASE, TALLULAH FALLS', 'The same shelf and glass case as cell 1, identical in shape and size, but the tiny amber lit town inside is a little waterfall with a mill wheel.'],
    ['SHELF CASE, CEDAR HOLLOW', 'The same shelf and glass case as cell 1, identical in shape and size, but the tiny amber lit town inside is a few log cabins among cedar trees.'],
    ['SHELF CASE, PORT GILLY', 'The same shelf and glass case as cell 1, identical in shape and size, but the tiny amber lit town inside is a harbor with fishing boats and a small lighthouse.'],
    ['SHELF CASE, HICKORY BEND', 'The same shelf and glass case as cell 1, identical in shape and size, but the tiny amber lit town inside is a farm town with a red barn and a windmill.'],
    ['SHELF CASE, LOWER BRIGHTWATER', 'The same shelf and glass case as cell 1, identical in shape and size, but the tiny amber lit town inside is riverside houses with a small bridge.'],
    ['SERVICE HATCH', 'A square steel hatch in a grey wall panel with a round wheel handle in the middle and a bold painted number 30 above it. The wheel handle is the brightest part. Seen from the front.'],
    ['SEALED DOOR', 'A tall grey steel door, shut, with six round amber padlock shaped locks in a row across the middle. The locks are the brightest part. Seen from the front.'],
    ['SNOW GLOBE ON A PLINTH', 'A big glass snow globe holding a tiny seaside town with a small round green park and a white fountain, sitting on a tall glass plinth.'],
  ] },
  { id: 'ch19', strict: true, label: 'Chapter 19, Dead-Letter Office', title: 'Chapter 19 Dead-Letter Office', items: [
    ['MEMORY PAGE, LIT', 'One loose sheet of paper lying flat with handwritten lines and a small drawn heart, its edges tinted warm gold.'],
    ['MEMORY PAGE, FADED', 'The same page as cell 1, identical in shape, size and handwriting, but faded to dim blue grey and the edges are plain with no gold.'],
    ['EMPTY PEDESTAL', 'A small round stone pedestal with a plush dark red cushion on top, empty.'],
    ['GOLD SQUISHY KEEPSAKE', 'ONE soft squishy toy shaped like a soup dumpling with pleats on top, made entirely of sparkling diamond GOLD: a bright metallic yellow gold surface with tiny glittering diamond facets and glints. It is clearly gold and never beige, tan or cream.'],
    ['PINK RIBBON KEEPSAKE', 'A pink satin hair ribbon tied in a floppy bow with two trailing tails.'],
    ['STOPWATCH KEEPSAKE', 'A silver round stopwatch with a crown button on top, a white face with a red second hand and a short loop of cord.'],
    ['FIRST CUP KEEPSAKE', 'A small lopsided handmade pottery cup in speckled cream clay with an uneven blue glaze and a thumbprint on the side.'],
    ['CLAIM DESK', 'A wide wooden post office desk with a brass service bell, a big open ledger, a stamp pad and a row of four small cubbyholes behind it. The brass bell is the brightest part. Seen from the front.'],
    ['TOM\'S MAILBOX', 'A classic metal curbside mailbox on a wooden post, painted dark blue with a red flag raised and a letter sticking out of the slot. No numbers or words.'],
  ] },
  { id: 'ch20', label: 'Chapter 20, Stillness Core', title: 'Chapter 20 Stillness Core', items: [
    ['CODEBREAKER DOOR', 'A wide steel vault door about three units wide and two tall, with a brass panel holding four rotating number dials in a row. The dials are the brightest part. Seen from the front.'],
    ['BEAM DOOR', 'A wide padded blue gym door with chalk handprints on it and a small brass metronome set into the middle. The metronome is the brightest part. Seen from the front.'],
    ['CRAWLSPACE DOOR', 'A wide low wall panel with three round vent grates in a row and a few bread crumbs scattered under only the middle vent. Seen from the front.'],
    ['SPRINT DOOR', 'A wide door painted with running track lane lines and a bold white starting line, with a big round stopwatch face fixed in the middle. Seen from the front.'],
    ['GARDEN BRIDGE DOOR', 'A wide wooden garden gate with a small arched top, covered in green vines and tall red stalked rhubarb leaves. Seen from the front.'],
    ['HEAVY LEVER DOOR', 'A wide iron door with a big floor lever beside it and a heavy wooden crate on a chain, the lever handle painted bright orange. Seen from the front.'],
    ['RAIL SPLICE DOOR', 'A wide door whose clay panel is cracked in two halves and half mended with a bright gold seam. The gold seam is the brightest part. Seen from the front.'],
    ['SCENT TRAIL DOOR', 'A wide wooden door with a dog sized flap near the bottom, a trail of paw prints leading to it and a scrap of wool scarf caught in the flap. Seen from the front.'],
    ['ENGINE LIFT', 'A wide steel elevator with shut doors and a row of eight small round lamps above them, all dark. Seen from the front.'],
  ] },
  { id: 'ch21', label: 'Bonus chapter, Nine Scoops', title: 'Bonus chapter Nine Scoops', items: [
    ['BOPPY\'S PEPPER PLANTER', 'A long wooden planter box full of hot pepper plants loaded with glossy red, orange and yellow peppers on green leaves.'],
    ['HOT PEPPER', 'One big glossy red hot pepper with a green stem, lying slightly curved.'],
    ['MUG OF COCOA', 'A chunky cream mug of hot cocoa with a few marshmallows floating on top and a soft curl of steam.'],
    ['INSTANT PHOTO PRINTER', 'A small boxy pastel instant photo printer with a round lens on the front and a slot at the top with one instant photo half printed and sticking out.'],
    ['LIGHT UP BANNER', 'A long colorful party banner of big letter flags reading exactly "HAPPY BIRTHDAY GRACE", strung on a cord with small glowing party bulbs between the letters.'],
    ['PARTY INVITATION', 'A square birthday party invitation card in bright colors with a big balloon on it and a small gold star sticker, standing on its edge.'],
  ] },
];

const ART = `ART STYLE
- Every object is painted by hand in the style of the attached style key: dense painted texture, fine visible brushwork, deep saturated jewel colors, crisp clean edges, clear readable shapes. Gently simplified, storybook-like shapes.
- Warm golden key light from the upper left. Shadow on the lower right of each form, and at most a tiny soft contact shadow under each object, no cast shadow on a floor, no ground plane.
- No thick or black outlines.
- NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no limited color palette, no glossy plastic look.`;

const STRICT = n => `
- STRICT COUNT AND ORDER. The finished sheet has exactly ${n} objects, in cells 1 to ${n}, in exactly the order of the list, with no gaps. Draw each listed object once and only once. Never draw a second copy, a spare, a variant, a duplicate or a related extra object, and never put an object in a cell that belongs to a different number. If an item is a single piece or part (for example one clock hand), draw only that piece alone, never the thing it belongs to.
- PAIRS DIFFER ON ONE THING. Where a cell says it is the same as another cell, copy that cell exactly and change only the one named thing, and make that change big and obvious at a glance.`;

function sheet(label, items, strict) {
  const n = items.length;
  const list = items.map((p, i) => `${i + 1}. ${p[0]}: ${p[1]}`).join('\n');
  return `IMAGE REQUEST: ONE SINGLE PROP SHEET. Return exactly one image, nothing else. Follow the numbered list at the bottom exactly.

WHAT THIS IS
A sheet of find-it objects for "The Adventures of Tom", a family role-playing game. This is the sheet for ${label}: it holds ${n} standalone objects that the player has to find, touch or collect inside a dungeon. They will be cut out and drawn on top of a painted dungeon map, so each one must stand out clearly from a painted background.

ATTACHED IMAGES (in this order)
1. The STYLE KEY, a finished painting of the family in a school yard. Match how it paints: dense painted texture, fine visible brushwork, deep saturated colors, warm light. Do not copy any person, building or scene from it. Paint only the objects listed below.

${ART}
- Make each object read at a glance: slightly more saturated and a little higher contrast than a normal background object, and give the part the player touches (a switch, a lock, a slot, a handle) the brightest accent color on the object.
- Three-quarter view from slightly above, unless the list says "seen from the front". All objects share one lighting direction and one level of detail. Fun, friendly, a little silly. Family friendly for children aged 6 and up.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024 pixels. If your tool offers a different size, keep exactly 4 columns and 4 rows and use the largest size available.
- Exactly ${n} objects, one per cell, filled left to right, top to bottom, in the order of the numbered list below. The final cells (numbers ${n + 1} to 16) must stay completely empty and transparent, with no number.
- Each object is drawn complete, centered in its own cell, fully inside it, with at least 12 percent empty margin on every side. Nothing touches or crosses a cell edge. Nothing overlaps a neighbouring cell.
- Scale every object to fill about 70 to 80 percent of its cell, regardless of its real-world size. Small things are enlarged to the same footprint.
- Background: fully transparent (PNG with alpha). No grid lines, no borders, no frames, no cell backgrounds, no checkerboard pattern. If your tool cannot output transparency, fill the entire background with one flat solid color, pure magenta #FF00FF, and use no magenta anywhere inside the objects.
- In the top-left corner of every filled cell, put a small plain white number (with a thin dark outline) matching the list number. These numbers are a guide only and will be cropped off. Do not put any other labels, captions or titles on the sheet. The only text allowed is the text that is part of the object itself, spelled exactly as given in the list.

HARD RULES
- THE LIST IS COMPLETE AND DELIBERATE. Draw exactly the ${n} objects described, one per numbered cell. NEVER substitute, swap in or add other objects, even ones that seem more typical, more common or related to the same theme. If a description is unusual, draw it as written. Every cell must match its numbered description.
- Where the list says "the same as cell N" or "identical to cell N", the object must match that cell exactly in shape, size and the position of every part, and only the change the list names may differ. These pairs are swapped in the game when something happens, so they must line up.
- Objects only. No people, no characters, no hands, no faces on anything unless the list says the object has a face. No creatures except the ones listed.
- No real brands, logos, trademarks or copyrighted characters.
- Do not add extra objects, decorations, sparkle bursts, motion lines, glows, smoke or effects beyond what the list describes. Small details the list names (a wisp of steam, a drip, a glint) are fine.
- Do not skip, merge or reorder any item.${strict ? STRICT(n) : ''}

THE ${n} OBJECTS (cell number: name, what to draw)
${list}`;
}

const entries = SHEETS.map(s => ({
  id: `prop-find-${s.id}`, tab: 'Props',
  title: `Dungeon finds, ${s.title} (${s.items.length} objects)`,
  ar: '1:1', refs: [REF_KEY],
  prompt: sheet(s.label, s.items, s.strict),
}));
// EDIT entries (Tom 2026-11-09 audit): the approved sheet is attached and only the named cells change, so the good cells stay as they are.
// Used where a regenerate keeps ignoring a pose change (ch04 twice, ch08 once): a different method, not a third wording of the same prompt.
function editSheet(id, title, sheetFile, name, changes) {
  const list = changes.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`).join('\n');
  return {
    id: `prop-find-${id}`, tab: 'Props', title: `Dungeon finds, ${title} (edit of the approved sheet, send the picture listed)`,
    ar: '1:1', refs: [sheetFile],
    prompt: `EDIT THE ATTACHED IMAGE. Return exactly one image, nothing else.

The attached picture is an approved prop sheet for ${name} in "The Adventures of Tom", a family role-playing game: a 4 by 4 grid of square cells, one painted object per cell, a plain solid crimson background, and a small white number in the top-left corner of every filled cell. Keep the painting style, lighting, colors, camera angle, grid, cell positions, background color and white numbers exactly as they are. Every object not named below stays exactly as it is, pixel for pixel where possible. Output the same size and layout. Make only the changes listed here.

CHANGES
${list}

RULES
- Do not add, remove, move or resize any object. Do not touch the empty cells.
- The changed part must be big and obvious at a glance, never subtle.
- Painted lettering, if any, stays exactly as it is.`
  };
}
entries.push(editSheet('ch04-fix', 'Chapter 4 Soundstage 7, levers and dead rig', 'art/raw/props/prop-find-ch04-v1.png', 'Soundstage 7 (grey junction boxes and a stage light rig)', [
  'Cells 1, 3 and 5 (the OFF boxes) keep their switch lever pointing DOWN. Do not change them.',
  'Cells 2, 4 and 6 (the ON boxes): flip the chunky toggle lever to the OPPOSITE position. Today it points down like the OFF boxes; make it point straight UP, standing up above the middle of the box face, clearly the mirror image of the down lever in cells 1, 3 and 5. The lit lamp, the colored stripe and the box stay exactly as they are.',
  'Cell 7 (the dead light rig): turn all three lamps completely OFF. Each lamp becomes dull dark glass with no glow and no bright center, the blue, amber and red gel colors only a deep muted tint. Cell 8 (the lit rig) stays blazing bright and unchanged.'
]));
entries.push(editSheet('ch07-fix', 'Chapter 7 The Stacks, reading room lock', 'art/raw/props/prop-find-ch07-v1.png', 'the Stacks library (catalog cards, doors, a chair)', [
  'Cell 4 (the READING ROOM doors): remove the brass padlock and keyhole completely. Put a rectangular brass lock plate in the center of the doors that looks like the front of a card catalog drawer: a small round pull knob in the middle and a row of three narrow horizontal card slots across it, the three slots glowing warm amber and the brightest part of the object. There is NO padlock and NO keyhole anywhere on the doors. The doors, the arch, the trim and the small brass plate reading exactly "READING ROOM" stay as they are.',
  'Every other cell stays exactly as it is.'
]));
entries.push(editSheet('ch08-fix', 'Chapter 8 Car Barn, pulled lever', 'art/raw/props/prop-find-ch08-v1.png', 'the Car Barn (pilot lights, a motor, a lever, a lunch pail)', [
  'Cell 6 (TURNTABLE LEVER, PULLED): the lever is pulled all the way over and lies nearly flat. Keep the same base plate, bolts and red round knob as cell 5, but tip the lever bar about 70 degrees away from upright, so it points toward the lower right and the red knob hangs low, just above the front right edge of the base plate, lower than the top of the pivot bracket. The bar must lean much further than a slight tilt: the knob moves a long way sideways and down from where it is in cell 5. It must look completely different from cell 5, where the lever stands straight up. Cell 5 stays exactly as it is, standing straight up.',
  'Every other cell stays exactly as it is.'
]));
// PARTS sheets (Tom's stop-loss, 2026-11-09 late): the generator copies one pose or one clock state to every cell, so each state is its own big part
// alone in a cell and the game composes them in code. Used for ch04 (levers, lamps, rig) and the ch10 gate clock (face, peg, one coin slot).
const PARTS = [
  { id: 'ch04-parts', strict: true, label: 'Chapter 4, Soundstage 7 (parts)', title: 'Chapter 4 Soundstage 7, parts', items: [
    ['BLUE BOX BODY, EMPTY', 'A grey steel wall box seen straight from the front with a thick BLUE stripe across its front. In the middle of the front is an empty round dark hole where a toggle lever will be mounted, and above it an empty round dark socket where a lamp will sit. No lever and no lamp are drawn, only the empty box with its two empty openings.'],
    ['AMBER BOX BODY, EMPTY', 'The same box as cell 1, identical in shape, size and openings, but with a thick AMBER stripe. Empty lever hole and empty lamp socket, no lever, no lamp.'],
    ['RED BOX BODY, EMPTY', 'The same box as cell 1, identical in shape, size and openings, but with a thick RED stripe. Empty lever hole and empty lamp socket, no lever, no lamp.'],
    ['TOGGLE LEVER, UP', 'ONE chunky steel toggle lever with a round chrome ball tip and a round mounting collar at the base, drawn alone as a separate piece, standing straight up from its collar. Only the lever, alone, with no box behind it.'],
    ['TOGGLE LEVER, DOWN', 'The same toggle lever as cell 4, identical in every way, but flipped to point straight DOWN from its collar, the ball tip at the bottom and the collar at the top. Only the lever, alone, with no box behind it.'],
    ['ROUND LAMP, LIT BLUE', 'ONE small round indicator lamp with a chrome ring, glowing bright blue, drawn alone as a separate piece. Only the lamp, alone, with no box behind it.'],
    ['ROUND LAMP, LIT AMBER', 'The same round lamp as cell 6, identical in size and ring, but glowing bright amber. Only the lamp, alone.'],
    ['ROUND LAMP, LIT RED', 'The same round lamp as cell 6, identical in size and ring, but glowing bright red. Only the lamp, alone.'],
    ['ROUND LAMP, DARK', 'The same round lamp as cell 6, identical in size and ring, but turned completely off: dull dark grey glass with no glow and no color at all. Only the lamp, alone.'],
    ['LIGHT RIG BAR, NO LAMPS', 'A wide black steel lighting bar drawn alone, with three empty round mounting sockets in a row along its front and three thick cables hanging down from it. No lamps are mounted. Only the bar and its cables.'],
    ['STAGE LAMP, LIT BLUE', 'ONE big round stage lamp in a black steel housing, shining bright with a BLUE gel cover, drawn alone as a separate piece. Only the lamp, alone, with no bar behind it.'],
    ['STAGE LAMP, LIT AMBER', 'The same stage lamp as cell 11, identical in size and housing, but shining bright with an AMBER gel cover. Only the lamp, alone.'],
    ['STAGE LAMP, LIT RED', 'The same stage lamp as cell 11, identical in size and housing, but shining bright with a RED gel cover. Only the lamp, alone.'],
    ['STAGE LAMP, DARK', 'The same stage lamp as cell 11, identical in size and housing, but turned completely off: dull dark grey glass cover with no glow, no color and no bright center. Only the lamp, alone.'],
  ] },
  { id: 'ch10-clock', strict: true, label: 'Chapter 10, Terminal Zero (gate clock parts)', title: 'Chapter 10 Terminal Zero, gate clock parts', items: [
    ['CLOCK FACE, BLANK', 'A large round airport wall clock seen straight from the front, with a white face, a plain brushed steel rim, and bold black numbers 1 to 12, all clear and correct. The center of the face is completely plain and empty. There are NO hands, NO peg, NO studs, NO dots, NO slots and NO holes anywhere on the face. Only the rim, the white face and the twelve numbers.'],
    ['CENTER PEG', 'ONE small round gold clock peg with a domed top, drawn alone as a separate piece. Only the peg, alone, with no clock behind it.'],
    ['COIN SLOT', 'ONE round coin slot, a dark hole with a bright gold rim, drawn alone as a separate piece, seen from the front. Only the slot, alone, with no clock or door behind it.'],
  ] },
];
for (const s of PARTS) {
  entries.push({
    id: `prop-find-${s.id}`, tab: 'Props',
    title: `Dungeon finds, ${s.title} (${s.items.length} parts, each alone)`,
    ar: '1:1', refs: [REF_KEY],
    prompt: sheet(s.label, s.items, s.strict),
  });
}
module.exports = { entries, SHEETS, sheet };
