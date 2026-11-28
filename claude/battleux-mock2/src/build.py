# Builds battle-story.html (the storybook battle screen proposal, card c-b3story) from the files in this folder.
# Repo root:  python3 -I claude/battleux-mock2/src/build.py          writes battle-story.html at the repo root (pictures in battle-story/, cut by cut.py)
# The page loads the game's own data files (real move names, lines, statuses, monsters), tagged with the build name.
import os,sys
H=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(os.path.join(H,'..','..','..'))
V=sys.argv[1] if len(sys.argv)>1 else 'b3story'
rd=lambda n: open(os.path.join(H,n),encoding='utf-8').read()
DATA=['b3-rules','b3-status','b3-kit-grace','b3-kit-tom','b3-kit-rose','b3-kit-deedee','b3-kit-tnb','b3-kit-nara','b3-foes-ch01','b3-ux-words']
tags='\n'.join('<script src="data/%s.js?v=%s"></script>'%(d,V) for d in DATA)
s=rd('shell.html').replace('/*APP_CSS*/',rd('app.css')).replace('/*VIEW_CSS*/',rd('view.css')).replace('<!--VIEW_HTML-->',rd('view.html')).replace('/*DATA_TAGS*/',tags).replace('/*APP_JS*/',rd('app.js')).replace('/*VIEW_JS*/',rd('view.js'))
out=os.path.join(ROOT,'battle-story.html'); open(out,'w',encoding='utf-8').write(s); print(out,len(s))
