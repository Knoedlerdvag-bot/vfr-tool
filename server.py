#!/usr/bin/env python3
"""Serve VFR Italia and cache aviation weather/OGN traffic for same-origin clients."""

import argparse
import json
import math
import os
import re
import socket
import threading
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.error import HTTPError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
USER_AGENT = "VFR Italia/0.1 (+https://flugschueler.de; contact via website)"
WEATHER_URL = "https://aviationweather.gov/api/data/metar?bbox=35,5,51,20&format=json"
DDB_URL = "https://ddb.glidernet.org/download/?j=1"
GEOCODER_URL = "https://nominatim.openstreetmap.org/search"
ADSB_URL = "https://api.adsb.lol/v2/point"
ROUTE_AIRPORTS = json.loads((ROOT / "data" / "route-airports.json").read_text(encoding="utf-8"))["airports"]
cache = {}
cache_lock = threading.Lock()
geocoder_lock = threading.Lock()
last_geocoder_request = 0.0
ogn_positions = {}
ogn_lock = threading.Lock()
ogn_started = False
ogn_error = ""


def fetch_json(url):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=18) as response:
        if response.status == 204:
            return []
        return json.load(response)


def cached_json(key, url, max_age):
    with cache_lock:
        item = cache.get(key)
        if item and time.time() - item[0] < max_age:
            return item[1]
    data = fetch_json(url)
    with cache_lock:
        cache[key] = (time.time(), data)
    return data


def ddb_devices():
    payload = cached_json("ddb", DDB_URL.replace("j=1", "j=1&t=1"), 3600)
    return {(item.get("device_type"), item.get("device_id")): item for item in payload.get("devices", [])}


def resolve_query(query):
    global last_geocoder_request
    code = query.upper()
    if re.fullmatch(r"[A-Z]{4}", code):
        airport = next((item for item in ROUTE_AIRPORTS if item["code"] == code), None)
        if airport:
            return [{**airport, "label": f'{code} · {airport["name"]}', "source": "OurAirports", "kind": "airport"}]
    with cache_lock:
        item = cache.get("geocode:" + query.casefold())
        if item and time.time() - item[0] < 86400:
            return item[1]
    params = urlencode({"q": query, "format": "jsonv2", "limit": 5, "addressdetails": 1,
                        "countrycodes": "it,de,at,ch,si,fr,hr,cz,hu,sk,pl,be,nl,lu"})
    with geocoder_lock:
        delay = max(0, 1.1 - (time.monotonic() - last_geocoder_request))
        if delay:
            time.sleep(delay)
        last_geocoder_request = time.monotonic()
        results = fetch_json(f"{GEOCODER_URL}?{params}")
    choices = [{"name": item.get("name") or item["display_name"].split(",")[0],
                "label": item["display_name"], "code": "", "lat": float(item["lat"]),
                "lon": float(item["lon"]), "source": "OpenStreetMap / Nominatim", "kind": item.get("type", "place")}
               for item in results]
    with cache_lock:
        cache["geocode:" + query.casefold()] = (time.time(), choices)
    return choices


def navigation_fixes(bounds):
    """Read small viewport tiles to stay under AWC's 400-record response limit."""
    south, west, north, east = bounds
    if not (35 <= south < north <= 56 and 3 <= west < east <= 20 and north - south <= 5 and east - west <= 5):
        raise ValueError("Kartenausschnitt zum Laden der Fixes verkleinern")
    fixes = {}
    limited = False
    lat = int(south)
    while lat < north:
        lon = int(west)
        while lon < east:
            tile = (max(south, lat), max(west, lon), min(north, lat + 1), min(east, lon + 1))
            key = "fix:" + ",".join(f"{value:.4f}" for value in tile)
            url = "https://aviationweather.gov/api/data/fix?" + urlencode({"bbox": ",".join(f"{value:.4f}" for value in tile), "format": "json"})
            records = cached_json(key, url, 12 * 3600)
            if not isinstance(records, list):
                records = []
            limited = limited or len(records) >= 400
            for item in records:
                ident = str(item.get("id") or "").upper()
                if not re.fullmatch(r"[A-Z0-9]{5}", ident):
                    continue
                try:
                    latitude, longitude = float(item["lat"]), float(item["lon"])
                except (KeyError, TypeError, ValueError):
                    continue
                fixes[(ident, latitude, longitude)] = {"ident": ident, "name": ident, "lat": latitude, "lon": longitude, "type": "GPS / RNAV"}
            lon += 1
        lat += 1
    return {"fixes": list(fixes.values()), "source": "NOAA Aviation Weather Center", "source_url": "https://aviationweather.gov/data/api/", "limited": limited}


