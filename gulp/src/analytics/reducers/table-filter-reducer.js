import {handleActions} from 'redux-actions';

let navCount = 1;
export const initialPageData = {
  fetching: true,
  navigation: [],
};

export default handleActions({
  'FETCH_PAGE_DATA': (state, action) => {
    const pageLoad = action.payload;
    return {
      ...state,
      fetching: pageLoad,
    };
  },
  'SET_PAGE_DATA': (state, action) => {
    return {
      ...state,
      navigation: [
        ...state.navigation,
        {
          navId: navCount++,
          PageLoadData: action.payload,
        },
      ],
    };
  },
  'SET_SELECTED_FILTER_DATA': (state, action) => {
    return {
      ...state,
      fetching: false,
      fetched: true,
      navigation: [
        ...state.navigation,
        {
          navId: navCount++,
          PageLoadData: action.payload,
        },
      ],
    };
  },
}, initialPageData);
