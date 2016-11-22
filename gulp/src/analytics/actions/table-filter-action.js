import {createAction} from 'redux-actions';

export const setPageData = createAction('SET_PAGE_DATA');

export function doGetPageData() {
  return async (dispatch, _, {api}) => {
    const rawPageData = await api.getInitialPageData();
    dispatch(setPageData(rawPageData));
  };
}
