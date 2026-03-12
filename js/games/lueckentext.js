/* LP21 Lernwelt - Lückentext Game Engine */

class LueckentextGame {
    constructor(engine, data) {
        this.engine = engine;
        this.saetze = data.spiel?.saetze || data.saetze || [];
        this.current = 0;
        this.engine.maxScore = this.saetze.length * 10;

        this.engine.initHUD();
        this.engine.updateProgress(0, this.saetze.length);
        this.render();
    }

    render() {
        if (this.current >= this.saetze.length) {
            this.engine.endGame();
            return;
        }

        const satz = this.saetze[this.current];
        const container = this.engine.container;

        const oldContent = container.querySelector('.lueckentext-content');
        if (oldContent) oldContent.remove();

        const content = DOM.create('div', { class: 'lueckentext-content animate-fade-in' });

        content.appendChild(DOM.create('p', {
            class: 'game-instruction',
            text: satz.anweisung || 'Fülle die Lücken aus.'
        }));

        const textContainer = DOM.create('div', { class: 'lueckentext-container' });

        // Parse text: {word} becomes an input
        const text = satz.text;
        const regex = /\{([^}]+)\}/g;
        let lastIdx = 0;
        let match;
        const gaps = [];
        let gapIdx = 0;

        while ((match = regex.exec(text)) !== null) {
            // Text before gap
            if (match.index > lastIdx) {
                textContainer.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
            }

            const answer = match[1];
            const input = DOM.create('input', {
                class: 'lueckentext-gap',
                type: 'text',
                'data-answer': answer.toLowerCase(),
                placeholder: satz.hinweise?.[gapIdx] || '...',
                autocomplete: 'off',
                spellcheck: 'false'
            });
            gaps.push(input);
            textContainer.appendChild(input);
            gapIdx++;
            lastIdx = regex.lastIndex;
        }

        // Remaining text
        if (lastIdx < text.length) {
            textContainer.appendChild(document.createTextNode(text.slice(lastIdx)));
        }

        content.appendChild(textContainer);

        content.appendChild(DOM.create('div', { class: 'game-actions' }, [
            DOM.create('button', {
                class: 'game-btn game-btn-primary',
                text: 'Überprüfen',
                onClick: () => this.check(gaps, content)
            })
        ]));

        const hud = container.querySelector('.game-hud');
        if (hud) hud.after(content);
        else container.appendChild(content);

        if (gaps[0]) gaps[0].focus();
    }

    check(gaps, content) {
        let allCorrect = true;

        for (const input of gaps) {
            const expected = input.dataset.answer;
            const given = input.value.trim().toLowerCase();

            if (given === expected) {
                input.classList.add('correct');
                input.classList.remove('wrong');
            } else {
                input.classList.add('wrong');
                input.classList.remove('correct');
                allCorrect = false;
            }
            input.disabled = true;
        }

        if (allCorrect) {
            this.engine.addScore(10);
            Feedback.toast('Richtig!', 'success');
        } else {
            Feedback.toast('Nicht alle Lücken sind korrekt.', 'error');
        }

        this.current++;
        this.engine.updateProgress(this.current, this.saetze.length);

        setTimeout(() => this.render(), 1800);
    }
}
