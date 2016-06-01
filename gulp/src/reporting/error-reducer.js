import {handleActions} from 'redux-actions';
import {groupBy} from 'lodash-compat/collection';
import {assign} from 'lodash-compat/object';


const defaultState = {currentErrors: {}}


export default handleActions({
  'ERROR': (state, action) => {
    const {message, data} = action.payload;
    const currentData = state.data || {};
    const indexedData = groupBy(data, o => o.field);
    const mergedData = assign({}, currentData, indexedData,
        (a, b) => (a || []).concat(b));
    return {
      lastMessage: message,
      currentErrors: mergedData,
    };
  },

  'CLEAR_ERRORS': (state, action) => {
    return defaultState;
  },
}, defaultState);
