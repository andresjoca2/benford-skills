const { useEffect: useEffectTables, useState: useStateTables } = React;

const TableBrowserScreen = () => {
  const [tables, setTables] = useStateTables([]);
  const [selected, setSelected] = useStateTables("campaigns");
  const [table, setTable] = useStateTables(null);
  const [databasePath, setDatabasePath] = useStateTables("");
  const [loading, setLoading] = useStateTables(true);

  const refresh = () => Promise.all([loadTables(), loadTable(selected)]);

  const loadTables = () => {
    return window.BackofficeAPI?.tables()
      .then((items) => {
        setTables(items);
        if (items.length && !items.find((item) => item.name === selected)) {
          setSelected(items[0].name);
        }
      })
      .catch((error) => console.warn("No se pudieron cargar tablas", error));
  };

  const loadTable = (name) => {
    if (!name) return;
    setLoading(true);
    return window.BackofficeAPI?.table(name)
      .then((payload) => setTable(payload))
      .catch((error) => console.warn("No se pudo cargar tabla", error))
      .finally(() => setLoading(false));
  };

  useEffectTables(() => {
    loadTables();
    window.BackofficeAPI?.health()
      .then((health) => setDatabasePath(health.database || ""))
      .catch((error) => console.warn("No se pudo cargar health", error));
  }, []);
  useEffectTables(() => { loadTable(selected); }, [selected]);
  useEffectTables(() => {
    const onDataChanged = () => refresh();
    window.addEventListener("backoffice:data-changed", onDataChanged);
    window.addEventListener("focus", onDataChanged);
    return () => {
      window.removeEventListener("backoffice:data-changed", onDataChanged);
      window.removeEventListener("focus", onDataChanged);
    };
  }, [selected]);

  const columns = table?.columns || [];
  const rows = table?.rows || [];

  return (
    <>
      <window.Topbar crumbs={["Workspace", "Tablas"]}/>
      <div className="page" data-screen-label="Tablas">
        <window.PageHead
          eyebrow="SQLite"
          title="Tablas reales"
          sub="Esta es la vista raw de SQLite. Las pantallas de Producto usan estas tablas, pero algunas acciones visuales todavía son prototipo."
        >
          <button className="ghost-btn lg" onClick={refresh}><Icons.Refresh size={14}/> Actualizar</button>
        </window.PageHead>

        {databasePath ? (
          <div className="card" style={{padding:"12px 14px", marginBottom:16}}>
            <div style={{display:"flex", alignItems:"center", gap:10, minWidth:0}}>
              <Icons.Database size={14}/>
              <span style={{fontSize:12, color:"var(--fg-3)"}}>DB activa</span>
              <span className="mono" style={{fontSize:12, color:"var(--fg-1)", overflowWrap:"anywhere"}}>{databasePath}</span>
            </div>
          </div>
        ) : null}

        <div style={{display:"grid", gridTemplateColumns:"260px minmax(0, 1fr)", gap:16}}>
          <div className="card" style={{alignSelf:"start"}}>
            <div className="card-head" style={{padding:"12px 14px"}}>
              <div className="card-title" style={{fontSize:13}}>Tablas</div>
            </div>
            <div style={{padding:"6px"}}>
              {tables.map((item) => (
                <button
                  key={item.name}
                  className={`emp-item ${selected === item.name ? "selected" : ""}`}
                  style={{width:"100%", minHeight:42}}
                  onClick={()=>setSelected(item.name)}
                >
                  <div style={{flex:1, minWidth:0, textAlign:"left"}}>
                    <div className="row-title" style={{fontSize:12.5}}>{item.name}</div>
                    <div className="row-sub">{item.rows} filas</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">{table?.name || selected}</div>
                <div className="row-sub">{table ? `${table.total} filas · ${columns.length} columnas` : "Cargando"}</div>
              </div>
              <div className="card-actions">
                <span className="tag">{loading ? "loading" : "live"}</span>
              </div>
            </div>

            <div className="toolbar">
              {columns.map((column) => (
                <span key={column.name} className="chip solid">
                  <strong>{column.name}</strong>
                  <em>{column.type || "TEXT"}</em>
                  {column.primaryKey ? <span className="num">PK</span> : null}
                </span>
              ))}
            </div>

            <div style={{overflowX:"auto"}}>
              <table className="dt" style={{minWidth: Math.max(900, columns.length * 150)}}>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.name}>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={Math.max(columns.length, 1)} style={{padding:28, textAlign:"center", color:"var(--fg-3)"}}>
                        Sin filas.
                      </td>
                    </tr>
                  )}
                  {rows.map((row, index) => (
                    <tr key={index}>
                      {columns.map((column) => (
                        <td key={column.name} style={{maxWidth:260, verticalAlign:"top"}}>
                          <span className="mono" style={{fontSize:11.5, whiteSpace:"pre-wrap", overflowWrap:"anywhere", color:"var(--fg-2)"}}>
                            {row[column.name] || ""}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

window.TableBrowserScreen = TableBrowserScreen;
