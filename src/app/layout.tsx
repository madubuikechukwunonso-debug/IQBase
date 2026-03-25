import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';   // ← new import

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IQBase - Test Your Cognitive Abilities',
  description: 'Take a scientifically-inspired cognitive assessment test. Discover your strengths in logical reasoning, pattern recognition, and numerical ability.',
  keywords: 'IQ test, cognitive assessment, intelligence test, brain training, aptitude test',
  openGraph: {
    title: 'IQBase - Test Your Cognitive Abilities',
    description: 'Discover your cognitive strengths with our scientifically-inspired assessment.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
