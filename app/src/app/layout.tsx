import type { Metadata, Viewport } from 'next';
import { Fraunces, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import { PWARegister } from '@/components/pwa-register';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz'],
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ohana',
  description: 'Una plataforma para parejas — citas, mimos, acuerdos, calendario compartido.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Ohana',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
  },
  other: {
    // Modern equivalent del apple-mobile-web-app-capable que Next.js inyecta vía appleWebApp.
    // Sin este meta, Chrome avisa deprecation en consola.
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1714' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${instrumentSans.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
