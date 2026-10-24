"""Merge facts.json + out/slice*.json + out/learn.json into ../data.js.
Traditional -> Simplified via OpenCC (tw2sp: Taiwan phrases -> mainland phrases)."""
import json, glob, re, datetime
from opencc import OpenCC
cc = OpenCC("tw2sp")

def s2(x):
    return cc.convert(x) if isinstance(x, str) else x

def tri(d):
    """{'hant','en','ms'} -> {'hans','hant','en','ms'}"""
    return {"hans": s2(d.get("hant", "")), "hant": d.get("hant", ""), "en": d.get("en", ""), "ms": d.get("ms", "")}

facts = json.load(open("facts.json"))
entries = {}
for f in sorted(glob.glob("out/slice*.json")):
    for e in json.load(open(f)):
        entries[e["page"]] = e

SCI_FIX = {77: "Ducetia japonica (Thunberg, 1815)",
           173: "Cistelomorpha bina",
           207: "Papilio demoleus Linnaeus, 1758"}
BADGE = {"特有種": "endemic", "特有亞種": "sub", "外來種": "exotic"}

ORDERS = {
 "Odonata":     {"hans":"蜻蜓目",  "hant":"蜻蛉目", "en":"Dragonflies & damselflies", "ms":"Pepatung"},
 "Orthoptera":  {"hans":"直翅目",  "hant":"直翅目", "en":"Grasshoppers, crickets & katydids", "ms":"Belalang & cengkerik"},
 "Mantodea":    {"hans":"螳螂目",  "hant":"螳螂目", "en":"Mantises", "ms":"Mentadak"},
 "Blattodea":   {"hans":"蜚蠊目",  "hant":"蜚蠊目", "en":"Cockroaches", "ms":"Lipas"},
 "Isoptera":    {"hans":"等翅目",  "hant":"等翅目", "en":"Termites", "ms":"Anai-anai"},
 "Hemiptera":   {"hans":"半翅目",  "hant":"半翅目", "en":"True bugs & cicadas", "ms":"Kepinding & riang-riang"},
 "Coleoptera":  {"hans":"鞘翅目",  "hant":"鞘翅目", "en":"Beetles", "ms":"Kumbang"},
 "Diptera":     {"hans":"双翅目",  "hant":"雙翅目", "en":"Flies", "ms":"Lalat"},
 "Lepidoptera": {"hans":"鳞翅目",  "hant":"鱗翅目", "en":"Butterflies & moths", "ms":"Kupu-kupu & rama-rama"},
 "Hymenoptera": {"hans":"膜翅目",  "hant":"膜翅目", "en":"Bees, wasps & ants", "ms":"Lebah, tebuan & semut"},
 "Neuroptera":  {"hans":"脉翅目",  "hant":"脈翅目", "en":"Antlions, owlflies & lacewings", "ms":"Singa semut & sibur-sibur"},
 "Dermaptera":  {"hans":"革翅目",  "hant":"革翅目", "en":"Earwigs", "ms":"Cengkadak"},
}

import glob as _g
PH = {}
for _f in _g.glob("../img/p*.jpg"):
    import re as _re
    _m=_re.match(r".*/p(\d+)(?:-\d+)?\.jpg$", _f); PH[int(_m.group(1))]=PH.get(int(_m.group(1)),0)+1
species = []
for f in facts:
    e = entries[f["page"]]
    assert e["name"]["hant"] == f["zh"], (f["page"], e["name"]["hant"], f["zh"])
    sci = SCI_FIX.get(f["page"], f["sci"])
    sci = re.sub(r"\s+", " ", sci).replace(" )", ")").replace(",1", ", 1")
    species.append({
        "p": f["page"],
        "name": tri(e["name"]),
        "sci": sci,
        "order": f["order"],
        "fam": f["family"],
        "famzh": {"hans": s2(f["family_zh"]), "hant": f["family_zh"]},
        "badge": BADGE.get(f["badge"], ""),
        "m": f["months"],
        "hab": [k for k, v in f["habitat"].items() if v],
        "mic": [k for k, v in f["micro"].items() if v],
        "act": [k for k, v in f["activity"].items() if v],
        "size": f["size_mm"],
        "ph": PH.get(f["page"], 0),
        "st": f["size_type"],
        "id": tri(e["id"]),
        "hb": tri(e["habits"]),
        "rg": tri(e["range"]),
        "al": tri(e["alias"]),
    })

def deep(o):
    """convert every {'hant','en','ms'} leaf object in learn.json"""
    if isinstance(o, dict):
        if set(o.keys()) >= {"hant", "en", "ms"} and all(isinstance(v, str) for v in o.values()):
            return tri(o)
        return {k: deep(v) for k, v in o.items()}
    if isinstance(o, list):
        return [deep(v) for v in o]
    return o

learn = deep(json.load(open("out/learn.json")))
data = {"version": datetime.date.today().isoformat(), "orders": ORDERS, "species": species, "learn": learn}
out = "window.DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
open("../data.js", "w").write(out)
print(len(species), "species;", len(out)//1024, "KB")
