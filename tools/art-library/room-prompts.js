// Room prompts for the Art Library (tab 'Rooms'): 61 entries.
//   Group A: the 29 square house and shop interiors (LE_ROOMS / LA_ROOMS in game.json), ref = installed plate (layout + furniture) + style key.
//   Group B: the 32 walkable interior areas that are not square (school ... boiler), ref = installed plate (layout) + style key.
// Prompt text is BUILT FROM DATA: one shared style block, one function per group. Run: node tools/art-library/make-prompts.js
const KEY = 'art/grands.webp';

const ART = `ART STYLE (the same look as attachment 2, the painting of Deedee and Boppy's house)
- A hand-painted, hand-brushed interior in exactly the style of attachment 2: visible brushwork everywhere, matte surfaces like oil paint or gouache on canvas, rich warm color built in layers, a fine canvas grain, edges painted with a small brush. Gently simplified shapes, fine painted detail on wood grain, fabric, plaster and stone. No thick or black outlines. NOT glossy, NOT airbrushed.
- Warm golden light from the upper left, a soft warm glow, a gentle rim light on furniture edges, soft baked contact shadows under every piece of furniture. Lamps and windows add small pools of warm light.
- Fixed elevated three-quarter camera looking diagonally into the scene, about 35 degrees downward, the same camera across the whole picture. No top-down floor-plan look, no fisheye, no perspective change from one side to the other.
- NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no limited color palette.
- Attachment 2 is a STYLE REFERENCE ONLY. Match its brushwork, lighting, color and level of detail exactly. Take only how it is painted.`;

const EXCL = `STRICT EXCLUSIONS
No people, no animals, no creatures, no monsters, no characters of any kind (the game draws them on top). No collectibles painted in: no chests, coins, keys, gems or glowing pickups. No frame, border, vignette bars, title card, contact sheet, mockup, palette chart or any other secondary material. Exactly one picture.`;

const NOTEXT = 'No text, letters, numbers or logos anywhere in the picture: signs, labels, book spines, boards, clock faces and screens are blank or show plain shapes only, because the game overlays its own text.';

const SAME = 'Family friendly for ages 6 and up. If anything is unclear, keep the furniture and layout of attachment 1 and repaint it in the style of attachment 2.';

// ------------------------------------------------------------------ Group A
const FLOOR = { check: 'a painted checkerboard floor of two close tones', wood: 'a wooden plank floor with visible grain and soft sheen', tile: 'a square tile floor with fine grout lines', night: 'a dark polished floor with a faint sparkle, like a night sky' };

function roomA(r) {
  const s = r.style;
  const extra = r.extra ? '\n' + r.extra : '';
  return `IMAGE REQUEST: ONE SINGLE ILLUSTRATION. Return exactly one image, nothing else.

WHAT THIS IS
A square interior painting of ${r.what}, for "The Adventures of Tom", a family role-playing game. It is one room, seen as a cutaway dollhouse view from above and in front, and the game places its characters on the floor.

ATTACHED IMAGES (in this order)
1. The installed painting of this same room: a LAYOUT AND FURNITURE reference. Keep the same furniture, the same placement and the same room layout, the same entrance position and the same wall and window positions. Restyle everything to attachment 2. Do not add rooms, do not remove furniture, do not move pieces to new walls.
2. The finished painting of Deedee and Boppy's house, the grandparents' home in this game. It is the inspiration for how every picture in this game is painted. Match its hand-painted, hand-brushed look: visible brush strokes, matte painted surfaces, warm golden light from the upper left, soft painted shadows, rich warm color, a fine canvas grain. Take only how it is painted.

${ART}

THE ROOM
- ${r.what.charAt(0).toUpperCase() + r.what.slice(1)}. ${r.mood}
- Shape: a SQUARE picture, 1:1, 2532 x 2532 pixels if possible. Full bleed: the painting fills the whole square to every edge, with no black or white margins, no frame and no vignette bars. ${r.outside || 'Outside the room, the space around it is soft dusk garden and ground that fills the rest of the square.'}
- Cutaway: the back wall and both side walls are shown with their inner faces, and the front wall is a LOW half wall so we see straight into the room. The floor fills most of the picture, with clear open floor in the middle and in front of every piece of furniture, because characters walk there.
- The entrance is a doorway gap in the low front wall near the bottom center, exactly where it is in attachment 1, and it stays well inside the picture: at least 6 percent of the width and height away from every outer edge. A short step or mat outside it is fine.
- Scale: draw this room at the same scale as attachment 1. Every room in the game is painted at one scale, so doors, chairs, tables and counters are the same size as in attachment 1, not larger or smaller, and a standing adult would be about one eighth of the picture height.
- Furniture and details (placement as in attachment 1):
${r.items.map(i => '  * ' + i).join('\n')}${extra}
- Materials and palette: ${FLOOR[s.pattern] || FLOOR.wood} in ${s.floor} and ${s.alt}; walls ${s.wall}; trim, baseboards and window frames ${s.trim}; main rug or accent color ${s.rug}. These are the base colors: enrich them with light and shadow, do not paint them flat.

${EXCL}
${NOTEXT}
${SAME}`;
}

// floor, wall, trim, rug colors from game.json rooms[].style
const ROOMS_STYLE = {"bakery": {"floor": "#dfbd8e", "alt": "#e8cb9e", "wall": "#c9a77e", "trim": "#f0d5a9", "pattern": "check", "rug": "#c18268"}, "library": {"floor": "#c7bbbd", "alt": "#d6cccb", "wall": "#a69ba8", "trim": "#e2d6cf", "pattern": "wood", "rug": "#9992ad"}, "greenhouse": {"floor": "#aebe99", "alt": "#becbab", "wall": "#91a58d", "trim": "#d7dfbd", "pattern": "tile", "rug": "#a8b480"}, "post": {"floor": "#b6c3be", "alt": "#c6d1c6", "wall": "#8faaa8", "trim": "#d5ddd0", "pattern": "wood", "rug": "#9baebb"}, "tea": {"floor": "#d5ba9e", "alt": "#e3cdb0", "wall": "#bb9d88", "trim": "#efd7b8", "pattern": "wood", "rug": "#c6aa76"}, "observatory": {"floor": "#8d9aab", "alt": "#a0adbb", "wall": "#718299", "trim": "#bac8d1", "pattern": "night", "rug": "#777f9e"}, "shop": {"floor": "#d9c49c", "alt": "#e6d3ad", "wall": "#c27a62", "trim": "#f1d9b5", "pattern": "check", "rug": "#c9a24d"}, "taxi": {"floor": "#c9c3b4", "alt": "#d7d1c2", "wall": "#a99a6e", "trim": "#efe0b0", "pattern": "check", "rug": "#d9a43a"}, "amyhouse": {"floor": "#e2cfc0", "alt": "#ead9cb", "wall": "#c99aa4", "trim": "#f0dde0", "pattern": "tile", "rug": "#d2a4b0"}, "grands": {"floor": "#cbb089", "alt": "#d7be98", "wall": "#9a8f78", "trim": "#e6dcc3", "pattern": "wood", "rug": "#9c6e62"}, "elliehouse": {"floor": "#cdb9c6", "alt": "#d8c6d2", "wall": "#7a5a78", "trim": "#eadcea", "pattern": "wood", "rug": "#6a3a8a"}, "coffee": {"floor": "#d9c4a8", "alt": "#e6d3b8", "wall": "#b98a5a", "trim": "#f0d9b5", "pattern": "wood", "rug": "#c98a4a"}, "ramen": {"floor": "#cbb89c", "alt": "#d8c6aa", "wall": "#7a3a33", "trim": "#e8c8a0", "pattern": "wood", "rug": "#b9483f"}, "juicebar": {"floor": "#dfe8d0", "alt": "#eaf0de", "wall": "#6fb35a", "trim": "#f4fbe8", "pattern": "tile", "rug": "#9ccf7a"}, "nickels": {"floor": "#d9c49c", "alt": "#e6d3ad", "wall": "#3a9ca0", "trim": "#f1d9b5", "pattern": "check", "rug": "#2f6f73"}, "wardrobe": {"floor": "#cfc3d6", "alt": "#dcd2e2", "wall": "#6a4f7a", "trim": "#e3d6e8", "pattern": "tile", "rug": "#8a6aa0"}, "cinema": {"floor": "#7a3a3a", "alt": "#843f3f", "wall": "#2c2c33", "trim": "#a8453a", "pattern": "night", "rug": "#a8453a"}, "boards": {"floor": "#b6c3c8", "alt": "#c6d1d4", "wall": "#2f4e6a", "trim": "#d6e6ec", "pattern": "wood", "rug": "#e2793a"}, "lacab": {"floor": "#c9c3b4", "alt": "#d7d1c2", "wall": "#a99a6e", "trim": "#efe0b0", "pattern": "check", "rug": "#d9a43a"}, "tomhouse": {"floor": "#c9a476", "alt": "#d2ad80", "wall": "#d8dbde", "trim": "#f4f4f2", "pattern": "wood", "rug": "#e8eaee"}, "tomsuite": {"floor": "#c9a476", "alt": "#d2ad80", "wall": "#d8dbde", "trim": "#f4f4f2", "pattern": "wood", "rug": "#e8eaee"}, "casa": {"floor": "#d8b48a", "alt": "#e2c39c", "wall": "#c98a5a", "trim": "#f4e6c8", "pattern": "tile", "rug": "#2f8a8a"}, "loftlobby": {"floor": "#d8b57a", "alt": "#e0c08a", "wall": "#8a5a44", "trim": "#d9c0a0", "pattern": "tile", "rug": "#7a4a3a"}, "lofts": {"floor": "#b98a6a", "alt": "#c49878", "wall": "#8a5a44", "trim": "#d9c0a0", "pattern": "wood", "rug": "#3f4650"}, "tower": {"floor": "#cfd6de", "alt": "#dde3ea", "wall": "#3f5a74", "trim": "#c9d6de", "pattern": "tile", "rug": "#6f9fc4"}, "creole": {"floor": "#c9a87a", "alt": "#d6b688", "wall": "#7a3a5a", "trim": "#e8c060", "pattern": "check", "rug": "#4a7a3a"}, "pupuseria": {"floor": "#e8dcc4", "alt": "#f2e6d0", "wall": "#2f6fb3", "trim": "#ffffff", "pattern": "tile", "rug": "#2f6fb3"}, "jordansam": {"floor": "#e8e4dc", "alt": "#f2f0ea", "wall": "#2c2c2e", "trim": "#f4f4f0", "pattern": "tile", "rug": "#c9b89a"}, "dakota": {"floor": "#e2d0b0", "alt": "#ecdcc0", "wall": "#f2f2ee", "trim": "#b98a5a", "pattern": "wood", "rug": "#9ccfd8"}};

