import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, CheckboxRow } from './checkbox';

describe('<Checkbox />', () => {
  it('renderiza unchecked por default', () => {
    render(<Checkbox aria-label="x" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('toggle al click', async () => {
    render(<Checkbox aria-label="agrupar" />);
    const cb = screen.getByRole('checkbox');
    expect(cb).not.toBeChecked();
    await userEvent.click(cb);
    expect(cb).toBeChecked();
  });

  it('controlled · respeta prop checked', () => {
    const { rerender } = render(<Checkbox checked={false} aria-label="x" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    rerender(<Checkbox checked={true} aria-label="x" />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('disparar onCheckedChange', async () => {
    const onChange = vi.fn();
    render(<Checkbox onCheckedChange={onChange} aria-label="x" />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('<CheckboxRow />', () => {
  it('renderiza label clickeable', async () => {
    const onChange = vi.fn();
    render(<CheckboxRow label="Agrupar por categoría" onCheckedChange={onChange} />);
    expect(screen.getByText('Agrupar por categoría')).toBeInTheDocument();
    // Click en el label dispara el checkbox (asociado vía <label>)
    await userEvent.click(screen.getByText('Agrupar por categoría'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
