import React from 'react';
//import {doFilterRecords} from '../actions/record-actions';
import SelectControls from 'common/ui/SelectControls';
/* Menu
   Component for filtering the NUO Record table
 */
export class FilterMenu extends React.Component {
  render() {
    const choices = [{
        value: 'untagged',
        display: 'Filter only untagged items',
        render: () => '',
      }];
    return (
        <div>
          <h2 className="top">Filter</h2>
          <SelectControls
            choices={choices}
            value={'untagged'}
            onSelect={() => ''} />
        </div>
    );
  }
}

FilterMenu.propTypes = {};
