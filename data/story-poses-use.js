'use strict';
// data/story-poses-use.js — Registers the painted cutscene poses (data/story-poses.js, art/chars/<id>-story.webp; storypose1, 2026-11-06).
// STORY_POSES[memberId][frame] = tagged rows (palette in STORY_POSES[memberId].pals[frame]) at the overworld row scale. A scene shows one with {pose:'<actor>', f:'<frame>'}
// (engine/story.js scenePoseDraw draws it at the actor's walk size, facing the camera as painted). Loaded after engine/painted.js.
const STORY_POSES={};
(function() {
  if(typeof STORY_POSES_SRC==='undefined') return;
  for(const id of Object.keys(STORY_POSES_SRC)) {
    const S=STORY_POSES_SRC[id],aid=id+'Story',mid=S.member||id;   // a set can belong to another member (tomride is Tom's)
    paintedAtlas(aid,S.atlas.src,S.atlas.rects,S.atlas.k);
    const set=STORY_POSES[mid]||(STORY_POSES[mid]={atlases:[],pals:{}}); set.atlases.push(aid);
    for(const f of Object.keys(S.frames)) { set[f]=paintRows(S.frames[f],aid,f,false); set.pals[f]=S.pal; }   // each sheet has its own palette
  }
})();
// Load a member's story sheet ahead of a scene, so the first pose is painted at once.
function storyPosesLoad(id) { const S=STORY_POSES[id]; if(S) for(const aid of S.atlases) { const a=PAINTED[aid]; if(a) paintedLoad(a); } }
