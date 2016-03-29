import React, {PropTypes} from 'react';
import classNames from 'classnames';
import tinycolor from 'tinycolor2';


/**
 * Show a single tag.
 */
export function Tag(props) {
  const {display, hexColor, removeTag, onClick, highlight} = props;

  let backgroundColor;
  let borderColor;
  if (highlight) {
    backgroundColor = tinycolor(hexColor)
      .saturate(30).darken(25).toHexString();
    borderColor = tinycolor(hexColor)
      .saturate(30).darken(35).toHexString();
  } else {
    backgroundColor = '#' + hexColor;
  }

  return (
    <span
      className={
        classNames(
          'tag-select-tag',
          {'faded': highlight},
          {'removable': removeTag})}
      style={{backgroundColor, borderColor}}
      onClick={() => onClick()}>
        {display}
        {removeTag ?
          <i
            onClick={() => removeTag()}/>
          : ''}
    </span>
  );
}

Tag.propTypes = {
  /**
   * Display name for this tag.
   */
  display: PropTypes.string.isRequired,

  /**
   * Color to use for this tag.
   */
  hexColor: PropTypes.string,

  /**
   * Callback: call with no args to indicate that the user clicked remove.
   *
   * Optional: If not present, no UI for tags removal will appear.
   */
  removeTag: PropTypes.func,

  /**
   * Callback: user clicked the tag
   */
  onClick: PropTypes.func,

  /**
   * Is this tag currently highlighted?
   */
  highlight: PropTypes.bool,
};
