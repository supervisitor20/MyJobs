/* global $ */
/* global id */
/* global module */

import React from 'react';
import _ from 'lodash-compat';
import {getCsrf} from 'common/cookie';


import {render} from 'react-dom';
import {Router, Route, IndexRoute, Link} from 'react-router';


import BasicTextField from '../common/ui/BasicTextField';
import BasicCheckBox from '../common/ui/BasicCheckBox';
import BasicTextarea from '../common/ui/BasicTextarea';
import BasicDatetimeLocal from '../common/ui/BasicDatetimeLocal';
import BasicMultiselect from '../common/ui/BasicMultiselect';

class Module extends React.Component {
  constructor(props) {
    super(props);

    let form_contents = {};
    form_contents.csrfmiddlewaretoken = getCsrf();
    form_contents.module = this.props.location.query.module;

    // Editing existing module
    if(this.props.params.moduleId){
      form_contents.id = this.props.params.moduleId
    }
    // Creating new module
    else {
      form_contents.id = 'new'
    }

    this.state = {
      api_response: "",
      form_contents: form_contents,
    };
    this.callAPI = this.callAPI.bind(this);
  }
  componentDidMount() {
    this.callAPI();
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
    $.ajax({
      type: "get",
      url: "/profile/view/delete?item=" + this.state.form_contents.id,
      beforeSend: function (xhr){
        xhr.setRequestHeader('Accept', 'application/json');
      },
      success: (api_response) => {
        window.location.assign("/profile/view/");
      }
    });
  }
  handleCancel(event) {
    window.location.assign("/profile/view/");
  }
  handleSave(event) {
    $.ajax({
      type: "post",
      url: "/profile/api",
      data: this.state.form_contents,
      beforeSend: function (xhr){
        xhr.setRequestHeader('Accept', 'application/json');
      },
      success: (api_response) => {
        if(api_response.errors){
          this.setState({
            api_response: api_response,
          });
        }
        else {
          window.location.assign("/profile/view/");
        }
      }
    });
  }
  processForm(api_response) {
    if(api_response) {

      console.log("api_response is:");
      console.log(api_response);
      
      let profileUnits = [];
      // TODO This could be abstracted further for reuse throughout all
      // React / Django forms
      profileUnits = api_response.ordered_fields.map( (profileUnitName, index) => {
        let profileUnit = api_response.fields[profileUnitName];

        console.log(profileUnit);

        switch (profileUnit.widget.input_type) {
        case "text":
          return <BasicTextField {...profileUnit} name={profileUnitName} errorMessages={api_response.errors} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        case "textarea":
          return <BasicTextarea {...profileUnit} name={profileUnitName} errorMessages={api_response.errors} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        case "date":
          return <BasicDatetimeLocal {...profileUnit} name={profileUnitName} errorMessages={api_response.errors} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        // TODO might need to update this case statement with real value
        case "multiselect":
          return <BasicMultiselect {...profileUnit} name={profileUnitName} errorMessages={api_response.errors} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        case "checkbox":
          return <BasicCheckBox {...profileUnit} name={profileUnitName} errorMessages={api_response.errors} onChange={this.onChange.bind(this)} key={index}/>;
          break;
        default:
        }
      });
      return profileUnits;
    }
  }
  callAPI() {
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
          // Replace null values with empty strings
          if(!form_contents[field]){
            form_contents[field] = "";
          }
        };
        this.setState({
          api_response: api_response,
          form_contents: form_contents,
        });
      }
    });
  }
  render() {
    let form_components = this.processForm(this.state.api_response);
    let moduleName = this.state.form_contents.module;
    let id = this.state.form_contents.id;
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <h1>Edit <small>{moduleName}</small></h1>
          </div>
        </div>
        <form action='' method='post' id='profile-unit-form' _lpchecked='1'>
          {form_components}
          <div className="actions row">
            <div className="col-xs-12 col-md-offset-4 col-md-8 text-center">
              <a className='button' id='delete' onClick={this.handleDelete.bind(this)}>Delete</a>
              <a href='/profile/view/' className='button' onClick={this.handleCancel.bind(this)}>Cancel</a>
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
    <Route path="/" component={Module}>
      <IndexRoute component={Module} />
      <Route path="/:moduleId" component={Module} />
      <Route path="*" component={Module}/>
    </Route>
  </Router>
), document.getElementById('content'));
