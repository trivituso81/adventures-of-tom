#!/usr/bin/env python3
"""fix-artgen3try: the art-bake hook for the Art Library group "Party banners" (entries banner-join-<id>, banner-leave-<id>).
art_bake.py copies the approved picture to tools/sprite-bake/src/party-banner-last.png (one shared file, overwritten each time) and runs this,
which re-runs tools/art-library/bake_partybanners.py: every approved banner -> art/banners/<kind>-<id>.webp and data/party-banners.js.
So a banner approved by Tom or by QA (artgen3) shows in the game with no session. The tag in PARTY_BANNERS_V is new on every run, so phones fetch the new pictures.
Usage: python3 -I tools/sprite-bake/bake_party_banner.py"""
import os, subprocess, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
tag = 'banner' + os.environ.get('GITHUB_RUN_NUMBER', time.strftime('%m%d%H%M%S'))
sys.exit(subprocess.call([sys.executable, '-I', os.path.join(ROOT, 'tools', 'art-library', 'bake_partybanners.py'), tag], cwd=ROOT))
