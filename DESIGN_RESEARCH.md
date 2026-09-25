# VFR Italia: UI-Referenzen (25.09.2026)

Status: Recherche und Vorauswahl, noch keine Freigabe zur Uebernahme fremder Komponenten. Die bestehende Anwendung ist Vanilla HTML/CSS/JS mit Leaflet; die meisten 21st-Komponenten sind React/Tailwind-Beispiele.

## In Safari gepruefte 21st-Referenzen

| Muster | Originalseite | Eignung |
| --- | --- | --- |
| Floating Dock | https://21st.dev/@manuarora700/components/floating-dock | Gute Anregung fuer 4-6 sekundaere Kartenwerkzeuge. Hover-Vergroesserung nicht als einzige Rueckmeldung auf Touch-Geraeten verwenden. |
| Quick Tooltip Actions | https://21st.dev/@suraj-xd/components/quick-tooltip-actions | Tooltip-Verhalten fuer Icon-Werkzeuge; Beschriftung muss per Tastatur und Touch erreichbar sein. |
| Apple Liquid Glass Switcher | https://21st.dev/@dennysdionigi/components/apple-liquid-glass-switcher | Bevorzugte Referenz fuer Tag/Nacht, weil Sonne und Mond erkennbar sind. Dritter Modus nur bei echtem Nutzen. |
| Toggle Switch Glass | https://21st.dev/@zochory/components/toggle-switch-glass | Glatte Bewegung, aber als blanker Schalter zu wenig Bedeutung. |
| Sky Toggle | https://21st.dev/@ravikatiyar162/components/sky-toggle | Fuer eine Flugkarte zu illustrativ und gross. |
| Split Flap Display | https://21st.dev/@componentry/components/split-flap-display | Mechanische Anmutung, Demo ist aber ein langer Schriftzug und nicht direkt ein kompaktes Zahlenfeld. |
| Globe Flights | https://21st.dev/@shuding/components/cobe-globe-flights | Allenfalls fuer einen kurzen optionalen Einstieg; WebGL-Globus braucht Laufzeit und hilft nicht beim eigentlichen Planen. |
| Wireframe Dotted Globe | https://21st.dev/@moazamtrade/components/wireframe-dotted-globe | Ebenfalls nicht als erste Ansicht: Karte muss direkt nutzbar bleiben. |
| Text Flipping Board (gespeichert) | https://21st.dev/@manuarora700/components/text-flipping-board | Eindrueckliche grosse Zeichenwand, fuer die schmale Planerleiste und laufende Zahlenwerte zu raumgreifend. |
| Flight Card (gespeichert) | https://21st.dev/@ravikatiyar162/components/flight-card-1 | Klarer Start-/Ziel-Aufbau, aber Bild-/Ticketstil eher fuer Airline-Buchungen als ein VFR-Briefing. |
| FlightAirport (offener Tab) | https://21st.dev/@ridemountainpig/components/flightcn-flight-airport | Marker mit Kartenkontext; kein Ersatz fuer die gepruefte Flugplatz-Symbolik. |
| Halide Topo Hero (offener Tab) | https://21st.dev/@shivendra9795kumar/components/halide-topo-hero | Starker Parallax-Look, aber als vorgeschaltete Hero-Flaeche fuer das Planungstool ungeeignet. |

21st Icons: https://docs.21st.dev/community/icons . Ein konsistenter Satz aus **Lucide** ist fuer diese Anwendung sinnvoller als gemischte Familien. Konkrete Motive: `plane-takeoff` (Start), `plane-landing` (Ziel), `route` (Ueberflug), `radio-tower` (Frequenz), `cloud`/`cloud-off` (Wetterebene), `camera` (Webcams), `ruler` (Messung), `sun`/`moon` (Theme). Start/Ziel behalten zusaetzlich sichtbare Labels und zugangliche Namen. Quelle/Lizenz der Lucide-Icons: https://lucide.dev/license (ISC). Bei 21st ist das Durchsuchen der Icons frei; die CLI-Installation von Komponenten kann einen Mitgliedschaftsschluessel benoetigen: https://docs.21st.dev/blog/liquid-glass-react-components .

