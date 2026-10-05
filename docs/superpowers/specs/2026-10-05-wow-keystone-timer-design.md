# WoW keystone timer: design

Date: 2026-10-05
Status: approved in conversation, pending written review

## Goal

Publish a research-style entry on demirbasaf.dev aimed at gaming-industry
ML and data-science readers. It has two halves:

1. An exploratory analysis of World of Warcraft Mythic+ leaderboards pulled
   from the Battle.net API (retail, EU + US, the whole current season).
2. A regression model that predicts a run's clear time in milliseconds from
   dungeon, key level, group composition, affixes, region and faction, shipped
   as ONNX and run live in the browser on the entry page.

The model and analysis are built by hand in a separate repo. This site only
consumes the exported artifacts. The site is English only (see the companion
spec on removing Turkish, which lands first).

## Division of labour

- `demirbasaf/wow-keystone-timer` (new repo, from `ml-project-template`):
  collector, dataset, notebook, models, export, charts. Built by Ali, reviewed
  by Claude afterwards.
- `demirbasaf.ai` (this repo): registry entry, chart sync, demo component,
  MDX entry. Built by Claude after the Turkish removal.

## Repo layout: wow-keystone-timer

```
data/
  raw/<region>/<period>/<realm>-<dungeon>.json   # verbatim API responses, gitignored
  runs.parquet                                   # one row per unique run, committed
  dungeons.csv  affixes.csv  specs.csv           # lookup tables, hand maintained
scripts/
  collect.py          # Battle.net -> data/raw/, resumable
  build_dataset.py    # data/raw/ -> data/runs.parquet
  export_model.py     # checkpoint -> model/model.onnx + model/meta.json
train/
  features.py         # the single owner of the feature encoding
  exploration.ipynb   # EDA and findings; every chart saved to charts/*.svg
  train.py            # the winning model, seeded and reproducible
model/
  model.onnx  meta.json
charts/
  *.svg
```

## Collector

- Auth: OAuth client-credentials flow. `BNET_CLIENT_ID` and
  `BNET_CLIENT_SECRET` come from environment variables and are never
  committed.
- Per region (`eu`, `us`): fetch the connected-realm index, the mythic
  keystone dungeon index, and the period index for the current season. Then
  one leaderboard request per connected realm x dungeon x period:
  `/data/wow/connected-realm/{realmId}/mythic-leaderboard/{dungeonId}/period/{periodId}`
  with `namespace=dynamic-{region}`.
- Roughly 250 realms x 8 dungeons x ~10 periods per region, about 20k
  requests per region. Run async with a semaphore under the 100 requests per
  second limit.
- Each response is written to its own file. A file already on disk is
  skipped, so a crash or a rerun resumes for free. Raw data stays out of git.

## Dataset: `runs.parquet`

One row per unique run. The same run appears on several realm leaderboards
when the group spans connected realms, so dedup on
`(region, period, dungeon_id, completed_at, sorted member ids)` and store the
hash of that key as `run_id`.

Every column holds exactly one scalar value. No lists, no nested structs.

| column | type | notes |
|---|---|---|
| run_id | string | hash of the dedup key |
| region | string | `eu` or `us` |
| period | int | weekly period id, used for the split and for charts only |
| dungeon_id | int | joins to `dungeons.csv` |
| keystone_level | int | |
| duration_ms | int | the target |
| timed | bool | `is_completed_within_time` |
| completed_at | timestamp | |
| affix_1, affix_2, affix_3 | int, nullable | slot order as the API lists them |
| spec_1 .. spec_5 | int | sorted by role (tank, healer, dps) then id |
| faction | string | |
| realm_count | int | how many connected realms the group spans |

Lookup tables: `dungeons.csv` (id, name, timer_ms), `affixes.csv` (id, name),
`specs.csv` (id, name, role, class). Names and timers live only there.

Split: by period. Train on earlier weeks, test on the latest week, so the
metric means "predict next week" rather than "memorise known comps".

## Feature encoding: `features.py`

One module owns `encode(row) -> vector` and the ordered column names. Train,
evaluation, export and `meta.json` all read from it, so the browser demo
builds the identical vector.

Rules: categoricals are one-hot, sets are multi-hot counts, nothing is passed
through as a raw number. Slot columns in the dataset are storage, not
features; the encoding is order free, so swapping two dps specs cannot
change a prediction.

| group | columns | encoding |
|---|---|---|
| dungeon | `dungeon_<id>` x 8 | one-hot |
| region | `region_eu`, `region_us` | one-hot |
| faction | `faction_alliance`, `faction_horde` | one-hot |
| key level | `level_2` .. `level_<max seen>` | one-hot, because difficulty compounds per level and steps at affix thresholds |
| specs | `spec_<id>` x 39 | count of that spec in the group, sums to 5 |
| affixes | `affix_<id>` x ~12 | binary |

