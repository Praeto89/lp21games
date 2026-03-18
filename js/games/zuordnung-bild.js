/* LP21 Lernwelt - Bild-Zuordnung Game Engine */

class BildZuordnungGame {
    constructor(engine, data) {
        this.engine = engine;
        this.kategorien = data.spiel?.kategorien || data.kategorien || [];
        this.elemente = ArrayUtils.shuffle(data.spiel?.elemente || data.elemente || []);
        this.engine.maxScore = this.elemente.length * 10;

        this.engine.initHUD();
        this.engine.updateProgress(0, this.elemente.length);
        this.render();
    }

    render() {
        const container = this.engine.container;
        const hud = container.querySelector('.game-hud');

        const content = DOM.create('div', { class: 'zuordnung-content animate-fade-in' });
        content.appendChild(DOM.create('p', {
            class: 'game-instruction',
            text: 'Ziehe die Bilder in die richtige Kategorie.'
        }));

        // Image items pool
        const pool = DOM.create('div', { class: 'zuordnung-items', id: 'bildPool' });
        for (const el of this.elemente) {
            const item = DOM.create('div', {
                class: 'zuordnung-draggable',
                'data-kategorie': el.kategorie
            }, [
                DOM.create('div', {
                    class: 'bild-zuordnung-img',
                    text: el.emoji || el.bild || '🖼️',
                    style: { width: '60px', height: '60px', fontSize: '2rem', margin: '0 auto 0.25rem' }
                }),
                DOM.create('span', { text: el.text, style: { fontSize: '0.8rem' } })
            ]);
            DragDrop.makeDraggable(item);
            pool.appendChild(item);
        }
        content.appendChild(pool);

        // Categories
        const catGrid = DOM.create('div', { class: 'zuordnung-categories' });
        for (let i = 0; i < this.kategorien.length; i++) {
            const cat = DOM.create('div', { class: 'zuordnung-category', 'data-cat-index': i });
            cat.appendChild(DOM.create('div', { class: 'zuordnung-category-title', text: this.kategorien[i] }));
            cat.appendChild(DOM.create('div', { class: 'zuordnung-category-items' }));

            DragDrop.makeDropzone(cat, (draggedEl, dropzone) => {
                const itemsContainer = dropzone.querySelector('.zuordnung-category-items');
                if (itemsContainer) itemsContainer.appendChild(draggedEl);

                const pool = document.getElementById('bildPool');
                if (pool && pool.children.length === 0) {
                    document.getElementById('bildCheckBtn').style.display = '';
                }
            });

            catGrid.appendChild(cat);
        }
        content.appendChild(catGrid);

        content.appendChild(DOM.create('div', { class: 'game-actions' }, [
            DOM.create('button', {
                class: 'game-btn game-btn-primary',
                text: 'Überprüfen',
                id: 'bildCheckBtn',
                style: { display: 'none' },
                onClick: () => this.check()
            })
        ]));

        hud.after(content);
    }

    check() {
        const categories = DOM.$$('.zuordnung-category');
        let correct = 0;

        categories.forEach(cat => {
            const catIdx = parseInt(cat.dataset.catIndex);
            cat.querySelectorAll('.zuordnung-draggable').forEach(item => {
                if (parseInt(item.dataset.kategorie) === catIdx) {
                    item.classList.add('placed');
                    correct++;
                    this.engine.addScore(10);
                } else {
                    item.classList.add('wrong-place');
                }
            });
        });

        if (correct < this.elemente.length) this.engine.recordWrong();
        this.engine.updateProgress(correct, this.elemente.length);
        setTimeout(() => this.engine.endGame(), 1500);
    }
}
