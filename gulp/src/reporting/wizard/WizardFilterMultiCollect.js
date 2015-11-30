import React, {PropTypes, Component} from 'react';
import Autosuggest from 'react-autosuggest';


export class WizardFilterMultiCollect extends Component {
    constructor() {
      super();
      this.state = {value: ''};
    }

    componentDidMount() {
      this.updateState('');
    }

    onInputChange(value) {
      this.updateState(value);
    }

    updateState(value) {
      this.setState({value: value});
    }

    async loadOptions(input, cb) {
      const {getHints} = this.props;
      const hints = await getHints(input);
      cb(null, hints);
    }

    selectOption(value, event) {
      const {addItem} = this.props;
      event.preventDefault();
      addItem(value);
        // Shouldn't have to do this delay but for some reason
        // we need it if the user reached here by clicking.
      setTimeout(() => this.updateState(''), 300);
    }

    suggestionRenderer(suggestion) {
      return (
        <a href="#">
          {suggestion.display}
        </a>
      );
    }

    render() {
      const {id} = this.props;
      const {value} = this.state;
      const eid = 'filter-autosuggest-' + id;

      return (
        <Autosuggest
          id={eid}
          cache={false}
          value={value}
          suggestions={(input, cb) =>
            this.loadOptions(input, cb)}
          suggestionRenderer={(s, i) =>
            this.suggestionRenderer(s, i)}
          suggestionValue={s => s.key.toString()}
          theme={{
            root: 'dropdown open',
            suggestions: 'dropdown-menu',
          }}
          onSuggestionSelected={(v, e) =>
            this.selectOption(v, e)}
          inputAttributes={{
            type: 'search',
            onChange: v => this.onInputChange(v),
          }}/>
        );
    }
}

WizardFilterMultiCollect.propTypes = {
  id: PropTypes.string.isRequired,
  addItem: PropTypes.func.isRequired,
  getHints: PropTypes.func.isRequired,
};
