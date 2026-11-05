const RECRUITMENT_MAX_FILES = 1;
const RECRUITMENT_MAX_FILE_BYTES = 5 * 1024 * 1024;
const RECRUITMENT_MAX_TOTAL_BYTES = 5 * 1024 * 1024;
const RECRUITMENT_ALLOWED_MIME_TYPES = {
  'application/pdf': true,
};
const RECRUITMENT_ALLOWED_POSITIONS = {
  'Website Developer Intern': true,
  'Website Developer Fresher': true,
  'Marketing Executive': true,
  'Sales Website': true,
  'Graphic Designer': true,
};
const RECRUITMENT_POSITION_FOLDER_IDS = {
  'Website Developer Intern': '198wt2QVGlx-Dji6pSvFvEnQO4d41WZ9R',
  'Website Developer Fresher': '198wt2QVGlx-Dji6pSvFvEnQO4d41WZ9R',
  'Marketing Executive': '1MsU9gTxqalJy3aD5Buqh2fTNsm0HdJQm',
  'Sales Website': '1GbcPWiBVM_OEd2XXSXNN68kZfbOZcmDt',
  'Graphic Designer': '1WCv2RIYFHivN3_Tv6m6LZQSGt9iU7Sp0',
};

function doPost(event) {
  const data = event && event.parameter ? event.parameter : {};
  let result;

  try {
    result = clean_(data.formType, 40) === 'recruitment'
      ? handleRecruitment_(data)
      : handleContact_(data);
  } catch (error) {
    console.error(error && error.message ? error.message : error);
    result = { ok: false, error: 'request_failed' };
  }

  if (clean_(data.responseMode, 20) === 'iframe') return iframeResponse_(result, data.requestId);
  return json_(result);
}

function handleContact_(data) {
  let reservedDuplicateKey = '';

  try {
    const name = clean_(data.name, 100);
    const phone = clean_(data.phone, 30);
    const industry = clean_(data.industry, 120);
    const goal = clean_(data.goal, 160);
    const budget = clean_(data.budget, 100);
    const service = clean_(data.service, 120);
    const message = clean_(data.message, 1200);
    const landingPage = clean_(data.landingPage, 250);
    const utmSource = clean_(data.utmSource, 100);
    const utmMedium = clean_(data.utmMedium, 100);
    const utmCampaign = clean_(data.utmCampaign, 150);
    const honeypot = clean_(data.website, 120);
    const startedAt = Number(data.startedAt || 0);
    const elapsed = Date.now() - startedAt;
    const phoneDigits = phone.replace(/\D/g, '');

    if (honeypot) return { ok: true };
    if (!startedAt || elapsed < 1500 || elapsed > 7200000) return { ok: false, error: 'invalid_timing' };
    if (name.length < 2 || phoneDigits.length < 9 || phoneDigits.length > 15 || !industry || !goal || !budget || !service) {
      return { ok: false, error: 'invalid_contact' };
    }

    const telegram = getTelegramConfig_();
    const duplicateKey = 'contact-' + hash_(name + '|' + phoneDigits + '|' + industry + '|' + goal + '|' + budget + '|' + service + '|' + message);
    const reservation = reserveSubmission_(duplicateKey, 'phone-' + hash_(phoneDigits));
    if (!reservation.allowed) return reservation.response;
    reservedDuplicateKey = duplicateKey;

    const submittedAt = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    const telegramMessage = [
      '<b>YÊU CẦU TƯ VẤN MỚI — WEBS4V</b>',
      '',
      '<b>Khách hàng:</b> ' + escapeHtml_(name),
      '<b>Điện thoại:</b> ' + escapeHtml_(phone),
      '<b>Ngành nghề:</b> ' + escapeHtml_(industry),
      '<b>Mục tiêu:</b> ' + escapeHtml_(goal),
      '<b>Ngân sách:</b> ' + escapeHtml_(budget),
      '<b>Dịch vụ:</b> ' + escapeHtml_(service),
      '<b>Nội dung:</b> ' + escapeHtml_(message || 'Chưa cung cấp'),
      '<b>Trang gửi:</b> ' + escapeHtml_(landingPage || 'Không xác định'),
      '<b>Nguồn:</b> ' + escapeHtml_([utmSource, utmMedium, utmCampaign].filter(Boolean).join(' / ') || 'Truy cập trực tiếp hoặc không gắn UTM'),
      '',
      '<i>Gửi lúc ' + escapeHtml_(submittedAt) + '</i>',
    ].join('\n');

    sendTelegram_(telegram, telegramMessage);
    return { ok: true };
  } catch (error) {
    if (reservedDuplicateKey) CacheService.getScriptCache().remove(reservedDuplicateKey);
    throw error;
  }
}

