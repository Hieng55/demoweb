const DOMAIN_CHECK_MAX_ITEMS = 5;
const DOMAIN_CHECK_CACHE_SECONDS = 60;
const DOMAIN_CHECK_RATE_PER_MINUTE = 60;
const INET_DOMAIN_CHECK_URL = 'https://dms.inet.vn/api/rms/v1/domain/checkavailable';

function doGet(event) {
  const data = event && event.parameter ? event.parameter : {};
  if (clean_(data.action, 40) !== 'domain-check') {
    return json_({ ok: true, service: 'Webs4V domain store' });
  }

  const result = safelyRun_(function () { return handleDomainCheck_(data); }, 'domain_check_failed');
  if (clean_(data.responseMode, 20) === 'iframe') {
    return iframeResponse_('webs4v-domain-check', result, data.requestId);
  }
  return json_(result);
}

function doPost(event) {
  const data = event && event.parameter ? event.parameter : {};
  const action = clean_(data.action, 40);
  const result = action === 'domain-order'
    ? safelyRun_(function () { return handleDomainOrder_(data); }, 'order_failed')
    : { ok: false, error: 'unsupported_action' };

  if (clean_(data.responseMode, 20) === 'iframe') {
    return iframeResponse_('webs4v-domain-order', result, data.requestId);
  }
  return json_(result);
}

function safelyRun_(callback, fallbackError) {
  try {
    return callback();
  } catch (error) {
    const message = error && error.message ? error.message : String(error || '');
    console.error(message);
    return {
      ok: false,
      error: /rate limit/i.test(message) ? 'rate_limited' : fallbackError,
    };
  }
}

function handleDomainCheck_(data) {
  const domains = clean_(data.domains, 1000)
    .split(',')
    .map(function (domain) { return normalizeDomain_(domain); })
    .filter(function (domain, index, items) { return domain && items.indexOf(domain) === index; })
    .slice(0, DOMAIN_CHECK_MAX_ITEMS);

  if (!domains.length || domains.some(function (domain) { return !isValidDomain_(domain); })) {
    return { ok: false, error: 'invalid_domain' };
  }

  const token = requiredProperty_('INET_RESELLER_TOKEN');
  const cache = CacheService.getScriptCache();
  const resultsByDomain = {};
  const missingDomains = [];

  domains.forEach(function (domain) {
    const cached = cache.get('domain-check-' + domain);
    if (!cached) {
      missingDomains.push(domain);
      return;
    }
    try {
      resultsByDomain[domain] = JSON.parse(cached);
    } catch (error) {
      missingDomains.push(domain);
    }
  });

  if (missingDomains.length) {
    reserveRate_('domain-check', DOMAIN_CHECK_RATE_PER_MINUTE, 120);
    const responses = UrlFetchApp.fetchAll(missingDomains.map(function (domain) {
      return {
        url: INET_DOMAIN_CHECK_URL,
        method: 'post',
        contentType: 'application/json',
        headers: { token: token },
        payload: JSON.stringify({ name: domain }),
        muteHttpExceptions: true,
      };
    }));

    responses.map(function (response, index) {
      const statusCode = response.getResponseCode();
      if (statusCode < 200 || statusCode >= 300) {
        throw new Error('iNET domain check returned HTTP ' + statusCode + '.');
      }
      let payload;
      try {
        payload = JSON.parse(response.getContentText());
      } catch (error) {
        throw new Error('iNET domain check returned invalid JSON.');
      }
      const rawStatus = payload.available !== undefined ? payload.available
        : payload.isAvailable !== undefined ? payload.isAvailable
          : payload.availability !== undefined ? payload.availability
            : payload.status;
      let availability = normalizeAvailability_(rawStatus);
      if (availability === 'unknown' && clean_(rawStatus, 60)) availability = 'taken';
      return {
        domain: missingDomains[index],
        availability: availability,
        price: payload.sellingPrice || payload.price || payload.registerPrice || null,
      };
    }).forEach(function (item) {
      resultsByDomain[item.domain] = item;
      cache.put('domain-check-' + item.domain, JSON.stringify(item), DOMAIN_CHECK_CACHE_SECONDS);
    });
  }

  return {
    ok: true,
    results: domains.map(function (domain) {
      return resultsByDomain[domain] || { domain: domain, availability: 'unknown', price: null };
    }),
  };
}

