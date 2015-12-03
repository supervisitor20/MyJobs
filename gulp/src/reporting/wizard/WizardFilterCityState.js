import React, {PropTypes, Component} from 'react';
import {WizardFilterSearchDropdown} from './WizardFilterSearchDropdown';


export class WizardFilterCityState extends Component {
    constructor() {
      super();
      this.state = {city: '', state: ''};
    }

    updateField(field, value) {
      const {updateFilter} = this.props;
      const newState = {...this.state};
      newState[field] = value;
      this.setState(newState);
      updateFilter(newState);
    }

    render() {
      const {id, getHints} = this.props;
      return (
        <span>
          <WizardFilterSearchDropdown
            id={id + '-city'}
            placeholder="city"
            updateFilter={v =>
              this.updateField('city', v)}
            getHints={v =>
              getHints('city', v)}/>
          <WizardFilterSearchDropdown
            id={id + '-state'}
            placeholder="state"
            updateFilter={v =>
              this.updateField('state', v)}
            getHints={v =>
              getHints('state', v)}/>
        </span>
      );
    }

}

WizardFilterCityState.propTypes = {
  id: PropTypes.string.isRequired,
  updateFilter: PropTypes.func.isRequired,
  getHints: PropTypes.func.isRequired,
};
