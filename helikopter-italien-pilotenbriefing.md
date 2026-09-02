# Piloten-Briefing / Whitepaper

Projekt: Robinson R44 VFR-Planung Mengen-Hohentengen (EDTM) nach Norditalien  
Zielgebiet: Bozen, Trento, Verona, Gardasee  
Recherche-Stand: 2026-09-02  
Status: Arbeitsfassung v0.1, operativ vor Flugtag zwingend mit AIP/NOTAM, Betreiber/PPR und Fuel-Kontakten abzugleichen.

Update 2026-09-01: Die Kartenlogik wurde nach Review korrigiert. Eingetragen werden in der operativen Kartenebene nur zivile oder zivil plausibel nutzbare Plätze. Militärische-only Plätze werden nicht als nutzbare Marker geführt. Elisuperfici erhalten in der Karte ein `H`; normale Flugplätze, Aviosuperfici und Campi di volo werden mit ICAO- oder lokalem Code markiert.

Update 2026-09-02: Abschnitt 6/7 wurde um die ausdrücklich offenen Anfangsfragen ergänzt: Außenlandungen auf Privatgrundstücken, Melde-/Genehmigungspflichten, Südtirol-/Trentino-Schutzgebiete, Mindesthöhen und Flugplanpflicht innerhalb Italiens.

Update 2026-09-02: Die Kraftstoffanzeige unterscheidet jetzt `100LL`, nicht näher spezifiziertes `AVGAS`, `JET A-1`, `MOGAS` und generisch als bleifrei bezeichneten Kraftstoff. Die Farben sind eine Dashboard-Lesehilfe und kein behaupteter AIP-Farbstandard.

## 1. Kurzfazit

Die Karte und dieses Briefing unterscheiden bewusst zwischen belastbar belegten Plätzen und Kandidaten, die erst nach Betreiberkontakt verwendbar sind. Für AVGAS 100LL sind nach aktuellem Stand besonders relevant:

- EDTM Mengen-Hohentengen: AVGAS 100LL offiziell durch Betreiber genannt.
- LIDT Trento/Mattarello: AVIO 100LL offiziell durch Betreiber/Trentino Trasporti genannt, Fuel H24.
- LIPB Bozen/Bolzano: AVGAS/MOGAS über Aero Club Bolzano, nur nach vorheriger Anfrage und nach Verfügbarkeit.
- LIPN Verona Boscomantico: AV-GAS laut Betreiberseite verfügbar, Öffnungszeiten saisonal, Montag geschlossen.
- LIDH Thiene: AVGAS laut Betreiberseite verfügbar, Betriebs-/Self-Service-Details vorab bestätigen.
- LIDL Legnago: AV-GAS laut Betreiberbriefing verfügbar, Betriebszeiten/PPR beachten.
- LILR Cremona: AVGAS 100LL laut Aero Club verfügbar, Verfügbarkeit vorab telefonisch bestätigen.
- LIPX Verona Villafranca: kein AVGAS, nur Jet A1.
- LIPO Brescia Montichiari: kein AVGAS, nur Jet A1.

Die Perplexity-Recherche bleibt als Ideengeber nutzbar, aber mehrere Punkte sind nicht hinreichend belegt. Insbesondere der ICAO-Code für Mengen war dort falsch: Mengen-Hohentengen ist EDTM, nicht EDMQ.

## 2. Quellen- und Verifikationsregel

Für sicherheits- und rechtsrelevante Aussagen gilt:

- Offizielle Stelle oder Betreiberquelle vor Sekundärquelle.
- Fuel, Öffnungszeiten, PPR und Außenlandung immer telefonisch oder schriftlich vor dem Flugtag bestätigen.
- webAAI/Avioportolano und ENAC-Listen sind als Veröffentlichungs-/Registerquelle wertvoll, ersetzen aber keine aktuelle AIP-/NOTAM-/Betreiberprüfung.

Wichtige Basisquellen:

