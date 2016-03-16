import React from 'react';

class SelectElement extends React.Component {
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
    const {choices, childSelectName} = this.props;

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

        console.log(item);

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
      <div className="row">
        <div className="col-xs-12 col-md-4">
          <lable>{this.props.label}{requiredIndicator}:</lable>
        </div>
        <div className="col-xs-12 col-md-8">
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
          {helpOrErrorText}
        </div>
      </div>
    );
  }
}

SelectElement.propTypes = {
  placeholder: React.PropTypes.string.isRequired,
  widget: React.PropTypes.object.isRequired,
  label: React.PropTypes.string.isRequired,
  required: React.PropTypes.bool.isRequired,
  onChange: React.PropTypes.func,
  name: React.PropTypes.string.isRequired,
  help_text: React.PropTypes.string.isRequired,
  errorMessages: React.PropTypes.object.isRequired,
  choices: React.PropTypes.array.isRequired,
  childSelectName: React.PropTypes.string.isRequired,
};

SelectElement.defaultProps = {
  childSelectName: '----s',
  required: false,
};

export default SelectElement;
