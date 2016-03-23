import React, {Component} from 'react';

export class SelectElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDropped: false,
    };
    this.popSelectMenu = this.popSelectMenu.bind(this);
  }
  componentDidMount() {
    // get your data from props
  }
  popSelectMenu() {
    this.setState({selectDropped: !this.state.selectDropped});
  }
  selectFromMenu(itemKey) {
    const {onChange} = this.props;
    onChange(itemKey);
    this.popSelectMenu();
  }
  render() {
    const {choices, initial} = this.props;
    let item;
    let dropdown;
    const dropdownItems = [];
    if (this.state.selectDropped) {
      for (item of choices) {
        if (item) {
          dropdownItems.push(<li key={item.value} onClick={this.selectFromMenu.bind(this, item)}>{item.display}</li>);
        }
      }
      dropdown = (
      <div className="select-element-menu-container">
        <ul>
          {dropdownItems}
        </ul>
      </div>
      );
    } else {
      dropdown = '';
    }
    return (
      <div className="select-element-outer" tabIndex="0" onBlur={this.closeSelectMenu} onKeyDown={e => this.onInputKeyDown(e)}>
        <div className="select-element-input">
          <div className="select-element-chosen-container" onClick={this.popSelectMenu}>
            <span className="select-element-chosen">{initial.display}</span>
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
  onChange: React.PropTypes.func.isRequired,
  initial: React.PropTypes.shape({
    value: React.PropTypes.any.isRequired,
    display: React.PropTypes.string.isRequired,
  }),
  choices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
};

SelectElement.defaultProps = {
  childSelectName: 'this is a test',
};
