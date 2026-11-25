🤖 Báo cáo do AI tạo từ mã nguồn, chỉ để tham khảo, không phải ý kiến pháp lý. Phần lớn mục 🔴 là chỉnh sửa nhỏ trong code, làm được trong vài giờ, không cần quá lo. Việc gì quan trọng thì hỏi lại người làm luật.

# Rà soát pháp lý sơ bộ webs4v.vn

- Ngày rà soát: 26/11/2026
- Phạm vi: mã nguồn tại `D:\webs4v.vn` và tối đa 15 trang công khai từ `https://webs4v.vn`
- Công cụ: `vn-law-check` của `mhfed`, sau đó kiểm tra bằng tay để loại cảnh báo heuristic
- Phân loại: mức 1 — website giới thiệu dịch vụ có biểu mẫu thu thập dữ liệu nhẹ

## Kết luận nhanh

Không phát hiện mục 🟥 có bằng chứng chắc trong phần mã nguồn và trang công khai đã xem. Sau đợt sửa ngày 26/11/2026, ba mục kỹ thuật đã chuyển sang 🟢 trong mã nguồn; còn một mục 🟡 cần người làm luật xác minh.

> Trạng thái xử lý ngày 26/11/2026: các thay đổi kỹ thuật cho mục 1–3 đã được chuẩn bị trong mã nguồn với chính sách phiên bản 2.0. Cần deploy Apps Script, import migration MySQL rồi phát hành website để các thay đổi có hiệu lực. Mục 4 vẫn cần người làm luật xác minh; xem `docs/data-processing-inventory-2026-11-26.md`.

Website không có tài khoản người dùng, chatbot AI, cổng thanh toán hoặc quy trình tạo hợp đồng trực tuyến. Tín hiệu “thương mại điện tử” từ máy quét là cảnh báo giả do các từ “giỏ hàng”, “thanh toán” trong bài viết và giao diện gom tên miền quan tâm. Biểu mẫu tên miền ghi rõ đây chỉ là yêu cầu báo giá, chưa phát sinh hợp đồng hoặc nghĩa vụ thanh toán. Vì vậy báo cáo này áp dụng phần bảo vệ dữ liệu cá nhân; không đưa ra kết luận miễn hay phải thông báo website với Bộ Công Thương.

## Việc nên hoàn thiện

### 🟢 1. Đã bổ sung bằng chứng về sự đồng ý — chờ triển khai

Các biểu mẫu buộc người dùng tự tích ô đồng ý. Mã nguồn mới gửi và kiểm tra mục đích, phiên bản chính sách `2.0` ở phía máy chủ:

- Form liên hệ: Apps Script từ chối consent thiếu/sai và ghi thời điểm máy chủ, mục đích, phiên bản, nội dung đồng ý cùng thông báo Telegram.
- Form tuyển dụng: Apps Script từ chối consent thiếu/sai và ghi cùng dữ liệu consent vào `thong-tin-ung-vien.txt` trong thư mục hồ sơ.
- Form tên miền: PHP từ chối consent thiếu/sai; bảng append-only `domain_consents` lưu bằng chứng trong cùng transaction với yêu cầu.

Căn cứ rà soát: khoản 1, 2 Điều 6 Nghị định 356/2025/NĐ-CP yêu cầu sự đồng ý có thể kiểm chứng; bên kiểm soát dữ liệu cần chứng minh được sự đồng ý khi có tranh chấp.

Điều kiện để có hiệu lực: deploy `apps-script/Code.gs`, import `cpanel/domain-store/migrations/002-domain-consents.sql`, sau đó upload bản website/API mới.

### 🟢 2. Chính sách đã đồng bộ với các form — chờ triển khai

`chinh-sach-bao-mat/index.html` đã chuyển sang phiên bản `2.0`, ngày 26/11/2026; bổ sung pháp nhân, form tên miền, dữ liệu thực tế, mục đích, mốc lưu giữ và cách rút lại đồng ý.

Mốc vận hành được công bố: tối đa 12 tháng cho yêu cầu tư vấn/tên miền và 180 ngày cho hồ sơ tuyển dụng. Cần thực hiện quy trình xóa tương ứng trong `docs/data-processing-inventory-2026-11-26.md`.

### 🟢 3. Đã công bố thời hạn xử lý yêu cầu dữ liệu — chờ triển khai

Chính sách phiên bản `2.0` đã bổ sung kênh `support@webs4v.vn` và các mốc phản hồi, xem/sửa/cung cấp dữ liệu, rút đồng ý/hạn chế/phản đối và xóa dữ liệu.

