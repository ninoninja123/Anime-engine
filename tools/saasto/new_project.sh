#!/bin/bash
# new_project.sh — uusi anime-videoprojekti YHDELLÄ komennolla (anime-saasto-skill).
# Luo sparse git worktreen privaatti-repoon uudelle haaralle, kopioi moottorin parhaasta lähdeprojektista ILMAN mp4/frames/ääni-mediaa,
# symlinkkaa isot kirjastot (node_modules, models), kirjoittaa STATE.md + .gitignore (story_secret yms.) ja tulostaa seuraavat askeleet.
#
# Käyttö:  tools/saasto/new_project.sh <tyyppi> <nimi> [--dry-run] [--base DIR] [--priv DIR] [--from-branch BR]
#   tyyppi: taistelu3d (LvN, paras taistelu) | taistelu3d-by (Benimaru vs Yami, uusin 3D) | taistelu3d-lib (3v3: 20+ valmista 3D-hahmoa)
#           mindgame (Cheapest Life, uusin 2D) | mindgame-lh (The Last Hand) | mindgame-sc (Seven Chairs, paras mind game)
#           mindgame3d (Eight Strings, VRM) | taistelu2d (Seven Chairs -haaran 2D-cel-moottori engine/+showdown/) | kansikuva (ei gitiä)
#   nimi:   kebab-case, esim. gojo-vs-aizen  -> haara <nimi>-animation, worktree <base>/privaatti-<nimi>, projektikansio <nimi>/
# Ympäristö: PRIV=/home/user/privaatti (luodaan blob:none-kloonina jos puuttuu), BASE=/home/user, CACHE=/home/user/.anime-cache
# Levy: mind game ~2 MB, 3D ~40 MB (+ symlinkit). Varoittaa jos vapaata < 2,5 GB (renderöinti tarvitsee sen).
set -uo pipefail
H=$(cd "$(dirname "$0")/../.." && pwd)                      # anime-engine
DRY=0; BASE=${BASE:-/home/user}; PRIV=${PRIV:-/home/user/privaatti}; CACHE=${CACHE:-/home/user/.anime-cache}; FROMBR=""
POS=()
while [[ $# -gt 0 ]]; do case "$1" in
  --dry-run) DRY=1;; --base) BASE=$2; shift;; --priv) PRIV=$2; shift;; --from-branch) FROMBR=$2; shift;;
  -h|--help) sed -n 2,12p "$0"; exit 0;; *) POS+=("$1");; esac; shift; done
[[ ${#POS[@]} -eq 2 ]] || { sed -n 2,12p "$0"; exit 2; }
TYPE=${POS[0]}; NAME=${POS[1]}
[[ $NAME =~ ^[a-z0-9][a-z0-9-]{1,60}$ ]] || { echo "nimi: vain a-z 0-9 - (esim. gojo-vs-aizen)"; exit 2; }

# preset: lähdehaara | lähdekansio | paikallinen kopio (symlinkkien lähde) | lisä-excludet | symlinkattavat | moottori
case $TYPE in
  taistelu3d)     SB=luffy-vs-naruto-animation;    SD=luffy-vs-naruto;   LOC=$BASE/privaatti-fable17/luffy-vs-naruto; X="docs/ref audio/es_raw audio/src audio/src_synth audio/voice audio/music"; LINK="node_modules models"; KIND=3d;;
  taistelu3d-by)  SB=benimaru-vs-yami-test;        SD=benimaru-vs-yami;  LOC=$BASE/privaatti-fable28/benimaru-vs-yami; X="audio/es_new audio/raw_el audio/raw_el2 audio/voice_new audio/src_lvn audio/music"; LINK="node_modules models"; KIND=3d;;
  taistelu3d-lib) SB=fire-vs-clover-3v3-animation; SD=fire-vs-clover;    LOC=$BASE/privaatti-fable27/fire-vs-clover;   X="audio/music audio/music_user audio/src audio/voice"; LINK="node_modules models"; KIND=3d;;
  mindgame)       SB=iq-game;                      SD=the-cheapest-life; LOC=$BASE/privaatti-fable32/the-cheapest-life; X="engine audio/raw audio/lines audio/music audio/sfx"; LINK=""; KIND=2d;;
  mindgame-lh)    SB=joker-game;                   SD=the-last-hand;     LOC=$BASE/privaatti-fable31/the-last-hand;   X="engine audio/raw audio/lines audio/music audio/sfx"; LINK=""; KIND=2d;;
  mindgame-sc)    SB=mind-game-fable-animation;    SD=mind-game-fable;   LOC=""; X="engine audio/__pycache__"; LINK=""; KIND=2d;;
  mindgame3d)     SB=mindgame-production;          SD=eight-strings;     LOC=$BASE/privaatti-fable30/eight-strings;   X="audio"; LINK="node_modules models"; KIND=3d;;
  taistelu2d)     SB=mind-game-fable-animation;    SD=mind-game-fable;   LOC=""; X="audio/__pycache__ showdown/mg"; LINK=""; KIND=2d;;
  kansikuva)      KIND=cover;;
  *) echo "tuntematon tyyppi: $TYPE (ks. --help)"; exit 2;;
