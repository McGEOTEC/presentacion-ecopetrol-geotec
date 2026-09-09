(function () {
  const mapEl = document.getElementById('ecopetrol-map');
  if (!mapEl) return;

  const loading = mapEl.querySelector('.map-loading');
  const assets = {
    colombia: 'assets/geo/colombia_slim.geojson',
    departamentos: 'assets/geo/departamentos_slim.geojson',
    ecopetrol: 'assets/geo/ecopetrol_proyectos.geojson'
  };

  function setMapMessage(message) {
    if (loading) loading.textContent = message;
  }

  function getProjectStyle() {
    return {
      fillColor: '#FDD000',
      fillOpacity: 0.85,
      color: '#FFFFFF',
      weight: 1.5,
      opacity: 0.95,
      smoothFactor: 0
    };
  }

  function getDepartmentStyle() {
    return {
      color: 'rgba(253, 208, 0, 0.28)',
      weight: 1.2,
      opacity: 0.65,
      fill: true,
      fillColor: '#97A419',
      fillOpacity: 0.05,
      dashArray: '4 4',
      smoothFactor: 1.2
    };
  }

  function getCountryStyle() {
    return {
      color: 'rgba(253, 208, 0, 0.55)',
      weight: 1.8,
      opacity: 0.85,
      fill: false,
      dashArray: '6 4',
      smoothFactor: 0
    };
  }

  async function loadJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
    return response.json();
  }

  async function init() {
    if (!window.L) {
      setMapMessage('No se pudo cargar Leaflet. Verifica la conexión para ver el geovisor.');
      return;
    }

    const embedded = window.GEOTEC_ECOPETROL_GEO;
    const [colombia, departamentos, ecopetrol] = embedded
      ? [embedded.colombia, embedded.departamentos, embedded.ecopetrol]
      : await Promise.all([
        loadJson(assets.colombia),
        loadJson(assets.departamentos),
        loadJson(assets.ecopetrol)
      ]);

    const map = L.map(mapEl, {
      center: [4.7, -73.2],
      zoom: 6.25,
      minZoom: 5,
      maxZoom: 19,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // ================= CAPAS BASE (Sin API key requerida) =================
    // 1. Capa Oscura Esri Canvas (Base + Etiquetas con municipios y vías)
    const darkBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Esri, HERE, Garmin, © OpenStreetMap'
    });
    const darkLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      opacity: 0.92
    });
    const darkGroup = L.layerGroup([darkBase, darkLabels]).addTo(map);

    // 2. Capa OpenStreetMap (Calles, municipios y topografía en detalle)
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });

    // 3. Capa Satelital Esri con etiquetas
    const satBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    });
    const satLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      opacity: 0.95
    });
    const satGroup = L.layerGroup([satBase, satLabels]);

    // Selector de capas
    const baseLayers = {
      '<span style="font-size:0.85rem;font-weight:600;">🌑 Vista Oscura</span>': darkGroup,
      '<span style="font-size:0.85rem;font-weight:600;">🗺️ Calles y Municipios</span>': osmLayer,
      '<span style="font-size:0.85rem;font-weight:600;">🛰️ Satelital</span>': satGroup
    };
    L.control.layers(baseLayers, null, { position: 'topright', collapsed: false }).addTo(map);

    // Límites de Colombia
    L.geoJSON(colombia, {
      style: getCountryStyle,
      interactive: false
    }).addTo(map);

    // Límites de Departamentos
    if (departamentos) {
      L.geoJSON(departamentos, {
        style: getDepartmentStyle,
        interactive: false
      }).addTo(map);
    }

    // Capa de Proyectos Ecopetrol con municipios e información detallada
    const projectLayer = L.geoJSON(ecopetrol, {
      style: getProjectStyle,
      onEachFeature(feature, layer) {
        const p = feature.properties || {};
        const municipio = p.MUNICIPIO || 'No registrado';
        const departamento = p.DEPARTAMEN || 'No registrado';
        const proyecto = p.NOMBRE_PRO || 'Proyecto Ecopetrol S.A.';
        const sector = p.SECTOR || 'Hidrocarburos';
        const cliente = p.CLIENTE || 'ECOPETROL S.A.';

        // Tooltip interactivo permanente al pasar el mouse
        layer.bindTooltip(
          `<div class="geo-tip-mun">📍 <strong>${municipio}</strong></div>` +
          `<div class="geo-tip-pro">${proyecto}</div>` +
          `<div class="geo-tip-dep">${departamento}</div>`,
          { sticky: true, className: 'geo-custom-tooltip' }
        );

        // Popup completo con información del proyecto
        layer.bindPopup(
          `<div class="geo-popup-container">` +
            `<div class="geo-popup-badge">${departamento}</div>` +
            `<div class="geo-popup-title">${proyecto}</div>` +
            `<div class="geo-popup-row"><b>📍 Municipio:</b> <span>${municipio}</span></div>` +
            `<div class="geo-popup-row"><b>🏛️ Departamento:</b> <span>${departamento}</span></div>` +
            `<div class="geo-popup-row"><b>⚡ Sector:</b> <span>${sector}</span></div>` +
            `<div class="geo-popup-row"><b>🤝 Cliente:</b> <span>${cliente}</span></div>` +
          `</div>`
        );

        layer.on('mouseover', () => layer.setStyle({
          fillColor: '#FFFFFF',
          fillOpacity: 0.95,
          color: '#FDD000',
          weight: 2.2
        }));
        layer.on('mouseout', () => projectLayer.resetStyle(layer));
        layer.on('click', () => {
          const layerBounds = layer.getBounds && layer.getBounds();
          if (layerBounds && layerBounds.isValid()) {
            map.fitBounds(layerBounds.pad(0.25), { maxZoom: 16 });
          }
        });
      }
    }).addTo(map);

    const bounds = projectLayer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.08), { animate: false, maxZoom: 8 });

    if (loading) loading.remove();
    const refreshMapSize = () => map.invalidateSize();
    [80, 300, 900, 1800, 3000].forEach((delay) => setTimeout(refreshMapSize, delay));
    if (window.ResizeObserver) {
      new ResizeObserver(refreshMapSize).observe(mapEl);
    } else {
      window.addEventListener('resize', refreshMapSize);
    }
  }

  init().catch((error) => {
    console.error(error);
    setMapMessage('No se pudo cargar el geovisor Ecopetrol.');
  });
}());
