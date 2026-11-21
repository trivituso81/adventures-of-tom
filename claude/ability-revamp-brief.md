# Adventures of Tom: Ability Revamp Brief

This file is a complete brief for an AI game designer. Part A is the request. Parts B to H are the context you need. Part I is the exact output format. Read everything before designing anything.

---

## PART A. THE REQUEST

### Who is asking
Tom, the game's director. He designs and directs; another AI (Claude) builds the game in code. Your output will be handed to that builder, so it must be precise enough to implement without guessing, and fun enough that Tom is delighted reading it on his phone.

### What we want from you
Redesign the **abilities themselves** for all eight playable characters. Keep the battle **architecture** exactly as it is (Part D). Change the **content**: ability names, how many abilities each character has, what each one does, and every animation.

Four goals, in priority order:

| # | Goal | What "done" looks like |
|---|---|---|
| 1 | **More abilities overall** | Each character's two Stampcard paths grow from 4 nodes to **6 nodes each** (12 path skills per character instead of 8). Passive-only nodes are replaced by active skills unless a passive is clearly more fun. Every new node is a real move with its own animation and spoken line. |
| 2 | **Unique combos (Tombos and Family Finishes)** | Every Tombo is a **brand-new ability with its own animation**, not a mashup of two existing moves. The current Tombos ("Tom uses Unboxing while Grace uses Squishy Squeeze") are exactly what we do NOT want. A Tombo is a shared activity Tom and that person actually do together, staged as its own little scene. Each partner's Tombos must also feel different in function from every other partner's Tombos (not seven versions of "big hit on all enemies"). |
| 3 | **Revamped final abilities (Ultimates)** | Each path's last node (its capstone) becomes an **Ultimate**: the most powerful move that path has, with a long, dramatic, cinematic animation that is still unmistakably that character and still funny. Two Ultimates per character (one per path). Ultimates must be brand new, not upgraded versions of earlier moves in the path. |
| 4 | **True to character, funny, sometimes silly** | Every ability comes from who the person really is (Part C). Jokes come from character, never from randomness. Some moves are warm, some are dry, some are pure kid silliness. Each character's 12 path skills should have a range of tones. |

### What you may change
- Ability names, keys, effects, numbers (VP cost, multiplier, hits, targets, level gates, SP costs), elements, and every animation.
- Basic moves (D-pad Up): you may rename and reanimate them, but keep them free (0 VP) and simple.
- Path names and subtitles (two paths per character), as long as each path keeps a clear identity.
- The number of nodes per path (target 6; 5 to 7 is acceptable if you justify it), and the Stamp Point costs and level gates needed to make that work.
- Existing skills: you may KEEP a small number that are already strong and true to character (mark them KEEP and say why). At least two thirds of each character's path skills must be NEW or REWORKED. Tombos, Family Finishes and Ultimates must be 100% new.

### What you must NOT change
- The architecture in Part D: VP, HEART meter, CTB turn ribbon, the four-direction command cross, Stampcards (two paths per character, nodes stamped in order), Tombos (Tom plus one partner, paid from HEART, three tiers), Family Finishes, Kindness (Warmth bar), elements, statuses, character traits, Tag Swap.
- The eight **signature specials** (D-pad Down): DEFEND, DANCE, SILLY, PEP TALK, MOON & BACK, GRUMBLE, WARDROBE, PUPPY EYES. Their names and core function stay because the story's finale depends on them (Part E). You MAY propose a richer animation for any of them.
- Character traits (Part D, section D7). Your new abilities should play with these traits, not replace them.
- Canon facts about the characters (Part C). Do not invent new relatives, jobs, or backstory.
- Tombo unlock story beats for chapters 1 to 10 (already built; see Part E). You redesign what those Tombos ARE, not when they unlock.

### Hard rules for all text
- **No em dashes anywhere** in game text (names, descriptions, lines, messages).
- Grace and Rose call Tom **"Tata"** (written "Ta-Ta" in lines) in speech only. Every menu, description and message calls him **Tom**.
- Tom's exclamations are emphatic ("That was UNCALLED for!").
- Nara never speaks words. She barks; narration boxes explain what she means.
- Every ability has **its own spoken line** that references that move by name or action. Lines are short (aim for 12 words or fewer), warm and funny.
- Justin (Amy's husband) is always at work. Mention lightly at most, never as a running joke.
- Deedee's wine is one joke at most in the whole kit (her existing Wine O'Clock counts).
- Boppy's complaints are about his **stomach** and people **walking too fast**. Never his joints or knees.

---

## PART B. THE GAME

| Item | Detail |
|---|---|
| Title | Adventures of Tom (first town: Little Elsewhere) |
| Genre | 16-bit SNES-style JRPG, about 40 hours, 20 chapters in two Parts |
| Status | Part 1 (chapters 1 to 10) is built and playable. Part 2 (chapters 11 to 20) is next. |
| Influences | Chrono Trigger (Dual Techs, sprite theatricality), EarthBound (suburban charm, visible monsters, instant wins), Final Fantasy IV (party members come and go with the story), Final Fantasy X / Trails (visible turn order) |
| Platform | Web game played mainly on an iPhone in portrait, one thumb, with an optional landscape mode and gamepad support |
| Players | Tom and his family, including a 6-year-old and a 9-year-old. Must be readable and delightful for kids, with real depth for adults. |
| Moral | Kindness and love always defeat evil and hatred. Monsters are stressed-out "Friction Sprites" you can either knock out or cheer up. |
| Visual style | Pixel art drawn in code (no image files for moves). Characters are small pixel sprites scaled up 3x. Effects are pixel props, particles, color washes and big bold pixel text. |

