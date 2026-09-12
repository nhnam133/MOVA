# Bộ test case website thương mại điện tử HAUVIE

Ngày lập: 12/09/2026  
Phạm vi: website công khai, tài khoản khách hàng, giỏ hàng, thanh toán, đổi hàng, tích điểm, voucher và trang quản trị.  
Mức ưu tiên: **P0** = chặn luồng chính; **P1** = chức năng quan trọng; **P2** = hoàn thiện/chất lượng.

## 1. Khởi động, điều hướng và nội dung chung

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| GEN-01 | P0 | Mở trang chủ bằng HTTPS | Trang tải thành công, không cảnh báo chứng chỉ |
| GEN-02 | P1 | Mở logo HAUVIE | Quay về trang chủ |
| GEN-03 | P1 | Mở từng mục điều hướng chính | Đúng URL và đúng nội dung |
| GEN-04 | P1 | Mở đường dẫn sâu trực tiếp | Trang hoạt động không cần đi từ trang chủ |
| GEN-05 | P1 | Tải lại từng trang chính | Không mất trạng thái đăng nhập bất thường |
| GEN-06 | P1 | Dùng nút Back/Forward trình duyệt | Lịch sử và trạng thái trang hợp lý |
| GEN-07 | P1 | Mở URL không tồn tại | Hiện trang 404 có đường quay lại |
| GEN-08 | P1 | Mở URL chính sách sai slug | Hiện 404, không lỗi máy chủ |
| GEN-09 | P1 | Kiểm tra tên thương hiệu toàn site | Chỉ hiển thị HAUVIE, không còn MOVA |
| GEN-10 | P1 | Kiểm tra favicon và tiêu đề tab | Đúng nhận diện HAUVIE |
| GEN-11 | P2 | Kiểm tra tiêu đề từng trang | Phản ánh đúng trang hiện tại |
| GEN-12 | P1 | Kiểm tra footer trên mọi trang | Link chính sách/liên hệ hoạt động |
| GEN-13 | P1 | Mở hướng dẫn chọn size | Bảng rõ ràng, cuộn được trên mobile |
| GEN-14 | P1 | Mở chính sách vận chuyển | Hiện đúng phí 30.000đ và mốc 499.000đ |
| GEN-15 | P1 | Mở chính sách đổi hàng | Hiện đúng thời hạn 72 giờ từ lúc nhận |
| GEN-16 | P1 | Mở chính sách bảo hành | Điều kiện và loại trừ rõ ràng |
| GEN-17 | P1 | Mở chính sách bảo mật | Nêu đúng phạm vi dữ liệu và MoMo UAT |
| GEN-18 | P1 | Mở điều khoản sử dụng | Nội dung phù hợp website đồ án |

