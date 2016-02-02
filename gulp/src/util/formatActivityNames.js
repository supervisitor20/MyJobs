import {formatActivityName} from 'util/formatActivityName';

// Wraps formatActivityName util function in order to format multiple activity
// names at once.
//
// Input:
// Array of activities, grouped by app_access. Each group contains assigned_activities
// and available_activities. For example:
//
// [
//   {
//     "assigned_activities": [],
//     "available_activities": [
//       {
//         "id": 1,
//         "name": "create contact"
//       },
//       {
//         "id": 27,
//         "name": "update tag"
//       },
//     ],
//     "app_access_name": "PRM"
//   },
//   {
//     "assigned_activities": [
//       {
//         "id": 19,
//         "name": "update role"
//       }
//     ],
//     "available_activities": [
//       {
//         "id": 18,
//         "name": "read role"
//       },
//       {
//         "id": 19,
//         "name": "update role"
//       },
//     ],
//     "app_access_name": "User Management"
//   }
// ]
//
// Output:
// Same format as above, but activity names like "update role" become "role - update"

export function formatActivityNames(activities) {
  for (const i in activities) {
    activities[i].assigned_activities = activities[i].assigned_activities.map( obj => {
        var activity = {}
        activity.id = obj.id;
        activity.name = formatActivityName(obj.name);
        return activity;
    });
    activities[i].available_activities = activities[i].available_activities.map( obj => {
        var activity = {}
        activity.id = obj.id;
        activity.name = formatActivityName(obj.name);
        return activity;
    });
  }

  return activities;
}
