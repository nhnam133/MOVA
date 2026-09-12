# Báo cáo kiểm thử HAUVIE — 12/09/2026

## 1. Kết luận nhanh

Website công khai hoạt động và các nền tảng chính đã có: sản phẩm, tìm kiếm/lọc/sắp xếp, tài khoản Supabase, giỏ hàng, COD, Google Maps, đánh giá/liên hệ, điểm-voucher, đổi hàng và quản trị. Bản dựng production thành công, 19/19 kiểm thử tự động đạt.

Tuy nhiên website **chưa nên coi là hoàn thiện 100%** vì còn 3 lỗi mức Cao, 4 lỗi mức Trung bình và MoMo UAT chưa được cấu hình. Trạng thái phù hợp hiện tại là **demo đồ án khá tốt với COD**, chưa sẵn sàng nghiệm thu luồng thanh toán MoMo.

## 2. Phạm vi đã kiểm tra

- Link công khai HTTPS: trang chủ, sản phẩm, chi tiết sản phẩm, giỏ hàng, thanh toán, tài khoản, liên hệ và Google Maps.
- Dashboard và các khu vực quản trị: đơn hàng, sản phẩm, danh mục, kho, đổi hàng, voucher, khách hàng, hỗ trợ.
- Giao diện tại 375×812, kích thước cửa sổ ứng dụng và desktop 1440×900.
- Tìm kiếm có/không kết quả; lọc danh mục + giới tính; giá tăng/giảm; phân trang cuối.
- Thêm hàng, tăng số lượng, tính tạm tính/phí vận chuyển và dữ liệu thanh toán.
- Kiểm tra mã nguồn: unit/integration test, typecheck, lint và production build.
- Không gửi đơn, đánh giá hoặc liên hệ thật; không đổi trạng thái quản trị và không tạo tài khoản mới trong lần kiểm tra này để tránh làm thay đổi dữ liệu.

## 3. Kết quả kiểm thử tự động

| Hạng mục | Kết quả |
|---|---|
| Unit/integration test | **19/19 đạt** |
| TypeScript typecheck | **Đạt** |
| Lint | **Đạt** |
| Production build | **Đạt**; toàn bộ route app/API được dựng |
| Tài sản ảnh nhập | **76/76 file AVIF khớp byte** theo test |

Các quy tắc đã có test tự động đáng chú ý: chống redirect ngoài site; kiểm tra Origin cho mutation; validation đăng ký; biên phí ship 499.000đ; biên đổi hàng 72 giờ; rollback tồn kho; chống cộng điểm hai lần; import lặp không nhân đôi; giỏ chặn SKU ẩn/sai/số lượng thập phân; xử lý lỗi kết nối có JSON hợp lệ.

## 4. Kết quả kiểm thử trực tiếp

### Đạt

- Link HTTPS truy cập công khai; nhận diện nhìn thấy là HAUVIE.
- Trang sản phẩm hiện 37 sản phẩm công khai, 12 sản phẩm mỗi trang, 4 trang; trang cuối có 1 sản phẩm.
- Tìm “polo” trả về 6 sản phẩm; từ khóa không tồn tại trả empty state và cho xóa lọc.
- Lọc `Áo polo + Nam + Giá tăng` trả đúng 3 kết quả.
- Giá tăng bắt đầu 59.000đ; giá giảm bắt đầu 449.000đ rồi 429.000đ.
- Ảnh sản phẩm đã kiểm tra không bị vỡ và đều có alt.
- Thêm áo polo vào giỏ, tăng lên 2: tạm tính đúng 798.000đ và miễn phí vận chuyển.
- Thanh toán nhận đúng hai sản phẩm, tự điền email/tên, COD chọn được; tổng là 798.000đ.
- Tài khoản có sửa hồ sơ, đổi mật khẩu, điểm, voucher, lịch sử đơn và link quản trị cho admin.
- Google Maps được nhúng bằng iframe, có thể mở đúng địa điểm UTH Cơ sở 1 trong Maps.
- 8 tuyến quản trị đã tải không lỗi máy chủ và hiển thị dữ liệu tương ứng.
- Không phát hiện thanh cuộn ngang của toàn tài liệu ở trang chủ mobile/desktop.

