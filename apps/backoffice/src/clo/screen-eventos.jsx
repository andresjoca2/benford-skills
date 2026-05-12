// Eventos screen — timeline log with day groups + filters + live tail.
const { useEffect: useEffectE, useState: useStateE } = React;

const EVENT_TYPE_LABEL = {
  "corrida.start": "Corrida",
  "corrida.done": "Corrida",
  "run.completed": "Corrida",
  "people.found": "Personas",
  "prospect.sent": "Envío",
  "prospect.replied": "Respuesta",
  "prospect.qualified": "Calificado",
  "context.train": "Contexto",
  "angle.update": "Ángulo",
  "source.block": "Fuente",
  "template.dup": "Plantilla",
  "smtp.fail": "SMTP",
  "integration": "Integración",
};

const EventosScreen = () => {
  const [events, setEvents] = useStateE(window.DATA.EVENTS);
  const [src, setSrc] = useStateE("todos");
  const [sev, setSev] = useStateE("todos");

  useEffectE(() => {
    let cancelled = false;
    window.BackofficeAPI?.events()
      .then((items) => {
        if (!cancelled && items.length) {
          window.DATA.EVENTS = items;
          setEvents(items);
        }
      })
      .catch((error) => console.warn("No se pudieron cargar eventos desde SQLite", error));
    return () => { cancelled = true; };
  }, []);

  const filtered = events.filter(e => {
    if (src !== "todos" && e.source !== src) return false;
    if (sev !== "todos" && e.t !== sev) return false;
    return true;
  });

  // group by day
  const byDay = {};
  filtered.forEach(e => { (byDay[e.day] = byDay[e.day] || []).push(e); });

  return (
    <>
      <window.Topbar crumbs={["CRM","Entrenar agente","Eventos"]}
        actions={
          <>
            <span className="live"><span className="pulse"/>EN VIVO</span>          </>
        }
      />
      <div className="page" data-screen-label="Eventos">
        <window.PageHead
          eyebrow="CRM · Entrenar agente"
          title="Eventos"
          sub="Bitácora cronológica de todo lo que hace el agente, los prospectos y el sistema. Útil para auditar corridas y debuggear envíos."
        >
          <button className="ghost-btn lg"><Icons.Download size={14}/> Exportar CSV</button>
          <button className="ghost-btn lg"><Icons.Refresh size={14}/> Actualizar</button>
        </window.PageHead>

        <div className="card">
          <div className="toolbar">
            <button className={`chip ${src==="todos"?"active":"solid"}`} onClick={()=>setSrc("todos")}><Icons.Activity size={12}/> Todos</button>
            <button className={`chip ${src==="agente"?"active":"solid"}`} onClick={()=>setSrc("agente")}><Icons.Bot size={12}/> Agente</button>
            <button className={`chip ${src==="inbox"?"active":"solid"}`} onClick={()=>setSrc("inbox")}><Icons.Inbox size={12}/> Inbox</button>
            <button className={`chip ${src==="manual"?"active":"solid"}`} onClick={()=>setSrc("manual")}><Icons.User size={12}/> Manual</button>
            <button className={`chip ${src==="sistema"?"active":"solid"}`} onClick={()=>setSrc("sistema")}><Icons.Settings size={12}/> Sistema</button>
            <span style={{width:1, height:18, background:"var(--border)", margin:"0 4px"}}/>
            <button className={`chip ${sev==="todos"?"active":"solid"}`} onClick={()=>setSev("todos")}>Severidad: <strong>{sev==="todos"?"Todas":sev}</strong></button>
            <button className={`chip solid ${sev==="warn"?"active":""}`} onClick={()=>setSev(sev==="warn"?"todos":"warn")}><Icons.AlertTriangle size={12}/> Warn</button>
            <button className={`chip solid ${sev==="danger"?"active":""}`} onClick={()=>setSev(sev==="danger"?"todos":"danger")}><Icons.AlertTriangle size={12}/> Error</button>
            <div style={{flex:1}}/>
            <span style={{fontSize:11.5, color:"var(--fg-4)", fontFamily:"var(--mono)"}}>{filtered.length} eventos</span>
          </div>

          <table className="dt" style={{tableLayout:"fixed"}}>
            <colgroup>
              <col style={{width:140}}/>
              <col style={{width:110}}/>
              <col/>
              <col style={{width:110}}/>
              <col style={{width:90}}/>
            </colgroup>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Actor</th>
                <th>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(byDay).map(day => (
                <React.Fragment key={day}>
                  <tr className="day-row"><td colSpan={5}>— {day}</td></tr>
                  {byDay[day].map((e,i)=>(
                    <tr key={day+i}>
                      <td className="mono" style={{color:"var(--fg-3)", fontSize:12}}>{e.time}</td>
                      <td>
                        <span style={{display:"inline-flex", alignItems:"center", gap:6}}>
                          <span className={`tl-dot ${e.t}`} style={{margin:0}}/>
                          <span style={{fontSize:12, color:"var(--fg-2)", fontWeight:500}}>{EVENT_TYPE_LABEL[e.type] || e.type}</span>
                        </span>
                      </td>
                      <td>{e.text}</td>
                      <td style={{fontSize:12.5}}>{e.actor}</td>
                      <td><span className="tag">{e.source}</span></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span>1–{filtered.length} de {filtered.length}</span>
            <div style={{flex:1}}/>
            <button className="pg-btn disabled"><Icons.ChevronLeft size={12}/></button>
            <button className="pg-btn disabled"><Icons.Chevron size={12}/></button>
          </div>
        </div>
      </div>
    </>
  );
};

window.EventosScreen = EventosScreen;
