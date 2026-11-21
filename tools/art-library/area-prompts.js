// Areas tab: 7 Long Island area paintings (verbatim from the Project prompt packs) with their chained cutout stencils,
// plus 6 Los Angeles area paintings built from the same structure, each with its own stencils (LA_STENCILS). Painting prompts live in prompts/areas/*.txt.
const fs = require('fs');
const P = n => fs.readFileSync(__dirname + '/prompts/areas/' + n + '.txt', 'utf8').trim();
const entries = [];
const HOUSE_REF = 'art/grands.webp';   // Deedee and Boppy's house painting: the style inspiration for every area (Tom 11-05)

// ---- stencil template (Tom 11-05: name only what to keep; never list what to remove) ----
function stencil(name, s) {
  return 'IMAGE REQUEST: ONE SINGLE IMAGE. Return exactly one image, nothing else. Use the attached ' + name.replace(/ \(.*\)/, '') + ' painting.\n\nCopy out only ' + s.only + ' Each one stays exactly where it is in the painting, at exactly the same size, on the same canvas size and framing. Put them on a plain, flat, pure magenta #FF00FF background with crisp, clean edges. Deliver the image itself.';
}
function area(id, name, file, ar, refs, noun, stencils, paintNote) {
  if (refs.length) refs = [id === 'square' ? 'art/raw/areas/area-square-v4.png' : 'art/' + id + '.webp', HOUSE_REF];   // layout and details (Square: the picture Tom approved 11-05 19:07; others: installed plate), house painting = style
  entries.push({ id: 'area-' + id, tab: 'Areas', title: name + ': painting (' + (refs.length ? 'attach the listed picture' + (refs.length > 1 ? 's' : '') : 'fresh generator chat, nothing attached') + ')' + (paintNote || ''), ar, refs, prompt: P(file) });
  stencils.forEach((s, i) => entries.push({
    id: 'area-' + id + '-cut' + (i + 1), tab: 'Areas',
    title: name + ': stencil ' + (i + 1) + ' of ' + stencils.length + ', ' + s.name + ' (same chat, send after the painting is approved)',
    ar, refs: ['art/raw/areas/area-' + id + '-v1.png'],
    prompt: stencil(name, s)
  }));
}

area('square', 'The Square', 'square', '1:1', [HOUSE_REF], '', [
  { name: 'trees', only: 'its trees and its tall bushes and hedges, each with its full leaf canopy, branches and trunk down to where the trunk meets the ground, including the trees along all four edges.' },
  { name: 'posts, lamps and signs', only: 'its street lamps, its three green exit boards with their posts, its hanging shop signs with their iron brackets, and the small lanterns by the doors.' },
  { name: 'roofs, eaves and awnings', only: 'the roof of each of the eight shops, from the very top (with its chimney, steam and every roof decoration such as the owl, the dome, the weathervane, the teapot, the telescope and the roof sign) down to just below the eaves, together with every awning or canopy over a door or window.' },
  { name: 'tall props', only: 'its taxi, tire stack, brass globe, telescope on its tripod, velvet rope posts, cafe table and chairs, mailbox, drop box and parcel stack, bread rack and flour sacks, reading bench, wheelbarrow and plant shelf, barrels, the two plaza benches with their flower barrels, and the upper tiers and spout of the fountain, each whole down to where it touches the ground.' }
], ' (redo of the live plate, 1920 x 1664)');

area('row', 'Rivituso Row', 'row', '1:1', [HOUSE_REF], '', [
  { name: 'trees and tall plants', only: 'its trees, tall bushes, hedges, cypresses and climbing roses, the flowering lilac tree, and the tall sunflowers, each with its full leaf canopy or flowers and its trunk or stem down to where it meets the ground.' },
  { name: 'lamps, boards, signs and garden posts', only: 'its street lamps from lantern to base, its two green exit boards with both posts and their stone bases, the three house signs with their mounts, the scarecrow and the tomato trellis.' },
  { name: 'roofs, porch roofs, balcony and awning', only: 'the roof of each of the three houses with its dormers, iron railing, chimneys and smoke, the eaves, the porch roofs with their posts, the bay window roof, the iron balcony with its flower boxes and the hat and scarf on it, and the striped awning, cut straight across just below the eaves, porch roof and awning.' },
  { name: 'tall props', only: 'its two bikes and scooter, sports net, shoe rack, porch bench with the violin case, balance beam, two rocking chairs, porch railing, fishing rods and tackle box, little cafe table and chair, two stone flower urns, two wooden benches, and the potted plants on the porch steps, each whole down to where it touches the ground.' }
], ' (v3 spelling and sign words, 1536 x 1408)');

