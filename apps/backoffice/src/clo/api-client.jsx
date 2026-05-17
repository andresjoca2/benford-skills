const BackofficeAPI = {
  notifyChanged(detail) {
    window.dispatchEvent(new CustomEvent("backoffice:data-changed", { detail }));
  },

  async getJson(path) {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  },

  async health() {
    return this.getJson("/api/health");
  },

  async postJson(path, body) {
    const response = await fetch(path, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();
    this.notifyChanged({ method: "POST", path });
    return data;
  },

  async putJson(path, body) {
    const response = await fetch(path, {
      method: "PUT",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();
    this.notifyChanged({ method: "PUT", path });
    return data;
  },

  async campaigns() {
    const data = await this.getJson("/api/campaigns");
    return data.campaigns || [];
  },

  async createCampaign(input) {
    const data = await this.postJson("/api/campaigns", input);
    return data.campaign;
  },

  async campaign(id) {
    const data = await this.getJson(`/api/campaigns/${encodeURIComponent(id)}`);
    return data.campaign;
  },

  async campaignCandidates(id) {
    const data = await this.getJson(`/api/campaigns/${encodeURIComponent(id)}/candidates`);
    const candidates = data.candidates || [];
    candidates.hiddenCount = data.hiddenCount || 0;
    return candidates;
  },

  async campaignPeople(id) {
    const data = await this.getJson(`/api/campaigns/${encodeURIComponent(id)}/people`);
    return data.people || [];
  },

  async createCampaignRun(id, options = {}) {
    return this.postJson(`/api/campaigns/${encodeURIComponent(id)}/runs`, options);
  },

  async createProspectingPlan(campaignId, query) {
    const data = await this.postJson("/api/prospecting/plan", { campaignId, query });
    return data.plan;
  },

  async giveProspectingPlanFeedback(planId, campaignId, feedback) {
    const data = await this.postJson(`/api/prospecting/plans/${encodeURIComponent(planId)}/feedback`, { campaignId, feedback });
    return data.plan;
  },

  async executeProspectingPlan(planId, options = {}) {
    return this.postJson(`/api/prospecting/plans/${encodeURIComponent(planId)}/execute`, options);
  },

  async revealCampaignCandidates(id, limit = 10) {
    return this.postJson(`/api/campaigns/${encodeURIComponent(id)}/candidates/reveal`, { limit });
  },

  async cancelRun(id) {
    const data = await this.postJson(`/api/runs/${encodeURIComponent(id)}/cancel`, {});
    return data.run;
  },

  async updateCampaignBrief(id, brief) {
    const data = await this.putJson(`/api/campaigns/${encodeURIComponent(id)}/brief`, brief);
    return data.campaign;
  },

  async reviewCompanyCandidate(candidateId, status, feedback) {
    const data = await this.postJson(`/api/candidates/company/${encodeURIComponent(candidateId)}/review`, { status, feedback });
    return data.candidate;
  },

  async reviewPersonCandidate(candidateId, status, feedback) {
    const data = await this.postJson(`/api/candidates/person/${encodeURIComponent(candidateId)}/review`, { status, feedback });
    return data.candidate;
  },

  async createPeopleRunForCompanyCandidate(candidateId, options = {}) {
    return this.postJson(`/api/company-candidates/${encodeURIComponent(candidateId)}/people-runs`, options);
  },

  async updateCompanyCandidateStatus(candidateId, status) {
    return this.reviewCompanyCandidate(candidateId, status);
  },

  async events(params) {
    const query = params?.campaignId ? `?campaignId=${encodeURIComponent(params.campaignId)}` : "";
    const data = await this.getJson(`/api/events${query}`);
    return data.events || [];
  },

  async tables() {
    const data = await this.getJson("/api/tables");
    return data.tables || [];
  },

  async table(name) {
    const data = await this.getJson(`/api/tables/${encodeURIComponent(name)}`);
    return data.table;
  },

  async prospects() {
    const data = await this.getJson("/api/prospects");
    return data.prospects || [];
  },

  async createProspect(input) {
    const data = await this.postJson("/api/prospects", input);
    return data.prospect;
  },

  async companies() {
    const data = await this.getJson("/api/companies");
    if (data.logos) window.DATA.COMPANIES_LOGO = data.logos;
    return data.companies || [];
  },

  async createCompany(input) {
    const data = await this.postJson("/api/companies", input);
    if (data.logos) window.DATA.COMPANIES_LOGO = data.logos;
    return data.company;
  },

  async brainSnapshot() {
    const response = await fetch("/api/brain/snapshot", { headers: { Accept: "application/json" } });
    if (response.status === 404) return null; // snapshot todavía no generado
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();
    return data.snapshot;
  },

  async refreshBrainSnapshot() {
    const data = await this.postJson("/api/brain/snapshot/refresh", {});
    return data.snapshot;
  },
};

window.BackofficeAPI = BackofficeAPI;
