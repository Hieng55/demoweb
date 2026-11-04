import { submitWithVerifiedResponse } from './verified-form-submit.js';

const forms = document.querySelectorAll('[data-recruitment-form]');

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
]);

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result || '');
    resolve(result.includes(',') ? result.split(',')[1] : result);
  };
  reader.onerror = () => reject(new Error(`Không thể đọc tệp ${file.name}.`));
  reader.readAsDataURL(file);
});

const showSuccessAlert = async () => {
  const [{ default: Swal }] = await Promise.all([
    import('sweetalert2'),
    import('sweetalert2/dist/sweetalert2.min.css'),
  ]);

  return Swal.fire({
    icon: 'success',
    title: 'Gửi hồ sơ thành công',
    text: 'Webs4V đã nhận được hồ sơ của bạn và sẽ liên hệ khi hồ sơ phù hợp.',
    confirmButtonText: 'Hoàn tất',
    confirmButtonColor: '#315bb5',
  });
};

const formatBytes = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const isHttpUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const fieldMessage = (field) => {
  const value = field.value.trim();
  if (field.type === 'checkbox') return field.required && !field.checked ? 'Bạn cần đồng ý trước khi gửi hồ sơ.' : '';
  if (field.required && !value) return 'Vui lòng điền thông tin này.';
  if (!value) return '';
  if (field.name === 'fullName' && value.length < 2) return 'Họ tên cần có ít nhất 2 ký tự.';
  if (field.name === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) return 'Số điện thoại cần từ 9 đến 15 chữ số.';
  }
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email chưa đúng định dạng.';
  if (field.type === 'url' && !isHttpUrl(value)) return 'Liên kết cần bắt đầu bằng http:// hoặc https://.';
  return '';
};

const ensureErrorNode = (field) => {
  const label = field.closest('label');
  if (!label) return null;
  let node = label.querySelector('[data-field-error]');
  if (!node) {
    node = document.createElement('small');
    node.dataset.fieldError = '';
    node.className = 'career-field-error';
    node.setAttribute('aria-live', 'polite');
    label.append(node);
  }
  return node;
};

const validateField = (field, showState = true) => {
  const message = fieldMessage(field);
  field.setCustomValidity(message);
  const errorNode = ensureErrorNode(field);
  if (errorNode) errorNode.textContent = showState ? message : '';
  if (showState) {
    field.classList.toggle('is-invalid', Boolean(message));
    field.classList.toggle('is-valid', !message && (field.type === 'checkbox' ? field.checked : Boolean(field.value.trim())));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }
  return !message;
};

