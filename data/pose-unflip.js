'use strict';
// qa-bug12c (2026-11-20): lettering that must still read the right way round when a painted story pose is mirrored (facing1 mirrors a
// leaning mood or talking pose to face who they look at). Per painted atlas id (set id in data/story-poses.js plus "Story") and frame: boxes [x, y, w, h] in frame pixels
// of the painting as baked. paintedCanvas (engine/painted.js) paints each box from the unmirrored painting at its mirrored place, only over
// the figure (source-atop), so the cap writing reads correctly and the outline stays the mirrored one. Measured by eye on zoomed frames.
// A rebake of a listed atlas (bake_story_poses.py) that moves the figure needs these boxes measured again: python3 tools/pose_unflip_test.py
// saves a sheet of every box to look at.
const POSE_UNFLIP={
  boppyemoStory:{em_loving:[[56,16,61,41]],em_scared:[[100,26,54,41]],em_surprised:[[76,28,48,37]],em_proud:[[89,0,54,30]],em_unimpressed:[[95,10,45,37]]},
  boppytalkStory:{tk_tell:[[157,30,58,35]],tk_point:[[143,18,58,37]],tk_answer:[[184,34,62,20]]}
};
