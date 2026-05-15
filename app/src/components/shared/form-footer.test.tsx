import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormFooter, FormError } from './form-footer';

// Mock next/navigation porque FormFooter usa useRouter
const backMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: backMock, push: vi.fn(), refresh: vi.fn() }),
}));

describe('<FormFooter />', () => {
  it('renderiza botones Cancelar y Submit', () => {
    render(<FormFooter loading={false} submitLabel="Guardar" />);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('cancel button llama a router.back()', async () => {
    backMock.mockClear();
    render(<FormFooter loading={false} submitLabel="x" />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(backMock).toHaveBeenCalledOnce();
  });

  it('loading=true muestra loadingLabel y deshabilita submit', () => {
    render(<FormFooter loading={true} submitLabel="Guardar" loadingLabel="Guardando…" />);
    const submit = screen.getByRole('button', { name: 'Guardando…' });
    expect(submit).toBeDisabled();
  });

  it('submitDisabled=true · submit deshabilitado', () => {
    render(<FormFooter loading={false} submitDisabled={true} submitLabel="x" />);
    expect(screen.getByRole('button', { name: 'x' })).toBeDisabled();
  });

  it('cancel label customizable', () => {
    render(<FormFooter loading={false} submitLabel="x" cancelLabel="Volver" />);
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });

  it('submit type=submit (form submission)', () => {
    render(<FormFooter loading={false} submitLabel="x" />);
    const submit = screen.getByRole('button', { name: 'x' });
    expect(submit).toHaveAttribute('type', 'submit');
  });

  it('cancel type=button (no triggea form submit)', () => {
    render(<FormFooter loading={false} submitLabel="x" />);
    const cancel = screen.getByRole('button', { name: 'Cancelar' });
    expect(cancel).toHaveAttribute('type', 'button');
  });
});

describe('<FormError />', () => {
  it('null message · no renderiza nada', () => {
    const { container } = render(<FormError message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('con message · renderiza con styling de error', () => {
    render(<FormError message="Algo se rompió" />);
    const error = screen.getByText('Algo se rompió');
    expect(error).toBeInTheDocument();
    expect(error).toHaveClass('text-error');
  });
});
