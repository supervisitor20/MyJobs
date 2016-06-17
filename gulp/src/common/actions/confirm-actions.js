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
  // We want to pause execution of this function until a confirm dialog makes
  // a callback. A promise is perfect for this except that we need to make our
  // own promise _and_ grab it's resolve/reject methods and send them to the
  // dialog.
  let innerReject;
  let innerResolve;
  const waiter = new Promise(function confirmPromise(resolve, reject) {
    innerResolve = resolve;
    innerReject = reject;
  });

  // We can't directly control when the function in the promise executes. Block
  // here until it does, as indicated by the variables being initialized.
  while (!innerResolve || !innerReject) {
    setTimeout(() => {}, 1);
  }

  dispatch(showConfirmAction(message, innerResolve, innerReject));

  // Wait until the dialog calls the resolve method (or blows us up here by
  // calling reject) and retreive the result.
  const result = await waiter;

  dispatch(hideConfirmAction());

  return result;
}
