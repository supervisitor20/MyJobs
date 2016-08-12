import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {expandStaticUrl} from 'common/assets';


class OutreachCard extends Component {
  render() {
    const {
      displayText,
      onNav,
    } = this.props;
    return (
      <div
        className="tray-container progress-card"
        onClick={() => onNav()}>
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
  // Text to show in the card.
  displayText: PropTypes.string.isRequired,
  // User clicked on the card to navigate to the item.
  onNav: PropTypes.func.isRequired,
  // TODO: add icon choice
  // TODO: add onDelete.
};

export default connect()(OutreachCard);
