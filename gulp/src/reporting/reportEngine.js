import warning from 'warning';
import {map, groupBy} from 'lodash-compat/collection';
import {remove} from 'lodash-compat/array';
import {mapValues} from 'lodash-compat/object';
import {isArray, isPlainObject, isString} from 'lodash-compat/lang';

// This is the business logic of the myreports client.

/**
 * Root of the client.
 *
 * Used to walk through the api needed to find a usable presentation type.
 *
 */
export class ReportFinder {
  constructor(api, configBuilder) {
    this.api = api;
    this.configBuilder = configBuilder;
    this.newReportSubscribers = {};
    this.newMenuChoicesSubscribers = {};
    this.filterChangesSubscribers = {};
  }

  /**
   * Get a report configuration which can be customized and later run.
   *
   * reportingType: reporting type value
   * reportType: report type value
   * dataType: data type value
   * onNameChanged, onFilterChange, onErrorsChanged:
   *   see ReportConfiguration for definitions.
   */
  async buildReportConfiguration(reportingType, reportType, dataType,
      currentReportDataId, currentFilter, currentName, onNameChanged,
      onFilterChange, onErrorsChanged, onReportDataChanged) {
    const choices = await this.api.getSetUpMenuChoices(reportingType,
        reportType, dataType);
    const reportDataId = choices.report_data_id;
    if (currentReportDataId !== reportDataId) {
      onReportDataChanged(
        reportDataId,
        choices.selected_reporting_type,
        choices.selected_report_type,
        choices.selected_data_type);
    }
    let reportConfiguration = null;
    if (reportDataId) {
      const filters = await this.api.getFilters(reportDataId);
      let name;
      if (currentName) {
        name = {name: currentName};
      } else {
        name = await this.api.getDefaultReportName(reportDataId);
      }
      reportConfiguration = this.configBuilder.build(
        name.name, reportDataId, filters.filters, currentFilter,
        (reportId, report) => this.noteNewReport(reportId, report),
        report => this.noteNewRunningReport(report),
        onNameChanged,
        onFilterChange,
        onErrorsChanged);
      reportConfiguration.runCallbacks();
    }
    this.noteNewMenuChoices(
      choices.reporting_types,
      choices.report_types,
      choices.data_types,
      reportConfiguration);
  }

  /**
   * Retrieve a list of reports by this user
   * TODO: Handle searching, etc.
   */
  async getReportList() {
    return await this.api.listReports();
  }

  /**
   * Retrieve detailed info about a single report
   *
   * reportId: id for this report
   */
  async getReportInfo(reportId) {
    return await this.api.getReportInfo(reportId);
  }

  /**
   * Get a set of report options for this report.
   */
  async getExportOptions(reportId) {
    return await this.api.getExportOptions(reportId);
  }

  /**
   * Submit a callback to be called any time menu choices change.
   *
   * callback params:
   *    reportingTypeChoices: choices for the reportingType menu
   *    reportTypeChoices: choices for the reportType menu
   *    dataTypeChoices: choices for the dataType menu
   *    reportingType: currently selected reportingType
   *    reportType: currently selected reportType
   *    dataType: currently selected dataType
   *    reportConfiguration: new reportConfiguration based on selection
   * returns a reference which can be used later to unsubscribe.
   */
  subscribeToMenuChoices(callback) {
    this.newMenuChoicesSubscribers[callback] = callback;
    return callback;
  }

  /**
   * Remove a callback from the menu choices subscription.
   */
  unsubscribeToMenuChoices(ref) {
    delete this.newMenuChoicesSubscribers[ref];
  }

  /**
   * Let subscribers know that there are new menu choices.
   */
  noteNewMenuChoices(...args) {
    for (const ref in this.newMenuChoicesSubscribers) {
      if (this.newMenuChoicesSubscribers.hasOwnProperty(ref)) {
        this.newMenuChoicesSubscribers[ref](...args);
      }
    }
  }

