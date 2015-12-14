/**
 * Return a new array with the results of calling inputFn with calls to
 * sepFn between.
 *
 * sepFn: function(item from input, index in new array)
 * inputFn: function(last item from input, index in new array)
 * input: array of items
 */
export function intersperse(sepFn, inputFn, input) {
  let index = 0;
  if (input.length < 1) {
    return [];
  }
  const output = [];
  output.push(inputFn(input[0], index));
  index += 1;

  for (const item of input.slice(1, input.length)) {
    output.push(sepFn(item, index));
    index += 1;
    output.push(inputFn(item, index));
    index += 1;
  }
  return output;
}

/**
 * Like map but the function returns an array of items to concatenate.
 */
export function flatMap(fn, input) {
  return [].concat(...input.map((item, index) => fn(item, index)));
}
