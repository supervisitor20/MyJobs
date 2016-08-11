import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';

class OutreachCard extends Component {
  render() {
    const {displayText} = this.props;
    return (
      <div className="progress-card">
        <h4>General Doohikie</h4>
      </div>
  );
  }
}

OutreachCard.propTypes = {

};

export default connect(state => ({
}))(OutreachCard);
