import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class RouteBoardUiContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.planner = (ROOT / "planner.js").read_text(encoding="utf-8")

    def test_route_board_is_visible_before_a_route_is_entered(self):
        board_tag = re.search(r'<div id="routeBoard"[^>]*>', self.html)
        self.assertIsNotNone(board_tag)
        self.assertNotIn("hidden", board_tag.group(0))
        self.assertIn('id="routeBoardState">ROUTE EINGEBEN', self.html)
        self.assertIn('board.hidden = false;', self.planner)

    def test_empty_board_uses_full_split_flap_placeholders(self):
        self.assertIn("const boardCellWidths", self.planner)
        self.assertIn('boardDepartureTitle: "DEPARTURE"', self.planner)
        self.assertIn('boardArrivalTitle: "ARRIVAL"', self.planner)
        self.assertIn('boardDistance: "--.- NM"', self.planner)
        self.assertIn('boardKm: "---.- KM · ETAPPEN-LUFTLINIE · OHNE WIND"', self.planner)

    def test_primary_navigation_and_full_route_column_use_aviation_navy(self):
        self.assertIn(".tabs { border-radius: 0; border: 0; border-bottom: 1px solid #365b70; position: static; background: #071b2b;", self.html)
        self.assertIn(".mission-grid { gap: 0; background: #071b2b; }", self.html)
        self.assertIn(".route-rail { height: calc(100dvh - 112px);", self.html)


if __name__ == "__main__":
    unittest.main()
