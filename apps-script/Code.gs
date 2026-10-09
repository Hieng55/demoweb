function doPost(event) {
  let reservedDuplicateKey = '';

  try {
    const data = event && event.parameter ? event.parameter : {};
    const name = clean_(data.name, 100);
    const phone = clean_(data.phone, 30);
    const service = clean_(data.service, 120);
    const message = clean_(data.message, 1200);
    const honeypot = clean_(data.website, 120);
    const startedAt = Number(data.startedAt || 0);
    const elapsed = Date.now() - startedAt;
    const phoneDigits = phone.replace(/\D/g, '');

    if (honeypot) return json_({ ok: true });
    if (!startedAt || elapsed < 1500 || elapsed > 7200000) return json_({ ok: true });
    if (name.length < 2 || phoneDigits.length < 9 || phoneDigits.length > 15 || !service) {
      return json_({ ok: false, error: 'invalid_contact' });
    }

    const properties = PropertiesService.getScriptProperties();
    const botToken = properties.getProperty('TELEGRAM_BOT_TOKEN');
    const chatId = properties.getProperty('TELEGRAM_CHAT_ID');
    if (!botToken || !chatId) throw new Error('Missing Telegram configuration.');

    const cache = CacheService.getScriptCache();
    const duplicateKey = 'duplicate-' + hash_(name + '|' + phoneDigits + '|' + service + '|' + message);
    const phoneRateKey = 'phone-' + hash_(phoneDigits);
    const globalRateKey = 'global-' + Math.floor(Date.now() / 60000);
    const lock = LockService.getScriptLock();

    if (!lock.tryLock(3000)) return json_({ ok: true });

    try {
      if (cache.get(duplicateKey)) return json_({ ok: true, duplicate: true });

      const globalCount = Number(cache.get(globalRateKey) || 0);
      const phoneCount = Number(cache.get(phoneRateKey) || 0);
      if (globalCount >= 20 || phoneCount >= 3) return json_({ ok: true, rateLimited: true });

      cache.put(globalRateKey, String(globalCount + 1), 120);
      cache.put(phoneRateKey, String(phoneCount + 1), 3600);
      cache.put(duplicateKey, '1', 600);
      reservedDuplicateKey = duplicateKey;
    } finally {
      lock.releaseLock();
    }

    const submittedAt = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    const telegramMessage = [
      '<b>YÊU CẦU TƯ VẤN MỚI — WEBS4V</b>',
      '',
      '<b>Khách hàng:</b> ' + escapeHtml_(name),
      '<b>Điện thoại:</b> ' + escapeHtml_(phone),
      '<b>Dịch vụ:</b> ' + escapeHtml_(service),
      '<b>Nội dung:</b> ' + escapeHtml_(message || 'Chưa cung cấp'),
      '',
      '<i>Gửi lúc ' + escapeHtml_(submittedAt) + '</i>',
    ].join('\n');

    const telegramResponse = UrlFetchApp.fetch(
      'https://api.telegram.org/bot' + botToken + '/sendMessage',
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        muteHttpExceptions: true,
      },
    );

    if (telegramResponse.getResponseCode() < 200 || telegramResponse.getResponseCode() >= 300) {
      throw new Error('Telegram rejected the message.');
    }

    return json_({ ok: true });
  } catch (error) {
    if (reservedDuplicateKey) CacheService.getScriptCache().remove(reservedDuplicateKey);
    console.error(error && error.message ? error.message : error);
    return json_({ ok: false, error: 'notification_failed' });
  }
}

function doGet() {
  return json_({ ok: true, service: 'Webs4V contact notification' });
}

function getTelegramChatId() {
  const botToken = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
  if (!botToken) throw new Error('Hãy thêm TELEGRAM_BOT_TOKEN trong Script Properties trước.');

  const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + botToken + '/getUpdates');
  const result = JSON.parse(response.getContentText());
  const updates = result && result.result ? result.result : [];
  const latestMessage = updates.slice().reverse().find(function (update) {
    return update.message && update.message.chat;
  });

  if (!latestMessage) {
    throw new Error('Chưa tìm thấy tin nhắn. Hãy mở bot, nhấn Start, gửi Hello rồi chạy lại.');
  }

  const chatId = String(latestMessage.message.chat.id);
  console.log('TELEGRAM_CHAT_ID = ' + chatId);
  return chatId;
}

function clean_(value, maximumLength) {
  return String(value || '').trim().replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, maximumLength);
}

function escapeHtml_(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hash_(value) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value),
  ).replace(/=+$/g, '');
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
