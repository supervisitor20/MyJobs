import dataSetMenuReducer from '../dataset-menu-reducer';
import {replaceDataSetMenu} from '../dataset-menu-actions';


describe('dataSetMenuReducer', () => {
  it('has a default state', () => {
    const result = dataSetMenuReducer(undefined, {});
    expect(result).toEqual({
      intentionValue: '',
      categoryValue: '',
      dataSetValue: '',
      intentionChoices: [],
      categoryChoices: [],
      dataSetChoices: [],
    })
  });

  it('can replace its contents entirely', () => {
    const action = replaceDataSetMenu({
      intentionValue: 'a',
      reportDataId: 7,
    });
    const result = dataSetMenuReducer({
      intentionValue: undefined,
    }, action);
    expect(result).toEqual({
      intentionValue: 'a',
      categoryValue: '',
      dataSetValue: '',
      intentionChoices: [],
      categoryChoices: [],
      dataSetChoices: [],
      reportDataId: 7,
    })
  });
});
