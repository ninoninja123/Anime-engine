#!/usr/bin/env python3
"""
Standalone Direct GLB Quadruped Auto-Rigger & Animator (No Blender Required!)
=============================================================================
Reads any static unrigged dog/creature GLB (including husky_dog_3d_model.glb / weed.glb),
preserves 100% of original topology, normals, UVs, materials, and embedded PBR textures,
orients the mesh so the dog faces +X, up is +Y, paws rest on Y=0, builds the 24-bone
quadruped rig, computes normalized 4-influence skin weights with strict L/R leg separation,
and writes all 8 game-ready glTF animations (idle, walk, run, jump, bite, hurt, die, battoga)
into a single mobile-ready GLB for Three.js!
"""

import os
import json
import math
import struct
import numpy as np

INPUT_GLB = "/Users/ninoarling/.gemini/antigravity/brain/781b2bde-aed7-4b84-9e2d-8910eb1fe70c/.user_uploaded/media_1795026078550_977b8b8e.glb"
OUTPUT_GLB = "/Users/ninoarling/.gemini/antigravity/scratch/dog-rig/weed_rigged.glb"
ORIENTATION_OVERRIDE = 0.0  # degrees around +Y up axis
FPS = 30

PROPORTIONS = {
    "ROOT_U": 0.48,       "ROOT_W": 0.50,
    "HIPS_U": 0.21,       "HIPS_W": 0.54,
    "SPINE1_U": 0.39,     "SPINE1_W": 0.53,
    "SPINE2_U": 0.56,     "SPINE2_W": 0.54,
    "CHEST_U": 0.73,      "CHEST_W": 0.55,
    "NECK_BASE_U": 0.73,  "NECK_BASE_W": 0.57,
    "HEAD_BASE_U": 0.81,  "HEAD_BASE_W": 0.72,
    "NOSE_TIP_U": 0.98,   "NOSE_TIP_W": 0.66,
    "JAW_BASE_U": 0.83,   "JAW_BASE_W": 0.63,
    "JAW_TIP_U": 0.96,    "JAW_TIP_W": 0.59,
    "EAR_BASE_U": 0.83,   "EAR_BASE_V": 0.23,  "EAR_BASE_W": 0.82,
    "EAR_TIP_U": 0.86,    "EAR_TIP_V": 0.26,   "EAR_TIP_W": 0.98,
    "TAIL0_U": 0.19,      "TAIL0_W": 0.58,
    "TAIL1_U": 0.12,      "TAIL1_W": 0.66,
    "TAIL2_U": 0.06,      "TAIL2_W": 0.73,
    "TAIL3_U": 0.01,      "TAIL3_W": 0.70,
    "FRONT_LAT_V": 0.37,
    "FRONT_SHOULDER_U": 0.74, "FRONT_SHOULDER_W": 0.49,
    "FRONT_KNEE_U": 0.73,     "FRONT_KNEE_W": 0.26,
    "FRONT_ANKLE_U": 0.75,    "FRONT_ANKLE_W": 0.07,
    "FRONT_TOE_U": 0.80,      "FRONT_TOE_W": 0.02,
    "BACK_LAT_V": 0.38,
    "BACK_HIP_U": 0.21,       "BACK_HIP_W": 0.50,
    "BACK_KNEE_U": 0.23,      "BACK_KNEE_W": 0.27,
    "BACK_ANKLE_U": 0.18,     "BACK_ANKLE_W": 0.08,
    "BACK_TOE_U": 0.23,       "BACK_TOE_W": 0.02,
}


# ---------------- Math Helpers (glTF Y-up: +X fwd, +Y up, -Z left, +Z right) ----------------

def quat_from_axis_angle(axis, deg):
    a = np.asarray(axis, dtype=np.float64)
    n = np.linalg.norm(a)
    if n < 1e-12 or abs(deg) < 1e-9:
        return np.array([0.0, 0.0, 0.0, 1.0], dtype=np.float64)
    a /= n
    half = math.radians(deg) * 0.5
    s = math.sin(half)
    return np.array([a[0] * s, a[1] * s, a[2] * s, math.cos(half)], dtype=np.float64)


def quat_mul(q1, q2):
    x1, y1, z1, w1 = q1
    x2, y2, z2, w2 = q2
    return np.array([
        w1*x2 + x1*w2 + y1*z2 - z1*y2,
        w1*y2 - x1*z2 + y1*w2 + z1*x2,
        w1*z2 + x1*y2 - y1*x2 + z1*w2,
        w1*w2 - x1*x2 - y1*y2 - z1*z2,
    ], dtype=np.float64)


def quat_to_mat3(q):
    x, y, z, w = q
    return np.array([
        [1 - 2*(y*y + z*z), 2*(x*y - w*z),     2*(x*z + w*y)],
        [2*(x*y + w*z),     1 - 2*(x*x + z*z), 2*(y*z - w*x)],
        [2*(x*z - w*y),     2*(y*z + w*x),     1 - 2*(x*x + y*y)],
    ], dtype=np.float64)


def rot_y_mat3(rad):
    c, s = math.cos(rad), math.sin(rad)
    return np.array([[c, 0.0, s], [0.0, 1.0, 0.0], [-s, 0.0, c]], dtype=np.float64)


def read_glb(path):
    with open(path, "rb") as f:
        magic, ver, _ = struct.unpack("<4sII", f.read(12))
        assert magic == b"glTF" and ver == 2
        c0_len, _ = struct.unpack("<II", f.read(8))
        gltf = json.loads(f.read(c0_len).decode("utf-8"))
        c1_len, _ = struct.unpack("<II", f.read(8))
        bin_data = bytearray(f.read(c1_len))
    return gltf, bin_data


def get_accessor_array(gltf, bin_data, acc_idx, dtype=np.float32, cols=3):
    acc = gltf["accessors"][acc_idx]
    bv = gltf["bufferViews"][acc["bufferView"]]
    off = bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    stride = bv.get("byteStride", cols * np.dtype(dtype).itemsize)
    cnt = acc["count"]
    arr = np.ndarray((cnt, cols), dtype=dtype, buffer=bin_data[off:off + cnt * stride], strides=(stride, np.dtype(dtype).itemsize)).copy()
    return arr


