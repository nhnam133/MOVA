# MOVA — bản sửa ngày 10/09/2026

## Thay đổi đã triển khai trong mã nguồn

- Liên kết dùng điều hướng gốc của trình duyệt, tránh lỗi Vinext client router được ghi nhận trên bản cloud cũ.
- Thanh đầu trang chia rõ tìm kiếm / tài khoản / giỏ hàng; nút đăng nhập có chữ trên điện thoại. Tiêu đề Việt, ô danh mục cùng tỷ lệ; nhóm chưa có sản phẩm không dùng ảnh sai nhóm.
- Giỏ hàng lọc dữ liệu lưu hỏng, giới hạn theo tồn kho, không làm sập giao diện khi thêm quá số lượng. Biểu mẫu hiển thị lỗi kết nối thay vì chờ vô hạn.
- Danh sách có phân trang, giữ bộ lọc, sắp xếp mới nhất theo ngày tạo. Không đưa sản phẩm mẫu trở lại khi danh mục đã được ẩn/xóa hết.
- Đơn hàng và giữ tồn kho/voucher được ghi trong một giao dịch. Hủy, giao hàng, hoàn tất và cộng/đổi điểm chống xử lý lặp.
- Thời hạn đổi hàng tính từ thời điểm thực nhận do khách/quản trị nhập; kiểm tra lại phía máy chủ. Quản trị có màn tiếp nhận, duyệt, từ chối, giao và hoàn tất yêu cầu đổi, giữ hàng khi duyệt.
- Quản trị sửa sản phẩm, giá, mô tả, trạng thái, từng biến thể, thêm màu/size và bổ sung ảnh. Chặn ghi đè tồn kho khi dữ liệu vừa thay đổi.
- MoMo chưa có khóa cấu hình thì tắt lựa chọn trước khi tạo đơn. Callback kiểm tra chữ ký, đúng đơn/số tiền/request ID; không hạ trạng thái đã thanh toán vì thông báo lỗi đến muộn.

## Phạm vi kiểm tra

- Kiểm tra mã nguồn, TypeScript và bản dựng production.
- Bộ test tự động: biên phí giao hàng, voucher/điểm, 72 giờ; dữ liệu giỏ; lỗi kết nối; giao dịch SQLite rollback; hủy/giao/cộng điểm một lần.
- Công cụ kiểm tra trình duyệt bị từ chối do hạn mức tài khoản; chưa có kết quả nghiệm thu tương tác bản sửa trên desktop/mobile thực tế. Không được ghi các ca này là PASS.

## Chưa đủ điều kiện xác nhận 100% đặc tả

- Chưa có MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY trên cloud. Chưa nghiệm thu giao dịch MoMo UAT và luồng timeout/đối soát/thử thanh toán lại.
- Cần nghiệm thu đăng nhập, đặt đơn COD, các thao tác quản trị và đổi hàng trên bản cloud sau triển khai, đặc biệt Safari/iPhone và Chrome/Android.
- Đăng nhập hiện thông qua ChatGPT/Sites; chưa phải hệ email/mật khẩu riêng của MOVA.
- Các phần nâng cao như dashboard báo cáo, nhật ký điều chỉnh tồn đầy đủ, quản trị khách hàng, phản hồi đánh giá/ghi chú liên hệ và sắp xếp/xóa ảnh cần đối chiếu tiếp từng tiêu chí trong đặc tả. Không coi một bản dựng thành công là hoàn thành toàn bộ đồ án.

Không đặt khóa MoMo trong mã nguồn hoặc gửi công khai trong hội thoại. Dùng cấu hình bí mật của môi trường triển khai.
