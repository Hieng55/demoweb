# Bàn giao website Webs4V

Ngày cập nhật: 04/11/2026  
Repository: `https://github.com/Hieng55/demoweb.git`  
Nhánh chính: `main`  
Tên miền chính: `https://webs4v.vn/`

## 1. Tóm tắt tình trạng

Website **đạt phần lớn yêu cầu SEO nền tảng**, nhưng **chưa đạt toàn bộ rule** trong `docs/seo-website-rules.md`.

Các phần đang tốt:

- 23 URL nguồn có thể index và một trang 404.
- 23/23 URL indexable có title, meta description, canonical, `lang="vi"`, viewport và Open Graph cơ bản.
- Mỗi file HTML nguồn có đúng một H1.
- Title và meta description không bị trùng giữa các URL.
- 23 canonical khớp đầy đủ với 23 URL trong sitemap.
- `robots.txt` cho phép crawl và khai báo sitemap đúng.
- 14 trang có JSON-LD; toàn bộ JSON-LD hiện parse hợp lệ.
- Không phát hiện ảnh thiếu thuộc tính `alt`; ảnh trang trí dùng `alt=""` ở nhiều vị trí.
- Internal link nguồn không có link gãy thật. `/duong-dan/` xuất hiện trong bài SEO chỉ là ví dụ code, không phải link điều hướng.
- Form có label, trường bắt buộc, consent, honeypot, cooldown và trạng thái `aria-live`.
- Build production bằng Vite thành công tại thời điểm bàn giao.

Các phần chưa đạt hoặc chưa thể xác minh:

- Chưa có dữ liệu Search Console, GA4, CRM hoặc server log trong repo để xác minh index, traffic, conversion và hiệu quả local SEO thực tế.
- Chưa thực hiện browser audit/Lighthouse trên website live trong lần bàn giao này.
- Chưa có test tự động, lint hoặc script SEO audit được lưu trong `package.json`.

## 2. Kiến trúc code

| Thành phần | Hiện trạng |
|---|---|
| Build tool | Vite 5, cấu hình multi-page trong `vite.config.js` |
| UI/runtime | HTML tĩnh kết hợp React 18 qua `src/main.jsx`; GSAP cho animation; Three.js cho trải nghiệm WebGL |
| CSS | Một file lớn `style.css`; source of truth của giao diện |
| JavaScript chính | `main.js`; bản nhẹ `main-lite.js`; icon helper tại `ui-icons.js` |
| Nội dung | HTML theo thư mục route; blog và trang dịch vụ có URL vật lý riêng |
| Build output | `out/`; thư mục này đang được track trong Git |
| Form backend | Google Apps Script trong `apps-script/Code.gs`; chuyển thông báo qua Telegram theo cấu hình Script Properties |
| SEO rule | `docs/seo-website-rules.md` |
| Design system | `docs/design-system.md` |
| Typography | `docs/typography-system.md` |

Các thư mục quan trọng:

```text
blog/                    Bài viết và trang danh sách blog
dich-vu/                 Trang dịch vụ
src/                     React entry và component/page dùng chung
image/, video/           Tài nguyên media nguồn
public/                  robots.txt và sitemap.xml
out/                     Kết quả npm run build để deploy
apps-script/             Backend nhận form
docs/                    Rule SEO và tài liệu bàn giao
```

## 3. Build và deploy

### Chạy local

```powershell
npm install
npm run dev
```

### Build production

```powershell
npm run build
```

Kết quả phải xuất hiện trong `out/`. Sau build cần kiểm tra `git status` vì `out/` được track.

### Deploy hiện tại

`.cpanel.yml` copy toàn bộ `out/.` tới:

```text
/home/websvvn/public_html/
```

Đẩy GitHub **không đồng nghĩa website live đã được cập nhật**. Cần chạy deployment trong cPanel theo workflow của hosting.

`firebase.json` hiện trỏ tới thư mục `dist`, trong khi Vite xuất ra `out`. Firebase không phải workflow deploy chính và cấu hình này có thể gây nhầm lẫn; không dùng nếu chưa thống nhất lại output.

## 4. Thông tin thương hiệu đang dùng

| Trường | Giá trị |
|---|---|
| Pháp nhân | CÔNG TY TNHH CÔNG NGHỆ WEBS4V.VN |
| Thương hiệu | Webs4V |
| Mã số thuế | 0319765116 |
| Website | https://webs4v.vn/ |
| Email | support@webs4v.vn |
| Zalo/điện thoại | 0364 003 638 |
| Zalo URL | https://zalo.me/4281504816084070079 |
| Địa chỉ | 1104 Đ. Phạm Văn Đồng, Thủ Đức, TP. Hồ Chí Minh |

