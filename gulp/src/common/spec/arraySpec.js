import {intersperse, flatMap, getDisplayForValue} from '../array';


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

const add200Twice = (item, index) => [item + 200, index + 200];

describe('flatMap', () => {
  it('can handle an empty input', () => {
    expect(flatMap(null, [])).toEqual([]);
  });

  it('can handle one element', () => {
    expect(flatMap(add200Twice, [1000])).toEqual([1200, 200]);
  });

  it('can handle multiple elements', () => {
    expect(flatMap(add200Twice, [1000, 1001]))
      .toEqual([1200, 200, 1201, 201]);
  });
});

describe('getDisplayForValue', () => {
  const oneVal = [{value: 'a', display: 'red'}];
  const twoVal = [...oneVal, {value: 'b', display: 'blue'}];

  it('returns blank on an empty value', () => {
    const result = getDisplayForValue([], null);
    expect(result).toEqual('');
  });

  it('returns blank on an missing value', () => {
    const result = getDisplayForValue(oneVal, 'b');
    expect(result).toEqual('');
  });

  it('finds correct values', () => {
    const resultA = getDisplayForValue(twoVal, 'a');
    expect(resultA).toEqual('red');
    const resultB = getDisplayForValue(twoVal, 'b');
    expect(resultB).toEqual('blue');
  });

  it('returns blank on an undefined value', () => {
    const result = getDisplayForValue(undefined, 'b');
    expect(result).toEqual('');
  });

  it('returns blank on a null value', () => {
    const result = getDisplayForValue(null, 'b');
    expect(result).toEqual('');
  });
});
