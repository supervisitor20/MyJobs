import React from 'react';
import {map} from 'lodash-compat/collection';

class FieldWrapper extends React.Component {
  render() {
    const {label, helpText, errors, children, required} = this.props;

    const requiredIndicator = required ? ' *' : '';

    let helpOrErrorText;
    if (errors.length) {
      helpOrErrorText = map(errors, (errorText, i) =>
          <span key={i} className="error-text">{errorText}</span>);
    } else if (helpText) {
      helpOrErrorText = <span className="help-block">{helpText}</span>;
    } else {
      helpOrErrorText = '';
    }

    return (
      <div className="row">
        <div className="col-xs-12 col-md-4">
          <label>{label}{requiredIndicator}:</label>
        </div>
        <div className="col-xs-12 col-md-8">
          {children}
          {helpOrErrorText}
        </div>
      </div>
    );
  }
}

FieldWrapper.propTypes = {
  label: React.PropTypes.string.isRequired,
  helpText: React.PropTypes.string,
  errors: React.PropTypes.arrayOf(React.PropTypes.string),
  children: React.PropTypes.element.isRequired,
  required: React.PropTypes.bool.isRequired,
};

FieldWrapper.defaultProps = {
  helpText: '',
  errors: [],
};

export default FieldWrapper;
