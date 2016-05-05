/* global $ */
/* global id */
/* global module */

import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills.js';
import {getDisplayForValue} from '../common/array.js';

import param from 'jquery-param';

import React from 'react';
import moment from 'moment';
import {getCsrf} from 'common/cookie';

import {render} from 'react-dom';
import {Router, Route, IndexRoute} from 'react-router';

import TextField from '../common/ui/TextField';
import CheckBox from '../common/ui/CheckBox';
import Textarea from '../common/ui/Textarea';
import DateField from '../common/ui/DateField';
import Select from '../common/ui/Select';
import FieldWrapper from '../common/ui/FieldWrapper';

import {MyJobsApi} from '../common/myjobs-api';

installPolyfills();

class Module extends React.Component {
  constructor(props) {
    super(props);

    const {location, params} = this.props;

    const formContents = {};
    formContents.csrfmiddlewaretoken = getCsrf();
    formContents.module = location.query.module;

    // Editing existing module
    if (params.moduleId) {
      formContents.id = params.moduleId;
    } else {
      // Creating new module
      formContents.id = 'new';
    }

    this.state = {
      apiResponse: '',
      formContents: formContents,
    };
    this.callAPI = this.callAPI.bind(this);
  }
  componentDidMount() {
    this.callAPI();
  }
  onChange(event) {
    const fieldID = event.target.name;

    const {formContents} = this.state;

    let value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    } else if (event.target.type === 'calendar-month') {
      let month = event.target.value;
      // month must be two characters
      month = (month < 10) ? '0' + month : month;
      const existingDate = formContents[fieldID];
      const beforeMonth = existingDate.substring(0, 5);
      const afterMonth = existingDate.substring(7, 10);
      const updatedDate = beforeMonth + month + afterMonth;
      value = updatedDate;
    } else if (event.target.type === 'calendar-day') {
      let day = event.target.value;
      // day must be two characters
      day = (day < 10) ? '0' + day : day;
      const existingDate = formContents[fieldID];
      const beforeDay = existingDate.substring(0, 8);
      const updatedDate = beforeDay + day;
      value = updatedDate;
    } else if (event.target.type === 'calendar-year') {
      const year = event.target.value;
      const existingDate = formContents[fieldID];
      const afterYear = existingDate.substring(4, 10);
      const updatedDate = year + afterYear;
      value = updatedDate;
    } else {
      value = event.target.value;
    }

