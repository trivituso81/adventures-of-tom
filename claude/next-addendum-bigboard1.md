# bigboard1: board saves fail with "JSON.parse: unexpected end of data" (2026-11-20)

## Cause (verified)
- data/board.json is 1,051,107 bytes (451 cards), just over GitHub's 1 MB limit (1,048,576).
- Above 1 MB the contents API (GET /repos/.../contents/data/board.json) returns `content: ""` and `encoding: "none"`.
- board.html `save0()` does `JSON.parse(t64(j.content))` on every button, so every save throws. `load()` hits the same thing but silently falls back to the Pages copy ("site copy").
- Any other page or tool that reads a repo file through the contents API will break the same way once that file passes 1 MB.

## Fix (written and tested by the session that found it; not pushed, because attaching the repo with push access was refused in that session)
Add this helper above `async function load(){` in board.html:

```js
// bigboard1: GitHub's contents API leaves `content` empty once a file passes 1 MB (data/board.json reached 1.05 MB on 2026-11-20,
// so every save failed with "JSON.parse: unexpected end of data"). Read big files through the git blob API instead (works to 100 MB).
async function ghBoard(tok){
  const H={Authorization:'Bearer '+(tok||'test'),Accept:'application/vnd.github+json'};
  const r=await fetch(URLF()+'?ref=main&t='+Date.now(),{cache:'no-store',headers:H});
  if(r.status===404)return null;
  if(!r.ok)throw new Error('GitHub '+r.status);
  const j=await r.json();let c=j.content||'';
  if(!c.replace(/\s/g,'')){
    const b=await fetch(GH()+'/repos/'+REPO+'/git/blobs/'+j.sha+'?t='+Date.now(),{cache:'no-store',headers:H});
    if(!b.ok)throw new Error('GitHub '+b.status);
    c=(await b.json()).content||'';
  }
  return {sha:j.sha,doc:JSON.parse(t64(c))};
}
```

In `load()`, replace the two-line contents fetch inside the `try` with:
```js
    try{const g=await ghBoard(tok);if(g){sha=g.sha;B=g.doc;$('src').textContent='live';stamp();return;}}catch(e){}
```

In `save0()`, replace the fetch line plus the `if(r.status===404)...` line with:
```js
    const g=await ghBoard(tok);
    let doc,s=null;
    if(!g){doc=B;}else{s=g.sha;doc=g.doc;}
```
(The `let doc,s=null;` line that sat between them is replaced too, so it is not declared twice.)

Test done: node syntax check on all board.html scripts; mocked fetch returning `content:""` then the blob, decoded the real 1.05 MB board.json to 451 cards.

## Also do in the same push
1. Grep the repo for other `contents/` reads followed by `JSON.parse(t64(` or `atob(j.content` (Art, Voice, Music Libraries, admin pages, tools/*.py using the API) and give them the same blob fallback.
2. Shrink board.json so it stays fast on the phone: move Done cards older than 7 days to data/board-archive.json (keep id, title, theme, tag, final history line). Check tools/board_sync.py, board_check.py and bump_tags.py still pass (a tag on an archived card must still count as "on a card").
3. Push as build `bigboard1` on its card, docs/CHANGES.md entry, then open ADMIN > BOARD on the phone check: tap "I did this" on any card saves without the error.

## Built (2026-11-20, build bigboard1, commit f0b6ef4 on main)
- board.html fix applied exactly as written (`ghBoard`, `load()`, `save0()`). Verified against the real API: `contents/data/board.json` returns `content: ""`, encoding `none`, size 1,080,478; the blob route returns it whole. The live Pages copy carries the fix.
- Item 1 (other readers): the blob fallback went into the `gh()` helpers of heads, poses, portraits, music and art, `engine/voice-take.js`, `engine/pose-review.js` and `script.html` `ghGetFile`. Several of them treated an empty `content` as `{}` and would have written the file back as `{}` plus one change. Already safe: `engine/clip-review.js`, `engine/build-history.js` and the report reads (raw media type), `splash-edit.js`, `report.js`. No Python tool reads through the API.
- Item 2 (archive): `tools/board_archive.py`, run at the end of every `board_sync.py` run (rule R13). Stubs are card-shaped, so `board_check.py`, `build_history.py` and R3 use them; the `board-sync` workflow commits `data/board-archive.json`. Nothing is older than 7 days yet (the board began 2026-11-19), so the archive is empty until the hourly job on 2026-11-27; the board stays about 1.08 MB until then. Archived cards leave the Shipped list.
- Tests: `tools/board_big_test.py` (fails on the old page, passes on the new), `tools/board_archive_test.py`. `tools/art-library/stub.py` now behaves like GitHub over 1 MiB (empty content) and serves `/git/blobs/<sha>`.
- Failing before and after this change (checked by stashing it): board_sync_test (R5 replay of today, unstick card), board_test (Queued and "back" counts), board_artgen_test, art-library/test.py, upload_test.py, voice-library/voicetake_test.py, heads_test.py, script_convo_test.py; portraits_test is stale and flaky.
- Next: Tom card t-bigboard1-tap (All good on it is a save, so it is the phone check).
