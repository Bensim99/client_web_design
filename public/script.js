/* ============================================================
   Law Firm Landing — Interactions & Animations
   Built per ui-ux-pro-max guidance:
   - Respect prefers-reduced-motion
   - 150-300ms timing
   - Inline form validation on blur (not keystroke)
   - aria-live toasts
   - IntersectionObserver scroll reveal with stagger
   ============================================================ */

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Copyright year ===== */
  const yearEl = document.getElementById('copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Mobile navigation ===== */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ===== Sticky navbar shadow on scroll ===== */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ===== Scroll reveal with stagger ===== */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const staggerGroups = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const type = el.getAttribute('data-reveal');

        if (type === 'stagger') {
          const parent = el.parentElement;
          if (!staggerGroups.has(parent)) {
            staggerGroups.set(parent, true);
            const items = parent.querySelectorAll('[data-reveal="stagger"]');
            items.forEach((item, i) => {
              setTimeout(() => item.classList.add('is-visible'), i * 80);
            });
          }
        } else {
          el.classList.add('is-visible');
        }
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => io.observe(el));
  }

  /* ===== Count-up animation for stats ===== */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const raw = el.getAttribute('data-count') || '';
      const target = parseInt(raw.replace(/[^\d]/g, ''), 10);
      const suffix = el.getAttribute('data-suffix') || '';

      // If placeholder text without a number, just show the raw value
      if (isNaN(target)) {
        el.textContent = raw + suffix;
        return;
      }
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString('he-IL') + suffix;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const easeOut = t => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const value = Math.floor(target * easeOut(t));
        el.textContent = value.toLocaleString('he-IL') + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('he-IL') + suffix;
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const countIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(c => countIO.observe(c));
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ===== Smooth scroll for in-page links (accounting for sticky nav) ===== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* ===== Inline form validation (validate on blur, per §8 inline-validation) ===== */
  document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.required && !field.value.trim()) {
        field.classList.add('invalid');
      } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        field.classList.add('invalid');
      } else {
        field.classList.remove('invalid');
      }
    });
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid') && field.value.trim()) {
        field.classList.remove('invalid');
      }
    });
  });

  /* ===== Toast notifications ===== */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  window.showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4000);
  };
})();

/* ===== Form handlers (exposed globally for inline onsubmit) ===== */
function validateForm(form) {
  let firstInvalid = null;
  form.querySelectorAll('[required]').forEach(f => {
    if (!f.value || (f.type === 'checkbox' && !f.checked)) {
      f.classList.add('invalid');
      if (!firstInvalid) firstInvalid = f;
    }
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }
  return true;
}

function handleLead(e) {
  e.preventDefault();
  if (!validateForm(e.target)) return false;
  if (window.showToast) {
    window.showToast('[שדה 109: הודעת אישור לטופס לידים – לדוגמה "תודה! ניצור איתך קשר בקרוב"]');
  }
  e.target.reset();
  return false;
}

function handleContact(e) {
  e.preventDefault();
  if (!validateForm(e.target)) return false;
  if (window.showToast) {
    window.showToast('[שדה 110: הודעת אישור לטופס יצירת קשר – לדוגמה "ההודעה נשלחה בהצלחה"]');
  }
  e.target.reset();
  return false;
}

window.handleLead = handleLead;
window.handleContact = handleContact;
