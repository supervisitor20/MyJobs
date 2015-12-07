import React, {Component, PropTypes} from 'react';
import Button from 'react-bootstrap/lib/Button';


// menu link to overview of the entire nuo module
export class OverviewButton extends Component {
  handleClick() {
    this.props.changePage('Overview');
  }

  render() {
    return (
      <Button onClick={() => this.handleClick()}>Overview</Button>
    );
  }
}

OverviewButton.propTypes = {
  changePage: PropTypes.func.isRequired,
};
