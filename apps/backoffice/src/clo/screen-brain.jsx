// Brain — document tracker (Explicit Knowledge / Task Specific).
// Data viene del endpoint /api/brain/snapshot que lee
// apps/backoffice/.data/vault_snapshot.json (regenerado por
// apps/backoffice/scripts/build_snapshot.py).
const { useState: useStateBr, useMemo: useMemoBr, useEffect: useEffectBr } = React;

const TYPE_COLOR = { DOC: "#6366F1", DVC: "#8B5CF6", DOL: "#0EA5E9", METH: "#10B981", TEST: "#F59E0B" };

// Mapea un canónico EK del snapshot al row plano que la tabla espera.
function flattenCanonical(c) {
  const fallas = [];
  if (c.criteria && !c.criteria.files_ok) fallas.push("archivos");
  if (c.criteria && !c.criteria.examples_ok) fallas.push("examples");
  if (c.criteria && !c.criteria.prop_applied) fallas.push("sin-prop");
  return {
    id: c.id,
    type: c.type,
    contribs: (c.contributions || []).length,
    props: (c.props || []).length,
    falla: fallas[0] || null,
    fallas,
    status: c.status === "green" ? "ok" : "pendiente",
    is_template: !!c.is_template,
    folder_mac: c.folder_mac,
  };
}

function flattenTaskSpecific(t) {
  return {
    id: t.id,
    type: t.type,
    contribs: (t.contributions || []).length,
    props: (t.props || []).length,
    falla: null,
    fallas: [],
    status: "ok", // Task Specific no tiene criterio de falla aún
    is_template: !!t.is_template,
    folder_mac: t.folder_mac,
  };
}

function vaultLabel(snapshot) {
  if (!snapshot || !snapshot.vault_mac) return "Benford Vault";
  const parts = snapshot.vault_mac.split("/").filter(Boolean);
  return parts.slice(-2).join("/");
}

