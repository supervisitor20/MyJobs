import React from 'react';
import {connect} from 'react-redux';

import FieldWrapper from 'common/ui/FieldWrapper';
import Select from 'common/ui/Select';

const dummyChoices = [
  {value: 'date-time', display: 'Date'},
  {value: 'partner', display: 'Partner'},
  {value: 'location', display: 'Meeting Location'},
];

class ColumnMapping extends React.Component {
  render() {
    return (
      <FieldWrapper
        key="date-contacted"
        label="Date Contacted">
        <Select
          name="date-contacted"
          onChange={e => console.log(e.target.value)}
          choices={dummyChoices}
          value={dummyChoices[0].value} />
      </FieldWrapper>
    );
  }
}

export default connect(() => ({
}))(ColumnMapping);
