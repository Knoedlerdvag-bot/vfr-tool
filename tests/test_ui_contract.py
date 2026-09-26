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
        self.assertIn('boardDepartureRow: ["DEPARTURE"', self.planner)
        self.assertIn('boardSunriseRow: ["SUNRISE / SR"', self.planner)
        self.assertIn('boardArrivalRow: ["ARRIVAL"', self.planner)
        self.assertIn('boardSunsetRow: ["SUNSET / SS"', self.planner)
        self.assertIn('boardMetricsRow: ["STRECKE --.- NM"', self.planner)
        self.assertIn('boardKm: ["---.- KM", "ETAPPEN-LUFTLINIE", "OHNE WIND"]', self.planner)

    def test_board_is_one_large_cycling_surface(self):
        self.assertIn('class="route-board-stream"', self.html)
        self.assertNotIn('class="airport-board-columns"', self.html)
        self.assertIn('id="boardDepartureRow" class="split-value board-cycle-track"', self.html)
        self.assertIn('id="boardSunriseRow" class="split-value board-cycle-track"', self.html)
        self.assertIn('id="boardSunsetRow" class="split-value board-cycle-track"', self.html)
        self.assertIn('id="boardGapTwo" class="split-value board-gap-track"', self.html)
        self.assertIn("grid-template-columns: repeat(18, minmax(0, 1fr))", self.html)
        self.assertIn("startBoardCycles", self.planner)
        self.assertIn('["DEPARTURE", departure ? `DATE', self.planner)
        self.assertIn('font-size: clamp(23px, 1.65vw, 32px)', self.html)

    def test_route_handle_exits_full_map_view(self):
        self.assertIn('if (grid.classList.contains("map-only"))', self.html)
        self.assertIn('grid.classList.remove("map-only", "route-collapsed")', self.html)
        self.assertIn('mapOnlyToggle.textContent = "Vollansicht"', self.html)

    def test_primary_navigation_and_full_route_column_use_aviation_navy(self):
        self.assertIn(".tabs { border-radius: 0; border: 0; border-bottom: 1px solid #365b70; position: static; background: #071b2b;", self.html)
        self.assertIn(".mission-grid { gap: 0; background: #071b2b; }", self.html)
        self.assertIn(".route-rail { height: calc(100dvh - 112px);", self.html)


if __name__ == "__main__":
    unittest.main()
