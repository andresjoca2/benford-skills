// Shared mock data for all CRM screens.

const BATCHES = [
  {
    id: "btc_8821",
    name: "Fintech LATAM · Founders",
    criteria: "Fintech · LATAM · 11–50 emp · Founder/CEO",
    created: "hace 2 d",
    runs: 4,
    lastRun: "Corrida actual · 14:02",
    total: 248, contacted: 184, replied: 41, qualified: 12, pending: 64,
    status: { kind: "running", label: "En curso" },
    owner: { name: "Manu", initials: "M", color: "#A855F7" },
    progressKind: "info",
  },
  {
    id: "btc_8814",
    name: "SaaS B2B · CFOs Mx",
    criteria: "SaaS B2B · México · 50–200 emp · CFO/Finance",
    created: "hace 5 d",
    runs: 3,
    lastRun: "Corrida #3 · ayer 09:14",
    total: 412, contacted: 412, replied: 89, qualified: 31, pending: 0,
    status: { kind: "done", label: "Completado" },
    owner: { name: "Vale", initials: "V", color: "#0EA5E9" },
    progressKind: "ok",
  },
  {
    id: "btc_8807",
    name: "Contadores · Pymes",
    criteria: "Contabilidad · México · 1–10 emp · Owner",
    created: "hace 1 sem",
    runs: 2,
    lastRun: "Corrida #2 · mar 06 11:30",
    total: 96, contacted: 71, replied: 18, qualified: 5, pending: 25,
    status: { kind: "done", label: "Completado" },
    owner: { name: "Iván", initials: "I", color: "#16A34A" },
    progressKind: "ok",
  },
  {
    id: "btc_8799",
    name: "E-commerce · Shopify Plus",
    criteria: "E-commerce · LATAM · 11–50 emp · Founder",
    created: "hace 9 d",
    runs: 1,
    lastRun: "Corrida #1 · feb 28 15:20",
    total: 158, contacted: 158, replied: 22, qualified: 8, pending: 0,
    status: { kind: "done", label: "Completado" },
    owner: { name: "Manu", initials: "M", color: "#A855F7" },
    progressKind: "ok",
  },
  {
    id: "btc_draft",
    name: "Batch sin nombre",
    criteria: "—",
    created: "draft",
    runs: 0,
    lastRun: "—",
    total: 0, contacted: 0, replied: 0, qualified: 0, pending: 0,
    status: { kind: "empty", label: "Vacío" },
    owner: { name: "Manu", initials: "M", color: "#A855F7" },
    progressKind: "warn",
  },
];

