import React, {Component} from 'react';
import {SelectElement} from 'common/ui/PartnerSelectElement';

export class PartnerSelectElementController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemKey: undefined,
    };
  }
  changeHandler(value) {
    this.setState({
      itemKey: value,
    });
  }
  render() {
    const {itemKey} = this.state;
    return (
      <SelectElement
        onChange={v => this.changeHandler(v)}
        itemKey={itemKey}
      />
    );
  }
}

PartnerSelectElementController.propTypes = {

};

PartnerSelectElementController.defaultProps = {

};
