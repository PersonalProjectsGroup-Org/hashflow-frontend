import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../src/components/ui/Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Ligar</Button>);
    expect(screen.getByRole('button', { name: 'Ligar' })).toBeInTheDocument();
  });

  it('renders a native button with the base styles', () => {
    const { container } = render(<Button>Ligar</Button>);
    expect(container.firstChild).toHaveClass(
      'inline-flex',
      'rounded-md',
      'transition-colors',
      'focus-visible:outline-info',
    );
  });

  it('maps variants to the design colors', () => {
    const { container, rerender } = render(
      <Button variant="primary">On</Button>,
    );
    expect(container.firstChild).toHaveClass('bg-info', 'text-background');
    rerender(<Button variant="secondary">On</Button>);
    expect(container.firstChild).toHaveClass('border-border', 'bg-card');
    rerender(<Button variant="ghost">On</Button>);
    expect(container.firstChild).toHaveClass(
      'text-muted',
      'hover:bg-foreground/10',
    );
    rerender(<Button variant="danger">On</Button>);
    expect(container.firstChild).toHaveClass('border-danger/40', 'text-danger');
  });

  it('squares the hit area for icon-only buttons', () => {
    const { container } = render(<Button iconOnly aria-label="Power on" />);
    expect(container.firstChild).toHaveClass('h-9', 'w-9', 'p-0');
  });

  it('defaults to type="button" to avoid accidental form submits', () => {
    const { container } = render(<Button>Edit</Button>);
    expect(container.firstChild).toHaveAttribute('type', 'button');
  });

  it('honors an explicit type override', () => {
    const { container } = render(<Button type="submit">Save</Button>);
    expect(container.firstChild).toHaveAttribute('type', 'submit');
  });

  it('disables and dims when disabled', () => {
    const { container } = render(<Button disabled>Off</Button>);
    expect(container.firstChild).toHaveAttribute('disabled');
    expect(container.firstChild).toHaveClass('disabled:opacity-50');
  });

  it('merges a custom className with the base styles', () => {
    const { container } = render(<Button className="ml-2">On</Button>);
    expect(container.firstChild).toHaveClass('rounded-md', 'ml-2');
  });

  it('forwards extra DOM props (aria-labels usable, T063)', () => {
    render(<Button aria-label="Desligar rig" data-rig-id="1" />);
    expect(screen.getByLabelText('Desligar rig')).toHaveAttribute(
      'data-rig-id',
      '1',
    );
  });

  it('fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ligar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Ligar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
