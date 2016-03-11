import React, {Component} from 'react';

export class SelectElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDropped: false,
    };
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    // get your data from AJAX or wherever and put it in the select
  }
  handleClick() {
    // Pop the popup
    this.setState({selectDropped: !this.state.selectDropped});
  }
  render() {
    const {items} = this.props;
    let dropdown;
    if (selectDropped) {
      for (item in items) {
        <li key={item.name}>item.name</li>;
      }
      dropdown = <div className="select-element-menu-container">
          <ul>
            {items}
          </ul>
        </div> 
    } else {
      dropdown = "";
    }
    return (
      <div className="select-element-outer">
        <div className="select-element-input">
          <div className="select-element-chosen-container" onClick={this.handleClick}>
            <span className="select-element-chosen">Chosen Selection</span>
            <span className="select-element-arrow">
              <b role="presentation"></b>
            </span>
          </div>
        </div>
        {dropdown}
      </div>
    );
  }
}

SelectElement.propTypes = {

};

SelectElement.defaultProps = {
  items: {
    rootOpen: 'open',
    suggestions: 'dropdown-menu',
    itemActive: 'active',
  },
};
