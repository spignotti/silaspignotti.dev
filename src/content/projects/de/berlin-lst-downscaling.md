---
lang: "de"
slug: "berlin-lst-downscaling"
kind: "case"
order: 2
title: "Masterarbeit · Berliner Hitze auf 10 m"
seoTitle: "Masterarbeit: Oberflächentemperatur in Berlin von 100 m auf 10 m · Silas Pignotti"
description: "In meiner Masterarbeit prüfe ich, welche Stadtdaten einem Deep-Learning-Modell helfen, die Oberflächentemperatur in Berlin von 100 m auf 10 m zu verfeinern."
role: "Geodaten aufbereiten, Modelle trainieren und auswerten"
period: "2026, Abgabe im Dezember 2026"
status: "ongoing"
year: 2026
links: []
keyFigures:
  - value: "100 m → 10 m"
    label: "Auflösung"
  - value: "2017 bis 2025"
    label: "Trainings- und Testjahre"
  - value: "27"
    label: "Modellläufe in der Ablation"
figures:
  - { n: 1, file: "berlin-lst-downscaling/data-flow", caption: "Von den Quelldaten über den Feature-Stack zur Temperatur auf 10 m.", section: "Datenpipeline" }
  - { n: 2, file: "berlin-lst-downscaling/pseudo-pairs", caption: "Das Modell lernt den Schritt von 1000 m auf 100 m und wendet ihn von 100 m auf 10 m an. Geprüft wird auf 100 m.", section: "Pseudo-Paar-Design" }
  - { n: 3, file: "berlin-lst-downscaling/ablation", caption: "Die neun Varianten der Ablation. Das Modell bleibt gleich, nur die Eingänge und in Stufe 5 das Trainingsziel wechseln.", section: "Ablation" }
  - { n: 4, file: "berlin-lst-downscaling/season-map", caption: "Abweichung der Oberflächentemperatur vom Mittel je Überflug, Mai bis September 2025, auf 10 m. Vorläufig, Stand Masterarbeit (nicht begutachtet).", section: "Karten" }
---

## Ausgangslage

Die Landsat-Satelliten messen die Temperatur der Erdoberfläche mit einer Auflösung von rund 100 m. Das ist zu grob, um Unterschiede innerhalb von Berliner Häuserblöcken und Straßenräumen zu erkennen. Dort kommt es darauf an, wo Gebäude und Bäume stehen, welche Flächen versiegelt sind und wo Schatten fällt.

Die Aufnahmen von Sentinel-2 und die Berliner Geodaten zeigen diese Strukturen auf einem Raster von 10 m. Eine unabhängige Messung der Oberflächentemperatur in dieser Auflösung fehlt.

## Fragestellung

Ich prüfe, welche Stadtdaten einem Modell helfen, aus der Temperaturmessung auf 100 m eine Karte auf 10 m abzuleiten. Diese räumliche Verfeinerung heißt Downscaling. Dazu untersuche ich den Beitrag von Gebäuden, Vegetation, Schatten und Wetter. Ich prüfe auch ein thermalsensitives Training, das die Temperaturmuster beim Lernen eigens berücksichtigt.

Aus dem Modell entstehen Temperaturkarten auf 10 m. Im Test verbessert der Stadtkontext die Vorhersage. Der Unterschied ist größer auf Flächen, die das Modell im Training nie gesehen hat. Für den Vergleich mit den Messungen fasse ich die Karten wieder auf 100 m zusammen.

## Datenpipeline

Für die Oberflächentemperatur verwende ich die thermalen Aufnahmen von Landsat 8 und 9. Dazu kommen Sentinel-2-Aufnahmen und Berliner 3D-Gebäudedaten in LoD2, einer Detailstufe, die auch die Dachform abbildet. Aus den Gebäudedaten leite ich den Schatten und den Sky-View-Factor ab. Der Sky-View-Factor gibt an, welcher Anteil des Himmels von einem Ort aus sichtbar ist.

Ich ergänze Vegetationshöhe, Versiegelung und Wetterdaten aus ERA5-Land, einer rückblickenden Berechnung des Wetters. Alle Daten bringe ich auf dasselbe 10-m-Gitter im Koordinatensystem EPSG:25833. Für Training und Auswertung nutze ich Aufnahmen aus der Warmsaison von Mai bis September in den Jahren 2017 bis 2025.

Ich erfasse die Daten in einem STAC-Katalog, der räumliche Datensätze mit ihren Metadaten verzeichnet. Dazu gehören Angaben zur Herkunft. Ein Manifest legt fest, welche Daten die Pipeline verarbeitet. Prüfskripte kontrollieren die Aufbereitung. Mit demselben Manifest kann ich sie wiederholen. Das Training läuft auf Vertex AI in Google Cloud.

