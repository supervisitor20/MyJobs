import React, {Component} from 'react';

import {SortByController} from '../SortByController';
import CheckBox from '../../common/ui/CheckBox';
import Select from 'common/ui/Select';
import {lookupByValue} from 'common/array';
import classnames from 'classnames';

export class ExportReport extends Component {
  constructor() {
    super();
    this.state = {};
  }

  onChange(e) {
    console.log(e);
  }

  render() {
    const {contactChoices, recordCount} = this.props;
    return (
      <div id="export-page">
        <div className="row">
          <div className="col-md-4 col-xs-12">
            <label>Sort By:</label>
          </div>
          <div className="col-md-8 col-xs-12">
          <SortByController />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
              <label>Fields to include:</label>
            </div>
            <div className="col-md-8">
              <div>
                <label htmlFor="selectAll">
                  <CheckBox
                    name="selectAll"
                    onChange={e => this.onChange(e, this)}
                  />
                Deselect All</label>
              </div>
              <div>
                <label htmlFor="contact">
                  <CheckBox
                    name="contact"
                    onChange={e => this.onChange(e, this)}
                  />
                Contact</label>
              </div>
              <div>
                <label htmlFor="contactEmail">
                  <CheckBox
                    name="contactEmail"
                    onChange={e => this.onChange(e, this)}
                  />
                Contact Email</label>
              </div>
            </div>
        </div>
        <div className="row">
          <div className="col-md-4 col-xs-12">
            <label htmlFor="outputFormat">Output Format</label>
          </div>
          <div className="col-md-8 col-xs-12">
            <Select
              name="outputFormat"
              onChange={v => this.changeHandler(v)}
              value={lookupByValue(contactChoices, 1).display}
              choices = {contactChoices}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-offset-4 col-md-8 col-xs-12">
            <p id="record-count">({recordCount} records will be included in this report)</p>
          </div>
        </div>
        <div className={
          classnames(
            'row',
            'actions',
            'text-center',
            )}>
          <div className="col-md-offset-4 col-md-8 col-xs-12">
            <button className="button">Cancel</button>
            <button className={classnames('button','primary')}>Export</button>
          </div>
        </div>
      </div>
    );
  }
}

ExportReport.propTypes = {
  /**
   * Currently available export options
   */
  contactChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  recordCount: React.PropTypes.number,
};

ExportReport.defaultProps = {
  contactChoices: [{value: 1, display: 'choice b'}],
  recordCount: 231,
};
