import { defineMorphIcon } from 'morphicons/element';
import {
  Menu,
  X,
  SearchCheck,
  PenTool,
  CodeXml,
  Rocket,
  Monitor,
  ShoppingBag,
  MousePointerClick,
  FileText,
  ShieldCheck,
} from 'lucide';
import { initializeDirectionalIcons } from './ui-icons.js';
import projectFeaturedTablet from './image/project/featured-tablet.jpg';
import projectFeaturedBusiness from './image/project/featured-4503766.jpg';
import projectFeaturedPortfolio from './image/project/featured-7288248.jpg';
import projectFeaturedBrand from './image/project/featured-16-1.jpg';
import projectFeaturedRestaurant from './image/project/featured-restaurant.webp';
import projectOne from './image/project/1.webp';
import projectTwo from './image/project/2.webp';
import projectThree from './image/project/3.webp';
import projectFour from './image/project/4.webp';
import projectFive from './image/project/5.webp';

const mobileProjectImages = [
  projectFeaturedTablet,
  projectFeaturedBusiness,
  projectFeaturedPortfolio,
  projectFeaturedBrand,
  projectFeaturedRestaurant,
  projectOne,
  projectTwo,
  projectThree,
  projectFour,
  projectFive,
];

const body = document.body;
const loader = document.querySelector('.loader');
const loaderBar = document.querySelector('.loader__track span');
const loaderValue = document.querySelector('.loader__value');
const cursor = document.querySelector('.cursor');
const siteHeader = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuBackdrop = document.querySelector('.menu-backdrop');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

body.classList.add('is-lite-experience', 'is-compact-experience');

defineMorphIcon();
initializeDirectionalIcons();

function initializeStaticContentIcons() {
  const iconConfigs = [
    ['[data-process-icon="search-check"]', SearchCheck],
    ['[data-process-icon="pen-tool"]', PenTool],
    ['[data-process-icon="code-xml"]', CodeXml],
    ['[data-process-icon="rocket"]', Rocket],
    ['[data-solution-icon="brand"]', Monitor],
    ['[data-solution-icon="commerce"]', ShoppingBag],
    ['[data-solution-icon="conversion"]', MousePointerClick],
    ['[data-solution-icon="visibility"]', SearchCheck],
    ['[data-solution-icon="content"]', FileText],
    ['[data-solution-icon="operation"]', ShieldCheck],
  ];

  iconConfigs.forEach(([selector, icon]) => {
    const element = document.querySelector(selector);
    if (!element) return;
    element.icon = icon;
    element.spring = 'snappy';
  });
}

initializeStaticContentIcons();
document.querySelectorAll('.menu-toggle morph-icon').forEach((icon) => {
  icon.icon = Menu;
  icon.spring = 'snappy';
});

function finishLoading() {
  window.clearTimeout(window.__webs4vLoadingWatchdog);
  if (loaderBar) loaderBar.style.width = '100%';
  if (loaderValue) loaderValue.textContent = '100%';
  loader?.style.setProperty('--loader-progress', '100');

  window.setTimeout(() => {
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
  }, reducedMotion ? 0 : 120);
}

function updateScroll() {
  const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / limit));
  document.documentElement.style.setProperty('--page-progress', progress.toFixed(4));
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 18);
}

function updateMenuRevealOrigin() {
  if (!menuToggle) return;

  const rect = menuToggle.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const radius = Math.ceil(Math.max(
    Math.hypot(originX, originY),
    Math.hypot(window.innerWidth - originX, originY),
    Math.hypot(originX, window.innerHeight - originY),
    Math.hypot(window.innerWidth - originX, window.innerHeight - originY),
  )) + 4;

  document.documentElement.style.setProperty('--menu-origin-x', `${originX}px`);
  document.documentElement.style.setProperty('--menu-origin-y', `${originY}px`);
  document.documentElement.style.setProperty('--menu-radius', `${radius}px`);
}

function setMenuOpen(open) {
  if (open) updateMenuRevealOrigin();
  document.querySelectorAll('.menu-toggle morph-icon').forEach((icon) => {
    icon.morphTo(open ? X : Menu);
  });
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  mobileMenu?.setAttribute('aria-hidden', String(!open));
  mobileMenu?.classList.toggle('is-open', open);
  menuBackdrop?.classList.toggle('is-open', open);
  body.classList.toggle('menu-open', open);

  if (open) {
    window.setTimeout(
      () => mobileMenu?.querySelector('a')?.focus({ preventScroll: true }),
      reducedMotion ? 0 : 460,
    );
  }
}