BEACON_RE = re.compile(r"^([A-Z]{3})([A-F0-9]{6})>.*?([0-8]\d)([0-5]\d\.\d+)([NS])[/\\]([0-1]\d{2})([0-5]\d\.\d+)([EW])")
COURSE_SPEED_RE = re.compile(r"(\d{3})/(\d{3})")
ALTITUDE_RE = re.compile(r"/A=(\d{6})")

FIXED_WING_MODEL_RE = re.compile(
    r"\b(WT[\s-]?9|DYNAMIC|A[\s-]?22|FOXBAT|R[\s-]?3000?|C[\s-]?\d{3}|PA[\s-]?\d{2}|"
    r"DA[\s-]?\d{2}|SR[\s-]?2[02]|P[\s-]?200\d|DV[\s-]?20|FK[\s-]?9|CTSW|CTLS)\b", re.I)
GLIDER_MODEL_RE = re.compile(r"\b(ASW|ASK|DG[\s-]?\d|LS[\s-]?\d|JS[\s-]?\d|DUO|VENTUS|DISCUS|ARCUS)\b", re.I)
HELICOPTER_MODEL_RE = re.compile(
    r"\b(AS[\s-]?(350|50)|EC[\s-]?(35|45|120|130|135|145)|H[\s-]?(120|125|130|135|145|160|175)|"
    r"R[\s-]?(22|44|66)|AW[\s-]?\d{3}|B[\s-]?(06|407|412|429)|CABRI|GUIMBAL)\b", re.I)


def classify_aircraft(model, reported_category="aircraft"):
    """Prefer an identified model over unreliable/self-declared traffic categories."""
    value = str(model or "").strip()
    if FIXED_WING_MODEL_RE.search(value):
        return "plane"
    if GLIDER_MODEL_RE.search(value):
        return "glider"
    if HELICOPTER_MODEL_RE.search(value):
        return "helicopter"
    return reported_category


def parse_beacon(line, devices):
    match = BEACON_RE.match(line)
    if not match:
        return None
    prefix, device_id, lat_deg, lat_min, ns, lon_deg, lon_min, ew = match.groups()
    device_type = {"FLR": "F", "ICA": "I", "OGN": "O"}.get(prefix)
    device = devices.get((device_type, device_id))
    if not device or device.get("tracked") != "Y":
        return None
    latitude = int(lat_deg) + float(lat_min) / 60
    longitude = int(lon_deg) + float(lon_min) / 60
    if ns == "S":
        latitude = -latitude
    if ew == "W":
        longitude = -longitude
    if not (35 <= latitude <= 51 and 5 <= longitude <= 20):
        return None
    identified = device.get("identified") == "Y"
    aircraft_type = str(device.get("aircraft_type") or "")
    category = {"1": "glider", "2": "plane", "3": "helicopter", "6": "paraglider", "7": "parachute", "8": "plane", "9": "plane"}.get(aircraft_type, "aircraft")
    label = (device.get("registration") or device.get("cn") or "").strip() if identified else ""
    remainder = line[match.end():]
    course_speed = COURSE_SPEED_RE.search(remainder)
    altitude = ALTITUDE_RE.search(remainder)
    model = str(device.get("aircraft_model") or "")[:48] if identified else ""
    category = classify_aircraft(model, category)
    return (prefix, device_id), {"lat": round(latitude, 5), "lon": round(longitude, 5),
                                  "observed_at": time.time(), "label": label[:24], "category": category,
                                  "model": model, "device_id": device_id,
                                  "track_deg": int(course_speed[1]) if course_speed else None,
                                  "speed_kt": int(course_speed[2]) if course_speed else None,
                                  "altitude_ft": int(altitude[1]) if altitude else None}