## 2. Đăng ký, đăng nhập và tài khoản

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| AUTH-01 | P0 | Đăng ký email hợp lệ | Tạo tài khoản hoặc yêu cầu xác nhận email |
| AUTH-02 | P1 | Đăng ký email viết hoa | Chuẩn hóa email, không tạo bản trùng |
| AUTH-03 | P1 | Đăng ký email sai định dạng | Báo lỗi tại trường email |
| AUTH-04 | P1 | Đăng ký email đã tồn tại | Thông báo an toàn, không lộ dữ liệu nhạy cảm |
| AUTH-05 | P1 | Bỏ trống họ tên | Không cho gửi, báo lỗi rõ |
| AUTH-06 | P1 | Họ tên chỉ một ký tự | Từ chối theo giới hạn tối thiểu |
| AUTH-07 | P1 | Họ tên tiếng Việt có dấu | Chấp nhận và lưu đúng Unicode |
| AUTH-08 | P1 | Mật khẩu dưới 8 ký tự | Từ chối |
| AUTH-09 | P1 | Mật khẩu trên 72 ký tự | Từ chối |
| AUTH-10 | P1 | Xác nhận mật khẩu khác nhau | Từ chối, chỉ rõ nguyên nhân |
| AUTH-11 | P1 | Dán mật khẩu từ password manager | Hoạt động bình thường |
| AUTH-12 | P2 | Bật/tắt hiện mật khẩu | Nội dung đổi đúng, nhãn truy cập thay đổi |
| AUTH-13 | P0 | Đăng nhập đúng | Vào trang tài khoản |
| AUTH-14 | P0 | Đăng nhập sai mật khẩu | Không đăng nhập, báo lỗi an toàn |
| AUTH-15 | P1 | Đăng nhập email chưa xác nhận | Hướng dẫn xác nhận email |
| AUTH-16 | P1 | Gửi form nhiều lần nhanh | Không tạo yêu cầu trùng, nút có trạng thái chờ |
| AUTH-17 | P1 | Chuyển tab Đăng nhập/Đăng ký | Không lẫn dữ liệu hoặc lỗi |
| AUTH-18 | P1 | Truy cập thanh toán khi chưa đăng nhập | Chuyển đến đăng nhập và giữ đường quay lại |
| AUTH-19 | P1 | Redirect đăng nhập tới URL ngoài site | Bị chặn |
| AUTH-20 | P1 | Redirect tới route quản trị trái phép | Bị chặn |
| AUTH-21 | P1 | Đăng xuất | Xóa phiên, route riêng tư không còn truy cập |
| AUTH-22 | P1 | Mở tài khoản sau khi đăng xuất | Hiện form đăng nhập/đăng ký |
| AUTH-23 | P1 | Sửa họ tên hợp lệ | Lưu và hiển thị lại đúng |
| AUTH-24 | P1 | Sửa số điện thoại hợp lệ | Lưu đúng |
| AUTH-25 | P1 | Nhập số điện thoại sai | Báo lỗi, không lưu |
| AUTH-26 | P1 | Đổi mật khẩu đúng | Phiên và đăng nhập lại hoạt động đúng |
| AUTH-27 | P1 | Đổi mật khẩu xác nhận sai | Không đổi |
| AUTH-28 | P1 | Khách thường mở `/quan-tri` | Bị từ chối hoặc chuyển hướng |
| AUTH-29 | P0 | Admin mở `/quan-tri` | Vào được dashboard |
| AUTH-30 | P1 | Phiên hết hạn khi gửi form | Báo đăng nhập lại, không văng lỗi HTML/JSON |

## 3. Danh mục, tìm kiếm, lọc và sắp xếp

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| CAT-01 | P0 | Mở `/san-pham` | Danh sách sản phẩm công khai tải được |
| CAT-02 | P1 | Đếm sản phẩm công khai | Khớp dữ liệu quản trị |
| CAT-03 | P1 | Kiểm tra danh mục không có sản phẩm | Không hiện trên menu khách hàng |
| CAT-04 | P1 | Kiểm tra nhóm mới có sản phẩm | Tự xuất hiện đúng tên |
| CAT-05 | P1 | Tìm đúng toàn bộ tên sản phẩm | Trả về sản phẩm tương ứng |
| CAT-06 | P1 | Tìm một phần tên | Trả về các kết quả liên quan |
| CAT-07 | P1 | Tìm không phân biệt hoa/thường | Kết quả như nhau |
| CAT-08 | P1 | Tìm tiếng Việt có dấu | Kết quả đúng |
| CAT-09 | P1 | Tìm chuỗi không tồn tại | Hiện empty state và nút xóa lọc |
| CAT-10 | P1 | Tìm chuỗi rất dài | Không vỡ giao diện hoặc lỗi máy chủ |
| CAT-11 | P1 | Tìm ký tự đặc biệt | Được xử lý an toàn |
| CAT-12 | P1 | Lọc từng danh mục | Chỉ hiện đúng danh mục |
| CAT-13 | P1 | Lọc giới tính nam | Chỉ hiện sản phẩm nam/phù hợp |
| CAT-14 | P1 | Lọc giới tính nữ | Chỉ hiện sản phẩm nữ/phù hợp |
| CAT-15 | P1 | Lọc unisex | Chỉ hiện sản phẩm unisex/phù hợp |
| CAT-16 | P1 | Lọc từng màu | Màu hiển thị phải khớp ảnh/dữ liệu thật |
| CAT-17 | P1 | Kết hợp danh mục + giới tính | Kết quả là giao hai bộ lọc |
| CAT-18 | P1 | Kết hợp tìm kiếm + bộ lọc | Giữ đúng truy vấn và lọc |
| CAT-19 | P1 | Sắp xếp giá tăng dần | Giá không giảm theo thứ tự |
| CAT-20 | P1 | Sắp xếp giá giảm dần | Giá không tăng theo thứ tự |
| CAT-21 | P1 | Sắp xếp mới nhất | Thứ tự đúng thời gian công khai |
| CAT-22 | P1 | Chuyển trang 1→2→cuối | Không lặp/mất sản phẩm |
| CAT-23 | P1 | Quay lại từ chi tiết | Giữ bộ lọc/trang trước đó |
| CAT-24 | P1 | Xóa tất cả bộ lọc | Về danh sách đầy đủ |
| CAT-25 | P1 | URL có tham số lọc không hợp lệ | Bỏ qua an toàn, không 500 |
| CAT-26 | P2 | Ảnh card cùng tỷ lệ | Lưới đều, không nhảy bố cục |
| CAT-27 | P2 | Ảnh card có alt | Mô tả đúng sản phẩm |
| CAT-28 | P1 | Sản phẩm ẩn/nháp | Không xuất hiện ở storefront |

