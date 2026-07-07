/* LP21 Lernwelt - Game Engine (Kern-Spiellogik) */

class GameEngine {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.fachId = options.fachId || '';
        this.kompetenzId = options.kompetenzId || '';
        this.fachFarbe = options.fachFarbe || '#1a237e';

        this.score = 0;      // inkl. Streak-/Zeitboni → bestimmt XP
        this.baseScore = 0;  // nur Basis-Punkte → bestimmt Sterne
        this.maxScore = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 0;
        this.timerInterval = null;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.startTime = null;

        // Reset streak for new game
        if (typeof StreakTracker !== 'undefined') StreakTracker.reset();

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
            DOM.create('div', { class: 'game-combo' }),
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

        // Visuelle Fortschrittsleiste über dem HUD (Spiele fügen ihren
        // Inhalt mit hud.after() ein, daher muss die Leiste davor stehen)
        const bar = DOM.create('div', { class: 'game-hud-bar' }, [
            DOM.create('div', { class: 'game-hud-bar-fill' })
        ]);
        this.container.insertBefore(bar, hud);

        if (options.timer) {
            this.totalTime = options.timer;
            this.startTimer(options.timer);
        }
    }

    /** Update score display, handle streak + XP + sound */
    addScore(points) {
        this.baseScore += points;
        let totalPoints = points;

        // Streak bonus
        if (typeof StreakTracker !== 'undefined') {
            const { streak, bonus } = StreakTracker.recordCorrect();
            totalPoints += bonus;

            if (streak >= 3 && typeof Feedback !== 'undefined') {
                Feedback.showStreak(streak, bonus);
                if (typeof SoundManager !== 'undefined') SoundManager.play('streak');
            } else if (typeof SoundManager !== 'undefined') {
                SoundManager.play('correct');
            }
        } else if (typeof SoundManager !== 'undefined') {
            SoundManager.play('correct');
        }

        // Time bonus (only if timer is running)
        if (this.totalTime > 0 && this.timeLeft > 0) {
            const timeBonus = Math.max(0, Math.floor((this.timeLeft / this.totalTime) * 5));
            if (timeBonus > 0) {
                totalPoints += timeBonus;
            }
        }

        this.score += totalPoints;
        const el = this.container.querySelector('.game-score-value');
        if (el) {
            el.textContent = this.score;
            el.classList.add('animate-pop');
            setTimeout(() => el.classList.remove('animate-pop'), 300);
            if (typeof Feedback !== 'undefined') Feedback.floatPoints(el, `+${totalPoints}`);
        }

        // Combo-Anzeige im HUD (ab 2 richtigen in Folge)
        const comboEl = this.container.querySelector('.game-combo');
        if (comboEl && typeof StreakTracker !== 'undefined') {
            if (StreakTracker.current >= 2) {
                comboEl.textContent = `🔥 ×${StreakTracker.current}`;
                comboEl.classList.add('active', 'animate-pop');
                setTimeout(() => comboEl.classList.remove('animate-pop'), 300);
            }
        }
    }

    /** Record wrong answer — resets streak, plays sound */
    recordWrong() {
        if (typeof StreakTracker !== 'undefined') StreakTracker.recordWrong();
        if (typeof SoundManager !== 'undefined') SoundManager.play('wrong');

        const comboEl = this.container.querySelector('.game-combo');
        if (comboEl) {
            comboEl.textContent = '';
            comboEl.classList.remove('active');
        }
    }

    /** Update progress display */
    updateProgress(current, total) {
        this.currentQuestion = current;
        this.totalQuestions = total;
        const el = this.container.querySelector('.game-progress-value');
        if (el) el.textContent = `${current} / ${total}`;
        const fill = this.container.querySelector('.game-hud-bar-fill');
        if (fill && total > 0) fill.style.width = Math.round((current / total) * 100) + '%';
    }

    /** Start countdown timer */
    startTimer(seconds) {
        this.timeLeft = seconds;
        this.startTime = Date.now();
        const el = this.container.querySelector('.game-timer-value');
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (el) el.textContent = this._formatTime(this.timeLeft);
            if (this.timeLeft <= 10 && el) el.style.color = '#f44336';
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

    /** Calculate stars based on base score percentage (difficulty-aware).
     *  Bewusst ohne Streak-/Zeitboni: Sterne messen Können, Boni zahlen auf XP ein. */
    calculateStars() {
        if (this.maxScore === 0) return 0;
        const pct = this.baseScore / this.maxScore;
        const thresholds = typeof DifficultyManager !== 'undefined'
            ? DifficultyManager.getStarThresholds()
            : [0.9, 0.6, 0.3];
        if (pct >= thresholds[0]) return 3;
        if (pct >= thresholds[1]) return 2;
        if (pct >= thresholds[2]) return 1;
        return 0;
    }

    /** End game and show results */
    endGame() {
        this.stopTimer();
        const sterne = this.calculateStars();
        const pct = this.maxScore > 0 ? Math.round((this.baseScore / this.maxScore) * 100) : 0;

        // Save progress
        LP21Storage.saveProgress(this.fachId, this.kompetenzId, sterne, this.score);

        // Award XP (with difficulty multiplier + daily bonus) and check level-up
        let xpResult = null;
        let isDailyChallenge = false;
        if (typeof XPSystem !== 'undefined') {
            let multiplier = typeof DifficultyManager !== 'undefined'
                ? DifficultyManager.getXPMultiplier() : 1;

            // Check if this is today's daily challenge
            if (typeof DailyChallenge !== 'undefined') {
                const params = new URLSearchParams(location.search);
                if (params.get('daily') === '1') {
                    multiplier *= 2;
                    isDailyChallenge = true;
                    DailyChallenge.markCompleted(this.fachId, this.kompetenzId);
                }
            }

            const xpEarned = Math.round(this.score * multiplier);
            xpResult = XPSystem.addXP(xpEarned);
            if (isDailyChallenge) xpResult.xpGained = xpEarned; // ensure correct display
        }

        // Check achievements
        if (typeof Achievements !== 'undefined') {
            const streak = typeof StreakTracker !== 'undefined' ? StreakTracker.best : 0;
            const level = typeof XPSystem !== 'undefined' ? XPSystem.getLevel().number : 1;
            const difficulty = typeof DifficultyManager !== 'undefined' ? DifficultyManager.getKey() : 'normal';
            const newAchievements = Achievements.check({ sterne, streak, level, fachId: this.fachId, difficulty });
            // Show achievement popups with staggered delay
            newAchievements.forEach((a, i) => {
                setTimeout(() => Feedback.showAchievement(a), 1200 + i * 1200);
            });
        }

        // Play star sound
        if (sterne > 0 && typeof SoundManager !== 'undefined') {
            setTimeout(() => SoundManager.play('star'), 300);
        }

        // Show overlay
        const overlay = DOM.create('div', { class: 'game-feedback-overlay' });
        const messagePool = [
            ['Weiter üben!', 'Dranbleiben!', 'Jeder Profi hat mal angefangen.'],
            ['Guter Anfang!', 'Da geht noch mehr!', 'Solide Basis!'],
            ['Gut gemacht!', 'Stark gespielt!', 'Fast perfekt!'],
            ['Ausgezeichnet!', 'Perfekte Runde!', 'Du bist on fire!']
        ];
        const messages = messagePool.map(pool => pool[Math.floor(Math.random() * pool.length)]);
        const icons = ['💪', '👍', '🎉', '🏆'];

        // Near-Miss-Ziel: wie viele Punkte fehlen bis zum nächsten Stern?
        let goalEl = null;
        if (sterne < 3 && this.maxScore > 0) {
            const thresholds = typeof DifficultyManager !== 'undefined'
                ? DifficultyManager.getStarThresholds()
                : [0.9, 0.6, 0.3];
            const nextThreshold = thresholds[2 - sterne];
            const missing = Math.ceil(nextThreshold * this.maxScore - this.baseScore);
            if (missing > 0) {
                goalEl = DOM.create('div', {
                    class: 'game-next-goal',
                    text: `🎯 Nur noch ${missing} Punkte bis ${'★'.repeat(sterne + 1)} — schaffst du das?`
                });
            }
        }

        // Difficulty badge
        const diff = typeof DifficultyManager !== 'undefined' ? DifficultyManager.getCurrent() : null;
        const diffEl = diff
            ? DOM.create('div', { class: 'game-difficulty-result', text: `${diff.icon} ${diff.label}` })
            : null;

        // Daily challenge badge
        const dailyEl = isDailyChallenge
            ? DOM.create('div', { class: 'game-daily-result', text: '📅 Tages-Challenge · 2× XP!' })
            : null;

        // XP gain display
        const xpEl = xpResult
            ? DOM.create('div', { class: 'game-xp-gain', text: `+${xpResult.xpGained} XP` })
            : null;

        // Streak display
        const streakBest = typeof StreakTracker !== 'undefined' ? StreakTracker.best : 0;
        const streakEl = streakBest >= 3
            ? DOM.create('div', { class: 'game-streak-result', text: `🔥 Bester Streak: ${streakBest}x` })
            : null;

        const cardChildren = [
            DOM.create('div', { class: 'game-feedback-icon', text: icons[sterne] }),
            DOM.create('div', { class: 'game-feedback-title', text: messages[sterne] }),
            DOM.create('div', {
                class: 'game-feedback-message',
                text: `${pct}% gelöst · ${this.score} Punkte`
                    + (this.score > this.baseScore ? ` (davon ${this.score - this.baseScore} Bonus 🔥)` : '')
            }),
            DOM.create('div', { class: 'game-stars', html: Feedback.starsHTML(sterne) }),
            ...(goalEl ? [goalEl] : []),
            ...(dailyEl ? [dailyEl] : []),
            ...(diffEl ? [diffEl] : []),
            ...(xpEl ? [xpEl] : []),
            ...(streakEl ? [streakEl] : []),
            DOM.create('div', { class: 'game-actions' }, [
                DOM.create('button', {
                    class: 'game-btn game-btn-primary',
                    text: 'Nochmal spielen',
                    onClick: () => {
                        // Replay bleibt im Flow: Schwierigkeits-Dialog überspringen
                        try { sessionStorage.setItem('lp21-replay', '1'); } catch { /* egal */ }
                        location.reload();
                    }
                }),
                DOM.create('a', {
                    class: 'game-btn game-btn-secondary',
                    text: 'Zurück zum Fach',
                    href: `fach.html?fach=${this.fachId}`
                })
            ])
        ];

        const card = DOM.create('div', { class: 'game-feedback-card' }, cardChildren);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => overlay.classList.add('visible'));
        if (sterne === 3) Feedback.celebrate();

        // Level-up animation after overlay appears
        if (xpResult?.leveledUp && typeof Feedback !== 'undefined') {
            setTimeout(() => Feedback.showLevelUp(xpResult.oldLevel, xpResult.newLevel), 800);
        }

        // Update header XP badge
        if (typeof XPSystem !== 'undefined') {
            XPSystem.renderBadge('levelBadgeContainer');
        }
    }

    /** Load game data from JSON */
    static async loadData(fachId, kompetenzId) {
        const paths = [
            `../data/${fachId}/${kompetenzId}.json`,
            `../data/${fachId}/all.json`
        ];

        for (const path of paths) {
            try {
                const resp = await fetch(path);
                if (resp.ok) {
                    const data = await resp.json();
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
