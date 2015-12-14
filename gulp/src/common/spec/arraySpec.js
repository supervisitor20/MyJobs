import {intersperse, flatMap} from '../array';

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
