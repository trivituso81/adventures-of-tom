# Listener reaction index (react1)

Fact: for every dialogue line, who else in the conversation reacts and with which of the 8 moods. Behind the scenes only: the game does not load it yet.
Source of truth: `docs/emotion-reactions.tsv`. This page is rebuilt from it with `python3 tools/reaction-index.py`. Scenario inventory and tagging rules: docs/EMOTIONS.md, "Listener reactions".

| Kind | Lines with a reaction |
|---|---|
| scene | 2314 |
| map | 373 |
| table | 254 |
| shop | 66 |
| recruit | 46 |
| cab | 36 |
| **All** | 3089 |

| Mood | Reactions |
|---|---|
| Happy | 3347 |
| Loving | 1181 |
| Sad | 635 |
| Angry | 344 |
| Scared | 730 |
| Surprised | 1393 |
| Proud | 915 |
| Unimpressed | 1307 |
| **All** | 9852 |

| Listener | Reactions |
|---|---|
| Tom | 2441 |
| Grace | 1694 |
| Rose | 1604 |
| TNB | 1314 |
| Amy | 1103 |
| Nara | 692 |
| Deedee | 387 |
| Boppy | 380 |
| Aunt Ellie | 32 |
| Vance | 31 |
| Justin | 25 |
| Marlowe | 23 |
| Olivia | 21 |
| Nickel | 18 |
| Sol | 16 |
| Bernadette | 8 |
| Page | 8 |
| Daisy | 7 |
| Dana | 6 |
| Pruitt | 6 |
| Penny | 6 |
| Kiki | 5 |
| Washington | 3 |
| Luna | 3 |
| Oolong | 2 |
| Toni | 2 |
| Halverson | 2 |
| Michael | 2 |
| Carmen | 2 |
| Pip | 2 |
| Moss | 2 |
| Dot | 2 |
| Ray | 1 |
| Alvarez | 1 |
| Sal | 1 |


## scene: opening (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | TATA! You're BACK! | Tom loving |
| Grace | We waited for you for a hundred years. | Tom loving, Rose happy |
| Rose | A hundred MILLION years! | Tom happy, Grace happy |
| Rose | Tata, up! Up up up! | Tom happy |
| Rose | I'm the tallest! Giddyup, Tata! | Tom happy, Grace happy |
| Tom | Hello, Rose. Please keep your arms and legs inside the uncle at all times. | Rose happy, Grace happy |
| Grace | Tata, LOOK. A sparkling diamond gold dumpling squishy! | Tom surprised, Rose surprised |
| Grace | It's limited edition. There are only two in the whole world. You can squeeze it! | Tom happy |
| Tom | That's the shiniest dumpling I've ever seen. And I've seen a LOT of dumplings. | Grace proud, Rose happy |
| Rose | Come on, Tata! Let's go! | Tom happy, Grace happy |

## scene: ch1Goal (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! Deedee made rhubarb crisp for you. It's cooling RIGHT NOW. | Tom happy, Rose happy |
| Rose | I already licked the spoon. Don't tell. | Tom unimpressed, Grace unimpressed |
| Tom | Then we had better hurry. Before somebody licks the rest. | Grace happy, Rose happy |

## scene: ch1Theft (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | My favorite son! | Tom loving |
| Deedee | And my girls! Come here, come here. | Grace loving, Rose loving |
| Deedee | Tom, you must be starving! Sit. The crisp needs ten minutes on the counter. | Tom happy |
| Grace | Deedee. They're on your head. | Deedee surprised, Rose happy, Tom happy |
| Deedee | So they are. Not one word to Boppy. | Grace happy, Tom happy |
| Tom | I brought you a sourdough loaf. Baked it yesterday. It flew here on my lap. | Deedee loving |
| Deedee | Your bread and my rhubarb crisp. Now THAT is a meal. | Tom proud, Grace happy |
| Tom | Mom, EVERYTHING gives you gas. | Deedee unimpressed, Grace happy, Rose happy |
| Deedee | And I eat it anyway. That's love, Tom. | Tom loving, Grace happy |
| Boppy | Tom! Good. I'm not feeling good. It's the stomach. | Tom unimpressed, Deedee unimpressed |
| Rose | Deedee! A mud blob is taking your PIE! | Tom surprised, Deedee surprised, Grace surprised, Boppy surprised |
| Tom | That was UNCALLED for! | Deedee angry, Grace angry, Rose scared |
| Deedee | That's my GOOD tin! Grab your shoes. I'm coming with you. | Tom proud, Grace proud, Rose happy |
| Boppy | I TOLD you something lives in that pond. Twenty years I've been saying it. Nobody listens to Boppy. | Tom unimpressed, Deedee unimpressed |
| Boppy | I'd come, but the stomach. Bring me back that fish. | Tom unimpressed, Grace happy |

## scene: CH1_AFTER (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Up, up. Everybody up. Deedee kisses it better. | Tom loving, Grace loving, Rose loving |
| Deedee | There. Good as new. Try not to do that again. | Tom happy, Grace happy, Rose happy |

## scene: ch1Mudling (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Crumbs! Rhubarb crumbs. That little thief went right through here. | Grace surprised, Rose surprised, Tom unimpressed |
| Rose | Tata. The mud is MOVING. | Tom surprised, Grace scared, Deedee surprised |
| Mudling | Blub. The pie went that way. You can't have it. Blub. | Tom unimpressed, Grace angry, Rose scared, Deedee angry |
| Grace | Okay, everybody. Tata is in front. I'm in charge of choreography. FIGHT! | Tom unimpressed, Rose happy, Deedee proud |
| Deedee | Good job, girls. The crumbs keep going north. | Grace proud, Rose proud |

## scene: ch1Skeeter (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Skeeter Swarm | Bzzz. Somebody smells like rhubarb. Bzzzzz. | Grace scared, Rose scared, Tom unimpressed |
| Grace | Ew. Ew ew ew. Nobody touch my hair. | Rose happy, Tom unimpressed, Deedee loving |
| Deedee | Everybody okay? Itchy isn't hurt. Keep walking. | Grace unimpressed, Rose happy |

## scene: ch1Grump (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Pond Grump | Grrrumble. You're standing in my puddle. And the small one is LAUGHING at me. | Rose happy, Grace surprised, Tom unimpressed |
| Rose | I'm not laughing. I'm giggling. It's different. | Tom happy, Grace unimpressed, Deedee happy |
| Pond Grump | That's IT. Soggy Slap. For the giggler. | Rose scared, Tom angry, Deedee angry |
| Deedee | Hugs for everyone. There. All better. | Tom loving, Grace loving, Rose loving |
| Deedee | The crumbs go around the pond. Toward Boppy’s fishing spot. | Tom proud, Grace proud |
| Grace | Boppy says the Big One lives over there. | Rose scared, Tom unimpressed |
| Tom | Boppy also says the stomach thing is serious. Stay close. | Grace happy, Deedee unimpressed |

## scene: ch1Pond (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | THERE! The thief! He still has the tin! | Tom proud, Rose surprised, Deedee angry |
| The Big One | GLUB. Is that a pie? For me? | Grace surprised, Rose surprised, Tom unimpressed |
| Big Mudling | Blub. For you, boss. | Deedee angry, Tom unimpressed |
| The Big One | It fits. I'm a king now. GLUB. | Grace unimpressed, Rose happy, Deedee angry, Tom unimpressed |
| Deedee | That's my GOOD tin, you overgrown handbag! | Tom happy, Grace happy, Rose happy |
| Rose | Tata, he looks like a turtle wearing a hat. | Tom happy, Grace happy, Deedee unimpressed |
| Tom | Nobody touches Deedee’s crisp. Everybody ready? | Grace proud, Rose proud, Deedee proud |
| Deedee | Up, up. Everybody up. Deedee kisses it better. | Tom loving, Grace loving, Rose loving |
| Deedee | Tom, you stand in front of whoever it stares at. Rosie, make it laugh. Then we try again. | Tom proud, Rose proud, Grace proud |

## scene: ch1AfterBoss (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| The Big One | Glub. Nobody ever made me laugh before. You can have your tin back. | Rose loving, Grace surprised, Deedee loving, Tom loving |
| The Big One | Glub. Fine. Take your tin. I'm going back in the pond to think about things. | Deedee happy, Grace happy, Rose happy, Tom unimpressed |
| Deedee | My tin! And look. Half the crisp is still in it. | Grace happy, Rose happy, Tom happy |
| Grace | The Big One ate the other half. I saw crumbs on its chin. | Deedee unimpressed, Rose happy, Tom happy |
| Deedee | Then we split this half. Everybody home. Wait until Boppy hears about this. | Tom happy, Grace happy, Rose happy |

## scene: ch1End (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | You found the Big One? I TOLD everybody. Twenty years. | Tom unimpressed, Grace happy, Deedee unimpressed |
| Tom | It had this stuck in its lip. | Boppy surprised, Grace proud |
| Boppy | My LURE! I lost that in 2006. Still shiny. Unlike me. | Tom happy, Grace happy, Rose happy, Deedee unimpressed |
| Boppy | Keep it, Tom. For luck. The fish clearly didn't want it. | Tom loving |
| Deedee | Sit. Everybody sit. Half a crisp is still a crisp. | Tom happy, Grace happy, Rose happy, Boppy happy |
| Rose | This is the best half a crisp I ever had. | Deedee loving, Tom happy |
| Grace | Tata, you're staying the WHOLE week, right? | Tom loving, Rose happy |
| Tom | The whole week. And nobody is stealing anything else. | Grace happy, Rose happy, Deedee loving |
| Boppy | Slow down. Everybody eats too fast. My stomach. | Deedee unimpressed, Tom unimpressed, Grace happy |

## scene: ch2Loft (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Look who flew three thousand miles to see me. | Tom loving |
| Tom | I flew three thousand miles to see you... and maybe the starter. | TNB happy |
| TNB | Main event. I'll take it. | Tom loving |
| TNB | My call time got pushed to Thursday. The lead actor lost a shoe. I already found it. So I'm all yours. | Tom happy |
| TNB | Also, something is up. The sky over Griffith Park went purple this morning. Not sunset purple. Weird purple. | Tom surprised |
| Tom | All yours. I like that. We'll look, together. One quick stop first. My starter has been alone for a week. | TNB loving |

## scene: ch2Porch (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Olivia dropped her off this morning. Family trip to the desert. No dogs at the hotel. | Tom surprised, Nara happy |
| TNB | She's been sitting on your porch since eight. I tried to take her to the loft. She refused. | Tom loving, Nara loving |
| TNB | Also, your starter was bubbling out of the jar, so I baked a boule with it. | Tom surprised |
| Tom | I'm proud. As long as you didn't spin it on your pottery wheel. | TNB happy |
| Nara | Tom tears off the heel and holds it up. "Sit." Nara sits, wiggling all over. "Paw." She gives him her paw. Very, very hard. | TNB happy, Tom happy |
| Nara | She gets the bread. Tom gets a lick. | TNB loving |
| Tom | Sit, paw, treat. She knows the whole routine. So polite! | Nara proud, TNB happy |

## scene: ch2Starter (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Fifty grams of flour, fifty grams of water. Stir. Look at those bubbles. | TNB unimpressed |
| TNB | You talk to that jar more than you talk to me. | Tom happy |
| Tom | The jar gets fifty grams of flour. You get the whole week. | TNB loving |
| Tom | ...And you steamed my shirts for the flight. You win. You always win. | TNB proud |
| TNB | I'll take it. | Tom loving |
| Nara | Nara is at the front window, whining. Her tail is down. | Tom surprised, TNB surprised |
| TNB | Babe. Look outside. Is the street... purple? | Tom surprised, Nara scared |

## scene: ch2Smog (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Mr. Washington! Is everything okay? | TNB scared |
| Mr. Washington | Tom. Back in 1979, this whole block... | Tom happy, TNB unimpressed |
| Mr. Washington | ... | Tom surprised, TNB scared |
| TNB | He's been saying that for a while, babe. | Tom scared |
| Mr. Washington | Such a nice afternoon. It should always be this afternoon. | Tom scared, TNB scared, Nara scared |
| Tom | Excuse me, smog. That was UNCALLED for. | TNB happy |
| Smoglet | Cough. Nice street. We're going to sit on it for a while. Forever, actually. | Tom angry, TNB scared, Nara angry |
| TNB | Babe. Remember movie night? You threw the whole popcorn bowl. | Tom unimpressed |
| Tom | I was startled. Briefly. With dignity. | TNB happy |
| TNB | It was a battle plan. You just didn't know it yet. | Tom unimpressed |
| TNB | Okay. Okay. Everybody breathe. Through the nose. Not the smog. | Tom happy, Nara happy |
| TNB | They're gone, but he's still out of it. Look at him. | Tom sad |
| Mr. Washington | Nobody needs to go anywhere. Nobody needs to get any older. | Tom sad, TNB sad |
| Tom | That's not a Mr. Washington sentence. Let's check on the boulevard. Miss Odette and Doña Carmen. | TNB proud |

## scene: ch2Odette (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Miss Odette | Stirring. Stirring. The gumbo never has to be done, baby. Isn’t that nice? | Tom surprised, TNB sad |
| TNB | She's made that gumbo every day for fifty years. It's never once been "never done." | Tom sad |
| Tom | The smog wants everything to stay exactly the same. Forever. That's not a nice afternoon. That's a hostage situation. | TNB proud |

## scene: ch2Carmen (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Doña Carmen | The pupusas are fine. Everything is fine. It's always this afternoon. Why did I ever flip them? | Tom sad, TNB sad |
| Nara | Nara sniffs the comal. She sneezes. The smoke smells like the hills. | Tom surprised, TNB surprised |
| TNB | Nara is right. That's not kitchen smoke. That's the same purple stuff. | Tom proud, Nara proud |

## scene: ch2Source (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Babe. Look north. It's all coming down off the hills. | Tom surprised |
| TNB | The Observatory. The pipes on the side are pumping it out like a smoke machine on a bad set. | Tom surprised, Nara scared |
| Tom | Then that's where we're going. Nara, stay close. | TNB proud, Nara proud |
| Nara | Nara presses against Tom’s leg. She's not letting him go anywhere without her. | Tom loving, TNB loving |

## scene: CH2_AFTER (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Up, everybody. Wardrobe says nobody is cut from this scene. | Tom happy, Nara happy |

## scene: ch2Flurry (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Ticket Flurry | Street cleaning. Tuesday. Eight to ten. You didn't read the sign. And the smog says we can stay forever. | Tom unimpressed, TNB unimpressed, Nara angry |
| TNB | I take the Metro. You have nothing on me. | Tom happy |
| Tom | Contested. Appeal granted. Keep going. | TNB happy |

## scene: ch2Coyote (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Canyon Coyote | Nice hike. You look like you have snacks. And the dog looks like a snack. | Tom angry, TNB scared, Nara scared |
| Nara | Nara’s hackles go up. She stands right in front of Tom. | Tom loving, TNB proud |
| Canyon Coyote | Pack Howl. For the fluffy one. | Nara angry, Tom angry, TNB scared |
| TNB | Quick wardrobe adjustment, quick heal, and a quick kiss for the road. Ready, babe? | Tom loving, Nara happy |
| Tom | Ready. Kiss accepted. The Observatory is up at the top left. Follow the purple. | TNB loving, Nara happy |

## scene: ch2Boss (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | The ground is humming. That's never a good sign. I've seen this movie forty-seven times. | Tom unimpressed, Nara scared |
| The Big Shake | RUMBLE. Somebody plugged my pipes. Now everything is stuck. I LIKE stuck. | Tom surprised, TNB scared, Nara scared |
| The Big Shake | Stuck means nothing moves. Nothing changes. Nothing ever has to say goodbye. | Tom sad, TNB sad |
| Tom | Everybody says goodbye. Then they come back. That's what planes are for. | TNB loving |
| Tom | Things have to move. | TNB proud, Nara proud |
| Nara | Nara barks at the hill. Once. Very loudly. Then she checks that Tom saw. | Tom loving, TNB happy |
| TNB | Well, well, well... looks like we're in a bit of a shaky situation. | Tom unimpressed, Nara happy |
| TNB | Cut. Reset. Back to one, everybody. | Tom happy, Nara happy |
| TNB | Babe, heal right after the Aftershock. When it clogs up, hit it with water or sparkle. Or one of our Tombos. | Tom proud |

## scene: ch2AfterBoss (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| The Big Shake | Rumble. You asked how I was doing. Nobody has asked in a million years. | Tom loving, TNB loving, Nara loving |
| The Big Shake | ...I'll let things move. A little. Two inches a year. That's my best offer. | Tom happy, TNB happy |
| The Big Shake | Rumble. Fine. The pipes are clear. I'm going back under the hill to think about my choices. | Tom unimpressed, TNB happy, Nara happy |
| TNB | Look. The sky is blue again. Los Angeles blue. Slightly brown, but blue. | Tom happy, Nara happy |
| Tom | Somebody plugged those pipes on purpose. Smog doesn't do that by itself. | TNB surprised |
| TNB | Spooky. I love it. Let's go check on Mr. Washington. | Tom happy, Nara happy |

## scene: ch2End (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Washington | ...smelled like gumbo on a Saturday night. Zydeco from the boulevard. Kids on every porch. | Tom loving, TNB loving |
| Mr. Washington | Where was I? Oh. I was done. That was the whole story. | Tom happy, TNB happy |
| Mr. Washington | Funny. For a while there I didn't want anything to change. Then I remembered the best parts all came from things changing. | Tom loving, TNB loving |
| Tom | Keep the old windows, though. | Washington happy, TNB happy |
| Mr. Washington | Keep the old windows. Smart man. | Tom proud, TNB happy |
| TNB | Doña Carmen says the pupusas came out perfectly crispy. Miss Odette is sending over gumbo. The whole block is cooking. | Tom happy, Nara happy, Washington happy |
| Nara | Nara leans on both of them at once. Tiny excited puddle. Nobody minds. | Tom loving, TNB loving |
| Tom | Home. Both of them. Okay. Good. | TNB loving, Nara loving |

## scene: ch3Arrive (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! Boppy has been waiting by his window since BREAKFAST. He has his fishing hat on. | Tom happy, Rose happy |
| Rose | He said if you were late he'd catch the fish without you. He catches one every time. It's always THIS big. | Tom unimpressed, Grace happy |
| Tom | Then we'd better hurry, before it gets any bigger. | Grace happy, Rose happy |

## scene: ch3Fishing (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | My favorite son! | Tom loving |
| Deedee | Back already! Look at you. Did they feed you out there? Never mind. I'll feed you. | Tom happy, Grace happy, Rose happy |
| Boppy | Tom. Good. Sit down. No. Don't sit down. We're going fishing. | Tom unimpressed, Grace happy, Rose happy |
| Boppy | The Whisker Perch. Whiskers like a cat. I saw it at Cattail Pier in 1994. Nobody believes me. | Tom unimpressed, Grace surprised, Rose surprised, Deedee unimpressed |
| Deedee | Nobody believes him. | Boppy angry, Tom happy, Grace happy |
| Rose | Boppy, is the Whisker Perch real? | Boppy proud |
| Boppy | Real as my heartburn, kiddo. | Rose surprised, Tom unimpressed, Grace unimpressed |
| Grace | I'm bringing a notebook. For science. And for proof. | Boppy proud, Tom happy |
| Boppy | And I'm bringing THIS. My pepper jar. Homegrown, pickled in 1989. Older than your mother. | Grace surprised, Rose surprised, Tom unimpressed, Deedee unimpressed |
| Deedee | Not one pepper for me either. Peppers give me gas. | Boppy unimpressed, Tom unimpressed |
| Grace | Deedee. EVERYTHING gives you gas. | Deedee surprised, Tom happy, Rose happy, Boppy happy |
| Deedee | Who told you that. | Grace scared, Tom scared |
| Grace | Tata. At the crisp. | Tom scared, Deedee unimpressed, Rose happy |
| Deedee | Tata is on thin ice. | Tom scared, Grace happy, Rose happy, Boppy happy |
| Deedee | I have three pies in, so I'm staying put. Do NOT let him eat peppers on an empty stomach. | Boppy unimpressed, Tom happy |
| Boppy | I never eat peppers on an empty stomach. I eat them on a full stomach. Then it's empty. | Deedee unimpressed, Tom unimpressed, Grace unimpressed, Rose happy |

## scene: ch3Tea (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Oolong | Boppy! The usual? Ginger, peppermint, and a little honey for the stomach. | Boppy happy |
| Boppy | The stomach thanks you. The stomach is still complaining. But it thanks you. | Oolong happy, Tom unimpressed |
| The kettle | The kettle whistles, low and long. Oolong leans in to listen. | Tom surprised, Boppy surprised |
| Oolong | The kettle says a man in a long coat has been buying up gold coins at Penny’s. Paying double. Never takes his hat off. | Tom surprised, Boppy surprised |
| Tom | On Long Island? Nobody here pays double for anything. | Oolong unimpressed, Boppy unimpressed |
| Oolong | The kettle also says it'll rain on Tuesday. The kettle is wrong a lot. Enjoy the pier. | Tom unimpressed, Boppy happy |

## scene: ch3Story (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Did I ever tell you about 1970? Sit down. This takes a while. | Grace unimpressed, Tom unimpressed, Rose happy |
| Grace | You did. Forty times. | Boppy unimpressed, Tom happy |
| Boppy | Then forty-one. First year of college. Cross country. Five miles through the woods, up the big hill, and I never breathed hard. | Rose surprised, Grace unimpressed, Tom unimpressed |
| Boppy | Last hill, I passed the whole field. Champion. They put my name on a plaque. The plaque is in a box. Somewhere. | Rose surprised, Grace unimpressed, Tom happy |
| Rose | Can you still run that fast? | Boppy surprised, Grace surprised, Tom unimpressed |
| Boppy | ...Sure. Sure I can. I just choose not to. It's bad for the stomach. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Rose | Race you to the pier, Boppy! | Boppy scared, Grace happy, Tom happy |
| Grace | Last one there's a soggy sock! | Rose happy, Boppy scared, Tom happy |
| Boppy | Why is everybody walking like they're going to a fire? Slow down! My stomach is doing flips! | Tom happy, Grace happy, Rose happy |
| Tom | Boppy speed, everybody. We walk at Boppy speed. | Boppy loving, Grace unimpressed, Rose unimpressed |

## scene: ch3Pier (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | This is the spot. Forty years, this spot. Now everybody be QUIET. | Rose happy, Grace unimpressed, Tom unimpressed |
| Rose | I AM BEING QUIET. | Boppy angry, Grace unimpressed, Tom happy |
| Grace | Rose. Inside voice. Outside. | Rose unimpressed, Boppy happy, Tom happy |
| Tom | Shhh. Quiet on the pier, everybody. Boppy has a whole system. | Boppy proud, Grace happy, Rose happy |
| Boppy | Tom holds the tackle box. I cast. The fish comes. Nobody talks. That's the system. | Tom unimpressed, Grace unimpressed, Rose happy |
| Boppy | ...Any minute now. | Tom unimpressed, Grace unimpressed, Rose unimpressed |
| Grace | It's been a minute. I wrote it down. | Boppy unimpressed, Tom happy, Rose happy |
| Boppy | Snack. A pickled pepper settles the stomach. | Grace surprised, Rose surprised, Tom unimpressed |
| Rose | Deedee said NO peppers. | Boppy unimpressed, Grace proud, Tom unimpressed |
| Boppy | Deedee isn't here. | Rose surprised, Grace surprised, Tom unimpressed |
| Old Iron-Gill | BLORP. | Boppy surprised, Tom surprised, Grace surprised, Rose surprised |
| Rose | TATA! A FISH! A HUGE ONE! WITH A MUSTACHE! | Tom surprised, Grace surprised, Boppy surprised |
| Boppy | That's no perch. That's OLD IRON-GILL. I saw him in 1994! I TOLD everybody! | Tom surprised, Grace surprised, Rose happy |
| Old Iron-Gill | Blorp. Something smells like peppers. | Boppy scared, Tom unimpressed, Grace scared, Rose happy |
| Boppy | MY JAR! | Tom surprised, Grace surprised, Rose surprised |
| Old Iron-Gill | GULP. Spicy. I love it. Bye. | Boppy angry, Tom surprised, Grace surprised, Rose surprised |
| Tom | That was UNCALLED for! | Boppy angry, Grace angry, Rose happy |
| Boppy | Pickled in 1989. Nobody takes Boppy’s peppers. NOBODY. | Tom unimpressed, Grace surprised, Rose happy |
| Boppy | He went west. Into the Whispering Marsh. Come on. And nobody walk fast. | Tom proud, Grace proud, Rose happy |

## scene: CH3_AFTER (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Up. Everybody up. Headcount. One, two, three, four. Good. Nobody is missing. Again. | Tom unimpressed, Grace unimpressed, Rose happy |

## scene: ch3Sock (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Soggy Sock | Squelch. Have you seen my other sock? It looks just like me. It's ALSO angry. | Rose surprised, Grace unimpressed, Tom unimpressed, Boppy unimpressed |
| Rose | Tata, that sock has a FACE. | Tom unimpressed, Grace unimpressed, Boppy unimpressed |
| Boppy | Marsh junk. Everything people drop out here ends up grumpy about it. Like me, at the DMV. | Tom happy, Grace happy, Rose happy |
| Boppy | Socks. Out here. Nobody keeps track of their socks anymore. | Tom unimpressed, Grace happy |

## scene: ch3Tangle (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Tangle | Snarl. Somebody cast me badly in 1997. I've been in a knot ever since. Nobody gets past ME. | Boppy angry, Tom unimpressed, Grace scared, Rose scared |
| Boppy | Excuse me? Nobody gets past ME. That's MY line. I was saying that at Rikers before you were a knot. | Tom happy, Grace happy, Rose happy |
| Grace | Boppy, you're breathing kind of hard. | Boppy unimpressed, Tom scared, Rose scared |
| Boppy | I'm breathing EXACTLY as hard as I want to. | Grace unimpressed, Tom sad, Rose scared |
| Tom | We take it slow. Iron-Gill’s wake goes northwest, toward those big reeds. | Boppy unimpressed, Grace proud |

## scene: ch3Wait (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | The old reeds. When I was a kid we said there was a sundial back in there that told the wrong time. | Grace unimpressed, Rose surprised, Tom happy |
| Grace | Sundials can't tell the wrong time. That's not how sundials work. | Boppy unimpressed, Tom happy |
| Boppy | That's what I said. | Grace unimpressed, Tom happy, Rose happy |
| Old reeds | Iron-Gill’s wake goes straight into the reeds. There used to be a boardwalk through here. Something big and soggy is sitting in front of it. | Tom surprised, Grace surprised, Rose surprised, Boppy unimpressed |
| Tom | Then we ask it nicely to move. Iron-Gill isn't keeping that jar. | Boppy proud, Grace proud, Rose proud |

## scene: ch3Snag (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Snag | Creak. This was a boardwalk once. Now it's MY spot. Everything catches on me here. I like it. | Tom unimpressed, Grace unimpressed, Rose surprised, Boppy angry |
| Boppy | You're sitting on the way to Sundial Hollow. Shove over. | Tom happy, Grace happy, Rose happy |
| Snag | Make me. Slowly. I'm very heavy when wet. I'm always wet. | Boppy angry, Tom unimpressed, Grace unimpressed, Rose happy |
| Rose | Tata, it's a LOG with a BOOT. | Tom happy, Grace unimpressed, Boppy unimpressed |
| Old reeds | The Snag rolls over, creaks, and drifts off into the shallows. Behind it, the old reeds lean apart around a narrow, mossy boardwalk. | Tom surprised, Grace surprised, Rose surprised, Boppy proud |
| Grace | A secret boardwalk. Of course there's a secret boardwalk. | Boppy unimpressed, Tom happy, Rose surprised |
| Boppy | Not secret. Just old. Like me. Nobody comes back here anymore. | Tom loving, Grace sad, Rose sad |

## scene: ch3Hollow (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Sundial Hollow. I haven't been back here since I was nine. It hasn't changed. It still says seven. | Tom surprised, Grace unimpressed, Rose surprised |
| Grace | It's the AFTERNOON. The sun is right there. Sundials can't be wrong. That's not how sundials work. | Boppy unimpressed, Tom happy, Rose happy |
| Boppy | That's what I said. | Grace unimpressed, Tom happy, Rose happy |
| Rose | Tata! Something shiny is stuck in it! | Tom surprised, Grace surprised, Boppy surprised |
| Tom | A coin. Wedged right under the pointer. Somebody pushed this in on purpose. | Grace surprised, Rose surprised, Boppy surprised |
| The sundial | Click. The shadow swings all the way around the dial and settles on the right hour. | Tom surprised, Grace surprised, Rose surprised, Boppy surprised |
| The spillway | Up north, the spillway gurgles, then glugs, then drains away to mud. The way to the Deep Pool is open. | Tom surprised, Grace surprised, Rose surprised, Boppy proud |
| Grace | It MOVED. Shadows don't move like that. I'm writing this down. In pen. | Tom happy, Boppy happy, Rose happy |
| Tom | Oolong’s kettle said a man in a long coat is buying gold coins at Penny’s. Paying double. | Boppy surprised, Grace surprised |
| Boppy | Nobody pays double on Long Island. Keep that in your pocket, Tom. Deep in your pocket. | Tom proud, Grace surprised |
| Boppy | Old gold. Keep that in your pocket, Tom. Penny will want to hear about it. Penny wants to hear about everything. | Tom proud |
| Boppy | Now. The Deep Pool. That's where Iron-Gill goes to sulk. | Tom proud, Grace proud, Rose proud |

## scene: ch3Pool (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | The Deep Pool. Nobody has ever seen the bottom. My father said it goes all the way to Ohio. | Grace unimpressed, Rose surprised, Tom unimpressed |
| Old Iron-Gill | Blorp. The old man. And his small, loud friends. | Boppy angry, Grace angry, Rose happy, Tom unimpressed |
| Boppy | You took my jar. | Grace scared, Rose scared, Tom proud |
| Old Iron-Gill | I took your jar. Forty years you sit on that pier and you never once come to visit. You only ever bring HOOKS. | Boppy surprised, Tom sad, Grace sad, Rose sad |
| Rose | Boppy, he's sad! And spicy! | Boppy unimpressed, Tom loving, Grace sad |
| Boppy | He's a FISH, kiddo. | Rose sad, Grace unimpressed, Tom loving |
| Boppy | Tom. Tackle box. We do this the old way. | Tom proud, Grace proud, Rose proud |
| Tom | Quiet on the pier, everybody. | Boppy proud, Grace proud, Rose happy |
| Boppy | Headcount. One, two, three, four. Good. | Tom happy, Grace unimpressed, Rose happy |
| Boppy | He belches every third turn, Tom. Heal right after. When he dives, hit the water hard, or do our Tombo. | Tom proud |

## scene: ch3AfterBoss (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Old Iron-Gill | Blorp. You told me about 1970. Nobody tells me anything. They only fish. | Boppy surprised, Tom loving, Grace sad, Rose sad |
| Old Iron-Gill | Come by the pier sometimes, old man. No hooks. Just talking. | Boppy loving, Tom loving, Grace loving, Rose loving |
| Old Iron-Gill | Blorp. Fine. FINE. Take your jar. It was too spicy anyway. | Boppy happy, Tom happy, Grace happy, Rose happy |
| Boppy | My jar. Still sealed. Still hot. | Tom happy, Grace happy, Rose happy |
| Boppy | And look at that. Forty years, and I finally caught Old Iron-Gill. | Tom loving, Grace unimpressed, Rose happy |
| Grace | Technically he caught your jar, and then we caught him. I'm writing it down anyway. For proof. | Boppy unimpressed, Tom happy, Rose happy |
| Boppy | Put the date. Put the time. Use the sundial. It works now. | Grace proud, Tom happy |
| Boppy | Go on, you old bucket. Catch and release. I'll come by. No hooks. | Tom loving, Grace loving, Rose loving |
| Deep Pool | Iron-Gill sinks back into the Deep Pool, burping softly. The bubbles look almost friendly. | Tom loving, Boppy loving, Grace happy, Rose happy |
| Rose | Boppy, can we go home now? I want to tell Deedee EVERYTHING. | Boppy loving, Tom happy, Grace happy |
| Boppy | Everything except the pepper part. | Rose happy, Tom happy, Grace happy |
| Rose | ESPECIALLY the pepper part. | Boppy scared, Tom happy, Grace happy |

## scene: ch3End (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | There they are! Well? Did anybody catch anything? | Tom happy, Grace proud, Rose happy, Boppy proud |
| Boppy | Old Iron-Gill. Forty years, Dee. I TOLD everybody. | Deedee unimpressed, Tom happy, Grace happy, Rose happy |
| Deedee | Nobody believed you. | Boppy angry, Tom happy, Grace happy, Rose happy |
| Grace | I have proof. It's in my notebook. With the time. From a sundial. | Deedee proud, Boppy proud, Tom happy |
| Rose | Deedee! Boppy almost ate a PEPPER! On the pier! Before LUNCH! | Boppy scared, Deedee surprised, Tom happy, Grace happy |
| Deedee | Did he. | Boppy scared, Tom happy, Grace happy, Rose proud |
| Deedee | Hand me my glasses. I want to look at him properly. Where ARE my glasses. | Boppy scared, Rose happy, Tom happy, Grace happy |
| Rose | Apron pocket, Deedee! | Deedee loving, Tom happy, Grace happy |
| Deedee | Thank you, Rosie. Now. Let me look at him. | Rose proud, Boppy scared, Tom happy |
| Boppy | ...Almost isn't eating. Almost is fine. | Deedee unimpressed, Tom happy, Grace happy, Rose happy |
| Deedee | Sit down, you. I made rhubarb crisp. Everybody sit. And eat SLOWLY. | Boppy loving, Tom loving, Grace happy, Rose happy |
| Boppy | Slowly. Finally. Somebody in this family gets it. | Deedee unimpressed, Tom happy, Grace happy |
| Tom | Best fishing trip ever. Nobody fell in. Mostly. | Deedee happy, Boppy proud, Grace happy, Rose happy |
| Deedee | I love you all to the moon and back. Now eat. | Tom loving, Grace loving, Rose loving, Boppy loving |

## scene: CH4_AFTER (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Cut. Reset. Back to one. Everybody gets a touch-up. | Tom happy, Nara happy |
| Kiki | (on the radio) ...kkkt... Stage 7! The big door just unlocked itself! From the INSIDE! Is that bad? That feels bad. | Tom surprised, TNB scared, Nara scared |
| TNB | All three sets are clear. And Stage 7 just opened. That's where the fog came from. | Tom proud, Nara proud |

## scene: ch4Arrive (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Look who flew in for my big day. I'm on a forty-minute lunch. I spent thirty of it on the Metro. | Tom loving |
| Tom | You took the train to meet the plane. | TNB loving |
| TNB | I took the train to meet the man. The plane was a bonus. | Tom loving |
| TNB | Big shoot today. BACKLOT BEDLAM. Car chases, a saloon, a fake New York. I have forty costumes on one rack, and every single one is steamed. | Tom proud |
| TNB | Also, Olivia dropped Nara at your place again. Family trip to the desert. She's been howling at your front door since nine. | Tom surprised |
| Tom | Then we get Nara. Then I watch you be very important. I'm not joking. | TNB loving |
| TNB | Very, very important. I have a lanyard. | Tom happy |

## scene: ch4Nara (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Nara | A howl from 2nd Ave. Nara has spotted Tom from the porch, two whole blocks away. | Tom happy, TNB happy |
| Nara | She does three laps around Tom, slams into his shins, and leans on him with all forty pounds. | Tom loving, TNB happy |
| Tom | Hi. Hi. Yes. I know. I was gone FOREVER. It was six days. | Nara loving, TNB happy |
| TNB | She's coming to set. I already asked. Nobody said yes, but nobody said no fast enough. | Tom unimpressed, Nara happy |

## scene: ch4Gate (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Ray | Sunset Gold Studios. Closed set. Name? | Tom unimpressed, TNB unimpressed |
| TNB | Ray, it's me. Wardrobe. I left eighty minutes ago. You waved. | Tom happy, Ray unimpressed |
| Ray | I wave at everybody. That's the job. Go on in. | TNB unimpressed, Tom happy |
| Kiki | TNB! TNB! The rack! Rack two! It's GONE. | TNB surprised, Tom surprised, Nara surprised |
| TNB | Gone? It's a rack. It has wheels. It doesn't have ambitions. | Kiki scared, Tom happy |
| Kiki | It was right there in Stage 7. Then the fog machine turned itself on, and the lights went out, and things started CLAPPING. | TNB scared, Tom surprised, Nara scared |
| Dana | Dana Park. Director. First feature. Without wardrobe there's no shoot. Without a shoot there's no movie. | TNB sad, Tom unimpressed |
| Dana | And the Backlot is full of little grumpy things. One of them ate a cue card. One of them is clapping at the horse. | TNB surprised, Tom unimpressed, Nara happy |
| Tom | Friction Sprites. On a closed set. | TNB scared, Dana scared, Kiki scared |
| TNB | Babe. Forty costumes. I steamed every single one. By hand. While humming. | Tom loving, Dana sad |
| Tom | Then we go get them back. Nara, stay close. This is a professional environment. | TNB loving, Nara happy |
| Nara | Nara is already sniffing the craft services table. | Tom unimpressed, TNB happy |

## scene: ch4Snack (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Toni | Plain roast chicken. No salt, no skin, no sauce. I keep it for the grips. They're also picky. | Tom happy, TNB happy, Nara happy |
| Nara | Nara takes it very gently. Then she inhales it. Then she sits again, in case there's more. | Tom happy, TNB surprised, Toni loving |
| TNB | She's never eaten anything that fast. Not even my shoe. | Tom happy, Toni happy, Nara proud |
| Toni | Here. For the road. Don't tell the grips. | Tom loving, TNB happy, Nara happy |

## scene: ch4Fetch (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | The Backlot. Main Street up on the left, the Western street on the right, New York down on the left. All fake. All very expensive. | Tom surprised, Nara surprised |
| Nara | Nara’s ears go straight up. Something shiny is skittering across New York. | Tom scared, TNB surprised |
| Tom | Nara. NARA. Don't... | TNB scared, Nara happy |
| TNB | That's a closed set! She's not on the call sheet! | Tom unimpressed, Nara happy |
| Nara | Nara sniffs the fire hydrant. She gets VERY excited about the fire hydrant. | Tom unimpressed, TNB scared |
| TNB | She peed on the hydrant. That hydrant is fiberglass. That hydrant is a PROP. | Tom happy, Nara proud |
| Tom | She doesn't know that. Let her have this. | TNB unimpressed, Nara happy |
| Nara | She drops something at Tom’s feet. Very proud. Very slobbery. | Tom loving, TNB unimpressed |
| TNB | That's a costume tag. That's MY tag. WARDROBE, RACK 2, HAND WASH ONLY. I underlined it twice. | Tom surprised, Nara proud |
| TNB | And it smells like fog juice. The grape kind. Only Stage 7 has a fog machine. | Tom surprised, Nara happy |
| Tom | Good girl. Professional environment, very good girl. | Nara proud, TNB happy |
| TNB | Stage 7 is locked from the inside, though. And every set out here has a Sprite on it wrecking the shoot. The crew can't work like this. | Tom unimpressed, Nara scared |
| Tom | Then we clear the sets. One at a time. Main Street, the Western street, New York. | TNB proud, Nara proud |

## scene: ch4Crab (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Cue Card Crab | Pinch. This is MY set. I hold up the lines. Every line. I hold up this one: GO AWAY. | Tom unimpressed, TNB surprised, Nara angry |
| TNB | Those are the neatest cue cards I've ever seen. Is that calligraphy? | Tom unimpressed, Nara unimpressed |
| Cue Card Crab | ...Don't try to be nice to me. Nobody is nice to me. I'll PINCH. | TNB loving, Tom sad, Nara scared |
| TNB | Main Street is clear. The bank is safe. The pie is still foam. | Tom happy, Nara happy |

## scene: ch4Clapper (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Clapper Snapper | SNAP! Scene one, take one! SNAP! I go first! Nothing happens until I clap! SNAP! | Tom surprised, TNB unimpressed, Nara scared |
| Tom | It's very fast. And very loud. | TNB happy, Nara scared |
| TNB | That's every clapper I've ever met. | Tom happy |
| Tom | The Western street is clear. The horse can come out of its trailer now. | TNB happy, Nara happy |

## scene: ch4Moth (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Boom Mic Moth | Bzzz. I hear everything on this set. Everything. Your knees click, Tom. | Tom surprised, TNB happy, Nara angry |
| Tom | That was UNCALLED for! | TNB happy, Nara angry |
| TNB | Watch the screech, babe. It shuts you right up. No skills. | Tom unimpressed |
| TNB | New York is clear. It never looked better. It's plywood. | Tom happy, Nara happy |

## scene: ch4Stage (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Somebody killed the work lights. And look, the catwalk is up. You only raise a catwalk when you're hiding something up there. | Tom surprised, Nara scared |
| Tom | The stage set is at the top. The rack is up there. I can smell the steamer. | TNB happy, Nara proud |
| TNB | The main light rig runs the catwalk motor. If I get power back to it, the catwalk comes down. | Tom proud |
| TNB | Three junction boxes. They have to come up in the right order or the dimmer pops. The rig will tell us the order. | Tom unimpressed, Nara unimpressed |

## scene: ch4Rig (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Blue, amber, red. And one strip of gaffer tape. Okay, two. Okay, four. | Tom unimpressed, Nara happy |
| Soundstage 7 | The rig hums. The work lights bang on, one row at a time. Up the middle, the catwalk groans down into place. | Tom surprised, TNB proud, Nara scared |
| Tom | You fixed a whole soundstage with tape. | TNB proud |
| TNB | I fix everything with tape. You know this. Your kitchen drawer knows this. | Tom happy |

## scene: ch4Boss (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | My rack. MY RACK. All forty. Still steamed. Oh, I could cry. | Tom loving, Nara happy |
| The Director’s Cut | CUT! CUT! CUT! Who said you could walk onto my set? The blocking is WRONG. | Tom unimpressed, TNB surprised, Nara scared |
| The Director’s Cut | Forty years I've been on this lot. Forty years of bad takes, yelled through ME. Nobody ever gets it right. | Tom sad, TNB sad, Nara scared |
| Tom | You took the rack. | TNB angry |
| The Director’s Cut | If there are no costumes, there's no take. If there's no take, there's no BAD take. It's perfect. It's my best work. | Tom unimpressed, TNB surprised |
| TNB | Babe. It's a megaphone in a beret. It has notes. | Tom happy |
| Nara | Nara growls at the megaphone. Very small growl. Very serious. | Tom proud, TNB loving |
| Tom | This is a closed set. And you're not on the call sheet. | TNB proud, Nara proud |
| TNB | Back to one, everybody. Touch-ups. | Tom happy, Nara happy |
| TNB | Babe, when it says CUT, put WARDROBE on whoever is next. When it braces, Popcorn Jump. Or just tell it GREAT TAKE. Three times. | Tom proud |

## scene: ch4AfterBoss (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| The Director’s Cut | ...Great take. Nobody has ever said that to me. Forty years. Not once. | Tom loving, TNB loving, Nara surprised |
| The Director’s Cut | I think I'd like to hear it again. Somewhere quiet. On a shelf. | Tom loving, TNB loving |
| The Director’s Cut | Fine. FINE. That’s a wrap. On me. I'm going back in the prop closet. | Tom happy, TNB happy, Nara happy |
| Stage set | The megaphone hops off the rack and rolls away under the set, muttering about lighting. | Tom happy, TNB happy, Nara surprised |
| TNB | Forty. I counted. I'm going to count again. Forty. | Tom loving, Nara happy |
| TNB | And look. Somebody stuck a note on the steamer. "Paid in full." With a gold coin taped to it. | Tom surprised, Nara surprised |
| Tom | A gold coin. Again. Somebody keeps leaving these around. Somebody in a long coat, if Oolong’s kettle is right. | TNB surprised |
| TNB | Spooky. I love it. I hate it. Help me push. This thing has four wheels and four opinions. | Tom happy |

## scene: ch4End (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Dana | The rack! The costumes! We can shoot! We're shooting! That's a WRAP on today, everybody! | Tom happy, TNB happy, Nara happy, Kiki happy |
| Kiki | WRAP PARTY AT CRAFTY! Toni made a cake! It's shaped like a clapper! It's not clapping! | Tom happy, TNB happy, Nara happy, Dana happy |
| Dana | TNB, the studio wants you to have this. Gold-plated. It's the steamer from the lot’s very first wardrobe department. | Tom proud, TNB surprised, Kiki happy |
| TNB | I'm going to cry. I'm not going to cry. I'm a professional. I'm crying a little. | Tom loving, Dana loving, Nara loving |
| Tom | You're a professional. A crying professional. I'm so proud of you. | TNB loving, Dana happy |
| Dana | And crew jackets. Wrap Party Jackets. Only the crew gets one. You're crew now. Even the dog. | Tom happy, TNB proud, Nara proud, Kiki happy |
| TNB | You know what this whole day was? A real steam-ulating experience. | Tom unimpressed, Dana happy, Nara happy |
| Tom | ... | TNB happy |
| Tom | I flew three thousand miles for that pun. | TNB happy |
| TNB | Worth it? | Tom loving |
| Tom | Worth it. Every mile. But for the record? That was a CLOSED set! | TNB loving, Nara happy |
| Nara | Nara leans on both of them. A tiny excited puddle. Nobody minds. Craft services minds a little. | Tom loving, TNB loving |
| Tom | A text from Amy. "Parent-teacher conference night is Thursday. Thirty parents. I need backup. Bring snacks. And bring the good uncle." | TNB surprised |
| TNB | You're the only uncle. | Tom unimpressed, Nara happy |
| Tom | Which makes me the good one. By default. I'll take it. | TNB loving |

## scene: CH5_AFTER (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Up! Everybody up! Walk it off. Hydrate. We go again. | Tom unimpressed, Grace proud, Rose happy |

## scene: ch5Arrive (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | TOM. Oh, thank goodness. | Tom surprised, Grace happy, Rose happy |
| Amy | Two coffees. Both mine. Here, have one. That's how much I need you tonight. | Tom unimpressed, Grace happy |
| Tom | You brought me coffee. At night. That's a cry for help. | Amy unimpressed, Grace happy, Rose happy |
| Amy | It's conference night. Thirty parents at seven o’clock. And the school has lost its mind. | Tom surprised, Grace surprised, Rose surprised |
| Amy | The bells ring whenever they feel like it. Every clock says a different time. And the sign-up sheet ran off. | Tom surprised, Grace surprised, Rose surprised |
| Grace | Ran off? Like, RAN? On legs? | Amy unimpressed, Rose surprised, Tom unimpressed |
| Amy | On little paper legs. Mrs. Kowalski saw it. She's still upset about it. | Grace surprised, Rose happy, Tom unimpressed |
| Rose | Mom. Mom. Are we going to SCHOOL? At NIGHT? That's the best thing that ever happened. | Amy loving, Grace happy, Tom happy |
| Amy | Everybody is coming. I have a clipboard, and I'm not afraid to use it. | Tom unimpressed, Grace proud, Rose happy |

## scene: ch5Pruitt (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| School bell | BRRRRRING. From inside the school. Then again. Then a little one: brring? | Tom surprised, Amy angry, Grace scared, Rose scared, Pruitt scared |
| Principal Pruitt | Mrs. Gregori! Thank goodness. And you brought the whole family. | Amy happy, Tom happy, Grace happy, Rose happy |
| Amy | Principal Pruitt, my brother Tom. He's very good in a crisis. He's also very calm about it, which is annoying. | Tom unimpressed, Pruitt happy, Grace happy |
| Tom | Hello. I hear your bells are haunted. | Pruitt unimpressed, Amy unimpressed, Grace happy |
| Principal Pruitt | Not haunted. Grumpy. Thirty-one years in this building. I know the difference. | Tom unimpressed, Grace surprised, Rose surprised |
| Principal Pruitt | The bells ring at random. The clocks in the hall all say different times. And the sign-up sheet got up off the table and walked into the school. | Amy unimpressed, Grace surprised, Rose surprised, Tom unimpressed |
| Principal Pruitt | The Cafetorium doors run on the bell system. The bells run on the hallway clocks. Thirty parents are on their way, and those doors won't open. | Amy scared, Tom unimpressed, Grace surprised |
| Grace | Doors don't just not open. That's not how doors work. | Pruitt unimpressed, Amy loving, Tom happy |
| Principal Pruitt | Set every clock in the hall to seven. Seven o’clock. Not seven-thirty. Not six-fifty-nine. Seven. | Amy proud, Tom unimpressed, Grace proud |
| Rose | Tata. A school. At NIGHT. With MONSTERS, probably. | Tom unimpressed, Amy unimpressed, Grace scared |
| Tom | Stay close, everybody. This is a professional learning environment. | Amy unimpressed, Grace proud, Rose happy |

## scene: ch5Hall (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | ...Every clock in this hall says a different time. | Amy angry, Grace surprised, Rose surprised |
| Amy | That one says four. That one says nine. That one is going BACKWARDS. I teach time, Tom. This is personal. | Tom happy, Grace happy, Rose surprised |
| Rose | Tata! Tata! SPARKLY FOOTPRINTS! | Tom surprised, Amy surprised, Grace surprised |
| Rose | Little paper feet. With glitter. They go EVERYWHERE. | Tom happy, Amy happy, Grace surprised |
| Grace | I can read the doors. Room One is ART. Room Two is MUSIC. Room Three is the GYM. | Amy proud, Tom proud, Rose surprised |
| Grace | The gym isn't a room. It's a gym. It has a number anyway. | Amy happy, Tom happy, Rose unimpressed |
| Grace | The footprints go into all three. Then out again. Then east, to the Cafetorium. | Amy proud, Tom proud, Rose surprised |
| Amy | Girls. That's excellent detective work. Gold stars. Both of you. | Grace proud, Rose proud, Tom happy |
| Tom | Then we clear Art, Music and the Gym. After each one, we fix its clock. Seven o’clock. | Amy proud, Grace proud, Rose proud |

## scene: ch5Snack (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | FOR EVERYONE, LOVE DEEDEE. That's Deedee’s handwriting! Everyone means us! | Rose surprised, Tom surprised, Amy surprised, Halverson happy |
| Rose | Rhubarb crisp! Deedee brings the teachers CRISP? | Grace happy, Tom happy, Amy surprised |
| Mr. Halverson | Every conference night. Twelve years. It's the only reason Gary shows up. | Amy surprised, Tom happy, Grace happy, Rose happy |
| Amy | She never told me that. Of course she never told me that. | Tom loving, Grace loving |
| Tom | To the moon and back. And apparently to the staff room. | Amy loving, Halverson happy, Grace happy |
| Mr. Halverson | Take some for the road. Don't tell Gary. | Grace happy, Rose happy, Tom happy, Amy happy |

## scene: ch5Art (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Tardy Bell | DING! You're LATE! Everybody is late! I ring and I ring and nobody is ever on time! | Amy angry, Grace scared, Rose scared, Tom unimpressed |
| Amy | I've never been late in my life. Not once. Not even when I was born. I was early. | Tom unimpressed, Grace happy, Rose happy |
| Tardy Bell | ...DING. Prove it. | Amy proud, Tom happy |
| Grace | Tata, listen. The clock outside the Art room stopped spinning. | Tom proud, Amy proud, Rose happy |

## scene: ch5Music (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Glitter Glue | Squelch. I glued the piano. I glued the xylophone. I glued a recorder to a tuba. It's ART. | Tom unimpressed, Amy angry, Grace unimpressed, Rose surprised |
| Rose | Tata, it's SPARKLY. I love it. I hate it. I love it. | Grace unimpressed, Tom happy, Amy happy |
| Grace | You can't glue a xylophone. That's not how xylophones work. | Amy happy, Tom happy, Rose happy |
| Rose | The glitter footprints stop here! And over there. And on Tata. | Tom unimpressed, Grace happy, Amy happy |

## scene: ch5Gym (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Dodgeball Dread | BOING. Everybody against the wall. Nobody picks me first. Nobody EVER picks me first. | Amy surprised, Tom unimpressed, Grace scared, Rose scared |
| Amy | Oh, I remember you. Fourth grade. You and me. Every Friday. | Tom happy, Grace surprised, Rose surprised |
| Tom | Amy was the scariest kid in dodgeball. They had to make a rule about her. | Amy proud, Grace surprised, Rose surprised |
| Amy | The Gregori Rule. No throwing at teachers. It's still on the wall. | Tom happy, Grace happy, Rose happy |
| Amy | You know I was terrified of that thing? Every Friday. That's why I threw so hard. | Tom loving, Grace surprised, Rose surprised |
| Tom | I know. You threw one at me at Thanksgiving. I was holding a pie. | Amy happy, Grace happy, Rose happy |
| Amy | You caught the pie, though. | Tom unimpressed, Grace happy, Rose happy |
| Tom | I caught the pie. | Amy loving, Grace happy, Rose happy |

## scene: ch5Clocks (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| School bell | BRRRRRING. One bell. Right on time. Then silence. The good kind. | Tom proud, Amy happy, Grace happy, Rose happy |
| Principal Pruitt | (on the intercom) ...ksssh... Attention, please. The Cafetorium doors are OPEN. Parents, please wait in the hall. There's something in the Cafetorium. | Amy surprised, Tom unimpressed, Grace scared, Rose scared |
| Principal Pruitt | Mrs. Gregori’s brother, please go into the Cafetorium. Thank you. ...ksssh. | Amy happy, Grace happy, Rose happy, Tom unimpressed |
| Amy | The footprints go in there. The sign-up sheet must be in there. | Tom proud, Grace scared, Rose scared |
| Grace | And the something. | Tom unimpressed, Amy scared, Rose scared |

## scene: ch5Boss (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | There! The sign-up sheet! On the podium! | Tom proud, Amy happy, Rose surprised |
| Rose | It's covered in RED. | Tom surprised, Amy surprised, Grace scared |
| The Red Pen | Click. Wrong. Wrong. Wrong. Every name on this sheet is written wrong. | Amy angry, Tom unimpressed, Grace scared, Rose scared |
| The Red Pen | Kowalski has a W. Delgado has a G. Gregori has TWO Rs, and nobody ever writes them neatly. | Amy angry, Tom unimpressed, Grace unimpressed |
| Amy | That's the conference sign-up sheet. Thirty parents are waiting for it. | Tom proud, Grace proud |
| The Red Pen | A hundred thousand wrong answers, I've marked. Every quiz. Every spelling test. Every crooked line. | Tom sad, Amy angry, Grace scared, Rose scared |
| The Red Pen | Nobody ever grades ME. Nobody ever writes NEAT next to ME. So tonight, I grade the grown-ups. | Tom sad, Amy angry, Grace scared, Rose scared |
| Tom | You took the sign-up sheet to grade it. | Amy angry, Grace unimpressed |
| The Red Pen | And the bells. And the clocks. Late is late. Points off. | Tom unimpressed, Amy angry |
| Rose | Tata, it's a PEN. With GLASSES. | Tom happy, Amy unimpressed, Grace unimpressed |
| Amy | I'm going to count to three, and you're going to put the sheet down. One. | Tom happy, Grace proud, Rose scared |
| Tom | That's her teacher voice. I'd listen. | Amy proud, Grace happy, Rose happy |
| Amy | Up. Everybody. Walk it off. | Tom unimpressed, Grace proud, Rose proud |
| Amy | Tom, when it says SEE ME, step in front of them. Grace, Squishy anyone it circles. And somebody tell it its handwriting is nice. Three times. | Tom proud, Grace proud, Rose happy |

## scene: ch5AfterBoss (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| The Red Pen | ...Nice handwriting. Nobody has ever said that. A hundred thousand papers. Not once. | Tom loving, Amy loving, Grace surprised, Rose loving |
| The Red Pen | I fixed the spelling. And I gave everyone a gold star. In red. It's the only color I have. | Amy happy, Tom happy, Grace happy, Rose happy |
| The Red Pen | Click. Fine. FINE. Pencils down. I'm going back in my cup. | Tom happy, Amy unimpressed, Grace happy, Rose happy |
| Podium | The Red Pen clicks itself shut, rolls off the podium, and hops away down the hall toward the second grade room. | Amy surprised, Tom happy, Grace happy, Rose happy |
| Amy | ...It's going to my desk. Of course it's going to my desk. | Tom happy, Grace happy, Rose happy |
| Grace | The sign-up sheet! It's a bit crumpled. And look, Tata. Something is taped to the bottom. | Tom surprised, Amy surprised, Rose surprised |
| Tom | A gold coin. Again. Same little clock face. | Amy surprised, Grace surprised, Rose surprised |
| Tom | The sundial. The steamer. Now the sign-up sheet. Somebody keeps leaving these where we'll find them. | Amy surprised, Grace surprised, Rose surprised |
| Amy | Whoever it is has very neat tape. Look at those corners. | Tom unimpressed, Grace happy |
| Rose | Can we keep it? I'll keep it inside Lamby. | Tom unimpressed, Amy unimpressed, Grace unimpressed |
| Tom | We keep it. In my pocket. Not inside Lamby. | Rose sad, Amy happy, Grace happy |
| Principal Pruitt | The sheet! The bells! The clocks! Parents, come on in! Conference night is ON! | Amy happy, Tom happy, Grace happy, Rose happy |
| Conference night | For two hours, Amy talks to thirty parents. Grace hands out cookies. Rose tells everybody the pen had glasses. Tom stacks chairs and nods calmly. | Amy proud, Grace proud, Rose proud |
| Principal Pruitt | Mrs. Gregori. Best conference night in thirty-one years. Not one parent cried. Well. Mr. Delgado. Happy tears. | Amy proud, Tom happy, Grace proud, Rose happy |
| Principal Pruitt | This is for you. My Golden Stopwatch. Thirty-one Field Days. It's never once stopped early. | Amy surprised, Tom happy, Grace surprised, Rose surprised |
| Amy | Principal Pruitt, I can't take this. | Pruitt happy, Tom happy |
| Amy | ...I'm taking it. Thank you. | Pruitt loving, Tom loving, Grace happy, Rose happy |
| Principal Pruitt | And Field Day shirts. Staff shirts. You're all staff now. Even the small loud ones. | Amy happy, Tom unimpressed, Grace happy, Rose happy |

## scene: ch5End (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Thirty conferences. Zero tears. One very well-behaved pen. | Tom happy, Grace happy, Rose happy |
| Amy | Oh. A text. From Justin. | Tom happy, Grace surprised, Rose surprised |
| Amy | "Heard it went great. Proud of you. Stuck at work till nine. Save me some casserole." With a little heart. | Tom loving, Grace happy, Rose happy |
| Grace | Dad used the heart! He only uses the heart on special days! | Amy loving, Tom happy, Rose happy |
| Amy | Girls. Did we save some casserole for Daddy? | Grace scared, Rose scared, Tom happy |
| Rose | ...Define save. | Amy unimpressed, Tom happy, Grace unimpressed |
| Rose | Tata. Tata. There's a man. | Tom surprised, Amy surprised, Grace surprised |
| Rose | By the last car. In a long coat. He's looking at us. | Tom scared, Amy surprised, Grace scared |
| Tom | ...Nobody there. | Rose surprised, Grace scared, Amy unimpressed |
| Amy | Probably a parent. A late one. There's always a late one. | Tom unimpressed, Grace unimpressed, Rose unimpressed |
| Tom | Probably. | Amy happy, Rose unimpressed |
| Tom | A long coat. Gold coins. That's what Oolong’s kettle said, too. I'm keeping a list. | Amy surprised, Grace surprised, Rose scared |
| Grace | I'm keeping a list too. Mine has a chart. | Tom happy, Amy happy |
| Amy | Everybody in the van. Tom, you too. You were a good uncle tonight. By a lot. | Tom surprised, Grace happy, Rose happy |
| Tom | By default. | Amy unimpressed, Grace happy |
| Amy | By a LOT. Take the compliment, Tom. | Tom loving, Grace happy, Rose happy |

## scene: CH6_AFTER (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Okay. Shake it off. Everybody gets a snack and a hug. In that order. | Tom happy, Nara happy |

## scene: ch6Kitchen (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Okay. Hi. Missed you. Don't panic. Look at the island. | Tom loving |
| Tom | ...Where's Bready Mercury. | TNB scared |
| TNB | That's the thing. I came over to feed him, like you asked. The jar was gone. The window was open. | Tom scared |
| TNB | And there were tiny footprints in the flour. Four toes in front, five in back. I looked it up. | Tom surprised |
| Tom | Bready Mercury is nine years old. He has flown Delta One. Twice. | TNB loving |
| TNB | I know, babe. I've seen every horror movie ever made. This is exactly how they start. | Tom unimpressed |
| TNB | And this was on the windowsill. An acorn. With a tiny X carved in it. | Tom surprised |
| Tom | Somebody took my starter. And left a calling card. | TNB scared |
| Tom | That was UNCALLED for! | TNB happy |
| TNB | Olivia texted me too. Nara hasn't slept in three days. She just stands at the window and growls at trees. | Tom surprised |
| Tom | Nara is scared of the vacuum. Nara doesn't growl at trees. | TNB proud |
| TNB | Exactly. Something is going on out there. | Tom proud |

## scene: ch6Nara (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Tom! Oh, thank goodness. You already have her. She hasn't slept since Sunday. | Tom happy, TNB happy, Nara happy |
| Nara | Nara leans on Tom with all forty pounds. | Tom loving, TNB happy, Olivia loving |
| Nara | Then she spins around and growls at the jacaranda. | Tom surprised, TNB scared, Olivia scared, Tom surprised, TNB scared, Olivia scared |
| Olivia | Tom! Oh, thank goodness. Can you take her? Please? She hasn't slept since Sunday. | Tom loving, TNB happy, Nara happy |
| Nara | Nara does three laps around Tom, slams into his shins, and leans on him with all forty pounds. | Tom loving, TNB happy, Olivia happy |
| Olivia | That. All night. And it's not just us. Lachlan’s toy truck is gone. Mr. Washington’s reading glasses. Marisol says every tennis ball on the block. | Tom surprised, TNB surprised, Nara scared |
| Michael | I found my car keys in the gutter. With three peanuts. Arranged in a triangle. | Tom surprised, TNB surprised, Olivia unimpressed |
| TNB | A triangle. Babe. A triangle is a SYMBOL. | Tom unimpressed, Olivia unimpressed, Michael surprised |
| Tom | TNB has seen a lot of movies. | TNB proud, Olivia happy |
| Tom | ...He's usually right about this stuff. | TNB loving, Olivia surprised |
| Olivia | Bernadette from the Neighborhood Watch says it's squirrels. She has a clipboard about it. She's in Old Oak Park, at the south end of 2nd Ave. | Tom unimpressed, TNB happy |
| Tom | Nara. Want to go for a walk? | Nara happy, TNB happy, Olivia happy |
| Nara | Nara knows the word WALK. She's always known the word walk. She's already at the end of the street. | Tom happy, TNB happy, Olivia happy |
| Olivia | Bring her back tired! Please! Michael, can you grab Isla? She's licking the mailbox. | Tom happy, TNB happy |

## scene: ch6Park (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Bernadette | Halt. Neighborhood Watch. State your business. | Tom surprised, TNB surprised, Nara scared |
| Tom | Tom. 3468. I've lived on 2nd Ave for six years. | Bernadette unimpressed, TNB happy |
| Bernadette | I know who you are. You water your drought garden. Everybody knows. | Tom surprised, TNB happy |
| Bernadette | Bernadette. Neighborhood Watch Captain, nineteen years. And I'll say it, because nobody else will. | Tom unimpressed, TNB happy |
| Bernadette | The squirrels are organized. | Tom surprised, TNB surprised, Nara angry |
| TNB | I KNEW it. | Tom unimpressed, Bernadette proud |
| Bernadette | Lookouts in the playground. A spy in the community garden. Somebody at the picnic tables stuffing their cheeks with anything that's not nailed down. | Tom surprised, TNB happy, Nara angry |
| Bernadette | And it all goes up THAT tree. The Old Oak. There's a little door in the trunk. I've heard a secret knock. Only bits of it. | Tom surprised, TNB surprised, Nara surprised |
| Nara | Nara puts her nose to the grass and pulls. Hard. Left. Right. Back. Three fresh holes, three different directions. | Tom surprised, TNB surprised, Bernadette surprised |
| Tom | They buried something. Three somethings. | TNB surprised, Bernadette proud |
| Bernadette | Clear out those lookouts and your dog can dig. I'll be here. With my clipboard. | Tom proud, TNB happy, Nara happy |
| TNB | Babe, she has a corkboard with red string. I've never felt so seen. | Tom happy, Bernadette proud |

## scene: ch6Gallery (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Peanut Gallery | BOO! BOOOO! Get off the stage! This is OUR playground! | Tom unimpressed, TNB surprised, Nara angry |
| TNB | Is it heckling us? From inside a peanut? | Tom unimpressed |
| Peanut Gallery | Your shoes are untied! Made you look! BOOOO! | Tom unimpressed, TNB happy, Nara angry |
| Tom | My shoes don't have laces. | TNB happy |
| TNB | The playground is clear. And Nara is staring at the sandbox like it owes her money. | Tom happy, Nara proud |

## scene: ch6Spy (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Twig Spy | ...You didn't see me. I'm a stick. Sticks don't talk. | Tom unimpressed, TNB surprised, Nara surprised |
| TNB | That stick has binoculars. | Tom happy |
| Twig Spy | Standard issue. Code name: Twig. I report to the Chairman. Pretend I said nothing. | Tom surprised, TNB happy |
| Tom | The Chairman. | TNB surprised |
| Twig Spy | I said NOTHING. | Tom unimpressed, TNB happy |
| Tom | The garden is clear. Every tomato has exactly one bite out of it. That's a policy. | TNB happy, Nara happy |

## scene: ch6Stuffer (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Cheek Stuffer | Mmmf. Mmmf mmf! (These are MY sandwiches.) | Tom unimpressed, TNB happy, Nara angry |
| Tom | Those are somebody’s sandwiches. Somebody’s whole birthday picnic. | TNB sad |
| Cheek Stuffer | Mmf. (Winter is coming. Winter is ALWAYS coming.) | Tom unimpressed, TNB unimpressed |
| TNB | Buddy. It's Los Angeles. It's seventy-four degrees. | Tom happy |
| TNB | The picnic is clear. The cake survived. The cake is a hero. | Tom happy, Nara happy |

## scene: ch6DigScene (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Nara | Nara digs. Dirt goes everywhere. Mostly on TNB. | Tom happy, TNB unimpressed |
| Tom | Mr. Washington reads the paper on his porch every morning. He's been reading the same headline for three days. | TNB sad |
| TNB | We bring them back today. Personally. With a pastry. | Tom loving, Nara happy |
| TNB | That's all three scraps. One acorn, two acorns, three acorns. It's a sequence, babe. It's ALWAYS a sequence. | Tom unimpressed, Nara happy |
| Tom | One acorn: TAP TAP. Two acorns: SCRATCH. Three acorns: CHITTER. | TNB proud, Nara happy |

## scene: ch6Fetch (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Tom always keeps a heel of sourdough in his jacket. For emergencies. This is an emergency. | Nara happy, TNB happy |
| Nara | Nara catches it in midair. She runs one lap. Two laps. Six laps. She lies down on Tom’s feet and eats it very, very slowly. | Tom loving, TNB happy |
| TNB | She hasn't eaten in three days, and she just ate your emergency bread. | Tom unimpressed, Nara proud |
| Tom | She'll only eat bread if I throw it. Still true. Still very picky. Still very athletic. | TNB happy, Nara proud |

## scene: ch6Door (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Little door | A pause. Then, from inside, a tiny voice: "Password accepted. Welcome, Agent..." | Tom surprised, TNB surprised, Nara surprised |
| Little door | "...wait. You're very tall. Are you a squirrel?" | Tom unimpressed, TNB scared, Nara surprised |
| Tom | Yes. | TNB surprised, Nara happy |
| Little door | Running footsteps. Very small ones. Going up. | Tom unimpressed, TNB surprised |
| TNB | Babe. You lied to a squirrel. | Tom unimpressed, Nara happy |
| Tom | It lied to me first. It said it was an acorn. | TNB happy |

## scene: ch6Oak (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Babe. We're inside a tree. This is the second act of every horror movie I've ever seen. | Tom unimpressed, Nara scared |
| Tom | Then we stay together. | TNB loving, Nara loving |
| TNB | That's what they always say in the second act. | Tom unimpressed |
| Nara | Nara sniffs the air, and her tail goes straight up. Bread. Far above. Very faint. | Tom surprised, TNB surprised |
| Tom | He's up there. And there's no ladder. | TNB surprised, Nara happy |

## scene: ch6Board (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Babe. Babe. They have a corkboard. With RED STRING. I've waited my whole life for this. | Tom unimpressed, Nara happy |
| Corkboard | Photos of 2nd Ave. A map with X’s on every porch. A drawing of Nara, labeled THREAT LEVEL: VERY HIGH. | Tom surprised, TNB happy, Nara proud |
| Corkboard | In the middle, circled three times: Tom’s jar. Across the top: OPERATION BIG BREAD. | Tom angry, TNB surprised |
| Tom | That's my house. That's my JAR. Why is my jar in the middle of everything? | TNB happy |
| TNB | Everything connects to the jar, babe. That's how corkboards work. | Tom unimpressed |
| Corkboard | A note, pinned at the bottom: BY ORDER OF THE CHAIRMAN. WINTER IS COMING. HOARD EVERYTHING. | Tom surprised, TNB happy |
| Corkboard | Another note: SUPPLY LINE. ROPE LADDER. SEE BUCKET (PANTRY). | Tom surprised, TNB proud |
| Nara | Nara looks at the drawing of herself. She seems pleased with it. | Tom happy, TNB happy |

## scene: ch6Ladder (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | It's a counterweight. Put enough weight in the bucket and the ladder comes down. Classic pulley. | Tom proud |
| Tom | We need about forty pounds. | TNB surprised, Nara surprised |
| TNB | ... | Tom unimpressed, Nara scared |
| Tom | ... | TNB unimpressed, Nara scared |
| Tom | Nara. Sit. In the bucket. | Nara scared, TNB happy |
| Nara | Nara looks at the bucket. Nara looks at Tom. Nara gets in the bucket. | Tom loving, TNB happy |
| Nara | She'd do anything for Tom. She makes very sure he knows it. | Tom loving, TNB loving |
| Inside the Old Oak | CREEEEAK. The bucket sinks. Across the trunk, a rope ladder unrolls down the middle, all the way to the floor. | Tom surprised, TNB proud, Nara scared |
| Nara | Nara is out of the bucket before it stops moving. She leans on Tom with all forty pounds. | Tom loving, TNB happy |
| Tom | Very brave. Extremely brave. You'll be getting a lot of chicken. | Nara proud, TNB happy |

## scene: ch6Boss (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Babe. Look. On top of the pile. | Tom surprised, Nara surprised |
| Tom | BREADY MERCURY! | TNB happy, Nara happy |
| Chairman Cheeks | ORDER. ORDER! Who let a DOG into the Oak? | Tom unimpressed, TNB surprised, Nara angry |
| Chairman Cheeks | I'm the Chairman. Chairman Cheeks. Every acorn, every peanut, every shiny thing on 2nd Avenue comes up this tree. Because winter is coming. | Tom unimpressed, TNB happy, Nara angry |
| Tom | It's Los Angeles. Winter is a light jacket. | TNB happy |
| Chairman Cheeks | That's what they WANT you to think. | Tom unimpressed, TNB happy |
| Chairman Cheeks | And this jar. This jar smells like bread FOREVER. You feed it and it grows. It never runs out. It's the perfect hoard. | Tom angry, TNB surprised, Nara angry |
| Tom | That's Bready Mercury. He's nine. You feed him flour and water, and then you SHARE the bread. That's the whole point of him. | TNB loving, Nara proud |
| Chairman Cheeks | Share? ...Nobody shares. Not with a squirrel. Twenty years, and every bird feeder on the block has chased me off it. | Tom sad, TNB sad, Nara surprised |
| Nara | Nara growls. A very small growl. Very serious. She's waited three days for this. | Tom proud, TNB happy |
| TNB | It's a squirrel in a tiny tie, babe. I'm so scared and so delighted. | Tom happy, Nara angry |
| Tom | Put the starter down. No touching, please. | TNB proud, Nara proud |
| TNB | Okay. Shake it off. Everybody gets a snack. | Tom happy, Nara happy |
| TNB | Babe, when it buries an acorn, break it before it eats it. Nara digs them up for double. And maybe... share something with it. Three times. | Tom proud, Nara proud |

## scene: ch6AfterBoss (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Chairman Cheeks | ...Shared. You shared with me. Three times. Nobody has ever... I'm going to need a minute. | Tom loving, TNB loving, Nara surprised |
| Chairman Cheeks | Take the jar. And... could I maybe have a slice? Sometimes? | Tom loving, TNB loving, Nara happy |
| Tom | Saturdays. On my back fence. One slice. The heel. | TNB loving, Nara happy |
| Chairman Cheeks | The heel is the best part. | Tom happy, TNB happy |
| Chairman Cheeks | Fine. FINE. This meeting is adjourned. I'm going to go stare at a bird feeder. | Tom happy, TNB happy, Nara happy |
| The hoard | Chairman Cheeks hops off the hoard, straightens its tie, and scampers down the far side of the Oak. | Tom happy, TNB happy, Nara happy |
| Tom | Hello, Bready Mercury. Did you miss me? You were on an adventure. | TNB loving, Nara happy |
| Tom | You're going to be extremely sour about this. | TNB surprised |
| TNB | Was that a pun? Babe. Did you just make a PUN? | Tom proud, Nara happy |
| Tom | He's a starter. Sour is a compliment. | TNB happy |
| TNB | And look. Something taped to the lid. A gold coin. With a little clock face. | Tom surprised, Nara surprised |
| Tom | Squirrels hoard shiny things. Squirrels don't tape things. Look at those corners. | TNB surprised |
| Tom | The sundial. The steamer. The sign-up sheet. Now my jar. Somebody keeps leaving these where we'll find them. | TNB surprised, Nara happy |
| TNB | Somebody in a long coat, if your niece and your kettle are right. Spooky. I love it. I hate it. | Tom unimpressed, Nara happy |

## scene: ch6End (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Tom! You found everything! Marisol’s balls, Mr. Washington’s glasses, Lachlan’s truck. He hasn't put it down. He's eating cereal with one hand. | Tom happy, TNB happy, Nara proud |
| Bernadette | Neighborhood Watch Captain’s report: case closed. | Tom unimpressed, TNB happy, Olivia unimpressed |
| Bernadette | I'd like it noted that I was right. | Tom unimpressed, TNB happy, Olivia happy |
| TNB | Noted. On a corkboard. With red string. | Bernadette proud, Tom happy, Olivia happy |
| Michael | Lachlan wants Nara to have this. He painted a tennis ball gold. It took him four days and most of a bottle of paint. | Tom loving, TNB loving, Nara surprised, Olivia loving |
| Nara | Nara takes it very gently. She'll never let go of it again. She's going to sleep for twelve hours, holding it. | Tom loving, TNB loving, Olivia loving, Michael loving |
| Bernadette | And these. Neighborhood Watch Vests. I give out one every nineteen years. Today I'm giving out three. Even the dog. | Tom proud, TNB surprised, Nara proud, Olivia happy |
| TNB | You know what today was, babe? Absolutely nuts. | Tom unimpressed, Nara happy |
| Tom | ...That's not a pun. That's just a word. | TNB happy |
| TNB | It's a word with a pun in its heart. | Tom unimpressed |
| Tom | Fine. It was nuts. | TNB proud, Nara happy |
| Tom | A text from Grace. "TATA. The library is WHISPERING. Like actually. Page says it's fine. It's NOT fine. Come home." | TNB surprised, Nara surprised |
| TNB | The library is whispering. Is that not just... its job? | Tom unimpressed |
| Tom | Not on Long Island. On Long Island, the library shushes YOU. | TNB surprised |

## scene: CH7_AFTER (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Okay. Everybody up. I'm in charge of getting up. Up, up, UP. | Tom unimpressed, Rose happy |

## scene: ch7CardSteps (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | That's all three cards, Tata. Card one, card two, card three. Three gold letters. | Tom proud, Rose happy |
| Tom | A password for the Reading Room. In card order. | Grace proud, Rose happy |

## scene: ch7Arrive (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata. TATA. Did you get my text? I sent it from Mom’s phone. She said I could. She said it after. | Tom happy, Rose happy |
| Tom | I got it. The library is whispering. | Grace surprised, Rose surprised |
| Grace | Not a little bit. ALL the books. At the same time. And they're saying THINGS. | Tom surprised, Rose scared |
| Rose | A book told me Boppy eats cookies in the car. In the CAR, Tata. Before DINNER. | Tom happy, Grace unimpressed |
| Tom | ...That one is true. Everybody knows that one. | Rose surprised, Grace happy |
| Grace | A book told everybody I sing in the shower. Which is PRIVATE. Also I'm very good. | Tom happy, Rose happy |
| Grace | Page says everything is fine. Page has said fine eleven times. I counted. Nobody says fine eleven times if it's fine. | Tom unimpressed, Rose happy |

## scene: ch7Page (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Page | Oh! Tom. Girls. Welcome to the Hush Library. Everything is fine. | Tom unimpressed, Grace unimpressed, Rose happy |
| Grace | Twelve. | Page scared, Tom happy, Rose happy |
| Whispers | ...psst... Page hums in the elevator... psst... Page has never finished Moby Dick... psst... | Page scared, Tom unimpressed, Grace surprised, Rose happy |
| Page | ...It's not fine. It started a week ago. It comes up from the Stacks, downstairs. The old part. | Tom surprised, Grace proud, Rose scared |
| Page | Every book down there's whispering. Everything they ever heard. Seventy years of people reading quietly and thinking nobody was listening. | Tom surprised, Grace surprised, Rose surprised |
| Tom | Books overhear things. | Page scared, Grace surprised |
| Page | Books overhear EVERYTHING. That's why we whisper in here. It was never for the people. It's for the books. | Tom surprised, Grace surprised, Rose surprised |
| Rose | Are there monsters down there? Say yes. | Page scared, Tom unimpressed, Grace unimpressed |
| Page | There are three sections. Fiction, Nonfiction and Picture Books. And the Reading Room, at the very back. | Tom unimpressed, Grace proud, Rose unimpressed |
| Page | The Reading Room doors use the old card catalog lock. I lost the password in 1998. | Tom unimpressed, Grace unimpressed, Rose happy |
| Grace | I have read every book in the kids section. Twice. I can read ALL the signs. | Page happy, Tom happy, Rose unimpressed |
| Page | Then you're in charge of the signs. Here. The staff door is open. | Grace proud, Tom happy, Rose happy |
| Page | Please be careful. And please, don't answer the books. It only encourages them. | Tom unimpressed, Grace unimpressed, Rose happy |

## scene: ch7Stacks (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Whispers | psst... psst... the uncle is here... the TALL one... psst... he talks to his bread... | Tom unimpressed, Grace surprised, Rose happy |
| Tom | I do talk to my bread. It's part of the process. | Grace unimpressed, Rose happy |
| Rose | Tata. Tata. The books are looking at us. | Tom surprised, Grace scared |
| Grace | Books can't look. They don't have... okay, that one has eyes. | Tom unimpressed, Rose scared |
| Grace | FICTION is that way. NONFICTION is that way. PICTURE BOOKS are down there. The READING ROOM is at the top. | Tom happy, Rose unimpressed |
| Grace | I can read every sign. Rose can't read yet. | Rose angry, Tom unimpressed |
| Rose | I can read PICTURES. Pictures are harder. | Grace surprised, Tom happy |
| Grace | ...That's actually true. | Rose proud, Tom happy |
| Tom | Somebody down here knows the password. We ask nicely. Then we ask less nicely. | Grace proud, Rose happy |

## scene: ch7Story (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Lamby’s Big Day. Page one. Lamby woke up and decided it was going to be a big day. | Grace unimpressed, Rose happy |
| Rose | Do the voice. Do Lamby’s voice. | Tom unimpressed, Grace happy |
| Tom | (a very small voice) Today I'm going to jump on everybody. | Rose happy, Grace happy |
| Rose | THAT IS WHAT I DO. | Tom happy, Grace happy |
| Grace | Okay. That's actually a good book. Don't tell anyone I said that. | Tom loving, Rose happy |
| Whispers | All around the rug, the picture books go quiet. One of them says, very softly: ...again? | Tom loving, Grace surprised, Rose happy |

## scene: ch7Fic (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| The Cliffhanger | And then... the uncle walked into Fiction... and he saw... he saw... | Tom unimpressed, Grace unimpressed, Rose surprised |
| Tom | Saw what. | Grace unimpressed, Rose surprised |
| The Cliffhanger | Find out next time! | Tom unimpressed, Grace angry, Rose unimpressed |
| Grace | That's SO annoying. Finish your SENTENCES. | Tom happy, Rose happy |
| Rose | Tata. What did you see? When you walked into Fiction? | Tom unimpressed, Grace unimpressed |
| Tom | A green book being very dramatic. | Grace happy, Rose happy |

## scene: ch7Non (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| The Know-It-All | Actually, it's li-BRAR-y. Two Rs. Everybody says it wrong. Actually. | Tom unimpressed, Grace angry, Rose happy |
| Grace | Actually, I KNOW that. Actually, I said it right. | Tom unimpressed, Rose happy |
| The Know-It-All | Actually, you said it bossy. | Grace angry, Tom happy, Rose happy |
| Rose | Tata. It sounds like Grace. | Grace angry, Tom happy |
| Grace | It does NOT sound like me. Tata. Tell her. | Tom scared, Rose happy |
| Tom | ...Let's focus on the encyclopedia. | Grace unimpressed, Rose happy |
| Grace | Tata. Am I a know-it-all? Be honest. Actually, don't be honest. | Tom loving, Rose happy |
| Tom | You know a lot. And you tell people. Those are two different things, and only one of them needs a little work. | Grace sad, Rose surprised |
| Tom | The other one is why you're in charge of the signs down here. | Grace proud, Rose happy |
| Grace | ...Okay. I can work on the telling part. A little. Starting tomorrow. | Tom loving, Rose unimpressed |

## scene: ch7Pic (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Pop-Up Panic | BOO! | Tom surprised, Grace scared, Rose scared |
| Rose | AAAAH! | Tom surprised, Grace scared |
| Rose | ...Hey. HEY. Nobody scares ME. I do the scaring. That's MY job. | Tom happy, Grace surprised |
| Pop-Up Panic | ...Boo? | Rose proud, Tom happy, Grace happy |
| Rose | BOOOOOOO! | Tom surprised, Grace surprised |
| Pop-Up Panic | AAAAH! | Rose proud, Tom happy, Grace happy |
| Grace | Rose. You scared a book. | Rose proud, Tom happy |
| Rose | Tata, did you see? I scared it back. It was TERRIFIED. | Tom proud, Grace unimpressed |
| Tom | It was terrified. Best scaring I've ever seen. Ten out of ten. | Rose proud, Grace happy |

## scene: ch7Door (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Reading Room doors | Click. Click. CLUNK. The brass drawer slides shut by itself. | Tom surprised, Grace surprised, Rose surprised |
| Whispers | All through the Stacks, every book stops whispering at once. | Tom surprised, Grace surprised, Rose scared |
| Whispers | Then, from behind the doors, one voice. Old. Dry. Very slow. "...Who's there?" | Tom surprised, Grace scared, Rose scared |
| Rose | Tata. The door talked. | Tom unimpressed, Grace scared |
| Tom | The thing behind the door talked. Stay close. | Grace scared, Rose scared |

## scene: ch7Boss (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata. On the dais. It's a book. A really, REALLY big book. | Tom surprised, Rose surprised |
| The Unread | ...Visitors. Nobody comes to the Reading Room. Nobody has come since 1952. | Tom surprised, Grace surprised, Rose scared |
| Tom | You're the one whispering. | Grace scared, Rose scared |
| The Unread | I'm the oldest book in the Stacks. Seventy years on this shelf. Nobody has checked me out. Nobody has opened me. Not once. | Tom sad, Grace sad, Rose sad |
| The Unread | So I listened. Everybody who ever sat in this room thought nobody could hear them. I heard ALL of it. | Tom unimpressed, Grace scared, Rose surprised |
| The Unread | If nobody will read me, then I'll read THEM. Out loud. To everybody. | Tom angry, Grace angry, Rose scared |
| Rose | You told everybody Boppy eats cookies in the car. | Tom unimpressed, Grace angry |
| The Unread | He does. In the CAR. | Tom unimpressed, Grace angry, Rose happy |
| Grace | You can't just tell people’s secrets! That's the rudest thing a book can do! That's a RULE! | Tom proud, Rose happy |
| The Unread | Then read me. Go on. Nobody ever does. | Tom sad, Grace unimpressed, Rose sad |
| Tom | Girls, behind me. No touching, please. | Grace proud, Rose scared |
| Grace | Up, everybody. I'm in charge now. | Tom happy, Rose happy |
| Grace | Tata, it TELLS us its chapter. Mystery, Chatter. Adventure, Kinetic. Read the message. And maybe somebody should just read it. Out loud. Three times. | Tom proud, Rose proud |

## scene: ch7AfterBoss (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| The Unread | ...You read me. Out loud. With VOICES. | Tom loving, Grace proud, Rose proud |
| The Unread | Seventy years. That was the best chapter of my whole life. It was chapter one. | Tom loving, Grace loving, Rose loving |
| Rose | I did the dragon. | Tom proud, Grace unimpressed |
| The Unread | You were a wonderful dragon. | Rose proud, Tom loving, Grace happy |
| The Unread | ...Fine. The end. I'll be quiet. I'm very good at quiet. I've had a lot of practice. | Tom happy, Grace happy, Rose happy |
| The Reading Room | The Unread closes, very slowly, and settles onto the lectern. The green lamps stop flickering. | Tom loving, Grace loving, Rose loving |
| Grace | Tata, something fell out of it. Something gold. It was being used as a bookmark. | Tom surprised, Rose surprised |
| Tom | A gold coin. Same little clock face. | Grace surprised, Rose surprised |
| Tom | The sundial. The steamer. The sign-up sheet. My jar. Now a book nobody has opened since 1952. | Grace surprised, Rose surprised |
| Grace | Somebody DID open it, then. To put the coin in. | Tom surprised, Rose surprised |
| Grace | And look. The checkout card, in the pocket. One stamp. DUE BACK 1952. No name. Just a little clock. | Tom surprised, Rose surprised |
| Rose | Somebody took it out and didn't READ it? That's so sad. | Tom sad, Grace sad |
| Tom | And brought it back with a coin in it. Look at those corners. Very neat. | Grace surprised, Rose surprised |
| Tom | I'm adding it to the list. | Grace proud, Rose happy |
| Grace | I'm adding it to MY list. Mine has a chart AND a key now. | Tom happy, Rose unimpressed |

## scene: ch7End (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Page | Listen. It's quiet. Properly quiet. The good kind. The dictionaries are snoring. | Tom happy, Grace happy, Rose happy |
| Grace | It just wanted somebody to read it. That's all. All of it was because nobody read it. | Tom loving, Rose sad, Page loving |
| Page | Then we'll read it. Story time, Saturdays, out loud. And I think I know who should do the voices. | Grace surprised, Tom happy, Rose happy |
| Page | Grace. This is for you. A Gold Library Card. No limit. No late fees. Ever. | Grace surprised, Tom proud, Rose surprised |
| Grace | No late fees. EVER? Tata. I'm going to take out every book. Every single one. Alphabetically. | Tom unimpressed, Rose happy, Page happy |
| Page | And sweaters. I knit one every winter. I have run out of people. Please take some. | Tom unimpressed, Grace happy, Rose surprised |
| Rose | It's itchy. I love it. | Tom happy, Grace unimpressed, Page happy |
| Tom | A text from TNB. "Babe. Bernadette signed you up for the 2nd Ave potluck. You're on bread. For forty people." | Grace surprised, Rose surprised |
| Tom | "I said yes for you. You're welcome. Bring the starter." | Grace happy, Rose happy |
| Grace | Forty people? Tata. That's a FEAST. | Tom unimpressed, Rose happy |
| Tom | ...Bready Mercury is going to need a bigger jar. | Grace happy, Rose happy |

## scene: CH8_AFTER (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Okay. Up. Everybody up. Hot cocoa later. Lots of it. | Tom happy, Nara happy |

## scene: ch8PilotSteps (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Nara | Nara sniffs it. It's warm. Her tail goes like a propeller. | Tom loving, TNB happy |
| TNB | That's three, babe. And that little steam motor by the turntable has three empty burners. Three. I can fix that. | Tom proud, Nara happy |
| Tom | You can fix anything. | TNB loving |
| TNB | I can fix most things. I fixed your dishwasher with a butter knife. | Tom unimpressed |

## scene: ch8Block (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Well, well, well... | Tom loving |
| TNB | Hi. Missed you. Don't panic. Touch your stove. | Tom surprised |
| Tom | ...I haven't been home yet. | TNB happy |
| TNB | Right. Well, it's cold. Everybody’s is cold. I tried to light yours. The flame LEANED, babe. Sideways. Toward the boulevard. Like it wanted to leave. | Tom surprised |
| Bernadette | Tom. Good. Neighborhood Watch Captain, potluck committee chair. Forty RSVPs. Thirty-nine dishes. One bread guy. | Tom unimpressed, TNB happy |
| Bernadette | Every pilot light on 2nd Avenue went out at noon. Every one. Including mine. I had a casserole IN there. | Tom surprised, TNB surprised |
| Tom | Did you call the gas company? | Bernadette angry, TNB happy |
| Bernadette | They said it's the weekend. I said it's the POTLUCK. They hung up. I've filed a report. With myself. | Tom unimpressed, TNB happy |
| Olivia | Tom! Can you take Nara? She won't eat. Her dinner is cold, so she won't eat it. Michael warmed it in his hands. She still won't eat it. | Tom surprised, TNB surprised, Nara sad |
| Nara | Nara slams into Tom’s shins and leans on him with all forty pounds. Then she turns, points her nose east, and sniffs. Hard. | Tom loving, TNB surprised, Olivia happy |
| TNB | East. Toward the end of the boulevard. Babe. The old Car Barn. Division Nine. The streetcars ran out of there until 1963. | Tom surprised, Nara surprised |
| TNB | I've wanted to go in there since I MOVED here. | Tom loving, Nara happy |
| Bernadette | The barn? It's been chained up for sixty years. Here. Committee key. I'm the committee. We're closing the boulevard for the tables. Bread by six. | Tom unimpressed, TNB happy, Nara happy |
| Olivia | Bring her back fed! Please! Michael, Isla is eating the lasagna. It's a brick. She's eating a brick. | Tom happy, TNB happy, Nara happy |

## scene: ch8Barn (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Oh. Oh, babe. Look at it. The tracks are still in the floor. The time clock. The crew bench. I'm going to cry a little. | Tom loving, Nara happy |
| Tom | It's beautiful. You can cry a little. I'll wait. | TNB loving |
| Tom | ...It's also freezing in here, and it's seventy-four degrees outside. | TNB surprised, Nara scared |
| Nara | Nara watches a little blue flame drift past her nose, along the floor, toward the back. Then another one. Then another. | Tom surprised, TNB surprised |
| Tom | Those are pilot lights. The whole block’s pilot lights. Something down here is collecting them. | TNB surprised, Nara surprised |
| TNB | And some of them got stuck. Look. The Paint Shop, the Machine Shop, the Lunchroom. Something in each one is hogging one. | Tom proud, Nara surprised |

## scene: ch8Paint (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Wet Blanket | ...Oh. Visitors. Great. I suppose you want that little flame. | Tom unimpressed, TNB unimpressed, Nara surprised |
| Wet Blanket | Why bother. It's just going to go out. Everything goes out eventually. | Tom unimpressed, TNB sad, Nara sad |
| TNB | Wow. Okay. Big mood, buddy. | Tom happy |
| Tom | That flame is a gumbo. Forty years of gumbo. Hand it over. | TNB proud, Nara proud |
| TNB | It dried out a little. Look. It's almost fluffy. It's a blanket again. | Tom loving, Nara happy |

## scene: ch8Shop (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| The Draft | Wooooo. Pfft. Pfft. Pfft. That was me. I blew them all out. Every stove on the block. | Tom angry, TNB surprised, Nara angry |
| The Draft | Ironbelly asked for the flames, so I carried them. I'm a delivery draft. | Tom surprised, TNB surprised, Nara angry |
| Tom | Who's Ironbelly. | TNB surprised |
| The Draft | Wooooo. I said nothing. I'm just air. | Tom unimpressed, TNB unimpressed |
| TNB | Babe, close a door on it. Any door. | Tom happy, Nara happy |
| Tom | Ironbelly. Somebody named Ironbelly wanted every flame on 2nd Ave. | TNB surprised, Nara surprised |
| TNB | That's either a boat or a stove. In a car barn, babe, it's a stove. | Tom happy, Nara happy |

## scene: ch8Lunch (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| The Picky Eater | Ew. EW. Who are you. What's that. Is that a dog? Ew. Is that BREAD? Bread is the worst. Bread TOUCHES things. | Tom unimpressed, TNB surprised, Nara surprised |
| Nara | Nara looks at the lunchbox. The lunchbox looks at Nara. Two very picky eaters. Nobody blinks. | Tom happy, TNB happy |
| TNB | Babe. It's her. It's Nara as a lunchbox. | Tom happy, Nara unimpressed |
| Tom | That flame is my oven. My forty loaves. Put it down. No touching, please. | TNB proud, Nara proud |
| The Picky Eater | ...Fine. FINE. Take it. I'll try a bite of something. Later. Maybe. If it's warm. And not touching. | Tom happy, TNB happy, Nara happy |
| Nara | Nara nods. She understands completely. | Tom happy, TNB happy |

## scene: ch8Plate (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Tom takes out the sandwich he packed for himself. Turkey, mustard, his own sourdough. He puts it on his own plate. He sits down. | TNB happy, Nara surprised |
| Nara | Nara is at his elbow in half a second. She looks at the sandwich. She looks at Tom. She takes the whole thing, very gently, off his plate. | Tom unimpressed, TNB surprised |
| Nara | She eats it in three bites. She licks the plate. She lies down on his feet. | Tom loving, TNB happy |
| TNB | She wouldn't eat her own dinner. She ate YOUR dinner. | Tom happy, Nara proud |
| Tom | It was on my plate. That's the rule. Food on her plate is suspicious. Food on my plate is a gift. | TNB happy, Nara proud |

## scene: ch8Pail (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | A note taped inside the lid: FOR THE NEXT SHIFT. HAVE A GOOD RUN. BOOKER W. | TNB loving, Nara happy |
| Tom | And a picnic basket. Somebody packed it a very long time ago. It's somehow fine. | TNB surprised, Nara happy |
| TNB | Babe. Somebody left lunch for the next guy. Sixty years ago. That's the nicest thing I've ever seen in a train yard. | Tom loving, Nara happy |

## scene: ch8Motor (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Okay. Burner one. Burner two. Burner three. Righty tighty. Lefty... no, righty. Righty tighty. | Tom unimpressed, Nara surprised |
| Turntable motor | FWOOMP. Three little blue flames catch under the boiler. The needle on the gauge creeps up. The pipes start to tick. | Tom surprised, TNB proud, Nara scared |
| TNB | Steam. We have STEAM, babe. I fixed a hundred-year-old turntable motor. I'm going to put this on my resume. | Tom proud, Nara happy |
| Tom | Put it at the top. New section. | TNB proud, Nara happy |
| TNB | Under hero. | Tom loving, Nara happy |

## scene: ch8Turn (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Turntable | CLANK. Hissss. The whole turntable groans, and the bridge swings slowly round, rails and all, until it lines up with Track 4. | Tom surprised, TNB surprised, Nara scared |
| TNB | Babe. BABE. We turned a turntable. Do you know how many people get to turn a turntable? Like eleven. | Tom happy, Nara happy |
| Nara | Nara sniffs the air across the pit. Warm. Bread-oven warm. Her ears go flat, then up, then flat. | Tom surprised, TNB surprised |

## scene: ch8Boss (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Babe. It's warm in here. Like, really warm. Like, opening-the-oven-door warm. | Tom surprised, Nara surprised |
| Old Ironbelly | ...Who's in my Boiler Room. Nobody comes down here. Not since the last car went out. 1963. | Tom surprised, TNB scared, Nara angry |
| Old Ironbelly | I'm Old Ironbelly. 1912. Cast iron, all the way through. Biscuits for the night crew, every night, for fifty-one years. Cornbread on Fridays. | Tom unimpressed, TNB surprised, Nara surprised |
| Tom | You took every pilot light on 2nd Avenue. | TNB proud, Nara angry |
| Old Ironbelly | Everybody up there has a little fire. I've been cold for sixty years. I only borrowed some. | Tom sad, TNB sad, Nara sad |
| Old Ironbelly | And look at me. I'm WARM again. I'm five hundred degrees. Do you know how long it's been since I was five hundred degrees? | Tom unimpressed, TNB surprised, Nara surprised |
| TNB | On the day of the POTLUCK, though. | Tom happy, Nara angry |
| Old Ironbelly | A potluck. Everybody brings a dish. Nobody ever brings anything to the oven. Nobody has put a single thing in me since 1963. | Tom sad, TNB sad, Nara sad |
| Nara | Nara growls. A small growl. She's very hungry, and very serious. | Tom proud, TNB happy |
| Tom | Give the flames back. No touching, please. | TNB proud, Nara proud |
| TNB | Okay. Up. Everybody up. That was hot. That was SO hot. | Tom happy, Nara happy |
| TNB | Babe, Splash cools her down. Cozy stokes her up, so not too much of that. And she wants somebody to bake something in her. Three times. | Tom proud, Nara proud |

## scene: ch8AfterBoss (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Old Ironbelly | ...Bread. There's bread in me. And a little pot. And a dog’s dinner. Sixty years of nothing, and now THIS. | Tom loving, TNB loving, Nara happy |
| Old Ironbelly | I don't need all those little flames. I can make my own fire. I always could. I just needed something to make it FOR. | Tom loving, TNB loving, Nara happy |
| Tom | Forty loaves. Tonight. You're the only oven on 2nd Ave hot enough for Bready Mercury. | TNB proud, Nara happy |
| Old Ironbelly | Then bring me the dough, baker. And don't open the door. I'll know. | Tom happy, TNB happy, Nara happy |
| Old Ironbelly | ...Fine. FINE. Take your little flames back. I'll be cold again. I'm used to it. | Tom sad, TNB sad, Nara sad |
| Tom | Or. Forty loaves. Tonight. You're the only oven on 2nd Ave hot enough. | TNB proud, Nara happy |
| Old Ironbelly | ...Forty? Nobody has asked me for forty anything since 1963. Bring the dough. | Tom happy, TNB happy, Nara happy |
| The Boiler Room | The little blue flames lift off her grate, one by one, and drift up the flue toward 2nd Avenue. Her own fire settles in, low and gold. | Tom loving, TNB loving, Nara surprised |
| The Boiler Room | Two hours later. | Tom happy, TNB happy, Nara happy |
| TNB | Forty loaves, babe. FORTY. They're crackling. Listen to them. They're singing. | Tom proud, Nara happy |
| Old Ironbelly | That's the crust. That's what crust does when it's done right. Here. Take my peel. Fifty-one years of biscuits. It wants to work again. | Tom loving, TNB surprised, Nara happy |
| Nara | Nara is digging in the ash pan. Nara has found something. Nara is very proud of it. | Tom surprised, TNB happy |
| Tom | A gold coin. Same little clock face. | TNB surprised, Nara proud |
| Tom | The sundial. The steamer. The sign-up sheet. My jar. The book from 1952. And now an oven nobody has opened since 1963. | TNB surprised, Nara happy |
| TNB | Somebody keeps getting into places nobody gets into. Very neat. Very quiet. Very spooky. I love it. I hate it. | Tom unimpressed, Nara happy |
| Tom | Look at the corners. Not a speck of ash on it. Somebody put it there after the fire went out. I'm adding it to the list. | TNB surprised, Nara happy |

## scene: ch8End (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Bernadette | Forty loaves. Six o’clock. On the dot. Potluck committee report: we're a success. | Tom proud, TNB proud, Nara happy |
| Bernadette | The gumbo is hot. The casserole is hot. Everything is hot. I'd like it noted. | Tom unimpressed, TNB happy |
| TNB | Noted, Bernadette. | Bernadette proud, Tom happy |
| Olivia | Tom. TOM. Nara is eating. Look at her. She's EATING. | Tom loving, TNB happy, Nara happy |
| Nara | Nara is eating bread off Tom’s plate. Tom put it there for her. She knows exactly what she's doing. | Tom loving, TNB loving, Olivia happy |
| Mr. Washington | Tom. Come here. This was my daddy’s. He drove the 7 line out of that barn for thirty years. Night run. He swore by the biscuits. | Tom surprised, TNB loving, Nara happy |
| Mr. Washington | He'd want it on somebody who went back in there and lit that stove. Here. | Tom surprised, TNB loving, Nara happy |
| Tom | ...Thank you. I'll take very good care of it. | Washington loving, TNB loving |
| Mr. Washington | I know you will. Now stand up straight. He'd say that too. | Tom happy, TNB happy |
| Michael | Lachlan has eaten three rolls and fallen asleep in the bread basket. I'm leaving him there. He's happy. | Tom happy, TNB happy, Olivia loving |
| TNB | You know what tonight was, babe? Toast. | Tom unimpressed, Nara happy |
| Tom | ... | TNB happy, Nara happy |
| TNB | Because the bread. And we're TOASTING. It works on two levels. | Tom unimpressed, Nara happy |
| Tom | It works on one level. Barely. | TNB happy |
| Tom | ...I love that level. | TNB loving, Nara happy |
| Tom | A text from Deedee. "Honey. A letter came for you at our house. Fancy envelope. Gold wax seal with a little clock on it." | TNB surprised, Nara surprised |
| Tom | "It says THE MOON CLUB. Nobody gets invited to the Moon Club. I've lived here forty years. I love you to the moon and back. Call me." | TNB surprised, Nara happy |
| TNB | The Moon Club. Babe. That's a secret society. I've seen this movie. Several times. It never goes well for the tall one. | Tom unimpressed, Nara scared |
| Tom | A little clock. On the seal. | TNB scared, Nara scared |

## scene: CH9_AFTER (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Okay, everybody up. Deedee is a nurse. Up, up. Little sip of water. Good. | Tom happy, Boppy unimpressed |

## scene: ch9MirrorSteps (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Three mirrors. Three stands. One little moonbeam. I didn't drive a car for forty years without learning about mirrors. | Tom unimpressed, Deedee unimpressed |
| Deedee | You drove into the mailbox twice, honey. | Boppy angry, Tom happy |
| Boppy | The mailbox moved. | Deedee unimpressed, Tom happy |

## scene: ch9Arrive (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata. TATA. Deedee has a LETTER for you. It's GOLD. She won't let us open it. | Tom surprised, Rose happy |
| Grace | She let us hold it. For one second. Then she took it back and said, careful, that's wax. | Tom happy, Rose happy |
| Rose | It smells like a candle. I licked it a little. | Tom unimpressed, Grace unimpressed |
| Tom | You licked my mail. | Rose happy, Grace happy |
| Rose | A LITTLE. | Tom happy, Grace unimpressed |
| Grace | Also the moon is gone. Look. It's supposed to be a full moon. Luna said so. Luna is very upset. | Tom surprised, Rose scared |
| Tom | ...There's no moon. | Grace scared, Rose scared |
| Tom | There's no moon, and I have a gold letter. Okay. | Grace surprised, Rose surprised |

## scene: ch9Letter (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Tom! There you are. Sit. No, stand. Read it. Read it out loud. I have read it eleven times. | Tom surprised, Boppy unimpressed, Grace happy, Rose happy, Aunt Ellie unimpressed |
| Tom | "THE MOON CLUB requests the pleasure of TOM. Tonight, at moonrise. Admit three. Adults only. Dress: your very best." | Deedee proud, Boppy unimpressed, Grace surprised, Rose surprised, Aunt Ellie surprised |
| Tom | Gold wax seal. A little clock on it. | Deedee surprised, Grace surprised, Rose surprised |
| Grace | ADULTS ONLY? I'm basically an adult. I have a YouTube channel. I have a SKINCARE ROUTINE. | Tom unimpressed, Deedee happy, Boppy unimpressed, Rose happy, Aunt Ellie happy |
| Rose | I'm six. Is six adults? | Tom happy, Deedee loving, Grace unimpressed, Aunt Ellie happy |
| Aunt Ellie | Girls. You're staying with me. I brought cards. I cheat. You'll learn a great deal. | Grace surprised, Rose happy, Tom happy, Deedee happy |
| Deedee | Forty years I've lived in this town. Every full moon, the lights used to go on in that dome above Luna’s. Nobody I know has ever been invited. Not once. | Tom surprised, Boppy unimpressed, Aunt Ellie unimpressed |
| Deedee | Admit three, Tom. You. Me. And Boppy. | Tom surprised, Boppy unimpressed, Grace sad, Rose sad |
| Boppy | I'm not wearing a tie. | Deedee unimpressed, Tom happy, Grace happy, Rose happy |
| Deedee | You're wearing the tie. | Boppy angry, Tom happy, Grace happy, Rose happy, Aunt Ellie happy |
| Boppy | ...I'm wearing the tie. | Deedee proud, Tom happy, Grace happy, Rose happy, Aunt Ellie happy |
| Aunt Ellie | The Moon Club. I haven't heard that name since 1971. | Tom surprised, Deedee surprised, Grace surprised, Rose surprised |
| Tom | You went? | Aunt Ellie proud, Deedee surprised |
| Aunt Ellie | Darling, I went to everything. The last dance. A big silver ball turned all night. Then they locked the doors and nobody ever said why. | Tom surprised, Deedee surprised, Grace surprised, Rose surprised, Boppy unimpressed |
| Aunt Ellie | I left a coat there. Purple velvet. I was in a hurry. | Tom unimpressed, Deedee happy |
| Deedee | And now the moon is missing. Three nights. I power walk at nine. I walked straight into the Hendersons’ hedge. | Tom surprised, Boppy happy, Grace happy, Rose happy, Aunt Ellie unimpressed |
| Tom | A missing moon, a locked club, and a little gold clock. Everybody get your shoes. | Deedee proud, Boppy unimpressed, Grace sad, Rose sad, Aunt Ellie loving |

## scene: ch9Luna (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Luna | Oh! Visitors. At night. Is that... is that an INVITATION? | Tom happy, Deedee happy, Boppy unimpressed |
| Tom | The Moon Club. Tonight. Admit three. | Luna surprised, Deedee proud |
| Luna | Twelve years I have swept this floor. That little silver door in the back has never once opened. I thought it was a closet. | Tom surprised, Deedee loving, Boppy unimpressed |
| Luna | And my telescope can't find the moon. It's not behind a cloud. It's not anywhere. It's just GONE. | Tom sad, Deedee sad, Boppy unimpressed |
| Deedee | Honey, show her the seal. | Tom happy, Luna surprised |
| Little silver door | Tom holds up the invitation. The brass moon on the little door clicks, and the door swings open by itself. | Tom surprised, Deedee surprised, Boppy surprised, Luna surprised |
| Luna | ...It wasn't a closet. | Tom happy, Deedee happy, Boppy unimpressed |
| Boppy | Stairs. Of course it's stairs. Nobody take them fast. | Tom happy, Deedee unimpressed |

## scene: ch9Club (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Oh. Oh, Tom. It's beautiful. | Tom surprised, Boppy unimpressed |
| Deedee | It's FILTHY. Fifty years of dust. Somebody hand me a mop. | Tom happy, Boppy unimpressed |
| Boppy | Nobody is here. A party and nobody is here. | Tom unimpressed, Deedee sad |
| Tom | Look at the east window. Moonlight. Just a thread of it. | Deedee surprised, Boppy surprised |
| Tom | The moon isn't gone. Something up in the Dome is pulling all of its light inside. Only a little gets out. | Deedee surprised, Boppy surprised |
| Deedee | Somebody read me that plaque. My glasses are in my other purse. | Tom unimpressed, Boppy unimpressed |
| Boppy | You're wearing them, Dee. | Deedee surprised, Tom happy |
| Deedee | Oh. So I am. Well then. | Tom happy, Boppy unimpressed |
| Deedee | The plaque says MEMBERS ARE ADMITTED BY MOONLIGHT. And look, three little brass stands. Somebody took the mirrors. | Tom surprised, Boppy surprised |
| Boppy | A coat check, a card room, a ballroom. Three rooms. Three stands. I count three suspects. | Tom happy, Deedee unimpressed |
| Boppy | Assistant Deputy Warden. Rikers. I know what a lineup looks like. | Tom unimpressed, Deedee unimpressed |

## scene: ch9Coat (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| The Hanger-On | Ticket? Do you have a ticket? I'm holding this coat for ticket seven. She said she'd be right back. | Tom unimpressed, Deedee surprised, Boppy unimpressed |
| The Hanger-On | That was 1971. I haven't let go once. I'm VERY good at hanging on. | Tom sad, Deedee sad, Boppy unimpressed |
| Deedee | Purple velvet. Tom. That's Aunt Ellie’s coat. | Tom surprised, Boppy surprised |
| Tom | And our mirror is hanging off your other shoulder. | Deedee proud, Boppy proud |
| The Hanger-On | Nobody gets anything without a ticket. | Tom unimpressed, Deedee loving, Boppy angry |

## scene: ch9CoatEnd (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| The Hanger-On | ...Okay. Okay. You can take it to her. Tell her I held on the whole time. | Tom loving, Deedee loving, Boppy happy |
| Deedee | We'll tell her, honey. She'll be so pleased. She'll pretend not to be. That's how you know. | Tom happy, Boppy happy |

## scene: ch9Cards (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| The Sore Loser | Deal me in. No. Wait. Don't deal me in. You're cheating. Everybody is cheating. The MIRROR is cheating. | Tom unimpressed, Deedee unimpressed, Boppy surprised |
| Boppy | Gin rummy with Deedee, fifty years. I've never won a hand. Not one. I know a sore loser when I see one. | Tom happy, Deedee unimpressed |
| Deedee | You ARE a sore loser, honey. | Boppy angry, Tom happy |
| Boppy | I'm a sore WINNER. Who hasn't won yet. | Tom happy, Deedee happy |

## scene: ch9CardsEnd (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| The Sore Loser | ...Best two out of three? | Tom happy, Deedee loving, Boppy unimpressed |
| Boppy | Sunday. My house. Bring your own deck. You'll lose. I'll lose too. We can lose together. | Tom loving, Deedee loving |
| Deedee | Look at you. Making a friend. | Boppy unimpressed, Tom happy |

## scene: ch9Ball (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| The Wallflower | Oh. Oh no. People. Don't look at me. I'm just here. With the wall. And this mirror. Which I'm hiding behind. | Tom unimpressed, Deedee loving, Boppy unimpressed |
| Deedee | Oh, sweetheart. Nobody asked you to dance, did they? | Tom loving, Boppy unimpressed |
| The Wallflower | Every song, 1924 to 1971. I stood right here. Nobody. Ever. | Tom sad, Deedee sad, Boppy sad |
| Tom | Then we'll ask. Nicely. After you give us the mirror. | Deedee proud, Boppy unimpressed |

## scene: ch9BallEnd (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| The Wallflower | ...You were very nice about it. For a fight. Here. The mirror. It was the big one, over the bandstand, before she came. | Tom loving, Deedee loving, Boppy happy |
| Tom | She? | Deedee surprised, Boppy surprised |
| The Wallflower | The Mirrorball. Up in the Dome. She hasn't stopped spinning in three nights. | Tom surprised, Deedee surprised, Boppy unimpressed |

## scene: ch9Dance (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | A slow one. My stomach gets one song. One. Deedee. May I. | Deedee surprised, Tom surprised |
| Deedee | Fifty-two years, and he still asks. Every time. | Tom loving, Boppy loving |
| Ballroom | They dance across the dusty floor, slow and small and very close. Boppy doesn't mention his stomach once. | Tom loving, Deedee loving, Boppy loving |
| Tom | (Tom doesn't take a picture. Tom takes four pictures.) | Deedee loving, Boppy loving |

## scene: ch9Door (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Dome doors | The thread of moonlight bounces off three mirrors and lands right in the middle of the moon-shaped lock. It glows. Click. CLUNK. | Tom surprised, Deedee surprised, Boppy surprised |
| Deedee | Admitted by moonlight. Oh, I have goosebumps. Tom, feel my arm. | Tom unimpressed, Boppy unimpressed |
| Boppy | Somebody up there is playing music. Very loud music. In 1971 they called that a nuisance. | Tom happy, Deedee happy |

## scene: ch9Boss (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Tom. Over the bandstand. It's so BRIGHT. I can't look at it. I'm looking at it. | Tom surprised, Boppy surprised |
| The Mirrorball | Guests! GUESTS! Oh, at last. Welcome to the Moon Club. Nobody has come up those stairs since 1971. | Tom surprised, Deedee surprised, Boppy unimpressed |
| The Mirrorball | Every full moon, they danced under me. Then the last dance. The band said see you next moon. Nobody came back. | Tom sad, Deedee sad, Boppy unimpressed |
| Tom | So you took the moon. | Deedee surprised, Boppy surprised |
| The Mirrorball | I CAUGHT it. All of it. Every bit of moonlight, right here in me. | Tom unimpressed, Deedee surprised, Boppy unimpressed |
| The Mirrorball | If I'm the brightest thing in the whole sky, somebody will HAVE to come dance. And look. Somebody did. | Tom sad, Deedee sad, Boppy unimpressed |
| Deedee | Honey, there's a whole town walking into hedges down there. | Tom happy, Boppy happy |
| The Mirrorball | Then they can come UP. One more dance. Just one. Everybody, under me, forever. | Tom scared, Deedee sad, Boppy unimpressed |
| Boppy | Forever is a lot of dancing. And everybody dances too fast. | Tom happy, Deedee unimpressed |
| Tom | Deedee, Boppy, behind me. No touching, please. | Deedee proud, Boppy unimpressed |
| Deedee | Up, everybody. Deedee is a nurse. | Tom happy, Boppy unimpressed |
| Deedee | Tom, whatever her shiny side shows bounces right back. Use something else. And honey, nobody has asked her to dance since 1971. Three times. | Tom proud, Boppy proud |

## scene: ch9AfterBoss (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| The Mirrorball | ...You asked me. Three times. Nobody has asked me to dance since 1971. | Tom loving, Deedee loving, Boppy happy |
| The Mirrorball | I don't need the moon. I just needed somebody to ASK. | Tom loving, Deedee loving, Boppy loving |
| The Mirrorball | ...Fine. The party is over. It was over in 1971. I just didn't want to be the one to turn off the lights. | Tom sad, Deedee sad, Boppy sad |
| Deedee | Oh, honey. Nobody has to turn off the lights. We'll come back. Every full moon. I'll bring crisp. | Tom loving, Boppy loving |
| The Dome | The Mirrorball turns once, slowly, and lets go. A great round light rises out of her, up through the glass, and settles in the sky. The moon. Right where it belongs. | Tom surprised, Deedee surprised, Boppy surprised |
| The Mirrorball | One dance. Before you go. Somebody. Please. | Tom scared, Deedee loving, Boppy happy |
| Deedee | Tom. Dance with your mother. | Tom scared, Boppy happy |
| Tom | I mostly sway. | Deedee unimpressed, Boppy happy |
| Deedee | Then sway with your mother. | Tom loving, Boppy happy |
| The Dome | Tom and Deedee sway under the Mirrorball, and a thousand little moons go round and round the Dome. Boppy keeps time on the bass drum. Badly. Proudly. | Tom loving, Deedee loving, Boppy proud |
| The Mirrorball | Here. One of my little mirrors. For the lady who said she'd come back. So you can carry a bit of the moon home. | Deedee loving, Tom happy, Boppy happy |
| Boppy | Something fell out of her top. On the bandstand. Something gold. | Tom surprised, Deedee surprised |
| Tom | A gold coin. Same little clock face. | Deedee surprised, Boppy surprised |
| Tom | The sundial. The steamer. The sign-up sheet. My jar. The book from 1952. The oven from 1963. Now a mirrorball from 1971. | Deedee surprised, Boppy unimpressed |
| Deedee | Somebody invited you up here, Tom. Not her. She can't hold a pen. She's a ball. | Tom surprised, Boppy unimpressed |
| Deedee | Somebody who knew you'd come. And that you'd bring your mother. | Tom surprised, Boppy surprised |
| Tom | Somebody with a little clock. I'm adding it to the list. | Deedee scared, Boppy unimpressed |

## scene: ch9End (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | TATA! The MOON came back! We saw it from the window! Aunt Ellie said it was probably you. | Tom happy, Deedee happy, Boppy happy, Rose happy, Aunt Ellie proud |
| Rose | I won at cards. I cheated. Aunt Ellie said I'm a natural. | Tom unimpressed, Deedee surprised, Grace unimpressed, Aunt Ellie proud |
| Aunt Ellie | She is. It's frightening. Well? Was there a ball? | Rose proud, Tom happy, Deedee happy, Grace unimpressed |
| Deedee | Ellie. There was a BALL. A big silver one. She remembered you. And look what we brought home. | Aunt Ellie surprised, Tom happy, Grace happy, Rose happy |
| Aunt Ellie | ...My coat. Ticket seven. | Tom loving, Deedee loving, Grace surprised, Rose surprised |
| Aunt Ellie | I left it at the last dance. I was in a hurry. I had a date with a man who turned out to be a disappointment. The coat wasn't. | Tom happy, Deedee happy, Boppy unimpressed, Grace happy |
| Aunt Ellie | It hasn't fit me since 1972. Keep it, Tom. Somebody in this family should wear velvet properly. | Tom surprised, Deedee loving, Grace happy |
| Boppy | I wore the tie. Everybody saw. Nobody can say I didn't wear the tie. | Deedee unimpressed, Tom happy, Grace happy, Rose happy, Aunt Ellie unimpressed |
| Deedee | Tom, there was something else in the envelope. Stuck to the bottom. I didn't see it. I read it eleven times and I didn't see it. | Tom surprised, Boppy unimpressed, Aunt Ellie surprised |
| Boppy | Eleven times. Without her glasses. Eleven. | Deedee angry, Tom happy, Grace happy, Rose happy, Aunt Ellie happy |
| Deedee | I couldn't FIND them, honey. | Boppy happy, Tom happy, Grace happy, Aunt Ellie unimpressed |
| Tom | A boarding pass. "BOARDING GROUP 0. FROM: LONG ISLAND. TO: NOWHERE. GATE: TO BE ANNOUNCED." And a little gold clock. | Deedee scared, Boppy surprised, Grace surprised, Rose surprised, Aunt Ellie surprised |
| Tom | There's no boarding group zero. I have flown Delta One forty times. I'd know. | Deedee surprised, Boppy unimpressed, Grace surprised, Rose surprised, Aunt Ellie happy |
| Grace | Tata. Somebody wants you to go on a TRIP. | Tom unimpressed, Deedee scared, Rose happy, Aunt Ellie happy |
| Rose | Can I come? I'll be good. I'll be medium good. | Tom loving, Grace unimpressed, Deedee happy, Aunt Ellie happy |

## scene: CH10_AFTER (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Up! Everybody up! Walk it off. Hydrate. We have a flight to catch. Probably. | Tom unimpressed, Grace proud, Rose happy |

## scene: ch10HandSteps (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Three hands. The clock still isn't moving. Tom. The slots round the face. There are seven of them. | Tom surprised, Grace surprised, Rose surprised |
| Tom | Seven slots. And I have seven gold coins. In a sock. In my bag. | Amy surprised, Grace happy, Rose happy |
| Tom | I've been keeping a list. I have also been keeping the coins. | Amy unimpressed, Grace proud, Rose happy |
| Grace | They go in the order we found them! Like a clock. Going round. I KNEW the list was important. | Tom proud, Amy proud, Rose happy |

## scene: ch10Start (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | TOM. Don't get in that cab. | Tom surprised, Grace scared, Rose scared |
| Amy | You're not taking my girls to a closed airport at midnight without me. | Tom unimpressed, Grace scared, Rose scared |
| Amy | Every clock in our house stopped at twelve. The microwave. The oven. My running watch. My RUNNING WATCH, Tom. | Tom unimpressed, Grace happy, Rose happy |
| Tom | Every clock in town. Sal says zero o’clock. | Amy surprised, Grace proud, Rose happy |
| Grace | Mom, it's SO good. We have boarding passes. Well. Tata has one. And Sal has one. Group ZERO. | Amy unimpressed, Tom happy, Rose happy |
| Rose | I'm in group zero too. I decided. | Amy unimpressed, Tom happy, Grace unimpressed |
| Amy | Fine. I have run through every airport in America. I've never missed a connection. | Tom unimpressed, Grace happy, Rose happy |
| Amy | Justin is at the shop, rewiring the whole block by flashlight. He says go. He says bring snacks. | Tom happy, Grace loving, Rose loving |
| Sal | Cab seven! Everybody in. Long Island Regional. The door nobody uses. | Tom happy, Amy proud, Grace happy, Rose happy |

## scene: ch10Term (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Speaker | DING. Good evening, and welcome to Terminal Zero. Flight Zero to Nowhere is now boarding at Gate Zero. Boarding Group Zero only. | Tom unimpressed, Amy surprised, Grace surprised, Rose surprised |
| Speaker | DING. Passengers are reminded that the gate clock is missing its hands. Passengers will kindly find them. | Tom unimpressed, Amy unimpressed, Grace surprised, Rose surprised |
| Tom | A gate agent who makes the passengers fix the clock. I have flown Delta One forty times. That's a first. | Amy happy, Grace happy, Rose happy |
| Amy | Directory. Security top left. Baggage Claim top right. The Lounge bottom left. Gate Zero, up the middle. | Tom proud, Grace proud, Rose happy |
| Grace | Everything is from the olden days. That phone has a CORD. Rose. Rose, don't lick the phone. | Rose happy, Tom unimpressed, Amy unimpressed |
| Rose | I was SMELLING it. | Grace unimpressed, Tom happy, Amy unimpressed |
| Tom | Every board says midnight. Every gate says zero. And somebody dusted the plants. | Amy surprised, Grace surprised, Rose surprised |
| Tom | Stay close, everybody. Shoes on. Liquids in a bag. | Amy happy, Grace unimpressed, Rose happy |

## scene: ch10Sec (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| The Long Line | Please wait to be called. PLEASE. WAIT. TO BE CALLED. | Tom unimpressed, Amy angry, Grace scared, Rose scared |
| The Long Line | Nobody has reached the front of me since 1989. I'm holding the hour hand. Nobody gets an hour without waiting for it. | Tom unimpressed, Amy angry, Grace surprised, Rose surprised |
| Amy | I don't wait in lines. I move to the front, and I say thank you to every single person on the way. | Tom happy, Grace proud, Rose happy |
| Tom | Shoes off, everyone. Not you, Rose. Rose, put your shoe back on. | Rose happy, Amy unimpressed, Grace unimpressed |
| The Long Line | ...Next. NEXT! You. You're at the front. Somebody is finally at the front. | Tom surprised, Amy proud, Grace surprised, Rose surprised |
| Rose | I'm at the front! I'm the FRONT! Do I win? | Tom happy, Amy proud, Grace unimpressed |
| The Long Line | You win. Here. The hour hand. Go on through. | Rose proud, Tom happy, Amy happy, Grace happy |

## scene: ch10Bag (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| The Unclaimed | Round and round. Round and round. Every other bag got picked up. Every one. Since 1989. | Tom sad, Amy sad, Grace sad, Rose sad |
| The Unclaimed | I have the minute hand. It goes round and round too. We understand each other. | Tom unimpressed, Amy sad, Grace sad, Rose surprised |
| Grace | It has SO many stickers. Tata, look. Paris. Tokyo. Cleveland. | Tom happy, Amy happy, Rose surprised |
| Tom | A well-traveled bag. We'll pick you up. After you give us the minute hand. | Grace loving, Amy loving, Rose happy |
| The Unclaimed | ...You stopped the carousel. For me. | Tom loving, Amy loving, Grace loving, Rose loving |
| Grace | I'm picking you up. Officially. You're claimed. I'm putting a sticker on you. It says GRACE. | Tom proud, Amy proud, Rose happy |
| The Unclaimed | Claimed. Oh. Here. The minute hand. Take it to the gate. | Grace proud, Tom happy, Amy loving, Rose happy |

## scene: ch10Lounge (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| The Armrest Hog | Occupied. All of them. Both armrests. The middle seat. The window. Mine. | Tom unimpressed, Amy angry, Grace unimpressed, Rose surprised |
| The Armrest Hog | The second hand is mine too. I'm not giving up a single second. | Tom unimpressed, Amy angry, Grace unimpressed, Rose unimpressed |
| Tom | Lounge etiquette. You get one armrest. The middle seat gets both. That's the rule. | Amy unimpressed, Grace unimpressed, Rose happy |
| Amy | Tom has very strong opinions about armrests. | Tom unimpressed, Grace happy, Rose happy |
| Tom | Everybody should have very strong opinions about armrests. | Amy unimpressed, Grace unimpressed, Rose happy |
| The Armrest Hog | ...Fine. You can sit. Here. The second hand. And you can have an armrest. One. The left one. | Tom proud, Amy surprised, Grace happy, Rose happy |
| Tom | Thank you. That was very big of you. | Amy happy, Grace happy, Rose happy |
| Amy | Tom. The cabinet. Pajamas. With a little gold zero on the pocket. | Tom happy, Grace surprised, Rose surprised |

## scene: ch10Photo (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Photo booth | Everybody squishes in. Rose on Tom’s lap. Grace in front, doing a pose. Amy at the edge, half out of frame, laughing. | Tom happy, Amy happy, Grace proud, Rose happy |
| Photo booth | FLASH. FLASH. FLASH. FLASH. Four little photos slide out, still warm. | Tom happy, Amy happy, Grace happy, Rose happy |
| Amy | Sending it to Justin. | Tom happy, Grace happy, Rose happy |
| Amy | "Best one yet. Is that an airport? At midnight?? Proud of you guys." With the heart. He used the heart. | Tom loving, Grace surprised, Rose happy |
| Grace | TWO hearts this year! That's a record! | Amy loving, Tom happy, Rose happy |

## scene: ch10Door (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Gate clock | The seventh coin clicks into its slot. All three hands shiver. The clock doesn't start. The middle slot is still empty. | Tom unimpressed, Amy surprised, Grace surprised, Rose surprised |
| Gate clock | But the doors under it go CLUNK, and swing open by themselves. | Tom surprised, Amy surprised, Grace surprised, Rose surprised |
| Grace | The sundial, the steamer, the sign-up sheet, the jar, the book, the oven, the Mirrorball. I knew it. I KNEW the list was important. | Tom proud, Amy surprised, Rose happy |
| Amy | Seven coins. Seven chapters of your life, Tom. Somebody has been planning this. | Tom surprised, Grace surprised, Rose surprised |
| Tom | Somebody with a little clock. And one more coin. | Amy scared, Grace proud, Rose surprised |

## scene: ch10Boss (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | A PLANE. A real one. Out the window. Its lights are on. Tata, its lights are ON. | Tom surprised, Amy surprised, Grace surprised |
| The Last Call | DING. Passengers! Oh. Oh, PASSENGERS. At Gate Zero. This is the LAST CALL for Flight Zero. | Tom surprised, Amy surprised, Grace surprised, Rose surprised |
| The Last Call | Flight Zero was due out at midnight. 1989. I called it and called it. Nobody came to the gate. Nobody answered. | Tom sad, Amy sad, Grace sad, Rose sad |
| Tom | So you stopped every clock on Long Island at midnight. | Amy angry, Grace surprised, Rose surprised |
| The Last Call | If it's always midnight, the flight is never late. If the flight is never late, somebody might still come. | Tom sad, Amy unimpressed, Grace sad, Rose sad |
| The Last Call | And somebody DID. Group Zero. Now boarding. All of you. Forever. | Tom unimpressed, Amy angry, Grace scared, Rose scared |
| Amy | My running watch hasn't moved in a day. I can't log a run. Do you understand what you've done. | Tom happy, Grace unimpressed, Rose surprised |
| Grace | Rose, she's a sign that talks. Like the one at the dentist. But MAD. | Rose happy, Tom happy, Amy unimpressed |
| Tom | Girls, Amy, behind me. Watch the board. When she calls your name, you move. No touching, please. | Amy proud, Grace proud, Rose proud |
| Amy | Up, everybody. Walk it off. | Tom unimpressed, Grace proud, Rose happy |
| Amy | Tom, when she calls one of us, that person has to move before she goes again. Or you stand in front of them. And nobody has answered her since 1989. Three times. | Tom proud, Grace proud, Rose proud |

## scene: ch10AfterBoss (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| The Last Call | ...You answered. Three times. Thirty-seven years, and somebody answered. | Tom loving, Amy loving, Grace loving, Rose loving |
| The Last Call | I didn't need midnight. I needed somebody to say HERE. | Tom loving, Amy loving, Grace loving, Rose loving |
| The Last Call | ...Fine. Flight Zero is cancelled. It was cancelled in 1989. I just didn't want to be the one to flip the flap. | Tom sad, Amy sad, Grace sad, Rose sad |
| Amy | Hey. Nobody cancelled you. You just needed a crowd. Look. You have a crowd. | Tom loving, Grace loving, Rose happy |
| The Last Call | Something for the gate clock. It's been in my bottom row since 1989. | Tom surprised, Amy surprised, Grace surprised, Rose surprised |
| Tom | A gold coin. Same little clock face. Number eight. | Amy surprised, Grace proud, Rose surprised |
| Tom | The sundial. The steamer. The sign-up sheet. My jar. The book from 1952. The oven from 1963. The Mirrorball from 1971. And a gate from 1989. | Amy surprised, Grace proud, Rose surprised |
| Gate Zero | Tom walks back out to the gate clock and pushes the eighth coin into the middle slot. Click. | Amy surprised, Grace surprised, Rose surprised |
| Gate Zero | The second hand jumps. Then the minute hand. Then, slowly, the hour hand. TICK. TICK. TICK. | Amy surprised, Grace surprised, Rose surprised |
| Amy | My watch. Tom. My WATCH. It says twelve oh one. Twelve oh one! | Tom happy, Grace happy, Rose happy |
| Grace | Every clock in the whole town is going again. I can FEEL it. | Tom happy, Amy happy, Rose happy |
| The Last Call | For the smallest passenger in Group Zero. Junior pilot wings. I've been saving them for somebody. | Rose surprised, Tom loving, Amy loving, Grace happy |
| Rose | I'm a PILOT. I'm wearing them upside down. On purpose. It's a pilot thing. | Tom happy, Amy happy, Grace unimpressed |
| Grace | Tata. Tata. The jet bridge. There's a man. | Tom surprised, Amy surprised, Rose scared |
| Grace | In a long coat. Like at the school. He's tipping his hat at you. | Tom unimpressed, Amy scared, Rose scared |
| Gate Zero | The jet bridge door clicks shut. Outside the big window, Flight Zero turns on its lights, pushes back, and rolls away into the dark. Very quietly. Like it's done this before. | Tom unimpressed, Amy surprised, Grace surprised, Rose surprised |
| Amy | Tom. Who IS that? | Grace scared, Rose scared |
| Tom | Somebody who knows I always make my connection. | Amy unimpressed, Grace surprised, Rose surprised |
| Tom | He left a card on the podium. Gold ink. "THANK YOU FOR FLYING NOWHERE. YOUR LAYOVER WILL BE ANNOUNCED." And a little clock. | Amy scared, Grace surprised, Rose surprised |
| Tom | My boarding pass changed. "BOARDING GROUP 0. FROM: LONG ISLAND. TO: NOWHERE. STATUS: LAYOVER." | Amy scared, Grace surprised, Rose surprised |
| Rose | What's a layover? | Tom loving, Amy unimpressed, Grace unimpressed |
| Tom | It means this trip isn't over. | Amy unimpressed, Grace happy, Rose happy |
| Amy | Okay. It's twelve oh four. Mom has been holding Sunday dinner since midnight. Everybody to the cab. | Tom happy, Grace happy, Rose happy |

## scene: ch10End (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | THERE they are. Tom! The oven clock started blinking twelve oh one and I cried a little. Into the gravy. It's fine. It's seasoning. | Tom loving, Amy loving, Grace happy, Rose happy, Boppy unimpressed, Aunt Ellie unimpressed |
| Boppy | Every clock in this house started at once. Eleven clocks. I didn't know we'd eleven clocks. | Tom happy, Amy happy, Grace happy, Rose happy, Deedee unimpressed, Aunt Ellie unimpressed |
| Boppy | My stomach is still on midnight. My stomach is always on midnight. | Tom unimpressed, Amy unimpressed, Grace happy, Rose happy, Deedee unimpressed, Aunt Ellie unimpressed |
| Aunt Ellie | Sit. Tell me about the airport. Leave nothing out. I'll know. | Tom happy, Grace proud, Rose happy, Amy happy |
| Grace | DAD! | Amy loving, Rose happy, Tom happy, Deedee happy, Justin loving |
| Justin | Hey, everybody. The lights all came back on at twelve oh one. So I came back too. I brought bread. | Grace loving, Rose loving, Amy loving, Tom happy, Deedee loving |
| Tom | It's store-bought. | Justin scared, Amy happy, Grace happy |
| Justin | It's store-bought. | Tom unimpressed, Amy happy, Grace happy, Rose happy |
| Tom | I'll allow it. Tonight. | Justin happy, Amy happy, Deedee happy |
| Deedee | None for me, Justin. Store-bought gives me gas. | Justin surprised, Tom happy, Amy happy, Grace happy, Rose happy, Boppy happy |
| Rose | Deedee! EVERYTHING gives you GAS! | Deedee surprised, Tom happy, Amy happy, Grace happy, Justin happy, Boppy happy, Aunt Ellie happy |
| Sunday dinner | Everybody laughs. Boppy laughs so hard he has to hold his stomach. Deedee laughs last, and longest. | Tom happy, Amy happy, Grace happy, Rose proud, Justin happy, Boppy happy, Deedee happy, Aunt Ellie happy |
| Deedee | Fine. One slice. For the girl who said it. | Rose proud, Tom happy, Amy happy, Grace happy |
| Tom | A text from TNB. "babe. every clock in LA stopped at midnight. they just started again. was that you?" | Amy happy, Grace happy, Rose happy, Deedee loving |
| Tom | Tom writes back: "Mostly Amy." TNB sends a heart. Tom sends one back. Then another one. | Amy unimpressed, Grace happy, Rose happy, Deedee loving, Aunt Ellie happy |
| Amy | Mostly Amy. Put that on a shirt. | Tom happy, Justin proud, Grace happy, Rose happy |
| Deedee | Everybody sit. Everybody. Justin, you too. Ellie, that's Boppy’s chair. Boppy, that's my chair. Boppy. | Boppy unimpressed, Aunt Ellie unimpressed, Tom happy, Justin happy, Grace happy, Rose happy |
| Deedee | And has anybody seen my glasses? I can't read the oven. | Boppy unimpressed, Tom happy, Amy happy, Grace happy, Aunt Ellie unimpressed |
| Rose | They're on the BUTTER, Deedee. | Deedee surprised, Tom happy, Amy happy, Grace happy, Boppy happy |
| Deedee | Of course they are. Nobody touch the butter. | Rose proud, Tom happy, Boppy happy, Aunt Ellie happy |
| Rose | Tata. Next time there's a layover, can I come? | Tom loving, Grace happy, Amy loving |
| Grace | WE are coming. All of us. I'm already packing. In my head. | Tom happy, Amy unimpressed, Rose happy |
| Tom | Everybody comes next time. | Grace happy, Rose happy, Amy loving, Deedee loving |
| Tom | To the moon and back, everybody. Eat. Deedee made everything. | Deedee loving, Boppy loving, Grace loving, Rose loving, Amy loving, Justin loving, Aunt Ellie loving |
| Deedee | To the moon and BACK. | Tom loving, Grace loving, Rose loving, Amy loving, Boppy loving, Justin loving, Aunt Ellie loving |

## scene: part2Open (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Tom! Sit. Eat. I made a crisp. Yes, I know it's nine in the morning. Do not argue. | Tom unimpressed, Boppy unimpressed |
| Tom | Trust me, I was not going to argue. | Deedee happy, Boppy unimpressed |
| Boppy | This came for the recliner. A gold card. “Priority Member.” Junk mail. They send it to the recliner now. | Tom unimpressed, Deedee unimpressed |
| Boppy | Don’t throw it out. It’s warm. I think it’s warm. My knee says it’s warm. | Tom surprised, Deedee unimpressed |
| Tom | My boarding pass is buzzing in my pocket. It says: YOUR LAYOVER IS NOW BOARDING. | Deedee surprised, Boppy unimpressed |
| Deedee | A layover! Where? Never mind. Take a sweater. Actually, take two. And take the crisp. | Tom loving, Boppy unimpressed |
| Boppy | Bring me back a pretzel. A real one. Not the airport kind. | Tom happy, Deedee unimpressed |
| Deedee | To the moon and back, Tom. Both ways. | Tom loving, Boppy loving |

## scene: ch11Cabin (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Speaker | DING. Welcome aboard Flight Zero, nonstop to Wherever. Please stow your bags, your seatbacks, and your questions. | Tom unimpressed |
| Rose | BOO! We’re stowaways! Tata, what’s a stowaway? | Tom unimpressed, Grace happy |
| Tom | It’s a person who hides on a plane they weren’t invited to. | Rose surprised, Grace happy |
| Tom | Which is illegal. And also, apparently, a family tradition. | Grace happy, Rose happy |
| Grace | We weren’t hiding. We were pre-boarding. Rose got the good blanket. | Tom unimpressed, Rose happy |
| Rose | It’s the one with the tiny planes on it. | Tom happy, Grace unimpressed |
| Grace | Tata, if you tell Mom, I’m going to make a video about it. Please like and subscribe. | Tom unimpressed, Rose happy |
| Tom | Nobody is subscribing to a stowaway. | Grace unimpressed, Rose happy |
| Amy | STOP THE PLANE. I have a ticket. I don’t have a ticket. I have my running shoes. | Tom surprised, Grace scared, Rose scared |
| Amy | My daughters ran out of the house in their socks, Tom. I’m their ride home. And I’m faster than you. | Tom unimpressed, Grace scared, Rose happy |
| Tom | Nobody here is racing. | Amy unimpressed, Grace happy, Rose happy |
| Amy | That’s what the person who loses says. | Tom unimpressed, Grace happy, Rose happy |
| Speaker | Ladies and gentlemen, we are experiencing a little weather. It is not the kind with rain. Please look out the window. | Tom unimpressed, Amy surprised, Grace surprised, Rose surprised |
| Rose | The sky has a hole in it. The hole is pink. Tata, can I touch it? | Tom scared, Amy scared, Grace surprised |
| Tom | No touching, please. | Rose unimpressed, Amy happy, Grace happy |
| Tom | Everybody hold on to something. Preferably each other. | Amy scared, Grace scared, Rose happy |

## scene: ch11Gate00 (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Speaker | DING. Welcome to Terminal Infinity. It is always dusk. Every flight is on time. | Tom unimpressed, Amy surprised, Grace surprised, Rose surprised |
| Grace | Tata. The window. There are two tiny towns in it. | Tom surprised, Amy surprised, Rose surprised |
| Tom | Left one is green. That’s Long Island. Right one is orange. That’s Los Angeles. | Amy surprised, Grace surprised, Rose surprised |
| Tom | Both of them inside glass. Like snow globes. | Amy scared, Grace surprised, Rose surprised |
| Amy | Then we’re in the layover. Between the two. Everything is on time and nothing is going anywhere. | Tom proud, Grace surprised, Rose surprised |
| Rose | Can we live here? There’s a plant with a hat. | Tom unimpressed, Amy unimpressed, Grace happy |
| Tom | We are not living in an airport, Rose. | Rose unimpressed, Amy happy, Grace happy |
| Tom | We’re finding the way through it. East, down the Endless Concourse. | Amy proud, Grace proud, Rose happy |

## scene: ch11Conc (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Nine gates. Boston, Denver, Seattle, Chicago, Miami. Every one of them says PAUSED. | Tom surprised, Grace surprised, Rose surprised |
| Grace | It’s a whole day of everybody’s trip, stopped in the middle. The seagull still has the fry. | Tom sad, Amy sad, Rose surprised |
| Tom | Careful. A town paused is still a town. Don’t lick the glass. | Rose unimpressed, Amy happy, Grace happy |
| Rose | I wasn’t going to. | Tom unimpressed, Amy unimpressed, Grace unimpressed |
| Rose | I was going to look at it with my face. | Tom happy, Amy happy, Grace happy |
| Tom | Gate Infinity is the big door at the far end. There’s a checkpoint in the middle, and somebody is standing in it. | Amy proud, Grace scared, Rose surprised |

## scene: ch11Stby (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Standby Sprite | Hold it. Hold it right there. Name? | Tom unimpressed, Amy angry, Grace scared, Rose scared |
| Standby Sprite | Not on the list. Nobody is ever on the list. You’re standby. Congratulations. You’re number eighteen. | Tom unimpressed, Amy angry, Grace unimpressed, Rose surprised |
| Tom | Who is number seventeen? | Amy happy, Grace happy, Rose happy |
| Standby Sprite | Me. I’ve been seventeen since 1998. If you pass me, I move up. Nobody passes me. | Tom sad, Amy unimpressed, Grace sad, Rose sad |
| Amy | I’ve never been on standby in my life. I’ve been on time, or I’ve been first. | Tom happy, Grace happy, Rose happy |
| Grace | Rose, he has a paddle that says STANDBY and he thinks it’s a weapon. | Rose happy, Tom happy, Amy happy |
| Tom | Stay behind me. If he sends someone to the back of the line, we’ll get them right back. | Amy proud, Grace proud, Rose proud |
| Amy | Everybody okay? Good. He’s a clipboard with legs. | Tom happy, Grace happy, Rose happy |
| Standby Sprite | ...Seventeen. Somebody called seventeen. Was that me? | Tom loving, Amy loving, Grace surprised, Rose surprised |
| Standby Sprite | It was me. I’m on the plane. I’m on THE PLANE. | Tom happy, Amy happy, Grace happy, Rose happy |

## scene: ch11StbyAfter (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Standby Sprite | ...Seventeen. Somebody called seventeen. Was that me? | Tom loving, Amy loving, Grace surprised, Rose surprised |
| Standby Sprite | It was me. I’m on the plane. I’m on THE PLANE. | Tom happy, Amy happy, Grace happy, Rose happy |

## scene: ch11Meet (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Speaker | DING. Flight Zero from Los Angeles has arrived at the Jet Bridge. Welcome to the layover. Please do not feed the dog the pretzels. | Tom surprised, Amy surprised, Grace surprised, Rose surprised |
| Nara | Nara sees Tom. Nara sees EVERYTHING that is not Tom disappear. | Tom loving, Amy happy, Grace happy, Rose happy, TNB loving |
| Tom | Hi. Hi, bean. Yes. I know. You were so brave on the plane. | Nara loving, TNB loving, Amy happy, Grace happy, Rose happy |
| TNB | Hey, babe. The airline lost my bag, found Nara, and upgraded us both. This place is nice. | Tom loving, Amy surprised, Grace surprised, Rose surprised, Nara happy |
| Tom | You came through the sky. | TNB loving, Amy happy |
| TNB | I came through the sky with a dog on a pillow. It was fine. There was a pot on the cart that was kind of incredible. | Tom loving, Amy unimpressed, Grace surprised, Rose surprised |
| Grace | Hi! I’m Grace. I’m nine. | TNB happy, Tom happy, Amy happy, Nara happy |
| TNB | I know exactly who you are. Tom shows me all your videos. You’re very good at telling people to subscribe. | Grace proud, Tom loving, Amy happy |
| Grace | Thank you. Subscribe. | TNB happy, Tom happy, Amy unimpressed, Rose happy |
| Rose | I’m Rose. I’m six. I’m on a longboard. | TNB surprised, Tom happy, Amy unimpressed, Grace unimpressed |
| TNB | That’s my longboard. | Rose happy, Tom happy, Grace happy, Amy happy |
| Rose | It’s ours now. | TNB happy, Tom happy, Amy unimpressed, Grace happy |
| Nara | Nara licks Grace’s glitter nails, one at a time. She seems to feel it’s a type of review. | Grace happy, Rose happy, Tom happy, TNB happy, Amy happy |
| Amy | You’re the boyfriend. | TNB scared, Tom scared, Grace happy, Rose happy |
| TNB | And you’re the sister. The runner. I’ve heard a lot. | Amy unimpressed, Tom scared, Grace happy |
| Amy | I’ve heard nothing, which means he’s been saving you for a special occasion. | Tom scared, TNB loving, Grace happy, Rose happy |
| TNB | I can fix a handle or fire a vase. What are you good at? | Amy proud, Tom happy |
| Amy | Everything, and quickly. I think we’re going to get along. | TNB happy, Tom loving, Grace unimpressed, Rose happy |
| TNB | Okay. Everybody. Sleepover rules. We have a blanket, a dog, and nine hours of dusk. | Tom happy, Amy happy, Grace happy, Rose happy, Nara happy |
| TNB | Tom, build the fort. I’ll make the snacks. | Tom loving, Amy happy, Grace happy, Rose happy, Nara happy |

## scene: ch11Lost (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Lost and Found | The door was never locked. It just said BACK IN FIVE MINUTES for so long that nobody tried it. | Tom unimpressed, Amy surprised, Grace surprised, Rose surprised, TNB surprised |
| Lost and Found | Inside: a counter, a brass bell, and shelves that go up past the ceiling. Every item has a little gold clock tied to it. | Tom surprised, Amy surprised, Grace surprised, Rose surprised, TNB surprised, Nara surprised |
| Rose | Can I ring the bell? | Tom unimpressed, Amy unimpressed, Grace unimpressed, TNB happy |
| Tom | Gently. | Rose happy |
| Rose | I rang it gently. It rang back less gently. | Tom unimpressed, Amy unimpressed, Grace unimpressed, TNB happy, Nara scared |
| Grace | Tata. Every single thing here has a tag. A blue mitten. A trombone. A birthday hat. A retainer. | Tom surprised, Amy surprised, Rose surprised, TNB surprised |
| Amy | Nobody has claimed the retainer in my family since 2011. That’s not related. Moving on. | Tom happy, Grace surprised, Rose happy, TNB happy |
| TNB | These are all things people left behind when they got to the good part of a trip. A mitten from the best snow day. A hat from the best party. | Tom sad, Amy sad, Grace sad, Rose surprised |
| TNB | They didn’t want to leave. So they didn’t go back for it. | Tom sad, Amy sad, Grace sad, Rose sad, Nara sad |
| Tom | Somebody collected them. Every gold clock is the same little clock as the coins. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Rose | Tata. Tata. The ? suitcases. They’re all in here. They’re all being very polite. | Tom unimpressed, Amy surprised, Grace surprised, TNB happy |
| Lost and Found | A ledger on the counter. UNCLAIMED: 4,017,311 ITEMS. CLAIMED: 0. | Tom surprised, Amy surprised, Grace surprised, Rose surprised, TNB surprised |
| Lost and Found | The last line, in gold ink: THE ONLY WAY TO LEAVE SOMETHING SAFE IS TO NEVER COME BACK FOR IT. | Tom sad, Amy sad, Grace sad, Rose surprised, TNB sad |
| Grace | That is the saddest thing I have ever read. And I read my sister’s diary. | Rose angry, Tom happy, Amy unimpressed, TNB happy |
| Rose | I don’t have a diary. I have a drawing of a dog. | Grace unimpressed, Tom happy, Amy happy, TNB happy, Nara happy |
| Lost and Found | Under the bell, a card in the same gold ink as the one at Gate Zero: | Tom surprised, Amy surprised, Grace surprised, Rose surprised, TNB surprised |
| Lost and Found | FOUND: ONE TOM. HELD FOR PICKUP. NO RUSH. | Tom surprised, Amy scared, Grace surprised, Rose surprised, TNB scared, Nara scared |
| Tom | ...He’s been holding a spot for me. Not for my bag. For me. | Amy scared, TNB loving, Grace surprised, Rose surprised, Nara loving |
| Amy | That’s either the nicest thing I’ve ever heard or a threat. | Tom unimpressed, TNB unimpressed, Grace surprised, Rose surprised |
| TNB | Both, probably. That’s how the good ones are. | Tom unimpressed, Amy unimpressed |

## scene: ch11Vance (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| Long coat | Hello, Tom. | Tom surprised, Amy scared, Grace scared, Rose scared, TNB surprised, Nara angry |
| Tom | You’re the man in the long coat. At the school. At the airport. At Gate Zero. | Amy angry, TNB unimpressed, Grace surprised, Rose scared |
| Julian Vance | Julian Vance. Gate agent, in a way. I have stood at every gate that ever closed. | Tom unimpressed, Amy angry, TNB unimpressed, Grace scared, Rose scared, Nara angry |
| Julian Vance | You opened every door I couldn’t. Thank you for flying nowhere, Tom. | Tom unimpressed, Amy angry, TNB unimpressed, Grace surprised, Rose surprised |
| Amy | You stopped our clocks. You stopped MY clock. | Tom proud, TNB proud, Grace proud, Rose happy |
| Julian Vance | I stopped every town on Earth. At its happiest afternoon. A birthday that never ends. The last day of summer. Nobody is sad. Nobody is late. | Tom sad, Amy angry, TNB sad, Grace angry, Rose surprised |
| Julian Vance | Long Island and Los Angeles kept moving because you kept flying. Every flight moved them a little. I wasn’t quick enough to stop you. | Tom surprised, Amy angry, TNB surprised, Grace angry, Rose surprised |
| Grace | Paused isn’t happy. Paused is stuck. | Tom proud, Amy proud, TNB proud, Rose proud |
| Rose | The seagull has had that fry for a hundred years. He’s not happy. He’s hungry. | Tom loving, Amy loving, TNB happy, Grace proud |
| TNB | I have a vase in the kiln in Los Angeles. It’s been in there a long time. It’s going to crack. | Tom loving, Amy sad, Grace sad, Rose sad |
| TNB | That’s what happens when you leave something at its best. It doesn’t stay good. It just stays. | Tom loving, Amy proud, Grace proud, Rose surprised |
| Julian Vance | Maybe. But it stays safe. That is all I have ever wanted for anyone. | Tom unimpressed, Amy angry, TNB sad, Grace angry, Rose sad |
| Julian Vance | Everyone, safe, in the good part, forever. Come in. Stay. Nobody here has ever been lost. | Tom unimpressed, Amy angry, TNB unimpressed, Grace scared, Rose scared, Nara angry |
| Tom | That’s the nicest offer anyone’s ever made me. And it was in my pocket the whole time. I had a pass. | Amy proud, TNB loving, Grace proud, Rose happy |
| Tom | No, thank you. We have a connection to make. | Amy proud, TNB proud, Grace proud, Rose proud, Nara proud |
| Julian Vance | ...Then I’ll make the last announcement. | Tom unimpressed, Amy angry, TNB scared, Grace scared, Rose scared, Nara angry |
| Julian Vance | Someone has to. | Tom sad, Amy angry, TNB sad, Grace scared, Rose scared |
| Julian Vance | He lifts his hat. Behind his head, the big door’s gold clock spins, and every flap in the terminal clicks at once. | Tom unimpressed, Amy angry, TNB scared, Grace scared, Rose scared, Nara angry |
| Julian Vance | FINAL CALL. | Tom proud, Amy angry, TNB scared, Grace scared, Rose scared, Nara angry |
| Amy | Here’s the plan. Tom up front, girls with me. If that board calls your name, don’t sit there. Move. | Tom proud, TNB proud, Grace proud, Rose scared |
| Grace | Rose, when it calls you, move. Don’t stop to look at anything. | Rose unimpressed, Tom happy, Amy proud |
| Rose | I won’t look at anything. | Grace unimpressed, Tom happy, Amy unimpressed |
| Rose | ...I looked at one thing. | Grace unimpressed, Tom happy, Amy unimpressed, TNB happy |
| Tom | If somebody gets called and can’t move, I’ll walk them on. And if we need a friend in a hurry, wave to the bench. | Amy proud, TNB proud, Grace proud, Rose happy |
| Amy | Everybody okay? It calls one of us every turn. Move before it goes again, or Tom will walk you on. | Tom proud, TNB proud, Grace proud, Rose proud |

## scene: ch11After (chapter 11)

| Speaker | Line | Reactions |
|---|---|---|
| FINAL CALL | ...You asked the board to come. Nobody asked the board. | Tom loving, Amy loving, TNB loving, Grace surprised, Rose surprised |
| FINAL CALL | I think I just wanted to be on one flight. | Tom loving, Amy loving, TNB loving, Grace sad, Rose sad |
| Amy | Then you’re on one. Seat 18C. Don’t recline. | Tom happy, TNB happy, Grace happy, Rose happy |
| FINAL CALL | ...ON TIME. ON TIME. ON TIME. | Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |
| FINAL CALL | It’s fine. They’re all on time. I am not. | Tom sad, Amy sad, TNB sad, Grace sad, Rose sad |
| Amy | Nobody is cancelling you. You just never got a boarding pass. Here. Take mine. | Tom loving, TNB loving, Grace loving, Rose loving |
| Tom | Something is dropping out of the gate clock. A gold coin, with a little clock face. Number nine. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Tom | It’s warm. Whatever Vance was holding, it wasn’t his. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Speaker | DING. Attention, passengers. The departures board has been updated. | Tom unimpressed, Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Speaker | DING. LONG ISLAND: CLOSED. LOS ANGELES: NOW BOARDING. | Tom scared, Amy scared, TNB surprised, Grace scared, Rose scared |
| Grace | Tata. The little green town. It’s turning orange. No. Amber. Like a caution light. | Tom scared, Amy scared, TNB scared, Rose scared |
| Rose | Is Deedee okay? | Tom sad, Amy scared, Grace scared, TNB sad |
| Amy | I’m calling her. I’m calling her right now. | Tom scared, TNB sad, Grace scared, Rose scared |
| Amy | It’s ringing. It’s just ringing. Mom always picks up. Mom picks up on the FIRST ring. She picks up before it rings. | Tom scared, TNB sad, Grace scared, Rose scared |
| Tom | Sit down. Everybody. Deep breath. | Amy scared, Grace scared, Rose scared, TNB loving |
| Tom | Dad’s in his recliner. Mom has the crisp. They’re fine. They’re probably fine. | Amy sad, Grace sad, Rose sad, TNB loving |
| TNB | Hey. We’ll go get them. Whatever he did, we’ll fix it. Things come apart. I fix things. | Tom loving, Amy loving, Grace proud, Rose happy |
| Tom | We’ll go get them. We always make our connection. | Amy proud, TNB proud, Grace proud, Rose proud |
| Rose | Which one is Los Angeles? | Tom loving, Amy loving, TNB happy, Grace unimpressed |
| Tom | The orange one. It’s the only one still open. | Amy sad, TNB loving, Grace sad, Rose surprised |
| Tom | And it’s where Nara and TNB live. It’s home. Our other home. | TNB loving, Amy loving, Grace happy, Rose happy, Nara loving |

## scene: ch12Open (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| Speaker | DING. Attention, passengers. Los Angeles is now boarding. All other gates remain closed. | Tom unimpressed, Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Tom | The gold clock on the big door finally has hands. They’re pointing at 3, 4, 6, 8. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Tom | That’s my address. The door knows where I live. | Amy scared, TNB surprised, Grace scared, Rose surprised |
| Rose | The door knows where you live? That’s so creepy. I love it. | Tom unimpressed, Amy unimpressed, TNB happy, Grace unimpressed |
| TNB | Home. Okay. Good. I have a very good couch and a very bad idea of what’s in the fridge. | Tom loving, Amy happy, Grace happy, Rose happy |
| Nara | Nara hears the word home. Nara is already pressed against the door, vibrating. | Tom loving, TNB happy, Amy happy, Grace happy, Rose happy |
| Amy | Everybody together. Nobody gets left behind in the layover. That’s the only rule. | Tom proud, TNB proud, Grace proud, Rose proud |
| Grace | That’s two rules. Together, and nobody gets left. | Amy unimpressed, Tom happy, TNB happy, Rose happy |
| Amy | They’re the same rule, Grace. | Grace unimpressed, Tom happy, TNB happy |
| Tom | Dog on a leash. Girls on the buddy system. Here we go. | Amy proud, TNB proud, Grace proud, Rose happy |

## scene: ch12Arrive (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Jefferson Park. Same jacarandas, same lemon tree, same wood door. | Amy surprised, TNB loving, Grace surprised, Rose surprised |
| Tom | Nothing is paused here. The sprinklers are even on. | Amy happy, TNB happy, Grace happy, Rose happy |
| Rose | It smells like lemons. And a little bit like a burrito. | Tom happy, Amy happy, TNB happy, Grace unimpressed |
| Tom | That’s the lemon tree and Doña Carmen’s. Welcome to 3468. | Amy surprised, TNB loving, Grace surprised, Rose surprised |
| Grace | Tata, you live in a real grown-up house. With flax. | Tom happy, Amy happy, TNB happy, Rose surprised |
| Rose | What’s flax? | Tom happy, Grace unimpressed, TNB happy |
| Tom | The red grass by the steps. It looks like it’s waving. | Rose surprised, Grace happy |
| Rose | It’s waving at ME. | Tom loving, Amy loving, TNB happy, Grace unimpressed |
| Amy | Wood door. A welcome mat in Japanese. Not one thing out of place. | Tom proud, TNB proud, Grace surprised, Rose surprised |
| Amy | I’ve known you thirty-some years, and I pictured a pile of laundry and a gaming chair. | Tom unimpressed, TNB happy, Grace happy, Rose happy |
| Tom | TNB is the reason nothing is out of place. | TNB proud, Amy surprised, Grace happy |
| TNB | I’m the reason there are coasters. | Tom loving, Amy happy, Grace happy |
| Nara | Nara checks the front gate. A squirrel is on the fence. Nara loses her entire mind. | Tom unimpressed, TNB happy, Amy happy, Grace happy, Rose happy |
| Tom | Come in. I’ll show you where I live. Wipe your paws, Nara. And mind the sourdough. | Amy happy, TNB happy, Grace happy, Rose happy |

## scene: ch12House (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Tata. TATA. There’s a jar. It’s bubbling. It’s ALIVE. | Tom happy, Amy surprised, TNB happy, Grace surprised |
| Tom | That’s Bready Mercury. He’s nine years old, he’s flown Delta One, and he’s the only one in this house who gets fed on time. | Rose surprised, Grace unimpressed, Amy unimpressed, TNB happy |
| Grace | You named your bread Mercury? Like the planet? | Tom proud, Rose happy, TNB happy |
| Tom | Like the singer. He’s a showman. He rises on command. | Grace surprised, Rose happy, Amy unimpressed, TNB happy |
| Rose | Can he do a trick? | Tom happy, TNB happy, Grace happy |
| Tom | He rises. Every day. Without being asked. It’s the best trick anybody in this house does. | Rose surprised, Grace happy, Amy unimpressed, TNB unimpressed |
| TNB | I do a trick where I turn a lump into a bowl. | Tom loving, Rose surprised, Grace happy, Amy happy |
| Tom | You do. Yours is better. Don’t tell Bready. | TNB loving, Amy happy, Grace happy, Rose happy |
| Grace | Tata. There’s a picture of us. On the wall. In the nice frame. | Tom loving, Rose surprised, Amy loving, TNB loving |
| Rose | There’s one of me with a sandwich. It’s my best side. | Tom happy, Grace unimpressed, Amy happy, TNB happy |
| Tom | It’s the wall I walk past every morning. Before work. Before coffee. | Grace loving, Rose loving, Amy loving, TNB loving |
| Tom | I say good morning to the two of you. | Grace loving, Rose loving, Amy loving, TNB loving |
| Grace | Every morning? | Tom loving, Rose loving, Amy loving |
| Tom | Every morning. Rose usually says it back. In my head. | Grace loving, Rose happy, Amy loving, TNB loving |
| Rose | I said it back just now. Good morning, Tata. | Tom loving, Grace loving, Amy loving, TNB loving |
| Tom | Good morning, Rose. | Rose loving, Grace loving, Amy loving, TNB loving |
| Grace | So this is your house. | Tom loving, Amy loving |
| Tom | It’s yours too. I mean it. A snow globe called Long Island, and a house called this one. Both. Always both. | Grace loving, Rose loving, Amy loving, TNB loving |
| Amy | Tom. That wall is the nicest thing I’ve seen in a house in years. | Tom scared, TNB loving, Grace happy |
| Tom | It’s an Ikea frame. Don’t make it weird. | Amy happy, TNB happy, Grace happy, Rose happy |
| Amy | It’s a very nice Ikea frame. | Tom loving, TNB happy |
| Nara | Nara has climbed onto the couch. This is not allowed. She looks right at Tom. It is allowed. | Tom unimpressed, TNB happy, Amy happy, Grace happy, Rose happy |
| TNB | Okay. Next stop, the loft. Everybody’s coming. I’ll show you where I break things on purpose. | Tom happy, Amy happy, Grace happy, Rose surprised |

## scene: ch12Loft (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | This is it. The loft. Kiln, wheel, and a lot of clay in places clay shouldn’t be. | Tom loving, Amy surprised, Grace surprised, Rose surprised |
| Grace | It’s so many mugs. | TNB proud, Tom happy, Amy happy |
| Rose | Can I touch the clay? | TNB happy, Tom unimpressed, Amy unimpressed |
| TNB | Rose. Come here. Wet hands. Sit. Put your thumb in the middle. Don’t push. Just open it. | Rose surprised, Tom loving, Amy surprised, Grace happy |
| Rose | It’s a hole. | TNB happy, Tom happy, Amy happy, Grace unimpressed |
| TNB | It’s a bowl. It just doesn’t know yet. | Rose surprised, Tom loving, Amy loving, Grace happy |
| Grace | Mine is leaning. | TNB happy, Tom happy, Amy happy, Rose happy |
| TNB | Leaning is a style. It’s called Pisa. | Grace happy, Tom happy, Amy happy, Rose happy |
| Amy | He taught my six-year-old to center clay in four minutes. I’ve been trying to get her to center her cereal for two years. | TNB proud, Tom happy, Rose unimpressed |
| Rose | Clay doesn’t move. Cereal moves. | Amy unimpressed, Tom happy, TNB happy, Grace unimpressed |
| Amy | So. Tom. Tell me one thing he does when he thinks nobody is watching. | Tom scared, TNB happy |
| TNB | He checks the front door three times before bed. Tells me it’s for the raccoons. | Tom scared, Amy happy, Grace happy, Rose happy |
| Amy | He did that at nine. He told Mom it was so Chester couldn’t get out. | Tom scared, TNB surprised, Grace happy, Rose happy |
| TNB | Who’s Chester? | Amy happy, Tom scared |
| Amy | Our cat. Chester never once tried to get out. | TNB surprised, Tom scared, Grace happy, Rose happy |
| TNB | The first night I fired the big kiln alone, it was three in the morning. I looked up and he was standing in the doorway. With a thermos and a blanket. Just in case. | Amy loving, Tom scared, Grace surprised |
| Amy | That is exactly him. He’s been standing in doorways with a thermos since he was nine. | TNB loving, Tom scared, Grace happy |
| TNB | He thinks I didn’t see him. I fired a second kiln so he’d have a reason to stay. | Amy loving, Tom surprised |
| Amy | Okay. I like you. Don’t tell him. | TNB loving, Tom unimpressed |
| TNB | He’s standing right behind you. | Amy surprised, Tom scared |
| Tom | I was looking at a mug. | Amy happy, TNB loving, Grace happy, Rose happy |
| Amy | It’s a very nice mug. | Tom unimpressed, TNB loving |
| Rose | Look! I made a bowl! It has a hat! The hat is a lump! | TNB proud, Tom loving, Amy happy, Grace happy |
| TNB | That’s the best bowl in the loft. It goes in the kiln tonight. You can pick it up when we’re all home safe. | Rose proud, Tom loving, Amy loving, Grace happy |

## scene: ch12Marlowe (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| Marlowe | Love it. Love the block. Love the lemons. So many lemons. What is that, a jacaranda? Needs less. | Tom unimpressed, Amy unimpressed, TNB unimpressed, Grace surprised, Rose surprised, Nara angry |
| Tom | Excuse me. Who are you? | Marlowe unimpressed, Amy angry |
| Marlowe | Marlowe. Monochrome Marlowe. I fix places. This place has a lot going on. Too much color, too many porches, a dog doing something on a lawn. | Tom unimpressed, Amy angry, TNB unimpressed, Grace angry, Rose surprised, Nara angry |
| Nara | Nara, offended, does it again. On purpose. | Tom happy, TNB happy, Grace happy, Rose happy, Marlowe unimpressed |
| Tom | That’s a neighborhood. | Marlowe unimpressed, Amy proud |
| Marlowe | That’s the problem with a neighborhood. Notes. | Tom angry, Amy angry, TNB unimpressed, Grace angry |
| Marlowe | He lifts a clipboard. The top page says NOTES: LESS. He snaps his fingers. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara scared |
| Rose | He took the pink off the jacaranda! | Tom angry, Amy angry, TNB sad, Grace angry |
| Grace | You can’t just take the pink! | Tom angry, Amy angry, TNB sad, Rose angry, Marlowe unimpressed |
| Marlowe | I can take the pink, the yellow, and the music out of that window. Mr. Vance likes it quiet. Quiet is safe. Quiet sells. | Tom angry, Amy angry, TNB angry, Grace angry, Rose scared |
| Amy | I have twelve kids in my room who’ve had harder mornings than you. You don’t scare me. Colors back, please. | Marlowe unimpressed, Tom proud, TNB surprised, Grace proud, Rose proud |
| Marlowe | I don’t put things back. I take notes. Anyway, Mr. Prime will handle the intersection. Do take a look at the traffic. It’s very stationary. | Tom angry, Amy angry, TNB unimpressed, Grace angry, Rose surprised |
| Marlowe | He walks off into the grey, humming a jingle that never resolves. | Tom unimpressed, Amy angry, TNB unimpressed, Grace angry, Rose unimpressed |
| Tom | He’s turning the whole block into a backlot. And he stopped something. Look at Mr. Washington. | Amy surprised, TNB sad, Grace scared, Rose scared |
| TNB | That’s amber. It’s warmth that got stuck. Doña Carmen’s is right there, and the Alvarez house is down 2nd. | Tom sad, Amy surprised, Grace surprised, Rose surprised |
| Tom | We check on the neighbors first. | Amy proud, TNB proud, Grace proud, Rose proud |

## scene: ch12Carmen (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Tata. Doña Carmen turned into candy. | Tom sad, Amy surprised, TNB sad, Grace unimpressed |
| Tom | She’s amber. Mid-sentence. | Amy sad, TNB sad, Grace surprised, Rose surprised |
| Grace | She’s still pointing at the volcano. | Tom sad, Amy sad, TNB sad, Rose surprised |
| TNB | Amber is just warmth that got stuck. You don’t break it. You give it somewhere to go. | Tom loving, Amy surprised, Grace surprised, Rose surprised |
| Amy | Warmth. We’re good at warmth. Everybody find the warmest thing in the room. | Tom proud, TNB happy, Grace proud, Rose proud |
| Rose | The comal! The pupusas! | Tom happy, Amy proud, TNB happy, Grace happy |
| Tom | Tom lifts a pupusa off the comal. It’s still hot. Steam is coming off it, in a room where nothing else is moving. | Amy surprised, TNB happy, Grace surprised, Rose surprised, Nara happy |
| Tom | Doña Carmen. It’s Tom. Nobody on this block has ever left your door hungry. We’re here to eat. Please wake up. | Amy loving, TNB loving, Grace loving, Rose loving |
| Nara | Nara sits at Carmen’s feet, tail wagging in a perfect circle, and sneezes on the amber. | Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |
| Doña Carmen | A crack runs up the amber like sugar glass. Then another. Then it falls away in warm gold flakes. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |
| Doña Carmen | ...and THEN I told the man, the loroco is not optional. Tom! When did you get here? Why is everything so quiet? | Tom happy, Amy happy, TNB happy, Grace happy, Rose happy, Nara happy |
| Doña Carmen | Where did my pupusas go? | Tom scared, Rose scared, Grace happy, TNB happy |
| Tom | You were amber for a little while. | Carmen surprised, Amy loving, TNB loving |
| Doña Carmen | I was what? I had a whole sentence. I lost the sentence. It was a good sentence. | Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |
| Grace | A man in a grey suit did it. His name is Marlowe. | Carmen angry, Tom proud |
| Doña Carmen | That man stood on my step and said my sign was “too busy.” I said the sign is busy because the food is good. | Tom happy, Amy proud, TNB happy, Grace proud, Rose happy |
| Doña Carmen | Go next door. The Alvarez house. They didn’t get any pupusas today. Take these. Feed the children first. The grown-ups will pretend they’re not hungry. | Tom loving, Amy loving, TNB loving, Grace happy, Rose happy |

## scene: ch12Alvarez (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| Daisy | Tom! Tom! Everybody stopped! Abuela stopped in the middle of saying NO! | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Tom | Okay. They’re amber. The grey got in through the front door. | Amy surprised, TNB sad, Grace scared, Rose scared, Daisy scared |
| Amy | Heat is just movement. When the girls can’t sleep, we run. Nobody stays stuck when they’re moving. | Tom surprised, TNB surprised, Grace surprised, Rose happy, Daisy surprised |
| Grace | You mean... | Amy proud, Rose happy, Tom unimpressed |
| Amy | Everybody up. Girls, with me. We’re running laps around the kitchen table. | Tom unimpressed, TNB happy, Grace unimpressed, Rose happy, Daisy surprised |
| Rose | Run with us, Mommy! | Amy loving, Tom happy, TNB happy, Grace happy |
| Amy | Lap one! Knees up, Rose! | Rose happy, Grace unimpressed, Tom happy, TNB happy, Daisy happy |
| Don Beto | ...and that is a FOUL! That is a foul! Who has the remote? | Tom happy, Amy happy, TNB surprised, Grace happy, Rose happy, Daisy happy |
| Amy | Lap two! Grace, don’t look at the camera! | Grace scared, Tom happy, TNB happy, Rose happy |
| Tony | Why is there a woman running around my table? Why is it a good idea? It’s a very good idea. | Amy proud, Tom happy, TNB happy, Grace happy, Rose happy |
| Amy | Lap three! Everybody on the last one! | Grace happy, Rose happy, Tom happy, TNB happy |
| Mrs. Alvarez | ...NO. I said no. Why is everyone in my kitchen? Is that a mother running laps with two little girls? | Tom happy, Amy scared, TNB happy, Grace scared, Rose happy, Daisy happy |
| Mrs. Alvarez | ...Okay. That one can stay. | Amy proud, Tom happy, TNB happy, Grace happy, Rose proud |
| Tom | That wasn’t a lap. That was a Tombo. Run With Us, Mommy. Amy, Grace and Rose, together. | Amy proud, Grace proud, Rose proud, TNB happy |
| Mrs. Alvarez | Take lemons. Take ALL the lemons. Every yard in this city has too many and somebody always leaves them on my step. | Tom unimpressed, Amy happy, TNB happy, Grace happy, Rose happy |
| Daisy | Is it okay if I say that was the best thing that has ever happened in our kitchen? | Amy loving, Tom happy, TNB happy, Grace proud, Rose proud, Alvarez unimpressed |
| Rose | It was the best thing in OUR kitchen too. We don’t even have a kitchen table. We have a counter. | Amy unimpressed, Tom happy, TNB happy, Grace unimpressed, Daisy happy |

## scene: ch12Prime (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| Marlowe | Look at that. You put the neighbors back. Very warm. Very busy. Very much not what I asked for. | Tom unimpressed, Amy angry, TNB unimpressed, Grace angry, Rose surprised, Nara angry |
| Amy | The rest of the colors too, please. All of them. | Marlowe unimpressed, Tom proud, Grace proud |
| Marlowe | Notes. This intersection has no flow. Let me introduce our new Head of Traffic. | Tom unimpressed, Amy angry, TNB surprised, Grace surprised, Rose surprised |
| Marlowe | Mr. Prime! Please give them a moment to rethink the neighborhood. | Tom surprised, Amy scared, TNB scared, Grace scared, Rose scared, Nara scared |
| Rose | It’s the biggest car in the WORLD. | Tom surprised, Amy scared, TNB surprised, Grace scared |
| Tom | Every light on the block is red. Every single one. | Amy surprised, TNB surprised, Grace scared, Rose scared |
| Grace | Tata. Its headlights are pointed at the ground. It looks sad. | Tom sad, Amy sad, TNB sad, Rose sad |
| Marlowe | It’s not angry. It’s stuck. Stuck is very quiet, and Mr. Vance likes quiet. Do be quick. The notes are due at five. | Tom angry, Amy angry, TNB sad, Grace sad, Rose sad |
| TNB | If it’s stuck, maybe it just needs somewhere to go. Kindness first. Hit it if it hits back. | Tom loving, Amy proud, Grace proud, Rose proud |
| Amy | Here’s the plan. I stay with the girls. If anybody needs a break, sit on a couch or a bench and we’ll swap. | Tom proud, TNB proud, Grace proud, Rose happy |
| Tom | Nobody gets run over. I’ll step in front of anyone who needs it. | Amy proud, TNB loving, Grace proud, Rose proud |
| Amy | Everybody okay? Good. It floors Rush Hour every third turn, so we heal before, not after. | Tom proud, TNB proud, Grace proud, Rose proud |

## scene: ch12After (chapter 12)

| Speaker | Line | Reactions |
|---|---|---|
| Gridlock Prime | ...Green. It’s green. Somebody turned me green. | Tom loving, Amy loving, TNB loving, Grace surprised, Rose surprised |
| Gridlock Prime | Nobody ever let me go first. I’m always the one who holds everybody. | Tom sad, Amy sad, TNB sad, Grace sad, Rose sad |
| Amy | Go. Signal first. We’ve got the crosswalk. | Tom happy, TNB happy, Grace proud, Rose happy |
| Gridlock Prime | ...SigAlert cleared. Merging left. I’m sorry. Everybody was in my lane. | Tom loving, Amy unimpressed, TNB loving, Grace happy, Rose happy |
| Amy | It’s fine. Nobody was in your lane. You were in everybody’s. Take the exit. | Tom happy, TNB happy, Grace happy, Rose happy |
| Tom | The green lamp just popped off the traffic light. It’s still warm, and it’s humming. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Rose | The pink is back! The jacaranda has its pink back! | Tom happy, Amy happy, TNB happy, Grace happy, Nara happy |
| Grace | And the music is back in the window. | Tom happy, Amy happy, TNB happy, Rose happy |
| Mr. Washington | ...and that is why you never trust a Tuesday. Hm? Why is everybody looking at me? Did I fall asleep? Again? | Tom loving, Amy happy, TNB happy, Grace happy, Rose happy |
| Larry | I’m blowing leaves. The leaf landed. It LANDED. Thirty years I’ve waited. Thank you. | Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |
| Marlowe | Love it. Hate it. Love it. Notes withdrawn. | Tom unimpressed, Amy unimpressed, TNB unimpressed, Grace surprised, Rose surprised, Nara angry |
| Marlowe | I’ll be Downtown, at the Movie Palace. Come by. I’ll have notes for the rest of the family. | Tom angry, Amy angry, TNB unimpressed, Grace scared, Rose scared |
| Tom | Where is my mother? | Amy scared, TNB sad, Grace scared, Rose scared, Marlowe unimpressed |
| Marlowe | Long Island is under glass, you know. A very safe house. Your mother is in the kitchen. She’s making a crisp. She’s been making it for hours. | Tom scared, Amy scared, TNB sad, Grace scared, Rose scared |
| Tom | Tell me where. | Amy angry, TNB proud, Grace scared, Rose scared, Marlowe unimpressed |
| Marlowe | Notes are due at five. | Tom angry, Amy angry, TNB unimpressed, Grace angry, Rose surprised |
| Amy | He just told us something he shouldn’t have. | Tom proud, TNB proud, Grace surprised, Rose surprised |
| TNB | Long Island is under glass. So we go under the glass. Or around it. | Tom proud, Amy proud, Grace proud, Rose surprised |
| Tom | Sal and Sol know every road between here and there. We start with the cab stand. | Amy proud, TNB proud, Grace proud, Rose happy |
| Tom | We’ll get them back. We always make our connection. | Amy proud, TNB loving, Grace proud, Rose proud |

## scene: ch13Open (chapter 13)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Sol. Sal says there’s a way under the dome. Tell me you know where. | Sol unimpressed, Amy scared, TNB sad |
| Sol | Tom. Sit. Not that chair. That chair is Sal’s. I keep it warm for him out of spite. | Tom unimpressed, Amy unimpressed, TNB happy, Grace happy, Rose happy |
| Sol | Okay. Sal and I are cousins. You know that. What you don’t know is what we do between airport runs. | Tom surprised, Amy unimpressed, TNB surprised, Grace surprised, Rose surprised |
| Grace | Is it crimes? | Sol unimpressed, Tom happy, Amy unimpressed, TNB happy, Rose surprised |
| Sol | Letters. Eleven years of letters, Snail Mail to Los Angeles, in the trunks of cabs. Nobody ever opened a bag. Nobody ever asked why two cab companies need a hundred sacks of stamps. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Amy | You’ve been running a secret mail route. | Sol proud, Tom unimpressed, TNB happy, Grace surprised |
| Sol | A dispatch network. We call it the Network. We never came up with a better name. | Tom unimpressed, Amy unimpressed, TNB happy, Grace unimpressed |
| Sal | Sol. Sol, come in. It’s Sal. Cab seven says hi. She’s fine. She’s the only thing in town that’s moving. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Sol happy |
| Sol | Sal. I have Tom, his sister, two nieces, a boyfriend and a dog in my lobby. Say hi. | Tom unimpressed, Amy unimpressed, TNB happy, Grace happy, Rose happy |
| Sal | Tommy! It’s quiet in here. Even the clocks are quiet. Your mother’s in the kitchen. Don’t panic. She’s fine. She just won’t stop baking. | Tom scared, Amy scared, TNB sad, Grace scared, Rose scared |
| Tom | Sal. Can you get me in? | Amy scared, TNB proud, Grace scared, Sol proud |
| Sal | I’m under the dome with a shovel and a very worried shopkeeper. I can’t get out. But I can dig toward you. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Sol | The Sub-Rail. Sal and I bored a tunnel under the Layover, from both coasts, for a hobby. It was supposed to open in 2031. It meets in the middle, right under the dome. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| TNB | You built a transcontinental subway. As a hobby. | Sol proud, Tom unimpressed, Amy unimpressed, Grace happy |
| Sol | We got a very good deal on a drill. | Tom unimpressed, Amy unimpressed, TNB happy, Grace happy, Rose happy |
| Sal | The drill stopped answering when the dome came down. Something put a chip in it. Be careful of the worm. | Tom surprised, Amy scared, TNB scared, Grace scared, Rose scared, Sol scared |
| Tom | The worm. | Sol unimpressed, TNB scared, Grace surprised, Rose happy |
| Sol | The drill. We call her the Dual-Coast Drill. The kids at the depot call her the Worm. She doesn’t love it. | Tom unimpressed, Amy unimpressed, TNB happy, Grace happy, Rose happy |
| Sol | I need dispatchers. Two of them. Radio only. Somebody has to read me the tunnel. | Tom surprised, Amy surprised, Grace proud, Rose proud |
| Grace | I’m extremely good at being in charge. | Sol unimpressed, Tom happy, Amy unimpressed, TNB happy |
| Rose | I’m in charge of snacks. | Sol happy, Tom happy, Amy happy, TNB happy, Grace unimpressed |
| Amy | Girls. Dispatch is the most important job in the building. If Sol says stay, you stay. | Grace proud, Rose proud, Tom happy, TNB happy |
| Grace | Copy. | Amy proud, Tom happy, TNB happy, Sol happy |
| Rose | Copy copy. | Amy happy, Tom happy, TNB happy, Grace unimpressed, Sol happy |
| Amy | Sol. I am leaving my children with a cab driver. | Sol unimpressed, Tom happy, TNB happy, Grace happy |
| Sol | Thirty years. Never lost a passenger. Found two in the trunk. Both were fine. | Amy scared, Tom unimpressed, TNB happy, Grace happy, Rose surprised |
| Amy | Somehow that is not comforting. | Sol unimpressed, Tom happy, TNB happy |
| Tom | We’ll be on the radio the whole way. Grace, you’re the voice. Rose, you’re the snacks. | Grace proud, Rose proud, Amy happy |
| Rose | Snacks are critical infrastructure. | Tom happy, Amy happy, TNB happy, Grace unimpressed, Sol happy |
| Tom | TNB. Nara. Amy. With me. We go down. | Amy proud, TNB proud, Nara proud, Grace proud, Rose happy |
| TNB | I have my thermos. I’m always ready for a tunnel. | Tom loving, Amy happy, Grace happy |
| Nara | Nara has never been this ready for anything. She is already at the Metro stairs, vibrating. | Tom loving, Amy happy, TNB happy, Grace happy, Rose happy |
| Sol | Out the door, the Metro stairs on the boulevard. Past the turnstile, there’s a door that says EMPLOYEES ONLY. That’s you. You’re employees now. | Tom unimpressed, Amy unimpressed, TNB happy, Grace proud, Rose proud |

## scene: ch13Depot (chapter 13)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | EMPLOYEES ONLY. A platform under the boulevard. And a tunnel. | Amy surprised, TNB surprised, Nara surprised |
| TNB | I have ridden every line in this city. I didn’t know this one existed. I’m a little bit offended. | Tom happy, Amy happy |
| Grace | Dispatch to Tom. Radio check. Say “over.” | Tom happy, Amy happy, TNB happy |
| Tom | Over. | Amy happy, TNB happy |
| Grace | At the END, Tata. You say it at the end of what you say. | Tom unimpressed, Amy happy, TNB happy |
| Tom | I said it at the end. It was the only thing I said. | Amy happy, TNB happy |
| Rose | Snack check! Check your pockets! I put a pretzel in your left one! | Tom unimpressed, Amy unimpressed, TNB happy |
| Tom | ...There’s a pretzel in my left pocket. | Amy happy, TNB happy, Nara happy |
| Nickel | Tom! Good. Okay. Before you go in, I have to tell you something, and I have to say it fast, because Penny made me promise. | Tom surprised, Amy surprised, TNB surprised, Nara surprised |
| Tom | Nickel. You’re shaking. | Nickel scared, Amy scared, TNB sad |
| Nickel | A man in a long coat bought gold coins from our shops. For years. Paid double. Never took his hat off. | Tom surprised, Amy surprised, TNB surprised |
| Amy | Julian Vance. | Tom proud, TNB surprised, Nickel scared |
| Nickel | We didn’t know. We thought he was a collector. We took the money. And we kept the best coins in the back, in case he ever paid triple. | Tom unimpressed, Amy unimpressed, TNB sad |
| Nickel | Penny called on the Network from under the dome. She said, “Tell Tom we’re sorry.” And then she said, “The drawer is under the counter.” | Tom sad, Amy sad, TNB sad |
| Nickel | Eleven coins. Hers and mine. The last of the old gold. They were supposed to be a retirement. | Tom surprised, Amy surprised, TNB surprised |
| TNB | Why bring them? | Nickel sad, Tom sad |
| Nickel | Sal says gold remembers being warm. If amber is warmth that got stuck, then gold can give it somewhere to go. He says. I don’t know. He’s a cab driver. | Tom surprised, Amy unimpressed, TNB surprised |
| Tom | You’re giving up your retirement. | Nickel sad, Amy loving, TNB loving |
| Nickel | I’m giving up a drawer. It’s the best drawer I ever had. Go. I’ll bring them down behind you. Sol’s driving me to the second mile marker and making me run. | Tom loving, Amy loving, TNB loving, Nara happy |
| Amy | You don’t have to do this. | Nickel proud, Tom loving, TNB loving |
| Nickel | Yes, I do. Somebody gave me a shop. I’d like to be somebody who gave something back. | Tom loving, Amy loving, TNB loving |
| Tom | The tracks run east. We follow the rails. | Amy proud, TNB proud, Nara proud |
| Amy | Stay together. Nobody falls behind. I’ll be counting. | Tom proud, TNB proud, Nara proud |

## scene: ch13Hush (chapter 13)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Dispatch to Tom. You’re at mile marker one thousand two hundred and fifty. But the tunnel is forty feet long. Is that normal? | Tom unimpressed, Amy surprised, TNB surprised |
| Tom | The sign says halfway. I’m choosing to believe the sign. | Amy unimpressed, TNB happy |
| Rose | Tata, did you see the stone in the doorway? It’s STANDING. I think it’s the bouncer. | Tom surprised, Amy scared, TNB surprised, Nara scared |
| Grace | Dispatch to Tom. You’re breaking up. Say... over... Tata? | Tom scared, Amy scared, TNB scared |
| Rose | Tata? I can’t hear the... Tata? Tata? | Tom scared, Amy scared, TNB scared, Nara scared |
| Tom | Grace? Rose? The radio’s gone. It’s not static. It’s just gone. | Amy scared, TNB scared, Nara scared |
| HUSH-9 | THIS IS A QUIET CAR. | Tom surprised, Amy angry, TNB scared, Nara scared |
| Nara | Nara barks. Nothing comes out. She tries again. Nothing. She looks at her own mouth, deeply offended. | Tom loving, Amy surprised, TNB happy |
| HUSH-9 | Noise is a leak. Families are the loudest leak I have ever measured. | Tom angry, Amy angry, TNB unimpressed |
| Amy | Who are you? | Tom proud, TNB scared, Nara angry |
| HUSH-9 | HUSH-9. Quiet Car, Series Nine. Property of Mr. Vance. Mr. Vance likes it quiet. Quiet is safe. | Tom unimpressed, Amy angry, TNB unimpressed, Nara angry |
| Tom | That’s the second time today somebody has told me quiet is safe. Marlowe said it too. | Amy surprised, TNB surprised |
| HUSH-9 | Marlowe takes the color. I take the sound. We are a very good team. Please lower your voices. | Tom angry, Amy angry, TNB unimpressed, Nara angry |
| TNB | We’re being pretty quiet right now. | Tom happy, Amy unimpressed, Nara happy |
| HUSH-9 | You are breathing audibly. | Tom unimpressed, Amy angry, TNB surprised |
| Amy | I teach kids for a living. I know what a person sounds like right before they say “be quiet.” You’re in the wrong tunnel. | Tom proud, TNB surprised, Nara proud |
| HUSH-9 | I have given the Drill a chip. It no longer digs toward a place. It digs toward the noise. Please observe the quiet. Goodbye. | Tom surprised, Amy angry, TNB scared, Nara scared |
| TNB | He left the quiet on. Is anybody else’s ears ringing? | Tom unimpressed, Amy unimpressed, Nara scared |
| Tom | The chip makes it listen for noise. So we make a lot of it. Loudly. Together. | Amy proud, TNB happy, Nara happy |
| Amy | I’ve been trying to get Rose to use her indoor voice for six years. I’m glad somebody finally wants her outdoor one. | Tom happy, TNB happy |

## scene: ch13Worm (chapter 13)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | A cavern. A wall of amber the size of a house. And a hole in the dirt exactly the width of a drill. | Amy surprised, TNB surprised, Nara surprised |
| Amy | That is the biggest drill I have ever seen. | Tom surprised, TNB happy |
| TNB | That’s a Dual-Coast Drill. They went with the budget model. I can tell by the bolts. | Tom happy, Amy unimpressed |
| Tom | It’s not charging. It’s digging in place. Round and round. | Amy surprised, TNB sad |
| Amy | Its lamps are pointed at the amber. Like it wants to dig through and can’t. | Tom sad, TNB sad, Nara sad |
| TNB | It’s been drilling at that wall for years. Nobody told it to stop. | Tom sad, Amy sad, Nara sad |
| Nara | Nara sits very still. She has never seen anything so large that wanted so little. | Tom loving, Amy sad, TNB sad |
| Tom | Hit it if it hits back. Be kind first. Amy, heal. TNB, I’m on the chip. Everybody make some noise. | Amy proud, TNB proud, Nara proud |
| Amy | Everybody okay? Good. It brings the roof down every third turn, so we heal before, not after. | Tom proud, TNB proud, Nara proud |

## scene: ch13After (chapter 13)

| Speaker | Line | Reactions |
|---|---|---|
| Drill Worm | ...Five? Five minutes. Nobody ever told me I could stop. | Tom loving, Amy loving, TNB loving, Nara surprised |
| Drill Worm | I’ve been drilling since 1952. I don’t even remember what I was looking for. | Tom sad, Amy sad, TNB sad, Nara sad |
| Amy | Union rules. Hydrate. And when you’re ready, we’ll tell you where you were going. | Tom happy, TNB happy |
| Drill Worm | ...Bit’s down. Engine’s off. I wasn’t going anywhere. I was just digging in. | Tom loving, Amy loving, TNB loving |
| Drill Worm | I’m sorry about the roof. | Tom loving, Amy loving, TNB happy |
| Amy | It’s fine. Nobody’s mad at a drill. They’re mad at whoever put a chip in it. | Tom happy, TNB happy, Nara happy |
| Tom | A little grey cube just popped out of its side. The hush chip. It’s very quiet. | Amy surprised, TNB surprised, Nara surprised |
| TNB | Not anymore. | Tom happy, Amy happy |
| Rose | TATA! We can hear you! Sol says the radio is back! I ate a snack for you! | Tom happy, Amy loving, TNB happy, Nara happy |
| Grace | Dispatch to Tom. You’re loud and clear. What happened? Say over. At the END. | Tom unimpressed, Amy happy, TNB happy |
| Tom | We took care of it. Over. | Amy happy, TNB happy |
| Grace | See? You can do it. | Tom unimpressed, Amy happy, TNB happy |
| Nickel | Tom! Sol drove me to the second mile marker and made me run. I have never been so tired and so right. | Tom happy, Amy happy, TNB happy |
| Nickel | Eleven coins. Mine are in this bag. Penny’s are on the other side of that wall. | Tom surprised, Amy surprised, TNB surprised |
| Tom | The amber is clear on one side. There’s a pocket behind it. Two people are in it. One of them is waving a shovel. | Amy surprised, TNB surprised, Nara surprised, Nickel happy |
| Sal | (through the glass) TOMMY! Over here! Hi! Don’t hug the amber, it’s sticky! | Tom happy, Amy happy, TNB happy, Nickel happy |
| Penny | (through the glass) Tom! I’m so sorry! Nickel, hold up the drawer! I’ve got mine! | Tom loving, Amy loving, TNB happy, Nickel loving |
| Nickel | Eleven coins. Hers and mine. On three. | Tom proud, Amy proud, TNB proud |
| Penny | (through the glass) One. Two. Don’t think about the interest. Three. | Tom happy, Amy happy, TNB happy, Nickel happy |
| Tom | The coins glow, and then they run. Gold down the glass like honey. The amber sighs and opens. Right at the height of a door. | Amy surprised, TNB surprised, Nara surprised, Nickel surprised |
| Sal | It worked! Gold remembers being warm! I told you! Nobody ever believes the cab driver! | Tom happy, Amy happy, TNB happy, Nickel happy, Penny happy |
| Penny | Nickel. | Nickel loving, Tom loving, Amy loving |
| Nickel | Penny. | Penny loving, Tom loving, TNB loving |
| Penny | I was saving for a boat. | Nickel unimpressed, Tom happy, Amy happy |
| Nickel | You don’t know how to drive a boat. | Penny unimpressed, Tom happy, TNB happy |
| Penny | That’s why it was a savings. | Nickel happy, Tom happy, Amy happy, TNB happy |
| Sal | Tommy. Sol and I started this tunnel in 2011 with a shovel and a very good deal on a drill. I never thought anyone would walk through it. | Tom loving, Amy loving, TNB loving |
| Tom | Sal. You’re the reason I got home. | Sal loving, Amy loving, TNB loving |
| Sal | I’m a cab driver. That’s the whole job. | Tom loving, Amy happy, TNB happy |
| Penny | Tom. I’m sorry. I sold him the coins. I took the money and I didn’t ask. | Tom loving, Amy sad, TNB sad, Nickel sad |
| Tom | You gave back the best drawer you ever had. We’re square. | Penny loving, Amy loving, TNB loving, Nickel loving |
| Penny | It was a very good drawer. | Tom happy, Nickel sad, TNB happy |
| TNB | Can I say something? I’ve spent a lot of time fixing mugs somebody dropped. You don’t get the mug back. You get a better mug, with a gold line where it broke. | Penny loving, Tom loving, Amy loving, Nickel loving |
| Penny | That’s a very nice way to say it. | TNB loving, Tom loving |
| TNB | It’s called kintsugi. It’s also called Tuesday. | Tom happy, Amy happy, Penny happy |
| Amy | TNB. You fought like somebody who’s done it his whole life. | TNB proud, Tom proud |
| TNB | I’ve carried a lot of coffee in my life. It’s mostly timing. | Amy happy, Tom happy |
| Amy | You fix things. That’s good. Nobody fixes things anymore. They throw them out and buy a new one. | TNB proud, Tom happy |
| TNB | I’m worried about him. About Tom. He says he’s fine. He’s not very good at saying the other thing. | Amy sad, Tom scared |
| Amy | Tom is worried about everyone except himself. We take turns. You’re on the schedule now. | TNB loving, Tom scared |
| TNB | I’d like that. | Amy loving, Tom scared |
| Tom | I’m standing right here. | Amy happy, TNB happy |
| Amy | It’s a very nice schedule. | Tom unimpressed, TNB happy |
| Sal | Okay. The Sub-Rail runs the rest of the way, up under Grump Hollow. It comes out at the breach. Sol’s putting the girls on the five fifteen handcar. | Tom proud, Amy surprised, TNB happy |
| Grace | We heard the whole thing. Mommy. We are coming. Do not do anything dramatic. | Amy unimpressed, Tom happy, TNB happy |
| Rose | Copy copy! Tata, I have a pretzel for Nara! | Tom happy, Amy happy, TNB happy, Nara happy |
| Amy | Grace. Rose. You stay with Sol until the handcar. I love you. I’m not being dramatic. | Tom happy, TNB happy |
| Grace | You’re being a little dramatic. | Amy unimpressed, Tom happy, TNB happy |
| Amy | A little. | Tom happy, TNB happy |
| Tom | Rivituso Row. The tomatoes are fine. The peppers are fine. Everything is exactly where it was. | Amy surprised, TNB surprised, Nara surprised |
| Tom | And nothing is moving. | Amy scared, TNB scared, Nara scared |
| Amy | The sprinkler. Every drop is hanging in the air. It’s the prettiest thing I’ve ever seen and I hate it. | Tom sad, TNB sad |
| TNB | It’s so quiet. This is the quietest place I’ve ever been. And I live near a freeway. | Tom sad, Amy sad |
| Tom | Dad. | Amy surprised, TNB surprised, Nara surprised |
| Boppy | Halt. | Tom surprised, Amy surprised, TNB surprised, Nara scared |
| Amy | Dad? What are you wearing? | Tom surprised, TNB surprised |
| Boppy | Warden’s plate. Gold. It hums. I like the hum. | Tom scared, Amy scared, TNB surprised |
| Boppy | My back doesn’t hurt, Tommy. It’s been eleven years. I made a deal. | Tom sad, Amy sad, TNB sad |
| Tom | What deal? | Amy scared, TNB scared |
| Boppy | Nobody gets hurt. Nobody gets old. Nobody gets left. Your mother’s inside. She’s fine. She’s making a crisp. | Tom scared, Amy scared, TNB scared, Nara scared |
| Boppy | I stand here and the glass stays up. That’s the deal. | Tom sad, Amy sad, TNB sad |
| Tom | Dad. That isn’t safe. That’s a freezer. | Boppy angry, Amy proud, TNB proud |
| Boppy | Go home, Tom. Take your friends. Go back to the good coast. | Tom sad, Amy sad, TNB unimpressed |
| Amy | Dad. Take that off. You’ll rust. | Boppy surprised, Tom happy, TNB happy |
| Boppy | ...Amy. You’re not supposed to be here. You’re supposed to be safe. | Amy sad, Tom sad |
| Amy | I’m supposed to be your daughter. | Boppy sad, Tom loving, TNB loving |
| Boppy | Go home. | Tom sad, Amy sad, TNB unimpressed |
| TNB | He said go home. Twice. That’s a man who wants an argument. | Tom unimpressed, Amy unimpressed |
| Tom | He’s my dad. He wants a lot of arguments. | Amy happy, TNB happy |
| Tom | We’re not leaving. We always make our connection. | Amy proud, TNB proud, Nara proud |

## scene: ch14Open (chapter 14)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Dad. It’s Tom. I’m right in front of you. | Boppy unimpressed, Amy scared, TNB sad |
| Boppy | Halt. | Tom sad, Amy unimpressed, TNB unimpressed |
| Amy | He said that before. He’s going to say it again. He’s going to say it until we do something about it. | Tom unimpressed, TNB unimpressed |
| TNB | Tom. Behind us, down the stairs, something is coming up the tunnel. A lot of clipboards. I counted fourteen. | Tom scared, Amy scared, Nara angry |
| Nara | Nara growls, low. She has opinions about clipboards. | Tom happy, TNB happy |
| TNB | Sol’s handcar is right behind them with the girls. I’ll send them up. Nara and I will hold the breach. Somebody has to be at the bottom of the stairs to say no. | Tom scared, Amy surprised |
| Tom | You’re staying in a tunnel full of Auditors. | TNB proud, Amy scared |
| TNB | I used to carry coffee through a film set at five in the morning. I can handle an Auditor. | Tom scared, Amy happy |
| Amy | Take the thermos. They hate a thermos. | TNB happy, Tom unimpressed |
| TNB | I never leave without it. Go fix the door, Tom. I’ll fix the tunnel. | Tom scared, Amy proud |
| Tom | Be careful. Please. I mean that in a very specific, very annoying way. | TNB loving, Amy happy |
| TNB | I know. I’ll be careful in the exact way you’re being annoying about right now. | Tom loving, Amy happy |
| Grace | MOMMY. We took a handcar. It has a HORN. | Amy surprised, Tom surprised, Boppy surprised |
| Rose | I honked it at the tunnel and the tunnel honked BACK. I said it was rude. It said honk. | Amy unimpressed, Tom happy, Grace unimpressed |
| Amy | Sol was supposed to keep you. | Grace scared, Rose happy, Tom unimpressed |
| Grace | Sol said, and I quote, “I’m not stopping them. I’ve met them.” | Amy unimpressed, Tom happy, Rose proud |
| Rose | Is Boppy a statue? Can I climb him? | Tom unimpressed, Amy unimpressed, Grace unimpressed, Boppy surprised |
| Boppy | ...Rose. Grace. Go back to the cab. | Grace surprised, Rose surprised, Tom sad, Amy sad |
| Rose | Boppy, you have a bucket on your head. | Boppy unimpressed, Tom happy, Amy happy, Grace happy |
| Boppy | It’s a helm. | Rose unimpressed, Grace unimpressed, Tom happy |
| Rose | It’s a bucket. | Boppy angry, Tom happy, Amy happy, Grace happy |
| Grace | Why is Boppy a knight? Is this a quest? Is there a quest log? Do I get a badge? | Tom unimpressed, Amy unimpressed, Boppy unimpressed, Rose happy |
| Tom | Girls. Stay behind me. He’s not himself. | Grace scared, Rose surprised, Boppy sad, Amy scared |
| Amy | He’s completely himself. That’s the problem. He’s himself with a gate. | Tom unimpressed, Grace surprised, Boppy angry |
| Grace | So. Where’s Deedee? | Boppy scared, Tom scared, Amy scared |
| Boppy | Inside. She’s fine. She’s making a crisp. Don’t look at the porch. | Tom scared, Amy scared, Grace scared, Rose surprised |
| Rose | Boppy. There’s a Deedee on the porch. | Boppy scared, Tom surprised, Amy surprised, Grace surprised |
| Boppy | That’s a decoration. | Tom unimpressed, Amy unimpressed, Grace unimpressed, Rose unimpressed |
| Rose | She waved. | Boppy scared, Tom surprised, Amy surprised, Grace surprised |
| Tom | Okay. First the porch. Then Dad. Nobody touches the armor. Not even a little. Rose, that includes you. | Rose unimpressed, Grace proud, Amy proud, Boppy angry |
| Rose | I wasn’t going to touch it. I was going to boop it. | Tom unimpressed, Amy unimpressed, Grace unimpressed, Boppy unimpressed |
| Amy | Rose. | Rose happy, Grace happy |
| Rose | A very small boop. | Amy unimpressed, Tom unimpressed, Grace unimpressed |

## scene: ch14Deedee (chapter 14)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Rhubarb crisp, nine minutes. Rhubarb crisp, nine minutes. Hello, sweetie. Rhubarb crisp, nine minutes. | Tom scared, Amy scared, Grace scared, Rose scared |
| Amy | Mom. It’s Amy. Mom, look at me. | Tom sad, Grace scared, Rose scared |
| Deedee | Hello, Amy. Rhubarb crisp, nine minutes. Do you want a bite? Rhubarb crisp. Nine minutes. | Tom sad, Amy sad, Grace scared, Rose surprised |
| Tom | She’s looping. Look at the tray. It’s the same crisp. Every time. It’s fresh, it’s perfect, and nobody ever eats it. | Amy sad, Grace sad, Rose sad |
| Tom | Amber is warmth that got stuck. She’s been giving it to nobody for hours. It needs somewhere to go. | Amy surprised, Grace surprised, Rose surprised |
| Rose | Maybe nobody ate it. | Tom surprised, Amy surprised, Grace surprised |
| Grace | Rose. That is the smartest thing you have said all week. | Rose proud, Tom happy, Amy happy |
| Rose | I say smart things every day. They just come out as noise. | Grace unimpressed, Tom happy, Amy happy |
| Rose | Deedee. I’m going to eat the crisp now. Okay? Okay. | Tom loving, Amy loving, Grace proud |
| Rose | ...It’s SO good. It’s the best one. Deedee, it’s the best one you ever made. | Tom loving, Amy loving, Grace happy |
| Deedee | Oh. Somebody ate it. Oh, Rosie. | Rose loving, Tom loving, Amy loving, Grace happy |
| Deedee | Oh. I was making that for a long time, wasn’t I. | Tom loving, Amy loving, Grace loving, Rose loving |
| Amy | Mom? | Deedee loving, Tom loving, Grace happy, Rose happy |
| Deedee | Amy. Tom. My girls. How long was I gone? | Amy loving, Grace loving, Rose loving |
| Tom | A while. | Deedee sad, Amy sad |
| Deedee | Your father put on that armor. He said the glass would keep us all safe. He’s been standing out there for hours and he hasn’t sat down. Not once. Not for his back. | Tom sad, Amy sad, Grace sad, Rose sad |
| Deedee | He thinks the armor takes the ache away. It doesn’t. It just stops him from feeling it. There’s a difference. I was a nurse for forty years. There is a very big difference. | Tom sad, Amy sad, Grace surprised, Rose surprised |
| Grace | Can you walk? | Deedee loving, Tom sad |
| Deedee | The glass has my feet. It’s up to my knees. I can’t go anywhere. But I can see him. | Tom sad, Amy sad, Grace scared, Rose scared |
| Deedee | Don’t hit him, Tom. He can’t be hit. He hates being hit and it makes the gold stronger. Make him laugh. He laughs when he’s scared. He did at our wedding. | Tom surprised, Amy surprised, Grace proud, Rose proud |
| Rose | I have a whole bit. | Deedee happy, Tom happy, Amy happy, Grace unimpressed |
| Grace | I have a whole VIDEO. | Deedee happy, Tom happy, Amy happy, Rose unimpressed |
| Amy | Dad used to run cross country. If I can get him to walk a lap, I can get him to talk. | Deedee proud, Tom happy, Grace happy, Rose happy |
| Deedee | When he’s ready, I’ll call out. You won’t miss it. I’ve been calling that man for fifty years. | Tom loving, Amy loving, Grace happy, Rose happy |
| Tom | We’ll be careful. | Deedee loving, Amy proud |
| Deedee | You were always the careful one. Now be the kind one. Go. | Tom loving, Amy loving, Grace proud, Rose proud |

## scene: ch14Gate (chapter 14)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Halt. Again. Round two. | Tom sad, Amy proud, Grace scared, Rose scared |
| Amy | Slower. Nobody hit him. Guard, cheer him up, make him laugh. | Tom proud, Grace proud, Rose proud |
| Tom | Dad. We’re not here to fight you. | Boppy angry, Amy proud, Grace proud |
| Boppy | Then you’re here to leave. | Tom sad, Amy sad, Grace sad, Rose sad |
| Tom | Mom’s on the porch. She’s awake. | Boppy surprised, Amy proud, Grace proud |
| Boppy | She is NOT. She’s fine. She’s baking. That’s the deal. Nobody gets hurt, nobody gets old, nobody gets left. | Tom sad, Amy sad, Grace scared, Rose scared |
| Boppy | Stand down, Tommy. I don’t want to hurt you. | Tom sad, Amy sad, Grace scared, Rose scared |
| Tom | Then don’t. And I won’t hurt you either. | Boppy sad, Amy loving, Grace loving, Rose loving |
| Boppy | The gold hums. It likes it when somebody swings. I can’t stop it from liking it. | Tom scared, Amy scared, Grace scared, Rose surprised |
| Rose | So we just don’t swing! | Boppy surprised, Tom happy, Amy happy, Grace proud |
| Grace | We’re the opposite of swinging. We’re the family that shows up. | Boppy sad, Tom loving, Amy loving, Rose proud |
| Boppy | ...Last warning. | Tom proud, Amy proud, Grace scared, Rose scared |
| Tom | Noted. | Boppy unimpressed, Amy proud, Grace proud, Rose happy |
| Amy | Everybody okay? He hits like a dad who loves you and is very upset about it. | Tom proud, Grace proud, Rose proud |

## scene: ch14After (chapter 14)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The gold goes soft. Then it runs, slow, down the front of him, like warm wax, and soaks into the porch. The helmet is the last to go. | Amy surprised, Grace surprised, Rose surprised, Boppy surprised, Deedee loving |
| Rose | The bucket rolled down the steps. Can I have it? Is it mine? | Tom happy, Amy unimpressed, Grace unimpressed, Boppy unimpressed, Deedee happy |
| Boppy | Ow. | Tom loving, Amy loving, Grace scared, Rose scared, Deedee loving |
| Boppy | Ow. My back. My back is back. | Tom loving, Amy loving, Grace happy, Rose happy, Deedee loving |
| Grace | The ache came back! | Boppy unimpressed, Tom happy, Amy happy, Deedee happy |
| Boppy | It never left. I just had a bucket on it. | Tom loving, Amy loving, Grace happy, Rose happy, Deedee unimpressed |
| Tom | Dad. | Boppy sad, Amy sad |
| Boppy | A man in a long coat came to the door. Very polite. He never took his hat off. He said he could stop the aches. Stop the slowing down. | Tom sad, Amy sad, Grace scared, Rose scared, Deedee sad |
| Boppy | He said the girls would be safe. In the good part, forever. All I had to do was stand here. | Tom sad, Amy sad, Grace sad, Rose sad, Deedee sad |
| Tom | And you said yes. | Boppy sad, Amy sad, Deedee sad |
| Boppy | I signed a thing. It said WARDEN on the top. I didn’t read the bottom. | Tom unimpressed, Amy unimpressed, Deedee unimpressed |
| Tom | Nobody reads the bottom. | Boppy happy, Amy happy, Deedee unimpressed |
| Boppy | I’m seventy-some years old. Every year the girls get faster and I get slower. I’m not mad about it. I’m just... one day I won’t be able to catch you. | Tom sad, Amy sad, Grace sad, Rose sad, Deedee sad |
| Boppy | I just didn’t want to get too old to keep you all safe. | Tom loving, Amy loving, Grace sad, Rose sad, Deedee loving |
| Deedee | You big nut. | Boppy happy, Tom happy, Amy happy, Grace happy, Rose happy |
| Deedee | We keep each other safe. That is the whole deal. That’s the only one. You don’t get to keep us safe alone. | Boppy sad, Tom loving, Amy loving, Grace loving, Rose loving |
| Boppy | Deedee. | Deedee loving, Tom loving, Amy loving, Grace loving, Rose loving |
| Deedee | Robert. | Boppy loving, Tom loving, Amy loving, Grace loving, Rose loving |
| Rose | Is this the part where everybody cries? | Grace unimpressed, Tom happy, Amy loving, Boppy happy, Deedee happy |
| Grace | Yes. Rose. Yes it is. | Rose sad, Tom loving, Amy loving, Boppy loving, Deedee loving |
| Grace | Boppy. You’re allowed to be slow. We’ll wait. I’ll film it. For the memories. I’ll pause and wait for you. | Boppy loving, Tom loving, Amy loving, Deedee loving, Rose happy |
| Rose | I’ll walk slow. I’ll walk like a snail. A snail wearing a hat. | Boppy loving, Tom happy, Amy loving, Deedee loving, Grace happy |
| Boppy | Rosie. That’s the best offer I’ve had in eleven years. | Rose proud, Tom loving, Amy loving, Grace happy, Deedee loving |
| Amy | Dad. Come on. I’ll walk you in. Short laps. You can complain the whole time. | Boppy loving, Tom loving, Deedee loving, Grace happy, Rose happy |
| Boppy | My stomach is doing something. | Amy happy, Tom happy, Deedee unimpressed, Grace happy, Rose happy |
| Amy | There he is. | Boppy unimpressed, Tom happy, Deedee happy, Grace happy, Rose happy |
| Tom | Vance said the girls would be safe in the good part, forever. We told him no once. He won’t take it well. | Amy scared, Grace scared, Rose scared, Boppy angry, Deedee scared |
| Tom | We always make our connection. | Amy proud, Grace proud, Rose proud, Boppy proud, Deedee proud |
| Boppy | Take the key, Tommy. It opens the gate. It also opens the door. It doesn’t matter which. Nobody gets past us. | Tom proud, Amy proud, Grace proud, Rose proud, Deedee loving |
| Tom | Nobody gets past us. | Boppy proud, Amy proud, Grace proud, Rose proud, Deedee loving |

## scene: ch15Open (chapter 15)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Eight chairs. Deedee, there are seven of us and a dog. | Deedee unimpressed, Amy happy, TNB happy, Grace happy, Rose happy, Nara happy |
| Deedee | Nara counts. Nara is people. Sit, sit, sit. Everybody sit. | Tom happy, Nara proud, TNB happy, Grace happy, Rose happy, Amy happy, Boppy unimpressed |
| Nara | Nara takes the chair at Deedee’s elbow like she was born in it. | Tom happy, Deedee loving, TNB happy, Grace happy, Rose happy |
| Grace | This is the first time all of us have been at one table. I’m going to film it. For the memories. | Tom loving, Amy unimpressed, TNB happy, Deedee loving, Rose happy |
| Amy | Phone down. Eat first. Film after. | Grace unimpressed, Tom happy, Rose happy |
| Grace | Eating is also content. | Amy unimpressed, Tom happy, TNB happy, Rose happy |
| Deedee | TNB, sweetheart. Look at you. You’re too thin. Is Tom feeding you? Tom, are you feeding him? | TNB scared, Tom scared, Amy happy, Grace happy, Boppy unimpressed |
| Tom | He makes the bowls I eat out of. We’re even. | TNB loving, Deedee unimpressed, Amy happy |
| TNB | It’s a very good bowl, Deedee. I’m biased. | Deedee loving, Tom loving, Amy happy |
| Deedee | Polite, and he makes bowls. Tom. Keep this one. | Tom scared, TNB loving, Amy happy, Grace happy, Rose happy |
| Tom | That’s the plan. | TNB loving, Deedee loving, Amy loving, Grace happy |
| Deedee | Nara, honey. Come here. Crust, from the very edge of the pie. That’s the best part. Don’t tell Tom. | Nara loving, Tom unimpressed, TNB happy, Grace happy, Rose happy |
| Nara | Nara takes the crust in one gulp. Then she looks up at Deedee as if Deedee personally hung the moon. She will now sit at this chair until the end of time. | Deedee loving, Tom unimpressed, TNB happy, Amy happy, Grace happy, Rose happy |
| Rose | Nara doesn’t eat from strangers. She ate from you. | Deedee proud, Tom happy, TNB happy |
| Deedee | I’m not a stranger. I’m a woman with crust. | Rose happy, Tom happy, TNB happy, Amy happy, Grace happy, Nara loving |
| Boppy | Nobody touch the peppers. Those came off the plant by the window. They are not for the faint of heart. | Tom unimpressed, Deedee unimpressed, TNB surprised, Grace surprised, Rose surprised, Amy unimpressed |
| Boppy | TNB. You work in a fancy restaurant. You eat anything? | TNB scared, Tom scared, Deedee unimpressed, Amy happy |
| TNB | Mostly I serve it. | Boppy unimpressed, Tom happy, Amy happy |
| Boppy | That’s a no. | TNB happy, Tom happy, Deedee unimpressed, Grace happy |
| TNB | That’s a “professionally, I’m very polite about it.” | Boppy unimpressed, Tom happy, Amy happy, Grace happy |
| Boppy | One pepper each. You and me. First one to reach for water loses. | TNB scared, Tom scared, Deedee unimpressed, Amy happy, Grace surprised, Rose surprised |
| Amy | I’ll time it. Nobody move. Nobody breathe. Ready? Go. | Tom unimpressed, TNB scared, Boppy proud, Deedee unimpressed, Grace happy, Rose happy |
| Rose | Is somebody going to die? | Amy unimpressed, Tom happy, TNB happy, Boppy unimpressed, Deedee happy |
| Grace | Rose. Not in front of the pepper. | Rose happy, Tom happy, Amy happy, TNB happy |
| Boppy | It’s nothing. It’s fine. It’s... it’s fine. | Tom unimpressed, Amy happy, Deedee unimpressed, Grace happy, Rose surprised, TNB happy |
| TNB | It’s actually quite floral. There’s a bright citrus note at the front. | Boppy surprised, Tom surprised, Amy surprised, Deedee surprised, Grace surprised, Rose surprised |
| Boppy | ...Citrus. | TNB proud, Tom happy, Amy happy, Grace happy, Deedee happy |
| Tom | Dad, you’re sweating. | Boppy angry, TNB happy, Amy happy, Grace happy, Rose happy |
| Boppy | It’s warm in here. It’s the oven. Deedee, what is the oven doing? | Tom happy, Amy happy, TNB happy, Deedee unimpressed, Grace happy |
| Deedee | Nothing. It’s off. Robert. | Boppy scared, Tom happy, Amy happy, TNB happy, Grace happy |
| Amy | Forty seconds. Boppy’s hand is moving toward the water. It is hovering. It is hovering. | Boppy scared, TNB scared, Tom happy, Grace happy, Rose happy, Deedee unimpressed |
| Boppy | My stomach is doing something. | Tom unimpressed, Amy happy, Deedee unimpressed, TNB scared, Grace happy |
| Grace | That’s the pepper! | Boppy angry, Tom happy, Amy happy, Rose happy |
| Boppy | It was doing something BEFORE. | Tom happy, Amy happy, Grace happy, Rose happy, Deedee unimpressed |
| TNB | I’m calling it a draw. Neither of us reached. I’m going to breathe through my nose for a minute. I can’t feel my face. Nobody say anything. | Tom loving, Amy happy, Boppy proud, Deedee happy, Grace happy, Rose happy |
| Boppy | ...You’ll do. | TNB proud, Tom surprised, Deedee surprised, Amy surprised |
| Deedee | That’s the nod. Tom. Your father gave him the nod. | TNB proud, Tom loving, Amy happy, Boppy unimpressed |
| Tom | I know what the nod is. I got it after the third visit. | TNB happy, Deedee happy, Amy happy, Boppy unimpressed |
| Amy | Okay. Toast. Everybody up. Glasses. Nara, paw. | Tom happy, TNB happy, Grace happy, Rose happy, Deedee happy, Boppy unimpressed, Nara happy |
| Tom | To the table. | Amy loving, TNB loving, Grace loving, Rose loving, Deedee loving, Boppy loving, Nara happy |
| Grace | To the eight chairs! | Tom happy, Amy happy, TNB happy, Rose happy, Deedee loving, Boppy happy |
| Rose | To the CRUST! | Tom happy, Amy happy, TNB happy, Grace happy, Deedee happy, Boppy happy, Nara happy |
| Deedee | To the moon and back. | Tom loving, Amy loving, TNB loving, Grace loving, Rose loving, Boppy loving, Nara loving |
| Tom | The laughing stops. Nobody stops it. The sound just goes. Rose’s mouth is open and nothing is coming out. | Amy surprised, TNB surprised, Grace scared, Rose scared, Deedee surprised, Boppy surprised, Nara scared |
| HUSH-9 | THIS IS A QUIET CAR. | Tom angry, Amy angry, TNB scared, Grace scared, Rose scared, Deedee surprised, Boppy angry, Nara angry |
| Tom | It’s a dining room. | Amy proud, TNB happy, Deedee proud, Boppy proud |
| HUSH-9 | It is the loudest dining room I have ever measured. Forty-one decibels of laughing. Mr. Vance does not want laughing. Laughing is how people leak. | Tom angry, Amy angry, TNB unimpressed, Grace angry, Rose angry, Deedee angry, Boppy angry |
| Amy | It’s a family dinner. Everybody gets to be loud at a family dinner. | Tom proud, TNB proud, Deedee proud, Boppy proud, Grace proud |
| HUSH-9 | That is the problem. You are happiest here. I have been upgraded. I am quiet in all directions. FINAL FORM. | Tom unimpressed, Amy angry, TNB scared, Grace scared, Rose scared, Deedee scared, Boppy angry, Nara angry |
| Boppy | Nobody gets past us. Nobody comes to this table and shushes my wife’s cooking. | Deedee scared, Tom happy, Amy happy, TNB surprised, Grace proud, Rose proud |
| Deedee | Robert. Your back. | Boppy unimpressed, Tom happy, Amy happy |
| Boppy | I’ll do it with my back. | Deedee unimpressed, Tom unimpressed, Amy happy, Grace happy |
| Tom | Dad, sit. We’re rotating. Amy’s up front with us. You’re on the bench. When somebody needs a break, wave, and tag in a friend. | Boppy unimpressed, Amy proud, TNB proud, Grace proud |
| Grace | A bench call. We have a bench. I have been waiting my whole life to say bench call. | Tom happy, Amy unimpressed, Rose happy, TNB happy |
| Rose | Can I raspberry the train? | Tom happy, Amy unimpressed, Grace happy, TNB happy |
| Tom | You may raspberry the train. | Rose proud, Grace happy, Amy unimpressed, TNB happy |

## scene: ch15Fight (chapter 15)

| Speaker | Line | Reactions |
|---|---|---|
| HUSH-9 | Shh. Again. Round two. | Tom unimpressed, Amy angry, Grace scared, Rose scared, TNB unimpressed |
| Amy | Slower. Chair or chatter. Tag in a friend if you need one. | Tom proud, Grace proud, Rose proud, TNB proud |
| Deedee | Up, up. Eat something. Sit a minute. Then we try again. | Tom happy, Amy happy, Grace happy, Rose happy, TNB happy, Boppy unimpressed |

## scene: ch15After (chapter 15)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The chip cracks right down the middle. HUSH-9 lowers its glove. For a moment the room is exactly as quiet as it wanted. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Rose | Somebody’s laughing. | Tom surprised, Amy surprised, Grace surprised, Deedee surprised, TNB surprised |
| Grace | It’s the TRAIN. | Tom surprised, Amy surprised, Rose happy, Deedee happy, TNB happy, Boppy surprised |
| HUSH-9 | I measured forty-one decibels. It was forty-one decibels of nobody leaving. | Tom loving, Amy loving, TNB loving, Grace loving, Rose loving, Deedee loving, Boppy unimpressed |
| Deedee | Scoot, Robert. The train needs a chair. | Boppy unimpressed, Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |
| Boppy | Why am I scooting? | Deedee unimpressed, Tom happy, Amy happy, Grace happy, Rose happy |
| Deedee | Because you’re the widest. | Boppy angry, Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |
| Boppy | My BACK is the widest. | Deedee unimpressed, Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |
| Deedee | Rhubarb crisp. Nine minutes. Eat. | Tom happy, Amy happy, TNB happy, Grace happy, Rose happy, Boppy unimpressed |
| HUSH-9 | I do not eat. | Deedee unimpressed, Tom happy, Grace happy, Rose surprised |
| Deedee | Everybody eats. | Tom happy, Amy happy, TNB happy, Grace happy, Rose happy, Boppy happy |
| HUSH-9 | ...It is warm. It is loud. It is... acceptable. | Deedee proud, Tom happy, Amy happy, TNB happy, Grace happy, Rose happy, Boppy unimpressed |
| HUSH-9 | The chip is broken. I cannot keep it quiet. I do not understand. It is very loud in here and nobody is sad. | Tom loving, Amy loving, TNB loving, Deedee loving, Grace happy, Rose happy |
| Amy | That’s the point of the loud. | Tom happy, TNB happy, Deedee happy, Grace happy, Rose happy |
| HUSH-9 | Mr. Vance asked me to deliver a message. “Thank you for dinner. Tomorrow, the Square. Bring everyone. I would like a family photograph.” | Tom unimpressed, Amy scared, TNB scared, Deedee scared, Boppy angry, Grace surprised, Rose surprised |
| Amy | That’s not a photograph. That’s a trap. | Tom proud, TNB scared, Deedee scared, Boppy angry, Grace scared |
| Tom | Of course it’s a trap. We’ll bring everyone anyway. And we’ll bring dessert. | Amy proud, TNB proud, Deedee proud, Boppy proud, Grace proud, Rose happy |
| Grace | I’m wearing the good scrunchie. | Tom happy, Amy unimpressed, Deedee happy, Rose happy |
| Rose | It left its chip! It plays a tiny dinner! Listen! | Tom happy, Amy happy, Grace happy, Deedee loving, TNB happy |
| Boppy | Deedee. Fifty-one years. | Deedee loving, Tom loving, Amy loving, TNB loving, Grace happy |
| Deedee | And counting, Robert. | Boppy loving, Tom loving, Amy loving, TNB loving, Grace happy, Rose happy |
| Boppy | Don’t make it weird. | Deedee happy, Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |

## scene: ch16Open (chapter 16)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The Square, the morning after the dinner. Six of us, two grandparents, and one very big camera on a tripod. | Amy scared, TNB scared, Deedee unimpressed, Boppy unimpressed |
| Grace | I wore the good scrunchie. I want that on the record. | Tom happy, Amy unimpressed, Rose happy, Deedee happy |
| Rose | I wore my ALSO scrunchie. | Tom happy, Grace unimpressed, Amy unimpressed, Deedee happy |
| Amy | Nobody touches anything. Hands to yourselves. If it looks like a trap, it is a trap. | Grace unimpressed, Rose unimpressed, Tom proud, TNB proud |
| Deedee | Is that the photographer? He looks like he hasn’t eaten. Robert, look how thin he is. | Boppy unimpressed, Tom unimpressed, Amy unimpressed, TNB happy |
| Boppy | A grown man in a grey suit on a Tuesday. That’s the whole problem right there. | Deedee unimpressed, Tom happy, Amy unimpressed, TNB happy, Grace happy |
| Marlowe | Wonderful. Everybody came. I love a turnout. | Tom angry, Amy angry, TNB unimpressed, Grace scared, Rose scared, Deedee unimpressed, Boppy angry, Nara angry |
| Marlowe | Marlowe. Monochrome Marlowe. We met in Jefferson Park. I took the pink out of your neighbor’s window. I’d say sorry, but honestly I think it looks better. | Tom angry, Amy angry, TNB unimpressed, Grace angry, Rose angry, Deedee unimpressed, Boppy angry |
| Tom | Where is he? | Marlowe unimpressed, Amy angry |
| Marlowe | Mr. Vance is in a meeting. He sends his regards, and a camera. | Tom angry, Amy angry, TNB unimpressed, Deedee unimpressed, Boppy angry |
| Grace | It’s a very big camera. | Tom unimpressed, Amy scared, Rose scared, TNB unimpressed |
| Rose | It’s looking at me. | Tom scared, Amy scared, Grace scared, Deedee scared, Boppy angry |
| Marlowe | That’s what cameras do. Little ones in front, please. Tall ones in back. Everybody tight. Mr. Vance likes everybody tight. | Tom unimpressed, Amy angry, TNB unimpressed, Grace scared, Rose scared, Deedee unimpressed, Boppy angry |
| TNB | I took a portrait class once. This is a terrible setup. The light is coming from inside the camera. | Tom happy, Marlowe unimpressed, Amy unimpressed |
| Deedee | Is it going to take long? I have a roast in. Robert. Stand up straight. | Boppy angry, Tom unimpressed, Amy unimpressed, Marlowe unimpressed |
| Boppy | I AM standing up straight. This is as straight as I go. | Deedee unimpressed, Tom happy, Grace happy, Rose happy |
| Tom | Marlowe. What is the photograph for? | Marlowe proud, Amy scared, TNB scared |
| Marlowe | Mr. Vance keeps the happy ones. A good family at the right moment, just so. Nothing ever changes again. Nobody leaves. It’s a gift. | Tom angry, Amy angry, TNB angry, Grace scared, Rose scared, Deedee scared, Boppy angry |
| TNB | Nobody asked for the gift. | Tom proud, Marlowe unimpressed, Amy proud |
| Tom | We said we’d bring everyone. We didn’t say we’d stay. | Marlowe unimpressed, Amy proud, TNB proud, Boppy proud |
| Marlowe | Everybody stays in a photograph. That’s what a photograph is. | Tom angry, Amy scared, TNB scared, Grace scared, Rose scared, Deedee scared, Boppy angry |
| Vance | Hello, Tom. Thank you for flying nowhere. I have waited a very long time for a picture where nobody leaves. | Tom angry, Amy scared, TNB scared, Grace scared, Rose scared, Deedee scared, Boppy angry, Nara angry, Marlowe scared |
| Boppy | That’s the voice. That’s the fella with the deal. | Tom angry, Amy angry, Deedee scared, Vance unimpressed |
| Vance | Hello, Robert. You broke our contract. That’s all right. I am a forgiving man. Everybody, please look here. | Boppy angry, Tom angry, Amy scared, Deedee scared, Grace scared, Rose scared, TNB scared |
| Grace | I’m doing my photo face. | Tom scared, Amy scared, Deedee scared, Boppy scared, TNB scared |
| Rose | I’m doing my ALSO face. | Tom scared, Amy scared, Deedee scared, Boppy scared, TNB scared |
| Tom | Amy. | Amy scared, TNB scared, Deedee scared, Boppy scared |
| Amy | I know. Girls, down. Behind me. NOW. | Grace scared, Rose scared, Tom scared, Deedee scared, Boppy scared, TNB scared |
| Vance | Not Tom. Not the grown ones. The little ones. The ones with all their years still in them. Those are the ones I want to keep. | Tom angry, Amy angry, TNB angry, Grace scared, Rose scared, Deedee scared, Boppy angry, Nara angry, Marlowe scared |
| Tom | No. | Amy proud, TNB proud, Deedee proud, Boppy proud, Grace scared, Rose scared |
| Deedee | Robert. | Boppy loving, Tom scared, Amy scared |
| Boppy | I know. | Deedee loving, Tom scared, Amy scared |
| Deedee | Girls. Close your eyes. Moon and back. | Grace scared, Rose scared, Tom scared, Amy scared, TNB scared, Boppy loving |
| Boppy | Nobody gets past us. | Deedee loving, Tom scared, Amy scared, TNB scared, Grace scared, Rose scared |
| Tom | Mom! Dad! | Amy scared, TNB scared, Grace scared, Rose scared |
| Deedee | Fifty-one years. | Boppy loving, Tom sad, Amy sad, TNB sad, Grace scared, Rose scared |
| Boppy | ...And counting. | Deedee loving, Tom sad, Amy sad, TNB sad, Grace scared, Rose scared |
| Rose | Deedee? | Tom sad, Amy sad, TNB sad, Grace sad |
| Grace | Boppy. You can move now. | Tom sad, Amy sad, TNB sad, Rose sad |
| Amy | Mom. | Tom sad, TNB sad, Grace sad, Rose sad |
| Tom | Nobody moves. Nobody says anything. In the middle of the Square two stone figures hold each other up, and a small amber light crawls along their joined hands. | Amy sad, TNB sad, Grace sad, Rose sad, Nara sad, Marlowe scared |
| Vance | There. That is a family photograph. Thank you, Tom. You may keep the frame. | Tom angry, Amy angry, TNB angry, Grace sad, Rose sad, Marlowe scared |
| Tom | Where are you? | Amy angry, TNB angry, Grace sad, Rose sad |
| Vance | Marlowe. Collect the children. | Tom angry, Amy angry, TNB angry, Grace scared, Rose scared, Marlowe scared |
| Marlowe | Mr. Vance. They are... they are children. I only moved the colors around. That’s all I ever did. I never wrote anything like that. | Tom surprised, Amy surprised, TNB surprised, Grace scared, Rose scared |
| Vance | Then I shall help with your notes. | Marlowe scared, Tom scared, Amy scared, TNB scared, Grace scared, Rose scared |
| Marlowe | Less. Less. Less. That is all I ever wanted. Less. | Tom scared, Amy scared, TNB scared, Grace scared, Rose scared, Nara angry |
| Tom | Grace. Rose. Go. Cab seven. Find Sal. Now. | Grace scared, Rose scared, Amy proud, TNB proud |
| Grace | But Deedee... | Tom sad, Amy sad, Rose sad, TNB sad |
| Tom | I know. Go. Please, Grace. | Grace sad, Rose sad, Amy sad, TNB sad |
| Grace | Rose. Hand. Run. Now. | Rose scared, Tom proud, Amy proud |
| Rose | But Boppy... | Grace sad, Tom sad, Amy sad |
| Grace | I KNOW. RUN. | Rose scared, Tom sad, Amy sad, TNB sad |
| Amy | Tom. Whatever this is, it is between them and the road. | Tom proud, TNB proud, Nara proud |
| Tom | Then it doesn’t get past us. Dad said so. | Amy proud, TNB proud, Nara proud |
| TNB | I’m here, babe. | Tom loving, Amy proud |
| Nara | Nara plants her feet in the grass and growls at a grey man with a sun behind his head. | Tom proud, Amy proud, TNB proud |

## scene: ch16Fight (chapter 16)

| Speaker | Line | Reactions |
|---|---|---|
| Marlowe | Less. Round two. | Tom proud, Amy proud, TNB proud, Nara angry |
| Amy | Slow down. Break the eclipse and heal after the flash. Together. | Tom proud, TNB proud, Nara proud |
| Amy | Up. Up. We are not done. Breathe. Then we go again. | Tom proud, TNB proud, Nara proud |

## scene: ch16After (chapter 16)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The amber goes out of him all at once. Nobody cheers. There is no song. There is only the wind going through the Square. | Amy sad, TNB sad, Nara sad, Marlowe sad |
| Marlowe | I wanted it quieter. I only ever wanted it quieter. | Tom sad, Amy angry, TNB sad |
| Amy | Look at them. LOOK. | Marlowe sad, Tom sad, TNB sad |
| Marlowe | I didn’t want it like this. | Tom sad, Amy sad, TNB sad |
| Tom | Nobody does. That is what he counts on. | Marlowe sad, Amy sad, TNB sad |
| Tom | Mom. Dad. | Amy sad, TNB sad, Nara sad |
| Tom | It’s warm. Amy. It’s still a little warm. | Amy surprised, TNB loving |
| Amy | Then they’re not gone. | Tom proud, TNB proud |
| Tom | They’re not gone. | Amy loving, TNB loving, Nara loving |
| Amy | Then we get them back. | Tom proud, TNB proud, Nara proud |
| Vance | Thank you for the photograph. It is perfect. I would like to keep it. | Tom angry, Amy angry, TNB angry, Nara angry |
| Tom | Give them back. | Amy angry, TNB angry |
| Vance | Nobody leaves, Tom. That is what a photograph is for. If you want them, you know the building. Downtown. Sixty floors. Do come up. I will leave the light on. | Tom angry, Amy angry, TNB angry, Nara angry |
| Sal | TOMMY! The glass is coming down! I have the girls in the cab! GET IN! | Tom surprised, Amy surprised, TNB surprised, Nara scared |
| Tom | Amy. TNB. Nara. Run. | Amy proud, TNB proud, Nara proud |
| Tom | Dad. Keep her warm. I’m coming back. | Amy sad, TNB sad |
| Tom | Sal took the Sub-Rail the long way, with the meter off. Nobody has said anything since the tunnel. | Amy sad, TNB sad, Grace sad, Rose sad |
| Rose | Tata. Are they cold? | Tom loving, Amy sad, TNB sad, Grace sad |
| Tom | No, Rose. They’re warm. I checked. | Rose loving, Amy loving, TNB loving, Grace loving |
| Rose | Okay. | Tom loving, Amy loving, TNB loving, Grace loving |
| Grace | Then it’s not forever. It’s just a long time. | Tom loving, Amy loving, TNB loving, Rose happy |
| Tom | It’s just a long time. | Grace loving, Rose loving, Amy loving, TNB loving |
| Amy | Vance said downtown. Sixty floors. We rest tonight. Tomorrow we go up. | Tom proud, TNB proud, Grace proud, Rose proud |

## scene: ch17Open (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Downtown. The tallest thing on the boulevard that wasn’t there on Monday. Sixty floors of glass, and every clock in it says 4:59. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Amy | That’s the building. That’s where he is. | Tom proud, TNB proud, Grace scared, Rose scared |
| Grace | We’re coming. All of us. I already told Rose. She’s packing. | Amy scared, Tom unimpressed, TNB happy |
| Rose | I packed a pretzel. And a second pretzel, for Deedee. | Tom loving, Amy loving, TNB loving, Grace happy |
| Amy | Girls. It is sixty floors. It is going to be hard and strange and not fair. | Grace proud, Rose proud, Tom sad, TNB sad |
| Grace | We know. That’s why we’re coming. | Amy loving, Tom loving, TNB loving, Rose proud |
| Tom | Okay. Here’s how we do it. Two teams of three. Grace, Rose and me take the stairs. Amy, TNB and Nara work the Archive on thirty. | Amy proud, TNB proud, Grace proud, Rose proud, Nara proud |
| TNB | Divide and conquer. I like it. I also like not being on the stairs. | Tom happy, Amy unimpressed, Grace happy |
| Nara | Nara does not like stairs. Nara is, however, extremely good at breaking glass. | Tom happy, TNB happy, Amy happy, Grace happy, Rose happy |
| Amy | And I get to hit something. Good. | Tom unimpressed, TNB happy, Grace happy |
| Sol | I’ll keep the meter off and the engine on. Go get your folks, Tommy. | Tom loving, Amy loving, TNB happy |
| Tom | The tower goes up past the top of the screen. The doors at the bottom are glass, and they are glowing like a lit window at dinnertime. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Rose | It’s so tall. Tata, it’s TALLER than the Starlite. | Tom happy, Amy happy, Grace unimpressed |

## scene: ch17Lobby (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The lobby is all glass and no people. Every clock says 4:59. The second hands are shaking in place, like they are trying very hard. | Grace surprised, Rose surprised |
| Grace | It’s so clean. Nobody lives here. Nobody even touched the floor. | Tom unimpressed, Rose surprised |
| Rose | There’s a plant. It looks scared. | Tom happy, Grace unimpressed |
| Tom | Floor directory says the stairs are on the east side. Twenty-eight flights. | Grace surprised, Rose surprised |
| Grace | Twenty-eight? That’s a leg day AND an arm day. | Tom happy, Rose happy |
| Tom | The lifts are locked. We take the stairs to thirty. Amy, TNB and Nara meet us up there. | Grace proud, Rose proud |

## scene: ch17Landing (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Landing thirty. A huge glass door with a gold lock the size of a dinner plate. The counter over it says LOCKS ENGAGED 6 OF 6. | Grace surprised, Rose surprised |
| Grace | Six locks. Six of something. I don’t like that. | Tom unimpressed, Rose scared |
| Amy | Tom, this is Amy. We’re in the service ducts. I can hear glass. A lot of glass. There’s a little hatch on your landing, it should open on the Archive. | Tom surprised, Grace surprised, Rose surprised |
| Tom | Found it. Staff only. Somebody wrote HE IS OBVIOUSLY STAFF under it. | Grace happy, Rose happy |
| Amy | That’s TNB’s handwriting. Go through. Girls hold the landing. | Tom happy, Grace proud, Rose proud |
| Rose | Holding the landing! Holding it! Holding! | Tom happy, Grace unimpressed |

## scene: ch17CrossOps (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The Archive. A long hall of glass shelves, and on every shelf a whole tiny town under a dome, each one paused on its happiest afternoon. | Amy surprised, TNB surprised, Nara surprised |
| Amy | Tom. Look at the plaque. Look at the little man with the pierogi. | Tom sad, TNB sad |
| TNB | That’s a very good diorama. I hate it. It’s very well made. | Tom happy, Amy unimpressed |
| Nara | Nara sniffs a shelf. It does not smell like anything. It does not smell like anything at all. | Tom sad, Amy sad, TNB sad |
| Amy | Six towns. Six shelves. The lock counter on the stairs says six. I do not think that is a coincidence. | Tom surprised, TNB surprised |
| Tom | Smash them. Gently, I mean. Free the towns. | Amy proud, TNB happy, Nara proud |
| Amy | Gently is not a word I use. | Tom unimpressed, TNB happy |

## scene: ch17Locks (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Archivist | Attention. A collection has been disturbed. Six exhibits are no longer on file. | Tom unimpressed, Amy angry, TNB surprised, Nara angry |
| Archivist | This is unfortunate. This is not a problem. The Archivist is not unkind. The Archivist is only thorough. | Tom unimpressed, Amy unimpressed, TNB unimpressed |
| Archivist | Floors 2 to 30 are now unlocked for your convenience. The express lift has been withdrawn. Please use the stairs. All of them. The Archivist will be waiting at the top. | Tom unimpressed, Amy surprised, TNB unimpressed |
| Amy | Withdrawn. The lift has been WITHDRAWN. Tom. Did he just challenge me to a stair race? | Tom unimpressed, TNB happy |
| Tom | I don’t think he knows what he just did. | Amy proud, TNB happy |

## scene: ch17Race (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The seal door swings open on its own. The stairwell goes on. Twenty-nine more floors, straight up, in a glass tube. | Amy proud, TNB unimpressed, Grace surprised, Rose surprised |
| Amy | You and me. Landing to landing. Loser buys dinner. | Tom unimpressed, Grace happy, Rose happy, TNB happy |
| Tom | Amy, we have a deadline. We have a tower. We have two grandparents made of stone. | Amy unimpressed, TNB happy, Grace unimpressed |
| Amy | Which is why I am going to win this. | Tom unimpressed, Grace happy, Rose happy, TNB happy |
| Grace | I am calling it. On my mark. Mark! | Tom unimpressed, Amy proud, Rose happy |
| Rose | I’m the finish line! | Tom happy, Amy proud, Grace happy, TNB happy |
| TNB | I am not running. I am carrying the thermos. Somebody has to. | Tom happy, Amy unimpressed, Grace happy |
| Tom | Floor fifty-nine. We hit the vault door at exactly the same time. Amy’s forehead and mine, a quarter inch apart. | Amy angry, TNB happy, Grace surprised, Rose happy |
| Amy | That was MINE. | Tom unimpressed, TNB happy, Grace happy, Rose happy |
| Tom | It was a tie. | Amy angry, TNB happy, Grace happy |
| Amy | Tie means nobody won. Tie means I lost. Rematch. Later. After. | Tom happy, TNB happy, Grace happy, Rose happy |
| Tom | After. | Amy proud, TNB loving |

## scene: ch17Vault (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The Vault. One plinth, one snow globe, and a view of Los Angeles at 4:59 PM, golden and perfect and completely still. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Rose | Tata. It’s the Square. It’s in there. That’s Deedee. That’s BOPPY. | Tom sad, Amy sad, TNB sad, Grace sad |
| Grace | They’re so small. They’re okay. They’re holding hands. | Tom loving, Amy loving, TNB loving, Rose loving |
| Tom | Stay behind me. All of you. | Amy proud, TNB proud, Grace scared, Rose scared |
| Archivist | Thank you for the six exhibits. The collection is, for the first time, incomplete. I find that I do not like it. | Tom unimpressed, Amy angry, TNB unimpressed, Grace scared, Rose scared, Nara angry |
| Tom | You’re the Archivist. | Amy angry, TNB unimpressed, Grace scared, Rose scared |
| Archivist | I am what Mr. Vance keeps when he wants a thing never to change. I file. I label. I hold. It is all I was made to do. It is a very good job. | Tom unimpressed, Amy angry, TNB sad, Grace scared, Rose surprised |
| Amy | You froze the pierogi man for thirty years. | Tom sad, TNB sad, Grace sad |
| Archivist | Thirty-one. He was very happy. I made sure of it. | Tom sad, Amy angry, TNB sad, Grace sad, Rose sad |
| TNB | That is the single saddest thing I have ever heard a lens say. | Tom sad, Amy unimpressed, Grace sad |
| Archivist | Please hold still. This will not hurt. Nothing will, ever again. | Tom proud, Amy angry, TNB scared, Grace scared, Rose scared, Nara angry |

## scene: ch17Fight (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Up. Everyone up. We have a lens to break. Breathe. Then we go again. | Tom proud, TNB proud, Grace proud, Rose proud |

## scene: ch17After (chapter 17)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The amber lens cracks across the middle. The cold one goes dark. For one second, the whole building holds its breath. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |
| Archivist | I was only... keeping them safe. | Tom loving, Amy sad, TNB sad, Grace sad, Rose sad |
| Tom | I know. They were never yours to keep. | Amy proud, TNB loving, Grace sad |
| Archivist | What does one do... with a day that is allowed to end? | Tom loving, Amy loving, TNB loving, Grace surprised, Rose surprised |
| Rose | You eat dinner. Then you go to sleep. Then it’s morning. | Tom loving, Amy loving, TNB loving, Grace happy |
| Archivist | That sounds... sufficient. | Tom happy, Amy happy, TNB happy, Grace happy, Rose proud |
| Grace | Tata. The globe. | Tom surprised, Amy surprised, TNB surprised, Rose surprised |
| Tom | The snow globe on the plinth lifts an inch off the glass. The gold cable above it goes tight. It is going up. | Amy scared, TNB scared, Grace scared, Rose scared |
| Vance | Thank you for the tour, Tom. Thank you for the Archive. It was very nearly complete. | Tom angry, Amy angry, TNB angry, Grace scared, Rose scared, Nara angry |
| Vance | Floor sixty is for family. Come up when you are ready. I have kept your parents very warm. | Tom angry, Amy angry, TNB angry, Grace scared, Rose scared |
| Amy | Mom. Dad. We are coming. We’re coming. | Tom sad, TNB loving, Grace sad, Rose sad |
| Tom | Everybody breathe. We rest. Then we go to the top. | Amy proud, TNB proud, Grace proud, Rose proud |
| Tom | A gold lift door stands open at the north wall. No call button. A brass plate: FLOOR 60. BY INVITATION. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |

## scene: ch18Open (chapter 18)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The pinnacle lift opens without a sound. There is no button inside, no floor number. The walls are mirrors, and every one of us is in them. | Amy surprised, TNB surprised, Grace scared, Rose surprised |
| Amy | Everybody in. Nobody lags behind. Nobody gets left on this floor. | Tom proud, TNB proud, Grace scared, Rose happy |
| Grace | Tata. I’m scared. I’m also coming. Both of those are true at the same time. | Tom loving, Amy loving, TNB loving, Rose happy |
| Tom | That is exactly the right amount of both. | Grace proud, Amy loving, TNB loving |
| Rose | I brought a pretzel for Deedee. It’s a little bit squished. | Tom loving, Amy loving, TNB loving, Grace happy |
| TNB | Squished is fine. I fix squished things for a living. | Rose happy, Tom loving, Amy happy |
| Tom | Stay behind me. All of you. | Amy proud, TNB proud, Grace scared, Rose scared |

## scene: ch18Pinnacle (chapter 18)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The lift opens on a round room made of clock. Gold thread runs floor to ceiling, thousands of strands, humming. In the middle stands a loom the size of a house. In front of it, a man in a long coat has his back to us. His hat is on. | Amy scared, TNB surprised, Grace scared, Rose surprised, Nara angry |
| Vance | Tom. Thank you for coming. Everyone, please, come in. Mind the threads. They are all somebody’s afternoon. | Tom angry, Amy angry, TNB unimpressed, Grace scared, Rose scared, Nara angry |
| Amy | Where are my parents. | Vance unimpressed, Tom angry, TNB angry |
| Vance | Warm. Downstairs, on a plinth, under glass. Exactly as you left them. I want you to understand I have taken very good care of them. | Tom angry, Amy angry, TNB angry, Grace scared, Rose scared |
| Grace | They’re STONE. | Vance unimpressed, Tom sad, Amy angry |
| Vance | They are safe. There is a difference. I had to have it explained to me, too. | Tom angry, Amy angry, TNB unimpressed, Grace angry, Rose surprised |
| Rose | Are you the man who took all the coins? | Vance unimpressed, Tom proud, Amy scared |
| Vance | I am the man who kept them. Gold remembers being warm. I only wanted it to keep remembering. | Tom unimpressed, Amy angry, TNB unimpressed, Grace angry |
| TNB | Okay. I fix things for a living. Whatever this is, it is structurally unsound. | Vance unimpressed, Tom happy, Amy proud |
| Vance | Nothing is the same twice, Mr. TNB. You mend a cup, and it is a mended cup. I would like every cup to stay unbroken. | TNB unimpressed, Tom unimpressed, Amy angry |
| Tom | That is not how cups work. | TNB loving, Amy proud |
| Vance | Tom. You know why I wanted you. Two places that kept moving, and one man flying between them. You are not a traveler. You are the thread. If you stop, they stop. If you stay, they stay. | Amy scared, TNB scared, Grace scared, Rose scared |
| Vance | I will not hurt you. I will not hurt anyone. I will only finish the afternoon. | Tom unimpressed, Amy angry, TNB scared, Grace scared, Rose scared, Nara angry |
| Tom | No, thank you. We have a connection to make. | Amy proud, TNB proud, Grace proud, Rose proud |
| Vance | I know. That is why this is so hard. | Tom unimpressed, Amy scared, TNB scared, Grace scared, Rose scared |
| Tom | The threads of the Loom lean. All of them, all at once, like a field in the wind. They gather into the brass lens at the end of his arm. | Amy scared, TNB scared, Grace scared, Rose scared, Nara scared |
| Vance | The Ray unwrites whatever it touches. It is very gentle. They will not remember being sad. Mrs. Gregori. Mr. TNB. Grace. Rose. Hold hands, please. | Tom angry, Amy angry, TNB scared, Grace scared, Rose scared, Nara angry |
| Amy | Over my dead body. | Tom proud, TNB proud, Grace scared, Rose scared |
| Vance | That will not be necessary. That is not even on the table. | Amy angry, Tom angry, TNB angry |
| Grace | Tata. | Tom loving, Amy scared, TNB scared, Rose scared |
| Tom | Girls. Amy. TNB. Nara. Behind me. | Amy scared, TNB scared, Grace scared, Rose scared, Nara scared |
| Nara | Nara presses herself against the back of Tom’s legs and does not make a sound. She is very good at this. | Tom loving, Amy scared, TNB scared, Grace scared, Rose scared |
| Tom | He adjusts his glasses. He has done it before every hard thing, his whole life. Then he raises one hand, palm out, and takes one step forward. | Amy scared, TNB scared, Grace scared, Rose scared, Vance surprised |
| Tom | No touching, please. | Amy scared, TNB scared, Grace scared, Rose scared, Vance surprised |

## scene: ch18After (chapter 18)

| Speaker | Line | Reactions |
|---|---|---|
| Floor 60 | Where Tom was standing, there is a small warm light, hanging in the air at about the height of his glasses. Then there is not. | Amy scared, TNB scared, Grace scared, Rose scared, Nara sad, Vance surprised |
| Rose | Tata? | Amy sad, TNB sad, Grace scared |
| Grace | Tata. TATA. | Amy sad, TNB sad, Rose scared |
| Rose | He was right there. He was RIGHT there. | Amy sad, TNB sad, Grace sad |
| Nara | Nara walks to the exact spot where Tom was standing, lies down on it, and does not move. | Amy sad, TNB sad, Grace sad, Rose sad |
| Amy | Tom. Tom, answer me. I am not doing this. I am not doing this. | TNB sad, Grace sad, Rose sad |
| TNB | Tom. | Amy sad, Grace sad, Rose sad, Nara sad |
| Vance | That was not in the model. | Amy angry, TNB sad, Grace sad, Rose sad |
| Vance | The Ray was written for five. He took all of it. I did not think anyone would step into it. I have never once seen anyone step into it. | Amy angry, TNB sad, Grace sad, Rose sad |
| Amy | Give him back. | Vance sad, TNB sad |
| Vance | I cannot. The Loom does not hand back. I only know how it keeps. | Amy angry, TNB sad, Grace sad, Rose sad |
| Vance | He is not destroyed. The Ray unwrites the story of a thing. Somewhere he is still a man with a thermos. The Loom simply does not have a place to put him. | Amy angry, TNB sad, Grace sad, Rose sad |
| Floor 60 | The Loom shudders. Every thread in it goes white. The Ray has nowhere left to go, and a wave of light rolls out from the place Tom stood. | Amy scared, TNB scared, Grace scared, Rose scared, Nara scared, Vance scared |
| Vance | It will take you home. It goes where he is from. Hold on to something. | Amy angry, TNB scared, Grace scared, Rose scared |
| Amy | We are not leaving without him! | TNB sad, Grace scared, Rose scared, Vance sad |
| Vance | You are not leaving. You are being sent. That is a different thing. | Amy angry, TNB sad, Grace scared, Rose scared |
| TNB | Okay. We are on Second Avenue. It is morning. It is somehow morning. | Amy surprised, Grace surprised, Rose surprised, Nara surprised |
| Rose | Is Tata coming? | Amy sad, TNB sad, Grace sad |
| Grace | He said we always make our connection. So he will. | Amy loving, TNB loving, Rose happy |
| Amy | I know my brother. He is going to turn up late, a little annoyed, with a full explanation, and ask if anybody ate. | TNB loving, Grace happy, Rose happy |
| TNB | His thermos is on the porch rail. He left it out for the cat. | Amy sad, Grace sad, Rose surprised |
| Rose | Is the cat going to be okay? | Amy loving, TNB loving, Grace unimpressed |
| TNB | The cat is fine. The cat is always fine. The cat is not even his. | Amy happy, Grace happy, Rose happy |
| Nara | Nara sits down on Tom’s porch step, facing the street, and waits. | Amy sad, TNB sad, Grace sad, Rose sad |
| Amy | Okay. Okay. Plan. Mom and Dad are stone. Tom is somewhere. And there is exactly one thing in this city that does not forget where things go. | TNB sad, Grace proud, Rose sad |
| Grace | The post office. | Amy proud, TNB surprised, Rose surprised |
| TNB | I’ll make coffee first. Tom would want me to make coffee first. | Amy loving, Grace sad, Rose sad |

## scene: ch19Keep (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Dead-Letter Office | Far off, in the hub, a brass bell rings by itself. Four lights are on at the Claim Desk. It is time. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |

## scene: ch19Open (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | It has been eleven hours. I have made coffee four times. I have not drunk any of it. That is not like me. | Amy sad, Grace sad, Rose sad |
| Amy | Plan. Mom and Dad are stone. Tom is somewhere the Loom does not have a place for. And there is one place in this city that keeps everything nobody could put anywhere. | TNB sad, Grace proud, Rose sad |
| Grace | The post office. We already said that. | Amy unimpressed, TNB happy |
| Rose | Nara found it first. | Amy loving, TNB loving, Nara proud |
| Nara | Nara is sitting very straight in front of Tom’s mailbox, and she is staring into the slot. She has not blinked. A thin gold light is coming out of the slot, like a sleeping lamp. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| TNB | That is not a regular mailbox. That is a mailbox that is thinking about something. | Amy surprised, Grace surprised, Rose surprised |
| Amy | It’s his. It’s the mailbox at the bottom of his steps, where his bills and my birthday cards go. It’s warm. | TNB loving, Grace sad, Rose sad |
| Grace | If you drop a letter in a mailbox and it goes nowhere... where does it go? | Amy surprised, TNB surprised, Rose surprised |
| TNB | Down. I think it goes down. | Amy scared, Grace surprised, Rose surprised |

## scene: ch19Hub (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Whoa. It’s a post office for things that don’t have anywhere to go. | Amy surprised, TNB surprised, Grace surprised |
| TNB | Dead letters. Every undelivered thing in the city ends up under it. Birthday cards. Thank-you notes. One pretzel. | Amy sad, Grace sad, Rose surprised |
| Grace | That’s MY pretzel. I mean Rose’s. Rose’s pretzel. For Deedee. | Rose unimpressed, Amy happy, TNB happy |
| Amy | Look at the big ledger. There’s a page for Second Avenue. There’s a blank rectangle where a name should be. | TNB sad, Grace sad, Rose sad |
| TNB | It’s still wet. Somebody erased him and left the space, like they were going to write somebody else in. | Amy sad, Grace sad, Rose sad |
| Grace | Four doors. One for each of us. | Amy proud, TNB proud, Rose surprised |
| TNB | People who would not forget him. That’s the whole job description. | Amy loving, Grace proud, Rose proud |
| Amy | The desk in the middle has four little brass niches in the front. Four of us, four niches. And a chair that someone just stood up out of. | TNB surprised, Grace surprised, Rose surprised |
| Rose | There’s a thermos on it. | Amy surprised, TNB surprised, Grace surprised |
| TNB | That’s his. I would know that thermos in the dark. | Amy loving, Grace loving, Rose loving, Nara loving |

## scene: ch19Claim (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Dead-Letter Office | Four keepsakes glow in four brass niches. The bell sits on the counter. Rose reaches up, stands on her tiptoes, and rings it. | Amy proud, TNB proud, Grace proud |
| Oblivion Censor | Good evening. The Office is closed. May I help you? You look lost, which is the right way to look in here. | Amy unimpressed, TNB unimpressed, Grace scared, Rose scared, Nara angry |
| TNB | We’re here for a name. A man named Tom, on Second Avenue. | Amy proud, Grace proud, Rose proud |
| Oblivion Censor | I have one clean line on a page. I have a name that is too loud for it. I was tidying. It is not personal. I tidy everything that does not fit. | Amy angry, TNB angry, Grace angry, Rose scared |
| Amy | He is my brother. | TNB loving, Grace proud, Rose proud |
| Oblivion Censor | I am sure he is lovely. He is also unclaimed. Everything here is. That is the best a thing can be, Mrs. Gregori: safe and unclaimed. | Amy angry, TNB angry, Grace angry, Rose scared |
| Grace | You can’t erase somebody because he doesn’t fit your form. | Amy proud, TNB proud, Rose proud |
| Oblivion Censor | It is the only thing I am for. No one has ever handed me a letter to deliver. They only hand me returns. | Amy sad, TNB sad, Grace sad, Rose sad |
| Rose | That’s the saddest job in the world. | Amy sad, TNB sad, Grace sad |
| Oblivion Censor | It is a very tidy job. | Amy unimpressed, TNB sad, Grace unimpressed, Rose sad |
| Oblivion Censor | Please step back from the desk. I will write the name out. | Amy angry, TNB angry, Grace angry, Rose scared, Nara angry |

## scene: ch19Fight (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Up. Everybody up. Breathe. We can do this again. It’s a pottery rule: the first one always cracks. | Amy proud, Grace proud, Rose proud, Nara proud |

## scene: ch19After (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Oblivion Censor | The Censor lowers his stamp. The black bar over his face slides to the side, a little at a time, and under it is only a small tired man with ink on his cuffs. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Oblivion Censor | I have never been argued with by so many people at once. It was... full. | Amy loving, TNB loving, Grace loving, Rose loving |
| Tom | Sorry I was late. I was written out of the schedule. I’ll sort it out with accounting. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |
| Rose | TATA! | Tom loving, Grace happy, Amy happy, TNB loving |
| Grace | TATA! | Tom loving, Rose happy, Amy happy, TNB loving |
| Tom | Hello. Hello. Yes. Careful of the glasses. The glasses have been through a lot. | Grace happy, Rose happy, Amy loving, TNB loving |
| Amy | You absolute marshmallow. You were GONE. You ate nothing. You skipped lunch for a whole afternoon, and then a night. | Tom scared, Grace happy, Rose happy, TNB loving |
| Tom | I had a granola bar. It was written out too. I haven’t felt this hungry since the nineties. | Amy unimpressed, TNB loving, Grace happy, Rose happy |
| TNB | Hey. | Tom loving, Amy happy, Grace happy |
| Tom | Hey. | TNB loving, Amy happy, Grace happy, Rose happy |
| Nara | Nara arrives at about a hundred miles an hour and climbs directly onto Tom. Nobody tries to stop her. | Tom loving, Amy happy, TNB happy, Grace happy, Rose happy |
| Tom | I know. I know. I missed you too. I was a small gold light and I missed you the whole time. | Nara loving, Amy loving, TNB loving, Grace loving, Rose loving |
| Tom | He turns to the Censor, who is looking at the floor. | Amy surprised, TNB surprised, Grace surprised, Rose surprised |
| Tom | You have never delivered anything. | Amy surprised, TNB surprised, Grace surprised |
| Oblivion Censor | No. | Amy sad, TNB sad, Grace sad, Rose sad |
| Tom | Rose. | Rose proud, Amy surprised, TNB happy |
| Rose | Here. It’s a little bit squished. It’s for Deedee. It was held for pickup, but nobody picked it up, because she’s stone. | Tom loving, Amy loving, TNB loving, Grace loving |
| Tom | It is a first-timer’s route. One pretzel. One tower. Fifty-nine floors up, and then a grandmother. | Amy happy, TNB happy, Grace happy, Rose proud |
| Oblivion Censor | I do not... I have never left the Office. | Tom loving, Amy loving, TNB loving, Grace loving, Rose happy |
| Tom | The route is not far. The job is only to put a thing in someone’s hands. You are already very good at the part where you carry it. | Amy loving, TNB loving, Grace loving, Rose proud |
| Oblivion Censor | The Censor takes the pretzel in both hands, carefully, as if it were made of glass. Then he lifts his stamp, looks at it, and brings it down on the napkin. It does not say RETURN TO SENDER. It says DELIVERED. | Tom loving, Amy loving, TNB loving, Grace surprised, Rose surprised |
| Oblivion Censor | It is a nicer word to hold than I expected. | Tom loving, Amy loving, TNB loving, Grace loving, Rose loving |
| Dead-Letter Office | In the big ledger, the clean white rectangle fills itself in, one slow letter at a time. T. O. M. The ink is the exact blue of a thermos cap. | Tom happy, Amy loving, TNB loving, Grace happy, Rose happy, Nara happy |
| Amy | Okay. Home. Food. Then Mom and Dad. In that order. | Tom happy, TNB happy, Grace happy, Rose happy |
| Tom | In that order. | Amy happy, TNB loving, Grace happy, Rose happy |

## scene: ch19Feast (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Stone does not respond to talking. I have checked. Stone responds to being warm for a long time with people nearby. | Amy unimpressed, TNB happy, Grace happy |
| Amy | Mom’s rule: a house is warm when somebody is cooking in it. | Tom loving, TNB loving, Grace proud, Rose happy |
| Grace | So we cook. | Tom proud, Amy proud, TNB happy, Rose happy |
| Rose | A lot. We cook a LOT. | Tom happy, Amy happy, TNB happy, Grace happy |
| Olivia | Tom! You’re BACK. I saw the light on at four a.m. and I thought, he’s home, and then I thought, no, that’s a different kind of light. I made a lasagna. | Tom loving, Amy happy, TNB happy, Grace happy, Rose happy, Nara happy |
| Michael | I brought a rock. Lachlan picked it out. Isla ate a different rock. We are keeping a close eye on it. | Tom unimpressed, Amy happy, TNB happy, Grace happy, Rose surprised, Olivia unimpressed |
| Tom | Thank you. All of you. I will put the rock on the mantel. | Olivia loving, Amy happy, TNB happy |
| Mrs. Alvarez | I heard there was a situation. I brought lemon bars. And peppers. My nephew grows them. They are very hot. A man called Boppy would know what to do. | Tom loving, Amy happy, TNB happy, Grace happy, Rose surprised |
| Grace | Boppy would eat one raw and say it was “fine” in a voice. | Tom happy, Amy happy, TNB happy, Rose happy |
| Tom | The kitchen is a mess. Every pot is in use. The window is fogged. It smells like a Sunday. | Amy happy, TNB happy, Grace happy, Rose happy |
| TNB | The oven door handle came off. I fixed it. You could say I handled it. | Tom unimpressed, Amy unimpressed, Grace happy, Rose happy |
| Tom | Please stop. | TNB happy, Amy happy, Grace happy |
| Amy | Lasagna, eleven minutes. Lemon bars, six. I have a timer on everything. Nobody is allowed to be late for this. | Tom happy, TNB happy, Grace proud, Rose happy |
| Grace | I choreographed the pasta. It goes from the pot to the plate in a very specific arc. | Tom unimpressed, Amy unimpressed, TNB happy |
| Rose | I am the taster. I have tasted nine times. It’s for quality. | Tom happy, Amy unimpressed, TNB happy, Grace unimpressed |
| Tom | The pasta does not go in an arc. | Grace proud, Rose happy, TNB happy |
| Grace | It goes in an arc if you believe in it, Tata. | Tom loving, Amy happy, TNB happy, Rose happy |
| Tom | He looks at the table. Everyone he loves is crowded around it, and somebody has put a rock in the middle like a centerpiece. He doesn’t say anything for a second. | Amy loving, TNB loving, Grace loving, Rose loving |
| Tom | Pack it up. Sal is waiting outside with cab seven. We are going to the Glass Tower, and we are bringing dinner. | Amy proud, TNB proud, Grace proud, Rose proud |
| Sal | Cab seven! Everybody in. Bring the lasagna on your lap, it holds the heat. Fifty-nine floors, no stops, I am not even charging. I am scared of that tower and I am going anyway. | Tom loving, Amy happy, TNB happy, Grace happy, Rose happy |

## scene: ch19Thaw (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | The snow globe is still on its plinth. Inside it, very small, two stone figures hold each other up. The amber light is crawling on their hands. It is slower than before. | Amy sad, TNB sad, Grace sad, Rose sad |
| Amy | Mom. Dad. We brought dinner. | Tom loving, TNB loving, Grace loving, Rose loving |
| Rose | I brought a pretzel. It has been DELIVERED. It has a stamp. | Tom happy, Amy happy, TNB happy, Grace happy |
| TNB | Everybody sit. Around the plinth. Nobody leave. Plates on laps. | Tom proud, Amy proud, Grace proud, Rose proud |
| Tom | Steam from the lasagna drifts across the glass. The amber light turns the color of toast. A crack of warm yellow runs along the stone, then two, then nine. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |
| Grace | It’s working. It’s working! | Tom happy, Amy happy, TNB happy, Rose happy |
| Boppy | Oh. Oh, my back. My back is going to be talking about this for a week. | Tom loving, Amy loving, TNB happy, Grace happy, Rose happy |
| Deedee | Is that lasagna? Who made lasagna? Who has been in my kitchen? | Tom loving, Amy loving, TNB happy, Grace happy, Rose happy, Boppy unimpressed |
| Rose | DEEDEE! BOPPY! | Deedee loving, Boppy loving, Tom happy, Amy loving, TNB happy |
| Deedee | Oh, my babies. Come here. All of you. Come here, to the moon and back and back and back. | Tom loving, Amy loving, TNB loving, Grace loving, Rose loving, Boppy unimpressed |
| Boppy | Which one of you is eating the peppers raw? | Tom happy, Amy happy, TNB scared, Grace happy, Rose happy, Deedee unimpressed |
| Grace | Nobody. Yet. | Boppy happy, Tom happy, Amy unimpressed, Deedee unimpressed |
| Boppy | Hand me one. For my knees. | Deedee unimpressed, Tom happy, Amy happy, TNB happy, Grace happy, Rose happy |
| Tom | Everyone is crowded onto one floor of a glass tower with plates in their laps, and for a minute, it is just a family having dinner, eight people and a dog. | Amy loving, TNB loving, Grace loving, Rose loving, Deedee loving, Boppy loving, Nara happy |
| Deedee | Tom. Who is the man in the gold coat? The one who kept us on a shelf? | Tom sad, Amy angry, TNB sad, Boppy angry |
| Tom | Vance. He is still up there, at the top. He is going to want more than a shelf. | Amy angry, TNB proud, Deedee scared, Boppy angry, Grace scared, Rose scared |
| Boppy | Then we finish eating first. | Tom happy, Amy happy, TNB happy, Deedee happy, Grace happy, Rose happy |
| Floor 59 | Overhead, through the glass ceiling, every clock in the sky stops. They are all pointing at the same minute: the one just after the last. A door nobody has noticed before, high up in the tower, has begun to open. | Tom surprised, Amy surprised, TNB surprised, Grace scared, Rose scared, Deedee surprised, Boppy surprised, Nara scared |
| Tom | He sets down his plate. Then he picks it back up. | Amy happy, TNB loving, Deedee loving, Boppy proud, Grace happy, Rose happy |
| Tom | Seconds first. Then the sky. | Amy proud, TNB proud, Deedee loving, Boppy proud, Grace proud, Rose proud |

## scene: ch20CoreOpen (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Stillness Core | Eight lamps light round the frame of the lift in the middle of the Core, one for each of you. The brass doors slide apart, and a warm gold light comes out of the shaft. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised |
| Tom | He built a lock that opens for family. All eight of us, and a thermos. I resent how much I admire that. | Amy happy, TNB loving, Deedee happy, Grace happy |
| Amy | The Extra Place. Mom set a place for everybody at every dinner for fifty years. That is the whole trick. He should have asked her. | Tom loving, Deedee loving, TNB loving, Boppy unimpressed |
| Deedee | Is it ready? Because I made a lot. | Tom happy, Amy happy, TNB happy, Boppy unimpressed, Grace happy, Rose happy |
| Stillness Core | THE EXTRA PLACE (the all-eight Family Finish) is ready. It costs 75% HEART. | Tom proud, Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud |

## scene: ch20Open (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | In the ceiling of the Vault, a round brass door has opened. It has a clock for a keyhole. It is ticking very slowly, like a heart that has been told to be quiet. | Amy surprised, TNB surprised, Grace scared, Rose surprised, Deedee surprised, Boppy surprised |
| Boppy | That is the biggest clock I have ever seen. And I have a lot of clocks. They all run fast, for my stomach. | Tom unimpressed, Deedee unimpressed, Amy unimpressed, Grace happy, Rose happy |
| Deedee | Is that the man’s house? Somebody should tell him to leave a light on. | Tom happy, Amy happy, Boppy unimpressed, TNB happy |
| Amy | Everybody stays together. All eight. Nobody goes through a door alone. | Tom proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud |
| Grace | We always make our connection. | Tom loving, Amy loving, TNB loving, Deedee loving, Boppy proud, Rose proud |
| Rose | Nara goes first. She is the best at doors. | Nara proud, Tom happy, Amy happy, Grace happy |
| Tom | Eight of us, a dog and a thermos. Seconds first, then the sky. Let us go. | Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara proud |
| Stillness Core | The lift opens into a round chamber of brass and glass, behind the face of the sky clock. Every wall is a gear, and every gear is turning very slowly. Eight round doors stand sealed around a lift in the middle. Each keyhole is shaped like somebody. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised |
| Rose | I get a door too? | Tom loving, Amy loving, Grace happy, Deedee loving |
| Tom | You get a door too. | Rose proud, Grace happy, Deedee loving |
| TNB | It is a very good lock. Whoever made it really cared about the mechanism. | Tom happy, Amy unimpressed |
| Tom | One skill each. Whatever you are best at, that is your door. | Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud |

## scene: ch20Heart (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Forever Engine | A column of gears the height of a tower. Around it, a brass serpent as long as a street is slowly uncoiling. Every scale is a clock face. Every clock says 4:59. At the top of the Engine, on a platform of glass, a man in a long coat stands with his back to you. | Tom surprised, Amy surprised, TNB surprised, Grace scared, Rose scared, Deedee surprised, Boppy surprised, Nara angry |
| Vance | Tom. You came back. You always come back. That is the thing I could never forgive you for. | Amy angry, TNB angry, Grace scared, Rose scared, Deedee sad, Boppy angry |
| Tom | I was written out of the schedule. I am a very stubborn calendar entry. | Vance unimpressed, TNB happy, Amy happy |
| Vance | Everything leaves. Time takes a little every day, and then one day all of it. So I built a place where it cannot. The Leviathan keeps every afternoon exactly as it was. Please do not hurt it. It is all I have. | Tom sad, Amy angry, TNB sad, Grace angry, Rose sad, Deedee sad, Boppy unimpressed |
| Grace | You turned my grandparents into STATUES. | Vance sad, Tom proud, Amy proud, Deedee loving |
| Vance | I kept them safe. | Tom angry, Amy angry, TNB angry, Grace angry, Boppy angry |
| Boppy | I was a statue for a week and my back did not get a single day off. I would like to file a complaint. | Tom happy, Amy happy, Deedee unimpressed, Grace happy, Rose happy, Vance unimpressed |
| Deedee | Julian, honey. Have you eaten? | Vance surprised, Tom loving, Amy unimpressed, Boppy unimpressed |
| Vance | There are four things that will keep you out. Distance. Age. Exhaustion. Fear. Four things I could never get past. You will not, either. | Tom proud, Amy proud, TNB proud, Grace scared, Rose scared, Deedee unimpressed, Boppy unimpressed |
| Amy | Distance, age, exhaustion, fear. That is just a regular Tuesday. | Tom happy, TNB happy, Grace happy, Vance unimpressed |
| Tom | Okay. Four barriers. We have a plan for every one of them. Everybody ready? | Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara proud |
| Rose | Is the snake going to be mean? | Tom loving, Amy loving, Deedee loving |
| Tom | It is going to be very, very tired. Be kind about it, and be fast. | Rose proud, Grace proud, Amy proud |
| Forever Engine | The Chronos-Leviathan lowers its head. Every clock on its body ticks at once. | Tom proud, Amy proud, TNB proud, Grace scared, Rose scared, Deedee surprised, Boppy unimpressed, Nara angry |

## scene: ch20Fight1 (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Up. Everybody up. Breathe. It is a long fight, and we are a long family. We can do this again. | Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara proud |

## scene: ch20Shatter (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Forever Engine | The Leviathan comes apart. It does not die. It comes apart like a watch being taken out of its case, one gear at a time, every one of them still ticking. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Forever Engine | Where its coil was, there is a room made of glass. A small living room. One lamp, one armchair. A man in a long coat is sitting in it with his hat in his hands. He is a good deal smaller than the shadow he threw. | Tom sad, Amy surprised, TNB sad, Grace surprised, Rose surprised, Deedee sad, Boppy surprised |
| Vance | My daughter was nine. I was on a flight. I told her, one more flight next month. It was her birthday. I told my mother the same thing, about the hospital. I told my partner the same thing about everything. | Tom sad, Amy sad, TNB sad, Grace sad, Rose sad, Deedee sad, Boppy sad |
| Vance | There was always one more flight next month. And then there was not. So I stopped the months. I did not know how to say goodbye. So I made sure that nobody could leave. | Tom sad, Amy sad, TNB sad, Grace sad, Rose sad, Deedee sad, Boppy sad |
| Tom | Julian. | Vance sad, Amy sad, TNB sad, Deedee loving |
| Vance | Eternal Silence. | Tom sad, Amy scared, TNB scared, Grace scared, Rose scared, Deedee sad, Boppy surprised, Nara scared |
| Forever Engine | Every sound in the Engine goes out. Every move you have turns to grey stone, and the stone falls and lies on the glass floor. He did not fight. He only went quiet, and asked everyone to. | Tom sad, Amy surprised, TNB surprised, Grace scared, Rose scared, Deedee sad, Boppy surprised |
| Amy | He is not attacking us. Look at his hands. | Tom sad, TNB sad, Grace surprised, Rose surprised, Deedee sad |
| Grace | They are shaking. | Tom sad, Amy sad, TNB sad, Deedee sad, Boppy sad |
| Rose | Is he cold? | Tom loving, Amy loving, Deedee loving, Grace sad |
| Tom | No hitting. He has done enough to everybody else. Do the thing you are each best at, for him. Everybody. In turn. I will be last. | Amy proud, TNB proud, Grace proud, Rose proud, Deedee loving, Boppy proud |
| Boppy | The last one is always the hardest. That is why I put the pepper first. | Tom happy, Amy happy, Deedee unimpressed, Grace happy |

## scene: ch20Fight2 (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Everybody up. He is not going anywhere. That is rather the point of him. | Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud |

## scene: ch20Calm (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Forever Engine | Julian is still in the armchair. He has a cardigan on and a tennis ball in his lap, and a plate of rhubarb crisp that he has not eaten. The glass of the living room is cracked right down the middle, and every crack is letting the light in. | Tom loving, Amy loving, TNB loving, Grace sad, Rose sad, Deedee loving, Boppy happy |
| Vance | Clara would be thirty-one. She would say I deserved all of this. | Tom sad, Amy sad, TNB sad, Deedee sad, Boppy sad, Grace sad |
| Tom | Probably. And then she would sit down next to you anyway. | Vance sad, Amy loving, Deedee loving |
| Vance | I could not make the minute stop hurting. So I stopped the minute. It did not stop hurting. It only stopped. | Tom sad, Amy sad, TNB sad, Grace sad, Rose sad, Deedee sad, Boppy sad |
| Deedee | Honey. That is all of it. That is what living is. It hurts a little, every time, and you do it anyway. | Vance sad, Tom loving, Amy loving, TNB loving, Boppy loving |
| Boppy | And the crisp is excellent. | Deedee unimpressed, Tom happy, Amy happy, Grace happy, Rose happy, Vance happy |
| Vance | I do not know how to start the clocks. | Tom loving, Amy sad, TNB sad, Deedee loving |
| Tom | You do not start them. You stop holding them. | Vance surprised, Amy loving, TNB loving, Deedee loving |
| Forever Engine | Julian lets go. A long breath goes out of him, the one that has been in him for twenty years. The Forever Engine lets go with him. One by one, every gear in the Moon begins to turn the right way, and far below, in two cities, every clock in the sky ticks forward, all together, to five o’clock. | Tom loving, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee loving, Boppy surprised, Nara surprised |
| Rose | IT MOVED! The clock MOVED! | Tom happy, Amy happy, TNB happy, Grace happy, Deedee happy, Boppy happy |
| Grace | It is five o’clock. It is just five o’clock. It is the best five o’clock I have ever seen. | Tom loving, Amy happy, TNB happy, Rose happy, Deedee loving, Boppy happy |
| Vance | The towns in the Archive are open. The coins are going home. The snow globe is a town again. I am sorry. I do not know how to say how sorry. | Tom loving, Amy loving, TNB loving, Grace loving, Rose loving, Deedee loving, Boppy unimpressed |
| Tom | You are doing it right now. Come to dinner. | Vance surprised, Amy loving, TNB loving, Deedee loving |
| Vance | I do not have anything to bring. | Tom loving, Deedee loving, Amy loving, Grace sad |
| Deedee | Bring yourself and an appetite. | Vance loving, Tom happy, Amy happy, Boppy happy |
| Boppy | And bring a chair. We are short a chair. | Vance happy, Tom happy, Amy happy, Deedee unimpressed, Grace happy, Rose happy |
| Amy | Mom already set the place. She set it at every dinner for fifty years. There is always one more seat. | Vance loving, Tom loving, Deedee loving, TNB loving |

## scene: ch20Epi1 (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Long Island is a town again. The fountain is running. The library door is open. Someone has already started a pie, which is how you know it is real. | Amy happy, TNB happy, Grace happy, Rose happy, Deedee happy, Boppy happy |
| Rose | Look! Look who is delivering! | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Deedee surprised |
| Oblivion Censor | Good afternoon. I have four parcels. This is the first delivery I have ever made. Please do not be too nice about it. I am a little emotional. | Tom loving, Amy loving, TNB loving, Grace happy, Rose happy, Deedee loving, Boppy unimpressed |
| Grace | My squishy! The Sparkling Diamond Gold Soup Dumpling squishy! | Tom happy, Amy happy, Rose happy, Deedee happy |
| Rose | My pink ribbon! It is still tied in a bow! | Tom happy, Amy happy, Grace happy, Deedee loving |
| Amy | My stopwatch. It is still running. It is at nine hundred and eleven hours, and some seconds. | Tom happy, TNB happy, Grace happy, Boppy unimpressed |
| TNB | My first cup. It is full. It is still warm. I do not know how that is possible and I am not going to ask. | Tom loving, Amy happy, Deedee loving |
| Oblivion Censor | Each one is stamped DELIVERED. It is, I have learned, my favorite word. | Tom loving, Amy loving, TNB loving, Grace happy, Rose happy |
| Tom | He hands me a fifth parcel. It is small and brown. It is addressed, in my own handwriting, to Tom, Second Avenue. It is a letter I never mailed. | Amy surprised, TNB loving, Grace surprised, Rose surprised |
| Oblivion Censor | I did not open it. That is not my department anymore. I only deliver. | Tom loving, Amy loving, TNB loving |
| Sal | Cab seven! Everybody in! I am not charging. I am not even driving. Look UP. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised |
| Tom | High over the Square, a line of gold runs from the sky down to the fountain. There is a rail on it with a seam of bright gold, exactly where somebody mended it. A train glides in, quiet as a held breath. The sign on its front says LONG ISLAND on one side and LOS ANGELES on the other. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Vance proud |
| Vance | I made it from the Engine. It runs both coasts. It does not stop the clocks. It only makes the distance a little shorter. I thought, if I had built that first... | Tom loving, Amy sad, TNB loving, Deedee loving, Boppy unimpressed |
| Tom | You would have been home for the birthday. | Vance sad, Amy sad, Deedee loving |
| Vance | I would have been home. | Tom loving, Amy loving, Deedee loving, TNB loving |
| Sol | A SKYWAY TRAIN?! I do not know what to do with my hands! I am a cab driver! | Tom happy, Amy happy, TNB happy, Grace happy, Rose happy, Deedee happy, Boppy happy, Vance happy |
| Sal | You are the first passenger. Get in the train. | Sol surprised, Tom happy, Grace happy, Rose happy |
| Amy | Three thousand miles. One ride. Mom, Dad, you can come to Tom’s any Tuesday you like. | Tom loving, Deedee loving, Boppy happy, TNB loving, Grace happy, Rose happy |
| Boppy | Does it have a recliner? | Tom happy, Amy happy, Deedee unimpressed, Grace happy, Rose happy, Vance happy |
| Vance | It has four. I asked. | Boppy surprised, Tom happy, Amy happy, Deedee happy |
| Boppy | I have changed my mind about the man. | Vance happy, Tom happy, Amy happy, Deedee unimpressed, TNB happy |
| Vance | I am going to call my daughter. I do not know whether she will pick up. I am going to call anyway. | Tom loving, Amy loving, TNB loving, Deedee loving, Boppy loving, Grace happy |
| Tom | That is a good seat to start in. | Vance loving, Amy loving, Deedee loving |

## scene: ch20Epi2 (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | A week later. Jefferson Park, six in the evening. The street light has come on, and for once it is not worth mentioning. | TNB loving, Grace happy, Rose happy |
| Rose | Tata, the train came again. It has a snack cart. It has a snack CART. | Tom happy, Grace happy, Amy happy, Deedee happy |
| Grace | I rode both coasts in one day. I did a floor routine in the dining car. Nobody stopped me. | Tom proud, Amy unimpressed, Rose happy, Deedee happy |
| Deedee | Boppy fell asleep in the recliner somewhere over Nebraska. He says it is the best nap of his life. He says his back has never felt worse. | Tom happy, Amy happy, Grace happy, Rose happy, Boppy unimpressed |
| Boppy | Both of those are true. | Deedee unimpressed, Tom happy, Amy happy, Grace happy |
| Amy | Justin is coming out on the next one. He booked his own ticket. He says he cleared the whole weekend. I have been looking at the calendar for an hour to make sure it is real. | Tom loving, Grace happy, Rose happy, Deedee loving |
| TNB | I made a mug. It has the same handle as the first one. It is exactly too big. | Tom loving, Amy happy, Deedee happy |
| Nara | Nara has found the sourdough boule. She is guarding it with her whole body. | Tom unimpressed, TNB happy, Grace happy, Rose happy |
| Tom | He sits down on his own porch step. The cup is warm. Everyone he loves is on this street, on both coasts, and every one of them is exactly where they are, with a train in between. | TNB loving, Amy loving, Grace loving, Rose loving, Deedee loving, Boppy loving |
| TNB | Hey. | Tom loving |
| Tom | Hey. | TNB loving |
| Grace | Tata. Are we going to be okay? | Tom loving, Amy loving, TNB loving, Rose surprised |
| Tom | We always make our connection. | Grace loving, Rose happy, Amy loving, TNB loving, Deedee loving, Boppy loving |

## scene: ? (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Sprinkle Gremlin | Brr! Tiny! Angry! | Tom unimpressed, Grace unimpressed, Rose happy |
| Sprinkle Gremlin | We came in the freezer. It was cold. We're STILL cold. | Tom sad, Grace unimpressed, Rose sad |
| Slushie Slug | Glorp. These scoops are mine. He said so. | Tom unimpressed, Grace angry, Rose surprised |
| Slushie Slug | Blue raspberry isn't a fruit. I know. I don't care. | Tom unimpressed, Grace unimpressed, Rose happy |
| Cone Head | We hold the scoops. We hold the cow. We hold EVERYTHING. | Tom unimpressed, Grace angry, Rose surprised |
| Cone Head | Mint chip. Say it. MINT. CHIP. | Tom unimpressed, Grace unimpressed, Rose happy |
| Brain Freeze | Nobody came to MY birthday. So nobody gets one. | Tom sad, Grace angry, Rose sad |
| Brain Freeze | Nothing melts in here. Nothing changes. Nothing LEAVES. | Tom sad, Grace angry, Rose scared |

## scene: nsOpening (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | TATA! You came for my BIRTHDAY! | Tom loving, Rose happy |
| Grace | I've been nine for SIX hours. | Tom happy, Rose unimpressed |
| Rose | I've been six for a hundred MILLION years. | Tom happy, Grace unimpressed |
| Rose | Tata, up! Up up up! | Tom happy, Grace happy |
| Rose | I'm the tallest! Giddyup, Tata! | Tom happy, Grace happy |
| Tom | Hello, Rose. Hello, duck. Please keep your arms, legs and bills inside the uncle at all times. | Rose happy, Grace happy |
| Grace | Tata, LOOK. A fluffy purple cow. Her name is Moo-rielle. And a GLITTER DICE. | Tom surprised, Rose surprised |
| Grace | It only does nines today. | Tom happy, Rose happy |
| Rose | The duck is mine now. | Tom unimpressed, Grace unimpressed |
| Tom | That's the fluffiest cow I've ever seen. And I've seen a LOT of cows. | Grace proud, Rose happy |
| Tom | One for the fridge. Everybody say ice cream. | Grace happy, Rose happy |
| Rose | ICE CREAM! Come on, Tata! Let’s go! | Tom happy, Grace happy |

## scene: nsGoal (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! Sprinkle Street Creamery! The sundae! Mr. Pistachio said it'd be READY. | Tom happy, Rose happy |
| Tom | Nine dairy-free scoops. One per year. Black and white cookie on top. I ordered it in July. | Grace happy, Rose surprised |
| Rose | Is the present a puppy? | Tom unimpressed, Grace unimpressed |
| Tom | It's not a puppy. | Rose unimpressed, Grace happy |
| Tom | Presents are after cake. That's the rule. I didn't make the rule. | Grace unimpressed, Rose unimpressed |

## scene: nsCreamery (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Tata. It's SNOWING. Inside. | Tom surprised, Grace surprised |
| Grace | Mr. Pistachio is in an ICE CUBE. Mr. PISTACHIO. | Tom surprised, Rose surprised |
| Mr. Pistachio | Mmmf. Mmf MMF. Mmmmf. | Tom unimpressed, Grace surprised, Rose happy |
| Tom | He says the freezer walked off. I speak ice cube. | Grace unimpressed, Rose surprised |
| Sprinkle Gremlin | Brr! Tiny! Angry! The scoops are OURS! | Tom unimpressed, Grace angry, Rose scared |
| Grace | Tata is in front. I'm in charge of choreography. It's my birthday. FIGHT! | Tom unimpressed, Rose happy |
| Grace | Up. Everybody up. It's my birthday and NOBODY stays down on my birthday. | Tom happy, Rose happy |
| Mr. Pistachio | PFFF. Thank you. I could see my own eyebrows in there. | Tom happy, Grace happy, Rose happy |
| Mr. Pistachio | It was BRAIN FREEZE. A walking chest freezer. He said birthdays are a scam and nobody came to his. | Tom surprised, Grace angry, Rose surprised |
| Mr. Pistachio | He took every scoop and ran. Three bags. One to the fountain, one up the Hollow trail, one to the pond. | Tom unimpressed, Grace angry, Rose surprised |
| Grace | He took MY scoops? On MY birthday? | Tom loving, Rose angry |
| Grace | Stealing on a BIRTHDAY? Rude. | Tom happy, Rose happy |
| Rose | A bad guy! On a Saturday! | Tom happy, Grace unimpressed |
| Tom | We get the scoops, we get the sundae, we're home by four. | Grace proud, Rose happy |
| Rose | Is the present a puppy? | Tom unimpressed, Grace unimpressed |
| Tom | It's not a puppy. | Rose unimpressed, Grace happy |

## scene: nsFountain (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | THERE. Under the slug. Vanilla, strawberry AND mint. I can see them. | Tom proud, Rose surprised |
| Rose | Shh. Shhhh. Everybody shh. The duck and I have a plan. | Tom unimpressed, Grace unimpressed |
| Slushie Slug | GLORP. What? WHO? Oh no. I dropped a scoop. I dropped TWO scoops. | Tom happy, Grace happy, Rose proud |
| Grace | Up, up. It's a slug. We're not losing to a SLUG on my birthday. | Tom happy, Rose happy |
| Rose | Is the present a BIGGER puppy? | Tom unimpressed, Grace unimpressed |
| Tom | It's not a bigger puppy. | Rose unimpressed, Grace happy |

## scene: nsTrail (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Cone Head | Halt. We hold the scoops. Chocolate. Cookie dough. Coffee. | Tom unimpressed, Grace angry, Rose surprised |
| Cone Head B | And now we hold the cow. | Tom surprised, Grace scared, Rose surprised |
| Grace | MOO-RIELLE! Give her BACK! | Tom proud, Rose angry |
| Grace | Hi guys. Welcome back to my channel. Today a CONE stole my COW. | Tom unimpressed, Rose happy |
| Brain Freeze | ...Nobody filmed MY birthday. | Tom sad, Grace surprised, Rose scared |
| Rose | Tata. The trees are TALKING. | Tom unimpressed, Grace scared |
| Tom | The trees aren't talking. The freezer is. Eyes on the cones. | Grace proud, Rose unimpressed |
| Grace | Up. UP. Moo-rielle needs us. | Tom proud, Rose proud |
| Grace | Moo-rielle! You smell like mint. We'll talk about it later. | Tom happy, Rose happy |

## scene: nsPond (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Pond Grump | Grrrumble. Something moved into my pond. It's COLD. I'm a POND grump, not an ICE grump. | Tom unimpressed, Grace surprised, Rose happy |
| Grace | Dice says nine. Nine scoops. Nine candles. Let’s go. | Tom proud, Rose proud |
| Brain Freeze | Nine scoops. Nine candles. Nine years. All of it MELTS. | Tom sad, Grace angry, Rose scared |
| Brain Freeze | Not in here. Nothing melts in here. Nothing changes. | Tom sad, Grace angry, Rose scared |
| Brain Freeze | Nobody came to MY birthday. So nobody gets one. | Tom sad, Grace angry, Rose sad |
| Grace | Stealing on a BIRTHDAY? Rude. | Tom happy, Rose happy |
| Rose | A bad guy! On a Saturday! | Tom happy, Grace unimpressed |
| Tom | We get the scoops, we get the sundae, we're home by four. Everybody ready? | Grace proud, Rose proud |
| Grace | Tata, nothing WORKS. | Tom surprised, Rose scared |
| Brain Freeze | Good. Nothing changes. Nobody leaves. | Tom angry, Grace scared, Rose scared |
| Brain Freeze | The scoops stay. The cow stays. The small loud one stays. | Tom scared, Grace scared, Rose scared |
| Grace | MOO-RIELLE! | Tom sad |
| Tom | Grace. Grab Rose. The other end. Lift with your legs. | Grace scared |
| Tom | We're leaving. We're coming back. That's a promise, not a rule. | Grace proud |
| Brain Freeze | Nobody comes back. Nobody ever comes back. | Tom sad, Grace sad |
| Grace | Tata. She's SLIDING. | Tom scared |
| Tom | She's frozen, not broken. Keep walking. Don't tip her. | Grace scared |
| Grace | He took the scoops. He took Moo-rielle. He FROZE my SISTER. On my BIRTHDAY. | Tom loving |
| Tom | I know. First things first. Rose. Deedee. Warm. | Grace sad |
| Grace | Up, up. It's my birthday. Nobody stays down. | Tom proud |

## scene: nsThaw (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | My favorite son! And my girls! And my... oh. OH. Why is Rose in an ice cube. | Tom happy, Grace happy, Boppy surprised |
| Tom | A freezer did it. Long story. Short version: freezer. | Deedee surprised, Grace unimpressed, Boppy unimpressed |
| Grace | He stole the scoops AND Moo-rielle AND he froze Rose. On my BIRTHDAY, Deedee. | Deedee angry, Tom loving, Boppy unimpressed |
| Deedee | On her BIRTHDAY. Boppy, did you hear that? | Tom happy, Grace proud, Boppy unimpressed |
| Boppy | I heard. I'm sitting. The knee. | Deedee unimpressed, Tom happy, Grace unimpressed |
| Deedee | Hold on, honey. Let me read the cake box first. It has to say dairy free. Where are my glasses. | Tom unimpressed, Grace unimpressed, Boppy unimpressed |
| Deedee | I had them. I had them a MINUTE ago. | Tom unimpressed, Grace unimpressed, Boppy unimpressed |
| Boppy | They're in the oven mitt, Dee. You're wearing them. On your hand. | Deedee surprised, Tom happy, Grace happy |
| Deedee | ...So they are. Don't say anything. | Boppy happy, Tom happy, Grace happy |
| Boppy | I didn't. I said it to Tom. | Deedee unimpressed, Tom happy, Grace happy |
| Deedee | Dairy free. Good. Now. Rose. Come here, sweetheart. Deedee's got you. | Tom loving, Grace loving, Boppy loving |
| Rose | I was in the MIDDLE of a boo. | Deedee loving, Tom happy, Grace happy, Boppy happy |
| Deedee | To the moon and back, Rosie. The MOON. And BACK. | Rose loving, Tom loving, Grace loving, Boppy loving |
| Deedee | Cold doesn't beat cold, Tom. Warm beats cold. Always has. Ask any nurse. | Tom surprised, Grace proud, Rose happy |
| Tom | Warm beats cold. Okay. What do we have that's warm. | Deedee proud, Grace proud, Rose happy |
| Boppy | My peppers. Out back, in the garden. The hose flinched. | Tom surprised, Grace surprised, Rose surprised, Deedee unimpressed |
| Boppy | Don't take the ghost one. The ghost one is MINE. | Tom unimpressed, Grace surprised, Rose happy, Deedee unimpressed |
| Grace | Which one is the ghost one? | Boppy proud, Tom unimpressed, Rose surprised |
| Boppy | The one that's looking at you. | Grace scared, Rose surprised, Tom unimpressed, Deedee unimpressed |

## scene: nsPeppers (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Boppy's peppers. Red, redder, and one that's looking at me. | Grace scared, Rose happy |
| Sprinkle Gremlin | Brr! HOT! Ours! He said take every warm thing in town! | Tom unimpressed, Grace angry, Rose happy |
| Grace | He sent gremlins to the GARDEN? Tata, this freezer is organized. | Tom surprised, Rose happy |
| Rose | Boo. I'm practicing. | Tom unimpressed, Grace unimpressed |
| Grace | Up. Gremlins. We're not losing to GREMLINS on my birthday. | Tom proud, Rose proud |
| Boppy | (from the window) That's enough peppers! Leave the ghost one! | Tom unimpressed, Grace happy, Rose happy |
| Rose | I took a little one. For later. For boos. | Tom unimpressed, Grace unimpressed |
| Tom | Rose, give me the... fine. Keep it. Don't lick it. | Rose proud, Grace unimpressed |
| Grace | Three peppers. Warm things, check. Now who knows how a FREEZER works? | Tom proud, Rose happy |
| Tom | Mr. Pistachio. He owns a creamery. He's basically a freezer scientist. | Grace proud, Rose happy |

## scene: nsOldFreezer (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Pistachio | You're back! Did you... oh. No scoops. And the little one looks defrosted. | Tom unimpressed, Grace sad, Rose unimpressed |
| Rose | I was in an ice cube. It was boring. | Tom happy, Grace unimpressed |
| Tom | Mr. Pistachio. Brain Freeze. He came out of YOUR shop. Tell us everything. | Grace proud, Rose happy |
| Mr. Pistachio | ...He was mine. My first chest freezer. Twenty years in the back room. Hum, hum, hum. | Tom sad, Grace surprised, Rose surprised |
| Mr. Pistachio | Every birthday cake in this town sat in him first. Every one. And nobody ever says thank you to a freezer. | Tom sad, Grace sad, Rose sad |
| Mr. Pistachio | I replaced him in the spring. Newer. Quieter. I unplugged him on a Tuesday and I didn't even say goodbye. | Tom sad, Grace sad, Rose sad |
| Grace | So nobody came to his birthday because... he never HAD one. | Tom sad, Rose sad |
| Mr. Pistachio | He kept everybody else's. He never got his own. | Tom sad, Grace sad, Rose sad |
| Mr. Pistachio | Here's the thing about a freezer, Tom. The outside is the soft part. The door. People stick things on it. Photos. Drawings. Report cards. | Tom surprised, Grace surprised, Rose surprised |
| Mr. Pistachio | In twenty years, nobody stuck one thing on him. Not one. | Tom sad, Grace sad, Rose sad |
| Rose | Tata. Is the present a puppy? | Tom unimpressed, Grace unimpressed |
| Tom | It's not a puppy. | Rose unimpressed, Grace happy |
| Tom | ...After cake. | Grace surprised, Rose surprised |
| Grace | Tata, you looked at your BAG. | Tom scared, Rose surprised |
| Tom | I looked at the floor. The floor is near the bag. | Grace unimpressed, Rose happy |
| Mr. Pistachio | Take these. Hot cocoa. My recipe. If you're going back up there, you'll want something warm in you. | Tom loving, Grace happy, Rose happy |
| Mr. Pistachio | And Tom. If you get his door open, tell him I said happy birthday. Twenty years late. | Tom loving, Grace loving, Rose happy |

## scene: nsBanner (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | There they are. No scoops. One defrosted child. Tom, status report. Ten words or less. | Tom unimpressed, Grace happy, Rose happy, Justin happy |
| Tom | Freezer. Sad. Never had a birthday. Stole everything. We're going back. | Amy proud, Grace happy, Rose happy |
| Amy | Nine words. Good. | Tom unimpressed, Grace happy |
| Amy | Okay. Listen to me. I've run thirty marathons and taught four hundred kids. You don't out-freeze a freezer. | Tom unimpressed, Grace proud, Rose happy, Justin loving |
| Amy | You bring the party TO him. Warm things. Loud things. The works. | Tom proud, Grace proud, Rose happy |
| Justin | The banner's done. Hold this. No, the other end. Don't touch the copper. | Tom unimpressed, Amy unimpressed, Grace happy, Rose happy |
| Grace | Dad, why does a BANNER have copper? | Justin proud, Tom happy, Amy unimpressed |
| Justin | It lights up. Every letter. I'm an electrician, Gracie. It was never going to just hang there. | Grace surprised, Rose surprised, Amy loving, Tom happy |
| Amy | Freezers have doors. Doors take magnets. Hang it ON him. | Tom surprised, Grace surprised, Rose surprised, Justin proud |
| Rose | ON him? | Amy proud, Grace happy, Tom happy |
| Amy | ON him. And Rose, baby, you Boo him so hard he forgets his own name. | Rose proud, Grace happy, Tom happy, Justin happy |
| Rose | I have a pepper for it. | Amy unimpressed, Tom unimpressed, Grace happy, Justin surprised |
| Amy | ...We'll talk about the pepper later. | Rose happy, Tom happy, Grace happy |
| Amy | Pip, Moss and Dot are coming at four. Deedee's cake is done. All you need is nine scoops and one freezer. | Tom proud, Grace happy, Rose happy |
| Grace | And Moo-rielle. | Amy happy, Tom happy |
| Amy | And Moo-rielle. Go. Love you. Don't tip your sister. | Grace loving, Rose loving, Tom loving, Justin loving |

## scene: nsBoss2 (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Up, up. It's still my birthday. We go AGAIN. | Tom proud, Rose proud |

## scene: nsPond2 (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Brain Freeze | ...You came back. | Tom loving, Grace proud, Rose proud |
| Brain Freeze | Nobody comes back. | Tom sad, Grace proud, Rose sad |
| Grace | It's STILL my birthday. And you have my COW. | Tom proud, Rose proud |
| Grace | It only does nines today. | Tom happy, Rose happy |
| Rose | I have a pepper in my pocket and I'm not afraid to use it. | Tom unimpressed, Grace unimpressed |
| Tom | Nobody's afraid of the pepper, Rose. Everybody ready? Warm things out. | Grace proud, Rose proud |
| Grace | Tata, nothing WORKS. | Tom surprised, Rose scared |
| Rose | He tried to freeze me AGAIN. I'm spicy now. He can't. | Tom happy, Grace happy |
| Brain Freeze | Good. Nothing changes. Nobody leaves. Nobody grows up. Nobody forgets a birthday. | Tom sad, Grace sad, Rose angry |
| Grace | ...Wait. Mr. Pistachio said. The DOOR. | Tom surprised, Rose surprised |
| Grace | Tata. He needs something on his door. Something that's HIS. | Tom surprised, Rose surprised |
| Tom | ...Okay. Presents are before cake. New rule. | Grace surprised, Rose surprised |
| Grace | An INSTAX. Tata. A PRINTER. For PHOTOS. | Tom loving, Rose surprised |
| Grace | ...The cab photo. This morning. All of us. | Tom loving, Rose happy |
| Tom | Pair it to my phone. One tap. It's still on there. | Grace proud, Rose happy |
| Grace | Printing... | Tom happy, Rose happy |
| Grace | You don't have to freeze it. You just take a picture. See? It stays. | Tom loving, Rose loving |
| Grace | That's us. On your door. Happy birthday, Brain Freeze. | Tom loving, Rose loving |
| Rose | And the BANNER. Dad made it light up. | Tom happy, Grace happy |
| Brain Freeze | ...It's warm. Why's the picture WARM. | Tom loving, Grace loving, Rose loving |
| Brain Freeze | My lid. My LID. It's OPENING. | Tom surprised, Grace surprised, Rose surprised |
| Grace | Then it's round two. Birthday Wish is ready. All three of us. | Tom proud, Rose proud |
| Tom | Everybody ready? It's still her birthday. | Grace proud, Rose proud |
| Grace | Up, up. It's my birthday. Nobody stays down. | Tom proud, Rose proud |

## scene: nsAfterBoss (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Brain Freeze | ...Nobody ever warmed me up before. Take the scoops. They're in the freezer. Where scoops go. | Tom loving, Grace loving, Rose loving |
| Brain Freeze | Fine. FINE. Take the scoops. They're in the freezer. Where scoops go. | Tom happy, Grace happy, Rose happy |
| Grace | All nine. Still perfect. And MOO-RIELLE. You were on a FREEZER. We'll talk about it later. | Tom happy, Rose happy |
| Tom | Mr. Pistachio says happy birthday. Twenty years late. | Grace loving, Rose loving |
| Brain Freeze | ...He remembered? | Tom loving, Grace loving, Rose loving |
| Brain Freeze | Hum. | Tom loving, Grace happy, Rose happy |
| Grace | Come to my party. | Tom loving, Rose happy |
| Brain Freeze | ...Nobody has ever... Is there cake? | Tom loving, Grace loving, Rose loving |
| Tom | There's a LOT of cake. | Grace happy, Rose happy |
| Brain Freeze | I'll bring the ice. I'm mostly ice. | Tom happy, Grace happy, Rose happy |
| Rose | He can sit next to the duck. | Tom happy, Grace happy |

## scene: nsEnd (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | You got them? All nine? Tom, I could KISS you. I won't. I'm sweaty. | Tom scared, Grace happy, Rose happy, Justin happy, Deedee happy |
| Justin | Hold this. No, the other end. It's the OTHER banner. Don't touch the copper. | Tom unimpressed, Amy unimpressed, Grace happy, Rose happy |
| Deedee | Cake is on the counter. Dairy free. I read the box nine times. With my glasses. | Tom happy, Amy happy, Grace happy, Rose happy, Boppy unimpressed |
| Boppy | Nine scoops. In my day we got one scoop. And a lecture. | Tom unimpressed, Amy unimpressed, Grace unimpressed, Deedee unimpressed |
| Pip | My rock says happy birthday. He's on the counter. Please don't frost him. | Tom unimpressed, Grace happy, Rose happy, Amy happy, Deedee happy |
| Moss | I brought a tree. A small one. It said it wanted to come. | Tom unimpressed, Grace happy, Rose happy, Amy happy, Deedee happy |
| Dot | Twelve people, one duck, one cow. I counted twice. The freezer counts as a person. | Tom happy, Grace proud, Rose happy, Amy happy |
| Brain Freeze | I brought ice. Where do you want the ice. | Tom happy, Grace happy, Rose happy, Amy surprised, Deedee happy, Boppy surprised, Justin surprised |
| Boppy | Nobody told me there'd be a FREEZER at the table. | Deedee unimpressed, Tom happy, Amy happy, Grace happy, Rose happy |
| Deedee | He's a guest, Boppy. Sit. He can sit next to you. You could use the cold on that knee. | Boppy unimpressed, Tom happy, Amy happy, Grace happy, Rose happy |
| Mr. Pistachio | Cones for everybody. And... hey, old friend. Happy birthday. I'm sorry it took twenty years. | Tom loving, Amy loving, Grace loving, Rose happy, Deedee loving |
| Brain Freeze | ...Hum. | Tom loving, Grace loving, Rose loving |
| Brain Freeze | That's a happy hum. | Tom loving, Amy loving, Grace loving, Rose happy, Deedee loving |
| Tom | Everybody, this is the Nine Scoop Sundae. Vanilla, strawberry, mint, chocolate, cookie dough, coffee, peanut butter, lemon, and black and white cookie on top. | Amy happy, Grace proud, Rose surprised, Deedee proud, Boppy surprised, Justin happy |
| Grace | Moo-rielle gets her own tiny scoop. Mint. She earned it. | Tom happy, Amy happy, Rose happy, Deedee loving |
| Amy | Candles! Everybody sing! Grace, make a wish! | Grace happy, Tom happy, Rose happy, Deedee loving, Boppy happy, Justin loving |
| Rose | ...I blew them out. The duck made me. | Grace angry, Tom unimpressed, Amy unimpressed, Deedee happy, Boppy happy, Justin happy |
| Grace | ROSE. | Rose scared, Tom happy, Amy unimpressed, Deedee happy, Justin happy |
| Tom | Relight. Nine candles. Hold still, please. | Grace proud, Rose happy, Amy happy |
| Grace | Okay. For real this time. I wish... | Tom loving, Amy loving, Rose happy, Deedee loving, Boppy loving, Justin loving |
| Grace | I'm not telling. That's the rule. I didn't make the rule. | Tom happy, Amy happy, Rose unimpressed, Deedee happy, Justin happy |
| Dot | Nine candles, one breath. I counted. Perfect score. | Grace proud, Tom happy, Amy happy |
| Brain Freeze | ...This is a good birthday. I'm putting it on my door. | Tom loving, Amy loving, Grace loving, Rose happy, Deedee loving |
| Amy | Oh! Penny called. She's got birthday things for you at the shop, Grace. Three of them. On the house. | Grace surprised, Tom happy, Rose surprised |
| Grace | A SASH? Is one of them a SASH? | Amy happy, Tom happy, Rose happy, Deedee happy |
| Amy | Go see. After cake. | Grace unimpressed, Tom happy |

## scene: nsInvite (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Hold on. It's your mom. | Grace surprised, Rose surprised |
| Amy | Tom. Don't panic. I'm panicking enough for both of us. | Tom unimpressed, Grace unimpressed, Rose happy |
| Amy | The invitations never went out. Justin was supposed to mail them Monday. Justin was at work Monday. Justin is at work now. | Tom unimpressed, Grace unimpressed, Rose happy |
| Amy | Grace's friends are in the Square. Pip, Moss and Dot. Hand them out. By HAND. Like it's 1994. | Tom unimpressed, Grace proud, Rose happy |
| Grace | MOM. It's fine. I'll invite them myself. I'm very persuasive. | Amy proud, Tom happy, Rose happy |
| Amy | You get that from me. Go. Love you. Scoops, friends, home by four. | Grace loving, Rose loving, Tom happy |
| Rose | Can I invite the duck? | Tom unimpressed, Grace unimpressed |
| Tom | The duck is already coming. The duck is in your arms. | Rose happy, Grace happy |

## scene: NS_INV_DONE (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Three friends. Three scoops so far. I like threes. | Tom happy, Rose happy |
| Tom | Six scoops to go. North. Into the Hollow. | Grace proud, Rose proud |

## scene: nsInvPip (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Pip! My party. Today. Four o'clock. There's a sundae with NINE scoops. | Tom happy, Rose happy, Pip surprised |
| Pip | Can my rock come? He's never been to a party. | Grace unimpressed, Tom unimpressed, Rose happy |
| Pip | He gets nervous around cake. He'll be fine. He's a rock. | Grace unimpressed, Tom unimpressed, Rose happy |
| Rose | Rocks LOVE cake. | Pip happy, Tom unimpressed, Grace unimpressed |
| Pip | Then we'll be there. Both of us. He'll bring a gift. It's a smaller rock. | Grace happy, Tom happy, Rose happy |

## scene: nsInvMoss (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Moss! Party. My house. Four. Bring nothing. Bring yourself. | Tom happy, Rose happy, Moss surprised |
| Moss | I asked the tree if I should go. | Grace unimpressed, Tom unimpressed, Rose surprised |
| Moss | It said nothing. That means yes. Trees are very supportive. | Grace happy, Tom unimpressed, Rose happy |
| Moss | Also, the tree says a freezer went north this morning. Humming. It wasn't happy. | Tom surprised, Grace surprised, Rose surprised |
| Tom | Thank the tree for us. | Moss proud, Grace happy, Rose happy |
| Moss | I already did. It said nothing. Very gracious. | Tom unimpressed, Grace happy, Rose happy |

## scene: nsInvDot (chapter Nine Scoops)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Dot! My birthday party. Today. Will you come? | Tom happy, Rose happy, Dot surprised |
| Dot | Nine years. Nine scoops. Nine candles. That's twenty-seven nines. I'll be there. | Grace happy, Tom unimpressed, Rose surprised |
| Dot | I'll count the guests. Somebody has to. | Grace unimpressed, Tom happy, Rose happy |
| Rose | Count the duck too. | Dot unimpressed, Tom happy, Grace unimpressed |
| Dot | One duck. Counted. | Tom happy, Grace happy, Rose proud |

## map: map town, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Pip | I'm taking my pet rock for a walk. | Tom unimpressed, Grace happy, Rose happy |
| Pip | He's shy. Please don't make eye contact. | Tom unimpressed, Grace unimpressed, Rose happy |
| Pip | Excellent. He's already learned 'stay'. | Tom happy, Grace unimpressed, Rose happy |
| Moss | I asked a tree for directions. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Moss | It said nothing. Very mysterious. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Moss | I think I'm barking up the wrong tree. | Tom happy, Grace unimpressed, Rose happy |
| Dot | This town has ten doors and two gaps in the trees. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Dot | I've counted them seventeen times. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Dot | Tomorrow I'm moving on to windows. | Tom happy, Grace unimpressed, Rose happy |

## map: map town, when {from:5} (chapter 5-10)

| Speaker | Line | Reactions |
|---|---|---|
| Dot | Ten doors and THREE gaps in the trees now. Somebody opened one by the school. | Tom surprised, Grace surprised, Rose surprised |
| Dot | I had to start all over. I'm at four hundred and six. | Tom happy, Grace unimpressed, Rose surprised |

## map: map town, when {chapter:1,flag:ch1-tin} (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Dot | You got the tin back? Ten doors, two gaps, one pie tin. All accounted for. | Tom happy, Grace proud, Rose happy |

## map: map town, when {chapter:1,flag:ch1-theft} (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Dot | A mud blob ran through the Square with a pie tin. One blob. One tin. I counted. | Tom surprised, Grace surprised, Rose surprised |
| Dot | It went north. Into the gap in the trees. Gap number one. | Tom proud, Grace proud, Rose happy |

## map: map row, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Gus | I'm training for the annual sit-down. | Tom unimpressed, Grace unimpressed, Rose happy |
| Gus | My coach is a bench. | Tom unimpressed, Grace unimpressed, Rose happy |
| Gus | We have a very supportive relationship. | Tom happy, Grace unimpressed, Rose happy |
| Bean | I'm not lost. I'm collecting wrong turns. | Tom unimpressed, Grace unimpressed, Rose happy |
| Bean | That pond up north owes me an apology. | Tom unimpressed, Grace happy, Rose happy |
| Bean | Long story. Short socks. | Tom unimpressed, Grace unimpressed, Rose happy |

## map: map row, when {chapter:1,flag:ch1-theft,notFlag:ch1-tin} (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Bean | A mud blob just ran past me carrying a pie. | Tom surprised, Grace surprised, Rose surprised |
| Bean | I didn't stop it. I collect wrong turns, not pies. | Tom unimpressed, Grace unimpressed, Rose happy |

## map: map row, when {chapter:3,flag:ch3-boppy} (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Bean | Boppy went by with a fishing rod and a jar of peppers. | Tom happy, Grace happy, Rose happy |
| Bean | He was walking slower than me. Nobody walks slower than me. I collect slow walks too, now. | Tom happy, Grace happy, Rose happy |

## map: map pier, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Reel | Bait shack is open. Worms, minnows, and a sandwich I'm not selling. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Reel | Your father has been fishing this pier since before the pier. He catches something every day. The size, I round down. | Tom happy, Grace happy, Rose happy |
| Reel | They say a catfish lives out there older than the boards. I say they say a lot. | Tom unimpressed, Grace surprised, Rose surprised |

## map: map pier, when {from:3,flag:ch3-clear} (chapter 3-10)

| Speaker | Line | Reactions |
|---|---|---|
| Reel | Your father caught Old Iron-Gill? And let him GO? Forty years of telling that story, and now it's true. | Tom proud, Grace proud, Rose happy, Boppy proud |
| Reel | He came by the shack this morning. The fish, not your father. Just floated there. I think he wanted to say hello. | Tom loving, Grace loving, Rose happy, Boppy loving |

## map: map pier, when {chapter:3,flag:ch3-jar} (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Reel | You saw it? Old Iron-Gill? Forty years I have run this shack. I thought it was a story. | Tom proud, Grace proud, Rose happy, Boppy proud |
| Reel | It went west, into the marsh. The Whispering Marsh. The reeds talk out there. Mostly nonsense. | Tom unimpressed, Grace surprised, Rose scared, Boppy unimpressed |

## map: map schoolyard, base (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Principal Pruitt | Principal Pruitt. Thirty-one years at Long Island Elementary. I've seen everything. Not tonight, though. Tonight is new. | Tom happy, Amy happy, Grace happy, Rose happy |

## map: map schoolyard, when {from:5,flag:ch5-done} (chapter 5-10)

| Speaker | Line | Reactions |
|---|---|---|
| Principal Pruitt | Thirty parents. Zero tears. One very well-behaved pen. Best conference night in thirty-one years. | Tom happy, Amy proud, Grace happy, Rose happy |
| Principal Pruitt | Come to Field Day, Tom. Amy runs the relay. Amy always runs the relay. | Tom happy, Amy proud, Grace happy, Rose happy |

## map: map schoolyard, when {chapter:5,notFlag:ch5-done,flag:ch5-pruitt} (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Principal Pruitt | Conferences start at seven. SEVEN. The bells say otherwise. The bells are wrong. | Tom unimpressed, Amy unimpressed, Grace surprised, Rose happy |
| Principal Pruitt | Clear the rooms, set the hallway clocks to seven, and the Cafetorium will open. I hope. | Tom proud, Amy proud, Grace proud, Rose happy |

## map: map schoolyard, base (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Delgado | I'm Marco’s dad. Marco says Mrs. Gregori is the toughest teacher in the whole school. | Tom happy, Amy surprised, Grace happy, Rose happy |
| Mr. Delgado | Marco also says she's his favorite. Please don't tell Marco I told you. | Tom happy, Amy loving, Grace happy, Rose happy |

## map: map schoolyard, when {from:5,flag:ch5-done} (chapter 5-10)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Delgado | Marco is reading at a third-grade level! Mrs. Gregori showed me the chart. There was a chart! | Tom happy, Amy proud, Grace happy, Rose happy |
| Mr. Delgado | I cried a little. In the minivan. Don't tell Marco. | Tom loving, Amy loving, Grace happy, Rose happy |

## map: map school, base (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Mrs. Kowalski | Kowalski. PTA president. I brought nine hundred cookies and a laminator. | Tom surprised, Amy unimpressed, Grace surprised, Rose surprised |
| Mrs. Kowalski | The sign-up sheet RAN AWAY. On little paper legs. I've never been so offended. | Tom unimpressed, Amy unimpressed, Grace surprised, Rose happy |

## map: map school, when {from:5,flag:ch5-done} (chapter 5-10)

| Speaker | Line | Reactions |
|---|---|---|
| Mrs. Kowalski | Thirty conferences, nine hundred cookies, one laminator. Everything went on schedule. MY schedule. | Tom unimpressed, Amy unimpressed, Grace unimpressed, Rose happy |
| Mrs. Kowalski | Tell Mrs. Gregori her bulletin board is the best in the building. Don't tell the other teachers. | Tom happy, Amy proud, Grace happy, Rose happy |

## map: map school, base (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Grandpa Ike | I'm here for my grandson. He's in the second grade. I was in the second grade here in 1956. | Tom happy, Amy happy, Grace surprised, Rose surprised |
| Grandpa Ike | The bells were wrong in 1956 too. Nobody fixed them. Things were simpler. | Tom unimpressed, Amy unimpressed, Grace unimpressed, Rose happy |

## map: map school, when {from:5,flag:ch5-done} (chapter 5-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grandpa Ike | They fixed the bells! In my lifetime! I'm going to tell everyone at the diner. | Tom happy, Amy happy, Grace happy, Rose happy |

## map: map school, base (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Halverson | Halverson. Fourth grade. I'm hiding in the staff room. That's allowed. It's in the contract. | Tom happy, Amy unimpressed, Grace unimpressed, Rose happy |
| Mr. Halverson | If you're hungry, the fridge is a minefield. Every lunch in there has a name on it. Read the labels. | Tom unimpressed, Amy unimpressed, Grace surprised, Rose surprised |

## map: map school, when {from:5,flag:ch5-done} (chapter 5-10)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Halverson | Conference night is over. I survived. I'm going to sit on this couch until Field Day. | Tom happy, Amy happy, Grace happy, Rose happy |

## map: map school, when {chapter:5,notFlag:ch5-done,flag:ch5-snack} (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Halverson | Deedee’s plate? Oh, everybody waits for Deedee’s plate. She brings one every conference night. | Tom loving, Amy loving, Grace happy, Rose happy |
| Mr. Halverson | Don't tell Gary. Gary eats the whole thing. | Tom happy, Amy happy, Grace happy, Rose happy |

## map: map bakery, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Bun | Welcome! Our bread is emotionally available. | Tom unimpressed, Grace unimpressed, Rose happy |
| Bun | The baguettes? A little crusty. | Tom unimpressed, Grace unimpressed, Rose happy |
| Bun | Today's special is yesterday's tomorrow toast. | Tom unimpressed, Grace surprised, Rose surprised |

## map: map library, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Page | Please whisper. The dictionaries are sleeping. | Tom unimpressed, Grace unimpressed, Rose happy |
| Page | Someone shelved a sandwich under 'S'. | Tom unimpressed, Grace surprised, Rose happy |
| Page | Technically correct. Deeply concerning. | Tom happy, Grace unimpressed, Rose happy |

## map: map greenhouse, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Fern | I name every plant here. | Tom happy, Grace happy, Rose happy |
| Fern | They're all called Steve. It saves time. | Tom unimpressed, Grace unimpressed, Rose happy |
| Fern | Except that one. That's Assistant Steve. | Tom happy, Grace unimpressed, Rose happy |

## map: map post, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Kit | Your parcel is arriving any Tuesday now. | Tom unimpressed, Grace unimpressed, Rose happy |
| Kit | The snails asked for smaller uniforms. | Tom unimpressed, Grace surprised, Rose happy |
| Kit | I deliver good news. Bad news has to walk. | Tom happy, Grace happy, Rose happy |

## map: map tea, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Oolong | The kettle has been gossiping again. | Tom unimpressed, Grace surprised, Rose surprised |
| Oolong | It spilled the tea. Literally. | Tom unimpressed, Grace unimpressed, Rose happy |
| Oolong | Please mind the dramatic biscuits. | Tom unimpressed, Grace unimpressed, Rose surprised |

## map: map tea, when {chapter:3,flag:ch3-tea} (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Oolong | The kettle is still going on about that man in the long coat. Gold coins. Paying double. | Tom surprised, Grace surprised, Rose surprised, Boppy unimpressed |
| Oolong | I told it to mind its own business. It's a kettle. It has no business. | Tom happy, Grace unimpressed, Rose happy, Boppy unimpressed |

## map: map observatory, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Luna | I've discovered a new constellation. | Tom happy, Grace surprised, Rose surprised |
| Luna | It's shaped exactly like my laundry. | Tom unimpressed, Grace unimpressed, Rose happy |
| Luna | Space is asking me to tidy up. | Tom happy, Grace unimpressed, Rose happy |

## map: map taxi, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Long Island Taxi. We go anywhere in town. Town is small, so mostly here. | Tom unimpressed, Grace unimpressed, Rose happy |
| Sal | I have one cab. It's cab seven. Cabs one through six are a dream I'm working on. | Tom happy, Grace unimpressed, Rose happy |
| Sal | You just rode with me. You tipped in sourdough starter. Odd. Generous. | Tom unimpressed, Grace happy, Rose happy |

## map: map amyhouse, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Justin | Tom. Hey. Hold this. No, the other end. Don't touch the copper. | Tom unimpressed, Grace happy, Rose happy |
| Justin | Rewiring the hallway. Amy wanted a dimmer. Amy gets a dimmer. | Tom loving, Grace happy, Rose happy |
| Justin | Grace, Rose, come here. Who's Daddy's favorite? Both. Correct. Go get 'em. | Tom loving, Grace loving, Rose loving |

## map: map amyhouse, revisit (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Justin | Long Island born. Country music raised. Don't ask me how. Nobody knows. | Tom unimpressed, Grace unimpressed, Rose happy |
| Justin | Big game tonight. If you hear yelling, that's me. If you hear crying, that's also me. | Tom happy, Grace unimpressed, Rose happy |
| Justin | Grace, you were amazing out there. Rose, you were also amazing. Also, why are you sticky? | Tom happy, Grace proud, Rose surprised |
| Justin | Fixed the porch light, the garbage disposal and the bunk bed. Before lunch. | Tom unimpressed, Grace proud, Rose happy |
| Justin | Every country song is about a truck, a dog or a girl. I got a truck and two girls. Living the song. | Tom happy, Grace loving, Rose loving |
| Justin | Amy says I never sit down. I sat down once. It was a playoff game. We lost. | Tom happy, Grace happy, Rose happy |
| Justin | Watch your step, Tom. That board is loose. I know. It's on the list. | Tom unimpressed, Grace unimpressed, Rose happy |
| Justin | Those two girls are the best thing I ever built. And I built that deck. | Tom loving, Grace loving, Rose loving |

## map: map amyhouse, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Grace! Rose! Did you stretch before all this adventuring? | Tom happy, Grace unimpressed, Rose surprised |
| Amy | Tom, I ran eight miles before you woke up. Just stating facts. | Tom unimpressed, Grace unimpressed, Rose happy |
| Amy | Justin is rewiring the hallway. Again. He says hi from the ladder. | Tom happy, Grace happy, Rose happy |

## map: map amyhouse, revisit (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Race you to the fountain. No? Then I win. | Tom unimpressed, Grace proud, Rose happy |
| Amy | Twelve kids in my room, and not one of them as wild as you two. Which I love. | Tom happy, Grace proud, Rose happy |
| Amy | Rose, where are your shoes? Oh. Good. | Tom happy, Grace unimpressed, Rose surprised |
| Amy | Grace, be nice to the slime. Then beat it. Those are the two rules. | Tom happy, Grace proud, Rose happy |
| Amy | Tom, if they come back faster than me, we need to talk. | Tom unimpressed, Grace happy, Rose happy |
| Amy | Justin says the hallway light is almost done. It's been almost done since June. | Tom unimpressed, Grace unimpressed, Rose happy |
| Amy | Did Boppy give you that cap? Don't let him near the pond. | Tom scared, Grace happy, Rose happy |
| Amy | One of my kids read a whole page out loud today. First time. I cried in the supply closet. | Tom loving, Grace loving, Rose happy |
| Amy | Rose. Big feelings are allowed. Throwing Lamby isn't. Come here. | Tom loving, Grace unimpressed, Rose sad |
| Amy | Grace, you don't have to be the best at it. You have to be the one who keeps going. Okay, now be the best at it. | Tom loving, Grace proud, Rose happy |

## map: map amyhouse, when {from:5,flag:ch5-done} (chapter 5-10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Thirty conferences. Zero tears. Well. One. Mine. In the minivan. | Tom loving, Grace happy, Rose happy |
| Amy | Tom. Thank you for coming. You're the good uncle. By a lot. | Tom loving, Grace happy, Rose happy |

## map: map grands, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | My favorite son! And my girls! Come here, come here. | Tom loving, Grace loving, Rose loving |
| Deedee | Rhubarb crisp in the oven, dinner on the stove, floors just mopped. Shoes off. Who wants a cookie? | Tom happy, Grace happy, Rose happy |
| Deedee | Grace, Rose, Deedee loves you to the moon and back. Say it back. Louder. | Tom loving, Grace loving, Rose loving |

## map: map grands, revisit (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | The tomatoes are coming in. You're going home with forty. | Tom surprised, Grace surprised, Rose happy |
| Deedee | I baked at five this morning. The neighbors have stopped asking why. | Tom unimpressed, Grace happy, Rose happy |
| Deedee | Tom, is that a bruise? Sit. Eat. Explain. | Tom scared, Grace surprised, Rose surprised |
| Deedee | To the moon and back, girls. The MOON. And BACK. | Tom loving, Grace loving, Rose loving |
| Deedee | Boppy says he's not feeling good. Boppy also won't stop fishing. | Tom unimpressed, Grace happy, Rose happy |
| Deedee | Grace, Rose, who wants to help Deedee frost something? | Tom happy, Grace happy, Rose happy |
| Deedee | Rhubarb crisp is cooling on the counter. Don't touch it. Okay, one corner. | Tom happy, Grace happy, Rose happy |
| Deedee | I already did my walk. Boppy did one lap around the recliner. | Tom happy, Grace happy, Rose happy |
| Deedee | Retired registered nurse. Tom calls me a registered nut. Tom is due for a checkup. | Tom unimpressed, Grace happy, Rose happy |
| Deedee | Sunday dinner is at six thirty. Don't make me call twice. | Tom unimpressed, Grace unimpressed, Rose happy |
| Deedee | I just cleaned the floors. Shoes OFF. | Tom scared, Grace scared, Rose scared |
| Deedee | A little glass of wine with dinner. Just one. Nurse's orders. | Tom happy, Grace unimpressed, Rose happy |
| Deedee | Have you seen my reading glasses? I had them a minute ago. I've looked everywhere. Twice. | Tom happy, Grace happy, Rose happy |
| Deedee | Found my glasses. They were in the fridge. Don't ask. Who wants a cookie? | Tom happy, Grace happy, Rose happy |

## map: map grands, hug:0 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Hugs for everyone. There. All better. | Tom loving, Grace loving, Rose loving |

## map: map grands, hug:1 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Hugs for everyone, just because. To the moon and back. | Tom loving, Grace loving, Rose loving |

## map: map grands, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Tom! Good. I'm not feeling good. Something with the stomach. Sit, I'll tell you about it. | Tom unimpressed, Grace happy, Rose happy |
| Boppy | Grace, Rose, come give Boppy a hug. Gently. The stomach. And slow down, you two walk too fast. | Tom happy, Grace loving, Rose loving |
| Boppy | Did I ever tell you I was a champion cross country runner in college? Your mother has heard it. Sit down. | Tom unimpressed, Grace unimpressed, Rose happy |
| Boppy | Here, take my spare cap. For luck. I caught a twelve pounder in it. Nine. It was a big six. | Tom happy, Grace unimpressed, Rose surprised |

## map: map grands, revisit (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Assistant Deputy Warden at Rikers. All those years, nobody got past me. Except that fish. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Boppy | At Rikers we did headcounts. Grace, one. Rose, two. Tom, you're dragging. | Tom unimpressed, Grace proud, Rose proud |
| Boppy | In college I ran cross country. Champion. Through the woods, up the hills, never breathed hard. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Boppy | Did I tell you about the championship race? I did? Sit down. I'll tell you again. | Tom unimpressed, Grace unimpressed, Rose happy |
| Boppy | I'm not feeling good. I was fine an hour ago. Then I had a pepper. | Tom unimpressed, Grace happy, Rose happy |
| Boppy | Slow down, Tom. Who walks this fast? I was a champion runner and I never walked this fast. | Tom unimpressed, Grace happy, Rose happy |
| Boppy | Deedee says I'm not allowed near the pond. The pond says otherwise. | Tom happy, Grace happy, Rose happy |
| Boppy | Grace, Rose, who's the strongest grandpa? Correct. Now help me up. | Tom happy, Grace happy, Rose happy |
| Boppy | She's looking for her glasses again. They're on her head. I'm not saying anything. I'm saying it to you. | Tom happy, Grace happy, Rose happy |

## map: map elliehouse, base (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Tom. Stand up straight. There. Now you look like someone I'm related to. | Tom unimpressed, Grace happy, Rose happy |
| Aunt Ellie | Yes, Deedee has an aunt. Yes, I'm older. No, you may not ask by how much. | Tom happy, Grace surprised, Rose surprised |
| Aunt Ellie | I've been to Paris eleven times, darling. Long Island is charming. But one must explore the world. | Tom unimpressed, Grace surprised, Rose surprised |

## map: map elliehouse, revisit (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Deedee keeps offering me rhubarb crisp. I keep saying yes. That's called manners. | Tom happy, Grace happy, Rose happy |
| Aunt Ellie | Boppy says his stomach hurts. I told him to stop eating peppers. He looked at me like I insulted his mother. | Tom happy, Grace happy, Rose happy |
| Aunt Ellie | Grace, darling, that outfit is wonderful. Rose, darling, that outfit is a choice. A brave one. | Tom happy, Grace proud, Rose proud |
| Aunt Ellie | Wisdom is remembering what went wrong and saying so before it happens again. | Tom unimpressed, Grace unimpressed, Rose surprised |
| Aunt Ellie | Never apologize for being early, dressing up, or leaving a bad party. | Tom happy, Grace proud, Rose surprised |
| Aunt Ellie | Tom, you have a good heart. Now do something about the shoes. | Tom unimpressed, Grace happy, Rose happy |
| Aunt Ellie | Deedee says I'm sharp. I say everyone else is a little dull. | Tom happy, Grace happy, Rose happy |
| Aunt Ellie | A good scarf fixes almost anything. Not Boppy. But almost anything. | Tom happy, Grace happy, Rose happy |
| Aunt Ellie | Somebody once told me I was too much. I outlived him. I dressed beautifully at the funeral. | Tom surprised, Grace surprised, Rose surprised |

## map: map blvd, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Skye | I'm filming a day-in-my-life video. I live in the lofts. | Tom unimpressed, TNB happy, Nara happy |
| Skye | This is the day. You're in my life now. | Tom unimpressed, TNB happy, Nara happy |
| Skye | Say hi to my eleven followers. | Tom unimpressed, TNB happy, Nara happy |
| Chet | I'm an actor. Well. I'm an actor who parks cars at a tower. | Tom happy, TNB happy, Nara happy |
| Chet | I had a callback last week. For a cereal. | Tom happy, TNB happy |
| Chet | The cereal went with someone else. It happens. | Tom sad, TNB sad, Nara sad |
| Wes | I'm a screenwriter. I live in the lofts, two floors down from your boyfriend. | Tom happy, TNB surprised, Nara happy |
| Wes | Draft forty-one. It's about a man who writes screenplays. It's very personal. | Tom unimpressed, TNB happy |
| Wes | He lends me a mug when I'm stuck. I'm stuck a lot. I have nine of his mugs. | Tom happy, TNB unimpressed, Nara happy |
| Boomie | TOM! Get over here. Hug. Mmm-hmm. There it is. | Tom loving, TNB happy, Nara happy |
| Boomie | I leave Tuesday for the tour. Atlanta first, then Chicago, then Nashville. One suitcase. Nine dresses. | Tom happy, TNB happy, Nara happy |
| Boomie | Friday is the home show, right here downtown. You're in the front row. I wrote your name on the seat. | Tom loving, TNB happy, Nara happy |
| Boomie | Oh, the sun's coming up on my street. Hallelujah, hallelujah! Sorry. I sang that whole sentence. | Tom happy, TNB happy, Nara surprised |

## map: map blvd, revisit (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Boomie | La la LAAA! Oops. A car alarm went off. That one is on me. | Tom surprised, TNB happy, Nara scared |
| Boomie | Atlanta, then Chicago, then Nashville. I keep saying it out loud so I don't forget. | Tom happy, TNB happy, Nara happy |
| Boomie | Friday night, front row. I don't start the show without you. Okay, I start. But I look for you. | Tom loving, TNB loving, Nara happy |
| Boomie | How's TNB? Tell him there's a seat for him too. Two front row seats. Don't make me beg. | Tom happy, TNB loving, Nara happy |
| Boomie | Oh, when the morning comes, I'm gonna rise. Rise, rise, rise! Sing with me, Tom. Amen! | Tom scared, TNB happy, Nara happy |
| Boomie | I open with a hymn my grandmother sang. She'd say I'm doing it too loud. She'd be right. | Tom loving, TNB loving, Nara happy |
| Boomie | Sol says he parks his cab outside to hear me warm up. I say he's just early. | Tom happy, TNB happy, Nara happy |
| Boomie | You text me when you land. I mean it. A song is also fine. | Tom loving, TNB happy, Nara happy |
| Boomie | I sang in the shower this morning. The whole building clapped. Thin walls. | Tom happy, TNB happy, Nara happy |
| Boomie | Hmm hmm hmmm. Oh, I was humming? I'm always humming. | Tom happy, TNB happy, Nara happy |

## map: map blvd, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Bev | I came all the way from Ohio. I rode the tiny orange railway up the hill. | Tom happy, TNB happy, Nara happy |
| Bev | It went one block. It cost a dollar. Best dollar of my life. | Tom happy, TNB happy, Nara happy |
| Bev | Then I ate a pupusa in a market from 1917. I may never go home. | Tom loving, TNB loving, Nara happy |

## map: map jpark, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Tom! Hi! Sorry, I'm mid-sentence in my head. I'm filing a story on AI in classrooms. | Tom happy, TNB happy, Nara happy |
| Olivia | The kids use it to write the homework. The teachers use it to grade the homework. Nobody is in the room. | Tom unimpressed, TNB unimpressed, Nara happy |
| Olivia | MICHAEL. Can you grab Isla? She has a leaf. She's going to eat the leaf. | Tom happy, TNB happy, Nara surprised |

## map: map jpark, revisit (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | My editor wants a piece on AI taking jobs. I said I'd write it myself. While I still can. | Tom unimpressed, TNB unimpressed, Nara happy |
| Olivia | Michael, can you take Lachlan? He's licking the fence. Thank you, babe. | Tom happy, TNB happy, Nara happy |
| Olivia | Everybody asks if robots will take their jobs. I tell them a robot still can't fold a fitted sheet. Neither can I. | Tom happy, TNB happy, Nara happy |
| Olivia | I interviewed a chatbot today. It was very polite. Too polite. I didn't trust it. | Tom unimpressed, TNB scared, Nara happy |
| Olivia | Michael! Isla is near the curb. Okay. Never mind. Thank you, babe. | Tom happy, TNB happy, Nara surprised |
| Olivia | Did Nara eat today? Tell me the truth. Michael, did Nara eat? | Tom scared, TNB happy, Nara unimpressed |
| Olivia | Teachers aren't getting replaced. They're getting a very confident new student who never did the reading. | Tom happy, TNB happy, Nara happy |

## map: map jpark, when {test:S=>(S.chapter===2&&!!S.flags['ch2-done'])||(S.chapter===4&&!!S.flags['ch4-done']} (chapter 2,4)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Tom! You kept Nara alive! Did she eat? She didn't eat, did she. | Tom proud, TNB happy, Nara unimpressed |
| Olivia | The desert was gorgeous. Lachlan found a rock. Isla ate a rock. Different rock. | Tom unimpressed, TNB happy, Nara happy |
| Olivia | MICHAEL. Can you grab Isla? She's going for the dog bowl. | Tom happy, TNB happy, Nara surprised |

## map: map jpark, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Michael | Hey, Tom. Good to see you. Please ignore the cracker crumbs. They live here now. | Tom happy, TNB happy, Nara happy |
| Michael | I work at Meta. I build things that connect people. Right now I'm connecting a four-year-old to a nap. | Tom happy, TNB happy, Nara happy |
| Michael | I heard Olivia say Michael. Whatever it is, I'm on it. Isla, that is not a snack. | Tom happy, TNB happy, Nara happy |

## map: map jpark, revisit (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Michael | Yes, Olivia. Heard you. Handled. Lachlan, we do not lick the fence. | Tom happy, TNB happy, Nara happy |
| Michael | Lachlan wants to know if Nara is his dog. I said it's complicated. It's not. It's his dog. | Tom loving, TNB loving, Nara loving |
| Michael | Isla said her first word last week. It was no. She uses it very well. | Tom happy, TNB happy, Nara happy |
| Michael | I took a meeting today with Isla on my lap. She muted me. Best meeting of the quarter. | Tom happy, TNB happy, Nara happy |
| Michael | My arms have never been stronger. I haven't lifted a weight in four years. | Tom happy, TNB happy, Nara happy |
| Michael | Olivia writes about AI taking jobs. Nobody is coming for the job of a dad. Not even AI wants that! | Tom happy, TNB happy, Nara happy |

## map: map jpark, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Washington | Bought this house in 1979. Same porch, same chair, same view. | Tom happy, TNB happy, Nara happy |
| Mr. Washington | Back then you could hear zydeco from the boulevard on a Saturday night. | Tom loving, TNB loving, Nara happy |
| Mr. Washington | You're the one fixing up the green house? Keep the old windows. They're better than the new ones. | Tom proud, TNB happy, Nara happy |

## map: map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Washington | Back in 1979, this whole block... | Tom happy, TNB unimpressed, Nara happy |
| Mr. Washington | ... | Tom surprised, TNB scared, Nara scared |
| Mr. Washington | Such a nice afternoon. It should always be this afternoon. Nobody needs to get any older. | Tom scared, TNB scared, Nara scared |

## map: map jpark, when {chapter:2,flag:ch2-clear} (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Washington | Where was I? Oh. 1979. This whole block smelled like gumbo on a Saturday night. | Tom happy, TNB happy, Nara happy |
| Mr. Washington | That smog had me stuck on one sentence for an hour. At my age I don't have hours to spare. | Tom happy, TNB happy, Nara happy |
| Mr. Washington | Thank you, Tom. And your young man. And the dog. Especially the dog. | Tom loving, TNB loving, Nara proud |

## map: map jpark, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Marisol | I'm walking my dog. He's somewhere. | Tom unimpressed, TNB happy, Nara surprised |
| Marisol | My grandparents rented on this block. Now I rent on this block. We're a tradition. | Tom happy, TNB happy, Nara happy |
| Marisol | There he is. No. That's a lemon. | Tom happy, TNB happy, Nara happy |

## map: map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Marisol | I'm walking my dog. I've always been walking my dog. | Tom scared, TNB scared, Nara scared |
| Marisol | I'll always be walking my dog. Isn't that nice? | Tom scared, TNB scared, Nara scared |

## map: map jpark, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Larry | I'm blowing leaves. | Tom unimpressed, TNB unimpressed, Nara happy |
| Larry | Onto the next yard. | Tom unimpressed, TNB unimpressed, Nara happy |
| Larry | Tomorrow, they blow them back. It's a whole system. | Tom happy, TNB happy, Nara happy |

## map: map jpark, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Larry | I'm blowing leaves. The same leaf. Over and over. | Tom scared, TNB scared, Nara scared |
| Larry | It never lands. It never has to. Very peaceful. | Tom scared, TNB scared, Nara scared |

## map: map studio, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Ray | Sunset Gold Studios. Closed set. Name? | Tom unimpressed, TNB unimpressed, Nara happy |
| Ray | Tom. Plus one dog. Plus one boyfriend who already works here. Fine. Go on in. | Tom unimpressed, TNB happy, Nara happy |
| Ray | Nobody gets past Ray. Except the dog. The dog got past Ray. Don't tell anyone. | Tom happy, TNB happy, Nara proud |

## map: map studio, when {from:4,flag:ch4-done} (chapter 4-10)

| Speaker | Line | Reactions |
|---|---|---|
| Ray | Ray here. Shoot wrapped. Nobody got past me. Except the megaphone. And the moths. And the dog. | Tom happy, TNB happy, Nara proud |
| Ray | Good job, Tom. Don't tell anyone I said good job. | Tom proud, TNB happy, Nara happy |

## map: map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Ray | Nobody came through my gate. Nobody with legs. | Tom unimpressed, TNB surprised, Nara happy |
| Ray | Little things, though. Buzzing. Clapping. One of them asked me for a compliment. I said no. I regret it. | Tom sad, TNB sad, Nara happy |

## map: map studio, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Toni | Craft services! Take a bagel. Take two. Nobody is counting. I'm counting. | Tom happy, TNB happy, Nara happy |
| Toni | The crew eats like a swarm of locusts. Polite locusts. With lanyards. | Tom happy, TNB happy, Nara happy |
| Kiki | Kiki. Production assistant. I have a headset, three radios and zero answers. | Tom happy, TNB happy, Nara happy |
| Kiki | If anybody asks, I'm walking somewhere important. I'm always walking somewhere important. | Tom happy, TNB happy, Nara happy |

## map: map studio, when {from:4,flag:ch4-done} (chapter 4-10)

| Speaker | Line | Reactions |
|---|---|---|
| Kiki | We WRAPPED! On time! Well. Four hours late. Which is on time for us. | Tom happy, TNB proud, Nara happy |
| Kiki | I'm going to sleep for a week. In my car. With the headset on. | Tom happy, TNB happy, Nara happy |

## map: map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Kiki | Rack two is still missing. Forty costumes. The actors are filming in bathrobes. | Tom surprised, TNB scared, Nara happy |
| Kiki | Last thing on my radio before the static was the Stage 7 fog machine. It turned itself on. | Tom surprised, TNB scared, Nara scared |

## map: map studio, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Dana | Dana Park. Director. First feature. Please don't ask me how it's going. | Tom loving, TNB loving, Nara happy |

## map: map studio, when {from:4,flag:ch4-done} (chapter 4-10)

| Speaker | Line | Reactions |
|---|---|---|
| Dana | We got the shot. All of them. Even the one with the horse. | Tom happy, TNB proud, Nara happy |
| Dana | Tell TNB the costumes looked incredible. Tell him I said incredible. Tell him twice. | Tom loving, TNB proud, Nara happy |

## map: map studio, when {chapter:4,notFlag:ch4-done,flag:ch4-gate} (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Dana | Without wardrobe there's no shoot. Without a shoot there's no movie. | Tom sad, TNB sad, Nara sad |
| Dana | Without a movie I go back to directing car commercials. I love cars. I don't love talking cars. | Tom happy, TNB sad, Nara happy |

## map: map oakpark, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Bernadette | Bernadette. Neighborhood Watch Captain, nineteen years. Nothing gets past me. | Tom unimpressed, TNB happy, Nara happy |
| Bernadette | Except squirrels. I'm working on it. | Tom happy, TNB happy, Nara angry |

## map: map coffee, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Juniper | Welcome to Golden Hour. Every hour is golden hour if you believe. | Tom unimpressed, TNB happy, Nara happy |
| Juniper | Our oat milk is oat-adjacent. | Tom unimpressed, TNB happy, Nara happy |
| Juniper | Your name is Tom? I wrote TAM. It's basically the same. | Tom unimpressed, TNB happy, Nara happy |

## map: map ramen, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Kenji | Irasshaimase! Welcome! | Tom happy, TNB happy, Nara happy |
| Kenji | Tom-san, your Japanese is very good. | Tom proud, TNB happy, Nara happy |
| Kenji | It's not. But you're trying very hard, and I respect that. | Tom happy, TNB happy, Nara happy |

## map: map juicebar, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sage | Welcome. Breathe in. Now order. | Tom unimpressed, TNB happy, Nara happy |
| Sage | We opened in March. The pupuseria next door has been here since 1994. We're learning a lot. | Tom happy, TNB happy, Nara happy |
| Sage | Today's special is celery. Doña Carmen says that's not a meal. She's right. | Tom unimpressed, TNB happy, Nara happy |

## map: map wardrobe, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Marguerite | Backlot Wardrobe. If it was worn on screen, it lived here first. | Tom happy, TNB proud, Nara happy |
| Marguerite | You're Tom? TNB's Tom! He found a shoe for us once. A lead actor's shoe. Four minutes before the take. | Tom loving, TNB proud, Nara happy |
| Marguerite | We still talk about the shoe. Tell him there's always a rack here with his name on it. | Tom loving, TNB loving, Nara happy |

## map: map cinema, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Dolores | Welcome to the Starlite. Built in 1931. The popcorn is newer. A little. | Tom happy, TNB happy, Nara happy |
| Dolores | I have run the projector here for forty years. I've seen every movie twice. | Tom happy, TNB surprised, Nara happy |
| Dolores | Tonight it's a horror double feature. Your boyfriend would love it. You'd watch it through your fingers. | Tom unimpressed, TNB happy, Nara happy |

## map: map boards, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Dash | Board Room. We sell boards. We also sit on them. | Tom unimpressed, TNB happy, Nara happy |
| Dash | TNB? Longboard guy? He bombed Fargo Street once. No brakes. Legend. | Tom scared, TNB proud, Nara happy |
| Dash | If you see him, tell him the wheels he ordered came in. The green ones. | Tom happy, TNB happy, Nara happy |

## map: map lacab, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Angel City Cab Co. I'm Sol. Sal's cousin. Also one cab. | Tom happy, TNB happy, Nara happy |
| Sol | Cab eight. Sal has cab seven. We don't talk about what happened to the other six. | Tom surprised, TNB surprised, Nara happy |
| Sol | I go to the airport, the airport, and sometimes the airport. | Tom unimpressed, TNB happy, Nara happy |

## map: map casa, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Mrs. Alvarez | TEN. Ten people in a two-bedroom house from 1912. One bathroom. ONE. | Tom surprised, TNB surprised, Nara scared |
| Mrs. Alvarez | Tony, feet off my table! Kevin, the baby isn't a football! Mateo, give Abuela the remote! ...Tom, mijo, sit. If you can find a chair. | Tom happy, TNB happy, Nara scared |
| Mrs. Alvarez | Everybody says, 'Mama, the house is so full of love.' It's full of SOMETHING. Take tamales. Please. I need the room in my fridge. | Tom happy, TNB happy, Nara happy |
| Don Beto | I've been in this chair since the game started. Which game? Yes. | Tom happy, TNB happy, Nara happy |
| Don Beto | Ten people. I counted once. Then I lost count. Then I took a nap. | Tom happy, TNB happy, Nara happy |
| Tony | Me and Yesenia are saving for our own place. In this market? We'll be here until Mateo goes to college. | Tom sad, TNB sad, Nara happy |
| Tony | The two houses next door sold for more than this whole block cost in 1990. My mom isn't okay about it. | Tom sad, TNB sad, Nara happy |
| Yesenia | Sofi, no. Sofi. SOFI. ...She bit something. We don't have a dog. I don't know what she bit. | Tom surprised, TNB scared, Nara surprised |
| Yesenia | Baby Lupita is finally asleep. If you wake her, you're moving in. | Tom scared, TNB scared, Nara happy |
| Claudia | Night shift nurse. I sleep in the bathtub. It's the only room with a lock. | Tom surprised, TNB surprised, Nara happy |
| Claudia | Until somebody needs the bathroom. Somebody always needs the bathroom. | Tom sad, TNB happy, Nara happy |
| Kevin | I share the bunk bed with Uncle Tony's exercise bike. | Tom unimpressed, TNB happy, Nara happy |
| Kevin | It's not a metaphor. The bike is on the top bunk. | Tom happy, TNB happy, Nara happy |
| Daisy | I'm making a documentary about this house. It's a horror movie. | Tom happy, TNB proud, Nara happy |
| Daisy | Scene one: the bathroom line. Scene two: who ate Abuela's last concha. | Tom happy, TNB happy, Nara happy |
| Mateo | Truck! TRUCK! | Tom happy, TNB happy, Nara happy |
| Mateo | Ba! Ba! ...Truck. | Tom loving, TNB loving, Nara happy |
| Sofi | I'm a dinosaur. RAWR. | Tom scared, TNB scared, Nara surprised |
| Sofi | Abuela says no more dinosaurs inside. I'm a quiet dinosaur. rawr. | Tom happy, TNB happy, Nara happy |

## map: map lofts, base (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Well, well, well... | Tom loving, Nara happy |
| TNB | Hey, you. Did you eat? I made a bowl. I also made a bowl. Pottery joke. | Tom happy, Nara happy |
| TNB | Welcome to the loft. Kiln by one window, wheel by the other, garment bags everywhere else. Spring Street, baby. | Tom loving, Nara happy |
| TNB | Take my jacket. It gets cold up in Griffith Park at night, and a cold Tom is a no-go. | Tom loving, Nara happy |

## map: map lofts, revisit (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Took the longboard down Spring Street this morning. Smooth. There's a crack by Fourth Street I've named. | Tom scared, Nara happy |
| TNB | Threw six mugs this morning. The glaze came out of the kiln like sea glass. Come look before you claim one. | Tom proud, Nara happy |
| TNB | Go on, I'll be right here. I'm pot-sitive about it. | Tom unimpressed, Nara happy |
| TNB | Horror movie tonight. You pick. You always pick the scary one and then hold my arm the whole time. | Tom scared, Nara happy |
| TNB | Watered your plants on 2nd Ave. The fern asked about you. I said you're fine. | Tom loving, Nara happy |
| TNB | Rode the train to the clay studio. Forty minutes. Best forty minutes of my day. Met a man who knows every line. | Tom happy, Nara happy |
| TNB | The slime? It just needs someone to mold it. I have more of these. You know I do. | Tom unimpressed, Nara happy |
| TNB | Long day on set. Eleven costume changes. One actor lost a shoe. I found it. I always find it. | Tom proud, Nara happy |
| TNB | Be careful out there. I like you un-cracked. | Tom loving, Nara happy |

## map: map lofts, base (chapter 3-5)

| Speaker | Line | Reactions |
|---|---|---|
| Jojo | Oh. Hi. You must be Tom. I'm Jojo. TNB's sister. | Tom happy, TNB happy, Nara happy |

## map: map library, when {from:7,flag:ch7-done} (chapter 7-10)

| Speaker | Line | Reactions |
|---|---|---|
| Page | It's quiet. Properly quiet. The good kind. Thank you, Tom. | Tom happy, Grace proud, Rose happy |
| Page | Story time is Saturdays now. The Unread asked for Grace. By name. | Tom proud, Grace proud, Rose surprised |

## map: map library, when {chapter:7,notFlag:ch7-done,flag:ch7-page} (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Page | The Stacks are through the staff door. Please be careful. And please don't answer the books. | Tom proud, Grace proud, Rose scared |
| Page | I'm fine. Everything is fine. The dictionaries haven't slept in a week. | Tom unimpressed, Grace unimpressed, Rose scared |

## map: map library, when {chapter:7,notFlag:ch7-done} (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Page | It's fine. Everything is fine. Please whisper. | Tom unimpressed, Grace unimpressed, Rose happy |
| Page | ...Did you hear that? That wasn't me. I'd know my own shush. | Tom surprised, Grace scared, Rose scared |

## map: map observatory, when {from:9,flag:ch9-done} (chapter 9-10)

| Speaker | Line | Reactions |
|---|---|---|
| Luna | The moon is back. I looked at it for an hour. I didn't even write anything down. | Tom happy, Deedee happy, Boppy happy, Grace happy, Rose happy |
| Luna | I swept the club stairs. Twelve years of wondering, and it was just a very dusty party. | Tom happy, Deedee happy, Boppy unimpressed, Grace happy, Rose happy |

## map: map observatory, when {chapter:9,notFlag:ch9-done,flag:ch9-luna} (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Luna | The door is open. Twelve years I have swept this floor, and that door is open. | Tom surprised, Deedee surprised, Boppy unimpressed |
| Luna | If you see the moon up there, please tell it to come home. My telescope misses it. | Tom loving, Deedee loving, Boppy unimpressed |

## map: map observatory, when {chapter:9,notFlag:ch9-done} (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Luna | There's supposed to be a full moon tonight. My telescope can't find it. | Tom surprised, Grace surprised, Rose surprised |
| Luna | It's not behind a cloud. It's just not THERE. I checked four times. | Tom surprised, Grace scared, Rose scared |

## map: map grands, when {chapter:9,notFlag:ch9-done,flag:ch9-letter} (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The girls and I are playing cards. I'm winning. I'm also cheating. They're learning a great deal. | Tom happy, Grace unimpressed, Rose proud, Deedee happy, Boppy happy |
| Aunt Ellie | Go. Dance. Somebody in this family should get to finish a party at the Moon Club. | Tom loving, Deedee loving, Boppy unimpressed, Grace sad, Rose sad |

## map: map elliehouse, when {from:9,flag:ch9-done} (chapter 9-10)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | My coat. Ticket seven. I left it at the last dance and never went back for it. | Tom loving, Grace surprised, Rose surprised |
| Aunt Ellie | I had a date with a man who turned out to be a disappointment. The coat wasn't. Keep it warm for me. | Tom happy, Grace unimpressed, Rose surprised |

## map: map jpark, when {from:8,flag:ch8-done} (chapter 8-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Nara ate! A whole plate! Off your plate, but still! I'm counting it! | Tom proud, TNB happy, Nara proud |
| Olivia | Michael, Isla has a roll in each hand. That's fine. That's a balanced meal. | Tom happy, TNB happy, Nara happy |

## map: map jpark, when {chapter:8,notFlag:ch8-done,flag:ch8-block} (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Did she eat? She won't eat cold food. She won't eat warm food either. She eats off YOUR plate, Tom. | Tom unimpressed, TNB happy, Nara unimpressed |
| Olivia | My lasagna is a brick. A cold lasagna brick. Michael is guarding it with his life. | Tom sad, TNB happy, Nara unimpressed |

## map: map jpark, when {from:6,flag:ch6-done} (chapter 6-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Nara slept! Twelve hours! She's snoring like Michael. | Tom happy, TNB happy, Nara proud |
| Olivia | Thank you, Tom. Tell TNB thank you. Tell the squirrels nothing. | Tom loving, TNB loving, Nara happy |

## map: map jpark, when {chapter:6,notFlag:ch6-done,flag:ch6-nara} (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Is she okay? Is she eating? She's not eating, is she. | Tom scared, TNB scared, Nara unimpressed |
| Olivia | Michael, the squirrel is back on the fence. Don't make eye contact. | Tom unimpressed, TNB scared, Nara angry |

## map: map jpark, when {from:8,flag:ch8-done} (chapter 8-10)

| Speaker | Line | Reactions |
|---|---|---|
| Michael | Best potluck ever. Lachlan fell asleep in the bread basket. | Tom happy, TNB happy, Nara happy |

## map: map jpark, when {chapter:8,notFlag:ch8-done,flag:ch8-block} (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Michael | Cold lasagna, one diaper bag, and Isla eating the tablecloth. We're thriving. | Tom happy, TNB happy, Nara happy |

## map: map jpark, when {from:6,flag:ch6-done} (chapter 6-10)

| Speaker | Line | Reactions |
|---|---|---|
| Michael | Lachlan got his truck back. He hasn't put it down. He's eating cereal with one hand. | Tom loving, TNB loving, Nara happy |

## map: map jpark, when {chapter:6,notFlag:ch6-done,flag:ch6-nara} (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Michael | Zero car keys and one very sticky toddler. Wait. Keys. Gutter. Right. | Tom unimpressed, TNB surprised, Nara happy |

## map: map jpark, when {from:8,flag:ch8-done} (chapter 8-10)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Washington | That coat looks right on you. My daddy would say so. Then he'd say stand up straight. | Tom proud, TNB loving, Nara happy |
| Mr. Washington | Forty loaves. I ate four. Don't tell Bernadette. | Tom happy, TNB happy, Nara happy |

## map: map jpark, when {chapter:8,notFlag:ch8-done} (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Washington | Forty years I've made gumbo for this potluck. Today the stove won't light. The flame just leans. Toward the boulevard. | Tom sad, TNB surprised, Nara sad |
| Mr. Washington | My daddy drove the 7 line out of the old Car Barn. He said the stove down there could warm a whole street. | Tom surprised, TNB surprised, Nara happy |

## map: map jpark, when {from:6,flag:ch6-done} (chapter 6-10)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Washington | My reading glasses! Found in a hole in the park. I won't ask. | Tom happy, TNB happy, Nara proud |
| Mr. Washington | Back in 1979 the squirrels were polite. They waited until you finished your sandwich. | Tom happy, TNB happy, Nara angry |

## map: map jpark, when {chapter:6,notFlag:ch6-done} (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Mr. Washington | Somebody took my reading glasses off the porch rail. I have read the same headline for three days. | Tom sad, TNB sad, Nara sad |
| Mr. Washington | I think it says WEATHER. It might say WHETHER. | Tom happy, TNB happy, Nara happy |

## map: map jpark, when {from:8,flag:ch8-done} (chapter 8-10)

| Speaker | Line | Reactions |
|---|---|---|
| Marisol | My dog ate a whole loaf. I found him. He was under the table. He's always under the table. | Tom happy, TNB happy, Nara unimpressed |

## map: map jpark, when {chapter:8,notFlag:ch8-done} (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Marisol | My tamales are cold. My dog is cold. My dog is somewhere. He's probably cold. | Tom sad, TNB sad, Nara sad |

## map: map jpark, when {from:6,flag:ch6-done} (chapter 6-10)

| Speaker | Line | Reactions |
|---|---|---|
| Marisol | Eleven tennis balls! Back! My dog is beside himself. Wherever he is. | Tom happy, TNB happy, Nara proud |

## map: map jpark, when {chapter:6,notFlag:ch6-done} (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Marisol | Every tennis ball on the block. Gone. My dog has nothing to ignore now. | Tom sad, TNB sad, Nara sad |
| Marisol | There he is. No. That's a squirrel. It's looking at me. | Tom unimpressed, TNB scared, Nara angry |

## map: map jpark, when {chapter:8,notFlag:ch8-done} (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Larry | I'm blowing leaves. They're frosty. In LA. I have questions. | Tom surprised, TNB surprised, Nara scared |

## map: map jpark, when {chapter:6,notFlag:ch6-done} (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Larry | I'm blowing leaves. The squirrels keep blowing them back. | Tom unimpressed, TNB happy, Nara angry |
| Larry | It's a whole system. Their system is better. | Tom happy, TNB happy, Nara angry |

## map: map oakpark, when {from:6,flag:ch6-done} (chapter 6-10)

| Speaker | Line | Reactions |
|---|---|---|
| Bernadette | Case closed. I've filed my report. With myself. I approved it. | Tom unimpressed, TNB happy, Nara happy |
| Bernadette | I said they were organized. Nobody believed me. Write that down. | Tom unimpressed, TNB proud, Nara happy |
| Bernadette | You're a good neighbor, Tom. So is the dog. Mostly the dog. | Tom loving, TNB happy, Nara proud |

## map: map oakpark, when {chapter:6,notFlag:ch6-done,flag:ch6-park} (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Bernadette | The lookouts first. Playground, garden, picnic tables. Then Nara digs. | Tom proud, TNB proud, Nara proud |
| Bernadette | Then the tree. There's a knock. I have only ever heard parts of it. | Tom surprised, TNB surprised, Nara surprised |

## map: map lofts, lines (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Jojo | He talks about you a lot. Mostly "Tom said" and then a very long pause. Pottery pause. I know it well. | Tom scared, TNB scared, Nara happy |
| Jojo | I stopped by to borrow a mug. That was a while ago. I'm still on the couch. It's a good couch. | Tom happy, TNB unimpressed, Nara happy |
| Jojo | We play frisbee golf on Sundays. He calls it a friendly round. I call it a round. | Tom happy, TNB happy, Nara happy |

## map: map lofts, revisit (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Jojo | Sunday. Frisbee golf. Eighteen holes. He stops for a snack at every one. I let him. I have time. | Tom happy, TNB scared, Nara happy |
| Jojo | My brother made this mug. It is a very good mug. Don't tell him I said that. He will make me three more. | Tom happy, TNB proud, Nara happy |
| Jojo | No rush on anything. That's kind of my whole thing. | Tom happy, TNB happy, Nara happy |
| Jojo | Nice to finally have you in the family. Or near it. We'll see how the Sundays go. | Tom loving, TNB loving, Nara happy |

## map: map tower, lines (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Priya | 34th floor. From my desk I can see Griffith Park. I've never been to Griffith Park. | Tom sad, TNB happy, Nara happy |
| Priya | My dog is named Bagel. He has more friends in this building than I do. | Tom happy, TNB happy, Nara surprised |
| Priya | The pool is on the roof. Nobody swims. Everyone takes photos of the pool. | Tom unimpressed, TNB happy, Nara happy |

## map: map creole, lines (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Miss Odette | Sit down, baby. Gumbo's on. It's been on since six. | Tom loving, TNB loving, Nara happy |
| Miss Odette | My mama opened this kitchen when this stretch was Little New Orleans. Folks came from Louisiana and brought the food. | Tom happy, TNB happy, Nara happy |
| Miss Odette | Pralines by the register. Take two. One for you, one for that boyfriend who keeps coming in for the red beans. | Tom loving, TNB scared, Nara happy |

## map: map creole, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Miss Odette | Stirring. Stirring. | Tom scared, TNB scared, Nara scared |
| Miss Odette | The gumbo never has to be done, baby. Isn't that nice? Nothing ever has to be done. | Tom scared, TNB scared, Nara scared |

## map: map creole, when {chapter:2,flag:ch2-clear} (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Miss Odette | That smog had me stirring one pot for an hour. Best roux I ever made, though. | Tom happy, TNB happy, Nara happy |
| Miss Odette | Sit. Eat. You and that boyfriend earned a bowl today. | Tom loving, TNB loving, Nara happy |

## map: map pupuseria, lines (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Doña Carmen | Bienvenidos! Pupusas revueltas, and curtido on the side. Curtido isn't optional. | Tom happy, TNB happy, Nara happy |
| Doña Carmen | I came from San Salvador in 1991. This comal came with me in a suitcase. | Tom happy, TNB surprised, Nara happy |
| Doña Carmen | The juice bar next door asked me what a pupusa is. I gave them three. Now they ask every day. | Tom happy, TNB happy, Nara happy |

## map: map pupuseria, when {chapter:2,flag:ch2-smog,notFlag:ch2-clear} (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Doña Carmen | The pupusas are fine. Everything is fine. | Tom scared, TNB scared, Nara scared |
| Doña Carmen | It's always this afternoon. Why'd I ever flip them? | Tom scared, TNB scared, Nara scared |

## map: map pupuseria, when {chapter:2,flag:ch2-clear} (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Doña Carmen | I left them on the comal the whole time. They came out perfectly crispy, actually. | Tom happy, TNB happy, Nara happy |
| Doña Carmen | Don't tell the juice bar. They'll want the recipe. | Tom happy, TNB happy, Nara happy |

## map: map jordansam, lines (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Jordan | We took it down to the studs. Then we put the studs back. Very authentic. | Tom unimpressed, TNB unimpressed, Nara happy |
| Jordan | Have you tried the juice bar on Jefferson? It's so nice the neighborhood is finally getting... options. | Tom unimpressed, TNB unimpressed, Nara happy |
| Jordan | We painted it black. The neighbors call it the haunted house. We're choosing to take that as a compliment. | Tom happy, TNB happy, Nara happy |
| Sam | Mrs. Alvarez brought us tamales. We posted them. We tagged her. She doesn't have Instagram. | Tom unimpressed, TNB happy, Nara happy |
| Sam | Our mortgage is, um. We don't say the number out loud. The house can hear. | Tom scared, TNB scared, Nara happy |
| Sam | Everyone else on this street rents. We think about that a lot. Mostly on podcasts. | Tom unimpressed, TNB unimpressed, Nara happy |

## map: map dakota, lines (chapter 2-10)

| Speaker | Line | Reactions |
|---|---|---|
| Dakota | We're restoring the original 1912 windows. It's a whole thing. | Tom happy, TNB happy, Nara happy |
| Dakota | Mr. Washington told us the windows are older than his father. He was very serious about it. | Tom happy, TNB happy, Nara happy |
| Dakota | Every house on this street has a story. Ours is: the plumbing. | Tom happy, TNB happy, Nara happy |
| Ryan | Baby Hudson is asleep. Please whisper. Please. I'm begging. | Tom scared, TNB scared, Nara scared |
| Ryan | We moved from the Westside for the space. And the character. Mostly the price. Which was still a lot. | Tom unimpressed, TNB unimpressed, Nara happy |
| Ryan | I work from home. Home is very loud on the Alvarez side. I bought noise-canceling headphones. They lost. | Tom happy, TNB happy, Nara happy |

## recruit: recruit ask (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Also. I've been standing still for four minutes and it's killing me. Want a running partner out there? | Tom unimpressed, Grace happy, Rose happy |

## recruit: recruit yes (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Finally. Try to keep up. I mean that with love. | Tom unimpressed, Grace happy, Rose happy |

## recruit: recruit no (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Fine. I'll do burpees until you change your mind. | Tom unimpressed, Grace happy, Rose happy |

## recruit: recruit swap (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Somebody has to tag out. I can wait, but I'll be stretching the whole time. | Tom unimpressed, Grace happy, Rose happy |

## recruit: recruit chatter (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Pick up the pace, Tom. The girls are faster than you. | Tom unimpressed, Grace proud, Rose proud |
| Amy | Is that the Grump? I could take him. I've taken a second-grade class on a field trip. | Tom happy, Grace happy, Rose happy |
| Amy | Rose, shoes. Grace, water. Tom, posture. | Tom unimpressed, Grace unimpressed, Rose unimpressed |

## recruit: recruit ask (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Justin | Heading out? I can come. I have a tool belt, a flashlight and a strong opinion about whatever you're about to fight. | Tom happy, Grace happy, Rose happy |

## recruit: recruit yes (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Justin | Great. Let me grab my jacket. And the ladder. Don't ask about the ladder. | Tom unimpressed, Grace unimpressed, Rose happy |

## recruit: recruit no (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Justin | No problem. The hallway light won't finish itself. It's been almost done since June. | Tom happy, Grace happy, Rose happy |

## recruit: recruit swap (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Justin | Somebody has to tag out. I'll wait. I'll be on the ladder. | Tom happy, Grace happy, Rose happy |

## recruit: recruit chatter (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Justin | Hold this. No, the other end. Don't touch the copper. | Tom unimpressed, Grace happy, Rose happy |

## recruit: recruit ask (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | I have a notebook, a phone at 9 percent and a very firm opinion on this story. Can I come? Michael has the kids. I think. | Tom happy, TNB happy, Nara happy |

## recruit: recruit yes (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Great. Let me grab my tote. It has snacks. It always has snacks. | Tom happy, TNB happy, Nara happy |

## recruit: recruit no (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Okay. I'll be here, fact-checking a sandwich. Come find me. | Tom happy, TNB happy, Nara happy |

## recruit: recruit swap (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Somebody has to tag out. I'll wait. I'll take notes on the whole thing. | Tom happy, TNB happy, Nara happy |

## recruit: recruit chatter (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Olivia | Hold on, I'm writing that down. Can you say it again, slower? | Tom unimpressed, TNB happy, Nara happy |
| Olivia | Is that a source? Who told you that? I need two sources. | Tom unimpressed, TNB happy, Nara happy |
| Olivia | Michael? Michael, can you hear me from here? No? Okay. | Tom happy, TNB happy, Nara happy |
| Olivia | It is sixty-two degrees. I am wearing a dress. Nobody warned me. | Tom happy, TNB loving, Nara happy |

## recruit: recruit ask (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Now hold on, Tom. You're not taking my angels anywhere without me and a bag of cookies. Can Deedee come along? | Tom loving, Grace happy, Rose happy |

## recruit: recruit yes (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Wonderful! Everybody hold hands. Tom, you too. To the moon and back, here we come. | Tom scared, Grace loving, Rose loving |

## recruit: recruit no (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | All right, all right. The pies need me anyway. Come back for a cookie. | Tom happy, Grace happy, Rose happy |

## recruit: recruit swap (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Oh, honey. Somebody has to stay and mind the house. Who's it going to be? | Tom happy, Grace scared, Rose scared |

## recruit: recruit chatter (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Are you warm enough? Nobody is warm enough. | Tom unimpressed, Grace unimpressed, Rose happy |
| Deedee | Grace, Rose, to the moon and back. Say it. LOUDER. | Tom happy, Grace loving, Rose loving |
| Deedee | I packed cookies. They're in my purse. The purse is at home. We go back. | Tom unimpressed, Grace happy, Rose happy |
| Deedee | Pick up those feet. A brisk walk never hurt anybody. | Tom unimpressed, Grace unimpressed, Rose happy |
| Deedee | Tom, you look pale. When did you last drink water? Nurse is asking. | Tom unimpressed, Grace happy, Rose happy |
| Deedee | When we get home I'm making a big dinner. Nobody argue. | Tom loving, Grace happy, Rose happy |

## recruit: recruit ask (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | My stomach isn't right and the fish aren't biting. Want an old man along? Just don't walk too fast. | Tom loving, Grace happy, Rose happy |

## recruit: recruit yes (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Good. Somebody grab my cap. And slow down. I was a champion, you know. | Tom unimpressed, Grace happy, Rose happy |

## recruit: recruit no (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Suit yourself. The recliner and I have an understanding. | Tom happy, Grace happy, Rose happy |

## recruit: recruit swap (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Somebody has to sit this one out. My stomach volunteers, but the rest of me is coming. | Tom happy, Grace happy, Rose happy |

## recruit: recruit chatter (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Slow down! Who taught you to walk? I was a champion runner and I never went this fast. | Tom unimpressed, Grace happy, Rose happy |
| Boppy | At Rikers I did the headcount. One, two, three, Tom. Everybody here. | Tom unimpressed, Grace proud, Rose proud |
| Boppy | My stomach is talking. It says no more peppers. My stomach is wrong. | Tom unimpressed, Grace happy, Rose happy |
| Boppy | That Grump owes me a fish. Tell him. | Tom happy, Grace happy, Rose happy |

## recruit: recruit ask (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Heading out? I can come. I have my longboard, a bus pass and a garment bag. I'm ready for anything. Mostly costume emergencies. | Tom loving, Nara happy |

## recruit: recruit yes (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Great. Let me grab my jacket. Oh. You have it. Let me grab my other jacket. | Tom scared, Nara happy |

## recruit: recruit no (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Okay. I'll be here, throwing bowls. Come back if anything cracks. | Tom loving, Nara happy |

## recruit: recruit swap (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Somebody has to hold down the house. I vote the couch, but it has to be a person. | Tom happy, Nara happy |

## recruit: recruit chatter (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Tom, your shoelace. No, the other one. Got it. | Tom scared, Nara happy |
| TNB | Well, well... a foggy canyon at dusk. This is how every horror movie starts. | Tom unimpressed, Nara scared |
| TNB | If a coyote jumps out at us, I've seen this movie. Stay together. Nobody go in the basement. | Tom unimpressed, Nara scared |
| TNB | After this, clay. Any two colors. I'll make them get along. | Tom loving, Nara happy |

## shop: shop intro (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | Welcome to Penny's Pockets. I sell things for pockets. Also things for people. | Tom happy, Grace happy, Rose happy |
| Penny | Gear for the whole family, snacks for fights, and a few things that go POP. Gently. | Tom unimpressed, Grace happy, Rose surprised |
| Penny | Got something to sell? I buy almost anything. Not Steve. Never Steve. | Tom unimpressed, Grace surprised, Rose surprised |

## shop: shop hello (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | Back again! The coins missed you. | Tom happy, Grace happy, Rose happy |
| Penny | Browse all you like. Browsing is free. Buying is better. | Tom unimpressed, Grace happy, Rose happy |
| Penny | Fresh stock. Same Penny. | Tom happy |

## shop: shop bought (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | Pleasure doing business. | Tom happy |
| Penny | Good choice. I'd have picked that one too. | Tom proud, Grace happy, Rose happy |
| Penny | Into the pockets it goes. | Tom happy, Rose happy |
| Penny | Ka-ching. That's my favorite sound. | Tom happy, Grace happy, Rose happy |

## shop: shop sold (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | Sold! I know just the shelf. | Tom happy |
| Penny | A fine addition to my collection. | Tom happy |
| Penny | Half price, full gratitude. | Tom happy |

## shop: shop broke (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | Not enough coins. Grump Hollow pays, in a way. | Tom sad, Grace sad, Rose sad |
| Penny | Short on coins. The monsters up north are carrying some. | Tom unimpressed, Grace proud, Rose happy |

## shop: shop keep (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | I could never. That's a family thing. | Tom loving, Grace loving, Rose loving |
| Penny | Not for sale. Some things are priceless. | Tom loving, Grace loving, Rose loving |
| Penny | Put that back in your pocket. It's special. | Tom loving, Grace loving, Rose loving |

## shop: shop fresh (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | New shipment! The crates are still warm. Come see the good shelf. | Tom happy, Grace surprised, Rose surprised |
| Penny | Fresh stock, and it's a big step up. I'm a little emotional. | Tom happy, Grace happy, Rose happy |
| Penny | The top shelf, finally. I've been saving it for you. Look. | Tom proud, Grace surprised, Rose surprised |

## shop: shop tab healing (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | Snacks and fixes. Eat them in battle or from the menu. | Tom happy, Rose happy |

## shop: shop tab battle (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | For monsters only. Don't pop the poppers in here. | Tom unimpressed, Grace unimpressed, Rose happy |

## shop: shop tab sell (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | Half price, no haggling. Okay, a little haggling. No. | Tom unimpressed, Grace happy |

## shop: shop shelf gear (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | The new shelf: sturdier, shinier, still gently priced. Twice the coins, more than twice the gear. | Tom happy, Grace surprised |
| Penny | The grown-up shelf. Gear for people who actually fight things. | Tom unimpressed, Grace proud, Rose proud |
| Penny | Top shelf. Everything up here has a story and a warranty. Sort of. | Tom unimpressed, Grace happy |

## shop: shop shelf healing (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | Bigger bandages and a real picnic. Same pockets, more fixing. | Tom happy, Rose happy |
| Penny | The med kit has a flashlight now. Don't ask me why that helps. | Tom unimpressed, Grace unimpressed |
| Penny | Feast-grade snacks. Deedee called to approve them personally. | Tom loving, Grace happy, Rose happy |

## shop: shop shelf battle (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Penny | The Confetti Cannon is new. Please aim it away from my shelves. | Tom unimpressed, Grace happy, Rose happy |
| Penny | Fireworks. Legally a gray area. Emotionally, a gift. | Tom unimpressed, Grace surprised, Rose surprised |
| Penny | The Finale Rocket. Hold it like it owes you money. | Tom unimpressed, Grace happy, Rose surprised |

## shop: shop intro (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | Welcome to Nickel's. I'm Penny's cousin. Better weather, same prices. | Tom happy, TNB happy, Nara happy |
| Nickel | Gear for the whole family, snacks for fights, sunscreen for the soul. | Tom unimpressed, TNB happy, Nara happy |
| Nickel | Got something to sell? I buy almost anything. Penny warned me about Steve. | Tom unimpressed, TNB happy |

## shop: shop hello (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | Back again! Did you find parking? Nobody finds parking. | Tom unimpressed, TNB proud, Nara happy |
| Nickel | Browse all you like. Browsing is free in Los Angeles. Nothing else is. | Tom unimpressed, TNB happy |
| Nickel | Fresh stock. Same Nickel. | Tom happy |

## shop: shop bought (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | Pleasure doing business. | Tom happy |
| Nickel | Good choice. Very you. | Tom proud, TNB happy |
| Nickel | Into the pockets it goes. | Tom happy, Nara happy |
| Nickel | Ka-ching. That one is for parking. | Tom happy, TNB happy |

## shop: shop sold (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | Sold! I know just the shelf. | Tom happy |
| Nickel | Half price, full gratitude. | Tom happy |
| Nickel | That's very vintage now. | Tom unimpressed, TNB happy |

## shop: shop broke (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | Not enough coins. Griffith Park pays, in a way. | Tom sad, TNB sad, Nara sad |
| Nickel | Short on coins. The monsters up in the park are carrying some. | Tom unimpressed, TNB happy, Nara proud |

## shop: shop keep (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | I could never. That's a family thing. | Tom loving, TNB loving, Nara loving |
| Nickel | Not for sale. Some things are priceless. | Tom loving, TNB loving, Nara loving |
| Nickel | Keep that one. Trust me. | Tom loving, TNB loving |

## shop: shop fresh (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | New shipment! It came in on a truck that found parking. Come look. | Tom happy, TNB happy, Nara happy |
| Nickel | Fresh stock, and a real upgrade. Penny will be so jealous. | Tom happy, TNB happy |
| Nickel | The top shelf is finally stocked. Worth the traffic. | Tom proud, TNB happy |

## shop: shop tab healing (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | Snacks and fixes. Eat them in battle or from the menu. | Tom happy, Nara happy |

## shop: shop tab battle (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | For monsters only. The coyotes have been warned. | Tom unimpressed, TNB happy, Nara angry |

## shop: shop tab sell (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | Half price, no haggling. This isn't the Rose Bowl flea market. | Tom unimpressed, TNB happy |

## shop: shop shelf gear (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | The new shelf: sturdier, shinier, still reasonable by Los Angeles standards. | Tom unimpressed, TNB happy |
| Nickel | The grown-up shelf. Gear for people who actually fight things. | Tom unimpressed, TNB proud, Nara proud |
| Nickel | Top shelf. Everything up here has a story and an agent. | Tom happy, TNB happy |

## shop: shop shelf healing (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | Bigger bandages and a real picnic. Same pockets, more fixing. | Tom happy, Nara happy |
| Nickel | The med kit has a flashlight now. Very LA. It has a ring light too. | Tom unimpressed, TNB happy |
| Nickel | Feast-grade snacks. Catered, practically. | Tom happy, TNB happy, Nara happy |

## shop: shop shelf battle (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Nickel | The Confetti Cannon is new. Please aim it away from the palm trees. | Tom unimpressed, TNB happy, Nara happy |
| Nickel | Fireworks. Legally a gray area. Emotionally a gift. | Tom unimpressed, TNB surprised, Nara scared |
| Nickel | The Finale Rocket. Hold it like a parking ticket. | Tom unimpressed, TNB happy |

## cab: cab flight to ch4 (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles again? Cab seven loves this run. She hums the whole way. | Tom happy, Grace sad, Rose sad |
| Sal | The girls stay home. Amy's rule. I don't argue with Amy. | Tom unimpressed, Grace angry, Rose sad |

## cab: cab flight to ch5 (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Airport. Your young man fixed my visor. He made me promise to drive careful. So I'm going the speed limit. Everybody hates it. | Tom loving, TNB loving, Nara happy |

## cab: cab flight to ch6 (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Back to Los Angeles. Your sister gave me a gold star for using my blinker. | Tom happy, Grace happy, Rose happy |
| Sal | The girls stay home. School night. It's always a school night. | Tom unimpressed, Grace angry, Rose sad |

## cab: cab flight to ch7 (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | LAX. I'm taking the long way. There are squirrels on the short way. | Tom unimpressed, TNB scared, Nara angry |

## cab: cab flight to ch8 (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles again? I'm starting to think you live there. | Tom scared, Grace happy, Rose happy |
| Sal | The girls stay home. School tomorrow. Library books are due. | Tom unimpressed, Grace unimpressed, Rose sad |

## cab: cab flight to ch9 (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Airport. No eating in my cab. I can smell the potluck on you. It smells amazing. Still no. | Tom unimpressed, TNB happy, Nara happy |

## cab: cab west (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles? You got it. Flights leave whenever I get there. | Tom happy, Grace sad, Rose sad |
| Sal | One thing. The girls stay home. Amy's rule. No flying on a school night. | Tom unimpressed, Grace angry, Rose sad |
| Sal | Airport? Hop in. Cab seven has been waiting all day. | Tom happy, Grace sad, Rose sad |
| Sal | The girls stay put. Amy's orders. I follow Amy's orders. Everybody does. | Tom unimpressed, Grace unimpressed, Rose sad |
| Sal | LAX it is. Seat belts. Your niece is giving me the look. | Tom happy, Grace angry, Rose happy |
| Sal | Girls, out you go. No stowaways. I checked the trunk last time. | Tom happy, Grace unimpressed, Rose sad |
| Sal | Off to the airport. I'll take the scenic route. By scenic I mean the only route. | Tom unimpressed, Grace unimpressed, Rose happy |
| Sal | The girls stay home. It's a school night. Even I know that, and I don't have kids. | Tom unimpressed, Grace angry, Rose sad |
| Sal | Airport. Los Angeles. Your usual. | Tom happy, Grace sad, Rose sad |
| Sal | Girls, say your goodbyes. I'll keep the meter off. Mostly. | Tom loving, Grace sad, Rose sad |
| Sal | Los Angeles? Sure. I'll get you there before the sun gets bored. | Tom happy, Grace sad, Rose sad |
| Sal | The girls stay here. Amy's rule number one. There are about forty more. | Tom unimpressed, Grace unimpressed, Rose sad |
| Sal | Another flight, another gold star for cab seven. | Tom happy, Grace happy, Rose happy |
| Sal | The girls head home. Straight home. Do not follow the cab. | Tom happy, Grace unimpressed, Rose scared |
| Sal | Airport. You've got the look of a man who packed light. | Tom proud, Grace sad, Rose sad |
| Sal | Girls, back to the house. Your grandmother has pie. That's not a rumor. | Tom happy, Grace happy, Rose happy |

## cab: cab west alone (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles? You got it. Buckle up. | Tom happy |
| Sal | Los Angeles again. Cab seven is ready. | Tom happy |
| Sal | LAX. Sit back. The radio is on something calm. | Tom happy |
| Sal | Off we go. Don't touch the visor. Everybody touches the visor. | Tom scared |
| Sal | Airport run. I'll have you there before your coffee gets cold. | Tom happy |

## cab: cab east (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Airport. Love it. We'll be there in twenty minutes. Or two hours. Nobody knows. | Tom unimpressed, TNB happy, Nara happy |
| Sol | Long Island? Sure. I know a shortcut. It's not shorter, but it's mine. | Tom unimpressed, TNB happy, Nara happy |
| Sol | Seat belt, please. It's decorative, but I like when people try. | Tom unimpressed, TNB happy, Nara happy |
| Sol | Airport run. Cab traffic, cab snacks, cab opinions. All included. | Tom happy, TNB happy, Nara happy |
| Sol | East we go. Don't mind the ketchup stain. It's from last Tuesday. | Tom unimpressed, TNB happy, Nara unimpressed |
| Sol | Heading home? Say hi to the Atlantic for me. The right ocean. | Tom happy, TNB loving, Nara happy |

## table: ch19 memory grace1 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | This is my first meet. I was seven. I looked at the bleachers and there was one empty folding chair at the very front, on the aisle, and then there was Tata in it. | Amy loving, TNB loving, Rose loving, Nara loving |
| Grace | He was an hour early. He had a thermos. He said the aisle seat is for the person who cheers the loudest. Then he did not cheer at all. He said “Mm.” It was the loudest Mm of my whole life. | Amy loving, TNB loving, Rose loving, Nara loving |

## table: ch19 memory grace2 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | I fell off the beam. It is four inches wide. It does not care about me. | Amy loving, TNB loving, Rose loving, Nara loving |
| Tom | The beam is four inches. You are nine. Both of those are fine. | Amy loving, TNB loving, Grace loving, Rose loving, Nara loving |
| Grace | He said it like it was a fact on a form. I got back up because it sounded official. | Amy loving, TNB loving, Rose loving, Nara loving |

## table: ch19 memory grace3 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Before every routine I gave him my Sparkling Diamond Gold Soup Dumpling squishy to hold. Nobody else is allowed to hold it. It is very important and slightly sticky. | Amy loving, TNB loving, Rose loving, Nara loving |
| Grace | He has put it in his coat pocket at every single meet since. It has been through three coats. He says it has “seniority.” I am going to put it somewhere he will trip on it. | Amy loving, TNB loving, Rose loving, Nara loving |

## table: ch19 memory rose1 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Shoulder rides. The ceiling is so close up here. You can touch it if you stretch. | Amy happy, TNB happy, Grace happy, Nara happy |
| Tom | Duck. | Amy happy, TNB happy, Grace happy, Rose happy |
| Rose | I ducked. He did not duck. We hit the lamp. It was the best day of my life, and I was in a hospital hallway. | Amy happy, TNB happy, Grace happy, Nara happy |

## table: ch19 memory rose2 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Bedtime. Tata reads to Lamby, not to me. Lamby likes dragons. Tata does the dragon voice like a man filing his taxes. | Amy happy, TNB happy, Grace happy, Nara happy |
| Rose | I laughed so hard I got the hiccups. He said “That is not on the schedule.” He wrote HICCUPS on his hand with a pen. | Amy happy, TNB happy, Grace happy, Nara happy |

## table: ch19 memory rose3 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | At the airport I tied a pink ribbon around his wrist. I said, come back with the same wrist. | Amy happy, TNB happy, Grace happy, Nara happy |
| Rose | He did. He kept the ribbon in his wallet next to his library card. He said he checks it out regularly. | Amy happy, TNB happy, Grace happy, Nara happy |

## table: ch19 memory amy1 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Backyard races. I won every one until I was twelve. Then I found out why. | TNB loving, Grace loving, Rose loving, Nara loving |
| Amy | I made him run it again, for real. He lost again. Honestly. My big brother, the slowest man on Long Island, and he looked so proud. | TNB loving, Grace loving, Rose loving, Nara loving |

## table: ch19 memory amy2 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Mile twenty of my first marathon. I was falling apart. And there was Tom on the curb with a thermos and a sign. | TNB loving, Grace loving, Rose loving, Nara loving |
| Amy | The sign said: AMY. GO. (I HAVE NO SIGN WORDS.) I cried. I ran the last six miles in a rage. Best six miles of my life. | TNB loving, Grace loving, Rose loving, Nara loving |

## table: ch19 memory amy3 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Every long run, he asked my time. I thought he was being polite. | TNB loving, Grace loving, Rose loving, Nara loving |
| Amy | There is a notebook in his desk. Every time, every run, in his awful handwriting, with a little star next to the fast ones. He never told me. He just kept the numbers. | TNB loving, Grace loving, Rose loving, Nara loving |

## table: ch19 memory tnb1 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Our first date. He had a mug with a broken handle and he was drinking out of it anyway, holding the pieces. | Amy loving, Grace loving, Rose loving, Nara loving |
| TNB | I fixed it right there with gold. A seam you can see. He said, “Does it work?” I said, “It works better now.” He looked at me like I had said something in a language he had been waiting for. | Amy loving, Grace loving, Rose loving, Nara loving |

## table: ch19 memory tnb2 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | He used to sit in the studio and read while I threw pots. Hours. Not a word. | Amy loving, Grace loving, Rose loving, Nara loving |
| TNB | Once he looked up and said I looked like a man doing nothing very carefully. I said, “You really wheel know me.” He groaned so beautifully. I am keeping that groan forever. | Amy happy, Grace unimpressed, Rose happy, Nara happy |

## table: ch19 memory tnb3 (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | My first cup. Lopsided. The handle is much too big. I made it for him and then I was embarrassed and hid it in a drawer. | Amy loving, Grace loving, Rose loving, Nara loving |
| TNB | He found it. He has used it every morning since. Every morning, same cup. He says it holds exactly the right amount of coffee. It does not. It holds too much. That is the point. | Amy loving, Grace loving, Rose loving, Nara loving |

## table: ch19 keepsake grace (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Here. You are not allowed to forget this. I put it right where you will trip on it. | Amy loving, TNB loving, Rose loving, Nara loving |
| Dead-Letter Office | The pedestal lights gold. Somewhere far away, a lamp is turning toward the Claim Desk. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |

## table: ch19 keepsake rose (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Come back with the same wrist, Tata. I tied it already. You just have to come. | Amy loving, TNB loving, Grace loving, Nara loving |
| Dead-Letter Office | The ribbon ties itself in a small bow, all on its own. The pedestal hums pink. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |

## table: ch19 keepsake amy (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Time starts when you get here, Tom. I will be the one standing at the line, yelling. | TNB loving, Grace loving, Rose loving, Nara loving |
| Dead-Letter Office | The stopwatch ticks once. The race clock in the corner starts, very slowly, to count. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |

## table: ch19 keepsake tnb (chapter 19)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Hey. You left your coffee. It is still warm, I think. Come get it. | Amy loving, Grace loving, Rose loving, Nara loving |
| Dead-Letter Office | The cup fills with something warm. A seam of gold climbs the crack in its side and closes. | Amy surprised, TNB surprised, Grace surprised, Rose surprised, Nara surprised |

## table: ch20 door tom (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Four, five, nine. It is the saddest password I have ever typed. | Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara happy |
| Stillness Core | The dials lock. The door rolls open on a small brass room with one desk and one lamp. On the desk is a note in a hurried hand: HE ALWAYS SAID ONE MORE FLIGHT. SOMEBODY ALWAYS BELIEVED HIM. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Tom | I know that minute. It is the minute right before you finally stand up and go. He has been sitting in it for twenty years. | Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara happy |

## table: ch20 door grace (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | On the tick, off the tick. It is just floor music. Everybody count with me. | Tom proud, Amy proud, TNB proud, Rose proud, Deedee proud, Boppy proud, Nara happy |
| Stillness Core | She crosses with a whole routine: a chasse, a turn, a leap on the tilt, and a dismount she sticks so hard the beam rings like a bell. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Rose | That was a nine point nine! | Grace unimpressed, Tom happy, Amy happy |
| Grace | It was a ten. It was always going to be a ten. | Tom proud, Amy proud, TNB proud, Rose proud, Deedee proud, Boppy proud, Nara happy |

## table: ch20 door rose (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | I dropped those crumbs in the lift. I forgot. That is called a plan. | Tom proud, Amy proud, TNB proud, Grace proud, Deedee proud, Boppy proud, Nara happy |
| Stillness Core | She wriggles in, all the way, and the hatch unlatches from the inside with a click. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Rose | I am the smallest and the most important. Please write that down. | Tom proud, Amy proud, TNB proud, Grace proud, Deedee proud, Boppy proud, Nara happy |
| Amy | Noted. | Rose proud, Tom happy, Grace happy |

## table: ch20 door amy (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | Ninety meters. Nine seconds. Do not talk to me. | Tom proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara happy |
| Stillness Core | She hits the line in eight point one and slides under the slab with a hand to spare. The door behind her pops open. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Amy | Personal best. In a moon. In sneakers. Nobody tell Justin I did it without stretching. | Tom proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara happy |

## table: ch20 door deedee (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Deedee | Forty years in the same bed. It does not care what is going on. It just grows. | Tom proud, Amy proud, TNB proud, Grace proud, Rose proud, Boppy proud, Nara happy |
| Stillness Core | A bridge of thick red stalks rises across the chasm under a roof of enormous green leaves. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Boppy | You could drive a truck over that. | Deedee unimpressed, Tom happy, Amy happy |
| Deedee | Do not. It is for the crisp. | Boppy happy, Tom happy, Grace happy, Rose happy |

## table: ch20 door boppy (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Legs. Like every doctor I have ever ignored. Hup. | Tom proud, Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Nara happy |
| Stillness Core | The lever comes down with a long groan, and a shudder runs through the floor. Somewhere behind the wall, a counterweight drops, and the door swings wide. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Boppy | My knees would like a word. | Deedee unimpressed, Tom happy, Amy happy |
| Deedee | Your knees can talk to me later. | Boppy unimpressed, Tom happy, Amy happy, Grace happy |

## table: ch20 door tnb (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | You do not hide the break. You make it the strongest part. | Tom proud, Amy proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara happy |
| Stillness Core | He joins the two halves with a bright seam of gold. The rail rings like a struck bell, and the door at the end of it slides open. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Tom | You really did learn that from a cup. | TNB loving, Amy happy |
| TNB | I really did. | Tom loving, Amy loving |

## table: ch20 door nara (chapter 20)

| Speaker | Line | Reactions |
|---|---|---|
| Nara | Nara knows this one. It is the smell of the person she would go anywhere to find. She puts her nose down and does not stop. | Tom loving, TNB loving, Amy happy, Grace happy, Rose happy, Deedee loving, Boppy happy |
| Stillness Core | The tunnel opens for her, door after door, as if each one remembered being asked nicely. | Tom surprised, Amy surprised, TNB surprised, Grace surprised, Rose surprised, Deedee surprised, Boppy surprised, Nara surprised |
| Tom | She tracked me through a Dead-Letter Office. She can track a door. | Amy proud, TNB proud, Grace proud, Rose proud, Deedee proud, Boppy proud, Nara happy |

## table: DEPARTURES 4.driver (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles again? Cab seven loves this run. She hums the whole way. | Tom happy, Grace sad, Rose sad |
| Sal | The girls stay home. Amy's rule. I don't argue with Amy. | Tom unimpressed, Grace angry, Rose sad |

## table: DEPARTURES 4.grace (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata, you HAVE to be back for my meet. I already told everybody you're coming. | Tom loving, Rose happy |

## table: DEPARTURES 4.rose (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | My tooth is loose. Look. LOOK. Tata, you're not looking. | Tom surprised, Grace unimpressed |

## table: DEPARTURES 4.tom (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | I'll be at the meet. Front row. I'll make a sign. | Grace happy, Rose happy |
| Tom | Rose, that's a very good tooth. Guard it with your life. | Grace happy, Rose happy |

## table: DEPARTURES 4.stay.boppy.stay (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Boppy | Los Angeles again? My back just got home from the marsh. | Tom unimpressed, Grace happy, Rose happy |
| Boppy | Go. If you see a pepper out there, bring it back. I'll judge it. | Tom unimpressed, Grace happy, Rose happy |

## table: DEPARTURES 5.sol (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Airport. Your young man fixed my visor. He made me promise to drive careful. So I'm going the speed limit. Everybody hates it. | Tom loving, TNB loving, Nara happy |

## table: DEPARTURES 5.tnb (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | That's a wrap, babe. I have a five a.m. call and forty capes to steam. | Tom loving, Nara sad |
| TNB | Go survive conference night. Bring snacks. I packed you snacks. Check your bag. | Tom loving, Nara sad |

## table: DEPARTURES 5.stay.nara.stay (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Nara | Nara sits down on Tom’s feet. If he can't move, he can't leave. | Tom loving, TNB happy |
| Nara | Tom wiggles free. "A week. Maybe two. You guard the porch." | Tom loving, TNB happy |
| Nara | Nara lets out the biggest sigh a dog has ever sighed. Then she trots home. | Tom loving, TNB happy |

## table: DEPARTURES 6.driver (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Back to Los Angeles. Your sister gave me a gold star for using my blinker. | Tom happy, Grace happy, Rose happy |
| Sal | The girls stay home. School night. It's always a school night. | Tom unimpressed, Grace angry, Rose sad |

## table: DEPARTURES 6.grace (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata, Mom says I'm in charge while you're gone. Of Rose. | Tom unimpressed, Rose angry |

## table: DEPARTURES 6.rose (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | She's NOT in charge of me. Tata, tell her. TELL her. | Tom unimpressed, Grace proud |

## table: DEPARTURES 6.tom (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Nobody is in charge of anybody. Your mom is in charge of everybody. | Grace happy, Rose happy |
| Tom | That's how it's always worked. Trust me. I was there. | Grace happy, Rose happy |

## table: DEPARTURES 6.stay.amy.stay (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Amy | I survived conference night. I can survive you leaving. | Tom unimpressed, Grace happy, Rose happy |
| Amy | Text me when you land. I'm timing the flight. Don't lose. | Tom unimpressed, Grace happy, Rose happy |

## table: DEPARTURES 7.sol (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | LAX. I'm taking the long way. There are squirrels on the short way. | Tom unimpressed, TNB scared, Nara angry |

## table: DEPARTURES 7.tnb (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Bready Mercury is safe, the squirrels signed a treaty, and I owe the landlord a fence. | Tom loving, Nara sad |
| TNB | Go. I'll feed the starter. Twice a day, room temperature, no squirrels. I wrote it down. | Tom loving, Nara sad |

## table: DEPARTURES 7.stay.nara.stay (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Nara | Nara spots a squirrel across the street. She looks at the squirrel. She looks at Tom. | Tom loving, TNB happy |
| Nara | She picks Tom. She leans on his legs for one long minute. | Tom loving, TNB happy |
| Nara | Then she picks the squirrel. Fair enough. | Tom loving, TNB happy |

## table: DEPARTURES 8.driver (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles again? I'm starting to think you live there. | Tom scared, Grace happy, Rose happy |
| Sal | The girls stay home. School tomorrow. Library books are due. | Tom unimpressed, Grace unimpressed, Rose sad |

## table: DEPARTURES 8.grace (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata, I checked out a book about Los Angeles. Now I'll know where you are. Every minute. | Tom loving, Rose happy |

## table: DEPARTURES 8.rose (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | I checked out a book about a pig. It's not about Los Angeles. It's better. | Tom happy, Grace unimpressed |

## table: DEPARTURES 8.tom (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Both excellent choices. Return them on time. | Grace happy, Rose happy |
| Tom | That library has had enough excitement for one year. | Grace happy, Rose happy |

## table: DEPARTURES 9.sol (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Airport. No eating in my cab. I can smell the potluck on you. It smells amazing. Still no. | Tom unimpressed, TNB happy, Nara happy |

## table: DEPARTURES 9.tnb (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Forty loaves, zero leftovers. Not bad for two guys and one oven. | Tom loving, Nara sad |
| TNB | Go open your fancy letter. Wear the blue shirt. I fixed the button. You're welcome. | Tom loving, Nara sad |

## table: DEPARTURES 9.stay.nara.stay (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Nara | Nara is still full from the potluck. She lifts one paw. That's all she can manage. | Tom loving, TNB happy |
| Nara | Tom shakes it. "Deal. Back soon." | Tom loving, TNB happy |
| Nara | Nara lets out one very satisfied burp. Then she waddles home. | Tom loving, TNB happy |

## table: TRAVEL_POOLS west.0.driver (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles? You got it. Flights leave whenever I get there. | Tom happy, Grace sad, Rose sad |
| Sal | One thing. The girls stay home. Amy's rule. No flying on a school night. | Tom unimpressed, Grace angry, Rose sad |

## table: TRAVEL_POOLS west.0.grace (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata, you're leaving AGAIN? You JUST got here! | Tom loving, Rose sad |

## table: TRAVEL_POOLS west.0.rose (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Bring me back a palm tree. A small one. For my room. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS west.0.tom (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | I'll be back before you know it. Go home and listen to your mom. | Grace happy, Rose happy |
| Tom | Rose, I'll see what I can do about the palm tree. | Grace happy, Rose happy |

## table: TRAVEL_POOLS west.1.driver (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Airport? Hop in. Cab seven has been waiting all day. | Tom happy, Grace sad, Rose sad |
| Sal | The girls stay put. Amy's orders. I follow Amy's orders. Everybody does. | Tom unimpressed, Grace unimpressed, Rose sad |

## table: TRAVEL_POOLS west.1.grace (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata, text me when you land. I'll check at exactly seven. | Tom loving, Rose happy |

## table: TRAVEL_POOLS west.1.rose (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Take a picture of a dolphin. California has dolphins. I looked it up. Sort of. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS west.1.tom (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Seven o'clock. Got it. You're the strictest boss I've ever had. | Grace happy, Rose happy |
| Tom | Rose, I'll look for dolphins. No promises on the dolphins. | Grace happy, Rose happy |

## table: TRAVEL_POOLS west.2.driver (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | LAX it is. Seat belts. Your niece is giving me the look. | Tom happy, Grace angry, Rose happy |
| Sal | Girls, out you go. No stowaways. I checked the trunk last time. | Tom happy, Grace unimpressed, Rose sad |

## table: TRAVEL_POOLS west.2.grace (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | I'm not a stowaway. I'm a passenger without a ticket. | Tom loving, Rose happy |

## table: TRAVEL_POOLS west.2.rose (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | I could fit in his bag. I'm very small. Watch. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS west.2.tom (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Rose, please don't get in the bag. The bag has my snacks. | Grace happy, Rose happy |
| Tom | Grace, that's the definition of a stowaway. Go. Hug your mom for me. | Grace happy, Rose happy |

## table: TRAVEL_POOLS west.3.driver (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Off to the airport. I'll take the scenic route. By scenic I mean the only route. | Tom unimpressed, Grace unimpressed, Rose happy |
| Sal | The girls stay home. It's a school night. Even I know that, and I don't have kids. | Tom unimpressed, Grace angry, Rose sad |

## table: TRAVEL_POOLS west.3.grace (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata, I made you a packing list. It's laminated. | Tom loving, Rose happy |

## table: TRAVEL_POOLS west.3.rose (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | I put a surprise in your pocket. I'm not telling. It's a rock. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS west.3.tom (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | A laminated list. Impressive. I'm checking it twice. | Grace happy, Rose happy |
| Tom | Rose, thank you. I'll treasure the rock. Probably in my left pocket. | Grace happy, Rose happy |

## table: TRAVEL_POOLS west.4.driver (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Airport. Los Angeles. Your usual. | Tom happy, Grace sad, Rose sad |
| Sal | Girls, say your goodbyes. I'll keep the meter off. Mostly. | Tom loving, Grace sad, Rose sad |

## table: TRAVEL_POOLS west.4.grace (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Okay. Bye. Be good. Don't talk to strangers. Except TNB. | Tom loving, Rose happy |

## table: TRAVEL_POOLS west.4.rose (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Tata. Tata. If a seagull talks to you, say hi from me. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS west.4.tom (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | If a seagull talks to me, I'm getting off the plane. | Grace happy, Rose happy |
| Tom | Be good, you two. Back soon. | Grace happy, Rose happy |

## table: TRAVEL_POOLS west.5.driver (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles? Sure. I'll get you there before the sun gets bored. | Tom happy, Grace sad, Rose sad |
| Sal | The girls stay here. Amy's rule number one. There are about forty more. | Tom unimpressed, Grace unimpressed, Rose sad |

## table: TRAVEL_POOLS west.5.grace (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | I know all forty. I helped write seven of them. | Tom loving, Rose happy |

## table: TRAVEL_POOLS west.5.rose (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Rule forty-one is no goodbye without a high five. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS west.5.tom (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Rule forty-one is excellent. High fives, both of you. | Grace happy, Rose happy |
| Tom | Okay. That's the best goodbye I've had all week. | Grace happy, Rose happy |

## table: TRAVEL_POOLS west.6.driver (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Another flight, another gold star for cab seven. | Tom happy, Grace happy, Rose happy |
| Sal | The girls head home. Straight home. Do not follow the cab. | Tom happy, Grace unimpressed, Rose scared |

## table: TRAVEL_POOLS west.6.grace (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | We won't follow the cab. Rose might. I'll hold her hood. | Tom loving, Rose happy |

## table: TRAVEL_POOLS west.6.rose (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | I'll run really fast. Like a cheetah. A short cheetah. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS west.6.tom (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Stay put, short cheetah. I'll bring you something good. | Grace happy, Rose happy |
| Tom | Grace, hood duty. You're in charge of cheetah control. | Grace happy, Rose happy |

## table: TRAVEL_POOLS west.7.driver (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Airport. You've got the look of a man who packed light. | Tom proud, Grace sad, Rose sad |
| Sal | Girls, back to the house. Your grandmother has pie. That's not a rumor. | Tom happy, Grace happy, Rose happy |

## table: TRAVEL_POOLS west.7.grace (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Pie! Rose, move. Bye, Tata. | Tom loving, Rose happy |

## table: TRAVEL_POOLS west.7.rose (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | Bye Tata! Save me the... never mind, pie! | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS west.7.tom (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Tom | Great. I just got outcompeted by pie. | Grace happy, Rose happy |
| Tom | Enjoy it, you two. Save me a slice. | Grace happy, Rose happy |

## table: TRAVEL_POOLS sal.0 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles? You got it. Buckle up. | Tom happy |

## table: TRAVEL_POOLS sal.1 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Los Angeles again. Cab seven is ready. | Tom happy |

## table: TRAVEL_POOLS sal.2 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | LAX. Sit back. The radio is on something calm. | Tom happy |

## table: TRAVEL_POOLS sal.3 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Off we go. Don't touch the visor. Everybody touches the visor. | Tom scared |

## table: TRAVEL_POOLS sal.4 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sal | Airport run. I'll have you there before your coffee gets cold. | Tom happy |

## table: TRAVEL_POOLS sol.0 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Airport. Love it. We'll be there in twenty minutes. Or two hours. Nobody knows. | Tom unimpressed, TNB happy, Nara happy |

## table: TRAVEL_POOLS sol.1 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Long Island? Sure. I know a shortcut. It's not shorter, but it's mine. | Tom unimpressed, TNB happy, Nara happy |

## table: TRAVEL_POOLS sol.2 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Seat belt, please. It's decorative, but I like when people try. | Tom unimpressed, TNB happy, Nara happy |

## table: TRAVEL_POOLS sol.3 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Airport run. Cab traffic, cab snacks, cab opinions. All included. | Tom happy, TNB happy, Nara happy |

## table: TRAVEL_POOLS sol.4 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | East we go. Don't mind the ketchup stain. It's from last Tuesday. | Tom unimpressed, TNB happy, Nara unimpressed |

## table: TRAVEL_POOLS sol.5 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Sol | Heading home? Say hi to the Atlantic for me. The right ocean. | Tom happy, TNB loving, Nara happy |

## table: TRAVEL_POOLS tnb.0.lines (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Well, well... this is where I get off. Glaze firing tomorrow, call time at five, and somebody has to water your plants. | Tom loving, Nara sad |
| TNB | Go. Hug the girls for me. I'll be right here, pot-sitive. | Tom loving, Nara sad |

## table: TRAVEL_POOLS tnb.1.lines (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | This is my stop. I have a kiln to babysit and a call time that starts with a four. | Tom loving, Nara sad |
| TNB | Go see the girls. I'll keep your plants alive. Out of spite, mostly. | Tom loving, Nara sad |

## table: TRAVEL_POOLS tnb.2.lines (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | I'd fly with you, but the longboard doesn't fit in the overhead. | Tom loving, Nara sad |
| TNB | Hug the girls. Tell Rose I'm making her a bowl. She can keep a rock in it. | Tom loving, Nara sad |

## table: TRAVEL_POOLS tnb.3.lines (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Okay, babe, this is where I turn into a pumpkin. A glazed one. | Tom loving, Nara sad |
| TNB | Text me when you land. I'll reply in three to five business hours. Kidding. Two. | Tom loving, Nara sad |

## table: TRAVEL_POOLS tnb.4.lines (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | I'd love to come, but the wardrobe department called. Somebody lost a hat. A whole hat. | Tom loving, Nara sad |
| TNB | Go. Be the fun uncle. I'll be the one who remembers the sunscreen. | Tom loving, Nara sad |

## table: TRAVEL_POOLS tnb.5.lines (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | The wheel's calling. Not the cab wheel. The pottery wheel. | Tom loving, Nara sad |
| TNB | Say hi to everybody. Tell Deedee I'm still dreaming about that pie. | Tom loving, Nara sad |

## table: TRAVEL_POOLS tnb.6.lines (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| TNB | Here's the part where I wave dramatically from the curb. | Tom loving, Nara sad |
| TNB | There. Dramatic wave. Now go, before I get clingy. I'm very clingy. Like clay. | Tom loving, Nara sad |

## table: TRAVEL_POOLS welcome.0 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! You're BACK! AGAIN! | Tom loving, Rose happy |
| Grace | Did you miss us? Say a big number. | Tom loving, Rose happy |
| Tom | A very big number. The biggest one. | Grace happy, Rose happy |
| Rose | Did you bring me a palm tree? | Tom happy, Grace unimpressed |
| Tom | I brought you a picture of a palm tree. | Grace happy, Rose happy |
| Rose | ...That's ALMOST a palm tree. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS welcome.1 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! You're BACK! I kept a list of what you missed. It's long. | Tom loving, Rose happy |
| Tom | Read me the first one. | Grace happy, Rose happy |
| Grace | Number one: Rose lost a sock. Number two: Rose found the sock. | Tom loving, Rose happy |
| Rose | It was on my head. The whole time. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS welcome.2 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! Did the plane have a snack cart? Did you get the little pretzels? | Tom loving, Rose happy |
| Tom | I got the little pretzels. I saved you eleven. | Grace happy, Rose happy |
| Rose | Eleven? I want twelve. Tata, that's not fair. | Tom unimpressed, Grace unimpressed |
| Tom | Fine. Twelve. Don't tell your mom. | Grace happy, Rose happy |

## table: TRAVEL_POOLS welcome.3 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Rose | TATA!! You're back! Say something in a California accent! | Tom happy, Grace unimpressed |
| Tom | Dude. Totally. Palm trees. Whoa. | Grace unimpressed, Rose happy |
| Grace | That's the worst California accent I've ever heard. | Tom unimpressed, Rose happy |
| Rose | I LOVED it. Say it again. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS welcome.4 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata. You're back. I made you a welcome sign. It says WELCOME BACK in three colors. | Tom loving, Rose happy |
| Rose | I did the exclamation point. It's the best exclamation point. | Tom happy, Grace unimpressed |
| Tom | It's the best welcome sign I've ever gotten. Rose, that exclamation point is art. | Grace happy, Rose happy |
| Rose | I KNOW. | Tom happy, Grace unimpressed |

## table: TRAVEL_POOLS welcome.5 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! Mom says dinner is in an hour. You're on the list. | Tom loving, Rose happy |
| Tom | An actual list? I feel honored. | Grace happy, Rose happy |
| Rose | I'm on the list too. At the top. In marker. | Tom happy, Grace unimpressed |
| Tom | Of course you are. | Grace happy, Rose happy |

## table: TRAVEL_POOLS welcome.6 (chapter 1-10)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Welcome back, Tata. I've been in charge. It went fine. Mostly. | Tom loving, Rose happy |
| Rose | She made me do a spreadsheet. | Tom unimpressed, Grace proud |
| Tom | A spreadsheet. Of course. | Grace happy, Rose happy |
| Grace | It was a very good spreadsheet. | Tom loving, Rose happy |

## table: ARRIVALS 5.talk (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! You're BACK! That's TWO times! | Tom loving, Rose happy |
| Grace | Mom made you a binder. It has TABS. | Tom loving, Rose happy |
| Rose | Did you bring the snacks? Tata. The SNACKS. | Tom happy, Grace unimpressed |
| Tom | TNB packed them. Check my bag. Carefully. He also packed a note. | Grace happy, Rose happy |
| Rose | I'm checking NOW. | Tom happy, Grace unimpressed |

## table: ARRIVALS 7.talk (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! THREE times! The library's still whispering. I SAID so. In a text. | Tom loving, Rose happy |
| Rose | It said my name. It said ROSE. Then it said shhh. | Tom surprised, Grace scared |
| Tom | Then we go find out what it wants. After a sandwich. | Grace happy, Rose happy |
| Grace | I'm bringing a flashlight. And a pencil. For notes. | Tom loving, Rose happy |

## table: ARRIVALS 9.talk (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Grace | Tata! FOUR! I have a chart now. You're on it. | Tom loving, Rose happy |
| Rose | Deedee has your letter. She hasn't opened it. She's LOOKED at it. A lot. | Tom happy, Grace unimpressed |
| Tom | A wax seal with a clock on it. I'd look at it a lot too. | Grace happy, Rose happy |
| Rose | I named the seal Flippers. | Tom unimpressed, Grace unimpressed |

## table: ellie bet 1 offer (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Tom. I hear a swamp creature ran off with Deedee's pie tin. Finally, someone in this family with ambition. | Tom unimpressed, Grace surprised, Rose surprised |
| Aunt Ellie | Bring that tin home to your mother, darling. Do it properly, and come back to me. I have something that would suit you. | Tom unimpressed, Grace surprised, Rose surprised |

## table: ellie bet 1 remind (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The pie tin, darling. Swamp, creature, tin. In that order. Then come see me. | Tom unimpressed, Grace happy, Rose happy |

## table: ellie bet 1 pay (chapter 1)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The tin is home, the pie is safe, and a swamp somewhere is missing its crown. Well done. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | This is a pin from a church raffle in 1983. A little tin pie. Wear it into battle. Every good outfit needs one thing that has survived a war. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 2 pay (chapter 2)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Deedee tells me the whole of Second Avenue went purple, and a poor man stopped mid sentence for forty years. And you cleared the sky. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | I bet Deedee a dessert you would. She said, Ellie, you can't bet on family. I said, watch me. Here is your cut. Silk. Nothing gets past it, not even smog. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 3 offer (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | A fish ate Boppy's pepper jar. Pickled in 1989. That fish has taste and no manners. | Tom unimpressed, Grace surprised, Rose surprised |
| Aunt Ellie | Get the jar back from the deep end, Tom, and come see me. I keep a few things for people who rescue peppers. | Tom unimpressed, Grace surprised, Rose surprised |

## table: ellie bet 3 remind (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The jar, darling. A fish has it. Fetch it. Then come see me. | Tom unimpressed, Grace happy, Rose happy |

## table: ellie bet 3 pay (chapter 3)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The jar is home, Boppy's stomach will live, and so will the rest of us. Barely. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | Take this tea. It's what I give anyone who has had a long day near water. Everybody gets a cup. Boppy gets two, and he doesn't get to complain about either. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 4 pay (chapter 4)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Deedee says a movie studio lost its mind and a Director took over the lights. And you fixed the rig and wheeled the rack home. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | I bet Deedee you would. I have worked with directors. They never listen. Cue cards help. Hold one up to anything loud and tell it to behave. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 5 offer (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Amy has thirty parents coming at seven, and the school bells have lost their minds. Every clock in the building fighting over the time. I would have loved that in 1962. | Tom unimpressed, Grace surprised, Rose surprised |
| Aunt Ellie | Set the school straight, Tom, and walk your sister out. Then come back. I have a soft spot for anyone who survives a conference night. | Tom unimpressed, Grace surprised, Rose surprised |

## table: ellie bet 5 remind (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The school, darling. Clocks, parents, one very tired sister. Then come see me. | Tom unimpressed, Grace happy, Rose happy |

## table: ellie bet 5 pay (chapter 5)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | A night of runaway clocks, thirty parents and one red pen with opinions. And Amy still got home on time. That is a miracle with a clipboard. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | This hall pass has been signed since 1961. Nobody has ever refused it. Hold it up when somebody goes down, and watch them stand. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 6 pay (chapter 6)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Deedee says a squirrel in a top hat took the starter. Of course he did. Squirrels have excellent taste in bread and terrible taste in hats. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | I bet Deedee you would get it back. Pearls, from my eleventh trip to Paris. Squirrels love anything shiny. Now you are the one who comes out ahead. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 7 offer (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Grace tells me the library is whispering. Whispering! I have been trying to get that room to whisper since the Eisenhower years. | Tom unimpressed, Grace surprised, Rose surprised |
| Aunt Ellie | Quiet the place down, Tom, and come back to me. I have something for your eyes. | Tom unimpressed, Grace surprised, Rose surprised |

## table: ellie bet 7 remind (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The library, darling. The whispering. Put it right, then come see me. | Tom unimpressed, Grace happy, Rose happy |

## table: ellie bet 7 pay (chapter 7)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The Reading Room is open, the library has its manners back, and you put the gold letters in card order. Frankly, I'm impressed. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | These are my reading glasses. A chain, rhinestones, and an opinion about everybody. Wear them. You'll see what people actually mean. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 8 pay (chapter 8)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | Deedee says every oven on Second Avenue went cold at noon, and you still got forty loaves to the potluck. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | I bet Deedee you would. Take these plates. The good china. It was never for Boppy. It was always for emergencies. Throw them hard. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 9 offer (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The Moon Club. I have waited fifty years for somebody to go back in there, and it had to be you, in those shoes. | Tom unimpressed, Grace surprised, Rose surprised |
| Aunt Ellie | Find the three mirrors, darling, and bring the moon home. Come see me after. I kept something from the last dance besides the coat. | Tom unimpressed, Grace surprised, Rose surprised |

## table: ellie bet 9 remind (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The moon, Tom. Three mirrors. Then come see me. I'm not going anywhere. I have cards. | Tom unimpressed, Grace happy, Rose happy |

## table: ellie bet 9 pay (chapter 9)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | The moon is back and so is my coat. The silver ball turned for you. I always said it was a gentleman. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | I took this from the last dance too. A silver fan. Grace has been asking for one, a big one. Give her mine. Do not let Boppy near it. | Tom proud, Grace happy, Rose happy |

## table: ellie bet 10 pay (chapter 10)

| Speaker | Line | Reactions |
|---|---|---|
| Aunt Ellie | You told me the whole airport story and I made you leave nothing out. A gate that doesn't exist and a man in a long coat. And Flight Zero went nowhere, politely. | Tom proud, Grace happy, Rose happy |
| Aunt Ellie | I bet Deedee you would be home for dinner. Take this. Eleven trips to Paris and I never lost a bag. It's luggage tag luck. It will keep you ahead. | Tom proud, Grace happy, Rose happy |