## 4. Chi tiết sản phẩm

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| PDP-01 | P0 | Mở sản phẩm hợp lệ | Tải đủ tên, ảnh, giá, mô tả |
| PDP-02 | P1 | Mở slug không tồn tại | Hiện 404 |
| PDP-03 | P1 | Chuyển ảnh thư viện | Ảnh chính đổi đúng |
| PDP-04 | P1 | Ảnh lỗi/mất | Có fallback, không phá bố cục |
| PDP-05 | P1 | Chọn từng màu | Trạng thái chọn rõ và khớp ảnh |
| PDP-06 | P1 | Chọn từng size | SKU/tồn kho cập nhật đúng |
| PDP-07 | P1 | Set đồ một size chung | Chỉ chọn một size cho cả bộ |
| PDP-08 | P1 | Biến thể hết tồn | Không thể thêm vào giỏ |
| PDP-09 | P1 | Tăng số lượng đến tồn kho | Không vượt tồn |
| PDP-10 | P1 | Giảm số lượng tại 1 | Không xuống 0 |
| PDP-11 | P0 | Thêm sản phẩm vào giỏ | Đúng SKU, màu, size, số lượng |
| PDP-12 | P1 | Thêm nhanh từ card | Dùng biến thể mặc định hợp lệ |
| PDP-13 | P1 | Giá mới/giá cũ | Giá cũ gạch ngang, giá mới nổi bật |
| PDP-14 | P1 | Sản phẩm không khuyến mại | Không hiện giá cũ giả |
| PDP-15 | P1 | Nội dung mô tả theo loại sản phẩm | Có ý nghĩa, không còn câu demo chung |
| PDP-16 | P1 | Màu trong mô tả | Không lặp từ, khớp màu thật |
| PDP-17 | P1 | Chất liệu | Hiển thị dữ liệu đúng sản phẩm |
| PDP-18 | P1 | Chính sách đổi size | Khớp quy tắc 72 giờ |
| PDP-19 | P2 | Chia sẻ URL sản phẩm | Tiêu đề/metadata đúng sản phẩm |
| PDP-20 | P2 | Bàn phím chọn biến thể | Focus rõ, thao tác được |

## 5. Giỏ hàng

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| CART-01 | P0 | Tài khoản mới mở giỏ | Giỏ trống, không có sẵn sản phẩm |
| CART-02 | P0 | Thêm một SKU | Badge, drawer và trang giỏ cùng số lượng |
| CART-03 | P1 | Thêm lại cùng SKU | Gộp số lượng, không tạo dòng trùng |
| CART-04 | P1 | Thêm cùng sản phẩm khác size | Tạo dòng riêng |
| CART-05 | P1 | Tăng số lượng | Tổng dòng/tạm tính cập nhật đúng |
| CART-06 | P1 | Giảm số lượng | Tổng cập nhật đúng |
| CART-07 | P1 | Tăng vượt tồn | Bị chặn và báo rõ |
| CART-08 | P1 | Nhập số thập phân/âm qua API | Bị từ chối |
| CART-09 | P1 | Xóa một dòng | Dòng biến mất, tổng cập nhật |
| CART-10 | P1 | Xóa dòng cuối | Hiện empty state hữu ích |
| CART-11 | P1 | Tải lại trang | Giỏ giữ đúng dữ liệu tài khoản |
| CART-12 | P1 | Mở ở thiết bị/trình duyệt khác | Đồng bộ sau đăng nhập |
| CART-13 | P1 | Đăng xuất | Không lộ giỏ của tài khoản cũ |
| CART-14 | P1 | Đăng nhập tài khoản khác | Nạp đúng giỏ tài khoản đó |
| CART-15 | P1 | Sản phẩm bị ẩn sau khi đã thêm | Không thể thanh toán SKU không hợp lệ |
| CART-16 | P1 | Tồn kho giảm sau khi đã thêm | Điều chỉnh/chặn theo tồn mới |
| CART-17 | P1 | Mốc 498.999đ | Phí vận chuyển 30.000đ |
| CART-18 | P1 | Mốc đúng 499.000đ | Miễn phí vận chuyển |
| CART-19 | P1 | Voucher làm tổng dưới 499.000đ | Phí vận chuyển được tính lại |
| CART-20 | P2 | Nạp dữ liệu giỏ chậm | Hiện loading/skeleton, không lóe “giỏ trống” |
| CART-21 | P1 | Nhãn nút +/− | Screen reader đọc được “tăng/giảm số lượng” |

