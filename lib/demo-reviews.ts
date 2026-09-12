export type DemoReview = {
  id: string;
  rating: 4 | 5;
  content: string;
  adminReply: null;
  createdAt: number;
  name: string;
  demo: true;
};

const vietnameseNames = [
  'Nguyễn Minh Anh',
  'Trần Thu Hà',
  'Lê Hoàng Nam',
  'Phạm Ngọc Linh',
  'Võ Quang Huy',
  'Đặng Thảo Vy',
  'Bùi Đức Anh',
  'Huỳnh Gia Hân',
  'Đỗ Tuấn Kiệt',
  'Nguyễn Khánh Linh',
  'Trần Quốc Bảo',
  'Lê Mai Anh',
  'Phan Anh Khoa',
  'Vũ Ngọc Mai',
  'Hồ Thành Đạt',
  'Nguyễn Thùy Dương',
  'Trương Minh Quân',
  'Cao Bảo Ngọc',
  'Đinh Nhật Minh',
  'Lý Thanh Trúc',
] as const;

const reviewTemplates = [
  (name: string) =>
    `Mình thích thiết kế của ${name}; màu sắc hài hòa, phần hoàn thiện gọn và nhìn đúng tinh thần thể thao.`,
  (name: string) =>
    `${name} cho cảm giác sử dụng thoải mái trong sinh hoạt hằng ngày. Mình đặc biệt ấn tượng với độ gọn nhẹ của sản phẩm.`,
  (name: string) =>
    `Sản phẩm ${name} được đóng gói chỉn chu, hình ảnh và kiểu dáng thực tế dễ phối đồ. Trải nghiệm tổng thể tốt.`,
  (name: string) =>
    `Mình chọn ${name} vì phong cách trẻ trung. Sau khi dùng thử, sản phẩm đáp ứng tốt nhu cầu vận động và di chuyển.`,
  (name: string) =>
    `${name} có thiết kế thực tế, dễ sử dụng và phần hoàn thiện ổn. Đây là lựa chọn phù hợp trong tầm giá.`,
] as const;

function stableHash(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic presentation data for the coursework storefront. These entries
 * are always disclosed in the UI and never stored as customer-authored reviews.
 */
export function demoReviewsForProduct(product: {
  key: string;
  name: string;
}): DemoReview[] {
  const hash = stableHash(product.key);
  const count = 3 + (hash % 3);
  const startName = hash % vietnameseNames.length;
  const startDate = Date.UTC(2026, 8, 10);

  return Array.from({ length: count }, (_, index) => ({
    id: `demo-review-${product.key}-${index + 1}`,
    rating: ((hash >>> (index * 3)) & 3) === 0 ? 4 : 5,
    content: reviewTemplates[index](product.name),
    adminReply: null,
    createdAt: startDate - ((hash % 24) + index * 5 + 1) * 24 * 60 * 60 * 1000,
    name: vietnameseNames[(startName + index * 3) % vietnameseNames.length],
    demo: true,
  }));
}
