/* ================================================================
   SOSICK · FANCY JS LAYER  v20261106
   - Back-to-top button
   - Topbar scroll glass effect
   - Toast notification system (window.sosiToast)
   - Scroll-reveal (IntersectionObserver)
   - Scroll-triggered skeleton reveal for grids
   - CTA WhatsApp button ripple
   ================================================================ */
(function () {
  'use strict';

  /* ---- Back-to-top ---- */
  const btn = document.getElementById('backToTop');
  if (btn) {
    const onScroll = () => {
      btn.classList.toggle('is-visible', window.scrollY > 320);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  }

  /* ---- Topbar scroll glass ---- */
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    window.addEventListener('scroll', () => {
      topbar.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ---- Toast system ---- */
  const stack = document.getElementById('toastStack');
  window.sosiToast = function (msg, type = 'info', duration = 3800) {
    if (!stack) return;
    const icons = { info: '✦', ok: '✓', bad: '✕' };
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span class="toast-icon" aria-hidden="true">${icons[type] || '✦'}</span><span>${msg}</span>`;
    t.setAttribute('role', 'alert');
    stack.appendChild(t);
    const dismiss = () => {
      t.classList.add('is-out');
      t.addEventListener('animationend', () => t.remove(), { once: true });
    };
    t.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  };

  /* ---- Scroll-reveal (IntersectionObserver) ---- */
  const sections = document.querySelectorAll('.band, .hero, .ticket, .test, .badges, .steps, .engines');
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          /* Reveal direct children that have the reveal class */
          entry.target.querySelectorAll('.reveal').forEach(el => el.classList.add('is-revealed'));
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    sections.forEach(s => revealObs.observe(s));

    /* Grid items (they arrive later from the database and re-render on
       search) each get their own watcher, so none stay invisible. */
    const itemObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); itemObs.unobserve(entry.target); }
      });
    }, { threshold: 0.05 });
    const armItems = () => {
      document.querySelectorAll('.cat-tile:not(.reveal), .plug:not(.reveal), .product:not(.reveal)').forEach((el, i) => {
        el.classList.add('reveal', `reveal-delay-${(i % 3) + 1}`);
        itemObs.observe(el);
      });
    };
    const gridObs = new MutationObserver(armItems);
    ['catGrid', 'freshGrid', 'plugGrid'].forEach(id => {
      const el = document.getElementById(id);
      if (el) gridObs.observe(el, { childList: true });
    });
    armItems();
  }

  /* ---- Section entrance triggers sosiToast once per section ---- */
  const sectionToasts = {
    order: ['🛵 Ready to order? Fill the slip!', 'info'],
    plugs: ['🔌 Verified Plugs are seller-tested by us!', 'info'],
    track: ['📍 Enter your code to track your order live.', 'info'],
  };
  const shownToasts = new Set();
  if ('IntersectionObserver' in window) {
    const toastObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting && sectionToasts[id] && !shownToasts.has(id)) {
          shownToasts.add(id);
          const [msg, type] = sectionToasts[id];
          setTimeout(() => window.sosiToast(msg, type, 4000), 600);
        }
      });
    }, { threshold: 0.25 });
    ['order', 'plugs', 'track'].forEach(id => {
      const el = document.getElementById(id);
      if (el) toastObs.observe(el);
    });
  }

  /* ---- Order form copy button toast ---- */
  const copyBtn = document.getElementById('copyMsg');
  if (copyBtn) {
    const orig = copyBtn.addEventListener.bind(copyBtn);
    copyBtn.addEventListener('click', function handler() {
      setTimeout(() => window.sosiToast('Message copied to clipboard! ✦', 'ok'), 300);
    });
  }

  /* ---- Button ripple effect ---- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const r = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    Object.assign(r.style, {
      position: 'absolute',
      width: size + 'px',
      height: size + 'px',
      left: (e.clientX - rect.left - size / 2) + 'px',
      top: (e.clientY - rect.top - size / 2) + 'px',
      background: 'rgba(255,255,255,0.22)',
      borderRadius: '50%',
      transform: 'scale(0)',
      pointerEvents: 'none',
      zIndex: '10',
    });
    r.animate([
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0 }
    ], { duration: 500, easing: 'ease-out' }).onfinish = () => r.remove();
    btn.style.position = btn.style.position || 'relative';
    btn.appendChild(r);
  });

  /* ---- Keyboard accessibility: skip to content ---- */
  const skip = document.createElement('a');
  skip.href = '#top';
  skip.textContent = 'Skip to content';
  Object.assign(skip.style, {
    position: 'fixed', top: '-100px', left: '16px',
    zIndex: '9999', background: 'var(--sun)', color: 'var(--ink)',
    padding: '10px 16px', borderRadius: '8px', fontWeight: '800',
    border: '2px solid var(--ink)', textDecoration: 'none',
    transition: 'top .2s',
  });
  skip.addEventListener('focus', () => skip.style.top = '8px');
  skip.addEventListener('blur',  () => skip.style.top = '-100px');
  document.body.prepend(skip);

  /* ---- Year in footer ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
