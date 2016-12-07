import {handleActions} from 'redux-actions';

let navCount = 1;
export const initialPageData = {
  fetching: true,
  navigation: [],
};

// DUMBIE DATA THAT NEEDS TO BE DELETED BEFORE PRODUCTION
// {
//   column_names: [
//     {key: 'tab2', label: 'Tab 2 Content'},
//     {key: 'tab_2', label: 'Tab 2 Content Again'},
//   ],
//   rows: [
//     {tab2: 'content', tab_2: 45815},
//     {tab2: 'content', tab_2: 14253},
//     {tab2: 'content', tab_2: 1245},
//     {tab2: 'content', tab_2: 54623},
//     {tab2: 'content', tab_2: 8459},
//     {tab2: 'content', tab_2: 7842},
//     {tab2: 'content', tab_2: 15423},
//     {tab2: 'content', tab_2: 25643},
//   ],
// }
//
// {
//   column_names: [
//     {key: 'tab3', label: 'Tab 3 Content'},
//     {key: 'tab_3', label: 'Tab 3 Content Again'},
//   ],
//   rows: [
//     {tab3: 'content', tab_3: 1245},
//     {tab3: 'content', tab_3: 5623},
//     {tab3: 'content', tab_3: 9458},
//     {tab3: 'content', tab_3: 4851},
//     {tab3: 'content', tab_3: 3265},
//     {tab3: 'content', tab_3: 758},
//     {tab3: 'content', tab_3: 6253},
//     {tab3: 'content', tab_3: 5426},
//   ],
// }

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
          active: true,
          PageLoadData: action.payload,
        },
        // {
        //   navId: navCount++,
        //   active: false,
        //   PageLoadData: {
        //     column_names: [
        //       {key: 'tab2', label: 'Tab 2 Content'},
        //       {key: 'tab_2', label: 'Tab 2 Content Again'},
        //     ],
        //     rows: [
        //       {tab2: 'content', tab_2: 45815},
        //       {tab2: 'content', tab_2: 14253},
        //       {tab2: 'content', tab_2: 1245},
        //       {tab2: 'content', tab_2: 54623},
        //       {tab2: 'content', tab_2: 8459},
        //       {tab2: 'content', tab_2: 7842},
        //       {tab2: 'content', tab_2: 15423},
        //       {tab2: 'content', tab_2: 25643},
        //     ],
        //   },
        // },
        // {
        //   navId: navCount++,
        //   active: false,
        //   PageLoadData: {
        //     column_names: [
        //       {key: 'tab3', label: 'Tab 3 Content'},
        //       {key: 'tab_3', label: 'Tab 3 Content Again'},
        //     ],
        //     rows: [
        //       {tab3: 'content', tab_3: 1245},
        //       {tab3: 'content', tab_3: 5623},
        //       {tab3: 'content', tab_3: 9458},
        //       {tab3: 'content', tab_3: 4851},
        //       {tab3: 'content', tab_3: 3265},
        //       {tab3: 'content', tab_3: 758},
        //       {tab3: 'content', tab_3: 6253},
        //       {tab3: 'content', tab_3: 5426},
        //     ],
        //   },
        // },
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
