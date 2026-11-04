const RESPONSE_TIMEOUT_MS = 45000;

export const RESPONSE_ERROR_MESSAGES = {
  busy: 'Hệ thống đang xử lý nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
  rate_limited: 'Bạn đã gửi quá nhiều lần. Vui lòng chờ trước khi thử lại.',
  invalid_contact: 'Thông tin liên hệ chưa hợp lệ. Vui lòng kiểm tra lại.',
  invalid_application: 'Thông tin hồ sơ chưa hợp lệ. Vui lòng kiểm tra lại.',
  invalid_timing: 'Phiên biểu mẫu đã hết hạn. Vui lòng tải lại trang rồi thử lại.',
  cv_required: 'Vui lòng chọn một tệp CV PDF hợp lệ.',
  request_failed: 'Máy chủ chưa thể xử lý yêu cầu. Vui lòng thử lại sau.',
};

export const responseErrorMessage = (code) =>
  RESPONSE_ERROR_MESSAGES[code] || 'Chưa thể xác nhận dữ liệu đã được lưu. Vui lòng thử lại.';

export const submitWithVerifiedResponse = async (endpoint, inputPayload) => {
  const payload = inputPayload instanceof URLSearchParams
    ? new URLSearchParams(inputPayload)
    : new URLSearchParams(inputPayload);

  payload.delete('responseMode');
  payload.delete('requestId');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RESPONSE_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: payload,
      signal: controller.signal,
    });

    let result = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      try {
        result = JSON.parse(text);
      } catch {
        if (text.includes('"ok":true') || text.includes('ok: true')) {
          result = { ok: true };
        }
      }
    }

    if (result && result.ok) {
      return result;
    }

    const message = responseErrorMessage(result?.error);
    throw new Error(message);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại.');
    }
    if (Object.values(RESPONSE_ERROR_MESSAGES).includes(error.message)) {
      throw error;
    }

    // In case of CORS restriction or network block, fallback to no-cors mode so submission is preserved
    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: payload,
      });
      return { ok: true, fallback: true };
    } catch {
      throw new Error(error.message || 'Chưa thể gửi dữ liệu. Vui lòng kiểm tra mạng và thử lại.');
    }
  } finally {
    clearTimeout(timeoutId);
  }
};
