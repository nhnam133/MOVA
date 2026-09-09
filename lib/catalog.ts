export type ProductVariant = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
};

export type Product = {
  id?: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number | null;
  gender: 'female' | 'male' | 'unisex';
  image: string;
  gallery: string[];
  badge: string | null;
  description: string;
  material: string;
  variants: ProductVariant[];
};

const standardSizes = (code: string, color: string): ProductVariant[] =>
  (['S', 'M', 'L', 'XL'] as const).map((size, index) => ({
    sku: `${code}-${color.toUpperCase().replaceAll(' ', '-')}-${size}`,
    size,
    color,
    stock: 8 + index * 3,
  }));

export const products: Product[] = [
  {
    code: 'ATG01',
    slug: 'ao-thun-move-free',
    name: 'Áo thun Move Free',
    category: 'Áo thun thể thao',
    categorySlug: 'ao-thun-the-thao',
    price: 329_000,
    gender: 'female',
    image: '/products/atg01-1.avif',
    gallery: ['/products/atg01-1.avif'],
    badge: 'Mới',
    description: 'Phom áo linh hoạt, dễ phối cho buổi tập và sinh hoạt hằng ngày.',
    material: 'Polyester co giãn, thoáng khí',
    variants: standardSizes('ATG01', 'Đen'),
  },
  {
    code: 'ATG02',
    slug: 'ao-thun-active-line',
    name: 'Áo thun Active Line',
    category: 'Áo chạy bộ',
    categorySlug: 'ao-chay-bo',
    price: 359_000,
    gender: 'female',
    image: '/products/atg02-1.avif',
    gallery: ['/products/atg02-1.avif'],
    badge: 'Bán chạy',
    description: 'Áo chạy bộ nhẹ, hỗ trợ thoát ẩm và vận động cường độ cao.',
    material: 'Polyester quick-dry',
    variants: standardSizes('ATG02', 'Trắng'),
  },
  {
    code: 'QSG01',
    slug: 'quan-short-pace',
    name: 'Quần short Pace',
    category: 'Quần short',
    categorySlug: 'quan-short',
    price: 389_000,
    gender: 'female',
    image: '/products/qsg01-1.avif',
    gallery: ['/products/qsg01-1.avif'],
    badge: null,
    description: 'Quần short thể thao phom gọn, cạp chắc và tự do khi vận động.',
    material: 'Nylon pha spandex',
    variants: standardSizes('QSG01', 'Đen'),
  },
  {
    code: 'ATG03',
    slug: 'ao-thun-motion-air',
    name: 'Áo thun Motion Air',
    category: 'Áo thun thể thao',
    categorySlug: 'ao-thun-the-thao',
    price: 349_000,
    gender: 'female',
    image: '/products/atg03-1.avif',
    gallery: ['/products/atg03-1.avif'],
    badge: 'Mới',
    description: 'Thiết kế tối giản với bề mặt vải mềm và độ co giãn thoải mái.',
    material: 'Polyester pha elastane',
    variants: standardSizes('ATG03', 'Xám'),
  },
  {
    code: 'QSG02',
    slug: 'quan-short-sprint',
    name: 'Quần short Sprint',
    category: 'Quần short',
    categorySlug: 'quan-short',
    price: 419_000,
    gender: 'female',
    image: '/products/qsg02-1.avif',
    gallery: ['/products/qsg02-1.avif'],
    badge: 'Bán chạy',
    description: 'Quần short đa dụng dành cho chạy bộ, gym và luyện tập hằng ngày.',
    material: 'Nylon siêu nhẹ',
    variants: standardSizes('QSG02', 'Đen'),
  },
];

export const categories = [
  { order: '01', name: 'Áo thun thể thao', slug: 'ao-thun-the-thao' },
  { order: '02', name: 'Áo chạy bộ', slug: 'ao-chay-bo' },
  { order: '03', name: 'Quần short', slug: 'quan-short' },
  { order: '04', name: 'Quần jogger', slug: 'quan-jogger' },
  { order: '05', name: 'Set thể thao', slug: 'set-the-thao' },
];

export function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}
