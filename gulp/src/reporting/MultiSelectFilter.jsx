import React, {PropTypes, Component} from 'react';
import MultiSelect from 'common/ui/MultiSelect';

export default class MultiSelectFilter extends Component {
  componentDidMount() {
    const {getHints} = this.props;
    getHints();
  }

  render() {
    const {
      selected,
      available,
      onAdd,
      onRemove,
    } = this.props;

    return (
      <MultiSelect
        availableHeader="Available"
        selectedHeader="Selected"
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
  getHints: PropTypes.func.isRequired,
  /**
   * Available list items.
   */
  available: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
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
   * Function fired when an item is selected from the left side
   */
  onAdd: React.PropTypes.func.isRequired,
  /**
   * Function fired when an item is selected from the right side
   */
  onRemove: React.PropTypes.func.isRequired,
};
