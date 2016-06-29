import React from 'react';
import {connect} from 'react-redux';
import {Row} from 'react-bootstrap';
import Dropzone from 'react-dropzone';

import FieldWrapper from 'common/ui/FieldWrapper';
import ColumnMapping from './ColumnMapping';

import {doImportFiles} from '../actions/column-actions';

const excelMimeType =
  'application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/* TODO
 * - add a fieldset to house configuration optoins
 * - alternatively, see if the sidebar makes sense for the above
 */

export class ImportOptionsPage extends React.Component {
  render() {
    const {dispatch} = this.props;
    return (
      <div>
        <Row>
            <FieldWrapper
              key="import-file"
              label="Import File">
              <Dropzone
                className="select-element-input"
                accept={excelMimeType}
                onDrop={files => dispatch(doImportFiles(files))}
                multiple={false}>
                drag file here or click to upload
              </Dropzone>
            </FieldWrapper>
            <ColumnMapping />
        </Row>
      </div>
    );
  }
}

ImportOptionsPage.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
};

export default connect(() => ({}))(ImportOptionsPage);
