// Router + app shell.
const { useState: useStateApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#5E6AD2"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ["#5E6AD2", "#000000", "#16A34A", "#E11D48"];

const Page = () => {
  const [route, setRoute] = useStateApp("campanas");
  const [batchId, setBatchId] = useStateApp(null);
  const [tweaks, setTweak] = (window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, ()=>{}]);

  React.useEffect(()=>{
    document.documentElement.style.setProperty("--accent", tweaks.accent);
  }, [tweaks.accent]);

  const openBatch = (id) => { setBatchId(id); setRoute("batch"); };
  const backToCampanas = () => setRoute("campanas");

  let screen = null;
  if (route === "campanas")        screen = <window.CampanasScreen onOpen={openBatch}/>;
  else if (route === "batch")      screen = <window.BatchDetailScreen batchId={batchId} onBack={backToCampanas}/>;
  else if (route === "brain-explicit") screen = <window.BrainScreen subroute="explicit"/>;
  else if (route === "brain-task")     screen = <window.BrainScreen subroute="task"/>;
  else if (route === "eventos")    screen = <window.EventosScreen/>;
  else if (route === "prospectos") screen = <window.ProspectosScreen/>;
  else if (route === "empresas")   screen = <window.EmpresasScreen/>;
  else screen = <window.CampanasScreen onOpen={openBatch}/>;

  return (
    <div className="app">
      <Sidebar route={route} onNav={setRoute}/>
      <main className="main">{screen}</main>

      {window.TweaksPanel ? (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Apariencia">
            <window.TweakColor label="Acento" value={tweaks.accent} onChange={(v)=>setTweak("accent", v)} options={ACCENT_OPTIONS}/>
          </window.TweakSection>
          <window.TweakSection title="Navegación">
            <window.TweakRadio
              label="Pantalla"
              value={route==="batch"?"campanas":route}
              onChange={setRoute}
              options={[
                {value:"campanas",   label:"Campañas"},
                {value:"eventos",    label:"Eventos"},
                {value:"prospectos", label:"Prospectos"},
                {value:"empresas",   label:"Empresas"},
              ]}
            />
            {route==="campanas" && (
              <window.TweakButton onClick={()=>openBatch(window.DATA.BATCHES[0].id)}>
                Abrir primer batch →
              </window.TweakButton>
            )}
          </window.TweakSection>
        </window.TweaksPanel>
      ) : null}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Page/>);
