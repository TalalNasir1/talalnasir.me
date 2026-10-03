const body = document.body;
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const themeButton = document.querySelector('[data-theme-toggle]');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelector('[data-year]').textContent = new Date().getFullYear();

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeMeta.setAttribute('content', dark ? '#0b0b0d' : '#ffffff');
}

const savedTheme = localStorage.getItem('portfolio-theme');
applyTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

themeButton.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem('portfolio-theme', nextTheme);
});

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
  body.classList.toggle('menu-open', !open);
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
  const tags = (project.tags || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join('');
  const secondary = project.secondaryUrl && project.secondaryLabel
    ? `<a href="${safeUrl(project.secondaryUrl)}" target="_blank" rel="noreferrer">${escapeHtml(project.secondaryLabel)}</a>`
    : '';

  return `
    <article class="project-card reveal">
      <a class="project-image" href="${safeUrl(project.visualUrl || project.primaryUrl)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(project.visualLabel || `Open ${project.title}`)}">
        <img src="${safeUrl(project.image)}" alt="${escapeHtml(project.imageAlt || project.title)}" loading="lazy" />
      </a>
      <div class="project-content">
        <div class="project-meta"><span>${escapeHtml(project.categoryLabel)}</span><span>${escapeHtml(project.year)}</span></div>
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
  return `
    <article class="credential-card reveal">
      <span class="credential-number">${number}</span>
      <p class="credential-issuer">${escapeHtml(credential.issuer)}</p>
      <h3>${escapeHtml(credential.title)}</h3>
      <div class="credential-meta"><span>Issued ${escapeHtml(credential.issued)}</span><span>${escapeHtml(credential.credential)}</span></div>
    </article>`;
}

let revealObserver;

function observeReveals() {
  const items = document.querySelectorAll('.reveal:not([data-observed])');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  }

  items.forEach((item, index) => {
    item.dataset.observed = 'true';
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 65}ms`;
    revealObserver.observe(item);
  });
}

function initializeActiveNavigation() {
  if (!('IntersectionObserver' in window)) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -58% 0px', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));
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
  } catch (error) {
    console.error(error);
    projectGrid.innerHTML = '<p class="content-notice">Projects are temporarily unavailable.</p>';
    credentialGrid.innerHTML = '<p class="content-notice">Certifications are temporarily unavailable.</p>';
  }

  observeReveals();

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

observeReveals();
initializeActiveNavigation();
loadPortfolioContent();

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 20);
}, { passive: true });
