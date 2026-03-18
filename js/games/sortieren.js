/* LP21 Lernwelt - Sortieren Game Engine (Reihenfolge) */

class SortierenGame {
    constructor(engine, data) {
        this.engine = engine;
        this.aufgaben = data.spiel?.aufgaben || data.aufgaben || [];
        this.current = 0;
        this.engine.maxScore = this.aufgaben.length * 10;

        this.engine.initHUD();
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

        const oldContent = container.querySelector('.sortieren-content');
        if (oldContent) oldContent.remove();

        const content = DOM.create('div', { class: 'sortieren-content animate-fade-in' });
        content.appendChild(DOM.create('p', {
            class: 'game-instruction',
            text: aufgabe.anweisung || 'Bringe die Elemente in die richtige Reihenfolge.'
        }));

        // Shuffle elements
        const korrekt = aufgabe.elemente; // Original order is correct
        const shuffled = ArrayUtils.shuffle([...korrekt]);

        const list = DOM.create('div', { class: 'sortieren-list', id: 'sortierenList' });
        shuffled.forEach((text, i) => {
            const item = DOM.create('div', {
                class: 'sortieren-item',
                'data-text': text
            }, [
                DOM.create('span', { class: 'sortieren-handle', text: '☰' }),
                DOM.create('span', { class: 'sortieren-number', text: String(i + 1) }),
                DOM.create('span', { text: text })
            ]);
            list.appendChild(item);
        });

        content.appendChild(list);

        content.appendChild(DOM.create('div', { class: 'game-actions' }, [
            DOM.create('button', {
                class: 'game-btn game-btn-primary',
                text: 'Überprüfen',
                onClick: () => this.check(list, korrekt)
            })
        ]));

        const hud = container.querySelector('.game-hud');
        if (hud) hud.after(content);
        else container.appendChild(content);

        // Enable sortable
        this.enableSorting(list);
    }

    enableSorting(list) {
        const items = [...list.children];
        items.forEach(item => {
            item.addEventListener('mousedown', (e) => this.startDrag(e, item, list));
            item.addEventListener('touchstart', (e) => this.startDrag(e, item, list), { passive: false });
        });
    }

    startDrag(e, item, list) {
        e.preventDefault();
        const touch = e.touches?.[0] || e;
        const startY = touch.clientY;
        const startRect = item.getBoundingClientRect();
        item.style.zIndex = '10';
        item.style.background = '#e3f2fd';

        const moveHandler = (e2) => {
            e2.preventDefault();
            const t = e2.touches?.[0] || e2;
            const diffY = t.clientY - startY;
            item.style.transform = `translateY(${diffY}px)`;

            // Find element to swap with
            const siblings = [...list.children];
            const idx = siblings.indexOf(item);
            const itemHeight = startRect.height + 8;

            if (diffY > itemHeight * 0.6 && idx < siblings.length - 1) {
                list.insertBefore(siblings[idx + 1], item);
                this.updateNumbers(list);
            } else if (diffY < -itemHeight * 0.6 && idx > 0) {
                list.insertBefore(item, siblings[idx - 1]);
                this.updateNumbers(list);
            }
        };

        const endHandler = () => {
            item.style.transform = '';
            item.style.zIndex = '';
            item.style.background = '';
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', endHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', endHandler);
            this.updateNumbers(list);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
    }

    updateNumbers(list) {
        [...list.children].forEach((item, i) => {
            const num = item.querySelector('.sortieren-number');
            if (num) num.textContent = String(i + 1);
        });
    }

    check(list, korrekt) {
        const items = [...list.children];
        let correct = 0;

        items.forEach((item, i) => {
            const text = item.dataset.text;
            if (text === korrekt[i]) {
                item.classList.add('correct');
                correct++;
            } else {
                item.classList.add('wrong');
            }
        });

        if (correct === korrekt.length) {
            this.engine.addScore(10);
            Feedback.toast('Perfekte Reihenfolge!', 'success');
        } else {
            const partial = Math.round((correct / korrekt.length) * 10);
            this.engine.addScore(partial);
            this.engine.recordWrong();
            Feedback.toast(`${correct} von ${korrekt.length} richtig.`, correct > 0 ? 'warning' : 'error');
        }

        this.current++;
        this.engine.updateProgress(this.current, this.aufgaben.length);
        setTimeout(() => this.render(), 2000);
    }
}
