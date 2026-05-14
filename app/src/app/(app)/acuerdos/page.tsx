import { ModuleStub } from '@/components/shared/module-stub';

export const metadata = { title: 'Ohana · Acuerdos' };

export default function AcuerdosPage() {
  return (
    <ModuleStub
      title="Acuerdos"
      titleAccent="lista + Pregúntale a Claude"
      subtitle="Acuerdos categorizados, con comentarios threaded. La feature insignia: Pregúntale a Claude con búsqueda semántica y verdict estructurado (no_concern / talk_first / violation / ambiguous)."
      prdRef="§6.10 (v1.0)"
    />
  );
}
