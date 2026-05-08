#!/usr/bin/env python3
"""
Benford Vault Tracker — escanea el vault y genera HTML del dashboard.

Uso:
    python build_tracker.py <vault_scan_path> [--mac-path <vault_mac_path>] [--out <output_html>]

- vault_scan_path: ruta donde el script leera el vault (puede ser la ruta de bash mount
  o la ruta real de macOS si se corre directo).
- --mac-path: ruta real macOS del vault, usada para construir links file:// dentro del HTML.
  Si se omite, usa vault_scan_path.
- --out: ruta de salida del HTML. Default: ./benford_tracker.html

El script genera un HTML self-contained con tabla de canonicos DOC/DVC/DOL,
status verde/rojo segun 4 archivos requeridos + >=1 PROP aplicada + Examples poblados,
PROPs aplicadas y contributions vinculadas, todo expandible.
"""
import os, sys, json, re, argparse, html

V3 = "Benford Vault V3"
EK_REL = f"{V3}/05 Benford Brain IMSS Mexico/01 Explicit Knowledge"
TS_REL = f"{V3}/05 Benford Brain IMSS Mexico/02 Task Specific"
PROPS_REL = f"{V3}/02 Proposals"
CONTRIB_REL = f"{V3}/01 Contribuciones"


def file_info(path):
    if not os.path.isfile(path):
        return {"exists": False, "size": 0, "ok": False}
    s = os.path.getsize(path)
    return {"exists": True, "size": s, "ok": s > 50}


def folder_file_count(path):
    if not os.path.isdir(path):
        return 0
    n = 0
    for root, dirs, files in os.walk(path):
        for f in files:
            if not f.startswith('.'):
                n += 1
    return n


def scan_doc(folder, name, scan_root, mac_root):
    rel = os.path.relpath(folder, scan_root)
    files = {
        "spec.md": file_info(os.path.join(folder, "spec.md")),
        "schema.md": file_info(os.path.join(folder, "schema.md")),
        "parser_config.md": file_info(os.path.join(folder, "parser_config.md")),
        "changelog.md": file_info(os.path.join(folder, "changelog.md")),
    }
    files_ok = all(f["ok"] for f in files.values())
    examples_dir = None
    for cand in ["Examples", "Ejemplos"]:
        if os.path.isdir(os.path.join(folder, cand)):
            examples_dir = cand
            break
    examples_count = folder_file_count(os.path.join(folder, examples_dir)) if examples_dir else 0
    return {
        "id": name, "type": "DOC",
        "folder_rel": rel,
        "folder_mac": os.path.join(mac_root, rel),
        "is_template": "0000_template" in name,
        "criteria": {"files_ok": files_ok, "examples_ok": examples_count > 0},
        "files": files, "examples_dir": examples_dir, "examples_count": examples_count,
        "variants": [],
    }


def scan_dvc(folder, name, scan_root, mac_root):
    rel = os.path.relpath(folder, scan_root)
    files = {
        "spec.md": file_info(os.path.join(folder, "spec.md")),
        "changelog.md": file_info(os.path.join(folder, "changelog.md")),
    }
    files_ok = all(f["ok"] for f in files.values())
    variants = []
    for entry in sorted(os.listdir(folder)):
        full = os.path.join(folder, entry)
        if entry.startswith('.') or not os.path.isdir(full) or entry in ["Examples", "Ejemplos"]:
            continue
        vfiles = {
            "parser_config.md": file_info(os.path.join(full, "parser_config.md")),
            "raw_schema.md": file_info(os.path.join(full, "raw_schema.md")),
            "mapping.md": file_info(os.path.join(full, "mapping.md")),
        }
        vfiles_ok = all(f["ok"] for f in vfiles.values())
        ej_count = folder_file_count(os.path.join(full, "Ejemplos")) + folder_file_count(os.path.join(full, "Examples"))
        is_skeleton = entry.lower().startswith("variante x") or "_template" in entry.lower()
        vrel = os.path.relpath(full, scan_root)
        variants.append({
            "name": entry, "files": vfiles, "files_ok": vfiles_ok,
            "examples_count": ej_count, "examples_ok": ej_count > 0,
            "is_skeleton": is_skeleton,
            "folder_rel": vrel,
            "folder_mac": os.path.join(mac_root, vrel),
        })
    real_variants = [v for v in variants if not v["is_skeleton"]]
    has_complete_variant = any(v["files_ok"] and v["examples_ok"] for v in real_variants)
    return {
        "id": name, "type": "DVC",
        "folder_rel": rel,
        "folder_mac": os.path.join(mac_root, rel),
        "is_template": "0000_template" in name,
        "criteria": {"files_ok": files_ok, "examples_ok": has_complete_variant},
        "files": files, "variants": variants,
    }


