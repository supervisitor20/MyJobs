import React, {PropTypes, Component} from 'react';
import MultiSelect from 'common/ui/MultiSelect';
import {
  filter as lodashFilter,
  indexBy,
} from 'lodash-compat/collection';

export default class MultiSelectFilter extends Component {
  constructor() {
    super();
    this.state = {
      available: [],
    };
    this.mounted = false;
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
    const {getHints, selected, onRemove, removeSelected} = this.props;
    if (this.mounted) {
      const available = await getHints();
      // gotta check again. Save me redux.
      if (this.mounted) {
        this.setState({available});
        // If removeSelected is set, we want to forcibly remove
        // any items from the selected list that are not present in the
        // available list.
        //
        // DANGER: this is opt-in because bugs and even misconfiguration
        // could lead to a perpetual cycle of fields filtering and refiltering
        // each other.
        //
        // Currently needed only for the contacts filter field.
        if (removeSelected) {
          const availableValues = indexBy(available, 'value');
          const missingSelected =
            lodashFilter(selected, s => !availableValues[s.value]);
          onRemove(missingSelected);
        }
      }
    }
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
  getHints: PropTypes.func.isRequired,
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
  /**
   * Used for hack to refresh available list.
   */
  reportFinder: React.PropTypes.object,
  /**
   * Call onRemove for every selected item not in the list returned from
   * getHints. Future: figure out how to _not_ need this. See DANGER in comment
   * above.
   */
  removeSelected: React.PropTypes.bool,
};
