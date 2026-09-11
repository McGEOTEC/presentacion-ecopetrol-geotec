// GEOTEC × Ecopetrol — Presentación interactiva
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navbar = document.querySelector('.navbar');
  const navOffset = () => (navbar ? navbar.offsetHeight : 64) + 12;

  /* ---------- Utilidad: envolver texto en palabras enmascaradas ---------- */
  const wrapWords = node => {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (part.trim() === '') { frag.appendChild(document.createTextNode(part)); return; }
          const mask = document.createElement('span');
          mask.className = 'word-mask';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = part;
          mask.appendChild(inner);
          frag.appendChild(mask);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrapWords(child);
      }
    });
  };
  const staggerWords = (el, stepMs) => {
    el.querySelectorAll('.word-inner').forEach((inner, i) => {
      inner.style.setProperty('--w-stagger', `${i * stepMs}ms`);
    });
  };

  /* ---------- Reveal por palabras del h1 del hero ---------- */
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && !reduceMotion) {
    heroTitle.classList.add('kinetic-title');
    wrapWords(heroTitle);
    staggerWords(heroTitle, 35);
  }

  /* ---------- Reveal por palabras de los títulos de sección ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('.section-head h2').forEach(h2 => {
      h2.classList.add('kinetic-title');
      wrapWords(h2);
      staggerWords(h2, 25);
    });
  }

  /* ---------- Cursor personalizado ---------- */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  if (cursorDot && cursorRing && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.body.classList.add('custom-cursor-active');
    window.addEventListener('mousemove', e => {
      const pos = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      cursorDot.style.transform = pos;
      cursorRing.style.transform = pos;
    });
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
    const hoverTargets = 'a, button, [role="button"], input, select, textarea, .lightbox-trigger, .tilt-card';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverTargets)) cursorRing.classList.add('is-active');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverTargets)) cursorRing.classList.remove('is-active');
    });
  }

  /* ---------- Intro Motion (Preloader) ---------- */
  window.addEventListener('load', () => {
    const introDelay = reduceMotion ? 0 : 1800;
    const revealDelay = reduceMotion ? 0 : 400;
    setTimeout(() => {
      document.body.classList.add('is-loaded');
      setTimeout(() => {
        document.querySelectorAll('.hero .reveal').forEach((el, i) => {
          el.style.setProperty('--stagger', reduceMotion ? '0ms' : `${i * 90}ms`);
          el.classList.add('is-visible');
        });
      }, revealDelay);
    }, introDelay);
  });

  /* ---------- Glow ambiental del hero ---------- */
  const hero = document.querySelector('.hero');
  if (hero && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', e => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--gx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      hero.style.setProperty('--gy', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    });
  }

  /* ---------- Barra de progreso de lectura ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Sombra del navbar al hacer scroll ---------- */
  const navShadow = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', navShadow, { passive: true });
  navShadow();

  /* ---------- Detección inteligente de encuadre y ajuste dinámico del Navbar ---------- */
  const navLinksList = document.getElementById('nav-links');
  const brandLockup = document.querySelector('.navbar .brand-lockup');
  const clientLogo = document.querySelector('.navbar .client-logo');

  const fitNavbarToFrame = () => {
    if (!navbar || !navLinksList) return;

    const winW = window.innerWidth;
    if (winW <= 1024) {
      navLinksList.style.removeProperty('--dynamic-gap');
      navLinksList.style.removeProperty('--dynamic-font-size');
      navLinksList.style.removeProperty('--dynamic-letter-spacing');
      return;
    }

    // Medir ancho real disponible entre los logotipos
    const navW = navbar.clientWidth;
    const brandW = brandLockup ? brandLockup.offsetWidth : 160;
    const clientW = clientLogo ? clientLogo.offsetWidth : 140;
    const navStyles = window.getComputedStyle(navbar);
    const padL = parseFloat(navStyles.paddingLeft) || 20;
    const padR = parseFloat(navStyles.paddingRight) || 20;
    const colGap = parseFloat(navStyles.columnGap) || 20;

    // Espacio libre total para la botonera (con margen de seguridad de 24px)
    const availableWidth = Math.max(300, navW - brandW - clientW - padL - padR - (colGap * 2) - 24);

    // Tabla de calibración responsiva según el ancho libre exacto:
    const scales = [
      { minW: 1360, gap: 2.4,  size: 1.00, ls: 0.07 },
      { minW: 1220, gap: 1.9,  size: 0.94, ls: 0.06 },
      { minW: 1080, gap: 1.45, size: 0.88, ls: 0.05 },
      { minW: 950,  gap: 1.10, size: 0.82, ls: 0.04 },
      { minW: 840,  gap: 0.80, size: 0.76, ls: 0.03 },
      { minW: 720,  gap: 0.55, size: 0.70, ls: 0.02 },
      { minW: 0,    gap: 0.40, size: 0.66, ls: 0.01 }
    ];

    let match = scales[scales.length - 1];
    for (const s of scales) {
      if (availableWidth >= s.minW) {
        match = { ...s };
        break;
      }
    }

    // Aplicar valores iniciales óptimos
    navLinksList.style.setProperty('--dynamic-gap', `${match.gap}rem`);
    navLinksList.style.setProperty('--dynamic-font-size', `${match.size}rem`);
    navLinksList.style.setProperty('--dynamic-letter-spacing', `${match.ls}em`);

    // Ajuste de precisión por medición directa: si por render de fuentes el contenido excede el espacio,
    // se reduce de forma progresiva hasta garantizar que jamás se recorte ni colisione.
    let iterations = 0;
    while (navLinksList.scrollWidth > availableWidth && iterations < 8) {
      match.gap = Math.max(0.30, match.gap * 0.88);
      match.size = Math.max(0.64, match.size * 0.95);
      match.ls = Math.max(0.005, match.ls * 0.80);
      navLinksList.style.setProperty('--dynamic-gap', `${match.gap.toFixed(2)}rem`);
      navLinksList.style.setProperty('--dynamic-font-size', `${match.size.toFixed(3)}rem`);
      navLinksList.style.setProperty('--dynamic-letter-spacing', `${match.ls.toFixed(3)}em`);
      iterations++;
    }
  };

  fitNavbarToFrame();
  window.addEventListener('resize', fitNavbarToFrame, { passive: true });
  window.addEventListener('orientationchange', fitNavbarToFrame, { passive: true });
  if (window.ResizeObserver && navbar) {
    new ResizeObserver(() => fitNavbarToFrame()).observe(navbar);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitNavbarToFrame);
  }

  /* ---------- Menú móvil ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const closeMenu = () => {
    if (!navbar || !navbar.classList.contains('nav-open')) return;
    navbar.classList.remove('nav-open');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
  };
  if (navToggle && navbar) {
    navToggle.addEventListener('click', () => {
      const open = navbar.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Smooth scroll con offset real del navbar ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      window.scrollTo({
        top: target.offsetTop - navOffset(),
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* ---------- Cascada (stagger) en cuadrículas ---------- */
  const staggerGrids = document.querySelectorAll(
    '.team-grid, .card-grid, .tool-focus-grid, .evidence-grid, .validation-steps, .expertise-flow, .value-strip, .hero-stats, .alliance-badges, .mag-stats, .channel-grid, .why-grid, .scale-grid, .route-grid, .perm-flow, .limits-grid'
  );
  staggerGrids.forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.setProperty('--stagger', `${Math.min(i, 11) * 70}ms`);
      if (!child.classList.contains('reveal')) child.classList.add('reveal-child');
    });
  });
  // Las tool-cards ya tienen .reveal individual: solo se les asigna el retardo
  document.querySelectorAll('.tool-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.setProperty('--stagger', `${(i % 3) * 90}ms`);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          const title = entry.target.querySelector('.kinetic-title');
          if (title) title.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Contadores numéricos ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    if (reduceMotion || isNaN(target)) { el.textContent = target; return; }
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));

  /* ---------- Spotlight en tarjetas ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tool-card, .tool-focus-card, .evidence-card, .team-item, .pillar, .channel-card, .why-card, .scale-card, .route-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Carrusel horizontal ---------- */
  document.querySelectorAll('[data-carrusel]').forEach(carrusel => {
    const pista = carrusel.querySelector('.carrusel-pista');
    if (!pista) return;
    const izq = carrusel.querySelector('.carrusel-flecha--izq');
    const der = carrusel.querySelector('.carrusel-flecha--der');
    const paso = () => pista.firstElementChild
      ? pista.firstElementChild.getBoundingClientRect().width + 1
      : pista.clientWidth * 0.8;

    // Sombras y flechas según lo que quede por recorrer a cada lado.
    const margen = 2;
    const estado = () => {
      const resta = pista.scrollWidth - pista.clientWidth - pista.scrollLeft;
      carrusel.classList.toggle('hay-izq', pista.scrollLeft > margen);
      carrusel.classList.toggle('hay-der', resta > margen);
    };
    pista.addEventListener('scroll', estado, { passive: true });
    window.addEventListener('resize', estado, { passive: true });
    estado();

    izq && izq.addEventListener('click', () => pista.scrollBy({ left: -paso() }));
    der && der.addEventListener('click', () => pista.scrollBy({ left: paso() }));

    // Rueda del ratón: solo se captura mientras el carrusel pueda avanzar en
    // esa dirección; en los extremos el scroll vuelve a la página.
    pista.addEventListener('wheel', e => {
      if (e.ctrlKey) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      const resta = pista.scrollWidth - pista.clientWidth - pista.scrollLeft;
      const puede = delta > 0 ? resta > margen : pista.scrollLeft > margen;
      if (!puede) return;
      e.preventDefault();
      pista.scrollLeft += delta;
    }, { passive: false });

    // Arrastrar con el puntero.
    let arrastre = null;
    pista.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') return;   // el táctil ya desplaza solo
      arrastre = { x: e.clientX, inicio: pista.scrollLeft };
      pista.classList.add('arrastrando');
      pista.setPointerCapture(e.pointerId);
    });
    pista.addEventListener('pointermove', e => {
      if (!arrastre) return;
      pista.scrollLeft = arrastre.inicio - (e.clientX - arrastre.x);
    });
    const soltar = () => { arrastre = null; pista.classList.remove('arrastrando'); };
    pista.addEventListener('pointerup', soltar);
    pista.addEventListener('pointercancel', soltar);

    // Teclado, para quien no usa ratón.
    pista.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); pista.scrollBy({ left: paso() }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); pista.scrollBy({ left: -paso() }); }
    });
  });

  /* ---------- Slider editorial de roles ---------- */
  document.querySelectorAll('[data-rol-slider]').forEach(slider => {
    const pista = slider.querySelector('.rol-pista');
    const puntos = slider.querySelector('.rol-puntos');
    if (!pista) return;
    const laminas = Array.from(pista.querySelectorAll('.rol-lamina'));
    if (!laminas.length) return;
    const margen = 2;

    // Paginación
    const botones = laminas.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rol-punto';
      b.setAttribute('aria-label', `Ir al rol ${i + 1}`);
      b.addEventListener('click', () => laminas[i].scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center'
      }));
      puntos && puntos.appendChild(b);
      return b;
    });

    // Parallax: cada panel se desplaza según lo lejos que esté su lámina
    // del centro del carril. En reposo todo queda en su sitio.
    const pintar = () => {
      const caja = pista.getBoundingClientRect();
      const centro = caja.left + caja.width / 2;
      let activa = 0, mejor = Infinity;
      laminas.forEach((lam, i) => {
        const r = lam.getBoundingClientRect();
        const d = (r.left + r.width / 2 - centro) / caja.width;
        if (Math.abs(d) < mejor) { mejor = Math.abs(d); activa = i; }
        if (!reduceMotion) {
          lam.querySelectorAll('.rol-panel').forEach(p => {
            const f = parseFloat(p.dataset.par || 0);
            p.style.transform = `translateY(${(d * f).toFixed(2)}px)`;
          });
        }
      });
      botones.forEach((b, i) => b.classList.toggle('activo', i === activa));
    };
    // Flechas: aparecen solo mientras quede recorrido en esa dirección.
    const izq = slider.querySelector('.rol-flecha--izq');
    const der = slider.querySelector('.rol-flecha--der');
    const paso = () => laminas[0].getBoundingClientRect().width + 22;
    izq && izq.addEventListener('click', () => pista.scrollBy({ left: -paso() }));
    der && der.addEventListener('click', () => pista.scrollBy({ left: paso() }));
    const bordes = () => {
      const resta = pista.scrollWidth - pista.clientWidth - pista.scrollLeft;
      slider.classList.toggle('hay-izq', pista.scrollLeft > margen);
      slider.classList.toggle('hay-der', resta > margen);
    };

    pista.addEventListener('scroll', () => { pintar(); bordes(); }, { passive: true });
    window.addEventListener('resize', () => { pintar(); bordes(); }, { passive: true });
    pintar(); bordes();

    // Rueda: solo mientras quede recorrido en esa dirección.
    pista.addEventListener('wheel', e => {
      if (e.ctrlKey) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      const resta = pista.scrollWidth - pista.clientWidth - pista.scrollLeft;
      if (delta > 0 ? resta <= margen : pista.scrollLeft <= margen) return;
      e.preventDefault();
      pista.scrollLeft += delta;
    }, { passive: false });

    // Arrastre con el puntero.
    let arrastre = null;
    pista.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') return;
      arrastre = { x: e.clientX, inicio: pista.scrollLeft };
      pista.classList.add('arrastrando');
      pista.setPointerCapture(e.pointerId);
    });
    pista.addEventListener('pointermove', e => {
      if (!arrastre) return;
      pista.scrollLeft = arrastre.inicio - (e.clientX - arrastre.x);
    });
    const soltar = () => { arrastre = null; pista.classList.remove('arrastrando'); };
    pista.addEventListener('pointerup', soltar);
    pista.addEventListener('pointercancel', soltar);

    // Teclado.
    pista.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); pista.scrollBy({ left: paso() }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); pista.scrollBy({ left: -paso() }); }
    });
  });

  /* ---------- Botón volver arriba ---------- */
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Volver arriba');
  toTop.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  const toggleTop = () => toTop.classList.toggle('show', window.scrollY > 700);
  window.addEventListener('scroll', toggleTop, { passive: true });
  toggleTop();

  /* ---------- Terminal Interactiva (Live Typing) ---------- */
  const termBody = document.getElementById('term-body');
  let isTyping = false;
  let typingTimeout;

  const simulations = {
    qaqc: [
      { text: "> Iniciando entorno de validación VALIDA_APP...", class: "p" },
      { text: "> Conectando con Geodatabase [Proyecto_Ejemplo_v2.gdb]...", delay: 800 },
      { text: "> Ejecutando Módulo 1: Esquema de Capas MAG ANLA (Res. 2182)...", delay: 500 },
      { text: "[OK] 242 Feature Classes verificadas.", class: "ok", delay: 1200 },
      { text: "> Ejecutando Módulo 3: Dominios y Atributos...", delay: 300 },
      { text: "[WARN] 2 valores nulos técnicos detectados en capa [Zonificacion_Manejo].", class: "warn", delay: 1800 },
      { text: "> Ejecutando Módulo 7: Relaciones Padre-Hijo...", delay: 400 },
      { text: "[OK] Consistencia topológica al 100%. Cero huérfanos.", class: "ok", delay: 1500 },
      { text: "> Generando reporte de conformidad (Excel)...", delay: 600 },
      { text: "[OK] Proceso completado en 14.3 segundos.", class: "ok", delay: 1000 }
    ],
    kmz: [
      { text: "> Lanzando Extractor KMZ / CAMPO_KMZ...", class: "p" },
      { text: "> Analizando directorio de fotografías [Campaña_Flora_04]...", delay: 600 },
      { text: "> Leyendo metadatos EXIF (Lat/Lon, Fecha, Hora)...", delay: 800 },
      { text: "[OK] 345 imágenes procesadas.", class: "ok", delay: 1100 },
      { text: "> Estructurando subcarpetas por ID de punto de muestreo...", delay: 500 },
      { text: "[OK] Vínculos relativos creados en tabla de atributos.", class: "ok", delay: 900 },
      { text: "> Exportando visor HTML autocontenido...", delay: 400 },
      { text: "[OK] Geovisor y KMZ generados exitosamente.", class: "ok", delay: 1200 }
    ]
  };

  function typeLine(lineData, callback) {
    const span = document.createElement('span');
    span.className = 't-line ' + (lineData.class ? lineData.class : '');
    let htmlContent = lineData.text;
    if (htmlContent.startsWith("> ")) {
        htmlContent = `<span class="p">> </span>${htmlContent.substring(2)}`;
    }
    span.innerHTML = htmlContent + '\n';
    const cursor = termBody.querySelector('.cursor');
    termBody.insertBefore(span, cursor);
    termBody.parentElement.scrollTop = termBody.parentElement.scrollHeight;
    if (callback) typingTimeout = setTimeout(callback, lineData.delay || 300);
  }

  window.runTerminalSim = function(type) {
    if (!termBody || isTyping) return;
    const lines = simulations[type];
    if (!lines) return;
    isTyping = true;
    termBody.innerHTML = '<span class="cursor"></span>';
    let currentLine = 0;
    function processNextLine() {
      if (currentLine < lines.length) {
        typeLine(lines[currentLine], processNextLine);
        currentLine++;
      } else {
        isTyping = false;
        const span = document.createElement('span');
        span.className = 't-line';
        span.innerHTML = '<span class="p">> </span>\n';
        termBody.insertBefore(span, termBody.querySelector('.cursor'));
        termBody.parentElement.scrollTop = termBody.parentElement.scrollHeight;
      }
    }
    processNextLine();
  };

  window.clearTerminal = function() {
      if(isTyping) { clearTimeout(typingTimeout); isTyping = false; }
      termBody.innerHTML = '<span class="p">> </span>Sistema en espera. Seleccione un flujo para simular...<span class="cursor"></span>';
  }

  /* ---------- Nav activo según sección visible ---------- */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-80px 0px -35% 0px' });
  sections.forEach(sec => navObserver.observe(sec));

  /* ---------- Efecto Tilt 3D Inmersivo ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    const tiltCards = document.querySelectorAll('.geo-stat-card, .evidence-card, .route-card, .tool-card');
    tiltCards.forEach(card => {
      card.classList.add('tilt-card');
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        const centerX = rect.width / 2; const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  }

  /* ---------- Hilo narrativo del Diagnóstico ---------- */
  const storyThread = document.querySelector('.story-thread');
  if (storyThread) {
    const threadProgress = storyThread.querySelector('.thread-progress');
    const chapters = storyThread.querySelectorAll('.story-chapter');
    const lightUpChapter = chapter => {
      chapter.classList.add('is-visible');
      const marker = chapter.querySelector('.chapter-marker');
      if (threadProgress && marker) {
        const threadTop = storyThread.getBoundingClientRect().top;
        const markerRect = marker.getBoundingClientRect();
        const lineStart = markerRect.height / 2;
        const markerCenter = markerRect.top - threadTop + lineStart;
        threadProgress.style.height = `${Math.max(0, markerCenter - lineStart)}px`;
      }
    };
    if (reduceMotion) {
      chapters.forEach(lightUpChapter);
    } else {
      const chapterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            lightUpChapter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35, rootMargin: '0px 0px -15% 0px' });
      chapters.forEach(ch => chapterObserver.observe(ch));
    }
  }

  /* ---------- Globo de texto de la respuesta, desde Dato Crítico ---------- */
  const respuestaBubble = document.getElementById('respuesta-bubble');
  const respuestaToggleBtn = document.getElementById('respuesta-toggle');
  window.toggleRespuesta = function () {
    if (!respuestaBubble || !respuestaToggleBtn) return;
    const open = respuestaBubble.classList.toggle('is-open');
    respuestaToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  if (respuestaBubble && respuestaToggleBtn) {
    const closeRespuesta = () => {
      respuestaBubble.classList.remove('is-open');
      respuestaToggleBtn.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', e => {
      if (!respuestaBubble.classList.contains('is-open')) return;
      if (!respuestaBubble.contains(e.target) && !respuestaToggleBtn.contains(e.target)) closeRespuesta();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && respuestaBubble.classList.contains('is-open')) closeRespuesta();
    });
  }

  /* ---------- Lightbox de diagramas ---------- */
  const lightbox = document.getElementById('diagram-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  window.openLightbox = function (imgEl) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgEl.currentSrc || imgEl.src;
    lightboxImg.alt = imgEl.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  window.closeLightbox = function () {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };
  if (lightbox) {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
  }

  /* ---------- Modal de detalle de aplicativos ---------- */
  const appModal = document.getElementById('app-modal');
  const appModalContents = appModal ? appModal.querySelectorAll('.app-modal-content') : [];
  window.openAppModal = function (id) {
    if (!appModal) return;
    appModalContents.forEach(c => c.classList.toggle('is-active', c.id === id));
    appModal.classList.add('active');
    appModal.querySelector('.app-modal-panel').scrollTop = 0;
    document.body.style.overflow = 'hidden';
  };
  window.closeAppModal = function () {
    if (!appModal) return;
    appModal.classList.remove('active');
    document.body.style.overflow = '';
  };
  if (appModal) {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && appModal.classList.contains('active')) closeAppModal();
    });
  }
});

