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
        self.assertIn('boardDepartureRow: "DEPARTURE ----"', self.planner)
        self.assertIn('boardSunriseRow: departure ? `DATE ${boardDate(departure)}`', self.planner)
        self.assertIn('boardSunsetRow: "SR --:-- LCL/--:-- UTC"', self.planner)
        self.assertIn('boardGapTwo: "ROUTE EINGEBEN"', self.planner)

    def test_board_is_one_large_cycling_surface(self):
        self.assertIn('class="route-board-stream"', self.html)
        self.assertNotIn('class="airport-board-columns"', self.html)
        self.assertIn('id="boardDepartureRow" class="split-value board-cycle-track"', self.html)
        self.assertIn('id="boardSunriseRow" class="split-value board-cycle-track"', self.html)
        self.assertIn('id="boardSunsetRow" class="split-value board-cycle-track"', self.html)
        self.assertIn('id="boardGapTwo" class="split-value board-gap-track"', self.html)
        self.assertIn("grid-template-columns: repeat(24, minmax(0, 1fr))", self.html)
        self.assertIn("startBoardScreens", self.planner)
        self.assertIn("setBoardScreen", self.planner)
        self.assertIn("const boardMessageDwellMs = 9000", self.planner)
        self.assertIn('`DEPARTURE ${startCode}`', self.planner)
        self.assertIn('`ARRIVAL ${destinationCode}`', self.planner)
        self.assertIn('`STRECKE ${totalNm.toFixed(1)} NM`', self.planner)
        self.assertIn('font-size: clamp(18px, 1.45vw, 28px)', self.html)

    def test_map_search_starts_collapsed_and_tools_use_uniform_rows(self):
        self.assertIn('class="panel map-card search-panel-hidden"', self.html)
        self.assertIn('.dock-options { display: grid; grid-template-columns: 1fr;', self.html)
        self.assertIn('.dock-options button { width: 100%;', self.html)
        self.assertIn('.dock-options.layer-toggles label { display: flex; align-items: center; width: 100%;', self.html)

    def test_route_information_has_a_static_readable_summary(self):
        self.assertIn("function renderReadableRouteSummary", self.planner)
        self.assertIn("Route im Klartext", self.planner)
        self.assertIn("Sunrise ·", self.planner)
        self.assertIn("Sunset ·", self.planner)
        self.assertIn("Strecke · Luftlinie ohne Wind", self.planner)
        self.assertIn(".route-summary-grid { display: grid;", self.html)

    def test_route_handle_exits_full_map_view(self):
        self.assertIn('if (grid.classList.contains("map-only"))', self.html)
        self.assertIn('grid.classList.remove("map-only", "route-collapsed")', self.html)
        self.assertIn('mapOnlyToggle.textContent = "Vollansicht"', self.html)

    def test_switzerland_is_listed_as_implemented_beta_country(self):
        self.assertIn("ITALIEN · DEUTSCHLAND · ÖSTERREICH · SCHWEIZ", self.html)
        self.assertIn("Europa Beta · IT / DE / AT / CH", self.html)

    def test_primary_navigation_and_full_route_column_use_aviation_navy(self):
        self.assertIn("border-bottom: 1px solid #365b70; position: static; background: #071b2b;", self.html)
        self.assertIn(".mission-grid { gap: 0; background: #071b2b; }", self.html)
        self.assertIn(".route-rail { height: calc(100dvh - 112px);", self.html)

    def test_top_navigation_keeps_a_fixed_compact_height(self):
        self.assertIn("grid-template-rows: 51px minmax(0, 1fr)", self.html)
        self.assertIn(".tabs { height: 51px; min-height: 51px; grid-template-rows: 42px;", self.html)
        self.assertIn(".tabs .tab-button { height: 42px; min-height: 42px;", self.html)

    def test_secondary_pages_use_ci_background_around_white_panels(self):
        self.assertIn(".content-page { align-content: start; gap: 12px !important; padding: 12px; background: #071b2b; }", self.html)
        self.assertIn('class="page content-page" id="listPage"', self.html)
        self.assertIn('class="page content-page" id="sourcePage"', self.html)
        self.assertIn('class="page content-page" id="referencePage"', self.html)


class NavigationLayerContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.navaids = (ROOT / "navaids.js").read_text(encoding="utf-8")
        cls.planner = (ROOT / "planner.js").read_text(encoding="utf-8")

    def test_vfr_reporting_points_and_rnav_waypoints_are_separate_layers(self):
        self.assertIn('id="vfrLayer"', self.html)
        self.assertIn('id="rnavLayer"', self.html)
        self.assertNotIn('id="fixLayer"', self.html)
        self.assertIn('const KINDS = ["vor", "ndb", "vfr", "rnav"]', self.navaids)

    def test_navaid_symbols_have_no_opaque_square_background(self):
        rule = re.search(r"\.nav-marker \.nav-symbol \{[^}]*\}", self.html).group(0)
        self.assertIn("background: none", rule)

    def test_weather_card_uses_unambiguous_units(self):
        self.assertIn("Math.round(Number(layer.base))} ft", self.planner)
        self.assertNotIn('toLocaleString("de-DE")} ft', self.planner.split("function cloudText")[1].split("function windText")[0])


if __name__ == "__main__":
    unittest.main()
