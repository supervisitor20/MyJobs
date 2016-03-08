import React from 'react';
import {getCsrf} from 'common/cookie';

class DjangoCSRFToken extends React.Component {
  render() {

    console.log(this.props.context)

    const csrfToken = getCsrf();
    return React.DOM.input(
      {type:"hidden", name:"csrfmiddlewaretoken", value:csrfToken}
    );
  }
}

export default DjangoCSRFToken;
