'use strict';
// data/story-poses-use.js — Registers the painted cutscene poses (data/story-poses.js, art/chars/<id>-story.webp; storypose1, 2026-11-06).
// STORY_POSES[memberId][frame] = tagged rows at the overworld row scale. A scene shows one with {pose:'<actor>', f:'<frame>'}
// (engine/story.js scenePoseDraw draws it at the actor's walk size, facing the camera as painted). Loaded after engine/painted.js.
const STORY_POSES={};
(function() {
  if(typeof STORY_POSES_SRC==='undefined') return;
  for(const id of Object.keys(STORY_POSES_SRC)) {
    const S=STORY_POSES_SRC[id],aid=id+'Story';
    paintedAtlas(aid,S.atlas.src,S.atlas.rects,S.atlas.k);
    const set=STORY_POSES[id]={pal:S.pal,atlas:aid};
    for(const f of Object.keys(S.frames)) set[f]=paintRows(S.frames[f],aid,f,false);
  }
})();
// Load a member's story sheet ahead of a scene, so the first pose is painted at once.
function storyPosesLoad(id) { const S=STORY_POSES[id],a=S&&PAINTED[S.atlas]; if(a) paintedLoad(a); }
