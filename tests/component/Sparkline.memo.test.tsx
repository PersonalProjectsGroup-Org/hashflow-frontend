import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  Sparkline,
  type SparklinePoint,
} from '../../src/components/ui/Sparkline';

const chart = vi.hoisted(() => ({
  calls: new Array<unknown>(),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => children,
  LineChart: ({ children, data }: { children?: ReactNode; data?: unknown }) => {
    chart.calls.push(data);
    return children;
  },
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

const stableData: SparklinePoint[] = [
  { timestamp: '2026-08-11T10:00:00.000Z', price: 100 },
  { timestamp: '2026-08-11T10:00:30.000Z', price: 102 },
  { timestamp: '2026-08-11T10:01:00.000Z', price: 101 },
];

describe('Sparkline memoization', () => {
  beforeEach(() => {
    chart.calls.length = 0;
  });

  it('bails out of re-renders when the props are reference-stable', () => {
    const { rerender } = render(<Sparkline data={stableData} />);
    expect(chart.calls).toHaveLength(1);
    rerender(<Sparkline data={stableData} />);
    expect(chart.calls).toHaveLength(1);
  });

  it('re-renders when the data reference changes (30s tick)', () => {
    const { rerender } = render(<Sparkline data={stableData} />);
    rerender(<Sparkline data={[...stableData]} />);
    expect(chart.calls).toHaveLength(2);
  });

  it('forwards the data array to the chart untouched', () => {
    render(<Sparkline data={stableData} />);
    expect(chart.calls[0]).toBe(stableData);
  });
});
