import React, {Component} from 'react';
import Select from 'common/ui/Select';
import {getDisplayForValue} from 'common/array';

export class SortByController extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  changeHandler(event) {
    this.setState({
      value: event.target.value,
    });
  }

  render() {
    const {sortByChoices, orderByChoices} = this.props;
    return (
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <Select
            name=""
            onChange={v => this.changeHandler(v, this)}
            value={getDisplayForValue(orderByChoices, 1)}
            choices = {orderByChoices}
          />
        </div>
        <div className="col-md-6 col-xs-12">
          <Select
            name=""
            onChange={v => this.changeHandler(v, this)}
            value={getDisplayForValue(sortByChoices, 1)}
            choices = {sortByChoices}
          />
        </div>
      </div>
    );
  }
}

SortByController.propTypes = {
  /**
   * Options to order by
   */
  orderByChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  /**
   * Options to sort by
   */
  sortByChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
};

export default SortByController;
