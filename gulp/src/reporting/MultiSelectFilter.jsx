import React, {PropTypes, Component} from 'react';
import {map} from 'lodash-compat/collection';
import MultiSelect from 'common/ui/MultiSelect';

export default class MultiSelectFilter extends Component {
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
    const {
      selected,
      onAdd,
      onRemove,
      availableHeader,
      selectedHeader,
    } = this.props;
    const {available} = this.state;

    return (
      <MultiSelect
        availableHeader={availableHeader}
        selectedHeader={selectedHeader}
        selected={selected}
        available={available}
        onAdd={onAdd}
        onRemove={onRemove}/>
    );
  }
}

MultiSelectFilter.propTypes = {
  /**
   * Function to get available items
   */
  getHints: React.Proptypes.func.isRequired,
  /**
   * Selected list items.
   */
  selected: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  /**
   * Header text for left side select
   */
  availableHeader: React.PropTypes.string.isRequired,
  /**
   * Header text for right select
   */
  selectedHeader: React.PropTypes.string.isRequired,
  /**
   * Function fired when an item is selected from the left side
   */
  onAdd: React.PropTypes.func.isRequired,
  /**
   * Function fired when an item is selected from the right side
   */
  onRemove: React.PropTypes.func.isRequired,
};