### Chưa thực hiện end-to-end

- Gửi đơn COD thật: sẽ tạo đơn và thay đổi tồn kho.
- Gửi đánh giá/liên hệ: sẽ tạo nội dung đại diện người dùng.
- Xóa dữ liệu thử trong giỏ: cần xác nhận vì làm mất dữ liệu giỏ.
- Đăng xuất để kiểm tra lại form đăng nhập/đăng ký: giữ nguyên phiên admin hiện tại.
- MoMo UAT: thiếu cấu hình môi trường nên không thể bắt đầu giao dịch.
- Các kịch bản nhiều tài khoản/đồng thời/tải nặng: cần dữ liệu và công cụ test chuyên dụng.

## 5. Danh sách lỗi cần sửa

Quy ước: **Cao** = cản trở chức năng quan trọng; **Trung bình** = chức năng vẫn dùng được nhưng gây hiểu sai/khó thao tác; **Thấp** = hoàn thiện và SEO.

| ID | Mức | Lỗi và bằng chứng | Ảnh hưởng | Hướng sửa đề xuất |
|---|---|---|---|---|
| BUG-01 | **Cao** | Menu mobile cao hơn màn hình (nội dung khoảng 1.158px trong viewport 812px) nhưng vùng menu không cuộn; các danh mục cuối và “Tài khoản của tôi” nằm ngoài màn hình | Người dùng điện thoại không mở được nhiều danh mục/tài khoản | Cho `SheetContent` hoặc phần nav `overflow-y-auto`, dùng `h-dvh/min-h-0`, giữ header/search cố định nếu cần |
| BUG-02 | **Cao** | Dữ liệu màu vẫn có `Màu theo ảnh (demo)`; bộ lọc cũng hiển thị giá trị này | Không đáp ứng yêu cầu màu đúng ảnh, làm sản phẩm thiếu tin cậy | Chuẩn hóa màu của toàn bộ biến thể trong quản trị/import, map theo ảnh thật rồi bỏ lựa chọn demo |
| BUG-03 | **Cao** | Mô tả áo polo hiện “màu màu theo ảnh (demo)” | Nội dung sai ngữ pháp và lộ dữ liệu mẫu | Không ghép thêm từ “màu” nếu giá trị đã chứa từ đó; tốt nhất dùng dữ liệu màu chuẩn |
| BUG-04 | **Trung bình** | Trang giỏ luôn ghi “Bạn cần đăng nhập để đặt hàng” kể cả khi header đã xác nhận người dùng đăng nhập | Gây hiểu nhầm rằng không thể đặt hàng | Truyền trạng thái đăng nhập vào trang giỏ; khi đã đăng nhập đổi thành thông điệp bảo mật/thanh toán |
| BUG-05 | **Trung bình** | Khi mở/tải lại giỏ, trang lóe “GIỎ HÀNG ĐANG TRỐNG” khoảng 1–1,5 giây rồi mới hiện 2 sản phẩm | Người dùng tưởng mất giỏ, có thể bấm mua tiếp sai | Thêm trạng thái `hydrating/loading`, dùng skeleton và chỉ render empty state sau khi đồng bộ xong |
| BUG-06 | **Trung bình** | Thanh điều hướng danh mục desktop xuất hiện cuộn ngang ở 1440px vì có 12 nhóm và link phụ | Bố cục thiếu gọn, khó nhận ra còn mục phía phải | Dùng menu “Danh mục” dạng dropdown/mega-menu hoặc chia ưu tiên, không để scrollbar lộ ở desktop |
| BUG-07 | **Trung bình** | Nav quản trị trên mobile là một hàng cuộn ngang, mục phía sau bị khuất | Admin mobile khó khám phá đủ chức năng | Dùng nút menu/drawer hoặc dropdown “Quản trị”; thể hiện mục hiện tại rõ ràng |
| BUG-08 | **Trung bình** | Nút +/− số lượng tại trang `/gio-hang` chỉ có icon, không có `aria-label` | Screen reader không biết nút tăng hay giảm | Thêm `aria-label="Giảm số lượng"` / `aria-label="Tăng số lượng"` và focus style |
| BUG-09 | **Thấp** | Tiêu đề tab của trang chi tiết sản phẩm vẫn là tiêu đề website chung | SEO/chia sẻ link kém cụ thể | Sinh metadata theo sản phẩm: tên, mô tả, ảnh Open Graph |
| BUG-10 | **Thấp** | Logo mobile khoảng 31px cao và ô tìm kiếm khoảng 42px, thấp hơn mục tiêu cảm ứng 44px thường dùng | Vùng chạm hơi nhỏ | Mở rộng hit area/tối thiểu 44px mà không cần tăng kích thước logo nhìn thấy |
| BUG-11 | **Thấp** | Tên biến môi trường và mã lỗi nội bộ còn tiền tố `MOVA_*` | Không lỗi giao diện nhưng gây nợ kỹ thuật khi bàn giao HAUVIE | Đổi có migration/fallback để không làm mất cấu hình đang chạy |

