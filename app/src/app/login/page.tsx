import { LoginForm } from './login-form';

export const metadata = { title: 'Ohana · iniciar sesión' };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; sent?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-bg">
      <div className="w-full max-w-sm">
        <div className="aspect-[1.4] rounded-md bg-gradient-to-br from-accent-soft to-surface-3 flex items-center justify-center mb-6">
          <span className="font-serif italic font-light text-5xl text-accent">Ohana</span>
        </div>

        <h1 className="display text-3xl">
          Un espacio para los <em>dos</em>.
        </h1>
        <p className="italic-serif text-base mt-3 mb-8">
          Te mandamos un magic link al correo. Click y entras — sin contraseñas.
        </p>

        {searchParams.sent ? (
          <div className="card-warm text-center">
            <p className="font-serif italic text-[15px] text-accent-deep">
              Revisa tu correo. El link expira en 1 hora.
            </p>
          </div>
        ) : (
          <LoginForm redirectTo={searchParams.redirectTo} />
        )}
      </div>
    </main>
  );
}
