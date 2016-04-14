import React, {Component} from 'react';

import SortByController from '../SortByController';
import SortableField from '../SortableField';
import Select from 'common/ui/Select';
import {lookupByValue} from 'common/array';
import classnames from 'classnames';
import Reorder from 'react-reorder';

export class ExportReport extends Component {
  constructor() {
    super();
    this.state = {};
  }

  onChange(e) {
    console.log('change', e);
  }

  onCheck(e) {
    console.log('check', e);
  }

  onCheckAll(e) {
    console.log('checkAll', e);
  }

  itemClicked(e) {
    console.log('ItemClick', e);
  }

  sortableFields() {
    const {fieldsToInclude} = this.props;
    const sortBy = [];
    fieldsToInclude.forEach(option => {
      sortBy.push(
        {value: option.key, display: option.labelText}
      );
    });
    console.log(sortBy);
    return sortBy;
  }

  render() {
    const {contactChoices, recordCount, fieldsToInclude} = this.props;
    const orderBy = [{value: 1, display: 'Ascending'}, {value: 2, display: 'Descending'}];
    console.log(orderBy);
    return (
      <div id="export-page">
        <div className="row">
          <div className="col-md-4 col-xs-12">
            <label>Sort By:</label>
          </div>
          <div className="col-md-8 col-xs-12">
          <SortByController
            orderByChoices={this.sortableFields()}
            sortByChoices={orderBy}
          />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
              <label>Fields to include:</label>
            </div>
            <div className="col-md-8">
              <div className="list-item">
                <SortableField
                  item={{labelText: 'Select All', nameText: 'selectAll'}}
                  sharedProps={{onChange: this.onCheckAll}}
                />
              </div>
              <Reorder
                // The key of each object in your list to use as the element key
                itemKey="nameText"
                // The key to compare from the selected item object with each item object
                selectedKey="nameText"
                // Lock horizontal to have a vertical list
                lock="horizontal"
                // The milliseconds to hold an item for before dragging begins
                holdTime="100"
                // The list to display
                list={fieldsToInclude}
                // A template to display for each list item
                template={SortableField}
                // Class to be applied to the outer list element
                listClass="my-list"
                // Class to be applied to each list item"s wrapper element
                itemClass="list-item"
                // Function that is called once a reorder has been performed
                callback={e => this.onChange(e, this)}
                // A function to be called if a list item is clicked (before hold time is up)
                itemClicked={e => this.itemClicked(e, this)}
                // The item to be selected (adds "selected" class)
                selected={this.state.selected}
                // Allows reordering to be disabled
                disableReorder={false}
                sharedProps={
                  {onChange: this.onCheck}
                }
              />
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
            <button className={classnames('button', 'primary')}>Export</button>
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
  /**
   * Fields to include
   */
  fieldsToInclude: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      labelText: React.PropTypes.string.isRequired,
      nameText: React.PropTypes.string.isRequired,
    })
  ),
  /**
   * Records to be exported
   */
  recordCount: React.PropTypes.number,
};

ExportReport.defaultProps = {
  contactChoices: [{value: 1, display: 'choice b'}],
  recordCount: 231,
  fieldsToInclude: [{
    key: 1,
    labelText: 'Contact',
    nameText: 'contactField',
  }, {
    key: 2,
    labelText: 'Contact Email',
    nameText: 'contactEmailField',
  }, {
    key: 3,
    labelText: 'Contact Phone',
    nameText: 'contactPhoneField',
  }, {
    key: 4,
    labelText: 'Communication Type',
    nameText: 'communicationTypeField',
  }],
};