  /**
   * Submit callbacks for changes to the report list.
   *
   * newReportCallback: called when creating a new report completes
   * runningReportCallback: called when the user starts running a report
   * newReportCallback params:
   *    reportId: id of new report. If the run fails this will be null.
   *    runningReport: if this was a running report from earlier,
   *      this is the same object
   * runningReportCallback params:
   *    runningReport: info about the running report
   *        {name: 'report name'}
   * returns a reference which can be used later to unsubscribe.
   */
  subscribeToNewReports(newReportCallback, runningReportCallback) {
    const callbacks = {
      newReportCallback,
      runningReportCallback,
    };
    this.newReportSubscribers[callbacks] = callbacks;
    return callbacks;
  }

  /**
   * Remove a callback from the new reports subscription.
   */
  unsubscribeToNewReports(ref) {
    delete this.newReportSubscribers[ref];
  }

  /**
   * Let subscribers know that there is a new report.
   */
  noteNewReport(reportId, runningReport) {
    for (const ref in this.newReportSubscribers) {
      if (this.newReportSubscribers.hasOwnProperty(ref)) {
        this.newReportSubscribers[ref].newReportCallback(reportId, runningReport);
      }
    }
  }

  /**
   * Let subscribers know that there is a new report.
   */
  noteNewRunningReport(runningReport) {
    for (const ref in this.newReportSubscribers) {
      if (this.newReportSubscribers.hasOwnProperty(ref)) {
        this.newReportSubscribers[ref].runningReportCallback(runningReport);
      }
    }
  }

  /**
   * Refresh a given report.
   */
  async refreshReport(reportId) {
    return await this.api.refreshReport(reportId);
  }

  /**
   * Submit a callback to be called any time a filter changes
   *
   * callback params: none
   * returns a reference which can be used later to unsubscribe.
   */
  subscribeToFilterChanges(callback) {
    this.filterChangesSubscribers[callback] = callback;
    return callback;
  }

  /**
   * Remove a callback from the filter changes subscription.
   */
  unsubscribeToFilterChanges(ref) {
    delete this.filterChangesSubscribers[ref];
  }

  /**
   * Let subscribers know that a filter has changed.
   */
  noteFilterChanges() {
    for (const ref in this.filterChangesSubscribers) {
      if (this.filterChangesSubscribers.hasOwnProperty(ref)) {
        this.filterChangesSubscribers[ref]();
      }
    }
  }
}

/**
 * Gradually build a filter for a report run with help from the api.
 *
 * Use the getHints function where available on fields to get sample
 * field values.
 *
 * Use setFilter to set simple filter values.
 *
 * Use the multifilter functions for filter values which are a collection of
 * items.
 *
 * An instance of this class stores it's own state. Use getFilter to extract
 * the complete state of the filter so far.
 *
 * Use the run function to run and store the report in the api.
 *
 * name: Initial name of the report.
 * reportDataId: Report Data id.
 * filters: List of filters supported by this report.
 * currentFilter: object representing report filter from user so far
 * api: Reporting API instance to use.
 * onNewReport: call back when a new report has been created.
 * onNameChanged: call back when the report name changes.
 * onUpdateFilter: call back with the filter changes.
 * onErrorsChanged: call back when the list of user errors changes.
 */
export class ReportConfiguration {
  constructor(name, reportDataId, filters, currentFilter, api,
      onNewReport, onNewRunningReport, onNameChanged, onUpdateFilter,
      onErrorsChanged) {
    this.name = name;
    this.reportDataId = reportDataId;
    this.filters = filters;
    this.currentFilter = currentFilter;
    this.errors = {};
    this.api = api;
    this.onNewReport = onNewReport;
    this.onNewRunningReport = onNewRunningReport;
    this.onNameChanged = onNameChanged;
    this.onUpdateFilter = onUpdateFilter;
    this.onErrorsChanged = onErrorsChanged;
  }

  /**
   * Return a collection of hints for a particular field and partial input.
   */
  async getHints(field, partial) {
    return await this.api.getHelp(
      this.reportDataId, this.getFilter(), field, partial);
  }

