/**
 * Business logic functions for non user outreach.
 *
 * Extracted for better accessibility for unit tests
 */

export class InboxManagement {
  constructor(api) {
    this.api = api;
  }

  async getExistingInboxes() {
    return this.api.getExistingInboxes();
  }

  /**
    * validation method to ensure value is a proper email username
    * returns:
    * Object
    *   -success (whether or not the object validated)
    *   -message (error message from validator)
    */
  validateEmailInput(value) {
    const result = {
      success: true,
      messages: [],
    };
    const emailRegex = new RegExp(
      "^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*$", 'i');
    const atRegex = new RegExp('@+');
    if (value.length === 0) {
      result.success = false;
      return result;
    }
    if (atRegex.test(value)) {
      result.success = false;
      result.messages.push("Enter only the portion to the left of the '@'");
    } else if (!emailRegex.test(value)) {
      result.success = false;
      result.messages.push('Please enter a valid email username');
    }
    return result;
  }
}
