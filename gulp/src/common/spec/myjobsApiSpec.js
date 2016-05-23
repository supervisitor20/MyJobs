import {is500Error, is400Error, errorData} from '../myjobs-api';

describe('api errors:', () => {
  const a500Error = new Error();
  a500Error.response = {
    status: 500,
  };

  const a400Error = new Error();
  a400Error.response = {
    status: 400,
  };
  a400Error.data = {some: 'data'};

  const someOtherError = new Error();

  describe('is500Error', () => {
    it('finds 500 errors', () => {
      expect(is500Error(a500Error)).toBe(true);
    });

    it('rejects 400 errors', () => {
      expect(is500Error(a400Error)).toBe(false);
    });

    it('rejects other errors', () => {
      expect(is500Error(someOtherError)).toBe(false);
    });
  });

  describe('is400Error', () => {
    it('finds 400 errors', () => {
      expect(is400Error(a400Error)).toBe(true);
    });

    it('rejects 500 errors', () => {
      expect(is400Error(a500Error)).toBe(false);
    });

    it('rejects other errors', () => {
      expect(is400Error(someOtherError)).toBe(false);
    });
  });

  describe('errorData', () => {
    it('returns errorData on 400 errors', () => {
      expect(errorData(a400Error)).toEqual({some: 'data'});
    });

    it('does not throw on arbitrary errors', () => {
      expect(errorData(someOtherError)).not.toBeDefined();
    });
  });
});

