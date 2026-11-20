# Chapter 2 teardown list (2026-11-20). Nothing in the game has been changed yet.

Script going in: claude/story-ch02-draft4.md, word for word (93 lines, 90 distinct clips to record). The build writes and rewords no dialogue. Where the engine cannot play a direction, the default below is a proposal for Tom, not a script change. Board card: c-ch2build (tag ch2build). Chapter 1 play feedback: none was sent with the prompt, so none is applied.

## 1. Built scene, what replaces it

All map ids are in data/maps-la.js. Scenes 2, 3 and 4 all play on Jefferson Park (`jpark`): Tom's house and 2nd Avenue at the bottom, the Jefferson Boulevard shop fronts at the top.

| Built scene (data/scenes.js) | Replaced by (locked script) | Map and trigger |
|---|---|---|
| ch2Arrive (landing line, zoom, goal toast) | No landing line in the script. The cab landing keeps the default voiced lines (ARRIVALS has no entry for 2). Only the goal toast stays | blvd, `ch2-arrive` |
| ch2Loft (kiss, SkyMiles, pond story, "something fishy", TNB joins) | Scene 1: TNB at the window, Tom goes first / can't hold it in, the muffin pan fish, purple sky, "hills, then bread". TNB joins at the end | lofts, `ch2-loft` |
| ch2Sky (purple sky outside the loft, "pretty grape") | Gone. Scene 1 now carries the purple sky, indoors | none |
| ch2Porch (Nara meeting in engine/nara.js, then TNB explains Olivia, bread bowl reveal, Sit. Paw. Treat.) | Scene 2: Nara jumps on Tom and licks his chin, the work stick, "sticking around", smog rolling down 2nd Avenue. Nara joins | jpark, `ch2-porch` |
| ch2Starter (Bready Mercury, Queen songs, purple street seen from the kitchen) | Gone. No kitchen scene in the locked chapter | none |
| ch2Smog (Mr. Washington's 1979 loop, Smoglet coughs, Popcorn Jump) | Scene 3: Mr. Washington's one greeting three times, Smoglet on his porch, two Smoglets, ONE fight | jpark, `ch2-smog` |
| ch2Odette and ch2Carmen (two separate shop interiors, trance lines, Tom flips the pupusas) | Scene 4: one outdoor scene at the two storefronts, Tom flips the pupusas, "It's always the nice ones" | jpark, new trigger after the Smoglet fight |
| ch2Source (TNB points at the Observatory) | Folded into the last two lines of scene 4. The flags `ch2-odette`, `ch2-carmen`, `ch2-source` are all set at the end of scene 4 so the trail gate (maps-la.js line 149) opens | jpark |
| ch2Flurry (street cleaning ticket, Tom pays in SkyMiles) and ch2Coyote (snack lines, TNB kiss and heal) | Scene 5: Saturday ticket, "Denied?", then the bright coyote and Nara leaning on Tom's shins | griffith, `ch2-t1`, `ch2-t2` |
| ch2Lemon (tree, tugging, Tom holds the bulb up) | Scene 6: grey tree, Tom taps the block with the stick, TNB knocks, Nara drops the bulb, Tom texts Grace, Grace answers | griffith, `ch2-lemon` |
| ch2Boss (Big Shake monologue, TNB "forty-seven times") | Scene 7: Tom lifts Nara, five short Big Shake lines, "please don't drop it" | griffith, `ch2-boss` |
| ch2AfterBoss (kind or plain branch, sneeze, coin close-up, "two flashes, two blocks") | Scene 8: "How are you doing?", TNB's naps, the sneeze, Nara catches the coin, "Sour dough", blue sky, grey tree stays | griffith, `ch2-after` |
| ch2End (Mr. Washington's ending, towel smack, bread bowl, "two homes", chapter card) | Scene 9: second sentence, Doña Carmen takes it back, Miss Odette's bread, Nara eats Tom's bread, "Hills, then bread." Chapter card and Sol toast stay | jpark, `ch2-end` |

## 2. Things the engine cannot play, with my default (Tom answers only where marked ASK)

| Direction in the script | Engine today | Default I will build unless Tom says otherwise |
|---|---|---|
| ASK 1: Nara greets Tom like an old friend, no surprise, no talk of finding her family | Her first meeting is an engine scene (engine/nara.js `startNaraMeet`): Tom says "Is that NARA?!", asks where Olivia is, she pees, Tom promises to find her family. Baked clip `nara_no_jump` and her greeting bark belong to it | Replace it, in story chapter 2 only, with locked scene 2. The meeting scene stays for free play. Scene 2 sets the same flags (`met-nara`, her tennis ball, `nara-meet` heart trace) |
| ASK 2: Tombos had story moments that are gone (Sit. Paw. Treat. at the porch, Popcorn Jump in the street) | Unlock flags `tombo:nara1` and `tombo:tnb1` live in ch2Porch and ch2Smog. Battle tutorial tips name both | Keep both Tombos. Nara's unlocks when she licks Tom's chin in scene 2. TNB's unlocks right before the Smoglet fight in scene 3. Each is a toast only, no dialogue |
| Purple sky seen from the loft window | Loft is one square painting with no window view (Tom's own earlier report was that the sky cannot be seen from inside) | Purple glow over the window drawn in code (stand-in). A painted purple-window loft would be a new Art Library entry |
| Grape soda in TNB's hand, Tom's bag | No props | Small code-drawn soda can (stand-in). No bag |
| Tom picks up a long stick, drops it flat for Nara, taps the block with it | No held-prop frame | Stick drawn in code beside Tom in scenes 2 and 6 only, with a tap sound. Nara's "drops flat, tail going" is a hop and hearts |
| Nara jumps up, paws on chest, licks chin | The meeting scene already does a jump with hearts | Reuse that lift and hearts, no new frame |
| Nara stiff and growling, leaning on Tom's shins, dropping the bulb on his shoe, catching the coin, trotting one full circle, sitting with crumbs on her nose | No custom frames (Nara frames are on the Library list but not made) | Walk routes and facing: lean = stands against his tile, bulb = small code prop at his feet, coin = code arc into her mouth then a walked circle, crumbs = none. All stand-ins |
| Mr. Washington says the same greeting three times, stuck | Talk op repeats a line fine. Dazed NPC frames exist | As built, three identical lines |
| Smoglet drifts onto the porch, a second floats up, "two of us" | Two Smoglets spawn on the street and walk to him (built) | Same spawns. One fight of two Smoglets (the `count` option from the chapter 1 build) |
| Smoke from Doña Carmen's griddle, pupusas burning, Tom steps behind the counter and flips them | Interiors are separate maps and Miss Odette is next door, so one scene cannot be inside both | Outdoor scene at the two storefronts. Both women spawn at their doors (spawn op, like ch2End). Tom walks to Carmen's door tile, sizzle, no counter, no pupusa art. Purple smoke from the map effects that already exist |
| Tom texts Grace, Grace texts back | Texts are spoken boxes with the sender's face (chapter 1 used this for TNB) | Same method. Tom's text box uses his face. Picture taken = camera click sound, no phone frame |
| Tom bags the burnt bulb | Script has no pickup. Chapter 3 needs Tom to carry the lemon bulb home | Tom pockets the bulb silently at the end of scene 6 (pickup sound, flag). No line added |
| Tom: "I've picked up Nara" | No carry frame | Nara hops to Tom's tile and stays beside him. The line plays as written |
| The hill sneezes, coin shoots from a pipe, Nara catches it | `endfx sneeze` and the pipe frames exist | As built, plus the coin arc and Nara's stand-in catch above |
| Tom: "Gold. And there's a lemon stamped on it." | Painted coin close-up and `lemoncoin` item exist | Keep the close-up (art/closeup/ch2-coin.webp) and the key item |
| Big Shake fight ends, then scene 8. Built has a kind win and a plain win with different lines | One path in the script | Play scene 8 after either win (Tom's chapter 1 answer: same treatment). Built after-fight lines are removed |
| What plays when the party loses a fight | Built TNB retry lines ("Cut. Reset.", "Wardrobe says nobody is cut") are not in the script | Heal everyone and show the existing toast ("Face X and press A to try again"). No spoken retry line |
| Nara's bread theft at the end: a piece of bread gone from Tom's plate, crumbs on her nose | No plate or bread props | Code-drawn plate and bread that vanishes, Nara sits very straight facing front, hearts. No crumbs |
| The tree stays grey after the fight | Built keeps it grey | As built. Chapter 6's return restores it |

## 3. What is removed

- Scenes and lines: the landing line, SkyMiles and the 412,000 miles, the pond story told to TNB (the script has a new, shorter version), "something fishy", the Queen songs, the bread bowl and the pottery wheel, Bready Mercury and the starter feed, the popcorn story, the 1979 loop, both shop interior scenes, the street cleaning ticket and SkyMiles payment, the snack lines, the Big Shake monologue and its two after-fight branches, the "two flashes, two blocks" summary, the towel line, "two homes".
- Art: the bread bowl close-up (art/closeup/ch2-loaf.webp and its entry in data/closeup-ch2.js). The lemon coin close-up stays.
- Data: ch2 listener-reaction rows and emotion-mood rows for the old lines (data/emotion-reactions.js, data/emotion-moods.js, docs/emotion-reactions.tsv, docs/emotion-index-lines.tsv, docs/talk-lines.tsv), the old ch2 rows in docs/script-convos.tsv, and the old trance and shop-interior trigger code for ch2Odette, ch2Carmen, ch2Starter and ch2Sky. I grep for zero references after.
- Voice: 144 baked clips are keyed to old chapter 2 lines (TNB 80, Tom 25, Mr. Washington 5, Grace 5, Rose 5, the Big One 4, Deedee 4, Miss Odette 3, Doña Carmen 3, Boppy 3, Gus 2, a woman 2, Amy 2, Boomie 1). Not one of the 93 locked lines matches a baked clip. I purge only clips that nothing plays after the swap (`tools/clip-audit/unused_voice.py`, as in chapter 1) and report the exact number. Git keeps the audio.

## 4. Voice lines Tom records when the build is pushed

93 lines, 90 distinct clips (Mr. Washington's greeting is one clip used 4 times; two Smoglet and the others are distinct). Tom 42, TNB 27, Doña Carmen 5, The Big Shake 5, Miss Odette 3, Mr. Washington 2, Smoglet 2, Ticket Flurry 2, Canyon Coyote 1, Grace 1 (her text). The Tom and Grace texts count. TNB is written at Energy 3 (Tom's request). Mr. Washington, Odette and Carmen already have voices. The Big Shake, Smoglet, Ticket Flurry and Canyon Coyote need monster voice directions: short concrete sentences, no moral. Directions come from the "Voice scripts" section of the locked file (tags kept as Tom wrote them; some will break the v4 tag rules, same as chapter 1).

## 5. New art and entries to check before building

No Art Library group "Chapter 2" exists. Already built and not asked for again: the griffith plate with the grey tree and lemon block, the Big Shake, Smoglet, Ticket Flurry and Canyon Coyote sheets and their dialogue portraits, Doña Carmen, Miss Odette and Mr. Washington (talk faces and dazed frames), the lemon coin close-up, Tom's bulb pose `c4t_bulb`. Stand-ins this build draws in code (no Library entry yet): soda can, stick, burnt bulb on the ground, coin arc, plate and bread, purple loft window. Likely later asks if Tom wants real art: Nara action frames (lean on shins, drop at his feet, catch the coin, sit with crumbs), Tom holding the stick, Tom lifting Nara, a painted purple-window loft.

## 6. Order of work after Tom answers

1. Read this list, claude/next.md for test commands and the push procedure. Look at the built frames of ch2Loft, ch2Smog, ch2Lemon and ch2Boss in portrait and landscape.
2. Add scenes 1 to 9 and their triggers, set the flags in section 1, delete the replaced scenes, flags, closeup entry and the old trance code, and grep for zero references.
3. New lines into the voice library with directions, harvest, make-index, talk and emotion rows, Script Editor check (`python3 tools/script-index/build.py`).
4. Write a whole-chapter driver (copy tools/ch7_test.py) and run the chapter from chapter select in portrait and landscape. Look at every scene's frames. smoke.py, tag check, CHANGES entry (`ch2build`), push, then write the result and the next step onto the board cards.
