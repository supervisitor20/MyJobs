import {createAction} from 'redux-actions';

export const setPageData = createAction('SET_PAGE_DATA');
export const queryMongo = createAction('QUERY_MONGO');

export function doGetPageData() {
  return async (dispatch, _, {api}) => {
    const rawPageData = await api.getInitialPageData();
    dispatch(setPageData(rawPageData));
  };
}

export function doMongoQuery() {
  return async (dispatch, _, {api}) => {
    const query = await api.addFilters();
    dispatch(queryMongo(query));
  };
}
