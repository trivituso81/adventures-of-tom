# NPC emotion index: chapters 1 to 5 (2026-11-10, npcemo1)

Fact: every line a person (not a monster) says in chapters 1 to 5 outside the cast story scenes, tagged with one of the 8 emotion-sheet moods. Behind the scenes only: the game does not load it. It is the list a later change uses to show an emotion pose frame per line.

- Source of truth: `docs/npc-emotion-lines.tsv` (columns: chapters, file, line, character, where, mood, text). Correct a tag by changing the one mood word there.
- Check: `python3 tools/npc-emotion-check.py` (mood valid, exact text still in its file, one mood per speaker and text). `--fix` refreshes line numbers after code moves.
- Covered: map NPC talk (townsfolk and family, first visit, revisit and chapter variants that can show in chapters 1 to 5), townsfolk lines inside ch1-5 story scenes, recruit and follower chatter, Penny and Nickel shop lines, the two cab drivers, ch4 and ch5 puzzle replies.
- Not covered: cast lines in story scenes (already tagged in `docs/emotion-index-lines.tsv`, live in the game), monsters and bosses (no emotion sheets), narration from signs and objects, battle barks.
- `chapters`: where the line can show. `1-5` Long Island anytime; `2-5` Los Angeles (first reached in chapter 2); single numbers are chapter variants.
- Who has emotion sheets today: Tom, TNB, Grace, Rose, Amy, Justin, Deedee, Boppy, Olivia, Aunt Ellie (Nara has her own). Every townsperson here (Pruitt, Penny, Mr. Washington and the rest) needs an emotion sheet before their tags can show a pose.

## Totals

| Mood | Lines |
|---|---|
| Happy | 72 |
| Loving | 38 |
| Sad | 7 |
| Angry | 11 |
| Scared | 11 |
| Surprised | 27 |
| Proud | 68 |
| Unimpressed | 54 |
| **All** | 288 |

## Lines by character

### Pip (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map town, base | Happy | I'm taking my pet rock for a walk. |
| 1-5 | map town, base | Unimpressed | He's shy. Please don't make eye contact. |
| 1-5 | map town, base | Proud | Excellent. He's already learned 'stay'. |

### Moss (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map town, base | Happy | I asked a tree for directions. |
| 1-5 | map town, base | Surprised | It said nothing. Very mysterious. |
| 1-5 | map town, base | Unimpressed | I think I'm barking up the wrong tree. |

### Dot (8)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map town, base | Proud | This town has ten doors and two gaps in the trees. |
| 1-5 | map town, base | Proud | I've counted them seventeen times. |
| 1-5 | map town, base | Happy | Tomorrow I'm moving on to windows. |
| 5-5 | map town, when {from:5} | Surprised | Ten doors and THREE gaps in the trees now. Somebody opened one by the school. |
| 5-5 | map town, when {from:5} | Unimpressed | I had to start all over. I'm at four hundred and six. |
| 1 | map town, when {chapter:1,flag:ch1-tin} | Happy | You got the tin back? Ten doors, two gaps, one pie tin. All accounted for. |
| 1 | map town, when {chapter:1,flag:ch1-theft} | Surprised | A mud blob ran through the Square with a pie tin. One blob. One tin. I counted. |
| 1 | map town, when {chapter:1,flag:ch1-theft} | Proud | It went north. Into the gap in the trees. Gap number one. |

### Gus (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map row, base | Proud | I'm training for the annual sit-down. |
| 1-5 | map row, base | Happy | My coach is a bench. |
| 1-5 | map row, base | Loving | We have a very supportive relationship. |

### Bean (7)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map row, base | Proud | I'm not lost. I'm collecting wrong turns. |
| 1-5 | map row, base | Angry | That pond up north owes me an apology. |
| 1-5 | map row, base | Unimpressed | Long story. Short socks. |
| 1 | map row, when {chapter:1,flag:ch1-theft,notFlag:ch1-tin} | Surprised | A mud blob just ran past me carrying a pie. |
| 1 | map row, when {chapter:1,flag:ch1-theft,notFlag:ch1-tin} | Unimpressed | I didn't stop it. I collect wrong turns, not pies. |
| 3 | map row, when {chapter:3,flag:ch3-boppy} | Surprised | Boppy went by with a fishing rod and a jar of peppers. |
| 3 | map row, when {chapter:3,flag:ch3-boppy} | Proud | He was walking slower than me. Nobody walks slower than me. I collect slow walks too, now. |