function handleRecruitment_(data) {
  let reservedDuplicateKey = '';
  let applicantFolder = null;
  let applicationSaved = false;

  try {
    const fullName = clean_(data.fullName, 100);
    const phone = clean_(data.phone, 30);
    const email = clean_(data.email, 160).toLowerCase();
    const position = clean_(data.position, 120);
    const introduction = clean_(data.introduction, 2000);
    const landingPage = clean_(data.landingPage, 250);
    const honeypot = clean_(data.website, 120);
    const startedAt = Number(data.startedAt || 0);
    const elapsed = Date.now() - startedAt;
    const phoneDigits = phone.replace(/\D/g, '');

    if (honeypot) return { ok: true };
    if (!startedAt || elapsed < 2000 || elapsed > 7200000) return { ok: false, error: 'invalid_timing' };
    if (fullName.length < 2 || phoneDigits.length < 9 || phoneDigits.length > 15 || !isValidEmail_(email) || !RECRUITMENT_ALLOWED_POSITIONS[position]) {
      return { ok: false, error: 'invalid_application' };
    }

    const folderId = RECRUITMENT_POSITION_FOLDER_IDS[position];
    if (!folderId) throw new Error('Missing recruitment folder for position: ' + position);

    const duplicateKey = 'recruitment-' + hash_(fullName + '|' + phoneDigits + '|' + email + '|' + position);
    const reservation = reserveSubmission_(duplicateKey, 'candidate-' + hash_(email + '|' + phoneDigits));
    if (!reservation.allowed) return reservation.response;
    reservedDuplicateKey = duplicateKey;

    const attachments = parseAttachments_(data.attachments);
    if (attachments.length !== 1 || attachments[0].kind !== 'cv') {
      return { ok: false, error: 'cv_required' };
    }

    const submittedAt = new Date();
    const submittedLabel = Utilities.formatDate(submittedAt, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    const folderName = Utilities.formatDate(submittedAt, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd_HHmm') + ' - ' + safeFileName_(position, 60) + ' - ' + safeFileName_(fullName, 60);
    applicantFolder = DriveApp.getFolderById(folderId).createFolder(folderName);

    const fileLinks = attachments.map(function (attachment) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(attachment.base64),
        attachment.mimeType,
        safeFileName_(attachment.name, 120),
      );
      const file = applicantFolder.createFile(blob);
      file.setDescription('Ứng tuyển ' + position + ' — ' + fullName + ' — ' + submittedLabel);
      return {
        kind: attachment.kind,
        name: file.getName(),
        url: file.getUrl(),
      };
    });

    const summary = [
      'Vị trí: ' + position,
      'Họ tên: ' + fullName,
      'Điện thoại: ' + phone,
      'Email: ' + email,
      'Giới thiệu: ' + (introduction || 'Chưa cung cấp'),
      'Trang gửi: ' + (landingPage || 'Không xác định'),
      'Gửi lúc: ' + submittedLabel,
    ].join('\n');
    applicantFolder.createFile('thong-tin-ung-vien.txt', summary, MimeType.PLAIN_TEXT);
    applicationSaved = true;

    const fileRows = fileLinks.map(function (file) {
      const label = file.kind === 'cv' ? 'CV' : 'Tệp đính kèm';
      return '<b>' + label + ':</b> <a href="' + escapeHtmlAttribute_(file.url) + '">' + escapeHtml_(file.name) + '</a>';
    });
    const telegramMessage = [
      '<b>HỒ SƠ ỨNG TUYỂN MỚI — WEBS4V</b>',
      '',
      '<b>Vị trí:</b> ' + escapeHtml_(position),
      '<b>Ứng viên:</b> ' + escapeHtml_(fullName),
      '<b>Điện thoại:</b> ' + escapeHtml_(phone),
      '<b>Email:</b> ' + escapeHtml_(email),
      '<b>Giới thiệu:</b> ' + escapeHtml_(introduction || 'Chưa cung cấp'),
      '',
      '<b>Thư mục hồ sơ:</b> <a href="' + escapeHtmlAttribute_(applicantFolder.getUrl()) + '">Mở trên Google Drive</a>',
    ].concat(fileRows).concat([
      '',
      '<i>Gửi lúc ' + escapeHtml_(submittedLabel) + '</i>',
    ]).join('\n');

    let notificationSent = true;
    try {
      sendTelegram_(getTelegramConfig_(), telegramMessage);
    } catch (notificationError) {
      notificationSent = false;
      console.error('Recruitment saved but Telegram notification failed: ' + notificationError.message);
    }
    return { ok: true, notificationSent: notificationSent };
  } catch (error) {
    if (reservedDuplicateKey) CacheService.getScriptCache().remove(reservedDuplicateKey);
    if (applicantFolder && !applicationSaved) {
      try {
        applicantFolder.setTrashed(true);
      } catch (cleanupError) {
        console.error('Unable to clean up recruitment folder: ' + cleanupError.message);
      }
    }
    throw error;
  }
}

