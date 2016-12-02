import {handleActions} from 'redux-actions';

let navCount = 1;
export const initialPageData = {
  fetching: true,
  fetched: false,
  navigation: [],
};

export default handleActions({
  'SET_PAGE_DATA': (state, action) => {
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
        {
          navId: navCount++,
          PageLoadData: action.payload,
        },
      ],
    };
  },
  'CHANGE_ACTIVE_DIMENSION': (state, action) => {
    return {
      ...state,
      fetching: false,
      fetched: true,
      navigation: [
        {
          navId: navCount,
        },
      ],
      'PageLoadData': action.payload,
    };
  },
  'APPLY_TABLE_FILTER': (state, action) => {
    return {
      ...state,
      navigation: [
        ...state.navigation,
        {
          navId: navCount++,
        },
      ],
      'PageLoadData': action.payload,
    };
  },
}, initialPageData);
