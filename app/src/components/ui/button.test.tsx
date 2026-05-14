import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('<Button />', () => {
  it('renderiza children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('default variant es primary (fondo ink)', () => {
    render(<Button>x</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-ink');
  });

  it('variant accent · fondo terracotta', () => {
    render(<Button variant="accent">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });

  it('variant ghost · transparente', () => {
    render(<Button variant="ghost">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('size sm · padding y font reducidos', () => {
    render(<Button size="sm">x</Button>);
    expect(screen.getByRole('button').className).toMatch(/text-\[11px\]/);
  });

  it('dispara onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disabled · no dispara click + tiene clase de disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>x</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild · renderiza como Slot wrapping al child', () => {
    render(
      <Button asChild>
        <a href="/somewhere">Link</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/somewhere');
    // El styling del button se aplica al <a>
    expect(link.className).toMatch(/bg-ink/);
  });

  it('className custom · merge correcto con tailwind-merge', () => {
    render(<Button className="bg-blue-500">x</Button>);
    // className custom debe sobreescribir el bg default vía tailwind-merge
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-blue-500');
    expect(btn).not.toHaveClass('bg-ink');
  });
});
