import { memo, useMemo, useCallback } from 'react';
import { renderMarkdown } from '../utils/markdownParser';
import { toggleTaskItem } from '../utils/toggleTaskItem';

type PreviewProps = {
  value: string;
  onChange?: (val: string) => void;
};

export const Preview = memo(({ value, onChange }: PreviewProps) => {
  const html = useMemo(() => renderMarkdown(value), [value]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onChange) return;
      const target = e.target as HTMLInputElement;
      if (target.tagName !== 'INPUT' || target.type !== 'checkbox') return;
      e.preventDefault(); // prevent browser from toggling state — we handle it via markdown source
      const boxes = Array.from(
        e.currentTarget.querySelectorAll('input[type="checkbox"]'),
      );
      const idx = boxes.indexOf(target);
      if (idx !== -1) onChange(toggleTaskItem(value, idx));
    },
    [onChange, value],
  );

  if (!value.trim()) {
    return (
      <div className="flex items-center justify-center min-h-full px-4 sm:px-0 text-zinc-400 dark:text-zinc-400">
        <div className="text-center">
          <p className="text-sm font-light">Start writing in editor to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="preview prose dark:prose-dark max-w-none px-4 sm:px-10 py-4 sm:py-6"
    >
      {/* HTML is sanitized by renderMarkdown() via DOMPurify — safe to render */}
      <div onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
});
Preview.displayName = 'Preview';
