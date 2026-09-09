INSERT OR IGNORE INTO categories (id, name, slug, is_visible, sort_order, created_at, updated_at) VALUES
('cat-tee', 'Áo thun thể thao', 'ao-thun-the-thao', 1, 1, 1788937200000, 1788937200000),
('cat-run', 'Áo chạy bộ', 'ao-chay-bo', 1, 2, 1788937200000, 1788937200000),
('cat-short', 'Quần short', 'quan-short', 1, 3, 1788937200000, 1788937200000),
('cat-jogger', 'Quần jogger', 'quan-jogger', 0, 4, 1788937200000, 1788937200000),
('cat-set', 'Set thể thao', 'set-the-thao', 0, 5, 1788937200000, 1788937200000);

INSERT OR IGNORE INTO products (id, category_id, code, slug, name, description, material, price, status, featured, created_at, updated_at) VALUES
('prod-atg01', 'cat-tee', 'ATG01', 'ao-thun-move-free', 'Áo thun Move Free', 'Phom áo linh hoạt, dễ phối cho buổi tập và sinh hoạt hằng ngày.', 'Polyester co giãn, thoáng khí', 329000, 'active', 1, 1788937200000, 1788937200000),
('prod-atg02', 'cat-run', 'ATG02', 'ao-thun-active-line', 'Áo thun Active Line', 'Áo chạy bộ nhẹ, hỗ trợ thoát ẩm và vận động cường độ cao.', 'Polyester quick-dry', 359000, 'active', 1, 1788937200000, 1788937200000),
('prod-qsg01', 'cat-short', 'QSG01', 'quan-short-pace', 'Quần short Pace', 'Quần short thể thao phom gọn, cạp chắc và tự do khi vận động.', 'Nylon pha spandex', 389000, 'active', 1, 1788937200000, 1788937200000),
('prod-atg03', 'cat-tee', 'ATG03', 'ao-thun-motion-air', 'Áo thun Motion Air', 'Thiết kế tối giản với bề mặt vải mềm và độ co giãn thoải mái.', 'Polyester pha elastane', 349000, 'active', 1, 1788937200000, 1788937200000),
('prod-qsg02', 'cat-short', 'QSG02', 'quan-short-sprint', 'Quần short Sprint', 'Quần short đa dụng dành cho chạy bộ, gym và luyện tập hằng ngày.', 'Nylon siêu nhẹ', 419000, 'active', 1, 1788937200000, 1788937200000);

INSERT OR IGNORE INTO product_images (id, product_id, object_key, alt_text, sort_order, created_at) VALUES
('img-atg01', 'prod-atg01', '/products/atg01-1.avif', 'Áo thun Move Free', 0, 1788937200000),
('img-atg02', 'prod-atg02', '/products/atg02-1.avif', 'Áo thun Active Line', 0, 1788937200000),
('img-qsg01', 'prod-qsg01', '/products/qsg01-1.avif', 'Quần short Pace', 0, 1788937200000),
('img-atg03', 'prod-atg03', '/products/atg03-1.avif', 'Áo thun Motion Air', 0, 1788937200000),
('img-qsg02', 'prod-qsg02', '/products/qsg02-1.avif', 'Quần short Sprint', 0, 1788937200000);

INSERT OR IGNORE INTO product_variants (id, product_id, sku, color, size, stock, active, created_at, updated_at) VALUES
('var-atg01-s', 'prod-atg01', 'ATG01-ĐEN-S', 'Đen', 'S', 8, 1, 1788937200000, 1788937200000),
('var-atg01-m', 'prod-atg01', 'ATG01-ĐEN-M', 'Đen', 'M', 11, 1, 1788937200000, 1788937200000),
('var-atg01-l', 'prod-atg01', 'ATG01-ĐEN-L', 'Đen', 'L', 14, 1, 1788937200000, 1788937200000),
('var-atg01-xl', 'prod-atg01', 'ATG01-ĐEN-XL', 'Đen', 'XL', 17, 1, 1788937200000, 1788937200000),
('var-atg02-s', 'prod-atg02', 'ATG02-TRẮNG-S', 'Trắng', 'S', 8, 1, 1788937200000, 1788937200000),
('var-atg02-m', 'prod-atg02', 'ATG02-TRẮNG-M', 'Trắng', 'M', 11, 1, 1788937200000, 1788937200000),
('var-atg02-l', 'prod-atg02', 'ATG02-TRẮNG-L', 'Trắng', 'L', 14, 1, 1788937200000, 1788937200000),
('var-atg02-xl', 'prod-atg02', 'ATG02-TRẮNG-XL', 'Trắng', 'XL', 17, 1, 1788937200000, 1788937200000),
('var-qsg01-s', 'prod-qsg01', 'QSG01-ĐEN-S', 'Đen', 'S', 8, 1, 1788937200000, 1788937200000),
('var-qsg01-m', 'prod-qsg01', 'QSG01-ĐEN-M', 'Đen', 'M', 11, 1, 1788937200000, 1788937200000),
('var-qsg01-l', 'prod-qsg01', 'QSG01-ĐEN-L', 'Đen', 'L', 14, 1, 1788937200000, 1788937200000),
('var-qsg01-xl', 'prod-qsg01', 'QSG01-ĐEN-XL', 'Đen', 'XL', 17, 1, 1788937200000, 1788937200000),
('var-atg03-s', 'prod-atg03', 'ATG03-XÁM-S', 'Xám', 'S', 8, 1, 1788937200000, 1788937200000),
('var-atg03-m', 'prod-atg03', 'ATG03-XÁM-M', 'Xám', 'M', 11, 1, 1788937200000, 1788937200000),
('var-atg03-l', 'prod-atg03', 'ATG03-XÁM-L', 'Xám', 'L', 14, 1, 1788937200000, 1788937200000),
('var-atg03-xl', 'prod-atg03', 'ATG03-XÁM-XL', 'Xám', 'XL', 17, 1, 1788937200000, 1788937200000),
('var-qsg02-s', 'prod-qsg02', 'QSG02-ĐEN-S', 'Đen', 'S', 8, 1, 1788937200000, 1788937200000),
('var-qsg02-m', 'prod-qsg02', 'QSG02-ĐEN-M', 'Đen', 'M', 11, 1, 1788937200000, 1788937200000),
('var-qsg02-l', 'prod-qsg02', 'QSG02-ĐEN-L', 'Đen', 'L', 14, 1, 1788937200000, 1788937200000),
('var-qsg02-xl', 'prod-qsg02', 'QSG02-ĐEN-XL', 'Đen', 'XL', 17, 1, 1788937200000, 1788937200000);
