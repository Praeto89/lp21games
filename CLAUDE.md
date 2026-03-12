# LP21 Lernwelt - Anleitung für Fach-Chats

## Projekt-Überblick
Website mit Lernspielen zu allen Kompetenzen des Lehrplan 21 (Zyklus 3, Sek I, Kanton Zug).
Reines HTML/CSS/JS, keine Frameworks. Dynamische Seiten laden Spieldaten aus JSON-Dateien.

## WICHTIG: Was du bearbeiten darfst
- **NUR** Dateien in `data/{dein-fach}/` erstellen
- **NUR** deinen Fach-Eintrag in `faecher.json` hinzufügen (am Ende des `faecher`-Arrays)
- **KEINE** Dateien in `js/`, `css/`, `pages/` oder `assets/` ändern!

## Dein Auftrag
1. Kompetenzen deines Fachs von https://zg.lehrplan.ch/ abrufen (Zyklus 3)
2. Für jede Kompetenz eine JSON-Spieldatei in `data/{fach-id}/` erstellen
3. Deinen Fach-Eintrag in `faecher.json` ergänzen

## Fach-Eintrag in faecher.json

Füge am Ende des `faecher`-Arrays ein neues Objekt hinzu:

```json
{
  "id": "fach-id",
  "name": "Voller Fachname",
  "kuerzel": "XX",
  "farbe": "#hexcode",
  "icon": "emoji",
  "bereiche": [
    {
      "id": "xx1",
      "code": "XX.1",
      "name": "Bereichsname",
      "kompetenzen": [
        {
          "id": "xx1a",
          "code": "XX.1.A",
          "name": "Kompetenzname (kurz)",
          "beschreibung": "Volltext der Kompetenz aus LP21",
          "spieltyp": "quiz",
          "datendatei": "data/fach-id/xx1a.json"
        }
      ]
    }
  ]
}
```

### Fach-IDs und Farben (bitte verwenden):
| Fach | id | Farbe | Icon |
|---|---|---|---|
| Deutsch | deutsch | #2196F3 | 📝 |
| Mathematik | mathematik | #FF9800 | 🔢 |
| Natur & Technik | natur-technik | #4CAF50 | 🔬 |
| Wirtschaft, Arbeit, Haushalt | wah | #795548 | 🏠 |
| Räume, Zeiten, Gesellschaften | rzg | #FFC107 | 🌍 |
| Ethik, Religionen, Gemeinschaft | erg | #9C27B0 | 🤝 |
| Musik | mu | #F44336 | 🎵 |
| Bildnerisches Gestalten | bg | #E91E63 | 🎨 |
| Textiles und Techn. Gestalten | ttg | #3F51B5 | ✂️ |
| Bewegung und Sport | bs | #8BC34A | ⚽ |
| Berufliche Orientierung | bo | #00BCD4 | 💼 |
| Französisch | fr | #1565C0 | 🇫🇷 |
| Englisch | en | #C62828 | 🇬🇧 |

## Spieltypen und JSON-Formate

### 1. quiz (Multiple Choice)
Dateiname: `data/{fach}/{kompetenz-id}.json`
```json
{
  "kompetenz_id": "xx1a",
  "kompetenz_code": "XX.1.A",
  "typ": "quiz",
  "spiel": {
    "fragen": [
      {
        "frage": "Die Fragestellung?",
        "optionen": ["Antwort A", "Antwort B", "Antwort C", "Antwort D"],
        "korrekt": 1,
        "erklaerung": "Erklärung warum Antwort B richtig ist."
      }
    ]
  }
}
```
**Regeln:** Mind. 8 Fragen pro Kompetenz. `korrekt` = Index (0-basiert). 4 Optionen pro Frage.

### 2. zuordnung (Drag & Drop Kategorisierung)
```json
{
  "kompetenz_id": "xx1b",
  "kompetenz_code": "XX.1.B",
  "typ": "zuordnung",
  "spiel": {
    "kategorien": ["Kategorie 1", "Kategorie 2", "Kategorie 3"],
    "elemente": [
      { "text": "Element A", "kategorie": 0 },
      { "text": "Element B", "kategorie": 1 }
    ]
  }
}
```
**Regeln:** Mind. 8 Elemente, 2-4 Kategorien. `kategorie` = Index der Kategorie.

### 3. memory (Paare finden)
```json
{
  "kompetenz_id": "xx1c",
  "typ": "memory",
  "spiel": {
    "paare": [
      { "a": "Begriff", "b": "Definition" },
      { "a": "Wort", "b": "Übersetzung" }
    ]
  }
}
```
**Regeln:** 6-8 Paare. Gut für Vokabeln, Fachbegriff-Definitionen, Bild-Text-Paare.

