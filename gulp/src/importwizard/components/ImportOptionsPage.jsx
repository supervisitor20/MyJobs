import React from 'react';
import {Col, Row} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import {MyJobsApi} from 'common/myjobs-api';
import {getCsrf} from 'common/cookie';

const api = new MyJobsApi(getCsrf());

export default class ImportOptionsPage extends React.Component {
  async onDrop(files) {
    const response = await api.upload('/prm/view/import/', files);
    return response;
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          <Dropzone onDrop={files => this.onDrop(files)} multiple={false}>
          Try dragging a spreadsheet here or clicking to select one.
          </Dropzone>
        </Col>
      </Row>
    );
  }
}
