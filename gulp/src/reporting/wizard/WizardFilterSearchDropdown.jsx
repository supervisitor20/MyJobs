import React, {PropTypes, Component} from 'react';
import {SearchInput} from 'common/ui/SearchInput';


export class WizardFilterSearchDropdown extends Component {
  onSearchSelect(value) {
    const {updateFilter} = this.props;
    updateFilter(value.value);
  }

  render() {
    const {id, placeholder, value, getHints, hints} = this.props;
    const eid = 'filter-autosuggest-' + id;

    return (
      <SearchInput
        id={eid}
        value={value}
        callSelectWhenEmpty
        placeholder={placeholder}
        onSelect={v => this.onSearchSelect(v)}
        hints={hints}
        getHints={p => getHints(p)}/>
    );
  }
}

WizardFilterSearchDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  updateFilter: PropTypes.func.isRequired,
  getHints: PropTypes.func.isRequired,
  hints: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
    }).isRequired),
  placeholder: PropTypes.string,
};
