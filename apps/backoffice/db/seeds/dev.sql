INSERT OR IGNORE INTO campaigns (id, name, status, owner_name)
VALUES
  ('campaign_fintech_latam', 'Fintech LATAM - Founders', 'active', 'Manu'),
  ('campaign_saas_cfos_mx', 'SaaS B2B - CFOs MX', 'active', 'Vale'),
  ('campaign_contadores_pymes', 'Contadores - Pymes', 'paused', 'Ivan'),
  ('campaign_draft', 'Campaign sin nombre', 'draft', 'Manu');

INSERT OR IGNORE INTO campaign_briefs (
  campaign_id,
  objective,
  industry,
  niche,
  country_region,
  company_size,
  positive_signals,
  negative_signals,
  search_mode,
  run_budget_cents,
  max_companies,
  max_people,
  max_runtime_seconds,
  min_score_threshold
)
VALUES
  ('campaign_fintech_latam', 'Encontrar founders y empresas fintech con necesidad operativa clara.', 'Fintech', 'Seed/Series A B2B', 'LATAM', '11-200 empleados', 'Founder visible, crecimiento regional, operaciones B2B, stack financiero.', 'Banca tradicional, consumer-only sin decision maker claro.', 'companies_then_people', 2000, 10, 20, 900, 75),
  ('campaign_saas_cfos_mx', 'Encontrar CFOs y finance leaders en SaaS B2B mexicano.', 'SaaS B2B', 'Finance teams', 'Mexico', '50-200 empleados', 'CFO/Head of Finance, crecimiento reciente, venta B2B.', 'Agencias pequenas, empresas sin equipo financiero.', 'people', 1500, 5, 20, 900, 75),
  ('campaign_contadores_pymes', 'Encontrar firmas contables pequenas con cartera pyme.', 'Contabilidad', 'Despachos para pymes', 'Mexico', '1-10 empleados', 'Servicios fiscales, nomina, IMSS, cartera pyme.', 'Firmas enterprise o solo consultoria legal.', 'companies', 1000, 10, 0, 900, 75),
  ('campaign_draft', '', '', '', '', '', '', '', 'companies', 0, 10, 0, 900, 75);

