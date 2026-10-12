import * as THREE from 'three';
import { createIcons, SearchCheck, PenTool, CodeXml, Rocket } from 'lucide';
import 'sweetalert2/dist/sweetalert2.min.css';
import iceUrl from './image/ice.jpg';
import iceDisplacementUrl from './image/iced.jpg';
import iceNormalUrl from './image/icen.jpg';
import noiseUrl from './image/noises.jpg';
import wavesUrl from './image/waves.jpg';

const projectImageModules = import.meta.glob('./image/project/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const body = document.body;
const canvas = document.querySelector('#webgl-canvas');
const loader = document.querySelector('.loader');
const loaderBar = document.querySelector('.loader__track span');
const loaderValue = document.querySelector('.loader__value');
const cursor = document.querySelector('.cursor');
const siteHeader = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuBackdrop = document.querySelector('.menu-backdrop');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const compactLayout = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const deviceMemory = navigator.deviceMemory ?? 8;
const hardwareConcurrency = navigator.hardwareConcurrency ?? 8;
const lowPowerDevice = compactLayout || deviceMemory <= 4 || hardwareConcurrency <= 4;

createIcons({
  icons: { SearchCheck, PenTool, CodeXml, Rocket },
  attrs: {
    'aria-hidden': 'true',
    'stroke-width': 1.7,
  },
});

function initializeProjectMarquee() {
  const groups = document.querySelectorAll('[data-project-group]');
  if (!groups.length) return;

  const featuredOrder = [
    'featured-tablet.jpg',
    'featured-4503766.jpg',
    'featured-7288248.jpg',
    'featured-16-1.jpg',
    'featured-restaurant.jpg',
  ];
  const collator = new Intl.Collator('vi', { numeric: true, sensitivity: 'base' });
  const images = Object.entries(projectImageModules).sort(([pathA], [pathB]) => {
    const nameA = pathA.split('/').pop();
    const nameB = pathB.split('/').pop();
    const rankA = featuredOrder.indexOf(nameA);
    const rankB = featuredOrder.indexOf(nameB);
    if (rankA !== -1 || rankB !== -1) {
      if (rankA === -1) return 1;
      if (rankB === -1) return -1;
      return rankA - rankB;
    }
    return collator.compare(nameA, nameB);
  });

  groups.forEach((group, rowIndex) => {
    const track = group.closest('[data-project-track]');
    const rowImages = images.filter((_, imageIndex) => imageIndex % groups.length === rowIndex);
    if (!track) return;

    rowImages.forEach(([, source], cardIndex) => {
      const projectNumber = cardIndex * groups.length + rowIndex + 1;
      const card = document.createElement('figure');
      const image = document.createElement('img');
      const caption = document.createElement('figcaption');
      const number = document.createElement('span');
      const label = document.createElement('strong');

      card.className = 'project-card';
      image.src = source;
      image.alt = `Dự án website Webs4V ${projectNumber}`;
      image.loading = cardIndex < 2 ? 'eager' : 'lazy';
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
      image.loading = 'lazy';
    });
    track.style.setProperty('--marquee-duration', `${Math.max(48, rowImages.length * 4.2)}s`);
    track.append(duplicate);
  });
}

initializeProjectMarquee();

function initializeAboutParallax() {
  const visual = document.querySelector('.about__visual');
  if (!visual || reducedMotion || compactLayout) return;

  const layers = visual.querySelectorAll('[data-about-depth]');

  visual.addEventListener('pointermove', (event) => {
    const bounds = visual.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.aboutDepth) || 1;
      layer.style.setProperty('--about-shift-x', `${offsetX * 22 * depth}px`);
      layer.style.setProperty('--about-shift-y', `${offsetY * 17 * depth}px`);
    });
  }, { passive: true });

  visual.addEventListener('pointerleave', () => {
    layers.forEach((layer) => {
      layer.style.setProperty('--about-shift-x', '0px');
      layer.style.setProperty('--about-shift-y', '0px');
    });
  });
}

initializeAboutParallax();

