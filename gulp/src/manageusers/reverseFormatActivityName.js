// Reverses what formatActivityName() does.
//
// Inputs:
// "object - verb". E.g. "contact - read"
//
// Outputs:
// "verb object". E.g. "read contact"

export function reverseFormatActivityName(originalActivityName) {
  const temp = originalActivityName.split(' ');
  const verbWord = temp[temp.length - 1];
  const objectWord = originalActivityName.substring(0, originalActivityName.indexOf(' - ' + verbWord));

  return verbWord + ' ' + objectWord;
}
