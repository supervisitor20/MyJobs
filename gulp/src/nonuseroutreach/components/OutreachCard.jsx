import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {expandStaticUrl} from 'common/assets';


class OutreachCard extends Component {
  constructor() {
    super();
    this.state = {
      showDelete: false,
    };
  }
  getDeleteField() {
    return (
      <div className="tray-items">
        <img
         alt="[delete]"
         src={expandStaticUrl('svg/delete.svg')} />
      </div>
    );
  }
  render() {
    const {
      displayText,
      onNav,
      type,
    } = this.props;
    return (
      <div
        className="tray-container progress-card"
        onMouseEnter={() => this.setState({showDelete: true})}
        onMouseLeave={() => this.setState({showDelete: false})}
        onClick={() => onNav()}>
        <div className="tray-items-left">
          <img
          alt={type}
          src={expandStaticUrl('svg/' + type + '-card.svg')} />
        </div>
          {this.state.showDelete ? this.getDeleteField() : ''}
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
  type: PropTypes.string.isRequired,
  // TODO: add icon choice
  // TODO: add onDelete.
};

export default connect()(OutreachCard);
