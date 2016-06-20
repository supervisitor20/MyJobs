import React from 'react';
import {connect} from 'react-redux';
import {Col, Row} from 'react-bootstrap';
import {setPageAction} from '../actions/navigation-actions';

/* OverviewPage
 * Component responsible for providing a brief description of the
 * NonUserOutreach application.
 */
class OverviewPage extends React.Component {
  componentWillMount() {
    // update the application's state with the current page
    const {dispatch} = this.props;
    dispatch(setPageAction('overview'));
  }

  render() {
    return (
      <div className="cardWrapper">
        <Row>
          <Col xs={12}>
            <div className="wrapper-header">
              <h2>Overview</h2>
            </div>
            <div className="product-card no-highlight clearfix">
              <p>
                Non User Outreach is a module that will help you manage
                and track positive outreach efforts by your employees
              </p>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

OverviewPage.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
};

export default connect()(OverviewPage);
