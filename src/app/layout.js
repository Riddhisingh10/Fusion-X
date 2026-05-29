import { Inter } from 'next/font/google';
import { Providers } from './Providers';
import '../index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Connect & Prep',
  description: 'AI-Powered Professional Education Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
