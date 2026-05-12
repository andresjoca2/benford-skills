// Stepper / persistent tabs for the wizard. User can jump anywhere.
const STEPS = [
  { id: "busqueda",  label: "Búsqueda",  meta: "Contexto" },
  { id: "empresas",  label: "Empresas",  meta: "0 / 50" },
  { id: "personas",  label: "Personas",  meta: "0 / 100" },
  { id: "angulo",    label: "Ángulo",    meta: "—" },
  { id: "contenido", label: "Contenido", meta: "—" },
];

const Stepper = ({ activeId="busqueda", doneIds=[], onSelect }) => {
  return (
    <div className="stepper" role="tablist">
      {STEPS.map((s, i) => {
        const active = s.id === activeId;
        const done = doneIds.includes(s.id);
        return (
          <div
            key={s.id}
            className={`step ${active?"active":""} ${done?"done":""}`}
            onClick={()=>onSelect && onSelect(s.id)}
            role="tab"
            aria-selected={active}
          >
            <div className="step-num">{done ? <Icons.Check size={12} sw={2.4}/> : (i+1)}</div>
            <div className="step-text">
              <div className="step-label">{s.label}</div>
              <div className="step-meta">{s.meta}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

window.Stepper = Stepper;
