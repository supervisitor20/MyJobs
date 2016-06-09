import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';


const useDevTools = process.env.NODE_ENV !== 'production' &&
  typeof window !== 'undefined' && !!window.devToolsExtension;

const devToolsMiddleware = useDevTools ? window.devToolsExtension() : f => f;


/**
 * Create redux store with our standard middlewares.
 *
 * reducer: reducer for the store
 * defaultState: optional default state for the reducerk
 * thunkExtra: extra arg for thunk middleware.
 */
export default function createReduxStore(reducer, defaultState, thunkExtra) {
  return createStore(reducer, defaultState, compose(
    applyMiddleware(thunkMiddleware.withExtraArgument(thunkExtra)),
    applyMiddleware(promiseMiddleware),
    devToolsMiddleware));
}
