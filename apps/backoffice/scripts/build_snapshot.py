#!/usr/bin/env python3
"""
Genera el snapshot JSON del Benford Vault para el Clo Backoffice.

Configuración del path al vault (en orden de prioridad):
  1) --vault-root <path>           (CLI flag)
  2) BENFORD_VAULT_ROOT             (env var)
  3) .benford-router.json           (config en raíz del repo)

Output:
  apps/backoffice/.data/vault_snapshot.json   (gitignored, leído por el server)

Uso:
  python3 apps/backoffice/scripts/build_snapshot.py
  python3 apps/backoffice/scripts/build_snapshot.py --vault-root "/path/to/Benford Vault V3"
  BENFORD_VAULT_ROOT="..." python3 apps/backoffice/scripts/build_snapshot.py
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
BACKOFFICE_ROOT = SCRIPT_DIR.parent              # apps/backoffice/
REPO_ROOT = BACKOFFICE_ROOT.parent.parent        # repo root (benford-skills/)
SNAPSHOT_OUT_DEFAULT = BACKOFFICE_ROOT / ".data" / "vault_snapshot.json"


# ---------------- Path resolution ----------------
def resolve_vault_root(cli_arg: str | None) -> Path:
    if cli_arg:
        return Path(cli_arg).expanduser().resolve()
    env = os.environ.get("BENFORD_VAULT_ROOT")
    if env:
        return Path(env).expanduser().resolve()
    cfg = REPO_ROOT / ".benford-router.json"
    if cfg.exists():
        try:
            data = json.loads(cfg.read_text())
            if data.get("vaultRoot"):
                return Path(data["vaultRoot"]).expanduser().resolve()
        except Exception:
            pass
    sys.exit(
        "ERROR: no encontré el path al vault.\n"
        "  Opciones:\n"
        "    --vault-root '/path/to/Benford Vault V3'\n"
        "    BENFORD_VAULT_ROOT='/path/to/Benford Vault V3' (env)\n"
        "    bun run router -- init --vault-root '/path/to/Benford Vault V3'\n"
    )


# ---------------- Reglas DVC / DOC / DOL ----------------
REQUIRED = {
    "DOC": ["spec.md", "schema.md", "parser_config.md", "changelog.md"],
    # DVC: el canónico solo es contenedor de variantes. No requiere archivos
    # propios. El status verde se determina por tener ≥1 variante completa
    # (ver parse_canonical → examples_ok = has_complete_variant).
    "DVC": [],
    "DOL": ["spec.md", "changelog.md", "document_transcript.md"],
}
DVC_VARIANT_REQUIRED_NEW = ["spec.md", "changelog.md", "parser_config.md", "raw_schema.md"]
DVC_VARIANT_REQUIRED_OLD = ["parser_config.md", "raw_schema.md", "mapping.md"]
DVC_VARIANT_REQUIRED_UNION = sorted(set(DVC_VARIANT_REQUIRED_NEW) | set(DVC_VARIANT_REQUIRED_OLD))

EK_DIRS = {
    "DOC": "DOC Documentos y Ejemplos",
    "DVC": "DVC Documentos Variables Cliente",
    "DOL": "DOL Documentos de Leyes",
}
EXAMPLES_FOLDER_NAMES = ("Ejemplos", "Examples")


# ---------------- Helpers de filesystem ----------------
def file_info(path: Path) -> dict:
    if path.exists() and path.is_file():
        return {"exists": True, "size": path.stat().st_size, "ok": True}
    return {"exists": False, "size": 0, "ok": False}


def folder_files(folder: Path, required: list) -> dict:
    return {f: file_info(folder / f) for f in required}


def find_examples_dir(parent: Path) -> Path | None:
    sd_ex = parent / "source_documents" / "examples"
    if sd_ex.exists() and sd_ex.is_dir():
        return sd_ex
    for name in EXAMPLES_FOLDER_NAMES:
        cand = parent / name
        if cand.exists() and cand.is_dir():
            return cand
    return None


def count_examples(folder: Path | None) -> int:
    if folder is None or not folder.exists() or not folder.is_dir():
        return 0
    n = 0
    for root, _dirs, files in os.walk(folder):
        for f in files:
            if f.startswith("."):
                continue
            if f.lower() == "readme.md":
                continue
            n += 1
    return n


def is_variant_dir(d: Path) -> bool:
    if not d.is_dir():
        return False
    for fname in DVC_VARIANT_REQUIRED_UNION:
        if (d / fname).exists():
            return True
    return False


# ---------------- PROPs ----------------
def parse_prop(folder: Path, state_dir_name: str, vault_root: Path) -> dict:
    pid = folder.name
    proposal_md = folder / "proposal.md"
    target = ""
    ctype = ""
    title = pid
    contribution_origin = ""
    if proposal_md.exists():
        try:
            text = proposal_md.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            text = ""
        if text:
            first_line = text.splitlines()[0].lstrip("#").strip()
            title = first_line or pid
            for line in text.splitlines():
                if not target:
                    m = re.match(r"\|\s*Target canonico ID\s*\|\s*([^|]+)\s*\|\s*$", line)
                    if m:
                        target = m.group(1).strip().strip("`")
                if not ctype:
                    m = re.match(r"\|\s*Canonical type\s*\|\s*([^|]+)\s*\|\s*$", line)
                    if m:
                        ctype = m.group(1).strip().strip("`")
                if not contribution_origin:
                    m = re.match(r"\|\s*Contribution origen\s*\|\s*([^|]+)\s*\|\s*$", line)
                    if m:
                        contribution_origin = m.group(1).strip().strip("`")
    state_short = re.sub(r"^\d+\s+", "", state_dir_name).replace(" ", "")
    return {
        "id": pid,
        "state": state_dir_name,
        "state_short": state_short,
        "target": target,
        "type": ctype,
        "title": title,
        "applied": state_dir_name == "04 Applied",
        "contribution_origin": contribution_origin,
        "folder_rel": str(folder.relative_to(vault_root.parent).as_posix()),
        "folder_mac": str(folder),
    }


def collect_props(vault_root: Path) -> list:
    base = vault_root / "02 Proposals"
    if not base.exists():
        return []
    out = []
    for state_dir in sorted(base.iterdir()):
        if not state_dir.is_dir() or not re.match(r"^\d+\s", state_dir.name):
            continue
        for prop_dir in sorted(state_dir.iterdir()):
            if prop_dir.is_dir() and prop_dir.name.startswith("PROP-"):
                out.append(parse_prop(prop_dir, state_dir.name, vault_root))
    return out


# ---------------- Contributions ----------------
CANON_ID_RE = re.compile(r"\b((?:DOC|DVC|DOL|METH|TEST)-[a-z0-9][a-z0-9\-]+)", re.IGNORECASE)


def collect_contributions(vault_root: Path) -> list:
    base = vault_root / "01 Contribuciones"
    if not base.exists():
        return []
    out = []
    for team_dir in sorted(base.iterdir()):
        if not team_dir.is_dir() or team_dir.name == "00 Templates":
            continue
        for c_dir in sorted(team_dir.iterdir()):
            if not c_dir.is_dir() or not c_dir.name.startswith("CONTRIBUTION-"):
                continue
            cmap = c_dir / "contribution_map.md"
            mentioned: set[str] = set()
            if cmap.exists():
                try:
                    text = cmap.read_text(encoding="utf-8", errors="ignore")
                    for m in CANON_ID_RE.findall(text):
                        mentioned.add(m)
                except OSError:
                    pass
            out.append({
                "id": c_dir.name,
                "team": team_dir.name,
                "folder_rel": str(c_dir.relative_to(vault_root.parent).as_posix()),
                "folder_mac": str(c_dir),
                "_mentioned": sorted(mentioned),
            })
    return out


# ---------------- Variantes DVC ----------------
def parse_dvc_variant(variant_dir: Path, is_template_canonical: bool, vault_root: Path) -> dict:
    files_new = folder_files(variant_dir, DVC_VARIANT_REQUIRED_NEW)
    new_ok = all(v["ok"] for v in files_new.values())
    if new_ok:
        files = files_new
        style = "new"
        files_ok = True
    else:
        files_old = folder_files(variant_dir, DVC_VARIANT_REQUIRED_OLD)
        old_ok = all(v["ok"] for v in files_old.values())
        if old_ok:
            files = files_old
            style = "legacy"
            files_ok = True
        else:
            files = files_new
            style = "incomplete"
            files_ok = False
    examples_dir = find_examples_dir(variant_dir)
    examples_count = count_examples(examples_dir)
    examples_ok = examples_count > 0
    return {
        "name": variant_dir.name,
        "style": style,
        "files": files,
        "files_ok": files_ok,
        "examples_count": examples_count,
        "examples_ok": examples_ok,
        "examples_dir_rel": (examples_dir.relative_to(variant_dir).as_posix() if examples_dir else None),
        "is_skeleton": is_template_canonical,
        "folder_rel": str(variant_dir.relative_to(vault_root.parent).as_posix()),
        "folder_mac": str(variant_dir),
    }


# ---------------- Canonicals ----------------
def parse_canonical(folder: Path, ctype: str, props_all: list, contribs_all: list, vault_root: Path) -> dict:
    cid = folder.name
    is_template = "_template" in cid
    files = folder_files(folder, REQUIRED[ctype])
    files_ok = all(v["ok"] for v in files.values())

    variants: list = []
    examples_count = 0
    examples_dir_name: str | None = None
    has_complete_variant = False

    if ctype == "DVC":
        for sub in sorted(folder.iterdir()):
            if is_variant_dir(sub):
                v = parse_dvc_variant(sub, is_template, vault_root)
                variants.append(v)
                if v["files_ok"] and v["examples_ok"] and not v["is_skeleton"]:
                    has_complete_variant = True
        examples_ok = has_complete_variant
    elif ctype == "DOC":
        ej = find_examples_dir(folder)
        examples_dir_name = ej.name if ej else None
        examples_count = count_examples(ej)
        examples_ok = examples_count > 0
    else:  # DOL
        pdfs = []
        for root, _dirs, files_ in os.walk(folder):
            for f in files_:
                if f.lower().endswith(".pdf"):
                    pdfs.append(Path(root) / f)
        examples_count = len(pdfs)
        examples_ok = examples_count > 0

    linked_props = []
    for p in props_all:
        if p["target"] == cid:
            linked_props.append({k: v for k, v in p.items() if k != "contribution_origin"})
    prop_applied = any(p["applied"] for p in linked_props)

    seen = set()
    for p in props_all:
        if p["target"] == cid and p["contribution_origin"]:
            seen.add(p["contribution_origin"])
    for c in contribs_all:
        if cid in c.get("_mentioned", []):
            seen.add(c["id"])
    linked_contribs = [c["id"] for c in contribs_all if c["id"] in seen]

    criteria = {
        "files_ok": files_ok,
        "examples_ok": examples_ok,
        "prop_applied": prop_applied,
    }
    status = "green" if all(criteria.values()) else "red"

    out = {
        "id": cid,
        "type": ctype,
        "folder_rel": str(folder.relative_to(vault_root.parent).as_posix()),
        "folder_mac": str(folder),
        "is_template": is_template,
        "criteria": criteria,
        "files": files,
        "variants": variants,
        "props": linked_props,
        "contributions": linked_contribs,
        "status": status,
    }
    if ctype == "DOC":
        out["examples_dir"] = examples_dir_name
        out["examples_count"] = examples_count
    elif ctype == "DVC":
        out["has_real_variant"] = any(not v["is_skeleton"] for v in variants)
        out["has_complete_variant"] = has_complete_variant
    elif ctype == "DOL":
        out["pdf_count"] = examples_count
    return out


def collect_explicit(vault_root: Path, props_all: list, contribs_all: list) -> dict:
    ek_base = vault_root / "05 Benford Brain IMSS Mexico" / "01 Explicit Knowledge"
    out: dict = {"DOC": [], "DVC": [], "DOL": []}
    for ctype, dirname in EK_DIRS.items():
        base = ek_base / dirname
        if not base.exists():
            continue
        for sub in sorted(base.iterdir()):
            if sub.is_dir() and sub.name.startswith(f"{ctype}-"):
                out[ctype].append(parse_canonical(sub, ctype, props_all, contribs_all, vault_root))
    return out


# ---------------- Task Specific ----------------
def collect_task_specific(vault_root: Path) -> list:
    ts_base = vault_root / "05 Benford Brain IMSS Mexico" / "02 Task Specific"
    if not ts_base.exists():
        return []
    out = []
    tpl_dir = ts_base / "Templates METH y TEST"
    if tpl_dir.exists():
        for sub in sorted(tpl_dir.iterdir()):
            if sub.is_dir() and (sub.name.startswith("METH-") or sub.name.startswith("TEST-")):
                ctype = "METH" if sub.name.startswith("METH-") else "TEST"
                files = [f.name for f in sub.iterdir() if f.is_file() and not f.name.startswith(".")]
                out.append({
                    "id": sub.name,
                    "type": ctype,
                    "is_template": True,
                    "n_files": len(files),
                    "files_list": sorted(files),
                    "folder_rel": str(sub.relative_to(vault_root.parent).as_posix()),
                    "folder_mac": str(sub),
                    "props": [],
                    "props_applied": [],
                    "contributions": [],
                })
    for root, dirs, _files in os.walk(ts_base):
        for d in dirs:
            if d.startswith(("METH-", "TEST-")) and "_template" not in d:
                full = Path(root) / d
                ctype = "METH" if d.startswith("METH-") else "TEST"
                fls = [f.name for f in full.iterdir() if f.is_file() and not f.name.startswith(".")]
                out.append({
                    "id": d,
                    "type": ctype,
                    "is_template": False,
                    "n_files": len(fls),
                    "files_list": sorted(fls),
                    "folder_rel": str(full.relative_to(vault_root.parent).as_posix()),
                    "folder_mac": str(full),
                    "props": [],
                    "props_applied": [],
                    "contributions": [],
                })
    return out


# ---------------- Build + inject ----------------
def build_snapshot(vault_root: Path) -> dict:
    props = collect_props(vault_root)
    contribs = collect_contributions(vault_root)
    explicit = collect_explicit(vault_root, props, contribs)
    task_specific = collect_task_specific(vault_root)

    contribs_clean = [{k: v for k, v in c.items() if not k.startswith("_")} for c in contribs]

    by_type = {}
    green = red = 0
    for ctype in ("DOC", "DVC", "DOL"):
        items = [c for c in explicit[ctype] if not c["is_template"]]
        g = sum(1 for c in items if c["status"] == "green")
        r = sum(1 for c in items if c["status"] == "red")
        by_type[ctype] = {"total": len(items), "green": g, "red": r}
        green += g
        red += r

    return {
        "generated_at": datetime.date.today().isoformat(),
        "vault_mac": str(vault_root.parent),
        "summary": {"green": green, "red": red, "by_type": by_type},
        "explicit": explicit,
        "task_specific": task_specific,
        "props": [{k: v for k, v in p.items() if k != "contribution_origin"} for p in props],
        "contributions": contribs_clean,
    }


def inject_into_html(snapshot: dict) -> None:
    if not ARTIFACT_HTML.exists():
        print(f"WARN: no encontré {ARTIFACT_HTML}; solo escribí el JSON.")
        return
    html = ARTIFACT_HTML.read_text(encoding="utf-8")
    snap_str = json.dumps(snapshot, ensure_ascii=False)
    new_html, n = re.subn(
        r'(<script[^>]*id="vaultData"[^>]*>)([\s\S]*?)(</script>)',
        lambda m: m.group(1) + snap_str + m.group(3),
        html,
        count=1,
    )
    if n != 1:
        sys.exit('ERROR: no encontré <script id="vaultData"> en index.html')
    ARTIFACT_HTML.write_text(new_html, encoding="utf-8")
    print(f"injected → {ARTIFACT_HTML.name} ({len(new_html)} bytes)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Benford Vault snapshot")
    parser.add_argument("--vault-root", help="Path al Benford Vault V3", default=None)
    parser.add_argument("--no-inject", action="store_true", help="Solo escribe el JSON, no inyecta en index.html")
    args = parser.parse_args()

    vault_root = resolve_vault_root(args.vault_root)
    if not vault_root.exists():
        sys.exit(f"ERROR: vault no existe: {vault_root}")

    print(f"vault: {vault_root}")
    snapshot = build_snapshot(vault_root)
    s = snapshot["summary"]
    print(f"summary: green={s['green']} red={s['red']}  DOC={s['by_type']['DOC']} DVC={s['by_type']['DVC']} DOL={s['by_type']['DOL']}")
    print(f"props={len(snapshot['props'])} contribs={len(snapshot['contributions'])} task_specific={len(snapshot['task_specific'])}")

    SNAPSHOT_OUT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2))
    print(f"snapshot → {SNAPSHOT_OUT.name} ({SNAPSHOT_OUT.stat().st_size} bytes)")

    if not args.no_inject:
        inject_into_html(snapshot)


if __name__ == "__main__":
    main()