area('hollow', 'Grump Hollow', 'hollow', '1:1', [HOUSE_REF], '', [
  { name: 'trees and tall plants', only: 'its trees, tall bushes, brambles and fern clumps, and the tall cattails and reeds at the pond edge, each down to where it meets the ground.' },
  { name: 'exit board and posts', only: 'its green exit board with both posts down to the ground, and the fence posts beside the entrance trail.' },
  { name: 'boulders, stumps and standing logs', only: 'its mossy boulders, tree stumps, and upright or leaning logs, each whole down to where it touches the ground.' },
  { name: 'tall props', only: 'its soggy wooden bench, Boppy\'s small bench on the pond shore with the thermos, bucket and leaning fishing rod, and any tall mushroom clump, each whole down to where it touches the ground.' }
]);

area('pier', 'Cattail Pier', 'pier', '1:1', [HOUSE_REF], '', [
  { name: 'trees and tall plants', only: 'its trees, tall bushes, and the tall cattails and beach grass clumps, each down to where it meets the ground.' },
  { name: 'posts, boards and signs', only: 'its two green exit boards with both posts, the fish-shaped bait sign, and every tall railing post and mooring post with its rope, down to the deck or water.' },
  { name: 'shack roof, eaves and awning', only: 'the roof of the bait shack with its shingles, moss, fish weathervane and chimney, the eaves, the striped awning, and the nets and buoys hanging from the eaves, cut straight across just below the eaves and awning.' },
  { name: 'tall props', only: 'Boppy\'s bench with the thermos, the barrels and minnow tank, the stacked crates and lobster trap, the folding stool, bucket and tackle box, and any tall rock, each whole down to where it touches the ground or deck.' }
]);

area('reeds', 'Whispering Marsh', 'reeds', '1:1', [HOUSE_REF], '', [
  { name: 'reeds, cattails and trees', only: 'its tall reed and cattail clumps, the two very tall old reed clumps at the top left path, every tree and the twisted dead tree, each down to where it meets the water or ground.' },
  { name: 'posts and exit boards', only: 'its two green exit boards with both posts, and every boardwalk post and mooring post with its rope, down to the planks or water.' },
  { name: 'stumps and tall props', only: 'its mossy stumps, the half-sunken rowboat, and its tall rocks, each whole down to where it meets the water or ground.' }
], ' (the game draws the reeds that block the top left path until the story opens it)');

area('sundial', 'Sundial Hollow', 'sundial', '1:1', [HOUSE_REF], '', [
  { name: 'trees and tall plants', only: 'its trees with their full canopies, trunks and big roots, its tall bushes and fern clumps, and the tall cattails around the pool.' },
  { name: 'sundial, standing stones and boulders', only: 'its sundial with its pointer and upper base step, every standing stone, and every mossy boulder, each whole down to where it meets the ground.' },
  { name: 'exit board and bench', only: 'its green exit board with both posts, the stone bench, and any tall glowing mushroom clump.' }
], ' (the stone channel is painted dry on purpose; the game draws the water)');

area('schoolyard', 'Long Island Elementary (schoolyard)', 'schoolyard', '4:3', [HOUSE_REF], '', [
  { name: 'trees and tall plants', only: 'its trees with their full canopies and trunks, and its tall hedges and bushes, each down to where it meets the ground.' },
  { name: 'lamps, flagpole and exit board', only: 'its lamp posts from lantern to base, the flagpole with its flag and rope, and the green exit board with both posts.' },
  { name: 'school roof, cupola and portico', only: 'the roof of the school with its edge, cupola, bell and clock, roof vents and chimneys, the eaves, and the entrance portico roof with its columns and lettering, cut straight across just below the eaves, with the portico columns whole down to the ground.' },
  { name: 'cars, playground and tall props', only: 'its three parked cars, swing set, slide with its tower, tetherball pole, bike rack with the old bike, pickup bench, playground bench, and the playground fence and gate posts, each whole down to where it touches the ground.' }
]);

