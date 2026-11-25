---
lang: "de"
slug: "tourengenie"
kind: "case"
order: 1
title: "Tourengenie"
seoTitle: "Tourengenie: Tourenplanung für einen Wartungsbetrieb · Silas Pignotti"
description: "Ich habe Tourengenie gebaut und betreibe die Software, mit der ein Berliner Wartungsbetrieb jeden Tag seine Touren plant."
role: "Entwicklung und Betrieb"
period: "seit August 2026"
status: "live"
year: 2026
links:
  - label: "tourengenie.de"
    href: "https://tourengenie.de"
keyFigures:
  - value: "über 100"
    label: "Kunden im festen Wartungsturnus"
  - value: "rund 30 %"
    label: "weniger Touren"
  - value: "rund 50 %"
    label: "mehr Wartungen je Tour"
figures:
  - { n: 1, shot: "tourengenie/planning", alt: "Planungsansicht von Tourengenie für Dezember: links die Touren des Monats nach Status, rechts Tour 3 mit sechs Stopps, Fahrzeiten und Ankunftszeiten. Fünf Stopps sind bestätigt und mit einem Schloss fixiert, einer ist noch offen.", caption: "Die Planungsansicht: Tour 3 ist in Abstimmung, fünf von sechs Terminen sind bestätigt und stehen fest.", section: "Was Tourengenie tut" }
  - { n: 2, file: "tourengenie/objective", caption: "Die Ziele in fester Rangfolge. Eine Stufe zählt erst, wenn alle Stufen darüber gleich sind.", section: "Planung" }
  - { n: 3, shot: "tourengenie/reschedule", alt: "Dialog zum Verschieben eines Termins bei Hotel Seidel, bisher Freitag, 4. Dezember, Tour 4. Empfohlen ist Donnerstag, 3. Dezember, auf der bestehenden Tour 5 mit einer Minute mehr Fahrt. Die übrigen Tage der zwei Wochen bräuchten jeweils eine neue Tour mit 66 bis 76 Minuten mehr Fahrt.", caption: "Ein Termin wird verschoben: Tourengenie schlägt Tage und Touren vor und zeigt für jeden Vorschlag die zusätzliche Fahrzeit.", section: "Neuplanen" }
  - { n: 4, file: "tourengenie/travel-cache", caption: "Ein neuer Stopp ergänzt nur seine eigene Zeile und Spalte der Fahrzeitmatrix.", section: "Fahrzeit-Cache" }
  - { n: 5, file: "tourengenie/release", caption: "Von der Entwicklung in den Betrieb. Schlägt ein Deploy fehl, läuft wieder die vorherige Version.", section: "Betrieb und Infrastruktur" }
---

## Ausgangslage

Ich habe Tourengenie allein für einen Wartungsbetrieb in Berlin gebaut und betreibe die Software auf meinem Server. Der Betrieb wartet Hebeanlagen bei über 100 Kunden in einem festen Turnus. Im Büro entstand der Plan für den Monat mit Zetteln und Listen. Für diese Planung gab es keine passende Software.

## Was Tourengenie tut

Tourengenie macht aus den fälligen Wartungen Touren für Fahrzeuge und Tage. Sobald ein Kunde zusagt, absagt oder einen Termin verschiebt, berechnet die Software den Plan neu. Die bestätigten Termine bleiben dabei fest. Der Disponent entscheidet, welche Termine er mit den Kunden vereinbart.

## Ergebnis

Der Betrieb plant damit jeden Tag seine Touren. Nach Angaben des Betriebs fährt er seit der Umstellung rund 30 % weniger Touren und erledigt rund 50 % mehr Wartungen je Tour. Zettel und Listen braucht das Büro für die Planung nicht mehr.

## Planung

Ich bilde den ganzen Monat als ein Tourenplanungsmodell ab, ein Vehicle Routing Problem (VRP): welches Fahrzeug welche Stopps in welcher Reihenfolge anfährt. Ich löse es mit dem Open-Source-Solver PyVRP. Im Modell ist jede Kombination aus Wochentag und Fahrzeugklasse ein eigenes Fahrzeug, so verteilt ein einziger Lauf die Wartungen auf alle Tage des Monats. Die Fahrzeit zwischen zwei Stopps geht für jede Fahrzeugklasse gesondert in die Planung ein.

Die lexikografische Zielfunktion gibt den Zielen eine feste Rangfolge. Zuerst soll der Plan alle fälligen Aufträge enthalten. Danach soll er möglichst wenige Touren brauchen. Bei gleicher Tourenzahl zählt die Fahrzeit. Erst bei gleicher Fahrzeit entscheidet die Distanz. Überfällige Wartungen plane ich zusätzlich nach Dringlichkeitsstufen vorrangig ein.

