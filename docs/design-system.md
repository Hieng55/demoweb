# Webs4V Design System

Ngày cập nhật: 04/11/2026  
Phạm vi: website `webs4v.vn`  
Nguồn triển khai hiện tại: `style.css`, HTML theo route và component trong `src/`

Tài liệu này là chuẩn phong cách tổng thể để các trang mới không bị lệch màu, chữ, khoảng cách, liquid glass, animation hoặc cách trình bày nội dung. Chi tiết typography nằm tại `docs/typography-system.md`.

## 1. Tinh thần thiết kế

Webs4V dùng phong cách **editorial technology kết hợp liquid glass**:

- Nền sáng xanh lạnh, chữ xanh mực và điểm nhấn xanh dương–tím.
- Bố cục nhiều khoảng thở, tiêu đề lớn nhưng nội dung phải dễ đọc.
- Khối glass có chiều sâu bằng nền bán trong suốt, viền sáng, blur và shadow mềm.
- Lora italic tạo cảm giác biên tập/con người; Be Vietnam Pro giữ phần thông tin rõ ràng, hiện đại.
- Animation có chủ đích, chậm vừa phải và không che hoặc trì hoãn nội dung.
- Website phải cảm giác cao cấp nhưng gần gũi, không giống dashboard SaaS khô cứng và không dùng hiệu ứng chỉ để phô diễn.

Ba từ khóa định hướng:

```text
Rõ ràng · Có chiều sâu · Tin cậy
```

## 2. Logo và nhận diện

### Tên thương hiệu

- Viết đúng: **Webs4V**.
- Tên pháp lý: **CÔNG TY TNHH CÔNG NGHỆ WEBS4V.VN**.
- Không viết thành `Web4s`, `Webs4v`, `WEBS4V` trong câu thông thường, trừ tên pháp lý hoặc ngữ cảnh buộc viết hoa.

### Logo

- Logo nguồn chính nằm trong `image/logo/`.
- Trên nền sáng dùng logo màu gốc.
- Không tự đổi màu, kéo méo, thêm glow mạnh hoặc đặt logo lên nền làm mất tương phản.
- Luôn giữ tỷ lệ ảnh; khi thêm logo mới phải khai báo `width` và `height` hoặc `aspect-ratio` ổn định.
- Logo có link về trang chủ phải có accessible name, ví dụ `aria-label="Webs4V — Trang chủ"`.

## 3. Hệ màu

### 3.1. Palette cốt lõi

| Token ý nghĩa | Giá trị hiện tại | Dùng cho |
|---|---|---|
| Page background | `#edf2ff` | Nền toàn website |
| Ink/title | `#20294d` | H1–H4, nội dung nhấn, icon chính |
| Body text | `rgba(32, 41, 77, .68)` | Đoạn văn và mô tả |
| Label text | `rgba(32, 41, 77, .62)` | Eyebrow, metadata, chú thích |
| Line | `rgba(32, 41, 77, .18)` đến `.20` | Divider và border trên nền sáng |
| Primary blue | `#1264d8` | Link, focus, active state, CTA |
| Bright blue | `#0878ff` / `#1474ee` | Điểm sáng gradient và hover |
| Deep navy | `#071a44` / `#10285c` / `#18295d` | Nền tối, CTA và section đặc biệt |
| Brand violet | `#7565bd` | Gradient nhấn và section chuyển sắc |
| Cyan highlight | `#8de1ff` / `#3d9cff` | Glow, process, trạng thái công nghệ |
| On-dark text | `#f4f7ff` | Chữ chính trên nền tối |
| On-dark muted | `rgba(222, 234, 255, .70)` | Mô tả trên nền tối |
| Success green | `#159467` / `#28a861` | Trạng thái thành công hoặc đang mở |
| White surface | `rgba(249, 251, 255, .68–.78)` | Card/section glass sáng |

### 3.2. Gradient thương hiệu

Gradient chữ và nhấn chính:

```css
linear-gradient(100deg, #18295d 8%, #1264d8 48%, #7565bd 78%, #18295d 100%)
```

Gradient CTA xanh:

```css
linear-gradient(135deg, #071a44, #0a4ed2 58%, #0878ff)
```

Gradient nền tối xanh–tím:

