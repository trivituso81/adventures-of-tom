# Inbox: Tom's in-game reports

The game's REPORT tab files each report here as `reports/<id>.json` (the note, pins and where the game was) and `reports/<id>.jpg` (the frozen screen).
This branch shares no history with `main` and is never served. Claude reads it with `python3 tools/reports.py list` and deletes each report once its fix is on `main` and logged in `docs/CHANGES.md`. See `docs/REPORTS.md` on `main`.
