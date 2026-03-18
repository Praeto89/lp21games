/* LP21 Lernwelt - Rechnen Game Engine */

class RechnenGame {
    constructor(engine, data) {
        this.engine = engine;
        this.aufgaben = ArrayUtils.shuffle(data.spiel?.aufgaben || data.aufgaben || []);
        this.current = 0;
        this.engine.maxScore = this.aufgaben.length * 10;

        this.engine.initHUD({ timer: data.spiel?.zeit || 120 });
        this.engine.updateProgress(0, this.aufgaben.length);
        this.render();
    }

    render() {
        if (this.current >= this.aufgaben.length) {
            this.engine.endGame();
            return;
        }

        const aufgabe = this.aufgaben[this.current];
        const container = this.engine.container;

        const oldContent = container.querySelector('.rechnen-content');
        if (oldContent) oldContent.remove();

        const content = DOM.create('div', { class: 'rechnen-content animate-fade-in' });

        const display = DOM.create('div', { class: 'rechnen-display' });
        display.appendChild(DOM.create('div', { class: 'rechnen-aufgabe', text: aufgabe.aufgabe }));

        const input = DOM.create('input', {
            class: 'rechnen-input',
            type: 'text',
            inputmode: 'decimal',
            autocomplete: 'off',
            placeholder: '?'
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.check(input, aufgabe);
        });

        display.appendChild(input);
        content.appendChild(display);

        // Numpad for mobile
        const numpad = DOM.create('div', { class: 'rechnen-numpad' });
        const keys = ['7','8','9','4','5','6','1','2','3','.','-','0'];
        for (const key of keys) {
            numpad.appendChild(DOM.create('button', {
                text: key,
                onClick: () => { input.value += key; input.focus(); }
            }));
        }
        // Backspace and Enter
        numpad.appendChild(DOM.create('button', {
            text: '⌫',
            onClick: () => { input.value = input.value.slice(0, -1); input.focus(); }
        }));
        numpad.appendChild(DOM.create('button', {
            text: '=',
            style: { background: 'var(--fach-farbe)', color: 'white', gridColumn: 'span 2' },
            onClick: () => this.check(input, aufgabe)
        }));

        content.appendChild(numpad);

        if (aufgabe.hinweis) {
            content.appendChild(DOM.create('p', {
                class: 'game-instruction',
                text: aufgabe.hinweis,
                style: { marginTop: '1rem', fontSize: '0.85rem' }
            }));
        }

        const hud = container.querySelector('.game-hud');
        if (hud) hud.after(content);
        else container.appendChild(content);

        input.focus();
    }

    check(input, aufgabe) {
        const given = parseFloat(input.value.replace(',', '.'));
        const expected = parseFloat(aufgabe.loesung);

        if (Math.abs(given - expected) < 0.01) {
            input.classList.add('correct');
            this.engine.addScore(10);
            Feedback.toast('Richtig!', 'success');
        } else {
            input.classList.add('wrong');
            this.engine.recordWrong();
            Feedback.toast(`Falsch. Lösung: ${aufgabe.loesung}`, 'error');
        }

        input.disabled = true;
        this.current++;
        this.engine.updateProgress(this.current, this.aufgaben.length);
        setTimeout(() => this.render(), 1200);
    }
}
