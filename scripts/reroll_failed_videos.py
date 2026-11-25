import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from art_director_agent import get_character, load_manifest
from run_stage import generate_video_item, load_queue, resolve_hero_source, save_queue

PACKETS_PATH = Path("art-factory/move-packets-pass1.json")

def get_pass1_ids():
    if not PACKETS_PATH.exists():
        return set()
    data = json.loads(PACKETS_PATH.read_text(encoding="utf-8"))
    ids = set()
    for m in data.get("moves", []):
        if m.get("id"):
            ids.add(m["id"])
        counter = m.get("reactiveCounterClip")
        if isinstance(counter, dict) and counter.get("id"):
            ids.add(counter["id"])
    return ids

def main():
    manifest = load_manifest()
    cfg = manifest["config"]
    queue = load_queue(cfg["queue_path"])
    pass1_ids = get_pass1_ids()

    failed_items = [
        i for i in queue.get("items", [])
        if i.get("stage") == "battle_move_draft"
        and i.get("move_id") in pass1_ids
        and not i.get("qa_passed", False)
    ]
    if not failed_items:
        print("[reroll] 0 failed Pass-1 draft clips found. Nothing to reroll.", flush=True)
        return

    print(f"[reroll] regenerating {len(failed_items)} failed Pass-1 draft clip(s)", flush=True)

    def worker(item):
        char_id = item["character_id"]
        move_id = item["move_id"]
        try:
            char = get_character(manifest, char_id)
            hero_src = resolve_hero_source(char, cfg, allow_fallback=True)
            tags = ", ".join(item.get("qa_failure_tags", []))
            notes = item.get("qa_notes", "")
            feedback = (
                f"Fix previous QA issues ({tags}): {notes} "
                "Keep exact held props visible and consistent from frame 1 to final frame, "
                "single character only, flat #808080 mid-grey background with zero scenery."
            ).strip()
            return generate_video_item("battle_move_draft", char, cfg, move_id, feedback, hero_src)
        except Exception as exc:
            print(f"[reroll] FAILED {char_id}/{move_id}: {exc}", flush=True)
            return None

    total_done = 0
    for offset in range(0, len(failed_items), 6):
        chunk = failed_items[offset:offset + 6]
        with ThreadPoolExecutor(max_workers=min(3, len(chunk))) as ex:
            results = [r for r in ex.map(worker, chunk) if r is not None]
        for new_item in results:
            queue["items"] = [i for i in queue["items"] if i["id"] != new_item["id"]] + [new_item]
        save_queue(cfg["queue_path"], queue)
        total_done += len(results)
        print(f"[reroll] checkpointed {total_done}/{len(failed_items)} rerolled clip(s)", flush=True)

    print(f"[reroll] DONE: rerolled {total_done}/{len(failed_items)} clip(s).", flush=True)

if __name__ == "__main__":
    main()
