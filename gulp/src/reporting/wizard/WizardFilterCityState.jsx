import React, {PropTypes, Component} from 'react';
import Select from 'common/ui/Select';
import {SearchInput} from 'common/ui/SearchInput';
import {getDisplayForValue} from 'common/array';
import {states} from 'common/states';


export class WizardFilterCityState extends Component {
    constructor() {
      super();
      this.state = {
        states: [
          {
            display: 'Select a State',
            value: '',
          },
          ...states,
        ],
        currentLocation: {
          city: '',
          state: '',
        },
      };
    }

    updateField(field, value) {
      const {updateFilter} = this.props;

      // Update parent
      const {currentLocation} = this.state;
      currentLocation[field] = value.key;
      updateFilter(currentLocation);

      // Set internal state
      this.setState(...this.state, currentLocation);
    }

    render() {
      const {id, getHints} = this.props;
      const createValue = value => {
        return {key: value, value: value};
      };
      return (
        <span>
          <Select
            onChange={e =>
              this.updateField('state', createValue(e.target.value))}
            name=""
            value={
              getDisplayForValue(
                this.state.states, this.state.currentLocation.state)}
            choices={this.state.states}
          />
          <SearchInput
            id={id + '-city'}
            callSelectWhenEmpty
            placeholder="city"
            onSelect={v =>
              this.updateField('city', v)}
            getHints={v =>
              getHints('city', v)}
          />
        </span>
      );
    }

}

WizardFilterCityState.propTypes = {
  id: PropTypes.string.isRequired,
  updateFilter: PropTypes.func.isRequired,
  getHints: PropTypes.func.isRequired,
};
