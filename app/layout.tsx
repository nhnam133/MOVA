import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { CartProvider } from '@/components/store/cart-provider';
import { getCatalogProducts } from '@/lib/catalog-server';
import './globals.css';
import { getMovaUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HAUVIE — Thời trang thể thao, tự tin chuyển động',
  description:
    'Thời trang thể thao HAUVIE — thiết kế linh hoạt cho mọi chuyển động.',
  icons: { icon: '/favicon.svg' },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const catalog = await getCatalogProducts();
  const user = await getMovaUser();
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider
          catalog={catalog}
          signedIn={Boolean(user)}
          accountKey={user?.userId}
        >
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
