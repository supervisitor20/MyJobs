import {find} from 'lodash-compat/collection';

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
 * Find an entry by value in an array shaped like this:
 *
 *   [
 *      {value, '1', display: 'one'},
 *      {value, '2', display: 'red'},
 *   ]
 *
 * If multiple entries have the same value, only the first will be found.
 *
 * value: entry should have a value key equal to this.
 * returns: the display name corresponding to this value or a blank string
 */
export function getDisplayForValue(objects, value) {
  const result = find(objects, {value});
  if (result) {
    return result.display;
  }
  return '';
}
