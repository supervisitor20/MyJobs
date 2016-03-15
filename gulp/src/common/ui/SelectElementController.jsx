import React, {Component} from 'react';
import {SelectElement} from 'common/ui/SelectElement';

export class SelectElementController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      childSelectName: undefined,
      childSelectValue: undefined,
    };
  }
  changeHandler(value) {
    this.setState({
      childSelectName: value.name,
      childSelectValue: value.key,
    });
    console.log(value);
  }
  render() {
    const {childSelectValue, childSelectName} = this.state;
    return (
      <SelectElement
        onChange={v => this.changeHandler(v)}
        childSelectValue={childSelectValue}
        childSelectName={childSelectName}
      />
    );
  }
}

SelectElementController.propTypes = {

};

SelectElementController.defaultProps = {

};
