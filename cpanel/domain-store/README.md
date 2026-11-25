# Backend tên miền/hosting trên cPanel

Backend yêu cầu PHP 8.1+, các extension `curl`, `pdo_mysql`, `json` và MySQL/MariaDB.

## Cài đặt lần đầu

1. Trong cPanel, tạo MySQL Database và MySQL User. Có thể cấp `ALL PRIVILEGES` để import `schema.sql`, nhưng sau khi import xong chỉ giữ các quyền runtime: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
2. Mở phpMyAdmin, chọn database vừa tạo và import `schema.sql`.
3. Copy `webs4v-domain-store.example.php` thành `webs4v-domain-store.php`, điền thông tin thật.
4. Upload `webs4v-domain-store.php` vào thư mục home của tài khoản, **nằm ngoài `public_html`**:

   ```text
   /home/CPANEL_USER/webs4v-domain-store.php
   ```

   Trong File Manager, đặt quyền file ở mức `600` (hoặc `640` nếu PHP trên hosting cần group đọc). Không đặt file này trong `public_html` và không tạo bản sao có đuôi `.bak`, `.txt` hoặc `.zip` trong thư mục public.

5. Chạy `npm run build`, sau đó upload nội dung thư mục `out/` vào `public_html/`. Thư mục `out/api/` phải được upload nguyên vẹn, bao gồm `.htaccess`.
6. Truy cập trang tên miền, thử một lượt kiểm tra và tạo đơn. Kiểm tra bảng `domain_orders`, `domain_order_items` và tin nhắn Telegram.

### Nâng cấp từ bản đã cài trước ngày 26/11/2026

Trước khi upload bản website/API mới, mở phpMyAdmin, chọn đúng database và import `migrations/002-domain-consents.sql`. Kiểm tra đã có bảng `domain_consents`, sau đó mới upload nội dung `out/`. API mới sẽ từ chối tạo yêu cầu nếu bảng lưu bằng chứng đồng ý chưa được tạo.

## Kiểm tra nhanh

API chỉ nhận `POST` JSON. Một yêu cầu `GET` đến địa chỉ dưới đây phải trả HTTP `405` với JSON, không phải trang trắng:

```text
https://webs4v.vn/api/domains/check.php
https://webs4v.vn/api/orders.php
```

Nếu nhận lỗi `500`, mở cPanel → **Metrics → Errors** để xem log PHP. Không đặt token hoặc mật khẩu trong `public_html`, JavaScript hay repository.

## Vận hành

- Kết quả tên miền được cache trong MySQL: trạng thái 60 giây, giá/WHOIS 6 giờ.
- Kiểm tra tên miền bị giới hạn 30 lượt/phút/IP; đặt hàng 5 lượt/giờ/IP.
- Đơn và bằng chứng đồng ý được commit cùng một transaction vào MySQL trước khi gửi Telegram. Telegram lỗi không làm mất đơn; kiểm tra `notification_status = failed` để gửi lại thủ công.
- Khi bật Cloudflare, chỉ đặt `trust_cloudflare => true` sau khi đã chặn truy cập trực tiếp tới origin.
- Bật sao lưu tự động cho database và kiểm tra khả năng khôi phục định kỳ. Không lưu bản sao chứa token hoặc mật khẩu trong `public_html`.
- Bật xác thực hai lớp cho cPanel và Telegram; thay ngay token Telegram nếu token từng được gửi qua chat, email hoặc ảnh chụp màn hình.