```css
linear-gradient(145deg, #111d45, #243f7d 58%, #6854ad)
```

Không tạo thêm gradient mới nếu palette cốt lõi đã giải quyết được. Mỗi section chỉ nên có một hướng gradient chính.

### 3.3. Màu theo nhóm trang

| Nhóm | Accent | Secondary | Ghi chú |
|---|---|---|---|
| Website chung | `#1264d8` | `#7565bd` | Mặc định toàn site |
| Google Business | `#3f6fe8` | Navy cốt lõi | Chỉ dùng trong trang GBP |
| SEO Google | `#159467` | `#2765df` | Xanh lá biểu thị tăng trưởng nhưng không thay màu thương hiệu toàn site |
| Tuyển dụng | `#3267d6` | `#7559cb` | Xanh–tím mềm |
| Process/technology | `#3d9cff` | `#8de1ff` | Glow/cyan trên nền navy |
| Editorial warm | `#8b4b32` | `#252621`, nền `#f8f5ee` | Chỉ dùng cho gallery/pricing mang cảm giác tạp chí; không trộn trực tiếp với section glass xanh |

Quy tắc:

1. Mỗi trang chọn một accent chính; accent phụ chỉ hỗ trợ, không tranh vai trò CTA.
2. Không dùng màu xanh lá cho CTA chung nếu không biểu thị trạng thái hoặc chủ đề SEO.
3. Màu đỏ/nâu không dùng cho lỗi hệ thống; lỗi phải có token riêng khi triển khai.
4. Kiểm tra contrast thực tế; opacity thấp không được dùng cho thông tin quan trọng.

## 4. Typography

Tóm tắt; xem đầy đủ tại `docs/typography-system.md`.

| Vai trò | Font | Weight |
|---|---|---:|
| Giao diện và nội dung | Be Vietnam Pro | 300, 400, 500 |
| Nhấn biên tập | Lora | 400 regular/italic |

Biên độ code hiện tại:

- Nhỏ nhất: `7px` — cần đưa vào backlog, không dùng cho nội dung mới.
- Body blog: `16.5px` desktop, `16px` mobile.
- Body landing page: chủ yếu `14–17px`.
- Semantic heading lớn nhất: `154px`.
- Display trang trí lớn nhất: `330px`.

Chuẩn phần mới:

- Body dài: 16–17px.
- Body landing: 14–16px desktop; 15.5–16px mobile.
- Label/metadata: 11–12px.
- CTA: 13–14px desktop; 14px mobile.
- Không dùng Lora cho đoạn văn dài.

## 5. Spacing

### 5.1. Thang khoảng cách khuyến nghị

```text
4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 112px
```

Không bắt buộc thay ngay toàn bộ giá trị cũ, nhưng code mới nên chọn từ thang này hoặc dùng `clamp()` giữa hai mốc của thang.

### 5.2. Khoảng cách section

Token hiện tại:

```css
--section-space: clamp(72px, 8vw, 112px);
```

- Section landing page: 72–112px desktop.
- Section mobile: khoảng 52–72px tùy mật độ nội dung.
- Khoảng cách giữa eyebrow và heading: 12–18px.
- Khoảng cách heading tới lead: 20–30px.
- Card padding: 20–42px; section shell lớn: 48–100px.

Không giảm spacing chỉ để nhồi thêm nội dung vào màn hình đầu tiên.

## 6. Layout và container

| Thành phần | Chuẩn hiện tại |
|---|---|
| Độ rộng toàn site | Tối đa khoảng `1680px` |
| Shell nội dung lớn | `min(1480px, calc(100% - clamp(32px, 6vw, 104px)))` |
| Bài viết | `min(1160px, calc(100% - clamp(32px, 7vw, 112px)))` |
| Header glass | Tối đa `1140px` |
| Viewport tối thiểu | `320px` |

Grid thường dùng:

- Desktop: 2 cột hero hoặc 3 cột card.
- Tablet: 2 cột hoặc chuyển hero về 1 cột.
- Mobile: 1 cột; carousel ngang chỉ khi nội dung thực sự cần so sánh/duyệt.

Breakpoint đang xuất hiện nhiều nhất:

```text
1180/1100/1080/1050px · 860px · 760px · 620px · 380px
```

Chuẩn code mới nên ưu tiên:

- `1080px`: desktop nhỏ/tablet ngang.
- `860px`: tablet và layout 2→1 cột.
- `760px`: mobile composition.
- `380px`: thiết bị rất hẹp.

## 7. Border radius

| Nhóm | Radius |
|---|---:|
| Input/control nhỏ | 11–16px |
| Card nhỏ | 18–24px |
| Card/visual lớn | 24–38px |
| Section shell | 30–58px hoặc `clamp()` |
| Pill/button | `999px` |
| Circle/icon | `50%` |

Quy tắc:

- Một component chỉ dùng tối đa hai cấp radius: vỏ và phần tử con.
- Section lớn không dùng radius nhỏ hơn card bên trong.
- Mobile thường giảm radius 4–12px so với desktop.
- Không dùng pill cho card nội dung; pill dành cho button, chip và control ngắn.

## 8. Liquid glass

### 8.1. Glass sáng chuẩn

```css
background: rgba(249, 251, 255, .70);
border: 1px solid rgba(255, 255, 255, .86);
box-shadow: 0 28px 80px rgba(38, 58, 119, .08), inset 0 1px 0 #fff;
backdrop-filter: blur(18px) saturate(1.2);
```

### 8.2. Glass nổi mạnh

```css
background:
  radial-gradient(ellipse at 50% -20%, rgba(255,255,255,.95), transparent 70%),
  linear-gradient(112deg, rgba(255,255,255,.84), rgba(246,249,255,.72) 48%, rgba(240,246,255,.78));
border: 1px solid rgba(255,255,255,.95);
box-shadow: 0 20px 50px -12px rgba(18,42,110,.20), inset 0 1px 0 rgba(255,255,255,.90);
backdrop-filter: blur(24px) saturate(1.3);
```

### 8.3. Nguyên tắc liquid glass

1. Glass phải có viền sáng và shadow để tách khỏi nền; chỉ giảm opacity sẽ làm component bị chìm.
2. CTA chính trên nền sáng dùng gradient đặc, không dùng glass quá trong.
3. Blur khuyến nghị 18–26px; saturation 1.15–1.45.
4. Không chồng quá ba lớp glass trong cùng một vùng nhìn.
5. Trên mobile, giảm blur/shadow nếu ảnh hưởng hiệu năng nhưng giữ contrast.
6. Có fallback nền màu bán trong suốt nếu `backdrop-filter` không hoạt động.

## 9. Shadow và chiều sâu

Ba cấp độ:

```css
/* Subtle card */
box-shadow: 0 14px 36px rgba(38,58,119,.06);

/* Standard glass section */
box-shadow: 0 28px 80px rgba(38,58,119,.08), inset 0 1px 0 #fff;

/* Hero/dark emphasis */
box-shadow: 0 34px 84px rgba(24,61,137,.23), inset 0 1px 0 rgba(255,255,255,.18);
```

- Hover được phép tăng blur/y-offset nhẹ, không đổi hướng nguồn sáng.
- Tránh shadow đen đặc; dùng navy có opacity thấp.
- Glow cyan chỉ dùng ở process/technology hoặc trạng thái phát sáng có chủ đích.

## 10. Button và CTA

### Primary CTA

- Nền gradient navy → blue.
- Chữ trắng.
- Chiều cao desktop thường 54–62px; mobile tối thiểu 48px.
- Radius pill `999px`.
- Có label rõ nghĩa và icon mũi tên ở cuối nếu cần.

### Secondary CTA

- Nền glass hoặc trắng bán trong suốt.
- Border xanh/navy opacity thấp.
- Chữ `#20294d` hoặc primary blue.

### Text link

- Trong bài viết: xanh `#155fc4/#1264d8`, có underline và offset.
- Trong navigation/card: có thể bỏ underline nếu affordance đã rõ và có focus state.

### Trạng thái

- Hover: `translateY(-2px)` hoặc tăng shadow nhẹ.
- Active/touch: scale tối đa `0.99`, không làm layout nhảy.
- Focus visible: outline 3px `rgba(40,105,224,.55)`, offset 3–4px.
- Disabled: giảm tương phản nhưng vẫn đọc được; không chỉ dùng opacity cực thấp.

Không dùng CTA chung chung như “Xem thêm” nếu có thể mô tả đích cụ thể.