### Reel (7)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map pier, base | Happy | Bait shack is open. Worms, minnows, and a sandwich I'm not selling. |
| 1-5 | map pier, base | Happy | Your father has been fishing this pier since before the pier. He catches something every day. The size, I round down. |
| 1-5 | map pier, base | Unimpressed | They say a catfish lives out there older than the boards. I say they say a lot. |
| 3-5 | map pier, when {from:3,flag:ch3-clear} | Surprised | Your father caught Old Iron-Gill? And let him GO? Forty years of telling that story, and now it's true. |
| 3-5 | map pier, when {from:3,flag:ch3-clear} | Loving | He came by the shack this morning. The fish, not your father. Just floated there. I think he wanted to say hello. |
| 3 | map pier, when {chapter:3,flag:ch3-jar} | Surprised | You saw it? Old Iron-Gill? Forty years I have run this shack. I thought it was a story. |
| 3 | map pier, when {chapter:3,flag:ch3-jar} | Unimpressed | It went west, into the marsh. The Whispering Marsh. The reeds talk out there. Mostly nonsense. |

### Principal Pruitt (5)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map schoolyard, base | Proud | Principal Pruitt. Thirty-one years at Long Island Elementary. I've seen everything. Not tonight, though. Tonight is new. |
| 5-5 | map schoolyard, when {from:5,flag:ch5-done} | Proud | Thirty parents. Zero tears. One very well-behaved pen. Best conference night in thirty-one years. |
| 5-5 | map schoolyard, when {from:5,flag:ch5-done} | Happy | Come to Field Day, Tom. Amy runs the relay. Amy always runs the relay. |
| 5 | map schoolyard, when {chapter:5,notFlag:ch5-done,flag:ch5-pruitt} | Angry | Conferences start at seven. SEVEN. The bells say otherwise. The bells are wrong. |
| 5 | map schoolyard, when {chapter:5,notFlag:ch5-done,flag:ch5-pruitt} | Scared | Clear the rooms, set the hallway clocks to seven, and the Cafetorium will open. I hope. |

### Mr. Delgado (4)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map schoolyard, base | Proud | I'm Marco’s dad. Marco says Mrs. Gregori is the toughest teacher in the whole school. |
| 5 | map schoolyard, base | Loving | Marco also says she's his favorite. Please don't tell Marco I told you. |
| 5-5 | map schoolyard, when {from:5,flag:ch5-done} | Proud | Marco is reading at a third-grade level! Mrs. Gregori showed me the chart. There was a chart! |
| 5-5 | map schoolyard, when {from:5,flag:ch5-done} | Loving | I cried a little. In the minivan. Don't tell Marco. |

### Mrs. Kowalski (4)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map school, base | Proud | Kowalski. PTA president. I brought nine hundred cookies and a laminator. |
| 5 | map school, base | Angry | The sign-up sheet RAN AWAY. On little paper legs. I've never been so offended. |
| 5-5 | map school, when {from:5,flag:ch5-done} | Proud | Thirty conferences, nine hundred cookies, one laminator. Everything went on schedule. MY schedule. |
| 5-5 | map school, when {from:5,flag:ch5-done} | Happy | Tell Mrs. Gregori her bulletin board is the best in the building. Don't tell the other teachers. |

### Grandpa Ike (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map school, base | Proud | I'm here for my grandson. He's in the second grade. I was in the second grade here in 1956. |
| 5 | map school, base | Unimpressed | The bells were wrong in 1956 too. Nobody fixed them. Things were simpler. |
| 5-5 | map school, when {from:5,flag:ch5-done} | Surprised | They fixed the bells! In my lifetime! I'm going to tell everyone at the diner. |

### Mr. Halverson (5)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 5 | map school, base | Unimpressed | Halverson. Fourth grade. I'm hiding in the staff room. That's allowed. It's in the contract. |
| 5 | map school, base | Unimpressed | If you're hungry, the fridge is a minefield. Every lunch in there has a name on it. Read the labels. |
| 5-5 | map school, when {from:5,flag:ch5-done} | Happy | Conference night is over. I survived. I'm going to sit on this couch until Field Day. |
| 5 | map school, when {chapter:5,notFlag:ch5-done,flag:ch5-snack} | Happy | Deedee’s plate? Oh, everybody waits for Deedee’s plate. She brings one every conference night. |
| 5 | map school, when {chapter:5,notFlag:ch5-done,flag:ch5-snack} | Unimpressed | Don't tell Gary. Gary eats the whole thing. |

### Bun (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map bakery, base | Happy | Welcome! Our bread is emotionally available. |
| 1-5 | map bakery, base | Unimpressed | The baguettes? A little crusty. |
| 1-5 | map bakery, base | Proud | Today's special is yesterday's tomorrow toast. |

### Page (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map library, base | Unimpressed | Please whisper. The dictionaries are sleeping. |
| 1-5 | map library, base | Surprised | Someone shelved a sandwich under 'S'. |
| 1-5 | map library, base | Unimpressed | Technically correct. Deeply concerning. |

