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

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeUrl(value = '') {
  const url = String(value).trim();
  if (/^https:\/\//i.test(url) || /^[a-z0-9_./-]+$/i.test(url)) return escapeHtml(url);
  return '#';
}

function projectMarkup(project, index) {
  const number = String(index + 1).padStart(2, '0');
  const layoutClass = project.layout === 'wide' ? ' project-wide' : project.layout === 'featured' ? ' project-featured' : '';
  const styleClass = project.imageStyle && project.imageStyle !== 'standard' ? ` project-visual-${escapeHtml(project.imageStyle)}` : '';
  const tags = (project.tags || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join('');
  const secondary = project.secondaryUrl && project.secondaryLabel
    ? `<a href="${safeUrl(project.secondaryUrl)}" target="_blank" rel="noreferrer">${escapeHtml(project.secondaryLabel)}</a>`
    : '';
  const metric = project.metricValue
    ? `<span class="metric-orbit"><strong>${escapeHtml(project.metricValue)}</strong><small>${escapeHtml(project.metricLabel)}</small></span>`
    : '';

  return `
    <article class="project-card${layoutClass} reveal" data-category="${escapeHtml(project.category)}" data-tilt>
      <a class="project-visual${styleClass}" href="${safeUrl(project.visualUrl || project.primaryUrl)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(project.visualLabel || `Open ${project.title}`)}">
        <img src="${safeUrl(project.image)}" alt="${escapeHtml(project.imageAlt || project.title)}" loading="lazy" />
        ${project.badge ? `<span class="visual-badge">${escapeHtml(project.badge)}</span>` : ''}
        ${metric}
      </a>
      <div class="project-content">
        <div class="project-meta"><span>${number} · ${escapeHtml(project.categoryLabel)}</span><span>${escapeHtml(project.year)}</span></div>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <ul class="tag-list" aria-label="Technologies">${tags}</ul>
        <div class="project-links">
          <a href="${safeUrl(project.primaryUrl)}" target="_blank" rel="noreferrer">${escapeHtml(project.primaryLabel || 'View project')}</a>
          ${secondary}
        </div>
      </div>
    </article>`;
}

function credentialMarkup(credential, index) {
  const number = String(index + 1).padStart(2, '0');
  const featuredClass = credential.featured ? ' credential-featured' : '';
  return `
    <article class="credential-card${featuredClass} reveal">
      <span class="credential-number">${number}</span>
      <p class="credential-issuer">${escapeHtml(credential.issuer)}</p>
      <h3>${escapeHtml(credential.title)}</h3>
      <div class="credential-meta"><span>Issued ${escapeHtml(credential.issued)}</span><span>${escapeHtml(credential.credential)}</span></div>
    </article>`;
}

function initializeReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
    return;
  }

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
}

function initializeFilters() {
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
}

function initializePointerEffects() {
  if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

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
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}

async function loadPortfolioContent() {
  const projectGrid = document.querySelector('[data-project-grid]');
  const credentialGrid = document.querySelector('[data-credential-grid]');

  try {
    const response = await fetch('content/portfolio.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
    const content = await response.json();
    projectGrid.innerHTML = (content.projects || []).map(projectMarkup).join('');
    credentialGrid.innerHTML = (content.certifications || []).map(credentialMarkup).join('');

    const count = content.projects?.length || 0;
    const summary = document.querySelector('[data-project-summary]');
    if (summary) summary.textContent = `${count} selected projects across applied AI, native products, interface craft, operational software, and network design.`;
  } catch (error) {
    console.error(error);
    projectGrid.innerHTML = '<p class="content-notice">Projects are temporarily unavailable.</p>';
    credentialGrid.innerHTML = '<p class="content-notice">Certifications are temporarily unavailable.</p>';
  }

  initializeReveal();
  initializeFilters();
  initializePointerEffects();
  updateScrollUI();

  if (window.location.hash) {
    requestAnimationFrame(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        target.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
      }
    });
  }
}

loadPortfolioContent();
