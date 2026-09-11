export const BRAND_NAME = 'HAUVIE';

const LEGACY_DEMO_DESCRIPTION =
  'Sản phẩm minh họa cho đồ án MOVA. Giá, màu, kích cỡ và tồn kho là dữ liệu demo, có thể cập nhật trong trang quản trị.';

export function brandText(value: string) {
  return value.replace(/\bMOVA\b/gi, BRAND_NAME);
}

const productDetails: Record<
  string,
  { material: string; description: (audience: string, color: string) => string }
> = {
  'ao-polo': {
    material: 'Vải pique polyester co giãn',
    description: (audience, color) =>
      `Áo polo ${audience} màu ${color.toLowerCase()} với cổ bẻ gọn gàng, phù hợp cho buổi tập nhẹ và phong cách năng động hằng ngày.`,
  },
  'ao-so-mi': {
    material: 'Polyester pha spandex',
    description: (audience, color) =>
      `Áo sơ mi ${audience} màu ${color.toLowerCase()} có phom hiện đại, dễ vận động và phù hợp khi cần vẻ ngoài chỉn chu nhưng thoải mái.`,
  },
  'ao-thun-the-thao': {
    material: 'Polyester thể thao thoát ẩm',
    description: (audience, color) =>
      `Áo thun ${audience} màu ${color.toLowerCase()} với phom linh hoạt, bề mặt nhẹ và thoáng cho luyện tập hoặc sinh hoạt hằng ngày.`,
  },
  'quan-short': {
    material: 'Nylon pha spandex',
    description: (audience, color) =>
      `Quần short ${audience} màu ${color.toLowerCase()} có phom gọn, cạp co giãn và khoảng vận động thoải mái cho chạy bộ, gym và tập luyện.`,
  },
  'ao-dai-tay': {
    material: 'Polyester co giãn',
    description: (audience, color) =>
      `Áo thể thao dài tay ${audience} màu ${color.toLowerCase()} ôm vừa vặn, hỗ trợ vận động linh hoạt và dễ phối trong thời tiết mát.`,
  },
  'quan-legging': {
    material: 'Nylon pha spandex co giãn bốn chiều',
    description: (audience, color) =>
      `Quần legging ${audience} màu ${color.toLowerCase()} với cạp cao ôm chắc, hỗ trợ chuyển động tự tin trong yoga, gym và chạy bộ.`,
  },
  'vay-the-thao': {
    material: 'Polyester pha spandex',
    description: (audience, color) =>
      `Váy thể thao ${audience} màu ${color.toLowerCase()} có phom xòe nhẹ, tạo cảm giác thoải mái khi chơi tennis, cầu lông hoặc dạo phố.`,
  },
  tui: {
    material: 'Polyester bền nhẹ',
    description: (_audience, color) =>
      `Túi thể thao màu ${color.toLowerCase()} có ngăn chứa rộng và quai xách linh hoạt, tiện mang theo đồ tập hoặc dùng cho chuyến đi ngắn.`,
  },
  'gang-tay-dai': {
    material: 'Nylon co giãn, thoáng khí',
    description: (_audience, color) =>
      `Ống tay thể thao màu ${color.toLowerCase()} ôm vừa cánh tay, phù hợp khi chạy bộ, đạp xe và vận động ngoài trời.`,
  },
  'khau-trang': {
    material: 'Polyester mềm, thoáng khí',
    description: (_audience, color) =>
      `Khẩu trang thể thao màu ${color.toLowerCase()} có thiết kế ôm gọn khuôn mặt, nhẹ và thuận tiện cho các hoạt động hằng ngày.`,
  },
  tat: {
    material: 'Cotton pha spandex',
    description: (_audience, color) =>
      `Tất thể thao màu ${color.toLowerCase()} có cổ ôm vừa, đệm chân êm và phù hợp cho tập luyện lẫn sử dụng hằng ngày.`,
  },
};

type ProductCopyInput = {
  categorySlug: string;
  gender: string;
  color: string;
  name: string;
};

export function productCopy(input: ProductCopyInput) {
  const audience =
    input.gender === 'male'
      ? 'nam'
      : input.gender === 'female'
        ? 'nữ'
        : 'unisex';
  const details = productDetails[input.categorySlug];
  return {
    material: details?.material ?? 'Chất liệu thể thao co giãn',
    description:
      details?.description(audience, input.color) ??
      `${brandText(input.name)} màu ${input.color.toLowerCase()}, được thiết kế cho nhịp sống năng động và vận động hằng ngày.`,
  };
}

export function storefrontDescription(
  description: string,
  input: ProductCopyInput,
) {
  if (!description.trim() || description.trim() === LEGACY_DEMO_DESCRIPTION)
    return productCopy(input).description;
  return brandText(description);
}

export function storefrontMaterial(material: string, input: ProductCopyInput) {
  if (!material.trim() || material.trim() === 'Chưa cập nhật')
    return productCopy(input).material;
  return brandText(material);
}
