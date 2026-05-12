// Búsqueda screen — wizard step 1. Full-width batches table, no activity panel.

const BusquedaScreen = () => {
  const [activeStep, setActiveStep] = React.useState("busqueda");

  return (
    <>
      <window.Topbar
        crumbs={["CRM","Entrenar agente","Búsqueda"]}
        actions={
          <>          </>
        }
      />
      <div className="page" data-screen-label="Búsqueda · Definir prospectos">
        <window.PageHead
          eyebrow="Entrenar agente · Paso 1 de 5"
          title="Definir qué prospectos buscar"
          sub="Define el contexto que Clo usará para encontrar y calificar prospectos. Puedes saltar entre pasos en cualquier momento — los cambios se guardan al instante."
        >
          <button className="primary-btn lg"><Icons.Plus size={14}/> Nuevo batch</button>
        </window.PageHead>

        <Stepper activeId={activeStep} doneIds={[]} onSelect={setActiveStep}/>

        <BatchesCard/>

        <div className="page-foot">
          <button className="ghost-btn lg">← Atrás</button>
          <div style={{flex:1}}/>
          <button className="ghost-btn lg">Guardar borrador</button>
          <button className="primary-btn lg">Buscar prospectos <Icons.Chevron size={13} sw={2}/></button>
        </div>
      </div>
    </>
  );
};

const BatchesCard = () => {
  const rows = window.DATA.BATCHES;
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Batches de búsqueda</div>
        </div>
        <div className="card-actions">
          <button className="ghost-btn"><Icons.Refresh size={13}/> Actualizar</button>
        </div>
      </div>
      <div className="toolbar">
        <button className="chip solid"><Icons.Filter size={12}/> <em>Estado:</em> <strong>Todos</strong></button>
        <button className="chip"><Icons.Plus size={12}/> Añadir filtro</button>
        <div style={{flex:1}}/>
        <button className="chip solid"><Icons.Sort size={12}/> <em>Orden:</em> <strong>Más reciente</strong></button>
        <span style={{fontSize:11.5, color:"var(--fg-4)", fontFamily:"var(--mono)"}}>{rows.length} resultados</span>
      </div>
      <table className="dt">
        <thead>
          <tr>
            <th>Batch</th>
            <th>Criterios</th>
            <th>Corrida</th>
            <th className="right">Total</th>
            <th>Enviados</th>
            <th>Estado</th>
            <th style={{width:96}}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(b => (
            <tr key={b.id}>
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
                  <button className="ghost-btn sm" onClick={(e)=>e.stopPropagation()}>
                    <Icons.Edit size={12}/> Editar
                  </button>
                  <button className="icon-btn" onClick={(e)=>e.stopPropagation()}>
                    <Icons.More size={14}/>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

window.BusquedaScreen = BusquedaScreen;
