import React, {PropTypes} from 'react';
import {AndBox} from './AndBox';
import {AddNewBox} from './AddNewBox';
import {flatMap} from 'common/array';
import {TagBrowser} from './TagBrowser';


/**
 * Box of collected items with a search box for adding more.
 */
export function AndOrContainer(props) {
  const {andGroup, addTag, removeTag, getHints} = props;
  const content = flatMap((orGroup, index) => [
    <AndBox
      key={index.toString()}
      addTag={t => addTag(index, t)}
      getHints={p => getHints(p)}
      removeTag={id => removeTag(index, id)}
      orGroup={orGroup} />,
    <div
      key={index.toString() + 'spacer'}
      className="or-spacing">&</div>,
  ], andGroup);
  const newIndex = andGroup.length;

  return (
    <div className="andor-container">
      <TagBrowser
        id={"tag-browser"}
        getHints={p => getHints(p)}/>
      {content}
      <AddNewBox
        addTag={t => addTag(newIndex, t)}
        getHints={v => getHints(v)}
        />
    </div>
  );
}

AndOrContainer.propTypes = {
  /**
   * Array of arrays of tag objects.
   */
  andGroup: PropTypes.array.isRequired,

  /**
   * Callback: The user has added a tag.
   *
   * index: the index within the andGroup where the tag was added.
   * tag: the new tag object.
   */
  addTag: PropTypes.func.isRequired,

  /**
   * Callback: The user has removed a tag.
   * index: the index within the andGroup where the tag was added.
   * tag: the new tag object. May contain only the key attribute.
   */
  removeTag: PropTypes.func.isRequired,

  /**
   * Callback: the user wants hints for a given partial string.
   */
  getHints: PropTypes.func.isRequired,
};
