import React from 'react';
import SortableField from './SortableField';
import Sortable from 'react-sortablejs';

export default class SortableList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {items, onReorder, onChange} = this.props;
    return (
      <Sortable
        className="my-list"
        options={{
          ghostClass: 'placeholder',
          delay: 'ontouchstart' in window ? 150 : 0,
        }}
        onChange={ order => onReorder(order)}
      >
        {items.map( field => {
          return (
            <div className="list-item" data-id={field.value}>
              <SortableField
                item={{
                  display: field.display,
                  value: field.value,
                  checked: field.checked,
                }}
                onChange={onChange}
              />
            </div>
          );
        })}
      </Sortable>
    );
  }
}

SortableList.propTypes = {
  /**
    * Array of objects to be selected from. Each should have a 'value' and
    * 'display' key, with `String` values.
    */
  items: React.PropTypes.array.required,
  /** This callback is triggered when an item in the sortable list is moved,
    * and is passed the array of `data-id`s for all elements within the
    * component.
    */
  onReorder: React.PropTypes.func.isRequired,
  /* This is the callback assigned to each `SortableField` within this
   * component, and is triggered when input value is toggled.
   */
  onChange: React.PropTypes.func.isRequired,
};
