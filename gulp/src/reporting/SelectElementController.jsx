import React, {Component} from 'react';
import Multiselect from 'common/ui/MultiSelect';
import {SelectElement} from 'common/ui/SelectElement';
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
  changeHandler(value) {
    this.setState({
      initial: value,
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
    const {choices, initial} = this.state;
    return (
      <div>
        <SelectElement
          onChange={v => this.changeHandler(v)}
          choices = {choices}
          initial = {initial}
        />
        <div className="select-control-chosen">
          {this.renderControl(initial.value)}
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
