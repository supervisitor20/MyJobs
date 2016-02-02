import {formatActivityName} from '../../util/formatActivityName';

const input = 'read contact';

const expectedResult = 'contact - read';

describe('FormatActivityName', () => {
  it('formats an activity name', () => {
    const output = formatActivityName(input);
    expect(output).toEqual(expectedResult);
  });
});