// Events log (richer + grouped)
const EVENTS = [
  // HOY
  { day:"HOY", t:"info",  type:"corrida.start",  text:<>Corrida iniciada · <span className="entity"><Icons.Layers size={11}/>btc_8821</span></>, time:"14:02", actor:"Clo", source:"agente" },
  { day:"HOY", t:"ok",    type:"prospect.sent",  text:<>184 prospectos enviados <span className="muted">de 248</span> · <span className="entity"><Icons.Layers size={11}/>btc_8821</span></>, time:"13:58", actor:"Clo", source:"agente" },
  { day:"HOY", t:"ok",    type:"prospect.replied", text:<><span className="entity"><Icons.User size={11}/>Andrés Martín</span> respondió · <span className="entity"><Icons.Building size={11}/>Mendel</span></>, time:"13:44", actor:"prospecto", source:"inbox" },
  { day:"HOY", t:"info",  type:"context.train",  text:<>Contexto entrenado con <b>3 documentos</b> · <span className="entity"><Icons.Layers size={11}/>btc_8821</span></>, time:"13:41", actor:"Manu", source:"manual" },
  { day:"HOY", t:"info",  type:"angle.update",   text:<>Ángulo ajustado: <span className="muted">"founders early-stage"</span></>, time:"13:22", actor:"Manu", source:"manual" },
  { day:"HOY", t:"warn",  type:"source.block",   text:<>2 dominios bloqueados por LinkedIn · <span className="entity"><Icons.Globe size={11}/>linkedin.com</span></>, time:"12:55", actor:"sistema", source:"sistema" },
  { day:"HOY", t:"ok",    type:"prospect.qualified", text:<><span className="entity"><Icons.User size={11}/>Sofía Bermúdez</span> calificada como <b>hot</b></>, time:"11:30", actor:"Clo", source:"agente" },
  // AYER
  { day:"AYER", t:"ok",   type:"corrida.done",   text:<>Batch <span className="entity"><Icons.Layers size={11}/>btc_8814</span> completado <span className="muted">— 412/412</span></>, time:"ayer 18:11", actor:"Clo", source:"agente" },
  { day:"AYER", t:"info", type:"template.dup",   text:<>Plantilla <b>intro-cold-v3</b> duplicada</>, time:"ayer 17:02", actor:"Vale", source:"manual" },
  { day:"AYER", t:"ok",   type:"prospect.replied", text:<><span className="entity"><Icons.User size={11}/>Lucas Pereira</span> respondió · <span className="entity"><Icons.Building size={11}/>Rappi</span></>, time:"ayer 16:48", actor:"prospecto", source:"inbox" },
  { day:"AYER", t:"info", type:"corrida.start",  text:<>Corrida iniciada · <span className="entity"><Icons.Layers size={11}/>btc_8814</span></>, time:"ayer 09:14", actor:"Clo", source:"agente" },
  // ESTA SEMANA
  { day:"ESTA SEMANA", t:"danger", type:"smtp.fail",  text:<>SMTP devolvió <b>5xx</b> en 3 envíos consecutivos · pausa automática</>, time:"vie 06 11:30", actor:"sistema", source:"sistema" },
  { day:"ESTA SEMANA", t:"ok",    type:"corrida.done",   text:<>Batch <span className="entity"><Icons.Layers size={11}/>btc_8807</span> completado <span className="muted">— 71/96</span></>, time:"jue 05 17:55", actor:"Clo", source:"agente" },
  { day:"ESTA SEMANA", t:"info",  type:"integration",  text:<>CRM interno listo para revisión humana</>, time:"mié 04 10:12", actor:"Manu", source:"sistema" },
  { day:"ESTA SEMANA", t:"info",  type:"context.train",  text:<>Contexto inicial cargado · <span className="entity"><Icons.Layers size={11}/>btc_8807</span></>, time:"lun 02 14:30", actor:"Iván", source:"manual" },
];

// Prospects
const COMPANIES_LOGO = {
  "Mendel":      { c:"#0EA5E9" },
  "Rappi":       { c:"#FF441F" },
  "Kavak":       { c:"#7C3AED" },
  "Bitso":       { c:"#2563EB" },
  "Clip":        { c:"#16A34A" },
  "Konfío":      { c:"#1F2937" },
  "Albo":        { c:"#0F766E" },
  "Stori":       { c:"#DC2626" },
  "Belvo":       { c:"#1E40AF" },
  "Truora":      { c:"#A21CAF" },
  "Tiendanube":  { c:"#0891B2" },
  "Fintual":     { c:"#0D9488" },
  "Cobre":       { c:"#0F172A" },
  "Plata":       { c:"#475569" },
  "Atrato":      { c:"#9333EA" },
  "Habi":        { c:"#EA580C" },
  "Justo":       { c:"#15803D" },
  "Heru":        { c:"#7C2D12" },
};