function handleDomainOrder_(data) {
  const fullname = clean_(data.fullname, 100);
  const phone = clean_(data.phone, 30);
  const email = clean_(data.email, 160).toLowerCase();
  const note = clean_(data.note, 1500);
  const honeypot = clean_(data.website, 120);
  const startedAt = Number(data.startedAt || 0);
  const elapsed = Date.now() - startedAt;
  const phoneDigits = phone.replace(/\D/g, '');

  if (honeypot) return { ok: true };
  if (!startedAt || elapsed < 1500 || elapsed > 7200000) return { ok: false, error: 'invalid_timing' };
  if (fullname.length < 2 || phoneDigits.length < 9 || phoneDigits.length > 15 || !isValidEmail_(email)) {
    return { ok: false, error: 'invalid_customer' };
  }

  let items;
  try {
    items = JSON.parse(String(data.items || '[]'));
  } catch (error) {
    return { ok: false, error: 'invalid_items' };
  }
  if (!Array.isArray(items) || !items.length || items.length > 10) return { ok: false, error: 'invalid_items' };

  const normalizedItems = items.map(function (item) {
    const type = clean_(item && item.type, 20);
    const name = clean_(item && item.name, 253);
    if (['domain', 'hosting'].indexOf(type) === -1 || !name) throw new Error('Invalid order item.');
    return { type: type, name: name };
  });

  const duplicateKey = 'domain-order-' + hash_(email + '|' + phoneDigits + '|' + JSON.stringify(normalizedItems));
  const cache = CacheService.getScriptCache();
  if (cache.get(duplicateKey)) return { ok: true, duplicate: true };
  reserveRate_('domain-order', 20, 120);
  cache.put(duplicateKey, '1', 600);

  const orderCode = 'TM-' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyMMdd-HHmm')
    + '-' + Utilities.getUuid().slice(0, 6).toUpperCase();
  const itemRows = normalizedItems.map(function (item, index) {
    return (index + 1) + '. ' + escapeHtml_(item.name) + ' (' + escapeHtml_(item.type) + ')';
  });
  const message = [
    '<b>YÊU CẦU TÊN MIỀN / HOSTING — WEBS4V</b>',
    '',
    '<b>Mã yêu cầu:</b> ' + escapeHtml_(orderCode),
    '<b>Khách hàng:</b> ' + escapeHtml_(fullname),
    '<b>Điện thoại:</b> ' + escapeHtml_(phone),
    '<b>Email:</b> ' + escapeHtml_(email),
    '<b>Hạng mục:</b>',
  ].concat(itemRows).concat([
    '<b>Ghi chú:</b> ' + escapeHtml_(note || 'Chưa cung cấp'),
    '',
    '<i>Chỉ là yêu cầu mua; hệ thống chưa gọi API đăng ký và chưa trừ quỹ iNET.</i>',
  ]).join('\n');

  sendTelegram_(message);
  return { ok: true, code: orderCode, status: 'pending_manual_review' };
}

function normalizeAvailability_(value) {
  if (value === true || value === 1) return 'available';
  if (value === false || value === 0) return 'taken';
  const status = clean_(value, 60).toLowerCase().replace(/[\s_-]+/g, '');
  if (['available', 'free', 'true', '1', 'yes', 'canregister'].indexOf(status) !== -1) return 'available';
  if (['unavailable', 'notavailable', 'registered', 'taken', 'exists', 'false', '0', 'no'].indexOf(status) !== -1) return 'taken';
  return 'unknown';
}

function iframeResponse_(source, result, rawRequestId) {
  const requestId = clean_(rawRequestId, 100).replace(/[^a-zA-Z0-9_-]/g, '');
  const configuredOrigin = clean_(PropertiesService.getScriptProperties().getProperty('ALLOWED_SITE_ORIGIN'), 200);
  const allowedOrigin = /^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(configuredOrigin)
    ? configuredOrigin
    : 'https://webs4v.vn';
  const response = Object.assign({
    source: source,
    requestId: requestId,
    ok: Boolean(result && result.ok),
    error: clean_(result && result.error, 60),
  }, result || {});
  const payload = JSON.stringify(response).replace(/</g, '\\u003c');
  const html = '<!doctype html><html><head><meta name="referrer" content="no-referrer"></head><body>'
    + '<script>window.top.postMessage(' + payload + ',' + JSON.stringify(allowedOrigin) + ');<\/script>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function sendTelegram_(message) {
  const botToken = requiredProperty_('TELEGRAM_BOT_TOKEN');
  const chatId = requiredProperty_('TELEGRAM_CHAT_ID');
  const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error('Telegram rejected the message.');
  }
}

function getTelegramChatId() {
  const botToken = requiredProperty_('TELEGRAM_BOT_TOKEN');
  const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + botToken + '/getUpdates');
  const payload = JSON.parse(response.getContentText());
  const updates = payload && payload.result ? payload.result : [];
  const latestMessage = updates.slice().reverse().find(function (update) {
    return update.message && update.message.chat;
  });
  if (!latestMessage) throw new Error('Hãy nhắn một tin cho bot rồi chạy lại getTelegramChatId.');
  const chatId = String(latestMessage.message.chat.id);
  console.log('TELEGRAM_CHAT_ID = ' + chatId);
  return chatId;
}

function reserveRate_(prefix, maximum, ttlSeconds) {
  const cache = CacheService.getScriptCache();
  const key = prefix + '-' + Math.floor(Date.now() / 60000);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) throw new Error('Request is busy.');
  try {
    const count = Number(cache.get(key) || 0);
    if (count >= maximum) throw new Error('Rate limit exceeded.');
    cache.put(key, String(count + 1), ttlSeconds);
  } finally {
    lock.releaseLock();
  }
}

function requiredProperty_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error('Missing Script Property: ' + name);
  return value;
}

function normalizeDomain_(value) {
  return clean_(value, 253)
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .replace(/\.$/, '');
}

function isValidDomain_(domain) {
  if (!domain || domain.length > 253 || domain.indexOf('.') < 1) return false;
  return domain.split('.').every(function (label) {
    return label.length >= 1
      && label.length <= 63
      && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label);
  });
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
}

function clean_(value, maximumLength) {
  return String(value || '').trim().replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, maximumLength);
}

function escapeHtml_(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hash_(value) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value),
  ).replace(/=+$/g, '');
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