### Fern (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map greenhouse, base | Proud | I name every plant here. |
| 1-5 | map greenhouse, base | Happy | They're all called Steve. It saves time. |
| 1-5 | map greenhouse, base | Proud | Except that one. That's Assistant Steve. |

### Kit (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map post, base | Happy | Your parcel is arriving any Tuesday now. |
| 1-5 | map post, base | Surprised | The snails asked for smaller uniforms. |
| 1-5 | map post, base | Proud | I deliver good news. Bad news has to walk. |

### Oolong (5)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map tea, base | Surprised | The kettle has been gossiping again. |
| 1-5 | map tea, base | Happy | It spilled the tea. Literally. |
| 1-5 | map tea, base | Unimpressed | Please mind the dramatic biscuits. |
| 3 | map tea, when {chapter:3,flag:ch3-tea} | Surprised | The kettle is still going on about that man in the long coat. Gold coins. Paying double. |
| 3 | map tea, when {chapter:3,flag:ch3-tea} | Unimpressed | I told it to mind its own business. It's a kettle. It has no business. |

### Luna (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map observatory, base | Proud | I've discovered a new constellation. |
| 1-5 | map observatory, base | Surprised | It's shaped exactly like my laundry. |
| 1-5 | map observatory, base | Unimpressed | Space is asking me to tidy up. |

### Sal (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map taxi, base | Proud | Long Island Taxi. We go anywhere in town. Town is small, so mostly here. |
| 1-5 | map taxi, base | Happy | I have one cab. It's cab seven. Cabs one through six are a dream I'm working on. |
| 1-5 | map taxi, base | Surprised | You just rode with me. You tipped in sourdough starter. Odd. Generous. |

### Justin (11)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map amyhouse, base | Unimpressed | Tom. Hey. Hold this. No, the other end. Don't touch the copper. |
| 1-5 | map amyhouse, base | Loving | Rewiring the hallway. Amy wanted a dimmer. Amy gets a dimmer. |
| 1-5 | map amyhouse, base | Loving | Grace, Rose, come here. Who's Daddy's favorite? Both. Correct. Go get 'em. |
| 1-5 | map amyhouse, revisit | Proud | Long Island born. Country music raised. Don't ask me how. Nobody knows. |
| 1-5 | map amyhouse, revisit | Happy | Big game tonight. If you hear yelling, that's me. If you hear crying, that's also me. |
| 1-5 | map amyhouse, revisit | Surprised | Grace, you were amazing out there. Rose, you were also amazing. Also, why are you sticky? |
| 1-5 | map amyhouse, revisit | Proud | Fixed the porch light, the garbage disposal and the bunk bed. Before lunch. |
| 1-5 | map amyhouse, revisit | Happy | Every country song is about a truck, a dog or a girl. I got a truck and two girls. Living the song. |
| 1-5 | map amyhouse, revisit | Sad | Amy says I never sit down. I sat down once. It was a playoff game. We lost. |
| 1-5 | map amyhouse, revisit | Unimpressed | Watch your step, Tom. That board is loose. I know. It's on the list. |
| 1-5 | map amyhouse, revisit | Loving | Those two girls are the best thing I ever built. And I built that deck. |

### Amy (15)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map amyhouse, base | Happy | Grace! Rose! Did you stretch before all this adventuring? |
| 1-5 | map amyhouse, base | Proud | Tom, I ran eight miles before you woke up. Just stating facts. |
| 1-5 | map amyhouse, base | Unimpressed | Justin is rewiring the hallway. Again. He says hi from the ladder. |
| 1-5 | map amyhouse, revisit | Proud | Race you to the fountain. No? Then I win. |
| 1-5 | map amyhouse, revisit | Loving | Twelve kids in my room, and not one of them as wild as you two. Which I love. |
| 1-5 | map amyhouse, revisit | Surprised | Rose, where are your shoes? Oh. Good. |
| 1-5 | map amyhouse, revisit | Happy | Grace, be nice to the slime. Then beat it. Those are the two rules. |
| 1-5 | map amyhouse, revisit | Unimpressed | Tom, if they come back faster than me, we need to talk. |
| 1-5 | map amyhouse, revisit | Unimpressed | Justin says the hallway light is almost done. It's been almost done since June. |
| 1-5 | map amyhouse, revisit | Unimpressed | Did Boppy give you that cap? Don't let him near the pond. |
| 1-5 | map amyhouse, revisit | Proud | One of my kids read a whole page out loud today. First time. I cried in the supply closet. |
| 1-5 | map amyhouse, revisit | Loving | Rose. Big feelings are allowed. Throwing Lamby isn't. Come here. |
| 1-5 | map amyhouse, revisit | Loving | Grace, you don't have to be the best at it. You have to be the one who keeps going. Okay, now be the best at it. |
| 5-5 | map amyhouse, when {from:5,flag:ch5-done} | Happy | Thirty conferences. Zero tears. Well. One. Mine. In the minivan. |
| 5-5 | map amyhouse, when {from:5,flag:ch5-done} | Loving | Tom. Thank you for coming. You're the good uncle. By a lot. |

