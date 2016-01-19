/* global spinnerImg */
import React, {Component} from 'react';


export class Loading extends Component {
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
            align: 'center',
            padding: '1em',
          }}/>
      );
    }
    return <span/>;
  }
}

Loading.propTypes = {};