const A = [
  { id: 'bakery', name: 'Crumb Bakery', what: 'the Crumb Bakery, a cozy village bakery', mood: 'Warm, floury and inviting, with the glow of an oven.',
    items: ['a big brick bread oven with a black iron door and a glowing mouth, set into the back wall', 'a long wooden counter with a glass bread display full of loaves, braids and rolls, one loaf wearing a little knitted scarf', 'cushioned benches under the windows along a side wall', 'a recipe shelf with cookbooks, jars of flour and sugar, and a rolling pin', 'a flour-dusted potted fern', 'a wicker basket of warm rolls with a cloth over it', 'a round rug in terracotta pink under the middle of the room'] },
  { id: 'library', name: 'The Hush Library', what: 'the Hush Library, a quiet village library', mood: 'Hushed, lavender and dusty gold, with warm reading lamps.',
    items: ['tall wooden bookshelves full of books along the back wall and one side wall, one shelf of tall serious books and one of small colorful books', 'a reading desk with a lamp, an open ledger shape (no writing) and a bookmark ribbon', 'a long reading table with a vase of daisies and a stack of books', 'a window seat with lavender cushions', 'a deep armchair with a dent in the cushion beside a reading lamp', 'a potted cactus on a stand', 'a plain wooden staff door with a brass handle in the back wall that leads to the stacks', 'a round lavender rug'] },
  { id: 'greenhouse', name: 'Sprout House', what: 'Sprout House, a glass-roofed greenhouse and plant shop', mood: 'Leafy, humid, bright and green, with sunbeams through the glass.',
    items: ['rows of raised planter beds full of lush leafy plants, with a few big bushy specimens, one larger plant in the middle of the biggest bed', 'a potting bench with clay pots, a trowel, a watering can and a heap of soil', 'a gardening shelf with seed packets (blank), small pots and tools', 'a few hanging baskets of trailing vines', 'a glass roof and glass side panels with white iron frames letting sunbeams fall on the floor'] },
  { id: 'post', name: 'Snail Mail', what: 'Snail Mail, the village post office', mood: 'Tidy, calm and slightly sleepy, teal and cream.',
    items: ['a wall of brass-doored mailboxes in rows, with small keyholes', 'a sorting counter with trays of letters and parcels tied in string', 'a stamp desk with an inkpad, a rubber stamp and a brass scale', 'a leafy office plant in a pot', 'a parcel basket full of brown paper packages', 'a long blue-grey rug'] },
  { id: 'tea', name: 'Kettle Cottage', what: 'Kettle Cottage, a tiny tea room', mood: 'Snug, warm and a little fussy, like a grandmother\'s parlor.',
    items: ['a small table laid for two with a teapot, two cups and saucers', 'a biscuit table with a tiered stand of biscuits and cakes', 'a mint plant in a pot on a windowsill', 'a tall tea cabinet with many small drawers and glass jars of leaves', 'a big copper kettle on a stove or shelf, steam curling from the spout', 'a woven golden rug'] },
  { id: 'observatory', name: 'Moon Club', what: 'the Moon Club, the entrance room of a faded night-sky club with a small observatory', mood: 'Hushed, silver-blue and starry, with a little brass and velvet.',
    items: ['a big brass telescope on a tripod pointing at a round opening in the wall', 'a research desk with maps, an inkwell and a lamp', 'shelves of space books and a model of the planets', 'a star chart on the wall (painted as dots and lines, no writing)', 'wooden supply crates stacked in one corner', 'a small silver door in the back wall that leads on to the club', 'a round rug woven with a moon and stars (shapes only)'] },
  { id: 'shop', name: "Penny's Pockets", what: "Penny's Pockets, the village general shop for gear and snacks", mood: 'Busy, colorful and cheerful, a corner shop crammed with goods.',
    items: ['a shop counter with a brass register shape, a jar of sweets and a scale', 'a tall gear shelf with backpacks, rope, boots and lanterns', 'a snack shelf with tins, jars and boxes (blank labels)', 'a big battle bin full of toy swords, shields and bright gear', 'a shop plant in a pot', 'a gold rug in front of the counter'] },
  { id: 'taxi', name: 'Long Island Taxi Co.', what: 'the Long Island Taxi Co. office, a small taxi dispatch office and waiting room', mood: 'Mustard, olive and chrome, a little worn and friendly.',
    items: ['a key board on the wall with many sets of car keys on hooks', 'a dispatch desk with an old black telephone, a radio and a lamp', 'a framed driver-of-the-month picture frame on the wall (no portrait detail, plain painted view)', 'a lost and found shelf with umbrellas, a scarf and a lunchbox', 'a waiting room plant in a pot', 'an umbrella stand by the door', 'a yellow rug'] },
  { id: 'amyhouse', name: "Amy's House", what: "Amy and Justin's family home, a warm, lived-in house with a front garden",
    mood: 'Cozy, bright and busy, a family home with a beautiful kitchen.', outside: 'Around the house is a lush flowering front garden with a stone path to the front door, and the space around fills the rest of the square.',
    items: ['a beautiful kitchen along the back right: a long kitchen island with a pale stone top and a row of wooden stools, a stove with a hood, a big fridge, open shelves, hanging pendant lamps', 'a dining table with chairs and a vase of flowers beside the kitchen', 'a large living room in front left: a stone fireplace with a lit fire, a flat-screen TV on the wall above a low shelf, a loveseat, a long couch, a coffee table, a green armchair and a woven pouf, on a patterned rug', 'a bathroom with a toilet and a sink behind a door on the left', 'an office with a desk, a laptop, a chair and bookshelves, in the back left', 'a spare bedroom with a made bed with navy bedding, a bag on the bed, a dresser with a small TV and a nightstand with a lamp', 'a wooden staircase with a dark rail in the middle of the house that runs along a wall and ends at a plain solid wall', 'a runner rug in the hall, a coat hook with a hat and coat by the front door, and family photo frames on the walls (blank pictures, no detail)', 'plants in pots in several corners'],
    extra: '- The staircase is a decorative feature that simply ends at a plain wall. Paint nothing else behind or above it but wall.' },
  { id: 'grands', name: "Deedee and Boppy's House", what: "Deedee and Boppy's house, a grandparents' home with a big family kitchen", mood: 'Warm, plaid and homey, smelling of cookies.',
    items: ["Boppy's brown recliner chair facing a TV on a stand", 'a plaid sofa with a coffee table and an end table with a lamp', 'a pepper plant with red and green peppers in a pot, and a big leafy fern', 'a hall table with a hall chair near the entrance', 'a dining table with chairs and a bowl of fruit', 'a cookie counter with a cooling rack of cookies, a jar and a mixing bowl, and a second counter beside it', 'a wooden sideboard with plates and family photo frames (blank pictures)', 'a red-brown woven rug'] },
  { id: 'elliehouse', name: "Aunt Ellie's House", what: "Aunt Ellie's house, a tidy, elegant little house with a purple theme", mood: 'Purple, plum and cream, orderly, a touch of theater.',
    items: ['a writing cabinet with a fold-down desk, an inkwell and a few letters (no writing)', 'a kettle and fruit bowl on a small counter', 'a deep green sofa with plum cushions', 'a tea table with a teapot and cups', 'a side table with a lamp', 'an umbrella stand by the door', "a vanity with a round mirror, a stool and perfume bottles", 'a rich purple rug'] },
  { id: 'coffee', name: 'Golden Hour Coffee', what: 'Golden Hour Coffee, a sunny neighborhood coffee shop', mood: 'Golden, toasty and relaxed.',
    items: ['an espresso bar with a gleaming brass espresso machine, cups and a grinder', 'a pastry case with croissants and muffins', 'a big monstera plant in a pot', 'a laptop table with an open laptop (blank screen) and a mug', 'a window table with two chairs and a view of the street', 'a book table with a few stacked books and a plant', 'an orange-gold rug'] },
  { id: 'ramen', name: 'Ramen Ramen', what: 'Ramen Ramen, a small ramen shop with a long counter', mood: 'Warm red and lantern-lit, steamy and snug.',
    items: ['a long ramen counter with stools, steaming bowls, chopsticks in a cup and a big stockpot behind it', 'a shelf of sake bottles and ceramic cups on the back wall', 'a small corner table with two stools', 'paper lanterns hanging overhead, and a low lantern step by the door', 'a deep red rug'] },
  { id: 'juicebar', name: 'Very Green Juice', what: 'Very Green Juice, a bright green juice bar', mood: 'Fresh, minty and sunny, everything green and cream.',
    items: ['a juice bar counter with a blender, glass bottles of green juice, a pile of apples, kale and lemons', 'a big fern in a pot', 'an herb table with pots of basil, mint and rosemary', 'a few stools at the counter', 'a light green rug'] },
  { id: 'nickels', name: "Nickel's", what: "Nickel's, a teal-walled corner shop for snacks and gear", mood: 'Teal and cream, bright, tidy and playful.',
    items: ['a shop counter with a register shape and a jar of candy', 'a snack shelf with tins, bags and jars (blank labels)', 'a battle bin of toy gear', 'a ball display stand with colorful balls', 'a shop fern in a pot and a shop cactus in a pot', 'a deep teal rug'] },
  { id: 'wardrobe', name: 'Backlot Wardrobe', what: 'Backlot Wardrobe, a film studio costume department', mood: 'Purple and theatrical, crammed with costumes.',
    items: ['costume rack A with western costumes: hats, vests, fringed jackets, a sheriff star shape', 'costume rack B with space costumes: silver suits, helmets, glowing belts', 'a continuity desk with a camera, a binder and photographs (blank pictures)', 'a call sheet pinned to a board (blank sheet)', 'a prop plant in a pot', 'a hat case stacked with round hat boxes', 'a sewing mannequin and a full-length mirror', 'a purple rug'] },
  { id: 'cinema', name: 'The Starlite', what: 'The Starlite, an old-fashioned neighborhood movie theater', mood: 'Velvet red and black, theatrical and glowing.',
    items: ['a big blank cinema screen on the back wall with heavy red curtains', 'two rows of red velvet cinema seats facing it, rows F and G', 'a concessions counter with a popcorn machine and candy jars', 'a lobby fern in a pot', 'a velvet rope on brass posts', 'a deep red carpet'] },
  { id: 'boards', name: 'Board Room', what: 'Board Room, a skateboard and longboard shop', mood: 'Cool navy and orange, sporty and sunny.',
    items: ['a grip tape counter with a roll of black grip tape, tools and a register shape', 'a wheel wall of colorful skateboard wheels on pegs', 'a bench with sneakers and helmets', 'a longboard rack with many painted longboards', 'an orange rug'] },
  { id: 'lacab', name: 'Angel City Cab Co.', what: 'the Angel City Cab Co. office, a taxi dispatch office with a waiting lounge', mood: 'Mustard, olive and chrome, sunny Los Angeles.',
    items: ['a dispatch desk with a telephone, a radio and a lamp', 'a water cooler with paper cups', 'a lost and found shelf with an umbrella, a scarf and a bag', 'a green sofa and a red leather sofa', 'a magazine table with a few magazines (blank covers)', 'a yellow rug'] },
  { id: 'tomhouse', name: "Tom's House", what: "Tom's house, a modern single-story home with a beautiful open plan", mood: 'Warm evening light, cream and white walls, honey wood floor.', outside: 'Around the house is a landscaped front garden with a stone path to the front door, soft garden lights and hedges, filling the rest of the square.',
    items: ['along the back left, a black wet bar cabinet with a glass-door wine fridge and open shelves of bottles under a teal wall', 'at the left, a long dark wood dining table with eight cream chairs on a patterned rug, a vase of flowers in the middle', 'at the back right, a kitchen with a big white kitchen island with three wooden stools, a steel fridge, a range with a hood, white cabinets and two brass pendant lamps', 'in the front right, a living room with a cream L-shaped sectional couch, a wooden coffee table, two green armchairs, a floor lamp and a rug', 'a narrow runner rug in the hall at the back center', 'a rubber plant, a fiddle-leaf fig and other plants in pots in several corners', 'a double front door with lantern lights in the low front wall at the bottom center'],
    extra: 'Match the existing painting (attachment 1) as closely as possible: every piece of furniture, its position and its size. This is the main living area; the bedroom suite is a separate picture.' },
  { id: 'tomsuite', name: "Tom's Primary Suite", what: "the primary suite of Tom's house: a bedroom with a bathroom and a walk-in closet", mood: 'Warm lamp light, sage green and cream, a calm retreat.', outside: 'Around the suite is a softly lit garden that fills the rest of the square.',
    items: ['at the back left, a bathroom with a teal-tiled glass shower, a toilet, a double vanity with two sinks and mirrors, a nightstand-like stand', 'at the back right, a walk-in closet with hanging clothes on rails, wooden shelves and a basket', 'in the middle, a big bed with white bedding, an olive green throw and cushions, a leather tufted bench at the foot, two wooden nightstands with glowing lamps, on a large patterned rug', 'along the left, a long runner rug, a window bench with cushions and a plant', 'at the right, a wooden dresser with a vase of flowers, and a white armchair with a cushion beside a small round table', 'a white door in the left wall', 'a fiddle-leaf fig, a rubber plant and a big plant in pots'],
    extra: 'Match the existing painting (attachment 1) as closely as possible: every piece of furniture, its position and its size.' },
  { id: 'casa', name: 'Casa Alvarez', what: 'Casa Alvarez, a big busy family home with a kitchen and kids\' corner', mood: 'Warm terracotta, teal and cream, lived in and full of life.',
    items: ['a kitchen island with a few stools, a stove with pots and a fridge', 'a dining table with many mismatched chairs', 'a green sofa with cushions', 'a pile of toys on a rug: blocks, a ball and plush animals', 'coat hooks with coats and a shoe shelf by the entrance', 'a bunk bed in one corner', 'a teal rug'] },
  { id: 'loftlobby', name: 'Loft Lobby', what: 'the lobby of a loft building, a warm brick lobby with an elevator', mood: 'Warm brick and amber, industrial and cozy.',
    items: ['an elevator door with a call button beside it', 'a wall of brass mailboxes', 'a package desk with parcels', 'a brown leather sofa', 'a big monstera plant in a pot', 'a dark red rug'] },
  { id: 'lofts', name: "TNB's Loft", what: "TNB's loft, a big open brick loft that is a pottery studio and a home", mood: 'Warm brick, wood and clay, creative and lived in.',
    items: ['a pottery kiln, a squat brick-like oven with a door and a chimney pipe', 'a pottery wheel with a lump of clay and a stool', 'a pottery shelf of finished cups, bowls and vases', 'a garment rack with hanging clothes and costumes', 'a longboard wall with a few longboards on pegs', 'a couch in dark grey in front of a TV, with a coffee table and two side tables, in a movie-night corner with horror movie posters (blank posters)', 'a charcoal rug'] },
  { id: 'tower', name: 'The Grand Tower', what: "an apartment high in the Grand Tower, a modern, bright city apartment", mood: 'Cool blue and white, modern and tidy, city view.',
    items: ['a gray couch facing a TV', 'a standing desk with a monitor (blank screen)', 'a kitchen island with stools', 'a dining table with chairs', 'an armchair and a corner nook with a lamp and a small plant', 'big windows on the back wall with a skyline view', 'a pale blue rug'] },
  { id: 'creole', name: "Odette's Creole Kitchen", what: "Odette's Creole Kitchen, a lively New Orleans style family restaurant", mood: 'Plum, gold and green, warm and festive.',
    items: ['a pastry case of beignets and pies', 'a gingham tablecloth table, a big family table and a yellow table', 'a green sideboard', 'a pepper plant in a pot and two door plants by the entrance', 'a dark corner booth', 'a checkered floor in warm tan'] },
  { id: 'pupuseria', name: 'Pupuseria La Ceiba', what: 'Pupuseria La Ceiba, a small Salvadoran pupusa restaurant', mood: 'Blue and white, bright, cheerful and homey.',
    items: ['the comal, a big flat griddle on a stove at the back with pupusas cooking', 'a family table', 'a window table', 'a corner table', 'a loroco plant in a pot', 'a blue and white tile floor and a blue rug'] },
  { id: 'jordansam', name: "Jordan and Sam's Place", what: "Jordan and Sam's place, a sleek modern apartment with a dark accent wall", mood: 'Cream and charcoal, calm, designer and minimal.',
    items: ['a cream boucle couch with a coffee table and a leather pouf', 'a wooden slat divider', 'an olive tree in a pot', 'an espresso bar with a machine', 'a dining table', 'a side table and a big planter', 'a beige rug'] },
  { id: 'dakota', name: "Dakota and Ryan's Place", what: "Dakota and Ryan's place, a bright apartment with a baby corner", mood: 'White walls, wood trim and aqua accents, airy and welcoming.',
    items: ["a baby crib in one corner with a soft blanket and a mobile", 'a dining table', 'a bookshelf', 'a monstera plant in a pot', 'a green armchair and a leather pouf', 'a shoe bench by the door', 'an aqua rug'] },
];

