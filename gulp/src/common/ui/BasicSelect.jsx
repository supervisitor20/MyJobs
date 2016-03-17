import React from 'react';

class BasicSelect extends React.Component {
  render() {
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

    const options = [];

    for (const option in this.props.choices) {
      if (this.props.choices.hasOwnProperty(option)) {
        options.push(<option value={this.props.choices[option].value} key={option}>{this.props.choices[option].display}</option>);
      }
    }

    return (
      <div className="row">
        <div className="col-xs-12 col-md-4">
          <lable>{this.props.label}{requiredIndicator}:</lable>
        </div>
        <div className="col-xs-12 col-md-8">
          <select
            defaultValue={this.props.initial}
            id={this.props.name}
            required={this.props.required}
            hidden={this.props.widget.is_hidden}
            name={this.props.name}
            onChange={this.props.onChange}>
            {options}
          </select>
          {helpOrErrorText}
        </div>
      </div>
    );
  }
}

BasicSelect.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  label: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  initial: React.PropTypes.number,
  widget: React.PropTypes.object,
  required: React.PropTypes.bool,
  help_text: React.PropTypes.string,
  errorMessages: React.PropTypes.object,
  choices: React.PropTypes.array.isRequired,
};

BasicSelect.defaultProps = {
  label: '',
  name: '',
  initial: '',
  widget: {},
  required: false,
  help_text: '',
  errorMessages: {},
};

export default BasicSelect;