    formContents[fieldID] = value;
    this.setState({
      formContents: formContents,
    });
  }
  async handleDelete() {
    if (confirm('Are you sure you want to delete this item?') === false) {
      return;
    }

    const {formContents} = this.state;

    const myJobsApi = new MyJobsApi(getCsrf());

    const formData = {
      item: formContents.id,
    };

    await myJobsApi.get('/profile/view/delete?' + param(formData));
    window.location.assign('/profile/view/');
  }
  handleCancel() {
    window.location.assign('/profile/view/');
  }
  processFormContents(formContents) {
    for (const formItem in formContents) {
      // Dates must be of form YYYY-MM-DD before POSTing
      const valueIsDate = moment(formContents[formItem], 'YYYY/MM/DD', true).isValid();
      if (valueIsDate === true) {
        let dateValue = formContents[formItem];
        dateValue = dateValue.replace(/\//g, '-');
        formContents[formItem] = dateValue;
      }
      // Inspect other form field types here
    }
    return formContents;
  }
  async handleSave() {
    const {formContents} = this.state;
    const myJobsApi = new MyJobsApi(getCsrf());

    // We display dates seperated by slashes (i.e. YYYY/MM/DD), but
    // django-remote-forms expects them seperated by dashes (i.e. YYYY-MM-DD)
    const processedFormContents = this.processFormContents(formContents);

    const apiResponse = await myJobsApi.post('/profile/api', processedFormContents);

    if (apiResponse.errors) {
      this.setState({
        apiResponse: apiResponse,
      });
    } else {
      window.location.assign('/profile/view/');
    }
  }
  processForm(apiResponse) {
    const {formContents} = this.state;
    if (apiResponse) {
      // TODO This could be abstracted further for reuse throughout all
      // React / Django forms
      const profileUnits = apiResponse.ordered_fields.map( (profileUnitName, index) => {
        const profileUnit = apiResponse.fields[profileUnitName];
        function wrap(child) {
          return (
            <FieldWrapper
              label={profileUnit.label}
              helpText={profileUnit.help_text}
              errors={apiResponse.errors[profileUnitName]}
              required={profileUnit.required}
              key={index}>
              {child}
            </FieldWrapper>
          );
        }

        switch (profileUnit.widget.input_type) {
        case 'text':
          return wrap(
            <TextField
              name={profileUnitName}
              onChange={e => this.onChange(e, this)}
              required={profileUnit.required}
              value={formContents[profileUnitName]}
              maxLength={profileUnit.widget.maxlength}
              isHidden={profileUnit.widget.is_hidden}
              placeholder={profileUnit.widget.attrs.placeholder}
              autoFocus={profileUnit.widget.attrs.autofocus}
              />
          );
        case 'textarea':
          return wrap(
            <Textarea
              name={profileUnitName}
              onChange={e => this.onChange(e, this)}
              required={profileUnit.required}
              initial={profileUnit.initial}
              maxLength={profileUnit.widget.maxlength}
              isHidden={profileUnit.widget.is_hidden}
              placeholder={profileUnit.widget.attrs.placeholder}
              autoFocus={profileUnit.widget.attrs.autofocus}
              />
          );
        case 'date':
          let year;
          let month;
          let day;
          // If date value is empty use today's date
          if (formContents[profileUnitName] === '') {
            const now = new Date();
            year = now.getFullYear();
            // month and day must both be two characters
            month = now.getMonth() < 10 ? '0' + now.getMonth() : now.getMonth();
            day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
            formContents[profileUnitName] = year + '/' + month + '/' + day;
          }
          return wrap(
            <DateField
              name={profileUnitName}
              onChange={e => this.onChange(e, this)}
              required={profileUnit.required}
              value={formContents[profileUnitName]}
              maxLength={profileUnit.widget.maxlength}
              isHidden={profileUnit.widget.is_hidden}
              placeholder={profileUnit.widget.attrs.placeholder}
              autoFocus={profileUnit.widget.attrs.autofocus}
              />
          );
        case 'select':
          const selected = formContents[profileUnitName];
          return wrap(
            <Select
              name={profileUnitName}
              onChange={e => this.onChange(e, this)}
              value={getDisplayForValue(profileUnit.choices, selected)}
              choices={profileUnit.choices}
              />
          );
        case 'checkbox':
          return wrap(
            <CheckBox
              name={profileUnitName}
              onChange={e => this.onChange(e, this)}
              required={profileUnit.required}
              initial={profileUnit.initial}
              maxLength={profileUnit.widget.maxlength}
              isHidden={profileUnit.widget.is_hidden}
              placeholder={profileUnit.widget.attrs.placeholder}
              autoFocus={profileUnit.widget.attrs.autofocus}
              />
          );
        default:
        }
      });
      return profileUnits;
    }
  }
  async callAPI() {
    const {formContents} = this.state;
    const myJobsApi = new MyJobsApi(getCsrf());
    const formData = {
      id: formContents.id,
      module: formContents.module,
    };
    const apiResponse = await myJobsApi.get('/profile/api?' + param(formData));
    // Update state
    for (const item in apiResponse.data) {
      if (apiResponse.data.hasOwnProperty(item)) {
        // django-remote-forms returns empty fields as null, which won't be
        // caught by React's defaultProps (it only catches undefined). Therefore
        // convert null fields to empty strings:
        // https://github.com/facebook/react/issues/2166
        if (!apiResponse.data[item]) {
          formContents[item] = '';
        } if (moment(apiResponse.data[item], 'YYYY-MM-DD', true).isValid()) {
          // django-remote-forms needs dates to be of form YYYY-MM-DD but
          // we display them to the user as YYYY/MM/DD
          formContents[item] = apiResponse.data[item].replace(/-/g, '/');
        } else {
          formContents[item] = apiResponse.data[item];
        }
      }
    }
    this.setState({
      apiResponse: apiResponse,
      formContents: formContents,
    });
  }
  render() {
    const {formContents, apiResponse} = this.state;
    const moduleName = formContents.module;
    const processedFormComponents = this.processForm(apiResponse);
    const deleteButtonClasses = (formContents.id === 'new') ? 'hidden' : 'button';

    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <h1>Edit <small>{moduleName}</small></h1>
          </div>
        </div>
        <form action="" method="post" id="profile-unit-form" _lpchecked="1">
          {processedFormComponents}
          <div className="actions row">
            <div className="col-xs-12 col-md-offset-4 col-md-8 text-center">
              <a
                className={deleteButtonClasses}
                id="delete"
                onClick={e => this.handleDelete(e, this)}>
                Delete
              </a>
              <a
                href="/profile/view/"
                className="button"
                onClick={e => this.handleCancel(e, this)}>
                Cancel
              </a>
              <a
                className="button primary"
                id="profile-save"
                onClick={e => this.handleSave(e, this)}>
                Save
              </a>
            </div>
          </div>
        </form>
        <div className="clearfix"></div>
      </div>
    );
  }
}

Module.propTypes = {
  location: React.PropTypes.shape({
    query: React.PropTypes.shape({
      module: React.PropTypes.string.isRequired,
    }),
  }).isRequired,
  params: React.PropTypes.shape({
    moduleId: React.PropTypes.string,
  }).isRequired,
};

Module.defaultProps = {
  params: {},
};

render((
  <Router>
    <Route path="/" component={Module}>
      <IndexRoute component={Module} />
      <Route path="/:moduleId" component={Module} />
      <Route path="*" component={Module}/>
    </Route>
  </Router>
), document.getElementById('content'));