function updateActiveNavigation() {
  const links = [...document.querySelectorAll('.primary-nav a, .mobile-menu nav a')];
  const normalizePath = (path) => path.replace(/\/+$/, '') || '/';
  const currentUrl = new URL(window.location.href);
  const currentPath = normalizePath(currentUrl.pathname);
  const matchingLinks = links.filter((link) => (
    normalizePath(new URL(link.href, window.location.href).pathname) === currentPath
  ));
  const hashMatches = matchingLinks.filter((link) => (
    new URL(link.href, window.location.href).hash === currentUrl.hash
  ));
  const activeLinks = hashMatches.length
    ? hashMatches
    : matchingLinks.filter((link) => !new URL(link.href, window.location.href).hash);

  links.forEach((link) => link.removeAttribute('aria-current'));
  activeLinks.forEach((link) => link.setAttribute('aria-current', 'page'));

  const isServicesPath = currentPath === '/dich-vu' || currentPath.startsWith('/dich-vu/');
  const servicesTrigger = document.querySelector('[data-services-trigger]');
  if (isServicesPath) servicesTrigger?.setAttribute('aria-current', 'page');
  else servicesTrigger?.removeAttribute('aria-current');
  document.querySelector('.mobile-services-menu')?.classList.toggle('is-current', isServicesPath);
}


function initializeArticleTocScrollSpy() {
  const tocLinks = [...document.querySelectorAll('.article-toc a[href^="#"]')];
  const items = tocLinks
    .map((link) => {
      const href = link.getAttribute('href');
      const section = document.querySelector(href);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!items.length) return;

  let activeId = '';
  let frameId = 0;

  const setActive = (id) => {
    if (!id || id === activeId) return;
    activeId = id;

    items.forEach(({ link, section }) => {
      const isActive = section.id === id;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const update = () => {
    frameId = 0;
    const activationLine = Math.min(window.innerHeight * 0.35, 240);
    let current = items[0];

    items.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= activationLine) {
        current = item;
      }
    });

    const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
    if (atPageEnd) current = items[items.length - 1];
    setActive(current.section.id);
  };

  const requestUpdate = () => {
    if (!frameId) frameId = window.requestAnimationFrame(update);
  };

  items.forEach(({ link, section }) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const headerOffset = 110;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActive(section.id);
      if (history.pushState) {
        history.pushState(null, '', '#' + section.id);
      }
    });
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('hashchange', requestUpdate);
  requestUpdate();
}

function initializePrivacyScrollSpy() {
  const items = [...document.querySelectorAll('.privacy-toc a[href^="#"]')]
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(({ section }) => section);
  if (!items.length) return;

  let activeId = '';
  let frameId = 0;
  const update = () => {
    frameId = 0;
    const activationLine = Math.min(window.innerHeight * 0.34, 260);
    let current = items[0];
    items.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= activationLine) current = item;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = items[items.length - 1];
    }
    if (current.section.id === activeId) return;
    activeId = current.section.id;
    items.forEach(({ link, section }) => {
      const isActive = section.id === activeId;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const requestUpdate = () => {
    if (!frameId) frameId = window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('hashchange', requestUpdate);
  requestUpdate();
}

function initializeBlogFilters() {
  const buttons = [...document.querySelectorAll('[data-blog-filter]')];
  const cards = [...document.querySelectorAll('[data-blog-category]')];
  const emptyState = document.querySelector('[data-blog-empty]');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      let visibleCount = 0;
      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      cards.forEach((card) => {
        const visible = button.dataset.blogFilter === 'all'
          || card.dataset.blogCategory === button.dataset.blogFilter;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (emptyState) emptyState.hidden = visibleCount > 0;
    });
  });
}

function initializeFaq() {
  const faq = document.querySelector('[data-faq]');
  if (!faq) return;
  const items = [...faq.querySelectorAll('.faq-item')];
  items.forEach((item) => {
    const button = item.querySelector('button');
    button?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initializeContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector('[data-contact-status]');
  const submitButton = form.querySelector('[data-contact-submit]');
  const endpoint = form.dataset.contactEndpoint?.trim() || '';
  const cooldownKey = 'webs4v-contact-last-submit';
  let formStartedAt = Date.now();
  let isSubmitting = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting || !form.reportValidity()) return;

    let lastSubmittedAt = 0;
    try {
      lastSubmittedAt = Number(window.localStorage.getItem(cooldownKey)) || 0;
    } catch {
      lastSubmittedAt = 0;
    }
    if (Date.now() - lastSubmittedAt < 30000) {
      status.textContent = 'Yêu cầu vừa được gửi. Vui lòng chờ một chút trước khi gửi lại.';
      status.className = 'contact-form__status is-error';
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      service: String(data.get('service') || '').trim(),
      message: String(data.get('message') || '').trim(),
      website: String(data.get('website') || '').trim(),
      startedAt: String(formStartedAt),
    };
    if (!endpoint.startsWith('https://script.google.com/macros/s/') || endpoint.includes('THAY_BANG_URL_CUA_BAN')) {
      status.textContent = 'Biểu mẫu chưa được kết nối. Vui lòng nhắn Zalo hoặc gọi 0364 003 638.';
      status.className = 'contact-form__status is-error';
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Đang gửi...';
    status.textContent = 'Đang chuyển yêu cầu đến Webs4V.';
    status.className = 'contact-form__status';
    try {
      await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) });
      form.reset();
      formStartedAt = Date.now();
      try {
        window.localStorage.setItem(cooldownKey, String(Date.now()));
      } catch {
        // The server-side rate limit remains active when storage is unavailable.
      }
      status.textContent = 'Đã gửi thành công. Webs4V sẽ liên hệ với bạn trong thời gian sớm nhất.';
      status.className = 'contact-form__status is-success';
      submitButton.querySelector('span').textContent = 'Đã gửi yêu cầu';
      const [{ default: Swal }] = await Promise.all([
        import('sweetalert2'),
        import('sweetalert2/dist/sweetalert2.min.css'),
      ]);
      Swal.fire({
        icon: 'success',
        title: 'Đã gửi yêu cầu',
        text: 'Cảm ơn bạn đã liên hệ. Webs4V sẽ phản hồi trong thời gian sớm nhất.',
        confirmButtonText: 'Hoàn tất',
        buttonsStyling: false,
        heightAuto: false,
        returnFocus: false,
        customClass: {
          popup: 'contact-alert',
          title: 'contact-alert__title',
          htmlContainer: 'contact-alert__content',
          confirmButton: 'contact-alert__button',
        },
      });
    } catch (error) {
      console.error('Không thể gửi yêu cầu liên hệ.', error);
      status.textContent = 'Chưa thể gửi tự động. Vui lòng nhắn Zalo hoặc gọi 0364 003 638.';
      status.className = 'contact-form__status is-error';
      submitButton.querySelector('span').textContent = 'Thử gửi lại';
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
    }
  });
}

