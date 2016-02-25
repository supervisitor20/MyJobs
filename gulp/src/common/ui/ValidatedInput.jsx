import React, {PropTypes, Component} from 'react';
import classnames from 'classnames';
import {map} from 'lodash-compat/collection';


/**
 * Input field which shows help text and errors.
 */
export class ValidatedInput extends Component {
  renderError(errorText, key) {
    return <span key={key} className="error-text">{errorText}</span>;
  }

  renderErrors() {
    const {errorTexts} = this.props;
    if (!errorTexts) {
      return '';
    }

    if (errorTexts.length === 1) {
      return <div>{this.renderError(errorTexts[0])}</div>;
    }

    const errors = map(errorTexts, (errorText, i) =>
        <li>{this.renderError(errorText, i)}</li>);

    return <div><ul>{errors}</ul></div>;
  }

  render() {
    const {value, helpText, errorTexts, onValueChange} = this.props;

    const hasHelp = Boolean(helpText);
    const hasErrors = Boolean(errorTexts);

    const inputClasses = classnames({'errorInput': hasErrors});

    return (
      <div>
        <input
          type="text"
          value={value}
          className={inputClasses}
          onChange={e => onValueChange(e.target.value)}/>
        {hasHelp && !hasErrors ?
          <div><span className="formHelp">{helpText}</span></div> : ''}
        {this.renderErrors()}
      </div>
    );
  }
}

ValidatedInput.propTypes = {
  /**
   * This contains a controlled input. Value in the box goes here.
   */
  value: PropTypes.string.isRequired,

  /**
   * Function to call with input change values.
   */
  onValueChange: PropTypes.func.isRequired,

  /**
   * Help text to show alongside the input control.
   */
  helpText: PropTypes.string,

  /**
   * Array of strings to show as errors alongside the input control.
   *
   * If this prop is missing or empty the control will display as valid.
   */
  errorTexts: PropTypes.array,
};
