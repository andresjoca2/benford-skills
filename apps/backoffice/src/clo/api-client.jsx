const BackofficeAPI = {
  async getJson(path) {
    const response = await fetch(path, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  },

  async postJson(path, body) {
    const response = await fetch(path, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  },

  async campaigns() {
    const data = await this.getJson("/api/campaigns");
    return data.campaigns || [];
  },

  async createCampaign(input) {
    const data = await this.postJson("/api/campaigns", input);
    return data.campaign;
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
};

window.BackofficeAPI = BackofficeAPI;
