import React from 'react';
import brandLogo from '../../image/logo/logo.png';

const mainLinks = [
  ['/', 'Trang chủ'],
  ['/ve-chung-toi/', 'Về chúng tôi'],
  ['/blog/', 'Blog'],
  ['/chinh-sach-bao-mat/', 'Chính sách'],
  ['/tuyen-dung/', 'Tuyển dụng'],
  ['/lien-he/', 'Liên hệ'],
];

const serviceLinks = [
  ['/dich-vu/thiet-ke-website/', 'Thiết kế website & E-commerce', 'wordpress'],
  ['/dich-vu/google-ads/', 'Google Ads', 'google-ads'],
  ['/dich-vu/meta-ads/', 'Facebook & Instagram Ads', 'meta'],
  ['/dich-vu/cham-soc-fanpage/', 'Chăm sóc Fanpage', 'facebook'],
  ['/dich-vu/nhan-dien-thuong-hieu/', 'Nhận diện thương hiệu', 'photoshop'],
  ['/dich-vu/google-business/', 'Google Business', 'google-maps'],
  ['/dich-vu/seo-google/', 'SEO Google', 'google'],
];

const theSvgIcon = (slug) => `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${slug}/default.svg`;

function ServicesDropdown() {
  return <div className="primary-nav__services">
    <a href="/dich-vu/" className="primary-nav__services-trigger" data-services-trigger>
      <span>Dịch vụ</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
    </a>
    <div className="services-dropdown" aria-label="Các dịch vụ Webs4V">
      <header><span>Hệ dịch vụ Webs4V</span><a href="/dich-vu/">Xem tất cả <b>↗</b></a></header>
      <div>
        {serviceLinks.map(([href, label, icon]) => <a href={href} key={href}>
          <span className="services-dropdown__icon"><img src={theSvgIcon(icon)} alt="" /></span><strong>{label}</strong><b>↗</b>
        </a>)}
      </div>
    </div>
  </div>;
}

function MobileServicesMenu() {
  return <details className="mobile-services-menu">
    <summary><span>03</span><strong>Dịch vụ</strong><b aria-hidden="true">+</b></summary>
    <div>
      <a href="/dich-vu/"><span>00</span>Tất cả dịch vụ</a>
      {serviceLinks.map(([href, label, icon]) => <a href={href} key={href}>
        <img src={theSvgIcon(icon)} alt="" />{label}
      </a>)}
    </div>
  </details>;
}

export function SiteHeader() {
  const desktopLinks = [mainLinks[0], mainLinks[1]];
  const desktopLinksAfterServices = mainLinks.slice(2);
  const mobileLinksBeforeServices = [mainLinks[0], mainLinks[1]];
  const mobileLinksAfterServices = mainLinks.slice(2);

  return <>
    <header className="site-header" data-header>
      <div className="header-glass">
        <a className="brand" href="/" aria-label="Webs4V — Trang chủ"><img src={brandLogo} alt="Webs4V" width="940" height="489" /></a>
        <nav className="primary-nav" aria-label="Điều hướng chính">
          {desktopLinks.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
          <ServicesDropdown />
          {desktopLinksAfterServices.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <a className="header-cta" href="/lien-he/"><span>Bắt đầu dự án</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5m0 0H7m8 0v8" /></svg></a>
          <button className="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-navigation" aria-label="Mở menu"><morph-icon className="menu-toggle__icon" size="22" stroke-width="2" /></button>
        </div>
      </div>
      <div className="mobile-menu" id="mobile-navigation" aria-hidden="true">
        <p className="mobile-menu__label">Khám phá Webs4V</p>
        <nav aria-label="Điều hướng trên thiết bị di động">
          {mobileLinksBeforeServices.map(([href, label], index) => <a href={href} key={href}><span>{String(index + 1).padStart(2, '0')}</span>{label}</a>)}
          <MobileServicesMenu />
          {mobileLinksAfterServices.map(([href, label], index) => <a href={href} key={href}><span>{String(index + 4).padStart(2, '0')}</span>{label}</a>)}
        </nav>
        <a className="mobile-menu__cta" href="/lien-he/"><span>Trao đổi về dự án</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5m0 0H7m8 0v8" /></svg></a>
      </div>
    </header>
    <div className="menu-backdrop" aria-hidden="true" />
  </>;
}
