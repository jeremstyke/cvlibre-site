import re,sys,json
# Extrait les chaînes JS visibles (contiennent une lettre et un espace ou un accent ou une majuscule initiale)
pat=re.compile(r'"((?:[^"\\\n]|\\.)*)"|\'((?:[^\'\\\n]|\\.)*)\'')
def strings(src):
    out=[]
    for m in pat.finditer(src):
        s=m.group(1) if m.group(1) is not None else m.group(2)
        if not re.search(r'[A-Za-zÀ-ÿ]',s): continue
        if re.fullmatch(r'[#.\[\]a-z0-9_:=\-"\'/ >*,()+]*',s) and not re.search(r'[A-Z ]',s) : continue
        if re.search(r'[À-ÿ]',s) or re.search(r'[a-z] [a-z]',s,re.I) or re.fullmatch(r'[A-ZÉ][a-zé]+.*',s):
            out.append(s)
    return out
res={}
for f in sys.argv[1:]:
    for s in strings(open(f).read()):
        res.setdefault(s,[]).append(f.split('/')[-1])
json.dump(res,sys.stdout,ensure_ascii=False,indent=0)
