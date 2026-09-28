import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../../src/components/ui/ProgressBar';

describe('ProgressBar', () => {
  it('maps the fill width to the value', () => {
    const { container } = render(<ProgressBar value={75.6} />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveStyle({ width: '75.6%' });
  });

  it('renders a thin rounded track with the base styles', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.firstChild).toHaveClass('h-1', 'rounded-full', 'w-full');
  });

  it('colors the fill green below the warning threshold', () => {
    const { container } = render(<ProgressBar value={75.6} />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-success');
  });

  it('colors the fill amber inside the warning band', () => {
    const { container, rerender } = render(<ProgressBar value={85} />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-warning');
    rerender(<ProgressBar value={94.9} />);
    expect(fill).toHaveClass('bg-warning');
  });

  it('colors the fill red at and above the danger threshold', () => {
    const { container, rerender } = render(<ProgressBar value={95} />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-danger');
    rerender(<ProgressBar value={100} />);
    expect(fill).toHaveClass('bg-danger');
  });

  it('uses custom thresholds when provided', () => {
    const { container, rerender } = render(
      <ProgressBar value={70} warningThreshold={60} dangerThreshold={80} />,
    );
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-warning');
    rerender(
      <ProgressBar value={80} warningThreshold={60} dangerThreshold={80} />,
    );
    expect(fill).toHaveClass('bg-danger');
  });

  it('lets an explicit tone win over the thresholds', () => {
    const { container } = render(<ProgressBar value={10} tone="danger" />);
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-danger');
  });

  it('clamps the value to the 0–100 range', () => {
    const { container, rerender } = render(<ProgressBar value={-10} />);
    let fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveStyle({ width: '0%' });
    rerender(<ProgressBar value={150} />);
    fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('exposes progress semantics for screen readers', () => {
    render(<ProgressBar value={75.6} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '75.6');
  });

  it('merges a custom className with the base styles', () => {
    const { container } = render(<ProgressBar value={50} className="mt-2" />);
    expect(container.firstChild).toHaveClass('h-1', 'mt-2');
  });

  it('forwards extra DOM props', () => {
    render(<ProgressBar value={50} data-rig-id="1" aria-label="temperature" />);
    expect(screen.getByLabelText('temperature')).toHaveAttribute(
      'data-rig-id',
      '1',
    );
  });
});