PyVRP optimiert nur eine einzige ganzzahlige Zielfunktion. Deshalb skaliere ich die Ziele so gestaffelt, dass ein zusätzlich eingeplanter Auftrag immer mehr zählt als jede eingesparte Tour und eine eingesparte Tour immer mehr als jede eingesparte Fahrzeit. So bleibt die Rangfolge auch in der einen Zahl erhalten.

Ein unabhängiger Prüfer rechnet jedes Ergebnis nach. Findet er einen Fehler, veröffentlicht Tourengenie den Plan nicht.

## Neuplanen

Jede Änderung löst eine neue Planung aus. Zugesagte Touren bleiben im Zusagefenster fest. Die übrigen Wartungen verteilt das Modell neu. Damit gelten die Zusagen auch dann weiter, wenn sich der Plan für den Rest des Monats ändert.

Die Berechnung läuft im Hintergrund. Kommen mehrere Änderungen kurz nacheinander, fasse ich sie zu einem Lauf je Monat zusammen. Das Ergebnis übernehme ich atomar: Der Disponent sieht entweder den alten oder den vollständigen neuen Plan, nie einen halben.

## Fahrzeit-Cache

Für die Planung brauche ich die Fahrzeit zwischen den Stopps. Ich speichere diese Fahrzeitmatrix als Cache in PostgreSQL. Die Einträge sind gerichtete Kanten, also ein eigener Eintrag für jede Fahrtrichtung zwischen zwei Stopps. Ich speichere sie je Mandant und Fahrzeugprofil dauerhaft, ohne Ablaufdatum.

Beim Speichern eines Standorts wärmt Tourengenie den Cache im Hintergrund auf. Kommt zu n vorhandenen Stopps ein neuer hinzu, braucht die Software nur 2n weitere Kanten. Das sind die Fahrten vom neuen Stopp zu den vorhandenen Stopps und die Fahrten zurück. Die ganze Matrix neu zu berechnen hieße n² Kanten. Die Fahrzeiten kommen vom Routing-Dienst Geoapify. Die Abrufe dort plane ich als Rechtecke aus Start- und Zielpunkten, so dass sie nach dem Preismodell des Anbieters möglichst wenig kosten.

Mit den gespeicherten Fahrzeiten dauert das Neuplanen wenige Sekunden. Bei der Messung im Oktober dauerte ein Lauf mit warmem Cache unter zwei Sekunden. Mit kaltem Cache waren es rund 16 Sekunden.

## Betrieb und Infrastruktur

Ich habe meinen Server per Skript aufgesetzt und gehärtet und überwache ihn laufend. Entwicklung, Staging und Produktion laufen getrennt. Staging ist die Umgebung, in der ich Änderungen vor dem Einsatz im Betrieb prüfen kann.

In der CI/CD-Pipeline laufen Tests und Sicherheits-Scans. Releases werden signiert und nachts automatisch ausgeliefert. Schlägt ein Deploy fehl, stellt ein automatischer Rollback die vorherige Version wieder her.

Datenbankmigrationen halte ich rückwärtskompatibel, damit die vorherige Version nach einem Rollback mit der Datenbank weiterarbeiten kann. Vor der Auslieferung prüfe ich die Migration gegen eine Kopie des letzten Backups.

## Daten des Betriebs

In der Produktion arbeitet Tourengenie mit den Kundendaten des Betriebs. Die Anwendung ist mandantenfähig. Ich setze in PostgreSQL mit Supabase auf jeder Tabelle Row-Level-Security ein. Damit entscheidet die Datenbank selbst bei jeder Zeile, ob ein Mandant sie sehen darf, nicht erst die Anwendung. Diese Regeln teste ich in der CI.

Die Backups laufen jede Nacht und sind verschlüsselt. Ein automatischer Restore-Test prüft jeden Monat, ob sich die Daten aus einem Backup wiederherstellen lassen. Tests und Coding-Agenten haben keinen Zugriff auf Produktionsdaten.

## Agentic Software Engineering

Ich habe Tourengenie mit KI-Coding-Agenten gebaut. Die Agenten arbeiten auf Branches. Jede Änderung geht als Pull Request durch Pflichtprüfungen. Für das Review setze ich einen frischen Agenten ein, der die Änderung nicht selbst geschrieben hat.

Ein weiterer Agent prüft die Änderung in der laufenden App. Migrationen, Änderungen an der Authentifizierung und an Secrets sowie Releases gebe ich selbst frei.

## Stand

Unter dem Namen Tourengenie erprobe ich die Software jetzt mit weiteren Betrieben.

[tourengenie.de](https://tourengenie.de)