// ------------------------------------------------------------------ Group B
const ALLOWED = [['3:4', 3 / 4], ['2:3', 2 / 3], ['1:1', 1], ['4:3', 4 / 3], ['3:2', 3 / 2], ['16:9', 16 / 9], ['9:16', 9 / 16]];
const nearest = t => ALLOWED.reduce((b, c) => Math.abs(Math.log(c[1] / t)) < Math.abs(Math.log(b[1] / t)) ? c : b);

// where an exit tile sits on the plate
function where(x, y, w, h) {
  const hx = x < w * 0.34 ? 'left' : x > w * 0.66 ? 'right' : 'middle';
  const vy = y < h * 0.2 ? 'top' : y > h * 0.8 ? 'bottom' : 'middle';
  if (vy === 'top') return 'the back (top) wall, ' + hx;
  if (vy === 'bottom') return 'the front (bottom) edge, ' + hx;
  if (x <= 1) return 'the left wall';
  if (x >= w - 2) return 'the right wall';
  return 'the ' + hx;
}

function roomB(a) {
  const t = a.w / a.h, near = nearest(t), nr = near[1];
  let fit = '';
  if (Math.abs(nr / t - 1) > 0.04) {
    if (t > nr) fit = `The target shape is wider than this picture, so the game will trim the top and bottom: keep every walkable lane, doorway and important object inside the middle ${Math.round(100 * nr / t)} percent of the height, and let the top and bottom be wall and ceiling shadow or plain floor. `;
    else fit = `The target shape is narrower than this picture, so the game will trim the sides: keep every walkable lane, doorway and important object inside the middle ${Math.round(100 * t / nr)} percent of the width. `;
  }
  const exits = a.exits.map(e => `${e[0]} (${where(e[1], e[2], a.w, a.h)})`).join('; ');
  const sg = a.signs ? `\n- Sign lettering: the only text allowed is ${a.signs}, painted in clean readable capitals, spelled exactly as given, each on its own board or sign in the material of the place where it hangs. Nothing else in the picture carries any letters or numbers.` : '';
  return `IMAGE REQUEST: ONE SINGLE ILLUSTRATION. Return exactly one image, nothing else.

WHAT THIS IS
A painting of ${a.what}, for "The Adventures of Tom", a family role-playing game. It is one walkable interior map, painted as ONE complete picture. The game draws its characters and monsters on top, so the floor must be empty.

ATTACHED IMAGES (in this order)
1. The installed painting of this same place: a LAYOUT reference. Keep the same room layout, the same positions of walls, doors, big furniture and landmarks, and the same open floor. Restyle everything to attachment 2. Fix anything that is unclear, and do not add rooms.
2. The finished painting of Deedee and Boppy's house, the grandparents' home in this game. It is the inspiration for how every picture in this game is painted. Match its hand-painted, hand-brushed look: visible brush strokes, matte painted surfaces, warm golden light from the upper left, soft painted shadows, rich warm color, a fine canvas grain. Take only how it is painted.

${ART}

THE PLACE
- ${a.look}
- Size and shape: the map is ${a.w} x ${a.h} tiles, so the final plate is ${a.w * 64} x ${a.h * 64} pixels, a ${(t).toFixed(2)} to 1 shape. Paint the whole picture at ${near[0]} (${near[0] === '16:9' ? '1920 x 1080' : near[0] === '9:16' ? '1080 x 1920' : 'the nearest standard size'}) and compose it edge to edge: full bleed, no frame, no black or white margins. ${fit}
- Camera: the elevated three-quarter view, about 35 degrees down. We see the back wall and a hint of the side walls, and the floor fills most of the picture. The scene is one uninterrupted space, painted at one consistent scale: a standing adult is about two tiles tall, which is roughly 1 part in ${Math.round(a.h / 2)} of the picture height.
- Walkable floor: continuous floor under everything, with clear open lanes at least two tiles wide (about one tenth of the picture width) between furniture, so characters can walk everywhere the map needs. ${a.walk}
- Doors and exits (they must be visible and clearly open, painted as plain doorways or openings, not as signs): ${exits || 'none'}. Keep exits inside the picture, not hidden under props.
- Landmarks, painted large with a visible base and crisp silhouette so they can be layered over a character:
${a.items.map(i => '  * ' + i).join('\n')}${sg}
- Palette and light: ${a.light}

${EXCL}
${a.signs ? 'Apart from the sign lettering above, there is no text anywhere.' : NOTEXT}
${SAME}`;
}