---

## PART C. THE CAST (CANON)

All eight are real people from Tom's life (Nara is a real dog). Design from these facts.

### C1. Tom (the player; "Uncle," "Tata" to the girls)
- Product director, calm and dry, hyper-capable, protective. Lives in Jefferson Park, Los Angeles, with TNB. Flies coast to coast constantly (Delta One business class, Platinum status, window seat).
- Loves video games (classic JRPGs especially), studies Japanese (flashcards, kanji, Quizlet streaks), bakes sourdough (his starter is named Bready Mercury), loves gadgets and unboxing them.
- Battle identity: the bodyguard. DEFEND steps in front of an ally: "No touching, please."
- Humor: deadpan understatement that suddenly turns emphatic. "That was UNCALLED for!"
- Current paths: Home Baker (sourdough, gadgets, first class) and Polyglot Gamer (flashcards, kanji, boss fights).

### C2. Grace (9, Tom's niece)
- Bright, bossy, fashion-forward big sister. Gymnast and dancer. Runs her life like a YouTube channel ("Like and subscribe!").
- Prized possession: a sparkling diamond gold soup dumpling squishy. Collects squishies. Loves glitter nails.
- Feels responsible for her little sister Rose. Loves choreographing everyone.
- Signature: DANCE (party heal).
- Current paths: Influencer Cleric (squishies, glitter, ring lights) and Acro-Star (gymnastics, dance battles).

