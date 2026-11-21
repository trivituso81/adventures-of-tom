# Purged voice (2026-11-01)

Tom asked (again) for voice lines and clips that the full game never plays to be removed, because every unused line shows up in the Voice Library and the bake lists and costs ElevenLabs credits. This is the record. The audio itself is not lost: it is in git history at commit `6624b03` (the parent of the purge commit), so `git show 6624b03:data/voice/<id>.js` brings any of it back.

## 2026-11-21 (`voicepurge221`): 221 dialogue clips nothing plays

Card c-voicepurge221. `unused_voice.py` check 4 listed 221 baked dialogue clips that no scene, harvest line or source plays (old chapter 1, 3 and 6 lines found by ch2lessons). Each text was grepped against data/ and engine/ outside data/voice: none is played (the squirrel line in `data/scenes.js` is the unquoted text `...wait. You're very tall. Are you a squirrel?` by the Tiny voice, so the quoted narrator clip never matched it). Spec `tools/clip-audit/purge-voicepurge221.json`. By voice: tom 57, tnb 39, narrator 27, bernadette 22, bigone 18, grace 12, washington 12, odette 5, olivia 5, rose 4, carmen 4, log 4, toad 4, skeeter 4, deedee 3, boppy 1. About 6.5 MB of audio removed from data/voice/dialog-ch*.js; the Voice Library list was rebuilt (221 removed, 0 added). All four checks now report 0.

Note: `tom|Mom. That's a boss. You don't just walk up to a boss.` was purged too. Tom kept the line in the draft script (card c-gem-polish06) but it is not in `data/scenes.js`; if it comes back into a scene it needs a new recording (git history keeps the old one).

<details><summary>The 221 clips</summary>

