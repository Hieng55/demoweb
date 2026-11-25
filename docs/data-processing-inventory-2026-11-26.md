# Danh mục xử lý dữ liệu Webs4V

> Tài liệu vận hành nội bộ, cập nhật ngày 26/11/2026. Đây là bản nháp kỹ thuật, cần người có chuyên môn pháp lý xác nhận phần nghĩa vụ và hồ sơ.

## Luồng dữ liệu từ mã nguồn

| Nguồn | Dữ liệu | Mục đích | Bên nhận/nơi lưu | Thời hạn vận hành |
|---|---|---|---|---|
| Form tư vấn | Họ tên, số điện thoại, ngành nghề, mục tiêu, ngân sách, dịch vụ, nội dung, trang gửi và UTM | Phản hồi yêu cầu tư vấn | Google Apps Script, thông báo Telegram | Tối đa 12 tháng kể từ lần trao đổi cuối cùng |
| Form tuyển dụng | Họ tên, số điện thoại, email, vị trí, giới thiệu, CV PDF | Tiếp nhận và đánh giá hồ sơ | Google Apps Script, Google Drive; Telegram nhận thông tin và liên kết Drive | Tối đa 180 ngày |
| Form tên miền | Họ tên, số điện thoại, email, tên miền quan tâm, ghi chú | Xác minh tên miền, tư vấn và báo giá | MySQL trên cPanel; thông báo Telegram | Tối đa 12 tháng kể từ lần trao đổi cuối cùng |
| Hệ thống chống lạm dụng | Thời điểm gửi, trang gửi, IP được băm hoặc khóa giới hạn tần suất, nhật ký kỹ thuật | Chống spam, bảo vệ API | Google Apps Script/cache, MySQL và nhà cung cấp hosting | Theo thời gian cần thiết cho an toàn hệ thống và cấu hình nhà cung cấp |

Các form không chủ động yêu cầu CCCD, thông tin thanh toán hoặc dữ liệu cá nhân nhạy cảm. Ứng viên được nhắc không đưa dữ liệu không cần thiết vào CV.

## Bằng chứng đồng ý phiên bản 2.0

- Form tư vấn: Apps Script kiểm tra `contact_request`, phiên bản `2.0`; Telegram lưu thời điểm máy chủ, mục đích, phiên bản và nội dung đồng ý.
- Form tuyển dụng: Apps Script kiểm tra `recruitment_application`, phiên bản `2.0`; tệp `thong-tin-ung-vien.txt` trong thư mục hồ sơ lưu thời điểm, mục đích, phiên bản và nội dung đồng ý.
- Form tên miền: PHP kiểm tra `domain_consultation`, phiên bản `2.0`; bảng `domain_consents` lưu bản ghi append-only cùng transaction với yêu cầu.

## Việc vận hành cần thực hiện

- [ ] Deploy phiên bản mới của `apps-script/Code.gs`; giữ nguyên URL Web App `/exec`.
- [ ] Chạy lại `installRecruitmentCleanupTrigger` và xác nhận `RECRUITMENT_RETENTION_DAYS=180`.
- [ ] Import `cpanel/domain-store/migrations/002-domain-consents.sql` trước khi upload API mới.
- [ ] Hàng tháng rà soát và xóa yêu cầu tư vấn/tên miền đã quá thời hạn; ghi lại ngày, người thực hiện và phạm vi dữ liệu đã xóa.
- [ ] Thiết lập/quản lý thời gian lưu thông báo trong nhóm Telegram phù hợp với chính sách; không chuyển tiếp dữ liệu sang nhóm không cần thiết.
- [ ] Có sổ tiếp nhận yêu cầu tại `support@webs4v.vn` để theo dõi các mốc 2/10/15/20 ngày và trường hợp cần bên thứ ba phối hợp.

## Chuyển dữ liệu xuyên biên giới — chưa thể hoàn tất bằng code

Google Apps Script, Google Drive, Telegram và Google Fonts có thể vận hành hệ thống ngoài Việt Nam. Cần người làm luật xác định chính xác vai trò, vị trí xử lý, trường hợp miễn và việc lập/gửi hồ sơ đánh giá tác động chuyển dữ liệu xuyên biên giới theo Điều 20 Luật 91/2025/QH15 và Nghị định 356/2025/NĐ-CP.

Không đánh dấu mục này hoàn tất chỉ vì chính sách đã công khai các nhà cung cấp.
