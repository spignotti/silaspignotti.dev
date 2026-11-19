---
title: "Routing Engine · Planung und Solver"
summary: "Eine Webanwendung plant die wiederkehrenden Wartungstermine eines Wartungsbetriebs als Monatsplan mit Touren, Zeitfenstern und Pausen."
role: "Anforderungen, Datenmodell, Planungslogik, Entwicklung und Betrieb"
period: "seit Juli 2026"
status: "live"
links: []
key_figures:
  - label: "Im Betrieb seit"
    value: "Oktober 2026"
  - label: "Pilot mit dem Büro"
    value: "1 Monat"
  - label: "[OFFEN: Kennzahl aus dem Betrieb, z. B. Touren pro Monat oder Zeitersparnis in der Planung]"
    value: "[OFFEN]"
---

## Problem

Ein Wartungsbetrieb besucht seine Kunden in festen Abständen, je nach Anlage alle paar Monate. Die Touren wurden von Hand geplant: aus einzelnen Adressen, den verfügbaren Fahrzeugen und den erwarteten Servicezeiten. Dabei müssen viele Regeln zusammenpassen. Nicht jedes Fahrzeug passt zu jeder Anlage, manche Kunden haben Zeitfenster oder feste Wochentage, jede Schicht hat ein Ende, und ein langer Tag braucht eine Pause. Das Büro brauchte einen Monatsplan, der fahrbar ist, eine klare Reihenfolge der Stopps hat und sich vor der Freigabe anpassen lässt. Eine Terminabsage am Telefon sollte nicht jedes Mal den ganzen Monat neu mischen.

## Vorgehen

Die Anforderungen habe ich aus dem bestehenden Planungsprozess abgeleitet, zusammen mit den Menschen, die ihn täglich machen. Daraus sind diese Entscheidungen entstanden:

**Der Monat ist die Planungseinheit.** Aus dem letzten Wartungstermin und dem Intervall in Monaten ergibt sich, in welchem Monat eine Anlage fällig ist. Erst der Solver verteilt die fälligen Aufträge auf Tage, Fahrzeuge und Routen. Ein Auftrag ohne festen Wochentag kann an jedem Arbeitstag stehen; nur eingeschränkte Aufträge legen einen Tag fest. So bleibt viel Spielraum für kurze Touren.

**Eine feste Rangfolge im Ziel.** Der Solver plant zuerst möglichst viele fällige Aufträge ein, dann mit möglichst wenigen Touren, dann mit möglichst wenig Fahrzeit. Als Solver nutze ich PyVRP statt eines eigenen Algorithmus. Die Version ist fest eingetragen, weil Ergebnisse und Testfälle von ihr abhängen. Ein Update ist eine eigene, geprüfte Änderung.

**Der Plan ist ein Vorschlag, das Büro entscheidet.** Das Büro prüft die Touren auf der Karte, verschiebt Stopps und bestätigt sie. Ein bestätigter Stopp bekommt ein zugesagtes Zeitfenster für die Ankunft, dessen Breite der Betrieb selbst einstellt. Spätere Neuplanungen halten diese Zusage ein.

**Absagen lokal lösen.** Wenn ein Kunde einen Termin ablehnt, rechnet die Anwendung nicht den ganzen Monat neu. Sie zeigt bis zu fünf Alternativen, sortiert nach zusätzlicher Fahrzeit und jeweils mit genauer Uhrzeit, damit das Büro am Telefon einen Termin vereinbaren kann. Erst danach optimiert eine Neuplanung im Hintergrund die übrigen beweglichen Stopps.

**Regeln, die der Betrieb wirklich braucht.** Ab einer bestimmten Arbeitszeit bekommt eine Tour eine Pause in einem festen Zeitraum, den der Betrieb vorgibt. Findet der Solver dafür keinen Platz, gibt er die Tour nicht aus; die Aufträge bleiben als offene Arbeit sichtbar. Fällt ein Fahrzeug aus, reserviert eine Tagessperre diesen Platz, damit die nächste automatische Planung ihn nicht wieder füllt. Kein Auftrag geht dabei verloren: Er ist eingeplant, ausdrücklich abgeschlossen oder als offen sichtbar.

Bewusst nicht gebaut habe ich einen Ersatz für die bestehenden Systeme des Betriebs, lernende Funktionen oder eine automatische Zuteilung von Fahrern, Live-Verkehrsdaten und eine eigene Solver-Variante je Kunde. Die Planung bleibt regelbasiert, und ein Mensch bestätigt das Ergebnis.

## System

