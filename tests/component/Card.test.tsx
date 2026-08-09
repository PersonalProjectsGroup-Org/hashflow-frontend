import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../../src/components/ui/Card';

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Rig 01</Card>);
    expect(screen.getByText('Rig 01')).toBeInTheDocument();
  });

  it('renders a card surface with the design tokens', () => {
    const { container } = render(<Card />);
    expect(container.firstChild).toHaveClass(
      'rounded-md',
      'border',
      'border-border',
      'bg-card',
      'hover:border-muted',
    );
  });

  it('merges a custom className with the base styles', () => {
    const { container } = render(<Card className="max-w-sm" />);
    expect(container.firstChild).toHaveClass('rounded-md', 'max-w-sm');
  });

  it('forwards extra DOM props', () => {
    render(<Card aria-label="rig card" data-rig-id="1" />);
    expect(screen.getByLabelText('rig card')).toHaveAttribute(
      'data-rig-id',
      '1',
    );
  });
});