const PROSPECTS = [
  { id:"p001", name:"Andrés Martín",     title:"CEO & Co-founder",      company:"Mendel",      industry:"Fintech",     score:92, scoreBand:"hot",  status:{kind:"running",label:"En conversación"}, channels:{email:"on",linkedin:"on",call:""}, lastTouch:"hoy 13:44", batch:"btc_8821", country:"MX", owner:{i:"M",c:"#A855F7"}, tags:["Founder","ICP-A"] },
  { id:"p002", name:"Sofía Bermúdez",    title:"Head of Growth",        company:"Rappi",       industry:"Logística",    score:88, scoreBand:"hot",  status:{kind:"done",label:"Calificado"}, channels:{email:"on",linkedin:"on",call:"on"}, lastTouch:"hoy 11:30", batch:"btc_8821", country:"CO", owner:{i:"V",c:"#0EA5E9"}, tags:["Decision-maker"] },
  { id:"p003", name:"Lucas Pereira",     title:"CFO",                    company:"Kavak",       industry:"Mobility",     score:81, scoreBand:"hot",  status:{kind:"running",label:"Respondió"}, channels:{email:"on",linkedin:""}, lastTouch:"ayer 16:48", batch:"btc_8814", country:"BR", owner:{i:"I",c:"#16A34A"}, tags:["ICP-A"] },
  { id:"p004", name:"María Fernández",   title:"VP Finance",             company:"Bitso",       industry:"Fintech",      score:74, scoreBand:"warm", status:{kind:"draft",label:"Contactado"}, channels:{email:"on",linkedin:"on"}, lastTouch:"hace 2 d", batch:"btc_8821", country:"MX", owner:{i:"M",c:"#A855F7"}, tags:["Founder"] },
  { id:"p005", name:"Diego Acosta",      title:"Founder",                company:"Clip",        industry:"Fintech",      score:71, scoreBand:"warm", status:{kind:"draft",label:"Contactado"}, channels:{email:"on"}, lastTouch:"hace 2 d", batch:"btc_8814", country:"MX", owner:{i:"V",c:"#0EA5E9"}, tags:["ICP-B"] },
  { id:"p006", name:"Camila Rojas",      title:"Director of Operations", company:"Konfío",      industry:"Fintech",      score:69, scoreBand:"warm", status:{kind:"warn",label:"Sin respuesta"}, channels:{email:"on",linkedin:"on"}, lastTouch:"hace 3 d", batch:"btc_8814", country:"MX", owner:{i:"I",c:"#16A34A"}, tags:[] },
  { id:"p007", name:"Tomás Vázquez",     title:"Co-founder",             company:"Albo",        industry:"Fintech",      score:64, scoreBand:"warm", status:{kind:"running",label:"En conversación"}, channels:{email:"on",linkedin:"on"}, lastTouch:"hoy 09:12", batch:"btc_8821", country:"MX", owner:{i:"M",c:"#A855F7"}, tags:["Founder","ICP-A"] },
  { id:"p008", name:"Valentina López",   title:"Head of Finance",        company:"Stori",       industry:"Fintech",      score:58, scoreBand:"warm", status:{kind:"draft",label:"Encolado"}, channels:{email:""}, lastTouch:"—", batch:"btc_8821", country:"MX", owner:{i:"V",c:"#0EA5E9"}, tags:[] },
  { id:"p009", name:"Pablo Restrepo",    title:"CEO",                    company:"Belvo",       industry:"Fintech",      score:55, scoreBand:"warm", status:{kind:"draft",label:"Contactado"}, channels:{email:"on",linkedin:""}, lastTouch:"hace 4 d", batch:"btc_8807", country:"CO", owner:{i:"I",c:"#16A34A"}, tags:["Founder"] },
  { id:"p010", name:"Renata Silva",      title:"Head of People",         company:"Truora",      industry:"Software",     score:48, scoreBand:"cold", status:{kind:"empty",label:"Rebotado"}, channels:{email:"warn"}, lastTouch:"hace 5 d", batch:"btc_8807", country:"CO", owner:{i:"M",c:"#A855F7"}, tags:[] },
  { id:"p011", name:"Mateo Aguilar",     title:"Finance Director",       company:"Tiendanube",  industry:"E-commerce",   score:43, scoreBand:"cold", status:{kind:"warn",label:"Sin respuesta"}, channels:{email:"on"}, lastTouch:"hace 5 d", batch:"btc_8799", country:"AR", owner:{i:"V",c:"#0EA5E9"}, tags:[] },
  { id:"p012", name:"Ana Castillo",      title:"COO",                    company:"Fintual",     industry:"Fintech",      score:39, scoreBand:"cold", status:{kind:"danger",label:"Descartado"}, channels:{email:"on",linkedin:"on"}, lastTouch:"hace 1 sem", batch:"btc_8807", country:"CL", owner:{i:"I",c:"#16A34A"}, tags:["Decision-maker"] },
  { id:"p013", name:"Sebastián Núñez",   title:"CEO",                    company:"Cobre",       industry:"Fintech",      score:34, scoreBand:"cold", status:{kind:"draft",label:"Encolado"}, channels:{email:""}, lastTouch:"—", batch:"btc_8821", country:"CO", owner:{i:"M",c:"#A855F7"}, tags:["Founder"] },
];

