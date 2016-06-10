import React, {Component, PropTypes} from 'react';
import TagSelect from 'common/ui/tags/TagSelect';
import Select from 'common/ui/Select';
import {getDisplayForValue} from 'common/array';
import TagAnd from 'common/ui/tags/TagAnd';

/**
 * Reporting filter component that works for selecting individual entities
 * or tags.
 */
export default class SelectByNameOrTag extends Component {
  constructor(props) {
    super(props);
    const {
      onSelectItemAdd,
      onSelectTagAdd,
      selectedItems,
      selectedTags,
    } = props;

    const noneChoice = {display: 'No filter', value: 0};
    const itemChoice = {display: 'Filter by name', value: 1};
    const tagChoice = {display: 'Filter by tag', value: 2};

    const choices = [noneChoice];
    if (onSelectItemAdd) {
      choices.push(itemChoice);
    }
    if (onSelectTagAdd) {
      choices.push(tagChoice);
    }

    let value;
    let display;
    if (selectedItems) {
      ({value, display} = itemChoice);
    } else if (selectedTags) {
      ({value, display} = tagChoice);
    } else {
      ({value, display} = noneChoice);
    }

    this.state = {
      value: display,
      choice: value,
      choices,
    };
  }

  changeHandler(event) {
    const {choices} = this.state;
    const value = event.target.value;
    const display = getDisplayForValue(choices, value);
    this.resetFilter();
    this.setState({
      choice: value,
      value: display,
    });
  }

  resetFilter() {
    const {
      onSelectItemRemove,
      selectedItems,
    } = this.props;
    const {
      choice,
    } = this.state;
    switch (choice) {
    case 1:
      [...selectedItems].forEach((v) => {
        onSelectItemRemove(v);
      });
      break;
    case 2:
      // address this later when tags are enabled
      break;
    default:
      return;
    }
  }

  renderControl(value) {
    const {
      onSelectItemAdd,
      onSelectItemRemove,
      onSelectTagAdd,
      onSelectTagRemove,
      selectedTags,
      selectedItems,
      searchPlaceholder,
      placeholder,
      availableItemHints,
      availableTagHints,
    } = this.props;

    switch (value) {
    case 1:
      return (
        <TagSelect
          selected={selectedItems || []}
          available={availableItemHints}
          onChoose = {onSelectItemAdd}
          onRemove = {onSelectItemRemove}
          searchPlaceholder = {searchPlaceholder}
          placeholder = {placeholder }
        />
      );
    case 2:
      return (
        <TagAnd
          available={availableTagHints}
          selected={selectedTags || []}
          onChoose={onSelectTagAdd}
          onRemove={onSelectTagRemove}
          />
      );
    default:
      return '';
    }
  }

  render() {
    const {
      availableItemHints,
      itemsLoading,
      tagsLoading,
    } = this.props;
    const {
      choices,
      value,
      choice,
    } = this.state;
    const loading = itemsLoading || tagsLoading;

    let valueAndCount = (
      <span>
        <span className="counter">
          <span className="report-loader"></span>
        </span>
        {value}
      </span>);
    if (!loading) {
      valueAndCount = (
      <span>
        <span className="counter">
          {'(' + availableItemHints.length + ' available)'}
        </span>
        {value}
      </span>);
    }
    return (
      <div>
        <Select
          name=""
          onChange={v => this.changeHandler(v)}
          value={valueAndCount}
          choices = {choices}
          disable = {loading}
        />
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
   * Are items loading?
   */
  itemsLoading: PropTypes.bool.isRequired,

  /**
   * Available items
   */
  availableItemHints: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
    })
  ).isRequired,

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

  getTagHints: PropTypes.func,

  /**
   * Are tags loading?
   */
  tagsLoading: PropTypes.bool.isRequired,

  /**
   * Available tags
   */
  availableTagHints: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
      hexColor: PropTypes.string,
    })
  ),

  /**
   * Currently selected tags
   */
  selectedTags: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.any.isRequired,
        display: PropTypes.string.isRequired,
        hexColor: PropTypes.string,
      })
    )
  ),

  /**
   * Function to add tags when selected
   */
  onSelectTagAdd: PropTypes.func,

  /**
   * Function to remove tags when deselected
   */
  onSelectTagRemove: PropTypes.func,

  /**
   * placeholder text for tag search bar
   */
  searchPlaceholder: React.PropTypes.string,
  /**
   * placeholder text for select input
   */
  placeholder: React.PropTypes.string,
  /**
   * Whether or not to show the counter of results
   */
  showCounter: React.PropTypes.bool,
};
