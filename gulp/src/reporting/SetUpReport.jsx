import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';
import {scrollUp} from 'common/dom';
import {forEach, map} from 'lodash-compat/collection';
import {debounce} from 'lodash-compat/function';
import {
  setSimpleFilterAction,
  addToOrFilterAction,
  removeFromOrFilterAction,
  addToAndOrFilterAction,
  removeFromAndOrFilterAction,
  setReportNameAction,
} from './report-state-actions';

import {
  doGetHelp,
  doUpdateFilterWithDependencies,
  doRunReport,
} from './compound-actions';

import classnames from 'classnames';
import {WizardFilterDateRange} from './wizard/WizardFilterDateRange';
import {WizardFilterSearchDropdown} from './wizard/WizardFilterSearchDropdown';
import {WizardFilterCityState} from './wizard/WizardFilterCityState';
import FieldWrapper from 'common/ui/FieldWrapper';
import DataTypeSelectBar from 'reporting/DataTypeSelectBar';
import MultiSelectFilter from './MultiSelectFilter';
import TagAndFilter from './TagAndFilter';
import TextField from 'common/ui/TextField';

class SetUpReport extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };
    this.dispatchFilterAction = debounce(
      action => this.rawDispatchFilterAction(action),
      300,
      {
        leading: false,
        trailing: true,
      });
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

  async handleRunReport(e) {
    e.preventDefault();

    const {
      reportDataId: reportDataIdRaw,
    } = this.props.location.query;
    const reportDataId = Number.parseInt(reportDataIdRaw, 10);
    const {dispatch, reportName, currentFilter} = this.props;

    scrollUp();
    await dispatch(doRunReport(reportDataId, reportName, currentFilter));
    const {reportNameErrors} = this.props;
    if (!reportNameErrors) {
      this.props.history.pushState(null, '/');
    }
  }

  rawDispatchFilterAction(action) {
    const {dispatch, filterInterface} = this.props;
    const {reportDataId} = this.props.location.query;
    dispatch(doUpdateFilterWithDependencies(
        action, filterInterface, reportDataId));
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
      dispatch,
      currentFilter,
      filterInterface,
      reportName,
      reportNameErrors,
      hints,
    } = this.props;
    const {
      reportDataId,
    } = this.props.location.query;
    const {
      loading,
    } = this.state;

    if (loading) {
      return <Loading/>;
    }

    const rows = [];
    if (filterInterface.length > 0) {
      const errorTexts = map(reportNameErrors, e => e.message);
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
            onChange={v => dispatch(setReportNameAction(v.target.value))}/>
        </FieldWrapper>
      );
      filterInterface.forEach(col => {
        function getHints(field, value) {
          dispatch(doGetHelp(reportDataId, currentFilter, field, value));
        }

        switch (col.interface_type) {
        case 'date_range':
          const begin = (currentFilter[col.filter] || [])[0];
          const end = (currentFilter[col.filter] || [])[1];

          rows.push(
            <FieldWrapper key={col.filter} label="Date range">
              <WizardFilterDateRange
                id={col.filter}
                updateFilter={v =>
                  this.dispatchFilterAction(
                    setSimpleFilterAction(col.filter, v))}
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
                value={currentFilter[col.filter] || ''}
                updateFilter={v =>
                  this.dispatchFilterAction(
                    setSimpleFilterAction(col.filter, v))}
                getHints={v => getHints(col.filter, v)}
                hints={hints[col.filter]}/>
            </FieldWrapper>
          );
          break;
        case 'city_state':
          const values = currentFilter[col.filter] || {};
          rows.push(
            <FieldWrapper key={col.filter} label={col.display}>
              <WizardFilterCityState
                id={col.filter}
                values={values}
                updateFilter={v =>
                  this.dispatchFilterAction(
                    setSimpleFilterAction(col.filter, v))}
                getHints={(f, v) => getHints(f, v)}
                hints={hints}/>
            </FieldWrapper>
          );
          break;
        case 'tags':
          rows.push(
            <FieldWrapper
              key={col.filter}
              label={col.display}>

              <TagAndFilter
                getHints={v => getHints(col.filter, v)}
                available={hints[col.filter] || []}
                selected={currentFilter[col.filter] || []}
                onChoose={(i, t) =>
                  this.dispatchFilterAction(
                    addToAndOrFilterAction(col.filter, i, t))}
                onRemove={(i, t) =>
                  this.dispatchFilterAction(
                    removeFromAndOrFilterAction(col.filter, i, t))}/>

            </FieldWrapper>
            );
          break;
        case 'search_multiselect':
          rows.push(
            <FieldWrapper
              key={col.filter}
              label={col.display}>

              <MultiSelectFilter
                getHints={v => getHints(col.filter, v)}
                available={hints[col.filter] || []}
                selected={currentFilter[col.filter] || []}
                onAdd = {vs => forEach(vs, v =>
                  this.dispatchFilterAction(
                    addToOrFilterAction(col.filter, v)))}
                onRemove = {vs => forEach(vs, v =>
                  this.dispatchFilterAction(
                    removeFromOrFilterAction(col.filter, v)))}/>

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
          onIntentionChange={v => this.onIntentionChange(v)}

          onCategoryChange={v => this.onCategoryChange(v)}

          onDataSetChange={v => this.onDataSetChange(v)}
          />
        {rows}
        <div className="row actions text-center">
          <div className="col-xs-12 col-md-4"></div>
          <div className="col-xs-12 col-md-8">
            <button
              className="button primary"
              onClick={ e => this.handleRunReport(e)}>
              Run Report
            </button>
          </div>
        </div>
      </div>
    );
  }
}

SetUpReport.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  reportFinder: PropTypes.object.isRequired,
  reportName: PropTypes.string,
  reportNameErrors: PropTypes.arrayOf(PropTypes.string.isRequired),
  hints: PropTypes.object.isRequired,
  currentFilter: PropTypes.object.isRequired,
  filterInterface: PropTypes.arrayOf(
    PropTypes.shape({
      filter: PropTypes.string.isRequired,
      interface_type: PropTypes.string.isRequired,
      display: PropTypes.string.isRequired,
    }).isRequired).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      name: PropTypes.string.isRequired,
      filter: PropTypes.object,
    }),
    query: PropTypes.shape({
      intention: PropTypes.string,
      category: PropTypes.string,
      dataSet: PropTypes.string,
      reportDataId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default connect(s => ({
  currentFilter: s.reportState.currentFilter,
  filterInterface: s.reportState.filterInterface,
  reportName: s.reportState.reportName,
  hints: s.reportState.hints,
  reportNameErrors: s.errors.currentErrors.name,
}))(SetUpReport);
