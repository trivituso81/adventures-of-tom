# Step 0: rejoin the zip (do this first)

Tom downloaded 7 files: adventures-of-tom-2026-10-25.zip.part0 through .part6, plus this file. Put them all in one folder, then run:

- macOS or Linux: `cat adventures-of-tom-2026-10-25.zip.part0 adventures-of-tom-2026-10-25.zip.part1 adventures-of-tom-2026-10-25.zip.part2 adventures-of-tom-2026-10-25.zip.part3 adventures-of-tom-2026-10-25.zip.part4 adventures-of-tom-2026-10-25.zip.part5 adventures-of-tom-2026-10-25.zip.part6 > adventures-of-tom-2026-10-25.zip`
- Windows (cmd): `copy /b adventures-of-tom-2026-10-25.zip.part0+adventures-of-tom-2026-10-25.zip.part1+adventures-of-tom-2026-10-25.zip.part2+adventures-of-tom-2026-10-25.zip.part3+adventures-of-tom-2026-10-25.zip.part4+adventures-of-tom-2026-10-25.zip.part5+adventures-of-tom-2026-10-25.zip.part6 adventures-of-tom-2026-10-25.zip`

Check the result before unzipping. It must be 26457442 bytes with SHA-256
`9e83bacb514747139353229e4fed46ad5993c25aa018ba5fac7275cb290c9267`
(macOS: `shasum -a 256 adventures-of-tom-2026-10-25.zip`). If it does not match, a part is missing or a browser renamed one (for example added "(1)"); ask Tom to re-download that part.

Unzip it into a folder named `adventures-of-tom` (if that folder or repo already exists from an earlier deploy, replace its files, keep `.git`). That folder is the site. Do not commit the .part files or the .zip.

# The Adventures of Tom: deploy brief for Cursor

You are deploying a finished static web game. Do not change any game code. Your only job is to put these files online and give Tom one URL he can add to his iPhone home screen.

## What this folder is

- A complete static site: `index.html` at the root, plus `engine/`, `data/`, `portraits/`, icons and `demo/`.
- No build step, no framework, no package.json, no server code. Every file is served as is.
- Snapshot of the live claude.ai build (artifact version 1792931135-141f, includes the Rose Shoulder Ride animation), exported 2026-10-25.
- `index.html` loads about 80 classic `<script>` files in a fixed order. Never reorder, bundle, minify or rename them.
- `demo/index.html` is a frozen older build, opened from the title screen's DEMO button by relative path. Keep the `demo/` folder exactly where it is.
- Voice clips are large JavaScript files (`data/voice/*.js`, up to 5.4 MB each; `demo/data/voice-clips.js` is 7 MB). Total size is about 37 MB. All files are under GitHub's 100 MB limit, so no Git LFS is needed.

## Steps

1. If a repo for this game already exists in the workspace, replace its contents with this folder (keep `.git`). Otherwise create a new Git repo named `adventures-of-tom` from this folder.
2. Commit everything, including the large `data/voice/*.js` files. Do not add them to `.gitignore`.
3. Push to GitHub (private repo is fine).
4. Deploy on Vercel as a static site:
   - Framework preset: Other. Build command: none. Output directory: `.` (the repo root). Install command: none.
   - `vercel.json` in this folder sets cache headers so new versions show up right away. Keep it.
   - If Vercel is not available, Netlify (publish directory `.`, no build command) or GitHub Pages (deploy from the main branch root) work the same way.
5. Open the deployed URL and check (see Verify below).
6. Give Tom the URL.

## Verify after deploy

| Check | Expected |
|---|---|
| Open `/` | Title screen "The Adventures of Tom" with the family at dusk, buttons PART 1, PART 2, DEMO, BATTLE LAB |
| Browser console | No red errors |
| Network tab | Every `engine/*.js`, `data/*.js` and `data/voice/*.js` returns 200 (no 404s) |
| PART 1, then START NEW | Chapter 1 title card over the town square, D-pad and A button visible |
| DEMO button | Opens `/demo/index.html`, demo title screen with START NEW / LOAD / BACK |
| Phone width (390 x 844) | Layout fits with no sideways scrolling |

## Things that are expected, not bugs

- `engine/cloud-save.js` syncs saves through the claude.ai artifact runtime (`window.claude`). Off claude.ai that object does not exist, so the file silently does nothing and saves live in the browser's local storage only. Do not try to fix or remove it.
- Saves do not carry over from the claude.ai version: browser storage belongs to each website address. Tom starts fresh on the new URL (or uses the chapter select).
- Sound starts only after the first tap. That is a browser rule.

## For Tom's iPhone

- In Safari, open the URL, tap Share, then Add to Home Screen. The page already declares the icon (`icon-v4.png`) and full-screen web-app mode, so it opens without the Safari bar.

## Updating later

Future versions come as a new zip of this same folder. Replace every file in the repo with the new ones, commit, push. Vercel redeploys on its own. Do not merge by hand; the zip is always the complete game.
