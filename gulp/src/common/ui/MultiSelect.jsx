import React from 'react';
import FilteredMultiSelect from 'react-filtered-multiselect';

function MultiSelect(props) {
  const {selected, available, availableHeader, selectedHeader, onAdd, onRemove} = props;

  return (
      <div className="row">
        <div className="col-xs-6">
          <label>{availableHeader}</label>
          <FilteredMultiSelect
            buttonText="Add"
            classNames={{
              filter: 'form-control',
              select: 'form-control',
              button: 'button btn-block',
              buttonActive: 'button primary',
            }}
            onChange={v => onAdd(v)}
            options={available}
            selectedOptions={selected}
            textProp="display"
            valueProp="value"
          />
        </div>
        <div className="col-xs-6">
          <label>{selectedHeader}</label>
          <FilteredMultiSelect
            buttonText="Remove"
            classNames={{
              filter: 'form-control',
              select: 'form-control',
              button: 'button btn-block',
              buttonActive: 'button',
            }}
            onChange={v => onRemove(v)}
            options={[...selected]}
            textProp="display"
            valueProp="value"
          />
        </div>
      </div>
  );
}

MultiSelect.propTypes = {
  /**
   * Selected list items.
   */
  selected: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  /**
   * Available list items.
   */
  available: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  /**
   * Header text for left side select
   */
  availableHeader: React.PropTypes.string.isRequired,
  /**
   * Header text for right select
   */
  selectedHeader: React.PropTypes.string.isRequired,
  /**
   * Function fired when an item is selected from the left side
   */
  onAdd: React.PropTypes.func.isRequired,
  /**
   * Function fired when an item is selected from the right side
   */
  onRemove: React.PropTypes.func.isRequired,
};

export default MultiSelect;
