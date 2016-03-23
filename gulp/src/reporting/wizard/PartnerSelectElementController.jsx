import React, {Component} from 'react';
import Multiselect from 'common/ui/MultiSelect';
import {PartnerSelectElement} from './PartnerSelectElement';

export class PartnerSelectElementController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemKey: undefined,
      initial: {display: 'No filter', value: 0},
      choices: [
          {display: 'No filter', value: 0},
          {display: 'Filter by name', value: 1},
      ],
    };
  }
  changeHandler(value) {
    this.setState({
      initial: value,
    });
  }
  renderPartnerControl(value) {
    const {onSelectAdd, onSelectRemove} = this.props;
    if (value === 1) {
      return (
        <Multiselect
          available={this.props.availablePartners}
          selected={this.props.selectedPartners}
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
        <PartnerSelectElement
          onChange={v => this.changeHandler(v)}
          availablePartners = {this.props.availablePartners}
          choices = {choices}
          initial = {initial}
        />
        <div className="partner-control-chosen">
          {this.renderPartnerControl(initial.value)}
        </div>
      </div>
    );
  }
}

PartnerSelectElementController.propTypes = {
  availablePartners: React.PropTypes.array.isRequired,
  selectedPartners: React.PropTypes.array.isRequired,
  onSelectAdd: React.PropTypes.func.isRequired,
  onSelectRemove: React.PropTypes.func.isRequired,
};

PartnerSelectElementController.defaultProps = {

};