Không nhầm `Webs4V` với `Web4s`. Trụ sở thật ở Thủ Đức; Dĩ An, Nhơn Trạch, Long Thành và Biên Hòa là khu vực phục vụ, không phải chi nhánh.

## 5. Kết quả audit SEO source ngày 04/11/2026

### 5.1. Pass

| Hạng mục | Kết quả |
|---|---:|
| File HTML nguồn | 24, gồm 23 URL indexable + 404 |
| URL trong sitemap | 23 |
| Canonical khớp sitemap | 23/23 |
| H1 | 1 H1/file |
| Title/meta description trùng | 0 |
| JSON-LD hợp lệ | 14 block trên 14 trang |
| Ảnh thiếu `alt` | 0 |
| Internal link gãy thật | 0 |
| `target="_blank"` ngoài site thiếu `noopener` | 0 |
| Build Vite | Pass |

### 5.2. Cần xử lý

#### P1 — Ưu tiên cao

1. **Form chưa xác nhận thành công từ server**  
   `main.js` và `main-lite.js` gửi Google Apps Script bằng `mode: 'no-cors'`, sau đó hiển thị thành công ngay khi `fetch` không ném lỗi. Response opaque không chứng minh Apps Script đã lưu/chuyển lead. Điều này chưa đáp ứng rule chỉ ghi conversion sau trạng thái thành công được xác nhận.

2. **Tracking conversion chưa có loader trong source**  
   Code có gọi `window.gtag` nếu tồn tại và phát custom event `webs4v:conversion`, nhưng không tìm thấy đoạn nạp GA4/Google Tag trong source. Có thể tracking được chèn ngoài repo, nhưng người tiếp quản phải xác minh trên website live trước khi tin dữ liệu conversion.

3. **122/127 ảnh thiếu ít nhất một trong hai thuộc tính `width`/`height`**  
   CSS có thể giữ kích thước cho một số ảnh, nhưng việc thiếu intrinsic dimensions vẫn tạo rủi ro CLS. Ưu tiên ảnh above-the-fold, card dự án, ảnh dịch vụ và logo trước.

4. **Typography quá nhỏ ở nhiều selector phụ**  
   Cỡ nhỏ nhất là 7px; nhiều nhãn dùng 8–10px. Xem `docs/typography-system.md`. Cần kiểm tra trực quan và nâng những nội dung phải đọc, không chỉ sửa hàng loạt theo con số.

5. **Một tuyên bố marketing quá tuyệt đối**  
   Bài `blog/website-nha-hang-nen-uu-tien-gi/` có câu “Giúp nhà hàng tăng trưởng lượng khách đều đặn mỗi ngày”. Câu này không có bằng chứng và xung đột với rule không hứa kết quả ngoài khả năng kiểm soát. Nên đổi thành mô tả khả năng hỗ trợ tìm kiếm/đặt bàn.

#### P2 — Quan trọng nhưng không chặn phát hành

1. 8 title nằm ngoài khoảng tham khảo 30–60 ký tự; 5 meta description nằm ngoài khoảng tham khảo 120–170 ký tự. Đây không phải lỗi xếp hạng tự động; cần ưu tiên theo CTR và SERP thực tế, không cắt máy móc.
2. Hai liên kết mở chính sách bảo mật trong tab mới chưa có `rel="noopener noreferrer"`. Vì là URL cùng domain nên rủi ro thấp, nhưng nên đồng nhất rule.
3. CSS tham chiếu `Inter` nhưng HTML không nạp font này; hiện trình duyệt dùng fallback.
4. `style.css` có 976 khai báo `font-size`, cho thấy typography phân tán và khó bảo trì.
5. Một số trang dịch vụ chưa có Service/WebPage schema. Đây không phải lỗi bắt buộc; chỉ thêm khi markup phản ánh đúng nội dung nhìn thấy và có lợi ích bảo trì rõ ràng.
6. Chưa có `og:image` thống nhất cho mọi landing page. Nên bổ sung khi có ảnh chia sẻ đúng tỷ lệ và có thể duy trì lâu dài.

## 6. Nội dung và chiến lược local hiện tại

