import React from 'react';
import FilteredMultiSelect from 'react-filtered-multiselect';

class PartnersMultiselect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPartners: this.props.selectedPartners,
      availablePartners: this.props.availablePartners,
    };
    // React components using ES6 no longer autobind 'this' to non React methods
    // Thank you: https://github.com/goatslacker/alt/issues/283
    this._onSelect = this._onSelect.bind(this);
    this._onDeselect = this._onDeselect.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      availablePartners: nextProps.availablePartners,
      selectedPartners: nextProps.selectedPartners,
    });
  }
  _onSelect(selectedPartners) {
    selectedPartners.sort((a, b) => a.id - b.id);
    this.setState({selectedPartners});
  }
  _onDeselect(deselectedOptions) {
    const selectedPartners = this.state.selectedPartners.slice();
    deselectedOptions.forEach(option => {
      selectedPartners.splice(selectedPartners.indexOf(option), 1);
    });
    this.setState({selectedPartners});
  }
  render() {
    const {selectedPartners, availablePartners} = this.state;

    return (
        <div className="row">
          <div className="col-xs-6">
            <label>Available Partners</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={{
                filter: 'form-control',
                select: 'form-control',
                button: 'button btn-block',
                buttonActive: 'button primary',
              }}
              onChange={this._onSelect}
              options={availablePartners}
              selectedOptions={selectedPartners}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Selected Partners</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control',
                select: 'form-control',
                button: 'button btn-block',
                buttonActive: 'button',
              }}
              onChange={this._onDeselect}
              options={selectedPartners}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  }
}

PartnersMultiselect.propTypes = {
  selectedPartners: React.PropTypes.array.isRequired,
  availablePartners: React.PropTypes.array.isRequired,
};

export default PartnersMultiselect;
