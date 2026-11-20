#!/usr/bin/env python3
"""Builds the Script Review page from the chapter markdown files.

Usage: python3 build.py     (reads src/chNN.md, writes data/chNN.json and data/chapters.json)
The page (index.html) never changes. To add or update a chapter: save its markdown as
src/chNN.md, add or edit its row in CHAPTERS, run this, then publish only the data files
it names to the Script Review artifact (publish_files, mode patch).
"""
import re, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))

# status: "locked" or "review". when: shown beside the status.
CHAPTERS = [
    {"n": 1, "file": "ch01.md", "place": "Long Island", "boss": "The Big One",
     "status": "locked", "when": "Locked 2026-11-17 15:46. Optional scene 2b approved 17:19", "doc": "claude/story-ch01-draft2.md"},
    {"n": 2, "file": "ch02.md", "place": "Los Angeles", "boss": "The Big Shake",
     "status": "locked", "when": "Locked 2026-11-17 14:36. Four lines changed 2026-11-17 after the cold read (scenes 5 and 6)", "doc": "claude/story-ch02-draft4.md"},
    {"n": 3, "file": "ch03.md", "place": "Long Island", "boss": "Old Iron-Gill",
     "status": "locked", "when": "Locked 2026-11-17 17:16. Two action lines changed 2026-11-17 after the cold read (scenes 5 and 11)", "doc": "claude/story-ch03-draft1.md"},
]

def words(s):
    s = re.sub(r"\[[^\]]*\]", "", s)
    return " ".join(re.findall(r"[a-z0-9']+", s.lower().replace("’", "'")))

def blocks(lines):
    """Paragraphs, numbered lists and tables from loose markdown lines."""
    out, i = [], 0
    while i < len(lines):
        l = lines[i].strip()
        if not l:
            i += 1; continue
        if l.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            out.append({"t": "table", "head": rows[0], "rows": rows[1:]})
            continue
        if re.match(r"\d+\. ", l):
            items = []
            while i < len(lines) and re.match(r"\d+\. ", lines[i].strip()):
                items.append(re.sub(r"^\d+\. ", "", lines[i].strip())); i += 1
            out.append({"t": "ol", "items": items}); continue
        out.append({"t": "p", "text": l}); i += 1
    return out

def parse(path):
    raw = open(path, encoding="utf-8").read().replace("\r", "")
    assert "—" not in raw, "em dash in " + path
    parts = re.split(r"^## ", raw, flags=re.M)
    head = parts[0].strip().split("\n")
    ch = {"headline": head[0].lstrip("# ").strip(), "intro": blocks(head[1:]),
          "scenes": [], "facts": None, "factsTitle": "", "voiceTitle": ""}
    voice = {}
    for sec in parts[1:]:
        title, _, body = sec.partition("\n")
        lines = body.split("\n")
        m = re.match(r"Scene (\d+[a-z]?)\. (.*)", title)
        if m:
            sc = {"n": m.group(1), "title": m.group(2).strip(), "idea": "", "items": []}
            for l in lines:
                l = l.strip()
                if not l: continue
                if l.startswith("Idea: "): sc["idea"] = l[6:]
                elif l.startswith("[") and l.endswith("]"):
                    inner = l[1:-1]
                    kind = "fight" if re.match(r"(Boss fight|Fight)\b", inner) else \
                           "tombo" if inner.startswith("New Tombo") else "action"
                    sc["items"].append({"k": kind, "text": inner})
                elif l.startswith("- "):
                    sp, _, tx = l[2:].partition(": ")
                    via = ""
                    mm = re.match(r"(.*?) \((.*)\)$", sp)
                    if mm: sp, via = mm.group(1), mm.group(2)
                    new = tx.endswith(" (new)")
                    if new: tx = tx[:-6]
                    sc["items"].append({"k": "line", "who": sp, "via": via, "text": tx, "new": new})
                else:
                    sc["items"].append({"k": "note", "text": l})
            ch["scenes"].append(sc)
        elif title.startswith("Voice scripts"):
            ch["voiceTitle"] = title
            cur = None
            for l in lines:
                l = l.strip()
                m2 = re.match(r"Scene (\d+[a-z]?)$", l)
                if m2: cur = m2.group(1); continue
                if l.startswith("- "):
                    sp, _, tx = l[2:].partition(": ")
                    sp = re.sub(r" \(.*\)$", "", sp)
                    voice[(cur, sp, words(tx))] = tx
        elif title.startswith("Facts"):
            ch["factsTitle"] = title
            b = blocks(lines)
            ch["facts"] = next((x for x in b if x["t"] == "table"), None)
        else:
            ch["intro"].append({"t": "p", "text": title}); ch["intro"] += blocks(lines)
    missing = 0; total = 0
    for sc in ch["scenes"]:
        for it in sc["items"]:
            if it["k"] == "line":
                total += 1
                v = voice.get((sc["n"], it["who"], words(it["text"])))
                if v: it["tone"] = v
                else: missing += 1
    ch["lineCount"] = total
    print(os.path.basename(path), "scenes", len(ch["scenes"]), "lines", total,
          "voice scripts", len(voice), "lines with no voice script", missing)
    return ch

def main():
    """Writes data/chapters.json (the list) and data/chNN.json for every chapter whose
    markdown is in src/. A chapter with no markdown on disk keeps its published json."""
    os.makedirs(os.path.join(HERE, "data"), exist_ok=True)
    built = []
    for c in CHAPTERS:
        p = os.path.join(HERE, "src", c["file"])
        if not os.path.exists(p):
            print("skipped (no markdown on disk):", c["file"]); continue
        d = parse(p); d.update({k: c[k] for k in ("n", "place", "boss", "status", "when", "doc")})
        name = "ch%02d.json" % c["n"]
        js = json.dumps(d, ensure_ascii=False, indent=0)
        assert "—" not in js
        open(os.path.join(HERE, "data", name), "w", encoding="utf-8").write(js)
        built.append("data/" + name)
    man = [{"n": c["n"], "status": c["status"], "file": "data/ch%02d.json" % c["n"]} for c in CHAPTERS]
    open(os.path.join(HERE, "data", "chapters.json"), "w", encoding="utf-8").write(json.dumps(man, indent=0))
    print("publish these files:", ["data/chapters.json"] + built)

if __name__ == "__main__":
    main()