Die Anwendung ist ein modularer Monolith in Python. FastAPI rendert die Oberfläche auf dem Server mit Jinja; HTMX tauscht einzelne Teile der Seite aus, Leaflet zeigt die Touren auf der Karte. Eine Single-Page-App gibt es nicht, der Zustand liegt nur auf dem Server.

Alle Daten liegen in PostgreSQL, getrennt je Betrieb über Row Level Security. Lese- und Schreibzugriffe laufen mit dem Token des angemeldeten Nutzers. Relevante Änderungen landen in einem Audit-Log, das nur wächst.

Geocoding, Fahrzeitmatrix und Solver sitzen hinter austauschbaren Schnittstellen im selben Prozess. Externe Dienste bekommen nur Adressen oder Koordinaten, Dauern und Bedingungen, nie Kundennamen oder Notizen. Fahrzeiten werden je Betrieb und Koordinatenpaar gespeichert und wiederverwendet, bis jemand sie bewusst erneuert. Eine neue Adresse lädt nur die fehlenden Verbindungen.

Der Solver baut für jeden Monat ein Modell mit Fahrzeugklassen, Wochentagen, Schichten, Zeitfenstern und Kompatibilitätsregeln zwischen Anlagentyp und Fahrzeug. Ein unabhängiger Prüfer kontrolliert das Ergebnis, bevor es gespeichert wird. Am Ende stehen eine Stoppliste und ein Fahrerblatt als PDF.

## Ergebnis

Das Büro hat die Anwendung einen Monat lang im Pilot mit echten Planungen getestet. Aus diesem Feedback habe ich Ablauf und Routenbearbeitung angepasst. Seit Oktober 2026 plant der Betrieb damit alle Wartungstouren. Das Büro prüft die Routen auf der Karte, passt sie an und gibt sie als Stoppliste an die Fahrer. Die Entwicklung läuft im Betrieb weiter, nach den Rückmeldungen aus der täglichen Arbeit. Beispiele sind die Pausenregel, die lokale Verschiebung bei Absagen und der Schutz bereits bestätigter Touren, wenn sich eine Regel ändert. [OFFEN: messbares Ergebnis aus dem Betrieb, z. B. Planungszeit vorher und nachher]

## Grenzen

Die Routing Engine ist ein internes Werkzeug für einen Betrieb, keine allgemeine Logistikplattform. Die Fahrzeiten kommen von einem Routing-Dienst mit einem einfachen Verkehrsmodell, ohne Live-Stau. Ein Zuschlag auf die Fahrzeit braucht zuerst gemessene Touren. Die gespeicherte Fahrzeitmatrix wächst quadratisch mit der Zahl der Adressen; deutlich mehr Daten brauchen eine neue Speicherentscheidung. Die Anwendung läuft bewusst als ein Prozess. Der Solver ist eine Heuristik: Er findet gute Pläne, beweist aber kein Optimum.

## Abbildungen

1. **Architektur (Abb. 1).** Art: Architekturdiagramm, horizontal. Zeigt den Ablauf Import der Aufträge → Geocoding → Planungsregeln → Solver → Prüfung auf der Karte durch das Büro → Export (Stoppliste, Fahrerblatt). Unter Geocoding und Solver eine dünne Gruppe „austauschbare Schnittstellen“. Akzent: „Prüfung durch das Büro“. Bildunterschrift DE: „Vom Auftrag zur Stoppliste. Der Solver schlägt vor, das Büro prüft und bestätigt.“ EN: „From order to stop list. The solver proposes, the office reviews and confirms.“
2. **Methode (Abb. 2).** Art: Methodendiagramm, vier Kästen in einer Reihe. Zeigt Wartungsintervall → fälliger Monat → Tag und Fahrzeug → Route. Akzent: „Tag und Fahrzeug“ (die Tageszuordnung durch den Solver). Bildunterschrift DE: „Aus dem Intervall folgt der Monat. Tag, Fahrzeug und Reihenfolge legt der Solver fest.“ EN: „The interval sets the month. The solver sets day, vehicle and stop order.“
3. **Kartenansicht (Abb. 3).** Art: Screenshot der Monatsplanung mit Karte, aus dem lokalen Stand mit synthetischen Beispieldaten, als WebP. Kein Produktname, kein Firmenname, keine echten Adressen im Bild oder im Alt-Text. Kein Akzent. Bildunterschrift DE: „Monatsplanung mit Karte. Beispieldaten, keine Kundendaten.“ EN: „Monthly planning with map. Sample data, no customer data.“
