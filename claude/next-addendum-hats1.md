# hats1 (2026-11-10, main at e08e563): NPC hero prompts, hats only for work or personality

- Tom 08:19 and 08:58: outside job hats only 5 percent of characters wear a hat for personality. 5 percent of 56 NPCs = 2.8, so 3.
- Personality hats: Luna (floppy wide-brim, brass star pin), Ike (tweed flat cap), Pip (bucket hat worn crooked, feather). Job hats: Kenji, Bun, Ray (in `CS`), plus `HAT` table: Kit, Sal, Sol, Reel, Fern, Larry, Odette, Toni. Hat removed: Moss, Gus, Wes, Bev, Dash, Washington, Dana, Beto, Jordan. Before: 23 hats, now 14.
- Code: `HAT` table and `details()` in tools/art-library/npc-prompts.js. 20 `npc-photo-<id>` prompts spliced into data/art-prompts.json by exact match of the old character-details line.
- Ten previously approved heroes went back to draft: pip moss gus reel ike fern kit luna sal sol. Their approved pictures and the game are unchanged. WAITING ON TOM: Generate and Approve the new heroes. Then regenerate walks (npc-walk entries attach the newest hero); Gus and Ike walks are approved and installed, so replace them only after the new heroes are approved.
- Not done: claude/next.md not rewritten (very large); add this item next session. Pre-existing: Ike's json prompt has a different reference line than the module (hand edit); module and json differ only there.