esac
[[ -n $FROMBR ]] && SB=$FROMBR
run(){ if [[ $DRY == 1 ]]; then echo "+ $*"; else eval "$@" || { echo "VIRHE: $*"; exit 1; }; fi; }
FREE=$(df -Pm "$BASE" | awk 'NR==2{print $4}')
[[ $FREE -lt 2500 ]] && echo "VAROITUS: vapaata levyä ${FREE} MB (< 2500). Aja ensin: bash $H/tools/lean/disk_cleanup.sh <vanha projekti> (kuiva-ajo) ja --yes."

# ---------- kansikuva: kevyt kansio, ei gitiä ----------
if [[ $KIND == cover ]]; then
  D=$BASE/covers/$NAME
  run "mkdir -p '$D'"
  run "printf '%s\n' '# STATE: kansikuva $NAME' '- Lähde: <video.mp4 tai still-kuvat>' '- Komento: python3 $H/tools/lean/thumbnail_compose.py $D/thumb.jpg <a.mp4@12> <b.mp4@40> --title \"X VS Y\"' '- Säännöt: docs/QUALITY_GATE.md (englanti kuvassa, ei spoilereita, hahmot näyttävät referenssiltä)' > '$D/STATE.md'"
  echo "SEURAAVAT ASKELEET (kansikuva, katto 60k):"
  echo " 1) valitse 2 framea (contact_sheet.sh VIDEO 10 4 320 sheet.jpg -> katso 1 kerran)"
  echo " 2) python3 $H/tools/lean/thumbnail_compose.py $D/thumb.jpg a.mp4@12 b.mp4@40 --title 'X VS Y'"
  echo " 3) tai uusi still moottorista: 2D 'showdown/r.sh stills PROG out t 1.0' | 3D 'node run.js still <shot>:<frame>' -> compose"
  exit 0
fi

BR=$NAME-animation; WT=$BASE/privaatti-$NAME; P=$WT/$NAME
[[ -e $WT && $DRY == 0 ]] && { echo "on jo olemassa: $WT"; exit 1; }
# 1) privaatti-repo (blob:none = vain tarvittavat blobit ladataan)
if [[ ! -d $PRIV/.git && ! -f $PRIV/.git ]]; then
  run "git clone -q --filter=blob:none --no-checkout https://github.com/ninoninja123/privaatti '$PRIV'"
