# Tom's in-game reports (docs/REPORTS.md). The game's REPORT tab files each one on branch `inbox` as reports/<id>.json + reports/<id>.jpg.
# Usage (repo root):
#   python3 tools/reports.py list [OUT]        fetch the inbox, copy every open report to OUT (default /tmp/aot-reports), print the backlog
#   python3 tools/reports.py done <id> [...]   delete those reports from the inbox (after the fix is pushed and logged in docs/CHANGES.md)
#   python3 tools/reports.py done --all        delete every report that `list` last showed
# The inbox is its own tiny branch with no shared history, so fetching it is quick and it never touches the live game on main.
import subprocess, sys, os, json, tempfile
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def git(*a,env=None,inp=None,check=True):
    r=subprocess.run(['git','-C',ROOT,*a],capture_output=True,env=env,input=inp)
    if check and r.returncode: raise SystemExit('git '+' '.join(a)+' failed:\n'+r.stderr.decode())
    return r.stdout
def fetch(): git('fetch','--depth','1','origin','+refs/heads/inbox:refs/remotes/origin/inbox')
def names(): return [l for l in git('ls-tree','-r','--name-only','origin/inbox','reports/',check=False).decode().split('\n') if l]
def cmd_list(out):
    fetch(); os.makedirs(out,exist_ok=True); fs=names(); rows=[]
    for f in fs:
        open(os.path.join(out,os.path.basename(f)),'wb').write(git('show','origin/inbox:'+f))
    for f in sorted(x for x in fs if x.endswith('.json')):
        d=json.loads(git('show','origin/inbox:'+f)); w=d.get('where') or {}; m=w.get('map') or {}
        rows.append(d)
        print(f"{d['id']}  [{d.get('kind')}]  {d.get('at')}  build {w.get('build')}  {w.get('mode')}  ch {(w.get('story') or {}).get('chapter')}  {m.get('id')} ({m.get('x')},{m.get('y')})  {(w.get('screen') or {}).get('layout')}"
              +(f"  scene {w['scene']['id']}" if w.get('scene') and w['scene'].get('id') else ''))
        print('    '+(d.get('note') or '(no note)').replace('\n','\n    '))
        if d.get('pins'): print('    pins: '+', '.join(f"{p['n']} at {round(p['x']*100)}%,{round(p['y']*100)}%" for p in d['pins']))
        if w.get('dialog'): print(f"    on screen: {w['dialog']['who']}: \"{w['dialog']['text']}\"")
        print('    picture: '+(os.path.join(out,d['id']+'.jpg') if d.get('shot') else 'none')+'   details: '+os.path.join(out,d['id']+'.json'))
    orphans=[f for f in fs if f.endswith('.jpg') and f[:-4]+'.json' not in fs]
    if orphans: print('half-sent (picture only, the note is still on the phone): '+', '.join(orphans))
    print(f'{len(rows)} open report(s).')
def cmd_done(ids):
    fetch(); fs=names()
    if ids==['--all']: gone=fs
    else: gone=[f for f in fs if os.path.basename(f).rsplit('.',1)[0] in ids]
    if not gone: print('nothing to delete'); return
    with tempfile.TemporaryDirectory() as td:
        env=dict(os.environ,GIT_INDEX_FILE=os.path.join(td,'index'))
        git('read-tree','origin/inbox',env=env)
        git('update-index','--force-remove','--',*gone,env=env)
        tree=git('write-tree',env=env).decode().strip()
    done=sorted({os.path.basename(f).rsplit('.',1)[0] for f in gone})
    c=git('commit-tree',tree,'-p','origin/inbox','-m','Reports closed: '+', '.join(done)).decode().strip()
    git('push','origin',c+':refs/heads/inbox')
    print('closed '+', '.join(done))
if __name__=='__main__':
    a=sys.argv[1:]
    if a[:1]==['list']: cmd_list(a[1] if len(a)>1 else '/tmp/aot-reports')
    elif a[:1]==['done'] and len(a)>1: cmd_done(a[1:])
    else: raise SystemExit(__doc__ or 'usage: reports.py list [OUT] | done <id>... | done --all')
