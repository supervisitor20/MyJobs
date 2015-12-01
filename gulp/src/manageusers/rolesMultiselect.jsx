import React from 'react';
import FilteredMultiSelect from 'react-filtered-multiselect';

const bootstrapClasses = {
  filter: 'form-control',
  select: 'form-control',
  button: 'btn btn btn-block btn-default',
  buttonActive: 'btn btn btn-block btn-primary',
};

class RolesMultiselect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assignedRoles: this.props.assignedRoles,
      availableRoles: this.props.availableRoles,
    };
    // React components using ES6 no longer autobind 'this' to non React methods
    // Thank you: https://github.com/goatslacker/alt/issues/283
    this._onSelect = this._onSelect.bind(this);
    this._onDeselect = this._onDeselect.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      availableRoles: nextProps.availableRoles,
      assignedRoles: nextProps.assignedRoles,
    });
  }
  _onSelect(assignedRoles) {
    assignedRoles.sort((a, b) => a.id - b.id);
    this.setState({assignedRoles});
  }
  _onDeselect(deselectedOptions) {
    const assignedRoles = this.state.assignedRoles.slice();
    deselectedOptions.forEach(option => {
      assignedRoles.splice(assignedRoles.indexOf(option), 1);
    });
    this.setState({assignedRoles});
  }
  render() {
    const {assignedRoles, availableRoles} = this.state;

    return (
        <div className="row">
          <div className="col-xs-6">
            <label>Roles Available:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={availableRoles}
              selectedOptions={assignedRoles}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Roles Assigned:</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control',
                select: 'form-control',
                button: 'btn btn btn-block btn-default',
                buttonActive: 'btn btn btn-block btn-danger',
              }}
              onChange={this._onDeselect}
              options={assignedRoles}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  }
}

RolesMultiselect.propTypes = {
  assignedRoles: React.PropTypes.array.isRequired,
  availableRoles: React.PropTypes.array.isRequired,
}

export default RolesMultiselect;
