#!/usr/bin/env python3
"""
export_model.py - the bridge from a trained PyTorch char-LM to a live browser demo.

It writes a model artifact folder that <ModelDemo> can serve with no code changes:

    public/models/<name>/
      ├── meta.json      # vocab, block_size, arch, hyperparams, sampling defaults
      ├── weights.json   # (js backend) every parameter as { shape, data(flat) }
      └── model.onnx      # (onnx backend) optional, for bigger models

Two export paths, pick per model size:

  --format json   Tiny models (a few thousand params). The forward pass runs in
                  hand-written TypeScript (src/lib/inference/js-backend.ts). This
                  script's `MLP` must match that forward pass exactly:
                      C  : [vocab, embedding_dim]
                      W1 : [block_size * embedding_dim, hidden]   b1 : [hidden]
                      W2 : [hidden, vocab]                        b2 : [vocab]
                  (Bengio-style MLP == Karpathy makemore part 2. A 'bigram'
                   artifact is produced by scripts/make_placeholder.mjs instead.)

  --format onnx   Bigger models (small GPT, etc.). Exports an ONNX graph that
                  takes int64 input [1, block_size] named "input" and returns
                  float logits [1, vocab] named "logits". onnxruntime-web runs it.

Usage
-----
    # From a trained checkpoint (state_dict) + a newline-separated vocab file:
    python scripts/export_model.py \
        --name turkish-makemore --arch mlp \
        --checkpoint runs/mlp.pt --vocab runs/vocab.txt \
        --block-size 3 --embedding-dim 10 --hidden 200 \
        --format json

    # Smoke test with a randomly-initialised model (no checkpoint needed):
    python scripts/export_model.py --name demo --arch mlp --format json --demo

Requires: torch (+ its onnx exporter for --format onnx). numpy for json export.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "public" / "models"


def load_vocab(path: str | None, demo: bool) -> list[str]:
    """vocab[0] MUST be the '.' start/end boundary token (matches js-backend)."""
    if path:
        toks = [line.rstrip("\n") for line in Path(path).read_text(encoding="utf-8").splitlines()]
        toks = [t for t in toks if t != ""]
        if toks and toks[0] != ".":
            toks = ["."] + [t for t in toks if t != "."]
        return toks
    if demo:
        return ["."] + list("abcdefghijklmnopqrstuvwxyz")
    raise SystemExit("Provide --vocab <file> (or --demo for a throwaway vocab).")


def build_mlp(vocab_size, block_size, embedding_dim, hidden):
    import torch
    import torch.nn as nn

    class MLP(nn.Module):
        # Parameter names/shapes here are the contract with js-backend.ts.
        def __init__(self):
            super().__init__()
            self.C = nn.Parameter(torch.randn(vocab_size, embedding_dim) * 0.1)
            self.W1 = nn.Parameter(torch.randn(block_size * embedding_dim, hidden) * 0.1)
            self.b1 = nn.Parameter(torch.zeros(hidden))
            self.W2 = nn.Parameter(torch.randn(hidden, vocab_size) * 0.1)
            self.b2 = nn.Parameter(torch.zeros(vocab_size))

        def forward(self, idx):  # idx: int64 [batch, block_size]
            emb = self.C[idx]                       # [batch, block_size, emb]
            x = emb.view(emb.shape[0], -1)          # concat -> [batch, block*emb]
            h = torch.tanh(x @ self.W1 + self.b1)   # hidden
            return h @ self.W2 + self.b2            # logits [batch, vocab]

    return MLP()


def export_json(model, meta: dict, out: Path) -> None:
    """Dump every parameter as { shape, data } with a flat, row-major data array."""
    import numpy as np

    params = {}
    for pname, tensor in model.state_dict().items():
        arr = tensor.detach().cpu().numpy().astype(np.float32)
        params[pname] = {"shape": list(arr.shape), "data": arr.reshape(-1).tolist()}
    (out / "weights.json").write_text(json.dumps({"format": "flat", "params": params}))
    (out / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False))
    n = sum(len(p["data"]) for p in params.values())
    print(f"  wrote weights.json ({n} params) + meta.json")


def export_onnx(model, meta: dict, out: Path, block_size: int) -> None:
    import torch

    model.eval()
    dummy = torch.zeros(1, block_size, dtype=torch.long)  # int64 [1, block_size]
    torch.onnx.export(
        model, dummy, str(out / "model.onnx"),
        input_names=["input"], output_names=["logits"],
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
    )
    meta = {**meta, "backend": "onnx"}
    (out / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False))
    print("  wrote model.onnx + meta.json")


def main() -> None:
    ap = argparse.ArgumentParser(description="Export a trained char-LM to a browser demo artifact.")
    ap.add_argument("--name", required=True, help="folder under public/models/<name>/")
    ap.add_argument("--arch", default="mlp", choices=["mlp"], help="js forward-pass type")
    ap.add_argument("--format", default="json", choices=["json", "onnx"])
    ap.add_argument("--checkpoint", help="path to a torch state_dict (.pt)")
    ap.add_argument("--vocab", help="newline-separated vocab file (index order)")
    ap.add_argument("--block-size", type=int, default=3)
    ap.add_argument("--embedding-dim", type=int, default=10)
    ap.add_argument("--hidden", type=int, default=200)
    ap.add_argument("--temperature", type=float, default=1.0)
    ap.add_argument("--max-new-tokens", type=int, default=20)
    ap.add_argument("--top-k", type=int, default=0, help="0 = disabled")
    ap.add_argument("--demo", action="store_true", help="random weights + toy vocab (smoke test)")
    args = ap.parse_args()

    import torch

    vocab = load_vocab(args.vocab, args.demo)
    model = build_mlp(len(vocab), args.block_size, args.embedding_dim, args.hidden)
    if args.checkpoint:
        state = torch.load(args.checkpoint, map_location="cpu")
        model.load_state_dict(state.get("model", state))
        print(f"  loaded checkpoint {args.checkpoint}")
    elif not args.demo:
        raise SystemExit("No --checkpoint given. Use --demo to export random weights.")

    meta = {
        "name": args.name,
        "title": args.name,
        "backend": "js",
        "arch": args.arch,
        "vocab": vocab,
        "block_size": args.block_size,
        "embedding_dim": args.embedding_dim,
        "hidden_size": args.hidden,
        "sampling": {
            "temperature": args.temperature,
            "max_new_tokens": args.max_new_tokens,
            "top_k": args.top_k or None,
        },
    }

    out = MODELS_DIR / args.name
    out.mkdir(parents=True, exist_ok=True)
    print(f"exporting '{args.name}' -> {out}")
    if args.format == "onnx":
        export_onnx(model, meta, out, args.block_size)
    else:
        export_json(model, meta, out)
    print("done. reload the site; the demo picks it up automatically.")


if __name__ == "__main__":
    main()
