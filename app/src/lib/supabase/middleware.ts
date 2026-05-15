import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/auth/confirm', '/auth/cambiar-password', '/manifest.webmanifest', '/sw.js'];
const STATIC_PATHS = ['/_next', '/icons', '/favicon'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'));
  const isStatic = STATIC_PATHS.some(p => path.startsWith(p));

  if (isStatic) return response;

  // No auth → mandar a login (excepto en rutas públicas)
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  // Auth but on login page → mandar a home
  if (user && (path === '/login' || path === '/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/hoy';
    return NextResponse.redirect(url);
  }

  // Auth · enforce must_change_password antes que cualquier otra cosa
  // Si el usuario fue invitado con password temporal, no puede usar la app
  // hasta cambiarla. Excepción: ya está en /auth/cambiar-password o salir (sign-out).
  if (user && path !== '/auth/cambiar-password' && !path.startsWith('/auth/signout')) {
    const { data: profile } = await supabase
      .from('users')
      .select('must_change_password')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.must_change_password) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/cambiar-password';
      return NextResponse.redirect(url);
    }
  }

  // Auth pero sin couple → forzar onboarding
  if (user && !isPublic && !path.startsWith('/onboarding')) {
    const { data: couple } = await supabase
      .from('couples')
      .select('id, user_b_id')
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .maybeSingle();

    if (!couple) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding/espacio';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
