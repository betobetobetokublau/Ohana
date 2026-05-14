import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill, Dot } from './pill';

describe('<Pill />', () => {
  it('renderiza children', () => {
    render(<Pill>Pendiente</Pill>);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('variant default · surface muted', () => {
    render(<Pill>x</Pill>);
    expect(screen.getByText('x')).toHaveClass('bg-surface-2');
  });

  it('variant accent · terracotta soft', () => {
    render(<Pill variant="accent">x</Pill>);
    expect(screen.getByText('x')).toHaveClass('bg-accent-soft');
  });

  it('variant success · verde sage', () => {
    render(<Pill variant="success">x</Pill>);
    // Color literal porque está hardcoded (no token Tailwind)
    expect(screen.getByText('x').className).toContain('D8E5CD');
  });

  it('variant warning', () => {
    render(<Pill variant="warning">x</Pill>);
    expect(screen.getByText('x').className).toContain('F0D9A6');
  });

  it('variant error', () => {
    render(<Pill variant="error">x</Pill>);
    expect(screen.getByText('x').className).toContain('EBC5BF');
  });

  it('respeta className adicional', () => {
    render(<Pill className="custom-class">x</Pill>);
    expect(screen.getByText('x')).toHaveClass('custom-class');
  });
});

describe('<Dot />', () => {
  it('renderiza con color inline', () => {
    // jsdom normaliza hsl/named-color a rgb · usamos rgb directo
    const { container } = render(<Dot color="rgb(255, 0, 0)" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('tiene clases base de tamaño y borde redondeado', () => {
    const { container } = render(<Dot color="red" />);
    expect(container.firstChild).toHaveClass('w-2', 'h-2', 'rounded-full');
  });
});
