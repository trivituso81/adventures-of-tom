#!/usr/bin/env node
// Clips tab of the Art Library (clipgen1, 2026-11-17): battle clips made as short AI VIDEOS of a character.
// Run:  node tools/art-library/clip-prompts.js     (adds or refreshes these entries in data/art-prompts.json; statuses, versions and rejects are kept)
// An entry with a `clip` field is a video entry. art.html sends clip.start (the start picture, made by
// tools/clip-bake/make_start.py from the owner's battle idle frame) as the video's first frame to the xAI video API;
// Tom marks START, HIT and END in the review screen; APPROVE commits the video to art/raw/clips/ and the art-bake
// Action runs tools/clip-bake/bake_clip.py with those marks (tools/art-library/art_bake.py).
// clip fields: id (file name of the baked clip: art/clips/<id>.webp, data/clips/<id>.js), owner, start, model, res,
// dur (seconds billed), figRows (printed by make_start.py), step (keep every Nth picture of a 30 a second video), speed
// (the default for attack clips is 1.5: Tom approved the strike at 1.5x twice on 2026-11-18 after trying up to 3x).
// kind: 'strike' (default: START, HIT, END), 'loop' (an idle that repeats: START and END, the game plays it forward then backward, so it
// never jumps) or 'state' (ends in a pose the game holds, such as asleep: START and END). k: atlas pixels per sprite row (default 4;
// 8 for a monster, whose painted sheet is about that sharp).
// MODEL (Tom's study videos, 2026-11-18): the cheap model LITE held the style, kept the background clean (no floor shadow) and
// had no smeared in-between picture, at about a quarter of the price. New entries use LITE; G15 is the second try.
// LENGTH: 3 s for attacks. The 2 s study video dropped the shout and smeared the lunge.
// test: true marks a STUDY video (clipstudy1): APPROVE needs no marks and only saves the video in art/raw/clips/ for Claude to
// look at; no clip is cut and nothing changes in the game. Drop the flag once the engine can play that kind of clip.
const fs = require('fs');
const LOOK = 'IMAGE TO VIDEO REQUEST: ONE SHORT ANIMATION CLIP. Return exactly one video, nothing else.\n\n' +
  'WHAT THIS IS\nA short animation of the person in the attached picture, for a family role-playing game. The attached picture is the first frame. Animate EXACTLY this person: the same face, the same head size compared to the body, the same hair, clothes, shoes, colors, proportions and the same drawing style. Do not redesign, restyle, simplify or change the outfit or any accessory.\n\n' +
  'LOOK (must hold in every moment of the clip)\n- The exact drawing style of the attached picture: a hand-drawn colored pencil and ink caricature, with soft shading and fine pencil lines. Keep this style in every moment. Not 3D, not anime, not a flat cartoon, not a photo.\n- The head stays the same size for the whole clip. The body stays the same height. Nothing grows, shrinks or morphs.\n\n' +
  'CAMERA AND BACKGROUND (strict)\n- Locked camera. No zoom, no pan, no tilt, no cuts, no shake.\n- Feet stay on the same ground line. Walking away from or toward the camera is not allowed. The whole body, hair and arms stay inside the frame at every moment.\n- The character keeps the same facing and viewing angle as the attached picture for the whole clip (turned to the left).\n- The background stays exactly the flat solid pure magenta of the attached picture the whole time, with no change of color, no gradient, no cut and no fade. No magenta glow, halo or tint on the character. No ground, no cast shadow, no floor shadow, no dust, no sparkles, no stars, no burst lines, no motion lines, no speed lines, no impact flash, no effects of any kind, no text, no extra people or objects.\n- Silent. No voice, no music, no sound effects.\n\n';
const END = s => '\n\nLength about ' + s + ' seconds. Family friendly for ages 6 and up.\n';
// A monster: same rules, worded for a creature (the wording that passed the 2026-11-17 exam, plus 'never lifts off the ground').
const LOOK_FOE = 'IMAGE TO VIDEO REQUEST: ONE SHORT ANIMATION CLIP. Return exactly one video, nothing else.\n\n' +
  'WHAT THIS IS\nA short looping animation of the creature in the attached picture, for a family role-playing game. The attached picture is the first frame. Animate EXACTLY this creature: the same body shape, face, eyes, colors, textures, markings and proportions, and the same hand-painted style. Do not redesign, restyle, simplify or change anything about the creature.\n\n' +
  'LOOK (must hold in every moment of the clip)\n- The exact hand-painted style of the attached picture, with smooth soft shading, in every moment. No heavy dark outlines. Not 3D, not anime, not a flat cartoon, not a photo.\n- The creature stays the same size for the whole clip. It keeps the same number of eyes, limbs and other parts as in the picture. Nothing grows, shrinks, splits or morphs into something else.\n\n' +
  'CAMERA AND BACKGROUND (strict)\n- Locked camera. No zoom, no pan, no tilt, no cuts, no shake.\n- The creature stays in the same place in the frame. Its base stays pressed on the same line as in the attached picture and never lifts off it, hops or slides. The whole creature stays well inside the frame at all times.\n- The creature keeps the same facing and viewing angle as the attached picture for the whole clip (turned to the right).\n- The background stays exactly the flat solid pure magenta of the attached picture the whole time, with no change of color, no gradient, no cut and no fade. No magenta glow, halo or tint on the creature. No ground, no cast shadow, no floor shadow, no puddle, no dust, no sparkles, no motion lines, no effects of any kind, no text, no extra creatures or objects.\n- Silent. No voice, no music, no sound effects.\n\n';
