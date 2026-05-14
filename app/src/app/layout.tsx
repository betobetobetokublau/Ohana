import type { Metadata, Viewport } from 'next';
import { Fraunces, Instrument_Sans, Geist_Mono } from 'next/font/google';
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

const geistMono = Geist_Mono({
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
    apple: '/icons/apple-touch-icon.png',
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
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
      className={`${fraunces.variable} ${instrumentSans.variable} ${geistMono.variable}`}
    >
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
