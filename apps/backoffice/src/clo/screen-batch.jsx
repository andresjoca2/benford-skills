// Batch detail — internal stepper: Búsqueda, Empresas, Personas, Ángulo, Contenido.
const { useState: useStateBd } = React;

const BATCH_TABS = [
  { id:"busqueda",  label:"Búsqueda",  meta:"Contexto" },
  { id:"empresas",  label:"Empresas",  meta:"24 / 50" },
  { id:"personas",  label:"Personas",  meta:"81 / 100" },
  { id:"angulo",    label:"Ángulo",    meta:"v3" },
  { id:"contenido", label:"Contenido", meta:"4 plantillas" },
];

const BatchDetailScreen = ({ batchId, onBack }) => {
  const b = window.DATA.BATCHES.find(x => x.id === batchId) || window.DATA.BATCHES[0];
  const [tab, setTab] = useStateBd("busqueda");

  return (
    <>
      <window.Topbar crumbs={["CRM","Campañas", b.name]}
        actions={
          <>
            <button className="ghost-btn"><Icons.Eye size={13}/> Ver prospectos</button>
            <button className="primary-btn"><Icons.Play size={12}/> Lanzar corrida</button>
          </>
        }
      />
      <div className="page" data-screen-label={`Batch · ${b.name}`}>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:14}}>
          <button className="ghost-btn sm" onClick={onBack}><Icons.ChevronLeft size={12}/> Campañas</button>
          <span style={{color:"var(--fg-4)", fontSize:12, fontFamily:"var(--mono)"}}>/</span>
          <span style={{color:"var(--fg-3)", fontSize:12, fontFamily:"var(--mono)"}}>{b.id}</span>
        </div>

        <window.PageHead
          eyebrow="Campaña"
          title={b.name}
          sub={b.criteria}
        >
          <window.StatusPill kind={b.status.kind} label={b.status.label}/>
          <button className="ghost-btn lg"><Icons.Edit size={13}/> Editar</button>
          <button className="ghost-btn lg"><Icons.More size={14}/></button>
        </window.PageHead>

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-lbl">Total prospectos</div>
            <div className="kpi-val num">{b.total}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Contactados</div>
            <div className="kpi-val num">{b.contacted}<span className="kpi-unit"> / {b.total}</span></div>
            <div className={`mini-bar ${b.progressKind}`}><span style={{width: (b.total?Math.round((b.contacted/b.total)*100):0)+"%"}}/></div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Respuestas</div>
            <div className="kpi-val num" style={{color: b.replied>0?"var(--ok)":"var(--fg-3)"}}>{b.replied}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Calificados</div>
            <div className="kpi-val num">{b.qualified}</div>
          </div>
          <div className="kpi">
            <div className="kpi-lbl">Corridas</div>
            <div className="kpi-val num">{b.runs}</div>
            <div className="kpi-sub">última {b.lastRun.split(" · ")[0]}</div>
          </div>
        </div>

        <div className="stepper" role="tablist" style={{marginTop:18}}>
          {BATCH_TABS.map((s, i) => {
            const active = s.id === tab;
            return (
              <div
                key={s.id}
                className={`step ${active?"active":""}`}
                onClick={()=>setTab(s.id)}
                role="tab"
              >
                <div className="step-num">{i+1}</div>
                <div className="step-text">
                  <div className="step-label">{s.label}</div>
                  <div className="step-meta">{s.meta}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="batch-tab-body">
          {tab==="busqueda" && <BatchBusqueda b={b}/>}
          {tab==="empresas" && <BatchEmpresas/>}
          {tab==="personas" && <BatchPersonas/>}
          {tab==="angulo"   && <BatchAngulo/>}
          {tab==="contenido"&& <BatchContenido/>}
        </div>

        <div className="page-foot">
          <button className="ghost-btn lg" disabled={tab==="busqueda"} onClick={()=>{
            const i = BATCH_TABS.findIndex(x=>x.id===tab);
            if (i>0) setTab(BATCH_TABS[i-1].id);
          }}>← Atrás</button>
          <div style={{flex:1}}/>
          <button className="ghost-btn lg">Guardar borrador</button>
          <button className="primary-btn lg" onClick={()=>{
            const i = BATCH_TABS.findIndex(x=>x.id===tab);
            if (i<BATCH_TABS.length-1) setTab(BATCH_TABS[i+1].id);
          }}>Siguiente <Icons.Chevron size={13} sw={2}/></button>
        </div>
      </div>
    </>
  );
};

const BatchBusqueda = ({ b }) => (
  <div className="card">
    <div className="card-head">
      <div>
        <div className="card-title">Contexto de búsqueda</div>
      </div>
      <div className="card-actions">
        <button className="ghost-btn"><Icons.Sparkles size={13}/> Sugerir con IA</button>
        <button className="ghost-btn"><Icons.Edit size={13}/> Editar</button>
      </div>
    </div>
    <div style={{padding:"18px 20px"}}>
      <div className="kv kv-wide">
        <div className="k">Industria</div><div className="v">Fintech, Insurtech</div>
        <div className="k">Región</div><div className="v">LATAM · MX, CO, BR, AR, CL</div>
        <div className="k">Tamaño</div><div className="v">50–500 empleados</div>
        <div className="k">Etapa</div><div className="v">Seed · Series A · Series B</div>
        <div className="k">Cargo objetivo</div><div className="v">Founder · CEO · CTO · CFO</div>
        <div className="k">Señales</div>
        <div className="v">
          <span className="entity"><Icons.Hash size={11}/>contrató-finanzas-30d</span>{" "}
          <span className="entity"><Icons.Hash size={11}/>levantó-capital-90d</span>{" "}
          <span className="entity"><Icons.Hash size={11}/>tecnología-react</span>
        </div>
        <div className="k">Excluir</div>
        <div className="v" style={{color:"var(--fg-3)"}}>Competidores directos · ex-clientes en churn</div>
      </div>
    </div>
  </div>
);

// Seed deterministic review state from COMPANIES so it's stable across renders.
const _seedEmpresaState = (id) => {
  const n = id.split("").reduce((a,c)=>a+c.charCodeAt(0),0) % 10;
  if (n < 5) return "pendiente";
  if (n < 8) return "aceptada";
  return "rechazada";
};

// Generate stable fake people for each company
const PEOPLE_NAMES = [
  ["Andrés Martín","CEO & Co-founder"], ["Sofía Bermúdez","Head of Growth"],
  ["Lucas Pereira","CFO"], ["María Fernández","VP Finance"],
  ["Diego Acosta","Founder"], ["Camila Rojas","Director of Operations"],
  ["Tomás Vázquez","Co-founder"], ["Valentina López","Head of Finance"],
  ["Pablo Restrepo","CEO"], ["Renata Silva","Head of People"],
  ["Mateo Aguilar","Finance Director"], ["Ana Castillo","COO"],
  ["Sebastián Núñez","CEO"], ["Isabela Mora","VP Operations"],
  ["Joaquín Herrera","CTO"], ["Luciana Ortiz","Finance Manager"],
];
const _seedPeople = (companyId, count) => {
  const start = companyId.charCodeAt(companyId.length-1) % PEOPLE_NAMES.length;
  const out = [];
  for (let i=0; i<count; i++){
    const [name, title] = PEOPLE_NAMES[(start + i*3) % PEOPLE_NAMES.length];
    const seed = companyId.charCodeAt(0) + i*7;
    const score = 45 + (seed % 50);
    const reviewSeed = (seed + i) % 10;
    const review = reviewSeed < 6 ? "pendiente" : reviewSeed < 8 ? "aceptada" : "rechazada";
    out.push({
      id: `${companyId}-p${i}`, name, title, score,
      band: score >= 80 ? "hot" : score >= 60 ? "warm" : "cool",
      review,
      seniority: title.match(/CEO|CFO|CTO|COO|VP|Head|Director|Founder/) ? "Senior" : "Mid",
      tenure: `${1 + (seed % 7)} años`,
    });
  }
  return out;
};

const BatchEmpresas = () => {
  const seed = React.useMemo(()=>{
    return window.DATA.COMPANIES.slice(0,16).map(c => ({
      ...c,
      match: 60 + (c.id.charCodeAt(c.id.length-1) % 38),
      review: _seedEmpresaState(c.id),
      people: _seedPeople(c.id, 3 + (c.id.charCodeAt(c.id.length-1) % 4)),
    }));
  }, []);
  const [state, setState] = React.useState(seed);
  const [tab, setTab] = React.useState("todas");
  const [selectedId, setSelectedId] = React.useState(seed[0].id);

  const counts = {
    todas:     state.length,
    pendiente: state.filter(r=>r.review==="pendiente").length,
    aceptada:  state.filter(r=>r.review==="aceptada").length,
    rechazada: state.filter(r=>r.review==="rechazada").length,
  };
  const filtered = tab==="todas" ? state : state.filter(r=>r.review===tab);

  // Keep selection valid
  React.useEffect(()=>{
    if (filtered.length && !filtered.find(r=>r.id===selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [tab, filtered.length]);

  const selected = state.find(c=>c.id===selectedId) || filtered[0];

  const setCompanyReview = (id, val) => {
    setState(s => s.map(r => r.id===id ? {...r, review: val} : r));
  };
  const setPersonReview = (companyId, personId, val) => {
    setState(s => s.map(c => c.id !== companyId ? c : {
      ...c,
      people: c.people.map(p => p.id===personId ? {...p, review: val} : p)
    }));
  };

  // Move to next pending company
  const goNext = () => {
    const order = state.filter(c => c.review==="pendiente");
    const idx = order.findIndex(c=>c.id===selectedId);
    const next = order[idx+1] || order[0];
    if (next) setSelectedId(next.id);
  };

  return (
    <div>
      <div className="card-head" style={{padding:"0 0 14px"}}>
        <div className="row" style={{gap:14}}>
          <div className="tabs" style={{borderBottom:"none", padding:0}}>
            <div className={`tab ${tab==="todas"?"active":""}`}     onClick={()=>setTab("todas")}>Todas <span className="tab-count">{counts.todas}</span></div>
            <div className={`tab ${tab==="pendiente"?"active":""}`} onClick={()=>setTab("pendiente")}>Pendientes <span className="tab-count">{counts.pendiente}</span></div>
            <div className={`tab ${tab==="aceptada"?"active":""}`}  onClick={()=>setTab("aceptada")}>Aceptadas <span className="tab-count">{counts.aceptada}</span></div>
            <div className={`tab ${tab==="rechazada"?"active":""}`} onClick={()=>setTab("rechazada")}>Rechazadas <span className="tab-count">{counts.rechazada}</span></div>
          </div>
        </div>
        <div className="card-actions">
          <button className="ghost-btn"><Icons.Upload size={13}/> Importar CSV</button>
          <button className="ghost-btn"><Icons.Refresh size={13}/> Re-ejecutar búsqueda</button>
          <button className="primary-btn"><Icons.Plus size={13}/> Añadir empresa</button>
        </div>
      </div>

      <div className="empresas-split">
        {/* LEFT — company list */}
        <div className="card emp-list">
          <div className="card-head" style={{padding:"12px 14px"}}>
            <div className="card-title" style={{fontSize:13}}>Empresas · {filtered.length}</div>
          </div>
          <div style={{maxHeight:"calc(100vh - 340px)", overflowY:"auto"}}>
            {filtered.length===0 && (
              <div style={{textAlign:"center", color:"var(--fg-3)", padding:"40px 20px", fontSize:13}}>Sin empresas en este estado.</div>
            )}
            {filtered.map(c => {
              const logo = window.DATA.COMPANIES_LOGO[c.name] || {c:"#71717A"};
              const acceptedCount = c.people.filter(p=>p.review==="aceptada").length;
              return (
                <button
                  key={c.id}
                  className={`emp-item ${selectedId===c.id?"selected":""}`}
                  onClick={()=>setSelectedId(c.id)}
                >
                  <span className="logo-tile" style={{background:logo.c, width:32, height:32, fontSize:14, flexShrink:0}}>{c.name[0]}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:2}}>
                      <span className="row-title" style={{fontSize:13, fontWeight:500}}>{c.name}</span>
                      {c.review==="aceptada"  && <span className="emp-dot" style={{background:"var(--ok)"}}></span>}
                      {c.review==="rechazada" && <span className="emp-dot" style={{background:"var(--danger)"}}></span>}
                    </div>
                    <div style={{display:"flex", alignItems:"center", gap:8, fontSize:11.5, color:"var(--fg-3)"}}>
                      <span>{c.industry}</span>
                      <span style={{color:"var(--fg-4)"}}>·</span>
                      <span className="mono">{c.match}% match</span>
                    </div>
                    <div style={{display:"flex", alignItems:"center", gap:4, marginTop:5, fontSize:11, color:"var(--fg-3)"}}>
                      <Icons.Users size={10}/>
                      <span>{c.people.length} personas</span>
                      {acceptedCount>0 && <span style={{color:"var(--ok)", fontWeight:500}}>· {acceptedCount} elegidas</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — people in selected company */}
        {selected && (
          <div className="card emp-detail">
            <div className="card-head" style={{alignItems:"flex-start"}}>
              <div className="row" style={{gap:12, flex:1, minWidth:0}}>
                <span className="logo-tile" style={{background:(window.DATA.COMPANIES_LOGO[selected.name]||{c:"#71717A"}).c, width:40, height:40, fontSize:17, flexShrink:0}}>{selected.name[0]}</span>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:3}}>
                    <div className="card-title" style={{fontSize:16, fontWeight:600}}>{selected.name}</div>
                    {selected.review==="aceptada"  && <window.StatusPill kind="done"   label="Aceptada"/>}
                    {selected.review==="rechazada" && <window.StatusPill kind="danger" label="Rechazada"/>}
                    {selected.review==="pendiente" && <window.StatusPill kind="empty"  label="Pendiente"/>}
                  </div>
                  <div style={{display:"flex", gap:10, fontSize:12, color:"var(--fg-3)"}}>
                    <span>{selected.domain}</span>
                    <span style={{color:"var(--fg-4)"}}>·</span>
                    <span>{selected.industry}</span>
                    <span style={{color:"var(--fg-4)"}}>·</span>
                    <span className="mono">{selected.size}</span>
                    <span style={{color:"var(--fg-4)"}}>·</span>
                    <span className="mono">{selected.match}% match</span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                {selected.review!=="rechazada" && (
                  <button className="review-btn reject" onClick={()=>setCompanyReview(selected.id,"rechazada")}>
                    <Icons.X size={12} sw={2.4}/> Rechazar empresa
                  </button>
                )}
                {selected.review!=="aceptada" && (
                  <button className="review-btn accept" onClick={()=>setCompanyReview(selected.id,"aceptada")}>
                    <Icons.Check size={12} sw={2.4}/> Aceptar empresa
                  </button>
                )}
                <button className="primary-btn" onClick={goNext}>
                  Siguiente <Icons.ChevronRight size={12}/>
                </button>
              </div>
            </div>

            <div style={{padding:"12px 20px 6px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div style={{fontSize:12, color:"var(--fg-3)", fontFamily:"var(--mono)", letterSpacing:"0.06em", textTransform:"uppercase"}}>
                Personas encontradas · {selected.people.length}
              </div>
              <div style={{display:"flex", gap:10, fontSize:12, color:"var(--fg-3)"}}>
                <span><span style={{color:"var(--ok)", fontWeight:600}}>{selected.people.filter(p=>p.review==="aceptada").length}</span> aceptadas</span>
                <span><span style={{color:"var(--danger)", fontWeight:600}}>{selected.people.filter(p=>p.review==="rechazada").length}</span> rechazadas</span>
                <span><span style={{color:"var(--fg-1)", fontWeight:600}}>{selected.people.filter(p=>p.review==="pendiente").length}</span> pendientes</span>
              </div>
            </div>

            <table className="dt">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Seniority</th>
                  <th>Tenure</th>
                  <th className="right">Score</th>
                  <th>Estado</th>
                  <th style={{width:180}}>Revisión</th>
                </tr>
              </thead>
              <tbody>
                {selected.people.map(p => (
                  <tr key={p.id}>
                    <td><div className="row" style={{gap:10}}>
                      <window.Avatar initials={p.name.split(" ").map(x=>x[0]).slice(0,2).join("")} color="#27272A"/>
                      <div><div className="row-title">{p.name}</div><div className="row-sub">{p.title}</div></div>
                    </div></td>
                    <td style={{fontSize:12.5}}>{p.seniority}</td>
                    <td><span className="mono" style={{fontSize:11.5, color:"var(--fg-2)"}}>{p.tenure}</span></td>
                    <td className="right"><window.ScoreBar value={p.score} band={p.band}/></td>
                    <td>
                      {p.review==="aceptada"  && <window.StatusPill kind="done"   label="Elegida"/>}
                      {p.review==="rechazada" && <window.StatusPill kind="danger" label="Descartada"/>}
                      {p.review==="pendiente" && <window.StatusPill kind="empty"  label="Pendiente"/>}
                    </td>
                    <td>
                      <div style={{display:"flex", gap:4, justifyContent:"flex-end"}}>
                        {p.review!=="aceptada" && (
                          <button className="review-btn accept" onClick={()=>setPersonReview(selected.id, p.id,"aceptada")}>
                            <Icons.Check size={12} sw={2.4}/> Elegir
                          </button>
                        )}
                        {p.review!=="rechazada" && (
                          <button className="review-btn reject" onClick={()=>setPersonReview(selected.id, p.id,"rechazada")}>
                            <Icons.X size={12} sw={2.4}/> Descartar
                          </button>
                        )}
                        {p.review!=="pendiente" && (
                          <button className="ghost-btn sm" title="Volver a pendiente" onClick={()=>setPersonReview(selected.id, p.id,"pendiente")}>
                            <Icons.Refresh size={11}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const BatchPersonas = () => (
  <div className="card">
    <div className="card-head">
      <div><div className="card-title">Personas calificadas</div></div>
      <div className="card-actions">
        <button className="ghost-btn"><Icons.Refresh size={13}/> Re-calificar</button>
        <button className="primary-btn"><Icons.Send size={13}/> Enviar a campaña</button>
      </div>
    </div>
    <table className="dt">
      <thead>
        <tr>
          <th className="col-check"><window.Cbx/></th>
          <th>Persona</th>
          <th>Empresa</th>
          <th>Score</th>
          <th>Estado</th>
          <th>Última actividad</th>
        </tr>
      </thead>
      <tbody>
        {window.DATA.PROSPECTS.slice(0,8).map(p => (
          <tr key={p.id}>
            <td className="col-check"><window.Cbx/></td>
            <td><div className="row" style={{gap:10}}>
              <window.Avatar initials={p.name.split(" ").map(x=>x[0]).slice(0,2).join("")} color="#27272A"/>
              <div><div className="row-title">{p.name}</div><div className="row-sub">{p.title}</div></div>
            </div></td>
            <td style={{fontSize:12.5}}>{p.company}</td>
            <td><window.ScoreBar value={p.score} band={p.scoreBand}/></td>
            <td><window.StatusPill kind={p.status.kind} label={p.status.label}/></td>
            <td style={{fontSize:12, color:"var(--fg-2)"}}>{p.lastTouch}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ANGULOS = [
  { id:"founders-early-stage-fin-auto", title:"Founders early-stage · Automatización financiera", active:true, v:"v3", date:"hace 2 días",
    body:"Founders early-stage de fintech LATAM que están automatizando operaciones financieras (cobros, conciliación, facturación). Punto de dolor: la operación contable los frena para escalar. Promesa: cerrar el ciclo financiero sin contratar a 3 personas más.",
    tono:"Directo, técnico, sin BS", prueba:"Kavak · Bitso · Clip",
    cta:'"15 min para ver si te resuelvo el cierre"',
    metrics:{ apertura:42, respuesta:18, calificados:9 }
  },
  { id:"cfo-fintech-controles", title:"CFOs · Controles + auditoría continua", active:false, v:"v1", date:"hace 5 días",
    body:"CFOs de fintech con presión regulatoria que necesitan controles automáticos y trazabilidad fiscal en tiempo real. Foco en reducir riesgo y horas de auditoría.",
    tono:"Formal, orientado a riesgo", prueba:"Konfío · Stori · Albo",
    cta:'"30 min con tu equipo de finanzas"',
    metrics:{ apertura:31, respuesta:11, calificados:4 }
  },
  { id:"ops-conciliacion-multi-banco", title:"Ops · Conciliación multi-banco", active:false, v:"v2", date:"hace 9 días",
    body:"Heads of Ops manejando 5+ cuentas bancarias con conciliación manual. Promesa: conciliar mes en horas, no semanas.",
    tono:"Operativo, pragmático", prueba:"Rappi · Cornershop · Mercado Libre",
    cta:'"Te mando un Loom de 2 min antes de la llamada"',
    metrics:{ apertura:38, respuesta:14, calificados:6 }
  },
];

const BatchAngulo = () => {
  const [items, setItems] = React.useState(ANGULOS);
  const [selectedId, setSelectedId] = React.useState(ANGULOS[0].id);
  const [editing, setEditing] = React.useState(false);
  const selected = items.find(a => a.id === selectedId);
  const [draft, setDraft] = React.useState(selected);

  React.useEffect(()=>{ setDraft(selected); setEditing(false); }, [selectedId]);

  const accept = (id) => {
    setItems(arr => arr.map(a => ({...a, active: a.id===id})));
  };
  const saveEdit = () => {
    setItems(arr => arr.map(a => a.id===draft.id ? draft : a));
    setEditing(false);
  };
  const cancelEdit = () => { setDraft(selected); setEditing(false); };

  return (
    <div className="angulo-grid">
      <div className="card angulo-list">
        <div className="card-head">
          <div><div className="card-title">Ángulos</div></div>
          <div className="card-actions">
            <button className="primary-btn"><Icons.Plus size={12}/> Nuevo</button>
          </div>
        </div>
        <div>
          {items.map(a => (
            <button
              key={a.id}
              className={`angulo-item ${selectedId===a.id?"selected":""}`}
              onClick={()=>setSelectedId(a.id)}
            >
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                <span className="entity" style={{fontSize:11}}><Icons.Hash size={10}/>{a.id}</span>
                {a.active && <window.Tag>activo</window.Tag>}
              </div>
              <div style={{fontSize:13, fontWeight:500, color:"var(--fg)", marginBottom:4, textAlign:"left"}}>{a.title}</div>
              <div style={{display:"flex", gap:10, fontSize:11, color:"var(--fg-3)", fontFamily:"var(--mono)"}}>
                <span>{a.v}</span><span>·</span><span>{a.date}</span>
                <span style={{marginLeft:"auto", color: a.metrics.respuesta>=15?"var(--ok)":"var(--fg-3)"}}>
                  {a.metrics.respuesta}% resp
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card angulo-detail">
        <div className="card-head" style={{alignItems:"flex-start"}}>
          <div style={{flex:1, minWidth:0}}>
            {editing ? (
              <input
                className="form-input"
                style={{fontSize:16, fontWeight:600, height:38, width:"100%"}}
                value={draft.title}
                onChange={(e)=>setDraft({...draft, title:e.target.value})}
              />
            ) : (
              <>
                <div className="card-title" style={{fontSize:16, fontWeight:600, marginBottom:4}}>{selected.title}</div>
                <span className="entity" style={{fontSize:11.5}}><Icons.Hash size={11}/>{selected.id}</span>
              </>
            )}
          </div>
          <div className="card-actions">
            {!editing && !selected.active && (
              <button className="review-btn accept" style={{height:30, padding:"0 14px", fontSize:12.5}} onClick={()=>accept(selected.id)}>
                <Icons.Check size={13} sw={2.4}/> Aceptar como activo
              </button>
            )}
            {selected.active && !editing && (
              <window.Tag>activo en el batch</window.Tag>
            )}
            {!editing
              ? <button className="ghost-btn" onClick={()=>setEditing(true)}><Icons.Edit size={13}/> Modificar</button>
              : (<>
                  <button className="ghost-btn" onClick={cancelEdit}>Cancelar</button>
                  <button className="primary-btn" onClick={saveEdit}><Icons.Check size={12} sw={2.4}/> Guardar cambios</button>
                </>)}
          </div>
        </div>

        <div className="angulo-body">
          <div className="angulo-metrics">
            <div className="ang-m"><div className="ang-m-lbl">APERTURA</div><div className="ang-m-val num">{selected.metrics.apertura}%</div></div>
            <div className="ang-m"><div className="ang-m-lbl">RESPUESTA</div><div className="ang-m-val num" style={{color:"var(--ok)"}}>{selected.metrics.respuesta}%</div></div>
            <div className="ang-m"><div className="ang-m-lbl">CALIFICADOS</div><div className="ang-m-val num">{selected.metrics.calificados}</div></div>
            <div className="ang-m"><div className="ang-m-lbl">VERSIÓN</div><div className="ang-m-val num">{selected.v}</div></div>
          </div>

          <div className="ang-field">
            <div className="ang-label">Descripción del ángulo</div>
            {editing ? (
              <textarea
                className="ang-textarea"
                value={draft.body}
                onChange={(e)=>setDraft({...draft, body:e.target.value})}
                rows={5}
              />
            ) : (
              <p className="ang-text">{selected.body}</p>
            )}
          </div>

          <div className="ang-row">
            <div className="ang-field">
              <div className="ang-label">Tono</div>
              {editing
                ? <input className="form-input" value={draft.tono} onChange={(e)=>setDraft({...draft, tono:e.target.value})}/>
                : <div className="ang-text">{selected.tono}</div>}
            </div>
            <div className="ang-field">
              <div className="ang-label">Prueba social</div>
              {editing
                ? <input className="form-input" value={draft.prueba} onChange={(e)=>setDraft({...draft, prueba:e.target.value})}/>
                : <div className="ang-text">{selected.prueba}</div>}
            </div>
          </div>

          <div className="ang-field">
            <div className="ang-label">CTA</div>
            {editing
              ? <input className="form-input" value={draft.cta} onChange={(e)=>setDraft({...draft, cta:e.target.value})}/>
              : <div className="ang-text" style={{fontStyle:"italic"}}>{selected.cta}</div>}
          </div>

          <div className="ang-divider"/>

          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <Icons.Sparkles size={13}/>
            <span style={{fontSize:12.5, color:"var(--fg-2)"}}>¿No te convence? Pídele a Clo que proponga uno nuevo.</span>
            <div style={{flex:1}}/>
            <button className="ghost-btn"><Icons.Sparkles size={12}/> Generar variante</button>
            <button className="ghost-btn"><Icons.Eye size={12}/> Ver historial</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TPL = [
  {ch:"📧", name:"Email · Apertura", v:"v4", rate:"42%", role:"Primer toque"},
  {ch:"📧", name:"Email · Follow-up", v:"v2", rate:"28%", role:"Día 4"},
  {ch:"💼", name:"LinkedIn InMail", v:"v1", rate:"18%", role:"Día 7"},
  {ch:"📞", name:"Llamada · Script", v:"v3", rate:"—", role:"Si responde"},
];
const BatchContenido = () => (
  <div className="card">
    <div className="card-head">
      <div><div className="card-title">Plantillas de contenido</div></div>
      <div className="card-actions">
        <button className="ghost-btn"><Icons.Sparkles size={13}/> Generar con IA</button>
        <button className="primary-btn"><Icons.Plus size={13}/> Nueva plantilla</button>
      </div>
    </div>
    <table className="dt">
      <thead>
        <tr><th>Plantilla</th><th>Rol</th><th>Versión</th><th className="right">Tasa apertura/respuesta</th><th style={{width:120}}></th></tr>
      </thead>
      <tbody>
        {TPL.map((t,i)=>(
          <tr key={i}>
            <td><div className="row" style={{gap:10}}>
              <span style={{fontSize:18}}>{t.ch}</span>
              <div className="row-title">{t.name}</div>
            </div></td>
            <td style={{fontSize:12.5, color:"var(--fg-2)"}}>{t.role}</td>
            <td><span className="mono" style={{fontSize:11.5, color:"var(--fg-2)"}}>{t.v}</span></td>
            <td className="right num">{t.rate}</td>
            <td><div style={{display:"flex", gap:4, justifyContent:"flex-end"}}>
              <button className="ghost-btn sm"><Icons.Edit size={12}/> Editar</button>
              <button className="icon-btn"><Icons.More size={14}/></button>
            </div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

window.BatchDetailScreen = BatchDetailScreen;
