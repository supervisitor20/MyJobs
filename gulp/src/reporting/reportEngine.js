// This is the business logic of the myreports client.


// Root of the client.
//
// Used to walk through the api needed to find a usable presentation type.
//
// Last call of the "walk" is buildReportConfiguration.
export class ReportFinder {
  constructor(api, configBuilder) {
    this.api = api;
    this.configBuilder = configBuilder;
    this.newReportSubscribers = {};
  }

  getReportingTypes() {
    return this.api.getReportingTypes();
  }

  getReportTypes(reportingTypeId) {
    return this.api.getReportTypes(reportingTypeId);
  }

  getDataTypes(reportTypeId) {
    return this.api.getDataTypes(reportTypeId);
  }

  getPresentationTypes(reportTypeId, dataTypeId) {
    return this.api.getPresentationTypes(reportTypeId, dataTypeId);
  }

  async buildReportConfiguration(rpId) {
    const filters = await this.api.getFilters(rpId);
    return await this.configBuilder.build(
      rpId, filters.filters, reportId => this.noteNewReport(reportId));
  }

  async getReportList() {
    return await this.api.listReports();
  }

  subscribeToReportList(callback) {
    this.newReportSubscribers[callback] = callback;
    return callback;
  }

  unsubscribeToReportList(ref) {
    delete this.newReportSubscribers[ref];
  }

  noteNewReport(reportId) {
    for (const ref in this.newReportSubscribers) {
      if (this.newReportSubscribers.hasOwnProperty(ref)) {
        this.newReportSubscribers[ref](reportId);
      }
    }
  }
}

// Gradually build a filter for a report run with help from the api.
//
// Use the getHints function where available on fields to get sample
// field values.
//
// Use setFilter to set simple filter values.
//
// Use the multifilter functions for filter values which are a collection of
// items.
//
// An instance of this class stores it's own state. Use getFilter to extract
// the complete state of the filter so far.
//
// Use the run function to run and store the report in the api.

// Future: consider restructuring this class so that it's methods which mutate
// state operate on and return a new react state object.
export class ReportConfiguration {
  constructor(rpId, filters, api, newReportNote) {
    this.rpId = rpId;
    this.filters = filters;
    this.simpleFilter = {};
    this.multiFilter = {};
    this.andOrFilter = {};
    this.api = api;
    this.newReportNote = newReportNote;
  }

  async getHints(field, partial) {
    return await this.api.getHelp(
      this.rpId, this.getFilter(), field, partial);
  }

  setFilter(field, value) {
    if (value === undefined || value === null || value === '') {
      delete this.simpleFilter[field];
    } else {
      this.simpleFilter[field] = value;
    }
  }

  addToMultifilter(field, obj) {
    if (!(field in this.multiFilter)) {
      this.multiFilter[field] = [];
    }
    if (this.multiFilter[field].findIndex(i => i.key === obj.key) === -1) {
      this.multiFilter[field].push(obj);
    }
  }

  removeFromMultifilter(field, obj) {
    const index = this.multiFilter[field].findIndex(i => i.key === obj.key);
    if (index !== -1) {
      this.multiFilter[field].splice(index, 1);
    }
  }

  addToAndOrFilter(field, index, obj) {
    if (!(field in this.andOrFilter)) {
      this.andOrFilter[field] = [];
    }
    if (!(index in this.andOrFilter[field])) {
      this.andOrFilter[field][index] = [];
    }
    this.andOrFilter[field][index].push(obj);
  }

  removeFromAndOrFilter(field, index, obj) {
    const found = this.andOrFilter[field][index].findIndex(i => i.key === obj.key);
    if (found !== -1) {
      this.andOrFilter[field][index].splice(found, 1);
      if (this.andOrFilter[field][index].length < 1) {
        this.andOrFilter[field].splice(index, 1);
      }
    }
  }

  getFilter() {
    const filter = {...this.simpleFilter};
    for (const key in this.multiFilter) {
      if (this.multiFilter.hasOwnProperty(key)) {
        filter[key] = this.multiFilter[key].map(o => o.key);
      }
    }
    for (const key in this.andOrFilter) {
      if (this.andOrFilter.hasOwnProperty(key)) {
        filter[key] = this.andOrFilter[key].map(
          arr => arr.map(o => o.key));
      }
    }
    return filter;
  }

  getMultiFilter(key) {
    return this.multiFilter[key];
  }

  getAndOrFilter(key) {
    if (!this.andOrFilter.hasOwnProperty(key)) {
      return [];
    }
    return this.andOrFilter[key];
  }

  async run(name) {
    const reportId = await this.api.runReport(this.rpId, name, this.getFilter());
    this.newReportNote(reportId);
    return reportId;
  }
}

// This factory just builds a ReportConfiguration.
//
// Having it makes unit testing easier.
export class ReportConfigurationBuilder {
  constructor(api) {
    this.api = api;
  }

  async build(rpId, filters, cb) {
    return new ReportConfiguration(rpId, filters, this.api, cb);
  }
}
