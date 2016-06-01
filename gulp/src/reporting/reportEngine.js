import warning from 'warning';
import {map, groupBy, forEach} from 'lodash-compat/collection';
import {mapValues} from 'lodash-compat/object';
import {isArray, isPlainObject, isString} from 'lodash-compat/lang';

// This is the business logic of the myreports client.

let nextSubscriptionId = 0;
function generateSubscriptionId() {
  nextSubscriptionId += 1;
  return nextSubscriptionId;
}

export class Subscription {
  constructor() {
    this.callbacks = {};
  }

  note(...args) {
    forEach(this.callbacks, v => {v(...args);});
  }

  subscribe(callback) {
    const ref = generateSubscriptionId();
    this.callbacks[ref] = callback;
    return () => {
      delete this.callbacks[ref];
    };
  }
}

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
    this.newMenuChoicesSubscriptions = new Subscription();
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
      let initialFilter;
      if (currentFilter) {
        initialFilter = currentFilter;
      } else {
        initialFilter = filters.default_filter;
      }
      reportConfiguration = this.configBuilder.build(
        name.name, reportDataId, filters.filters, initialFilter,
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
    return this.newMenuChoicesSubscriptions.subscribe(callback);
  }

  /**
   * Let subscribers know that there are new menu choices.
   */
  noteNewMenuChoices(...args) {
    return this.newMenuChoicesSubscriptions.note(...args);
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
      } else if (isArray(item) && item.length === 2 &&
          typeof(item[0]) === 'string' && typeof(item[1]) === 'string') {
        return item;
      }
      warning(false, 'Unrecognized filter type: ' + JSON.stringify(item));
    });
    return result;
  }

  /**
   * Run callbacks to get all current stae.
   *
   * Useful at component initialization time.
   */
  runCallbacks() {
    this.onErrorsChanged(this.errors);
    this.onNameChanged(this.name);
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
