# Adventures of Tom: UI theme (Welcome, set 2026-10-29; replaces Slate from 2026-10-19)

Every menu now matches the title (welcome) screen's panel. Supersedes the Slate and cream-and-green colors described anywhere else.

- Windows (pause menu, tabs, shop, dialogue box, battle boxes, HUD chips, D-pad, A and menu buttons): navy gradient #1b212e to #141924, 2px gold border #b8914a with a dark ring #0a0e18 outside and inside plus a bronze inner line #6d5629.
- Type: Georgia serif. Command names (menu list, choices, tabs, battle moves, shop buttons) in small caps. Numbers use lining figures.
- Unselected buttons and rows: slate gradient #2b313e to #232834, 2px #4b5160 border, dark inner line.
- Selected: blue bar #1f5393 to #143a6e, gold border #d9a94f with a soft glow, gold cursor (a right-pointing triangle).
- Text: cream #f2e6cc, secondary #aeb6c6, faint #7d8496, labels soft gold #d6bd86. Gold #f0b94d for cursor, coins, BUY.
- Stat up mint #7fdc9f, down coral #ff8f80, MP blue #86a9ff, HP bar #8ad6a2 (low #f0c060, critical #ff8f80).
- Where it lives: `<style id="theme-welcome">`, the last style block in index.html's head. It re-points the tokens defined in `<style id="theme-slate">` (kept as the structure layer) and adds the selection, font and frame rules. Change colors in theme-welcome. The title screen's own hard-coded rules (Welcome art block in theme-slate) are the reference look. Canvas-drawn art (town, battle stage, effects) is unchanged.
