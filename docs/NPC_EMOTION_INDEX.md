# NPC emotion index: chapters 1 to 15 (npcemo1 chapters 1 to 5, npcemo2 chapters 6 to 10, npcemo3 chapters 11 to 15)

Fact: every line a person (not a monster) says in chapters 1 to 15 outside the cast story scenes, tagged with one of the 8 emotion-sheet moods. Behind the scenes only: the game does not load it. It is the list a later change uses to show an emotion pose frame per line.

- Source of truth: `docs/npc-emotion-lines.tsv` (columns: chapters, file, line, character, where, mood, text). Correct a tag by changing the one mood word there. This page is rebuilt from it with `python3 tools/npc-emotion-index.py`.
- Check: `python3 tools/npc-emotion-check.py` (mood valid, exact text still in its file, one mood per speaker and text). `--fix` refreshes line numbers after code moves.
- Covered: map NPC talk (townsfolk and family: first visit, revisit, hug and chapter variants), townsfolk lines inside story scenes, recruit and follower chatter, Penny and Nickel shop lines (greetings, buy and sell lines, shelf lines; not the gear captions), the cab drivers Sal and Sol.
- Not covered: cast lines in story scenes (already tagged in `docs/emotion-index-lines.tsv`, live in the game), monsters and bosses (no emotion sheets), narration from signs and objects, battle barks, puzzle replies (not located in the data), cast lines in the airport trips (Tom, Grace, Rose, TNB, Amy and the rest at the cab).
- `chapters`: where the line can show. `1-10` Long Island anytime in Part 1; `2-10` Los Angeles (first reached in chapter 2); single numbers and `a-b` are chapter variants. A line keyed by speaker and exact text carries its mood wherever it shows.
- Who has emotion sheets today: Tom, TNB, Grace, Rose, Amy, Justin, Deedee, Boppy, Olivia, Aunt Ellie (Nara has her own). Every townsperson here needs an emotion sheet before their tags can show a pose.

## Totals

| Mood | Lines |
|---|---|
| Happy | 177 |
| Loving | 78 |
| Sad | 40 |
| Angry | 24 |
| Scared | 35 |
| Surprised | 49 |
| Proud | 157 |
| Unimpressed | 117 |
| **All** | 677 |

## Lines by character

### Pip (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map town, base | Happy | I'm taking my pet rock for a walk. |
| 1-10 | map town, base | Unimpressed | He's shy. Please don't make eye contact. |
| 1-10 | map town, base | Proud | Excellent. He's already learned 'stay'. |

### Moss (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map town, base | Happy | I asked a tree for directions. |
| 1-10 | map town, base | Surprised | It said nothing. Very mysterious. |
| 1-10 | map town, base | Unimpressed | I think I'm barking up the wrong tree. |

### Dot (8)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map town, base | Proud | This town has ten doors and two gaps in the trees. |
| 1-10 | map town, base | Proud | I've counted them seventeen times. |
| 1-10 | map town, base | Happy | Tomorrow I'm moving on to windows. |
| 5-10 | map town, when {from:5} | Surprised | Ten doors and THREE gaps in the trees now. Somebody opened one by the school. |
| 5-10 | map town, when {from:5} | Unimpressed | I had to start all over. I'm at four hundred and six. |
| 1 | map town, when {chapter:1,flag:ch1-tin} | Happy | You got the tin back? Ten doors, two gaps, one pie tin. All accounted for. |
| 1 | map town, when {chapter:1,flag:ch1-theft} | Surprised | A mud blob ran through the Square with a pie tin. One blob. One tin. I counted. |
| 1 | map town, when {chapter:1,flag:ch1-theft} | Proud | It went north. Into the gap in the trees. Gap number one. |

### Gus (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map row, base | Proud | I'm training for the annual sit-down. |
| 1-10 | map row, base | Happy | My coach is a bench. |
| 1-10 | map row, base | Loving | We have a very supportive relationship. |

### Bean (7)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map row, base | Proud | I'm not lost. I'm collecting wrong turns. |
| 1-10 | map row, base | Angry | That pond up north owes me an apology. |
| 1-10 | map row, base | Unimpressed | Long story. Short socks. |
| 1 | map row, when {chapter:1,flag:ch1-theft,notFlag:ch1-tin} | Surprised | A mud blob just ran past me carrying a pie. |
| 1 | map row, when {chapter:1,flag:ch1-theft,notFlag:ch1-tin} | Unimpressed | I didn't stop it. I collect wrong turns, not pies. |
| 3 | map row, when {chapter:3,flag:ch3-boppy} | Surprised | Boppy went by with a fishing rod and a jar of peppers. |
| 3 | map row, when {chapter:3,flag:ch3-boppy} | Proud | He was walking slower than me. Nobody walks slower than me. I collect slow walks too, now. |

### Reel (7)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map pier, base | Happy | Bait shack is open. Worms, minnows, and a sandwich I'm not selling. |
| 1-10 | map pier, base | Happy | Your father has been fishing this pier since before the pier. He catches something every day. The size, I round down. |
| 1-10 | map pier, base | Unimpressed | They say a catfish lives out there older than the boards. I say they say a lot. |
| 3-10 | map pier, when {from:3,flag:ch3-clear} | Surprised | Your father caught Old Iron-Gill? And let him GO? Forty years of telling that story, and now it's true. |
| 3-10 | map pier, when {from:3,flag:ch3-clear} | Loving | He came by the shack this morning. The fish, not your father. Just floated there. I think he wanted to say hello. |
| 3 | map pier, when {chapter:3,flag:ch3-jar} | Surprised | You saw it? Old Iron-Gill? Forty years I have run this shack. I thought it was a story. |
| 3 | map pier, when {chapter:3,flag:ch3-jar} | Unimpressed | It went west, into the marsh. The Whispering Marsh. The reeds talk out there. Mostly nonsense. |

### Principal Pruitt (16)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map schoolyard, base | Proud | Principal Pruitt. Thirty-one years at Long Island Elementary. I've seen everything. Not tonight, though. Tonight is new. |
| 5-10 | map schoolyard, when {from:5,flag:ch5-done} | Proud | Thirty parents. Zero tears. One very well-behaved pen. Best conference night in thirty-one years. |
| 5-10 | map schoolyard, when {from:5,flag:ch5-done} | Happy | Come to Field Day, Tom. Amy runs the relay. Amy always runs the relay. |
| 5 | map schoolyard, when {chapter:5,notFlag:ch5-done,flag:ch5-pruitt} | Angry | Conferences start at seven. SEVEN. The bells say otherwise. The bells are wrong. |
| 5 | map schoolyard, when {chapter:5,notFlag:ch5-done,flag:ch5-pruitt} | Scared | Clear the rooms, set the hallway clocks to seven, and the Cafetorium will open. I hope. |
| 5 | scene ch5Pruitt | Happy | Mrs. Gregori! Thank goodness. And you brought the whole family. |
| 5 | scene ch5Pruitt | Proud | Not haunted. Grumpy. Thirty-one years in this building. I know the difference. |
| 5 | scene ch5Pruitt | Scared | The bells ring at random. The clocks in the hall all say different times. And the sign-up sheet got up off the table and walked into the school. |
| 5 | scene ch5Pruitt | Scared | The Cafetorium doors run on the bell system. The bells run on the hallway clocks. Thirty parents are on their way, and those doors won't open. |
| 5 | scene ch5Pruitt | Proud | Set every clock in the hall to seven. Seven o’clock. Not seven-thirty. Not six-fifty-nine. Seven. |
| 5 | scene ch5Clocks | Unimpressed | (on the intercom) ...ksssh... Attention, please. The Cafetorium doors are OPEN. Parents, please wait in the hall. There's something in the Cafetorium. |
| 5 | scene ch5Clocks | Happy | Mrs. Gregori’s brother, please go into the Cafetorium. Thank you. ...ksssh. |
| 5 | scene ch5AfterBoss | Happy | The sheet! The bells! The clocks! Parents, come on in! Conference night is ON! |
| 5 | scene ch5AfterBoss | Proud | Mrs. Gregori. Best conference night in thirty-one years. Not one parent cried. Well. Mr. Delgado. Happy tears. |
| 5 | scene ch5AfterBoss | Proud | This is for you. My Golden Stopwatch. Thirty-one Field Days. It's never once stopped early. |
| 5 | scene ch5AfterBoss | Happy | And Field Day shirts. Staff shirts. You're all staff now. Even the small loud ones. |

### Mr. Delgado (4)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map schoolyard, base | Proud | I'm Marco’s dad. Marco says Mrs. Gregori is the toughest teacher in the whole school. |
| 5 | map schoolyard, base | Loving | Marco also says she's his favorite. Please don't tell Marco I told you. |
| 5-10 | map schoolyard, when {from:5,flag:ch5-done} | Proud | Marco is reading at a third-grade level! Mrs. Gregori showed me the chart. There was a chart! |
| 5-10 | map schoolyard, when {from:5,flag:ch5-done} | Loving | I cried a little. In the minivan. Don't tell Marco. |

### Mrs. Kowalski (4)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map school, base | Proud | Kowalski. PTA president. I brought nine hundred cookies and a laminator. |
| 5 | map school, base | Angry | The sign-up sheet RAN AWAY. On little paper legs. I've never been so offended. |
| 5-10 | map school, when {from:5,flag:ch5-done} | Proud | Thirty conferences, nine hundred cookies, one laminator. Everything went on schedule. MY schedule. |
| 5-10 | map school, when {from:5,flag:ch5-done} | Happy | Tell Mrs. Gregori her bulletin board is the best in the building. Don't tell the other teachers. |

### Grandpa Ike (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map school, base | Proud | I'm here for my grandson. He's in the second grade. I was in the second grade here in 1956. |
| 5 | map school, base | Unimpressed | The bells were wrong in 1956 too. Nobody fixed them. Things were simpler. |
| 5-10 | map school, when {from:5,flag:ch5-done} | Surprised | They fixed the bells! In my lifetime! I'm going to tell everyone at the diner. |

### Mr. Halverson (7)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map school, base | Unimpressed | Halverson. Fourth grade. I'm hiding in the staff room. That's allowed. It's in the contract. |
| 5 | map school, base | Unimpressed | If you're hungry, the fridge is a minefield. Every lunch in there has a name on it. Read the labels. |
| 5-10 | map school, when {from:5,flag:ch5-done} | Happy | Conference night is over. I survived. I'm going to sit on this couch until Field Day. |
| 5 | map school, when {chapter:5,notFlag:ch5-done,flag:ch5-snack} | Happy | Deedee’s plate? Oh, everybody waits for Deedee’s plate. She brings one every conference night. |
| 5 | map school, when {chapter:5,notFlag:ch5-done,flag:ch5-snack} | Unimpressed | Don't tell Gary. Gary eats the whole thing. |
| 5 | scene ch5Snack | Proud | Every conference night. Twelve years. It's the only reason Gary shows up. |
| 5 | scene ch5Snack | Happy | Take some for the road. Don't tell Gary. |

