#!/usr/bin/env python3
"""Vendor the MobileNet v2 (alpha 0.5, 224 px) TensorFlow.js model into ./model/ so the
camera's offline recogniser does not depend on TF Hub being reachable.

    python3 tools/fetch_model.py        # writes model/model.json + weight shards (~7 MB)

index.html looks for model/model.json first and falls back to TF Hub when absent.
"""
import json, pathlib, urllib.request
BASE = "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_050_224/classification/3/default/1/"
out = pathlib.Path(__file__).resolve().parent.parent / "model"; out.mkdir(exist_ok=True)
def get(name):
    req = urllib.request.Request(BASE + name + "?tfjs-format=file", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r: return r.read()
mj = get("model.json"); (out / "model.json").write_bytes(mj)
for m in json.loads(mj)["weightsManifest"]:
    for shard in m["paths"]:
        print("fetching", shard); (out / shard).write_bytes(get(shard))
print("done:", sorted(p.name for p in out.iterdir()))
