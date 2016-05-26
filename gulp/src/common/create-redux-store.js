import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';

// Since we use this in unit tests occasionally.
const devToolsMiddleware = typeof window === 'undefined' ?
  f => f :
  window.devToolsExtension();

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
    // redux devtools
    //window.devToolsExtension ? window.devToolsExtension() : f => f));
}
