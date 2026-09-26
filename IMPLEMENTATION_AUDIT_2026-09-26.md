# Umsetzungsprüfung – VFR Flight Planner

Stand: 26.09.2026  
Grundlage: Nutzeranforderungen aus dem fortlaufenden Arbeitschat, aktueller Quellcode und Browserprüfung auf Desktop.

## Jetzt korrigiert

| Anforderung | Stand | Umsetzung |
|---|---|---|
| Split-Flap-Tafel darf ohne Route nicht verschwinden | Erledigt | Die vollständige Tafel bleibt immer sichtbar. Ohne Route zeigt sie Datum und neutrale Platzhalter; nach Routenberechnung werden dieselben Zellen animiert befüllt. |
| Eine zusammenhängende Tafel statt einzelner Karten | Erledigt | Departure, Arrival, Datum, LCL/UTC, ICAO, SR/SS, Strecke, Flugzeit, Verbrauch und km-Zeile liegen in einer einzigen ungeteilten Split-Flap-Fläche. Jede Zeile besitzt 18 große, feste Zellen: Die Buchstaben klappen nacheinander zur nächsten Information, bleiben zum Lesen stehen und wechseln danach weiter. Die Zeile selbst wandert nicht. |
| Kein heller Leerraum unter GPX/CSV/Ortsdaten | Erledigt | Die linke Routenspalte füllt auf Desktop die gesamte Kartenhöhe mit Aviation Navy. |
| Hauptnavigation nicht weiß | Erledigt | Karte, Plätze & Export, Quellen und Nachschlagen liegen auf der Navy-CI-Fläche; der aktive Bereich ist blau/gold markiert. |

## Sauber umgesetzt und im aktuellen Stand vorhanden

| Anforderung | Stand |
|---|---|
| Split-Flap-Ehrenrunde mit Zeichenlauf und Reduced-Motion-Rücksicht | Umgesetzt |
| Departure/Arrival mit Datum, Local/LCL und UTC innerhalb der Tafel | Umgesetzt |
| Sunrise am Start und Sunset am Ziel mit SR/SS, LCL/UTC und Platzcode | Umgesetzt |
| Strecke, Flugzeit, Verbrauch und km Luftlinie ohne Wind in der Tafel | Umgesetzt |
| Dunkelmarine Tag-Seitenleiste; grauer Nachtmodus | Umgesetzt |
| Startsequenz im dunkelmarinen Gestaltungssystem | Umgesetzt |
| Seitenleiste über seitlichen Griff ein-/ausblendbar | Umgesetzt |
| Suche im Navy-Stil minimierbar | Umgesetzt |
| Zoom rechts unten, Legende links unten | Umgesetzt |
| Distanzmessung im rechten Werkzeugdock, inklusive Zeit bei Reisefahrt und optionalem Verbrauch | Umgesetzt |
| Korridor standardmäßig aus; Einschränkung erst nach bewusster Auswahl | Umgesetzt |
| Lupe aus den Routenfeldern entfernt; Autocomplete und Kartenwahl bleiben | Umgesetzt |
| Flughafen-Popup schließt ohne zweites Detailpanel | Umgesetzt |
| Flughafen-Popup bietet Start, Überflug, Landestopp und Ziel | Umgesetzt |
| Karten-Rechtsklick auf einen Flughafen verwendet den Platzdatensatz statt zufälliger Koordinate | Umgesetzt |
| PDF, SkyDemon-GPX und CSV als zusammengehörige Exportgruppe | Umgesetzt |
| Routenbezogene Dateinamen mit Start-/Zielkennung | Umgesetzt |
| PDF ohne doppelte Kopfzeile; Planstand mit Datum/Uhrzeit; Fußmarke flugschüler.de | Umgesetzt |
| OpenFlightMaps als freiwilliger, standardmäßig ausgeschalteter Layer mit AIRAC/Disclaimer | Umgesetzt |
| VFR-/RNAV-Meldepunkte reagieren auf den Schalter und sind auswählbar | Umgesetzt für Deutschland/Italien sowie sechs LOWI-RNP-Punkte |
| VOR, VOR/DME, NDB und Flugplatzsymbole nach amtlicher ICAO-Geometrie | Umgesetzt |
| WT9 Dynamic, A22 Foxbat und R300 nicht mehr als Hubschrauber klassifiziert | Umgesetzt |
| Branding flugschüler.de — VFR Flight Planner sowie Europa-Beta-/Coming-soon-Hinweis | Umgesetzt |

## Nur teilweise umgesetzt – konkrete Nacharbeit

| Thema | Aktueller Stand | Exakte Nacharbeit |
|---|---|---|
| Sunset-Warnlogik | Astronomische Warnung verwendet Sunrise/Sunset und bürgerliche Dämmerung. | Platzbezogene Regeln modellieren: Betrieb bis SS, SS+30 oder veröffentlichte Sonderregel ausschließlich aus AIP-/Betreiberquelle. Bis dahin Warnung ausdrücklich nur astronomisch nennen. |
| Datums-/Zeitauswahl als fliegerisches Bedienelement | Kompakte native Datum-/Zeitfelder plus Schnellschritte sind vorhanden. | Eigenes instrumentenartiges Dreh-/Stepper-Konzept entwerfen, ohne Tastatur-, Mobil- und Barrierefreiheit der nativen Eingabe zu verlieren. |
| Wetter – METAR und TAF gleichzeitig | Marker-Popup zeigt beide; die Kartenbeschriftung zeigt jeweils einen Stationsmodus. | Im Wettermenü einen kombinierten METAR+TAF-Modus ergänzen oder die Exklusivität direkt am Schalter deutlicher kennzeichnen. |
| Flächige Wind-, Wolken- und Sichtdarstellung | Aktuell werden Stationswerte aus METAR dargestellt. | Echten Prognose-Layer mit Zeit, Höhe, Modelllauf und Legende auf Basis einer geklärten Quelle wie DWD ICON-EU bauen. |
| Exakte DFS-Platzunterarten | Symbolgeometrie folgt der amtlichen ICAO-Legende; Quelldaten unterscheiden Unterarten nicht überall zuverlässig. | Belastbare Felder für öffentlich/privat, befestigt/unbefestigt, Segelflug und Platzstatus importieren; erst danach jeden Platz exakt klassifizieren. |
| Vollständige Fluggerätemuster-Klassifikation | Häufige Fehlzuordnungen sind korrigiert. | Wartbare Muster-/Kategorie-Tabelle mit Tests für weitere häufige UL-, Motorflug-, Segelflug- und Hubschraubermuster aufbauen. |
| Einzelne Luftraumarten | Gesamter OpenFlightMaps-VFR-Layer ist schaltbar. | OFMX/AIXM strukturiert auswerten und getrennte Schalter für CTR, RMZ, TMZ und weitere Zonen mit AIRAC/Quelle anbieten. |
| Österreichische RNAV-/VFR-Punkte | Sechs verifizierte LOWI-RNP-Punkte vorhanden. | Belastbare aktuelle OFMX-/AIXM-Quelle für ganz Österreich anbinden. |
| Produktname | Arbeitsname steht; finale Namensentscheidung ist offen. | Nach Beta-Feedback zwischen VFR Flight Planner, VFR Visual oder einer anderen dauerhaften Produktbezeichnung entscheiden. |

## Qualitätsprüfung dieses Stands

- Desktop-Browser: leere Split-Flap-Tafel sichtbar, geschlossenes Zellraster, Navigation Navy, linke Spalte bis unten Navy.
- JavaScript-Syntax: bestanden.
- Python-Unittests: 13 bestanden.
- `git diff --check`: bestanden.
