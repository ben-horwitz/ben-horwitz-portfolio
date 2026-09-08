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
