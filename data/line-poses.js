'use strict';
// data/line-poses.js — lines that play one specific painted pose and its dialogue face (c-reports, 2026-11-19; Tom's reports r-20261114-100352-7v5z and r-20261114-162358-jykk).
// LINE_POSES['Speaker|text'] = {id: story pose owner, f: frame in STORY_POSES[id], face: file suffix of portraits/talk/pose/<id>-<face>.webp}.
// engine/emotions.js emoApply uses it before the talking and feelings poses. Frames: tools/sprite-bake/report_singles.py, bake_story_poses.py REPORT_STRIPS;
// faces: tools/sprite-bake/bake_report_faces.py.
const LINE_POSES={
  // Deedee looks for the reading glasses that sit on top of her head (her press-A chat in her house, data/maps-le.js).
  "Deedee|Have you seen my reading glasses? I had them a minute ago. I've looked everywhere. Twice.":{id:'deedee',f:'c1d_glasses',face:'glasses'},
  // Chapter 1: Deedee holds up the burnt flashbulb she found at the pond (SCENES.ch1Spot).
  "Deedee|A flashbulb, from an old camera. It's burnt. Somebody set it off right here and left it by your grandfather's chair.":{id:'deedee',f:'c1d_bulb',face:'bulb'},
  // Chapter 3: Rose holds the bulb up high on the sundial rock (SCENES, ch3-bulb).
  "Rose|And there's Deedee's litter! On the clock rock!":{id:'rose',f:'c3r_bulb',face:'bulb'}
};
