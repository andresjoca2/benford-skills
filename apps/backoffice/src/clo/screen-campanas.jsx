// Campañas — top-level: batches table. Clicking a row opens batch detail.
const { useEffect: useEffectCa, useState: useStateCa } = React;

const CampanasScreen = ({ onOpen }) => {
  const [rows, setRows] = useStateCa(window.DATA.BATCHES);
  const [filter, setFilter] = useStateCa("todos");
  const filtered = filter === "todos" ? rows : rows.filter(r => r.status.kind === filter);

  useEffectCa(() => {
    let cancelled = false;
    window.BackofficeAPI?.campaigns()
      .then((campaigns) => {
        if (!cancelled && campaigns.length) {
          window.DATA.BATCHES = campaigns;
          setRows(campaigns);
        }
      })
      .catch((error) => console.warn("No se pudieron cargar campañas desde SQLite", error));
    return () => { cancelled = true; };
  }, []);

  const refreshCampaigns = () => {
    return window.BackofficeAPI?.campaigns()
      .then((campaigns) => {
        if (campaigns.length) {
          window.DATA.BATCHES = campaigns;
          setRows(campaigns);
        }
      })
      .catch((error) => console.warn("No se pudieron recargar campañas", error));
  };

  const createCampaign = () => {
    const name = window.prompt("Nombre de la campaña");
    if (!name?.trim()) return;

    window.BackofficeAPI?.createCampaign({ name })
      .then(() => refreshCampaigns())
      .catch((error) => console.warn("No se pudo crear campaña", error));
  };

  return (
    <>
      <window.Topbar crumbs={["CRM","Campañas"]}/>
      <div className="page" data-screen-label="Campañas">
        <window.PageHead
          eyebrow="CRM"
          title="Campañas"
          sub="Cada campaña agrupa el contexto, los prospectos y las corridas del agente. Abre una para entrenar su búsqueda, ángulo y contenido."
        >
          <button className="ghost-btn lg"><Icons.Download size={14}/> Exportar</button>
          <button className="primary-btn lg" onClick={createCampaign}><Icons.Plus size={14}/> Nueva campaña</button>
        </window.PageHead>

        <div className="card">
          <div className="toolbar">
            <button className={`chip ${filter==="todos"?"active":"solid"}`} onClick={()=>setFilter("todos")}>Todas <span className="num">{rows.length}</span></button>
            <button className={`chip ${filter==="running"?"active":"solid"}`} onClick={()=>setFilter("running")}>En curso <span className="num">{rows.filter(r=>r.status.kind==="running").length}</span></button>
            <button className={`chip ${filter==="done"?"active":"solid"}`} onClick={()=>setFilter("done")}>Completadas <span className="num">{rows.filter(r=>r.status.kind==="done").length}</span></button>
            <button className={`chip ${filter==="empty"?"active":"solid"}`} onClick={()=>setFilter("empty")}>Borradores <span className="num">{rows.filter(r=>r.status.kind==="empty").length}</span></button>
            <div style={{flex:1}}/>
            <button className="chip solid"><Icons.Database size={12}/> <strong>SQLite local</strong></button>
            <button className="chip solid"><Icons.Sort size={12}/> <em>Orden:</em> <strong>Reciente</strong></button>
            <span style={{fontSize:11.5, color:"var(--fg-4)", fontFamily:"var(--mono)"}}>{filtered.length} resultados</span>
          </div>
          <table className="dt">
            <thead>
              <tr>
                <th>Campaña</th>
                <th>Criterios</th>
                <th>Corrida</th>
                <th className="right">Total</th>
                <th>Enviados</th>
                <th>Estado</th>
                <th style={{width:120}}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} onClick={()=>onOpen && onOpen(b.id)} style={{cursor:"pointer"}}>
                  <td>
                    <div className="row-title">{b.name}</div>
                    <div className="row-sub">{b.id} · creado {b.created}</div>
                  </td>
                  <td style={{fontSize:12, color:"var(--fg-2)", maxWidth:240}}>{b.criteria}</td>
                  <td>
                    <div>{b.lastRun.split(" · ")[0]}</div>
                    <div className="row-sub">{b.lastRun.split(" · ")[1] || ""}</div>
                  </td>
                  <td className="right num">{b.total}</td>
                  <td style={{minWidth:140}}>
                    <div className="num" style={{fontSize:12.5}}>
                      <span style={{color:"var(--fg)"}}>{b.contacted}</span>
                      <span style={{color:"var(--fg-4)"}}> / {b.total}</span>
                    </div>
                    <div className={`mini-bar ${b.progressKind}`}><span style={{width: (b.total?Math.round((b.contacted/b.total)*100):0)+"%"}}/></div>
                  </td>
                  <td><window.StatusPill kind={b.status.kind} label={b.status.label}/></td>
                  <td>
                    <div style={{display:"flex", gap:4, justifyContent:"flex-end"}}>
                      <button className="ghost-btn sm" onClick={(e)=>{e.stopPropagation(); onOpen && onOpen(b.id);}}>
                        <Icons.Eye size={12}/> Abrir
                      </button>
                      <button className="icon-btn" onClick={(e)=>e.stopPropagation()}><Icons.More size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

window.CampanasScreen = CampanasScreen;
