/* ======================================================
   CONVENIÊNCIA PRAIEIRA — script.js
   Vanilla JS — sem dependências externas (exceto Leaflet)
   ====================================================== */

(function () {
  'use strict';

  /* ── 1. ANO DO FOOTER ─────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 2. HEADER: SCROLL BEHAVIOR ──────────────────── */
  const header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on init

  /* ── 3. HAMBURGER / MOBILE NAV ───────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    navMobile.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    navMobile.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('open');
      toggleMenu(!isOpen);
    });

    // Fechar ao clicar em links do menu mobile
    navMobile.querySelectorAll('.nav__link, .btn').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (
        navMobile.classList.contains('open') &&
        !navMobile.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        toggleMenu(false);
      }
    });
  }

  /* ── 4. GALERIA CARROSSEL ────────────────────────── */
  const track      = document.getElementById('galeriaTrack');
  const prevBtn    = document.getElementById('galeriaBtn');
  const nextBtn    = document.getElementById('galeriaBtnNext');
  const dotsWrap   = document.getElementById('galeriaDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const slides = track.querySelectorAll('.galeria__slide');
    let current  = 0;
    let autoPlay;

    // Criar dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'galeria__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir para foto ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', String(i === 0));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;

      dotsWrap.querySelectorAll('.galeria__dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', String(i === current));
      });
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    function startAuto() {
      autoPlay = setInterval(() => goTo(current + 1), 4000);
    }
    function resetAuto() {
      clearInterval(autoPlay);
      startAuto();
    }

    // Touch / Swipe
    let touchStartX = 0;
    let touchEndX   = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? current + 1 : current - 1);
        resetAuto();
      }
    });

    // Parar autoplay quando mouse sobre o carrossel
    track.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.addEventListener('mouseleave', startAuto);

    startAuto();
  }

  /* ── 5. MAPA LEAFLET (OpenStreetMap) ─────────────── */
  /**
   * LOCALIZAÇÃO: Av. dos Arrecifes, 1989, São Miguel do Gostoso - RN
   * Coordenadas aproximadas (Google Maps code V9G6+XM São Miguel do Gostoso)
   * Latitude:  -5.1160
   * Longitude: -35.5555
   *
   * Para ajustar com precisão: abra o Google Maps, clique com o botão direito
   * no local exato e copie as coordenadas. Substitua os valores abaixo.
   */
  const LAT = -5.1160;
  const LNG = -35.5555;
  const ZOOM = 16;

  const mapaEl = document.getElementById('mapa');

  if (mapaEl && typeof L !== 'undefined') {
    const map = L.map('mapa', {
      center: [LAT, LNG],
      zoom: ZOOM,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    // Tiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }).addTo(map);

    // Ícone personalizado (laranja, no estilo da marca)
    const customIcon = L.divIcon({
      className: '',
      html: `
        <div style="
          width: 44px;
          height: 44px;
          background: #FF6B2C;
          border: 3px solid #fff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 16px rgba(255,107,44,.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 20px;
            line-height: 1;
          ">🛒</span>
        </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -46],
    });

    // Marcador + popup
    const marker = L.marker([LAT, LNG], { icon: customIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: 'Syne', sans-serif; min-width: 180px;">
        <strong style="font-size: .95rem; color: #0F1923;">🌊 Conveniência Praieira</strong><br/>
        <span style="font-size: .82rem; color: #5A6F82;">Av. dos Arrecifes, 1989<br/>Centro, São Miguel do Gostoso - RN</span><br/><br/>
        <a href="https://wa.me/5584994859933" target="_blank" rel="noopener"
           style="
             display: inline-block;
             background: #25D366;
             color: #fff;
             font-size: .78rem;
             font-weight: 700;
             padding: 6px 14px;
             border-radius: 999px;
             text-decoration: none;
           ">📲 WhatsApp</a>
        &nbsp;
        <a href="https://maps.google.com/?q=${LAT},${LNG}" target="_blank" rel="noopener"
           style="
             display: inline-block;
             background: #0F1923;
             color: #fff;
             font-size: .78rem;
             font-weight: 700;
             padding: 6px 14px;
             border-radius: 999px;
             text-decoration: none;
           ">🗺 Maps</a>
      </div>
    `, { maxWidth: 260 });

    marker.openPopup();

    // Habilitar scroll zoom somente após interação
    mapaEl.addEventListener('click', () => {
      map.scrollWheelZoom.enable();
    });
  }

  /* ── 6. SCROLL REVEAL ────────────────────────────── */
  const revealEls = document.querySelectorAll(
    '.produto-card, .diferencial-card, .info-block, .section__header'
  );

  // Adicionar classe reveal dinamicamente
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    // Adicionar delay escalonado por grupo de 3
    const delayIndex = (i % 3) + 1;
    if (delayIndex > 1) el.classList.add(`reveal-delay-${delayIndex - 1}`);
  });

  // Intersection Observer
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: mostrar tudo se IntersectionObserver não suportado
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── 7. SMOOTH SCROLL p/ ÂNCORAS ────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── 8. HIGHLIGHT DIA ATUAL na tabela de horários ── */
  const hoje = new Date().getDay(); // 0=Dom, 1=Seg, ..., 6=Sab
  const rows = document.querySelectorAll('.horarios tbody tr');
  // Mapeando índice da tabela (0=Seg) para getDay() (0=Dom,1=Seg...)
  const diaMap = [1, 2, 3, 4, 5, 6, 0];
  rows.forEach((row, i) => {
    row.classList.remove('hoje');
    if (diaMap[i] === hoje) {
      row.classList.add('hoje');
    }
  });

})();