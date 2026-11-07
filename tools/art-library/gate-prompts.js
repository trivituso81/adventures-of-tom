// Story gate blockers for the Art Library (tab Props, group "Story gates"). Required by make-prompts.js.
// Tom 2026-11-06: every area exit that the story closes (fallen branch, school gate, sawhorse barriers) is drawn in code today
// (b7DrawMapFx in engine/story.js, data `gates:` in data/maps-le.js and data/maps-la.js). All of them must be painted by the generator
// with the painting of the area they sit in attached as the one reference. One entry per gate site, one Generate press each.
// Each result is one transparent object the game will draw on the gate tiles in place of the code drawing. Inventory: claude/next-addendum-story-gates.md.
const GATES = [
  { id: 'town-hollow', ar: '2:1', area: 'the Square', file: 'art/town.webp', title: 'Grump Hollow stairs, fallen branch (Square, chapter 1)',
    where: 'The Square is a cobbled plaza ringed by little shops. The opening to close is the wide stone staircase that climbs behind the green GRUMP HOLLOW signboard, between the bakery and the tall library.',
    what: 'A big fallen tree branch lying across the full width of a stone staircase, thick mossy bark, one snapped splintered end, leafy side twigs with green and yellow leaves and a few tiny wildflowers caught in them. Heavy enough that nobody could climb over it. No sign, no words.',
    size: 'It spans the whole width of the steps, about two people wide, and is about one person tall at the thickest point.' },
  { id: 'town-school', ar: '1:1', area: 'the Square', file: 'art/town.webp', title: 'School gate (Square east lane, chapters 1 to 5)',
    where: 'The Square is a cobbled plaza ringed by little shops. The opening to close is the cobbled lane at the far side of the plaza, beside the green SCHOOL arrow signboard and the toy shop with the round orange sign.',
    what: 'A closed chain link school gate hung between two grey steel posts with a top rail, swung shut across a lane. A thick chain and one big brass padlock hold it shut. A small hand lettered wooden sign hangs on the gate and reads exactly: NO SCHOOL TODAY',
    size: 'It spans the full width of the lane, about two people wide, and is a little taller than a person.' },
  { id: 'row-pier', ar: '3:2', area: 'Rivituso Row', file: 'art/row.webp', title: 'Cattail Pier path, branch and sign (Row, chapters 1 to 3)',
    where: 'Rivituso Row is a garden lane of cottages and cobbled paths. The opening to close is the cobbled path at the very bottom of the picture, between the two black lamp posts under the green CATTAIL PIER board.',
    what: 'A fallen tree branch lying across a cobbled path, mossy bark, leafy twigs, with a hand painted wooden board nailed to it. The board reads exactly: CATTAIL PIER and, in smaller letters underneath, CLOSED FOR THE SEASON',
    size: 'It spans the full width of the path, about three people wide, and is about one person tall.' },
  { id: 'blvd-trail', ar: '3:2', area: 'the Downtown plaza', file: 'art/blvd.webp', title: 'Griffith trail barrier (Downtown, chapter 2)',
    where: 'The Downtown plaza is a sunny city square of shops, palms and lamps. The opening to close is the top of the stone staircase at the far upper corner, under the green GRIFFITH PARK arch.',
    what: 'A road sawhorse barrier: two wooden A frame legs and one long top board painted in bold orange and white diagonal stripes, with a small yellow warning lamp on top. A small sign hangs from the board and reads exactly: TRAIL CLOSED and, in smaller letters underneath, SMOG ADVISORY',
    size: 'It spans the full width of the stair top, about two people wide, and is about waist high.' },
  { id: 'blvd-studio', ar: '3:2', area: 'the Downtown plaza', file: 'art/blvd.webp', title: 'Studio gate arm (Downtown, chapters 1 to 3)',
    where: 'The Downtown plaza is a sunny city square of shops, palms and lamps. The opening to close is the paved road at the far upper corner that passes under the green STUDIO arch, next to the checkered cab building.',
    what: 'A road barrier arm gate lowered across a road: two short striped posts and one long horizontal arm painted in alternating red and white stripes. A rectangular sign on the arm reads exactly: CLOSED SET and, in smaller letters above it, SUNSET GOLD STUDIOS',
    size: 'It spans the full width of the road gap, about two people wide, and is about waist high.' },
  { id: 'jpark-oak', ar: '2:1', area: 'Jefferson Park', file: 'art/jpark.webp', title: 'Old Oak Park barrier (Jefferson Park, chapters 1 to 6)',
    where: 'Jefferson Park is a leafy neighborhood street with craftsman houses and purple trees. The opening to close is the whole road at the very bottom of the picture, below the green OLD OAK PARK arch.',
    what: 'Two wide wooden sawhorse road barriers standing side by side with orange and white striped boards, an orange traffic cone at each end, and one big sign hung across the middle that reads exactly: OLD OAK PARK and, underneath, CLOSED FOR TREE TRIMMING. On the sign is a tiny doodle of a squirrel wearing a necktie.',
    size: 'Together they span the full width of the road, about four people wide, and are about waist high.' },
  { id: 'jpark-barn', ar: '1:1', area: 'Jefferson Park', file: 'art/jpark.webp', title: 'Car Barn gate (Jefferson Park east edge, chapters 1 to 8)',
    where: 'Jefferson Park is a leafy neighborhood street with craftsman houses and purple trees. The opening to close is the side street at the far edge of the picture, beyond the green CAR BARN arch.',
    what: 'A tall old black iron double gate between two weathered stone posts, shut tight. A heavy chain is wrapped across it and held by a big padlock, and a thin layer of frost covers the chain and the gate bars. An old riveted metal plate on the gate reads exactly: DIVISION NINE CAR BARN and, in smaller letters underneath, EST. 1912',
    size: 'It spans the full width of the side street, about two people wide, and is taller than a person.' },
  { id: 'backlot-stage7', ar: '3:2', area: 'the studio backlot', file: 'art/backlot.webp', title: 'Stage 7 doors (Backlot, chapter 4)',
    where: 'The Backlot is a movie studio street of fake western and city sets. The opening to close is the big open hangar doorway at the far end of the street, under the STAGE 7 lettering.',
    what: 'A pair of enormous closed steel soundstage sliding doors, dark grey with riveted panels and yellow and black hazard stripes along the bottom. A round red warning lamp glows above them and a small black sign beside it reads exactly: ROLLING',
    size: 'It fills the whole hangar doorway, about two people wide, and is about three people tall.' },
  { id: 'stage7-catwalk', ar: '3:2', area: 'Soundstage 7', file: 'art/stage7.webp', title: 'Catwalk to the set (Soundstage 7, chapter 4)',
    where: 'Soundstage 7 is the dark inside of a movie soundstage under rows of stage lights. The opening to close is the short stone staircase at the far end that leads up to the painted set doorway between two tall stone pillars.',
    what: 'A steel catwalk bridge section hoisted up on two chains and hanging at a steep angle, with the foot of a metal stair below it ending in an empty dark gap. A yellow and black hazard chain is strung across the gap and a small sign hangs on the chain reading exactly: CATWALK OFFLINE',
    size: 'It spans the full width of the stairs, about two people wide, and is about two people tall.' },
];

