import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';

import classnames from 'classnames';
import {WizardFilterDateRange} from './WizardFilterDateRange';
import {WizardFilterSearchDropdown} from './WizardFilterSearchDropdown';
import {WizardFilterTags} from './WizardFilterTags';
import {WizardFilterCollectedItems} from './WizardFilterCollectedItems';
import {WizardFilterCityState} from './WizardFilterCityState';
import {SearchInput} from 'common/ui/SearchInput';
import {ValidatedInput} from 'common/ui/ValidatedInput';

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
    } = this.state;

    if (loading) {
      return <Loading/>;
    }

    const rows = [];
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

    return (
      <form>
        {this.renderRow('', 'head', <h2>Set Up Report</h2>)}
        <hr/>
        {rows}
        <hr/>
        {this.renderRow('', 'submit',
          <button
            className="button"
            onClick={() => reportConfig.run()}>
            Run Report
          </button>, true, true)}
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
