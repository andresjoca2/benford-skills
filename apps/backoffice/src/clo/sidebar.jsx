// Sidebar — brand + nav only (no workspace switcher).
const { useEffect: useEffectSidebar, useState: useStateSidebar } = React;

const NavItem = ({ icon: I, label, count, active, disabled, badge, onClick }) => (
  <div className={`nav-item ${active?'active':''} ${disabled?'disabled':''}`} onClick={disabled?null:onClick}>
    {I ? <I/> : null}
    <span>{label}</span>
    {badge ? <span className="nav-count">{badge}</span> : null}
    {count != null ? <span className="nav-count">{count}</span> : null}
  </div>
);

const Sidebar = ({ route = "campanas", onNav }) => {
  const go = (r) => onNav && onNav(r);
  const inCampanas = route==="campanas" || route==="batch";
  const inBrain = route==="brain-explicit" || route==="brain-task";
  const [counts, setCounts] = useStateSidebar({
    campaigns: "-",
    events: "-",
    prospects: "-",
    companies: "-",
  });

  useEffectSidebar(() => {
    let cancelled = false;
    Promise.all([
      window.BackofficeAPI?.campaigns(),
      window.BackofficeAPI?.events(),
      window.BackofficeAPI?.prospects(),
      window.BackofficeAPI?.companies(),
    ])
      .then(([campaigns, events, prospects, companies]) => {
        if (cancelled) return;
        setCounts({
          campaigns: String((campaigns || []).length),
          events: String((events || []).length),
          prospects: String((prospects || []).length),
          companies: String((companies || []).length),
        });
      })
      .catch((error) => console.warn("No se pudieron cargar conteos de navegación", error));
    return () => { cancelled = true; };
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">C</div>
        <div style={{minWidth:0}}>
          <div className="brand-name">Clo</div>
          <div className="brand-sub">backoffice</div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-section">
          <div className="nav-section-title">Database</div>
          <NavItem icon={Icons.Database} label="Tablas reales" active={route==="tablas"} onClick={()=>go("tablas")}/>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Producto</div>
          <NavItem icon={Icons.Target}   label="Campañas"   count={counts.campaigns} active={inCampanas}        onClick={()=>go("campanas")}/>
          <NavItem icon={Icons.Activity} label="Eventos"    count={counts.events}    active={route==="eventos"}    onClick={()=>go("eventos")}/>
          <NavItem icon={Icons.Users}    label="Prospectos" count={counts.prospects} active={route==="prospectos"} onClick={()=>go("prospectos")}/>
          <NavItem icon={Icons.Building} label="Empresas"   count={counts.companies} active={route==="empresas"}   onClick={()=>go("empresas")}/>
          <NavItem icon={Icons.Edit}     label="Plantillas"/>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Brain</div>
          <NavItem icon={Icons.Sparkles} label="Document Tracker" active={inBrain} onClick={()=>go("brain-explicit")}/>
          <div className="nav-sub">
            <NavItem label="Explicit Knowledge" active={route==="brain-explicit"} onClick={()=>go("brain-explicit")}/>
            <NavItem label="Task Specific"      active={route==="brain-task"}     onClick={()=>go("brain-task")}/>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Workspace</div>
          <NavItem icon={Icons.Settings} label="Ajustes"/>
          <NavItem icon={Icons.Layers}   label="Integraciones"/>
        </div>
      </nav>
    </aside>
  );
};

window.Sidebar = Sidebar;
