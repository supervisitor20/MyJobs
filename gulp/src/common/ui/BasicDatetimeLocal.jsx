import React from 'react';

class BasicDatetimeLocal extends React.Component {
  goofy () {
    console.log("asdf")
  }
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
    // TODO Was using datetime-local, but didn't find how to detect user's change to the field, to update state
    // Kick this can down the road until we have a wider solution on our date picking field
    return (
      <div className="row">
        <div className="col-xs-12 col-md-4">
          <lable>{this.props.label}</lable>
        </div>
        <div className="col-xs-12 col-md-8">
          <input
            type="datetime"
            id={this.props.name}
            name={this.props.name}
            defaultValue={this.props.initial}
            className="col-sm-5"
            required={this.props.required}
            maxLength={this.props.widget.attrs.maxlength}
            hidden={this.props.widget.is_hidden}
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

BasicDatetimeLocal.propTypes = {
  placeholder: React.PropTypes.string.isRequired,
  widget: React.PropTypes.object.isRequired,
  label_suffix: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  required: React.PropTypes.bool.isRequired,
};

BasicDatetimeLocal.defaultProps = {
  placeholder: '',
  widget: {},
  label_suffix: '',
  label: '',
  required: false,
};

export default BasicDatetimeLocal;
