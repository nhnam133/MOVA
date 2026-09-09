# MOVA — Website thương mại điện tử thời trang thể thao

MOVA được xây mới hoàn toàn. TechVie chỉ được dùng để tham khảo luồng trải nghiệm; dữ liệu, kiến trúc và giao diện của MOVA được thiết kế riêng để hỗ trợ biến thể màu–size, tích điểm, voucher và đổi size.

## Chức năng đã có

- Trang chủ responsive theo nhận diện trắng–đen–xanh lime.
- Danh mục và danh sách sản phẩm; trang chi tiết chọn size/số lượng.
- Giỏ hàng lưu trên trình duyệt, kiểm tra số lượng theo tồn kho.
- Đăng nhập trước khi đặt hàng.
- Thanh toán COD và khung tích hợp MoMo UAT có ký HMAC-SHA256.
- Cơ sở dữ liệu đơn hàng, điểm, voucher và yêu cầu đổi size.
- Trang tài khoản và lịch sử đơn.
- Trang quản trị thêm sản phẩm, biến thể và ảnh vào kho lưu trữ.

## Công nghệ

- React 19, TypeScript, Vinext và Tailwind CSS.
- Cloudflare D1 cho dữ liệu; R2 cho ảnh tải từ trang quản trị.
- Drizzle ORM và migration SQL.
- Đăng nhập an toàn do nền tảng Sites cung cấp.

## Chạy trên máy

Yêu cầu Node.js 24 LTS và pnpm. Tại thư mục dự án:

```bash
pnpm install
pnpm dev
```

Mở `http://localhost:3000`. Tài khoản quản trị cục bộ mặc định là `seedy@sites.test`.

Các lệnh kiểm tra:

```bash
pnpm lint
pnpm build
```

## Cấu hình MoMo UAT và quản trị

Sao chép `.dev.vars.example` thành `.dev.vars`, sau đó điền các giá trị do MoMo UAT cấp. Không đưa khóa thật vào Git.

- `MOMO_PARTNER_CODE`
- `MOMO_ACCESS_KEY`
- `MOMO_SECRET_KEY`
- `SITE_URL`: địa chỉ website công khai khi triển khai.
- `MOVA_ADMIN_EMAIL`: email đăng nhập được phép vào `/quan-tri/san-pham`.

## Quy tắc nghiệp vụ quan trọng

- Phí giao hàng 30.000đ; miễn phí khi giá trị sản phẩm sau giảm giá đạt 499.000đ.
- 10.000đ giá trị sản phẩm = 1 điểm, làm tròn xuống; chỉ cộng khi đơn hoàn tất và đã thanh toán.
- 100 điểm đổi voucher 20.000đ, áp dụng đơn từ 200.000đ, hạn 30 ngày.
- Đổi size trong 72 giờ từ thời điểm nhận hàng; lỗi MOVA thì MOVA chịu phí, lỗi chọn size của khách thì khách chịu phí.

## Cấu trúc chính

- `app/`: các trang và API.
- `components/store/`: giao diện mua sắm và giỏ hàng.
- `components/admin/`: biểu mẫu quản trị.
- `db/schema.ts`: mô hình dữ liệu.
- `drizzle/`: migration và dữ liệu demo.
- `lib/catalog-server.ts`: đọc sản phẩm từ D1, có dữ liệu dự phòng khi phát triển.
- `lib/momo.ts`: tạo giao dịch và xác minh IPN MoMo UAT.
