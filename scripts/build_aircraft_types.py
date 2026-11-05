#!/usr/bin/env python3
"""Build compact aircraft lookup tables from the OpenSky aircraft metadata dataset.

Source: https://s3.opensky-network.org/data-samples/metadata/aircraftDatabase.csv
(OpenSky Network, public dataset – Quelle im Produkt nennen.)

Outputs
  data/aircraft-types.json    {TYPECODE: "L1P"}  (ICAO-Klasse: Art/Triebwerke/Antrieb)
  data/type-names.json        {TYPECODE: "CESSNA 172 Skyhawk"}  (separat gepflegt, hier nicht überschrieben)
  data/hex-types.json.gz      {icao24: TYPECODE}  (nur Einträge mit Typcode)

Usage: python3 scripts/build_aircraft_types.py [pfad/zur/aircraftDatabase.csv]
"""
import collections
import csv
import gzip
import json
import sys
import tempfile
import urllib.request
from pathlib import Path

URL = "https://s3.opensky-network.org/data-samples/metadata/aircraftDatabase.csv"
DATA = Path(__file__).resolve().parent.parent / "data"


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if source is None:
        source = Path(tempfile.mkdtemp()) / "aircraftDatabase.csv"
        print("Lade", URL)
        urllib.request.urlretrieve(URL, source)
    classes = collections.defaultdict(collections.Counter)
    hex_types = {}
    with open(source, encoding="utf-8", errors="replace", newline="") as handle:
        for row in csv.DictReader(handle):
            code = (row.get("typecode") or "").strip().upper()
            icao24 = (row.get("icao24") or "").strip().lower()
            if not code or len(icao24) != 6:
                continue
            hex_types[icao24] = code
            if row.get("icaoaircrafttype"):
                classes[code][row["icaoaircrafttype"].strip()] += 1
    types = {code: (classes[code].most_common(1)[0][0] if classes[code] else "") for code in set(hex_types.values())}
    (DATA / "aircraft-types.json").write_text(json.dumps(types, separators=(",", ":")), encoding="utf-8")
    with gzip.open(DATA / "hex-types.json.gz", "wt", encoding="utf-8", compresslevel=9) as out:
        json.dump(hex_types, out, separators=(",", ":"))
    print(len(types), "Typcodes,", len(hex_types), "Flugzeugadressen")


if __name__ == "__main__":
    main()
