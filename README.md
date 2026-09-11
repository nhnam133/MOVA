# HAUVIE — Website thương mại điện tử thời trang thể thao

HAUVIE được xây mới hoàn toàn. TechVie chỉ được dùng để tham khảo luồng trải nghiệm; dữ liệu, kiến trúc và giao diện của HAUVIE được thiết kế riêng để hỗ trợ biến thể màu–size, tích điểm, voucher và đổi size.

## Chức năng đã có

- Trang chủ responsive theo nhận diện trắng–đen–xanh lime, tham khảo cấu trúc bán lẻ của ND Style nhưng dùng thiết kế HAUVIE riêng.
- Tìm kiếm và kết hợp bộ lọc danh mục, đối tượng, khoảng giá, màu, size; sắp xếp mới nhất/giá tăng/giá giảm.
- Danh sách và chi tiết sản phẩm; bộ ảnh, chọn màu–size–số lượng, bảng size mẫu và chính sách liên quan.
- Giỏ khách lưu trên thiết bị; khi đăng nhập được đồng bộ theo tài khoản và gộp an toàn với giỏ trước đăng nhập.
- Đăng nhập trước khi đặt hàng.
- Thanh toán COD và khung tích hợp MoMo UAT có ký HMAC-SHA256.
- Cơ sở dữ liệu đơn hàng, giữ tồn kho, điểm, voucher cá nhân và yêu cầu đổi hàng có ảnh minh chứng riêng tư.
- Trang tài khoản, chi tiết đơn, tự hủy COD chờ xác nhận, xác nhận nhận hàng, đổi 100 điểm lấy voucher 20.000đ.
- Liên hệ lưu dữ liệu, bản đồ UTH minh họa, đánh giá sau mua, chính sách vận chuyển/đổi hàng/bảo mật.
- Trang quản trị có dashboard doanh thu, đơn hàng, sản phẩm/ảnh/biến thể, danh mục, kho và lịch sử kho, voucher, khách hàng, đổi hàng, liên hệ và đánh giá.
- Khách có thể sửa hồ sơ, đổi mật khẩu; quản trị viên có thể cấp quyền quản trị cho tài khoản cộng tác.

## Công nghệ

- React 19, TypeScript, Vinext và Tailwind CSS.
- Cloudflare D1 cho dữ liệu; R2 cho ảnh tải từ trang quản trị.
- Drizzle ORM và migration SQL.
- Supabase Auth cho đăng ký/đăng nhập email; phân quyền quản trị được kiểm tra ở máy chủ.

## Chạy trên máy

Yêu cầu Node.js từ 22.13 và pnpm. Tại thư mục dự án:

```bash
pnpm install
pnpm dev
```

Mở địa chỉ cục bộ do lệnh phát triển hiển thị. Cần cấu hình Supabase và UID quản trị trong `.dev.vars` để dùng đăng nhập/quản trị trên máy.

Các lệnh kiểm tra:

```bash
pnpm lint
pnpm test
pnpm build
```

## Cấu hình MoMo UAT và quản trị

Sao chép `.dev.vars.example` thành `.dev.vars`, sau đó điền các giá trị do MoMo UAT cấp. Không đưa khóa thật vào Git.

- `MOMO_PARTNER_CODE`
- `MOMO_ACCESS_KEY`
- `MOMO_SECRET_KEY`
- `SITE_URL`: địa chỉ website công khai khi triển khai.
- `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY`: cấu hình Supabase Auth.
- `MOVA_ADMIN_AUTH_ID`: UID Supabase của quản trị viên khởi tạo. Quản trị viên này có thể cấp quyền cho tài khoản khác tại `/quan-tri/khach-hang`.
- `MOVA_ADMIN_EMAIL`: email khớp tài khoản quản trị khởi tạo khi cần chuyển dữ liệu tài khoản cũ.

MoMo có thể để trống trong giai đoạn phát triển. Khi chưa có đủ ba khóa UAT, website vẫn đặt hàng COD bình thường và không coi MoMo là đã sẵn sàng.

## Quy tắc nghiệp vụ quan trọng

- Phí giao hàng 30.000đ; miễn phí khi giá trị sản phẩm sau giảm giá đạt 499.000đ.
- 10.000đ giá trị sản phẩm = 1 điểm, làm tròn xuống; chỉ cộng khi đơn hoàn tất và đã thanh toán.
- 100 điểm đổi voucher 20.000đ, áp dụng đơn từ 200.000đ, hạn 30 ngày.
- Đổi size trong 72 giờ từ thời điểm nhận hàng; lỗi HAUVIE thì HAUVIE chịu phí, lỗi chọn size của khách thì khách chịu phí.

## Cấu trúc chính

- `app/`: các trang và API.
- `components/store/`: giao diện mua sắm và giỏ hàng.
- `components/admin/`: biểu mẫu quản trị.
- `db/schema.ts`: mô hình dữ liệu.
- `drizzle/`: migration và dữ liệu demo.
- `lib/catalog-server.ts`: đọc sản phẩm từ D1, có dữ liệu dự phòng khi phát triển.
- `lib/momo.ts`: tạo giao dịch và xác minh IPN MoMo UAT.
