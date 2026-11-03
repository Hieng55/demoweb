# Quy chuẩn typography Webs4V

Ngày kiểm tra: 04/11/2026  
Nguồn chuẩn: `style.css` và font được nạp trong các file HTML nguồn. Không lấy CSS đã build trong `out/` làm nơi chỉnh sửa.

## 1. Font đang sử dụng

| Vai trò | Font | Weight được nạp | Cách dùng hiện tại |
|---|---|---:|---|
| Font chính | Be Vietnam Pro | 300, 400, 500 | Nội dung, điều hướng, nút, form, tiêu đề sans-serif và phần lớn giao diện |
| Font nhấn | Lora | 400 thường, 400 italic | Câu nhấn, số lớn, tiêu đề phụ, chữ nghiêng mang tính biên tập |
| Fallback | `sans-serif`, `serif` | Theo hệ điều hành | Dùng khi Google Fonts chưa tải được |
| Tham chiếu chưa hoàn chỉnh | Inter | Không được nạp | Đang xuất hiện ở số thứ tự trong mobile menu; trình duyệt thực tế sẽ dùng `sans-serif` fallback |

Font được tải từ Google Fonts bằng URL:

```text
Be Vietnam Pro: 300, 400, 500
Lora: 400 thường và 400 italic
```

Không thêm font mới nếu chưa có lý do thương hiệu, ngân sách tải font và kiểm tra tiếng Việt. Nếu tiếp tục dùng `Inter`, phải nạp font rõ ràng; lựa chọn ưu tiên hiện tại là thay `Inter` bằng `Be Vietnam Pro` để giữ hệ thống hai font.

## 2. Biên độ font-size đang tồn tại trong code

| Phạm vi | Giá trị hiện tại | Vị trí/ý nghĩa |
|---|---:|---|
| Nhỏ nhất tuyệt đối | **7px** | `.tech-chip small`; nhãn phụ trong chip công nghệ |
| Nhãn nhỏ phổ biến | **8–11px** | Eyebrow, số thứ tự, metadata, nhãn card và ghi chú phụ |
| Nội dung dịch vụ | **13–17px** | Đoạn mô tả, card, danh sách, nội dung landing page |
| Nội dung bài blog | **16.5px desktop**, **16px mobile** | `.article-body` |
| Nội dung mobile toàn cục | **15.5px** | `body main p:not(.eyebrow)` và `li` trong media query mobile |
| Nút desktop | Thường **10–13px** | CTA, header, button và link dạng pill |
| Nút mobile | **14px** | Mobile baseline dùng `!important` cho các CTA chính |
| Semantic heading lớn nhất | Tối đa **154px** | Khai báo `h1: clamp(76px, 10vw, 154px)` trong hệ thống cũ |
| Chữ hiển thị trang trí | Tối đa **330px** | `.process__folio-number span`; số trang trí, không phải nội dung đọc liên tục |
| Pseudo-element trang trí | Tối đa **188–190px** | Chữ/số nền ở section quy trình và about |

Kết luận kỹ thuật:

- **Font nhỏ nhất đang khai báo là 7px.** Đây không phải chuẩn nên tiếp tục mở rộng.
- **Font lớn nhất là 330px**, nhưng chỉ dùng cho số trang trí. Cỡ chữ nội dung/heading có ngữ nghĩa lớn nhất được tìm thấy là 154px.
- `style.css` hiện có 976 khai báo `font-size`; 297 khai báo có giá trị cố định hoặc trần nhỏ hơn 12px. Nhiều khai báo là nhãn phụ, nhưng vẫn cần kiểm tra trực quan vì 7–10px có nguy cơ khó đọc.

## 3. Thang chữ được phép dùng cho phần mới

Đây là chuẩn áp dụng từ thời điểm bàn giao; không có nghĩa toàn bộ CSS cũ đã được refactor theo thang này.

| Token mục đích | Desktop | Mobile | Font/weight | Ghi chú |
|---|---:|---:|---|---|
| Body dài | 16–17px | 16px | Be Vietnam Pro 300/400 | Blog, chính sách, nội dung cần đọc lâu |
| Body landing page | 14–16px | 15.5–16px | Be Vietnam Pro 300/400 | Không dùng dưới 14px cho thông tin quan trọng |
| Small/metadata | 11–12px | 11.5–12px | Be Vietnam Pro 400/500 | Không dùng 7–10px cho thông tin cần đọc hoặc thao tác |
| Button/CTA | 13–14px | 14px | Be Vietnam Pro 500 | Vùng chạm tối thiểu 44px; ưu tiên 48px |
| H3/card title | 20–32px | 21–27px | Be Vietnam Pro 400/500 | Dùng `clamp()` khi cần |
| H2 section | 36–72px | 31–46px | Be Vietnam Pro hoặc Lora nhấn | Không ép mọi H2 thành cỡ lớn giống nhau |
| H1 landing page | 52–96px | 40–56px | Be Vietnam Pro 400/500 | Có thể nhỏ hơn nếu tiêu đề dài |
| H1 bài viết | 32–44px | 30–40px | Be Vietnam Pro 500 | Ưu tiên khả năng đọc hơn hiệu ứng |
| Display trang trí | Theo bố cục, tối đa hiện tại 330px | Giảm theo viewport | Lora 400 italic | Phải `aria-hidden` hoặc không mang thông tin duy nhất |

## 4. Quy tắc sử dụng

1. Be Vietnam Pro là font mặc định. Lora chỉ dùng để nhấn, không dùng cho đoạn văn dài.
2. Không thêm nội dung quan trọng nhỏ hơn 12px; mục tiêu cho body là tối thiểu 14px desktop và 15.5px mobile.
3. Không dùng `font-weight` 600/700 nếu font chưa được nạp weight tương ứng; trình duyệt sẽ tự tổng hợp và có thể làm chữ sai thiết kế.
4. H1/H2 phải co giãn bằng `clamp()` hoặc breakpoint, nhưng giới hạn trên phải phù hợp độ dài tiếng Việt.
5. Chữ trang trí lớn không được là cách duy nhất truyền đạt thông tin và không được gây tràn ngang ở viewport 320px.
6. CTA trên mobile dùng tối thiểu 14px và vùng chạm tối thiểu 44 × 44px; ưu tiên 48 × 48px.
7. Không dùng `!important` cho font-size mới nếu có thể giải quyết bằng cascade hoặc selector rõ ràng.
8. Khi sửa typography, kiểm tra ít nhất các viewport 320px, 360px, tablet và desktop; kiểm tra cả zoom 200%.

## 5. Backlog typography

| Mức độ | Việc cần làm | Lý do |
|---|---|---|
| P1 | Rà soát các selector 7–10px và nâng thông tin cần đọc lên 11.5–12px | Khả năng đọc và accessibility |
| P1 | Kiểm tra các H1/H2 có trần trên 100px ở độ rộng trung gian | Ngăn tiêu đề lấn bố cục hoặc tạo khoảng trắng bất thường |
| P2 | Thay hai khai báo `Inter` bằng Be Vietnam Pro hoặc nạp Inter có chủ đích | Tránh font fallback không nhất quán |
| P2 | Tách token typography thành CSS custom properties | Giảm 976 khai báo phân tán và hạn chế lệch hệ thống |

## 6. Cách tìm nhanh trong code

```powershell
rg -n "font-family|font-size" style.css
rg -n "font-size:\s*(7|8|9|10)px" style.css
rg -n "font-family:\s*Inter" style.css
```

