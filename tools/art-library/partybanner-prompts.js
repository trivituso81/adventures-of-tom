// Party banners (partybanner1, Tom 2026-11-18 15:42 and 15:43): "we need art for whenever any character joins the party ... they should never be
// combined. if multiple people join the party at once, each banner should be displayed sequentially ... we also need the same thing for when
// someone leaves the party." One JOIN and one LEAVE banner per member who can join (MEMBERS in engine/story.js, Tom included). The game writes
// the words ("Grace joined the party") over the empty ribbon, so the painting has none. Required by make-prompts.js (group "Party banners").
// Every prompt is self-contained; who the person is comes from the attached approved hero picture.

const MEMBERS = [
  ['tom', 'Tom', 'art/raw/characters/tom-hero-v2.png'],   // he leaves in chapter 18 and comes back in chapter 19
  ['grace', 'Grace', 'art/raw/characters/grace-hero-v1.png'],
  ['rose', 'Rose', 'art/raw/characters/rose-hero-v1.png'],
  ['amy', 'Amy', 'art/raw/characters/amy-hero-v2.png'],
  ['deedee', 'Deedee', 'art/raw/characters/deedee-hero-v1.png'],
  ['boppy', 'Boppy', 'art/raw/characters/boppy-hero-v2.png'],
  ['tnb', 'TNB', 'art/raw/characters/tnb-hero-v1.png'],
  ['justin', 'Justin', 'art/raw/characters/justin-hero-v2.png'],
  ['olivia', 'Olivia', 'art/raw/characters/olivia-hero-v1.png'],
  ['nara', 'Nara', 'art/raw/characters/nara-hero-v1.png'],
];

const POSE = {
  join: 'Both arms raised in a happy cheer, a big open smile, glad to be on the team.',
  leave: 'One hand raised in a warm goodbye wave, a gentle smile.',
};
const DOG = {
  join: 'Front paws up, mouth open in a happy bark, ears perked.',
  leave: 'Sitting, one front paw raised in a goodbye wave, head tilted.',
};

function banner(kind, dog) {
  return `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one wide image, nothing else.

WHAT THIS IS
A party banner for "The Adventures of Tom", a family role-playing game. The ${dog ? 'dog' : 'person'} is the exact ${dog ? 'dog' : 'person'} in the attached picture: same face, ${dog ? 'fur, markings' : 'hair, proportions, outfit'} and painted style.

LAYOUT
A wide horizontal banner. The ${dog ? 'dog' : 'person'} fills the right third, seen ${dog ? 'from the front, head and front paws' : 'from the waist up'}, facing the viewer. The left two thirds is a plain painted ribbon of warm cream parchment with a thin gold edge, left empty for words the game adds. No words or letters anywhere.

POSE
${(dog ? DOG : POSE)[kind]}

STYLE
Hand-painted, visible brushwork, matte surfaces, rich warm colors, warm golden light from the upper left. No thick outlines. Not pixel art, not 16-bit, not photorealistic, not 3D.`;
}

const entries = [];
for (const [id, name, ref] of MEMBERS) {
  for (const kind of ['join', 'leave']) {
    entries.push({ id: `banner-${kind}-${id}`, tab: 'Characters',
      title: `Party banner: ${name} ${kind === 'join' ? 'joins' : 'leaves'} the party (one wide painting, no words)`,
      ar: '2:1', refs: [ref], group: 'Party banners', prompt: banner(kind, id === 'nara') });
  }
}

module.exports = { entries };