// ---- Los Angeles areas: built from one template. Layout reference = the installed plate (layout only). ----
const STYLE = "A hand-painted, hand-brushed painting, in exactly the style of attachment 2, the painting of Deedee and Boppy\'s house. Visible brushwork everywhere: broad strokes for the large forms, short flicks for foliage, roof tiles, brick, wood and stone, thick ridges of paint where the light hits. Rich, warm, deep color built in layers, so warm and cool tones show through each other. Every surface is matte, like oil paint or gouache on canvas, with a fine canvas grain over the whole picture and soft painted light and shadow. Edges are painted with a small brush, slightly irregular and hand-made. NOT glossy, NOT airbrushed, NOT a digital render, NOT plastic, NOT a 3D look, NOT pixel art. No visible pixels, no thick black outlines, no photorealism, no top-down floor plan.\nFixed elevated three-quarter camera looking down into the scene at about 35 degrees, showing building fronts, roofs and walkable ground together. Same camera across the whole uninterrupted scene.";
const SCALE = 'This is a whole game map seen from high above and far away, at the same distance as the town maps of this game. The whole area fits in the picture with generous open ground. Do not zoom in on a corner and do not make props large. A grown-up person standing on a path would be only about one fifteenth of the picture height, paths are about two people wide, and each exit board is about one seventh of the picture width.';
const LAY2 = 'Paving, ground and grass continue unbroken under and behind every tree, lamp, bench, sign post and roof eave. Every tall object has a clear visible base with ground showing behind it. Clearly separated, small-brush painted silhouettes on tree canopies, lamps, boards and roof edges. Nothing floats. The game cuts trees, lamps, boards and roofs out as separate layers.';
const COLORS = 'Warm golden key light #FFE1A0 from the upper left with long soft shadows falling to the lower right, faint lilac accent in shade #C8A5DC, warm shadows #716351. Clear darker contact shadow under buildings and props, an open sunlit walkable center.';
const LA_STENCILS = {
  blvd: [
    { name: 'trees and tall plants', only: 'its palm trees, each from its fronds down to the base of its trunk, the leafy trees and tall flowering bushes along the left edge and the bottom edge, and the tall cypresses on the hillside beside the stone steps, each down to where it meets the ground.' },
    { name: 'lamps, exit boards and string lights', only: 'its street lamps from lantern to base, its three green exit boards with both posts down to the ground, and the strings of lights that hang between the buildings.' },
    { name: 'roofs, tower tops and awnings', only: 'the roof of each of the eight buildings, from the very top (with its chimneys, steam and every roof decoration such as the coffee cup, the gold star, the checkered roof sign and the coin) down to just below the eaves, the upper floors of the tall blue tower and of the movie palace above their entrance canopies, and every awning or canopy over a door or window.' },
    { name: 'tall props', only: 'its benches, flower pots and planters, newspaper boxes, mailboxes, trash bins, the fire hydrant, and the stone balustrade along the bottom edge, each whole down to where it touches the ground.' }
  ],
  jpark: [
    { name: 'trees and tall plants', only: 'its jacaranda trees, palm trees, lemon trees and every other tree, and its tall bushes, hedges and flowering shrubs, each with its full canopy or flowers and its trunk or stem down to where it meets the ground.' },
    { name: 'lamps, exit boards and mailboxes', only: 'its street lamps from lantern to base, its three green exit boards with both posts down to the ground, and the two mailboxes on their posts.' },
    { name: 'roofs, porch roofs and awnings', only: 'the roof of each of the four shops and each of the four houses with its chimney, gable and roof sign, the eaves, the porch roofs with their posts, and every awning, cut straight across just below the eaves, porch roofs and awnings.' },
    { name: 'tall props', only: 'its park bench, the two bikes, the porch chairs, the laundry line with its clothes and poles, the potted plants by the shop doors, and the wooden fences, each whole down to where it touches the ground.' }
  ],
  griffith: [
    { name: 'trees and tall plants', only: 'its oak and sycamore trees with their full canopies and trunks, its sage and chaparral bushes, and its agave and tall flowering yucca plants, each down to where it meets the ground.' },
    { name: 'exit board, signs and fence posts', only: 'its green exit board with both log posts down to the ground, the wooden trailhead sign and the small warning sign on their posts, and every trail fence post with its rope.' },
    { name: 'boulders, lookout rock, log and observatory', only: 'its boulders, the lookout rock formation with its railing, the rocks around the tar, the fallen log, and the white observatory building on the hilltop, each whole down to where it touches the ground.' }
  ],
  studio: [
    { name: 'trees and tall plants', only: 'its palm trees, cypress trees, hedges, tall bushes and flowering plants, each down to where it meets the ground or its planter.' },
    { name: 'lamps, barrier and posts', only: 'its street lamp with its banner from top to base, the wall lanterns, the striped barrier arm with its post, and the yellow bollards.' },
    { name: 'arches, booth roof and tent', only: 'the big studio arch with its star, gold sign and green board, and the west gate arch with its green board, each with both pillars down to the ground, the red tile roof of the guard booth down to just below its eaves, and the red and white tent canopy with its banner and poles down to the ground.' },
    { name: 'tall props', only: 'its three silver trailers with their steps, the golf cart, the two light stands, the director\'s chair, the cable reel, the clapperboard stand, the snack tables and equipment cases, the folding chairs, and the potted plants, each whole down to where it touches the ground.' }
  ],
  backlot: [
    { name: 'trees and tall plants', only: 'its leafy trees, the big jungle tree with its roots, the palm and banana plants, the cactus, its tall bushes and flowering plants, and the vine arch, each down to where it meets the ground.' },
    { name: 'lamps, exit board and fence', only: 'its street lamps from lantern to base, its green exit board with both stone pillars down to the ground, the iron fence with its stone posts, the blank notice board on its legs, and the hitching posts.' },
    { name: 'roofs, set tops and awnings', only: 'the roof of each Western building with its false front, the windmill and the water tower, the wooden scaffolding, the upper floors and fire escapes of the brick buildings above their awnings, every awning and porch roof with its posts, and the top of the soundstage above its big door with the red light, cut straight across just below the eaves, porch roofs and awnings.' },
    { name: 'tall props', only: 'its covered wagon, the two striped food carts, the barrels, the benches, the cafe table and chairs, the clapperboard, and the rocks and waterfall of the jungle set, each whole down to where it touches the ground.' }
  ],
  oakpark: [
    { name: 'the old oak, trees and tall plants', only: 'the huge old oak with its whole canopy, trunk and roots, every other tree with its canopy and trunk, the palms along the bottom edge, its tall hedges and bushes, and the tall sunflowers, each down to where it meets the ground.' },
    { name: 'lamps, exit board, signs and fences', only: 'its lamp posts from lantern to base, its green exit board with both posts and stone bases, the garden sign, the dog park sign, the two notice boards on their posts, the wooden fences, and the wire dog park fence with its gate.' },
    { name: 'play equipment, garden and tall props', only: 'its slide tower, swing set, climbing dome and spring rider, the garden shed and bean trellis, the picnic tables with their benches, the grill, the drinking fountain, the park benches, the trash bins, the dog ramp, hoop and tunnel, the fire hydrant, and the boulders, each whole down to where it touches the ground.' }
  ]
};
function la(a) {
  const W = a.tw * 64, H = a.th * 64;
  const refs = ['art/' + a.id + '.webp', 'art/grands.webp'];
  const text = [
    'Create the actual environment painting for ' + a.num + ', ' + a.name + ', from The Adventures of Tom, a family role-playing game. Generate the image now. Do not make a plan, presentation, diagram, infographic, example sheet, or project update.',
    'ATTACHED IMAGES (in this order): 1) the current painting of this area: use it for LAYOUT ONLY (where the paths, buildings, exits and open spaces sit); do not copy its rendering. 2) the finished painting of Deedee and Boppy\'s house, the grandparents\' home in this game. It is the inspiration for how every picture in this game is painted. Match its hand-painted, hand-brushed look: visible brush strokes, matte painted surfaces, warm golden light from the upper left, soft painted shadows, rich warm color, a fine canvas grain. Take only how it is painted. Do not copy its room, furniture, objects, people or layout.',
    'OUTPUT\nOne standalone, edge-to-edge, full-frame environmental painting. No border, title, labels, captions, grid, pins, UI, inset views, or white page. Landscape canvas, ' + W + ' x ' + H + ' pixels. If your tool cannot produce that exact size, use the closest landscape aspect at the highest resolution.',
    'STYLE AND CAMERA\n' + STYLE,
    'SCALE AND CAMERA DISTANCE (most important rule)\n' + SCALE,
    'SETTING\n' + a.setting,
    'THIS IS A WALKABLE GAME MAP: NAVIGATION COMES FIRST\nA character must be able to walk from every exit to every door and landmark and all the way around every building. No building, fence, tree or prop may wall off a route. Every path is at least two character-widths wide.\n' + a.nav,
    'LANDMARKS AND PROPS\n' + a.props,
    'SIGNS: DESIGN AND LETTER EACH ONE YOURSELF\nALL CAPITALS, large and easy to read, spelled exactly as written, letter by letter. Signs never cover a door, awning or lamp. Exit boards are green boards with carved cream-gold letters, each hung HIGH between two tall posts like an archway over its path, the board\'s bottom edge well above head height, the path open underneath.\n' + a.signs + '\nThese are the only words in the image. No other signs, notices, price tags, license plate text or logos.',
    'LAYERING\n' + LAY2,
    'LIGHT AND COLORS\n' + COLORS + ' ' + a.colors,
    'STRICT EXCLUSIONS\nNo people, no animals, no monsters. No chests, items, keys, coins, switches or collectibles. ' + a.excl + ' No grid, colored tiles, diamonds, numbered markers, map or diagram look. No title card, frame, contact sheet or palette chart.',
    'Deliver the single environment painting itself. Do not replace the painting with a description of it.'
  ].join('\n\n');
  entries.push({ id: 'area-' + a.id, tab: 'Areas', title: a.name + ': painting, painted redo (' + W + ' x ' + H + '; attach the listed pictures)', ar: a.ar, refs, prompt: text });
  // stencils (added 2026-11-11): the reference is the installed plate, as in the json for the Long Island stencils
  (LA_STENCILS[a.id] || []).forEach((s, i, all) => entries.push({
    id: 'area-' + a.id + '-cut' + (i + 1), tab: 'Areas',
    title: a.name + ': stencil ' + (i + 1) + ' of ' + all.length + ', ' + s.name + ' (same chat, send after the painting is approved)',
    ar: a.ar, refs: ['art/' + a.id + '.webp'],
    prompt: stencil(a.name, s)
  }));
}

