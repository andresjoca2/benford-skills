// Entrenar agente — chat conversation with Clo (sales-agent).

const SUGGESTIONS = [
  "Quiero buscar CFOs de fintech en México",
  "Ajusta el ángulo para founders early-stage",
  "Lanza una corrida del batch Fintech LATAM",
  "Resume las respuestas de hoy",
];

const MESSAGES = [
  { role:"agent", time:"14:21", text:<>Hola Manu 👋 Soy Clo, tu agente de ventas. Estoy listo para ayudarte a definir prospectos, lanzar corridas y resumir respuestas. ¿Qué quieres entrenar hoy?</> },
  { role:"user", time:"14:22", text:<>Quiero crear un nuevo batch para founders de fintech LATAM, etapa seed/series A.</> },
  { role:"agent", time:"14:22", text:
    <>
      Perfecto. Antes de buscar, me gustaría confirmar el contexto:
      <ul style={{margin:"8px 0 0", paddingLeft:18, color:"var(--fg-2)"}}>
        <li><b>Industria:</b> Fintech</li>
        <li><b>Región:</b> LATAM (MX, CO, BR, AR, CL)</li>
        <li><b>Etapa:</b> Seed–Series A</li>
        <li><b>Cargo:</b> Founder / CEO / CTO</li>
      </ul>
      ¿Quieres que use el ángulo "founders early-stage" o prefieres uno nuevo?
    </>
  },
  { role:"user", time:"14:23", text:<>Usa "founders early-stage" pero enfócalo en automatización financiera.</> },
  { role:"agent", time:"14:23", text:
    <>
      Listo. Ajusté el ángulo: <span className="entity"><Icons.Hash size={11}/>founders-fin-auto</span>. Voy a estimar el tamaño del universo…
      <div style={{marginTop:10, padding:"10px 12px", border:"1px solid var(--border)", borderRadius:"var(--r-2)", background:"var(--panel-2)"}}>
        <div style={{fontSize:11, color:"var(--fg-3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6}}>Estimación</div>
        <div style={{display:"flex", gap:24}}>
          <div><div className="num" style={{fontSize:20, fontWeight:600}}>~3,400</div><div style={{fontSize:11, color:"var(--fg-3)"}}>en universo</div></div>
          <div><div className="num" style={{fontSize:20, fontWeight:600}}>248</div><div style={{fontSize:11, color:"var(--fg-3)"}}>match alto</div></div>
          <div><div className="num" style={{fontSize:20, fontWeight:600, color:"var(--ok)"}}>42%</div><div style={{fontSize:11, color:"var(--fg-3)"}}>tasa esperada</div></div>
        </div>
      </div>
      ¿Lanzo la corrida o quieres revisar la lista primero?
    </>
  },
];

const EntrenarScreen = () => {
  const [input, setInput] = React.useState("");
  return (
    <>
      <window.Topbar crumbs={["CRM","Entrenar agente"]}
        actions={
          <>
            <span className="live"><span className="pulse"/>CONECTADO</span>
            <button className="ghost-btn"><Icons.Refresh size={13}/> Nueva sesión</button>
            <button className="icon-btn"><Icons.More size={14}/></button>
          </>
        }
      />
      <div className="chat-shell" data-screen-label="Entrenar agente">
        <div className="chat-head">
          <div className="agent-avatar">
            <div className="brand-mark" style={{width:36, height:36, fontSize:21, borderRadius:9}}>C</div>
            <span className="agent-status"/>
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:16, fontWeight:600, letterSpacing:"-0.01em"}}>Clo · sales-agent</div>
            <div style={{fontSize:12, color:"var(--fg-3)"}}>Entrenando contexto · 3 batches activos · v2.4.1</div>
          </div>
          <div style={{flex:1}}/>
          <button className="ghost-btn"><Icons.Eye size={13}/> Ver memoria</button>
          <button className="ghost-btn"><Icons.Download size={13}/> Exportar chat</button>
        </div>

        <div className="chat-body">
          {MESSAGES.map((m,i)=>(
            <div key={i} className={`msg msg-${m.role}`}>
              {m.role==="agent" && <div className="msg-avatar"><div className="brand-mark" style={{width:26, height:26, fontSize:15, borderRadius:7}}>C</div></div>}
              <div className="msg-bubble">
                <div className="msg-meta">
                  <span className="msg-name">{m.role==="agent"?"Clo":"Tú"}</span>
                  <span className="msg-time">{m.time}</span>
                </div>
                <div className="msg-text">{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-foot">
          <div className="suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="sugg" onClick={()=>setInput(s)}>
                <Icons.Sparkles size={11}/> {s}
              </button>
            ))}
          </div>
          <div className="composer">
            <button className="icon-btn" title="Adjuntar"><Icons.Plus size={15}/></button>
            <textarea
              className="composer-input"
              rows={1}
              placeholder="Pregunta a Clo o dale una instrucción…"
              value={input}
              onChange={(e)=>setInput(e.target.value)}
            />
            <div className="composer-actions">
              <button className="ghost-btn sm"><Icons.Hash size={12}/> Contexto</button>
              <button className="primary-btn"><Icons.Send size={13}/></button>
            </div>
          </div>
          <div className="composer-hint">
            <span><span className="kbd">⏎</span> enviar · <span className="kbd">⇧⏎</span> nueva línea</span>
            <span style={{flex:1}}/>
            <span>Clo puede cometer errores. Verifica corridas críticas.</span>
          </div>
        </div>
      </div>
    </>
  );
};

window.EntrenarScreen = EntrenarScreen;
