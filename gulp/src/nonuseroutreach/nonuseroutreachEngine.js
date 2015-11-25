{/*} validation method to ensure value is a proper email username
 returns:
 Object
    -success (whether or not the object validated)
    -message (error message from validator)
*/}
var validateEmailInput = function(value){
  var return_object = {
    success: true,
    messages: []
  }
  var email_re = new RegExp("^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*$", "i");
  var at_re = new RegExp("@+");
  if (value.length == 0) {
    return_object.success = false;
    return return_object;
    };
  if (at_re.test(value)) {
    return_object.success = false;
    return_object.messages.push("Enter only the portion to the left of the '@'")
  } else if (!email_re.test(value)) {
    return_object.success = false;
    return_object.messages.push("Please enter a valid email username")
  };
  return return_object;
};

export class InboxManagement {
    constructor(api){
        this.api = api
    }
    async getInboxesFromApi(){
        return api.loadExistingInboxes();
    }
}