forms.forEach((form) => {
  const submitButton = form.querySelector('[data-recruitment-submit]');
  let status = form.querySelector('[data-recruitment-status]');
  if (!status) {
    status = document.createElement('p');
    status.dataset.recruitmentStatus = '';
    status.className = 'contact-form__note';
    status.setAttribute('aria-live', 'polite');
    status.hidden = true;
    submitButton.insertAdjacentElement('afterend', status);
  }
  const cvInput = form.querySelector('[data-cv-file]');
  const endpoint = form.dataset.recruitmentEndpoint?.trim() || '';
  const fileState = { cv: [] };
  const submitLabel = submitButton.querySelector('span');
  const submitIcon = submitButton.querySelector('b');
  const defaultSubmitLabel = submitLabel?.textContent || 'Gửi hồ sơ';
  const defaultSubmitIcon = submitIcon?.textContent || '↗';
  let startedAt = Date.now();
  let submitting = false;

  const setSubmitting = (active) => {
    submitting = active;
    submitButton.disabled = active;
    submitButton.classList.toggle('is-loading', active);
    submitButton.setAttribute('aria-busy', active ? 'true' : 'false');
    if (submitLabel) submitLabel.textContent = active ? 'Đang gửi hồ sơ…' : defaultSubmitLabel;
    if (submitIcon) submitIcon.textContent = active ? '' : defaultSubmitIcon;
  };

  const setStatus = (message, state = '') => {
    status.textContent = message;
    status.className = `contact-form__note${state ? ` is-${state}` : ''}`;
    status.hidden = !message;
  };

  const ensureFileList = (input) => {
    const label = input.closest('label');
    let list = label.querySelector('[data-file-list]');
    if (!list) {
      list = document.createElement('ul');
      list.dataset.fileList = '';
      list.className = 'career-file-list';
      list.setAttribute('aria-live', 'polite');
      label.append(list);
    }
    return list;
  };

  const renderFiles = (input, kind) => {
    const list = ensureFileList(input);
    list.replaceChildren();
    fileState[kind].forEach((file, index) => {
      const item = document.createElement('li');
      const info = document.createElement('span');
      info.textContent = `${file.name} · ${formatBytes(file.size)}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Xoá';
      remove.setAttribute('aria-label', `Xoá tệp ${file.name}`);
      remove.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        fileState[kind].splice(index, 1);
        renderFiles(input, kind);
        validateFiles(true);
      });
      item.append(info, remove);
      list.append(item);
    });
  };

  const fileErrorNode = ensureErrorNode(cvInput);
  const validateFiles = (showState = true) => {
    const files = [...fileState.cv];
    let message = '';
    if (!fileState.cv.length) message = 'Vui lòng chọn một tệp CV.';
    if (!message && files.some((file) => !ALLOWED_TYPES.has(file.type))) message = 'Có tệp không đúng định dạng được hỗ trợ.';
    if (!message && files.some((file) => file.size > MAX_FILE_BYTES)) message = 'Mỗi tệp không được vượt quá 5 MB.';
    if (showState && fileErrorNode) fileErrorNode.textContent = message;
    cvInput.classList.toggle('is-invalid', Boolean(message));
    cvInput.classList.toggle('is-valid', !message && fileState.cv.length > 0);
    cvInput.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  };

  cvInput.removeAttribute('required');
  cvInput.addEventListener('change', () => {
    const selected = Array.from(cvInput.files || []);
    fileState.cv = selected.length ? [selected[0]] : [];
    cvInput.value = '';
    renderFiles(cvInput, 'cv');
    validateFiles(true);
  });

  const fields = Array.from(form.querySelectorAll('input, textarea, select')).filter((field) => (
    field.type !== 'hidden' && field.type !== 'file' && field.name !== 'website'
  ));
  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field, true));
    field.addEventListener(field.type === 'checkbox' ? 'change' : 'input', () => {
      if (field.classList.contains('is-invalid') || field.classList.contains('is-valid')) validateField(field, true);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const fieldsValid = fields.map((field) => validateField(field, true)).every(Boolean);
    const filesValid = validateFiles(true);
    if (!fieldsValid || !filesValid) {
      const firstInvalid = form.querySelector('.is-invalid');
      firstInvalid?.focus();
      setStatus('Vui lòng kiểm tra lại các trường được đánh dấu.', 'error');
      return;
    }

    try {
      if (!endpoint.startsWith('https://script.google.com/macros/s/')) throw new Error('Form chưa được cấu hình điểm nhận hồ sơ.');
      setSubmitting(true);
      setStatus('');

      const files = [...fileState.cv];
      const attachments = await Promise.all(files.map(async (file) => ({
        name: file.name,
        mimeType: file.type,
        kind: 'cv',
        base64: await fileToBase64(file),
      })));
      const data = new FormData(form);
      const payload = new URLSearchParams();
      for (const [key, value] of data.entries()) {
        if (!(value instanceof File)) payload.set(key, String(value));
      }
      payload.set('formType', 'recruitment');
      payload.set('attachments', JSON.stringify(attachments));
      payload.set('landingPage', window.location.href.slice(0, 250));
      payload.set('startedAt', String(startedAt));

      await submitWithVerifiedResponse(endpoint, payload);
      form.reset();
      fileState.cv = [];
      renderFiles(cvInput, 'cv');
      fields.forEach((field) => {
        field.classList.remove('is-valid', 'is-invalid');
        field.removeAttribute('aria-invalid');
        const error = field.closest('label')?.querySelector('[data-field-error]');
        if (error) error.textContent = '';
      });
      startedAt = Date.now();
      setStatus('');
      document.dispatchEvent(new CustomEvent('webs4v:conversion', { detail: { eventName: 'submit_recruitment_form', position: payload.get('position') } }));
      await showSuccessAlert();
    } catch (error) {
      setStatus(error?.message || 'Chưa thể gửi hồ sơ. Vui lòng thử lại hoặc liên hệ support@webs4v.vn.', 'error');
    } finally {
      setSubmitting(false);
    }
  });
});
