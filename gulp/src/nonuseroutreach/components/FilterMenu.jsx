import React from 'react';
//import {doFilterRecords} from '../actions/record-actions';
import SelectControls from 'common/ui/SelectControls';
import TextField from 'common/ui/TextField';

/* Menu
   Component for filtering the NUO Record table
 */
class FilterMenu extends React.Component {
  handleTermChange(term) {

  }
  handleWorkflowChange(workflow_id) {

  }
  render() {
    const choices = [{
        value: 1,
        display: 'Complete',
        render: () => '',
      }];
    return (
        <div style={{paddingBottom:'10px'}}>
          <h2 className="top">Filter</h2>
          Filter by Term
          <TextField
            onChange={v => this.handleTermChange(v.target.value)}/>
          Filter by Workflow Status
          <SelectControls
            choices={choices}
            value={1}
            onSelect={(v) => this.handleWorkflowChange(v.target.value)} />
        </div>
    );
  }
}

FilterMenu.propTypes = {};

export default connect()(FilterMenu);