import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from './App';
import '../style.css';

const rootElement = document.getElementById('root');
const staticMain = rootElement?.querySelector('main');
const mainMarkup = staticMain?.innerHTML ?? '';
const page = document.body.classList.contains('service-page')
  ? 'services'
  : document.body.classList.contains('about-page')
    ? 'about'
    : 'home';

if (!rootElement) {
  throw new Error('Không tìm thấy phần tử #root để khởi tạo React.');
}

const root = createRoot(rootElement);
flushSync(() => {
  root.render(<App page={page} mainMarkup={mainMarkup} />);
});

import('../main.js');
