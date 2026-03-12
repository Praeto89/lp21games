/* LP21 Lernwelt - Coding Puzzle Game Engine (Block-Programmierung) */

class CodingPuzzleGame {
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

        const oldContent = container.querySelector('.coding-content');
        if (oldContent) oldContent.remove();

        const content = DOM.create('div', { class: 'coding-content animate-fade-in' });
        content.appendChild(DOM.create('p', {
            class: 'game-instruction',
            text: aufgabe.anweisung || 'Bringe die Code-Blöcke in die richtige Reihenfolge.'
        }));

        // This is a simplified version: order blocks correctly
        const korrekt = aufgabe.bloecke; // Correct order
        const shuffled = ArrayUtils.shuffle([...korrekt]);

        // Available blocks
        const blocksContainer = DOM.create('div', { class: 'coding-blocks-available' });
        DOM.create('div', {
            class: 'coding-program-title',
            text: 'Verfügbare Blöcke:'
        });

        const program = DOM.create('div', { class: 'coding-program', id: 'codingProgram' });
        program.appendChild(DOM.create('div', { class: 'coding-program-title', text: 'Dein Programm (ziehe Blöcke hierher):' }));

        shuffled.forEach((block, i) => {
            const blockType = block.typ || 'move';
            const blockEl = DOM.create('div', {
                class: `coding-block ${blockType}`,
                text: block.text,
                'data-text': block.text,
                'data-original-index': String(korrekt.indexOf(block))
            });
            DragDrop.makeDraggable(blockEl);
            blocksContainer.appendChild(blockEl);
        });

        DragDrop.makeDropzone(program, (draggedEl, dropzone) => {
            if (draggedEl.classList.contains('coding-block')) {
                dropzone.appendChild(draggedEl);
            }
        });

        // Also make blocksContainer a dropzone to allow moving back
        DragDrop.makeDropzone(blocksContainer, (draggedEl, dropzone) => {
            if (draggedEl.classList.contains('coding-block')) {
                dropzone.appendChild(draggedEl);
            }
        });

        content.appendChild(blocksContainer);
        content.appendChild(program);

        content.appendChild(DOM.create('div', { class: 'game-actions' }, [
            DOM.create('button', {
                class: 'game-btn game-btn-secondary',
                text: 'Ausführen ▶',
                onClick: () => this.runProgram(program, korrekt)
            }),
            DOM.create('button', {
                class: 'game-btn game-btn-primary',
                text: 'Überprüfen',
                onClick: () => this.check(program, korrekt)
            })
        ]));

        const hud = container.querySelector('.game-hud');
        if (hud) hud.after(content);
        else container.appendChild(content);
    }

    runProgram(program, korrekt) {
        // Visual feedback: highlight blocks sequentially
        const blocks = program.querySelectorAll('.coding-block');
        blocks.forEach((block, i) => {
            setTimeout(() => {
                block.style.outline = '3px solid #ffc107';
                block.classList.add('animate-pop');
                setTimeout(() => {
                    block.style.outline = '';
                    block.classList.remove('animate-pop');
                }, 500);
            }, i * 600);
        });

        // After animation, show result
        setTimeout(() => {
            const userOrder = [...blocks].map(b => b.dataset.text);
            const correctOrder = korrekt.map(b => b.text);
            const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);

            if (isCorrect) {
                Feedback.toast('Programm korrekt!', 'success');
            } else {
                Feedback.toast('Das Programm hat noch Fehler.', 'warning');
            }
        }, blocks.length * 600 + 200);
    }

    check(program, korrekt) {
        const blocks = program.querySelectorAll('.coding-block');
        const userOrder = [...blocks].map(b => b.dataset.text);
        const correctOrder = korrekt.map(b => b.text);

        let correct = 0;
        blocks.forEach((block, i) => {
            if (userOrder[i] === correctOrder[i]) {
                block.style.borderColor = '#4caf50';
                block.style.background = '#e8f5e9';
                correct++;
            } else {
                block.style.borderColor = '#f44336';
                block.style.background = '#ffebee';
            }
        });

        if (correct === correctOrder.length && blocks.length === correctOrder.length) {
            this.engine.addScore(10);
            Feedback.toast('Perfekt!', 'success');
        } else {
            const partial = Math.round((correct / correctOrder.length) * 10);
            this.engine.addScore(partial);
            Feedback.toast(`${correct} von ${correctOrder.length} Blöcke richtig.`, correct > 0 ? 'warning' : 'error');
        }

        this.current++;
        this.engine.updateProgress(this.current, this.aufgaben.length);
        setTimeout(() => this.render(), 2000);
    }
}
