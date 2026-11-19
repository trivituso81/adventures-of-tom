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
// pace: [[second, step, speed], ...]: from that second of the video on, keep every step-th picture and play at that speed
// instead of step and speed (a quick blink inside a slowed body sway; Tom 2026-11-18).
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
// BOOP: Rose's free move. Tom 2026-11-18: "the boop should be a like sharp jab (not necessarily on the nose) with her finger."
// THIS IS THE APPROVED PROMPT, word for word. Tom had Gemini write it after three of Claude's rewrites missed, and approved its video
// (art/raw/clips/clip-rose-boop-v1.mp4: cheap model, 3 s, start picture only). Do not reword it. It is the pattern for every new clip:
// about 150 words in three labelled parts (WHAT THIS IS, CAMERA AND BACKGROUND, MOTION), each rule said once, the facing and "feet
// planted on the exact same spot" kept, the motion as two sentences that name the count ("once", "without repeating") and end in a
// pose that is held. What went wrong before it (do not repeat): a 330 word prompt that said one reach three ways; then a swing to 49
// words that dropped the facing and the planted feet; then a swing to a different method (pinned pictures, full model, 2 s). Tom:
// "youre overcorrecting, swinging like a pendulum between extremes". When a prompt misses, start from the closest version that
// worked and change the one thing the note names (repo CLAUDE.md, "Fix a miss with the smallest change").
const BOOP_APPROVED = "IMAGE TO VIDEO REQUEST: ONE SHORT ANIMATION CLIP.\n\nWHAT THIS IS\nA 2D sprite animation of the exact character in the attached first-frame image, preserving her exact face, proportions, hair, outfit, accessories, and hand-drawn colored pencil and ink caricature style throughout every frame.\n\nCAMERA AND BACKGROUND\nLocked static camera with zero movement. The character stays facing left with her feet planted on the exact same spot on a flat, solid pure magenta background with no shadows, lighting changes, or visual effects. Silent clip.\n\nMOTION: SINGLE INDEX FINGER TAP\nFrom her starting relaxed stance, she smiles, rises onto her tiptoes, and smoothly extends one arm straight forward to the left at nose height, tapping the air once with a single extended index finger. Without repeating the gesture, she immediately pulls her arm back, settles onto flat feet with both hands resting on her hips, and remains completely still in that proud, smiling pose for the rest of the clip.";
// KO: Rose knocked out (clipko1, 2026-11-18). A TEST, from claude/battle-animation-list-ch1-v11.md section 7 row 3: ONE clip, Rose
// (a child is the likeliest to be refused, so a pass covers everyone). Tom 16:47: "sleeping is not KO its sleep status", so the nap
// is not her KO. Tom 16:56: "i think we can try to override that rule" (the rule against knocked-out wording in character prompts):
// this prompt says "knocked out" once. It is BOOP_APPROVED with only the MOTION part changed (repo CLAUDE.md, "Fix a miss with the
// smallest change"). If the generator refuses or softens it, the one fallback try is the same text with ", knocked out" removed.
const KO_TEST = BOOP_APPROVED.slice(0, BOOP_APPROVED.indexOf('MOTION:')) + "MOTION: KNOCKED OUT\nFrom her starting relaxed stance, she wobbles once, sits down hard on the same spot, and tips over onto her back with her arms out to the sides and her eyes closed, knocked out. Without getting up, she stays lying flat on her back and remains completely still in that pose for the rest of the clip.";
const G15 = 'grok-imagine-video-1.5', LITE = G15 + '-lite', ROSE = 'art/clips/start/rose.png';
const entries = [
  { id: 'clip-rose-boop', tab: 'Clips', group: 'Rose', title: 'Rose: Boop (one sharp finger jab) video clip', ar: '4:3', refs: [ROSE],
    clip: { id: 'rose-boop', owner: 'rose', start: ROSE, model: LITE, res: '480p', dur: 3, figRows: 83, step: 3, speed: 1.5 },
    prompt: BOOP_APPROVED },
  { id: 'clip-rose-ko', tab: 'Clips', group: 'Rose', title: 'Rose: knocked out (TEST: does the video model accept the words) video clip', ar: '4:3', refs: [ROSE],
    clip: { id: 'rose-ko', owner: 'rose', start: ROSE, model: LITE, res: '480p', dur: 3, figRows: 83, step: 2, speed: 1.5, kind: 'state' },
    prompt: KO_TEST },
  { id: 'clip-rose-sleep', tab: 'Clips', group: 'Rose', title: 'Rose: gets sleepy and lies down (out of the fight) video clip', ar: '4:3', refs: [ROSE],
    clip: { id: 'rose-sleep', owner: 'rose', start: ROSE, model: G15, res: '480p', dur: 4, figRows: 83, step: 2, speed: 1.5, kind: 'state' },
    prompt: LOOK.replace('Feet stay on the same ground line. Walking away from or toward the camera is not allowed.', 'The character stays in the same place in the frame and ends resting on the same line where the feet stand in the attached picture. Walking away from or toward the camera is not allowed.') +
      'MOTION: TOO SLEEPY, LIES DOWN FOR A NAP\nStart in the relaxed stance of the attached picture. A big yawn with one hand over the mouth, eyelids drooping, a slow tired sway. By the middle of the clip the knees fold and the character sinks straight down in place and sits. Then the character tips gently over onto one side and lies all the way down on the ground line, curled up small like a sleeping child: knees tucked in, head resting on the hands, eyes closed, a small peaceful smile. The character MUST be lying down, fully on the side, well before the end; sitting or kneeling at the end is wrong. Soft and gentle, like a tired child at bedtime, never a hard fall. The hair, the hair bow and every accessory stay exactly as in the attached picture, the same shape, size and color. The curled-up body stays small and compact and stays in the middle of the frame. Hold the sleeping pose completely still for the last second of the clip.' + END(4) },
  { id: 'clip-mudling-idle', tab: 'Clips', group: 'Monsters', title: 'Mudling: waiting in place (idle loop) video clip', ar: '4:3', refs: ['art/clips/start/mudling.png'],
    clip: { id: 'mudling-idle', owner: 'mudling', start: 'art/clips/start/mudling.png', model: G15, res: '480p', dur: 3, figRows: 44.6, step: 1, speed: .3, pace: [[2.25, 1, 1]], kind: 'loop', k: 8 },
    prompt: LOOK_FOE + 'MOTION: IDLE LOOP\nThe creature waits in place, alive and curious. Slow breathing: the top of the body swells and settles a little while the base stays put. One slow blink. The eyes glance to one side and back. The leaf sprout on its head sways gently and stays attached. The mud arms stay where they are; drips wobble a little but nothing falls off or lands on the ground. The mouth stays as it is in the attached picture. Keep every motion very small, slow and calm: the creature barely moves.' + END(3) },
];
if (require.main === module) {
  const out = 'data/art-prompts.json', doc = JSON.parse(fs.readFileSync(out, 'utf8'));
  for (const e of entries) {
    const i = doc.entries.findIndex(x => x.id === e.id), old = i >= 0 ? doc.entries[i] : null;
    const n = { status: old ? old.status : 'draft', versions: old ? old.versions || [] : [], rejects: old ? old.rejects || [] : [], ...e };
    if (old) {   // a rewritten prompt gets a higher promptRev: the Library then drops an older edit saved on Tom's device (art.html retireOldEdits)
      const rev = (old.promptRev || 0) + (old.prompt !== n.prompt ? 1 : 0); if (rev) n.promptRev = rev;
      if (old.prompt !== n.prompt && old.status === 'rejected') n.status = 'draft';   // a rejected entry with a new prompt is back under To do (its reject notes stay)
      doc.entries[i] = n; continue; }
    const next = entries.slice(entries.indexOf(e) + 1).map(x => doc.entries.findIndex(y => y.id === x.id)).find(j => j >= 0);   // keep this file's order in the Library
    if (next === undefined) doc.entries.push(n); else doc.entries.splice(next, 0, n);
  }
  fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
  console.log('clips in', out, entries.map(e => e.id).join(', '));
}
module.exports = { entries };
