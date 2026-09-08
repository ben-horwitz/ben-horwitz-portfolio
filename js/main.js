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

  // Simple click-to-play for larger, non-preview media (poster stays
  // visible until the viewer chooses to load and play the clip).
  document.querySelectorAll('video[data-click-to-play]').forEach((video) => {
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  });
});
