/* =========================================================
   XREZZKY TOP UP — script.js
   Vanilla ES6. No dependencies.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar: shadow + background on scroll ---------- */
  const navbar = document.querySelector('.navbar');
  const onScrollNav = () => {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Active link highlight on scroll ---------- */
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const highlightNav = () => {
    let current = sections[0];
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => { if (sec.offsetTop <= scrollPos) current = sec; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
  };
  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale, .stagger');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el, i) => {
    if (el.classList.contains('stagger')) {
      Array.from(el.children).forEach((child, ci) => child.style.setProperty('--i', ci));
    }
    io.observe(el);
  });

  /* ---------- Charge bars (hero + stat cards) ---------- */
  document.querySelectorAll('.charge-bar').forEach(bar => {
    const ioBar = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          ioBar.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    ioBar.observe(bar);
  });

  /* ---------- Stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = el.dataset.count.includes('.') ? 1 : 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (decimals ? value.toFixed(1) : Math.floor(value).toLocaleString('id-ID')) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterIO.observe(c));

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });

  /* ---------- Promo slider ---------- */
  const track = document.querySelector('.promo-track');
  const slides = document.querySelectorAll('.promo-slide');
  const dotsWrap = document.querySelector('.promo-nav');
  let current = 0;
  let autoTimer;

  if (track && slides.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'promo-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide promo ' + (i + 1));
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function goToSlide(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      document.querySelectorAll('.promo-dot').forEach((d, di) => d.classList.toggle('active', di === current));
      resetAuto();
    }
    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goToSlide(current + 1), 5000);
    }
    document.querySelector('.promo-arrow.next').addEventListener('click', () => goToSlide(current + 1));
    document.querySelector('.promo-arrow.prev').addEventListener('click', () => goToSlide(current - 1));
    resetAuto();
  }

  /* ---------- Smooth anchor scroll offset (fixed navbar) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---------- Current year in footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
