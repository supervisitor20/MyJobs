export default class Api {
  constructor(api) {
    this.api = api;
  }
  async getInitialPageData(start, end) {
    const initialPageRequest = {
      'date_start': start + ' 00:00:00',
      'date_end': end + ' 00:00:00',
      'active_filters': [],
      'next_filter': 'found_on',
    };
    return await this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(initialPageRequest)});
  }
  async getPrimaryDimensions() {
    return await this.api.get('/analytics/api/available-reports');
  }
}
