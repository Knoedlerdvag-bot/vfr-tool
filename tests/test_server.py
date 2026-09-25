import unittest
import time
from unittest.mock import patch

import server


BEACON = "FLRDDDEAD>APRS,qAS,EDER:/114500h5029.86N/00956.98E'342/049/A=005524 id0ADDDEAD"


class RouteLookupTests(unittest.TestCase):
    def test_airport_code_lookup_includes_edsh(self):
        results = server.resolve_query("edsh")
        self.assertEqual(results[0]["code"], "EDSH")
        self.assertEqual(results[0]["kind"], "airport")
        self.assertAlmostEqual(results[0]["lat"], 48.919724)


class NavigationFixTests(unittest.TestCase):
    def test_rejects_unbounded_viewport(self):
        with self.assertRaises(ValueError):
            server.navigation_fixes([35, 5, 51, 20])

    def test_normalizes_and_deduplicates_fixes(self):
        records = [{"id": "ELMEM", "lat": 47.28, "lon": 10.57},
                   {"id": "ELMEM", "lat": 47.28, "lon": 10.57},
                   {"id": "BAD", "lat": 47.3, "lon": 10.6}]
        with patch.object(server, "cached_json", return_value=records):
            payload = server.navigation_fixes([47.2, 10.5, 47.4, 10.7])
        self.assertEqual(len(payload["fixes"]), 1)
        self.assertEqual(payload["fixes"][0]["ident"], "ELMEM")
        self.assertFalse(payload["limited"])


class OgnPrivacyTests(unittest.TestCase):
    def test_tracked_and_identified_can_show_registration_and_type(self):
        devices = {("F", "DDDEAD"): {"tracked": "Y", "identified": "Y", "registration": "D-TEST", "aircraft_type": "3", "aircraft_model": "R44"}}
        _, position = server.parse_beacon(BEACON, devices)
        self.assertEqual(position["label"], "D-TEST")
        self.assertEqual(position["category"], "helicopter")
        self.assertEqual(position["model"], "R44")
        self.assertEqual(position["track_deg"], 342)
        self.assertEqual(position["speed_kt"], 49)
        self.assertEqual(position["altitude_ft"], 5524)

    def test_tracking_opt_out_is_not_redistributed(self):
        devices = {("F", "DDDEAD"): {"tracked": "N", "identified": "Y", "registration": "D-TEST"}}
        self.assertIsNone(server.parse_beacon(BEACON, devices))

    def test_identification_opt_out_remains_anonymous(self):
        devices = {("F", "DDDEAD"): {"tracked": "Y", "identified": "N", "registration": "D-TEST", "aircraft_model": "R44"}}
        _, position = server.parse_beacon(BEACON, devices)
        self.assertEqual(position["label"], "")
        self.assertEqual(position["model"], "")

    def test_helicopter_model_overrides_generic_aircraft_type(self):
        devices = {("F", "DDDEAD"): {"tracked": "Y", "identified": "Y", "registration": "OE-XTE", "aircraft_type": "0", "aircraft_model": "AS 350"}}
        _, position = server.parse_beacon(BEACON, devices)
        self.assertEqual(position["category"], "helicopter")

    def test_known_fixed_wing_model_overrides_wrong_helicopter_category(self):
        for model in ("WT9 Dynamic", "A22 Foxbat", "R300"):
            with self.subTest(model=model):
                devices = {("F", "DDDEAD"): {"tracked": "Y", "identified": "Y", "registration": "D-TEST", "aircraft_type": "3", "aircraft_model": model}}
                _, position = server.parse_beacon(BEACON, devices)
                self.assertEqual(position["category"], "plane")


class TrafficMergeTests(unittest.TestCase):
    def test_adsb_normalization_and_stale_filter(self):
        aircraft = {"lat": 46.5, "lon": 11.3, "seen_pos": 4, "r": "D-TEST", "t": "EC35", "alt_baro": 8198, "gs": 94, "track": 181}
        item = server.normalize_adsb_aircraft(aircraft)
        self.assertEqual(item["category"], "helicopter")
        self.assertEqual(item["speed_kt"], 94)
        self.assertIsNone(server.normalize_adsb_aircraft({**aircraft, "seen_pos": 90}))
        self.assertIsNone(server.normalize_adsb_aircraft({**aircraft, "alt_baro": "ground"}))
        self.assertIsNone(server.normalize_adsb_aircraft({**aircraft, "ground": True}))

    def test_same_registration_nearby_is_displayed_once(self):
        now = time.time()
        ogn = {"lat": 46.5, "lon": 11.3, "observed_at": now, "label": "D-TEST", "category": "glider", "model": "", "device_id": "AB1234", "track_deg": 90, "speed_kt": 80, "altitude_ft": 6000}
        adsb = {"lat": 46.501, "lon": 11.301, "seen_pos": 1, "r": "D-TEST", "t": "C172", "hex": "AB1234", "alt_baro": 6100, "gs": 81, "track": 91}
        with patch.object(server, "start_ogn"), patch.object(server, "ogn_positions", {("FLR", "AB1234"): ogn}), patch.object(server, "cached_json", return_value={"ac": [adsb]}):
            result = server.traffic_in_area(46.5, 11.3, 20, "both")
        self.assertEqual(len(result["positions"]), 1)
        self.assertNotIn("hex", result["positions"][0])
        self.assertNotIn("device_id", result["positions"][0])

    def test_rejects_unbounded_traffic_query(self):
        with self.assertRaises(ValueError):
            server.traffic_in_area(46.5, 11.3, 1000, "both")


if __name__ == "__main__":
    unittest.main()
