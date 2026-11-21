import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'BN NEWS ગુજરાતી | તમારા વિસ્તારની, તમારા ભાષામાં...',
  description: 'ગુજરાત, ભારત અને વિશ્વના તમામ તાજા અને સત્યપૂર્ણ સમાચાર.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bnnews.in'),
  openGraph: {
    title: 'BN NEWS ગુજરાતી',
    description: 'ગુજરાતના નંબર 1 વિશ્વસનીય ડિજિટલ સમાચાર.',
    type: 'website',
    locale: 'gu_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="gu">
      <body className="min-h-screen flex flex-col antialiased bg-neutral-bg text-neutral-text font-gujarati">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