def scan_dol(folder, name, scan_root, mac_root):
    rel = os.path.relpath(folder, scan_root)
    files = {
        "spec.md": file_info(os.path.join(folder, "spec.md")),
        "changelog.md": file_info(os.path.join(folder, "changelog.md")),
        "document_transcript.md": file_info(os.path.join(folder, "document_transcript.md")),
    }
    files_ok = all(f["ok"] for f in files.values())
    has_source = any(f.lower().endswith('.pdf') for f in os.listdir(folder))
    return {
        "id": name, "type": "DOL",
        "folder_rel": rel,
        "folder_mac": os.path.join(mac_root, rel),
        "is_template": "0000_template" in name,
        "criteria": {"files_ok": files_ok, "examples_ok": has_source},
        "files": files, "has_source_pdf": has_source, "variants": [],
    }


def scan_explicit(scan_root, mac_root):
    base = os.path.join(scan_root, EK_REL)
    out = {"DOC": [], "DVC": [], "DOL": []}
    if not os.path.isdir(base):
        return out
    type_dirs = {
        "DOC": ("DOC Documentos y Ejemplos", scan_doc),
        "DVC": ("DVC Documentos Variables Cliente", scan_dvc),
        "DOL": ("DOL Documentos de Leyes", scan_dol),
    }
    for tc, (subdir, scanner) in type_dirs.items():
        type_base = os.path.join(base, subdir)
        if not os.path.isdir(type_base):
            continue
        for entry in sorted(os.listdir(type_base)):
            full = os.path.join(type_base, entry)
            if entry.startswith('.') or not os.path.isdir(full):
                continue
            out[tc].append(scanner(full, entry, scan_root, mac_root))
    return out


def scan_props(scan_root, mac_root):
    states = ["01 Draft", "02 Needs Human Decision", "03 Approved for Editor", "04 Applied", "05 Rejected"]
    base = os.path.join(scan_root, PROPS_REL)
    out = []
    if not os.path.isdir(base):
        return out
    for state in states:
        state_dir = os.path.join(base, state)
        if not os.path.isdir(state_dir):
            continue
        for entry in sorted(os.listdir(state_dir)):
            if not entry.startswith("PROP-"):
                continue
            full = os.path.join(state_dir, entry)
            if not os.path.isdir(full):
                continue
            rel = os.path.relpath(full, scan_root)
            target = None; ptype = None; title = None
            pmd = os.path.join(full, "proposal.md")
            if os.path.isfile(pmd):
                try:
                    with open(pmd, 'r', errors='ignore') as f:
                        c = f.read(8000)
                    m = re.search(r'(?im)^(?:\|\s*)?Target\s*[:\|]\s*[`"]?([A-Z]+-[\w-]+)', c)
                    if m:
                        target = m.group(1).strip('`"')
                    if not target:
                        m = re.search(r'(DOC-[a-z][\w-]+|DVC-[a-z][\w-]+|DOL-[a-z][\w-]+|METH-[a-z][\w-]+|TEST-[a-z][\w-]+|AIM-[a-z][\w-]+)', c)
                        if m:
                            target = m.group(1)
                    target = target.rstrip('-_') if target else None
                    if target:
                        ptype = target.split('-')[0]
                    m = re.search(r'^#\s+(.+)$', c, re.MULTILINE)
                    if m:
                        title = m.group(1).strip()
                except Exception:
                    pass
            out.append({
                "id": entry, "state": state,
                "state_short": state.split(' ', 1)[1] if ' ' in state else state,
                "target": target, "type": ptype, "title": title,
                "applied": os.path.isfile(os.path.join(full, "applied_record.md")),
                "folder_rel": rel,
                "folder_mac": os.path.join(mac_root, rel),
            })
    return out


