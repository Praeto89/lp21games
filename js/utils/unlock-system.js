/* LP21 Lernwelt - Unlock System */

const UnlockSystem = {
    /** Is this competency unlocked?
     *  Rule: index 0 in each Bereich is always open.
     *  Others unlock when the previous competency has >= 1 star.
     */
    isUnlocked(fachId, bereichKompetenzen, kompetenzIndex) {
        if (kompetenzIndex === 0) return true;
        const prev = bereichKompetenzen[kompetenzIndex - 1];
        if (!prev) return true;
        const progress = LP21Storage.getProgress(fachId, prev.id);
        return progress.sterne >= 1;
    },

    /** Is the unlock system enabled? (Teachers can disable it via settings) */
    isEnabled() {
        return LP21Storage.getSettings().unlockEnabled !== false;
    },

    /** Toggle unlock system on/off */
    toggle() {
        const current = this.isEnabled();
        LP21Storage.saveSetting('unlockEnabled', !current);
        return !current;
    }
};
