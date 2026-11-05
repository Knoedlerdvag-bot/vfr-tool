import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import build_runways  # noqa: E402


class SurfaceCodeTests(unittest.TestCase):
    def test_common_surface_names(self):
        cases = {"ASP": "A", "Asphalt": "A", "CON": "C", "CONC": "C", "GRASS": "G", "grs": "G", "Turf": "G",
                 "GRVL": "R", "DIRT": "D", "sand": "S", "UNK": "U", "": "U"}
        for raw, expected in cases.items():
            with self.subTest(raw=raw):
                self.assertEqual(build_runways.surface_code(raw), expected)

    def test_generated_table_has_edsh_grass_runway(self):
        payload = json.loads((ROOT / "data" / "runways.json").read_text(encoding="utf-8"))
        edsh = next(a for a in payload["airports"] if a[0] == "EDSH")
        self.assertEqual(edsh[4][0][:2], ["10", "28"])
        self.assertEqual(edsh[4][0][4], "G")



class AipLinkTests(unittest.TestCase):
    def test_dfs_permalink_table(self):
        payload = json.loads((ROOT / "data" / "dfs-aip-links.json").read_text(encoding="utf-8"))
        self.assertIn("{id}", payload["url_template"])
        self.assertEqual(payload["airports"]["EDSH"], "C01964")
        self.assertGreater(len(payload["airports"]), 400)

    def test_austria_page_parser_uses_first_current_edition(self):
        import server
        root = '<a href="./lo/261030/index.htm">aktuelle</a><a href="./lo/261126/index.htm">zukünftige</a>'
        chapters = {"ad_2.htm": '<a href="ad_2_lowi.htm">Karten</a><a href="ad_2_lowg.htm">x</a>', "ad_3.htm": '<a href="ad_3_loat.htm">y</a>'}
        class FakeResponse:
            def __init__(self, text): self.text = text
            def read(self): return self.text.encode("latin-1")
            def __enter__(self): return self
            def __exit__(self, *args): return False
        def fake_urlopen(request, timeout=0):
            url = request.full_url
            if url == server.AUSTRO_EAIP_ROOT:
                return FakeResponse(root)
            return FakeResponse(chapters[url.rsplit("/", 1)[1]])
        server.cache.pop("at-aip", None)
        original = server.urlopen
        server.urlopen = fake_urlopen
        try:
            result = server.austria_aip_pages()
        finally:
            server.urlopen = original
            server.cache.pop("at-aip", None)
        self.assertTrue(result["base"].endswith("/lo/261030/"))
        self.assertEqual(result["pages"]["LOWI"], "ad_2_lowi.htm")
        self.assertEqual(result["pages"]["LOAT"], "ad_3_loat.htm")


class NavaidDataTests(unittest.TestCase):
    def test_ofmx_navaids_include_stuttgart_vor(self):
        payload = json.loads((ROOT / "data" / "navaids.json").read_text(encoding="utf-8"))
        stg = [n for n in payload["navaids"] if n["ident"] == "STG" and n["country"] == "DE"]
        self.assertEqual(len(stg), 1)
        self.assertEqual(stg[0]["type"], "VOR-DME")
        self.assertEqual(stg[0]["frequency_khz"], 116850)

    def test_runway_filter_controls_exist(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="runwayMinLength"', html)
        self.assertIn('id="runwaySurface"', html)


if __name__ == "__main__":
    unittest.main()
