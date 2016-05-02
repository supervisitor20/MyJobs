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
      loading: true,
      reportingTypes: [],
      reportTypes: [],
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
    const {
      category: reportType,
      dataSet: dataType,
    } = this.props.location.query;
    this.buildReportConfig(reportingType, reportType, dataType);
  }

  onCategoryChange(reportType) {
    const {
      intention: reportingType,
      dataSet: dataType,
    } = this.props.location.query;
    this.buildReportConfig(reportingType, reportType, dataType);
  }

  onDataSetChange(dataType) {
    const {
      intention: reportingType,
      category: reportType,
    } = this.props.location.query;
    this.buildReportConfig(reportingType, reportType, dataType);
  }

  onMenuChanged(reportingTypes, reportTypes, dataTypes,
      reportConfig) {
    this.setState({
      reportingTypes,
      reportTypes,
      dataTypes,
      reportConfig,
    });
  }

  onFilterUpdate(filter) {
    const {history} = this.props;
    const oldQuery = this.props.location.query;

    const href = '/set-up-report';
    const query = {
      ...oldQuery,
      filterJson: JSON.stringify(filter),
    };
    history.replaceState(null, href, query);
  }

  onErrorsChanged(errors) {
    const reportNameError = errors.name;
    this.setState({reportNameError});
  }

  onReportNameChanged(reportName) {
    const {history} = this.props;
    const oldQuery = this.props.location.query;

    const href = '/set-up-report';
    const query = {...oldQuery, reportName};
    history.replaceState(null, href, query);
  }

  async loadData() {
    const {
      intention: reportingType,
      category: reportType,
      dataSet: dataType,
    } = this.props.location.query;
    await this.buildReportConfig(reportingType, reportType, dataType);
    this.setState({loading: false});
  }

  async buildReportConfig(reportingType, reportType, dataType) {
    const {
      reportDataId: reportDataIdRaw,
      filterJson,
      reportName,
    } = this.props.location.query;
    const {reportFinder} = this.props;
    const reportDataId = Number.parseInt(reportDataIdRaw, 10);
    let filter;
    try {
      filter = JSON.parse(filterJson);
    } catch (e) {
      // filter is corrupt somehow. Treat it as empty.
      filter = [];
    }

    reportFinder.buildReportConfiguration(
      reportingType,
      reportType,
      dataType,
      reportDataId,
      filter,
      reportName,
      n => this.onReportNameChanged(n),
      f => this.onFilterUpdate(f),
      errors => this.onErrorsChanged(errors),
      (...args) => this.handleNewReportDataId(...args));
  }

  handleNewReportDataId(newReportDataId, reportingType, reportType, dataType) {
    const {history} = this.props;
    const {filterJson} = this.props.location.query;

    const href = '/set-up-report';
    const query = {
      reportDataId: newReportDataId,
      intention: reportingType,
      category: reportType,
      dataSet: dataType,
      filterJson,
    };
    history.pushState(null, href, query);
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
      intention: reportingType,
      category: reportType,
      dataSet: dataType,
      filterJson,
      reportName,
    } = this.props.location.query;
    const {
      loading,
      reportConfig,
      reportNameError,
      reportingTypes,
      reportTypes,
      dataTypes,
    } = this.state;

    let filter;
    try {
      filter = JSON.parse(filterJson);
    } catch (e) {
      // filter is corrupt somehow. Don't try to render anything.
      filter = undefined;
    }

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
                value={reportConfig.currentFilter[col.filter] || ''}
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
                cityValue={reportConfig.currentFilter[col.filter].city || ''}
                stateValue={reportConfig.currentFilter[col.filter].state || ''}
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
                  map(reportConfig.currentFilter[col.filter] || [],
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
          intentionValue={reportingType || ''}
          onIntentionChange={v => this.onIntentionChange(v)}

          categoryChoices={reportTypes}
          categoryValue={reportType || ''}
          onCategoryChange={v => this.onCategoryChange(v)}

          dataSetChoices={dataTypes}
          dataSetValue={dataType || ''}
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
  history: PropTypes.object.isRequired,
  reportFinder: PropTypes.object.isRequired,
  location: PropTypes.shape({
    query: PropTypes.shape({
      intention: PropTypes.string,
      category: PropTypes.string,
      dataSet: PropTypes.string,
      reportDataId: PropTypes.string,
      filterJson: PropTypes.string.isRequired,
      reportName: PropTypes.string,
    }).isRequired,
  }).isRequired,
};
