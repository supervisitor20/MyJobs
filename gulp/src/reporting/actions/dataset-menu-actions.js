import {createAction} from 'redux-actions';

/**
 * We have new menu data.
 *
 * payload is an object shaped like: {
 *   intentionValue: string
 *   categoryValue: string
 *   dataSetValue: string
 *   intentionChoices: array of value/display objects
 *   categoryChoices: array of value/display objects
 *   dataSetChoices: array of value/display objects
 *   reportDataId: report data id that went with these choices, if any
 * }
 */
export const replaceDataSetMenu = createAction('REPLACE_DATA_SET_MENU');
