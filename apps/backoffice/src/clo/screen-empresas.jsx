// Empresas screen — companies table with logos, industries, prospects count.
const { useEffect: useEffectC, useState: useStateC } = React;

const EmpresasScreen = () => {
  const [rows, setRows] = useStateC(window.DATA.COMPANIES);
  const [tab, setTab] = useStateC("todas");
  const industries = Array.from(new Set(rows.map(r=>r.industry)));

  useEffectC(() => {
    let cancelled = false;
    window.BackofficeAPI?.companies()
      .then((companies) => {
        if (!cancelled && companies.length) {
          window.DATA.COMPANIES = companies;
          setRows(companies);
        }
      })
      .catch((error) => console.warn("No se pudieron cargar empresas desde SQLite", error));
    return () => { cancelled = true; };
  }, []);

  const refreshCompanies = () => {
    return window.BackofficeAPI?.companies()
      .then((companies) => {
        if (companies.length) {
          window.DATA.COMPANIES = companies;
          setRows(companies);
        }
      })
      .catch((error) => console.warn("No se pudieron recargar empresas", error));
  };

  const createCompany = () => {
    const name = window.prompt("Nombre de la empresa");
    if (!name?.trim()) return;
    const domain = window.prompt("Dominio") || "";

    window.BackofficeAPI?.createCompany({ name, domain })
      .then(() => refreshCompanies())
      .catch((error) => console.warn("No se pudo crear empresa", error));
  };

  let filtered = rows;
  if (tab==="con") filtered = rows.filter(r=>r.contacted>0);
  else if (tab==="sin") filtered = rows.filter(r=>r.contacted===0);
  else if (tab==="responded") filtered = rows.filter(r=>r.replied>0);

  return (
    <>
      <window.Topbar crumbs={["CRM","Empresas"]}
        actions={
          <>          </>
        }
      />
      <div className="page" style={{maxWidth:1400}} data-screen-label="Empresas">
        <window.PageHead
          eyebrow="CRM"
          title="Empresas"
          sub="El catálogo de organizaciones donde el agente ha identificado prospectos. Agrupa, filtra y abre cualquiera para ver su gente."
        >
          <button className="ghost-btn lg"><Icons.Upload size={14}/> Importar</button>
          <button className="ghost-btn lg"><Icons.Download size={14}/> Exportar</button>
          <button className="primary-btn lg" onClick={createCompany}><Icons.Plus size={14}/> Añadir empresa</button>
        </window.PageHead>

        <div className="card">
          <div className="tabs">
            <div className={`tab ${tab==="todas"?"active":""}`} onClick={()=>setTab("todas")}>Todas <span className="tab-count">{rows.length}</span></div>
            <div className={`tab ${tab==="con"?"active":""}`} onClick={()=>setTab("con")}>Con contactos <span className="tab-count">{rows.filter(r=>r.contacted>0).length}</span></div>
            <div className={`tab ${tab==="responded"?"active":""}`} onClick={()=>setTab("responded")}>Con respuestas <span className="tab-count">{rows.filter(r=>r.replied>0).length}</span></div>
            <div className={`tab ${tab==="sin"?"active":""}`} onClick={()=>setTab("sin")}>Sin contactar <span className="tab-count">{rows.filter(r=>r.contacted===0).length}</span></div>
          </div>

          <div className="toolbar">
            <button className="chip solid"><Icons.Filter size={12}/> <em>Industria:</em> <strong>Todas</strong></button>
            <button className="chip solid"><em>Tamaño:</em> <strong>Cualquiera</strong></button>
            <button className="chip solid"><em>País:</em> <strong>Todos</strong></button>
            <button className="chip solid"><em>Tags:</em> <strong>Cualquiera</strong></button>
            <button className="chip"><Icons.Plus size={12}/> Añadir filtro</button>
            <div style={{flex:1}}/>
            <button className="chip solid"><Icons.Database size={12}/> <strong>SQLite local</strong></button>
            <button className="chip solid"><Icons.Sort size={12}/> <strong>Prospectos ↓</strong></button>
            <span style={{fontSize:11.5, color:"var(--fg-4)", fontFamily:"var(--mono)"}}>{filtered.length} de 284</span>
          </div>

          <table className="dt">
            <thead>
              <tr>
                <th className="col-check"><window.Cbx/></th>
                <th>Empresa</th>
                <th>Industria</th>
                <th>Tamaño</th>
                <th>País</th>
                <th className="right">Prospectos</th>
                <th>Contactados</th>
                <th className="right">Respuestas</th>
                <th>Tags</th>
                <th>Última actividad</th>
                <th>Dueño</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const logo = window.DATA.COMPANIES_LOGO[c.name] || {c:"#71717A"};
                const pct = c.prospects ? Math.round((c.contacted/c.prospects)*100) : 0;
                return (
                  <tr key={c.id}>
                    <td className="col-check"><window.Cbx/></td>
                    <td>
                      <div className="row" style={{gap:10}}>
                        <span className="logo-tile" style={{background:logo.c}}>{c.name[0]}</span>
                        <div className="stack" style={{minWidth:0}}>
                          <div className="row-title">{c.name}</div>
                          <div className="row-sub">{c.domain}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:12.5}}>{c.industry}</td>
                    <td><span className="mono" style={{fontSize:11.5, color:"var(--fg-2)"}}>{c.size}</span></td>
                    <td><span style={{display:"inline-flex", alignItems:"center", gap:6, fontSize:12}}><window.FlagEmoji code={c.country}/> {c.country}</span></td>
                    <td className="right num">{c.prospects}</td>
                    <td>
                      <div className="num" style={{fontSize:12.5}}>
                        <span style={{color:"var(--fg)"}}>{c.contacted}</span>
                        <span style={{color:"var(--fg-4)"}}> / {c.prospects}</span>
                      </div>
                      <div className="mini-bar info"><span style={{width: pct+"%"}}/></div>
                    </td>
                    <td className="right num" style={{color: c.replied>0?"var(--ok)":"var(--fg-3)"}}>{c.replied}</td>
                    <td>
                      <span style={{display:"inline-flex", gap:4, flexWrap:"wrap"}}>
                        {c.tags.length===0 && <span style={{color:"var(--fg-4)"}}>—</span>}
                        {c.tags.map(t => <window.Tag key={t}>{t}</window.Tag>)}
                      </span>
                    </td>
                    <td style={{fontSize:12, color:"var(--fg-2)"}}>{c.last}</td>
                    <td><window.Avatar initials={c.owner.i} color={c.owner.c}/></td>
                    <td><button className="icon-btn" onClick={(e)=>e.stopPropagation()}><Icons.More size={14}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination">
            <span>1–{filtered.length} de 284</span>
            <div style={{flex:1}}/>
            <span style={{marginRight:8}}>Página 1 / 16</span>
            <button className="pg-btn disabled"><Icons.ChevronLeft size={12}/></button>
            <button className="pg-btn"><Icons.Chevron size={12}/></button>
          </div>
        </div>
      </div>
    </>
  );
};

window.EmpresasScreen = EmpresasScreen;
