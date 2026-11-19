# Weed-game: phone performance report

Measured with `tools/perf-check.cjs` (Playwright + Chromium, landscape 844×390, DPR 2, mid-range Android user agent,
CPU throttling 1× / 4× / 6× via CDP `Emulation.setCPUThrottlingRate`).

```bash
npm run build && (npx vite preview --port 4187 --strictPort &)
URL=http://localhost:4187/ node tools/perf-check.cjs --rates 1,4,6 --scenes menu,battle,cutscene --out ../docs/weed-game/perf-report.md --label "my run"
URL=http://localhost:4187/ node tools/perf-check.cjs --rates 4 --scenes battle,cutscene --q med      # force a tier
```

How to read the numbers
- Headless Chromium renders with **SwiftShader (CPU)**, so the fps column is ~20–50× below a real phone. Use it only for
  before/after comparison. Draw calls, triangles, texture memory and JS heap are device independent.
- **tier**: quality tier picked by `gfx/quality.js` (the emulated Android with ≤4 cores gets `low`).
- **tex MB**: GPU memory estimate for every texture reachable from the scene (RGBA8 + mip chain).
  **RT MB**: render targets (HDR scene target × MSAA samples + bloom chain + shadow map).
- **FCP**: first paint of the loading screen. **playable**: loading screen hidden (menu / battle / cutscene running).
- Local runs have no Epidemic audio (`public/audio/` is git-ignored): `mp3` sizes below are the SPA fallback page that
  `vite preview` returns for the missing files, and "Unable to decode audio data" comes from that (live returns 404 / real mp3).

## BEFORE (baseline, auto tier = low on the emulated Android) (q=auto, 2026-11-19)

| scene | CPU | tier | fps (avg / p95 ms) | draw calls avg/max | triangles avg/max | geo / tex / programs | tex MB | RT MB | JS heap MB | FCP ms | playable ms |
|---|---|---|---|---|---|---|---|---|---|---|---|
| menu | 1x | low ×1 | 4.2 (239.6 / 289.8) | 50 / 50 | 159k / 159k | 38 / 19 / 25 | 74.5 | 3.9 | 8.8 | 88 | 3165 |
| menu | 4x | low ×1 | 2.8 (352.1 / 513.1) | 50 / 50 | 159k / 159k | 38 / 19 / 25 | 74.5 | 3.9 | 11.5 | 2300 | 6511 |
| menu | 6x | low ×1 | 2.4 (413.7 / 588.3) | 50 / 50 | 159k / 159k | 38 / 19 / 25 | 74.5 | 3.9 | 15.1 | 160 | 9402 |
| battle | 1x | low ×1 | 3.7 (269.3 / 448.1) | 50 / 52 | 140k / 146k | 39 / 21 / 24 | 74.5 | 3.9 | 12.3 | 72 | 4572 |
| battle | 4x | low ×1 | 2.6 (380.3 / 440.6) | 50 / 51 | 137k / 146k | 39 / 20 / 25 | 74.5 | 3.9 | 15.4 | 428 | 7878 |
| battle | 6x | low ×1 | 2.5 (402.1 / 500.8) | 50 / 51 | 137k / 146k | 39 / 20 / 25 | 74.5 | 3.9 | 13.9 | 204 | 8438 |
| cutscene | 1x | low ×1 | 5.6 (177 / 231.4) | 49 / 49 | 128k / 128k | 34 / 15 / 22 | 74.5 | 3.9 | 10.3 | 80 | 4289 |
| cutscene | 4x | low ×1 | 4.2 (237.5 / 264.9) | 49 / 49 | 128k / 128k | 34 / 15 / 21 | 74.5 | 3.9 | 12.2 | 2652 | 6673 |
| cutscene | 6x | low ×1 | 3.3 (301 / 489.2) | 49 / 49 | 128k / 128k | 34 / 15 / 22 | 74.5 | 3.9 | 11.2 | 192 | 7405 |

Transferred assets (same-origin, per scene, first visit):

- **menu**: glb 1736 kB, js 1049 kB, webp 489 kB, css 31 kB, html 6 kB (total 3311 kB)
- **battle**: glb 1736 kB, js 1049 kB, mp3 874 kB, webp 489 kB, css 31 kB, html 6 kB (total 4186 kB)
- **cutscene**: glb 1736 kB, js 1049 kB, mp3 874 kB, webp 489 kB, css 31 kB, html 6 kB, json 0 kB (total 4186 kB)

Console errors/warnings (921):

