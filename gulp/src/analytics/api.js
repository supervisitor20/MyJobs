export default class Api {
  constructor(api) {
    this.api = api;
  }
  // Get initial loading data for when app starts
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
  // Get the primary dimensions for when the app loads
  async getPrimaryDimensions() {
    return await this.api.get('/analytics/api/available-reports');
  }
  // Get the initial report for displaying the right data when page loads
  async getStartingPointReport() {
    const setStartingPointReport = await this.api.get('/analytics/api/available-reports');
    return setStartingPointReport.reports[0].value;
  }
  // Get the data requested from filtering on the table
  async getSelectedFilterData(tableValue, typeValue, storedFilters, currentReport) {
    const selectedFilterRequest = {
      'date_start': '12/01/2016 00:00:00',
      'date_end': '12/12/2016 00:00:00',
      'active_filters': storedFilters,
      'report': currentReport,
    };
    return await this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(selectedFilterRequest)});
  }
  // Get the data from the main dimensions selected from sidebar
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
