#!/usr/bin/env bash
# fetch_assets.sh <dest-dir> [set...]   sets: vroid (VRoid sample VRMs, ~140 MB), vrm1 (three-vrm / VRM Consortium samples, ~22 MB),
#   vrma (a few CC0 fight clips from open-vrma, <1 MB), vfx (Kenney particle pack CC0 subset, ~0.5 MB), props (Quaternius CC0 flat-colour nature, <0.1 MB)
# Downloads go to <dest-dir>, never into this repo. Licences: see ASSETS.md (read them before publishing anything).
set -euo pipefail; DEST=${1:?dest dir}; shift; SETS=${*:-vrma}; mkdir -p "$DEST"; cd "$DEST"
get(){ [ -s "$2" ] || curl -fsSL -o "$2" "$1"; echo "$2"; }
for s in $SETS; do case $s in
 vroid) B=https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid
   for f in stable/AvatarSample_A stable/AvatarSample_B stable/AvatarSample_C beta/Sakurada_Fumiriya beta/HairSample_Male beta/HairSample_Female beta/Sendagaya_Shino beta/Sendagaya_Shibu beta/Darkness_Shibu beta/Vita beta/Vivi beta/Victoria_Rubin; do get "$B/$f.vrm" "$(basename $f).vrm"; done ;;
 vrm1) get https://raw.githubusercontent.com/pixiv/three-vrm/dev/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm VRM1_Constraint_Twist_Sample.vrm
   get https://raw.githubusercontent.com/pixiv/three-vrm/0.x/packages/three-vrm/examples/models/three-vrm-girl.vrm three-vrm-girl.vrm ;;
 vrma) H=https://huggingface.co/datasets/Sanami/open-vrma/resolve/main
   for f in quaternius/ual2/Sword_Regular_Combo quaternius/ual2/Sword_Block quaternius/ual2/Melee_Hook quaternius/ual1/Punch_Cross quaternius/ual2/Hit_Knockback kaykit/medium/Melee_2H_Attack_Spin kaykit/medium/Melee_1H_Attack_Slice_Diagonal kaykit/medium/Dodge_Backward kaykit/large/Death_A cmu/135_07 cmu/135_04; do get "$H/$f.vrma" "$(echo $f | tr / _).vrma"; get "$H/$f.motion.json" "$(echo $f | tr / _).motion.json"; done
   get "$H/catalog.csv" open-vrma_catalog.csv ;;
 vfx) B=https://cdn.jsdelivr.net/gh/calinou/kenney-particle-pack@master/addons/kenney_particle_pack
   for f in slash_01 slash_02 slash_03 slash_04 spark_05 spark_07 star_06 smoke_07 magic_03 twirl_02 scratch_01 flare_01 trace_04 scorch_02 light_02; do get "$B/$f.png" "kenney_$f.png"; done ;;
 props) Q=https://huggingface.co/datasets/codepawl/quaternius-glb/resolve/main
   for m in simplenature__Tree2 simplenature__Tree4 simplenature__Bush2 simplenature__Rock1 medievalvillage__Rock_3; do get "$Q/engine/$m/$m.glb" "$m.glb"; done ;;
 *) echo "unknown set $s" >&2 ;;
esac; done
