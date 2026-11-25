# AoT Script Studio (hosted at /script-studio/)

React + Tailwind + lucide-react app (`src/App.jsx`), built with Vite into `script-studio/` (committed; the site has no build step).

- New version of the component from Tom: `python3 tools/script-studio/apply_vault_patch.py <his file.jsx>` (writes `src/App.jsx` with the hosted-vault patch), then rebuild.
- Rebuild after changing the app: `cd tools/script-studio && npm install && npm run build`, then commit `script-studio/`.
- The six reference docs live in `script-studio/reference-vault/` and are fetched at runtime, so editing a `.md` there needs no rebuild.
  `python3 tools/script-studio/sync_vault.py` refreshes them from `claude/` and `docs/`. In the app, Tab 1 > Sync Hosted Defaults pulls the latest into the browser.
- Startup merge never overwrites a doc the user edited or uploaded. The Gemini key is typed into API Settings and kept in the browser only; it is never in the repo or the build.
- Test: `python3 tools/script-studio/e2e_test.py` (needs playwright and chromium).
- Generate Scene runs a 4-pass pipeline (draft, format, linter plus Showrunner critic, up to 4 auto-rewrites, early stop after 2 non-improving retries; `lintScene` and `runSceneQAPipeline` in `src/App.jsx`). Test with the Gemini API mocked: `python3 tools/script-studio/qa_test.py`.
- Checkers tab: Chapter Coherence Audit (storyline, per chapter) and Cross-Chapter Tie-In Audit (trajectory, all populated chapters), both on the Audit Model at 0.2. Presets are Gemini 4 neon (generation), carbon (audit), hydrogen (budget). Test with Gemini mocked: `python3 tools/script-studio/audit_test.py`.
- QA badge: Fix Remaining Issues (under 8/10) runs one more surgical rewrite on the saved Critic issues (`runFixPass`). Linter flags "Tata" (use "Ta-Ta").
- Strict bar: pass needs score 8+, 0 linter errors and no high-severity Logic, Canon, Voice or KnowledgeGate issue. Generation default is Gemini 4 Carbon. Generate Chapter (top of the chapter) runs the pipeline on every empty scene and ends with a summary of the scenes that still fail.
- Read Mode (header toggle): centered screenplay view, Current Scene or Full Chapter, QA pill per scene, click a line to jump back to it in Edit Mode. Test: `python3 tools/script-studio/read_test.py`.
