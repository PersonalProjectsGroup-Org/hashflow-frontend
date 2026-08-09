import type { ComponentProps } from 'react';

const baseClass =
  'rounded-md border border-border bg-card transition-colors hover:border-muted';

/**
 * Card — shared surface primitive (T007).
 *
 * Used by rig cards and side panels. GitHub-dark surface: subtle border
 * that brightens on hover (design: `rounded-md border bg-card`).
 */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={className ? `${baseClass} ${className}` : baseClass}
      {...props}
    />
  );
}
