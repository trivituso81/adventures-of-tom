import re,sys,glob,json
A=r"(\\?')"   # apostrophe, maybe escaped in source
def tr(s):
    s=re.sub(r"\b(\w+)"+A+r"ll not\b",lambda m:m.group(1)+' '+('won'+m.group(2)+'t'),s)
    s=re.sub(r"\b(\w+)"+A+r"d not\b",lambda m:m.group(1)+' '+('wouldn'+m.group(2)+'t'),s)
    s=re.sub(r"\bI"+A+r"ve seven\b","I have seven",s)
    s=re.sub(r"\b([Ii]t)"+A+r"s has\b",r"\1 is has",s)
    return s
if __name__=='__main__':
    n=0
    for f in glob.glob('data/*.js')+glob.glob('engine/*.js'):
        if 'voice' in f: continue
        s=open(f,encoding='utf8').read(); t=tr(s)
        if t!=s: open(f,'w',encoding='utf8').write(t); k=sum(1 for a,b in zip(s.split('\n'),t.split('\n')) if a!=b); n+=k; print(f,k)
    print('lines changed',n)