## 11. Card và section pattern

### Card sáng

- Nền trắng/glass 0.60–0.76.
- Border navy/blue opacity 0.10–0.16 hoặc white 0.82–0.88.
- Radius 20–30px.
- Shadow subtle.

### Card tối

- Gradient navy hoặc navy–violet.
- Chữ chính on-dark, mô tả on-dark-muted.
- Border trắng 0.14–0.20.
- Không đặt text body opacity thấp hơn mức đọc được.

### Article callout

- Nền glass sáng.
- Radius 24px.
- Padding 24–38px.
- Label accent xanh 11–12px uppercase.

### Section CTA

- Có một thông điệp chính và một hành động chính.
- Không đặt nhiều hơn hai CTA ngang hàng nếu không có phân cấp rõ.
- Trên mobile chuyển về một cột và CTA chiếm toàn chiều rộng khả dụng.

## 12. Hình ảnh và media

Phong cách hình ảnh:

- Ưu tiên ảnh dự án, đội ngũ, không gian và sản phẩm thật.
- Hình minh họa công nghệ dùng xanh lạnh, navy và ánh sáng mềm.
- Tránh stock photo quá bóng bẩy hoặc không liên quan tới bằng chứng nội dung.
- Gallery editorial có thể dùng palette warm riêng nhưng phải nằm trong section tách biệt.

Quy tắc kỹ thuật:

1. Ảnh truyền tải thông tin phải có `alt` mô tả đúng; ảnh trang trí dùng `alt=""`.
2. Khai báo `width` và `height` hoặc `aspect-ratio` để hạn chế CLS.
3. Ảnh dưới fold dùng `loading="lazy"`; ảnh LCP không lazy-load tùy tiện.
4. Dùng `object-fit: cover` cho khung ảnh; không cắt mất chủ thể quan trọng.
5. Video nền phải có poster/fallback và tôn trọng reduced motion.
6. Không nhúng ảnh chỉ có chữ nếu nội dung đó cần crawl, đọc hoặc accessibility.

## 13. Icon

- Dùng hệ icon hiện có qua `ui-icons.js`, Lucide/Morphicons hoặc SVG đồng bộ.
- Stroke/weight phải nhất quán trong cùng một component.
- Icon chỉ trang trí dùng `aria-hidden="true"`.
- Nút chỉ có icon phải có `aria-label`.
- Không trộn emoji vào CTA giao diện chính.

Kích thước tham khảo:

```text
Inline: 16–18px
Button: 18–22px
Feature icon: 24–32px
Icon badge: khung 42–56px
```

## 14. Motion

Easing đặc trưng:

```css
cubic-bezier(.22, 1, .36, 1)
```

Thời lượng:

| Loại | Thời lượng |
|---|---:|
| Hover/focus nhỏ | 180–250ms |
| Card/layout transition | 300–550ms |
| Reveal/image transform | 600–900ms |
| Loader/cinematic transition | Tối đa khoảng 950ms mỗi pha |

Quy tắc:

1. Animation không được trì hoãn nội dung hoặc CTA.
2. Chuyển động nên dùng `transform` và `opacity`, tránh animate layout nặng nếu không cần.
3. Hover phải có hành vi tương đương cho touch/focus khi chức năng phụ thuộc vào nó.
4. `prefers-reduced-motion: reduce` phải tắt hoặc rút ngắn animation không thiết yếu.
5. Không tạo thêm loader dài; người dùng phải truy cập nội dung càng sớm càng tốt.

## 15. Responsive và mobile

- Mobile không chỉ thu nhỏ desktop; có thể đổi thứ tự, giảm chi tiết trang trí và chuyển CTA sang full width.
- Cỡ chữ body mobile tối thiểu theo chuẩn typography.
- Tap target tối thiểu 44 × 44px; ưu tiên 48px.
- Sticky header/chat/CTA không được che form hoặc nội dung.
- Không có cuộn ngang ngoài ý muốn ở 320px và 360px.
- Kiểm tra bàn phím ảo với form trên iOS và Android.
- Safe area dùng `env(safe-area-inset-*)` cho thành phần fixed sát cạnh màn hình.

## 16. Accessibility

