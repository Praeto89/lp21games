/* LP21 Lernwelt - Memory Game Engine */

class MemoryGame {
    constructor(engine, data) {
        this.engine = engine;
        this.paare = ArrayUtils.shuffle(data.spiel?.paare || data.paare || []).slice(0, 8);
        this.engine.maxScore = this.paare.length * 10;
        this.flipped = [];
        this.matched = 0;
        this.locked = false;
        this.missesSinceMatch = 0;

        this.engine.initHUD();
        this.engine.updateProgress(0, this.paare.length);
        this.render();
    }

    render() {
        const container = this.engine.container;
        const hud = container.querySelector('.game-hud');

        const content = DOM.create('div', { class: 'memory-content animate-fade-in' });
        content.appendChild(DOM.create('p', {
            class: 'game-instruction',
            text: 'Finde die zusammengehörenden Paare.'
        }));

        // Build card pairs: each pair creates 2 cards
        const cards = [];
        for (let i = 0; i < this.paare.length; i++) {
            cards.push({ text: this.paare[i].a, pairId: i, side: 'a' });
            cards.push({ text: this.paare[i].b, pairId: i, side: 'b' });
        }
        const shuffled = ArrayUtils.shuffle(cards);

        // Determine grid columns based on count
        const cols = shuffled.length <= 12 ? 4 : 4;
        const grid = DOM.create('div', {
            class: 'memory-grid',
            style: { gridTemplateColumns: `repeat(${cols}, 1fr)` }
        });

        for (const card of shuffled) {
            const cardEl = DOM.create('div', {
                class: 'memory-card',
                'data-pair': card.pairId,
                'data-side': card.side,
                onClick: () => this.flipCard(cardEl)
            }, [
                DOM.create('div', { class: 'memory-card-inner' }, [
                    DOM.create('div', { class: 'memory-card-front', text: '?' }),
                    DOM.create('div', { class: 'memory-card-back', text: card.text })
                ])
            ]);
            grid.appendChild(cardEl);
        }

        content.appendChild(grid);
        hud.after(content);
    }

    flipCard(cardEl) {
        if (this.locked) return;
        if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

        cardEl.classList.add('flipped');
        this.flipped.push(cardEl);

        if (this.flipped.length === 2) {
            this.locked = true;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flipped;
        const pair1 = card1.dataset.pair;
        const pair2 = card2.dataset.pair;
        const side1 = card1.dataset.side;
        const side2 = card2.dataset.side;

        if (pair1 === pair2 && side1 !== side2) {
            // Match!
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matched++;
            // Gutes Gedächtnis gibt volle Punkte: Fehlversuche seit dem
            // letzten Treffer reduzieren die Punkte des Paars (min. 6)
            this.engine.addScore(Math.max(10 - this.missesSinceMatch, 6));
            this.missesSinceMatch = 0;
            this.engine.updateProgress(this.matched, this.paare.length);
            Feedback.toast('Paar gefunden!', 'success');

            this.flipped = [];
            this.locked = false;

            if (this.matched === this.paare.length) {
                setTimeout(() => this.engine.endGame(), 800);
            }
        } else {
            // No match
            this.missesSinceMatch++;
            this.engine.recordWrong();
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.flipped = [];
                this.locked = false;
            }, 800);
        }
    }
}
