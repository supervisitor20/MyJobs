import {reverseFormatActivityName} from '../reverseFormatActivityName';

const input = 'contact - read';

const expectedResult = 'read contact';

describe('ReverseFormatActivityName', () => {
  it('reverse formats an activity name', () => {
    const output = reverseFormatActivityName(input);
    expect(output).toEqual(expectedResult);
  });
});
