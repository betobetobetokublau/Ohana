import Link from 'next/link';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-bg">
      <div className="max-w-md text-center">
        <div className="eyebrow text-accent mb-2">404</div>
        <h1 className="display text-4xl">
          Esa página no <em>existe</em>.
        </h1>
        <p className="italic-serif text-[15px] mt-3 mb-7">
          Probablemente el link viejo o un typo. Te llevamos a Hoy.
        </p>
        <Link href="/hoy">
          <Button variant="accent">Ir a Hoy</Button>
        </Link>
      </div>
    </div>
  );
}
