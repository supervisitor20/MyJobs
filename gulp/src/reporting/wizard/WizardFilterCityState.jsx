import React, {PropTypes, Component} from 'react';
import Select from 'common/ui/Select';
import {SearchInput} from 'common/ui/SearchInput';
import {getDisplayForValue} from 'common/array';


export class WizardFilterCityState extends Component {
    constructor(props) {
      super(props);
      this.state = {
        // list of states to choose from
        states: [],
        // currently selected city and state, used to filter results
        currentLocation: {
          city: props.cityValue || '',
          state: props.stateValue || '',
        },
      };
      this.updateStates();
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

      this.updateStates();
    }

    async updateStates() {
      const {getHints} = this.props;
      const {currentLocation} = this.state;
      const newStates = await getHints('state');
      this.setState({
        states: [
          {
            display: 'Select a State',
            value: '',
          },
          ...newStates,
        ],
        currentLocation: {
          ...currentLocation,
          state: newStates.length === 1 ? 
                 newStates[0].value : "",
        }
      });
    }

    render() {
      const {id, getHints} = this.props;
      const {currentLocation, states} = this.state;

      return (
        <span>
          <Select
            onChange={e =>
              this.updateField('state', e.target.value)}
            name=""
            value={getDisplayForValue(states, currentLocation.state)}
            choices={this.state.states}
          />
          <SearchInput
            id={id + '-city'}
            value={currentLocation.city}
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
