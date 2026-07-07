/* LP21 Lernwelt - Quiz Game Engine (Multiple Choice) */

class QuizGame {
    constructor(engine, data) {
        this.engine = engine;
        this.fragen = ArrayUtils.shuffle(data.spiel?.fragen || data.fragen || []);
        this.current = 0;
        // Ab 3 Fragen zählt die letzte Frage doppelt (Finalfrage)
        this.hasFinale = this.fragen.length >= 3;
        this.engine.maxScore = this.hasFinale
            ? (this.fragen.length - 1) * 10 + 20
            : this.fragen.length * 10;

        this.engine.initHUD();
        this.engine.updateProgress(0, this.fragen.length);
        this.render();
    }

    render() {
        if (this.current >= this.fragen.length) {
            this.engine.endGame();
            return;
        }

        const frage = this.fragen[this.current];
        const container = this.engine.container.querySelector('.game-container') || this.engine.container;

        // Remove old game content but keep HUD
        const oldContent = container.querySelector('.quiz-content');
        if (oldContent) oldContent.remove();

        const content = DOM.create('div', { class: 'quiz-content animate-fade-in' });

        if (this._isFinale()) {
            content.appendChild(DOM.create('div', {
                class: 'quiz-final-banner',
                text: '🏁 Finalfrage — doppelte Punkte!'
            }));
        }

        const questionEl = DOM.create('div', { class: 'quiz-question', text: frage.frage });
        content.appendChild(questionEl);

        const optionsEl = DOM.create('div', { class: 'quiz-options' });
        const shuffledOptions = frage.optionen.map((text, i) => ({ text, originalIdx: i }));
        if (!frage.keepOrder) ArrayUtils.shuffle(shuffledOptions).forEach((o, i) => shuffledOptions[i] = o);

        for (const opt of shuffledOptions) {
            const btn = DOM.create('button', {
                class: 'quiz-option',
                text: opt.text,
                onClick: () => this.answer(btn, opt.originalIdx, frage, optionsEl, content)
            });
            optionsEl.appendChild(btn);
        }

        content.appendChild(optionsEl);

        if (frage.erklaerung) {
            content.appendChild(DOM.create('div', {
                class: 'quiz-explanation',
                text: frage.erklaerung
            }));
        }

        // Insert after HUD
        const hud = this.engine.container.querySelector('.game-hud');
        if (hud) hud.after(content);
        else this.engine.container.appendChild(content);
    }

    _isFinale() {
        return this.hasFinale && this.current === this.fragen.length - 1;
    }

    answer(btn, selectedIdx, frage, optionsEl, content) {
        const buttons = optionsEl.querySelectorAll('.quiz-option');
        buttons.forEach(b => b.classList.add('disabled'));

        if (selectedIdx === frage.korrekt) {
            btn.classList.add('correct');
            this.engine.addScore(this._isFinale() ? 20 : 10);
            Feedback.toast('Richtig!', 'success');
        } else {
            btn.classList.add('wrong');
            // Highlight correct answer
            const correctText = frage.optionen[frage.korrekt];
            buttons.forEach(b => {
                if (b.textContent === correctText) b.classList.add('correct');
            });
            this.engine.recordWrong();
            Feedback.toast('Leider falsch.', 'error');
        }

        const expl = content.querySelector('.quiz-explanation');
        if (expl) expl.classList.add('visible');

        this.current++;
        this.engine.updateProgress(this.current, this.fragen.length);

        setTimeout(() => this.render(), 1500);
    }
}
