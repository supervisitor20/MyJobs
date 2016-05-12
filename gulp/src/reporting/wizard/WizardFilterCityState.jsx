import React, {PropTypes, Component} from 'react';
import Select from 'common/ui/Select';
import {SearchInput} from 'common/ui/SearchInput';
import {getDisplayForValue} from 'common/array';


export class WizardFilterCityState extends Component {
    constructor(props) {
      super(props);
      this.state = {
        // list of regions to choose from (states was a bit confusing
        // considering this.state)
        regions: [],
        // currently selected city and state, used to filter results
        currentLocation: {
          city: props.cityValue || '',
          state: props.stateValue || '',
        },
      };
      this.updateRegions();
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

      this.updateRegions();
    }

    async updateRegions() {
      const {getHints} = this.props;
      const newRegions = await getHints('state');
      this.setState({
        regions: [
          {
            display: 'Select a State',
            value: '',
          },
          ...newRegions,
        ],
      });
    }

    render() {
      const {id, getHints} = this.props;
      const {currentLocation, regions} = this.state;

      return (
        <span>
          <Select
            onChange={e =>
              this.updateField('state', e.target.value)}
            name=""
            value={getDisplayForValue(regions, currentLocation.state)}
            choices={regions}
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
};