const STRIKE = 'MOTION: WIND-UP INTO A STRIKE\nStart in the relaxed ready stance of the attached picture and hold it still for a brief moment. Twist the body away to the right, pull the near arm back, weight on the back leg, eyes narrowed. Then spring forward to the left in one fast move, lunging with the front knee bent and the arm at full reach, mouth open in a shout. Stay the same size and keep both feet on the same ground line while lunging. Hold the lunge for a moment, then ease back to the exact ready stance of the first frame. Hands empty, nothing is hit and nothing appears at the end of the arm.';
const G15 = 'grok-imagine-video-1.5', LITE = G15 + '-lite', ROSE = 'art/clips/start/rose.png';
const entries = [
  { id: 'clip-rose-strike', tab: 'Clips', group: 'Rose', title: 'Rose: strike (Boop) video clip', ar: '4:3', refs: [ROSE],
    clip: { id: 'rose-strike', owner: 'rose', start: ROSE, model: G15, res: '480p', dur: 3, figRows: 83, step: 3, speed: 1.5 },
    prompt: LOOK + STRIKE + END(3) },
  // ---- study videos (clipstudy1): the next cells of the tool test. Approve saves the video only. ----
  { id: 'clip-rose-strike-lite', tab: 'Clips', group: 'Rose', title: 'TEST: Rose strike on the cheap model (about 7 cents)', ar: '4:3', refs: [ROSE],
    clip: { id: 'rose-strike-lite', owner: 'rose', start: ROSE, model: LITE, res: '480p', dur: 3, figRows: 83, step: 3, speed: 1.5, test: true },
    prompt: LOOK + STRIKE + END(3) },
  { id: 'clip-rose-strike-2s', tab: 'Clips', group: 'Rose', title: 'TEST: Rose strike as a 2 second video', ar: '4:3', refs: [ROSE],
    clip: { id: 'rose-strike-2s', owner: 'rose', start: ROSE, model: G15, res: '480p', dur: 2, figRows: 83, step: 3, speed: 1.5, test: true },
    prompt: LOOK + STRIKE.replace('and hold it still for a brief moment. Twist', 'for an instant. Straight away twist').replace('Hold the lunge for a moment, then ease back', 'Then snap straight back') + END(2) },
  { id: 'clip-rose-sleep', tab: 'Clips', group: 'Rose', title: 'Rose: gets sleepy and lies down (out of the fight) video clip', ar: '4:3', refs: [ROSE],
    clip: { id: 'rose-sleep', owner: 'rose', start: ROSE, model: G15, res: '480p', dur: 4, figRows: 83, step: 2, speed: 1.5, kind: 'state' },
    prompt: LOOK.replace('Feet stay on the same ground line. Walking away from or toward the camera is not allowed.', 'The character stays in the same place in the frame and ends resting on the same line where the feet stand in the attached picture. Walking away from or toward the camera is not allowed.') +
      'MOTION: TOO SLEEPY, LIES DOWN FOR A NAP\nStart in the relaxed stance of the attached picture. A big yawn with one hand over the mouth, eyelids drooping, a slow tired sway. By the middle of the clip the knees fold and the character sinks straight down in place and sits. Then the character tips gently over onto one side and lies all the way down on the ground line, curled up small like a sleeping child: knees tucked in, head resting on the hands, eyes closed, a small peaceful smile. The character MUST be lying down, fully on the side, well before the end; sitting or kneeling at the end is wrong. Soft and gentle, like a tired child at bedtime, never a hard fall. The hair, the hair bow and every accessory stay exactly as in the attached picture, the same shape, size and color. The curled-up body stays small and compact and stays in the middle of the frame. Hold the sleeping pose completely still for the last second of the clip.' + END(4) },
  { id: 'clip-mudling-idle', tab: 'Clips', group: 'Monsters', title: 'Mudling: waiting in place (idle loop) video clip', ar: '4:3', refs: ['art/clips/start/mudling.png'],
    clip: { id: 'mudling-idle', owner: 'mudling', start: 'art/clips/start/mudling.png', model: G15, res: '480p', dur: 3, figRows: 44.6, step: 4, speed: .6, kind: 'loop', k: 8 },
    prompt: LOOK_FOE + 'MOTION: IDLE LOOP\nThe creature waits in place, alive and curious. Slow breathing: the top of the body swells and settles a little while the base stays put. One slow blink. The eyes glance to one side and back. The leaf sprout on its head sways gently and stays attached. The mud arms stay where they are; drips wobble a little but nothing falls off or lands on the ground. The mouth stays as it is in the attached picture. Keep every motion very small, slow and calm: the creature barely moves.' + END(3) },
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
