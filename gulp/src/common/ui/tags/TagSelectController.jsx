import React, {PropTypes, Component} from 'react';
import TagSelect from 'common/ui/tags/TagSelect';

export default class TagSelectController extends Component {
  constructor() {
    super();
    this.state = {};
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
    } = this.props;
    const {available} = this.state;
    return (
      <TagSelect
        selected={selected}
        available={available}
        onChoose = {onAdd}
        onRemove = {onRemove}
        />
    );
  }
}

TagSelectController.propTypes = {
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
      hexColor: PropTypes.string,
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
  /**
   * Used for hack to refresh available list.
   */
  reportFinder: React.PropTypes.object,
};
