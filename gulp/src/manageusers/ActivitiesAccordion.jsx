import React from 'react';
import Panel from 'react-bootstrap/lib/Panel';
import Accordion from 'react-bootstrap/lib/Accordion';
import ActivitiesMultiselect from './ActivitiesMultiselect';

class ActivitiesAccordion extends React.Component {
  render() {
    const panels = [];
    for (const i in this.props.activities) {
      if (this.props.activities.hasOwnProperty(i)) {
        panels.push(
          <Panel header={this.props.activities[i].app_access_name} key={i} eventKey={i}>
            <ActivitiesMultiselect availableActivities={this.props.activities[i].available_activities} assignedActivities={this.props.activities[i].assigned_activities} ref={this.props.activities[i].app_access_name.replace(/\s/g, '')}/>
            <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>
          </Panel>
        );
      }
    }
    return (
      <Accordion>
        {panels}
      </Accordion>
    );
  }
}

ActivitiesAccordion.propTypes = {
  activities: React.PropTypes.array.isRequired,
};

ActivitiesAccordion.defaultProps = {
  activities: [],
};

export default ActivitiesAccordion;
