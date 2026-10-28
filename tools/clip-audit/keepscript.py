import re,difflib
TOK=re.compile(r"\[[^\]]*\]\s*|[^\s\[]+\s*")
def norm(w): return re.sub(r"[^a-z0-9']","",w.lower().replace('’',"'")).strip("'")
CONT=re.compile(r"^[a-z]+'(s|re|ll|ve|d|m|t)$")
def is_cont(w): n=norm(w); return bool(CONT.match(n)) or n in ("won't","can't","let's")
def convert(script,text):
    """Keep script tags and wording; swap in the line's own words wherever they differ by a contraction."""
    toks=TOK.findall(script)
    widx=[i for i,t in enumerate(toks) if not t.startswith('[')]
    sw=[norm(toks[i]) for i in widx]
    tsurf=text.replace('’',"'").split()
    tw=[norm(w) for w in tsurf]
    sm=difflib.SequenceMatcher(None,sw,tw,autojunk=False)
    out=list(toks); changed=0
    for op,i1,i2,j1,j2 in sm.get_opcodes():
        if op=='equal': continue
        tgt=tsurf[j1:j2]; src=[toks[widx[k]] for k in range(i1,i2)]
        if not (any(is_cont(w) for w in tgt) or any(is_cont(w) for w in src)): continue
        new=' '.join(tgt)
        if i2>i1:
            trail=re.search(r"\s*$",toks[widx[i2-1]]).group(0) or ' '
            out[widx[i1]]=new+trail if new else ''
            for k in range(i1+1,i2): out[widx[k]]=''
        else:
            at=widx[i1] if i1<len(widx) else None
            if at is None: out.append(' '+new)
            else: out[at]=new+' '+out[at]
        changed+=1
    s=re.sub(r"\s+"," ",''.join(out)).strip()
    return s,changed
def check(script,text):
    """True if every contraction on screen is spoken and no extra contraction/expansion differs."""
    sw=[norm(t) for t in TOK.findall(script) if not t.startswith('[')]
    tw=[norm(w) for w in text.split()]
    for op,i1,i2,j1,j2 in difflib.SequenceMatcher(None,sw,tw,autojunk=False).get_opcodes():
        if op!='equal' and (any(is_cont(w) for w in tw[j1:j2]) or any(is_cont(w) for w in sw[i1:i2])): return False
    return True
if __name__=='__main__':
    s="[shouting, alarmed] MICHAEL. Can you grab Isla? She has a leaf. [faster] She is going to eat the leaf."
    t="MICHAEL. Can you grab Isla? She has a leaf. She's going to eat the leaf."
    r=convert(s,t); print(r, check(r[0],t))
    s="[thick New York accent, groaning] I am not feeling good. I was fine an hour ago. [thick New York accent, guilty] Then I had a pepper."
    print(convert(s,"I'm not feeling good. I was fine an hour ago. Then I had a pepper."))
    print(convert("[proud] Rose. Rose do not lick the phone. [beat] Tah Tah has one, and Sal has two thousand six.","Rose. Rose don't lick the phone. Tata has one, and Sal has 2006."))
