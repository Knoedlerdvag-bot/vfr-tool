(() => {
  const KINDS = ["vor", "ndb", "vfr", "rnav"];
  // Anzeigegruppen mit Mindest-Zoomstufe: weit herausgezoomt bleibt die Karte lesbar (wie SkyDemon/ForeFlight: nach Bedeutung gestaffelt)
  const GROUPS = {
    vor: { kind: "vor", minZoom: 6, group: L.layerGroup() },
    ndb: { kind: "ndb", minZoom: 8, group: L.layerGroup() },
    vfr: { kind: "vfr", minZoom: 9, group: L.layerGroup() },
    vfrMinor: { kind: "vfr", minZoom: 10, group: L.layerGroup() },
    rnav: { kind: "rnav", minZoom: 8, group: L.layerGroup() }
  };
  const groupKey = (kind, point) => (kind === "vfr" && point.type !== "VFR-MRP" ? "vfrMinor" : kind);
  const counts = { vor: 0, ndb: 0, vfr: 0, rnav: 0 };
  const VFR_TYPE_LABELS = { "VFR-MRP": "VFR-Pflichtmeldepunkt (MRP)", "VFR-RP": "VFR-Meldepunkt (RP)", "VFR-ENR": "VFR-Streckenpunkt (ENR)" };
  let ofmAirac = "";
  let zoomHint = "";
  window.navigationPoints = [];

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  // Symbole 1:1 nach der OpenFlightMaps-VFR-Luftraumkarte (ICAO-Annex-4-Formen); Farben aus der Karte
  const HEXAGON = "M9 17 13 10H21L25 17 21 24H13Z";
  function symbolSvg(point, kind) {
    if (kind === "ndb") {
      return '<svg viewBox="0 0 34 34" aria-hidden="true"><circle class="nav-outline" cx="17" cy="17" r="12"/><circle class="nav-fill" cx="17" cy="17" r="3.6"/></svg>';
    }
    if (kind === "vfr") {
      if (point.type === "VFR-MRP") {
        // Pflichtmeldepunkt: gefülltes Dreieck im offenen Kreis
        return '<svg viewBox="0 0 34 34" aria-hidden="true"><circle class="nav-outline" cx="17" cy="17" r="13"/><path class="nav-fill" d="M17 8 25 23H9Z"/></svg>';
      }
      // Meldepunkt auf Anforderung (RP/ENR): gefülltes Dreieck ohne Kreis
      return '<svg viewBox="0 0 34 34" aria-hidden="true"><path class="nav-fill" d="M17 6 28 26H6Z"/></svg>';
    }
    if (kind === "rnav") {
      return '<svg viewBox="0 0 34 34" aria-hidden="true"><path class="nav-outline rnav-star" d="M17 4 20.2 13.8 30 17 20.2 20.2 17 30 13.8 20.2 4 17 13.8 13.8Z"/></svg>';
    }
    if (point.type === "DME") {
      return '<svg viewBox="0 0 34 34" aria-hidden="true"><rect class="nav-outline" x="6" y="6" width="22" height="22"/><circle class="nav-fill" cx="17" cy="17" r="2.2"/></svg>';
    }
    if (/DME|TAC/.test(point.type || "")) {
      // VOR/DME bzw. VORTAC: Sechseck im Quadrat
      return `<svg viewBox="0 0 34 34" aria-hidden="true"><rect class="nav-outline" x="4" y="4" width="26" height="26"/><path class="nav-outline" d="${HEXAGON}"/><circle class="nav-fill" cx="17" cy="17" r="2"/></svg>`;
    }
    return '<svg viewBox="0 0 34 34" aria-hidden="true"><path class="nav-outline" d="M5 17 11 7H23L29 17 23 27H11Z"/><circle class="nav-fill" cx="17" cy="17" r="2.2"/></svg>';
  }

  function addMarker(point, kind, sourceNote) {
    const subtype = kind === "vfr" ? (point.type === "VFR-MRP" ? " mrp" : " rp") : "";
    const icon = L.divIcon({
      className: "",
      html: `<div class="nav-marker ${kind}${subtype}"><span class="nav-symbol">${symbolSvg(point, kind)}</span><span class="nav-label">${escapeHtml(point.ident)}</span></div>`,
      iconSize: [1, 42], iconAnchor: [0, 14], popupAnchor: [0, -18]
    });
    const frequency = point.frequency_khz
      ? kind === "ndb" ? `${point.frequency_khz} kHz` : `${(point.frequency_khz < 100000 ? point.frequency_khz / 100 : point.frequency_khz / 1000).toFixed(2)} MHz`
      : "";
    const association = point.airport_code ? ` · ${escapeHtml(point.airport_code)}` : "";
    const marker = L.marker([point.lat, point.lon], { icon, zIndexOffset: 200 });
    marker.bindPopup(`<div class="popup-title">${escapeHtml(point.ident)} · ${escapeHtml(point.name)}</div>
      <p>${escapeHtml(VFR_TYPE_LABELS[point.type] || point.type || "Navigationspunkt")}${association}${frequency ? ` · ${frequency}` : ""}</p>
      <small>${escapeHtml(sourceNote)} · Vor Nutzung aktuelle AIP prüfen.</small>
      <div class="popup-actions"><button type="button" class="add-nav-point">Als Überflugpunkt</button></div>`);
    marker.off("click", marker._openPopup, marker);
    marker.on("click", () => {
      const handled = !window.dispatchEvent(new CustomEvent("vfr-measure-point", { cancelable: true, detail: { coords: [point.lat, point.lon] } }));
      if (!handled) marker.openPopup();
    });
    marker.on("contextmenu", () => marker.openPopup());
    marker.on("popupopen", () => marker.getPopup().getElement().querySelector(".add-nav-point")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("vfr-add-navigation-point", { detail: point }));
      map.closePopup();
    }));
    marker.addTo(GROUPS[groupKey(kind, point)].group);
    window.navigationPoints.push({ ...point, kind });
    counts[kind] += 1;
  }

  function updateNavigationMeta() {
    const enabled = KINDS.filter((kind) => document.getElementById(`${kind}Layer`).checked);
    const meta = document.getElementById("navigationMeta");
    if (!enabled.length) {
      meta.textContent = `${counts.vor + counts.ndb} Funkfeuer · ${counts.vfr} VFR-Meldepunkte · ${counts.rnav} RNAV-Wegpunkte verfügbar`;
      return;
    }
    const parts = [];
    if (enabled.includes("vor")) parts.push(`${counts.vor} VOR / VOR-DME`);
    if (enabled.includes("ndb")) parts.push(`${counts.ndb} NDB`);
    if (enabled.includes("vfr")) parts.push(`${counts.vfr} VFR-Meldepunkte · AIRAC ${ofmAirac}`);
    if (enabled.includes("rnav")) parts.push(`${counts.rnav} RNAV-Wegpunkte`);
    meta.textContent = `${parts.join(" · ")}${zoomHint}`;
  }

  function syncLabelDensity() {
    const zoom = map.getZoom();
    document.getElementById("map").classList.toggle("nav-labels-hidden", zoom < 9);
    document.getElementById("map").classList.toggle("nav-far", zoom < 9);
  }

  function applyVisibility() {
    const zoom = map.getZoom();
    const hidden = new Map();
    Object.values(GROUPS).forEach((entry) => {
      const wanted = document.getElementById(`${entry.kind}Layer`).checked;
      const show = wanted && zoom >= entry.minZoom;
      if (show && !map.hasLayer(entry.group)) entry.group.addTo(map);
      if (!show && map.hasLayer(entry.group)) entry.group.remove();
      if (wanted && !show && (!hidden.has(entry.kind) || hidden.get(entry.kind) > entry.minZoom)) hidden.set(entry.kind, entry.minZoom);
    });
    const names = { vor: "VOR/DME", ndb: "NDB", vfr: "VFR-Meldepunkte", rnav: "RNAV-Wegpunkte" };
    zoomHint = hidden.size ? ` · hineinzoomen: ${[...hidden].map(([kind, zoom]) => `${names[kind]} ab Zoom ${zoom}`).join(", ")}` : "";
    updateNavigationMeta();
  }

  async function loadNavigation() {
    try {
      const [navaidsResponse, lowiResponse, ofmResponse] = await Promise.all([
        fetch("data/navaids.json", { cache: "no-cache" }),
        fetch("data/gps-fixes.json", { cache: "no-cache" }),
        fetch("data/navigation-points.json", { cache: "no-cache" })
      ]);
      if (!navaidsResponse.ok || !lowiResponse.ok || !ofmResponse.ok) throw new Error("Datensatz nicht erreichbar");
      const navaids = await navaidsResponse.json();
      const lowi = await lowiResponse.json();
      const ofm = await ofmResponse.json();
      ofmAirac = ofm.airac;

      navaids.navaids.forEach((point) => addMarker(
        point,
        point.type.startsWith("NDB") ? "ndb" : "vor",
        "Funkfeuer-Datenbestand"
      ));
      ofm.points.forEach((point) => addMarker(
        point,
        "vfr",
        `AIRAC ${ofm.airac}, ergänzende VFR-Orientierung`
      ));
      lowi.fixes.forEach((point) => addMarker(
        { ...point, type: "RNAV-/RNP-Wegpunkt (LOWI)", country: "LO" },
        "rnav",
        `AIRAC ${ofm.airac}, veröffentlichte RNP-Auswahl`
      ));

      syncLabelDensity();
      applyVisibility();
      window.dispatchEvent(new Event("vfr-navigation-loaded"));
    } catch (error) {
      document.getElementById("layerStatus").textContent = `Funkfeuer/Meldepunkte nicht verfügbar: ${error.message}`;
    }
  }

  KINDS.forEach((kind) => document.getElementById(`${kind}Layer`).addEventListener("change", applyVisibility));
  map.on("zoomend", () => { syncLabelDensity(); applyVisibility(); });
  loadNavigation();
})();
