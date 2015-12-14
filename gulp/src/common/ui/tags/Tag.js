import React, {PropTypes} from 'react';
import classNames from 'classnames';


export function Tag(props) {
  const {display, hexColor, removeTag} = props;

  return (
    <div
      className={
        classNames(
          'tag-name',
          {'removable': removeTag})}
      style={{backgroundColor: hexColor}}>
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
  display: PropTypes.string.isRequired,
  hexColor: PropTypes.string,
  removeTag: PropTypes.func,
};