## Drei weitere Split-Flap-Kandidaten (nicht aus den offenen Safari-Tabs)

1. Cody Shanley, Live-Demo: https://codyshanley.com/playground/split-flap , Quellcode: https://github.com/codemanshan/splitflap . Physisch wirkende CSS-3D-Klappen, kompakte 28x42-Pixel-Variante, beruecksichtigt `prefers-reduced-motion` und Screenreader. MIT, aber React-Komponente; fuer den jetzigen Stack nur als Design-/Bewegungsreferenz oder mit bewusstem Port.
2. Hardik Pandya, Live-Demo: https://hvpandya.com/solari/ , Quellcode: https://github.com/hardikpandya/solari-split-flap . Vanilla HTML/CSS/JS, vorwaertslaufende mechanische Zeichenfolge und Licht-/Schattenmodell, gelber Akzent vorhanden. MIT; grosse Tafel muss fuer die schmale Route-Leiste reduziert werden, Ton standardmaessig aus.
3. Stephan Wald, Komponente/Demo-Dateien: https://github.com/StephanWald/SplitFlapDigit . Eigenstaendiges Web Component mit 3D-Perspektive und Zahlen-Alphabet, MIT, kein Framework. Als kleines KPI-Feld technisch am einfachsten testbar; visuelle Qualitaet und Interaktion in der Karte noch pruefen.

Vorentscheidung: eine schmale, hoechstens dreizeilige Route-Zusammenfassung, die **Gesamtstrecke NM (km)**, **Flugzeit bei eingegebener Reisegeschwindigkeit** und **geschaetzten Verbrauch nur bei eingegebenem l/h-Wert** zeigt. Im Ruhezustand sind Werte sofort lesbar; Klappen bewegen sich nur bei Wertwechsel, kurz und ohne Ton. Keine Animation bei `prefers-reduced-motion`. Kurs/Bearing und Etappendetails bleiben im normalen Briefing, nicht in der Klappanzeige.

## Gestaltung und Daten

- Karte bleibt erste Ansicht, kein vorgeschalteter Globe-/Video-Intro-Screen. Allenfalls ein kurzes, abbrechbares Einblenden des Werkzeugbereichs. Scramble-Text nicht fuer Flug- oder Wetterdaten, weil er waehrend des Wechsels absichtlich falsche Zeichen zeigt.
- Schwimmende Werkzeugleiste mit transparenter, aber kontrastfester Flaeche; Layer-Schalter zeigen Ein/Aus durch Farbe und `aria-pressed`, nicht durch ein geaendertes Icon allein. Hover-Hinweis plus Tastatur-Fokus und Touch-Beschriftung.
- Kleine, gruendlich getestete Glas-Effekte statt Refraction auf der ganzen Karte. Quelle zur Performance/Lesbarkeit: https://docs.21st.dev/blog/liquid-glass-react-components .
- CARTO Voyager/Positron/Dark Matter waeren besser gestaltete OSM-Basiskarten, sind jedoch **kein VFR-/IFR-Chart**. Aktuelle CARTO-Nutzung erfordert API-Key, sichtbare Attribution und Limits: https://www.carto.com/basemaps/ . Keine fremden Tiles ohne Key einbauen; Bedingungen vor Produktion pruefen.
- Quellenlinks fuer Plaetze aus dem eigenen indexierten Datensatz mit Abruf-/Pruefstatus pflegen; regelmaessiger Server-Check mit Fehlerprotokoll und Stichprobe. Kein Live-Scraping bei jedem Icon-Klick: langsam, fragil und moeglicherweise gegen Nutzungsbedingungen. Im Platzdetail Quelle und letztes Pruefdatum zeigen.

Naechster Schritt nach Nutzerentscheidung: A/B-Prototyp der drei Flip-Varianten auf echten Routendaten, Icon-Werkzeugleiste und Tag/Nacht-Schalter in Desktop- und iPad-/Telefonbreiten pruefen; danach erst in die produktive Karte integrieren.
