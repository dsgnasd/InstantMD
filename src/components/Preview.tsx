import { memo, useMemo, useEffect, useRef } from 'react';
import { renderMarkdown } from '../utils/markdownParser';
import { toggleTaskItem } from '../utils/toggleTaskItem';

type PreviewProps = {
  value: string;
  onChange?: (val: string) => void;
};

export const Preview = memo(({ value, onChange }: PreviewProps) => {
  const html = useMemo(() => renderMarkdown(value), [value]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep mutable refs so the event listener never captures stale values
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => { valueRef.current = value; });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.classList?.contains('task-list-item-checkbox')) return;
      // Prevent browser's default toggle — we drive state via markdown source.
      // capture:true ensures preventDefault runs before the activation behavior.
      e.preventDefault();
      const idxStr = target.getAttribute('data-task-idx');
      if (idxStr === null) return;
      const idx = parseInt(idxStr, 10);
      if (!isNaN(idx)) onChangeRef.current?.(toggleTaskItem(valueRef.current, idx));
    };

    container.addEventListener('click', handler, { capture: true });
    return () => container.removeEventListener('click', handler, { capture: true });
  }, []);          // attach once; refs carry fresh values each render

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
    <div className="preview prose dark:prose-dark max-w-none px-4 sm:px-10 py-4 sm:py-6">
      {/* HTML is sanitized by renderMarkdown() via DOMPurify — safe to render */}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
});
Preview.displayName = 'Preview';
