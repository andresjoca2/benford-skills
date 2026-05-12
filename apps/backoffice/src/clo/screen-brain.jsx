// Brain — document tracker (Explicit Knowledge / Task Specific).
const { useState: useStateBr, useMemo: useMemoBr } = React;

const BRAIN_DOCS = {
  explicit: [
    { id:"DVC-contrato-individual-trabajo",   type:"DVC", contribs:2, props:2, falla:"examples",  status:"pendiente" },
    { id:"DVC-reportes-entradas-salidas",     type:"DVC", contribs:1, props:1, falla:"archivos",  status:"pendiente" },
    { id:"DOC-ley-federal-trabajo-2024",      type:"DOC", contribs:4, props:3, falla:null,        status:"ok" },
    { id:"DOC-codigo-fiscal-federacion",      type:"DOC", contribs:6, props:5, falla:null,        status:"ok" },
    { id:"DOC-ley-iva-2024",                  type:"DOC", contribs:3, props:2, falla:null,        status:"ok" },
    { id:"DOC-ley-isr-2024",                  type:"DOC", contribs:5, props:4, falla:null,        status:"ok" },
    { id:"DVC-recibos-nomina-cfdi-4",         type:"DVC", contribs:4, props:3, falla:null,        status:"ok" },
    { id:"DVC-comprobantes-pago-cfdi-4",      type:"DVC", contribs:3, props:3, falla:null,        status:"ok" },
    { id:"DOL-onboarding-clientes-pyme",      type:"DOL", contribs:2, props:2, falla:null,        status:"ok" },
    { id:"DOL-clasificacion-gastos-deducibles",type:"DOL",contribs:3, props:2, falla:null,        status:"ok" },
    { id:"DOC-resolucion-miscelanea-fiscal",  type:"DOC", contribs:5, props:4, falla:null,        status:"ok" },
    { id:"DVC-declaracion-anual-personas-fisicas",type:"DVC",contribs:4, props:3, falla:null,    status:"ok" },
  ],
  task: [
    { id:"DOL-conciliacion-bancaria-mensual", type:"DOL", contribs:6, props:4, falla:null,       status:"ok" },
    { id:"DOL-declaracion-mensual-iva",       type:"DOL", contribs:5, props:3, falla:null,       status:"ok" },
    { id:"DOL-emision-cfdi-cliente",          type:"DOL", contribs:3, props:2, falla:"sin-prop", status:"pendiente" },
    { id:"DOL-cierre-mensual-contable",       type:"DOL", contribs:4, props:3, falla:null,       status:"ok" },
    { id:"DOL-revision-deducibilidad",        type:"DOL", contribs:3, props:2, falla:null,       status:"ok" },
    { id:"DOL-alta-empleado-imss",            type:"DOL", contribs:2, props:2, falla:null,       status:"ok" },
    { id:"DOL-baja-empleado-imss",            type:"DOL", contribs:2, props:1, falla:null,       status:"ok" },
    { id:"DOL-pago-cuotas-imss",              type:"DOL", contribs:3, props:2, falla:null,       status:"ok" },
  ],
};

const TYPE_COLOR = { DOC:"#6366F1", DVC:"#8B5CF6", DOL:"#0EA5E9" };

