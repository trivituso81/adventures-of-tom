// Speech bubble sheet for the Art Library (tab Props, group "Speech bubbles"). Required by make-prompts.js.
// Tom 2026-11-10: the speech bubble is drawn with code shapes in about ten battle moves (bubble() in battle2-kind.js, np_say in nara.js,
// t6_bubble in tnb-moves.js, and a few more) while everything around it is painted. This sheet is the painted replacement, in the same
// hand-painted look as the NPC and character art (warm golden light from the upper left, soft shading, no thick outlines).
// The game draws the words itself (pixel font), so every bubble must be BLANK inside. The body, the loose tail and the dots are separate
// pieces so the game can stretch a body to any size and point a tail at any target. Only the house painting (art/grands.webp) is attached, for style.
const { sheet } = require('./dungeonfind-prompts');
const REF_KEY = 'art/grands.webp';
const T = (name, d) => [name, d];
const PAPER = 'Painted in warm cream paper white, a little brighter at the upper left and a touch warmer and darker at the lower right, with a soft thin darker warm tan edge about two pixels wide (never black, never thick)';
const BLANK = 'The inside is completely blank: one smooth even pale cream, no text, no letters, no marks, no pattern, no shine spots, so dark words can be drawn over it later.';
const items = [
  T('BUBBLE BODY, WIDE OVAL', `A wide smooth oval speech bubble body, about 1.6 times as wide as it is tall, with no tail. ${PAPER}. Seen from the front, perfectly flat to the camera, symmetrical. ${BLANK}`),
  T('BUBBLE BODY, ROUNDED RECTANGLE', `A wide rounded rectangle speech bubble body, about 2 times as wide as it is tall, with generously rounded corners and no tail. Same cream paper, soft tan edge and lighting as cell 1. Seen from the front, perfectly flat to the camera, symmetrical. ${BLANK}`),
  T('BUBBLE TAIL, LOOSE', `One loose speech bubble tail on its own: a tall narrow curved wedge pointing straight down, wide and flat at the top and narrowing to a soft point at the bottom, with a gentle curve to one side. The top end is plain flat cream with no edge line, so it can be tucked under a bubble body. The rest of its edge uses the same cream paper, soft tan edge and lighting as cell 1. Seen from the front. It is a tail only: no bubble attached.`),
  T('BUBBLE WITH TAIL, DOWN LEFT', `A round oval speech bubble about 1.4 times as wide as it is tall with a short pointed tail at the bottom left corner curving down and to the left, the tail and the body painted as one single piece with no seam. Same cream paper, soft tan edge and lighting as cell 1. Seen from the front. ${BLANK}`),
  T('THOUGHT BUBBLE, CLOUD', `A wide puffy thought bubble body made of about nine rounded scallops joined into one cloud shape, about 1.6 times as wide as it is tall, with no tail and no trailing dots. Same cream paper, soft tan edge and lighting as cell 1. Seen from the front, perfectly flat to the camera. ${BLANK}`),
  T('THOUGHT BUBBLE, TRAIL DOTS', `Three separate round thought bubble dots in a gentle diagonal row from the upper right down to the lower left, the biggest at the upper right, the middle one about two thirds of its size, the smallest about a third of its size, with clear gaps between them. Each dot is the same cream paper with the same soft tan edge and lighting as cell 1, blank inside. Dots only: no cloud attached.`),
  T('SHOUT BURST BUBBLE', `A bold jagged shout bubble body: a wide star burst outline with about twelve sharp points of uneven length, about 1.5 times as wide as it is tall, with no tail. Same cream paper, soft tan edge and lighting as cell 1, the points crisp and clean. Seen from the front, perfectly flat to the camera. ${BLANK}`),
];
function build() {
  let p = sheet('speech bubbles', items, true);
  p = p.replace('it holds ' + items.length + ' standalone objects that the player has to find, touch or collect inside a dungeon. They will be cut out and drawn on top of a painted dungeon map, so each one must stand out clearly from a painted background.',
    'it holds ' + items.length + ' blank speech bubble pieces. They will be cut out and drawn over painted battle scenes with words added by the game, so each one must stay clean and readable against a painted background.');
  p = p.replace('- Make each object read at a glance: slightly more saturated and a little higher contrast than a normal background object, and give the part the player touches (a switch, a lock, a slot, a handle) the brightest accent color on the object.\n',
    '- Every piece is a flat, front-facing user interface shape, not a scene object: no perspective, no thickness, no drop shadow, no ground. Keep the cream and the tan edge identical on every piece so they match when used together.\n');
  p = p.replace('- Three-quarter view from slightly above, unless the list says "seen from the front". All objects share', '- All objects share');
  p = p.replace('- Scale every object to fill about 70 to 80 percent of its cell, regardless of its real-world size. Small things are enlarged to the same footprint.',
    '- Scale every object so its widest side fills about 75 to 80 percent of the cell width, keeping its shape.');
  p = p.replace('A sheet of find-it objects for', 'A sheet of painted interface pieces for');
  if (/dungeon|find-it|touch/.test(p.split('THE SHEET')[0])) throw new Error('bubble-prompts: sheet wording not replaced');
  return p;
}
const entries = [{
  id: 'prop-bubble-a', tab: 'Props', group: 'Speech bubbles',
  title: `Speech bubbles, blank painted pieces for battle moves (${items.length} objects)`,
  ar: '1:1', refs: [REF_KEY], prompt: build(),
}];
module.exports = { entries, items };
