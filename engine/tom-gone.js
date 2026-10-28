'use strict';
// engine/tom-gone.js — Tom leaves the party (chapter 18 "No Touching, Please." to the middle of chapter 19).
// The design: Tom stays in every save and in ALL_MEMBERS (his level, gear and stamps ride along untouched, so he can come back in chapter 19 and chapter 20),
// and the story flag 'tom-gone' is the only switch. While it is set:
//   - hero is taken out of `party`, so the menu loses his portrait and tab and battles are built without him (nothing else in the engine had to change);
//   - the player's sprite on the overworld is the lead member (TNB), drawn from his own sheet, and that member is not also a follower or on the bench;
//   - saves keep working: a save made while he is gone lists the party without him, and loadGame (wrapped below) re-applies the switch after loading.
// tomBack() reverses it (chapter 19: "Tom comes back mid-boss"). Wraps applyPartyRules and loadGame. Loaded after engine/bench.js.
const tomGone=()=>typeof STORY!=='undefined'&&STORY.mode==='full'&&flag('tom-gone')===true;
const tomGoneLead=()=>tomGone()?tnb:hero;          // whose sprite is the player on the overworld
const playerSkinId=()=>tomGone()?tomGoneLead().id:'tom';
function tomGoneApply() {
  if(!tomGone()) { if(!party.includes(hero)) party.unshift(hero); return; }
  const i=party.indexOf(hero); if(i>=0) party.splice(i,1);
  const lead=tomGoneLead();
  const fi=followers.findIndex(f=>f.member===lead); if(fi>=0) followers.splice(fi,1);
  const bi=benchIds().indexOf(lead.id); if(bi>=0) benchIds().splice(bi,1);
  if(!inParty(lead)&&party.length<PARTY_MAX) party.push(lead);
  if(typeof menuChar!=='undefined'&&menuChar>=party.length) menuChar=0;
  if(typeof b6Badge==='function') b6Badge();
}
// Chapter 19: Tom is back. Clears the switch and puts him first in the party again.
function tomBack() {
  setFlag('tom-gone',false);
  if(!party.includes(hero)) party.unshift(hero);
  if(typeof menuChar!=='undefined') menuChar=0;
  if(typeof b6Badge==='function') b6Badge();
}
const LE_applyPartyRules_tomgone=applyPartyRules;
applyPartyRules=function() { LE_applyPartyRules_tomgone(); tomGoneApply(); };
const LE_loadGame_tomgone=loadGame;
loadGame=function(slot) {
  const ok=LE_loadGame_tomgone(slot);
  if(ok) { tomGoneApply(); if(typeof placeFollowers==='function') placeFollowers(); if(typeof refreshAreaUI==='function') refreshAreaUI(); }
  return ok;
};
const LE_resetStory_tomgone=resetStory;
resetStory=function(mode,chapter) { const r=LE_resetStory_tomgone(mode,chapter); tomGoneApply(); return r; };
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{tomGone,tomGoneApply,tomBack}); });