function initializeQuoteBuilder() {
  const builder = document.querySelector('[data-quote-builder]');
  if (!builder) return;

  const packageButtons = [...builder.querySelectorAll('[data-package]')];
  const addonButtons = [...builder.querySelectorAll('[data-addon]')];
  const presetButtons = [...builder.querySelectorAll('[data-preset]')];
  const totalElement = builder.querySelector('[data-quote-total]');
  const selectionElement = builder.querySelector('[data-quote-selection]');
  const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;

  function setPressed(button, pressed) {
    button.classList.toggle('is-selected', pressed);
    button.setAttribute('aria-pressed', String(pressed));
  }

  function selectPackage(packageName) {
    packageButtons.forEach((button) => setPressed(button, button.dataset.package === packageName));
  }

  function selectAddon(label, selected = true) {
    const button = addonButtons.find((item) => item.dataset.label === label);
    if (!button) return;
    if (selected && button.dataset.group) {
      addonButtons
        .filter((item) => item !== button && item.dataset.group === button.dataset.group)
        .forEach((item) => setPressed(item, false));
    }
    setPressed(button, selected);
  }

  function updateQuote() {
    const selectedPackage = packageButtons.find((button) => button.classList.contains('is-selected')) || packageButtons[0];
    const selectedAddons = addonButtons.filter((button) => button.classList.contains('is-selected'));
    const packagePrice = Number(selectedPackage.dataset.price);
    const total = selectedAddons.reduce((sum, button) => sum + Number(button.dataset.price), packagePrice);

    totalElement.textContent = formatPrice(total);
    selectionElement.replaceChildren();

    [selectedPackage, ...selectedAddons].forEach((button, index) => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      const price = document.createElement('b');
      label.textContent = button.dataset.label;
      price.textContent = `${index === 0 ? '' : '+'}${formatPrice(Number(button.dataset.price))}`;
      item.append(label, price);
      selectionElement.append(item);
    });
  }

  packageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectPackage(button.dataset.package);
      updateQuote();
    });
  });

  addonButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const willSelect = !button.classList.contains('is-selected');
      selectAddon(button.dataset.label, willSelect);
      updateQuote();
    });
  });

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      addonButtons.forEach((addon) => setPressed(addon, false));

      if (button.dataset.preset === 'business-blog') {
        selectPackage('business');
        selectAddon('Blog / Tin tức');
      }

      if (button.dataset.preset === 'full-commerce') {
        selectPackage('commerce');
        selectAddon('Giỏ hàng & quản lý đơn');
        selectAddon('QR thanh toán');
      }

      if (button.dataset.preset === 'growth-commerce') {
        selectPackage('commerce');
        selectAddon('Blog / Tin tức');
        selectAddon('Giỏ hàng & quản lý đơn');
        selectAddon('QR thanh toán');
        selectAddon('GEO nâng cao');
      }

      updateQuote();
    });
  });

  updateQuote();
}

initializeQuoteBuilder();

function initializeFaq() {
  const faq = document.querySelector('[data-faq]');
  if (!faq) return;

  const items = [...faq.querySelectorAll('.faq-item')];

  items.forEach((item) => {
    const button = item.querySelector('button');
    if (!button) return;

    button.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');

      items.forEach((otherItem) => {
        otherItem.classList.remove('is-open');
        otherItem.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

initializeFaq();

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
      status.classList.remove('is-success');
      status.classList.add('is-error');
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
      status.classList.remove('is-success');
      status.classList.add('is-error');
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Đang gửi...';
    status.textContent = 'Đang chuyển yêu cầu đến Webs4V.';
    status.classList.remove('is-success', 'is-error');

    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(payload),
      });

      form.reset();
      formStartedAt = Date.now();
      try {
        window.localStorage.setItem(cooldownKey, String(Date.now()));
      } catch {
        // The server-side rate limit remains active when local storage is unavailable.
      }
      status.textContent = 'Đã gửi thành công. Webs4V sẽ liên hệ với bạn trong thời gian sớm nhất.';
      status.classList.add('is-success');
      submitButton.querySelector('span').textContent = 'Đã gửi yêu cầu';
      const { default: Swal } = await import('sweetalert2');
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
      status.classList.add('is-error');
      submitButton.querySelector('span').textContent = 'Thử gửi lại';
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
    }
  });
}

initializeContactForm();

let loadingFinished = false;

function finishLoading() {
  if (loadingFinished) return;
  loadingFinished = true;
  window.clearTimeout(window.__webs4vLoadingWatchdog);
  if (loaderBar) loaderBar.style.width = '100%';
  if (loaderValue) loaderValue.textContent = '100%';
  loader?.style.setProperty('--loader-progress', '100');
  window.setTimeout(() => {
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
  }, reducedMotion ? 0 : 180);
}

function getPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 1.15 : 1.55);
}

const pointer = new THREE.Vector2(0.5, 0.5);
const previousPointer = new THREE.Vector2(0.5, 0.5);
const smoothPointer = new THREE.Vector2(0.5, 0.5);
let pointerMoved = false;
let pointerEnergy = 0;
let scrollProgress = 0;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(getPixelRatio());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.76;

const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (_url, loaded, total) => {
  const progress = Math.round((loaded / Math.max(total, 1)) * 100);
  if (loaderBar) loaderBar.style.width = `${progress}%`;
  if (loaderValue) loaderValue.textContent = `${progress}%`;
  loader?.style.setProperty('--loader-progress', String(progress));
};

const textureLoader = new THREE.TextureLoader(loadingManager);

function loadTexture(url, colorSpace = THREE.NoColorSpace) {
  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        texture.colorSpace = colorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

class WaterRipple {
  constructor() {
    this.scale = lowPowerDevice ? 0.3 : 0.46;
    this.maxIterations = lowPowerDevice ? 2 : 4;
    this.read = null;
    this.write = null;
    this.accumulator = 0;
    this.step = 1 / 60;
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.material = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPrevious: { value: null },
        uTexelSize: { value: new THREE.Vector2() },
        uAspect: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: pointer.clone() },
        uOldPointer: { value: previousPointer.clone() },
        uRenderPointer: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec2 vUvAspect;
        uniform vec2 uAspect;

        void main() {
          vUv = uv;
          vUvAspect = uv * uAspect;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        varying vec2 vUvAspect;
        uniform sampler2D uPrevious;
        uniform vec2 uTexelSize;
        uniform vec2 uAspect;
        uniform vec2 uPointer;
        uniform vec2 uOldPointer;
        uniform float uRenderPointer;
        uniform float uTime;

        float distanceToSegment(vec2 point, vec2 start, vec2 end) {
          vec2 segment = end - start;
          float segmentLength = max(dot(segment, segment), 0.000001);
          float amount = clamp(dot(point - start, segment) / segmentLength, 0.0, 1.0);
          return distance(point, start + segment * amount);
        }

        void main() {
          vec2 pointerAspect = uPointer * uAspect;
          vec2 oldPointerAspect = uOldPointer * uAspect;
          float movement = distance(pointerAspect, oldPointerAspect);
          float distanceToStroke = distanceToSegment(vUvAspect, oldPointerAspect, pointerAspect);
          float radius = 0.035 + sin(uTime * 12.5663706) * 0.02;
          float ripple = smoothstep(radius, 0.0, distanceToStroke) * smoothstep(0.0, 0.01, movement) * uRenderPointer;

          vec2 offset = 3.6 * uTexelSize;
          float top = texture2D(uPrevious, vUv + vec2(0.0, offset.y)).r;
          float bottom = texture2D(uPrevious, vUv - vec2(0.0, offset.y)).r;
          float left = texture2D(uPrevious, vUv - vec2(offset.x, 0.0)).r;
          float right = texture2D(uPrevious, vUv + vec2(offset.x, 0.0)).r;
          vec2 history = texture2D(uPrevious, vUv).rg;
          float result = ripple * 2.0 + (top + right + bottom + left) * 0.5 - history.g;
          result *= 0.98;

          gl_FragColor = vec4(result, history.r, 0.0, 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
    this.resize(window.innerWidth, window.innerHeight);
  }

  createTarget(width, height) {
    return new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }

  clear(target) {
    const activeTarget = renderer.getRenderTarget();
    const clearColor = renderer.getClearColor(new THREE.Color());
    const clearAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.setRenderTarget(activeTarget);
    renderer.setClearColor(clearColor, clearAlpha);
  }

  resize(width, height) {
    this.read?.dispose();
    this.write?.dispose();
    const targetWidth = Math.max(96, Math.round(width * this.scale));
    const targetHeight = Math.max(96, Math.round(height * this.scale));
    this.read = this.createTarget(targetWidth, targetHeight);
    this.write = this.createTarget(targetWidth, targetHeight);
    this.clear(this.read);
    this.clear(this.write);
    this.material.uniforms.uPrevious.value = this.read.texture;
    this.material.uniforms.uTexelSize.value.set(1 / targetWidth, 1 / targetHeight);
    const aspect = width / height;
    this.material.uniforms.uAspect.value.set(aspect > 1 ? aspect : 1, aspect > 1 ? 1 : 1 / aspect);
  }

  update(delta, elapsed) {
    this.accumulator += Math.min(delta, 0.05);
    this.material.uniforms.uPointer.value.copy(pointer);
    this.material.uniforms.uTime.value = elapsed;
    let iterations = 0;

    while (this.accumulator >= this.step && iterations < this.maxIterations) {
      this.material.uniforms.uPrevious.value = this.read.texture;
      this.material.uniforms.uOldPointer.value.copy(previousPointer);
      this.material.uniforms.uRenderPointer.value = pointerMoved ? 1 : 0;

      const activeTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(this.write);
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(activeTarget);

      const swap = this.read;
      this.read = this.write;
      this.write = swap;
      previousPointer.copy(pointer);
      pointerMoved = false;
      this.accumulator -= this.step;
      iterations += 1;
    }
  }
}

class PointerTrail {
  constructor() {
    this.scale = lowPowerDevice ? 0.28 : 0.44;
    this.maxIterations = lowPowerDevice ? 2 : 4;
    this.read = null;
    this.write = null;
    this.accumulator = 0;
    this.step = 1 / 60;
    this.oldPointer = pointer.clone();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.material = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPrevious: { value: null },
        uTexelSize: { value: new THREE.Vector2() },
        uAspect: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: pointer.clone() },
        uOldPointer: { value: pointer.clone() },
        uRenderPointer: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec2 vUvAspect;
        uniform vec2 uAspect;

        void main() {
          vUv = uv;
          vUvAspect = uv * uAspect;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        varying vec2 vUvAspect;
        uniform sampler2D uPrevious;
        uniform vec2 uTexelSize;
        uniform vec2 uAspect;
        uniform vec2 uPointer;
        uniform vec2 uOldPointer;
        uniform float uRenderPointer;

        float distanceToSegment(vec2 point, vec2 start, vec2 end) {
          vec2 segment = end - start;
          float segmentLength = max(dot(segment, segment), 0.000001);
          float amount = clamp(dot(point - start, segment) / segmentLength, 0.0, 1.0);
          return distance(point, start + segment * amount);
        }

        void main() {
          vec2 history = texture2D(uPrevious, vUv).rg;
          float maxTexelSize = max(uTexelSize.x, uTexelSize.y);
          vec2 spread = 10.5 * uTexelSize;
          float intensity = (
            history.r +
            texture2D(uPrevious, vUv + vec2(spread.x, 0.0)).r +
            texture2D(uPrevious, vUv - vec2(spread.x, 0.0)).r +
            texture2D(uPrevious, vUv + vec2(0.0, spread.y)).r +
            texture2D(uPrevious, vUv - vec2(0.0, spread.y)).r
          ) * 0.2 * 0.995;

          if (uRenderPointer > 0.0) {
            vec2 pointerAspect = uPointer * uAspect;
            vec2 oldPointerAspect = uOldPointer * uAspect;
            float movement = distance(pointerAspect, oldPointerAspect);
            float distanceToStroke = distanceToSegment(vUvAspect, oldPointerAspect, pointerAspect);
            float stroke = smoothstep(100.0 * maxTexelSize, 50.0 * maxTexelSize, distanceToStroke) * smoothstep(0.0, 0.01, movement);
            intensity = max(intensity, stroke);
          }

          gl_FragColor = vec4(intensity, history.r, 0.0, 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
    this.resize(window.innerWidth, window.innerHeight);
  }

  createTarget(width, height) {
    return new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }

  clear(target) {
    const activeTarget = renderer.getRenderTarget();
    const clearColor = renderer.getClearColor(new THREE.Color());
    const clearAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.setRenderTarget(activeTarget);
    renderer.setClearColor(clearColor, clearAlpha);
  }

  resize(width, height) {
    this.read?.dispose();
    this.write?.dispose();
    const targetWidth = Math.max(96, Math.round(width * this.scale));
    const targetHeight = Math.max(96, Math.round(height * this.scale));
    this.read = this.createTarget(targetWidth, targetHeight);
    this.write = this.createTarget(targetWidth, targetHeight);
    this.clear(this.read);
    this.clear(this.write);
    this.material.uniforms.uPrevious.value = this.read.texture;
    this.material.uniforms.uTexelSize.value.set(1 / targetWidth, 1 / targetHeight);
    const aspect = width / height;
    this.material.uniforms.uAspect.value.set(aspect > 1 ? aspect : 1, aspect > 1 ? 1 : 1 / aspect);
  }

  update(delta) {
    this.accumulator += Math.min(delta, 0.05);
    this.material.uniforms.uPointer.value.copy(pointer);
    let iterations = 0;

    while (this.accumulator >= this.step && iterations < this.maxIterations) {
      this.material.uniforms.uPrevious.value = this.read.texture;
      this.material.uniforms.uOldPointer.value.copy(this.oldPointer);
      this.material.uniforms.uRenderPointer.value = pointerMoved ? 1 : 0;

      const activeTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(this.write);
      renderer.render(this.scene, this.camera);
      renderer.setRenderTarget(activeTarget);

      const swap = this.read;
      this.read = this.write;
      this.write = swap;
      this.oldPointer.copy(pointer);
      this.accumulator -= this.step;
      iterations += 1;
    }
  }
}

const pointerTrail = new PointerTrail();
const waterRipple = new WaterRipple();
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const clock = new THREE.Clock();

const backgroundUniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uPointer: { value: pointer.clone() },
  uPointerEnergy: { value: 0 },
  uScroll: { value: 0 },
  uRipple: { value: waterRipple.read.texture },
  uRippleTexel: { value: new THREE.Vector2(1 / waterRipple.read.width, 1 / waterRipple.read.height) },
  uTrail: { value: pointerTrail.read.texture },
  uTrailTexel: { value: new THREE.Vector2(1 / pointerTrail.read.width, 1 / pointerTrail.read.height) },
  uIce: { value: null },
  uIceDisplacement: { value: null },
  uIceNormal: { value: null },
  uWaves: { value: null },
  uNoise: { value: null },
};

const backgroundMaterial = new THREE.ShaderMaterial({
  depthTest: false,
  depthWrite: false,
  uniforms: backgroundUniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uPointerEnergy;
    uniform float uScroll;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform vec2 uRippleTexel;
    uniform vec2 uTrailTexel;
    uniform sampler2D uRipple;
    uniform sampler2D uTrail;
    uniform sampler2D uIce;
    uniform sampler2D uIceDisplacement;
    uniform sampler2D uIceNormal;
    uniform sampler2D uWaves;
    uniform sampler2D uNoise;

    vec3 spectrum(float phase) {
      return 0.5 + 0.5 * cos(6.2831853 * (phase + vec3(0.0, 0.333333, 0.666667)));
    }

    vec3 sampleWaterNormal(vec2 uv) {
      vec2 uv0 = uv * 0.74 + vec2(uTime / 42.0, uTime / 68.0);
      vec2 uv1 = uv * 0.93 - vec2(uTime / 51.0, -uTime / 76.0);
      vec2 uv2 = uv * vec2(0.18, 0.21) + vec2(uTime / 210.0, uTime / 185.0);
      vec2 uv3 = uv * vec2(0.46, 0.52) - vec2(uTime / 235.0, -uTime / 260.0);
      vec3 waves = texture2D(uWaves, uv0).rgb + texture2D(uWaves, uv1).rgb + texture2D(uWaves, uv2).rgb + texture2D(uWaves, uv3).rgb;
      waves = waves * 0.5 - 1.0;
      vec3 iceNormal = texture2D(uIceNormal, uv * 0.78 + waves.xy * 0.015).rgb * 2.0 - 1.0;
      return normalize(vec3(waves.xy * 0.42 + iceNormal.xy * 0.36, 1.0));
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      vec2 aspectScale = vec2(aspect > 1.0 ? aspect : 1.0, aspect > 1.0 ? 1.0 : 1.0 / aspect);
      vec2 sunPosition = vec2(0.66 + uScroll * 0.018, 0.74 - uScroll * 0.028);

      vec2 trailHistory = texture2D(uTrail, uv).rg;
      float trailValue = mix(trailHistory.g, trailHistory.r, 0.72);
      float trailLeft = texture2D(uTrail, uv - vec2(uTrailTexel.x * 4.0, 0.0)).r;
      float trailRight = texture2D(uTrail, uv + vec2(uTrailTexel.x * 4.0, 0.0)).r;
      float trailBottom = texture2D(uTrail, uv - vec2(0.0, uTrailTexel.y * 4.0)).r;
      float trailTop = texture2D(uTrail, uv + vec2(0.0, uTrailTexel.y * 4.0)).r;
      vec2 trailNormal = vec2(trailRight - trailLeft, trailTop - trailBottom);
      float trailMask = smoothstep(0.018, 0.52, trailValue);
      float trailEdge = smoothstep(0.012, 0.16, length(trailNormal));

      vec2 rippleHistory = texture2D(uRipple, uv).rg;
      float rippleHeight = mix(rippleHistory.g, rippleHistory.r, 0.72);
      float rippleLeft = texture2D(uRipple, uv - vec2(uRippleTexel.x * 2.0, 0.0)).r;
      float rippleRight = texture2D(uRipple, uv + vec2(uRippleTexel.x * 2.0, 0.0)).r;
      float rippleBottom = texture2D(uRipple, uv - vec2(0.0, uRippleTexel.y * 2.0)).r;
      float rippleTop = texture2D(uRipple, uv + vec2(0.0, uRippleTexel.y * 2.0)).r;
      vec2 rippleNormal = vec2(rippleRight - rippleLeft, rippleTop - rippleBottom);

      vec2 interactionGradient = trailNormal * 0.86 + rippleNormal * 1.48;
      float interactionStrength = clamp(length(interactionGradient) * 2.4 + abs(rippleHeight) * 0.18, 0.0, 1.0);
      vec3 waterNormal = sampleWaterNormal(uv * aspectScale + trailNormal * 0.1 + uScroll * vec2(0.015, -0.02));

      vec2 autoOriginA = vec2(0.24, 0.32);
      vec2 autoOriginB = vec2(0.78, 0.68);
      vec2 autoVectorA = (uv - autoOriginA) * aspectScale;
      vec2 autoVectorB = (uv - autoOriginB) * aspectScale;
      float autoDistanceA = length(autoVectorA);
      float autoDistanceB = length(autoVectorB);
      float autoWaveA = cos(autoDistanceA * 27.0 - uTime * 1.15) * 0.5 + 0.5;
      float autoWaveB = cos(autoDistanceB * 32.0 - uTime * 0.92) * 0.5 + 0.5;
      vec2 autoRipple = normalize(autoVectorA + vec2(0.0001)) * (autoWaveA - 0.5)
        + normalize(autoVectorB + vec2(0.0001)) * (autoWaveB - 0.5);
      vec2 ambientSwell = vec2(
        sin(uv.y * 12.0 + uTime * 0.42),
        cos(uv.x * 10.0 - uTime * 0.36)
      ) * 0.0018;
      vec2 distortion = waterNormal.xy * 0.007 + ambientSwell + autoRipple * 0.0045 + interactionGradient * 0.046;
      vec2 waterUv = uv + distortion;

      vec3 lightTop = vec3(0.91, 0.86, 0.97);
      vec3 lightMiddle = vec3(0.82, 0.87, 1.0);
      vec3 lightBottom = vec3(0.75, 0.92, 1.0);
      vec3 lightColor = mix(lightBottom, lightMiddle, smoothstep(0.0, 0.58, waterUv.y));
      lightColor = mix(lightColor, lightTop, smoothstep(0.48, 1.0, waterUv.y + waterUv.x * 0.06));

      vec3 color = lightColor;

      float iceDark = texture2D(uIce, waterUv * 0.62 + vec2(uTime * 0.0018, -uTime * 0.0012)).r;
      float iceLight = texture2D(uIceDisplacement, waterUv * 0.62 + waterNormal.xy * 0.012).r;
      float noise = texture2D(uNoise, waterUv * 1.35 + uTime * 0.00025).r;
      float caustic = smoothstep(0.56, 0.93, iceDark) * 0.34 + smoothstep(0.72, 1.0, iceLight) * 0.12;
      vec3 causticTint = vec3(0.76, 0.88, 1.0);
      color += causticTint * caustic * 0.1;
      color += (noise - 0.5) * 0.012;

      vec3 surfaceNormal = normalize(vec3(-(waterNormal.xy * 0.3 + autoRipple * 0.1 + interactionGradient * 3.2), 1.0));
      vec3 viewDirection = normalize(vec3((vec2(0.5) - uv) * aspectScale * 0.18, 1.0));
      vec3 lightDirection = normalize(vec3((sunPosition - uv) * aspectScale, 0.38));
      vec3 halfDirection = normalize(viewDirection + lightDirection);
      float fresnel = pow(1.0 - max(dot(surfaceNormal, viewDirection), 0.0), 3.0);
      float specular = pow(max(dot(surfaceNormal, halfDirection), 0.0), 64.0);

      vec2 prismOffset = interactionGradient * 0.05 + surfaceNormal.xy * 0.008;
      vec2 prismUv = waterUv * 0.52 + waterNormal.xy * 0.018;
      vec3 refractedDetail = vec3(
        texture2D(uIceDisplacement, prismUv + prismOffset * 1.18).r,
        texture2D(uIceDisplacement, prismUv + prismOffset).r,
        texture2D(uIceDisplacement, prismUv + prismOffset * 0.82).r
      );
      float refractedLuma = dot(refractedDetail, vec3(0.299, 0.587, 0.114));
      vec3 spectralRefraction = refractedDetail - vec3(refractedLuma);
      vec3 edgeSpectrum = spectrum(atan(interactionGradient.y, interactionGradient.x) / 6.2831853 + trailValue * 0.2 - uTime * 0.002);
      vec3 lightLiquid = mix(color, vec3(0.75, 0.79, 0.96), 0.13) + spectralRefraction * 0.1;
      color = mix(color, lightLiquid, trailMask * 0.22);
      color += spectralRefraction * trailMask * 0.08;
      color += (edgeSpectrum - vec3(0.5)) * trailEdge * (0.05 + fresnel * 0.07);
      color += vec3(1.0, 0.97, 0.93) * specular * trailMask * (0.07 + interactionStrength * 0.09);
      float sparkleNoise = texture2D(uNoise, waterUv * 4.8 + vec2(-uTime * 0.0015, uTime * 0.001)).r;
      float sparkle = smoothstep(0.987, 0.998, sparkleNoise) * trailEdge;
      color += vec3(1.0) * sparkle * 0.12;

      vec2 sunVector = (uv - sunPosition) * aspectScale;
      float sunDistance = length(sunVector);
      float sunCore = smoothstep(0.052, 0.0, sunDistance);
      float sunGlow = exp(-sunDistance * 9.2);
      float sunCorona = exp(-abs(sunDistance - 0.078) * 56.0);
      float sunHalo = exp(-abs(sunDistance - 0.22) * 34.0);
      float sunAngle = atan(sunVector.y, sunVector.x) / 6.2831853;
      vec3 sunSpectrum = spectrum(sunDistance * 1.72 + sunAngle * 0.045 - uTime * 0.004);
      color += vec3(1.0, 0.89, 0.83) * sunGlow * 0.058;
      color = mix(color, vec3(1.0, 0.96, 0.91), sunCore * 0.44);
      color += (sunSpectrum - vec3(0.5)) * sunCorona * 0.02;
      color += (sunSpectrum - vec3(0.46)) * sunHalo * 0.008;

      vec2 pointerVector = (uv - uPointer) * aspectScale;
      float pointerDistance = length(pointerVector);
      float cursorRadius = 0.072 + sin(uTime * 2.2) * 0.004;
      float cursorRing = exp(-abs(pointerDistance - cursorRadius) * 115.0) * uPointerEnergy;
      float rippleEnergy = smoothstep(0.025, 0.34, abs(rippleHeight) + length(rippleNormal));
      rippleEnergy = min(rippleEnergy, 0.36);
      vec3 rippleSpectrum = spectrum(atan(rippleNormal.y, rippleNormal.x) / 6.2831853 + rippleHeight * 0.18 + uTime * 0.006);
      vec3 lightRipple = (rippleSpectrum - vec3(0.42)) * rippleEnergy * 0.038;
      color += lightRipple;
      color += spectrum(pointerDistance * 1.7 - uTime * 0.008) * cursorRing * 0.018;
      color += vec3(0.94, 0.98, 1.0) * max(rippleNormal.x - rippleNormal.y, 0.0) * 0.018;

      float vignette = smoothstep(1.12, 0.24, length((uv - 0.5) * vec2(0.76, 1.0)));
      color *= mix(0.96, 1.03, vignette);
      color /= 1.0 + max(color - vec3(0.82), vec3(0.0)) * 0.45;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backgroundMaterial));

function updateScroll() {
  const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollProgress = THREE.MathUtils.clamp(window.scrollY / limit, 0, 1);
  document.documentElement.style.setProperty('--page-progress', scrollProgress.toFixed(4));
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

const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
document.querySelectorAll('.primary-nav a, .mobile-menu nav a').forEach((link) => {
  const linkPath = new URL(link.href).pathname.replace(/\/+$/, '') || '/';
  if (linkPath === currentPath) link.setAttribute('aria-current', 'page');
});

function updatePointer(event) {
  pointer.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
  pointerMoved = true;
  pointerEnergy = 1;
  body.classList.add('has-pointer');
  if (cursor) cursor.style.transform = `translate3d(${event.clientX - 26}px, ${event.clientY - 26}px, 0)`;
}

window.addEventListener('pointermove', updatePointer, { passive: true });
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('pointerleave', () => body.classList.remove('has-pointer'));
menuToggle?.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
menuBackdrop?.addEventListener('click', () => setMenuOpen(false));
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1050 && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
  } else if (menuToggle?.getAttribute('aria-expanded') === 'true') {
    updateMenuRevealOrigin();
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(getPixelRatio());
  pointerTrail.resize(window.innerWidth, window.innerHeight);
  waterRipple.resize(window.innerWidth, window.innerHeight);
  backgroundUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  backgroundUniforms.uRipple.value = waterRipple.read.texture;
  backgroundUniforms.uRippleTexel.value.set(1 / waterRipple.read.width, 1 / waterRipple.read.height);
  backgroundUniforms.uTrail.value = pointerTrail.read.texture;
  backgroundUniforms.uTrailTexel.value.set(1 / pointerTrail.read.width, 1 / pointerTrail.read.height);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2 },
);
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const typewriter = document.querySelector('.typewriter');

if (typewriter && !reducedMotion) {
  const phrase = typewriter.textContent.trim();
  const characters = Array.from(phrase);
  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  async function loopTypewriter() {
    await wait(900);

    while (true) {
      for (let index = characters.length; index >= 0; index -= 1) {
        typewriter.textContent = characters.slice(0, index).join('');
        await wait(45);
      }

      await wait(450);

      for (let index = 1; index <= characters.length; index += 1) {
        typewriter.textContent = characters.slice(0, index).join('');
        await wait(85);
      }

      await wait(2200);
    }
  }

  loopTypewriter();
}

function render() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  smoothPointer.lerp(pointer, 1 - Math.exp(-delta * 5));
  pointerEnergy = THREE.MathUtils.damp(pointerEnergy, 0, 1.7, delta);

  if (!reducedMotion) {
    pointerTrail.update(delta);
    waterRipple.update(delta, elapsed);
  }
  backgroundUniforms.uTime.value = reducedMotion ? 0 : elapsed;
  backgroundUniforms.uPointer.value.copy(smoothPointer);
  backgroundUniforms.uPointerEnergy.value = pointerEnergy;
  backgroundUniforms.uScroll.value = scrollProgress;
  backgroundUniforms.uRipple.value = waterRipple.read.texture;
  backgroundUniforms.uTrail.value = pointerTrail.read.texture;

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

async function initialize() {
  const [ice, iceDisplacement, iceNormal, waves, noise] = await Promise.all([
    loadTexture(iceUrl, THREE.SRGBColorSpace),
    loadTexture(iceDisplacementUrl),
    loadTexture(iceNormalUrl),
    loadTexture(wavesUrl),
    loadTexture(noiseUrl),
  ]);

  backgroundUniforms.uIce.value = ice;
  backgroundUniforms.uIceDisplacement.value = iceDisplacement;
  backgroundUniforms.uIceNormal.value = iceNormal;
  backgroundUniforms.uWaves.value = waves;
  backgroundUniforms.uNoise.value = noise;

  finishLoading();

  renderer.render(scene, camera);
}

updateScroll();
render();
initialize().catch((error) => {
  console.error('Không thể khởi tạo nền mặt nước.', error);
  finishLoading();
});