### Bun (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map bakery, base | Happy | Welcome! Our bread is emotionally available. |
| 1-10 | map bakery, base | Unimpressed | The baguettes? A little crusty. |
| 1-10 | map bakery, base | Proud | Today's special is yesterday's tomorrow toast. |

### Page (21)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map library, base | Unimpressed | Please whisper. The dictionaries are sleeping. |
| 1-10 | map library, base | Surprised | Someone shelved a sandwich under 'S'. |
| 1-10 | map library, base | Unimpressed | Technically correct. Deeply concerning. |
| 7-10 | map library, when {from:7,flag:ch7-done} | Happy | It's quiet. Properly quiet. The good kind. Thank you, Tom. |
| 7-10 | map library, when {from:7,flag:ch7-done} | Proud | Story time is Saturdays now. The Unread asked for Grace. By name. |
| 7 | map library, when {chapter:7,notFlag:ch7-done,flag:ch7-page} | Scared | The Stacks are through the staff door. Please be careful. And please don't answer the books. |
| 7 | map library, when {chapter:7,notFlag:ch7-done,flag:ch7-page} | Scared | I'm fine. Everything is fine. The dictionaries haven't slept in a week. |
| 7 | map library, when {chapter:7,notFlag:ch7-done} | Scared | It's fine. Everything is fine. Please whisper. |
| 7 | map library, when {chapter:7,notFlag:ch7-done} | Scared | ...Did you hear that? That wasn't me. I'd know my own shush. |
| 7 | scene ch7Page | Scared | Oh! Tom. Girls. Welcome to the Hush Library. Everything is fine. |
| 7 | scene ch7Page | Scared | ...It's not fine. It started a week ago. It comes up from the Stacks, downstairs. The old part. |
| 7 | scene ch7Page | Surprised | Every book down there's whispering. Everything they ever heard. Seventy years of people reading quietly and thinking nobody was listening. |
| 7 | scene ch7Page | Unimpressed | Books overhear EVERYTHING. That's why we whisper in here. It was never for the people. It's for the books. |
| 7 | scene ch7Page | Proud | There are three sections. Fiction, Nonfiction and Picture Books. And the Reading Room, at the very back. |
| 7 | scene ch7Page | Sad | The Reading Room doors use the old card catalog lock. I lost the password in 1998. |
| 7 | scene ch7Page | Loving | Then you're in charge of the signs. Here. The staff door is open. |
| 7 | scene ch7Page | Scared | Please be careful. And please, don't answer the books. It only encourages them. |
| 7 | scene ch7End | Happy | Listen. It's quiet. Properly quiet. The good kind. The dictionaries are snoring. |
| 7 | scene ch7End | Happy | Then we'll read it. Story time, Saturdays, out loud. And I think I know who should do the voices. |
| 7 | scene ch7End | Loving | Grace. This is for you. A Gold Library Card. No limit. No late fees. Ever. |
| 7 | scene ch7End | Loving | And sweaters. I knit one every winter. I have run out of people. Please take some. |

### Fern (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map greenhouse, base | Proud | I name every plant here. |
| 1-10 | map greenhouse, base | Happy | They're all called Steve. It saves time. |
| 1-10 | map greenhouse, base | Proud | Except that one. That's Assistant Steve. |

### Kit (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map post, base | Happy | Your parcel is arriving any Tuesday now. |
| 1-10 | map post, base | Surprised | The snails asked for smaller uniforms. |
| 1-10 | map post, base | Proud | I deliver good news. Bad news has to walk. |

### Oolong (8)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map tea, base | Surprised | The kettle has been gossiping again. |
| 1-10 | map tea, base | Happy | It spilled the tea. Literally. |
| 1-10 | map tea, base | Unimpressed | Please mind the dramatic biscuits. |
| 3 | map tea, when {chapter:3,flag:ch3-tea} | Surprised | The kettle is still going on about that man in the long coat. Gold coins. Paying double. |
| 3 | map tea, when {chapter:3,flag:ch3-tea} | Unimpressed | I told it to mind its own business. It's a kettle. It has no business. |
| 3 | scene ch3Tea | Happy | Boppy! The usual? Ginger, peppermint, and a little honey for the stomach. |
| 3 | scene ch3Tea | Surprised | The kettle says a man in a long coat has been buying up gold coins at Penny’s. Paying double. Never takes his hat off. |
| 3 | scene ch3Tea | Unimpressed | The kettle also says it'll rain on Tuesday. The kettle is wrong a lot. Enjoy the pier. |

### Luna (13)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map observatory, base | Proud | I've discovered a new constellation. |
| 1-10 | map observatory, base | Surprised | It's shaped exactly like my laundry. |
| 1-10 | map observatory, base | Unimpressed | Space is asking me to tidy up. |
| 9-10 | map observatory, when {from:9,flag:ch9-done} | Happy | The moon is back. I looked at it for an hour. I didn't even write anything down. |
| 9-10 | map observatory, when {from:9,flag:ch9-done} | Unimpressed | I swept the club stairs. Twelve years of wondering, and it was just a very dusty party. |
| 9 | map observatory, when {chapter:9,notFlag:ch9-done,flag:ch9-luna} | Surprised | The door is open. Twelve years I have swept this floor, and that door is open. |
| 9 | map observatory, when {chapter:9,notFlag:ch9-done,flag:ch9-luna} | Sad | If you see the moon up there, please tell it to come home. My telescope misses it. |
| 9 | map observatory, when {chapter:9,notFlag:ch9-done} | Sad | There's supposed to be a full moon tonight. My telescope can't find it. |
| 9 | map observatory, when {chapter:9,notFlag:ch9-done} | Surprised | It's not behind a cloud. It's just not THERE. I checked four times. |
| 9 | scene ch9Luna | Happy | Oh! Visitors. At night. Is that... is that an INVITATION? |
| 9 | scene ch9Luna | Sad | Twelve years I have swept this floor. That little silver door in the back has never once opened. I thought it was a closet. |
| 9 | scene ch9Luna | Sad | And my telescope can't find the moon. It's not behind a cloud. It's not anywhere. It's just GONE. |
| 9 | scene ch9Luna | Surprised | ...It wasn't a closet. |

### Sal (40)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map taxi, base | Proud | Long Island Taxi. We go anywhere in town. Town is small, so mostly here. |
| 1-10 | map taxi, base | Happy | I have one cab. It's cab seven. Cabs one through six are a dream I'm working on. |
| 1-10 | map taxi, base | Surprised | You just rode with me. You tipped in sourdough starter. Odd. Generous. |
| 10 | scene ch10Start | Happy | Cab seven! Everybody in. Long Island Regional. The door nobody uses. |
| 4 | cab flight to ch4 | Happy | Los Angeles again? Cab seven loves this run. She hums the whole way. |
| 4 | cab flight to ch4 | Unimpressed | The girls stay home. Amy's rule. I don't argue with Amy. |
| 6 | cab flight to ch6 | Proud | Back to Los Angeles. Your sister gave me a gold star for using my blinker. |
| 6 | cab flight to ch6 | Unimpressed | The girls stay home. School night. It's always a school night. |
| 8 | cab flight to ch8 | Unimpressed | Los Angeles again? I'm starting to think you live there. |
| 8 | cab flight to ch8 | Unimpressed | The girls stay home. School tomorrow. Library books are due. |
| 1-10 | cab west | Happy | Los Angeles? You got it. Flights leave whenever I get there. |
| 1-10 | cab west | Unimpressed | One thing. The girls stay home. Amy's rule. No flying on a school night. |
| 1-10 | cab west | Happy | Airport? Hop in. Cab seven has been waiting all day. |
| 1-10 | cab west | Proud | The girls stay put. Amy's orders. I follow Amy's orders. Everybody does. |
| 1-10 | cab west | Unimpressed | LAX it is. Seat belts. Your niece is giving me the look. |
| 1-10 | cab west | Unimpressed | Girls, out you go. No stowaways. I checked the trunk last time. |
| 1-10 | cab west | Unimpressed | Off to the airport. I'll take the scenic route. By scenic I mean the only route. |
| 1-10 | cab west | Unimpressed | The girls stay home. It's a school night. Even I know that, and I don't have kids. |
| 1-10 | cab west | Unimpressed | Airport. Los Angeles. Your usual. |
| 1-10 | cab west | Happy | Girls, say your goodbyes. I'll keep the meter off. Mostly. |
| 1-10 | cab west | Proud | Los Angeles? Sure. I'll get you there before the sun gets bored. |
| 1-10 | cab west | Happy | The girls stay here. Amy's rule number one. There are about forty more. |
| 1-10 | cab west | Proud | Another flight, another gold star for cab seven. |
| 1-10 | cab west | Unimpressed | The girls head home. Straight home. Do not follow the cab. |
| 1-10 | cab west | Unimpressed | Airport. You've got the look of a man who packed light. |
| 1-10 | cab west | Happy | Girls, back to the house. Your grandmother has pie. That's not a rumor. |
| 1-10 | cab west alone | Happy | Los Angeles? You got it. Buckle up. |
| 1-10 | cab west alone | Happy | Los Angeles again. Cab seven is ready. |
| 1-10 | cab west alone | Happy | LAX. Sit back. The radio is on something calm. |
| 1-10 | cab west alone | Unimpressed | Off we go. Don't touch the visor. Everybody touches the visor. |
| 1-10 | cab west alone | Proud | Airport run. I'll have you there before your coffee gets cold. |
| 13 | scene ch13Open | Happy | Sol. Sol, come in. It’s Sal. Cab seven says hi. She’s fine. She’s the only thing in town that’s moving. |
| 13 | scene ch13Open | Scared | Tommy! It’s quiet in here. Even the clocks are quiet. Your mother’s in the kitchen. Don’t panic. She’s fine. She just won’t stop baking. |
| 13 | scene ch13Open | Scared | I’m under the dome with a shovel and a very worried shopkeeper. I can’t get out. But I can dig toward you. |
| 13 | scene ch13Open | Scared | The drill stopped answering when the dome came down. Something put a chip in it. Be careful of the worm. |
| 13 | scene ch13After | Happy | (through the glass) TOMMY! Over here! Hi! Don’t hug the amber, it’s sticky! |
| 13 | scene ch13After | Happy | It worked! Gold remembers being warm! I told you! Nobody ever believes the cab driver! |
| 13 | scene ch13After | Proud | Tommy. Sol and I started this tunnel in 2011 with a shovel and a very good deal on a drill. I never thought anyone would walk through it. |
| 13 | scene ch13After | Proud | I’m a cab driver. That’s the whole job. |
| 13 | scene ch13After | Proud | Okay. The Sub-Rail runs the rest of the way, up under Grump Hollow. It comes out at the breach. Sol’s putting the girls on the five fifteen handcar. |

