import React from 'react';
import {Col, Row, Table} from 'react-bootstrap';

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
            <Table striped id="no-more-tables">
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Associated Roles</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.props.usersTableRows}
              </tbody>
            </Table>
            <Row>
              <Link
                className="primary pull-right btn btn-default"
                to="/user/add">
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
