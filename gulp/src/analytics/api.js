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
  // async addFilters() {
  //   const request = {
  //     'date_start': '11/29/2016 00:00:00',
  //     'date_end': '11/30/2016 00:00:00',
  //     'active_filters': [],
  //     'next_filter': 'found_on',
  //   };
  //   const filterResults = this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(request)});
  // }
  // async getSelectedFilterData(){
  //   const filterRequest = {
  //
  //   }
  //   return await this.api.post('/analytics/api/dynamic', {'request': JSON.stringify(filterRequest)});
  // }
}

// {
//   type: 'browser',
//   value: 'Chrome',
// }
