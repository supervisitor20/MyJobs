import React, {Component, PropTypes} from 'react';
import {map} from 'lodash-compat/collection';
import RemoteFormField from 'common/ui/RemoteFormField';
import Card from './Card';

class Form extends Component {
  render() {
    const {
      form,
      formContents,
      title,
      submitTitle,
      onSubmit,
      onEdit,
    } = this.props;

    const localForm = {...form};

    // TODO: add errors to localForm.
    localForm.errors = {};

    const fields = map(localForm.orderedFields, fieldName => (
      <RemoteFormField
        key={fieldName}
        form={localForm}
        fieldName={fieldName}
        value={formContents[fieldName] || ''}
        onChange={e => onEdit(fieldName, e.target.value)}/>
    ));

    return (
      <Card title={title}>
        {fields}
        <button
          onClick={() => onSubmit()}>
          {submitTitle}
        </button>
      </Card>
    );
  }
}

Form.propTypes = {
  form: PropTypes.object.isRequired,
  formContents: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  submitTitle: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default Form;
