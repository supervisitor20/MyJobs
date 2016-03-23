import React from 'react';
import FilteredMultiSelect from 'react-filtered-multiselect';

function Multiselect(props) {
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

Multiselect.propTypes = {
  selected: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  available: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  availableHeader: React.PropTypes.string.isRequired,
  selectedHeader: React.PropTypes.string.isRequired,
  onAdd: React.PropTypes.func.isRequired,
  onRemove: React.PropTypes.func.isRequired,
};

export default Multiselect;
