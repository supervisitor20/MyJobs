export default class Api {
  constructor(api) {
    this.api = api;
  }
  async getInitialPageData() {
    return await this.api.get('/analytics/api/dynamic');
  }
}
