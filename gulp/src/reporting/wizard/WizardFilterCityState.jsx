import React, {PropTypes, Component} from 'react';
import {SearchInput} from 'common/ui/SearchInput';


export class WizardFilterCityState extends Component {
    constructor() {
      super();
      this.state = {
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
      return (
        <span>
          <SearchInput
            id={id + '-city'}
            callSelectWhenEmpty
            placeholder="city"
            onSelect={v =>
              this.updateField('city', v)}
            getHints={v =>
              getHints('city', v)}/>
          <SearchInput
            id={id + '-state'}
            callSelectWhenEmpty
            placeholder="state"
            onSelect={v =>
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
