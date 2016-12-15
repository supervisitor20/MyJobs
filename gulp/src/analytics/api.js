export default class Api {
  constructor(api) {
    this.api = api;
  }
  async getInitialPageData(start, end) {
    const initialPageRequest = {
      'date_start': start + ' 00:00:00',
      'date_end': end + ' 00:00:00',
      'active_filters': [],
      'report': 'job-locations',
    };
    return await this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(initialPageRequest)});
  }
  async getPrimaryDimensions() {
    return await this.api.get('/analytics/api/available-reports');
  }
  async getSelectedFilterData(tableValue, typeValue) {
    const selectedFilterRequest = {
      'date_start': '12/01/2016 00:00:00',
      'date_end': '12/12/2016 00:00:00',
      'active_filters': [
        {
          type: typeValue.toString(),
          value: tableValue.toString(),
        },
      ],
      'report': 'job-locations',
    };
    return await this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(selectedFilterRequest)});
  }
}