- `tom|Mom. That's a boss. You don't just walk up to a boss.`
- `tnb|Okay. Hi. Missed you. Don't panic. Look at the island.`
- `tom|...Where's Bready Mercury.`
- `tnb|That's the thing. I came over to feed him, like you asked. The jar was gone. The window was open.`
- `tnb|I know, babe. I've seen every horror movie ever made. This is exactly how they start.`
- `tom|...That's not a pun. That's just a word.`
- `tnb|It's a word with a pun in its heart.`
- `narrator|"...wait. You're very tall. Are you a squirrel?"`
- `narrator|A note, pinned at the bottom: BY ORDER OF THE CHAIRMAN. WINTER IS COMING. HOARD EVERYTHING.`
- `narrator|Chairman Cheeks hops off the hoard, straightens its tie, and scampers down the far side of the Oak.`
- `narrator|Photos of 2nd Ave. A map with X’s on every porch. A drawing of Nara, labeled THREAT LEVEL: VERY HIGH.`
- `narrator|CREEEEAK. The bucket sinks. Across the trunk, a rope ladder unrolls down the middle, all the way to the floor.`
- `narrator|Running footsteps. Very small ones. Going up.`
- `narrator|In the middle, circled three times: Tom’s jar. Across the top: OPERATION BIG BREAD.`
- `narrator|Another note: SUPPLY LINE. ROPE LADDER. SEE BUCKET (PANTRY).`
- `narrator|A pause. Then, from inside, a tiny voice: "Password accepted. Welcome, Agent..."`
- `narrator|Nara catches it in midair. She runs one lap. Two laps. Six laps. She lies down on Tom’s feet and eats it very, very slowly.`
- `narrator|Nara digs. Dirt goes everywhere. Mostly on TNB.`
- `narrator|Nara does three laps around Tom, slams into his shins, and leans on him with all forty pounds.`
- `narrator|Nara growls. A very small growl. Very serious. She's waited three days for this.`
- `narrator|Nara is out of the bucket before it stops moving. She leans on Tom with all forty pounds.`
- `narrator|Nara knows the word WALK. She's always known the word walk. She's already at the end of the street.`
- `narrator|Nara leans on Tom with all forty pounds.`
- `narrator|Nara looks at the bucket. Nara looks at Tom. Nara gets in the bucket.`
- `narrator|Nara looks at the drawing of herself. She seems pleased with it.`
- `narrator|Nara puts her nose to the grass and pulls. Hard. Left. Right. Back. Three fresh holes, three different directions.`
- `narrator|Nara sniffs the air, and her tail goes straight up. Bread. Far above. Very faint.`
- `narrator|Nara takes it very gently. She'll never let go of it again. She's going to sleep for twelve hours, holding it.`
- `narrator|She'd do anything for Tom. She makes very sure he knows it.`
- `narrator|Then she spins around and growls at the jacaranda.`
- `bigone|A man in a long coat told me where you keep it. He gave me a gold coin and said a hoard that never runs out means winter never has to come.`
- `tnb|And then we show up and make friends with it, and the coin falls right off. Babe. We are ruining this man's whole year. Spooky. I love it. I hate it.`
- `narrator|"I said yes for you. You're welcome. Bring the starter."`
- `narrator|A text from Grace. "TATA. The library is WHISPERING. Like actually. Page says it's fine. It's NOT fine. Come home."`
- `narrator|A text from TNB. "Babe. Bernadette signed you up for the 2nd Ave potluck. You're on bread. For forty people."`
- `narrator|Tom always keeps a heel of sourdough in his jacket. For emergencies. This is an emergency.`
- `boppy|My fish was no watermelon. Put down rowboat.`
- `grace|Don't wrinkle row SIX!`
- `rose|Help! I'm stuck in Los ANGELES!`
- `rose|I ATE the cookie dough! And I jumped on Boppy's chair! And I moved Grace's bookmark!`
- `tom|LA la la la LA! I can't hear you! I promised my mother!`
- `tom|Bready Mercury is nine years old. He has flown Delta One. Twice.`
- `tom|Somebody took my starter. And left a calling card.`
- `tom|TNB has seen a lot of movies.`
- `tom|It lied to me first. It said it was an acorn.`
- `tnb|Was that a pun? Babe. Did you just make a PUN?`
- `tom|Fine. It was nuts.`
- `tom|...Bready Mercury is going to need a bigger jar.`
- `grace|Number eight is in Los Angeles. Call me BEFORE you touch it. I sharpened the pencil.`
- `bernadette|3468. You're back. Don't touch that. It's on my street.`
- `tnb|Welcome home. Don't open the salad spinner. That's loaf thirty-one.`
- `grace|Tata. Did you touch it?`
- `bigone|Shut that door. You're letting the cold in.`
- `bernadette|8:42 this morning. White sedan, parked across the Washington driveway for four minutes. Rental. Airport lot sticker on the windshield. I have the plate.`
- `deedee|The drawer is ready for number eight. Also, a fancy letter came for you from the Moon Club. That place has been locked since 1971. I did not open it.`
- `washington|Tom! Get out here and look at my roses!`
- `odette|Tom! My gumbo's been on since six, and right now it's the temperature of a handshake.`
- `olivia|That's my dog under the table, and I've never seen that loaf before in my life.`
- `carmen|My griddle is cold. Do you know what a pupusa is off a cold griddle? It's an apology.`
- `log|Stop right there. Somebody's had a fire going in this building, and I'm putting an end to it.`
- `toad|What's in the salad spinner? Is that sourdough? No. Too sour.`
- `tnb|Bready Mercury was climbing out of the crock at five this morning. I wasn't going to argue with him.`
- `grace|How big?`
- `bigone|Fifty years I fed the night crews out of this room. Then one morning in 1963 they shut off my gas and chained the door, and not one of them said a word to me about it.`
- `bernadette|One man. Long coat, in this heat. He pointed something at the roses, there was a flash, and when I could see again, there was that.`
- `deedee|I held it up to the lamp. There's a piano on it.`
- `rose|Why didn't he jump?`
- `washington|And the red's gone out of everything around it. The roses, the lawn, my good hose. All grey.`
- `odette|You're following them with a salad spinner.`
- `olivia|She can get in line. She owes me a couch.`
- `carmen|And this one is drinking purple soda before noon.`
- `log|First it's one little flame. Then it's music. Then people have friends over. I've seen where it goes.`
- `toad|That makes it worse. Do you have it in white? With the crusts cut off?`
- `tnb|So we bring twenty-four and tell Bernadette it's a tasting menu.`
- `grace|That's bigger than the golf cart. And it's in Los Angeles. I said Los Angeles.`
- `bigone|I've seen your stoves. A flame the size of a pea, burning all day and all night so somebody can boil one egg. I'm putting them to work.`
- `bernadette|Then something small and on fire picked a gold thing up off the sidewalk and ran toward the boulevard. I wrote it down as a raccoon. I know it wasn't a raccoon.`
- `deedee|Your father says he once baked sixty loaves in one morning. He has never baked.`
- `rose|I'm going to be number one.`
- `washington|You're the one who's always on a plane, Tom. Did you bring this home with you?`
- `skeeter|No, he didn't. There's no draft in here.`
- `odette|Go on, then. And Tom, if my gumbo isn't hot by six, I'm telling Bernadette it was your idea.`
- `olivia|He's got it.`
- `carmen|No. Is it cold?`
- `log|Then I got here just in time.`
- `toad|I tried. It was too hot. Before that it was too cold. I'd like to speak to whoever packed me.`
- `tom|I promise. I packed a ruler.`
- `tnb|She came by at seven to check on us. She called me the Other Tom and said my bowls were too close together.`
- `grace|Thank you. Who's the lady behind you with the clipboard?`
- `bigone|And they're no good. Every flame on the street, and I still can't get warm. A fire's no use with nothing to bake.`
- `bernadette|Write that down and sign it. Nobody on this street ever does.`
- `washington|Seven. And it never once came up at a block meeting.`
- `skeeter|It's an old building. They all do this. Have you tried a sweater?`
- `odette|Bernadette, your diagram had my gumbo behind the paper plates.`
- `olivia|Tom. A rosebush got sealed in orange glass, every stove on the block went out, and it was all fixed by six. I'd love a quote.`
- `carmen|Everyone got it. Then we moved the table.`
- `log|Fine. Have your fun. Keep it down after ten.`
- `toad|I'm still not eating the crust.`
- `tom|You started without me. I made a schedule on the plane. It has tabs.`
- `tnb|I said, 'Great note, Bernadette.' Then she stood there waiting for me to move them, and I opened a soda.`
- `grace|I'm Grace. I'm nine. I keep the chart.`
- `bigone|I don't take bread from a man holding a salad spinner.`
- `bernadette|He was here fifteen minutes before your cab, 3468. You'd have seen him yourself if you were ever home.`
- `skeeter|I'm not holding anything. That flame was like that when I got here.`
- `odette|Thirty-eight thousand dollars, and the porch was already crooked.`
- `olivia|That's a quote. I'm using it.`
- `tom|Forty loaves, two at a time, forty-five minutes each. That's fifteen hours of oven, and we have nine.`
- `tnb|It was a long soda.`
- `grace|A person! I said it was a person. What kind of car? What time? Did anybody get the license plate?`
- `bigone|Too wet. Who taught you to shape a loaf?`
- `bernadette|Chained since 1963. I have the key. Nobody has ever asked me for it.`
- `washington|The only thing at the end of the boulevard is the old Car Barn. My father drove the night streetcar out of it.`
- `skeeter|I'll be back in the winter. I always am.`
- `tom|She'll count them. She counted the folding chairs at Mr. Washington's birthday.`
- `tnb|I've seen this movie, you know. The lady who runs the potluck always has something in her basement.`
- `grace|Tata, I like her.`
- `bigone|Better. Cut the top deeper next time. It needs somewhere to go.`
- `bernadette|Then she can run the block meeting, because she'd be the first person on this street to keep a promise.`
- `washington|If this turns out to be a parking meter, I'm going to be upset.`
- `tom|What did you tell her?`
- `tnb|Two padlocks. On a shed.`
- `grace|The gold coin is with the biggest thing that woke up. Find it, put it in the hole, and call me when the color comes back.`
- `bigone|Hm. That one's a loaf.`
- `bernadette|Who's asking?`
- `washington|'Trim to regulation height.' Bernadette, you taped a notice to my roses.`
- `tom|How long did she wait?`
- `tnb|I'm going to stand over here, on the part of the sidewalk that still has a color.`
- `grace|That's new. I need a new color for fire.`
- `bigone|That's the first bread out of me since 1963. Don't stand there looking at it. Cut it.`
- `bernadette|White sedan. 8:42. Yes.`
- `washington|It was inside a block all day.`
- `tom|She doesn't have a basement. She has that shed with the two padlocks.`
- `tnb|That's what I don't like about it. The dough rises. The dog jumps. That thing is just waiting.`
- `grace|The man rented a car AT THE AIRPORT. That means he flies back and forth. Like you. The next one is here. Come home.`
- `bigone|I know what it is. It's my pension. Sixty years late, and a little flame carried it in this morning.`
- `bernadette|Give the niece my number, 3468. And don't get ideas. I'm not being friendly. She keeps records, and I respect records.`
- `washington|Hold on. This is the Car Barn loaf. My father brought one home every morning until they shut that place. Who baked this?`
- `tom|That's your whole rosebush. It's inside an orange block the size of a minivan.`
- `tnb|Is that the chart? It has a key. It's color coded. That's the wall the detective has right before they take his badge away.`
- `bigone|So it's not even mine.`
- `bernadette|Nineteen years I've carried this key. You're welcome in advance, since I won't hear it afterwards.`
- `washington|Well, he took his time about it. You know, in 1979, when I bought that house...`
- `tom|No, sir. But I've seen seven of them, and I know how to open one.`
- `tnb|There are two of them now.`
- `bigone|Sixty years, and the first gold through that door belongs to a shrub.`
- `bernadette|Don't be smart, Other Tom.`
- `washington|I'm glad somebody on this street listens.`
- `tom|They don't do anything. They just sit there.`
- `tnb|I watch a lot of scary movies. That was good, though. Top ten.`
- `bigone|What time is this potluck?`
- `bernadette|Forty loaves. Six o'clock. I don't care what's in there.`
- `tom|Mr. Washington, there's a notice taped to your roses in there.`
- `tnb|Through the dog door. Nara's never once used the dog door.`
- `bigone|How many loaves?`
- `bernadette|At 5:30 this morning. Before the incident. It still applies.`
- `tom|You saw a person do this?`
- `tnb|Then I guess we're following a flame down the street. Bring the dough. I'm not leaving loaf thirty-one alone with the dog.`
- `bigone|I used to do two hundred before midnight. Load me. If this is my last shift, I'm not ending it on three.`
- `bernadette|The date's on it.`
- `tom|Bernadette, that's the most useful thing anyone has told me in eight of these.`
- `tnb|It's grape. Do you want one?`
- `bigone|Somebody's going to stand up tonight and say they arranged this bread. Somebody always did.`
- `bernadette|That bulb is evidence, 3468.`
- `tom|Before I touch anything, I have to make a phone call. I promised a nine-year-old.`
- `tnb|It's the only thing on this street that's the right temperature.`
- `bigone|Take your shrub money. And shut my door on the way out. I'd like to cool down slowly.`
- `bernadette|Then I want it logged first.`
- `tom|I did not touch it. Look. Round hole, burnt bulb, grey patch.`
- `bernadette|Thirty-eight. Thirty-nine. That's thirty-nine, 3468. I said forty.`
- `tom|A minivan.`
- `tnb|Chained from the outside since 1963. You lock a building to keep people out. You chain it to keep something in.`
- `bernadette|The dog owes this street a loaf.`
- `tom|Grace, somebody saw a man do this one. He came in a rental car.`
- `tnb|Oh, we're going in. I just want it on the record that I knew.`
- `bernadette|Hot dishes on the left. Everyone got the diagram.`
- `tom|I know. They're going to start a newsletter.`
- `tnb|Tom. That's a turntable. They used to spin a whole streetcar on that.`
- `bernadette|If I could have your attention. The Watch would like to thank the Watch for arranging the bread.`
- `tom|It ran toward the boulevard, and it was on fire.`
- `tnb|I need about an hour. But go ahead.`
- `tom|Our pilot light just walked out of the house.`
- `tnb|It's a wet blanket. I'm not making a joke. Look at it.`
- `tom|We have forty loaves of raw dough and no fire.`
- `tnb|Hi. We can hear you.`
- `tom|Every flame on the block walked out. We're following them.`
- `tnb|You've got a flame in there. You could warm something up.`
- `tom|It's loaf thirty-one.`
- `tnb|Three flames, one motor. On set I once fixed a zipper with a paper clip while the actor was still walking. This thing's holding still.`
- `tom|So we're not going in?`
- `tnb|It says Boiler Room. I'm just reading it out loud so we both know.`
- `tom|Do you need a minute?`
- `tnb|No, you go. You're the one who's polite to things.`
- `tom|That blanket is talking, and it's soaking wet.`
- `tnb|He's got a point about the egg.`
- `tom|We're having forty people over at six.`
- `tom|Did you feel that?`
- `tnb|We know exactly who.`
- `tom|You're holding one of our flames.`
- `tnb|Okay. Now I'll stand on the lawn.`
- `tom|You sound exactly like my first landlord.`
- `tnb|He called it.`
- `tom|The starter is nine years old and it has a name.`
- `tnb|I figured. Take a loaf for your mom.`
- `tom|Nara, this is what you sound like.`
- `tnb|We're fine. She thinks I moved the bowls.`
- `tom|After you.`
- `tom|That oven is the size of our kitchen, and every flame on the block is inside it.`
- `tom|Those flames belong to the stoves on 2nd Avenue.`
- `tom|We have dough.`
- `tom|There's a gold coin on your door. I need it, and I have to tell you what it does before I take it.`
- `tom|It isn't your pension. It opens an orange block on our street. When it does, every flame goes home and you go back to being an oven. A cold one. You won't be able to talk.`
- `tom|No. It has a rosebush on it.`
- `tom|Six o'clock.`
- `tom|Thank you for the bread.`
- `tom|It goes in the round hole. It's your rosebush, so it should be you.`
- `tom|It's going in my mother's junk drawer with the other seven.`
- `tom|Somebody always did.`
- `tom|An old-timer from the barn. He retired today.`
- `tom|I have to fly back tomorrow.`
- `tom|That leaves you alone on this street with Bernadette.`
- `washington|That'll be from her.`

