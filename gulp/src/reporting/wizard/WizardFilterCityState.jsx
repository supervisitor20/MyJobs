import React, {PropTypes, Component} from 'react';
import Select from 'common/ui/Select';
import {SearchInput} from 'common/ui/SearchInput';
import {getDisplayForValue} from 'common/array';


export class WizardFilterCityState extends Component {
    constructor(props) {
      super(props);
      this.state = {
        // currently selected city and state, used to filter results
        currentLocation: {
          city: props.cityValue || '',
          state: props.stateValue || '',
        },
      };
    }

    componentDidMount() {
      this.updateRegions();
    }

    updateField(field, value) {
      const {updateFilter} = this.props;
      const {currentLocation} = this.state;

      // Update parent
      const newFilter = {
        ...currentLocation,
        [field]: value,
      };
      updateFilter(newFilter);

      // Set internal state
      const newState = {
        currentLocation: {
          ...this.state.currentLocation,
          [field]: value,
        },
      };
      this.setState(newState);

      //this.updateRegions();
    }

    async updateRegions() {
      const {getHints} = this.props;
      getHints('state');
    }

    render() {
      const {id, getHints, hints} = this.props;
      const {currentLocation} = this.state;

      const stateHints = hints.state || [];
      const regionsWithBlank = [
        {
          display: 'Select a State',
          value: '',
        },
        ...stateHints,
      ];

      return (
        <span>
          <Select
            onChange={e =>
              this.updateField('state', e.target.value)}
            name=""
            value={getDisplayForValue(regionsWithBlank, currentLocation.state)}
            choices={regionsWithBlank}
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
            hints={hints.city}
          />
        </span>
      );
    }

}

WizardFilterCityState.propTypes = {
  // unique id to use for this React component
  id: PropTypes.string.isRequired,
  // Starting City Value
  cityValue: PropTypes.string.isRequired,
  // Starting State Value
  stateValue: PropTypes.string.isRequired,
  // callback used to update the filter used to narrow city and region choices
  updateFilter: PropTypes.func.isRequired,
  // callback used to get valid optoins for cities and regions
  getHints: PropTypes.func.isRequired,
  // known hints
  hints: PropTypes.object,
};
