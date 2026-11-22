'use strict';
// data/b3-ux-words.js: the words the Battle 3 screen adds to the rules' own text (build battleux1).
// Four small tables and nothing else. A word is edited here and nowhere else; engine/b3-deck.js only fills the {placeholders}.
//   B3_REACH     who a move reaches, keyed by the move's `target` (B3_TARGETS in engine/b3-core.js). {actor} is the family member using it.
//   B3_KIND      what kind of move it is: the slot of a Skill (basic, s1, s2, cap), or revive / ruckus / pocket.
//   B3_SIZE      how big the hit is, keyed by the move's `power`; `hits` is the line for a move that hits more than once ({n} hits).
//   B3_RUCKUS    the two Family Ruckus moves: the one `short` line (Details on) and the full description. {a} is who is up, {p} their partner.
//   B3_FORECAST  what the tray says will happen, one line per thing the preview (engine/b3-preview.js) can report.
//                {n} {left} {max} {name} {who} {flavor} are filled in by engine/b3-deck.js.
// battleux2 writes the one-line `short` of every move into data/b3-kit-*.js and edits only these words.
const B3_REACH={
  foe:'One monster',
  all_foes:'Every monster',
  random_foes:'Random monsters',
  foe_row:'One row of monsters',
  ally:'One family member',
  family:'One family member',
  self:'{actor} only',
  field:'The monsters’ floor',
  adjacent_allies:'The family next to {actor}',
  ally_pair:'Two family members',
  family_or_ko:'One family member',
  ko_ally:'A knocked-out family member',
  either:'A monster or a family member'
};
const B3_KIND={basic:'Basic',s1:'Skill',s2:'Skill',cap:'Capstone',revive:'Revive',ruckus:'Family Ruckus',pocket:'Pocket Vibe'};
const B3_SIZE={light:'Light hit',standard:'Hit',heavy:'Heavy hit',capstone:'Huge hit',hits:'{n} hits'};
const B3_FORECAST={
  peeve:'Pet Peeve +50%',
  resist:'Resists {flavor}',
  dmg:'About {n} damage',
  ko:'Knocks it out',
  pips:'Composure -{n} ({left} of {max} left)',
  brk:'BREAK!',
  det:'Sets off {name}',
  cancels:'Cancels {name}',
  push:'Falls back {n} on the turn bar',
  pull:'Comes sooner by {n} on the turn bar',
  heal:'+{n} HP',
  fullHp:'Already at full HP',
  shield:'+{n} shield',
  revive:'Back on their feet',
  random:'Monsters picked at random',
  noTarget:'Nothing to aim',
  nextNow:'{who}’s next turn: right after this',
  nextOne:'{who}’s next turn: after 1 other',
  nextMany:'{who}’s next turn: after {n} others',
  aimHint:'Tap a monster to aim at it.',
  aimAlly:'Tap a family member to change.',
  noAim:'Not a target for this move',
  needPep:'needs {n} more Pep',
  windUp:'Winding up {name}',
  windUpAt:'Winding up {name} at {who}',
  noPeeves:'No Pet Peeves',
  peeves:'Pet Peeves',
  noComposure:'No Composure',
  composure:'{n} of {max} Composure',
  backRow:'Back row',
  knockedOut:'Knocked out',
  nothingOn:'Nothing on {name} right now.',
  freeFor:'FREE SKILL FOR {who}',
  freeFrom:'Free from {who}.',
  use:'USE',
  useTap:'tap again',
  useKey:'Enter',
  needMore:'needs {n} more Pep',
  lowPep:'{who} has {have} Pep. This needs {need}. A Basic gives {gain}.',
  fullList:'All details',
  close:'Close',
  cont:'CONTINUE',
  group:{ruckus:'Family Ruckus',main:'Main \u00b7 {name}',pocket:'Pocket \u00b7 {name}',any:'Anyone'},
  pepWord:'Pep',
  ruckusWord:'RUCKUS',
  details:'DETAILS',
  free:'FREE',
  basicGain:'FREE, +{n} PEP'
};
const B3_RUCKUS={
  double:{short:'With {p}: both Basics on one monster, +50% power.',desc:'{a} and {p}, who is next on the turn bar, both use their Basic on one monster at +50% power. No Pep, and {p} still gets their own turn.'},
  full:{short:'With {p}: both fire their best Skill, free.',desc:'{a} and {p}, who is next on the turn bar, both fire their best Main Vibe Skill free, as one action. It can knock up to 4 Composure pips off. {p} still gets their own turn.'}
};