def scan_contributions(scan_root, mac_root):
    out = []
    base = os.path.join(scan_root, CONTRIB_REL)
    if not os.path.isdir(base):
        return out
    for team in sorted(os.listdir(base)):
        if team.startswith('.') or team in ["00 Templates"] or team.endswith('.md'):
            continue
        team_dir = os.path.join(base, team)
        if not os.path.isdir(team_dir):
            continue
        for entry in sorted(os.listdir(team_dir)):
            if not entry.startswith("CONTRIBUTION-"):
                continue
            full = os.path.join(team_dir, entry)
            if not os.path.isdir(full):
                continue
            rel = os.path.relpath(full, scan_root)
            cmap_path = os.path.join(full, "contribution_map.md")
            props = []; targets = []; estado = None; estado_auto = None
            if os.path.isfile(cmap_path):
                try:
                    with open(cmap_path, 'r', errors='ignore') as f:
                        c = f.read(20000)
                    for m in re.finditer(r'(PROP-\d{4})', c):
                        if m.group(1) not in props:
                            props.append(m.group(1))
                    for m in re.finditer(r'(DOC-[a-z][\w-]+|DVC-[a-z][\w-]+|DOL-[a-z][\w-]+|METH-[a-z][\w-]+|TEST-[a-z][\w-]+)', c):
                        t = m.group(1).rstrip('-_')
                        if t not in targets and "0000_template" not in t:
                            targets.append(t)
                    m = re.search(r'\|\s*Estado\s*\|\s*([^|]+?)\s*\|', c)
                    if m:
                        estado = m.group(1).strip()
                    m = re.search(r'\|\s*Estado automation\s*\|\s*([^|]+?)\s*\|', c)
                    if m:
                        estado_auto = m.group(1).strip()
                except Exception:
                    pass
            out.append({
                "id": entry, "team": team, "props": props, "targets": targets,
                "target": targets[0] if targets else None,
                "estado": estado, "estado_automation": estado_auto,
                "folder_rel": rel,
                "folder_mac": os.path.join(mac_root, rel),
            })
    return out


def scan_task_specific(scan_root, mac_root):
    out = []
    base = os.path.join(scan_root, TS_REL)
    if not os.path.isdir(base):
        return out
    for root, dirs, files in os.walk(base):
        for d in list(dirs):
            if d.startswith("METH-") or d.startswith("TEST-"):
                full = os.path.join(root, d)
                rel = os.path.relpath(full, scan_root)
                files_list = sorted([f for f in os.listdir(full) if not f.startswith('.') and os.path.isfile(os.path.join(full, f))])
                out.append({
                    "id": d, "type": d.split('-')[0],
                    "is_template": "0000_template" in d,
                    "n_files": len(files_list), "files_list": files_list,
                    "folder_rel": rel,
                    "folder_mac": os.path.join(mac_root, rel),
                })
        depth = root.replace(base, '').count(os.sep)
        if depth >= 3:
            dirs[:] = []
    return out


HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Benford Vault — Document Tracker</title>
<style>
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif; background: #fafaf7; color: #1a1a1a; font-size: 13px; line-height: 1.4; }
.app { max-width: 1400px; margin: 0 auto; padding: 24px; }
header.hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e6e2d8; }
.hero h1 { margin: 0 0 4px 0; font-size: 22px; font-weight: 600; letter-spacing: -0.2px; }
.hero .sub { color: #6b6960; font-size: 12px; }
.hero-stats { display: flex; gap: 14px; }
.stat { background: #fff; border: 1px solid #e6e2d8; padding: 10px 14px; border-radius: 8px; min-width: 80px; display: flex; flex-direction: column; align-items: flex-start; }
.stat .num { font-size: 20px; font-weight: 600; }
.stat .lab { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b6960; margin-top: 2px; }
.stat.ok .num { color: #1f7a3d; }
.stat.bad .num { color: #b8423b; }
.tabs { display: inline-flex; background: #ece9df; border-radius: 8px; padding: 3px; margin-bottom: 16px; }
.tab-btn { border: 0; background: transparent; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; color: #4a4840; transition: all 0.15s; font-family: inherit; }
.tab-btn.active { background: #fff; color: #1a1a1a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; padding: 10px 12px; background: #fff; border: 1px solid #e6e2d8; border-radius: 8px; }
.filter-group { display: flex; gap: 4px; align-items: center; }
.filter-group .lbl { font-size: 11px; color: #6b6960; margin-right: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.chip { border: 1px solid #d6d2c6; background: #fff; padding: 4px 10px; border-radius: 999px; font-size: 11.5px; cursor: pointer; color: #4a4840; font-family: inherit; }
.chip.on { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
.search { margin-left: auto; padding: 6px 10px; font-size: 12.5px; border: 1px solid #d6d2c6; border-radius: 6px; min-width: 220px; background: #fff; font-family: inherit; }
.tog { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #4a4840; }
.table-wrap { background: #fff; border: 1px solid #e6e2d8; border-radius: 10px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead th { background: #f5f2e9; text-align: left; font-weight: 600; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #4a4840; border-bottom: 1px solid #e6e2d8; }
tbody tr.row { border-bottom: 1px solid #f0ede4; }
tbody tr.row:last-child { border-bottom: 0; }
tbody td { padding: 10px 12px; vertical-align: top; }
tbody tr.row.expandable { cursor: pointer; }
tbody tr.row.expandable:hover { background: #fbf9f1; }
tbody tr.row.open { background: #fdfbf3; }
tbody tr.detail td { background: #fbf9f1; padding: 14px 18px; border-bottom: 1px solid #f0ede4; }
.type-pill { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.3px; }
.type-DOC { background: #e3edf7; color: #1d4e7a; }
.type-DVC { background: #ede0f4; color: #5a2879; }
.type-DOL { background: #f4e8d6; color: #735220; }
.type-METH { background: #e6f4e6; color: #2a6b3a; }
.type-TEST { background: #fae5d8; color: #8a4220; }
.status { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.status.green { background: #e0f3e3; color: #1f7a3d; }
.status.red { background: #fae3e0; color: #b8423b; }
.status .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.count { display: inline-flex; align-items: center; justify-content: center; background: #ece9df; color: #4a4840; font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 999px; min-width: 18px; }
.count.zero { background: #f5f2e9; color: #b8423b; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.detail-section h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b6960; font-weight: 600; }
.detail-section { font-size: 12.5px; }
.check-list { list-style: none; margin: 0; padding: 0; }
.check-list li { padding: 3px 0; display: flex; align-items: center; gap: 8px; }
.check { font-weight: 700; }
.check.ok { color: #1f7a3d; }
.check.bad { color: #b8423b; }
.mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11.5px; color: #4a4840; }
.prop-list, .contrib-list { display: flex; flex-direction: column; gap: 4px; }
.prop-item, .contrib-item { background: #fff; border: 1px solid #e6e2d8; padding: 6px 9px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 12px; }
.prop-id { font-weight: 600; font-family: ui-monospace, monospace; font-size: 11.5px; }
.state-pill { font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
.state-Applied { background: #e0f3e3; color: #1f7a3d; }
.state-Draft { background: #f0ecdf; color: #735220; }
.state-NeedsHumanDecision { background: #fae5d8; color: #8a4220; }
.state-ApprovedforEditor { background: #e3edf7; color: #1d4e7a; }
.state-Rejected { background: #f5e0de; color: #8a2820; }
.actions { display: flex; gap: 6px; margin-top: 10px; }
.btn { border: 1px solid #d6d2c6; background: #fff; padding: 5px 10px; font-size: 11px; border-radius: 5px; cursor: pointer; font-weight: 500; color: #1a1a1a; font-family: inherit; text-decoration: none; display: inline-block; }
.btn:hover { background: #fbf9f1; }
.btn.primary { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
.btn.primary:hover { background: #333; }
.path { font-family: ui-monospace, monospace; font-size: 10.5px; color: #6b6960; word-break: break-all; }
.expand-arrow { display: inline-block; transition: transform 0.15s; color: #b0ad9f; margin-right: 6px; }
tr.row.open .expand-arrow { transform: rotate(90deg); }
.empty { padding: 30px; text-align: center; color: #6b6960; font-size: 13px; background: #fbf9f1; }
.legend { display: flex; gap: 14px; margin-top: 10px; font-size: 11px; color: #6b6960; flex-wrap: wrap; }
.variant-card { background: #fff; border: 1px solid #e6e2d8; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px; }
.variant-card .vname { font-weight: 600; font-size: 12px; margin-bottom: 4px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.variant-card .vfiles { font-size: 11px; color: #6b6960; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: #fff; padding: 8px 14px; border-radius: 6px; font-size: 12px; opacity: 0; transition: opacity 0.2s; pointer-events: none; z-index: 1000; }
.toast.show { opacity: 1; }
</style>
</head>
<body>
<div class="app">
<header class="hero">
  <div>
    <h1>Benford Vault — Document Tracker</h1>
    <div class="sub">Snapshot del estado de canónicos en <span class="mono" id="vaultPath"></span> · generado <span id="genAt"></span></div>
  </div>
  <div class="hero-stats" id="heroStats"></div>
</header>
<div class="tabs">
  <button class="tab-btn active" data-tab="explicit">Explicit Knowledge</button>
  <button class="tab-btn" data-tab="task">Task Specific</button>
</div>
<div id="tab-explicit">
  <div class="filters">
    <div class="filter-group"><span class="lbl">Tipo</span>
      <button class="chip on" data-type="ALL">Todos</button>
      <button class="chip" data-type="DOC">DOC</button>
      <button class="chip" data-type="DVC">DVC</button>
      <button class="chip" data-type="DOL">DOL</button>
    </div>
    <div class="filter-group"><span class="lbl">Status</span>
      <button class="chip on" data-status="ALL">Todos</button>
      <button class="chip" data-status="green">OK</button>
      <button class="chip" data-status="red">Pendiente</button>
    </div>
    <label class="tog"><input type="checkbox" id="showTpl"> Mostrar templates</label>
    <input class="search" id="search" type="text" placeholder="Buscar documento, PROP o contribution…">
  </div>
  <div class="table-wrap"><table>
    <thead><tr>
      <th style="width: 36%">Documento</th>
      <th style="width: 8%">Tipo</th>
      <th style="width: 18%">Contributions</th>
      <th style="width: 18%">PROPs</th>
      <th style="width: 20%">Canónico</th>
    </tr></thead>
    <tbody id="ekBody"></tbody>
  </table></div>
  <div class="legend">
    <span><span class="status green"><span class="dot"></span>OK</span> = archivos requeridos completos + ≥1 PROP aplicada + Examples poblados</span>
    <span><span class="status red"><span class="dot"></span>Pendiente</span> = falla algún criterio (click la fila para ver detalle)</span>
  </div>
</div>
<div id="tab-task" style="display:none">
  <div class="table-wrap"><table>
    <thead><tr>
      <th style="width:50%">Documento</th>
      <th style="width:10%">Tipo</th>
      <th style="width:15%">Archivos</th>
      <th style="width:25%">Carpeta</th>
    </tr></thead>
    <tbody id="tsBody"></tbody>
  </table></div>
  <div class="legend"><span>Cuando se generen METH-* y TEST-* reales aparecerán aquí.</span></div>
</div>
<div class="toast" id="toast"></div>
</div>
<script id="vaultData" type="application/json">__PAYLOAD__</script>
<script>
const DATA = JSON.parse(document.getElementById('vaultData').textContent);
const STATE = { tab: 'explicit', type: 'ALL', status: 'ALL', search: '', showTpl: false };

document.getElementById('vaultPath').textContent = DATA.vault_mac.split('/').slice(-2).join('/');
document.getElementById('genAt').textContent = DATA.generated_at;

document.getElementById('heroStats').innerHTML = `
  <div class="stat ok"><span class="num">${DATA.summary.green}</span><span class="lab">OK</span></div>
  <div class="stat bad"><span class="num">${DATA.summary.red}</span><span class="lab">Pendientes</span></div>
  <div class="stat"><span class="num">${DATA.props.length}</span><span class="lab">PROPs</span></div>
  <div class="stat"><span class="num">${DATA.contributions.length}</span><span class="lab">Contribs</span></div>
`;

document.querySelectorAll('.tab-btn').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); STATE.tab = b.dataset.tab;
    document.getElementById('tab-explicit').style.display = STATE.tab === 'explicit' ? '' : 'none';
    document.getElementById('tab-task').style.display = STATE.tab === 'task' ? '' : 'none';
  };
});
document.querySelectorAll('.chip[data-type]').forEach(c => {
  c.onclick = () => { document.querySelectorAll('.chip[data-type]').forEach(x => x.classList.remove('on')); c.classList.add('on'); STATE.type = c.dataset.type; renderEK(); };
});
document.querySelectorAll('.chip[data-status]').forEach(c => {
  c.onclick = () => { document.querySelectorAll('.chip[data-status]').forEach(x => x.classList.remove('on')); c.classList.add('on'); STATE.status = c.dataset.status; renderEK(); };
});
document.getElementById('showTpl').onchange = e => { STATE.showTpl = e.target.checked; renderEK(); };
document.getElementById('search').oninput = e => { STATE.search = e.target.value.toLowerCase(); renderEK(); };

function escapeHtml(s) { if (s == null) return ''; return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function copyPath(path, label) { navigator.clipboard.writeText(path).then(() => showToast(`Path copiado: ${label || 'carpeta'}`)); }
function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600); }
function stateClass(s) { return 'state-' + s.replace(/\s+/g, ''); }

function buildDetail(c) {
  let filesHtml = '<ul class="check-list">';
  for (const [fname, info] of Object.entries(c.files)) {
    const ok = info.ok;
    filesHtml += `<li><span class="check ${ok?'ok':'bad'}">${ok?'✓':'✕'}</span> <span class="mono">${fname}</span> ${info.exists ? `<span style="color:#9b988c">(${info.size} bytes)</span>` : '<span style="color:#b8423b">(falta)</span>'}</li>`;
  }
  filesHtml += '</ul>';
  let variantsHtml = '';
  if (c.variants && c.variants.length > 0) {
    variantsHtml = '<div class="detail-section" style="margin-top:14px"><h4>Variantes</h4>';
    for (const v of c.variants) {
      const skel = v.is_skeleton ? '<span style="background:#f0ecdf;color:#735220;padding:1px 5px;border-radius:3px;font-size:10px">SKELETON</span>' : '';
      const fileChks = Object.entries(v.files).map(([fn, fi]) => `<span class="check ${fi.ok?'ok':'bad'}">${fi.ok?'✓':'✕'}</span>${fn}`).join('  ');
      variantsHtml += `<div class="variant-card"><div class="vname">${escapeHtml(v.name)} ${skel} <span class="check ${v.examples_ok?'ok':'bad'}">${v.examples_ok?'✓':'✕'} ejemplos (${v.examples_count})</span><button class="btn" style="margin-left:auto" onclick="copyPath(${JSON.stringify(v.folder_mac)}, ${JSON.stringify(v.name)})">Copiar path</button></div><div class="vfiles">${fileChks}</div></div>`;
    }
    variantsHtml += '</div>';
  }
  let propsHtml = '<div class="detail-section"><h4>PROPs (' + c.props.length + ')</h4>';
  if (c.props.length === 0) {
    propsHtml += '<div style="color:#b8423b;font-size:12px">⚠ No hay PROPs vinculadas</div>';
  } else {
    propsHtml += '<div class="prop-list">';
    for (const p of c.props) {
      propsHtml += `<div class="prop-item"><span class="prop-id">${p.id}</span><span class="state-pill ${stateClass(p.state_short)}">${p.state_short}</span><span style="color:#6b6960;font-size:11.5px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.title || '')}</span><button class="btn" onclick="copyPath(${JSON.stringify(p.folder_mac)}, ${JSON.stringify(p.id)})">Copiar</button></div>`;
    }
    propsHtml += '</div>';
  }
  propsHtml += '</div>';
  let contribsHtml = '<div class="detail-section" style="margin-top:14px"><h4>Contributions (' + c.contributions.length + ')</h4>';
  if (c.contributions.length === 0) {
    contribsHtml += '<div style="color:#9b988c;font-size:12px">No hay contributions vinculadas</div>';
  } else {
    contribsHtml += '<div class="contrib-list">';
    for (const cid of c.contributions) {
      const co = DATA.contributions.find(x => x.id === cid);
      const team = co ? co.team : ''; const macP = co ? co.folder_mac : '';
      contribsHtml += `<div class="contrib-item"><span class="mono" style="font-size:11px">${escapeHtml(cid)}</span><span style="font-size:11px;color:#6b6960">${escapeHtml(team)}</span><button class="btn" style="margin-left:auto" onclick="copyPath(${JSON.stringify(macP)}, ${JSON.stringify(cid)})">Copiar</button></div>`;
    }
    contribsHtml += '</div>';
  }
  contribsHtml += '</div>';
  let failHtml = '';
  if (c.status === 'red') {
    const reasons = [];
    if (!c.criteria.files_ok) reasons.push('faltan archivos requeridos');
    if (!c.criteria.examples_ok) {
      if (c.type === 'DVC') reasons.push('ninguna variante real con archivos completos + ejemplos');
      else if (c.type === 'DOL') reasons.push('falta PDF fuente de la ley');
      else reasons.push('Examples vacío');
    }
    if (!c.criteria.prop_applied) reasons.push('ninguna PROP en 04 Applied');
    failHtml = `<div style="background:#fae3e0;border:1px solid #f0c0bb;border-radius:6px;padding:8px 10px;margin-bottom:12px;font-size:12px;color:#8a2820"><strong>Pendiente:</strong> ${reasons.join(' · ')}</div>`;
  }
  return `${failHtml}<div class="detail-grid"><div><div class="detail-section"><h4>Archivos canónicos requeridos</h4>${filesHtml}</div>${variantsHtml}<div class="detail-section" style="margin-top:14px"><h4>Carpeta del canónico</h4><div class="path">${escapeHtml(c.folder_mac)}</div><div class="actions"><button class="btn primary" onclick="copyPath(${JSON.stringify(c.folder_mac)}, ${JSON.stringify(c.id)})">📋 Copiar path</button><a class="btn" href="${'file://'+encodeURI(c.folder_mac)}">🗂 Abrir en Finder</a></div></div></div><div>${propsHtml}${contribsHtml}</div></div>`;
}

function renderEK() {
  const all = [...DATA.explicit.DOC, ...DATA.explicit.DVC, ...DATA.explicit.DOL];
  let items = all.filter(c => STATE.showTpl || !c.is_template);
  if (STATE.type !== 'ALL') items = items.filter(c => c.type === STATE.type);
  if (STATE.status !== 'ALL') items = items.filter(c => c.status === STATE.status);
  if (STATE.search) {
    const s = STATE.search;
    items = items.filter(c => c.id.toLowerCase().includes(s) || c.props.some(p => p.id.toLowerCase().includes(s)) || c.contributions.some(cid => cid.toLowerCase().includes(s)));
  }
  const body = document.getElementById('ekBody');
  if (items.length === 0) { body.innerHTML = '<tr><td colspan="5" class="empty">Sin documentos que coincidan con los filtros.</td></tr>'; return; }
  let html = '';
  for (const c of items) {
    const tplBadge = c.is_template ? '<span style="background:#f0ecdf;color:#735220;padding:1px 5px;border-radius:3px;font-size:10px;margin-left:6px">TEMPLATE</span>' : '';
    html += `<tr class="row expandable" data-id="${escapeHtml(c.id)}" onclick="toggleRow(${JSON.stringify(c.id)})"><td><span class="expand-arrow">▶</span><strong>${escapeHtml(c.id)}</strong>${tplBadge}</td><td><span class="type-pill type-${c.type}">${c.type}</span></td><td><span class="count ${c.contributions.length===0?'zero':''}">${c.contributions.length}</span></td><td><span class="count ${c.props.length===0?'zero':''}">${c.props.length}</span></td><td><span class="status ${c.status}"><span class="dot"></span>${c.status === 'green' ? 'OK' : 'Pendiente'}</span></td></tr><tr class="detail" id="detail-${escapeHtml(c.id)}" style="display:none"><td colspan="5">${buildDetail(c)}</td></tr>`;
  }
  body.innerHTML = html;
}

function toggleRow(id) {
  const detail = document.getElementById('detail-' + id);
  const row = detail.previousElementSibling;
  const isOpen = detail.style.display !== 'none';
  document.querySelectorAll('tr.detail').forEach(d => d.style.display = 'none');
  document.querySelectorAll('tr.row').forEach(r => r.classList.remove('open'));
  if (!isOpen) { detail.style.display = ''; row.classList.add('open'); }
}

function renderTS() {
  const body = document.getElementById('tsBody');
  if (DATA.task_specific.length === 0) { body.innerHTML = '<tr><td colspan="4" class="empty">No hay documentos Task Specific aún.</td></tr>'; return; }
  let html = '';
  for (const t of DATA.task_specific) {
    const tplBadge = t.is_template ? '<span style="background:#f0ecdf;color:#735220;padding:1px 5px;border-radius:3px;font-size:10px;margin-left:6px">TEMPLATE</span>' : '';
    html += `<tr class="row"><td><strong>${escapeHtml(t.id)}</strong>${tplBadge}</td><td><span class="type-pill type-${t.type}">${t.type}</span></td><td><span class="count">${t.n_files}</span></td><td><button class="btn" onclick="copyPath(${JSON.stringify(t.folder_mac)}, ${JSON.stringify(t.id)})">📋 Copiar path</button> <a class="btn" href="${'file://'+encodeURI(t.folder_mac)}">🗂 Finder</a></td></tr>`;
  }
  body.innerHTML = html;
}

renderEK(); renderTS();
</script>
</body>
</html>
"""


def build(scan_root, mac_root, out_path):
    explicit = scan_explicit(scan_root, mac_root)
    props = scan_props(scan_root, mac_root)
    contributions = scan_contributions(scan_root, mac_root)
    task_specific = scan_task_specific(scan_root, mac_root)

    props_by_target = {}
    for p in props:
        if p["target"]:
            props_by_target.setdefault(p["target"], []).append(p)
    contribs_by_target = {}
    for c in contributions:
        for t in c["targets"]:
            contribs_by_target.setdefault(t, []).append(c["id"])

    for tc in ["DOC", "DVC", "DOL"]:
        for canon in explicit[tc]:
            canon["props"] = props_by_target.get(canon["id"], [])
            canon["props_applied"] = [p for p in canon["props"] if p["state"] == "04 Applied"]
            canon["contributions"] = contribs_by_target.get(canon["id"], [])
            canon["criteria"]["prop_applied"] = len(canon["props_applied"]) > 0
            cr = canon["criteria"]
            canon["status"] = "green" if (cr["files_ok"] and cr["examples_ok"] and cr["prop_applied"]) else "red"

    summary = {"green": 0, "red": 0, "by_type": {}}
    for tc in ["DOC", "DVC", "DOL"]:
        items = [c for c in explicit[tc] if not c["is_template"]]
        g = sum(1 for c in items if c["status"] == "green")
        r = sum(1 for c in items if c["status"] == "red")
        summary["green"] += g; summary["red"] += r
        summary["by_type"][tc] = {"total": len(items), "green": g, "red": r}

    from datetime import date
    payload = {
        "generated_at": date.today().isoformat(),
        "vault_mac": mac_root,
        "summary": summary,
        "explicit": explicit,
        "task_specific": task_specific,
        "props": props,
        "contributions": contributions,
    }
    payload_json = json.dumps(payload, ensure_ascii=False)
    safe = payload_json.replace("</script>", "<\\/script>")
    final_html = HTML_TEMPLATE.replace("__PAYLOAD__", safe)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(final_html)

    return {
        "out_path": out_path,
        "summary": summary,
        "n_props": len(props),
        "n_contributions": len(contributions),
    }


def main():
    ap = argparse.ArgumentParser(description="Genera el HTML del Benford Vault Tracker")
    ap.add_argument("scan_root", help="Ruta donde leer el vault (ej. mount path en bash)")
    ap.add_argument("--mac-path", default=None, help="Ruta real macOS del vault para los links file:// (default: mismo que scan_root)")
    ap.add_argument("--out", default="benford_tracker.html", help="Ruta de salida del HTML")
    args = ap.parse_args()
    scan_root = os.path.abspath(args.scan_root)
    mac_root = args.mac_path or scan_root
    if not os.path.isdir(os.path.join(scan_root, V3)):
        sys.exit(f"ERROR: '{scan_root}' no contiene 'Benford Vault V3/'. ¿Apuntaste a '05 Benford Vault'?")
    info = build(scan_root, mac_root, args.out)
    print(json.dumps(info, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
