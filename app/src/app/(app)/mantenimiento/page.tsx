import { ModuleStub } from '@/components/shared/module-stub';

export const metadata = { title: 'Ohana · Mantenimiento' };

export default function MantenimientoPage() {
  return (
    <ModuleStub
      title="Mantenimiento del depa"
      titleAccent="recurrente + único"
      subtitle="Cada item es un accionable con recurrencia opcional. Vista por estado: vencido / esta semana / próximas / completadas. Trigger regenera recurrencia al completar."
      prdRef="§6.5 (v1.0)"
    />
  );
}
