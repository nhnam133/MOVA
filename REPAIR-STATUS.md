# HAUVIE — trạng thái hoàn thiện

## Đã hoàn thành trong mã nguồn

- Website mua sắm responsive với tìm kiếm, lọc, sắp xếp, giỏ hàng, đăng ký/đăng nhập bằng Supabase và thanh toán COD.
- Toàn bộ 37 sản phẩm và 76 ảnh từ `D:\Product` đã có trong dự án; các nhóm có sản phẩm được phép công khai và có thể quản lý trong trang quản trị.
- Tên, mô tả, màu, size, giá, tồn kho, ảnh và trạng thái sản phẩm đều có thể cập nhật. Luồng đồng bộ ảnh giữ nguyên giá và tồn kho đã chỉnh.
- Trang tài khoản, lịch sử đơn, điểm thưởng, voucher và quy trình đổi hàng trong 72 giờ đã được triển khai.
- Trang quản trị có dashboard, đơn hàng, sản phẩm, danh mục, kho, voucher, khách hàng, đổi hàng, liên hệ và đánh giá.
- Bản đồ Google Maps tại UTH cơ sở 1 được ghi rõ là địa điểm minh họa cho đồ án.
- Nhận diện người dùng nhìn thấy đã đổi từ MOVA sang HAUVIE. Các tên biến môi trường `MOVA_ADMIN_*` được giữ lại để không làm hỏng cấu hình cloud hiện có.

## Phần còn chờ cấu hình ngoài mã nguồn

- MoMo UAT chỉ hoạt động sau khi điền đủ `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY` và `MOMO_SECRET_KEY` trong môi trường triển khai. COD vẫn hoạt động khi chưa có các khóa này.
- Nên nghiệm thu giao dịch MoMo UAT bằng tài khoản thử nghiệm sau khi cấu hình và kiểm tra lại trên Safari/iPhone cùng Chrome/Android thực tế.

Không lưu khóa MoMo, mật khẩu hoặc khóa bí mật Supabase trong GitHub.
