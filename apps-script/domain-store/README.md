# Google Apps Script riêng cho tên miền và hosting

App Script này độc lập với backend liên hệ/tuyển dụng hiện tại. Nó làm các việc sau:

- kiểm tra tên miền qua API iNET;
- lấy giá đăng ký/gia hạn theo đuôi tên miền;
- bổ sung WHOIS công khai khi nguồn RDAP của đuôi tên miền hỗ trợ;
- nhận yêu cầu mua và gửi thông báo tới bot Telegram riêng.

Nó không gọi API đăng ký/gia hạn và không tự động trừ quỹ iNET.

## Cài đặt

1. Tạo một dự án mới tại `https://script.google.com/`.
2. Dán toàn bộ nội dung `Code.gs` trong thư mục này vào file `Code.gs` của dự án mới.
3. Vào **Project Settings → Script Properties** và tạo bốn thuộc tính:

```text
INET_RESELLER_TOKEN
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
ALLOWED_SITE_ORIGIN=https://webs4v.vn
```

Nếu chưa biết `TELEGRAM_CHAT_ID`: thêm `TELEGRAM_BOT_TOKEN` trước, nhắn một tin cho bot, chạy hàm `getTelegramChatId()` trong Apps Script và lấy giá trị được ghi trong Execution log.

4. Chọn **Deploy → New deployment → Web app**.
5. Chọn **Execute as: Me** và quyền truy cập phù hợp để khách ngoài website có thể gọi Web App.
6. Sao chép URL kết thúc bằng `/exec` và cấu hình vào trang tên miền của Webs4V.

Không commit hoặc gửi token iNET/Telegram qua chat. Chỉ URL `/exec` được đặt trong frontend.
