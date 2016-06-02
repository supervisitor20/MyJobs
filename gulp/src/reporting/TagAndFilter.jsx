import React, {PropTypes} from 'react';
import TagAnd from 'common/ui/tags/TagAnd';

export default function TagAndFilter(props) {
  const {available, selected, onChoose, onRemove} = props;

  return (
    <TagAnd
      selected={selected}
      available={available}
      onChoose={onChoose}
      onRemove={onRemove} />
  );
}

TagAndFilter.propTypes = {
  getHints: PropTypes.func.isRequired,
  available: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
      hexColor: PropTypes.string.isRequired,
    })
  ).isRequired,
  selected: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.any.isRequired,
        display: PropTypes.string.isRequired,
        hexColor: PropTypes.string.isRequired,
      })
    ).isRequired
  ).isRequired,
  onChoose: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
