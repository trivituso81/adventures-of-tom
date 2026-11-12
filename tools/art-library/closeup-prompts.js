// Close-up screen art for the Art Library (tab Props, group "Close-ups"). Required by make-prompts.js.
// Tom 2026-11-12: a dedicated close-up screen for the chapter 10 coins (engine/closeup.js, data/closeup-ch10.js, spec claude/coin-closeup-spec.md).
// Two entries, parts method from the start (the 11-09 gate clock failed twice as a multi-state sheet, docs/DUNGEON_FINDS.md "Parts sheets"):
//   closeup-ch10-clock  ONE square painting of the clock face with its seven empty slots (no coins, nothing that changes state).
//   closeup-ch10-coins  seven coins, each alone and big in its own cell, in story order. The game composes plate and coins in code.
// Install: tools/art-library/bake_closeup.py (plate to art/closeup/ch10-clock.webp, sheet to art/closeup/ch10-coin-1..7.webp), then set `ready`
// true in data/closeup-ch10.js and purge ch10Slot. Canon: every coin is "a gold coin, same little clock face" (data/scenes.js ch3 to ch9 finds),
// so each coin carries the same small clock face plus the emblem of where it was found.
const { sheet } = require('./dungeonfind-prompts.js');
const REF_KEY = 'art/grands.webp';
const GATE_REF = 'art/raw/props/prop-find-ch10-v5.png';   // newest approved ch10 sheet: cell 1 clock, cells 2 to 4 hands, cell 6 the gold lock disc with seven slots round one in the middle

const clockPrompt = `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet, a diagram or several states.

ATTACHED IMAGE
1) A prop sheet from "The Adventures of Tom", a family role-playing game. Cell 1 is the airport gate clock, cells 2 to 4 are its hands, and cell 6 is a gold lock disc with seven coin slots round one slot in the middle. Match how these are painted: hand-brushed, matte painted surfaces, rich warm color. Take only the painting style and the look of the clock and slots. Paint only what is described below.

PAINT THIS ONE PICTURE
A close-up, straight-on view of the big round airport clock over Gate Zero, so close that its heavy polished brass rim runs right to the edges of the square picture and fills it, with only a little dark wall showing in the four corners. It is the picture of a clock that is waiting for coins.
- The clock face is warm cream with a fine ring of small black tick marks near the edge. No numbers on the face.
- Seven identical round coin slots, spaced exactly evenly in a ring round the face. Each slot is a dark round hole with a bright gold rim, about one eighth of the clock's width across, big and clear. The first slot is at the very top, at twelve o'clock, and the other six follow clockwise at equal spacing. The ring of slots sits about halfway between the center and the rim.
- ONE more slot in the exact center of the face, the same style and slightly larger. It is empty and dark. This center slot stays empty in the story.
- Three clock hands, stopped and still: a black hour hand, a black minute hand and a thin red second hand, all meeting at the center slot and pointing between the outer slots, never covering one.
- Every slot is completely EMPTY: no coin, no key, no object inside any slot.
- Count check before you finish: exactly seven slots in the ring plus one in the center, eight in all.

ART STYLE
- Painted by hand: visible brushwork, matte painted surfaces, rich warm colors, crisp painted edges. Warm golden light from the upper left, so the brass rim glints on the upper left and falls into soft shadow on the lower right.
- No thick or black outlines. NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading.
- No people, no hands, no characters, no words or letters anywhere, no frame or border.
- Family friendly for children aged 6 and up.`;

const coins = [
  ['COIN 1, SUNDIAL', 'ONE big round gold coin seen straight from the front, with a beaded rim, a small clock face in the upper middle, and below it an embossed round stone sundial with a pointer. Bright and shiny. Only the coin, alone.'],
  ['COIN 2, STEAMER', 'The same kind of coin as cell 1, same size, same beaded rim and same small clock face in the upper middle, but below the clock an embossed clothes steamer with a curl of steam. Only the coin, alone.'],
  ['COIN 3, SIGN-UP SHEET', 'The same kind of coin as cell 1, same size, same beaded rim and same small clock face in the upper middle, but below the clock an embossed clipboard with a few written lines and a pencil. Only the coin, alone.'],
  ['COIN 4, JAR', 'The same kind of coin as cell 1, same size, same beaded rim and same small clock face in the upper middle, but below the clock an embossed round glass jar with a lid and a bubbly sourdough starter inside. Only the coin, alone.'],
  ['COIN 5, 1952 BOOK', 'The same kind of coin as cell 1, same size, same beaded rim and same small clock face in the upper middle, but below the clock an embossed closed old library book with a ribbon marker, and the numbers 1952 stamped under it. Only the coin, alone.'],
  ['COIN 6, 1963 OVEN', 'The same kind of coin as cell 1, same size, same beaded rim and same small clock face in the upper middle, but below the clock an embossed little old oven with a round window in its door, and the numbers 1963 stamped under it. Only the coin, alone.'],
  ['COIN 7, MIRRORBALL', 'The same kind of coin as cell 1, same size, same beaded rim and same small clock face in the upper middle, but below the clock an embossed mirrorball covered in tiny squares with a few sparkles, and the numbers 1971 stamped under it. Only the coin, alone.'],
];

module.exports = { entries: [
  { id: 'closeup-ch10-clock', tab: 'Props', group: 'Close-ups', title: 'Chapter 10 coin close-up: the Gate Zero clock face with seven empty slots round one center slot (one square painting)', ar: '1:1', refs: [GATE_REF], prompt: clockPrompt },
  { id: 'closeup-ch10-coins', tab: 'Props', group: 'Close-ups', title: 'Chapter 10 coin close-up: the seven gold coins (7 parts, each alone, story order)', ar: '1:1', refs: [REF_KEY], prompt: sheet('the chapter 10 coin close-up, the seven gold coins', coins, true) },
] };
