export const preSpaceRegex = /^ */g;
export const getPreSpaces = (str: string) =>
  str.match(preSpaceRegex)?.[0].length || 0;

// TODO: make an option when needed
const INDENT_SPACES = 2;

export const format = (str: string) => {
  const lines = str.split('\n');
  lines.forEach((item, index) => {
    const spaces = getPreSpaces(item);
    if (item.trim() === '}') {
      lines[index] = item.replace(
        preSpaceRegex,
        ' '.repeat(spaces - INDENT_SPACES),
      );
    }
    const nextLine = lines[index + 1];
    if (!nextLine) {
      return;
    }
    const nextSpaces = item.match(/[})]$/)
      ? spaces - INDENT_SPACES
      : item.match(/[({]$/)
      ? spaces + INDENT_SPACES
      : spaces;

    const newNextItem = nextLine.replace(preSpaceRegex, ' '.repeat(nextSpaces));
    lines[index + 1] = newNextItem;
  });
  return lines.join('\n');
};
