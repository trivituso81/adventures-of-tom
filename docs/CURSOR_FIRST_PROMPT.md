# First prompt for Cursor

Paste this as the first message in Cursor (web or desktop), with this repo selected:

---

Read AGENTS.md, then docs/WORKFLOW.md and docs/NEXT_TASKS.md. Do not read other files yet.

Set up the environment (pip install playwright pillow; python3 -m playwright install chromium), then run `python3 tools/smoke.py` once to confirm the game boots and the test passes. Tell me the result in one sentence.

Then do Task 1 in docs/NEXT_TASKS.md (rebuild Grace's Cartwheel). Work on a branch called `grace-cartwheel`. When done, tell me in a few sentences what changed and what to look for on my phone, and list the exact files you changed.

I do not code. Do not ask me to run anything or to pick between options; make the call and tell me which one you made.

---

For later sessions, a shorter prompt works: "Read AGENTS.md and docs/NEXT_TASKS.md and continue."
