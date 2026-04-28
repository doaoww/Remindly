import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Remindly — Smart Study Platform',
  description: 'Turn your notes into flashcards. Study smarter with spaced repetition.',
  icons: {
    icon: '/favicon.ico'
  },
  openGraph: {
    title: 'Remindly — Smart Study Platform',
    description: 'Turn your notes into flashcards. Study smarter with spaced repetition.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}