la({ id: 'blvd', num: 'Area 08', name: 'Downtown LA', tw: 30, th: 26, ar: '1:1',
  setting: 'Downtown Los Angeles on a clear warm afternoon, a boulevard of art deco shops, lofts and a movie palace, with palm trees, awnings, string lights and warm lamp glow. Golden-hour light, long shadows, a hint of smog haze in the far distance. Friendly and lived-in, not a glass skyline.',
  nav: 'Keep the layout of the attached current painting: a wide east-west boulevard runs across the middle, from the left to the east gate at the RIGHT edge, with a sidewalk on each side. A north row of five shops stands along the top (Golden Hour Coffee, Ramen Ramen, The Starlite movie palace, Angel City Cab Co.) and a south row of buildings along the bottom (Backlot Wardrobe, TNB\'s Loft, the nine-story Grand Tower, Nickel\'s Shop), all FREESTANDING with a walkable alley between every pair and a walkway behind. In the top left corner stone steps climb to the Griffith Park trail, and a wide arch in the bottom edge at the center leads south to Jefferson Park. East edge: the road continues to the studio gate. No exit on the left edge.',
  props: 'Golden Hour Coffee: deco front, warm amber awning, round coffee cup on the roof. Ramen Ramen: red awning, paper lanterns, steam from a vent. The Starlite: a cream movie palace with a big marquee and a star on top. Angel City Cab Co.: a small cream garage with a gold roof and one yellow cab. Backlot Wardrobe: brick loft with a purple awning and a dress form in the window. TNB\'s Loft: a plain brick loft, a pottery wheel in the window. The Grand Tower: a tall blue art deco tower, nine floors. Nickel\'s: a teal corner shop with an awning and a coin on the roof. Palm trees, benches, planters, newspaper boxes, parked bikes.',
  signs: 'Building signs, each designed in that building\'s own style: COFFEE (golden hour cup sign), RAMEN (red lantern sign), STARLITE (marquee lights), CABS (checkered roof sign), WARDROBE (hanger sign), LOFTS (iron plate), GRAND (gold deco letters), SHOP (round coin sign). Exit boards: GRIFFITH PARK over the top left steps, JEFFERSON PARK over the bottom arch, STUDIO over the east road.',
  colors: 'Honey stone #EFDCBC, deco brick #A0523A, teal #2F6F73, marquee gold #FFD968, palm green #608775.', excl: 'No cars except the single cab, no buses, no billboards with ads.' });

