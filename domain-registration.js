import { CONSENT_PURPOSES, PRIVACY_POLICY_VERSION } from './privacy-consent.js';

const DEFAULT_SUFFIXES = ['.vn', '.com', '.com.vn', '.net', '.id.vn'];
const API_BASE = (window.WEBS4V_STOREFRONT_API || document.querySelector('meta[name="webs4v-storefront-api"]')?.content || '').replace(/\/$/, '');
const DOMAIN_STORE_ENDPOINT = window.WEBS4V_DOMAIN_STORE_ENDPOINT
  || document.querySelector('meta[name="webs4v-domain-store-endpoint"]')?.content
  || window.WEBS4V_DOMAIN_CHECK_ENDPOINT
  || document.querySelector('meta[name="webs4v-domain-check-endpoint"]')?.content
  || '';
const PAGE_STARTED_AT = Date.now();

const state = {
  items: [],
  orderMode: API_BASE || DOMAIN_STORE_ENDPOINT ? 'live' : 'preview',
  domainMode: API_BASE || DOMAIN_STORE_ENDPOINT ? 'live' : 'preview',
};

const ORDER_ERROR_MESSAGES = {
  consent_required: 'Bạn cần đồng ý Chính sách bảo mật trước khi gửi yêu cầu.',
  invalid_customer: 'Thông tin liên hệ chưa hợp lệ. Vui lòng kiểm tra lại họ tên, số điện thoại và email.',
  invalid_items: 'Danh sách tên miền chưa hợp lệ. Vui lòng kiểm tra và chọn lại tên miền.',
  invalid_timing: 'Phiên gửi yêu cầu đã hết hạn. Vui lòng tải lại trang rồi thử lại.',
  rate_limited: 'Bạn đã gửi quá nhiều lần. Vui lòng chờ một lúc rồi thử lại.',
  server_error: 'Hệ thống chưa thể lưu yêu cầu lúc này. Vui lòng thử lại sau hoặc liên hệ trực tiếp với Webs4V.',
};

async function showOrderAlert(options) {
  const [{ default: Swal }] = await Promise.all([
    import('sweetalert2'),
    import('sweetalert2/dist/sweetalert2.min.css'),
  ]);

  return Swal.fire({
    confirmButtonColor: '#1769e8',
    confirmButtonText: 'Hoàn tất',
    heightAuto: false,
    returnFocus: false,
    ...options,
  });
}

function orderErrorMessage(code) {
  return ORDER_ERROR_MESSAGES[code] || 'Không thể tạo yêu cầu lúc này. Vui lòng thử lại.';
}

function normalizeDomain(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]
    .replace(/\s+/g, '');
}

function isValidDomainInput(value) {
  return value.length >= 2
    && value.length <= 253
    && !value.startsWith('.')
    && !value.endsWith('.')
    && /^[a-z0-9.-]+$/.test(value)
    && !value.includes('..');
}

function buildCandidates(query) {
  if (query.includes('.')) return [query];
  return DEFAULT_SUFFIXES.map((suffix) => `${query}${suffix}`);
}

function getDomainSuffix(domain) {
  const labels = String(domain || '').split('.').filter(Boolean);
  if (labels.length < 2) return '';
  return `.${labels.slice(1).join('.')}`;
}

function getDomainCategory(suffix) {
  return suffix.endsWith('.vn') ? 'Tên miền Việt Nam' : 'Tên miền quốc tế';
}

function formatPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 'Giá xác nhận khi tạo đơn';
  return `${new Intl.NumberFormat('vi-VN').format(numeric)}đ / năm`;
}

function formatDomainDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function detailRow(label, value, wide = false, variant = '') {
  if (!value) return '';
  const variantClass = variant ? ` domain-result__detail--${variant}` : '';
  return `<div class="domain-result__detail${wide ? ' domain-result__detail--wide' : ''}${variantClass}">
    <dt>${escapeHtml(label)}</dt>
    <dd>${escapeHtml(value)}</dd>
  </div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function requestDomainResults(domains) {
  if (API_BASE) {
    const response = await fetch(`${API_BASE}/domains/check.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains }),
    });

    if (!response.ok) throw new Error('Không thể kiểm tra tên miền lúc này.');
    const payload = await response.json();
    const results = Array.isArray(payload) ? payload : payload.results || payload.data || [];
    return mapDomainResults(domains, results);
  }

  if (DOMAIN_STORE_ENDPOINT) {
    const payload = await requestDomainResultsThroughIframe(domains);
    if (!payload.ok) throw new Error(domainCheckErrorMessage(payload.error));
    return mapDomainResults(domains, payload.results || []);
  }

  state.domainMode = 'preview';
  return domains.map((domain) => ({ domain, availability: 'pending', price: null }));
}

