import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';
import Select from 'common/ui/Select';

import classnames from 'classnames';
import {WizardFilterDateRange} from './WizardFilterDateRange';
import {WizardFilterSearchDropdown} from './WizardFilterSearchDropdown';
import {WizardFilterTags} from './WizardFilterTags';
import {WizardFilterCollectedItems} from './WizardFilterCollectedItems';
import {WizardFilterCityState} from './WizardFilterCityState';
import {SearchInput} from 'common/ui/SearchInput';

export class WizardPageFilter extends Component {
  constructor() {
    super();
    this.state = {
      reportName: 'Report Name',
      loading: true,
      initial: {display: 'No filter', value: 0},
      choices: [
          {display: 'No filter', value: 0},
          {display: 'Filter by name', value: 1},
      ],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  async getHints(filter, partial) {
    const {reportConfig} = this.state;
    return await reportConfig.getHints(filter, partial);
  }

  async loadData() {
    await this.buildReportConfig();
    this.updateState();
    this.setState({loading: false});
  }

  async buildReportConfig() {
    const {reportFinder} = this.props;
    const {presentationType} = this.props.routeParams;
    const reportConfig = await reportFinder.buildReportConfiguration(
      presentationType);
    this.setState({reportConfig});
  }

  updateFilter(filter, value) {
    const {reportConfig} = this.state;
    reportConfig.setFilter(filter, value);
    this.updateState();
  }

  addToMultifilter(filter, value) {
    const {reportConfig} = this.state;
    reportConfig.addToMultifilter(filter, value);
    this.updateState();
  }

  removeFromMultifilter(filter, value) {
    const {reportConfig} = this.state;
    reportConfig.removeFromMultifilter(filter, value);
    this.updateState();
  }

  addToAndOrFilter(filter, index, value) {
    const {reportConfig} = this.state;
    reportConfig.addToAndOrFilter(filter, index, value);
    this.updateState();
  }

  removeFromAndOrFilter(filter, index, value) {
    const {reportConfig} = this.state;
    reportConfig.removeFromAndOrFilter(filter, index, value);
    this.updateState();
  }

  updateState() {
    const {reportConfig} = this.state;
    this.setState({
      filter: reportConfig.getFilter(),
    });
  }

  changeHandler(value) {
    this.setState({
      initial: value,
    });
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

  renderSetupRow() {
    const {intentionChoices, intentionInitial, categoryChoices, categoryInitial, dataSetChoices, dataSetInitial} = this.props;
    console.log(this.props);
    return (
      <div className="row">
        <fieldset className="fieldset-border">
            <legend className="fieldset-border">Report Configuration</legend>
            <div className="col-xs-3">
              <label>Report Intention
                <Select
                  onChange={v => this.changeHandler(v)}
                  choices = {intentionChoices}
                  initial = {intentionInitial}
                  name = ""
                />
              </label>
            </div>
            <div className="col-xs-3">
              <label>Report Category
                <Select
                  onChange={v => this.changeHandler(v)}
                  choices = {categoryChoices}
                  initial = {categoryInitial}
                  name = ""
                />
              </label>
            </div>
            <div className="col-xs-6">
              <label>Data Set
                <Select
                  onChange={v => this.changeHandler(v)}
                  choices = {dataSetChoices}
                  initial = {dataSetInitial}
                  name = ""
                />
              </label>
            </div>
        </fieldset>
      </div>
    );
  }

  render() {
    const {loading, reportConfig, reportName} = this.state;

    if (loading) {
      return <Loading/>;
    }

    const rows = [];
    reportConfig.filters.forEach(col => {
      switch (col.interface_type) {
      case 'date_range':
        rows.push(this.renderRow(col.display, col.filter,
          <WizardFilterDateRange
            id={col.filter}
            updateFilter={v =>
              this.updateFilter(col.filter, v)}/>
        ));
        break;
      case 'search_select':
        rows.push(this.renderRow(col.display, col.filter,
          <WizardFilterSearchDropdown
            id={col.filter}
            updateFilter={v =>
              this.updateFilter(col.filter, v)}
            getHints={v =>
              this.getHints(col.filter, v)}/>
        ));
        break;
      case 'city_state':
        rows.push(this.renderRow(col.display, col.filter,
          <WizardFilterCityState
            id={col.filter}
            updateFilter={v =>
              this.updateFilter(col.filter, v)}
            getHints={(f, v) =>
              this.getHints(f, v)}/>
        ));
        break;
      case 'tags':
        rows.push(this.renderRow(col.display, col.filter,
          <WizardFilterTags
            tags={reportConfig.getAndOrFilter(col.filter)}
            addTag={(i, t) =>
              this.addToAndOrFilter(col.filter, i, t)}
            removeTag={(i, t) =>
              this.removeFromAndOrFilter(col.filter, i, t)}
            getHints={v => this.getHints(col.filter, v)}/>
        ));
        break;
      case 'search_multiselect':
        rows.push(this.renderRow(col.display, col.filter,
          <SearchInput
            id={col.filter}
            emptyOnSelect
            onSelect={v =>
              this.addToMultifilter(col.filter, v)}
            getHints={v =>
              this.getHints(col.filter, v)}/>
        ));
        rows.push(this.renderRow(
          '',
          col.filter + '-selected',
          <WizardFilterCollectedItems
            items={
              reportConfig.getMultiFilter(col.filter)
                || []
            }
            remove={v =>
              this.removeFromMultifilter(
                col.filter,
                v)}/>));
        break;
      default:
        warning(true, 'Unknown interface type: ' + col.interface_type);
      }
    });

    return (
      <form>
        {this.renderSetupRow()}
        {this.renderRow('', 'head', <h2>Set Up Report</h2>)}
        <hr/>
        {rows}
        <hr/>
        {this.renderRow('', 'submit',
          <button
            className="button"
            onClick={() => reportConfig.run(reportName)}>
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
  intentionChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  intentionInitial: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  categoryChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  categoryInitial: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  dataSetChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  dataSetInitial: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
};

WizardPageFilter.defaultProps = {
  intentionChoices: [{value: 1, display: 'PRM'}],
  intentionInitial: [{value: 1, display: 'PRM'}],
  categoryChoices: [{value: 1, display: 'Partners'}, {value: 2, display: 'Contacts'}, {value: 3, display: 'Communications'}],
  categoryInitial: [{value: 1, display: 'Partners'}],
  dataSetChoices: [{value: 1, display: 'Communication Records (state)'}],
  dataSetInitial: [{value: 1, display: 'Communication Records (state)'}],
};
