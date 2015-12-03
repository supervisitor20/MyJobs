import React, {Component, PropTypes} from 'react';
import Button from 'react-bootstrap/lib/Button';


/**
 * creates span with buttons for saving, deleting, and canceling changes
 * to an existing inbox
 */
export class ControlButtons extends Component {
  handleButtonClick(i) {
    this.props.buttonClicked(this.props.buttons[i]);
  }

  render() {
    const {buttons} = this.props;
    const buttonComponents = buttons.map((button, i) => {
      const classes = [
        'pull-right',
        'margin-top',
      ];
      if (button.primary) {
        classes.push('primary');
      }
      return (
        <Button
          disabled={button.disabled}
          className={classes}
          onClick={() => this.handleButtonClick(i)}
          key={i}>{button.type}</Button>
      );
    });
    return (
      <span>{buttonComponents}</span>
    );
  }
}

ControlButtons.propTypes = {
  buttonClicked: PropTypes.func.isRequired,
  buttons: PropTypes.arrayOf(PropTypes.object),
};
