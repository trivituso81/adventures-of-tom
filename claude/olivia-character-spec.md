# Olivia: character spec (written 2026-10-31 from Tom's photo and brief)

Status: spec and the three standard prompts are done. No art, moves, lines or party entry are installed yet. Tom runs the prompts (hero pose first) and drops the sheets back; then install per docs/CHARACTER_PIPELINE.md section 6, with the kit below going into data/abilities.js B8_KITS as `olivia`, moves in engine/olivia-moves.js, lines in data/lines.js and tools/bake-page/pending.json.

## Identity

| Field | Value |
|---|---|
| id, display name | `olivia`, Olivia |
| Role in the story | Tom's cousin. Neighbor on 2nd Ave with Michael, Lachlan (4), Isla (1) and Nara. Already an NPC in chapters 7 and 8 (hands over Nara). New: a recruitable party member, same yes/no and swap-out prompts as Amy, found at home on 2nd Ave. Chapter availability follows CHAPTERS in engine/story.js (add her beside Amy). |
| Background (canon, from Tom 2026-10-31) | Journalist. NYU undergrad, Columbia master's in journalism. Ten years in New York City, then back home to Los Angeles to start a family. Met Michael at ABC (he was in production, she was a journalist). Now part-time mom, part-time worker: teaches journalism at USC, does freelance AI trainings, reports AI stories on TikTok under her brand LivNews. Wrote a children's book. Native Southern Californian. Former jump rope champion as a teen, rusty now. Brother Bobby (she claims she is better than him at everything). Michael's mother Christine is a hoity-toity French woman who criticizes Olivia; Olivia is often annoyed by her. In-game canon already says Michael works at Meta: keep that and treat ABC as where they met. |
| Look (from the photo) | Long wavy honey-blonde hair with lighter ends, parted slightly off center, past the shoulders. Oval face, fair skin with light freckles, warm brown eyes, defined brows, big bright smile with top teeth showing, rosy cheeks. Slim, average height. Game outfit (my call, the photo shows a Halloween dress): soft white short-sleeved blouse tucked into dark olive high-waisted trousers, thin tan belt, tan ballet flats, small gold hoops, slim gold watch. Hands empty. |
| Height | 195 px standing in the battle sheet (Tom and Amy are about 200, Michael about 10 percent taller than the other adults, Justin 230). |
| Signature props | None in the standard sheets. Ability sheets: phone (LivNews Live, Is This Real?), jump rope (Double Under), picture book (Story Time), snack pouch (Snack Bag). |
| Personality and posture | Talks fast, warm, wry, always half distracted by a kid. Idle: alert and smiling, tucks hair behind her ear. Hip: the "I am waiting" mom look. Signature pose: MOM YELL, hands cupped, shouting for Michael. Competitive about Bobby. Rolls her eyes at anything Christine would say. |
| Voice | Dialogue voice already exists in data/dialog-cast.js (`olivia`). Battle lines go to pending.json with the direction "fast, bright, warm, a little frazzled". |
| Stats (B2_STATS proposal) | hp [100,880], pow [12,80], grit [11,74], warmth [14,90], cool [13,86], pep [16,96]. Fast and chatty, not a bruiser. |

## Kit (11 moves; slots mirror Justin's in B8_KITS)

Elements: kinetic, splash, cozy, sparkle, chatter. Stats: POW, GRIT, WARMTH, COOL, PEP.