fi
run "git -C '$PRIV' fetch -q origin '$SB'"
if [[ $DRY == 0 ]] && ! git -C "$PRIV" cat-file -e "origin/$SB:$SD" 2>/dev/null; then echo "lähdettä ei löydy: origin/$SB:$SD"; exit 1; fi
# 2) sparse worktree uudelle haaralle (vain juuritiedostot + uusi kansio)
run "git -C '$PRIV' worktree add -q --no-checkout -b '$BR' '$WT' 'origin/$SB'"
run "git -C '$WT' sparse-checkout set --cone '$NAME'"
run "git -C '$WT' checkout -q '$BR'"
# 3) moottori ilman mediaa (git archive -> tar exclude); paikallinen kopio ei ole tarpeen
EX="--exclude='*.mp4' --exclude='*.wav' --exclude='*.mp3' --exclude='*.m4a' --exclude='*.ogg' --exclude='*.log' --exclude='*.pyc' --exclude='frames' --exclude='tmp' --exclude='review' --exclude='out' --exclude='node_modules' --exclude='story_secret*' --exclude='spoilers*'"
for x in $X; do EX="$EX --exclude='$SD/$x'"; done
for l in $LINK; do EX="$EX --exclude='$SD/$l'"; done
run "mkdir -p '$CACHE/x' && rm -rf '$CACHE/x/$SD'"
run "git -C '$PRIV' archive --format=tar 'origin/$SB' '$SD' | tar -x -C '$CACHE/x' $EX"
run "mv '$CACHE/x/$SD' '$P' && mkdir -p '$P/out' '$P/audio'"
# 4) isot kirjastot symlinkkeinä (luku-käyttö; ei kirjoiteta niihin)
for l in $LINK; do
  if [[ -n $LOC && -e $LOC/$l ]]; then run "ln -s '$LOC/$l' '$P/$l'"
  elif [[ $l == models ]]; then run "mkdir -p '$CACHE/$SD' && git -C '$PRIV' archive 'origin/$SB' '$SD/models' | tar -x -C '$CACHE' && ln -s '$CACHE/$SD/models' '$P/models'"
  else echo "HUOM: $l puuttuu paikallisesti -> aja projektissa: npm install (three@0.170, @pixiv/three-vrm@3.5.5)"; fi
done
# 5) .gitignore + STATE.md
run "printf '%s\n' '*.mp4' '*.wav' '*.mp3' '*.m4a' 'frames/' 'tmp/' 'review/' 'node_modules' 'models' 'out/' 'audio/raw*/' 'audio/lines/' 'audio/music*/' 'audio/sfx/' 'audio/voice*/' 'story_secret*' 'pre/story_secret.md' 'spoilers*' '*.key' '.env' > '$P/.gitignore'"
TODAY=$(date +%F)
run "sed -e 's|<projektin nimi>|$NAME|' -e 's|<pvm>|$TODAY|' -e 's|<privaatti-repo>/<haara>|ninoninja123/privaatti/$BR|' -e 's|työkansio: <polku>|työkansio: $P|' -e 's|<lähdeprojekti>|$SB:$SD|' -e 's|(3D VRM / 2D-elokuvamoottori)|($KIND)|' '$H/docs/STATE_TEMPLATE.md' > '$P/STATE.md'"
run "git -C '$WT' add '$NAME/.gitignore' '$NAME/STATE.md'"
echo
echo "VALMIS: $P  (haara $BR, pohja $SB:$SD, tyyppi $KIND)"
echo "SEURAAVAT ASKELEET:"
echo " 1) Täytä $P/STATE.md (hahmot, pituus, oma tyyli). Salainen juoni: $P/story_secret.md (gitignore)."
echo " 2) Hahmot: kopioi valmiit $H/docs/CHARACTERS_BUILT.md -> characters_built.json (älä rakenna uudelleen)."
echo " 3) Briefit: $H/docs/BRIEFS/*.md -> täytä {{muuttujat}} -> agentit (max 3 vaihetta). Ääni: $H/docs/AUDIO_CATALOG.md + VOICES.md."
case $KIND in
  3d) echo " 4) Ajo: cd $P && node run.js still <shot>:<frame> | node run.js render 0 N --workers 4 (ks. $H/docs/ENGINES.md rivi '$TYPE')";;
  2d) echo " 4) Ajo: cd $P/showdown && ./r.sh sheet PROG out.png list:t1,t2 0.25 | ./r.sh all PROG ../frames/seg 4 1 12 ; build: tools/build_final.sh";;
esac
echo " 5) Tarkista: $H/docs/QUALITY_GATE.md + tools/lean/*. Commit: git -C $WT add $NAME && git -C $WT commit -m ... && git -C $WT push -u origin $BR"
