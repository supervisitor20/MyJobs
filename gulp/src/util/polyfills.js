import {polyfill as es6PromisePolyfill} from 'es6-promise';
import 'fetch-polyfill';

// Put as many polyfills here as we can.
//
// ES5-shim/sham and babel/polyfill probably have to be part of the bundling
// environment.

export function installPolyfills() {
    // This gives us the Promise API.
  es6PromisePolyfill();

  // Needed on ie8 to make sure fetch can find Promise.
  if (!fetch.Promise) {
    fetch.Promise = window.Promise;
  }

    // IE8 doesn't define console unless the debugger is active.
  if (!window.console) {
    window.console = {
      log: () => {},
      error: () => {},
    };
  }

    // IE8 doesn't have Date.now()
  if (!Date.now) {
    Date.now = () => new Date().getTime();
  }
}
