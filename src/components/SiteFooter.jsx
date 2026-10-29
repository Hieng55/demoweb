import React from 'react';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__shell">
        <div className="site-footer__top">
          <div className="site-footer__identity">
            <a className="site-footer__brand" href="#top" aria-label="Webs4V — Lên đầu trang">
              <img src="/image/logo-webs4v-2-1.png" alt="Webs4V" />
            </a>
            <p>Thiết kế website doanh nghiệp và website thương mại điện tử, xây dựng nền tảng số giúp thương hiệu bán hàng và phát triển dài hạn.</p>
            <span className="site-footer__status"><i /> Đang nhận dự án mới</span>
          </div>

          <nav className="site-footer__links" aria-label="Điều hướng cuối trang">
            <div>
              <span>Khám phá</span>
              <a href="/">Trang chủ</a>
              <a href="/ve-chung-toi/">Về chúng tôi</a>
              <a href="/blog/">Blog kiến thức &amp; tin tức</a>
              <a href="/#story">Dự án đã thực hiện</a>
              <a href="/#pricing">Bảng giá</a>
            </div>
            <div>
              <span>Dịch vụ</span>
              <a href="/dich-vu/#website-doanh-nghiep">Website doanh nghiệp</a>
              <a href="/dich-vu/thiet-ke-website/#pricing">Website thương mại điện tử</a>
              <a href="/dich-vu/#bang-gia">Landing page</a>
              <a href="/dich-vu/#seo-geo">SEO &amp; GEO</a>
            </div>
            <div>
              <span>Liên hệ</span>
              <a href="tel:0364003638">0364 003 638</a>
              <a href="https://zalo.me/0364003638" target="_blank" rel="noopener noreferrer">Nhắn Zalo ↗</a>
              <a href="mailto:hello@webs4v.vn">Gửi email ↗</a>
              <a href="https://www.google.com/maps/search/?api=1&query=1104%20%C4%90.%20Ph%E1%BA%A1m%20V%C4%83n%20%C4%90%E1%BB%93ng%2C%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh" target="_blank" rel="noopener noreferrer">
                1104 Đ. Phạm Văn Đồng, Thủ Đức, TP.HCM ↗
              </a>
              <a href="/lien-he/">Form tư vấn</a>
            </div>
          </nav>
        </div>

        <div className="site-footer__cta">
          <div><span>Bạn đã sẵn sàng?</span><h2>Cùng biến ý tưởng<br /><em>thành một website đáng nhớ.</em></h2></div>
          <a href="/lien-he/"><span>Bắt đầu dự án</span><b>↗</b></a>
        </div>

        <div className="site-footer__company">
          <strong>CÔNG TY TNHH CÔNG NGHỆ WEBS4V.VN</strong>
          <span>MST: 0319765116</span>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 Webs4V. All rights reserved.</p>
          <div><a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a><a href="#top">Lên đầu trang ↑</a></div>
        </div>
      </div>
    </footer>
  );
}