function prompt(g) {
  return `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one image, nothing else. Generate it now. Do not make a plan, a sheet, a diagram or a scene.

ATTACHED IMAGE
1) The current painting of ${g.area}, from "The Adventures of Tom", a family role-playing game. ${g.where} Match its painting exactly: hand painted realistic storybook look, smooth soft shading, fine brush texture, the same colors and materials, warm golden light from the upper left, and the same camera angle. Not pixel art, not 16-bit. Do not copy any building, person or scene from it.

PAINT THIS ONE OBJECT
${g.what}

RULES
- The game draws this object on top of the painting at that opening, so it must look like it belongs in that exact place: same camera angle, same lighting, same materials as the paving, stone and wood around it. ${g.size}
- Centered, complete, fully inside the picture with a clear margin, crisp clean edges.
- Background fully transparent (PNG with alpha). If your tool cannot output transparency, fill the whole background with one flat solid color, pure magenta #FF00FF, and use no magenta anywhere in the object.
- No people, no animals, no characters, no scenery, no ground patch, no border, no frame, no caption. A small soft contact shadow directly under the object is fine.
- Lettering is painted by you, spelled exactly as given, big, clear and easy to read. No other words anywhere.
- Family friendly for children aged 6 and up.`;
}

const entries = GATES.map(g => ({
  id: `prop-gate-${g.id}`, tab: 'Props', title: `Story gate: ${g.title}`,
  ar: g.ar, refs: [g.file], prompt: prompt(g),
}));
module.exports = { entries, GATES, prompt };
