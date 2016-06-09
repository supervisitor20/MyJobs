import {blendControls} from '../components/util';
import {map, filter} from 'lodash-compat/collection';
import {join} from 'lodash-compat/array';
import {split} from 'lodash-compat/string';
import {isEqual} from 'lodash-compat/lang';
import {diffLines} from 'diff';


function toDiffEqual(util, customEqualityTesters) {
  return {
    compare: (actual, expected) => {
      if (isEqual(actual, expected)) {
        return {pass: true};
      }

      const expectedString = JSON.stringify(expected, null, 2);
      const actualString = JSON.stringify(actual, null, 2);
      const diff = diffLines(actualString, expectedString, {newLineIsToken: true});

      function prefixLines(prefix, string) {
        const lines = string.split('\n').slice(0, -1); // drop last blank
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

describe("blend matching controls", () => {
  beforeEach(() => {
    jasmine.addMatchers({toDiffEqual});
  });

  it('leaves empty lists alone', () => {
    const result = blendControls([]);
    expect(result).toDiffEqual([]);
  });

  it('leaves controls that cannot be blended alone', () => {
    const controls = [
     {
        ilter: "date_time",
        interface_type: "date_range",
        display: "Date"
      },
      {
        filter: "locations",
        interface_type: "city_state",
        display: "Contact Location"
      },
      {
        filter: "tags",
        interface_type: "tags",
        display: "Tags"
      },
    ];
    const result = blendControls(controls);
    expect(result).toDiffEqual(controls);
  });

  it('blends controls which have the same name', () => {
    const controls = [
      {
        filter: "communication_type",
        interface_type: "search_multiselect",
        display: "Communication Type"
      },
      {
        filter: "partner",
        interface_type: "search_multiselect",
        display: "Partners"
      },
      {
        filter: "contact",
        interface_type: "search_multiselect",
        display: "Contacts"
      },
      {
        filter: "partner_tags",
        interface_type: "tags",
        display: "Partners"
      },
      {
        filter: "contact_tags",
        interface_type: "tags",
        display: "Contacts"
      },
    ];
    const result = blendControls(controls);
    const expected = [
      {
        filter: "communication_type",
        interface_type: "search_multiselect",
        display: "Communication Type"
      },
      {
        interface_type: "composite",
        filter: "partner+partner_tags",
        display: "Partners",
        interfaces: {
          search_multiselect: {
            filter: "partner",
            interface_type: "search_multiselect",
            display: "Partners"
          },
          tags: {
            filter: "partner_tags",
            interface_type: "tags",
            display: "Partners"
          },
        },
      },
      {
        interface_type: "composite",
        filter: "contact+contact_tags",
        display: "Contacts",
        interfaces: {
          "search_multiselect": {
            filter: "contact",
            interface_type: "search_multiselect",
            display: "Contacts"
          },
          "tags": {
            filter: "contact_tags",
            interface_type: "tags",
            display: "Contacts"
          },
        },
      },
    ];
    expect(result).toDiffEqual(expected);

  });
});
