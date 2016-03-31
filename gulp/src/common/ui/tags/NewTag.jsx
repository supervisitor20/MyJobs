import React from 'react';
import classNames from 'classnames';
import tinycolor from 'tinycolor2';

/**
 * Show a single tag.
 */
class NewTag extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {display, hexColor, removeTag, onClick, onMouseOver, highlight} = this.props;

    let backgroundColor;
    let borderColor;
    if (highlight) {
      backgroundColor = tinycolor(hexColor)
        .lighten(20).toHexString();
      borderColor = tinycolor(hexColor)
        .lighten(20).toHexString();
    } else {
      backgroundColor = '#' + hexColor;
      borderColor = tinycolor(hexColor)
        .darken(10).toHexString();
    }

    return (
      <span
        className={
          classNames(
            'tag-select-tag',
            {'faded': highlight},
            {'removable': removeTag})}
        style={{backgroundColor, borderColor}}
        onClick={(e) => onClick(e)}
        onMouseOver={(e) => onMouseOver(e)}>
          {display}
          {removeTag ?
            <i
              onClick={(e) => removeTag(e)}/>
            : ''}
      </span>
    );
  }
}

NewTag.propTypes = {
  /**
   * Display name for this tag.
   */
  display: React.PropTypes.string.isRequired,

  /**
   * Color to use for this tag.
   */
  hexColor: React.PropTypes.string,

  /**
   * Callback: call with no args to indicate that the user clicked remove.
   *
   * Optional: If not present, no UI for tags removal will appear.
   */
  removeTag: React.PropTypes.func,

  /**
   * Callback: user clicked the tag
   */
  onClick: React.PropTypes.func,

  /**
   * Callback: user hovered the tag
   */
  onMouseOver: React.PropTypes.func,

  /**
   * Is this tag currently highlighted?
   */
  highlight: React.PropTypes.bool,
};

export default NewTag;
