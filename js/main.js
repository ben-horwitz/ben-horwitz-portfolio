// Ben Horwitz portfolio — shared behavior

document.addEventListener('DOMContentLoaded', () => {
  // Keyboard project navigation — left/right arrows step to the
  // previous/next project on a project detail page, same as clicking
  // the prev/next links at the bottom. Skipped while typing anywhere
  // or while the lightbox is open (it has its own arrow handling).
  const projectNav = document.querySelector('.project-nav');
  if (projectNav) {
    const prevLink = projectNav.querySelector('a:first-child');
    const nextLink = projectNav.querySelector('a:last-child');
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (document.querySelector('.lightbox.open')) return;
      if (e.key === 'ArrowLeft' && prevLink) window.location.href = prevLink.href;
      if (e.key === 'ArrowRight' && nextLink) window.location.href = nextLink.href;
    });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hint = document.createElement('p');
      hint.className = 'nav-hint';
      hint.textContent = 'or use ← →';
      projectNav.insertAdjacentElement('afterend', hint);
    }
  }

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // "Work" dropdown — jump straight to a project instead of only
  // landing back on the homepage grid.
  const workWrap = document.querySelector('.nav-work');
  const workToggle = document.querySelector('.nav-work-toggle');
  if (workWrap && workToggle) {
    workToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = workWrap.classList.toggle('open');
      workToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!workWrap.contains(e.target)) {
        workWrap.classList.remove('open');
        workToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Play muted preview videos only while their card is on screen,
  // so we're not decoding a dozen videos at once on page load.
  const previewVideos = document.querySelectorAll('video[data-autoplay-preview]');
  previewVideos.forEach((v) => {
    const rate = parseFloat(v.dataset.playbackRate);
    if (rate) v.playbackRate = rate;
  });
  if (previewVideos.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    previewVideos.forEach((v) => observer.observe(v));
  }

  // ---------- compact slideshows ----------
  // A .story-slideshow holds a few .slide elements (each one photo or
  // video). Auto-build prev/next + dot nav and cycle through them.
  document.querySelectorAll('.story-slideshow').forEach((show) => {
    const slides = Array.from(show.querySelectorAll('.slide'));
    if (slides.length < 2) return;

    let current = slides.findIndex((s) => s.classList.contains('active'));
    if (current < 0) current = 0;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));

    const dots = document.createElement('div');
    dots.className = 'slideshow-dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dots.appendChild(dot);
    });

    const prevBtn = document.createElement('button');
    prevBtn.className = 'slideshow-nav prev';
    prevBtn.setAttribute('aria-label', 'Previous slide');
    prevBtn.innerHTML = '&lsaquo;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'slideshow-nav next';
    nextBtn.setAttribute('aria-label', 'Next slide');
    nextBtn.innerHTML = '&rsaquo;';

    show.append(prevBtn, nextBtn, dots);

    function go(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
      dots.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); go(current - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); go(current + 1); });
    dots.querySelectorAll('.dot').forEach((d, i) => d.addEventListener('click', (e) => { e.stopPropagation(); go(i); }));
  });

  // ---------- lightbox ----------
  // Any element with [data-lightbox] opens an enlarged view + caption.
  // Items are grouped in document order so prev/next cycles through
  // everything on the page.
  const items = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!items.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <button class="lightbox-prev" aria-label="Previous">&lsaquo;</button>
    <div class="lightbox-stage"></div>
    <p class="lightbox-caption"></p>
    <button class="lightbox-next" aria-label="Next">&rsaquo;</button>
  `;
  document.body.appendChild(overlay);

  const stage = overlay.querySelector('.lightbox-stage');
  const caption = overlay.querySelector('.lightbox-caption');
  const btnClose = overlay.querySelector('.lightbox-close');
  const btnPrev = overlay.querySelector('.lightbox-prev');
  const btnNext = overlay.querySelector('.lightbox-next');

  let index = 0;

  function render() {
    const el = items[index];
    const src = el.getAttribute('data-lightbox');
    const cap = el.getAttribute('data-caption') || '';
    stage.innerHTML = '';
    if (el.tagName === 'VIDEO' || src.match(/\.(mp4|mov|webm)$/i)) {
      const v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      const rate = parseFloat(el.getAttribute('data-playback-rate'));
      if (rate) v.playbackRate = rate;
      stage.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = cap;
      stage.appendChild(img);
    }
    caption.textContent = cap;
    btnPrev.style.display = items.length > 1 ? '' : 'none';
    btnNext.style.display = items.length > 1 ? '' : 'none';
  }

  function open(i) {
    index = i;
    render();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    stage.innerHTML = '';
  }

  function step(dir) {
    index = (index + dir + items.length) % items.length;
    render();
  }

  items.forEach((el, i) => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      open(i);
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => step(-1));
  btnNext.addEventListener('click', () => step(1));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
});

// ---------- visitor alert ----------
// Sends Ben a phone push notification (via a private ntfy.sh topic) when
// someone who isn't Ben has been on the site for a few seconds. No backend
// involved: ntfy.sh accepts a plain POST straight from browser JS. No
// geolocation or IP lookup — just a "someone's here" ping and which page.
// Runs at most once per browser tab session.
//
// To mark this browser as "Ben" (so it never notifies you about your own
// visits), open the site once with ?owner=1 in the URL — the flag is
// saved in localStorage and persists after that.
(function () {
  const NTFY_TOPIC = 'bh-portfolio-ffc164da9d23';
  const DWELL_MS = 8000;

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('owner') === '1') localStorage.setItem('bhIsOwner', '1');
    if (localStorage.getItem('bhIsOwner') === '1') return;
    if (sessionStorage.getItem('bhNotified') === '1') return;
  } catch (e) {
    return; // storage blocked (private browsing, etc.) — skip rather than risk a broken/duplicate alert
  }

  setTimeout(() => {
    try {
      if (sessionStorage.getItem('bhNotified') === '1') return;
      sessionStorage.setItem('bhNotified', '1');
    } catch (e) {
      return;
    }

    fetch('https://ntfy.sh/' + NTFY_TOPIC, {
      method: 'POST',
      body: `Someone's on your site — ${window.location.pathname}`,
    }).catch(() => {});
  }, DWELL_MS);
})();
