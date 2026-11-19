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

