import React, {Component, PropTypes} from 'react';
import {Col, Grid, Row} from 'react-bootstrap';
import {connect} from 'react-redux';
import {Loading} from 'common/ui/Loading';
import {Menu} from './Menu';


/* NonUserOutreachApp
 * An app for managing nonuser outreach, providing a sidebar for navigation and
 * a content area which displays either an overview, inbox management, or
 * outreach record management page.
 */
class NonUserOutreachApp extends Component {
  render() {
    const {loading, tips} = this.props;
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
            <Loading />
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
  // whether or not to show a page loading indicator in the content area
  loading: PropTypes.bool.isRequired,
  // the tips to pass along to the menu component
  tips: React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired,
  // which page to show in the content area
  children: PropTypes.node,
};

export default connect(state => ({
  loading: state.loading,
  tips: state.navigation.tips,
}))(NonUserOutreachApp);
