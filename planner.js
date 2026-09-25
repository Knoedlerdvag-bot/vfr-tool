(() => {
  const points = [
    { kind: "start", value: "" },
    { kind: "destination", value: "" }
  ];
  const routeInputs = document.getElementById("routePoints");
  const routeSummary = document.getElementById("routeSummary");
  const layerStatus = document.getElementById("layerStatus");
  const routeLayer = L.layerGroup().addTo(map);
  const weatherMarkers = L.layerGroup();
  const webcamMarkers = L.layerGroup();
  const trafficMarkers = L.layerGroup();
  const measureLayer = L.layerGroup().addTo(map);
  let legs = [];
  let resolvedPoints = [];
  let weatherReports = [];
  let weatherMode = "";
  let activeTaf = null;
  let webcamData = [];
  const webcamEntries = [];
  let trafficTimer = null;
  let pickIndex = -1;
  let lastRouteKey = "";
  let measuring = false;
  let measurePoints = [];
  let printMap = null;
  let flapAudioContext = null;
  let lastFlapSound = -Infinity;
  let boardTimer = null;
  let boardKey = "";
  let boardAnimationGeneration = 0;
  const flapWheel = [..."0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.:/—- "];
  const unlockFlapAudio = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    flapAudioContext ||= new AudioContextClass();
    if (flapAudioContext.state !== "running") flapAudioContext.resume().catch(() => {});
  };
  document.addEventListener("pointerdown", unlockFlapAudio, { passive: true });
  document.addEventListener("keydown", unlockFlapAudio);

  function playFlapSound() {
    if (flapAudioContext?.state !== "running") return;
    const now = flapAudioContext.currentTime;
    if (now - lastFlapSound < 0.18) return;
    lastFlapSound = now;
    const sampleRate = flapAudioContext.sampleRate;
    const noise = flapAudioContext.createBuffer(1, Math.round(sampleRate * 0.045), sampleRate);
    const samples = noise.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;
    [0, 0.18].forEach((offset, index) => {
      const start = now + offset;
      const source = flapAudioContext.createBufferSource();
      const filter = flapAudioContext.createBiquadFilter();
      const gain = flapAudioContext.createGain();
      source.buffer = noise;
      filter.type = "bandpass";
      filter.frequency.value = index ? 1050 : 720;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(index ? 0.09 : 0.075, start + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);
      source.connect(filter).connect(gain).connect(flapAudioContext.destination);
      source.start(start);
      source.stop(start + 0.046);
    });
  }

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const formatNm = (value) => `${value.toFixed(1)} NM (${(value * 1.852).toFixed(1)} km)`;
  const formatMinutes = (hours) => `${Math.round(hours * 60)} min`;
  const pointLabel = (point) => point.kind === "start" ? "Start" : point.kind === "destination" ? "Ziel" : point.kind === "stop" ? "Landung" : "Überflug";
  const placeOption = (place) => `${place.label} · ${place.name}`;
  const navOption = (point) => `${point.ident} · ${point.name}${point.country ? ` (${point.country})` : ""}`;

  function setBoardValue(id, value, sequence, generation = boardAnimationGeneration) {
    const node = document.getElementById(id);
    const finalValue = String(value);
    node.dataset.value = finalValue;
    node.setAttribute("aria-label", finalValue);
    node.replaceChildren(...[...finalValue].map((character, index) => {
      const tile = document.createElement("span");
      tile.className = "split-tile";
      const glyph = document.createElement("span");
      glyph.className = "split-glyph";
      glyph.textContent = character;
      tile.append(glyph);
      if (sequence && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const targetIndex = Math.max(0, flapWheel.indexOf(character));
        const startIndex = (targetIndex + 3 + index * 5) % flapWheel.length;
        const wheelSequence = Array.from({ length: 16 }, (_, step) => flapWheel[(startIndex + step * 3) % flapWheel.length]);
        wheelSequence.push(character);
        const advance = (step = 0) => {
          if (!tile.isConnected) return;
          if (generation !== boardAnimationGeneration) {
            glyph.textContent = character;
            tile.classList.remove("wheel-step-a", "wheel-step-b");
            return;
          }
          glyph.textContent = wheelSequence[step];
          tile.classList.remove("wheel-step-a", "wheel-step-b");
          tile.classList.add(step % 2 ? "wheel-step-a" : "wheel-step-b");
          if (step + 1 < wheelSequence.length) setTimeout(() => advance(step + 1), 76);
          else setTimeout(() => tile.classList.remove("wheel-step-a", "wheel-step-b"), 80);
        };
        setTimeout(advance, index * 17);
        setTimeout(() => {
          if (!tile.isConnected) return;
          glyph.textContent = character;
          tile.classList.remove("wheel-step-a", "wheel-step-b");
        }, 2200 + index * 17);
      }
      return tile;
    }));
  }

  function centralEuropeanDate(input) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) return null;
    const [year, month, day, hour, minute] = input.match(/\d+/g).map(Number);
    const wallClock = Date.UTC(year, month - 1, day, hour, minute);
    const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Berlin", timeZoneName: "shortOffset" })
      .formatToParts(new Date(wallClock)).find((part) => part.type === "timeZoneName")?.value || "GMT+1";
    const offset = Number(name.match(/GMT([+-]\d+)/)?.[1] || 1);
    const instant = new Date(wallClock - offset * 3600000);
    const reconstructed = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(instant).replace(" ", "T");
    return reconstructed === input ? instant : null;
  }

  function scheduleLabel(date) {
    const options = { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" };
    const local = new Intl.DateTimeFormat("de-DE", { ...options, timeZone: "Europe/Berlin" }).format(date);
    const utc = new Intl.DateTimeFormat("de-DE", { ...options, timeZone: "UTC" }).format(date);
    return `${local} LT / ${utc} UTC`;
  }

  function boardDate(date, timeZone = "Europe/Berlin") {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
      timeZone, day: "2-digit", month: "short", year: "2-digit"
    }).formatToParts(date).map((part) => [part.type, part.value]));
    return `${parts.day}${String(parts.month).toUpperCase()}${parts.year}`;
  }

  function boardTime(date, timeZone) {
    return new Intl.DateTimeFormat("de-DE", {
      timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).format(date);
  }

  function solarEvent(date, coords, sunrise, zenith = 90.833) {
    const localParts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(date).map((part) => [part.type, part.value]));
    const year = Number(localParts.year);
    const month = Number(localParts.month);
    const day = Number(localParts.day);
    const start = Date.UTC(year, 0, 1);
    const dayOfYear = Math.floor((Date.UTC(year, month - 1, day) - start) / 86400000) + 1;
    const [latitude, longitude] = coords;
    const longitudeHour = longitude / 15;
    const approximate = dayOfYear + ((sunrise ? 6 : 18) - longitudeHour) / 24;
    const meanAnomaly = 0.9856 * approximate - 3.289;
    const radians = (degrees) => degrees * Math.PI / 180;
    const degrees = (value) => value * 180 / Math.PI;
    const normalize = (value, limit) => ((value % limit) + limit) % limit;
    let trueLongitude = meanAnomaly + 1.916 * Math.sin(radians(meanAnomaly)) + 0.02 * Math.sin(radians(2 * meanAnomaly)) + 282.634;
    trueLongitude = normalize(trueLongitude, 360);
    let rightAscension = normalize(degrees(Math.atan(0.91764 * Math.tan(radians(trueLongitude)))), 360);
    rightAscension += Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90;
    rightAscension /= 15;
    const sinDeclination = 0.39782 * Math.sin(radians(trueLongitude));
    const cosDeclination = Math.cos(Math.asin(sinDeclination));
    const cosHour = (Math.cos(radians(zenith)) - sinDeclination * Math.sin(radians(latitude))) / (cosDeclination * Math.cos(radians(latitude)));
    if (cosHour > 1 || cosHour < -1) return null;
    const hour = (sunrise ? 360 - degrees(Math.acos(cosHour)) : degrees(Math.acos(cosHour))) / 15;
    const localMean = hour + rightAscension - 0.06571 * approximate - 6.622;
    const utcHours = normalize(localMean - longitudeHour, 24);
    return new Date(Date.UTC(year, month - 1, day) + utcHours * 3600000);
  }

  function sunTimes(date, coords) {
    return {
      civilDawn: solarEvent(date, coords, true, 96),
      sunrise: solarEvent(date, coords, true),
      sunset: solarEvent(date, coords, false),
      civilDusk: solarEvent(date, coords, false, 96)
    };
  }

  function sunLabel(date, code) {
    if (!date) return "nicht berechenbar";
    return `${boardTime(date, "Europe/Berlin")} LT / ${boardTime(date, "UTC")} UTC · ${code}`;
  }

  function updateDaylightBoard(departure, arrival, animate, generation) {
    const warning = document.getElementById("daylightWarning");
    const startCode = (resolvedPoints[0]?.code || "START").slice(0, 8).toUpperCase();
    const destinationCode = (resolvedPoints.at(-1)?.code || "ZIEL").slice(0, 8).toUpperCase();
    const departureSun = sunTimes(departure, resolvedPoints[0].coords);
    const arrivalSun = sunTimes(arrival, resolvedPoints.at(-1).coords);
    const setSunEvent = (prefix, date, code) => {
      const label = prefix === "boardSunrise" ? "SR" : "SS";
      const local = date ? boardTime(date, "Europe/Berlin") : "--:--";
      const utc = date ? boardTime(date, "UTC") : "--:--";
      setBoardValue(`${prefix}Label`, label, animate, generation);
      setBoardValue(`${prefix}Time`, `${local} LCL / ${utc} UTC`, animate, generation);
      setBoardValue(`${prefix}Code`, `AT ${code}`, animate, generation);
    };
    setSunEvent("boardSunrise", departureSun.sunrise, startCode);
    setSunEvent("boardSunset", arrivalSun.sunset, destinationCode);
    const notices = [];
    let danger = false;
    if (departureSun.sunrise && departure < departureSun.sunrise) {
      danger = !departureSun.civilDawn || departure < departureSun.civilDawn;
      notices.push(danger
        ? `Departure vor Beginn der bürgerlichen Morgendämmerung (${sunLabel(departureSun.civilDawn, startCode)}).`
        : `Departure vor Sunrise (${sunLabel(departureSun.sunrise, startCode)}).`);
    }
    if (arrivalSun.sunset && arrival >= arrivalSun.sunset) {
      const afterCivilDusk = !arrivalSun.civilDusk || arrival >= arrivalSun.civilDusk;
      danger ||= afterCivilDusk;
      notices.push(afterCivilDusk
        ? `Arrival nach Ende der bürgerlichen Abenddämmerung (${sunLabel(arrivalSun.civilDusk, destinationCode)}).`
        : `Arrival nach Sunset; bürgerliche Abenddämmerung endet ${sunLabel(arrivalSun.civilDusk, destinationCode)}.`);
    }
    warning.hidden = notices.length === 0;
    warning.classList.toggle("danger", danger);
    warning.textContent = notices.length ? `${notices.join(" ")} Platz-Betriebszeit, Nachtflugberechtigung und aktuelle Unterlagen separat prüfen.` : "";
  }

  function updateRouteBoard(totalNm, speed, burn) {
    const board = document.getElementById("routeBoard");
    const ready = legs.length > 0 && speed > 0;
    clearTimeout(boardTimer);
    if (!ready) {
      boardAnimationGeneration += 1;
      board.hidden = true;
      boardKey = "";
      return;
    }
    const code = (point) => (point.code || point.name || "").replace(/[^A-Za-z0-9 -]/g, "").trim().slice(0, 8).toUpperCase() || "PUNKT";
    const fuelUnit = document.getElementById("fuelUnit").value;
    const values = {
      boardDepartureTitle: "DEPARTURE",
      boardArrivalTitle: "ARRIVAL",
      boardStart: code(resolvedPoints[0]),
      boardDestination: code(resolvedPoints.at(-1)),
      boardDistanceLabel: "STRECKE",
      boardDistance: `${totalNm.toFixed(1)} NM`,
      boardTimeLabel: "FLUGZEIT",
      boardTime: `${Math.round(totalNm / speed * 60)} MIN`,
      boardFuelLabel: "VERBRAUCH",
      boardFuel: burn > 0 ? `${(totalNm / speed * burn).toFixed(1)} ${fuelUnit}` : "OPTIONAL"
    };
    const departure = centralEuropeanDate(document.getElementById("departureTime").value);
    const arrival = departure ? new Date(departure.getTime() + totalNm / speed * 3600000) : null;
    const key = JSON.stringify(values) + document.getElementById("fuelUnit").value + document.getElementById("departureTime").value;
    if (key === boardKey) return;
    boardTimer = setTimeout(() => {
      board.hidden = false;
      boardKey = key;
      const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const generation = ++boardAnimationGeneration;
      Object.entries(values).forEach(([id, value]) => setBoardValue(id, value, animate, generation));
      setBoardValue("boardKm", `${(totalNm * 1.852).toFixed(1)} KM · ETAPPEN-LUFTLINIE · OHNE WIND`, animate, generation);
      if (departure && arrival) {
        setBoardValue("boardDepartureDate", `DATE ${boardDate(departure)}`, animate, generation);
        setBoardValue("boardDepartureTime", `${boardTime(departure, "Europe/Berlin")} LCL / ${boardTime(departure, "UTC")} UTC`, animate, generation);
        setBoardValue("boardArrivalDate", `DATE ${boardDate(arrival)}`, animate, generation);
        setBoardValue("boardArrivalTime", `${boardTime(arrival, "Europe/Berlin")} LCL / ${boardTime(arrival, "UTC")} UTC`, animate, generation);
        updateDaylightBoard(departure, arrival, animate, generation);
      }
      window.vfrRouteSchedule = { destinationCode: resolvedPoints.at(-1)?.code || "", arrivalLocal: arrival ? scheduleLabel(arrival) : "" };
      if (animate && flapAudioContext?.state === "running") {
        for (let index = 0; index < 12; index += 1) setTimeout(playFlapSound, index * 190);
      }
    }, 420);
  }

  function refreshDatalist() {
    let list = document.getElementById("routeChoices");
    if (!list) {
      list = document.createElement("datalist");
      list.id = "routeChoices";
      document.body.appendChild(list);
    }
    list.replaceChildren(...places.map((place) => {
      const option = document.createElement("option");
      option.value = placeOption(place);
      return option;
    }), ...(window.navigationPoints || []).map((point) => {
      const option = document.createElement("option");
      option.value = navOption(point);
      return option;
    }));
  }

  function resolvePoint(point) {
    const value = point.value.trim();
    if (!value) return null;
    if (point.resolved && point.resolved.label === value) {
      return { ...point, name: point.resolved.name, code: point.resolved.code,
        coords: [point.resolved.lat, point.resolved.lon], place: point.resolved.place || null };
    }
    const match = places.find((place) => placeOption(place).toLowerCase() === value.toLowerCase())
      || places.find((place) => place.label.length === 4 && place.label.toLowerCase() === value.toLowerCase())
      || places.find((place) => place.name.toLowerCase() === value.toLowerCase());
    if (match) return { ...point, name: match.name, code: match.label, coords: match.coords, place: match };
    const navMatches = (window.navigationPoints || []).filter((nav) => navOption(nav).toLowerCase() === value.toLowerCase()
      || nav.ident.toLowerCase() === value.toLowerCase());
    if (navMatches.length === 1) {
      const nav = navMatches[0];
      return { ...point, name: nav.ident, code: nav.ident, coords: [nav.lat, nav.lon], navigation: nav };
    }
    if (navMatches.length > 1) return { ...point, error: "Kennung mehrfach vorhanden. Punkt mit Namen und Land wählen." };
    const coords = value.match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,; ]\s*(-?\d{1,3}(?:\.\d+)?)$/);
    if (coords) {
      const lat = Number(coords[1]);
      const lon = Number(coords[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        return { ...point, name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, code: "", coords: [lat, lon] };
      }
    }
    return { ...point, error: "Enter drücken, um Ort, PLZ oder Code zu suchen." };
  }

  async function searchPoint(index) {
    const point = points[index];
    if (!point?.value.trim()) return;
    if (!resolvePoint(point)?.error) return;
    const row = routeInputs.children[index];
    const status = row.querySelector("small");
    const suggestions = row.querySelector(".route-suggestions");
    suggestions.replaceChildren();
    status.textContent = "Suche läuft …";
    const searchedValue = point.value;
    try {
      const response = await fetch(`/api/resolve?q=${encodeURIComponent(searchedValue)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Ortssuche nicht verfügbar");
      if (point.value !== searchedValue) return;
      if (!payload.results.length) { status.textContent = "Kein Treffer. Ort präzisieren oder Punkt auf der Karte wählen."; return; }
      const choose = (choice) => {
        point.resolved = choice;
        point.value = choice.label;
        row.querySelector("input").value = choice.label;
        status.textContent = "";
        suggestions.replaceChildren();
        recalculate();
      };
      if (payload.results.length === 1) { choose(payload.results[0]); return; }
      status.textContent = "Mehrere Treffer: bitte den richtigen Punkt wählen.";
      payload.results.forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = choice.label;
        button.addEventListener("click", () => choose(choice));
        suggestions.append(button);
      });
    } catch (error) {
      status.textContent = `Suche fehlgeschlagen: ${error.message}`;
    }
  }

  async function searchUnresolved() {
    for (let index = 0; index < points.length; index += 1) {
      if (resolvePoint(points[index])?.error) await searchPoint(index);
    }
  }

  function renderPointRows() {
    routeInputs.innerHTML = "";
    points.forEach((point, index) => {
      const row = document.createElement("div");
      row.className = "route-point";
      const input = document.createElement("input");
      input.setAttribute("list", "routeChoices");
      input.setAttribute("aria-label", pointLabel(point));
      input.placeholder = "ICAO, Platz, Ort, PLZ oder Koordinaten";
      input.value = point.value;
      input.addEventListener("change", () => { point.value = input.value; recalculate(); });
      input.addEventListener("input", () => { point.value = input.value; point.resolved = null; row.querySelector(".route-suggestions").replaceChildren(); recalculate(); });
      input.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); point.value = input.value; searchUnresolved(); } });
      const label = document.createElement("label");
      const iconName = point.kind === "start" ? "plane-takeoff" : point.kind === "destination" || point.kind === "stop" ? "plane-landing" : "route";
      label.innerHTML = `<i data-lucide="${iconName}" aria-hidden="true"></i><span>${pointLabel(point)}</span>`;
      row.append(label, input);
      const tools = document.createElement("span");
      tools.className = "toolbar";
      if (point.kind === "via" || point.kind === "stop") {
        const up = document.createElement("button");
        up.type = "button"; up.innerHTML = '<i data-lucide="chevron-up" aria-hidden="true"></i>'; up.title = "Punkt nach oben"; up.setAttribute("aria-label", up.title);
        up.disabled = index <= 1;
        up.addEventListener("click", () => { [points[index - 1], points[index]] = [points[index], points[index - 1]]; renderPointRows(); recalculate(); });
        const down = document.createElement("button");
        down.type = "button"; down.innerHTML = '<i data-lucide="chevron-down" aria-hidden="true"></i>'; down.title = "Punkt nach unten"; down.setAttribute("aria-label", down.title);
        down.disabled = index >= points.length - 2;
        down.addEventListener("click", () => { [points[index + 1], points[index]] = [points[index], points[index + 1]]; renderPointRows(); recalculate(); });
        const remove = document.createElement("button");
        remove.type = "button"; remove.innerHTML = '<i data-lucide="x" aria-hidden="true"></i>'; remove.title = "Punkt entfernen"; remove.setAttribute("aria-label", remove.title);
        remove.addEventListener("click", () => { points.splice(index, 1); renderPointRows(); recalculate(); });
        tools.append(up, down, remove);
      } else {
        const pick = document.createElement("button");
        pick.type = "button"; pick.innerHTML = '<i data-lucide="map-pin-plus" aria-hidden="true"></i>'; pick.title = "Koordinaten per Klick auf der Karte wählen"; pick.setAttribute("aria-label", pick.title);
        pick.addEventListener("click", () => { pickIndex = index; layerStatus.textContent = `${pointLabel(point)}: Koordinaten auf der Karte anklicken.`; });
        tools.append(pick);
      }
      row.append(tools);
      const error = document.createElement("small");
      row.append(error);
      const suggestions = document.createElement("div");
      suggestions.className = "route-suggestions";
      row.append(suggestions);
      routeInputs.append(row);
    });
    window.lucide?.createIcons({ nodes: [routeInputs] });
  }

  function haversineNm(a, b) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const dLat = radians(b[0] - a[0]);
    const dLon = radians(b[1] - a[1]);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a[0])) * Math.cos(radians(b[0])) * Math.sin(dLon / 2) ** 2;
    return 3440.065 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function bearing(a, b) {
    const toRad = (v) => v * Math.PI / 180;
    const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
    const x = Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) - Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  function recalculate() {
    const hadRoute = route.length >= 2;
    resolvedPoints = points.map(resolvePoint);
    routeInputs.querySelectorAll(".route-point small").forEach((small, index) => {
      if (!small.textContent.startsWith("Mehrere Treffer") && !small.textContent.startsWith("Suche läuft")) small.textContent = resolvedPoints[index]?.error || "";
    });
    const valid = resolvedPoints.every((point) => point && !point.error);
    route = valid ? resolvedPoints.map((point) => point.coords) : [];
    const speed = Number(document.getElementById("cruiseSpeed").value);
    const burn = Number(document.getElementById("fuelBurn").value);
    legs = [];
    routeLayer.clearLayers();
    if (route.length >= 2) {
      L.polyline(route, { color: "#a82469", weight: 5, opacity: 0.96, lineCap: "round" }).addTo(routeLayer);
      resolvedPoints.forEach((point, index) => {
        L.circleMarker(point.coords, { radius: point.kind === "stop" ? 8 : 6, color: "#a82469", fillColor: "#fff", fillOpacity: 1, weight: 3 })
          .bindTooltip(`${index + 1}. ${escapeHtml(point.name)}`).addTo(routeLayer);
      });
      for (let index = 1; index < route.length; index += 1) {
        const nm = haversineNm(route[index - 1], route[index]);
        legs.push({ from: resolvedPoints[index - 1], to: resolvedPoints[index], nm, bearing: bearing(route[index - 1], route[index]), hours: speed > 0 ? nm / speed : null });
      }
      const nextRouteKey = route.map((coords) => coords.join(",")).join(";");
      if (nextRouteKey !== lastRouteKey) {
        map.stop();
        map.fitBounds(route, { padding: [48, 48], maxZoom: 9, animate: false });
        lastRouteKey = nextRouteKey;
        if (!hadRoute && window.matchMedia("(max-width: 520px)").matches) {
          map.getContainer().scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    } else {
      lastRouteKey = "";
    }
    places.forEach(enrichPlace);
    const totalNm = legs.reduce((sum, leg) => sum + leg.nm, 0);
    updateRouteBoard(totalNm, speed, burn);
    if (legs.length) {
      routeSummary.innerHTML = legs.map((leg) => `<div class="route-leg"><span>${escapeHtml(leg.from.name)} → ${escapeHtml(leg.to.name)}</span><span>${leg.nm.toFixed(1)} NM · ${leg.hours === null ? "–" : formatMinutes(leg.hours)}</span></div>`).join("");
    } else {
      routeSummary.textContent = "";
    }
    hydrateStats();
    renderMarkers();
    renderList();
    renderSelected(activeIndex);
    const corridorReady = route.length >= 2 && Number.isFinite(corridorWidthNm);
    document.getElementById("exportScope").querySelector('option[value="corridor"]').disabled = !corridorReady;
    document.querySelectorAll('[data-filter="corridor"]').forEach((button) => {
      button.disabled = !corridorReady;
      button.title = corridorReady ? `Nur Plätze bis ${corridorWidthNm} NM je Routenseite` : "Zuerst eine Korridorbreite in der Routenplanung wählen";
    });
    if (!corridorReady) {
      if (document.getElementById("exportScope").value === "corridor") document.getElementById("exportScope").value = "visible";
      if (currentFilter === "corridor") applyFilter("all");
    }
  }

  window.vfrFuelMatch = (place) => {
    const selected = [...document.querySelectorAll(".fuel-options input:checked")].map((input) => input.value);
    if (!selected.length) return true;
    const fuel = String(place.fuel || "").toUpperCase();
    if (place.fuelClass === "unknown" || /NICHT BELEGT|UNBEKANNT|KEIN KRAFTSTOFF/.test(fuel)) return false;
    return selected.some((kind) => {
      if (kind === "100LL") return /100\s*LL/.test(fuel);
      if (kind === "AVGAS") return /(AVGAS|AV.GAS|AVIO\s*100LL)/.test(fuel) && !/AVGAS NICHT VERFÜGBAR|NO AVGAS/.test(fuel);
      if (kind === "UL91") return /UL\s*91/.test(fuel);
      if (kind === "MOGAS") return /MOGAS/.test(fuel);
      if (kind === "SUPER PLUS") return /SUPER PLUS/.test(fuel);
      if (kind === "BLEIFREI") return /UNLEADED|BLEIFREI/.test(fuel);
      return /JET\s*A[ -]?1/.test(fuel);
    });
  };

  function selectedPlaces() {
    const scope = document.getElementById("exportScope").value;
    if (scope === "corridor" && (route.length < 2 || !Number.isFinite(corridorWidthNm))) return [];
    return places.filter((place) => scope === "corridor"
      ? place.inCorridor && window.vfrFuelMatch(place)
      : map.getBounds().contains(place.coords) && map.hasLayer(markers.get(places.indexOf(place))));
  }

  function exportMode() {
    return document.querySelector('input[name="exportMode"]:checked').value;
  }

  function routeExportBaseName() {
    const token = (point, fallback) => String(point?.code || point?.place?.label || point?.name || fallback)
      .normalize("NFKD").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24).toUpperCase() || fallback;
    const start = token(resolvedPoints[0], "START");
    const arrival = token(resolvedPoints.at(-1), "ZIEL");
    return `Flugschueler.de_VFR-Italia_${start}-${arrival}`;
  }

  window.downloadWaypointsGpx = () => {
    const mode = exportMode();
    if (mode !== "places" && route.length < 2) { showTab("mapPage"); routeSummary.textContent = "Für den Routenexport bitte Start und Ziel wählen."; return; }
    const routeXml = mode === "places" ? "" : `<rte><name>VFR Italia Route</name>${resolvedPoints.map((point) => `<rtept lat="${point.coords[0].toFixed(6)}" lon="${point.coords[1].toFixed(6)}"><name>${xmlEscape(point.name)}</name><desc>${xmlEscape(pointLabel(point))}</desc></rtept>`).join("")}</rte>`;
    const placeXml = mode === "route" ? "" : selectedPlaces().map((place) => `<wpt lat="${place.coords[0].toFixed(6)}" lon="${place.coords[1].toFixed(6)}"><name>${xmlEscape(waypointName(place))}</name><desc>${xmlEscape(`Fuel: ${place.fuel} | PPR: ${place.ppr} | Quelle: ${place.source}`)}</desc></wpt>`).join("");
    downloadFile(`${routeExportBaseName()}.gpx`, "application/gpx+xml;charset=utf-8", `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="VFR Italia" xmlns="http://www.topografix.com/GPX/1/1">${routeXml}${placeXml}</gpx>`);
  };

  window.downloadWaypointsCsv = () => {
    const mode = exportMode();
    if (mode !== "places" && route.length < 2) { showTab("mapPage"); routeSummary.textContent = "Für den Routenexport bitte Start und Ziel wählen."; return; }
    const fuelColumn = document.getElementById("fuelUnit").value === "gal" ? "fuel_us_gal" : "fuel_l";
    const rows = [["record_type", "sequence", "name", "code", "lat", "lon", "leg_nm", "leg_km", "leg_minutes", "bearing_true_deg", fuelColumn, "corridor_nm", "fuel_info", "ppr", "source"]];
    if (mode !== "places") resolvedPoints.forEach((point, index) => {
      const leg = legs[index - 1];
      const burn = Number(document.getElementById("fuelBurn").value);
      rows.push([point.kind, index + 1, point.name, point.code, point.coords[0].toFixed(6), point.coords[1].toFixed(6), leg?.nm.toFixed(1) || "", leg ? (leg.nm * 1.852).toFixed(1) : "", leg?.hours === null || !leg ? "" : Math.round(leg.hours * 60), leg ? Math.round(leg.bearing) : "", leg?.hours && burn > 0 ? (leg.hours * burn).toFixed(1) : "", "", point.place?.fuel || "", point.place?.ppr || "", point.place?.source || ""]);
    });
    if (mode !== "route") selectedPlaces().forEach((place) => {
      rows.push(["place", "", place.name, place.label, place.coords[0].toFixed(6), place.coords[1].toFixed(6), "", "", "", "", "", Number.isFinite(place.corridorNm) ? place.corridorNm.toFixed(1) : "", place.fuel, place.ppr, place.source]);
    });
    downloadFile(`${routeExportBaseName()}.csv`, "text/csv;charset=utf-8", "\ufeff" + rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");
  };

  function printBriefing() {
    if (route.length < 2) { routeSummary.textContent = "Für das Briefing bitte Start und Ziel auflösen."; searchUnresolved(); return; }
    const speed = Number(document.getElementById("cruiseSpeed").value);
    const burn = Number(document.getElementById("fuelBurn").value);
    const fuelUnit = document.getElementById("fuelUnit").value === "gal" ? "US gal" : "L";
    const totalNm = legs.reduce((sum, leg) => sum + leg.nm, 0);
    const departure = centralEuropeanDate(document.getElementById("departureTime").value);
    const arrival = departure && speed > 0 ? new Date(departure.getTime() + totalNm / speed * 3600000) : null;
    const schedule = departure ? `<p class="print-small">Abflug ${escapeHtml(scheduleLabel(departure))}${arrival ? ` · Ankunft etwa ${escapeHtml(scheduleLabel(arrival))}, ohne Zwischenstopps` : ""}</p>` : "";
    let cumulativeNm = 0;
    let cumulativeMin = 0;
    const rows = legs.map((leg, index) => {
      cumulativeNm += leg.nm;
      cumulativeMin += leg.hours === null ? 0 : leg.hours * 60;
      return `<tr><td>${index + 1}</td><td>${escapeHtml(leg.from.name)} → ${escapeHtml(leg.to.name)}</td><td>${String(Math.round(leg.bearing)).padStart(3, "0")}°</td><td>${leg.nm.toFixed(1)}</td><td>${(leg.nm * 1.852).toFixed(1)}</td><td>${leg.hours === null ? "–" : Math.round(leg.hours * 60)}</td><td>${cumulativeNm.toFixed(1)} / ${speed > 0 ? Math.round(cumulativeMin) : "–"}</td><td>${leg.hours && burn > 0 ? (leg.hours * burn).toFixed(1) : "–"}</td></tr>`;
    }).join("");
    const landings = resolvedPoints.filter((point) => point.kind === "start" || point.kind === "stop" || point.kind === "destination").filter((point) => point.place);
    if (printMap) { printMap.remove(); printMap = null; }
    const printedAt = new Date();
    const printStamp = `${printedAt.toLocaleDateString("de-DE")}<br>${printedAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`;
    document.getElementById("printSheet").innerHTML = `<div class="print-head"><div><h1>Routenübersicht</h1><div>${escapeHtml(resolvedPoints[0].name)} → ${escapeHtml(resolvedPoints.at(-1).name)}</div></div><small>${printStamp}<br>Unverbindlicher Planstand</small></div><div class="print-kpis"><div><b>${totalNm.toFixed(1)} NM</b><span>${(totalNm * 1.852).toFixed(1)} km Gesamtstrecke</span></div><div><b>${speed > 0 ? formatMinutes(totalNm / speed) : "–"}</b><span>bei ${speed > 0 ? `${speed} kt` : "fehlender Geschwindigkeit"}</span></div><div><b>${burn > 0 && speed > 0 ? `${((totalNm / speed) * burn).toFixed(1)} ${fuelUnit}` : "–"}</b><span>rechnerischer Reiseflugverbrauch</span></div></div>${schedule}<div id="printMap" class="print-map" role="img" aria-label="Routenkarte mit Start, Zwischenpunkten und Ziel"></div><p class="print-small">Kartenbasis © OpenStreetMap-Mitwirkende. Gerade Etappen ohne Luftraum-/Geländeprüfung. Keine amtliche Luftfahrtkarte.</p><h2>Etappen</h2><table><thead><tr><th>#</th><th>Von → nach</th><th>Kurs wahr</th><th>NM</th><th>km</th><th>min</th><th>Σ NM / min</th><th>${fuelUnit}</th></tr></thead><tbody>${rows}</tbody></table><h2>Start, Landestopps und Ziel</h2>${landings.map((point) => `<p><b>${escapeHtml(point.name)}</b> · ${escapeHtml(point.place.fuel || "Kraftstoff unbekannt")} · PPR: ${escapeHtml(point.place.ppr || "prüfen")}<br><span class="print-small">${escapeHtml(point.place.contact || "Betreiberkontakt prüfen")} · Quelle: ${escapeHtml(point.place.source || "")}</span></p>`).join("")}<p class="print-small">Zeit und Kraftstoff ohne Wind, Start/Steigflug, Reserve oder Tankstopp. Vor dem Flug aktuelle AIP, NOTAM, Wetter, Luftraum, Betreiber, PPR und Kraftstoff prüfen. Keine operative Navigationsunterlage.</p><footer class="print-footer">flugschüler.de</footer>`;
    printMap = L.map("printMap", { zoomControl: false, dragging: false, scrollWheelZoom: false, attributionControl: true });
    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap-Mitwirkende", maxZoom: 12 }).addTo(printMap);
    L.polyline(route, { color: "#a82469", weight: 4 }).addTo(printMap);
    route.forEach((coords, index) => L.circleMarker(coords, { radius: 5, color: "#a82469", fillColor: "#fff", fillOpacity: 1, weight: 2 })
      .bindTooltip(`${index + 1}. ${resolvedPoints[index].name}`, { permanent: true, direction: "right" }).addTo(printMap));
    printMap.fitBounds(route, { padding: [30, 40], maxZoom: 9, animate: false });
    let printed = false;
    const doPrint = () => {
      if (printed) return;
      printed = true;
      const previousTitle = document.title;
      document.title = routeExportBaseName();
      window.addEventListener("afterprint", () => { document.title = previousTitle; }, { once: true });
      window.print();
    };
    tiles.once("load", doPrint);
    setTimeout(doPrint, 1800);
  }

  function reportCategory(report) {
    if (!report.reportTime || Date.now() - Date.parse(report.reportTime) > 2 * 60 * 60 * 1000) return "unknown";
    return ["VFR", "MVFR", "IFR", "LIFR"].includes(report.fltCat) ? report.fltCat : "unknown";
  }

  function ceilingFt(report) {
    const layer = (report.clouds || []).find((cloud) => ["BKN", "OVC", "VV"].includes(cloud.cover) && Number.isFinite(Number(cloud.base)));
    return layer ? Number(layer.base) : null;
  }

  function utc(value) {
    const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
    return Number.isNaN(date.getTime()) ? "Zeit unbekannt" : date.toLocaleString("de-DE", { timeZone: "UTC", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + " UTC";
  }

  function weatherValue(report) {
    if (weatherMode === "wind") {
      if (!Number.isFinite(Number(report.wspd))) return null;
      const direction = Number(report.wdir);
      const arrow = Number.isFinite(direction) ? `<span class="wind-arrow" style="--direction:${direction}deg">↑</span>` : "";
      return `${arrow}${escapeHtml(report.wspd)} kt`;
    }
    if (weatherMode === "cloud") return (report.clouds || []).length
      ? escapeHtml(report.clouds.map((cloud) => cloud.cover).join("/")) : null;
    if (weatherMode === "ceiling") return ceilingFt(report) === null ? null : `${ceilingFt(report)} ft`;
    if (weatherMode === "visibility") return report.visib ? `${escapeHtml(report.visib)} SM` : null;
    return weatherMode === "taf" ? "TAF" : reportCategory(report);
  }

  function weatherMeta(report) {
    const height = weatherMode === "wind" ? "Stationswind" : weatherMode === "ceiling" || weatherMode === "cloud" ? "Wolkenbasis AGL" : "Stationsniveau";
    const unit = weatherMode === "wind" ? "kt / Grad" : weatherMode === "ceiling" ? "ft AGL" : weatherMode === "visibility" ? "SM" : weatherMode === "cloud" ? "Bedeckungscode" : "Flugwetterkategorie";
    return `Beobachtung ${utc(report.reportTime)} · NOAA AWC · ${height} · ${unit} · Modelllauf: entfällt`;
  }

  function weatherPopup(report) {
    return `<div class="popup-title">${escapeHtml(report.icaoId)} · ${escapeHtml(report.name || "METAR")}</div><span class="tag ${reportCategory(report) === "unknown" ? "unknown" : "corridor"}">${reportCategory(report)}</span><p>${escapeHtml(report.rawOb || "Keine Meldung")}</p><small>${weatherMeta(report)}<br>Nur Stationswert, keine Aussage für die Fläche zwischen Stationen.</small><div class="popup-actions"><button type="button" class="open-taf">TAF anzeigen</button><a href="https://aviationweather.gov/data/metar/?id=${encodeURIComponent(report.icaoId)}" target="_blank" rel="noopener">Quelle</a></div>`;
  }

  function showTafSegment(index) {
    const timeline = document.getElementById("tafTimeline");
    const segment = activeTaf?.fcsts?.[index];
    if (!segment) return;
    const clouds = (segment.clouds || []).map((cloud) => `${cloud.cover} ${cloud.base || "?"} ft`).join(" · ") || "keine Schichtangabe";
    const value = `<b>${utc(segment.timeFrom)} bis ${utc(segment.timeTo)}</b><br>Wind ${escapeHtml(segment.wdir ?? "?")}° / ${escapeHtml(segment.wspd ?? "?")} kt · Sicht ${escapeHtml(segment.visib ?? "?")} SM<br>${escapeHtml(clouds)}<br>Änderung: ${escapeHtml(segment.fcstChange || "Grundprognose")}`;
    timeline.querySelector(".taf-timeline-output").innerHTML = value;
    timeline.querySelector("input").value = index;
  }

  async function openTaf(icao) {
    const timeline = document.getElementById("tafTimeline");
    document.getElementById("weatherTools").open = true;
    timeline.hidden = false;
    timeline.textContent = `${icao}: TAF wird geladen …`;
    try {
      const response = await fetch(`/api/taf?icao=${encodeURIComponent(icao)}`);
      if (!response.ok) throw new Error("TAF nicht erreichbar");
      const payload = await response.json();
      activeTaf = payload.reports?.[0] || null;
      if (!activeTaf) { timeline.textContent = `${icao}: Kein TAF verfügbar.`; return; }
      const segments = activeTaf.fcsts || [];
      const issue = utc(activeTaf.issueTime || activeTaf.bulletinTime);
      document.getElementById("weatherMeta").textContent = `TAF ${icao} · Prognose · NOAA AWC · Ausgabe ${issue} · Gültig ${utc(activeTaf.validTimeFrom)} bis ${utc(activeTaf.validTimeTo)} · Modelllauf: entfällt`;
      if (!segments.length) { timeline.textContent = activeTaf.rawTAF || "Keine dekodierten Zeitabschnitte verfügbar."; return; }
      timeline.innerHTML = `<label for="tafStep">Prognoseabschnitt · ${escapeHtml(icao)}</label><input id="tafStep" type="range" min="0" max="${segments.length - 1}" step="1" value="0"><div class="taf-timeline-output"></div><small>TAF gilt am Flughafen; Zwischenräume und Gelände eigenständig prüfen.</small>`;
      timeline.querySelector("input").addEventListener("input", (event) => showTafSegment(Number(event.target.value)));
      showTafSegment(0);
    } catch (error) { timeline.textContent = `${icao}: ${error.message}`; }
  }

  function renderWeatherMarkers() {
    weatherMarkers.clearLayers();
    if (!weatherMode) return;
    const cellSize = map.getZoom() < 7 ? 105 : map.getZoom() < 9 ? 72 : 0;
    const occupied = new Set();
    let displayed = 0;
    weatherReports.forEach((report) => {
      if (!map.getBounds().contains([report.lat, report.lon])) return;
      const value = weatherValue(report);
      if (!value) return;
      if (cellSize) {
        const pixel = map.latLngToContainerPoint([report.lat, report.lon]);
        const cell = `${Math.floor(pixel.x / cellSize)},${Math.floor(pixel.y / cellSize)}`;
        if (occupied.has(cell)) return;
        occupied.add(cell);
      }
      const stale = reportCategory(report) === "unknown";
      const marker = L.marker([report.lat, report.lon], { icon: L.divIcon({ className: "", html: `<div class="wx-observation ${weatherMode} ${reportCategory(report).toLowerCase()} ${stale ? "stale" : ""}">${value}</div>`, iconSize: [72, 34], iconAnchor: [36, 40] }), zIndexOffset: -150 });
      marker.bindPopup(weatherPopup(report));
      marker.on("popupopen", () => marker.getPopup().getElement().querySelector(".open-taf")?.addEventListener("click", () => openTaf(report.icaoId)));
      marker.addTo(weatherMarkers);
      displayed += 1;
    });
    if (weatherReports.length) {
      const label = weatherMode === "wind" ? "Windwerte" : weatherMode === "cloud" ? "Wolkenwerte" : weatherMode === "ceiling" ? "Untergrenzen" : weatherMode === "visibility" ? "Sichtwerte" : "METAR-Stationen";
      layerStatus.textContent = `${displayed} ${label} in der Ansicht · Stationswerte, keine Fläche`;
    }
  }

  async function loadWeather() {
    layerStatus.textContent = "METAR werden geladen …";
    try {
      const response = await fetch("/api/weather");
      if (!response.ok) throw new Error("Serverdienst nicht erreichbar");
      const payload = await response.json();
      weatherReports = payload.reports.filter((report) => Number.isFinite(Number(report.lat)) && Number.isFinite(Number(report.lon)) && report.rawOb);
      layerStatus.textContent = `${weatherReports.length} METAR-Stationen · NOAA · Zeitstempel je Meldung`;
      renderWeatherMarkers();
      showSelectedWeather();
    } catch (error) {
      layerStatus.textContent = `METAR nicht verfügbar: ${error.message}. Bitte VFR-Italia-Server starten.`;
    }
  }

  function showSelectedWeather() {
    const card = document.getElementById("selectedCard");
    card.querySelector(".selected-weather")?.remove();
    if (activeIndex < 0 || !document.getElementById("weatherLayer").checked || !weatherReports.length) return;
    const place = places[activeIndex];
    const nearest = weatherReports.map((report) => ({ report, nm: haversineNm(place.coords, [report.lat, report.lon]) })).sort((a, b) => a.nm - b.nm)[0];
    if (!nearest) return;
    const node = document.createElement("div");
    node.className = "selected-weather helper";
    node.innerHTML = `<b>${escapeHtml(nearest.report.icaoId)} · ${reportCategory(nearest.report)} · ${nearest.nm.toFixed(1)} NM entfernt</b><br>${escapeHtml(nearest.report.rawOb)}<br>Beobachtet: ${escapeHtml(nearest.report.reportTime || "unbekannt")} · Station, keine Messung am gewählten Platz.<br><button class="btn" type="button">TAF laden</button><div class="taf-text"></div>`;
    node.querySelector("button").addEventListener("click", async () => {
      const field = node.querySelector(".taf-text");
      field.textContent = "TAF wird geladen …";
      try {
        const response = await fetch(`/api/taf?icao=${nearest.report.icaoId}`);
        if (!response.ok) throw new Error("TAF nicht abrufbar");
        const payload = await response.json();
        field.textContent = payload.reports?.[0]?.rawTAF || payload.reports?.[0]?.rawOb || "Für diese Station liegt kein TAF vor.";
      } catch (error) {
        field.textContent = error.message;
      }
    });
    card.append(node);
  }

  async function loadWebcams() {
    if (webcamData.length) { requestAnimationFrame(updateCameraLabels); return; }
    try {
      const response = await fetch("data/foto-webcams.json");
      const payload = await response.json();
      webcamData = payload.cameras;
      webcamData.forEach((camera) => {
        const direction = camera.direction_deg;
        const displayName = camera.display_name || camera.name;
        const viewSector = Number.isFinite(direction) ? `<svg class="view-sector" viewBox="0 0 64 64" style="--bearing:${direction}deg" aria-hidden="true"><path d="M32 32 L17 6 Q32 -1 47 6 Z"/><circle cx="32" cy="32" r="3"/></svg>` : "";
        const icon = L.divIcon({ className: "camera-leaflet-icon", html: `<div class="camera-icon"><div class="camera-marker">${viewSector}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4h-5L7.8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.8z"/><circle cx="12" cy="13" r="3.5"/></svg></div><span class="camera-label" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</span></div>`, iconSize: [132, 54], iconAnchor: [66, 13] });
        const image = `${camera.url}current/400.jpg`;
        const marker = L.marker([camera.latitude, camera.longitude], { icon });
        marker.bindPopup(`<div class="popup-title">${escapeHtml(displayName)}</div><a href="${camera.url}" target="_blank" rel="noopener"><img class="camera-preview" src="${image}" alt="Aktuelles Bild ${escapeHtml(displayName)}" loading="lazy"></a><small class="camera-source">Blickrichtung ${direction === null ? "unbekannt" : `${direction}°`} · <a href="${camera.url}" target="_blank" rel="noopener">Bildquelle: foto-webcam.eu</a></small>`, { className: "camera-popup", maxWidth: 420 });
        marker.on("mouseover", () => marker.getElement()?.classList.add("camera-hover"));
        marker.on("mouseout", () => marker.getElement()?.classList.remove("camera-hover"));
        marker.addTo(webcamMarkers);
        webcamEntries.push({ camera, marker });
      });
      layerStatus.textContent = `${webcamData.length} Webcams · foto-webcam.eu`;
      requestAnimationFrame(updateCameraLabels);
    } catch (error) {
      layerStatus.textContent = `Webcams konnten nicht geladen werden: ${error.message}`;
    }
  }

  function updateCameraLabels() {
    if (!map.hasLayer(webcamMarkers)) return;
    const size = map.getSize();
    const visible = webcamEntries.map((entry) => {
      const element = entry.marker.getElement();
      const label = element?.querySelector(".camera-label");
      if (element) element.style.visibility = "hidden";
      if (label) label.style.visibility = "hidden";
      const point = map.latLngToContainerPoint([entry.camera.latitude, entry.camera.longitude]);
      const onScreen = point.x >= 0 && point.y >= 0 && point.x <= size.x && point.y <= size.y;
      const priority = route.length >= 2
        ? distanceToLineNm([entry.camera.latitude, entry.camera.longitude], route)
        : Math.hypot(point.x - size.x / 2, point.y - size.y / 2);
      return { element, label, point, onScreen, priority };
    }).filter((entry) => entry.element && entry.label && entry.onScreen).sort((a, b) => a.priority - b.priority);
    const occupiedIcons = [];
    const occupiedLabels = [];
    const iconGap = map.getZoom() < 8 ? 46 : map.getZoom() < 10 ? 34 : 25;
    visible.forEach(({ element, label, point }) => {
      if (occupiedIcons.some((other) => Math.hypot(point.x - other.x, point.y - other.y) < iconGap)) return;
      occupiedIcons.push(point);
      element.style.visibility = "visible";
      const width = label.offsetWidth;
      const height = label.offsetHeight;
      const box = { left: point.x - width / 2 - 4, right: point.x + width / 2 + 4, top: point.y + 17, bottom: point.y + 17 + height + 5 };
      if (box.left < 0 || box.right > size.x || box.bottom > size.y) return;
      if (occupiedLabels.some((other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top)) return;
      label.style.visibility = "visible";
      occupiedLabels.push(box);
    });
  }

  map.on("moveend zoomend resize", updateCameraLabels);

  async function loadTraffic() {
    const flarm = document.getElementById("flarmTraffic").checked;
    const adsb = document.getElementById("adsbTraffic").checked;
    if (!flarm && !adsb) return;
    const center = map.getCenter();
    const radius = Math.min(250, Math.max(1, Math.ceil(map.distance(center, map.getBounds().getNorthEast()) / 1852)));
    const source = flarm && adsb ? "both" : flarm ? "flarm" : "adsb";
    const status = document.getElementById("trafficStatus");
    try {
      const response = await fetch(`/api/traffic?lat=${center.lat.toFixed(3)}&lon=${center.lng.toFixed(3)}&radius=${radius}&source=${source}`);
      if (!response.ok) throw new Error("Serverdienst nicht erreichbar");
      const payload = await response.json();
      trafficMarkers.clearLayers();
      const zoom = map.getZoom();
      const compactMap = zoom < 10 || (map.getSize().x < 600 && zoom < 12);
      const spacing = zoom < 8 ? 54 : zoom < 10 ? 38 : 22;
      const occupied = new Set();
      let displayed = 0;
      payload.positions
        .filter((position) => map.getBounds().contains([position.lat, position.lon]))
        .sort((a, b) => (Number(b.speed_kt || 0) > 20 ? 1 : 0) - (Number(a.speed_kt || 0) > 20 ? 1 : 0) || a.age_sec - b.age_sec)
        .forEach((position) => {
        const pixel = map.latLngToContainerPoint([position.lat, position.lon]);
        const cell = `${Math.floor(pixel.x / spacing)}:${Math.floor(pixel.y / spacing)}`;
        if (occupied.has(cell)) return;
        occupied.add(cell);
        displayed += 1;
        const category = ["glider", "plane", "helicopter", "paraglider", "parachute"].includes(position.category) ? position.category : "aircraft";
        const symbol = category === "helicopter"
          ? '<svg class="helicopter-top" viewBox="0 0 32 32" aria-hidden="true"><path class="rotor" d="M3 13h26M16 1v24M7 4l18 18M25 4L7 22"/><path class="airframe" d="M16 6c2.8 0 4.2 3 4.2 6.4v4.3l2.8 7.7-2.1 1-3.2-5.1v7.1l2.7 1.7v1.4h-8.8v-1.4l2.7-1.7v-7.1l-3.2 5.1-2.1-1 2.8-7.7v-4.3C11.8 9 13.2 6 16 6z"/></svg>'
          : category === "glider"
            ? '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2v27M2 16l14-3 14 3-14 2zM10 28h12"/></svg>'
            : category === "paraglider" || category === "parachute"
              ? '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 14C5 2 27 2 29 14M3 14l13 7 13-7M16 21v6m-4 1h8"/></svg>'
              : '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2l3 11 10 4v3l-10-2v8l3 2v2H10v-2l3-2v-8L3 20v-3l10-4z"/></svg>';
        const label = position.label || "nicht identifiziert";
        const categoryLabel = { glider: "Segelflugzeug", plane: "Motorflugzeug", helicopter: "Hubschrauber", paraglider: "Gleitschirm", parachute: "Fallschirm", aircraft: "Luftfahrzeug" }[category];
        const detail = [
          `<b>${escapeHtml(label)}</b> · ${categoryLabel}`,
          position.model ? `Muster: ${escapeHtml(position.model)}` : "",
          Number.isFinite(position.altitude_ft) ? `Höhe: ${position.altitude_ft.toLocaleString("de-DE")} ft MSL` : "",
          Number.isFinite(position.speed_kt) ? `GS: ${position.speed_kt} kt` : "",
          Number.isFinite(position.track_deg) ? `Track: ${position.track_deg}°` : "",
          `Letztes Signal vor ${position.age_sec} s`
        ].filter(Boolean).join("<br>");
        const heading = Number.isFinite(position.track_deg) ? position.track_deg : 0;
        const compact = [position.label, Number.isFinite(position.altitude_ft) ? `${Math.round(position.altitude_ft / 100) / 10}k ft` : "", Number.isFinite(position.speed_kt) ? `${position.speed_kt} kt` : ""].filter(Boolean).join(" · ");
        L.marker([position.lat, position.lon], { icon: L.divIcon({ className: "", html: `<div class="traffic-icon ${category}" title="${escapeHtml(label)}"><span class="traffic-glyph" style="transform:rotate(${heading}deg)">${symbol}</span>${!compactMap && compact ? `<b>${escapeHtml(compact)}</b>` : ""}</div>`, iconSize: [compactMap ? 30 : 150, 30], iconAnchor: [15, 15] }) })
          .bindTooltip(detail, { direction: "top" }).addTo(trafficMarkers);
      });
      status.textContent = `${payload.positions.length} Signale · ${displayed} auf der Karte · unvollständige Abdeckung${payload.status && payload.status !== "connected" ? ` · ${payload.status}` : ""}`;
    } catch (error) {
      status.textContent = `Flugverkehr nicht verfügbar: ${error.message}`;
    }
  }

  const originalRenderSelected = renderSelected;
  renderSelected = function(index) { originalRenderSelected(index); showSelectedWeather(); };

  document.getElementById("addVia").addEventListener("click", () => { points.splice(points.length - 1, 0, { kind: "via", value: "" }); renderPointRows(); recalculate(); });
  document.getElementById("jumpPlanner").addEventListener("click", () => {
    if (window.matchMedia("(max-width: 779px)").matches) {
      document.body.classList.add("planner-open");
      document.getElementById("plannerToggle").setAttribute("aria-expanded", "true");
    } else document.querySelector(".planner-box").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("addStop").addEventListener("click", () => { points.splice(points.length - 1, 0, { kind: "stop", value: "" }); renderPointRows(); recalculate(); });
  document.getElementById("cruiseSpeed").addEventListener("input", () => { recalculate(); if (measuring) renderMeasurement(); });
  document.getElementById("fuelBurn").addEventListener("input", () => { recalculate(); if (measuring) renderMeasurement(); });
  document.getElementById("fuelUnit").addEventListener("change", (event) => {
    document.getElementById("fuelRateUnit").textContent = `${event.target.value}/h`;
    recalculate();
    if (measuring) renderMeasurement();
  });
  const departureInput = document.getElementById("departureTime");
  const departureDateInput = document.getElementById("departureDate");
  const departureClockInput = document.getElementById("departureClock");
  const pickerValue = (date) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date).replace(" ", "T");
  const setDeparturePicker = (date) => {
    const value = pickerValue(date);
    departureDateInput.value = value.slice(0, 10);
    departureClockInput.value = value.slice(11, 16);
    departureInput.value = value;
  };
  const syncDeparturePicker = () => {
    departureInput.value = departureDateInput.value && departureClockInput.value ? `${departureDateInput.value}T${departureClockInput.value}` : "";
    recalculate();
  };
  departureDateInput.addEventListener("change", syncDeparturePicker);
  departureClockInput.addEventListener("change", syncDeparturePicker);
  document.querySelectorAll("[data-time-shift]").forEach((button) => button.addEventListener("click", () => {
    const current = centralEuropeanDate(departureInput.value) || new Date();
    setDeparturePicker(new Date(current.getTime() + Number(button.dataset.timeShift) * 60000));
    recalculate();
  }));
  document.getElementById("departureNow").addEventListener("click", () => {
    setDeparturePicker(new Date(Math.ceil(Date.now() / 300000) * 300000));
    recalculate();
  });
  document.getElementById("corridorWidth").addEventListener("change", (event) => {
    corridorWidthNm = event.target.value === "" ? null : Number(event.target.value);
    recalculate();
  });
  document.querySelectorAll(".fuel-options input").forEach((input) => input.addEventListener("change", () => { renderMarkers(); renderList(); }));
  document.getElementById("printBriefing").addEventListener("click", printBriefing);
  document.getElementById("weatherLayer").addEventListener("change", (event) => { if (event.target.checked) { weatherMarkers.addTo(map); loadWeather(); } else { weatherMarkers.remove(); showSelectedWeather(); } });
  map.on("zoomend", renderWeatherMarkers);
  map.on("moveend", () => { if (!document.querySelector(".leaflet-popup")) renderWeatherMarkers(); });
  document.querySelectorAll(".dock-group").forEach((group) => group.addEventListener("toggle", () => {
    if (group.open) document.querySelectorAll(".dock-group").forEach((other) => { if (other !== group) other.open = false; });
  }));
  document.querySelectorAll("[data-weather-mode]").forEach((button) => button.addEventListener("click", () => {
    weatherMode = weatherMode === button.dataset.weatherMode ? "" : button.dataset.weatherMode;
    document.querySelectorAll("[data-weather-mode]").forEach((option) => option.setAttribute("aria-pressed", String(option.dataset.weatherMode === weatherMode)));
    const enabled = Boolean(weatherMode);
    const layer = document.getElementById("weatherLayer");
    if (layer.checked !== enabled) { layer.checked = enabled; layer.dispatchEvent(new Event("change")); }
    else renderWeatherMarkers();
    const timeline = document.getElementById("tafTimeline");
    timeline.hidden = weatherMode !== "taf" || !activeTaf;
    if (!enabled) document.getElementById("weatherMeta").textContent = "Eine Stationsanzeige gleichzeitig. Marker öffnen, um METAR und TAF gemeinsam zu sehen.";
    else document.getElementById("weatherMeta").textContent = `${button.textContent} · METAR-Stationsbeobachtung · NOAA AWC · Marker öffnen: vollständiges METAR + TAF`;
  }));
  document.getElementById("webcamLayer").addEventListener("change", (event) => { if (event.target.checked) { webcamMarkers.addTo(map); loadWebcams(); } else webcamMarkers.remove(); });
  function updateTrafficSelection() {
    clearInterval(trafficTimer);
    const enabled = document.getElementById("flarmTraffic").checked || document.getElementById("adsbTraffic").checked;
    document.getElementById("trafficTools").classList.toggle("active", enabled);
    if (enabled) {
      trafficMarkers.addTo(map);
      loadTraffic();
      trafficTimer = setInterval(loadTraffic, 20000);
    } else {
      trafficMarkers.remove();
      trafficMarkers.clearLayers();
      document.getElementById("trafficStatus").textContent = "Unvollständige Abdeckung. Nicht zur Kollisionsvermeidung verwenden.";
    }
  }
  document.getElementById("flarmTraffic").addEventListener("change", updateTrafficSelection);
  document.getElementById("adsbTraffic").addEventListener("change", updateTrafficSelection);
  map.on("moveend", () => { if (map.hasLayer(trafficMarkers)) loadTraffic(); });
  function renderMeasurement() {
    measureLayer.clearLayers();
    const undo = document.getElementById("measureUndo");
    undo.hidden = !measuring || measurePoints.length === 0;
    let totalNm = 0;
    const speed = Number(document.getElementById("cruiseSpeed").value);
    const burn = Number(document.getElementById("fuelBurn").value);
    const fuelUnit = document.getElementById("fuelUnit").value;
    measurePoints.forEach((point, index) => {
      L.circleMarker(point, { radius: 5, color: "#0879aa", fillColor: "white", fillOpacity: 1, weight: 2 }).addTo(measureLayer);
      if (!index) return;
      const previous = measurePoints[index - 1];
      const nm = haversineNm(previous, point);
      totalNm += nm;
      const course = String(Math.round(bearing(previous, point)) % 360).padStart(3, "0");
      const minutes = speed > 0 ? Math.round(nm / speed * 60) : null;
      const fuel = speed > 0 && burn > 0 ? nm / speed * burn : null;
      const performance = minutes === null ? "" : `<br>${minutes} MIN @ ${Math.round(speed)} KT${fuel === null ? "" : ` · ${fuel.toFixed(1)} ${fuelUnit}`}`;
      L.polyline([previous, point], { color: "#0879aa", weight: 3, dashArray: "5 5" })
        .bindTooltip(`${nm.toFixed(1)} NM · ${course}°${performance}`, { permanent: true, direction: "center", className: "measure-label" })
        .addTo(measureLayer);
    });
    const totalMinutes = speed > 0 ? Math.round(totalNm / speed * 60) : null;
    document.getElementById("measureStatus").textContent = measurePoints.length > 1
      ? `Gesamt ${formatNm(totalNm)}${totalMinutes === null ? "" : ` · ${totalMinutes} min @ ${Math.round(speed)} kt`}`
      : measuring ? "Punkte auf der Karte wählen" : "";
  }
  map.on("click", (event) => {
    if (measuring) {
      measurePoints.push([event.latlng.lat, event.latlng.lng]);
      renderMeasurement();
      return;
    }
    if (pickIndex < 0) return;
    points[pickIndex].value = `${event.latlng.lat.toFixed(6)}, ${event.latlng.lng.toFixed(6)}`;
    pickIndex = -1;
    layerStatus.textContent = "";
    renderPointRows();
    recalculate();
  });
  map.on("contextmenu", (event) => {
    if (measuring) return;
    const coords = [event.latlng.lat, event.latlng.lng];
    const popup = L.popup({ maxWidth: 240 }).setLatLng(event.latlng).setContent('<div class="map-point-actions"><b>Punkt zur Route</b><button type="button" data-kind="start">Als Start</button><button type="button" data-kind="via">Als Überflugpunkt</button><button type="button" data-kind="stop">Als Landestopp</button><button type="button" data-kind="destination">Als Ziel</button></div>');
    popup.on("add", () => {
      popup.getElement().querySelectorAll("[data-kind]").forEach((button) => button.addEventListener("click", () => {
        const kind = button.dataset.kind;
        const value = `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
        if (kind === "start") points[0] = { kind, value };
        else if (kind === "destination") points[points.length - 1] = { kind, value };
        else points.splice(points.length - 1, 0, { kind, value });
        map.closePopup(popup);
        renderPointRows();
        recalculate();
      }));
    });
    popup.openOn(map);
  });
  document.getElementById("measureToggle").addEventListener("click", (event) => {
    measuring = !measuring;
    event.currentTarget.setAttribute("aria-pressed", String(measuring));
    event.currentTarget.classList.toggle("active", measuring);
    if (measuring) measurePoints = [];
    renderMeasurement();
  });
  document.getElementById("measureUndo").addEventListener("click", () => { measurePoints.pop(); renderMeasurement(); });
  const roundedNow = new Date(Math.ceil(Date.now() / 900000) * 900000);
  setDeparturePicker(roundedNow);
  refreshDatalist();
  renderPointRows();
  recalculate();
  window.addEventListener("vfr-places-loaded", () => { refreshDatalist(); recalculate(); });
  window.addEventListener("vfr-navigation-loaded", () => refreshDatalist());
  window.addEventListener("vfr-add-navigation-point", (event) => {
    points.splice(points.length - 1, 0, { kind: "via", value: navOption(event.detail) });
    renderPointRows();
    recalculate();
  });
  window.addEventListener("vfr-add-route-place", (event) => {
    const place = event.detail?.place;
    const kind = event.detail?.kind;
    if (!place || !["start", "via", "stop", "destination"].includes(kind)) return;
    const nextPoint = { kind, value: placeOption(place) };
    if (kind === "start") points[0] = nextPoint;
    else if (kind === "destination") points[points.length - 1] = nextPoint;
    else points.splice(points.length - 1, 0, nextPoint);
    renderPointRows();
    recalculate();
  });
  const updateMapDensity = () => document.getElementById("map").classList.toggle("compact-map", map.getZoom() < 10);
  map.on("zoomend", updateMapDensity);
  updateMapDensity();
})();