Các mốc được ghi theo Điều 5 Nghị định 356/2025/NĐ-CP: phản hồi/hướng dẫn trong 2 ngày làm việc; xem, sửa hoặc cung cấp dữ liệu trong 10 ngày; rút đồng ý, hạn chế hoặc phản đối trong 15 ngày; xóa trong 20 ngày; đồng thời nêu trường hợp phối hợp bên thứ ba và gia hạn.

### 🟡 4. Cần xác minh nghĩa vụ chuyển dữ liệu xuyên biên giới

Biểu mẫu liên hệ được chuyển qua Google Apps Script rồi thông báo qua Telegram; CV được lưu trên Google Drive. Chính sách đã công khai các bên này tại `chinh-sach-bao-mat/index.html:89`, nhưng không thể xác định từ code liệu doanh nghiệp đã đánh giá và lập hồ sơ chuyển dữ liệu xuyên biên giới hay thuộc trường hợp miễn.

Điều 20 Luật 91/2025/QH15 có thể áp dụng khi dữ liệu được lưu trên hệ thống ở nước ngoài hoặc chuyển cho tổ chức nước ngoài. Với website nhỏ, đây là mục thủ tục nên được xác minh với người làm luật; báo cáo không kết luận website đang vi phạm.

## Điểm đang làm tốt

- 🟢 Tất cả form liên hệ, tuyển dụng và tên miền đều có checkbox riêng, bắt buộc và không tích sẵn; người dùng phải chủ động đồng ý.
- 🟢 Nội dung cạnh checkbox nêu mục đích thật và có liên kết tới chính sách bảo mật.
- 🟢 Chính sách công khai loại dữ liệu, mục đích, bên tiếp nhận, lưu trữ, quyền của người dùng và kênh liên hệ; đồng thời nêu Google Apps Script, Drive, Telegram và Google Fonts.
- 🟢 Không phát hiện script Google Analytics, Google Tag Manager, Meta Pixel, TikTok Pixel, Clarity hoặc công cụ theo dõi tương tự được nạp. Hai lệnh `window.gtag` trong JS chỉ là hàm gửi sự kiện dự phòng; không có script gtag được tải.
- 🟢 Form tên miền không yêu cầu CCCD, phía PHP kiểm tra consent và ghi rõ gửi form chưa tạo đơn hàng, hợp đồng hay nghĩa vụ thanh toán.

## Phạm vi không áp dụng hoặc chưa đủ dữ kiện

- ⚪ Không áp dụng xóa tài khoản vì website không có tài khoản người dùng.
- ⚪ Không áp dụng minh bạch chatbot AI vì không phát hiện chatbot hoặc tích hợp AI.
- ⚪ Không kiểm tra quy trình nội bộ, hợp đồng với nhà cung cấp, hồ sơ pháp lý đã nộp hoặc cấu hình tài khoản Google/Telegram vì các nội dung này không nằm trong mã nguồn công khai.
- ⚪ Không kết luận nghĩa vụ thông báo/đăng ký với Bộ Công Thương. Trang hiện không có checkout hoặc thanh toán, nhưng việc phân loại pháp lý còn phụ thuộc mô hình cung cấp dịch vụ thực tế.

## Nguồn pháp lý chính đã đối chiếu

- [Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15](https://congbao.chinhphu.vn/van-ban/luat-so-91-2025-qh15-45578.htm), hiệu lực từ 01/01/2026.
- [Nghị định 356/2025/NĐ-CP](https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-356-2025-nd-cp-468371.htm), hiệu lực từ 01/01/2026.
- [Nghị định 330/2026/NĐ-CP](https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-330-2026-nd-cp-470339.htm), hiệu lực từ 19/08/2026. Báo cáo không nêu mức phạt vì không có phát hiện 🟥 chắc chắn.

## Giới hạn của lần rà soát

Máy quét chỉ dùng đối sánh heuristic, không chạy trình duyệt thật và khi quét URL chỉ đọc trang công khai. Kết quả phản ánh snapshot mã nguồn và website ngày 26/11/2026; cần rà lại khi thêm tracking, thanh toán, tài khoản, chatbot hoặc thay đổi nhà cung cấp xử lý dữ liệu.

---

Đây là rà soát ban đầu do AI tạo từ mã nguồn và nội dung công khai, không phải ý kiến tư vấn pháp lý chính thức và không thay thế luật sư hoặc cơ quan nhà nước có thẩm quyền. Không mục nào trong báo cáo là kết luận pháp lý rằng Webs4V “tuân thủ” hoặc “vi phạm”.
