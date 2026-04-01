/* LUMIERE — main.js */

/* 1. FADE-IN */
window.addEventListener('load', () => {
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
});

/* 2. HERO SCROLL — cinematic parallax */
const initHeroScroll = () => {
  const stickyWrap = document.querySelector('.hero__sticky-wrap');
  const scenes     = document.querySelectorAll('.hero__scene');
  const dots       = document.querySelectorAll('.hero__progress-dot');
  if (!stickyWrap || !scenes.length) return;
  if (typeof gsap === 'undefined') return;

  const SCENE_COUNT = scenes.length;
  let currentScene  = 0;
  let scrollY       = 0;
  let smoothScrollY = 0;
  const INERTIA     = 0.03;

  const getLayers = (scene) => ({
    bg:      scene.querySelector('.scene__bg'),
    mid:     scene.querySelector('.scene__mid'),
    content: scene.querySelector('.scene__content'),
  });

  const activateScene = (index) => {
    if (index === currentScene &&
        scenes[index].classList.contains('is-active')) return;
    scenes.forEach((s, i) => {
      s.classList.remove('is-active', 'is-prev');
      if (i === index) s.classList.add('is-active');
      if (i < index)  s.classList.add('is-prev');
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    const counter = document.querySelector('.hero__counter-current');
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    currentScene = index;
  };

  const animateLines = (content, lp, selector, starts, ends) => {
    const lines = content.querySelectorAll(selector);
    lines.forEach((line, i) => {
      const s = starts[i] || starts[starts.length - 1];
      const e = ends ? (ends[i] || ends[ends.length - 1]) : 2;
      const appear = Math.max(0, Math.min((lp - s) / 0.18, 1));
      gsap.set(line, { opacity: appear, y: 28 - appear * 28 });
    });
  };

  const animateScene1 = (lp, ly) => {
    if (!ly.bg) return;
    const crane = Math.min(lp / 0.4, 1);
    gsap.set(ly.bg, { scale: 1.04 - crane * 0.04, y: crane * 40, x: (-2 + lp * 2) + '%' });
    if (ly.mid) gsap.set(ly.mid, { opacity: 0.2 + crane * 0.45 });
    if (!ly.content) return;
    animateLines(ly.content, lp,
      '.hero__eyebrow, .hero__title, .hero__subtitle, .btn',
      [0.15, 0.27, 0.39, 0.51], [0.75, 0.80, 0.85, 0.90]);
  };

  const animateScene2 = (lp, ly) => {
    if (!ly.bg) return;
    gsap.set(ly.bg, { scale: 1.04 - lp * 0.02, x: (-4 + lp * 8) + '%', y: 0 });
    if (ly.mid) gsap.set(ly.mid, { x: (-lp * 3) + '%' });
    if (!ly.content) return;
    animateLines(ly.content, lp,
      '.hero__eyebrow, .hero__title, .hero__subtitle',
      [0.12, 0.26, 0.40], [0.78, 0.82, 0.86]);
  };

  const animateScene3 = (lp, ly) => {
    if (!ly.bg) return;
    gsap.set(ly.bg, { scale: 1.1 - lp * 0.08, x: '0%', y: 0 });
    if (ly.mid) gsap.set(ly.mid, { opacity: 0.5 - lp * 0.35 });
    if (!ly.content) return;
    const lines = ly.content.querySelectorAll('.hero__eyebrow, .hero__title, .btn');
    lines.forEach((line, i) => {
      const s = 0.1 + i * 0.16;
      const appear = Math.max(0, Math.min((lp - s) / 0.22, 1));
      gsap.set(line, { opacity: appear, y: 20 - appear * 20, scale: 0.94 + appear * 0.06 });
    });
  };

  const animators = [animateScene1, animateScene2, animateScene3];

  const tick = () => {
    smoothScrollY += (scrollY - smoothScrollY) * INERTIA;
    const total    = stickyWrap.offsetHeight - window.innerHeight;
    const progress = Math.min(smoothScrollY / total, 1);
    const rawIndex = progress * SCENE_COUNT;
    const sceneIndex = Math.min(Math.floor(rawIndex), SCENE_COUNT - 1);
    const localProgress = rawIndex - Math.floor(rawIndex);

    if (localProgress > 0.12 || sceneIndex === 0) activateScene(sceneIndex);

    scenes.forEach((scene, i) => {
      if (!animators[i]) return;
      const local = i < sceneIndex ? 1 : i > sceneIndex ? 0 : localProgress;
      animators[i](local, getLayers(scene));
    });
    requestAnimationFrame(tick);
  };

  window.addEventListener('scroll', () => {
    const rect = stickyWrap.getBoundingClientRect();
    scrollY = Math.max(0, -rect.top);
  }, { passive: true });

  tick();
};

/* 3. HEADER SCROLL */
const initHeaderScroll = () => {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 80);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
};

/* 4. BURGER */
const initBurger = () => {
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open');
  });

  nav.addEventListener('click', (e) => {
    if (e.target.closest('.header__link')) {
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
};

/* 5. FAQ ACCORDION */
const initFaq = () => {
  const faq = document.querySelector('.section-faq');
  if (!faq) return;

  faq.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq__question');
    if (!btn) return;

    const item = btn.closest('.faq__item');
    const wasOpen = item.classList.contains('is-open');

    faq.querySelectorAll('.faq__item.is-open').forEach((el) => {
      el.classList.remove('is-open');
      el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });

    if (!wasOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
};

/* 6. COUNT-UP */
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const animateCount = (el, target, duration) => {
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOutQuart(progress) * target).toLocaleString('ru-RU');
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const initCountUp = () => {
  const stats = document.querySelector('.about__stats');
  if (!stats) return;

  const obs = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      obs.unobserve(stats);

      stats.querySelectorAll('[data-count]').forEach((el) => {
        animateCount(el, parseInt(el.dataset.count, 10), 1800);
      });
    },
    { threshold: 0.3 }
  );

  obs.observe(stats);
};

/* 7. SWIPER */
const initSwiper = () => {
  if (typeof Swiper === 'undefined') return;

  new Swiper('.reviews__slider', {
    slidesPerView: 1,
    spaceBetween: 32,
    loop: true,
    autoplay: { delay: 4500, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      768: { slidesPerView: 2 },
      1200: { slidesPerView: 3 }
    }
  });
};

/* 8. FORM */
const initForm = () => {
  const form = document.querySelector('.booking__form');
  if (!form) return;

  const showError = (field, msg) => {
    const group = field.closest('.booking__field');
    group.classList.add('is-error');
    let el = group.querySelector('.booking__error');
    if (!el) {
      el = document.createElement('span');
      el.className = 'booking__error';
      group.appendChild(el);
    }
    el.textContent = msg;
  };

  const clearErrors = () => {
    form.querySelectorAll('.is-error').forEach((g) => g.classList.remove('is-error'));
    form.querySelectorAll('.booking__error').forEach((e) => { e.textContent = ''; });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = form.querySelector('#name');
    const contact = form.querySelector('#contact');
    let ok = true;

    if (!name.value.trim()) { showError(name, 'Введите ваше имя'); ok = false; }
    if (!contact.value.trim()) { showError(contact, 'Введите телефон или Telegram'); ok = false; }
    if (!ok) return;

    const BOT_TOKEN = '';
    const CHAT_ID = '';

    if (!BOT_TOKEN || !CHAT_ID) {
      form.classList.add('is-hidden');
      const s = document.getElementById('form-success');
      if (s) s.classList.add('is-visible');
      return;
    }

    const text = [
      `Имя: ${name.value.trim()}`,
      `Контакт: ${contact.value.trim()}`,
      `Услуга: ${form.querySelector('#service').value}`,
      `Сообщение: ${form.querySelector('#message').value.trim()}`
    ].join('\n');

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
      });
      form.classList.add('is-hidden');
      const s = document.getElementById('form-success');
      if (s) s.classList.add('is-visible');
    } catch (err) {
      console.error('Form send error:', err);
    }
  });
};

