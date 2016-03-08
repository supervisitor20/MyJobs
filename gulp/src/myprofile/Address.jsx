import React from 'react';
import Button from 'react-bootstrap/lib/Button';

class Overview extends React.Component {
  componentWillReceiveProps(nextProps) {
    const address =  nextProps.address;
  }
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <h1>Edit <small>Test</small></h1>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-8 col-xs-12">
            <div className="card-wrapper">
              <div className="row">
                <div className="col-xs-12 ">
                  <div className="wrapper-header">
                    <h2>TEST</h2>
                  </div>
                  <div className="product-card no-highlight">
                    <label htmlFor="id_role_name" className="col-sm-3 control-label">Role Name* </label>
                    <input id="id_role_name" className="col-sm-5" maxLength="255" name="name" type="text" size="35"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
}

export default Overview;
