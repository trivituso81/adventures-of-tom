# AoT Script Studio (hosted at /script-studio/)

React + Tailwind + lucide-react app (`src/App.jsx`), built with Vite into `script-studio/` (committed; the site has no build step).

- New version of the component from Tom: `python3 tools/script-studio/apply_vault_patch.py <his file.jsx>` (writes `src/App.jsx` with the hosted-vault patch), then rebuild.
- Rebuild after changing the app: `cd tools/script-studio && npm install && npm run build`, then commit `script-studio/`.
- The six reference docs live in `script-studio/reference-vault/` and are fetched at runtime, so editing a `.md` there needs no rebuild.
  `python3 tools/script-studio/sync_vault.py` refreshes them from `claude/` and `docs/`. In the app, Tab 1 > Sync Hosted Defaults pulls the latest into the browser.
- Startup merge never overwrites a doc the user edited or uploaded. The Gemini key is typed into API Settings and kept in the browser only; it is never in the repo or the build.
- Test: `python3 tools/script-studio/e2e_test.py` (needs playwright and chromium).
