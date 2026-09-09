import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { CartProvider } from '@/components/store/cart-provider';
import { getCatalogProducts } from '@/lib/catalog-server';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MOVA — Move your way',
  description: 'Thời trang thể thao MOVA — thiết kế linh hoạt cho mọi chuyển động.',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const catalog = await getCatalogProducts();
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}><CartProvider catalog={catalog}>{children}</CartProvider></body>
    </html>
  );
}
