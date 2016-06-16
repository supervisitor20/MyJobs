import {handleActions} from 'redux-actions';

const pageTips = {
  inboxes: [
    'Use this page to manage the various email addresses to which you will' +
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
  'SET_PAGE': (state, action) => {
    return {
      ...state,
      currentPage: action.payload,
      tips: pageTips[action.payload] || [],
    };
  },
}, initialNavigation);
