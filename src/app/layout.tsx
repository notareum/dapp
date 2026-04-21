import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import ThemeProvider from '@/components/ThemeProvider';
import { Web3Provider } from '@/components/Web3Provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Notareum dApp',
    template: '%s | Notareum',
  },
  description:
    'The Trust Layer for Web3. Register resources, create .nota files, stake NOTA, and govern the protocol.',
  metadataBase: new URL('https://app.notareum.com'),
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'theme-color': '#3A6FE5',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <Web3Provider>{children}</Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
