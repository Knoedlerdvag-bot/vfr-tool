#!/usr/bin/env python3
"""VOR/DME/NDB table: OFMX (AIP-derived) for Germany and Italy, OurAirports for the remaining countries.

OFMX snapshots (ED, LI) are read for <Vor>, <Dme>, <Ndb>. A <Dme> that references a <Vor> is merged into
"VOR-DME"; DME without VOR stays "DME". OurAirports entries for DE/IT are dropped (they contained
decommissioned stations and missed e.g. STG Stuttgart).

Usage: python3 scripts/build_ofm_navaids.py [--airac 2611]
"""
import argparse
import io
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "data" / "navaids.json"
URL = "https://snapshots.openflightmaps.org/live/{airac}/ofmx/{region}/latest/ofmx_{region}.zip"
REGIONS = {"ED": "DE", "LI": "IT"}


def coordinate(value):
    number = float(value[:-1])
    return -number if value[-1].upper() in "SW" else number


def text(element, tag):
    child = element.find(tag)
    return (child.text or "").strip() if child is not None and child.text else ""


def read_region(region, airac):
    request = urllib.request.Request(URL.format(airac=airac, region=region.lower()), headers={"User-Agent": "flugschueler.de data builder"})
    with urllib.request.urlopen(request, timeout=120) as response:
        archive = zipfile.ZipFile(io.BytesIO(response.read()))
    member = f"ofmx_{region.lower()}/isolated/ofmx_{region.lower()}.ofmx"
    vors, dmes, ndbs = [], [], []
    with archive.open(member) as stream:
        for _, element in ET.iterparse(stream, events=("end",)):
            if element.tag not in ("Vor", "Dme", "Ndb"):
                continue
            uid = element.find({"Vor": "VorUid", "Dme": "DmeUid", "Ndb": "NdbUid"}[element.tag])
            if uid is None:
                element.clear()
                continue
            record = {"ident": text(uid, "codeId"), "lat": coordinate(text(uid, "geoLat")), "lon": coordinate(text(uid, "geoLong")),
                      "name": text(element, "txtName").title(), "freq": text(element, "valFreq"), "unit": text(element, "uomFreq")}
            if element.tag == "Dme":
                ref = element.find("VorUid")
                record["vor"] = text(ref, "codeId") if ref is not None else ""
                dmes.append(record)
            elif element.tag == "Vor":
                vors.append(record)
            else:
                ndbs.append(record)
            element.clear()
    return vors, dmes, ndbs


def build(airac):
    records = []
    for region, country in REGIONS.items():
        vors, dmes, ndbs = read_region(region, airac)
        paired = set()
        for vor in vors:
            has_dme = any(d["vor"] == vor["ident"] and abs(d["lat"] - vor["lat"]) < 0.02 and abs(d["lon"] - vor["lon"]) < 0.02 for d in dmes)
            if has_dme:
                paired.add(vor["ident"])
            try:
                khz = int(round(float(vor["freq"]) * 1000))
            except ValueError:
                khz = 0
            records.append({"id": f"ofmx-{region}-vor-{vor['ident']}", "ident": vor["ident"], "name": vor["name"],
                            "type": "VOR-DME" if has_dme else "VOR", "frequency_khz": khz, "lat": round(vor["lat"], 6),
                            "lon": round(vor["lon"], 6), "country": country})
        for dme in dmes:
            if dme["vor"] and dme["vor"] in paired:
                continue
            records.append({"id": f"ofmx-{region}-dme-{dme['ident']}", "ident": dme["ident"], "name": dme["name"], "type": "DME",
                            "frequency_khz": 0, "lat": round(dme["lat"], 6), "lon": round(dme["lon"], 6), "country": country})
        for ndb in ndbs:
            try:
                khz = int(round(float(ndb["freq"])))
            except ValueError:
                khz = 0
            records.append({"id": f"ofmx-{region}-ndb-{ndb['ident']}", "ident": ndb["ident"], "name": ndb["name"], "type": "NDB",
                            "frequency_khz": khz, "lat": round(ndb["lat"], 6), "lon": round(ndb["lon"], 6), "country": country})
    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--airac", type=int, required=True)
    args = parser.parse_args()
    old = json.loads(TARGET.read_text(encoding="utf-8"))
    kept = [n for n in old["navaids"] if n.get("country") not in set(REGIONS.values()) and not str(n.get("id", "")).startswith("ofmx-")]
    fresh = build(args.airac)
    payload = {
        "source": f"OpenFlightMaps OFMX AIRAC {args.airac} (DE, IT); OurAirports public-domain community data (AT, CH, FR); not an official aeronautical publication",
        "source_url": "https://openflightmaps.org/downloads/",
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "navaids": fresh + kept,
    }
    TARGET.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(len(fresh), "aus OFMX,", len(kept), "aus OurAirports ->", len(payload["navaids"]))


if __name__ == "__main__":
    main()