def ogn_worker():
    global ogn_error
    while True:
        try:
            devices = ddb_devices()
            last_ddb = time.time()
            with socket.create_connection(("aprs.glidernet.org", 14580), timeout=15) as connection:
                connection.settimeout(300)
                connection.sendall(b"user VFRItalia pass -1 vers VFRItalia 0.1 filter a/51/5/35/20\n")
                ogn_error = ""
                last_keepalive = time.monotonic()
                for raw in connection.makefile("rb"):
                    if time.time() - last_ddb > 3600:
                        devices = ddb_devices()
                        last_ddb = time.time()
                    if raw.startswith(b"#"):
                        continue
                    parsed = parse_beacon(raw.decode("ascii", errors="ignore"), devices)
                    if parsed:
                        with ogn_lock:
                            ogn_positions[parsed[0]] = parsed[1]
                    if time.monotonic() - last_keepalive >= 180:
                        connection.sendall(b"# VFR Italia keepalive\n")
                        last_keepalive = time.monotonic()
        except Exception as exc:
            if isinstance(exc, HTTPError) and exc.code == 429:
                ogn_error = "Gerätedatenbank drosselt Anfragen; Verkehr bleibt aus Datenschutzgründen ausgeblendet"
                time.sleep(300)
            else:
                ogn_error = f"OGN-Verbindung nicht verfügbar: {exc}"
                time.sleep(60)


def start_ogn():
    global ogn_started
    with ogn_lock:
        if not ogn_started:
            ogn_started = True
            threading.Thread(target=ogn_worker, daemon=True).start()


