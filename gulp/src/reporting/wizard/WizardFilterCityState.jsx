import React, {PropTypes, Component} from 'react';
import Select from 'common/ui/Select';
import {SearchInput} from 'common/ui/SearchInput';
import {getDisplayForValue} from 'common/array';
import {states} from 'common/states';


export class WizardFilterCityState extends Component {
    constructor() {
      super();
      this.state = {
        // list of states to choose from
        states: [
          {
            display: 'Select a State',
            value: '',
          },
          ...states,
        ],
        // currently selected city and state, used to filter results
        currentLocation: {
          city: '',
          state: '',
        },
      };
    }

    updateField(field, value) {
      const {updateFilter} = this.props;
      const {currentLocation} = this.state;

      // Update parent
      const newFilter = {...currentLocation};
      newFilter[field] = value;
      updateFilter(newFilter);

      // Set internal state
      const newState = {...this.state};
      newState.currentLocation[field] = value;
      this.setState(newState);
    }

    render() {
      const {id, getHints, cityValue, stateValue} = this.props;

      return (
        <span>
          <Select
            onChange={e =>
              this.updateField('state', e.target.value)}
            name=""
            value={getDisplayForValue(this.state.states, stateValue)}
            choices={this.state.states}
          />
          <SearchInput
            id={id + '-city'}
            value={cityValue}
            callSelectWhenEmpty
            placeholder="city"
            onSelect={v =>
              this.updateField('city', v.value)}
            getHints={v =>
              getHints('city', v)}
          />
        </span>
      );
    }

}

WizardFilterCityState.propTypes = {
  id: PropTypes.string.isRequired,
  cityValue: PropTypes.string.isRequired,
  stateValue: PropTypes.string.isRequired,
  updateFilter: PropTypes.func.isRequired,
  getHints: PropTypes.func.isRequired,
};
