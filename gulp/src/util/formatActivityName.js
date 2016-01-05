// Formats an activity name. Assume verb is always 'create', 'read', 'update',
// or 'delete'
//
// Inputs:
// "verb object". E.g. "read contact"
//
// Outputs:
// "object - verb". E.g. "contact - read"
export function formatActivityName(originalActivityName) {
  const verbWord = originalActivityName.split(' ', 1)[0];
  const objectWord = originalActivityName.replace(verbWord + ' ', '');

  return objectWord + ' - ' + verbWord;
}
