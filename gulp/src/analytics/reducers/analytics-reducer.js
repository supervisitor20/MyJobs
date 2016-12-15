import {handleActions} from 'redux-actions';
import {findIndex} from 'lodash-compat';

let navCount = 1;
export const initialPageData = {
  pageFetching: true,
  navFetching: false,
  navigation: [],
  activeFilters: [],
  activeReport: '',
  primaryDimensions: {},
};

export default handleActions({
  'MARK_PAGE_LOADING': (state, action) => {
    const pageLoad = action.payload;
    return {
      ...state,
      pageFetching: pageLoad,
    };
  },
  'MARK_NAV_LOADING': (state, action) => {
    const navLoad = action.payload;
    return {
      ...state,
      navFetching: navLoad,
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
          startDate: null,
          endDate: null,
          PageLoadData: action.payload,
        },
      ],
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
  'STORE_INITIAL_REPORT': (state, action) => {
    return {
      ...state,
      activeReport: action.payload,
    };
  },
  'STORE_ACTIVE_FILTER': (state, action) => {
    const checkType = action.payload.type;
    const index = findIndex(state.activeFilters, f => f.type === checkType);
    if (index > -1) {
      return {
        ...state,
        navigation: state.navigation.slice(0, index + 1),
        activeFilters: state.activeFilters.slice(0, index).concat(action.payload),
      };
    }
    return {
      ...state,
      activeFilters: [
        ...state.activeFilters,
        action.payload,
      ],
    };
  },
  'STORE_ACTIVE_REPORT': (state, action) => {
    return {
      ...state,
      activeReport: action.payload,
    };
  },
  'SET_SELECTED_FILTER_DATA': (state, action) => {
    return {
      ...state,
      navigation: [
        ...state.navigation.map(nav => Object.assign({}, nav, {active: false})),
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
  'SWITCH_MAIN_DIMENSION': (state, action) => {
    return {
      ...state,
      navigation: [
        {
          navId: navCount++,
          active: true,
          startDate: null,
          endDate: null,
          PageLoadData: action.payload,
        },
      ],
      activeFilters: [],
    };
  },
  'REMOVE_SELECTED_TAB': (state, action) => {
    const selectedTab = action.payload;
    return {
      ...state,
      navigation: state.navigation.filter((nav) => {
        if (state.navigation.length > 1) {
          return nav.navId !== selectedTab;
        }
        return nav;
      }),
    };
  },
}, initialPageData);
