# Sorceress tools that fit this job (checked 2026-11-17 13:30; READ THIS with claude/animation-tool-test-rose-results.md)

Sources: sorceress.games/pages/auto-sprite, /wiki/sorceress (Auto-Sprite v2, Sprite Analyzer), /wiki/sorceress/plans-credits-billing.

- **Auto-Sprite v2** (needs Sorceress Pro, the $49 lifetime pass; its AI steps still use credits): the same pipeline we have been hand-building. Upload a character image, animate it with AI video, then it converts the clip into clean editable frames and a sprite sheet: select frames, position and scale the character, clean backgrounds, preview, export frames and PNG plus JSON. Sends sheets to Sprite Analyzer. Claude's cutting, background removal and alignment by script is the part it replaces. It uses the SAME video models (Kling, Wan), so it does NOT fix style drift or size change in fast moves.
- **Sprite Analyzer + Slicer** (Pro): choose animation frames, define animation sections, align jittery frames, hitboxes, export engine-ready PNG and JSON.
- **Pixel Snap / True Pixel** (Pro): pixel-art conversion. Not wanted (painted style).
- **3D Studio, 3D to 2D, Procedural Walk** (Pro): rigging and 3D models turned into 2D sheets. A possible different method for big moves (build the character as a 3D model, animate it, render to 2D), not tested, style would change.
- **Background Remover** (credits): AI cutout, an alternative to a magenta key.
- **Wiki says:** no dedicated page on character sheets or skeleton animation.

Honest read: Auto-Sprite v2 replaces Claude's hand work on cutout, alignment and sheet export (Tom's point was fair). It does not change what the video model can do. Recommendation: do not buy Pro until the in-place Rose cheer test passes; if it passes, buy the $49 pass (Tom's decision) and run each character through Auto-Sprite v2 and Sprite Analyzer instead of hand cutouts. Try Background Remover (credits) on a clip frame before that if a quick cutout comparison is wanted.
