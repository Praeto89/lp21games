/* LP21 Lernwelt - Timeline Game Engine */

class TimelineGame {
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

        const oldContent = container.querySelector('.timeline-content');
        if (oldContent) oldContent.remove();

        const content = DOM.create('div', { class: 'timeline-content animate-fade-in' });
        content.appendChild(DOM.create('p', {
            class: 'game-instruction',
            text: aufgabe.anweisung || 'Ordne die Ereignisse chronologisch.'
        }));

        const korrekt = aufgabe.ereignisse; // Correct order
        const shuffled = ArrayUtils.shuffle([...korrekt]);

        // Sortable list (reuse sortieren pattern)
        const list = DOM.create('div', { class: 'sortieren-list', id: 'timelineList' });
        shuffled.forEach((ereignis, i) => {
            const item = DOM.create('div', {
                class: 'sortieren-item',
                'data-text': ereignis.text
            }, [
                DOM.create('span', { class: 'sortieren-handle', text: '☰' }),
                DOM.create('span', { class: 'sortieren-number', text: String(i + 1) }),
                DOM.create('div', {}, [
                    DOM.create('span', { text: ereignis.text, style: { fontWeight: '600' } }),
                    ...(ereignis.jahr ? [
                        DOM.create('span', {
                            text: ` (${ereignis.jahr})`,
                            style: { color: 'var(--text-light)', fontSize: '0.85rem', display: 'none' },
                            class: 'timeline-year'
                        })
                    ] : [])
                ])
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

        // Enable sorting
        this.enableSorting(list);
    }

    enableSorting(list) {
        [...list.children].forEach(item => {
            item.addEventListener('mousedown', (e) => this.startDrag(e, item, list));
            item.addEventListener('touchstart', (e) => this.startDrag(e, item, list), { passive: false });
        });
    }

    startDrag(e, item, list) {
        e.preventDefault();
        const touch = e.touches?.[0] || e;
        const startY = touch.clientY;
        item.style.zIndex = '10';
        item.style.background = '#e3f2fd';
        const itemHeight = item.getBoundingClientRect().height + 8;

        const moveHandler = (e2) => {
            e2.preventDefault();
            const t = e2.touches?.[0] || e2;
            const diffY = t.clientY - startY;
            item.style.transform = `translateY(${diffY}px)`;

            const siblings = [...list.children];
            const idx = siblings.indexOf(item);
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
            if (text === korrekt[i].text) {
                item.classList.add('correct');
                correct++;
            } else {
                item.classList.add('wrong');
            }
            // Show years
            const yearEl = item.querySelector('.timeline-year');
            if (yearEl) yearEl.style.display = '';
        });

        if (correct === korrekt.length) {
            this.engine.addScore(10);
            Feedback.toast('Perfekte Chronologie!', 'success');
        } else {
            const partial = Math.round((correct / korrekt.length) * 10);
            this.engine.addScore(partial);
            Feedback.toast(`${correct} von ${korrekt.length} richtig.`, correct > 0 ? 'warning' : 'error');
        }

        this.current++;
        this.engine.updateProgress(this.current, this.aufgaben.length);
        setTimeout(() => this.render(), 2000);
    }
}