## 6. Thanh toán, voucher và MoMo UAT

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| PAY-01 | P0 | Thanh toán khi chưa đăng nhập | Yêu cầu đăng nhập |
| PAY-02 | P0 | Thanh toán với giỏ trống | Không cho tạo đơn |
| PAY-03 | P0 | Mở thanh toán có hàng | Hiện đúng hàng và tổng tiền |
| PAY-04 | P1 | Tự điền tên/email tài khoản | Hiện đúng dữ liệu hiện có |
| PAY-05 | P0 | Bỏ trống họ tên | Không tạo đơn, báo tại trường |
| PAY-06 | P0 | Bỏ trống số điện thoại | Không tạo đơn |
| PAY-07 | P1 | Số điện thoại sai định dạng | Từ chối |
| PAY-08 | P0 | Bỏ trống số nhà/đường | Không tạo đơn |
| PAY-09 | P0 | Bỏ trống phường/xã | Không tạo đơn |
| PAY-10 | P0 | Bỏ trống quận/huyện | Không tạo đơn |
| PAY-11 | P0 | Bỏ trống tỉnh/thành | Không tạo đơn |
| PAY-12 | P1 | Ghi chú dài hơn giới hạn | Từ chối an toàn |
| PAY-13 | P0 | Đặt COD hợp lệ | Tạo đúng một đơn, xóa giỏ |
| PAY-14 | P0 | Nhấn Đặt hàng hai lần | Chỉ tạo một đơn (idempotency) |
| PAY-15 | P1 | Tồn kho thay đổi lúc đặt | Rollback toàn bộ, báo rõ |
| PAY-16 | P1 | Mã voucher hợp lệ | Giảm đúng số tiền/quy tắc |
| PAY-17 | P1 | Mã voucher sai | Không áp dụng, báo rõ |
| PAY-18 | P1 | Voucher hết hạn | Không áp dụng |
| PAY-19 | P1 | Voucher chưa đến hạn | Không áp dụng |
| PAY-20 | P1 | Voucher hết lượt | Không áp dụng |
| PAY-21 | P1 | Voucher chưa đủ giá trị đơn | Không áp dụng |
| PAY-22 | P1 | Voucher giảm vượt tổng hàng | Tổng không âm |
| PAY-23 | P1 | Dùng voucher rồi đổi giỏ | Tính lại điều kiện và tổng |
| PAY-24 | P0 | Chọn MoMo khi chưa cấu hình | Nút vô hiệu hóa và giải thích |
| PAY-25 | P0 | Tạo giao dịch MoMo UAT hợp lệ | Chuyển đúng sandbox MoMo |
| PAY-26 | P0 | MoMo trả về thành công | Đơn cập nhật paid đúng chữ ký |
| PAY-27 | P0 | MoMo trả về thất bại/hủy | Đơn không bị đánh dấu paid |
| PAY-28 | P0 | IPN sai chữ ký | Bị từ chối, không đổi đơn |
| PAY-29 | P0 | IPN phát lại | Không cộng điểm/xử lý hai lần |
| PAY-30 | P1 | Return URL bị giả trạng thái | Không tự quyết định thanh toán thành công |
| PAY-31 | P1 | Mất mạng lúc tạo đơn | Thông báo và cho thử lại an toàn |
| PAY-32 | P1 | Hết phiên lúc đặt | Yêu cầu đăng nhập lại, không tạo đơn |

