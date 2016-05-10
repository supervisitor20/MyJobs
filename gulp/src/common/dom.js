/* scrollUp(increment : Number, position: Number) => null
 * Given an increment and a position, repeatedly scrolls the viewport upward
 * `increment` pixels until the viewport is at `position`.
 */
export const scrollUp = (increment = 250, position = 0) => {
  // Chrome recognizes document.body, but Firefox recognizes
  // document.documentElement. Both return 0 on each browser, which is why I
  // can't simply define an alias to use for both.
  const scrollTop = document.documentElement.scrollTop ||
                    document.body.scrollTop;
  const scrollInterval = ((0 - scrollTop) / increment) * 10;

  const scrollLoop = setInterval(() => {
    if (scrollTop <= position) {
      clearInterval(scrollLoop);
    }

    document.documentElement.scrollTop += scrollInterval;
    document.body.scrollTop += scrollInterval;
  }, 10);
};

/* isIE8
 * Returns true if the current browser is IE 8 or false otherwise. Works off of
 * the assumption that the addEventListener DOM method isn't available on IE 8.
 */
export const isIE8 = !Boolean(window.addEventListener);
