/* LP21 Lernwelt - Daily Challenge */

const DailyChallenge = {
    KEY: 'lp21-daily',

    /** Deterministic date-based hash → index */
    _hashDate(dateStr) {
        let hash = 0;
        for (const ch of dateStr) hash = (hash * 31 + ch.charCodeAt(0)) & 0xFFFFFF;
        return Math.abs(hash);
    },

    /** Build flat list of all competencies from faecher data */
    _flatten(faecher) {
        const list = [];
        for (const fach of faecher) {
            for (const bereich of fach.bereiche || []) {
                for (const k of bereich.kompetenzen || []) {
                    list.push({ fachId: fach.id, fachName: fach.name, fachIcon: fach.icon, fachFarbe: fach.farbe, kompetenzId: k.id, kompetenzName: k.name, kompetenzCode: k.code, spieltyp: k.spieltyp });
                }
            }
        }
        return list;
    },

    /** Get today's challenge. Pass faecher array. Returns competency info object. */
    getToday(faecher) {
        const today = new Date().toISOString().split('T')[0];
        const all = this._flatten(faecher);
        if (all.length === 0) return null;

        const idx = this._hashDate(today) % all.length;
        return { ...all[idx], date: today };
    },

    /** Load or create daily state from storage */
    getState() {
        try {
            return JSON.parse(localStorage.getItem(this.KEY)) || {};
        } catch { return {}; }
    },

    /** Mark today's challenge as completed */
    markCompleted(fachId, kompetenzId) {
        const today = new Date().toISOString().split('T')[0];
        const state = this.getState();
        state.date = today;
        state.fachId = fachId;
        state.kompetenzId = kompetenzId;
        state.completed = true;
        localStorage.setItem(this.KEY, JSON.stringify(state));
    },

    /** Is today's challenge completed? */
    isCompleted() {
        const state = this.getState();
        const today = new Date().toISOString().split('T')[0];
        return state.date === today && state.completed === true;
    },

    /** Is this fachId/kompetenzId today's challenge? */
    isToday(fachId, kompetenzId, faecher) {
        const today = this.getToday(faecher);
        return today && today.fachId === fachId && today.kompetenzId === kompetenzId;
    },

    /** Render the daily challenge banner into a container element */
    renderBanner(containerId, challenge) {
        const container = document.getElementById(containerId);
        if (!container || !challenge) return;

        const completed = this.isCompleted();
        const banner = document.createElement('div');
        banner.className = `daily-banner${completed ? ' daily-banner-done' : ''}`;
        banner.innerHTML = `
            <div class="daily-banner-inner">
                <div class="daily-banner-left">
                    <span class="daily-icon">📅</span>
                    <div class="daily-info">
                        <div class="daily-label">Tages-Challenge</div>
                        <div class="daily-name">${challenge.fachIcon} ${challenge.fachName} — ${challenge.kompetenzName}</div>
                    </div>
                </div>
                <div class="daily-banner-right">
                    ${completed
                        ? '<span class="daily-done">✅ Erledigt!</span>'
                        : `<a href="pages/spiel.html?fach=${challenge.fachId}&kompetenz=${challenge.kompetenzId}&typ=${challenge.spieltyp}&daily=1" class="daily-play-btn">
                                🔥 2× XP spielen
                           </a>`
                    }
                </div>
            </div>
        `;
        banner.style.setProperty('--daily-color', challenge.fachFarbe);
        container.appendChild(banner);
    }
};
