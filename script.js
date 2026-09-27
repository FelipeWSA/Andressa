const GITHUB_PHOTOS_API = 'https://api.github.com/repos/FelipeWSA/Andressa/contents/photos?ref=main';
const PHOTO_EXTENSIONS = /\.(avif|gif|jpe?g|png|webp)$/i;
const FALLBACK_PHOTOS = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg', 'image6.jpg', 'image7.jpg'];
const stage = document.getElementById('photo-stage');
const photoLayers = [document.getElementById('featured-photo'), document.getElementById('second-photo')];
const thumbnails = document.getElementById('thumbnails');
const loading = document.getElementById('gallery-loading');
const count = document.getElementById('photo-count');
const caption = document.getElementById('gallery-caption');
const previousButton = document.getElementById('previous-photo');
const nextButton = document.getElementById('next-photo');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let photos = [];
let currentIndex = 0;
let slideTimer;
let slideRequest = 0;
let activeLayer = -1;

function localPhoto(name) {
  return `photos/${encodeURIComponent(name)}`;
}

async function getPhotos() {
  // GitHub Pages não permite listar uma pasta diretamente. A API pública do
  // próprio repositório retorna os arquivos atuais sempre que a página abre.
  if (!['localhost', '127.0.0.1', ''].includes(location.hostname)) {
    try {
      const response = await fetch(GITHUB_PHOTOS_API, {
        headers: { Accept: 'application/vnd.github+json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
      const files = await response.json();
      if (!Array.isArray(files)) throw new Error('Resposta inesperada da galeria');
      return files
        .filter(file => file.type === 'file' && PHOTO_EXTENSIONS.test(file.name))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }))
        .map(file => ({ name: file.name, url: localPhoto(file.name) }));
    } catch (error) {
      console.warn('Não foi possível atualizar a lista de fotos; usando as fotos iniciais.', error);
    }
  }

  // Mantém a galeria utilizável offline e durante uma prévia local simples.
  return FALLBACK_PHOTOS.map(name => ({ name, url: localPhoto(name) }));
}

function photoDescription(name, index) {
  const cleanName = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return /^image\d+$/i.test(cleanName) ? `Momento ${index + 1}` : cleanName;
}

function resetAutoplay() {
  clearInterval(slideTimer);
  if (photos.length < 2 || reducedMotion.matches || document.hidden) return;
  slideTimer = setInterval(() => showPhoto((currentIndex + 1) % photos.length), 6000);
}

function showPhoto(index) {
  if (!photos.length) return;
  currentIndex = (index + photos.length) % photos.length;
  const request = ++slideRequest;
  const photo = photos[currentIndex];
  const preload = new Image();
  preload.onload = () => {
    if (request !== slideRequest) return;
    const nextLayer = activeLayer === 0 ? 1 : 0;
    const incoming = photoLayers[nextLayer];
    const outgoing = photoLayers[activeLayer];
    incoming.src = photo.url;
    loading.hidden = true;
    requestAnimationFrame(() => {
      if (request !== slideRequest) return;
      incoming.alt = `Foto de Andressa e Felipe: ${photoDescription(photo.name, currentIndex)}`;
      incoming.removeAttribute('aria-hidden');
      incoming.classList.add('is-visible');
      if (outgoing) {
        outgoing.classList.remove('is-visible');
        outgoing.alt = '';
        outgoing.setAttribute('aria-hidden', 'true');
      }
      activeLayer = nextLayer;
    });
  };
  preload.onerror = () => {
    if (request === slideRequest) {
      loading.hidden = false;
      loading.textContent = 'Não foi possível abrir esta foto.';
    }
  };
  preload.src = photo.url;

  count.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  caption.textContent = photoDescription(photo.name, currentIndex);
  [...thumbnails.children].forEach((button, buttonIndex) => {
    button.setAttribute('aria-current', String(buttonIndex === currentIndex));
  });
  thumbnails.children[currentIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

function movePhoto(direction) {
  showPhoto(currentIndex + direction);
  resetAutoplay();
}

async function initGallery() {
  photos = await getPhotos();
  if (!photos.length) {
    loading.textContent = 'Ainda não há fotos na pasta photos.';
    previousButton.hidden = true;
    nextButton.hidden = true;
    return;
  }

  photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.className = 'thumbnail';
    button.type = 'button';
    button.setAttribute('aria-label', `Mostrar foto ${index + 1}: ${photoDescription(photo.name, index)}`);
    button.setAttribute('aria-current', 'false');
    const image = document.createElement('img');
    image.src = photo.url;
    image.alt = '';
    image.loading = index < 5 ? 'eager' : 'lazy';
    button.append(image);
    button.addEventListener('click', () => { showPhoto(index); resetAutoplay(); });
    thumbnails.append(button);
  });

  previousButton.hidden = photos.length < 2;
  nextButton.hidden = photos.length < 2;
  showPhoto(0);
  resetAutoplay();
}

