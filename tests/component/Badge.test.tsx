import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../src/components/ui/Badge';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>ONLINE</Badge>);
    expect(screen.getByText('ONLINE')).toBeInTheDocument();
  });

  it('renders an uppercase mono tag with the base badge styles', () => {
    const { container } = render(<Badge tone="online">ONLINE</Badge>);
    expect(container.firstChild).toHaveClass(
      'inline-flex',
      'rounded',
      'border',
      'font-mono',
      'uppercase',
    );
  });

  it('maps status tones to the design colors', () => {
    const { container, rerender } = render(<Badge tone="online">ONLINE</Badge>);
    expect(container.firstChild).toHaveClass(
      'border-info',
      'bg-info/10',
      'text-info',
    );
    rerender(<Badge tone="throttling">THROTTLING</Badge>);
    expect(container.firstChild).toHaveClass('border-warning', 'text-warning');
    rerender(<Badge tone="offline">OFFLINE</Badge>);
    expect(container.firstChild).toHaveClass('border-danger', 'text-danger');
  });

  it('maps impact tones to the design colors', () => {
    const { container, rerender } = render(<Badge tone="high">HIGH</Badge>);
    expect(container.firstChild).toHaveClass('border-danger', 'text-danger');
    rerender(<Badge tone="medium">MEDIUM</Badge>);
    expect(container.firstChild).toHaveClass('border-warning', 'text-warning');
    rerender(<Badge tone="low">LOW</Badge>);
    expect(container.firstChild).toHaveClass('border-success', 'text-success');
  });

  it('maps sentiment/type tones to the design colors', () => {
    const { container, rerender } = render(
      <Badge tone="positive">OTIMISTA</Badge>,
    );
    expect(container.firstChild).toHaveClass('border-success', 'text-success');
    rerender(<Badge tone="negative">NEGATIVA</Badge>);
    expect(container.firstChild).toHaveClass('border-danger', 'text-danger');
    rerender(<Badge tone="neutral">GPU</Badge>);
    expect(container.firstChild).toHaveClass('border-border', 'text-muted');
  });

  it('defaults to the neutral tone', () => {
    const { container } = render(<Badge>ASIC</Badge>);
    expect(container.firstChild).toHaveClass('border-border', 'text-muted');
  });

  it('merges a custom className with the base styles', () => {
    const { container } = render(<Badge className="ml-2">GPU</Badge>);
    expect(container.firstChild).toHaveClass('uppercase', 'ml-2');
  });

  it('forwards extra DOM props', () => {
    render(
      <Badge aria-label="rig status" data-rig-id="1">
        ONLINE
      </Badge>,
    );
    expect(screen.getByLabelText('rig status')).toHaveAttribute(
      'data-rig-id',
      '1',
    );
  });
});