## 7. Đơn hàng khách hàng

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| ORD-01 | P0 | Đơn mới xuất hiện trong tài khoản | Đúng mã, tiền, trạng thái |
| ORD-02 | P1 | Mở chi tiết đơn của mình | Hiện đủ hàng, địa chỉ, timeline |
| ORD-03 | P0 | Mở đơn người khác bằng URL | Bị từ chối |
| ORD-04 | P1 | Hủy đơn ở trạng thái cho phép | Trạng thái đổi và hoàn tồn đã giữ |
| ORD-05 | P1 | Hủy lại cùng đơn | Không hoàn tồn lần hai |
| ORD-06 | P1 | Hủy đơn đang giao/hoàn tất | Bị chặn |
| ORD-07 | P1 | Admin xác nhận đơn | Timeline cập nhật |
| ORD-08 | P1 | Admin chuyển giao hàng | Trừ tồn vật lý đúng một lần |
| ORD-09 | P1 | Chuyển giao khi thiếu tồn | Rollback trạng thái và tồn |
| ORD-10 | P1 | Đánh dấu hoàn tất | Timeline cập nhật |
| ORD-11 | P1 | Hiển thị COD chưa thanh toán | Trạng thái thanh toán đúng |
| ORD-12 | P1 | Hiển thị MoMo đã trả | Có mã giao dịch, trạng thái paid |
| ORD-13 | P2 | Danh sách nhiều đơn | Phân trang/lọc hợp lý |
| ORD-14 | P1 | Dữ liệu tiền của đơn cũ | Không đổi khi giá sản phẩm cập nhật |

## 8. Điểm thưởng và voucher đổi điểm

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| LOY-01 | P1 | Đơn mới/chưa trả | Không cộng điểm |
| LOY-02 | P0 | Đơn hoàn tất và đã thanh toán | Cộng đúng điểm một lần |
| LOY-03 | P1 | Cập nhật hoàn tất lặp lại | Không cộng lần hai |
| LOY-04 | P1 | Hủy/hoàn đơn | Xử lý điểm theo quy định, không âm sai |
| LOY-05 | P1 | Điểm hiển thị ở tài khoản | Khớp lịch sử giao dịch |
| LOY-06 | P1 | Đổi voucher đủ điểm | Trừ đúng điểm và cấp voucher |
| LOY-07 | P1 | Đổi voucher thiếu điểm | Bị chặn |
| LOY-08 | P1 | Nhấn đổi hai lần nhanh | Chỉ đổi một lần |
| LOY-09 | P1 | Voucher đổi điểm xuất hiện | Hiện đúng hạn và điều kiện |
| LOY-10 | P1 | Dùng voucher của tài khoản khác | Bị từ chối |
| LOY-11 | P1 | Admin cộng điểm có lý do | Lưu lịch sử người thực hiện |
| LOY-12 | P1 | Admin trừ quá số điểm | Không để số dư âm ngoài quy định |

## 9. Yêu cầu đổi size/đổi hàng

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| EXC-01 | P0 | Tạo yêu cầu trong 72 giờ | Được tiếp nhận |
| EXC-02 | P0 | Tạo đúng mốc 72 giờ | Được tiếp nhận |
| EXC-03 | P0 | Quá 72 giờ một giây | Bị từ chối |
| EXC-04 | P0 | Đơn chưa ghi nhận đã nhận | Chưa cho đổi |
| EXC-05 | P1 | Lý do khách chọn sai size | Khách chịu phí |
| EXC-06 | P1 | Lý do sản phẩm lỗi | HAUVIE chịu phí sau khi duyệt |
| EXC-07 | P1 | Lý do giao nhầm | HAUVIE chịu phí sau khi duyệt |
| EXC-08 | P1 | Lý do khác | Không tự gán lỗi cho khách |
| EXC-09 | P0 | Sản phẩm bị làm dơ | Không đủ điều kiện |
| EXC-10 | P1 | Báo lỗi/giao nhầm không có ảnh | Không cho gửi |
| EXC-11 | P1 | Ảnh đúng định dạng/dung lượng | Tải lên thành công |
| EXC-12 | P1 | File giả ảnh/quá lớn | Bị từ chối an toàn |
| EXC-13 | P1 | Chọn size thay thế còn tồn | Gửi được |
| EXC-14 | P1 | Chọn size thay thế hết tồn | Bị chặn |
| EXC-15 | P1 | Chọn cùng size hiện tại | Cảnh báo hoặc yêu cầu xác nhận hợp lý |
| EXC-16 | P1 | Gửi trùng yêu cầu cùng dòng hàng | Không tạo bản trùng |
| EXC-17 | P1 | Khách xem trạng thái xử lý | Hiện timeline/ghi chú phù hợp |
| EXC-18 | P1 | Admin duyệt | Lưu người duyệt, thời gian, phí |
| EXC-19 | P1 | Admin từ chối | Bắt buộc lý do và hiển thị cho khách |
| EXC-20 | P1 | Admin đổi trạng thái sai thứ tự | Bị chặn |
| EXC-21 | P1 | Duyệt khi size vừa hết tồn | Rollback, báo chọn size khác |
| EXC-22 | P1 | Khách truy cập yêu cầu người khác | Bị từ chối |

