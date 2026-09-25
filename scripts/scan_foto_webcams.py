#!/usr/bin/env python3
"""Import camera positions and viewing directions from foto-webcam.eu's public info page."""

import argparse
import json
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen


SOURCE = "https://www.foto-webcam.eu/webcam/infos/"
OVERVIEW = "https://www.foto-webcam.eu/"
ROOT = Path(__file__).resolve().parents[1]


class CameraParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.records = []
        self.current = None
        self.in_title = False
        self.text_parts = []

    def finish_record(self):
        if not self.current:
            return
        text = " ".join(self.text_parts)
        direction = re.search(r"Richtung:\s*(\d{1,3})\s*°", text)
        self.current["direction_deg"] = int(direction.group(1)) if direction else None
        if self.current.get("url") and self.current.get("latitude") is not None:
            lat = self.current["latitude"]
            lon = self.current["longitude"]
            if 35 <= lat <= 51 and 5 <= lon <= 20:
                self.records.append(self.current)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h2":
            self.finish_record()
            self.current = {"name": "", "url": None, "latitude": None, "longitude": None}
            self.text_parts = []
            self.in_title = True
        if not self.current:
            return
        href = attrs.get("href", "")
        if tag == "a" and href.startswith("https://www.foto-webcam.eu/webcam/"):
            match = re.fullmatch(r"https://www\.foto-webcam\.eu/webcam/([^/]+)/", href)
            if match:
                self.current["url"] = href
                self.current["slug"] = match.group(1)
        if tag == "a" and "maps.google.de?q=" in href:
            match = re.search(r"q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)", href)
            if match:
                self.current["latitude"] = float(match.group(1))
                self.current["longitude"] = float(match.group(2))

    def handle_endtag(self, tag):
        if tag == "h2":
            self.in_title = False

    def handle_data(self, data):
        if not self.current:
            return
        if self.in_title:
            self.current["name"] += data.strip()
        self.text_parts.append(data)


class OverviewParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.names = {}
        self.slug = None
        self.reading_name = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and "wcov" in attrs.get("class", "").split():
            match = re.fullmatch(r"/webcam/([^/]+)/", attrs.get("href", ""))
            self.slug = match.group(1) if match else None
            self.reading_name = bool(self.slug)
        elif tag == "br" and self.slug:
            self.reading_name = False

    def handle_endtag(self, tag):
        if tag == "a":
            self.slug = None
            self.reading_name = False

    def handle_data(self, data):
        if self.reading_name:
            self.names[self.slug] = self.names.get(self.slug, "") + data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "data" / "foto-webcams.json")
    args = parser.parse_args()
    request = Request(SOURCE, headers={"User-Agent": "VFR Italia camera index/0.1 (+https://flugschueler.de)"})
    with urlopen(request, timeout=30) as response:
        html = response.read().decode("utf-8", errors="replace")
    camera_parser = CameraParser()
    camera_parser.feed(html)
    camera_parser.finish_record()
    overview_request = Request(OVERVIEW, headers={"User-Agent": "VFR Italia camera index/0.1 (+https://flugschueler.de)"})
    with urlopen(overview_request, timeout=30) as response:
        overview_html = response.read().decode("utf-8", errors="replace")
    overview_parser = OverviewParser()
    overview_parser.feed(overview_html)
    seen = set()
    cameras = []
    for record in camera_parser.records:
        if record["url"] not in seen:
            seen.add(record["url"])
            record["display_name"] = overview_parser.names.get(record["slug"], "").strip() or record["name"]
            cameras.append(record)
    payload = {"source": SOURCE, "fetched_at": datetime.now(timezone.utc).isoformat(), "cameras": cameras}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"cameras={len(cameras)} with_direction={sum(c['direction_deg'] is not None for c in cameras)}")


if __name__ == "__main__":
    main()
