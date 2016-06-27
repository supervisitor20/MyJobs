import {isClientError, errorData} from '../myjobs-api';

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

  describe('isClientError', () => {
    it('finds 400 errors', () => {
      expect(isClientError(a400Error)).toBe(true);
    });

    it('rejects 500 errors', () => {
      expect(isClientError(a500Error)).toBe(false);
    });

    it('rejects other errors', () => {
      expect(isClientError(someOtherError)).toBe(false);
    });
  });

  describe('errorData', () => {
    it('returns errorData on client errors', () => {
      expect(errorData(a400Error)).toEqual({some: 'data'});
    });

    it('does not throw on arbitrary errors', () => {
      expect(errorData(someOtherError)).not.toBeDefined();
    });
  });
});