### Justin (16)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map amyhouse, base | Unimpressed | Tom. Hey. Hold this. No, the other end. Don't touch the copper. |
| 1-10 | map amyhouse, base | Loving | Rewiring the hallway. Amy wanted a dimmer. Amy gets a dimmer. |
| 1-10 | map amyhouse, base | Loving | Grace, Rose, come here. Who's Daddy's favorite? Both. Correct. Go get 'em. |
| 1-10 | map amyhouse, revisit | Proud | Long Island born. Country music raised. Don't ask me how. Nobody knows. |
| 1-10 | map amyhouse, revisit | Happy | Big game tonight. If you hear yelling, that's me. If you hear crying, that's also me. |
| 1-10 | map amyhouse, revisit | Surprised | Grace, you were amazing out there. Rose, you were also amazing. Also, why are you sticky? |
| 1-10 | map amyhouse, revisit | Proud | Fixed the porch light, the garbage disposal and the bunk bed. Before lunch. |
| 1-10 | map amyhouse, revisit | Happy | Every country song is about a truck, a dog or a girl. I got a truck and two girls. Living the song. |
| 1-10 | map amyhouse, revisit | Sad | Amy says I never sit down. I sat down once. It was a playoff game. We lost. |
| 1-10 | map amyhouse, revisit | Unimpressed | Watch your step, Tom. That board is loose. I know. It's on the list. |
| 1-10 | map amyhouse, revisit | Loving | Those two girls are the best thing I ever built. And I built that deck. |
| 1-10 | recruit ask | Happy | Heading out? I can come. I have a tool belt, a flashlight and a strong opinion about whatever you're about to fight. |
| 1-10 | recruit yes | Happy | Great. Let me grab my jacket. And the ladder. Don't ask about the ladder. |
| 1-10 | recruit no | Unimpressed | No problem. The hallway light won't finish itself. It's been almost done since June. |
| 1-10 | recruit swap | Happy | Somebody has to tag out. I'll wait. I'll be on the ladder. |
| 1-10 | recruit chatter | Unimpressed | Hold this. No, the other end. Don't touch the copper. |

### Amy (22)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map amyhouse, base | Happy | Grace! Rose! Did you stretch before all this adventuring? |
| 1-10 | map amyhouse, base | Proud | Tom, I ran eight miles before you woke up. Just stating facts. |
| 1-10 | map amyhouse, base | Unimpressed | Justin is rewiring the hallway. Again. He says hi from the ladder. |
| 1-10 | map amyhouse, revisit | Proud | Race you to the fountain. No? Then I win. |
| 1-10 | map amyhouse, revisit | Loving | Twelve kids in my room, and not one of them as wild as you two. Which I love. |
| 1-10 | map amyhouse, revisit | Surprised | Rose, where are your shoes? Oh. Good. |
| 1-10 | map amyhouse, revisit | Happy | Grace, be nice to the slime. Then beat it. Those are the two rules. |
| 1-10 | map amyhouse, revisit | Unimpressed | Tom, if they come back faster than me, we need to talk. |
| 1-10 | map amyhouse, revisit | Unimpressed | Justin says the hallway light is almost done. It's been almost done since June. |
| 1-10 | map amyhouse, revisit | Unimpressed | Did Boppy give you that cap? Don't let him near the pond. |
| 1-10 | map amyhouse, revisit | Proud | One of my kids read a whole page out loud today. First time. I cried in the supply closet. |
| 1-10 | map amyhouse, revisit | Loving | Rose. Big feelings are allowed. Throwing Lamby isn't. Come here. |
| 1-10 | map amyhouse, revisit | Loving | Grace, you don't have to be the best at it. You have to be the one who keeps going. Okay, now be the best at it. |
| 5-10 | map amyhouse, when {from:5,flag:ch5-done} | Happy | Thirty conferences. Zero tears. Well. One. Mine. In the minivan. |
| 5-10 | map amyhouse, when {from:5,flag:ch5-done} | Loving | Tom. Thank you for coming. You're the good uncle. By a lot. |
| 1-10 | recruit ask | Happy | Also. I've been standing still for four minutes and it's killing me. Want a running partner out there? |
| 1-10 | recruit yes | Happy | Finally. Try to keep up. I mean that with love. |
| 1-10 | recruit no | Unimpressed | Fine. I'll do burpees until you change your mind. |
| 1-10 | recruit swap | Happy | Somebody has to tag out. I can wait, but I'll be stretching the whole time. |
| 1-10 | recruit chatter | Proud | Pick up the pace, Tom. The girls are faster than you. |
| 1-10 | recruit chatter | Proud | Is that the Grump? I could take him. I've taken a second-grade class on a field trip. |
| 1-10 | recruit chatter | Unimpressed | Rose, shoes. Grace, water. Tom, posture. |

### Deedee (29)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map grands, base | Loving | My favorite son! And my girls! Come here, come here. |
| 1-10 | map grands, base | Happy | Rhubarb crisp in the oven, dinner on the stove, floors just mopped. Shoes off. Who wants a cookie? |
| 1-10 | map grands, base | Loving | Grace, Rose, Deedee loves you to the moon and back. Say it back. Louder. |
| 1-10 | map grands, revisit | Proud | The tomatoes are coming in. You're going home with forty. |
| 1-10 | map grands, revisit | Proud | I baked at five this morning. The neighbors have stopped asking why. |
| 1-10 | map grands, revisit | Scared | Tommy, is that a bruise? Sit. Eat. Explain. |
| 1-10 | map grands, revisit | Loving | To the moon and back, girls. The MOON. And BACK. |
| 1-10 | map grands, revisit | Unimpressed | Boppy says he's not feeling good. Boppy also won't stop fishing. |
| 1-10 | map grands, revisit | Happy | Grace, Rose, who wants to help Deedee frost something? |
| 1-10 | map grands, revisit | Loving | Rhubarb crisp is cooling on the counter. Don't touch it. Okay, one corner. |
| 1-10 | map grands, revisit | Unimpressed | I already did my walk. Boppy did one lap around the recliner. |
| 1-10 | map grands, revisit | Proud | Retired registered nurse. Tom calls me a registered nut. Tom is due for a checkup. |
| 1-10 | map grands, revisit | Unimpressed | Sunday dinner is at five. Five means four thirty. |
| 1-10 | map grands, revisit | Angry | I just cleaned the floors. Shoes OFF. |
| 1-10 | map grands, revisit | Happy | A little glass of wine with dinner. Just one. Nurse's orders. |
| 1-10 | map grands, revisit | Surprised | Have you seen my reading glasses? I had them a minute ago. I've looked everywhere. Twice. |
| 1-10 | map grands, revisit | Happy | Found my glasses. They were in the fridge. Don't ask. Who wants a cookie? |
| 1-10 | map grands, hug:0 | Loving | Hugs for everyone. There. All better. |
| 1-10 | map grands, hug:1 | Loving | Hugs for everyone, just because. To the moon and back. |
| 1-10 | recruit ask | Loving | Now hold on, Tommy. You're not taking my angels anywhere without me and a bag of cookies. Can Deedee come along? |
| 1-10 | recruit yes | Loving | Wonderful! Everybody hold hands. Tommy, you too. To the moon and back, here we come. |
| 1-10 | recruit no | Happy | All right, all right. The pies need me anyway. Come back for a cookie. |
| 1-10 | recruit swap | Loving | Oh, honey. Somebody has to stay and mind the house. Who's it going to be? |
| 1-10 | recruit chatter | Loving | Are you warm enough? Nobody is warm enough. |
| 1-10 | recruit chatter | Loving | Grace, Rose, to the moon and back. Say it. LOUDER. |
| 1-10 | recruit chatter | Happy | I packed cookies. They're in my purse. The purse is at home. We go back. |
| 1-10 | recruit chatter | Proud | Pick up those feet. A brisk walk never hurt anybody. |
| 1-10 | recruit chatter | Proud | Tommy, you look pale. When did you last drink water? Nurse is asking. |
| 1-10 | recruit chatter | Loving | When we get home I'm making a big dinner. Nobody argue. |

### Boppy (21)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map grands, base | Angry | Tom! Good. I'm not feeling good. Something with the stomach. Sit, I'll tell you about it. |
| 1-10 | map grands, base | Loving | Grace, Rose, come give Boppy a hug. Gently. The stomach. And slow down, you two walk too fast. |
| 1-10 | map grands, base | Proud | Did I ever tell you I was a champion cross country runner in college? Your mother has heard it. Sit down. |
| 1-10 | map grands, base | Proud | Here, take my spare cap. For luck. I caught a twelve pounder in it. Nine. It was a big six. |
| 1-10 | map grands, revisit | Proud | Assistant Deputy Warden at Rikers. All those years, nobody got past me. Except that fish. |
| 1-10 | map grands, revisit | Unimpressed | At Rikers we did headcounts. Grace, one. Rose, two. Tom, you're dragging. |
| 1-10 | map grands, revisit | Proud | In college I ran cross country. Champion. Through the woods, up the hills, never breathed hard. |
| 1-10 | map grands, revisit | Happy | Did I tell you about the championship race? I did? Sit down. I'll tell you again. |
| 1-10 | map grands, revisit | Sad | I'm not feeling good. I was fine an hour ago. Then I had a pepper. |
| 1-10 | map grands, revisit | Angry | Slow down, Tom. Who walks this fast? I was a champion runner and I never walked this fast. |
| 1-10 | map grands, revisit | Unimpressed | Deedee says I'm not allowed near the pond. The pond says otherwise. |
| 1-10 | map grands, revisit | Proud | Grace, Rose, who's the strongest grandpa? Correct. Now help me up. |
| 1-10 | map grands, revisit | Unimpressed | She's looking for her glasses again. They're on her head. I'm not saying anything. I'm saying it to you. |
| 1-10 | recruit ask | Sad | My stomach isn't right and the fish aren't biting. Want an old man along? Just don't walk too fast. |
| 1-10 | recruit yes | Proud | Good. Somebody grab my cap. And slow down. I was a champion, you know. |
| 1-10 | recruit no | Unimpressed | Suit yourself. The recliner and I have an understanding. |
| 1-10 | recruit swap | Sad | Somebody has to sit this one out. My stomach volunteers, but the rest of me is coming. |
| 1-10 | recruit chatter | Angry | Slow down! Who taught you to walk? I was a champion runner and I never went this fast. |
| 1-10 | recruit chatter | Proud | At Rikers I did the headcount. One, two, three, Tom. Everybody here. |
| 1-10 | recruit chatter | Unimpressed | My stomach is talking. It says no more peppers. My stomach is wrong. |
| 1-10 | recruit chatter | Unimpressed | That Grump owes me a fish. Tell him. |

