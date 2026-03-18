/* LP21 Lernwelt - Progress Map (Lernlandkarte) */

const ProgressMap = {
    /** Render a visual map for a Fach into a container.
     *  @param {HTMLElement} container
     *  @param {Object} fach  — fach object from faecher.json
     *  @param {Object} dailyChallenge — optional, marks daily node
     */
    render(container, fach, dailyChallenge) {
        container.innerHTML = '';
        container.className = 'progress-map';

        for (const bereich of fach.bereiche || []) {
            const section = document.createElement('div');
            section.className = 'map-section';

            const title = document.createElement('div');
            title.className = 'map-section-title';
            title.textContent = `${bereich.code} ${bereich.name}`;
            section.appendChild(title);

            const path = document.createElement('div');
            path.className = 'map-path';

            const kompetenzen = bereich.kompetenzen || [];
            kompetenzen.forEach((k, i) => {
                const progress = LP21Storage.getProgress(fach.id, k.id);
                const unlocked = UnlockSystem.isEnabled()
                    ? UnlockSystem.isUnlocked(fach.id, kompetenzen, i)
                    : true;

                const isDaily = dailyChallenge
                    && dailyChallenge.fachId === fach.id
                    && dailyChallenge.kompetenzId === k.id;

                // Connector line (before all but first)
                if (i > 0) {
                    const line = document.createElement('div');
                    line.className = `map-connector${unlocked ? ' map-connector-active' : ''}`;
                    path.appendChild(line);
                }

                // Node
                const node = document.createElement(unlocked ? 'a' : 'div');
                node.className = `map-node map-node-${this._starClass(progress.sterne, unlocked)}${isDaily ? ' map-node-daily' : ''}`;

                if (unlocked) {
                    node.href = `spiel.html?fach=${fach.id}&kompetenz=${k.id}&typ=${k.spieltyp}`;
                    node.title = k.name;
                } else {
                    node.title = `🔒 ${k.name} — erst nach vorheriger Kompetenz freischaltbar`;
                }

                node.innerHTML = `
                    <div class="map-node-inner">
                        <div class="map-node-code">${k.code}</div>
                        <div class="map-node-stars">${this._starsHTML(progress.sterne, unlocked)}</div>
                        ${isDaily ? '<div class="map-node-daily-badge">📅</div>' : ''}
                        ${!unlocked ? '<div class="map-node-lock">🔒</div>' : ''}
                    </div>
                    <div class="map-node-label">${k.name}</div>
                `;

                path.appendChild(node);
            });

            section.appendChild(path);
            container.appendChild(section);
        }
    },

    _starClass(sterne, unlocked) {
        if (!unlocked) return 'locked';
        if (sterne === 3) return 'gold';
        if (sterne === 2) return 'silver';
        if (sterne === 1) return 'bronze';
        return 'open';
    },

    _starsHTML(sterne, unlocked) {
        if (!unlocked) return '';
        let html = '';
        for (let i = 0; i < 3; i++) {
            html += `<span class="${i < sterne ? 'star-filled' : 'star-empty'}">${i < sterne ? '★' : '☆'}</span>`;
        }
        return html;
    }
};
