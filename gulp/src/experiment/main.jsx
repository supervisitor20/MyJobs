/* global $ */
/* global companyName */

import React from 'react';
import _ from 'lodash-compat';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, Link} from 'react-router';

import {getCsrf} from 'common/cookie';

import BasicTextField from '../common/ui/BasicTextField';
import BasicCheckBox from '../common/ui/BasicCheckBox';
import BasicTextarea from '../common/ui/BasicTextarea';
import BasicDatetimeLocal from '../common/ui/BasicDatetimeLocal';
import BasicMultiselect from '../common/ui/BasicMultiselect';

export class App extends React.Component {
  constructor(props) {
    super(props);

    let form_contents = {};
    form_contents.csrfmiddlewaretoken = getCsrf();
    form_contents.id = 279702,
    form_contents.module = 'Name',

    this.state = {
      api_response: "",
      form_contents: form_contents,
    };
    this.callAPI = this.callAPI.bind(this);
  }
  componentDidMount() {
    this.callAPI();
  }
  callAPI() {
    // TODO How to get real ID and Module from previous screen's button?
    $.ajax({
      type: "get",
      url: "/profile/api",
      data: {id: this.state.form_contents.id,
             module: this.state.form_contents.module},
      beforeSend: function (xhr){
        xhr.setRequestHeader('Accept', 'application/json');
      },
      success: (api_response) => {
        // Add form fields to state object
        const form_contents = this.state.form_contents;
        for (let field in api_response.data) {
          form_contents[field] = api_response.data[field];
        };
        this.setState({
          api_response: api_response,
          form_contents: form_contents,
        });
      }
    });
  }
  onChange(event) {
    const field_id = event.target.name;
    const form_contents = this.state.form_contents;

    let value;
    if (event.target.type == "checkbox") {
      value = event.target.checked;
    }
    else if (event.target.type == "select-one") {
      value = event.target.value;
    }
    else {
      value = event.target.value;
    }

    form_contents[field_id] = value;

    this.setState({
      form_contents: form_contents,
    });
  }
  handleDelete(event) {
    console.log(event);
  }
  handleSave(event) {

    console.log("About to save this:");
    console.log(this.state.form_contents);

    $.ajax({
      type: "post",
      url: "/profile/api",
      data: this.state.form_contents,
      beforeSend: function (xhr){
        xhr.setRequestHeader('Accept', 'application/json');
      },
      success: (api_response) => {
        console.log("Field saved");
        console.log(api_response);
      }
    });
  }
  processForm(api_response) {
    if(api_response) {
      let profileUnits = [];
      // TODO This could be abstracted further for reuse throughout all
      // React / Django forms
      profileUnits = api_response.ordered_fields.map( (profileUnitName, index) => {
        let profileUnit = api_response.fields[profileUnitName];
        switch (profileUnit.widget.input_type) {
        case "text":
          return <BasicTextField {...profileUnit} name={profileUnitName} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        case "textarea":
          return <BasicTextarea {...profileUnit} name={profileUnitName} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        case "date":
          return <BasicDatetimeLocal {...profileUnit} name={profileUnitName} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        // TODO might need to update this case statement with real value
        case "multiselect":
          return <BasicMultiselect {...profileUnit} name={profileUnitName} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        case "checkbox":
          return <BasicCheckBox {...profileUnit} name={profileUnitName} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        default:
        }
      });
      return profileUnits;
    }
  }

  render() {
    let form_components = this.processForm(this.state.api_response);
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <h1>Experiment</h1>
          </div>
        </div>

        <form action='' method='post' id='profile-unit-form' _lpchecked='1'>

          {form_components}

          <div className="actions row">
            <div className="col-xs-12 col-md-offset-4 col-md-8 text-center">
              <a className='button' id='delete' onClick={this.handleDelete}>Delete</a>
              <a href='/profile/view/' className='button'>Cancel</a>
              <a className='button primary' id='profile-save' onClick={this.handleSave.bind(this)}>Save</a>
            </div>
          </div>
        </form>

        <div className="clearfix"></div>
      </div>
    );
  }
}

render((
  <Router>
    <Route path="/" component={App} />
  </Router>
), document.getElementById('content'));
