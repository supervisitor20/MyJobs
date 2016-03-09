import React, {Component} from 'react';

export class SelectElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
    };
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    // get your data from AJAX or wherever and put it in the select
  }
  handleClick() {
    console.log(this);
  }
  successHandler(data) {
    // assuming data is an array of {name: "foo", value: "bar"}
    let i;
    let option;
    for (i = 0; i < data.length; i++) {
      option = data[i];
      this.state.options.push(
          <option key={i} value={option.value}>{option.name}</option>
      );
    }
    this.forceUpdate();
  }
  render() {
    return (
        <div onClick={this.handleClick} className="select-element-outer">
          <span className="select-element-chosen">Chosen Selection</span>
          <span className="select-element-arrow">
            <b role="presentation"></b>
          </span>
        </div>
    );
  }
}

SelectElement.propTypes = {

};

SelectElement.defaultProps = {

};
