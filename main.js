(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Clock (Philippine time) ---------- */
  const tick = () => {
    const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' }).format(new Date());
    $$('.js-clock').forEach(c => (c.textContent = t));
  };
  tick(); setInterval(tick, 15000);

  /* ---------- Typewriter ---------- */
  const roles = ['a BSIT student.', 'a web developer.', 'a full-stack developer.', 'a mobile app developer.', 'a security-minded builder.', 'ready for OJT.'];
  const typed = $('.typed');
  if (typed) {
    if (reduced) { typed.textContent = roles[2]; }
    else {
      let r = 0, i = 0, deleting = false;
      const step = () => {
        const word = roles[r];
        if (!deleting) {
          typed.textContent = word.slice(0, ++i);
          if (i === word.length) { deleting = true; return setTimeout(step, 1700); }
          return setTimeout(step, 55 + Math.random() * 60);
        }
        typed.textContent = word.slice(0, --i);
        if (i === 0) { deleting = false; r = (r + 1) % roles.length; return setTimeout(step, 350); }
        setTimeout(step, 28);
      };
      setTimeout(step, 700);
    }
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (!reduced && hasGSAP && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.05, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Nav state + progress ---------- */
  const nav = $('.nav');
  const progress = $('.progress');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Active section highlight
  const links = $$('.nav__links a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'skills', 'work', 'certs', 'experience', 'contact'].forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });

  /* ---------- Intro + scroll reveals ---------- */
  if (hasGSAP && !reduced) {
    gsap.timeline({ defaults: { ease: 'power3.out', duration: .9 } })
      .from('.nav', { y: -20, opacity: 0, duration: .7 })
      .from('.hero__text > *', { y: 26, opacity: 0, stagger: .08 }, '-=.4')
      .from('.hero__photo', { y: 30, opacity: 0, scale: .97, duration: 1.1 }, '-=1')
      .from('.badge', { y: 16, opacity: 0, stagger: .12, duration: .7 }, '-=.6');

    // Gentle float on badges
    $$('.badge').forEach((b, i) => gsap.to(b, { y: i % 2 ? 8 : -8, duration: 3 + i * .4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 }));

    const reveal = (targets, trigger, opts = {}) => gsap.from(targets, {
      y: 28, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, ...opts,
      scrollTrigger: { trigger: trigger || targets, start: 'top 86%', once: true }
    });

    $$('.section, .contact').forEach(sec => {
      const head = $$(':scope > .sec-head, :scope > .title, :scope > .skills__note, :scope > .contact__kicker, :scope > .contact__title', sec);
      if (head.length) reveal(head, sec);
    });
    reveal('.about__statement', '.about__grid');
    reveal(['.about__photo', '.about__body', '.about__edu'], '.about__grid', { delay: .1 });
    reveal('.stat', '.stats');
    reveal('.skill-card', '.skills__grid', { stagger: .07 });
    reveal('.work__index li', '.work__index');
    $$('.project').forEach(p => {
      reveal(p, p, { y: 40 });
      reveal($$('.project__col', p), $('.project__body', p), { stagger: .1 });
      reveal($$('.gallery .shot', p), $('.gallery', p), { stagger: .08 });
      const phones = $('.phones', p); if (phones) reveal($$('.phone', phones), phones, { stagger: .1 });
      const algo = $('.algo__bar', p);
      if (algo) gsap.from($$('span', algo), { scaleX: 0, duration: 1, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: algo, start: 'top 90%', once: true } });
    });
    reveal('.github-cta', '.github-cta');
    reveal('.cert', '.certs__grid', { stagger: .12 });
    reveal('.log__item', '.log', { stagger: .07 });
    reveal(['.contact__mail', '.contact__row'], '.contact__mail', { stagger: .1 });
  }

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    if (reduced || !hasGSAP) { el.textContent = end; return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* ---------- Anchor links ---------- */
  const burger = $('.nav__burger');
  const menu = $('.menu');
  const navOffset = () => -(nav.offsetHeight - 1);
  function closeMenu() {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true');
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault(); closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : navOffset(), duration: 1.3 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + navOffset(), behavior: reduced ? 'auto' : 'smooth' });
  }));
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-hidden', String(!open));
  });

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  const showToast = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 2200); };
  $$('.js-copy').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); showToast('Email copied to clipboard'); }
    catch { showToast(b.dataset.copy); }
  }));

  /* ---------- Lightbox ---------- */
  const lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('.lightbox__cap', lb);
  let lastFocus = null;
  $$('img[data-full]').forEach(img => {
    const fig = img.closest('figure');
    fig.setAttribute('tabindex', '0'); fig.setAttribute('role', 'button'); fig.setAttribute('aria-label', 'Enlarge: ' + img.alt);
    const open = () => {
      lastFocus = document.activeElement;
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt;
      lb.hidden = false; if (lenis) lenis.stop();
      $('.lightbox__close').focus();
      if (hasGSAP && !reduced) { gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: .25 }); gsap.fromTo(lbImg, { scale: .96, y: 16 }, { scale: 1, y: 0, duration: .5, ease: 'power3.out' }); }
    };
    fig.addEventListener('click', open);
    fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  const closeLb = () => { lb.hidden = true; if (lenis) lenis.start(); if (lastFocus) lastFocus.focus(); };
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (!lb.hidden) closeLb(); closeMenu(); } });
})();