function initializeTypewriter() {
  const typewriter = document.querySelector('.typewriter');
  if (!typewriter) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const phrase = (typewriter.textContent || '').trim();
  if (!phrase) return;

  const characters = Array.from(phrase.normalize('NFC'));
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  async function loopTypewriter() {
    await wait(2000);

    while (document.body.contains(typewriter)) {
      for (let i = characters.length; i >= 0; i -= 1) {
        typewriter.textContent = characters.slice(0, i).join('');
        await wait(45);
      }

      await wait(450);

      for (let i = 1; i <= characters.length; i += 1) {
        typewriter.textContent = characters.slice(0, i).join('');
        await wait(80);
      }

      await wait(2400);
    }
  }

  loopTypewriter();
}

function initializeReveals() {
  const elements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    // Some reveal wrappers (such as the mobile pricing plans) are several
    // viewports tall, so a percentage threshold may never be reachable.
    threshold: 0.01,
    rootMargin: '0px 0px -8% 0px',
  });
  elements.forEach((element) => observer.observe(element));
}

function initializeProjectMarquee() {
  const groups = [...document.querySelectorAll('[data-project-group]')];
  if (!groups.length) return;

  groups.forEach((group, rowIndex) => {
    const track = group.closest('[data-project-track]');
    const rowImages = mobileProjectImages.filter((_, imageIndex) => (
      imageIndex % groups.length === rowIndex
    ));
    if (!track) return;

    group.innerHTML = '';
    [...track.children].forEach((child) => {
      if (child !== group) child.remove();
    });

    rowImages.forEach((source, cardIndex) => {
      const projectNumber = cardIndex * groups.length + rowIndex + 1;
      const card = document.createElement('figure');
      const image = document.createElement('img');
      const caption = document.createElement('figcaption');
      const number = document.createElement('span');
      const label = document.createElement('strong');

      card.className = 'project-card';
      image.src = source;
      image.alt = `Dự án website Webs4V ${projectNumber}`;
      image.loading = 'eager';
      image.decoding = 'async';
      number.textContent = String(projectNumber).padStart(2, '0');
      label.textContent = 'Webs4V Project';
      caption.append(number, label);
      card.append(image, caption);
      group.append(card);
    });

    const duplicate = group.cloneNode(true);
    duplicate.removeAttribute('data-project-group');
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.querySelectorAll('img').forEach((image) => {
      image.alt = '';
      image.loading = 'eager';
      image.decoding = 'async';
    });
    track.style.setProperty('--marquee-duration', `${Math.max(42, rowImages.length * 7)}s`);
    track.append(duplicate);
  });
}

updateActiveNavigation();
initializePrivacyScrollSpy();
initializeArticleTocScrollSpy();
initializeBlogFilters();
initializeFaq();
initializeContactForm();
initializeProjectMarquee();
initializeReveals();
initializeTypewriter();
updateScroll();

window.addEventListener('hashchange', updateActiveNavigation);
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('pointermove', (event) => {
  body.classList.add('has-pointer');
  if (cursor) cursor.style.transform = `translate3d(${event.clientX - 26}px, ${event.clientY - 26}px, 0)`;
}, { passive: true });
window.addEventListener('pointerleave', () => body.classList.remove('has-pointer'));
window.addEventListener('resize', () => {
  if (window.innerWidth > 1050 && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
  } else if (menuToggle?.getAttribute('aria-expanded') === 'true') {
    updateMenuRevealOrigin();
  }
});
menuToggle?.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
menuBackdrop?.addEventListener('click', () => setMenuOpen(false));
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

window.requestAnimationFrame(finishLoading);
