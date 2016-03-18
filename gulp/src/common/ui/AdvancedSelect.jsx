import React from 'react';

class AdvancedSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDropped: false,
      currentValue: this.props.initial.display,
      keySelectedIndex: null,
    };
    this.openSelectMenu = this.openSelectMenu.bind(this);
    this.closeSelectMenu = this.closeSelectMenu.bind(this);
  }
  onInputKeyDown(event) {
    const {choices, name} = this.props;
    const {keySelectedIndex, selectDropped} = this.state;

    let killEvent = false;

    if (selectDropped && event.key === 'ArrowDown') {
      killEvent = true;
      this.shiftKeySelectedIndex(1);
    } else if (selectDropped && event.key === 'ArrowUp') {
      killEvent = true;
      this.shiftKeySelectedIndex(-1);
    } else if (selectDropped && event.key === 'Enter') {
      killEvent = true;
      this.selectFromMenu(choices[keySelectedIndex], name);
    } else if (selectDropped && event.key === 'Escape') {
      killEvent = true;
      this.closeSelectMenu();
    } else if (event.key === 'ArrowDown') {
      killEvent = true;
      this.resetKeySelectedIndex();
      this.openSelectMenu();
    }
    if (killEvent) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  onMenuItemEnter(index) {
    this.setState({keySelectedIndex: index});
  }
  shiftKeySelectedIndex(delta) {
    const {choices} = this.props;
    const {keySelectedIndex} = this.state;
    const lastIndex = choices.length - 1;

    let newIndex = keySelectedIndex + delta;

    if (newIndex < 0) {
      newIndex = lastIndex;
    }
    if (newIndex > lastIndex) {
      newIndex = 0;
    }
    this.setState({keySelectedIndex: newIndex});
  }
  resetKeySelectedIndex() {
    this.setState({keySelectedIndex: 0});
  }
  openSelectMenu() {
    this.setState({selectDropped: true});
  }
  closeSelectMenu() {
    this.setState({selectDropped: false});
  }
  selectFromMenu(itemKey, name) {
    // With a basic select we can use an onChange handler and we get a nice event
    // object. Here we'll fake it
    const fakeEvent = {};
    fakeEvent.target = {};
    fakeEvent.target.name = name;
    fakeEvent.target.type = 'advanced-select';
    fakeEvent.target.value = itemKey.value;

    this.props.onChange(fakeEvent);
    this.setState({currentValue: itemKey.display});

    this.closeSelectMenu();
  }
  render() {
    const {choices} = this.props;
    const {keySelectedIndex} = this.state;

    let dropdown;
    let dropdownItems = [];
    if (this.state.selectDropped) {
      dropdownItems = choices.map((item, index)=> {
        let active = '';
        if (index === keySelectedIndex) {
          active = 'active';
        }
        return (
          <li
            key={index}
            className={active}
            onMouseEnter={() => this.onMenuItemEnter(index)}
            onClick={this.selectFromMenu.bind(this, item, this.props.name)}>
              {item.display}
            </li>
          );
      });

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
          <div className="select-element-chosen-container" onClick={this.openSelectMenu}>
            <span className="select-element-chosen">{this.state.currentValue}</span>
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

AdvancedSelect.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  name: React.PropTypes.string.isRequired,
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
  errors: React.PropTypes.arrayOf(React.PropTypes.string),
};

AdvancedSelect.defaultProps = {
  initial: '',
};

export default AdvancedSelect;
