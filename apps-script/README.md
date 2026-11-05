# Cấu hình form Webs4V

`Code.gs` xử lý hai loại biểu mẫu qua cùng một Web App:

- form tư vấn hiện có;
- form ứng tuyển Developer, Marketing, Sales Website và Graphic Designer có một tệp CV PDF.

## Script Properties bắt buộc

Trong Google Apps Script, mở **Project Settings → Script Properties** và cấu hình:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
ALLOWED_SITE_ORIGIN
```

Hồ sơ được chia vào bốn thư mục Drive theo nhóm vị trí trong `RECRUITMENT_POSITION_FOLDER_IDS`:

- Developer Intern và Developer Fresher dùng chung thư mục Developer;
- Marketing Executive dùng thư mục Marketing;
- Sales Website dùng thư mục Sales;
- Graphic Designer dùng thư mục Design.

Tài khoản dùng để deploy Web App phải có quyền tạo tệp trong cả bốn thư mục. Code không tự chuyển tệp thành công khai.

Đặt `ALLOWED_SITE_ORIGIN` thành `https://webs4v.vn` để trang phản hồi Apps Script chỉ gửi kết quả xác nhận về đúng website.

Script Property tùy chọn:

```text
RECRUITMENT_RETENTION_DAYS=180
```

Giá trị được giới hạn từ 30 đến 730 ngày; mặc định là 180 ngày.

## Phát hành

Sau khi cập nhật `Code.gs`:

1. Deploy → Manage deployments.
2. Chỉnh deployment Web App hiện tại và chọn **New version**.
3. Execute as: tài khoản sở hữu thư mục Drive.
4. Who has access: cấu hình phù hợp để form công khai có thể gửi.
5. Giữ nguyên URL `/exec` nếu chỉnh deployment hiện tại; nếu tạo deployment mới, cập nhật `data-recruitment-endpoint` trong các trang tuyển dụng.

## Giới hạn tệp

- Đúng 1 tệp mỗi hồ sơ.
- Tối đa 5 MB.
- Chỉ nhận PDF; server kiểm tra phần mở đầu `%PDF-`, dấu kết thúc `%EOF` và chặn một số action PDF chủ động thường gặp.
- Mỗi hồ sơ được lưu trong một thư mục con riêng, kèm `thong-tin-ung-vien.txt`.

Telegram chỉ nhận thông tin ứng viên và liên kết Google Drive, không nhận binary của tệp.

Nếu Telegram tạm thời lỗi, hồ sơ đã lưu vẫn được giữ trên Drive; lỗi thông báo được ghi trong Executions log.

## Dọn hồ sơ hết hạn

Sau khi deploy và cấu hình `RECRUITMENT_RETENTION_DAYS`, chạy thủ công một lần hàm `installRecruitmentCleanupTrigger`. Hàm này tạo trigger chạy khoảng 03:00 mỗi ngày và chuyển các thư mục hồ sơ quá hạn trong cả bốn vùng tuyển dụng vào thùng rác.

## Chống bot nâng cao

Honeypot và rate limit chỉ giảm spam cơ bản. Trước khi chạy quảng cáo tuyển dụng lớn, nên tạo Cloudflare Turnstile cho `webs4v.vn`, thêm widget phía website và xác minh token qua Siteverify trong Apps Script. Không đặt Turnstile secret key trong mã frontend.
