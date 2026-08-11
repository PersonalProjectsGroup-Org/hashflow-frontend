import type { ComponentProps } from 'react';

export type ProgressTone = 'success' | 'warning' | 'danger';

const fillClass: Record<ProgressTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const trackClass = 'h-1 w-full overflow-hidden rounded-full bg-border/40';

/**
 * ProgressBar — thin severity/status bar primitive (T010).
 *
 * Used as the rig-card temperature bar: `h-1 rounded-full`, fill width
 * maps directly to the value (75.6°C → ~75.6%), and the fill color
 * follows the spec's temperature severity thresholds (FR-004, RN01–RN03):
 * green below the warning threshold, amber in the warning band, red at
 * the danger threshold. Thresholds default to the spec's 85°C / 95°C
 * boundaries and can be overridden; an explicit `tone` always wins.
 */
export function ProgressBar({
  value,
  tone,
  warningThreshold = 85,
  dangerThreshold = 95,
  className,
  ...props
}: ComponentProps<'div'> & {
  value: number;
  tone?: ProgressTone;
  warningThreshold?: number;
  dangerThreshold?: number;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const resolvedTone =
    tone ??
    (clamped >= dangerThreshold
      ? 'danger'
      : clamped >= warningThreshold
        ? 'warning'
        : 'success');

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`${trackClass}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <div
        className={`h-full rounded-full ${fillClass[resolvedTone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