- Trụ cột địa phương chính: `/blog/thiet-ke-website-thu-duc/`.
- Bài mở rộng thị trường phía Đông: `/blog/thiet-ke-website-vung-ven-phia-dong/`.
- Thứ tự thử nghiệm nội dung: Nhơn Trạch → Long Thành → Dĩ An; Biên Hòa triển khai sau vì cạnh tranh cao hơn.
- Không tạo hàng loạt trang chỉ thay tên địa phương. Chỉ tách URL khi có intent, nội dung, bằng chứng và dữ liệu Search Console riêng.
- Các bài blog đã được bổ sung ngữ cảnh local và internal link về cụm nội dung địa phương.
- Tiêu đề hiển thị phải tự nhiên với người đọc; không liệt kê địa danh hoặc từ khóa một cách lộ liễu chỉ để SEO.

## 7. Form liên hệ và dữ liệu

Form tồn tại ở trang chủ và `/lien-he/`.

Luồng hiện tại:

```text
Người dùng gửi form
→ main.js/main-lite.js tạo payload + UTM
→ POST no-cors tới Google Apps Script
→ Apps Script kiểm tra dữ liệu/rate limit
→ gửi Telegram theo Script Properties
```

Không commit Telegram bot token hoặc chat ID vào repo. Chúng phải nằm trong Google Apps Script Properties.

Việc cần kiểm tra thủ công sau mỗi deploy:

1. Gửi một lead thật từ trang chủ.
2. Gửi một lead thật từ trang liên hệ.
3. Xác nhận Telegram nhận đủ trường và UTM.
4. Kiểm tra spam/honeypot và cooldown.
5. Kiểm tra event conversion chỉ ghi nhận sau khi backend xác nhận thành công — hiện chưa đạt.

## 8. Checklist cho người tiếp quản

Trước khi sửa:

- Đọc `docs/seo-website-rules.md`.
- Đọc `docs/design-system.md`.
- Đọc `docs/typography-system.md`.
- Chạy `git status`; không ghi đè thay đổi chưa rõ chủ sở hữu.
- Chỉnh source, không chỉnh trực tiếp `out/`.

Trước khi commit:

```powershell
npm run build
git diff --check
git status --short
```

Sau khi build:

- Kiểm tra route mới có trong `vite.config.js`.
- Kiểm tra canonical và sitemap nếu thêm/xóa URL.
- Parse JSON-LD nếu có sửa schema.
- Kiểm tra mobile 320px/360px và reduced motion nếu sửa giao diện.
- Gửi thử form nếu đụng tới form hoặc JavaScript.
- Commit cả source và thay đổi tương ứng trong `out/`.
- Push `main`, sau đó deploy cPanel nếu cần cập nhật website live.

## 9. Backlog đề xuất theo thứ tự

1. Sửa form để backend trả response có thể xác nhận và chỉ ghi conversion khi nhận `ok: true`.
2. Xác minh hoặc cài GA4/Google Tag; lập danh sách event chính: Zalo click, email click, form success, map click.
3. Thêm intrinsic dimensions cho ảnh quan trọng, sau đó đo CLS trên website live.
4. Nâng các nhãn 7–10px có giá trị đọc; chuẩn hóa typography token.
5. Gỡ tuyên bố “tăng trưởng lượng khách đều đặn mỗi ngày”.
6. Rà title/meta bằng dữ liệu Search Console thay vì giới hạn ký tự máy móc.
7. Đồng nhất `rel` cho hai liên kết privacy mở tab mới.
8. Xử lý tham chiếu Inter hoặc loại bỏ font này.
9. Thêm script audit source vào repo để tự động kiểm tra H1, canonical, schema, sitemap, alt và link nội bộ.
10. Chọn một workflow hosting chính; cập nhật hoặc bỏ cấu hình Firebase `dist` nếu không còn dùng.

## 10. Giới hạn của lần audit

Audit này dựa trên source local và build Vite. Nó không thay thế:

- Google Search Console URL Inspection;
- crawl website live và kiểm tra HTTP headers/status thực tế;
- GA4/CRM/lead reconciliation;
- Lighthouse/Core Web Vitals trên thiết bị thật;
- kiểm tra bảo mật backend và quyền truy cập hosting;
- đánh giá thứ hạng hoặc chất lượng lead theo thời gian.

Do đó trạng thái đúng là: **SEO nền tảng tốt, có thể phát hành, nhưng còn backlog P1 trước khi xem hệ thống đo lường và trải nghiệm là hoàn chỉnh.**
