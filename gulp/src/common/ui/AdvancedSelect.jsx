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
  componentDidMount() {
    // get your data from props
  }
  onInputKeyDown(event) {
    const {choices, name} = this.props;
    const {keySelectedIndex, selectDropped} = this.state;
    let killEvent = false;
    let newIndex = keySelectedIndex;
    if (selectDropped) {
      const lastIndex = choices.length - 1;
      if (event.key === 'ArrowDown') {
        killEvent = true;
        if (keySelectedIndex < 0 || keySelectedIndex >= lastIndex) {
          newIndex = 0;
        } else {
          newIndex += 1;
        }
      } else if (event.key === 'ArrowUp') {
        killEvent = true;
        if (keySelectedIndex <= 0 || keySelectedIndex > lastIndex) {
          newIndex = lastIndex;
        } else {
          newIndex -= 1;
        }
      } else if (event.key === 'Enter') {
        killEvent = true;
        if (keySelectedIndex >= 0 && keySelectedIndex <= lastIndex) {
          this.selectFromMenu(choices[keySelectedIndex], name);
          return;
        }
      } else if (event.key === 'Escape') {
        this.closeSelectMenu();
        killEvent = true;
      }
    } else if (event.key === 'ArrowDown') {
      newIndex = 0;
      this.openSelectMenu();
    }
    if (killEvent) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.setState({keySelectedIndex: newIndex});
  }
  onMenuItemEnter(index) {
    this.setState({keySelectedIndex: index});
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
