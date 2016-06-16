import React, {Component, PropTypes} from 'react';
import {Col, Grid, Row} from 'react-bootstrap';
import {connect} from 'react-redux';
import {Loading} from 'common/ui/Loading';
import {Menu} from './Menu';


class NonUserOutreachApp extends Component {
  render() {
    const {pageLoading, tips} = this.props;
    return (
      <Grid>
        <Row>
          <Col sm={12}>
            <div className="breadcrumbs">
              <span>
                Non-User Outreach
              </span>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={8}>
            {pageLoading ? <Loading /> : this.props.children}
          </Col>
          <Col xs={12} md={4}>
            <Menu tips={tips} />
          </Col>
        </Row>
      </Grid>
    );
  }
}

NonUserOutreachApp.propTypes = {
  pageLoading: PropTypes.bool.isRequired,
  tips: React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired,
  children: PropTypes.node,
};

export default connect(state => ({
  pageLoading: false,
  tips: state.navigation.tips,
}))(NonUserOutreachApp);
