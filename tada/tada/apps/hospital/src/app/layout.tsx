import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TADA Hospital',
  description: 'Emergency room dashboard for incoming TADA patients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
