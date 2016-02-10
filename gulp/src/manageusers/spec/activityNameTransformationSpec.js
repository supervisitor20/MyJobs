import {formatActivityName} from '../formatActivityName';
import {reverseFormatActivityName} from '../reverseFormatActivityName';

describe('ActivityNameTransformation', () => {
  it('can format an activity name', () => {
    expect(formatActivityName('create user')).toEqual('user - create');
    expect(formatActivityName('create communication record')).toEqual('communication record - create');
  });

  it('can reverse format an activity name', () => {
    expect(reverseFormatActivityName('user - create')).toEqual('create user');
    expect(reverseFormatActivityName('communication record - create')).toEqual('create communication record');
  });
});
