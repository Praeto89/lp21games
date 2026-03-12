/* LP21 Lernwelt - localStorage Fortschritts-Tracking */

const LP21Storage = {
    KEY: 'lp21-fortschritt',

    _getData() {
        try {
            return JSON.parse(localStorage.getItem(this.KEY)) || {};
        } catch {
            return {};
        }
    },

    _saveData(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    /** Fortschritt für eine Kompetenz speichern */
    saveProgress(fachId, kompetenzId, sterne, punkte) {
        const data = this._getData();
        if (!data[fachId]) data[fachId] = {};

        const existing = data[fachId][kompetenzId] || { sterne: 0, versuche: 0, bestePunkte: 0 };
        data[fachId][kompetenzId] = {
            sterne: Math.max(existing.sterne, sterne),
            bestePunkte: Math.max(existing.bestePunkte, punkte),
            versuche: existing.versuche + 1,
            letzterVersuch: new Date().toISOString().split('T')[0]
        };

        this._saveData(data);
    },

    /** Fortschritt einer Kompetenz abrufen */
    getProgress(fachId, kompetenzId) {
        const data = this._getData();
        return data[fachId]?.[kompetenzId] || { sterne: 0, versuche: 0, bestePunkte: 0 };
    },

    /** Alle Fortschritte eines Fachs */
    getFachProgress(fachId) {
        const data = this._getData();
        return data[fachId] || {};
    },

    /** Prozent der gemeisterten Kompetenzen eines Fachs (mindestens 1 Stern) */
    getFachPercent(fachId, totalKompetenzen) {
        const fachData = this.getFachProgress(fachId);
        const gemeistert = Object.values(fachData).filter(k => k.sterne > 0).length;
        return totalKompetenzen > 0 ? Math.round((gemeistert / totalKompetenzen) * 100) : 0;
    },

    /** Gesamtfortschritt über alle Fächer */
    getTotalProgress(faecherArray) {
        let total = 0;
        let gemeistert = 0;
        for (const fach of faecherArray) {
            const count = this._countKompetenzen(fach);
            total += count;
            const fachData = this.getFachProgress(fach.id);
            gemeistert += Object.values(fachData).filter(k => k.sterne > 0).length;
        }
        return total > 0 ? Math.round((gemeistert / total) * 100) : 0;
    },

    _countKompetenzen(fach) {
        let count = 0;
        if (fach.bereiche) {
            for (const bereich of fach.bereiche) {
                count += bereich.kompetenzen?.length || 0;
            }
        }
        return count;
    },

    /** Fortschritt komplett zurücksetzen */
    reset() {
        localStorage.removeItem(this.KEY);
    }
};