## 6. Điểm chặn cấu hình

### MoMo UAT — chưa hoàn tất

Ba biến bắt buộc chưa được cấu hình trên môi trường triển khai:

- `MOMO_PARTNER_CODE`
- `MOMO_ACCESS_KEY`
- `MOMO_SECRET_KEY`

Trang thanh toán hiện hiển thị đúng trạng thái “MoMo UAT — Chưa cấu hình kết nối UAT” và vô hiệu hóa nút. Sau khi thêm khóa cần kiểm thử tối thiểu: tạo payment URL, hủy, thành công, sai chữ ký IPN, phát lại IPN và đối chiếu `payment_status` trong database.

## 7. Đánh giá chất lượng

| Tiêu chí | Điểm /10 | Nhận xét |
|---|---:|---|
| Độ đầy đủ chức năng | 8.2 | Hầu hết yêu cầu đề bài và mở rộng đã có; MoMo chưa hoạt động |
| Luồng mua hàng COD | 8.3 | Tìm/lọc/giỏ/checkout tốt; còn thông báo đăng nhập sai và loading giỏ |
| Dữ liệu/nội dung | 6.8 | Ảnh đầy đủ nhưng màu demo và câu mô tả lỗi cần sửa |
| UI/UX desktop | 7.8 | Hình ảnh đẹp, thương hiệu rõ; nav danh mục bị cuộn ngang |
| UI/UX mobile | 6.9 | Trang chính responsive nhưng menu mobile chặn các mục cuối |
| Khả năng tiếp cận | 7.4 | Alt/nhãn phần lớn tốt; còn nút số lượng thiếu tên truy cập |
| Quản trị | 8.5 | Bao phủ sản phẩm, danh mục, kho, đơn, đổi hàng, voucher, khách, hỗ trợ |
| Độ tin cậy mã nguồn | 8.7 | Test/typecheck/lint/build đều đạt, có transaction/rollback/idempotency |
| Sẵn sàng triển khai | 7.0 | Link public tốt cho COD; chưa đạt khi tính MoMo và các lỗi Cao |

**Điểm tổng hợp: 7,7/10 — mức Khá.** Sau khi sửa BUG-01 đến BUG-08 và cấu hình/test MoMo UAT, dự án có thể đạt khoảng 8,5–9,0/10 cho phạm vi đồ án.

## 8. Thứ tự sửa đề xuất

1. Sửa menu mobile cuộn được.
2. Cập nhật màu thật cho 37 sản phẩm và sinh lại mô tả, bộ lọc màu.
3. Sửa thông báo/ trạng thái nạp giỏ và nhãn truy cập nút +/−.
4. Tối ưu nav danh mục desktop và nav quản trị mobile.
5. Bổ sung metadata từng trang/sản phẩm và tinh chỉnh vùng chạm.
6. Cấu hình MoMo UAT, chạy bộ test payment/IPN.
7. Chạy lại toàn bộ P0, các P1 liên quan và regression tự động trước khi deploy.
