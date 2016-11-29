export default class Api {
  constructor(api) {
    this.api = api;
  }
  async getInitialPageData() {
    console.log('INITAL PAGE DATA: ', await this.api.post('/analytics/api/dynamic'));
    return await this.api.post('/analytics/api/dynamic');
  }
  async addFilters() {
    const request = {
      'date_start': '10/12/2016 00:00:00',
      'date_end': '10/13/2016 00:00:00',
      'active_filters': [],
      'next_filter': 'found_on',
    };
    const filterResults = this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(request)});
    console.log('ADD FILTERS: ', await filterResults);
  }
}
