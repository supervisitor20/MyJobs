import React, {Component} from 'react';
import Select from 'common/ui/Select';
import {lookupByValue} from 'common/array';

export class SortByController extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  changeHandler(event) {
    this.setState({
      choice: event.target.value,
    });
  }

  render() {
    const {sortByChoices, orderByChoices} = this.props;
    return (
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <Select
            name=""
            onChange={v => this.changeHandler(v)}
            value={lookupByValue(orderByChoices, 1).display}
            choices = {orderByChoices}
          />
        </div>
        <div className="col-md-6 col-xs-12">
          <Select
            name=""
            onChange={v => this.changeHandler(v)}
            value={lookupByValue(sortByChoices, 1).display}
            choices = {sortByChoices}
          />
        </div>
      </div>
    );
  }
}

SortByController.propTypes = {
  /**
   * Currently selected options
   */
  orderByChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  /**
   * Currently selected options
   */
  sortByChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
};

SortByController.defaultProps = {
  orderByChoices: [{value: 1, display: 'Contact'},{value: 2, display: 'Etc'}],
  sortByChoices: [{value: 1, display: 'Ascending'},{value: 2, display: 'Descending'}],
};
