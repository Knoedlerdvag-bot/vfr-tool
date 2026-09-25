(() => {
  const layers = { vor: L.layerGroup(), ndb: L.layerGroup(), fix: L.layerGroup() };
  const counts = { vor: 0, ndb: 0, fix: 0 };
  let ofmAirac = "";
  window.navigationPoints = [];

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function symbolSvg(point, kind) {
    if (kind === "ndb") {
      return '<svg viewBox="0 0 34 34" aria-hidden="true"><circle class="ndb-ring outer" cx="17" cy="17" r="13"/><circle class="ndb-ring inner" cx="17" cy="17" r="9"/><circle class="nav-fill" cx="17" cy="17" r="2.3"/></svg>';
    }
    if (kind === "fix") {
      return '<svg viewBox="0 0 34 34" aria-hidden="true"><path class="nav-fill reporting-triangle" d="M17 5 28 26H6Z"/></svg>';
    }
    if (/DME|TAC/.test(point.type || "")) {
      return '<svg viewBox="0 0 38 34" aria-hidden="true"><rect class="nav-outline" x="3" y="7" width="32" height="20"/><path class="nav-outline" d="M19 9 27 14v8l-8 4-8-4v-8Z"/><circle class="nav-fill" cx="19" cy="18" r="2"/></svg>';
    }
    return '<svg viewBox="0 0 34 34" aria-hidden="true"><path class="nav-outline" d="M17 5 27 11v12l-10 6-10-6V11Z"/><circle class="nav-fill" cx="17" cy="17" r="2.2"/></svg>';
  }

  function addMarker(point, kind, sourceUrl, sourceNote) {
    const subtype = kind === "vor" && /DME|TAC/.test(point.type || "") ? " vor-dme" : "";
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
      <p>${escapeHtml(point.type || "VFR-Meldepunkt")}${association}${frequency ? ` · ${frequency}` : ""}</p>
      <small>${escapeHtml(sourceNote)} · Vor Nutzung aktuelle AIP prüfen.</small>
      <div class="popup-actions"><button type="button" class="add-nav-point">Als Überflugpunkt</button><a href="${sourceUrl}" target="_blank" rel="noopener">Quelle</a></div>`);
    marker.on("popupopen", () => marker.getPopup().getElement().querySelector(".add-nav-point")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("vfr-add-navigation-point", { detail: point }));
      map.closePopup();
    }));
    marker.addTo(layers[kind]);
    window.navigationPoints.push({ ...point, kind });
    counts[kind] += 1;
  }

  function updateNavigationMeta() {
    const enabled = ["vor", "ndb", "fix"].filter((kind) => document.getElementById(`${kind}Layer`).checked);
    const meta = document.getElementById("navigationMeta");
    if (!enabled.length) {
      meta.textContent = `${counts.vor + counts.ndb} Funkfeuer · ${counts.fix} VFR-Meldepunkte verfügbar`;
      return;
    }
    const parts = [];
    if (enabled.includes("vor")) parts.push(`${counts.vor} VOR / VOR-DME`);
    if (enabled.includes("ndb")) parts.push(`${counts.ndb} NDB`);
    if (enabled.includes("fix")) parts.push(`${counts.fix} VFR-Punkte · OpenFlightMaps AIRAC ${ofmAirac}`);
    meta.textContent = `${parts.join(" · ")} · hineinzoomen für Kennungen`;
  }

  function syncLabelDensity() {
    document.getElementById("map").classList.toggle("nav-labels-hidden", map.getZoom() < 9);
  }

  async function loadNavigation() {
    try {
      const [navaidsResponse, lowiResponse, ofmResponse] = await Promise.all([
        fetch("data/navaids.json"),
        fetch("data/gps-fixes.json"),
        fetch("data/navigation-points.json")
      ]);
      if (!navaidsResponse.ok || !lowiResponse.ok || !ofmResponse.ok) throw new Error("Datensatz nicht erreichbar");
      const navaids = await navaidsResponse.json();
      const lowi = await lowiResponse.json();
      const ofm = await ofmResponse.json();
      ofmAirac = ofm.airac;

      navaids.navaids.forEach((point) => addMarker(
        point,
        point.type.startsWith("NDB") ? "ndb" : "vor",
        navaids.source_url,
        "OurAirports, unamtlicher Funkfeuerindex"
      ));
      ofm.points.forEach((point) => addMarker(
        point,
        "fix",
        ofm.source_url,
        `OpenFlightMaps OFMX AIRAC ${ofm.airac}, ergänzende VFR-Orientierung`
      ));
      lowi.fixes.forEach((point) => addMarker(
        { ...point, type: "LOWI RNP-Fix", country: "LO" },
        "fix",
        lowi.source_url,
        "Austro Control, veröffentlichte LOWI-RNP-Auswahl"
      ));

      ["vor", "ndb", "fix"].forEach((kind) => {
        if (document.getElementById(`${kind}Layer`).checked) layers[kind].addTo(map);
      });
      syncLabelDensity();
      updateNavigationMeta();
      window.dispatchEvent(new Event("vfr-navigation-loaded"));
    } catch (error) {
      document.getElementById("layerStatus").textContent = `Funkfeuer/Meldepunkte nicht verfügbar: ${error.message}`;
    }
  }

  ["vor", "ndb", "fix"].forEach((kind) => document.getElementById(`${kind}Layer`).addEventListener("change", (event) => {
    if (event.target.checked) layers[kind].addTo(map);
    else layers[kind].remove();
    updateNavigationMeta();
  }));
  map.on("zoomend", syncLabelDensity);
  loadNavigation();
})();
