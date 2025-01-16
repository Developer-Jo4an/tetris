import smoothscroll from 'smoothscroll-polyfill';

if (global.window) {
  smoothscroll.polyfill();
}

export default function smoothScroll(el) {
  if (!el) return;
  el.scrollIntoView({behavior: "smooth"});
}

export function smoothScrollByHash(hash) {
  const el = hash && document.getElementById(hash.substr(1));
  smoothScroll(el);
}

export function checkHashLickClick(e) {
  if (e.currentTarget.pathname === window.location.pathname) {
    e.preventDefault();
    smoothScrollByHash(e.currentTarget.hash);
    window.history.pushState({}, '', e.currentTarget.href);
  }
}
