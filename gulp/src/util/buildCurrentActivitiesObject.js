// Activites are stored in an array, grouped by app_access
// Builds object of activities, including currently selected items in a
// dynamically built accordion
// state - current state
// refs - references to elements on the page
export function buildCurrentActivitiesObject(state, refs) {
  // 1. Make a working copy of activities as they were originally
  const currentActivities = state.activities;

  // 2. Update this working copy with currently selected assigned_activities
  // Loop through all apps
  for (const i in currentActivities) {
    if (currentActivities.hasOwnProperty(i)) {
      // Now for each app, loop through all selected activities in its accordion
      // tempRef is the app_access_name without spaces (e.g. User Management
      // becomes UserManagement)
      const tempRef = currentActivities[i].app_access_name.replace(/\s/g, '');
      // Grab currently assigned activities
      const assignedActivities = refs.activities.refs[tempRef].state.assignedActivities;
      // Update working copy
      currentActivities[i].assigned_activities = assignedActivities;
    }
  }

  // 3. Return updated working copy
  return currentActivities;
}
