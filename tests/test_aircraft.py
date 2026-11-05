import unittest

import aircraft
import server


class ShapeTests(unittest.TestCase):
    def test_shapes_by_type_and_category(self):
        cases = [("EC45", "A7", "heli"), ("R44", "A7", "heli"), ("C172", "A1", "prop1"), ("PA34", "", "prop2"),
                 ("PC12", "A1", "turboprop"), ("C525", "A2", "bizjet"), ("A320", "A3", "airliner"),
                 ("B77W", "A5", "heavy"), ("AT76", "A3", "airliner"), ("GLID", "B1", "glider"), ("DV20", "A1", "prop1")]
        for code, category, expected in cases:
            with self.subTest(code=code):
                self.assertEqual(aircraft.shape_for(code, category), expected)

    def test_unknown_type_falls_back_to_emitter_category(self):
        self.assertEqual(aircraft.shape_for("", "A3"), "airliner")
        self.assertEqual(aircraft.shape_for("", "A7"), "heli")
        self.assertEqual(aircraft.shape_for("", ""), "other")

    def test_hex_lookup_fills_missing_type(self):
        self.assertEqual(aircraft.lookup_hex_type("3C6657"), "A321")
        item = server.normalize_adsb_aircraft({"lat": 48, "lon": 9, "seen_pos": 1, "hex": "3c6657", "alt_baro": 30000})
        self.assertEqual(item["type_code"], "A321")
        self.assertEqual(item["type_source"], "db")
        self.assertEqual(item["shape"], "airliner")

    def test_ground_vehicles_are_dropped(self):
        self.assertIsNone(server.normalize_adsb_aircraft({"lat": 48, "lon": 9, "seen_pos": 1, "t": "GND", "category": "C2"}))


class FlightRulesTests(unittest.TestCase):
    def test_estimates(self):
        self.assertEqual(aircraft.estimate_flight_rules("airliner", "DLH73A", "1000", 34000), "ifr")
        self.assertEqual(aircraft.estimate_flight_rules("prop1", "DEXYZ", "7000", 3000, "D-EXYZ"), "vfr")
        self.assertEqual(aircraft.estimate_flight_rules("glider", "", "", 5000), "vfr")
        self.assertEqual(aircraft.estimate_flight_rules("bizjet", "EJU23A", "1000", 25000), "ifr")
        self.assertEqual(aircraft.estimate_flight_rules("heli", "PROVA25", "", 2000), "unknown")


class FallbackSourceTests(unittest.TestCase):
    def test_uses_fallback_when_primary_fails(self):
        calls = []
        def fake(key, url, max_age):
            calls.append(url)
            if "adsb.lol" in url:
                raise RuntimeError("down")
            return {"aircraft": [{"lat": 48, "lon": 9, "seen_pos": 1, "t": "C172"}]}
        original = server.cached_json
        server.cached_json = fake
        try:
            items, name = server.fetch_adsb(48, 9, 20)
        finally:
            server.cached_json = original
        self.assertEqual(name, "adsb.fi")
        self.assertEqual(len(items), 1)


if __name__ == "__main__":
    unittest.main()
