import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Loading} from 'common/ui/Loading';
import {Menu} from './Menu';


class NonUserOutreachApp extends Component {
  render() {
    const {pageLoading} = this.props;
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <div className="breadcrumbs">
              <span>
                Non-User Outreach Inbox Management
              </span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12 col-md-8">
            {pageLoading ? <Loading /> : this.props.children}
          </div>
          <div className="col-xs-12 col-md-4">
            <Menu />
          </div>
        </div>
      </div>
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
