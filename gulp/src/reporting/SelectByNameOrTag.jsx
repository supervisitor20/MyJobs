import React, {Component, PropTypes} from 'react';
import TagSelect from 'common/ui/tags/TagSelect';
import Select from 'common/ui/Select';
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
      // re-enable when tags can be integrated
      // {display: 'Filter by tag', value: 2},
    ];

    this.state = {
      value: 'No filter',
      availableItemHints: [],
      availableTagHints: [],
      choice: 0,
      choices,
      loading: false,
    };
  }

  componentDidMount() {
    const {reportFinder} = this.props;
    // This is used to reload the available list anytime the filter changes.
    this.mounted = true;
    if (reportFinder) {
      this.unsubscribeToFilterChanges = reportFinder.subscribeToFilterChanges(
          () => this.getHints());
    }
    this.getHints();
  }

  componentWillUnmount() {
    if (this.filterChangesRef) {
      this.unsubscribeToFilterChanges();
    }
    this.mounted = false;
  }

  async getHints() {
    const {getItemHints, getTagHints} = this.props;
    if (getItemHints) {
      if (this.mounted) {
        this.setState({loading: true});
        const availableItemHints = await getItemHints();
        this.setState({availableItemHints, loading: false});
      }
    }
    if (getTagHints) {
      if (this.mounted) {
        const availableTagHints = await getTagHints();
        this.setState({availableTagHints});
      }
    }
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
    } = this.props;
    const {
      availableItemHints,
      availableTagHints,
    } = this.state;

    switch (value) {
    case 1:
      return (
        <TagSelect
          selected={selectedItems}
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
          selected={selectedTags}
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
      choices,
      value,
      choice,
      availableItemHints,
      loading,
    } = this.state;
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
          disable = {loading ? true : false}
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
   * Used for hack to refresh available list.
   */
  reportFinder: React.PropTypes.object,
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
