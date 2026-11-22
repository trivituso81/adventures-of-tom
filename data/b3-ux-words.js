'use strict';
// data/b3-ux-words.js: the words the Battle 3 screen adds to the rules' own text (build battleux1).
// Four small tables and nothing else (b3look removed B3_REACH: the tray names who a move reaches). A word is edited here and nowhere else; engine/b3-deck.js only fills the {placeholders}.
//   B3_KIND      what kind of move it is, said after its flavor ("Racket basic"): the slot of a Skill (basic, s1, s2, cap), or revive.
//   B3_SIZE      how big the hit is, keyed by the move's `power`; `hits` is the line for a move that hits more than once ({n} hits).
//   B3_RUCKUS    the two Combos (Double Team, Family Ruckus): the one `short` line and the full description. {a} is who is up, {p} their partner
//                (the row already says who with: B3_FORECAST.withP).
//   B3_FORECAST  what the tray says will happen, one line per thing the preview (engine/b3-preview.js) can report.
//                {n} {left} {max} {name} {who} {flavor} are filled in by engine/b3-deck.js.
// b3look (claude/b3look-plan.md) put these in the menu's words: Combos, Primary, Secondary, sentence case, nothing said twice.
// battleux2 wrote the one-line `short` of every family move into data/b3-kit-*.js (checked by node tools/b3-sim.js check) and edited these words.
const B3_KIND={basic:'basic',s1:'skill',s2:'skill',cap:'capstone',revive:'revive'};
const B3_SIZE={light:'Light hit',standard:'Hit',heavy:'Heavy hit',capstone:'Huge hit',hits:'{n} hits'};
const B3_FORECAST={
  peeveTag:'Pet Peeve',
  recTag:'Try this',
  resist:'Resists {flavor}',
  dmg:'About {n} damage',
  ko:'Knocks it out',
  pips:'Composure down {n}, {left} left',
  brk:'BREAK!',
  det:'Sets off {name}',
  cancels:'Cancels {name}',
  heal:'+{n} HP',
  fullHp:'Already at full HP',
  shield:'+{n} shield',
  revive:'Back on their feet',
  noTarget:'No aim needed',
  aimHint:'Tap a monster to aim at it.',
  aimAlly:'Tap a family member to change.',
  noAim:'This move can’t aim here',
  noPeeves:'No Pet Peeves',
  peeves:'Pet Peeves',
  backRow:'Back row',
  back:'Back',
  marked:'Marked',
  nextTarget:'Next target',
  ko0:'KO',
  knockedOut:'Knocked out',
  nothingOn:'Nothing on {name} right now.',
  freeFor:'Free Skill for {who}',
  freeFrom:'Free from {who}.',
  family:'The family',
  use:'Use',
  useTap:'tap again',
  useKey:'Enter',
  needMore:'needs {n} more Pep',
  fullList:'All details',
  close:'Close',
  cont:'Continue',
  group:{ruckus:'Combos',main:'Primary',pocket:'Secondary',any:'Anyone'},
  pepWord:'Pep',
  combos:'Combos',
  turns:'Turns',
  withP:'With {p}',
  skinWith:'{name} with {p}',
  details:'Details',
  exit:'Exit',
  winNow:'Win now',
  free:'Free'
};
const B3_RUCKUS={
  double:{short:'Both Basics on one monster, extra strong.',desc:'{a} and {p}, who is next on the turn bar, both use their Basic on one monster at +50% power. No Pep, and {p} still gets their own turn.'},
  full:{short:'Both use their best Skill, free.',desc:'{a} and {p}, who is next on the turn bar, both fire their best Primary Vibe Skill free, as one action. It can knock up to 4 Composure pips off. {p} still gets their own turn.'}
};
