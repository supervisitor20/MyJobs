import React, {Component, PropTypes} from 'react';
import Button from 'react-bootstrap/lib/Button';


// menu link to inbox management app screen
export class OutreachRecordButton extends Component {
  handleClick() {
    const {changePage} = this.props;
    changePage('OutreachRecords', [
      'Use this page to view outreach records from non-users',
    ]);
  }

  render() {
    return (
      <Button onClick={() => this.handleClick()}>Outreach Records</Button>
    );
  }
}

OutreachRecordButton.propTypes = {
  changePage: PropTypes.func.isRequired,
};
