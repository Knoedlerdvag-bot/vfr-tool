import importlib.util
import json
import unittest
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("build_ofm_navigation", ROOT / "scripts" / "build_ofm_navigation.py")
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)


class OpenFlightMapsNavigationTests(unittest.TestCase):
    def test_airac_calculation_matches_current_cycle(self):
        self.assertEqual(builder.current_airac(date(2026, 9, 25)), 2609)

    def test_generated_index_contains_visible_vfr_points(self):
        payload = json.loads((ROOT / "data" / "navigation-points.json").read_text(encoding="utf-8"))
        self.assertEqual(payload["airac"], 2609)
        self.assertGreater(len(payload["points"]), 800)
        self.assertIn("VFR-MRP", {point["type"] for point in payload["points"]})
        self.assertTrue(all(point["ident"] and isinstance(point["lat"], float) for point in payload["points"]))


if __name__ == "__main__":
    unittest.main()
