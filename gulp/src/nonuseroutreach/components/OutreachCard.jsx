import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {expandStaticUrl} from 'common/assets';


class OutreachCard extends Component {
  render() {
    const {displayText} = this.props;
    return (
      <div className="tray-container progress-card">
        <div className="tray-items-left">
          <img
          alt="[partner]"
          src={expandStaticUrl('svg/partner-card.svg')} />
        </div>
        <div className="tray-items">
            <img
             alt="[delete]"
             src={expandStaticUrl('svg/delete.svg')} />
        </div>
        <div className="tray-content ellipses">
          <h5>{displayText}</h5>
        </div>
      </div>
  );
  }
}

OutreachCard.propTypes = {
  displayText: PropTypes.string.isRequired,
};

export default connect()(OutreachCard);
