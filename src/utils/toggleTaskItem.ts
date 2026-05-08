/**
 * Toggles the checked state of the Nth task list item in a markdown string.
 * `- [ ] item` ↔ `- [x] item`
 */
export const toggleTaskItem = (markdown: string, index: number): string => {
  let count = 0;
  return markdown.replace(
    /^(\s*[-*+]\s+\[)([xX ]?)(\])/gm,
    (match, prefix, check, suffix) => {
      if (count++ === index) {
        return `${prefix}${check.toLowerCase() === 'x' ? ' ' : 'x'}${suffix}`;
      }
      return match;
    },
  );
};
