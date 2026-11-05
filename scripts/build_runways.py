#!/usr/bin/env python3
"""Compact runway table (DE/AT/CH/IT region) from OurAirports (public domain).

Source: https://ourairports.com/data/  (airports.csv + runways.csv, Public Domain)
Output: data/runways.json
  {"source", "generated", "airports": [[ident, lat, lon, elevation_ft, [[le, he, length_ft, width_ft, surface, heading_true], ...]], ...]}
Surface codes: A Asphalt · C Beton · G Gras · R Schotter · D Erde · S Sand · P sonstig befestigt · U unbekannt
Quelle ist KEINE amtliche AIP-Angabe – Anzeige immer mit Hinweis „AIP maßgeblich".

Usage: python3 scripts/build_runways.py [airports.csv runways.csv]
"""
import csv
import json
import sys
import urllib.request
from datetime import date
from pathlib import Path

BASE = "https://davidmegginson.github.io/ourairports-data/"
DATA = Path(__file__).resolve().parent.parent / "data"
BBOX = (36.0, 5.0, 56.0, 19.5)  # south, west, north, east
SKIP_TYPES = {"heliport", "closed", "balloonport"}


def surface_code(value):
    text = (value or "").strip().lower()
    if not text or text in ("unk", "unknown", "u"):
        return "U"
    if any(key in text for key in ("asp", "bit", "tarmac", "tar", "blacktop")):
        return "A"
    if any(key in text for key in ("con", "cem", "beton")):
        return "C"
    if any(key in text for key in ("gras", "grs", "turf", "sod", "veg")):
        return "G"
    if any(key in text for key in ("gvl", "grv", "gravel", "cora", "macadam", "stone", "rock", "cinder")):
        return "R"
    if any(key in text for key in ("dirt", "earth", "soil", "clay", "loam", "ground", "compacted", "gro", "mud")):
        return "D"
    if "sand" in text or "snd" in text:
        return "S"
    if any(key in text for key in ("pem", "pav", "pc", "psp", "steel", "mat", "brick", "paved", "treated")):
        return "P"
    return "U"


def read(name, local):
    if local:
        return open(local, encoding="utf-8", newline="")
    request = urllib.request.Request(BASE + name, headers={"User-Agent": "flugschueler.de data builder"})
    return open_from(urllib.request.urlopen(request, timeout=90))


def open_from(response):
    import io
    return io.StringIO(response.read().decode("utf-8", "replace"), newline="")


def number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def main():
    local_airports = sys.argv[1] if len(sys.argv) > 2 else None
    local_runways = sys.argv[2] if len(sys.argv) > 2 else None
    airports = {}
    for row in csv.DictReader(read("airports.csv", local_airports)):
        lat, lon = number(row["latitude_deg"]), number(row["longitude_deg"])
        if lat is None or lon is None or row["type"] in SKIP_TYPES:
            continue
        if not (BBOX[0] <= lat <= BBOX[2] and BBOX[1] <= lon <= BBOX[3]):
            continue
        airports[row["id"]] = {"ident": row["ident"], "lat": round(lat, 5), "lon": round(lon, 5),
                               "elev": int(number(row["elevation_ft"]) or 0), "rwy": []}
    for row in csv.DictReader(read("runways.csv", local_runways)):
        airport = airports.get(row["airport_ref"])
        if not airport or row.get("closed") == "1":
            continue
        length = number(row["length_ft"])
        if not length:
            continue
        heading = number(row["le_heading_degT"])
        if heading is None:
            heading = number(row["he_heading_degT"])
            heading = (heading + 180) % 360 if heading is not None else None
        airport["rwy"].append([row["le_ident"], row["he_ident"], int(length), int(number(row["width_ft"]) or 0),
                               surface_code(row["surface"]), None if heading is None else round(heading)])
    result = [[a["ident"], a["lat"], a["lon"], a["elev"], sorted(a["rwy"], key=lambda r: -r[2])]
              for a in airports.values() if a["rwy"]]
    payload = {"source": "OurAirports (Public Domain)", "source_url": "https://ourairports.com/data/",
               "generated": date.today().isoformat(), "airports": result}
    (DATA / "runways.json").write_text(json.dumps(payload, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    print(len(result), "Flugplätze mit Pistendaten")


if __name__ == "__main__":
    main()
