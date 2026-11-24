---
lang: "de"
slug: "urban-tree-transfer"
kind: "case"
order: 3
title: "Urban Tree Transfer"
seoTitle: "Urban Tree Transfer: Baumgattungen aus Sentinel-2 von Berlin nach Leipzig · Silas Pignotti"
description: "Ich habe geprüft, ob ein in Berlin trainiertes Modell Baumgattungen aus Sentinel-2-Daten auch in Leipzig erkennt und wie viele lokale Daten es braucht."
role: "Aufbereitung der Geodaten, Modelltraining und Auswertung"
period: "2025 bis März 2026"
status: "completed"
year: 2026
links:
  - label: "Code auf GitHub"
    href: "https://github.com/spignotti/urban-tree-transfer"
  - label: "Bericht als PDF (Englisch)"
    href: "/projects/urban-tree-transfer/report.pdf"
keyFigures:
  - value: "0,75"
    label: "Gewichteter F1 in Berlin"
  - value: "0,38"
    label: "Gewichteter F1 in Leipzig, Zero-Shot"
  - value: "25 bis 50 %"
    label: "lokale Daten, bei denen sich der Transfer lohnt"
figures:
  - { n: 1, file: "urban-tree-transfer/spatial-blocks", caption: "Bei einer zufälligen Aufteilung prüft das Modell an Nachbarn seiner Trainingsbäume. Räumliche Blöcke trennen Training und Test.", section: "Pipeline und räumliche Blöcke" }
  - { n: 2, file: "urban-tree-transfer/transfer", caption: "Gewichteter F1 von XGBoost in Leipzig nach Anteil lokaler Trainingsdaten, im Vergleich zum Training von Grund auf und zum Berliner Test.", section: "Ergebnisse auf dem Testsatz" }
---

## Ausgangslage

Viele Städte haben kein Baumkataster. Die Bäume vor Ort zu kartieren ist teuer. Ein Modell kann Baumgattungen aus Satellitendaten erkennen, verliert aber beim Wechsel in eine andere Stadt an Güte. Wie stark die Erkennung von Baumgattungen dabei nachlässt, war bisher nicht systematisch gemessen.

## Fragestellung

Ich habe ein Modell mit Daten aus Berlin trainiert und in Leipzig geprüft. Zuerst habe ich gemessen, wie gut es dort ohne weitere Trainingsdaten Baumgattungen erkennt. Danach habe ich mit unterschiedlich vielen Leipziger Daten geprüft, wie viel sich von dem Verlust ausgleichen lässt.

## Ergebnis im Überblick

Ohne lokale Daten erkannte das Berliner Modell in Leipzig nur noch etwa halb so gut. Einen Vorteil gegenüber einem neu trainierten Modell brachte es vor allem dann, wenn ein Viertel bis die Hälfte der Leipziger Daten zum Weitertrainieren vorlag.

## Daten

Ich habe die Baumkataster von Berlin und Leipzig zusammengeführt. Das Berliner Kataster enthält 905.132 Bäume, das Leipziger 167.867. Nach den Qualitätsfiltern blieben insgesamt 782.022 Bäume für die Auswertung. Die Gattung aus dem Kataster dient als Zielklasse für das Modell. Ich unterscheide 17 Gattungsklassen.

Die Satellitendaten kommen aus Google Earth Engine. Ich verwende Sentinel-2-Monatskomposite für 2021, die mehrere Aufnahmen je Monat zu einem Bild zusammenfassen. Bei der Wolkenmaskierung schließe ich Bildbereiche aus, die von Wolken verdeckt sind. Aus den Satellitendaten berechne ich Vegetationsindizes, die verschiedene Spektralbänder zu Kennzahlen für die Vegetation zusammenfassen.

Für die Zuordnung zum Satellitenbild korrigiere ich die Position aus dem Kataster auf die Baumkrone. Dazu leite ich aus Höhenmodellen ein Kronenhöhenmodell ab, das die Höhe der Kronen über dem Boden abbildet. Mit der korrigierten Position ordne ich jedem Baum die Werte eines Pixels zu.

## Pipeline und räumliche Blöcke

Ich habe die Verarbeitung als Python-Paket mit Tests umgesetzt. Damit lässt sich der Ablauf von den Rohdaten bis zur Auswertung wiederholen. Über die Feature-Auswahl lege ich fest, welche der berechneten Merkmale in das Modell eingehen.

