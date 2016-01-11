import {formatForMultiselect} from '../../util/formatForMultiselect';

const availableUsersParsed = [
  {
    'pk': 1,
    'model': 'myjobs.user',
    'fields': {
      'email': 'dpoynter@apps.directemployers.org',
    },
  },
  {
    'pk': 36,
    'model': 'myjobs.user',
    'fields': {
      'email': 'president@whitehouse.gov',
    },
  },
  {
    'pk': 72,
    'model': 'myjobs.user',
    'fields': {
      'email': 'tiggy@tiggy.com',
    },
  },
];

const expectedResult = [
  {
    'id': 1,
    'name': 'dpoynter@apps.directemployers.org',
  },
  {
    'id': 36,
    'name': 'president@whitehouse.gov',
  },
  {
    'id': 72,
    'name': 'tiggy@tiggy.com',
  },
];

describe('FormatForMultiselect', () => {
  it('can discover malformed emails', () => {
    const availableUsers = formatForMultiselect(availableUsersParsed);
    expect(availableUsers[0].id).toEqual(expectedResult[0].id);
    expect(availableUsers[0].name).toEqual(expectedResult[0].name);
    expect(availableUsers[1].id).toEqual(expectedResult[1].id);
    expect(availableUsers[1].name).toEqual(expectedResult[1].name);
    expect(availableUsers[2].id).toEqual(expectedResult[2].id);
    expect(availableUsers[2].name).toEqual(expectedResult[2].name);
  });
});
