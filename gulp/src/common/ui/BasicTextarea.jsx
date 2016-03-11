import React from 'react';

class BasicTextarea extends React.Component {
  render() {
    let requiredIndicator = "";
    if (this.props.required) {
      requiredIndicator = " *";
    }

    let helpOrErrorText
    // Check if this field appears in the list of error messages passed down
    if (this.props.errorMessages.hasOwnProperty(this.props.name)) {
      helpOrErrorText = <span className="error-text">{this.props.errorMessages[this.props.name]}</span>
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
          <textarea
            defaultValue={this.props.initial}
            id={this.props.name}
            name={this.props.name}
            required={this.props.required}
            hidden={this.props.widget.is_hidden}
            placeholder={this.props.widget.attrs.placeholder}
            rows={this.props.widget.attrs.rows}
            cols={this.props.widget.attrs.cols}
            onChange={this.props.onChange}
            />
          {helpOrErrorText}
        </div>
      </div>
    );
  }
}

BasicTextarea.propTypes = {
  placeholder: React.PropTypes.string.isRequired,
  widget: React.PropTypes.object.isRequired,
  label_suffix: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  required: React.PropTypes.bool.isRequired,
  onChange: React.PropTypes.func,
};

BasicTextarea.defaultProps = {
  initial: '',
  placeholder: '',
  widget: {},
  label_suffix: '',
  label: '',
  required: false,
};

export default BasicTextarea;
