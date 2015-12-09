import {formatActivityName} from 'util/formatActivityName';

// Input:
// String
//
// Output:
// Array of objects. E.g.:
// {id: 1, name: "create contact"}
export function formatForMultiselect(items) {
  // Format to to work with react-filtered-multiselect
  const formattedItems = items.map( obj => {
    const item = {};
    item.id = obj.pk;
    // Activities have a field "name"
    // Users have a field "email"
    if (typeof obj.fields.name !== 'undefined') {
      item.name = formatActivityName(obj.fields.name);
    } else if (typeof obj.fields.email !== 'undefined') {
      item.name = obj.fields.email;
    }
    return item;
  });
  return formattedItems;
}
