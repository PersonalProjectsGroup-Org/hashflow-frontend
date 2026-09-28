import type { ComponentProps } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClass: Record<ButtonVariant, string> = {
  // Filled accent (blue #58a6ff) with the surface as text color
  primary: 'bg-info text-background hover:brightness-110 active:brightness-95',
  // Bordered surface, brightens on hover (design: hover transitions)
  secondary:
    'border border-border bg-card text-foreground hover:border-muted hover:bg-foreground/5',
  // Borderless, quiet; used for icon buttons (power on/off, kWh edit)
  ghost: 'text-muted hover:text-foreground hover:bg-foreground/10',
  // Destructive action (e.g. emergency shutdown)
  danger: 'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20',
};

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ' +
  'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-info disabled:pointer-events-none disabled:opacity-50';

/**
 * Button — shared action primitive (T009).
 *
 * Variants: primary (filled), secondary (bordered), ghost (icon buttons),
 * danger (destructive). `iconOnly` squares the hit area for icon buttons
 * (power on/off, kWh edit). Accessible per T063: native <button> (keyboard
 * tab + focus-visible ring), and DOM props like `aria-label` flow through.
 *
 * Defaults to `type="button"` so it can't accidentally submit forms
 * (e.g. the kWh editor); pass `type="submit"` explicitly when needed.
 */
export function Button({
  variant = 'secondary',
  iconOnly = false,
  type = 'button',
  className,
  ...props
}: ComponentProps<'button'> & {
  variant?: ButtonVariant;
  iconOnly?: boolean;
}) {
  return (
    <button
      type={type}
      className={`${baseClass} ${iconOnly ? 'h-9 w-9 p-0' : 'h-9 px-4'} ${
        variantClass[variant]
      }${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}
