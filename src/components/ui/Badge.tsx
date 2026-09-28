import type { ComponentProps } from 'react';

export type BadgeTone =
  | 'online'
  | 'throttling'
  | 'offline'
  | 'low'
  | 'medium'
  | 'high'
  | 'positive'
  | 'negative'
  | 'neutral';

const toneClass: Record<BadgeTone, string> = {
  // Status (rig card): ONLINE blue, THROTTLING amber, OFFLINE red (FR-004)
  online: 'border-info bg-info/10 text-info',
  throttling: 'border-warning bg-warning/10 text-warning',
  offline: 'border-danger bg-danger/10 text-danger',
  // Impact (alerts feed): LOW green, MEDIUM amber, HIGH red
  low: 'border-success bg-success/10 text-success',
  medium: 'border-warning bg-warning/10 text-warning',
  high: 'border-danger bg-danger/10 text-danger',
  // Sentiment / type (news feed, GPU/ASIC): green / red / gray
  positive: 'border-success bg-success/10 text-success',
  negative: 'border-danger bg-danger/10 text-danger',
  neutral: 'border-border bg-card text-muted',
};

const baseClass =
  'inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] uppercase leading-none tracking-wide';

/**
 * Badge — shared tag primitive (T008).
 *
 * Uppercase mono tag with a colored border + text tint, per design.
 * The tone selects a semantic color (status / impact / sentiment), so
 * badges re-theme globally with the T006 palette swap (e.g. alert mode).
 */
export function Badge({
  tone = 'neutral',
  className,
  ...props
}: ComponentProps<'span'> & { tone?: BadgeTone }) {
  return (
    <span
      className={`${baseClass} ${toneClass[tone] ?? toneClass.neutral}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}