def distance_nm(first, second):
    lat1, lon1 = map(math.radians, first)
    lat2, lon2 = map(math.radians, second)
    delta_lat, delta_lon = lat2 - lat1, lon2 - lon1
    value = math.sin(delta_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    return 3440.065 * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


def normalize_adsb_aircraft(aircraft):
    if aircraft.get("ground") is True or str(aircraft.get("alt_baro", "")).lower() == "ground":
        return None
    try:
        latitude, longitude = float(aircraft["lat"]), float(aircraft["lon"])
        age = float(aircraft.get("seen_pos", 1000))
        if not (math.isfinite(latitude) and math.isfinite(longitude) and 0 <= age <= 60):
            return None
    except (KeyError, TypeError, ValueError):
        return None
    model = str(aircraft.get("t") or "").strip()[:48]
    category_code = str(aircraft.get("category") or "")
    if category_code == "A7":
        category = "helicopter"
    elif category_code == "B1":
        category = "glider"
    elif category_code == "B3":
        category = "parachute"
    else:
        category = "plane"
    category = classify_aircraft(model, category)
    altitude = aircraft.get("alt_baro")
    try:
        altitude = round(float(altitude)) if altitude is not None else None
    except (TypeError, ValueError):
        altitude = None
    def optional_number(name):
        try:
            value = float(aircraft[name])
            return round(value) if math.isfinite(value) else None
        except (KeyError, TypeError, ValueError):
            return None
    return {"lat": latitude, "lon": longitude, "label": str(aircraft.get("r") or aircraft.get("flight") or "").strip()[:24],
            "category": category, "model": model, "hex": str(aircraft.get("hex") or "").upper(),
            "altitude_ft": altitude, "speed_kt": optional_number("gs"), "track_deg": optional_number("track"),
            "age_sec": round(age)}


def traffic_in_area(lat, lon, radius, source):
    if source not in ("flarm", "adsb", "both"):
        raise ValueError("Ungültige Verkehrsauswahl")
    if not (35 <= lat <= 56 and -6 <= lon <= 22 and 1 <= radius <= 250):
        raise ValueError("Kartenausschnitt außerhalb des Verkehrsgebiets")
    result = []
    errors = []
    if source in ("flarm", "both"):
        start_ogn()
        now = time.time()
        with ogn_lock:
            for key in list(ogn_positions):
                if now - ogn_positions[key]["observed_at"] > 90:
                    del ogn_positions[key]
            result.extend({**item, "age_sec": round(now - item["observed_at"])} for item in ogn_positions.values()
                          if distance_nm((lat, lon), (item["lat"], item["lon"])) <= radius)
        if ogn_error:
            errors.append("Segelflugsignale derzeit nicht verfügbar")
    if source in ("adsb", "both"):
        key = f"adsb:{round(lat, 1)}:{round(lon, 1)}:{round(radius / 10) * 10}"
        url = f"{ADSB_URL}/{lat:.2f}/{lon:.2f}/{math.ceil(radius)}"
        try:
            payload = cached_json(key, url, 20)
            for aircraft in payload.get("ac", []):
                item = normalize_adsb_aircraft(aircraft)
                if item and distance_nm((lat, lon), (item["lat"], item["lon"])) <= radius:
                    result.append(item)
        except Exception:
            errors.append("ADS-B-Signale derzeit nicht verfügbar")
    unique = []
    for item in sorted(result, key=lambda position: (bool(position.get("hex")), -position.get("age_sec", 999)), reverse=True):
        duplicate = next((previous for previous in unique if (
            (item.get("device_id") and item["device_id"] == previous.get("hex")) or
            (previous.get("device_id") and previous["device_id"] == item.get("hex")) or
            (item.get("label") and item["label"].upper() == previous.get("label", "").upper() and
             distance_nm((item["lat"], item["lon"]), (previous["lat"], previous["lon"])) < 1.5)
        )), None)
        if not duplicate:
            unique.append(item)
    public = [{key: value for key, value in item.items() if key not in ("hex", "device_id", "observed_at")}
              for item in unique]
    return {"positions": public, "status": "; ".join(errors) if errors else "connected"}


class Handler(SimpleHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/fixes":
            raw = parse_qs(parsed.query).get("bbox", [""])[0]
            try:
                parts = [float(part) for part in raw.split(",")]
                if len(parts) != 4:
                    raise ValueError("Vier Koordinaten für den Kartenausschnitt erforderlich")
                self.send_json(200, navigation_fixes(parts))
            except ValueError as exc:
                self.send_json(400, {"error": str(exc)})
            except Exception as exc:
                self.send_json(503, {"error": str(exc)})
            return
        if parsed.path == "/api/resolve":
            query = parse_qs(parsed.query).get("q", [""])[0].strip()
            if not 2 <= len(query) <= 100 or any(char in query for char in "<>\n\r"):
                self.send_json(400, {"error": "Ort oder ICAO-Code eingeben"})
                return
            try:
                self.send_json(200, {"results": resolve_query(query)})
            except Exception as exc:
                self.send_json(503, {"error": str(exc)})
            return
        if parsed.path == "/api/weather":
            try:
                reports = cached_json("metar", WEATHER_URL, 300)
                self.send_json(200, {"reports": reports, "source": "NOAA Aviation Weather Center"})
            except Exception as exc:
                self.send_json(503, {"error": str(exc)})
            return
        if parsed.path == "/api/taf":
            icao = parse_qs(parsed.query).get("icao", [""])[0].upper()
            if not re.fullmatch(r"[A-Z]{4}", icao):
                self.send_json(400, {"error": "ICAO code required"})
                return
            try:
                taf = cached_json("taf:" + icao, f"https://aviationweather.gov/api/data/taf?ids={icao}&format=json", 600)
                self.send_json(200, {"reports": taf, "source": "NOAA Aviation Weather Center"})
            except Exception as exc:
                self.send_json(503, {"error": str(exc)})
            return
        if parsed.path == "/api/traffic":
            params = parse_qs(parsed.query)
            try:
                lat = float(params.get("lat", ["46.5"])[0])
                lon = float(params.get("lon", ["10.5"])[0])
                radius = float(params.get("radius", ["150"])[0])
                source = params.get("source", ["both"])[0]
                self.send_json(200, traffic_in_area(lat, lon, radius, source))
            except (ValueError, OverflowError) as exc:
                self.send_json(400, {"error": str(exc)})
            return
        super().do_GET()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 4178)))
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), partial(Handler, directory=str(ROOT)))
    print(f"VFR Italia: http://{args.host}:{args.port}/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