/* 9. AOS */
const initAOS = () => {
  if (typeof AOS === 'undefined') return;
  AOS.init({ duration: 700, easing: 'ease-out-quart', once: true, offset: 60 });
};

/* 10. BEFORE/AFTER SLIDER */
const initBeforeAfter = () => {
  const slider = document.getElementById('ba-slider');
  const after = slider?.querySelector('.results__after');
  const handle = document.getElementById('ba-handle');
  if (!slider || !after || !handle) return;

  let isDragging = false;

  const setPosition = (x) => {
    const rect = slider.getBoundingClientRect();
    const percent = Math.min(Math.max((x - rect.left) / rect.width, 0.05), 0.95);
    const pct = (percent * 100).toFixed(1);
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = `${pct}%`;
  };

  slider.addEventListener('mousedown', (e) => { isDragging = true; setPosition(e.clientX); });
  slider.addEventListener('touchstart', (e) => { isDragging = true; setPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mousemove', (e) => { if (isDragging) setPosition(e.clientX); });
  window.addEventListener('touchmove', (e) => { if (isDragging) setPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('touchend', () => { isDragging = false; });
};

/* 11. CURSOR */
const initCursor = () => {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  const ring = cursor.querySelector('.cursor__ring');
  const dot = cursor.querySelector('.cursor__dot');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  };
  animateRing();

  document.querySelectorAll('a, button, .results__slider').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
  });
};

/* 12. PERSPECTIVE TILT — service cards */
const initTilt = () => {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  const MAX_TILT = 12;
  const SCALE   = 1.03;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -MAX_TILT;
      const rotateY = ((x - centerX) / centerX) *  MAX_TILT;

      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${SCALE})`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform =
        'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
};

/* 13. AMBIENT — breathing backgrounds */
const initAmbient = () => {
  const bgs = document.querySelectorAll('.scene__bg');
  if (!bgs.length) return;
  if (typeof gsap === 'undefined') return;

  bgs.forEach((bg, i) => {
    const delay = i * 1.8;
    gsap.to(bg, {
      x: '+=6', y: '+=4', scale: '+=0.012',
      duration: 10, delay, ease: 'sine.inOut',
      repeat: -1, yoyo: true,
    });
  });
};

/* 14. SERVICE CARDS — staggered reveal */
const initServiceCards = () => {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => {
        entry.target.classList.add('is-visible');
      }, i * 180);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  cards.forEach(card => observer.observe(card));
};

/* 15. ABOUT PARALLAX */
const initAboutParallax = () => {
  const img = document.querySelector('.about__photo img');
  if (!img) return;

  const section = document.querySelector('.section-about');
  if (!section) return;

  const onScroll = () => {
    const rect     = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1,
      1 - (rect.bottom / (window.innerHeight + rect.height))
    ));
    const translateY = -20 + progress * 20;
    img.style.transform = `scale(1.08) translateY(${translateY}px)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

/* 16. FORM EFFECTS — floating labels */
const initFormEffects = () => {
  const groups = document.querySelectorAll('.booking__field');
  if (!groups.length) return;

  groups.forEach(group => {
    const input = group.querySelector('.booking__input');
    if (!input) return;

    const checkValue = () => {
      group.classList.toggle('has-value', input.value.trim() !== '');
    };

    input.addEventListener('input', checkValue);
    input.addEventListener('change', checkValue);
    checkValue();
  });
};

/* 17. SECTION REVEAL */
const initSectionReveal = () => {
  const sections = document.querySelectorAll(
    '.section-about, .section-services, .section-process, .section-reviews, .section-faq, .section-booking, .results'
  );
  if (!sections.length) return;

  sections.forEach(section => section.classList.add('section-reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  sections.forEach(section => observer.observe(section));
};

/* BOOTSTRAP */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initBurger();
  initHeroScroll();
  initAmbient();
  initFaq();
  initCountUp();
  initSwiper();
  initForm();
  initFormEffects();
  initBeforeAfter();
  initCursor();
  initTilt();
  initServiceCards();
  initAboutParallax();
  initSectionReveal();
  initAOS();
});