- `[menu x1] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[menu x4] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[menu x6] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[battle x1] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[battle x1] PAGEERROR Unable to decode audio data`
- `[battle x4] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[battle x4] PAGEERROR Unable to decode audio data`
- `[battle x6] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[battle x6] PAGEERROR Unable to decode audio data`
- `[cutscene x1] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[cutscene x1] PAGEERROR Unable to decode audio data`
- `[cutscene x4] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[cutscene x4] PAGEERROR Unable to decode audio data`
- `[cutscene x6] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[cutscene x6] PAGEERROR Unable to decode audio data`


## BEFORE (baseline, forced med) (q=med, 2026-11-19)

| scene | CPU | tier | fps (avg / p95 ms) | draw calls avg/max | triangles avg/max | geo / tex / programs | tex MB | RT MB | JS heap MB | FCP ms | playable ms |
|---|---|---|---|---|---|---|---|---|---|---|---|
| battle | 4x | med ×1 | 1.1 (950 / 1044) | 59 / 60 | 141k / 152k | 42 / 28 / 31 | 74.5 | 37 | 13.4 | 176 | 13981 |
| cutscene | 4x | med ×1 | 1.3 (775.6 / 1012.6) | 56 / 56 | 177k / 177k | 37 / 23 / 29 | 74.5 | 37 | 10.9 | 344 | 12396 |

Transferred assets (same-origin, per scene, first visit):

- **battle**: glb 1736 kB, js 1049 kB, mp3 874 kB, webp 489 kB, css 31 kB, html 6 kB (total 4186 kB)
- **cutscene**: glb 1736 kB, js 1049 kB, mp3 874 kB, webp 489 kB, css 31 kB, html 6 kB, json 0 kB (total 4186 kB)

Console errors/warnings (304):

- `[battle x4] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[battle x4] PAGEERROR Unable to decode audio data`
- `[cutscene x4] warning: THREE.Material: 'flatShading' is not a property of THREE.MeshToonMaterial.`
- `[cutscene x4] PAGEERROR Unable to decode audio data`


## AFTER (auto tier = low on the emulated Android) (q=auto, 2026-11-19)

| scene | CPU | tier | fps (avg / p95 ms) | draw calls avg/max | triangles avg/max | geo / tex / programs | tex MB | RT MB | JS heap MB | FCP ms | playable ms |
|---|---|---|---|---|---|---|---|---|---|---|---|
| menu | 1x | low ×1 | 1.5 (659 / 870.3) | 41 / 41 | 137k / 137k | 37 / 19 / 22 | 22.8 | 3.9 | 9.7 | 100 | 10336 |
| menu | 4x | low ×1 | 1.2 (814.4 / 919.7) | 42 / 43 | 144k / 159k | 37 / 19 / 25 | 22.8 | 3.9 | 8.4 | 232 | 17124 |
| menu | 6x | low ×1 | 0.9 (1080.6 / 2046.4) | 41 / 41 | 137k / 137k | 37 / 19 / 25 | 22.8 | 3.9 | 10.3 | 4328 | 23989 |
| battle | 1x | low ×1 | 1.4 (730 / 1301.9) | 40 / 42 | 121k / 144k | 37 / 20 / 23 | 22.8 | 3.9 | 8.8 | 184 | 11140 |
| battle | 4x | low ×1 | 1.5 (677.3 / 1108.9) | 37 / 41 | 93k / 144k | 37 / 20 / 23 | 22.8 | 3.9 | 8.4 | 272 | 22082 |
| battle | 6x | low ×1 | 1.2 (811.5 / 1229.2) | 36 / 37 | 88k / 92k | 37 / 20 / 23 | 22.8 | 3.9 | 12.9 | 436 | 20831 |
| cutscene | 1x | low ×1 | 2.6 (387 / 493.4) | 32 / 32 | 83k / 83k | 33 / 15 / 15 | 22.8 | 3.9 | 11 | 544 | 11848 |
| cutscene | 4x | low ×1 | 1.1 (878.5 / 1282.4) | 33 / 36 | 97k / 126k | 33 / 15 / 20 | 22.8 | 3.9 | 9.5 | 960 | 20181 |
| cutscene | 6x | low ×1 | 1.7 (592.7 / 998.6) | 32 / 32 | 83k / 83k | 33 / 15 / 20 | 22.8 | 3.9 | 9.4 | 388 | 28629 |

Transferred assets (same-origin, per scene, first visit):