/* ---------- Carrusel de clientes (marquee) ---------- */
(function () {
  const clients = [
    { src: 'assets/clientes/ecopetrol.png', alt: 'Ecopetrol' },
    { src: 'assets/clientes/frontera_energy.png', alt: 'Frontera Energy' },
    { src: 'assets/clientes/exxonmobil.png', alt: 'ExxonMobil' },
    { src: 'assets/clientes/bp.png', alt: 'BP', large: true },
    { src: 'assets/clientes/bhp_billiton.png', alt: 'BHP Billiton' },
    { src: 'assets/clientes/petrobras.png', alt: 'Petrobras', large: true },
    { src: 'assets/clientes/gran_tierra.png', alt: 'Gran Tierra', large: true },
    { src: 'assets/clientes/equion.png', alt: 'Equion' },
    { src: 'assets/clientes/anh.png', alt: 'ANH' },
    { src: 'assets/clientes/cenit.png', alt: 'Cenit' },
    { src: 'assets/clientes/mintransporte.png', alt: 'Mintransporte' },
    { src: 'assets/clientes/tw_solar.png', alt: 'TW Solar' },
    { src: 'assets/clientes/acorn.png', alt: 'Acorn International', large: true },
    { src: 'assets/clientes/fonade.png', alt: 'Fonade' },
    { src: 'assets/clientes/kof.png', alt: 'KOF' },
    { src: 'assets/clientes/ocensa.webp', alt: 'Ocensa' },
    { src: 'assets/clientes/petrosantander.webp', alt: 'PetroSantander' },
    { src: 'assets/clientes/uaesp.png', alt: 'UAESP' },
    { src: 'assets/clientes/secop.png', alt: 'SECOP' }
  ];
  function makeChip(c) {
    const chip = document.createElement('div');
    chip.className = 'client-chip' + (c.large ? ' chip-lg' : '');
    const img = document.createElement('img');
    img.src = c.src;
    img.alt = c.alt;
    img.loading = 'lazy';
    chip.appendChild(img);
    return chip;
  }
  const mq1 = document.getElementById('mq1');
  const mq2 = document.getElementById('mq2');
  if (!mq1 || !mq2) return;
  const rowA = clients.slice(0, 10);
  const rowB = clients.slice(10);
  [...rowA, ...rowA].forEach(c => mq1.appendChild(makeChip(c)));
  [...rowB, ...rowB, ...rowB].forEach(c => mq2.appendChild(makeChip(c)));
}());

