import React, {Component} from 'react';
import {SelectElement} from 'common/ui/SelectElement';

export class SelectElementController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      childSelectValue: undefined,
    };
  }
  changeHandler(e) {
    this.setState({
      childSelectValue: e.target.value,
    });
  }
  render() {
    return (
      <SelectElement
        url="http://foo.bar"
        value={this.state.childSelectValue}
        onChange={this.changeHandler}
      />
    );
  }
}

SelectElementController.propTypes = {

};

SelectElementController.defaultProps = {

};
