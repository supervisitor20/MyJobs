import {handleActions} from 'redux-actions';

// maps page names to a list of tips that should be shown in the menu for that
// page
const pageTips = {
  inboxes: [
    'Use this page to manage the various email addresses to which you will ' +
    'have your employees send outreach emails.',
  ],
  records: [
    'Use this page to view outreach records from non-users.',
  ],
};

export const initialNavigation = {
  currentPage: 'overview',
  tips: [],
};

export const navigationReducer = handleActions({
  /* payload: name of page to set
   * state changes: currentPage is set to that page
   */
  'SET_PAGE': (state, action) => {
    const {page} = action.payload;
    return {
      ...state,
      currentPage: page,
      tips: pageTips[page] || [],
    };
  },
}, initialNavigation);
