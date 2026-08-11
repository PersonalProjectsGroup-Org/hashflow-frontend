import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, type TabItem } from '../../src/components/ui/Tabs';

const items: TabItem[] = [
  { id: 'alerts', label: 'Alertas', count: 15 },
  { id: 'suggestions', label: 'Sugestões', count: 3 },
  { id: 'news', label: 'Notícias', count: 5 },
];

describe('Tabs', () => {
  it('renders every tab label', () => {
    render(<Tabs items={items} value="alerts" onValueChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Alertas' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sugestões' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Notícias' })).toBeInTheDocument();
  });

  it('renders count badges and omits them when not provided', () => {
    render(<Tabs items={items} value="alerts" onValueChange={vi.fn()} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    render(
      <Tabs
        items={[{ id: 'plain', label: 'Sem contagem' }]}
        value="plain"
        onValueChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('tab', { name: 'Sem contagem' }).querySelector('span'),
    ).toBeNull();
  });

  it('calls onValueChange with the tab id on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs items={items} value="alerts" onValueChange={onChange} />);
    await user.click(screen.getByRole('tab', { name: 'Sugestões' }));
    expect(onChange).toHaveBeenCalledWith('suggestions');
  });

  it('switches the active tab when the consumer updates the value (controlled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Tabs items={items} value="alerts" onValueChange={onChange} />,
    );
    expect(screen.getByRole('tab', { name: 'Alertas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('tab', { name: 'Notícias' }));
    expect(onChange).toHaveBeenCalledWith('news');
    rerender(<Tabs items={items} value="news" onValueChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'Notícias' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Alertas' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('wires the WAI-ARIA tab contract', () => {
    render(<Tabs items={items} value="alerts" onValueChange={vi.fn()} />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'panel sections');
    const alerts = screen.getByRole('tab', { name: 'Alertas' });
    expect(alerts).toHaveAttribute('aria-selected', 'true');
    expect(alerts).toHaveAttribute('aria-controls', 'panel-alerts');
    expect(screen.getByRole('tab', { name: 'Sugestões' })).toHaveAttribute(
      'aria-controls',
      'panel-suggestions',
    );
  });

  it('keeps only the selected tab in the tab order (roving tabindex)', () => {
    render(<Tabs items={items} value="alerts" onValueChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Alertas' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('tab', { name: 'Sugestões' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(screen.getByRole('tab', { name: 'Notícias' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('moves selection and focus with arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Tabs items={items} value="alerts" onValueChange={onChange} />,
    );
    // The consumer applies the new value after each key, like real state.
    const select = (id: string) =>
      rerender(<Tabs items={items} value={id} onValueChange={onChange} />);
    screen.getByRole('tab', { name: 'Alertas' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('suggestions');
    expect(screen.getByRole('tab', { name: 'Sugestões' })).toHaveFocus();
    select('suggestions');

    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('news');
    expect(screen.getByRole('tab', { name: 'Notícias' })).toHaveFocus();
    select('news');

    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('alerts');
    expect(screen.getByRole('tab', { name: 'Alertas' })).toHaveFocus();
    select('alerts');

    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('news');
    expect(screen.getByRole('tab', { name: 'Notícias' })).toHaveFocus();
    select('news');

    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('alerts');
    expect(screen.getByRole('tab', { name: 'Alertas' })).toHaveFocus();
    select('alerts');

    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('news');
    expect(screen.getByRole('tab', { name: 'Notícias' })).toHaveFocus();
  });

  it('styles the selected tab with the accent underline', () => {
    render(<Tabs items={items} value="alerts" onValueChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Alertas' })).toHaveClass(
      'border-info',
      'text-foreground',
    );
    expect(screen.getByRole('tab', { name: 'Sugestões' })).toHaveClass(
      'text-muted',
    );
  });

  it('merges className and forwards extra DOM props', () => {
    const { container } = render(
      <Tabs
        items={items}
        value="alerts"
        onValueChange={vi.fn()}
        className="mt-2"
        data-testid="tabs"
      />,
    );
    expect(container.firstChild).toHaveClass('border-b', 'mt-2');
    expect(container.firstChild).toHaveAttribute('data-testid', 'tabs');
  });
});
