import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from './App';
import '../style.css';

// Prevent the server-rendered logos from flashing before Vite has applied the
// stylesheet. This runs only after the imported CSS is ready.
document.documentElement.classList.remove('css-pending');

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
