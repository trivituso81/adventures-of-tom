'use strict';
// data/b3-gear.js — what worn gear does in Battle 3 (card c-b3gear; battle plan: claude/battle-architecture.md gap row 31, claude/battle-spec-v11.md section on gear).
// Items keep their old stats and perks (data/party.js). This table says what each one means in the new battle; nothing is removed from an item.
// Flat bonuses (item.stats) add to the member's level-line stat: POW to Attack, GRIT to Defense, PEP to Speed, HP to Max HP. `per` is the
// number of battle points one point of that item stat gives (all 1 until a balance pass says otherwise).
// Percent perks (item.perk.stat) become a mod of kind 'gear' on that stat, so they multiply with Vibe Leans, statuses and Quirks like any other kind.
// A stat or perk with no meaning in the new battle is listed under `off`: it is shown in the menu and does nothing in a fight.
const B3_GEAR={
  flat:{hp:{to:'hp',per:1},pow:{to:'atk',per:1},grit:{to:'def',per:1},pep:{to:'spd',per:1}},
  pct:{pow:'atk',grit:'def',pep:'spd'},
  off:{
    stats:{warmth:'Warmth was the old Magic stat; the new battle has no such stat',cool:'Cool was the old resist stat; the new battle has no such stat'},
    perks:{crit:'the new battle has no crit chance (hits are not random)',evade:'the new battle has no dodge chance',regen:'no heal over time yet',
      startVp:'Vibe Points are not earned that way in the new battle',heart:'HEART is gone (the Family Ruckus replaced it)',coins:'coins are paid after a fight, not by a battle rule',
      kind:'Kindness Scrapbook is retired',immune:'the old battle\'s status ids do not match the new statuses (Tom can decide a new immunity list later)'}
  }
};
