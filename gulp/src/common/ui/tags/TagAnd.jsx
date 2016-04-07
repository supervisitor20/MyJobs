import React, {PropTypes} from 'react';
import {map} from 'lodash-compat/collection';
import TagSelect from './TagSelect';

export default function TagAnd(props) {
  const {selectedTags, availableTags, onChooseTag, onRemoveTag} = props;

  const selectedPlusBlank = [...selectedTags, []];
  return (
    <div className="tag-select-outer">
      {map(selectedPlusBlank, (ts, i) => (
        <TagSelect
          key={i}
          first={i === 0}
          selectedTags={ts}
          availableTags={availableTags}
          onChooseTag={v => onChooseTag(i, v)}
          onRemoveTag={v => onRemoveTag(i, v)}/>
      ))}
    </div>
  );
}

TagAnd.propTypes = {
  selectedTags: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.any.isRequired,
        display: PropTypes.string.isRequired,
        hexColor: PropTypes.string.isRequired,
      })
    ).isRequired
  ).isRequired,
  availableTags: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
      hexColor: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChooseTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};
