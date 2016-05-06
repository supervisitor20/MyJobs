import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';
import {forEach} from 'lodash-compat/collection';
import {isEqual} from 'lodash-compat/lang';

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
      filter: {},
      reportName: null,
      reportingTypes: [],
      reportTypes: [],
      dataTypes: [],
    };
  }

  componentDidMount() {
    const {reportFinder, history} = this.props;
    this.menuCallbackRef = reportFinder.subscribeToMenuChoices(
        (...choices) => this.onMenuChanged(...choices));
    this.loadData();
    this.historyUnlisten = (
      history.listen((something, loc) => this.handleHistory(something, loc)));
  }

  componentWillUnmount() {
    const {reportFinder} = this.props;
    this.historyUnlisten();
    reportFinder.unsubscribeToMenuChoices(this.menuCallbackRef);
  }

  onIntentionChange(intention) {
    const {history} = this.props;
    const {category, dataSet} = this.props.location.query;
    history.pushState(null, '/', {intention, category, dataSet});
  }

  onCategoryChange(category) {
    const {history} = this.props;
    const {intention, dataSet} = this.props.location.query;
    console.log('onCategoryChange', intention, category, dataSet);
    history.pushState(null, '/', {intention, category, dataSet});
  }

  onDataSetChange(dataSet) {
    const {history} = this.props;
    const {intention, category} = this.props.location.query;
    history.pushState(null, '/', {intention, category, dataSet});
  }

  handleHistory(something, loc) {
    const lastComponent = loc.components[loc.components.length - 1];
    console.log('handleHistory', lastComponent === SetUpReport, loc);
    if (lastComponent === SetUpReport) {
      this.loadData();
    }
  };


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
    const {
      intention: reportingType,
      category: reportType,
      dataSet: dataType,
    } = this.props.location.query;
    await this.buildReportConfig(reportingType, reportType, dataType, {});
    this.setState({loading: false});
  }

  async buildReportConfig(reportingType, reportType, dataType, overrideFilter) {
    const {
      reportDataId: reportDataIdRaw,
    } = this.props.location.query;
    const {reportFinder} = this.props;
    const {filter, reportName} = this.state;
    const reportDataId = Number.parseInt(reportDataIdRaw, 10);
    let newFilter;
    if (overrideFilter) {
      newFilter = overrideFilter;
    } else {
      newFilter = filter;
    }

    reportFinder.buildReportConfiguration(
      reportingType,
      reportType,
      dataType,
      reportDataId,
      newFilter,
      reportName,
      n => this.onReportNameChanged(n),
      f => this.onFilterUpdate(f),
      errors => this.onErrorsChanged(errors),
      (...args) => this.handleNewReportDataId(...args));
  }

  handleNewReportDataId(newReportDataId, reportingType, reportType, dataType) {
    const {history} = this.props;

    const href = '/set-up-report';
    const query = {
      reportDataId: newReportDataId,
      intention: reportingType,
      category: reportType,
      dataSet: dataType,
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
    } = this.props.location.query;
    const {
      loading,
      filter,
      reportConfig,
      reportName,
      reportNameError,
      reportingTypes,
      reportTypes,
      dataTypes,
    } = this.state;

    if (loading) {
      return <Loading/>;
    }

    const rows = [];
    if (reportConfig) {
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
          const values = reportConfig.currentFilter[col.filter] || {};
          rows.push(
            <FieldWrapper key={col.filter} label={col.display}>
              <WizardFilterCityState
                id={col.filter}
                cityValue={values.city || ''}
                stateValue={values.state || ''}
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
                selected={reportConfig.currentFilter[col.filter] || []}
                onAdd = {vs => forEach(vs, v =>
                  reportConfig.addToMultifilter(col.filter, v))}
                onRemove = {vs => forEach(vs, v =>
                  reportConfig.removeFromMultifilter(col.filter, v))}/>

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
    }).isRequired,
  }).isRequired,
};
