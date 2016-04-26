import React, {PropTypes, Component} from 'react';
import {map} from 'lodash-compat/collection';
import TagAnd from 'common/ui/tags/TagAnd';

export default class TagAndFilter extends Component {
  constructor() {
    super();
    this.state = {
      available: [],
    };
  }

  componentDidMount() {
    this.getHints();
  }

  async getHints() {
    const {getHints} = this.props;
    const available = await getHints();
    const fixedAvailable =
      map(available, tag =>
        ({...tag, value: tag.key, display: tag.display}));
    this.setState({
      available: fixedAvailable,
    });
  }

  render() {
    const {selected, onChoose, onRemove} = this.props;
    const {available} = this.state;

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
  getHints: React.Proptypes.func.isRequired,
  selected: React.Proptypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        value: React.Proptypes.any.isRequired,
        display: React.Proptypes.string.isRequired,
        hexColor: React.Proptypes.string.isRequired,
      })
    ).isRequired
  ).isRequired,
  onChoose: React.Proptypes.func.isRequired,
  onRemove: React.Proptypes.func.isRequired,
};
