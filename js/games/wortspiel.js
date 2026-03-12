/* LP21 Lernwelt - Wortspiel Game Engine (Buchstabensalat / Anagramm) */

class WortspielGame {
    constructor(engine, data) {
        this.engine = engine;
        this.woerter = ArrayUtils.shuffle(data.spiel?.woerter || data.woerter || []);
        this.current = 0;
        this.selectedLetters = [];
        this.engine.maxScore = this.woerter.length * 10;

        this.engine.initHUD();
        this.engine.updateProgress(0, this.woerter.length);
        this.render();
    }

    render() {
        if (this.current >= this.woerter.length) {
            this.engine.endGame();
            return;
        }

        const wort = this.woerter[this.current];
        const answer = wort.wort.toUpperCase();
        const shuffledLetters = ArrayUtils.shuffle(answer.split(''));
        this.selectedLetters = [];

        const container = this.engine.container;
        const oldContent = container.querySelector('.wortspiel-content');
        if (oldContent) oldContent.remove();

        const content = DOM.create('div', { class: 'wortspiel-content animate-fade-in' });

        if (wort.hinweis) {
            content.appendChild(DOM.create('p', {
                class: 'game-instruction',
                text: `Hinweis: ${wort.hinweis}`
            }));
        }

        // Answer slots
        const answerRow = DOM.create('div', { class: 'wortspiel-answer', id: 'wortAnswer' });
        for (let i = 0; i < answer.length; i++) {
            answerRow.appendChild(DOM.create('div', {
                class: 'wortspiel-slot',
                'data-index': i
            }));
        }
        content.appendChild(answerRow);

        // Letter buttons
        const lettersRow = DOM.create('div', { class: 'wortspiel-letters', id: 'wortLetters' });
        shuffledLetters.forEach((letter, i) => {
            const btn = DOM.create('div', {
                class: 'wortspiel-letter',
                text: letter,
                'data-letter-index': i,
                onClick: () => this.selectLetter(btn, letter, answer)
            });
            lettersRow.appendChild(btn);
        });
        content.appendChild(lettersRow);

        // Undo button
        content.appendChild(DOM.create('div', { class: 'game-actions' }, [
            DOM.create('button', {
                class: 'game-btn game-btn-secondary',
                text: 'Rückgängig',
                onClick: () => this.undoLetter()
            })
        ]));

        const hud = container.querySelector('.game-hud');
        if (hud) hud.after(content);
        else container.appendChild(content);
    }

    selectLetter(btn, letter, answer) {
        if (btn.classList.contains('used')) return;

        btn.classList.add('used');
        this.selectedLetters.push({ btn, letter });

        // Fill next empty slot
        const slots = DOM.$$('.wortspiel-slot');
        const idx = this.selectedLetters.length - 1;
        if (slots[idx]) {
            slots[idx].textContent = letter;
            slots[idx].classList.add('animate-pop');
        }

        // Check if complete
        if (this.selectedLetters.length === answer.length) {
            const guess = this.selectedLetters.map(s => s.letter).join('');
            if (guess === answer) {
                this.engine.addScore(10);
                Feedback.toast('Richtig!', 'success');
                slots.forEach(s => s.style.borderColor = '#4caf50');
            } else {
                Feedback.toast(`Falsch. Das Wort war: ${answer}`, 'error');
                slots.forEach(s => s.style.borderColor = '#f44336');
            }

            this.current++;
            this.engine.updateProgress(this.current, this.woerter.length);
            setTimeout(() => this.render(), 1500);
        }
    }

    undoLetter() {
        if (this.selectedLetters.length === 0) return;
        const last = this.selectedLetters.pop();
        last.btn.classList.remove('used');

        const slots = DOM.$$('.wortspiel-slot');
        const idx = this.selectedLetters.length;
        if (slots[idx]) slots[idx].textContent = '';
    }
}