### Deedee (19)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map grands, base | Loving | My favorite son! And my girls! Come here, come here. |
| 1-5 | map grands, base | Happy | Rhubarb crisp in the oven, dinner on the stove, floors just mopped. Shoes off. Who wants a cookie? |
| 1-5 | map grands, base | Loving | Grace, Rose, Deedee loves you to the moon and back. Say it back. Louder. |
| 1-5 | map grands, revisit | Proud | The tomatoes are coming in. You're going home with forty. |
| 1-5 | map grands, revisit | Proud | I baked at five this morning. The neighbors have stopped asking why. |
| 1-5 | map grands, revisit | Scared | Tommy, is that a bruise? Sit. Eat. Explain. |
| 1-5 | map grands, revisit | Loving | To the moon and back, girls. The MOON. And BACK. |
| 1-5 | map grands, revisit | Unimpressed | Boppy says he's not feeling good. Boppy also won't stop fishing. |
| 1-5 | map grands, revisit | Happy | Grace, Rose, who wants to help Deedee frost something? |
| 1-5 | map grands, revisit | Loving | Rhubarb crisp is cooling on the counter. Don't touch it. Okay, one corner. |
| 1-5 | map grands, revisit | Unimpressed | I already did my walk. Boppy did one lap around the recliner. |
| 1-5 | map grands, revisit | Proud | Retired registered nurse. Tom calls me a registered nut. Tom is due for a checkup. |
| 1-5 | map grands, revisit | Unimpressed | Sunday dinner is at five. Five means four thirty. |
| 1-5 | map grands, revisit | Angry | I just cleaned the floors. Shoes OFF. |
| 1-5 | map grands, revisit | Happy | A little glass of wine with dinner. Just one. Nurse's orders. |
| 1-5 | map grands, revisit | Surprised | Have you seen my reading glasses? I had them a minute ago. I've looked everywhere. Twice. |
| 1-5 | map grands, revisit | Happy | Found my glasses. They were in the fridge. Don't ask. Who wants a cookie? |
| 1-5 | map grands, hug:0 | Loving | Hugs for everyone. There. All better. |
| 1-5 | map grands, hug:1 | Loving | Hugs for everyone, just because. To the moon and back. |

### Boppy (13)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map grands, base | Angry | Tom! Good. I'm not feeling good. Something with the stomach. Sit, I'll tell you about it. |
| 1-5 | map grands, base | Loving | Grace, Rose, come give Boppy a hug. Gently. The stomach. And slow down, you two walk too fast. |
| 1-5 | map grands, base | Proud | Did I ever tell you I was a champion cross country runner in college? Your mother has heard it. Sit down. |
| 1-5 | map grands, base | Proud | Here, take my spare cap. For luck. I caught a twelve pounder in it. Nine. It was a big six. |
| 1-5 | map grands, revisit | Proud | Assistant Deputy Warden at Rikers. All those years, nobody got past me. Except that fish. |
| 1-5 | map grands, revisit | Unimpressed | At Rikers we did headcounts. Grace, one. Rose, two. Tom, you're dragging. |
| 1-5 | map grands, revisit | Proud | In college I ran cross country. Champion. Through the woods, up the hills, never breathed hard. |
| 1-5 | map grands, revisit | Happy | Did I tell you about the championship race? I did? Sit down. I'll tell you again. |
| 1-5 | map grands, revisit | Sad | I'm not feeling good. I was fine an hour ago. Then I had a pepper. |
| 1-5 | map grands, revisit | Angry | Slow down, Tom. Who walks this fast? I was a champion runner and I never walked this fast. |
| 1-5 | map grands, revisit | Unimpressed | Deedee says I'm not allowed near the pond. The pond says otherwise. |
| 1-5 | map grands, revisit | Proud | Grace, Rose, who's the strongest grandpa? Correct. Now help me up. |
| 1-5 | map grands, revisit | Unimpressed | She's looking for her glasses again. They're on her head. I'm not saying anything. I'm saying it to you. |