  callUpdateFilter() {
    this.onUpdateFilter(this.currentFilter);
  }

  /**
   * Set a value for a single valued filter.
   */
  setFilter(field, value) {
    if (value === undefined || value === null || value === '') {
      delete this.currentFilter[field];
    } else {
      this.currentFilter[field] = value;
    }
    this.callUpdateFilter();
  }

  /**
   * Set a value for a multiple valued "or" filter.
   */
  addToMultifilter(field, obj) {
    if (!(field in this.currentFilter)) {
      this.currentFilter[field] = [];
    }
    if (this.currentFilter[field].findIndex(i => i.value === obj.value) === -1) {
      this.currentFilter[field].push(obj);
    }
    this.callUpdateFilter();
  }


  /**
   * Get a previously set value for a multiple valued "or" filter.
   */
  removeFromMultifilter(field, obj) {
    remove(this.currentFilter[field], i => i.value === obj.value);
    this.callUpdateFilter();
  }

  /**
   * Add a value to a "and/or" filter. i.e. tags
   */
  addToAndOrFilter(field, index, obj) {
    if (!(field in this.currentFilter)) {
      this.currentFilter[field] = [];
    }
    if (!(index in this.currentFilter[field])) {
      this.currentFilter[field][index] = [];
    }
    this.currentFilter[field][index].push(obj);
    this.callUpdateFilter();
  }

  /**
   * Remove a value to a "and/or" filter. i.e. tags
   */
  removeFromAndOrFilter(field, index, obj) {
    const found = (
        this.currentFilter[field][index].findIndex(i => i.value === obj.value));
    if (found !== -1) {
      this.currentFilter[field][index].splice(found, 1);
      if (this.currentFilter[field][index].length < 1) {
        this.currentFilter[field].splice(index, 1);
      }
    }
    this.callUpdateFilter();
  }

  /**
   * Build a filter suitable for sending to the run method of the api.
   */
  getFilter() {
    const result = mapValues(this.currentFilter, item => {
      if (isString(item) || isPlainObject(item)) {
        return item;
      } else if (isArray(item) && isPlainObject(item[0])) {
        return map(item, o => o.value);
      } else if (isArray(item) && isArray(item[0])) {
        return map(item, inner => map(inner, o => o.value));
      }
      warning(false, 'Unrecognized filter type: ' + JSON.stringify(item));
    });
    return result;
  }

  /**
   * Change the name of the report.
   */
  changeReportName(name) {
    this.name = name;
    this.onNameChanged(name);
  }

  /**
   * Run callbacks to get all current stae.
   *
   * Useful at component initialization time.
   */
  runCallbacks() {
    this.onErrorsChanged(this.errors);
    this.onNameChanged(this.name);
    this.callUpdateFilter();
  }

  /**
   * Run the report.
   */
  async run() {
    const runningReport = {
      name: this.name,
    };
    try {
      this.onNewRunningReport(runningReport);
      const response = await this.api.runReport(
        this.reportDataId,
        this.name,
        this.getFilter());
      this.errors = {};
      this.onNewReport(response.id, runningReport);
    } catch (exc) {
      if (exc.data) {
        const grouped = groupBy(exc.data, 'field');
        const fixed = mapValues(grouped, values => map(values, v => v.message));
        this.errors = fixed;
      }
      this.onNewReport(null, runningReport);
    }
    this.onErrorsChanged(this.errors);
  }
}

/**
 * This factory just builds a ReportConfiguration.
 *
 * Having this makes unit testing easier.
 */
export class ReportConfigurationBuilder {
  constructor(api) {
    this.api = api;
  }

  build(name, reportDataId, filters, currentFilter, onNewReport,
      onNewRunningReport, onNameChanged, onUpdateFilter, onErrorsChanged) {
    return new ReportConfiguration(
        name, reportDataId, filters, currentFilter, this.api, onNewReport,
        onNewRunningReport, onNameChanged, onUpdateFilter, onErrorsChanged);
  }
}