Benachbarte Bäume ähneln sich. Diese räumliche Autokorrelation kann dazu führen, dass sich bei einer zufälligen Aufteilung ähnliche Bäume auf Trainings- und Prüfdaten verteilen. Dann hängt das Ergebnis auch davon ab, wie viele Bäume aus derselben Umgebung das Modell im Training gesehen hat.

Ich teile die Daten deshalb in räumliche Blöcke von 1200 m ein. Bei der Block-Kreuzvalidierung halte ich jeweils ganze Blöcke für die Prüfung zurück und trainiere mit den übrigen. Auch die Aufteilung in Trainings- und Testdaten erfolgt blockweise. Den Testsatz lasse ich ungefiltert.

## Modelle und Experimente

Ich vergleiche vier Modelle. Random Forest fasst die Vorhersagen vieler Entscheidungsbäume zusammen. Bei XGBoost kommen die Bäume nacheinander hinzu und korrigieren Fehler der bisherigen Vorhersage. Das 1D-CNN sucht mit Filtern nach Mustern in einer Folge von Eingabewerten. TabNet wählt bei der Verarbeitung von Tabellendaten aus, welche Merkmale es für die Vorhersage heranzieht. Die Einstellungen, die vor dem Training feststehen müssen (Hyperparameter), bestimme ich mit einer automatischen Suche.

Zuerst optimiere ich die Modelle in Berlin. Danach prüfe ich den Domain Shift, also die Veränderung der Daten beim Wechsel in eine andere Stadt. Dazu übertrage ich das Berliner Modell im Zero-Shot-Transfer nach Leipzig und setze es dort ohne lokale Trainingsdaten ein.

Im dritten Experiment passe ich das vortrainierte Modell per Feintuning an Leipzig an, indem ich es mit lokalen Daten weitertrainiere. Dafür verwende ich 10, 25, 50 und 100 % der Leipziger Daten. Als Vergleich trainiere ich ein Modell in Leipzig von Grund auf. So kann ich den Nutzen des Berliner Vortrainings bei unterschiedlichen Anteilen lokaler Daten beurteilen.

## Hypothesen

Ich habe die Hypothesen vor den Experimenten festgelegt und statistisch geprüft. Eine hat sich bestätigt: Die Gattungen verlieren beim Wechsel nach Leipzig unterschiedlich stark an Erkennungsgüte.

Eine andere habe ich verworfen. Die spektrale Trennbarkeit, also wie gut sich Gattungen anhand ihrer Satellitensignale unterscheiden lassen, sagte den Transfer nicht voraus.

## Ergebnisse auf dem Testsatz

Ich werte den gewichteten F1 aus. Er berücksichtigt, wie oft die Vorhersagen für eine Gattung stimmen und wie viele ihrer Bäume das Modell findet. In den Gesamtwert gehen häufiger vertretene Gattungen mit höherem Gewicht ein.

In Berlin erreicht XGBoost einen gewichteten F1 von 0,75. Beim Zero-Shot-Transfer nach Leipzig sinkt der Wert auf 0,38. Mit 10 % Leipziger Daten steigt er durch Feintuning auf 0,50, mit 25 % auf 0,57 und mit 50 % auf 0,66. Mit 100 % erreicht das vortrainierte Modell 0,77. Das Training von Grund auf in Leipzig erreicht 0,79.

Mit allen Leipziger Daten liegt das Training von Grund auf gleichauf. Der praktische Vorteil des Transfers liegt bei mittleren Anteilen von 25 bis 50 % lokaler Daten. Für eine Stadt ohne Kataster ist das ein Anhaltspunkt, wie viel Feldkartierung nötig ist.

Klassen-Balancing, bei dem ich den Einfluss unterschiedlich häufiger Gattungen im Training ausgleiche, brachte rund 18 Prozentpunkte. Der Effekt war größer als der der Modellwahl. In Berlin verbessert das Ausbalancieren der Klassen das Ergebnis. Zugleich vergrößert es die Transferlücke, also den Abstand zwischen den Ergebnissen in Berlin und Leipzig.

## Grenzen

Die Auswertung umfasst ein Jahr und zwei Städte im selben Klima. Ich unterscheide Bäume auf Gattungsebene. Für jeden Baum werte ich ein einzelnes Pixel aus.

Die Gattungsangaben übernehme ich ungeprüft aus den Katastern. Labelrauschen, also fehlerhafte Gattungsangaben, kann die gemessene Transferlücke verzerren.

## Stand

Ich habe das Projekt im März 2026 abgeschlossen. Der Bericht liegt auf Englisch als PDF vor.
