import React, {PropTypes} from 'react';
import {SearchInput} from 'common/ui/SearchInput';
import {Tag} from './Tag';


/**
 * Box of collected items with a search box for adding more.
 */
export function AndBox(props) {
  const {id, addTag, getHints, orGroup, removeTag} = props;
  return (
    <div className="andBox">
      <SearchInput
        id={id}
        emptyOnSelect
        onSelect={t => addTag(t)}
        getHints={p => getHints(p)}
        placeholder="Type item and hit Enter"
        theme={{
          root: 'open dropdown search-input',
          suggestions: 'dropdown-menu',
          input: 'search-input',
          itemActive: 'active',
        }}/>
      {
        orGroup.map(i =>
          <Tag
            key={i.key}
            display={i.display}
            hexColor={i.hexColor}
            removeTag={() => removeTag(i)}/>
        )
      }
    </div>
  );
}

AndBox.propTypes = {
  /**
   * Id for wai-aria. See SearchInput.
   */
  id: PropTypes.string.isRequired,

  /**
   * Callback: the user has added a tag.
   *
   * obj: the tag object selected by the user
   */
  addTag: PropTypes.func.isRequired,

  /**
   * Callback: the user has removed a tag.
   *
   * obj: the tag object removed by the user. May only contain the key attribute.
   */
  removeTag: PropTypes.func.isRequired,

  /**
   * Callback: the user wants hints for a given partial string.
   */
  getHints: PropTypes.func.isRequired,

  /**
   * List of tags already selected by the user for this box.
   */
  orGroup: PropTypes.array.isRequired,
};