### Aunt Ellie (16)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | map elliehouse, base | Unimpressed | Tom. Stand up straight. There. Now you look like someone I'm related to. |
| 1-10 | map elliehouse, base | Proud | Yes, Deedee has an aunt. Yes, I'm older. No, you may not ask by how much. |
| 1-10 | map elliehouse, base | Unimpressed | I've been to Paris eleven times. Long Island is charming. Like a hat you wear once. |
| 1-10 | map elliehouse, revisit | Happy | Deedee keeps offering me rhubarb crisp. I keep saying yes. That's called manners. |
| 1-10 | map elliehouse, revisit | Unimpressed | Boppy says his stomach hurts. I told him to stop eating peppers. He looked at me like I insulted his mother. |
| 1-10 | map elliehouse, revisit | Happy | Grace, darling, that outfit is wonderful. Rose, darling, that outfit is a choice. A brave one. |
| 1-10 | map elliehouse, revisit | Proud | Wisdom is remembering what went wrong and saying so before it happens again. |
| 1-10 | map elliehouse, revisit | Proud | Never apologize for being early, dressing up, or leaving a bad party. |
| 1-10 | map elliehouse, revisit | Loving | Tom, you have a good heart. Now do something about the shoes. |
| 1-10 | map elliehouse, revisit | Proud | Deedee says I'm sharp. I say everyone else is a little dull. |
| 1-10 | map elliehouse, revisit | Unimpressed | A good scarf fixes almost anything. Not Boppy. But almost anything. |
| 1-10 | map elliehouse, revisit | Proud | Somebody once told me I was too much. I outlived him. I dressed beautifully at the funeral. |
| 9 | map grands, when {chapter:9,notFlag:ch9-done,flag:ch9-letter} | Proud | The girls and I are playing cards. I'm winning. I'm also cheating. They're learning a great deal. |
| 9 | map grands, when {chapter:9,notFlag:ch9-done,flag:ch9-letter} | Loving | Go. Dance. Somebody in this family should get to finish a party at the Moon Club. |
| 9-10 | map elliehouse, when {from:9,flag:ch9-done} | Sad | My coat. Ticket seven. I left it at the last dance and never went back for it. |
| 9-10 | map elliehouse, when {from:9,flag:ch9-done} | Unimpressed | I had a date with a man who turned out to be a disappointment. The coat wasn't. Keep it warm for me. |

### Skye (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map blvd, base | Happy | I'm filming a day-in-my-life video. I live in the lofts. |
| 2-10 | map blvd, base | Happy | This is the day. You're in my life now. |
| 2-10 | map blvd, base | Proud | Say hi to my eleven followers. |

### Chet (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map blvd, base | Proud | I'm an actor. Well. I'm an actor who parks cars at a tower. |
| 2-10 | map blvd, base | Happy | I had a callback last week. For a cereal. |
| 2-10 | map blvd, base | Sad | The cereal went with someone else. It happens. |

### Wes (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map blvd, base | Happy | I'm a screenwriter. I live in the lofts, two floors down from your boyfriend. |
| 2-10 | map blvd, base | Proud | Draft forty-one. It's about a man who writes screenplays. It's very personal. |
| 2-10 | map blvd, base | Happy | He lends me a mug when I'm stuck. I'm stuck a lot. I have nine of his mugs. |

### Boomie (14)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map blvd, base | Loving | TOM! Get over here. Hug. Mmm-hmm. There it is. |
| 2-10 | map blvd, base | Proud | I leave Tuesday for the tour. Atlanta first, then Chicago, then Nashville. One suitcase. Nine dresses. |
| 2-10 | map blvd, base | Loving | Friday is the home show, right here downtown. You're in the front row. I wrote your name on the seat. |
| 2-10 | map blvd, base | Happy | Oh, the sun's coming up on my street. Hallelujah, hallelujah! Sorry. I sang that whole sentence. |
| 2-10 | map blvd, revisit | Surprised | La la LAAA! Oops. A car alarm went off. That one is on me. |
| 2-10 | map blvd, revisit | Happy | Atlanta, then Chicago, then Nashville. I keep saying it out loud so I don't forget. |
| 2-10 | map blvd, revisit | Loving | Friday night, front row. I don't start the show without you. Okay, I start. But I look for you. |
| 2-10 | map blvd, revisit | Loving | How's TNB? Tell him there's a seat for him too. Two front row seats. Don't make me beg. |
| 2-10 | map blvd, revisit | Happy | Oh, when the morning comes, I'm gonna rise. Rise, rise, rise! Sing with me, Tom. Amen! |
| 2-10 | map blvd, revisit | Loving | I open with a hymn my grandmother sang. She'd say I'm doing it too loud. She'd be right. |
| 2-10 | map blvd, revisit | Happy | Sol says he parks his cab outside to hear me warm up. I say he's just early. |
| 2-10 | map blvd, revisit | Loving | You text me when you land. I mean it. A song is also fine. |
| 2-10 | map blvd, revisit | Proud | I sang in the shower this morning. The whole building clapped. Thin walls. |
| 2-10 | map blvd, revisit | Surprised | Hmm hmm hmmm. Oh, I was humming? I'm always humming. |

### Bev (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map blvd, base | Happy | I came all the way from Ohio. I rode the tiny orange railway up the hill. |
| 2-10 | map blvd, base | Happy | It went one block. It cost a dollar. Best dollar of my life. |
| 2-10 | map blvd, base | Loving | Then I ate a pupusa in a market from 1917. I may never go home. |

