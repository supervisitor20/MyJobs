import React, {Component} from 'react';
import CheckBox from '../common/ui/CheckBox';

export class SortableField extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {sharedProps, item} = this.props;
    return (
      <div className="sortable-report-field">
        <label htmlFor={item.nameText}>
          <CheckBox
            name={item.nameText}
            onChange={sharedProps.onChange}
          />
        {item.labelText}</label>
      </div>
    );
  }
}

SortableField.propTypes = {
  /**
   * Label text
   */
  item: React.PropTypes.shape({
    labelText: React.PropTypes.string.isRequired,
    nameText: React.PropTypes.string.isRequired,
  }),
  sharedProps: React.PropTypes.shape({
    onChange: React.PropTypes.func.isRequired,
  }),
};

export default SortableField;
