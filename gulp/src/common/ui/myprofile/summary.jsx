/* global $ */

import React from 'react';
import _ from 'lodash-compat';
import {render} from 'react-dom';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headline: '',
      summary: '',
    };
    this.callProfileAPI = this.callProfileAPI.bind(this);
  }
  componentDidMount() {
    this.callProfileAPI();
  }
  componentWillReceiveProps(nextProps) {
  }
  callProfileAPI() {
    // TODO: Replace with Darrin's API class
    const module = 'summary';
    $.get('/profile/api/?module=' + module, function getProfileUnitData(results) {
      this.setState({
        headline: results.headline,
        summary: results.the_summary,
      });
    }.bind(this));
  }
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <h1>Edit <small>Summary</small></h1>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-8 col-xs-12">

            <div className="row">
              <div className="col-xs-6">
                <label htmlFor="id_role_name" className="col-sm-3 control-label form-label">Headline* </label>
              </div>
              <div className="col-xs-6">
                <input id="id_role_name" className="col-sm-5" maxLength="255" name="name" type="text" size="35" value={this.state.headline}/>
              </div>
            </div>

            <div className="row">
              <div className="col-xs-6">
                <label htmlFor="id_role_name" className="col-sm-3 control-label form-label">Summary* </label>
              </div>
              <div className="col-xs-6">
                <textarea id="" className="col-sm-5" maxLength="255" name="name" type="text" size="35" value={this.state.summary}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('content'));
