import { useRef } from 'react';
import type { ComponentProps, KeyboardEvent } from 'react';

export interface TabItem {
  id: string;
  label: string;
  /** Optional count shown as a small pill next to the label (e.g. 15 alerts). */
  count?: number;
}

const tablistClass = 'inline-flex items-center gap-1 border-b border-border';

const tabBaseClass =
  '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info';

const tabClass = (selected: boolean) =>
  selected
    ? 'border-info text-foreground'
    : 'border-transparent text-muted hover:border-muted/40 hover:text-foreground';

const countClass =
  'rounded-full bg-foreground/10 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted';

/**
 * Tabs — controlled tab bar primitive (T012).
 *
 * Used by the side panel (Alertas / Sugestões / Notícias, US3–US5) with
 * per-tab count badges (15 / 3 / 5). The consumer owns the active tab via
 * `value`/`onValueChange` and renders the panel content; this component
 * renders only the tab bar and wires the WAI-ARIA tabs contract:
 *
 *  - `role="tablist"` / `role="tab"` with `aria-selected` and
 *    `aria-controls` pointing at `panel-<id>` (rendered by the consumer)
 *  - roving `tabIndex` (only the selected tab is in the tab order)
 *  - ArrowLeft / ArrowRight / Home / End move selection and focus
 *
 * Accessible per T063: native buttons, focus-visible ring, label via
 * `aria-label` on the tablist (overridable through props).
 */
export function Tabs({
  items,
  value,
  onValueChange,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  items: TabItem[];
  value: string;
  onValueChange: (id: string) => void;
}) {
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === value);
    if (index === -1 || items.length === 0) return;

    let nextIndex: number;
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const next = items[nextIndex];
    onValueChange(next.id);
    tabRefs.current.get(next.id)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="panel sections"
      onKeyDown={handleKeyDown}
      className={`${tablistClass}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(node) => {
              // React 19 calls the ref callback with null on unmount, so the
              // Map never keeps references to removed tabs (items can change).
              if (node) {
                tabRefs.current.set(item.id, node);
              } else {
                tabRefs.current.delete(item.id);
              }
            }}
            id={`tab-${item.id}`}
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(item.id)}
            className={`${tabBaseClass} ${tabClass(selected)}`}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={countClass} aria-hidden="true">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
