/* LP21 Lernwelt - App (Startseite) */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await GameEngine.loadFaecher();
        renderFachGrid(data.faecher);
        updateTotalProgress(data.faecher);

        // Daily Challenge banner
        if (typeof DailyChallenge !== 'undefined') {
            const challenge = DailyChallenge.getToday(data.faecher);
            DailyChallenge.renderBanner('dailyBannerContainer', challenge);
        }
    } catch (err) {
        document.getElementById('fachGrid').innerHTML =
            '<p style="text-align:center;color:#f44336;">Fehler beim Laden der Fächer. Bitte mit einem lokalen Server starten (z.B. VS Code Live Server).</p>';
        console.error(err);
    }
});

function renderFachGrid(faecher) {
    const grid = document.getElementById('fachGrid');
    grid.innerHTML = '';

    for (const fach of faecher) {
        const kompCount = countKompetenzen(fach);
        const pct = LP21Storage.getFachPercent(fach.id, kompCount);

        const card = DOM.create('a', {
            class: 'fach-card',
            href: `pages/fach.html?fach=${fach.id}`,
            style: { '--fach-farbe': fach.farbe }
        }, [
            DOM.create('div', { class: 'fach-card-header' }, [
                DOM.create('div', { class: 'fach-icon', text: fach.icon }),
                DOM.create('div', {}, [
                    DOM.create('div', { class: 'fach-name', text: fach.name }),
                    DOM.create('div', { class: 'fach-kuerzel', text: fach.kuerzel })
                ])
            ]),
            DOM.create('div', { class: 'fach-meta', text: `${kompCount} Kompetenzen` }),
            DOM.create('div', { class: 'fach-progress' }, [
                DOM.create('div', { class: 'progress-bar' }, [
                    DOM.create('div', { class: 'progress-bar-fill', style: { width: pct + '%' } })
                ]),
                DOM.create('div', { class: 'progress-text', text: `${pct}% gemeistert` })
            ])
        ]);

        grid.appendChild(card);
    }
}

function countKompetenzen(fach) {
    let count = 0;
    for (const b of fach.bereiche || []) {
        count += b.kompetenzen?.length || 0;
    }
    return count;
}

function updateTotalProgress(faecher) {
    const pct = LP21Storage.getTotalProgress(faecher);
    const bar = document.getElementById('totalProgress');
    const text = document.getElementById('totalPercent');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = pct + '%';
}