## 10. Đánh giá, bình luận, liên hệ và Google Maps

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| COM-01 | P1 | Người chưa đăng nhập gửi đánh giá | Yêu cầu đăng nhập |
| COM-02 | P1 | Chọn 1–5 sao | Trạng thái và nhãn sao đúng |
| COM-03 | P1 | Bỏ trống bình luận | Xử lý theo quy định |
| COM-04 | P1 | Bình luận quá dài | Từ chối an toàn |
| COM-05 | P1 | Nhập HTML/script | Hiển thị như văn bản, không thực thi |
| COM-06 | P1 | Gửi đánh giá hợp lệ | Xuất hiện/chờ duyệt đúng thiết kế |
| COM-07 | P1 | Gửi trùng nhanh | Không tạo bản trùng ngoài ý muốn |
| COM-08 | P1 | Admin ẩn/hiện/phản hồi | Storefront cập nhật đúng |
| COM-09 | P1 | Mở trang liên hệ | Đủ form và thông tin HAUVIE |
| COM-10 | P1 | Gửi liên hệ thiếu nội dung | Bị từ chối |
| COM-11 | P1 | Không có cả email và số điện thoại | Bị từ chối hoặc giải thích rõ |
| COM-12 | P1 | Gửi liên hệ hợp lệ | Lưu một yêu cầu, báo thành công |
| COM-13 | P1 | Google Maps | Nhúng bản đồ UTH Cơ sở 1, thao tác được |
| COM-14 | P1 | Link mở Google Maps | Mở đúng địa điểm |
| COM-15 | P1 | Admin đổi trạng thái liên hệ | Lưu đúng trạng thái/ghi chú |

## 11. Trang quản trị

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| ADM-01 | P0 | Dashboard tải số liệu | Không 500, số liệu nhất quán |
| ADM-02 | P1 | Lọc dashboard theo ngày | KPI thay đổi đúng |
| ADM-03 | P1 | Khoảng ngày ngược | Báo lỗi hoặc tự chuẩn hóa |
| ADM-04 | P1 | Danh sách sản phẩm | Hiện đủ 37 sản phẩm công khai hiện tại |
| ADM-05 | P0 | Tạo sản phẩm đủ dữ liệu | Sản phẩm lưu và có thể công khai |
| ADM-06 | P1 | Tạo thiếu tên/slug/giá | Không lưu |
| ADM-07 | P1 | Slug trùng | Bị từ chối/đề xuất slug khác |
| ADM-08 | P1 | Giá âm/không phải số | Bị từ chối |
| ADM-09 | P1 | Giá cũ nhỏ hơn giá mới | Cảnh báo quy tắc hợp lý |
| ADM-10 | P1 | Tạo nhiều biến thể | SKU duy nhất, tồn đúng |
| ADM-11 | P1 | SKU trùng | Bị từ chối |
| ADM-12 | P1 | Tồn kho âm/thập phân | Bị từ chối |
| ADM-13 | P1 | Tải nhiều ảnh | Lưu, sắp xếp và hiện đúng |
| ADM-14 | P1 | Xóa/đổi thứ tự ảnh | Storefront cập nhật đúng |
| ADM-15 | P1 | Sửa tên/giá/màu/size | Storefront phản ánh dữ liệu mới |
| ADM-16 | P1 | Ẩn sản phẩm | Biến mất khỏi storefront nhưng còn quản trị |
| ADM-17 | P1 | Công khai sản phẩm nháp | Xuất hiện đúng danh mục |
| ADM-18 | P1 | Import lại bộ ảnh | Không nhân đôi, giữ chỉnh sửa hiện có |
| ADM-19 | P1 | Import file lỗi/thiếu | Báo rõ, không ghi dở dang |
| ADM-20 | P1 | Tạo danh mục | Xuất hiện ở bộ lọc khi có hàng công khai |
| ADM-21 | P1 | Đổi tên danh mục | Sản phẩm liên quan cập nhật đúng |
| ADM-22 | P1 | Xóa danh mục đang có sản phẩm | Bị chặn |
| ADM-23 | P1 | Xóa danh mục rỗng | Xóa thành công |
| ADM-24 | P1 | Điều chỉnh tồn kho | Lưu trước/sau, số lượng, lý do, người thao tác |
| ADM-25 | P1 | Điều chỉnh làm tồn âm | Bị chặn |
| ADM-26 | P1 | Lọc đơn theo trạng thái | Kết quả đúng |
| ADM-27 | P1 | Xem chi tiết đơn | Đủ khách, hàng, tiền, timeline |
| ADM-28 | P1 | Chuyển trạng thái đơn | Chỉ hiện hành động hợp lệ |
| ADM-29 | P1 | Tạo/sửa/tắt voucher | Storefront áp dụng đúng trạng thái |
| ADM-30 | P1 | Quản lý khách hàng | Vai trò và điểm cập nhật có kiểm soát |
| ADM-31 | P0 | Admin tự hạ quyền cuối cùng | Bị chặn hoặc cảnh báo an toàn |
| ADM-32 | P1 | Xử lý đổi hàng | Duyệt/từ chối có lịch sử |
| ADM-33 | P1 | Xử lý liên hệ/đánh giá | Lưu ghi chú/phản hồi đúng |
| ADM-34 | P1 | Hai admin sửa cùng dữ liệu | Không ghi đè im lặng ngoài ý muốn |
| ADM-35 | P2 | Điều hướng quản trị trên mobile | Mọi mục dễ tiếp cận, không phải đoán cuộn ngang |

