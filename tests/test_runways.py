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


if __name__ == "__main__":
    unittest.main()
