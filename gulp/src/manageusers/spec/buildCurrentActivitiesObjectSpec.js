import {buildCurrentActivitiesObject} from '../buildCurrentActivitiesObject';

const state = {
  'apiResponseHelp': '',
  'activitiesMultiselectHelp': '',
  'roleName': 'zippitydoodahd',
  'roleNameHelp': '',
  'availableUsers': [
    {
      'id': 219753,
      'name': 'dpoynter@apps.directemployers.org',
    },
    {
      'id': 1250,
      'name': 'tammy@directemployers.org',
    },
    {
      'id': 25010,
      'name': 'seth@directemployers.org',
    },
    {
      'id': 25022,
      'name': 'matt@directemployers.org',
    },
  ],
  'assignedUsers': [],
  'activities': [
    {
      'assigned_activities': [
        {
          'id': 19,
          'name': 'role - update',
        },
      ],
      'available_activities': [
        {
          'id': 17,
          'name': 'role - create',
        },
        {
          'id': 18,
          'name': 'role - read',
        },
        {
          'id': 19,
          'name': 'role - update',
        },
      ],
      'app_access_name': 'User Management',
    },
  ],
};

const refs = {
  activities: {
    refs: {
      UserManagement: {
        state: {
          assignedActivities: [
            {
              'id': 18,
              'name': 'role - read',
            },
          ],
        },
      },
    },
  },
};

const expectedResult = [
  {
    'assigned_activities': [
      {
        'id': 18,
        'name': 'role - read',
      },
    ],
    'available_activities': [
      {
        'id': 17,
        'name': 'role - create',
      },
      {
        'id': 18,
        'name': 'role - read',
      },
      {
        'id': 19,
        'name': 'role - update',
      },
    ],
    'app_access_name': 'User Management',
  },
];

describe('BuildCurrentActivitiesObject', () => {
  it('can read state of a multiselect and create activites object for higher, more generel app state', () => {
    const result = buildCurrentActivitiesObject(state, refs);

    // There's only one app_access in our test data, so there should by only one group of activities
    expect(result.length).toEqual(1);
    // state describes what it WAS, refs.activities.refs.UserManagement.state is the state of the multiselect,
    // which the user supposedly change in our test. Since the assigned activity "changed," the id and name
    // of the assigned activity should be as we expect
    expect(result[0].assigned_activities[0].id).toEqual(expectedResult[0].assigned_activities[0].id);
    expect(result[0].assigned_activities[0].name).toEqual(expectedResult[0].assigned_activities[0].name);
    // The currently selected activity should still be in the available_activities list
    expect(result[0].available_activities[1].id).toEqual(expectedResult[0].available_activities[1].id);
    expect(result[0].available_activities[1].name).toEqual(expectedResult[0].available_activities[1].name);
  });
});
