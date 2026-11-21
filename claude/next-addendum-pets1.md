# pets1 (2026-11-12 ~21:00, main 98e8f48): no dog for Tom or TNB; Chester the family cat

Tom 20:27: Tom and TNB never had a dog and do not have one now. Growing up Tom and Amy had a cat named Chester. The only pet ownership in the game is Nara, owned by Olivia and Michael.

## Done (fact, pushed, tag pets1)
- Scanned every dialogue, NPC line, object text, toast and narration in data/ and engine/ (after dialogclear1) for dog, cat, puppy, pet, Chester and possessives on Nara.
- 8 spoken lines reworded:
  - ch12 Arrive, Tom: "Come in. I'll show you where I live. Wipe your paws, Nara. And mind the sourdough." (was "Mind the dog.")
  - ch12 Loft: TNB "...Tells me it's for the raccoons." (was "for the dog"); Amy "He did that at nine. He told Mom it was so Chester couldn't get out." (was "for the cat"); TNB "Who's Chester?" (was "You had a cat?"); Amy "Our cat. Chester never once tried to get out." (was "We never had a cat.")
  - ch6 Bernadette: "Then Nara digs." (was "that dog of yours"); "and Nara can dig up what they buried" (was "your dog")
  - ch11 TNB: "The airline lost my bag, found Nara, and upgraded us both." (was "found my dog")
- 6 old clips purged (dialog-ch6.js, dialog-ch28.js). All 8 new lines are on the bake list (speech synthesis until recorded).
- Emotion tsv and generated js updated; npc-emotion-check --fix rewrote stale line numbers only. docs/CANON.md has a Pets line.
- Tests: smoke FAILS [], tag_check ok, unused_voice check 4 cleared, ch12Loft frames show the new lines.

## Left alone on purpose (no ownership by Tom or TNB)
Nara's "Cousin Olivia's dog" title, TNB's "Olivia dropped her off" setup, NPCs saying "plus one dog" / "and the dog", Michael's "It's his dog" (Lachlan), ch18 thermos "for the cat" with "The cat isn't even his", Rose asking whether Grace's present is a puppy, NPCs' own dogs (Marisol, Bagel).

## Rule going forward
Never write Nara as Tom's, TNB's or "your" dog. Any new childhood-pet reference for Tom and Amy is Chester the cat.
