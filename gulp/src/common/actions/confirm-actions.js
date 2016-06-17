import {createAction} from 'redux-actions';


/**
 * A modal confirmation dialog box should be shown.
 *
 * message: string message to show the user.
 * resolve: callback (true ok/false cancel) for the dialog to call when done.
 * reject: callback for the dialog to call when something goes wrong.
 */
export const showConfirmAction =
  createAction(
    'SHOW_CONFIRM',
    (message, resolve, reject) => ({message, resolve, reject}));


/**
 * The modal dialog should be hidden.
 */
export const hideConfirmAction =
  createAction('HIDE_CONFIRM');


/**
 * Special action creator which is not a normal compound action.
 *
 * Returns a promise which resolves with the result of a modal confirmation
 * dialog box.
 *
 * dispatch: store dispatch function
 * message: optional, confirmation message to display.
 *
 * For this to work there should be exactly 1 <Confirm> component included
 * in the app somewhere. A `react-router` root component tends to be a
 * good spot.
 */
export async function runConfirmInPlace(dispatch, message) {
  let innerReject;
  let innerResolve;
  const waiter = new Promise(function confirmPromise(resolve, reject) {
    innerResolve = resolve;
    innerReject = reject;
  });

  while (!innerResolve) {
    setTimeout(() => {}, 1);
  }

  dispatch(showConfirmAction(message, innerResolve, innerReject));
  const result = await waiter;
  dispatch(hideConfirmAction());
  return result;
}