const BrainScreen = ({ subroute }) => {
  const [tab, setTab] = useStateBr(subroute === "task" ? "task" : "explicit");
  const [tipo, setTipo] = useStateBr("Todos");
  const [status, setStatus] = useStateBr("Pendiente");
  const [falla, setFalla] = useStateBr("Cualquiera");
  const [templates, setTemplates] = useStateBr(false);
  const [q, setQ] = useStateBr("");

  React.useEffect(() => { if (subroute) setTab(subroute === "task" ? "task" : "explicit"); }, [subroute]);

  const docs = tab === "task" ? BRAIN_DOCS.task : BRAIN_DOCS.explicit;

  const filtered = useMemoBr(() => {
    return docs.filter(d => {
      if (tipo !== "Todos" && d.type !== tipo) return false;
      if (status === "OK" && d.status !== "ok") return false;
      if (status === "Pendiente" && d.status !== "pendiente") return false;
      if (falla === "Archivos" && d.falla !== "archivos") return false;
      if (falla === "Examples" && d.falla !== "examples") return false;
      if (falla === "Sin PROP" && d.falla !== "sin-prop") return false;
      if (q && !d.id.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [docs, tipo, status, falla, q]);

  const counts = {
    ok: docs.filter(d=>d.status==="ok").length,
    pendientes: docs.filter(d=>d.status==="pendiente").length,
    props: docs.reduce((a,b)=>a+b.props,0),
    contribs: docs.reduce((a,b)=>a+b.contribs,0),
  };

  return (
    <>
      <window.Topbar crumbs={["Brain", tab==="task"?"Task Specific":"Explicit Knowledge"]}/>
      <div className="page" data-screen-label={`Brain · ${tab==="task"?"Task Specific":"Explicit Knowledge"}`}>
        <div className="brain-head">
          <div style={{flex:1, minWidth:0}}>
            <h1 className="page-title">Benford Vault — Document Tracker</h1>
            <p className="page-sub" style={{maxWidth:"none"}}>
              Snapshot del estado de canónicos en <span className="mono" style={{color:"var(--fg-2)"}}>Benford AI Audit/05 Benford Vault</span> · generado 2026-05-11
            </p>
          </div>
          <div className="brain-kpis">
            <div className="bkpi"><div className="bkpi-val" style={{color:"var(--ok)"}}>{counts.ok}</div><div className="bkpi-lbl">OK</div></div>
            <div className="bkpi"><div className="bkpi-val" style={{color:"var(--danger)"}}>{counts.pendientes}</div><div className="bkpi-lbl">PENDIENTES</div></div>
            <div className="bkpi"><div className="bkpi-val">{counts.props}</div><div className="bkpi-lbl">PROPS</div></div>
            <div className="bkpi"><div className="bkpi-val">{counts.contribs}</div><div className="bkpi-lbl">CONTRIBS</div></div>
          </div>
          <button className="brain-refresh"><Icons.Refresh size={12}/> Refrescar</button>
        </div>

        <div className="brain-toggle">
          <button className={tab==="explicit"?"on":""} onClick={()=>setTab("explicit")}>Explicit Knowledge</button>
          <button className={tab==="task"?"on":""} onClick={()=>setTab("task")}>Task Specific</button>
        </div>

        <div className="brain-filterbar">
          <span className="bf-label">TIPO</span>
          {["Todos","DOC","DVC","DOL"].map(t=>(
            <button key={t} className={`bf-chip ${tipo===t?"on":""}`} onClick={()=>setTipo(t)}>{t}</button>
          ))}
          <span className="bf-label" style={{marginLeft:14}}>STATUS</span>
          {["Todos","OK","Pendiente"].map(s=>(
            <button key={s} className={`bf-chip ${status===s?"on":""}`} onClick={()=>setStatus(s)}>{s}</button>
          ))}
          <span className="bf-label" style={{marginLeft:14}}>FALLA</span>
          {["Cualquiera","Archivos","Examples","Sin PROP"].map(f=>(
            <button key={f} className={`bf-chip ${falla===f?"on":""}`} onClick={()=>setFalla(f)}>{f}</button>
          ))}
          <label className="bf-check">
            <input type="checkbox" checked={templates} onChange={(e)=>setTemplates(e.target.checked)}/>
            Mostrar templates
          </label>
          <div style={{flex:1}}/>
          <input className="bf-search" placeholder="Buscar documento, PROP o contrib" value={q} onChange={(e)=>setQ(e.target.value)}/>
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
              {filtered.length===0 && (
                <tr><td colSpan={6} style={{textAlign:"center", color:"var(--fg-3)", padding:"40px", fontSize:13}}>Sin documentos con estos filtros.</td></tr>
              )}
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{display:"flex", alignItems:"center", gap:8}}>
                      <Icons.Chevron size={11} sw={2}/>
                      <span style={{fontWeight:600, fontSize:13}}>{d.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className="brain-type" style={{background:`color-mix(in oklch, ${TYPE_COLOR[d.type]} 14%, var(--bg))`, color:TYPE_COLOR[d.type]}}>
                      {d.type}
                    </span>
                  </td>
                  <td className="right"><span className="brain-num">{d.contribs}</span></td>
                  <td className="right"><span className="brain-num">{d.props}</span></td>
                  <td>{d.falla ? <span className="brain-falla">{d.falla}</span> : <span style={{color:"var(--fg-4)"}}>—</span>}</td>
                  <td className="right">
                    {d.status==="ok"
                      ? <span className="brain-pill ok"><span className="dot"/>OK</span>
                      : <span className="brain-pill pend"><span className="dot"/>Pendiente</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="brain-legend">
          <span className="brain-pill ok"><span className="dot"/>OK</span>
          <span style={{color:"var(--fg-3)"}}>= 4 archivos requeridos + ≥1 PROP aplicada + Examples poblados</span>
          <span style={{marginLeft:18}} className="brain-pill pend"><span className="dot"/>Pendiente</span>
          <span style={{color:"var(--fg-3)"}}>= falla algún criterio (click para ver detalle)</span>
        </div>
      </div>
    </>
  );
};

window.BrainScreen = BrainScreen;
