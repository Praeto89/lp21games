/* LP21 Lernwelt - Difficulty Manager */

const DifficultyManager = {
    LEVELS: {
        leicht: { label: 'Leicht', icon: '🌱', xpMultiplier: 0.5, timerMultiplier: 1.5, starThresholds: [0.9, 0.6, 0.3] },
        normal: { label: 'Normal', icon: '⚡', xpMultiplier: 1.0, timerMultiplier: 1.0, starThresholds: [0.9, 0.6, 0.3] },
        schwer: { label: 'Schwer', icon: '🔥', xpMultiplier: 2.0, timerMultiplier: 0.75, starThresholds: [0.95, 0.75, 0.5] }
    },

    _current: 'normal',

    get() {
        const saved = LP21Storage.getSettings().difficulty || 'normal';
        this._current = saved;
        return saved;
    },

    set(level) {
        if (!this.LEVELS[level]) return;
        this._current = level;
        LP21Storage.saveSetting('difficulty', level);
    },

    getCurrent() {
        return this.LEVELS[this.get()];
    },

    getKey() {
        return this.get();
    },

    getXPMultiplier() {
        return this.getCurrent().xpMultiplier;
    },

    getTimerMultiplier() {
        return this.getCurrent().timerMultiplier;
    },

    getStarThresholds() {
        return this.getCurrent().starThresholds;
    },

    /** Show hints on Leicht, hide on Schwer */
    showHints() {
        return this.get() === 'leicht';
    },

    /** Show explanations: yes on Leicht/Normal, no on Schwer */
    showExplanations() {
        return this.get() !== 'schwer';
    },

    /** Render the difficulty selector UI and return a Promise that resolves with the chosen level */
    showSelector() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'difficulty-overlay';

            const currentKey = this.get();

            overlay.innerHTML = `
                <div class="difficulty-card">
                    <div class="difficulty-title">Schwierigkeitsgrad wählen</div>
                    <div class="difficulty-subtitle">Beeinflusst XP-Gewinn und Spielbedingungen</div>
                    <div class="difficulty-options">
                        ${Object.entries(this.LEVELS).map(([key, lvl]) => `
                            <button class="difficulty-btn${key === currentKey ? ' active' : ''}" data-key="${key}">
                                <span class="difficulty-btn-icon">${lvl.icon}</span>
                                <span class="difficulty-btn-label">${lvl.label}</span>
                                <span class="difficulty-btn-xp">${lvl.xpMultiplier === 1 ? 'Normal XP' : lvl.xpMultiplier > 1 ? `${lvl.xpMultiplier}× XP` : `${lvl.xpMultiplier}× XP`}</span>
                            </button>
                        `).join('')}
                    </div>
                    <button class="game-btn game-btn-primary difficulty-start">Spielen!</button>
                </div>
            `;

            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('visible'));

            // Highlight selection
            overlay.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    overlay.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.set(btn.dataset.key);
                });
            });

            overlay.querySelector('.difficulty-start').addEventListener('click', () => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    overlay.remove();
                    resolve(this.get());
                }, 300);
            });
        });
    }
};
