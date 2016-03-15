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
    const {items, childSelectName} = this.props;
    let item;
    let dropdown;
    const dropdownItems = [];
    if (this.state.selectDropped) {
      for (item of items) {
        if (item) {
          dropdownItems.push(<li key={item.key} onClick={this.selectFromMenu.bind(this, item)}>{item.name}</li>);
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
      <div className="select-element-outer">
        <div className="select-element-input">
          <div className="select-element-chosen-container" onClick={this.popSelectMenu}>
            <span className="select-element-chosen">{childSelectName}</span>
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
  items: React.PropTypes.array.isRequired,
  childSelectName: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired,
};

SelectElement.defaultProps = {
  items: [
    {name: 'number 1', key: 1},
    {name: 'number 2', key: 2},
    {name: 'number #', key: 3},
  ],
  childSelectName: 'this is a test',
};
