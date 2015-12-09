import {filterActivitiesForAppAccess} from '../../util/filterActivitiesForAppAccess';

const input = [
  {
    'pk': 1,
    'model': 'myjobs.activity',
    'fields': {
      'app_access': 1,
      'name': 'create contact',
      'description': 'Add new contacts.',
    },
  },
  {
    'pk': 2,
    'model': 'myjobs.activity',
    'fields': {
      'app_access': 1,
      'name': 'read contact',
      'description': 'View existing contacts.',
    },
  },
  {
    'pk': 3,
    'model': 'myjobs.activity',
    'fields': {
      'app_access': 1,
      'name': 'update contact',
      'description': 'Edit existing contacts.',
    },
  },
  {
    'pk': 18,
    'model': 'myjobs.activity',
    'fields': {
      'app_access': 2,
      'name': 'read role',
      'description': 'View existing roles.',
    },
  },
  {
    'pk': 24,
    'model': 'myjobs.activity',
    'fields': {
      'app_access': 2,
      'name': 'delete user',
      'description': 'Remove existing users.',
    },
  },
];

describe('filterActivitiesForAppAccess', () => {
  it('can filter out activities by app access', () => {
    let filteredActivities = filterActivitiesForAppAccess(input, 1);
    expect(filteredActivities[0].fields.app_access).toEqual(1);
    expect(filteredActivities[0].fields.name).toEqual('create contact');
    expect(filteredActivities[0].fields.description).toEqual('Add new contacts.');

    filteredActivities = filterActivitiesForAppAccess(input, 2);
    expect(filteredActivities[0].fields.app_access).toEqual(2);
    expect(filteredActivities[0].fields.name).toEqual('read role');
    expect(filteredActivities[0].fields.description).toEqual('View existing roles.');
  });
});
