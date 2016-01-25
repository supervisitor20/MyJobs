import React, {PropTypes, Component} from 'react';
import Button from 'react-bootstrap/lib/Button';
import warning from 'warning';

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
    };
  }

  componentDidMount() {
    this.updateState();
  }

  async getHints(filter, partial) {
    const {reportConfig} = this.props;
    return await reportConfig.getHints(filter, partial);
  }

  updateFilter(filter, value) {
    const {reportConfig} = this.props;
    reportConfig.setFilter(filter, value);
    this.updateState();
  }

  addToMultifilter(filter, value) {
    const {reportConfig} = this.props;
    reportConfig.addToMultifilter(filter, value);
    this.updateState();
  }

  removeFromMultifilter(filter, value) {
    const {reportConfig} = this.props;
    reportConfig.removeFromMultifilter(filter, value);
    this.updateState();
  }

  addToAndOrFilter(filter, index, value) {
    const {reportConfig} = this.props;
    reportConfig.addToAndOrFilter(filter, index, value);
    this.updateState();
  }

  removeFromAndOrFilter(filter, index, value) {
    const {reportConfig} = this.props;
    reportConfig.removeFromAndOrFilter(filter, index, value);
    this.updateState();
  }

  updateState() {
    const {reportConfig} = this.props;
    this.setState({
      filter: reportConfig.getFilter(),
    });
  }

  renderRow(displayName, key, content) {
    return (
      <div key={key} className="row">
        <div className="span2" style={{textAlign: 'right'}}>
          {displayName}
        </div>
        <div className="span5">
          {content}
        </div>
      </div>
    );
  }

  render() {
    const {reportConfig} = this.props;
    const {reportName} = this.state;

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
        {this.renderRow('', 'head', <h2>Set Up Report</h2>)}
        <hr/>
        {rows}
        <hr/>
        {this.renderRow('', 'submit',
          <Button
            onClick={() => reportConfig.run(reportName)}>
            Run Report
          </Button>)}

      </form>
    );
  }
}

WizardPageFilter.propTypes = {
  reportConfig: PropTypes.object.isRequired,
};