### Aunt Ellie (12)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 1-5 | map elliehouse, base | Unimpressed | Tom. Stand up straight. There. Now you look like someone I'm related to. |
| 1-5 | map elliehouse, base | Proud | Yes, Deedee has an aunt. Yes, I'm older. No, you may not ask by how much. |
| 1-5 | map elliehouse, base | Unimpressed | I've been to Paris eleven times. Long Island is charming. Like a hat you wear once. |
| 1-5 | map elliehouse, revisit | Happy | Deedee keeps offering me rhubarb crisp. I keep saying yes. That's called manners. |
| 1-5 | map elliehouse, revisit | Unimpressed | Boppy says his stomach hurts. I told him to stop eating peppers. He looked at me like I insulted his mother. |
| 1-5 | map elliehouse, revisit | Happy | Grace, darling, that outfit is wonderful. Rose, darling, that outfit is a choice. A brave one. |
| 1-5 | map elliehouse, revisit | Proud | Wisdom is remembering what went wrong and saying so before it happens again. |
| 1-5 | map elliehouse, revisit | Proud | Never apologize for being early, dressing up, or leaving a bad party. |
| 1-5 | map elliehouse, revisit | Loving | Tom, you have a good heart. Now do something about the shoes. |
| 1-5 | map elliehouse, revisit | Proud | Deedee says I'm sharp. I say everyone else is a little dull. |
| 1-5 | map elliehouse, revisit | Unimpressed | A good scarf fixes almost anything. Not Boppy. But almost anything. |
| 1-5 | map elliehouse, revisit | Proud | Somebody once told me I was too much. I outlived him. I dressed beautifully at the funeral. |

### Skye (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map blvd, base | Happy | I'm filming a day-in-my-life video. I live in the lofts. |
| 2-5 | map blvd, base | Happy | This is the day. You're in my life now. |
| 2-5 | map blvd, base | Proud | Say hi to my eleven followers. |

### Chet (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map blvd, base | Proud | I'm an actor. Well. I'm an actor who parks cars at a tower. |
| 2-5 | map blvd, base | Happy | I had a callback last week. For a cereal. |
| 2-5 | map blvd, base | Sad | The cereal went with someone else. It happens. |

### Wes (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map blvd, base | Happy | I'm a screenwriter. I live in the lofts, two floors down from your boyfriend. |
| 2-5 | map blvd, base | Proud | Draft forty-one. It's about a man who writes screenplays. It's very personal. |
| 2-5 | map blvd, base | Happy | He lends me a mug when I'm stuck. I'm stuck a lot. I have nine of his mugs. |

### Boomie (14)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map blvd, base | Loving | TOM! Get over here. Hug. Mmm-hmm. There it is. |
| 2-5 | map blvd, base | Proud | I leave Tuesday for the tour. Atlanta first, then Chicago, then Nashville. One suitcase. Nine dresses. |
| 2-5 | map blvd, base | Loving | Friday is the home show, right here downtown. You're in the front row. I wrote your name on the seat. |
| 2-5 | map blvd, base | Happy | Oh, the sun's coming up on my street. Hallelujah, hallelujah! Sorry. I sang that whole sentence. |
| 2-5 | map blvd, revisit | Surprised | La la LAAA! Oops. A car alarm went off. That one is on me. |
| 2-5 | map blvd, revisit | Happy | Atlanta, then Chicago, then Nashville. I keep saying it out loud so I don't forget. |
| 2-5 | map blvd, revisit | Loving | Friday night, front row. I don't start the show without you. Okay, I start. But I look for you. |
| 2-5 | map blvd, revisit | Loving | How's TNB? Tell him there's a seat for him too. Two front row seats. Don't make me beg. |
| 2-5 | map blvd, revisit | Happy | Oh, when the morning comes, I'm gonna rise. Rise, rise, rise! Sing with me, Tom. Amen! |
| 2-5 | map blvd, revisit | Loving | I open with a hymn my grandmother sang. She'd say I'm doing it too loud. She'd be right. |
| 2-5 | map blvd, revisit | Happy | Sol says he parks his cab outside to hear me warm up. I say he's just early. |
| 2-5 | map blvd, revisit | Loving | You text me when you land. I mean it. A song is also fine. |
| 2-5 | map blvd, revisit | Proud | I sang in the shower this morning. The whole building clapped. Thin walls. |
| 2-5 | map blvd, revisit | Surprised | Hmm hmm hmmm. Oh, I was humming? I'm always humming. |

### Bev (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map blvd, base | Happy | I came all the way from Ohio. I rode the tiny orange railway up the hill. |
| 2-5 | map blvd, base | Happy | It went one block. It cost a dollar. Best dollar of my life. |
| 2-5 | map blvd, base | Loving | Then I ate a pupusa in a market from 1917. I may never go home. |

