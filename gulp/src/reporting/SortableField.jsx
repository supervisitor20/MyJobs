import React, {Component, PropTypes} from 'react';

class SortableField extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {sharedProps, item} = this.props;
    // Using a raw input since we need special event handling.
    // The stop in onMouseDown prevents the event from reaching the reorder
    // widget and being a candidate for the beginning of a drag operation.
    return (
      <div className="sortable-report-field">
        <label htmlFor={item.value}>
        <input
          type="checkbox"
          name={item.value}
          id={item.value}
          className=""
          onChange={sharedProps.onChange}
          onMouseDown={e => {e.stopPropagation();}}
          checked={item.checked}/>
        {item.display}</label>
      </div>
    );
  }
}

SortableField.propTypes = {
  /**
   * Value and display text combined. React Reorder only gives us a single
   * property so we bundle what we want under it.
   */
  item: PropTypes.shape({
    /**
     * Display text for this item.
     */
    display: PropTypes.string.isRequired,
    /**
     * Value this item represents.
     */
    value: PropTypes.string.isRequired,
    /**
     * Is this box checked?
     */
    checked: PropTypes.bool.isRequired,
  }),
  /**
   * Properties shared by all children of React Reorder.
   */
  sharedProps: PropTypes.shape({
    /**
     * Used to signal a check/uncheck event.
     */
    onChange: PropTypes.func.isRequired,
  }),
};

export default SortableField;