// Companies
const COMPANIES = [
  { id:"c01", name:"Mendel",     domain:"mendel.com",     industry:"Fintech",      size:"50–200",  country:"MX", prospects:8, contacted:6, replied:2, last:"hoy",       owner:{i:"M",c:"#A855F7"}, tags:["ICP-A","Fintech LATAM"] },
  { id:"c02", name:"Rappi",      domain:"rappi.com",      industry:"Logística",    size:"5k+",     country:"CO", prospects:14, contacted:11,replied:3, last:"hoy",       owner:{i:"V",c:"#0EA5E9"}, tags:["Enterprise"] },
  { id:"c03", name:"Kavak",      domain:"kavak.com",      industry:"Mobility",     size:"5k+",     country:"MX", prospects:11, contacted:8, replied:4, last:"ayer",      owner:{i:"I",c:"#16A34A"}, tags:["Enterprise"] },
  { id:"c04", name:"Bitso",      domain:"bitso.com",      industry:"Fintech",      size:"500–1k",  country:"MX", prospects:9,  contacted:7, replied:1, last:"hace 2 d",  owner:{i:"M",c:"#A855F7"}, tags:["ICP-A"] },
  { id:"c05", name:"Clip",       domain:"clip.mx",        industry:"Fintech",      size:"500–1k",  country:"MX", prospects:6,  contacted:5, replied:1, last:"hace 2 d",  owner:{i:"V",c:"#0EA5E9"}, tags:["ICP-A"] },
  { id:"c06", name:"Konfío",     domain:"konfio.mx",      industry:"Fintech",      size:"500–1k",  country:"MX", prospects:7,  contacted:4, replied:0, last:"hace 3 d",  owner:{i:"I",c:"#16A34A"}, tags:["ICP-A"] },
  { id:"c07", name:"Albo",       domain:"albo.mx",        industry:"Fintech",      size:"200–500", country:"MX", prospects:4,  contacted:3, replied:1, last:"hoy",       owner:{i:"M",c:"#A855F7"}, tags:["ICP-A"] },
  { id:"c08", name:"Stori",      domain:"stori.mx",       industry:"Fintech",      size:"500–1k",  country:"MX", prospects:5,  contacted:2, replied:0, last:"hace 4 d",  owner:{i:"V",c:"#0EA5E9"}, tags:["ICP-B"] },
  { id:"c09", name:"Belvo",      domain:"belvo.com",      industry:"Fintech API",  size:"50–200",  country:"CO", prospects:3,  contacted:2, replied:0, last:"hace 4 d",  owner:{i:"I",c:"#16A34A"}, tags:["ICP-A"] },
  { id:"c10", name:"Truora",     domain:"truora.com",     industry:"Software",     size:"50–200",  country:"CO", prospects:2,  contacted:1, replied:0, last:"hace 5 d",  owner:{i:"M",c:"#A855F7"}, tags:[] },
  { id:"c11", name:"Tiendanube", domain:"tiendanube.com", industry:"E-commerce",   size:"500–1k",  country:"AR", prospects:6,  contacted:3, replied:1, last:"hace 5 d",  owner:{i:"V",c:"#0EA5E9"}, tags:["ICP-B"] },
  { id:"c12", name:"Fintual",    domain:"fintual.com",    industry:"Wealthtech",   size:"50–200",  country:"CL", prospects:2,  contacted:2, replied:0, last:"hace 1 sem",owner:{i:"I",c:"#16A34A"}, tags:[] },
  { id:"c13", name:"Cobre",      domain:"cobre.co",       industry:"Fintech",      size:"50–200",  country:"CO", prospects:3,  contacted:0, replied:0, last:"—",         owner:{i:"M",c:"#A855F7"}, tags:["Nuevo"] },
  { id:"c14", name:"Plata",      domain:"plata.card",     industry:"Fintech",      size:"200–500", country:"MX", prospects:4,  contacted:1, replied:0, last:"hace 6 d",  owner:{i:"V",c:"#0EA5E9"}, tags:[] },
  { id:"c15", name:"Atrato",     domain:"atrato.mx",      industry:"Fintech",      size:"50–200",  country:"MX", prospects:2,  contacted:2, replied:1, last:"hace 1 sem",owner:{i:"I",c:"#16A34A"}, tags:["ICP-A"] },
  { id:"c16", name:"Habi",       domain:"habi.co",        industry:"Proptech",     size:"500–1k",  country:"CO", prospects:5,  contacted:3, replied:0, last:"hace 1 sem",owner:{i:"M",c:"#A855F7"}, tags:["ICP-B"] },
  { id:"c17", name:"Justo",      domain:"justo.mx",       industry:"E-commerce",   size:"200–500", country:"MX", prospects:3,  contacted:2, replied:0, last:"hace 1 sem",owner:{i:"V",c:"#0EA5E9"}, tags:[] },
  { id:"c18", name:"Heru",       domain:"heru.app",       industry:"Fintech",      size:"50–200",  country:"MX", prospects:4,  contacted:3, replied:1, last:"hace 2 sem",owner:{i:"I",c:"#16A34A"}, tags:["ICP-A"] },
];

window.DATA = { BATCHES, EVENTS, PROSPECTS, COMPANIES, COMPANIES_LOGO };
