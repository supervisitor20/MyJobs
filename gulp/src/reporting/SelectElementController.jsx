import React, {Component} from 'react';
import Multiselect from 'common/ui/MultiSelect';
import Select from 'common/ui/Select';
import {map} from 'lodash-compat/collection';

export class SelectElementController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemKey: undefined,
      initial: {display: 'No filter', value: 0},
      choices: [
          {display: 'No filter', value: 0},
          {display: 'Filter by name', value: 1},
      ],
      availableHints: [],
      choice: 0,
    };
  }
  componentDidMount() {
    this.getHints();
  }
  async getHints() {
    const {getHints} = this.props;
    const availableHints = await getHints();
    const fixedAvailableHints = map(availableHints, value => ({value: value.key, display: value.display}));
    this.setState({availableHints: fixedAvailableHints});
  }
  changeHandler(event) {
    this.setState({
      choice: event.target.value,
    });
  }
  renderControl(value) {
    const {onSelectAdd, onSelectRemove} = this.props;
    if (value === 1) {
      return (
        <Multiselect
          available={this.state.availableHints}
          selected={this.props.selectedOptions}
          availableHeader={'Available'}
          selectedHeader={'Selected'}
          onAdd={v => onSelectAdd(v)}
          onRemove={v => onSelectRemove(v)}
          />
      );
    }
    return '';
  }
  render() {
    const {choices, initial, choice} = this.state;
    return (
      <div>
        <Select
          name=""
          onChange={v => this.changeHandler(v)}
          initial={initial}
          choices = {choices}
        />
        <div className="select-control-chosen">
          {this.renderControl(choice)}
        </div>
      </div>
    );
  }
}

SelectElementController.propTypes = {
  getHints: React.PropTypes.func.isRequired,
  selectedOptions: React.PropTypes.array.isRequired,
  onSelectAdd: React.PropTypes.func.isRequired,
  onSelectRemove: React.PropTypes.func.isRequired,
};

SelectElementController.defaultProps = {

};