### Olivia (13)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map jpark, base | Surprised | Tom! Hi! Sorry, I'm mid-sentence in my head. I'm filing a story on AI in classrooms. |
| 2-5 | map jpark, base | Unimpressed | The kids use it to write the homework. The teachers use it to grade the homework. Nobody is in the room. |
| 2-5 | map jpark, base | Scared | MICHAEL. Can you grab Isla? She has a leaf. She's going to eat the leaf. |
| 2-5 | map jpark, revisit | Unimpressed | My editor wants a piece on AI taking jobs. I said I'd write it myself. While I still can. |
| 2-5 | map jpark, revisit | Loving | Michael, can you take Lachlan? He's licking the fence. Thank you, babe. |
| 2-5 | map jpark, revisit | Unimpressed | Everybody asks if robots will take their jobs. I tell them a robot still can't fold a fitted sheet. Neither can I. |
| 2-5 | map jpark, revisit | Unimpressed | I interviewed a chatbot today. It was very polite. Too polite. I didn't trust it. |
| 2-5 | map jpark, revisit | Scared | Michael! Isla is near the curb. Okay. Never mind. Thank you, babe. |
| 2-5 | map jpark, revisit | Scared | Did Nara eat today? Tell me the truth. Michael, did Nara eat? |
| 2-5 | map jpark, revisit | Proud | Teachers aren't getting replaced. They're getting a very confident new student who never did the reading. |
| 2,4 | map jpark, when {test:S=>(S.chapter===2&&!!S.flags['ch2-done'])//(S.chapter===4&&!!S.flags['ch4-done']} | Surprised | Tom! You kept Nara alive! Did she eat? She didn't eat, did she. |
| 2,4 | map jpark, when {test:S=>(S.chapter===2&&!!S.flags['ch2-done'])//(S.chapter===4&&!!S.flags['ch4-done']} | Happy | The desert was gorgeous. Lachlan found a rock. Isla ate a rock. Different rock. |
| 2,4 | map jpark, when {test:S=>(S.chapter===2&&!!S.flags['ch2-done'])//(S.chapter===4&&!!S.flags['ch4-done']} | Scared | MICHAEL. Can you grab Isla? She's going for the dog bowl. |

### Michael (9)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map jpark, base | Happy | Hey, Tom. Good to see you. Please ignore the cracker crumbs. They live here now. |
| 2-5 | map jpark, base | Proud | I work at Meta. I build things that connect people. Right now I'm connecting a four-year-old to a nap. |
| 2-5 | map jpark, base | Surprised | I heard Olivia say Michael. Whatever it is, I'm on it. Isla, that is not a snack. |
| 2-5 | map jpark, revisit | Unimpressed | Yes, Olivia. Heard you. Handled. Lachlan, we do not lick the fence. |
| 2-5 | map jpark, revisit | Loving | Lachlan wants to know if Nara is his dog. I said it's complicated. It's not. It's his dog. |
| 2-5 | map jpark, revisit | Proud | Isla said her first word last week. It was no. She uses it very well. |
| 2-5 | map jpark, revisit | Happy | I took a meeting today with Isla on my lap. She muted me. Best meeting of the quarter. |
| 2-5 | map jpark, revisit | Proud | My arms have never been stronger. I haven't lifted a weight in four years. |
| 2-5 | map jpark, revisit | Happy | Olivia writes about AI taking jobs. Nobody is coming for the job of a dad. Not even AI wants that! |

### Mr. Washington (9)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map jpark, base | Proud | Bought this house in 1979. Same porch, same chair, same view. |
| 2-5 | map jpark, base | Loving | Back then you could hear zydeco from the boulevard on a Saturday night. |
| 2-5 | map jpark, base | Proud | You're the one fixing up the green house? Keep the old windows. They're better than the new ones. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | Back in 1979, this whole block... |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | ... |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | Such a nice afternoon. It should always be this afternoon. Nobody needs to get any older. |
| 2 | map jpark, when {chapter:2,flag:ch2-clear} | Surprised | Where was I? Oh. 1979. This whole block smelled like gumbo on a Saturday night. |
| 2 | map jpark, when {chapter:2,flag:ch2-clear} | Angry | That smog had me stuck on one sentence for an hour. At my age I don't have hours to spare. |
| 2 | map jpark, when {chapter:2,flag:ch2-clear} | Loving | Thank you, Tom. And your young man. And the dog. Especially the dog. |

### Marisol (5)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map jpark, base | Unimpressed | I'm walking my dog. He's somewhere. |
| 2-5 | map jpark, base | Proud | My grandparents rented on this block. Now I rent on this block. We're a tradition. |
| 2-5 | map jpark, base | Surprised | There he is. No. That's a lemon. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | I'm walking my dog. I've always been walking my dog. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | I'll always be walking my dog. Isn't that nice? |

### Larry (5)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map jpark, base | Unimpressed | I'm blowing leaves. |
| 2-5 | map jpark, base | Unimpressed | Onto the next yard. |
| 2-5 | map jpark, base | Proud | Tomorrow, they blow them back. It's a whole system. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | I'm blowing leaves. The same leaf. Over and over. |
| 2 | map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} | Happy | It never lands. It never has to. Very peaceful. |

### Ray (7)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map studio, base | Unimpressed | Sunset Gold Studios. Closed set. Name? |
| 2-5 | map studio, base | Unimpressed | Tom. Plus one dog. Plus one boyfriend who already works here. Fine. Go on in. |
| 2-5 | map studio, base | Proud | Nobody gets past Ray. Except the dog. The dog got past Ray. Don't tell anyone. |
| 4-5 | map studio, when {from:4,flag:ch4-done} | Proud | Ray here. Shoot wrapped. Nobody got past me. Except the megaphone. And the moths. And the dog. |
| 4-5 | map studio, when {from:4,flag:ch4-done} | Happy | Good job, Tom. Don't tell anyone I said good job. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Proud | Nobody came through my gate. Nobody with legs. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Sad | Little things, though. Buzzing. Clapping. One of them asked me for a compliment. I said no. I regret it. |

### Toni (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map studio, base | Happy | Craft services! Take a bagel. Take two. Nobody is counting. I'm counting. |
| 2-5 | map studio, base | Happy | The crew eats like a swarm of locusts. Polite locusts. With lanyards. |

### Kiki (6)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map studio, base | Unimpressed | Kiki. Production assistant. I have a headset, three radios and zero answers. |
| 2-5 | map studio, base | Proud | If anybody asks, I'm walking somewhere important. I'm always walking somewhere important. |
| 4-5 | map studio, when {from:4,flag:ch4-done} | Happy | We WRAPPED! On time! Well. Four hours late. Which is on time for us. |
| 4-5 | map studio, when {from:4,flag:ch4-done} | Happy | I'm going to sleep for a week. In my car. With the headset on. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Scared | Rack two is still missing. Forty costumes. The actors are filming in bathrobes. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Scared | Last thing on my radio before the static was the Stage 7 fog machine. It turned itself on. |

### Dana (5)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map studio, base | Scared | Dana Park. Director. First feature. Please don't ask me how it's going. |
| 4-5 | map studio, when {from:4,flag:ch4-done} | Proud | We got the shot. All of them. Even the one with the horse. |
| 4-5 | map studio, when {from:4,flag:ch4-done} | Loving | Tell TNB the costumes looked incredible. Tell him I said incredible. Tell him twice. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Scared | Without wardrobe there's no shoot. Without a shoot there's no movie. |
| 4 | map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} | Sad | Without a movie I go back to directing car commercials. I love cars. I don't love talking cars. |

### Bernadette (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map oakpark, base | Proud | Bernadette. Neighborhood Watch Captain, nineteen years. Nothing gets past me. |
| 2-5 | map oakpark, base | Angry | Except squirrels. I'm working on it. |

### Juniper (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map coffee, base | Happy | Welcome to Golden Hour. Every hour is golden hour if you believe. |
| 2-5 | map coffee, base | Proud | Our oat milk is oat-adjacent. |
| 2-5 | map coffee, base | Happy | Your name is Tom? I wrote TAM. It's basically the same. |

### Kenji (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map ramen, base | Happy | Irasshaimase! Welcome! |
| 2-5 | map ramen, base | Happy | Tom-san, your Japanese is very good. |
| 2-5 | map ramen, base | Loving | It's not. But you're trying very hard, and I respect that. |

### Sage (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map juicebar, base | Happy | Welcome. Breathe in. Now order. |
| 2-5 | map juicebar, base | Happy | We opened in March. The pupuseria next door has been here since 1994. We're learning a lot. |
| 2-5 | map juicebar, base | Unimpressed | Today's special is celery. Doña Carmen says that's not a meal. She's right. |

### Marguerite (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map wardrobe, base | Proud | Backlot Wardrobe. If it was worn on screen, it lived here first. |
| 2-5 | map wardrobe, base | Surprised | You're Tom? TNB's Tom! He found a shoe for us once. A lead actor's shoe. Four minutes before the take. |
| 2-5 | map wardrobe, base | Loving | We still talk about the shoe. Tell him there's always a rack here with his name on it. |

### Dolores (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map cinema, base | Proud | Welcome to the Starlite. Built in 1931. The popcorn is newer. A little. |
| 2-5 | map cinema, base | Proud | I have run the projector here for forty years. I've seen every movie twice. |
| 2-5 | map cinema, base | Happy | Tonight it's a horror double feature. Your boyfriend would love it. You'd watch it through your fingers. |

### Dash (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map boards, base | Unimpressed | Board Room. We sell boards. We also sit on them. |
| 2-5 | map boards, base | Proud | TNB? Longboard guy? He bombed Fargo Street once. No brakes. Legend. |
| 2-5 | map boards, base | Happy | If you see him, tell him the wheels he ordered came in. The green ones. |

### Sol (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map lacab, base | Happy | Angel City Cab Co. I'm Sol. Sal's cousin. Also one cab. |
| 2-5 | map lacab, base | Unimpressed | Cab eight. Sal has cab seven. We don't talk about what happened to the other six. |
| 2-5 | map lacab, base | Unimpressed | I go to the airport, the airport, and sometimes the airport. |

### Mrs. Alvarez (3)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Angry | TEN. Ten people in a two-bedroom house from 1912. One bathroom. ONE. |
| 2-5 | map casa, base | Angry | Tony, feet off my table! Kevin, the baby isn't a football! Mateo, give Abuela the remote! ...Tom, mijo, sit. If you can find a chair. |
| 2-5 | map casa, base | Unimpressed | Everybody says, 'Mama, the house is so full of love.' It's full of SOMETHING. Take tamales. Please. I need the room in my fridge. |

### Don Beto (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Happy | I've been in this chair since the game started. Which game? Yes. |
| 2-5 | map casa, base | Happy | Ten people. I counted once. Then I lost count. Then I took a nap. |

### Tony (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Unimpressed | Me and Yesenia are saving for our own place. In this market? We'll be here until Mateo goes to college. |
| 2-5 | map casa, base | Sad | The two houses next door sold for more than this whole block cost in 1990. My mom isn't okay about it. |

### Yesenia (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Surprised | Sofi, no. Sofi. SOFI. ...She bit something. We don't have a dog. I don't know what she bit. |
| 2-5 | map casa, base | Unimpressed | Baby Lupita is finally asleep. If you wake her, you're moving in. |

### Claudia (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Unimpressed | Night shift nurse. I sleep in the bathtub. It's the only room with a lock. |
| 2-5 | map casa, base | Sad | Until somebody needs the bathroom. Somebody always needs the bathroom. |

### Kevin (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Unimpressed | I share the bunk bed with Uncle Tony's exercise bike. |
| 2-5 | map casa, base | Unimpressed | It's not a metaphor. The bike is on the top bunk. |

### Daisy (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Proud | I'm making a documentary about this house. It's a horror movie. |
| 2-5 | map casa, base | Scared | Scene one: the bathroom line. Scene two: who ate Abuela's last concha. |

### Mateo (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Happy | Truck! TRUCK! |
| 2-5 | map casa, base | Happy | Ba! Ba! ...Truck. |

### Sofi (2)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map casa, base | Angry | I'm a dinosaur. RAWR. |
| 2-5 | map casa, base | Happy | Abuela says no more dinosaurs inside. I'm a quiet dinosaur. rawr. |

### TNB (13)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 2-5 | map lofts, base | Happy | Well, well, well... |
| 2-5 | map lofts, base | Loving | Hey, you. Did you eat? I made a bowl. I also made a bowl. Pottery joke. |
| 2-5 | map lofts, base | Proud | Welcome to the loft. Kiln by one window, wheel by the other, garment bags everywhere else. Spring Street, baby. |
| 2-5 | map lofts, base | Loving | Take my jacket. It gets cold up in Griffith Park at night, and a cold Tom is a no-go. |
| 2-5 | map lofts, revisit | Proud | Took the longboard down Spring Street this morning. Smooth. There's a crack by Fourth Street I've named. |
| 2-5 | map lofts, revisit | Proud | Threw six mugs this morning. The glaze came out of the kiln like sea glass. Come look before you claim one. |
| 2-5 | map lofts, revisit | Happy | Go on, I'll be right here. I'm pot-sitive about it. |
| 2-5 | map lofts, revisit | Loving | Horror movie tonight. You pick. You always pick the scary one and then hold my arm the whole time. |
| 2-5 | map lofts, revisit | Loving | Watered your plants on 2nd Ave. The fern asked about you. I said you're fine. |
| 2-5 | map lofts, revisit | Happy | Rode the train to the clay studio. Forty minutes. Best forty minutes of my day. Met a man who knows every line. |
| 2-5 | map lofts, revisit | Proud | The slime? It just needs someone to mold it. I have more of these. You know I do. |
| 2-5 | map lofts, revisit | Proud | Long day on set. Eleven costume changes. One actor lost a shoe. I found it. I always find it. |
| 2-5 | map lofts, revisit | Loving | Be careful out there. I like you un-cracked. |

### Jojo (1)

| Ch | Where | Emotion | Line |
|---|---|---|---|
| 3-5 | map lofts, base | Surprised | Oh. Hi. You must be Tom. I'm Jojo. TNB's sister. |
