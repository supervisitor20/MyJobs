import React from 'react';
import {Col, Row} from 'react-bootstrap';

import UsersList from './UsersList';
import {Link} from 'react-router';

class Users extends React.Component {
  render() {
    return (
      <Row>
        <Col xs={12}>
          <div className="wrapper-header">
            <h2>Users</h2>
          </div>
          <div className="product-card-full no-highlight">

            <UsersList usersTableRows={this.props.usersTableRows} />
            <hr/>
            <Row>
              <Link
                className="primary pull-right btn btn-default"
                to="user/add"
                query={{action: 'Add'}}>
                Add User
              </Link>
            </Row>
          </div>
        </Col>
      </Row>
    );
  }
}

Users.propTypes = {
  usersTableRows: React.PropTypes.array.isRequired,
};

Users.defaultProps = {
  usersTableRows: [],
};

export default Users;
