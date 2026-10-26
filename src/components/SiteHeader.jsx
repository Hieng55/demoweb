import React from 'react';

export function SiteHeader() {
  const links = [['/', 'Trang chủ'], ['/ve-chung-toi/', 'Về chúng tôi'], ['/dich-vu/', 'Dịch vụ'], ['/chinh-sach-bao-mat/', 'Chính sách'], ['/tuyen-dung/', 'Tuyển dụng'], ['/lien-he/', 'Liên hệ']];
  return <>
    <header className="site-header" data-header>
      <div className="header-glass">
        <a className="brand" href="/" aria-label="Webs4V — Trang chủ"><img src="/image/logo-webs4v-2-1.png" alt="Webs4V" width="1310" height="672" /></a>
        <nav className="primary-nav" aria-label="Điều hướng chính">{links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}</nav>
        <div className="header-actions"><a className="header-cta" href="/lien-he/"><span>Bắt đầu dự án</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5m0 0H7m8 0v8" /></svg></a><button className="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-navigation" aria-label="Mở menu"><span /><span /></button></div>
      </div>
      <div className="mobile-menu" id="mobile-navigation" aria-hidden="true"><p className="mobile-menu__label">Khám phá Webs4V</p><nav aria-label="Điều hướng trên thiết bị di động">{links.map(([href, label], index) => <a href={href} key={href}><span>{String(index + 1).padStart(2, '0')}</span>{label}</a>)}</nav><a className="mobile-menu__cta" href="/lien-he/"><span>Trao đổi về dự án</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5m0 0H7m8 0v8" /></svg></a></div>
    </header><div className="menu-backdrop" aria-hidden="true" />
  </>;
}
