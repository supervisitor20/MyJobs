import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';
import {scrollUp} from 'common/dom';
import {forEach} from 'lodash-compat/collection';
import {debounce} from 'lodash-compat/function';

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
      filter: null,
      reportName: null,
      reportingTypes: [],
      reportTypes: [],
      dataTypes: [],
    };
  }

  componentDidMount() {
    const {reportFinder, history} = this.props;
    this.mounted = true;
    this.unsubscribeToMenuChoices = reportFinder.subscribeToMenuChoices(
        (...choices) => this.onMenuChanged(...choices));
    this.historyUnlisten = (
      history.listen((something, loc) => this.handleHistory(something, loc)));
    // Further hackery. Wait for things to settle out so we don't pound
    // the help api and ultimately confuse ourselves. Otherwise two pane select
    // triggers this a lot when mass select/deselects happen.
    this.noteFilterChanges = debounce(
      () => reportFinder.noteFilterChanges(),
      300,
      {
        leading: false,
        trailing: true,
      });
  }

  componentWillUnmount() {
    this.historyUnlisten();
    this.unsubscribeToMenuChoices();
    this.mounted = false;
  }

  onIntentionChange(intention) {
    const {history} = this.props;
    const {category, dataSet} = this.props.location.query;
    history.pushState(null, '/', {intention, category, dataSet});
  }

  onCategoryChange(category) {
    const {history} = this.props;
    const {intention, dataSet} = this.props.location.query;
    history.pushState(null, '/', {intention, category, dataSet});
  }

  onDataSetChange(dataSet) {
    const {history} = this.props;
    const {intention, category} = this.props.location.query;
    history.pushState(null, '/', {intention, category, dataSet});
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
    this.setState({filter});
    this.noteFilterChanges();
  }

  onErrorsChanged(errors) {
    const reportNameError = errors.name;
    this.setState({reportNameError});
  }

  onReportNameChanged(reportName) {
    const {maxNameLength} = this.props;
    this.setState({reportName: reportName.substring(0, maxNameLength)});
  }

  handleHistory(something, loc) {
    const lastComponent = loc.components[loc.components.length - 1];
    if (lastComponent === SetUpReport) {
      this.loadData();
    }
  }

  async loadData() {
    const {
      intention: reportingType,
      category: reportType,
      dataSet: dataType,
    } = this.props.location.query;
    const locationState = (this.props.location || {}).state || {};
    const {filter, name} = locationState;

    await this.buildReportConfig(
      reportingType, reportType, dataType, name, filter);
  }

  async buildReportConfig(reportingType, reportType, dataType, overrideName,
      newFilter) {
    const {
      reportDataId: reportDataIdRaw,
    } = this.props.location.query;
    const {reportFinder} = this.props;
    const {reportName} = this.state;
    const reportDataId = Number.parseInt(reportDataIdRaw, 10);

    let newName;
    if (overrideName) {
      newName = overrideName;
    } else {
      newName = reportName;
    }

    this.setState({loading: true});
    await reportFinder.buildReportConfiguration(
      reportingType,
      reportType,
      dataType,
      reportDataId,
      newFilter,
      newName,
      n => this.onReportNameChanged(n),
      f => this.onFilterUpdate(f),
      errors => this.onErrorsChanged(errors),
      (...args) => this.handleNewReportDataId(...args));
    if (this.mounted) {
      this.setState({loading: false});
    }
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
    const {reportFinder} = this.props;
    const {
      intention: reportingType,
      category: reportType,
      dataSet: dataType,
    } = this.props.location.query;
    const {maxNameLength} = this.props;
    const {
      loading,
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
            autoFocus="autofocus"
            onChange={v => reportConfig.changeReportName(v.target.value)}
            maxLength={maxNameLength}/>
        </FieldWrapper>
      );
      reportConfig.filters.forEach(col => {
        switch (col.interface_type) {
        case 'date_range':
          const begin = (reportConfig.currentFilter[col.filter] || [])[0];
          const end = (reportConfig.currentFilter[col.filter] || [])[1];

          rows.push(
            <FieldWrapper key={col.filter} label="Date range">
              <WizardFilterDateRange
                id={col.filter}
                updateFilter={v => reportConfig.setFilter(col.filter, v)}
                begin={begin}
                end={end}
                />
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
                selected={reportConfig.currentFilter[col.filter] || []}
                onChoose={(i, t) =>
                  reportConfig.addToAndOrFilter(col.filter, i, t)}
                onRemove={(i, t) =>
                  reportConfig.removeFromAndOrFilter(col.filter, i, t)}/>

            </FieldWrapper>
            );
          break;
        case 'search_multiselect':
          // Hack. MultiSelect filter will subscribe to filter updates if we
          // pass reportFinder.
          let passReportFinder;
          if (col.filter === 'contact' || col.filter === 'partner') {
            passReportFinder = reportFinder;
          }
          let removeSelected;
          if (col.filter === 'contact') {
            removeSelected = true;
          }

          rows.push(
            <FieldWrapper
              key={col.filter}
              label={col.display}>

              <MultiSelectFilter
                availableHeader="Available"
                selectedHeader="Selected"
                getHints={v =>
                  reportConfig.getHints(col.filter, v)}
                selected={reportConfig.currentFilter[col.filter] || []}
                onAdd = {vs => forEach(vs, v =>
                  reportConfig.addToMultifilter(col.filter, v))}
                onRemove = {vs => forEach(vs, v =>
                  reportConfig.removeFromMultifilter(col.filter, v))}
                reportFinder={passReportFinder}
                removeSelected={removeSelected}/>

            </FieldWrapper>
            );
          break;
        default:
          warning(true, 'Unknown interface type: ' + col.interface_type);
        }
      });
    }

    return (
      <div>
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
              className="button primary"
              onClick={ e => {e.preventDefault(); scrollUp(); reportConfig.run();}}>
              Run Report
            </button>
          </div>
        </div>
      </div>
    );
  }
}

SetUpReport.propTypes = {
  history: PropTypes.object.isRequired,
  reportFinder: PropTypes.object.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      name: PropTypes.string.isRequired,
      filter: PropTypes.object.isRequired,
    }),
    query: PropTypes.shape({
      intention: PropTypes.string,
      category: PropTypes.string,
      dataSet: PropTypes.string,
      reportDataId: PropTypes.string,
    }).isRequired,
  }).isRequired,
  maxNameLength: PropTypes.number,
};

SetUpReport.defaultProps = {
  maxNameLength: 24,
};
