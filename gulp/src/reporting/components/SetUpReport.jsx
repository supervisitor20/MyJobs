import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import warning from 'warning';
import {scrollUp} from 'common/dom';
import {forEach, map} from 'lodash-compat/collection';
import {
  setSimpleFilterAction,
  addToOrFilterAction,
  removeFromOrFilterAction,
  addToAndOrFilterAction,
  removeFromAndOrFilterAction,
  setReportNameAction,
} from '../actions/report-state-actions';

import {
  doGetHelp,
  doUpdateFilterWithDependencies,
  doRunReport,
} from '../actions/compound-actions';

import classnames from 'classnames';
import FilterDateRange from './FilterDateRange';
import FilterSearchDropdown from './FilterSearchDropdown';
import FilterCityState from './FilterCityState';
import FieldWrapper from 'common/ui/FieldWrapper';
import DataTypeSelectBar from './DataTypeSelectBar';
import TagAndFilter from './TagAndFilter';
import TextField from 'common/ui/TextField';
import SelectByNameOrTag from './SelectByNameOrTag';

class SetUpReport extends Component {
  onIntentionChange(intention) {
    const {history, category, dataSet} = this.props;
    history.pushState(null, '/', {intention, category, dataSet});
  }

  onCategoryChange(category) {
    const {history, intention, dataSet} = this.props;
    history.pushState(null, '/', {intention, category, dataSet});
  }

  onDataSetChange(dataSet) {
    const {history, intention, category} = this.props;
    history.pushState(null, '/', {intention, category, dataSet});
  }

  getHints(field, value) {
    const {dispatch, reportDataId, currentFilter} = this.props;
    dispatch(doGetHelp(reportDataId, currentFilter, field, value));
  }

  async handleRunReport(e) {
    e.preventDefault();

    const {dispatch, reportName, currentFilter, reportDataId} = this.props;

    scrollUp();
    await dispatch(doRunReport(reportDataId, reportName, currentFilter));
    const {reportNameErrors} = this.props;
    if (!reportNameErrors) {
      this.props.history.pushState(null, '/');
    }
  }

  dispatchFilterAction(action) {
    const {dispatch, filterInterface, reportDataId} = this.props;
    dispatch(action);
    dispatch(doUpdateFilterWithDependencies(filterInterface, reportDataId));
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
      fieldsLoading,
    } = this.props;

    const rows = [];
    if (filterInterface.length) {
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
      forEach(filterInterface, col => {
        switch (col.interface_type) {
        case 'date_range':
          const begin = (currentFilter[col.filter] || [])[0];
          const end = (currentFilter[col.filter] || [])[1];

          rows.push(
            <FieldWrapper key={col.filter} label="Date range">
              <FilterDateRange
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
              <FilterSearchDropdown
                id={col.filter}
                value={currentFilter[col.filter] || ''}
                updateFilter={v =>
                  this.dispatchFilterAction(
                    setSimpleFilterAction(col.filter, v))}
                getHints={v => this.getHints(col.filter, v)}
                hints={hints[col.filter]}/>
            </FieldWrapper>
          );
          break;
        case 'city_state':
          const values = currentFilter[col.filter] || {};
          rows.push(
            <FieldWrapper key={col.filter} label={col.display}>
              <FilterCityState
                id={col.filter}
                values={values}
                updateFilter={v =>
                  this.dispatchFilterAction(
                    setSimpleFilterAction(col.filter, v))}
                getHints={(f, v) => this.getHints(f, v)}
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
                getHints={v => this.getHints(col.filter, v)}
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

              <SelectByNameOrTag
                getItemHints={v => this.getHints(col.filter, v)}
                itemsLoading={fieldsLoading[col.filter]}
                availableItemHints={hints[col.filter] || []}
                selectedItems={currentFilter[col.filter] || []}
                onSelectItemAdd={vs =>
                  this.dispatchFilterAction(
                    addToOrFilterAction(col.filter, vs))}
                onSelectItemRemove={vs =>
                  this.dispatchFilterAction(
                    removeFromOrFilterAction(col.filter, vs))}
                tagsLoading={false}
                placeholder = {'Filter by ' + col.display}
                searchPlaceholder = "Filter these choices"
                showCounter
              />

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
  reportName: PropTypes.string,
  reportNameErrors: PropTypes.arrayOf(PropTypes.string.isRequired),
  intention: PropTypes.string,
  category: PropTypes.string,
  dataSet: PropTypes.string,
  reportDataId: PropTypes.number,
  hints: PropTypes.object.isRequired,
  currentFilter: PropTypes.object.isRequired,
  filterInterface: PropTypes.arrayOf(
    PropTypes.shape({
      filter: PropTypes.string.isRequired,
      interface_type: PropTypes.string.isRequired,
      display: PropTypes.string.isRequired,
    }).isRequired).isRequired,
  fieldsLoading: PropTypes.objectOf(
    PropTypes.bool.isRequired
  ).isRequired,
};

export default connect(s => ({
  currentFilter: s.reportState.currentFilter,
  filterInterface: s.reportState.filterInterface,
  reportName: s.reportState.reportName,
  hints: s.reportState.hints,
  reportNameErrors: s.errors.currentErrors.name,
  intention: s.dataSetMenu.intention,
  category: s.dataSetMenu.category,
  dataSet: s.dataSetMenu.dataSet,
  reportDataId: s.dataSetMenu.reportDataId,
  fieldsLoading: s.loading.fields,
}))(SetUpReport);
