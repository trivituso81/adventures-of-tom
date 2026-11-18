#!/usr/bin/env node
// Clips tab of the Art Library (clipgen1, 2026-11-17): battle clips made as short AI VIDEOS of a character.
// Run:  node tools/art-library/clip-prompts.js     (adds or refreshes these entries in data/art-prompts.json; statuses, versions and rejects are kept)
// An entry with a `clip` field is a video entry. art.html sends clip.start (the start picture, made by
// tools/clip-bake/make_start.py from the owner's battle idle frame) as the video's first frame to the xAI video API;
// Tom marks START, HIT and END in the review screen; APPROVE commits the video to art/raw/clips/ and the art-bake
// Action runs tools/clip-bake/bake_clip.py with those marks (tools/art-library/art_bake.py).
// clip fields: id (file name of the baked clip: art/clips/<id>.webp, data/clips/<id>.js), owner, start, model, res,
// dur (seconds billed), figRows (printed by make_start.py), step (keep every Nth picture of a 30 a second video), speed.
const fs = require('fs');
const LOOK = 'IMAGE TO VIDEO REQUEST: ONE SHORT ANIMATION CLIP. Return exactly one video, nothing else.\n\n' +
  'WHAT THIS IS\nA short animation of the person in the attached picture, for a family role-playing game. The attached picture is the first frame. Animate EXACTLY this person: the same face, the same head size compared to the body, the same hair, clothes, shoes, colors, proportions and the same drawing style. Do not redesign, restyle, simplify or change the outfit or any accessory.\n\n' +
  'LOOK (must hold in every moment of the clip)\n- The exact drawing style of the attached picture: a hand-drawn colored pencil and ink caricature, with soft shading and fine pencil lines. Keep this style in every moment. Not 3D, not anime, not a flat cartoon, not a photo.\n- The head stays the same size for the whole clip. The body stays the same height. Nothing grows, shrinks or morphs.\n\n' +
  'CAMERA AND BACKGROUND (strict)\n- Locked camera. No zoom, no pan, no tilt, no cuts, no shake.\n- Feet stay on the same ground line. Walking away from or toward the camera is not allowed. The whole body, hair and arms stay inside the frame at every moment.\n- The character keeps the same facing and viewing angle as the attached picture for the whole clip (turned to the left).\n- The background stays exactly the flat solid pure magenta of the attached picture the whole time, with no change of color, no gradient, no cut and no fade. No magenta glow, halo or tint on the character. No ground, no cast shadow, no floor shadow, no dust, no sparkles, no stars, no burst lines, no motion lines, no speed lines, no impact flash, no effects of any kind, no text, no extra people or objects.\n- Silent. No voice, no music, no sound effects.\n\n';
const END = '\n\nLength about 3 seconds. Family friendly for ages 6 and up.\n';
const entries = [
  { id: 'clip-rose-strike', tab: 'Clips', group: 'Rose', title: 'Rose: strike (Boop) video clip', ar: '4:3', refs: ['art/clips/start/rose.png'],
    clip: { id: 'rose-strike', owner: 'rose', start: 'art/clips/start/rose.png', model: 'grok-imagine-video-1.5', res: '480p', dur: 3, figRows: 83, step: 3, speed: 3 },
    prompt: LOOK + 'MOTION: WIND-UP INTO A STRIKE\nStart in the relaxed ready stance of the attached picture and hold it still for a brief moment. Twist the body away to the right, pull the near arm back, weight on the back leg, eyes narrowed. Then spring forward to the left in one fast move, lunging with the front knee bent and the arm at full reach, mouth open in a shout. Stay the same size and keep both feet on the same ground line while lunging. Hold the lunge for a moment, then ease back to the exact ready stance of the first frame. Hands empty, nothing is hit and nothing appears at the end of the arm.' + END },
];
if (require.main === module) {
  const out = 'data/art-prompts.json', doc = JSON.parse(fs.readFileSync(out, 'utf8'));
  for (const e of entries) {
    const i = doc.entries.findIndex(x => x.id === e.id), old = i >= 0 ? doc.entries[i] : null;
    const n = { status: old ? old.status : 'draft', versions: old ? old.versions || [] : [], rejects: old ? old.rejects || [] : [], ...e };
    if (old) doc.entries[i] = n; else doc.entries.push(n);
  }
  fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
  console.log('clips in', out, entries.map(e => e.id).join(', '));
}
module.exports = { entries };
