import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
  (globalThis as any).TextDecoder = TextDecoder;
}

// Polyfills for JSDOM
if (typeof window !== 'undefined') {
  if (typeof window.TextEncoder === 'undefined') {
    window.TextEncoder = TextEncoder;
    (window as any).TextDecoder = TextDecoder;
  }
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Mock scrollTo and scrollIntoView
  window.scrollTo = (() => {}) as any;
  if (typeof window.HTMLElement !== 'undefined') {
    window.HTMLElement.prototype.scrollIntoView = (() => {}) as any;
  }
  if (typeof Element !== 'undefined') {
    Element.prototype.scrollIntoView = (() => {}) as any;
  }
}