### Olivia (29)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map jpark, base | Surprised | Tom! Hi! Sorry, I'm mid-sentence in my head. I'm filing a story on AI in classrooms. |
| 2-10 | map jpark, base | Unimpressed | The kids use it to write the homework. The teachers use it to grade the homework. Nobody is in the room. |
| 2-10 | map jpark, base | Scared | MICHAEL. Can you grab Isla? She has a leaf. She's going to eat the leaf. |
| 2-10 | map jpark, revisit | Unimpressed | My editor wants a piece on AI taking jobs. I said I'd write it myself. While I still can. |
| 2-10 | map jpark, revisit | Loving | Michael, can you take Lachlan? He's licking the fence. Thank you, babe. |
| 2-10 | map jpark, revisit | Unimpressed | Everybody asks if robots will take their jobs. I tell them a robot still can't fold a fitted sheet. Neither can I. |
| 2-10 | map jpark, revisit | Unimpressed | I interviewed a chatbot today. It was very polite. Too polite. I didn't trust it. |
| 2-10 | map jpark, revisit | Scared | Michael! Isla is near the curb. Okay. Never mind. Thank you, babe. |
| 2-10 | map jpark, revisit | Scared | Did Nara eat today? Tell me the truth. Michael, did Nara eat? |
| 2-10 | map jpark, revisit | Proud | Teachers aren't getting replaced. They're getting a very confident new student who never did the reading. |
| 2,4 | map jpark, when {test:S=>(S.chapter===2&&!!S.flags['ch2-done'])//(S.chapter===4&&!!S.flags['ch4-done']} | Surprised | Tom! You kept Nara alive! Did she eat? She didn't eat, did she. |
| 2,4 | map jpark, when {test:S=>(S.chapter===2&&!!S.flags['ch2-done'])//(S.chapter===4&&!!S.flags['ch4-done']} | Happy | The desert was gorgeous. Lachlan found a rock. Isla ate a rock. Different rock. |
| 2,4 | map jpark, when {test:S=>(S.chapter===2&&!!S.flags['ch2-done'])//(S.chapter===4&&!!S.flags['ch4-done']} | Scared | MICHAEL. Can you grab Isla? She's going for the dog bowl. |
| 8-10 | map jpark, when {from:8,flag:ch8-done} | Happy | Nara ate! A whole plate! Off your plate, but still! I'm counting it! |
| 8-10 | map jpark, when {from:8,flag:ch8-done} | Proud | Michael, Isla has a roll in each hand. That's fine. That's a balanced meal. |
| 8 | map jpark, when {chapter:8,notFlag:ch8-done,flag:ch8-block} | Scared | Did she eat? She won't eat cold food. She won't eat warm food either. She eats off YOUR plate, Tom. |
| 8 | map jpark, when {chapter:8,notFlag:ch8-done,flag:ch8-block} | Angry | My lasagna is a brick. A cold lasagna brick. Michael is guarding it with his life. |
| 6-10 | map jpark, when {from:6,flag:ch6-done} | Happy | Nara slept! Twelve hours! She's snoring like Michael. |
| 6-10 | map jpark, when {from:6,flag:ch6-done} | Loving | Thank you, Tom. Tell TNB thank you. Tell the squirrels nothing. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done,flag:ch6-nara} | Scared | Is she okay? Is she eating? She's not eating, is she. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done,flag:ch6-nara} | Scared | Michael, the squirrel is back on the fence. Don't make eye contact. |
| 1-10 | recruit ask | Happy | I have a notebook, a phone at 9 percent and a very firm opinion on this story. Can I come? Michael has the kids. I think. |
| 1-10 | recruit yes | Happy | Great. Let me grab my tote. It has snacks. It always has snacks. |
| 1-10 | recruit no | Happy | Okay. I'll be here, fact-checking a sandwich. Come find me. |
| 1-10 | recruit swap | Proud | Somebody has to tag out. I'll wait. I'll take notes on the whole thing. |
| 1-10 | recruit chatter | Proud | Hold on, I'm writing that down. Can you say it again, slower? |
| 1-10 | recruit chatter | Unimpressed | Is that a source? Who told you that? I need two sources. |
| 1-10 | recruit chatter | Surprised | Michael? Michael, can you hear me from here? No? Okay. |
| 1-10 | recruit chatter | Unimpressed | It is sixty-two degrees. I am wearing a dress. Nobody warned me. |

### Michael (16)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map jpark, base | Happy | Hey, Tom. Good to see you. Please ignore the cracker crumbs. They live here now. |
| 2-10 | map jpark, base | Proud | I work at Meta. I build things that connect people. Right now I'm connecting a four-year-old to a nap. |
| 2-10 | map jpark, base | Surprised | I heard Olivia say Michael. Whatever it is, I'm on it. Isla, that is not a snack. |
| 2-10 | map jpark, revisit | Unimpressed | Yes, Olivia. Heard you. Handled. Lachlan, we do not lick the fence. |
| 2-10 | map jpark, revisit | Loving | Lachlan wants to know if Nara is his dog. I said it's complicated. It's not. It's his dog. |
| 2-10 | map jpark, revisit | Proud | Isla said her first word last week. It was no. She uses it very well. |
| 2-10 | map jpark, revisit | Happy | I took a meeting today with Isla on my lap. She muted me. Best meeting of the quarter. |
| 2-10 | map jpark, revisit | Proud | My arms have never been stronger. I haven't lifted a weight in four years. |
| 2-10 | map jpark, revisit | Happy | Olivia writes about AI taking jobs. Nobody is coming for the job of a dad. Not even AI wants that! |
| 8-10 | map jpark, when {from:8,flag:ch8-done} | Happy | Best potluck ever. Lachlan fell asleep in the bread basket. |
| 8 | map jpark, when {chapter:8,notFlag:ch8-done,flag:ch8-block} | Unimpressed | Cold lasagna, one diaper bag, and Isla eating the tablecloth. We're thriving. |
| 6-10 | map jpark, when {from:6,flag:ch6-done} | Happy | Lachlan got his truck back. He hasn't put it down. He's eating cereal with one hand. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done,flag:ch6-nara} | Surprised | Zero car keys and one very sticky toddler. Wait. Keys. Gutter. Right. |
| 6 | scene ch6Nara | Surprised | I found my car keys in the gutter. With three peanuts. Arranged in a triangle. |
| 6 | scene ch6End | Loving | Lachlan wants Nara to have this. He painted a tennis ball gold. It took him four days and most of a bottle of paint. |
| 8 | scene ch8End | Happy | Lachlan has eaten three rolls and fallen asleep in the bread basket. I'm leaving him there. He's happy. |

### Mr. Washington (28)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map jpark, base | Proud | Bought this house in 1979. Same porch, same chair, same view. |
| 2-10 | map jpark, base | Loving | Back then you could hear zydeco from the boulevard on a Saturday night. |
| 2-10 | map jpark, base | Proud | You're the one fixing up the green house? Keep the old windows. They're better than the new ones. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | Back in 1979, this whole block... |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | ... |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | Such a nice afternoon. It should always be this afternoon. Nobody needs to get any older. |
| 2 | map jpark, when {chapter:2,flag:ch2-clear} | Surprised | Where was I? Oh. 1979. This whole block smelled like gumbo on a Saturday night. |
| 2 | map jpark, when {chapter:2,flag:ch2-clear} | Angry | That smog had me stuck on one sentence for an hour. At my age I don't have hours to spare. |
| 2 | map jpark, when {chapter:2,flag:ch2-clear} | Loving | Thank you, Tom. And your young man. And the dog. Especially the dog. |
| 8-10 | map jpark, when {from:8,flag:ch8-done} | Proud | That coat looks right on you. My daddy would say so. Then he'd say stand up straight. |
| 8-10 | map jpark, when {from:8,flag:ch8-done} | Happy | Forty loaves. I ate four. Don't tell Bernadette. |
| 8 | map jpark, when {chapter:8,notFlag:ch8-done} | Sad | Forty years I've made gumbo for this potluck. Today the stove won't light. The flame just leans. Toward the boulevard. |
| 8 | map jpark, when {chapter:8,notFlag:ch8-done} | Loving | My daddy drove the 7 line out of the old Car Barn. He said the stove down there could warm a whole street. |
| 6-10 | map jpark, when {from:6,flag:ch6-done} | Surprised | My reading glasses! Found in a hole in the park. I won't ask. |
| 6-10 | map jpark, when {from:6,flag:ch6-done} | Unimpressed | Back in 1979 the squirrels were polite. They waited until you finished your sandwich. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done} | Unimpressed | Somebody took my reading glasses off the porch rail. I have read the same headline for three days. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done} | Unimpressed | I think it says WEATHER. It might say WHETHER. |
| 2 | scene ch2Smog | Loving | Tom. Back in 1979, this whole block... |
| 2 | scene ch2Smog | Happy | Such a nice afternoon. It should always be this afternoon. |
| 2 | scene ch2Smog | Happy | Nobody needs to go anywhere. Nobody needs to get any older. |
| 2 | scene ch2End | Loving | ...smelled like gumbo on a Saturday night. Zydeco from the boulevard. Kids on every porch. |
| 2 | scene ch2End | Surprised | Where was I? Oh. I was done. That was the whole story. |
| 2 | scene ch2End | Proud | Funny. For a while there I didn't want anything to change. Then I remembered the best parts all came from things changing. |
| 2 | scene ch2End | Happy | Keep the old windows. Smart man. |
| 8 | scene ch8End | Loving | Tom. Come here. This was my daddy’s. He drove the 7 line out of that barn for thirty years. Night run. He swore by the biscuits. |
| 8 | scene ch8End | Loving | He'd want it on somebody who went back in there and lit that stove. Here. |
| 8 | scene ch8End | Proud | I know you will. Now stand up straight. He'd say that too. |
| 12 | scene ch12After | Surprised | ...and that is why you never trust a Tuesday. Hm? Why is everybody looking at me? Did I fall asleep? Again? |

### Marisol (10)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map jpark, base | Unimpressed | I'm walking my dog. He's somewhere. |
| 2-10 | map jpark, base | Proud | My grandparents rented on this block. Now I rent on this block. We're a tradition. |
| 2-10 | map jpark, base | Surprised | There he is. No. That's a lemon. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | I'm walking my dog. I've always been walking my dog. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | I'll always be walking my dog. Isn't that nice? |
| 8-10 | map jpark, when {from:8,flag:ch8-done} | Unimpressed | My dog ate a whole loaf. I found him. He was under the table. He's always under the table. |
| 8 | map jpark, when {chapter:8,notFlag:ch8-done} | Sad | My tamales are cold. My dog is cold. My dog is somewhere. He's probably cold. |
| 6-10 | map jpark, when {from:6,flag:ch6-done} | Happy | Eleven tennis balls! Back! My dog is beside himself. Wherever he is. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done} | Sad | Every tennis ball on the block. Gone. My dog has nothing to ignore now. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done} | Surprised | There he is. No. That's a squirrel. It's looking at me. |

### Larry (9)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map jpark, base | Unimpressed | I'm blowing leaves. |
| 2-10 | map jpark, base | Unimpressed | Onto the next yard. |
| 2-10 | map jpark, base | Proud | Tomorrow, they blow them back. It's a whole system. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | I'm blowing leaves. The same leaf. Over and over. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | It never lands. It never has to. Very peaceful. |
| 8 | map jpark, when {chapter:8,notFlag:ch8-done} | Surprised | I'm blowing leaves. They're frosty. In LA. I have questions. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done} | Angry | I'm blowing leaves. The squirrels keep blowing them back. |
| 6 | map jpark, when {chapter:6,notFlag:ch6-done} | Unimpressed | It's a whole system. Their system is better. |
| 12 | scene ch12After | Happy | I’m blowing leaves. The leaf landed. It LANDED. Thirty years I’ve waited. Thank you. |

### Ray (8)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map studio, base | Unimpressed | Sunset Gold Studios. Closed set. Name? |
| 2-10 | map studio, base | Unimpressed | Tom. Plus one dog. Plus one boyfriend who already works here. Fine. Go on in. |
| 2-10 | map studio, base | Proud | Nobody gets past Ray. Except the dog. The dog got past Ray. Don't tell anyone. |
| 4-10 | map studio, when {from:4,flag:ch4-done} | Proud | Ray here. Shoot wrapped. Nobody got past me. Except the megaphone. And the moths. And the dog. |
| 4-10 | map studio, when {from:4,flag:ch4-done} | Happy | Good job, Tom. Don't tell anyone I said good job. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Proud | Nobody came through my gate. Nobody with legs. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Sad | Little things, though. Buzzing. Clapping. One of them asked me for a compliment. I said no. I regret it. |
| 4 | scene ch4Gate | Happy | I wave at everybody. That's the job. Go on in. |

### Toni (4)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map studio, base | Happy | Craft services! Take a bagel. Take two. Nobody is counting. I'm counting. |
| 2-10 | map studio, base | Happy | The crew eats like a swarm of locusts. Polite locusts. With lanyards. |
| 4 | scene ch4Snack | Proud | Plain roast chicken. No salt, no skin, no sauce. I keep it for the grips. They're also picky. |
| 4 | scene ch4Snack | Loving | Here. For the road. Don't tell the grips. |

### Kiki (10)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map studio, base | Unimpressed | Kiki. Production assistant. I have a headset, three radios and zero answers. |
| 2-10 | map studio, base | Proud | If anybody asks, I'm walking somewhere important. I'm always walking somewhere important. |
| 4-10 | map studio, when {from:4,flag:ch4-done} | Happy | We WRAPPED! On time! Well. Four hours late. Which is on time for us. |
| 4-10 | map studio, when {from:4,flag:ch4-done} | Happy | I'm going to sleep for a week. In my car. With the headset on. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Scared | Rack two is still missing. Forty costumes. The actors are filming in bathrobes. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Scared | Last thing on my radio before the static was the Stage 7 fog machine. It turned itself on. |
| 3 | scene ch3End | Scared | (on the radio) ...kkkt... Stage 7! The big door just unlocked itself! From the INSIDE! Is that bad? That feels bad. |
| 4 | scene ch4Gate | Scared | TNB! TNB! The rack! Rack two! It's GONE. |
| 4 | scene ch4Gate | Scared | It was right there in Stage 7. Then the fog machine turned itself on, and the lights went out, and things started CLAPPING. |
| 4 | scene ch4End | Happy | WRAP PARTY AT CRAFTY! Toni made a cake! It's shaped like a clapper! It's not clapping! |

### Dana (10)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map studio, base | Scared | Dana Park. Director. First feature. Please don't ask me how it's going. |
| 4-10 | map studio, when {from:4,flag:ch4-done} | Proud | We got the shot. All of them. Even the one with the horse. |
| 4-10 | map studio, when {from:4,flag:ch4-done} | Loving | Tell TNB the costumes looked incredible. Tell him I said incredible. Tell him twice. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Scared | Without wardrobe there's no shoot. Without a shoot there's no movie. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Sad | Without a movie I go back to directing car commercials. I love cars. I don't love talking cars. |
| 4 | scene ch4Gate | Sad | Dana Park. Director. First feature. Without wardrobe there's no shoot. Without a shoot there's no movie. |
| 4 | scene ch4Gate | Unimpressed | And the Backlot is full of little grumpy things. One of them ate a cue card. One of them is clapping at the horse. |
| 4 | scene ch4End | Happy | The rack! The costumes! We can shoot! We're shooting! That's a WRAP on today, everybody! |
| 4 | scene ch4End | Proud | TNB, the studio wants you to have this. Gold-plated. It's the steamer from the lot’s very first wardrobe department. |
| 4 | scene ch4End | Happy | And crew jackets. Wrap Party Jackets. Only the crew gets one. You're crew now. Even the dog. |