- [Regio Airport Mengen - Flugplatzdaten](https://www.regio-airport-mengen.de/piloteninfo/flugplatzdaten/)
- [DFS Allgemeine Luftfahrt / AIS-Portal](https://www.dfs.de/homepage/de/services/allgemeine-luftfahrt/)
- [ENAC Avio-Idro-Elisuperfici](https://www.enac.gov.it/aeroporti/infrastrutture-aeroportuali/avio-eli-idrosuperfici)
- [ENAC Regolamento Liberalizzazione Avio-Idro-Elisuperfici Ed. 1 Rev. 2, 05.02.2026](https://www.enac.gov.it/regolamento-liberalizzazione-delluso-delle-aree-di-atterraggio-avio-idro-elisuperfici-ed-1-rev2-del-05/02/2026/)
- [ENAC gelegentliche Avio-/Eli-/Idrosuperfici Portal](https://avio-occasionali.enac.gov.it/login)
- [webAAI / Avioportolano](https://webaai.it/index.php/it/)
- [ENAV AIP Italia](https://www.enav.it/en/services/online-services/aeronautical-information-management/aip-italia)
- [ENAV Online Services](https://www.enav.it/en/online-services)
- [EUROCONTROL European AIS Database](https://www.eurocontrol.int/service/european-ais-database)
- [EASA SERA.4001 Flight Plans und SERA.5005 VFR Mindesthöhen](https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-standardised-european?erules-id=ERULES-1963177438-9807)
- [ENAC Regole dell'Aria Italia / RAIT](https://www.enac.gov.it/la-normativa/normativa-enac/regolamenti/regolamenti-ad-hoc/)
- [Provinz Bozen - Divieto di sorvolo](https://mobilitaet.provinz.bz.it/it/divieto-di-sorvolo)
- [Provinz Trento - Autorizzazione atterraggio/decollo/sorvolo](https://www.provincia.tn.it/Servizi/Autorizzazione-attivita-atterraggio-decollo-e-sorvolo-per-motivi-ricerca-studio)

### 2.1 Zuständigkeit der AIS-/Briefingquellen

Für diese Route gibt es nicht "die deutsche AIP für Italien". Die Zuständigkeit bleibt grundsätzlich staatlich bzw. nach FIR/AIP-Veröffentlichung aufgeteilt:

- Deutscher Streckenanteil, Startplatz EDTM, deutsche AIP/NfL, deutsche NOTAM-/Briefingthemen und Flugplanaufgabe: DFS AIS-Portal bzw. ein zugelassener AIS-/ARO-Briefingdienst.
- Italienischer Streckenanteil, italienische Flugplätze, AIP Italia, italienische NOTAM, ENR-/AD-Daten, ENAV Online Services und italienische Flight-Plan-Services: ENAV/ENAC bzw. die zuständigen italienischen AIS-/ATS-Stellen.
- Avio-/Elisuperfici außerhalb klassischer Flugplätze: ENAC-Regelwerk plus webAAI/Avioportolano und jeweiliger Betreiber/PPR.
- Europa-/FIR-übergreifend: EUROCONTROL EAD ist die zentrale europäische AIS-Datenplattform. Für operative Nutzung ist aber ein dafür geeigneter Zugang bzw. Briefingdienst zu verwenden; EAD Basic wird von EUROCONTROL selbst als nicht operativ nutzbar beschrieben.

Praktischer Ablauf:

1. Route in einem zugelassenen Briefing-/Planungssystem über alle betroffenen FIRs abrufen.
2. Für Italien zusätzlich ENAV AIP/NOTAM und ENAC/webAAI/Betreiberkontakte prüfen.
3. Kurz vor Flug: NOTAM/PIB, Sperrgebiete, zeitlich aktive Beschränkungen, Fuel und PPR erneut bestätigen.

## 3. Landeplatz- und Fuel-Matrix

### 3.1 Italienische Platzbegriffe

- **Aeroporto:** regulärer Flughafen oder Flugplatz. Für die operative Planung sind AIP, NOTAM, Betreiberverfahren, PPR und gegebenenfalls Handling maßgeblich.
- **Aviosuperficie:** italienische Rechtskategorie für eine Luftfahrtfläche außerhalb eines regulären Flughafens. Als deutsche Arbeitserklärung passt "zivile Sonderlandefläche"; eine exakte 1:1-Entsprechung zum deutschen rechtlichen Begriff "Sonderlandeplatz" besteht nicht.
- **Elisuperficie:** eine Aviosuperficie, die kein Eliporto ist und ausschließlich für Hubschrauber bestimmt ist. Deutsche Arbeitserklärung: "Helikopter-Landefläche (italienische Kategorie, kein Heliport)".
- **Campo di volo:** VDS-/UL- beziehungsweise Sportfluggelände. Ein solcher Eintrag ist für einen zugelassenen R44 nicht automatisch nutzbar; Zulässigkeit, Betreiberfreigabe, Abmessungen, Hindernisse und Versicherung sind ausdrücklich zu bestätigen.
- **Eliporto:** formaler Heliport und damit nicht gleichbedeutend mit einer Elisuperficie.

Rechtsquelle für `Aviosuperficie` und `Elisuperficie`: [ENAC Regolamento Ed. 1 Rev. 2 vom 05.02.2026](https://www.enac.gov.it/app/uploads/2023/06/Regolamento-Liberalizzazione-delluso-delle-aree-di-atterraggioAvio-Idro-Elisuperfici-Edizione-1-Rev.-2-del-05.02.26.pdf). Die webAAI-Registerwarnung zu zertifizierten Luftfahrzeugen ist beispielsweise in der [Übersicht Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) sichtbar.

### 3.2 Umfang des 15-NM-Korridor-Audits

Geprüft wurde ein Korridor von 15 NM beidseits der Arbeitsroute `EDTM - LIPB - LIDT - LIPN - Gardasee` sowie ein 15-NM-Bereich um die Gardasee-Achse. Die Karte enthält nun 63 zivile Plätze, davon 46 rechnerisch innerhalb dieses Bereichs. Enthalten sind 19 reguläre Flugplätze/Flughäfen, 16 zivile Flug-/Sonderlandeflächen und 28 Helikopterflächen beziehungsweise zivile Heliports.

Die Mengenangabe bedeutet: vollständig nach den zum Stand 02.09.2026 ausgewerteten veröffentlichten Registern und Betreiberquellen, nicht vollständig gegenüber unveröffentlichten Privatflächen oder tagesaktuellen Änderungen. Eine ENAC-/AIP-Listung belegt außerdem nicht automatisch die Erlaubnis zur Fremdnutzung. Deshalb unterscheidet die Karte:

- `GAST OK`: Privat-/Gastanflug wird durch eine Betreiberquelle ausdrücklich angeboten; PPR bleibt erforderlich.
- `PPR`: ziviler Betrieb und Kontakt sind belegt, die konkrete Landung braucht Betreiberbestätigung.
- `OFFEN`: zivil veröffentlicht, aber Fremdnutzung für einen R44 ist nicht öffentlich belegt.
- `≤15 NM`: rechnerisch innerhalb des Routenkorridors oder der Gardasee-Achse; `REGIONAL` kennzeichnet zusätzliche Alternates außerhalb.

Primärquellen des Audits: [DFS Allgemeine Luftfahrt](https://www.dfs.de/homepage/de/services/allgemeine-luftfahrt/), [Austro Control eAIP](https://eaip.austrocontrol.at/), [ENAV AIP Italia](https://www.enav.it/en/services/online-services/aeronautical-information-management/aip-italia), [ENAC Avio-/Elisuperfici](https://www.enac.gov.it/aeroporti/infrastrutture-aeroportuali/avio-eli-idrosuperfici) und [webAAI Trentino-Alto Adige](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige). Betreiberquellen sind bei jedem Platz separat verlinkt.

| Status | Name | Typ | Code | Koordinaten | Helikopter | AVGAS 100LL | Zeiten / Betrieb | PPR / Kontakt | Quellen / Hinweise |
|---|---|---:|---:|---|---:|---:|---|---|---|
| bestätigt | Mengen-Hohentengen / Regio Airport Mengen | Verkehrslandeplatz | EDTM | 48.053 N, 9.373 E ungefähr | Ja, bis 6.000 kg | Ja | täglich 09:00 bis Sunset + 30, spätestens 20:00 local; 05:30-09:00 oder 20:00-22:00 auf Anfrage/OR | Tel. +49 07572 711047; +49 07572 769 601 0; info@regio-airport-mengen.de | [Betreiberdaten](https://www.regio-airport-mengen.de/piloteninfo/flugplatzdaten/) |
| bestätigt | Bozen / Bolzano Airport | Flughafen | LIPB / BZO | 46°27'37"N, 11°19'35"E | Ja | Ja, über Aero Club, nur vorherige Anfrage / nach Verfügbarkeit | Jet A1 06:00-23:00; Airport operations 06:30-23:00; Aero Club Sekretariat Mo/Mi/Fr 08:30-13:00, Di/Do 08:30-17:00 | GA +39 0471 255 207, generalaviation@bolzanoairport.it; Aero Club +39 0471 250165, info@aeroclub.bz | [Fuel](https://www.bolzanoairport.it/en/fuel), [Technische Daten](https://www.bolzanoairport.it/en/airport-technical-data), [Pilots Corner](https://www.bolzanoairport.it/en/pilots-corner) |
| bestätigt | Trento/Mattarello - Aeroporto G. Caproni | Flughafen/Flugplatz | LIDT | 46°01'17"N, 11°07'30"E ATZ-Referenz | Ja | Ja, AVIO 100LL | H24; AFIS H24 119.655 MHz; Fuel H24, Self-Service oder Freigabe via Funk bei Rechnung | Trentino Trasporti/Aeroporto Caproni; Tel. Zentrale +39 0461 031000; Fuel/AFIS via Platzverfahren | [Trentino Trasporti Services](https://www.trentinotrasporti.it/en/airport/aeroporto-caproni), [ital. Services](https://www.trentinotrasporti.it/it/aeroporto/aeroporto-caproni/servizi) |
| bestätigt | Verona Boscomantico | Flughafen/Flugplatz | LIPN / VR11 | 45°28.383'N, 10°55.616'E | Ja | Ja, AV-GAS | Di-So, Mo geschlossen; 16.09-14.05 09:00-19:00 oder SS; 15.05-15.09 Di-Fr 09:00-19:00/SS, Sa/So 08:00-20:00 | Boscomantico Airport +39 045 8103661, operations@boscomanticoservizi.it; Aero Club Verona +39 045 563200 | [Betreiber-Kontakt](https://www.boscomanticoairport.com/en/contact-us/), [Betreiber-Briefing](https://www.boscomanticoairport.com/en/briefing-2/), [Aero Club Verona](https://www.aeroclubverona.it/contatti/) |
| bestätigt | Verona Villafranca / Valerio Catullo | Flughafen | LIPX / VRN | 45°23'47"N, 10°53'16"E | Ja | Nein | H24; Jet A1 verfügbar; PPR mandatory subject to stand availability | Info +39 045 8095666; Handler siehe Betreiberseite | [Technische Infos](https://www.aeroportoverona.it/it_it/aviation/informazioni-tecniche), [Private Jets / GA](https://www.aeroportoverona.it/en_gb/flights/private-jets), [Handlers](https://www.aeroportoverona.it/en_gb/aviation/handlers) |
| bestätigt, kein AVGAS | Brescia Montichiari | Flughafen | LIPO | 45.429 N, 10.331 E ungefähr | Ja, GA laut Betreiber | Nein | Operations H24; Fuel 07:00-15:00 UTC; Jet A1 only, NO AVGAS | Operations +39 030 9656530 / 531; Mobile +39 335 7973213; operativo@aeroportobrescia.it; Flüge 3 h vor Ankunft anmelden | [Brescia Voli Privati](https://www.aeroportobrescia.it/it_it/voli-privati), [Kontakte](https://www.aeroportobrescia.it/en_gb/corporate/contacts) |
| Kandidat zivil | Asiago | Flugplatz | LIDA / VI06 | 45.887 N, 11.516 E ungefähr | Ja, AIP/Betreiber prüfen | unklar | PPR/Öffnungszeiten prüfen | Aeroporto Asiago +39 0424 465845 | [Aeroporto Asiago](https://www.aeroportoasiago.it/it/), [webAAI Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) |
| Kandidat zivil, Fuel | Thiene | Flugplatz | LIDH / VI07 | 45.682 N, 11.496 E ungefähr | Ja, AIP/Betreiber prüfen | Ja, laut Betreiber | Betriebszeiten/NOTAM/PPR prüfen; Fuel Self-Service in Aktivitätszeiten | Aeroporto di Thiene +39 0445 362723, info@aeroportothiene.it | [Thiene Contact](https://www.aeroportothiene.it/contact-2/), [Thiene Fuel/Associazioni](https://www.aeroportothiene.it/associazioni/) |
| bestätigt, Fuel | Legnago | Flugplatz | LIDL / VR09 | 45°07'48.4"N, 11°17'35.6"E | Ja, Betreiber/AIP prüfen | Ja, AV-GAS/MO-GAS laut Betreiber | Sa/So 09:00-19:30/SS; Wochentage nach Koordination | Aeroporto +39 371 5696638; Präsident +39 335 6191318; info@aeroportolegnago.it | [Legnago Briefing](https://www.aeroportolegnago.it/briefing/), [AeCI Eintrag](https://www.webaeci.it/cgi-bin/agp.bat?service=enti_list&tipo_ente=++&tipo_reg=20) |
| Kandidat zivil | Padova | Flugplatz | LIPU / PD11 | 45°23'46"N, 011°50'53"E | Ja, AIP/Betreiber prüfen | unklar | 08:00-20:00 LT laut Betreiber | Airport Padova +39 331 1759481, info@airportpadova.com | [Airport Padova](https://airportpadova.com/en/), [webAAI Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) |
| Kandidat zivil | Venezia/Lido - Nicelli | Flugplatz | LIPV / VE06 | 45.428 N, 12.388 E ungefähr | Ja, AIP/Betreiber prüfen | unklar | AIP/NOTAM/Betreiber prüfen | Aeroporto Nicelli +39 041 770300; operativo@aeroportonicelli.com; info@aeroportonicelli.com | [Aeroporto Nicelli](https://aeroportonicelli.com/dove-siamo-eng/), [webAAI Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) |
| Kandidat zivil | Belluno | Flugplatz | LIDB / BL05 | 46°10'0"N, 12°14'53"E | Ja, AIP/Betreiber prüfen | unklar | Di-So 09:00-18:00 laut Aero Club; AIP/NOTAM prüfen | Aero Club Belluno +39 0437 30667; +39 345 3056101; segreteria@aeroclubbelluno.org | [Aero Club Belluno](https://www.aeroclubbelluno.org/), [webAAI Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) |
| bestätigt, Fuel | Cremona | Flugplatz | LILR / CR04 | 45°10'02"N, 010°00'07"E | Ja, AIP/Betreiber prüfen | Ja, AVGAS 100LL laut Aero Club, Verfügbarkeit vorab prüfen | Mi-Fr 08:00-16:00/SS; Sa/So 08:00-17:00/SS; Mo/Di geschlossen außer Feiertage/Extra-PPR | Tel. +39 0372 560895; WhatsApp +39 351 5079340; segreteria@aeroclubcremona.it | [Aero Club Cremona Charts](https://www.aeroclubcremona.it/charts.html), [Aero Club Cremona Home](https://www.aeroclubcremona.it/) |
| Kandidat zivil | Colle di Casies | Aviosuperficie | BZ02 | 46°45'57.58"N, 12°09'30.69"E | Ja, Betreiber/PPR prüfen | nicht belegt | PPR/Öffnungszeiten prüfen; webAAI-Stand 14.01.2026 | Kontakte nach kostenloser webAAI-Anmeldung; Südtirol-Schutzgebietslage klären | [webAAI Colle di Casies](https://webaai.it/it/aviosuperfici-enac/trentino_alto_adige/colle-di-casies_A051) |
| Kandidat zivil | Costa / Corvara in Badia | Aviosuperficie | BZ06 | 46°33'08.84"N; Längengrad im offiziellen webAAI-Text unvollständig als 11°52',09"E; Karten-Längengrad bleibt Arbeitsnäherung | Ja, Betreiber/PPR prüfen | nicht belegt | PPR/Öffnungszeiten prüfen; webAAI-Stand 01.10.2025 | Kontakte nach kostenloser webAAI-Anmeldung; Südtirol-Schutzgebietslage klären | [webAAI Costa](https://webaai.it/it/aviosuperfici-enac/trentino_alto_adige/costa_A053) |
| Kandidat zivil | San Genesio | Aviosuperficie | BZ05 / LIGT | 46°34'22.08"N, 11°18'27.85"E | Ja, Betreiber/PPR prüfen | nicht belegt | PPR/Betreiber prüfen; webAAI-Stand 10.10.2024 | Tel. 335218916 laut früherem ENAC-Eintrag; aktuelle Kontakte nach webAAI-Anmeldung; Südtirol-Schutzgebietslage klären | [webAAI San Genesio/LIGT](https://webaai.it/it/aviosuperfici-enac/trentino_alto_adige/san-genesio_A103), [früherer ENAC-Eintrag](https://avio-superfici.enac.gov.it/it/public/surface/show/2144) |
| Kandidat zivil | Sarentino | Aviosuperficie | BZ03 | 46°36'10.278"N, 11°22'47.7336"E | Ja, Betreiber/PPR prüfen | nicht belegt | PPR/Öffnungszeiten prüfen; webAAI-Stand 08.10.2025 | Kontakte nach kostenloser webAAI-Anmeldung; Südtirol-Schutzgebietslage klären | [webAAI Sarentino](https://webaai.it/it/aviosuperfici-enac/trentino_alto_adige/sarentino_A048) |
| Kandidat zivil | Villa Ottone / Gais | Aviosuperficie | BZ07 | 46°52'34.03"N, 11°56'56.66"E | Ja, Betreiber/PPR prüfen | nicht belegt | PPR/Öffnungszeiten prüfen; webAAI-Stand 15.05.2025 | Kontakte nach kostenloser webAAI-Anmeldung; Südtirol-Schutzgebietslage klären | [webAAI Villa Ottone](https://webaai.it/it/aviosuperfici-enac/trentino_alto_adige/villa-ottone_A173) |
| Kandidat zivil/ULM | Garda Lake Airfield / Castelnuovo del Garda | Campo di volo / light aviation | VR17 | 45°27'06.9"N, 10°43'23.4"E | R44/AG-Nutzung offen; Website nennt ULM/day VFR | nicht belegt | Day VFR; technische Daten Betreiber | PPR erforderlich | [Garda Lake Airfield](https://www.gardalakeairfield.com/en), [webAAI Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) |
| PPR kritisch | Le Panizze / Lonato del Garda | Aviosuperficie privat | BS15 | 45°25'06"N, 10°33'33"E | wahrscheinlich nach Betreiberfreigabe; AG gelistet | nicht belegt | alle Tage laut Website, aber private Fläche; Landing 31 Pflicht, Start 13 | PPR/Autorisierung zwingend; Claudio +39 335 5378373, Ugo +39 335 406584, Mattia +39 331 3611207 | [Website](https://lepanizze.it/en/), [Kontakte](https://lepanizze.it/en/contacts/), [ENAC/WebAAI-Liste Lombardia](https://webaai.it/it/aviosuperfici-enac/lombardia) |
| Kandidat zivil | Silvio Scaroni / Bedizzole | Aviosuperficie | BS16 | 45°31'02.41551"N, 10°26'53.76741"E | Ja, Betreiber/PPR prüfen | nicht belegt | PPR/Öffnungszeiten prüfen; webAAI-Stand 23.09.2025 | Kontakte nach kostenloser webAAI-Anmeldung; ENAC-Direktion Bergamo | [webAAI Silvio Scaroni](https://webaai.it/it/aviosuperfici-enac/lombardia/silvio-scaroni_A123) |
| Kandidat zivil | Arcadia / Pastrengo | Aviosuperficie privat | VR15 | 45°30'04"N, 10°47'20"E | Ja, zu prüfen | nicht belegt | Betreiber/PPR offen | Betreiberfreigabe erforderlich; Tel. 335224889 laut ENAC-Eintrag | [ENAC Arcadia](https://avio-superfici.enac.gov.it/en/public/surface/show/1109), [webAAI Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) |
| Kandidat ULM | ULM Scaligero / Valeggio sul Mincio | Campo di volo | VR06 | 45°19'11"N, 10°42'54"E | R44/AG-Nutzung offen | nicht belegt | Betreiber/PPR offen | +39 337 460979 / +39 347 1047551 laut ULM.it | [ULM.it](https://www.ulm.it/mobile/campivolo/scheda.htm?chiave=164&condizione=regione&sel_ordine=nome+asc&valore=veneto), [webAAI Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) |
| Kandidat zivil/ULM | Aliveneta / Isola della Scala | Campo di volo | VR13 | 45°15'03"N, 11°02'09"E ungefähr | R44/AG-Nutzung offen | nicht belegt | Betreiber/PPR offen | +39 340 2238610; info@aliveneta.it | [Aliveneta Kontakt](https://www.aliveneta.it/index.php?route=information%2Fcontact), [webAAI Veneto](https://webaai.it/it/aviostrutture/veneto?ordinamento=Icao) |
| Kandidat zivil/ULM | Aquile Randagie / Sorgà | Campo di volo | VR01 | Koordinaten in Karte nur Arbeitsnäherung im Gemeindegebiet | R44/AG-Nutzung offen | nicht belegt | Betreiber/PPR offen | webAAI-Platzdetails prüfen; AAI-Daten zu Campi di volo sind nicht amtlich | [webAAI Aquile Randagie](https://webaai.it/it/aviostrutture/veneto/aquile-randagie_VR01?free=1) |
| Kandidat zivil/ULM | Volo Leggero / Casalino di Isola Rizza | Campo di volo | VR03 | Koordinaten in Karte nur Arbeitsnäherung im Gemeindegebiet | R44/AG-Nutzung offen | nicht belegt | Betreiber/PPR offen | webAAI-Platzdetails prüfen; AAI-Daten zu Campi di volo sind nicht amtlich | [webAAI Volo Leggero](https://webaai.it/it/aviostrutture/veneto/volo-leggero_VR03?free=1) |
| PPR offen | Salò - Lago di Garda | Elisuperficie | kein ICAO | 45°36'26.94"N, 10°30'11.48"E | Ja, ENAC/webAAI-gelistet | nicht belegt | Nachtbetrieb nein; weitere Zeiten per Betreiber; webAAI-Stand 17.03.2025 | Tel. 3457770606, E-Mail paolopern@gmail.com laut früherem ENAC-Eintrag; aktuell bestätigen; Betreiberfreigabe zwingend | [webAAI Salò Lago di Garda](https://webaai.it/it/elisuperfici-enac/lombardia/salo-lago-di-garda_EC10), [früherer ENAC-Eintrag](https://avio-superfici.enac.gov.it/it/public/surface/show/2253) |
| PPR offen | Sirmione | Elisuperficie | kein ICAO | 45°27'30.3"N, 10°36'13.3"E | Ja, ENAC/webAAI-gelistet | nicht belegt | Nachtbetrieb nein; weitere Zeiten per Betreiber; webAAI-Stand 14.07.2026 | Kontakte nach kostenloser webAAI-Anmeldung; Betreiberfreigabe zwingend | [webAAI Sirmione](https://webaai.it/it/elisuperfici-enac/lombardia/sirmione_EA36) |
| ENAC-gelistet | Merano - Sinigo | Elisuperficie | kein ICAO | 46°38'42"N, 11°09'49"E | Ja, ENAC/webAAI-gelistet | Nein/nicht belegt | Nachtbetrieb nein; weitere Zeiten per Betreiber; webAAI-Stand 26.08.2024 | Kontakte nach kostenloser webAAI-Anmeldung; Schutzgebietslage prüfen | [webAAI Merano - Sinigo](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/merano-sinigo_EA02) |
| ENAC-gelistet | JEUF DE FREA | Elisuperficie | kein ICAO | 46°32'58.85"N, 11°48'24.66"E | Ja, ENAC/webAAI-gelistet | Nein/nicht belegt | Nachtbetrieb nein; webAAI-Stand 03.06.2024 | Kontakte nach kostenloser webAAI-Anmeldung; Provinz/Betreiber und Schutzgebietslage prüfen | [webAAI JEUF DE FREA](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/jeuf-de-frea_EA45), [Provinz Bozen](https://mobilitaet.provinz.bz.it/it/divieto-di-sorvolo) |
| ENAC-gelistet | SECEDA | Elisuperficie | kein ICAO | 46°35'53.21"N, 11°43'37.59"E | Ja, ENAC/webAAI-gelistet | Nein/nicht belegt | Nachtbetrieb nein; webAAI-Stand 04.07.2024 | Kontakte nach kostenloser webAAI-Anmeldung; Provinz/Betreiber und Schutzgebietslage prüfen | [webAAI SECEDA](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/seceda_EA86), [Provinz Bozen](https://mobilitaet.provinz.bz.it/it/divieto-di-sorvolo) |
| ENAC-gelistet | PLAN DE CORONES | Elisuperficie | kein ICAO | 46°44'17.86"N, 11°57'18.51"E | Ja, ENAC/webAAI-gelistet | Nein/nicht belegt | Nachtbetrieb nein; webAAI-Stand 21.10.2025 | Kontakte nach kostenloser webAAI-Anmeldung; Provinz/Betreiber und Schutzgebietslage prüfen | [webAAI PLAN DE CORONES](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/plan-de-corones_EB56), [Provinz Bozen](https://mobilitaet.provinz.bz.it/it/divieto-di-sorvolo) |
| ENAC-gelistet | Alino | Elisuperficie | kein ICAO | 46°13'17"N, 11°10'09"E | Ja, ENAC/webAAI-gelistet | nicht belegt | Nachtbetrieb nein; webAAI-Stand 03.10.2025 | Kontakte nach kostenloser webAAI-Anmeldung; Trentino-Verfahren und Betreiber prüfen | [webAAI Alino](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/alino_EC35), [Provinz Trento](https://www.provincia.tn.it/Servizi/Autorizzazione-attivita-atterraggio-decollo-e-sorvolo-per-motivi-ricerca-studio) |
| ENAC-gelistet | Meriggi | Elisuperficie | kein ICAO | 46°11'06"N, 11°06'18"E | Ja, ENAC/webAAI-gelistet | nicht belegt | Nachtbetrieb nein; webAAI-Stand 03.10.2025 | Kontakte nach kostenloser webAAI-Anmeldung; Trentino-Verfahren und Betreiber prüfen | [webAAI Meriggi](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/meriggi_EC34), [Provinz Trento](https://www.provincia.tn.it/Servizi/Autorizzazione-attivita-atterraggio-decollo-e-sorvolo-per-motivi-ricerca-studio) |
| ENAC-gelistet | Rifugio Salei | Elisuperficie | kein ICAO | 46°30'15.3072"N, 11°44'59.424"E | Ja, ENAC/webAAI-gelistet | nicht belegt | Nachtbetrieb nein; webAAI-Stand 12.06.2025 | Kontakte nach kostenloser webAAI-Anmeldung; Hoch-/Berglage und Trentino-Schutzregeln prüfen | [webAAI Rifugio Salei](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/rifugio-salei_EC38), [Provinz Trento](https://www.provincia.tn.it/Servizi/Autorizzazione-attivita-atterraggio-decollo-e-sorvolo-per-motivi-ricerca-studio) |
| ENAC-gelistet | Hotel Caminetto | Elisuperficie | kein ICAO | Canazei, Trento | Ja, ENAC/webAAI-gelistet | nicht belegt | PPR/Betreiber offen | Hotel-/Berglage, Betreiber und Provinz prüfen | [webAAI TAA](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige) |
| Istruttoria / nicht als Marker | Storo | Elisuperficie | kein ICAO | Storo, Trento | nicht als planbare Option werten | nicht belegt | "Pratica in corso di istruttoria" | nicht verwenden, bis ENAC/Betreiber Daten veröffentlicht haben | [webAAI TAA](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige) |
| Istruttoria | Luciano Sorlini SPA / Calvagese della Riviera | Aviosuperficie | BS17 | Calvagese della Riviera, Brescia | unklar | nicht belegt | Pratica in corso di istruttoria | nicht als planbare Option werten, bis Betreiber/ENAC bestätigt | [webAAI Lombardia](https://webaai.it/it/aviosuperfici-enac/lombardia) |

### 3.3 Ergänzungen aus dem Korridor-Audit

#### Deutschland und Österreich

| Status | Name / Code | Typ | Koordinaten | Fuel | Betrieb / PPR | Kontakt | Quellen |
|---|---|---|---|---|---|---|---|
| PPR | EDTU Bad Saulgau | ziviler Sonderlandeplatz | 48.029446, 9.507222 | nicht belegt | Online-PPR; R44-Klasse ausdrücklich bestätigen | +49 7581 1610; info@edtu.de | [Betreiber](https://edtu.de/) |
| PPR, HEL belegt | Wildberg | ziviler Sonderlandeplatz | 47.600000, 9.741667 | kein Fuel | mindestens 24 h vorher; 50 h Pilotenerfahrung | +49 8389 271; flugplatz.wildberg@t-online.de | [Piloteninfo](https://flugplatz-wildberg.de/piloten/) |
| PPR, Fuel | EDTP Pfullendorf | Verkehrslandeplatz | 47.908890, 9.250556 | AVGAS 100LL, MOGAS | saisonale Zeiten; sonst PPR, R44 bestätigen | +49 7552 8670 | [Piloteninfo](https://fsv-pfullendorf.de/piloten/) |
| PPR, Fuel | EDNY Friedrichshafen | Verkehrsflughafen/GA | 47.671299, 9.511490 | AVGAS 100LL, Jet A1 | aktuelle GA-Zeiten, Handling und Abstellung bestätigen | +49 7541 284-120 | [Betriebszeiten](https://www.bodensee-airport.eu/en/business-aviation/aviation/hours-of-operation/), [Fuel](https://www.bodensee-airport.eu/business-aviation/aviation/fragen-antworten/) |
| PPR, HEL belegt | EDNL Leutkirch-Unterzeil | Verkehrslandeplatz | 47.858891, 10.014167 | nicht belegt | Hubschrauber bis 6 t; EU-Auslandsflug mindestens 3 h vorher anmelden | +49 7561 3156 | [Piloteninfo](https://www.ednl.de/piloten/) |
| PPR, Fuel | EDMB Biberach | Verkehrslandeplatz | 48.112359, 9.764013 | AVGAS 100LL, Jet A1, Super Plus | HEL zugelassen; außerhalb Betriebszeiten PPR | +49 7351 9734; +49 173 3195223 | [Piloteninfo](https://www.edmb.de/fur-piloten/allgemeines/) |
| AIP, PPR | LOIC Wucher St. Anton | ziviler Heliport | 47.119722, 10.240556 | nicht belegt | VFR Tag/Nacht, MTOM 6.000 kg; PPR | +43 5446 2732; +43 5550 3880 | [Austro Control AD 3](https://eaip.austrocontrol.at/lo/260806/PART_3/AD_3/LO_AD_3_en.pdf), [Wucher](https://www.wucher-helicopter.at/) |
| AIP, PPR | LOJW Wucher Zürs-Lech | ziviler Heliport | 47.184167, 10.157222 | nicht belegt | MTOM 5.700 kg; Gastplanung Tag, Licht nur Rettung/Ambulanz | +43 5446 2732; +43 5550 3880 | [Austro Control AD 3](https://eaip.austrocontrol.at/lo/260806/PART_3/AD_3/LO_AD_3_en.pdf), [Wucher](https://www.wucher-helicopter.at/) |
| AIP, PPR | LOJP Karres | ziviler Heliport | 47.218889, 10.768889 | nicht belegt | VFR Tag/Nacht, MTOM 6.000 kg; PPR | +43 5412 61421 | [Austro Control AD 3](https://eaip.austrocontrol.at/lo/260806/PART_3/AD_3/LO_AD_3_en.pdf) |

#### Italienische ENAC-Flächen

| Nutzungsstatus | Platz | Typ | Koordinaten | Betrieb / Kontakt | Direkte Quellen |
|---|---|---|---|---|---|
| Fremdnutzung offen | Tezze di Ceresara | Aviosuperficie | 45.263294, 10.583206 | 1 Piste; Kontakt nach webAAI-Anmeldung | [ENAC-Platzseite](https://webaai.it/it/aviosuperfici-enac/lombardia/tezze-di-ceresara_A111) |
| Fremdnutzung offen | Ceresara | Aviosuperficie | 45.263611, 10.533333 | 1 Piste; Kontakt nach webAAI-Anmeldung | [ENAC-Platzseite](https://webaai.it/it/aviosuperfici-enac/lombardia/ceresara_A117) |
| Fremdnutzung offen | Moritzing | Elisuperficie | 46.502810, 11.306823 | kein Nachtbetrieb; Betreiber/PPR offen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/moritzing_EA03) |
| Gastanflug belegt, PPR | Schloss Freudenstein | Elisuperficie | 46.464540, 11.247731 | +39 0471 661308; info@schlossfreudenstein.com | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/freudenstein_EC40), [Betreiber/Anreise](https://schlossfreudenstein.com/it/contatto/dove-siamo-e-come-arrivare/) |
| Fremdnutzung offen | Hochplatter | Elisuperficie | 46.630278, 11.195278 | kein Nachtbetrieb; Betreiber/PPR offen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/hochplatter_EC28) |
| Fremdnutzung offen | Quinto / Verona | Elisuperficie | 45.485556, 11.022056 | Nachtbetrieb im Register bejaht; Betreiber/PPR offen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/veneto/quinto_EA07) |
| Fremdnutzung offen | Tirolo | Elisuperficie | 46.692833, 11.161028 | kein Nachtbetrieb; Betreiber/PPR offen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/tirolo_EB90) |
| Betreiber-PPR | Air Corporate / Verona | Elisuperficie / Operator | 45.367531, 10.859217 | +39 045 8600910; info@aircorporate.it | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/veneto/air-corporate_EC21), [Betreiber](https://www.aircorporate.it/) |
| Fremdnutzung offen | Renon / Ritten | Elisuperficie | 46.549627, 11.492635 | kein Nachtbetrieb; Betreiber/PPR offen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/renon_EC31) |
| Gastanflug belegt, PPR | Hotel Andreus | Elisuperficie | 46.769422, 11.225769 | +39 0473 491330; info@andreus.it | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/hotel-andreus-carina_EB64), [Hotel/Anreise](https://www.andreus-resorts.it/en/hosts-team/directions-location/) |
| Betreiber-PPR | BMA Bosio Motori Aeronautica | Elisuperficie | 45.428397, 10.335961 | +39 030 964285; info@bosiomotori.it | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/lombardia/bma-bosio-motori-aeronautica_EA20), [Betreiber](https://www.bosiomotori.it/) |
| Fremdnutzung offen | Goldrain / Latsch | Elisuperficie | 46.623333, 10.822222 | kein Nachtbetrieb; Betreiber/PPR offen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/goldrain_EB43) |
| Fremdnutzung offen | San Martino in Passiria | Elisuperficie | 46.793469, 11.231900 | 2 FATO; kein Nachtbetrieb; Betreiber/PPR offen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/san-martino-in-passiria_EA79) |
| Fremdnutzung offen | Villanderer Alm | Elisuperficie | 46.648889, 11.490833 | Berg-/Schutzgebietslage und Betreiber prüfen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/villanderer-alm_EA60) |
| Gastanflug belegt, PPR | Felder Alpin Lodge | Elisuperficie | 46.636944, 11.530556 | info@felder-alpin.com; Telefon +39 335 8474817 nur sekundär belegt | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/felder_EA33), [Unterkunft/Anreise](https://www.felder-alpin.com/location/) |
| Fremdnutzung offen | Brembach | Elisuperficie | 46.594078, 11.584486 | Berg-/Schutzgebietslage und Betreiber prüfen | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/brembach_EA21) |
| Betreiber-PPR | Elikos / Pontives | Elisuperficie / Helikopterbasis | 46.586772, 11.630583 | +39 331 8877888; info@elikos.com; benachbarte ELIGARDENA-Fläche separat registriert | [ENAC Elikos](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/elikos_EA29), [Betreiber](https://www.elikos.com/helicopter/contact.php), [ENAC ELIGARDENA](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/eligardena_EA66) |
| Gastanflug belegt, PPR | Tenne Lodges | privater Heliport / Elisuperficie | 46.865000, 11.305556 | +39 0472 433300; info@tenne-suedtirol.com | [ENAC-Platzseite](https://webaai.it/it/elisuperfici-enac/trentino_alto_adige/tenne-lodges-platform_EC07), [Hotel/Heliport](https://www.tenne-suedtirol.com/de/lodges-chalets/preisinfos-faqs) |

#### Nicht in der operativen Marker-Ebene

| Gruppe / Beispiele | Grund |
|---|---|
| LIPL Ghedi, rein militärische Plätze | keine belegte zivile Privat-/GA-Nutzung |
| LOJR Mittelberg, LOIP Ischgl-Idalpe, LOIV/LOJI/LOIX sowie AIUT ALPIN | offiziell auf Rettung, Ambulanz, Zivilschutz, Krankenhaus oder Behördenzwecke beschränkt |
| LOJH Hochgurgl | AIP nennt überwiegend Rettungs- und Katastrophenbetrieb; zivile Gastnutzung nicht hinreichend belegt |
| BS17 Luciano Sorlini und Storo | ENAC-Verfahren noch in Bearbeitung (`pratica in corso di istruttoria`) |
| BS02 Lonato Campo Volo, TN05 Vervò, TN03 Termon, BS06 La Zappaglia, BS07 Corry's, MN13 Roverbella | zivile VDS-/UL-Referenzen im Sekundärregister, aber keine belastbare R44-/AG-Nutzungsfreigabe; daher keine operative Landeoption |
| Berg, Wangen-Kißlegg, Reute/Bad Waldsee, Agathazell sowie reine Segelflug-/UL-Flächen am deutschen Streckenanteil | Betreiberquellen erlauben keine Hubschraubernutzung oder eine solche ist nicht belastbar veröffentlicht |

## 4. Priorisierte Fuel-Planung

Für die R44 ist die belastbare AVGAS-Kette aktuell:

1. EDTM Mengen-Hohentengen: Start/Fuel, AVGAS 100LL offiziell genannt.
2. LIPB Bozen: nur vorher mit Aero Club Bolzano klären, da AVGAS/MOGAS ausdrücklich nur auf Anfrage und nach Verfügbarkeit.
3. LIDT Trento: stärkster italienischer Fuel-Anker im Zielgebiet, AVIO 100LL H24 laut Betreiberseite.
4. LIPN Verona Boscomantico: möglich, aber saisonale Öffnungszeiten und Montag geschlossen.
5. LIDH Thiene: AVGAS laut Betreiber, als östlicher Alternate/Fuel-Punkt vorab bestätigen.
6. LIDL Legnago: AV-GAS laut Betreiberbriefing, Betriebszeiten/PPR beachten.
7. LILR Cremona: AVGAS 100LL laut Aero Club, Verfügbarkeit vorab bestätigen.
8. LIPX Verona Villafranca und LIPO Brescia Montichiari: kein AVGAS; nur als Jet-A1-/Handling-/Alternate-Thema relevant, nicht als R44-Fuel-Stop.

Kraftstoff-Legende im Dashboard:

- `100LL` blau: AVGAS 100LL wird ausdrücklich genannt; Blau folgt der dokumentierten Kraftstofffärbung.
- `AVGAS` grün: AVGAS/AV-GAS wird genannt, die konkrete Sorte aber nicht eindeutig als 100LL ausgewiesen.
- `JET A-1` schwarz/anthrazit: Jet A-1 ist zusätzlich belegt; die Farbe folgt der Kennzeichnung von Jet-Fuel-Betankungsanlagen. Der Kraftstoff selbst ist farblos bis strohfarben, nicht lila. Für den R44 mit Kolbenmotor ist er kein Ersatz für zugelassenes AVGAS.
- `MOGAS` orange: Mogas, Mo-Gas, Super Plus oder `Benzina verde` wird genannt. Die individuelle Freigabe von Hubschrauber, Motor und STC bleibt zwingend.
- `BLEIFREI` oliv: Die Quelle nennt nur generisch `unleaded`; daraus wird bewusst weder UL91 noch UL94 abgeleitet.
- `NO AVGAS` rot: AVGAS ist nach der Quelle nicht verfügbar.

Für die Platzkategorien gibt es ebenfalls keine universelle italienische Farbe, die `Aeroporto`, `Aviosuperficie`, `Campo di volo` und `Elisuperficie` in allen Kartenprodukten identisch codiert. Deshalb ist im Dashboard die Form primär: Aeroporto als blauer Pin, Aviosuperficie als grüner Rhombus, Campo di volo als oranges Quadrat und Elisuperficie/Heliport als magentafarbener Kreis mit weißem `H`. Das weiße `H` folgt der physischen ICAO-Heliportmarkierung; Magenta ist eine verbreitete Kartenkonvention, aber kein behaupteter ENAV-Farbstandard. Referenzen: [FAA Chart User's Guide](https://www.faa.gov/air_traffic/flight_info/aeronav/Digital_Products/aero_guide/), [ICAO Annex-14-Heliport-Hinweis](https://www.icao.int/APAC/Meetings/2014%20AOPWP2/WP%2019_Revision%201.pdf), [FAA Fuel Handbook](https://www.faa.gov/sites/faa.gov/files/04_amtp_ch2.pdf), [EASA Fuel FAQ](https://www.easa.europa.eu/en/the-agency/faqs/fuel).

Telefonische Mindestprüfung vor Abflug:

- EDTM: Fuel offen, Uhrzeit, PPR/Sonderzeiten, Abstellung.
- LIPB: Aero Club erreicht? AVGAS tatsächlich verfügbar? Zahlung? Betriebszeit? Zoll/Handling?
- LIDT: AVIO 100LL tatsächlich verfügbar, Self-Service-Limit, Rechnung ja/nein, AFIS/Anflugbriefing.
- LIPN: geöffnet am geplanten Datum, AV-GAS verfügbar, Abstellung/PPR.
- LIDH/LIDL/LILR: AVGAS am konkreten Tag verfügbar? Zahlungsart? Betriebszeiten/Extraöffnung/PPR?

## 5. Karte

Die zugehörige interaktive Karte liegt hier:

[helikopter-italien-karte.html](/Users/emanuelknodler/Documents/FILIPOVIC-RAUMWERK/helikopter-italien-karte.html)

Darstellung:

- blaue Pin-Marker: Aeroporto, also regulärer Flughafen/Flugplatz mit ICAO-Code.
- grüne Rhomben: Aviosuperficie, also eine italienische zivile Sonderlandefläche.
- orange Quadrate mit weißem Kontrastrahmen: Campo di volo, also VDS-/UL-Fluggelände; für den R44 nicht automatisch zugelassen.
- magentafarbene runde Marker mit weißem `H`: Elisuperficie beziehungsweise ziviler Heliport; der Text im Popup trennt beide Kategorien.
- blaues Label "100LL": AVGAS/AVIO 100LL nach aktueller Quellenlage verfügbar.
- grünes Label "AVGAS": AVGAS belegt, Sorte in der Quelle nicht eindeutig genannt.
- türkis/orange/oliv: zusätzlich belegtes Jet A-1, Mogas beziehungsweise nicht näher spezifiziertes bleifreies Benzin.
- graues Label "?": Fuel unbekannt oder nicht belegt.
- rotes Label "NO AVGAS": Jet A1/Handling möglich, aber kein AVGAS.
- orange Warnstatus: PPR, private Fläche, Schutzgebiet oder Rechtslage offen.

Nicht in der nutzbaren Kartenebene:

- Rein militärische Plätze oder Plätze ohne belegte zivile Nutzung, z.B. `LIPS Treviso Istrana`, werden bewusst nicht als nutzbare Marker eingetragen.
- Plätze mit "Pratica in corso di istruttoria" oder ohne Betreiberfreigabe bleiben Kandidaten/Prüffälle, nicht finale Landeempfehlungen.
- `LIPX Verona Villafranca` bleibt trotz zivil/militärischem Charakter in der Karte, weil die offizielle Betreiberseite private/GA-Handling und PPR explizit nennt; für die R44 ist der Platz wegen "AVGAS not available" kein Fuel-Stop.

### 5.1 Koordinaten, Kontakte und SkyDemon-Export

Die Popups der Karte enthalten zusätzlich:

- Dezimalkoordinaten im Format `lat, lon`, z.B. `46.021400, 11.125000`.
- DMS-Koordinaten zur manuellen Gegenprüfung.
- Betreiber-Telefon, sofern in den bisher verifizierten Kontakt-/Betreiberquellen enthalten; falls kein belastbarer Betreiberkontakt vorliegt, steht dort bewusst "noch nicht belastbar verifiziert".
- Button "Koordinaten kopieren" für schnelle Übernahme in andere Tools.
- Links zu Google Maps, OpenStreetMap und zur jeweiligen Quelle.

Für SkyDemon ist zusätzlich ein GPX-Wegpunkt-Export vorgesehen:

[helikopter-italien-waypoints.waypoints.gpx](/Users/emanuelknodler/Documents/FILIPOVIC-RAUMWERK/helikopter-italien-waypoints.waypoints.gpx)

SkyDemon kann User Waypoints im GPX-Format importieren; für SkyDemon ist die Dateiendung `.waypoints.gpx` zweckmäßig. Auf Desktop erfolgt der Import in der Waypoints-Bibliothek, auf iOS/Android typischerweise durch Öffnen/Teilen der GPX-Datei mit SkyDemon. Der Export ersetzt keine geprüfte Luftfahrtdatenbank, sondern ist eine vorbereitende Arbeitsliste.

Zusätzlich:

[helikopter-italien-waypoints.csv](/Users/emanuelknodler/Documents/FILIPOVIC-RAUMWERK/helikopter-italien-waypoints.csv)

### 5.2 Mobile Bereitstellung für den Piloten

Pragmatische Empfehlung:

- Für SkyDemon: `helikopter-italien-waypoints.waypoints.gpx` an den Piloten senden und in SkyDemon als User Waypoints importieren. Das ist für die praktische Flugvorbereitung der wichtigste Übergabeweg.
- Für das visuelle Briefing: `helikopter-italien-karte.html` online stellen oder als Datei senden. Die Platzdaten sind in der HTML-Datei eingebettet; Kartenkacheln/Leaflet werden online geladen, sofern die Datei nicht zusätzlich technisch als vollständiges Offline-Paket gebaut wird.
- Für temporären mobilen Abruf: statische Veröffentlichung über GitHub Pages, Cloudflare Pages, Netlify oder vergleichbar. Bei nicht-öffentlichen Planungsdaten besser passwortgeschütztes Hosting oder Dateiweitergabe statt öffentlich indexierbarer Seite.
- Für echten Offline-Einsatz im Cockpit: nicht auf die HTML-Karte verlassen, sondern GPX-Waypoints in SkyDemon plus reguläre AIP/NOTAM/Briefingdaten verwenden.

## 6. Italien: Außenlandungen, Privatgrundstücke und Genehmigungspflichten

Dieser Abschnitt ist besonders sicherheits- und rechtsrelevant. Er ersetzt keine Rechtsberatung und keine Entscheidung des verantwortlichen Piloten/Operators.

### 6.1 Nationale Grundregel

Nach ENAC/italienischem Regelwerk sind gelegentliche Helikopterflächen ("elisuperfici occasionali") nicht mit einem normalen, dauerhaft betriebenen Flugplatz gleichzusetzen. Aus den verfügbaren offiziellen Quellen und dem D.M. 1 febbraio 2006 ergeben sich für Privatflüge insbesondere diese Punkte:

- Eine gelegentliche Elisuperficie ist eine geeignete Fläche, auf der nach Einschätzung des Piloten gelegentliche Start-/Landemanöver möglich sind.
- Für gelegentliche Elisuperfici sind kein permanenter Gestore, keine dauerhafte Kennzeichnung und nicht dieselbe Infrastruktur wie bei einer permanenten Elisuperficie erforderlich.
- Der Pilot bleibt für Auswahl der Fläche, sichere Durchführung und Einhaltung von Umwelt-/Raumordnungs-/Territorialregeln verantwortlich.
- Bei privatem Grundstück ist die Zustimmung des Eigentümers erforderlich.
- Bei staatlichem oder öffentlichem Grund ist ein "nulla osta" bzw. eine Nutzungskonzession der zuständigen Verwaltungsbehörde erforderlich.
- Die gelegentliche Nutzung ist nach D.M. 1 febbraio 2006 für Hubschrauber auch bei privater Luftfahrt vorgesehen, aber auf Flüge mit Start und Ziel im italienischen Staatsgebiet ohne Zwischenlandung in einem anderen Staat begrenzt. Praktisch heißt das: Nicht direkt aus Deutschland auf ein italienisches Privatgrundstück als "occasional helipad" planen; zuerst an einem regulären italienischen Flugplatz/Flughafen einreisen/landen und danach inneritalienisch weiterplanen, sofern alle anderen Bedingungen erfüllt sind.
- Die Fläche darf nicht gegen lokale Umwelt-, Naturpark-, Landschaftsschutz-, Gemeinde- oder Sicherheitsregeln verstoßen.

Quellenbasis:

- [ENAC Regolamento Rev. 2/2026](https://www.enac.gov.it/regolamento-liberalizzazione-delluso-delle-aree-di-atterraggio-avio-idro-elisuperfici-ed-1-rev2-del-05/02/2026/)
- [ENAC Avio-Idro-Elisuperfici Hinweise](https://www.enac.gov.it/aeroporti/infrastrutture-aeroportuali/avio-eli-idrosuperfici)
- [D.M. 1 febbraio 2006, Gazzetta Ufficiale Abdruck](https://gazzettaufficiale.biz/atti/2006/20060106/06A04323.htm)
- [ENAC Portal für gelegentliche Avio-/Eli-/Idrosuperfici](https://avio-occasionali.enac.gov.it/login)

### 6.2 Kommunikation / Anmeldung

ENAC betreibt seit 2025/2026 ein Portal für die Kommunikation der Öffnung gelegentlicher Avio-/Eli-/Idrosuperfici. ENAC schreibt, dass ab 01.06.2025 die Kommunikation der Öffnung gelegentlicher Flächen über den informatischen Kanal erfolgen soll; ausländische Piloten können laut ENAC-Hinweis nach Akkreditierung mit Username/Passwort zugreifen.

Konsequenz für Planung:

- Für eine private Außenlandung in Italien nicht nur Eigentümerzustimmung einholen.
- Vorab klären, ob die konkrete Fläche als "elisuperficie occasionale" über das ENAC-Portal kommuniziert werden muss.
- Zuständige öffentliche Sicherheitsbehörde/Questura/Carabinieri und ENAC-Direzione Territoriale Nord-Est bzw. Bergamo/Milano nach Gebiet prüfen.
- Für Zielgebiet Trentino-Alto Adige/Veneto ist ENAC Direzione Territoriale Nord-Est relevant; für Brescia/Gardasee-Lombardei nach ENAC-Liste Direzione Bergamo.

### 6.3 Südtirol / Bozen

Südtirol hat zusätzlich zu ENAC/SERA eigene Schutzgebiets- und Überflugregeln. Die offizielle Provinzseite nennt eine Regelung mit Überflugkorridoren und permanenten Elisuperfici. Der Überflug eines Korridors muss laut Provinz gemeldet werden; für die Nutzung der genannten permanenten Heliflächen muss der jeweilige Betreiber kontaktiert werden.

Von der Provinz genannte permanente Elisuperfici:

- Jëuf de Frea / Passo Gardena.
- Seceda.
- Plan de Corones / Kronplatz.
- Sonnklar / Speikboden.
- Maso Corto / Senales.

Die Provinz stellt außerdem einen Geocatalogo bereit, mit dem No-Fly-Zonen, Naturparks/Biotope, Hindernisse und die geplante Route geprüft werden können. Dieser Layer ist für Gardena/Seceda/Kronplatz und alle Berg-/Hotel-/Rifugio-Ideen zwingend in die Vorprüfung einzubeziehen.

Planungsfolge:

- Jeden Außenlande-, Hotel-, Rifugio- oder Berglandeplatz gegen den Südtiroler No-Fly-/Schutzgebietslayer prüfen.
- Auch ENAC/webAAI-gelistete Elisuperfici nur mit Betreiberfreigabe, PPR und Provinz-/Schutzgebietsprüfung behandeln.
- Nicht aus einer ENAC/webAAI-Listung ableiten, dass ein touristischer Privatflug ohne weitere lokale Prüfung zulässig ist.
- Zuständige Stelle: Ufficio Infrastrutture e mobilità sostenibile, Tel. +39 0471 414640, inframob@provincia.bz.it, PEC inframob@pec.prov.bz.it.

Quelle:

- [Provinz Bozen - Divieto di sorvolo](https://mobilitaet.provinz.bz.it/it/divieto-di-sorvolo)

### 6.4 Trentino

Trentino ist für die gewünschten Berg-, Rifugio- und Gardasee-Nordoptionen besonders kritisch. Die offizielle Provinzseite verweist auf die Landesregel L.P. 5/1996 und nennt für Gebiete oberhalb 1.600 m MSL sowie geschützte Gebiete, z.B. Naturparks, Verbote für Start, Landung und Überflug in niedrigen Höhen. Auf der Seite werden als Schwellen für die Verbotslogik 300 m bzw. 500 m über Grund genannt; diese Werte sind lokale Schutzgebietsregeln und laufen zusätzlich zu SERA/AIP/NOTAM.

Die digitale Antragstellung ist laut Provinz seit 14.04.2025 aktiv und seit 01.07.2025 für die dort beschriebene Konstellation nur noch online über die "Stanza del Cittadino" vorgesehen. Die Provinz nennt 20 Tage maximale Bearbeitungszeit und verlangt die Anfrage mindestens 5 Tage vor der geplanten Aktivität.

Wichtige Einschränkung: Die verifizierte Provinzseite beschreibt ausdrücklich Flüge für öffentliches Interesse, Forschung, Studie oder technisch-wissenschaftliche Dokumentation. Für rein private/touristische Außenlandungen ist daraus keine pauschale Erlaubnis ableitbar. Genau dieser Punkt muss vor einem konkreten Rifugio-, Hotel- oder Privatgrundstücksplan mit Provinz, ENAC/territorialer Direktion, Eigentümer und ggf. Gemeinde geklärt werden.

Planungsfolge:

- Berg-, Rifugio-, Hotel- und Schutzgebietsoptionen in Trentino nicht als frei nutzbar ansehen.
- Bei jeder Trentino-Außenlandeidee prüfen: liegt die Fläche über 1.600 m MSL, in einem Schutzgebiet, in einem Park/Biotop oder in einer lokal beschränkten Zone?
- Klären, ob ein privater/touristischer Zweck genehmigungsfähig ist oder ob die offizielle Derogationslogik nur für die genannten Zwecke offensteht.
- Zuständige Stelle laut Provinzseite: Ufficio gestione dei servizi pubblici di trasporto speciali, Tel. +39 0461 497981, serv.mobilitapubblica@provincia.tn.it, PEC serv.mobilitapubblica@pec.provincia.tn.it.

Quellen:

- [Provinz Trento - Autorizzazione attività atterraggio/decollo/sorvolo](https://www.provincia.tn.it/Servizi/Autorizzazione-attivita-atterraggio-decollo-e-sorvolo-per-motivi-ricerca-studio)
- [LIDT / Trentino Trasporti Services](https://www.trentinotrasporti.it/it/aeroporto/aeroporto-caproni/servizi)

### 6.5 Mindesthöhen, Schutzgebiete und No-Fly-Zonen

Die allgemeine europäische VFR-Mindesthöhe nach SERA.5005 ersetzt keine lokalen Verbote oder Schutzgebietsregeln. Sie ist die Untergrenze, solange keine strengere nationale, regionale, AIP-, NOTAM-, Schutzgebiets- oder ATC-Regel gilt.

Für VFR-Flüge gelten nach SERA.5005(f), außer Start/Landung oder ausdrücklicher behördlicher Erlaubnis:

- Über Städten, Ortschaften, besiedelten Gebieten oder Menschenansammlungen im Freien: mindestens 300 m / 1.000 ft über dem höchsten Hindernis innerhalb von 600 m um das Luftfahrzeug.
- In allen anderen Bereichen: mindestens 150 m / 500 ft über Grund oder Wasser bzw. 150 m / 500 ft über dem höchsten Hindernis innerhalb von 150 m um das Luftfahrzeug.

Zusätzliche SERA-Punkte für diese Planung:

- In Berggebieten können für Nacht-VFR höhere Sicht-/Wolkenabstandsminima vorgeschrieben sein.
- Die zuständige Behörde kann höhere Mindesthöhen oder besondere Bedingungen über AIP, verbotene Gebiete, beschränkte Gebiete oder andere veröffentlichte Luftraumregeln festlegen.
- In verbotenen oder beschränkten Gebieten darf nur nach den veröffentlichten Bedingungen oder mit Freigabe der zuständigen Behörde geflogen werden.

Konservativer Planungsansatz:

- Für Südtirol den offiziellen Geocatalogo mit NoFlyZones-Layer gegen die geplante Route und jeden Landeort prüfen.
- Für Trentino bei Flächen über 1.600 m MSL und in geschützten Gebieten gesondert prüfen, ob Start, Landung oder niedriger Überflug verboten bzw. genehmigungspflichtig sind.
- AIP Italia, RAIT, NOTAM, lokale Schutzgebietsregeln und ATC-Freigaben gehen immer vor der Arbeitskarte.

Quellen:

- [EASA SERA.5005 Visual flight rules](https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-standardised-european?erules-id=ERULES-1963177438-9807)
- [Provinz Bozen - Divieto di sorvolo / Geocatalogo](https://mobilitaet.provinz.bz.it/it/divieto-di-sorvolo)
- [Provinz Trento - L.P. 5/1996 Schutzgebiete und Höhen](https://www.provincia.tn.it/Servizi/Autorizzazione-attivita-atterraggio-decollo-e-sorvolo-per-motivi-ricerca-studio)

## 7. Flugplanpflicht innerhalb Italiens

### 7.1 Grenzüberschreitender Flug

Für Deutschland -> Italien ist nach SERA.4001 ein Flugplan erforderlich, weil der Flug internationale Grenzen überschreitet, sofern keine abweichende staatliche Ausnahme greift.

Quelle:

- [EASA SERA.4001](https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-standardised-european?erules-id=ERULES-1963177438-9807)

### 7.2 Inneritalienischer VFR-Flug

Ein vollständiger Flugplan ist für einen rein inneritalienischen VFR-Tagflug nicht pauschal immer erforderlich. Er ist aber erforderlich bzw. Flugplaninformationen sind einzureichen für Flüge oder Flugabschnitte mit ATC-Service, für kontrollierte Lufträume/Flughäfen soweit Freigaben erforderlich sind, für durch die zuständige Behörde bestimmte Gebiete/Routen, für IFR-Konstellationen und für Nachtflug, wenn die Umgebung eines Flugplatzes verlassen wird.

SERA stellt außerdem klar, dass "flight plan" auch reduzierte/limitierte Informationen meinen kann, z.B. für eine Freigabe, um einen Airways-Abschnitt zu kreuzen oder an einem kontrollierten Flugplatz zu starten/landen. Das entspricht praktisch dem Konzept eines abgekürzten Flugplans per Funk für bestimmte Flugabschnitte.

Konservativer Planungsansatz:

- Für reine lokale/inneritalienische VFR-Hops kann "kein voller FPL" möglich sein, wenn keine einschlägigen SERA-/AIP-/ATC-Pflichten greifen.
- Bei kontrolliertem Luftraum, CTR/ATZ, kontrolliertem Flugplatz, Nachtflug oder unklarer Lage: vorher vollständigen FPL oder mindestens erforderliche Flugplaninformationen mit ATS/ARO klären.
- Le Panizze weist ausdrücklich auf Schließung eines abgekürzten Flugplans ohne vollständigen FPL hin; dort also Betreiberhinweise beachten.
- Finale Entscheidung: aktuelles ENAV AIP ENR 1.10, RAIT und NOTAM prüfen.

Quellen:

- [EASA SERA.4001](https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-standardised-european?erules-id=ERULES-1963177438-9807)
- [ENAC RAIT / Regole dell'Aria Italia](https://www.enac.gov.it/la-normativa/normativa-enac/regolamenti/regolamenti-ad-hoc/)
- [Le Panizze Hinweis zu abbreviated/full flight plan closure](https://lepanizze.it/en/contacts/)

## 8. Behörden- und Betreiberkontakte

| Thema | Stelle | Gebiet | Kontakt | Quelle |
|---|---|---|---|---|
| Start/Fuel EDTM | Regio Airport Mengen | Deutschland | +49 07572 711047; +49 07572 769 601 0; info@regio-airport-mengen.de | [EDTM Betreiber](https://www.regio-airport-mengen.de/piloteninfo/flugplatzdaten/) |
| Avio-/Eli-Regelwerk | ENAC | Italien | supporto.aviosuperfici@enac.gov.it; protocollo@pec.enac.gov.it | [ENAC Avio-Idro-Elisuperfici](https://www.enac.gov.it/aeroporti/infrastrutture-aeroportuali/avio-eli-idrosuperfici) |
| Gelegentliche Flächen | ENAC Portal | Italien | Portalzugang, Ausländer nach Akkreditierung | [ENAC Portal](https://avio-occasionali.enac.gov.it/login) |
| AIP/NOTAM | ENAV | Italien | online über ENAV AIM/AIP | [ENAV AIP](https://www.enav.it/en/services/online-services/aeronautical-information-management/aip-italia) |
| LIPB GA | ABD Airport Bolzano | Bozen | +39 0471 255 207; generalaviation@bolzanoairport.it | [BZO Fuel](https://www.bolzanoairport.it/en/fuel) |
| LIPB AVGAS | Aero Club Bolzano | Bozen | +39 0471 250165; info@aeroclub.bz | [BZO Fuel](https://www.bolzanoairport.it/en/fuel) |
| LIDT Betrieb | Trentino Trasporti / Aeroporto Caproni | Trento | +39 0461 031000; airport@trentinotrasporti.it laut ENAC Surface-Eintrag | [LIDT Services](https://www.trentinotrasporti.it/en/airport/aeroporto-caproni), [ENAC Surface AVIO](https://avio-superfici.enac.gov.it/en/public/surface/show/2025) |
| LIPX Handling | Verona Villafranca | Verona | +39 045 8095666; Handler siehe AGS/GH/Sky Services/Argos/Delta | [VRN Private Jets](https://www.aeroportoverona.it/en_gb/flights/private-jets) |
| Le Panizze | Coltri Immobiliare / Betreiber | Lonato del Garda | Claudio +39 335 5378373; Ugo +39 335 406584; Mattia +39 331 3611207 | [Le Panizze Contacts](https://lepanizze.it/en/contacts/) |
| Salò - Lago di Garda | Betreiber laut früherem ENAC-Eintrag | Salò | 3457770606; paolopern@gmail.com; vor Nutzung aktuell bestätigen | [webAAI Salò](https://webaai.it/it/elisuperfici-enac/lombardia/salo-lago-di-garda_EC10), [früherer ENAC-Eintrag](https://avio-superfici.enac.gov.it/it/public/surface/show/2253) |
| Südtirol Schutzgebiete | Provinz Bozen | Bozen/Südtirol | +39 0471 414640; inframob@provincia.bz.it, vor Nutzung offiziell bestätigen | [Provinz Bozen](https://mobilitaet.provinz.bz.it/it/divieto-di-sorvolo) |
| Trentino Derogationen | Provinz Trento | Trentino | +39 0461 497981; serv.mobilitapubblica@provincia.tn.it, vor Nutzung offiziell bestätigen | [Provinz Trento](https://www.provincia.tn.it/Servizi/Autorizzazione-attivita-atterraggio-decollo-e-sorvolo-per-motivi-ricerca-studio) |

## 9. Offene Prüfungen vor finaler Flugplanung

- Aktuelle NOTAM für EDTM, LIPB, LIDT, LIPN, LIPX und alle geplanten Avio-/Elisuperfici.
- ENAV AIP ENR 1.10 und AD-Datenblätter am Flugtag prüfen.
- webAAI/Avioportolano mit Registrierung nutzen, um Detaildaten der ENAC-gelisteten Elisuperfici abzurufen.
- Jede AVGAS-Aussage telefonisch oder per Mail bestätigen.
- Jede Gardasee-/Hotel-/Berglandeoption mit Betreiber, ENAC-Status, Gemeinde/Provinz und Eigentümerfreigabe prüfen.
- Außenlandung nach Deutschland-Italien-Grenzflug nicht direkt auf Privatgrundstück planen; erst nach italienischer Ankunft inneritalienische Rechtslage sauber prüfen.