la({ id: 'jpark', num: 'Area 09', name: 'Jefferson Park', tw: 30, th: 24, ar: '1:1',
  setting: 'Jefferson Park, a Los Angeles neighborhood of 1910 craftsman bungalows, on a warm afternoon with purple jacaranda trees in bloom, a few palms and lawns. A row of small shops on Jefferson Boulevard and four homes on the street below. Warm, close-knit and a little crowded.',
  nav: 'Keep the layout of the attached current painting: a wide north-south street runs straight down the center from the TOP edge to the BOTTOM edge, with a sidewalk on each side. A row of four shops stands along the top (Odette\'s Creole Kitchen, Pupuseria La Ceiba, the Board Room skate shop, Very Green Juice) and a row of four homes below (Tom\'s House at the lower left, Jordan and Sam\'s dark modern flip, Casa Alvarez with a crowded porch, Dakota and Ryan\'s white flip), all FREESTANDING with a walkable path between every pair and behind. The street exits through the TOP edge to Downtown and through the BOTTOM edge to Old Oak Park; a side road leaves through the RIGHT edge toward the car barn. No exit on the left edge.',
  props: 'Odette\'s: yellow walls, purple roof, a big pot on the sign, a mural. La Ceiba: cream and blue, leaf sign, a roll-down grille. Board Room: pale blue with a skateboard mural and orange awning. Very Green Juice: white and green, leaf logo. Tom\'s House: a tidy greige craftsman with a gold front door and a small front porch. Jordan and Sam: a black modern flip with a white trim. Casa Alvarez: an orange craftsman with a teal door, laundry line, bikes and many chairs on the porch. Dakota and Ryan: a white modern flip with dark trim. Jacaranda and palm trees, a bus bench, mailboxes, street lamps, hedges, front-yard lemon trees.',
  signs: 'Shop signs: CREOLE (pot sign), PUPUSAS (leaf sign), SKATE (board sign), JUICE (green leaf sign). House number plates: 3468 on Tom\'s house, 2732 on the black flip, ALVAREZ on the orange house, 2740 on the white flip. Exit boards: DOWNTOWN over the top road, OLD OAK PARK over the bottom road, CAR BARN over the east road.',
  colors: 'Jacaranda purple #8A6AB0, stucco cream #F2E6D0, orange #D9A05A, teal #2F8A8A, lawn green #B4C395.', excl: 'No cars, no vehicles of any kind.' });

