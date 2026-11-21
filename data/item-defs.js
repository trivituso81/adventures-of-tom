'use strict';
// data/item-defs.js: what an item IS, as a JRPG item definition (itemdef1, Tom 2026-11-20).
// Tom: "change every item banner ... so it reads like a JRPG item definition with four parts: item name and type, a short description of the item,
// its effect in battle, and its effect in story (key items, gifts, unlocks)."
// itemDef(id) gives the four parts. Most of it comes from the item's own fields in the items table (data/party.js and the chapter files):
//   name   items[id].name
//   type   worked out from the fields (keepsake, slot, heal, dmg ...), or ITEM_TYPE[id] when that is wrong for the item
//   desc   items[id].desc (the short, funny description the menus already show)
//   battle worked out from stats, perk and use fields (bonusText and effectText in data/party.js), or ITEM_BATTLE[id]
//   story  ITEM_STORY[id] for key items, gifts and unlocks; every other item gets the line for its kind (ITEM_STORY_KIND)
// A new key item (keepsake:true) or story gift needs its ITEM_STORY line in the same change: tools/itemdef_test.py fails without it.
// Writing rules: short, warm, funny, contractions, no em dashes. Say only what the built game shows.

// IN STORY lines for items that matter to the story.
const ITEM_STORY={
  // Gold coins and other key items (keepsake:true)
  dragonflycoin:'Every gold coin matters later. Rose checks her pocket for it about once a minute.',
  fishcoin:'Every gold coin matters later. Boppy’s hatband is the safest place on Long Island.',
  lemoncoin:'Every gold coin matters later. Tom pats his pocket to check. Then he checks again.',
  hatcoin:'Every gold coin matters later. TNB would keep it anyway. It’s his first trophy.',
  kickcoin:'Every gold coin matters later. Amy put it at the top of the clipboard, where the important stuff goes.',
  oldcoin:'Every gold coin matters later, and this one turned up all on its own. Keep it. You’ll find out who wants it.',
  pepperjar:'Old Iron-Gill finally gave it back. Boppy’s had this jar since before Amy was born, and he isn’t letting go again.',
  bready:'Rescued from the squirrels’ hoard. Getting him back was the whole point. He’s extremely sour about it.',
  goldtag:'Somebody’s been holding a spot for Tom. Not for his bag. For him. That’s either sweet or a threat.',
  greenlight:'Gridlock Prime let go of it once it stopped blocking everybody. The traffic, the pink jacaranda and the music are all moving again.',
  hardhat:'The Drill Worm’s chip popped out, and the radio came back. Sal and Sol’s handwriting is still inside.',
  wardenhelm:'All that’s left of the gold Warden. Boppy’s ache came back, which means Boppy did too.',
  hushchip:'HUSH-9 left it behind after dinner. Rose plays it when the house gets too quiet.',
  fridgephoto:'Your souvenir from home. Proof the whole family made it to the pond. Tom blinked. Tom always blinks.',
  present:'Tom’s present for Grace. It stays wrapped until after cake. Rose will ask about it. Rose will ask a lot.',
  nsinvites:'Grace’s party invitations. Justin never got to mail them, so the family is delivering them by hand.',
  nsbanner:'Justin built it for Grace’s party. It has to get hung up before the party can start.',
  // Gifts from family and friends
  cookie:'Deedee hands one out every time you stop by. Up to two at a time. She counts.',
  juice:'Visit Amy and she’ll hand you one. Visit again and she’ll hand you another. She stops at two.',
  jacket:'TNB gave it to Tom on the first visit. He hasn’t asked for it back. He won’t.',
  bcap:'Boppy handed over his lucky cap on the first visit. He’s never done that before.',
  drawing:'Your souvenir from Amy’s house. It’s Rose’s best work, and she’ll tell you so.',
  pepper:'From Boppy’s garden, given on your first visit to the grandparents’ house. Don’t eat it. He means it.',
  sweater:'In Tom’s bag from the very first step. Deedee would like to know if you’re wearing it.',
  naraball:'Nara gave it to Tom the second she met him. It means she likes you. It also means wet hands.',
  lure:'Bring it home. Boppy’s told everyone about the one that got away. For twenty years.',
  sprout:'Your souvenir from your first visit. His name is Steve. Steve has goals.',
  claytaco:'Your souvenir from your first visit to TNB’s loft. He made it himself, and he’s pretending that’s not a big deal.',
  chalk:'A thank-you for helping Casa Alvarez. The little ones drew it while the grown-ups were still saying thank you.',
  quakemedal:'It fell out of the rubble after the Big Shake. Tom earned it. Tom will tell you how.',
  // Chapter rewards
  n_steamer:'The studio’s thank-you to TNB at the wrap party. He’s never been given anything gold before.',
  wrapjacket:'The studio’s thank-you for saving the wrap party. You’re officially crew now.',
  a_stopwatch:'Principal Pruitt’s thank-you after Field Day. Thirty-one years, and he picked Amy.',
  fielddaytee:'A thank-you for saving Field Day. Amy says you can never have too many. She has eleven.',
  y_goldball:'Lachlan’s thank-you to Nara for saving the park. It took Nara one second to love it.',
  watchvest:'Bernadette’s thank-you for saving Old Oak Park. This year, the vest goes to you.',
  g_librarycard:'Page’s thank-you once the Stacks were quiet again. Grace has already planned the next hundred books.',
  hushsweater:'Page’s thank-you from the Hush Library. Everyone who helps gets one. She has plenty.',
  t_peel:'Old Ironbelly’s thank-you from the Car Barn night crew. Now it’s Tom’s turn on the biscuits.',
  motorcoat:'Mr. Washington’s thank-you from the Car Barn. It’s the most important coat he owns, and he gave it to you.',
  d_compact:'Deedee’s reward from the Moon Club. It’s her own compact, so really it’s a homecoming.',
  velvetcoat:'The Moon Club’s thank-you. Claim ticket 7 has finally been picked up.',
  r_wings:'Rose earned them at Gate Zero. She hasn’t taken them off, and nobody is asking her to.',
  zeropjs:'A souvenir from the Gate Zero lounge. Tom finally found an airport he likes.',
  // Aunt Ellie's prizes (data/ellie-quests.js)
  e_brooch:'Aunt Ellie’s prize for her first errand. She’s got one for every chapter, and a story for every one.',
  e_scarf:'Aunt Ellie’s prize for her second errand. It’s been to Paris more times than you have.',
  e_tea:'Aunt Ellie’s prize for her third errand, three pots of it. The gossip comes free.',
  e_cuecards:'Aunt Ellie’s prize for her fourth errand, three of them. CUT, PRINT and BEHAVE. She means all three.',
  e_hallpass:'Aunt Ellie’s prize for her fifth errand. She’s been saving it since 1961.',
  e_earrings:'Aunt Ellie’s prize for her sixth errand. The squirrels wanted them. Ellie wanted you to have them more.',
  e_glasses:'Aunt Ellie’s prize for her seventh errand. She sees right through people, and now you can too.',
  e_china:'Aunt Ellie’s prize for her eighth errand, three plates of it. She wants a full report on where each one landed.',
  e_fan:'Aunt Ellie’s prize for her ninth errand. She danced with it at the Moon Club. Grace plans to do the same.',
  e_tag:'Aunt Ellie’s prize for her last errand. She’s been everywhere, and now so has the tag.',
  // Everyone's own tool, worn from the start
  k_keyboard:'Tom’s own. He’s had it longer than some of his friendships.',
  g_dumpling:'Grace’s own. She knows exactly where the other one in the world is, and she has thoughts.',
  r_lambytoy:'Rose’s own. Lamby goes everywhere Rose goes. Lamby has seen things.',
  a_whistle:'Amy’s own. It’s been at every game, every practice and one very loud birthday.',
  d_pin:'Deedee’s own. She still won’t share the pie recipe. She’ll share the rolling pin.',
  b_rod:'Boppy’s own. He’ll tell you about every fish it caught. Some of them more than once.',
  n_rib:'TNB’s own. He still uses it every week, and he’s still getting better.',
  o_phone:'Olivia’s own. LivNews is always live.',
  y_stick:'Nara’s own. She found it on 2nd Ave. She won’t be taking questions about the stick.',
  j_tester:'Justin’s own. He brought it from work. He always brings work.',
  // Nine Scoops (Grace's birthday bonus chapter)
  instax:'Tom’s present for Grace’s ninth birthday. It unlocks her Instax move in a fight.',
  nsphoto:'The first picture off Grace’s Instax. It’s going on the fridge, right after this.',
  nspepper:'Boppy brought three from his garden. Save at least one for when the lid slams.',
  g_bshirt:'Grace’s birthday outfit, from the birthday shelf. It only fits the birthday girl.',
  g_bpants:'Grace’s birthday outfit, from the birthday shelf. Cartwheel tested.',
  g_bsash:'Grace’s birthday sash, from the birthday shelf. It gets a slot all to itself. Nine is a big deal.',
};

