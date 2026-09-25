#!/usr/bin/env python3
"""Collect public ENAC/WebAAI avio-/idro-/elisuperfici register data.

The output is intentionally provenance-heavy. It is useful for a public VFR
orientation map, but it is not an operational flight briefing or chart mirror.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import re
import time
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


BASE = "https://webaai.it"
SOURCES = {
    "avio_idro": {
        "base_path": "/it/aviosuperfici-enac",
        "type": "field",
        "label": "Avio/Idrosuperficie",
        "query": "?ordinamento=nm",
    },
    "eli": {
        "base_path": "/it/elisuperfici-enac",
        "type": "helipad",
        "label": "Elisuperficie",
        "query": "",
    },
}
USER_AGENT = "VFR Italia data audit/0.1 (+https://flugschueler.de; public WebAAI pages only)"


@dataclass
class Place:
    source_kind: str
    type: str
    name: str
    region: str
    province: str | None
    municipality: str | None
    code: str | None
    status: str | None
    url: str
    last_updated: str | None
    enac_office: str | None
    dossier: str | None
    latitude: float | None
    longitude: float | None
    coordinates_text: str | None
    public_detail_available: bool
    notes: str | None


def fetch(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        raw = response.read()
    return raw.decode("utf-8", errors="replace")


def clean_text(value: str | None) -> str | None:
    if value is None:
        return None
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value).strip()
    return value or None


def absolute_url(path_or_url: str) -> str:
    if path_or_url.startswith("http"):
        return path_or_url
    return BASE + path_or_url


def discover_regions(index_html: str, base_path: str) -> list[str]:
    pattern = re.compile(rf'href=["\']{re.escape(base_path)}/([a-z0-9_]+)["\']', re.I)
    regions = sorted({m.group(1) for m in pattern.finditer(index_html)})
    return [region for region in regions if region not in {"it", "en"}]


def parse_list_page(page_html: str, base_path: str, source_kind: str, place_type: str, region: str) -> tuple[str | None, list[dict]]:
    update_match = re.search(r"Data ultimo aggiornamento:\s*([0-9]{2}-[0-9]{2}-[0-9]{4})", page_html)
    list_last_updated = update_match.group(1) if update_match else None
    rows = re.findall(r"<tr>\s*(.*?)\s*</tr>", page_html, re.S | re.I)
    items: list[dict] = []
    seen: set[str] = set()
    href_re = re.compile(rf"href=([\"']?)({re.escape(base_path)}/[^ >\"']+)\1", re.I)

    for row in rows:
        hrefs = href_re.findall(row)
        if not hrefs:
            continue
        href = hrefs[0][1]
        if href in seen:
            continue
        seen.add(href)
        name = clean_text(next(iter(re.findall(r'class=["\']lista-nomestruttura["\'][^>]*>(.*?)</div>', row, re.S | re.I)), None))
        info = clean_text(next(iter(re.findall(r'class=["\']lista-infostruttura["\'][^>]*>(.*?)</div>', row, re.S | re.I)), None))
        status = clean_text(next(iter(re.findall(r'<span[^>]*class=["\']set-14[^>]*>(.*?)</span>', row, re.S | re.I)), None))
        code = None
        municipality = None
        province = None
        if info:
            bracket = re.search(r"\[([^\]]+)\]", info)
            if bracket:
                region = bracket.group(1).strip()
            before_region = re.sub(r"\[[^\]]+\]", "", info).strip()
            # Avio rows often end with the Avioportolano code; heli rows do not.
            parts = before_region.split()
            if source_kind == "avio_idro" and parts:
                code = parts[-1] if re.match(r"^[A-Z]{1,3}[0-9]{1,3}$", parts[-1]) else None
                location_words = parts[:-1] if code else parts
            else:
                location_words = parts
            if len(location_words) >= 2:
                municipality = location_words[0]
                province = " ".join(location_words[1:])
            elif location_words:
                municipality = location_words[0]
        if not code:
            code_match = re.search(r"_([A-Z]{1,3}[0-9]{1,3})$", href)
            code = code_match.group(1) if code_match else None
        items.append(
            {
                "source_kind": source_kind,
                "type": place_type,
                "name": name or href.rsplit("/", 1)[-1].rsplit("_", 1)[0].replace("-", " ").title(),
                "region": region,
                "province": province,
                "municipality": municipality,
                "code": code,
                "status": status,
                "url": absolute_url(href),
                "list_last_updated": list_last_updated,
            }
        )
    return list_last_updated, items


def dms_to_decimal(degrees: str, minutes: str, seconds: str, hemisphere: str) -> float:
    sec = float(seconds.replace(",", "."))
    value = float(degrees) + float(minutes) / 60 + sec / 3600
    if hemisphere.upper() in {"S", "W"}:
        value *= -1
    return round(value, 8)


def parse_detail_page(detail_html: str) -> dict:
    general = re.search(r'<div class="conter-accord">(.*?)</div><!-- CHIUDO CONTER-ACCORD-->', detail_html, re.S | re.I)
    general_html = general.group(1) if general else detail_html
    plain = clean_text(general_html) or ""

    def field(label: str) -> str | None:
        match = re.search(rf"{re.escape(label)}:\s*(.*?)(?:Ultimo aggiornamento:|ENAC Direzione|Numero di|Regione:|Provincia:|Comune:|CAP:|Località:|Coordinate|Uso per attività|$)", plain, re.I)
        return clean_text(match.group(1)) if match else None

    coord_match = re.search(
        r"([0-9]{1,2})°\s*([0-9]{1,2})'([0-9]{1,2}(?:[,.][0-9]+)?)\"\s*([NS])\s*-\s*([0-9]{1,3})°\s*([0-9]{1,2})'([0-9]{1,2}(?:[,.][0-9]+)?)\"\s*([EW])",
        general_html,
        re.I,
    )
    latitude = longitude = None
    coordinates_text = None
    if coord_match:
        latitude = dms_to_decimal(coord_match.group(1), coord_match.group(2), coord_match.group(3), coord_match.group(4))
        longitude = dms_to_decimal(coord_match.group(5), coord_match.group(6), coord_match.group(7), coord_match.group(8))
        coordinates_text = clean_text(coord_match.group(0))

    updated = field("Ultimo aggiornamento")
    enac_office = field("ENAC Direzione Territoriale di competenza")
    dossier = field("Fascicolo")
    public_detail_available = bool(coord_match or updated or dossier)
    notes = None
    if "Registrati per visualizzare le informazioni" in detail_html or "disponibili solo agli utenti registrati" in detail_html:
        notes = "Additional map/contact/service/media/obstacle details require free WebAAI registration."

    return {
        "last_updated": updated,
        "enac_office": enac_office,
        "dossier": dossier,
        "region": field("Regione"),
        "province": field("Provincia"),
        "municipality": field("Comune"),
        "latitude": latitude,
        "longitude": longitude,
        "coordinates_text": coordinates_text,
        "public_detail_available": public_detail_available,
        "notes": notes,
    }


def scan(fetch_details: bool, delay: float) -> dict:
    collected: list[Place] = []
    errors: list[dict] = []
    regions_by_source: dict[str, list[str]] = {}

    for source_kind, cfg in SOURCES.items():
        base_path = cfg["base_path"]
        index_url = absolute_url(base_path)
        index_html = fetch(index_url)
        regions = discover_regions(index_html, base_path)
        regions_by_source[source_kind] = regions

        for region in regions:
            region_url = absolute_url(f"{base_path}/{region}{cfg['query']}")
            try:
                region_html = fetch(region_url)
                _, items = parse_list_page(region_html, base_path, source_kind, cfg["type"], region)
            except (urllib.error.URLError, TimeoutError) as exc:
                errors.append({"url": region_url, "error": str(exc)})
                continue

            for item in items:
                detail = {
                    "last_updated": item["list_last_updated"],
                    "enac_office": None,
                    "dossier": None,
                    "latitude": None,
                    "longitude": None,
                    "coordinates_text": None,
                    "public_detail_available": False,
                    "notes": None,
                }
                if fetch_details:
                    try:
                        detail = parse_detail_page(fetch(item["url"]))
                        if delay:
                            time.sleep(delay)
                    except (urllib.error.URLError, TimeoutError) as exc:
                        errors.append({"url": item["url"], "error": str(exc)})
                collected.append(
                    Place(
                        source_kind=item["source_kind"],
                        type=item["type"],
                        name=item["name"],
                        region=detail.get("region") or item["region"],
                        province=detail.get("province") or item["province"],
                        municipality=detail.get("municipality") or item["municipality"],
                        code=item["code"],
                        status=item["status"],
                        url=item["url"],
                        last_updated=detail["last_updated"] or item["list_last_updated"],
                        enac_office=detail["enac_office"],
                        dossier=detail["dossier"],
                        latitude=detail["latitude"],
                        longitude=detail["longitude"],
                        coordinates_text=detail["coordinates_text"],
                        public_detail_available=detail["public_detail_available"],
                        notes=detail["notes"],
                    )
                )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": {
            "name": "WebAAI / ENAC public avio-idro-elisuperfici pages",
            "official_publication_note": "WebAAI states that, under the ENAC/Avioportolano agreement, official publication of avio-idro-elisuperfici data happens through the WebAAI portal; operator/PPR/current checks remain required.",
            "urls": {
                "home_enac": "https://webaai.it/it/home-enac",
                "avio_idro": "https://webaai.it/it/aviosuperfici-enac",
                "eli": "https://webaai.it/it/elisuperfici-enac",
            },
        },
        "regions_by_source": regions_by_source,
        "places": [asdict(place) for place in collected],
        "errors": errors,
    }


def write_outputs(payload: dict, json_path: Path, csv_path: Path) -> None:
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    fieldnames = list(payload["places"][0].keys()) if payload["places"] else []
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(payload["places"])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-details", action="store_true", help="Only scan regional lists; skip detail pages and coordinates.")
    parser.add_argument("--delay", type=float, default=0.05, help="Delay between detail page requests.")
    parser.add_argument("--json", default="data/webaai-public-scan.json")
    parser.add_argument("--csv", default="data/webaai-public-scan.csv")
    args = parser.parse_args()

    payload = scan(fetch_details=not args.no_details, delay=args.delay)
    write_outputs(payload, Path(args.json), Path(args.csv))

    with_coords = sum(1 for place in payload["places"] if place["latitude"] is not None and place["longitude"] is not None)
    print(f"places={len(payload['places'])}")
    print(f"with_coordinates={with_coords}")
    print(f"errors={len(payload['errors'])}")
    for source_kind, regions in payload["regions_by_source"].items():
        print(f"{source_kind}_regions={len(regions)}")


if __name__ == "__main__":
    main()