### Bernadette (23)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map oakpark, base | Proud | Bernadette. Neighborhood Watch Captain, nineteen years. Nothing gets past me. |
| 2-10 | map oakpark, base | Angry | Except squirrels. I'm working on it. |
| 6-10 | map oakpark, when {from:6,flag:ch6-done} | Proud | Case closed. I've filed my report. With myself. I approved it. |
| 6-10 | map oakpark, when {from:6,flag:ch6-done} | Proud | I said they were organized. Nobody believed me. Write that down. |
| 6-10 | map oakpark, when {from:6,flag:ch6-done} | Loving | You're a good neighbor, Tom. So is the dog. Mostly the dog. |
| 6 | map oakpark, when {chapter:6,notFlag:ch6-done,flag:ch6-park} | Proud | The lookouts first. Playground, garden, picnic tables. Then that dog of yours digs. |
| 6 | map oakpark, when {chapter:6,notFlag:ch6-done,flag:ch6-park} | Surprised | Then the tree. There's a knock. I have only ever heard parts of it. |
| 6 | scene ch6Park | Angry | Halt. Neighborhood Watch. State your business. |
| 6 | scene ch6Park | Proud | I know who you are. You water your drought garden. Everybody knows. |
| 6 | scene ch6Park | Proud | Bernadette. Neighborhood Watch Captain, nineteen years. And I'll say it, because nobody else will. |
| 6 | scene ch6Park | Scared | The squirrels are organized. |
| 6 | scene ch6Park | Angry | Lookouts in the playground. A spy in the community garden. Somebody at the picnic tables stuffing their cheeks with anything that's not nailed down. |
| 6 | scene ch6Park | Surprised | And it all goes up THAT tree. The Old Oak. There's a little door in the trunk. I've heard a secret knock. Only bits of it. |
| 6 | scene ch6Park | Proud | Clear out those lookouts and your dog can dig. I'll be here. With my clipboard. |
| 6 | scene ch6End | Proud | Neighborhood Watch Captain’s report: case closed. |
| 6 | scene ch6End | Proud | I'd like it noted that I was right. |
| 6 | scene ch6End | Proud | And these. Neighborhood Watch Vests. I give out one every nineteen years. Today I'm giving out three. Even the dog. |
| 8 | scene ch8Block | Proud | Tom. Good. Neighborhood Watch Captain, potluck committee chair. Forty RSVPs. Thirty-nine dishes. One bread guy. |
| 8 | scene ch8Block | Angry | Every pilot light on 2nd Avenue went out at noon. Every one. Including mine. I had a casserole IN there. |
| 8 | scene ch8Block | Angry | They said it's the weekend. I said it's the POTLUCK. They hung up. I've filed a report. With myself. |
| 8 | scene ch8Block | Proud | The barn? It's been chained up for sixty years. Here. Committee key. I'm the committee. We're closing the boulevard for the tables. Bread by six. |
| 8 | scene ch8End | Proud | Forty loaves. Six o’clock. On the dot. Potluck committee report: we're a success. |
| 8 | scene ch8End | Proud | The gumbo is hot. The casserole is hot. Everything is hot. I'd like it noted. |

### Juniper (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map coffee, base | Happy | Welcome to Golden Hour. Every hour is golden hour if you believe. |
| 2-10 | map coffee, base | Proud | Our oat milk is oat-adjacent. |
| 2-10 | map coffee, base | Happy | Your name is Tom? I wrote TAM. It's basically the same. |

### Kenji (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map ramen, base | Happy | Irasshaimase! Welcome! |
| 2-10 | map ramen, base | Happy | Tom-san, your Japanese is very good. |
| 2-10 | map ramen, base | Loving | It's not. But you're trying very hard, and I respect that. |

### Sage (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map juicebar, base | Happy | Welcome. Breathe in. Now order. |
| 2-10 | map juicebar, base | Happy | We opened in March. The pupuseria next door has been here since 1994. We're learning a lot. |
| 2-10 | map juicebar, base | Unimpressed | Today's special is celery. Doña Carmen says that's not a meal. She's right. |

### Marguerite (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map wardrobe, base | Proud | Backlot Wardrobe. If it was worn on screen, it lived here first. |
| 2-10 | map wardrobe, base | Surprised | You're Tom? TNB's Tom! He found a shoe for us once. A lead actor's shoe. Four minutes before the take. |
| 2-10 | map wardrobe, base | Loving | We still talk about the shoe. Tell him there's always a rack here with his name on it. |

### Dolores (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map cinema, base | Proud | Welcome to the Starlite. Built in 1931. The popcorn is newer. A little. |
| 2-10 | map cinema, base | Proud | I have run the projector here for forty years. I've seen every movie twice. |
| 2-10 | map cinema, base | Happy | Tonight it's a horror double feature. Your boyfriend would love it. You'd watch it through your fingers. |

### Dash (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map boards, base | Unimpressed | Board Room. We sell boards. We also sit on them. |
| 2-10 | map boards, base | Proud | TNB? Longboard guy? He bombed Fargo Street once. No brakes. Legend. |
| 2-10 | map boards, base | Happy | If you see him, tell him the wheels he ordered came in. The green ones. |

### Sol (23)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map lacab, base | Happy | Angel City Cab Co. I'm Sol. Sal's cousin. Also one cab. |
| 2-10 | map lacab, base | Unimpressed | Cab eight. Sal has cab seven. We don't talk about what happened to the other six. |
| 2-10 | map lacab, base | Unimpressed | I go to the airport, the airport, and sometimes the airport. |
| 5 | cab flight to ch5 | Unimpressed | Airport. Your young man fixed my visor. He made me promise to drive careful. So I'm going the speed limit. Everybody hates it. |
| 7 | cab flight to ch7 | Unimpressed | LAX. I'm taking the long way. There are squirrels on the short way. |
| 9 | cab flight to ch9 | Unimpressed | Airport. No eating in my cab. I can smell the potluck on you. It smells amazing. Still no. |
| 1-10 | cab east | Happy | Airport. Love it. We'll be there in twenty minutes. Or two hours. Nobody knows. |
| 1-10 | cab east | Proud | Long Island? Sure. I know a shortcut. It's not shorter, but it's mine. |
| 1-10 | cab east | Unimpressed | Seat belt, please. It's decorative, but I like when people try. |
| 1-10 | cab east | Proud | Airport run. Cab traffic, cab snacks, cab opinions. All included. |
| 1-10 | cab east | Unimpressed | East we go. Don't mind the ketchup stain. It's from last Tuesday. |
| 1-10 | cab east | Happy | Heading home? Say hi to the Atlantic for me. The right ocean. |
| 13 | scene ch13Open | Unimpressed | Tom. Sit. Not that chair. That chair is Sal’s. I keep it warm for him out of spite. |
| 13 | scene ch13Open | Unimpressed | Okay. Sal and I are cousins. You know that. What you don’t know is what we do between airport runs. |
| 13 | scene ch13Open | Sad | Letters. Eleven years of letters, Snail Mail to Los Angeles, in the trunks of cabs. Nobody ever opened a bag. Nobody ever asked why two cab companies need a hundred sacks of stamps. |
| 13 | scene ch13Open | Proud | A dispatch network. We call it the Network. We never came up with a better name. |
| 13 | scene ch13Open | Happy | Sal. I have Tom, his sister, two nieces, a boyfriend and a dog in my lobby. Say hi. |
| 13 | scene ch13Open | Proud | The Sub-Rail. Sal and I bored a tunnel under the Layover, from both coasts, for a hobby. It was supposed to open in 2031. It meets in the middle, right under the dome. |
| 13 | scene ch13Open | Proud | We got a very good deal on a drill. |
| 13 | scene ch13Open | Happy | The drill. We call her the Dual-Coast Drill. The kids at the depot call her the Worm. She doesn’t love it. |
| 13 | scene ch13Open | Proud | I need dispatchers. Two of them. Radio only. Somebody has to read me the tunnel. |
| 13 | scene ch13Open | Proud | Thirty years. Never lost a passenger. Found two in the trunk. Both were fine. |
| 13 | scene ch13Open | Unimpressed | Out the door, the Metro stairs on the boulevard. Past the turnstile, there’s a door that says EMPLOYEES ONLY. That’s you. You’re employees now. |

### Mrs. Alvarez (6)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Angry | TEN. Ten people in a two-bedroom house from 1912. One bathroom. ONE. |
| 2-10 | map casa, base | Angry | Tony, feet off my table! Kevin, the baby isn't a football! Mateo, give Abuela the remote! ...Tom, mijo, sit. If you can find a chair. |
| 2-10 | map casa, base | Unimpressed | Everybody says, 'Mama, the house is so full of love.' It's full of SOMETHING. Take tamales. Please. I need the room in my fridge. |
| 12 | scene ch12Alvarez | Surprised | ...NO. I said no. Why is everyone in my kitchen? Is that a mother running laps with two little girls? |
| 12 | scene ch12Alvarez | Proud | ...Okay. That one can stay. |
| 12 | scene ch12Alvarez | Loving | Take lemons. Take ALL the lemons. Every yard in this city has too many and somebody always leaves them on my step. |

### Don Beto (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Happy | I've been in this chair since the game started. Which game? Yes. |
| 2-10 | map casa, base | Happy | Ten people. I counted once. Then I lost count. Then I took a nap. |
| 12 | scene ch12Alvarez | Angry | ...and that is a FOUL! That is a foul! Who has the remote? |

### Tony (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Unimpressed | Me and Yesenia are saving for our own place. In this market? We'll be here until Mateo goes to college. |
| 2-10 | map casa, base | Sad | The two houses next door sold for more than this whole block cost in 1990. My mom isn't okay about it. |
| 12 | scene ch12Alvarez | Surprised | Why is there a woman running around my table? Why is it a good idea? It’s a very good idea. |

### Yesenia (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Surprised | Sofi, no. Sofi. SOFI. ...She bit something. We don't have a dog. I don't know what she bit. |
| 2-10 | map casa, base | Unimpressed | Baby Lupita is finally asleep. If you wake her, you're moving in. |

### Claudia (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Unimpressed | Night shift nurse. I sleep in the bathtub. It's the only room with a lock. |
| 2-10 | map casa, base | Sad | Until somebody needs the bathroom. Somebody always needs the bathroom. |

