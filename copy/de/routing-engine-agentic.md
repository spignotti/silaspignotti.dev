---
title: "Routing Engine · agentisch gebaut bis in den Betrieb"
seo_title: "Routing Engine agentisch gebaut · Silas Pignotti"
summary: "Wie ich die Routing Engine mit KI-Coding-Agenten entwickle und betreibe: Plan, Umsetzung in Worktrees, Checks, Review, Release und Deploy."
role: "Planung, Regeln für die Agenten, Prüfprozess, Releases und Betrieb"
period: "seit August 2026"
status: "laufend"
links: []
key_figures:
  - label: "Gemergte Pull Requests (Stand 19.11.2026)"
    value: "343"
  - label: "Releases seit dem 22.10.2026"
    value: "9"
  - label: "Erster Commit bis erstes Release"
    value: "11 Wochen"
---

## Problem

Ich baue und betreibe die Routing Engine allein, neben Studium und Werkstudentenjob. Ein Wartungsbetrieb plant damit jeden Tag seine Touren. KI-Coding-Agenten schreiben Code schnell, aber Tempo allein ist hier ein Risiko. Ein Fehler in der Planung kann einen Termin verlieren, eine Datenbankmigration läuft gegen echte Daten, und Zugangsdaten dürfen nie im Code landen. Die Frage war deshalb: Wie lasse ich Agenten den größten Teil der Umsetzung machen, ohne die Kontrolle über das zu verlieren, was in Produktion geht? Jede Änderung sollte prüfbar sein, und der laufende Betrieb sollte stabil bleiben.

## Vorgehen

**Regeln stehen im Repository.** Eine Datei `AGENTS.md` beschreibt für jeden Agenten Datenregeln, Grenzen für Änderungen, Teststrategie und Befehle. Eine zweite Datei listet jeden Standard, den ein Pull Request einhalten muss, und sagt, wie er geprüft wird: durch einen CI-Check oder im Review. Ein Review-Befund muss den Standard nennen, den er verletzt. Stil allein ist kein Befund.

**Nur entschiedene Arbeit wird gebaut.** Ein Issue enthält eine entschiedene Aufgabe mit Akzeptanzkriterien. Entscheidungen, deren Begründung man im Code nicht sieht, stehen als kurze Entscheidungsnotizen im Repository, bis heute 30 Stück. Parallele Spezifikationen gibt es nicht. Das Verhalten steht im Code und in den Tests.

**Rollen sind getrennt.** Größere Arbeit beginnt mit einem Plan. Ein Agent setzt ihn in einem eigenen Git-Worktree um, sodass mehrere Aufgaben parallel laufen können. Ein zweites Modell, das den Code nicht geschrieben hat, prüft den Pull Request. Ist eine Änderung in der Anwendung sichtbar, prüft ein weiterer Agent, der den Code nicht geschrieben hat, die laufende Anwendung gegen die Akzeptanzkriterien. Schritte und Screenshots kommen in den Pull Request. Scheitert diese Prüfung, geht die Arbeit zurück in die Umsetzung.

**Wer mergt, hängt vom Risiko ab.** Sind die Checks grün und findet das Review nichts Blockierendes, mergt der Agent selbst und schreibt in wenigen Zeilen, was geprüft wurde. Neue Migrationen, Login, Sessions, die Trennung der Mandanten, der Umgang mit Zugangsdaten, Release- und Deploy-Konfiguration und die Solver-Version warten immer auf meine Freigabe.

**Nur synthetische Daten.** Tests, Fixtures und Demos nutzen ausschließlich erfundene Daten. In Produktion schreibt ein Agent nur nach meiner Freigabe. Alle Worktrees teilen sich eine lokale Datenbank; wer sie startet, zurücksetzt oder befüllt, holt sich vorher eine Sperre.

