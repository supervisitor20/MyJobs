import React, {PropTypes, Component} from 'react';
import {SearchInput} from 'common/ui/SearchInput';


export class WizardFilterSearchDropdown extends Component {
  onSearchSelect(value) {
    const {updateFilter} = this.props;
    updateFilter(value.value);
  }

  async getHints(input) {
    const {getHints} = this.props;
    const hints = await getHints(input);
    return hints;
  }

  render() {
    const {id, placeholder, value} = this.props;
    const eid = 'filter-autosuggest-' + id;

    return (
      <SearchInput
        id={eid}
        value={value}
        callSelectWhenEmpty
        placeholder={placeholder}
        onSelect={v => this.onSearchSelect(v)}
        getHints={p => this.getHints(p)}/>
    );
  }
}

WizardFilterSearchDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  updateFilter: PropTypes.func.isRequired,
  getHints: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
