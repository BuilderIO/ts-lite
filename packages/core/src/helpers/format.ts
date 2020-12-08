export const preSpaceRegex = /^ */g;
export const getPreSpaces = (str: string) =>
  str.match(preSpaceRegex)?.[0].length || 0;

export const format = (str: string) => {
  const lines = str.split('\n');
  lines.forEach((item, index) => {
    const spaces = getPreSpaces(item);
    const nextLine = lines[index + 1];
    if (!nextLine) {
      return;
    }
    const nextSpaces = item.match(/[})]$/)
      ? spaces - 2
      : item.match(/[({]$/)
      ? spaces + 2
      : spaces;

    const newNextItem = nextLine.replace(preSpaceRegex, ' '.repeat(nextSpaces));
    lines[index + 1] = newNextItem;
  });
  return lines.join('\n');
};
