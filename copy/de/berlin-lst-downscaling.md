---
title: "Masterarbeit · Berliner Hitze auf 10 m"
summary: "Meine Masterarbeit prüft, welche Stadtdaten helfen, die Oberflächentemperatur in Berlin von 100 m auf 10 m Auflösung zu rekonstruieren."
role: "Masterarbeit: Fragestellung, Datenpipeline, Modelle, Auswertung"
period: "2026, Abgabe im Dezember 2026"
status: "laufend"
links:
  - label: "Code auf GitHub"
    href: "https://github.com/spignotti/berlin-lst-downscaling"
key_figures:
  - label: "Auflösung"
    value: "100 m → 10 m"
  - label: "Datenzeitraum"
    value: "2017 bis 2025"
  - label: "Untersuchungsgebiet"
    value: "Berlin, Warmsaison Mai bis September"
---

## Problem

Landsat misst die Oberflächentemperatur mit etwa 100 m Auflösung. Das reicht für große Muster, aber nicht für Fragen auf der Ebene von Blöcken und Straßenräumen. Dort entscheiden Gebäude, Bäume, Versiegelung und Schatten über die Temperatur. Sentinel-2 und die Berliner Geodaten zeigen diese Strukturen mit 10 m, messen aber keine Temperatur. Downscaling verbindet beide Ebenen. Offen ist, welche Stadtdaten dabei wirklich helfen. Es gibt außerdem keine unabhängige thermale Referenz auf 10 m, an der man das Ergebnis direkt messen könnte.

## Vorgehen

**Das Modell bleibt fest, nur die Eingänge ändern sich.** Ein residuales 2D-U-Net sagt die Temperatur auf 10 m voraus, als Korrektur eines groben Ausgangswerts. Architektur und Training bleiben über alle Stufen gleich. In fünf Stufen kommen Informationen dazu: Spektraldaten von Sentinel-2, Stadtmorphologie, Verschattung, Wetterdaten aus ERA5-Land und zuletzt ein Trainingsziel, das Temperaturstrukturen stärker gewichtet. Zusätzliche Läufe lassen einzelne Gruppen weg. So lässt sich der Beitrag jeder Gruppe getrennt ablesen. Eine neue Architektur zu entwickeln war nicht das Ziel.

**Gelernte Merkmale als Gegenprobe.** Ein zusätzlicher Vergleichsarm ersetzt die handgebauten Morphologie- und Schattenkanäle durch gelernte Jahres-Embeddings aus Sentinel-1 und Sentinel-2, die keine Temperaturdaten enthalten. Er zeigt, ob sich der Aufwand für eigene Kontextgruppen lohnt oder ob allgemeine Embeddings dasselbe leisten.

**Eine Spektralquelle, strenge Datenregeln.** Landsat liefert nur die Zieltemperatur, alle optischen Eingänge kommen von Sentinel-2. So gibt es keinen Sensorwechsel zwischen Training und Anwendung. Eine 100-m-Zelle zählt nur, wenn der Landsat-Wert und alle 100 zugehörigen 10-m-Pixel gültig sind. Fehlende Werte fülle ich nicht auf, und die Skalierung schätze ich nur aus den Trainingsjahren. Szenen wähle ich nicht nach Temperatur aus, denn eine Auswahl von Hitzetagen sagt nichts über die Güte des Downscalings.

**Getrennte Jahre und getrennte Flächen.** Trainiert wird auf 2017 bis 2023, ausgewählt auf 2024, getestet einmal auf 2025, nachdem das Modell feststeht. Weil das Modell die Validierungsflächen aus dem Training kennt, kommt ein räumlicher Test dazu: Ganze Blöcke der Stadt bleiben im Training außen vor.

**Bewertung dort, wo gemessen wurde.** Ich vergleiche die Modelle auf 100 m, nachdem die 10-m-Vorhersage wieder zusammengefasst wurde. Eine naive Hochrechnung des groben Werts und ein Random Forest dienen als Referenzen, mit derselben Maske und derselben Kennzahl. Aussagen über 10 m sind eine Einordnung, kein Messergebnis.

**Nach einer Datenkorrektur alles neu rechnen.** Während der Arbeit zeigte sich ein Versatz in den Sentinel-2-Reflektanzen neuerer Verarbeitungsstände und ein Fehler in den Gebäudedaten. Ich habe beides korrigiert, die Merkmale neu erzeugt und alle Modellläufe neu gerechnet, statt die alten Zahlen weiterzuverwenden.

## System

