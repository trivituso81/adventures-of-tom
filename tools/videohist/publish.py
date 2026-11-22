#!/usr/bin/env python3
"""videohist2: rebuild the Video History from branch wangen's files and push it to main (called by the wan-gen Action after a run that made videos).
Works on a fresh clone of main (the workflow checkout is shallow and main may have moved during the run), so it never touches the caller's checkout.
Usage: python3 tools/videohist/publish.py --branch-dir DIR --remote URL [--run-id N] [--branch main]
Commits only data/video-history.json and art/video-history/ ("videohist: rebuilt after wan-gen run N [skip ci]"); on a rejected push it fetches,
resets to the new main and rebuilds (so main's copy of every other file wins), up to 5 times. Test: python3 tools/videohist/videohist_test.py"""
import os, sys, argparse, subprocess, tempfile, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, 'build.py')


def run(cmd, cwd, check=True):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if check and p.returncode != 0:
        sys.exit('command failed (%s): %s\n%s' % (p.returncode, ' '.join(cmd[:4]), (p.stdout + p.stderr)[-600:]))
    return p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--branch-dir', required=True); ap.add_argument('--remote', required=True)
    ap.add_argument('--run-id', default='0'); ap.add_argument('--branch', default='main'); a = ap.parse_args()
    tmp = tempfile.mkdtemp(); work = os.path.join(tmp, 'main')
    try:
        run(['git', 'clone', '-q', '--depth', '1', '--branch', a.branch, a.remote, work], tmp)
        for k, v in (('user.name', 'github-actions[bot]'), ('user.email', '41898282+github-actions[bot]@users.noreply.github.com')):
            run(['git', 'config', k, v], work)
        for attempt in range(1, 6):
            # build.py works out its root from its own location, so run the copy that sits in the fresh clone
            script = os.path.join(work, 'tools', 'videohist', 'build.py')
            out = run([sys.executable, '-I', script, '--branch-dir', a.branch_dir], work)
            print(out.stdout.strip())
            run(['git', 'add', '-A', 'data/video-history.json', 'art/video-history'], work)
            if run(['git', 'diff', '--cached', '--quiet'], work, check=False).returncode == 0:
                print('Video History already current; nothing to push'); return 0
            run(['git', 'commit', '-q', '-m', 'videohist: rebuilt after wan-gen run %s [skip ci]' % a.run_id], work)
            p = run(['git', 'push', '-q', 'origin', 'HEAD:' + a.branch], work, check=False)
            if p.returncode == 0:
                print('pushed on try %d' % attempt); return 0
            print('push refused (try %d): %s' % (attempt, p.stderr.strip()[-300:]))
            run(['git', 'fetch', '-q', '--depth', '1', 'origin', a.branch], work)
            run(['git', 'reset', '-q', '--hard', 'FETCH_HEAD'], work)   # main's copy of every file; the next loop rebuilds our two
        print('could not push after 5 tries'); return 1
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main())