### C3. Rose (6, Tom's niece)
- Silly, fearless, jumpy, giggly. Rides on Tom's shoulders ("Ta-Ta, up!"). Treats monsters like playmates. Raspberries and tickles.
- Has a stuffed lamb named Lamby. Loves dress-up and princess stuff. "I'm not little, I'm travel-sized!"
- Signature: SILLY (raspberry; enemy is Goofed and loses its turn).
- Current paths: Giggle Gremlin (peekaboo, spins, dress-up) and Piggyback Kid (Lamby and Tom's shoulders).

### C4. Amy (Tom's sister; Grace and Rose's mom)
- Teacher (red pens, pop quizzes, gold stars, hall passes), runner (marathons, hill repeats, personal bests), fiercely competitive, loves her daughters fiercely. Carries the load and never asks for help.
- Doesn't do dairy. Husband Justin is always at work.
- Signature: PEP TALK (everyone else's next hit or heal +50%).
- Current paths: Head Teacher (red pens, pop quizzes) and Marathon Mom (burpees, hills, the finish line).

### C5. Deedee (Tom's mom; the girls' grandma)
- Retired registered nurse; Tom calls her a "registered nut." Energetic. Bakes (rhubarb crisp is her signature), makes big dinners, gardens, cleans constantly, power walks. Enjoys a glass of wine now and then.
- Says "I love you to the moon and back" (full phrase). Married to Boppy for 51 years.
- Signature: MOON & BACK (group hug heal).
- Current paths: Registered Baker (check-ups, crisp, Sunday dinner) and Busy Bee (power walks, wine o'clock).

### C6. Boppy (Tom's dad; the girls' grandpa)
- Retired Assistant Deputy Warden at Rikers ("Nobody got past me"). College cross-country champion; entered college in 1970 and LOVES telling the story.
- Fishing, spicy peppers (grows his own), his recliner. Always "not feeling good," always his stomach, always "everybody walks too fast."
- Grumbles, but under it is fear of slowing down while his granddaughters speed up.
- Signature: GRUMBLE (enemy row hits softer and targets him; he guards).
- Current paths: Rikers Warden (fishing, the recliner, headcounts) and Pepper Champion (peppers and the 1970 story).

### C7. TNB (Tom's boyfriend)
- Chill, easy-going, crafty. Makes beautiful pottery (wheel, kiln, glazes, "cone six"). Longboards down steep LA streets. Horror movie buff. Loves mass transit (the Metro). Fixes things.
- Works as a wardrobe runner on film sets (manages costume racks and continuity for each scene).
- Pun humor. Catchphrase "Well, well, well..." Greets Tom with a kiss and a heart.
- Talks about Tom, pottery and fixing things; rarely about Tom's family.
- Signature: WARDROBE (revive or heal plus a costume from the rack).
- Current paths: Set Costumer (wardrobe, the Metro, horror) and Kiln & Longboard (pottery, steep streets).

### C8. Nara (40-lb black Labradoodle; belongs to Tom's cousin Olivia)
- Seven years old, playful, energetic, obsessed with fetch and tennis balls. Very picky eater (only chicken jerky and homemade family food). Pees a tiny puddle when excited. Separation anxiety. Never speaks; barks only.
- Signature: PUPPY EYES (enemy is Smitten and skips its turn).
- Current paths: Goodest Girl (fetch, zoomies, tug of war) and Pack Heart (puddles, shakes, howls).

### C9. Supporting cast you may reference in animations (cameos are welcome)
| Who | Where | Notes |
|---|---|---|
| Sal and Sol | Little Elsewhere taxi / LA cab | Cousin cabbies |
| Penny and Nickel | Little Elsewhere coin shop / DTLA coin shop | Red-haired coin-shop cousins |
| Miss Odette, Dona Carmen, Mr. Washington, the Alvarez family (10 people) | Jefferson Park, LA | Creole kitchen, pupuseria, porch stories from 1979, string lights |
| Marguerite and Wes | Backlot Wardrobe / screenwriter | TNB's film-set world |
| Olivia, Michael, Lachlan (4), Isla (1) | LA | Nara's family |

---

## PART D. THE BATTLE ARCHITECTURE (KEEP AS IS)

### D1. Turn order and commands
- **CTB turn ribbon:** a visible row of upcoming turns. Ticks until next turn = floor(1200 / (PEP + 30) x MoveWeight). Move weights: quick 0.7, standard 1.0, heavy 1.3.
- **Command cross** (one thumb):

| Input | Command |
|---|---|
| D-pad Up | Basic move: 0 VP, gives +1 VP and +5% HEART |
| D-pad Right | Skills: scrollable grid of stamped path skills |
| D-pad Left | Tombo: Tombos and Family Finishes, paid from HEART |
| D-pad Down | Care & Bag: signature special, snacks, Tag Swap |
| A | Confirm; tapping A on an attack's sparkle frame is an optional "High-Five" (+15% effect, +5% HEART) |
| B | Back; hold to Inspect an enemy's weaknesses and what cheers it up |

### D2. Resources
- **HP:** 100 at level 1 to 999 at level 50. Below 25% a member kneels (Nara sits). At 0 they collapse.
- **VP (Vibe Points):** cap 10, start each battle at 5, +2 at the start of each of your turns, +1 after a basic move. Path skills currently cost 2 to 6 VP.
- **HEART meter:** shared party gauge, 0 to 100% (four hearts of 25%). Fills from basics (+5%), heals, buffs and DEFEND (+15%), hitting a weakness (+15%), an ally being hurt (+10%). Tombos spend 25% (tier 1), 50% (tier 2) or 75% (tier 3). Family Finishes spend 75%.

### D3. Stats (10 to 99 over levels 1 to 50)
| Stat | Meaning | Best |
|---|---|---|
| HP | Health | Boppy, Tom, Amy |
| POW | Physical hits | Amy, Boppy, Nara, Tom |
| GRIT | Physical defense | Boppy, Tom, Deedee |
| WARMTH | Heals, baking, pep, emotional attacks | Deedee, Grace, TNB, Rose |
| COOL | Defense against WARMTH and statuses | TNB, Tom, Deedee |
| PEP | Turn speed and evasion | Nara, Amy, Grace, Rose |

Damage = max(1, (attacker POW or WARMTH x 2.5 minus target GRIT or COOL x 1.2) x multiplier) x element bonus x High-Five. "hybrid" moves use the better of POW and WARMTH. Heals = (base + WARMTH x 3.2) x multiplier, or a percentage of max HP.

### D4. Elements (weak hits x1.5, resisted x0.5)
| Element | Flavor | Beats |
|---|---|---|
| Kinetic | Cartwheels, tackles, longboards, rolling pins | |
| Cozy | Ovens, peppers, kilns, warm food | Amber, Splash-type cold things |
| Splash | Fishing, water, mud, wet dog | Cozy |
| Sparkle | Glitter, ring lights, confetti, unboxing | Dark/grump, Amber |
| Chatter | Sound: raspberries, pep talks, barks, flashcards, grumbles | Kinetic stances |
| Amber | Villain only: time-freeze, greyscale, silence | (weak to Cozy and Sparkle) |

### D5. Targets you can use
`enemy` (one), `splash` (one at 100% plus neighbors at 60%), `row` (front or back row), `front` (front row), `all` (all enemies), `multi` (N random hits), `ally`, `allyko` (a knocked-out ally), `party`, `self`, `others` (party except self). Enemies stand in a front row (up to 3) and back row (up to 2).

### D6. Effects the engine already supports (use these first)
| Op | What it does |
|---|---|
| `heal` | Heal a % of max HP plus WARMTH x factor (target: one, lowest, party, self, partner) |
| `revive` | Bring back a knocked-out ally at % HP |
| `cure` | Remove one debuff, all debuffs, mental debuffs, or Amber |
| `st` | Apply a status for N turns (list below) |
| `ct` | Push a unit's next turn back or pull it forward on the ribbon (by a fraction) |
| `interrupt` | Break a boss's telegraphed wind-up |
| `goof` | Goofed: enemy loses its next turn (bosses drop what they hold) |
| `smit` | Smitten: enemy skips its next turn |
| `reveal` | Show weaknesses |
| `steal` | Steal one enemy buff |
| `take` | Steal the enemy's held item or coins |
| `coins` | Grab coins |
| `row` | Move an enemy to the front or back row |
| `shieldBreak` | Shatter a boss shield instantly |
| `vp` | Give VP |
| `refill` | Refill VP to 10 |
| `randbuff` | Random POW, GRIT or PEP buff |
| `crust` | Add Deedee's Warm Crust tokens |
| `burn` | Add Boppy's Heartburn pips |
| `rack` | Dress a target in TNB's next costume |
| `mount` | Put Rose on Tom's shoulders |
| Move fields | `crit` (bonus crit chance, 1 = always), `debuffBonus` (+% vs debuffed target), `hits`, `critAfterTom` (crit if Tom acted right before), `kindFoe` (a kind move that can be aimed at a monster to fill its Warmth bar) |

**Existing statuses** (you may reuse; new ones are allowed if named and defined):
Buffs: Bodyguarded, Guard (take 50% less), Pumped Up (next action +50%), Tucked In (regen 15% + GRIT/COOL +25%), Wardrobe Fresh (one auto-revive, debuff immune), Nobody Gets Past (take 40% less), POW Up, GRIT Up, PEP Up, Kiln Glow (WARMTH/COOL +25%), WARMTH Up, Personal Best (POW/WARMTH +30%), Glitter Nails (crit +25%, reflect 20%), Evasive (dodge 50%), Spotlight (draws attacks), Action Hero / Cozy Cardigan / Final Girl (TNB's costumes), Shoulder Ride.
Debuffs: Goofed, Smitten, Staggered, Seeing Stars (stun), Grumbled (POW/WARMTH -30%), Shushed (no Chatter), Amber-Stuck (PEP -50%), Slowed, Drowsy, Scared Stiff (PEP -40%), Dizzy (miss 25%), GRIT Down, COOL Down, POW Down, Hooked (cannot dodge), Silenced, Fogged In, Tardy, Glued, See Me (takes double), Heckled, Spotted, Chilled, Snubbed.

You may invent a **new effect** if an ability truly needs it. Mark it `NEW EFFECT`, define it in one sentence with numbers, and keep the total number of new effects across the whole design to about 12.

### D7. Character traits (keep; design abilities that play with them)
| Character | Trait | Rule |
|---|---|---|
| Tom | Diamond Medallion | DEFEND on an ally or any Tombo earns an Upgrade Mile (max 3). At 3 Miles his next skill is free and acts instantly. |
| Grace | Trending Meter | Each move different from her last one trends higher (x1.0, x1.2, x1.5) on heals and crits. Repeating resets it. |
| Rose | Shoulder Ride | Some moves end with her on Tom's shoulders for 3 turns. Tom takes her hits; her skills hit twice (100% + 40%). |
| Amy | Pace Setter | Each action she takes speeds the party (+5% PEP, max +25%). A knockout resets it. |
| Deedee | Warm Crust Tokens | Baking moves put Warm Crusts on the tray (max 3). Anyone can eat one as a free action to heal 20%. Even Nara. |
| Boppy | Heartburn | Peppers and hits while guarding add Heartburn (max 3). At 3, his next attack or GRUMBLE lets out a Counter-Roar that stuns. |
| TNB | Quick-Change Rack | WARDROBE and Quick Change dress the target in the next costume: Action Hero, Cozy Cardigan, Final Girl, repeat. |
| Nara | Frantic, Picky, Puddles | POW +50% and PEP +30% while Tom is down. Only eats jerky and homemade food. Happy puddle after wins. |

### D8. Stampcards (progression)
- Levels 1 to 50, 100 XP per level. Stamp Points (SP): currently 1 to start plus 1 every 3rd level (17 total at level 50), plus 1 per finished side quest.
- Each character has two paths. Nodes are stamped in order within a path. Each node has an SP cost and a level gate. Free respec outside battle. An "Auto-Stamp" button spends SP for kids.
- Currently: 4 nodes per path costing 1, 2, 3, 4 SP; a full path is 10 SP; target by the finale is one full path plus part of the other.
- **Your job:** with 6 nodes per path, propose the SP cost per node, the level gate per node (spread across levels 2 to about 40), and the SP earning rate, so that by level 50 a player has finished one path, is most of the way through the second, and a first Ultimate is reachable around level 22 to 28. Also give a recommended Auto-Stamp order per character.

### D9. Tombos and Family Finishes
- A Tombo is Tom plus one partner, picked on Tom's turn or the partner's turn. It costs 0 VP and spends HEART (25 / 50 / 75%). The partner acts alongside Tom without losing their own upcoming turn. Every Tombo earns Tom an Upgrade Mile.
- Each partner has 3 Tombos, unlocked by specific story beats (Part E). Seven partners x 3 = 21 Tombos.
- Act I (chapters 1 to 10): Tombos are strictly Tom plus one. Act II and III (chapters 11 to 20): four Family Finishes (3 or more people, 75% HEART) unlock. One Family Finish (Amy + Grace + Rose) works without Tom.
- Tombo effects may target the partner specifically.

### D10. Kindness (the second way to win)
Every regular monster has an HP bar and a pink **Warmth bar**. Kind moves (heals, snacks, DANCE, SILLY, PUPPY EYES and anything marked `kindFoe`) aimed at a monster fill its Warmth bar. When full, the monster is cheered up, waves goodbye and leaves (counts as a win, +50% coins, +20% HEART). Each area has a list of five moves its monsters especially like. **Give every character at least three abilities that are kind enough to aim at a monster**, and mark them `kindFoe`. The finale requires healing a villain with kindness (Part E), so kindness moves must feel as satisfying as attacks.

### D11. Bosses use these mechanics, so keep them covered
- Telegraphs: a lock-on icon (cue for Tom's DEFEND), a megaphone icon (party-wide attack coming; cue for GRUMBLE, DANCE, MOON & BACK), and numbered shields that need specific elements or a Tombo to break (Stagger: boss skips a turn and takes +50%).
- Each character's kit must still give the player answers to: shields, wind-ups (interrupt), party-wide attacks (mitigation or heal), Amber-Stuck (Cozy cures it), Shushed/Silenced (non-Chatter options), and back-row enemies.

---

## PART E. THE STORY (WHERE ABILITIES UNLOCK)

### E1. Twenty chapters
| Ch | Title | Party | Notes for ability design |
|---|---|---|---|
| 1 | The Soup Dumpling Protocol | Tom, Grace, Rose, Deedee | Arrival. Grace's gold dumpling squishy. Deedee's stolen pie tin. Boss: The Big One (bog turtle wearing the pie tin). Tombos unlock: Grace 1, Rose 1, Deedee 1. |
| 2 | Smog on 2nd Avenue | Tom, TNB, Nara | LA. Tom's sourdough starter. Nara's first meeting (jumps on Tom, tiny puddle). Boss: The Big Shake. Tombos unlock: TNB 1, Nara 1. |
| 3 | Paces & Peppers | Tom, Grace, Rose, Boppy | Fishing at Cattail Pier, Whispering Marsh. Boppy pockets a mysterious gold coin. Boss: Old Iron-Gill (catfish that swallows his pepper jar). Tombo unlocks: Boppy 1. |
| 4 | Backlot Bedlam | Tom, TNB, Nara | Soundstage 13, horror props come alive, TNB's wardrobe world. Boss: The Director's Cut. |
| 5 | Parent-Teacher Conference of Doom | Tom, Grace, Rose, Amy | Amy joins. Elsewhere Elementary after hours. Boss: The Red Pen. Tombo unlocks: Amy 1. |
| 6 | The Great Squirrel Conspiracy | Tom, TNB, Nara | Olivia's family visits; Nara leads the charge underground. Old Oak Park. Boss: Chairman Cheeks (a squirrel). |
| 7 | The Whispering Stacks | Tom, Grace, Rose (built version) | The Hush Library; books losing their endings. Boss: The Unread. |
| 8 | Feast on Jefferson Park | Tom, TNB, Nara | Neighborhood potluck; the villain drains color and heat. Boss: Old Ironbelly. |
| 9 | The Moon Club Invitation | Tom, Deedee, Boppy | Penny confesses; Boppy is revealed to be working with the villain. Boss: The Mirrorball. |
| 10 | Boarding Group Zero | Tom, Grace, Rose, Amy | Boppy seals the town; the plane is hijacked mid-flight. Boss: The Last Call. **End of Part 1.** |
| 11 | The Layover Between Worlds | All 7 (no Boppy) | Midgame twist: the two coasts are the last unfrozen places on Earth. TNB and Nara finally meet Amy, Grace, Rose. |
| 12 | Welcome to Jefferson Park, Girls | Any 4 of 6 | The girls see Tom's LA home and TNB's pottery studio. |
| 13 | The Subway Beneath the Sea of Clouds | Tom, TNB, Amy, Nara | Transcontinental tunnel. Amy and TNB bond. |
| 14 | The Rikers Wall of Rivituso Row | Tom, Amy, Grace, Rose | Boss: Warden Boppy (possessed). Cannot be attacked; must be won with DEFEND, PEP TALK, DANCE, SILLY and finally Deedee's MOON & BACK. Boppy redeemed. |
| 15 | The Eight-Seat Dinner Table | All 8 | Peak family warmth. Boppy and TNB pepper-eating contest. |
| 16 | The Amber Eclipse | Tom, Amy, TNB, Nara | Tragedy 1: Deedee and Boppy shield the girls and turn to stone, holding hands. |
| 17 | Ascent of the Glass Tower | 6 heroes in two teams | Righteous determination. |
| 18 | "No Touching, Please." | 6 | Tragedy 2: Tom uses one last DEFEND to take a ray meant for everyone and is erased from history. |
| 19 | The Unsent Dead-Letter Office | No Tom, then Tom returns | Nara tracks Tom by scent. Grace gives up her squishy, Rose her shoulder-ride ribbon, Amy her stopwatch, TNB his first ceramic cup, to bring Tom back. Jefferson Park neighbors cook a feast that thaws Deedee and Boppy (Boppy sneezes at the cayenne). |
| 20 | The Forever Engine & The Open Sky | All 8 | Final boss: Chronos-Leviathan, then Julian Vance himself. Phase 1: four Resentment Barriers (Distance, Aging, Exhaustion, Fear), each shattered only by a specific combo. Phase 2: ATTACK is turned to stone; the party must heal Julian's grief using each signature special on him. |

### E2. The villain
Julian Vance missed his daughter's ninth birthday, his mother's last days and his partner leaving, always assuming there would be "one more flight next month." He wants to freeze every family in its happiest afternoon so nobody ever grows up, grows old, or says goodbye. Enemies of the late game are corporate and time-themed: calendar-invite cages, "Terms of Preservation" shields, greyscale Amber zones. Abilities that answer him should be about everyday love, change and showing up.

### E3. Current Tombo unlock beats (keep these beats; redesign the moves)
| Partner | Tier 1 (25%) | Tier 2 (50%) | Tier 3 (75%) |
|---|---|---|---|
| Grace | Ch 1: Grace shows Tom her gold dumpling squishy | Ch 5: clearing the school before the Science & Dance Fair | Ch 19: Grace gives up her squishy to bring Tom back |
| Rose | Ch 1: Rose demands her first shoulder ride | Ch 10: Rose stows away under Tom's business-class blanket | Ch 19: Rose listens to Tom's headphones in the dark to guide him home |
| Amy | Ch 5: Tom helps Amy defend her classroom | Ch 10: Tom and Amy fight on the wing of the hijacked plane | Ch 17: scaling the 60-story Glass Tower side by side |
| Deedee | Ch 1: recovering Deedee's stolen pie tin | Ch 7: exploring the vault beneath the library together | Ch 19: thawing Deedee from stone with the Jefferson Park feast |
| Boppy | Ch 3: fishing for Old Iron-Gill together at Cattail Pier | Ch 14: redeeming Boppy | Ch 19: Boppy wakes from stone sneezing at the pepper broth |
| TNB | Ch 2: clearing the smog from 2nd Ave together | Ch 6: riding the Metro tunnels | Ch 19: TNB places his first hand-thrown cup on the altar to restore Tom |
| Nara | Ch 2: Nara greets Tom on the 2nd Ave porch | Ch 6: the underground tunnels | Ch 19: Nara tracks Tom's scent when the world forgets him |

Family Finishes: (1) Tom + TNB + Grace + Rose, unlocks Ch 11. (2) Amy + Grace + Rose, unlocks Ch 12, works without Tom, must shatter the Exhaustion Barrier. (3) Deedee + Boppy + Tom, unlocks Ch 15, must shatter the Aging Barrier. (4) All 8, unlocks Ch 20. In the finale, a Tom + TNB Tombo must shatter the Distance Barrier and a Tom + Nara Tombo must shatter the Fear Barrier. Design those four barrier-breakers so the animation visibly is about that idea (distance, aging, exhaustion, fear).

---

## PART F. WHAT EXISTS TODAY (FOR REFERENCE, NOT FOR COPYING)

Format: name (VP; element; target): effect. Level gate in brackets.

### F1. Tom
- Basic: Button Mash (Kinetic, one). Special: DEFEND (1 VP).
- Home Baker: Starter Splash [2] (2; Splash; row; slows) · Dutch Oven [8] (4; Cozy; one; heals lowest ally 30%) · Unboxing [14] (3; Sparkle; party; random +30% buff) · Delta One [22] (5; Cozy-Kinetic; all; refills Tom's VP)
- Polyglot Gamer: Flashcard Flurry [4] (2; Chatter; 3 random hits; reveals weaknesses) · Kanji Strike [10] (4; Sparkle; one; +50% vs debuffed) · passive Study Streak [18] · Final Boss [26] (6; Kinetic-Sparkle; all; 16-bit limit break)

### F2. Grace
- Basic: Cartwheel. Special: DANCE (3 VP; party heal 25%).
- Influencer Cleric: Squishy Squeeze [2] (heal one 45%, cure 1) · Glitter Nails [7] (party crit +25%, reflect) · Runway Walk [13] (row dizzy; draws attacks) · Like and Subscribe [20] (party heal 35%)
- Acro-Star: Dance Battle [4] (steals a buff) · Beam Dismount [10] (splash) · passive Stick the Landing [17] · Perfect 10 [24] (one; always crit)

### F3. Rose
- Basic: Boop. Special: SILLY (2 VP; Goofed).
- Giggle Gremlin: Peekaboo [2] (push turn back) · Twirl Tornado [6] (row; dizzy; interrupts) · Dress-Up Day [12] (self evade; slowest ally jumps ahead) · Monster Under the Bed [21] (all; 75% Goof)
- Piggyback Kid: Lamby Launch [4] (one; mounts Tom) · Piggyback Pounce [9] (splash; knocks target to back row) · passive Big Kid Now [16] · Lamby Stampede [23] (all)

### F4. Amy
- Basic: Sprint Tackle. Special: PEP TALK (3 VP).
- Head Teacher: Red Pen [5] (reveal; GRIT down) · Pop Quiz [9] (push turn back; interrupt) · passive Lesson Plan [14] · Personal Best [19] (party +3 VP; POW/WARMTH +30%)
- Marathon Mom: Burpee Blitz [5] (3 quick hits) · Hill Repeats [11] (splash; GRIT down) · Marathon [16] (party PEP +30%; cure Amber) · Finish Line [25] (all)

### F5. Deedee
- Basic: Spit Shine. Special: MOON & BACK (4 VP; heal 40% + Tucked In).
- Registered Baker: Registered Nut [2] (heal one 45%) · Rhubarb Crisp [8] (heal one 60%; 1 crust) · Wet Floor [14] (party cure; front row drowsy) · Sunday Dinner [21] (party heal 40%; 3 crusts)
- Busy Bee: Power Walk [4] (one; quick) · Wine O'Clock [10] (self WARMTH x2) · passive Garden Fresh [17] · To the Moon & Back [24] (all)

### F6. Boppy
- Basic: Cap Swat. Special: GRUMBLE (2 VP).
- Rikers Warden: Cast Line [3] (pull to front; Hooked) · Recliner Drop [8] (one; self heal 30%; Guard) · Big Catch [14] (push turn back; steal) · The One That Got Away [22] (all; party takes 40% less)
- Pepper Champion: Pepper Breath [5] (one; +1 Heartburn) · Hot Pepper [11] (splash; self POW +40%) · Track Star Story [16] (all drowsy; self PEP up) · Ghost Pepper [25] (all; consumes Heartburn)

### F7. TNB
- Basic: Mug Toss. Special: WARDROBE (4 VP).
- Set Costumer: Quick Change [3] (cure; costume) · Next Stop [8] (party moves up ribbon) · Jump Scare [13] (row; Scared Stiff) · That's a Wrap [24] (all; party heal 30%)
- Kiln & Longboard: Carve [5] (one; COOL down) · Kiln Blast [10] (splash; breaks shields) · passive Cone Six [15] · Bomb the Hill [20] (all; self evade)

### F8. Nara
- Basic: Jump Up (steals coins). Special: PUPPY EYES (2 VP; Smitten).
- Goodest Girl: Fetch [2] (crit if Tom acted before) · Zoomies [7] (4 random hits; self PEP up) · Tug of War [13] (POW down; steal) · SQUIRREL! [22] (all)
- Pack Heart: Happy Puddle [4] (front row drowsy) · Wet Dog Shake [9] (all; self cure) · passive Pack Instinct [13] · Lonely Howl [18] (all COOL down; Tom jumps to front)

### F9. Current Tombos (built tier 1 only). These are the mashups we are replacing.
| Tombo | What it is now | Why it fails the new brief |
|---|---|---|
| Grace: Dumpling Unboxed | Tom's Unboxing + Grace's Squishy Squeeze | Two existing moves glued together |
| Rose: Double-Decker Boop | Tom's DEFEND hoist + Rose's Pounce and Boop | Mostly reused moves |
| Deedee: Sourdough & Rhubarb | Tom's Dutch Oven + Deedee's Crisp and hug | Reused moves; same "big party heal" as Grace's |
| TNB: Glaze & Bake | Tom's Dutch Oven + TNB's Carve and Kiln | Reused moves; second Dutch Oven Tombo |
| Nara: Boule Fetch | Tom throws bread + Nara's Fetch | Closest to the right idea (a shared activity) |
| Boppy: Quiet on the Pier | Tom holds tackle box + Boppy's Cast and GRUMBLE | Reused moves |
| Amy: On Your Marks | Tom's stopwatch + Amy runs through | Generic "hit all" |

The good instinct to keep: **a Tombo is Tom joining that person's world** (Tom on the pier with his dad, Tom spotting Grace's gymnastics, Tom baking with his mom). The fix: make each one a new, specific shared activity with its own staging, own props, own payoff, and a distinct mechanical role.

---

## PART G. THE ANIMATION TOOLKIT

Animations are built from short **beats** played in sequence. Design every animation as a beat list the builder can implement.

### G1. Building blocks that already exist
| Block | Examples |
|---|---|
| Character poses | lunge, hop, twirl, cheer, coach (clapping), hug, sit and grumble, poke, tongue out, punch, hip pose, kneel, collapse, revive hop. New poses are possible (they are small pixel drawings), but each new pose is real work, so ask for them where they matter most. |
| Thrown props | Any small pixel object arcing across the screen, spinning or not: mugs, flashcards, a squishy, a tiara, Lamby, dishes of food, a heart, shirts, a bread boule, a ball. New props are cheap to draw. |
| Scene effects | dust, ring (expanding shockwave), burst, confetti, flash, dark (screen dims), glow, kiln, flames, moon, rainbow, puddle, waterjet, splash wave, drips, crumbs, sprinkles, pepper burst, tomato splat, pie to the face, sweat drops, steam from ears, bolt, shards, ghost, shadow, stopwatch, finish line tape, hill, blackboard, red marks, cast line and reel line, oven, vat, tongs, pipe, wheel, jet, trophy, gallery, musical note, count (big numbers), miles, tape wrap |
| Big text | Pixel words across the stage ("DANCE BREAK", "ONE MORE THING", "1970") |
| Screen | shake, color wash, freeze-frame, letterbox bars, slow motion |
| Messages | One-line battle message under the stage, plus the spoken line |
| Sound | Synthesized effects: boing, raspberry, slide whistle, whoosh, thud, ding, charge, level-up chime, bonk, slash and more. New ones are easy. |

### G2. Timing targets
| Kind | Length at 1x speed |
|---|---|
| Basic | 0.8 to 1.2 s |
| Path skill | 1.2 to 2.0 s |
| Tombo tier 1 / 2 / 3 | about 2.5 / 3.5 / 5 s |
| Ultimate | 4 to 7 s, built like a mini cutscene with a clear setup, escalation, punchline and impact. (The game has a 2x speed toggle, so length is fine if every beat earns it.) |
| Family Finish | 5 to 8 s |

### G3. Staging rules
- Portrait phone screen: the stage is small. One clear focal action per beat. Big readable silhouettes, big pixel words.
- The joke must read with the sound off (most kids play muted at some point).
- Every attack has a clear impact frame (that is where the A-button High-Five sparkle goes). Mark it.
- Kind moves end on a visibly happy beat (hearts, a smile, a wave).

---

## PART H. QUALITY BAR

### H1. What makes a great ability here
- **Specific beats generic.** "Tom throws a controller" is generic. "Tom pauses the game: everything freezes in greyscale, a PAUSE menu drops down, he selects ITEMS, eats a slice of sourdough, unpauses, and the enemy is mid-air where he left it" is specific, in character and has a function (a free heal plus a turn delay).
- **The joke comes from the person.** Boppy's moves are funny because he complains while being secretly the toughest one there. Rose's are funny because a 6-year-old's logic wins. Tom's are funny because he is calm about absurd things.
- **Mechanics match the fiction.** If Amy grades the enemy, the effect should feel like grading (reveal, mark, See Me). If Boppy tells the 1970 story, enemies get sleepy.
- **Variety inside each kit.** Each character's 12 path skills should cover: at least 2 single-target attacks, at least 2 multi-target attacks, at least 2 support or control moves, at least 3 kindFoe-capable moves (can overlap), at least 1 move that interacts with their trait, and at least 1 move that interacts with another specific family member when both are in the party (a small bonus, not a Tombo).
- **Tombos are relationships.** Each Tombo should say something true about Tom and that person. Tier 3 Tombos come from the story's most emotional moments (Part E3) and should feel earned, not just bigger.
- **Ultimates are cinema.** Each character's two Ultimates should be the most memorable thing they do, built on a single big idea, with a reveal or reversal partway through. Example of the spirit (do not reuse): Boppy finally finishes the 1970 cross-country story, the screen turns into a sepia race, young Boppy wins, present Boppy stands up out of the recliner, and the whole enemy side is "lapped."
- **No duplicates.** No two abilities in the whole game should share the same core animation idea. The current kit overused "hits all enemies" capstones and "big party heal" Tombos. Avoid that.

### H2. Balance guidance (numbers are starting values the builder will tune)
- Path skill VP: 2 to 6. Ultimates: 7 to 9 VP (the VP cap is 10, so an Ultimate should usually take planning or a Diamond Medallion).
- Multipliers: 1.2 to 2.2 for single targets, 1.0 to 1.8 for all-enemy moves, 3.0 to 4.0 for Ultimates. Tombos: tier 1 about 2.0 to 2.4, tier 2 about 2.6 to 3.0, tier 3 about 3.5 to 4.2, or equivalent value in healing and control.
- Support Ultimates are welcome (a heal or protection Ultimate can be as dramatic as an attack).

---

## PART I. EXACT OUTPUT FORMAT

Return one Markdown document with these sections, in this order. Use tables where shown. No em dashes anywhere.

### I1. Design summary (one page max)
- Your overall approach in 5 to 8 bullets.
- The new Stampcard numbers: nodes per path, SP cost per node, SP earning rate, level gate pattern, and a sanity check showing SP owned at levels 10, 20, 30, 40, 50.
- A list of every NEW EFFECT and new status you introduce, each with a one-sentence rule and its numbers.

### I2. Per character (repeat for all eight, in this order: Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara)

**Header:** character name, a one-line design thesis, and the two path names with subtitles.

**Kit table** (one row per ability: basic, signature, all path nodes):
| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

- Slot: Basic, Signature, A1 to A6, B1 to B6 (A6 and B6 are the Ultimates).
- Key: a short lowercase id (unique within the character).
- Status: NEW, REWORKED (from which old move), or KEEP.
- Effects: use the ops from D6, for example `st powdown 3 t` or `heal .3 lowest`.

**Ability cards** (one per ability except an unchanged signature):
```
### <Name>  (<Slot>, <key>)
Menu description: <one or two plain sentences, as shown in game; calls Tom "Tom">
Spoken line: "<the line, 12 words or fewer, references the move>"
Battle message: "<one line shown under the stage>"
Why it is them: <one sentence tying it to a canon fact>
The joke: <one sentence>
Animation beats:
  1. <beat> (<time>)
  2. ...
  IMPACT: <which beat is the High-Five sparkle>
New assets: poses: <...> / props: <...> / scene effects: <...> / sounds: <...> (or "none")
```

### I3. Tombos (21) and Family Finishes (4)
For each partner, a table, then a card per Tombo:
| Tier | Name | Key | Unlock beat | HEART | Element | Mult | Target | Effects | Distinct role |
|---|---|---|---|---|---|---|---|---|---|

"Distinct role" names the job this Tombo does that no other partner's Tombo of the same tier does.

Card fields: name, the shared activity in one sentence, what Tom does, what the partner does, spoken lines for both, animation beats with timing and IMPACT, new assets, and the line "Not a mashup because: <reason>".

Family Finishes: same card format, plus which Resentment Barrier it shatters if any, and how the animation shows that idea.

### I4. The four barrier breakers (finale)
A short table confirming which combo breaks Distance, Aging, Exhaustion and Fear, and the one image in each animation that makes the meaning obvious.

### I5. Old to new key map
Every existing key from Part F, mapped to its replacement key or "removed." The builder needs this to update saves, voice lines and the Kindness "likes" lists.

### I6. Self-check
Answer each with yes or no and one line of proof:
1. Every path has 6 nodes (or a justified 5 or 7) and every node is an active skill or a justified passive.
2. At least two thirds of each character's path skills are NEW or REWORKED.
3. All 21 Tombos, 4 Family Finishes and 16 Ultimates are new, and none reuses an existing animation as its core.
4. No two abilities in the game share the same core animation idea.
5. Every character has at least three kindFoe moves.
6. Every character's kit meets the variety list in H1.
7. Every ability has a unique spoken line that references it, with no em dashes.
8. Grace and Rose say "Ta-Ta" only in spoken lines; all descriptions say "Tom."
9. Nara never speaks words.
10. Boppy never complains about joints or knees.
11. Signature specials keep their names and core function.
12. The number of NEW EFFECTS is about 12 or fewer.

---

End of brief. Design with joy. This game is a love letter to a real family.