Eine versionierte Auswahl legt fest, welche Landsat-Szenen in die Arbeit eingehen und welche Sentinel-2-Aufnahme zu jeder gehört. Von 290 Paaren bleiben 286; vier fallen heraus, weil Sentinel-2 einen Teil Berlins nicht abdeckt. Daraus entstehen analysefertige Raster auf einem gemeinsamen 10-m-Gitter in EPSG:25833. Aus Berliner Geodaten, darunter LoD2-Gebäude, Gelände, Vegetationshöhe und Versiegelung, berechnet die Pipeline Höhen, Bedeckungsgrade, Sky-View-Factor und Schatten. Je Szene kommen Wetterwerte aus ERA5-Land dazu. Am Ende steht je Szene ein Stapel mit 22 Kanälen und einer Maske der gültigen Pixel. Für das Training schneidet die Pipeline daraus Ausschnitte von 160 × 160 Pixeln, im aktuellen Datenstand insgesamt 8.078 Stück.

Jedes Produkt erscheint mit einem STAC-Eintrag, Herkunftsangaben und einer Fertigmeldung, die zuletzt geschrieben wird. Ohne diese Meldung gilt ein Produkt als nicht veröffentlicht. Eigene Prüfskripte kontrollieren jede Stufe. Die Daten liegen in Google Cloud Storage, trainiert wird auf Vertex AI, die Läufe protokolliert Weights & Biases.

## Ergebnis

Die Datenpipeline ist fertig und reproduzierbar, von der Szenenauswahl bis zum Trainingsdatensatz für die Sommermonate 2017 bis 2025. Alle Stufen sind inzwischen auf dem korrigierten Datenstand trainiert; der einmalige Test auf 2025 bleibt bis zur Abgabe verschlossen. [OFFEN: Ergebnisse aller Stufen, des Random Forest und des räumlichen Tests nach der Abgabe am 22.12.2026.] Mit dem fertigen Modell soll eine mehrjährige 10-m-Zeitreihe der Oberflächentemperatur für Berlin entstehen.

## Grenzen

Es gibt keine unabhängige Temperaturmessung auf 10 m. Die Bewertung findet deshalb auf 100 m statt, und die 10-m-Muster sind eine Rekonstruktion, keine Messung. Der grobe Ausgangswert stammt aus derselben Szene. Die Daten decken nur die Warmsaison von Mai bis September und den Zeitpunkt des Satellitenüberflugs ab. Ein Vergleich mit ECOSTRESS als unabhängiger Quelle ist geplant, aber noch kein Ergebnis. Berlin ist eine Fallstudie; auf andere Städte lassen sich die Befunde nicht ohne Weiteres übertragen.

## Abbildungen

1. **Datenfluss (Abb. 1).** Art: Datenfluss, horizontal. Zeigt Quellen (Landsat 8/9, Sentinel-2, Berliner Geodaten, ERA5-Land) → Szenenauswahl → analysefertige Raster → Kontext (Morphologie, Schatten, Wetter) → Feature-Stack mit 22 Kanälen → U-Net → Temperatur auf 10 m. Akzent: der Feature-Stack. Bildunterschrift DE: „Von den Rohdaten zur Temperatur auf 10 m.“ EN: „From raw data to temperature at 10 m.“
2. **Ablationsstufen (Abb. 2).** Art: Methodendiagramm, fünf Stufen übereinander auf einem festen U-Net. Stufe 1 Spektral, Stufe 2 plus Morphologie, Stufe 3 plus Schatten, Stufe 4 plus Wetter, Stufe 5 gleiches Input mit thermalsensitivem Trainingsziel. Referenz: ablation-stages.svg im Repo. Akzent: Ergebnis Stufe 1. Bildunterschrift DE: „Fünf Stufen auf einem festen Modell. Jede Stufe fügt eine Informationsgruppe hinzu.“ EN: „Five stages on one fixed model. Each stage adds one group of inputs.“
3. **Karte 100 m neben 10 m (Abb. 3).** Art: Karte, zwei gleich große Ausschnitte eines Berliner Gebiets nebeneinander, links 100 m, rechts 10 m, Farbskala Graphit bis Terrakotta. Bis echte Modellausgaben freigegeben sind, als illustratives Raster mit dem Hinweis aus `meta.md`. Kein Akzent. Bildunterschrift DE: „Derselbe Ausschnitt auf 100 m und auf 10 m. Illustrativ, keine Messdaten.“ EN: „The same area at 100 m and at 10 m. Illustrative, not measured data.“
4. **Ergebnis (Abb. 4).** [OFFEN: Ergebnis nach Abgabe]
