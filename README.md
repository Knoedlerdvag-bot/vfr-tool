# flugschüler.de — VFR Flight Planner

Interaktive Europa-Beta für VFR-Piloten mit Schwerpunkt Italien, Deutschland und Österreich. Frankreich, Spanien und Portugal sind als nächste Ausbaustufen vorgesehen. Start, Ziel, Überflugpunkte und echte Landestopps sind frei wählbar. Die App kombiniert kuratierte Platzdaten mit öffentlichen Verzeichnissen; sie ersetzt keine operative Flugvorbereitung.

## Lokal starten

`python3 server.py --port 4178` und danach `http://127.0.0.1:4178/` öffnen. Der kleine Server hält METAR/TAF-Abrufe und OGN-Verkehr vom Browser fern und puffert NOAA-Daten. Für die Kartenkacheln, Wetter, Verkehr und Webcam-Vorschauen ist eine Internetverbindung erforderlich.

## Planung und Export

- Beliebig viele Überflugpunkte und Landestopps; Platzname/Code, Ort/Postleitzahl oder Koordinaten, Reihenfolge veränderbar. Enter oder Lupe startet eine gezielte Ortsauflösung; mehrdeutige Treffer werden zur Auswahl angeboten. Rechtsklick oder langer Druck auf die Karte setzt Routenpunkte direkt.
- Gerade Etappen in NM/km, wahre Anfangskurse, Dauer bei konstanter Reisegeschwindigkeit und optionaler Verbrauch in l/h. Kein Wind, Steigflug, Reserven oder Tankstoppzeit.
- Druckansicht als PDF mit Etappen und Platzinformationen zu Start, Landestopps und Ziel.
- GPX-Route (`rtept`) für SkyDemon und separate Platz-Wegpunkte (`wpt`); CSV mit Entfernungen und Zeiten. Export jeweils Route, Plätze oder beides; Plätze aus dem gewählten Korridor oder dem aktuellen Kartenausschnitt.
- Zuschaltbar: NOAA-METAR/TAF, OGN-Verkehr mit Geräte-Opt-in-Prüfung und foto-webcam.eu-Kameras. Die Wetterkategorien sind US-METAR-Kategorien, keine Entscheidung über italienische VFR-Minima.
- Kartenlineal mit beliebig vielen Messpunkten, Distanz und rechtweisendem Anfangskurs je Abschnitt sowie Gesamtstrecke.

## Dateien

- `index.html`: interaktive Karte und Dashboard
- `planner.js`: Routenplanung, Export, Druckansicht und optionale Kartenebenen
- `server.py`: lokaler HTTP- und Wetter-/OGN-Dienst
- `data/foto-webcams.json`: öffentlicher Kameraindex mit Quelle und Blickrichtung
- `data/route-airports.json`: Flugplatzcode-Index aus den öffentlichen OurAirports-Daten (keine amtliche ICAO-Code-Liste)
- `scripts/build_route_airports.py`: reproduzierbarer Import des Code-Indexes
- `scripts/scan_foto_webcams.py`: reproduzierbarer Kameraindex-Import
- `data/webaai-public-scan.json`: öffentlicher WebAAI/ENAC-Scan für ganz Italien
- `data/webaai-public-scan.csv`: CSV-Version des WebAAI/ENAC-Scans
- `scripts/scan_webaai_public.py`: reproduzierbarer Importer für die öffentlichen WebAAI-Registerseiten
- `helikopter-italien-pilotenbriefing.md`: ausführliches Whitepaper
- `helikopter-italien-waypoints.waypoints.gpx`: SkyDemon-Wegpunkte
- `helikopter-italien-waypoints.csv`: vollständiger Datenexport
- `helikopter-italien-pilot-share.zip`: Offline-Übergabepaket

## Sicherheitshinweis

Arbeitsunterlage, keine Navigationsdaten und kein operatives Flight Briefing. ENAC/WebAAI-Daten werden mit Quellenlink und Abrufstand geführt, Kontakte/Services/Obstacles können registrierungspflichtig sein. Alle Angaben vor dem Flug mit aktueller AIP, NOTAM/PIB, Wetter, Betreiber/PPR, Fuel-Verfügbarkeit und den einschlägigen Genehmigungen abgleichen. Die Flugvorbereitung und Entscheidung verbleiben beim verantwortlichen Piloten.

Die freie Lesbarkeit einer Website ist keine Wiederverwendungslizenz. RadarVirtuel-API, openAIP-Datenübernahme und EDDH-PIREP-Zusammenfassungen bleiben bis zur Klärung der Nutzungsrechte aus. Auch der Ausbau um Pflichtmeldepunkte, Funk-/Luftraumgrenzen und Navigationseinrichtungen braucht eine verlässliche, aktualisierbare Datenquelle.

Die Kartensymbole sind eigenständig gestaltet und lediglich an der Semantik von ICAO-Karten orientiert. Die [amtliche ICAO-Zeichenerklärung 2026](https://www.swisstopo.admin.ch/dam/de/sd-web/oAbJkfKRzznX/LegendeICAO_A4_2026.pdf) trennt unter anderem Heliports, Segelfluggelände sowie befestigte und unbefestigte Pisten. Solche Unterarten werden hier nur dargestellt, wenn sie für den konkreten Platz verifiziert sind; derzeit fehlen insbesondere flächendeckende Daten zur Pistenoberfläche. Die [V500 Italy für Flight Planner](https://www.eisenschmidt.aero/planung-navigation-planungsprogramme-hilfen-flight-planner) ist ein kostenpflichtiges Kartenprodukt und keine freie Quelldatei für diese Anwendung.
