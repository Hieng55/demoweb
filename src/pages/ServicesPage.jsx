import React from 'react';

const packages = [
  {
    id: 'website-doanh-nghiep',
    name: 'Doanh nghiệp cơ bản',
    price: '3.000.000đ',
    note: 'Chi phí từ',
    fit: 'Cần website giới thiệu công ty và nhận liên hệ',
    description: 'Dành cho doanh nghiệp mới cần một website chuyên nghiệp để giới thiệu thương hiệu, dịch vụ và nhận liên hệ.',
    features: ['05 trang thiết kế riêng', 'Giao diện responsive', 'SEO nền tảng', 'Quản trị WordPress', 'Form liên hệ & kết nối Zalo'],
  },
  {
    id: 'website-blog',
    name: 'Doanh nghiệp + Blog',
    price: '6.000.000đ',
    note: 'Trọn gói tham khảo',
    fit: 'Muốn làm nội dung và phát triển SEO lâu dài',
    description: 'Phù hợp với doanh nghiệp muốn phát triển nội dung, chia sẻ kiến thức và xây dựng nguồn truy cập lâu dài.',
    features: ['Toàn bộ gói Doanh nghiệp', 'Chuyên mục Blog / Tin tức', 'Trang bài viết chuẩn SEO', 'Quản lý danh mục bài viết', 'Hướng dẫn đăng nội dung'],
  },
  {
    id: 'website-ban-hang',
    name: 'Website sản phẩm',
    price: '7.000.000đ',
    note: 'Chi phí từ',
    popular: true,
    fit: 'Cần trưng bày nhiều sản phẩm để khách hỏi mua',
    description: 'Dành cho doanh nghiệp cần trưng bày nhiều sản phẩm, giúp khách tìm kiếm, lọc và gửi yêu cầu mua hàng.',
    features: ['Quản lý sản phẩm & danh mục', 'Tìm kiếm và bộ lọc', 'Trang chi tiết sản phẩm', 'Liên hệ mua hàng', 'Responsive & SEO nền tảng'],
  },
  {
    id: 'website-ban-hang-day-du',
    name: 'Bán hàng đầy đủ',
    price: '12.000.000đ',
    note: 'Trọn gói tham khảo',
    fit: 'Muốn khách đặt hàng trực tiếp trên website',
    description: 'Phù hợp với cửa hàng muốn vận hành đơn hàng trực tuyến và tạo trải nghiệm mua sắm hoàn chỉnh.',
    features: ['Toàn bộ gói Website sản phẩm', 'Giỏ hàng & quản lý đơn', 'QR theo giá trị đơn hàng', 'Thông báo đơn hàng', 'Hướng dẫn quản trị bán hàng'],
  },
];

const addons = [
  ['GEO cơ bản', '+500.000đ'],
  ['GEO nâng cao', '+1.500.000đ'],
  ['01 bài viết SEO', '+500.000đ'],
  ['Bảo mật & HTTPS', '+1.000.000đ'],
  ['Xác nhận thanh toán tự động', 'Từ +5.000.000đ'],
];