| Slot | Key | Move | VP | What happens | Effect | Inspired by |
|---|---|---|---|---|---|---|
| Basic | fact_check | Fact Check | 0 | Flips open a reporter's notebook, clicks her pen and jabs it at the enemy like a microphone. "Source?" | One chatter hit | Journalism |
| Sig | snack_bag | SNACK BAG | 0 | Digs through an invisible mom bag, pulls out a snack pouch and tosses one to every friend. | Party heal 25 percent, cures Dizzy, +Heart | Being a mom |
| A1 | livnews_live | LivNews Live | 2 | Phone up selfie-style, red LIVE dot, she reports the enemy to her followers. A wave of notification pings rains on every enemy. | Light chatter hit on all enemies | LivNews brand |
| A2 | inverted_pyramid | Inverted Pyramid | 3 | Lectures: draws the journalism inverted pyramid in the air, then drops it point-down on the enemy. "Most important thing FIRST." | One kinetic hit, lowers GRIT | Teaching at USC |
| A3 | double_under | Double Under | 4 | Pulls out a jump rope, starts slow, trips once, then the teen champion comes back: a blur of double-unders and the rope whips the enemy. | Three kinetic hits on one enemy (the first does 0, "rusty") | Jump rope champ |
| A4 | story_time | Story Time | 4 | Sits cross-legged, opens her own children's book and reads the first page in a soft voice. The enemy nods off. | Cozy kind move: enemy loses its next turn, +warm, +Heart | Her children's book |
| A5 | michael | MICHAEL! | 5 | Cups her hands and yells for Michael. Nothing. Yells again. From off screen (right) a diaper bag flies in and flattens the enemy. Michael is never seen. | Big kinetic hit, lowers PEP | Shouting at Michael to attack for her |
| A6 (Ultimate) | better_than_bobby | Better Than Bobby | 8 | Counts on her fingers everything she beats her brother Bobby at: jump rope, grades, parallel parking, cooking, Mario Kart. Each one is a hit. Finishes with a mic drop. | Five rising chatter+sparkle hits spread over all enemies | Claiming she is better than Bobby |
| B1 | is_this_real | Is This Real? | 3 | Holds her phone up to the enemy, scans it, squints. "Too many fingers. Fake." The enemy does not know what it is any more. | One chatter hit, inflicts Dizzy | AI journalism |
| B2 | marine_layer | Marine Layer | 4 | Pulls a hoodie over her blouse, shivers, and a gray coastal fog rolls over the enemies. "It is sixty-two degrees. This is a crisis." | Splash hit on all enemies, lowers COOL and PEP | Native Southern Californian |
| B3 | lachlan_no | LACHLAN, NO! | 5 | Spots Lachlan (off screen, left, past the enemy) climbing something. Full mom sprint straight through the enemy. Scoops him and jogs back. | Big kinetic hit, cancels the enemy's wind-up | Freaking out over a kid doing something dangerous |

Michael rule (canon): nobody ever says Michael is always holding the kids. MICHAEL! shows only the thrown bag; Olivia's jokes about him are fine.

## Spoken lines (draft, about 2 per move; exact once baked)

| Key | Lines |
|---|---|
| fact_check | "Quick question." / "SOURCE?" |
| snack_bag | "Hang on, I've got snacks." / "Everybody gets one. ONE." |
| livnews_live | "LivNews, we're live." / "Chat, look at this thing." |
| inverted_pyramid | "Most important thing FIRST." / "That's the lede. Bury that." |
| double_under | "I was a champion, you know." / trip "Okay, that was a while ago." / "There it is!" |
| story_time | "Once upon a time, in a very quiet house..." / "And everybody went to sleep." |
| michael | "MICHAEL!" / "MICHAEL, HANDLE THIS!" / "Thank you, honey." |
| better_than_bobby | "Jump rope. Grades. Parallel parking." / "Cooking. Mario Kart." / "Sorry, Bobby." |
| is_this_real | "Hold still, I'm checking." / "Too many fingers. Fake." |
| marine_layer | "It's sixty-two degrees." / "This is a crisis." |
| lachlan_no | "LACHLAN, NO!" / "Got him. Got him. We're fine." |

Other lines: join "Michael's got the kids. Let's go, I have forty minutes.", greet "Tom! Hi! Sorry, I'm mid-sentence in my head.", hurt "Christine would have a note about this.", low "Don't tell Christine.", ko "Tell my followers I was right.", win "Put THAT on TikTok." Grace or Rose greeting her: "Hi, Olivia!" Everyone calls her Olivia; the kids do not call her Aunt.

## Overworld dialogue hooks (for the next writer)
- Christine: visiting from France, has opinions about the lasagna, the stroller and Olivia's hair. Olivia smiles through it, then vents to Tom. Christine never appears on screen in Part 1.
- Bobby: never seen; Olivia drops that she beat him at something in most conversations.
- USC: she grades on the porch; LivNews: she films a 20-second AI story while Isla eats a leaf.

## Calls I made
- Outfit (photo is a costume dress): white blouse, olive trousers, tan flats. Change the hero prompt's HER LOOK block if Tom wants a different everyday outfit; that is the only place it is written.
- Height 195 px. Signature battle pose MOM YELL. Eleven moves, B3 used (Justin's B3 to B6 are placeholders, so the slot exists).
- Children's book title is not in canon: Story Time says "her own children's book" until Tom gives the title.
