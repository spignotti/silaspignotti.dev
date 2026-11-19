---
title: "KPI-Referenz"
summary: "Für einen Sortierbetrieb für Kunststoffe habe ich Kennzahlenlogik und eine Mengenprognose als Referenz gebaut und mit der Produktion abgeglichen."
role: "Werkstudent Datenanalyse: Anforderungen, Referenzimplementierung, Abgleich, Übergabe"
period: "2025 bis 2026"
status: "abgeschlossen"
links: []
key_figures:
  - label: "Prognosefehler, gewähltes Modell (WMAPE)"
    value: "8,42 %"
  - label: "Prognosefehler, Vorjahr als Prognose"
    value: "20,12 %"
  - label: "Prognosefälle im Rückblick"
    value: "1.300"
---

## Problem

Ein Sortierbetrieb für Kunststoffe wollte betriebliche Kennzahlen und eine Prognose der eingehenden Mengen in seiner Webanwendung zeigen. Die Anforderungen kamen vom Management, die Umsetzung lag beim Backend-Team. Dazwischen fehlte eine eindeutige Rechenlogik: welche Daten es wirklich gibt, wie Sonderfälle zu behandeln sind und welche Werte am Ende herauskommen müssen. Ohne diese Grundlage hätte jede Abweichung in der Produktion eine neue Diskussion ausgelöst.

## Vorgehen

**Erst die Referenz, dann die Produktion.** Ich habe die Anforderungen mit Management und Backend geklärt, Datenverfügbarkeit und Sonderfälle geprüft und die Logik als Referenzimplementierung in Python und SQL gebaut. Die fachlichen Regeln habe ich dokumentiert. Das Backend-Team hat die Logik danach in die Webanwendung übernommen.

**Abgleich heißt identische Werte.** Die Produktion galt erst als richtig, wenn sie dieselben Werte wie die Referenz lieferte. Für den Abgleich habe ich Referenzdaten und technische Dokumentation übergeben. Jeder Prognosestand wird gespeichert, damit sich später nachvollziehen lässt, was wann vorhergesagt wurde.

**Mehrere Modelle im Rückblick verglichen.** Für die Mengenprognose habe ich mehrere Ansätze im Rückblick auf vergangene Jahre verglichen. Gewählt wurde ein multiplikatives Modell: ein Mengenniveau, ein Saisonfaktor je Monat, eine Gewichtung nach Arbeitstagen und ein Anteil je Standort. Es liegt auch als Excel-Referenz vor und war im Rückblick am genauesten. Ein Modell nach Herkunft der Mengen hätte Zusatzdaten und Ersatzregeln für neue Herkünfte gebraucht und war nicht genauer. Ich habe es verworfen.

## System

Die Referenz besteht aus SQL-Abfragen auf einer lokalen Datenbank und Python für Prognose und Auswertung. Ein schlankes Frontend zeigt die Ergebnisse; die Webanwendung des Betriebs hat diesen Code übernommen. An das Backend gingen Referenzwerte als CSV und eine technische Dokumentation je Berechnung.

## Ergebnis

Über 1.300 Prognosefälle im Rückblick liegt der gewichtete mittlere absolute Prozentfehler (WMAPE) des gewählten Modells bei 8,42 %. Die Vorjahresmenge als Prognose kommt auf 20,12 %. Die Logik ist vollständig übergeben, das Projekt ist abgeschlossen.

## Grenzen

Der größte Teil des verbleibenden Fehlers kommt aus Schwankungen der Jahresmenge, die von äußeren Faktoren abhängen. Diese sieht das Modell nicht. Die Prognose ist nur so gut wie die Historie, auf der sie beruht. Über das Jahr sinkt der Fehler: Am Jahresanfang liegt er deutlich höher als im Herbst.

## Abbildungen

1. **Prozess (Abb. 1).** Art: Prozessdiagramm, horizontal. Zeigt Anforderung → Referenzimplementierung → Abgleich mit der Produktion → Übergabe. Akzent: „Referenzimplementierung“. Bildunterschrift DE: „Die Referenz legt fest, welche Werte die Produktion liefern muss.“ EN: „The reference defines the values production must deliver.“
2. **Prognosemodell (Abb. 2).** Art: Methodendiagramm, eine Zeile als Produkt: Mengenniveau × Saisonfaktor (Monat) × Arbeitstagsgewicht × Standortanteil = Prognose. Keine Werte, keine Standortnamen. Akzent: „Prognose“ (das Ergebnis). Bildunterschrift DE: „Vier Faktoren, multipliziert. Allgemeine Form, keine Betriebswerte.“ EN: „Four factors, multiplied. General form, no company values.“
3. **Prognosefehler (Abb. 3).** Art: Kennzahl, waagerechte Balken, WMAPE in Prozent. Echte Werte nur für zwei Balken: „Vorjahr als Prognose“ 20,12 % und „gewähltes Modell“ 8,42 %. [OFFEN: Das Konzept sieht vier Balken vor (Vorjahr, Herkunft, Standort, gewählt). Die Werte für Herkunft und Standort sind nicht freigegeben; entweder nur zwei Balken oder Freigabe einholen.] Akzent: der Balken des gewählten Modells. Bildunterschrift DE: „Prognosefehler im Rückblick über 1.300 Fälle.“ EN: „Forecast error in a backtest over 1,300 cases.“
