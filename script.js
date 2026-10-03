const body = document.body;
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const progress = document.querySelector('.scroll-progress span');
const glow = document.querySelector('.cursor-glow');
const heroArt = document.querySelector('.hero-art');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelector('[data-year]').textContent = new Date().getFullYear();

function updateScrollUI() {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 28);
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${total > 0 ? (y / total) * 100 : 0}%`;

  if (!prefersReducedMotion && heroArt && y < window.innerHeight * 1.2) {
    heroArt.style.transform = `scale(1.02) translateY(${y * 0.06}px)`;
  }
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('is-open', !isOpen);
  body.classList.toggle('menu-open', !isOpen);
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    body.classList.remove('menu-open');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
);

document.querySelectorAll('.reveal').forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(item);
});

const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('is-active'));
    filter.classList.add('is-active');
    const selected = filter.dataset.filter;

    projects.forEach((project) => {
      const visible = selected === 'all' || project.dataset.category === selected;
      project.classList.toggle('is-hidden', !visible);
    });
  });
});

if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    glow.style.opacity = '1';
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${-y * 1.7}deg) rotateY(${x * 1.7}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });
}
