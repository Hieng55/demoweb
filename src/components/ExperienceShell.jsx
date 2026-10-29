import React from 'react';
import brandLogo from '../../image/logo/logo.png';

export function ExperienceShell({ page }) {
  const isAbout = page === 'about';

  return (
    <>
      <canvas id="webgl-canvas" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="cursor" aria-hidden="true">
        <span className="cursor__halo" />
        <span className="cursor__dot">✦</span>
      </div>

      <div className="loader" role="status" aria-live="polite" aria-label={isAbout ? 'Đang tải trang Về Webs4V' : 'Đang tải trải nghiệm Webs4V'} style={{ '--loader-progress': 0 }}>
        <div className="loader__aura" aria-hidden="true" />
        <div className="loader__content">
          <div className="loader__portal" aria-hidden="true">
            <span className="loader__wave" /><span className="loader__orbit" />
            <span className="loader__core"><img src={brandLogo} alt="" /></span>
          </div>
          <div className="loader__copy">
            <div className="loader__status"><p><i /> Đang khởi tạo trải nghiệm</p><strong className="loader__value">0%</strong></div>
            <div className="loader__track"><span /></div>
            <small>Strategy · Design · Technology</small>
          </div>
        </div>
      </div>
    </>
  );
}