previousButton.addEventListener('click', () => movePhoto(-1));
nextButton.addEventListener('click', () => movePhoto(1));
stage.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    movePhoto(event.key === 'ArrowRight' ? 1 : -1);
  }
});
let touchStartX;
stage.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
stage.addEventListener('touchend', event => {
  if (touchStartX === undefined) return;
  const distance = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(distance) > 45) movePhoto(distance < 0 ? 1 : -1);
  touchStartX = undefined;
}, { passive: true });
stage.addEventListener('mouseenter', () => clearInterval(slideTimer));
stage.addEventListener('mouseleave', resetAutoplay);
document.addEventListener('visibilitychange', resetAutoplay);
reducedMotion.addEventListener('change', resetAutoplay);

const heartsLayer = document.getElementById('hearts-layer');
let heartsTimer;
function addFallingHeart() {
  if (document.hidden || heartsLayer.childElementCount >= (innerWidth < 600 ? 10 : 18)) return;
  const heart = document.createElement('span');
  heart.className = 'falling-heart';
  heart.textContent = Math.random() < .5 ? '❤️' : '💖';
  heart.style.left = `${Math.random() * 96}%`;
  heart.style.setProperty('--heart-size', `${11 + Math.random() * 13}px`);
  heart.style.setProperty('--heart-opacity', `${.23 + Math.random() * .24}`);
  heart.style.setProperty('--fall-duration', `${7 + Math.random() * 5}s`);
  heart.style.setProperty('--drift', `${-35 + Math.random() * 70}px`);
  heart.addEventListener('animationend', () => heart.remove(), { once: true });
  heartsLayer.append(heart);
}
function updateHearts() {
  clearInterval(heartsTimer);
  if (document.hidden || reducedMotion.matches) {
    heartsLayer.replaceChildren();
    return;
  }
  const maxHearts = innerWidth < 600 ? 10 : 18;
  while (heartsLayer.childElementCount > maxHearts) heartsLayer.firstElementChild.remove();
  heartsTimer = setInterval(addFallingHeart, innerWidth < 600 ? 1100 : 700);
}
document.addEventListener('visibilitychange', updateHearts);
reducedMotion.addEventListener('change', updateHearts);
window.addEventListener('resize', updateHearts);
updateHearts();

const startDate = new Date(2025, 2, 27);
function updateCounter() {
  const now = new Date();
  if (now < startDate) return;
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) { years -= 1; months += 12; }
  const values = { years, months, days, hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() };
  for (const [id, value] of Object.entries(values)) {
    document.getElementById(id).textContent = String(value).padStart(2, '0');
  }
}
updateCounter();
setInterval(updateCounter, 1000);

const musicButton = document.getElementById('music-button');
const music = new Audio('music.mp3');
music.loop = true;
music.volume = 0.55;
musicButton.addEventListener('click', async () => {
  if (!music.paused) {
    music.pause();
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.setAttribute('aria-label', 'Ativar música');
    return;
  }
  try {
    await music.play();
    musicButton.setAttribute('aria-pressed', 'true');
    musicButton.setAttribute('aria-label', 'Pausar música');
  } catch (error) {
    console.warn('Não foi possível reproduzir a música.', error);
    musicButton.setAttribute('aria-label', 'Música indisponível');
  }
});

initGallery();
