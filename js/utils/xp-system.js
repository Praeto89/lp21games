/* LP21 Lernwelt - XP & Level System */

const XPSystem = {
    KEY: 'lp21-xp',

    LEVELS: [
        { threshold: 0,    name: 'Anfänger',      icon: '🌱' },
        { threshold: 100,  name: 'Lehrling',      icon: '📖' },
        { threshold: 300,  name: 'Geselle',       icon: '⚡' },
        { threshold: 600,  name: 'Fachkraft',     icon: '🔧' },
        { threshold: 1000, name: 'Meister',       icon: '🏅' },
        { threshold: 1500, name: 'Experte',       icon: '🎯' },
        { threshold: 2500, name: 'Grossmeister',  icon: '👑' },
        { threshold: 4000, name: 'Legende',       icon: '🌟' }
    ],

    _getData() {
        try {
            return JSON.parse(localStorage.getItem(this.KEY)) || { totalXP: 0 };
        } catch {
            return { totalXP: 0 };
        }
    },

    _saveData(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    /** Add XP and check for level-up */
    addXP(amount) {
        const data = this._getData();
        const oldLevel = this._calcLevel(data.totalXP);
        data.totalXP += amount;
        const newLevel = this._calcLevel(data.totalXP);
        this._saveData(data);

        return {
            totalXP: data.totalXP,
            xpGained: amount,
            leveledUp: newLevel.number > oldLevel.number,
            oldLevel,
            newLevel
        };
    },

    /** Get current level info */
    getLevel() {
        const data = this._getData();
        return this._calcLevel(data.totalXP);
    },

    /** Get total XP */
    getTotalXP() {
        return this._getData().totalXP;
    },

    /** Calculate level from XP amount */
    _calcLevel(xp) {
        let levelIndex = 0;
        for (let i = this.LEVELS.length - 1; i >= 0; i--) {
            if (xp >= this.LEVELS[i].threshold) {
                levelIndex = i;
                break;
            }
        }

        const current = this.LEVELS[levelIndex];
        const next = this.LEVELS[levelIndex + 1] || null;
        const xpInLevel = xp - current.threshold;
        const xpForNext = next ? next.threshold - current.threshold : 0;
        const progress = next ? Math.min(xpInLevel / xpForNext, 1) : 1;

        return {
            number: levelIndex + 1,
            name: current.name,
            icon: current.icon,
            xp,
            xpInLevel,
            xpForNext,
            progress
        };
    },

    /** Render level badge HTML into a container */
    renderBadge(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const level = this.getLevel();
        container.innerHTML = `
            <div class="level-badge" title="Level ${level.number}: ${level.name} (${level.xp} XP)">
                <span class="level-icon">${level.icon}</span>
                <span class="level-name">${level.name}</span>
                <div class="xp-bar">
                    <div class="xp-bar-fill" style="width: ${Math.round(level.progress * 100)}%"></div>
                </div>
                <span class="xp-text">${level.xp} XP</span>
            </div>
        `;
    }
};