def build_rigged_glb(in_path, out_path, override_deg=0.0):
    gltf, bin_data = read_glb(in_path)

    # Support single-mesh GLB (bake node world transform into vertices so skin binds at identity!)
    mesh_nodes = [n for n in gltf["nodes"] if "mesh" in n]
    assert len(mesh_nodes) >= 1, "No mesh node found"
    mnode = mesh_nodes[0]
    mesh = gltf["meshes"][mnode["mesh"]]
    prim = mesh["primitives"][0]

    pos = get_accessor_array(gltf, bin_data, prim["attributes"]["POSITION"], np.float32, 3).astype(np.float64)
    nrm = get_accessor_array(gltf, bin_data, prim["attributes"]["NORMAL"], np.float32, 3).astype(np.float64) if "NORMAL" in prim["attributes"] else None

    # Apply existing node TRS if present
    if "rotation" in mnode:
        R0 = quat_to_mat3(mnode["rotation"])
        pos = pos @ R0.T
        if nrm is not None:
            nrm = nrm @ R0.T
    if "scale" in mnode:
        s0 = np.array(mnode["scale"], dtype=np.float64)
        pos *= s0
    if "translation" in mnode:
        pos += np.array(mnode["translation"], dtype=np.float64)

    # ---- Stage 2: Auto-orient in glTF Y-up (+X forward, +Y up, paws on Y=0) ----
    span = np.ptp(pos, axis=0)
    yaw = 0.0
    if span[2] > span[0]:
        # Longest horizontal axis is Z -> rotate +90 deg around +Y so +Z maps to +X!
        yaw = math.pi * 0.5

    R_yaw = rot_y_mat3(yaw)
    rpos = pos @ R_yaw.T
    min_x, max_x = rpos[:, 0].min(), rpos[:, 0].max()
    min_y, max_y = rpos[:, 1].min(), rpos[:, 1].max()
    lx = max(max_x - min_x, 1e-6)
    hy = max(max_y - min_y, 1e-6)

    u_tmp = (rpos[:, 0] - min_x) / lx
    w_tmp = (rpos[:, 1] - min_y) / hy
    pos_mask = u_tmp > 0.72
    neg_mask = u_tmp < 0.28
    pos_score = (w_tmp[pos_mask].max() if pos_mask.any() else 0.0) + 0.25 * np.mean(w_tmp[pos_mask] > 0.65)
    neg_score = (w_tmp[neg_mask].max() if neg_mask.any() else 0.0) + 0.25 * np.mean(w_tmp[neg_mask] > 0.65)
    if neg_score > pos_score:
        yaw += math.pi

    yaw += math.radians(override_deg)
    R_final = rot_y_mat3(yaw)
    pos = pos @ R_final.T
    if nrm is not None:
        nrm = nrm @ R_final.T
        nl = np.linalg.norm(nrm, axis=1, keepdims=True)
        nrm = np.where(nl > 1e-8, nrm / np.maximum(nl, 1e-8), np.array([0.0, 1.0, 0.0]))

    # Center X & Z, place paws on Y = 0
    pos[:, 0] -= 0.5 * (pos[:, 0].min() + pos[:, 0].max())
    pos[:, 2] -= 0.5 * (pos[:, 2].min() + pos[:, 2].max())
    pos[:, 1] -= pos[:, 1].min()

    bbox = {
        "min_x": float(pos[:, 0].min()), "max_x": float(pos[:, 0].max()),
        "min_y": float(pos[:, 1].min()), "max_y": float(pos[:, 1].max()),
        "min_z": float(pos[:, 2].min()), "max_z": float(pos[:, 2].max()),
    }
    bbox["len_x"] = bbox["max_x"] - bbox["min_x"]
    bbox["height_y"] = bbox["max_y"] - bbox["min_y"]
    bbox["half_z"] = 0.5 * (bbox["max_z"] - bbox["min_z"])

    # ---- Stage 3: Build 24-Bone Quadruped Hierarchy (Clean Identity Rest Quaternions!) ----
    # Auto-adapt lateral/fore-aft paw placement from actual bottom 8% vertices so narrow wolves
    # and wide huskies both get leg bones dead-center inside their geometry!
    P = dict(PROPORTIONS)
    u_norm = (pos[:, 0] - bbox["min_x"]) / max(bbox["len_x"], 1e-6)
    w_norm = (pos[:, 1] - bbox["min_y"]) / max(bbox["height_y"], 1e-6)
    v_norm = np.abs(pos[:, 2]) / max(bbox["half_z"], 1e-6)
    low_mask = w_norm < 0.08
    f_paws = low_mask & (u_norm > 0.50)
    b_paws = low_mask & (u_norm <= 0.50)
    if np.count_nonzero(f_paws) >= 8:
        fu = float(np.median(u_norm[f_paws]))
        fv_det = float(np.clip(np.median(v_norm[f_paws]), 0.22, 0.85))
        du_f = fu - P["FRONT_ANKLE_U"]
        P["FRONT_LAT_V"] = fv_det
        for k in ("FRONT_SHOULDER_U", "FRONT_KNEE_U", "FRONT_ANKLE_U", "FRONT_TOE_U"):
            P[k] = float(np.clip(P[k] + du_f, 0.52, 0.96))
    if np.count_nonzero(b_paws) >= 8:
        bu = float(np.median(u_norm[b_paws]))
        bv_det = float(np.clip(np.median(v_norm[b_paws]), 0.22, 0.85))
        du_b = bu - P["BACK_ANKLE_U"]
        P["BACK_LAT_V"] = bv_det
        for k in ("BACK_HIP_U", "BACK_KNEE_U", "BACK_ANKLE_U", "BACK_TOE_U"):
            P[k] = float(np.clip(P[k] + du_b, 0.05, 0.48))

    def pt(u, v_left, w):
        # v_left > 0 is Left (-Z in glTF!), v_left < 0 is Right (+Z in glTF!)
        return np.array([
            bbox["min_x"] + u * bbox["len_x"],
            bbox["min_y"] + w * bbox["height_y"],
            -v_left * bbox["half_z"],
        ], dtype=np.float64)

    bone_defs = [
        # (name, parent_name, head_pt, tail_pt_for_skinning, deform)
        ("root",      None,       pt(P["ROOT_U"], 0.0, P["ROOT_W"]),      pt(P["ROOT_U"] + 0.10, 0.0, P["ROOT_W"]), False),
        ("spine_01",  "root",     pt(P["HIPS_U"], 0.0, P["HIPS_W"]),      pt(P["SPINE1_U"], 0.0, P["SPINE1_W"]),    True),
        ("spine_02",  "spine_01", pt(P["SPINE1_U"], 0.0, P["SPINE1_W"]),  pt(P["SPINE2_U"], 0.0, P["SPINE2_W"]),    True),
        ("spine_03",  "spine_02", pt(P["SPINE2_U"], 0.0, P["SPINE2_W"]),  pt(P["CHEST_U"], 0.0, P["CHEST_W"]),      True),
        ("neck",      "spine_03", pt(P["NECK_BASE_U"], 0.0, P["NECK_BASE_W"]), pt(P["HEAD_BASE_U"], 0.0, P["HEAD_BASE_W"]), True),
        ("head",      "neck",     pt(P["HEAD_BASE_U"], 0.0, P["HEAD_BASE_W"]), pt(P["NOSE_TIP_U"], 0.0, P["NOSE_TIP_W"]),   True),
        ("jaw",       "head",     pt(P["JAW_BASE_U"], 0.0, P["JAW_BASE_W"]),   pt(P["JAW_TIP_U"], 0.0, P["JAW_TIP_W"]),     True),
        ("ear_L",     "head",     pt(P["EAR_BASE_U"], +P["EAR_BASE_V"], P["EAR_BASE_W"]), pt(P["EAR_TIP_U"], +P["EAR_TIP_V"], P["EAR_TIP_W"]), True),
        ("ear_R",     "head",     pt(P["EAR_BASE_U"], -P["EAR_BASE_V"], P["EAR_BASE_W"]), pt(P["EAR_TIP_U"], -P["EAR_TIP_V"], P["EAR_TIP_W"]), True),
        ("tail_01",   "spine_01", pt(P["TAIL0_U"], 0.0, P["TAIL0_W"]),    pt(P["TAIL1_U"], 0.0, P["TAIL1_W"]), True),
        ("tail_02",   "tail_01",  pt(P["TAIL1_U"], 0.0, P["TAIL1_W"]),    pt(P["TAIL2_U"], 0.0, P["TAIL2_W"]), True),
        ("tail_03",   "tail_02",  pt(P["TAIL2_U"], 0.0, P["TAIL2_W"]),    pt(P["TAIL3_U"], 0.0, P["TAIL3_W"]), True),
    ]
    for side, sgn in (("L", 1.0), ("R", -1.0)):
        fv = sgn * P["FRONT_LAT_V"]
        bone_defs.extend([
            (f"front_upper_{side}", "spine_03",           pt(P["FRONT_SHOULDER_U"], fv, P["FRONT_SHOULDER_W"]), pt(P["FRONT_KNEE_U"], fv, P["FRONT_KNEE_W"]), True),
            (f"front_lower_{side}", f"front_upper_{side}", pt(P["FRONT_KNEE_U"], fv, P["FRONT_KNEE_W"]),         pt(P["FRONT_ANKLE_U"], fv, P["FRONT_ANKLE_W"]), True),
            (f"front_paw_{side}",   f"front_lower_{side}", pt(P["FRONT_ANKLE_U"], fv, P["FRONT_ANKLE_W"]),       pt(P["FRONT_TOE_U"], fv, P["FRONT_TOE_W"]), True),
        ])
        bv = sgn * P["BACK_LAT_V"]
        bone_defs.extend([
            (f"back_upper_{side}", "spine_01",           pt(P["BACK_HIP_U"], bv, P["BACK_HIP_W"]),     pt(P["BACK_KNEE_U"], bv, P["BACK_KNEE_W"]), True),
            (f"back_lower_{side}", f"back_upper_{side}", pt(P["BACK_KNEE_U"], bv, P["BACK_KNEE_W"]),   pt(P["BACK_ANKLE_U"], bv, P["BACK_ANKLE_W"]), True),
            (f"back_paw_{side}",   f"back_lower_{side}", pt(P["BACK_ANKLE_U"], bv, P["BACK_ANKLE_W"]), pt(P["BACK_TOE_U"], bv, P["BACK_TOE_W"]), True),
        ])

    bones = []
    b_idx_map = {}
    for bi, (name, pname, h_pt, t_pt, deform) in enumerate(bone_defs):
        b_idx_map[name] = bi
        p_idx = b_idx_map[pname] if pname else None
        local_t = h_pt - bones[p_idx]["world_pos"] if p_idx is not None else h_pt.copy()
        ibm = np.eye(4, dtype=np.float64)
        ibm[:3, 3] = -h_pt
        bones.append({
            "idx": bi, "name": name, "parent": p_idx, "children": [],
            "world_pos": h_pt, "tail_pos": t_pt, "local_t": local_t,
            "deform": deform, "ibm": ibm,
        })
        if p_idx is not None:
            bones[p_idx]["children"].append(bi)

    # ---- Stage 4: Vectorized Capsule Skinning + L/R Leg Clamp + Laplacian Smooth + Limit 4 ----
    N = len(pos)
    B_cnt = len(bones)
    H = bbox["height_y"]
    L_len = bbox["len_x"]
    HZ = bbox["half_z"]

    raw_w = np.zeros((N, B_cnt), dtype=np.float64)
    for b in bones:
        if not b["deform"]:
            continue
        bi = b["idx"]
        bname = b["name"]
        p0, p1 = b["world_pos"], b["tail_pos"]
        ab = p1 - p0
        ab2 = float(np.dot(ab, ab))
        seg_len = math.sqrt(max(ab2, 1e-8))
        sigma = max(0.045 * H, seg_len * 0.52)
        if bname.startswith("spine"):
            sigma = 0.16 * H
        elif bname in ("neck", "head"):
            sigma = 0.13 * H
        elif bname == "jaw":
            sigma = 0.055 * H
        elif bname.startswith("ear_"):
            sigma = 0.055 * H

        t = np.clip(np.sum((pos - p0) * ab, axis=1) / max(ab2, 1e-8), 0.0, 1.0)
        proj = p0 + t[:, None] * ab
        dist = np.linalg.norm(pos - proj, axis=1)
        w = np.exp(-((dist / sigma) ** 2) * 2.4) + 1e-5 / (1.0 + dist * 20.0)

        # Strict Left (-Z) vs Right (+Z) clamp so left and right legs/ears NEVER bleed across centerline!
        if bname.endswith("_L"):
            w[pos[:, 2] > 0.012 * HZ] = 0.0
        elif bname.endswith("_R"):
            w[pos[:, 2] < -0.012 * HZ] = 0.0

        # Prevent leg bones from grabbing belly/ribcage high up, and spine from grabbing lower legs
        if "front_" in bname or "back_" in bname:
            w[pos[:, 1] > 0.54 * H] *= 0.10
        if bname.startswith("spine"):
            w[pos[:, 1] < 0.28 * H] *= 0.02

        # Jaw only affects lower half of snout in front of jaw hinge!
        if bname == "jaw":
            jaw_y_lim = p0[1] + 0.015 * H - 0.12 * np.maximum(0.0, pos[:, 0] - p0[0])
            w[(pos[:, 1] > jaw_y_lim) | (pos[:, 0] < p0[0] - 0.02 * L_len)] = 0.0

        # Ears only affect top of head above ear base
        if bname.startswith("ear_"):
            w[pos[:, 1] < p0[1] - 0.03 * H] = 0.0

        raw_w[:, bi] = w

    # Topology-aware 1-pass Laplacian weight smoothing using triangle adjacency!
    idx_acc = gltf["accessors"][prim["indices"]]
    idx_dtype = np.uint16 if idx_acc["componentType"] == 5123 else (np.uint32 if idx_acc["componentType"] == 5125 else np.uint8)
    bv_i = gltf["bufferViews"][idx_acc["bufferView"]]
    off_i = bv_i.get("byteOffset", 0) + idx_acc.get("byteOffset", 0)
    tris = np.frombuffer(bin_data[off_i:off_i + idx_acc["count"] * np.dtype(idx_dtype).itemsize], dtype=idx_dtype).reshape(-1, 3)

    nbr_sum = np.zeros_like(raw_w)
    nbr_cnt = np.zeros((N, 1), dtype=np.float64)
    for a_col, b_col in ((0, 1), (1, 2), (2, 0)):
        ia, ib = tris[:, a_col], tris[:, b_col]
        np.add.at(nbr_sum, ia, raw_w[ib])
        np.add.at(nbr_sum, ib, raw_w[ia])
        np.add.at(nbr_cnt, ia, 1.0)
        np.add.at(nbr_cnt, ib, 1.0)
    raw_w = 0.72 * raw_w + 0.28 * (nbr_sum / np.maximum(nbr_cnt, 1.0))

    # Re-enforce hard L/R leg zeroing AFTER smoothing so smoothing never leaks across paws!
    for b in bones:
        if b["name"].endswith("_L"):
            raw_w[pos[:, 2] > 0.015 * HZ, b["idx"]] = 0.0
        elif b["name"].endswith("_R"):
            raw_w[pos[:, 2] < -0.015 * HZ, b["idx"]] = 0.0

    # Limit to top 4 bone influences & normalize
    top4 = np.argsort(-raw_w, axis=1)[:, :4]
    joints_0 = top4.astype(np.uint16)
    weights_0 = np.take_along_axis(raw_w, top4, axis=1).astype(np.float64)
    w_sum = np.sum(weights_0, axis=1, keepdims=True)
    bad = (w_sum[:, 0] < 1e-8)
    if np.any(bad):
        joints_0[bad] = [b_idx_map["spine_02"], 0, 0, 0]
        weights_0[bad] = [1.0, 0.0, 0.0, 0.0]
        w_sum = np.sum(weights_0, axis=1, keepdims=True)
    weights_0 = (weights_0 / w_sum).astype(np.float32)

    # ---- Stage 5: Build All 8 Animations in glTF Space (+X fwd, +Y up, -Z left, +Z right) ----
    # Because every bone has Identity rest rotation:
    #   - Sagittal bend (pitch / leg swing): rotation around Z axis (0, 0, 1):
    #     Right-hand rule around +Z (+X x +Y = +Z):
    #       +rotZ rotates +X -> +Y (noses/heads pitch UP!) and -Y -> +X (downward legs swing FORWARD +X!!)!
    #       -rotZ rotates +X -> -Y (noses/jaws pitch DOWN!) and -Y -> -X (downward legs swing BACKWARD -X!!)!
    #       For backward-pointing tail (-X): +rotZ rotates -X -> -Y (tail DOWN), -rotZ lifts tail UP!
    #   - Lateral wag/turn (yaw): rotation around Y axis (0, 1, 0):
    #     +rotY turns +X -> -Z (left), -X -> +Z (tail wags right).
    #   - Longitudinal roll (battoga 360 spin & die side-collapse!): rotation around X axis (1, 0, 0)!
    def euler_zyx_quat(rx_deg, ry_deg, rz_deg):
        qx = quat_from_axis_angle([1, 0, 0], rx_deg)
        qy = quat_from_axis_angle([0, 1, 0], ry_deg)
        qz = quat_from_axis_angle([0, 0, 1], rz_deg)
        return quat_mul(qz, quat_mul(qy, qx))

    clips = []  # list of (name, end_frame, is_loop, frames_list, key_eval_fn)

    # 1. idle (2.0s = 60f, loop, step 4)
    def eval_idle(f):
        u = 0.0 if f == 60 else f / 60.0
        ph = u * 2.0 * math.pi
        br = math.sin(ph * 2.0)
        sw = math.sin(ph)
        ear_tw = (math.sin(ph * 3.0) ** 5)
        return (0.0, 0.008 * H * br, 0.0), {
            "spine_02": (0, 0, -1.6 * br),
            "spine_03": (0, 0, 1.4 * br),
            "neck":     (0, 2.5 * sw, 2.0 * br),
            "head":     (2.0 * sw, 4.0 * sw, -1.8 * br),
            "jaw":      (0, 0, -2.5 * max(0.0, br)),
            "ear_L":    (8.0 * max(0.0, ear_tw), 0, 4.0 * sw),
            "ear_R":    (-8.0 * max(0.0, -ear_tw), 0, -4.0 * sw),
            "tail_01":  (0, 10.0 * sw, -3.0 * br),
            "tail_02":  (0, 14.0 * math.sin(ph - 0.5), 0),
            "tail_03":  (0, 16.0 * math.sin(ph - 1.0), 0),
        }
    clips.append(("idle", 60, True, list(range(0, 61, 4)), eval_idle))

    # 2. walk (1.0s = 30f, loop, diagonal gait, step 3)
    def eval_walk(f):
        u = 0.0 if f == 30 else f / 30.0
        ph = u * 2.0 * math.pi
        sA, cA = math.sin(ph), math.cos(ph)
        sB, cB = -sA, -cA
        return (0.0, 0.018 * H * math.cos(ph * 2.0), 0.0), {
            "spine_01": (0, 2.5 * sA, -1.5 * math.cos(ph * 2.0)),
            "spine_02": (0, -2.0 * sA, 0),
            "spine_03": (0, -2.0 * sA, 1.5 * math.cos(ph * 2.0)),
            "neck":     (0, 0, -2.5 * math.sin(ph * 2.0)),
            "head":     (0, 0, 2.5 * math.sin(ph * 2.0)),
            "tail_01":  (0, 8.0 * sA, -4.0),
            "tail_02":  (0, 11.0 * math.sin(ph - 0.6), 0),
            "tail_03":  (0, 12.0 * math.sin(ph - 1.1), 0),
            "front_upper_L": (0, 0, 24.0 * sA),
            "front_lower_L": (0, 0, -26.0 * max(0.0, cA)),
            "front_paw_L":   (0, 0, 14.0 * max(0.0, cA)),
            "front_upper_R": (0, 0, 24.0 * sB),
            "front_lower_R": (0, 0, -26.0 * max(0.0, cB)),
            "front_paw_R":   (0, 0, 14.0 * max(0.0, cB)),
            "back_upper_R":  (0, 0, 22.0 * sA),
            "back_lower_R":  (0, 0, 24.0 * max(0.0, cA)),
            "back_paw_R":    (0, 0, -14.0 * max(0.0, cA)),
            "back_upper_L":  (0, 0, 22.0 * sB),
            "back_lower_L":  (0, 0, 24.0 * max(0.0, cB)),
            "back_paw_L":    (0, 0, -14.0 * max(0.0, cB)),
        }
    clips.append(("walk", 30, True, list(range(0, 31, 3)), eval_walk))

    # 3. run (0.6s = 18f, loop, gallop + spine flex + strong tail, step 2)
    def eval_run(f):
        u = 0.0 if f == 18 else f / 18.0
        ph = u * 2.0 * math.pi
        fl, fr = ph, ph - 0.45
        bl, br_p = ph + math.pi, ph + math.pi - 0.45
        flex = math.sin(ph)
        return (0.0, 0.045 * H * math.sin(ph - 0.4), 0.0), {
            "root":     (0, 0, 5.0 * math.cos(ph)),
            "spine_01": (0, 0, 11.0 * flex),
            "spine_02": (0, 0, 13.0 * flex),
            "spine_03": (0, 0, -9.0 * flex),
            "neck":     (0, 0, -10.0 * flex),
            "head":     (0, 0, 8.0 * flex),
            "jaw":      (0, 0, -8.0 - 4.0 * max(0.0, flex)),
            "ear_L":    (0, 0, -14.0 - 6.0 * flex),
            "ear_R":    (0, 0, -14.0 - 6.0 * flex),
            "tail_01":  (0, 6.0 * math.sin(ph), 14.0 * flex + 8.0),
            "tail_02":  (0, 8.0 * math.sin(ph - 0.5), 16.0 * math.sin(ph - 0.5)),
            "tail_03":  (0, 8.0 * math.sin(ph - 1.0), 18.0 * math.sin(ph - 0.9)),
            "front_upper_L": (0, 0, 42.0 * math.sin(fl)),
            "front_lower_L": (0, 0, -44.0 * max(0.0, math.cos(fl))),
            "front_paw_L":   (0, 0, 22.0 * max(0.0, math.cos(fl))),
            "front_upper_R": (0, 0, 42.0 * math.sin(fr)),
            "front_lower_R": (0, 0, -44.0 * max(0.0, math.cos(fr))),
            "front_paw_R":   (0, 0, 22.0 * max(0.0, math.cos(fr))),
            "back_upper_L":  (0, 0, 40.0 * math.sin(bl)),
            "back_lower_L":  (0, 0, 40.0 * max(0.0, math.cos(bl))),
            "back_paw_L":    (0, 0, -22.0 * max(0.0, math.cos(bl))),
            "back_upper_R":  (0, 0, 40.0 * math.sin(br_p)),
            "back_lower_R":  (0, 0, 40.0 * max(0.0, math.cos(br_p))),
            "back_paw_R":    (0, 0, -22.0 * max(0.0, math.cos(br_p))),
        }
    clips.append(("run", 18, True, list(range(0, 19, 2)), eval_run))

    # 4. jump (0.8s = 24f)
    jump_map = {
        0:  ((0.0, 0.0, 0.0), {}),
        5:  ((-0.03 * L_len, -0.14 * H, 0.0), {
            "spine_01": (0,0,-10), "spine_02": (0,0,-8), "neck": (0,0,12), "head": (0,0,-8),
            "front_upper_L": (0,0,-24), "front_lower_L": (0,0,38), "front_paw_L": (0,0,-14),
            "front_upper_R": (0,0,-24), "front_lower_R": (0,0,38), "front_paw_R": (0,0,-14),
            "back_upper_L":  (0,0,26),  "back_lower_L":  (0,0,-44), "back_paw_L": (0,0,18),
            "back_upper_R":  (0,0,26),  "back_lower_R":  (0,0,-44), "back_paw_R": (0,0,18),
            "tail_01": (0,0,15), "tail_02": (0,0,10),
        }),
        9:  ((0.04 * L_len, 0.22 * H, 0.0), {
            "root": (0,0,18), "spine_01": (0,0,12), "spine_02": (0,0,10), "neck": (0,0,10), "head": (0,0,-6),
            "front_upper_L": (0,0,42), "front_lower_L": (0,0,-15), "front_upper_R": (0,0,42), "front_lower_R": (0,0,-15),
            "back_upper_L":  (0,0,-38), "back_lower_L": (0,0,18),  "back_upper_R":  (0,0,-38), "back_lower_R": (0,0,18),
            "tail_01": (0,0,22), "tail_02": (0,0,18),
        }),
        13: ((0.08 * L_len, 0.38 * H, 0.0), {
            "root": (0,0,4), "spine_01": (0,0,14), "spine_02": (0,0,10), "spine_03": (0,0,6),
            "neck": (0,0,-8), "head": (0,0,6), "ear_L": (0,0,-18), "ear_R": (0,0,-18),
            "front_upper_L": (0,0,48), "front_lower_L": (0,0,-8),  "front_upper_R": (0,0,48), "front_lower_R": (0,0,-8),
            "back_upper_L":  (0,0,-44), "back_lower_L": (0,0,10),  "back_upper_R":  (0,0,-44), "back_lower_R": (0,0,10),
            "tail_01": (0,0,20), "tail_02": (0,0,15), "tail_03": (0,0,10),
        }),
        17: ((0.04 * L_len, 0.16 * H, 0.0), {
            "root": (0,0,-14),
            "front_upper_L": (0,0,28), "front_lower_L": (0,0,-10), "front_upper_R": (0,0,28), "front_lower_R": (0,0,-10),
            "back_upper_L":  (0,0,-18), "back_lower_L": (0,0,22),  "back_upper_R":  (0,0,-18), "back_lower_R": (0,0,22),
        }),
        20: ((0.0, -0.10 * H, 0.0), {
            "spine_02": (0,0,-8), "neck": (0,0,-10), "head": (0,0,8),
            "front_upper_L": (0,0,-18), "front_lower_L": (0,0,28), "front_upper_R": (0,0,-18), "front_lower_R": (0,0,28),
            "back_upper_L":  (0,0,18),  "back_lower_L":  (0,0,-28), "back_upper_R": (0,0,18),  "back_lower_R":  (0,0,-28),
        }),
        24: ((0.0, 0.0, 0.0), {}),
    }
    clips.append(("jump", 24, False, sorted(jump_map.keys()), lambda f: jump_map[f]))

    # 5. bite (0.5s = 15f: lunge forward, head and jaw snap, return)
    bite_map = {
        0:  ((0.0, 0.0, 0.0), {}),
        4:  ((-0.05 * L_len, -0.04 * H, 0.0), {
            "spine_02": (0,0,-8), "neck": (0,0,16), "head": (10,0,12), "jaw": (0,0,-34),
            "ear_L": (0,0,-20), "ear_R": (0,0,-20),
            "front_upper_L": (0,0,-16), "front_lower_L": (0,0,22), "front_upper_R": (0,0,-16), "front_lower_R": (0,0,22),
        }),
        7:  ((0.16 * L_len, 0.03 * H, 0.0), {
            "spine_02": (0,0,10), "spine_03": (0,0,8), "neck": (0,0,-14), "head": (-8,0,8), "jaw": (0,0,-38),
            "front_upper_L": (0,0,24), "front_upper_R": (0,0,24), "back_upper_L": (0,0,-22), "back_upper_R": (0,0,-22),
            "tail_01": (0,0,16), "tail_02": (0,0,12),
        }),
        9:  ((0.18 * L_len, 0.01 * H, 0.0), {
            "spine_02": (0,0,6), "neck": (0,0,-18), "head": (6,0,-12), "jaw": (0,0,2),
            "ear_L": (0,0,-24), "ear_R": (0,0,-24),
            "front_upper_L": (0,0,18), "front_upper_R": (0,0,18), "back_upper_L": (0,0,-18), "back_upper_R": (0,0,-18),
        }),
        12: ((0.05 * L_len, -0.02 * H, 0.0), {"neck": (0,0,-6), "jaw": (0,0,0)}),
        15: ((0.0, 0.0, 0.0), {}),
    }
    clips.append(("bite", 15, False, sorted(bite_map.keys()), lambda f: bite_map[f]))

    # 6. hurt (0.4s = 12f: flinch backwards, head recoils)
    hurt_map = {
        0:  ((0.0, 0.0, 0.0), {}),
        3:  ((-0.12 * L_len, -0.06 * H, 0.0), {
            "spine_01": (0,0,-10), "spine_02": (0,0,-14), "spine_03": (0,0,-12),
            "neck": (0,12,26), "head": (-14,18,18), "jaw": (0,0,-18),
            "ear_L": (0,0,-28), "ear_R": (0,0,-28),
            "front_upper_L": (0,0,22), "front_lower_L": (0,0,-18), "front_upper_R": (0,0,22), "front_lower_R": (0,0,-18),
            "back_upper_L":  (0,0,18), "back_lower_L":  (0,0,-24), "back_upper_R":  (0,0,18), "back_lower_R":  (0,0,-24),
            "tail_01": (0,0,28), "tail_02": (0,0,24),
        }),
        7:  ((-0.06 * L_len, -0.03 * H, 0.0), {"spine_02": (0,0,-6), "neck": (0,-6,10), "head": (6,-8,6), "tail_01": (0,0,14)}),
        12: ((0.0, 0.0, 0.0), {}),
    }
    clips.append(("hurt", 12, False, sorted(hurt_map.keys()), lambda f: hurt_map[f]))

    # 7. die (1.2s = 36f: collapse onto side and stay down)
    side_drop = -0.36 * H
    die_map = {
        0:  ((0.0, 0.0, 0.0), {}),
        8:  ((-0.04 * L_len, -0.14 * H, 0.02 * L_len), {
            "root": (18,0,0), "spine_02": (0,0,-14), "neck": (0,10,-18), "head": (0,12,-16), "jaw": (0,0,-14),
            "front_upper_L": (0,0,-22), "front_lower_L": (0,0,42), "front_upper_R": (0,0,-28), "front_lower_R": (0,0,48),
            "back_upper_L":  (0,0,24),  "back_lower_L":  (0,0,-40), "back_upper_R": (0,0,28),  "back_lower_R":  (0,0,-46),
        }),
        18: ((-0.05 * L_len, side_drop, 0.05 * L_len), {
            "root": (86,0,0), "spine_01": (0,6,-6), "spine_02": (0,8,-8), "neck": (0,14,-12), "head": (0,10,-8),
            "jaw": (0,0,-10), "ear_L": (0,0,-16), "ear_R": (0,0,-12),
            "front_upper_L": (0,0,16), "front_lower_L": (0,0,-22), "front_upper_R": (0,0,8),  "front_lower_R": (0,0,-14),
            "back_upper_L":  (0,0,-14), "back_lower_L": (0,0,20),  "back_upper_R":  (0,0,-8), "back_lower_R":  (0,0,14),
            "tail_01": (0,0,18), "tail_02": (0,0,16), "tail_03": (0,0,12),
        }),
        24: ((-0.05 * L_len, side_drop + 0.02 * H, 0.05 * L_len), {
            "root": (90,0,0), "spine_01": (0,4,-4), "spine_02": (0,6,-5), "neck": (0,8,-10), "head": (0,6,-6),
            "jaw": (0,0,-6), "ear_L": (0,0,-20), "ear_R": (0,0,-16),
            "front_upper_L": (0,0,12), "front_lower_L": (0,0,-16), "front_upper_R": (0,0,6),  "front_lower_R": (0,0,-10),
            "back_upper_L":  (0,0,-10), "back_lower_L": (0,0,14),  "back_upper_R":  (0,0,-6), "back_lower_R":  (0,0,10),
            "tail_01": (0,0,22), "tail_02": (0,0,18), "tail_03": (0,0,14),
        }),
        36: ((-0.05 * L_len, side_drop, 0.05 * L_len), {
            "root": (90,0,0), "spine_01": (0,4,-4), "spine_02": (0,6,-5), "neck": (0,8,-10), "head": (0,6,-6),
            "jaw": (0,0,-4), "ear_L": (0,0,-22), "ear_R": (0,0,-18),
            "front_upper_L": (0,0,12), "front_lower_L": (0,0,-16), "front_upper_R": (0,0,6),  "front_lower_R": (0,0,-10),
            "back_upper_L":  (0,0,-10), "back_lower_L": (0,0,14),  "back_upper_R":  (0,0,-6), "back_lower_R":  (0,0,10),
            "tail_01": (0,0,22), "tail_02": (0,0,18), "tail_03": (0,0,14),
        }),
    }
    clips.append(("die", 36, False, sorted(die_map.keys()), lambda f: die_map[f]))

    # 8. battoga (0.9s = 27f: spinning mid-air leaping bite, 360-deg roll around +X body axis, jaws open at peak)
    def eval_battoga(f):
        if f == 0:
            return (0.0, 0.0, 0.0), {}
        if f == 3:
            return (-0.05 * L_len, -0.15 * H, 0.0), {
                "spine_01": (0,0,-12), "spine_02": (0,0,-10), "neck": (0,0,14),
                "front_upper_L": (0,0,-26), "front_lower_L": (0,0,42), "front_upper_R": (0,0,-26), "front_lower_R": (0,0,42),
                "back_upper_L":  (0,0,28),  "back_lower_L":  (0,0,-46), "back_upper_R": (0,0,28),  "back_lower_R":  (0,0,-46),
            }
        if 6 <= f <= 21:
            su = (f - 6) / 15.0
            roll = 360.0 * su
            arc = math.sin(su * math.pi)
            jaw_op = -40.0 * math.sin(min(1.0, su / 0.85) * math.pi) if su < 0.85 else 0.0
            return ((-0.02 + 0.36 * su) * L_len, (0.14 + 0.36 * arc) * H, 0.0), {
                "root": (roll, 0.0, 0.0),
                "spine_01": (0,0,12), "spine_02": (0,0,10), "spine_03": (0,0,8),
                "neck": (0,0,-12), "head": (0,0,8), "jaw": (0,0,jaw_op),
                "ear_L": (0,0,-24), "ear_R": (0,0,-24),
                "front_upper_L": (0,0,56), "front_lower_L": (0,0,-10),
                "front_upper_R": (0,0,56), "front_lower_R": (0,0,-10),
                "back_upper_L":  (0,0,-54), "back_lower_L": (0,0,10),
                "back_upper_R":  (0,0,-54), "back_lower_R": (0,0,10),
                "tail_01": (0,0,22), "tail_02": (0,0,14), "tail_03": (0,0,8),
            }
        if f == 24:
            return (0.12 * L_len, -0.08 * H, 0.0), {
                "root": (360.0, 0.0, 0.0), "spine_02": (0,0,-8), "neck": (0,0,-8),
                "front_upper_L": (0,0,-18), "front_lower_L": (0,0,30), "front_upper_R": (0,0,-18), "front_lower_R": (0,0,30),
                "back_upper_L":  (0,0,18),  "back_lower_L":  (0,0,-30), "back_upper_R": (0,0,18),  "back_lower_R":  (0,0,-30),
            }
        return (0.0, 0.0, 0.0), {"root": (360.0, 0.0, 0.0)}
    clips.append(("battoga", 27, False, list(range(0, 28, 3)), eval_battoga))

    # 9. zetsu_tenrou_battouga (1.0s = 30f: Ginga signature high-RPM 1080-deg 3x corkscrew drill strike!)
    def eval_zetsu_tenrou_battouga(f):
        if f == 0:
            return (0.0, 0.0, 0.0), {}
        if f <= 4:
            cu = f / 4.0
            return (-0.08 * L_len * cu, -0.18 * H * cu, 0.0), {
                "spine_01": (0,0,-14*cu), "spine_02": (0,0,-12*cu), "neck": (0,0,18*cu), "jaw": (0,0,-16*cu),
                "front_upper_L": (0,0,-30*cu), "front_lower_L": (0,0,48*cu),
                "front_upper_R": (0,0,-30*cu), "front_lower_R": (0,0,48*cu),
                "back_upper_L":  (0,0,32*cu),  "back_lower_L":  (0,0,-52*cu),
                "back_upper_R":  (0,0,32*cu),  "back_lower_R":  (0,0,-52*cu),
            }
        if 5 <= f <= 23:
            # 18 frames -> 1080 deg (60 deg/frame -> exact shortest-arc SLERP for 3 full corkscrew spins!)
            su = (f - 5) / 18.0
            roll = 1080.0 * su
            arc = math.sin(su * math.pi)
            jaw_op = -44.0 if su < 0.86 else 0.0
            return ((-0.04 + 0.56 * su) * L_len, (0.18 + 0.44 * arc) * H, 0.0), {
                "root": (roll, 0.0, 0.0),
                "spine_01": (0,0,14), "spine_02": (0,0,12), "spine_03": (0,0,10),
                "neck": (0,0,-14), "head": (0,0,10), "jaw": (0,0,jaw_op),
                "ear_L": (0,0,-28), "ear_R": (0,0,-28),
                "front_upper_L": (0,0,64), "front_lower_L": (0,0,-8),
                "front_upper_R": (0,0,64), "front_lower_R": (0,0,-8),
                "back_upper_L":  (0,0,-62), "back_lower_L": (0,0,8),
                "back_upper_R":  (0,0,-62), "back_lower_R": (0,0,8),
                "tail_01": (0,0,26), "tail_02": (0,0,18), "tail_03": (0,0,10),
            }
        if f <= 27:
            lu = (f - 24) / 3.0
            return ((0.22 * (1.0 - lu)) * L_len, -0.10 * (1.0 - 0.5*lu) * H, 0.0), {
                "root": (1080.0, 0.0, 0.0), "spine_02": (0,0,-10*(1-lu)), "neck": (0,0,-8*(1-lu)),
                "front_upper_L": (0,0,-20*(1-lu)), "front_lower_L": (0,0,32*(1-lu)),
                "front_upper_R": (0,0,-20*(1-lu)), "front_lower_R": (0,0,32*(1-lu)),
                "back_upper_L":  (0,0,20*(1-lu)),  "back_lower_L":  (0,0,-32*(1-lu)),
                "back_upper_R":  (0,0,20*(1-lu)),  "back_lower_R":  (0,0,-32*(1-lu)),
            }
        return (0.0, 0.0, 0.0), {"root": (1080.0, 0.0, 0.0)}
    zetsu_frames = [0, 3, 4] + list(range(5, 24)) + [26, 30]
    clips.append(("zetsu_tenrou_battouga", 30, False, zetsu_frames, eval_zetsu_tenrou_battouga))

    # ---- Stage 6: Update GLB Buffers, Skin, Nodes & Animations In-Place (Keeping Original PBR Textures!) ----
    def pad4():
        while len(bin_data) % 4 != 0:
            bin_data.append(0)

    def append_accessor(arr, comp_type, acc_type, target=None, minmax=False):
        pad4()
        raw = arr.tobytes()
        off = len(bin_data)
        bin_data.extend(raw)
        bv_idx = len(gltf["bufferViews"])
        bv = {"buffer": 0, "byteOffset": off, "byteLength": len(raw)}
        if target is not None:
            bv["target"] = target
        gltf["bufferViews"].append(bv)
        acc = {"bufferView": bv_idx, "byteOffset": 0, "componentType": comp_type, "count": int(len(arr)), "type": acc_type}
        if minmax:
            acc["min"] = np.min(arr, axis=0).astype(float).tolist()
            acc["max"] = np.max(arr, axis=0).astype(float).tolist()
        acc_idx = len(gltf["accessors"])
        gltf["accessors"].append(acc)
        return acc_idx

    # Replace POSITION and NORMAL with oriented coordinates, add JOINTS_0 and WEIGHTS_0
    pos_f32 = pos.astype(np.float32)
    prim["attributes"]["POSITION"] = append_accessor(pos_f32, 5126, "VEC3", target=34962, minmax=True)
    if nrm is not None:
        prim["attributes"]["NORMAL"] = append_accessor(nrm.astype(np.float32), 5126, "VEC3", target=34962)
    prim["attributes"]["JOINTS_0"] = append_accessor(joints_0, 5123, "VEC4", target=34962)
    prim["attributes"]["WEIGHTS_0"] = append_accessor(weights_0, 5126, "VEC4", target=34962)

    # Rebuild clean scene nodes: Node 0 = DogCharacterRoot, Node 1 = SkinnedMesh, Nodes 2..25 = 24 Bones
    new_nodes = [
        {"name": "DogRig", "children": [1, 2]},
        {"name": "DogMesh", "mesh": mnode["mesh"], "skin": 0},
    ]
    joint_node_indices = []
    for b in bones:
        ni = len(new_nodes)
        joint_node_indices.append(ni)
        nd = {"name": b["name"], "translation": b["local_t"].astype(float).tolist()}
        new_nodes.append(nd)
    for b in bones:
        if b["children"]:
            new_nodes[joint_node_indices[b["idx"]]]["children"] = [joint_node_indices[c] for c in b["children"]]

    ibm_cols = np.stack([b["ibm"].T.astype(np.float32) for b in bones], axis=0).reshape(len(bones), 16)
    ibm_acc = append_accessor(ibm_cols, 5126, "MAT4")

    gltf["nodes"] = new_nodes
    gltf["scenes"] = [{"name": "Scene", "nodes": [0]}]
    gltf["scene"] = 0
    gltf["skins"] = [{
        "name": "DogArmature",
        "inverseBindMatrices": ibm_acc,
        "skeleton": joint_node_indices[0],
        "joints": joint_node_indices,
    }]

    # Serialize all 8 animations
    gltf_anims = []
    root_rest_t = bones[0]["local_t"]
    for cname, end_f, is_loop, f_list, fn in clips:
        times = np.array([f / float(FPS) for f in f_list], dtype=np.float32)
        t_acc = append_accessor(times, 5126, "SCALAR", minmax=True)

        # Evaluate frames
        locs = []
        rots_per_bone = {b["name"]: [] for b in bones}
        used_bones = set()
        for f in f_list:
            rloc, bdict = fn(f)
            locs.append(root_rest_t + np.array(rloc, dtype=np.float64))
            for b in bones:
                bn = b["name"]
                if bn in bdict:
                    used_bones.add(bn)
                    q = euler_zyx_quat(*bdict[bn])
                else:
                    q = np.array([0.0, 0.0, 0.0, 1.0], dtype=np.float64)
                # Maintain hemisphere continuity so 360-deg battoga spin SLERPs full circle cleanly!
                prev_list = rots_per_bone[bn]
                if prev_list and np.dot(prev_list[-1], q) < 0.0:
                    q = -q
                prev_list.append(q)

        # For seamless loops with hemisphere flip check, ensure first & last rotation match if no net spin
        samplers = []
        channels = []

        loc_arr = np.array(locs, dtype=np.float32)
        loc_acc = append_accessor(loc_arr, 5126, "VEC3")
        samplers.append({"input": t_acc, "output": loc_acc, "interpolation": "LINEAR"})
        channels.append({"sampler": 0, "target": {"node": joint_node_indices[0], "path": "translation"}})

        for b in bones:
            bn = b["name"]
            if bn not in used_bones:
                continue
            q_arr = np.array(rots_per_bone[bn], dtype=np.float32)
            q_acc = append_accessor(q_arr, 5126, "VEC4")
            s_idx = len(samplers)
            samplers.append({"input": t_acc, "output": q_acc, "interpolation": "LINEAR"})
            channels.append({"sampler": s_idx, "target": {"node": joint_node_indices[b["idx"]], "path": "rotation"}})

        gltf_anims.append({"name": cname, "samplers": samplers, "channels": channels})

    gltf["animations"] = gltf_anims

    pad4()
    gltf["buffers"] = [{"byteLength": len(bin_data)}]
    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    while len(json_bytes) % 4 != 0:
        json_bytes += b" "

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    with open(out_path, "wb") as f:
        f.write(struct.pack("<4sII", b"glTF", 2, total_len))
        f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack("<II", len(bin_data), 0x004E4942))
        f.write(bin_data)

    print("=" * 64)
    print("  STANDALONE DOG AUTO-RIG & GLB EXPORT REPORT")
    print("=" * 64)
    print(f"  Output GLB     : {out_path} ({total_len / (1024*1024):.2f} MB)")
    print(f"  Triangle Count : {len(tris):,}")
    print(f"  Bone Count     : {len(bones)} (< 30 limit)")
    print(f"  Oriented BBox  : X=[{bbox['min_x']:.3f}..{bbox['max_x']:.3f}] (+X fwd), Y=[{bbox['min_y']:.3f}..{bbox['max_y']:.3f}] (+Y up)")
    for cname, end_f, is_loop, f_list, _ in clips:
        print(f"    - {cname:<10s} : frames 0..{end_f:2d} ({end_f/FPS:.2f}s, {'loop' if is_loop else 'one-shot'}, {len(f_list)} keys)")
    print("=" * 64)


if __name__ == "__main__":
    import sys
    in_p = sys.argv[1] if len(sys.argv) > 1 else INPUT_GLB
    out_p = sys.argv[2] if len(sys.argv) > 2 else OUTPUT_GLB
    ov_deg = float(sys.argv[3]) if len(sys.argv) > 3 else ORIENTATION_OVERRIDE
    build_rigged_glb(in_p, out_p, ov_deg)
