export default class Api {
  constructor(api) {
    this.api = api;
  }
  async getInitialPageData(start, end) {
    const loadStartingPointReport = await this.api.get('/analytics/api/available-reports');
    const initialPageRequest = {
      'date_start': start + ' 00:00:00',
      'date_end': end + ' 00:00:00',
      'active_filters': [],
      'report': loadStartingPointReport.reports[0].value,
    };
    return await this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(initialPageRequest)});
  }
  async getPrimaryDimensions() {
    return await this.api.get('/analytics/api/available-reports');
  }
  async getStartingPointReport() {
    const setStartingPointReport = await this.api.get('/analytics/api/available-reports');
    return setStartingPointReport.reports[0].value;
  }
  async getSelectedFilterData(tableValue, typeValue, storedFilters, currentReport) {
    const selectedFilterRequest = {
      'date_start': '12/01/2016 00:00:00',
      'date_end': '12/12/2016 00:00:00',
      'active_filters': storedFilters,
      'report': currentReport,
    };
    return await this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(selectedFilterRequest)});
  }
  async getMainDimensionData(mainDimension) {
    const mainDimensionDataRequest = {
      'date_start': '12/01/2016 00:00:00',
      'date_end': '12/12/2016 00:00:00',
      'active_filters': [],
      'report': mainDimension,
    };
    return await this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(mainDimensionDataRequest)});
  }
}
