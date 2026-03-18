/* LP21 Lernwelt - Story & World Map Texts */

const Story = {
    /** Short narrative intro per subject */
    FACH_STORY: {
        'deutsch': {
            region: 'Das Sprachreich',
            tagline: 'Worte formen die Welt',
            intro: 'Im Sprachreich erlernst du die Kunst des Lesens, Schreibens und Sprechens. Sprache ist Macht — wer sie beherrscht, kann die Welt verändern.'
        },
        'mathematik': {
            region: 'Das Zahlenland',
            tagline: 'Ordnung im Chaos der Welt',
            intro: 'Im Zahlenland entdeckst du die geheime Sprache des Universums. Von Algebra bis Geometrie — Mathematik steckt überall dahinter.'
        },
        'natur-technik': {
            region: 'Das Forscherlabor',
            tagline: 'Fragen, entdecken, verstehen',
            intro: 'Im Forscherlabor ergründest du die Gesetze der Natur. Von Atomen bis Ökosystemen — die Welt ist voller Geheimnisse, die darauf warten, gelüftet zu werden.'
        },
        'wah': {
            region: 'Die Lebenswerkstatt',
            tagline: 'Leben und Wirtschaften verstehen',
            intro: 'In der Lebenswerkstatt lernst du, wie Wirtschaft und Alltag zusammenhängen. Haushalten, kochen, konsumieren — Fähigkeiten fürs echte Leben.'
        },
        'rzg': {
            region: 'Der Zeitatlas',
            tagline: 'Vergangenheit, Gegenwart, Zukunft',
            intro: 'Im Zeitatlas erforschst du Räume und Zeiten. Wer die Geschichte kennt, versteht die Gegenwart — und kann die Zukunft mitgestalten.'
        },
        'erg': {
            region: 'Der Begegnungsplatz',
            tagline: 'Werte, Vielfalt, Gemeinschaft',
            intro: 'Am Begegnungsplatz diskutierst du grosse Fragen: Wie wollen wir zusammenleben? Was ist richtig? Ethik, Religionen und Gesellschaft im Dialog.'
        },
        'mu': {
            region: 'Die Klangwelt',
            tagline: 'Töne, Rhythmus, Ausdruck',
            intro: 'In der Klangwelt entdeckst du die Sprache der Musik. Vom Takt bis zur Harmonie — Musik verbindet Menschen über alle Grenzen hinweg.'
        },
        'bg': {
            region: 'Das Atelier',
            tagline: 'Sehen, gestalten, ausdrücken',
            intro: 'Im Atelier schärfst du deinen Blick für Form, Farbe und Komposition. Bildnerisches Gestalten öffnet ein Fenster in die Welt des Visuellen.'
        },
        'ttg': {
            region: 'Die Werkstatt',
            tagline: 'Planen, bauen, erschaffen',
            intro: 'In der Werkstatt lernst du, mit den Händen zu denken. Von der Skizze zum Produkt — textiles und technisches Gestalten macht Ideen greifbar.'
        },
        'bs': {
            region: 'Das Spielfeld',
            tagline: 'Bewegen, spielen, gewinnen',
            intro: 'Auf dem Spielfeld trainierst du Körper, Koordination und Teamgeist. Sport ist mehr als Bewegung — es ist Ausdruck, Respekt und Leidenschaft.'
        },
        'bo': {
            region: 'Die Orientierungshalle',
            tagline: 'Wer bin ich? Wohin gehe ich?',
            intro: 'In der Orientierungshalle erkundest du deine Talente und die Berufswelt. Berufliche Orientierung heisst: Herausfinden, wer du sein möchtest.'
        },
        'fr': {
            region: 'La Région Française',
            tagline: 'Parler, comprendre, découvrir',
            intro: 'Dans la Région Française, tu découvres une nouvelle langue et culture. Le français t\'ouvre des portes vers un monde fascinant et varié.'
        },
        'en': {
            region: 'The English Quarter',
            tagline: 'Speak, connect, explore',
            intro: 'In the English Quarter you unlock the world\'s most global language. English connects continents, cultures and countless opportunities.'
        }
    },

    /** Get story for a fach, with fallback */
    getFach(fachId) {
        return this.FACH_STORY[fachId] || {
            region: 'Unbekannte Region',
            tagline: 'Erkunde und lerne',
            intro: 'Eine spannende Region wartet darauf, entdeckt zu werden.'
        };
    },

    /** Compute overall world progress from storage + faecher data */
    getWorldProgress(faecher) {
        return faecher.map(fach => {
            let total = 0;
            let done = 0;
            let maxSterne = 0;
            let totalSterne = 0;

            for (const bereich of fach.bereiche || []) {
                for (const k of bereich.kompetenzen || []) {
                    total++;
                    const p = LP21Storage.getProgress(fach.id, k.id);
                    if (p.sterne > 0) done++;
                    totalSterne += p.sterne;
                    maxSterne += 3;
                }
            }

            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const starPct = maxSterne > 0 ? Math.round((totalSterne / maxSterne) * 100) : 0;

            return {
                ...fach,
                total,
                done,
                pct,
                starPct,
                story: this.getFach(fach.id)
            };
        });
    }
};
