# Hoàn tất tài khoản và bộ ảnh HAUVIE

## Trạng thái

Mã nguồn đã có form đăng nhập/đăng ký email và mật khẩu, đăng xuất, xác nhận email, kiểm tra phía máy chủ và giới hạn thử đăng nhập. Đã bỏ sử dụng danh tính ChatGPT trong các trang và API của ứng dụng.

Chưa phát hành thay đổi này lên website công khai. Không phát hành trước khi cấu hình Supabase và quyền quản trị, vì thiếu cấu hình sẽ khiến khách không thể đăng nhập/đặt hàng và chủ shop không thể vào quản trị.

## Cấu hình Supabase Auth

1. Tạo/chọn một dự án Supabase do chủ HAUVIE quản lý. Bật Email/password và cho phép đăng ký.
2. Lấy Project URL và publishable key. Đây là thông tin công khai; không dùng `service_role`, secret key hay mật khẩu cơ sở dữ liệu trong ứng dụng.
3. Thiết lập Site URL là `https://hauvie-sport.nam1303.chatgpt.site`. Cho phép Redirect URL `https://hauvie-sport.nam1303.chatgpt.site/auth/confirm`. Khi kiểm tra cục bộ, thêm `http://localhost:3000/auth/confirm`.
4. Khuyến nghị giữ xác nhận email. Cấu hình SMTP riêng trước khi cho người ngoài nhóm dự án đăng ký: SMTP mặc định của Supabase chỉ gửi cho địa chỉ được cho phép và không phù hợp để mở đăng ký công khai. Không tự động tắt xác nhận email để vượt giới hạn gửi thư. Nếu chọn chế độ demo không xác nhận email, cần được chủ dự án đồng ý và ghi rõ giới hạn xác minh danh tính.
5. Tự tạo tài khoản quản trị trong Supabase Authentication và xác nhận quyền sở hữu email. Lấy User UID của tài khoản này làm `MOVA_ADMIN_AUTH_ID`. Không gửi mật khẩu trong hội thoại.
6. Cấu hình runtime cloud qua Sites: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `MOVA_ADMIN_AUTH_ID`, `SITE_URL`. Giữ `MOVA_ADMIN_EMAIL` đã có nếu cần giữ hồ sơ quản trị cũ. Không lưu bí mật trong Git. File local `.dev.vars` được bỏ qua bởi Git.

Không cần chuyển dữ liệu sản phẩm/đơn hàng sang Supabase trong thay đổi này: Supabase xử lý xác thực, D1/R2 hiện tại vẫn giữ dữ liệu cửa hàng và ảnh tải lên.

## Bảo vệ dữ liệu cũ

- Người mới dùng ID Supabase có tiền tố riêng; tuyệt đối không cấp admin chỉ vì email trùng email chủ shop hoặc metadata tự khai.
- Chỉ UID quản trị cấu hình rõ ràng và đúng email chủ shop được dùng lại hồ sơ quản trị ChatGPT cũ. Các tài khoản khách cũ trùng email cần quy trình chuyển đổi được xác minh riêng; không tự nối tài khoản.
- Phiên dùng cookie HttpOnly, Secure trên HTTPS, SameSite=Lax. Máy chủ xác minh người dùng với Supabase. Yêu cầu ghi dữ liệu phải cùng nguồn; MoMo IPN tiếp tục dùng xác minh chữ ký riêng.
- Migration `0005_youthful_landau.sql` chỉ thêm bảng giới hạn thử đăng nhập. Không sửa các migration đã chạy.

## Nhập bộ ảnh

- Nguồn người dùng: `D:\Product`; 37 mã, 76 ảnh AVIF, khoảng 5,64 MB.
- Toàn bộ ảnh đã được sao chép nguyên vẹn vào `public/products/catalog-20260910/`; manifest và SHA-256 tại `lib/product-assets.json`.
- Phân loại theo thư mục; nhóm `Nam/Quần` đã kiểm tra ảnh và là quần short. Không tự gọi các ảnh polo/sơ mi/váy/phụ kiện là áo chạy bộ hoặc set đồ.
- Đã có phần “Bộ ảnh sản phẩm mới” trong quản trị sản phẩm. Quản trị chọn có đưa nhóm mới lên cửa hàng hay chỉ lưu nháp rồi nhập bộ ảnh. Mỗi mã được nhập trong một giao dịch; có thể chạy lại khi mất mạng.
- Mã đã có: bổ sung ảnh, thay đường dẫn ảnh seed tương ứng; không thay giá, trạng thái, biến thể, tồn kho, đơn hàng hay ảnh quản trị tự thêm.
- Mã mới: tạo dữ liệu demo được ghi rõ trong mô tả; chủ shop sửa tên, giá, size, màu và tồn kho. Không khẳng định chất liệu chưa được cung cấp.
- Nếu một lần nhập trước đã để sản phẩm ở bản nháp, lần chạy lại không tự đổi trạng thái. Sửa và bật sản phẩm đó trong trang quản trị khi đã duyệt.
- Dữ liệu catalog không nằm trong migration schema. Cần chạy thao tác nhập trên môi trường cloud sau khi triển khai; chỉ chép ảnh vào mã nguồn chưa làm phát sinh sản phẩm trong D1 cloud.

## Kiểm tra cần hoàn tất trước khi thay bản công khai

- Đăng ký email mới; xác nhận email; email trùng; mật khẩu sai; lỗi mạng; đăng xuất; phiên hết hạn và làm mới; chặn yêu cầu khác nguồn.
- Tài khoản khách không vào được API/trang quản trị; tài khoản chủ shop vẫn giữ đúng hồ sơ/đơn cũ.
- Đăng nhập rồi quay lại thanh toán; giỏ hàng vẫn còn; tạo một đơn COD thử và kiểm tra phân quyền xem đơn.
- Nhập 37 mã/76 ảnh, kiểm tra phân loại đã được duyệt, gallery và bộ lọc trên desktop/mobile.
- Xin xác nhận phát hành công khai trước khi thay bản đang chạy. Không ghi các ca xác thực Supabase là đã đạt khi chưa có cấu hình và chưa kiểm tra thật.

Tham khảo: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Email/password](https://supabase.com/docs/guides/auth/passwords), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
