#!/usr/bin/env python3
"""chars_md.py — regenerate docs/CHARACTERS_BUILT.md from docs/characters_built.json (edit the JSON, then run this)."""
import json, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'docs')
d = json.load(open(os.path.join(D, 'characters_built.json')))
o = ["# CHARACTERS_BUILT: valmiit hahmot — KOPIOI, älä rakenna uudelleen",
     "Data: `docs/characters_built.json` (sama sisältö koneluettavana; tämä tiedosto generoidaan: `python3 tools/saasto/chars_md.py`). Lähde = privaatti-haara:kansio. Hae koodi: `git -C /home/user/privaatti show origin/<haara>:<kansio>/<tiedosto>` tai `new_project.sh` kopioi koko moottorin.",
     "Kopiointi: 3D → kopioi rakentaja (`make<Who>` / `M3.<who>` / `M8.<who>`) + `appearance.json`-rivi + 2D-lähikuvapää (`head2d.js`) omaan `chars_<projekti>.js`:ään; 2D → `showdown/mg/cast*.js` sisältää jo kaikki 2D-hahmot (`drawChar(g,'<key>',P)`).",
     "Tarkistus aina: renderöi 1 lähikuva-arkki jokaisen hahmon tunnusmerkeistä (silmät!) ennen tuotantoa (`QUALITY_GATE.md`).", "",
     "## 3D (VRM + MToon, VRoid-pohja; kasvot 2D-lähikuvina)", "| hahmo | sarja | lähde | tiedosto / avain | ref | tunnusm. | heikkoudet / korjaukset |", "|---|---|---|---|---|---|---|"]
o += [f"| {c['name']} | {c['series']} | `{c['src']}` | {c['file']} / `{c['key']}` | {c['ref']} | {c['sig']} | {c['notes']} |" for c in d['3d']]
o += ["", "## 2D (mind game -moottori `showdown/mg/`; ilmeet calm/smile/smirk/cold/angry/shock/grin/demon/sad/tense/blank/tired/…)", "| hahmo | sarja | lähde | tiedosto / avain | tunnusm. | huom. |", "|---|---|---|---|---|---|"]
o += [f"| {c['name']} | {c['series']} | `{c['src']}` | {c['file']} / `{c['key']}` | {c['sig']} | {c['notes']} |" for c in d['2d']]
L = d['2d_legacy_engine']
o += ["", f"## Vanha 2D-cel-moottori\n{L['src']}: {L['list']}. {L['notes']}", "", "## Yleiset hahmo-opit",
      "- 3D ja 2D luetaan YHDESTÄ appearance-taulusta (värit). `fire-vs-clover/tools/likeness_check.py` mittaa värit per alue (~1,5 min).",
      "- Älä koskaan muuta tunnusmerkkiä mittasuhteita korjatessa (Benimarun X-silmä katosi kerran).",
      "- Tunnistettavuus = siluetti + 3 merkkiä + referenssin värit. 2.5D-cut-outit/2D-nuket hylätty.",
      "- Uusi hahmo: lisää rivi characters_built.jsoniin ja aja chars_md.py."]
open(os.path.join(D, 'CHARACTERS_BUILT.md'), 'w').write("\n".join(o) + "\n")
print(json.dumps({"md": "docs/CHARACTERS_BUILT.md", "3d": len(d['3d']), "2d": len(d['2d'])}))
