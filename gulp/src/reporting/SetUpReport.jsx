import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';
import {forEach, map} from 'lodash-compat/collection';

import classnames from 'classnames';
import {WizardFilterDateRange} from './wizard/WizardFilterDateRange';
import {WizardFilterSearchDropdown} from './wizard/WizardFilterSearchDropdown';
import {WizardFilterCityState} from './wizard/WizardFilterCityState';
import FieldWrapper from 'common/ui/FieldWrapper';
import DataTypeSelectBar from 'reporting/DataTypeSelectBar';
import MultiSelectFilter from './MultiSelectFilter';
import TagAndFilter from './TagAndFilter';
import TextField from 'common/ui/TextField';

export default class SetUpReport extends Component {
  constructor() {
    super();
    this.state = {
      reportName: '',
      loading: true,
      reportingType: '',
      reportingTypes: [],
      reportType: '',
      reportTypes: [],
      dataType: '',
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
      const errorTexts = reportNameError ? [reportNameError] : [];
      rows.push(
        <FieldWrapper
          key="reportName"
          label="Report Name"
          helpText="Name will appear in downloaded filenames."
          errors={errorTexts}>
          <TextField
            value={reportName}
            name=""
            autoFocus
            onChange={v => reportConfig.changeReportName(v.target.value)}/>
        </FieldWrapper>
      );
      reportConfig.filters.forEach(col => {
        switch (col.interface_type) {
        case 'date_range':
          rows.push(
            <FieldWrapper key={col.filter} label={col.display}>
              <WizardFilterDateRange
                id={col.filter}
                updateFilter={v => reportConfig.setFilter(col.filter, v)}/>
            </FieldWrapper>
          );
          break;
        case 'search_select':
          rows.push(
            <FieldWrapper key={col.filter} label={col.display}>
              <WizardFilterSearchDropdown
                id={col.filter}
                updateFilter={v => reportConfig.setFilter(col.filter, v)}
                getHints={v =>
                  reportConfig.getHints(col.filter, v)}/>
            </FieldWrapper>
          );
          break;
        case 'city_state':
          rows.push(
            <FieldWrapper key={col.filter} label={col.display}>
              <WizardFilterCityState
                id={col.filter}
                updateFilter={v => reportConfig.setFilter(col.filter, v)}
                getHints={(f, v) =>
                  reportConfig.getHints(f, v)}/>
            </FieldWrapper>
          );
          break;
        case 'tags':
          rows.push(
            <FieldWrapper
              key={col.filter}
              label={col.display}>

              <TagAndFilter
                getHints={v => reportConfig.getHints(col.filter, v)}
                selected={filter[col.filter] || []}
                onChoose={(i, t) =>
                  reportConfig.addToAndOrFilter(col.filter, i, t)}
                onRemove={(i, t) =>
                  reportConfig.removeFromAndOrFilter(col.filter, i, t)}/>

            </FieldWrapper>
            );
          break;
        case 'search_multiselect':
          rows.push(
            <FieldWrapper
              key={col.filter}
              label={col.display}>

              <MultiSelectFilter
                availableHeader="Available"
                selectedHeader="Selected"
                getHints={v => reportConfig.getHints(col.filter, v)}
                selected={
                  map(reportConfig.multiFilter[col.filter] || [],
                    v => ({value: v.key, display: v.display}))}
                onAdd = {vs => forEach(vs, v =>
                  reportConfig.addToMultifilter(col.filter,
                    {key: v.value, display: v.display}))}
                onRemove = {vs => forEach(vs, v =>
                  reportConfig.removeFromMultifilter(col.filter,
                    {key: v.value, display: v.display}))}/>

            </FieldWrapper>
            );
          break;
        default:
          warning(true, 'Unknown interface type: ' + col.interface_type);
        }
      });
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
        <div className="row actions text-center">
          <div className="col-xs-12 col-md-4"></div>
          <div className="col-xs-12 col-md-8">
            <button
              className="button"
              onClick={e => {e.preventDefault(); reportConfig.run();}}>
              Run Report
            </button>
          </div>
        </div>
      </form>
    );
  }
}

SetUpReport.propTypes = {
  reportFinder: PropTypes.object.isRequired,
};
