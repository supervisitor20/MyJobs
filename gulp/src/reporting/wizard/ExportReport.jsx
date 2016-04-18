import React, {Component} from 'react';

import SortByController from '../SortByController';
import SortableField from '../SortableField';
import Select from 'common/ui/Select';
import {getDisplayForValue} from 'common/array';
import {map, filter, forEach} from 'lodash-compat/collection';
import classnames from 'classnames';
import Reorder from 'react-reorder';

export default class ExportReport extends Component {
  constructor(props) {
    super();
    const {fieldsToInclude} = props;
    const fieldsSelected = map(fieldsToInclude, f =>
      ({nameText: f.nameText, labelText: f.labelText, key: f.key, checked: true}));
    this.state = {fieldsSelected};
  }

  onReorder(event, item, index, newIndex, fieldsSelected) {
    this.setState({fieldsSelected});
  }

  onCheck(e) {
    const {fieldsSelected} = this.state;
    forEach(fieldsSelected, (item)=> {
      if (item.nameText === e.target.id) {
        item.checked = e.target.checked;
      }
    });
    this.setState({fieldsSelected});
  }

  onCheckAll(e) {
    const {fieldsSelected} = this.state;
    console.log('checkAll', e);
    if (e.target.checked === false) {
      console.log('unchecked');
      forEach(fieldsSelected, (item)=> {
        item.checked = false;
        e.target.checked = false;
      });
    } else if (e.target.checked === true) {
      console.log('checked');
      forEach(fieldsSelected, (item)=> {
        item.checked = true;
        e.target.checked = true;
      });
    }
    this.setState({fieldsSelected});
  }

  render() {
    const {contactChoices, recordCount} = this.props;
    const {fieldsSelected} = this.state;
    const orderBy = [{value: 1, display: 'Ascending'}, {value: 2, display: 'Descending'}];
    const sortedItems = map(filter(fieldsSelected, f => f.checked === true), f =>
    ({value: f.key, display: f.labelText}));
    return (
      <div id="export-page">
        <div className="row">
          <div className="col-md-4 col-xs-12">
            <label>Sort By:</label>
          </div>
          <div className="col-md-8 col-xs-12">
          <SortByController
            orderByChoices={sortedItems}
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
                  item={{labelText: 'Select All', nameText: 'selectAll', checked: true}}
                  sharedProps={{onChange: e => this.onCheckAll(e, this)}}
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
                list={fieldsSelected}
                // A template to display for each list item
                template={SortableField}
                // Class to be applied to the outer list element
                listClass="my-list"
                // Class to be applied to each list item"s wrapper element
                itemClass="list-item"
                // Function that is called once a reorder has been performed
                callback={(...args) => this.onReorder(...args)}
                // A function to be called if a list item is clicked (before hold time is up)
                selected={this.state.selected}
                // Allows reordering to be disabled
                disableReorder={false}
                sharedProps={
                  {
                    onChange: e => this.onCheck(e, this),
                  }
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
              value={getDisplayForValue(contactChoices, 1)}
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
  contactChoices: [{value: 1, display: 'CSV or something'}],
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
