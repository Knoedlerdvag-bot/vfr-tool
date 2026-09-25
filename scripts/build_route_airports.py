#!/usr/bin/env python3
"""Build a small, attributed ICAO lookup from the public-domain OurAirports CSV."""

import csv
import io
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen


SOURCE = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv"
COUNTRIES = {"AT", "BE", "CH", "CZ", "DE", "FR", "HR", "HU", "IT", "LU", "NL", "PL", "SI", "SK"}
TARGET = Path(__file__).resolve().parents[1] / "data" / "route-airports.json"


def main():
    request = Request(SOURCE, headers={"User-Agent": "VFR Italia data build (+https://flugschueler.de)"})
    with urlopen(request, timeout=40) as response:
        rows = csv.DictReader(io.TextIOWrapper(response, encoding="utf-8"))
        airports = [
            {
                "code": row["icao_code"] or row["gps_code"] or row["ident"],
                "name": row["name"],
                "lat": round(float(row["latitude_deg"]), 6),
                "lon": round(float(row["longitude_deg"]), 6),
                "country": row["iso_country"],
                "type": row["type"],
            }
            for row in rows
            if row["iso_country"] in COUNTRIES
            and re.fullmatch(r"[A-Z]{4}", row["icao_code"] or row["gps_code"] or row["ident"] or "")
            and row["latitude_deg"] and row["longitude_deg"]
            and row["type"] != "closed"
        ]
    payload = {"source": "OurAirports public-domain data", "source_url": "https://ourairports.com/data/", "airports": airports}
    TARGET.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Wrote {len(airports)} ICAO lookup records to {TARGET}")


if __name__ == "__main__":
    main()
