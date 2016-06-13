/* global spinnerImg */
import React from 'react';


export class Loading extends React.Component {
  componentWillMount() {
    this.setState({
      show: false,
    });
  }

  componentDidMount() {
    this.allowShow = true;
    setTimeout(() => this.setShowIfAllowed(), 300);
  }

  componentWillUnmount() {
    this.allowShow = false;
  }

  setShowIfAllowed() {
    if (this.allowShow) {
      this.setState({show: true});
    }
  }

  render() {
    const {show} = this.state;
    if (show) {
      return (
        <img
          src={spinnerImg}
          style={{
            margin: '50px auto 50px',
            display: 'block',
          }}/>
      );
    }
    return <span/>;
  }
}

Loading.propTypes = {};
