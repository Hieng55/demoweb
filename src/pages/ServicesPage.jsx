import React from 'react';
import serviceWebIcon from '../../image/service-web.svg';
import googleAdsIcon from '../../image/service-google-ads.svg';
import metaIcon from '../../image/service-meta.svg';
import facebookIcon from '../../image/service-facebook.svg';
import googleBusinessIcon from '../../image/service-google-business.svg';
import photoshopIcon from '../../image/service-photoshop.svg';
import illustratorIcon from '../../image/service-illustrator.svg';
import indesignIcon from '../../image/service-indesign.svg';

export const serviceItems = [
  {
    slug: 'thiet-ke-website', index: '01', short: 'Web / Commerce', title: 'Thiết kế website & E-commerce',
    lead: 'Xây dựng website doanh nghiệp, landing page và website thương mại điện tử theo thương hiệu, rõ mục tiêu kinh doanh.',
    support: 'Từ chiến lược nội dung, UI/UX và responsive đến danh mục sản phẩm, giỏ hàng, đơn hàng, thanh toán, SEO nền tảng và bàn giao quản trị.',
    outcomes: ['Website thiết kế riêng theo thương hiệu', 'Trải nghiệm mua sắm tốt trên mọi thiết bị', 'Nền tảng dễ quản trị và mở rộng'],
    benefit: 'Một nền tảng số chuyên nghiệp để giới thiệu thương hiệu, bán hàng và vận hành thương mại điện tử.',
    icon: serviceWebIcon,
  },
  {
    slug: 'google-ads', index: '02', short: 'Search intent', title: 'Google Ads',
    lead: 'Đưa thương hiệu đến trước người đang chủ động tìm kiếm sản phẩm hoặc dịch vụ của bạn.',
    support: 'Nghiên cứu từ khóa, cấu trúc chiến dịch, viết mẫu quảng cáo, thiết lập chuyển đổi và tối ưu theo dữ liệu.',
    outcomes: ['Bộ chiến dịch rõ mục tiêu', 'Báo cáo minh bạch, dễ hiểu', 'Ngân sách được kiểm soát'],
    benefit: 'Tiếp cận đúng nhu cầu, tăng cơ hội nhận cuộc gọi và khách hàng tiềm năng.',
    icon: googleAdsIcon,
  },
  {
    slug: 'meta-ads', index: '03', short: 'Social reach', title: 'Facebook & Instagram Ads',
    lead: 'Tạo nhu cầu và đưa thông điệp thương hiệu đến đúng nhóm khách hàng trên mạng xã hội.',
    support: 'Xác định tệp khách hàng, xây nội dung quảng cáo, thiết kế creative, triển khai A/B test và tối ưu hiệu quả.',
    outcomes: ['Thông điệp và hình ảnh đồng bộ', 'Nhiều mẫu quảng cáo để thử nghiệm', 'Theo dõi chi phí theo mục tiêu'],
    benefit: 'Mở rộng độ phủ, tăng tương tác và tạo thêm tin nhắn từ khách hàng phù hợp.',
    icon: metaIcon,
  },
  {
    slug: 'cham-soc-fanpage', index: '04', short: 'Always on', title: 'Chăm sóc Fanpage',
    lead: 'Giúp Fanpage hoạt động đều đặn và thể hiện hình ảnh chuyên nghiệp thay vì đăng bài rời rạc.',
    support: 'Lên kế hoạch nội dung, viết bài, thiết kế poster social và duy trì giọng điệu nhất quán theo thương hiệu.',
    outcomes: ['Lịch nội dung theo tháng', 'Bài viết và thiết kế hoàn chỉnh', 'Hình ảnh Fanpage đồng bộ'],
    benefit: 'Duy trì sự hiện diện, tăng độ tin cậy và giúp khách hàng nhớ đến thương hiệu.',
    icon: facebookIcon,
  },
  {
    slug: 'nhan-dien-thuong-hieu', index: '05', short: 'Brand system', title: 'Nhận diện thương hiệu',
    lead: 'Xây dựng ngôn ngữ hình ảnh rõ ràng để thương hiệu xuất hiện nhất quán ở mọi điểm chạm.',
    support: 'Thiết kế logo, màu sắc, typography, quy chuẩn hình ảnh và các ứng dụng nhận diện cần thiết.',
    outcomes: ['Bộ tài sản thương hiệu', 'Quy chuẩn sử dụng dễ áp dụng', 'Thiết kế sẵn sàng cho digital'],
    benefit: 'Tăng tính chuyên nghiệp, khả năng nhận biết và sự nhất quán của doanh nghiệp.',
    icons: [photoshopIcon, illustratorIcon, indesignIcon],
  },
  {
    slug: 'google-business', index: '06', short: 'Local presence', title: 'Google Business',
    lead: 'Hoàn thiện hiện diện địa phương để khách hàng dễ tìm, gọi điện và đến đúng địa điểm kinh doanh.',
    support: 'Khởi tạo, thiết lập, xác minh, chuẩn hóa thông tin và hỗ trợ xử lý các vấn đề cơ bản của hồ sơ.',
    outcomes: ['Hồ sơ đầy đủ, nhất quán', 'Thông tin liên hệ chính xác', 'Hướng dẫn quản lý lâu dài'],
    benefit: 'Tăng khả năng xuất hiện trên Maps và giúp khách hàng hành động nhanh hơn.',
    icon: googleBusinessIcon,
  },
  {
    slug: 'seo-google', index: '07', short: 'Organic growth', title: 'SEO Google',
    lead: 'Cải thiện nền tảng website để khách hàng dễ tìm thấy doanh nghiệp trên kết quả tìm kiếm tự nhiên.',
    support: 'Kiểm tra kỹ thuật, nghiên cứu từ khóa, tối ưu cấu trúc và nội dung on-page, đồng thời kết nối công cụ đo lường Google.',
    outcomes: ['Báo cáo hiện trạng website', 'Bộ từ khóa theo nhu cầu tìm kiếm', 'Lộ trình tối ưu theo mức ưu tiên'],
    benefit: 'Tăng khả năng xuất hiện bền vững và thu hút khách hàng mà không phụ thuộc hoàn toàn vào quảng cáo.',
    icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/google/default.svg',
  },
];

