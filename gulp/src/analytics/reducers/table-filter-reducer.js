import {handleActions} from 'redux-actions';

let navCount = 1;
export const initialPageData = {
  fetching: true,
  navigation: [],
  primaryDimensions: {},
};

export default handleActions({
  'MARK_PAGE_LOADING': (state, action) => {
    const pageLoad = action.payload;
    return {
      ...state,
      fetching: pageLoad,
    };
  },
  'SET_PRIMARY_DIMENSIONS': (state, action) => {
    return {
      ...state,
      primaryDimensions: {
        dimensionList: action.payload,
      },
    };
  },
  'SET_PAGE_DATA': (state, action) => {
    return {
      ...state,
      navigation: [
        ...state.navigation,
        {
          navId: navCount++,
          active: true,
          PageLoadData: action.payload,
        },
      ],
    };
  },
  'SWITCH_ACTIVE_TAB': (state, action) => {
    const activeTab = action.payload;
    return {
      ...state,
      navigation: state.navigation.map((nav) => {
        if (nav.navId === activeTab) {
          return {
            ...nav,
            active: true,
          };
        }
        return {
          ...nav,
          active: false,
        };
      }),
    };
  },
  'SWITCH_MAIN_DIMENSION': (state) => {
    return {
      ...state,
      navigation: [
        {
          navId: navCount++,
          active: true,
          PageLoadData: {
            column_names: [
              {key: 'newContent', label: 'New Tab Content'},
              {key: 'new_content', label: 'New Tab Content Again'},
            ],
            rows: [
              {newContent: 'New Content', new_content: 45815},
              {newContent: 'New Content', new_content: 14253},
              {newContent: 'New Content', new_content: 1245},
              {newContent: 'New Content', new_content: 54623},
              {newContent: 'New Content', new_content: 8459},
              {newContent: 'New Content', new_content: 7842},
              {newContent: 'New Content', new_content: 15423},
              {newContent: 'New Content', new_content: 25643},
            ],
          },
        },
      ],
    };
  },
  'REMOVE_SELECTED_TAB': (state, action) => {
    const selectedTab = action.payload;
    return {
      ...state,
      navigation: state.navigation.filter(nav => nav.navId !== selectedTab),
    };
  },
}, initialPageData);