INSERT OR IGNORE INTO agent_runs (id, campaign_id, mission, status, objective, context_json, limits_json, started_at, finished_at)
VALUES
  ('run_fintech_001', 'campaign_fintech_latam', 'companies_then_people', 'needs_review', 'Encontrar 10 fintechs LATAM y personas fundadoras.', '{}', '{"budget_cents":2000,"max_companies":10,"max_people":20,"max_runtime_seconds":900}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('run_saas_001', 'campaign_saas_cfos_mx', 'find_people', 'completed', 'Encontrar CFOs de SaaS B2B en Mexico.', '{}', '{"budget_cents":1500,"max_companies":5,"max_people":20,"max_runtime_seconds":900}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO openclaw_jobs (id, run_id, campaign_id, skill, status, input_json, output_json, attempt, max_attempts)
VALUES
  ('job_fintech_find_companies_001', 'run_fintech_001', 'campaign_fintech_latam', 'find_companies', 'succeeded', '{}', '{}', 1, 1),
  ('job_fintech_find_people_001', 'run_fintech_001', 'campaign_fintech_latam', 'find_people', 'succeeded', '{}', '{}', 1, 1),
  ('job_saas_find_people_001', 'run_saas_001', 'campaign_saas_cfos_mx', 'find_people', 'succeeded', '{}', '{}', 1, 1);

INSERT OR IGNORE INTO companies (id, name, normalized_name, domain, linkedin_url, country, city, industry, employee_range, description, source_json, first_seen_run_id)
VALUES
  ('company_mendel', 'Mendel', 'mendel', 'mendel.com', 'https://linkedin.com/company/mendel', 'MX', 'Ciudad de Mexico', 'Fintech', '50-200', 'Fintech B2B para gestion financiera.', '{"source":"seed"}', 'run_fintech_001'),
  ('company_rappi', 'Rappi', 'rappi', 'rappi.com', 'https://linkedin.com/company/rappi', 'CO', 'Bogota', 'Logistica', '5000+', 'Plataforma regional de comercio y entregas.', '{"source":"seed"}', 'run_fintech_001'),
  ('company_kavak', 'Kavak', 'kavak', 'kavak.com', 'https://linkedin.com/company/kavak-com', 'MX', 'Ciudad de Mexico', 'Mobility', '5000+', 'Marketplace automotriz con operaciones regionales.', '{"source":"seed"}', 'run_fintech_001'),
  ('company_bitso', 'Bitso', 'bitso', 'bitso.com', 'https://linkedin.com/company/bitso', 'MX', 'Ciudad de Mexico', 'Fintech', '500-1000', 'Exchange y servicios cripto en LATAM.', '{"source":"seed"}', 'run_fintech_001'),
  ('company_clip', 'Clip', 'clip', 'clip.mx', 'https://linkedin.com/company/clip-mx', 'MX', 'Ciudad de Mexico', 'Fintech', '500-1000', 'Pagos para comercios.', '{"source":"seed"}', 'run_fintech_001');

INSERT OR IGNORE INTO company_candidates (id, campaign_id, run_id, company_id, status, score, rationale, evidence_json)
VALUES
  ('company_candidate_mendel_fintech', 'campaign_fintech_latam', 'run_fintech_001', 'company_mendel', 'new', 92, 'Calza por industria fintech, presencia B2B y senales de crecimiento.', '[{"type":"website","url":"https://mendel.com","note":"Describe producto financiero B2B."}]'),
  ('company_candidate_bitso_fintech', 'campaign_fintech_latam', 'run_fintech_001', 'company_bitso', 'maybe', 74, 'Fintech regional fuerte; revisar si el caso de uso sigue vigente.', '[{"type":"website","url":"https://bitso.com","note":"Operaciones regionales."}]'),
  ('company_candidate_clip_fintech', 'campaign_fintech_latam', 'run_fintech_001', 'company_clip', 'new', 71, 'Pagos B2B con posible necesidad operativa.', '[{"type":"website","url":"https://clip.mx","note":"Soluciones para negocios."}]');

INSERT OR IGNORE INTO people (id, name, normalized_name, title, company_id, company_name, linkedin_url, email, country, city, seniority, function, description, source_json, first_seen_run_id)
VALUES
  ('person_andres_martin', 'Andres Martin', 'andres martin', 'CEO & Co-founder', 'company_mendel', 'Mendel', 'https://linkedin.com/in/andres-martin-seed', '', 'MX', 'Ciudad de Mexico', 'Founder', 'Executive', 'Founder ejecutivo en fintech B2B.', '{"source":"seed"}', 'run_fintech_001'),
  ('person_sofia_bermudez', 'Sofia Bermudez', 'sofia bermudez', 'Head of Growth', 'company_rappi', 'Rappi', 'https://linkedin.com/in/sofia-bermudez-seed', '', 'CO', 'Bogota', 'Head', 'Growth', 'Lider de crecimiento regional.', '{"source":"seed"}', 'run_fintech_001'),
  ('person_lucas_pereira', 'Lucas Pereira', 'lucas pereira', 'CFO', 'company_kavak', 'Kavak', 'https://linkedin.com/in/lucas-pereira-seed', '', 'MX', 'Ciudad de Mexico', 'Executive', 'Finance', 'Responsable financiero.', '{"source":"seed"}', 'run_saas_001'),
  ('person_maria_fernandez', 'Maria Fernandez', 'maria fernandez', 'VP Finance', 'company_bitso', 'Bitso', 'https://linkedin.com/in/maria-fernandez-seed', '', 'MX', 'Ciudad de Mexico', 'VP', 'Finance', 'Lider financiera.', '{"source":"seed"}', 'run_saas_001'),
  ('person_diego_acosta', 'Diego Acosta', 'diego acosta', 'Founder', 'company_clip', 'Clip', 'https://linkedin.com/in/diego-acosta-seed', '', 'MX', 'Ciudad de Mexico', 'Founder', 'Executive', 'Founder en pagos.', '{"source":"seed"}', 'run_fintech_001');

INSERT OR IGNORE INTO person_candidates (id, campaign_id, run_id, person_id, company_id, status, score, rationale, evidence_json)
VALUES
  ('person_candidate_andres_fintech', 'campaign_fintech_latam', 'run_fintech_001', 'person_andres_martin', 'company_mendel', 'new', 92, 'Founder en fintech B2B con alta afinidad al brief.', '[{"type":"linkedin","url":"https://linkedin.com/in/andres-martin-seed","note":"Perfil founder."}]'),
  ('person_candidate_sofia_fintech', 'campaign_fintech_latam', 'run_fintech_001', 'person_sofia_bermudez', 'company_rappi', 'approved', 88, 'Lider de crecimiento con seniority suficiente.', '[{"type":"linkedin","url":"https://linkedin.com/in/sofia-bermudez-seed","note":"Head of Growth."}]'),
  ('person_candidate_lucas_saas', 'campaign_saas_cfos_mx', 'run_saas_001', 'person_lucas_pereira', 'company_kavak', 'maybe', 81, 'CFO relevante; confirmar si pertenece al segmento SaaS.', '[{"type":"linkedin","url":"https://linkedin.com/in/lucas-pereira-seed","note":"CFO."}]'),
  ('person_candidate_maria_saas', 'campaign_saas_cfos_mx', 'run_saas_001', 'person_maria_fernandez', 'company_bitso', 'new', 74, 'Finance leader en tecnologia financiera.', '[{"type":"linkedin","url":"https://linkedin.com/in/maria-fernandez-seed","note":"VP Finance."}]'),
  ('person_candidate_diego_fintech', 'campaign_fintech_latam', 'run_fintech_001', 'person_diego_acosta', 'company_clip', 'new', 71, 'Founder en pagos con posible necesidad operativa.', '[{"type":"linkedin","url":"https://linkedin.com/in/diego-acosta-seed","note":"Founder."}]');

INSERT OR IGNORE INTO feedback (id, campaign_id, run_id, subject_type, subject_id, feedback_type, sentiment, text, created_by)
VALUES
  ('feedback_sofia_approved', 'campaign_fintech_latam', 'run_fintech_001', 'person_candidate', 'person_candidate_sofia_fintech', 'approved', 'positive', 'Buen perfil de decision maker regional.', 'Manu'),
  ('feedback_bitso_maybe', 'campaign_fintech_latam', 'run_fintech_001', 'company_candidate', 'company_candidate_bitso_fintech', 'maybe', 'neutral', 'Revisar si tiene necesidad actual.', 'Manu');

INSERT OR IGNORE INTO outreach_drafts (id, campaign_id, run_id, company_id, person_id, status, channel, subject, body, created_by)
VALUES
  ('draft_sofia_fintech_001', 'campaign_fintech_latam', 'run_fintech_001', 'company_rappi', 'person_sofia_bermudez', 'draft', 'email', 'Idea para operaciones regionales', 'Draft pendiente de revision humana.', 'OpenClaw');

INSERT OR IGNORE INTO agent_events (campaign_id, run_id, job_id, subject_type, subject_id, level, event_type, message, payload_json)
VALUES
  ('campaign_fintech_latam', 'run_fintech_001', 'job_fintech_find_companies_001', 'run', 'run_fintech_001', 'success', 'run.completed', 'OpenClaw encontro empresas candidatas para revision.', '{}'),
  ('campaign_fintech_latam', 'run_fintech_001', 'job_fintech_find_people_001', 'run', 'run_fintech_001', 'success', 'people.found', 'OpenClaw encontro personas candidatas relacionadas.', '{}'),
  ('campaign_saas_cfos_mx', 'run_saas_001', 'job_saas_find_people_001', 'run', 'run_saas_001', 'success', 'people.found', 'OpenClaw encontro finance leaders para revision.', '{}');