</details>

## 2026-11-20 (`ch2build`): 42 dialogue clips nothing plays

Chapter 2 was rebuilt to the locked script, and the audit (`unused_voice.py` check 4) listed 42 baked dialogue clips that no scene, harvest line or source plays: old chapter 2 lines (the sky over Griffith Park, the starter jar, pottery wheel, "One down", Mr. Washington would never say that, six Nara narrator lines), plus chapter 7 leftovers it found at the same time (Page, Books overhear things, the checkout card). Removed from data/voice/dialog-ch*.js (spec `tools/clip-audit/purge-ch2build.json`). Git history keeps the audio.

## 2026-11-20 (`fix-heist1play`): 2 lines that never had a clip

The muffin theft lost its floor talk. Cut from `data/scenes.js` and every index (spec `tools/clip-audit/purge-fixheist1play.json`; no clip had been baked): `grace|Tata, get UP, it's getting away!` and `tom|I'm up. I've been here four minutes.`

## 2026-11-20 (`heist1`): 2 chapter 1 dialogue clips

The muffin theft scene was rebuilt (claude/heist-redo-plan.md). Removed from data/voice/dialog-ch1.js (spec `tools/clip-audit/purge-heist1.json`): `tom|GAH! I'm on the floor. Grace, is that your elbow or mine?` (the line is cut: nobody talks on the floor) and `grace|It's mine! Tata, get UP, it's getting away!` (the line is now "Tata, get UP, it's getting away!" and the take says the old words). Both wait for a new take in the Voice Library.

