import React from 'react';
import {connect} from 'react-redux';
import {Col, Grid, Row} from 'react-bootstrap';
import {Loading} from 'common/ui/Loading';

class ImportWizardApp extends React.Component {
  render() {
    const {pageLoading} = this.props;

    return (
      <Grid>
        <Row>
          <Col sm={12}>
            <div className="breadcrumbs">
              <span>
                Import Wizard
              </span>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={8}>
            {pageLoading ? <Loading /> : this.props.children}
          </Col>
          <Col xs={12} md={4}>
            /* sidebar goes here */
          </Col>
        </Row>
      </Grid>
    );
  }
}

ImportWizardApp.propTypes = {
  // whether or not to show a page loading indicator in the content area
  pageLoading: React.PropTypes.bool.isRequired,
  // which page to show in the content area
  children: React.PropTypes.node,
};

export default connect(() => ({
  pageLoading: false,
}))(ImportWizardApp);
