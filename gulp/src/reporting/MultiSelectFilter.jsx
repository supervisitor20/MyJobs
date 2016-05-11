import React, {PropTypes, Component} from 'react';
import MultiSelect from 'common/ui/MultiSelect';

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
    this.mounted = true;
    if (this.filterChangesRef) {
      this.unsubscribeToFilterChanges();
    }
  }

  async getHints() {
    const {getHints} = this.props;
    if (this.mounted) {
      const available = await getHints();
      // gotta check again. Save me redux.
      if (this.mounted) {
        this.setState({available});
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
};
