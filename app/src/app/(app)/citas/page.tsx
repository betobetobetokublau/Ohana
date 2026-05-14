import { ModuleStub } from '@/components/shared/module-stub';

export const metadata = { title: 'Ohana · Citas' };

export default function CitasPage() {
  return (
    <ModuleStub
      title="Citas"
      titleAccent="sugerencias + voto + biblioteca"
      subtitle="3 propuestas estratificadas (winner / gem / wildcard) generadas por Claude los lunes 7 AM. Votación 2 de 3 con anti-anchoring. Biblioteca de ideas, historial con ratings duales, calificación post-evento."
      prdRef="§6.1 (v1.0)"
    />
  );
}
