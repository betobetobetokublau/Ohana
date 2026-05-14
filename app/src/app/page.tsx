import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware redirige según auth + couple state. Si llega aquí, mandamos a login.
  redirect('/login');
}
