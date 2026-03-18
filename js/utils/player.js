/* LP21 Lernwelt - Player Name & Welcome */

const Player = {
    /** Show name in header greeting element */
    renderGreeting(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const name = LP21Storage.getName();
        if (!name) return;

        const el = document.createElement('span');
        el.className = 'player-greeting';
        el.title = 'Namen ändern';
        el.textContent = `Hallo, ${name}!`;
        el.addEventListener('click', () => this.showNameModal(false));
        container.appendChild(el);
    },

    /** Show name input modal. firstVisit=true skips cancel option. */
    showNameModal(firstVisit = true) {
        const existing = document.querySelector('.name-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'name-modal-overlay';
        const currentName = LP21Storage.getName();

        overlay.innerHTML = `
            <div class="name-modal-card">
                <div class="name-modal-icon">🎓</div>
                <div class="name-modal-title">${firstVisit ? 'Willkommen!' : 'Namen ändern'}</div>
                <div class="name-modal-sub">${firstVisit
                    ? 'Wie heisst du? Dein Name wird lokal gespeichert.'
                    : 'Gib deinen Namen ein.'}</div>
                <input class="name-modal-input" type="text" placeholder="Dein Name..."
                    maxlength="30" value="${currentName}" autocomplete="off" />
                <button class="name-modal-btn">Los geht's!</button>
                ${!firstVisit ? '<button class="name-modal-skip" style="background:none;border:none;cursor:pointer;color:#999;margin-top:0.5rem;display:block;width:100%;font-size:0.85rem;">Abbrechen</button>' : ''}
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visible'));

        const input = overlay.querySelector('.name-modal-input');
        const btn = overlay.querySelector('.name-modal-btn');
        const skip = overlay.querySelector('.name-modal-skip');

        input.focus();
        input.select();

        const save = () => {
            const name = input.value.trim();
            if (!name) { input.focus(); return; }
            LP21Storage.setName(name);
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                // Update all greeting elements on page
                document.querySelectorAll('.player-greeting').forEach(el => {
                    el.textContent = `Hallo, ${name}!`;
                });
                // Render fresh if container was empty
                const container = document.getElementById('playerNameContainer');
                if (container && !container.querySelector('.player-greeting')) {
                    Player.renderGreeting('playerNameContainer');
                }
            }, 300);
        };

        btn.addEventListener('click', save);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
        if (skip) skip.addEventListener('click', () => {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 300);
        });
    },

    /** Init: show modal on first visit, otherwise render greeting */
    init(containerId) {
        const name = LP21Storage.getName();
        if (!name) {
            // Small delay so page renders first
            setTimeout(() => this.showNameModal(true), 600);
        } else {
            this.renderGreeting(containerId);
        }
    }
};
