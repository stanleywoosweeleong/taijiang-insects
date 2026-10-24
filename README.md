# 台江昆蟲圖鑑 · Taijiang Insects · Serangga Taijiang

An offline-first, single-page PWA covering the 180 insects of Taijiang National Park
(台江國家公園, Tainan, Taiwan) in **简体中文 · 繁體中文 · English · Malay**.

Live features: browse by order with search · insect of the day · favourites ·
tap-to-filter identification (habitat, where it sits, month, day/light, size, order) ·
a step-by-step key to insect orders · a month calendar of what is active now · a Learn
section (park, history, five habitats, anatomy, mouthparts, legs, life cycles, field
tips, safety) with original illustrations · photo quiz and flashcards · a field
notebook with JSON backup/restore · large high-contrast text with an Aa size toggle ·
first-launch language choice that is remembered · works offline.

## Files

| File | Purpose |
|---|---|
| `index.html` | the whole app (UI, logic, illustrations) |
| `data.js` | the 180 species + Learn content in four languages |
| `sw.js` | service worker — caches the app for offline use; bump `CACHE` when you change `index.html`/`data.js` |
| `manifest.webmanifest`, `icon-192.png`, `icon-512.png` | PWA install |
| `img/` | 423 species photographs (`p<page>.jpg`, `p<page>-2.jpg`…) — see rights note below |
| `tools/extract_photos.py` | re-extracts photos from the PDF into `img/` if you ever need to |
| `.github/workflows/pages.yml` | publishes the repo root to GitHub Pages on every push to `main` |
| `tools/icon.svg` | source of the app icon (original dragonfly glyph, no text) |
| `work/` | build files: extracted facts, the writers' entries, `build_data.py` → `data.js` |

## Deploy to GitHub Pages

1. Create a repo (e.g. `taijiang-insects`), copy everything except `work/` into it.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open `https://<user>.github.io/taijiang-insects/` on a phone → Add to Home Screen.

All paths are relative, so it also works from a sub-folder or a local server.

## About the content, and the photographs

The source is **《游黽飛蛉：台江昆蟲圖鑑》** (A Field Guide to the Insects of Taijiang
National Park), text by 黃文伯, 張原謀, 莊棨州; published by 台江國家公園管理處,
December 2015; ISBN 978-986-04-6579-2.

Its colophon states that all rights are reserved and that **using any part of the
book's content requires the consent or written authorisation of Taijiang National Park
Headquarters** (電話 06-2842600, 70955 臺南市安南區四草大道 118 號, https://www.tjnp.gov.tw).
The photographs are credited to seven named photographers.

So this app is built to be publishable without that permission:

* **Facts** (species list, scientific names, order/family, body sizes, active months,
  habitat / micro-habitat / activity flags, endemic/introduced status) were extracted
  from the book — facts are not copyrightable.
* **Descriptions** ("how to recognise it", habits, distribution) and the whole Learn
  section are newly written condensed summaries in all four languages, not the book's
  text. Simplified Chinese is generated from the Traditional text with OpenCC.
* **Photographs** are in `img/` for the demonstration to the park. They are the book's
  photographs and remain the park's / photographers' property. Until the park grants
  permission in writing, keep the repository **private** (or delete `img/` before
  pushing to a public repo — the app then shows an order glyph and a "photo not
  included yet" note for each species and everything else works). The earlier Codex
  build also published the complete book PDF (`reference.pdf`) and the book's text
  verbatim; neither is included here, and the live site should drop them.

Naming: `img/p<page>.jpg` is the main photo for the species on printed page `<page>`,
then `p<page>-2.jpg`, `-3.jpg`… (`ph` in `data.js` is the count). You can replace any
of them with your own photos; re-run `work/build_data.py` after adding or removing
files so the counts stay right.

## What was merged from the Codex build (taijiang-entomology-atlas)

Kept from here: the data model (months, habitat / micro-habitat / activity flags,
sizes, endemic/introduced status, original four-language summaries), the Identify,
Calendar and Learn views, and the UI conventions (17 px+ text, rectangular buttons,
2-character language switch, first-launch language gate).

Ported from Codex and rewritten in this codebase: the 423 extracted photos (renamed),
favourites, insect of the day (UTC+8, full uncropped photo with caption beneath), photo quiz, flashcards, field notebook with
JSON export/import, back-to-top, the Pages workflow, and its three verified
scientific-name corrections (which agreed with this build's data).

Not ported: the verbatim book text and locale files, the bundled PDF and source
reader, side-by-side compare. A camera identification feature was built and then
removed on 2026-10-24: with 1–5 photos per species no classifier can name a species
honestly, and a group-only recogniser was judged not worth its 7 MB.

## Known data notes

* p.173 二色擬緣腹朽木蟲 — the printed page carries the wrong scientific name (a
  ladybird's); the book's index gives *Cistelomorpha bina*, which the app uses.
* p.91 臺灣暗蟬 — printed as *Taiwanosemia hopppoensis*; corrected to *hoppoensis*.
* The book's scientific-name index is off by one page for pages 137–142; the species
  pages themselves (used here) agree with the table of contents.
* Some English names were missing or garbled in the book; the writers used common
  names where one exists, otherwise plain descriptive names.
* p.215 蟻蜂科 and p.216 土蜂科 are family-level entries with no size.

## Editing the text

Edit `work/out/slice*.json` (Traditional Chinese, English, Malay) or
`work/out/learn.json`, then rebuild:

```bash
pip install opencc-python-reimplemented
cd work && python3 build_data.py        # regenerates ../data.js, incl. Simplified Chinese
```

UI strings live in the `I18N` object at the top of the script in `index.html`.
