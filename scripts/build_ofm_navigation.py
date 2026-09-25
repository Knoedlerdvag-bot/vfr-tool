#!/usr/bin/env python3
"""Build a compact VFR reporting-point index from OpenFlightMaps OFMX snapshots."""

from __future__ import annotations

import argparse
import io
import json
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from datetime import date, timedelta
from pathlib import Path


REGIONS = ("ED", "LI")
SOURCE_TEMPLATE = "https://snapshots.openflightmaps.org/live/{airac}/ofmx/{region}/latest/ofmx_{region}.zip"


def current_airac(today: date | None = None) -> int:
    today = today or date.today()
    cycle = date(2003, 1, 23)
    count_this_year = 0
    count_last_year = 0
    year = today.year
    while cycle < today:
        if cycle.year == year - 1:
            count_last_year += 1
        if cycle.year == year:
            count_this_year += 1
        cycle += timedelta(days=28)
    if count_this_year == 0:
        year -= 1
        count_this_year = count_last_year
    return int(str(year)[-2:]) * 100 + count_this_year


def coordinate(value: str | None) -> float:
    if not value:
        raise ValueError("missing coordinate")
    direction = value[-1].upper()
    number = float(value[:-1])
    return -number if direction in {"S", "W"} else number


def read_region(region: str, airac: int) -> list[dict]:
    url = SOURCE_TEMPLATE.format(airac=airac, region=region.lower())
    request = urllib.request.Request(url, headers={"User-Agent": "flugschueler.de VFR data builder"})
    with urllib.request.urlopen(request, timeout=60) as response:
        archive = zipfile.ZipFile(io.BytesIO(response.read()))
    member = f"ofmx_{region.lower()}/isolated/ofmx_{region.lower()}.ofmx"
    points: list[dict] = []
    with archive.open(member) as stream:
        for _, element in ET.iterparse(stream, events=("end",)):
            if element.tag != "Dpn":
                continue
            uid = element.find("DpnUid")
            if uid is None:
                element.clear()
                continue
            raw_ident = (uid.findtext("codeId") or "").strip()
            ident, _, inline_name = raw_ident.partition("=")
            point_type = (element.findtext("codeType") or "VFR-RP").strip()
            name = (element.findtext("txtName") or inline_name or ident).strip()
            airport = element.find("AhpUidAssoc")
            airport_code = (airport.findtext("codeId") or "").strip() if airport is not None else ""
            try:
                lat = coordinate(uid.findtext("geoLat"))
                lon = coordinate(uid.findtext("geoLong"))
            except ValueError:
                element.clear()
                continue
            if ident:
                points.append({
                    "ident": ident,
                    "name": name,
                    "type": point_type,
                    "lat": round(lat, 7),
                    "lon": round(lon, 7),
                    "country": region,
                    "airport_code": airport_code,
                })
            element.clear()
    return points


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--airac", type=int, default=current_airac())
    parser.add_argument("--output", type=Path, default=Path("data/navigation-points.json"))
    args = parser.parse_args()

    points: list[dict] = []
    sources: list[str] = []
    for region in REGIONS:
        points.extend(read_region(region, args.airac))
        sources.append(SOURCE_TEMPLATE.format(airac=args.airac, region=region.lower()))

    unique: dict[tuple, dict] = {}
    for point in points:
        key = (point["ident"], point["lat"], point["lon"])
        unique[key] = point
    output = {
        "source": "OpenFlightMaps OFMX",
        "source_url": "https://openflightmaps.org/downloads/",
        "airac": args.airac,
        "regions": list(REGIONS),
        "scope": "VFR reporting and en-route points from the published ED and LI OFMX snapshots",
        "download_urls": sources,
        "points": sorted(unique.values(), key=lambda item: (item["country"], item["ident"], item["lat"], item["lon"])),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {len(output['points'])} points for AIRAC {args.airac} to {args.output}")


if __name__ == "__main__":
    main()
