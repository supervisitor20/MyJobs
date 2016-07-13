import React from 'react';
import {connect} from 'react-redux';

import {MyJobsApi} from 'common/myjobs-api';
import {getCsrf} from 'common/cookie';
import {forOwn} from 'lodash-compat';
import {Link} from 'react-router';

import {Loading} from 'common/ui/Loading';
import {markPageLoadingAction} from 'common/actions/loading-actions';
import {addRolesAction} from '../actions/validation-actions';
import Users from './Users';
import User from './User';
import {doRefreshUsers} from '../actions/user-actions';
import {clearValidationAction} from '../actions/validation-actions';
import AssociatedUsersList from './AssociatedUsersList';
import AssociatedActivitiesList from './AssociatedActivitiesList';
import Confirm from 'common/ui/Confirm';


const api = new MyJobsApi(getCsrf());

export class ManageUsersApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rolesTableRows: [],
      currentUserID: null,
      rolesAPIResults: null,
      callRolesAPI: this.callRolesAPI,
      confirmShow: false,
    };
    this.callRolesAPI = this.callRolesAPI.bind(this);
  }

  componentDidMount() {
    const {history} = this.props;
    this.unsubscribeFromHistory = history.listen((...args) =>
      this.handleNewLocation(...args));

    this.callRolesAPI();
  }

  componentWillReceiveProps(nextProps) {
    if ( nextProps.reloadAPIs === 'true' ) {
      this.callRolesAPI();
    }
  }

  componentWillUnmount() {
    this.unsubscribeFromHistory();
  }

  async handleNewLocation(_, loc) {
    const {dispatch, users} = this.props;
    const lastComponent = loc.components[loc.components.length - 1];
    const params = loc.params;

    switch (lastComponent) {
    case Users:
      dispatch(markPageLoadingAction(true));
      dispatch(doRefreshUsers());
      dispatch(markPageLoadingAction(false));
      dispatch(clearValidationAction());
      break;
    case User:
      if (users[params.userId]) {
        const user = users[params.userId];
        if (user) {
          dispatch(addRolesAction(user.roles));
        }
      }
      break;
    default:
      dispatch(markPageLoadingAction(false));
    }
  }

  async callRolesAPI() {
    // Get roles once, but reload if needed
    const results = await api.get('/manage-users/api/roles/');
    const rolesTableRows = [];

    forOwn(results, function buildListOfRows(role) {
      let editRoleLink;
      if (role.role_name !== 'Admin') {
        editRoleLink = <Link to={`/role/${role.role_id}`} query={{action: 'Edit'}} className="btn">Edit</Link>;
      }
      rolesTableRows.push(
        <tr key={role.role_id}>
          <td data-title="Role">{role.role_name}</td>
          <td data-title="Associated Activities">
            <AssociatedActivitiesList activities={role.activities}/>
          </td>
          <td data-title="Associated Users">
            <AssociatedUsersList users={role.assigned_users}/>
          </td>
          <td data-title="Edit">
            {editRoleLink}
          </td>
        </tr>
      );
    });
    this.setState({
      rolesTableRows: rolesTableRows,
      rolesAPIResults: results,
    });
  }

  render() {
    const {loading} = this.props;
    return (
      <div>
        <Confirm/>
        <div className="row">
          <div className="col-sm-12">
            <div className="breadcrumbs">
              <span>
                Manage Users
              </span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-4 col-xs-12 pull-right">
            <div className="sidebar">
              <h2 className="top">Navigation</h2>
              <Link to="/" className="btn">Overview</Link>
              <Link to="users" className="btn">Users</Link>
              <Link to="roles" className="btn">Roles</Link>
              <Link to="activities" className="btn">Activities</Link>
              <Link to="help-and-tutorials" className="btn">Help & Tutorials</Link>
            </div>
          </div>

          <div className="col-sm-8 col-xs-12">
            <div className="card-wrapper">
              {loading ? <Loading /> : this.props.children && React.cloneElement(
                this.props.children, {
                  rolesTableRows: this.state.rolesTableRows,
                  currentUserID: this.state.currentUserID,
                  callRolesAPI: this.callRolesAPI,
                  api: api,
                  rolesAPIResults: this.state.rolesAPIResults,
                })
              }
            </div>
          </div>
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
}

ManageUsersApp.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  params: React.PropTypes.object.isRequired,
  history: React.PropTypes.object.isRequired,
  loading: React.PropTypes.bool.isRequired,
  children: React.PropTypes.object.isRequired,
  users: React.PropTypes.object.isRequired,
};

export default connect(state => ({
  loading: state.loading.mainPage,
  users: state.users,
}))(ManageUsersApp);
