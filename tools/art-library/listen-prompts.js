// Listening poses (listen1, card c-idea-implementlisteni, Tom 2026-11-20: "implement listening/thinking poses (should be generated and approved in art library)
// for all chapter 1 talking interactions, including cut scenes"). Required by make-prompts.js. No group of its own: groups.js puts each pose in its person's section (Tom, TNB, Amy ...), Tom 2026-11-26.
// The thinking pose already exists and is approved for the whole cast (`<id>-think`, ch2fix-prompts.js, report c5no). This file adds the listening pose for the
// people who stand and listen (Tom, Grace, Rose, Deedee, Boppy, Aunt Ellie). 2026-11-26 (Tom: "ensure all main characters have a listening item (eg TNB is missing)"): TNB, Amy and Justin added.
// The prompt is the approved think prompt (pose() of ch2fix-prompts.js, same references, same last line) with only the pose sentence changed.
// Install after approval: claude/next-addendum-listen1.md (talk_frames.py adds the frame tk_listen; Sal goes through report_singles.py).
const { pose, HERO, TALK, NPC, CAST } = require('./ch2fix-prompts.js');

const LISTEN = 'Listening closely to someone who stands off to the left of the picture: the three-quarter turn is toward the left, the eyes on that person, the head tipped slightly forward, both hands loosely clasped in front at the waist, the mouth closed in a small attentive smile, the eyebrows a little raised. Interested and warm, not sad, not bored.';
const WHO = ['tom', 'tnb', 'grace', 'rose', 'amy', 'justin', 'deedee', 'boppy', 'ellie'];

const entries = [
  ...CAST.filter(([id]) => WHO.includes(id)).map(([id, n, hero, talk]) => ({
    id: id + '-listen', tab: 'Characters', ar: '2:3', refs: [hero, talk],
    title: `${n} listening (one full-body pose, for chapter 1 lines where someone else is talking)`,
    prompt: pose(n, [HERO(n), TALK(n)], LISTEN,
      'The pose matches the attached talking sheet in size and finish, so it can sit next to those four poses.') })),
];

module.exports = { entries };
