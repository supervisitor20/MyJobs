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
         ref="deleteImg"
         src={expandStaticUrl('svg/delete.svg')} />
      </div>
    );
  }
  render() {
    const {displayText, type} = this.props;
    return (
      <div className="tray-container progress-card"
           onMouseEnter={() => this.setState({showDelete: true})}
           onMouseLeave={() => this.setState({showDelete: false})}>
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
  displayText: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default connect()(OutreachCard);
