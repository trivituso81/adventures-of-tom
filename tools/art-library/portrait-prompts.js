// Portraits tab: the 12 menu portraits (portraits/<id>.png, 256 x 256 in the game, shown at 64 px). Each uses the current portrait as the likeness reference.
const ST = 'Hand-painted storybook style grown up into rich painted detail: dense jewel-toned painted texture, fine brushwork, deep saturated colors, warm golden light from the upper left, soft warm rim light, no thick outlines. NOT pixel art, NOT retro game art.';
const CAST = [
  ['tom', 'Tom', 'a man (the hero), dry and calm, a small half smile, gaming tee', 'height 5\'11"'],
  ['tnb', 'TNB', 'a man, Tom\'s boyfriend, chill and crafty, relaxed friendly smile', 'height 5\'10"'],
  ['grace', 'Grace', 'a nine year old girl, bright and bossy, a confident grin', 'a child'],
  ['rose', 'Rose', 'a six year old girl, silly, mouth open in a laugh', 'a small child'],
  ['amy', 'Amy', 'a woman, Tom\'s sister and the girls\' mom, a caring warm smile, runner\'s energy', 'height 5\'5"'],
  ['justin', 'Justin', 'a very tall man, the girls\' dad, a tired kind smile', 'height 6\'4"'],
  ['olivia', 'Olivia', 'a woman, friendly and bright (height assumed 5\'5")', 'height 5\'5" assumed'],
  ['deedee', 'Deedee', 'an older woman, Tom\'s mom, baker and gardener, a loving smile', 'height 5\'5"'],
  ['boppy', 'Boppy', 'an older man, Tom\'s dad, fisherman, a wry grin', 'height 5\'7"'],
  ['ellie', 'Aunt Ellie', 'an older woman, Tom\'s aunt, kind and sharp-eyed (height assumed 5\'2")', 'height 5\'2" assumed'],
  ['nara', 'Nara', 'a friendly dog, head and chest, ears up, happy open mouth', 'a dog'],
  ['boomie', 'Boomie', 'a young woman, Tom\'s friend, a gospel and soul singer, a warm radiant smile', 'an adult']
];
const entries = CAST.map(([id, name, who, h]) => ({
  id: 'portrait-' + id, tab: 'Portraits', ar: '1:1',
  title: 'Menu portrait: ' + name + ' (portraits/' + id + '.png, shown at 64 px)' + (/assumed/.test(h) ? ' (height assumed, ask Tom)' : ''),
  refs: ['portraits/' + id + '.png', 'docs/reference/style_key_v1.png'],
  prompt: 'IMAGE REQUEST: ONE SINGLE ILLUSTRATION. Return exactly one image, nothing else.\n\nThe first attached picture is the current menu portrait of ' + name + ': keep the same person, the same face, hair, skin tone, clothes colors and likeness. The second attached picture is the style key: paint in exactly its painting style.\n\nPaint a square head-and-shoulders PORTRAIT of ' + name + ', ' + who + '. A realistic caricature: an oversized head, a warm natural expression, eyes clearly readable, facing the viewer with the head turned slightly toward the right. The face fills about 70 percent of the picture height. 1024 x 1024 px, shrunk later to 64 px, so keep big simple shapes and a bold, clear face; nothing finer than about 8 px.\n\nSTYLE\n' + ST + '\n\nBACKGROUND\nA soft plain painted background in one warm muted color that suits ' + name + ', slightly darker toward the edges, full bleed to all four edges. No frame, no border, no text, no watermark. Only ' + name + ' in the picture.'
}));
module.exports = { entries };
