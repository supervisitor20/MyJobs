import {handleActions} from 'redux-actions';

/**
 * contents of a selection control for picking the report data type
 *
 *  intentionValue: the currently selected intention or ''
 *  categoryValue: the currently selected category or ''
 *  dataSetValue: the currently selected dataSet or ''
 *  reportDataId: integer or undefined, the report data represented
 *    by the intention/category/dataSet values
 *  intentionChoices: available choices for intention
 *  categoryChoices: available choices for category
 *  dataSetChoices: available choices for dataSet
 */
export default handleActions({
  'REPLACE_DATA_SET_MENU': (state, action) => {
    const payload = action.payload;
    return {
      intentionValue: payload.intentionValue || '',
      categoryValue: payload.categoryValue || '',
      dataSetValue: payload.dataSetValue || '',
      intentionChoices: payload.intentionChoices || [],
      categoryChoices: payload.categoryChoices || [],
      dataSetChoices: payload.dataSetChoices || [],
      reportDataId: payload.reportDataId,
    };
  },
}, {
  intentionValue: '',
  categoryValue: '',
  dataSetValue: '',
  intentionChoices: [],
  categoryChoices: [],
  dataSetChoices: [],
});
