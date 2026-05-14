import { ModuleStub } from '@/components/shared/module-stub';

export const metadata = { title: 'Ohana · Calendario' };

export default function CalendarioPage() {
  return (
    <ModuleStub
      title="Calendario"
      titleAccent="mes + 14 días"
      subtitle="Grid mensual con dots por módulo. Side-panel con próximos 14 días, default cronológico, checkbox 'Agrupar por categoría' para vista por tipo."
      prdRef="§6.13 (v1.0) + §7 (v1.1)"
    />
  );
}
