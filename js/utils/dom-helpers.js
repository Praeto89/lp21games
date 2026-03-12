/* LP21 Lernwelt - DOM Helpers & Touch-compatible Drag and Drop */

const DOM = {
    /** Kurzform für querySelector */
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /** Kurzform für querySelectorAll */
    $$(selector, parent = document) {
        return [...parent.querySelectorAll(selector)];
    },

    /** Element erstellen mit Attributen und Kindern */
    create(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        for (const [key, val] of Object.entries(attrs)) {
            if (key === 'class') el.className = val;
            else if (key === 'text') el.textContent = val;
            else if (key === 'html') el.innerHTML = val;
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
            else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
            else el.setAttribute(key, val);
        }
        for (const child of children) {
            if (typeof child === 'string') el.appendChild(document.createTextNode(child));
            else if (child) el.appendChild(child);
        }
        return el;
    },

    /** URL-Parameter lesen */
    getParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }
};

/* === Touch-compatible Drag & Drop System === */
const DragDrop = {
    _draggedEl: null,
    _draggedClone: null,
    _offsetX: 0,
    _offsetY: 0,
    _onDropCallback: null,

    /** Macht ein Element draggable (Mouse + Touch) */
    makeDraggable(el, onDragStart) {
        el.addEventListener('mousedown', (e) => this._startDrag(e, el, onDragStart));
        el.addEventListener('touchstart', (e) => this._startDrag(e, el, onDragStart), { passive: false });
    },

    /** Registriert ein Drop-Ziel */
    makeDropzone(el, onDrop) {
        el.dataset.dropzone = 'true';
        el._onDrop = onDrop;

        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.classList.add('drag-over');
        });
        el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-over');
            if (this._draggedEl && onDrop) onDrop(this._draggedEl, el);
        });
    },

    _startDrag(e, el, onDragStart) {
        e.preventDefault();
        const touch = e.touches?.[0] || e;

        this._draggedEl = el;
        el.classList.add('dragging');

        if (onDragStart) onDragStart(el);

        const rect = el.getBoundingClientRect();
        this._offsetX = touch.clientX - rect.left;
        this._offsetY = touch.clientY - rect.top;

        // Clone for visual feedback
        this._draggedClone = el.cloneNode(true);
        this._draggedClone.style.cssText = `
            position: fixed; z-index: 1000; pointer-events: none;
            width: ${rect.width}px; opacity: 0.85;
            left: ${rect.left}px; top: ${rect.top}px;
            transition: none; transform: rotate(2deg);
        `;
        document.body.appendChild(this._draggedClone);

        const moveHandler = (e2) => this._onMove(e2);
        const endHandler = (e2) => {
            this._onEnd(e2);
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', endHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', endHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
    },

    _onMove(e) {
        e.preventDefault();
        const touch = e.touches?.[0] || e;
        if (this._draggedClone) {
            this._draggedClone.style.left = (touch.clientX - this._offsetX) + 'px';
            this._draggedClone.style.top = (touch.clientY - this._offsetY) + 'px';
        }

        // Highlight dropzones
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        document.querySelectorAll('[data-dropzone]').forEach(dz => {
            dz.classList.toggle('drag-over', dz === target || dz.contains(target));
        });
    },

    _onEnd(e) {
        const touch = e.changedTouches?.[0] || e;
        if (this._draggedClone) {
            this._draggedClone.remove();
            this._draggedClone = null;
        }

        if (this._draggedEl) {
            this._draggedEl.classList.remove('dragging');

            // Find dropzone under cursor
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropzone = target?.closest('[data-dropzone]');
            if (dropzone && dropzone._onDrop) {
                dropzone._onDrop(this._draggedEl, dropzone);
            }

            document.querySelectorAll('[data-dropzone]').forEach(dz => dz.classList.remove('drag-over'));
            this._draggedEl = null;
        }
    }
};

/* === Sortable List (for Sortieren game) === */
const SortableList = {
    make(container, onReorder) {
        const items = [...container.children];
        items.forEach(item => {
            DragDrop.makeDraggable(item, () => {});

            // Override: use simpler reorder logic for lists
            item.addEventListener('mousedown', (e) => this._startSort(e, item, container, onReorder));
            item.addEventListener('touchstart', (e) => this._startSort(e, item, container, onReorder), { passive: false });
        });
    },

    _startSort(e, item, container, onReorder) {
        e.stopPropagation();
        const touch = e.touches?.[0] || e;
        const startY = touch.clientY;
        const itemHeight = item.offsetHeight + 8; // gap
        let moved = false;

        const moveHandler = (e2) => {
            e2.preventDefault();
            const t = e2.touches?.[0] || e2;
            const diff = t.clientY - startY;
            item.style.transform = `translateY(${diff}px)`;
            item.style.zIndex = '10';
            item.style.opacity = '0.8';
            moved = true;

            // Swap if moved enough
            const items = [...container.children];
            const idx = items.indexOf(item);
            if (diff > itemHeight && idx < items.length - 1) {
                container.insertBefore(items[idx + 1], item);
                if (onReorder) onReorder();
            } else if (diff < -itemHeight && idx > 0) {
                container.insertBefore(item, items[idx - 1]);
                if (onReorder) onReorder();
            }
        };

        const endHandler = () => {
            item.style.transform = '';
            item.style.zIndex = '';
            item.style.opacity = '';
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', endHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', endHandler);
            if (moved && onReorder) onReorder();
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
    }
};