/* ---------- Motor ZUI (Zooming User Interface) ---------- */
const zui = (function() {
  const canvas = document.getElementById('zui-canvas');
  const counter = document.getElementById('zui-counter');
  
  // 6 paradas narrativas con coordenadas calculadas para enfocar cada nodo
  const steps = [
    { id: 'intro',    x: 0,       y: 900,   scale: 0.8,  label: '1. El Reto' }, 
    { id: 'insumos',  x: 1000,    y: 0,     scale: 1.1,  label: '2. Insumos' },   
    { id: 'motor',    x: 0,       y: 0,     scale: 1,  label: '3. Núcleo' },   
    { id: 'motor',    x: 0,       y: -430,     scale: 1,  label: '3. Núcleo' },   
    { id: 'anexos',   x: -1500,   y: 120,     scale: 0.95, label: '4. Entregables' }, 
    { id: 'anexos',   x: -1500,   y: -150,     scale: 0.95, label: '4. Entregables' }, 
    { id: 'timeline', x: 0,       y: -1000, scale: 0.9,  label: '5. El Flujo' },
  ];
  
  let currentStep = 0;

  function goTo(stepIndex) {
    if (!canvas) return;
    if (stepIndex < 0) stepIndex = steps.length - 1;
    if (stepIndex >= steps.length) stepIndex = 0;
    currentStep = stepIndex;
    
    const step = steps[currentStep];
    canvas.style.transform = `scale(${step.scale}) translate(${step.x}px, ${step.y}px)`;
    if(counter) counter.textContent = step.label;
  }

  if(canvas) { setTimeout(() => goTo(0), 500); }

  return {
    next: () => goTo(currentStep + 1),
    prev: () => goTo(currentStep - 1)
  };
})();