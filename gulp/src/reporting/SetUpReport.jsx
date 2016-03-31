import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';

import classnames from 'classnames';
import {WizardFilterDateRange} from './wizard/WizardFilterDateRange';
import {WizardFilterSearchDropdown} from './wizard/WizardFilterSearchDropdown';
import {WizardFilterTags} from './wizard/WizardFilterTags';
import {WizardFilterCollectedItems} from './wizard/WizardFilterCollectedItems';
import {WizardFilterCityState} from './wizard/WizardFilterCityState';
import {SearchInput} from 'common/ui/SearchInput';
import {ValidatedInput} from 'common/ui/ValidatedInput';
import DataTypeSelectBar from 'reporting/DataTypeSelectBar';

export default class SetUpReport extends Component {
  constructor() {
    super();
    this.state = {
      reportName: '',
      loading: true,
      reportingType: null,
      reportingTypes: [],
      reportType: null,
      reportTypes: [],
      dataType: null,
      dataTypes: [],
    };
  }

  componentDidMount() {
    const {reportFinder} = this.props;
    this.menuCallbackRef = reportFinder.subscribeToMenuChoices(
        (...choices) => this.onMenuChanged(...choices));
    this.loadData();
  }

  componentWillUnmount() {
    const {reportFinder} = this.props;
    reportFinder.unsubscribeToMenuChoices(this.menuCallbackRef);
  }

  onIntentionChange(reportingType) {
    const {reportType, dataType} = this.state;
    this.buildReportConfig(reportingType, reportType, dataType);
  }

  onCategoryChange(reportType) {
    const {reportingType, dataType} = this.state;
    this.buildReportConfig(reportingType, reportType, dataType);
  }

  onDataSetChange(dataType) {
    const {reportingType, reportType} = this.state;
    this.buildReportConfig(reportingType, reportType, dataType);
  }

  onMenuChanged(reportingTypes, reportTypes, dataTypes,
      reportingType, reportType, dataType, reportConfig) {
    console.log('onMenuChanged', reportingType, reportType, dataType);
    this.setState({
      reportingTypes,
      reportTypes,
      dataTypes,
      reportingType,
      reportType,
      dataType,
      reportConfig,
    });
  }

  onFilterUpdate(filter) {
    this.setState({filter});
  }

  onErrorsChanged(errors) {
    const reportNameError = errors.name;
    this.setState({reportNameError});
  }

  onReportNameChanged(reportName) {
    this.setState({reportName});
  }

  async loadData() {
    await this.buildReportConfig();
    this.setState({loading: false});
  }

  async buildReportConfig(reportingType, reportType, dataType) {
    const {reportFinder} = this.props;
    console.log('buildReportConfig', reportingType, reportType, dataType);
    reportFinder.buildReportConfiguration(
      reportingType,
      reportType,
      dataType,
      n => this.onReportNameChanged(n),
      f => this.onFilterUpdate(f),
      errors => this.onErrorsChanged(errors));
  }

  renderRow(displayName, key, content, buttonRow, textCenter) {
    return (
      <div key={key} className={
        classnames(
        {'row': true},
        {'actions': buttonRow},
        {'text-center': textCenter})}>
        <div className="col-xs-12 col-md-4">
          <label>
            {displayName}
          </label>
        </div>
        <div className="col-xs-12 col-md-8">
          {content}
        </div>
      </div>
    );
  }

  render() {
    const {
      loading,
      reportConfig,
      reportName,
      reportNameError,
      filter,
      reportingTypes,
      reportTypes,
      dataTypes,
      reportingType,
      reportType,
      dataType,
    } = this.state;

    if (loading) {
      return <Loading/>;
    }

    const rows = [];
    if (reportConfig && filter) {
      const errorTexts = reportNameError ? [reportNameError] : null;
      rows.push(this.renderRow('Report Name', 'reportName',
        <ValidatedInput
          value={reportName}
          helpText="Name will appear in downloaded filenames."
          errorTexts={errorTexts}
          onValueChange={v => reportConfig.changeReportName(v)}/>
      ));
      reportConfig.filters.forEach(col => {
        switch (col.interface_type) {
        case 'date_range':
          rows.push(this.renderRow(col.display, col.filter,
            <WizardFilterDateRange
              id={col.filter}
              updateFilter={v => reportConfig.setFilter(col.filter, v)}/>
          ));
          break;
        case 'search_select':
          rows.push(this.renderRow(col.display, col.filter,
            <WizardFilterSearchDropdown
              id={col.filter}
              updateFilter={v => reportConfig.setFilter(col.filter, v)}
              getHints={v =>
                reportConfig.getHints(col.filter, v)}/>
          ));
          break;
        case 'city_state':
          rows.push(this.renderRow(col.display, col.filter,
            <WizardFilterCityState
              id={col.filter}
              updateFilter={v => reportConfig.setFilter(col.filter, v)}
              getHints={(f, v) =>
                reportConfig.getHints(f, v)}/>
          ));
          break;
        case 'tags':
          rows.push(this.renderRow(col.display, col.filter,
            <WizardFilterTags
              tags={filter[col.filter] || []}
              addTag={(i, t) =>
                reportConfig.addToAndOrFilter(col.filter, i, t)}
              removeTag={(i, t) =>
                reportConfig.removeFromAndOrFilter(col.filter, i, t)}
              getHints={v => reportConfig.getHints(col.filter, v)}/>
          ));
          break;
        case 'search_multiselect':
          rows.push(this.renderRow(col.display, col.filter,
            <SearchInput
              id={col.filter}
              emptyOnSelect
              onSelect={v =>
                reportConfig.addToMultifilter(col.filter, v)}
              getHints={v =>
                reportConfig.getHints(col.filter, v)}/>
          ));
          rows.push(this.renderRow(
            '',
            col.filter + '-selected',
            <WizardFilterCollectedItems
              items={filter[col.filter] || []}
              remove={v =>
                reportConfig.removeFromMultifilter(
                  col.filter,
                  v)}/>));
          break;
        default:
          warning(true, 'Unknown interface type: ' + col.interface_type);
        }
      });
      rows.push(this.renderRow('', 'submit',
          <button
            className="button"
            onClick={() => reportConfig.run()}>
            Run Report
          </button>, true, true));
    }

    return (
      <form>
        <DataTypeSelectBar
          intentionChoices={reportingTypes}
          intentionValue={reportingType}
          onIntentionChange={v => this.onIntentionChange(v)}

          categoryChoices={reportTypes}
          categoryValue={reportType}
          onCategoryChange={v => this.onCategoryChange(v)}

          dataSetChoices={dataTypes}
          dataSetValue={dataType}
          onDataSetChange={v => this.onDataSetChange(v)}
          />
        {rows}
      </form>
    );
  }
}

SetUpReport.propTypes = {
  routeParams: PropTypes.shape({
    dataType: PropTypes.string,
  }).isRequired,
  reportFinder: PropTypes.object.isRequired,
};
