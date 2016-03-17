import {validateEmail} from '../../common/validateEmail';

describe('ValidateEmail', () => {
  it('can discover malformed emails', () => {
    expect(validateEmail('monkey')).toEqual(false);
    expect(validateEmail('@')).toEqual(false);
    expect(validateEmail('@d.com')).toEqual(false);
    expect(validateEmail('dog@dog')).toEqual(false);
    expect(validateEmail('dog.net')).toEqual(false);
    expect(validateEmail('dog@.com')).toEqual(false);
  });
  it('can discover correctly formed emails', () => {
    expect(validateEmail('monkey@monkey.com')).toEqual(true);
    expect(validateEmail('monkey@monkey.net')).toEqual(true);
    expect(validateEmail('monkey@monkey.biz')).toEqual(true);
    expect(validateEmail('monkey@monkey.abc')).toEqual(true);
    expect(validateEmail('dog@DOG.com')).toEqual(true);
    expect(validateEmail('DOG@dog.com')).toEqual(true);
    expect(validateEmail('dog@dog.COM')).toEqual(true);
  });
});
