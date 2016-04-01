import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';
import {forEach, map} from 'lodash-compat/collection';

import {WizardFilterDateRange} from './WizardFilterDateRange';
import {WizardFilterSearchDropdown} from './WizardFilterSearchDropdown';
import {WizardFilterTags} from './WizardFilterTags';
import {WizardFilterCityState} from './WizardFilterCityState';
import FieldWrapper from 'common/ui/FieldWrapper';
import {SelectElementController} from '../SelectElementController';

export class WizardPageFilter extends Component {
  constructor() {
    super();
    this.state = {
      reportName: '',
      loading: true,
    };
  }

  componentDidMount() {
    this.loadData();
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

  async buildReportConfig() {
    const {reportFinder} = this.props;
    const {presentationType} = this.props.routeParams;
    const reportConfig = await reportFinder.buildReportConfiguration(
      presentationType,
      n => this.onReportNameChanged(n),
      f => this.onFilterUpdate(f),
      errors => this.onErrorsChanged(errors));
    this.setState({reportConfig});
    reportConfig.runCallbacks();
  }

  render() {
    const {
      loading,
      reportConfig,
      reportName,
      reportNameError,
      filter,
    } = this.state;

    if (loading) {
      return <Loading/>;
    }

    const rows = [];
    const errorTexts = reportNameError ? [reportNameError] : [];
    rows.push(
      <FieldWrapper
        key="reportName"
        label="Report Name"
        helpText="Name will appear in downloaded filenames."
        errors={errorTexts}>
        <input
          value={reportName}
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
          <FieldWrapper key={col.filter} label={col.display}>
            <WizardFilterTags
              tags={filter[col.filter] || []}
              addTag={(i, t) =>
                reportConfig.addToAndOrFilter(col.filter, i, t)}
              removeTag={(i, t) =>
                reportConfig.removeFromAndOrFilter(col.filter, i, t)}
              getHints={v => reportConfig.getHints(col.filter, v)}/>
          </FieldWrapper>
        );
        break;
      case 'search_multiselect':
        rows.push(
          <FieldWrapper
            key={col.filter}
            label={col.display}>

            <SelectElementController
              getHints={v => reportConfig.getHints(col.filter, v)}
              selectedOptions = {
                map(reportConfig.multiFilter[col.filter] || [],
                  v => ({value: v.key, display: v.display}))}
              onSelectAdd = {vs => forEach(vs, v =>
                reportConfig.addToMultifilter(col.filter,
                  {key: v.value, display: v.display}))}
              onSelectRemove = {vs => forEach(vs, v =>
                reportConfig.removeFromMultifilter(col.filter,
                  {key: v.value, display: v.display}))}
            />

          </FieldWrapper>
          );
        break;
      default:
        warning(true, 'Unknown interface type: ' + col.interface_type);
      }
    });
    return (
      <form>
        {rows}
        <div className="row actions text-center">
          <div className="col-xs-12 col-md-4"></div>
          <div className="col-xs-12 col-md-8">
            <button
              className="button"
              onClick={() => reportConfig.run()}>
              Run Report
            </button>
          </div>
        </div>
      </form>
    );
  }
}

WizardPageFilter.propTypes = {
  routeParams: PropTypes.shape({
    presentationType: PropTypes.string.isRequired,
  }).isRequired,
  reportFinder: PropTypes.object.isRequired,
};
