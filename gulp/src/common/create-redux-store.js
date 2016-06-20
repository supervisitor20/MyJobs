import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';


function useDevTools() {
  if (process.env.NODE_ENV === 'production') {
    // Not for production
    return false;
  } else if (typeof window === 'undefined') {
    // Not for unit tests
    return false;
  } else if (!window.devToolsExtension) {
    // Not if dev tools aren't present.
    return false;
  }
  return true;
}


const devToolsMiddleware = useDevTools() ? window.devToolsExtension() : f => f;


/**
 * Create redux store with our standard middlewares.
 *
 * reducer: reducer for the store
 * defaultState: optional default state for the reducer. otherwise undefined
 * thunkExtra: extra arg for thunk middleware.
 */
export default function createReduxStore(reducer, defaultState, thunkExtra) {
  return createStore(reducer, defaultState, compose(
    applyMiddleware(thunkMiddleware.withExtraArgument(thunkExtra)),
    applyMiddleware(promiseMiddleware),
    devToolsMiddleware));
}