const packages = [
  { id: 'website-doanh-nghiep', name: 'Website doanh nghiệp', price: '3.000.000đ', note: 'Nền tảng thương hiệu', fit: 'Cần website giới thiệu công ty và nhận liên hệ', description: 'Dành cho doanh nghiệp cần một website chuyên nghiệp để giới thiệu thương hiệu, dịch vụ và nhận liên hệ.', features: ['05 trang thiết kế riêng', 'Giao diện responsive', 'SEO nền tảng', 'Quản trị WordPress', 'Form liên hệ & kết nối Zalo'] },
  { id: 'website-blog', name: 'Website doanh nghiệp + Blog', price: '6.000.000đ', note: 'Nội dung dài hạn', fit: 'Muốn làm nội dung và phát triển SEO lâu dài', description: 'Bổ sung hệ thống nội dung để doanh nghiệp chia sẻ chuyên môn và phát triển khả năng tìm kiếm.', features: ['Toàn bộ gói Doanh nghiệp', 'Chuyên mục Blog / Tin tức', 'Trang bài viết chuẩn SEO', 'Quản lý danh mục bài viết', 'Hướng dẫn đăng nội dung'], popular: true },
  { id: 'website-ban-hang', name: 'Website sản phẩm', price: '7.000.000đ', note: 'Trưng bày & tư vấn', fit: 'Cần giới thiệu nhiều sản phẩm nhưng chưa cần đặt hàng', description: 'Phù hợp doanh nghiệp cần danh mục sản phẩm rõ ràng và dẫn khách hàng đến bước liên hệ mua hàng.', features: ['Quản lý sản phẩm & danh mục', 'Tìm kiếm và bộ lọc', 'Trang chi tiết sản phẩm', 'Liên hệ mua hàng', 'Responsive & SEO nền tảng'] },
  { id: 'website-ban-hang-day-du', name: 'Website thương mại điện tử', price: '12.000.000đ', note: 'E-commerce trọn bộ', fit: 'Muốn khách mua và thanh toán trực tiếp trên website', description: 'Giải pháp e-commerce cho doanh nghiệp cần quản lý sản phẩm, giỏ hàng, đơn hàng và quy trình thanh toán trực tuyến.', features: ['Toàn bộ gói Website sản phẩm', 'WooCommerce, giỏ hàng & quản lý đơn', 'QR theo giá trị đơn hàng', 'Tích hợp thanh toán & vận chuyển theo nhu cầu', 'Hướng dẫn quản trị bán hàng'] },
];

