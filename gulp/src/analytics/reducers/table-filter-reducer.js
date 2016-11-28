import {handleActions} from 'redux-actions';

let navCount = 1;
export const initialPageData = {
  fetching: true,
  fetched: false,
  navigation: [
    {
      navId: navCount,
    },
  ],
  'PageLoadData': {},
};

export default handleActions({
  'SET_PAGE_DATA': (state, action) => {
    return {
      ...state,
      fetching: false,
      fetched: true,
      navigation: [
        {
          navId: navCount++,
        },
        {
          navId: navCount++,
        },
        {
          navId: navCount++,
        },
      ],
      'PageLoadData': action.payload,
    };
  },
}, initialPageData);
