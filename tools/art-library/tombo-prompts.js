// Tombo sheets: Tom + one partner, one 3 x 2 picture per Tombo (Tom 2026-11-06; spec claude/next-addendum-tombo-art.md).
// Beats come from the LIVE animations in engine/battle2-kind.js (the comment block above each B2_TOMBO_ANIM.<id>), not from claude/battle-design.md,
// which is out of date (its names and beats differ from the game). Names are the live names in B2_TOMBOS (data/battle2-data.js).
// Each row: [id, live name, partner key, partner name, what Tom does, what the partner does, six frames].
// Slice 1 (this file): the three Tom + Grace Tombos. Rows for the other 18 Tombos are added in the same shape, one partner per push.
// Entries are copied into data/art-prompts.json by a node one-liner that keeps every other entry untouched (never run make-prompts.js: it rewrites hand edits).
// Groups use a comma, not a colon, because validate.js bans colons in group names.
const fs = require('fs');
const HEADER = fs.readFileSync(__dirname + '/prompts/char-tombo-sheet.txt', 'utf8').trim();
const R = 'art/raw/characters/';

const TOMBOS = [
  ['grace1', 'Squishy Delivery', 'grace', 'Grace',
    'sighs, shrugs and says fine, then cheers when the squishy lands',
    'begs with clasped hands, hops, gasps at the gift and squeals at the landing',
    [
      'Grace stands facing Tom with her hands clasped under her chin, a pleading puppy-eyed face with one tear on her cheek; Tom stands with his arms folded.',
      'Grace drops to her knees with her clasped hands held up; Tom looks down at her with a long sigh.',
      'Tom shrugs with both palms up and a fine, then look; Grace bounces up off her knees with her arms raised.',
      'Grace gasps with both hands on her cheeks and looks up with wide eyes; Tom watches her with a small smile.',
      'Grace squeals and hops with both fists up; Tom raises one fist in a cheer.',
      'Tom and Grace stand side by side; Grace holds a pink glittery cube squishy with a small happy face, and both are grinning.',
    ]],
  ['grace2', 'Uncle Spotter Toss', 'grace', 'Grace',
    'claps chalk off his hands, laces his fingers low into a stirrup and heaves Grace straight up, then high-fives her',
    'takes two running steps, lands in his laced hands, flips twice and sticks a landing with arms out',
    [
      'Tom stands in a coach\'s stance and claps chalk off his hands; Grace is ready in a running start, eyes forward, a determined grin.',
      'Tom laces his fingers low into a stirrup; Grace takes two running steps toward him.',
      'Grace\'s foot lands in Tom\'s laced hands; Tom heaves her straight up with both arms reaching high.',
      'Grace is high in the air, tucked into a flip with her arms and legs spread wide; Tom\'s arms are still raised.',
      'Grace lands feet first in a stick landing with her arms out; Tom runs up with his palm open for a high five.',
      'Tom and Grace high-five; Grace is grinning and Tom is beaming.',
    ]],
  ['grace3', 'The Golden Dumpling Wish', 'grace', 'Grace',
    'wishes far too loudly, gets squished flat, then peels himself up off the ground laughing',
    'holds up the golden wish dumpling, which wakes with a grumpy genie face, and then bursts into a shower of tiny dumplings',
    [
      'Grace holds a large golden soup dumpling up in both hands; Tom stands beside her with cupped hands, ready to make a wish.',
      'The golden dumpling has a grumpy genie face with eyes and a mouth; Tom leans in and shouts a loud wish.',
      'Tom is squashed flat as a pancake on the ground with his arms spread wide and his eyes wide; Grace claps both hands over her mouth.',
      'Grace jumps back with her arms up as the golden dumpling splits open above her.',
      'Tom peels himself up off the ground with his arms waving, grinning; Grace laughs with her hands on her tummy.',
      'Tom and Grace in a big group hug; Grace is up on her toes and Tom is bending down, both laughing.',
    ]],
];

function entry([id, name, partner, pname, tomDo, partnerDo, frames]) {
  return {
    id: 'tombo-' + id,
    tab: 'Characters',
    group: 'Tombos, Tom + ' + pname,
    title: 'Tombo: ' + name + ' (Tom + ' + pname + ')',
    ar: '3:2',
    refs: [R + 'tom-hero-ref-v1.png', R + partner + '-hero-ref-v1.png', R + 'tom-battle-sheet-1-v1.png', R + partner + '-battle-sheet-1-v1.png'],
    prompt: HEADER + '\n\nThe Tombo: ' + name + '. Tom ' + tomDo + '. ' + pname + ' ' + partnerDo + '.\n\nSix frames:\n' + frames.map((f, i) => (i + 1) + '. ' + f).join('\n'),
  };
}

module.exports = { entries: TOMBOS.map(entry) };