function mapDomainResults(domains, results) {
  return domains.map((domain) => {
    const match = results.find((item) => (item.domain || item.domainName || item.name || '').toLowerCase() === domain);
    return {
      domain,
      availability: match?.availability ?? match?.available ?? match?.isAvailable ?? match?.status ?? 'unknown',
      price: match?.sellingPrice ?? match?.price ?? match?.registerPrice ?? null,
      registrationPrice: match?.registrationPrice ?? match?.registerPrice ?? match?.price ?? null,
      renewalPrice: match?.renewalPrice ?? match?.renewPrice ?? null,
      transferPrice: match?.transferPrice ?? null,
      whois: match?.whois ?? null,
    };
  });
}

function isTrustedDomainStoreMessage(event) {
  const origin = String(event.origin || '');
  return origin === 'https://script.google.com'
    || /^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/i.test(origin);
}

function requestDomainResultsThroughIframe(domains) {
  return new Promise((resolve, reject) => {
    const requestId = `domain-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const iframe = document.createElement('iframe');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Hệ thống kiểm tra phản hồi quá lâu. Vui lòng thử lại.'));
    }, 25000);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener('message', handleMessage);
      iframe.remove();
    }

    function handleMessage(event) {
      // Apps Script runs HtmlService inside a nested sandbox frame, so the
      // message source is not the outer iframe created on this page.
      if (!isTrustedDomainStoreMessage(event)) return;
      const payload = event.data;
      if (!payload || payload.source !== 'webs4v-domain-check' || payload.requestId !== requestId) return;
      cleanup();
      resolve(payload);
    }

    window.addEventListener('message', handleMessage);
    const url = new URL(DOMAIN_STORE_ENDPOINT);
    url.searchParams.set('action', 'domain-check');
    url.searchParams.set('responseMode', 'iframe');
    url.searchParams.set('requestId', requestId);
    url.searchParams.set('domains', domains.join(','));
    iframe.hidden = true;
    iframe.title = 'Kết quả kiểm tra tên miền';
    iframe.referrerPolicy = 'no-referrer';
    iframe.src = url.toString();
    document.body.appendChild(iframe);
  });
}

function domainCheckErrorMessage(errorCode) {
  if (errorCode === 'invalid_domain') return 'Tên miền chưa đúng định dạng. Vui lòng kiểm tra lại.';
  if (errorCode === 'rate_limited') return 'Có quá nhiều lượt kiểm tra. Vui lòng thử lại sau ít phút.';
  return 'Chưa thể kiểm tra tên miền lúc này. Vui lòng thử lại.';
}

function renderDomainResults(results) {
  const container = document.querySelector('[data-domain-results]');
  if (!container) return;

  const previewNotice = state.domainMode === 'preview'
    ? '<p class="domain-results__notice"><strong>Chưa kết nối dịch vụ tra cứu:</strong> hệ thống chưa thể xác nhận tên miền còn trống hay đã được đăng ký.</p>'
    : '';

  const cards = results.map((result) => {
    const normalizedStatus = String(result.availability).toLowerCase();
    const available = ['available', 'true', '1'].includes(normalizedStatus);
    const taken = ['notavailable', 'unavailable', 'registered', 'taken', 'false', '0'].includes(normalizedStatus);
    const statusClass = available ? '' : taken ? ' domain-result__status--taken' : ' domain-result__status--pending';
    const statusLabel = available ? 'Còn trống — có thể đăng ký' : taken ? 'Đã có người đăng ký' : 'Chưa thể xác minh';
    const disabled = available ? '' : ' disabled';
    const actionLabel = available ? 'Nhận tư vấn' : taken ? 'Đã được đăng ký' : 'Vui lòng thử lại';
    const registrationPrice = result.registrationPrice || result.price;
    const suffix = getDomainSuffix(result.domain);
    const domainCategory = getDomainCategory(suffix);
    const priceLabel = available
      ? registrationPrice ? `Đăng ký: ${formatPrice(registrationPrice)}` : 'Đang xác nhận giá đăng ký'
      : taken ? 'Tên miền không còn trống' : 'Chưa có thông tin giá';
    const whois = result.whois || {};
    const detailRows = available
      ? [
          detailRow('Phí đăng ký', registrationPrice ? formatPrice(registrationPrice) : '', false, 'price-primary'),
          detailRow('Phí gia hạn', result.renewalPrice ? formatPrice(result.renewalPrice) : '', false, 'price'),
          detailRow('Phí chuyển về', result.transferPrice ? formatPrice(result.transferPrice) : '', false, 'price'),
          detailRow('Đuôi tên miền', suffix),
          detailRow('Phân loại', domainCategory),
          detailRow('Thời hạn đăng ký', 'Từ 1 đến 10 năm'),
          detailRow('Đơn vị hỗ trợ đăng ký', 'CÔNG TY TNHH CÔNG NGHỆ WEBS4V.VN'),
          detailRow('WHOIS', 'Chưa phát sinh vì tên miền chưa được đăng ký', true),
          detailRow('Nameserver & DNSSEC', 'Thiết lập sau khi đăng ký và kích hoạt tên miền', true),
        ]
      : taken
        ? [
            detailRow('Đuôi tên miền', suffix),
            detailRow('Phân loại', domainCategory),
            detailRow('Ngày đăng ký', formatDomainDate(whois.createdAt)),
            detailRow('Ngày hết hạn', formatDomainDate(whois.expiresAt)),
            detailRow('Nhà đăng ký', whois.registrar),
            detailRow('Chủ thể đăng ký', whois.registrantName || whois.registrantOrganization),
            detailRow('Trạng thái', Array.isArray(whois.statuses) ? whois.statuses.join(', ') : whois.statuses, true),
            detailRow('Nameserver', Array.isArray(whois.nameservers) ? whois.nameservers.join(' · ') : whois.nameservers, true),
            detailRow('DNSSEC', whois.dnssec === 'signed' ? 'Đã ký' : whois.dnssec === 'unsigned' ? 'Chưa ký' : ''),
          ]
        : [];
    const visibleDetails = detailRows.filter(Boolean).join('');
    const detailTitle = available ? 'Thông tin đăng ký' : 'Thông tin WHOIS công khai';
    const taxNotice = available
      ? '<p class="domain-result__tax-note">Các mức phí hiển thị chưa bao gồm thuế GTGT (VAT).</p>'
      : '';
    const details = visibleDetails
      ? `<div class="domain-result__details"><span>${detailTitle}</span><dl>${visibleDetails}</dl>${taxNotice}</div>`
      : '';

    return `<article class="domain-result">
      <div class="domain-result__summary">
        <strong class="domain-result__name">${escapeHtml(result.domain)}</strong>
        <div class="domain-result__meta">
          <span class="domain-result__status${statusClass}">${statusLabel}</span>
          <span>${priceLabel}</span>
        </div>
      </div>
      <button class="domain-result__action" type="button" data-add-domain="${escapeHtml(result.domain)}" data-price="${result.price || ''}"${disabled}>${actionLabel}</button>
      ${details}
    </article>`;
  }).join('');

  container.innerHTML = `${previewNotice}${cards}`;
}

function itemKey(item) {
  return `${item.type}:${item.id}`;
}

function addItem(item) {
  const exists = state.items.some((entry) => itemKey(entry) === itemKey(item));
  if (exists) return;
  state.items.push(item);
  renderCart();
}

function removeItem(key) {
  state.items = state.items.filter((entry) => itemKey(entry) !== key);
  renderCart();
}

function renderCart() {
  const itemsContainer = document.querySelector('[data-cart-items]');
  const count = document.querySelector('[data-cart-count]');
  const total = document.querySelector('[data-cart-total]');
  if (!itemsContainer || !count || !total) return;

  count.textContent = `${state.items.length} hạng mục`;

  if (!state.items.length) {
    itemsContainer.innerHTML = '<div class="order-cart__empty"><strong>Chưa có tên miền</strong><p>Kiểm tra và chọn một tên miền ở phía trên.</p></div>';
    total.textContent = 'Chờ xác nhận giá';
  } else {
    itemsContainer.innerHTML = state.items.map((item) => `<div class="cart-item">
      <div><strong>${escapeHtml(item.name)}</strong><small>${formatPrice(item.price)}</small></div>
      <button type="button" data-remove-item="${escapeHtml(itemKey(item))}">Bỏ chọn</button>
    </div>`).join('');

    const priced = state.items.filter((item) => Number(item.price) > 0);
    const knownTotal = priced.reduce((sum, item) => sum + Number(item.price), 0);
    total.textContent = priced.length === state.items.length
      ? `${new Intl.NumberFormat('vi-VN').format(knownTotal)}đ`
      : knownTotal > 0
        ? `Từ ${new Intl.NumberFormat('vi-VN').format(knownTotal)}đ`
        : 'Chờ xác nhận giá';
  }

}

function requestOrderThroughIframe(payload) {
  return new Promise((resolve, reject) => {
    const requestId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const frameName = `webs4v-domain-order-${requestId}`;
    const iframe = document.createElement('iframe');
    const bridgeForm = document.createElement('form');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Hệ thống nhận yêu cầu phản hồi quá lâu. Vui lòng thử lại.'));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener('message', handleMessage);
      bridgeForm.remove();
      iframe.remove();
    }

    function handleMessage(event) {
      if (!isTrustedDomainStoreMessage(event)) return;
      const response = event.data;
      if (!response || response.source !== 'webs4v-domain-order' || response.requestId !== requestId) return;
      cleanup();
      if (!response.ok) {
        reject(new Error('Chưa thể gửi yêu cầu lúc này. Vui lòng thử lại.'));
        return;
      }
      resolve(response);
    }

    const fields = {
      action: 'domain-order',
      responseMode: 'iframe',
      requestId,
      fullname: payload.customer.fullname,
      phone: payload.customer.phone,
      email: payload.customer.email,
      note: payload.customer.note,
      items: JSON.stringify(payload.items),
      startedAt: String(PAGE_STARTED_AT),
      website: '',
      consent: payload.consent ? 'true' : 'false',
      consentPurpose: payload.consentPurpose,
      policyVersion: payload.policyVersion,
    };

    iframe.hidden = true;
    iframe.name = frameName;
    iframe.title = 'Phản hồi yêu cầu tên miền';
    bridgeForm.hidden = true;
    bridgeForm.method = 'POST';
    bridgeForm.action = DOMAIN_STORE_ENDPOINT;
    bridgeForm.target = frameName;
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value ?? '';
      bridgeForm.appendChild(input);
    });

    window.addEventListener('message', handleMessage);
    document.body.append(iframe, bridgeForm);
    bridgeForm.submit();
  });
}

async function submitOrder(form) {
  const error = form.querySelector('[data-order-error]');
  const preview = document.querySelector('[data-order-preview]');
  error.textContent = '';

  if (!state.items.length) {
    error.textContent = 'Vui lòng chọn ít nhất một tên miền.';
    return;
  }

  if (!form.reportValidity()) {
    error.textContent = 'Vui lòng hoàn thiện các trường bắt buộc.';
    return;
  }

  const formData = new FormData(form);
  const payload = {
    customer: {
      fullname: formData.get('fullname'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      note: formData.get('note'),
    },
    items: state.items,
    source: 'domain-registration-page',
    startedAt: PAGE_STARTED_AT,
    website: formData.get('website') || '',
    consent: formData.get('consent') === 'on',
    consentPurpose: CONSENT_PURPOSES.domainConsultation,
    policyVersion: PRIVACY_POLICY_VERSION,
  };

  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Đang tạo yêu cầu...';

  try {
    let order;
    if (API_BASE) {
      const response = await fetch(`${API_BASE}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responsePayload = await response.json().catch(() => null);
      if (!response.ok || !responsePayload?.ok) {
        throw new Error(orderErrorMessage(responsePayload?.error));
      }
      order = responsePayload;
    } else if (DOMAIN_STORE_ENDPOINT) {
      order = await requestOrderThroughIframe(payload);
    } else {
      const shortId = `${Date.now()}`.slice(-8);
      order = { code: `DEMO-${shortId}`, status: 'draft_preview' };
      sessionStorage.setItem('webs4v-domain-order-preview', JSON.stringify({ ...payload, order }));
    }

    preview.hidden = false;
    preview.innerHTML = state.orderMode === 'preview'
      ? `<strong>Chưa thể gửi yêu cầu ${escapeHtml(order.code)}</strong><span>Thông tin mới được lưu tạm trên thiết bị này và chưa gửi tới Webs4V. Vui lòng liên hệ trực tiếp nếu bạn cần tư vấn ngay.</span>`
      : `<strong>Đã nhận yêu cầu ${escapeHtml(order.code || order.id)}</strong><span>Webs4V sẽ liên hệ tư vấn và gửi báo giá riêng. Đây không phải đơn hàng và chưa phát sinh hợp đồng hoặc nghĩa vụ thanh toán.</span>`;
    await showOrderAlert({
      icon: state.orderMode === 'preview' ? 'info' : 'success',
      title: state.orderMode === 'preview' ? 'Đã tạo bản xem trước' : 'Đã gửi yêu cầu',
      text: state.orderMode === 'preview'
        ? 'Yêu cầu mới được lưu tạm trên thiết bị này và chưa gửi tới Webs4V.'
        : `Mã yêu cầu ${order.code || order.id}. Webs4V sẽ liên hệ tư vấn và gửi báo giá riêng.`,
    });
  } catch (requestError) {
    const message = requestError.message || 'Có lỗi khi tạo yêu cầu. Vui lòng thử lại.';
    error.textContent = message;
    await showOrderAlert({
      icon: 'error',
      title: 'Chưa thể gửi yêu cầu',
      text: message,
      confirmButtonText: 'Đã hiểu',
    });
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Gửi yêu cầu báo giá';
  }
}