export function ServicesPage() {
  return (
    <main id="top">
      <section className="package-hero">
        <div className="package-hero__copy reveal">
          <p className="eyebrow">Dịch vụ & bảng giá Webs4V</p>
          <h1>Chọn gói vừa đủ.<br /><em>Phát triển khi cần.</em></h1>
          <p>Bốn gói website dưới đây giúp bạn nhanh chóng xác định phạm vi và ngân sách phù hợp. Nếu chưa chắc nên chọn gói nào, Webs4V sẽ tư vấn miễn phí dựa trên mục tiêu thực tế.</p>
          <a href="#bang-gia"><span>Xem các gói dịch vụ</span><b>↓</b></a>
        </div>
        <div className="package-hero__showcase reveal">
          <figure className="package-hero__image package-hero__image--main">
            <img src="/image/project/featured-tablet.jpg" alt="Mẫu website hiển thị trên máy tính bảng" />
          </figure>
          <figure className="package-hero__image package-hero__image--floating">
            <img src="/image/project/featured-restaurant.webp" alt="Mẫu website nhà hàng hiển thị trên laptop" />
          </figure>
          <div className="package-hero__badge"><span>Thiết kế website</span><strong>Responsive</strong></div>
        </div>
      </section>

      <section className="package-pricing" id="bang-gia">
        <header className="package-heading reveal">
          <div><p className="eyebrow">Bảng gói dịch vụ</p><h2>Gói nào phù hợp<br /><em>với doanh nghiệp của bạn?</em></h2></div>
          <p>Chọn theo mục tiêu chính của website. Mỗi gói đều ghi rõ mức giá, đối tượng phù hợp và các hạng mục đã bao gồm.</p>
        </header>

        <nav className="package-chooser reveal" aria-label="Chọn nhanh gói website theo nhu cầu">
          <span>Chọn nhanh theo nhu cầu</span>
          <a href="#website-doanh-nghiep"><b>Giới thiệu công ty</b><small>Từ 3 triệu</small></a>
          <a href="#website-blog"><b>Viết bài & SEO</b><small>Khoảng 6 triệu</small></a>
          <a href="#website-ban-hang"><b>Trưng bày sản phẩm</b><small>Từ 7 triệu</small></a>
          <a href="#website-ban-hang-day-du"><b>Đặt hàng online</b><small>Khoảng 12 triệu</small></a>
        </nav>

        <div className="package-grid">
          {packages.map((item, index) => (
            <article className={`package-card reveal${item.popular ? ' package-card--featured' : ''}`} id={item.id} key={item.id}>
              {item.popular && <small>Được chọn nhiều</small>}
              <div className="package-card__top"><span>0{index + 1}</span><i>{item.note}</i></div>
              <h3>{item.name}</h3>
              <strong>{item.price}</strong>
              <div className="package-card__fit"><span>Phù hợp khi</span><b>{item.fit}</b></div>
              <p>{item.description}</p>
              <div className="package-card__included">Đã bao gồm</div>
              <ul>{item.features.map((feature) => <li key={feature}><b>✓</b><span>{feature}</span></li>)}</ul>
              <a href="https://zalo.me/0364003638" target="_blank" rel="noopener noreferrer"><span>Nhận tư vấn gói này</span><b>↗</b></a>
            </article>
          ))}
        </div>

        <div className="package-addons reveal" id="seo-geo">
          <div><span>Tính năng cộng thêm</span><p>Chỉ chọn khi dự án thực sự cần.</p></div>
          <ul>{addons.map(([name, price]) => <li key={name}><span>{name}</span><strong>{price}</strong></li>)}</ul>
        </div>

        <p className="package-note reveal">Giá chưa bao gồm tên miền, hosting, phí ngân hàng, cổng thanh toán, API hoặc dịch vụ bên thứ ba. Số lượng trang và chức năng ngoài phạm vi tiêu chuẩn sẽ được báo giá trước khi thực hiện.</p>
      </section>

      <section className="package-contact" id="contact">
        <div className="reveal"><p className="eyebrow">Chưa biết chọn gói nào?</p><h2>Chia sẻ nhu cầu.<br /><em>Nhận đề xuất phù hợp.</em></h2></div>
        <div className="package-contact__actions reveal">
          <p>Webs4V sẽ giúp bạn xác định gói phù hợp, những tính năng cần có và phần nào chưa cần đầu tư ở giai đoạn hiện tại.</p>
          <a href="https://zalo.me/0364003638" target="_blank" rel="noopener noreferrer"><span>Nhắn Zalo tư vấn</span><b>↗</b></a>
          <a href="tel:0364003638"><span>Gọi 0364 003 638</span><b>→</b></a>
        </div>
      </section>
    </main>
  );
}