**Pflege im Wochentakt.** Seit November ist ein wöchentlicher Pflegelauf eingerichtet. Er prüft je ein Thema, etwa Tests oder CI und Deploy, behebt Funde per Pull Request und macht aus einem Fund einen Standard, den künftige Pull Requests einhalten müssen.

Bewusst nicht gebaut habe ich einen automatischen Deploy nach jedem Merge, eine gehostete Entwicklungsdatenbank und Plan- oder Session-Dokumente neben dem Code. Ein Release ist eine bewusste Entscheidung.

## System

Jeder Pull Request durchläuft einen Pflicht-Check. Er prüft Linting und Typen, führt Unit-, Service- und Browsertests aus, prüft die Abhängigkeiten auf bekannte Schwachstellen und setzt eine frische lokale Datenbank auf. Dagegen laufen Tests für Rechte, Mandantentrennung und Planungsregeln sowie Integrationstests mit echtem Login. Dazu kommen ein Secret-Scan, eigene Regeln für statische Analyse und ein Schwachstellen-Scan des Container-Images. Reine Doku-Änderungen überspringen die schweren Schritte; die Entscheidung darüber fällt im Zweifel für den vollen Lauf. Langsame Solver-Tests laufen jede Nacht, ein Scan des ausgelieferten Images jede Woche.

Ein Release ist ein Versions-Tag auf `main`. Daraus entsteht ein signiertes Container-Image mit Stückliste der Abhängigkeiten. Der Server spielt jede Nacht das neueste signierte Release ein und prüft vorher Signatur und Datenbankschema. Migrationen bleiben mit dem vorherigen Release verträglich, damit ein Rollback des Images möglich bleibt. Betrieb, Monitoring und Backups liegen in einem eigenen Repository.

## Ergebnis

Der erste Commit war am 3. August 2026, seit Oktober 2026 läuft die Anwendung im Betrieb. Bis zum 19. November 2026 wurden 343 Pull Requests gemergt, 28 davon automatische Updates von Abhängigkeiten. Im August waren es 7, im September 64, im Oktober 88 und im November bis zum 19. bereits 184. Seit dem ersten Release am 22. Oktober gab es 9 Releases. Die CI-Workflows liefen insgesamt über 2.100 Mal.

## Grenzen

Agenten machen Fehler, die durch Tests rutschen können, und ein Review durch ein Modell ist kein Beweis. Deshalb bleiben die riskanten Bereiche bei mir. Für eine kleine Änderung ist der Ablauf oft länger als die Änderung selbst. Ein grüner Check auf einem reinen Python-Pull-Request heißt nicht, dass die Datenbanktests gelaufen sind. Und alles hängt an einer Person. Die Werkzeuge ändern sich schnell; die Regeln sind so geschrieben, dass ein Agent austauschbar bleibt.

## Abbildungen

1. **Prozess (Abb. 1).** Art: Prozessdiagramm, horizontal. Zeigt Issue → Plan → Agent setzt im Worktree um → Checks und Review → Merge → Release-Tag → nächtlicher Deploy. Unter „Checks und Review“ drei kleine Kästen: CI-Checks, Review durch ein zweites Modell, Prüfung in der laufenden App. Eine gestrichelte Abzweigung „wartet auf Freigabe“ für Migrationen, Login, Zugangsdaten und Deploy. Akzent: „Checks und Review“. Bildunterschrift DE: „Vom Issue bis in den Betrieb. Agenten setzen um, Checks und Review entscheiden über den Merge.“ EN: „From issue to production. Agents implement; checks and review decide the merge.“
2. **Pull Requests pro Monat (Abb. 2).** Art: Kennzahl, Balkendiagramm. Werte: August 7, September 64, Oktober 88, November 184 (bis 19.11.2026). November-Balken mit Hinweis „bis 19.11.“. Akzent: der Balken Oktober (erstes Release, Start im Betrieb). Bildunterschrift DE: „Gemergte Pull Requests pro Monat, Stand 19.11.2026.“ EN: „Merged pull requests per month, as of 19 Nov 2026.“
