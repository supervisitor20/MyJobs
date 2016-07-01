import React from 'react';
import FilteredMultiSelect from 'react-filtered-multiselect';

const bootstrapClasses = {
  filter: 'form-control',
  select: 'form-control',
  button: 'btn btn btn-block btn-default',
  buttonActive: 'btn btn btn-block btn-primary',
};

class UsersMultiselect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assignedUsers: this.props.assignedUsers,
      availableUsers: this.props.availableUsers,
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      availableUsers: nextProps.availableUsers,
      assignedUsers: nextProps.assignedUsers,
    });
    this._onSelect = this._onSelect.bind(this);
    this._onDeselect = this._onDeselect.bind(this);
  }
  _onSelect(assignedUsers) {
    assignedUsers.sort((a, b) => a.id - b.id);
    this.setState({assignedUsers});
  }
  _onDeselect(deselectedOptions) {
    const assignedUsers = this.state.assignedUsers.slice();
    deselectedOptions.forEach(option => {
      assignedUsers.splice(assignedUsers.indexOf(option), 1);
    });
    this.setState({assignedUsers});
  }
  render() {
    const {assignedUsers, availableUsers} = this.state;
    return (
        <div className="row">
          <div className="col-xs-6">
            <label>Users Available</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={availableUsers}
              selectedOptions={assignedUsers}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Users Assigned</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control',
                select: 'form-control',
                button: 'btn btn btn-block btn-default',
                buttonActive: 'btn btn btn-block btn-danger',
              }}
              onChange={this._onDeselect}
              options={assignedUsers}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  }
}

UsersMultiselect.propTypes = {
  assignedUsers: React.PropTypes.array.isRequired,
  availableUsers: React.PropTypes.array.isRequired,
};

export default UsersMultiselect;