### 4. lueckentext (Lückentext)
```json
{
  "kompetenz_id": "xx2a",
  "typ": "lueckentext",
  "spiel": {
    "saetze": [
      {
        "text": "Die {Photosynthese} findet in den {Chloroplasten} statt.",
        "hinweise": ["Prozess", "Zellorganell"],
        "anweisung": "Fülle die Lücken mit den richtigen Fachbegriffen."
      }
    ]
  }
}
```
**Regeln:** Wörter in `{geschweifte Klammern}` werden zu Lücken. Mind. 5 Sätze.

### 5. sortieren (Reihenfolge)
```json
{
  "kompetenz_id": "xx2b",
  "typ": "sortieren",
  "spiel": {
    "aufgaben": [
      {
        "anweisung": "Ordne die Schritte in die richtige Reihenfolge.",
        "elemente": ["Schritt 1", "Schritt 2", "Schritt 3", "Schritt 4"]
      }
    ]
  }
}
```
**Regeln:** `elemente`-Array ist in KORREKTER Reihenfolge (wird automatisch gemischt). Mind. 3 Aufgaben.

### 6. rechnen (Mathematik)
```json
{
  "kompetenz_id": "ma1a",
  "typ": "rechnen",
  "spiel": {
    "zeit": 120,
    "aufgaben": [
      { "aufgabe": "3x + 7 = 22, x = ?", "loesung": "5", "hinweis": "Löse nach x auf" }
    ]
  }
}
```
**Regeln:** `loesung` als String (wird zu Float geparst). Mind. 10 Aufgaben. `zeit` in Sekunden.

### 7. wortspiel (Buchstabensalat / Anagramm)
```json
{
  "kompetenz_id": "de5a",
  "typ": "wortspiel",
  "spiel": {
    "woerter": [
      { "wort": "METAPHER", "hinweis": "Sprachliches Bild (Stilmittel)" }
    ]
  }
}
```
**Regeln:** Buchstaben werden automatisch gemischt. Mind. 8 Wörter. `wort` in GROSSBUCHSTABEN.

### 8. zuordnung-bild (Bild-Zuordnung mit Emojis)
```json
{
  "kompetenz_id": "mu1a",
  "typ": "zuordnung-bild",
  "spiel": {
    "kategorien": ["Streichinstrumente", "Blasinstrumente"],
    "elemente": [
      { "text": "Geige", "emoji": "🎻", "kategorie": 0 },
      { "text": "Trompete", "emoji": "🎺", "kategorie": 1 }
    ]
  }
}
```
**Regeln:** Wie `zuordnung`, aber mit `emoji`-Feld für visuelle Darstellung.

### 9. timeline (Zeitleiste)
```json
{
  "kompetenz_id": "rzg5a",
  "typ": "timeline",
  "spiel": {
    "aufgaben": [
      {
        "anweisung": "Ordne die Ereignisse chronologisch.",
        "ereignisse": [
          { "text": "Gründung der Eidgenossenschaft", "jahr": "1291" },
          { "text": "Reformation", "jahr": "1523" }
        ]
      }
    ]
  }
}
```
**Regeln:** `ereignisse` in KORREKTER chronologischer Reihenfolge. `jahr` wird nach dem Überprüfen angezeigt.

### 10. coding-puzzle (Block-Programmierung)
```json
{
  "kompetenz_id": "mi2b",
  "typ": "coding-puzzle",
  "spiel": {
    "aufgaben": [
      {
        "anweisung": "Bringe die Code-Blöcke in die richtige Reihenfolge.",
        "bloecke": [
          { "text": "Setze x = 0", "typ": "move" },
          { "text": "SOLANGE x < 10:", "typ": "loop" },
          { "text": "  Gib x aus", "typ": "move" },
          { "text": "  x = x + 1", "typ": "move" }
        ]
      }
    ]
  }
}
```
**Regeln:** `bloecke` in KORREKTER Reihenfolge. `typ`: move, loop, condition, turn. Nur für MI.

## Qualitäts-Checkliste
- [ ] Alle Kompetenzen des Fachs aus LP21 Zyklus 3 abgedeckt?
- [ ] Mind. 8-10 Fragen/Elemente pro Spiel?
- [ ] Kompetenz-ID, Code und Beschreibung stimmen mit LP21 überein?
- [ ] JSON ist valide (keine Syntax-Fehler)?
- [ ] Spieltyp passt zur Kompetenz (z.B. Rechnen für Mathe, nicht Quiz)?
- [ ] Fach-Eintrag in faecher.json korrekt ergänzt?
- [ ] Inhaltlich korrekt und altersgerecht für Sek I?

## Referenz-Beispiel
Schau dir die MI-Dateien in `data/mi/` als Referenz an. Sie zeigen alle Spieltypen im Einsatz.

## Starten & Testen
```bash
cd C:\Users\Praeto\lp21-lernwelt
python -m http.server 8000
# Dann im Browser: http://localhost:8000
```
Oder VS Code Extension "Live Server" verwenden.
