import React from 'react';

class BasicTextField extends React.Component {
  render() {
    let requiredIndicator = "";
    if (this.props.required) {
      requiredIndicator = " *";
    }

    let helpOrErrorText = ""
    if (this.props.error_messages.invalid) {
      helpOrErrorText = <span className="error-text">{this.props.error_messages.invalid}</span>
    }
    else if ((this.props.help_text)) {
      helpOrErrorText = <span className="help-block">{this.props.help_text}</span>
    }

    return (
      <div className="row">
        <div className="col-xs-12 col-md-4">
          <lable>{this.props.label}{requiredIndicator}</lable>
        </div>
        <div className="col-xs-12 col-md-8">
          <input
            type="text"
            id={this.props.name}
            name={this.props.name}
            className=""
            maxLength={this.props.widget.attrs.maxlength}
            required={this.props.required}

            hidden={this.props.widget.is_hidden}
            defaultValue={this.props.initial}
            size="35"
            placeholder={this.props.widget.attrs.placeholder}
            onChange={this.props.onChange}
            />
          {helpOrErrorText}
        </div>
      </div>
    );
  }
}

BasicTextField.propTypes = {
  placeholder: React.PropTypes.string.isRequired,
  widget: React.PropTypes.object.isRequired,
  label_suffix: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func,
};

BasicTextField.defaultProps = {
  initial: '',
  placeholder: '',
  widget: {},
  label_suffix: '',
  label: '',
};

export default BasicTextField;