function ServiceMenu({ current }) {
  return <nav className="service-subnav" aria-label="Danh mục dịch vụ">
    <a href="/dich-vu/" className={!current ? 'is-active' : ''}>Tất cả</a>
    {serviceItems.map(item => <a href={`/dich-vu/${item.slug}/`} className={current === item.slug ? 'is-active' : ''} key={item.slug}>{item.title}</a>)}
  </nav>;
}

function ServicesHub() {
  return <main id="top" className="services-hub">
    <section className="services-hub__hero">
      <div className="services-hub__hero-copy reveal"><h1>Mỗi mục tiêu.<br /><em>Một giải pháp chuyên sâu.</em></h1><p>Khám phá từng nhóm dịch vụ Webs4V đang cung cấp và chọn giải pháp phù hợp với mục tiêu hiện tại của doanh nghiệp.</p></div>
    </section>
    <section className="services-hub__grid" aria-label="Các dịch vụ của Webs4V">
      {serviceItems.map(item => <a className="service-hub-card reveal" href={`/dich-vu/${item.slug}/`} key={item.slug}>
        <header><span>{item.index}</span><small>{item.short}</small></header>
        <div className={`service-hub-card__icon${item.image ? ' service-hub-card__icon--photo' : ''}${item.icons ? ' service-hub-card__icon--multi' : ''}`}>
          {(item.icons ?? [item.icon]).map((icon, iconIndex) => <img src={icon} alt="" key={`${item.slug}-icon-${iconIndex}`} />)}
        </div>
        <h2>{item.title}</h2><p>{item.lead}</p><footer><span>Xem dịch vụ</span><b>↗</b></footer>
      </a>)}
    </section>
    <section className="service-page-cta reveal"><div><p className="eyebrow">Chưa biết bắt đầu từ đâu?</p><h2>Chia sẻ mục tiêu.<br /><em>Chúng tôi giúp chọn đúng dịch vụ.</em></h2></div><a href="/#contact"><span>Trao đổi nhu cầu</span><b>↗</b></a></section>
  </main>;
}

function WebsiteServicePage() {
  const item = serviceItems[0];
  return <main id="top" className="service-detail-page">
    <ServiceDetailHero item={item} />
    <section className="package-pricing" id="bang-gia">
      <header className="package-heading reveal"><div><p className="eyebrow">Bảng gói dịch vụ website</p><h2>Chọn phạm vi vừa đủ.<br /><em>Phát triển khi cần.</em></h2></div><p>Mỗi gói ghi rõ mục tiêu, mức giá và hạng mục đã bao gồm để doanh nghiệp dễ chọn theo giai đoạn hiện tại.</p></header>
      <div className="package-grid">{packages.map((pkg, index) => <article className={`package-card reveal${pkg.popular ? ' package-card--featured' : ''}`} id={pkg.id} key={pkg.id}>{pkg.popular && <small>Được chọn nhiều</small>}<div className="package-card__top"><span>0{index + 1}</span><i>{pkg.note}</i></div><h3>{pkg.name}</h3><strong>{pkg.price}</strong><div className="package-card__fit"><span>Phù hợp khi</span><b>{pkg.fit}</b></div><p>{pkg.description}</p><div className="package-card__included">Đã bao gồm</div><ul>{pkg.features.map(feature => <li key={feature}><b>✓</b><span>{feature}</span></li>)}</ul><a href="/#contact"><span>Nhận tư vấn gói này</span><b>↗</b></a></article>)}</div>
      <p className="package-note reveal">Giá chưa bao gồm tên miền, hosting, phí ngân hàng, cổng thanh toán, API hoặc dịch vụ bên thứ ba. Chức năng ngoài phạm vi sẽ được báo giá trước khi thực hiện.</p>
    </section>
    <ServiceContact title="Một website đúng mục tiêu bắt đầu từ một cuộc trao đổi rõ ràng." />
  </main>;
}