const BrainScreen = ({ subroute }) => {
  const [tab, setTab] = useStateBr(subroute === "task" ? "task" : "explicit");
  const [tipo, setTipo] = useStateBr("Todos");
  const [status, setStatus] = useStateBr("Todos");
  const [falla, setFalla] = useStateBr("Cualquiera");
  const [templates, setTemplates] = useStateBr(false);
  const [q, setQ] = useStateBr("");
  const [snapshot, setSnapshot] = useStateBr(null);
  const [loading, setLoading] = useStateBr(true);
  const [refreshing, setRefreshing] = useStateBr(false);
  const [error, setError] = useStateBr(null);

  React.useEffect(() => {
    if (subroute) setTab(subroute === "task" ? "task" : "explicit");
  }, [subroute]);

  useEffectBr(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await window.BackofficeAPI.brainSnapshot();
        if (!cancelled) {
          setSnapshot(snap);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const snap = await window.BackofficeAPI.refreshBrainSnapshot();
      setSnapshot(snap);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setRefreshing(false);
    }
  };

  // Aplana el snapshot a rows planos según tab y filtro de templates
  const allDocs = useMemoBr(() => {
    if (!snapshot) return [];
    if (tab === "task") {
      return (snapshot.task_specific || [])
        .map(flattenTaskSpecific)
        .filter(d => templates || !d.is_template);
    }
    const ek = snapshot.explicit || {};
    return [...(ek.DOC || []), ...(ek.DVC || []), ...(ek.DOL || [])]
      .map(flattenCanonical)
      .filter(d => templates || !d.is_template);
  }, [snapshot, tab, templates]);

  const filtered = useMemoBr(() => {
    return allDocs.filter(d => {
      if (tipo !== "Todos" && d.type !== tipo) return false;
      if (status === "OK" && d.status !== "ok") return false;
      if (status === "Pendiente" && d.status !== "pendiente") return false;
      if (falla === "Archivos" && !d.fallas.includes("archivos")) return false;
      if (falla === "Examples" && !d.fallas.includes("examples")) return false;
      if (falla === "Sin PROP" && !d.fallas.includes("sin-prop")) return false;
      if (q && !d.id.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [allDocs, tipo, status, falla, q]);

  const counts = useMemoBr(() => {
    const ok = allDocs.filter(d => d.status === "ok").length;
    const pendientes = allDocs.filter(d => d.status === "pendiente").length;
    let props = 0;
    let contribs = 0;
    if (snapshot && tab === "explicit") {
      props = (snapshot.props || []).length;
      contribs = (snapshot.contributions || []).length;
    } else {
      props = allDocs.reduce((a, b) => a + b.props, 0);
      contribs = allDocs.reduce((a, b) => a + b.contribs, 0);
    }
    return { ok, pendientes, props, contribs };
  }, [allDocs, snapshot, tab]);

  const TIPO_OPTS = tab === "task" ? ["Todos", "METH", "TEST"] : ["Todos", "DOC", "DVC", "DOL"];

  return (
    <>
      <window.Topbar crumbs={["Brain", tab === "task" ? "Task Specific" : "Explicit Knowledge"]} />
      <div className="page" data-screen-label={`Brain · ${tab === "task" ? "Task Specific" : "Explicit Knowledge"}`}>
        <div className="brain-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-title">Benford Vault — Document Tracker</h1>
            <p className="page-sub" style={{ maxWidth: "none" }}>
              Snapshot del estado de canónicos en{" "}
              <span className="mono" style={{ color: "var(--fg-2)" }}>
                {vaultLabel(snapshot)}
              </span>
              {snapshot ? <> · generado {snapshot.generated_at}</> : null}
            </p>
          </div>
          <div className="brain-kpis">
            <div className="bkpi"><div className="bkpi-val" style={{ color: "var(--ok)" }}>{counts.ok}</div><div className="bkpi-lbl">OK</div></div>
            <div className="bkpi"><div className="bkpi-val" style={{ color: "var(--danger)" }}>{counts.pendientes}</div><div className="bkpi-lbl">PENDIENTES</div></div>
            <div className="bkpi"><div className="bkpi-val">{counts.props}</div><div className="bkpi-lbl">PROPS</div></div>
            <div className="bkpi"><div className="bkpi-val">{counts.contribs}</div><div className="bkpi-lbl">CONTRIBS</div></div>
          </div>
          <button className="brain-refresh" onClick={onRefresh} disabled={refreshing}>
            <Icons.Refresh size={12} /> {refreshing ? "Refrescando..." : "Refrescar"}
          </button>
        </div>

        {error && (
          <div className="card" style={{ padding: 14, marginBottom: 12, background: "color-mix(in oklch, var(--danger) 12%, var(--bg))", color: "var(--danger)", fontSize: 13 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="brain-toggle">
          <button className={tab === "explicit" ? "on" : ""} onClick={() => setTab("explicit")}>Explicit Knowledge</button>
          <button className={tab === "task" ? "on" : ""} onClick={() => setTab("task")}>Task Specific</button>
        </div>

        <div className="brain-filterbar">
          <span className="bf-label">TIPO</span>
          {TIPO_OPTS.map(t => (
            <button key={t} className={`bf-chip ${tipo === t ? "on" : ""}`} onClick={() => setTipo(t)}>{t}</button>
          ))}
          <span className="bf-label" style={{ marginLeft: 14 }}>STATUS</span>
          {["Todos", "OK", "Pendiente"].map(s => (
            <button key={s} className={`bf-chip ${status === s ? "on" : ""}`} onClick={() => setStatus(s)}>{s}</button>
          ))}
          {tab === "explicit" && (
            <>
              <span className="bf-label" style={{ marginLeft: 14 }}>FALLA</span>
              {["Cualquiera", "Archivos", "Examples", "Sin PROP"].map(f => (
                <button key={f} className={`bf-chip ${falla === f ? "on" : ""}`} onClick={() => setFalla(f)}>{f}</button>
              ))}
            </>
          )}
          <label className="bf-check">
            <input type="checkbox" checked={templates} onChange={(e) => setTemplates(e.target.checked)} />
            Mostrar templates
          </label>
          <div style={{ flex: 1 }} />
          <input className="bf-search" placeholder="Buscar documento, PROP o contrib" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="card">
          <table className="dt brain-dt">
            <thead>
              <tr>
                <th>DOCUMENTO</th>
                <th>TIPO</th>
                <th className="right">CONTRIBS</th>
                <th className="right">PROPS</th>
                <th>FALLA</th>
                <th className="right">CANÓNICO</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--fg-3)", padding: "40px", fontSize: 13 }}>Cargando snapshot…</td></tr>
              )}
              {!loading && !snapshot && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--fg-3)", padding: "40px", fontSize: 13 }}>
                  No hay snapshot generado. Click <strong>Refrescar</strong> arriba para escanear el vault.
                </td></tr>
              )}
              {!loading && snapshot && filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--fg-3)", padding: "40px", fontSize: 13 }}>Sin documentos con estos filtros.</td></tr>
              )}
              {!loading && snapshot && filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icons.Chevron size={11} sw={2} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{d.id}</span>
                      {d.is_template && <span style={{ background: "var(--bg-3)", color: "var(--fg-3)", padding: "1px 6px", borderRadius: 3, fontSize: 10, fontWeight: 600 }}>TEMPLATE</span>}
                    </div>
                  </td>
                  <td>
                    <span className="brain-type" style={{ background: `color-mix(in oklch, ${TYPE_COLOR[d.type] || "#888"} 14%, var(--bg))`, color: TYPE_COLOR[d.type] || "#888" }}>
                      {d.type}
                    </span>
                  </td>
                  <td className="right"><span className="brain-num">{d.contribs}</span></td>
                  <td className="right"><span className="brain-num">{d.props}</span></td>
                  <td>
                    {d.fallas.length === 0
                      ? <span style={{ color: "var(--fg-4)" }}>—</span>
                      : <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {d.fallas.map(f => <span key={f} className="brain-falla">{f}</span>)}
                        </span>}
                  </td>
                  <td className="right">
                    {d.status === "ok"
                      ? <span className="brain-pill ok"><span className="dot" />OK</span>
                      : <span className="brain-pill pend"><span className="dot" />Pendiente</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="brain-legend">
          <span className="brain-pill ok"><span className="dot" />OK</span>
          <span style={{ color: "var(--fg-3)" }}>
            {tab === "explicit"
              ? "= archivos canónicos completos + ≥1 PROP aplicada + Examples poblados (DVC: ≥1 variante completa)"
              : "= placeholder (Task Specific aún sin criterio de status)"}
          </span>
          {tab === "explicit" && (
            <>
              <span style={{ marginLeft: 18 }} className="brain-pill pend"><span className="dot" />Pendiente</span>
              <span style={{ color: "var(--fg-3)" }}>= falla algún criterio (columna FALLA muestra cuál)</span>
            </>
          )}
        </div>
      </div>
    </>
  );
};

window.BrainScreen = BrainScreen;