### Kevin (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Unimpressed | I share the bunk bed with Uncle Tony's exercise bike. |
| 2-10 | map casa, base | Unimpressed | It's not a metaphor. The bike is on the top bunk. |

### Daisy (4)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Proud | I'm making a documentary about this house. It's a horror movie. |
| 2-10 | map casa, base | Scared | Scene one: the bathroom line. Scene two: who ate Abuela's last concha. |
| 12 | scene ch12Alvarez | Surprised | Tom! Tom! Everybody stopped! Abuela stopped in the middle of saying NO! |
| 12 | scene ch12Alvarez | Happy | Is it okay if I say that was the best thing that has ever happened in our kitchen? |

### Mateo (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Happy | Truck! TRUCK! |
| 2-10 | map casa, base | Happy | Ba! Ba! ...Truck. |

### Sofi (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map casa, base | Angry | I'm a dinosaur. RAWR. |
| 2-10 | map casa, base | Happy | Abuela says no more dinosaurs inside. I'm a quiet dinosaur. rawr. |

### TNB (21)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map lofts, base | Happy | Well, well, well... |
| 2-10 | map lofts, base | Loving | Hey, you. Did you eat? I made a bowl. I also made a bowl. Pottery joke. |
| 2-10 | map lofts, base | Proud | Welcome to the loft. Kiln by one window, wheel by the other, garment bags everywhere else. Spring Street, baby. |
| 2-10 | map lofts, base | Loving | Take my jacket. It gets cold up in Griffith Park at night, and a cold Tom is a no-go. |
| 2-10 | map lofts, revisit | Proud | Took the longboard down Spring Street this morning. Smooth. There's a crack by Fourth Street I've named. |
| 2-10 | map lofts, revisit | Proud | Threw six mugs this morning. The glaze came out of the kiln like sea glass. Come look before you claim one. |
| 2-10 | map lofts, revisit | Happy | Go on, I'll be right here. I'm pot-sitive about it. |
| 2-10 | map lofts, revisit | Loving | Horror movie tonight. You pick. You always pick the scary one and then hold my arm the whole time. |
| 2-10 | map lofts, revisit | Loving | Watered your plants on 2nd Ave. The fern asked about you. I said you're fine. |
| 2-10 | map lofts, revisit | Happy | Rode the train to the clay studio. Forty minutes. Best forty minutes of my day. Met a man who knows every line. |
| 2-10 | map lofts, revisit | Proud | The slime? It just needs someone to mold it. I have more of these. You know I do. |
| 2-10 | map lofts, revisit | Proud | Long day on set. Eleven costume changes. One actor lost a shoe. I found it. I always find it. |
| 2-10 | map lofts, revisit | Loving | Be careful out there. I like you un-cracked. |
| 1-10 | recruit ask | Happy | Heading out? I can come. I have my longboard, a bus pass and a garment bag. I'm ready for anything. Mostly costume emergencies. |
| 1-10 | recruit yes | Happy | Great. Let me grab my jacket. Oh. You have it. Let me grab my other jacket. |
| 1-10 | recruit no | Happy | Okay. I'll be here, throwing bowls. Come back if anything cracks. |
| 1-10 | recruit swap | Happy | Somebody has to hold down the house. I vote the couch, but it has to be a person. |
| 1-10 | recruit chatter | Loving | Tom, your shoelace. No, the other one. Got it. |
| 1-10 | recruit chatter | Happy | Well, well... a foggy canyon at dusk. This is how every horror movie starts. |
| 1-10 | recruit chatter | Happy | If a coyote jumps out at us, I've seen this movie. Stay together. Nobody go in the basement. |
| 1-10 | recruit chatter | Loving | After this, clay. Any two colors. I'll make them get along. |

### Jojo (8)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 3-5 | map lofts, base | Surprised | Oh. Hi. You must be Tom. I'm Jojo. TNB's sister. |
| 2-10 | map lofts, lines | Loving | He talks about you a lot. Mostly "Tom said" and then a very long pause. Pottery pause. I know it well. |
| 2-10 | map lofts, lines | Happy | I stopped by to borrow a mug. That was a while ago. I'm still on the couch. It's a good couch. |
| 2-10 | map lofts, lines | Unimpressed | We play frisbee golf on Sundays. He calls it a friendly round. I call it a round. |
| 2-10 | map lofts, revisit | Happy | Sunday. Frisbee golf. Eighteen holes. He stops for a snack at every one. I let him. I have time. |
| 2-10 | map lofts, revisit | Proud | My brother made this mug. It is a very good mug. Don't tell him I said that. He will make me three more. |
| 2-10 | map lofts, revisit | Happy | No rush on anything. That's kind of my whole thing. |
| 2-10 | map lofts, revisit | Loving | Nice to finally have you in the family. Or near it. We'll see how the Sundays go. |

### Priya (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map tower, lines | Unimpressed | 34th floor. From my desk I can see Griffith Park. I've never been to Griffith Park. |
| 2-10 | map tower, lines | Happy | My dog is named Bagel. He has more friends in this building than I do. |
| 2-10 | map tower, lines | Unimpressed | The pool is on the roof. Nobody swims. Everyone takes photos of the pool. |

### Miss Odette (7)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map creole, lines | Loving | Sit down, baby. Gumbo's on. It's been on since six. |
| 2-10 | map creole, lines | Proud | My mama opened this kitchen when this stretch was Little New Orleans. Folks came from Louisiana and brought the food. |
| 2-10 | map creole, lines | Loving | Pralines by the register. Take two. One for you, one for that boyfriend who keeps coming in for the red beans. |
| 2 | map creole, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Unimpressed | Stirring. Stirring. |
| 2 | map creole, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | The gumbo never has to be done, baby. Isn't that nice? Nothing ever has to be done. |
| 2 | map creole, when {chapter:2,flag:ch2-clear} | Proud | That smog had me stirring one pot for an hour. Best roux I ever made, though. |
| 2 | map creole, when {chapter:2,flag:ch2-clear} | Loving | Sit. Eat. You and that boyfriend earned a bowl today. |

### Doña Carmen (13)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map pupuseria, lines | Happy | Bienvenidos! Pupusas revueltas, and curtido on the side. Curtido isn't optional. |
| 2-10 | map pupuseria, lines | Proud | I came from San Salvador in 1991. This comal came with me in a suitcase. |
| 2-10 | map pupuseria, lines | Happy | The juice bar next door asked me what a pupusa is. I gave them three. Now they ask every day. |
| 2 | map pupuseria, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Scared | The pupusas are fine. Everything is fine. |
| 2 | map pupuseria, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Sad | It's always this afternoon. Why'd I ever flip them? |
| 2 | map pupuseria, when {chapter:2,flag:ch2-clear} | Proud | I left them on the comal the whole time. They came out perfectly crispy, actually. |
| 2 | map pupuseria, when {chapter:2,flag:ch2-clear} | Happy | Don't tell the juice bar. They'll want the recipe. |
| 12 | scene ch12Carmen | Surprised | A crack runs up the amber like sugar glass. Then another. Then it falls away in warm gold flakes. |
| 12 | scene ch12Carmen | Surprised | ...and THEN I told the man, the loroco is not optional. Tom! When did you get here? Why is everything so quiet? |
| 12 | scene ch12Carmen | Sad | Where did my pupusas go? |
| 12 | scene ch12Carmen | Sad | I was what? I had a whole sentence. I lost the sentence. It was a good sentence. |
| 12 | scene ch12Carmen | Angry | That man stood on my step and said my sign was “too busy.” I said the sign is busy because the food is good. |
| 12 | scene ch12Carmen | Loving | Go next door. The Alvarez house. They didn’t get any pupusas today. Take these. Feed the children first. The grown-ups will pretend they’re not hungry. |

### Jordan (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map jordansam, lines | Proud | We took it down to the studs. Then we put the studs back. Very authentic. |
| 2-10 | map jordansam, lines | Happy | Have you tried the juice bar on Jefferson? It's so nice the neighborhood is finally getting... options. |
| 2-10 | map jordansam, lines | Proud | We painted it black. The neighbors call it the haunted house. We're choosing to take that as a compliment. |

### Sam (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map jordansam, lines | Happy | Mrs. Alvarez brought us tamales. We posted them. We tagged her. She doesn't have Instagram. |
| 2-10 | map jordansam, lines | Scared | Our mortgage is, um. We don't say the number out loud. The house can hear. |
| 2-10 | map jordansam, lines | Unimpressed | Everyone else on this street rents. We think about that a lot. Mostly on podcasts. |

### Dakota (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map dakota, lines | Proud | We're restoring the original 1912 windows. It's a whole thing. |
| 2-10 | map dakota, lines | Surprised | Mr. Washington told us the windows are older than his father. He was very serious about it. |
| 2-10 | map dakota, lines | Unimpressed | Every house on this street has a story. Ours is: the plumbing. |

### Ryan (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-10 | map dakota, lines | Scared | Baby Hudson is asleep. Please whisper. Please. I'm begging. |
| 2-10 | map dakota, lines | Unimpressed | We moved from the Westside for the space. And the character. Mostly the price. Which was still a lot. |
| 2-10 | map dakota, lines | Angry | I work from home. Home is very loud on the Alvarez side. I bought noise-canceling headphones. They lost. |

