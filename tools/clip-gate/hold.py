#!/usr/bin/env python3
"""The gate as the clip-gen Action uses it (clipgate2): judge a freshly made video BEFORE it is approved.

  hold.check(entry, video, marks, key=None, base=None, runs=3, cap=.08, model=None) -> {'hold': bool, 'measured': [...], 'vision': [...],
                                                                                         'reasons': [...], 'spent': dollars}

A clip is held (not approved) when the measured gate (gate.py, judged as the game will play it: gate.header_for) flags anything, or when
the vision check's majority answers `no` to a question listed under `hold` in vision-policy.json. Questions under `advisory` are reported
and never hold. Without a key (or with vision off) only the measured part runs and the result says so. Never raises on the vision part:
a failed vision call is reported as `vision_error` and does not hold the clip (the measured part and Tom's review are still there)."""
import json, os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def policy():
    return json.load(open(os.path.join(HERE, 'vision-policy.json'), encoding='utf-8'))


def check(e, video, marks, key=None, base=None, runs=3, cap=.08, model=None):
    import gate, measure, vision
    out = {'hold': False, 'measured': [], 'vision': [], 'reasons': [], 'spent': 0.0, 'vision_ran': False}
    hd = gate.header_for(e, marks, video)
    meas = measure.measure(video)
    flags = gate.judge(e, meas, hd)
    out['measured'] = [f['check'] for f in flags]
    out['reasons'] += ['%s: %s' % (f['check'], f['says']) for f in flags]
    if key:
        try:
            o, mv = gate.owner_move(e)
            kind = e['clip'].get('kind') or 'strike'
            qids = vision.questions(o, mv, kind)
            if qids:
                g, h, info = vision.build_images(e, meas, hd, gate, video=video)
                xai = vision.Xai(key, base or os.environ.get('XAI_BASE', 'https://api.x.ai'))
                m = model or vision.pick_model(xai.models())['id']
                answers, spent = [], 0.0
                for _ in range(runs):
                    if spent + .02 > cap:
                        break
                    resp = xai.chat(m, [g, h], vision.prompt_text(o, mv, kind, qids, info))
                    spent += vision.usd(resp.get('usage') or {}, m)
                    try: answers.append(vision.parse(resp['choices'][0]['message']['content'])[1])
                    except Exception: pass
                out['spent'] = round(spent, 4); out['vision_ran'] = bool(answers)
                v = vision.verdict(answers, qids)
                pol = policy()
                for q, x in v.items():
                    if not x['yes'] and q in pol['hold']:
                        out['vision'].append(q)
                        out['reasons'].append('vision %s: %s' % (q, '; '.join(x['why']) or vision.Q[q]))
        except SystemExit as ex:
            out['vision_error'] = str(ex)
        except Exception as ex:
            out['vision_error'] = type(ex).__name__ + ': ' + str(ex)[:200]
    out['hold'] = bool(out['reasons'])
    return out
