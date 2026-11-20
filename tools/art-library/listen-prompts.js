// Listening poses (listen1, card c-idea-implementlisteni, Tom 2026-11-20: "implement listening/thinking poses (should be generated and approved in art library)
// for all chapter 1 talking interactions, including cut scenes"). Required by make-prompts.js (group "Listening poses").
// The thinking pose already exists and is approved for the whole cast (`<id>-think`, ch2fix-prompts.js, report c5no). This file adds the listening pose for the
// seven people who stand and listen in chapter 1 (Tom, Grace, Rose, Deedee, Boppy, Aunt Ellie and Sal; Amy talks from a window and TNB by phone text, so neither listens).
// The prompt is the approved think prompt (pose() of ch2fix-prompts.js, same references, same last line) with only the pose sentence changed.
// Install after approval: claude/next-addendum-listen1.md (talk_frames.py adds the frame tk_listen; Sal goes through report_singles.py).
const { pose, HERO, TALK, NPC, CAST } = require('./ch2fix-prompts.js');

const LISTEN = 'Listening closely to someone who stands off to the left of the picture: the three-quarter turn is toward the left, the eyes on that person, the head tipped slightly forward, both hands loosely clasped in front at the waist, the mouth closed in a small attentive smile, the eyebrows a little raised. Interested and warm, not sad, not bored.';
const WHO = ['tom', 'grace', 'rose', 'deedee', 'boppy', 'ellie'];

const entries = [
  ...CAST.filter(([id]) => WHO.includes(id)).map(([id, n, hero, talk]) => ({
    id: id + '-listen', tab: 'Characters', group: 'Listening poses', ar: '2:3', refs: [hero, talk],
    title: `${n} listening (one full-body pose, for chapter 1 lines where someone else is talking)`,
    prompt: pose(n, [HERO(n), TALK(n)], LISTEN,
      'The pose matches the attached talking sheet in size and finish, so it can sit next to those four poses.') })),
  { id: 'sal-listen', tab: 'Characters', group: 'Listening poses', ar: '2:3', refs: ['art/raw/npcs/npc-photo-sal-v3.png', 'art/raw/npcs/npc-emotions-sal-v1.png'],
    title: 'Sal listening (one full-body pose, for the opening while Tom thanks him)',
    prompt: pose('Sal, a cab driver of about fifty', [NPC('Sal'), 'The approved feelings sheet of Sal, for the size of the head against the body and the painted finish.'], LISTEN,
      'The pose matches the attached feelings sheet in size and finish, so it can sit next to those poses.') },
];

module.exports = { entries };
