import { memo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { ComponentProps } from 'react';

export interface SparklinePoint {
  /** ISO-8601 timestamp, e.g. "2026-08-11T10:00:00.000Z" (domain PricePoint). */
  timestamp: string;
  /** USD price (domain PricePoint). */
  price: number;
}

const baseClass = 'h-10 w-full';

/**
 * Sparkline — memoized mini recharts line chart (T011).
 *
 * Used by the market panel for per-coin price history (FR-008, 30s updates).
 * Performance-critical (SC-002/SC-008):
 *  - `isAnimationActive={false}` — recharts animates every data change by
 *    default; the 30s tick would trigger layout/reflow churn, so animation
 *    is off and hover dots are disabled (`activeDot={false}`).
 *  - Pure render from props: no timers, listeners, or effects of its own;
 *    recharts owns the ResizeObserver lifecycle (disconnect on unmount).
 *  - `memo()` bails out of re-renders when the data reference is stable
 *    (e.g. the parent re-renders for an unrelated reason between ticks).
 *
 * The line stroke references the `--palette-info` token, so it re-themes
 * globally with the T056 palette swap (calm → alert) like every other token.
 */
function SparklineImpl({
  data,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & { data: SparklinePoint[] }) {
  return (
    <div
      role="img"
      aria-label="price history"
      className={`${baseClass}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <XAxis dataKey="timestamp" hide />
          <YAxis
            domain={['dataMin', 'dataMax']}
            padding={{ top: 4, bottom: 4 }}
            hide
          />
          <Line
            type="monotone"
            dataKey="price"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            stroke="var(--palette-info)"
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const Sparkline = memo(SparklineImpl);
