#!/usr/bin/env python3
"""Build an attributed planning index of European VOR and NDB stations."""

import csv
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen


SOURCE = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/navaids.csv"
COUNTRIES = {"AT", "CH", "DE", "FR", "IT"}
TYPES = {"VOR", "VOR-DME", "VORTAC", "NDB", "NDB-DME"}
TARGET = Path(__file__).resolve().parents[1] / "data" / "navaids.json"


def build_records(rows):
    records = []
    for row in rows:
        if row["iso_country"] not in COUNTRIES or row["type"] not in TYPES:
            continue
        if not row["latitude_deg"] or not row["longitude_deg"]:
            continue
        frequency = row["frequency_khz"]
        if not frequency:
            continue
        records.append({
            "id": row["id"],
            "ident": row["ident"],
            "name": row["name"],
            "type": row["type"],
            "frequency_khz": int(frequency),
            "lat": round(float(row["latitude_deg"]), 6),
            "lon": round(float(row["longitude_deg"]), 6),
            "country": row["iso_country"],
        })
    return records


def main():
    request = Request(SOURCE, headers={"User-Agent": "VFR Italia data build (+https://flugschueler.de)"})
    with urlopen(request, timeout=40) as response:
        rows = csv.DictReader(io.TextIOWrapper(response, encoding="utf-8"))
        records = build_records(rows)
    payload = {
        "source": "OurAirports public-domain community data; not an official aeronautical publication",
        "source_url": "https://ourairports.com/data/",
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "navaids": records,
    }
    TARGET.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Wrote {len(records)} navigation aids to {TARGET}")


if __name__ == "__main__":
    main()
