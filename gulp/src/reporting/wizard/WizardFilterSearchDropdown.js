import React, {PropTypes, Component} from 'react';
import Autosuggest from 'react-autosuggest';


export class WizardFilterSearchDropdown extends Component {
  async loadOptions(input, cb) {
    const {getHints} = this.props;
    const hints = await getHints(input);
    cb(null, hints);
  }

  suggestionRenderer(suggestion) {
    return (
      <a href="#">
        {suggestion.display}
      </a>
    );
  }

  render() {
    const {id, updateFilter, placeholder} = this.props;
    const eid = 'filter-autosuggest-' + id;

    return (
      <Autosuggest
        id={eid}
        cache={false}
        suggestions={(input, cb) =>
          this.loadOptions(input, cb)}
        suggestionRenderer={(s, i) =>
          this.suggestionRenderer(s, i)}
        suggestionValue={s => s.key}
        theme={{
          root: 'dropdown open',
          suggestions: 'dropdown-menu',
        }}
        inputAttributes={{
          type: 'search',
          placeholder: placeholder,
          onChange: v => updateFilter(v),
        }}/>
    );
  }
}

WizardFilterSearchDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  updateFilter: PropTypes.func.isRequired,
  getHints: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
