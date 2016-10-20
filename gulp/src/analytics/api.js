import {map} from 'lodash-compat/collection';

export default class Api {
  constructor(api) {
    this.api = api;
  }
  async getViewsInWeek() {
    return await this.api.get('/analytics/api/views-week');
  }
}