const B = [
  { id: 'school', name: 'Long Island Elementary (the hallway)', w: 30, h: 18, what: 'the main hallway of Long Island Elementary, an old school where every clock is wrong',
    look: 'A long, wide school hallway at night with polished cream linoleum, a row of classroom doorways on the back wall, tall windows with a violet dusk glow, and warm hanging lamps.',
    walk: 'The hallway floor is the main lane; a wide opening in each classroom doorway lets characters step in a short way.',
    exits: [['double glass doors to the schoolyard', 14.5, 17]],
    items: ['at the back wall, three classroom doorways: the Art room at the left (easels, an art table and a drying rack of paintings visible inside), the Music room in the middle (an upright piano visible inside), and the Gym at the right (wooden court floor and a hoop visible inside), each with a round school clock above the door, hands in odd positions and no numerals', 'a corkboard on the wall covered in crayon drawings (no writing)', 'a glass trophy case with gold trophies at the center right', 'a drinking fountain on the left wall', 'a sign-up table with pens on strings at the right', 'a lost and found bin full of mittens and hats near the right', 'big double doors at the right end of the hallway', 'a staff room door at the bottom left', 'rows of metal lockers along the lower wall'],
    light: 'warm lamp light #FFE1A0 on cream linoleum #E8DCC0, school green #5F8A70 lockers, violet dusk #7C6AA8 through the windows, shadows #5A4A55.' },
  { id: 'cafetorium', name: 'The Cafetorium', w: 20, h: 14, what: 'the cafetorium, half cafeteria and half auditorium, with a stage at the top',
    look: 'A school cafeteria and auditorium in one room: a raised wooden stage with curtains at the top, folding lunch tables on the floor, a tiled floor, tall windows, and a feel of a place that is waiting for something.',
    walk: 'Leave a clear aisle from the left door to the middle and up to the stage.',
    exits: [['doorway on the left to the hallway', 1, 5]],
    items: ['a raised stage across the whole top wall, with dark red curtains half open and a wooden podium at the center front of it', 'four long folding lunch tables with attached stools, two on each side, spaced for walking', 'a milk cooler on the right wall', 'a plain painted board on the right wall (blank)', 'stacked folding chairs along a side wall'],
    light: 'warm stage light #FFE1A0 on the podium, cafeteria tile #D9CDB0, curtain red #8A3A3A, school green #5F8A70, shadows #5A4A55.' },
  { id: 'stacks', name: 'The Stacks', w: 30, h: 22, what: 'the Stacks under the Hush Library, miles of tall shelves and whispering books',
    look: 'A huge underground library of tall wooden bookshelves, rolling ladders and warm hanging lamps over a polished wooden floor, with aisles winding between the shelves. Fiction at the top left, Nonfiction at the top right, a picture-book corner at the bottom.',
    walk: 'Aisles between shelf blocks are wide and winding; keep a wide central crossing and a clear route from the left door to the double doors at the top.',
    exits: [['wooden door at the left edge to the library', 0, 10], ['tall double doors at the top center to the Reading Room', 14.5, 1]],
    signs: '"FICTION" over the top-left shelves, "NONFICTION" over the top-right shelves and "PICTURE BOOKS" over the bottom corner',
    items: ['tall wooden bookcases in two blocks at the top left and top right, with a rolling ladder against the right block', 'tall double doors at the top center, set in the back wall', 'a big globe on a stand in the middle', 'a returns cart with a few books', 'a reading table with a green lamp on the right', 'low shelves, a beanbag and a story-time chair in a picture-book corner at the bottom', 'a rug in the center crossing'],
    light: 'warm lamp gold #FFD890 on polished wood #A5703F, deep green shade lamps #3F7050, shelf brown #6B4528, shadows #4A3528.' },
  { id: 'readroom', name: 'The Reading Room', w: 20, h: 14, what: 'the Reading Room, the oldest room in the Hush Library, with a dais and one very old book',
    look: 'A quiet old reading room: dark wood paneling, leather chairs, long reading tables with green lamps, a raised dais at the top with a lectern, and high shelves of old books.',
    walk: 'Keep a central aisle from the bottom doors to the dais, and clear floor around each table.',
    exits: [['double doors at the bottom center to the Stacks', 9.5, 13]],
    items: ['four long reading tables with green glass lamps, two on each side of the central aisle', 'a raised wooden dais at the top with a lectern holding a large open old book (no readable writing)', 'a big antique globe on a stand at the right', 'high shelves of old leather books on both side walls', 'a long runner rug down the center aisle'],
    light: 'green lamp glow #7FB070 with warm gold #FFD890, dark wood #5A3A25, leather brown #7A4A30, shadows #3A2A20.' },
  { id: 'moonclub', name: 'The Moon Club (the ballroom floor)', w: 30, h: 22, what: 'the Moon Club, a faded 1971 supper club behind the observatory',
    look: 'A faded supper club with velvet booths, brass fittings, marble and a parquet dance floor, dusty and glamorous: a coat check at the top left, a card room at the top right, a ballroom floor at the bottom, and dome doors at the top.',
    walk: 'Keep a wide open parquet dance floor in the middle and clear paths from the left door to the dome doors at the top.',
    exits: [['door at the left edge to the observatory', 0, 10], ['tall double doors at the top center to the Dome', 14.5, 2]],
    items: ['a coat check counter with a coat rail at the top left, velvet rope posts around it', 'two card tables with green felt tops and velvet chairs at the top right', 'tall double doors at the top center, brass trimmed', 'three standing mirrors with brass frames in the middle', 'a brass plaque on a pillar (blank)', 'potted palms in brass pots', 'velvet booths along the walls', 'a big parquet dance floor with a worn star pattern in the middle of the room'],
    light: 'dusty gold #D9B06A, velvet burgundy #6E2A3A, marble cream #E5DCCB, midnight blue #2F3A5F shadows, warm lamp #FFE1A0.' },
  { id: 'dome', name: 'The Dome', w: 20, h: 14, what: 'the Dome, the top of the Moon Club: a glass dome ballroom with a bandstand',
    look: 'A round ballroom under a big glass dome skylight, full of night sky; a small bandstand at the top, a polished circular floor, and potted palms.',
    walk: 'Keep the middle of the floor clear and open, with a lane to the bandstand.',
    exits: [['double doors at the bottom center to the club', 9.5, 13]],
    items: ['a small raised bandstand at the top with band chairs and music stands (blank sheets)', 'a polished round floor with an inlaid star pattern', 'potted palms at the lower left and lower right', 'an old brass telescope at the right edge', 'curved glass dome panes overhead with stars and a moon, light falling onto the floor'],
    light: 'silver moonlight #C8D8F0 and warm gold #FFE1A0 accents, deep blue #2A3A6A shadows, brass #C9A55A.' },
  { id: 'terminal', name: 'Terminal Zero', w: 30, h: 22, what: 'Terminal Zero at Long Island Regional, an airport terminal closed since 1989',
    look: 'A big empty 1980s airport terminal: tall windows onto a dusk sky, rows of blue seats, a baggage carousel, a security checkpoint at the top left and baggage claim at the top right, with the lights just come back on.',
    walk: 'Keep a wide central concourse from the bottom doors up to the gate doors at the top, with open floor in the lounge and by the carousel.',
    exits: [['wide glass doors at the bottom center to the town', 14.5, 21], ['gate doors at the top center to Gate Zero', 14.5, 1]],
    signs: '"GATE ZERO" on a hanging sign over the top doors',
    items: ['a metal-detector arch with an x-ray belt and gray bins at the top left, belt posts with straps', 'a baggage carousel with a few abandoned suitcases at the top right, and a luggage cart', 'a lost and found window at the right', 'a split-flap departure board in the middle, with blank flaps', 'plants in planters', 'gate benches and rows of blue seats along the left lower side, a lounge area at the bottom left', 'big windows along the back and sides showing a violet and peach sky'],
    light: 'violet dusk #7E6AA8 and peach #F2B792 through windows, terminal blue #3A6EA5 seats, tile gray #CFCBD0, warm lamp #FFE1A0, shadows #4A4560.' },
  { id: 'gatezero', name: 'Gate Zero', w: 20, h: 14, what: 'Gate Zero, an empty 1980s airport gate with a podium and a jet bridge door',
    look: 'An empty airport gate lounge at dusk: rows of blue seats, a podium under a split-flap board, big windows onto the apron and a jet bridge door at the top right.',
    walk: 'Keep a central lane from the bottom doorway up to the podium and the jet bridge door.',
    exits: [['doorway at the bottom center back to the terminal', 9.5, 13]],
    items: ['a gate podium at the top left under a split-flap board (blank flaps)', 'a jet bridge door at the top right with a rubber seal', 'four groups of blue gate seats, two at the upper sides and two lower', 'plants in planters at the lower left and lower right', 'big windows along the back wall onto a dusk apron'],
    light: 'violet dusk #7E6AA8 and peach #F2B792, blue seats #3A6EA5, warm lamp #FFE1A0, shadows #4A4560.' },
  { id: 'flightzero', name: 'Flight Zero (the cabin)', w: 19, h: 7, what: 'Flight Zero, the cabin of a plane that has waited since 1989, Delta One',
    look: 'The inside of a long, wide airliner business class cabin seen from above and the side, as a cutaway: two rows of private pod seats with a central aisle, small windows, warm cabin lights and overhead bins.',
    walk: 'The central aisle runs the whole length and stays clear; the aisle is the walkable floor.',
    exits: [['cabin door at the right end', 17, 3]],
    items: ['two rows of pod seats, five along the back wall and a lower row along the front, with one seat holding a folded blanket', 'a service cart in the aisle area at the right', 'a cabin door at the right end', 'round oval windows along the back wall with dusk light', 'overhead storage bins running along the top'],
    light: 'cabin gray-blue #6A7A92, warm cabin light #FFE1A0, seat navy #2F3F6A, violet dusk #7E6AA8 in the windows, shadows #3A3A55.' },
  { id: 'gate00', name: 'Gate 00', w: 20, h: 14, what: 'Gate 00 in Terminal Infinity, an airport gate where it is always dusk and every flight is on time',
    look: 'An airport gate lounge frozen at dusk: gate seats, a podium in the middle, a departure board, big windows with a violet sky and warm gate lights, and a doorway at the right.',
    walk: 'Keep a clear lane from the bottom center to the podium and across to the doorway on the right.',
    exits: [['wide doorway on the right wall to the concourse', 19, 6.5]],
    items: ['a gate podium in the middle top', 'a departure board on the left wall (blank panels)', 'four sets of gate seats around the room', 'a yoga mat unrolled at the left', 'a luggage cart at the left edge', 'two plants in planters', 'big windows along the back wall onto a violet dusk sky'],
    light: 'violet dusk #7E6AA8, warm gate lights #FFC878, peach #F2B792, seat teal #3F6E7A, shadows #4A4560.' },
  { id: 'concourse', name: 'The Endless Concourse', w: 40, h: 14, what: 'the Endless Concourse of Terminal Infinity, an airport concourse frozen at dusk with every gate paused',
    look: 'A very long airport concourse running left to right, with a row of gates along the back wall, a moving walkway along the floor, boarding benches, and big windows on a violet dusk sky. Everything is still and orderly.',
    walk: 'A broad open floor runs the full length of the hall, with a moving walkway in the lower middle and benches that do not block the main lane.',
    exits: [['doorway at the far left edge back to Gate 00', 0, 7.5], ['a huge door at the far right end, the biggest thing in the hall', 37.5, 3]],
    signs: '"GATE 1", "GATE 3", "GATE 5", "GATE 7" and "GATE 9" on five gate signs along the back wall, and "GATE INFINITY" over the big door at the far right',
    items: ['five gate podiums with signs along the back wall at even spacing, each with a closed jet bridge window', 'a standby desk in the middle', 'a lost and found door in the lower middle', 'boarding benches in three places along the lower wall', 'a checkpoint rope on brass posts across the right middle', 'a jet bridge window and the big door at the far right', 'a plant at the left end', 'a moving walkway strip along the floor'],
    light: 'violet dusk #7E6AA8 and peach #F2B792, warm gate lights #FFC878, polished floor #D0C6D2, shadows #4A4560.' },
  { id: 'subdepot', name: 'Sub-Rail Depot', w: 24, h: 12, what: "the Sub-Rail Depot, Sal and Sol's underground mail network station",
    look: 'A hand-dug underground station with tiled walls, one platform, tracks running east into a dark tunnel, strung work lights, mail crates and a dispatch console.',
    walk: 'A broad platform runs the full width, with clear space around the console and a path to the tunnel mouth on the right.',
    exits: [['stairs at the upper left up to the street', 1.5, 4], ['tunnel mouth at the right edge', 23, 3.5]],
    items: ['a dispatch console with levers and lights at the left top', 'a route map on the wall (colored lines only, no writing)', 'a station sign (blank board)', 'a coffee machine at the right', 'mail crates and stacked sacks at the lower left', 'platform benches', 'a hand car on the rails in the middle', 'a work lamp on the right', 'rails running to the right into a dark tunnel'],
    light: 'warm bulbs #FFD890 on cream tile #DDD2B8, tunnel brown #6B4F3A, rust #A5603A, dark shadows #3A3028.' },
  { id: 'subtunnel', name: 'The Transcontinental Sub-Rail', w: 36, h: 12, what: 'the Transcontinental Sub-Rail, a long hand-dug subway tunnel',
    look: 'A very long subway tunnel running left to right, with tiled arches, two railway tracks, stalled train cars, strung work lights and cable bundles, and walkable platforms on both sides of the tracks.',
    walk: 'Platforms on both sides of the tracks carry the walkable floor; stalled cars block the tracks in the middle.',
    exits: [['door at the far left to the depot', 0.5, 2], ['door at the far right to a cavern', 34.5, 2]],
    items: ['five mile marker signs along the back wall (blank boards)', 'four stalled subway cars sitting on the tracks in a staggered row', 'two coffee machines on the lower platform', 'cable bundles hanging and lying along the walls', 'a pile of rubble on the lower platform', 'strung work lights along the ceiling'],
    light: 'warm bulbs #FFD890 on green tile #5F8A70 and cream #DDD2B8, rail rust #A5603A, dark shadows #2A3028.' },
  { id: 'subchamber', name: 'Under the Amber', w: 26, h: 14, what: 'a cavern at the end of the sub-rail, with a wall of amber the size of a house',
    look: 'A rough rock cavern at the end of a bore, with a glowing amber wall the size of a house across the back, rubble, work lamps on tripods, and scored marks where a huge worm has dug.',
    walk: 'A broad packed-earth floor with clear lanes around the rubble and a wide open arena in the middle.',
    exits: [['tunnel doorway at the upper left', 1.5, 3]],
    items: ['a huge translucent amber wall across the back with a faint dome shape and a glow behind it', 'five piles of rubble and broken rock', 'two work lamps on stands', 'tunnel rails ending at the left', 'rough rock walls with timber supports'],
    light: 'glowing amber #FFB347 and gold #FFD890 against dark rock brown #4A3528, warm lamp pools, shadows #2A2018.' },
  { id: 'towerlobby', name: 'The Glass Tower (lobby)', w: 22, h: 14, what: 'the lobby of the Glass Tower, sixty floors of glass in Downtown LA, with every clock reading the same time',
    look: 'A cold, grand glass office lobby: a marble floor, a long reception desk, tall glass walls onto a city dusk, and lifts that are out of order.',
    walk: 'A wide open marble floor with a central lane from the bottom doors to the reception desk and east door.',
    exits: [['glass doors at the bottom center to the street', 10.5, 13], ['door at the right wall to the stairwell', 21, 7.5]],
    items: ['a long reception desk with a big round clock above it (no numerals)', 'a floor directory board (blank)', 'a coffee machine at the left', 'three framed pictures of sunny afternoons on the wall', 'four potted plants', 'three lobby benches', 'a bank of lift doors at the left'],
    light: 'pale amber #F0D6A0 and cold steel blue #7A98B8, marble white #E8ECF0, glass teal #4A7A8A, shadows #4A5568.' },
  { id: 'towerstairs', name: 'The Stairwell', w: 18, h: 42, what: 'the stairwell of the Glass Tower, many flights of switchback stairs',
    look: 'A tall concrete and steel stairwell seen from the front, with flights of stairs that switch back left and right as they climb, steel railings, landing platforms with numbered doors (blank), and cold light.',
    walk: 'The stairs and landings are the walkable floor; each landing is wide.',
    exits: [['door at the bottom left to the lobby', 2.5, 39]],
    items: ['many switchback flights of stairs with a cold steel railing, climbing the whole height of the picture', 'a landing every few flights with a gray metal door beside it', 'a coffee machine on several landings', 'a sealed door at the very top', 'an open safe on one landing', 'a window slit with city light at the top'],
    light: 'pale amber #F0D6A0 and cold gray #8A98A8, steel #5A6678, concrete #B8BCC0, shadows #3A4455.' },
  { id: 'towershelves', name: 'The Shelf Hall', w: 28, h: 14, what: 'the Shelf Hall of the Glass Tower, the Archive, with six shelves each holding a paused town',
    look: 'A long gallery of grey metal shelves, six of them in two rows, each holding tiny glass snow globes and little paused towns on its shelf; display cases, velvet benches and an express lift.',
    walk: 'A wide aisle runs between the shelf rows and around them.',
    exits: [['a service hatch at the left wall', 0, 4]],
    items: ['six tall grey metal shelves in two rows, each holding rows of snow globes', 'an express lift door at the top right', 'a coffee machine', 'three velvet benches in the middle', 'two glass display cases, one at each end', 'a service hatch in the left wall'],
    light: 'pale amber #F0D6A0 and cold steel #8AA0B8, shelf gray #7A8490, velvet red #7A3A4A, snow-globe glints, shadows #3A4455.' },
  { id: 'towervault', name: 'The Vault', w: 22, h: 14, what: 'the Vault on floor 59 of the Glass Tower: one plinth, one snow globe and one very big lens',
    look: 'A dark round vault with a central plinth holding a large glowing snow globe, glass display cases, a bench and a large lens on the ceiling, and a lift door at the top.',
    walk: 'An open floor around the plinth and clear lanes to the lift.',
    exits: [['doorway at the bottom center to the lobby', 10.5, 13]],
    items: ['a plinth in the middle holding a glowing snow globe', 'a lift door at the top center', 'four glass display cases, two at each side', 'a bench at the left and a coffee machine at the right', 'a large glass lens overhead casting light'],
    light: 'pale amber #F0D6A0 and cold steel blue #5A78A0, dark glass #2A3548, snow-globe glow, shadows #1F2838.' },
  { id: 'towerpinnacle', name: 'The Chronos Loom (floor 60)', w: 22, h: 15, what: 'floor 60 of the Glass Tower, the Chronos Loom chamber',
    look: 'A vast glass chamber at the top of the tower, with a house-sized loom at the north wall whose threads are glowing afternoon scenes, dark glass walls, gold light, and a view of the whole city at night.',
    walk: 'A wide open glass floor in front of the loom with clear lanes.',
    exits: [['doorway at the bottom center down to the vault', 10.5, 14]],
    items: ['a huge brass and glass loom with glowing gold and rose threads at the top, big enough to fill a third of the picture width', 'two big clocks on the back wall, no numerals', 'two display cases', 'two potted plants', 'floor to ceiling dark glass windows with city lights'],
    light: 'glowing gold #FFD890 and rose #E89A9A against dark glass #1F2A40, warm lamp pools, shadows #141A2A.' },
  { id: 'deadletter', name: 'The Dead-Letter Office', w: 26, h: 17, what: 'the Dead-Letter Office, an underground mail sorting hall where everything nobody could deliver ends up',
    look: 'An underground mail sorting hall with conveyor belts, wooden pigeonholes full of letters, hanging lamps with dusty light, and a giant open ledger on a central desk, with four doors along the back wall.',
    walk: 'A broad central floor with a clear lane from the bottom doors to the claim desk and to each of the four doors.',
    exits: [['double doors at the bottom center to the street', 12.5, 16], ['four doors along the back wall: at the left, left center, right center and right', 4, 3]],
    items: ['a big claim desk with a giant open ledger in the middle of the hall', 'two conveyor belts, one at each side', 'mail sacks', 'two waiting benches', 'two hanging lamps', 'an oversized rubber stamp on a stand at the right', 'a wall of wooden pigeonholes full of letters behind the desk'],
    light: 'dusty lamplight #E8C078 on aged wood #8A5A35, paper cream #E8DCC0, deep brown shadows #3A2A1F, a touch of teal #3A6A70.' },
  { id: 'memgrace', name: "The Gym Floor (Grace's memory)", w: 16, h: 11, what: "Grace's memory room: a gym floor with a balance beam, where somebody always came early",
    look: 'A warm school gymnasium floor of polished wood, with a balance beam, a scoreboard, a chalk bucket, a trophy shelf, a folding chair, and a soft golden glow that feels like a memory.',
    walk: 'Open gym floor with clear lanes around the beam.',
    exits: [['doorway at the bottom center', 8, 10]],
    items: ['a balance beam on low stands at the left', 'a scoreboard on the wall (blank)', 'a chalk bucket at the left wall', 'a folding chair at the right', 'a trophy shelf at the top right', 'a pedestal in the upper right, empty, with a soft glow', 'three soft glowing pages of paper floating a little above the floor'],
    light: 'warm golden #FFD890 and soft pink #F0A8B0, gym wood #C9965A, shadows #6A4A3A, a soft dreamy glow.' },
  { id: 'memrose', name: "The Shoulder Hall (Rose's memory)", w: 16, h: 11, what: "Rose's memory room, a hall where the ceiling is much closer",
    look: 'A tall cozy hall with a low painted ceiling, tall lamps, candle stands, a coat rack, a pillow fort, a coil of ribbon and a step stool, everything pink and soft and glowing.',
    walk: 'Open floor with lanes around the pillow fort.',
    exits: [['doorway at the bottom center', 7.5, 10]],
    items: ['two tall lamps at the top left and top right', 'a candle stand at the center top', 'a coat rack at the right', 'a coil of ribbon at the left', 'a step stool', 'a pillow fort in the middle', 'an empty pedestal with a soft glow', 'three soft glowing pink pages floating a little above the floor'],
    light: 'soft pink #F0A8B8 and warm gold #FFD890, cream floor #E8D8C0, lavender shadows #7A5A8A, a soft dreamy glow.' },
  { id: 'memamy', name: "The Finish Line (Amy's memory)", w: 16, h: 11, what: "Amy's memory room: a running track with a finish line",
    look: 'A sunny athletics track with a finish tape, a race clock, bleachers, traffic cones and a hurdle, in orange and bright sky light, like a memory.',
    walk: 'A broad track floor with clear lanes between the cones and the hurdle.',
    exits: [['doorway at the bottom center', 7.5, 10]],
    items: ['bleachers at the top left', 'a finish tape across the right', 'a race clock at the top center (no numerals)', 'two orange traffic cones', 'a low hurdle', 'an empty pedestal with a soft glow', 'three soft glowing orange pages floating a little above the floor'],
    light: 'bright orange #F2A060 and warm gold #FFD890, track red-brown #B5543A, sky blue #8AB8D8, shadows #6A3A2A.' },
  { id: 'memtnb', name: "The Kiln Room (TNB's memory)", w: 16, h: 11, what: "TNB's memory room: a warm quiet clay studio with a kiln",
    look: 'A warm, quiet clay studio with a big kiln glowing, a pottery wheel, shelves of cups, bags of clay, a stool, and a tool rack, smelling of clay and warm brick.',
    walk: 'Clear floor around the wheel and between the shelves.',
    exits: [['doorway at the bottom left of center', 6, 10]],
    items: ['a kiln with a glowing mouth at the top left', 'a pottery wheel at the right', 'a shelf of cups at the top center', 'bags of clay at the top right', 'a stool', 'a tool rack on the right wall', 'an empty pedestal with a soft glow', 'three soft glowing warm pages floating a little above the floor'],
    light: 'warm amber #FFB868 and clay brown #A5603A, cream #E8D8B8, soft rose #E8A890, shadows #5A3A2A.' },
  { id: 'stillcore', name: 'The Stillness Core', w: 26, h: 17, what: 'the Stillness Core behind the sky clock, home of the Forever Engine',
    look: 'A clockwork chamber of gold gears and stopped clocks, cold blue and warm gold, with eight sealed doors in two rows on the back wall and a lift in the middle.',
    walk: 'A broad open floor between the doors and the lift, with a clear lane from the bottom doorway.',
    exits: [['doorway at the bottom center down to the vault', 13.5, 16]],
    items: ['eight sealed round doors in two rows of four on the back wall, each in its own brass frame', 'a lift platform in the middle', 'a bench at the left, a coffee machine and a plant at the lower left', 'stopped clocks and big gold gears in the walls', 'a small white box on a stand at the lower right'],
    light: 'cold blue #5A7AB0 and warm gold #E8B860, brass #C9A55A, dark navy #1F2A48 shadows.' },
  { id: 'foreverheart', name: 'The Forever Engine', w: 22, h: 15, what: 'the Forever Engine, the heart of the Clockwork Moon',
    look: 'A huge column of gears rising from the middle of the back wall, with two very large gears at its sides, stopped clocks and a bright core, in a round chamber with an open arena floor.',
    walk: 'A wide circular arena floor in the middle, completely open.',
    exits: [['doorway at the bottom center', 10.5, 14]],
    items: ['the engine, a tall column of interlocking gold gears and glowing glass at the top center', 'two very large gears on either side of it', 'two stopped clocks on the back wall', 'two potted plants', 'four small glowing relay pads around the arena (plain round plates)'],
    light: 'warm gold #FFD060 and cold blue #4A6AA0, dark navy #1A2240 shadows, brass #C9A55A.' },
  { id: 'oak', name: 'Inside the Old Oak', w: 24, h: 20, what: 'the inside of the Old Oak in Jefferson Park, a hollow trunk with a war room, a pantry and a long way up',
    look: 'The hollow brown inside of a giant oak trunk: bark walls, a corkboard war room at the upper left, a squirrel library, a pantry and bucket at the upper right, a stove, a tea table and a cozy bed in the middle, and a wide gap in the center with a ladder.',
    walk: 'Stairs and wide bark ledges on the left and right climb around a central open shaft; the middle route is the way up.',
    exits: [['opening at the bottom center to the park', 11.5, 19], ['opening at the top center to the crown', 11.5, 0]],
    items: ['a corkboard on the left with pinned maps and notes (blank)', 'squirrel-sized bookshelves and a scroll case', 'a tiny bookcase and a pantry counter with jars', 'a bucket on a rope at the upper right', 'a small stove', 'a tea table with a teapot', 'a cozy bed with a quilt', 'a gap in the floor in the middle with a rope ladder going up'],
    light: 'warm gold #FFD890 sun shafts through knotholes, bark brown #6B4528, moss green #6A8A4A, shadows #3A2A1F.' },
  { id: 'crown', name: 'The Crown of the Oak', w: 20, h: 16, what: 'the crown of the Old Oak, the leafy top with a hoard and a view',
    look: 'The leafy sunlit crown of a giant oak: a wide platform of branches ringed by leaves, a hoard of acorns piled high, lookout telescopes and a view of the LA skyline.',
    walk: 'A broad round platform of branches with clear lanes around the acorn piles.',
    exits: [['opening at the bottom center down into the trunk', 9.5, 15]],
    items: ['a big pile of acorns, the hoard, at the top right of center', 'three smaller acorn piles', 'two lookout telescopes on stands at the upper left and upper right', 'a wall of leaves all around with sky gaps', 'branches like a woven floor'],
    light: 'bright sun #FFE1A0, leaf green #6A9A4A, sky blue #9AC8E8, hazy skyline #B8A8B8, shadows #3A5A3A.' },
  { id: 'stage7', name: 'Soundstage 7', w: 24, h: 18, what: 'Soundstage 7, a film studio sound stage with a wardrobe area and a fog machine',
    look: 'A dim huge soundstage with dark rafters, a lit set at the back with stairs to a stage set, wardrobe racks on the left, fog machines on the right, road cases, a camera dolly and a light rig.',
    walk: 'A broad concrete floor with lanes between the equipment and clear paths to the door and the stairs at the top.',
    exits: [['big sliding door at the bottom center to the backlot', 9.5, 16], ['stairs at the top right to the stage set', 15.5, 3]],
    items: ['a costume rack at the left', 'two road cases', 'a video village table with monitors at the top right', 'a camera on a dolly', 'two fog machines at the right with wisps of fog', 'a strip of spike tape on the floor', 'a light rig hung from the rafters', 'three colored junction boxes in red, blue and amber', 'a staircase with a rail at the top right leading toward the set'],
    light: 'dim blue-gray #3A4560 with pools of warm key light #FFE1A0, red #B54A3A, blue #3A5AA0 and amber #E8A838 accents, shadows #1A1E2A.' },
  { id: 'stageset', name: 'The Stage Set', w: 20, h: 14, what: 'the stage set, a ruined castle that is not a castle, under forty lights',
    look: 'A film set of a ruined castle made of painted plywood and plaster, lit by forty stage lights, with a painted backdrop, a camera crane, a director\'s chair, crates and a lantern post.',
    walk: 'A broad set floor with a wide central lane to the castle stairs at the top.',
    exits: [['wide opening at the bottom center to the soundstage', 10, 13]],
    items: ['a painted castle wall backdrop with a broken tower, painted to look like stone from a distance and plywood from the edges, at the top center', 'a costume rack', 'a camera crane at the right', 'a director\'s chair', 'a lantern post at the left', 'prop crates', 'a light on a stand', 'a short flight of stone-like stairs to the top of the set'],
    light: 'forty hot stage lights #FFE1A0, painted stone gray #8A8A92, warm shadows #4A3A3A, dark rafters above.' },
  { id: 'carbarn', name: 'Division Nine Car Barn', w: 30, h: 21, what: 'the Division Nine Car Barn, the old streetcar barn on Jefferson Boulevard with a paint shop, a machine shop and a lunchroom',
    look: 'A cold, high brick streetcar barn with rails in the floor, high dusty windows, and a streetcar at the top left. Paint Shop at the top left, Machine Shop at the top right, a Lunchroom at the bottom left and a turntable at the bottom right.',
    walk: 'Rails and broad aisles between the work areas; a wide central lane from the left door to the right door.',
    exits: [['big door at the left wall to the boulevard', 0, 9.5], ['door at the right wall down to the boiler room', 29, 14.5]],
    items: ['a vintage streetcar on the rails at the top left, painted green and cream', 'a drying rack of painted boards and paint cans at the top left', 'sawhorses', 'a workbench, a wheel truck and a lathe at the top right', 'a dispatch board and a crew bench and a time clock in the middle', 'three lunch tables at the bottom left', 'a round turntable pit with a motor at the bottom right', 'rails set into the floor'],
    light: 'cold dusty light #C8D0D8 through high windows with warm lamp spots #FFD890, brick red #8A4A3A, steel gray #5A6670, shadows #2A2A30.' },
  { id: 'boiler', name: 'The Boiler Room', w: 20, h: 14, what: 'the boiler room under the Car Barn: brick, coal and one cast-iron stove that remembers every biscuit',
    look: 'A dark warm boiler room of pipes, gauges and brick walls, with a big old boiler, coal bins, a cast-iron stove, a bread rack and a baker\'s bench.',
    walk: 'A broad flagstone floor with open lanes from the left door through the middle.',
    exits: [['door at the left wall to the car barn', 0, 7.5]],
    items: ['a big old riveted iron boiler with pipes and a pressure gauge at the top left', 'a coal bin at the top right', 'a coal cart at the left', 'a bread rack with loaves, a peel rack and a baker\'s bench with flour at the right', 'a stack of crates and an ash pan at the bottom', 'a cast-iron stove glowing red-orange'],
    light: 'furnace orange #F28A3A and warm gold #FFD890, brick #7A3A2A, iron black-brown #3A2A28, shadows #1F1A18.' },
];

const refFile = { cinema: 'art/starlite.webp', boiler: 'art/boilerroom.webp' };
const entries = [];
for (const r of A) {
  const rec = ROOMS_STYLE[r.id];
  entries.push({ id: 'room-' + r.id, tab: 'Rooms', title: `${r.name}, square, installed plate attached as layout reference`, ar: '1:1',
    refs: [refFile[r.id] || `art/${r.id}.webp`, KEY], prompt: roomA({ ...r, style: rec }) });
}
for (const a of B) {
  const near = nearest(a.w / a.h);
  entries.push({ id: 'room-' + a.id, tab: 'Rooms', title: `${a.name}, ${a.w} x ${a.h} tiles, installed plate attached as layout reference`, ar: near[0],
    refs: [refFile[a.id] || `art/${a.id}.webp`, KEY], prompt: roomB({ ...a, exits: a.exits }) });
}
module.exports = { entries };
