# Item staging report (item1, Tom 2026-11-12: "they have to surround the starter, each character visible and not overlapping ... facing in the
# right direction ... not hidden by overlapping layers ... check that for every single possible instance of when you interact with an item").
# Reads the result.json of tools/reaction_test.py run on cases that have "obj" (the harness walks Tom up to the object and presses A).
# Usage: python3 tools/item_stage_report.py OUT/result.json     Every row must be ok.
import json,sys,math
r=json.load(open(sys.argv[1])); bad=0
print('%-14s %-5s %-5s %s'%('scene','pages','press','problems (first page that shows each)'))
for name,v in r.items():
    info=v.get('info',{}); R=info.get('obj'); snaps=v.get('snaps',[]); probs={}
    if not R: print('%-14s NOT RUN %s'%(name,v.get('errs'))); bad+=1; continue
    x0,y0,x1,y1=R[0],R[1],R[0]+R[2],R[1]+R[3]
    for i,s in enumerate(snaps):
        if s.get('map')!=info.get('map'): continue    # the scene moved to another map: the object is no longer on screen
        P=[p for p in s['party'] if not p['hidden']]
        for a in range(len(P)):
            for b in range(a+1,len(P)):
                dx=abs(round(P[a]['pos'][0])-round(P[b]['pos'][0])); dy=abs(round(P[a]['pos'][1])-round(P[b]['pos'][1]))
                if dx<1 and dy<3: probs.setdefault('overlap %s/%s'%(P[a]['id'],P[b]['id']),i)
        for p in P:
            if p.get('pose'): continue
            px,py=p['pos'][0]+.5,p['pos'][1]+.2
            gx=max(x0-px,0)-max(px-x1,0); gy=max(y0-py,0)-max(py-y1,0); gap=math.hypot(gx,gy)
            if gap>3.6: probs.setdefault('%s far (%.1f tiles)'%(p['id'],gap),i)
            want=('right' if gx>0 else 'left') if abs(gx)>abs(gy) else ('down' if gy>0 else 'up')
            alt=('down' if gy>0 else 'up') if abs(gx)>abs(gy) else ('right' if gx>0 else 'left')
            ok=[want]+([alt] if min(abs(gx),abs(gy))>.3*max(abs(gx),abs(gy)) else [])
            if (gx or gy) and p['facing'] not in ok: probs.setdefault('%s faces %s, object is %s'%(p['id'],p['facing'],want),i)
            if p.get('hid'): probs.setdefault('%s behind scenery'%p['id'],i)
    if probs: bad+=1
    print('%-14s %-5d %-5s %s'%(name,len(snaps),info.get('press'),'; '.join('%s (p%d)'%(k,i) for k,i in probs.items()) or 'ok'))
sys.exit(1 if bad else 0)
