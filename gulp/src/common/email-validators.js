// Thank you Simon Francesco: http://stackoverflow.com/a/1373724
export function validateEmail(email) {
  const re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;
  return re.test(email);
}

/* localPartOnly
 *
 * Given a string, returns whether or not that string could potentially be
 * considered as the local part of an email address. That is, if the string
 * contains an '@', this function will return false.
 */
export function localPartOnly(email) {
  const re = /@+/;
  return !re.test(email);
}

// TODO: Move this back to nonuseroutreach, as I doubt we'll use this anywhere
// else and it's poorly nameda - Edwin, 06/17/2016

/* validateEmailAddress
 *
 * Given a string, returns an object denoting any error messages to present as
 * well as whether or not the string can be considred as valid for the local
 * part of an email address
 *
 * Examples:
 *  validateEmailAddress('testing') => {
 *    valid: true,
 *    errors: []
 *  }
 *
 *  validateEmailAddress('foo@bar.com') => {
 *    valid: false,
 *    errors: ['Please only enter the portion to the left of the "@"']
 *  }
 */
export function validateEmailAddress(email) {
  const result = {
    valid: true,
    errors: [],
  };
  if (!localPartOnly(email)) {
    result.valid = false;
    result.errors.push(
      'Please only enter the portion to the left of the "@"');
  }

  if (!email.length) {
    result.valid = false;
  }

  return result;
}
