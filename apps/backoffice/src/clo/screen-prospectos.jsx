// Prospectos screen — rich data table with bulk select, filters, KPIs.
const { useEffect: useEffectP, useState: useStateP } = React;

const ProspectosScreen = () => {
  const [rows, setRows] = useStateP(window.DATA.PROSPECTS);
  const [tab, setTab] = useStateP("todos");
  const [sel, setSel] = useStateP(new Set());

  useEffectP(() => {
    let cancelled = false;
    window.BackofficeAPI?.prospects()
      .then((prospects) => {
        if (!cancelled && prospects.length) {
          window.DATA.PROSPECTS = prospects;
          setRows(prospects);
        }
      })
      .catch((error) => console.warn("No se pudieron cargar prospectos desde SQLite", error));
    return () => { cancelled = true; };
  }, []);

  const refreshProspects = () => {
    return window.BackofficeAPI?.prospects()
      .then((prospects) => {
        if (prospects.length) {
          window.DATA.PROSPECTS = prospects;
          setRows(prospects);
        }
      })
      .catch((error) => console.warn("No se pudieron recargar prospectos", error));
  };

  const createProspect = () => {
    const name = window.prompt("Nombre del prospecto");
    if (!name?.trim()) return;
    const company = window.prompt("Empresa") || "";

    window.BackofficeAPI?.createProspect({ name, company })
      .then(() => refreshProspects())
      .catch((error) => console.warn("No se pudo crear prospecto", error));
  };

  const totals = {
    todos: rows.length,
    hot: rows.filter(r=>r.scoreBand==="hot").length,
    contactados: rows.filter(r=>["running","draft","warn","done"].includes(r.status.kind) && r.lastTouch!=="—").length,
    respondidos: rows.filter(r=>r.status.label.toLowerCase().includes("respond") || r.status.kind==="running" || r.status.label==="Calificado").length,
    calificados: rows.filter(r=>r.status.label==="Calificado").length,
    descartados: rows.filter(r=>r.status.kind==="danger").length,
  };

  let filtered = rows;
  if (tab==="hot") filtered = rows.filter(r=>r.scoreBand==="hot");
  else if (tab==="respondidos") filtered = rows.filter(r=>r.status.label.toLowerCase().includes("respond") || r.status.kind==="running" || r.status.label==="Calificado");
  else if (tab==="calificados") filtered = rows.filter(r=>r.status.label==="Calificado");
  else if (tab==="descartados") filtered = rows.filter(r=>r.status.kind==="danger");

  const toggle = (id) => {
    const n = new Set(sel);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSel(n);
  };
  const allSelected = filtered.length>0 && filtered.every(r => sel.has(r.id));
  const toggleAll = () => {
    if (allSelected) setSel(new Set());
    else setSel(new Set(filtered.map(r=>r.id)));
  };

  return (
    <>
      <window.Topbar crumbs={["CRM","Prospectos"]}
        actions={
          <>          </>
        }
      />
      <div className="page" style={{maxWidth:1400}} data-screen-label="Prospectos">
        <window.PageHead
          eyebrow="CRM"
          title="Prospectos"
          sub="Toda la gente que el agente ha encontrado, contactado o calificado. Aquí decides a quién darle seguimiento."
        >
          <button className="ghost-btn lg"><Icons.Upload size={14}/> Importar</button>
          <button className="ghost-btn lg"><Icons.Download size={14}/> Exportar</button>
          <button className="primary-btn lg" onClick={createProspect}><Icons.Plus size={14}/> Añadir prospecto</button>
        </window.PageHead>

        <div className="card">
          <div className="tabs">
            <div className={`tab ${tab==="todos"?"active":""}`} onClick={()=>setTab("todos")}>Todos <span className="tab-count">{totals.todos}</span></div>
            <div className={`tab ${tab==="hot"?"active":""}`} onClick={()=>setTab("hot")}>🔥 Hot <span className="tab-count">{totals.hot}</span></div>
            <div className={`tab ${tab==="respondidos"?"active":""}`} onClick={()=>setTab("respondidos")}>Respondieron <span className="tab-count">{totals.respondidos}</span></div>
            <div className={`tab ${tab==="calificados"?"active":""}`} onClick={()=>setTab("calificados")}>Calificados <span className="tab-count">{totals.calificados}</span></div>
            <div className={`tab ${tab==="descartados"?"active":""}`} onClick={()=>setTab("descartados")}>Descartados <span className="tab-count">{totals.descartados}</span></div>
          </div>

          <div className="toolbar">
            {sel.size > 0 ? (
              <>
                <span style={{fontSize:12.5, color:"var(--fg-1)", fontWeight:500}}>{sel.size} seleccionados</span>
                <button className="chip solid"><Icons.Send size={12}/> Enviar a campaña</button>
                <button className="chip solid"><Icons.Tag size={12}/> Etiquetar</button>
                <button className="chip solid"><Icons.User size={12}/> Asignar dueño</button>
                <button className="chip solid"><Icons.Download size={12}/> Exportar</button>
                <div style={{flex:1}}/>
                <button className="chip solid" onClick={()=>setSel(new Set())}><Icons.X size={12}/> Limpiar</button>
              </>
            ) : (
              <>
                <button className="chip solid"><Icons.Filter size={12}/> <em>Batch:</em> <strong>Todos</strong></button>
                <button className="chip solid"><em>Score:</em> <strong>Cualquiera</strong></button>
                <button className="chip solid"><em>Industria:</em> <strong>Todas</strong></button>
                <button className="chip solid"><em>País:</em> <strong>Todos</strong></button>
                <button className="chip solid"><em>Dueño:</em> <strong>Todos</strong></button>
                <button className="chip"><Icons.Plus size={12}/> Añadir filtro</button>
                <div style={{flex:1}}/>
                <button className="chip solid"><Icons.Sort size={12}/> <strong>Score ↓</strong></button>
              </>
            )}
          </div>

          <table className="dt">
            <thead>
              <tr>
                <th className="col-check"><window.Cbx on={allSelected} onClick={toggleAll}/></th>
                <th>Prospecto</th>
                <th>Empresa</th>
                <th>Score</th>
                <th>Estado</th>
                <th>Canales</th>
                <th>Batch</th>
                <th>Última actividad</th>
                <th>Dueño</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const logo = window.DATA.COMPANIES_LOGO[p.company] || {c:"#71717A"};
                return (
                  <tr key={p.id} className={sel.has(p.id)?"selected":""}>
                    <td className="col-check"><window.Cbx on={sel.has(p.id)} onClick={()=>toggle(p.id)}/></td>
                    <td>
                      <div className="row" style={{gap:10}}>
                        <window.Avatar initials={p.name.split(" ").map(x=>x[0]).slice(0,2).join("")} color="#27272A"/>
                        <div className="stack" style={{minWidth:0}}>
                          <div className="row-title truncate">{p.name}</div>
                          <div className="row-sub truncate">{p.title}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="row" style={{gap:8}}>
                        <span className="logo-tile" style={{background:logo.c, width:22, height:22, fontSize:12, flex:"0 0 22px"}}>{p.company[0]}</span>
                        <div className="stack" style={{minWidth:0}}>
                          <div style={{fontWeight:500, fontSize:12.5}}>{p.company}</div>
                          <div className="row-sub">{p.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td><window.ScoreBar value={p.score} band={p.scoreBand}/></td>
                    <td><window.StatusPill kind={p.status.kind} label={p.status.label}/></td>
                    <td><window.ChannelDots ch={p.channels}/></td>
                    <td><span className="mono" style={{fontSize:11.5, color:"var(--fg-2)"}}>{p.batch}</span></td>
                    <td style={{fontSize:12, color:"var(--fg-2)"}}>{p.lastTouch}</td>
                    <td><window.Avatar initials={p.owner.i} color={p.owner.c}/></td>
                    <td><button className="icon-btn" onClick={(e)=>e.stopPropagation()}><Icons.More size={14}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination">
            <span>{filtered.length ? `1–${filtered.length}` : "0"} de {rows.length}</span>
            <div style={{flex:1}}/>
            <span style={{marginRight:8}}>Página 1 / 1</span>
            <button className="pg-btn disabled"><Icons.ChevronLeft size={12}/></button>
            <button className="pg-btn disabled"><Icons.Chevron size={12}/></button>
          </div>
        </div>
      </div>
    </>
  );
};

window.ProspectosScreen = ProspectosScreen;
