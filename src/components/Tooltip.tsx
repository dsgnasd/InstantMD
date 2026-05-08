import {
  ReactElement,
  cloneElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type Side = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
  text: string;
  side?: Side;
  children: ReactElement;
};

const transformBySide: Record<Side, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0%)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0%, -50%)',
};

const GAP = 8;

export const Tooltip = ({ text, side = 'bottom', children }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const map: Record<Side, { x: number; y: number }> = {
      top: { x: r.left + r.width / 2, y: r.top - GAP },
      bottom: { x: r.left + r.width / 2, y: r.bottom + GAP },
      left: { x: r.left - GAP, y: r.top + r.height / 2 },
      right: { x: r.right + GAP, y: r.top + r.height / 2 },
    };
    setPos(map[side]);
  };

  const show = () => {
    updatePosition();
    setOpen(true);
  };
  const hide = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [open]);

  const childProps = children.props as {
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
  };

  const enhanced = cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      childProps.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      childProps.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e: React.FocusEvent) => {
      childProps.onFocus?.(e);
      show();
    },
    onBlur: (e: React.FocusEvent) => {
      childProps.onBlur?.(e);
      hide();
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <>
      {enhanced}
      {open &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-[1000] whitespace-nowrap rounded-md bg-stone-800 dark:bg-zinc-700 px-2 py-1 text-xs font-medium text-white shadow-md"
            style={{
              left: pos.x,
              top: pos.y,
              transform: transformBySide[side],
            }}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
};
