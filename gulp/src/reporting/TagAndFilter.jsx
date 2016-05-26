import React, {PropTypes, Component} from 'react';
import TagAnd from 'common/ui/tags/TagAnd';

export default class TagAndFilter extends Component {
  constructor() {
    super();
    this.state = {
      available: [],
    };
  }

  componentDidMount() {
    const {getHints} = this.props;
    getHints();
  }

  render() {
    const {available, selected, onChoose, onRemove} = this.props;

    return (
      <TagAnd
        selected={selected}
        available={available}
        onChoose={onChoose}
        onRemove={onRemove} />
    );
  }
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
