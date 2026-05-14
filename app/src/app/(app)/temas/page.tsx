import { ModuleStub } from '@/components/shared/module-stub';

export const metadata = { title: 'Ohana · Temas' };

export default function TemasPage() {
  return (
    <ModuleStub
      title="Temas a tratar"
      titleAccent="ciclo de vida"
      subtitle="Temas con timeline · abierto → en_discusion → resuelto (vía acuerdo) → archivado. Discusiones y comentarios vinculados. Sugerencias de Claude para temas recurrentes."
      prdRef="§6.12 (v1.0)"
    />
  );
}