## Pseudo-Paar-Design

Weil es auf 10 m keine gemessene Temperatur gibt, lasse ich das Modell eine Auflösungsstufe gröber lernen. Dazu fasse ich die Landsat-Messung auf 1000 m zusammen und verwende dieses Raster als Eingang. Als Ziel dient die Landsat-Messung auf 100 m. Auf dieser Stufe kann das Modell an einer gemessenen Temperatur lernen, wie sich die Temperatur innerhalb der gröberen Rasterzellen verteilt.

Für die Karten verwende ich die Messung auf 100 m als Eingang und lasse das Modell Werte auf 10 m schätzen. Das setzt voraus, dass sich das Gelernte von 1000 m auf 100 m auch auf den Schritt von 100 m auf 10 m übertragen lässt. Für die Auswertung mittle ich die vorhergesagten Werte exakt auf das 100-m-Gitter zurück. Dort vergleiche ich sie mit der Landsat-Messung.

## Aufteilung nach Jahren

Ich trainiere mit den Jahren 2017 bis 2023. Für die Validierung nutze ich das Jahr 2024. An diesen Daten prüfe ich die Entscheidungen für das Modell. Das Jahr 2025 halte ich für den Test zurück. Ich habe den Test einmal geöffnet, nachdem alle Entscheidungen feststanden.

## Ablation

In der Ablation füge ich Gruppen von Eingangsdaten hinzu oder lasse sie weg, um ihren Beitrag zu messen. In allen neun Varianten verwende ich dasselbe 2D-U-Net, ein neuronales Netz, das Muster in den Rastern auf mehreren Auflösungsstufen verarbeitet. Ich trainiere jede Variante mit drei Seeds. Ein Seed legt die Folge der Zufallszahlen für einen Lauf fest. So komme ich auf 27 Modellläufe.

Als Baseline, also als Vergleichsverfahren, rechne ich die grobe Temperaturmessung direkt auf das feinere Gitter hoch. Außerdem vergleiche ich das U-Net mit einem Random Forest, der die Temperatur aus den Vorhersagen vieler Entscheidungsbäume schätzt.

## Statistik

Ich verwende einen gepaarten Bootstrap über Szenen. Dazu ziehe ich Szenen mit Zurücklegen und vergleiche die Modelle jeweils auf denselben gezogenen Szenen. Ich wiederhole das 10.000-mal. Wann ein Unterschied als belastbar gilt, lege ich vor der Auswertung fest.

Zusätzlich prüfe ich die Modelle mit einem räumlichen Holdout. Dafür halte ich Flächen aus dem Training heraus und werte die Vorhersagen für diese Flächen gesondert aus. So kann ich prüfen, wie sich die Modelle an Orten verhalten, die sie im Training nie gesehen haben.

## Ergebnis

Das U-Net ist deutlich genauer als die naive Hochrechnung und der Random Forest. Im Testjahr ist der Gewinn durch den Stadtkontext klein, aber belastbar. Gebäudestruktur, Wetter und eine eigene Gruppe von Indizes aus Rot und nahem Infrarot tragen zum Ergebnis bei. Die Indizes NDVI und NDWI für Vegetation und Wasser bringen darüber hinaus nichts. Für das thermalsensitive Training finde ich keinen belastbaren Vorteil.

Auf den Flächen, die das Modell im Training nie gesehen hat, hilft der Stadtkontext deutlich stärker. Bei der Aufteilung nach Jahren allein bleibt dieser Unterschied verborgen.

## Karten

Ich habe Temperaturkarten auf 10 m für 39 Szenen aus 2025 und 42 Szenen aus der Warmsaison 2026 erstellt. Die Aufnahmen von 2026 hat das Modell weder im Training noch im Test gesehen. Dazu kommen Differenzkarten. Sie zeigen, an welchen Stellen sich die geschätzte Temperatur verändert, wenn ich den Stadtkontext in das Modell aufnehme.

## Grenzen

Die Auswertung prüft die Übereinstimmung mit Landsat auf 100 m. Unterschiedliche Temperaturmuster auf 10 m können beim Rückmitteln denselben Wert ergeben. Ohne unabhängige Temperaturmessungen auf 10 m kann ich die einzelnen Werte auf dieser Auflösung nicht validieren. Die Übertragung auf den feineren Maßstab bleibt eine Annahme.

## Stand

Ich gebe die Masterarbeit im Dezember 2026 ab. Die Ergebniszahlen folgen nach der Abgabe.
