// Shared widgets and primitives used across screens.

const StatusPill = ({ kind, label }) => (
  <span className={`pill ${kind}`}><span className="dot"/>{label}</span>
);

const Avatar = ({ initials="?", color="#71717A", size, sq }) => (
  <span className={`avatar ${sq?"sq":""} ${size||""}`} style={{background: color}}>{initials}</span>
);

const LogoTile = ({ name, color, size }) => {
  const fallback = (window.DATA?.COMPANIES_LOGO?.[name]?.c) || color || "#71717A";
  return (
    <span className={`logo-tile ${size||""}`} style={{background: fallback}}>
      {name?.[0] || "?"}
    </span>
  );
};

const Tag = ({ children }) => <span className="tag">{children}</span>;

const Cbx = ({ on, onClick }) => (
  <span className={`cbx ${on?"on":""}`} onClick={(e)=>{ e.stopPropagation(); onClick && onClick(!on); }}>
    {on ? <Icons.Check size={10} sw={3}/> : null}
  </span>
);

const ChannelDots = ({ ch={} }) => (
  <span className="channels">
    <span className={`ch ${ch.email||""}`} title="Email"><Icons.Mail size={11}/></span>
    <span className={`ch ${ch.linkedin||""}`} title="LinkedIn"><Icons.Linkedin size={11}/></span>
    <span className={`ch ${ch.call||""}`} title="Call"><Icons.Phone size={11}/></span>
  </span>
);

const ScoreBar = ({ value=0, band="cold" }) => (
  <span className="score">
    <span className={`score-bar ${band}`}><span style={{width: value+"%"}}/></span>
    <span className="score-num">{value}</span>
  </span>
);

const FlagEmoji = ({ code }) => {
  const map = { MX:"🇲🇽", CO:"🇨🇴", BR:"🇧🇷", AR:"🇦🇷", CL:"🇨🇱", US:"🇺🇸" };
  return <span style={{fontSize:12.5, lineHeight:1}}>{map[code] || "🌐"}</span>;
};

const Topbar = ({ crumbs=[], actions, search="Buscar batches, prospectos…" }) => (
  <header className="topbar">
    <div className="crumbs">
      {crumbs.map((c,i)=>(
        <React.Fragment key={i}>
          {i>0 && <Icons.Chevron size={12} sw={2}/>}
          <span className={i===crumbs.length-1?"here":""}>{c}</span>
        </React.Fragment>
      ))}
    </div>
    <div className="top-right">
      {actions || null}
    </div>
  </header>
);

const PageHead = ({ eyebrow, title, sub, children }) => (
  <div className="page-head">
    <div>
      {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
      <h1 className="page-title">{title}</h1>
      {sub && <p className="page-sub">{sub}</p>}
    </div>
    {children && <div className="actions">{children}</div>}
  </div>
);

Object.assign(window, { StatusPill, Avatar, LogoTile, Tag, Cbx, ChannelDots, ScoreBar, FlagEmoji, Topbar, PageHead });
