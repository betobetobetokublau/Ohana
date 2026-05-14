import { ModuleStub } from '@/components/shared/module-stub';

export const metadata = { title: 'Ohana · Discusiones' };

export default function DiscusionesPage() {
  return (
    <ModuleStub
      title="Discusiones"
      titleAccent="captura sin culpa"
      subtitle="Registro de discusiones con resumen, contexto causante (no blame), qué aprendimos. Vinculables a temas, ambos pueden editar a lo largo del tiempo."
      prdRef="§6.11 (v1.0)"
    />
  );
}
