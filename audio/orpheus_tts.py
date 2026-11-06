#!/usr/bin/env python3
"""Orpheus TTS (paikallinen, CPU). Käyttäjän valinta: tunnetagit <chuckle> <laugh> <sigh> <cough> <sniffle> <groan> <yawn> <gasp>.

Käyttö:  python orpheus_tts.py jobs.json OUT_DIR
jobs.json: [{"voice":"dan","name":"gojo1","text":"<chuckle> Don't blink."}, ...]
Äänet (englanti): tara, leah, jess, leo, dan, mia, zac, zoe. Malli: unsloth/orpheus-3b-0.1-ft (avoin kopio; canopylabs on gated).
Vaatii: torch, transformers, snac, soundfile. ~2-3 min / repliikki CPU:lla (2 säiettä), malli ~4-5 Gt levyä.
Jälkikäsittely: leikkaa hiljaisuus, tasaa ~-16...-18 LUFS (mittaa ja säädä vahvistus; loudnorm ei tasaa lyhyitä klippejä), limiter perään.
"""
import json, sys, time, torch, soundfile as sf
torch.set_num_threads(2)
from transformers import AutoTokenizer, AutoModelForCausalLM
from snac import SNAC

jobs = json.load(open(sys.argv[1])); out = sys.argv[2].rstrip("/") + "/"
R = "unsloth/orpheus-3b-0.1-ft"
tok = AutoTokenizer.from_pretrained(R)
m = AutoModelForCausalLM.from_pretrained(R, dtype=torch.bfloat16).eval()
snac = SNAC.from_pretrained("hubertsiuzdak/snac_24khz").eval()
for j in jobs:
    t = time.time()
    ids = tok(f"{j['voice']}: {j['text']}", return_tensors="pt").input_ids
    ids = torch.cat([torch.tensor([[128259]]), ids, torch.tensor([[128009, 128260]])], 1)
    torch.manual_seed(j.get("seed", 0))
    with torch.no_grad():
        g = m.generate(ids, attention_mask=torch.ones_like(ids), max_new_tokens=480, do_sample=True,
                       temperature=0.6, top_p=0.95, repetition_penalty=1.1, eos_token_id=128258)
    g = g[0, ids.shape[1]:].tolist()
    if 128257 in g: g = g[len(g) - g[::-1].index(128257):]
    c = [x - 128266 for x in g if x >= 128266]; c = c[:len(c) // 7 * 7]
    l1, l2, l3 = [], [], []
    for i in range(len(c) // 7):
        f = c[7*i:7*i+7]
        l1.append(f[0]); l2.append(f[1] - 4096); l3 += [f[2] - 2*4096, f[3] - 3*4096]
        l2.append(f[4] - 4*4096); l3 += [f[5] - 5*4096, f[6] - 6*4096]
    with torch.no_grad():
        a = snac.decode([torch.tensor(l1).unsqueeze(0), torch.tensor(l2).unsqueeze(0), torch.tensor(l3).unsqueeze(0)]).squeeze().numpy()
    sf.write(f"{out}{j['voice']}_{j['name']}.wav", a, 24000)
    print(f"{j['voice']}_{j['name']} gen={time.time()-t:.0f}s dur={len(a)/24000:.2f}s", flush=True)
