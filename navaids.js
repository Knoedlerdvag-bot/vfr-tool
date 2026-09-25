(() => {
  const layers = {
    vor: L.layerGroup(),
    ndb: L.layerGroup(),
    fix: L.layerGroup()
  };
  window.navigationPoints = [];
  let fixTimer;
  let fixRequest = 0;
  let lastBounds = "";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function addMarker(point, kind, sourceUrl, sourceNote) {
    const icon = L.divIcon({
      className: "",
      html: `<div class="nav-marker ${kind}${kind === "vor" && /DME|TAC/.test(point.type || "") ? " vor-dme" : ""}"><span class="nav-symbol"></span><span class="nav-label">${escapeHtml(point.ident)}</span></div>`,
      iconSize: [1, 38], iconAnchor: [0, 12], popupAnchor: [0, -16]
    });
    const frequency = point.frequency_khz
      ? kind === "ndb" ? `${point.frequency_khz} kHz` : `${(point.frequency_khz < 100000 ? point.frequency_khz / 100 : point.frequency_khz / 1000).toFixed(2)} MHz`
      : "";
    const marker = L.marker([point.lat, point.lon], { icon, zIndexOffset: 200 });
    marker.bindPopup(`<div class="popup-title">${escapeHtml(point.ident)} · ${escapeHtml(point.name)}</div>
      <p>${escapeHtml(point.type || "GPS-Fix")}${frequency ? ` · ${frequency}` : ""}</p>
      <small>${escapeHtml(sourceNote)} · Vor Nutzung aktuelle AIP prüfen.</small>
      <div class="popup-actions"><button type="button" class="add-nav-point">Als Überflugpunkt</button><a href="${sourceUrl}" target="_blank" rel="noopener">Quelle</a></div>`);
    marker.on("popupopen", () => marker.getPopup().getElement().querySelector(".add-nav-point")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("vfr-add-navigation-point", { detail: point }));
      map.closePopup();
    }));
    marker.addTo(layers[kind]);
    window.navigationPoints.push({ ...point, kind });
  }

  async function loadVisibleFixes() {
    if (!document.getElementById("fixLayer").checked) return;
    const meta = document.getElementById("navigationMeta");
    if (map.getZoom() < 10) { meta.textContent = "GPS/RNAV-Fixes ab Zoomstufe 10 · für Übersicht bitte hineinzoomen"; return; }
    const bounds = map.getBounds();
    const parts = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()];
    if (parts[2] - parts[0] > 3.5 || parts[3] - parts[1] > 3.5) {
      meta.textContent = "Kartenausschnitt für GPS/RNAV-Fixes verkleinern";
      return;
    }
    const key = parts.map((value) => value.toFixed(2)).join(",");
    if (key === lastBounds) return;
    const request = ++fixRequest;
    meta.textContent = "GPS/RNAV-Fixes werden geladen …";
    try {
      const response = await fetch(`/api/fixes?bbox=${encodeURIComponent(parts.map((value) => value.toFixed(4)).join(","))}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Dienst nicht erreichbar");
      if (request !== fixRequest || !document.getElementById("fixLayer").checked) return;
      if (!payload.fixes.length) {
        lastBounds = key;
        meta.textContent = "Keine weiteren GPS/RNAV-Fixes aus NOAA für diesen Ausschnitt; LOWI-Auswahl bleibt sichtbar. Abdeckung unvollständig.";
        return;
      }
      layers.fix.clearLayers();
      window.navigationPoints = window.navigationPoints.filter((point) => point.kind !== "fix");
      payload.fixes.forEach((point) => addMarker(point, "fix", payload.source_url, "NOAA AWC, unamtlicher Planungsindex"));
      lastBounds = key;
      meta.textContent = `${payload.fixes.length} GPS/RNAV-Fixes im Ausschnitt · NOAA AWC · ${payload.limited ? "API-Limit erreicht, Anzeige unvollständig" : "vor Flug AIP prüfen"}`;
      window.dispatchEvent(new Event("vfr-navigation-loaded"));
    } catch (error) {
      if (request === fixRequest) meta.textContent = `GPS/RNAV-Fixes nicht verfügbar: ${error.message}. LOWI-Auswahl bleibt sichtbar.`;
    }
  }

  async function loadNavigation() {
    try {
      const [navaidsResponse, fixesResponse] = await Promise.all([
        fetch("data/navaids.json"), fetch("data/gps-fixes.json")
      ]);
      if (!navaidsResponse.ok || !fixesResponse.ok) throw new Error("Datensatz nicht erreichbar");
      const navaids = await navaidsResponse.json();
      const fixes = await fixesResponse.json();
      navaids.navaids.forEach((point) => addMarker(point, point.type.startsWith("NDB") ? "ndb" : "vor",
        navaids.source_url, "OurAirports, unamtlicher Index"));
      fixes.fixes.forEach((point) => addMarker({ ...point, type: "LOWI RNP-Fix" }, "fix",
        fixes.source_url, "Austro Control, LOWI-Auswahl; Stand der verlinkten Karte prüfen"));
      ["vor", "ndb", "fix"].forEach((kind) => {
        if (document.getElementById(`${kind}Layer`).checked) layers[kind].addTo(map);
      });
      window.dispatchEvent(new Event("vfr-navigation-loaded"));
      document.getElementById("navigationMeta").textContent = `${navaids.navaids.length} VOR/NDB in DE, AT, CH, FR, IT · OurAirports (unamtlich)`;
    } catch (error) {
      document.getElementById("layerStatus").textContent = `Funkfeuer/Fixes nicht verfügbar: ${error.message}`;
    }
  }

  ["vor", "ndb", "fix"].forEach((kind) => document.getElementById(`${kind}Layer`).addEventListener("change", (event) => {
    if (event.target.checked) layers[kind].addTo(map);
    else layers[kind].remove();
    if (kind === "fix") {
      if (event.target.checked) loadVisibleFixes();
      else fixRequest += 1;
    }
  }));
  map.on("moveend zoomend", () => {
    clearTimeout(fixTimer);
    fixTimer = setTimeout(loadVisibleFixes, 500);
  });
  loadNavigation();
})();