## 2026-11-18 (`roselets1`): 1 battle-table clip

- `rose.intro4` "Come on, TA-ta! Let's go!": Tom cut Rose's line from the opening (the scene goes straight into Grace's list). Removed from data/lines.js and data/voice-clips.js.

## 2026-11-17 (`ch1rebuild1`): 1 dialogue clip

Chapter 1 was rebuilt to the locked script. Of the old chapter 1 lines only one had a recorded clip: `tom|I'm trying, Rose. Please don't tell Grace I lost to a marble.` (data/voice/dialog-ch28.js, about 29 KB). The other 94 old lines never had a clip. Townsfolk and shop lines were not touched.

## 2026-11-14 `ch4build1`: 4 chapter 4 clips whose lines left the story
- `narrator|The rig hums. The work lights bang on, one row at a time. Up the middle, the catwalk groans down into place.` and `narrator|The megaphone hops off the rack and rolls away under the set, muttering about lighting.` (narration boxes, now actions); `bigone|A man in a long coat paid me to do it. One gold coin. He said a day with no takes is a day that never has to end.` (the Director's Cut, long-coat man removed); `narrator|A text from Amy. "Parent-teacher conference night is Thursday. ..."` (Tom now reads the text aloud). Removed with `purge_unused.js` from data/voice/dialog-ch28.js, about 205 KB.

## 2026-11-12 `amberclear1`: 8 chapter 12 amber clips with superseded wording

Tom asked for much more explanation of amber in chapter 12. Eight lines were reworded again after Phase 1 and their baked clips (dialog-ch28.js) were removed: tnb "Amber is just warmth that got stuck...", amy "Warmth. We're good at warmth...", tom "You were amber for a little while.", amy "Heat is just movement...", tnb "He's trapped in amber...", tom "He's draining the color... He's frozen solid.", tom "Okay. The whole family is frozen in amber. Marlowe's grey...", tom "She's frozen in amber, right in the middle of a sentence." Git history keeps the audio.

## 2026-11-11 `deedeetom1`: 30 Deedee clips with the old wording "Tommy"

Tom asked for Deedee to call him Tom. The game text was changed and the 30 baked clips that said "Tommy" were removed (deedee.js hug and moon_back "Group hug! Tommy, you too!"; 28 dialogue clips in dialog-ch1, ch2, ch9, ch25, ch26, ch28). They need a re-bake with the new text. Audio is in git history (commit before deedeetom1).

## 2026-11-02 `ch2clips`: ten dialogue clips with superseded wording

Tom re-recorded chapter 2 and reworded ten lines in the script box; the game text was changed to his words and the old-wording clips were removed (dialog-ch2.js: Michael "Nobody is coming for mine...", Tom "Fifty grams... Proud of you.", "Sit, paw, treat... Very strong paw.", "TNB said he'd be home... He's never home."; dialog-ch25.js: Tom "The starter is the bonus.", "Mad? I'm proud. And a little mad."; TNB "Don't be mad.", "this whole block", "Sounds premium. Like your seat.", "I hate it."). Audio: parent of the `ch2clips` commit.

## Lines removed from `data/lines.js` (never called by any move, scene or dialogue)

| Character | Kind | Words |
|---|---|---|
| justin | loose_wire_zap | Ow. Okay. A little bit my problem. |
| justin | wire_nuts_1 | Yellow! |
| justin | wire_nuts_2 | Red! |
| justin | wire_nuts_3 | And BLUE! |
| justin | bad_call_yell | WHO IS PAYING YOU?! |
| justin | bad_call_sit | Unbelievable. |
| justin | fresh_fit_shades | Collar. Cuff. Shades. |
| justin | fresh_fit_wink | You're welcome. |
| justin | demo_day_look | Nobody liked this wall. |
| justin | demo_day_one | ONE! |
| justin | demo_day_two | TWO! |
| justin | breaker_flip_which | Which one of you is it. |
| justin | breaker_flip_found | There you are. |
| justin | breaker_flip_count | Three. Two. One. |
| justin | breaker_flip_salute | Licensed and insured. |
| justin | giant_sneeze_twitch | Hang on. Hang on. |
| justin | giant_sneeze_excuse | Excuse me. |
| justin | foot_tap_wave | Rosie. No. |
| justin | foot_tap_ouch | OUCH!!!!!! |
| justin | foot_tap_light | IT WAS SO LIGHT! |
| justin | foot_tap_fine | I'm fine. I'm FINE. |
| justin | drywall_screws | Four screws. |
| justin | drywall_tap | Solid. |
| justin | drywall_dry | Let it dry. |
| tom | attack | Excuse me! |
| tom | attack | Take THAT! |
| tom | attack | Right, then! |
| grace | attack | Hi-yah! |
| grace | attack | Take that, Kevin! |
| grace | attack | Watch me, Ta-Ta! |
| rose | attack | Boop! |

Justin: these were the extra spoken beats written in the approved kit (see `docs/JUSTIN_ABILITIES.md`), but the move animations in `engine/justin-moves.js` only say the other lines. Tom, Grace and Rose: the generic `attack` shout pools were only a fallback for a move with no line of its own; every live move has its own line, so nothing played them (Grace's Move Lab volume sample now uses her `dance` line).

## Old clips removed (the line was reworded, so the old audio could never match)

| Character | Kind | Old words |
|---|---|---|
| amy | hurt | Ow. Okay. I'm okay. Deep breath. |
| amy | tombo2 | Ketchup, pickles, cereal, one sock. It's a Ymamot Creation! |
| amy | hills | Hill repeats! Up the slime, down the slime! |
| amy | marathon | Twenty-six point two! Straight through the slime! |
| amy | marathon_ult | Right on Hereford, left on Boylston! Sprint to the tape! |
| grace | ymamot | Ketchup, pickles, cereal, one sock. It's a Ymamot Creation! |
| rose | ymamot | Yama-Mott. It's Tom backwards. We were six. |
| tnb | round_with_jojo | Jojo, you're up. ...Jojo. JOJO. ...Nice. |
| tom | button_mash | Ugh, it's not charged! |
| justin | (no kind) | OUCH!!!!!! |


## 2026-11-01 (`fish1`): four dialogue clips removed because their lines were reworded

Tom: Boppy catches fish all the time; the joke is that he exaggerates how big they were. The four lines that said he never catches anything were rewritten, so their clips no longer matched any live line (the audit's source check matches on the first 40 characters, which the new lines share, so these were removed by hand). Audio is in git history (parent commit of `fish1`).

| Voice | File | Old words |
|---|---|---|
| rose | data/voice/dialog-ch25.js | He said if you were late he'd catch the fish without you. He's never caught a fish. |
| tom | data/voice/dialog-ch3.js | Then we had better go help him not catch one. |
| gus (Reel) | data/voice/dialog-ch3.js | Your father has been fishing this pier since before the pier. He has caught nothing. Very consistent. |
| boppy | data/voice/dialog-ch1.js | Here, take my spare cap. For luck. I caught nothing in it, so the luck is all still inside. |

## Second pass (same day): lines for moves that were replaced

Tom found `chalk_up` (Grace) still in the Voice Library. These moves were replaced by new ones (for example chalk_up became bedazzle_blast) but their lines stayed, because the old animation code still mentions the name, so the first audit counted them as used. 23 lines and their 23 clips removed. The old animation functions in `engine/*-moves.js` are dead code and were left in place.

| Character | Kind | Words |
|---|---|---|
| tom | controller_tap | One button. Entirely sufficient. |
| tom | crumb_shot | Still warm. The steam is the BEST part. |
| tom | mint_unboxing | It just arrived. It was NOT cheap! |
| tom | window_seat | Window seat. Shade down. Do NOT disturb. |
| tom | proofing_drawer | A proofing drawer. For emotional support. |
| tom | toast_negotiations | Both halves are EXACTLY fair. |
| tom | warranty_void | That warranty was holding us BACK. |
| tom | crumb_barrier | The crumbs are STRUCTURAL. |
| tom | five_minute_review | Five-minute review. This WILL be useful. |
| tom | dpad_detour | The D-pad says take the SCENIC route. |
| tom | save_sandwich | Save first. Sandwich second. BOTH essential. |
| tom | radical_solutions | A radical solution. Very LITERALLY. |
| tom | patch_notes | Patch notes: touching has been REMOVED. |
| grace | split_leap | Split leap! All the way over! |
| grace | chalk_up | Chalk up! Clap clap! Now my tumbling pass! |
| boppy | cap_check | Cap check. Not past me. |
| boppy | closing_time | Closing time. That nonsense is closed. |
| boppy | sensible_pepper | One pepper. Sensible size. Stomach may disagree. |
| boppy | jar_lid_negotiations | Jar-lid negotiations. I was being polite before. |
| tnb | clay_offcut | Clay offcut. Waste not, bonk not. |
| tnb | lost_found_warmth | Lost warmth. Found scarf. Nice connection. |
| tnb | practical_effects | Practical effects. The string is part of the charm. |
| tnb | clay_pigeon | Clay pigeon. Literally. I worked on that pun. |


## Third pass (`dead1`, 2026-11-01 night)

Lines whose only player was an old animation deleted in this pass:

| Character | Kind | Line |
|---|---|---|
| tom | starter_inspection | Bready Mercury has NOTES. |
| grace | beam_dismount | Beam dismount! Ten out of ten! |

## Fourth pass (`deedee1`, 2026-11-02)

Deedee's greeting and kitchen line were reworded at Tom's request (see CHANGES 74), so the baked clips of the old words can never play:

| Character | Kind | Line |
|---|---|---|
| deedee | greet (battle) | There's my Tommy! |
| deedee | dialogue (dialog-ch1) | There's my Tommy! |
| deedee | dialogue (dialog-ch25) | There's my Tommy! And my girls! Come here, come here. |
| deedee | dialogue (dialog-ch25) | Tom, you're skin and bones. Sit. The crisp needs ten minutes on the counter. |
| deedee | dialogue (dialog-ch26) | There's my Tommy! And my girls! And my... oh. OH. Why is Rose in an ice cube. |

Audio is in git history (the parent of the `deedee1` commit).

## 2026-11-07 (440): takes dropped from phone export 13

38 battle takes that arrived in the export for lines the game does not play: amy hills, hurt, marathon, marathon_ult, tombo2; grace attack, chalk_up, ymamot; rose ymamot; tom controller_tap, crumb_shot, window_seat; tnb tombo, round_with_jojo; and 24 Justin beats (bad_call, breaker_flip, demo_day, drywall, foot_tap, fresh_fit, giant_sneeze, loose_wire_zap, wire_nuts, and one empty-kind OUCH). They were never merged into a committed file; the audio stays in Tom's export.

## 2026-11-08 (voice14): old bigone stand-ins for The Mirrorball

17 dialogue clips under the `bigone` voice (the fallback used until Tom baked The Mirrorball): dialog-ch9 (13: Guests! GUESTS!, I CAUGHT it, Then they can come UP, Every full moon (two takes), One dance, From the top!, Round 2 to 5 The band plays on, one more song, see you next moon), dialog-ch26 (Fine. The party is over; Here. One of my little mirrors) and dialog-ch27 and ch26 (If I'm the brightest thing in the sky, two takes). Replaced by the 17 `mirrorball|` clips in dialog-ch28. Audio is in git history (the parent of the `voice14` commit).

Also dropped, not merged: 38 battle takes in phone export 14 for lines the game does not play (the same 38 as export 13: amy hills, hurt, marathon, marathon_ult, tombo2; grace attack, chalk_up, ymamot; rose ymamot; tom controller_tap, crumb_shot, window_seat; tnb tombo, round_with_jojo; 24 Justin beats). The audio stays in Tom's export.

## 2026-11-12 (`dialogclear1`): old wording of the 283 reworded dialogue lines

Tom decided on a full dialogue clarity rewrite (docs/CHANGES.md `dialogclear1`). The baked dialogue clips for the old wording (clip key is `voice|text`) can never play, so 275 were purged (about 10.8 MB). Audio is in git history (the parent of the `dialogclear1` commit). Clips per voice: tom 90, tnb 32, amy 26, boppy 18, bigone 16, michael 15, deedee 12, sal 12, grace 12, rose 8, penny 7, page 4, pagew 4, grump 3, kit 3, mudling 2, la_woman 2, log 2, skeeter 2, oolong 1, olivia 1, carmen 1, narrator 1, mirrorball 1. The old texts are the `old` column of the "Lines to bake" table in docs/CHANGES.md `dialogclear1`.

## 2026-11-13 (`ch1build1`): chapter 1 rewrite, four clips

Chapter 1 was rebuilt to the locked story. Dropped, can never play: tom "Boppy also says the stomach thing is serious. Stay close." (reworded), deedee "Tom, you stand in front of whoever it stares at. Rosie, make it laugh. Then we try again." (reworded to Cozy Rosie), and boppy "Speaking of strange. A fella was down at the pond yesterday..." plus "I said twenty years. He wrote it down." (the dropped long coat beat). About 134 KB; audio is in git history.

## 2026-11-13 (`ch2build1`): chapter 2 story build, three clips

Dropped, can never play: tom "...He said he'd be home." (removed so TNB does not sound unreliable), bigone "RUMBLE. A man in a long coat plugged my vents." and bigone "That's what the man promised me. Nobody leaves. Not ever." (the Big Shake lines were reworded to the flash story; the long-coat man is gone from chapter 2). Audio is in git history (the parent of the `ch2build1` commit).


## 2026-11-13 (`ch3build1`): chapter 3 story build, 34 clips

Chapter 3 was rebuilt to the locked story (claude/story-ch03.md). Dropped, can never play: the old sundial, long-coat and "nobody believes Boppy" lines, the narration boxes now shown as actions, and the reworded lines. The full list is in tools/clip-audit/purge-ch3build1.json (34 `speaker|text` keys). Audio is in git history (the parent of the `ch3build1` commit).

## 2026-11-14 (`ch5build1`): chapter 5 story build, 10 clips

Dropped, can never play: the narration boxes now shown as actions (the bell, the pen leaving, conference night, Nara sitting on Tom's feet and her sigh, "Tom wiggles free"), and three Red Pen lines about the man in the long coat and the reworded "I did. I made the bells..." line. Spec: tools/clip-audit/purge-ch5build1.json.


## 2026-11-14 (`backlog1`): 2 clips

Reworded by Tom's reports, so the old clips can never play: `grace|It's so brown. It's the brownest thing I've ever seen.` and `tom|I'm trying, Rose. It's a marble and it's winning.` (data/voice/dialog-ch28.js, about 69 KB). Both lines need a re-record.

## 2026-11-14 (`bern1`): Bernadette rewrite, 21 clips

Bernadette got a new personality, new words and her own voice key, so her 19 chapter 6 clips in the old shared `penny` voice can never play, and TNB's two reworded lines ("Babe, she has a corkboard with red string. I've never felt so seen." and "Noted. On a corkboard. With red string."). Spec: tools/clip-audit/purge-bern1.json (about 596 KB). All need a new recording. Her seven potluck clips were kept and moved to the `bernadette` key (tools/voice-library/rekey-bern1.json).

## 2026-11-14 (`ch6s4`): 68 dialogue clips

Chapter 6 was rebuilt to the locked script, so the old wording (old AfterBoss lines, the old Stage 7, Hollow, school yard and call lines) can never play. Full keys in `tools/clip-audit/purge-ch6s4.json` (`speaker|text`), about 2.2 MB, in `data/voice/dialog-ch4.js`, `ch5`, `ch7`, `ch22`, `ch25`, `ch26`, `ch28`. Audio is in git history (the parent of the `ch6s4` commit).

## 2026-11-20 (`reports-2026-11-20`): 1 dialogue clip

Tom report r-20261120-091310-jqps reworded one line in ch1Theft. Purged: `tom|Hi, Mom. I missed yours too. Is that the cinnamon topping? I've been thinking about that topping since I flew over Kansas.` (dialog-ch1.js).
