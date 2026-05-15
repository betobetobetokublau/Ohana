import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChangePasswordForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Cambiar password' };
export const dynamic = 'force-dynamic';

export default async function CambiarPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-bg">
      <div className="w-full max-w-md">
        <PageHeader
          eyebrow="Cambiar password"
          title="Crea tu"
          titleAccent="propia password"
          subtitle="Tu pareja te dio una password temporal. Cámbiala por una tuya antes de continuar."
        />
        <ChangePasswordForm />
      </div>
    </main>
  );
}
