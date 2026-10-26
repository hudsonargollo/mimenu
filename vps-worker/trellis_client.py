#!/usr/bin/env python3
"""
TRELLIS.2 backend helper for the mimenu VPS AR worker.
------------------------------------------------------
Single-session Gradio API client for the microsoft/TRELLIS.2 Space (or any
compatible deployment of the same app.py). Runs:

  1. /preprocess_image  (alpha-mask / crop; mirrors the Space's UI flow)
  2. /image_to_3d       (seed/resolution/sampler params for a food-product asset)
  3. /extract_glb       (same session; latent state is server-side bound)

Writes the resulting GLB to <outdir>/model.glb and exits 0. On failure prints
"ERROR: <message>" on stdout and exits 1. The VPS worker (index.js) calls this
file for every task with provider=trellis2.

Requires: pip install gradio_client numpy  (single env: see --python in vps-worker.env)
Auth:     HF_TOKEN environment variable (ZeroGPU quota; anonymous is heavily limited)

ZeroGPU notes:
  - Each Client() instance is one session with its own GPU allocation.
  - The latent gr.State is NOT returned to API clients; /extract_glb must be
    called on the SAME session, which is why both calls share `client` here.

Usage:
  python3 trellis_client.py --image <path.png> --out <dir> [--resolution 512|1024|1536] \
      [--decimation 300000] [--texture-size 1024]
"""

import argparse
import os
import shutil
import sys
import time
import traceback

from gradio_client import Client, handle_file  # type: ignore


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def fail(msg, debug_path=None):
    log(msg)
    if debug_path:
        try:
            with open(debug_path, "a") as fb:
                fb.write(f"[{time.strftime('%H:%M:%S')}] {msg}\n\n{traceback.format_exc()}\n\n")
        except Exception:
            pass
    print(f"ERROR: {msg}", flush=True)
    sys.exit(1)


def image_is_alpha_masked(path):
    """True when the image already has real transparency (Space-preprocessed look).
    In that case the Space's own preprocess step is unnecessary — and the proven
    working path (raw alpha-masked upload) is used instead."""
    try:
        from PIL import Image  # type: ignore
    except Exception:
        return False
    try:
        with Image.open(path) as im:
            if im.mode == "RGBA":
                alpha = im.getchannel("A")
                lo, _hi = alpha.getextrema()
                return lo < 128
        return False
    except Exception:
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", required=True, help="input image path (jpg/png/webp)")
    ap.add_argument("--out", required=True, help="output directory")
    ap.add_argument("--space", default="microsoft/TRELLIS.2", help="Gradio Space or URL")
    ap.add_argument("--resolution", default="512", choices=["512", "1024", "1536"])
    ap.add_argument("--decimation", type=float, default=500000.0)
    ap.add_argument("--texture-size", type=float, default=2048.0)
    ap.add_argument("--seed", type=float, default=None, help="fixed seed; random when omitted")
    ap.add_argument("--timeout", type=float, default=600.0, help="overall soft deadline in seconds")
    ap.add_argument("--no-preprocess", action="store_true", help="never call the Space preprocess step")
    args = ap.parse_args()

    token = os.environ.get("HF_TOKEN") or None
    os.makedirs(args.out, exist_ok=True)
    out_glb = os.path.join(args.out, "model.glb")
    debug_path = os.path.join(args.out, "trellis_debug.log")

    params = dict(
        seed=(float(args.seed) if args.seed is not None else 0.0),
        resolution=args.resolution,
        # Defaults matching the Space UI tuning shown in app.py
        ss_guidance_strength=7.5,
        ss_guidance_rescale=0.7,
        ss_sampling_steps=12,
        ss_rescale_t=5.0,
        shape_slat_guidance_strength=7.5,
        shape_slat_guidance_rescale=0.5,
        shape_slat_sampling_steps=12,
        shape_slat_rescale_t=3.0,
        tex_slat_guidance_strength=1.0,
        tex_slat_guidance_rescale=0.0,
        tex_slat_sampling_steps=12,
        tex_slat_rescale_t=3.0,
    )
    # App's generate button randomizes the seed; replicate that when --seed is absent
    if args.seed is None:
        import random

        params["seed"] = float(random.randint(0, 2147483647))

    deadline = time.time() + args.timeout

    try:
        client = Client(args.space, token=token)
        log("connected")

        # 1) Preprocess only when needed: alpha-masked inputs already look
        #    post-preprocess, and the raw upload path is the one verified
        #    end-to-end (proof run 2026-10-26 14:57). Unmasked food photos go
        #    through the Space's own preprocess (mirrors the UI upload flow).
        if args.no_preprocess or image_is_alpha_masked(args.image):
            image_arg = handle_file(args.image)
            log("using original image as-is (already alpha-masked or --no-preprocess)")
        else:
            try:
                pre = client.predict(input=handle_file(args.image), api_name="/preprocess_image")
                pre_path = pre["path"] if isinstance(pre, dict) else pre
                if isinstance(pre_path, str) and os.path.exists(pre_path):
                    image_arg = handle_file(pre_path)
                    log("preprocess_image done")
                else:
                    image_arg = handle_file(args.image)
                    log("preprocess output not file-backed; using original image")
            except Exception as err:
                fail(f"preprocess failed: {err}", debug_path)

        # 2) Generate (returns (state, html); state is session-bound, ignore it)
        t0 = time.time()
        try:
            client.predict(image=image_arg, **params, api_name="/image_to_3d")
        except Exception as err:
            fail(f"image_to_3d failed after {time.time() - t0:.1f}s: {err}", debug_path)
        log(f"image_to_3d done in {time.time() - t0:.1f}s")

        # 3) Extract GLB in the SAME session (state lives server-side)
        t0 = time.time()
        try:
            res = client.predict(
                decimation_target=args.decimation,
                texture_size=args.texture_size,
                api_name="/extract_glb",
            )
        except Exception as err:
            fail(f"extract_glb failed after {time.time() - t0:.1f}s: {err}", debug_path)
        log(f"extract_glb done in {time.time() - t0:.1f}s")

        files = []
        if isinstance(res, (list, tuple)):
            for item in res:
                p = item.get("path") if isinstance(item, dict) else item
                if isinstance(p, str) and p.lower().endswith(".glb") and os.path.exists(p):
                    files.append(p)
        elif isinstance(res, dict):
            p = res.get("path")
            if isinstance(p, str) and os.path.exists(p):
                files.append(p)

        if not files:
            fail("extract_glb returned no downloadable .glb file", debug_path)

        shutil.copy(files[0], out_glb)
        log(f"saved {out_glb} ({os.path.getsize(out_glb) / 1e6:.1f} MB)")
        print(f"OK: {out_glb}", flush=True)
        sys.exit(0)
    except SystemExit:
        raise
    except Exception as err:
        debug_path = os.path.join(args.out, "trellis_debug.log")
        with open(debug_path, "a") as fb:
            fb.write(f"[{time.strftime('%H:%M:%S')}] unexpected failure: {err}\n\n{traceback.format_exc()}\n\n")
        print(f"ERROR: {err}", flush=True)
        sys.exit(1)
    finally:
        # Soft deadline guard for hung queue jobs is left to the Node worker's
        # execFile timeout; nothing to clean here.
        _ = deadline


if __name__ == "__main__":
    main()