## 12. Responsive, khả năng tiếp cận và trình duyệt

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| UI-01 | P0 | Mobile 375×812 | Không cuộn ngang toàn trang |
| UI-02 | P1 | Mobile 390×844 | Bố cục và nút không che nhau |
| UI-03 | P1 | Mobile 360×640 | Nội dung chính vẫn thao tác được |
| UI-04 | P1 | Landscape 812×375 | Menu/form không bị mất phần dưới |
| UI-05 | P1 | Tablet 768×1024 | Lưới và header hợp lý |
| UI-06 | P1 | Desktop 1024×768 | Không tràn điều hướng |
| UI-07 | P1 | Desktop 1440×900 | Không xuất hiện thanh cuộn ngang điều hướng |
| UI-08 | P1 | Desktop 1920×1080 | Nội dung không kéo quá rộng |
| UI-09 | P0 | Mở menu mobile | Toàn bộ danh mục và tài khoản cuộn tới được |
| UI-10 | P1 | Đóng menu bằng nút/ESC | Đóng và trả focus về nút mở |
| UI-11 | P1 | Mở/đóng drawer giỏ | Không kẹt scroll/focus |
| UI-12 | P1 | Zoom trình duyệt 200% | Nội dung vẫn đọc và thao tác |
| UI-13 | P1 | Chỉ dùng bàn phím | Đi qua mọi control theo thứ tự hợp lý |
| UI-14 | P1 | Focus visible | Có viền/đánh dấu rõ trên mọi control |
| UI-15 | P1 | Icon-only button | Có accessible name |
| UI-16 | P1 | Form input | Có label liên kết, lỗi có mô tả |
| UI-17 | P1 | Heading hierarchy | Mỗi trang có một H1, cấp không nhảy vô lý |
| UI-18 | P1 | Ảnh có ý nghĩa | Có alt mô tả phù hợp |
| UI-19 | P1 | Màu chữ/nền | Đạt tương phản WCAG AA |
| UI-20 | P2 | prefers-reduced-motion | Giảm hiệu ứng chuyển động |
| UI-21 | P1 | Nút cảm ứng | Vùng chạm tối thiểu phù hợp mobile |
| UI-22 | P1 | Chrome/Edge mới nhất | Luồng chính hoạt động |
| UI-23 | P1 | Safari iOS | Form, sticky header và thanh toán hoạt động |
| UI-24 | P1 | Chrome Android | Menu, giỏ và form hoạt động |
| UI-25 | P1 | Mạng chậm | Có loading, không hiển thị trạng thái sai tạm thời |

## 13. Bảo mật, độ tin cậy và hiệu suất