function initializeDomainStore() {
  const searchForm = document.querySelector('[data-domain-search]');
  const queryInput = document.querySelector('#domain-query');
  const searchError = document.querySelector('[data-domain-error]');
  const orderForm = document.querySelector('[data-order-form]');
  if (!searchForm || !queryInput || !orderForm) return;

  queryInput.addEventListener('input', () => {
    const currentValue = queryInput.value;
    if (!/^\s*(?:https?:\/\/|www\.)/i.test(currentValue)) return;
    const cleanedValue = normalizeDomain(currentValue);
    if (cleanedValue) queryInput.value = cleanedValue;
  });

  queryInput.addEventListener('blur', () => {
    if (queryInput.value.trim()) queryInput.value = normalizeDomain(queryInput.value);
  });

  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = normalizeDomain(queryInput.value);
    queryInput.value = query;
    searchError.textContent = '';

    if (!isValidDomainInput(query)) {
      searchError.textContent = 'Nhập tên miền hợp lệ, ví dụ ten-thuong-hieu.vn.';
      queryInput.focus();
      return;
    }

    const button = searchForm.querySelector('[type="submit"]');
    button.disabled = true;
    button.textContent = 'Đang phân tích...';

    try {
      const results = await requestDomainResults(buildCandidates(query));
      renderDomainResults(results);
    } catch (requestError) {
      searchError.textContent = requestError.message || 'Không thể kiểm tra tên miền lúc này.';
    } finally {
      button.disabled = false;
      button.textContent = 'Phân tích tên miền';
    }
  });

  document.querySelectorAll('[data-suffix]').forEach((button) => {
    button.addEventListener('click', () => {
      const current = normalizeDomain(queryInput.value).split('.')[0];
      queryInput.value = `${current || 'thuong-hieu'}${button.dataset.suffix}`;
      queryInput.focus();
    });
  });

  document.addEventListener('click', (event) => {
    const domainButton = event.target.closest('[data-add-domain]');
    if (domainButton) {
      addItem({ type: 'domain', id: domainButton.dataset.addDomain, name: domainButton.dataset.addDomain, price: domainButton.dataset.price || null });
      document.querySelector('#don-hang')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const removeButton = event.target.closest('[data-remove-item]');
    if (removeButton) removeItem(removeButton.dataset.removeItem);
  });

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitOrder(orderForm);
  });

  renderCart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDomainStore, { once: true });
} else {
  initializeDomainStore();
}
