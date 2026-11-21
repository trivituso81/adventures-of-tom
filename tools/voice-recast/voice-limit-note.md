# ElevenLabs voice limit (2026-11-02) and the retired recast page

- FACT (Tom, 11-02): his ElevenLabs account is at its limit of 30 custom voices. Library voices count as custom voices, and every Voice Design save takes one slot. A new or recast voice must free a slot first: delete the voice it replaces, or ask Tom which unused voice to delete (one short question).
- Deedee's new voice id `nh4f8rul91SCFqbXpyM0` is set in `tools/voice-library/make-index.js` for `battle|deedee` and `dialog|deedee` (never in the baked `data/voice-clips.js`).
- RETIRED (keysecrets5, 2026-11-20): `recast-deedee.html`, the Ellie, Grace and Justin recast bakers and their merge tool. They asked for a pasted key and nobody had used them since 2026-11-02. A future recast is a new card: an Action designs the voice with the repo secret and the page plays the previews.
