/* LP21 Lernwelt - Game Engine (Kern-Spiellogik) */

class GameEngine {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.fachId = options.fachId || '';
        this.kompetenzId = options.kompetenzId || '';
        this.fachFarbe = options.fachFarbe || '#1a237e';

        this.score = 0;
        this.maxScore = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 0;
        this.timerInterval = null;
        this.timeLeft = 0;
        this.startTime = null;

        // Set CSS variable for fach color
        document.documentElement.style.setProperty('--fach-farbe', this.fachFarbe);
    }

    /** Initialize HUD (score, timer, progress) */
    initHUD(options = {}) {
        const hud = DOM.create('div', { class: 'game-hud' }, [
            DOM.create('div', { class: 'game-score' }, [
                DOM.create('span', { class: 'game-score-icon' }),
                DOM.create('span', { class: 'game-score-value', text: '0' })
            ]),
            DOM.create('div', { class: 'game-progress-indicator' }, [
                DOM.create('span', { class: 'game-progress-icon' }),
                DOM.create('span', { class: 'game-progress-value', text: '0 / 0' })
            ]),
            ...(options.timer ? [
                DOM.create('div', { class: 'game-timer' }, [
                    DOM.create('span', { class: 'game-timer-icon' }),
                    DOM.create('span', { class: 'game-timer-value', text: this._formatTime(options.timer) })
                ])
            ] : [])
        ]);
        this.container.insertBefore(hud, this.container.firstChild);

        if (options.timer) {
            this.startTimer(options.timer);
        }
    }

    /** Update score display */
    addScore(points) {
        this.score += points;
        const el = this.container.querySelector('.game-score-value');
        if (el) {
            el.textContent = this.score;
            el.classList.add('animate-pop');
            setTimeout(() => el.classList.remove('animate-pop'), 300);
        }
    }

    /** Update progress display */
    updateProgress(current, total) {
        this.currentQuestion = current;
        this.totalQuestions = total;
        const el = this.container.querySelector('.game-progress-value');
        if (el) el.textContent = `${current} / ${total}`;
    }

    /** Start countdown timer */
    startTimer(seconds) {
        this.timeLeft = seconds;
        this.startTime = Date.now();
        const el = this.container.querySelector('.game-timer-value');
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (el) el.textContent = this._formatTime(this.timeLeft);
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.endGame();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    _formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    /** Calculate stars based on score percentage */
    calculateStars() {
        if (this.maxScore === 0) return 0;
        const pct = this.score / this.maxScore;
        if (pct >= 0.9) return 3;
        if (pct >= 0.6) return 2;
        if (pct >= 0.3) return 1;
        return 0;
    }

    /** End game and show results */
    endGame() {
        this.stopTimer();
        const sterne = this.calculateStars();
        const pct = this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0;

        // Save progress
        LP21Storage.saveProgress(this.fachId, this.kompetenzId, sterne, this.score);

        // Show overlay
        const overlay = DOM.create('div', { class: 'game-feedback-overlay' });
        const messages = [
            'Weiter üben!',
            'Guter Anfang!',
            'Gut gemacht!',
            'Ausgezeichnet!'
        ];
        const icons = ['💪', '👍', '🎉', '🏆'];

        const card = DOM.create('div', { class: 'game-feedback-card' }, [
            DOM.create('div', { class: 'game-feedback-icon', text: icons[sterne] }),
            DOM.create('div', { class: 'game-feedback-title', text: messages[sterne] }),
            DOM.create('div', { class: 'game-feedback-message', text: `${this.score} von ${this.maxScore} Punkten (${pct}%)` }),
            DOM.create('div', { class: 'game-stars', html: Feedback.starsHTML(sterne) }),
            DOM.create('div', { class: 'game-actions' }, [
                DOM.create('button', {
                    class: 'game-btn game-btn-primary',
                    text: 'Nochmal spielen',
                    onClick: () => location.reload()
                }),
                DOM.create('a', {
                    class: 'game-btn game-btn-secondary',
                    text: 'Zurück zum Fach',
                    href: `fach.html?fach=${this.fachId}`
                })
            ])
        ]);

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => overlay.classList.add('visible'));
        if (sterne === 3) Feedback.celebrate();
    }

    /** Load game data from JSON */
    static async loadData(fachId, kompetenzId) {
        // Try specific file first, then fallback to combined file
        const paths = [
            `../data/${fachId}/${kompetenzId}.json`,
            `../data/${fachId}/all.json`
        ];

        for (const path of paths) {
            try {
                const resp = await fetch(path);
                if (resp.ok) {
                    const data = await resp.json();
                    // If combined file, filter by kompetenzId
                    if (Array.isArray(data)) {
                        return data.find(d => d.kompetenz_id === kompetenzId) || data[0];
                    }
                    return data;
                }
            } catch { /* try next */ }
        }
        throw new Error(`Keine Spieldaten gefunden für ${fachId}/${kompetenzId}`);
    }

    /** Load faecher.json */
    static async loadFaecher() {
        const resp = await fetch(location.pathname.includes('/pages/') ? '../faecher.json' : 'faecher.json');
        return resp.json();
    }

    /** Find a specific Fach in faecher data */
    static findFach(data, fachId) {
        return data.faecher.find(f => f.id === fachId);
    }

    /** Find a specific Kompetenz within a Fach */
    static findKompetenz(fach, kompetenzId) {
        for (const bereich of fach.bereiche || []) {
            const k = bereich.kompetenzen?.find(k => k.id === kompetenzId);
            if (k) return { ...k, bereich: bereich.name };
        }
        return null;
    }
}
