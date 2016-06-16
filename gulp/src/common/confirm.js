export async function confirmCb(message, onShow, onHide) {
  let innerReject;
  try {
    let innerResolve;
    const waiter = new Promise(function confirmPromise(resolve, reject) {
      innerResolve = resolve;
      innerReject = reject;
    });

    while (!innerResolve) {
      setTimeout(() => {}, 1);
    }

    onShow(innerResolve);
    const result = await waiter;
    onHide();

    return result;
  } catch (e) {
    innerReject(e);
  }
}