function parseAttachments_(rawValue) {
  let files;
  try {
    files = JSON.parse(String(rawValue || '[]'));
  } catch (error) {
    throw new Error('Invalid attachment payload.');
  }

  if (!Array.isArray(files) || files.length !== RECRUITMENT_MAX_FILES) throw new Error('Invalid attachment count.');
  let totalBytes = 0;

  return files.map(function (file) {
    const name = clean_(file && file.name, 160);
    const mimeType = clean_(file && file.mimeType, 120).toLowerCase();
    const kind = clean_(file && file.kind, 20);
    const base64 = String(file && file.base64 || '').replace(/\s/g, '');
    const maximumBase64Length = Math.ceil(RECRUITMENT_MAX_FILE_BYTES / 3) * 4 + 4;

    if (!name || !/\.pdf$/i.test(name) || kind !== 'cv' || !RECRUITMENT_ALLOWED_MIME_TYPES[mimeType] || base64.length > maximumBase64Length || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
      throw new Error('Unsupported attachment.');
    }
    const bytes = Utilities.base64Decode(base64);
    if (!bytes.length || bytes.length > RECRUITMENT_MAX_FILE_BYTES) throw new Error('Attachment is too large.');
    if (!isSafePdf_(bytes)) throw new Error('Invalid or unsafe PDF attachment.');
    totalBytes += bytes.length;
    if (totalBytes > RECRUITMENT_MAX_TOTAL_BYTES) throw new Error('Attachments exceed total size.');

    return { name: name, mimeType: mimeType, kind: kind, base64: base64 };
  });
}

function isSafePdf_(bytes) {
  const header = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
  if (bytes.length < header.length + 4) return false;
  for (let index = 0; index < header.length; index += 1) {
    if ((bytes[index] & 0xff) !== header[index]) return false;
  }

  const eof = [0x25, 0x45, 0x4f, 0x46]; // %EOF
  const tailStart = Math.max(0, bytes.length - 2048);
  if (!containsByteSequence_(bytes, eof, tailStart)) return false;

  const blockedPdfTokens = ['/JavaScript', '/Launch', '/EmbeddedFile', '/OpenAction'];
  return !blockedPdfTokens.some(function (token) {
    return containsAsciiToken_(bytes, token);
  });
}

