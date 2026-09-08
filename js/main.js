// Ben Horwitz portfolio — shared behavior

document.addEventListener('DOMContentLoaded', () => {
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

  // Play muted preview videos only while their card is on screen,
  // so we're not decoding a dozen videos at once on page load.
  const previewVideos = document.querySelectorAll('video[data-autoplay-preview]');
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
