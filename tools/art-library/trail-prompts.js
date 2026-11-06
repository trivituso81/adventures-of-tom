// Trail clue sheets for the Art Library (tab Props, group "Trail clues"). Required by make-prompts.js.
// Tom 2026-11-06: where the player only has to find an enemy, a boss or a trigger and no object leads there, a trail of 3 clue objects does.
// Clue 1 sits far from the target, the next clue appears once the previous one is investigated, clue 3 points at the target.
// Transparent map overlays like the dungeon finds. One sheet packs up to 4 chapters (3 clues each, in trail order). Only the style key is attached.
const { sheet } = require('./dungeonfind-prompts');
const REF_KEY = 'docs/reference/style_key_v1.png';
const T = (name, d) => [name, d];
const SHEETS = [
  { id: 'a', label: 'trails for chapters 1 to 3', title: 'chapters 1 to 3', items: [
    T('CH1 CRUMB 1, SMALL', 'Three tiny golden pastry crumbs and one flaky crust flake with a dusting of cinnamon sugar, lying together in a loose little pile. The smallest, quietest clue of the trail.'),
    T('CH1 CRUMB 2, TRAIL', 'A longer scattered line of golden rhubarb crisp crumbs with one sticky pink rhubarb smear and one half crumbled oat cluster, pointing to the right.'),
    T('CH1 CRUMB 3, BITE', 'A big broken wedge of rhubarb crisp with a huge bite taken out of it, spilling crumbs and pink filling, with one wide toothy bite mark clearly visible.'),
    T('CH2 TAR CLUE 1, DRIP', 'A small shiny black tar puddle with three round drips splashed beside it and one bubble on the surface, a faint curl of grey smoke rising from it.'),
    T('CH2 TAR CLUE 2, FOOTPRINT', 'A pair of huge sticky black footprints pressed into a patch of cracked dusty ground, the toes spread wide, thick tar strings stretching up from the heel.'),
    T('CH2 TAR CLUE 3, CRACK', 'A jagged crack in a square of pale cracked ground, dark fumes seeping out of it, little pebbles bouncing on the edge as if something is rumbling below.'),
    T('CH3 WET CLUE 1, DRIP LINE', 'Three big glistening water drops on a flat dark green leaf, in a row getting larger from left to right, with one tiny tadpole shaped splash mark beside them.'),
    T('CH3 WET CLUE 2, SCALE', 'One large overlapping teal armored fish scale with a bright wet shine, half stuck in a little puddle of muddy water, with a swirl of ripples around it.'),
    T('CH3 WET CLUE 3, CLAW MARKS', 'Four long deep curved claw gouges scratched across a flat round piece of grey stone, with a few chips of stone and a thin trickle of water running out of the grooves.'),
  ] },
  { id: 'b', label: 'trails for chapters 4 to 6', title: 'chapters 4 to 6', items: [
    T('CH4 FILM CLUE 1, STRIP', 'A short curl of old film strip with small square frames and sprocket holes, lying in a loose spiral, with one frame bright and the rest dull. No readable words.'),
    T('CH4 FILM CLUE 2, CLAPPER', 'A black and white striped film clapperboard lying on its side with its clapper stick open and snapped, a blank white label area on its face. No readable words.'),
    T('CH4 FILM CLUE 3, MEGAPHONE', 'A big red director megaphone lying on the ground with a dented bell, a long dark scuff trail of tape ribbon trailing out of the wide end.'),
    T('CH5 INK CLUE 1, SPLATTER', 'A small splatter of bright red ink drops on a pale cream paper scrap, three round drops and one tiny dot, still wet and shiny.'),
    T('CH5 INK CLUE 2, MARKED PAPER', 'A single sheet of cream school paper lying flat, crossed out with big bold red pen scribbles and one huge red check mark circled twice. No readable words.'),
    T('CH5 INK CLUE 3, PEN CAP', 'A giant chewed red pen cap with a bright red ink puddle spreading under it and a long red line streaking away from it across the ground.'),
    T('CH6 ACORN CLUE 1, SHELLS', 'Three split acorn shells and a few tiny nibbled acorn crumbs lying in a small arc, one shell with a neat round tooth mark.'),
    T('CH6 ACORN CLUE 2, TUFT', 'A little clump of fluffy brown and grey fur caught on a short broken twig, with a few small oak leaves stuck to it.'),
    T('CH6 ACORN CLUE 3, GOLD ACORN', 'One huge shiny gold acorn with a tiny paper ribbon bow tied on its stem, resting on a small pile of leaves, glinting.'),
  ] },
  { id: 'c', label: 'trails for chapters 7 to 9', title: 'chapters 7 to 9', items: [
    T('CH7 PAGE CLUE 1, TORN PAGE', 'A single torn book page lying flat with ragged edges and a small bookworm hole in the corner, with lines of tiny faded gray squiggles standing in for text. No readable words.'),
    T('CH7 PAGE CLUE 2, BOOKMARK', 'A long red ribbon bookmark with a tassel, lying in a loose S shape on top of a small flat stack of three closed old books, dust on the covers.'),
    T('CH7 PAGE CLUE 3, DUSTY BOOK', 'One huge old leather book lying closed, thick with dust and cobwebs, a single long finger shaped smear wiped across the cover, a ribbon sticking out of the pages.'),
    T('CH8 EMBER CLUE 1, SOOT', 'A small smudged circle of black soot on a patch of grey ground with three glowing orange embers inside it and a thin wisp of smoke.'),
    T('CH8 EMBER CLUE 2, WARM PIPE', 'A short section of copper pipe lying on the ground, one end glowing dull orange as if hot, with a tiny curl of steam and two scorched rings around it.'),
    T('CH8 EMBER CLUE 3, COAL SCATTER', 'A trail of seven glowing coals getting bigger toward the right, each with a bright orange crack, scattered across a patch of black ash.'),
    T('CH9 MIRROR CLUE 1, GLINT', 'A small round hand mirror lying on the ground, its glass catching a bright white star shaped glint, the silver frame slightly bent.'),
    T('CH9 MIRROR CLUE 2, GLASS SHARD', 'A cluster of three large pointed mirror glass shards fanned out, each reflecting a different pale blue and violet reflection of the night sky, silver edges.'),
    T('CH9 MIRROR CLUE 3, SPARKLE TILES', 'A square patch of tiny round mirrored disco tiles on the ground, a few missing, each one reflecting a bright spot of colored light, the middle ones brightest.'),
  ] },
  { id: 'd', label: 'trails for chapters 10 to 12', title: 'chapters 10 to 12', items: [
    T('CH10 TRAVEL CLUE 1, TAG', 'A lost luggage tag with a loop of string, lying on the ground, bright orange paper with a plain white square for the name left blank. No readable words.'),
    T('CH10 TRAVEL CLUE 2, WHEEL MARKS', 'A single small rolled suitcase lying on its side with one wheel missing, a strip of scuffed dusty wheel tracks leading away from it.'),
    T('CH10 TRAVEL CLUE 3, TICKET', 'A big oversized airplane boarding pass ticket glowing faintly gold along its edges, torn in half with a clean tear, the stub curling. No readable words.'),
    T('CH11 BELL CLUE 1, CHIME', 'A small brass travel service bell on a round base with a push button, tipped on its side, one tiny ring mark of sound shown as a pale curved line.'),
    T('CH11 BELL CLUE 2, CLOCK HAND', 'A single long black clock hand with a decorative spade tip, snapped off and lying flat, a tiny gear beside it.'),
    T('CH11 BELL CLUE 3, FINAL CARD', 'A large rectangular departures board flip card, deep red with a white border, hanging crooked from a bent metal clip, a few flaps dangling. No readable words.'),
    T('CH12 TRAFFIC CLUE 1, CONE', 'A single bright orange traffic cone lying on its side with a white reflective stripe, a faint skid mark under it.'),
    T('CH12 TRAFFIC CLUE 2, SIGNAL LIGHT', 'A small traffic light head lying on the ground, all three lights glowing red at once, a few torn wires trailing out of the back.'),
    T('CH12 TRAFFIC CLUE 3, TIRE TRACKS', 'A pair of thick black tire skid marks curving across the ground ending at a single flat hubcap lying face up, rings of heat shimmer lines above it.'),
  ] },
  { id: 'e', label: 'trails for chapters 13, 17 and 19', title: 'chapters 13, 17 and 19', items: [
    T('CH13 ROCK CLUE 1, DUST', 'A small heap of fine grey rock dust with three tiny rocks bouncing above it and a scatter of pebbles around the base.'),
    T('CH13 ROCK CLUE 2, BROKEN PICK', 'A snapped wooden pickaxe handle with a bent iron head, lying across a patch of crushed rock, the iron head chewed with deep tooth ridges.'),
    T('CH13 ROCK CLUE 3, TUNNEL HOLE', 'A round fresh hole bored into the ground, smooth walls spiraling down into darkness, a ring of churned grey rubble flung out around it.'),
    T('CH17 LENS CLUE 1, SPARKLE', 'A small round pair of eyeglass lens fragments lying side by side, each reflecting one sharp white sparkle, thin silver frame wire curling from them.'),
    T('CH17 LENS CLUE 2, PHOTO', 'A square instant photograph lying face up, the picture inside burned in a perfect circle through the middle, curled edges and a faint wisp of smoke. No readable words.'),
    T('CH17 LENS CLUE 3, TRIPOD', 'A tall folded camera tripod lying toppled, one leg bent, a small round lens cap with a bright amber light on its front rolling beside it.'),
    T('CH19 CENSOR CLUE 1, BLACK BAR', 'A strip of thick black tape stuck on the ground in a rectangle with one corner peeling up, a few torn scraps stuck to its edges.'),
    T('CH19 CENSOR CLUE 2, ERASED PAGE', 'A sheet of paper lying flat, mostly rubbed blank with a smudged grey patch and a small pile of pink eraser shavings beside it. No readable words.'),
    T('CH19 CENSOR CLUE 3, STAMP', 'A big heavy rubber stamp with a wooden handle lying on its side beside a square patch of solid black ink, the stamp face dark and shiny.'),
  ] },
  { id: 'f', label: 'trails for chapter 20 and Nine Scoops', title: 'chapter 20 and Nine Scoops', items: [
    T('CH20 TIDE CLUE 1, SHELL', 'A single large spiral seashell lying on wet dark sand with a thin line of foam, a few small bubbles around it.'),
    T('CH20 TIDE CLUE 2, WET DRAG MARK', 'A wide curving drag mark of shiny wet sand with scattered seaweed strands lying along it and one big overlapping scale shaped ripple in the middle.'),
    T('CH20 TIDE CLUE 3, WHIRLPOOL', 'A small swirling whirlpool of deep teal water in a round rock basin, tipped with white foam, a lost sandal spinning at its edge.'),
    T('SCOOPS CLUE 1, FROST PUFF', 'A small round puff of frosty white mist hovering over a patch of grass whitened with sparkling frost, tiny ice crystals around it.'),
    T('SCOOPS CLUE 2, MELTED DRIP', 'A single dropped ice cream cone lying on its side, the pink scoop half melted into a puddle that is frozen solid at its edges, a trail of frozen drips.'),
    T('SCOOPS CLUE 3, ICE SPRINKLES', 'A large glittering ring of rainbow sprinkles frozen into a flat disc of ice, with a big crack across the middle and a small spoon stuck upright in it.'),
  ] },
];
const entries = SHEETS.map(s => ({
  id: `prop-trail-${s.id}`, tab: 'Props', group: 'Trail clues',
  title: `Trail clues, ${s.title} (${s.items.length} objects)`,
  ar: '1:1', refs: [REF_KEY],
  prompt: sheet(s.label, s.items).replace('standalone objects that the player has to find, touch or collect inside a dungeon', 'trail clue objects that lead the player, one after another, toward a hidden enemy or boss. Each group of three is in trail order, from the faintest clue to the strongest'),
}));
module.exports = { entries, SHEETS };
