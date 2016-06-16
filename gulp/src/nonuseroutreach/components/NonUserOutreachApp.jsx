import React, {Component, PropTypes} from 'react';
import {Col, Grid, Row} from 'react-bootstrap';
import {connect} from 'react-redux';
import {Loading} from 'common/ui/Loading';
import {Menu} from './Menu';


class NonUserOutreachApp extends Component {
  render() {
    const {pageLoading} = this.props;
    return (
      <Grid>
        <Row>
          <Col sm={12}>
            <div className="breadcrumbs">
              <span>
                Non-User Outreach Inbox Management
              </span>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={8}>
            {pageLoading ? <Loading /> : this.props.children}
          </Col>
          <Col xs={12} md={4}>
            <Menu />
          </Col>
        </Row>
      </Grid>
    );
  }
}

NonUserOutreachApp.propTypes = {
  pageLoading: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

export default connect(() => ({
  pageLoading: false,
}))(NonUserOutreachApp);