// A type name, where the one worked out from the fields is wrong for the item.
const ITEM_TYPE={ present:'Key Item', nsinvites:'Key Item', nsbanner:'Key Item', fridgephoto:'Key Item' };
// An IN BATTLE line, where the one worked out from the fields is not enough.
// itemdefplay (Gemini ch1 C11): Battle 3 has no gear stats (no HP, GRIT, COOL, POW from what is worn), so a Wear it line may not name one.
const ITEM_BATTLE={ nspepper:'Throw it: 90 damage. It burns through an ICE SHELL like a Cozy hit.',
  hoodie:'Wear it: Doesn’t change a fight. Smells like the pond, and the Grump would still like it back.',
  barkslab:'Wear it: Doesn’t change a fight. It’s heavy, mossy and very sure of itself.',
  bcap:'Wear it: Doesn’t change a fight. Boppy says it’s for luck, and he’d know.' };
const ITEM_BATTLE_OLDSTATS='Wear it: Doesn’t change a fight yet. It looks great, though.';

// The IN STORY line for every item without its own line, by kind.
const ITEM_STORY_KIND={
  key:'Important. You can’t sell it, so don’t try.',
  souvenir:'A souvenir from your first visit. Every first visit gets one.',
  shop:'Sold in shops. No plot, just better gear.',
  gear:'None. It’s for wearing, and it’s working.',
  charm:'None. It just quietly helps.',
  snack:'None. It’s a snack. A good one.',
  throw:'None. It’s for throwing, not keeping.',
  junk:'None. A shop will pay {sell} for it. That’s the whole story.',
  none:'None. It just came along.',
};
const ITEM_BATTLE_KIND={
  key:'None. It’s far too important to throw.',
  junk:'None. It doesn’t fight.',
  souvenir:'None. It’s a souvenir, not a weapon.',
};

