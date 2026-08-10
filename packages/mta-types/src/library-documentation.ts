import type { ApiDocumentationCatalog } from './api-documentation';
import { doc } from './documentation-builder';

const LUAM = 'a Luam addition, not part of Lua 5.1.';

const SUBJECT: readonly [string, boolean, string] = ['subject', false, 'The string to read.'];

const LIST: readonly [string, boolean, string] = ['list', false, 'The table to read.'];

export const MATH_DOCS: ApiDocumentationCatalog = {
    abs: doc('The distance of a number from zero, dropping its sign.', [['value', false, 'The number to measure.']], 'returns the absolute value.'),
    ceil: doc('Rounds a number up to the next whole number.', [['value', false, 'The number to round.']], 'returns the smallest integer that is not below the value.'),
    clamp: doc(
        `Holds a number inside a range, returning the closest bound when it falls outside. ${LUAM}`,
        [
            ['value', false, 'The number to constrain.'],
            ['low', false, 'The lowest allowed result.'],
            ['high', false, 'The highest allowed result.'],
        ],
        'returns the value, or the bound it exceeded.',
    ),
    floor: doc('Rounds a number down to the previous whole number.', [['value', false, 'The number to round.']], 'returns the largest integer that is not above the value.'),
    huge: doc('A value larger than any other number, used as the starting point of a minimum search.', [], ''),
    max: doc('Picks the largest of its arguments.', [['...values', false, 'The numbers to compare.']], 'returns the largest argument.'),
    min: doc('Picks the smallest of its arguments.', [['...values', false, 'The numbers to compare.']], 'returns the smallest argument.'),
    pi: doc('The ratio of a circle to its diameter, 3.1415926535898.', [], ''),
    random: doc(
        'Produces a pseudo-random number. With no argument the result is a fraction between 0 and 1, with bounds it is a whole number inside them.',
        [
            ['low', true, 'The lowest result, or the highest when it is the only argument given.'],
            ['high', true, 'The highest result.'],
        ],
        'returns the random number.',
    ),
    round: doc(
        `Rounds a number to the nearest whole number, or to a number of decimal places. ${LUAM}`,
        [
            ['value', false, 'The number to round.'],
            ['places', true, 'How many decimal places to keep. Defaults to 0.'],
        ],
        'returns the rounded number.',
    ),
    sqrt: doc('The square root of a number.', [['value', false, 'The number to take the root of. A negative value yields nan.']], 'returns the square root.'),
};

