// ============================================
// CONVENIÊNCIA PRAEIRA — script.js
// Vanilla JS · Sem dependências externas
// ============================================

// === SEÇÃO: UTILITÁRIOS ===

/**
 * Seleciona um único elemento DOM
 * @param {string} sel - Seletor CSS
 * @param {Element} [ctx=document] - Contexto
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Seleciona múltiplos elementos DOM
 * @param {string} sel - Seletor CSS
 * @param {Element} [ctx=document] - Contexto
 */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// === SEÇÃO: HEADER STICKY ===

/**
 * Adiciona classe .is-scrolled ao header quando o usuário rola a página.
 * Utiliza IntersectionObserver para performance máxima.
 */
(function initStickyHeader() {
  const header  = $('#header');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:1px;left:0;width:1px;height:1px;pointer-events:none;';
  document.body.prepend(sentinel);

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    },
    { threshold: 0 }
  );

  observer.observe(sentinel);
})();

// === SEÇÃO: MENU HAMBURGUER ===

/**
 * Controla abertura/fechamento do menu mobile.
 * Gerencia aria-expanded, aria-hidden e foco.
 */
(function initMobileMenu() {
  const btn     = $('#hamburger');
  const mobileNav = $('#nav-mobile');
  const links   = $$('.header__mobile-link, .header__mobile-list .btn');

  if (!btn || !mobileNav) return;

  function openMenu() {
    btn.classList.add('is-open');
    mobileNav.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    btn.classList.remove('is-open');
    mobileNav.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = btn.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  }

  btn.addEventListener('click', toggleMenu);

  links.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && btn.classList.contains('is-open')) {
      closeMenu();
      btn.focus();
    }
  });

  document.addEventListener('click', e => {
    if (
      btn.classList.contains('is-open') &&
      !mobileNav.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();

// === SEÇÃO: SCROLL SUAVE ===

/**
 * Scroll suave para âncoras internas.
 * Respeita a altura do header fixo.
 */
(function initSmoothScroll() {
  const header = $('#header');

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const headerH = header ? header.offsetHeight : 0;
    const top     = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

// === SEÇÃO: FAQ ACCORDION ===

/**
 * Accordion para a seção de perguntas frequentes.
 */
(function initFaqAccordion() {
  const items = $$('.faq-item');

  items.forEach(item => {
    const btn    = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');

    if (!btn || !answer) return;

    answer.style.maxHeight = '0';
    answer.style.overflow  = 'hidden';
    answer.style.transition = 'max-height 0.35s ease, padding 0.35s ease';
    answer.removeAttribute('hidden');

    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('is-open');

      items.forEach(other => {
        const otherBtn    = other.querySelector('.faq-item__question');
        const otherAnswer = other.querySelector('.faq-item__answer');

        if (otherBtn && otherAnswer && otherBtn !== btn) {
          otherBtn.classList.remove('is-open');
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.style.maxHeight = '0';
          otherAnswer.style.paddingBottom = '0';
        }
      });

      if (isOpen) {
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
        answer.style.paddingBottom = '0';
      } else {
        btn.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
        answer.style.paddingBottom = '20px';
      }
    });
  });
})();

// === SEÇÃO: MAPA LEAFLET ===

/**
 * Inicializa o mapa Leaflet com tentativas de carregamento (Polling).
 */
(function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  let attempts = 0;

  function buildMap() {
    // 1. Espera a biblioteca Leaflet baixar (Polling)
    if (typeof L === 'undefined') {
      attempts++;
      if (attempts < 50) { // Tenta por 5 segundos
        setTimeout(buildMap, 100);
      } else {
        mapEl.innerHTML = '<p style="padding: 20px; text-align: center; color: #E8724A; font-weight: 500;">Não foi possível carregar o mapa. Recarregue a página ou verifique sua conexão.</p>';
      }
      return;
    }

    // 2. Previne erro do Live Server ao salvar o arquivo múltiplas vezes
    const container = L.DomUtil.get('map');
    if (container != null && container._leaflet_id !== null) {
      container._leaflet_id = null;
    }

    // 3. Coordenadas da Conveniência Praeira
    const lat = -5.1186;
    const lng = -35.6352;

    const map = L.map('map', {
      center: [lat, lng],
      zoom: 16,
      scrollWheelZoom: false
    });

    // 4. Imagens do mapa (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // 5. Ícone personalizado estilo gota coral
    const customIcon = L.divIcon({
      className: '',
      html: `
        <div style="
          background: #E8724A;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #fff;
          box-shadow: 0 4px 12px rgba(232,114,74,.5);
        "></div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // 6. Marcador e Popup
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; text-align: center; padding: 4px;">
          <strong style="display: block; font-size: 14px; color: #1A3A4A; margin-bottom: 4px;">Conveniência Praeira</strong>
          <span style="font-size: 12px; color: #6B7280; display: block; margin-bottom: 12px;">São Miguel do Gostoso - RN</span>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener" style="display: inline-block; background: #E8724A; color: #fff; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 600; text-decoration: none;">Abrir Rota</a>
        </div>
      `)
      .openPopup();

    // 7. Força o mapa a recalcular seu tamanho para evitar a tela cinza
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }

  // Aciona a função assim que o HTML estiver lido
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildMap);
  } else {
    buildMap();
  }
})();

// === SEÇÃO: ANIMAÇÕES AO SCROLL ===

/**
 * Adiciona classe .visible aos elementos com data-animate
 */
(function initScrollAnimations() {
  const elements = $$('.product-card, .feature-card, .testimonial-card, .faq-item');

  if (!elements.length) return;

  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

// === SEÇÃO: ACTIVE NAV LINK ===

/**
 * Destaca o link ativo no menu conforme a seção visível.
 */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.header__nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--color-gold)'
              : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => observer.observe(s));
})();