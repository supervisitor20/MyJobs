import React from 'react';
import _ from 'lodash-compat';

import Panel from 'react-bootstrap/lib/Panel';
import Accordion from 'react-bootstrap/lib/Accordion';
import ActivitiesMultiselect from './ActivitiesMultiselect';

class ActivitiesAccordion extends React.Component {
  render() {
    const panels = [];
    _.forOwn(this.props.activities, function buildPanels(activity, key) {
      panels.push(
        <Panel header={activity.app_access_name} key={key} eventKey={key}>
          <ActivitiesMultiselect availableActivities={activity.available_activities} assignedActivities={activity.assigned_activities} ref={activity.app_access_name.replace(/\s/g, '')}/>
          <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>
        </Panel>
      );
    });
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