About 83 columns. `period` is deliberately not a feature: it is a week
index with no intrinsic value, and the test week would be unseen at train
time. Target: `duration_ms`.

## Models

Model family is open. Ali benchmarks several (a linear baseline at minimum,
plus trees and a small MLP as candidates) and ships the best on test MAE.
The design does not depend on which wins because the artifact contract below
is model agnostic.

## Artifact contract

Whatever model wins exports to the same two files.

`model/model.onnx`

- one input `features`, float32, shape `[1, N]` where N is the length of
  `feature_columns`
- one output `duration_ms`, float32, shape `[1, 1]`
- produced by skl2onnx, onnxmltools or `torch.onnx.export` depending on the
  winner

`model/meta.json`

```json
{
  "name": "wow-keystone-timer",
  "title": "Mythic+ clear time predictor",
  "description": "...",
  "backend": "onnx",
  "task": "keystone-timer",
  "feature_columns": ["dungeon_12345", "...", "affix_9"],
  "dungeons": [{ "id": 12345, "name": "...", "timer_ms": 1980000 }],
  "specs":    [{ "id": 250, "name": "Blood", "class": "Death Knight", "role": "tank" }],
  "affixes":  [{ "id": 9, "name": "Tyrannical" }],
  "levels":   [2, 3, 4, "..."],
  "metrics":  { "test_mae_ms": 0, "test_r2": 0 },
  "sanity":   { "input": [0, 1, "..."], "output_ms": 0 },
  "charts":   ["spec-pickrate.svg", "..."]
}
```

`export_model.py` asserts the input and output shapes, runs 100 sampled rows
through onnxruntime and compares against the native model within 1 ms, then
writes both files plus the `sanity` pair used by the site's verify script.

## Site integration (this repo)

Three touch points.

1. Registry. `models.config.json` gains an entry for `wow-keystone-timer`
   (repo `demirbasaf/wow-keystone-timer`, local `../wow-keystone-timer`).
   `scripts/sync-models.mjs` gains one behaviour: when `meta.json` lists
   `charts`, copy each SVG into `public/charts/<name>/`, local first then
   CDN, same as the weights.
2. Demo. New `src/components/KeystoneDemo.tsx`. It reads `meta.json`,
   renders a dungeon select, a key level select, five spec selects filtered
   by role (tank, healer, three dps), and region and faction toggles. It
   builds the vector from `feature_columns`, runs it through
   `onnxruntime-web`, and shows the prediction as
   `predicted 27:40 · timer 33:00 · +5:20`. It does not use the generative
   `InferenceEngine`. `Entry.astro` picks the component by `meta.task`:
   `keystone-timer` renders `KeystoneDemo`, anything else keeps `ModelDemo`.
   `types.ts` gains optional `task` and `charts` fields on `ModelMeta`.
3. Entry. `src/content/entries/wow-keystone-timer.mdx` with `demo`, `repo`
   and `notebook` in frontmatter. Charts are plain markdown images pointing
   at `/charts/wow-keystone-timer/<file>.svg`.

## Article outline

Demo sits at the top, as the existing entry does.

1. What this is. Dataset size, what the model predicts, one honest MAE line.
2. The data. How leaderboards work, the survivor bias (top runs per realm
   only), dedup across realms, the period split.
3. Patterns. The exploratory section. Candidate charts, kept only where the
   data supports them: spec pick rate by key level, clear time vs key level
   per dungeon with the timer line, affix week effect on median time, comp
   diversity shrinking as keys get higher, EU vs US and faction gaps,
   week-over-week meta drift across periods.
4. Models. The benchmark table (every model tried, test MAE and R2), why the
   winner won. If an embedding model was tried, the 2D spec map goes here.
5. What the model gets wrong. Residuals by dungeon and key level.
6. Run it yourself. Repo link, collector and train commands.

## Verification

- `export_model.py` parity check (above) gates the artifact.
- `scripts/_verify_inference.ts` in this repo gains a second case: load the
  synced ONNX, run `meta.sanity.input`, assert the output matches
  `meta.sanity.output_ms` within 1 ms. A broken sync or a drifted encoding
  fails `npm run verify`.
- `npm run build` passes with the demo rendering on the entry page.

## Out of scope

- Auction house or any time series that needs weeks of collection.
- A scheduled collector. The dataset is a one-off season snapshot.
- Interactive charts. Static SVGs only.