1. Mỗi trang có đúng một H1 và heading phân cấp theo nội dung.
2. Mọi control có accessible name và focus visible.
3. Không truyền đạt trạng thái chỉ bằng màu.
4. Text phải giữ contrast đủ đọc trên glass, ảnh và gradient.
5. Form dùng label thật, error/status có `aria-live` khi phù hợp.
6. Nội dung chính vẫn đọc và thao tác được khi animation hoặc JavaScript lỗi.
7. Kiểm tra keyboard, zoom 200%, reduced motion và thiết bị cảm ứng thật.

## 17. Giọng nội dung trong giao diện

- Viết trực tiếp, rõ lợi ích và giới hạn; không phô trương bằng từ “tốt nhất”, “đảm bảo top” hoặc kết quả không kiểm soát được.
- Tiêu đề card phải giống một bài biên tập dành cho người đọc, không liệt kê từ khóa/địa danh lộ ý đồ SEO.
- CTA nói rõ hành động và kết quả tiếp theo.
- Microcopy form phải cho biết dữ liệu được dùng để làm gì.
- Không để thuật ngữ kỹ thuật chiếm chỗ của câu trả lời mà khách hàng cần.

## 18. Token đề xuất cho lần refactor tiếp theo

CSS hiện mới token hóa một phần. Khi refactor, ưu tiên gom về:

```css
:root {
  --color-page: #edf2ff;
  --color-ink: #20294d;
  --color-body: rgba(32, 41, 77, .68);
  --color-label: rgba(32, 41, 77, .62);
  --color-line: rgba(32, 41, 77, .18);
  --color-primary: #1264d8;
  --color-primary-bright: #0878ff;
  --color-navy: #071a44;
  --color-violet: #7565bd;
  --color-cyan: #3d9cff;
  --color-surface: rgba(249, 251, 255, .72);
  --color-on-dark: #f4f7ff;
  --color-on-dark-muted: rgba(222, 234, 255, .70);

  --radius-control: 14px;
  --radius-card: 24px;
  --radius-section: 42px;
  --radius-pill: 999px;

  --shadow-card: 0 14px 36px rgba(38, 58, 119, .06);
  --shadow-section: 0 28px 80px rgba(38, 58, 119, .08), inset 0 1px 0 #fff;
  --ease-out-expo: cubic-bezier(.22, 1, .36, 1);

  --space-section: clamp(72px, 8vw, 112px);
  --shell-wide: min(1480px, calc(100% - clamp(32px, 6vw, 104px)));
  --shell-article: min(1160px, calc(100% - clamp(32px, 7vw, 112px)));
}
```

Không refactor token hàng loạt nếu chưa có visual regression check; thay từng nhóm component và so sánh desktop/mobile trước khi merge.

## 19. Checklist trước khi duyệt giao diện mới

- [ ] Dùng đúng palette cốt lõi hoặc accent đã được xác định cho nhóm trang.
- [ ] Không tạo thêm font hoặc font-weight chưa được nạp.
- [ ] Body, label và CTA đạt cỡ chữ tối thiểu.
- [ ] Radius của section/card/control có phân cấp hợp lý.
- [ ] Liquid glass có contrast, border và shadow; không bị chìm vào nền.
- [ ] CTA chính nổi bật hơn CTA phụ.
- [ ] Ảnh có alt và intrinsic dimensions.
- [ ] Không cuộn ngang ở 320px/360px.
- [ ] Keyboard focus và reduced motion hoạt động.
- [ ] Nội dung vẫn hiểu được khi bỏ animation.
- [ ] Build production thành công.
- [ ] So sánh trực quan ít nhất một màn desktop và một màn mobile trước khi deploy.

## 20. Những việc không được làm

- Không thêm một màu accent mới chỉ cho một component nhỏ.
- Không dùng glass quá trong khiến chữ/viền chìm.
- Không dùng chữ 7–10px cho thông tin cần đọc.
- Không làm mọi section đều gradient, glow và animation cùng lúc.
- Không dùng Lora italic cho đoạn văn dài hoặc form.
- Không thay icon bằng ký tự Unicode/emoji thiếu nhất quán.
- Không chỉnh trực tiếp file trong `out/`; luôn sửa source rồi chạy build.
- Không đánh đổi khả năng đọc, tốc độ hoặc thao tác để lấy hiệu ứng thị giác.

