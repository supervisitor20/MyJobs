import {isEqual} from 'lodash-compat/lang';
import {map, filter} from 'lodash-compat/collection';
import {diffLines} from 'diff';


function toDiffEqual(util, customEqualityTesters) {
  return {
    compare: (actual, expected) => {
      if (isEqual(actual, expected)) {
        return {pass: true};
      }

      function stringify(object) {
        if (typeof object === 'undefined') {
          return 'undefined';
        }
        return JSON.stringify(object, null, 2);
      }

      const expectedString = stringify(expected);
      const actualString = stringify(actual);
      const diff = diffLines(
        actualString, expectedString,
        {newLineIsToken: true});

      function prefixLines(prefix, string) {
        const lines = string.split('\n');
        return map(lines, l => prefix + l + "\n");
      }

      const message = "Differences found:\n" +
        map(diff, (part) =>
          prefixLines(
            part.added ? '-' : part.removed ? '+' : ' ',
            part.value).join('')).join('');
      return {pass: false, message};
    },
  };
}

beforeEach(() => {
  jasmine.addMatchers({toDiffEqual});
});