- **menu**: glb 1736 kB, js 1080 kB, webp 489 kB, css 33 kB, html 8 kB (total 3346 kB)
- **battle**: glb 1736 kB, mp3 1213 kB, js 1080 kB, webp 489 kB, css 33 kB, html 8 kB (total 4559 kB)
- **cutscene**: glb 1736 kB, mp3 1213 kB, js 1080 kB, webp 489 kB, css 33 kB, html 8 kB, json 0 kB (total 4559 kB)

Second visit (menu, CPU 1x): first 15100 ms -> reload 13064 ms playable; service worker active, reload transferred 81 kB from network / 3346 kB from the service worker cache; offline reload: 6921 ms.

Console errors/warnings (897):

- `[battle x1] PAGEERROR Unable to decode audio data`
- `[battle x4] warning: Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.`
- `[battle x4] PAGEERROR Unable to decode audio data`
- `[battle x6] warning: Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.`
- `[battle x6] PAGEERROR Unable to decode audio data`
- `[cutscene x1] PAGEERROR Unable to decode audio data`
- `[cutscene x4] PAGEERROR Unable to decode audio data`
- `[cutscene x6] warning: Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.`
- `[cutscene x6] PAGEERROR Unable to decode audio data`

## AFTER (forced med) (q=med, 2026-11-19)

| scene | CPU | tier | fps (avg / p95 ms) | draw calls avg/max | triangles avg/max | geo / tex / programs | tex MB | RT MB | JS heap MB | FCP ms | playable ms |
|---|---|---|---|---|---|---|---|---|---|---|---|
| battle | 4x | med ×1 | 0.4 (2257.9 / 2489.5) | 57 / 58 | 138k / 152k | 41 / 28 / 31 | 62.8 | 37 | 12.3 | 320 | 44684 |
| cutscene | 4x | med ×1 | 0.4 (2322.9 / 2465.4) | 45 / 45 | 177k / 177k | 37 / 23 / 30 | 62.8 | 37 | 8.3 | 7304 | 64671 |

Transferred assets (same-origin, per scene, first visit):

- **battle**: glb 1736 kB, mp3 1213 kB, js 1080 kB, webp 489 kB, css 33 kB, html 8 kB (total 4559 kB)
- **cutscene**: glb 1736 kB, mp3 1213 kB, js 1080 kB, webp 489 kB, css 33 kB, html 8 kB, json 0 kB (total 4559 kB)

Console errors/warnings (293):

- `[battle x4] warning: Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.`
- `[battle x4] PAGEERROR Unable to decode audio data`
- `[cutscene x4] warning: Failed to execute 'requestFullscreen' on 'Element': API can only be initiated by a user gesture.`
- `[cutscene x4] PAGEERROR Unable to decode audio data`

## Summary (before -> after)

Device-independent metrics, auto tier (`low` on the emulated mid/low Android), battle at 4x CPU:
draw calls **50 -> 37**, triangles **137k -> 93k** (avg), texture memory **74.5 -> 22.8 MB**, JS heap ~15 -> ~8-13 MB.
Cutscene: draw calls 49 -> 32-33, triangles 128k -> 83k. Forced `med`: texture memory 74.5 -> 62.8 MB (character maps capped at 768 px on phones).
Second visit: 81 kB from the network instead of 3.3 MB (service worker), offline reload reaches the menu.

The fps / playable-time columns of the AFTER runs are **not comparable** with the baseline: they were measured while other
sessions loaded the same 4-core container (load average ~17 vs ~2 during the baseline), so SwiftShader rendering
was several times slower for every build. Re-run both on an idle machine (or a real phone with `?fps`) for timing.

What was changed: texture budget per tier (`gfx/toon.js budgetTexture`, `Q.texMax`, `Q.charTex`), outline hulls culled by
camera distance (`Q.olDist`: low 9 m, med 26 m), no per-frame pose allocations (dogs.js), 3D render skipped behind the
rotate prompt / hidden tab, more weak GPUs mapped to `low`, quicker resolution drop under 24 fps, service worker,
worker cache headers, soft attack telegraph (bug: orange ground rectangle), camera near 0.2 + blob-shadow polygon offset.

Not done (needs a separate pass): regenerating the rigged models with the new `optimize-models.mjs` ratios
(`node tools/optimize-models.mjs kaibutsu_rigged smith_rigged hogen_rigged`, then check the rigs/clips visually);
splitting level 1 / level 2 code and models out of the menu boot (main.js / level2.js `createCast` loads the level 2 cast
at startup); world.js 2048 px panorama canvases on `med`.
