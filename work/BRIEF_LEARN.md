# "Learn" section writing brief

Write the educational "Learn" content for a mobile insect field-guide app about
Taijiang National Park (台江國家公園, Tainan, Taiwan — Taiwan's first wetland national
park: tidal flats, sandbars, lagoons, mangroves, windbreak forests, salt pans,
fish ponds). Readers: Malaysian and Taiwanese nature lovers and farmers, many with
limited schooling. Keep sentences short and concrete.

`intro_source.txt` is reference material (Traditional Chinese, extracted from a
printed guide: history, five habitats, insect anatomy, diversity, life cycle,
watching tips, safety). **Write in your own words; condense; do not translate the
source paragraph by paragraph. Never invent facts** — anything specific about the
park (habitat locations, plant names, which insects live where) must come from the
source; general entomology (what a thorax is, what metamorphosis is) may come from
your own knowledge.

Languages: Traditional Chinese (台灣用語; Simplified is generated automatically —
do not write it), English, and standard Bahasa Melayu (Malaysia), simple and
natural, no English left untranslated. Nothing pig-related anywhere.

## Output: `out/learn.json`

```json
{
  "park": {"title": {"hant":"","en":"","ms":""}, "body": {"hant":"","en":"","ms":""}},
  "history": {"title": {...}, "body": {...}},
  "habitats": [
    {"key":"windbreak", "title":{"hant":"防風林","en":"Windbreak forest","ms":"Hutan penahan angin"},
     "body":{"hant":"","en":"","ms":""},
     "typical":{"hant":"","en":"","ms":""}}
    , {"key":"mangrove", ...}, {"key":"wetgrass", ...}, {"key":"drygrass", ...}, {"key":"water", ...}
  ],
  "anatomy": {
    "intro": {"hant":"","en":"","ms":""},
    "parts": [
      {"key":"antenna","label":{"hant":"觸角","en":"Antenna","ms":"Sesungut"},"body":{"hant":"","en":"","ms":""}},
      {"key":"compound_eye", ...}, {"key":"ocelli", ...}, {"key":"mouthparts", ...},
      {"key":"thorax", ...}, {"key":"legs", ...}, {"key":"wings", ...}, {"key":"abdomen", ...}
    ],
    "mouthparts": [
      {"key":"chewing","label":{...},"example":{...},"body":{...}},
      {"key":"piercing", ...}, {"key":"siphoning", ...}, {"key":"sponging", ...}, {"key":"chewing_lapping", ...}
    ],
    "legs": [
      {"key":"raptorial","label":{...},"example":{...}}, {"key":"digging",...}, {"key":"swimming",...}, {"key":"jumping",...}
    ]
  },
  "lifecycle": {
    "intro": {"hant":"","en":"","ms":""},
    "types": [
      {"key":"ametabolous","label":{...},"stages":{"hant":"卵 → 若蟲 → 成蟲","en":"","ms":""},"body":{...},"orders":{"hant":"","en":"","ms":""}},
      {"key":"hemimetabolous", ...}, {"key":"holometabolous", ...}
    ]
  },
  "tips": {
    "intro": {"hant":"","en":"","ms":""},
    "items": [ {"title":{...},"body":{...}}, ... ]
  },
  "safety": {
    "intro": {"hant":"","en":"","ms":""},
    "items": [ {"title":{...},"body":{...}}, ... ],
    "emergency": {"hant":"","en":"","ms":""}
  }
}
```

Guidance per block:
- `park.body`: 2–3 sentences on what the park is and why its insects matter.
- `history.body`: 2–3 sentences (Swinhoe 1857 tiger-beetle observation; Hans
  Sauter's collectors 1905–1916 at Anping; coastal lowland insects long dismissed as
  dull but actually distinctive and fragile).
- each habitat `body`: 2–3 sentences describing the habitat (where in the park,
  main plants); `typical`: one sentence naming the insect groups typically seen there.
- anatomy `parts` body: 1–2 sentences each, plain language.
- mouthparts/legs: label + example insect group + 1 sentence.
- lifecycle `body`: 2 sentences each; `orders`: short list of example groups.
- tips: 2 items (clothing & footwear; tools & note-taking). safety: 4 items (don't
  touch unfamiliar animals; follow park rules and wildlife law; respect life; wasps,
  chemical-defence insects and snakes). `emergency`: the emergency numbers given in
  the source (119; Taijiang NP HQ (06) 3910000; Liukong station (06) 7880220;
  police 7th Corps Taijiang unit (06) 3910220).

Validate the JSON before finishing. Do not write anything else to disk. Report only
"done".
