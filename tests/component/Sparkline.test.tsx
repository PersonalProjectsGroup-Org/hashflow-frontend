import { afterAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Sparkline,
  type SparklinePoint,
} from '../../src/components/ui/Sparkline';

// recharts logs a sizing warning on the first render, before its ResizeObserver
// reports the container size (which our setup.ts stub does synchronously).
vi.spyOn(console, 'warn').mockImplementation(() => {});
afterAll(() => vi.restoreAllMocks());

const points: SparklinePoint[] = [
  { timestamp: '2026-08-11T10:00:00.000Z', price: 100 },
  { timestamp: '2026-08-11T10:00:30.000Z', price: 102 },
  { timestamp: '2026-08-11T10:01:00.000Z', price: 101 },
];

describe('Sparkline', () => {
  it('renders a mini recharts line chart with the given data', () => {
    const { container } = render(<Sparkline data={points} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('renders without crashing for a single point', () => {
    const { container } = render(<Sparkline data={[points[0]]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders without crashing for empty data', () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('mounts and unmounts repeatedly without leaking chart nodes (SC-008)', () => {
    for (let i = 0; i < 25; i++) {
      const { unmount } = render(<Sparkline data={points} />);
      unmount();
    }
    // RTL keeps its own container divs until afterEach cleanup, so assert on
    // recharts' nodes specifically: none may survive an unmount.
    expect(
      document.querySelectorAll('.recharts-responsive-container'),
    ).toHaveLength(0);
    expect(document.querySelectorAll('svg')).toHaveLength(0);
  });

  it('exposes an image role with a default label, overridable by the caller', () => {
    const { rerender } = render(<Sparkline data={points} />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'price history',
    );
    rerender(<Sparkline data={points} aria-label="BTC price" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'BTC price');
  });

  it('merges a custom className and forwards extra DOM props', () => {
    const { container } = render(
      <Sparkline data={points} className="h-16" data-coin="BTC" />,
    );
    expect(container.firstChild).toHaveClass('h-10', 'w-full', 'h-16');
    expect(container.firstChild).toHaveAttribute('data-coin', 'BTC');
  });
});
