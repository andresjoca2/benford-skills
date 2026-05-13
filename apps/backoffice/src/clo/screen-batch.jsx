// Campaign detail — internal stepper: Búsqueda, Empresas, Personas, Ángulo, Contenido.
const { useEffect: useEffectBd, useState: useStateBd } = React;

const BATCH_TABS = [
  { id:"busqueda",  label:"Búsqueda",  meta:"Contexto" },
  { id:"empresas",  label:"Empresas",  meta:"24 / 50" },
  { id:"personas",  label:"Personas",  meta:"81 / 100" },
  { id:"angulo",    label:"Ángulo",    meta:"v3" },
  { id:"contenido", label:"Contenido", meta:"4 plantillas" },
];

const companyPrefetchSize = (brief) => {
  const configured = Number(brief?.maxCompanies || 10);
  const batch = Number.isFinite(configured) && configured > 0 ? configured : 10;
  return Math.min(20, Math.max(10, Math.floor(batch)));
};

const BatchDetailScreen = ({ batchId, onBack }) => {
  const fallback = window.DATA.BATCHES.find(x => x.id === batchId) || window.DATA.BATCHES[0];
  const [detail, setDetail] = useStateBd(fallback);
  const [companies, setCompanies] = useStateBd(null);
  const [people, setPeople] = useStateBd(null);
  const [tab, setTab] = useStateBd("busqueda");
  const [runBusy, setRunBusy] = useStateBd(false);
  const [autoSearchOpen, setAutoSearchOpen] = useStateBd(false);
  const [notice, setNotice] = useStateBd("");
  const b = detail || fallback;
  const campaignRuns = Array.isArray(b.runs) ? b.runs : [];
  const runCount = Array.isArray(b.runs) ? b.runs.length : (b.runs || 0);

  const fetchDetail = () => {
    if (!batchId) return Promise.resolve();
    return Promise.all([
      window.BackofficeAPI?.campaign(batchId),
      window.BackofficeAPI?.campaignCandidates(batchId),
      window.BackofficeAPI?.campaignPeople(batchId),
    ])
      .then(([campaign, campaignCompanies, campaignPeople]) => {
        if (campaign) setDetail(campaign);
        setCompanies(campaignCompanies || []);
        setPeople(campaignPeople || []);
      })
      .catch((error) => console.warn("No se pudo cargar detalle de campaign", error));
  };

  const loadDetail = () => {
    let cancelled = false;
    if (!batchId) return () => {};

    Promise.all([
      window.BackofficeAPI?.campaign(batchId),
      window.BackofficeAPI?.campaignCandidates(batchId),
      window.BackofficeAPI?.campaignPeople(batchId),
    ])
      .then(([campaign, campaignCompanies, campaignPeople]) => {
        if (cancelled) return;
        if (campaign) setDetail(campaign);
        setCompanies(campaignCompanies || []);
        setPeople(campaignPeople || []);
      })
      .catch((error) => console.warn("No se pudo cargar detalle de campaign", error));

    return () => { cancelled = true; };
  };

  useEffectBd(() => {
    return loadDetail();
  }, [batchId]);

  const runStateKey = campaignRuns.map((run) => `${run.id}:${run.status}:${run.companyCandidates ?? 0}`).join("|");
  const activeRun = campaignRuns.find((run) => ["queued", "running"].includes(run.status));

  useEffectBd(() => {
    if (!batchId) return () => {};
    const shouldPoll = runBusy || Boolean(activeRun);
    if (!shouldPoll) return () => {};

    const timer = setInterval(() => {
      if (document.activeElement?.closest?.("[data-review-feedback]")) return;
      fetchDetail();
    }, 1500);
    return () => clearInterval(timer);
  }, [batchId, runBusy, runStateKey]);

  const launchRun = (options = {}) => {
    if (!batchId || runBusy) return;
    setRunBusy(true);
    setNotice("");
    window.BackofficeAPI?.createCampaignRun(batchId, options)
      .then((result) => fetchDetail().then(() => result))
      .then((result) => {
        if (result?.revealed) {
          setNotice(`${result.revealed} empresas cacheadas listas para revisar.`);
        } else {
          setNotice("Corrida encolada.");
        }
      })
      .catch((error) => {
        console.warn("No se pudo lanzar corrida", error);
        setNotice("No se pudo lanzar la corrida. Revisa si ya hay una activa.");
      })
      .finally(() => setRunBusy(false));
  };

  const tabDefs = BATCH_TABS.map((item) => {
    if (item.id === "empresas") return {...item, meta: `${(companies || []).length} candidatas`};
    if (item.id === "personas") return {...item, meta: `${(people || []).length} candidatas`};
    return item;
  });

  return (
    <>
      <window.Topbar crumbs={["CRM","Campañas", b.name]}/>
      <div className="page" data-screen-label={`Campaign · ${b.name}`}>
        {notice && (
          <div className="inline-alert" style={{marginBottom:12}}>
            {notice}
          </div>
        )}
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
            <div className="kpi-val num">{runCount}</div>
            <div className="kpi-sub">última {b.lastRun.split(" · ")[0]}</div>
          </div>
        </div>

        <div className="stepper" role="tablist" style={{marginTop:18}}>
          {tabDefs.map((s, i) => {
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
          {tab==="busqueda" && <BatchBusqueda b={b} onSaved={(campaign)=>setDetail(campaign)}/>}
          {tab==="empresas" && (
            <>
              <BatchEmpresas
                companies={companies}
                brief={b.brief}
                activeRun={activeRun}
                hiddenCount={companies?.hiddenCount || 0}
                onRerun={()=>launchRun({ replaceQueuedRun: true, revealCachedCompanies: true, reviewBatchSize: 10, prefetchCompanies: companyPrefetchSize(b.brief) })}
                rerunBusy={runBusy}
                onOpenAutoSearch={()=>setAutoSearchOpen(true)}
              />
              <ProcessLogs runs={campaignRuns} process="companies"/>
            </>
          )}
          {tab==="personas" && (
            <>
              <BatchPersonas people={people}/>
              <ProcessLogs runs={campaignRuns} process="people"/>
            </>
          )}
          {tab==="angulo"   && <BatchAngulo/>}
          {tab==="contenido"&& <BatchContenido/>}
        </div>

        <div className="page-foot">
          <button className="ghost-btn lg" disabled={tab==="busqueda"} onClick={()=>{
            const i = tabDefs.findIndex(x=>x.id===tab);
            if (i>0) setTab(tabDefs[i-1].id);
          }}>← Atrás</button>
          <div style={{flex:1}}/>
          <button className="ghost-btn lg">Guardar borrador</button>
          <button className="primary-btn lg" onClick={()=>{
            const i = tabDefs.findIndex(x=>x.id===tab);
            if (i<tabDefs.length-1) setTab(tabDefs[i+1].id);
          }}>Siguiente <Icons.Chevron size={13} sw={2}/></button>
        </div>
      </div>
      {autoSearchOpen && (
        <AutoSearchModal
          brief={b.brief}
          onClose={()=>setAutoSearchOpen(false)}
          onSave={()=>{
            setAutoSearchOpen(false);
            setNotice("Configuración de búsqueda automática guardada solo en frontend. Falta backend/worker para activarla.");
          }}
        />
      )}
    </>
  );
};

const emptyBrief = {
  objective: "",
  industry: "",
  niche: "",
  countryRegion: "",
  companySize: "",
  positiveSignals: "",
  negativeSignals: "",
  searchMode: "companies",
  runBudgetCents: 0,
  maxCompanies: 10,
  maxPeople: 0,
  maxRuntimeSeconds: 120,
  minScoreThreshold: 75,
};

const COMPANY_LOG_SKILLS = ["find_companies", "research_company", "score_company"];
const PEOPLE_LOG_SKILLS = ["find_people", "research_person", "score_person", "draft_outreach"];
const COMPANY_LOG_MISSIONS = ["companies", "companies_then_people", "find_companies"];
const PEOPLE_LOG_MISSIONS = ["people", "find_people"];

const runLogSkills = (run) => {
  const jobs = Array.isArray(run?.jobs) ? run.jobs : [];
  return [...new Set(jobs.map((job) => job.skill).filter(Boolean))];
};

const runMatchesProcess = (run, process) => {
  const skills = runLogSkills(run);
  if (process === "companies") {
    return skills.some((skill) => COMPANY_LOG_SKILLS.includes(skill)) || COMPANY_LOG_MISSIONS.includes(run?.mission);
  }
  return skills.some((skill) => PEOPLE_LOG_SKILLS.includes(skill)) || PEOPLE_LOG_MISSIONS.includes(run?.mission);
};

const runStatusKind = (status) => {
  if (status === "succeeded") return "done";
  if (status === "failed" || status === "cancelled") return "danger";
  if (status === "running") return "running";
  if (status === "queued") return "warn";
  return "empty";
};

const runDateLabel = (run) => run.finishedAt || run.startedAt || run.created || "-";

const ProcessLogs = ({ runs, process }) => {
  const [open, setOpen] = React.useState(true);
  const filteredRuns = (Array.isArray(runs) ? runs : []).filter((run) => runMatchesProcess(run, process));
  const title = process === "companies" ? "Corridas de empresas" : "Corridas de personas";

  return (
    <div className="card" style={{marginTop:14}}>
      <div className="card-head">
        <div>
          <div className="card-title">Logs</div>
          <div style={{fontSize:12, color:"var(--fg-3)", marginTop:4}}>{title}</div>
        </div>
        <div className="card-actions">
          <span className="entity"><Icons.Activity size={11}/>{filteredRuns.length} corridas</span>
          <button className="ghost-btn sm" onClick={()=>setOpen(!open)}>
            {open ? <Icons.ChevronDown size={12}/> : <Icons.Chevron size={12}/>}
            {open ? "Cerrar" : "Abrir"}
          </button>
        </div>
      </div>
      {open && (
        <div style={{padding:"0 20px 16px"}}>
          {filteredRuns.length === 0 && (
            <div style={{padding:"18px 0", color:"var(--fg-3)", fontSize:13}}>Sin logs todavía.</div>
          )}
          {filteredRuns.length > 0 && (
            <table className="dt">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Skills</th>
                  <th>Estado</th>
                  <th className="right">Candidatos</th>
                  <th>Última actividad</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run) => {
                  const skills = runLogSkills(run);
                  return (
                    <tr key={run.id}>
                      <td><span className="mono" style={{fontSize:11.5}}>{run.id}</span></td>
                      <td>{skills.length ? skills.join(", ") : run.mission}</td>
                      <td><window.StatusPill kind={runStatusKind(run.status)} label={run.status}/></td>
                      <td className="right num">{process === "companies" ? (run.companyCandidates ?? 0) : "-"}</td>
                      <td style={{fontSize:12, color:"var(--fg-2)"}}>{runDateLabel(run)}</td>
                      <td style={{fontSize:12, color:"var(--danger)"}}>{run.error || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const BatchBusqueda = ({ b, onSaved }) => {
  const brief = b.brief || {};
  const runs = Array.isArray(b.runs) ? b.runs : [];
  const budget = brief.runBudgetCents ? `$${(brief.runBudgetCents / 100).toFixed(2)}` : "Sin presupuesto";
  const formId = `campaign-brief-form-${b.id}`;
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [canceling, setCanceling] = React.useState("");

  React.useEffect(() => {
    setEditing(false);
    setSaving(false);
  }, [b.id]);

  const asNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };
  const formText = (data, key) => String(data.get(key) || "").trim();
  const saveBrief = () => {
    const form = document.getElementById(formId);
    if (!form) return;
    const data = new FormData(form);

    setSaving(true);
    window.BackofficeAPI?.updateCampaignBrief(b.id, {
      objective: formText(data, "objective"),
      industry: formText(data, "industry"),
      niche: formText(data, "niche"),
      countryRegion: formText(data, "countryRegion"),
      companySize: formText(data, "companySize"),
      positiveSignals: formText(data, "positiveSignals"),
      negativeSignals: formText(data, "negativeSignals"),
      searchMode: formText(data, "searchMode") || emptyBrief.searchMode,
      runBudgetCents: Math.round(asNumber(data.get("runBudgetDollars")) * 100),
      maxCompanies: Math.floor(asNumber(data.get("maxCompanies"))),
      maxPeople: Math.floor(asNumber(data.get("maxPeople"))),
      maxRuntimeSeconds: Math.floor(asNumber(data.get("maxRuntimeSeconds"))),
      minScoreThreshold: Math.min(100, Math.floor(asNumber(data.get("minScoreThreshold")))),
    })
      .then((campaign) => {
        if (campaign) {
          onSaved && onSaved(campaign);
          const rows = window.DATA.BATCHES.map((item) => item.id === campaign.id ? campaign : item);
          window.DATA.BATCHES = rows;
        }
        setEditing(false);
      })
      .catch((error) => console.warn("No se pudo guardar el brief", error))
      .finally(() => setSaving(false));
  };
  const cancelRun = (runId) => {
    if (!runId || canceling) return;
    setCanceling(runId);
    window.BackofficeAPI?.cancelRun(runId)
      .then(() => window.BackofficeAPI?.campaign(b.id))
      .then((campaign) => {
        if (campaign) onSaved && onSaved(campaign);
      })
      .catch((error) => console.warn("No se pudo cancelar corrida", error))
      .finally(() => setCanceling(""));
  };

  if (editing) {
    const draft = {...emptyBrief, ...brief, runBudgetDollars: ((brief.runBudgetCents || 0) / 100).toString()};
    return (
      <div className="card">
        <div className="card-head">
          <div><div className="card-title">Editar contexto de búsqueda</div></div>
          <div className="card-actions">
            <button className="ghost-btn" onClick={()=>setEditing(false)} disabled={saving}>Cancelar</button>
            <button className="primary-btn" onClick={saveBrief} disabled={saving}>
              <Icons.Check size={12} sw={2.4}/> {saving ? "Guardando" : "Guardar brief"}
            </button>
          </div>
        </div>
        <form
          id={formId}
          style={{padding:"18px 20px", display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:14}}
          onSubmit={(e)=>{ e.preventDefault(); saveBrief(); }}
        >
          <label className="form-row" style={{gridColumn:"1 / -1"}}>
            <span className="form-label">Objetivo</span>
            <textarea className="ang-textarea" name="objective" rows={3} defaultValue={draft.objective}/>
          </label>
          <label className="form-row">
            <span className="form-label">Industria</span>
            <input className="form-input" name="industry" defaultValue={draft.industry}/>
          </label>
          <label className="form-row">
            <span className="form-label">Nicho</span>
            <input className="form-input" name="niche" defaultValue={draft.niche}/>
          </label>
          <label className="form-row">
            <span className="form-label">País / región</span>
            <input className="form-input" name="countryRegion" defaultValue={draft.countryRegion}/>
          </label>
          <label className="form-row">
            <span className="form-label">Tamaño de empresa</span>
            <input className="form-input" name="companySize" defaultValue={draft.companySize}/>
          </label>
          <label className="form-row">
            <span className="form-label">Modo de búsqueda</span>
            <select className="form-input" name="searchMode" defaultValue={draft.searchMode}>
              <option value="companies">companies</option>
              <option value="people">people</option>
              <option value="companies_then_people">companies_then_people</option>
            </select>
          </label>
          <label className="form-row">
            <span className="form-label">Presupuesto por corrida ($)</span>
            <input className="form-input" name="runBudgetDollars" type="number" min="0" step="0.01" defaultValue={draft.runBudgetDollars}/>
          </label>
          <label className="form-row">
            <span className="form-label">Máx. empresas</span>
            <input className="form-input" name="maxCompanies" type="number" min="0" defaultValue={draft.maxCompanies}/>
          </label>
          <label className="form-row">
            <span className="form-label">Máx. personas</span>
            <input className="form-input" name="maxPeople" type="number" min="0" defaultValue={draft.maxPeople}/>
          </label>
          <label className="form-row">
            <span className="form-label">Timeout (segundos)</span>
            <input className="form-input" name="maxRuntimeSeconds" type="number" min="0" defaultValue={draft.maxRuntimeSeconds}/>
          </label>
          <label className="form-row">
            <span className="form-label">Score mínimo visible</span>
            <input className="form-input" name="minScoreThreshold" type="number" min="0" max="100" defaultValue={draft.minScoreThreshold}/>
          </label>
          <label className="form-row" style={{gridColumn:"1 / -1"}}>
            <span className="form-label">Señales positivas</span>
            <textarea className="ang-textarea" name="positiveSignals" rows={3} defaultValue={draft.positiveSignals}/>
          </label>
          <label className="form-row" style={{gridColumn:"1 / -1"}}>
            <span className="form-label">Señales negativas</span>
            <textarea className="ang-textarea" name="negativeSignals" rows={3} defaultValue={draft.negativeSignals}/>
          </label>
        </form>
      </div>
    );
  }

  return (
    <>
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Contexto de búsqueda</div>
        </div>
        <div className="card-actions">
          <button className="ghost-btn" onClick={()=>setEditing(true)}><Icons.Edit size={13}/> Editar</button>
        </div>
      </div>
      <div style={{padding:"18px 20px"}}>
        <div className="kv kv-wide">
          <div className="k">Objetivo</div><div className="v">{brief.objective || b.criteria || "-"}</div>
          <div className="k">Industria</div><div className="v">{brief.industry || "-"}</div>
          <div className="k">Nicho</div><div className="v">{brief.niche || "-"}</div>
          <div className="k">País / región</div><div className="v">{brief.countryRegion || "-"}</div>
          <div className="k">Tamaño</div><div className="v">{brief.companySize || "-"}</div>
          <div className="k">Modo</div><div className="v"><span className="entity"><Icons.Search size={11}/>{brief.searchMode || "companies"}</span></div>
          <div className="k">Límites</div>
          <div className="v">
            <span className="entity"><Icons.Database size={11}/>{budget}</span>{" "}
            <span className="entity"><Icons.Building size={11}/>{brief.maxCompanies ?? 0} empresas</span>{" "}
            <span className="entity"><Icons.Users size={11}/>{brief.maxPeople ?? 0} personas</span>{" "}
            <span className="entity"><Icons.Clock size={11}/>{brief.maxRuntimeSeconds ?? 0}s</span>
            <span className="entity"><Icons.Filter size={11}/>{brief.minScoreThreshold ?? 75}+ score</span>
          </div>
          <div className="k">Señales positivas</div><div className="v">{brief.positiveSignals || "-"}</div>
          <div className="k">Señales negativas</div><div className="v" style={{color:"var(--fg-3)"}}>{brief.negativeSignals || "-"}</div>
        </div>
      </div>
    </div>
    <div className="card" style={{marginTop:14}}>
      <div className="card-head">
        <div><div className="card-title">Corridas</div></div>
      </div>
      <div style={{padding:"0 20px 16px"}}>
        {runs.length === 0 && (
          <div style={{padding:"18px 0", color:"var(--fg-3)", fontSize:13}}>Sin corridas todavía.</div>
        )}
        {runs.length > 0 && (
          <table className="dt">
            <thead>
              <tr>
                <th>ID</th>
                <th>Misión</th>
                <th>Estado</th>
                <th className="right">Empresas</th>
                <th>Creada</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td><span className="mono" style={{fontSize:11.5}}>{run.id}</span></td>
                  <td>{run.mission}</td>
                  <td><span className="entity">{run.status}</span></td>
                  <td className="right num">{run.companyCandidates ?? 0}</td>
                  <td style={{fontSize:12, color:"var(--fg-2)"}}>{run.created}</td>
                  <td style={{textAlign:"right"}}>
                    {["queued", "running"].includes(run.status) && (
                      <button className="ghost-btn sm" onClick={()=>cancelRun(run.id)} disabled={canceling===run.id}>
                        <Icons.X size={11}/> {canceling===run.id ? "Cancelando" : "Cancelar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </>
  );
};

// Seed deterministic review state from COMPANIES so it's stable across renders.
const _seedEmpresaState = (id) => {
  const n = id.split("").reduce((a,c)=>a+c.charCodeAt(0),0) % 10;
  if (n < 5) return "pendiente";
  if (n < 8) return "aceptada";
  return "rechazada";
};

const BatchEmpresas = ({ companies, brief, activeRun, hiddenCount = 0, onRerun, rerunBusy, onOpenAutoSearch }) => {
  const companiesKey = (companies || []).map(c => `${c.id}:${c.candidateId}:${c.review}:${c.match}`).join("|");
  const minScoreThreshold = Math.min(100, Math.max(0, Number(brief?.minScoreThreshold ?? 75) || 75));
  const seed = React.useMemo(()=>{
    const source = Array.isArray(companies) ? companies : [];
    return source.map(c => ({
      ...c,
      match: c.match ?? (60 + (c.id.charCodeAt(c.id.length-1) % 38)),
      review: c.review || _seedEmpresaState(c.id),
      evidence: c.evidence || [],
      rationale: c.rationale || "",
      description: c.description || "",
    }));
  }, [companiesKey]);
  const [state, setState] = React.useState(seed);
  const [tab, setTab] = React.useState("todas");
  const [scoreFilterOn, setScoreFilterOn] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState(seed[0]?.id);
  const [reviewFeedback, setReviewFeedback] = React.useState("");

  React.useEffect(()=>{
    setState(seed);
    if (seed.length && !seed.find(r=>r.id===selectedId)) setSelectedId(seed[0].id);
  }, [companiesKey]);

  const visibleByScore = scoreFilterOn ? state.filter(r => Number(r.match ?? r.score ?? 0) >= minScoreThreshold) : state;
  const hiddenByScore = state.length - visibleByScore.length;
  const counts = {
    todas:     visibleByScore.length,
    pendiente: visibleByScore.filter(r=>r.review==="pendiente").length,
    enrich:    visibleByScore.filter(r=>r.review==="enrich").length,
    aceptada:  visibleByScore.filter(r=>r.review==="aceptada").length,
    rechazada: visibleByScore.filter(r=>r.review==="rechazada").length,
  };
  const filtered = tab==="todas" ? visibleByScore : visibleByScore.filter(r=>r.review===tab);

  // Keep selection valid
  React.useEffect(()=>{
    if (filtered.length && !filtered.find(r=>r.id===selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [tab, filtered.length, scoreFilterOn, minScoreThreshold]);

  const selected = filtered.find(c=>c.id===selectedId) || filtered[0];
  React.useEffect(()=>{
    const item = state.find(c=>c.id===selectedId);
    setReviewFeedback(item?.userFeedback || "");
  }, [selectedId, companiesKey]);
  const searchProgress = activeRun
    ? activeRun.status === "running"
      ? 58
      : 18
    : 0;
  const searchLabel = activeRun
    ? activeRun.status === "running"
      ? "Buscando empresas"
      : "Búsqueda en cola"
    : "";
  const rerunLabel = hiddenCount > 0
    ? `Mostrar 10 cacheadas (${hiddenCount})`
    : "Re-ejecutar búsqueda";

  const setCompanyReview = (id, val) => {
    const feedback = reviewFeedback.trim();
    const order = state.filter(c => ["pendiente", "enrich"].includes(c.review) && c.id!==id);
    const currentIndex = state.findIndex(c=>c.id===id);
    const next = order.find(c => state.findIndex(row=>row.id===c.id) > currentIndex) || order[0];
    setState(s => s.map(r => r.id===id ? {...r, review: val, userFeedback: feedback} : r));
    if (next) setSelectedId(next.id);
    const company = state.find(r => r.id === id);
    const status = val === "aceptada" ? "approved" : val === "rechazada" ? "rejected" : val === "enrich" ? "needs_more_research" : "new";
    if (!company?.candidateId) return;

    window.BackofficeAPI?.reviewCompanyCandidate(company.candidateId, status, feedback || undefined)
      .then((updated) => {
        if (updated) setState(s => s.map(r => r.id===id ? {...r, ...updated} : r));
      })
      .catch((error) => console.warn("No se pudo guardar revisión de empresa", error));
  };
  const submitCompanyReview = (event, id, val) => {
    event.preventDefault();
    event.stopPropagation();
    setCompanyReview(id, val);
  };

  return (
    <div>
      <div className="card-head" style={{padding:"0 0 14px"}}>
        <div className="row" style={{gap:14}}>
          <div className="tabs" style={{borderBottom:"none", padding:0}}>
            <div className={`tab ${tab==="todas"?"active":""}`}     onClick={()=>setTab("todas")}>Todas <span className="tab-count">{counts.todas}</span></div>
            <div className={`tab ${tab==="pendiente"?"active":""}`} onClick={()=>setTab("pendiente")}>Pendientes <span className="tab-count">{counts.pendiente}</span></div>
            <div className={`tab ${tab==="enrich"?"active":""}`}    onClick={()=>setTab("enrich")}>Enrich <span className="tab-count">{counts.enrich}</span></div>
            <div className={`tab ${tab==="aceptada"?"active":""}`}  onClick={()=>setTab("aceptada")}>Aceptadas <span className="tab-count">{counts.aceptada}</span></div>
            <div className={`tab ${tab==="rechazada"?"active":""}`} onClick={()=>setTab("rechazada")}>Rechazadas <span className="tab-count">{counts.rechazada}</span></div>
          </div>
        </div>
        <div className="card-actions">
          <button className={`chip ${scoreFilterOn ? "active" : "solid"}`} onClick={()=>setScoreFilterOn(!scoreFilterOn)}>
            <Icons.Filter size={12}/> {scoreFilterOn ? `${minScoreThreshold}+ score` : "Todos los scores"}
          </button>
          <button className="ghost-btn" onClick={onOpenAutoSearch}>
            <Icons.Bot size={13}/> Búsqueda automática
          </button>
          <button className="primary-btn" onClick={onRerun} disabled={rerunBusy || activeRun?.status === "running"}>
            <Icons.Refresh size={13}/> {rerunBusy ? "Encolando" : activeRun?.status === "running" ? "Buscando" : rerunLabel}
          </button>
        </div>
      </div>

      {activeRun && (
        <div className="card" style={{marginBottom:14, padding:"10px 14px"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:7}}>
            <div style={{display:"flex", alignItems:"center", gap:8, minWidth:0}}>
              <Icons.Activity size={13}/>
              <span style={{fontSize:12.5, fontWeight:600}}>{searchLabel}</span>
              <span className="mono" style={{fontSize:11, color:"var(--fg-3)"}}>{activeRun.id}</span>
            </div>
            <span style={{fontSize:11.5, color:"var(--fg-3)"}}>
              {activeRun.status === "running" ? "OpenClaw trabajando" : "Esperando worker"}
            </span>
          </div>
          <div className="mini-bar info" style={{height:5}}>
            <span style={{width: `${searchProgress}%`}}/>
          </div>
        </div>
      )}

      <div className="empresas-split">
        {/* LEFT — company list */}
        <div className="card emp-list">
          <div className="card-head" style={{padding:"12px 14px"}}>
            <div>
              <div className="card-title" style={{fontSize:13}}>Empresas · {filtered.length}</div>
              {scoreFilterOn && hiddenByScore > 0 && (
                <div style={{fontSize:11.5, color:"var(--fg-3)", marginTop:3}}>{hiddenByScore} debajo de {minScoreThreshold} guardadas en SQLite</div>
              )}
              {hiddenCount > 0 && (
                <div style={{fontSize:11.5, color:"var(--fg-3)", marginTop:3}}>{hiddenCount} en cola cacheada para el siguiente lote</div>
              )}
            </div>
          </div>
          <div style={{maxHeight:"calc(100vh - 340px)", overflowY:"auto"}}>
            {filtered.length===0 && (
              <div style={{textAlign:"center", color:"var(--fg-3)", padding:"40px 20px", fontSize:13}}>Sin empresas en este estado.</div>
            )}
            {filtered.map(c => {
              const logo = window.DATA.COMPANIES_LOGO[c.name] || {c:"#71717A"};
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
                      {c.review==="enrich"    && <span className="emp-dot" style={{background:"var(--warn)"}}></span>}
                      {c.review==="rechazada" && <span className="emp-dot" style={{background:"var(--danger)"}}></span>}
                    </div>
                    <div style={{display:"flex", alignItems:"center", gap:8, fontSize:11.5, color:"var(--fg-3)"}}>
                      <span>{c.industry}</span>
                      <span style={{color:"var(--fg-4)"}}>·</span>
                      <span className="mono">{c.match}% match</span>
                    </div>
                    <div style={{display:"flex", alignItems:"center", gap:4, marginTop:5, fontSize:11, color:"var(--fg-3)"}}>
                      <Icons.Globe size={10}/>
                      <span>{c.domain || "sin dominio"}</span>
                      {c.country && <span>· {c.country}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — selected company research */}
        {selected && (
          <div className="card emp-detail">
            <div className="card-head" style={{alignItems:"flex-start"}}>
              <div className="row" style={{gap:12, flex:1, minWidth:0}}>
                <span className="logo-tile" style={{background:(window.DATA.COMPANIES_LOGO[selected.name]||{c:"#71717A"}).c, width:40, height:40, fontSize:17, flexShrink:0}}>{selected.name[0]}</span>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:3}}>
                    <div className="card-title" style={{fontSize:16, fontWeight:600}}>{selected.name}</div>
                    {selected.review==="aceptada"  && <window.StatusPill kind="done"   label="Aceptada"/>}
                    {selected.review==="enrich"    && <window.StatusPill kind="warn"   label="Enrich"/>}
                    {selected.review==="rechazada" && <window.StatusPill kind="danger" label="Rechazada"/>}
                    {selected.review==="pendiente" && <window.StatusPill kind="empty"  label="Pendiente"/>}
                  </div>
                  <div style={{display:"flex", gap:10, fontSize:12, color:"var(--fg-3)"}}>
                    <span>{selected.domain || "sin dominio"}</span>
                    <span style={{color:"var(--fg-4)"}}>·</span>
                    <span>{selected.industry}</span>
                    <span style={{color:"var(--fg-4)"}}>·</span>
                    <span className="mono">{selected.size}</span>
                    <span style={{color:"var(--fg-4)"}}>·</span>
                    <span className="mono">{selected.match}% match</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{padding:"18px 20px", display:"grid", gap:16}}>
              <div style={{display:"grid", gridTemplateColumns:"minmax(220px, 1fr) auto", alignItems:"end", gap:10}}>
                <label className="form-row" style={{margin:0, gap:4}}>
                  <span className="form-label">Motivo</span>
                  <textarea
                    data-review-feedback="company"
                    className="ang-textarea"
                    rows={1}
                    style={{minHeight:38, height:38, padding:"7px 10px", fontSize:12.5, lineHeight:1.35}}
                    value={reviewFeedback}
                    onChange={(event)=>{
                      const value = event.target.value;
                      setReviewFeedback(value);
                      setState(s => s.map(r => r.id===selected.id ? {...r, userFeedback: value} : r));
                    }}
                    placeholder="Por qué sí o por qué no aplica."
                  />
                </label>
                <div className="card-actions" style={{justifyContent:"flex-end", marginLeft:0, paddingBottom:1}}>
                  {selected.review!=="rechazada" && (
                    <button type="button" className="review-btn reject" onMouseDown={(event)=>submitCompanyReview(event, selected.id, "rechazada")}>
                      <Icons.X size={12} sw={2.4}/> Rechazar
                    </button>
                  )}
                  {selected.review!=="enrich" && (
                    <button type="button" className="review-btn enrich" onMouseDown={(event)=>submitCompanyReview(event, selected.id, "enrich")}>
                      <Icons.Search size={12} sw={2.4}/> Enrich
                    </button>
                  )}
                  {selected.review!=="aceptada" && (
                    <button type="button" className="review-btn accept" onMouseDown={(event)=>submitCompanyReview(event, selected.id, "aceptada")}>
                      <Icons.Check size={12} sw={2.4}/> Aceptar
                    </button>
                  )}
                </div>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"repeat(4, minmax(0, 1fr))", gap:10}}>
                <div className="kpi" style={{minHeight:72}}>
                  <div className="kpi-lbl">Score</div>
                  <div className="kpi-val num">{selected.match ?? 0}<span className="kpi-unit"> / 100</span></div>
                </div>
                <div className="kpi" style={{minHeight:72}}>
                  <div className="kpi-lbl">País / ciudad</div>
                  <div style={{fontSize:13, color:"var(--fg)", marginTop:8}}>{[selected.country, selected.city].filter(Boolean).join(" · ") || "-"}</div>
                </div>
                <div className="kpi" style={{minHeight:72}}>
                  <div className="kpi-lbl">Tamaño</div>
                  <div style={{fontSize:13, color:"var(--fg)", marginTop:8}}>{selected.size || "-"}</div>
                </div>
                <div className="kpi" style={{minHeight:72}}>
                  <div className="kpi-lbl">Fuente</div>
                  <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:8}}>
                    {selected.domain ? (
                      <a className="entity" href={`https://${selected.domain}`} target="_blank" rel="noreferrer"><Icons.Globe size={11}/> Web</a>
                    ) : <span style={{fontSize:13, color:"var(--fg-3)"}}>-</span>}
                    {selected.linkedinUrl ? (
                      <a className="entity" href={selected.linkedinUrl} target="_blank" rel="noreferrer"><Icons.Linkedin size={11}/> LinkedIn</a>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="kv kv-wide">
                <div className="k">Descripción</div>
                <div className="v">{selected.description || "Sin descripción encontrada todavía."}</div>
                <div className="k">Por qué aplica</div>
                <div className="v">{selected.rationale || "Sin rationale generado todavía."}</div>
                <div className="k">Industria</div>
                <div className="v">{selected.industry || "-"}</div>
                <div className="k">Dominio</div>
                <div className="v">{selected.domain || "-"}</div>
              </div>

              <div>
                <div style={{fontSize:12, color:"var(--fg-3)", fontFamily:"var(--mono)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10}}>
                  Evidencia encontrada
                </div>
                <div style={{display:"grid", gap:8}}>
                  {(selected.evidence || []).length === 0 && (
                    <div style={{padding:"16px", border:"1px solid var(--border)", borderRadius:8, color:"var(--fg-3)", fontSize:13}}>
                      Todavía no hay evidencia guardada para esta empresa.
                    </div>
                  )}
                  {(selected.evidence || []).map((item, index) => (
                    <div key={index} style={{padding:"12px 14px", border:"1px solid var(--border)", borderRadius:8, background:"var(--bg-1)"}}>
                      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                        <span className="entity"><Icons.Globe size={11}/>{item.type || "fuente"}</span>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:12, color:"var(--fg-2)", overflowWrap:"anywhere"}}>{item.url}</a>
                        ) : null}
                      </div>
                      <div style={{fontSize:13, lineHeight:1.5, color:"var(--fg)"}}>{item.note || "Sin nota."}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AutoSearchModal = ({ brief, onClose, onSave }) => {
  const defaults = {
    runBudgetDollars: ((brief?.runBudgetCents || 0) / 100).toString(),
    maxCompanies: String(brief?.maxCompanies ?? 50),
    maxPeople: String(brief?.maxPeople ?? 0),
    minScore: String(brief?.minScoreThreshold ?? 75),
  };
  const [mode, setMode] = React.useState("companies_then_people");

  return (
    <div className="modal-overlay">
      <div className="modal" style={{width:"min(620px, calc(100vw - 36px))"}}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Búsqueda automática</div>
            <div className="modal-sub">Define los límites antes de dejar al agente corriendo en modo continuo.</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icons.X size={14}/></button>
        </div>
        <div className="modal-body">
          <div className="inline-alert">
            Frontend listo. La ejecución automática todavía requiere backend, worker, límites persistidos y botón de paro.
          </div>
          <div className="seg" role="tablist" style={{width:"fit-content"}}>
            <button className={`seg-opt ${mode==="companies" ? "on" : ""}`} onClick={()=>setMode("companies")}>Empresas</button>
            <button className={`seg-opt ${mode==="companies_then_people" ? "on" : ""}`} onClick={()=>setMode("companies_then_people")}>Empresas + personas</button>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:14}}>
            <label className="form-row">
              <span className="form-label">Límite de compute ($)</span>
              <input className="form-input" type="number" min="0" step="0.01" defaultValue={defaults.runBudgetDollars}/>
            </label>
            <label className="form-row">
              <span className="form-label">Score mínimo</span>
              <input className="form-input" type="number" min="0" max="100" step="1" defaultValue={defaults.minScore}/>
            </label>
            <label className="form-row">
              <span className="form-label">Máximo de empresas</span>
              <input className="form-input" type="number" min="0" step="1" defaultValue={defaults.maxCompanies}/>
            </label>
            <label className="form-row">
              <span className="form-label">Máximo de personas</span>
              <input className="form-input" type="number" min="0" step="1" defaultValue={defaults.maxPeople}/>
            </label>
          </div>
          <div className="kv kv-wide" style={{paddingTop:4}}>
            <div className="k">Regla de paro</div>
            <div className="v">Detener cuando se alcance el presupuesto, el límite de empresas, el límite de personas o cuando el operador lo pause.</div>
            <div className="k">Filtro</div>
            <div className="v">Guardar candidatos por debajo del score en SQLite, pero mostrar por defecto solo los que superen el mínimo.</div>
            <div className="k">Aprendizaje</div>
            <div className="v">Usar aceptadas, rechazadas y no contactar como memoria para siguientes corridas.</div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="ghost-btn lg" onClick={onClose}>Cancelar</button>
          <div style={{flex:1}}/>
          <button className="primary-btn lg" onClick={onSave}>
            <Icons.Check size={13}/> Guardar borrador
          </button>
        </div>
      </div>
    </div>
  );
};

const BatchPersonas = ({ people }) => {
  const peopleKey = (people || []).map(p => `${p.id}:${p.candidateId}:${p.review}:${p.score}`).join("|");
  const seed = React.useMemo(() => Array.isArray(people) ? people : [], [peopleKey]);
  const [rows, setRows] = React.useState(seed);

  React.useEffect(() => {
    setRows(seed);
  }, [peopleKey]);

  const setPersonReview = (person, status) => {
    const review = status === "approved" ? "aceptada" : status === "rejected" ? "rechazada" : "pendiente";
    setRows((items) => items.map((item) => item.id === person.id ? {...item, review} : item));
    if (!person.candidateId) return;

    window.BackofficeAPI?.reviewPersonCandidate(person.candidateId, status)
      .then((updated) => {
        if (updated) setRows((items) => items.map((item) => item.id === person.id ? {...item, ...updated} : item));
      })
      .catch((error) => console.warn("No se pudo guardar revisión de persona", error));
  };

  return (
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
          <th style={{width:160}}>Revisión</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(p => (
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
            <td>
              <div style={{display:"flex", gap:4, justifyContent:"flex-end"}}>
                {p.review!=="aceptada" && (
                  <button className="review-btn accept" onClick={()=>setPersonReview(p, "approved")}>
                    <Icons.Check size={12} sw={2.4}/>
                  </button>
                )}
                {p.review!=="rechazada" && (
                  <button className="review-btn reject" onClick={()=>setPersonReview(p, "rejected")}>
                    <Icons.X size={12} sw={2.4}/>
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

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
  const formId = `angulo-edit-form-${selectedId}`;

  React.useEffect(()=>{ setEditing(false); }, [selectedId]);

  const accept = (id) => {
    setItems(arr => arr.map(a => ({...a, active: a.id===id})));
  };
  const saveEdit = () => {
    const form = document.getElementById(formId);
    if (!form) return;
    const data = new FormData(form);
    const next = {
      ...selected,
      title: String(data.get("title") || "").trim(),
      body: String(data.get("body") || "").trim(),
      tono: String(data.get("tono") || "").trim(),
      prueba: String(data.get("prueba") || "").trim(),
      cta: String(data.get("cta") || "").trim(),
    };
    setItems(arr => arr.map(a => a.id===selected.id ? next : a));
    setEditing(false);
  };
  const cancelEdit = () => setEditing(false);

  return (
    <div className="angulo-grid">
      {editing && <form id={formId} onSubmit={(e)=>{ e.preventDefault(); saveEdit(); }} style={{display:"none"}}/>}
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
                name="title"
                form={formId}
                defaultValue={selected.title}
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
                name="body"
                form={formId}
                defaultValue={selected.body}
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
                ? <input className="form-input" name="tono" form={formId} defaultValue={selected.tono}/>
                : <div className="ang-text">{selected.tono}</div>}
            </div>
            <div className="ang-field">
              <div className="ang-label">Prueba social</div>
              {editing
                ? <input className="form-input" name="prueba" form={formId} defaultValue={selected.prueba}/>
                : <div className="ang-text">{selected.prueba}</div>}
            </div>
          </div>

          <div className="ang-field">
            <div className="ang-label">CTA</div>
            {editing
              ? <input className="form-input" name="cta" form={formId} defaultValue={selected.cta}/>
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
