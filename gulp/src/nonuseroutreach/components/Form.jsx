import React, {Component, PropTypes} from 'react';
import {map} from 'lodash-compat/collection';
import {assign} from 'lodash-compat/object';
import RemoteFormField from 'common/ui/RemoteFormField';
import Card from './Card';

class Form extends Component {
  getValue(formContents, fieldName) {
    const valueData = formContents[fieldName] || {};
    return valueData.value;
  }

  render() {
    const {
      form,
      formContents,
      title,
      submitTitle,
      onSubmit,
      onEdit,
    } = this.props;

    const errors = assign({},
      ...map(formContents, (v, k) =>
        ({[k]: v.errors})));
    const localForm = {...form, errors};

    const fields = map(localForm.orderedFields, fieldName => (
      <RemoteFormField
        key={fieldName}
        form={localForm}
        fieldName={fieldName}
        value={this.getValue(formContents, fieldName) || ''}
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
