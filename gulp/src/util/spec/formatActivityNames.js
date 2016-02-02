import {formatActivityNames} from '../../util/formatActivityNames';

const input = [
  {
    'assigned_activities': [],
    'available_activities': [
      {
        'id': 1,
        'name': 'create contact',
      },
      {
        'id': 27,
        'name': 'update tag',
      },
    ],
    'app_access_name': 'PRM',
  },
  {
    'assigned_activities': [
      {
        'id': 19,
        'name': 'update role',
      },
    ],
    'available_activities': [
      {
        'id': 18,
        'name': 'read role',
      },
      {
        'id': 19,
        'name': 'update role',
      },
    ],
    'app_access_name': 'User Management',
  },
];

const expectedResult = [
  {
    'assigned_activities': [],
    'available_activities': [
      {
        'id': 1,
        'name': 'contact - create',
      },
      {
        'id': 27,
        'name': 'tag - update',
      },
    ],
    'app_access_name': 'PRM',
  },
  {
    'assigned_activities': [
      {
        'id': 19,
        'name': 'role - update',
      },
    ],
    'available_activities': [
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

describe('FormatActivityNames', () => {
  it('can format many activity names at once', () => {
    var output = formatActivityNames(input);
    expect(output[0].available_activities[0].id).toEqual(expectedResult[0].available_activities[0].id);
    expect(output[0].available_activities[0].name).toEqual(expectedResult[0].available_activities[0].name);
    expect(output[0].available_activities[1].id).toEqual(expectedResult[0].available_activities[1].id);
    expect(output[0].available_activities[1].name).toEqual(expectedResult[0].available_activities[1].name);
  });
});