### Penny (41)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | shop intro | Happy | Welcome to Penny's Pockets. I sell things for pockets. Also things for people. |
| 1-10 | shop intro | Happy | Gear for the whole family, snacks for fights, and a few things that go POP. Gently. |
| 1-10 | shop intro | Happy | Got something to sell? I buy almost anything. Not Steve. Never Steve. |
| 1-10 | shop hello | Happy | Back again! The coins missed you. |
| 1-10 | shop hello | Happy | Browse all you like. Browsing is free. Buying is better. |
| 1-10 | shop hello | Proud | Fresh stock. Same Penny. |
| 1-10 | shop bought | Proud | Pleasure doing business. |
| 1-10 | shop bought | Happy | Good choice. I'd have picked that one too. |
| 1-10 | shop bought | Happy | Into the pockets it goes. |
| 1-10 | shop bought | Happy | Ka-ching. That's my favorite sound. |
| 1-10 | shop sold | Happy | Sold! I know just the shelf. |
| 1-10 | shop sold | Proud | A fine addition to my collection. |
| 1-10 | shop sold | Loving | Half price, full gratitude. |
| 1-10 | shop broke | Sad | Not enough coins. Grump Hollow pays, in a way. |
| 1-10 | shop broke | Sad | Short on coins. The monsters up north are carrying some. |
| 1-10 | shop keep | Loving | I could never. That's a family thing. |
| 1-10 | shop keep | Proud | Not for sale. Some things are priceless. |
| 1-10 | shop keep | Loving | Put that back in your pocket. It's special. |
| 1-10 | shop fresh | Happy | New shipment! The crates are still warm. Come see the good shelf. |
| 1-10 | shop fresh | Loving | Fresh stock, and it's a big step up. I'm a little emotional. |
| 1-10 | shop fresh | Proud | The top shelf, finally. I've been saving it for you. Look. |
| 1-10 | shop tab healing | Happy | Snacks and fixes. Eat them in battle or from the menu. |
| 1-10 | shop tab battle | Unimpressed | For monsters only. Don't pop the poppers in here. |
| 1-10 | shop tab sell | Unimpressed | Half price, no haggling. Okay, a little haggling. No. |
| 1-10 | shop shelf gear | Proud | The new shelf: sturdier, shinier, still gently priced. Twice the coins, more than twice the gear. |
| 1-10 | shop shelf gear | Proud | The grown-up shelf. Gear for people who actually fight things. |
| 1-10 | shop shelf gear | Proud | Top shelf. Everything up here has a story and a warranty. Sort of. |
| 1-10 | shop shelf healing | Happy | Bigger bandages and a real picnic. Same pockets, more fixing. |
| 1-10 | shop shelf healing | Unimpressed | The med kit has a flashlight now. Don't ask me why that helps. |
| 1-10 | shop shelf healing | Happy | Feast-grade snacks. Deedee called to approve them personally. |
| 1-10 | shop shelf battle | Happy | The Confetti Cannon is new. Please aim it away from my shelves. |
| 1-10 | shop shelf battle | Proud | Fireworks. Legally a gray area. Emotionally, a gift. |
| 1-10 | shop shelf battle | Proud | The Finale Rocket. Hold it like it owes you money. |
| 13 | scene ch13After | Sad | (through the glass) Tom! I’m so sorry! Nickel, hold up the drawer! I’ve got mine! |
| 13 | scene ch13After | Scared | (through the glass) One. Two. Don’t think about the interest. Three. |
| 13 | scene ch13After | Loving | Nickel. |
| 13 | scene ch13After | Sad | I was saving for a boat. |
| 13 | scene ch13After | Proud | That’s why it was a savings. |
| 13 | scene ch13After | Sad | Tom. I’m sorry. I sold him the coins. I took the money and I didn’t ask. |
| 13 | scene ch13After | Sad | It was a very good drawer. |
| 13 | scene ch13After | Loving | That’s a very nice way to say it. |

### Nickel (46)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-10 | shop intro | Happy | Welcome to Nickel's. I'm Penny's cousin. Better weather, same prices. |
| 1-10 | shop intro | Happy | Gear for the whole family, snacks for fights, sunscreen for the soul. |
| 1-10 | shop intro | Happy | Got something to sell? I buy almost anything. Penny warned me about Steve. |
| 1-10 | shop hello | Happy | Back again! Did you find parking? Nobody finds parking. |
| 1-10 | shop hello | Happy | Browse all you like. Browsing is free in Los Angeles. Nothing else is. |
| 1-10 | shop hello | Proud | Fresh stock. Same Nickel. |
| 1-10 | shop bought | Proud | Pleasure doing business. |
| 1-10 | shop bought | Happy | Good choice. Very you. |
| 1-10 | shop bought | Happy | Into the pockets it goes. |
| 1-10 | shop bought | Happy | Ka-ching. That one is for parking. |
| 1-10 | shop sold | Happy | Sold! I know just the shelf. |
| 1-10 | shop sold | Loving | Half price, full gratitude. |
| 1-10 | shop sold | Happy | That's very vintage now. |
| 1-10 | shop broke | Sad | Not enough coins. Griffith Park pays, in a way. |
| 1-10 | shop broke | Sad | Short on coins. The monsters up in the park are carrying some. |
| 1-10 | shop keep | Loving | I could never. That's a family thing. |
| 1-10 | shop keep | Proud | Not for sale. Some things are priceless. |
| 1-10 | shop keep | Proud | Keep that one. Trust me. |
| 1-10 | shop fresh | Happy | New shipment! It came in on a truck that found parking. Come look. |
| 1-10 | shop fresh | Happy | Fresh stock, and a real upgrade. Penny will be so jealous. |
| 1-10 | shop fresh | Proud | The top shelf is finally stocked. Worth the traffic. |
| 1-10 | shop tab healing | Happy | Snacks and fixes. Eat them in battle or from the menu. |
| 1-10 | shop tab battle | Unimpressed | For monsters only. The coyotes have been warned. |
| 1-10 | shop tab sell | Unimpressed | Half price, no haggling. This isn't the Rose Bowl flea market. |
| 1-10 | shop shelf gear | Proud | The new shelf: sturdier, shinier, still reasonable by Los Angeles standards. |
| 1-10 | shop shelf gear | Proud | The grown-up shelf. Gear for people who actually fight things. |
| 1-10 | shop shelf gear | Proud | Top shelf. Everything up here has a story and an agent. |
| 1-10 | shop shelf healing | Happy | Bigger bandages and a real picnic. Same pockets, more fixing. |
| 1-10 | shop shelf healing | Unimpressed | The med kit has a flashlight now. Very LA. It has a ring light too. |
| 1-10 | shop shelf healing | Happy | Feast-grade snacks. Catered, practically. |
| 1-10 | shop shelf battle | Happy | The Confetti Cannon is new. Please aim it away from the palm trees. |
| 1-10 | shop shelf battle | Proud | Fireworks. Legally a gray area. Emotionally a gift. |
| 1-10 | shop shelf battle | Proud | The Finale Rocket. Hold it like a parking ticket. |
| 13 | scene ch13Depot | Scared | Tom! Good. Okay. Before you go in, I have to tell you something, and I have to say it fast, because Penny made me promise. |
| 13 | scene ch13Depot | Sad | A man in a long coat bought gold coins from our shops. For years. Paid double. Never took his hat off. |
| 13 | scene ch13Depot | Sad | We didn’t know. We thought he was a collector. We took the money. And we kept the best coins in the back, in case he ever paid triple. |
| 13 | scene ch13Depot | Sad | Penny called on the Network from under the dome. She said, “Tell Tom we’re sorry.” And then she said, “The drawer is under the counter.” |
| 13 | scene ch13Depot | Sad | Eleven coins. Hers and mine. The last of the old gold. They were supposed to be a retirement. |
| 13 | scene ch13Depot | Proud | Sal says gold remembers being warm. If amber is warmth that got stuck, then gold can give it somewhere to go. He says. I don’t know. He’s a cab driver. |
| 13 | scene ch13Depot | Loving | I’m giving up a drawer. It’s the best drawer I ever had. Go. I’ll bring them down behind you. Sol’s driving me to the second mile marker and making me run. |
| 13 | scene ch13Depot | Proud | Yes, I do. Somebody gave me a shop. I’d like to be somebody who gave something back. |
| 13 | scene ch13After | Happy | Tom! Sol drove me to the second mile marker and made me run. I have never been so tired and so right. |
| 13 | scene ch13After | Proud | Eleven coins. Mine are in this bag. Penny’s are on the other side of that wall. |
| 13 | scene ch13After | Proud | Eleven coins. Hers and mine. On three. |
| 13 | scene ch13After | Loving | Penny. |
| 13 | scene ch13After | Unimpressed | You don’t know how to drive a boat. |

### Long coat (1)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 11 | scene ch11Vance | Unimpressed | Hello, Tom. |

### Julian Vance (10)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 11 | scene ch11Vance | Sad | Julian Vance. Gate agent, in a way. I have stood at every gate that ever closed. |
| 11 | scene ch11Vance | Proud | You opened every door I couldn’t. Thank you for flying nowhere, Tom. |
| 11 | scene ch11Vance | Sad | I stopped every town on Earth. At its happiest afternoon. A birthday that never ends. The last day of summer. Nobody is sad. Nobody is late. |
| 11 | scene ch11Vance | Sad | Long Island and Los Angeles kept moving because you kept flying. Every flight moved them a little. I wasn’t quick enough to stop you. |
| 11 | scene ch11Vance | Loving | Maybe. But it stays safe. That is all I have ever wanted for anyone. |
| 11 | scene ch11Vance | Loving | Everyone, safe, in the good part, forever. Come in. Stay. Nobody here has ever been lost. |
| 11 | scene ch11Vance | Sad | ...Then I’ll make the last announcement. |
| 11 | scene ch11Vance | Sad | Someone has to. |
| 11 | scene ch11Vance | Angry | He lifts his hat. Behind his head, the big door’s gold clock spins, and every flap in the terminal clicks at once. |
| 11 | scene ch11Vance | Angry | FINAL CALL. |

### Marlowe (15)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 12 | scene ch12Marlowe | Happy | Love it. Love the block. Love the lemons. So many lemons. What is that, a jacaranda? Needs less. |
| 12 | scene ch12Marlowe | Proud | Marlowe. Monochrome Marlowe. I fix places. This place has a lot going on. Too much color, too many porches, a dog doing something on a lawn. |
| 12 | scene ch12Marlowe | Unimpressed | That’s the problem with a neighborhood. Notes. |
| 12 | scene ch12Marlowe | Unimpressed | He lifts a clipboard. The top page says NOTES: LESS. He snaps his fingers. |
| 12 | scene ch12Marlowe | Proud | I can take the pink, the yellow, and the music out of that window. Mr. Vance likes it quiet. Quiet is safe. Quiet sells. |
| 12 | scene ch12Marlowe | Unimpressed | I don’t put things back. I take notes. Anyway, Mr. Prime will handle the intersection. Do take a look at the traffic. It’s very stationary. |
| 12 | scene ch12Marlowe | Happy | He walks off into the grey, humming a jingle that never resolves. |
| 12 | scene ch12Prime | Angry | Look at that. You put the neighbors back. Very warm. Very busy. Very much not what I asked for. |
| 12 | scene ch12Prime | Proud | Notes. This intersection has no flow. Let me introduce our new Head of Traffic. |
| 12 | scene ch12Prime | Unimpressed | Mr. Prime! Please give them a moment to rethink the neighborhood. |
| 12 | scene ch12Prime | Unimpressed | It’s not angry. It’s stuck. Stuck is very quiet, and Mr. Vance likes quiet. Do be quick. The notes are due at five. |
| 12 | scene ch12After | Surprised | Love it. Hate it. Love it. Notes withdrawn. |
| 12 | scene ch12After | Happy | I’ll be Downtown, at the Movie Palace. Come by. I’ll have notes for the rest of the family. |
| 12 | scene ch12After | Proud | Long Island is under glass, you know. A very safe house. Your mother is in the kitchen. She’s making a crisp. She’s been making it for hours. |
| 12 | scene ch12After | Unimpressed | Notes are due at five. |
