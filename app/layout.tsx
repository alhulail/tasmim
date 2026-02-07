import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Tasmim | تصميم - AI-Powered Brand Design',
    template: '%s | Tasmim',
  },
  description: 'Create stunning Arabic-English brand identities with AI. Generate logos, wordmarks, and brand assets optimized for MENA markets.',
  keywords: ['logo design', 'brand identity', 'Arabic typography', 'AI design', 'MENA', 'تصميم شعار', 'هوية بصرية'],
  authors: [{ name: 'Tasmim' }],
  creator: 'Tasmim',
  metadataBase: new URL('https://tasmim.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    url: 'https://tasmim.ai',
    siteName: 'Tasmim',
    title: 'Tasmim | تصميم - AI-Powered Brand Design',
    description: 'Create stunning Arabic-English brand identities with AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tasmim - AI Brand Design',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tasmim | تصميم - AI-Powered Brand Design',
    description: 'Create stunning Arabic-English brand identities with AI',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
