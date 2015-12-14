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
  id: PropTypes.string.isRequired,
  addTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
  getHints: PropTypes.func.isRequired,
  orGroup: PropTypes.array.isRequired,
};
