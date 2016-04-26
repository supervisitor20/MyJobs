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

      // Update parent
      const {currentLocation} = this.state;
      currentLocation[field] = value;
      updateFilter(currentLocation);

      // Set internal state
      this.setState(...this.state, currentLocation);
    }

    render() {
      const {id, getHints} = this.props;

      return (
        <span>
          <Select
            onChange={e =>
              this.updateField('state', e.target.value)}
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
              this.updateField('city', v.key)}
            getHints={v =>
              getHints('city', v)}
          />
        </span>
      );
    }

}

WizardFilterCityState.propTypes = {
  id: React.Proptypes.string.isRequired,
  updateFilter: React.Proptypes.func.isRequired,
  getHints: React.Proptypes.func.isRequired,
};
