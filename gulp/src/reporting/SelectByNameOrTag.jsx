import React, {Component, PropTypes} from 'react';
import Multiselect from 'common/ui/MultiSelect';
import Select from 'common/ui/Select';
import {map} from 'lodash-compat/collection';
import {getDisplayForValue} from 'common/array';
import TagAnd from 'common/ui/tags/TagAnd';

/**
 * Reporting filter component that works for selecting individual entities
 * or tags.
 */
export class SelectByNameOrTag extends Component {
  constructor(props) {
    super(props);

    const choices = [
      {display: 'No filter', value: 0},
      {display: 'Filter by name', value: 1},
      {display: 'Filter by tag', value: 2},
    ];

    this.state = {
      value: 'No filter',
      availableItemHints: [],
      availableTagHints: [],
      choice: 0,
      choices,
    };
  }

  componentDidMount() {
    this.getHints();
  }

  async getHints() {
    const {getItemHints, getTagHints} = this.props;
    if (getItemHints) {
      const availableItemHints = await getItemHints();
      const fixedAvailableItemHints =
        map(availableItemHints, value =>
            ({value: value.key, display: value.display}));
      this.setState({
        availableItemHints: fixedAvailableItemHints,
      });
    }
    if (getTagHints) {
      const availableTagHints = await getTagHints();
      const fixedAvailableTagHints =
        map(availableTagHints, tag =>
            ({...tag, value: tag.key, display: tag.display}));
      this.setState({
        availableTagHints: fixedAvailableTagHints,
      });
    }
  }

  changeHandler(event) {
    console.log('changeHandler', event);
    const {choices} = this.state;
    const value = event.target.value;
    const display = getDisplayForValue(choices, value);
    this.setState({
      choice: value,
      value: display,
    });
  }

  renderControl(value) {
    const {
      onSelectItemAdd,
      onSelectItemRemove,
      onSelectTagAdd,
      onSelectTagRemove,
      selectedTags,
      selectedItems,
    } = this.props;
    const {
      availableItemHints,
      availableTagHints,
    } = this.state;

    switch (value) {
    case 1:
      return (
        <Multiselect
          available={availableItemHints}
          selected={selectedItems}
          availableHeader={'Available'}
          selectedHeader={'Selected'}
          onAdd={v => onSelectItemAdd(v)}
          onRemove={v => onSelectItemRemove(v)}
          />
      );
    case 2:
      return (
        <TagAnd
          availableTags={availableTagHints}
          selectedTags={selectedTags}
          onChooseTag={onSelectTagAdd}
          onRemoveTag={onSelectTagRemove}
          />
      );
    default:
      return '';
    }
  }

  render() {
    const {choices, value, choice} = this.state;
    return (
      <div>
        <Select
          name=""
          onChange={v => this.changeHandler(v)}
          value={value}
          choices = {choices}/>
        <div className="select-control-chosen">
          {this.renderControl(choice)}
        </div>
      </div>
    );
  }
}

SelectByNameOrTag.propTypes = {
  /**
   * Function that gets the hints
   */
  getItemHints: PropTypes.func.isRequired,

  /**
   * Currently selected items
   */
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
    })
  ).isRequired,

  /**
   * Function to add items when selected
   */
  onSelectItemAdd: PropTypes.func.isRequired,

  /**
   * Function to remove items when deselected
   */
  onSelectItemRemove: PropTypes.func.isRequired,

  getTagHints: PropTypes.func.isRequired,

  /**
   * Currently selected tags
   */
  selectedTags: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.any.isRequired,
        display: PropTypes.string.isRequired,
        hexColor: PropTypes.string.isRequired,
      })
    )
  ).isRequired,

  /**
   * Function to add tags when selected
   */
  onSelectTagAdd: PropTypes.func.isRequired,

  /**
   * Function to remove tags when deselected
   */
  onSelectTagRemove: PropTypes.func.isRequired,
};