| ID | Ưu tiên | Trường hợp kiểm thử | Kết quả mong đợi |
|---|---:|---|---|
| SEC-01 | P0 | API thay đổi dữ liệu thiếu Origin | Bị từ chối |
| SEC-02 | P0 | API thay đổi dữ liệu Origin khác site | Bị từ chối |
| SEC-03 | P0 | API admin bằng tài khoản khách | 401/403 |
| SEC-04 | P0 | API đơn/đổi hàng người khác | 401/403/404 an toàn |
| SEC-05 | P1 | SQL-like input trong tìm kiếm/form | Không lỗi/không tiêm lệnh |
| SEC-06 | P1 | XSS trong tên, nhận xét, ghi chú | Escape/sanitize |
| SEC-07 | P1 | Upload sai MIME/phần mở rộng | Bị từ chối |
| SEC-08 | P1 | File upload tên chứa path traversal | Bị từ chối/chuẩn hóa |
| SEC-09 | P0 | Khóa Supabase/MoMo trong client bundle | Không xuất hiện secret key |
| SEC-10 | P0 | RLS dữ liệu người dùng | Không đọc/sửa chéo tài khoản |
| SEC-11 | P1 | Cookie phiên | Secure, HttpOnly, SameSite phù hợp |
| SEC-12 | P1 | Rate limit đăng nhập | Hạn chế brute force, thông báo phù hợp |
| SEC-13 | P1 | Log máy chủ | Không ghi mật khẩu, secret, dữ liệu nhạy cảm |
| SEC-14 | P1 | Lỗi database/mạng | Trả JSON/thông báo hành động được, không stack trace |
| SEC-15 | P1 | Giao dịch nhiều bước thất bại giữa chừng | Rollback toàn bộ |
| SEC-16 | P1 | Tải lại khi đang gửi form | Không tạo dữ liệu trùng |
| PERF-01 | P1 | Lighthouse mobile trang chủ | LCP/CLS/INP ở mức tốt hoặc có kế hoạch sửa |
| PERF-02 | P1 | Ảnh sản phẩm | AVIF/WebP, kích thước phù hợp, lazy-load ngoài màn hình |
| PERF-03 | P1 | Kích thước ảnh khai báo | Không gây layout shift |
| PERF-04 | P1 | Bundle theo route | Không tải toàn bộ quản trị ở storefront |
| PERF-05 | P1 | Danh sách 100+ sản phẩm | Lọc/phân trang vẫn nhanh |
| PERF-06 | P1 | 50 người dùng đồng thời | Không lỗi kết nối/ghi sai tồn |
| PERF-07 | P1 | API giỏ hàng chậm | Có loading và chống ghi đè |
| PERF-08 | P1 | Database mất kết nối | Hiện lỗi có thể thử lại |
| PERF-09 | P2 | Cache tài nguyên tĩnh | Header cache hợp lý |
| PERF-10 | P2 | Console trình duyệt | Không có error/warning nghiêm trọng |

## 14. Bộ dữ liệu tối thiểu để chạy regression

- 01 tài khoản khách mới, 01 khách có điểm/voucher, 01 admin.
- 01 sản phẩm cho mỗi danh mục; mỗi sản phẩm tối thiểu 2 màu × 3 size.
- 01 SKU tồn 0, 01 SKU tồn 1, 01 SKU tồn 10.
- Giá giỏ tại các biên 498.999đ, 499.000đ và trên 499.000đ.
- Voucher hợp lệ, hết hạn, chưa đến hạn, hết lượt, thiếu giá trị đơn và voucher đổi điểm.
- Đơn COD và MoMo ở các trạng thái mới, xác nhận, đang giao, hoàn tất, hủy.
- Yêu cầu đổi tại 71:59:59, đúng 72:00:00 và 72:00:01.

## 15. Tiêu chí chấp nhận trước khi nộp

- 100% test P0 đạt.
- Không còn lỗi mức Nghiêm trọng hoặc Cao.
- Ít nhất 95% test P1 đạt; test chưa chạy phải có lý do và người phụ trách.
- `test`, `typecheck`, `lint`, `build` đều đạt trên commit chuẩn bị triển khai.
- Luồng thật bắt buộc kiểm tra trên link HTTPS bằng mobile và desktop: đăng ký → đăng nhập → tìm/lọc → chọn biến thể → giỏ → COD → theo dõi đơn → admin cập nhật → đổi size.
- MoMo chỉ được công bố “hoạt động” sau khi hoàn tất test UAT tạo giao dịch, return URL, IPN hợp lệ, IPN sai chữ ký và phát lại IPN.
