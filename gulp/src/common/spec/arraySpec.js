import {intersperse, lookupByValue} from '../array';


const add200 = (item, index) => item + index + 200;

describe('intersperse', () => {
  it('can handle an empty input', () => {
    expect(intersperse(null, null, [])).toEqual([]);
  });

  it('can handle a single element', () => {
    expect(intersperse(null, add200, [1])).toEqual([201]);
  });

  it('can put items between elements', () => {
    const add300 = (item, index) => item + index + 300;
    expect(intersperse(add300, add200, [1, 3, 7]))
      .toEqual([201, 304, 205, 310, 211]);
  });
});

describe('lookupByValue', () => {
  const defaultVal = {value: '', description: ''};
  const oneVal = [{value: 'a', description: 'red'}];
  const twoVal = [...oneVal, {value: 'b', description: 'blue'}];

  it('returns a default on an empty value', () => {
    const result = lookupByValue([], null);
    expect(result).toEqual(defaultVal);
  });

  it('returns a default on an missing value', () => {
    const result = lookupByValue(oneVal, 'b');
    expect(result).toEqual(defaultVal);
  });

  it('finds correct values', () => {
    const resultA = lookupByValue(twoVal, 'a');
    expect(resultA).toEqual({value: 'a', description: 'red'});
    const resultB = lookupByValue(twoVal, 'b');
    expect(resultB).toEqual({value: 'b', description: 'blue'});
  });

  it('returns a default on an undefined value', () => {
    const result = lookupByValue(undefined, 'b');
    expect(result).toEqual(defaultVal);
  });

  it('returns a default on a null value', () => {
    const result = lookupByValue(null, 'b');
    expect(result).toEqual(defaultVal);
  });
});