function ServiceDetailHero({ item }) {
  return <section className="service-detail__hero">
    <div className="service-detail__copy reveal"><p className="eyebrow">{item.short} · Dịch vụ Webs4V</p><h1>{item.title}.<br /><em>{item.benefit}</em></h1><p>{item.lead}</p><a href="#pham-vi"><span>Xem phạm vi hỗ trợ</span><b>↓</b></a></div>
    <aside className="service-detail__summary reveal"><span>Lợi ích mang lại</span><strong>{item.benefit}</strong><small>Giải pháp được đề xuất theo mục tiêu, hiện trạng và phạm vi thực tế.</small></aside>
  </section>;
}

function GenericServicePage({ item }) {
  return <main id="top" className="service-detail-page">
    <ServiceDetailHero item={item} />
    <ServiceMenu current={item.slug} />
    <section className="service-detail__scope" id="pham-vi">
      <header className="service-detail__heading reveal"><p className="eyebrow">Phạm vi dịch vụ</p><h2>Chúng tôi hỗ trợ<br /><em>từ nền tảng đến đầu ra.</em></h2><p>{item.support}</p></header>
      <div className="service-detail__outcomes">{item.outcomes.map((outcome, index) => <article className="reveal" key={outcome}><span>0{index + 1}</span><h3>{outcome}</h3><p>Mỗi hạng mục được thống nhất theo mục tiêu và hiện trạng thực tế trước khi triển khai.</p></article>)}</div>
    </section>
    <section className="service-detail__approach">
      <header className="service-detail__heading reveal"><p className="eyebrow">Cách triển khai</p><h2>Rõ từng bước.<br /><em>Dễ theo dõi tiến trình.</em></h2></header>
      <div className="service-detail__steps"><article className="reveal"><b>01</b><h3>Làm rõ mục tiêu</h3><p>Trao đổi nhu cầu, đối tượng, hiện trạng và kết quả doanh nghiệp muốn đạt được.</p></article><article className="reveal"><b>02</b><h3>Xây phạm vi phù hợp</h3><p>Đề xuất hạng mục, đầu ra và thứ tự ưu tiên, tránh triển khai phần chưa cần thiết.</p></article><article className="reveal"><b>03</b><h3>Triển khai & hoàn thiện</h3><p>Thực hiện theo mốc duyệt, tiếp nhận phản hồi và bàn giao đầu ra đã thống nhất.</p></article></div>
    </section>
    <ServiceContact title={item.benefit} />
  </main>;
}

function ServiceContact({ title }) {
  return <section className="service-page-cta reveal" id="contact"><div><p className="eyebrow">Trao đổi cùng Webs4V</p><h2>{title}<br /><em>Bắt đầu bằng nhu cầu thực tế của bạn.</em></h2></div><a href="https://zalo.me/0364003638" target="_blank" rel="noopener noreferrer"><span>Nhắn Zalo tư vấn</span><b>↗</b></a></section>;
}

export function ServicesPage({ markup }) {
  if (markup) return <main id="top" className="website-service-page" dangerouslySetInnerHTML={{ __html: markup }} />;
  return <ServicesHub />;
}
