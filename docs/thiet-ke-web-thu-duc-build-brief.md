# Brief triển khai `/dich-vu/thiet-ke-web-thu-duc/`

Ngày triển khai: 20/11/2026  
Trạng thái: Self-authored under explicit creative delegation

## Vai trò của URL

- Từ khóa chính: `thiết kế web Thủ Đức`.
- Intent: giao dịch và so sánh nhà cung cấp tại khu vực.
- Hành động chính: gửi yêu cầu qua Zalo.
- Điều người đọc cần tin: Webs4V có địa chỉ thật tại Thủ Đức, có dự án live để kiểm tra và có quy trình, giá, đầu ra bàn giao rõ ràng.
- Phân biệt với `/blog/thiet-ke-website-thu-duc/`: trang dịch vụ trả lời ai cung cấp, cung cấp gì, giá và cách bắt đầu; bài blog giải thích cách lập yêu cầu, so sánh, nghiệm thu và vận hành.

## Kiến trúc thư mục

URL mới là một sibling trực tiếp trong `dich-vu/`, cùng cấp với các dịch vụ hiện có:

```text
dich-vu/
├── index.html
├── thiet-ke-website/
│   └── index.html
└── thiet-ke-web-thu-duc/
    └── index.html
```

Không đặt trang dưới `blog/` vì intent chính là giao dịch. Không đặt thành `dich-vu/thiet-ke-website/thu-duc/` vì yêu cầu URL là dạng `dich-vu/thiet-ke-web-...` và kiến trúc multi-page hiện tại đang dùng mỗi route như một input độc lập của Vite.

CSS dùng namespace `.local-web-*`, đồng thời tái sử dụng `.service-subnav`, `.service-page-cta`, header, footer, floating contact và cơ chế render HTML tĩnh hiện có. Chỉ tạo thêm URL địa phương khi có intent, thông tin phục vụ và bằng chứng riêng; không dùng cấu trúc này để sinh trang hàng loạt chỉ thay địa danh.

## Đánh giá đối thủ và hướng khác biệt

Nhóm trang cạnh tranh thường có exact-match URL/H1, bảng giá, quy trình, FAQ, portfolio và tín hiệu địa phương. Điểm yếu phổ biến là tuyên bố “chuẩn SEO” chung chung, ít nêu phần loại trừ, quyền sở hữu, cách nghiệm thu và bằng chứng dự án có thể tự kiểm tra.

Trang Webs4V ưu tiên:

1. Bốn website live thay cho số liệu hoặc testimonial không có nguồn.
2. Giá khởi điểm kèm phần chưa bao gồm.
3. Năm mốc có đầu ra rõ thay cho quy trình bán hàng chung chung.
4. Checklist SEO nền tảng và quyền sở hữu có thể nghiệm thu.
5. Địa chỉ, pháp nhân, MST và liên kết Google Maps nhất quán.

## Hành trình và cảm xúc

1. Nhận diện: người tìm thấy đúng dịch vụ tại Thủ Đức.
2. Tin cậy: dự án live và pháp nhân thay cho tuyên bố lớn.
3. Rõ lựa chọn: chọn loại website theo hành động của khách.
4. An tâm: giá, phần loại trừ, quy trình và nghiệm thu được trình bày cụ thể.
5. Quyết định: đặt lịch hoặc gửi yêu cầu qua Zalo.

Peak: phần “chuẩn SEO phải kiểm tra được”, nơi lời hứa tiếp thị được chuyển thành danh sách đầu ra nghiệm thu.  
Câu ghi nhớ: “Đây là trang cho tôi xem website thật rồi chỉ rõ thứ tôi sẽ nhận và sở hữu.”

## Ngữ pháp thiết kế

Chọn chaptered editorial kết hợp natural flow để giữ khả năng đọc, HTML ngữ nghĩa và tốc độ. Trang không dùng video scrub, pin dài hoặc nội dung chỉ xuất hiện sau tương tác vì đây là landing page SEO giao dịch. Hero dùng các mặt phẳng hình ảnh chồng lớp, nhưng nội dung và CTA vẫn là HTML đọc được ngay.

