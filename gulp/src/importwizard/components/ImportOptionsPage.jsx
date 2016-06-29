import React from 'react';
import {Col, Row} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import {MyJobsApi} from 'common/myjobs-api';
import {getCsrf} from 'common/cookie';

const api = new MyJobsApi(getCsrf());
const excelMimeType =
  'application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const style = {
  width: '100%',
  height: '50px',
  borderColor: 'rgb(102, 102, 102)',
  borderStyle: 'dashed',
  borerRadius: '5px',
};

export default class ImportOptionsPage extends React.Component {
  async onDrop(files) {
    const response = await api.upload('/prm/view/import/', files);
    return response;
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          <Row>
            <Col md={4}>
              Import File
            </Col>
            <Col md={8}>
              <Dropzone
                style={style}
                accept={excelMimeType}
                onDrop={files => this.onDrop(files)}
                multiple={false}>
                Try dragging a spreadsheet here or clicking to select one.
              </Dropzone>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}
