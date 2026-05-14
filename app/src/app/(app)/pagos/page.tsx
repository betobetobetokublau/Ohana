import { ModuleStub } from '@/components/shared/module-stub';

export const metadata = { title: 'Ohana · Pagos' };

export default function PagosPage() {
  return (
    <ModuleStub
      title="Pagos"
      titleAccent="recurrentes mensuales"
      subtitle="Pagos con monto, categoría, pagador asignado, recurrencia JSONB. Trigger Supabase regenera siguiente ocurrencia al marcar como pagado. Recordatorio 7 días antes."
      prdRef="§6.3 + v1.1 rename"
    />
  );
}
