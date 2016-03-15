import React from 'react';

class BasicMultiselect extends React.Component {
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


    let options = [];

    // TODO will be swapped out with real JSON from API
    let fake_options_data = {}
    fake_options_data.value1 = "value 1"
    fake_options_data.value2 = "value 2"
    fake_options_data.value3 = "value 3"

    for (let option in fake_options_data) {
      options.push(<option value={option} key={option}>{fake_options_data[option]}</option>)
    };

    return (
      <div className="row">
        <div className="col-xs-12 col-md-4">
          <lable>{this.props.label}</lable>
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

BasicMultiselect.propTypes = {
  initial: React.PropTypes.string.isRequired,
  placeholder: React.PropTypes.string.isRequired,
  widget: React.PropTypes.object.isRequired,
  label_suffix: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  required: React.PropTypes.bool.isRequired,
  onChange: React.PropTypes.func,
};

BasicMultiselect.defaultProps = {
  initial: '',
  placeholder: '',
  widget: {},
  label_suffix: '',
  label: '',
  required: false,
};

export default BasicMultiselect;
