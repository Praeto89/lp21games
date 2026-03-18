/* LP21 Lernwelt - Sound Manager (Web Audio API, prozedural) */

const SoundManager = {
    _ctx: null,
    _enabled: true,

    _getCtx() {
        if (!this._ctx) {
            try {
                this._ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch { return null; }
        }
        return this._ctx;
    },

    _tone(freq, duration, type = 'sine', gain = 0.3, delay = 0) {
        const ctx = this._getCtx();
        if (!ctx || !this._enabled) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = type;
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(gain, ctx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
    },

    play(sound) {
        if (!this._enabled) return;
        switch (sound) {
            case 'correct':
                this._tone(523, 0.1);       // C5
                this._tone(659, 0.15, 'sine', 0.3, 0.1); // E5
                break;
            case 'wrong':
                this._tone(150, 0.2, 'sawtooth', 0.2);
                break;
            case 'star':
                this._tone(523, 0.08);
                this._tone(659, 0.08, 'sine', 0.3, 0.09);
                this._tone(784, 0.15, 'sine', 0.3, 0.18);
                break;
            case 'levelup':
                [523, 659, 784, 1047].forEach((f, i) =>
                    this._tone(f, 0.15, 'sine', 0.35, i * 0.12));
                break;
            case 'streak':
                this._tone(880, 0.08, 'sine', 0.25);
                this._tone(1108, 0.12, 'sine', 0.25, 0.09);
                break;
            case 'achievement':
                [659, 784, 988, 1319].forEach((f, i) =>
                    this._tone(f, 0.12, 'sine', 0.3, i * 0.1));
                break;
        }
    },

    toggle() {
        this._enabled = !this._enabled;
        try {
            const s = JSON.parse(localStorage.getItem('lp21-settings') || '{}');
            s.soundEnabled = this._enabled;
            localStorage.setItem('lp21-settings', JSON.stringify(s));
        } catch {}
        return this._enabled;
    },

    init() {
        try {
            const s = JSON.parse(localStorage.getItem('lp21-settings') || '{}');
            this._enabled = s.soundEnabled !== false;
        } catch {
            this._enabled = true;
        }
    },

    renderToggle(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        this.init();

        const btn = document.createElement('button');
        btn.id = 'soundToggle';
        btn.className = 'sound-toggle';
        btn.title = 'Sound an/aus';
        btn.textContent = this._enabled ? '🔊' : '🔇';
        btn.onclick = () => {
            const on = this.toggle();
            btn.textContent = on ? '🔊' : '🔇';
            // Resume AudioContext on first user interaction
            if (on && this._ctx && this._ctx.state === 'suspended') {
                this._ctx.resume();
            }
        };
        container.appendChild(btn);
    }
};
