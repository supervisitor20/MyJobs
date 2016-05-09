import React from 'react';
import SortableField from './SortableField';
import Sortable from 'react-sortablejs';

export default class SortableList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {items, onReorder, sharedProps} = this.props;
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
            <div className="list-item-draggable" data-id={field.value}>
              <SortableField
                item={{
                  display: field.display,
                  value: field.value,
                  checked: field.checked,
                }}
                sharedProps={sharedProps}
              />
            </div>
          );
        })}
      </Sortable>
    );
  }
}

SortableList.propTypes = {
  items: React.PropTypes.array.required,
  onReorder: React.PropTypes.func.isRequired,
  sharedProps: React.PropTypes.shape({
    onChange: React.PropTypes.func.isRequired,
  }),
};
