// Batches screen — full page with split: list + detail panel.
const { useState: useStateB } = React;

const BatchesScreen = () => {
  const rows = window.DATA.BATCHES;
  const [sel, setSel] = useStateB(rows[0].id);
  const [filter, setFilter] = useStateB("todos");
  const selected = rows.find(r => r.id === sel) || rows[0];

  const filtered = filter === "todos" ? rows : rows.filter(r => r.status.kind === filter);

  return (
    <>
      <window.Topbar crumbs={["CRM","Entrenar agente","Batches"]}
        actions={
          <>          </>
        }
      />
      <div className="page" style={{maxWidth:1320}} data-screen-label="Batches">
        <window.PageHead
          eyebrow="CRM · Entrenar agente"
          title="Batches"
          sub="Cada batch agrupa el contexto, los prospectos y las corridas del agente. Filtra, inspecciona y lanza nuevas corridas."
        >
          <button className="ghost-btn lg"><Icons.Download size={14}/> Exportar</button>
          <button className="primary-btn lg"><Icons.Plus size={14}/> Nuevo batch</button>
        </window.PageHead>

        <div className="split">
          <div className="card">
            <div className="toolbar">
              <button className={`chip ${filter==="todos"?"active":"solid"}`} onClick={()=>setFilter("todos")}>Todos <span className="num">{rows.length}</span></button>
              <button className={`chip ${filter==="running"?"active":"solid"}`} onClick={()=>setFilter("running")}>En curso <span className="num">{rows.filter(r=>r.status.kind==="running").length}</span></button>
              <button className={`chip ${filter==="done"?"active":"solid"}`} onClick={()=>setFilter("done")}>Completados <span className="num">{rows.filter(r=>r.status.kind==="done").length}</span></button>
              <button className={`chip ${filter==="empty"?"active":"solid"}`} onClick={()=>setFilter("empty")}>Borradores <span className="num">{rows.filter(r=>r.status.kind==="empty").length}</span></button>
              <div style={{flex:1}}/>
              <button className="chip solid"><Icons.Sort size={12}/> <em>Orden:</em> <strong>Reciente</strong></button>
            </div>
            <table className="dt">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th className="right">Prospectos</th>
                  <th>Estado</th>
                  <th>Dueño</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className={sel===b.id?"selected":""} onClick={()=>setSel(b.id)}>
                    <td>
                      <div className="row-title">{b.name}</div>
                      <div className="row-sub">{b.criteria}</div>
                    </td>
                    <td className="right">
                      <div className="num" style={{fontSize:13}}>{b.contacted}<span style={{color:"var(--fg-4)"}}> / {b.total}</span></div>
                      <div className={`mini-bar ${b.progressKind}`} style={{marginLeft:"auto"}}><span style={{width: (b.total?Math.round((b.contacted/b.total)*100):0)+"%"}}/></div>
                    </td>
                    <td><window.StatusPill kind={b.status.kind} label={b.status.label}/></td>
                    <td><window.Avatar initials={b.owner.initials} color={b.owner.color}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card split-detail">
            <div className="detail-head">
              <div className="detail-eyebrow">{selected.id}</div>
              <h2 className="detail-title">{selected.name}</h2>
              <div className="detail-meta">
                <window.StatusPill kind={selected.status.kind} label={selected.status.label}/>
                <span className="sep">·</span>
                <span>{selected.runs} corridas</span>
                <span className="sep">·</span>
                <span>creado {selected.created}</span>
              </div>
              <div style={{display:"flex", gap:6, marginTop:14}}>
                <button className="primary-btn"><Icons.Play size={12}/> Lanzar corrida</button>
                <button className="ghost-btn"><Icons.Edit size={13}/> Editar contexto</button>
                <button className="ghost-btn"><Icons.Eye size={13}/> Ver prospectos</button>
                <div style={{flex:1}}/>
                <button className="icon-btn"><Icons.More size={14}/></button>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-cell">
                <div className="lbl">Contactados</div>
                <div className="val">{selected.contacted}<span className="unit">/ {selected.total}</span></div>
              </div>
              <div className="stat-cell">
                <div className="lbl">Respuestas</div>
                <div className="val">{selected.replied}</div>
              </div>
              <div className="stat-cell">
                <div className="lbl">Calificados</div>
                <div className="val">{selected.qualified}</div>
              </div>
            </div>

            <div className="detail-body">
              <div className="detail-section">
                <div className="detail-label">Criterios</div>
                <div className="kv">
                  <div className="k">Industria</div><div className="v">{selected.criteria.split(" · ")[0] || "—"}</div>
                  <div className="k">Región</div><div className="v">{selected.criteria.split(" · ")[1] || "—"}</div>
                  <div className="k">Tamaño</div><div className="v">{selected.criteria.split(" · ")[2] || "—"}</div>
                  <div className="k">Cargo</div><div className="v">{selected.criteria.split(" · ")[3] || "—"}</div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Última corrida</div>
                <div style={{display:"flex", alignItems:"center", gap:10, fontSize:12.5}}>
                  <span className="mono" style={{color:"var(--fg-2)"}}>{selected.lastRun}</span>
                  <span style={{flex:1}}/>
                  <button className="ghost-btn sm"><Icons.ChevronLeft size={12}/></button>
                  <span className="mono" style={{color:"var(--fg-3)"}}>{selected.runs} de {selected.runs}</span>
                  <button className="ghost-btn sm"><Icons.Chevron size={12}/></button>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Actividad del batch</div>
                <div className="timeline" style={{marginLeft:-18, marginRight:-18}}>
                  {window.DATA.EVENTS.slice(0,5).map((x,i)=>(
                    <div className="tl-item" key={i}>
                      <div className={`tl-dot ${x.t}`}/>
                      <div className="tl-text">{x.text}</div>
                      <div className="tl-time">{x.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

window.BatchesScreen = BatchesScreen;