const ITEM_USE_FIELDS=['heal','healAll','revive','vp','dmg','confuse','atkDown','pep'];
function itemDefKind(it) {
  if(it.keepsake) return 'key';
  if(it.slot) return it.tier?'shop':it.slot==='Charm'?'charm':'gear';
  if(it.heal||it.healAll||it.revive||it.vp) return 'snack';
  if(it.dmg||it.confuse||it.atkDown||it.pep) return 'throw';
  if(!it.price&&!it.sell) return 'key';
  return 'junk';
}
function itemDefType(id) {
  const it=items[id];
  if(ITEM_TYPE[id]) return ITEM_TYPE[id];
  let t;
  if(it.keepsake) t='Key Item';
  else if(it.slot) t=(typeof SLOT_LABEL!=='undefined'&&SLOT_LABEL[it.slot])||it.slot;
  else if(it.heal||it.healAll||it.revive||it.vp) t='Recovery Item';
  else if(it.dmg||it.confuse||it.atkDown||it.pep) t='Battle Item';
  else if(/^Souvenir from /.test(it.desc||'')) t='Souvenir';
  else if(!it.price&&!it.sell) t='Key Item';
  else t='Odds and Ends';
  const who=it.who&&typeof PB_NAMES!=='undefined'?PB_NAMES[it.who]:it.who;
  return who?t+', '+who+' only':t;
}
const itemDefEnd=s=>s&&!/[.!?]$/.test(s)?s+'.':s;
function itemDefBattle(id) {
  const it=items[id];
  if(ITEM_BATTLE[id]) return ITEM_BATTLE[id];
  if(it.slot&&(it.stats||(it.perk&&it.perk.stat))) return ITEM_BATTLE_OLDSTATS;   // old Battle 2 stats (hp, pow, grit, warmth, cool, pep) mean nothing in Battle 3
  if(it.slot) { const b=typeof bonusText==='function'?bonusText(it):''; return b?'Wear it: '+itemDefEnd(b):'Wear it. It looks great. That’s all.'; }
  const fx=typeof effectText==='function'?effectText(it).replace(/^Battle: /,''):'';
  if(fx) {
    const verb=it.dmg||it.confuse||it.atkDown?'Throw it: ':'Use it: ';
    const field=typeof fieldUsable==='function'&&fieldUsable(it);
    return verb+itemDefEnd(fx)+(field?' Works outside fights too.':'');
  }
  const k=itemDefKind(it);
  if(k==='key') return ITEM_BATTLE_KIND.key;
  return /^Souvenir from /.test(it.desc||'')?ITEM_BATTLE_KIND.souvenir:ITEM_BATTLE_KIND.junk;
}
function itemDefStory(id) {
  const it=items[id];
  if(ITEM_STORY[id]) return ITEM_STORY[id];
  const k=itemDefKind(it);
  if(k!=='key'&&k!=='shop'&&/^Souvenir from /.test(it.desc||'')) return ITEM_STORY_KIND.souvenir;
  const sell=typeof sellValue==='function'?sellValue(it):(it.sell||0);
  return ITEM_STORY_KIND[k].replace('{sell}',sell===1?'1 coin':sell+' coins');
}
// The four parts of an item definition: {name, type, desc, battle, story}.
function itemDef(id) {
  const it=items[id]; if(!it) return null;
  return {name:it.name,type:itemDefType(id),desc:it.desc||'',battle:itemDefBattle(id),story:itemDefStory(id)};
}