export const STRING_DOCS: ApiDocumentationCatalog = {
    byte: doc(
        'Reads the numeric character codes of a string.',
        [SUBJECT, ['from', true, 'The first position to read. Defaults to 1.'], ['to', true, 'The last position to read. Defaults to from.']],
        'returns one number per character in the range.',
    ),
    char: doc('Builds a string from numeric character codes.', [['...codes', false, 'The character codes to join.']], 'returns the assembled string.'),
    endsWith: doc(
        `Tests whether a string finishes with another one. The suffix is compared literally, not as a pattern. ${LUAM}`,
        [SUBJECT, ['suffix', false, 'The text the string should end with.']],
        'returns true when the string ends with the suffix.',
    ),
    find: doc(
        'Searches a string for a pattern and reports where it sits.',
        [
            SUBJECT,
            ['pattern', false, 'The Lua pattern to search for.'],
            ['from', true, 'The position to start at. Defaults to 1.'],
            ['plain', true, 'Pass true to match the pattern literally instead of as a pattern.'],
        ],
        'returns the start and end positions, plus any captures, or nil when there is no match.',
    ),
    format: doc(
        'Builds a string from a template and its arguments, using the C printf placeholders — %s for a string, %d for a whole number, %.2f for two decimals, %%  for a literal percent.',
        [['template', false, 'The format string holding the placeholders.'], ['...values', false, 'One value per placeholder, in order.']],
        'returns the formatted string.',
    ),
    gmatch: doc(
        'Walks every match of a pattern in a string. Use it in a generic `for` to loop over the pieces.',
        [SUBJECT, ['pattern', false, 'The Lua pattern to look for.']],
        'returns an iterator yielding each match, or its captures when the pattern declares any.',
    ),
    gsub: doc(
        'Replaces every match of a pattern in a string.',
        [
            SUBJECT,
            ['pattern', false, 'The Lua pattern to replace.'],
            ['replacement', false, 'The replacement text, a table keyed by the capture, or a function receiving it.'],
            ['limit', true, 'How many matches to replace at most. Defaults to all of them.'],
        ],
        'returns the new string and how many replacements were made.',
    ),
    len: doc('Counts the characters in a string.', [SUBJECT], 'returns the character count.'),
    lower: doc('Converts every letter in a string to lower case.', [SUBJECT], 'returns the lower case string.'),
    match: doc(
        'Extracts the part of a string that matches a pattern.',
        [SUBJECT, ['pattern', false, 'The Lua pattern to apply.'], ['from', true, 'The position to start at. Defaults to 1.']],
        'returns the captures when the pattern declares any, the whole match otherwise, or nil when there is none.',
    ),
    rep: doc(
        'Repeats a string a number of times.',
        [SUBJECT, ['times', false, 'How many copies to join.']],
        'returns the repeated string.',
    ),
    reverse: doc('Reverses the characters of a string.', [SUBJECT], 'returns the reversed string.'),
    split: doc(
        `Cuts a string into a list on every occurrence of a separator. ${LUAM}`,
        [SUBJECT, ['separator', false, 'The text to cut on. It is matched literally.']],
        'returns an array of the pieces, without the separator.',
    ),
    startsWith: doc(
        `Tests whether a string begins with another one. The prefix is compared literally, not as a pattern. ${LUAM}`,
        [SUBJECT, ['prefix', false, 'The text the string should start with.']],
        'returns true when the string starts with the prefix.',
    ),
    sub: doc(
        'Takes a slice of a string. Negative positions count back from the end, so -1 is the last character.',
        [SUBJECT, ['from', false, 'The first position to keep.'], ['to', true, 'The last position to keep. Defaults to the end of the string.']],
        'returns the slice.',
    ),
    template: doc(
        `Fills \`\${name}\` placeholders in a string from a table of values. This is what a backtick template compiles to. ${LUAM}`,
        [['template', false, 'The text holding the placeholders.'], ['values', true, 'A table whose keys match the placeholder names.']],
        'returns the filled string.',
    ),
    trim: doc(`Removes the whitespace at both ends of a string. ${LUAM}`, [SUBJECT], 'returns the trimmed string.'),
    upper: doc('Converts every letter in a string to upper case.', [SUBJECT], 'returns the upper case string.'),
};

export const TABLE_DOCS: ApiDocumentationCatalog = {
    concat: doc(
        'Joins the array part of a table into one string.',
        [LIST, ['separator', true, 'The text placed between elements. Defaults to no separator.']],
        'returns the joined string.',
    ),
    copy: doc(
        `Duplicates a table. The copy is shallow unless a deep copy is asked for. ${LUAM}`,
        [LIST, ['deep', true, 'Pass true to copy nested tables as well instead of sharing them.']],
        'returns the new table.',
    ),
    includes: doc(
        `Tests whether a value appears in the array part of a table. ${LUAM}`,
        [LIST, ['value', false, 'The value to look for, compared with ==.']],
        'returns true when the value is present.',
    ),
    insert: doc(
        'Adds a value to the array part of a table, at the end by default.',
        [
            LIST,
            ['position', true, 'Where to insert. Existing elements shift up. Defaults to the end.'],
            ['value', false, 'The value to add.'],
        ],
        'returns nothing.',
    ),
    isEmpty: doc(`Tests whether a table holds no keys at all, array or hash. ${LUAM}`, [LIST], 'returns true when the table has no entries.'),
    keys: doc(`Collects every key of a table into a list. ${LUAM}`, [LIST], 'returns an array of the keys, in unspecified order.'),
    remove: doc(
        'Removes an element from the array part of a table and closes the gap.',
        [LIST, ['position', true, 'Which index to remove. Defaults to the last one.']],
        'returns the element that was removed.',
    ),
    size: doc(
        `Counts every entry in a table, including string keys that the # operator ignores. ${LUAM}`,
        [LIST],
        'returns the total number of entries.',
    ),
    sort: doc(
        'Sorts the array part of a table in place. Without a comparator the elements are ordered with <, which requires them to be comparable.',
        [LIST, ['comparator', true, 'A function receiving two elements and returning true when the first must come before the second.']],
        'returns nothing; the table itself is reordered.',
    ),
    values: doc(`Collects every value of a table into a list. ${LUAM}`, [LIST], 'returns an array of the values, in unspecified order.'),
};
