// Sidebar — brand + nav only (no workspace switcher).
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
          <div className="nav-section-title">CRM</div>
          <NavItem icon={Icons.Target}   label="Campañas"   count="3"    active={inCampanas}        onClick={()=>go("campanas")}/>
          <NavItem icon={Icons.Activity} label="Eventos"    count="15"   active={route==="eventos"}    onClick={()=>go("eventos")}/>
          <NavItem icon={Icons.Users}    label="Prospectos" count="1.2k" active={route==="prospectos"} onClick={()=>go("prospectos")}/>
          <NavItem icon={Icons.Building} label="Empresas"   count="284"  active={route==="empresas"}   onClick={()=>go("empresas")}/>
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
          <NavItem icon={Icons.Layers}   label="Integraciones" badge="6"/>
        </div>
      </nav>
    </aside>
  );
};

window.Sidebar = Sidebar;
