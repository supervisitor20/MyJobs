import React, {Component} from 'react';
import CheckBox from '../common/ui/CheckBox';

export class SortableField extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {labelText, nameText, onChange, onUp, onDown} = this.props;
    return (
      <div className="sortable-report-field">
        <label htmlFor={nameText}>
          <CheckBox
            name={nameText}
            onChange={onChange}
          />
        {labelText}</label>
        <span className="sortable-report-arrows">
          <span className="up" onClick={onUp}>▲</span>
          <span className="down" onClick={onDown}>▼</span>
        </span>
      </div>
    );
  }
}

SortableField.propTypes = {
  /**
   * Label text
   */
  labelText: React.PropTypes.string.isRequired,
  nameText: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired,
  onUp: React.PropTypes.func.isRequired,
  onDown: React.PropTypes.func.isRequired,
};

export default SortableField;
