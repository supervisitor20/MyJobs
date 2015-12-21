import React, {PropTypes} from 'react';
import classNames from 'classnames';


/**
 * Show a single tag.
 */
export function Tag(props) {
  const {display, hexColor, removeTag} = props;

  return (
    <div
      className={
        classNames(
          'tag-name',
          {'removable': removeTag})}
      style={{backgroundColor: '#' + hexColor}}>
        {display}
        {removeTag ?
          <i
            className="fa fa-times close"
            onClick={() => removeTag()}/>
          : ''}
    </div>
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
};