la({ id: 'griffith', num: 'Area 10', name: 'Griffith Park', tw: 24, th: 22, ar: '1:1',
  setting: 'A dusty Griffith Park hillside in Los Angeles at golden hour: chaparral brush, dry golden grass, sycamores and oaks, pale rocky trails, and a field of black tar pits with a faint shimmer. Wild but friendly, a place where small smoggy monsters might hide. The white Observatory dome is a tiny shape on a far ridge, no larger than a thumb.',
  nav: 'Keep the layout of the attached current painting: the main dirt trail enters from the BOTTOM edge near the center, climbs through a wide open dusty clearing in the middle, and continues UP to a rocky lookout at the top. A ridge trail branches right to the lookout rock, a west slope trail branches left toward the Observatory hill, and a big black tar pit field fills the upper right. A trailhead sign stands beside the main trail. No other exits: the left, right and top edges are closed by thick brush, boulders and trees.',
  props: 'A trailhead signpost, a wooden warning post beside the tar, dry boulders, a lookout rock, agave and yucca plants, sage brush, a fallen sycamore log beside the trail, a few rusty fence posts, tar pits with bubbles.',
  signs: 'Exit board: DOWNTOWN over the entrance trail. Wooden trailhead sign: GRIFFITH PARK. Small warning post near the tar: TAR (one word).',
  colors: 'Dry grass gold #D8B66A, dusty trail #C8A37A, chaparral sage #7E8F63, tar black #2A2628, rock grey #9A9585.', excl: 'No buildings, no cars, no water.' });

