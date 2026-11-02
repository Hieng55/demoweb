import React from 'react';

export function ExperienceShell() {
  return (
    <>
      <canvas id="webgl-canvas" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="cursor" aria-hidden="true">
        <span className="cursor__halo" />
        <span className="cursor__dot">✦</span>
      </div>
    </>
  );
}
