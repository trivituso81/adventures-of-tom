// THE walk sheet prompt (Tom 2026-11-09 23:12: "the only walking pose prompt that works for me ... use this for all walk sheets").
// Tom's wording, with only these changes (23:15): "previous image" -> "attached picture" (the Library attaches the hero painting),
// "8 poses" -> "9 poses" (it lists nine), and her/she -> neutral words so it fits every person. Every walk sheet entry uses this text unchanged.
const PROMPT = `Copy the style, physical features including colors and proportions EXACTLY the same as the attached picture, create 9 poses as below against a #FF00FF background

Row 1, body and face pointed straight at the viewer:
1. Standing still. Feet together, both flat on the ground. Arms hanging straight at the sides. A calm easy smile.
2. Walking toward the viewer. The foot on the viewer's left steps forward, toward the viewer. The foot on the viewer's right stays back. The arm on the viewer's right swings forward. The arm on the viewer's left swings back.
3. Walking toward the viewer. The foot on the viewer's right steps forward, toward the viewer. The foot on the viewer's left stays back. The arm on the viewer's left swings forward. The arm on the viewer's right swings back.

Row 2, body pointed straight away from the viewer, only the back of the head and body visible, no face. The full hair and the back of the outfit are visible:
4. Standing still. Feet together, both flat on the ground. Arms hanging straight at the sides.
5. Walking away from the viewer. The foot on the viewer's left steps forward, away from the viewer. The foot on the viewer's right stays back. The arm on the viewer's right swings forward. The arm on the viewer's left swings back.
6. Walking away from the viewer. The foot on the viewer's right steps forward, away from the viewer. The foot on the viewer's left stays back. The arm on the viewer's left swings forward. The arm on the viewer's right swings back.

Row 3, a full side view, the body turned 90 degrees so the figure faces the left edge of the picture in all three cells, only one eye visible:
7. Standing still. Feet together, both flat on the ground. Arms hanging straight at the sides.
8. Mid-stride. The leg nearest the viewer reaches forward with the heel touching the ground and the toes up. The leg farthest from the viewer is behind, with only the toes touching the ground and the heel lifted. The arm nearest the viewer swings back. The arm farthest from the viewer swings forward.
9. Legs passing. The leg nearest the viewer is straight under the body with the foot flat on the ground. The leg farthest from the viewer is lifted beside it, knee bent, foot off the ground. The body is a little higher. The arm nearest the viewer swings forward. The arm farthest from the viewer swings back.`;
module.exports = { PROMPT };
