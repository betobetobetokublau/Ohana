interface ModuleStubProps {
  title: string;
  titleAccent?: string;
  subtitle: string;
  prdRef?: string;
}

export function ModuleStub({ title, titleAccent, subtitle, prdRef }: ModuleStubProps) {
  return (
    <div className="px-5 py-12 md:px-10 max-w-3xl mx-auto">
      <div className="eyebrow text-accent mb-2">{title}</div>
      <h1 className="display text-3xl md:text-4xl">
        {titleAccent ? (
          <>
            {title} · <em>{titleAccent}</em>
          </>
        ) : (
          title
        )}
      </h1>
      <p className="italic-serif text-[15px] mt-3 max-w-xl">
        {subtitle}
      </p>
      <div className="card-warm mt-8 max-w-xl">
        <div className="eyebrow text-accent-deep">Pendiente de implementar</div>
        <p className="text-[14px] mt-1 text-ink">
          Esta superficie está documentada{' '}
          {prdRef && (
            <>
              en <span className="font-mono">PRD.md {prdRef}</span>{' '}
            </>
          )}
          y mockeada en <span className="font-mono">mockup.html</span>. La
          interfaz funcional llega en la siguiente fase del scaffold.
        </p>
      </div>
    </div>
  );
}
