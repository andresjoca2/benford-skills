// Campañas — top-level: batches table. Clicking a row opens batch detail.
const { useEffect: useEffectCa, useState: useStateCa } = React;

const NEW_CAMPAIGN_DEFAULTS = {
  name: "",
  objective: "",
  industry: "",
  niche: "",
  countryRegion: "",
  companySize: "",
  positiveSignals: "",
  negativeSignals: "",
  searchMode: "companies",
  runBudgetDollars: "0",
  maxCompanies: "10",
  maxPeople: "0",
  maxRuntimeSeconds: "120",
  minScoreThreshold: "75",
};

const CampanasScreen = ({ onOpen }) => {
  const [rows, setRows] = useStateCa(window.DATA.BATCHES);
  const [filter, setFilter] = useStateCa("todos");
  const [creating, setCreating] = useStateCa(false);
  const [saving, setSaving] = useStateCa(false);
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

  const asNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };
  const formText = (data, key) => String(data.get(key) || "").trim();

  const openCreateCampaign = () => setCreating(true);
  const openCampaign = (id) => {
    if (onOpen) onOpen(id);
    else window.location.hash = `campaign/${encodeURIComponent(id)}`;
  };

  const createCampaign = () => {
    const form = document.getElementById("new-campaign-form");
    if (!form) return;
    const data = new FormData(form);
    const name = formText(data, "name");
    if (!name) return;

    setSaving(true);

    window.BackofficeAPI?.createCampaign({
      name,
      objective: formText(data, "objective"),
      industry: formText(data, "industry"),
      niche: formText(data, "niche"),
      countryRegion: formText(data, "countryRegion"),
      companySize: formText(data, "companySize"),
      positiveSignals: formText(data, "positiveSignals"),
      negativeSignals: formText(data, "negativeSignals"),
      searchMode: formText(data, "searchMode") || NEW_CAMPAIGN_DEFAULTS.searchMode,
      runBudgetCents: Math.round(asNumber(data.get("runBudgetDollars")) * 100),
      maxCompanies: Math.floor(asNumber(data.get("maxCompanies"))),
      maxPeople: Math.floor(asNumber(data.get("maxPeople"))),
      maxRuntimeSeconds: Math.floor(asNumber(data.get("maxRuntimeSeconds"))),
      minScoreThreshold: Math.min(100, Math.floor(asNumber(data.get("minScoreThreshold")))),
    })
      .then((campaign) => {
        setCreating(false);
        return refreshCampaigns().then(() => campaign);
      })
      .catch((error) => console.warn("No se pudo crear campaña", error))
      .finally(() => setSaving(false));
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
          <button className="primary-btn lg" onClick={openCreateCampaign}><Icons.Plus size={14}/> Nueva campaña</button>
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
                <tr key={b.id} onClick={()=>openCampaign(b.id)} style={{cursor:"pointer"}}>
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
                      <button className="ghost-btn sm" onClick={(e)=>{e.stopPropagation(); openCampaign(b.id);}}>
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
      {creating && (
        <div className="modal-overlay">
          <div className="modal" style={{width:"min(860px, calc(100vw - 36px))"}}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Nueva campaña</div>
                <div className="modal-sub">Define qué debe buscar el agente y cuáles son sus límites antes de correr.</div>
              </div>
              <button className="icon-btn" onClick={()=>setCreating(false)}><Icons.X size={14}/></button>
            </div>
            <form
              id="new-campaign-form"
              className="modal-body"
              style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:14}}
              onSubmit={(e)=>{ e.preventDefault(); createCampaign(); }}
            >
              <label className="form-row" style={{gridColumn:"1 / -1"}}>
                <span className="form-label">Nombre de la campaña</span>
                <input className="form-input" name="name" defaultValue={NEW_CAMPAIGN_DEFAULTS.name} autoFocus required/>
              </label>
              <label className="form-row" style={{gridColumn:"1 / -1"}}>
                <span className="form-label">Objetivo</span>
                <textarea className="ang-textarea" name="objective" rows={3} defaultValue={NEW_CAMPAIGN_DEFAULTS.objective} placeholder="Ej. encontrar empresas fintech con señales de expansión regional."/>
              </label>
              <label className="form-row">
                <span className="form-label">Industria</span>
                <input className="form-input" name="industry" defaultValue={NEW_CAMPAIGN_DEFAULTS.industry} placeholder="Fintech, SaaS, manufactura..."/>
              </label>
              <label className="form-row">
                <span className="form-label">Nicho</span>
                <input className="form-input" name="niche" defaultValue={NEW_CAMPAIGN_DEFAULTS.niche} placeholder="Seed/Series A B2B, CFOs, etc."/>
              </label>
              <label className="form-row">
                <span className="form-label">País / región</span>
                <input className="form-input" name="countryRegion" defaultValue={NEW_CAMPAIGN_DEFAULTS.countryRegion} placeholder="México, LATAM, US..."/>
              </label>
              <label className="form-row">
                <span className="form-label">Tamaño de empresa</span>
                <input className="form-input" name="companySize" defaultValue={NEW_CAMPAIGN_DEFAULTS.companySize} placeholder="11-200 empleados"/>
              </label>
              <label className="form-row">
                <span className="form-label">Modo de búsqueda</span>
                <select className="form-input" name="searchMode" defaultValue={NEW_CAMPAIGN_DEFAULTS.searchMode}>
                  <option value="companies">companies</option>
                  <option value="people">people</option>
                  <option value="companies_then_people">companies_then_people</option>
                </select>
              </label>
              <label className="form-row">
                <span className="form-label">Presupuesto por corrida ($)</span>
                <input className="form-input" name="runBudgetDollars" type="number" min="0" step="0.01" defaultValue={NEW_CAMPAIGN_DEFAULTS.runBudgetDollars}/>
              </label>
              <label className="form-row">
                <span className="form-label">Máx. empresas</span>
                <input className="form-input" name="maxCompanies" type="number" min="0" defaultValue={NEW_CAMPAIGN_DEFAULTS.maxCompanies}/>
              </label>
              <label className="form-row">
                <span className="form-label">Máx. personas</span>
                <input className="form-input" name="maxPeople" type="number" min="0" defaultValue={NEW_CAMPAIGN_DEFAULTS.maxPeople}/>
              </label>
              <label className="form-row">
                <span className="form-label">Timeout (segundos)</span>
                <input className="form-input" name="maxRuntimeSeconds" type="number" min="0" defaultValue={NEW_CAMPAIGN_DEFAULTS.maxRuntimeSeconds}/>
              </label>
              <label className="form-row">
                <span className="form-label">Score mínimo visible</span>
                <input className="form-input" name="minScoreThreshold" type="number" min="0" max="100" defaultValue={NEW_CAMPAIGN_DEFAULTS.minScoreThreshold}/>
              </label>
              <label className="form-row" style={{gridColumn:"1 / -1"}}>
                <span className="form-label">Señales positivas</span>
                <textarea className="ang-textarea" name="positiveSignals" rows={3} defaultValue={NEW_CAMPAIGN_DEFAULTS.positiveSignals} placeholder="Señales que deben aumentar el score."/>
              </label>
              <label className="form-row" style={{gridColumn:"1 / -1"}}>
                <span className="form-label">Señales negativas</span>
                <textarea className="ang-textarea" name="negativeSignals" rows={3} defaultValue={NEW_CAMPAIGN_DEFAULTS.negativeSignals} placeholder="Señales que deben descartar o bajar prioridad."/>
              </label>
            </form>
            <div className="modal-foot">
              <button className="ghost-btn lg" onClick={()=>setCreating(false)} disabled={saving}>Cancelar</button>
              <button className="primary-btn lg" onClick={createCampaign} disabled={saving}>
                <Icons.Plus size={13}/> {saving ? "Creando" : "Crear campaña"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

window.CampanasScreen = CampanasScreen;
