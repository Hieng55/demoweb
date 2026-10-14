import React from 'react';
import { ExperienceShell } from './components/ExperienceShell';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';

export default function App({ page, mainMarkup }) {
  const CurrentPage = page === 'services' ? ServicesPage : page === 'about' ? AboutPage : HomePage;

  return (
    <>
      <ExperienceShell page={page} />
      <SiteHeader />
      <aside className="scroll-progress" aria-hidden="true"><span /><small>Cuộn để khám phá</small></aside>
      <CurrentPage markup={mainMarkup} />
      <SiteFooter />
    </>
  );
}
