// Input:
// Array of objects. E.g.:
// {id: 1, name: "create contact"}
//
// appAccessID to filter for
//
// Output:
// Same array of activities, but only of specified appAccessID
export function filterActivitiesForAppAccess(activities, appAccessID) {
  // Filter for a particular app_access. Options as of 12/9/15:
  // 1 - PRM
  // 2 - User Management
  const activitiesOfSingleAppAccessID = activities.filter( obj => {
    if (obj.fields.app_access === appAccessID) {
      return obj;
    }
  });
  return activitiesOfSingleAppAccessID;
}