la({ id: 'studio', num: 'Area 11', name: 'Studio Gate', tw: 24, th: 18, ar: '4:3',
  setting: 'The gate lot of Sunset Gold Studios, a Hollywood movie studio, on a warm afternoon. A tall painted studio wall with an arched gate, a guard booth, three trailers, a craft services tent with a snack table, light stands, equipment carts and cable reels. Busy but empty of people, cheerful and slightly chaotic.',
  nav: 'Keep the layout of the attached current painting: the lot is a wide paved area. The WEST ENTRANCE is a wide road at the LEFT edge about the middle of the picture height, with a guard booth beside it. A paved road runs across the lot and then UP the center to the NORTH PASSAGE, a big arch at the TOP edge toward the Backlot. Three trailers stand in a row at the top left, the craft services tent stands on the right, and all of them are FREESTANDING with walkable ground on every side. No exit on the right or bottom edge: they are closed by the studio wall, hedges and palm trees.',
  props: 'A cream studio wall with a big golden arch and a gold star, a guard booth with a striped barrier arm, three silver trailers with little steps, a craft services tent with a snack table, folding chairs, a rolling clapperboard cart, two light stands, a cable reel, a golf cart, a director\'s chair, palm trees.',
  signs: 'Gate arch sign: SUNSET GOLD STUDIOS in gold letters on one arch (three words, two lines: SUNSET GOLD / STUDIOS). Craft services tent banner: SNACKS. Exit boards: DOWNTOWN over the west road, BACKLOT over the north arch.',
  colors: 'Studio cream #F4E6C8, gold #D9A43A, trailer silver #C9D2D8, tent red and white, asphalt #5E5A63.', excl: 'No cars except one golf cart.' });

la({ id: 'backlot', num: 'Area 12', name: 'The Backlot', tw: 24, th: 18, ar: '4:3',
  setting: 'The Sunset Gold Studios backlot: a fake Old West street, a fake New York street and a fake jungle set, side by side on real dirt and pavement, in warm afternoon light. Plywood fronts held up with braces, painted brick, fake palm trees and vines, and a huge soundstage door at the top. Playful and slightly spooky.',
  nav: 'Keep the layout of the attached current painting: the STUDIO GATE entrance is at the BOTTOM edge near the center, opening to a wide paved plaza. A road runs straight UP to the huge Stage 7 door at the TOP edge. The Old West street is at the top left (a dirt strip with a corridor behind), the New York street is at the top right (a sidewalk and brick storefronts), and the jungle set is on the right. All set fronts are FREESTANDING with walkable ground in front and around. No other exits.',
  props: 'Western storefronts with a saloon, a water tower, hitching posts, a barrel; New York brick fronts with a fire escape and a hot dog cart (no vendor); jungle set with big plastic leaves, a vine arch and a fake waterfall; plywood braces seen from behind; a clapperboard prop on a stand; lamp posts; a huge grey soundstage with a big sliding door and a red light above it.',
  signs: 'Soundstage door: STAGE 7. Western saloon sign: SALOON. New York deli sign: DELI. Exit board: STUDIO GATE over the south entrance.',
  colors: 'Western dirt #C8A37A, plywood tan #D9B48A, brick #A0523A, jungle green #4F8A4A, soundstage grey #8A8F96.', excl: 'No real animals, no cars.' });

la({ id: 'oakpark', num: 'Area 13', name: 'Old Oak Park', tw: 26, th: 22, ar: '1:1',
  setting: 'Old Oak Park, a Los Angeles neighborhood park on a warm afternoon, anchored by one huge, very old oak tree at the top with a tiny round door at its base. A sandy playground, a community vegetable garden, picnic tables and a dog park. Sun-dappled, soft and welcoming.',
  nav: 'Keep the layout of the attached current painting: the main path enters from the BOTTOM edge at the center and runs straight UP to the Old Oak at the top; a cross path runs LEFT to RIGHT across the middle. The playground (sand, slide, swings, climbing frame) is top left, the community garden (soil beds, trellis, scarecrow) is top right, picnic tables are bottom left, and the fenced dog park (mulch, ramps, a water bowl) is bottom right. All play and garden features are FREESTANDING with walkable ground on every side. Only exit: the bottom edge path. The left, right and top edges are closed by hedges, fences and trees.',
  props: 'The giant Old Oak with a wide trunk, thick roots and a tiny round wooden door at its base; a sandbox, a slide, a swing set; vegetable beds with tomato stakes and sunflowers; wooden picnic tables with benches; a low fence around the dog park with a gate, a dog agility ramp and tunnel; park benches, a drinking fountain, lamp posts.',
  signs: 'Exit board: JEFFERSON PARK over the bottom path. Garden sign shaped like a carrot: GARDEN. Dog park sign on the fence: DOG PARK.',
  colors: 'Oak green #5F8A4A, bark brown #7A5A3A, sand #E3C99A, soil #6A4A3A, lawn green #B4C395.', excl: 'No dogs, no cars.' });

module.exports = { entries };
