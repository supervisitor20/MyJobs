import React from 'react';

class AdvancedSelect extends React.Component {
  constructor(props) {
    super(props);


    // TODO this.props.initial comes to us as a number, but we want to set currentValue as human readable



    this.state = {
      selectDropped: false,
      currentValue: this.props.initial,
    };
    this.popSelectMenu = this.popSelectMenu.bind(this);
  }
  componentDidMount() {
    // get your data from props
  }
  popSelectMenu() {
    this.setState({selectDropped: !this.state.selectDropped});
  }

  test() {
    console.log('asdf');
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

    this.popSelectMenu();
  }
  render() {
    const {choices, widget} = this.props;

    let rowClasses;
    if (widget.hidden === true) {
      rowClasses = 'row hidden';
    } else {
      rowClasses = 'row';
    }

    let requiredIndicator = '';
    if (this.props.required) {
      requiredIndicator = ' *';
    }

    let helpOrErrorText;
    // Check if this field appears in the list of error messages passed down
    if (this.props.errorMessages.hasOwnProperty(this.props.name)) {
      helpOrErrorText = <span className="error-text">{this.props.errorMessages[this.props.name]}</span>;
    } else if ((this.props.help_text)) {
      helpOrErrorText = <span className="help-block">{this.props.help_text}</span>;
    }

    let item;
    let dropdown;
    const dropdownItems = [];
    if (this.state.selectDropped) {
      for (item of choices) {
        if (item) {
          dropdownItems.push(<li key={item.display} onClick={this.selectFromMenu.bind(this, item, this.props.name)}>{item.display}</li>);
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
      <div className={rowClasses}>
        <div className="col-xs-12 col-md-4">
          <lable>{this.props.label}{requiredIndicator}:</lable>
        </div>
        <div className="col-xs-12 col-md-8">
          <div className="select-element-outer">
            <div className="select-element-input">
              <div className="select-element-chosen-container" onClick={this.popSelectMenu}>
                <span className="select-element-chosen">{this.state.currentValue}</span>
                <span className="select-element-arrow">
                  <b role="presentation"></b>
                </span>
              </div>
            </div>
            {dropdown}
          </div>
          {helpOrErrorText}
        </div>
      </div>
    );
  }
}

AdvancedSelect.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  label: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  initial: React.PropTypes.string,
  widget: React.PropTypes.object,
  required: React.PropTypes.bool,
  help_text: React.PropTypes.string,
  errorMessages: React.PropTypes.object,
  choices: React.PropTypes.array.isRequired,
};

AdvancedSelect.defaultProps = {
  label: '',
  name: '',
  initial: '',
  widget: {},
  required: false,
  help_text: '',
  errorMessages: {},
};

export default AdvancedSelect;
