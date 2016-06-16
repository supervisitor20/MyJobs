import {handleActions} from 'redux-actions';

/**
 * current state of a singleton confirmation dialog box: {
 *
 *  data: {
 *    show: is the dialog showing right now?
 *    message: string to show in the box. i.e. "Are you sure?"
 *  },
 *
 *  These are the resolve/reject functions of a promise. If present, it is
 *  assumed that these are associated with an active promise somewhere.
 *  resolve: function, dialog should call this with true or false to indicate
 *    ok or cancel.
 *  reject: function, dialog should call this if something goes wrong.
 */
export default handleActions({
  'SHOW_CONFIRM': (state, action) => {
    const {message, resolve, reject} = action.payload;

    return {
      ...state,
      data: {
        ...state.data,
        message,
        show: true,
      },
      resolve,
      reject,
    };
  },

  'HIDE_CONFIRM': () => {
    return {
      data: {
        show: false,
      },
    };
  },
}, {
  data: {
    show: false,
  },
});
