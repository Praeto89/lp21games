/* LP21 Lernwelt - Zuordnung Game Engine (Drag & Drop Kategorisierung) */

class ZuordnungGame {
    constructor(engine, data) {
        this.engine = engine;
        this.kategorien = data.spiel?.kategorien || data.kategorien || [];
        this.elemente = ArrayUtils.shuffle(data.spiel?.elemente || data.elemente || []);
        this.placed = 0;
        this.engine.maxScore = this.elemente.length * 10;

        this.engine.initHUD();
        this.engine.updateProgress(0, this.elemente.length);
        this.render();
    }

    render() {
        const container = this.engine.container;
        const hud = container.querySelector('.game-hud');

        const content = DOM.create('div', { class: 'zuordnung-content animate-fade-in' });

        // Instruction
        content.appendChild(DOM.create('p', {
            class: 'game-instruction',
            text: 'Ziehe die Begriffe in die richtige Kategorie.'
        }));

        // Draggable items pool
        const pool = DOM.create('div', { class: 'zuordnung-items', id: 'zuordnungPool' });
        for (const el of this.elemente) {
            const item = DOM.create('div', {
                class: 'zuordnung-draggable',
                text: el.text,
                'data-kategorie': el.kategorie
            });
            DragDrop.makeDraggable(item);
            pool.appendChild(item);
        }
        content.appendChild(pool);

        // Categories
        const catGrid = DOM.create('div', { class: 'zuordnung-categories' });
        for (let i = 0; i < this.kategorien.length; i++) {
            const cat = DOM.create('div', { class: 'zuordnung-category', 'data-cat-index': i });
            cat.appendChild(DOM.create('div', { class: 'zuordnung-category-title', text: this.kategorien[i] }));
            const itemsContainer = DOM.create('div', { class: 'zuordnung-category-items' });
            cat.appendChild(itemsContainer);

            DragDrop.makeDropzone(cat, (draggedEl, dropzone) => {
                this.handleDrop(draggedEl, dropzone);
            });

            catGrid.appendChild(cat);
        }
        content.appendChild(catGrid);

        // Check button
        content.appendChild(DOM.create('div', { class: 'game-actions' }, [
            DOM.create('button', {
                class: 'game-btn game-btn-primary',
                text: 'Überprüfen',
                id: 'checkBtn',
                style: { display: 'none' },
                onClick: () => this.check()
            })
        ]));

        hud.after(content);
    }

    handleDrop(draggedEl, dropzone) {
        const itemsContainer = dropzone.querySelector('.zuordnung-category-items');
        if (itemsContainer && draggedEl.classList.contains('zuordnung-draggable')) {
            itemsContainer.appendChild(draggedEl);
            draggedEl.classList.remove('dragging');

            // Show check button when all placed
            const pool = document.getElementById('zuordnungPool');
            if (pool && pool.children.length === 0) {
                const btn = document.getElementById('checkBtn');
                if (btn) btn.style.display = '';
            }
        }
    }

    check() {
        const categories = DOM.$$('.zuordnung-category');
        let correct = 0;

        categories.forEach(cat => {
            const catIdx = parseInt(cat.dataset.catIndex);
            const items = cat.querySelectorAll('.zuordnung-draggable');
            items.forEach(item => {
                const expected = parseInt(item.dataset.kategorie);
                if (expected === catIdx) {
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
