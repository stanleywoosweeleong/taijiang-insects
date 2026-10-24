# Species-entry writing brief

You are writing short, original, four-language field-guide entries for insects of
Taijiang National Park (Tainan, Taiwan) for a mobile app used by Malaysian and
Taiwanese nature lovers and farmers, many with limited schooling.

Input: `slices/sliceN.json` — a list of species. Each item has the names, taxonomy,
size, and three Traditional-Chinese *source* paragraphs (features, habits,
distribution) extracted from a printed guide. The source text is reference only.

## Hard rules
1. **Write in your own words. Never copy or translate the source sentence by
   sentence.** Condense: pick the 2–3 points that best help someone recognise the
   insect in the field. The source is often 150–300 characters; your Chinese
   summary should be roughly 50–90 characters per field.
2. **Do not invent facts.** Every colour, number, count, habitat and behaviour you
   state must come from the source (or be the scientific/common name). Keep numbers
   exact (sizes, spot counts, segment counts). If the source lacks something, omit it.
3. Write for a reader who may not know entomology jargon: prefer "the front wings"
   over "tegmina", "back" over "dorsum", but keep "thorax/abdomen" where needed.
4. Chinese is written in **Traditional Chinese (台灣用語)**; Simplified will be
   generated automatically — do not write it.
5. Malay is standard Bahasa Melayu (Malaysia), natural and simple, no English words
   left untranslated. Use everyday group names: pepatung (dragonfly), pepatung
   jarum (damselfly), belalang, cengkerik, anjing tanah (mole cricket), mentadak
   (mantis), lipas, anai-anai, riang-riang (cicada), kepinding (true bug), kumbang,
   kumbang kura-kura (ladybird), lalat, rama-rama (moth), kupu-kupu (butterfly),
   lebah, tebuan/penyengat (wasp), semut, singa semut (antlion), cengkadak (earwig),
   anggang-anggang (water strider).
6. English common name: use the name given in `en_name_in_book` if present. If
   absent, give a widely used English common name if one exists for that species;
   otherwise give a plain descriptive name (e.g. "Taiwan dark cicada"). Set
   `"en_name_source"` to `"book"`, `"common"` or `"descriptive"`.
7. Malay name: there are rarely established Malay names; give a short descriptive
   Malay name built from the group name (e.g. "Pepatung jarum ekor jingga").
8. Nothing pig-related anywhere.
9. Keep each field a single short paragraph (no bullet points, no headings).

## Output
Write `out/sliceN.json`: a JSON list, same order as input, one object per species:

```json
{
  "page": 45,
  "name": {"hant": "橙尾細蟌", "en": "Wandering Midget", "ms": "Pepatung jarum ekor jingga"},
  "en_name_source": "book",
  "id":     {"hant": "...", "en": "...", "ms": "..."},
  "habits": {"hant": "...", "en": "...", "ms": "..."},
  "range":  {"hant": "...", "en": "...", "ms": "..."},
  "alias":  {"hant": "黃尾小蟌（香港）", "en": "", "ms": ""}
}
```

- `id` = how to recognise it (size is shown separately by the app, so don't repeat
  the mm figure unless it matters for comparison; do mention relative size words).
- `habits` = food, behaviour, where/when seen, life stage notes.
- `range` = distribution in one sentence.
- `alias` = other Chinese names from `source_alias_zh` (empty strings if none;
  for en/ms leave "").

Validate the JSON (python3 -I -c 'import json;json.load(open(...))') before finishing.
Do not write anything else to disk. Report only "done, N entries" plus any species
where the source was too thin to write a field.