function containsByteSequence_(bytes, sequence, startIndex) {
  for (let index = startIndex || 0; index <= bytes.length - sequence.length; index += 1) {
    let matched = true;
    for (let offset = 0; offset < sequence.length; offset += 1) {
      if ((bytes[index + offset] & 0xff) !== sequence[offset]) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

function containsAsciiToken_(bytes, token) {
  const expected = token.toLowerCase();
  for (let index = 0; index <= bytes.length - expected.length; index += 1) {
    let matched = true;
    for (let offset = 0; offset < expected.length; offset += 1) {
      const character = String.fromCharCode(bytes[index + offset] & 0xff).toLowerCase();
      if (character !== expected.charAt(offset)) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

function iframeResponse_(result, rawRequestId) {
  const requestId = clean_(rawRequestId, 100).replace(/[^a-zA-Z0-9_-]/g, '');
  const properties = PropertiesService.getScriptProperties();
  const configuredOrigin = clean_(properties.getProperty('ALLOWED_SITE_ORIGIN'), 200);
  const allowedOrigin = /^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(configuredOrigin)
    ? configuredOrigin
    : '*';
  const response = {
    source: 'webs4v-recruitment',
    requestId: requestId,
    ok: Boolean(result && result.ok),
    error: clean_(result && result.error, 60),
  };
  const payload = JSON.stringify(response).replace(/</g, '\\u003c');
  const targetOrigin = JSON.stringify(allowedOrigin);
  const html = '<!doctype html><html><head><meta name="referrer" content="no-referrer"></head><body>'
    + '<script>window.top.postMessage(' + payload + ',' + targetOrigin + ');<\/script>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function reserveSubmission_(duplicateKey, actorRateKey) {
  const cache = CacheService.getScriptCache();
  const globalRateKey = 'global-' + Math.floor(Date.now() / 60000);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return { allowed: false, response: { ok: false, error: 'busy' } };

  try {
    if (cache.get(duplicateKey)) return { allowed: false, response: { ok: true, duplicate: true } };
    const globalCount = Number(cache.get(globalRateKey) || 0);
    const actorCount = Number(cache.get(actorRateKey) || 0);
    if (globalCount >= 20 || actorCount >= 3) return { allowed: false, response: { ok: false, error: 'rate_limited' } };
    cache.put(globalRateKey, String(globalCount + 1), 120);
    cache.put(actorRateKey, String(actorCount + 1), 3600);
    cache.put(duplicateKey, '1', 600);
    return { allowed: true };
  } finally {
    lock.releaseLock();
  }
}

function getTelegramConfig_() {
  const properties = PropertiesService.getScriptProperties();
  const botToken = properties.getProperty('TELEGRAM_BOT_TOKEN');
  const chatId = properties.getProperty('TELEGRAM_CHAT_ID');
  if (!botToken || !chatId) throw new Error('Missing Telegram configuration.');
  return { botToken: botToken, chatId: chatId };
}

function sendTelegram_(telegram, message) {
  const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + telegram.botToken + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: telegram.chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) throw new Error('Telegram rejected the message.');
}

function doGet() {
  return json_({ ok: true, service: 'Webs4V contact and recruitment notification' });
}

function getTelegramChatId() {
  const botToken = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
  if (!botToken) throw new Error('Hãy thêm TELEGRAM_BOT_TOKEN trong Script Properties trước.');
  const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + botToken + '/getUpdates');
  const result = JSON.parse(response.getContentText());
  const updates = result && result.result ? result.result : [];
  const latestMessage = updates.slice().reverse().find(function (update) { return update.message && update.message.chat; });
  if (!latestMessage) throw new Error('Chưa tìm thấy tin nhắn. Hãy mở bot, nhấn Start, gửi Hello rồi chạy lại.');
  const chatId = String(latestMessage.message.chat.id);
  console.log('TELEGRAM_CHAT_ID = ' + chatId);
  return chatId;
}

function cleanupExpiredRecruitmentFolders() {
  const properties = PropertiesService.getScriptProperties();
  const retentionDays = Math.min(730, Math.max(30, Number(properties.getProperty('RECRUITMENT_RETENTION_DAYS') || 180)));
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const processedFolderIds = {};
  let removed = 0;

  Object.keys(RECRUITMENT_POSITION_FOLDER_IDS).forEach(function (position) {
    const folderId = RECRUITMENT_POSITION_FOLDER_IDS[position];
    if (processedFolderIds[folderId]) return;
    processedFolderIds[folderId] = true;

    const folders = DriveApp.getFolderById(folderId).getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      const match = /^(\d{4})-(\d{2})-(\d{2})_/.exec(folder.getName());
      if (!match) continue;
      const createdAt = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
      if (createdAt < cutoff) {
        folder.setTrashed(true);
        removed += 1;
      }
    }
  });
  console.log('Expired recruitment folders moved to trash: ' + removed);
  return removed;
}

function installRecruitmentCleanupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'cleanupExpiredRecruitmentFolders') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('cleanupExpiredRecruitmentFolders').timeBased().everyDays(1).atHour(3).create();
}

function clean_(value, maximumLength) {
  return String(value || '').trim().replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, maximumLength);
}

function cleanUrl_(value, maximumLength) {
  const candidate = clean_(value, maximumLength);
  if (!candidate) return '';
  return /^https?:\/\/[^\s]+$/i.test(candidate) ? candidate : '';
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
}

function safeFileName_(value, maximumLength) {
  return clean_(value, maximumLength).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim() || 'tep-dinh-kem';
}

function escapeHtml_(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtmlAttribute_(value) {
  return escapeHtml_(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function hash_(value) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)).replace(/=+$/g, '');
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
